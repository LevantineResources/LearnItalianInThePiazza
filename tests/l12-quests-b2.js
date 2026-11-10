/* Lesson 12's quests, batch 2: Dov'è la mamma? played for real, as a player would (the map's "!" → the piazza → Giorgia →
   her scheda → "Com'è la tua mamma?" → she comes with you → the market (Gino: a wrong colour, an agreement slip, then "Ha
   visto una signora con i capelli rossi?") → Bar Centrale's tables → the reunion (a cutscene) → Laura's thanks (Lei) → the
   stamp), then the same trail at night (Gino packing up, "È andata a prendere un gelato, alla gelateria", the reunion in the
   gelateria). Also: the station clerk's bank has one "Ecco" with the ticket in the bag. Busy dialogs at 1280 × 720; no hint
   contains the Italian answer. */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const Q = async () => (await dbg()).quests;
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const has = async s => (await t.lines()).some(l => l.includes(s));
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(250); };
  const settle = async (quiet = 1000, max = 25000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#choices').hidden ? 0 : 20000), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const say = async labels => { for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const talk = async (x, y) => { await t.talkTo(x, y); await settle(); };
  const leave = async () => { await t.leave(); await p.waitForTimeout(300); };
  const hint = () => p.$eval('#hint', h => h.hidden ? '' : h.innerText);
  /* every control on screen and clickable at 1280 × 720 (as tests/l12-citta.js) */
  const layout = async (label, sels) => {
    const bad = [];
    for (const sel of sels){
      const r = await p.evaluate(sel => {
        const e = sel.startsWith('tile:') ? [...document.querySelectorAll('#bank .tile')].find(x => x.textContent.trim() === sel.slice(5)) : document.querySelector(sel);
        if (!e) return 'missing'; e.scrollIntoView({ block:'nearest' });
        const b = e.getBoundingClientRect(), hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        return b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth && hit && (hit === e || e.contains(hit)) ? 'ok' : 'off';
      }, sel);
      if (r !== 'ok') bad.push(sel + ' ' + r);
    }
    const still = await p.evaluate(() => (document.scrollingElement.scrollTop || 0) + document.querySelector('#stage').scrollTop + document.querySelector('#dialog').scrollTop === 0);
    if (bad.length || !still) console.log('     ✗ ' + bad.join(' | ') + (still ? '' : ' (page scrolled)'));
    t.check(`layout @1280x720: ${label}, every control on screen and clickable`, !bad.length && still);
  };
  await p.evaluate(() => { window.__hintLog = []; });

  await t.jump(12);
  await p.evaluate(() => __debug.l12Explore()); await p.waitForTimeout(500);
  await until(async () => !(await dbg()).cut.on, 'no cutscene', 4000);

  /* ---------- the clerk: one Ecco tile with the ticket in the bag ---------- */
  await p.evaluate(() => __debug.travel('stazione')); await until(async () => (await dbg()).scene === 'stazione', 'the station'); await p.waitForTimeout(1900);
  await talk(107, 394);
  const eccos = await p.$$eval('#bank .tile', ts => ts.filter(x => x.textContent.trim() === 'Ecco').length);
  t.check(`the clerk's tile bank, the ticket in the bag: one Ecco tile (${eccos})`, eccos === 1 && await p.isVisible('#bank .tile >> text="il biglietto"'));
  await leave();

  /* ---------- Dov'è la mamma? by day ---------- */
  await press('m');
  t.check('the map: a "!" for Dov\'è la mamma?', !!(await p.$('[data-qspot="q:mamma"]')));
  await p.click('[data-qspot="q:mamma"] .qs-dot');
  await until(async () => (await dbg()).scene === 'piazza', 'the piazza'); await p.waitForTimeout(2000);
  t.check('Giorgia in the piazza, with the quest marker', !!(await dbg()).npcs.bambina && (await Q()).markers.includes('bambina'));
  await talk(648, 526);
  t.check('Giorgia: Mi aiuti? Dov\'è la mia mamma? (the task starts)', await has('Dov\'è la mia mamma?') && (await Q()).quests.mamma.state === 'active');
  await leave();
  await until(async () => (await Q()).scheda.open && (await Q()).scheda.id === 'mamma', 'the scheda', 8000);
  await t.shot('b2-01-scheda-mamma');
  await p.click('[data-sch-tab="words"]'); await p.waitForTimeout(200);
  const wc = await p.evaluate(() => { const w = () => __dbg().quests.scheda.words, click = s => { const b = document.querySelector(s); if (b) b.click(); };
    let g = 0, wrongId = null, cameBack = false; while (w().phase === 'cards' && g++ < 200) click('[data-vc=next]');
    while (w().phase === 'quiz' && g++ < 400){ const s = w(); if (s.status !== 'answer'){ click('[data-vc=next]'); continue; }
      if (!wrongId){ wrongId = s.cur.id; click(`[data-vq="${(s.cur.answer + 1) % s.cur.opts.length}"]`); } else { if (s.cur.id === wrongId && s.cur.again) cameBack = true; click(`[data-vq="${s.cur.answer}"]`); } }
    return { cameBack, passed:w().passed, total:w().total }; });
  t.check(`its word check (${wc.total} words, 5–10): a miss came back, passed`, wc.passed && wc.cameBack && wc.total >= 5 && wc.total <= 10);
  await p.click('[data-sch-tab="practice"]'); await p.waitForTimeout(200);
  for (const k of [1, 1, 0, 1]){ await p.click(`[data-opt="${k}"]`); await p.click('#pxNext'); }
  await p.waitForTimeout(300); await press('Escape');
  t.check('its practice done', (await Q()).quests.mamma.practice);

  await talk(648, 526);
  await say(['Ciao']);
  await say(["Dov'è la tua mamma?"]);
  t.check('Dov\'è la tua mamma? → Non lo so! (the reply follows what was said)', await has('Non lo so!'));
  await say(["Com'è la tua mamma?"]);
  t.check('Com\'è la tua mamma? → capelli rossi, una borsa gialla, i fiori; Mi aiuti a cercarla?', await has('Ha i capelli rossi… e una borsa gialla.') && await has('Mi aiuti a cercarla?'));
  await layout('Giorgia (her tiles)', ['#btnSay', '#hint', "tile:Vieni con me!"]);
  await say(['Vieni con me!']);
  t.check('Vieni con me! → Sì! Vengo con te! She follows you; the step: Gino', await has('Vengo con te!') && (await Q()).quests.mamma.step === 'gino');
  await t.shot('b2-02-giorgia');
  await leave();
  await press('m'); await p.click('[data-go="mercato"]');
  await until(async () => (await dbg()).scene === 'mercato', 'the market'); await p.waitForTimeout(2000);
  t.check('at the market, Giorgia with you', !!(await dbg()).npcs.bambina);
  await talk(630, 210);
  t.check('Gino: Oh, e questa bambina?', await has('e questa bambina?'));
  await say(['Buongiorno']);
  await say(['Ha visto una signora…?', 'con', 'i capelli', 'neri']);
  t.check('a wrong colour: No, mi dispiace; the hint sends you to Giorgia\'s description', await has('con i capelli neri? No, mi dispiace.') && /description/.test(await hint()));
  await layout('Gino (the description tiles)', ['#btnSay', '#hint', 'tile:gli occhiali', 'tile:bassa']);
  await say(['Ha visto una signora…?', 'con', 'una borsa', 'rossi']);
  t.check('una borsa rossi → he understands the colour; feedback: borsa is feminine, rossa', /feminine/.test(await hint()));
  await say(['Ha visto una signora…?', 'con', 'i capelli', 'rossi']);
  t.check('Ha visto una signora con i capelli rossi? → È andata a prendere un caffè, al Bar Centrale', await has('È andata a prendere un caffè, al Bar Centrale.') && (await Q()).quests.mamma.step === 'mamma');
  await t.shot('b2-03-gino');
  await leave();
  await press('m'); await p.click('[data-qspot="q:mamma"] .qs-dot');
  await until(async () => (await dbg()).scene === 'piazza', 'the piazza'); await p.waitForTimeout(2000);
  t.check('Laura at Bar Centrale\'s tables now (red hair, a yellow bag, flowers)', !!(await dbg()).npcs.mamma);
  await t.clickWorld(840, 330);                                                   // walk over towards the bar's tables
  await until(async () => (await dbg()).cut.id === 'm1-reunion', 'the reunion', 15000);
  await p.waitForTimeout(1600);
  await t.shot('b2-04-reunion');
  await until(async () => await p.isVisible('#dialog'), 'Laura', 15000); await settle(); await t.dump();
  t.check('the reunion: Mamma! Giorgia! Eccoti! → Laura: Grazie mille! Lei è molto gentile.', (await dbg()).crowd.said.some(x => x[1] === 'Mamma!') && await has('Lei è molto gentile.'));
  await say(['Prego!']);
  t.check('Prego! → Arrivederci, e grazie ancora!', await has('Arrivederci, e grazie ancora!'));
  await leave();
  let q = await Q();
  t.check('the quest done: a stamp; Giorgia and her mum together until you leave', q.quests.mamma.done && q.passport.includes('mamma') && !!(await dbg()).npcs.bambina && !!(await dbg()).npcs.mamma);
  await p.evaluate(() => __debug.travel('sanlorenzo')); await until(async () => (await dbg()).scene === 'sanlorenzo', 'away'); await p.waitForTimeout(1900);
  await p.evaluate(() => __debug.travel('piazza')); await until(async () => (await dbg()).scene === 'piazza', 'back'); await p.waitForTimeout(1900);
  t.check('…and then they have gone home', !(await dbg()).npcs.bambina && !(await dbg()).npcs.mamma);

  /* ---------- the same trail at night: Gino packing up, the gelateria ---------- */
  const dayHints = await p.evaluate(() => window.__hintLog || []);
  await p.evaluate(() => { localStorage.clear(); }); await p.reload(); await p.waitForTimeout(600);
  await p.evaluate(() => { window.__hintLog = []; });
  await t.jump(12);
  await p.evaluate(() => { __debug.l12Explore(); __debug.daytime('night'); __debug.schedaDone('mamma'); }); await p.waitForTimeout(500);
  await until(async () => !(await dbg()).cut.on, 'no cutscene', 4000);
  await p.evaluate(() => __debug.travel('piazza', { x:600, y:520 })); await p.waitForTimeout(600);
  await until(async () => p.evaluate(() => !document.querySelector('#fade').classList.contains('on')), 'the fade', 8000); await p.waitForTimeout(400);
  await talk(648, 526); await leave();
  await until(async () => (await Q()).scheda.open, 'the scheda', 6000); await press('Escape');
  await talk(648, 526);
  await say(["Com'è la tua mamma?"]); await say(['Sì']);
  t.check('night: Sì → she comes with you', (await Q()).quests.mamma.step === 'gino');
  await leave();
  await p.evaluate(() => __debug.travel('mercato', { x:630, y:300 })); await until(async () => (await dbg()).scene === 'mercato', 'the market'); await p.waitForTimeout(1900);
  t.check('the market at night: only Gino, packing up for Giorgia\'s sake', !!(await dbg()).npcs.gino && !(await dbg()).npcs.teresa);
  await talk(630, 210);
  t.check('Gino: Buonasera! Eh, sto chiudendo…', await has('sto chiudendo'));
  await say(['Ha visto una signora…?', 'con', 'una borsa', 'gialla']);
  t.check('…È andata a prendere un gelato, alla gelateria', await has('È andata a prendere un gelato, alla gelateria.'));
  await leave();
  await p.evaluate(() => __debug.travel('gelateria')); await until(async () => (await dbg()).scene === 'gelateria', 'the gelateria'); await p.waitForTimeout(1900);
  t.check('Laura in the gelateria, at a table; Giorgia with you', !!(await dbg()).npcs.mamma && !!(await dbg()).npcs.bambina);
  await t.clickWorld(260, 440);
  await until(async () => (await dbg()).cut.id === 'm1-reunion', 'the reunion', 15000);
  await p.waitForTimeout(1600); await t.shot('b2-05-reunion-gelateria');
  await until(async () => await p.isVisible('#dialog'), 'Laura', 15000); await settle();
  await say(['Arrivederci']);
  await leave();
  t.check('night: the reunion in the gelateria, the quest done', (await Q()).quests.mamma.done);

  /* ---------- no hint gave the answer ---------- */
  const norm = x => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const forbidden = ["com'e la tua mamma", 'ha visto una signora con i capelli rossi', 'ha visto una signora con una borsa gialla', 'con i capelli rossi', 'con una borsa gialla'].map(norm);
  const shown = dayHints.concat(await p.evaluate(() => window.__hintLog || []));
  const leaks = shown.filter(h => forbidden.some(m => norm(h).includes(m)));
  console.log(`   ${shown.length} hints shown; leaks: ${leaks.join(' | ') || 'none'}`);
  t.check('no hint contains the Italian answer', shown.length >= 5 && leaks.length === 0);
}, { fakeSpeech:true, viewport:{ width:1280, height:720 } });
