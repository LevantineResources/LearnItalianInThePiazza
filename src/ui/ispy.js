/* Vedo, vedo (I spy): an eye-level view of the museum square, generated from parts (docs/lessons/10-a-che-ora.md,
   "Vedo, vedo"). Bruno describes something in Italian, the player clicks on it. See CLAUDE.md ("Vedo, vedo").

   openISpy(opts)          open the game (a modal). opts, all optional:
     finds:10              correct finds to play
     start:{ h:15, m:0 }   the clock at the start (24-hour)
     step:6                minutes the clock moves on per correct find
     timeAsks:[2, 5, 8]    when Bruno asks "Che ore sono?": a number k = after the k-th find (at that time), a time
                           ('15:15' or { h, m }) = when the clock gets there (it stops on the way)
     bonus:true            offer the bonus round "Tocca a te!" after the last find (optional for the player)
     seed                  the scenes (same seed, same scenes for a layout); default random
     tiers                 the tier of each find, e.g. [1,1,1,2,2,2,3,3,4,4] (default: that, scaled to `finds`)
     found:0               resume after this many finds (the clock starts at start + found·step)
     endLine:{ it, en }    Bruno's line after the last find (default "Bravo!")
     doneLabel             the label of the button on the last screen (default "Close")
     studio:true           Studio's free play (a back button to Studio, "Play again")
     onFind(k, round)      after each correct find (k = finds so far)
     onClock({ h, m })     whenever the clock is set (sync the tower: setClock(h, m))
     onTimeAnswer(a)       every answer to "Che ore sono?": { asked:{h,m}, said, parsed:{h,m}|null, ok, tries, skipped? }
     onDone(result)        when the game is finished (after the bonus or skipping it):
                           { finds, misses, clock:{h,m}, time:{ asked, right, wrong }, bonus:{ played, tries, found } }
     onClose(state)        when the modal closes for any reason: { done, finds, clock:{h,m} }
   ispyUnlocked()          Studio shows its "Vedo, vedo" tab once Lesson 10 is completed (lessonCompleted(10))
   ISPY_VOCAB              every word the game uses, in the Vocabolario format (groups), for Lesson 10's chapter
   ispyRound(seed, k, tier, layout, avoid?)   the round generator (no drawing): { scene, desc, line:{it,en}, matches, clue }
   Tests: __dbg().ispy, __debug.ispy(opts), __debug.ispyUnlock(), __ispyGen(seed, k, tier, layout), __ispyAudit(). */

/* ---------- words ---------- */
const ISPY_N = {
  uomo:{ sg:'uomo', pl:'uomini', g:'m', en:['man', 'men'], person:true },
  donna:{ sg:'donna', pl:'donne', g:'f', en:['woman', 'women'], person:true },
  bambino:{ sg:'bambino', pl:'bambini', g:'m', en:['boy', 'boys'], person:true, child:true },
  bambina:{ sg:'bambina', pl:'bambine', g:'f', en:['girl', 'girls'], person:true, child:true },
  gatto:{ sg:'gatto', pl:'gatti', g:'m', en:['cat', 'cats'], animal:true },
  cane:{ sg:'cane', pl:'cani', g:'m', en:['dog', 'dogs'], animal:true },
  piccione:{ sg:'piccione', pl:'piccioni', g:'m', en:['pigeon', 'pigeons'], animal:true },
  bicicletta:{ sg:'bicicletta', pl:'biciclette', g:'f', en:['bicycle', 'bicycles'] },
  palloncino:{ sg:'palloncino', pl:'palloncini', g:'m', en:['balloon', 'balloons'] },
  ombrello:{ sg:'ombrello', pl:'ombrelli', g:'m', en:['umbrella', 'umbrellas'] },
  cappello:{ sg:'cappello', pl:'cappelli', g:'m', en:['hat', 'hats'] },
  borsa:{ sg:'borsa', pl:'borse', g:'f', en:['bag', 'bags'] },
  maglietta:{ sg:'maglietta', pl:'magliette', g:'f', en:['T-shirt', 'T-shirts'] },
  tavolo:{ sg:'tavolo', pl:'tavoli', g:'m', en:['table', 'tables'] },
  sedia:{ sg:'sedia', pl:'sedie', g:'f', en:['chair', 'chairs'] },
  fontana:{ sg:'fontana', pl:'fontane', g:'f', en:['fountain', 'fountains'] },
  albero:{ sg:'albero', pl:'alberi', g:'m', en:['tree', 'trees'] },
  museo:{ sg:'museo', pl:'musei', g:'m', en:['museum', 'museums'] },
  orologio:{ sg:'orologio', pl:'orologi', g:'m', en:['clock', 'clocks'] },
};
/* colours (Lesson 8): the four forms m, f, m pl, f pl. Hidden colours (no forms) are drawn but never named. */
const ISPY_COL = {
  rosso:{ f:['rosso', 'rossa', 'rossi', 'rosse'], en:'red', hex:'#cf3b2c' },
  bianco:{ f:['bianco', 'bianca', 'bianchi', 'bianche'], en:'white', hex:'#f7f4ec' },
  nero:{ f:['nero', 'nera', 'neri', 'nere'], en:'black', hex:'#2a2a30' },
  giallo:{ f:['giallo', 'gialla', 'gialli', 'gialle'], en:'yellow', hex:'#f4c430' },
  verde:{ f:['verde', 'verde', 'verdi', 'verdi'], en:'green', hex:'#3c9a50' },
  blu:{ f:['blu', 'blu', 'blu', 'blu'], en:'blue', hex:'#2d5fc4' },
  rosa:{ f:['rosa', 'rosa', 'rosa', 'rosa'], en:'pink', hex:'#f291b8' },
  _arancione:{ hex:'#f08a24' },
  _marrone:{ hex:'#8a5a34' }, _grigio:{ hex:'#8d8f96' }, _tigrato:{ hex:'#d98b3a' },
};
const ISPY_PREPS = {
  sotto:{ it:'sotto', en:'under', a:false }, sopra:{ it:'sopra', en:'on top of', a:false },
  dietro:{ it:'dietro', en:'behind', a:false }, davanti:{ it:'davanti a', en:'in front of', a:true },
  vicino:{ it:'vicino a', en:'near', a:true }, accanto:{ it:'accanto a', en:'next to', a:true },
};
const ispyVowel = w => /^[aeiouàèéìòù]/i.test(w);
const ispyIndef = k => { const N = ISPY_N[k]; return N.g === 'f' ? (ispyVowel(N.sg) ? "un'" + N.sg : 'una ' + N.sg) : (/^(s[^aeiou]|z|gn|ps)/.test(N.sg) ? 'uno ' : 'un ') + N.sg; };
const ispyDefArt = (k, pl) => { const N = ISPY_N[k], w = pl ? N.pl : N.sg;
  if (N.g === 'f') return pl ? 'le' : ispyVowel(w) ? "l'" : 'la';
  if (pl) return ispyVowel(w) || /^(s[^aeiou]|z|gn|ps)/.test(w) ? 'gli' : 'i';
  return ispyVowel(w) ? "l'" : /^(s[^aeiou]|z|gn|ps)/.test(w) ? 'lo' : 'il'; };
const ispyDef = (k, pl) => { const a = ispyDefArt(k, pl), w = pl ? ISPY_N[k].pl : ISPY_N[k].sg; return a.endsWith("'") ? a + w : a + ' ' + w; };
/* a + article: al, allo, alla, all', ai, agli, alle */
const ISPY_A = { il:'al', lo:'allo', la:'alla', "l'":"all'", i:'ai', gli:'agli', le:'alle' };
const ispyColW = (c, g, pl) => ISPY_COL[c] && ISPY_COL[c].f ? ISPY_COL[c].f[(g === 'f' ? 1 : 0) + (pl ? 2 : 0)] : null;
const ISPY_NAMED = Object.keys(ISPY_COL).filter(c => ISPY_COL[c].f);

/* the Italian and English for a description:
   d = { kind, n?, col?, with?:{ item, col? }, seat?:{ kind, n }, rel?:{ prep, anchor, def } } */
function ispyPhrase(d){
  const N = ISPY_N[d.kind], pl = (d.n || 1) > 1;
  let it = pl ? `${numIt(d.n)} ${N.pl}` : ispyIndef(d.kind);
  let en = pl ? `${['', 'one', 'two', 'three', 'four', 'five'][d.n]} ${N.en[1]}` : (ispyVowel(N.en[0]) ? 'an ' : 'a ') + N.en[0];
  if (d.col){ it += ' ' + ispyColW(d.col, N.g, pl); en = en.replace(/^(an?|\w+) /, (m, a) => `${a === 'an' ? 'a' : a} ${ISPY_COL[d.col].en} `); if (/^a [aeiou]/.test(en)) en = 'an' + en.slice(1); }
  if (d.with){
    const I = ISPY_N[d.with.item];
    it += ' con ' + ispyIndef(d.with.item) + (d.with.col ? ' ' + ispyColW(d.with.col, I.g, false) : '');
    const c = d.with.col ? ISPY_COL[d.with.col].en + ' ' : '';
    en += ' with ' + (ispyVowel(c || I.en[0]) ? 'an ' : 'a ') + c + I.en[0];
  }
  if (d.seat){ const S2 = ISPY_N[d.seat.kind]; it += ` con ${numIt(d.seat.n)} ${S2.pl}`; en += ` with ${['', 'one', 'two', 'three', 'four'][d.seat.n]} ${S2.en[1]}`; }
  if (d.rel){ const r = ispyRelPhrase(d.rel.prep, d.rel.anchor, d.rel.def); it += ' ' + r.it; en += ' ' + r.en; }
  return { it, en };
}
function ispyRelPhrase(prep, anchor, def){
  const P = ISPY_PREPS[prep], A = ISPY_N[anchor];
  const enA = (def ? 'the ' : ispyVowel(A.en[0]) ? 'an ' : 'a ') + A.en[0];
  if (!P.a) return { it:`${P.it} ${def ? ispyDef(anchor) : ispyIndef(anchor)}`, en:`${P.en} ${enA}` };
  const word = P.it.replace(/ a$/, '');
  if (!def) return { it:`${word} a ${ispyIndef(anchor)}`, en:`${P.en} ${enA}` };
  const art = ISPY_A[ispyDefArt(anchor)];
  return { it:`${word} ${art}${art.endsWith("'") ? '' : ' '}${A.sg}`, en:`${P.en} ${enA}` };
}

/* every word the game says or offers as a tile, in the Vocabolario format (for Lesson 10's chapter; ui/vocab.js) */
const ISPY_VOCAB = [
  { group:'Vedo, vedo · the game', note:'I spy, Italian style. Bruno says what he sees; you find it.', words:[
    { it:'Vedo, vedo…', en:'I spy… (I see, I see…)', say:'Vedo, vedo… un gatto!' },
    { it:'vedo', en:'I see' }, { it:'vedi', en:'you see (to a friend)', also:['Vedi?'] },
    { it:'Giusto!', en:'Right!' }, { it:'Esatto!', en:'Exactly!' }, { it:'Bravo!', en:'Well done!' },
    { it:'No, sbagliato!', en:'No, wrong!', also:['sbagliato'] }, { it:'Ritenta!', en:'Try again!' },
    { it:'È lì!', en:"It's there!" }, { it:'Tocca a te!', en:'Your turn!' },
    { it:'Eccolo! / Eccola!', en:'There it is! (there he / she is)', also:['eccoli', 'eccole'], note:'Eccoli / eccole for more than one.' },
    { it:'Non lo vedo!', en:"I can't see it!", also:['la', 'li', 'le'], note:'Non la vedo (a feminine thing), non li / le vedo (more than one).' },
    { it:'con', en:'with', say:'una donna con una maglietta blu' },
  ] },
  { group:'People', note:'Uomo has an irregular plural: l’uomo → gli uomini.', words:[
    { it:"l'uomo / gli uomini", g:'m', en:'the man / the men', also:['uomo', 'uomini'] },
    { it:'la donna / le donne', g:'f', en:'the woman / the women', also:['donna', 'donne'] },
    { it:'il bambino / i bambini', g:'m', en:'the boy, the child / the children', also:['bambino', 'bambini'] },
    { it:'la bambina / le bambine', g:'f', en:'the girl / the girls', also:['bambina', 'bambine'] },
  ] },
  { group:'Animals', words:[
    { it:'il gatto', g:'m', en:'the cat', also:['gatti'] }, { it:'il cane', g:'m', en:'the dog', also:['cani'] },
    { it:'il piccione', g:'m', en:'the pigeon', also:['piccioni'] },
  ] },
  { group:'Things in the square', words:[
    { it:'il tavolo', g:'m', en:'the table', also:['tavoli'] }, { it:'la sedia', g:'f', en:'the chair', also:['sedie'] },
    { it:'la bicicletta', g:'f', en:'the bicycle', also:['biciclette'] }, { it:'il palloncino', g:'m', en:'the balloon', also:['palloncini'] },
    { it:'il cappello', g:'m', en:'the hat' }, { it:'la borsa', g:'f', en:'the bag' }, { it:"l'ombrello", g:'m', en:'the umbrella', also:['ombrello'] },
    { it:'la fontana', g:'f', en:'the fountain' }, { it:"l'albero", g:'m', en:'the tree', also:['albero'] },
    { it:"l'orologio", g:'m', en:'the clock', also:['orologio'] }, { it:'il museo', g:'m', en:'the museum' },
  ] },
  { group:'Where?', note:'With a: vicino a + la fontana = vicino alla fontana (a + il = al, a + l’ = all’).', words:[
    { it:'sotto', en:'under', say:'sotto il tavolo' }, { it:'sopra', en:'on, on top of', say:'sopra la sedia' },
    { it:'vicino a', en:'near', say:'vicino alla fontana', also:['vicino', 'alla', 'al', "all'albero", "all'orologio", "all'uomo"] },
    { it:'davanti a', en:'in front of', say:'davanti alla fontana', also:['davanti'] },
    { it:'dietro', en:'behind', say:'dietro la fontana' }, { it:'accanto a', en:'next to', say:'accanto alla bicicletta', also:['accanto'] },
  ] },
  { group:'Telling the time (the game’s tiles)', note:'Hours are “le”: sono le tre. One o’clock is singular: è l’una.', words:[
    { it:'Che ore sono?', en:'What time is it?' }, { it:'Sono le …', en:"It's … o'clock", say:'Sono le tre.', also:['sono', 'le'] },
    { it:"È l'una", en:"It's one o'clock", also:['una'] }, { it:'e', en:'and, past (the hour)', quiz:false },
    { it:'meno', en:'to (the hour): minus' }, { it:'un quarto', en:'a quarter', also:['quarto'] }, { it:'mezza', en:'half (past)' },
    { it:'trenta', en:'thirty' }, { it:'quarantacinque', en:'forty-five' },
    { it:'ventuno, ventidue, ventitré, ventiquattro', en:'21, 22, 23, 24', also:['ventuno', 'ventidue', 'ventitré', 'ventiquattro'], quiz:false },
  ] },
];

