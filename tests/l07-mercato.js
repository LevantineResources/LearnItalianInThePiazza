/* Lesson 7 · Al mercato, played from the skip link to the completion screen (docs/lessons/07-al-mercato.md,
   test plan). Speech is faked (harness fakeSpeech) so listening lines and the drill run at a known pace.
   The opening at the market: Teresa (Buongiorno! Cosa cerca?), the greeting and come sta? exchange, then Mark: "Ask her
   how much the shirt is!" and ONE new tile, Mark's question (Quant'è… the blue shirt?); small talk and other sentences get
   sensible answers and nothing moves on; the dialog is closed and reopened (Mark asks again, the tile is still there);
   the tile → she says the shirt's price (fast, hidden) → "I… didn't catch the number" → the handbook.
   Deliberate mistakes: ciao/come stai to Bruno (politeness hint), a wrong turn on the map, a typo and a wrong
   word in the spelling drill, a wrong listening round, a price asked before greeting, a wrong notepad number
   twice (repeat slowly, then the text is revealed), questa for il mazzo (gender hint), and one wrong answer in the
   word check's quiz (the word comes back later in the round). Prices are random:
   the test reads them from __dbg().l7.prices. Vendors open with "Cosa cerca?"; a greeting in the same turn as the price
   question counts (Franco). Hints never give the Italian answer: every hint shown is logged and scanned at the end. */
const { play } = require('./lib/harness');

