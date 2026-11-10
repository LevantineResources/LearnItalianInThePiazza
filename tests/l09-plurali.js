/* Lesson 9 · Due magliette, tre rose, played from the skip link to the completion screen (docs/lessons/09-quanti.md,
   test plan). Speech is faked (harness fakeSpeech) so listening lines run at a known pace.
   Deliberate mistakes: the barrier (*due maglietta*), one wrong answer in the word check's quiz, *magliette rossa*
   (agreement hint), one ties too many at Franco's (*No, scusi, …*), a wrong total in the notepad (*Può ripetere?*),
   *arancia* and *pomodoro* after a number at Pina's (ending hints). Played in a 1280 × 720 window; the notepad is
   clicked and typed into as a player would. Then Sofia: the introduction and the dictated route,
   with one step into the river (red, taken back), *No, scusi* and the Cancella button, and a winding but valid route.
   The shopping list and the totals are random: the test reads them from __dbg().l9. Ends with the dictated map at
   390 × 844. */
const { play } = require('./lib/harness');

const NUM = ['zero','uno','due','tre','quattro','cinque','sei','sette','otto','nove','dieci','undici','dodici','tredici',
  'quattordici','quindici','sedici','diciassette','diciotto','diciannove','venti'];

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const hint = () => p.$eval('#hint', h => h.hidden ? '' : h.innerText.replace(/\s+/g, ' '));
  const guide = () => p.$eval('#guideText', g => g.innerText.replace(/\s+/g, ' '));
  /* hints help you find the answer, they never give it: no Italian sentence the player has to say */
  const noAnswer = (h, ...its) => !!h && its.every(x => !h.toLowerCase().includes(x.toLowerCase()));
  const objective = async want => { const o = await t.objective(); return want === undefined ? o : o === want; };
  const padOpen = async () => (await dbg()).pad.open;
  const lines = () => t.lines();
  const has = async s => (await lines()).some(l => l.includes(s));
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
  /* write in the notepad as a player does: click the box (it must be on screen, not covered, and nothing scrolled that a
     player can't scroll), type the digits, Enter. (At 1280 × 720 the notepad of the last stall used to be below the
     dialog's visible area: tests/layout.js) */
  const write = async n => {
    const r = await p.evaluate(() => {
      const e = document.querySelector('#npadInput'), b = e.getBoundingClientRect(), hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      const dlg = document.querySelector('#dialog').getBoundingClientRect();
      return { x:b.left + b.width / 2, y:b.top + b.height / 2, on:b.top >= 0 && b.bottom <= innerHeight && b.top >= dlg.top && b.bottom <= dlg.bottom, hit:hit === e,
        still:document.querySelector('#stage').scrollTop + document.querySelector('#dialog').scrollTop + (document.scrollingElement.scrollTop || 0) === 0 };
    });
    t.check(`the notepad box is on screen and clickable (${(await dbg()).pad.label})`, r.on && r.hit && r.still);
    await p.mouse.click(r.x, r.y); await p.keyboard.type(String(n)); await p.keyboard.press('Enter');
    await p.waitForTimeout(300); await settle(); await t.dump();
  };
  const groups = () => p.$$eval('#bank .bank-label', ls => ls.map(l => l.textContent));
  const tileThere = w => p.$(`#bank .tile >> text="${w}"`);
  const dict = async () => (await dbg()).dict;
  const at = async node => (await dict()).node.join(',') === node;
  /* greet a vendor the way they expect (Lesson 7) */
  const greet = async () => { await say(['Buongiorno', 'Come sta?']); await say(['Sto bene, grazie']); };
  /* the total: a listening line, then the notepad */
  const total = async (id, label) => {
    await until(padOpen, 'the notepad'); await settle();
    const T = (await dbg()).l9.totals[id];
    t.check(`${label}: the total is a hidden listening line, then the notepad`, await has('Ascolta di nuovo') && (await dbg()).pad.label.includes('totale'));
    return T;
  };
  const pay = async label => {
    await say(['Ecco', 'venti', 'euro']);
    const h = await hint();
    t.check(`${label}: paid, ticked on the list; the hint gives no Italian`, await has('Grazie!') && (h.includes('Bought') || h.includes('Everything on your list')) && noAnswer(h, 'arrivederci', 'grazie'));
    await say(['Grazie mille', 'Arrivederci']);
    t.check(`${label}: goodbye`, await has('Arrivederci'));
    await t.leave(); await p.waitForTimeout(300);
  };

  /* ---------- the market, the shopping list ---------- */
  await t.jump(9);
  await until(() => p.isVisible('.sheet.notebook'), 'the shopping list', 6000);
  let d = await dbg();
  const L = d.l9.list, V = d.npcs;
  console.log('   start:', JSON.stringify({ scene:d.scene, tut:d.tut, npcs:Object.keys(d.npcs), list:L, totals:d.l9.totals }));
  t.check('L9 label and objective', (await p.textContent('#lessonLabel')).includes('Lezione 9 · Due magliette, tre rose') && await objective('Check your shopping list'));
  t.check('at the market, no Mark, no Sofia yet', d.scene === 'mercato' && !d.npcs.mark && !d.npcs.sofia && d.npcs.teresa && d.npcs.pina);
  const sheet0 = await p.textContent('.sheet');
  const en = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  t.check('the list: in English, by stall, no plurals given away', sheet0.includes(en(L.maglietta, 'T-shirt', 'T-shirts')) && sheet0.includes(en(L.cravatta, 'tie', 'ties'))
    && sheet0.includes('1 scarf') && sheet0.includes(en(L.rosa, 'rose', 'roses')) && sheet0.includes(en(L.arancia, 'orange', 'oranges')) && sheet0.includes('1 melon')
    && sheet0.includes("At Gino's") && !/magliette|cravatte|arance/.test(sheet0) && !/Mark/.test(sheet0));
  t.check('flowers: an odd number in all', (L.rosa + L.girasole) % 2 === 1);
  await t.shot('l9-01-list');
  await p.click('.sheet .cta [data-close]'); await p.waitForTimeout(400);
  t.check('→ buy the T-shirts at Teresa\'s', await objective("Buy the T-shirts at Teresa's"));
  t.check('barrier guide: no plural given away', noAnswer(await guide(), 'magliette', 'vorrei'));
  t.check('the List button is there', (await dbg()).list.button && await p.isVisible('#btnList'));
  await p.keyboard.press('l'); await p.waitForTimeout(300);
  t.check('L opens the list again', await p.isVisible('.sheet.notebook'));
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);

  /* ---------- the barrier: singular tiles only ---------- */
  console.log('TERESA (barrier)'); await talkTo(...V.teresa);
  console.log('   bank:', (await groups()).join(', '));
  t.check('barrier bank: maglietta, no magliette', !!(await tileThere('maglietta')) && !(await tileThere('magliette')));
  t.check('the list beside the tile bank', (await dbg()).list.dialog && (await p.isVisible('#dlgList')));
  await greet();
  await say(['Vorrei', NUM[L.maglietta], 'maglietta']);
  t.check('formatted: Vorrei due maglietta.', await has(`Vorrei ${NUM[L.maglietta]} maglietta.`));
  t.check('Teresa: una maglietta… o due magliette?', await has(`Una maglietta… o ${NUM[L.maglietta]} magliette?`));
  t.check('barrier: the plural, time for the handbook', await has('needs the plural'));
  await t.shot('l9-02-barrier');
  await t.choose();                                                   // "Open handbook"
  await p.waitForTimeout(500);
  t.check('handbook opens at Lezione 9', (await p.textContent('.sheet h2')).includes('Due magliette'));
  t.check('→ learn the words', await objective('Learn the Lesson 9 words'));

  /* ---------- the chapter: the plurals table ---------- */
  const table = await p.$eval('.pltable', e => e.innerText.replace(/\s+/g, ' '));
  console.log('   table:', table);
  t.check('plurals table: -o -i, -a -e, -e -i, -cia -ce, accents', table.includes('il pomodoro → i pomodori') && table.includes('la maglietta → le magliette')
    && table.includes('la rosa → le rose') && table.includes('il girasole → i girasoli') && table.includes("l'arancia → le arance") && table.includes('il caffè → i caffè'));
  const how = await p.$eval('.callout', e => e.innerText);
  t.check('how: articles, agreement, rosa (pink) never changes', how.includes('l\' → gli') && how.includes('due magliette rosse') && how.includes('due magliette rosa'));
  await p.$eval('.pltable', e => e.scrollIntoView({ block:'center' })); await p.waitForTimeout(200);
  await t.shot('l9-03-handbook-plurals');
  const voc = await p.$$eval('.vocab .vrow', rs => rs.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
  console.log('   Vocabolario:', voc.length, 'words');
  t.check('Vocabolario: nouns with both forms and gender, quanti/quante, directions (Lei)', voc.some(v => v.startsWith('la maglietta / le magliette f'))
    && voc.some(v => v.startsWith('il girasole / i girasoli m')) && voc.some(v => v.startsWith("l'arancia / le arance f")) && voc.some(v => v.startsWith('Quante?'))
    && voc.some(v => v.startsWith('Vada sempre dritto.')) && voc.some(v => v.startsWith('Giri a sinistra.')) && voc.some(v => v.startsWith('Sa come si arriva a …?')));
  t.check('practice locked until the words are learned', (await p.textContent('.tabs')).includes('Practice 🔒'));
  const wc = await t.wordCheck({ wrong:true });
  t.check('word check: every word right once, the missed one came back', wc.phase === 'done' && wc.cameBack && wc.items === wc.total + 1 && wc.total === voc.length);
  t.check('→ practice', await objective('Finish the Lesson 9 practice'));
  await t.practice([['o', 0], ['o', 1], ['o', 1], ['o', 1], ['o', 1], ['t', ['vorrei', 'tre', 'rose']], ['o', 1], ['o', 0]]);
  await p.waitForTimeout(300);
  t.check('practice → buy everything on your list', await objective('Buy everything on your list · 0/4'));
  t.check('shopping guide: what to do, in English (no Vorrei …)', (await guide()).includes('Watch the endings') && noAnswer(await guide(), 'vorrei', 'magliette'));

  /* ---------- Teresa: the T-shirts, a colour that must agree ---------- */
  console.log('TERESA'); await talkTo(...V.teresa);
  console.log('   bank:', (await groups()).join(', '));
  t.check('Teresa\'s bank: both forms, colours', !!(await tileThere('magliette')) && !!(await tileThere('rosse')) && (await groups()).includes('Colori'));
  await greet();
  await say(['Vorrei', NUM[L.maglietta], 'magliette', 'rossa']);
  t.check('agreement: plural, rosse (the word corrected, not the sentence)', (await hint()).includes('rosse') && (await hint()).includes('plural') && await has('magliette rosse?')
    && noAnswer(await hint(), `${NUM[L.maglietta]} magliette rosse`, 'vorrei'));
  await t.shot('l9-04-stall-agreement');
  await say(['Vorrei', NUM[L.maglietta], 'magliette', 'rosse', 'per favore']);
  t.check('formatted: Vorrei due magliette rosse, per favore.', await has(`Vorrei ${NUM[L.maglietta]} magliette rosse, per favore.`));
  t.check('Teresa: Allora: due magliette rosse.', await has(`Allora: ${NUM[L.maglietta]} magliette rosse.`));
  let T = await total('teresa', 'Teresa');
  await write(T);
  t.check('Teresa: total noted; pay (in English: no Ecco venti euro)', (await dbg()).l9.noted.teresa === T && (await hint()).includes('twenty-euro note') && noAnswer(await hint(), 'ecco', 'venti'));
  await pay('Teresa');
  d = await dbg();
  t.check('1/4, the colour bonus', d.l9.paid.teresa && d.l9.colour === 'rosse' && await objective('Buy everything on your list · 1/4'));

  /* ---------- Franco: one tie too many → No, scusi ---------- */
  console.log('FRANCO'); await talkTo(...V.franco);
  await greet();
  const wrongTies = L.cravatta + 1;
  await say(['Vorrei', NUM[wrongTies], 'cravatte', 'e', 'una', 'sciarpa', 'per favore']);
  t.check('Franco gives you what you asked for', await has(`${NUM[wrongTies].replace(/^./, c => c.toUpperCase())} cravatte e una sciarpa, ecco!`) && await has('Altro?'));
  t.check('the list shows it, the hint points at it', (await hint()).includes('Check your list') && (await dbg()).list.dialog.some(x => x.startsWith('! ')));
  t.check('wrong-number hint: no "No, scusi", no number', noAnswer(await hint(), 'scusi', `${NUM[L.cravatta]} cravatte`, ` ${NUM[L.cravatta]} `));
  await t.shot('l9-05-stall-wrong-number');
  await say(['No, scusi', NUM[L.cravatta], 'cravatte']);
  t.check('formatted: No, scusi, due cravatte.', await has(`No, scusi, ${NUM[L.cravatta]} cravatte.`));
  t.check('Franco: Ah, due! Mi scusi.', await has(`Ah, ${NUM[L.cravatta]}! Mi scusi.`));
  T = await total('franco', 'Franco');
  await write(T + 1);
  t.check('wrong total: ask him to say it again (in English, no Può ripetere)', (await hint()).includes('say it again') && noAnswer(await hint(), 'ripetere', 'non ho capito'));
  const sp0 = await p.evaluate(() => window.__spoken.length);
  await say(['Può ripetere?']);
  t.check('the total again, slowly', (await p.evaluate(b => window.__spoken.slice(b), sp0)).some(s => s[1].includes(`Sono ${NUM[T]} euro`) && s[2] <= 0.7));
  await until(padOpen, 'the notepad again');
  await write(T);
  await pay('Franco');

  /* ---------- Gino: Quante rose? ---------- */
  console.log('GINO'); await talkTo(...V.gino);
  /* a greeting in the same turn as the request is enough (Come sta? is optional politeness) */
  await say(['Buongiorno', 'Vorrei', NUM[L.rosa], 'rose', 'e', NUM[L.girasole], 'girasoli']);
  t.check('Gino: greeted and asked in one turn, no "Buongiorno, eh!"', !(await has('Buongiorno, eh!')));
  t.check('Gino: the sunflowers, then Quante rose?', await has(`${NUM[L.girasole].replace(/^./, c => c.toUpperCase())} girasoli, ecco!`) && await has(`Quante rose? ${NUM[L.rosa].replace(/^./, c => c.toUpperCase())}?`));
  t.check('Quante rose? hint: no translation, no answer', noAnswer(await hint(), 'how many', 'sì', ` ${NUM[L.rosa]}`));
  await say(['Sì', NUM[L.rosa]]);
  t.check('Gino: Allora: cinque rose e due girasoli.', await has(`Allora: ${NUM[L.rosa]} rose e ${NUM[L.girasole]} girasoli.`));
  T = await total('gino', 'Gino');
  await write(T);
  await pay('Gino');

  /* ---------- Pina: -cia → -ce, -o → -i ---------- */
  console.log('PINA'); await talkTo(...V.pina);
  await greet();
  await say(['Vorrei', NUM[L.arancia], 'arancia']);
  t.check('arancia → arance: the -cia → -ce hint', (await hint()).includes('-cia') && (await hint()).includes('-ce') && await has(`Un'arancia… o ${NUM[L.arancia]} arance?`));
  await say(['Vorrei', NUM[L.arancia], 'arance', 'e', NUM[L.pomodoro], 'pomodoro']);
  t.check('arance accepted; pomodoro → pomodori hint', await has(`${NUM[L.arancia].replace(/^./, c => c.toUpperCase())} arance, ecco!`) && (await hint()).includes('pomodori') && (await hint()).includes('-o'));
  await say([NUM[L.pomodoro], 'pomodori', 'e', 'un', 'melone']);
  t.check('Pina: Quanti pomodori?', await has('Quanti pomodori?'));
  await say(['Sì']);
  t.check('Pina: the whole order', await has(`Allora: ${NUM[L.arancia]} arance, ${NUM[L.pomodoro]} pomodori e un melone.`));
  T = await total('pina', 'Pina');
  await write(T);
  await pay('Pina');

  /* ---------- Sofia walks up ---------- */
  t.check('→ someone wants to talk to you', await objective('Someone wants to talk to you'));
  await p.waitForTimeout(1500);
  d = await dbg();
  t.check('Sofia is coming, Mark is nowhere', d.npcs.sofia && !d.npcs.mark);
  await t.shot('l9-06-sofia-arrives');
  await until(async () => p.isVisible('#dialog'), 'Sofia', 12000); await settle(); await t.dump();
  t.check('Sofia introduces herself', (await p.textContent('#dlgWho')).includes('Sofia') && await has('Mi chiamo Sofia, sono di Milano.'));
  await until(async () => !!(await hint()), 'her hint', 3000);
  t.check('Sofia hint: introduce yourself, in English', (await hint()).includes('introduce yourself') && noAnswer(await hint(), 'mi chiamo', 'buongiorno'));
  d = await dbg();
  t.check('she came up close', Math.hypot(d.npcs.sofia[0] - d.me[0], d.npcs.sofia[1] - d.me[1]) < 120);
  await say(['Buongiorno', 'Mi chiamo Sam']);
  t.check('Sofia: Lei è di Padova?', await has('Piacere, Sam! Lei è di Padova?'));
  t.check('Lei è di Padova? hint: no translation', noAnswer(await hint(), 'padua', 'padova', 'sì', 'from'));
  await say(['No']);
  t.check('Sofia: Sa come si arriva a San Lorenzo?', await has('sa come si arriva a San Lorenzo?'));
  await until(async () => (await dict()).mounted, 'the map');
  t.check('→ tell Sofia the way; the map is in the conversation', (await dbg()).tut === 'l9-directions' && await p.isVisible('#dlgMap svg') && await at('0,1') && (await dict()).heading === 'S');
  t.check('direction tiles in the bank', !!(await tileThere('Vada sempre dritto')) && !!(await tileThere('fino alla chiesa')) && !!(await tileThere('San Lorenzo è lì.')));

  /* ---------- the dictated route ---------- */
  await say(['Vada dritto']);
  t.check('Vada dritto → one crossroads south; Sofia confirms', await at('0,2') && await has('Dritto… va bene!'));
  t.check('formatted as a statement: Vada dritto.', await has('Vada dritto.') && !(await has('Vada dritto?')));
  await say(['Giri a sinistra', 'poi', 'Vada sempre dritto']);
  t.check('…poi vada sempre dritto: to the pharmacy', await at('3,2') && await has('A sinistra, poi sempre dritto, fino alla farmacia… va bene!'));
  t.check('formatted: Giri a sinistra. Poi vada sempre dritto.', await has('Giri a sinistra. Poi vada sempre dritto.'));
  await say(['Vada dritto']);
  t.check('on to the river bank', await at('4,2'));
  await t.shot('l9-07-map-mid-route');
  await say(['Vada dritto']);
  d = await dbg();
  /* the red attempt: a dashed segment from the cursor towards the river, and a ✗ where it stops. (Not isVisible on the
     polyline: a horizontal line has a zero-height bounding box, which Playwright counts as hidden.) */
  const red = await p.evaluate(() => {
    const l = document.querySelector('#dlgMap .dm-bad'); if (!l) return null;
    const b = l.getBoundingClientRect();
    return { w:Math.round(b.width), stroke:getComputedStyle(l).stroke, pts:l.getAttribute('points') };
  });
  console.log('   red segment:', JSON.stringify(red));
  t.check('into the river: Lì c\'è il fiume!, red, taken back', await has("Lì c'è il fiume!") && d.dict.bad === 'river' && d.dict.node.join(',') === '4,2'
    && !!red && red.w > 30 && /^rgb\((1\d\d|2\d\d), \d{1,2}, \d{1,2}\)$/.test(red.stroke) && red.pts.startsWith('540,220') && await p.isVisible('#dlgMap .dm-x'));
  t.check('the hint: bridges', (await hint()).includes('bridge') && noAnswer(await hint(), 'fiume'));
  await t.shot('l9-08-map-river');
  /* two more impossible steps: after three, the hint names a valid next step, in English */
  await say(['Vada dritto']);
  await say(['Vada sempre dritto']);
  d = await dbg();
  t.check('three impossible steps: a next step in English, no Italian sentence', d.l9.bad === 3 && d.dict.node.join(',') === '4,2'
    && /Try this next step: (turn (left|right)|go straight on|keep going)/.test(await hint()) && noAnswer(await hint(), 'giri', 'vada'));
  await say(['No, scusi']);
  t.check('No, scusi: one step back', await at('3,2') && await has('torno indietro') && !(await dict()).bad);
  await say(['Giri a destra']);
  t.check('Giri a destra → south', await at('3,3') && (await dict()).heading === 'S');
  await p.click('#dmUndo'); await p.waitForTimeout(300);
  t.check('Cancella: taken back without a word', await at('3,2') && (await dict()).heading === 'E');
  await say(['Giri a destra']);
  await say(['alla prima strada', 'Giri a sinistra']);
  t.check('Alla prima strada giri a sinistra → along the bottom', await at('4,4') && await has('Alla prima strada giri a sinistra.'));
  await say(['San Lorenzo è lì.']);
  t.check('not there yet: Sofia isn\'t fooled', await has('non è San Lorenzo, no?') && (await dbg()).l9.sofia.phase === 'dir');
  await say(['Giri a sinistra', 'poi', 'Vada sempre dritto', 'fino alla chiesa']);
  d = await dbg();
  t.check('…fino alla chiesa: San Lorenzo; the hint gives no Italian', d.dict.node.join(',') === '4,1' && d.dict.arrived && (await hint()).includes('San Lorenzo now')
    && noAnswer(await hint(), 'è lì', ' lì'));
  t.check('the route: winding, every step on the map', d.l9.route.length === 7 && d.dict.path.join(' ') === '0,1 0,2 1,2 2,2 3,2 3,3 3,4 4,4 4,3 4,2 4,1');
  await say(['San Lorenzo è lì.']);
  t.check('Sofia: Perfetto! È lontano?', await has('Perfetto! È lontano?'));
  t.check('È lontano? hint: no translation, no answer', noAnswer(await hint(), 'lontano', 'far'));
  await t.shot('l9-09-map-finished');
  await say(['Non è lontano.']);
  t.check('formatted: Non è lontano.', await has('Non è lontano.'));
  t.check('Sofia: Grazie mille! Lei è molto gentile.', await has('Grazie mille! Lei è molto gentile.'));
  await t.choose(); await p.waitForTimeout(900);

  /* ---------- complete ---------- */
  t.check('L9 complete modal', await p.isVisible('#modal') && (await p.textContent('.sheet h2')).includes('Lezione 9 completata'));
  const done = await p.textContent('.sheet');
  t.check('completion: the shopping, with plurals', done.includes(`${NUM[L.maglietta][0].toUpperCase() + NUM[L.maglietta].slice(1)} magliette rosse`) && done.includes(`${NUM[L.cravatta]} cravatte e una sciarpa`.replace(/^./, c => c.toUpperCase()))
    && done.includes(`${NUM[L.arancia]} arance, ${NUM[L.pomodoro]} pomodori e un melone`.replace(/^./, c => c.toUpperCase())));
  t.check('completion: the route you gave', done.includes('Alla prima strada giri a sinistra.') && done.includes('Vada dritto fino alla chiesa.') && await p.isVisible('.sheet .dictsvg'));
  await t.shot('l9-10-complete');
  await p.click('.sheet [data-close]'); await p.waitForTimeout(300);
  t.check('L9 objective completed', await objective('Lezione 9 completata'));
  await p.keyboard.press('v'); await p.waitForTimeout(300);
  const dictionary = await p.textContent('.sheet');
  t.check('dictionary: Lezione 9 tiles', dictionary.includes('Lezione 9') && dictionary.includes('magliette') && dictionary.includes('Vada sempre dritto'));
  await p.click('.sheet [data-close]'); await p.waitForTimeout(200);

  /* ---------- Studio: Lesson 9 is completed; its words, with typed items (Lesson 9 on) ---------- */
  const sd = await p.evaluate(() => __dbg().study);
  console.log('   Studio:', sd.completed.join(', '), '·', JSON.stringify(sd.lessons.find(l => l.n === 9)));
  t.check('Studio: Lesson 9 is completed, all its words', sd.completed.includes(9) && sd.lessons.some(l => l.n === 9 && l.words === voc.length));
  await p.keyboard.press('h'); await p.waitForTimeout(300); await p.click('[data-ch="9"]'); await p.waitForTimeout(200);
  t.check('handbook: Lesson 9 has a Studia button', await p.isVisible('.tab-study'));
  await p.click('.tab-study'); await p.waitForTimeout(300);
  await p.click('[data-vc=skip]'); await p.waitForTimeout(200);
  const sq = await p.evaluate(() => {
    const s = () => __dbg().study.session, click = sel => { const b = document.querySelector(sel); if (b) b.click(); };
    /* typed: the plural form of a "singular / plural" word, no accents or punctuation */
    const bare = it => it.split(' / ').pop().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[?.!,]/g, '').toLowerCase();
    let g = 0, types = 0, typedWords = [], bad = null;
    while (s().phase === 'quiz' && g++ < 300){
      const x = s();
      if (x.status !== 'answer'){ click('[data-vc=next]'); continue; }
      if (x.cur.dir === 'type'){ types++; typedWords.push(x.cur.it); document.querySelector('#vcType').value = bare(x.cur.it); click('[data-vc=check]'); if (s().status !== 'right'){ bad = x.cur.it; break; } continue; }
      click(`[data-vq="${x.cur.answer}"]`);
    }
    return { types, typedWords, bad, phase:s().phase, right:s().right, total:s().total };
  });
  console.log('   Studio quiz:', JSON.stringify(sq));
  t.check('Studio, Lesson 9: typed items (plurals typed without accents are right), and the quiz finishes', sq.types > 0 && !sq.bad && sq.phase === 'done' && sq.right === sq.total
    && !sq.typedWords.some(w => w.includes('…')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  t.check('Studio leaves Lesson 9 done', (await dbg()).tut === 'l9-done');
  await p.evaluate(() => __debug.travel('piazza')); await p.waitForTimeout(2600);
  t.check('Mark is not in the piazza either', !(await dbg()).npcs.mark);

  /* ---------- the dictated map and a stall on a phone (390 × 844) ---------- */
  await p.setViewportSize({ width:390, height:844 });
  await p.evaluate(() => { const L = __dbg().l9; __debug.set({ tut:'l9-directions', l9:Object.assign(L, { sofia:{ phase:'dir' }, done:false,
    route:[{ op:{ k:'straight' } }, { op:{ k:'turn', dir:'L' } }, { op:{ k:'straightUntil' } }] }) }); __debug.travel('mercato', { x:480, y:520 }); });
  await p.waitForTimeout(2600);
  d = await dbg();
  await t.talkTo(...d.npcs.sofia); await settle();
  await say(['Vada dritto']);
  await say(['Vada dritto']);
  const box = await p.$eval('#dlgMap svg', e => { const b = e.getBoundingClientRect(); return { w:b.width, h:b.height, top:b.top }; });
  const rect = sel => p.$eval(sel, e => { const b = e.getBoundingClientRect(); return { top:Math.round(b.top), bottom:Math.round(b.bottom) }; });
  const bank = await rect('#bank'), mapBox = await rect('#dlgMap'), status = await rect('#dlgMap .dm-status'), trBox = await rect('#transcript');
  console.log('   phone:', JSON.stringify({ map:box, mapBox, status, transcript:trBox, bank }));
  /* with the river hint shown the map's row is squeezed: the map scales down, it never spills over the transcript */
  t.check('phone: the map on top, full width; the tiles below, on screen', box.w > 340 && box.h > 150 && bank.top > box.top + box.h && bank.bottom <= 844);
  t.check('phone: the map and its status line stay above the transcript', box.top + box.h <= status.top + 1 && status.bottom <= mapBox.bottom + 1 && mapBox.bottom <= trBox.top + 1);
  await t.shot('l9-11-map-phone');
  await t.leave();
  await p.evaluate(() => { const L = __dbg().l9; L.paid.franco = false; L.said.franco = false; L.order.franco = {}; delete L.noted.franco; __debug.set({ tut:'l9-shopping', l9:L }); });
  d = await dbg();
  await t.talkTo(...d.npcs.franco); await settle();
  await say(['Buongiorno']);
  t.check('phone: the list as a strip above the tiles', await p.isVisible('#dlgList .ckl.compact'));
  await t.shot('l9-12-stall-phone');
}, { fakeSpeech: true, viewport: { width:1280, height:720 } });   // a laptop window