/* ---------- random ---------- */
function ispyRng(seed){
  let a = (seed >>> 0) || 1;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const ispyPick = (R, a) => a[Math.floor(R() * a.length)];
const ispyShuffle = (R, a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const ispyHash = (...xs) => xs.reduce((h, x) => Math.imul(h ^ (typeof x === 'number' ? x : [...String(x)].reduce((q, c) => Math.imul(q ^ c.charCodeAt(0), 16777619), 2166136261)), 2654435761) >>> 0, 0x9e3779b9);

/* ---------- layouts ----------
   The view is drawn in logical units: wide (960 × 600, desktop) or tall (600 × 740, a phone held upright). Things stand on
   the ground at (gx, gz): gx 0..1 across, gz 0 (at the back, by the façades) .. 1 (at the front). */
const ISPY_LAYOUTS = {
  wide:{ W:960, H:600, base:338, y0:352, y1:586, s0:0.5, s1:1.0, people:[7, 10], tables:[2, 3], fountain:{ gx:0.5, gz:0.3 }, trees:[{ gx:0.035, gz:0.04 }, { gx:0.965, gz:0.06 }],
    museum:{ x0:318, x1:636, top:150, peak:84 }, tower:{ x0:654, x1:732, top:46, clock:{ x:693, y:122, r:34 } },
    left:{ x0:0, x1:318, top:122 }, right:{ x0:732, x1:960, top:150 }, cafe:'left', tableZones:[[0.07, 0.3], [0.72, 0.93]] },
  tall:{ W:600, H:740, base:398, y0:414, y1:726, s0:0.52, s1:0.92, people:[4, 6], tables:[1, 2], fountain:{ gx:0.5, gz:0.3 }, trees:[{ gx:0.06, gz:0.04 }],
    museum:{ x0:150, x1:430, top:222, peak:160 }, tower:{ x0:444, x1:520, top:96, clock:{ x:482, y:170, r:33 } },
    left:{ x0:0, x1:150, top:240 }, right:{ x0:520, x1:600, top:232 }, cafe:'left', tableZones:[[0.1, 0.9]] },
};
const ispyY = (L, gz) => L.y0 + gz * (L.y1 - L.y0);
const ispyS = (L, gz) => L.s0 + gz * (L.s1 - L.s0);

/* base sizes (scale 1), origin at the feet, up is negative */
const ISPY_BODY = {
  uomo:{ leg:70, torso:52, sh:21, hr:13 }, donna:{ leg:68, torso:48, sh:19, hr:12.5 },
  bambino:{ leg:42, torso:32, sh:14, hr:11 }, bambina:{ leg:42, torso:32, sh:14, hr:11 },
};
const ispyTall = b => b.leg + b.torso + 4 + 2 * b.hr;
const ISPY_SIZE = { gatto:[34, 42], cane:[62, 46], piccione:[28, 22], bicicletta:[104, 64], tavolo:[84, 64], sedia:[34, 78],
  borsa:[24, 20], cappello:[30, 14], palloncino:[28, 34], fontana:[250, 132], albero:[170, 300] };
const ISPY_FIXSCALE = { fontana:1.22, albero:1.35 };
const ISPY_SEAT = 40, ISPY_TABLE_TOP = 62, ISPY_RIM = 44;

/* ---------- geometry: where an entity is on the screen ---------- */
const ispyRect = (x, y, w, h) => ({ x, y, w, h });
const ispyIn = (r, px, py, m = 0) => px >= r.x - m && px <= r.x + r.w + m && py >= r.y - m && py <= r.y + r.h + m;
const ispyOverlap = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
const ispyUnion = rs => { const x0 = Math.min(...rs.map(r => r.x)), y0 = Math.min(...rs.map(r => r.y)), x1 = Math.max(...rs.map(r => r.x + r.w)), y1 = Math.max(...rs.map(r => r.y + r.h)); return ispyRect(x0, y0, x1 - x0, y1 - y0); };
/* sets e.x, e.y, e.s, e.rect (what you click), e.core (what hides things behind it), e.box (the space it takes) */
function ispyGeom(sc, e){
  const L = sc.L, by = id => sc.byId[id];
  if (e.holder != null){ ispyGeomHeld(sc, e, by(e.holder)); return; }
  let x, y, s;
  if (e.seat){
    const T = by(e.seat.table);
    s = T.s; x = T.x + (e.seat.pos === 'L' ? -56 : e.seat.pos === 'R' ? 56 : 0) * s;
    y = e.seat.pos === 'B' ? T.y - 14 * s : T.y;
    if (e.seat.pos === 'B') s *= 0.96;
  } else if (e.on != null || e.under != null){
    const A = by(e.on != null ? e.on : e.under);
    s = A.s; x = A.x + (e.ox || 0) * s; y = A.y;
    if (e.on != null) y -= (A.kind === 'tavolo' ? ISPY_TABLE_TOP + 2 : A.kind === 'sedia' ? ISPY_SEAT + 2 : A.kind === 'fontana' ? ISPY_RIM : 0) * s;
    else y -= 1 * s;
  } else { s = ispyS(L, e.gz) * (ISPY_FIXSCALE[e.kind] || 1); x = e.gx * L.W; y = ispyY(L, e.gz); }
  if (e.chairOf != null){ const T = by(e.chairOf); s = T.s; x = T.x + (e.side === 'L' ? -56 : 56) * s; y = T.y; }
  if (e.seat || e.chairOf != null) e.gz = by(e.seat ? e.seat.table : e.chairOf).gz;
  e.x = x; e.y = y; e.s = s;
  const B = ISPY_BODY[e.kind];
  if (B){
    const w = (2 * B.sh + 12) * s;
    let top = e.seat ? ISPY_SEAT + B.torso + 4 + 2 * B.hr : ispyTall(B);
    e.rect = ispyRect(x - w / 2, y - top * s, w, top * s);
    if (e.seat && e.seat.pos === 'B'){ e.rect.h -= 10 * s; }
    e.core = ispyRect(x - B.sh * s, y - top * s, 2 * B.sh * s, top * s);
  } else {
    const [w, h] = ISPY_SIZE[e.kind];
    e.rect = ispyRect(x - w * s / 2, y - h * s, w * s, h * s);
    if (e.kind === 'fontana'){ e.core = ispyRect(x - 120 * s, y - 62 * s, 240 * s, 62 * s); e.core2 = ispyRect(x - 13 * s, y - 128 * s, 26 * s, 70 * s); }
    else if (e.kind === 'albero'){ e.core = ispyRect(x - 12 * s, y - 160 * s, 24 * s, 160 * s); e.rect = ispyRect(x - 16 * s, y - 170 * s, 32 * s, 170 * s); e.crown = ispyRect(x - 85 * s, y - 300 * s, 170 * s, 150 * s); }
    else if (e.kind === 'tavolo'){ e.core = ispyRect(x - 42 * s, y - 70 * s, 84 * s, 16 * s); }
    else if (e.kind === 'sedia'){ e.core = ispyRect(x - 16 * s, y - 78 * s, 32 * s, 40 * s); }
    else if (e.kind === 'bicicletta'){ e.core = ispyRect(x - 40 * s, y - 50 * s, 80 * s, 40 * s); }
    else e.core = e.rect;
  }
  e.box = e.rect;
}
/* things a person has: a hat, a bag, an umbrella, a balloon */
function ispyGeomHeld(sc, e, P){
  const B = ISPY_BODY[P.kind], s = P.s, side = e.side || 1, top = P.seat ? ISPY_SEAT + B.torso + 4 + 2 * B.hr : ispyTall(B);
  const hx = P.x + side * (B.sh + 5) * s, hy = P.y - (P.seat ? ISPY_SEAT + 8 : B.leg - 2) * s;   // the hand
  e.s = s; e.hand = [hx, hy];
  if (e.kind === 'cappello'){ e.x = P.x; e.y = P.y - (top - 2) * s; e.rect = ispyRect(P.x - (B.hr + 8) * s, P.y - (top + 11) * s, (2 * B.hr + 16) * s, 15 * s); }
  else if (e.kind === 'borsa'){ e.x = P.x + side * (B.sh + 6) * s; e.y = P.y - (P.seat ? ISPY_SEAT - 2 : B.leg - 18) * s; e.rect = ispyRect(e.x - 10 * s, e.y - 16 * s, 20 * s, 17 * s); }
  else if (e.kind === 'ombrello'){ e.x = P.x + side * 10 * s; e.y = P.y - (top + 8) * s; e.rect = ispyRect(e.x - 48 * s, e.y - 38 * s, 96 * s, 40 * s); }
  else if (e.kind === 'palloncino'){ e.x = hx + side * 10 * s; e.y = hy - 76 * s; e.rect = ispyRect(e.x - 14 * s, e.y - 16 * s, 28 * s, 34 * s); }
  e.core = e.rect; e.box = e.rect;
}

/* ---------- relations (the generator and the bonus round use the same ones) ---------- */
const ISPY_FREE = e => e.holder == null && !e.seat && e.on == null && e.under == null && e.chairOf == null && !e.fixed;
function ispyRel(sc, e, prep, a){
  if (e === a || e.holder != null || a.holder != null) return false;
  if (prep === 'sotto') return e.under === a.id;
  if (prep === 'sopra') return e.on === a.id;
  if (e.seat || e.chairOf != null || e.kind === 'tavolo') return false;
  if (e.under != null || e.on != null) return prep === 'vicino' && (e.under === a.id || e.on === a.id);
  const dz = e.gz - (a.gz != null ? a.gz : 0), s = (e.s + a.s) / 2;
  const half = (a.kind === 'fontana' ? 112 : a.kind === 'albero' ? 30 : ISPY_SIZE[a.kind] ? ISPY_SIZE[a.kind][0] / 2 : 20) * a.s;
  const dx = Math.abs(e.x - a.x), gap = Math.max(0, dx - half - (e.rect.w / 2)) / s;
  if (prep === 'dietro') return ['fontana', 'albero'].includes(a.kind) && dz < -0.02 && dz > -0.16 && dx < half * 0.8;
  if (prep === 'davanti') return ['fontana', 'albero', 'bicicletta', 'tavolo'].includes(a.kind) && dz > 0.04 && dz < 0.3 && dx < half * 0.85;
  if (prep === 'accanto') return Math.abs(dz) < 0.07 && gap < 26 && dx > half * 0.6;
  if (prep === 'vicino') return Math.hypot(gap, dz * 320) < 70;
  return false;
}
const ISPY_ANCHORS = ['fontana', 'albero', 'tavolo', 'sedia', 'bicicletta', 'museo'];
/* the entities a description matches (for n > 1: all of that kind, when there are exactly n) */
function ispyMatch(sc, d){
  let m = sc.ents.filter(e => e.kind === d.kind && !e.hidden);
  if (d.col) m = m.filter(e => e.col === d.col);
  if (d.with) m = m.filter(e => d.with.item === 'maglietta' ? !!ISPY_BODY[e.kind] && (!d.with.col || e.shirt === d.with.col)
    : sc.ents.some(a => a.holder === e.id && a.kind === d.with.item && (!d.with.col || a.col === d.with.col)));
  if (d.seat) m = m.filter(t => { const occ = sc.ents.filter(p => p.seat && p.seat.table === t.id); return occ.length === d.seat.n && occ.every(p => p.kind === d.seat.kind); });
  if (d.rel) m = m.filter(e => sc.ents.some(a => a.kind === d.rel.anchor && ispyRel(sc, e, d.rel.prep, a)));
  if ((d.n || 1) > 1) return m.length === d.n ? m : [];
  return m;
}

/* ---------- the scene: a cast of people, animals and things ---------- */
const ISPY_SKIN = ['#f3cfae', '#e6b48c', '#cf9668', '#a8714a', '#7d4e30'];
const ISPY_HAIR = ['#2b1d14', '#4e3220', '#7a4f2a', '#c9a15a', '#d9d4cc', '#161616', '#a2462a'];
const ISPY_LEGS = ['#2f3b5c', '#3b3b42', '#6b5a44', '#8a8f99', '#1f2a44', '#55624a', '#c9b48a'];
const ISPY_ACC = { cappello:['rosso', 'nero', 'bianco', 'giallo', 'blu', 'verde'], borsa:['rosso', 'nero', 'giallo', 'bianco', 'blu', 'verde', 'rosa', '_arancione'],
  ombrello:['rosso', 'giallo', 'blu', 'verde', 'rosa', 'nero'], palloncino:['rosso', 'giallo', 'blu', 'verde', 'rosa', '_arancione'],
  bicicletta:['rosso', 'blu', 'giallo', 'verde', 'nero', 'bianco'], gatto:['nero', 'bianco', '_grigio', '_tigrato'], cane:['bianco', 'nero', '_marrone', '_marrone'] };
const ISPY_PEOPLE = ['uomo', 'uomo', 'donna', 'donna', 'bambino', 'bambina'];

function ispyNewScene(L){
  const sc = { L, ents:[], byId:{}, next:1 };
  sc.add = o => { const e = { id:sc.next++, ph:(sc.next * 2.399) % (Math.PI * 2), ...o }; sc.ents.push(e); sc.byId[e.id] = e; return e; };
  return sc;
}
function ispyPerson(R, kind, o = {}){
  const kid = ISPY_N[kind].child;
  return { kind, shirt:o.shirt || ispyPick(R, [...ISPY_NAMED, '_arancione', '_grigio']), legs:ispyPick(R, ISPY_LEGS), skin:ispyPick(R, ISPY_SKIN),
    hair:kid ? ispyPick(R, ISPY_HAIR.slice(0, 5)) : ispyPick(R, ISPY_HAIR), hairStyle:Math.floor(R() * 3),
    skirt:(kind === 'donna' || kind === 'bambina') && R() < 0.55, flip:R() < 0.5 ? -1 : 1, ...o };
}
/* gives a person things: a hat, a bag, an umbrella (adults), a balloon (children) */
function ispyDress(sc, R, p, o = {}){
  const kid = ISPY_N[p.kind].child, side = p.flip || 1, no = sc.no || {};
  ['hat', 'umb', 'bag', 'balloon'].forEach(k => { if (no[k] && o[k] == null) o = { ...o, [k]:false }; });
  if (o.hat || (o.hat == null && R() < 0.3)) sc.add({ kind:'cappello', holder:p.id, col:o.hat || ispyPick(R, ISPY_ACC.cappello) });
  if (!kid && !p.seat && (o.umb || (o.umb == null && R() < 0.14))) sc.add({ kind:'ombrello', holder:p.id, side, col:o.umb || ispyPick(R, ISPY_ACC.ombrello) });
  if (!kid && (o.bag || (o.bag == null && R() < (p.kind === 'donna' ? 0.45 : 0.18)))) sc.add({ kind:'borsa', holder:p.id, side:-side, col:o.bag || ispyPick(R, ISPY_ACC.borsa) });
  if (kid && !p.seat && (o.balloon || (o.balloon == null && R() < 0.35))) sc.add({ kind:'palloncino', holder:p.id, side, col:o.balloon || ispyPick(R, ISPY_ACC.palloncino) });
}
const ispyHeld = (sc, p) => sc.ents.filter(e => e.holder === p.id);
function ispyRefresh(sc, e){
  ispyGeom(sc, e); ispyHeld(sc, e).forEach(h => ispyGeom(sc, h));
  const parts = [e.rect, ...ispyHeld(sc, e).map(h => h.rect)];
  if (e.kind === 'tavolo') sc.ents.filter(c => c.chairOf === e.id || (c.seat && c.seat.table === e.id)).forEach(c => { ispyGeom(sc, c); ispyHeld(sc, c).forEach(h => ispyGeom(sc, h)); parts.push(c.rect, ...ispyHeld(sc, c).map(h => h.rect)); });
  e.box = ispyUnion(parts);
}
/* is there room for e (its box) among the things already placed? */
function ispyRoom(sc, e, allow = []){
  const L = sc.L, b = e.box;
  if (b.x < 4 || b.x + b.w > L.W - 4 || b.y < 6 || b.y + b.h > L.H - 2) return false;
  if (ispyOverlap(b, sc.clockRect) > 0) return false;
  for (const o of sc.ents){
    if (o === e || o.holder != null || !o.placed || allow.includes(o.id)) continue;
    if (o.on != null || o.under != null || o.seat || o.chairOf != null) continue;
    const ob = o.kind === 'albero' ? o.rect : o.kind === 'fontana' ? ispyUnion([o.core, o.core2]) : o.box;
    const ov = ispyOverlap(b, ob);
    if (ov > 0.06 * Math.min(b.w * b.h, ob.w * ob.h)) return false;
    if (o.kind === 'albero' && ispyOverlap(b, o.crown) > 0.25 * b.w * b.h) return false;
  }
  return true;
}
/* put e somewhere free (gx in zone, gz in [z0, z1]); returns false (and removes e) if there is no room */
function ispyPlace(sc, R, e, zone = [0.05, 0.95], z = [0, 1], tries = 40, allow){
  for (let t = 0; t < tries; t++){
    e.gx = zone[0] + R() * (zone[1] - zone[0]); e.gz = z[0] + R() * (z[1] - z[0]);
    ispyRefresh(sc, e);
    if (ispyRoom(sc, e, allow)){ e.placed = true; return true; }
  }
  ispyRemove(sc, e); return false;
}
function ispyRemove(sc, e){
  const gone = new Set([e.id]);
  let more = true;
  while (more){ more = false; sc.ents.forEach(o => { if (!gone.has(o.id) && (gone.has(o.holder) || gone.has(o.on) || gone.has(o.under) || gone.has(o.chairOf) || (o.seat && gone.has(o.seat.table)))){ gone.add(o.id); more = true; } }); }
  sc.ents = sc.ents.filter(o => !gone.has(o.id)); gone.forEach(id => delete sc.byId[id]);
}

/* the fixed things (fountain, trees, the museum and the clock as anchors), then the café tables */
function ispyFixtures(sc, R){
  const L = sc.L, c = L.tower.clock;
  sc.clockRect = ispyRect(c.x - c.r - 6, c.y - c.r - 6, 2 * c.r + 12, 2 * c.r + 12);
  sc.museum = sc.add({ kind:'museo', fixed:true, placed:true, x:(L.museum.x0 + L.museum.x1) / 2, y:L.base, s:1, gz:-0.2,
    rect:ispyRect(L.museum.x0, L.museum.peak, L.museum.x1 - L.museum.x0, L.base - L.museum.peak) });
  sc.clock = sc.add({ kind:'orologio', fixed:true, placed:true, x:c.x, y:c.y, s:1, gz:-0.2, rect:sc.clockRect });
  [sc.museum, sc.clock].forEach(e => { e.core = e.rect; e.box = e.rect; });
  const f = sc.add({ kind:'fontana', fixed:true, gx:L.fountain.gx + (R() - 0.5) * 0.04, gz:L.fountain.gz + (R() - 0.5) * 0.06 });
  ispyRefresh(sc, f); f.placed = true; sc.fountain = f;
  L.trees.forEach(t => { const e = sc.add({ kind:'albero', fixed:true, gx:t.gx, gz:t.gz, leaf:R() }); ispyRefresh(sc, e); e.placed = true; });
}
/* a café table with two chairs (and a seat at the back): seats = [kind or null for L, R, B] */
function ispyTable(sc, R, seats, zone){
  const L = sc.L, t = sc.add({ kind:'tavolo' });
  ['L', 'R'].forEach(side => sc.add({ kind:'sedia', chairOf:t.id, side }));
  const people = [];
  seats.forEach((k, i) => { if (!k) return; const p = sc.add(ispyPerson(R, k, { seat:{ table:t.id, pos:['L', 'R', 'B'][i] } })); people.push(p); });
  const z = L.tableZones, zz = zone || ispyPick(R, z);
  if (!ispyPlace(sc, R, t, zz, [0.08, 0.8], 50)) return null;
  people.forEach(p => ispyDress(sc, R, p, { umb:false, balloon:false }));
  ispyRefresh(sc, t);
  return t;
}
const ispyChairs = (sc, t) => sc.ents.filter(c => c.chairOf === t.id);
const ispyFreeChairs = sc => sc.ents.filter(c => c.kind === 'sedia' && !sc.ents.some(p => p.seat && p.seat.table === c.chairOf && p.seat.pos === c.side));
const ispyOcc = (sc, t) => sc.ents.filter(p => p.seat && p.seat.table === t.id);

/* ---------- the round generator ----------
   A round = a scene + a description Bruno can say of something in it, of the round's tier:
   1 nouns (un gatto), 2 colours with agreement (una donna con una maglietta blu), 3 numbers and plurals (un tavolo con tre
   uomini, due bambini), 4 prepositions (un gatto sotto un tavolo). The cast is random, with a few things added so that the
   tier has something to say; every candidate description is checked with ispyMatch (it must pick out exactly the target,
   or for a plural, exactly that group) and the target must be visible. If nothing fits, another cast is drawn. */
const ISPY_T1 = ['gatto', 'cane', 'piccione', 'bicicletta', 'palloncino', 'ombrello', 'cappello', 'borsa'];
function ispyRound(seed, k, tier, layout = 'wide', avoid = []){
  const L = ISPY_LAYOUTS[layout] || ISPY_LAYOUTS.wide;
  for (let attempt = 0; attempt < 80; attempt++){
    const R = ispyRng(ispyHash(seed, k, tier, layout, attempt));
    const pool = ISPY_T1.filter(x => !avoid.includes(x)), want = tier === 1 ? ispyPick(R, pool.length ? pool : ISPY_T1) : null;
    const sc = ispyCast(R, tier, L, want);
    const cands = ispyCandidates(sc, tier).filter(c => ispyValid(sc, c, tier));
    if (!cands.length) continue;
    const w = c => (want && c.d.kind === want ? 6 : 1) * (avoid.includes(c.d.kind) ? 0.15 : 1) * (c.d.rel && avoid.includes(c.d.rel.prep) ? 0.1 : 1) * (c.d.kind === 'piccione' && c.d.rel ? 0.4 : 1) * (c.d.kind === 'piccione' && tier > 1 ? 0.5 : 1) * (c.w || 1);
    const tot = cands.reduce((a, c) => a + w(c), 0);
    let r = R() * tot, c = cands[0];
    for (const x of cands){ r -= w(x); if (r <= 0){ c = x; break; } }
    const line = ispyPhrase(c.d);
    const round = { seed, k, tier, layout, attempt, scene:sc, desc:c.d, matches:c.m.map(e => e.id), target:c.m[0].id,
      line:{ it:`Vedo, vedo… ${line.it}!`, en:`I spy… ${line.en}!` }, phrase:line };
    round.clue = ispyClue(sc, round);
    return round;
  }
  return null;
}
function ispyCast(R, tier, L, want){
  const sc = ispyNewScene(L);
  /* tier 1: the wanted thing must be the only one of its kind, so nobody else gets one */
  const accKey = { cappello:'hat', borsa:'bag', ombrello:'umb', palloncino:'balloon' };
  sc.no = want && accKey[want] ? { [accKey[want]]:true } : {};
  ispyFixtures(sc, R);
  const nT = L.tables[0] + Math.floor(R() * (L.tables[1] - L.tables[0] + 1));
  const zones = ispyShuffle(R, L.tableZones);
  const rnd = () => R() < 0.62 ? ispyPick(R, ['uomo', 'uomo', 'donna', 'donna', 'bambino', 'bambina']) : null;
  /* tier 3: tables of two or three of a kind */
  for (let i = 0; i < nT; i++){
    let seats;
    if (tier === 3 && i < 2){ const k = ispyPick(R, ['uomo', 'donna', 'uomo', 'donna', 'bambino']), n = R() < 0.5 ? 2 : 3;
      seats = n === 3 ? [k, k, k] : ispyShuffle(R, [k, k, null]); if (i === 1 && R() < 0.5) seats[Math.floor(R() * 3)] = ispyPick(R, ['uomo', 'donna']); }
    else seats = [rnd(), rnd(), R() < 0.3 ? rnd() : null];
    ispyTable(sc, R, seats, zones[i % zones.length]);
  }
  const tables = sc.ents.filter(e => e.kind === 'tavolo');
  /* a free-standing person (dressed first, so their hat, umbrella or balloon needs room too), animal or thing */
  const free = (kind, o = {}, z = [0, 1], zone = [0.05, 0.95], dress = {}) => {
    const e = sc.add(ISPY_BODY[kind] ? ispyPerson(R, kind, o) : { kind, flip:R() < 0.5 ? -1 : 1, ...o });
    if (ISPY_BODY[kind]) ispyDress(sc, R, e, dress);
    return ispyPlace(sc, R, e, zone, z) ? e : null;
  };
  const animal = (kind, o = {}, z, zone) => free(kind, { col:kind === 'piccione' ? null : ispyPick(R, ISPY_ACC[kind] || ['_grigio']), ...o }, z, zone);
  const counts = {};
  /* things put in relation to something (tier 4 mostly; now and then in the others too) */
  const relPlace = [];
  if (tier === 4) relPlace.push(...ispyShuffle(R, ['sotto', 'sopra', 'sopraF', 'vicino', 'davanti', 'dietro', 'accanto']).slice(0, 3));
  else if (R() < 0.4) relPlace.push(ispyPick(R, ['sopra', 'sotto', 'sopraF']));
  const relKinds = [];
  for (const r of relPlace){
    if (r === 'sotto' && tables.length){ const t = ispyPick(R, tables), k = ispyPick(R, ['gatto', 'cane', 'borsa']);
      if (want === k) continue;
      if (k === 'borsa' && R() < 0.5 && ispyFreeChairs(sc).length) sc.add({ kind:'borsa', under:ispyPick(R, ispyFreeChairs(sc)).id, col:ispyPick(R, ISPY_ACC.borsa), ox:0 });
      else sc.add({ kind:k, under:t.id, ox:(R() < 0.5 ? -1 : 1) * (k === 'cane' ? 6 : 14), col:k === 'borsa' ? ispyPick(R, ISPY_ACC.borsa) : ispyPick(R, ISPY_ACC[k]), flip:R() < 0.5 ? -1 : 1 });
      relKinds.push(k); }
    else if (r === 'sopra'){ const ch = ispyFreeChairs(sc);
      const onT = R() < 0.5 && tables.length, a = onT ? ispyPick(R, tables) : ch.length ? ispyPick(R, ch) : null;
      if (a){ const k = ispyPick(R, onT ? ['gatto', 'borsa', 'cappello', 'piccione'] : ['gatto', 'borsa', 'cappello']);
        if (want === k) continue;
        sc.add({ kind:k, on:a.id, ox:onT ? (R() - 0.5) * 30 : 0, col:ISPY_ACC[k] ? ispyPick(R, ISPY_ACC[k]) : null, flip:R() < 0.5 ? -1 : 1 }); relKinds.push(k); } }
    else if (r === 'sopraF'){ const k = ispyPick(R, ['piccione', 'piccione', 'gatto']); if (want === k) continue;
      sc.add({ kind:k, on:sc.fountain.id, ox:(R() < 0.5 ? -1 : 1) * (50 + R() * 50), flip:R() < 0.5 ? -1 : 1, col:ispyPick(R, ISPY_ACC.gatto) }); relKinds.push(k); }
    else {
      const f = sc.fountain, trees = sc.ents.filter(e => e.kind === 'albero');
      const anchor = r === 'dietro' || r === 'davanti' ? f : ispyPick(R, [f, ...trees, ...sc.ents.filter(e => e.kind === 'bicicletta')]);
      const k = ispyPick(R, r === 'dietro' ? ['bambino', 'bambina', 'uomo', 'donna'] : r === 'davanti' ? ['bambino', 'bambina', 'cane', 'uomo', 'donna'] : ['cane', 'gatto', 'bambino', 'bambina', 'bicicletta']);
      if (want === k) continue;
      const e = sc.add(ISPY_BODY[k] ? ispyPerson(R, k) : { kind:k, col:ISPY_ACC[k] ? ispyPick(R, ISPY_ACC[k]) : null, flip:R() < 0.5 ? -1 : 1 });
      if (ISPY_BODY[k]) ispyDress(sc, R, e, { umb:false, balloon:r === 'dietro' ? false : undefined });
      const dz = r === 'dietro' ? -(0.05 + R() * 0.05) : r === 'davanti' ? 0.1 + R() * 0.14 : (R() - 0.5) * 0.08;
      const half = anchor.kind === 'fontana' ? 112 : anchor.kind === 'albero' ? 30 : 50;
      let ok = false;
      for (let t = 0; t < 30 && !ok; t++){
        const side = R() < 0.5 ? -1 : 1;
        e.gz = Math.max(0, Math.min(1, anchor.gz + dz + (R() - 0.5) * 0.02));
        const s = ispyS(L, e.gz);
        const off = r === 'dietro' || r === 'davanti' ? (R() - 0.5) * half * 1.1 : side * (half + (ISPY_SIZE[k] ? ISPY_SIZE[k][0] / 2 : 24) + 6 + R() * 14);
        e.gx = (anchor.x + off * s) / L.W;
        ispyRefresh(sc, e);
        ok = ispyRoom(sc, e, [anchor.id]) && ispyRel(sc, e, r, anchor);
      }
      if (ok){ e.placed = true; relKinds.push(k); } else ispyRemove(sc, e);
    }
  }
  /* a second one of each related kind elsewhere, so the preposition is what tells them apart */
  if (tier === 4) [...new Set(relKinds)].forEach(k => {
    if (k === 'cappello' || k === 'borsa') free(ispyPick(R, ['uomo', 'donna']), {}, undefined, undefined, { [k === 'cappello' ? 'hat' : 'bag']:ispyPick(R, ISPY_ACC[k]) });
    else if (ISPY_BODY[k]) free(k);
    else if (k === 'bicicletta') free(k, { col:ispyPick(R, ISPY_ACC.bicicletta) });
    else animal(k);
  });
  /* tier 1: the wanted thing, exactly once (pigeons: one to three) */
  if (want){
    if (want === 'piccione'){ const n = 1 + Math.floor(R() * 3); for (let i = 0; i < n; i++) animal('piccione'); }
    else if (want === 'bicicletta') free('bicicletta', { col:ispyPick(R, ISPY_ACC.bicicletta) });
    else if (want === 'gatto' || want === 'cane') animal(want);
    else free(want === 'palloncino' ? ispyPick(R, ['bambino', 'bambina']) : ispyPick(R, ['uomo', 'donna']), {}, undefined, undefined, { [accKey[want]]:ispyPick(R, ISPY_ACC[want]) });
  }
  /* tier 3: a group of two or three */
  if (tier === 3 && R() < 0.75){
    const k = ispyPick(R, ['bambino', 'bambina', 'cane', 'gatto', 'piccione', 'bicicletta']), n = 2 + Math.floor(R() * 2);
    counts[k] = n;
    const gx = 0.2 + R() * 0.6, gz = 0.35 + R() * 0.55, z = [Math.max(0, gz - 0.22), Math.min(1, gz + 0.22)], zone = [Math.max(0.04, gx - 0.22), Math.min(0.96, gx + 0.22)];
    for (let i = 0; i < n; i++){ if (ISPY_BODY[k]) free(k, {}, z, zone); else if (k === 'bicicletta') free(k, { col:ispyPick(R, ISPY_ACC.bicicletta) }, z, zone); else animal(k, {}, z, zone); }
  }
  /* everyone else */
  const nP = L.people[0] + Math.floor(R() * (L.people[1] - L.people[0] + 1));
  for (let i = 0; i < nP; i++){
    let k = ispyPick(R, ISPY_PEOPLE);
    if (counts[k]) k = ispyPick(R, ['uomo', 'donna']);
    free(k);
  }
  const extra = (k, p) => { if (want === k || counts[k] || tier === 1 && sc.ents.some(e => e.kind === k)) return; if (R() < p) k === 'bicicletta' ? free(k, { col:ispyPick(R, ISPY_ACC.bicicletta) }) : animal(k); };
  if (want !== 'piccione' && !counts.piccione){ const n = tier === 1 ? 0 : Math.floor(R() * 4); for (let i = 0; i < n; i++) animal('piccione'); }
  extra('gatto', tier === 2 ? 0.7 : 0.35); extra('cane', tier === 2 ? 0.7 : 0.4); extra('bicicletta', tier === 2 ? 0.7 : 0.4);
  if (tier === 2){ extra('gatto', 0.5); extra('cane', 0.4); extra('bicicletta', 0.4); }
  if (want && want !== 'piccione' && sc.ents.filter(e => e.kind === want).length !== 1) sc.bad = true;
  ispySceneDone(sc);
  return sc;
}
/* geometry of everything, the drawing order, and visibility */
function ispySceneDone(sc){
  sc.ents.filter(e => e.holder == null && e.chairOf == null && !e.seat && e.on == null && e.under == null && e.kind !== 'museo' && e.kind !== 'orologio').forEach(e => ispyRefresh(sc, e));
  sc.ents.forEach(e => { if (e.seat || e.chairOf != null || e.on != null || e.under != null){ ispyGeom(sc, e); ispyHeld(sc, e).forEach(h => ispyGeom(sc, h)); } });
  /* draw order: by depth; under → table → chairs → sitters → on top. The back seat goes before its table. */
  const depth = e => {
    if (e.holder != null) return depth(sc.byId[e.holder]) + 0.00001;
    if (e.fixed && (e.kind === 'museo' || e.kind === 'orologio')) return -10;
    if (e.seat){ const T = sc.byId[e.seat.table]; return T.gz + (e.seat.pos === 'B' ? -0.004 : 0.003); }
    if (e.chairOf != null) return sc.byId[e.chairOf].gz + 0.002;
    if (e.under != null){ const A = sc.byId[e.under]; return depth(A) - 0.001; }
    if (e.on != null){ const A = sc.byId[e.on]; return depth(A) + 0.004; }
    return e.gz;
  };
  sc.ents.forEach(e => e.depth = depth(e));
  sc.order = sc.ents.slice().sort((a, b) => a.depth - b.depth || a.id - b.id);
  sc.order.forEach((e, i) => e.z = i);
}
/* how much of e can be seen (0..1): sample its rect, see what is drawn over it */
function ispyVisibleFrac(sc, e){
  const r = e.rect, front = sc.order.filter(o => o.z > e.z && o.holder !== e.id && o.id !== e.holder && !(o.kind === 'museo' || o.kind === 'orologio'));
  let vis = 0, n = 0;
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++){
    const px = r.x + (i + 0.5) / 6 * r.w, py = r.y + (j + 0.5) / 6 * r.h; n++;
    if (!front.some(o => ispyIn(o.core, px, py) || (o.core2 && ispyIn(o.core2, px, py)) || (o.crown && ispyIn(o.crown, px, py) && ispyIn(ispyRect(o.crown.x + o.crown.w * 0.12, o.crown.y, o.crown.w * 0.76, o.crown.h * 0.85), px, py)))) vis++;
  }
  return vis / n;
}
function ispyCandidates(sc, tier){
  const out = [], E = sc.ents.filter(e => !e.fixed), add = (d, w) => out.push({ d, m:ispyMatch(sc, d), w });
  if (sc.bad) return out;
  if (tier === 1) ISPY_T1.forEach(k => add({ kind:k }));
  else if (tier === 2) E.forEach(e => {
    if (ISPY_BODY[e.kind]){
      if (ISPY_COL[e.shirt].f) add({ kind:e.kind, with:{ item:'maglietta', col:e.shirt } }, 2);
      ispyHeld(sc, e).forEach(h => ISPY_COL[h.col] && ISPY_COL[h.col].f && add({ kind:e.kind, with:{ item:h.kind, col:h.col } }, 1.3));
    } else if (e.col && ISPY_COL[e.col] && ISPY_COL[e.col].f && ['gatto', 'cane', 'bicicletta', 'palloncino', 'ombrello', 'borsa', 'cappello'].includes(e.kind)) add({ kind:e.kind, col:e.col }, e.holder != null ? 0.35 : 0.6);
  });
  else if (tier === 3){
    E.filter(e => e.kind === 'tavolo').forEach(t => { const occ = ispyOcc(sc, t); if (occ.length >= 2 && occ.every(p => p.kind === occ[0].kind)) add({ kind:'tavolo', seat:{ kind:occ[0].kind, n:occ.length } }, 2); });
    ['bambino', 'bambina', 'cane', 'gatto', 'piccione', 'bicicletta', 'donna', 'uomo'].forEach(k => { const n = E.filter(e => e.kind === k).length; if (n >= 2 && n <= 4) add({ kind:k, n }, ISPY_N[k].person && !ISPY_N[k].child ? 0.4 : 1.5); });
  } else if (tier === 4){
    E.filter(e => e.holder == null && !e.seat && e.chairOf == null && e.kind !== 'tavolo').forEach(e => {
      sc.ents.filter(a => ISPY_ANCHORS.includes(a.kind) && a !== e && a.kind !== 'museo').forEach(a => Object.keys(ISPY_PREPS).forEach(p => {
        if (!ispyRel(sc, e, p, a)) return;
        if (p === 'vicino' && (ispyRel(sc, e, 'sotto', a) || ispyRel(sc, e, 'sopra', a))) return;
        const def = sc.ents.filter(x => x.kind === a.kind).length === 1;
        add({ kind:e.kind, rel:{ prep:p, anchor:a.kind, def } }, p === 'vicino' ? 0.7 : 1.4);
      }));
    });
  }
  return out;
}
/* a candidate is fine when it picks out its target(s) only, they can be seen, and (from tier 2) something else of the
   same kind is in the scene, so the colour, the number or the place is what tells them apart */
function ispyValid(sc, c, tier){
  const m = c.m, d = c.d;
  if (!m.length) return false;
  if (tier === 1){ if (d.kind === 'piccione' ? m.length > 3 : m.length !== 1) return false; }
  else if ((d.n || 1) === 1 && m.length !== 1) return false;
  const same = sc.ents.filter(e => e.kind === d.kind).length;
  if (tier === 2 && same < 2) return false;
  if (tier === 4 && ispyMatch(sc, { kind:d.kind }).length < 2) return false;
  if (tier === 3 && d.seat && sc.ents.filter(e => e.kind === 'tavolo').length < 2) return false;
  const minVis = d.rel && d.rel.prep === 'dietro' ? 0.4 : 0.6;
  for (const e of m){
    if (ispyVisibleFrac(sc, e) < (m.length > 1 ? 0.45 : minVis)) return false;
    const r = e.rect, L = sc.L;
    if (r.x < 2 || r.x + r.w > L.W - 2 || r.y < 4 || r.y + r.h > L.H) return false;
    /* not hidden in a crowd of its own kind */
    if (sc.ents.some(o => o !== e && o.kind === e.kind && !m.includes(o) && ispyOverlap(o.rect, r) > 0.2 * r.w * r.h)) return false;
  }
  /* held things are small: their holder must be clear too */
  return true;
}
/* Bruno's clue after two misses: the side, and something the target is near / under / on */
function ispyClue(sc, round){
  const m = round.matches.map(id => sc.byId[id]), e = m[0], pl = m.length > 1, L = sc.L;
  const cx = m.reduce((a, x) => a + x.rect.x + x.rect.w / 2, 0) / m.length;
  const side = cx < L.W * 0.36 ? 'sinistra' : cx > L.W * 0.64 ? 'destra' : null;
  const base = e.holder != null ? sc.byId[e.holder] : e;
  let rel = null;
  const used = round.desc.rel;
  for (const p of ['sotto', 'sopra', 'dietro', 'davanti', 'vicino']){
    for (const a of sc.ents.filter(a => ['fontana', 'albero', 'tavolo', 'sedia', 'bicicletta'].includes(a.kind) && a !== base)){
      if (used && used.prep === p && used.anchor === a.kind) continue;
      if (base.seat && p === 'vicino' && a.id === base.seat.table){ rel = { p, a }; break; }
      if (ispyRel(sc, base, p, a)){ rel = { p, a }; break; }
    }
    if (rel) break;
  }
  if (base.seat && !rel) rel = { p:'vicino', a:sc.byId[base.seat.table] };
  const parts = [], en = [];
  if (side){ parts.push('a ' + side); en.push('on the ' + (side === 'sinistra' ? 'left' : 'right')); }
  if (rel){ const def = sc.ents.filter(x => x.kind === rel.a.kind).length === 1, r = ispyRelPhrase(rel.p, rel.a.kind, def); parts.push(r.it); en.push(r.en); }
  if (!parts.length){ parts.push('davanti al museo'); en.push('in front of the museum'); }
  return { it:`${pl ? 'Sono' : 'È'} ${parts.join(', ')}.`, en:`${pl ? "They're" : "It's"} ${en.join(', ')}.` };
}

/* =========================================================
   DRAWING: an eye-level view, flat poster colours like the rest of the game. Everything is drawn in the layout's logical
   units; ispyDraw scales to the canvas.
   ========================================================= */
const ispyShade = (hex, f) => { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f)))); return `rgb(${c.join(',')})`; };
const ispyHex = c => (ISPY_COL[c] || ISPY_COL._grigio).hex;
function ispyArch(g, x, y, w, h){ g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w / 2); g.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w, y + h); g.closePath(); }
function ispyWindows(g, R, x0, x1, top, bottom, wall){
  const cols = Math.max(1, Math.floor((x1 - x0 - 16) / 46)), gap = (x1 - x0) / cols;
  for (let r = 0, y = top + 26; y + 34 < bottom; r++, y += 58){
    for (let c = 0; c < cols; c++){
      const x = x0 + gap * c + gap / 2 - 9;
      g.fillStyle = ispyShade(wall, -0.18); g.fillRect(x - 3, y - 3, 24, 38);
      g.fillStyle = '#4b3a30'; g.fillRect(x, y, 18, 32);
      const open = R() < 0.5;
      g.fillStyle = '#4f7d5b';
      if (open){ g.fillRect(x - 10, y, 9, 32); g.fillRect(x + 19, y, 9, 32); }
      else { g.fillRect(x, y, 18, 32); g.strokeStyle = 'rgba(20,40,25,.45)'; g.lineWidth = 1; for (let k = 4; k < 32; k += 4){ g.beginPath(); g.moveTo(x, y + k); g.lineTo(x + 18, y + k); g.stroke(); } }
      if (open && R() < 0.4){ g.fillStyle = '#c94a3a'; for (let k = 0; k < 4; k++){ circ(g, x + 3 + k * 4, y + 30, 2.6); g.fill(); } g.fillStyle = '#3f7a46'; g.fillRect(x - 1, y + 31, 20, 4); }
    }
  }
}
function ispyPortico(g, x0, x1, base, h, wall){
  const n = Math.max(2, Math.round((x1 - x0) / 62)), w = (x1 - x0) / n;
  g.fillStyle = ispyShade(wall, -0.1); g.fillRect(x0, base - h, x1 - x0, h);
  for (let i = 0; i < n; i++){ g.fillStyle = '#6e4a38'; ispyArch(g, x0 + i * w + 7, base - h + 10, w - 14, h - 10); g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x0 + i * w + 7, base - h + 10 + (w - 14) / 2, w - 14, 6); }
  g.fillStyle = ispyShade(wall, 0.25); g.fillRect(x0, base - h - 4, x1 - x0, 5);
}
/* the background: sky, the houses with their arcades, the café, the museum, the clock tower, the paving */
function ispyDrawBg(g, L, seed){
  const R = ispyRng(ispyHash(seed, 'bg')), W2 = L.W, base = L.base;
  let gr = g.createLinearGradient(0, 0, 0, base);
  gr.addColorStop(0, '#86b9dc'); gr.addColorStop(0.6, '#cfe2ea'); gr.addColorStop(1, '#f3e3c4');
  g.fillStyle = gr; g.fillRect(0, 0, W2, base + 2);
  /* far roofs */
  g.fillStyle = '#d9c3a3';
  for (let x = -20; x < W2; x += 70 + R() * 40){ const h = 40 + R() * 50; g.fillRect(x, base - 200 - h, 60 + R() * 40, 220); }
  g.fillStyle = '#c98a64'; for (let x = 0; x < W2; x += 90 + R() * 50) g.fillRect(x, base - 250 - R() * 30, 12, 60);
  /* the houses */
  const house = (H, wall) => {
    g.fillStyle = wall; g.fillRect(H.x0, H.top, H.x1 - H.x0, base - H.top);
    g.fillStyle = '#b5523a'; g.fillRect(H.x0 - 4, H.top - 10, H.x1 - H.x0 + 8, 12);
    g.fillStyle = ispyShade(wall, 0.3); g.fillRect(H.x0 - 4, H.top + 2, H.x1 - H.x0 + 8, 4);
    ispyWindows(g, R, H.x0, H.x1, H.top, base - 92, wall);
    ispyPortico(g, H.x0, H.x1, base, 84, wall);
  };
  house(L.left, '#e2a86c'); house(L.right, '#ead08f');
  /* the café under the left arcade: a striped awning and a sign */
  const A = L.left, ax0 = A.x0 + 8, ax1 = A.x1 - 10, ay = base - 96;
  for (let x = ax0, k = 0; x < ax1; x += 16, k++){ g.fillStyle = k % 2 ? '#fbf6ea' : '#c8352a'; g.beginPath(); g.moveTo(x, ay); g.lineTo(x + 16, ay); g.lineTo(x + 18, ay + 22); g.lineTo(x - 2, ay + 22); g.closePath(); g.fill(); }
  for (let x = ax0; x < ax1; x += 16){ g.fillStyle = Math.round((x - ax0) / 16) % 2 ? '#fbf6ea' : '#c8352a'; g.beginPath(); g.arc(x + 8, ay + 22, 8, 0, Math.PI); g.fill(); }
  g.fillStyle = '#1c3d8f'; rr(g, (ax0 + ax1) / 2 - 42, ay - 26, 84, 22, 4); g.fill();
  g.fillStyle = '#f4b928'; g.font = '700 15px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('CAFFÈ', (ax0 + ax1) / 2, ay - 14.5);
  /* the museum: a brick church front with a gable, a rose window, a portal and a banner */
  const M = L.museum, mx = (M.x0 + M.x1) / 2, mw = M.x1 - M.x0;
  g.fillStyle = '#b9673f'; g.beginPath(); g.moveTo(M.x0, base); g.lineTo(M.x0, M.top); g.lineTo(mx, M.peak); g.lineTo(M.x1, M.top); g.lineTo(M.x1, base); g.closePath(); g.fill();
  g.save(); g.clip(); g.strokeStyle = 'rgba(90,35,15,.22)'; g.lineWidth = 1;
  for (let y = M.peak; y < base; y += 6){ g.beginPath(); g.moveTo(M.x0, y + 0.5); g.lineTo(M.x1, y + 0.5); g.stroke(); }
  g.restore();
  g.strokeStyle = '#efe6d2'; g.lineWidth = 6; g.beginPath(); g.moveTo(M.x0 - 6, M.top + 4); g.lineTo(mx, M.peak - 2); g.lineTo(M.x1 + 6, M.top + 4); g.stroke();
  g.fillStyle = '#e9dfca'; [M.x0 + mw * 0.22, M.x1 - mw * 0.22].forEach(x => g.fillRect(x - 5, M.top + 6, 10, base - M.top - 6));
  const ry = M.top + (base - M.top) * 0.22, rr0 = Math.min(30, mw * 0.09);
  g.fillStyle = '#efe6d2'; circ(g, mx, ry, rr0 + 5); g.fill(); g.fillStyle = '#3f5876'; circ(g, mx, ry, rr0); g.fill();
  g.strokeStyle = '#efe6d2'; g.lineWidth = 2; for (let k = 0; k < 8; k++){ const a = k / 8 * Math.PI * 2; g.beginPath(); g.moveTo(mx, ry); g.lineTo(mx + Math.cos(a) * rr0, ry + Math.sin(a) * rr0); g.stroke(); }
  [-1, 1].forEach(d => { const x = mx + d * mw * 0.36; g.fillStyle = '#efe6d2'; ispyArch(g, x - 11, ry - 22, 22, 56); g.fill(); g.fillStyle = '#3f5876'; ispyArch(g, x - 7, ry - 18, 14, 50); g.fill(); });
  const dw = Math.min(70, mw * 0.24), dh = (base - M.top) * 0.42;
  g.fillStyle = '#efe6d2'; ispyArch(g, mx - dw / 2 - 7, base - dh - 7, dw + 14, dh + 7); g.fill();
  g.fillStyle = '#5a3426'; ispyArch(g, mx - dw / 2, base - dh, dw, dh); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(mx, base - dh + dw / 2 - 6); g.lineTo(mx, base); g.stroke();
  g.fillStyle = '#d9cfba'; g.fillRect(M.x0 + 10, base - 8, mw - 20, 8); g.fillStyle = '#cbbfa6'; g.fillRect(M.x0 + 20, base - 4, mw - 40, 4);
  /* the banners (MUSEO, MOSTRA) and the name over the portal: Museo d'Arte · I Capolavori */
  const bw = Math.max(34, mw * 0.11), bh = (base - M.top) * 0.5, by = M.top + 30;
  [[M.x0 + mw * 0.08, '#1c3d8f', 'MUSEO'], [M.x1 - mw * 0.08 - bw, '#c23b2a', 'MOSTRA']].forEach(([bx, col, word]) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + bw, by); g.lineTo(bx + bw, by + bh); g.lineTo(bx + bw / 2, by + bh - 12); g.lineTo(bx, by + bh); g.closePath(); g.fill();
    g.fillStyle = '#f4b928'; g.fillRect(bx, by, bw, 5);
    const step = Math.min(bw * 0.48, (bh - 30) / (word.length - 0.4));
    g.font = `700 ${Math.round(Math.min(bw * 0.42, step * 0.95))}px "Titillium Web", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    word.split('').forEach((c, i) => g.fillText(c, bx + bw / 2, by + 18 + i * step));
  });
  const ly = base - dh - 30, lw = Math.min(mw * 0.62, 230);
  g.fillStyle = '#efe6d2'; g.fillRect(mx - lw / 2, ly, lw, 17);
  g.fillStyle = '#5a3426'; g.font = `700 ${lw > 200 ? 10.5 : 9}px "Titillium Web", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText("MUSEO D'ARTE · I CAPOLAVORI", mx, ly + 9);
  /* the clock tower: brick, a white stone panel with a blue ring and gold stars round the dial (as on the map) */
  const T = L.tower, tw = T.x1 - T.x0, tx = (T.x0 + T.x1) / 2, C = T.clock;
  g.fillStyle = '#9f4a2c'; g.beginPath(); g.moveTo(T.x0 - 8, T.top); g.lineTo(tx, T.top - 44); g.lineTo(T.x1 + 8, T.top); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.moveTo(tx, T.top - 44); g.lineTo(T.x1 + 8, T.top); g.lineTo(tx + 6, T.top); g.closePath(); g.fill();
  g.fillStyle = '#d9b44a'; circ(g, tx, T.top - 46, 3.5); g.fill();
  g.fillStyle = '#b8613a'; g.fillRect(T.x0, T.top, tw, base - T.top);
  g.strokeStyle = 'rgba(80,30,12,.3)'; g.lineWidth = 1; for (let y = T.top + 4; y < base; y += 6){ g.beginPath(); g.moveTo(T.x0, y + 0.5); g.lineTo(T.x1, y + 0.5); g.stroke(); }
  g.fillStyle = '#3a2418'; ispyArch(g, tx - 12, T.top + 6, 24, 30); g.fill();
  g.fillStyle = '#c9a03a'; g.beginPath(); g.moveTo(tx - 7, T.top + 30); g.quadraticCurveTo(tx, T.top + 10, tx + 7, T.top + 30); g.closePath(); g.fill();
  g.fillStyle = '#efe8da'; g.fillRect(T.x0 - 5, T.top + 38, tw + 10, 6);
  g.fillStyle = '#e9e1cf'; g.fillRect(T.x0 + 2, C.y - C.r - 12, tw - 4, 2 * C.r + 24);
  g.fillStyle = '#1f3f7a'; circ(g, C.x, C.y, C.r + 8); g.fill();
  for (let k = 0; k < 12; k++){ const a = k / 12 * 2 * Math.PI; g.fillStyle = '#e8c45a'; circ(g, C.x + Math.sin(a) * (C.r + 4), C.y - Math.cos(a) * (C.r + 4), 1.6); g.fill(); }
  g.fillStyle = '#fbf6e6'; circ(g, C.x, C.y, C.r); g.fill();
  g.strokeStyle = '#2b2b2b';
  for (let k = 0; k < 12; k++){ const a = k / 12 * 2 * Math.PI, big = k % 3 === 0, r0 = C.r - (big ? 9 : 5.5);
    g.lineWidth = big ? 3.2 : 1.8; g.beginPath(); g.moveTo(C.x + Math.sin(a) * r0, C.y - Math.cos(a) * r0); g.lineTo(C.x + Math.sin(a) * (C.r - 2), C.y - Math.cos(a) * (C.r - 2)); g.stroke(); }
  g.fillStyle = '#2b2b2b'; g.font = '700 9px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('XII', C.x, C.y - C.r + 15);
  g.fillStyle = '#3a2418'; ispyArch(g, tx - 4, C.y + C.r + 26, 8, 26); g.fill();
  g.fillStyle = '#d9d0bd'; g.fillRect(T.x0 - 2, base - 36, tw + 4, 36);
  g.fillStyle = '#5a3a22'; ispyArch(g, tx - 12, base - 32, 24, 32); g.fill();
  g.fillStyle = 'rgba(70,30,15,.18)'; g.fillRect(T.x1 - 14, T.top, 14, base - T.top);
  /* the paving: big stone slabs in perspective */
  gr = g.createLinearGradient(0, base, 0, L.H);
  gr.addColorStop(0, '#cfc2a6'); gr.addColorStop(1, '#bba987');
  g.fillStyle = gr; g.fillRect(0, base, W2, L.H - base);
  g.fillStyle = 'rgba(60,40,20,.16)'; g.fillRect(0, base, W2, 7);
  g.strokeStyle = 'rgba(110,90,60,.28)'; g.lineWidth = 1.2;
  const vx = W2 / 2, vy = base - 260;
  for (let y = base + 8, d = 8; y < L.H; d *= 1.32, y += d){ g.beginPath(); g.moveTo(0, y); g.lineTo(W2, y); g.stroke(); }
  for (let k = -12; k <= 12; k++){ const xb = vx + k * 110; g.beginPath(); g.moveTo(vx + (xb - vx) * (base - vy) / (L.H - vy), base); g.lineTo(xb, L.H); g.stroke(); }
}

