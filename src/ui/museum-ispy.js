/* Vedo, vedo… nel museo: Lesson 10's I spy, flipped into the museum (design: docs/lessons/11-al-museo.md, the finale).
   Lucia describes a work in Italian; the player walks to it in the galleria and presses E in front of it (or taps it).
   Right → "Sì! Esatto!" and the next round; wrong → "No, non è questo. È più …", a comparison with the work picked.
   It runs in the world, not in a modal: a small panel on the stage shows the description (the English hidden), the
   progress and Ripeti (R). See CLAUDE.md ("Vedo, vedo… nel museo").

   openMuseumISpy(opts)  opts, all optional:
     rounds:5              rounds to play
     tiers                 the tier of each round (default [1, 2, 3, 4, 5], scaled to `rounds`):
                           1 one feature · 2 two features · 3 a comparison with another work (or "the oldest…")
                           · 4 an emotion (Una donna sembra arrabbiata) · 5 harder mixes (an emotion and a comparison, or
                           "È di Boccioni. Non è un quadro!")
     who:'lucia'           who describes (an NPC or id: the voice's pitch, a bubble over them when they are in the scene)
     seed                  the rounds (same seed, same rounds); default random
     found:0               resume after this many rounds
     exclude:[ids]         works never to use as targets (e.g. one the lesson keeps for its ending)
     intro:{ it, en }      a line before the first description
     studio:true           Studio's free play (a "Play again" button)
     onRound(k, round)     a new round starts (k = rounds done so far)
     onPick(id, ok, round) after every pick
     onDone(result)        { rounds, misses, picks }
     onClose(state)        the panel was closed (× or Chiudi): { done, found }
   closeMuseumISpy() · mispyActive() · mispyPick(id) (the galleria calls it on E / a tap on a work: true = taken)
   mispyRound(seed, k, tier, exclude?, used?) the generator: { target, tier, preds, line:{ it, en }, matches }
   mispyClue(targetId, pickedId) → { it, en } · MISPY_VOCAB: the Lesson 11 words it says (Vocabolario format)
   Tests: __dbg().mispy, __debug.mispy(opts), __debug.mispyUnlock(), __mispyGen(seed, k, tier), __mispyClue(t, p),
   __mispyAudit(n), __mispyTruth(). */

/* ---------- the words (all of them taught by Lesson 11's Vocabolario or earlier) ---------- */
const MISPY_VOCAB = [
  { group:'Vedo, vedo… nel museo', note:'The words Lucia uses in the game: Lesson 11’s Vocabolario must teach every one.', words:[
    { it:'il quadro', g:'m', en:'the painting' }, { it:'la statua', g:'f', en:'the statue' },
    { it:'più … di', en:'more … than', say:'più vecchio di quello' }, { it:'il più …', en:'the most …', say:'il quadro più piccolo' },
    { it:'questo / questa', en:'this one' }, { it:'quello / quella', en:'that one' },
    { it:"c'è / ci sono", en:'there is / there are', also:['ci', 'sono'] }, { it:'è di …', en:"it's by …", say:'È di Boccioni.' },
    { it:'vecchio / vecchia', en:'old' }, { it:'moderno / moderna', en:'modern' }, { it:'grande', en:'big' }, { it:'piccolo / piccola', en:'small' },
    { it:'alto / alta', en:'tall' }, { it:'scuro / scura', en:'dark' }, { it:'chiaro / chiara', en:'light, bright' }, { it:'giovane', en:'young' },
    { it:'felice', en:'happy' }, { it:'triste', en:'sad' }, { it:'arrabbiato / arrabbiata', en:'angry' }, { it:'spaventato / spaventata', en:'frightened' },
    { it:'calmo / calma', en:'calm' }, { it:'sorpreso / sorpresa', en:'surprised' }, { it:'sembra', en:'he / she seems' },
    { it:'il cavallo', g:'m', en:'the horse' }, { it:'la persona / le persone', g:'f', en:'the person / the people', also:['persona', 'persone'] },
    { it:"l'angelo", g:'m', en:'the angel', also:['angelo'] }, { it:'il viso', g:'m', en:'the face' },
  ] },
];
/* adjectives: [m, f] */
const MI_ADJ = { vecchio:['vecchio', 'vecchia', 'old', 'older'], moderno:['moderno', 'moderna', 'modern', 'more modern'], grande:['grande', 'grande', 'big', 'bigger'],
  piccolo:['piccolo', 'piccola', 'small', 'smaller'], alto:['alto', 'alta', 'tall', 'taller'], scuro:['scuro', 'scura', 'dark', 'darker'], chiaro:['chiaro', 'chiara', 'light', 'lighter'],
  felice:['felice', 'felice', 'happy'], triste:['triste', 'triste', 'sad'], arrabbiato:['arrabbiato', 'arrabbiata', 'angry'], spaventato:['spaventato', 'spaventata', 'frightened'],
  calmo:['calmo', 'calma', 'calm'], sorpreso:['sorpreso', 'sorpresa', 'surprised'], giovane:['giovane', 'giovane', 'young'] };
