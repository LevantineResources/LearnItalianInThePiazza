/* Lesson 14 · Dov'è il cane?, played through the real UI from the skip link to the completion screen
   (docs/lessons/14-dov-e-il-cane.md, the trail), with speech faked (harness fakeSpeech).
   Run 1: compartment 17 at dawn: Margaret knocks (English), she follows; the dining car: il signor Rinaldi (the barrier: no
   "where did it go?"; his fast answer; Margaret's lines on the player's side); the handbook, the word check, the practice; the
   notebook switches on; Rinaldi again: nothing seen, the wrong ending (andata: agreement feedback on the player's word, not the
   answer), andato → room 14, his time (the notebook's A che ora?); la signora Ferri (a greeting in the same turn: answered) →
   room 14; the knock on 14 (something not polite: "Chi è?"; then polite: in); Ernesto (the where pick, his aside, a wrong time
   with feedback that never gives it, 6:00), Lina (7:45 → the meno feedback, 6:45; towards the front), the bickering; the Confronta
   page (the same dog? → two dogs); the driver's door (barking; the typed translation for Margaret: open the door, not my dog, a
   CHOICE); Gianni (tiles: the promise); Nino (two dogs, whose: "voleva un osso!"); Ernesto catches up ("Mi sono ricordato!": the
   room next door); the secret kept (the driver's dog to Ernesto: feedback, no reveal); knock on 13 (empty) and 15 (barking,
   giggling); la signora Ferri at the door; the reveal; the reunion (typed, tu); the goodbye (ciao → the polite form); the lagoon,
   Venezia Santa Lucia, the train stopped; the completion screen. Every word in the dictionary; no hint gives an answer.
   Run 2: the notebook's "Ieri sera…": after a skip (every clue), after a real Lesson 13 ending (the clues it recorded), a save
   with none recorded (filled), a save with two (only those).
   Screenshots: review/l14/*.jpg */
