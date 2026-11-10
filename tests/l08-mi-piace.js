/* Lesson 8 · Mi piace!, played from the skip link to the completion screen (docs/lessons/08-mi-piace.md, test plan).
   Speech is faked (harness fakeSpeech) so listening lines run at a known pace.
   The barrier: Teresa opens with "Cosa cerca?"; "Come sta?" gets a sensible answer, "Cerco una maglietta" her fast
   questions. After the words: "Buongiorno! Ha una maglietta rossa?" is accepted in one turn (the greeting counts), and
   after "Che taglia?" there is no hint until three failed attempts ("Mark told you his size"). Pina's melon (optional).
   Hints never give the Italian answer: every hint shown is logged (window.__hintLog) and scanned at the end for the
   model sentences of Lessons 7–8 (outside the typed scripts' "Try:" model, an agreed design after two misses).
   Deliberate mistakes: a *rosso* maglietta (agreement hint), *troppo piccolo* (feminine hint), one wrong CHOICE in the
   fitting (Mark: "Hmm, really?", the line is said again), *ti piace* to Teresa (Le hint), *Emma piace* (piacere works
   backwards), *la prendo* for il mazzo (lo hint), Gino's change, which is two euros short (*Mancano due euro*), and one
   wrong answer in the word check's quiz (the word comes back later in the round).
   Prices are Lesson 7's random ones: the test reads them from __dbg().l7.prices. */
const { play } = require('./lib/harness');