const MI_WHO = { uomo:{ it:'un uomo', g:'m', en:'a man' }, donna:{ it:'una donna', g:'f', en:'a woman' }, bambino:{ it:'un bambino', g:'m', en:'a child' }, angelo:{ it:"un angelo", g:'m', en:'an angel' } };
const MI_COL = { bianco:['bianco', 'bianca', 'white'], nero:['nero', 'nera', 'black'], rosso:['rosso', 'rossa', 'red'], giallo:['giallo', 'gialla', 'yellow'] };
const MI_NUM = ['', 'una', 'due', 'tre'];
const miAdj = (a, g) => MI_ADJ[a][g === 'f' ? 1 : 0];
const miKind = w => w.kind === 'statue' ? { it:'statua', g:'f', en:'statue', un:'una statua', il:'la statua', that:'quella', this:'questa' } : { it:'quadro', g:'m', en:'painting', un:'un quadro', il:'il quadro', that:'quello', this:'questo' };

/* ---------- facts about the works (from the manifest: dates, sizes, the hand-written tags) ---------- */
const MI_WORKS = ART.works;
const MI_BY = id => MI_WORKS.find(w => w.id === id);
const miT = w => w.tags || {};
const miYear = w => +String(w.date).match(/\d{3,4}/)[0];
const miDims = w => { const m = String(w.size_cm).match(/[\d.]+/g).map(Number); return { h:m[0], w:m[1] || null }; };
/* how big: a painting's area (cm²); a statue's height */
const miSize = w => { const d = miDims(w); return w.kind === 'statue' ? d.h : d.h * d.w; };
const miArtistCount = by => MI_WORKS.filter(w => miT(w).by === by).length;
/* absolute size words, with an arguable middle (a painting: small ≤ 0.4 m², big ≥ 4 m²; "maybe" up to 1 m² / from 2 m²;
   a statue: tall ≥ 2.4 m, small ≤ 1.2 m) */
function miSizeWord(w, lax){
  const s = miSize(w);
  if (w.kind === 'statue') return s >= (lax ? 200 : 240) ? 'alto' : s <= (lax ? 160 : 120) ? 'piccolo' : null;
  if (s <= (lax ? 10000 : 4000)) return 'piccolo';
  if (s >= (lax ? 20000 : 40000)) return 'grande';
  return null;
}

/* ---------- predicates: a fact about the target (clear) and whether another work might fit it too (lax) ----------
   type: F a thing in it (con …) · A an adjective (un quadro piccolo) · R the artist (di …) · C a comparison · S a
   superlative (il quadro più …) · E an emotion (… sembra …) · N "È di X. Non è un quadro!" */