/* the clock hands (minutes since midnight, 24-hour) */
function ispyDrawHands(g, L, mins){
  const C = L.tower.clock, m12 = ((mins % 720) + 720) % 720, ha = m12 / 720 * 2 * Math.PI, ma = (m12 % 60) / 60 * 2 * Math.PI;
  g.save(); g.translate(C.x, C.y); g.lineCap = 'round'; g.strokeStyle = '#1b1b1b';
  g.lineWidth = 5; g.beginPath(); g.moveTo(-Math.sin(ha) * 4, Math.cos(ha) * 4); g.lineTo(Math.sin(ha) * C.r * 0.5, -Math.cos(ha) * C.r * 0.5); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.moveTo(-Math.sin(ma) * 5, Math.cos(ma) * 5); g.lineTo(Math.sin(ma) * C.r * 0.82, -Math.cos(ma) * C.r * 0.82); g.stroke();
  g.fillStyle = '#c9a03a'; circ(g, 0, 0, 3.6); g.fill();
  g.restore();
}

/* ---------- the cast ---------- */
function ispyDrawPerson(g, sc, e, t){
  const B = ISPY_BODY[e.kind], kid = ISPY_N[e.kind].child, seated = !!e.seat, side = e.flip || 1;
  const sway = RM ? 0 : Math.sin(t * 1.05 + e.ph) * 1.4, hop = kid && !RM && !seated ? Math.max(0, Math.sin(t * 2.4 + e.ph * 3) - 0.85) * 18 : 0;
  const hip = seated ? -ISPY_SEAT : -B.leg, sh = B.sh, hw = sh * 0.78, neckY = hip - B.torso, headY = neckY - 4 - B.hr;
  const held = ispyHeld(sc, e), umb = held.find(h => h.kind === 'ombrello'), bag = held.find(h => h.kind === 'borsa'), hat = held.find(h => h.kind === 'cappello'), bal = held.find(h => h.kind === 'palloncino');
  g.save(); g.translate(e.x, e.y); g.scale(e.s, e.s);
  if (!seated){ g.fillStyle = 'rgba(40,30,20,.2)'; ell(g, 0, 0, sh + 6, 4); g.fill(); }
  g.translate(0, -hop);
  const skin = e.skin, shirt = ispyHex(e.shirt), shirtD = ispyShade(shirt, e.shirt === 'nero' ? 0.25 : -0.2), legs = e.legs;
  /* legs */
  if (seated){
    [-1, 1].forEach(d => { g.fillStyle = e.skirt ? skin : ispyShade(legs, -0.12); g.fillRect(d * hw * 0.55 - 4.5, hip + 8, 9, -hip - 10); g.fillStyle = '#2d2620'; ell(g, d * hw * 0.55 + d, -2.5, 6.5, 3.2); g.fill(); });
    /* the thighs, coming towards us: two rounded knees */
    g.fillStyle = e.skirt ? ispyShade(legs, 0.05) : legs;
    [-1, 1].forEach(d => { rr(g, d < 0 ? -hw - 2 : 1, hip - 6, hw + 1, 16, 6); g.fill(); });
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-hw - 1, hip + 7, 2 * hw + 2, 3);
  } else {
    [-1, 1].forEach(d => {
      const lx = d * hw * 0.5 + (d < 0 ? sway * 0.4 : 0), lw = hw * 0.82;
      g.fillStyle = e.skirt ? skin : legs; g.fillRect(lx - (e.skirt ? lw * 0.32 : lw / 2), hip, e.skirt ? lw * 0.64 : lw, -hip - 3);
      g.fillStyle = '#2d2620'; ell(g, lx + d * 1.5, -2.5, lw * 0.6, 3.2); g.fill();
    });
    if (e.skirt){ g.fillStyle = legs; g.beginPath(); g.moveTo(-hw, hip - 2); g.lineTo(hw, hip - 2); g.lineTo(hw * 1.35, hip + B.leg * 0.42); g.lineTo(-hw * 1.35, hip + B.leg * 0.42); g.closePath(); g.fill(); }
  }
  /* hair: women and girls have long hair, a bob or a ponytail (behind the body); men short hair, some a beard */
  const hair = e.hair, fem = e.kind === 'donna' || e.kind === 'bambina';
  if (fem){ g.fillStyle = hair;
    if (e.hairStyle === 0) rr(g, -B.hr - 2, headY - 2, 2 * B.hr + 4, B.hr * (e.kind === 'donna' ? 2.5 : 2), B.hr * 0.8);
    else if (e.hairStyle === 1) rr(g, -B.hr - 2.5, headY - 3, 2 * B.hr + 5, B.hr * 1.45, B.hr * 0.7);
    else { ell(g, side * (B.hr + 1), headY + 3, 3.6, B.hr * 0.9, side * 0.3); }
    g.fill(); }
  /* arms (sleeves, then skin); the umbrella arm is raised */
  const armW = kid ? 6 : 8, shY = neckY + 5;
  [-1, 1].forEach(d => {
    const up = umb && d === side, swing = RM ? 0 : Math.sin(t * 1.05 + e.ph + d) * 1.2;
    const hx = up ? d * (sh + 3) : d * (sh + 3) + swing * 0.3, hy = up ? neckY + B.torso * 0.15 : seated ? hip - 6 : hip + 4 + swing;
    g.strokeStyle = skin; g.lineWidth = armW; g.lineCap = 'round';
    g.beginPath(); g.moveTo(d * (sh - 2), shY); g.quadraticCurveTo(d * (sh + 3), (shY + hy) / 2 + (up ? 6 : 0), hx, hy); g.stroke();
    g.strokeStyle = shirt; g.lineWidth = armW + 3; g.beginPath(); g.moveTo(d * (sh - 3), shY - 1); g.lineTo(d * (sh + 1), shY + B.torso * 0.32); g.stroke();
    if (up || bal && d === side){ g.fillStyle = skin; circ(g, hx, hy, armW * 0.62); g.fill(); }
  });
  /* torso: the T-shirt */
  g.fillStyle = shirt; g.beginPath(); g.moveTo(-sh, neckY + 4); g.quadraticCurveTo(-sh, neckY, -sh + 5, neckY); g.lineTo(sh - 5, neckY); g.quadraticCurveTo(sh, neckY, sh, neckY + 4);
  g.lineTo(hw + 1 + sway * 0.15, hip + 2); g.lineTo(-hw - 1 + sway * 0.15, hip + 2); g.closePath(); g.fill();
  g.strokeStyle = shirtD; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = skin; g.beginPath(); g.moveTo(-4.5, neckY); g.quadraticCurveTo(0, neckY + 6, 4.5, neckY); g.closePath(); g.fill();
  /* neck and head */
  g.fillStyle = skin; g.fillRect(-3.5, neckY - 5, 7, 7);
  const look = RM ? 0 : (Math.sin(t * 0.37 + e.ph * 2) > 0.6 ? 1.6 : Math.sin(t * 0.37 + e.ph * 2) < -0.6 ? -1.6 : 0) * side;
  circ(g, 0, headY, B.hr); g.fill();
  g.fillStyle = '#2b2018'; [-1, 1].forEach(d => { circ(g, d * B.hr * 0.38 + look, headY - 0.5, 1.3); g.fill(); });
  g.strokeStyle = ispyShade(skin, -0.35); g.lineWidth = 1; g.beginPath(); g.arc(look * 0.5, headY + B.hr * 0.38, 2.4, 0.2, Math.PI - 0.2); g.stroke();
  /* hair on top */
  g.fillStyle = hair;
  g.beginPath(); g.arc(0, headY - 1, B.hr + 0.8, Math.PI * 1.02, Math.PI * 1.98); g.quadraticCurveTo(B.hr * 0.4, headY - B.hr * 0.35, -B.hr * 0.2, headY - B.hr * 0.45); g.closePath(); g.fill();
  if (fem && e.hairStyle === 2){ circ(g, side * B.hr * 0.75, headY - B.hr * 0.6, 3.4); g.fill(); }
  if (e.kind === 'uomo' && e.hairStyle === 2){ g.fillStyle = ispyShade(hair, 0.05); g.beginPath(); g.arc(0, headY + 1, B.hr * 0.98, 0.15, Math.PI - 0.15); g.quadraticCurveTo(0, headY + B.hr * 0.25, B.hr * 0.95, headY + 3); g.fill();
    g.fillStyle = skin; ell(g, 0, headY + B.hr * 0.42, 3.4, 1.6); g.fill(); }
  /* the bag on its strap */
  if (bag){ const d = bag.side, bx = d * (sh + 6), by = seated ? hip + 2 : hip + 18;
    g.strokeStyle = ispyShade(ispyHex(bag.col), -0.35); g.lineWidth = 2; g.beginPath(); g.moveTo(-d * (sh - 6), neckY + 1); g.lineTo(bx, by - 15); g.stroke();
    ispyBagShape(g, bx, by, ispyHex(bag.col), 1); }
  /* the hat */
  if (hat) ispyHatShape(g, 0, headY - B.hr + 3, ispyHex(hat.col), B.hr);
  /* the umbrella, open (sun or rain, it's colourful) */
  if (umb){ const hx = side * (sh + 3), hy = neckY + B.torso * 0.15, cx = side * 10, cy = -ispyTall(B) - 8;
    g.strokeStyle = '#3a3a3a'; g.lineWidth = 2; g.beginPath(); g.moveTo(hx, hy + 6); g.lineTo(cx, cy - 26); g.stroke();
    ispyUmbrellaShape(g, cx, cy, ispyHex(umb.col)); }
  g.restore();
  /* the balloon floats on its string */
  if (bal) ispyDrawBalloon(g, bal, t, hop * e.s);
}
function ispyBagShape(g, x, y, col, k){
  g.fillStyle = col; rr(g, x - 9 * k, y - 15 * k, 18 * k, 15 * k, 3 * k); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 1; g.stroke();
  g.fillStyle = ispyShade(col, col === ISPY_COL.nero.hex ? 0.25 : -0.18); g.fillRect(x - 9 * k, y - 15 * k, 18 * k, 6 * k);
}
function ispyHatShape(g, x, y, col, hr){
  g.fillStyle = col; ell(g, x, y, hr + 8, 3.6); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.stroke();
  rr(g, x - hr + 1.5, y - 11, 2 * hr - 3, 11, 4); g.fill(); g.stroke();
  g.fillStyle = ispyShade(col, col === ISPY_COL.nero.hex ? 0.3 : -0.3); g.fillRect(x - hr + 1.5, y - 4, 2 * hr - 3, 3);
}
function ispyUmbrellaShape(g, x, y, col){
  g.fillStyle = col; g.beginPath(); g.moveTo(x - 48, y); g.quadraticCurveTo(x - 44, y - 30, x, y - 30); g.quadraticCurveTo(x + 44, y - 30, x + 48, y);
  for (let k = 3; k >= 0; k--){ const xa = x - 48 + k * 24; g.quadraticCurveTo(xa + 12, y - 8, xa, y); }
  g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1.2; g.stroke();
  g.strokeStyle = ispyShade(col, -0.25); g.lineWidth = 1; [-24, 0, 24].forEach(dx => { g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x + dx, y - 1); g.stroke(); });
  g.strokeStyle = '#3a3a3a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x, y - 36); g.stroke();
}
function ispyDrawBalloon(g, e, t, lift = 0){
  const bob = RM ? 0 : Math.sin(t * 1.6 + e.ph) * 3 * e.s, sw = RM ? 0 : Math.sin(t * 0.9 + e.ph) * 3 * e.s;
  const [hx, hy] = e.hand, bx = e.x + sw, by = e.y + bob - lift, s = e.s;
  g.strokeStyle = 'rgba(60,60,60,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(hx, hy - lift); g.quadraticCurveTo(hx + (bx - hx) * 0.2 + 6 * s, (hy + by) / 2, bx, by + 15 * s); g.stroke();
  const col = ispyHex(e.col);
  g.fillStyle = col; ell(g, bx, by, 12 * s, 14.5 * s); g.fill();
  g.beginPath(); g.moveTo(bx - 3 * s, by + 16 * s); g.lineTo(bx + 3 * s, by + 16 * s); g.lineTo(bx, by + 13 * s); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.55)'; ell(g, bx - 4 * s, by - 5 * s, 3 * s, 5 * s, -0.4); g.fill();
}
function ispyDrawCat(g, e, t){
  const col = ispyHex(e.col), dark = ispyShade(col, e.col === 'nero' ? 0.2 : -0.25), f = e.flip || 1;
  g.save(); g.translate(e.x, e.y); g.scale(e.s * f, e.s);
  if (e.on == null && e.under == null){ g.fillStyle = 'rgba(40,30,20,.18)'; ell(g, 0, 0, 16, 3.5); g.fill(); }
  const sw = RM ? 0 : Math.sin(t * 1.7 + e.ph) * 0.5;
  g.strokeStyle = col; g.lineWidth = 4.5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(9, -4); g.quadraticCurveTo(22, -6, 21 + sw * 6, -18 - sw * 3); g.quadraticCurveTo(20 + sw * 9, -27, 16 + sw * 10, -28); g.stroke();
  g.fillStyle = col; ell(g, 0, -14, 12, 14); g.fill();
  [-5, 5].forEach(x => { ell(g, x, -2, 4.5, 2.6); g.fill(); });
  circ(g, 0, -31, 10); g.fill();
  [-1, 1].forEach(d => { g.beginPath(); g.moveTo(d * 9.5, -33); g.lineTo(d * 8.5, -44); g.lineTo(d * 2, -38); g.closePath(); g.fill(); });
  if (e.col === '_tigrato'){ g.strokeStyle = dark; g.lineWidth = 2; [-20, -14, -8].forEach(y => { g.beginPath(); g.moveTo(-8, y); g.lineTo(-3, y + 2); g.moveTo(8, y); g.lineTo(3, y + 2); g.stroke(); }); }
  if (e.col === 'bianco'){ g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; circ(g, 0, -31, 10); g.stroke(); ell(g, 0, -14, 12, 14); g.stroke(); }
  g.fillStyle = e.col === 'nero' ? '#d8e05a' : '#3f8a3a'; [-1, 1].forEach(d => { ell(g, d * 4, -32, 2.2, 2.6); g.fill(); });
  g.fillStyle = '#1b1b1b'; [-1, 1].forEach(d => { ell(g, d * 4, -32, 0.8, 2.2); g.fill(); });
  g.fillStyle = '#e88a9a'; g.beginPath(); g.moveTo(-1.6, -28.5); g.lineTo(1.6, -28.5); g.lineTo(0, -27); g.closePath(); g.fill();
  g.restore();
}
function ispyDrawDog(g, e, t){
  const col = ispyHex(e.col), dark = e.col === 'bianco' ? '#6b4a32' : ispyShade(col, e.col === 'nero' ? 0.18 : -0.3), f = e.flip || 1;
  const wag = RM ? 0 : Math.sin(t * 11 + e.ph) * 7;
  g.save(); g.translate(e.x, e.y); g.scale(e.s * f, e.s);
  if (e.under == null){ g.fillStyle = 'rgba(40,30,20,.2)'; ell(g, 0, 0, 26, 4); g.fill(); }
  g.strokeStyle = col; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-22, -30); g.quadraticCurveTo(-32, -36, -34 + wag * 0.3, -46 + Math.abs(wag) * 0.2); g.stroke();
  g.fillStyle = col; [-19, -11, 11, 18].forEach((x, i) => { g.fillStyle = i % 2 ? col : ispyShade(col, -0.12); g.fillRect(x - 2.6, -22, 5.2, 21); });
  g.fillStyle = '#2d2620'; [-19, -11, 11, 18].forEach(x => g.fillRect(x - 3, -2.5, 6, 2.5));
  g.fillStyle = col; rr(g, -25, -36, 48, 18, 9); g.fill();
  if (e.col === 'bianco'){ g.fillStyle = dark; ell(g, -8, -30, 7, 5); g.fill(); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1; rr(g, -25, -36, 48, 18, 9); g.stroke(); }
  g.fillStyle = col; rr(g, 14, -48, 16, 20, 7); g.fill();
  circ(g, 24, -44, 9.5); g.fill(); rr(g, 26, -45, 13, 9, 4); g.fill();
  if (e.col === 'bianco'){ g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1; circ(g, 24, -44, 9.5); g.stroke(); }
  g.fillStyle = '#1b1b1b'; circ(g, 38.5, -42, 2.4); g.fill(); circ(g, 27, -47, 1.5); g.fill();
  g.fillStyle = dark; ell(g, 19, -41, 4, 8, 0.25); g.fill();
  g.strokeStyle = '#1c3d8f'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(15, -36); g.lineTo(20, -33); g.stroke();
  g.restore();
}
function ispyDrawPigeon(g, e, t){
  const f = e.flip || 1, cyc = RM ? 0.9 : ((t * 0.33 + e.ph) % 1 + 1) % 1;
  const hop = cyc < 0.25 ? Math.abs(Math.sin(cyc / 0.25 * Math.PI * 2)) * 6 : 0, peck = cyc > 0.5 && cyc < 0.75 ? Math.sin((cyc - 0.5) / 0.25 * Math.PI) : 0;
  g.save(); g.translate(e.x, e.y); g.scale(e.s * f, e.s);
  g.fillStyle = 'rgba(40,30,20,.16)'; ell(g, 0, 0, 10, 2.5); g.fill();
  g.translate(0, -hop);
  g.strokeStyle = '#d27a7a'; g.lineWidth = 1.6; [-2, 2].forEach(x => { g.beginPath(); g.moveTo(x, -4); g.lineTo(x + 1, 0); g.stroke(); });
  g.fillStyle = '#6c7280'; g.beginPath(); g.moveTo(-9, -10); g.lineTo(-17, -8); g.lineTo(-9, -6); g.closePath(); g.fill();
  g.fillStyle = '#8f95a2'; ell(g, 0, -9, 11, 6.5); g.fill();
  g.fillStyle = '#7b818e'; ell(g, -2, -10, 7, 4, -0.15); g.fill();
  g.fillStyle = '#3f444f'; g.fillRect(-6, -8, 2, 3); g.fillRect(-2, -8, 2, 3);
  g.save(); g.translate(7, -12); g.rotate(peck * 0.9);
  g.fillStyle = '#5f8a7a'; ell(g, 0, -1, 4, 5); g.fill();
  g.fillStyle = '#727887'; circ(g, 2, -5, 4.3); g.fill();
  g.fillStyle = '#e8e2d6'; g.beginPath(); g.moveTo(5.8, -5.5); g.lineTo(9, -4.5); g.lineTo(5.8, -3.5); g.closePath(); g.fill();
  g.fillStyle = '#c24a2a'; circ(g, 3, -6, 1); g.fill();
  g.restore();
  g.restore();
}
function ispyDrawBike(g, e){
  const col = ispyHex(e.col), f = e.flip || 1;
  g.save(); g.translate(e.x, e.y); g.scale(e.s * f, e.s);
  g.fillStyle = 'rgba(40,30,20,.18)'; ell(g, 0, 0, 48, 4); g.fill();
  [-32, 32].forEach(x => { g.strokeStyle = '#26262b'; g.lineWidth = 3.5; circ(g, x, -17, 16); g.stroke();
    g.strokeStyle = 'rgba(80,80,80,.45)'; g.lineWidth = 0.8; for (let k = 0; k < 6; k++){ const a = k / 6 * Math.PI; g.beginPath(); g.moveTo(x + Math.cos(a) * 15, -17 + Math.sin(a) * 15); g.lineTo(x - Math.cos(a) * 15, -17 - Math.sin(a) * 15); g.stroke(); } });
  g.strokeStyle = col; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-32, -17); g.lineTo(-2, -17); g.lineTo(-10, -44); g.lineTo(-32, -17); g.moveTo(-10, -44); g.lineTo(22, -44); g.lineTo(-2, -17); g.moveTo(22, -44); g.lineTo(32, -17); g.stroke();
  if (e.col === 'bianco'){ g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.stroke(); }
  g.strokeStyle = '#3a3a3a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(22, -44); g.lineTo(24, -54); g.lineTo(16, -57); g.stroke();
  g.fillStyle = '#26262b'; rr(g, -18, -52, 15, 5, 2.5); g.fill(); g.fillRect(-11, -48, 2.5, 5);
  g.fillStyle = '#a5743f'; rr(g, 25, -58, 18, 13, 2); g.fill(); g.strokeStyle = '#7a5530'; g.lineWidth = 1; for (let x = 28; x < 43; x += 4){ g.beginPath(); g.moveTo(x, -58); g.lineTo(x, -45); g.stroke(); }
  g.restore();
}
function ispyDrawTable(g, sc, e){
  g.save(); g.translate(e.x, e.y); g.scale(e.s, e.s);
  g.fillStyle = 'rgba(40,30,20,.2)'; ell(g, 0, 0, 30, 5); g.fill();
  g.fillStyle = '#3b3b42'; g.fillRect(-3, -60, 6, 58); ell(g, 0, -2, 16, 4); g.fill();
  g.fillStyle = '#c9c2b4'; ell(g, 0, -61, 42, 9); g.fill();
  g.fillStyle = '#f4f0e8'; ell(g, 0, -63, 42, 8.5); g.fill();
  if (!sc.ents.some(o => o.on === e.id)){ g.fillStyle = '#fff'; rr(g, -16, -72, 9, 7, 2); g.fill(); g.strokeStyle = '#bdb6a8'; g.lineWidth = 1; g.stroke(); g.fillStyle = '#6b4a32'; ell(g, -11.5, -71.5, 3.5, 1.2); g.fill(); }
  g.restore();
}
function ispyDrawChair(g, e){
  const col = '#2e5d48';
  g.save(); g.translate(e.x, e.y); g.scale(e.s, e.s);
  g.strokeStyle = col; g.lineWidth = 2.6; g.lineCap = 'round';
  [-14, 14].forEach(x => { g.beginPath(); g.moveTo(x, -40); g.lineTo(x * 1.12, 0); g.stroke(); });
  g.beginPath(); g.moveTo(-15, -40); g.lineTo(-15, -76); g.quadraticCurveTo(0, -84, 15, -76); g.lineTo(15, -40); g.stroke();
  g.lineWidth = 1.8; [-66, -56].forEach(y => { g.beginPath(); g.moveTo(-15, y); g.quadraticCurveTo(0, y - 5, 15, y); g.stroke(); });
  g.fillStyle = '#b98a4e'; rr(g, -17, -44, 34, 6, 2.5); g.fill();
  g.restore();
}
function ispyDrawFountain(g, e, t){
  g.save(); g.translate(e.x, e.y); g.scale(e.s, e.s);
  g.fillStyle = 'rgba(40,30,20,.18)'; ell(g, 0, 2, 130, 12); g.fill();
  g.fillStyle = '#e6dfcf'; ell(g, 0, -44, 124, 17); g.fill();
  g.fillStyle = '#79b3cf'; ell(g, 0, -44, 112, 12); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.5;
  for (let k = 0; k < 4; k++){ const ph = RM ? k * 0.25 : ((t * 0.4 + k * 0.25) % 1); g.globalAlpha = 1 - ph; ell(g, 0, -44, 14 + ph * 90, 2 + ph * 8); g.stroke(); }
  g.globalAlpha = 1;
  g.fillStyle = '#d9d0bd'; g.fillRect(-11, -120, 22, 78); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(4, -120, 7, 78);
  g.fillStyle = '#cfc5af'; g.beginPath(); g.moveTo(-36, -104); g.quadraticCurveTo(0, -84, 36, -104); g.closePath(); g.fill();
  g.fillStyle = '#e9e2d2'; ell(g, 0, -104, 36, 7); g.fill(); g.fillStyle = '#79b3cf'; ell(g, 0, -104, 30, 4.5); g.fill();
  g.fillStyle = '#d9d0bd'; g.fillRect(-4, -126, 8, 22); g.fillStyle = '#e9e2d2'; circ(g, 0, -128, 5); g.fill();
  /* water: the jets and drops */
  g.strokeStyle = 'rgba(160,210,235,.9)'; g.lineWidth = 2.2;
  [-1, 1].forEach(d => { g.beginPath(); g.moveTo(0, -130); g.quadraticCurveTo(d * 18, -146, d * 28, -106); g.stroke();
    g.beginPath(); g.moveTo(d * 34, -103); g.quadraticCurveTo(d * 52, -96, d * 60, -48); g.stroke(); });
  g.fillStyle = 'rgba(200,232,248,.95)';
  for (let k = 0; k < 8; k++){ const ph = RM ? k / 8 : ((t * 0.9 + k / 8) % 1), d = k % 2 ? 1 : -1;
    const x = d * (34 + ph * 26), y = -103 + ph * ph * 55; circ(g, x, y, 1.6); g.fill(); }
  /* the front of the basin */
  g.fillStyle = '#d6cdb8'; g.beginPath(); g.moveTo(-124, -44); g.lineTo(-124, -10); g.ellipse(0, -10, 124, 17, 0, Math.PI, 0, true); g.lineTo(124, -44); g.ellipse(0, -44, 124, 17, 0, 0, Math.PI, false); g.closePath(); g.fill();
  g.fillStyle = 'rgba(90,75,55,.16)'; g.beginPath(); g.moveTo(-124, -22); g.lineTo(-124, -10); g.ellipse(0, -10, 124, 17, 0, Math.PI, 0, true); g.lineTo(124, -22); g.ellipse(0, -22, 124, 17, 0, 0, Math.PI, false); g.closePath(); g.fill();
  g.strokeStyle = '#f0eadc'; g.lineWidth = 5; g.beginPath(); g.ellipse(0, -44, 122, 16, 0, 0, Math.PI); g.stroke();
  g.strokeStyle = 'rgba(120,105,80,.3)'; g.lineWidth = 1; for (let k = -3; k <= 3; k++){ const x = k * 34; g.beginPath(); g.moveTo(x, -28 + Math.abs(k) * -1.5); g.lineTo(x, 7 - Math.abs(k) * 1.5); g.stroke(); }
  g.restore();
}
function ispyDrawTree(g, e, t){
  const s = e.s, rust = RM ? 0 : Math.sin(t * 0.6 + e.ph) * 1.5;
  g.save(); g.translate(e.x, e.y); g.scale(s, s);
  g.fillStyle = 'rgba(40,30,20,.2)'; ell(g, 0, 0, 40, 7); g.fill();
  g.fillStyle = '#9a8a6e'; g.beginPath(); g.moveTo(-13, 0); g.lineTo(-8, -170); g.lineTo(8, -170); g.lineTo(13, 0); g.closePath(); g.fill();
  g.fillStyle = '#cfc3a4'; [[-5, -40, 6, 9], [3, -90, 5, 8], [-4, -130, 4, 7], [4, -20, 5, 6]].forEach(([x, y, rx, ry]) => { ell(g, x, y, rx, ry); g.fill(); });
  g.strokeStyle = '#9a8a6e'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-4, -160); g.lineTo(-38, -212); g.moveTo(4, -165); g.lineTo(36, -220); g.stroke();
  const greens = ['#3f7a42', '#4f8d4c', '#5f9d55', '#467f45'];
  [[-46, -226, 52], [44, -232, 50], [0, -258, 58], [-20, -200, 44], [26, -198, 42], [0, -222, 50]].forEach(([x, y, r], i) => { g.fillStyle = greens[i % 4]; circ(g, x + rust * (i % 2 ? 1 : -1), y, r); g.fill(); });
  g.fillStyle = 'rgba(255,255,220,.12)'; circ(g, -20 + rust, -262, 26); g.fill();
  g.restore();
}
function ispyDrawThing(g, e){
  g.save(); g.translate(e.x, e.y); g.scale(e.s, e.s);
  if (e.kind === 'borsa'){ if (e.on == null && e.under == null){ g.fillStyle = 'rgba(40,30,20,.18)'; ell(g, 0, 0, 12, 3); g.fill(); }
    g.strokeStyle = ispyShade(ispyHex(e.col), -0.35); g.lineWidth = 2; g.beginPath(); g.arc(0, -15, 6, Math.PI, 0); g.stroke(); ispyBagShape(g, 0, 0, ispyHex(e.col), 1); }
  else if (e.kind === 'cappello') ispyHatShape(g, 0, -3, ispyHex(e.col), 11);
  g.restore();
}
function ispyDrawEnt(g, sc, e, t){
  if (e.holder != null || e.kind === 'museo' || e.kind === 'orologio') return;
  if (ISPY_BODY[e.kind]) return ispyDrawPerson(g, sc, e, t);
  ({ gatto:ispyDrawCat, cane:ispyDrawDog, piccione:ispyDrawPigeon, bicicletta:ispyDrawBike, fontana:ispyDrawFountain, albero:ispyDrawTree,
    sedia:ispyDrawChair, tavolo:(g2, e2) => ispyDrawTable(g2, sc, e2) }[e.kind] || ispyDrawThing)(g, e, t);
}
/* the whole view: background (cached), clouds, the cast in depth order, the clock hands, effects */
function ispyPaint(g, sc, opt){
  const L = sc.L, t = opt.t || 0;
  if (opt.bg) g.drawImage(opt.bg, 0, 0, L.W, L.H); else ispyDrawBg(g, L, opt.seed || 1);
  /* clouds drift slowly across the sky */
  g.fillStyle = 'rgba(255,253,246,.85)';
  [[0.12, 46, 1], [0.55, 26, 0.8], [0.86, 70, 1.2]].forEach(([x0, y, k], i) => {
    const x = ((x0 * L.W + (RM ? 0 : t * (5 + i * 2))) % (L.W + 160)) - 80;
    ell(g, x, y, 44 * k, 11 * k); g.fill(); ell(g, x + 20 * k, y - 8 * k, 26 * k, 11 * k); g.fill(); ell(g, x - 22 * k, y - 3 * k, 20 * k, 8 * k); g.fill();
  });
  ispyDrawHands(g, L, opt.clock == null ? 900 : opt.clock);
  sc.order.forEach(e => ispyDrawEnt(g, sc, e, t));
}