const { play } = require('./lib/harness');
const path = require('path'), fs = require('fs');
const REVIEW = path.resolve(__dirname, '..', 'review', 'l14'), REWORK = path.resolve(__dirname, '..', 'review', 'l14-rework');
fs.mkdirSync(REVIEW, { recursive:true }); fs.mkdirSync(REWORK, { recursive:true });

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const l14 = async () => (await dbg()).l14;
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const has = async s => (await t.lines()).some(l => l.includes(s));
  const settle = async (quiet = 900, max = 25000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#choices').hidden ? 0 : 20000) + (document.querySelector('#nbAsk') ? 50000 : 0), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const say = async labels => { await p.waitForSelector('#builder:not([hidden])', { timeout:12000 }); for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const type = async text => { await t.type(text, 600); await settle(); };
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(250); };
  const shot = async (name, rework) => { await p.waitForTimeout(250); await p.screenshot({ path:path.join(rework ? REWORK : REVIEW, name + '.jpg'), type:'jpeg', quality:72 }); console.log('   shot', name); };
  const hint = async () => p.$eval('#hint', h => h.hidden ? '' : h.innerText.replace(/\s+/g, ' '));
  const leave = async () => { await t.leave(); await p.waitForTimeout(300); };
  const place = async (x, y, face) => { await p.evaluate(([x, y, f]) => __debug.place(x, y, f), [x, y, face || { x:0, y:-1 }]); await p.waitForTimeout(250); };
  const talkAt = async (x, y, face) => { await place(x, y, face); await press('e');
    await p.waitForSelector('#dialog:not([hidden])', { timeout:12000 }); await p.waitForTimeout(600); await settle(); await t.dump(); };
  const choose = async label => { await p.waitForSelector('#choices:not([hidden])', { timeout:12000 }); await p.click(`#choices button >> text="${label}"`); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const ask = async kind => { await until(async () => { const a = (await dbg()).notebook.ask; return a && a.kind === kind; }, 'the notebook asks ' + kind, 15000); return (await dbg()).notebook.ask; };
  /* the notebook's questions, answered in the dialog as a player would: type the time and press Scrivi, or tap a direction */
  const writeTime = async hm => { const [h, m] = hm.split(':'); await p.fill('#nbH', h); await p.fill('#nbM', m); await p.click('[data-nb="write"]'); await p.waitForTimeout(500); await settle(); };
  const pickWhere = async key => { const a = (await dbg()).notebook.ask; const k = a.opts.indexOf(key); await p.click(`[data-nb-opt="${k}"]`); await p.waitForTimeout(500); await settle(); };
  const companionHas = async s => p.evaluate(s => [...document.querySelectorAll('.line.companion')].some(l => l.textContent.includes(s)), s);
  await p.evaluate(() => { window.__hintLog = []; });

  /* ---------- 1 · compartment 17, the morning: Margaret knocks ---------- */
  await t.jump(14);
  let d = await dbg();
  t.check('Lezione 14 starts in compartment 17 in the morning (dawn in the window), Lesson 13 done', d.lesson === 14 && d.tut === 'l14-start' && d.scene === 'cabina17'
    && d.treno.sky === 'dawn' && d.night.daytime === 'morning' && d.l13 && d.l13.slept && d.treno.moving);
  t.check('the skip link left every dinner clue in S.l13.seen (the notebook\'s Ieri sera…)', ['nino-pollo', 'ferri-vogliono', 'bambini-guardano', 'gianni-avanzi', 'biscuit-cucina', 'bassi-letto'].every(k => d.l13.seen.includes(k)));
  await until(async () => (await dbg()).cut.on, 'the knock', 8000);
  await until(async () => (await dbg()).crowd.bubbles.some(b => b[0] === 'margaret'), 'Margaret at the door', 12000);
  await shot('01-margaret-knocks-dawn');
  await p.waitForSelector('#dialog:not([hidden])', { timeout:15000 }); await p.waitForTimeout(600); await settle(); await t.dump();
  t.check('Margaret, in a panic (English): Biscuit is gone, the dining car last night', await has('Biscuit is gone') && await has('dining car last night'));
  await choose('“Of course. Let\'s go and ask.”');
  t.check('she will start in the dining car', await has("Let's start in the dining car"));
  await leave();
  d = await dbg();
  t.check('l14-barrier; Margaret follows the player (the follower hook)', d.tut === 'l14-barrier' && d.l14.follow && d.l14.following && d.l14.margaret.scene === 'cabina17');
  await place(480, 512, { x:0, y:1 }); await press('e');
  await until(async () => (await dbg()).scene === 'treno', 'the corridor', 8000); await p.waitForTimeout(1800);
  d = await dbg();
  t.check('out in the corridor, Margaret with you', d.scene === 'treno' && d.l14.margaret.scene === 'treno' && Math.hypot(d.l14.margaret.at[0] - d.me[0], d.l14.margaret.at[1] - d.me[1]) < 80);

  /* ---------- 2 · the barrier: Rinaldi ---------- */
  await place(1140, 236, { x:1, y:0 }); await p.waitForTimeout(1500);
  await talkAt(1336, 444, { x:0, y:1 });
  let tiles = await p.$$eval('#bank .tile', ts => ts.map(x => x.textContent.trim()));
  t.check('the barrier\'s tiles: Ha visto, un cane… but no Dov\'è andato?', tiles.includes('Ha visto') && tiles.includes('un cane') && !tiles.includes("Dov'è andato?") && !tiles.includes('A che ora?'));
  await say(['Buongiorno', 'Mi scusi', 'Ha visto', 'un cane']);
  t.check('Rinaldi answers fast (a listening line, hidden); Margaret: ask him where Biscuit went (on your side)', await p.$$eval('.line.listen:not(.revealed)', l => l.length) >= 1
    && await companionHas('Ask him where Biscuit went') && await has('Open your handbook'));
  d = await dbg();
  t.check('the barrier: l14-handbook', d.tut === 'l14-handbook' && d.l14.barrier);
  await shot('02-barrier');
  await choose('Open handbook');
  d = await dbg();
  t.check('the handbook opens at Lezione 14', d.handbook.open && d.handbook.lesson === 14);
  const data = await p.evaluate(() => __l14Data());
  const wc = await t.wordCheck({ wrong:true });
  t.check(`the word check (${wc.total} words, ≤ 50), the missed one came back`, wc.total <= 50 && wc.cameBack);
  const steps = data.exercises.map(e => {
    if (e.type === 'mc') return ['o', e.a];
    const norm = s => s.toLowerCase().replace(/[^\p{L}\s']/gu, ' ').replace(/\s+/g, ' ').trim();
    let rest = norm(e.answer); const used = [], seq = [];
    while (rest){ const k = e.tiles.findIndex((x, i) => !used.includes(i) && (rest + ' ').startsWith(norm(x) + ' ')); if (k < 0) break; used.push(k); seq.push(e.tiles[k]); rest = rest.slice(norm(e.tiles[k]).length).trim(); }
    return ['t', seq];
  });
  await t.practice(steps);
  d = await dbg();
  t.check('practice done: l14-dining, the notebook is on (Taccuino)', d.tut === 'l14-dining' && d.notebook.on && await p.isVisible('#btnNotebook'));
  await press('Escape');

  /* the dictionary keeps the mystery's discoveries out until they are made (whose dogs, how many) */
  await press('v');
  const dictBefore = await p.$$eval('.sheet .entry .w', es => es.map(e => e.textContent.trim()));
  t.check('the dictionary: no spoiler tiles yet (il cane del macchinista, Ci sono due cani!)', !dictBefore.some(w => /del macchinista|due cani|della signora/.test(w)) && dictBefore.includes('Sa …?'));
  await press('Escape');

  /* ---------- 3 · the dining car: Rinaldi and la signora Ferri ---------- */
  await talkAt(1336, 444, { x:0, y:1 });
  tiles = await p.$$eval('#bank .tile', ts => ts.map(x => x.textContent.trim()));
  t.check('the tiles: Sa …?, Dov\'è andato?, il cane, È sicuro? / È sicura?', ['Sa …?', "Dov'è andato?", 'il cane', 'È sicuro?', 'È sicura?'].every(x => tiles.includes(x)));
  await say(['Mi scusi', 'Sa …?', "Dov'è andato?", 'il cane']);
  t.check('"Sa dov\'è andato il cane?" (the sentence as built)', await p.evaluate(() => [...document.querySelectorAll('.line.me')].some(l => l.textContent.includes("Sa dov'è andato il cane?"))));
  let h = await hint();
  console.log('   the hint after "nothing":', h);
  t.check('Rinaldi: non ho visto niente; Margaret: nobody saw him? Is he quite sure?', await has('Non ho visto niente') && await companionHas('Nobody saw him') && await companionHas('Is he quite sure'));
  t.check('the hint presses him (Ask if he\'s sure), never the Italian', /sure/.test(h) && !/sicur/i.test(h) && !(await l14()).pointed.rinaldi);
  await say(["Dov'è andata?"]);
  const agreeHint = await hint();
  console.log('   agreement feedback:', agreeHint);
  t.check('the wrong ending (andata): he is puzzled ("Chi, la signora?"), the feedback is about the ending, never the answer', await has('Chi, la signora?')
    && /-o/.test(agreeHint) && !/andato/i.test(agreeHint) && !(await l14()).pointed.rinaldi && (await l14()).agree === 1);
  await say(['È sicura?']);
  t.check('È sicura? to a man: puzzled, the feedback on the ending (-o), not pointed yet', await has('Sicura? Io?') && /-o/.test(await hint()) && !(await l14()).pointed.rinaldi);
  await say(['È sicuro?']);
  t.check('È sicuro?: "Non ho visto niente. Chieda alla coppia della camera 14. Forse sanno dov\'è il cane." (camera14 in the notebook)',
    await has('Chieda alla coppia della camera 14') && await has("Forse sanno dov'è il cane") && (await l14()).pointed.rinaldi && (await dbg()).notebook.clues.camera14);
  await shot('01-e-sicuro-rinaldi', true);
  await say(['A che ora?']);
  await ask('time');
  await shot('03-dining-questioning');
  await writeTime('7:00');
  t.check('his time, written: 7:00 (rinaldi-arrivato)', (await dbg()).notebook.clues['rinaldi-arrivato'].time === '7:00');
  await leave();
  await talkAt(1496, 262, { x:0, y:-1 });
  await say(['Buongiorno', 'Mi scusi', 'Sa …?', "Dov'è andato?", 'il cane']);
  h = await hint();
  t.check('la signora Ferri: the greeting answered in the same turn, then "Non lo so"; the hint: ask if she\'s sure (no Italian)', await has('Buongiorno!') && await has('Non lo so, mi dispiace')
    && /she's sure/.test(h) && !/sicur/i.test(h) && !(await l14()).pointed.ferri && await companionHas('Is she sure'));
  await say(['È sicura?']);
  d = await dbg();
  t.check('È sicura?: she points to room 14 too; Margaret: the sweet old couple; l14-couple', await has('sono sicura') && d.l14.pointed.ferri && d.tut === 'l14-couple' && await companionHas('Room 14?'));
  await leave();

  /* ---------- 4 · room 14: the Bassis ---------- */
  await place(525, 236, { x:0, y:1 }); await press('e');
  await p.waitForSelector('#dialog:not([hidden])', { timeout:12000 }); await p.waitForTimeout(600); await settle(); await t.dump();
  t.check('a knock on 14, a voice behind the door: Chi è? (nameplate ???)', await has('Chi è?') && (await dbg()).treno.knocks.includes(14) && await p.evaluate(() => document.querySelector('.line.npc .nameplate').textContent === '???'));
  await say(['Ha visto', 'un cane']);
  h = await hint();
  t.check('not an answer to "Chi è?": "Chi è? Non ho capito!" (and a hint: tell them it\'s you, with Margaret; no Italian)', await has('Non ho capito') && /Margaret/.test(h) && !/siamo/i.test(h));
  await say(['Siamo', 'io', 'e', 'Margaret']);
  t.check('"Siamo io e Margaret": Ah, Lei! E la signora inglese! Avanti!', await p.evaluate(() => [...document.querySelectorAll('.line.me')].some(l => l.textContent.includes('Siamo io e Margaret.'))) && await has('E la signora inglese'));
  await shot('02-chi-e-siamo-io-e-margaret', true);
  await choose('Go in');
  await until(async () => (await dbg()).scene === 'cabina14', 'room 14', 10000); await p.waitForTimeout(1800);
  d = await dbg();
  t.check('in room 14: Ernesto and Lina (and Margaret)', d.npcs.ernesto && d.npcs.lina && d.l14.margaret.scene === 'cabina14');
  await shot('04-room-14-the-bassis');
  await talkAt(446, 350, { x:0, y:-1 });
  await say(['Mi scusi', 'Sa …?', "Dov'è andato?", 'il cane']);
  let a = await ask('where');
  t.check('Ernesto: towards the dining car; the notebook asks where it went (three English options)', a.clue === 'ernesto-visto' && a.opts.length === 3 && await has('Verso il vagone ristorante'));
  await pickWhere('ristorante');
  t.check('towards the dining car, written; his aside: "ho sentito anche un cane stanotte… ma non mi ricordo dove"', (await dbg()).notebook.clues['ernesto-visto'].where === 'ristorante' && await has('non mi ricordo dove'));
  await say(['A che ora?']);
  a = await ask('time');
  await shot('05-notebook-asks-the-time');
  await writeTime('7:00');
  a = (await dbg()).notebook.ask;
  console.log('   feedback on 7:00:', a && a.fb);
  t.check('a wrong time: feedback on what was written, never the time', a && a.tries === 1 && /minutes are right/.test(a.fb) && !/6:00|alle sei/.test(a.fb));
  await writeTime('6:00');
  t.check('6:00 written for Ernesto', (await dbg()).notebook.clues['ernesto-visto'].time === '6:00');
  await leave();
  await talkAt(590, 318, { x:0, y:-1 });
  await say(['A che ora?']);
  await ask('time');
  await writeTime('7:45');
  a = (await dbg()).notebook.ask;
  console.log('   feedback on 7:45:', a && a.fb);
  t.check('7:45 for "sette meno un quarto": the meno feedback, not the answer', a && /meno/.test(a.fb) && !/6:45/.test(a.fb));
  await writeTime('6:45');
  await say(['Ha visto', 'un cane']);
  await ask('where');
  await pickWhere('testa');
  d = await dbg();
  t.check('Lina: 6:45, towards the front; both sightings complete: the bickering, Margaret wonders', d.notebook.clues['lina-visto'].time === '6:45' && d.notebook.clues['lina-visto'].where === 'testa'
    && d.l14.bothNoted && await has("Cinquant'anni di matrimonio") && await companionHas('both ways'));
  t.check('Margaret suggests the chef (on your side): "The chef feeds everyone — let\'s ask him!"; l14-nino', await companionHas("The chef feeds everyone — let's ask him!") && d.tut === 'l14-nino');
  await leave();
  await press('j');
  d = await dbg();
  const nbText = await p.textContent('.nb-page');
  t.check('the notebook\'s entries are Italian only (no English lines)', d.notebook.open && !(await p.$('.nb-en')) && !/I saw a dog|towards the dining car|front of the train|Ask the couple|last night/i.test(nbText) && /verso il vagone ristorante/.test(nbText));
  await shot('05-notebook-in-italian', true);
  await p.click('[data-nb-page="compare"]'); await p.waitForTimeout(300);
  d = await dbg();
  t.check('the Confronta page: both sightings side by side, ready (Italian only)', d.notebook.open && d.notebook.compare.ready && await p.$$eval('.nb-side.full', s => s.length) === 2 && !/The same dog|towards/i.test(await p.textContent('.nb-page')));
  await p.click('[data-nb-q="one"]'); await p.waitForTimeout(300);
  t.check('"the same dog": a doubtful reply (nothing waits on it)', (await dbg()).tut === 'l14-nino' && /Possibile/.test(await p.textContent('.nb-page')));
  await p.click('[data-nb-q="two"]'); await p.waitForTimeout(400);
  await shot('06-confronta');
  t.check('"two dogs": the stamp; still l14-nino (a hunch: the cab confirms it)', await p.isVisible('.nb-stamp') && (await dbg()).tut === 'l14-nino');
  await press('Escape');

  /* ---------- 5 · Nino: a dog at the front, with the driver ---------- */
  await place(480, 512, { x:0, y:1 }); await press('e');
  await until(async () => (await dbg()).scene === 'treno', 'the corridor', 8000); await p.waitForTimeout(1600);
  await place(1600, 380); await p.waitForTimeout(1500);
  await talkAt(1805, 420, { x:1, y:0 });
  await say(['Buongiorno', 'Mi scusi', 'Sa …?', "Dov'è andato?", 'il cane']);
  d = await dbg();
  t.check('Nino: "C\'è un cane davanti, con il macchinista!"; Margaret: that\'s where Lina saw him going; l14-front', await has("C'è un cane davanti, con il macchinista!") && await companionHas('Up at the front')
    && d.tut === 'l14-front' && d.notebook.clues['nino-davanti'] && d.notebook.clues['nino-davanti'].where === 'testa');
  await shot('03-nino-un-cane-davanti', true);
  await say(['A che ora?']);
  await ask('time');
  await writeTime('6:45');
  t.check('his time, written: 6:45 (the same as Lina\'s)', (await dbg()).notebook.clues['nino-davanti'].time === '6:45');
  await leave();

  /* ---------- 6 · the driver's cab ---------- */
  await place(2370, 217, { x:1, y:0 }); await p.waitForTimeout(1500);
  t.check('at the cab: Bussa', (await dbg()).treno.near === 'cab');
  await press('e');
  await until(async () => (await dbg()).treno.says.some(s => s[0] === 'cab' && /Bau/.test(s[1])), 'barking', 6000);
  t.check('barking behind the driver\'s door', true);
  await p.waitForSelector('#dialog:not([hidden])', { timeout:15000 }); await p.waitForTimeout(600); await settle(); await t.dump();
  t.check('Gianni behind the door: "Chi è? Sono occupato!"', await has('Sono occupato') && /Behind the door/.test(await p.textContent('#dlgWho')));
  await say(['Ha visto', 'un cane']);
  h = await hint();
  t.check('a dog? He denies it (a bark gives him away); the hint: apologise and ask to come in (no Italian)', await has('nessun cane') && /come in/.test(h) && !/permesso|disturbo/i.test(h));
  await say(['Scusi il disturbo', 'Permesso?']);
  t.check('"Scusi il disturbo, permesso?": "No, no! Esco io!"', await p.evaluate(() => [...document.querySelectorAll('.line.me')].some(l => l.textContent.includes('Scusi il disturbo, permesso?'))) && await has('Esco io'));
  await choose('Continue');
  await until(async () => (await dbg()).cut.on && (await dbg()).cut.id === 'l14-slip', 'the cutscene', 8000);
  await until(async () => { const b = (await dbg()).npcs.brigante; return b && b[0] < 2290; }, 'the dog slipping past', 12000);
  d = await dbg();
  t.check('the cutscene: Gianni steps out, a big dark dog slips past him into the car (Brigante, not Biscuit)', d.l14.cabOpen && d.npcs.gianni && d.npcs.brigante && !d.npcs.biscuit);
  await shot('04-cab-cutscene-the-dog-slips-past', true);
  await until(async () => !(await dbg()).cut.on, 'the cutscene ends', 30000);
  t.check('the door pulled to behind him; Brigante back at his feet', !(await dbg()).treno.open.includes('cab'));
  await p.waitForSelector('#typer:not([hidden])', { timeout:15000 }); await settle(); await t.dump();
  d = await dbg();
  t.check('the typed translation: Margaret is the companion ("That\'s not my dog! Tell him!")', d.l14.script && d.l14.script.key === 'margaret_door' && d.l14.companion === 'margaret' && await companionHas("That's not my dog") && await has('niente, niente'));
  await type('Non è il mio cane!');
  t.check('Gianni: È Brigante, il mio cane', await has('È Brigante, il mio cane'));
  await choose('He wants us to leave the train.');
  await choose('He\'s begging us not to tell anyone: dogs aren\'t allowed.');
  await leave();
  await shot('07-cab-door-brigante-gianni');
  await p.waitForSelector('#dialog:not([hidden])', { timeout:12000 }); await p.waitForTimeout(600); await settle(); await t.dump();
  t.check('Gianni (tiles): Per favore… non lo dica a nessuno!', await has('non lo dica a nessuno') && (await dbg()).l14.phase === 'promise');
  tiles = await p.$$eval('#bank .tile', ts => ts.map(x => x.textContent.trim()));
  t.check('the discoveries are tiles now (Ci sono due cani!, il cane della signora)', tiles.includes('Ci sono due cani!') && tiles.includes('il cane della signora'));
  await say(['Non lo so.']);
  t.check('not a promise: he begs again; the hint: promise him (no Italian sentence)', /Promise him/.test(await hint()) && !/non lo dico a nessuno/i.test(await hint()));
  await say(['Non lo dico a nessuno.']);
  d = await dbg();
  t.check('the promise: grazie mille, "Chieda al cuoco!"; Margaret: his secret is safe, back to the chef; l14-chef', await has('Chieda al cuoco') && d.l14.promised && d.tut === 'l14-chef' && await companionHas('secret') && await companionHas('Back to the chef'));
  await leave();
  await until(async () => (await l14()).cabShut, 'Gianni goes back in', 8000);

  /* ---------- 7 · back to Nino: two dogs ---------- */
  await place(1600, 380); await p.waitForTimeout(1500);
  await talkAt(1805, 420, { x:1, y:0 });
  t.check('Nino: "Allora, il cane? Davanti, no?"', await has('Davanti, no?'));
  await say(['il cane del macchinista']);
  t.check('the driver\'s dog: "Shh… lo so, lo so" (he saw it: the secret is safe with him); not yet', await has('lo so, lo so') && (await dbg()).tut === 'l14-chef');
  await say(['Ci sono due cani!']);
  d = await dbg();
  t.check('"Ci sono due cani!": "Due cani?! … ha guardato la cena, voleva un osso!"; l14-memory', await has('Due cani?!') && await has('voleva un osso') && d.tut === 'l14-memory' && d.notebook.clues['nino-osso']);
  await shot('08-nino-two-dogs');
  await leave();

  /* ---------- 8 · Ernesto remembers ---------- */
  await until(async () => (await dbg()).l14.memoryCome, 'Ernesto comes', 8000);
  await p.waitForSelector('#dialog:not([hidden])', { timeout:20000 }); await p.waitForTimeout(600); await settle(); await t.dump();
  t.check('Ernesto: Mi sono ricordato!', await has('Mi sono ricordato'));
  await ask('where');
  await pickWhere('accanto');
  d = await dbg();
  t.check('the room next door, written; Lina: two children in there; l14-reveal', d.notebook.clues['ernesto-ricordato'].where === 'accanto' && await has('ci sono due bambini') && d.tut === 'l14-reveal');
  await say(['Ci sono due cani!', 'il cane del macchinista']);
  t.check('the secret kept: telling Ernesto about the driver\'s dog gets "you promised", and no reply about it', /promised Gianni/.test(await hint()) && !(await has('Brigante?')));
  await leave();

  /* ---------- 9 · the children's room ---------- */
  await place(415, 236, { x:0, y:1 }); await press('e'); await p.waitForTimeout(1500);
  t.check('room 13: nobody (empty)', (await dbg()).treno.knocks.includes(13));
  await place(635, 236, { x:0, y:1 }); await press('e');
  await until(async () => (await dbg()).treno.says.some(s => s[0] === 15 && /Ih ih/.test(s[1])), 'giggling behind 15', 10000);
  t.check('room 15: barking and giggling behind the door', (await dbg()).treno.knocks.includes(15));
  await p.waitForSelector('#dialog:not([hidden])', { timeout:20000 }); await p.waitForTimeout(600); await settle(); await t.dump();
  t.check('la signora Ferri at the door', (await dbg()).l14.phase === 'door' && await has('Mi dica'));
  await say(['Scusi il disturbo', 'Ha visto', 'un cane']);
  t.check('"Un cane? Qui? Ma no, i bambini dormono…" … and barking inside', await has('i bambini dormono') && await has('giggling'));
  await choose('Look inside');
  await until(async () => (await dbg()).scene === 'cabina15', 'room 15', 12000);
  await p.waitForSelector('#dialog:not([hidden])', { timeout:12000 }); await p.waitForTimeout(600); await settle(); await t.dump();
  d = await dbg();
  t.check('the reveal: the children and Biscuit; "Abbiamo sempre voluto un cane!"', await has('Abbiamo sempre voluto un cane') && await has('Si chiama Biscotto') && d.l14.found && d.treno.dogs.biscuit.here && d.notebook.clues.bambini);
  await leave(); await p.waitForTimeout(300);
  await shot('09-reveal-room-15');

  /* ---------- 10 · the reunion, the goodbye, Venice ---------- */
  await p.waitForSelector('#typer:not([hidden])', { timeout:15000 }); await settle(); await t.dump();
  d = await dbg();
  t.check('the reunion: typed, for Margaret, to the children (l14-done, sofiaferri)', d.tut === 'l14-done' && d.l14.script && d.l14.script.key === 'margaret_reunion' && d.l14.companion === 'margaret');
  await type('Si chiama Biscuit.');
  t.check('Sofia: Come biscotto!', await has('Come biscotto'));
  await type('Le piace?');
  t.check('Le piace? to a child: a hint about tu (or the word is not known yet)', (await hint()).length > 0);
  await type('Ti piace Biscuit?');
  t.check('"Ti piace Biscuit?" is accepted for "Ti piace?": Sì! Tantissimo!', await has('Tantissimo'));
  await choose('She likes him very much: they\'ve always wanted a dog.');
  await type('Ecco un biscotto per Biscuit!');
  t.check('a biscuit for Biscuit; Margaret thanks you', await has('Un biscotto per Biscuit') && await companionHas('never have found him'));
  await shot('10-reunion');
  await leave();
  await p.waitForSelector('#dialog:not([hidden])', { timeout:12000 }); await p.waitForTimeout(600); await settle(); await t.dump();
  t.check('la signora Ferri says goodbye (formal)', await has('Arrivederci, e grazie di tutto'));
  await say(['Ciao']);
  t.check('ciao to la signora Ferri: the polite goodbye (feedback on the word used)', /arrivederci<?\/?b?>?, not ciao|arrivederci, not ciao/i.test(await hint()));
  await say(['Grazie mille!', 'Arrivederci']);
  t.check('Arrivederci: the children say goodbye to Biscuit', await has('Ciao, Biscuit'));
  await leave();
  await until(async () => (await dbg()).scene === 'treno', 'the corridor', 10000);
  await until(async () => (await l14()).arrived, 'the arrival', 20000);
  await p.waitForTimeout(800);
  d = await dbg();
  t.check('Venezia Santa Lucia: the lagoon in the windows, the train stopped; Biscuit follows Margaret', d.treno.sky === 'lagoon' && !d.treno.moving && d.treno.dogs.biscuit.follows === 'margaret');
  await shot('11-lagoon-arrival');
  await until(async () => p.isVisible('.sheet') && /Lezione 14 completata/.test(await p.textContent('.sheet').catch(() => '')), 'the completion screen', 20000);
  await p.waitForTimeout(500);
  const sheetText = await p.textContent('.sheet');
  t.check('the completion screen: Lezione 14 completata, the notebook\'s sightings, Start Lezione 15', /Lezione 14 completata/.test(sheetText) && /6:00/.test(sheetText) && /6:45/.test(sheetText) && /Start Lezione 15/.test(sheetText));
  t.check('the completion screen does not give away the driver\'s secret', !/Brigante|macchinista/i.test(sheetText));
  await shot('12-complete');
  await press('Escape');
  d = await dbg();
  t.check('lesson completed (l14-done, end)', d.tut === 'l14-done' && d.l14.phase === 'end' && d.l14.goodbye);
  /* every word of the tiles and the typed lines is in the dictionary */
  await press('v');
  const dictMiss = await p.evaluate(() => __l14DictAudit());
  console.log('   L14 words not in the dictionary:', dictMiss.join(', ') || 'none');
  t.check('every L14 tile and typed word is in the dictionary', dictMiss.length === 0);
  await press('Escape');
  const hints = await p.evaluate(() => window.__hintLog || []);
  const models = ["mi scusi, ha visto un cane", "dov'è andato?", "sa dov'è andato il cane", 'è sicuro?', 'è sicura?', 'siamo io e margaret', 'scusi il disturbo, permesso?', 'non è il mio cane', 'non lo dico a nessuno', 'ci sono due cani', 'scusi il disturbo.', 'a che ora?', 'può aprire la porta', 'non è il mio cane', 'si chiama biscuit', 'ti piace?', 'ecco un biscotto per biscuit', 'il cane del macchinista e il cane della signora'];
  const bad = hints.filter(h => models.some(m => h.toLowerCase().includes(m)));
  t.check(`no hint gives the Italian answer (${hints.length} hints)`, !bad.length);
  if (bad.length) console.log('   ✗ ' + bad.join(' | '));

  /* ---------- run 2 · "Ieri sera…": after a skip, after a real Lesson 13, a save with none, a save with two ---------- */
  const ieri = async () => { await p.evaluate(() => __debug.l14At('l14-dining')); await until(async () => !(await dbg()).treno || (await dbg()).scene === 'treno', 'the train', 8000); await p.waitForTimeout(1800);
    await p.evaluate(() => __debug.nbOpen('ieri')); await p.waitForTimeout(300);
    const r = { n:await p.$$eval('.nb-ieri li', l => l.length), filled:(await l14()).ieriFilled, ids:(await l14()).ieri }; await press('Escape'); return r; };
  await p.evaluate(() => { localStorage.clear(); }); await p.reload(); await p.waitForTimeout(800);
  await t.jump(14);
  let r = await ieri();
  console.log('   after the skip:', JSON.stringify(r));
  t.check('after the skip link: Ieri sera… lists every dinner clue (six)', r.n === 6 && !r.filled);
  /* a real Lesson 13 ending: the evening's beats, bed, the completion screen's Start Lezione 14 */
  await p.evaluate(() => { localStorage.clear(); }); await p.reload(); await p.waitForTimeout(800);
  await t.jump(13);
  await p.evaluate(() => __debug.l13At('night'));
  await until(async () => (await dbg()).scene === 'treno', 'the train', 8000); await p.waitForTimeout(1800);
  const seen13 = (await dbg()).l13.seen;
  await press('e');
  await until(async () => (await dbg()).scene === 'cabina17', 'compartment 17', 10000); await p.waitForTimeout(1800);
  await place(440, 330, { x:-1, y:0 }); await press('e');
  /* (Lesson 13 asks you to ask Nino when you arrive first: the first E at the bunk is a reminder, the second sleeps) */
  await p.waitForTimeout(1500); if (!(await p.isVisible('#goL14'))) await press('e');
  await until(async () => p.isVisible('#goL14'), 'Lesson 13\'s completion screen', 20000);
  await p.click('#goL14');
  await until(async () => (await dbg()).lesson === 14 && (await dbg()).scene === 'cabina17', 'Lesson 14', 10000);
  r = await ieri();
  console.log('   after a real Lesson 13:', JSON.stringify(r), 'seen:', seen13.join(', '));
  t.check('after a real Lesson 13: the clues it recorded (S.l13.seen), not filled in', !r.filled && r.ids.every(id => seen13.includes(id)) && r.n === r.ids.length && r.n >= 6);
  /* a save with no clues recorded (older): Lesson 14 fills them; a save with two: only those */
  /* (a save restored, then its S.l13.seen emptied: Lesson 13's own restore adds the bedtime clue to an l13-done save) */
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('piazza-lezione-1')); s.lesson = 13; s.tut = 'l13-done'; delete s.l14; localStorage.setItem('piazza-lezione-1', JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(800); await p.click('#btnContinue'); await p.waitForTimeout(800);
  await p.evaluate(() => { const l13 = JSON.parse(localStorage.getItem('piazza-lezione-1')).l13; l13.seen = []; __debug.set({ l13 }); __debug.l14Start(); });
  r = await ieri();
  t.check('a Lesson 13 save with none recorded: every clue (filled in)', r.filled && r.n === 6);
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('piazza-lezione-1')); s.lesson = 13; s.tut = 'l13-done'; s.l13.seen = ['nino-pollo', 'bassi-letto']; delete s.l14; localStorage.setItem('piazza-lezione-1', JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(800); await p.click('#btnContinue'); await p.waitForTimeout(800);
  await p.evaluate(() => __debug.l14Start());
  r = await ieri();
  t.check('a Lesson 13 save with two clues: only those two', !r.filled && r.n === 2 && r.ids.includes('nino-pollo') && r.ids.includes('bassi-letto'));

  /* ---------- run 3 · "Chi è?" → "Sono io e Margaret": understood, with a gentle tip (two people: siamo) ---------- */
  await p.evaluate(() => __debug.l14At('l14-couple'));
  await until(async () => (await dbg()).scene === 'treno', 'the train', 8000); await p.waitForTimeout(3200);
  await place(525, 236, { x:0, y:1 }); await until(async () => (await dbg()).treno.near === 'comp:14', 'at door 14', 4000); await press('e');
  if (!(await until(async () => p.isVisible('#dialog'), 'the voice behind the door', 6000))){ await p.waitForTimeout(1500); await press('e'); }
  await p.waitForSelector('#dialog:not([hidden])', { timeout:12000 }); await p.waitForTimeout(600); await settle(); await t.dump();
  await say(['Sono', 'io', 'e', 'Margaret']);
  h = await hint();
  console.log('   the tip:', h);
  t.check('"Sono io e Margaret": they open (Avanti!), and a tip: two people take siamo', await has('E la signora inglese') && /siamo/.test(h) && await p.isVisible('#choices button >> text="Go in"'));
  await leave();
}, { fakeSpeech:true, viewport:{ width:1280, height:720 } });