function miPreds(T){
  const t = miT(T), K = miKind(T), out = [];
  const add = (type, key, clear, lax, it, en, o = {}) => { if (clear(T)) out.push({ type, key, lax, it, en, ...o }); };
  const same = w => w.kind === T.kind;
  /* people */
  const P = t.people || [0, 0];
  if (P[0] === P[1] && P[0] >= 1 && P[0] <= 3) add('F', 'persone:' + P[0], () => true, w => { const q = miT(w).people || [0, 0]; return q[0] <= P[0] && P[0] <= q[1]; },
    `con ${MI_NUM[P[0]]} ${P[0] === 1 ? 'persona' : 'persone'}`, `with ${['', 'one person', 'two people', 'three people'][P[0]]}`);
  if (P[0] > 10) add('F', 'persone:molte', () => true, w => (miT(w).people || [0, 0])[1] > 10, 'con più di dieci persone', 'with more than ten people');
  ['uomo', 'donna', 'bambino'].forEach(k => add('F', 'who:' + k, w => (miT(w).who || []).includes(k), w => [...(miT(w).who || []), ...(miT(w).whoMaybe || [])].includes(k), 'con ' + MI_WHO[k].it, 'with ' + MI_WHO[k].en));
  /* animals */
  ['cavallo', 'cane'].forEach(a => {
    const A = t.animals || {};
    const laxA = w => !!(miT(w).animals || {})[a] || (miT(w).animalsMaybe || []).includes(a);
    add('F', 'animal:' + a, () => !!A[a], laxA, `con un ${a}`, `with a ${a === 'cane' ? 'dog' : 'horse'}`);
    (A[a] || []).forEach(c => add('F', `animal:${a}:${c}`, () => true, w => (miT(w).animalsMaybe || []).includes(a) || ((miT(w).animals || {})[a] || []).includes(c),
      `con un ${a} ${MI_COL[c][0]}`, `with a ${MI_COL[c][2]} ${a === 'cane' ? 'dog' : 'horse'}`));
  });
  add('F', 'angelo', w => !!miT(w).angel, w => !!(miT(w).angel || miT(w).angelMaybe), "con un angelo", 'with an angel');
  add('F', 'cappello:nero', w => (miT(w).hat || []).includes('nero'), w => [...(miT(w).hat || []), ...(miT(w).hatMaybe || [])].includes('nero'), 'con un cappello nero', 'with a black hat');
  add('F', 'tavolo', w => !!miT(w).table, w => !!(miT(w).table || miT(w).tableMaybe), 'con un tavolo', 'with a table');
  add('F', 'viso:bianco', w => miT(w).face === 'bianco', w => miT(w).face === 'bianco', 'con un viso bianco', 'with a white face');
  /* adjectives */
  const sz = miSizeWord(T, false);
  if (sz) add('A', 'size:' + sz, () => true, w => miSizeWord(w, true) === sz, miAdj(sz, K.g), MI_ADJ[sz][2]);
  if (t.tone) add('A', 'tone:' + t.tone, () => true, w => miT(w).tone === t.tone || !miT(w).tone, miAdj(t.tone, K.g), MI_ADJ[t.tone][2]);
  if (t.scol && MI_COL[t.scol]) add('A', 'scol:' + t.scol, () => true, w => miT(w).scol === t.scol || miT(w).scolMaybe === t.scol, MI_COL[t.scol][1], MI_COL[t.scol][2]);
  /* the artist */
  if (t.by) add('R', 'by', () => true, w => miT(w).by === t.by, 'di ' + t.by, 'by ' + t.by);
  /* comparisons with a work of the same kind by an artist with only that one work here ("quello di Mantegna") */
  MI_WORKS.filter(A => A !== T && same(A) && miT(A).by && miArtistCount(miT(A).by) === 1).forEach(A => {
    const ref = `${K.that} di ${miT(A).by}`, refEn = `the one by ${miT(A).by}`;
    const yT = miYear(T), yA = miYear(A), sT = miSize(T), sA = miSize(A);
    if (yT <= yA - 20) out.push({ type:'C', key:'older:' + A.id, anchor:A.id, lax:w => miYear(w) < yA, it:`più ${miAdj('vecchio', K.g)} di ${ref}`, en:`older than ${refEn}` });
    if (yT >= yA + 20) out.push({ type:'C', key:'newer:' + A.id, anchor:A.id, lax:w => miYear(w) > yA, it:`più ${miAdj('moderno', K.g)} di ${ref}`, en:`more modern than ${refEn}` });
    const big = T.kind === 'statue' ? 'alto' : 'grande', r = T.kind === 'statue' ? 1.35 : 2;
    if (sT >= sA * r) out.push({ type:'C', key:'bigger:' + A.id, anchor:A.id, lax:w => miSize(w) > sA, it:`più ${miAdj(big, K.g)} di ${ref}`, en:`${MI_ADJ[big][3]} than ${refEn}` });
    if (sT <= sA / r) out.push({ type:'C', key:'smaller:' + A.id, anchor:A.id, lax:w => miSize(w) < sA, it:`più ${miAdj('piccolo', K.g)} di ${ref}`, en:`smaller than ${refEn}` });
  });
  /* superlatives: the extreme of its kind */
  const kin = MI_WORKS.filter(same);
  [['vecchio', w => -miYear(w), 'oldest'], ['moderno', w => miYear(w), 'most modern'], [T.kind === 'statue' ? 'alto' : 'grande', miSize, T.kind === 'statue' ? 'tallest' : 'biggest'], ['piccolo', w => -miSize(w), 'smallest']].forEach(([a, f, en]) => {
    const best = kin.reduce((b, w) => f(w) > f(b) ? w : b, kin[0]);
    if (best === T && kin.filter(w => f(w) === f(T)).length === 1) out.push({ type:'S', key:'most:' + a, lax:w => w === T, it:`${K.il} più ${miAdj(a, K.g)}`, en:`the ${en} ${K.en}` });
  });
  /* emotions (and "sembra giovane") */
  (t.feel || []).forEach(f => (f.is || []).forEach(a => {
    const W = MI_WHO[f.who];
    out.push({ type:'E', key:`feel:${f.who}:${a}`, lax:w => (miT(w).feel || []).some(g => g.who === f.who && [...(g.is || []), ...(g.maybe || [])].includes(a)),
      it:`${cap(W.it)} sembra ${miAdj(a, W.g)}.`, en:`${cap(W.en)} seems ${MI_ADJ[a][2]}.` });
  }));
  /* "È di Boccioni. Non è un quadro!": an artist with works of both kinds here */
  if (t.by && MI_WORKS.some(w => w !== T && miT(w).by === t.by && w.kind !== T.kind) && MI_WORKS.filter(w => miT(w).by === t.by && w.kind === T.kind).length === 1)
    out.push({ type:'N', key:'not', lax:w => miT(w).by === t.by && w.kind === T.kind, it:`È di ${t.by}. Non è ${T.kind === 'statue' ? 'un quadro' : 'una statua'}!`, en:`It's by ${t.by}. It isn't a ${T.kind === 'statue' ? 'painting' : 'statue'}!` });
  return out;
}
/* which works fit a description (the kind, and every predicate, laxly) */
const miFits = (T, preds) => MI_WORKS.filter(w => (preds.some(p => p.type === 'N') || w.kind === T.kind) && preds.every(p => p.lax(w)));
/* the Italian and English of a description */
function miPhrase(T, preds){
  const K = miKind(T), by = t => preds.filter(p => p.type === t);
  if (by('N').length) return { it:by('N')[0].it, en:by('N')[0].en };
  const S2 = by('S')[0], A = by('A'), R = by('R')[0], F = by('F'), C = by('C')[0], E = by('E')[0];
  let it = S2 ? S2.it : K.un, en = S2 ? S2.en : `a ${K.en}`;
  if (A.length){ it += ' ' + A.map(p => p.it).join(' e '); en = (S2 ? en + ', ' : 'a ') + A.map(p => p.en).join(' and ') + (S2 ? '' : ' ' + K.en); }
  if (R){ it += ' ' + R.it; en += ' ' + R.en; }
  if (F.length){ it += ' ' + F[0].it + F.slice(1).map(p => ' e ' + p.it.replace(/^con /, '')).join(''); en += ' ' + F[0].en + F.slice(1).map(p => ' and ' + p.en.replace(/^with /, '')).join(''); }
  if (C){ it += ', ' + C.it; en += ', ' + C.en; }
  it += '.'; en += '.';
  if (E){ it += ' ' + E.it; en += ' ' + E.en; }
  return { it, en };
}

