/* Lesson 15 · Venezia, played through the real UI from the skip link to the unit-completion screen and free play
   (docs/lessons/15-venezia.md), with speech faked (harness fakeSpeech).
   Venezia Santa Lucia: Margaret (English) asks to tag along; she follows with Biscuit. The information desk: the greeting and your
   name, Margaret's "ask about the boat", the half-English tile ("Dov'è… the boat… per San Marco?" → "La barca? Ah, il vaporetto!"),
   the handbook; the word check (one miss that comes back) and the practice (12). The desk again: "Dov'è la fermata del
   vaporetto?" → "Per dove?" → "per San Marco" → the way; Margaret's pick (a wrong answer first). Outside: the travellers with
   suitcases (Scusi → a hint; Permesso → they move). The ACTV booth: one ticket ("E la signora?"), "due biglietto" (the plural
   nudge, never the answer), two tickets → the price heard → the notepad (9 → "one ticket"; 19); the next boat → the time on the
   notepad (a wrong time with feedback that never gives it; 9:10); the dog → "il cane non paga…" → Margaret's pick; the goodbye.
   The station bar: an order before asking (Margaret: ask first), "Che cornetti avete?" → Margaret's pick → her choice; both orders in
   one sentence, the wrong filling for her (the barista says both back, Margaret objects to hers), "No, per lei un cornetto …" (only hers
   changes), Sì → the price on the notepad; the goodbye (the bar's every variant: tests/l15-bar.js). The bench: il signor Bepi comes
   along: Sì, certo; your name, then Margaret; the train (a bare "Sì" first); "Mi è piaciuto molto"; two Padova questions (a yes, and
   "No, ma ho…"); the comparative (bello → the agreement feedback); Margaret's news (Biscuit found a family); "Grazie" then "Sto
   imparando"; the horn; the goodbye. The tour group at the gate (Permesso), the two tickets on the readers, the voyage (boarding, the
   Grand Canal, the Rialto, San Marco), the unit-completion screen; Free play: the piazza, the quests open, fast travel, Margaret gone;
   a save loads into free play. Every hint shown is logged: none gives a model sentence. Screenshots: review/l15/*.jpg */
