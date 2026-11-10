/* Lesson 13 · Il treno della notte, played from the skip link to the completion screen (docs/lessons/13-il-treno-della-notte.md),
   with speech faked (harness fakeSpeech). The designer's order: boarding → compartment 17 (the handbook, the word check, the
   practice) → dinner with Margaret (the typed order) → the introductions (you and Margaret) → the Bassis (your day, from the
   quests you did; Lina's questions; prima / dopo; Margaret's "Tell her I saw the church too!"; perché Venezia?) → la signora
   Ferri's translation → the clue beats → Nino's quando → bed. Also the shared train (world/treno.js): the three cars, the
   sliding doors, the knock hook, the compartments, the dawn / lagoon windows, the dogs.
   Run 1: four quests done (Una foto sul ponte, La gelateria, Il tramonto sul ponte, Musica in piazza): the platform, the
   corridor (Scusi, then Permesso past il signor Rinaldi), a knock on 14, compartment 17: the handbook there (no answer given
   away by the cards), the word check (≤ 50, one missed on purpose), the practice (12: prima / dopo / anche); the dinner call; Nino
   (no greeting: a tip), Margaret, the order typed for her (per lui → feedback), served (Nino's scrap: a clue); Margaret asks you to
   introduce her; the introductions: Lina (name, then Lei è Margaret, then È inglese, di Londra, Non parla italiano), la signora
   Ferri (all in one turn), il signor Rinaldi (ciao: a tip; Le presento Margaret; No, non parla italiano); the Bassis: the bank
   from the quests done (no cheese), mangiato il tramonto (laughter), hai (feedback), Prima di ballare, ho mangiato un gelato
   (Ernesto: E dopo?), Dopo, ho ballato in piazza, Lina's question about the sunset (Sì alone: answered, a tip), three things told:
   Margaret's interjection (Margaret ho…: feedback; Anche Margaret ha visto la chiesa), then Ernesto's question about a quest not done
   (its thing and non in the bank; no answer ×3: not asked again, ma on the 3rd hint; No, ma ho fatto una foto sul ponte), perché
   alone, Perché mi piace l'arte (Margaret: ask
   them why), E Lei, perché Venezia?; la signora Ferri calls you both over: the typed translation (a wrong pick, mi chiamo →
   feedback, Si chiama Biscuit, the children love dogs (the clue), amano → feedback, Anche Biscuit ama i bambini!); the beats
   (the children, Gianni's parcel, Biscuit at the hatch); bedtime (the bunk's reminder, Nino's quando), bed, the completion screen.
   No hint contains a model sentence.
   No history (no quests done) and the shared train: tests/l13-day.js. Screenshots to review/l13/ and review/l13-rework/. */