/* ---------- the round generator ---------- */
const MI_TIERS = [1, 2, 3, 4, 5];
const MI_PLAIN = ['F', 'A', 'R'];
function miCombos(T, tier, fallback){
  const P = miPreds(T), of = ts => P.filter(p => ts.includes(p.type)), uniq = ps => { const f = miFits(T, ps); return f.length === 1 && f[0] === T; };
  const plain = of(MI_PLAIN), out = [];
  /* never two adjectives, two animals, or a head count with a kind of person ("con una persona e una donna") */
  const clash = (p, q) => (p.type === q.type && p.type !== 'F') || (p.key.startsWith('animal:') && q.key.startsWith('animal:'))
    || (p.key.startsWith('persone') && q.key.startsWith('who:')) || (q.key.startsWith('persone') && p.key.startsWith('who:'));
  const pairs = a => a.flatMap((p, i) => a.slice(i + 1).map(q => [p, q])).filter(([p, q]) => !clash(p, q));
  if (tier === 1) plain.forEach(p => { if (uniq([p])) out.push([p]); });
  if (tier === 2) pairs(plain).forEach(c => { if (uniq(c) && !uniq([c[0]]) && !uniq([c[1]])) out.push(c); });
  if (tier === 3){
    of(['C']).forEach(c => { if (uniq([c])) out.push([c]); plain.forEach(p => { if (uniq([c, p]) && !uniq([c]) && !uniq([p])) out.push([c, p]); }); });
    of(['S']).forEach(s => out.push([s]));
  }
  if (tier === 4) of(['E']).forEach(e => { if (uniq([e])) out.push([e]); plain.forEach(p => { if (uniq([e, p]) && !uniq([e]) && !uniq([p])) out.push([e, p]); }); });
  if (tier === 5){
    of(['N']).forEach(n => { if (uniq([n])) out.push([n]); });
    of(['E']).forEach(e => of(['C']).forEach(c => { if (uniq([e, c])) out.push([e, c]); }));
    /* (only when no work has those: a comparison and two features) */
    if (!out.length && fallback) of(['C']).forEach(c => pairs(plain).forEach(([p, q]) => { if (uniq([c, p, q]) && !uniq([c, p]) && !uniq([c, q]) && !uniq([p, q])) out.push([c, p, q]); }));
  }
  /* keep the shorter Italian when there are many */
  return out.filter(c => miPhrase(T, c).it.length < 110);
}
function mispyRound(seed, k, tier, exclude = [], used = []){
  const R = ispyRng(ispyHash(seed, k, tier, 'museo'));
  const ok = w => !exclude.includes(w.id);
  const all = ispyShuffle(R, MI_WORKS.filter(w => ok(w) && !used.includes(w.id))).concat(MI_WORKS.filter(w => ok(w) && used.includes(w.id)));
  /* tier 1 prefers (most of the time) a work with a thing in it to name rather than only its artist */
  const things = tier === 1 && R() < 0.6;
  const pass = fallback => { for (const T of all){ let cs = miCombos(T, tier, fallback); if (things && !fallback) cs = cs.filter(c => c[0].type !== 'R'); if (cs.length) return [T, cs]; } return null; };
  const f = pass(false) || (tier === 5 || things ? pass(true) : null);
  if (!f) return null;
  const [T, cs] = f;
  /* tier 1: a thing in the picture rather than the artist, when there is one */
  const pref = tier === 1 && cs.some(c => c[0].type !== 'R') ? cs.filter(c => c[0].type !== 'R') : cs;
  const preds = ispyPick(R, pref), ph = miPhrase(T, preds);
  return { target:T.id, tier, preds, matches:miFits(T, preds).map(w => w.id),
    desc:ph, line:{ it:'Vedo, vedo… ' + ph.it.charAt(0).toLowerCase() + ph.it.slice(1), en:'I spy… ' + ph.en.charAt(0).toLowerCase() + ph.en.slice(1) } };
}
/* the clue after a wrong pick: how the target compares with the work picked (always true) */
function mispyClue(tid, pid){
  const T = MI_BY(tid), P = MI_BY(pid), KT = miKind(T), KP = miKind(P), parts = [], partsEn = [];
  const no = `No, non è ${KP.this}.`, noEn = "No, it isn't this one.";
  if (T.kind !== P.kind) return { it:`${no} È ${KT.un}!`, en:`${noEn} It's a ${KT.en}!` };
  const yT = miYear(T), yP = miYear(P), sT = miSize(T), sP = miSize(P), g = KT.g, big = T.kind === 'statue' ? 'alto' : 'grande';
  if (yT <= yP - 15){ parts.push('più ' + miAdj('vecchio', g)); partsEn.push('older'); }
  else if (yT >= yP + 15){ parts.push('più ' + miAdj('moderno', g)); partsEn.push('more modern'); }
  if (sT >= sP * 1.6){ parts.push('più ' + miAdj(big, g)); partsEn.push(MI_ADJ[big][3]); }
  else if (sT <= sP / 1.6){ parts.push('più ' + miAdj('piccolo', g)); partsEn.push('smaller'); }
  if (parts.length) return { it:`${no} È ${parts.join(' e ')}.`, en:`${noEn} It's ${partsEn.join(' and ')}.` };
  /* close in date and size: something it has that this one hasn't */
  const t = miT(T), p = miT(P);
  for (const a of ['cavallo', 'cane']) if ((t.animals || {})[a] && !(p.animals || {})[a]) return { it:`${no} C'è un ${a}!`, en:`${noEn} There's a ${a === 'cane' ? 'dog' : 'horse'} in it!` };
  if (t.angel && !p.angel && !p.angelMaybe) return { it:`${no} C'è un angelo!`, en:`${noEn} There's an angel in it!` };
  if ((t.people || [0])[0] > 10 && (p.people || [0, 0])[1] <= 10) return { it:`${no} Ci sono più di dieci persone!`, en:`${noEn} There are more than ten people in it!` };
  if (t.by && t.by !== p.by) return { it:`${no} È di ${t.by}.`, en:`${noEn} It's by ${t.by}.` };
  return { it:no, en:noEn };
}

