/* Lesson 10 · A che ora?, played from the skip link to the completion screen (docs/lessons/10-a-che-ora.md, test plan).
   Speech is faked (harness fakeSpeech) so listening lines and Bruno's lines run at a known pace.
   Paolo's directions (tu), the map (one wrong turn first), the museum square: the crowd inert before Bruno, Bruno's
   permesso lesson and his demonstration on the teacher, one Scusi (hint) and one Prego (hint), then Permesso through the
   crowd; the booth barrier (a fast listening line → the handbook), the word check with one wrong answer, the practice;
   the ticket: no greeting first, "Sono le quattro" (telling her the time), alle tre e mezza (pieno), alle quattro → the
   price in the notepad (one wrong number, Può ripetere?), Ecco venti euro → the change in the notepad; Vedo, vedo: one
   deliberate miss, the three "Che ore sono?" (one wrong with feedback, one 24-hour), the tower clock in step, the bonus
   round once; Andiamo!, the museum doors → the completion screen. No hint contains the Italian to say. A phone-size
   screenshot of the ticket booth at the end. */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const hint = () => p.$eval('#hint', h => h.hidden ? '' : h.innerText.replace(/\s+/g, ' '));
  const guide = () => p.$eval('#guideText', g => g.innerText.replace(/\s+/g, ' '));
  const objective = async want => { const o = await t.objective(); return want === undefined ? o : o === want; };
  const has = async s => (await t.lines()).some(l => l.includes(s));
  const settle = async (quiet = 1000, max = 25000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#npad') ? 5000 : 0)
        + (document.querySelector('#choices').hidden ? 0 : 20000), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const say = async labels => { for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const talkTo = async (x, y) => { await t.talkTo(x, y); await settle(); await t.dump(); };
  const write = async n => { await p.fill('#npadInput', String(n)); await p.press('#npadInput', 'Enter'); await p.waitForTimeout(300); await settle(); await t.dump(); };
  const node = async (c, r) => { await p.click(`[data-node="${c},${r}"]`); await p.waitForTimeout(120); };
  const crowd = async () => (await dbg()).crowd;
  const pickOpen = () => until(async () => !!(await crowd()).pick, 'the pick', 4000);
  const crowdHints = [];

  /* ---------- the piazza: Paolo ---------- */
  await t.jump(10);
  await p.evaluate(() => { window.__hintLog = []; });
  let d = await dbg();
  console.log('   start:', JSON.stringify({ scene:d.scene, tut:d.tut, marco:d.npcs.marco, l10:!!d.l10 }));
  t.check('L10 label', (await p.textContent('#lessonLabel')).includes('Lezione 10 · A che ora?'));
  t.check('L10 objective: ask Paolo the way', await objective('Ask Paolo the way to the museum'));
  t.check('in the piazza; Bruno is not here, Mark has gone', d.scene === 'piazza' && !d.npcs.bruno && !d.npcs.mark && !!d.npcs.marco);
  t.check('guide: the museum, ask someone the way (no Italian given)', /Museo d'Arte/.test(await guide()) && !/dov'è/i.test(await guide()));

  console.log('PAOLO'); await talkTo(...d.npcs.marco);
  console.log('   bank:', (await p.$$eval('#bank .bank-label', ls => ls.map(l => l.textContent))).join(', '));
  t.check('the museum is a place tile', !!(await p.$('#bank .tile >> text="il museo"')));
  await say(['Scusa', "Dov'è", 'il museo']);
  let L = await t.lines();
  t.check('formatted: Scusa, dov\'è il museo?', L.some(l => l.includes("Scusa, dov'è il museo?")));
  t.check('Paolo: near the station, the four lines (tu)', L.some(l => l.includes('vicino alla stazione')) && L.some(l => l.includes('Vai dritto fino alla banca.'))
    && L.some(l => l.includes('Alla banca gira a sinistra.')) && L.some(l => l.includes('gira ancora a sinistra')));
  t.check('→ trace the route', await objective('Trace the route to the museum'));
  await say(['a sinistra?']);
  t.check('Paolo confirms: left, then left again', await has('E poi ancora a sinistra'));
  await say(['È lontano?']);
  t.check('Paolo: not far', await has('Dieci minuti a piedi'));
  await t.shot('l10-01-paolo');
  await say(['Grazie mille']);
  t.check('Paolo: buona visita', await has('Buona visita'));
  await t.leave();

  /* ---------- the map ---------- */
  await p.keyboard.press('m'); await p.waitForSelector('.mapsvg'); await p.waitForTimeout(300);
  t.check('map: Paolo\'s directions beside it, the Museo landmark', (await p.textContent('.notes')).includes('gira ancora a sinistra') && (await p.textContent('.mapsvg')).includes('Museo'));
  t.check('map: no museum button while tracing', !(await p.$('[data-go="museo"]')));
  await node(2, 3); await node(3, 3); await p.click('#mCheck');
  const bad = await p.textContent('.mapstatus'); console.log('   map check 1:', bad);
  t.check('map: wrong turn → which way is sinistra', bad.includes('sinistra'));
  await p.click('#mClear');
  for (const [c, r] of [[2, 3], [1, 3], [1, 4]]) await node(c, r);
  await p.click('#mCheck');
  const good = await p.textContent('.mapstatus'); console.log('   map check 2:', good);
  t.check('map: route ok, the Museo d\'Arte unlocked', good.includes('Perfetto') && good.includes('Paolo') && await p.isVisible('[data-go="museo"]'));
  await t.shot('l10-02-map');
  await p.click('[data-go="museo"]'); await p.waitForTimeout(2800);

  /* ---------- the museum square: Bruno, the crowd ---------- */
  d = await dbg();
  console.log('   square:', JSON.stringify({ scene:d.scene, tut:d.tut, me:d.me, bruno:d.npcs.bruno, cassiera:d.npcs.cassiera }));
  t.check('the museum square; Bruno on the bench', d.scene === 'museo' && d.tut === 'l10-crowd' && d.npcs.bruno && d.npcs.bruno.join() === '198,446');
  t.check('→ talk to Bruno', await objective('Talk to Bruno'));
  t.check('Bruno waves: your name over his head', await until(async () => (await crowd()).said.some(b => b[0] === 'bruno'), 'Bruno to wave', 5000));
  t.check('the clock tower says 15:00', d.clock.text === '15:00');
  /* the crowd is just in the way until Bruno has taught you the word */
  await p.evaluate(() => __debug.place(618, 340)); await p.waitForTimeout(300);
  await p.keyboard.press('e'); await p.waitForTimeout(500);
  let c = await crowd();
  t.check('before Bruno: no pick, "nobody turns round", Bruno is waving', !c.active && !c.pick && c.hint && c.hint.kind === 'inactive' && /Bruno/.test(c.hint.html));
  crowdHints.push(c.hint.html);

  console.log('BRUNO'); await talkTo(...d.npcs.bruno);
  L = await t.lines();
  t.check('Bruno (English): you\'ll never get through; permesso = may I pass', L.some(l => l.includes("You'll never get through like that")) && L.some(l => /permesso.*may I pass/.test(l)));
  await t.shot('l10-03-bruno-permesso');
  await t.choose(); await settle();
  await t.choose();                                                           // "Watch Bruno": the dialog closes
  t.check('Bruno walks over and says Permesso! to the teacher; she moves', await until(async () => { const x = await crowd(); return x.people.maestra.moved && !x.people.maestra.walking; }, 'the demonstration', 15000));
  c = await crowd(); console.log('   said:', JSON.stringify(c.said.slice(-4)));
  t.check('the demonstration: Bruno says Permesso!, the teacher Prego!', c.said.some(b => b[0] === 'bruno' && b[1] === 'Permesso!') && c.said.some(b => b[0] === 'maestra' && b[1] === 'Prego!'));
  t.check('Bruno is back on the bench', await until(async () => { const x = await dbg(); return x.l10.demo && x.npcs.bruno.join() === '198,446'; }, 'Bruno back', 15000));
  t.check('→ get to the ticket booth; the crowd is on', await objective('Get to the ticket booth') && (await crowd()).active);

  /* Scusi (the hint), Prego (the hint), then Permesso */
  console.log('SCUSI');
  await p.evaluate(() => __debug.place(562, 336)); await p.waitForTimeout(300);
  await p.keyboard.press('e'); await pickOpen();
  t.check('E beside the tourist: the pick', (await crowd()).pick.npc === 'turista1');
  await p.waitForTimeout(350); await t.shot('l10-04-pick');
  await p.keyboard.press('2');
  await until(async () => ((await crowd()).hint || {}).kind === 'scusi', 'the Scusi hint');
  c = await crowd(); crowdHints.push(c.hint.html);
  t.check('Scusi: Sì?, they stay, the hint points to Bruno\'s word', c.said.some(b => b[0] === 'turista1' && b[1] === 'Sì?') && !c.people.turista1.moved && /word Bruno taught you/.test(c.hint.html) && !/permesso/i.test(c.hint.html));
  console.log('PREGO');
  await p.waitForTimeout(1500);
  await p.evaluate(() => __debug.place(674, 334)); await p.waitForTimeout(300);
  await p.keyboard.press('e'); await pickOpen(); await p.keyboard.press('3');
  await until(async () => ((await crowd()).hint || {}).kind === 'prego', 'the Prego hint');
  c = await crowd(); crowdHints.push(c.hint.html);
  t.check('Prego: a puzzled look, the hint', c.said.some(b => b[0] === 'turista3' && b[1] === '?') && /what <i>they<\/i> say back/.test(c.hint.html) && !c.people.turista3.moved);
  console.log('PERMESSO');
  await p.waitForTimeout(1500);
  await p.evaluate(() => __debug.place(618, 340)); await p.waitForTimeout(300);
  await p.keyboard.down('ArrowUp'); await pickOpen(); await p.keyboard.up('ArrowUp');
  t.check('bumping into the middle tourist', (await crowd()).pick.npc === 'turista2');
  await p.keyboard.press('1');
  t.check('Permesso! → Prego! → they step aside', await until(async () => { const x = await crowd(); return x.people.turista2.moved && !x.people.turista2.walking; }, 'turista2 to move'));
  t.check('still the crowd at the window', (await dbg()).tut === 'l10-crowd');
  await p.evaluate(() => __debug.place(630, 300)); await p.waitForTimeout(300);
  await t.clickWorld(628, 250); await pickOpen();
  t.check('tap the person at the window: the pick', (await crowd()).pick.npc === 'turista4');
  await p.click('#crowdPick [data-pick=permesso]');
  t.check('the window is free → buy a ticket', await until(async () => (await dbg()).tut === 'l10-booth', 'l10-booth') && await objective('Buy a ticket'));
  c = await crowd();
  t.check('Permesso counted twice by the lesson', (await dbg()).l10.permesso === 2);

  /* ---------- the booth: the barrier ---------- */
  await p.waitForTimeout(800);
  console.log('BOOTH (barrier)'); await talkTo(628, 200);                   // (from where you are, in the bay)
  t.check('the cashier: Un biglietto? A che ora?', await has('Un biglietto? A che ora?'));
  console.log('   bank:', (await p.$$eval('#bank .bank-label', ls => ls.map(l => l.textContent))).join(', '));
  t.check('barrier bank: no time words', !(await p.$('#bank .tile >> text="alle"')) && !(await p.$('#bank .tile >> text="Sono le"')) && !!(await p.$('#bank .tile >> text="un biglietto"')));
  await say(['Buongiorno']);
  t.check('a greeting: answered, her question is still up (hint without Italian)', /asked you something/.test(await hint()));
  await say(['Vorrei', 'un biglietto', 'tre']);
  t.check('the fast line is a hidden listening line', await p.$$eval('.line.listen:not(.revealed)', ls => ls.length) === 1 && (await p.evaluate(() => (window.__spoken || []).map(s => s[1]))).some(s => s.includes('Il prossimo ingresso è alle quattro')));
  t.check('barrier: not a single time, the sign, the handbook', await has('Prossimo ingresso · 16:00') && await has('Lezione 10 · A che ora?'));
  await t.shot('l10-05-barrier');
  await t.choose();
  await p.waitForTimeout(500);
  t.check('handbook opens at Lezione 10', (await p.textContent('.sheet h2')).includes('A che ora?'));
  t.check('→ learn the words', await objective('Learn the Lesson 10 words'));

  /* ---------- the chapter ---------- */
  const how = await p.$eval('.callout', e => e.innerText);
  t.check('how it works: sono le / è l\'una, alle, 24-hour, vedo/vedi/vede, the clock face and the six pictures', how.includes("è l'una") && how.includes('alle quattro') && how.includes('le sedici')
    && how.includes('vede') && await p.$$eval('.callout svg', s => s.length) >= 7);
  await p.$eval('.callout svg', e => e.scrollIntoView({ block:'center' })); await p.waitForTimeout(200);
  await t.shot('l10-05b-handbook-clock');
  const voc = await p.$$eval('.vocab .vrow', rs => rs.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
  console.log('   Vocabolario:', voc.length, 'words');
  t.check('Vocabolario: time, museum, ancora, the game\'s words', ['A che ora?', "tra un'ora", 'il biglietto', 'È pieno.', 'Permesso!', 'ancora', 'vedo', 'vede', "l'uomo / gli uomini", 'sotto', 'Che ore sono?', 'mezza']
    .every(w => voc.some(v => v.startsWith(w))));
  /* the cap of 50 (CLAUDE.md): Bruno's reactions are glossed in the game, not cards */
  t.check('Vocabolario within the cap of 50: no cards for Bruno\'s reactions (Giusto!, Ritenta!, Tocca a te!)', (await p.evaluate(() => __studyList(10).length)) <= 50 && !['Giusto!', 'Ritenta!', 'Tocca a te!'].some(w => voc.some(v => v.startsWith(w))));
  t.check('practice locked until the words are learned', (await p.textContent('.tabs')).includes('Practice 🔒'));
  const wc = await t.wordCheck({ wrong:true });
  t.check('word check: every word right once, the missed one came back', wc.phase === 'done' && wc.cameBack && wc.items === wc.total + 1);
  t.check('→ practice', await objective('Finish the Lesson 10 practice'));
  await t.practice([['o', 1], ['t', ['sono le', 'cinque', 'meno', 'un quarto']], ['o', 1], ['o', 2], ['o', 1], ['o', 2], ['o', 1]]);
  await p.waitForTimeout(300);
  t.check('practice → buy a ticket for the next entry', await objective('Buy a ticket for the next entry'));
  t.check('ticket guide: the sign says 16:00, no Italian', (await guide()).includes('16:00') && !/alle|per le/.test(await guide()));

  /* ---------- the ticket ---------- */
  console.log('BOOTH (ticket)'); await talkTo(628, 200);
  console.log('   bank:', (await p.$$eval('#bank .bank-label', ls => ls.map(l => l.textContent))).join(', '));
  t.check("ticket bank: L'ora, the numbers to 24", !!(await p.$('#bank .tile >> text="alle"')) && !!(await p.$('#bank .tile >> text="ventiquattro"')) && !!(await p.$('#bank .tile >> text="mezza"')));
  await say(['Vorrei', 'un biglietto']);
  t.check('no greeting: Buongiorno, eh!', await has('Buongiorno, eh!') && /Greet her first/.test(await hint()));
  await say(['Buongiorno']);
  t.check('greeted: her question comes', (await t.lines()).slice(-1)[0].includes('Un biglietto? A che ora?'));
  await say(['Sono le', 'quattro']);
  t.check('"Sono le quattro": telling her the time → Le quattro? No, sono le tre!', await has('Le quattro? No, sono le tre!') && /what time it <i>?is/.test(await p.$eval('#hint', h => h.innerHTML)));
  await say(['Vorrei', 'un biglietto', 'alle', 'tre', 'e', 'mezza', 'per favore']);
  t.check('formatted: Vorrei un biglietto alle tre e mezza, per favore.', await has('Vorrei un biglietto alle tre e mezza, per favore.'));
  t.check('alle tre e mezza → pieno; the next entry', await has('Mi dispiace, alle tre e mezza è pieno.') && await has('Il prossimo ingresso è alle quattro.'));
  await say(['un biglietto', 'per le', 'quattro', 'per favore']);
  t.check('formatted: Un biglietto per le quattro, per favore.', await has('Un biglietto per le quattro, per favore.'));
  t.check('per le quattro → va bene; the price by ear; the notepad', await has('Alle quattro, va bene.') && await until(async () => (await dbg()).pad.open, 'the notepad', 8000));
  d = await dbg();
  t.check('the slot is 16:00', d.l10.slot === 960 && d.pad.label === 'il biglietto');
  await t.shot('l10-06-ticket-price');
  await write(41);
  t.check('a wrong price: ask her again (no Italian)', /say it again/.test(await hint()) && !(await dbg()).pad.open);
  await say(['Può ripetere?']);
  t.check('she says it again, slowly; the notepad', await until(async () => (await dbg()).pad.open, 'the notepad again', 8000));
  await write(14);
  t.check('€ 14 written down → pay', (await dbg()).l10.noted.price === 14 && /twenty-euro note/.test(await hint()));
  await say(['Ecco', 'venti', 'euro']);
  t.check('the change by ear → the notepad', await until(async () => { const x = await dbg(); return x.pad.open && x.pad.label === 'il resto'; }, 'the change pad', 8000));
  await write(6);
  t.check('the ticket: Ingresso alle quattro: tra un\'ora', await has("Ecco il biglietto. Ingresso alle quattro: tra un'ora."));
  await t.shot('l10-07-ticket-bought');
  await say(['Grazie mille', 'Arrivederci']);
  t.check('goodbye', await has('buona visita'));
  await t.leave();
  t.check('→ wait with Bruno', await objective('Wait with Bruno'));
  await p.evaluate(() => __debug.place(628, 262)); await p.waitForTimeout(200);
  await p.evaluate(() => { const T = document.getElementById('toasts'); if (T) T.innerHTML = ''; });
  await p.evaluate(() => __debug.place(400, 194)); await p.waitForTimeout(200);
  await p.keyboard.press('e'); await p.waitForTimeout(400);
  t.check('the doors before the time: your ticket says 16:00', /Your ticket says <b>16:00<\/b>/.test(await p.$$eval('.toast', ts => ts.map(x => x.innerHTML).join(' '))));

  /* ---------- Vedo, vedo ---------- */
  d = await dbg();
  console.log('BRUNO (Vedo, vedo)'); await talkTo(...d.npcs.bruno);
  t.check('Bruno: an hour to kill, Vedo, vedo', await has('An hour to kill') && await has('Vedo, vedo'));
  await t.choose();
  const isp = async () => (await dbg()).ispy;
  t.check('the game opens', await until(async () => { const x = await isp(); return x.open && !!x.line; }, 'the game', 8000));
  let D = await isp();
  t.check('10 finds from 15:00, objective 0/10', D.finds === 10 && D.clock.h === 15 && D.clock.m === 0 && await objective('Play Vedo, vedo · 0/10'));
  await p.waitForTimeout(300); await t.shot('l10-08-ispy');
  const answers = { '15:15':[['sono le', 'n3', 'e', 'mezza'], ['sono le', 'n3', 'e', 'un quarto']], '15:30':[['sono le', 'n15', 'e', 'trenta']], '15:45':[['sono le', 'n4', 'meno', 'un quarto']] };
  let sawRitenta = false, wrongFb = '', timesAsked = [], towerSynced = true, timeShot = false;
  for (let guard = 0; guard < 60; guard++){
    await until(async () => ['find', 'time', 'bonus-offer'].includes((await isp()).phase), 'a round', 30000);
    D = await isp();
    if (D.phase === 'bonus-offer') break;
    if (D.phase === 'time'){
      const at = `${D.time.at.h}:${String(D.time.at.m).padStart(2, '0')}`; timesAsked.push(at);
      await until(async () => (await isp()).line === 'Che ore sono?', 'Che ore sono?');
      if (!timeShot){ timeShot = true; await p.waitForTimeout(300); await t.shot('l10-09-ispy-time'); }
      for (const keys of answers[at] || [['sono le', 'n3']]){
        for (const k of keys) await p.click(`[data-isp-t="${k}"]`);
        await p.click('[data-isp="tsay"]'); await p.waitForTimeout(300);
        const x = await isp();
        console.log(`   ${at} Che ore sono? → ${keys.join(' ')} → ${x.time && x.time.fb ? 'wrong: ' + x.time.fb : 'right'}`);
        if (x.time && x.time.fb){ wrongFb = x.time.fb; await p.click('[data-isp="tclear"]'); }
      }
      await until(async () => (await isp()).phase !== 'time', 'the time question to close');
      continue;
    }
    const k = D.found;
    console.log(`   ${k + 1}. [tier ${D.tier}] ${D.line}`);
    if (k === 0){
      await p.mouse.click(D.missAt.x, D.missAt.y); await p.waitForTimeout(250);
      const x = await isp(); sawRitenta = /Ritenta/.test(x.react) && x.found === 0;
    }
    D = await isp();
    await p.mouse.click(D.target.page.x + 2, D.target.page.y + 2);
    await until(async () => (await isp()).found === k + 1, 'the find to count', 5000);
    await p.waitForTimeout(150);
    const x = await dbg();
    if (x.clock.text !== `${x.ispy.clock.h}:${String(x.ispy.clock.m).padStart(2, '0')}`) { /* (the game may be between steps) */ }
    if (x.l10.found !== k + 1) towerSynced = false;
  }
  D = await isp(); d = await dbg();
  t.check('one deliberate miss → No, sbagliato! Ritenta!', sawRitenta);
  t.check('10 finds → the bonus offer; the objective counted them', D.found === 10 && D.phase === 'bonus-offer' && d.l10.found === 10 && towerSynced);
  t.check('three time questions at 15:15, 15:30, 15:45', timesAsked.join() === '15:15,15:30,15:45');
  console.log('   time answers:', JSON.stringify(d.l10.time.answers.map(a => `${a.asked} ${a.said} ${a.ok ? '✓' : '✗'}`)));
  t.check('time answers: one wrong, the 24-hour form accepted, all right in the end', d.l10.time.wrong === 1 && d.l10.time.right === 3 && d.l10.time.answers.some(a => a.ok && a.said === 'Sono le quindici e trenta.'));
  console.log('   wrong-time feedback: ' + wrongFb);
  t.check('wrong-time feedback is about the player\'s words, without the answer', /mezza is half past/.test(wrongFb) && !/quarto|Sono le tre e/i.test(wrongFb));
  t.check('the tower is in step: 16:00', d.clock.text === '16:00' && d.l10.clock.h === 16);
  t.check('Sono le quattro! Andiamo!', (await p.evaluate(() => (window.__spoken || []).map(s => s[1]))).some(s => s === 'Sono le quattro! Andiamo!'));
  await p.waitForTimeout(300); await t.shot('l10-10-andiamo');
  /* the bonus round, once */
  await p.click('[data-isp="bonus"]');
  await until(async () => (await isp()).phase === 'bonus', 'the bonus round');
  for (const w of ['vedo', 'la', 'fontana']) await p.click(`[data-isp-b="${w}"]`);
  await p.click('[data-isp="bsay"]'); await p.waitForTimeout(400);
  D = await isp();
  t.check('bonus: Bruno finds the fountain', D.bonus && D.bonus.result === 'found' && /Eccola/.test(D.react));
  await p.click('[data-isp="bdone"]'); await p.waitForTimeout(400);
  t.check('the last screen: Andiamo!', (await isp()).phase === 'done' && (await p.textContent('#ispPanel')).includes('Andiamo!'));
  await p.click('[data-isp="close"]');
  t.check('→ show your ticket at the doors', await until(async () => (await dbg()).tut === 'l10-go', 'l10-go', 5000) && await objective('Show your ticket at the museum doors'));
  t.check('Bruno walks to the doors', await until(async () => { const x = await dbg(); return x.l10.brunoAt && x.npcs.bruno.join() === '326,212'; }, 'Bruno at the doors', 12000));
  d = await dbg(); t.check('the result is saved (bonus played)', d.l10.ispyDone && d.l10.result.bonus.played && d.l10.result.finds === 10);

  /* ---------- the doors → completion ---------- */
  await p.evaluate(() => __debug.place(400, 194)); await p.waitForTimeout(200);
  await p.keyboard.press('e');
  t.check('the doors: Ecco il biglietto!, then the completion screen', await until(async () => (await dbg()).tut === 'l10-done' && await p.isVisible('.sheet h2'), 'the completion screen', 10000));
  await p.waitForTimeout(700);
  const done = await p.textContent('.sheet');
  t.check('completion: Lezione 10 completata, the ticket, Paolo\'s way, the numbers', done.includes('Lezione 10 completata!') && done.includes('Ingresso 16:00') && done.includes('Vai dritto fino alla banca.') && done.includes('things found'));
  await t.shot('l10-11-complete');
  await p.click('.sheet .cta [data-close]'); await p.waitForTimeout(300);
  t.check('L10 objective completed', await objective('Lezione 10 completata'));

  /* ---------- afterwards: the dictionary, the grammar drill, Studio ---------- */
  await p.keyboard.press('v'); await p.waitForTimeout(300);
  const dict = await p.textContent('.sheet');
  t.check('dictionary: Lezione 10 and its Vocabolario', dict.includes('Lezione 10') && dict.includes("tra un'ora") && dict.includes('Permesso!'));
  await p.click('.sheet [data-close]');
  const gv = await p.evaluate(() => __grammarVerbs().find(v => v.inf === 'vedere'));
  t.check('grammar drill: vedere (vedo, vedi, vede) from Lesson 10', !!gv && ['vedo', 'vedi', 'vede'].every(f => gv.forms.some(x => x.it === f && x.lesson === 10)));
  t.check('Vedo, vedo is in Studio now', (await dbg()).ispy.unlocked);

  /* ---------- the lexicon: the time phrasings the doc lists (hard mode will type them) ---------- */
  const lex = await p.evaluate(() => {
    const at = (w, kind, abs) => { const r = __l10Read(w); return !!(r.time && r.time.kind === kind && r.time.abs === abs) || `${w} → ${JSON.stringify(r.time || r)}`; };
    return [at('alle quattro', 'at', 960), at('per le quattro', 'at', 960), at('un biglietto per le quattro', 'at', 960), at('le sedici', 'at', 960),
      at('alle sedici e trenta', 'at', 990), at('alle quattro meno un quarto', 'at', 945), at("all'una", 'at', 780), at('alle ventuno', 'at', 1260),
      at('sono le tre e trenta', 'now', 930), at('sono le quattro meno quindici', 'now', 945), at("è l'una e un quarto", 'now', 795), at('sono le tre e mezza', 'now', 930),
      at('quattro', 'bare', 960), __l10Read('alle uno').time.p.err === 'una' || 'alle uno', __l10Read('ecco venti euro').pay === 20 || 'ecco venti euro',
      __l10Read('venti euro').pay === 20 || 'venti euro', !__l10Read('mi scusi').fail || 'mi scusi', !__l10Read('grazie mille arrivederci').fail || 'grazie mille',
      __l10Read('che ore sono').askTime || 'che ore sono', __l10Read('a che ora').askWhen || 'a che ora'];
  });
  const lexBad = lex.filter(x => x !== true);
  if (lexBad.length) console.log('   lexicon problems: ' + lexBad.join(' | '));
  t.check('lexicon: alle / per le / le sedici, e trenta, meno quindici, all\'una, mi scusi, grazie mille, money', lexBad.length === 0);

  /* ---------- no hint gave the answer ---------- */
  const norm = x => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const forbidden = ["Scusa, dov'è il museo?", "dov'e il museo", 'alle quattro', 'per le quattro', 'le sedici', 'Sono le tre e un quarto', 'Sono le tre e mezza', 'Sono le quattro meno un quarto',
    'Sono le quindici', 'permesso', 'Ecco venti euro', 'Grazie, arrivederci', 'Può ripetere'].map(norm);
  const shown = (await p.evaluate(() => window.__hintLog)).concat(crowdHints, [wrongFb]);
  const leaks = shown.filter(h => forbidden.some(m => norm(h).includes(m)));
  console.log(`   ${shown.length} hints shown; leaks: ${leaks.join(' | ') || 'none'}`);
  t.check('no hint contains the Italian to say', shown.length > 10 && leaks.length === 0);

  /* ---------- a phone: the ticket booth ---------- */
  const m = await p.context().browser().newPage({ viewport:{ width:390, height:844 } });
  m.on('pageerror', e => { console.log('pageerror (phone): ' + e.message); });
  await m.goto(p.url());
  await m.fill('#nameInput', 'Sam'); await m.click('[data-jump="10"]'); await m.waitForTimeout(2600);
  await m.evaluate(() => {
    document.getElementById('toasts').innerHTML = '';
    const l10 = Object.assign(__dbg().l10, { routeOK:true, taught:true, demo:true, barrier:true });
    __debug.set({ l10, vocab10:true, practiceDone10:true, vocabCheck10:true, tut:'l10-ticket', crowd:{ maestra:{ x:536, y:404 }, turista2:{ x:770, y:346 }, turista4:{ x:572, y:242 } } });
    __debug.travel('museo', { x:628, y:262 });
  });
  await m.waitForTimeout(2600);
  const r = await m.$eval('#cv', c => { const b = c.getBoundingClientRect(); return { l:b.left, t:b.top, w:b.width, h:b.height }; });
  await m.mouse.click(r.l + 628 / 960 * r.w, r.t + 200 / 600 * r.h);
  await m.waitForSelector('#dialog:not([hidden])', { timeout:12000 }); await m.waitForTimeout(1500);
  for (const w of ['Buongiorno']) await m.click(`#bank .tile >> text="${w}"`);
  await m.click('#btnSay'); await m.waitForTimeout(3500);
  for (const w of ['alle', 'cinque', 'per favore']) await m.click(`#bank .tile >> text="${w}"`);
  await m.click('#btnSay');
  let padM = false; for (let i = 0; i < 60 && !padM; i++){ await m.waitForTimeout(200); padM = (await m.evaluate(() => __dbg().pad.open)); }
  t.check('phone: alle cinque is a later slot (17:00), the notepad', padM && (await m.evaluate(() => __dbg().l10.slot)) === 1020);
  await m.waitForTimeout(400);
  await m.screenshot({ path:require('path').join(require('./lib/harness').SHOTS, 'l10-12-phone-ticket.png') });
  /* a later slot: Bruno says it is a long wait; the same 10 finds, the clock moves 12 minutes a find */
  await m.click('#dlgClose'); await m.waitForTimeout(300);
  await m.evaluate(() => { const l10 = Object.assign(__dbg().l10, { noted:{ price:14, change:6 }, given:20, paid:true, ticket:true }); __debug.set({ l10, tut:'l10-wait' }); __debug.place(230, 446); });
  await m.waitForTimeout(300);
  await m.mouse.click(r.l + 198 / 960 * r.w, r.t + 446 / 600 * r.h);
  await m.waitForSelector('#dialog:not([hidden])', { timeout:12000 }); await m.waitForTimeout(1500);
  const bl = await m.$$eval('.line', ls => ls.map(l => l.innerText).join(' | '));
  t.check('phone: two hours to kill, a long wait', /Two hours to kill! That's a long wait/.test(bl));
  await m.click('#choices button.primary');
  let MD = null; for (let i = 0; i < 40; i++){ await m.waitForTimeout(200); MD = (await m.evaluate(() => __dbg().ispy)); if (MD.open && MD.phase === 'find' && MD.target) break; }
  await m.mouse.click(MD.target.page.x, MD.target.page.y);
  for (let i = 0; i < 40; i++){ await m.waitForTimeout(200); if ((await m.evaluate(() => __dbg().l10.clock)).m === 12) break; }
  const ck = await m.evaluate(() => ({ l10:__dbg().l10.clock, tower:__dbg().clock.text, finds:__dbg().ispy.finds }));
  console.log('   phone, slot 17:00, after one find:', JSON.stringify(ck));
  t.check('phone: 10 finds, 12 minutes a find, the tower in step (15:12)', ck.finds === 10 && ck.l10.h === 15 && ck.l10.m === 12 && ck.tower === '15:12');
  await m.waitForTimeout(500);
  await m.screenshot({ path:require('path').join(require('./lib/harness').SHOTS, 'l10-13-phone-ispy.png') });
  await m.close();

  /* ---------- Lesson 9's end leads here: the guide's Start Lezione 10 button ---------- */
  const q = await p.context().browser().newPage({ viewport:{ width:1280, height:800 } });
  q.on('pageerror', e => { console.log('pageerror (l9): ' + e.message); });
  await q.goto(p.url());
  await q.fill('#nameInput', 'Sam'); await q.click('[data-jump="9"]'); await q.waitForTimeout(2600);
  await q.evaluate(() => { if (document.querySelector('#modal:not([hidden]) [data-close]')) document.querySelector('#modal [data-close]').click(); __debug.set({ tut:'l9-done' }); });
  await q.waitForTimeout(600);
  const gb = await q.$('#guideText [data-action="l10"]');
  t.check('Lesson 9 done: the guide offers Start Lezione 10 · A che ora?', !!gb && (await gb.textContent()).includes('Start Lezione 10 · A che ora?'));
  if (gb) await gb.click();
  await q.waitForTimeout(2800);
  t.check('…and it starts Lesson 10 in the piazza', await q.evaluate(() => __dbg().lesson === 10 && __dbg().tut === 'l10-start' && __dbg().scene === 'piazza'));
  await q.close();
}, { fakeSpeech:true });
