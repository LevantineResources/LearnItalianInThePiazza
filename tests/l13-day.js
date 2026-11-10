/* Lesson 13 · Il treno della notte: the Bassis' conversation with no Lesson 12 history (docs/lessons/13-il-treno-della-notte.md, *The
   day from Lesson 12*), and the shared train (world/treno.js): the dawn / lagoon windows, a dog following, a lesson's knock hook.
   No quests done (the skip link): every quest's things in the bank; Prima ho visto la basilica, poi ho mangiato un gelato (two: no E
   dopo?); Lina asks about a random quest (answered with its own words); three things told: Margaret chimes in, Anche Margaret ha visto
   la basilica; the chapel (No, ma …); Perché è bellissima!; Buonanotte; la signora Ferri calls you over (left for now). The parser's formatting of the joined sentences.
   Then the Bassis again with other histories and answers (Sì / Sì, un gelato / Sì, ho mangiato un gelato / No / No, non ho … / No, ma ho …
   / Ma ho … / another thing): every question asked once, Margaret once after the third thing, the conversation always finishes.
   The whole lesson in order: tests/l13-train.js. */
const { play } = require('./lib/harness');
const path = require('path'), fs = require('fs');
const REVIEW = path.resolve(__dirname, '..', 'review', 'l13');
const RW = path.resolve(__dirname, '..', 'review', 'l13-rework');
const FIX = path.resolve(__dirname, '..', 'review', 'fix-l12-13');
fs.mkdirSync(REVIEW, { recursive:true }); fs.mkdirSync(RW, { recursive:true }); fs.mkdirSync(FIX, { recursive:true });

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const has = async s => (await t.lines()).some(l => l.includes(s));
  const settle = async (quiet = 600, max = 25000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#choices').hidden ? 0 : 20000), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const say = async labels => { for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const type = async text => { await t.type(text, 600); await settle(); };
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(250); };
  const shot = async name => { await p.screenshot({ path:path.join(REVIEW, name + '.jpg'), type:'jpeg', quality:72 }); };
  const rshot = async name => { await p.screenshot({ path:path.join(RW, name + '.jpg'), type:'jpeg', quality:74 }); };
  const fshot = async name => { await p.screenshot({ path:path.join(FIX, name + '.jpg'), type:'jpeg', quality:74 }); };
  const me = async s => p.evaluate(s => [...document.querySelectorAll('.line.me')].some(l => l.textContent.includes(s)), s);
  const showLine = async s => { await p.evaluate(s => { const l = [...document.querySelectorAll('#transcript .line')].filter(x => x.textContent.includes(s)).pop(); if (l) l.scrollIntoView({ block:'start' }); }, s); await p.waitForTimeout(200); };
  const bankTiles = async () => p.$$eval('#bank .tile', ts => ts.map(x => x.textContent.trim()));
  const hint = async () => p.$eval('#hint', h => h.hidden ? '' : h.innerText.replace(/\s+/g, ' '));
  const leave = async () => { await t.leave(); await p.waitForTimeout(300); };
  const l13 = async () => (await dbg()).l13;
  const margSays = async s => p.evaluate(s => [...document.querySelectorAll('.line.companion')].some(l => l.textContent.includes(s)), s);
  /* stand beside someone and press E (the train is wider than the canvas: positions are world coordinates) */
  const talkAt = async (x, y, face) => { await p.evaluate(([x, y, f]) => __debug.place(x, y, f), [x, y, face || { x:0, y:-1 }]); await p.waitForTimeout(250); await press('e');
    await p.waitForSelector('#dialog:not([hidden])', { timeout:12000 }); await p.waitForTimeout(600); await settle(); await t.dump(); };
  const choose = async label => { await p.waitForSelector('#choices:not([hidden])', { timeout:12000 }); await p.click(`#choices button >> text="${label}"`); await p.waitForTimeout(400); await settle(); await t.dump(); };
  /* ---------- no quests done → every quest's things, a random question ---------- */
  await t.jump(13);
  await p.evaluate(() => __debug.l13At('day'));
  await until(async () => (await dbg()).scene === 'treno', 'the dining car', 8000); await p.waitForTimeout(1800);
  await talkAt(1444, 262, { x:0, y:-1 });
  d = await dbg();
  { const tl = await bankTiles();
    t.check(`no history: every quest's things in the bank (${d.l13.dayItems.length} things: il formaggio, una candela, un messaggio, qualcosa, una bambina…; a trovare la mamma, con Rosa)`, d.l13.free && d.l13.quests.length === 0
      && ['il formaggio', 'una candela', 'un messaggio', 'qualcosa', 'una bambina', 'un bambino', 'un aperitivo', 'il tramonto', 'la basilica', 'a trovare la mamma', 'con Rosa', "con l'aquilone", 'in farmacia'].every(w => tl.includes(w))); }
  await say(['prima', 'Ho', 'visto', 'la basilica', 'poi', 'Ho', 'mangiato', 'un gelato']);
  d = await dbg();
  t.check(`“Prima ho visto la basilica, poi ho mangiato un gelato.”: both answered, Che giornata!, no E dopo?; Lina asks about a random quest (${d.l13.qYes})`, await me('Prima ho visto la basilica, poi ho mangiato un gelato.')
    && await has('Bellissima, vero?') && await has('Io adoro il pistacchio') && await has('Che giornata!') && !(await has('E dopo?')) && d.l13.stage === 'yes' && !!d.l13.qYes && !['basilica', 'gelato'].includes(d.l13.qYes));
  { const q = await p.evaluate(k => { const d = __debug.l13Data().items.find(x => x.key === k); return { pp:d.pp[0], label:d.label, it:d.q.it }; }, d.l13.qYes);
    t.check(`her question: “${q.it}”`, await has(q.it));
    await rshot('06-lina-random-question');
    await say(['Sì', 'Ho', q.pp, q.label]); }
  d = await dbg();
  t.check('answered with the quest\'s own words (all in the bank): yes done; three things told, so Margaret chimes in (once) before the next question', d.l13.yes === 'done' && d.l13.told.bassi.length === 3 && d.l13.stage === 'anche' && await margSays('saw it too') && !(await has('Ha visto la Cappella degli Scrovegni?')));
  await say(['Anche', 'Margaret', 'Ha', 'visto', 'la basilica']);
  t.check('“Anche Margaret ha visto la basilica.” (la basilica works too): Anche la signora!; then the chapel (No, ma …)', await me('Anche Margaret ha visto la basilica.') && (await l13()).anche === 'done' && (await l13()).qNo === 'chapel' && await has('Ha visto la Cappella degli Scrovegni?'));
  await say(['No', 'ma', 'Ho', 'comprato', 'il formaggio', 'al mercato']);
  t.check('“No, ma ho comprato il formaggio al mercato.”: Peccato!, the cheese and the market replies; E perché Venezia?', await me('No, ma ho comprato il formaggio al mercato.') && await has('Al mercato coperto') && (await l13()).why === 'asked' && await has('E perché Venezia'));
  await say(['perché', 'è bellissima']);
  t.check('“Perché è bellissima!”: Lina answers that reason (i canali, le gondole), not another', await me('Perché è bellissima!') && await has('I canali, le gondole') && !(await has('Tiziano')) && (await l13()).reason === 'bella');
  await say(['Buonanotte']);
  t.check('no question back: Buonanotte → their goodbye (E domani, Venezia!), the conversation ends', await has('A domani!') && await has('E domani, Venezia!') && await p.isVisible('#choices:not([hidden])') && !(await l13()).askedBack);
  await leave();
  /* (la signora Ferri calls you over: leave her for now) */
  await until(async () => (await l13()).ferri === 'talk' && await p.isVisible('#dialog'), 'la signora Ferri calls you over', 25000);
  await leave();
  t.check('the parser: e / poi / ma / prima / dopo / anche (formatSentence)', await p.evaluate(() => [__debug.fmt('no ma ho visto il museo'), __debug.fmt('ho visto il museo e poi ho preso il treno'), __debug.fmt("perché c'è il mare"), __debug.fmt('quando arriviamo a Venezia'),
    __debug.fmt('prima di partire ho comprato il formaggio'), __debug.fmt('dopo ho visto il tramonto'), __debug.fmt('il mio amico mark è inglese non parla italiano')].join(' | '))
    .then(x => { console.log('   ' + x); return x === "No, ma ho visto il museo. | Ho visto il museo e poi ho preso il treno. | Perché c'è il mare! | Quando arriviamo a Venezia? | Prima di partire, ho comprato il formaggio. | Dopo, ho visto il tramonto. | Il mio amico mark è inglese. Non parla italiano."; }));

  /* ---------- the Bassis again and again: different histories, different answers (the designer's loop on "Ha assaggiato il gelato?")
     Each run: the quests done, then the tiles a player would pick; checks that every question is asked once, Margaret chimes in once
     (right after the third thing told), and the conversation always reaches its goodbye. ---------- */
  const items = (await p.evaluate(() => __debug.l13Data().items)).reduce((o, d) => (o[d.key] = d, o), {});
  const qTexts = [...Object.values(items).filter(d => d.q).map(d => d.q.it), 'Ha visto la Cappella degli Scrovegni?'];
  const npcLines = async () => p.$$eval('#transcript .line.npc', ls => ls.map(l => l.innerText.replace(/\s+/g, ' ')));
  const bassi = async (label, quests, answers, margShot) => {
    await p.evaluate(() => { if (document.querySelector('#dialog:not([hidden])')) document.querySelector('#dlgClose').click(); });
    await p.waitForTimeout(600);
    await p.evaluate(ns => __debug.l13Bassi(ns), quests);
    await talkAt(1444, 262, { x:0, y:-1 });
    const log = [], margAt = [];
    let ended = false;
    for (let turn = 0; turn < 16 && !ended; turn++){
      const L = await l13(), st = L.stage, told = L.told.bassi.length;
      const pick = answers[st] ? answers[st](L, turn) : null;
      if (!pick){ log.push(`(${st}: no answer)`); break; }
      await say(pick);
      const L2 = await l13();
      log.push(`${st} → ${pick.join(' ')} → ${L2.stage}`);
      if (await margSays('saw the church too') || await margSays('saw it too')){ margAt.push({ turn, before:told, after:L2.told.bassi.length, stage:st });
        if (margShot && margAt.length === 1){ await showLine('too, dear') ; await fshot(margShot); } }
      ended = await p.isVisible('#choices:not([hidden])') && L2.why === 'done';
    }
    const lines = await npcLines();
    const twice = qTexts.filter(q => lines.filter(l => l.includes(q.split('?')[0])).length > 1);
    const marg = await p.evaluate(() => [...document.querySelectorAll('.line.companion')].filter(l => /saw (the church|it) too/.test(l.textContent)).length);
    const m0 = margAt[0];
    console.log(`   ${label}: ${log.join(' | ')}`);
    t.check(`${label}: the conversation finishes (${log.length} turns), no question asked twice (${twice.join(', ') || 'none'}), Margaret chimes in once (${marg}), when the third thing is told (${m0 ? m0.before + ' → ' + m0.after + ' at ' + m0.stage : '-'})`,
      ended && !twice.length && marg === 1 && !!m0 && (m0.after >= 3 && m0.before < 3 || m0.stage === 'ma'));
    return { log, lines };
  };
  const thing = (L, k, pp) => { const d = items[k]; return ['Ho', pp || d.pp[0], d.label]; };
  const mine = (L, n) => L.dayItems.filter(k => k !== L.qYes && k !== L.qNo && !L.told.bassi.includes(k))[n || 0];
  const why = () => ['perché', 'è bellissima'], bye = () => ['Buonanotte'], anche = () => ['Anche', 'Margaret', 'Ha', 'visto', 'la chiesa'];
  /* 1 · the designer's history (no gelato): "Ha assaggiato il gelato?" → No, ma ho … (it used to come back) */
  const r1 = await bassi('a history without the ice cream; No, ma ho … to "Ha assaggiato il gelato?"', [4, 5, 7, 8, 10, 11, 12], {
    tell:L => thing(L, 'basilica'), dopo:L => thing(L, 'foto'), yes:L => ['Sì', ...thing(L, L.qYes)],
    ma:L => ['No', 'ma', ...thing(L, mine(L))], anche, why, back:bye });
  t.check('…Ernesto asked "Ha assaggiato il gelato?", once; No, ma ho … moved on: Ah, no? Peccato!', r1.lines.filter(l => l.includes('Ha assaggiato il gelato?')).length === 1 && r1.lines.some(l => l.includes('Peccato! La prossima volta!')));
  await showLine('Ha assaggiato il gelato?'); await fshot('l13-01-no-ma-moves-on');
  /* 2 · the ice cream done: Lina asks about it; the answers a learner gives */
  await bassi('the ice cream done: Sì alone; No alone', [9, 4, 2], {
    tell:L => thing(L, 'biglietto'), dopo:L => thing(L, 'treno'), yes:() => ['Sì'], ma:() => ['No'], anche, why, back:bye });
  await bassi('Sì, un gelato (a thing alone); No, non ho … (non)', [9, 4, 2], {
    tell:L => thing(L, 'formaggio', 'comprato'), dopo:L => thing(L, 'biglietto'), yes:L => ['Sì', items[L.qYes].label],
    ma:L => ['No', 'non', ...thing(L, L.qNo)], anche, why, back:bye });
  await bassi('Sì, ho mangiato un gelato; Ma ho … (no No)', [9, 4, 2], {
    tell:L => thing(L, 'treno'), dopo:L => thing(L, 'biglietto'), yes:L => ['Sì', 'Ho', 'mangiato', items[L.qYes].label],
    ma:L => ['ma', ...thing(L, mine(L))], anche, why, back:bye });
  /* 3 · no history (every quest's things); three things at once: Margaret first, then Lina's questions */
  await bassi('no history, three things in one go: Margaret chimes in at once, then the questions', [], {
    tell:L => ['prima', 'Ho', 'visto', 'la basilica', 'poi', 'Ho', 'mangiato', 'un gelato', 'e', 'poi', 'Ho', 'fatto', 'una foto'], anche,
    yes:L => ['No', 'non', ...thing(L, L.qYes)], ma:L => ['No', 'ma', ...thing(L, mine(L))], why, back:() => ['E Lei, perché Venezia?'] }, 'l13-02-margaret-after-three');
  
  /* 4 · every quest done: another thing instead of an answer (it still moves on) */
  await bassi('every quest done: another thing told instead of an answer', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], {
    tell:L => thing(L, 'tramonto'), dopo:L => thing(L, 'aperitivo'), yes:L => thing(L, mine(L)), ma:() => ['Sì'], anche, why, back:bye });
  await leave();
  await until(async () => !(await dbg()).cut.on && !(await p.isVisible('#dialog')), 'nothing open', 8000);

  /* ---------- the shared train: dawn and the lagoon, a voice behind a door, dogs ---------- */
  await p.evaluate(() => { __debug.treno({ sky:'dawn' }); __debug.place(1500, 300); });
  await p.waitForTimeout(400);
  t.check('dawn: the sky parameter', (await dbg()).treno.sky === 'dawn');
  await shot('17-dawn-window');
  await p.evaluate(() => { __debug.treno({ sky:'lagoon' }); __debug.dog('brigante', { scene:'treno', x:1560, y:300, sit:true }); __debug.dog('biscuit', { follows:'player' }); __debug.place(1490, 320); });
  if (!await until(async () => { const b = (await dbg()).treno.dogs.biscuit.at; return Math.hypot(b[0] - 1490, b[1] - 320) < 70; }, 'Biscuit follows', 8000)){
    const x = await dbg(); console.log('   state:', JSON.stringify({ cut:x.cut, dog:x.treno.dogs.biscuit, me:x.me, dialog:await p.isVisible('#dialog'), modal:await p.isVisible('#modal'), tut:x.tut, phase:x.l13.phase, busy:x.l13.busy })); }
  d = await dbg();
  t.check('the lagoon; Brigante placed in the dining car; Biscuit follows the player', d.treno.sky === 'lagoon' && d.treno.dogs.brigante.here && d.treno.dogs.biscuit.follows === 'player'
    && Math.hypot(d.treno.dogs.biscuit.at[0] - 1490, d.treno.dogs.biscuit.at[1] - 320) < 70);
  await shot('18-lagoon-window-dogs');
  await p.evaluate(() => __debug.set({ lesson:14, tut:'l14-test' }));    /* (as Lesson 14 will: Lesson 13's own hooks are off) */
  await p.evaluate(() => { __debug.hook({ knock(id){ if (id !== 15) return; __treno.knockFx(15); setTimeout(() => __treno.doorSay(15, 'Bau! Bau!', { en:'Woof! Woof!' }), 500); setTimeout(() => __treno.doorOpen(15, true), 900); return true; } }); __debug.place(635, 236, { x:0, y:1 }); });
  await p.waitForTimeout(200);
  await press('e');
  await until(async () => { const x = (await dbg()).treno; return x.says.some(s => s[0] === 15) && x.open.includes('15'); }, 'the barking and the door', 8000);
  d = await dbg();
  t.check('a lesson\'s knock hook: barking behind door 15, the door opens', d.treno.says.some(s => s[0] === 15 && /Bau/.test(s[1])) && d.treno.open.includes('15'));
  await shot('19-knock-hook-barking');
  await p.evaluate(() => __debug.hook(null));
}, { fakeSpeech:true, viewport:{ width:1280, height:720 } });