/* =========================================================
   THE GAME (in the world)
   ========================================================= */
let MI_FORCE = false;
const mispyUnlocked = () => MI_FORCE || lessonCompleted(11);
const MI = { active:false, tok:0 };
const mispyActive = () => MI.active;
const MI_RIGHT = [['Sì! Esatto!', 'Yes! Exactly!'], ['Sì! Giusto!', 'Yes! Right!'], ['Esatto! Bravo!', 'Exactly! Well done!']];
const MI_TIER_NOTE = {
  1:'Lucia describes a work. Walk to it and press <kbd>E</kbd> in front of it (or tap it).',
  2:'Now two clues: both must be true.',
  3:'Now a comparison: <i>più … di</i>. The plaques have the dates and sizes.',
  4:'Now: how does someone in it seem? <i>sembra</i> …',
  5:'The hardest: listen to every word.',
};
const miWho = () => { const w = MI.o && MI.o.who; return w ? (typeof w === 'string' ? NPC[w] : w) : NPC.lucia; };
const miPitch = () => (miWho() && miWho().pitch) || 1.2;

function openMuseumISpy(opts = {}){
  closeMuseumISpy(false);
  const rounds = Math.max(1, Math.min(12, opts.rounds || 5));
  const tiers = opts.tiers || Array.from({ length:rounds }, (_, i) => MI_TIERS[Math.min(4, Math.floor(i * 5 / rounds))]);
  Object.assign(MI, { active:true, tok:MI.tok + 1, o:opts, studio:!!opts.studio, N:rounds, tiers, seed:opts.seed != null ? opts.seed >>> 0 : Math.floor(Math.random() * 1e9),
    k:Math.max(0, Math.min(rounds, opts.found || 0)), round:null, used:[], misses:0, roundMisses:0, picks:[], lastPick:null, clue:null, react:null, fb:'', phase:'find', done:false, result:null, revealEn:false });
  miPanel();
  const tok = MI.tok;
  const go = () => { if (tok === MI.tok) (MI.k >= MI.N ? miFinish() : miNext()); };
  if (opts.intro){ miSay(opts.intro.it, opts.intro.en, 'react'); setTimeout(go, Math.max(1400, 500 + opts.intro.it.length * 55)); } else go();
  return true;
}
function closeMuseumISpy(viaClose = true){
  if (!MI.active) return;
  MI.active = false; MI.tok++;
  const el = $('#mispy'); if (el) el.hidden = true;
  if (viaClose && MI.o && MI.o.onClose) try { MI.o.onClose({ done:MI.done, found:MI.k }); } catch(e){ console.error(e); }
}
function miSay(it, en, where = 'line', slow){
  if (where === 'line') MI.line = { it, en }; else MI.react = { it, en };
  speak(it, miPitch(), false, slow ? 0.7 : 0.88);
  const n = miWho(); if (n && activeNpcs().includes(n)) worldSay(n, where === 'line' ? 'Vedo, vedo…' : it.length < 26 ? it : '…', { silent:true, ms:2200 });
  miPanel();
}
function miNext(){
  const tier = MI.tiers[MI.k] || 5;
  MI.round = mispyRound(MI.seed, MI.k, tier, MI.o.exclude || [], MI.used) || mispyRound(MI.seed + 7, MI.k, tier, MI.o.exclude || [], []);
  MI.used.push(MI.round.target);
  MI.phase = 'find'; MI.roundMisses = 0; MI.clue = null; MI.react = null; MI.revealEn = false; MI.lastPick = null;
  const first = MI.k === 0 || MI.tiers[MI.k - 1] !== tier || MI.k === (MI.o.found || 0);
  MI.fb = first ? MI_TIER_NOTE[tier] : '';
  if (MI.o.onRound) try { MI.o.onRound(MI.k, MI.round); } catch(e){ console.error(e); }
  miSay(MI.round.line.it, MI.round.line.en, 'line');
}
/* E or a tap on a work while the game runs (world/galleria.js galWorkDoor): true = taken */
function mispyPick(id){
  if (!MI.active || !MI.round) return false;
  if (MI.phase !== 'find') return true;
  const r = MI.round, ok = id === r.target, P = MI_BY(id);
  MI.picks.push({ id, ok, k:MI.k }); MI.lastPick = { id, title:P.title_it, by:P.artist, date:P.date, size:P.size_cm, ok };
  if (MI.o.onPick) try { MI.o.onPick(id, ok, r); } catch(e){ console.error(e); }
  if (ok){
    MI.phase = 'right'; MI.revealEn = true; MI.clue = null;
    const l = MI_RIGHT[(MI.k + MI.misses) % MI_RIGHT.length];
    miSay(l[0], l[1], 'react');
    MI.k++;
    const tok = MI.tok;
    setTimeout(() => { if (tok !== MI.tok) return; if (MI.k >= MI.N) miFinish(); else miNext(); }, 2300);
    return true;
  }
  MI.misses++; MI.roundMisses++;
  MI.clue = mispyClue(r.target, id);
  miSay(MI.clue.it, MI.clue.en, 'react');
  if (MI.roundMisses >= 3){ const T = MI_BY(r.target); MI.fb = `Lucia points the way: it's in <b>${esc(ART.rooms[String(T.room)])}</b>.`; }
  miPanel();
  return true;
}
function miFinish(){
  MI.phase = 'done'; MI.done = true; MI.fb = '';
  MI.result = { rounds:MI.k, misses:MI.misses, picks:MI.picks.slice() };
  MI.line = { it:'Bravo!', en:'Well done!' };
  if (MI.o.onDone) try { MI.o.onDone(MI.result); } catch(e){ console.error(e); }
  miPanel();
}
/* R: Ripeti (ui/keyboard.js) */
function mispyKey(k, e){
  if (!MI.active || frozen() || k !== 'r' || e.metaKey || e.ctrlKey || e.altKey || !MI.line) return false;
  e.preventDefault(); miRepeat(); return true;
}
function miRepeat(){ if (MI.line) speak(MI.line.it, miPitch(), false, 0.7); }

