/* Pocketbook — UI */
(function () {
'use strict';
const C = window.Core;
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => (n < 10 ? '0' : '') + n;
const NOW = new Date(), NOWM = NOW.getFullYear() + '-' + pad(NOW.getMonth() + 1);
const f0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const f2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = n => f0.format(Math.round(n) === 0 ? 0 : Math.round(n));
const money2 = n => f2.format(Math.abs(n) < 0.005 ? 0 : n);
const mLabel = ym => new Date(+ym.slice(0, 4), +ym.slice(5) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
const mLong = ym => new Date(+ym.slice(0, 4), +ym.slice(5) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
const mShort = ym => new Date(+ym.slice(0, 4), +ym.slice(5) - 1, 1).toLocaleDateString('en-US', { month: 'short' });
const dLabel = d => new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const num = v => { const n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, '')); return isFinite(n) ? n : 0; };
const LOCAL = !!window.HB_LOCAL;
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const I = {
  check: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>',
  warn: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1.5l7 12.5H1z"/><path d="M8 6v3.6M8 11.2v.9" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
  crit: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
  info: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.2v4M8 4.6v.1"/></svg>',
  up: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 3l5 8H3z"/></svg>',
  left: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  right: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  x: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  menu: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  up2: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></svg>',
  t_overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>',
  t_activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  t_budget: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12l6 4"/></svg>',
  t_trim: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6.5" r="2.5"/><circle cx="6" cy="17.5" r="2.5"/><path d="M8 8l12 9M8 16L20 7"/></svg>',
  t_goals: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>'
};
const GROUP_LABEL = { 'g-ess': 'Essentials', 'g-day': 'Everyday', 'g-oth': 'Cash and fees' };
function grp(cat) { if (C.ESSENTIAL.has(cat)) return 'g-ess'; if (C.INCOME.indexOf(cat) >= 0) return 'g-inc'; if (cat === C.TRANSFER) return 'g-xfer'; if (C.DISCRETIONARY.has(cat) || cat === 'Pets' || cat === 'Gifts & donations') return 'g-day'; return 'g-oth'; }
const tile = cat => '<span class="tile ' + grp(cat) + '" aria-hidden="true">' + esc(String(cat).charAt(0)) + '</span>';
const TABS = [['overview', 'Overview'], ['activity', 'Activity'], ['budget', 'Budget'], ['trim', 'Cut costs'], ['goals', 'Goals']];

/* ---------- state ---------- */
const DEF = () => ({ budget: { limits: {} }, rules: { map: {} }, flags: { map: {} }, goals: { debts: [], savings: [], extra: 0, strategy: 'avalanche' }, accounts: { list: [] } });
const S = {
  tab: 'overview', month: null, tx: {}, chunks: {}, settings: DEF(), loaded: false, haveTx: false, haveSet: false,
  db: null, canWrite: true, demo: false, real: null, q: '', catFilter: '', allMonths: false, showAll: false, actLimit: 150,
  trendTable: false, recFilter: 'all', sheet: null, imp: null, ver: 0, timedOut: false, big: false, confirm: ''
};
S.big = true;
try { S.big = localStorage.getItem('hb-big') !== '0'; } catch (e) {}
document.documentElement.classList.toggle('big', S.big);

let cache = null;
function D() {
  if (cache && cache.v === S.ver) return cache;
  const items = []; Object.keys(S.tx).forEach(m => S.tx[m].forEach(t => items.push(t)));
  const accts = {}; S.settings.accounts.list.forEach(a => accts[a.id] = a);
  const E = C.enrich(items, { rules: S.settings.rules.map, accounts: accts });
  const months = C.monthsOf(E), sums = {};
  const c = { v: S.ver, items, E, months, accts, sum: m => sums[m] || (sums[m] = C.summarize(E, m)) };
  c.rec = C.detectRecurring(E);
  cache = c; return c;
}
const bump = () => { S.ver++; };

/* ---------- db ---------- */
let renderQueued = false;
function scheduleRender() { if (renderQueued) return; renderQueued = true; requestAnimationFrame(() => { renderQueued = false; render(); }); }
const queues = {};
function enqueue(key, fn) {
  const q = (queues[key] || Promise.resolve()).then(fn).catch(e => { console.error(e); toast("Couldn't save that change. Check your connection and try again."); });
  queues[key] = q; return q;
}
function putDoc(id) { if (S.demo || !S.db) return; const data = JSON.parse(JSON.stringify(S.settings[id])); return enqueue('settings/' + id, () => S.db.doc('settings/' + id).set(data)); }
async function writeMonth(month, items) {
  items = items.slice().sort((a, b) => a.d < b.d ? -1 : a.d > b.d ? 1 : a.i < b.i ? -1 : 1);
  if (items.length) S.tx[month] = items; else delete S.tx[month];
  bump();
  if (S.demo || !S.db) return;
  const old = S.chunks[month] || 0, parts = [];
  for (let i = 0; i < items.length; i += 1000) parts.push(items.slice(i, i + 1000));
  const snapshot = JSON.parse(JSON.stringify(parts));
  return enqueue('tx/' + month, async () => {
    for (let n = 0; n < snapshot.length; n++) await S.db.doc('tx/' + month + '_' + n).set({ m: month, items: snapshot[n] });
    for (let n = snapshot.length; n < old; n++) await S.db.doc('tx/' + month + '_' + n).delete();
    S.chunks[month] = snapshot.length;
  });
}
function applyTxSnapshot(snap) {
  const by = {};
  snap.docs.forEach(d => {
    const v = d.data(); if (!v || !v.m || !Array.isArray(v.items)) return;
    const n = parseInt(String(d.id).split('_')[1], 10) || 0;
    (by[v.m] || (by[v.m] = [])).push({ n, items: v.items });
  });
  const tx = {}, ch = {};
  Object.keys(by).forEach(m => { by[m].sort((a, b) => a.n - b.n); tx[m] = [].concat.apply([], by[m].map(x => x.items)); ch[m] = by[m].length; });
  if (S.demo) { S.real = S.real || {}; S.real.tx = tx; S.real.chunks = ch; return; }
  S.tx = tx; S.chunks = ch; S.haveTx = true; bump(); checkLoaded(); scheduleRender();
}
function applySettingsSnapshot(snap) {
  const s = DEF();
  snap.docs.forEach(d => { if (s[d.id]) s[d.id] = Object.assign(s[d.id], d.data()); });
  if (S.demo) { S.real = S.real || {}; S.real.settings = s; return; }
  S.settings = s; S.haveSet = true; bump(); checkLoaded(); scheduleRender();
}
function checkLoaded() { if (S.haveTx && S.haveSet) { S.loaded = true; } if (S.loaded && !S.month) pickMonth(); }
function pickMonth() { const ms = D().months; if (ms.length && (!S.month || ms.indexOf(S.month) < 0)) S.month = ms[ms.length - 1]; }

async function initDb() {
  const timer = setTimeout(() => { if (!S.loaded) { S.timedOut = true; S.loaded = true; scheduleRender(); } }, 10000);
  try {
    if (!window.claude || !window.claude.use) throw new Error('no runtime');
    const db = await window.claude.use('db');
    const user = await window.claude.use('user');
    if (user && user.can) { try { S.canWrite = user.can('data.write') !== false; } catch (e) {} }
    if (!db) { S.loaded = true; clearTimeout(timer); scheduleRender(); return; }
    S.db = db;
    db.collection('tx').onSnapshot(s => { clearTimeout(timer); applyTxSnapshot(s); }, e => { console.error(e); S.loaded = true; scheduleRender(); });
    db.collection('settings').onSnapshot(s => { clearTimeout(timer); applySettingsSnapshot(s); }, e => { console.error(e); S.loaded = true; scheduleRender(); });
  } catch (e) { console.error(e); clearTimeout(timer); S.loaded = true; scheduleRender(); }
}

/* ---------- demo ---------- */
function enterDemo() {
  const sm = C.makeSample(NOW);
  S.real = { tx: S.tx, chunks: S.chunks, settings: S.settings };
  S.demo = true; S.tx = {}; S.chunks = {};
  sm.txns.forEach(t => (S.tx[t.d.slice(0, 7)] = S.tx[t.d.slice(0, 7)] || []).push(t));
  S.settings = DEF(); S.settings.accounts = sm.accounts; S.settings.budget = sm.budget; S.settings.goals = sm.goals;
  S.month = null; bump(); pickMonth(); S.tab = 'overview'; render();
}
function exitDemo() {
  const r = S.real || {};
  S.demo = false; S.tx = r.tx || {}; S.chunks = r.chunks || {}; S.settings = r.settings || DEF(); S.real = null; S.month = null;
  bump(); pickMonth(); closeSheet(); render();
}

/* ---------- toast ---------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3600); }

/* ---------- render shell ---------- */
function render() {
  renderTop(); renderTabs();
  const v = $('#view');
  if (!S.loaded) { v.innerHTML = '<p class="hint" style="padding:30px 4px;text-align:center">Loading your saved data…</p>'; return; }
  const d = D();
  if (!d.E.length && !S.demo) { v.innerHTML = viewWelcome(); return; }
  pickMonth();
  const fn = { overview: viewOverview, activity: viewActivity, budget: viewBudget, trim: viewTrim, goals: viewGoals }[S.tab];
  v.innerHTML = banners() + fn();
  if (S.tab === 'overview') wireTrend();
}
function banners() {
  let h = '';
  if (S.demo) h += '<div class="banner info" role="note"><span>You are looking at sample data. Nothing here is saved.</span><button class="link" data-a="exitDemo">Leave</button></div>';
  else if (!S.db) h += '<div class="banner warn" role="alert"><span>' + (S.timedOut ? "Can't reach your saved data right now." : 'Saving is not available in this view, so changes will be lost.') + (LOCAL ? ' This browser is not letting the page save. If this is a private or incognito tab, open the page in a normal tab.' : ' Open the page from your Claude account to save.') + '</span></div>';
  else if (!S.canWrite) h += '<div class="banner info" role="note"><span>You can look at this budget but not change it. Ask the owner to invite you by email as an Editor.</span></div>';
  if (LOCAL && !S.demo && S.db && S.loaded && D().E.length && backupAgeDays() > 30) h += '<div class="banner info" role="note"><span>' + (window.HBLocal.lastBackup() ? 'It has been over a month since the last backup.' : 'There is no backup yet.') + ' A backup protects everything if this device is lost or reset.</span><button class="link" data-a="menu">Back up</button></div>';
  return h;
}
function backupAgeDays() { const l = window.HBLocal.lastBackup(); if (!l) return Infinity; const t = Date.parse(l); return isFinite(t) ? (Date.now() - t) / 864e5 : Infinity; }
function renderTop() {
  const d = S.loaded ? D() : null, showMonth = d && d.E.length && ['overview', 'activity', 'budget'].indexOf(S.tab) >= 0;
  const st = S.demo ? '<span class="status"><span class="dot off"></span>Sample</span>' : (S.db ? (LOCAL ? '' : '<span class="status"><span class="dot"></span>Shared</span>') : '<span class="status"><span class="dot off"></span>Not saving</span>');
  let h = '<div class="top-row"><div class="brand"><svg class="logo" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="10" fill="#fff"/><rect x="6.5" y="11" width="21" height="15.5" rx="3.5" fill="#e8654a"/><path d="M6.5 15.5c0-2.5 1.6-4.5 4-4.5h13c2.4 0 4 2 4 4.5v1.5h-21z" fill="#c94e35"/><path d="M11 11c0-2.8 2.7-5 6-5s6 2.2 6 5" fill="none" stroke="#0b5e5b" stroke-width="2.2" stroke-linecap="round"/><circle cx="17" cy="17.2" r="2.4" fill="#fff"/><circle cx="17" cy="17.2" r="1.1" fill="#0b5e5b"/></svg><span>Pocketbook</span></div>' + st +
    (d && d.E.length || S.demo ? '<button class="icon-btn" data-a="import" aria-label="Import a bank statement">' + I.up2 + '</button>' : '') +
    '<button class="icon-btn" data-a="menu" aria-label="More options">' + I.menu + '</button></div>';
  if (showMonth && S.month) {
    const i = d.months.indexOf(S.month), s = d.sum(S.month);
    h += '<div class="month-row"><button class="icon-btn" data-a="prevMonth" aria-label="Earlier month"' + (i <= 0 ? ' disabled' : '') + '>' + I.left + '</button>' +
      '<div class="label">' + esc(mLong(S.month)) + (S.month === NOWM ? '<span class="sub">In progress, through ' + esc(dLabel(s.lastDate || (NOWM + '-' + pad(NOW.getDate())))) + '</span>' : '') + '</div>' +
      '<button class="icon-btn" data-a="nextMonth" aria-label="Later month"' + (i >= d.months.length - 1 ? ' disabled' : '') + '>' + I.right + '</button></div>';
  }
  $('#top').innerHTML = h;
}
function renderTabs() {
  $('#tabs').innerHTML = '<div class="in">' + TABS.map(t => '<button class="tab" data-a="tab" data-tab="' + t[0] + '"' + (S.tab === t[0] ? ' aria-current="page"' : '') + '>' + I['t_' + t[0]] + '<span>' + t[1] + '</span></button>').join('') + '</div>';
}

/* ---------- welcome ---------- */
const BOFA_STEPS = '<ol class="steps"><li>Go to <b>bankofamerica.com</b> in a web browser and sign in.</li><li>Tap the account you want, such as checking.</li><li>Above the list of transactions, tap <b>Download</b>.</li><li>Pick the dates. To start, choose the last <b>6 months</b>. If it only lets you pick one statement period at a time, download each month separately. For <b>File type</b>, choose <b>Microsoft Excel Format</b>.</li><li>Tap <b>Download Transactions</b>. The file is saved to your Downloads.</li><li>Come back here, tap <b>Import a bank statement</b> and choose the file, or all of the files at once.</li></ol>';
function viewWelcome() {
  return banners() + '<div class="empty"><svg class="welcome-mark" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="10" fill="#fff"/><rect x="6.5" y="11" width="21" height="15.5" rx="3.5" fill="#e8654a"/><path d="M6.5 15.5c0-2.5 1.6-4.5 4-4.5h13c2.4 0 4 2 4 4.5v1.5h-21z" fill="#c94e35"/><path d="M11 11c0-2.8 2.7-5 6-5s6 2.2 6 5" fill="none" stroke="#0b5e5b" stroke-width="2.2" stroke-linecap="round"/><circle cx="17" cy="17.2" r="2.4" fill="#fff"/><circle cx="17" cy="17.2" r="1.1" fill="#0b5e5b"/></svg><h1>Welcome to Pocketbook</h1>' +
    '<p class="hint">Add bank statements and this page sorts spending, tracks a monthly budget, finds charges worth cutting and plans debt payoff.</p>' +
    '<button class="btn primary block" data-a="import"' + (S.canWrite ? '' : ' disabled') + '>' + I.up2 + ' Import a bank statement</button>' +
    '<button class="btn block" data-a="demo">Try it with sample data first</button>' +
    (LOCAL ? '<button class="btn block" data-a="restore">Restore from a backup file</button>' : '') +
    '<div class="card" style="text-align:left;width:100%"><h3 style="font-size:1rem;margin-bottom:6px">Getting the file from Bank of America</h3>' + BOFA_STEPS + '</div>' +
    '<p class="small">' + (LOCAL ? 'Everything is saved on this device only. Nothing is sent anywhere, and no account is needed.' : 'Everything stays in this page’s private database. Only people you invite to the page can see it.') + '</p></div>';
}

/* ---------- overview ---------- */
function viewOverview() {
  const d = D(), m = S.month, s = d.sum(m);
  const net = s.net, tone = net >= 0 ? 'good' : 'crit';
  const hero = '<div class="hero"><div class="lab">' + (net >= 0 ? 'Left over' : 'Spent more than came in') + ' in ' + esc(mShort(m)) + (m === NOWM ? ' so far' : '') + '</div>' +
    '<div class="big num">' + esc(money(Math.abs(net))) + '</div>' +
    '<div><span class="chip ' + tone + '">' + (net >= 0 ? I.check + ' Ahead' : I.warn + ' Over') + '</span></div>' +
    '<div class="row"><span class="key"><i style="background:var(--s1)"></i>Income <b class="num">' + esc(money(s.income)) + '</b></span><span class="key"><i style="background:var(--s2)"></i>Spending <b class="num">' + esc(money(s.spend)) + '</b></span></div></div>';
  const ins = C.insights(d.E, m, { nowMonth: NOWM, money, label: mShort, recurring: d.rec }).slice(0, 3);
  const insH = ins.length ? '<section><h2 class="sec">Worth knowing</h2><div class="stack">' + ins.map(insightCard).join('') + '</div></section>' : '';
  const cats = Object.keys(s.byCat).filter(c => s.byCat[c] > 0).sort((a, b) => s.byCat[b] - s.byCat[a]);
  const max = cats.length ? s.byCat[cats[0]] : 1, shown = S.showAll ? cats : cats.slice(0, 8);
  const catH = '<section><div class="sec-head"><h2 class="sec">Where the money went</h2></div><div class="card"><div class="bars">' +
    splitBar(s) + (shown.map(c => '<button class="bar-row" data-a="goCat" data-cat="' + esc(c) + '">' + tile(c) + '<div class="bar-main"><div class="bar-top"><span class="name">' + esc(c) + '</span><span class="val num">' + esc(money(s.byCat[c])) + '<span class="pct">' + Math.round(s.byCat[c] / s.spend * 100) + '%</span></span></div><div class="track"><div class="fill ' + grp(c) + '" style="width:' + Math.max(1, s.byCat[c] / max * 100).toFixed(1) + '%"></div></div></div></button>').join('') || '<p class="hint">No spending recorded in this month.</p>') +
    '</div>' + (cats.length > 8 ? '<button class="link" data-a="toggleCats">' + (S.showAll ? 'Show fewer' : 'Show all ' + cats.length + ' categories') + '</button>' : '') + '</div>' +
    '<p class="small">Transfers between your own accounts and card payments are left out so nothing is counted twice.</p></section>';
  const tm = C.topMerchants(d.E, m, 5);
  const merH = tm.length ? '<section><h2 class="sec">Biggest places</h2><div class="card"><div class="list">' + tm.map(x => '<div class="row-item" style="cursor:default"><div class="l"><span class="t1">' + esc(x.name) + '</span><span class="t2">' + x.count + (x.count === 1 ? ' purchase' : ' purchases') + ' · ' + esc(x.cat) + '</span></div><div class="r num">' + esc(money(x.spend)) + '</div></div>').join('') + '</div></div></section>' : '';
  return hero + insH + catH + trendSection() + merH;
}
function splitBar(s) {
  if (!(s.spend > 0)) return '';
  const g = { 'g-ess': 0, 'g-day': 0, 'g-oth': 0 };
  Object.keys(s.byCat).forEach(c => { const k = grp(c); if (k in g) g[k] += s.byCat[c]; });
  const parts = Object.keys(g).filter(k => g[k] > 0), aria = parts.map(k => GROUP_LABEL[k] + ' ' + money(g[k]) + ', ' + Math.round(g[k] / s.spend * 100) + '%').join('; ');
  return '<div class="splitbar" role="img" aria-label="' + esc(aria) + '">' + parts.map(k => { const p = g[k] / s.spend * 100; return '<span class="' + k + '" style="flex:' + p.toFixed(2) + ' 1 0">' + (p >= 14 ? Math.round(p) + '%' : '') + '</span>'; }).join('') + '</div>' +
    '<div class="legend" style="margin-bottom:6px">' + parts.map(k => '<span><i class="' + k + '" style="background:var(' + (k === 'g-ess' ? '--s1' : k === 'g-day' ? '--s2' : '--s3') + ')"></i>' + GROUP_LABEL[k] + ' <b class="num" style="color:var(--ink)">' + esc(money(g[k])) + '</b></span>').join('') + '</div>';
}
function insightCard(i) {
  const icon = i.tone === 'warn' ? I.warn : i.tone === 'good' ? I.check : I.info;
  return '<div class="card insight ' + i.tone + '"><div class="ic">' + icon + '</div><div><h3>' + esc(i.title) + '</h3><p>' + esc(i.body) + '</p>' +
    (i.tab ? '<button class="link" data-a="goTab" data-tab="' + i.tab + '"' + (i.cat ? ' data-cat="' + esc(i.cat) + '"' : '') + '>' + esc(i.action || 'Open') + '</button>' : '') + '</div></div>';
}
function niceScale(v) { if (v <= 0) return { top: 1000, step: 250 }; const raw = v / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p, step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; return { top: step * Math.ceil(v / step), step }; }
function trendSection() {
  const d = D(), idx = d.months.indexOf(S.month), start = Math.max(0, idx - 5), ms = d.months.slice(start, idx + 1);
  if (ms.length < 2) return '';
  const sums = ms.map(m => d.sum(m));
  const W = 360, H = 190, L = 50, R = 6, T = 22, B = 24, pw = W - L - R, ph = H - T - B;
  const sc = niceScale(Math.max.apply(null, sums.map(s => Math.max(s.income, s.spend)))), top = sc.top, ticks = []; for (let t = 0; t <= top + 1e-6; t += sc.step) ticks.push(t);
  const y = v => T + ph - v / top * ph, slot = pw / ms.length, bw = Math.min(16, slot / 2 - 3);
  const bar = (x, v, cls) => { if (v <= 0) return ''; const h = Math.max(2, ph * v / top), r = Math.min(4, h), yy = T + ph - h; return '<path class="' + cls + '" d="M' + x + ' ' + (yy + h) + 'V' + (yy + r) + 'Q' + x + ' ' + yy + ' ' + (x + r) + ' ' + yy + 'H' + (x + bw - r) + 'Q' + (x + bw) + ' ' + yy + ' ' + (x + bw) + ' ' + (yy + r) + 'V' + (yy + h) + 'Z"/>'; };
  let g = ticks.map(t => '<line class="gridl" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(t).toFixed(1) + '" y2="' + y(t).toFixed(1) + '"/><text class="axt" x="' + (L - 6) + '" y="' + (y(t) + 4).toFixed(1) + '" text-anchor="end">' + (top >= 10000 ? '$' + (t / 1000) + 'K' : f0.format(t)) + '</text>').join('');
  ms.forEach((m, i) => {
    const cx = L + slot * i + slot / 2, xs1 = cx - bw - 1, xs2 = cx + 1, s = sums[i], sel = m === S.month;
    g += bar(xs1, s.income, 'f1') + bar(xs2, s.spend, 'f2');
    g += '<text class="axt' + (sel ? ' sel' : '') + '" x="' + cx + '" y="' + (H - 7) + '" text-anchor="middle">' + esc(mShort(m)) + '</text>';
    if (sel) {
      const lab = v => v >= 10000 ? '$' + (v / 1000).toFixed(0) + 'K' : v >= 1000 ? '$' + (v / 1000).toFixed(1) + 'K' : '$' + Math.round(v);
      g += '<text class="vlab" x="' + (xs1 + bw / 2) + '" y="' + (y(s.income) - 5).toFixed(1) + '" text-anchor="middle">' + lab(s.income) + '</text><text class="vlab" x="' + (xs2 + bw / 2) + '" y="' + (y(s.spend) - 5).toFixed(1) + '" text-anchor="middle">' + lab(s.spend) + '</text>';
    }
    g += '<rect class="col-hit" tabindex="0" role="img" data-m="' + m + '" x="' + (L + slot * i).toFixed(1) + '" y="' + T + '" width="' + slot.toFixed(1) + '" height="' + ph + '" aria-label="' + esc(mLong(m) + ': income ' + money(s.income) + ', spending ' + money(s.spend)) + '"/>';
  });
  g += '<line class="axisl" x1="' + L + '" x2="' + (W - R) + '" y1="' + (T + ph) + '" y2="' + (T + ph) + '"/>';
  const style = '<style>.f1{fill:var(--s1)}.f2{fill:var(--s2)}</style>';
  const tbl = '<table class="t num"><thead><tr><th>Month</th><th>Income</th><th>Spending</th><th>Left over</th></tr></thead><tbody>' + ms.map((m, i) => '<tr><td>' + esc(mLabel(m)) + '</td><td>' + esc(money(sums[i].income)) + '</td><td>' + esc(money(sums[i].spend)) + '</td><td>' + esc(money(sums[i].net)) + '</td></tr>').join('') + '</tbody></table>';
  return '<section><div class="sec-head"><h2 class="sec">Income and spending</h2><button class="link" data-a="toggleTrend">' + (S.trendTable ? 'Show chart' : 'Show table') + '</button></div><div class="card stack">' +
    '<div class="legend"><span><i style="background:var(--s1)"></i>Income</span><span><i style="background:var(--s2)"></i>Spending</span></div>' +
    (S.trendTable ? tbl : '<div class="chart-wrap" id="trend">' + style + '<svg viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="Income and spending by month">' + g + '</svg><div class="tip" id="tip" hidden></div></div>') +
    '</div></section>';
}
function wireTrend() {
  const wrap = $('#trend'); if (!wrap) return;
  const tip = $('#tip'), d = D();
  const show = el => {
    const m = el.dataset.m, s = d.sum(m), r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    tip.innerHTML = '<div class="m">' + esc(mLong(m)) + '</div><div class="r"><em><i style="background:var(--s1)"></i>Income</em><b class="num">' + esc(money(s.income)) + '</b></div><div class="r"><em><i style="background:var(--s2)"></i>Spending</em><b class="num">' + esc(money(s.spend)) + '</b></div>';
    tip.hidden = false;
    const half = 70; let x = r.left - w.left + r.width / 2; x = Math.max(half, Math.min(w.width - half, x));
    tip.style.left = x + 'px'; tip.style.top = '14px';
  };
  wrap.querySelectorAll('.col-hit').forEach(el => {
    el.addEventListener('pointerenter', () => show(el)); el.addEventListener('pointermove', () => show(el));
    el.addEventListener('focus', () => show(el)); el.addEventListener('blur', () => { tip.hidden = true; });
    el.addEventListener('click', () => { S.month = el.dataset.m; render(); });
  });
  wrap.addEventListener('pointerleave', () => { tip.hidden = true; });
}

/* ---------- activity ---------- */
function filteredTx() {
  const d = D(), q = S.q.trim().toLowerCase();
  return d.E.filter(t => (S.allMonths || t.month === S.month) && (!S.catFilter || t.cat === S.catFilter) && (!q || t.m.toLowerCase().indexOf(q) >= 0 || t.cat.toLowerCase().indexOf(q) >= 0));
}
function viewActivity() {
  const d = D(), otherN = d.E.filter(t => t.month === S.month && t.cat === 'Other').length;
  const opt = (g, arr) => '<optgroup label="' + g + '">' + arr.map(c => '<option value="' + esc(c) + '"' + (S.catFilter === c ? ' selected' : '') + '>' + esc(c) + '</option>').join('') + '</optgroup>';
  return '<section><label class="f"><span class="sr">Search transactions</span><input type="search" id="q" placeholder="Search by name or category" value="' + esc(S.q) + '" autocomplete="off"></label>' +
    '<label class="f"><span class="sr">Category</span><select id="catf" data-in="catf"><option value="">All categories</option>' + opt('Spending', C.EXPENSE) + opt('Income', C.INCOME) + opt('Other', [C.TRANSFER]) + '</select></label>' +
    '<div class="chips" role="group" aria-label="Time range"><button data-a="scope" data-v="month" aria-pressed="' + !S.allMonths + '">' + esc(mShort(S.month)) + '</button><button data-a="scope" data-v="all" aria-pressed="' + S.allMonths + '">All months</button>' +
    (otherN ? '<button data-a="goCat" data-cat="Other" aria-pressed="' + (S.catFilter === 'Other') + '">Needs sorting (' + otherN + ')</button>' : '') + '</div></section>' +
    '<div id="act-list">' + actList() + '</div>';
}
function actList() {
  const list = filteredTx(), accts = D().accts;
  if (!list.length) return '<p class="hint" style="padding:20px 4px;text-align:center">Nothing matches. Try a different search or category.</p>';
  const tot = list.reduce((x, t) => x + (t.kind === 'transfer' ? 0 : t.a), 0);
  let h = '<p class="small">' + list.length + ' transactions · net ' + esc(money2(tot)) + '</p><div class="list">', last = '';
  list.slice(0, S.actLimit).forEach(t => {
    if (t.d !== last) { h += '<div class="dayhead">' + esc(dLabel(t.d)) + '</div>'; last = t.d; }
    const acc = accts[t.ac];
    h += '<button class="row-item' + (t.kind === 'transfer' ? ' xfer' : '') + '" data-a="txn" data-id="' + esc(t.i) + '" data-mo="' + t.month + '">' + tile(t.cat) + '<div class="l"><span class="t1">' + esc(C.cleanName(t.m, t.key)) + '</span><span class="t2"><span class="pill' + (t.cat === 'Other' ? ' other' : '') + '">' + esc(t.cat) + '</span>' + (acc ? esc(acc.name) : '') + '</span></div><div class="r num' + (t.a > 0 && t.kind !== 'transfer' ? ' pos' : '') + '">' + (t.a > 0 ? '+' : '') + esc(money2(t.a)) + '</div></button>';
  });
  h += '</div>';
  if (list.length > S.actLimit) h += '<button class="btn block" data-a="moreTx" style="margin-top:12px">Show more</button>';
  return h;
}

/* ---------- budget ---------- */
function viewBudget() {
  const d = D(), m = S.month, s = d.sum(m), lim = S.settings.budget.limits;
  const budgeted = C.EXPENSE.filter(c => lim[c] > 0), others = C.EXPENSE.filter(c => !(lim[c] > 0) && (s.byCat[c] || 0) > 0).sort((a, b) => s.byCat[b] - s.byCat[a]);
  const totLim = budgeted.reduce((x, c) => x + lim[c], 0), totSpent = budgeted.reduce((x, c) => x + (s.byCat[c] || 0), 0), unb = others.reduce((x, c) => x + s.byCat[c], 0);
  const comp = d.months.filter(x => x !== NOWM).slice(-3), avgInc = comp.length ? comp.reduce((x, k) => x + d.sum(k).income, 0) / comp.length : s.income;
  let h = '';
  if (!budgeted.length) {
    h += '<div class="card stack"><h2 class="sec">Set a monthly budget</h2><p class="hint">A budget is a limit for each kind of spending. The quickest start is to let this page suggest limits from the last few months, then adjust them.</p><button class="btn primary block" data-a="suggest"' + (S.canWrite ? '' : ' disabled') + '>Suggest a budget from my history</button></div>';
  } else {
    const st = C.budgetStatus(totSpent, totLim), pct = Math.min(100, totSpent / totLim * 100);
    h += '<div class="card"><div class="sec-head"><h2 class="sec">' + esc(mShort(m)) + ' budget</h2>' + statusChip(st, totSpent, totLim) + '</div>' +
      '<div style="margin-top:6px"><b class="num" style="font-size:1.6rem">' + esc(money(totSpent)) + '</b> <span class="hint">of ' + esc(money(totLim)) + ' planned</span></div>' +
      '<div class="meter" role="img" aria-label="' + Math.round(pct) + ' percent of the budget used"><div class="fill ' + (st === 'ok' ? '' : st) + '" style="width:' + pct.toFixed(1) + '%"></div></div>' +
      (avgInc > 0 ? '<p class="small" style="margin-top:8px">Planned spending is ' + Math.round(totLim / avgInc * 100) + '% of average monthly income (' + esc(money(avgInc)) + ').</p>' : '') + '</div>';
    h += '<section><h2 class="sec">Your limits</h2><div class="card"><div class="list">' +
      budgeted.slice().sort((a, b) => (s.byCat[b] || 0) / lim[b] - (s.byCat[a] || 0) / lim[a]).map(c => {
        const sp = s.byCat[c] || 0, st2 = C.budgetStatus(sp, lim[c]), p = Math.min(100, sp / lim[c] * 100);
        return '<button class="row-item" data-a="limit" data-cat="' + esc(c) + '" style="flex-direction:column;gap:0"><div style="display:flex;justify-content:space-between;width:100%;gap:10px"><span class="t1">' + esc(c) + '</span><span class="num" style="font-weight:700">' + esc(money(sp)) + ' <span class="small" style="font-weight:400">of ' + esc(money(lim[c])) + '</span></span></div>' +
          '<div class="meter" style="width:100%"><div class="fill ' + (st2 === 'ok' ? '' : st2) + '" style="width:' + p.toFixed(1) + '%"></div></div><div style="margin-top:7px;width:100%">' + statusChip(st2, sp, lim[c]) + '</div></button>';
      }).join('') + '</div></div></section>';
  }
  if (others.length) h += '<section><div class="sec-head"><h2 class="sec">No limit yet</h2><span class="small num">' + esc(money(unb)) + ' this month</span></div><div class="card"><div class="list">' +
    others.map(c => '<button class="row-item" data-a="limit" data-cat="' + esc(c) + '"><div class="l"><span class="t1">' + esc(c) + '</span><span class="t2">Tap to set a limit</span></div><div class="r num">' + esc(money(s.byCat[c])) + '</div></button>').join('') + '</div></div></section>';
  if (budgeted.length) h += '<div class="btn-row"><button class="btn" data-a="suggest"' + (S.canWrite ? '' : ' disabled') + '>Suggest limits again</button><button class="btn danger" data-a="clearBudget"' + (S.canWrite ? '' : ' disabled') + '>' + (S.confirm === 'budget' ? 'Tap again to clear' : 'Clear budget') + '</button></div>';
  return h;
}
function statusChip(st, sp, lim) {
  if (st === 'over') return '<span class="chip crit">' + I.crit + ' Over by ' + esc(money(sp - lim)) + '</span>';
  if (st === 'near') return '<span class="chip warn">' + I.warn + ' ' + esc(money(lim - sp)) + ' left</span>';
  return '<span class="chip good">' + I.check + ' ' + esc(money(lim - sp)) + ' left</span>';
}

/* ---------- cut costs ---------- */
function viewTrim() {
  const d = D(), flags = S.settings.flags.map, rec = d.rec;
  const list = rec.filter(r => S.recFilter === 'all' || r.type === (S.recFilter === 'subs' ? 'subscription' : 'bill'));
  const mo = rec.reduce((x, r) => x + r.monthly, 0), cancel = rec.filter(r => flags[r.key] === 'cancel').reduce((x, r) => x + r.annual, 0);
  let h = '<div class="hero"><div class="lab">Charges that repeat every month</div><div class="big num">' + esc(money(mo)) + '</div><div class="hint">' + rec.length + ' found, about ' + esc(money(mo * 12)) + ' a year</div>' +
    (cancel > 0 ? '<div style="margin-top:4px"><span class="chip good">' + I.check + ' ' + esc(money(cancel)) + ' a year if you cancel the ones marked</span></div>' : '') + '</div>';
  if (!rec.length) h += '<div class="card"><p class="hint">Repeating charges show up once there are at least three months of statements. Import more months to see them.</p></div>';
  else {
    h += '<section><h2 class="sec">Review each one</h2><div class="chips" role="group" aria-label="Filter"><button data-a="recf" data-v="all" aria-pressed="' + (S.recFilter === 'all') + '">All</button><button data-a="recf" data-v="subs" aria-pressed="' + (S.recFilter === 'subs') + '">Subscriptions</button><button data-a="recf" data-v="bills" aria-pressed="' + (S.recFilter === 'bills') + '">Bills</button></div>' +
      '<div class="stack">' + list.map(r => {
        const f = flags[r.key] || '';
        return '<div class="card stack" style="gap:10px"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div style="min-width:0"><div class="t1" style="font-weight:700;overflow-wrap:anywhere">' + esc(r.name) + '</div><div class="small">' + esc(r.cat) + ' · last charged ' + esc(dLabel(r.lastDate)) + '</div></div><div style="text-align:right"><div class="num" style="font-weight:700">' + esc(money2(r.monthly)) + '<span class="small" style="font-weight:400">/mo</span></div><div class="small num">' + esc(money(r.annual)) + '/yr</div></div></div>' +
          (r.increase ? '<div><span class="chip warn">' + I.up + ' Up ' + esc(money2(r.increase.to - r.increase.from)) + ' a month since ' + esc(mLabel(r.increase.since)) + '</span></div>' : '') +
          '<div class="seg keep" role="group" aria-label="Decision for ' + esc(r.name) + '"><button class="k-keep" data-a="flag" data-key="' + esc(r.key) + '" data-v="keep" aria-pressed="' + (f === 'keep') + '"' + (S.canWrite ? '' : ' disabled') + '>Keep</button><button class="k-review" data-a="flag" data-key="' + esc(r.key) + '" data-v="review" aria-pressed="' + (f === 'review') + '"' + (S.canWrite ? '' : ' disabled') + '>Look into it</button><button class="k-cancel" data-a="flag" data-key="' + esc(r.key) + '" data-v="cancel" aria-pressed="' + (f === 'cancel') + '"' + (S.canWrite ? '' : ' disabled') + '>Cancel</button></div></div>';
      }).join('') + '</div><p class="small">This is a list of patterns in the statements. Whether to keep or cancel anything is up to you.</p></section>';
  }
  const fees = d.E.filter(t => t.cat === 'Fees & interest' && t.a < 0);
  if (fees.length) {
    const g = {}; fees.forEach(t => { const k = t.key, x = g[k] || (g[k] = { name: C.titleCase(t.key), n: 0, tot: 0 }); x.n++; x.tot += -t.a; });
    const tot = fees.reduce((x, t) => x - t.a, 0), rows = Object.values(g).sort((a, b) => b.tot - a.tot).slice(0, 6);
    h += '<section><div class="sec-head"><h2 class="sec">Fees and interest</h2><span class="num" style="font-weight:700">' + esc(money(tot)) + '</span></div><div class="card"><div class="list">' + rows.map(x => '<div class="row-item" style="cursor:default"><div class="l"><span class="t1">' + esc(x.name) + '</span><span class="t2">' + x.n + (x.n === 1 ? ' time' : ' times') + '</span></div><div class="r num">' + esc(money2(x.tot)) + '</div></div>').join('') + '</div></div><p class="small">Banks will often waive a fee, or remove an overdraft charge, if you call and ask.</p></section>';
  }
  const ins = C.insights(d.E, S.month || d.months[d.months.length - 1], { nowMonth: NOWM, money, label: mShort, recurring: rec });
  if (ins.length) h += '<section><h2 class="sec">Other patterns</h2><div class="stack">' + ins.map(insightCard).join('') + '</div></section>';
  return h;
}

/* ---------- goals ---------- */
function viewGoals() {
  const d = D(), g = S.settings.goals, debts = g.debts, sav = g.savings;
  const comp = d.months.filter(x => x !== NOWM).slice(-3), avgNet = comp.length ? comp.reduce((x, m) => x + d.sum(m).net, 0) / comp.length : 0;
  let h = '<section><div class="sec-head"><h2 class="sec">Debts</h2><button class="link" data-a="editDebt" data-id=""' + (S.canWrite ? '' : ' disabled') + '>+ Add a debt</button></div>';
  if (!debts.length) h += '<div class="card"><p class="hint">Add credit cards and loans to see how fast they could be paid off and how much interest an extra payment saves.</p></div>';
  else {
    h += '<div class="card"><div class="list">' + debts.map(x => '<button class="row-item" data-a="editDebt" data-id="' + esc(x.id) + '"><div class="l"><span class="t1">' + esc(x.name) + '</span><span class="t2">' + esc(String(x.apr)) + '% interest · ' + esc(money(x.min)) + ' minimum a month</span></div><div class="r num">' + esc(money(x.balance)) + '</div></button>').join('') + '</div></div>';
    h += '<div class="card stack"><h3 style="font-size:1rem">Payoff plan</h3>' +
      '<label class="f">Extra to pay each month, on top of minimums<input type="number" inputmode="decimal" min="0" step="10" id="extra" value="' + (g.extra || 0) + '"></label>' +
      (avgNet > 0 ? '<p class="small">Recent months left about ' + esc(money(avgNet)) + ' over on average.</p>' : '') +
      '<div class="seg" role="group" aria-label="Payoff order"><button data-a="strategy" data-v="avalanche" aria-pressed="' + (g.strategy !== 'snowball') + '">Highest interest first</button><button data-a="strategy" data-v="snowball" aria-pressed="' + (g.strategy === 'snowball') + '">Smallest balance first</button></div>' +
      '<div id="payoff" class="stack">' + payoffHtml() + '</div></div>';
  }
  h += '</section><section><div class="sec-head"><h2 class="sec">Savings goals</h2><button class="link" data-a="editSaving" data-id=""' + (S.canWrite ? '' : ' disabled') + '>+ Add a goal</button></div>';
  const ess = C.essentialsPerMonth(d.E, NOWM);
  if (!sav.length) h += '<div class="card"><p class="hint">Set a target and a monthly amount to see when you would get there.</p></div>';
  else h += '<div class="stack">' + sav.map(x => {
    const p = x.target > 0 ? Math.min(100, x.saved / x.target * 100) : 0, mo = C.monthsToGoal(x.target, x.saved, x.monthly);
    const eta = mo === 0 ? 'Goal reached' : mo == null ? 'Add a monthly amount to see a date' : 'About ' + mo + (mo === 1 ? ' month' : ' months') + ' to go, around ' + mLabel(C.addMonths(NOWM, mo));
    return '<button class="card" data-a="editSaving" data-id="' + esc(x.id) + '" style="text-align:left;cursor:pointer;width:100%"><div style="display:flex;justify-content:space-between;gap:10px"><span class="t1" style="font-weight:700">' + esc(x.name) + '</span><span class="num" style="font-weight:700">' + esc(money(x.saved)) + ' <span class="small" style="font-weight:400">of ' + esc(money(x.target)) + '</span></span></div><div class="meter" role="img" aria-label="' + Math.round(p) + ' percent saved"><div class="fill" style="width:' + p.toFixed(1) + '%"></div></div><p class="small" style="margin-top:7px">' + esc(eta) + (x.monthly > 0 ? ' · ' + esc(money(x.monthly)) + ' a month' : '') + '</p></button>';
  }).join('') + '</div>';
  if (ess > 0) h += '<div class="card"><h3 style="font-size:1rem">A cushion for surprises</h3><p class="hint" style="margin-top:4px">Essential bills (housing, utilities, food, transport, insurance, health, debt, taxes) run about <b class="num">' + esc(money(ess)) + '</b> a month. Three months is ' + esc(money(ess * 3)) + ', six months is ' + esc(money(ess * 6)) + '.</p>' + (S.canWrite ? '<button class="link" data-a="editSaving" data-id="" data-preset="' + Math.round(ess * 3) + '">Add a 3 month cushion goal</button>' : '') + '</div>';
  return h + '</section><p class="small">Payoff and savings dates are estimates that assume steady payments and fixed interest rates. They are not financial advice.</p>';
}
function payoffHtml() {
  const g = S.settings.goals, debts = g.debts.map(x => ({ name: x.name, balance: x.balance, apr: x.apr, min: x.min }));
  const plan = C.simulatePayoff(debts, g.extra || 0, g.strategy), base = C.simulatePayoff(debts, 0, g.strategy, false);
  if (!plan.ok) {
    const bad = g.debts.filter(x => x.min < x.balance * x.apr / 1200 + 0.005).map(x => x.name);
    return '<div class="banner warn" role="alert"><span>' + I.warn.replace('<svg', '<svg width="16" height="16" style="flex:none"') + ' These payments do not pay everything off within 100 years' + (bad.length ? ': the minimum on ' + esc(bad.join(', ')) + ' is less than its monthly interest' : '') + '. Try a larger extra payment.</span></div>';
  }
  const end = C.addMonths(NOWM, plan.months), saved = base.ok ? base.interest - plan.interest : 0, sooner = base.ok ? base.months - plan.months : 0;
  let h = '<div class="stat3"><div><span class="v">' + esc(mLabel(end)) + '</span><span class="k">Debt free</span></div><div><span class="v num">' + esc(money(plan.interest)) + '</span><span class="k">Total interest</span></div><div><span class="v num">' + plan.months + '</span><span class="k">Months</span></div></div>';
  if (base.ok && (saved > 1 || sooner > 0)) h += '<span class="chip good wrap" style="align-self:flex-start">' + I.check + ((g.extra || 0) > 0 ? ' Saves ' : ' Moving each finished payment onto the next debt saves ') + esc(money(saved)) + ' in interest and ' + sooner + (sooner === 1 ? ' month' : ' months') + ((g.extra || 0) > 0 ? ' compared with minimums only' : '') + '</span>';
  else if (base.ok) h += '<p class="small">Minimums alone take ' + base.months + ' months and ' + esc(money(base.interest)) + ' in interest. Add an extra amount above to see the difference.</p>';
  h += '<div><div class="small" style="margin-bottom:4px">Paid off in this order</div>' + plan.order.map((o, i) => '<div class="row-item" style="cursor:default;padding:8px 2px"><div class="l"><span class="t1">' + (i + 1) + '. ' + esc(o.name) + '</span></div><div class="r num" style="font-weight:600">' + esc(mLabel(C.addMonths(NOWM, o.month))) + '</div></div>').join('') + '</div>';
  return h;
}

/* ---------- sheets ---------- */
function openSheet(type, data) { S.sheet = Object.assign({ type }, data || {}); renderSheet(true); }
function closeSheet() { S.sheet = null; S.imp = null; S.confirm = ''; const el = $('#sheet'); el.hidden = true; el.innerHTML = ''; document.body.style.overflow = ''; }
function renderSheet(focus) {
  const sh = S.sheet; if (!sh) return;
  let title = '', body = '';
  if (sh.type === 'txn') { const r = sheetTxn(sh); title = 'Transaction'; body = r; }
  else if (sh.type === 'limit') { title = esc(sh.cat) + ' limit'; body = sheetLimit(sh); }
  else if (sh.type === 'suggest') { title = 'Suggested budget'; body = sheetSuggest(); }
  else if (sh.type === 'debt') { title = sh.id ? 'Edit debt' : 'Add a debt'; body = sheetDebt(sh); }
  else if (sh.type === 'saving') { title = sh.id ? 'Edit goal' : 'Add a savings goal'; body = sheetSaving(sh); }
  else if (sh.type === 'import') { title = 'Import statement'; body = sheetImport(); }
  else if (sh.type === 'menu') { title = 'More'; body = sheetMenu(); }
  else if (sh.type === 'restore') { title = 'Restore a backup'; body = sheetRestore(); }
  const el = $('#sheet');
  el.hidden = false; document.body.style.overflow = 'hidden';
  el.innerHTML = '<div class="scrim" data-a="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(title.replace(/<[^>]*>/g, '')) + '"><div class="sheet-head"><h2>' + title + '</h2><button class="icon-btn" data-a="closeSheet" aria-label="Close">' + I.x + '</button></div><div class="sheet-body">' + body + '</div></div>';
  if (focus) { const f = el.querySelector('input:not([type=file]):not([type=checkbox]),select'); if (f && sh.type !== 'import' && sh.type !== 'txn') f.focus(); }
}
function findTx(id, mo) { const arr = S.tx[mo] || []; return arr.find(t => t.i === id); }
function sheetTxn(sh) {
  const d = D(), t = d.E.find(x => x.i === sh.id); if (!t) return '<p class="hint">That transaction is gone.</p>';
  const same = d.E.filter(x => x.key === t.key).length, acc = d.accts[t.ac];
  const opt = (arr, g) => '<optgroup label="' + g + '">' + arr.map(c => '<option' + (c === t.cat ? ' selected' : '') + '>' + esc(c) + '</option>').join('') + '</optgroup>';
  return '<div><div style="font-weight:700;overflow-wrap:anywhere">' + esc(t.m) + '</div><div class="small">' + esc(dLabel(t.d)) + (acc ? ' · ' + esc(acc.name) : '') + '</div><div class="num" style="font-size:1.8rem;font-weight:700;margin-top:4px">' + (t.a > 0 ? '+' : '') + esc(money2(t.a)) + '</div></div>' +
    '<label class="f">Category<select id="t-cat">' + opt(C.EXPENSE, 'Spending') + opt(C.INCOME, 'Income') + opt([C.TRANSFER], 'Not counted') + '</select></label>' +
    (same > 1 ? '<label class="check"><input type="checkbox" id="t-all" checked><span>Use this category for all ' + same + ' “' + esc(C.keyLabel(t.key)) + '” transactions, including future imports</span></label>' : '<label class="check"><input type="checkbox" id="t-all"><span>Remember this category for future “' + esc(C.keyLabel(t.key)) + '” transactions</span></label>') +
    '<button class="btn primary block" data-a="saveTxn" data-id="' + esc(t.i) + '" data-mo="' + t.month + '"' + (S.canWrite ? '' : ' disabled') + '>Save</button>' +
    '<button class="btn danger block" data-a="delTxn" data-id="' + esc(t.i) + '" data-mo="' + t.month + '"' + (S.canWrite ? '' : ' disabled') + '>' + (S.confirm === 'del' + t.i ? 'Tap again to delete' : 'Delete this transaction') + '</button>';
}
function sheetLimit(sh) {
  const cur = S.settings.budget.limits[sh.cat] || '';
  return '<label class="f">Monthly limit for ' + esc(sh.cat) + '<input type="number" inputmode="decimal" min="0" step="5" id="lim" value="' + esc(cur) + '" placeholder="No limit"></label><p class="hint">Leave it empty to remove the limit.</p>' +
    '<button class="btn primary block" data-a="saveLimit" data-cat="' + esc(sh.cat) + '"' + (S.canWrite ? '' : ' disabled') + '>Save</button>';
}
function sheetSuggest() {
  const d = D(), sg = C.suggestBudget(d.E, NOWM), cats = Object.keys(sg.limits).sort((a, b) => sg.limits[b] - sg.limits[a]), tot = cats.reduce((x, c) => x + sg.limits[c], 0);
  const inc = sg.months.reduce((x, m) => x + d.sum(m).income, 0) / (sg.months.length || 1);
  return '<p class="hint">Based on the average of ' + sg.months.map(mShort).join(', ') + '. Everyday spending like dining, shopping and subscriptions is set 10% below the average as a gentle push. You can change any of them afterwards.</p>' +
    '<div class="card"><div class="list">' + cats.map(c => '<div class="row-item" style="cursor:default;padding:8px 2px"><div class="l"><span class="t1">' + esc(c) + '</span></div><div class="r num">' + esc(money(sg.limits[c])) + '</div></div>').join('') + '</div></div>' +
    '<p class="small num">Total ' + esc(money(tot)) + ' a month' + (inc > 0 ? ' against average income of ' + esc(money(inc)) : '') + '</p>' +
    '<button class="btn primary block" data-a="applySuggest" data-mode="replace">Use these as my budget</button>' +
    (Object.keys(S.settings.budget.limits).length ? '<button class="btn block" data-a="applySuggest" data-mode="fill">Only fill in categories without a limit</button>' : '');
}
function sheetDebt(sh) {
  const x = S.settings.goals.debts.find(v => v.id === sh.id) || { name: '', balance: '', apr: '', min: '' };
  return '<label class="f">Name<input type="text" id="d-name" value="' + esc(x.name) + '" placeholder="Visa card, car loan"></label>' +
    '<label class="f">Balance owed ($)<input type="number" inputmode="decimal" min="0" step="any" id="d-bal" value="' + esc(x.balance) + '"></label>' +
    '<label class="f">Interest rate per year (%)<input type="number" inputmode="decimal" min="0" step="any" id="d-apr" value="' + esc(x.apr) + '"></label>' +
    '<label class="f">Minimum payment per month ($)<input type="number" inputmode="decimal" min="0" step="any" id="d-min" value="' + esc(x.min) + '"></label>' +
    '<button class="btn primary block" data-a="saveDebt" data-id="' + esc(sh.id || '') + '">Save</button>' +
    (sh.id ? '<button class="btn danger block" data-a="delDebt" data-id="' + esc(sh.id) + '">' + (S.confirm === 'dd' + sh.id ? 'Tap again to remove' : 'Remove this debt') + '</button>' : '');
}
function sheetSaving(sh) {
  const x = S.settings.goals.savings.find(v => v.id === sh.id) || { name: sh.preset ? 'Emergency cushion' : '', target: sh.preset || '', saved: '', monthly: '' };
  return '<label class="f">Name<input type="text" id="s-name" value="' + esc(x.name) + '" placeholder="Emergency fund, new roof"></label>' +
    '<label class="f">Target ($)<input type="number" inputmode="decimal" min="0" step="any" id="s-target" value="' + esc(x.target) + '"></label>' +
    '<label class="f">Saved so far ($)<input type="number" inputmode="decimal" min="0" step="any" id="s-saved" value="' + esc(x.saved) + '"></label>' +
    '<label class="f">Set aside each month ($)<input type="number" inputmode="decimal" min="0" step="any" id="s-mo" value="' + esc(x.monthly) + '"></label>' +
    '<button class="btn primary block" data-a="saveSaving" data-id="' + esc(sh.id || '') + '">Save</button>' +
    (sh.id ? '<button class="btn danger block" data-a="delSaving" data-id="' + esc(sh.id) + '">' + (S.confirm === 'ds' + sh.id ? 'Tap again to remove' : 'Remove this goal') + '</button>' : '');
}
function sheetMenu() {
  return '<label class="check"><input type="checkbox" id="bigtext"' + (S.big ? ' checked' : '') + '><span>Larger text</span></label>' +
    (S.demo ? '<button class="btn block" data-a="exitDemo">Leave sample data</button>' : '<button class="btn block" data-a="demo">View sample data</button>') +
    (!S.demo ? '<button class="btn block" data-a="import"' + (S.canWrite ? '' : ' disabled') + '>Import a bank statement</button><button class="btn block" data-a="export"' + (D().E.length ? '' : ' disabled') + '>Download all transactions (CSV)</button>' : '') +
    (!S.demo && D().E.length ? '<button class="btn danger block" data-a="wipe"' + (S.canWrite ? '' : ' disabled') + '>' + (S.confirm === 'wipe' ? 'Tap again to delete everything' : 'Delete all transactions') + '</button>' : '') +
    (LOCAL ? sheetMenuLocal() : '<p class="small">Data is stored in this page’s own database and is visible only to you and anyone you invite to the page. To let someone else add statements and make changes, invite them by email as an Editor.</p>');
}
function sheetMenuLocal() {
  const last = window.HBLocal.lastBackup(), has = !S.demo && D().E.length > 0;
  return '<div class="card stack"><h3 style="font-size:1rem">Backup</h3>' +
    '<p class="hint">Everything is saved on this device only. A backup file keeps it safe and lets you share a copy.</p>' +
    (has ? (canShareBackup() ? '<button class="btn primary block" data-a="shareBackup">Send a backup copy</button>' : '') + '<button class="btn block' + (canShareBackup() ? '' : ' primary') + '" data-a="backup">Save a backup file to this device</button>' : '') +
    (!S.demo ? '<button class="btn block" data-a="restore">Restore from a backup file</button>' : '') +
    '<p class="small">' + (last ? 'Last backup: ' + esc(new Date(last).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })) + '.' : 'No backup made yet.') + ' Clearing this browser’s site data erases the budget, so keep a recent backup.</p></div>';
}
function backupText() { return JSON.stringify({ app: 'household-budget', version: 1, exported: new Date().toISOString(), docs: window.HBLocal.exportAll() }); }
function backupName(ext) { return 'pocketbook-backup-' + NOWM + '-' + pad(NOW.getDate()) + '.' + ext; }
const BK_TYPES = [['json', 'application/json'], ['txt', 'text/plain']];
let shareKind;
function canShareBackup() {
  if (shareKind !== undefined) return !!shareKind;
  shareKind = null;
  try { if (navigator.canShare) for (const k of BK_TYPES) { if (navigator.canShare({ files: [new File(['{}'], 'x.' + k[0], { type: k[1] })] })) { shareKind = k; break; } } } catch (e) {}
  return !!shareKind;
}
async function saveBackup() {
  try { const dl = await window.claude.use('downloads'); await dl.save({ filename: backupName('json'), data: new Blob([backupText()], { type: 'application/json' }) }); window.HBLocal.markBackup(); toast('Backup saved to Downloads.'); renderSheet(); render(); }
  catch (e) { console.error(e); toast("Couldn't save the backup."); }
}
async function shareBackup() {
  if (!canShareBackup()) return saveBackup();
  try { await navigator.share({ files: [new File([backupText()], backupName(shareKind[0]), { type: shareKind[1] })], title: 'Pocketbook backup' }); window.HBLocal.markBackup(); toast('Backup sent.'); renderSheet(); render(); }
  catch (e) { if (!e || e.name !== 'AbortError') { console.error(e); toast("Couldn't open sharing. Saving a file instead."); saveBackup(); } }
}
function readBackup(text) {
  const o = JSON.parse(text);
  if (!o || o.app !== 'household-budget' || !o.docs || typeof o.docs !== 'object') throw new Error('not a backup');
  const docs = {}; let n = 0, first = '', last = '';
  Object.keys(o.docs).forEach(k => {
    const v = o.docs[k];
    if (/^settings\/(budget|rules|flags|goals|accounts)$/.test(k) && v && typeof v === 'object') docs[k] = v;
    else if (/^tx\/\d{4}-\d{2}_\d+$/.test(k) && v && Array.isArray(v.items)) {
      const items = v.items.filter(t => t && typeof t.i === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.d) && typeof t.a === 'number' && isFinite(t.a)).map(t => { const x = { i: t.i, d: t.d, a: t.a, m: String(t.m == null ? '' : t.m).slice(0, 120), ac: String(t.ac == null ? '' : t.ac) }; if (typeof t.c === 'string' && C.ALL_CATS.indexOf(t.c) >= 0) x.c = t.c; return x; });
      if (!items.length) return;
      docs[k] = { m: k.slice(3, 10), items }; n += items.length;
      items.forEach(t => { if (!first || t.d < first) first = t.d; if (t.d > last) last = t.d; });
    }
  });
  if (!n && !Object.keys(docs).length) throw new Error('empty backup');
  return { docs, count: n, first, last, exported: typeof o.exported === 'string' ? o.exported : '' };
}
function sheetRestore() {
  const r = S.rst || {}, have = D().E.length;
  let h = '<label class="f">Backup file<input type="file" id="rst-file" accept=".json,.txt,application/json,text/plain"></label>';
  if (r.error) h += '<div class="banner warn" role="alert">' + esc(r.error) + '</div>';
  if (r.data) {
    const ex = r.data.exported && isFinite(Date.parse(r.data.exported)) ? new Date(r.data.exported).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
    h += '<div class="card stack"><b>' + esc(r.name) + '</b><p>' + r.data.count + ' transactions' + (r.data.first ? ', ' + esc(dLabel(r.data.first)) + ' to ' + esc(dLabel(r.data.last)) : '') + (ex ? '. Backed up ' + esc(ex) : '') + '.</p></div>' +
      (have ? '<p class="hint">Restoring replaces the ' + have + ' transactions, budget and goals on this device with what is in this file.</p>' : '') +
      '<button class="btn primary block" data-a="doRestore">' + (have && S.confirm !== 'restore' ? 'Replace what is on this device' : have ? 'Tap again to replace' : 'Restore this backup') + '</button>';
  } else h += '<p class="small">Choose a file named like pocketbook-backup. It is read on this device and not sent anywhere.</p>';
  return h;
}
function loadBackupFile(file) {
  if (!file) return; S.rst = { name: file.name };
  const rd = new FileReader();
  rd.onerror = () => { S.rst.error = "Couldn't read that file."; renderSheet(); };
  rd.onload = () => { try { S.rst.data = readBackup(String(rd.result)); } catch (e) { S.rst.error = 'That file is not a Pocketbook backup.'; } renderSheet(); };
  rd.readAsText(file);
}

