/* Text helpers: {Me} filling, numbers and prices in Italian. */

/* ---------- text helpers ---------- */
function fill(s){
  if (s == null) return '';
  const me = S.playerName || 'Alex';
  let out = String(s).replaceAll('{Me}', me).replaceAll('{me}', me.toLowerCase());
  if (convo) out = out.replaceAll('{Npc}', convo.npc.name).replaceAll('{npc}', convo.npc.name.toLowerCase());
  return out;
}
const norm = s => s.toLowerCase().replace(/[^\p{L}\s()\/]/gu, ' ').replace(/\s+/g, ' ').trim();

const NUM_U = ['zero','uno','due','tre','quattro','cinque','sei','sette','otto','nove','dieci','undici','dodici','tredici','quattordici','quindici','sedici','diciassette','diciotto','diciannove'];
const NUM_T = ['','','venti','trenta','quaranta','cinquanta','sessanta','settanta','ottanta','novanta'];
function numIt(n){
  if (n < 20) return NUM_U[n];
  const t = Math.floor(n / 10), u = n % 10;
  let tens = NUM_T[t]; if (u === 1 || u === 8) tens = tens.slice(0, -1);
  let s = tens + (u ? NUM_U[u] : '');
  if (u === 3) s = s.slice(0, -3) + 'tré';
  return s;
}
function euroWords(c){ const e = Math.floor(c / 100), ct = c % 100; return (e === 1 ? 'un euro' : numIt(e) + ' euro') + (ct ? ' e ' + numIt(ct) : ''); }
const euroEn = c => '€' + (c / 100).toFixed(2);
const euroIt = c => '€' + (c / 100).toFixed(2).replace('.', ',');
const priceOf = order => order.reduce((a, w) => a + ITEM[w].price, 0);
/* Prices before Lesson 7 (numbers are taught there) are WRITTEN in digits, with the Italian decimal comma, and SPOKEN
   in words: euroNum(3150) = '31,50 euro', euroNum(300) = '3 euro'; priceIt(3150) = 'Sono 31,50 euro.', priceIt(100) =
   'È 1 euro.'. speak() reads every written price in words (sayIt: 'Sono 31,50 euro.' → 'Sono trentuno euro e cinquanta.'),
   so a line only needs its written form. From Lesson 7 on, lines write the numbers in words (numIt). */
const euroNum = c => (c % 100 ? (c / 100).toFixed(2).replace('.', ',') : String(c / 100)) + ' euro';
const priceIt = c => c === 100 ? 'È 1 euro.' : `Sono ${euroNum(c)}.`;
function sayIt(s){ return String(s).replace(/(\d+)(?:,(\d\d?))?\s*euro\b/g, (m, e, ct) => euroWords(+e * 100 + (ct ? +ct.padEnd(2, '0') : 0))); }
const listJoin = (arr, and) => arr.length === 1 ? arr[0] : arr.slice(0, -1).join(', ') + ` ${and} ` + arr[arr.length - 1];
const orderIt = order => cap(listJoin(order.map(w => `${ITEM[w].art} ${w}`), 'e')) + '.';
const orderEn = order => cap(listJoin(order.map(w => ITEM[w].en), 'and')) + '.';