/* ---------- the panel (on the stage, over the top left of the world) ---------- */
function miPanel(){
  let el = $('#mispy');
  if (!el){
    el = document.createElement('div'); el.id = 'mispy'; el.className = 'mispy'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', 'Vedo, vedo… nel museo');
    $('#stage').appendChild(el);
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-mi]'); if (!b) return;
      e.stopPropagation();
      const k = b.dataset.mi;
      if (k === 'say') miRepeat();
      else if (k === 'en'){ MI.revealEn = !MI.revealEn; miPanel(); }
      else if (k === 'close') closeMuseumISpy(true);
      else if (k === 'again'){ const o = { ...MI.o, seed:undefined, found:0 }; openMuseumISpy(o); }
    });
    el.addEventListener('pointerdown', e => e.stopPropagation());
  }
  el.hidden = !MI.active;
  if (!MI.active) return;
  const ln = MI.line || { it:'', en:'' }, who = miWho(), name = who ? who.name : 'Lucia';
  const dots = Array.from({ length:MI.N }, (_, i) => `<i class="${i < MI.k ? 'on' : i === MI.k && MI.phase === 'find' ? 'cur' : ''}"></i>`).join('');
  const pick = MI.lastPick && !MI.lastPick.ok ? `<p class="mi-pick">You chose <i>${esc(MI.lastPick.title)}</i> · ${esc(MI.lastPick.by)}, ${esc(MI.lastPick.date)} · ${esc(MI.lastPick.size)} cm</p>` : '';
  el.innerHTML = `<div class="mi-head"><span class="mi-kick">Vedo, vedo… <em>nel museo</em></span><span class="mi-dots" aria-hidden="true">${dots}</span><b class="mi-k">${MI.k} / ${MI.N}</b>
      <button class="mi-x" data-mi="close" aria-label="Stop the game">×</button></div>
    <div class="mi-bub"><span class="mi-who">${esc(name)}</span><p class="mi-it" lang="it">${esc(ln.it)}</p>
      ${MI.revealEn && ln.en ? `<p class="mi-en">${esc(ln.en)}</p>` : ''}
      <div class="mi-acts"><button class="mini mi-say" data-mi="say" aria-label="Ripeti: hear it again, slowly">${SPK}<span>Ripeti</span><kbd>R</kbd></button>
        ${MI.phase === 'find' ? '<span class="mi-tip">Trova! Walk to it, press <kbd>E</kbd></span>' : ''}</div></div>
    ${MI.react ? `<p class="mi-react ${MI.phase === 'right' || MI.phase === 'done' ? 'good' : 'bad'}" lang="it">${esc(MI.react.it)}</p>` : ''}
    ${pick}${MI.fb ? `<p class="mi-fb">${MI.fb}</p>` : ''}
    ${MI.phase === 'done' ? `<p class="mi-done">${MI.N} found${MI.misses ? ` · ${MI.misses} ${MI.misses === 1 ? 'wrong pick' : 'wrong picks'}` : ' · no wrong picks'}.</p>
      <div class="mi-end">${MI.studio ? '<button class="btn" data-mi="again">Play again</button>' : ''}<button class="btn primary" data-mi="close">Chiudi</button></div>` : ''}`;
}