const { play } = require('./lib/harness');
const path = require('path'), fs = require('fs');
const REVIEW = path.resolve(__dirname, '..', 'review', 'l15');
fs.mkdirSync(REVIEW, { recursive:true });

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const has = async s => (await t.lines()).some(l => l.includes(s));
  const settle = async (quiet = 900, max = 25000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#choices').hidden ? 0 : 20000) + (document.querySelector('#npad') ? 50000 : 0) + (document.querySelector('#l15Time') ? 90000 : 0), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const say = async labels => { await p.waitForSelector('#builder:not([hidden])', { timeout:12000 }); for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(250); };
  const shot = async name => { await p.waitForTimeout(250); await p.screenshot({ path:path.join(REVIEW, name + '.jpg'), type:'jpeg', quality:74 }); console.log('   shot', name); };
  const hint = async () => p.$eval('#hint', h => h.hidden ? '' : h.innerText.replace(/\s+/g, ' '));
  const leave = async () => { await t.leave(); await p.waitForTimeout(300); };
  const place = async (x, y, face) => { await p.evaluate(([x, y, f]) => __debug.place(x, y, f), [x, y, face || { x:0, y:-1 }]); await p.waitForTimeout(250); };
  const talkAt = async (x, y, face) => { await place(x, y, face); await press('e');
    await p.waitForSelector('#dialog:not([hidden])', { timeout:12000 }); await p.waitForTimeout(600); await settle(); await t.dump(); };
  const choose = async label => { await p.waitForSelector('#choices:not([hidden])', { timeout:12000 }); await p.click(`#choices button >> text="${label}"`); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const tiles = async () => p.$$eval('#bank .tile', ts => ts.map(x => x.textContent.trim()));
  const companionHas = async s => p.evaluate(s => [...document.querySelectorAll('.line.companion')].some(l => l.textContent.includes(s)), s);
  const door = async (x, y, face, scene) => { await place(x, y, face); await press('e');
    if (!await until(async () => (await dbg()).scene === scene, scene, 8000)){ const x = await dbg(); console.log('   ' + JSON.stringify({ me:x.me, near:x.venezia.near, cut:x.cut.on, pick:x.crowd.pick, dlg:await p.isVisible('#dialog'), modal:await p.isVisible('#modal'), focus:await p.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName)) })); }
    await p.waitForTimeout(1900); };
  const pickRight = async (rightStart, wrongStart) => {
    await p.waitForSelector('#choices:not([hidden]) button.english', { timeout:12000 });
    if (wrongStart){ await p.click(`#choices button.english >> text=/^${wrongStart}/`); await p.waitForTimeout(500); await settle(); await t.dump(); }
    await p.click(`#choices button.english >> text=/^${rightStart}/`); await p.waitForTimeout(800); await settle(); await t.dump();
  };
  await p.evaluate(() => { window.__hintLog = []; });

  /* ---------- 1 · Venezia Santa Lucia: Margaret ---------- */
  await t.jump(15);
  let d = await dbg();
  t.check('Lezione 15 starts on the platform at Venezia Santa Lucia, in the morning, 8:40', d.lesson === 15 && d.tut === 'l15-start' && d.scene === 'santalucia' && d.l15.time === '8:40' && d.night.daytime === 'morning');
  t.check('Margaret and Biscuit are on the platform; she does not follow yet; fast travel is off in Venice', d.l15.margaret.scene === 'santalucia' && !d.l15.following && d.l15.biscuit.scene === 'santalucia' && !!(d.fast && d.fast.off));
  await shot('01-platform-margaret');
  await talkAt(500, 84, { x:1, y:-0.4 });
  t.check('Margaret (English): her hotel is near San Marco too; can she tag along?', await has('near San Marco too') && await has('tagged along'));
  await choose('“Of course! Let\'s go together.”');
  await leave();
  d = await dbg();
  t.check('l15-ask; Margaret follows the player, Biscuit follows her', d.tut === 'l15-ask' && d.l15.following && d.l15.follow);
  await place(420, 170, { x:0, y:1 }); await p.waitForTimeout(1500);

  /* ---------- 2 · the information desk: the barrier ---------- */
  await talkAt(144, 350, { x:0, y:-1 });
  let ts = await tiles();
  t.check('the desk: no half-English tile before Margaret asks', !ts.some(x => x.includes('the boat')));
  await say(['Buongiorno']);
  t.check('he answers the greeting; Margaret (on your side): ask about the boat', await has('Mi dica') && await companionHas('Ask him how we get to San Marco'));
  ts = await tiles();
  t.check('now the bank has the half-English tile "Dov\'è… the boat… per San Marco?"', ts.includes("Dov'è… the boat… per San Marco?"));
  await say(['Mi chiamo Sam']);
  t.check('your name: Piacere, Sam!', await has('Piacere, Sam!'));
  await say(["Dov'è… the boat… per San Marco?"]);
  await shot('02-barrier');
  t.check('the barrier: "La barca? Ah, il vaporetto!…"; Margaret; the handbook', await has('La barca? Ah, il vaporetto!') && await companionHas('A vaporetto! Of course') && (await dbg()).tut === 'l15-handbook');
  await choose('Open handbook');
  await p.waitForTimeout(400);
  d = await dbg();
  t.check('the handbook opens at Lezione 15 (l15-vocab)', d.tut === 'l15-vocab' && d.handbook && d.handbook.lesson === 15);
  const hb = await p.textContent('.sheet-body');
  t.check('chapter 15: the vaporetto phrases, the unit in one page (each skill and its lesson), the water buses', hb.includes('A che ora parte il prossimo vaporetto?') && hb.includes('The unit in one page')
    && hb.includes('Comparing and describing') && hb.includes("Venice's water buses"));
  await p.evaluate(() => { const e = document.querySelector('.l15-unit'); if (e) e.scrollIntoView(); }); await shot('03-handbook-unit-page');
  const wc = await t.wordCheck({ wrong:true });
  t.check('the word check: ≤ 50 words, one miss that came back', wc.total <= 50 && wc.total >= 30 && wc.cameBack);
  await t.practice([['o', 0], ['o', 0], ['o', 0], ['o', 0], ['o', 0], ['t', ['Vorrei', 'un cappuccino', 'e', 'un cornetto', 'per favore']], ['o', 0],
    ['t', ['Venezia', 'è', 'più', 'bella', 'di', 'Padova']], ['o', 0], ['o', 0], ['o', 0], ['o', 0]]);
  d = await dbg();
  t.check('the practice (12) done: l15-directions', d.tut === 'l15-directions' && (await p.evaluate(() => __dbg().study)) !== null);

  /* ---------- 3 · the desk again: the way ---------- */
  await talkAt(144, 350, { x:0, y:-1 });
  ts = await tiles();
  t.check('the new tiles: Dov\'è, la fermata, del vaporetto, per San Marco', ["Dov'è", 'la fermata', 'del vaporetto', 'per San Marco'].every(x => ts.includes(x)));
  await say(['Scusi', "Dov'è", 'la fermata', 'del vaporetto']);
  t.check('"Scusi, dov\'è la fermata del vaporetto?" → "Sì, ma per dove?"', await has("Scusi, dov'è la fermata del vaporetto?") && await has('per dove?'));
  await say(['per San Marco']);
  t.check('the way: esca dalla stazione, scenda i gradini, giri a destra, la linea 1 o 2', await has('esca dalla stazione') && await has('giri a destra') && await has('Prenda la linea 1'));
  await pickRight('Out of the station, down the steps, then right', 'Out of the station, then left');
  d = await dbg();
  t.check('Margaret\'s pick: a wrong one ("are you sure?"), then the right one: l15-ticket', await has('are you sure') && d.tut === 'l15-ticket' && d.l15.dirOK);
  await say(['Grazie mille', 'Arrivederci']);
  t.check('the polite goodbye: buon viaggio', await has('buon viaggio'));
  await leave();
  await place(600, 420, { x:0, y:1 }); await p.evaluate(() => { __debug.npc('margaret', { x:560, y:432 }); __debug.npc('biscuit', { x:582, y:452 }); }); await p.waitForTimeout(600); await shot('04-hall');

  /* ---------- 4 · outside: the crowd, the ACTV booth ---------- */
  await door(480, 568, { x:0, y:1 }, 'ferrovia');
  d = await dbg();
  t.check('out on the fondamenta: Margaret with you, Biscuit with her', d.scene === 'ferrovia' && d.l15.margaret.scene === 'ferrovia' && d.l15.biscuit.scene === 'ferrovia');
  await place(560, 300, { x:1, y:0 }); await p.waitForTimeout(1600);
  await shot('05-fondamenta-crowd');
  t.check('the travellers block the way to the booth', !(await p.evaluate(() => __debug.reach(870, 330))));
  await place(664, 290, { x:1, y:0 }); await press('e');
  await p.waitForSelector('#crowdPick:not([hidden])', { timeout:5000 });
  await p.click('#crowdPick [data-pick="scusi"]'); await p.waitForTimeout(1800);
  await place(664, 290, { x:1, y:0 }); await p.waitForTimeout(600); await press('e');
  await p.waitForSelector('#crowdPick:not([hidden])', { timeout:5000 });
  await p.click('#crowdPick [data-pick="permesso"]'); await p.waitForTimeout(4500);
  d = await dbg();
  t.check('Permesso!: the travellers step aside; the booth can be reached', d.crowd.said.some(s => s[1] === 'Permesso!') && await p.evaluate(() => __debug.reach(870, 330)));
  await talkAt(870, 330, { x:0, y:-1 });
  t.check('the booth: Margaret (two tickets, the next boat)', await companionHas('Two tickets, dear'));
  await say(['Buongiorno', 'un biglietto', 'per San Marco', 'per favore']);
  t.check('one ticket → "Uno? E la signora?"; Margaret: two', await has('E la signora?') && await companionHas('Two, dear'));
  await say(['due', 'biglietto', 'per San Marco']);
  let h = await hint();
  t.check('"due biglietto": the plural nudge (Lezione 9), without the answer', h.includes('Lezione 9') && !/biglietti/i.test(h) && await has('Due… biglietto?'));
  await say(['due', 'biglietti', 'per San Marco', 'per favore']);
  await p.waitForSelector('#npad', { timeout:12000 });
  t.check('two tickets: the price is heard (hidden) and the notepad opens', await p.$$eval('.line.listen:not(.revealed)', l => l.length) >= 1 && (await dbg()).pad.open);
  await p.fill('#npadInput', '9'); await p.click('#npadOK'); await p.waitForTimeout(500); await settle();
  h = await hint();
  t.check('9 on the notepad: "the price of one ticket", not the answer', h.includes('one') && !h.includes('19') && !/diciannove/i.test(h));
  await shot('06-ticket-booth');
  await p.fill('#npadInput', '19'); await p.click('#npadOK'); await p.waitForTimeout(800); await settle(); await t.dump();
  d = await dbg();
  t.check('€ 19 written: paid, the two tickets in the bag', d.l15.paid && d.l15.tickets && d.quests.bag.some(b => b.id === 'l15-biglietti'));
  await say(['A che ora parte', 'il prossimo vaporetto']);
  await p.waitForSelector('#l15Time', { timeout:12000 });
  t.check('"A che ora parte il prossimo vaporetto?": the time, heard; the notepad asks for it', await has('A che ora parte il prossimo vaporetto?') && (await dbg()).l15.timePad.open);
  await p.fill('#l15H', '9'); await p.fill('#l15M', '30'); await p.click('[data-l15t="write"]'); await p.waitForTimeout(500);
  d = await dbg();
  t.check('a wrong time: feedback on what was written, never the time', d.l15.timePad.fb.includes('hour is right') && !d.l15.timePad.fb.includes('10') && !/dieci/.test(d.l15.timePad.fb));
  await p.fill('#l15H', '9'); await p.fill('#l15M', '10'); await p.click('[data-l15t="write"]'); await p.waitForTimeout(800); await settle(); await t.dump();
  d = await dbg();
  t.check('9:10 on the notepad; Margaret asks about Biscuit', d.l15.timeNoted && !d.l15.timePad.open && await companionHas('And Biscuit?'));
  await say(['E il cane?', 'Il cane paga?']);
  t.check('"Il cane paga?" → "No, il cane non paga. Ma deve avere il guinzaglio e la museruola… o in braccio, se è piccolo!"', await has('il cane non paga') && await has('il guinzaglio e la museruola'));
  await p.waitForSelector('#choices:not([hidden]) button.english', { timeout:12000 }); await shot('07-dog-beat');
  await pickRight('Biscuit travels free', 'Dogs pay half price');
  d = await dbg();
  t.check('Margaret\'s pick (a wrong one first): "like a king"; ten past nine: breakfast (l15-breakfast)', await companionHas('like a king') && await companionHas('Time for breakfast') && d.tut === 'l15-breakfast' && d.l15.dogOK);
  await say(['Grazie mille', 'Arrivederci']);
  t.check('the goodbye: buon viaggio', await has('Buon viaggio!'));
  await leave();

  /* ---------- 5 · breakfast at the station bar ---------- */
  await door(480, 130, { x:0, y:-1 }, 'santalucia');
  await talkAt(800, 304, { x:0, y:-1 });
  t.check('the bar: "Cosa prende?"; Margaret wants to know which cornetti', await has('Cosa prende?') && await companionHas('what sort of cornetti'));
  await say(['Vorrei', 'un cappuccino']);
  t.check('ordering before asking: Margaret: ask first', await companionHas('ask her what cornetti they have first'));
  await say(['Che cornetti avete?']);
  t.check('"Che cornetti avete?" → vuoti, alla crema, alla marmellata, al cioccolato', await has('Abbiamo cornetti vuoti, alla crema, alla marmellata e al cioccolato'));
  await pickRight('Plain ones, custard ones');
  d = await dbg();
  const pick = d.l15.mgPick, FT = { crema:'alla crema', marmellata:'alla marmellata', cioccolato:'al cioccolato', vuoto:'vuoto' };
  const wrong = pick === 'crema' ? 'al cioccolato' : 'alla crema';
  console.log('   Margaret wants: ' + pick);
  t.check('Margaret chooses her cornetto (and a little black coffee)', d.l15.kindsOK && await companionHas('little black coffee'));
  await say(['Vorrei', 'un cappuccino', 'e', 'un cornetto', 'vuoto', 'per me', 'e', 'per lei', 'un caffè', 'e', 'un cornetto', wrong]);
  t.check('the wrong filling for her: the barista says both orders back, Margaret objects (to hers)', await has('e per Lei un cappuccino e un cornetto vuoto?') && await companionHas('No, dear'));
  await say(['No', 'per lei', 'un cornetto', FT[pick]]);
  t.check('"No, per lei un cornetto …": only hers changes; Margaret: perfect', await has(`per la signora un caffè e un cornetto ${FT[pick]}, e per Lei un cappuccino e un cornetto vuoto?`) && await companionHas('Perfect, dear!'));
  await say(['Sì']);
  d = await dbg();
  t.check('Sì: the order for both (per me, per lei): served; Margaret: how much?', d.l15.ordered && await has('Ecco!') && await companionHas('How much is it'));
  await shot('08-bar');
  await say(["Quant'è?"]);
  await p.waitForSelector('#npad', { timeout:12000 });
  await p.fill('#npadInput', String(d.l15.order.total)); await p.click('#npadOK'); await p.waitForTimeout(800); await settle(); await t.dump();
  t.check(`the price (€ ${d.l15.order.total}) on the notepad: paid`, (await dbg()).l15.barPaid);
  await say(['Grazie', 'Arrivederci']);
  await leave();
  d = await dbg();
  t.check('breakfast done: l15-bepi, 9:01', d.tut === 'l15-bepi' && d.l15.barDone);

  /* ---------- 6 · il signor Bepi ---------- */
  await door(480, 568, { x:0, y:1 }, 'ferrovia');
  d = await dbg();
  t.check('the tour group is at the gate now', ['guidaven', 'gita1', 'gita2', 'gita3'].every(id => d.npcs[id]));
  await place(498, 330, { x:0, y:1 }); await press('e');
  await until(async () => (await dbg()).cut.on, 'the bench', 6000);
  await until(async () => { const x = await dbg(); return x.npcs.bepi && x.npcs.bepi[0] > 545; }, 'Bepi at the bench', 15000);
  await shot('09-bepi-bench');
  await p.waitForSelector('#dialog:not([hidden])', { timeout:20000 }); await p.waitForTimeout(600); await settle(); await t.dump();
  t.check('il signor Bepi: "Che bel cagnolino! Posso?"', await has('Che bel cagnolino! Posso?'));
  await say(['Sì, certo!']);
  t.check('Sì, certo! → he says hello to Biscuit, his name, "E Lei?"', await has('mi chiamano Bepi') && (await dbg()).l15.bepi.stage === 'intro');
  await say(['Mi chiamo Sam']);
  t.check('your name only: "E la signora?"', await has('E la signora?'));
  await say(['Lei è Margaret', 'è inglese', 'e', 'non parla italiano']);
  t.check('Margaret introduced: welcome, English; "Avete preso il treno da Padova?"', await has('Benvenuta') && await has('Avete preso il treno da Padova?'));
  await say(['Sì']);
  t.check('a bare Sì: "Il treno di notte?"', await has('Sì? Il treno di notte?'));
  await say(['Sì', 'Abbiamo preso', 'il treno di notte', 'da Padova']);
  t.check('"Abbiamo preso il treno di notte da Padova" → "Vi è piaciuto?"', await has('Che avventura!') && await has('vi è piaciuto?'));
  await say(['Sì', 'Mi è piaciuto molto!']);
  d = await dbg();
  console.log('   Bepi asks about: ' + JSON.stringify(d.l15.day));
  t.check('"Mi è piaciuto molto!" → his first question about Padova', d.l15.bepi.stage === 'day1' && !!d.l15.day.yes && await has(d.l15.day.yes.q || '??'));
  const Y = d.l15.day.yes;
  await say(['Sì', 'Ho', Y.pp, Y.label]);
  d = await dbg();
  t.check('"Sì, ho …" → his reply, then the second question', d.l15.bepi.stage === 'day2');
  await say(['No', 'ma', 'Ho', Y.pp, Y.label]);
  t.check('"No, ma ho …" → "Peccato!" and the comparison: "È più bella di Padova?"', await has('Peccato') && await has('È più bella di Padova?'));
  await say(['Venezia', 'è', 'più', 'bello', 'di Padova']);
  h = await hint();
  t.check('"più bello": he understands; the agreement feedback (bella), and Margaret\'s news', await has('sono veneziano') && h.includes('feminine') && await companionHas('Biscuit found a family'));
  await say(['Biscuit', 'ha trovato', 'una famiglia', 'sul treno']);
  t.check('"Biscuit ha trovato una famiglia sul treno!" → "Che storia!"; "Lei parla bene l\'italiano!"', await has('Che storia!') && await has("parla bene l'italiano"));
  await say(['Grazie']);
  t.check('a bare Grazie: "Ma… studia l\'italiano?"', await has("studia l'italiano?"));
  await say(['Sì', 'Sto imparando.']);
  t.check('"Sto imparando." → the horn: "Ecco il vaporetto! Buon viaggio, e benvenuti a Venezia!"', await has('Piano piano') && await has('benvenuti a Venezia!'));
  await say(['Grazie mille', 'Arrivederci']);
  await leave();
  await until(async () => (await dbg()).venezia.boat === 'docked', 'the boat in', 12000);
  d = await dbg();
  t.check('l15-board: the vaporetto is in, Bepi goes on his way, the deckhand on the pontoon', d.tut === 'l15-board' && d.venezia.boat === 'docked' && !!d.npcs.marinaio);

  /* ---------- 7 · boarding: the tour group, the readers, the voyage ---------- */
  await place(700, 360, { x:1, y:0 }); await press('e');
  await p.waitForSelector('#crowdPick:not([hidden])', { timeout:5000 });
  await p.click('#crowdPick [data-pick="permesso"]'); await p.waitForTimeout(5000);
  t.check('Permesso!: the tour group steps aside from the gate', await p.evaluate(() => __debug.reach(744, 374)));
  await place(744, 374, { x:0, y:1 }); await press('e'); await p.waitForTimeout(600);
  d = await dbg();
  t.check('one ticket on the reader: Bip! (validated 1)', d.l15.validated === 1 && d.venezia.beep[0]);
  await press('e');
  await until(async () => (await dbg()).l15.margaret.carry, 'Biscuit in her arms', 6000);
  d = await dbg();
  t.check('the second (Margaret\'s): the gate opens, the voyage begins, Biscuit in her arms', d.l15.validated === 2 && d.venezia.gate && d.l15.margaret.carry && d.cut.on);
  await until(async () => { const x = await dbg(); return x.scene === 'vaporetto' && x.venezia.view && x.venezia.view.kind === 'board'; }, 'the boarding view', 15000);
  await p.waitForTimeout(1200); await shot('10-boarding');
  await until(async () => { const x = await dbg(); return x.venezia.view && x.venezia.view.kind === 'canal' && x.venezia.view.k > 0.45; }, 'the Grand Canal', 40000);
  await shot('11-grand-canal');
  await until(async () => { const x = await dbg(); return x.venezia.view && x.venezia.view.kind === 'canal' && x.venezia.view.k > 0.68; }, 'the Rialto', 30000);
  await shot('12-rialto');
  await until(async () => { const x = await dbg(); return x.venezia.view && x.venezia.view.kind === 'bacino' && x.venezia.view.k > 0.6; }, 'San Marco', 40000);
  await shot('13-san-marco');
  await until(async () => (await dbg()).unit && (await dbg()).unit.open, 'the unit-completion screen', 40000);
  d = await dbg();
  t.check('the voyage over: l15-done, the unit-completion screen', d.tut === 'l15-done' && d.unit.open && d.unit.view === 'main');
  const us = await p.textContent('#sheet');
  t.check('the screen: words, quests, stamps; Free play / Replay a lesson / Unit 2 coming soon; your morning in Italian', us.includes('Benvenuti a Venezia!') && us.includes('quests done') && us.includes('stamps')
    && us.includes('Free play in Padova') && us.includes('Replay a lesson') && us.includes('Unit 2 · Venezia') && us.includes('Coming soon') && /sto imparando/i.test(us));
  await shot('14-unit-complete');
  /* closing it in Venice brings it back */
  await press('Escape'); await p.waitForTimeout(700);
  t.check('closed while still in Venice: the screen comes back', (await dbg()).unit.open);
  await p.click('[data-unit="free"]');
  await until(async () => (await dbg()).scene === 'piazza' && !(await dbg()).unit.open, 'the piazza', 10000); await p.waitForTimeout(2900);
  d = await dbg();
  t.check('Free play: the piazza in the afternoon; Margaret and Biscuit stay in Venice; fast travel on; the quests open at any time', d.scene === 'piazza' && d.l15.free && d.night.daytime === 'afternoon'
    && !d.l15.following && !d.npcs.margaret && !d.fast.off && d.fast.offer.length > 0 && d.quests.town && d.quests.free);
  t.check('the objective says free play; no clock', (await p.textContent('#objective')).includes('Free play') && !d.quests.clock);
  await shot('15-free-play');
  /* no hint gave an Italian model sentence */
  const log = await p.evaluate(() => window.__hintLog || []);
  const MODELS = ['Due biglietti per San Marco', "Dov'è la fermata del vaporetto per San Marco", 'A che ora parte il prossimo vaporetto', 'Il cane paga', 'Che cornetti avete',
    'Mi è piaciuto molto', 'Sto imparando', 'Abbiamo preso il treno', 'Biscuit ha trovato', 'più bella di Padova', 'nove e dieci', 'diciannove'];
  const bad = log.filter(x => MODELS.some(m => x.toLowerCase().includes(m.toLowerCase())));
  console.log(`   ${log.length} hints shown`);
  t.check('no hint gives a model sentence', !bad.length);
  if (bad.length) console.log('   BAD HINTS: ' + JSON.stringify(bad));
  /* a save made in free play loads into free play */
  await p.reload(); await p.waitForTimeout(800);
  await p.click('#btnContinue'); await p.waitForTimeout(1800);
  d = await dbg();
  t.check('reloaded: free play in Padova again', d.scene === 'piazza' && d.lesson === 15 && d.tut === 'l15-done' && d.l15.free && !(d.unit && d.unit.open));
  /* every tile word in the dictionary */
  const audit = await p.evaluate(() => __vocabAudit()[15]);
  t.check('the vocab audit: every word of the lesson is taught', Array.isArray(audit) && !audit.length);
}, { fakeSpeech:true });
