/* Lesson 11 · Al museo, played from the skip link to the completion screen (docs/lessons/11-al-museo.md, test plan), at
   1280 × 720 (the layout test's standard). Speech is faked (harness fakeSpeech).
   The Pietà cutscene (frozen controls: H and the arrows do nothing; only E; the picture opens), the custodian's
   Troppo vicino! and his walk, the handbook opening on the rules box; Lucia's greeting and the barrier between the two
   statues; the word check (one wrong answer) and the practice (11); the two statue tasks with one agreement mistake
   (questa è più vecchio); the ten room tasks: three crowd blocks cleared with Permesso and one Scusi (hint), one wrong
   objective answer (Questo è più vecchio, at the Masaccio → Davvero? Guardi la data!), a reverse comparison accepted
   (Quello è più vecchio di questo), an emotion with the wrong agreement; Vedo, vedo… nel museo, 5 rounds, with one wrong
   pick (a comparison clue); the Canaletto ending and darsi del tu (Lucia uses tu afterwards); the completion screen.
   No hint contains the Italian answer. Then: the hard-mode lexicon, the Vocabolario (≤ 50, the game's words in it), the
   verbs, and Lesson 10's ending (completion button, guide button, the museum doors) leading into Lesson 11. */
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
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#choices').hidden ? 0 : 20000), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const say = async labels => { for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const leave = async () => { await t.leave(); await p.waitForTimeout(300); };
  const l11 = async () => (await dbg()).l11;
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(250); };
  /* the player and Lucia (following) at a spot */
  const at = async (x, y) => { await p.evaluate(([x, y]) => __debug.l11At(x, y), [x, y]); await p.waitForTimeout(250); };
  const spotOf = async id => (await dbg()).galleria.works.find(w => w.id === id).spot;
  const crowd = async () => (await dbg()).crowd;
  const crowdHints = [];
  /* look at a work (E), close it (E): Lucia's question opens */
  const lookAt = async id => {
    const s = await spotOf(id); await at(s.x, s.y);
    t.check(`at ${id}: E would open it`, (await dbg()).galleria.near === id);
    await press('e');
    let g = await dbg();
    if (g.crowd.pick){ console.log('   (blocked: ' + g.crowd.pick.npc + ')'); return 'blocked'; }
    await until(async () => (await dbg()).galleria.open === id, 'the picture ' + id, 5000);
    await press('e');
    await until(async () => (await dbg()).l11.convo && (await dbg()).l11.convo.task, 'Lucia\'s question', 6000);
    await p.waitForTimeout(400); await settle(); await t.dump();
    return (await l11()).convo;
  };
  const permesso = async (id, first = 'permesso') => {
    const s = await spotOf(id); await at(s.x, s.y);
    await press('e');
    await until(async () => !!(await crowd()).pick, 'the pick', 4000);
    const who = (await crowd()).pick.npc;
    if (first === 'scusi'){
      await press('2');
      await until(async () => ((await crowd()).hint || {}).kind === 'scusi', 'the Scusi hint', 4000);
      crowdHints.push((await crowd()).hint.html);
      t.check(`Scusi at ${who}: Sì?, they stay; the hint points to Bruno's word`, (await crowd()).said.some(b => b[0] === who && b[1] === 'Sì?') && /Bruno taught you/.test((await crowd()).hint.html) && !/permesso/i.test((await crowd()).hint.html));
      await p.waitForTimeout(1500);
      await press('e'); await until(async () => !!(await crowd()).pick, 'the pick again', 4000);
    }
    await press('1');
    t.check(`Permesso! → ${who} and their group step aside`, await until(async () => { const g = await dbg(); return !g.galleria.blocked[id]; }, 'the way to clear', 12000));
    await until(async () => !Object.values((await crowd()).people).some(x => x.walking), 'them to stop', 8000);
  };

  /* ---------- the skip link: the Pietà cutscene ---------- */
  await t.jump(11);
  await p.evaluate(() => { window.__hintLog = []; });
  let d = await dbg();
  console.log('   start:', JSON.stringify({ scene:d.scene, tut:d.tut, lesson:d.lesson, cut:d.cut.id }));
  t.check('L11 label', (await p.textContent('#lessonLabel')).includes('Lezione 11 · Al museo'));
  t.check('the museum; a cutscene starts at once (l11-pieta)', d.scene === 'galleria' && d.lesson === 11 && d.tut === 'l11-pieta' && d.cut.on && d.cut.id === 'l11-pieta');
  t.check('the player walks to the Pietà on their own', await until(async () => (await dbg()).cut.walking.includes('player'), 'the walk', 5000));
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(400); await p.keyboard.up('ArrowDown');
  await press('h'); await press('m');
  d = await dbg();
  t.check('controls frozen: no handbook, no map, the arrow keys do nothing', !d.handbook.open && !(await p.isVisible('.mapsvg')) && d.cut.on);
  t.check('…walked right up to the Pietà, over the rope; only E now', await until(async () => { const x = await dbg(); return x.cut.keys.join() === 'e'; }, 'the E step', 15000));
  d = await dbg();
  t.check('inside the rope (no custodian yet: it is a cutscene)', d.galleria.rope.in === 'michelangelo-pieta' && d.galleria.rope.count === 0 && /Press E/.test(d.cut.guide.replace(/<[^>]+>/g, '')));
  const me0 = d.me.join();
  await press('ArrowLeft'); await press('h'); await press('v');
  d = await dbg();
  t.check('only E works (arrows, H, V ignored)', d.me.join() === me0 && !d.handbook.open && !d.galleria.open);
  await t.shot('l11-01-pieta');
  await press('e');
  t.check('E opens the Pietà', await until(async () => (await dbg()).galleria.open === 'michelangelo-pieta', 'the Pietà', 4000));
  await p.waitForTimeout(500); await t.shot('l11-01b-pieta-picture');
  await press('e');
  /* the custodian */
  t.check('the custodian jumps up: Ehi! Troppo vicino! Troppo vicino!', await until(async () => (await crowd()).said.some(b => b[0] === 'guardia' && /Troppo vicino/.test(b[1])), 'Troppo vicino', 6000));
  t.check('l11-custode', (await dbg()).tut === 'l11-custode');
  await until(async () => (await crowd()).said.some(b => b[0] === 'guardia' && b[1] === 'Non si tocca!'), 'Non si tocca!', 8000);
  await p.waitForTimeout(300); await t.shot('l11-02-troppo-vicino');
  t.check('the handbook opens on the rules box', await until(async () => { const x = await dbg(); return x.handbook.open && x.handbook.section === 'regole'; }, 'the rules box', 12000));
  d = await dbg();
  t.check('l11-rules; the player is back behind the rope', d.tut === 'l11-rules' && !d.galleria.rope.in && d.me[1] > 870);
  const rules = await p.$eval('#hb-regole', e => e.innerText);
  t.check('the rules box: Troppo vicino, Non si tocca, È vietato … flash, Si guarda, non si tocca', ['Troppo vicino!', 'Non si tocca!', 'È vietato fare foto con il flash.', 'Si guarda, non si tocca!'].every(s => rules.includes(s)));
  await p.waitForTimeout(300); await t.shot('l11-03-rules');
  await p.click('.sheet [data-close]');
  t.check('closing it: Grazie. Si guarda, non si tocca! and control is back', await until(async () => { const x = await dbg(); return !x.cut.on && x.tut === 'l11-lucia'; }, 'the end of the cutscene', 15000)
    && (await crowd()).said.some(b => b[0] === 'guardia' && /Si guarda, non si tocca/.test(b[1])));
  d = await dbg();
  t.check('the custodian is back on his chair, and his name tag reads Custode', d.npcs.guardia.join() === '716,800' && d.l11.guardiaKnown);
  t.check('→ talk to the woman with the sketchbook', await objective('Talk to the woman with the sketchbook'));

  /* ---------- Lucia: the greeting, the barrier ---------- */
  await until(async () => (await crowd()).said.some(b => b[0] === 'lucia'), 'Lucia to call out', 4000);
  await p.evaluate(() => __debug.place(912, 700)); await p.waitForTimeout(300);
  await press('e');
  await p.waitForSelector('#dialog:not([hidden])'); await settle(); await t.dump();
  t.check('Lucia: Ma… Lei è Sam? Il Gattamelata!', await has('Ma… Lei è Sam? Il Gattamelata! Si ricorda?'));
  console.log('   bank:', (await p.$$eval('#bank .bank-label', ls => ls.map(l => l.textContent))).join(', '));
  await say(['Buongiorno', 'Lucia']);
  t.check('she explains her homework and asks: questa o quella? più vecchia?', await has("Ho un compito per la scuola d'arte") && await has('quale è più bella? Questa o quella? E quale è più vecchia?'));
  await t.shot('l11-04-lucia');
  await say(['questa', 'è', 'bella']);
  t.check('the barrier: no words for comparing → the handbook', await has('no words for it') && (await l11()).barrier);
  await t.shot('l11-05-barrier');
  await t.choose(); await p.waitForTimeout(500);
  t.check('the handbook opens at Lezione 11', (await p.textContent('.sheet h2')).includes('Al museo'));
  t.check('→ learn the words', await objective('Learn the Lesson 11 words'));

  /* ---------- the chapter, the word check, the practice ---------- */
  const voc = await p.$$eval('.vocab .vrow', rs => rs.map(r => r.innerText.replace(/\s+/g, ' ').trim()));
  console.log('   Vocabolario:', voc.length, 'words');
  t.check('Vocabolario: at most 50 terms, the doc\'s words in it', voc.length <= 50 && voc.length >= 42 && ['il quadro', 'Troppo vicino!', 'più … di', 'quello / quella', "c'è / ci sono", 'vecchio / vecchia', 'giovane', 'sembra', 'mi piacciono', 'preferisce', "l'angelo", 'Trova!']
    .every(w => voc.some(v => v.startsWith(w))));
  const how = await p.$eval('#hb-how', e => e.innerText);
  t.check('how it works: più … di, agreement with sembra, mi piace / mi piacciono, preferisco', how.includes('Questo è più vecchio di quello') && how.includes('Giuditta sembra arrabbiata') && how.includes('mi piacciono') && how.includes('preferisco'));
  const wc = await t.wordCheck({ wrong:true });
  t.check('word check: every word right once, the missed one came back', wc.phase === 'done' && wc.cameBack && wc.items === wc.total + 1);
  t.check('→ practice', await objective('Finish the Lesson 11 practice'));
  await t.practice([['o', 0], ['o', 1], ['o', 1], ['o', 1], ['o', 1], ['o', 1], ['t', ['Questo', 'è', 'più', 'grande', 'di', 'quello']], ['o', 1], ['o', 1], ['o', 0], ['t', ['Oloferne', 'sembra', 'spaventato']]]);
  t.check('practice (11 questions) → help Lucia with the statues', await objective('Help Lucia with the statues · 0/2'));

  /* ---------- the statues ---------- */
  await p.evaluate(() => __debug.place(912, 700)); await p.waitForTimeout(300);
  await press('e'); await p.waitForSelector('#dialog:not([hidden])'); await settle(); await t.dump();
  t.check('Lucia: first two statues, then the paintings; I\'ll come with you', await has('Prima due statue, poi i quadri'));
  await t.choose(); await p.waitForTimeout(1200);
  d = await dbg();
  t.check('Lucia follows the player now', d.l11.follow && d.l11.following);
  /* a real walk (tap to walk): she follows */
  const ap = await spotOf('bernini-apollo');
  const cam = (await dbg()).galleria.cam;
  await t.clickWorld(ap.x - cam[0], ap.y - cam[1]);
  await until(async () => { const x = await dbg(); return Math.hypot(x.me[0] - ap.x, x.me[1] - ap.y) < 8; }, 'the walk to Apollo', 8000);
  await p.waitForTimeout(900);
  d = await dbg();
  t.check('…and she followed (within reach)', Math.hypot(d.l11.lucia[0] - d.me[0], d.l11.lucia[1] - d.me[1]) < 70);
  console.log('STATUE 1 · Apollo e Dafne');
  let c = await lookAt('bernini-apollo');
  t.check('closing the picture: Lucia asks (questa o quella? più vecchia?), the two plaques under it', c && c.task === 's-apollo' && c.at === 'bernini-apollo' && await has('Quale è più vecchia?') && await has('1625') && await has('1793'));
  await say(['Questa', 'è', 'più', 'vecchio', 'di', 'quella']);
  t.check('agreement mistake (questa è più vecchio) → feedback on the word: vecchia', /statua is feminine: vecchia/.test(await hint()) && (await l11()).mistakes.agree === 1 && (await l11()).convo.q === 0);
  await t.shot('l11-06-agreement');
  await say(['Questa', 'è', 'più', 'vecchia', 'di', 'quella']);
  t.check('accepted (1625 vs 1793); the next question: Quale preferisce?', await has('Più vecchia: 1625') && await has('Quale preferisce?') && (await l11()).convo.q === 1);
  await say(['Preferisco', 'quella']);
  t.check('an opinion: accepted, Lucia reacts; ticked', (await l11()).tasks['s-apollo'].done && await has('Lucia\'s sheet'));
  await leave();
  t.check('1/2 statues', await objective('Help Lucia with the statues · 1/2'));
  /* stepping over a rope: the custodian again */
  const per = (await dbg()).galleria.works.find(w => w.id === 'cellini-perseo').block;
  await at(per.x + per.w / 2, per.y + per.h + 22);
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(350); await p.keyboard.up('ArrowUp');
  t.check('stepping over Perseo\'s rope: Troppo vicino!, walked back out, counted', await until(async () => (await l11()).tooClose === 1 && !(await dbg()).cut.on, 'the nudge', 6000) && !(await dbg()).galleria.rope.in);
  console.log('STATUE 2 · La Pietà');
  c = await lookAt('michelangelo-pieta');
  t.check('the Pietà: Maria sembra felice, triste o arrabbiata?', c && c.task === 's-pieta' && await has('Maria sembra felice, triste o arrabbiata?'));
  await say(['Sembra', 'calmo']);
  t.check('Maria sembra calmo → Maria is a woman: calma', /Maria is a woman: calma/.test(await hint()));
  await say(['Secondo me', 'Sembra', 'triste']);
  t.check('Secondo me, sembra triste: accepted; Cosa Le piace di questa statua?', await has('Cosa Le piace di questa statua?'));
  await say(['Mi piace', 'i colori']);
  t.check('mi piace i colori → i colori is more than one thing: mi piacciono', /more than one thing: mi piacciono/.test(await hint()));
  await say(['Mi piacciono', 'i colori']);
  t.check('mi piacciono i colori… of a marble statue: Ma è bianca!', await has('Ma è bianca!') && (await l11()).tasks['s-pieta'].done);
  await leave();
  t.check('two statues → Lucia\'s sheet (the notepad checklist) opens', await until(async () => (await dbg()).list.sheet, 'the sheet', 4000) && (await dbg()).tut === 'l11-rooms');
  await p.waitForTimeout(300); await t.shot('l11-07-sheet');
  d = await dbg();
  t.check('the sheet: the five rooms, 2 to do in each', d.list.sheet.filter(x => /^Sala \d/.test(x)).length === 5 && d.list.button);
  await p.click('.sheet [data-close]'); await p.waitForTimeout(300);
  t.check('→ Lucia\'s sheet · 0/10', await objective("Lucia's sheet · 0/10"));

  /* ---------- the rooms ---------- */
  console.log('SALA 1');
  await permesso('uccello-san-romano', 'scusi');
  t.check('Permesso counted', (await l11()).permesso === 1 && (await l11()).scusi === 1);
  c = await lookAt('uccello-san-romano');
  t.check('La battaglia: Quanti cavalli ci sono?', c && c.task === 'r1-battaglia' && await has('Quanti cavalli ci sono?'));
  await say(['Ci sono', 'tre', 'cavalli']);
  t.check('three horses: Solo tre? Guardi bene (a fact: more)', await has('Solo tre?') && (await l11()).mistakes.fact === 1);
  await say(['Ci sono', 'otto', 'cavalli']);
  t.check('eight: Sì, tanti!', await has('Sì, tanti!') && (await l11()).tasks['r1-battaglia'].done);
  await leave();
  c = await lookAt('masaccio-tributo');
  t.check('at the Masaccio: Quale è più vecchio? (the plaques: 1333, c. 1425)', c && c.task === 'r1-annunciazione' && c.at === 'masaccio-tributo' && await has('1333') && await has('c. 1425'));
  await say(['Questo', 'è', 'più', 'vecchio', 'di', 'quello']);
  t.check('Questo è più vecchio (it isn\'t) → Davvero? Guardi la data!', await has('Davvero? Guardi la data!') && (await l11()).mistakes.fact === 2);
  await t.shot('l11-08-compare');
  await say(['quello', 'è', 'più', 'vecchio', 'di', 'Questo']);
  t.check('the reverse comparison (Quello è più vecchio di questo): accepted', (await l11()).tasks['r1-annunciazione'].done);
  await leave();
  t.check('Sala 1: 2/2 → 2/10', await objective("Lucia's sheet · 2/10"));
  console.log('SALA 2');
  await permesso('botticelli-primavera');
  c = await lookAt('botticelli-primavera');
  await say(['Ci sono', 'nove', 'persone']);
  t.check('La Primavera: nove persone (with the little angel)', await has('Nove, sì!') && (await l11()).tasks['r2-primavera'].done);
  await leave();
  c = await lookAt('leonardo-dama');
  await say(['Questo', 'è', 'più', 'piccolo', 'di', 'quello']);
  t.check('at the Leonardo: Questo è più piccolo di quello', (await l11()).tasks['r2-dama'].done);
  await leave();
  console.log('SALA 3');
  await permesso('caravaggio-giuditta');
  c = await lookAt('caravaggio-giuditta');
  t.check('Giuditta: felice, arrabbiata o spaventata?', await has('Giuditta sembra felice, arrabbiata o spaventata?'));
  await say(['Sembra', 'arrabbiato']);
  t.check('emotion with the wrong agreement → Giuditta is a woman: arrabbiata', /Giuditta is a woman: arrabbiata/.test(await hint()));
  await t.shot('l11-09-emotion');
  await say(['Sembra', 'arrabbiata']);
  t.check('…then: E Oloferne?', await has('E Oloferne?'));
  await say(['Sembra', 'spaventato']);
  t.check('Oloferne sembra spaventato: done', (await l11()).tasks['r3-giuditta'].done);
  await leave();
  c = await lookAt('caravaggio-matteo');
  await say(['è', 'più', 'scuro']);
  t.check('San Matteo: È più scuro (vs Reni): accepted', (await l11()).tasks['r3-matteo'].done);
  await leave();
  t.check('Sala 3 is full: the Mangiafagioli has nothing to ask', !(await l11()).open.includes('r3-mangiafagioli'));
  console.log('SALA 4');
  await permesso('balla-cane');
  c = await lookAt('balla-cane');
  await say(["C'è", 'un cane']);
  t.check("Balla: C'è un cane", (await l11()).tasks['r4-cane'].done);
  await leave();
  c = await lookAt('dechirico-canto');
  await say(['Questo', 'è', 'più', 'moderno', 'di', 'quello']);
  t.check('at the de Chirico: Questo è più moderno di quello (1914 vs 1910)', (await l11()).tasks['r4-citta'].done);
  await leave();
  console.log('SALA 5');
  const s5 = await spotOf('raffaello-atene'); await at(s5.x, s5.y + 10);
  await press('e'); await until(async () => !!(await crowd()).pick, 'the pick', 4000);
  await p.waitForTimeout(350); await t.shot('l11-10-permesso');
  await press('1');
  t.check('Permesso! → the school group at the rope steps aside', await until(async () => !(await dbg()).galleria.blocked['raffaello-atene'], 'the group', 12000));
  await until(async () => !Object.values((await crowd()).people).some(x => x.walking), 'them to stop', 8000);
  c = await lookAt('raffaello-atene');
  await say(['Sì', 'è', 'il più', 'grande']);
  t.check('La scuola di Atene: Sì, è il più grande', (await l11()).tasks['r5-atene'].done);
  await leave();
  c = await lookAt('raffaello-san-michele');
  t.check('San Michele: the busiest dialog (plaques, the full tile bank)', c && c.task === 'r5-giorgio');
  /* the layout at 1280 × 720: a hint shown, the Dillo button, the plaques, a tile of the last group */
  await say(['Questo', 'è', 'più', 'bello', 'di', 'quello']);
  const probe = sel => p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return { missing:true }; const b = e.getBoundingClientRect();
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return { ok:b.top >= 0 && b.bottom <= innerHeight && b.width > 0 && !!hit && (hit === e || e.contains(hit)), r:[b.left, b.top, b.right, b.bottom].map(Math.round) }; }, sel);
  const L1 = await probe('#btnSay'), L2 = await probe('#hint'), L3 = await probe('.l11-plaques');
  console.log('   1280×720:', JSON.stringify({ say:L1, hint:L2, plaques:L3 }));
  t.check('1280×720: Dillo and the hint on screen and clickable (an opinion adjective: what Lucia wants)', L1.ok && L2.ok && /size/.test(await hint()));
  await t.shot('l11-11-busy-dialog');
  await say(['Questo', 'è', 'più', 'grande', 'di', 'quello']);
  t.check('at San Michele: Questo è più grande di quello (268 vs 29 cm)', (await l11()).tasks['r5-giorgio'].done);
  await leave();
  t.check('10/10 → Find the works Lucia describes; she stops following and walks to Sala 5', await until(async () => (await dbg()).tut === 'l11-vedo', 'l11-vedo', 4000) && !(await l11()).follow);
  t.check('Lucia sits on the bench in Sala 5', await until(async () => { const x = await l11(); return !x.walking && x.seated && x.lucia.join() === '982,289'; }, 'Lucia on the bench', 30000));
  d = await dbg();
  console.log('   l11:', JSON.stringify({ permesso:d.l11.permesso, scusi:d.l11.scusi, mistakes:d.l11.mistakes, tooClose:d.l11.tooClose }));
  t.check('three or more crowd blocks cleared with Permesso, one Scusi', d.l11.permesso >= 3 && d.l11.scusi === 1);

  /* ---------- Vedo, vedo… nel museo ---------- */
  await p.evaluate(() => __debug.place(982, 336)); await p.waitForTimeout(300);
  await press('e'); await p.waitForSelector('#dialog:not([hidden])'); await settle(); await t.dump();
  t.check('Lucia: homework done, Adesso giochiamo!', await has('Il compito è finito!') && await has('Adesso giochiamo!'));
  await t.choose();
  const mi = async () => (await dbg()).mispy;
  t.check('the game starts (5 rounds)', await until(async () => { const x = await mi(); return x.active && x.phase === 'find' && !!x.target; }, 'the first round', 10000) && (await mi()).rounds === 5);
  let sawClue = '', targets = [];
  for (let k = 0; k < 5; k++){
    await until(async () => { const x = await mi(); return x.phase === 'find' && x.k === k && !!x.target; }, 'round ' + (k + 1), 10000);
    let x = await mi(); targets.push(x.target);
    console.log(`   ${k + 1}. [tier ${x.tier}] ${x.line} → ${x.target}`);
    if (k === 0){
      const G = (await dbg()).galleria, wrong = G.works.find(w => w.id !== x.target && w.id !== 'canaletto-canal-grande' && w.kind === x.kind && !G.blocked[w.id]);
      await at(wrong.spot.x, wrong.spot.y); await press('e'); await p.waitForTimeout(400);
      x = await mi(); sawClue = x.clue || '';
      console.log('   wrong pick:', wrong.id, '→', x.clue);
      if (k === 0){ await p.waitForTimeout(300); await t.shot('l11-12-vedo'); }
    }
    const blk = (await dbg()).galleria.blocked[x.target];
    await at(x.spot.x, x.spot.y);
    if (blk){ await press('e'); await until(async () => !!(await crowd()).pick, 'the pick', 3000); await press('1'); await until(async () => !(await dbg()).galleria.blocked[x.target], 'clear', 10000); await p.waitForTimeout(1500); await at(x.spot.x, x.spot.y); }
    await press('e');
    await until(async () => { const y = await mi(); return y.k === k + 1 || y.done; }, 'the right pick', 5000);
  }
  await until(async () => (await mi()).done, 'the game to end', 8000);
  let M = await mi();
  t.check('one wrong work → a comparison clue (No, non è questo/questa…)', /^No, non è quest[oa]\./.test(sawClue) && M.misses === 1);
  t.check('5 rounds found; Canaletto is never a target', M.done && M.result.rounds === 5 && !targets.includes('canaletto-canal-grande'));
  await p.click('#mispy [data-mi=close]');
  t.check('→ l11-venezia: Lucia walks to Canaletto (Sala 3)', await until(async () => (await dbg()).tut === 'l11-venezia', 'l11-venezia', 4000));
  t.check('Lucia arrives by the Canaletto', await until(async () => { const x = await l11(); return !x.walking && x.lucia.join() === '1706,510'; }, 'Lucia at Canaletto', 40000) || console.log('   lucia:', JSON.stringify(await l11()), (await dbg()).me));

  /* ---------- Canaletto, darsi del tu ---------- */
  const cs = await spotOf('canaletto-canal-grande'); await p.evaluate(s => __debug.place(s.x, s.y), cs); await p.waitForTimeout(300);
  await press('e'); await p.waitForSelector('#dialog:not([hidden])'); await settle(); await t.dump();
  t.check('Lucia: il mio quadro preferito… Lei va a Venezia?', await has('Questo è il mio quadro preferito. Venezia… è bellissima! Lei va a Venezia?'));
  await say(['Sì']);
  t.check('Sì → Senta… possiamo darci del tu?', await has('Possiamo darci del tu?') || await has('possiamo darci del tu?'));
  await say(['Sì, certo!']);
  d = await dbg();
  t.check('darsi del tu: Lucia uses tu from now on', d.l11.tu && !d.l11.formal && await has('da adesso, tu!'));
  await t.shot('l11-13-tu');
  await say(['Arrivederci']);
  t.check('Arrivederci? → Ma no! Adesso siamo amici! (a hint, no Italian)', await has('Adesso siamo amici!'));
  await say(['Ciao']);
  t.check('Ciao → Ciao, Sam! Buon viaggio!', await has('Ciao, Sam! Buon viaggio!'));
  await leave();
  t.check('the completion screen', await until(async () => (await dbg()).tut === 'l11-done' && await p.isVisible('.sheet h2'), 'completion', 6000));
  await p.waitForTimeout(600);
  const done = await p.textContent('.sheet');
  t.check('completion: Lezione 11 completata, Lucia\'s sheet filled in with your answers, the numbers', done.includes('Lezione 11 completata!') && done.includes('Questa è più vecchia di quella.') && done.includes('Ci sono nove persone.') && done.includes('works found in Vedo, vedo'));
  await t.shot('l11-14-complete');
  await p.click('.sheet .cta [data-close]'); await p.waitForTimeout(300);
  t.check('L11 objective completed', await objective('Lezione 11 completata'));

  /* ---------- afterwards: Lucia uses tu; the dictionary; the verbs ---------- */
  await p.evaluate(() => __debug.place(1750, 520)); await p.waitForTimeout(200);
  t.check('Lucia\'s greeting is tu now (Ciao), and she is not formal', await p.evaluate(() => __dbg().l11.formal === false));
  await press('v');
  const dict = await p.textContent('.sheet');
  t.check('dictionary: Lezione 11 and its Vocabolario', dict.includes('Lezione 11') && /mi piacciono/i.test(dict) && dict.includes('Troppo vicino!'));
  await p.click('.sheet [data-close]');
  const gv = await p.evaluate(() => ['sembrare', 'preferire', 'piacere'].map(inf => __grammarVerbs().find(v => v.inf === inf)));
  t.check('grammar drill: sembra / sembrano, preferisco / preferisci / preferisce, mi piacciono (Lesson 11)', gv.every(Boolean) && ['sembra', 'sembrano'].every(f => gv[0].forms.some(x => x.it === f && x.lesson === 11))
    && ['preferisco', 'preferisci', 'preferisce'].every(f => gv[1].forms.some(x => x.it === f && x.lesson === 11)) && gv[2].forms.some(x => x.it === 'mi piacciono' && x.lesson === 11));
  t.check('grammar lint clean', (await p.evaluate(() => __grammarLint())).length === 0);
  const vv = await p.evaluate(() => ({ audit:__vocabAudit()[11], lint:__vocabLint()[11], mispy:__mispyVocab() }));
  t.check('vocab audit: every Lesson 11 tile word is taught; list well-formed', vv.audit.length === 0 && vv.lint.length === 0);
  t.check('every word of the museum\'s Vedo, vedo is in Lesson 11\'s Vocabolario', vv.mispy.every(w => voc.some(v => v.startsWith(w))));
  t.check('Vedo, vedo… nel museo is in Studio now', (await dbg()).mispy.unlocked);

  /* ---------- the lexicon: the doc's hard-mode alternatives (and more) ---------- */
  const lex = await p.evaluate(() => {
    const ok = (s, task, qi, at) => { const r = __l11Check(s, task, qi, at); return r.ok || `${s} @${task}: ${JSON.stringify(r)}`; };
    const no = (s, task, qi, at, m) => { const r = __l11Check(s, task, qi, at); return (!r.ok && r.mistake === m) || `${s} @${task} should be ${m}: ${JSON.stringify(r)}`; };
    return [ok('quello è più vecchio di questo', 'r1-annunciazione', 0, 'masaccio-tributo'), ok('è più vecchio', 'r1-annunciazione', 0, 'martini-annunciazione'),
      ok('questo è meno vecchio di quello', 'r1-annunciazione', 0, 'masaccio-tributo'), ok('sì è più grande', 'r5-atene', 0), ok('secondo me sembra triste', 'r1-orazione', 0),
      ok('mi piace molto', 'r2-tempesta', 1), ok('preferisco quella', 's-apollo', 1), ok('ci sono tanti cavalli', 'r1-battaglia', 0), ok('vedo un uomo e una donna', 'r2-tempesta', 0),
      ok('sembra giovane', 'r5-autoritratto', 0), ok('sì', 'r3-mangiafagioli', 0), ok('questa è più alta di quella', 's-perseo', 0, 'cellini-perseo'),
      no('questo è più vecchio di quello', 'r1-annunciazione', 0, 'masaccio-tributo', 'fact'), no('questa è più vecchio di quella', 's-apollo', 0, 'bernini-apollo', 'agree'),
      no('questo è più vecchia di quello', 'r1-annunciazione', 0, 'martini-annunciazione', 'agree'), no("c'è tre cavalli", 'r1-battaglia', 0, null, 'agree'),
      no('sembra vecchio', 'r5-autoritratto', 0, null, 'fact'), no('vedo un cane', 'r2-tempesta', 0, null, 'fact'), no('mi piacciono il viso', 's-pieta', 1, null, 'agree'),
      no('quello è più piccolo di questo', 'r2-dama', 0, 'leonardo-dama', 'fact'), no("c'è un cavallo", 'r4-cane', 0, null, 'fact')];
  });
  const lexBad = lex.filter(x => x !== true);
  if (lexBad.length) console.log('   lexicon problems:\n     ' + lexBad.join('\n     '));
  t.check('lexicon: the hard-mode alternatives accepted, false comparisons and bad agreement caught', lexBad.length === 0);

  /* ---------- no hint gave the answer ---------- */
  const norm = x => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const forbidden = ['questa è più vecchia di quella', 'questo è più vecchio di quello', 'quello è più vecchio di questo', 'questo è più piccolo di quello', 'questo è più moderno di quello',
    'questo è più grande di quello', 'questa è più alta di quella', 'è più scuro', 'sembra triste', 'sembra arrabbiata', 'sembra spaventato', 'sembra giovane', 'ci sono nove persone',
    "c'è un cane", 'ci sono otto cavalli', 'mi piacciono i colori', 'mi piace il viso', 'preferisco questa', 'preferisco quella', 'è il più grande', 'vedo un uomo', 'sì certo', 'permesso'].map(norm);
  const shown = (await p.evaluate(() => window.__hintLog)).concat(crowdHints);
  const leaks = shown.filter(h => forbidden.some(m => norm(h).includes(m)));
  console.log(`   ${shown.length} hints shown; leaks: ${leaks.join(' | ') || 'none'}`);
  t.check('no hint contains the Italian answer', shown.length > 10 && leaks.length === 0);

  /* ---------- Lesson 10's end leads here: the completion screen, the guide, the museum doors ---------- */
  const q = await p.context().browser().newPage({ viewport:{ width:1280, height:720 } });
  q.on('pageerror', e => { console.log('pageerror (l10): ' + e.message); });
  await q.goto(p.url());
  await q.fill('#nameInput', 'Sam'); await q.click('[data-jump="10"]'); await q.waitForTimeout(2600);
  await q.evaluate(() => { __debug.set({ tut:'l10-go' }); __debug.travel('museo', { x:400, y:206 }); }); await q.waitForTimeout(2600);
  await q.keyboard.press('e');
  let okDone = false; for (let i = 0; i < 60 && !okDone; i++){ await q.waitForTimeout(200); okDone = await q.evaluate(() => __dbg().tut === 'l10-done' && !!document.querySelector('#goL11')); }
  t.check('Lesson 10\'s completion screen: Start Lezione 11', okDone);
  await q.click('.sheet .cta [data-close]'); await q.waitForTimeout(500);
  const gb = await q.$('#guideText [data-action="l11"]');
  t.check('…the guide offers Start Lezione 11 · Al museo', !!gb && (await gb.textContent()).includes('Start Lezione 11 · Al museo'));
  await q.evaluate(() => __debug.place(400, 206)); await q.waitForTimeout(200);
  await q.keyboard.press('e'); await q.waitForTimeout(3400);
  t.check('…and the museum doors lead into Lesson 11 (the Pietà cutscene)', await q.evaluate(() => __dbg().lesson === 11 && __dbg().scene === 'galleria' && __dbg().cut.id === 'l11-pieta'));
  await q.evaluate(() => { localStorage.clear(); }); await q.reload(); await q.waitForTimeout(400);
  await q.fill('#nameInput', 'Sam'); await q.click('[data-jump="10"]'); await q.waitForTimeout(2600);
  await q.evaluate(() => { __debug.set({ tut:'l10-go' }); __debug.travel('museo', { x:400, y:206 }); }); await q.waitForTimeout(2600);
  await q.keyboard.press('e');
  for (let i = 0; i < 60; i++){ await q.waitForTimeout(200); if (await q.$('#goL11')) break; }
  await q.click('#goL11'); await q.waitForTimeout(3400);
  t.check('…and its Start Lezione 11 button starts it', await q.evaluate(() => __dbg().lesson === 11 && __dbg().scene === 'galleria' && __dbg().tut === 'l11-pieta'));
  await q.close();
}, { fakeSpeech:true, viewport:{ width:1280, height:720 } });