const { play } = require('./lib/harness');
const path = require('path'), fs = require('fs');
const REVIEW = path.resolve(__dirname, '..', 'review', 'l13');
const RW = path.resolve(__dirname, '..', 'review', 'l13-rework');
fs.mkdirSync(REVIEW, { recursive:true }); fs.mkdirSync(RW, { recursive:true });

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
  await p.evaluate(() => { window.__hintLog = []; });

  /* ---------- the platform ---------- */
  await t.jump(13);
  const qs = await p.evaluate(() => { ['foto', 'gelateria', 'tramonto', 'musica'].forEach(id => __debug.questDone(id)); return __dbg().l13.quests; });
  console.log('   quests done: ' + qs.join(', '));
  let d = await dbg();
  t.check('Lezione 13 starts on the night platform (l13-board, night, the train on binario 3, the clock 23:12)', d.lesson === 13 && d.tut === 'l13-board' && d.scene === 'stazione'
    && d.night.daytime === 'night' && d.stazione.train.on && d.quests.clock === '23:12');
  t.check('the board: 23:15 Venezia S. Lucia, binario 3', d.stazione.board.some(r => r.startsWith('23:15 Venezia S. Lucia 3')));
  t.check('the ticket in the bag says carriage 5, compartment 17', d.quests.bag.some(b => b.id === 'biglietto' && /cabina 17/.test(b.note)));
  await shot('01-platform');
  await talkAt(630, 196, { x:0, y:-1 });
  t.check('the conductor: carrozza cinque, prego, salga', await has('carrozza cinque'));
  await leave();
  await p.evaluate(() => __debug.place(620, 238, { x:-1, y:0 })); await p.waitForTimeout(200);
  t.check('E at the train door: Sali', (await dbg()).stazione.near === 'treno');
  await press('e');
  await until(async () => (await dbg()).scene === 'treno', 'on board', 15000);
  await p.waitForTimeout(2600);
  await until(async () => !(await dbg()).cut.on, 'the departure', 10000);
  d = await dbg();
  t.check('on board: the sleeping car (car letto), the corridor phase, the train moving, the night sky, 23:15', d.treno.car === 'letto' && d.l13.phase === 'corridor' && d.treno.moving && d.treno.sky === 'night' && d.quests.clock === '23:15');
  await shot('02-boarding-vestibule');

  /* ---------- the corridor: il signor Rinaldi on the phone ---------- */
  t.check('Rinaldi blocks the corridor (a crowd member, by door 12)', d.npcs.rinaldi && d.npcs.rinaldi[0] === 305);
  await p.evaluate(() => __debug.place(200, 220, { x:1, y:0 }));
  await p.keyboard.down('ArrowRight'); await until(async () => !!(await dbg()).crowd.pick, 'the Permesso pick', 6000); await p.keyboard.up('ArrowRight');
  d = await dbg();
  t.check('bumping into him opens the pick (Permesso / Scusi / Prego)', d.crowd.pick && d.crowd.pick.npc === 'rinaldi');
  await shot('03-corridor-permesso');
  await press('2');
  await p.waitForTimeout(1700);
  t.check('Scusi: he turns round but stays; the hint never says the word', (await dbg()).npcs.rinaldi && !/permesso/i.test((await dbg()).crowd.hint ? (await dbg()).crowd.hint.html : ''));
  await p.evaluate(() => __debug.place(250, 220, { x:1, y:0 }));
  await p.keyboard.down('ArrowRight'); await until(async () => !!(await dbg()).crowd.pick, 'the pick again', 6000); await p.keyboard.up('ArrowRight');
  await press('1');
  await until(async () => (await l13()).rinaldiIn, 'Rinaldi steps into 12', 8000);
  d = await dbg();
  t.check('Permesso!: he steps into compartment 12 and the corridor is free', d.l13.rinaldiIn && !d.npcs.rinaldi && d.l13.permesso === 1 && d.crowd.said.some(s => s[1] === 'Permesso!'));
  /* a knock on 14: nobody (the Bassis are at dinner) */
  await p.evaluate(() => __debug.place(525, 236, { x:0, y:1 })); await p.waitForTimeout(200);
  t.check('at door 14: Bussa', (await dbg()).treno.near === 'comp:14');
  await press('e'); await p.waitForTimeout(1500);
  t.check('the knock hook: Toc toc!, nobody answers', (await dbg()).treno.knocks.includes(14) && (await dbg()).crowd.said.some(s => s[1] === 'Toc toc!'));

  /* ---------- compartment 17: the handbook first ---------- */
  await p.evaluate(() => __debug.place(855, 236, { x:0, y:1 })); await p.waitForTimeout(200);
  t.check('at door 17 (yours): Entra', (await dbg()).treno.near === 'comp:17');
  await press('e');
  await until(async () => (await dbg()).scene === 'cabina17', 'compartment 17', 10000);
  await until(async () => (await dbg()).tut === 'l13-handbook', 'the handbook', 10000);
  await until(async () => !(await dbg()).cut.on, 'settling in', 15000);
  d = await dbg();
  t.check('compartment 17: the ticket put away, l13-handbook (the past before dinner)', d.tut === 'l13-handbook' && !d.quests.bag.some(b => b.id === 'biglietto') && /handbook/i.test(await p.textContent('#objective')));
  await shot('04-compartment-17');
  /* the bunk: not yet */
  await p.evaluate(() => __debug.place(440, 330, { x:-1, y:0 })); await p.waitForTimeout(200); await press('e'); await p.waitForTimeout(400);
  t.check('the bunk before the handbook: not yet', (await dbg()).tut === 'l13-handbook' && !(await dbg()).cut.on);
  await press('h'); await p.waitForTimeout(800);
  d = await dbg();
  t.check('the handbook opens at Lezione 13, in the compartment (l13-vocab)', d.handbook.open && d.handbook.lesson === 13 && d.scene === 'cabina17' && d.tut === 'l13-vocab');
  { const ok = await p.evaluate(() => { const b = [...document.querySelectorAll('.sheet p')].find(x => /^Prima, dopo/.test(x.textContent.trim())); if (b) b.scrollIntoView({ block:'start' }); return !!b && ['prima', 'prima di', 'dopo'].every(w => b.nextElementSibling && b.nextElementSibling.textContent.includes(w)); });
    await p.waitForTimeout(300);
    t.check('How it works: Prima, dopo (prima, prima di + a verb, dopo) and anche', ok && /Anche/.test(await p.textContent('.sheet')));
    await rshot('01-compartment-handbook'); }
  { const txt = await p.textContent('.sheet');
    t.check('the chapter no longer teaches per lei; the joining words are still there', !/per lei/i.test(txt) && /Joining words/.test(txt) && /quando/.test(txt)); }
  /* the review never gives an answer away: no card's English names its infinitive; the rule items use verbs not on the cards */
  const cards = await p.evaluate(() => __dbg().words.total);
  const vocab = await p.evaluate(() => { const L = __debug.l13Data(); return { words:L.vocab.flatMap(g => g.words), ex:L.ex, how:L.how }; });
  {
    const bad = vocab.words.filter(w => /\((vedere|prendere|fare|accendere|mangiare|assaggiare|comprare|aiutare|portare|ballare|bere|sentire|dormire|parlare)\)/.test(w.en));
    t.check(`no card's English gives the participle away (no infinitive in brackets): ${bad.map(w => w.it).join(', ') || 'none'}`, !bad.length);
    const ruleVerbs = vocab.ex.map(e => /^(\w+) \(to \w+\) → \?$/.exec(e.q)).filter(Boolean).map(m => m[1]);
    t.check(`the practice's rule items use verbs not on the cards or in How it works (${ruleVerbs.join(', ')})`, ruleVerbs.length >= 2 && ruleVerbs.every(v => !vocab.how.includes(v) && !vocab.words.some(w => (w.note || '').includes(v) || w.it.includes(v.slice(0, -3)))));
  }
  const wc = await t.wordCheck({ wrong:true });
  const listed = vocab.words.length;
  t.check(`word check: ${cards} cards, ${listed} words listed (≤ 50), one missed on purpose came back`, cards <= 50 && listed <= 50 && cards >= 30 && wc.cameBack);
  t.check('words passed: l13-practice', (await dbg()).tut === 'l13-practice');
  const nEx = vocab.ex.length;
  t.check(`practice: ${nEx} questions (10–12)`, nEx >= 10 && nEx <= 12);
  await t.practice([['o', 0], ['o', 0], ['o', 2], ['o', 0], ['t', ['Prima', 'ho visto la basilica', 'poi', 'ho mangiato un gelato']], ['o', 0], ['o', 0],
    ['t', ['Anche', 'Margaret', 'ha visto', 'la chiesa']], ['o', 1], ['t', ['Perché', 'è', 'bellissima']], ['o', 0], ['o', 1]]);
  t.check('the dinner call (a cutscene): Signori, la cena è servita', await until(async () => { const c = (await dbg()).cut; return c.id === 'l13-dinnercall' && /la cena è servita/.test(c.guide || ''); }, 'the dinner call', 8000));
  await until(async () => !(await dbg()).cut.on, 'the dinner call', 20000);
  d = await dbg();
  t.check('practice done in the compartment: the dinner call (l13-dinner, arrive, 23:45)', d.tut === 'l13-dinner' && d.l13.phase === 'arrive' && d.quests.clock === '23:45' && d.scene === 'cabina17');
  await p.evaluate(() => __debug.place(480, 512, { x:0, y:1 })); await p.waitForTimeout(200);
  await press('e');
  await until(async () => (await dbg()).scene === 'treno', 'back in the corridor', 8000); await p.waitForTimeout(1800);
  t.check('out into the corridor, at door 17', Math.abs((await dbg()).me[0] - 855) < 4);

  /* ---------- the dining car: Nino, Margaret, the order ---------- */
  await p.evaluate(() => __debug.place(1040, 220, { x:1, y:0 }));
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(500); await p.keyboard.up('ArrowRight');
  await until(async () => (await dbg()).treno.slide.some(v => v > 0.3), 'the sliding doors', 4000);
  t.check('at the gangway: the sliding doors open (slide > 0)', (await dbg()).treno.slide.some(v => v > 0.3));
  await p.evaluate(() => __debug.place(1140, 236, { x:1, y:0 }));
  await until(async () => await p.isVisible('#dialog'), 'Nino comes', 15000);
  await p.waitForTimeout(800); await settle(); await t.dump();
  t.check('Nino: il Suo nome, per la prenotazione?', await has('Il Suo nome, per la prenotazione?'));
  await say(['Mi chiamo Sam']);
  t.check('Nino: cabina diciassette; a tip about greeting first', await has('Cabina diciassette') && /greeting him first/.test(await hint()));
  await choose('Follow Nino');
  await until(async () => (await l13()).phase === 'meet' && await p.isVisible('#dialog'), 'seated, Margaret', 15000);
  await p.waitForTimeout(600); await settle(); await t.dump();
  t.check('seated with Margaret (English, on her side): Biscuit, from London', await has('Biscuit') && await has('from London') && await p.evaluate(() => !!document.querySelector('.line.npc.english')));
  await choose('“Nice to meet you, Margaret!”');
  await choose('“Of course!”');
  await leave();
  await until(async () => (await l13()).phase === 'order' && await p.isVisible('#dialog'), 'Nino with the menu', 20000);
  await p.waitForTimeout(800); await settle(); await t.dump();
  t.check('Nino comes with the menu at once (the menu card); Margaret (companion) asks', await p.isVisible('.l13-menu') && await has('Ecco il menù'));
  await shot('06-menu-margaret');
  await choose('A fish soup.');
  t.check('a wrong pick: Margaret doubts it, the line again', await has('Hmm, really?'));
  await choose('The fish of the day.');
  await choose('Risotto with mushrooms.');
  await type('per lui il risotto ai funghi');
  t.check('per lui → Margaret is a woman (feedback, not the sentence)', /per lei<\/b>?, not per lui|per lei, not per lui/.test(await hint()));
  await type('per lei il risotto ai funghi');
  t.check('Nino: il risotto ai funghi per la signora', await has('per la signora'));
  await type('per me il pollo arrosto');
  t.check('my own dish: il pollo arrosto per Lei; the order saved', await has('Il pollo arrosto per Lei') && (await l13()).ordered.me === 'pollo');
  await shot('07-order-typed');
  await p.waitForTimeout(500);
  await leave();
  await until(async () => (await l13()).served, 'dinner is served', 15000);
  await until(async () => (await l13()).beats.scrap, 'Nino and Biscuit', 20000);
  d = await dbg();
  t.check('served; the clue: Nino gives Biscuit a scrap', d.l13.served && d.crowd.said.some(s => s[0] === 'nino' && /Solo questa volta/.test(s[1])) && d.l13.seen.includes('nino-pollo'));
  await shot('08-clue-scrap');
  await until(async () => (await l13()).phase === 'intro' && await p.isVisible('#dialog'), 'Margaret: introduce me', 20000);
  await p.waitForTimeout(600); await settle(); await t.dump();
  t.check('after dinner, Margaret: go round and tell them who I am (l13-dinner, intro)', await has('tell them who I am') && (await dbg()).tut === 'l13-dinner');
  await choose('“Of course! Leave it to me.”');
  await leave();
  t.check('the objective: introduce yourself and Margaret 0/3', /Introduce yourself and Margaret · 0\/3/.test(await p.textContent('#objective')));

  /* ---------- the introductions: you and Margaret ---------- */
  await talkAt(1444, 262, { x:0, y:-1 });
  { const tl = await bankTiles();
    t.check('the intro bank: Lei è, Margaret, È inglese, di Londra, Non parla italiano', ['Lei è', 'Margaret', 'È inglese', 'di Londra', 'Non parla italiano'].every(w => tl.includes(w))); }
  await say(['Buonasera', 'Mi chiamo Sam']);
  t.check("Lina: Io sono Lina… Ernesto: cinquant'anni; then: E la signora, chi è?", await has('Io sono Lina') && await has("Cinquant'anni") && await has('E la signora, chi è?'));
  await say(['Lei è', 'Margaret']);
  t.check("“Lei è Margaret.”: Piacere, signora Margaret! Di dov'è, signora?; Margaret (on your side): answer for me", await me('Lei è Margaret.') && await has('Piacere, signora Margaret!') && await margSays('answer for me'));
  await say(['È inglese', 'di Londra', 'Non parla italiano']);
  t.check('“È inglese, di Londra. Non parla italiano.”: Di Londra! …; non parla italiano? hello!; met the Bassis 1/3', await me('È inglese, di Londra. Non parla italiano.') && await has('Di Londra! Ernesto, Londra!')
    && await has('Non parla italiano? Non importa') && (await l13()).met.bassi);
  await showLine('Lei è Margaret'); await rshot('02-introductions-margaret');
  await leave();
  await talkAt(1176, 444, { x:0, y:1 });
  await say(['Buonasera', 'Mi chiamo Sam', 'Questa è', 'Margaret', 'È inglese']);
  t.check('la signora Ferri, all in one turn (name, Questa è Margaret, È inglese): her name, Inglese? … Milano; met (2/3)', await me('Mi chiamo Sam. Questa è Margaret. È inglese.') && await has('la signora Ferri') && await has('Io sono di Milano') && (await l13()).met.ferri);
  await leave();
  await talkAt(1336, 444, { x:0, y:1 });
  await say(['Ciao', 'Mi chiamo Sam']);
  t.check('Rinaldi: Rinaldi, piacere; a tip: buonasera, not ciao', await has('Rinaldi, piacere') && /buonasera,? not ciao/i.test(await hint()));
  await say(['Le presento', 'Margaret']);
  t.check('Le presento Margaret: Parla italiano, la signora?', await has('Parla italiano, la signora?'));
  await say(['No', 'Non parla italiano']);
  t.check('No, non parla italiano: Peccato; met Rinaldi (3/3)', await has('Ah. Peccato.') && (await l13()).met.rinaldi);
  await leave();
  await until(async () => (await dbg()).tut === 'l13-day', 'the Bassis call', 8000);
  d = await dbg();
  t.check('everyone met: l13-day (the Bassis), the marker on Lina', d.tut === 'l13-day' && d.l13.phase === 'bassi' && d.l13.stage === 'tell');

  /* ---------- the Bassis: your day, from the quests ---------- */
  await talkAt(1444, 262, { x:0, y:-1 });
  d = await dbg();
  { const tl = await bankTiles();
    t.check(`the day bank comes from the quests done (${d.l13.dayItems.join(', ')}): una foto, un gelato, il tramonto, in piazza, sul ponte; no cheese`, !d.l13.free && ['una foto', 'un gelato', 'il tramonto', 'in piazza', 'sul ponte', 'il biglietto'].every(w => tl.includes(w))
      && !tl.includes('il formaggio') && !tl.includes('una candela'));
    t.check('Parole: poi, prima, dopo, ma, perché, quando; Prima di…: prima di, partire, ballare', ['poi', 'prima', 'dopo', 'ma', 'perché', 'quando', 'prima di', 'partire', 'ballare'].every(w => tl.includes(w))); }
  t.check('Lina: E Lei, cosa ha fatto oggi a Padova?', await has('cosa ha fatto oggi a Padova'));
  await say(['Buonasera', 'Ho', 'mangiato', 'il tramonto']);
  t.check('mangiato il tramonto: laughter, and a hint about the participle (not the answer)', await has('mangiato il tramonto?!') && /Which participle goes with/.test(await hint()));
  await say(['Hai', 'visto', 'il tramonto']);
  t.check('hai visto: Io? No… Lei!; feedback on hai', await has('Lei!') && /hai is/.test(await hint()));
  await say(['Cosa ha fatto oggi?']);
  t.check('asked back: abbiamo visto la Cappella degli Scrovegni; Ernesto: ho dormito', await has('Abbiamo visto la Cappella') && await has('ho dormito'));
  await say(['prima di', 'ballare', 'Ho', 'mangiato', 'un gelato']);
  d = await dbg();
  t.check('“Prima di ballare, ho mangiato un gelato.”: the ice cream reply, Prima di ballare! (the reply follows), Ernesto: E dopo?', await me('Prima di ballare, ho mangiato un gelato.') && await has('Io adoro il pistacchio')
    && await has('Prima di ballare! Per avere energia') && await has('E dopo? Cosa ha fatto dopo?') && d.l13.stage === 'dopo');
  await say(['dopo', 'Ho', 'ballato', 'in piazza']);
  d = await dbg();
  t.check('“Dopo, ho ballato in piazza.”: Ha ballato in piazza?…; Lina asks about the sunset (a quest done)', await me('Dopo, ho ballato in piazza.') && await has("cinquant'anni fa") && d.l13.stage === 'yes' && d.l13.qYes === 'tramonto' && await has('Ha visto il tramonto sul ponte?'));
  await showLine('Ha visto il tramonto sul ponte?'); await rshot('03-lina-quest-question');
  await say(['Sì']);
  d = await dbg();
  t.check('"Sì" alone answers her: Sì? Il tramonto! Che romantico! (a tip: a whole sentence next time); three things told, so Lina mentions the basilica and Margaret chimes in', await has('Sì? Il tramonto! Che romantico!')
    && d.l13.yes === 'done' && d.l13.told.bassi.length === 3 && d.l13.stage === 'anche' && await has('e la basilica del Santo') && /whole sentence/.test(await hint()));
  t.check('Margaret chips in (English, on your side): Tell them I saw the church too!', await margSays('I saw the church too!'));
  { const tl = await bankTiles(); t.check('the Margaret group: Anche, Margaret, la chiesa, la basilica', ['Anche', 'Margaret', 'la chiesa', 'la basilica'].every(w => tl.includes(w))); }
  await showLine('I saw the church too'); await rshot('04-margaret-interjection');
  await say(['Margaret', 'Ho', 'visto', 'la chiesa']);
  t.check('“Margaret ho visto la chiesa”: feedback on ho (she), not done', /ho<?\/?b?>? is I/.test(await hint()) && (await l13()).anche === 'asked');
  await say(['Anche', 'Margaret', 'Ha', 'visto', 'la chiesa']);
  d = await dbg();
  t.check(`“Anche Margaret ha visto la chiesa.”: Anche la signora! Brava!; Margaret: she's beaming; then Ernesto's question about a quest not done (${d.l13.qNo})`, await me('Anche Margaret ha visto la chiesa.') && await has('Anche la signora!') && await margSays('beaming')
    && d.l13.anche === 'done' && d.l13.stage === 'ma' && d.l13.qNo && d.l13.qNo !== 'tramonto' && !d.l13.dayItems.includes(d.l13.qNo));
  { const tl = await bankTiles(), asked = (await p.evaluate(k => __debug.l13Data().items.find(x => x.key === k), d.l13.qNo));
    t.check(`its thing (${asked.label}) and the word non are in the bank, to say No, non ho …`, tl.includes(asked.label) && tl.includes('non')); }
  const noMa = [];
  for (let i = 0; i < 3; i++){ await say(['Buonasera']); noMa.push(await hint()); }
  t.check('no answer (Buonasera): Allora…? (the question is not asked again)', await has('Allora…?') && (await l13()).ma === 'asked' && (await t.lines()).filter(l => l.includes(d.l13.qNo === 'chapel' ? 'Cappella degli Scrovegni' : '?') ).length >= 1);
  t.check(`the hint points at the word for "but" without giving it, until the third failed try (${noMa.map(h => /\bma\b/.test(h) ? 'ma' : '-').join(' ')})`,
    /word for but/.test(noMa[0].replace(/<[^>]+>/g, '')) && !/\bma\b/i.test(noMa[0]) && !/\bma\b/i.test(noMa[1]) && /\bma\b/.test(noMa[2]));
  await say(['No', 'ma', 'Ho', 'fatto', 'una foto', 'sul ponte']);
  d = await dbg();
  t.check('“No, ma ho fatto una foto sul ponte.”: Peccato!, the photo reply; ma done; Ernesto: E perché Venezia?', await me('No, ma ho fatto una foto sul ponte.') && await has('Peccato!') && await has('Noi non abbiamo fatto foto')
    && d.l13.ma === 'done' && d.l13.why === 'asked' && await has('E perché Venezia'));
  await say(['perché']);
  const whyHint = await hint();
  t.check('"Perché" alone: Perché…?; the hint asks for a reason, without the word itself', await has('Perché…?') && /word for because/.test(whyHint.replace(/<[^>]+>/g, '')) && !/perché/i.test(whyHint));
  await say(['perché', "mi piace l'arte"]);
  d = await dbg();
  t.check('“Perché mi piace l\'arte!”: the reply follows the reason (Tiziano, i Frari); why done; Margaret: ask them why', await me("Perché mi piace l'arte!") && await has('lui adora Tiziano') && await has('i Frari')
    && d.l13.why === 'done' && d.l13.reason === 'arte' && await has('You told Lina and Ernesto about your day') && await margSays('Ask them why'));
  await say(['E Lei, perché Venezia?']);
  t.check('the question back: their 50th anniversary; Margaret: fifty years!; E domani, Venezia!', await has("Per il nostro anniversario: cinquant'anni!") && await margSays('Fifty years') && await has('E domani, Venezia!') && (await l13()).askedBack);
  await leave();

  /* ---------- la signora Ferri: a translation for Margaret ---------- */
  await until(async () => (await l13()).ferri === 'talk' && await p.isVisible('#dialog'), 'la signora Ferri calls you over', 25000);
  await p.waitForTimeout(800); await settle(); await t.dump();
  d = await dbg();
  t.check('la signora Ferri calls you both over: Margaret sits at her table; È carino! Come si chiama?; Margaret asks what she says', d.l13.phase === 'ferri' && d.l13.margAt === 'ferri' && Math.abs(d.npcs.margaret[0] - 1284) < 4
    && await has('È carino! Come si chiama?') && await margSays('What is she saying'));
  await choose('She asks if he bites.');
  t.check('a wrong pick: Margaret doubts it; the line again, slowly', await margSays('Bites?'));
  await choose('She says Biscuit is cute, and asks his name.');
  await type('mi chiamo Biscuit');
  t.check('mi chiamo → feedback (that is my name), not the sentence', /my<?\/?i?>? name/.test(await hint()) && !/si chiama biscuit/i.test(await hint()));
  await type('si chiama Biscuit');
  d = await dbg();
  t.check('“Si chiama Biscuit.”: I miei bambini amano i cani. Vogliono sempre un cane! (the clue)', await has('I miei bambini amano i cani') && d.l13.seen.includes('ferri-vogliono') && d.l13.beats.ferriDog);
  await rshot('05-ferri-translation');
  await choose('Her children love dogs: they always want one.');
  await type('Biscuit amano i bambini');
  t.check('amano → feedback: they love; Biscuit is one dog', /they<?\/?i?>? love/.test(await hint()));
  await type('anche Biscuit ama i bambini');
  t.check('“Anche Biscuit ama i bambini!”: the children are finally asleep…', await has('finalmente, dormono'));
  await leave();
  await until(async () => (await l13()).margAt === null && (await l13()).phase === 'beats', 'Margaret back at her table', 15000);
  d = await dbg();
  t.check('Margaret back at her table (N1 west)', Math.abs(d.npcs.margaret[0] - 1176) < 4 && Math.abs(d.npcs.margaret[1] - 212) < 4);
  await until(async () => (await l13()).beats.kids, 'the children peek in', 20000);
  await p.waitForTimeout(1600);
  await shot('11-clue-kids');
  await until(async () => (await dbg()).crowd.said.some(s => s[0] === 'nino' && /pacchetto/.test(s[1])), 'Gianni\'s parcel', 40000);
  await p.waitForTimeout(1500);
  await shot('12-clue-gianni-parcel');
  await until(async () => (await dbg()).tut === 'l13-night', 'bedtime', 60000);
  d = await dbg();
  t.check('the beats: kids, ferriDog, gianni, beg, phone; Biscuit at the hatch; Gianni gone', ['kids', 'ferriDog', 'gianni', 'beg', 'phone'].every(k => d.l13.beats[k]) && !d.npcs.gianni
    && Math.abs(d.treno.dogs.biscuit.at[0] - 1868) < 6);
  await until(async () => (await l13()).ferriBed, 'everyone to bed', 50000);
  { const seen = (await l13()).seen;
    t.check(`Lesson 14's notebook ids in S.l13.seen: the six clues of the evening (${seen.join(', ')})`, ['nino-pollo', 'ferri-vogliono', 'bambini-guardano', 'gianni-avanzi', 'biscuit-cucina', 'bassi-letto'].every(k => seen.includes(k))); }
  d = await dbg();
  t.check('at bedtime: the Bassis in 14, la signora Ferri in 16, Margaret at her table', !d.npcs.lina && !d.npcs.ferri && Math.abs(d.npcs.margaret[0] - 1176) < 4);
  await shot('13-night-dining-car');

  /* ---------- bedtime: quando? ---------- */
  t.check('bedtime: the objective sends you to Nino first (when does the train get to Venice?)', /Ask Nino when/.test(await p.textContent('#objective')) && !d.l13.askedWhen);
  await p.evaluate(() => __debug.place(855, 236, { x:0, y:1 })); await p.waitForTimeout(300);
  await press('e');
  await until(async () => (await dbg()).scene === 'cabina17', 'compartment 17', 10000); await p.waitForTimeout(1800);
  await p.evaluate(() => __debug.place(440, 330, { x:-1, y:0 })); await p.waitForTimeout(200);
  await press('e'); await p.waitForTimeout(600);
  d = await dbg();
  t.check('the bunk before asking: a reminder (Nino will know), still l13-night', d.tut === 'l13-night' && d.l13.nudgedWhen && !d.cut.on);
  await p.evaluate(() => __debug.place(480, 512, { x:0, y:1 })); await p.waitForTimeout(200);
  await press('e');
  await until(async () => (await dbg()).scene === 'treno', 'back in the corridor', 8000); await p.waitForTimeout(1500);
  await talkAt(1806, 420, { x:1, y:0 });
  { const tl = await bankTiles();
    t.check('Nino: È tardi, eh? Mi dica!; the tiles: quando, arriviamo, a Venezia', await has('Mi dica!') && ['quando', 'arriviamo', 'a Venezia'].every(w => tl.includes(w))); }
  await say(['arriviamo', 'a Venezia']);
  const whenHint = await hint();
  t.check('"Arriviamo a Venezia." (no question word): Nino: domani, Venezia!; the hint asks for "when" without the word', await has('domani, Venezia') && /when/.test(whenHint) && !/quando/i.test(whenHint) && !(await l13()).askedWhen);
  await say(['quando', 'arriviamo', 'a Venezia']);
  await p.waitForSelector('#choices:not([hidden])', { timeout:12000 });
  d = await dbg();
  t.check('"Quando arriviamo a Venezia?": his answer is a listening line (hidden); S.l13.askedWhen, arrive 7:30', await me('Quando arriviamo a Venezia?') && d.l13.askedWhen && d.l13.arrive === '7:30'
    && await p.evaluate(() => !!document.querySelector('.line.listen .listen-btn')));
  await choose('Tomorrow morning, at 6:30');
  t.check('a wrong time: Hmm… really? (said again, slowly)', await has('really?'));
  await choose('Tomorrow morning, at 7:30');
  t.check('the right time: revealed (alle sette e mezza); Venice at 7:30', await has('alle sette e mezza') && await has('Venice tomorrow at') && (await l13()).heardWhen);
  await leave();

  /* ---------- bed ---------- */
  await p.evaluate(() => __debug.place(855, 236, { x:0, y:1 })); await p.waitForTimeout(300);
  await press('e');
  await until(async () => (await dbg()).scene === 'cabina17', 'compartment 17', 10000); await p.waitForTimeout(1800);
  await p.evaluate(() => __debug.place(440, 330, { x:-1, y:0 })); await p.waitForTimeout(200);
  t.check('at the bunk: Dormi', (await dbg()).treno.near === 'cabina-letto');
  await shot('14-compartment-bedtime');
  await press('e');
  await until(async () => (await dbg()).crowd.said.some(s => s[0] === 'player' && s[1] === 'Buonanotte!'), 'Buonanotte', 8000);
  await until(async () => (await dbg()).tut === 'l13-done', 'asleep', 15000);
  await p.waitForTimeout(800);
  { const sheet = await p.textContent('.sheet');
    t.check('the completion screen: Lezione 13 completata, your day in Italian (the sentences as said)', await p.isVisible('.sheet') && /Lezione 13 completata/.test(sheet)
      && /Prima di ballare, ho mangiato un gelato/.test(sheet) && /Anche Margaret ha visto la chiesa/.test(sheet)); }
  await shot('15-complete');
  const hints = await p.evaluate(() => window.__hintLog || []);
  const models = ['Per lei, il risotto ai funghi', 'Per me, il pollo arrosto', 'Ho visto il', 'Ho mangiato un', 'Ho ballato in', 'Ho fatto una foto', 'Mi chiamo Sam', 'Lei è Margaret', 'Le presento Margaret', 'È inglese, di',
    'No, ma ho', 'ma ho visto', 'Anche Margaret ha', 'Perché è bellissima', 'Perché mi piace', "Perché c'è", 'Quando arriviamo', 'Si chiama Biscuit', 'Anche Biscuit ama', 'Prima di ballare,', 'Dopo, ho'];
  const bad = hints.filter(h => models.some(m => h.toLowerCase().includes(m.toLowerCase())));
  t.check(`no hint gives the Italian answer (${hints.length} hints)`, !bad.length);
  if (bad.length) console.log('   ✗ ' + bad.join(' | '));

}, { fakeSpeech:true, viewport:{ width:1280, height:720 } });