/* =========================================================
   TIME: "Che ore sono?" answered with tiles, parsed to a time and checked against the clock
   ========================================================= */
const ISPY_TT = [
  { g:'start', tiles:[['sono le', 'Sono le'], ["è l'una", "È l'una"]] },
  { g:'mins', tiles:[['e', 'e'], ['meno', 'meno'], ['un quarto', 'un quarto'], ['mezza', 'mezza']] },
  { g:'nums', tiles:Array.from({ length:24 }, (_, i) => ['n' + (i + 1), numIt(i + 1)]) },
  { g:'more', tiles:[['trenta', 'trenta'], ['quarantacinque', 'quarantacinque']] },
];
const ISPY_TLABEL = Object.fromEntries(ISPY_TT.flatMap(g => g.tiles));
const ispyNum = k => /^n\d+$/.test(k) ? +k.slice(1) : null;
const ISPY_MINW = { 'un quarto':15, mezza:30, trenta:30, quarantacinque:45 };
/* keys → { h, m, hour, conj, min, minKey } or { err } (h, m are what was said, 24-hour when the hour was 13–24) */
function ispyParseTime(keys){
  if (!keys.length) return { err:'empty' };
  let i = 1, hour;
  if (keys[0] === 'sono le'){
    hour = ispyNum(keys[1]);
    if (hour == null) return { err:keys.length === 1 ? 'nohour' : 'nohour2' };
    if (hour === 1) return { err:'una' };
    i = 2;
  } else if (keys[0] === "è l'una"){
    hour = 1;
    if (keys.length > 1 && ispyNum(keys[1]) != null) return { err:'unaextra' };
  } else return { err:ispyNum(keys[0]) != null ? 'start-num' : 'start' };
  if (i === keys.length) return { h:hour, m:0, hour, conj:null, min:0 };
  const conj = keys[i];
  if (conj !== 'e' && conj !== 'meno') return { err:ispyNum(conj) != null || ISPY_MINW[conj] ? 'noconj' : 'order' };
  const mk = keys[i + 1];
  if (mk == null) return { err:'nomin', conj };
  const min = ISPY_MINW[mk] != null ? ISPY_MINW[mk] : ispyNum(mk);
  if (min == null) return { err:'order' };
  if (keys.length > i + 2) return { err:ispyNum(keys[i + 2]) != null && ispyNum(mk) != null ? 'twonum' : 'extra' };
  if (conj === 'meno' && min >= 30) return { err:'menobig', minKey:mk };
  const tot = hour * 60 + (conj === 'e' ? min : -min);
  return { h:Math.floor(((tot % 1440) + 1440) % 1440 / 60), m:((tot % 60) + 60) % 60, hour, conj, min, minKey:mk, tot };
}
/* can the tiles say this minute exactly? (e 1–24, e un quarto / mezza / trenta / quarantacinque, meno 1–24) */
const ispySayable = m => m <= 24 || m === 30 || m === 45 || m >= 36;
/* right? 12-hour answers count modulo 12 hours; a minute that is not on a 5-minute mark may be read to the nearest
   3 minutes, and one the tiles cannot say (25–29, 31–35) to the nearest 5 */
