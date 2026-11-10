/* Vedo, vedo… nel museo (ui/museum-ispy.js): the round generator (five tiers) gives descriptions that are TRUE for their
   target and pick out only it, across many seeds, checked here against the manifest (dates, sizes, the hand-written
   tags); every word Lucia says is taught (Lesson 11's Vocabolario as the design doc lists it, or earlier); every clue
   after a wrong pick is true; then 5 rounds in the galleria: walk to the work, E (Permesso when a visitor is in front),
   one wrong pick and its clue, Ripeti, the English hidden; and the Studio entry. */
const { play } = require('./lib/harness');
const MAN = require('../assets/art/manifest.json');
/* the design doc's Vocabolario (docs/lessons/11-al-museo.md), as written there */
const DOC_VOCAB = ['il quadro', 'la statua', 'la sala', 'il pittore', 'il custode', 'troppo vicino', 'non si tocca', 'è vietato', 'più … di', 'meno … di', 'il più …',
  'questo / questa', 'quello / quella', "c'è / ci sono", 'è di …', 'vecchio / vecchia', 'moderno / moderna', 'grande', 'piccolo / piccola', 'alto / alta', 'scuro / scura',
  'chiaro / chiara', 'bello / bella', 'giovane', 'strano / strana', 'felice', 'triste', 'arrabbiato / arrabbiata', 'spaventato / spaventata', 'calmo / calma',
  'sorpreso / sorpresa', 'sembra', 'secondo Lei / te', 'mi piacciono', 'Cosa Le piace di…?', 'preferisco', 'preferisce', 'il cavallo', 'la persona / le persone', "l'angelo", 'il viso', 'Trova!'];

const W = Object.fromEntries(MAN.works.map(w => [w.id, w]));
const year = w => +String(w.date).match(/\d{3,4}/)[0];
const dims = w => String(w.size_cm).match(/[\d.]+/g).map(Number);
const size = w => w.kind === 'statue' ? dims(w)[0] : dims(w)[0] * dims(w)[1];
/* is predicate `key` true of work T? (independent of the game's code) */
function truth(key, T){
  const t = T.tags || {}, [k, a, b] = key.split(':'), A = a && W[a];
  switch (k){
    case 'persone': return a === 'molte' ? t.people[0] > 10 : t.people[0] === t.people[1] && t.people[0] === +a;
    case 'who': return (t.who || []).includes(a);
    case 'animal': return !!(t.animals || {})[a] && (!b || t.animals[a].includes(b));
    case 'angelo': return !!t.angel;
    case 'cappello': return (t.hat || []).includes(a);
    case 'tavolo': return !!t.table;
    case 'viso': return t.face === a;
    case 'size': return T.kind === 'statue' ? (a === 'alto' ? size(T) >= 240 : size(T) <= 120) : (a === 'grande' ? size(T) >= 40000 : size(T) <= 4000);
    case 'tone': return t.tone === a;
    case 'scol': return t.scol === a;
    case 'by': return !!t.by;
    case 'older': return A.kind === T.kind && year(T) <= year(A) - 20;
    case 'newer': return A.kind === T.kind && year(T) >= year(A) + 20;
    case 'bigger': return A.kind === T.kind && size(T) > size(A) * 1.3;
    case 'smaller': return A.kind === T.kind && size(T) < size(A) / 1.3;
    case 'most': { const kin = MAN.works.filter(w => w.kind === T.kind), f = a === 'vecchio' ? w => -year(w) : a === 'moderno' ? year : a === 'piccolo' ? w => -size(w) : size;
      return kin.every(w => w === T || f(w) < f(T)); }
    case 'feel': return (t.feel || []).some(f => f.who === a && (f.is || []).includes(b));
    case 'not': return MAN.works.some(w => w.kind !== T.kind && (w.tags || {}).by === t.by);
  }
  return false;
}

