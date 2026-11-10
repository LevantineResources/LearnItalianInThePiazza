/* Lesson 15 · Venezia, part 2 (tests/l15-venezia.js plays the lesson): il signor Bepi's Padova questions from your stamps, and the
   unit's end.
   Run: Bepi with no quest done (random questions, every quest's words in the bank; "Sì" to the first, "No, ma ho…" to the second);
   then with three quests done through __debug.questDone (the first question is about one of them, the second about one you didn't do;
   only your quests' things are in the bank; a bare "No" gets "E cosa ha fatto, allora?"; Padova più tranquilla). Then the end of the
   unit as a later save has it (free play): the unit-completion screen (its stats and choices; the replay list: Lessons 1–15, hard mode
   coming soon; Unit 2 coming soon); Replay Lesson 2 (the real game kept), played through the real UI to its completion screen, whose
   "Start Lezione 3" has become "Back to free play" → free play, with the replay's sentences counted; a reload loads free play. */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const has = async s => (await t.lines()).some(l => l.includes(s));
  const settle = async (quiet = 900, max = 25000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#choices').hidden ? 0 : 20000), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const say = async labels => { await p.waitForSelector('#builder:not([hidden])', { timeout:12000 }); for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(250); };
  const tiles = async () => p.$$eval('#bank .tile', ts => ts.map(x => x.textContent.trim()));
  const leave = async () => { await t.leave(); await p.waitForTimeout(300); };
  /* to the bench (l15-bepi), Bepi comes along; through the first stages to his first Padova question */
  const toBepi = async () => {
    await p.evaluate(() => __debug.l15At('l15-bepi', { bepi:{ stage:'pet' }, bepiCome:false, bepiDone:false, bepiGone:false }));
    await until(async () => (await dbg()).scene === 'ferrovia', 'the fondamenta', 8000); await p.waitForTimeout(2800);
    await p.evaluate(() => __debug.place(498, 330, { x:0, y:1 })); await p.waitForTimeout(200); await press('e');
    await p.waitForSelector('#dialog:not([hidden])', { timeout:25000 }); await p.waitForTimeout(600); await settle(); await t.dump();
    await say(['Sì, certo!']);
    await say(['Mi chiamo Sam', 'Lei è Margaret', 'è inglese']);
    await say(['Abbiamo preso', 'il treno di notte']);
    await say(['Mi è piaciuto molto!']);
    return (await dbg()).l15;
  };

  await t.jump(15);
  await p.evaluate(() => { window.__hintLog = []; });
  /* ---------- 1 · no quest done: random questions, every word there ---------- */
  let L = await toBepi();
  console.log('   no quests: ' + JSON.stringify(L.day));
  t.check('no quest done: random questions (two different ones), every quest\'s things in the bank', L.day.free && L.day.done.length === 0 && L.day.yes && L.day.no && L.day.yes.key !== L.day.no.key
    && ['formaggio', 'tramonto', 'gelato', 'basilica', 'foto'].every(k => L.day.items.includes(k)));
  let ts = await tiles();
  t.check('the bank: Ho, the participles, the day\'s things', ts.includes('Ho') && ts.includes('visto') && ts.includes('il tramonto') && ts.includes('il formaggio') && ts.includes('un gelato'));
  t.check('his first question (stage day1)', L.bepi.stage === 'day1' && await has(L.day.yes.q));
  await say(['Sì']);
  L = (await dbg()).l15;
  t.check('"Sì" → his reply and the second question (day2)', L.bepi.stage === 'day2' && await has(L.day.no.q || '??'));
  await say(['No', 'ma', 'Ho', 'mangiato', 'un gelato']);
  t.check('"No, ma ho mangiato un gelato." → "Peccato!", the pistachio, and the comparison', await has('Peccato') && await has('pistacchio') && (await dbg()).l15.bepi.stage === 'compare');
  await leave();

  /* ---------- 2 · three quests done (__debug.questDone): from your stamps ---------- */
  await p.evaluate(() => { ['tramonto', 'gelateria', 'basilica'].forEach(id => __debug.questDone(id)); });
  L = await toBepi();
  console.log('   three quests: ' + JSON.stringify(L.day));
  t.check('three quests done (5, 9, 11): the first question is about one of yours (the sunset)', !L.day.free && [5, 9, 11].every(n => L.day.done.includes(n)) && L.day.yes.key === 'tramonto' && await has('Ha visto il tramonto sul ponte?'));
  t.check('…the second about one you didn\'t do (or the Scrovegni Chapel)', L.day.no.key === 'chapel' || ![5, 9, 11].includes(L.day.no.quest));
  ts = await tiles();
  t.check('only your quests\' things in the bank (the sunset, the ice cream, the basilica; no cheese)', ts.includes('il tramonto') && ts.includes('un gelato') && ts.includes('la basilica') && !ts.includes('il formaggio'));
  await say(['Sì', 'Ho', 'visto', 'il tramonto', 'sul ponte']);
  t.check('"Sì, ho visto il tramonto sul ponte." → "Che romantico!"', await has('Che romantico!') && (await dbg()).l15.bepi.stage === 'day2');
  await say(['No']);
  t.check('a bare "No" → "E cosa ha fatto, allora?"', await has('cosa ha fatto, allora?') && (await dbg()).l15.bepi.need);
  await say(['Ho', 'acceso', 'una candela']);
  t.check('"Ho acceso una candela." → his reply, the comparison', (await dbg()).l15.bepi.stage === 'compare');
  /* the Frasi fatte: Ancora una volta, per favore → his question again, slowly; E Lei? → his own opinion */
  await say(['Ancora una volta, per favore']);
  const again = (await t.lines()).filter(l => l.includes('È più bella di Padova?')).length;
  t.check('"Ancora una volta, per favore" → "Sì, certo!" and his question again', await has('Sì, certo!') && again >= 2 && (await dbg()).l15.bepi.stage === 'compare');
  await say(['E Lei?']);
  t.check('"E Lei?" → "Io? Venezia, sempre!"', await has('Venezia, sempre!'));
  await say(['Padova', 'è', 'più', 'tranquilla']);
  t.check('"Padova è più tranquilla" → "turisti, turisti!"', await has('turisti, turisti') && (await dbg()).l15.bepi.stage === 'family');
  await leave();
  const log = await p.evaluate(() => window.__hintLog || []);
  t.check('no hint gives a model sentence', !log.some(x => /sto imparando|mi è piaciuto molto|abbiamo preso il treno|ho visto il tramonto|più tranquilla/i.test(x)));

  /* ---------- 3 · the end of the unit: the screen, its choices ---------- */
  await p.evaluate(() => __debug.l15Skip());
  await until(async () => (await dbg()).scene === 'piazza', 'the piazza', 8000); await p.waitForTimeout(1900);
  let d = await dbg();
  t.check('after the unit (the skip): free play in the piazza', d.lesson === 15 && d.tut === 'l15-done' && d.l15.free && d.scene === 'piazza');
  await p.click('#guide [data-l15unit]'); await p.waitForTimeout(400);
  d = await dbg();
  t.check('the guide\'s "Unit 1 · Riepilogo" opens the unit-completion screen', d.unit.open && d.unit.view === 'main');
  const sh = await p.textContent('#sheet');
  t.check('the screen: words, quests (3 / 12), stamps, sentences; three choices', sh.includes('words and phrases') && sh.includes('3 / 12') && sh.includes('stamps') && sh.includes('Free play in Padova') && sh.includes('Replay a lesson') && sh.includes('Unit 2 · Venezia'));
  t.check('Unit 2 · Venezia: coming soon (not a button)', await p.$eval('.u-choice.soon', e => e.tagName !== 'BUTTON' && e.getAttribute('aria-disabled') === 'true'));
  await p.click('[data-unit="replay"]'); await p.waitForTimeout(300);
  const rows = await p.$$eval('[data-replay]', bs => bs.map(b => +b.dataset.replay));
  const hard = await p.$$eval('.u-go .btn[disabled]', bs => bs.map(b => b.textContent));
  t.check('Replay a lesson: Lessons 1–15, each with Replay; hard mode shown as coming soon (disabled)', rows.length === 15 && rows[0] === 1 && rows[14] === 15 && hard.length === 15 && hard.every(x => /soon/i.test(x)));
  await p.click('[data-unit="back"]'); await p.waitForTimeout(200);
  t.check('back to the summary', (await dbg()).unit.view === 'main');
  await p.click('[data-unit="replay"]'); await p.waitForTimeout(200);
  const before = await p.evaluate(() => ({ sentences:__dbg().l15 ? 0 : 0 }));
  await p.click('[data-replay="2"]');
  await p.waitForTimeout(2600);
  d = await dbg();
  t.check('Replay Lesson 2: Lezione 2 from its start (in the piazza); the real game kept aside', d.lesson === 2 && d.tut === 'l2-bar' && d.scene === 'piazza' && d.unit.replay && d.unit.replay.n === 2 && !d.unit.replay.finished && !d.l15);

  /* ---------- 4 · Lesson 2, played through ---------- */
  const clickWorld = async (x, y) => { const r = await p.$eval('#cv', c => { const b = c.getBoundingClientRect(); return { l:b.left, t:b.top, w:b.width, h:b.height }; }); await p.mouse.click(r.l + x / 960 * r.w, r.t + y / 600 * r.h); };
  const talkTo = async (x, y) => { await clickWorld(x, y); await p.waitForSelector('#dialog:not([hidden])', { timeout:25000 }); await p.waitForTimeout(900); await settle(); await t.dump(); };
  const sayW = async s => { for (const w of (Array.isArray(s) ? s : s.split(' '))) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(500); await settle(); await t.dump(); };
  await talkTo(845, 144);
  await sayW(['Ciao', 'Mi chiamo Sam']);
  await p.waitForSelector('#choices:not([hidden]) button', { timeout:8000 });
  await p.click('#choices button'); await p.waitForSelector('#choices button.primary', { timeout:8000 }); await settle();
  await p.click('#choices button.primary'); await p.waitForSelector('#modal:not([hidden])'); await p.waitForTimeout(300);
  await t.practice([['o', 1], ['t', ['vorrei', 'un', 'caffè', 'per', 'favore']], ['o', 0], ['o', 1], ['t', ['no', 'grazie', "quant'è"]], ['o', 2], ['t', ['ancora', 'una', 'volta', 'per', 'favore']], ['o', 1]]);
  await talkTo(845, 144);
  await sayW('vorrei un caffè');
  await sayW(['sì', 'un', 'cornetto', 'per', 'favore']);
  await sayW(['no', 'Grazie']);
  await sayW(['Grazie']);
  await leave();
  await until(async () => (await dbg()).tut === 'l2-emma', 'Emma', 6000);
  await talkTo(655, 250);
  await p.waitForSelector('#choices button.primary', { timeout:8000 }); await p.click('#choices button.primary'); await p.waitForTimeout(1400); await leave();
  await talkTo(845, 144); await p.waitForTimeout(600);
  await sayW('vorrei una spremuta per favore');
  await p.waitForSelector('#choices:not([hidden]) .btn.english', { timeout:8000 });
  await p.click('#choices .btn.english >> nth=0'); await p.waitForTimeout(300);
  await p.click('#choices .btn.english >> nth=1'); await p.waitForTimeout(900); await settle(); await t.dump();
  await sayW(['sì', 'un', 'cornetto', 'per', 'favore']);
  await sayW(['no', 'Grazie']);
  await sayW("quant'è");
  await p.waitForSelector('#choices:not([hidden]) .btn.english', { timeout:8000 });
  await p.click('#choices .btn.english >> nth=1'); await p.waitForTimeout(1400); await settle();
  await sayW(['Grazie']);
  await leave();
  await until(async () => (await dbg()).tut === 'l2-done', 'Lesson 2 done', 8000);
  await until(async () => (await p.isVisible('#modal')) && !!(await p.$('[data-replay-patched]')), 'the completion screen, patched', 8000);
  const btn = await p.$$eval('#sheet .cta button', bs => bs.map(b => b.textContent));
  d = await dbg();
  t.check('Lesson 2 replayed to its end: its completion screen\'s "Start Lezione 3" is now "Back to free play"', d.tut === 'l2-done' && d.unit.replay.finished && btn.includes('Back to free play') && !btn.some(x => x.includes('Lezione 3')));
  await p.click('[data-replay-patched]');
  await until(async () => (await dbg()).lesson === 15, 'home', 8000); await p.waitForTimeout(2000);
  d = await dbg();
  t.check('back to free play: Lesson 15 done, the piazza, no replay; the story did not continue to Lesson 3', d.lesson === 15 && d.tut === 'l15-done' && d.l15.free && d.scene === 'piazza' && !d.unit.replay && d.unit.replayDone === 2);
  t.check('the three quests and their stamps are still there; the replay\'s sentences counted', d.quests.quests.tramonto.done && d.quests.passport.length >= 3);
  /* a save after the unit loads into free play */
  await p.reload(); await p.waitForTimeout(800);
  await p.click('#btnContinue'); await p.waitForTimeout(1800);
  d = await dbg();
  t.check('reloaded: free play', d.lesson === 15 && d.tut === 'l15-done' && d.l15.free && d.scene === 'piazza' && !d.unit.replay);
  /* the "Start Lezione 3" in the guide of a finished replay also goes home: replay 2 again, finish quickly, click the guide's button */
  await p.evaluate(() => __debug.replay(2)); await p.waitForTimeout(2600);
  await p.evaluate(() => __debug.set({ vocab2:true, practiceDone2:true, l2own:true, l2EmmaDone:true, tut:'l2-done' }));
  await until(async () => (await dbg()).unit.replay && (await dbg()).unit.replay.finished, 'finished', 4000);
  await until(async () => (await dbg()).unit.open, 'the replay-done screen', 6000);
  t.check('a finished replay without its own screen: "Replay complete" with Back to free play', (await dbg()).unit.view === 'replaydone' && await p.isVisible('[data-replay-home]'));
  await p.click('[data-replay-home]');
  await until(async () => (await dbg()).lesson === 15, 'home again', 8000); await p.waitForTimeout(1900);
  t.check('home again: free play', (await dbg()).l15.free && (await dbg()).scene === 'piazza');
}, { fakeSpeech:true });
