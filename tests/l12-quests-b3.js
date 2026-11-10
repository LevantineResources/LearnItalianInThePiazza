/* Lesson 12's quests, batch 3, played for real as a player would: the bridge and the park.
   - Una foto sul ponte (afternoon): the map's "!" → Ponte Molino → Anna: "Buongiorno! Che bella giornata, eh?" → her scheda →
     small talk first: "Fa freddo." in the sun (they laugh, it doesn't count), "C'è il sole." (→ "E il ponte… bello, no?"),
     "Il ponte è antico." (→ "…con il telefono, il ponte non entra nella foto!") → you offer: "Vi faccio una foto?" → "Sì!
     Grazie! Ci fa una foto? … Ecco il telefono." → the camera beside the conversation: a shot with only one of them in it
     (refused), the frame dragged with the mouse over both, a serious photo (no smiles yet), "Sorridete!", the good photo →
     goodbye, the stamp, the clock on.
   - L'aquilone (afternoon): the map's "!" → the Giardini → Pietro (the kite high in the big tree) → his scheda → the gardener:
     "Ha una scala?" ("perché?") → "L'aquilone è in alto, sull'albero." → he fetches the ladder (a cutscene) → E at the
     ladder: up, the kite into the bag → "Ecco l'aquilone!" to Pietro → the stamp, the kite flying.
   - the third afternoon task → the dusk → night.
   - Il tramonto sul ponte (night): the bridge at sunset → Sara and Tommaso remember you ("Ancora tu! Il fotografo!") and ask
     "Guarda il tramonto! Non è bello?" → her scheda → "Le luci sono bellissime" (not yet: "Non ancora…") → "Sì! Che bel
     tramonto!" → the lights come on (the sky turns to night, the lamps one by one) → "Guarda le luci è bellissimo" (the
     plural: sono bellissime) → "Fa un po' freddo." ("Sì, c'è un po' di vento sul fiume") → the stamp.
   Also: the park at night, busy dialogs at 1280 × 720 (the camera with the tile bank, the gardener's bank, Sara's), and no hint
   contains the Italian answer. Screenshots: tests/shots/b3-*.png. */
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
  const arrive = async scene => { await until(async () => (await dbg()).scene === scene, scene); await until(async () => p.evaluate(() => !document.querySelector('#fade').classList.contains('on')), 'the fade', 8000); await p.waitForTimeout(500); };
  const jpg = async name => { await p.screenshot({ path:require('path').join(require('./lib/harness').SHOTS, name + '.jpg'), type:'jpeg', quality:72 }); };
  const noGuide = async on => p.evaluate(on => { let s = document.querySelector('#shotStyle'); if (!s){ s = document.createElement('style'); s.id = 'shotStyle'; document.head.appendChild(s); } s.textContent = on ? '#guide{visibility:hidden!important}' : ''; }, on);
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
  /* a scheda: its word check (one miss, which comes back), then its practice */
  const scheda = async (id, answers) => {
    await until(async () => (await Q()).scheda.open && (await Q()).scheda.id === id, 'the scheda ' + id, 8000);
    await p.click('[data-sch-tab="words"]'); await p.waitForTimeout(200);
    const wc = await p.evaluate(() => { const w = () => __dbg().quests.scheda.words, click = s => { const b = document.querySelector(s); if (b) b.click(); };
      let g = 0, wrongId = null, cameBack = false; while (w().phase === 'cards' && g++ < 200) click('[data-vc=next]');
      while (w().phase === 'quiz' && g++ < 400){ const s = w(); if (s.status !== 'answer'){ click('[data-vc=next]'); continue; }
        if (!wrongId){ wrongId = s.cur.id; click(`[data-vq="${(s.cur.answer + 1) % s.cur.opts.length}"]`); } else { if (s.cur.id === wrongId && s.cur.again) cameBack = true; click(`[data-vq="${s.cur.answer}"]`); } }
      return { cameBack, passed:w().passed, total:w().total }; });
    await p.click('[data-sch-tab="practice"]'); await p.waitForTimeout(200);
    for (const k of answers){ await p.click(`[data-opt="${k}"]`); await p.click('#pxNext'); }
    await p.waitForTimeout(300); await press('Escape');
    const q = (await Q()).quests[id];
    console.log(`   scheda ${id}: ${wc.total} words, a miss came back: ${wc.cameBack}, practice: ${q.practice}`);
    return wc.passed && wc.cameBack && wc.total >= 5 && wc.total <= 10 && q.practice;
  };
  await p.evaluate(() => { window.__hintLog = []; });

  await t.jump(12);
  await p.evaluate(() => __debug.l12Explore()); await p.waitForTimeout(500);
  await until(async () => !(await dbg()).cut.on, 'no cutscene', 4000);

  /* ================= Una foto sul ponte ================= */
  await press('m');
  t.check('the map: "!" spots for the photo and the kite; the sunset is closed (apre stasera); the Ponte and Giardini landmarks',
    !!(await p.$('.qspot:not(.closed)[data-qspot="q:foto"]')) && !!(await p.$('.qspot:not(.closed)[data-qspot="q:aquilone"]')) && !!(await p.$('.qspot.closed[data-qspot="q:tramonto"]'))
    && /Ponte/.test(await p.textContent('.mapsvg')) && /Giardini/.test(await p.textContent('.mapsvg')));
  await t.shot('b3-00-map');
  await p.click('[data-qspot="q:foto"] .qs-dot');
  await arrive('ponte');
  let d = await dbg();
  t.check('the "!" → Ponte Molino by day: Anna (the marker) and Giulio at the parapet, passers-by, no Sara', d.ponte.sky === 'day' && !!d.npcs.anna && !!d.npcs.giulio && !!d.npcs.pittrice && !d.npcs.sara && d.quests.markers.includes('anna'));
  await noGuide(true); await t.shot('b3-01-ponte-day'); await noGuide(false);
  await talk(458, 396);                                                          // (Giulio lets Anna do the talking)
  t.check('Giulio → Anna: "Buongiorno! Che bella giornata, eh?" (the task starts; no "Mi può fare una foto?")', await has('Che bella giornata, eh?') && !(await has('Mi può fare una foto')) && (await Q()).quests.foto.state === 'active');
  await leave();
  t.check('Una foto sul ponte: its scheda done', await scheda('foto', [0, 1, 1, 1]));
  await talk(420, 394);
  t.check('Anna again: Buongiorno! Che bella giornata, eh? (the step: chat)', await has('Che bella giornata, eh?') && (await Q()).quests.foto.step === 'chat');
  await say(['Fa freddo.']);
  t.check('Fa freddo. in the sunshine → they laugh (Freddo?! Ahah!), and it doesn\'t count', await has('Freddo?! Ahah!') && !(await dbg()).foto.weather && (await dbg()).crowd.said.some(x => x[0] === 'giulio' && /Ahah/.test(x[1])));
  await say(["C'è il sole."]);
  t.check("C'è il sole. → Sì, c'è il sole! Finalmente! E il ponte… bello, no?", await has("Sì, c'è il sole! Finalmente!") && await has('E il ponte… bello, no?') && (await dbg()).foto.weather);
  await say(['il ponte', 'è antico']);
  d = await dbg();
  t.check('Il ponte è antico. → È antichissimo: è romano! … con il telefono, il ponte non entra nella foto! (the step: photo; the hint: offer)', await has('è romano!') && await has('il ponte non entra nella foto!') && d.foto.view && d.quests.quests.foto.step === 'photo' && /Offer to take the photo/.test(await hint()));
  await say(['Vi faccio una foto?']);
  d = await dbg();
  t.check('Vi faccio una foto? → Sì! Grazie! Ci fa una foto? … Ecco il telefono.; the camera opens beside the conversation (their phone in your hands)', await has('Ci fa una foto?') && await has('Ecco il telefono.') && !(await has('macchina fotografica')) && d.foto.cam.on && d.foto.handed && !d.foto.cam.both);
  await jpg('b3-p1-foto-offer');
  await layout('the camera with the tile bank', ['#camShoot', '[data-cam-nudge="1,0"]', '#btnSay', '#hint', 'tile:Sorridete!', 'tile:è bellissimo']);
  await t.shot('b3-02-camera');
  await p.click('#camShoot'); await p.waitForTimeout(300);
  d = await dbg();
  t.check('the shutter with only one of them in the frame: refused (no photo)', d.foto.shots === 0 && /isn't in the picture|cut off/.test(await p.textContent('#camNote')));
  /* drag the frame over both of them with the mouse */
  const box = await p.$eval('.camsvg', s => { const b = s.getBoundingClientRect(); return { l:b.left, t:b.top, w:b.width, h:b.height }; });
  const at = (x, y) => [box.l + x / 400 * box.w, box.t + y / 300 * box.h];
  const f0 = d.foto.cam;
  await p.mouse.move(...at(f0.x + 86, f0.y + 75)); await p.mouse.down();
  for (let k = 1; k <= 8; k++) await p.mouse.move(...at(f0.x + 86 + (170 - f0.x) * k / 8, f0.y + 75 + (66 - f0.y) * k / 8));
  await p.mouse.up(); await p.waitForTimeout(200);
  d = await dbg();
  t.check(`dragged: both of them in the frame (frame at ${d.foto.cam.x}, ${d.foto.cam.y})`, d.foto.cam.both);
  await p.click('#camShoot'); await settle();
  d = await dbg();
  t.check('a photo before they smile: it comes out serious; Anna: siamo un po\' seri… Un\'altra?', d.foto.shots === 1 && !d.foto.shot && await has('siamo un po\' seri'));
  await say(['Sorridete!']);
  t.check('Sorridete! → Ahah! Sì! (they smile)', await has('Ahah! Sì!') && (await dbg()).foto.cam.smile);
  await p.click('#camShoot'); await settle();
  d = await dbg();
  t.check('the photo: both in it, smiling: Che bella foto! Grazie mille! Arrivederci, e buona giornata!; the task done, a stamp, 16:30',
    d.foto.shot && await has('Che bella foto! Grazie mille!') && await has('Arrivederci, e buona giornata!') && !!(await p.$('.cam-photo')) && d.quests.quests.foto.done && d.quests.passport.includes('foto') && d.quests.clock === '16:30');
  await t.shot('b3-03-photo');
  await leave();

  /* ================= L'aquilone ================= */
  await press('m'); await p.click('[data-qspot="q:aquilone"] .qs-dot');
  await arrive('parco');
  d = await dbg();
  t.check('the "!" → the Giardini dell\'Arena: Pietro (the marker), the gardener, the children, the dog walker; the kite in the big tree, the ladder by the shed',
    !!d.npcs.pietro && !!d.npcs.giardiniere && !!d.npcs.bimbo && !!d.npcs.signoracane && d.quests.markers.includes('pietro') && d.parco.kite === 'tree' && d.parco.ladder === 'shed');
  await noGuide(true); await t.shot('b3-04-parco-day'); await noGuide(false);
  await talk(236, 376);
  t.check('Pietro: Il mio aquilone! È lassù, sull\'albero! (the task starts)', await has('Il mio aquilone!') && (await Q()).quests.aquilone.state === 'active');
  await leave();
  t.check('L\'aquilone: its scheda done', await scheda('aquilone', [1, 1, 0, 0]));
  t.check('the step: the gardener (his marker now)', (await Q()).quests.aquilone.step === 'aiuto' && (await Q()).markers.includes('giardiniere'));
  await talk(700, 240);
  await say(['Buongiorno']);
  await layout('the gardener (his tiles)', ['#btnSay', '#hint', 'tile:Ci può aiutare?', "tile:sull'albero"]);
  await say(['Ha una scala?']);
  t.check('Ha una scala? first → Sì, nella casetta. Ma… perché? (the hint: say where the kite is)', await has('Ma… perché?') && /where the kite is/.test(await hint()));
  await say(["l'aquilone", 'è in alto', "sull'albero"]);
  t.check("L'aquilone è in alto, sull'albero. → Va bene, prendo la scala. Andiamo!", await has('prendo la scala') && (await dbg()).aquilone.go);
  await leave();
  await until(async () => (await dbg()).cut.id === 'm6-scala', 'the ladder cutscene', 8000);
  await until(async () => (await dbg()).parco.ladder === 'carried', 'the ladder carried', 15000);
  await p.waitForTimeout(1600);
  await noGuide(true); await t.shot('b3-05-ladder-carried'); await noGuide(false);
  await until(async () => !(await dbg()).cut.on, 'the cutscene to end', 30000);
  d = await dbg();
  t.check('the ladder cutscene: the gardener brings it ("Ecco la scala!") and leans it against the big tree; the step: climb', d.parco.ladder === 'tree' && d.crowd.said.some(x => x[0] === 'giardiniere' && /Ecco la scala/.test(x[1])) && d.quests.quests.aquilone.step === 'sali');
  await t.clickWorld(190, 260);                                                  // (a tap on the ladder: walk there, climb)
  await until(async () => (await dbg()).cut.id === 'm6-sali', 'the climb', 10000);
  await until(async () => (await dbg()).parco.climbing, 'climbing', 10000); await p.waitForTimeout(1800);
  await noGuide(true); await t.shot('b3-06-climbing'); await noGuide(false);
  await until(async () => !(await dbg()).cut.on, 'the climb to end', 30000);
  d = await dbg();
  t.check('up the ladder: the kite in the bag, the step: give it to Pietro', d.quests.bag.some(b => b.id === 'aquilone') && d.parco.kite === 'gone' && d.quests.quests.aquilone.step === 'pietro');
  await talk(...d.npcs.pietro);
  t.check('Pietro: Il mio aquilone! Ce l\'hai? The bag\'s tiles are right after the set phrases', await has("Ce l'hai?") && await p.isVisible('#bank .tile >> text="l\'aquilone"'));
  await say(['Ecco', "l'aquilone"]);
  t.check('Ecco l\'aquilone! → Grazie! Grazie mille! (tu)', await has('Grazie! Grazie mille!'));
  await leave();
  d = await dbg();
  t.check('the task done: a stamp, the kite out of the bag and flying; 18:00, 2/3', d.quests.quests.aquilone.done && d.quests.passport.includes('aquilone') && !d.quests.bag.some(b => b.id === 'aquilone') && d.parco.kite === 'flying' && d.quests.clock === '18:00');
  await noGuide(true); await t.shot('b3-07-kite-flying'); await noGuide(false);

  /* ================= the third afternoon task → the dusk → night ================= */
  await p.evaluate(() => __debug.questDone('caffe'));
  await until(async () => (await dbg()).quests.daytime === 'night' && !(await dbg()).cut.on, 'the night', 40000);
  d = await dbg();
  t.check('three this afternoon → the dusk: night, 2 tonight', d.quests.daytime === 'night' && d.l12.need.night === 2 && d.tut === 'l12-night');

  /* ================= Il tramonto sul ponte ================= */
  await press('m');
  t.check('the map at night: the sunset open now, the photo closed', !!(await p.$('.qspot:not(.closed)[data-qspot="q:tramonto"]')) && !(await p.$('[data-qspot="q:foto"]')));
  await p.click('[data-qspot="q:tramonto"] .qs-dot');
  await arrive('ponte');
  d = await dbg();
  t.check('Ponte Molino in the evening: the sunset (the lamps still off), Sara and Tommaso at the parapet, no Anna', d.ponte.sky === 'sunset' && d.ponte.lamps === 0 && !!d.npcs.sara && !!d.npcs.tommaso && !d.npcs.anna);
  await noGuide(true); await t.shot('b3-08-ponte-sunset'); await noGuide(false);
  await talk(640, 394);
  t.check('Sara remembers you: "Ehi! Ancora tu! Il fotografo!" (with their phone, not a camera) and asks: Guarda il tramonto! Non è bello? (the task starts)',
    await has('Ancora tu! Il fotografo!') && await has('con il telefono') && await has('Guarda il tramonto! Non è bello?') && (await Q()).quests.tramonto.state === 'active' && (await dbg()).tramonto.remembered);
  await leave();
  t.check('Il tramonto sul ponte: its scheda done', await scheda('tramonto', [0, 1, 1, 0]));
  await talk(640, 394);
  await say(['le luci', 'sono bellissime']);
  await layout("Sara (the evening's tiles)", ['#btnSay', '#hint', 'tile:Che bel tramonto!', "tile:C'è un po' di vento."]);
  t.check('Le luci sono bellissime at sunset → Le luci? Non ancora… aspetta! (the hint: what you can see now)', await has('Non ancora… aspetta!') && /aren't on yet/.test(await hint()) && !(await dbg()).tramonto.sunset);
  await say(['Sì', 'Che bel tramonto!']);
  t.check('Sì! Che bel tramonto! → Sì, che bello! … Aspetta… guarda! Si accendono le luci!', await has('Ogni sera è diverso') && await has('Si accendono le luci!'));
  await until(async () => (await dbg()).cut.id === 'm11-luci', 'the lights cutscene', 8000);
  t.check('…the dialog steps aside for the view (a cutscene)', !(await p.isVisible('#dialog')));
  await until(async () => (await dbg()).ponte.fade !== null, 'the fade', 6000);
  await until(async () => { const l = (await dbg()).ponte.lamps; return l > 0 && l < 5; }, 'the lamps coming on, one by one', 8000);
  const mid = (await dbg()).ponte;
  await t.shot('b3-09-lights-coming-on');
  await until(async () => (await dbg()).ponte.fade === null && (await dbg()).ponte.lamps === 5, 'the lights', 12000);
  await until(async () => await p.isVisible('#dialog'), 'Sara again', 15000); await settle(); await t.dump();
  d = await dbg();
  t.check(`the sky turns to night and the five lamps come on one by one (${mid.lamps} lit halfway); Sara again: Adesso è sera… Guarda!; the step: the lights`, d.ponte.sky === 'night' && d.ponte.lamps === 5 && mid.lamps > 0 && mid.lamps < 5 && await has('Adesso è sera') && d.quests.quests.tramonto.step === 'luci');
  await say(['Guarda!', 'le luci', 'è bellissimo']);
  t.check('Guarda le luci! È bellissimo → Sì, sono bellissime! (feedback: plural, sono bellissime); then Brr…', await has('Sì, sono bellissime!') && /plural/.test(await hint()) && (await dbg()).tramonto.lights && await has('Brr…'));
  await jpg('b3-p2-tramonto-lights');
  await say(["Fa un po' freddo."]);
  d = await dbg();
  await jpg('b3-p3-tramonto-cold');
  t.check("Fa un po' freddo. → Sì, c'è un po' di vento sul fiume. … Buona serata, fotografo! The task done, a stamp, 1/2 tonight", await has("c'è un po' di vento sul fiume") && await has('Buona serata, fotografo!') && d.quests.quests.tramonto.done && d.quests.passport.includes('tramonto') && d.l12.count.night === 1);
  await leave();
  await noGuide(true); await t.shot('b3-10-ponte-night'); await noGuide(false);
  const lumN = await p.evaluate(() => __nightProbe());

  /* ================= the park at night ================= */
  await p.evaluate(() => __debug.travel('parco')); await arrive('parco');
  d = await dbg();
  const lumP = await p.evaluate(() => __nightProbe());
  t.check(`the park at night: the lamps (darker: ${lumP.toFixed(0)}), the dog walker; Pietro, the gardener and the children gone home`, d.night.amount === 1 && lumP < 90 && !!d.npcs.signoracane && !d.npcs.pietro && !d.npcs.giardiniere && !d.npcs.bimbo);
  console.log(`   the bridge at night: brightness ${lumN.toFixed(0)}`);
  await noGuide(true); await t.shot('b3-11-parco-night'); await noGuide(false);

  /* ================= no hint gave the answer ================= */
  const norm = x => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const forbidden = ['vi faccio una foto', 'sorridete', "c'e il sole", 'fa caldo', 'che bella giornata', 'il ponte e bellissimo', 'il ponte e antico',
    'ci puo aiutare', 'ha una scala', "e in alto sull'albero", "l'aquilone e in alto", "ecco l'aquilone",
    'che bel tramonto', 'il tramonto e bellissimo', 'non e bello', 'le luci sono bellissime', 'guarda le luci', "fa un po' freddo", "c'e un po' di vento", 'che bello'].map(norm);
  const shown = await p.evaluate(() => window.__hintLog || []);
  const leaks = shown.filter(h => forbidden.some(m => norm(h).includes(m)));
  console.log(`   ${shown.length} hints shown; leaks: ${leaks.join(' | ') || 'none'}`);
  t.check('no hint contains the Italian answer', shown.length >= 8 && leaks.length === 0);
}, { fakeSpeech:true, viewport:{ width:1280, height:720 } });