/* ---------- Studio: free play once Lesson 11 is complete (a card in the Vedo, vedo tab: ui/ispy.js) ---------- */
function mispyStudioCard(){
  if (!mispyUnlocked()) return '';
  return `<div class="isp-st-card mi-st-card"><div class="mi-st-pic" aria-hidden="true">${['raffaello-san-giorgio', 'caravaggio-giuditta', 'boccioni-forme'].map(id => `<img src="art/${esc(MI_BY(id).thumb)}" alt="">`).join('')}</div>
    <div class="isp-st-txt"><h3>Vedo, vedo… nel museo</h3>
      <p>Lucia describes a painting or a statue in the museum, you walk to it and press <kbd>E</kbd>: what is in it, comparisons (<i>più vecchio di…</i>), how people seem (<i>sembra triste</i>). Five rounds, random works.</p>
      <button class="btn primary" data-mi-st="play">Gioca nel museo</button></div></div>`;
}
function mispyStudioPlay(){
  closeModal();
  const go = () => openMuseumISpy({ rounds:5, studio:true, who:'lucia' });
  if (S.scene !== 'galleria'){ travelTo('galleria', GAL.spawn, "Museo d'Arte", 'Vedo, vedo… nel museo'); setTimeout(go, RM ? 600 : 1900); } else go();
}
sheet.addEventListener('click', e => { if (e.target.closest('[data-mi-st="play"]')) mispyStudioPlay(); });

