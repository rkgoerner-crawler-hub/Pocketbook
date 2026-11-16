/* Household Budget — core logic (no DOM). Works in browser (window.Core) and node (module.exports). */
(function (root) {
'use strict';

/* ---------- Categories ---------- */
const EXPENSE = ['Housing','Utilities','Groceries','Transportation','Insurance','Healthcare','Debt payments','Taxes','Home maintenance','Dining out','Subscriptions','Shopping','Entertainment','Travel','Personal care','Pets','Gifts & donations','Zelle & Venmo','Cash withdrawals','Fees & interest','Other'];
const INCOME = ['Paycheck','Social Security','Pension','Interest','Other income'];
const TRANSFER = 'Transfers';
const ESSENTIAL = new Set(['Housing','Utilities','Groceries','Transportation','Insurance','Healthcare','Debt payments','Taxes','Home maintenance']);
const DISCRETIONARY = new Set(['Dining out','Subscriptions','Shopping','Entertainment','Travel','Personal care']);
const ALL_CATS = EXPENSE.concat(INCOME, [TRANSFER]);
const kindOf = c => c === TRANSFER ? 'transfer' : INCOME.indexOf(c) >= 0 ? 'income' : 'expense';

const TRANSFER_RE = /(transfer|xfer|payment.{0,3}thank you|payment to crd|keep the change|autopay|auto pay|automatic payment|credit card (pay|pmt)|crd pmt|card pmt|payment received)/i;

const EXPENSE_RULES = [
 ['Fees & interest', /overdraft|\bnsf\b|insufficient funds|service charge|service fee|monthly (service|maintenance) fee|maintenance fee|atm fee|non-?network|foreign transaction|late fee|interest charge|finance charge|annual fee|wire fee|returned item|stop payment fee|paper statement fee/i],
 ['Housing', /\b(rent|mortgage|hoa|landlord|property tax|apartments?|apts|realty)\b|mr\.? cooper|rocket mortgage/i],
 ['Healthcare', /pharmacy|\bcvs\b|walgreens|rite aid|medical|dental|dentist|\bdr\.? |doctor|physician|hospital|urgent care|medicare|optum|labcorp|quest diag|copay|health|clinic|orthop|optical|vision|eye care|therapy|radiology|cardio|pediatric|derma|prescription|express scripts|caremark|humana|aetna|cigna|blue cross|bcbs|anthem|united ?health|kaiser|lenscrafters|hearing/i],
 ['Insurance', /geico|progressive|state farm|allstate|insurance|ins prem|liberty mutual|nationwide|farmers ins|travelers|usaa|aflac|metlife|prudential|aarp/i],
 ['Debt payments', /loan|navient|nelnet|sallie mae|mohela|great lakes|car payment|auto finance|ally fin|toyota fin|honda fin|ford credit|gm financial|santander cons|affirm|klarna|afterpay|sofi\b|lendingclub|upstart|best egg|onemain|avant\b|mariner/i],
 ['Taxes', /\birs\b|usataxpymt|tax payment|state tax|division of taxation|dept of rev|h&r block|turbotax/i],
 ['Utilities', /pseg|jcp&l|jcpl|atlantic city elec|electric|water|sewer|gas co\b|natural gas|south jersey gas|nj natural|comcast|xfinity|verizon|at&t|\batt\b|t-mobile|tmobile|spectrum|cox comm|optimum|altice|frontier comm|internet|cable|wireless|utility|utilities|sprint|mint mobile|cricket|boost mobile|straight talk|trash|waste (mgmt|management)|heating oil|propane/i],
 ['Groceries', /shoprite|acme|aldi|wegmans|giant|stop ?& ?shop|whole foods|trader joe|food lion|kroger|safeway|publix|market basket|grocery|supermarket|fresh market|sprouts|lidl|foodtown|pathmark|save a lot|h mart|instacart|costco whse|bj'?s wholesale|bjs whole/i],
 ['Dining out', /restaurant|mcdonald|burger king|wendy|starbucks|dunkin|pizza|diner|cafe|coffee|grubhub|doordash|uber ?eats|chipotle|taco bell|subway|panera|applebee|olive garden|kfc|domino|chick-?fil|popeyes|sonic drive|arby|five guys|ihop|denny|bakery|\bdeli\b|grill|bbq|sushi|tavern|\bpub\b|steak|bagel|wingstop|buffalo wild|texas roadhouse|red lobster|cracker barrel|panda express|jersey mike|firehouse/i],
 ['Transportation', /\bshell\b|exxon|mobil\b|sunoco|\bbp\b|wawa|speedway|gulf oil|citgo|chevron|valero|fuel|gas station|e-?zpass|\btolls?\b|\buber\b(?! ?eats)|lyft|septa|nj transit|amtrak|parking|\bmvc\b|motor vehicle|car wash|jiffy|auto ?zone|advance auto|pep boys|\btires?\b|firestone|midas|monro|napa auto|lukoil|getty|marathon|quick ?chek|sheetz|circle k/i],
 ['Subscriptions', /netflix|spotify|hulu|disney ?\+?|disneyplus|hbo|\bmax\.com|paramount|peacock|apple\.com\/bill|itunes|apple tv|google ?\*|google (storage|one)|youtube|amazon prime|prime ?video|audible|sirius|adobe|dropbox|icloud|patreon|nytimes|new york times|washington post|kindle|substack|microsoft ?\*|msft|openai|chatgpt|claude\.ai|norton|mcafee|lifelock|ancestry|membership|subscription|crunchyroll|ring protect|vudu|philo|fubo|sling|directv|dish network|newspaper|magazine|gym|planet fitness|la fitness|anytime fitness|ymca|fitness|peloton|weight watchers|noom|hellofresh|blue apron/i],
 ['Shopping', /amazon|amzn|target|walmart|wal-?mart|kohl|macy|ross stores|tj ?maxx|marshalls|home depot|lowe'?s|ebay|etsy|dollar tree|dollar general|five below|best buy|bed bath|big lots|burlington|old navy|jc ?penney|nordstrom|michaels|joann|hobby lobby|ikea|wayfair|qvc|hsn|shein|temu|zappos|staples|office depot|harbor freight|tractor supply|boscov|kmart|sears|bath & body/i],
 ['Entertainment', /cinema|\bamc\b|regal|theat(er|re)|ticketmaster|stubhub|casino|steam|playstation|xbox|nintendo|golf|bowling|lottery|lotto|bingo|museum|\bzoo\b|concert|live nation|movie|fandango|dave & buster|topgolf|arcade|\b(draftkings|fanduel)\b/i],
 ['Travel', /airline|delta air|united air|southwest|jetblue|american air|marriott|hilton|hyatt|expedia|booking\.com|airbnb|vrbo|hotel|motel|resort|cruise|carnival|royal caribbean|hertz|avis|enterprise rent|\btsa\b|airport/i],
 ['Personal care', /salon|barber|\bspa\b|\bnails?\b|beauty|sephora|ulta|hair|massage|waxing|cosmetic|supercuts|great clips|sport clips/i],
 ['Pets', /petco|petsmart|\bvet\b|veterinar|animal hospital|chewy|banfield|pet supplies|pets? plus|bark ?box|\brover\b/i],
 ['Gifts & donations', /donation|charity|red cross|st\.? jude|salvation army|church|parish|synagogue|temple|mosque|gofundme|\bgift|1-800-flowers|ftd|teleflora|edible arrangements|hallmark|united way|aspca|wounded warrior|habitat for|diocese|ministr/i],
 ['Zelle & Venmo', /zelle|venmo|cash ?app|apple cash|paypal (inst|transfer)/i],
 ['Cash withdrawals', /atm (withdrawal|w\/d|cash)|cash withdrawal|withdrawal.*atm|\batm\b|cash advance/i],
 ['Home maintenance', /plumb|electrician|handyman|lawn|landscap|pest|exterminat|hvac|roof|contractor|cleaning serv|maid|snow remov|locksmith|appliance|home warranty|american home shield|chimney|gutter/i]
];
const INCOME_RULES = [
 ['Social Security', /\bssa\b|social security|soc sec|treas 310|\bssi\b/i],
 ['Pension', /pension|annuity|retire|\bira\b|401k|\brmd\b|tiaa|va benefit|veterans|railroad|\btsp\b|thrift/i],
 ['Paycheck', /payroll|direct dep|dir dep|salary|paycheck|\badp\b|gusto|paychex|wages|employer|reg pay/i],
 ['Interest', /interest (paid|earned|payment|credit)|dividend|\bint paid|interest income|int\.? pd/i]
];

function matchExpense(desc) {
  for (let i = 0; i < EXPENSE_RULES.length; i++) if (EXPENSE_RULES[i][1].test(desc)) return EXPENSE_RULES[i][0];
  return null;
}
function builtinCategory(desc, amount, acctType) {
  if (TRANSFER_RE.test(desc)) return TRANSFER;
  if (amount > 0) {
    for (let i = 0; i < INCOME_RULES.length; i++) if (INCOME_RULES[i][1].test(desc)) return INCOME_RULES[i][0];
    const c = matchExpense(desc);
    if (c && c !== 'Zelle & Venmo' && c !== 'Cash withdrawals') return c;
    return acctType === 'credit' ? 'Other' : 'Other income';
  }
  return matchExpense(desc) || 'Other';
}

/* ---------- Merchant keys ---------- */
const STOP = new Set(['POS','DEBIT','CREDIT','CARD','PURCHASE','CHECKCARD','CHECK','RECURRING','AUTHORIZED','ON','ACH','WITHDRAWAL','ONLINE','PMT','DES','ID','INDN','CO','WEB','PPD','CCD','SQ','TST','OF','THE','AND','PAYMENT','TO','FROM','DEPOSIT','MOBILE','BILL','PAY','POINT','SALE','TRANSACTION','VISA','MASTERCARD','DDA','REF','NO','INC','LLC','CORP','THANK','YOU','WWW','HTTPS','HTTP']);
/* Strip bank boilerplate (Bank of America style prefixes and trailers) so the merchant is what is left. */
function baseDesc(desc) {
  const raw = String(desc || '');
  const s = raw.replace(/^(?:RECURRING\s+)?(?:CHECKCARD|PURCHASE|POS PURCHASE|DEBIT CARD PURCHASE)\s+\d{3,4}\s+/i, '')
    .replace(/\s+DES:.*$/i, '').replace(/\s+Conf(?:irmation)?\s*#.*$/i, '').trim();
  return s || raw;
}
function merchantKey(desc) {
  const ck = String(desc || '').match(/^\s*check\s*#?\s*(\d+)\s*$/i);
  if (ck) return 'CHECK ' + ck[1];
  const s = baseDesc(desc).toUpperCase().replace(/([A-Z])-([A-Z])/g, '$1$2').replace(/[^A-Z&' ]+/g, ' ');
  const words = s.split(/\s+/).filter(w => w.length > 1 && !STOP.has(w) && !/^X+$/.test(w));
  return words.slice(0, 2).join(' ') || 'UNKNOWN';
}
function cleanName(desc, key) {
  if (/^CHECK \d+$/.test(key || '')) return 'Check ' + key.slice(6);
  const n = baseDesc(desc).replace(/^BKOFAMERICA/i, 'Bank of America')
    .replace(/\*\S*\d\S*.*$/, '').replace(/\s+[#*]?[A-Za-z]?\d[\w\/-]*.*$/, '').replace(/[\s*#-]+$/, '').trim();
  return titleCase(n.length >= 3 ? n : (key || desc || 'Unknown')).replace(/\bAtm\b/g, 'ATM').replace(/\bOf\b/g, 'of').replace(/\.Com\b/g, '.com');
}
function titleCase(s) {
  return String(s).toLowerCase().replace(/\b([a-z])([a-z']*)/g, (m, a, b) => a.toUpperCase() + b);
}

/* ---------- CSV ---------- */
function parseCSV(text) {
  text = String(text || '').replace(/^﻿/, '');
  const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim() !== '');
  const sample = lines.slice(0, 10).join('\n');
  const counts = { ',': 0, ';': 0, '\t': 0 };
  for (const ch of sample) if (counts[ch] !== undefined) counts[ch]++;
  const delim = counts['\t'] > counts[','] && counts['\t'] > counts[';'] ? '\t' : counts[';'] > counts[','] ? ';' : ',';
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(x => x.trim() !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some(x => x.trim() !== '')) rows.push(row);
  return rows.map(r => r.map(x => x.trim()));
}

const MONTHS = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12 };
function pad(n) { return (n < 10 ? '0' : '') + n; }
function validYMD(y, m, d) {
  if (y < 1990 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return null;
  return y + '-' + pad(m) + '-' + pad(d);
}
function parseDate(s) {
  s = String(s || '').trim(); let m;
  if ((m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/))) return validYMD(+m[1], +m[2], +m[3]);
  if ((m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/))) {
    let y = +m[3]; if (y < 100) y += y < 70 ? 2000 : 1900;
    return validYMD(y, +m[1], +m[2]);
  }
  if ((m = s.match(/^([A-Za-z]{3,9})\.? (\d{1,2}),? (\d{4})/))) { const mo = MONTHS[m[1].slice(0, 4).toLowerCase()] || MONTHS[m[1].slice(0, 3).toLowerCase()]; return mo ? validYMD(+m[3], mo, +m[2]) : null; }
  if ((m = s.match(/^(\d{1,2}) ([A-Za-z]{3,9})\.? (\d{4})/))) { const mo = MONTHS[m[2].slice(0, 3).toLowerCase()]; return mo ? validYMD(+m[3], mo, +m[1]) : null; }
  return null;
}
function parseAmount(s) {
  s = String(s == null ? '' : s).trim();
  if (!s) return NaN;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  if (/-$/.test(s)) { neg = true; s = s.slice(0, -1); }
  if (/^-/.test(s)) { neg = !neg; s = s.slice(1); }
  if (/\bDR\b/i.test(s)) neg = true;
  if (/,\d{1,2}$/.test(s) && !/\./.test(s)) s = s.replace(/,(\d{1,2})$/, '.$1');
  s = s.replace(/[^0-9.]/g, '');
  if (!s || s === '.') return NaN;
  const v = parseFloat(s);
  if (!isFinite(v)) return NaN;
  return Math.round((neg ? -v : v) * 100) / 100;
}

function detectLayout(rows) {
  const KW = /date|description|amount|debit|credit|memo|payee|details|posting|transaction|merchant|withdrawal|deposit|balance/i;
  let h = -1;
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const hits = rows[i].filter(c => c && KW.test(c) && !parseDate(c) && isNaN(parseAmount(c))).length;
    if (hits >= 2) { h = i; break; }
  }
  const header = h >= 0 ? rows[h].map(x => x.toLowerCase()) : null;
  const data = rows.slice(h + 1);
  const ncol = Math.max.apply(null, data.slice(0, 50).map(r => r.length).concat([1]));
  const find = (list) => {
    if (!header) return -1;
    for (const p of list) { const i = header.findIndex(x => p instanceof RegExp ? p.test(x) : x === p); if (i >= 0) return i; }
    return -1;
  };
  let m = {
    date: find(['transaction date', 'trans date', 'trans. date', 'date', 'posting date', 'post date', 'posted date', /date/]),
    desc: find(['description', 'payee', 'merchant', 'transaction description', 'details', 'name', 'memo', /descr|payee|merchant|narrat/]),
    amount: find(['amount', /^amt|amount/]),
    debit: find([/debit|withdrawal|money out|paid out/]),
    credit: find([/credit|deposit|money in|paid in/])
  };
  if (m.amount >= 0 && (m.debit === m.amount || m.credit === m.amount)) { m.debit = -1; m.credit = -1; }
  if (m.amount >= 0) { /* single signed column wins */ if (m.debit >= 0 && m.credit >= 0) { m.debit = -1; m.credit = -1; } }
  if (!header) { /* infer by content */
    const sampleRows = data.slice(0, 30);
    let bestD = -1, bestDn = 0, bestA = -1, bestAn = 0, bestT = -1, bestTl = 0;
    for (let c = 0; c < ncol; c++) {
      const dn = sampleRows.filter(r => parseDate(r[c])).length;
      const an = sampleRows.filter(r => !parseDate(r[c]) && !isNaN(parseAmount(r[c])) && /\d\.\d\d|\d/.test(r[c] || '')).length;
      const tl = sampleRows.reduce((s, r) => s + ((r[c] && isNaN(parseAmount(r[c])) && !parseDate(r[c])) ? r[c].length : 0), 0);
      if (dn > bestDn) { bestDn = dn; bestD = c; }
      if (an > bestAn && /\./.test(sampleRows.map(r => r[c] || '').join(''))) { bestAn = an; bestA = c; }
      if (tl > bestTl) { bestTl = tl; bestT = c; }
    }
    m = { date: bestD, desc: bestT, amount: bestA, debit: -1, credit: -1 };
  }
  if (m.desc === m.date) m.desc = -1;
  return { headerRow: h, header: h >= 0 ? rows[h] : null, ncol: ncol, mapping: m, dataRows: data };
}

/* Build transactions from rows + mapping. flip: reverse sign. */
function buildTransactions(dataRows, mapping, flip) {
  const out = []; let skipped = 0;
  const useSplit = mapping.amount < 0 && (mapping.debit >= 0 || mapping.credit >= 0);
  for (const r of dataRows) {
    const d = parseDate(r[mapping.date]);
    if (!d) { skipped++; continue; }
    let a = NaN;
    if (useSplit) {
      const db = mapping.debit >= 0 ? parseAmount(r[mapping.debit]) : NaN;
      const cr = mapping.credit >= 0 ? parseAmount(r[mapping.credit]) : NaN;
      const dv = isNaN(db) ? 0 : Math.abs(db), cv = isNaN(cr) ? 0 : Math.abs(cr);
      if (isNaN(db) && isNaN(cr)) a = NaN; else a = Math.round((cv - dv) * 100) / 100;
    } else a = parseAmount(r[mapping.amount]);
    if (isNaN(a) || a === 0) { skipped++; continue; }
    if (flip) a = -a;
    const m = (mapping.desc >= 0 ? r[mapping.desc] : '') || 'Unknown';
    out.push({ d: d, a: a, m: String(m).replace(/\s+/g, ' ').trim().slice(0, 120) });
  }
  return { txns: out, skipped: skipped };
}
/* Guess whether signs need flipping: money out should be the majority sign. */
function guessFlip(txns, split) {
  if (split) return false;
  let p = 0, n = 0;
  txns.forEach(t => { if (t.a > 0) p++; else if (t.a < 0) n++; });
  return p + n >= 6 && p / (p + n) > 0.7;
}

/* ---------- IDs ---------- */
function hash(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
function assignIds(txns, accountId) {
  const seen = {};
  return txns.map(t => {
    const base = accountId + '|' + t.d + '|' + t.a.toFixed(2) + '|' + String(t.m).toUpperCase().replace(/[^A-Z0-9]+/g, '');
    const n = seen[base] = (seen[base] || 0) + 1;
    return { i: hash(base) + '-' + n, d: t.d, a: t.a, m: t.m, ac: accountId };
  });
}

/* ---------- Enrichment & summaries ---------- */
function enrich(items, ctx) {
  const rules = (ctx && ctx.rules) || {}, accts = (ctx && ctx.accounts) || {};
  const out = [];
  for (const t of items) {
    const key = merchantKey(t.m);
    const ac = accts[t.ac];
    const cat = t.c || rules[key] || builtinCategory(t.m, t.a, ac && ac.type);
    out.push({ i: t.i, d: t.d, a: t.a, m: t.m, ac: t.ac, key: key, cat: cat, kind: kindOf(cat), month: t.d.slice(0, 7), manual: !!t.c });
  }
  out.sort((x, y) => x.d < y.d ? 1 : x.d > y.d ? -1 : (x.i < y.i ? 1 : -1));
  return out;
}
function summarize(E, month) {
  const s = { income: 0, spend: 0, net: 0, byCat: {}, incomeByCat: {}, count: 0, lastDate: '' };
  for (const t of E) {
    if (t.month !== month) continue;
    s.count++; if (t.d > s.lastDate) s.lastDate = t.d;
    if (t.kind === 'income') { s.income += t.a; s.incomeByCat[t.cat] = (s.incomeByCat[t.cat] || 0) + t.a; }
    else if (t.kind === 'expense') { s.spend += -t.a; s.byCat[t.cat] = (s.byCat[t.cat] || 0) + -t.a; }
  }
  s.income = r2(s.income); s.spend = r2(s.spend); s.net = r2(s.income - s.spend);
  return s;
}
function r2(n) { return Math.round(n * 100) / 100; }
function monthsOf(E) { return Array.from(new Set(E.map(t => t.month))).sort(); }
function monthDiff(a, b) { return (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5) - +a.slice(5)); }
function addMonths(ym, n) { const y = +ym.slice(0, 4), m = +ym.slice(5) - 1 + n; const yy = y + Math.floor(m / 12), mm = ((m % 12) + 12) % 12; return yy + '-' + pad(mm + 1); }
function topMerchants(E, month, n) {
  const g = {};
  for (const t of E) if (t.month === month && t.kind === 'expense') {
    const x = g[t.key] || (g[t.key] = { key: t.key, name: cleanName(t.m, t.key), spend: 0, count: 0, cat: t.cat });
    x.spend += -t.a; x.count++;
  }
  return Object.values(g).filter(x => x.spend > 0).sort((a, b) => b.spend - a.spend).slice(0, n).map(x => (x.spend = r2(x.spend), x));
}

/* ---------- Recurring charges ---------- */
function median(a) { const s = a.slice().sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
const RECURRING_CATS = new Set(['Housing','Utilities','Insurance','Debt payments','Taxes','Subscriptions','Entertainment','Pets','Other']);
function detectRecurring(E) {
  const by = {};
  for (const t of E) if (t.kind === 'expense' && t.a < 0 && RECURRING_CATS.has(t.cat)) (by[t.key] || (by[t.key] = [])).push(t);
  const res = [];
  for (const key in by) {
    const list = by[key].slice().sort((a, b) => a.d < b.d ? -1 : 1);
    const ms = Array.from(new Set(list.map(t => t.month))).sort();
    const amts = list.map(t => -t.a), med = median(amts);
    const stable = list.filter(t => Math.abs(-t.a - med) <= Math.max(1, med * 0.15)).length / list.length;
    const perMonth = list.length / ms.length;
    const span = monthDiff(ms[0], ms[ms.length - 1]) + 1;
    const isSub = list[list.length - 1].cat === 'Subscriptions';
    if (ms.length < (isSub ? 2 : 3)) continue;
    if (stable < 0.7 || perMonth > 1.6 || ms.length / span < 0.6) continue;
    let increase = null; const n = amts.length;
    if (n >= 4) {
      const a0 = amts[0], a1 = amts[1], z0 = amts[n - 2], z1 = amts[n - 1];
      const steady = (x, y) => Math.abs(x - y) <= 0.03 * Math.max(x, y);
      if (steady(a0, a1) && steady(z0, z1) && z0 >= a0 * 1.05 && z0 - a0 >= 1) increase = { from: a1, to: z1, since: list[0].d.slice(0, 7) };
    }
    const cat = list[list.length - 1].cat;
    res.push({
      key: key, name: cleanName(list[list.length - 1].m, key), cat: cat, monthly: r2(increase ? amts[amts.length - 1] : med), annual: r2((increase ? amts[amts.length - 1] : med) * 12), count: list.length,
      lastDate: list[list.length - 1].d, firstDate: list[0].d,
      type: (cat === 'Subscriptions' || cat === 'Entertainment') ? 'subscription' : 'bill',
      increase: increase
    });
  }
  return res.sort((a, b) => b.annual - a.annual);
}

/* ---------- Budget ---------- */
function suggestBudget(E, nowMonth) {
  let ms = monthsOf(E);
  const complete = ms.filter(m => m !== nowMonth);
  ms = (complete.length >= 1 ? complete : ms).slice(-3);
  const limits = {};
  EXPENSE.forEach(cat => {
    let tot = 0;
    ms.forEach(m => { const s = summarize(E, m); tot += s.byCat[cat] || 0; });
    const avg = tot / (ms.length || 1);
    if (avg < 5) return;
    const v = DISCRETIONARY.has(cat) ? avg * 0.9 : avg;
    limits[cat] = Math.max(10, Math.ceil(v / 10) * 10);
  });
  return { limits: limits, months: ms };
}
function budgetStatus(spent, limit) {
  if (!(limit > 0)) return 'none';
  const r = spent / limit;
  return r > 1 ? 'over' : r >= 0.85 ? 'near' : 'ok';
}

/* ---------- Insights ---------- */
const STREAMING = /NETFLIX|HULU|DISNEY|HBO|MAX COM|PARAMOUNT|PEACOCK|APPLE TV|PRIME VIDEO|AMAZON PRIME|CRUNCHYROLL|FUBO|SLING|PHILO|YOUTUBE|DIRECTV/;
function insights(E, month, opts) {
  opts = opts || {};
  const out = [], now = opts.nowMonth, inProg = month === now;
  const s = summarize(E, month), ms = monthsOf(E), label = opts.label || (m => m);
  const prior = ms.filter(m => m < month).slice(-3);
  if (s.income > 0 && s.spend > s.income) out.push({ tone: 'warn', title: 'Spending is above income', body: (inProg ? 'So far in ' : 'In ') + label(month) + ', spending is ' + opts.money(s.spend - s.income) + ' more than money coming in.', tab: 'budget', action: 'Set a budget' });
  else if (s.income > 0 && s.net > 0 && !inProg) out.push({ tone: 'good', title: 'Ahead this month', body: 'You finished ' + label(month) + ' ' + opts.money(s.net) + ' ahead of spending.' });
  const fee = (s.byCat['Fees & interest'] || 0);
  if (fee > 0) {
    const od = E.filter(t => t.month === month && t.cat === 'Fees & interest' && t.a < 0 && /overdraft|\bnsf\b|insufficient/i.test(t.m)).reduce((x, t) => x - t.a, 0);
    out.push({ tone: 'warn', title: opts.money(fee) + ' in fees and interest', body: od > 0 ? 'That includes ' + opts.money(od) + ' in overdraft charges. A low-balance alert or a savings backup can prevent these.' : 'Look for fees your bank may waive if you ask.', tab: 'trim', action: 'See fees' });
  }
  if (prior.length >= 2) {
    const spikes = [];
    EXPENSE.forEach(cat => {
      if (cat === 'Other') return;
      const avg = prior.reduce((x, m) => x + (summarize(E, m).byCat[cat] || 0), 0) / prior.length;
      const cur = s.byCat[cat] || 0;
      if (cur > avg * 1.3 && cur - avg >= 50 && (!inProg || cur > avg)) spikes.push({ cat: cat, diff: cur - avg });
    });
    spikes.sort((a, b) => b.diff - a.diff).slice(0, 2).forEach(x => out.push({ tone: 'info', title: x.cat + ' is up ' + opts.money(x.diff), body: 'Higher than your recent monthly average in ' + label(month) + '.', tab: 'activity', cat: x.cat, action: 'See transactions' }));
  }
  const rec = opts.recurring || detectRecurring(E);
  const subs = rec.filter(r => r.type === 'subscription');
  if (subs.length >= 2) {
    const tot = subs.reduce((x, r) => x + r.monthly, 0);
    out.push({ tone: 'info', title: subs.length + ' subscriptions, ' + opts.money(tot) + ' a month', body: 'That is ' + opts.money(tot * 12) + ' a year. Check each one is still used.', tab: 'trim', action: 'Review them' });
  }
  const streams = rec.filter(r => STREAMING.test(r.key));
  if (streams.length >= 3) out.push({ tone: 'info', title: streams.length + ' streaming services', body: 'Rotating one service at a time is a common way to cut this cost.', tab: 'trim', action: 'Review them' });
  rec.filter(r => r.increase).slice(0, 2).forEach(r => out.push({ tone: 'warn', title: r.name + ' went up ' + opts.money(r.increase.to - r.increase.from) + ' a month', body: 'From ' + opts.money(r.increase.from) + ' to ' + opts.money(r.increase.to) + '. Worth a call to ask for a better rate, or a check that it still earns its place.', tab: 'trim', action: 'Review' }));
  const other = s.byCat['Other'] || 0;
  if (s.spend > 0 && other / s.spend > 0.15) out.push({ tone: 'info', title: 'Some spending is uncategorized', body: opts.money(other) + ' is in Other. Sorting it makes every chart more accurate.', tab: 'activity', cat: 'Other', action: 'Sort them' });
  return out;
}

/* ---------- Debts & goals ---------- */
function simulatePayoff(debts, extra, strategy, rollover) {
  const ds = debts.filter(d => d.balance > 0).map(d => ({ name: d.name, bal: d.balance, apr: d.apr || 0, min: Math.max(0, d.min || 0) }));
  if (!ds.length) return { months: 0, interest: 0, ok: true, order: [] };
  const totalPool = ds.reduce((x, d) => x + d.min, 0) + Math.max(0, extra || 0);
  let months = 0, interest = 0; const done = {}, order = [];
  while (ds.some(d => d.bal > 0.005) && months < 1200) {
    months++;
    ds.forEach(d => { if (d.bal > 0) { const i = d.bal * d.apr / 1200; d.bal += i; interest += i; } });
    const active = ds.filter(d => d.bal > 0.005);
    let pool = rollover === false ? active.reduce((x, d) => x + d.min, 0) : totalPool;
    active.forEach(d => { const p = Math.min(d.min, d.bal); d.bal -= p; pool -= p; });
    if (rollover !== false) {
      const target = ds.filter(d => d.bal > 0.005).sort(strategy === 'snowball' ? ((a, b) => a.bal - b.bal) : ((a, b) => b.apr - a.apr || a.bal - b.bal));
      for (const d of target) { if (pool <= 0) break; const p = Math.min(pool, d.bal); d.bal -= p; pool -= p; }
    }
    ds.forEach(d => { if (d.bal <= 0.005 && !done[d.name]) { done[d.name] = months; order.push({ name: d.name, month: months }); d.bal = 0; } });
  }
  return { months: months, interest: r2(interest), ok: !ds.some(d => d.bal > 0.005), order: order };
}
function monthsToGoal(target, saved, monthly) {
  const need = target - saved;
  if (need <= 0) return 0;
  if (!(monthly > 0)) return null;
  return Math.ceil(need / monthly);
}
function monthlyNeeded(target, saved, months) {
  const need = target - saved;
  if (need <= 0) return 0;
  return months > 0 ? need / months : null;
}
function essentialsPerMonth(E, nowMonth) {
  let ms = monthsOf(E); const complete = ms.filter(m => m !== nowMonth);
  ms = (complete.length ? complete : ms).slice(-3);
  if (!ms.length) return 0;
  let tot = 0; ms.forEach(m => { const s = summarize(E, m); ESSENTIAL.forEach(c => tot += s.byCat[c] || 0); });
  return r2(tot / ms.length);
}

/* ---------- Sample data ---------- */
function makeSample(today) {
  let seed = 20260601;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const between = (a, b) => Math.round((a + rnd() * (b - a)) * 100) / 100;
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const cur = today.getFullYear() + '-' + pad(today.getMonth() + 1), todayStr = cur + '-' + pad(today.getDate());
  const rows = [];
  for (let k = 5; k >= 0; k--) {
    const ym = addMonths(cur, -k), idx = 5 - k;
    const add = (day, desc, amt) => { const d = ym + '-' + pad(day); if (d <= todayStr) rows.push({ d: d, a: Math.round(amt * 100) / 100, m: desc }); };
    add(1, 'PENSION PAYMENT STATE RET SYS', 740);
    add(3, 'SSA TREAS 310 SOC SEC', 1842);
    add(1, 'RENT - MAPLE COURT APTS', -850);
    add(8, 'PSEG ELECTRIC AND GAS 0091822', -between(72, 128));
    add(12, 'COMCAST XFINITY 800-266-2278', idx < 3 ? -79.99 : -94.99);
    add(15, 'VERIZON WIRELESS PAYMENTS', -62.4);
    [4, 11, 18, 25].forEach(day => add(day + (rnd() < .5 ? 0 : 1), pick(['SHOPRITE OF PEMBERTON NJ', 'ACME MARKETS 4421', 'SHOPRITE OF MT HOLLY NJ']), -between(38, 96)));
    for (let j = 0; j < 5 + Math.floor(rnd() * 3); j++) add(2 + Math.floor(rnd() * 26), pick(['MCDONALDS F1234', 'DUNKIN #3345', 'DOORDASH*PIZZA PALACE', 'PANERA BREAD #2201', 'APPLEBEES 2231 NJ']), -between(7, 32));
    [5, 14, 24].forEach(day => add(day, 'SHELL OIL 57444', -between(28, 47)));
    add(19, 'E-ZPASS NJ', -25);
    add(20, 'GEICO AUTO INS', -118.5);
    add(9, 'CVS PHARMACY 02211', -between(8, 34)); add(22, 'CVS PHARMACY 02211', -between(8, 34));
    if (idx % 2 === 0) add(17, 'DR ANDERSON COPAY', -25);
    add(6, 'NETFLIX.COM', idx < 2 ? -15.49 : -17.99);
    add(7, 'SPOTIFY USA', -10.99);
    add(10, 'HULU 877-8244858', -17.99);
    add(10, 'DISNEY PLUS 888-905-7888', -13.99);
    add(13, 'AMAZON PRIME*2T4Y', -14.99);
    add(21, 'SIRIUSXM RADIO', -25.99);
    for (let j = 0; j < 2; j++) add(3 + Math.floor(rnd() * 24), pick(['AMAZON MKTP US*2K9', 'TARGET 00012345', 'DOLLAR TREE 4412']), -between(12, 64));
    add(1, 'MONTHLY SERVICE FEE', -12);
    if (idx === 1 || idx === 4) add(16, 'OVERDRAFT FEE', -35);
    if (idx % 2 === 1) add(23, 'NON-NETWORK ATM FEE', -3);
    add(14, 'ATM WITHDRAWAL CHASE', -100);
    add(18, 'ZELLE PAYMENT TO FAMILY', -75);
    add(2, 'CAPITAL ONE AUTO LOAN PMT', -312);
    add(27, 'CHURCH DONATION', -40);
    add(28, 'TRANSFER TO SAVINGS', -150);
  }
  const txns = assignIds(rows, 'demo');
  return {
    txns: txns,
    accounts: { list: [{ id: 'demo', name: 'Sample checking', type: 'checking' }] },
    budget: { limits: { Housing: 850, Groceries: 300, 'Dining out': 90, Utilities: 270, Transportation: 160, Subscriptions: 110, Shopping: 90 } },
    goals: { debts: [{ id: 'd1', name: 'Auto loan', balance: 4800, apr: 7.9, min: 312 }, { id: 'd2', name: 'Store card', balance: 2350, apr: 24.99, min: 70 }], savings: [{ id: 's1', name: 'Emergency fund', target: 5000, saved: 900, monthly: 150 }], extra: 0, strategy: 'avalanche' }
  };
}

root.Core = {
  EXPENSE, INCOME, TRANSFER, ALL_CATS, ESSENTIAL, DISCRETIONARY, kindOf, builtinCategory, merchantKey, baseDesc, titleCase, cleanName,
  parseCSV, parseDate, parseAmount, detectLayout, buildTransactions, guessFlip, assignIds, hash,
  enrich, summarize, monthsOf, monthDiff, addMonths, topMerchants, detectRecurring, suggestBudget, budgetStatus, insights,
  simulatePayoff, monthsToGoal, monthlyNeeded, essentialsPerMonth, makeSample, r2
};
if (typeof module !== 'undefined' && module.exports) module.exports = root.Core;
})(typeof window !== 'undefined' ? window : globalThis);