/* ---------- import ---------- */
function startImport() {
  if (S.demo) { toast('Leave the sample data first, then import real statements.'); return; }
  const list = S.settings.accounts.list;
  S.imp = { step: 1, acct: list.length ? list[0].id : 'new', newName: 'Bank of America checking', newType: 'checking', invert: false, newId: uid('a'), files: [] };
  openSheet('import');
}
const PICK_HELP = '<p class="small">You can choose several files at once, for example one for each month. On Android, press and hold the first file, then tap the others.</p>';
function sheetImport() {
  const m = S.imp, list = S.settings.accounts.list;
  if (m.step === 3) return '<div class="card stack"><h3 style="font-size:1.1rem">Done</h3><p>Added <b>' + m.added + '</b> new transactions' + (m.dupes ? ' and skipped ' + m.dupes + ' that were already here' : '') + '.</p>' + (m.monthsCovered ? '<p class="small">Covers ' + esc(m.monthsCovered) + '.</p>' : '') + '</div>' +
    (m.suggest ? '<div class="banner info"><span>With several months in, the Budget tab can now suggest monthly limits from her real spending.</span></div>' : '') +
    '<button class="btn primary block" data-a="importDone">Show my budget</button><button class="btn block" data-a="importAnother">Import more files</button>';
  if (m.step === 4) return '<p class="hint">Saving month ' + m.progress + ' of ' + m.total + '…</p>';
  if (m.step === 5) return '<p class="hint">Reading ' + m.reading + (m.reading === 1 ? ' file' : ' files') + '…</p>';
  const acctSel = '<label class="f">Which account are these from?<select id="imp-acct">' + list.map(a => '<option value="' + esc(a.id) + '"' + (m.acct === a.id ? ' selected' : '') + '>' + esc(a.name) + '</option>').join('') + '<option value="new"' + (m.acct === 'new' ? ' selected' : '') + '>A new account…</option></select></label>' +
    (m.acct === 'new' ? '<div class="grid2"><label class="f">Name<input type="text" id="imp-name" value="' + esc(m.newName) + '"></label><label class="f">Type<select id="imp-type"><option value="checking"' + (m.newType === 'checking' ? ' selected' : '') + '>Checking or savings</option><option value="credit"' + (m.newType === 'credit' ? ' selected' : '') + '>Credit card</option></select></label></div>' : '') +
    '<p class="small">Import each account separately: checking files together, credit card files together.</p>';
  const pick = '<label class="f">Statement files (CSV)<input type="file" id="imp-file" multiple accept=".csv,.txt,text/csv,text/plain"></label>';
  if (!m.files.length) return acctSel + pick + PICK_HELP + (m.error ? '<div class="banner warn" role="alert">' + esc(m.error) + '</div>' : '') + '<p class="small">The files are read on this device and not sent anywhere else.</p>' +
    '<details class="map"><summary>How do I get these files from Bank of America?</summary>' + BOFA_STEPS + '</details>';
  const txns = m.combined, ins = txns.filter(t => t.a > 0), outs = txns.filter(t => t.a < 0);
  const sum = a => a.reduce((x, t) => x + Math.abs(t.a), 0);
  const dates = txns.map(t => t.d).sort(), months = Array.from(new Set(dates.map(x => x.slice(0, 7)))).sort();
  const bad = m.files.filter(f => !f.built.txns.length), single = m.files.length === 1 ? m.files[0] : null;
  let h = acctSel + '<div class="card stack">';
  if (single) h += '<b>' + esc(single.name) + '</b>';
  else h += '<b>' + m.files.length + ' files</b><div class="list">' + m.files.map(f => { const ds = f.built.txns.map(t => t.d).sort(); return '<div class="row-item" style="cursor:default;padding:8px 2px"><div class="l"><span class="t1" style="font-weight:600">' + esc(f.name) + '</span><span class="t2">' + (ds.length ? esc(dLabel(ds[0])) + ' to ' + esc(dLabel(ds[ds.length - 1])) : 'No transactions found') + '</span></div><div class="r num" style="font-weight:600">' + f.built.txns.length + '</div></div>'; }).join('') + '</div>';
  if (txns.length) h += '<div class="stat3"><div><span class="v">' + txns.length + '</span><span class="k">Transactions</span></div><div><span class="v num">' + esc(money(sum(outs))) + '</span><span class="k">Money out</span></div><div><span class="v num">' + esc(money(sum(ins))) + '</span><span class="k">Money in</span></div></div>' +
    '<p class="small">' + months.length + (months.length === 1 ? ' month' : ' months') + ': ' + esc(mLabel(months[0])) + (months.length > 1 ? ' to ' + esc(mLabel(months[months.length - 1])) : '') + (m.overlap ? ' · ' + m.overlap + ' repeated in more than one file, counted once' : '') + '</p>';
  else h += '<p class="hint">No transactions found. Check the column choices below.</p>';
  h += '</div>';
  if (bad.length && !single) h += '<div class="banner warn" role="alert"><span>' + bad.length + (bad.length === 1 ? ' file' : ' files') + ' could not be read as a statement and will be left out: ' + esc(bad.map(f => f.name).join(', ')) + '. Import ' + (bad.length === 1 ? 'it' : 'them') + ' on ' + (bad.length === 1 ? 'its' : 'their') + ' own to check the columns.</span></div>';
  if (txns.length) {
    const prev = txns.slice().sort((x, y) => x.d < y.d ? 1 : -1).slice(0, 5).map(t => '<tr><td>' + esc(t.d) + '</td><td>' + esc(t.m) + '</td><td class="n num">' + esc(money2(t.a)) + '</td></tr>').join('');
    h += '<div class="banner info" style="align-items:center"><span>Social Security, pensions and other deposits should be money <b>in</b>. If this looks backwards, flip it.</span><button class="btn" data-a="flip" style="min-height:40px;padding:6px 12px">Flip</button></div><div class="preview"><table><thead><tr><th>Date</th><th>Description</th><th>Amount</th></tr></thead><tbody>' + prev + '</tbody></table></div>';
  }
  if (single) {
    const mp = single.mapping, hdr = single.layout.header;
    const colSel = (id, label, cur) => '<label class="f">' + label + '<select id="' + id + '"><option value="-1">None</option>' + Array.from({ length: single.layout.ncol }, (_, i) => '<option value="' + i + '"' + (cur === i ? ' selected' : '') + '>' + esc(hdr && hdr[i] ? hdr[i] : 'Column ' + (i + 1)) + '</option>').join('') + '</select></label>';
    const low = !txns.length || mp.date < 0 || mp.desc < 0;
    h += '<details class="map"' + (low ? ' open' : '') + '><summary>Check the columns</summary><div class="stack">' + colSel('map-date', 'Date', mp.date) + colSel('map-desc', 'Description', mp.desc) + colSel('map-amt', 'Amount (one column, negative for money out)', mp.amount) +
      '<div class="grid2">' + colSel('map-deb', 'Money out column', mp.debit) + colSel('map-cred', 'Money in column', mp.credit) + '</div><p class="small">Use the last two only if the file has separate columns for money out and money in. Then set Amount to None.</p></div></details>';
  }
  return h + '<p class="small">Transactions already imported are skipped, so overlapping files are safe.</p>' +
    '<button class="btn primary block" data-a="runImport"' + (txns.length ? '' : ' disabled') + '>Import ' + txns.length + ' transactions</button>' +
    '<button class="btn block" data-a="importAnother">Choose different files</button>';
}
/* Ids are per file (so two identical purchases on one day in one file both count), then files are merged by id (so overlapping files count once). */
function mergeFiles(files, acctId) {
  const out = [], seen = new Set(); let overlap = 0;
  files.forEach(f => C.assignIds(f.built.txns, acctId).forEach(t => { if (seen.has(t.i)) { overlap++; return; } seen.add(t.i); out.push(t); }));
  return { txns: out, overlap };
}
function rebuildImport() {
  const m = S.imp; if (!m || !m.files.length) return;
  m.files.forEach(f => {
    const split = f.mapping.amount < 0 && (f.mapping.debit >= 0 || f.mapping.credit >= 0);
    const raw = C.buildTransactions(f.layout.dataRows, f.mapping, false);
    f.flip = C.guessFlip(raw.txns, split) !== m.invert;
    f.built = f.flip ? C.buildTransactions(f.layout.dataRows, f.mapping, true) : raw;
  });
  const mg = mergeFiles(m.files, 'preview'); m.combined = mg.txns; m.overlap = mg.overlap;
}
function readText(file) { return new Promise((res, rej) => { const rd = new FileReader(); rd.onload = () => res(String(rd.result)); rd.onerror = () => rej(new Error('read')); rd.readAsText(file); }); }
async function loadFiles(list) {
  const m = S.imp; const files = Array.from(list || []); if (!files.length) return;
  m.step = 5; m.reading = files.length; m.error = ''; renderSheet();
  const out = [], failed = [];
  for (const file of files.slice(0, 60)) {
    try {
      const rows = C.parseCSV(await readText(file));
      if (rows.length < 2) throw new Error('empty');
      const layout = C.detectLayout(rows);
      out.push({ name: file.name, layout, mapping: Object.assign({}, layout.mapping) });
    } catch (e) { failed.push(file.name); }
  }
  m.step = 1; m.invert = false; m.files = out;
  if (!out.length) m.error = failed.length > 1 ? "Couldn't read those files as bank statements. Make sure they are the CSV (Microsoft Excel Format) downloads." : "Couldn't read that file as a bank statement. Make sure it is the CSV (Microsoft Excel Format) download.";
  else { out.sort((a, b) => a.name < b.name ? -1 : 1); rebuildImport(); if (failed.length) m.error = ''; }
  m.failed = failed; renderSheet();
}
async function runImport() {
  const m = S.imp; if (!m || !m.combined || !m.combined.length || !S.canWrite) return;
  let acctId = m.acct;
  if (acctId === 'new') {
    acctId = m.newId; const name = (m.newName || '').trim() || 'Account';
    S.settings.accounts.list.push({ id: acctId, name, type: m.newType });
    putDoc('accounts');
  }
  const fresh = mergeFiles(m.files, acctId).txns, have = new Set(D().items.map(t => t.i));
  const add = fresh.filter(t => !have.has(t.i));
  const by = {}; add.forEach(t => (by[t.d.slice(0, 7)] = by[t.d.slice(0, 7)] || []).push(t));
  const months = Object.keys(by).sort();
  m.step = 4; m.total = months.length; m.progress = 0; renderSheet();
  for (const mo of months) { m.progress++; renderSheet(); await writeMonth(mo, (S.tx[mo] || []).concat(by[mo])); }
  const allMonths = Array.from(new Set(fresh.map(t => t.d.slice(0, 7)))).sort();
  m.step = 3; m.added = add.length; m.dupes = fresh.length - add.length; m.latest = allMonths[allMonths.length - 1];
  m.monthsCovered = allMonths.length > 1 ? mLabel(allMonths[0]) + ' to ' + mLabel(allMonths[allMonths.length - 1]) : allMonths.length ? mLabel(allMonths[0]) : '';
  bump(); m.suggest = D().months.length >= 3 && !Object.keys(S.settings.budget.limits).length;
  renderSheet(); render();
}