function ispyTimeRight(p, clock){
  if (!p || p.err) return false;
  const tot = p.tot != null ? p.tot : p.hour * 60, mod = p.hour <= 12 ? 720 : 1440;
  const d0 = (((tot - clock) % mod) + mod) % mod, d = Math.min(d0, mod - d0), cm = clock % 60;
  return d === 0 || (cm % 5 !== 0 && d <= 3) || (!ispySayable(cm) && d <= 5);
}
const ISPY_EN_N = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
function ispyTimeEn(mins){
  const h24 = Math.floor(((mins % 1440) + 1440) % 1440 / 60), m = ((mins % 60) + 60) % 60, h = h24 % 12, nx = (h + 1) % 12;
  if (m === 0) return `${ISPY_EN_N[h]} o'clock`;
  if (m === 15) return `a quarter past ${ISPY_EN_N[h]}`;
  if (m === 30) return `half past ${ISPY_EN_N[h]}`;
  if (m === 45) return `a quarter to ${ISPY_EN_N[nx]}`;
  return m < 30 ? `${m} ${m === 1 ? 'minute' : 'minutes'} past ${ISPY_EN_N[h]}` : `${60 - m} minutes to ${ISPY_EN_N[nx]}`;
}
const ispyHHMM = mins => { const h = Math.floor(((mins % 1440) + 1440) % 1440 / 60), m = ((mins % 60) + 60) % 60; return `${h}:${String(m).padStart(2, '0')}`; };
const ispyTimeSentence = keys => { const t = keys.map(k => ISPY_TLABEL[k]).join(' '); return t ? t.charAt(0).toUpperCase() + t.slice(1) + '.' : ''; };
/* feedback on a wrong answer: about the player's own words, never the Italian answer */
function ispyTimeFb(keys, clock){
  const p = ispyParseTime(keys), W = k => `<i>${esc(ISPY_TLABEL[k] || k)}</i>`;
  const E = {
    empty:'Build the time with the tiles: start with the first row.',
    nohour:'Which hour? Add a number after <i>Sono le</i>.', nohour2:'After <i>Sono le</i> comes the hour, a number.',
    una:"One o'clock is singular: it has its own tile in the first row.",
    unaextra:"<i>È l'una</i> already says the hour: one o'clock.",
    start:'A time starts with <i>Sono le</i> (or <i>È l\'una</i>).', 'start-num':'Start with <i>Sono le</i> before the hour.',
    noconj:'Between the hour and the minutes you need <i>e</i> (past) or <i>meno</i> (to).',
    order:'The order is: the hour, then <i>e</i> or <i>meno</i>, then the minutes.',
    nomin:'How many minutes? Add them after ' + (p.conj ? W(p.conj) : 'it') + '.',
    twonum:'The minutes are one tile here.', extra:'Too many tiles: the hour, then <i>e</i> or <i>meno</i> and the minutes.',
    menobig:`${W(p.minKey)} goes with <i>e</i>: <i>meno</i> is for the last minutes before the hour.`,
  };
  if (p.err) return E[p.err] || E.order;
  const out = [], hour12 = p.hour <= 12;
  const ch = Math.floor(clock / 60), cm = clock % 60;
  /* what the minutes said */
  const saidM = p.conj === 'meno' ? 60 - p.min : p.min;
  const mWrong = Math.min(Math.abs(saidM - cm), 60 - Math.abs(saidM - cm)) > (cm % 5 ? 3 : 0) && !(!ispySayable(cm) && Math.abs(saidM - cm) <= 5);
  if (mWrong){
    const mk = p.minKey;
    if (!p.conj) out.push("Just the hour means o'clock: the long hand would be at the top, on the 12.");
    else if (mk === 'mezza' || mk === 'trenta') out.push(`${W(mk)} is half past: the long hand would point straight down, at the 6.`);
    else if (mk === 'un quarto') out.push(p.conj === 'e' ? '<i>e un quarto</i> is a quarter past: the long hand would be on the 3.' : '<i>meno un quarto</i> is a quarter to: the long hand would be on the 9.');
    else if (mk === 'quarantacinque') out.push(`${W(mk)} is 45 minutes past: the long hand would be on the 9.`);
    else out.push(p.conj === 'e' ? `<i>e</i> ${W(mk)} is ${p.min} minutes past the hour.` : `<i>meno</i> ${W(mk)} is ${p.min} minutes before the hour.`);
  }
  /* the hour */
  const want = p.conj === 'meno' ? (ch + 1) % 24 : cm > 40 && !p.conj ? ch : ch;
  const okH = hour12 ? p.hour % 12 === want % 12 : p.hour % 24 === want;
  if (!okH){
    const hk = 'n' + p.hour;
    if (p.conj === 'meno' && (hour12 ? p.hour % 12 === ch % 12 : p.hour === ch)) out.push('With <i>meno</i>, say the hour that is coming: the minutes are taken away from it.');
    else if (p.hour === 1 && keys[0] === "è l'una") out.push("<i>È l'una</i> is one o'clock. Look at the short hand.");
    else if (!hour12) out.push(`${W(hk)} is ${p.hour}:00, ${ISPY_EN_N[p.hour % 12]} in the ${p.hour < 18 ? 'afternoon' : p.hour < 21 ? 'evening' : 'night'}. Look at the short hand.`);
    else out.push(`${W(hk)} is the hour: ${ISPY_EN_N[p.hour % 12]}. Look at the short hand.`);
  }
  if (!out.length) out.push('Look at the clock on the tower again.');
  return out.join(' ');
}

