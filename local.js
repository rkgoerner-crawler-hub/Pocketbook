/* Pocketbook — on-device storage.
   Everything is kept in this browser on this device (IndexedDB, with localStorage as a fallback).
   Nothing is sent over the network. The app talks to this file through the same small
   interface it would use for a hosted database, so the rest of the code is unchanged. */
(function () {
'use strict';
const DB_NAME = 'household-budget', STORE = 'docs', LS_KEY = 'hb-docs-v1', LAST_BACKUP = 'hb-last-backup';
let docs = {}, mode = 'idb', idbP = null;
const subs = [];
const clone = v => JSON.parse(JSON.stringify(v));

function openIdb() {
  if (idbP) return idbP;
  idbP = new Promise((res, rej) => {
    let r;
    try { r = indexedDB.open(DB_NAME, 1); } catch (e) { rej(e); return; }
    r.onupgradeneeded = () => { r.result.createObjectStore(STORE); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error || new Error('storage error'));
    r.onblocked = () => rej(new Error('storage blocked'));
  });
  return idbP;
}
function inTx(kind, work) {
  return openIdb().then(d => new Promise((res, rej) => {
    const t = d.transaction(STORE, kind);
    work(t.objectStore(STORE));
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error || new Error('storage error'));
    t.onabort = () => rej(t.error || new Error('storage error'));
  }));
}
async function loadAll() {
  try {
    const out = {};
    await inTx('readonly', s => {
      const c = s.openCursor();
      c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } };
    });
    docs = out; mode = 'idb'; return;
  } catch (e) { console.warn('IndexedDB unavailable, trying localStorage', e); }
  try {
    const s = localStorage.getItem(LS_KEY);
    localStorage.setItem('hb-probe', '1'); localStorage.removeItem('hb-probe');
    docs = s ? JSON.parse(s) : {}; mode = 'ls'; return;
  } catch (e) { console.warn('localStorage unavailable', e); }
  docs = {}; mode = 'none';
}
async function persist(path) {
  if (mode === 'idb') return inTx('readwrite', s => { if (path in docs) s.put(docs[path], path); else s.delete(path); });
  if (mode === 'ls') { localStorage.setItem(LS_KEY, JSON.stringify(docs)); return; }
  throw new Error('This browser is not letting the page save.');
}
async function persistAll() {
  if (mode === 'idb') return inTx('readwrite', s => { s.clear(); Object.keys(docs).forEach(k => s.put(docs[k], k)); });
  if (mode === 'ls') { localStorage.setItem(LS_KEY, JSON.stringify(docs)); return; }
  throw new Error('This browser is not letting the page save.');
}
let askedPersist = false;
function askToKeep() {
  if (askedPersist) return; askedPersist = true;
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) {}
}

function snap(col) {
  const pre = col + '/';
  return { docs: Object.keys(docs).filter(k => k.indexOf(pre) === 0 && k.indexOf('/', pre.length) < 0).sort().map(k => ({ id: k.slice(pre.length), exists: true, data: () => clone(docs[k]) })) };
}
function emit() { subs.forEach(s => { try { s.next(snap(s.col)); } catch (e) { console.error(e); } }); }

const ready = loadAll();
const db = {
  doc(path) {
    return {
      id: path.split('/').pop(), path: path,
      async get() { return { id: path.split('/').pop(), exists: path in docs, data: () => (path in docs ? clone(docs[path]) : undefined) }; },
      async set(data) { docs[path] = clone(data); await persist(path); askToKeep(); emit(); },
      async delete() { delete docs[path]; await persist(path); emit(); }
    };
  },
  collection(col) {
    return {
      path: col,
      doc: id => db.doc(col + '/' + id),
      onSnapshot(next) {
        const s = { col: col, next: next }; subs.push(s);
        ready.then(() => { try { next(snap(col)); } catch (e) { console.error(e); } });
        return () => { const i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); };
      }
    };
  }
};

/* Save a file the page made (backup, CSV) into the device's Downloads. */
async function saveFile(req) {
  const blob = req.data instanceof Blob ? req.data : new Blob([req.data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = req.filename; a.style.display = 'none';
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 4000);
  return { status: 'saved' };
}

window.HB_LOCAL = true;
window.HBLocal = {
  ready: ready,
  mode: () => mode,
  exportAll: () => clone(docs),
  async replaceAll(next) { docs = clone(next); await persistAll(); askToKeep(); emit(); },
  lastBackup() { try { return localStorage.getItem(LAST_BACKUP) || ''; } catch (e) { return ''; } },
  markBackup() { try { localStorage.setItem(LAST_BACKUP, new Date().toISOString()); } catch (e) {} }
};
window.claude = {
  use: async name => {
    await ready;
    if (name === 'db') return mode === 'none' ? null : db;
    if (name === 'user') return { can: () => true, canEdit: () => true, isOwner: () => true, id: async () => 'me' };
    if (name === 'downloads') return { save: saveFile };
    return null;
  }
};
})();
