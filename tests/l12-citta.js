/* Lesson 12 · Un giorno in città, played from the skip link to the completion screen (docs/lessons/12-la-citta.md), at
   1280 × 720 (the busy dialogs). Speech is faked (harness fakeSpeech).
   Chiara's directions (tu) and the map route (one wrong turn first); the station: the board, the clerk's barrier (fast);
   the handbook, the word check (one wrong answer), the practice (12); the ticket: the train pulls out (the cutscene), "per
   domani" (the first train is tomorrow), per stasera, andata, the price in the notepad (one wrong number), paying with
   change; the town opens (the map's "!" spots, the task list, the passport); both quests played for real: Il caffè è
   finito! (Enzo out of coffee, Davide's packet, the bag, Ecco il caffè!) and Il messaggio (Paolo → Chiara and back, with a
   wrong person on the way: sono → è), In farmacia (the shop template: ask, the shelves, the notepad, pay); the dusk cutscene
   (the bells, night); La gelateria (cone or cup, two flavours, the cream, pay) and Musica in piazza (the first stranger's no,
   the faster music, Sì volentieri!, the dance); 23:00; the station at night (the board, the
   conductor refuses an unstamped ticket, the green machine, the conductor, the train); the completion screen with the
   passport. No hint contains the Italian answer. Then Lesson 11's ending offers Lezione 12. */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const objective = async want => { const o = await t.objective(); return want === undefined ? o : o === want; };
  const has = async s => (await t.lines()).some(l => l.includes(s));
  const settle = async (quiet = 1000, max = 25000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#choices').hidden ? 0 : 20000), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const say = async labels => { for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const leave = async () => { await t.leave(); await p.waitForTimeout(300); };
  const l12 = async () => (await dbg()).l12;
  const Q = async () => (await dbg()).quests;
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(250); };
  const travel = async (scene, x, y) => { await p.evaluate(([s, x, y]) => __debug.travel(s, x != null ? { x, y } : null), [scene, x, y]); await until(async () => (await dbg()).scene === scene, scene); await p.waitForTimeout(1900); };
  const talk = async (x, y) => { await t.talkTo(x, y); await settle(); };
  const bye = async (labels = ['Arrivederci']) => { await say(labels); await leave(); };
  await p.evaluate(() => { window.__hintLog = []; });
  /* a quest's scheda as a player does it: the Words tab (every card, the quiz), then the practice */
  const scheda = async (id, answers) => {
    await until(async () => (await dbg()).quests.scheda.open && (await dbg()).quests.scheda.id === id, 'the scheda ' + id, 8000);
    await p.click('[data-sch-tab="words"]'); await p.waitForTimeout(200);
    await p.evaluate(() => { const w = () => __dbg().quests.scheda.words, click = s => { const b = document.querySelector(s); if (b) b.click(); };
      let g = 0; while (w().phase === 'cards' && g++ < 200) click('[data-vc=next]');
      while (w().phase === 'quiz' && g++ < 400){ const s = w(); if (s.status !== 'answer'){ click('[data-vc=next]'); continue; } click(`[data-vq="${s.cur.answer}"]`); } });
    await p.click('[data-sch-tab="practice"]'); await p.waitForTimeout(200);
    for (const k of answers){ await p.click(`[data-opt="${k}"]`); await p.click('#pxNext'); }
    await p.waitForTimeout(300);
    const ok = (await Q()).quests[id].words && (await Q()).quests[id].practice;
    await press('Escape');
    return ok;
  };
  /* the busy dialogs at 1280 × 720 (as tests/layout.js): every control the player needs now is inside the window and every
     clipping box, and a click at its centre hits it; nothing scrolled that a player can't scroll. A tile is found by its label
     ('tile:venti'); `reach` lets the mouse wheel scroll the dialog to it (a player can) */
  const probe = sel => p.evaluate(sel => {
    let e;
    if (sel.startsWith('tile:')){ const w = sel.slice(5); e = [...document.querySelectorAll('#bank .tile')].find(x => x.textContent.trim() === w); }
    else e = document.querySelector(sel);
    if (!e) return { missing:true };
    const b = e.getBoundingClientRect(); if (!b.width || !b.height) return { hidden:true };
    const inside = b.top >= -0.5 && b.left >= -0.5 && b.bottom <= innerHeight + 0.5 && b.right <= innerWidth + 0.5;
    let clip = null, scroller = null;
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement){
      const cs = getComputedStyle(a); if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const c = a.getBoundingClientRect();
      if (b.top < c.top - 1 || b.bottom > c.bottom + 1 || b.left < c.left - 1 || b.right > c.right + 1){
        clip = clip || (a.id || a.className);
        if (!scroller && /auto|scroll/.test(cs.overflowY) && a.scrollHeight > a.clientHeight) scroller = { x:c.left + c.width / 2, y:c.top + Math.min(c.height / 2, 40), dir:b.top < c.top ? -1 : 1 };
      }
    }
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return { ok:inside && !clip && !!hit && (hit === e || e.contains(hit)), inside, clip, hit:hit ? (hit.id || hit.className || hit.tagName) : null, scroller };
  }, sel);
  const layout = async (label, controls) => {
    const bad = [];
    for (const c of controls){
      let r = await probe(c.sel), wheels = 0;
      while (!r.ok && c.reach && r.scroller && wheels < 12){ await p.mouse.move(r.scroller.x, r.scroller.y); await p.mouse.wheel(0, 90 * r.scroller.dir); await p.waitForTimeout(120); wheels++; r = await probe(c.sel); }
      if (!r.ok) bad.push(`${c.sel} ${JSON.stringify(r)}`); else if (wheels) console.log(`   ${label}: ${c.sel} reached with ${wheels} wheel step(s)`);
    }
    const still = await p.evaluate(() => (document.scrollingElement.scrollTop || 0) + document.querySelector('#stage').scrollTop + document.querySelector('#dialog').scrollTop === 0);
    if (bad.length || !still) console.log('     ✗ ' + (still ? '' : 'page/stage/dialog scrolled; ') + bad.join(' | '));
    t.check(`layout @1280x720: ${label}, every control on screen and clickable`, !bad.length && still);
  };

  /* ---------- the start: Chiara (tu) ---------- */
  await t.jump(12);
  let d = await dbg();
  t.check('Lezione 12 starts in the piazza (l12-start, the afternoon, the clock at 14:00 in the header)', d.lesson === 12 && d.tut === 'l12-start' && d.scene === 'piazza' && d.quests.daytime === 'afternoon' && d.quests.clock === '14:00'
    && await p.isVisible('#gameClock'));
  t.check('objective: ask Chiara the way to the station', await objective('Ask Chiara the way to the station'));
  await talk(200, 470);
  await say(['Ciao']);
  await say(['Sto bene, grazie', 'Scusa', "Dov'è", 'la stazione']);
  t.check("Chiara gives the way to the station (Vai dritto fino alla banca…)", await has('Vai dritto fino alla banca.') && await has('In fondo alla strada gira a sinistra.'));
  t.check('l12-route', (await dbg()).tut === 'l12-route');
  await say(['Grazie mille']);
  await leave();

  /* ---------- the route: one wrong turn (Paolo's way to the museum), then right ---------- */
  await press('m');
  const node = async n => { await p.click(`[data-node="${n}"]`); await p.waitForTimeout(120); };
  await node('2,3'); await node('1,3'); await node('1,4');
  await p.click('#mCheck'); await p.waitForTimeout(200);
  const wrongMsg = await p.textContent('.mapstatus');
  t.check('a wrong turn: "That was Paolo\'s way to the museum… vai sempre dritto"', /Paolo's way to the museum/.test(wrongMsg));
  await p.click('#mUndo'); await node('0,3'); await node('0,4');
  await p.click('#mCheck'); await p.waitForTimeout(300);
  t.check('the right route: Perfetto!', /Perfetto/.test(await p.textContent('.mapstatus')));
  await p.click('[data-go="stazione"]');
  await until(async () => (await dbg()).scene === 'stazione', 'the station'); await p.waitForTimeout(2200);
  d = await dbg();
  t.check('the station: l12-barrier, 14:30, the Venice train on binario 3, the board says 14:35 Venezia S. Lucia 3', d.tut === 'l12-barrier' && d.quests.clock === '14:30' && d.stazione.train.on && d.stazione.board[0].startsWith('14:35 Venezia S. Lucia 3'));
  await t.shot('l12-01-station-day');
  /* the board, close up */
  await p.evaluate(() => __debug.place(450, 384)); await p.waitForTimeout(200);
  await press('e');
  t.check('E at the board opens Partenze', (await dbg()).stazione.open && /Partenze/.test(await p.textContent('.sheet')));
  await t.shot('l12-02-board');
  await press('Escape');

  /* ---------- the barrier: the clerk ---------- */
  await talk(107, 394);
  await say(['Vorrei', 'un biglietto', 'per favore']);
  t.check('the barrier: a fast listening line, then the handbook', await p.isVisible('#choices') && (await dbg()).tut === 'l12-handbook');
  await p.click('#choices button.primary'); await p.waitForTimeout(500);
  d = await dbg();
  t.check('the handbook opens at Lezione 12', d.handbook.open && d.handbook.lesson === 12);
  const voc = await p.evaluate(() => __dbg().words.total);
  const wc = await t.wordCheck({ wrong:true });
  t.check(`word check: ${voc} words (≤ 50), one missed on purpose came back`, voc <= 50 && voc >= 30 && wc.cameBack && wc.phase === 'passed' || wc.phase === 'done');
  await t.practice([['o', 1], ['o', 1], ['o', 0], ['t', ['A che ora', 'parte', 'il prossimo treno']], ['o', 0], ['o', 0], ['o', 1], ['o', 0], ['o', 1], ['o', 1], ['o', 0], ['o', 1]]);
  t.check('practice done: l12-ticket', (await dbg()).tut === 'l12-ticket');
  await press('Escape');

  /* ---------- the ticket: the train pulls out ---------- */
  await talk(107, 394);
  await say(['Vorrei', 'un biglietto', 'per Venezia', 'per favore']);
  t.check('rude: no greeting → Buongiorno, eh!', await has('Buongiorno, eh!'));
  await say(['Buongiorno']);
  await say(['un biglietto', 'per Venezia', 'per favore']);
  t.check('"Il treno parte adesso! Binario tre!"', await has('Il treno parte adesso!'));
  await until(async () => (await dbg()).cut.id === 'l12-train', 'the train cutscene', 12000);
  await until(async () => (await dbg()).stazione.train.departing, 'the departure', 12000);
  await p.waitForTimeout(2400);
  await t.shot('l12-03-train-leaving');
  await until(async () => (await dbg()).cut.on === false, 'the cutscene to end', 40000);
  await until(async () => await p.isVisible('#dialog'), 'the clerk again', 8000); await settle();
  await t.dump();
  t.check('the train has gone; back at the window: "È appena partito… stasera, alle ventitré e quindici"', (await l12()).trainGone && await has('È appena partito') && !(await dbg()).stazione.train.on);
  await say(['un biglietto', 'per domani']);
  t.check('per domani: the first train is at six tomorrow', await has('Il primo treno parte domani mattina'));
  await say(['Allora…', 'per stasera']);
  t.check('per stasera → Andata o andata e ritorno?', (await l12()).when === 'tonight' && await has('Andata o andata e ritorno?'));
  await say(['A che ora parte?', 'Da che binario parte?']);
  t.check('questions answered: alle ventitré e quindici, dal binario tre', await has('Dal binario tre.'));
  await say(['andata']);
  await until(async () => (await dbg()).pad.open, 'the notepad', 8000);
  await p.fill('#npadInput', '21'); await p.press('#npadInput', 'Enter'); await p.waitForTimeout(300); await settle(); await t.dump();
  t.check('a wrong price: Hmm… is that what he said?', await has('You write € 21'));
  await layout('the clerk after a wrong price (hint, tiles)', [{ sel:'#sentence' }, { sel:'#btnSay' }, { sel:'#btnClear' }, { sel:'#hint' }, { sel:'tile:Scusi', reach:true }, { sel:'tile:Può ripetere?', reach:true }]);
  await say(['Scusi', 'Può ripetere?']);
  await until(async () => (await dbg()).pad.open, 'the notepad again', 8000); await settle();
  await layout('the clerk\'s price in the notepad', [{ sel:'#npadInput' }, { sel:'#npadOK' }]);
  await p.fill('#npadInput', '12'); await p.press('#npadInput', 'Enter'); await p.waitForTimeout(300); await settle(); await t.dump();
  t.check('the price noted: € 12', (await l12()).noted && (await l12()).price === 12);
  await t.shot('l12-04-ticket-dialog');
  await layout('paying the clerk (the numbers to 24)', [{ sel:'#btnSay' }, { sel:'tile:Ecco', reach:true }, { sel:'tile:venti', reach:true }, { sel:'tile:euro', reach:true }]);
  await say(['Ecco', 'venti', 'euro']);
  d = await dbg();
  t.check('paid with twenty: the change (otto euro), the ticket in the bag, the bag in the header', d.l12.ticket && await has('Ecco il resto: otto euro.') && d.quests.bag.some(b => b.id === 'biglietto') && await p.isVisible('#btnBag'));
  await bye();

  /* ---------- the town opens ---------- */
  await until(async () => (await dbg()).cut.id === 'l12-explore', 'the explore cutscene', 8000);
  await until(async () => await p.isVisible('.mapsvg'), 'the map', 8000);
  d = await dbg();
  t.check('l12-explore at 15:00, the map open with "!" spots for both quests', d.tut === 'l12-explore' && d.quests.clock === '15:00' && await p.$('[data-qspot="q:caffe"]') && await p.$('[data-qspot="q:messaggio"]'));
  t.check('the counts: 3 this afternoon (min of 3 and the quests built), objective 0/3', d.l12.need.afternoon === 3 && await objective('Explore the town · 0/3'));
  await t.shot('l12-05-map-spots');
  await press('Escape');
  await until(async () => !(await dbg()).cut.on, 'the cutscene end', 6000);
  await press('p');
  await p.click('[data-ph-tab="tasks"]'); await p.waitForTimeout(200);
  const tasks = await p.textContent('.sheet');
  t.check('the phone: Compiti lists both tasks and the 23:15 train', /Il caffè è finito!/.test(tasks) && /Il messaggio/.test(tasks) && /Il treno delle 23:15/.test(tasks));
  await t.shot('l12-06-task-list');
  await p.click('[data-ph-tab="bag"]'); await p.waitForTimeout(200);
  t.check('the Borsa tab: the ticket', /il biglietto/.test(await p.textContent('.sheet')));
  await press('Escape');

  /* ---------- quest: Il caffè è finito! ---------- */
  await press('m'); await p.click('[data-qspot="q:caffe"] .qs-dot');
  await until(async () => (await dbg()).scene === 'piazza', 'the piazza'); await p.waitForTimeout(2000);
  await talk(845, 144);
  await say(['vorrei', 'un', 'caffè']);
  t.check('Enzo: Il caffè è finito!', await has('il caffè è finito!'));
  await leave();
  await until(async () => (await dbg()).quests.scheda.open, 'the scheda', 6000);
  d = await dbg();
  t.check('the quest started; its scheda opened', d.quests.quests.caffe.state === 'active' && d.quests.scheda.id === 'caffe');
  await t.shot('l12-07-scheda');
  await p.click('[data-sch-tab="words"]'); await p.waitForTimeout(200);
  const sw = await p.evaluate(() => { const w = () => __dbg().quests.scheda.words, click = s => { const b = document.querySelector(s); if (b) b.click(); };
    let g = 0; while (w().phase === 'cards' && g++ < 200) click('[data-vc=next]');
    while (w().phase === 'quiz' && g++ < 400){ const s = w(); if (s.status !== 'answer'){ click('[data-vc=next]'); continue; } click(`[data-vq="${s.cur.answer}"]`); }
    return __dbg().quests.scheda; });
  t.check('the scheda\'s word check passed (vocab.js reused)', sw.words.passed);
  await p.click('[data-sch-tab="practice"]'); await p.waitForTimeout(200);
  for (const k of [1, 1, 1, 1]){ await p.click(`[data-opt="${k}"]`); await p.click('#pxNext'); }
  await p.waitForTimeout(300);
  t.check('the scheda\'s practice done', (await Q()).quests.caffe.practice);
  await press('Escape');
  await travel('aurora');
  await talk(506, 364);
  await say(['Buongiorno']);
  await say(['Ci può prestare…?', 'un pacco']);
  t.check('Davide: per chi?', await has('ma per chi?'));
  await say(['Enzo', 'ha bisogno di', 'caffè']);
  t.check('Davide lends a packet; the coffee is in the bag', await has('Per Enzo, con piacere!') || (await Q()).bag.some(b => b.id === 'caffe'));
  if (!(await Q()).bag.some(b => b.id === 'caffe')) await say(['Ci può prestare…?', 'un pacco']);
  t.check('…the bag has il caffè (for Enzo); next step: back to Enzo', (await Q()).bag.some(b => b.id === 'caffe') && (await Q()).quests.caffe.step === 'back');
  await say(['Grazie mille']); await leave();
  await travel('piazza', 790, 198);
  await talk(845, 144);
  t.check('the Nella borsa tiles in the bank', await p.isVisible('#bank .tile >> text="il caffè"'));
  await layout('Enzo with the coffee in the bag (Nella borsa near the top, no scrolling)', [{ sel:'#btnSay' }, { sel:'tile:il caffè' }, { sel:'tile:Ecco' }]);
  await t.shot('l12-08-bag-tiles');
  await say(['Ecco', 'il caffè']);
  d = await dbg();
  t.check('Ecco il caffè! → a free coffee, the quest done, a stamp, 16:30', d.quests.quests.caffe.done && await has('Offro io!') && d.quests.passport.includes('caffe') && d.quests.clock === '16:30' && !d.quests.bag.some(b => b.id === 'caffe'));
  await leave();

  /* ---------- quest: Il messaggio ---------- */
  await travel('sanlorenzo');
  await talk(250, 262);
  t.check('Paolo, late: his message for Chiara', await has('sono in ritardo! Arrivo alle otto.'));
  await leave();
  await until(async () => (await dbg()).quests.scheda.open, 'the scheda', 6000);
  await p.evaluate(() => { const w = () => __dbg().quests.scheda.words, click = s => { const b = document.querySelector(s); if (b) b.click(); };
    document.querySelector('[data-sch-tab="words"]').click();
    let g = 0; while (w().phase === 'cards' && g++ < 200) click('[data-vc=next]');
    while (w().phase === 'quiz' && g++ < 400){ const s = w(); if (s.status !== 'answer'){ click('[data-vc=next]'); continue; } click(`[data-vq="${s.cur.answer}"]`); } });
  await p.click('[data-sch-tab="practice"]'); await p.waitForTimeout(200);
  for (const k of [1, 1, 0, 1]){ await p.click(`[data-opt="${k}"]`); await p.click('#pxNext'); }
  await press('Escape');
  t.check('its scheda done', (await Q()).quests.messaggio.practice);
  await travel('piazza', 260, 470);
  await talk(200, 470);
  await say(['Ciao']);
  await say(['Paolo', 'dice che', 'sono', 'in ritardo']);
  t.check('sono → feedback: you are talking about Paolo (è)', await has('Tu sei in ritardo?'));
  await say(['Paolo', 'dice che', 'è', 'in ritardo']);
  t.check('…in ritardo: Chiara asks when', await has('a che ora arriva?'));
  await say(['arriva', 'alle', 'otto']);
  t.check('Chiara answers: aspetto al bar; the step moves on', (await Q()).quests.messaggio.step === 'back' && await has('aspetto al bar'));
  await say(['Ciao']); await leave();
  await travel('sanlorenzo');
  await talk(250, 262);
  await say(['Chiara', 'dice che', 'aspetta', 'al bar']);
  d = await dbg();
  t.check('Paolo: ha detto che aspetta al bar? Perfetto! The quest done', d.quests.quests.messaggio.done && await has('Perfetto!'));
  await leave();

  t.check('two of three this afternoon: no dusk yet, 18:00', (await dbg()).tut === 'l12-explore' && (await Q()).clock === '18:00' && await objective('Explore the town · 2/3'));

  /* ---------- quest: In farmacia (the shop template) ---------- */
  await press('m'); await p.click('[data-qspot="q:farmacia"] .qs-dot');
  await until(async () => (await dbg()).scene === 'farmacia', 'the pharmacy'); await p.waitForTimeout(2000);
  d = await dbg();
  t.check('the "!" spot → the pharmacy (an interior, lit; the pharmacist behind her counter)', d.shop.id === 'farmacia' && d.night.interior && !!d.npcs.farmacista);
  await t.shot('l12-13-farmacia');
  await talk(827, 330);
  t.check('the pharmacist: the task starts (your list for Venice)', (await Q()).quests.farmacia.state === 'active' && await has('Your list: sun cream'));
  await leave();
  t.check('In farmacia: its scheda done', await scheda('farmacia', [1, 0, 1, 0]));
  await talk(827, 330);
  await say(['Buongiorno']);
  await say(['Scusi', "Dov'è…?", 'la crema solare']);
  t.check('Dov\'è la crema solare? → in fondo, a destra, sopra lo scaffale', await has('È in fondo, a destra, sopra lo scaffale.'));
  await say(["Dov'è…?", 'i cerotti']);
  t.check('dov\'è i cerotti → she answers (sono a sinistra…), feedback: plural, dove sono', await has('Sono a sinistra, sopra lo scaffale.') && /plural/.test(await p.$eval('#hint', h => h.innerText)));
  await say(['Avete…?', 'il dentifricio']);
  t.check('Avete il dentifricio? → sì, certo! in fondo, a sinistra, sotto lo scaffale', await has('Sì, certo! È in fondo, a sinistra, sotto lo scaffale.'));
  await layout('the pharmacist (her tiles, the numbers to 24, the bag)', [{ sel:'#btnSay' }, { sel:'#hint' }, { sel:"tile:Dov'è…?", reach:true }, { sel:'tile:Ecco', reach:true }, { sel:'tile:ventiquattro', reach:true }]);
  await t.shot('l12-14-farmacia-dialog');
  await say(['Arrivederci']); await leave();
  /* the shelves: walk up to each and look (a tap on the shelf), take the thing on the list */
  const shelf = async (x, y, fx, item, shotName) => {
    await t.clickWorld(x, y);
    await until(async () => (await dbg()).shop.open && (await dbg()).shop.fixture === fx, 'the shelf ' + fx, 8000);
    if (shotName) await t.shot(shotName);
    await p.click(`[data-fxitem="${item}"]`); await p.waitForTimeout(300);
    const msg = (await dbg()).shop.msg;
    await press('Escape');
    return msg;
  };
  let msg = await shelf(670, 124, 'fondo-dx', 'doposole');
  t.check('a wrong thing: not on your list, put back', /isn't on your list/.test(msg) && !(await Q()).bag.some(b => b.id === 'doposole'));
  msg = await shelf(670, 124, 'fondo-dx', 'crema', 'l12-15-farmacia-shelf');
  t.check('the shelf at the back on the right: la crema solare, on top → in the bag', /crema solare/i.test(msg) && (await Q()).bag.some(b => b.id === 'crema'));
  await shelf(23, 320, 'sx', 'cerotti');
  msg = await shelf(270, 124, 'fondo-sx', 'dentifricio');
  t.check('all three found: the step is pay', /everything on your list/.test(msg) && (await Q()).quests.farmacia.step === 'pay');
  await talk(827, 330);
  t.check('back at the counter: Allora, ha trovato tutto?', await has('ha trovato tutto?'));
  await say(["Quant'è?"]);
  await until(async () => (await dbg()).pad.open, 'the notepad', 8000); await settle();
  await layout('the pharmacist\'s total in the notepad', [{ sel:'#npadInput' }, { sel:'#npadOK' }]);
  await p.fill('#npadInput', '14'); await p.press('#npadInput', 'Enter'); await p.waitForTimeout(300); await settle(); await t.dump();
  await say(['Ecco', 'venti', 'euro']);
  d = await dbg();
  t.check('paid € 20 for € 14: the change (sei euro), the quest done, its things gone from the bag', d.quests.quests.farmacia.done && await has('Ecco il resto: sei euro.') && !d.quests.bag.some(b => b.id === 'crema'));
  await leave();

  /* ---------- the dusk ---------- */
  await until(async () => (await dbg()).cut.id === 'l12-dusk', 'the dusk cutscene', 15000);
  await until(async () => (await dbg()).night.fading, 'the light fading', 15000);
  await p.waitForTimeout(1800);
  await t.shot('l12-09-dusk');
  await until(async () => (await dbg()).tut === 'l12-night', 'the night', 30000);
  d = await dbg();
  t.check('the dusk: the bells rang, Giulia called out, night at 20:00', d.night.bells.total >= 3 && d.crowd.said.some(s => s[0] === 'giulia' && /ristoranti/.test(s[1])) && d.quests.daytime === 'night' && d.night.amount === 1);
  t.check('Bar Centrale shut: Enzo gone, the shutter down', d.night.barClosed && !d.npcs.enzo);
  await t.shot('l12-10-piazza-night');
  await p.evaluate(() => __debug.place(800, 236)); await p.waitForTimeout(400);
  await t.shot('l12-10b-bar-shut');
  t.check('night: 2 tasks tonight, objective 0/2; the gelateria and the music are open now', (await dbg()).l12.need.night === 2 && await objective('The town by night · 0/2')
    && (await Q()).quests.gelateria.state === 'open' && (await Q()).quests.musica.state === 'open');
  t.check('the piazza at night: the buskers and two strangers listening', !!d.npcs.chitarrista && !!d.npcs.cantante && !!d.npcs.marta && !!d.npcs.luca);

  /* ---------- quest: La gelateria (the shop template again) ---------- */
  await press('m');
  t.check('the map: a "!" at the gelateria (open now)', !!(await p.$('.qspot:not(.closed)[data-qspot="q:gelateria"]')));
  await p.click('[data-qspot="q:gelateria"] .qs-dot');
  await until(async () => (await dbg()).scene === 'gelateria', 'the gelateria'); await p.waitForTimeout(2000);
  await t.shot('l12-16-gelateria-night');
  await talk(480, 201);
  t.check('the gelataio: Cono o coppetta? (the task starts)', await has('Cono o coppetta?') && (await Q()).quests.gelateria.state === 'active');
  await leave();
  t.check('La gelateria: its scheda done', await scheda('gelateria', [1, 1, 1, 1]));
  await t.clickWorld(330, 214);
  await until(async () => (await dbg()).shop.open, 'the display case', 8000);
  t.check('the display case close up: the flavours', (await dbg()).shop.items.includes('pistacchio') && (await dbg()).shop.items.length === 7);
  await t.shot('l12-17-gelateria-case');
  await press('Escape');
  await talk(480, 201);
  await say(['Buonasera']);
  await say(['una coppetta', 'per favore']);
  t.check('una coppetta → Che gusti?', await has('Che gusti?'));
  await say(['pistacchio']);
  t.check('one flavour → e poi? Sono due gusti!', await has('Sono due gusti!'));
  await say(['fragola']);
  t.check('two → Con la panna?', await has('Con la panna?'));
  await layout('the gelataio (flavours, paying)', [{ sel:'#btnSay' }, { sel:'tile:con la panna', reach:true }, { sel:'tile:quattro', reach:true }]);
  await say(['Sì']);
  t.check('sì (con la panna) → Ecco il Suo gelato! Sono quattro euro.', await has('Sono quattro euro.') && (await Q()).quests.gelateria.step === 'pay');
  await say(['Ecco', 'cinque', 'euro']);
  d = await dbg();
  t.check('paid: the change, the quest done, 21:30', d.quests.quests.gelateria.done && await has('Ecco il resto: un euro.') && d.quests.clock === '21:30');
  await leave();

  /* ---------- quest: Musica in piazza ---------- */
  await press('m'); await p.click('[data-qspot="q:musica"] .qs-dot');
  await until(async () => (await dbg()).scene === 'piazza', 'the piazza'); await p.waitForTimeout(2000);
  await t.shot('l12-18-buskers');
  await talk(742, 446);
  t.check('Marta: Buonasera! (the task starts)', (await Q()).quests.musica.state === 'active');
  await leave();
  t.check('Musica in piazza: its scheda done', await scheda('musica', [1, 0, 0, 1]));
  await talk(742, 446);
  await say(['Le va di ballare?']);
  t.check('invited before the introductions: Ma… non La conosco!', await has('non La conosco!'));
  await say(['Buonasera', 'Mi chiamo Sam', 'E Lei?']);
  t.check('introductions: Piacere, Sam! Mi chiamo Marta.', await has('Mi chiamo Marta.'));
  await say(['Le piace questa musica?']);
  await say(['Sì, mi piace!']);
  await say(['Vuole ballare?']);
  t.check('the first says no, and why: … non mi piace ballare la musica lenta. Preferisco la musica veloce!', await has('non mi piace ballare la musica lenta.') && await has('Preferisco la musica veloce!'));
  await say(['Arrivederci']);
  t.check('a polite goodbye from a stranger (Arrivederci! Buona serata!)', await has('Arrivederci! Buona serata!'));
  await leave();
  await until(async () => (await dbg()).cut.id === 'm12-faster', 'the faster music', 8000);
  await until(async () => !(await dbg()).cut.on, 'the faster music to start', 15000);
  t.check('the buskers switch to fast music; the step: ask the other one', (await Q()).quests.musica.step === 'second' && (await dbg()).crowd.said.some(x => x[0] === 'cantante' && /veloce/.test(x[1])));
  await talk(700, 300);
  await say(['Buonasera', 'Mi chiamo Sam', 'E Lei?']);
  await say(['Le piace questa musica?']);
  await say(['Le va di ballare?']);
  t.check('Luca: Sì, volentieri!', await has('Sì, volentieri!'));
  await leave();
  await until(async () => (await dbg()).cut.id === 'm12-dance', 'the dance', 8000);
  await p.waitForTimeout(5000);
  await t.shot('l12-19-dance');
  await until(async () => !(await dbg()).cut.on, 'the dance to end', 40000);
  t.check('the dance round the fountain: the quest done', (await Q()).quests.musica.done);

  await until(async () => (await dbg()).tut === 'l12-late', '23:00', 20000);
  await until(async () => !(await dbg()).cut.on, 'the bells', 20000);
  d = await dbg();
  t.check('23:00: the bells tolled eleven, the station spot on the map', d.quests.clock === '23:00' && d.night.bells.total >= 14 && d.quests.spots.some(s => s.id === 'l12:treno'));

  /* ---------- the station at night ---------- */
  await press('m'); await p.click('[data-qspot="l12:treno"] .qs-dot');
  await until(async () => (await dbg()).scene === 'stazione', 'the station'); await p.waitForTimeout(2000);
  d = await dbg();
  t.check('the night station: the board shows 23:15 Venezia S. Lucia 3, the night train, the conductor', d.stazione.board.some(r => r.startsWith('23:15 Venezia S. Lucia 3')) && d.stazione.train.kind === 'night' && !!d.npcs.capotreno && !d.npcs.bigliettaio);
  await t.shot('l12-11-station-night');
  t.check('the header (objective, clock, bag) stays on one row at 1280', await p.evaluate(() => document.querySelector('#bar').getBoundingClientRect().height < 60));
  await talk(630, 150);
  await layout('the conductor (the ticket in Nella borsa)', [{ sel:'#btnSay' }, { sel:'tile:il biglietto' }]);
  await say(['Ecco', 'il biglietto']);
  t.check('the conductor: not validated!', await has('non è convalidato'));
  await bye(['Grazie mille']);
  await p.evaluate(() => __debug.place(652, 318)); await p.waitForTimeout(200);
  await press('e'); await p.waitForTimeout(300);
  t.check('the green machine stamps the ticket', (await l12()).validated);
  await press('Escape');
  await talk(630, 150);
  await say(['Ecco', 'il biglietto']);
  t.check('the conductor: carrozza cinque, buon viaggio', (await l12()).checked && await has('carrozza cinque'));
  await say(['Grazie mille']); await leave();
  await p.evaluate(() => __debug.place(596, 244)); await p.waitForTimeout(200);
  await press('e');
  await until(async () => (await dbg()).tut === 'l12-done', 'boarding', 15000);
  await until(async () => await p.isVisible('.passport.big'), 'the completion screen', 8000);
  const done = await p.textContent('.sheet');
  t.check('completion: Lezione 12 completata, the passport (5 tasks + ticket + train), the ticket', done.includes('Lezione 12 completata!') && (await p.$$('.passport.big .pp-slot.on')).length === 7 && done.includes('Padova → Venezia'));
  await t.shot('l12-12-complete');
  await p.click('#l12Keep'); await p.waitForTimeout(2600);
  d = await dbg();
  t.check('free play: the next afternoon, the quests open any time, no clock in the header', d.quests.daytime === 'afternoon' && d.quests.free && !d.quests.clock && !(await p.isVisible('#gameClock')));

  /* ---------- the vocabulary and the verbs ---------- */
  const vv = await p.evaluate(() => ({ audit:__vocabAudit(), lint:__vocabLint(), g:['partire', 'arrivare'].map(inf => __grammarVerbs().find(v => v.inf === inf)) }));
  t.check('vocab audit and lint: Lesson 12 and the quests', vv.audit[12].length === 0 && vv.lint[12].length === 0 && ['caffe', 'messaggio', 'farmacia', 'gelateria', 'musica', 'mamma'].every(q => vv.audit['q:' + q].length === 0));
  t.check('verbs: partire (parte, partono), arrivare (arriva)', vv.g[0] && vv.g[0].forms.some(f => f.it === 'parte') && vv.g[0].forms.some(f => f.it === 'partono') && vv.g[1] && vv.g[1].forms.some(f => f.it === 'arriva'));

  /* ---------- no hint gave the answer ---------- */
  const norm = x => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const forbidden = ["scusa dov'e la stazione", 'un biglietto per venezia', 'per stasera', 'ecco dodici euro', 'ecco venti euro', 'paolo dice che e in ritardo', 'arriva alle otto',
    'chiara dice che aspetta al bar', 'enzo ha bisogno di caffe', 'ci puo prestare un pacco', 'ecco il caffe', 'ecco il biglietto',
    "dov'e la crema solare", 'dove sono i cerotti', 'avete il dentifricio', 'mi fa male la testa', 'ecco quattordici euro', 'una coppetta per favore', 'un cono per favore',
    'pistacchio e fragola', 'si con la panna', 'le piace questa musica', 'le va di ballare', 'vuole ballare', 'mi chiamo sam e lei'].map(norm);
  const shown = await p.evaluate(() => window.__hintLog);
  const leaks = shown.filter(h => forbidden.some(m => norm(h).includes(m)));
  console.log(`   ${shown.length} hints shown; leaks: ${leaks.join(' | ') || 'none'}`);
  t.check('no hint contains the Italian answer', shown.length > 10 && leaks.length === 0);
}, { fakeSpeech:true, viewport:{ width:1280, height:720 } });