play(async t => {
  const p = t.page, dbg = () => p.evaluate(() => __dbg()), mi = async () => (await dbg()).mispy;
  const waitFor = (fn, arg, ms = 8000) => p.waitForFunction(fn, arg, { timeout:ms, polling:100 }).then(() => true).catch(() => false);
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(200); };
  await t.jump(10);

  // ---- the data: every work has hand-written tags ----
  t.check('every work in the manifest has tags (by, people, colours)', MAN.works.length === 27 && MAN.works.every(w => w.tags && w.tags.by && Array.isArray(w.tags.people) && w.tags.colors && w.tags.colors.length));

  // ---- the generator: many seeds, five tiers ----
  const gen = await p.evaluate(() => { const out = []; for (let s = 0; s < 160; s++) for (let tier = 1; tier <= 5; tier++) out.push(__mispyGen(s * 977 + 13, s % 5, tier)); return out; });
  const bad = [], kinds = { 1:{}, 2:{}, 3:{}, 4:{}, 5:{} }, targets = new Set();
  gen.forEach((r, i) => {
    const tier = i % 5 + 1;
    if (!r){ bad.push(`tier ${tier}: no round`); return; }
    targets.add(r.target);
    const T = W[r.target];
    r.preds.forEach(q => { kinds[tier][q.type] = (kinds[tier][q.type] || 0) + 1; if (!truth(q.key, T)) bad.push(`${r.target}: ${q.key} is false · ${r.line}`); });
    if (r.matches.length !== 1 || r.matches[0] !== r.target) bad.push(`${r.target}: matches ${r.matches} · ${r.line}`);
    if (!/^Vedo, vedo… /.test(r.line)) bad.push('line: ' + r.line);
    if (tier === 1 && r.preds.length !== 1) bad.push('tier 1 with ' + r.preds.length + ' clues: ' + r.line);
    if (tier === 2 && r.preds.length !== 2) bad.push('tier 2 with ' + r.preds.length + ' clues: ' + r.line);
    if (tier === 3 && !r.preds.some(q => q.type === 'C' || q.type === 'S')) bad.push('tier 3 without a comparison: ' + r.line);
    if (tier === 4 && !r.preds.some(q => q.type === 'E')) bad.push('tier 4 without an emotion: ' + r.line);
    if (tier === 3 && !/più/.test(r.line) || tier === 4 && !/sembra/.test(r.line)) bad.push('words: ' + r.line);
  });
  bad.slice(0, 8).forEach(b => console.log('   ✗ ' + b));
  [1, 2, 3, 4, 5].forEach(k => console.log(`   tier ${k}: ` + gen.filter((r, i) => i % 5 === k - 1).slice(0, 3).map(r => r.line).join('  |  ')));
  console.log('   clue types per tier:', JSON.stringify(kinds), ' targets used:', targets.size);
  t.check(`800 rounds (160 seeds × 5 tiers): every description true for its target and only its target (${bad.length} problems)`, gen.length === 800 && !bad.length);
  t.check('the rounds use many different works (≥ 20)', targets.size >= 20);
  t.check('same seed, same round', JSON.stringify(await p.evaluate(() => __mispyGen(5, 2, 3))) === JSON.stringify(await p.evaluate(() => __mispyGen(5, 2, 3))));

  // ---- the clues after a wrong pick: always true ----
  const clues = await p.evaluate(ids => ids.flatMap(a => ids.filter(b => b !== a).map(b => [a, b, __mispyClue(a, b).it])), MAN.works.map(w => w.id));
  const badClue = clues.filter(([a, b, c]) => {
    const A = W[a], B = W[b];
    if (!/^No, non è quest[oa]\./.test(c)) return true;
    if ((B.kind === 'statue') !== /non è questa/.test(c)) return true;
    if (A.kind !== B.kind) return !c.includes(A.kind === 'statue' ? 'È una statua!' : 'È un quadro!');
    if (/più vecchi/.test(c) && !(year(A) < year(B))) return true;
    if (/più modern/.test(c) && !(year(A) > year(B))) return true;
    if (/più (grand|alt)/.test(c) && !(size(A) > size(B))) return true;
    if (/più piccol/.test(c) && !(size(A) < size(B))) return true;
    if (/(vecchi|modern|piccol|alt)a/.test(c) !== (A.kind === 'statue')) return true;
    if (/C'è un cavallo/.test(c) && !(A.tags.animals || {}).cavallo) return true;
    return false;
  });
  badClue.slice(0, 5).forEach(c => console.log('   ✗ clue ' + c.join(' · ')));
  console.log('   clues, e.g.: ' + clues.filter((c, i) => i % 97 === 0).slice(0, 5).map(c => c[2]).join('  |  '));
  t.check(`every clue (${clues.length} pairs) is true and agrees (questo / questa, vecchio / vecchia)`, clues.length === 27 * 26 && !badClue.length);

  // ---- the words ----
  const audit = await p.evaluate(() => __mispyAudit(80));
  console.log(`   audit: ${audit.lines} lines, missing: ${JSON.stringify(audit.missing)}`);
  t.check('every word Lucia says is taught (Lesson 11 Vocabolario, earlier lessons, or a name)', audit.lines > 500 && !audit.missing.length);
  const mv = await p.evaluate(() => __mispyVocab());
  t.check('… and every Lesson 11 word the game needs is in the design doc\'s Vocabolario', mv.every(w => DOC_VOCAB.includes(w)));
  mv.filter(w => !DOC_VOCAB.includes(w)).forEach(w => console.log('   ✗ not in the doc: ' + w));

  // ---- playing it in the galleria: 5 rounds ----
  await p.evaluate(() => { __debug.set({ lesson:11, tut:'l10-done' }); __debug.crowdReset(); __debug.travel('galleria'); }); await p.waitForTimeout(2700);
  await p.evaluate(() => { window.__miRounds = []; window.__miDone = null; __debug.mispy({ rounds:5, seed:4242, who:'lucia',
    onRound:(k, r) => window.__miRounds.push([k, r.target]), onDone:r => { window.__miDone = r; } }); });
  await p.waitForTimeout(600);
  let m = await mi();
  t.check('the panel: round 1 of 5, Lucia\'s description shown, the English hidden', m.active && m.panel && m.k === 0 && m.rounds === 5 && m.tier === 1 && /^Vedo, vedo… /.test(m.line) && !m.enShown
    && await p.$eval('#mispy .mi-it', e => e.textContent.startsWith('Vedo, vedo…')) && !(await p.$('#mispy .mi-en')));
  const said = l => l.replace(/…/g, '').trim();
  t.check('the line is spoken', await p.evaluate(l => (window.__spoken || []).some(s => s[1] === l), said(m.line)));
  await t.shot('museum-ispy-panel');
  await press('r');
  t.check('R (Ripeti) says it again, slowly', await p.evaluate(l => { const s = (window.__spoken || []).filter(x => x[1] === l); return s.length >= 2 && s[s.length - 1][2] <= 0.7; }, said(m.line)));
  await p.click('#mispy [data-mi=say]'); await p.waitForTimeout(200);
  t.check('so does the Ripeti button', await p.evaluate(l => (window.__spoken || []).filter(x => x[1] === l).length >= 3, said(m.line)));

  const works = (await dbg()).galleria.works;
  const goPick = async id => {
    const w = works.find(x => x.id === id);
    await p.evaluate(s => __debug.place(s.x, s.y), w.spot); await p.waitForTimeout(150);
    await press('e');
    if ((await dbg()).crowd.pick){                       // a visitor in front: Permesso first
      console.log(`   (a visitor in front of ${id}: Permesso)`);
      await press('1');
      await waitFor(id => !__dbg().galleria.blocked[id] && Object.values(__dbg().galleria.visitors).every(v => !v.walking || !v.blocks), id, 9000);
      await p.waitForTimeout(300);
      await p.evaluate(s => __debug.place(s.x, s.y), w.spot); await p.waitForTimeout(150);
      await press('e');
    }
  };
  // round 1: a wrong pick first (the work nearest the target that is not it)
  const tgt = m.target, T = works.find(w => w.id === tgt);
  const wrong = works.filter(w => w.id !== tgt).sort((a, b) => Math.hypot(a.spot.x - T.spot.x, a.spot.y - T.spot.y) - Math.hypot(b.spot.x - T.spot.x, b.spot.y - T.spot.y))[0];
  console.log(`   round 1: "${m.line}" → target ${tgt}; picking ${wrong.id} first`);
  await goPick(wrong.id);
  m = await mi();
  console.log(`   clue: ${m.react}`);
  t.check('a wrong pick: "No, non è …" and a comparison clue, the round goes on', m.lastPick === wrong.id && m.misses === 1 && m.phase === 'find' && m.k === 0 && /^No, non è quest[oa]\./.test(m.react) && m.react === m.clue);
  t.check('the clue is shown in the panel, with what was picked', await p.$eval('#mispy .mi-react.bad', e => e.textContent.startsWith('No, non è')) && await p.$eval('#mispy .mi-pick', e => e.textContent.includes('You chose')));
  await t.shot('museum-ispy-clue');
  await goPick(tgt);
  m = await mi();
  t.check('the right work: "Sì! …", 1 / 5', m.k === 1 && /^Sì!|^Esatto!/.test(m.react));
  t.check('the picture view did not open (E picks during the game)', !(await dbg()).galleria.open);
  for (let r = 2; r <= 5; r++){
    await waitFor(k => __dbg().mispy.phase === 'find' && __dbg().mispy.k === k, r - 1, 5000);
    m = await mi();
    console.log(`   round ${r} (tier ${m.tier}): "${m.line}" → ${m.target}`);
    await goPick(m.target);
    await waitFor(k => __dbg().mispy.k === k, r, 3000);
  }
  m = await mi();
  const tiers = await p.evaluate(() => window.__miRounds.length);
  t.check('5 rounds found, tiers 1 → 5, then done (onDone: 5 rounds, 1 miss)', await waitFor(() => __dbg().mispy.done, null, 5000) && tiers === 5
    && await p.evaluate(() => window.__miDone && window.__miDone.rounds === 5 && window.__miDone.misses === 1));
  await t.shot('museum-ispy-done');
  await p.click('#mispy [data-mi=close]'); await p.waitForTimeout(200);
  t.check('Chiudi closes the panel', !(await mi()).active && !(await p.isVisible('#mispy')));

  // ---- Studio: a card once Lesson 11 is complete ----
  await p.evaluate(() => { __debug.ispyUnlock(); }); await press('t');
  await p.click('[data-st-tab=ispy]'); await p.waitForTimeout(300);
  t.check('Studio, before Lesson 11 is complete: no museum card', !(await p.$('[data-mi-st=play]')));
  await press('Escape');
  await p.evaluate(() => __debug.mispyUnlock()); await press('t');
  await p.click('[data-st-tab=ispy]'); await p.waitForTimeout(300);
  t.check('after: Studio\'s Vedo, vedo tab has "Vedo, vedo… nel museo"', !!(await p.$('[data-mi-st=play]')));
  await t.shot('museum-ispy-studio');
  await p.click('[data-mi-st=play]'); await p.waitForTimeout(800);
  m = await mi();
  t.check('Gioca nel museo: a free game in the galleria (5 rounds, studio)', m.active && m.studio && m.rounds === 5 && (await dbg()).scene === 'galleria' && !(await p.isVisible('#modal')));
  await p.click('#mispy [data-mi=close]'); await p.waitForTimeout(200);
  t.check('× stops it', !(await mi()).active);
}, { fakeSpeech:true });