/* ---------- export ---------- */
async function exportCsv() {
  const q = v => '"' + String(v).replace(/"/g, '""') + '"';
  const d = D(), rows = ['Date,Description,Amount,Category,Account'].concat(d.E.slice().sort((a, b) => a.d < b.d ? -1 : 1).map(t => [t.d, q(t.m), t.a.toFixed(2), q(t.cat), q((d.accts[t.ac] || {}).name || '')].join(',')));
  try {
    const dl = window.claude && window.claude.use ? await window.claude.use('downloads') : null;
    if (!dl) { toast('Downloads are not available in this view.'); return; }
    await dl.save({ filename: 'pocketbook-transactions.csv', data: rows.join('\n') });
    toast('Saved.');
  } catch (e) { if (!e || e.code !== 'declined') toast("Couldn't save the file here."); }
}

/* ---------- events ---------- */
document.addEventListener('click', async ev => {
  const el = ev.target.closest('[data-a]'); if (!el || el.disabled) return;
  const a = el.dataset.a, ds = el.dataset, d = S.loaded ? D() : null;
  switch (a) {
    case 'tab': S.tab = ds.tab; if (ds.tab !== 'activity') { S.catFilter = ''; S.q = ''; } render(); window.scrollTo(0, 0); break;
    case 'goTab': S.tab = ds.tab; S.catFilter = ds.cat || ''; S.allMonths = false; render(); window.scrollTo(0, 0); break;
    case 'goCat': S.tab = 'activity'; S.catFilter = ds.cat; S.allMonths = false; S.actLimit = 150; render(); window.scrollTo(0, 0); break;
    case 'prevMonth': { const i = d.months.indexOf(S.month); if (i > 0) { S.month = d.months[i - 1]; render(); } break; }
    case 'nextMonth': { const i = d.months.indexOf(S.month); if (i < d.months.length - 1) { S.month = d.months[i + 1]; render(); } break; }
    case 'toggleCats': S.showAll = !S.showAll; render(); break;
    case 'toggleTrend': S.trendTable = !S.trendTable; render(); break;
    case 'scope': S.allMonths = ds.v === 'all'; S.actLimit = 150; render(); break;
    case 'moreTx': S.actLimit += 150; $('#act-list').innerHTML = actList(); break;
    case 'recf': S.recFilter = ds.v; render(); break;
    case 'menu': openSheet('menu'); break;
    case 'closeSheet': closeSheet(); break;
    case 'import': closeSheet(); startImport(); break;
    case 'demo': closeSheet(); enterDemo(); break;
    case 'exitDemo': exitDemo(); break;
    case 'export': exportCsv(); break;
    case 'backup': saveBackup(); break;
    case 'shareBackup': shareBackup(); break;
    case 'restore': if (S.demo) exitDemo(); S.rst = {}; S.confirm = ''; openSheet('restore'); break;
    case 'doRestore': {
      const r = S.rst; if (!r || !r.data) break;
      if (d.E.length && S.confirm !== 'restore') { S.confirm = 'restore'; renderSheet(); break; }
      S.confirm = '';
      try { await window.HBLocal.replaceAll(r.data.docs); S.month = null; S.tab = 'overview'; closeSheet(); bump(); pickMonth(); render(); window.scrollTo(0, 0); toast('Restored ' + r.data.count + ' transactions.'); }
      catch (e) { console.error(e); toast("Couldn't restore that backup."); }
      S.rst = null; break;
    }
    case 'txn': openSheet('txn', { id: ds.id, mo: ds.mo }); break;
    case 'saveTxn': {
      const cat = $('#t-cat').value, all = $('#t-all') && $('#t-all').checked, t = d.E.find(x => x.i === ds.id); if (!t) break;
      const arr = (S.tx[ds.mo] || []).map(x => Object.assign({}, x)), it = arr.find(x => x.i === ds.id);
      if (all) { S.settings.rules.map[t.key] = cat; putDoc('rules'); if (it && it.c) { delete it.c; await writeMonth(ds.mo, arr); } }
      else if (it) { it.c = cat; await writeMonth(ds.mo, arr); }
      bump(); closeSheet(); render(); toast('Category updated.'); break;
    }
    case 'delTxn': {
      if (S.confirm !== 'del' + ds.id) { S.confirm = 'del' + ds.id; renderSheet(); break; }
      S.confirm = ''; await writeMonth(ds.mo, (S.tx[ds.mo] || []).filter(x => x.i !== ds.id)); closeSheet(); pickMonth(); render(); toast('Deleted.'); break;
    }
    case 'limit': openSheet('limit', { cat: ds.cat }); break;
    case 'saveLimit': { const v = num($('#lim').value); if (v > 0) S.settings.budget.limits[ds.cat] = Math.round(v); else delete S.settings.budget.limits[ds.cat]; putDoc('budget'); bump(); closeSheet(); render(); break; }
    case 'suggest': openSheet('suggest'); break;
    case 'applySuggest': {
      const sg = C.suggestBudget(d.E, NOWM).limits, cur = S.settings.budget.limits;
      S.settings.budget.limits = ds.mode === 'fill' ? Object.assign({}, sg, cur) : sg; putDoc('budget'); bump(); closeSheet(); render(); toast('Budget saved.'); break;
    }
    case 'clearBudget': if (S.confirm !== 'budget') { S.confirm = 'budget'; render(); break; } S.confirm = ''; S.settings.budget.limits = {}; putDoc('budget'); bump(); render(); break;
    case 'flag': { const m = S.settings.flags.map; if (m[ds.key] === ds.v) delete m[ds.key]; else m[ds.key] = ds.v; putDoc('flags'); bump(); render(); break; }
    case 'strategy': S.settings.goals.strategy = ds.v; putDoc('goals'); render(); break;
    case 'editDebt': if (!S.canWrite) break; openSheet('debt', { id: ds.id }); break;
    case 'editSaving': if (!S.canWrite) break; openSheet('saving', { id: ds.id, preset: ds.preset ? +ds.preset : 0 }); break;
    case 'saveDebt': {
      const name = $('#d-name').value.trim() || 'Debt', x = { id: ds.id || uid('d'), name, balance: Math.max(0, num($('#d-bal').value)), apr: Math.max(0, num($('#d-apr').value)), min: Math.max(0, num($('#d-min').value)) };
      const l = S.settings.goals.debts, i = l.findIndex(v => v.id === x.id); if (i >= 0) l[i] = x; else l.push(x);
      putDoc('goals'); closeSheet(); render(); break;
    }
    case 'delDebt': if (S.confirm !== 'dd' + ds.id) { S.confirm = 'dd' + ds.id; renderSheet(); break; } S.confirm = ''; S.settings.goals.debts = S.settings.goals.debts.filter(v => v.id !== ds.id); putDoc('goals'); closeSheet(); render(); break;
    case 'saveSaving': {
      const x = { id: ds.id || uid('s'), name: $('#s-name').value.trim() || 'Savings goal', target: Math.max(0, num($('#s-target').value)), saved: Math.max(0, num($('#s-saved').value)), monthly: Math.max(0, num($('#s-mo').value)) };
      const l = S.settings.goals.savings, i = l.findIndex(v => v.id === x.id); if (i >= 0) l[i] = x; else l.push(x);
      putDoc('goals'); closeSheet(); render(); break;
    }
    case 'delSaving': if (S.confirm !== 'ds' + ds.id) { S.confirm = 'ds' + ds.id; renderSheet(); break; } S.confirm = ''; S.settings.goals.savings = S.settings.goals.savings.filter(v => v.id !== ds.id); putDoc('goals'); closeSheet(); render(); break;
    case 'flip': S.imp.invert = !S.imp.invert; rebuildImport(); renderSheet(); break;
    case 'runImport': runImport(); break;
    case 'importDone': { const mo = S.imp && S.imp.latest; closeSheet(); if (mo) S.month = mo; S.tab = 'overview'; pickMonth(); render(); window.scrollTo(0, 0); break; }
    case 'importAnother': startImport(); break;
    case 'wipe': {
      if (S.confirm !== 'wipe') { S.confirm = 'wipe'; renderSheet(); break; }
      S.confirm = ''; const ms = Object.keys(S.tx); for (const mo of ms) await writeMonth(mo, []);
      S.month = null; closeSheet(); render(); toast('All transactions deleted.'); break;
    }
  }
});
document.addEventListener('input', ev => {
  const t = ev.target;
  if (t.id === 'q') { S.q = t.value; S.actLimit = 150; const l = $('#act-list'); if (l) l.innerHTML = actList(); }
  else if (t.id === 'extra') { S.settings.goals.extra = Math.max(0, num(t.value)); const p = $('#payoff'); if (p) p.innerHTML = payoffHtml(); }
});
document.addEventListener('change', ev => {
  const t = ev.target, im = S.imp;
  if (t.id === 'catf') { S.catFilter = t.value; S.actLimit = 150; const l = $('#act-list'); if (l) l.innerHTML = actList(); }
  else if (t.id === 'extra') { S.settings.goals.extra = Math.max(0, num(t.value)); putDoc('goals'); }
  else if (t.id === 'bigtext') { S.big = t.checked; document.documentElement.classList.toggle('big', S.big); try { localStorage.setItem('hb-big', S.big ? '1' : '0'); } catch (e) {} }
  else if (t.id === 'imp-file' && im) { loadFiles(t.files); }
  else if (t.id === 'rst-file') { loadBackupFile(t.files && t.files[0]); }
  else if (t.id === 'imp-acct' && im) { im.acct = t.value; renderSheet(); }
  else if (t.id === 'imp-name' && im) { im.newName = t.value; }
  else if (t.id === 'imp-type' && im) { im.newType = t.value; }
  else if (/^map-/.test(t.id) && im) {
    const v = +t.value, mp = im.files[0] && im.files[0].mapping; if (!mp) return;
    if (t.id === 'map-date') mp.date = v; else if (t.id === 'map-desc') mp.desc = v; else if (t.id === 'map-amt') mp.amount = v; else if (t.id === 'map-deb') mp.debit = v; else if (t.id === 'map-cred') mp.credit = v;
    rebuildImport(); renderSheet();
  }
});
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && S.sheet) closeSheet(); });

/* ---------- boot ---------- */
render();
initDb();
})();