const NUM = ['zero','uno','due','tre','quattro','cinque','sei','sette','otto','nove','dieci','undici','dodici','tredici',
  'quattordici','quindici','sedici','diciassette','diciotto','diciannove','venti'];

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const hint = () => p.$eval('#hint', h => h.hidden ? '' : h.innerText.replace(/\s+/g, ' '));
  const objective = async want => { const o = await t.objective(); return want === undefined ? o : o === want; };
  const node = async (c, r) => { await p.click(`[data-node="${c},${r}"]`); await p.waitForTimeout(120); };
  const padOpen = async () => (await dbg()).pad.open;
  /* wait until nothing is spoken and no new line appears for a while (the display queue has drained) */
  const settle = async (quiet = 1000, max = 20000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#npad') ? 5000 : 0), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const say = async labels => { for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const talkTo = async (x, y) => { await t.talkTo(x, y); await settle(); await t.dump(); };
  const write = async n => { await p.fill('#npadInput', String(n)); await p.press('#npadInput', 'Enter'); await p.waitForTimeout(300); await settle(); await t.dump(); };

  /* ---------- Bar Centrale: Mark, coffee on his shirt ---------- */
  await t.jump(7);
  await p.evaluate(() => { window.__hintLog = []; });
  let d = await dbg();
  console.log('   start:', JSON.stringify({ scene:d.scene, tut:d.tut, mark:d.npcs.mark, bruno:d.npcs.bruno, prices:d.l7.prices }));
  t.check('L7 label', (await p.textContent('#lessonLabel')).includes('Lezione 7 · Al mercato'));
  t.check('L7 objective: talk to Mark', await objective('Talk to Mark'));
  t.check('Mark and Bruno at Bar Centrale', d.scene === 'piazza' && d.npcs.mark && d.npcs.bruno && Math.hypot(d.npcs.mark[0] - d.npcs.bruno[0], d.npcs.mark[1] - d.npcs.bruno[1]) < 100);
  const pr = d.l7.prices;
  t.check('prices in range, required ones all different', pr.maglietta >= 11 && pr.maglietta <= 19 && pr.cravatta >= 6 && pr.cravatta <= 14 && pr.fiori >= 4 && pr.fiori <= 12
    && pr.melone >= 1 && pr.melone <= 5 && new Set([pr.maglietta, pr.cravatta, pr.fiori]).size === 3);
  await t.shot('l7-01-mark-stain');

  console.log('MARK'); await talkTo(...d.npcs.mark);
  t.check('Mark: coffee, date, market', (await t.lines()).some(l => l.includes('date tonight')) && (await t.lines()).some(l => l.includes('Bruno will know')));
  await t.choose(); await t.leave();
  t.check('→ ask Bruno', await objective('Ask Bruno the way to the market'));

  /* ---------- Bruno: the way to the market (first too casual) ---------- */
  console.log('BRUNO'); await talkTo(...d.npcs.bruno);
  t.check('Mark is with Bruno', (await p.textContent('#dlgWho')).includes('Bruno'));
  await say(['Ciao', 'Come stai?']);
  t.check('politeness hint for Bruno', (await hint()).includes('polite forms'));
  console.log('   bank:', (await p.$$eval('#bank .bank-label', ls => ls.map(l => l.textContent))).join(', '));
  await say(['Sto bene, grazie']);
  await say(['Scusi', "Dov'è", 'il mercato']);
  let L = await t.lines();
  t.check('Bruno: directions to the market', L.some(l => l.includes('Piazza delle Erbe')) && L.some(l => l.includes('Vada sempre dritto, e alla prima strada giri a sinistra')));
  t.check('→ trace the route', await objective('Trace the route to the market'));
  await t.shot('l7-02-bruno-directions');
  await say(['Grazie mille']);
  L = await t.lines();
  t.check('Bruno: good luck with the shirt; Mark thanks him', L.some(l => l.includes('good luck with the shirt')) && L.some(l => l.includes('Thanks, Bruno!')));
  await t.leave();

  /* Mark follows you now */
  await t.clickWorld(560, 470); await p.waitForTimeout(2200);
  /* (under parallel load the walk can take longer: wait until Mark has caught up) */
  const follows = await until(async () => { const x = await dbg(); return Math.hypot(x.npcs.mark[0] - x.me[0], x.npcs.mark[1] - x.me[1]) < 80; }, 'Mark to catch up', 10000);
  d = await dbg();
  t.check('Mark follows you', follows);

  /* ---------- the map: one wrong turn, then the right route ---------- */
  await p.keyboard.press('m'); await p.waitForSelector('.mapsvg'); await p.waitForTimeout(300);
  t.check('map: Bruno\'s directions beside the map', (await p.textContent('.notes')).includes('Alla farmacia giri a sinistra'));
  t.check('map: no market button while tracing', !(await p.$('[data-go="mercato"]')));
  await node(2, 3); await node(3, 3); await p.click('#mCheck');
  const bad = await p.textContent('.mapstatus'); console.log('   map check 1:', bad);
  t.check('map: wrong turn hint', bad.includes('left, not right'));
  await p.click('#mClear');
  for (const [c, r] of [[2, 3], [1, 3], [1, 2], [0, 2], [0, 1]]) await node(c, r);
  await p.click('#mCheck');
  const good = await p.textContent('.mapstatus'); console.log('   map check 2:', good);
  t.check('map: route ok', good.includes('Perfetto') && good.includes('Bruno'));
  t.check('map: Mercato unlocked', await p.isVisible('[data-go="mercato"].primary'));
  await t.shot('l7-03-map-route');
  await p.click('[data-go="mercato"]'); await p.waitForTimeout(2800);
  d = await dbg();
  console.log('   market:', JSON.stringify({ scene:d.scene, tut:d.tut, me:d.me, npcs:d.npcs }));
  t.check('at the market, Mark with you', d.scene === 'mercato' && d.tut === 'l7-market' && !!d.npcs.mark);
  t.check('→ ask how much the shirt is', await objective('Ask how much the shirt is'));
  const V = d.npcs;

  /* ---------- the barrier: introductions, then Mark's question, a half-Italian tile; she answers, too fast ---------- */
  const ASK = "Quant'è… the blue shirt?";
  const askTile = () => p.$(`#bank .tile.mixed >> text="${ASK}"`);
  console.log('TERESA (barrier)'); await talkTo(...V.teresa);
  L = await t.lines();
  t.check('barrier: Teresa opens with Buongiorno! Cosa cerca?', L.some(l => l.includes('Buongiorno! Cosa cerca?')));
  t.check('barrier: a tile bank, no price tiles, no Mark\'s question tile yet', await p.isVisible('#bank') && !(await p.$('#bank .tile >> text="Quanto costa?"')) && !(await askTile()));
  t.check('barrier: no "say it in Italian" card', !(await p.$('#l7Prompt')) && !(await p.textContent('#dialog')).includes('say it in Italian'));
  t.check('barrier: opening hint says greet politely (no Italian)', (await hint()).includes('greet her politely') && !/buongiorno|come sta/i.test(await hint()));
  await say(['Buongiorno', 'Come sta?']);
  t.check('barrier: she answers come sta (Bene, grazie. E Lei?)', (await t.lines()).some(l => l.includes('Bene, grazie. E Lei?')) && !(await askTile()));
  t.check('barrier: hint, she asked how you are', (await hint()).includes('asked how you are'));
  await say(['Sto bene, grazie']);
  L = await t.lines();
  t.check('barrier: introductions done → Mark: ask her how much the shirt is', L.some(l => l.includes('Ask her how much the shirt is!')));
  t.check('barrier: ONE new tile, Mark\'s question, first in the bank', !!(await askTile()) && (await p.$$eval('#bank .bank-label', ls => ls.map(l => l.textContent)))[0] === "Mark's question"
    && (await p.$$eval('#bank .tile.mixed', ts => ts.length)) === 1);
  t.check('barrier: hint points at the tile (no Italian)', (await hint()).includes("tile with Mark's question") && !/quanto|costa|quant'?è/i.test(await hint()));
  t.check('barrier: still at Teresa, still l7-market', (await dbg()).tut === 'l7-market' && (await dbg()).l7.markAsked);
  await t.shot('l7-04-barrier-prompt');
  /* small talk is answered as usual; other sentences get a sensible answer, and nothing moves on */
  await say(['Mi chiamo Sam']);
  t.check('barrier: small talk answered (Piacere, Sam!), the tile stays', (await t.lines()).some(l => l.includes('Piacere, Sam!')) && !!(await askTile()));
  await say(['Scusi', "Dov'è", 'il mercato']);
  t.check('barrier: Dov\'è il mercato? → Il mercato? È qui! (nothing moves on)', (await t.lines()).some(l => l.includes('Il mercato? È qui!')) && (await dbg()).tut === 'l7-market'
    && await p.isVisible('#builder') && !(await t.lines()).some(l => l.includes('Ascolta di nuovo')));
  await say(['Questa è']);
  t.check('barrier: a sentence she can\'t make sense of → Eh? Non capisco. (nothing moves on)', (await t.lines()).some(l => l.includes('Eh? Non capisco.')) && (await dbg()).tut === 'l7-market'
    && (await hint()).includes("Mark's question"));
  /* close the dialog and come back: Mark asks again at once, the tile is there from the start */
  await t.leave();
  await talkTo(...V.teresa);
  L = await t.lines();
  t.check('barrier, reopened: Mark asks again, the tile is there, the hint points at it', L.some(l => l.includes('Ask her how much the shirt is!')) && !!(await askTile())
    && (await hint()).includes("tile with Mark's question"));
  /* Mark's question (alone): she catches quant'è and says the price anyway, fast, text hidden */
  const before7 = await p.evaluate(() => window.__spoken.length);
  await say([ASK]);
  L = await t.lines();
  t.check('barrier: formatted, half Italian, half English', L.some(l => l.includes(ASK)));
  t.check('barrier: the price is a hidden listening line', L.some(l => l.includes('Ascolta di nuovo')) && !L.some(l => /Sono \w+ euro/.test(l)) && !L.some(l => l.includes('maglietta blu')));
  const said7 = await p.evaluate(b => window.__spoken.slice(b), before7);
  t.check('barrier: she says the shirt\'s price (Ah, la maglietta blu? …), fast', said7.some(s => s[1].includes(`Ah, la maglietta blu? Sono ${NUM[pr.maglietta]} euro. Bella, eh?`) && s[2] >= 1));
  t.check('barrier: Mark asks how much; the tiles are gone', L.some(l => l.includes('What did she say? How much?')) && await p.isHidden('#builder'));
  t.check('barrier: → open your handbook', await objective('Open your handbook'));
  await t.shot('l7-04-barrier');
  await t.choose(); await settle(); await t.dump();
  t.check('barrier: you caught euro, not the number', (await t.lines()).some(l => l.includes('not the number')));
  await t.choose();                                               // "Open handbook"
  await p.waitForTimeout(500);
  t.check('handbook opens at Lezione 7', (await p.textContent('.sheet h2')).includes('Al mercato'));
  t.check('→ learn the words', await objective('Learn the Lesson 7 words'));
  t.check('chapter has the numbers drill button and the 0–20 grid', await p.isVisible('.sheet [data-numbers]') && (await p.textContent('.sheet')).includes('diciannove'));

  /* ---------- the Vocabolario and the word check (words first, then the practice) ---------- */
  const voc = await p.$$eval('.vocab .vrow', rs => rs.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
  console.log('   Vocabolario:', voc.length, 'words');
  t.check('Vocabolario: la maglietta (f), il mazzo di fiori (m), questo / questa, euro', voc.some(v => v.startsWith('la maglietta f the T-shirt'))
    && voc.some(v => v.startsWith('il mazzo di fiori m')) && voc.some(v => v.startsWith('questa this one')) && voc.some(v => v.startsWith('euro')) && voc.some(v => v.startsWith('Non ho capito.')));
  t.check('Vocabolario points to the numbers drill', (await p.textContent('.vocab .vnums')).includes('numbers drill'));
  t.check('practice locked until the words are learned', (await p.textContent('.tabs')).includes('Practice 🔒') && (await p.textContent('.cta')).includes('Learn the words'));
  await p.click('.tabs [data-tab=practice]'); await p.waitForTimeout(200);
  t.check('practice tab: words first', await p.isVisible('.vc-lock'));
  await p.click('.tabs [data-tab=words]'); await p.waitForTimeout(300);
  t.check('flashcard 1, Italian side, spoken', (await dbg()).words.phase === 'cards' && (await p.textContent('.vc-front .vc-it')).includes('il mercato')
    && (await p.evaluate(() => window.__spoken.map(s => s[1]))).includes('il mercato'));
  await p.keyboard.press('Space'); await p.waitForTimeout(600);
  t.check('Space turns the card over: the English', (await dbg()).words.flipped && (await p.textContent('.vc-back .vc-en')) === 'the market');
  await t.shot('l7-04b-flashcard');
  const wc = await t.wordCheck({ wrong:true });
  t.check('word check: every card, every word right once, the missed one came back', wc.phase === 'done' && wc.cameBack && wc.items === wc.total + 1);
  t.check('word check done: Bravo! and the missed word listed', (await p.textContent('.vc-stage.done')).includes('Bravo!') && await p.isVisible('.vc-pill'));
  await t.shot('l7-04c-words-done');
  t.check('→ practice', await objective('Finish the Lesson 7 practice') && (await dbg()).tut === 'l7-practice');

  /* ---------- practice ---------- */
  await t.practice([['o', 1], ['o', 1], ['o', 1], ['t', ['quanto', 'costa']], ['o', 1], ['o', 1]]);
  await p.waitForTimeout(300);
  t.check('practice → the drill', await objective('Master the numbers drill') && (await dbg()).drill.open);

  /* ---------- the drill: spelling 0 → 20 → 0, with a typo and a wrong word ---------- */
  let sawFix = false, sawShown = false;
  for (let k = 0; k < 42; k++){
    const dr = (await dbg()).drill; const n = dr.spell;
    if (k === 7){
      await p.fill('#ndInput', 'sei'); await p.press('#ndInput', 'Enter'); await p.waitForTimeout(150);
      sawShown = (await p.textContent('#ndFb')).includes('7 is sette');
    }
    const word = k === 13 ? 'tredic' : NUM[n];
    await p.fill('#ndInput', word); await p.press('#ndInput', 'Enter');
    if (k === 13){ await p.waitForTimeout(150); sawFix = (await p.textContent('#ndFb')).includes('Fixed: tredic → tredici'); }
  }
  t.check('drill: a wrong word shows the answer', sawShown);
  t.check('drill: a typo is fixed', sawFix);
  t.check('drill: spelling done', (await dbg()).drill.phase === 'listen');
  /* listening rounds up to 5, one wrong on purpose */
  const startRound = async () => { await p.keyboard.press('Enter'); await until(async () => (await dbg()).drill.status === 'answer', 'the round'); return (await dbg()).drill.current; };
  let wrongDone = false;
  for (let guard = 0; guard < 10; guard++){
    const n = (await dbg()).drill.n; if (n > 5) break;
    const cur = await startRound();
    if (n === 3 && !wrongDone){
      console.log(`   round ${n} (wrong on purpose): ${cur.join(' · ')}`);
      await p.keyboard.type(cur.map(x => (x + 1) % 21).join(' ')); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
      t.check('drill: wrong round, n stays', (await dbg()).drill.status === 'wrong' && (await dbg()).drill.n === 3);
      wrongDone = true; continue;
    }
    console.log(`   round ${n}: ${cur.join(' · ')}`);
    await p.keyboard.type(cur.join(' ')); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  }
  d = await dbg();
  t.check('drill: mastered', d.numbers.mastered && d.tut === 'l7-prices');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  t.check('→ ask the prices 0/3', await objective('Ask the prices for Mark · 0/3'));

  /* ---------- Teresa: the price before the greeting, then properly ---------- */
  console.log('TERESA'); await talkTo(...V.teresa);
  d = await dbg();
  t.check('Teresa reached from the aisle', d.me[1] > V.teresa[1] + 30 && Math.hypot(d.me[0] - V.teresa[0], d.me[1] - V.teresa[1]) < 58);
  t.check('Mark points at the shirt', (await t.lines()).some(l => l.includes('That blue one! How much?')));
  t.check('Teresa opens with Cosa cerca? (no untaught qualcosa)', (await t.lines()).some(l => l.includes('Buongiorno! Cosa cerca?')) && !(await t.lines()).some(l => l.includes('qualcosa')));
  console.log('   bank:', (await p.$$eval('#bank .bank-label', ls => ls.map(l => l.textContent))).join(', '));
  await say(['Quanto costa?']);
  t.check('price before greeting: Buongiorno, eh! + hint (no Italian)', (await t.lines()).some(l => l.includes('Buongiorno, eh!')) && (await hint()).includes('Greet first') && !/come sta/i.test(await hint()));
  await say(['Buongiorno', 'Come sta?']);
  t.check('Teresa: Bene, grazie. E Lei?', (await t.lines()).some(l => l.includes('Bene, grazie. E Lei?')));
  await say(['Sto bene, grazie']);
  t.check('hint: ask the price', (await hint()).includes('Ask the price'));
  await say(['Quanto costa?', 'questa']);
  await until(padOpen, 'the notepad'); await settle();
  L = await t.lines();
  t.check('sentence formatted', L.some(l => l.includes('Quanto costa questa?')));
  t.check('price is a hidden listening line', L.some(l => l.includes('Ascolta di nuovo')) && !L.some(l => /Sono \w+ euro/.test(l)));
  t.check('notepad open for la maglietta', (await dbg()).pad.label === 'la maglietta' && await p.isHidden('#builder'));
  t.check('the price was spoken', (await p.evaluate(() => window.__spoken.map(s => s[1]))).some(s => s.includes(NUM[pr.maglietta] + ' euro')));
  await t.shot('l7-05-stall-notepad');
  await write(pr.maglietta);
  L = await t.lines();
  t.check('right: price revealed, Mark got it', L.some(l => l.includes(`Sono ${NUM[pr.maglietta]} euro.`)) && L.some(l => l.includes('Got it.')) && !(await padOpen()));
  t.check('1/3', await objective('Ask the prices for Mark · 1/3'));
  await say(['Grazie', 'Arrivederci']);
  t.check('Teresa says goodbye', (await t.lines()).some(l => l.includes('Arrivederci! Buona giornata!')));
  await t.leave();

  /* ---------- Franco: a wrong number twice ---------- */
  console.log('FRANCO'); await talkTo(...V.franco);
  d = await dbg();
  t.check('Franco reached from the aisle', d.me[1] > V.franco[1] + 30 && Math.hypot(d.me[0] - V.franco[0], d.me[1] - V.franco[1]) < 58);
  await say(['Buongiorno', 'Quanto costa?', 'la cravatta']);                    // the greeting in the same turn counts
  await until(padOpen, 'the notepad');
  t.check('Buongiorno! Quanto costa la cravatta? accepted (no Buongiorno, eh!)', !(await t.lines()).some(l => l.includes('Buongiorno, eh!')) && (await dbg()).pad.label === 'la cravatta');
  const wrong1 = pr.cravatta === 6 ? 16 : pr.cravatta - 1;
  await write(wrong1);
  t.check('wrong: Mark asks to repeat, notepad closed', (await t.lines()).some(l => l.includes('Ask him to repeat')) && !(await padOpen()) && (await hint()).includes('say it again') && !(await hint()).includes('Può ripetere'));
  const before = await p.evaluate(() => window.__spoken.length);
  await say(['Può ripetere?']);
  await until(padOpen, 'the notepad again');
  const again = await p.evaluate(b => window.__spoken.slice(b), before);
  console.log('   repeated:', JSON.stringify(again));
  t.check('repeated slowly (rate 0.7)', again.some(s => s[1].includes(NUM[pr.cravatta]) && s[2] <= 0.7));
  await write(wrong1 + 2 > 20 ? 2 : wrong1 + 2);
  L = await t.lines();
  t.check('second wrong: the text is revealed, notepad stays open', L.some(l => l.includes(`Costa ${NUM[pr.cravatta]} euro.`)) && await padOpen());
  await t.shot('l7-06-revealed');
  await write(pr.cravatta);
  t.check('2/3', await objective('Ask the prices for Mark · 2/3'));
  await t.leave();

  /* ---------- Pina (optional): Non ho capito ---------- */
  console.log('PINA'); await talkTo(...V.pina);
  await say(['Buongiorno', 'Come sta?']); await say(['Sto bene, grazie', 'Quanto costa?', 'il melone']);
  await until(padOpen, 'the notepad');
  /* the notepad hides the bank: answer wrong once, then "Non ho capito." */
  await write(pr.melone === 5 ? 4 : pr.melone + 1);
  await say(['Non ho capito.']);
  await until(padOpen, 'the notepad again');
  L = await t.lines();
  t.check('Non ho capito: said again', L.filter(l => l.includes('Ascolta di nuovo')).length >= 1 && L.some(l => l.includes('Sì, certo!')));
  await write(pr.melone);
  t.check('Pina: written down (optional, still 2/3)', (await dbg()).l7.noted.pina === pr.melone && await objective('Ask the prices for Mark · 2/3'));
  t.check(pr.melone === 1 ? 'Pina: È un euro' : 'Pina: Sono … euro', (await t.lines()).some(l => l.includes(pr.melone === 1 ? 'È un euro.' : `Sono ${NUM[pr.melone]} euro.`)));
  await t.leave();

  /* ---------- Gino: questa for il mazzo (gender hint), then done ---------- */
  console.log('GINO'); await talkTo(...V.gino);
  await say(['Buongiorno', 'Come sta?']); await say(['Sto bene, grazie', 'Quanto costa?', 'questa']);
  await until(padOpen, 'the notepad'); await settle();
  t.check('gender hint: questo for il mazzo', (await hint()).includes('masculine'));
  await write(pr.fiori);
  L = await t.lines();
  t.check('Mark reads his notepad back', L.some(l => l.includes('the shirt it is') && l.includes(`Shirt ${['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'][pr.maglietta]}`)));
  t.check('3/3', await objective('Ask the prices for Mark · 3/3'));
  await t.leave(); await p.waitForTimeout(700);                 // closing the dialog once the price is noted is fine

  /* ---------- complete ---------- */
  t.check('L7 complete modal', await p.isVisible('#modal') && (await p.textContent('.sheet h2')).includes('Lezione 7 completata'));
  t.check('completion lists the notepad', (await p.textContent('.sheet')).includes(`la maglietta · €${pr.maglietta}`));
  await t.shot('l7-07-complete');
  await p.click('.sheet [data-close]'); await p.waitForTimeout(300);
  t.check('L7 objective completed', await objective('Lezione 7 completata'));
  await p.keyboard.press('v'); await p.waitForTimeout(300);
  const dict = await p.textContent('.sheet');
  t.check('dictionary: Numeri and Lezione 7', dict.includes('Numeri 0–20') && dict.includes('Lezione 7 · Al mercato') && dict.includes('Quanto costa?'));
  t.check('dictionary: Lesson 7 Vocabolario words beyond the tiles', dict.includes('Sono … euro.'));
  await p.click('.sheet [data-close]');

  /* ---------- hints never give the answer: scan every hint shown for the stalls' and Bruno's sentences ---------- */
  const norm = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const forbidden = ['Buongiorno! Come sta?', 'Sto bene, grazie.', 'Grazie, arrivederci!', "Scusi, dov'è il mercato?", 'Quanto costa questa?', 'Quanto costa questo?',
    'Quanto costa la maglietta?', 'Quanto costa la cravatta?', 'Quanto costa il mazzo di fiori?', 'Quanto costa il melone?', 'Può ripetere?', 'Non ho capito.'].map(norm);
  const shown = await p.evaluate(() => window.__hintLog);
  const leaks = shown.filter(h => forbidden.some(m => norm(h).includes(m)));
  console.log(`   ${shown.length} hints shown; leaks: ${leaks.join(' | ') || 'none'}`);
  t.check('no hint contains the sentence to say', shown.length > 5 && leaks.length === 0);
  await t.shot('l7-08-market-done');
}, { fakeSpeech: true });