/* =========================================================
   TOCCA A TE: the player describes something, Bruno looks for it
   ========================================================= */
const ISPY_BT = [
  { g:'Vedo', tiles:['vedo'] },
  { g:'how many', tiles:['un', 'una', 'il', 'la', "l'", 'due', 'tre'] },
  { g:'people', tiles:['uomo', 'uomini', 'donna', 'donne', 'bambino', 'bambini', 'bambina', 'bambine'] },
  { g:'animals', tiles:['gatto', 'gatti', 'cane', 'cani', 'piccione', 'piccioni'] },
  { g:'things', tiles:['bicicletta', 'biciclette', 'palloncino', 'borsa', 'ombrello', 'cappello', 'tavolo', 'sedia', 'fontana', 'albero', 'orologio', 'museo'] },
  { g:'with', tiles:['con', 'maglietta'] },
  { g:'colours', tiles:['rosso', 'rossa', 'bianco', 'bianca', 'nero', 'nera', 'giallo', 'gialla', 'verde', 'blu', 'rosa'] },
  { g:'where', tiles:['sotto', 'sopra', 'vicino a', 'davanti a', 'dietro', 'accanto a'] },
];
const ISPY_NOUNW = {}; Object.entries(ISPY_N).forEach(([k, N]) => { ISPY_NOUNW[N.sg] = { kind:k, pl:false }; ISPY_NOUNW[N.pl] = { kind:k, pl:true }; });
const ISPY_COLW = {}; ISPY_NAMED.forEach(c => ISPY_COL[c].f.forEach((w, i) => { (ISPY_COLW[w] = ISPY_COLW[w] || []).push({ col:c, i }); }));
const ISPY_PREPW = { sotto:'sotto', sopra:'sopra', 'vicino a':'vicino', 'davanti a':'davanti', dietro:'dietro', 'accanto a':'accanto' };
const ISPY_DETS = ['un', 'una', 'il', 'la', "l'", 'due', 'tre', 'uno'];
/* the sentence as written: vicino a + la = vicino alla */
function ispyBonusText(keys){
  const out = [];
  keys.forEach((k, i) => {
    const prev = out[out.length - 1];
    if (prev && / a$/.test(prev) && ISPY_A[k]){ out[out.length - 1] = prev.replace(/ a$/, ' ' + ISPY_A[k]); return; }
    if (prev && prev.endsWith("'")){ out[out.length - 1] = prev + k; return; }
    out.push(k);
  });
  const t = out.join(' ');
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}
/* parse a noun phrase at i: det noun [colour] → { kind, n, col, next } or { err } */
function ispyNP(keys, i, role){
  const det = keys[i], nw = keys[i + 1], W = w => `<i>${esc(w)}</i>`;
  if (det == null) return { err:role === 'target' ? 'After <i>Vedo</i>: what do you see? Start with <i>un</i>, <i>una</i>, <i>due</i>…' : 'Finish it: what is it?' };
  if (!ISPY_DETS.includes(det)) return ISPY_NOUNW[det] ? { err:`Put an article or a number before ${W(det)}: <i>un</i>, <i>una</i>, <i>il</i>, <i>la</i>…` } : { err:`${W(ISPY_TLABEL[det] || det)} can't go here.` };
  const N0 = ISPY_NOUNW[nw];
  if (!N0) return { err:nw == null ? `${W(det)} … what? Add a word for a person, an animal or a thing.` : `After ${W(det)} comes a noun (a person, an animal, a thing).` };
  const N = ISPY_N[N0.kind], pl = N0.pl, n = det === 'due' ? 2 : det === 'tre' ? 3 : 1;
  if (n > 1 && !pl) return { err:`After ${W(det)}, the plural: ${W(N.pl)}.` };
  if (n === 1 && pl) return { err:`${W(det)} is for one: ${W(N.sg)}.` };
  if (det === 'un' || det === 'uno'){ if (N.g === 'f') return { err:`${W(N.sg)} is feminine: <i>una</i>.` }; }
  if (det === 'una' && N.g === 'm') return { err:`${W(N.sg)} is masculine: <i>un</i>.` };
  if (det === 'il' || det === 'la' || det === "l'"){
    const want = ispyDefArt(N0.kind);
    if (det !== want) return { err:want === "l'" ? `${W(N.sg)} starts with a vowel: <i>l'</i>.` : `${W(N.sg)} is ${N.g === 'f' ? 'feminine' : 'masculine'}: ${W(want)}.` };
  }
  let j = i + 2, col = null;
  const cw = keys[j];
  if (cw && ISPY_COLW[cw]){
    const c = ISPY_COLW[cw][0].col, want = ispyColW(c, N.g, pl);
    if (want !== cw) return { err:`${W(pl ? N.pl : N.sg)} is ${N.g === 'f' ? 'feminine' : 'masculine'}${pl ? ' plural' : ''}: ${W(want)}.` };
    col = c; j++;
  }
  return { kind:N0.kind, n, col, def:['il', 'la', "l'"].includes(det), next:j };
}
function ispyParseBonus(keys){
  if (!keys.length) return { err:'Build a sentence with the tiles. Start with <i>Vedo</i>.' };
  if (keys[0] !== 'vedo') return { err:'Start with <i>Vedo</i>: I see…' };
  const a = ispyNP(keys, 1, 'target'); if (a.err) return a;
  const d = { kind:a.kind, n:a.n, col:a.col };
  let j = a.next;
  if (keys[j] === 'con'){
    const b = ispyNP(keys, j + 1, 'with'); if (b.err) return b;
    if (!['maglietta', 'cappello', 'borsa', 'ombrello', 'palloncino'].includes(b.kind)) return { err:'<i>con</i> + something a person has: a T-shirt, a hat, a bag, an umbrella, a balloon.' };
    if (b.n > 1) return { err:'One thing after <i>con</i> is enough.' };
    d.with = { item:b.kind, col:b.col }; j = b.next;
  }
  if (ISPY_PREPW[keys[j]]){
    const prep = ISPY_PREPW[keys[j]];
    if (ISPY_NOUNW[keys[j + 1]]) return { err:`Add an article before <i>${esc(keys[j + 1])}</i>: <i>il</i>, <i>la</i>, <i>l'</i>, <i>un</i> or <i>una</i>.` };
    const c = ispyNP(keys, j + 1, 'where'); if (c.err) return c;
    if (c.n > 1) return { err:'Say it for one thing: <i>un tavolo</i>, <i>la fontana</i>…' };
    d.rel = { prep, anchor:c.kind, def:c.def }; j = c.next;
  }
  if (j < keys.length) return { err:keys[j] === 'con' ? '<i>con</i> comes before where it is.' : `${esc(ispyBonusText(keys.slice(j)))}: that part doesn't fit. The order is: what, <i>con</i> …, where.` };
  return { desc:d };
}
const ispyPron = d => { const g = ISPY_N[d.kind].g, pl = (d.n || 1) > 1; return pl ? (g === 'f' ? 'le' : 'li') : (g === 'f' ? 'la' : 'lo'); };

/* =========================================================
   THE GAME (a modal)
   ========================================================= */
const ISPY_TIERS10 = [1, 1, 1, 2, 2, 2, 3, 3, 4, 4];
const ISPY_RIGHT = [['Giusto!', 'Right!'], ['Esatto!', 'Exactly!'], ['Bravo!', 'Well done!']];
const ISPY_TIER_NOTE = {
  1:'Bruno describes something in the square. Find it and click on it (or tap it).',
  2:'Now Bruno adds a colour. Listen to the ending: it agrees with the thing, <i>un cappello nero</i>, <i>una borsa nera</i>.',
  3:'Now: how many? Listen for the number and the plural (careful: <i>l’uomo → gli uomini</i>).',
  4:'Now: where? <i>sotto</i>, <i>sopra</i>, <i>vicino a</i>, <i>davanti a</i>, <i>dietro</i>, <i>accanto a</i>.',
};
let ISPY_FORCE = false;
const ispyUnlocked = () => ISPY_FORCE || lessonCompleted(10);
const ISP = { open:false, tok:0 };
const ispyIsOpen = () => modalOpen && sheet.classList.contains('ispy');
const ispyBruno = () => (typeof NPC !== 'undefined' && NPC.bruno && NPC.bruno.pitch) || 0.75;
const ispyToMin = t => t == null ? null : typeof t === 'number' ? t : typeof t === 'string' ? (([h, m]) => +h * 60 + +m)(t.split(':')) : t.h * 60 + (t.m || 0);
const ispyHM = mins => { const v = ((Math.round(mins) % 1440) + 1440) % 1440; return { h:Math.floor(v / 60), m:v % 60 }; };