/* ---------- tests ---------- */
function mispyDbg(){
  if (!MI.active && !MI.result) return { active:false, unlocked:mispyUnlocked() };
  const r = MI.round, T = r && MI_BY(r.target), spot = T && typeof GAL_WORK !== 'undefined' ? galSpot(GAL_WORK[T.id]) : null;
  return { active:MI.active, unlocked:mispyUnlocked(), studio:MI.studio, seed:MI.seed, k:MI.k, rounds:MI.N, tier:r ? r.tier : null, phase:MI.phase,
    target:r ? r.target : null, spot, room:T ? T.room : null, kind:T ? T.kind : null, line:MI.line ? MI.line.it : null, lineEn:MI.line ? MI.line.en : null, enShown:MI.revealEn,
    preds:r ? r.preds.map(p => p.key) : [], matches:r ? r.matches : [], react:MI.react ? MI.react.it : null, clue:MI.clue ? MI.clue.it : null,
    misses:MI.misses, roundMisses:MI.roundMisses, lastPick:MI.lastPick ? MI.lastPick.id : null, fb:(MI.fb || '').replace(/<[^>]+>/g, ''), panel:!!($('#mispy') && !$('#mispy').hidden), done:MI.done, result:MI.result };
}
Object.assign(window.__debug, { mispy:o => openMuseumISpy(o || {}), mispyUnlock(v = true){ MI_FORCE = v; } });
window.__mispyGen = (seed, k, tier, exclude = []) => { const r = mispyRound(seed, k, tier, exclude); return r && { target:r.target, tier:r.tier, line:r.line.it, en:r.line.en, preds:r.preds.map(p => ({ type:p.type, key:p.key, anchor:p.anchor || null })), matches:r.matches }; };
window.__mispyClue = (t, p) => mispyClue(t, p);
/* every word Lucia says in the game (descriptions over n seeds, every clue, the reactions) that neither MISPY_VOCAB,
   an earlier lesson nor an artist's name teaches */
window.__mispyAudit = (n = 40) => {
  const lines = [...MI_RIGHT.map(x => x[0])];
  for (let s = 0; s < n; s++) for (let t = 1; t <= 5; t++){ const r = mispyRound(s * 7919 + 1, s % 5, t); if (r) lines.push(r.line.it); }
  MI_WORKS.forEach(a => MI_WORKS.forEach(b => { if (a !== b) lines.push(mispyClue(a.id, b.id).it); }));
  const names = new Set(MI_WORKS.flatMap(w => vcTokens(miT(w).by || '')));
  const known = new Set(MISPY_VOCAB.flatMap(g => g.words.flatMap(w => [w.it, ...(w.also || [])])).flatMap(vcTokens));
  const missing = window.__ispyAudit(lines).filter(w => !known.has(w) && !names.has(w));
  return { lines:lines.length, missing };
};
/* the tags' facts the tests check descriptions against */
window.__mispyTruth = () => MI_WORKS.map(w => ({ id:w.id, kind:w.kind, room:w.room, year:miYear(w), size:miSize(w), tags:miT(w) }));
window.__mispyVocab = () => MISPY_VOCAB.flatMap(g => g.words.map(w => w.it));