const NUM = ['zero','uno','due','tre','quattro','cinque','sei','sette','otto','nove','dieci','undici','dodici','tredici',
  'quattordici','quindici','sedici','diciassette','diciotto','diciannove','venti'];

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const hint = () => p.$eval('#hint', h => h.hidden ? '' : h.innerText.replace(/\s+/g, ' '));
  const objective = async want => { const o = await t.objective(); return want === undefined ? o : o === want; };
  const padOpen = async () => (await dbg()).pad.open;
  const lines = () => t.lines();
  const has = async s => (await lines()).some(l => l.includes(s));
  /* wait until nothing is spoken and nothing new appears for a while (the display queue has drained) */
  const settle = async (quiet = 1000, max = 25000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#npad') ? 5000 : 0)
        + (document.querySelector('#choices').hidden ? 0 : 20000) + (document.querySelector('#typer').hidden ? 0 : 40000), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const say = async labels => { for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const type = async text => {
    await p.waitForSelector('#typer:not([hidden])', { timeout:15000 });
    const en = await p.textContent('#typerEn');
    await p.fill('#typerInput', text); await p.press('#typerInput', 'Enter');
    console.log(`   ⌨ [${en}] "${text}"`);
    await p.waitForTimeout(400); await settle(); await t.dump();
  };
  const pick = async label => {
    await p.waitForSelector('#choices:not([hidden]) button', { timeout:15000 });
    await p.click(`#choices button >> text="${label}"`);
    console.log(`   ☞ "${label}"`);
    await p.waitForTimeout(300); await settle(); await t.dump();
  };
  const talkTo = async (x, y) => { await t.talkTo(x, y); await settle(); await t.dump(); };
  const write = async n => { await p.fill('#npadInput', String(n)); await p.press('#npadInput', 'Enter'); await p.waitForTimeout(300); await settle(); await t.dump(); };
  const typerVisible = () => p.isVisible('#typer');

  /* ---------- the market: Mark is back with cash ---------- */
  await t.jump(8);
  await p.evaluate(() => { window.__hintLog = []; });
  let d = await dbg();
  console.log('   start:', JSON.stringify({ scene:d.scene, tut:d.tut, me:d.me, npcs:d.npcs, prices:d.l7.prices }));
  t.check('L8 label', (await p.textContent('#lessonLabel')).includes('Lezione 8 · Mi piace!'));
  t.check('L8 objective: talk to Mark', await objective('Talk to Mark'));
  t.check('at the market with Mark and Lucia', d.scene === 'mercato' && d.npcs.mark && d.npcs.lucia && d.npcs.teresa && d.npcs.gino);
  t.check('Lucia near Gino\'s stall', Math.abs(d.npcs.lucia[0] - d.npcs.gino[0]) < 320 && Math.abs(d.npcs.lucia[1] - d.npcs.gino[1]) < 90);
  t.check('Mark waits in the walkway', Math.hypot(d.npcs.mark[0] - d.me[0], d.npcs.mark[1] - d.me[1]) > 50 && d.npcs.mark[0] > 400 && d.npcs.mark[0] < 560);
  const pr = d.l7.prices;
  const V = d.npcs;

  console.log('MARK'); await talkTo(...d.npcs.mark);
  t.check('Mark: the date is Emma, red, large', await has("It's Emma") && await has('red is her favourite colour') && await has("I'm a large"));
  await t.shot('l8-01-mark-news');
  await t.choose(); await settle(); await t.leave();
  t.check('→ ask Teresa for a red shirt', await objective('Ask Teresa for a red shirt'));
  d = await dbg();
  t.check('Mark went to the fruit stall', Math.hypot(d.npcs.mark[0] - V.pina[0], d.npcs.mark[1] - V.pina[1]) < 110);

  /* ---------- the barrier: Teresa talks fast ---------- */
  console.log('TERESA (barrier)'); await talkTo(...V.teresa);
  console.log('   bank:', (await p.$$eval('#bank .bank-label', ls => ls.map(l => l.textContent))).join(', '));
  t.check('Teresa opens with Cosa cerca? (no untaught qualcosa)', await has('Buongiorno! Cosa cerca?') && !(await has('qualcosa')));
  t.check('barrier bank: no colours yet, but cerco (Lesson 6) and una maglietta', !(await p.$('#bank .tile >> text="rossa"'))
    && !!(await p.$('#bank .tile >> text="Cerco …"')) && !!(await p.$('#bank .tile >> text="una maglietta"')));
  await say(['Buongiorno', 'Come sta?']);
  t.check('barrier: Come sta? gets a sensible answer, not the fast questions', await has('Bene, grazie. E Lei?') && !(await has('è finita')) && (await dbg()).l8.barrier === 0);
  await say(['Sto bene, grazie']);
  t.check('barrier: the hint says what to do, in English', (await hint()).includes("what you're looking for") && !/cerco|maglietta/i.test(await hint()));
  const sp0 = await p.evaluate(() => window.__spoken.length);
  await say(['Cerco …', 'una maglietta']);
  t.check('formatted: Cerco una maglietta.', await has('Cerco una maglietta'));
  const fast = (await p.evaluate(b => window.__spoken.slice(b), sp0)).find(s => s[1].includes('è finita'));
  t.check('barrier: the fast questions follow from "cerco una maglietta", spoken at rate 1', fast && fast[2] === 1 && fast[1].startsWith('Una maglietta? Sì, certo!') && fast[1].includes('Che taglia porta?'));
  t.check('barrier: no English for the fast line', await p.$$eval('.line.npc', ls => { const l = ls.find(x => x.textContent.includes('è finita')); return !!l && !l.querySelector('[data-en]'); }));
  t.check('barrier hint: no Italian to say', (await hint()).includes('very fast') && !(await hint()).includes('Può ripetere'));
  await say(['blu']);
  t.check('barrier: blu → the blue one is sold out (fast)', await has('La blu? Mi dispiace, è finita!'));
  t.check('barrier: you caught maglietta and nothing else', await has('You caught maglietta'));
  await t.shot('l8-02-barrier');
  await t.choose();                                                   // "Open handbook"
  await p.waitForTimeout(500);
  t.check('handbook opens at Lezione 8', (await p.textContent('.sheet h2')).includes('Mi piace'));
  t.check('→ learn the words', await objective('Learn the Lesson 8 words'));
  t.check('chapter: colours grid and how piacere works', (await p.textContent('.sheet')).includes('bianco / bianca') && (await p.textContent('.sheet')).includes('works backwards'));

  /* ---------- the Vocabolario and the word check ---------- */
  const voc = await p.$$eval('.vocab .vrow', rs => rs.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
  console.log('   Vocabolario:', voc.length, 'words');
  t.check('Vocabolario: colours with both forms, la taglia (f), il resto (m), le rose (f pl), davvero, mancano', voc.some(v => v.startsWith('rosso / rossa red'))
    && voc.some(v => v.startsWith('la taglia f the size')) && voc.some(v => v.startsWith('il resto m')) && voc.some(v => v.startsWith('le rose f pl'))
    && voc.some(v => v.startsWith('davvero really')) && voc.some(v => v.startsWith('mancano')) && voc.some(v => v.startsWith('Le piace? Do you like it? (polite')));
  t.check('practice locked until the words are learned', (await p.textContent('.tabs')).includes('Practice 🔒'));
  const wc = await t.wordCheck({ wrong:true });
  t.check('word check: every word right once, the missed one came back', wc.phase === 'done' && wc.cameBack && wc.items === wc.total + 1 && wc.total === voc.length);
  t.check('→ practice', await objective('Finish the Lesson 8 practice') && (await dbg()).tut === 'l8-practice');

  /* ---------- practice ---------- */
  await t.practice([['o', 1], ['o', 1], ['o', 0], ['o', 1], ['t', ['è', 'troppo', 'piccola']], ['o', 0], ['t', ['a Emma', 'piace', 'il rosso']]]);
  await p.waitForTimeout(300);
  t.check('practice → find a red shirt', await objective("Find a red shirt in Mark's size"));

  /* ---------- colours and sizes, alone (tiles) ---------- */
  await t.shot('l8-03a-world-colours');
  console.log('TERESA (colours)'); await talkTo(...V.teresa);
  console.log('   bank:', (await p.$$eval('#bank .bank-label', ls => ls.map(l => l.textContent))).join(', '));
  t.check('Mark is not in the conversation', !(await p.$('.line.companion')));
  await say(['Ha …?', 'una maglietta', 'rossa']);
  t.check('business before greeting: Buongiorno, eh!', await has('Buongiorno, eh!') && (await hint()).includes('Greet first') && !(await hint()).includes('Come sta'));
  await say(['Buongiorno', 'Ha …?', 'una maglietta', 'rossa']);
  t.check('Buongiorno! Ha una maglietta rossa? accepted (the greeting counts)', await has('Buongiorno! Ha una maglietta rossa?')
    && (await lines()).filter(l => l.includes('Buongiorno, eh!')).length === 1);
  t.check('Teresa: Rossa? Sì! … Che taglia?', await has('Rossa? Sì! E anche bianca e nera. La blu è finita') && await has('Che taglia?'));
  t.check('after Che taglia?: no hint (no translation, no answer)', !/size|grande|large/i.test(await hint()));
  await t.shot('l8-03-colours');
  await say(['rosso']);
  t.check('agreement hint: maglietta → rossa', (await hint()).includes('feminine') && (await hint()).includes('rossa'));
  await say(['Ha …?']);
  t.check('still no size hint after two failed attempts', !/size/i.test(await hint()));
  await say(['Ha …?']);
  t.check('three failed attempts: Mark told you his size (no Italian)', (await hint()).includes('Mark told you his size') && !/grande/i.test(await hint()));
  await say(['grande', 'per favore', 'È per il mio amico.']);
  t.check('Teresa hands over the red shirt, large', await has('Ecco: la maglietta rossa, taglia grande.') && await has('Per il Suo amico? Che gentile!'));
  t.check('→ help Mark try it on', await objective('Help Mark try it on'));
  await t.leave(); await p.waitForTimeout(300);
  d = await dbg();
  t.check('Mark walked back to Teresa\'s stall', Math.hypot(d.npcs.mark[0] - V.teresa[0], d.npcs.mark[1] - V.teresa[1]) < 120);

  await t.clickWorld(480, 330); await p.waitForTimeout(1500);
  await t.shot('l8-03b-world-fitting');
  /* ---------- the fitting (typing + CHOICE) ---------- */
  console.log('TERESA (fitting)'); await talkTo(...V.teresa);
  t.check('fitting: Mark is with you, typing', await typerVisible() && await has("It's too small! Does she have a bigger one?"));
  await type('e troppo piccolo. ha una taglia piu grande?');
  t.check('hint: piccolo → piccola', (await hint()).includes('feminine') && (await hint()).includes('piccola'));
  await type('ha una taglia piu grande?');
  t.check('hint: “too” is missing, look it up (the model only after two misses)', (await hint()).includes('“too” is missing') && (await hint()).includes('Try:'));
  await type('e troppo piccola. ha una taglia piu grande?');
  t.check('Teresa: the extra large… Le sta benissimo', await has('ecco la extra large') && await has('Le sta benissimo!'));
  t.check('typed sentence shown corrected', await has('È troppo piccola. Ha una taglia più grande?'));
  t.check('CHOICE: Mark asks what she says, no typer', await has("What's she saying?") && !(await typerVisible()));
  t.check('CHOICE: no English on the line', await p.$$eval('.line.npc', ls => { const l = ls.reverse().find(x => x.textContent.includes('Le sta benissimo')); return !!l && !l.querySelector('[data-en]'); }));
  await t.shot('l8-04-fitting-choice');
  const spF = await p.evaluate(() => window.__spoken.length);
  await pick("She says it's too big.");
  t.check('wrong pick: Hmm, really? and the line again, slowly', await has('Hmm, really?')
    && (await p.evaluate(b => window.__spoken.slice(b), spF)).some(s => s[1].includes('Le sta benissimo') && s[2] <= 0.7));
  await pick('She says it looks great on you.');
  t.check('Mark: a potato sack, ask if she really likes it', await has('potato sack'));
  await type('ti piace davvero?');
  t.check('hint: Teresa is a stranger, Le piace', (await hint()).includes('stranger') && (await hint()).includes('Le'));
  await type('le piace davvero?');
  t.check('Teresa: Il rosso Le sta benissimo; Mark spots Lucia', await has('Il rosso Le sta benissimo') && await has('Lucia over there'));
  t.check('Le piace davvero? formatted', await has('Le piace davvero?'));
  await t.leave(); await p.waitForTimeout(300);
  t.check('→ ask Lucia', await objective('Ask Lucia what she thinks'));
  d = await dbg();
  t.check('Mark follows you, in the red shirt', d.l8.wearing === 'red' && Math.hypot(d.npcs.mark[0] - d.me[0], d.npcs.mark[1] - d.me[1]) < 90);

  /* ---------- Lucia's honest opinion (typing + CHOICE) ---------- */
  await t.clickWorld(800, 280); await p.waitForTimeout(2500);
  await t.shot('l8-05a-world-lucia');
  console.log('LUCIA'); await talkTo(...V.lucia);
  t.check('Lucia\'s dialog header: at the market', (await p.textContent('#dlgWho')).includes('Piazza delle Erbe'));
  await t.shot('l8-05-lucia');
  await type('buongiorno lucia! come sta?');
  t.check('Lucia: E Lei?', await has('Bene, grazie. E Lei?'));
  await type('sto bene grazie');
  await type('le piace questa maglietta?');
  t.check('Lucia: non mi piace, il bianco è più elegante', await has('non mi piace. Il bianco è più elegante'));
  await pick("She doesn't like the red. She says white is more elegant.");
  await type('e per emma. emma piace il rosso');
  t.check('hint: piacere works backwards, A Emma', (await hint()).includes('backwards') && (await hint()).includes('A Emma'));
  await type('e per emma. a emma piace il rosso');
  t.check('formatted: È per Emma. A Emma piace il rosso.', await has('È per Emma. A Emma piace il rosso.'));
  t.check('Lucia: white shirt and red roses', await has('la maglietta bianca… e le rose rosse!'));
  await pick('White shirt… and red roses!');
  t.check('Mark: she\'s a genius', await has("She's a genius"));
  await t.shot('l8-06-lucia-done');
  await t.leave(); await p.waitForTimeout(300);
  t.check('→ buy the white shirt', await objective('Buy the white shirt for Mark'));

  /* ---------- buying the white shirt (typing + LISTEN + notepad) ---------- */
  console.log('TERESA (buy)'); d = await dbg(); await talkTo(...d.npcs.teresa);
  await type('la bianca, extra large, per favore. lo prendo');
  t.check('hint: maglietta → la prendo', (await hint()).includes('feminine') && (await hint()).includes('la prendo'));
  await type('la bianca, extra large, per favore. la prendo');
  await until(padOpen, 'the notepad');
  t.check('the price is a hidden listening line', await has('Ascolta di nuovo') && !(await has(`Sono ${NUM[pr.maglietta]} euro.`)));
  t.check('the price was spoken (Lesson 7 price)', (await p.evaluate(() => window.__spoken.map(s => s[1]))).some(s => s.includes(NUM[pr.maglietta] + ' euro')));
  t.check('notepad: la maglietta bianca, typer hidden', (await dbg()).pad.label === 'la maglietta bianca' && !(await typerVisible()));
  await write(pr.maglietta);
  t.check('Mark: same as this morning', await has('Same as this morning') && !(await padOpen()));
  await type('ecco venti euro');
  await until(padOpen, 'the notepad (change)');
  t.check('notepad: the change', (await dbg()).pad.label === 'il resto');
  await write(20 - pr.maglietta);
  t.check('Mark: perfect; get the roses', await has('Perfect.') && await has('get the roses'));
  await t.leave(); await p.waitForTimeout(300);
  t.check('→ buy red roses', await objective("Buy red roses at Gino's"));
  d = await dbg();
  t.check('Mark has gone to change', !d.npcs.mark && d.l8.shirtPaid);

  /* ---------- Pina's melon (optional): the price by ear, la prendo → lo, pay with ten, the change by ear ---------- */
  console.log('PINA (melon)'); await talkTo(...V.pina);
  t.check('Pina: Cosa cerca?', await has('Buongiorno! Cosa cerca?'));
  await say(['Buongiorno', 'Quanto costa?', 'il melone']);
  await until(padOpen, 'the notepad (melon)'); await settle();
  t.check('melon price: a listening line, then the notepad', await has('Ascolta di nuovo') && (await dbg()).pad.label === 'il melone');
  await write(pr.melone);
  t.check('melon price written down; buy it if you like', (await dbg()).l8.melonPrice === pr.melone && (await hint()).includes("tell her you'll take it") && !/prendo/i.test(await hint()));
  await say(['La prendo.', 'Ecco', 'dieci', 'euro']);
  t.check('hint: il melone → lo prendo', (await hint()).includes('masculine') && (await hint()).includes('lo prendo') && !(await dbg()).l8.melonPaid);
  const spM = await p.evaluate(() => window.__spoken.length);
  await say(['Lo prendo.', 'Ecco', 'dieci', 'euro']);
  const melonChange = 10 - pr.melone;
  t.check('Pina gives the right change, by ear', (await p.evaluate(b => window.__spoken.slice(b), spM)).some(s => s[1].includes(`Ecco il resto: ${melonChange === 1 ? 'un' : NUM[melonChange]} euro`))
    && (await dbg()).l8.melonPaid === 10);
  t.check('the melon is optional: still buy the roses', await objective("Buy red roses at Gino's") && (await dbg()).tut === 'l8-roses');
  await say(['Grazie', 'Arrivederci']);
  t.check('Pina says goodbye', await has('Arrivederci, buona giornata!'));
  await t.leave();

  /* ---------- the roses and the wrong change (tiles + LISTEN + notepad) ---------- */
  console.log('GINO'); await talkTo(...V.gino);
  const groups = await p.$$eval('#bank .bank-label', ls => ls.map(l => l.textContent));
  console.log('   bank:', groups.join(', '));
  t.check('Gino: number tiles 0–20 in the bank', groups.includes('Numeri') && (await p.$$('#bank .tile >> text="diciannove"')).length === 1);
  await say(['Buongiorno', 'Come sta?']);
  await say(['Sto bene, grazie']);
  await say(['Avete …?', 'le rose rosse']);
  t.check('Gino: un bel mazzo?', await has('Un bel mazzo?'));
  t.check('hint: Ask how much the bunch is. (no Italian)', (await hint()).includes('Ask how much the bunch is.') && !/quanto|mazzo/i.test(await hint()));
  await say(['Quanto costa?', 'il mazzo']);
  await until(padOpen, 'the notepad (roses)'); await settle();
  t.check('roses price: listening line, notepad', await has('Ascolta di nuovo') && (await dbg()).pad.label === 'il mazzo di rose');
  await write(pr.fiori);
  t.check('roses price noted', (await dbg()).l8.rosesPrice === pr.fiori && await has(`Sono ${NUM[pr.fiori]} euro.`));
  t.check("hint: Written down! Tell him you'll take it. (no Italian)", (await hint()).includes("Written down! Tell him you'll take it.") && !/prendo|ecco|venti/i.test(await hint()));
  await say(['La prendo.', 'Ecco', 'venti', 'euro']);
  t.check('hint: il mazzo → lo prendo', (await hint()).includes('lo prendo') && (await hint()).includes('masculine'));
  await say(['Lo prendo.', 'Ecco', 'venti', 'euro']);
  t.check('formatted: Lo prendo. Ecco venti euro.', await has('Lo prendo. Ecco venti euro.'));
  await until(padOpen, 'the notepad (change)'); await settle();
  const wrongChange = 20 - pr.fiori - 2;
  t.check('the change was spoken: two euros short', (await p.evaluate(() => window.__spoken.map(s => s[1]))).some(s => s.includes(`Ecco il resto: ${NUM[wrongChange]} euro`)));
  t.check('notepad: il resto, with the price and the twenty', (await dbg()).pad.label === 'il resto' && (await p.textContent('#npad')).includes('pagato'));
  await t.shot('l8-07-notepad-change');
  await write(wrongChange);
  t.check("two short! hint, in English", (await hint()).includes("that's two short") || (await hint()).includes("That's two short"));
  t.check("…Excuse me, the change isn't correct (no Italian)", (await hint()).includes("Excuse me, the change isn't correct. It's missing two euros.") && !/resto|mancano|giusto/i.test(await hint()) && (await dbg()).l8.heardChange === wrongChange);
  t.check('notepad shows what it should be', await has(`20 − ${pr.fiori} = ${20 - pr.fiori}`));
  await t.shot('l8-08-wrong-change');
  await say(['Grazie', 'Arrivederci']);
  t.check('can\'t leave before the change is right', (await hint()).includes('Count Mark') && await p.isVisible('#builder'));
  await say(['Scusi', 'il resto', 'non è giusto', 'mancano', 'tre', 'euro']);
  t.check('wrong difference: count again (no answer)', (await hint()).includes('Count again') && !/mancano|due/i.test(await hint()));
  await say(['Scusi', 'il resto', 'non è giusto', 'mancano', 'due', 'euro']);
  t.check('formatted: Scusi, il resto non è giusto. Mancano due euro.', await has('Scusi, il resto non è giusto. Mancano due euro.'));
  t.check('Gino: Mi scusi! Ecco due euro.', await has('Mi scusi!') && await has('Ecco due euro.') && (await dbg()).l8.fixed);
  t.check('hint: Say thank you and goodbye. (no Italian)', (await hint()).includes('Say thank you and goodbye.') && !/grazie|arrivederci/i.test(await hint()));
  await say(['Grazie', 'Arrivederci']);
  t.check('Gino says goodbye', await has('Arrivederci, buona giornata!'));
  await t.leave();

  /* ---------- Mark comes back in the white shirt ---------- */
  await until(async () => p.isVisible('#dialog'), 'Mark', 6000); await settle();
  await t.dump();
  d = await dbg();
  t.check('Mark is back, in the white shirt', d.npcs.mark && d.l8.wearing === 'white' && (await p.textContent('#dlgWho')).includes('Mark'));
  t.check('Mark: red roses, white shirt, got to get ready', await has('Red roses, white shirt. I owe you.') && await has('get ready'));
  await t.shot('l8-09-mark-back');
  await t.choose(); await settle(); await t.dump();
  await t.choose(); await p.waitForTimeout(900);

  /* ---------- complete ---------- */
  t.check('L8 complete modal', await p.isVisible('#modal') && (await p.textContent('.sheet h2')).includes('Lezione 8 completata'));
  const sheet = await p.textContent('.sheet');
  t.check('completion lists the shopping', sheet.includes(`la maglietta bianca€${pr.maglietta} at Teresa's`) && sheet.includes(`le rose rosse€${pr.fiori} at Gino's`));
  t.check('completion mentions the melon', sheet.includes(`il melone€${pr.melone} at Pina's`));
  t.check('the date is not shown', !/restaurant|dinner|kiss/i.test(sheet));
  t.check('completion: Start Lezione 9', await p.isVisible('#goL9') && (await p.textContent('#goL9')).includes('Start Lezione 9'));
  await t.shot('l8-10-complete');
  await p.click('.sheet [data-close]'); await p.waitForTimeout(300);
  t.check('L8 objective completed', await objective('Lezione 8 completata'));
  d = await dbg();
  t.check('Mark has gone', !d.npcs.mark);
  await p.keyboard.press('v'); await p.waitForTimeout(300);
  const dict = await p.textContent('.sheet');
  t.check('dictionary: Lezione 8', dict.includes('Lezione 8 · Mi piace!') && dict.includes('Le piace?') && dict.includes('mancano'));
  const missingDict = await p.evaluate(() => __dictAudit(6));
  console.log('   typed words (Lessons 6–8) not in the dictionary:', missingDict.join(', ') || 'none');
  t.check('dictionary: every word of the typed tasks in Lessons 6–8 can be looked up', missingDict.length === 0);
  await p.fill('#dictSearch', 'davvero'); await p.waitForTimeout(200);
  const found = await p.$$eval('.sheet .entry', es => es.filter(e => e.style.display !== 'none').map(e => e.innerText.replace(/\s+/g, ' ')));
  console.log('   search "davvero":', found.join(' | '));
  t.check('dictionary search finds davvero', found.length >= 1 && found.every(f => f.includes('davvero')));
  await p.click('.sheet [data-close]');

  /* ---------- hints never give the answer: scan every hint shown for the model sentences ---------- */
  const norm = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const typedModels = (await p.evaluate(() => __typedModels())).filter(sc => /^l[78]-/.test(sc.tut)).flatMap(sc => sc.models);
  const tileModels = ['Ha una maglietta rossa?', 'Grande, per favore.', 'Avete le rose rosse?', 'Quanto costa il mazzo?', 'Lo prendo. Ecco venti euro.',
    'Scusi, il resto non è giusto.', 'Mancano due euro.', 'Grazie, arrivederci!', 'Buongiorno! Come sta?', 'Quanto costa il melone?', 'Lo prendo. Ecco dieci euro.', 'Cerco una maglietta.', 'Può ripetere?', 'Non ho capito.'];
  const forbidden = [...typedModels, ...tileModels].map(norm).filter(m => m.split(' ').length >= 2);
  const shown = await p.evaluate(() => window.__hintLog);
  const leaks = shown.map(h => h.split('Try:')[0]).filter(h => forbidden.some(m => norm(h).includes(m)));
  console.log(`   ${shown.length} hints shown; leaks: ${leaks.join(' | ') || 'none'}`);
  t.check('no hint contains a model sentence (outside the typed scripts\' "Try:")', shown.length > 10 && leaks.length === 0);
  await t.shot('l8-11-market-done');
  /* the guide's button starts Lesson 9 */
  await p.waitForTimeout(300);
  t.check('l8-done guide: Start Lezione 9', (await p.textContent('#guide')).includes('Start Lezione 9 · Due magliette, tre rose'));
  await p.click('#guide [data-action="l9"]'); await p.waitForTimeout(3000);
  d = await dbg();
  t.check('the guide button starts Lesson 9 at the market', d.lesson === 9 && d.tut === 'l9-start' && d.scene === 'mercato' && !d.npcs.mark);
}, { fakeSpeech: true });