function openISpy(opts = {}){
  if (introOpen) return;
  ispyStop(false);
  const finds = Math.max(1, Math.min(20, opts.finds || 10));
  const tiers = opts.tiers || Array.from({ length:finds }, (_, i) => ISPY_TIERS10[Math.min(9, Math.floor(i * 10 / finds))]);
  const layout = opts.layout || (innerWidth < 700 && innerHeight > innerWidth ? 'tall' : 'wide');
  const start = ispyToMin(opts.start) != null ? ispyToMin(opts.start) : 15 * 60, step = opts.step != null ? opts.step : 6;
  const found = Math.max(0, Math.min(finds, opts.found || 0));
  Object.assign(ISP, { open:true, tok:ISP.tok + 1, o:opts, mode:opts.studio ? 'studio' : 'lesson', layout, L:ISPY_LAYOUTS[layout],
    seed:opts.seed != null ? opts.seed >>> 0 : Math.floor(Math.random() * 1e9), N:finds, tiers, k:found, start, step,
    clock:start + found * step, shown:start + found * step, asks:(opts.timeAsks || []).map(a => typeof a === 'number' ? { after:a } : { at:ispyToMin(a) }),
    round:null, miss:0, misses:0, phase:'find', fx:[], used:[], time:null, bonus:null, done:false, result:null,
    stats:{ asked:0, right:0, wrong:0 }, react:null, fb:'', dirty:true, t0:performance.now(), lastT:performance.now(), closed:false });
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  openModal('ispy');
  sheet.innerHTML = `<div class="isp-head"><div class="isp-title"><p class="kicker">${ISP.mode === 'studio' ? '<button class="st-back" data-isp="studio">← Studio</button>' : ''}<span>${esc(opts.kicker || 'Vedo, vedo · I spy')}</span></p>
      <h2>Vedo, <em>vedo</em></h2></div><div class="isp-prog" id="ispProg"></div><button class="x" data-close aria-label="Close the game">×</button></div>
    <div class="isp-main" id="ispMain">
      <div class="isp-view" id="ispView"><canvas id="ispCv" aria-label="The museum square, at eye level: people, animals and things to find"></canvas><div class="isp-stamp" id="ispStamp" aria-live="polite"></div></div>
      <div class="isp-side">
        <div class="isp-bruno"><div class="nameplate">Bruno</div><div class="bubble"><div class="row"><p class="it" id="ispLine"></p>
          <button class="mini" data-isp="say" aria-label="Hear it again">${SPK}</button></div><p class="en" id="ispEn" hidden></p></div>
          <div class="bubble isp-react" id="ispReact" hidden></div></div>
        <div class="isp-fb" id="ispFb"></div>
        <div class="isp-panel" id="ispPanel"></div>
      </div>
    </div>`;
  ISP.cv = $('#ispCv'); ISP.g = ISP.cv.getContext('2d');
  ISP.cv.addEventListener('pointerdown', ispyPointer);
  ispyFit();
  if (opts.onClock) opts.onClock(ispyHM(ISP.clock));
  if (ISP.k >= ISP.N) ispyFinish(); else ispyNext();
  requestAnimationFrame(ispyFrame);
}
/* the scene canvas fits its box (desktop: beside Bruno; phone: full width, cropped to the clock during a time question) */
function ispyFit(){
  if (!ispyIsOpen() || !ISP.cv) return;
  const v = $('#ispView'), L = ISP.L, narrow = matchMedia('(max-width: 860px)').matches;
  v.style.height = '';
  const w = v.clientWidth || 300, h = narrow ? w * L.H / L.W : (v.clientHeight || 300);
  const k = Math.min(w / L.W, h / L.H);
  ISP.zoom = k; ISP.narrow = narrow;
  const cw = Math.round(L.W * k), ch = Math.round(L.H * k);
  ISP.cv.style.width = cw + 'px'; ISP.cv.style.height = ch + 'px';
  ISP.cv.width = Math.round(cw * DPR); ISP.cv.height = Math.round(ch * DPR);
  if (narrow) v.style.height = (ISP.phase === 'time' ? Math.round(ch * (L.tower.clock.y + L.tower.clock.r + 70) / L.H) : ch) + 'px';
  v.classList.toggle('crop', narrow && ISP.phase === 'time');
  const bg = document.createElement('canvas'); bg.width = ISP.cv.width; bg.height = ISP.cv.height;
  const bgc = bg.getContext('2d'); bgc.setTransform(k * DPR, 0, 0, k * DPR, 0, 0); ispyDrawBg(bgc, L, ISP.seed);
  ISP.bg = bg; ISP.dirty = true;
  ISP.rad = Math.max(14, ((matchMedia('(pointer: coarse)').matches || narrow) ? 34 : 24) / k);
}
addEventListener('resize', () => { if (ISP.open && ispyIsOpen()) ispyFit(); });

function ispyFrame(now){
  if (!ISP.open) return;
  if (!ispyIsOpen()){ ispyStop(true); return; }
  const dt = Math.min(0.1, (now - ISP.lastT) / 1000); ISP.lastT = now;
  /* the clock sweeps towards its time */
  if (ISP.shown !== ISP.clock){ const d = ISP.clock - ISP.shown, st = RM ? Math.abs(d) : Math.max(0.4, Math.abs(d) * 3 * dt, 14 * dt); ISP.shown = Math.abs(d) <= st ? ISP.clock : ISP.shown + Math.sign(d) * st; ISP.dirty = true; }
  ISP.fx = ISP.fx.filter(f => now - f.t0 < f.dur);
  if (!RM || ISP.dirty || ISP.fx.length){
    const g = ISP.g, sc = ISP.round && ISP.round.scene;
    g.setTransform(ISP.zoom * DPR, 0, 0, ISP.zoom * DPR, 0, 0);
    if (sc) ispyPaint(g, sc, { bg:ISP.bg, t:RM ? 0 : (now - ISP.t0) / 1000, clock:ISP.shown });
    ispyDrawFx(g, now);
    ISP.dirty = false;
  }
  requestAnimationFrame(ispyFrame);
}
function ispyDrawFx(g, now){
  ISP.fx.forEach(f => {
    const a = (now - f.t0) / f.dur, r = f.rect;
    g.save();
    if (f.type === 'ring' || f.type === 'found'){
      const pad = 8 + (f.type === 'found' ? Math.sin(now / 160) * 3 : a * 6), col = f.type === 'found' ? '#f4b928' : '#2e8a4e';
      g.globalAlpha = f.type === 'found' ? 1 : Math.min(1, 2.2 - 2 * a); g.strokeStyle = col; g.lineWidth = 4; g.setLineDash(f.type === 'found' ? [8, 5] : []);
      ell(g, r.x + r.w / 2, r.y + r.h / 2, r.w / 2 + pad, r.h / 2 + pad); g.stroke();
    } else if (f.type === 'miss'){
      g.globalAlpha = 1 - a; g.strokeStyle = '#c23b2a'; g.lineWidth = 4; g.lineCap = 'round'; const s = 9;
      g.beginPath(); g.moveTo(f.x - s, f.y - s); g.lineTo(f.x + s, f.y + s); g.moveTo(f.x + s, f.y - s); g.lineTo(f.x - s, f.y + s); g.stroke();
    } else if (f.type === 'spark'){
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2, R0 = Math.max(r.w, r.h) / 2 + 14;
      for (let k = 0; k < 8; k++){
        const ang = k / 8 * Math.PI * 2 + now / 900, tw = 0.5 + 0.5 * Math.sin(now / 110 + k * 1.7), s = 4 + tw * 6;
        const x = cx + Math.cos(ang) * R0, y = cy + Math.sin(ang) * R0 * 0.8;
        g.globalAlpha = Math.min(1, (1 - a) * 3); g.fillStyle = k % 2 ? '#f4b928' : '#fffbe8';
        g.beginPath(); for (let i = 0; i < 8; i++){ const rr2 = i % 2 ? s * 0.35 : s, an = i / 8 * Math.PI * 2; g.lineTo(x + Math.cos(an) * rr2, y + Math.sin(an) * rr2); } g.closePath(); g.fill();
      }
      g.globalAlpha = 0.5 * (1 - a); g.strokeStyle = '#f4b928'; g.lineWidth = 3; ell(g, cx, cy, r.w / 2 + 8, r.h / 2 + 8); g.stroke();
    }
    g.restore();
  });
}
/* closing: by the × button, Escape, a click outside, or another modal opening */
function ispyStop(viaClose){
  if (!ISP.open) return;
  ISP.open = false; ISP.tok++;
  if (viaClose && ISP.o && ISP.o.onClose) try { ISP.o.onClose({ done:ISP.done, finds:ISP.k, clock:ispyHM(ISP.clock) }); } catch(e){ console.error(e); }
}

/* ---------- Bruno speaks ---------- */
/* show a line, say it, then cb() once the voice has finished (or after a moment, without a voice) */
/* gloss: the English shown under a reaction (Bruno's Giusto! Ritenta!… are glossed in place, not Vocabolario cards: Lesson 10's
   cap); default en, '' for none */
function ispySay(it, cb, where = 'react', en, gloss){
  const tok = ISP.tok;
  if (where === 'line'){ ISP.line = { it, en }; ISP.react = null; }
  else ISP.react = { it, en, gloss:gloss === undefined ? en : gloss };
  ispyUI();
  speak(it, ispyBruno());
  const t0 = performance.now(), quiet = !hasTTS || !S.sound, min = quiet ? 450 + it.length * 28 : 250;
  const wait = () => { if (tok !== ISP.tok) return; if (performance.now() - t0 < min || (!quiet && speechBusy())){ setTimeout(wait, 60); return; } if (cb) cb(); };
  setTimeout(wait, 60);
}
const ispyLater = (ms, cb) => { const tok = ISP.tok; setTimeout(() => { if (tok === ISP.tok) cb(); }, ms); };

/* ---------- rounds ---------- */
function ispyNext(){
  const k = ISP.k, tier = ISP.tiers[k] || 4;
  const avoid = ISP.used.slice(-4);
  ISP.round = ispyRound(ISP.seed, k, tier, ISP.layout, avoid) || ispyRound(ISP.seed + 1, k, tier, ISP.layout, []);
  ISP.used.push(ISP.round.desc.kind); if (ISP.round.desc.rel) ISP.used.push(ISP.round.desc.rel.prep);
  ISP.miss = 0; ISP.phase = 'find'; ISP.fx = []; ISP.dirty = true;
  const firstOfTier = k === 0 || ISP.tiers[k - 1] !== tier || k === (ISP.o.found || 0);
  ISP.fb = firstOfTier ? ISPY_TIER_NOTE[tier] : '';
  ISP.revealEn = false;
  ispySay(ISP.round.line.it, null, 'line', ISP.round.line.en);
}
function ispyPointer(ev){
  if (!ISP.open || !ISP.round) return;
  const r = ISP.cv.getBoundingClientRect(), lx = (ev.clientX - r.left) / ISP.zoom, ly = (ev.clientY - r.top) / ISP.zoom;
  if (ev.pointerType === 'touch') ISP.rad = Math.max(ISP.rad, 34 / ISP.zoom);
  if (ISP.phase === 'find') ispyClickFind(lx, ly);
}
/* what counts as the target: its own shape, what it is held by or holds, a table's chairs and sitters */
function ispyParts(sc, e){
  const ps = [e.rect, ...ispyHeld(sc, e).map(h => h.rect)];
  if (e.holder != null) ps.push(sc.byId[e.holder].rect);
  if (e.kind === 'tavolo') [...ispyOcc(sc, e), ...ispyChairs(sc, e)].forEach(o => ps.push(o.rect, ...ispyHeld(sc, o).map(h => h.rect)));
  return ps;
}
function ispyHitTest(round, lx, ly, rad){
  const sc = round.scene, M = round.matches.map(id => sc.byId[id]);
  if (M.some(e => ispyParts(sc, e).some(p => ispyIn(p, lx, ly)))) return true;
  const linked = o => M.some(m => m.holder === o.id || o.holder === m.id || (m.kind === 'tavolo' && ((o.seat && o.seat.table === m.id) || o.chairOf === m.id)));
  if (sc.ents.some(o => !M.includes(o) && !o.fixed && o.kind !== 'tavolo' && o.kind !== 'sedia' && !linked(o) && ispyIn(o.core, lx, ly))) return false;
  const dist = p => Math.hypot(Math.max(p.x - lx, 0, lx - p.x - p.w), Math.max(p.y - ly, 0, ly - p.y - p.h));
  return M.some(e => ispyParts(sc, e).some(p => dist(p) <= rad));
}
function ispyClickFind(lx, ly){
  const R0 = ISP.round, sc = R0.scene;
  if (ispyHitTest(R0, lx, ly, ISP.rad)){
    ISP.phase = 'right'; ISP.k++;
    R0.matches.forEach(id => ISP.fx.push({ type:'ring', rect:ispyUnion(ispyParts(sc, sc.byId[id]).slice(0, 1)), t0:performance.now(), dur:1600 }));
    ispyStamp(ISPY_RIGHT[(ISP.k + ISP.seed) % 3][0]);
    ISP.revealEn = true; ISP.fb = '';
    if (ISP.o.onFind) try { ISP.o.onFind(ISP.k, { desc:R0.desc, line:R0.line, tier:R0.tier }); } catch(e){ console.error(e); }
    const [it, en] = ISPY_RIGHT[(ISP.k + ISP.seed) % 3];
    ispySay(it, () => ispyLater(450, ispyAfterFind), 'react', en);
    return;
  }
  ISP.miss++; ISP.misses++;
  ISP.fx.push({ type:'miss', x:lx, y:ly, t0:performance.now(), dur:900 });
  const v = $('#ispView'); v.classList.remove('shake'); void v.offsetWidth; v.classList.add('shake');
  if (ISP.miss >= 3){
    ISP.fx.push({ type:'spark', rect:ispUnionTarget(), t0:performance.now(), dur:2600 });
    ISP.fb = 'Look where it sparkles.';
    ispySay('No, sbagliato! È lì! Vedi?', null, 'react', "No, wrong! It's there! See?");
  } else if (ISP.miss === 2){
    ISP.fb = 'Bruno gives you a clue.';
    ispySay(`No, sbagliato! Ritenta! ${R0.clue.it}`, null, 'react', `No, wrong! Try again! ${R0.clue.en}`, 'No, wrong! Try again!');   // (the clue itself is to be understood: no English)
  } else {
    ISP.fb = 'Not that one. Listen again (🔊) and look again.';
    ispySay('No, sbagliato! Ritenta!', null, 'react', 'No, wrong! Try again!');
  }
}
const ispUnionTarget = () => { const sc = ISP.round.scene; return ispyUnion(ISP.round.matches.map(id => sc.byId[id].rect)); };
function ispyStamp(text){
  const s = $('#ispStamp'); if (!s) return;
  s.innerHTML = `<span>${esc(text)}</span>`; s.classList.remove('on'); void s.offsetWidth; s.classList.add('on');
}
/* after a find: the clock moves on (stopping for any time question on the way), then the next round or the end */
function ispyAfterFind(){
  const k = ISP.k, from = ISP.start + (k - 1) * ISP.step, to = ISP.start + k * ISP.step;
  const due = ISP.asks.filter(a => !a.done && (a.after === k || (a.at != null && a.at > from && a.at <= to)))
    .map(a => ({ a, at:a.after === k ? to : a.at })).sort((x, y) => x.at - y.at);
  const step = () => {
    const d = due.shift();
    if (d){ d.a.done = true; ispyClockTo(d.at, () => ispyAskTime(d.at, step)); return; }
    ispyClockTo(to, () => { if (ISP.k >= ISP.N) ispyFinish(); else ispyNext(); });
  };
  step();
}
function ispyClockTo(mins, cb){
  const moved = ISP.clock !== mins; ISP.clock = mins; ISP.dirty = true;
  if (moved && ISP.o.onClock) try { ISP.o.onClock(ispyHM(mins)); } catch(e){ console.error(e); }
  const tok = ISP.tok, wait = () => { if (tok !== ISP.tok) return; if (Math.abs(ISP.shown - ISP.clock) > 0.01 && !RM){ setTimeout(wait, 60); return; } ispyLater(250, cb); };
  wait();
}

/* ---------- Che ore sono? ---------- */
function ispyAskTime(at, cb){
  ISP.phase = 'time'; ISP.time = { at, tries:0, built:[], fb:'', cb, ok:false }; ISP.revealEn = false;
  ISP.stats.asked++;
  ISP.fb = 'Read the clock on the tower, then answer with the tiles.';
  ispyFit();
  ispySay('Che ore sono?', null, 'line', 'What time is it?');
}
function ispyTimeSubmit(){
  const T = ISP.time; if (!T || T.ok) return;
  const keys = T.built.slice();
  if (!keys.length){ ISP.fb = ispyTimeFb(keys, T.at); ispyUI(); return; }
  const p = ispyParseTime(keys), ok = ispyTimeRight(p, T.at), said = ispyTimeSentence(keys);
  T.tries++;
  const info = { asked:ispyHM(T.at), said, parsed:p.err ? null : { h:p.h, m:p.m }, ok, tries:T.tries };
  if (ISP.o.onTimeAnswer) try { ISP.o.onTimeAnswer(info); } catch(e){ console.error(e); }
  if (ok){
    T.ok = true; ISP.stats.right++; ISP.fb = ''; T.fb = '';
    ispyStamp('Esatto!');
    ispySay(`Esatto! ${said}`, () => ispyLater(400, () => { ISP.time = null; ISP.phase = 'right'; ispyFit(); T.cb(); }), 'react', `Exactly! (${ispyTimeEn(T.at)})`);
    return;
  }
  ISP.stats.wrong++;
  T.fb = ispyTimeFb(keys, T.at);
  if (T.tries >= 3) T.fb += ` <span class="isp-strong">The clock says <b>${ispyTimeEn(T.at)}</b>. Now say it in Italian.</span>`;
  ISP.fb = '';
  const pan = $('#ispPanel'); if (pan) pan.classList.remove('shake');
  ispySay('No, sbagliato! Ritenta!', () => { const p2 = $('#ispPanel'); if (p2){ void p2.offsetWidth; } }, 'react', 'No, wrong! Try again!');
}
function ispyTimeSkip(){
  const T = ISP.time; if (!T) return;
  if (ISP.o.onTimeAnswer) try { ISP.o.onTimeAnswer({ asked:ispyHM(T.at), said:'', parsed:null, ok:false, tries:T.tries, skipped:true }); } catch(e){ console.error(e); }
  ISP.time = null; ISP.phase = 'right'; ispyFit(); T.cb();
}

/* ---------- the end, and the bonus round ---------- */
function ispyFinish(){
  ISP.phase = ISP.o.bonus ? 'bonus-offer' : 'done';
  ISP.fb = '';
  const end = ISP.o.endLine || { it:'Bravo!', en:'Well done!' };
  if (ISP.o.bonus) ispySay(end.it, () => ispySay('Tocca a te!', null, 'line', 'Your turn!'), 'line', end.en);
  else { ispyDone(); ispySay(end.it, null, 'line', end.en); }
}
function ispyBonusStart(){
  ISP.phase = 'bonus';
  ISP.round = ispyRound(ISP.seed, 99, 4, ISP.layout, []) || ISP.round;
  ISP.bonus = { built:[], tries:0, found:0, said:'', result:null, fb:'', highlight:null }; ISP.revealEn = false;
  ISP.fx = []; ISP.dirty = true;
  ISP.fb = 'Describe something you see: <i>Vedo un…</i> / <i>Vedo una…</i>, with <i>con …</i> or where it is if you like. Bruno looks for it.';
  ispySay('Tocca a te!', null, 'line', 'Your turn!');
}
function ispyBonusSubmit(){
  const B = ISP.bonus; if (!B) return;
  const p = ispyParseBonus(B.built);
  if (p.err){ B.fb = p.err; B.result = 'bad'; ispyUI(); ispySay('No, sbagliato! Ritenta!', null, 'react', 'No, wrong! Try again!'); return; }
  B.tries++; B.said = ispyBonusText(B.built) + '.';
  const sc = ISP.round.scene, m = ispyMatch(sc, p.desc);
  B.fb = '';
  ISP.fx = ISP.fx.filter(f => f.type !== 'found');
  if (m.length){
    B.found++; B.result = 'found'; B.highlight = m.map(e => e.id);
    m.forEach(e => ISP.fx.push({ type:'found', rect:e.rect, t0:performance.now(), dur:1e9 }));
    const pr = ispyPron(p.desc), ecco = 'Ecco' + { lo:'lo', la:'la', li:'li', le:'le' }[pr];
    ispySay(`Sì! ${ecco}!`, null, 'react', `Yes! There ${pr === 'li' || pr === 'le' ? 'they are' : 'it is'}!`);
  } else {
    B.result = 'none'; B.highlight = null;
    const pr = ispyPron(p.desc);
    ispySay(`No… Non ${pr} vedo!`, null, 'react', `No… I can't see ${pr === 'li' || pr === 'le' ? 'them' : 'it'}!`);
  }
  B.built = [];
  ispyUI();
}
function ispyDone(){
  if (ISP.done) return;
  ISP.done = true; ISP.phase = 'done'; ISP.fb = '';
  const B = ISP.bonus;
  ISP.result = { finds:ISP.k, misses:ISP.misses, clock:ispyHM(ISP.clock), time:{ ...ISP.stats }, bonus:{ played:!!B, tries:B ? B.tries : 0, found:B ? B.found : 0 } };
  if (ISP.o.onDone) try { ISP.o.onDone(ISP.result); } catch(e){ console.error(e); }
  ispyUI();
}

/* ---------- the panel beside (or under) the view ---------- */
function ispyUI(){
  if (!ispyIsOpen()) return;
  const prog = $('#ispProg');
  prog.innerHTML = `<div class="isp-dots" aria-hidden="true">${Array.from({ length:ISP.N }, (_, i) => `<i class="${i < ISP.k ? 'on' : i === ISP.k && ISP.phase === 'find' ? 'cur' : ''}"></i>`).join('')}</div><b>${ISP.k} / ${ISP.N}</b>`;
  const ln = ISP.line || { it:'' };
  $('#ispLine').textContent = ln.it;
  const en = $('#ispEn'), showEn = ISP.revealEn || ISP.phase === 'done' || ISP.phase === 'bonus-offer';
  en.textContent = ln.en || ''; en.hidden = !(showEn && ln.en);
  const re = $('#ispReact');
  re.hidden = !ISP.react; re.innerHTML = ISP.react ? `<p class="it">${esc(ISP.react.it)}</p>${ISP.react.gloss ? `<p class="en isp-gloss">${esc(ISP.react.gloss)}</p>` : ''}` : '';
  $('#ispFb').innerHTML = ISP.fb ? `<p>${ISP.fb}</p>` : '';
  $('#ispFb').hidden = !ISP.fb;
  const pan = $('#ispPanel'), ph = ISP.phase;
  pan.className = 'isp-panel ' + ph;
  if (ph === 'time'){
    const T = ISP.time;
    pan.innerHTML = `<div class="sentence isp-sent" data-empty="Tap the tiles: what time is it?">${T.built.map((k, i) => `<button class="tile" data-isp-rm="${i}">${esc(ISPY_TLABEL[k])}</button>`).join('')}</div>
      ${T.fb ? `<p class="isp-tfb">${T.fb}</p>` : ''}
      <div class="isp-acts">${T.tries >= 5 ? '<button class="linkbtn" data-isp="tskip">Skip this one</button>' : ''}<button class="btn" data-isp="tclear">Cancella</button><button class="btn primary" data-isp="tsay">Dillo! <small>Enter</small></button></div>
      <div class="isp-bank">${ISPY_TT.map(g => `<div class="isp-grp ${g.g}">${g.tiles.map(([k, l]) => `<button class="tile" data-isp-t="${esc(k)}">${esc(l)}</button>`).join('')}</div>`).join('')}</div>`;
  } else if (ph === 'bonus-offer'){
    pan.innerHTML = `<p class="isp-big">All ${ISP.N} found!</p><p class="note">Bonus round: <b>you</b> describe something, and Bruno looks for it. Just for fun: it doesn't count.</p>
      <div class="isp-acts"><button class="btn" data-isp="nobonus">No, grazie</button><button class="btn primary" data-isp="bonus">Tocca a te!</button></div>`;
  } else if (ph === 'bonus'){
    const B = ISP.bonus;
    pan.innerHTML = `<div class="sentence isp-sent" data-empty="Vedo …">${B.built.map((k, i) => `<button class="tile" data-isp-rm="${i}">${esc(k)}</button>`).join('')}</div>
      ${B.built.length ? `<p class="isp-preview">${esc(ispyBonusText(B.built))}</p>` : ''}
      ${B.fb ? `<p class="isp-tfb">${B.fb}</p>` : B.result === 'found' ? `<p class="isp-tfb good">“${esc(B.said)}” Bruno found it!</p>` : B.result === 'none' ? `<p class="isp-tfb">“${esc(B.said)}” Bruno can't see that in the square. Look again, or describe something else.</p>` : ''}
      <div class="isp-acts"><button class="btn" data-isp="bdone">${B.found ? 'Finish' : 'Basta così · finish'}</button><button class="btn" data-isp="bclear">Cancella</button><button class="btn primary" data-isp="bsay">Dillo! <small>Enter</small></button></div>
      <div class="isp-bank">${ISPY_BT.map(g => `<div class="isp-grp"><span class="bank-label">${esc(g.g)}</span>${g.tiles.map(k => `<button class="tile${k === 'vedo' ? ' phrase' : ''}" data-isp-b="${esc(k)}">${esc(k === 'vedo' ? 'Vedo' : k)}</button>`).join('')}</div>`).join('')}</div>`;
  } else if (ph === 'done'){
    const r = ISP.result || {};
    pan.innerHTML = `<p class="isp-big">Bravo!</p><p class="note">${r.finds} found${r.misses ? ` · ${r.misses} ${r.misses === 1 ? 'miss' : 'misses'}` : ' · no misses'}${r.time && r.time.asked ? ` · the time: ${r.time.right} / ${r.time.asked}` : ''}${r.bonus && r.bonus.played ? ` · Tocca a te: ${r.bonus.found} found` : ''}.</p>
      <div class="isp-acts">${ISP.mode === 'studio' ? '<button class="btn" data-isp="again">Play again</button>' : ''}<button class="btn primary" data-isp="close">${esc(ISP.o.doneLabel || (ISP.mode === 'studio' ? 'Back to Studio' : 'Close'))}</button></div>`;
  } else pan.innerHTML = '';
  if (ph === 'done' || ph === 'bonus-offer') setTimeout(() => { const b = pan.querySelector('.btn.primary'); if (b && ispyIsOpen()) b.focus({ preventScroll:true }); }, 30);
}
sheet.addEventListener('mousedown', e => { if (ispyIsOpen() && e.target.closest('[data-isp], [data-isp-t], [data-isp-b], [data-isp-rm]')) e.preventDefault(); });
sheet.addEventListener('click', e => {
  if (!ispyIsOpen()) return;
  const t = e.target.closest('[data-isp-t]'), b = e.target.closest('[data-isp-b]'), rm = e.target.closest('[data-isp-rm]'), a = e.target.closest('[data-isp]');
  if (t && ISP.time){ if (ISP.time.built.length < 8) ISP.time.built.push(t.dataset.ispT); ispyUI(); return; }
  if (b && ISP.bonus){ if (ISP.bonus.built.length < 14) ISP.bonus.built.push(b.dataset.ispB); ISP.bonus.result = null; ISP.bonus.fb = ''; ispyUI(); return; }
  if (rm){ const arr = ISP.time ? ISP.time.built : ISP.bonus ? ISP.bonus.built : null; if (arr){ arr.splice(+rm.dataset.ispRm, 1); ispyUI(); } return; }
  if (!a) return;
  const k = a.dataset.isp;
  if (k === 'say'){ const l = ISP.line; if (l) speak(l.it, ispyBruno(), false, 0.7); }
  else if (k === 'tsay') ispyTimeSubmit();
  else if (k === 'tclear' && ISP.time){ ISP.time.built = []; ispyUI(); }
  else if (k === 'tskip') ispyTimeSkip();
  else if (k === 'bonus') ispyBonusStart();
  else if (k === 'nobonus') ispyDone();
  else if (k === 'bsay') ispyBonusSubmit();
  else if (k === 'bclear' && ISP.bonus){ ISP.bonus.built = []; ISP.bonus.fb = ''; ispyUI(); }
  else if (k === 'bdone'){ ISP.fx = []; ispyDone(); ispySay('Bravo!', null, 'line', 'Well done!'); }
  else if (k === 'close'){ if (ISP.mode === 'studio') openStudy({ tab:'ispy' }); else closeModal(); }
  else if (k === 'again') openISpy({ ...ISP.o, seed:undefined, ...ispyStudioOpts(ISP.N) });
  else if (k === 'studio') openStudy({ tab:'ispy' });
});
document.addEventListener('keydown', e => {
  if (!ispyIsOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'Enter' && !(e.target.closest && e.target.closest('#sheet button'))){
    if (ISP.phase === 'time'){ e.preventDefault(); ispyTimeSubmit(); }
    else if (ISP.phase === 'bonus'){ e.preventDefault(); ispyBonusSubmit(); }
  } else if (e.key === 'Backspace'){
    const arr = ISP.time ? ISP.time.built : ISP.bonus && ISP.phase === 'bonus' ? ISP.bonus.built : null;
    if (arr && arr.length){ e.preventDefault(); arr.pop(); ispyUI(); }
  } else if ((e.key === 'r' || e.key === 'R') && ISP.line){ e.preventDefault(); speak(ISP.line.it, ispyBruno(), false, 0.7); }
});

/* ---------- Studio: free play once Lesson 10 is complete ---------- */
const ISPY_ST = { finds:10, time:true };
function ispyStudioOpts(finds){
  const R = ispyRng(Math.floor(Math.random() * 1e9)), step = 5;
  const start = (13 + Math.floor(R() * 6)) * 60 + ispyPick(R, [0, 15, 30, 45]);
  /* "Che ore sono?" at about a third and two thirds of the way, on a time the tiles can say */
  const asks = !ISPY_ST.time ? [] : [Math.round(finds / 3), Math.round(finds * 2 / 3)].filter((x, i, a) => x > 0 && a.indexOf(x) === i)
    .map(k => start + k * step).filter(m => ispySayable(m % 60)).map(ispyHHMM);
  return { finds, start:ispyHM(start), step, timeAsks:asks, bonus:true, studio:true };
}
function renderISpyStudio(){
  if (!ispyUnlocked()){ ST.tab = 'words'; return renderStudy(); }
  sheet.innerHTML = stHead('ispy') + `
    <div class="sheet-body st-body isp-st" id="stBody">
      <div class="isp-st-card">
        <canvas class="isp-st-pic" id="ispStPic" width="480" height="300" aria-label="The museum square"></canvas>
        <div class="isp-st-txt"><h3>Vedo, vedo… in the museum square</h3>
          <p>Bruno describes someone or something in the square, you find it: nouns first, then colours, numbers and plurals, and where things are (<i>sotto</i>, <i>sopra</i>, <i>dietro</i>…). A new square every game. No clock to beat.</p>
          <div class="isp-st-opts"><span class="note">Finds</span><div class="vc-seg" role="group" aria-label="Finds per game">${[5, 10, 15].map(n => `<button data-isp-st-n="${n}" aria-pressed="${n === ISPY_ST.finds}">${n}</button>`).join('')}</div>
            <label class="isp-st-chk"><input type="checkbox" data-isp-st-time ${ISPY_ST.time ? 'checked' : ''}> <i>Che ore sono?</i> questions</label></div>
          <button class="btn primary" data-isp-st="play">Gioca · play</button></div>
      </div>
      ${mispyStudioCard()}
    </div>`;
  const c = $('#ispStPic'), g = c.getContext('2d'), L = ISPY_LAYOUTS.wide, seed = 20251103, r = ispyRound(seed, 0, 4, 'wide');
  c.width = 480 * DPR; c.height = 300 * DPR; g.setTransform(480 / L.W * DPR, 0, 0, 300 / L.H * DPR, 0, 0);
  if (r) ispyPaint(g, r.scene, { seed, t:0, clock:15 * 60 + 30 });
}
sheet.addEventListener('click', e => {
  if (!stIsOpen() || ST.tab !== 'ispy') return;
  const n = e.target.closest('[data-isp-st-n]'); if (n){ ISPY_ST.finds = +n.dataset.ispStN; renderISpyStudio(); return; }
  const tm = e.target.closest('[data-isp-st-time]'); if (tm){ ISPY_ST.time = tm.checked; return; }
  if (e.target.closest('[data-isp-st="play"]')) openISpy(ispyStudioOpts(ISPY_ST.finds));
});

/* ---------- tests ---------- */
function ispyDbg(){
  const open = ISP.open && ispyIsOpen();
  if (!open && !ISP.result) return { open:false, unlocked:ispyUnlocked() };
  const r = ISP.round, sc = r && r.scene, box = open && ISP.cv ? ISP.cv.getBoundingClientRect() : null;
  const page = (x, y) => box ? { x:Math.round(box.left + x * ISP.zoom), y:Math.round(box.top + y * ISP.zoom) } : null;
  const ent = e => { const c = { x:e.rect.x + e.rect.w / 2, y:e.rect.y + e.rect.h / 2 }; return { id:e.id, kind:e.kind, x:Math.round(c.x), y:Math.round(c.y), rect:{ x:Math.round(e.rect.x), y:Math.round(e.rect.y), w:Math.round(e.rect.w), h:Math.round(e.rect.h) }, page:page(c.x, c.y) }; };
  /* a spot in the sky, far from every match: a sure miss */
  let missAt = null;
  if (sc){ const M = r.matches.map(id => sc.byId[id]); for (const x of [0.5, 0.2, 0.8, 0.35]){ const p = { x:ISP.L.W * x, y:ISP.L.museum.peak - 30 }; if (!ispyHitTest(r, p.x, p.y, ISP.rad || 20) && M.every(m => Math.hypot(m.x - p.x, m.y - p.y) > 120)){ missAt = page(p.x, p.y); break; } } }
  return { open, unlocked:ispyUnlocked(), mode:ISP.mode, phase:ISP.phase, layout:ISP.layout, seed:ISP.seed, found:ISP.k, finds:ISP.N, misses:ISP.misses,
    tier:r ? r.tier : null, line:ISP.line ? ISP.line.it : null, lineEn:ISP.line ? ISP.line.en : null, react:ISP.react ? ISP.react.it : null, fb:ISP.fb ? ISP.fb.replace(/<[^>]+>/g, '') : '',
    desc:r ? r.desc : null, clue:r ? r.clue.it : null, miss:ISP.miss, sparkle:ISP.fx.some(f => f.type === 'spark'), rad:Math.round(ISP.rad || 0),
    target:sc ? ent(sc.byId[r.target]) : null, matches:sc ? r.matches.map(id => ent(sc.byId[id])) : [], missAt,
    scale:ISP.zoom, clock:ispyHM(ISP.clock), shown:ispyHM(ISP.shown),
    time:ISP.time ? { at:ispyHM(ISP.time.at), tries:ISP.time.tries, built:ISP.time.built.slice(), fb:(ISP.time.fb || '').replace(/<[^>]+>/g, '') } : null, timeStats:{ ...ISP.stats },
    bonus:ISP.bonus ? { built:ISP.bonus.built.slice(), tries:ISP.bonus.tries, found:ISP.bonus.found, said:ISP.bonus.said, result:ISP.bonus.result, fb:(ISP.bonus.fb || '').replace(/<[^>]+>/g, ''), highlight:ISP.bonus.highlight } : null,
    done:ISP.done, result:ISP.result };
}
Object.assign(window.__debug, { ispy:opts => openISpy(opts || {}), ispyUnlock(v = true){ ISPY_FORCE = v; } });
/* the round generator without the game: what Bruno says, what it matches, and checks on it */
window.__ispyGen = (seed, k, tier, layout = 'wide', avoid = []) => {
  const r = ispyRound(seed, k, tier, layout, avoid); if (!r) return null;
  const sc = r.scene, M = r.matches.map(id => sc.byId[id]);
  return { line:r.line.it, en:r.line.en, clue:r.clue.it, desc:r.desc, attempt:r.attempt, n:sc.ents.length,
    matches:M.map(e => ({ id:e.id, kind:e.kind, col:e.col || e.shirt || null, vis:+ispyVisibleFrac(sc, e).toFixed(2), rect:e.rect, inside:e.rect.x >= 0 && e.rect.y >= 0 && e.rect.x + e.rect.w <= sc.L.W && e.rect.y + e.rect.h <= sc.L.H })),
    again:ispyMatch(sc, r.desc).map(e => e.id), same:sc.ents.filter(e => e.kind === r.desc.kind).length,
    hitCentre:M.every(e => ispyHitTest(r, e.rect.x + e.rect.w / 2, e.rect.y + e.rect.h / 2, 20)),
    kinds:sc.ents.map(e => e.kind) };
};
/* every word the game uses (Bruno's lines over many rounds, and every tile) that ISPY_VOCAB, earlier lessons or the
   numbers do not teach */
window.__ispyAudit = (lines = []) => {
  const known = new Set(VOCAB_FUNCTION_WORDS), add = s => vcTokens(s).forEach(w => known.add(w));
  [...VOCAB1, ...VOCAB2].forEach(v => add(v.w)); [...DIR_TILES, ...L4_ALL, ...L5_TILES, ...L6_TILES, ...SET_PHRASES].forEach(t => add(vcTileText(t)));
  LESSONS.forEach(L => { const V = vocabOf(L.n); if (V) vocabWords(L.n, true).forEach(w => { add(w.it); (w.also || []).forEach(add); }); });
  for (let i = 0; i <= 24; i++) add(numIt(i));
  ISPY_VOCAB.forEach(g => g.words.forEach(w => { add(w.it); (w.also || []).forEach(add); }));
  const said = [...lines, 'Che ore sono?', 'Tocca a te!', 'No, sbagliato! Ritenta!', 'No, sbagliato! È lì! Vedi?',
    'Sì! Eccolo!', 'Sì! Eccola!', 'Sì! Eccoli!', 'Sì! Eccole!', 'No… Non lo vedo!', 'No… Non la vedo!', 'No… Non li vedo!', 'No… Non le vedo!',
    ...ISPY_RIGHT.map(x => x[0]), ...ISPY_TT.flatMap(g => g.tiles.map(t => t[1])), ...ISPY_BT.flatMap(g => g.tiles)];
  return [...new Set(said.flatMap(vcTokens).filter(w => !known.has(w)))];
};
window.__ispyTime = { parse:ispyParseTime, right:(keys, at) => ispyTimeRight(ispyParseTime(keys), at), fb:ispyTimeFb, en:ispyTimeEn };
