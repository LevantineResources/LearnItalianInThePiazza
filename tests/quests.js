/* The quest system (engine/quests.js, ui/quests.js; docs/features/quests-and-night.md) and day / night (world/daytime.js,
   render/night.js): the task list on the phone, the "!" spots on the map and travelling with them, quests closed by the
   time of day (greyed, chiuso), quest markers, the bag (the header, the phone, the Nella borsa tiles, giving to the wrong
   person), the passport, a scheda (its word check with a miss, the practice, the dictionary, Studio), the lighting
   (darker at night, interiors lit, the bar shut, Giulia out in the piazza), the shop template (the pharmacy's door, a shelf
   close up, the way out; the gelateria in the evening), who is out at night (the buskers, the strangers) and in free play,
   a speech bubble above a name pill, the bridge and the park (batch 3: who is out when, the bridge's sky by day, at sunset and
   at night, the "!" spots, a quest partner who lets the giver talk), free play after the lesson, and Lesson 11's ending
   offering Lezione 12. */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const Q = async () => (await dbg()).quests;
  const until = async (fn, label, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(250); };
  const travel = async (scene, x, y) => { await p.evaluate(([s, x, y]) => __debug.travel(s, x != null ? { x, y } : null), [scene, x, y]); await until(async () => (await dbg()).scene === scene, scene); await p.waitForTimeout(1900); };
  /* the mean brightness of the canvas (0–255) */
  const lum = () => p.evaluate(() => __nightProbe());

  /* ---------- before the town opens: nothing ---------- */
  await t.jump(12);
  let q = await Q();
  t.check('before the town opens: every quest locked, no spots, no quest hooks', Object.values(q.quests).every(x => x.state === 'locked') && !q.spots.length && !q.hooks.length);
  await p.evaluate(() => __debug.l12Explore()); await p.waitForTimeout(400);
  q = await Q();
  t.check('the town opens: the any-time and afternoon quests open, their hooks live, 15:00', ['messaggio', 'caffe', 'mamma', 'farmacia', 'foto', 'aquilone'].every(id => q.quests[id].state === 'open' && q.hooks.includes(id)) && q.clock === '15:00');
  t.check('the night quests closed in the afternoon (chiuso · apre stasera), their "!" spots greyed', ['gelateria', 'musica', 'tramonto'].every(id => q.quests[id].state === 'closed' && q.spots.find(s => s.id === 'q:' + id).closed && /apre stasera/.test(q.spots.find(s => s.id === 'q:' + id).note)));
  t.check('Lesson 12 asks for 3 this afternoon (6 quests possible) and 2 tonight (5 possible)', await p.evaluate(() => __debug.l12Need('afternoon') === 3 && __debug.l12Need('night') === 2));
  t.check('quest markers: Enzo (the giver) has one in the piazza', (await Q()).markers.includes('enzo') && (await Q()).markers.includes('marco'));

  /* ---------- the task list ---------- */
  await press('p');
  t.check('the phone has tabs: Messaggi, Compiti, Borsa, Passaporto', (await p.$$('[data-ph-tab]')).length === 4);
  await p.click('[data-ph-tab="tasks"]'); await p.waitForTimeout(200);
  let txt = await p.textContent('.sheet');
  t.check('Compiti: both tasks open, with their places', /Il messaggio/.test(txt) && /Il caffè è finito!/.test(txt) && /San Lorenzo/.test(txt) && /Bar Centrale/.test(txt));
  /* Vai → travels to the quest's place */
  await p.click('[data-ph-go="messaggio"]');
  await until(async () => (await dbg()).scene === 'sanlorenzo', 'San Lorenzo'); await p.waitForTimeout(1900);
  t.check('Vai → San Lorenzo, where Paolo waits (moved there by the quest\'s sceneOf hook)', !!(await dbg()).npcs.marco);

  /* ---------- the map's spots ---------- */
  await press('m');
  t.check('the map shows a "!" spot per open quest', !!(await p.$('[data-qspot="q:caffe"]')) && !!(await p.$('[data-qspot="q:messaggio"]')));
  await p.click('[data-qspot="q:caffe"] .qs-dot');
  await until(async () => (await dbg()).scene === 'piazza', 'the piazza'); await p.waitForTimeout(1900);
  t.check('clicking a spot travels to its place (the piazza, by the bar)', (await dbg()).scene === 'piazza');

  /* ---------- closed by the time of day ---------- */
  const l0 = await lum();
  await p.evaluate(() => __debug.daytime('night')); await p.waitForTimeout(400);
  q = await Q();
  t.check('at night: the afternoon quest is closed (chiuso · apre domani), the any-time one open', q.quests.caffe.state === 'closed' && q.quests.messaggio.state === 'open' && q.spots.find(s => s.id === 'q:caffe').closed && /apre domani/.test(q.spots.find(s => s.id === 'q:caffe').note));
  await press('m');
  t.check('the closed spot is greyed on the map', !!(await p.$('.qspot.closed[data-qspot="q:caffe"]')));
  await t.shot('quests-01-map-night');
  await p.click('[data-qspot="q:caffe"] .qs-dot'); await p.waitForTimeout(400);
  t.check('clicking a closed spot does not travel', (await dbg()).scene === 'piazza' && /apre domani/.test(await p.textContent('#toasts')));
  await press('Escape');
  let d = await dbg();
  const l1 = await lum();
  t.check(`the lighting: darker at night (${l0.toFixed(0)} → ${l1.toFixed(0)}), the bar shut (no Enzo, no Bruno), Giulia out in the piazza`, l1 < l0 * 0.75 && d.night.amount === 1 && d.night.barClosed && !d.npcs.enzo && !d.npcs.bruno && d.npcs.giulia && d.npcs.giulia[1] > 400);
  await t.shot('quests-02-piazza-night');
  await travel('aurora');
  const l2 = await lum();
  t.check('interiors are lit at night (Caffè Aurora: no pass)', (await dbg()).night.interior && l2 > l1);
  await travel('museo');
  d = await dbg();
  t.check('the museum square at night: the crowd and the cashier gone', !d.npcs.cassiera && !d.npcs.turista1);
  await t.shot('quests-03-museo-night');
  await p.evaluate(() => __debug.daytime('afternoon')); await travel('piazza');
  t.check('back to the afternoon: the light, Enzo and the quest are back', (await dbg()).night.amount === 0 && !!(await dbg()).npcs.enzo && (await Q()).quests.caffe.state === 'open');

  /* ---------- the bag ---------- */
  t.check('the bag: the ticket, shown in the header', (await Q()).bag.some(b => b.id === 'biglietto') && await p.isVisible('#btnBag') && (await p.textContent('#bagCount')) === '1');
  await p.click('#btnBag'); await p.waitForTimeout(200);
  txt = await p.textContent('.sheet');
  t.check('the header\'s bag opens the phone at Borsa', /La borsa/.test(txt) && /il biglietto/.test(txt));
  await t.shot('quests-04-bag');
  await press('Escape');
  await t.talkTo(760, 290);                                                    // Giulia
  t.check('every tile bank has Nella borsa: Ecco + the ticket', await p.isVisible('#bank .bank-label >> text="Nella borsa"') && await p.isVisible('#bank .tile >> text="il biglietto"'));
  await p.click('#bank .tile >> text="Ecco"'); await p.click('#bank .tile >> text="il biglietto"'); await p.click('#btnSay');
  await until(async () => p.$eval('#hint', h => !h.hidden && /Compiti/.test(h.innerText)), 'the hint', 8000); await t.dump();
  t.check('giving it to the wrong person: "non è per me", a hint, still in the bag', (await t.lines()).some(l => l.includes('non è per me')) && /Compiti/.test(await p.$eval('#hint', h => h.innerText)) && (await Q()).bag.length === 1);
  await t.leave();

  /* ---------- a scheda: words (one miss), practice; the dictionary and Studio ---------- */
  await p.evaluate(() => __debug.questStart('messaggio')); await p.waitForTimeout(200);
  t.check('a started quest: active, its step in the task list', (await Q()).quests.messaggio.state === 'active' && (await Q()).quests.messaggio.step === 'chiara');
  await p.evaluate(() => __debug.scheda('messaggio')); await p.waitForTimeout(300);
  t.check('the scheda: its phrases, how, culture, Vocabolario; Practice locked', /Paolo dice che/.test(await p.textContent('.sheet')) && /Vocabolario/.test(await p.textContent('.sheet')) && /🔒/.test(await p.textContent('.tabs')));
  await p.click('[data-sch-tab="practice"]'); await p.waitForTimeout(200);
  t.check('the locked practice sends you to the words', (await Q()).scheda.tab === 'words');
  const wc = await p.evaluate(() => { const w = () => __dbg().quests.scheda.words, click = s => { const b = document.querySelector(s); if (b) b.click(); };
    let g = 0, wrongId = null, cameBack = false;
    while (w().phase === 'cards' && g++ < 200) click('[data-vc=next]');
    while (w().phase === 'quiz' && g++ < 400){ const s = w(); if (s.status !== 'answer'){ click('[data-vc=next]'); continue; }
      if (!wrongId){ wrongId = s.cur.id; click(`[data-vq="${(s.cur.answer + 1) % s.cur.opts.length}"]`); } else { if (s.cur.id === wrongId && s.cur.again) cameBack = true; click(`[data-vq="${s.cur.answer}"]`); } }
    return { wrongId, cameBack, passed:w().passed, total:w().total }; });
  t.check(`the scheda's word check (${wc.total} words): a miss came back, passed`, wc.cameBack && wc.passed && wc.total >= 5);
  await p.click('[data-sch-tab="practice"]'); await p.waitForTimeout(200);
  for (const k of [1, 1, 0, 1]){ await p.click(`[data-opt="${k}"]`); await p.click('#pxNext'); }
  await p.waitForTimeout(300);
  t.check('its practice: done; the scheda is done', (await Q()).quests.messaggio.practice);
  await t.shot('quests-05-scheda');
  await press('Escape');
  await press('v');
  t.check('the dictionary: Compito · Il messaggio, with its words', /Compito · Il messaggio/.test(await p.textContent('.sheet')) && /aspetta/.test(await p.textContent('.sheet')));
  await press('Escape');
  await press('t');
  t.check('Studio lists the task\'s words', (await dbg()).study.quests.includes('messaggio'));
  await p.click('[data-st-quest="messaggio"]'); await p.waitForTimeout(300);
  t.check('…and studies them (flashcards, a quiz)', (await dbg()).study.session && (await dbg()).study.session.quest === 'messaggio');
  await press('Escape');

  /* ---------- the passport ---------- */
  await p.evaluate(() => __debug.questDone('caffe')); await p.waitForTimeout(300);
  q = await Q();
  t.check('a finished quest: done, a stamp (with the time), Lesson 12 counted it and moved the clock', q.quests.caffe.done && q.passport.includes('caffe') && q.quests.caffe.at.clock === '16:30' && (await dbg()).l12.doneA.includes('caffe'));
  await press('p'); await p.click('[data-ph-tab="pass"]'); await p.waitForTimeout(200);
  t.check('the Passaporto tab: the stamps (the ticket, the task)', (await p.$$('.passport .pp-slot.on')).length === 2);
  await t.shot('quests-06-passport');
  await press('Escape');
  t.check('a done quest\'s hooks are gone', !(await Q()).hooks.includes('caffe'));

  /* ---------- the shop template: the pharmacy (San Lorenzo's door), the gelateria (evenings) ---------- */
  await travel('sanlorenzo', 880, 342);
  await press('e');
  await until(async () => (await dbg()).scene === 'farmacia', 'the pharmacy', 8000); await p.waitForTimeout(1900);
  d = await dbg();
  t.check('San Lorenzo\'s Farmacia door leads into the pharmacy: a lit interior, the pharmacist at her counter', d.shop.id === 'farmacia' && d.night.interior && !!d.npcs.farmacista);
  await p.evaluate(() => __debug.place(670, 160)); await p.waitForTimeout(250);
  t.check('E at a shelf: the prompt names it (Guarda), the close-up opens with its things', (await dbg()).shop.near === 'fondo-dx' && (await press('e'), (await dbg()).shop.open) && (await dbg()).shop.items.includes('crema'));
  await p.click('[data-fxitem="crema"]'); await p.waitForTimeout(200);
  t.check('before its task, taking something: you look, and put it back (nothing in the bag)', /put it back/.test((await dbg()).shop.msg) && !(await Q()).bag.some(b => b.id === 'crema'));
  await press('Escape');
  t.check('E closes it too; the shop window by day', !(await dbg()).shop.open);
  await p.evaluate(() => __debug.place(480, 548)); await p.waitForTimeout(200); await press('e');
  await until(async () => (await dbg()).scene === 'sanlorenzo', 'back out', 8000); await p.waitForTimeout(1900);
  t.check('the door (Esci) leads back to San Lorenzo, outside the pharmacy', (await dbg()).scene === 'sanlorenzo');
  await press('m');
  t.check('the map: the Gelateria landmark; no Walk to Gelateria in the afternoon (closed), Walk to Farmacia yes', (await p.textContent('.mapsvg')).includes('Gelateria') && !(await p.$('[data-go="gelateria"]')) && !!(await p.$('[data-go="farmacia"]')));
  await press('Escape');
  await p.evaluate(() => __debug.daytime('night')); await p.waitForTimeout(200);
  await press('m'); await p.click('[data-go="gelateria"]');
  await until(async () => (await dbg()).scene === 'gelateria', 'the gelateria', 8000); await p.waitForTimeout(1900);
  d = await dbg();
  t.check('at night: Walk to Gelateria, the gelataio behind his glass case, the interior lit (no night pass)', !!d.npcs.gelataio && d.night.interior && d.night.amount === 1);
  await t.shot('quests-07-gelateria-night');
  await travel('piazza', 600, 520);
  d = await dbg();
  t.check('the piazza at night: the buskers, Marta and Luca; Giorgia', !!d.npcs.chitarrista && !!d.npcs.cantante && !!d.npcs.marta && !!d.npcs.luca && !!d.npcs.bambina);
  t.check('Gino is not at the market at night (unless Giorgia\'s trail needs him)', !(await p.evaluate(() => { __debug.set({ scene:'mercato' }); const r = !!__dbg().npcs.gino; __debug.set({ scene:'piazza' }); return r; })));
  await p.evaluate(() => __debug.daytime('afternoon')); await p.waitForTimeout(200);
  d = await dbg();
  t.check('in the afternoon: no buskers, no Marta and Luca', !d.npcs.chitarrista && !d.npcs.marta && !d.npcs.luca);
  /* a world bubble goes above someone's name pill (Giulia's dusk line used to cover it) */
  const bb = await p.evaluate(() => __bubbleAt('giulia'));
  t.check(`a speech bubble sits above the name pill (bubble bottom ${bb.bubbleBottom}, pill top ${bb.pillTop})`, bb.pillTop !== null && bb.bubbleBottom <= bb.pillTop);

  /* ---------- batch 3: the bridge and the park (world/ponte.js, world/parco.js; quests 6, 8, 11) ---------- */
  q = await Q();
  t.check('the bridge and the park: Una foto sul ponte and L\'aquilone (afternoon) open, Il tramonto sul ponte (night) closed', q.quests.foto.state === 'open' && q.quests.aquilone.state === 'open' && q.quests.tramonto.state === 'closed'
    && q.quests.foto.window === 'afternoon' && q.quests.aquilone.window === 'afternoon' && q.quests.tramonto.window === 'night');
  await press('m');
  const spotAt = id => p.$eval(`[data-qspot="${id}"] .qs-dot`, c => [+c.getAttribute('cx'), +c.getAttribute('cy')]);
  const [fx, fy] = await spotAt('q:foto'), [ax, ay] = await spotAt('q:aquilone'), [tx2] = await spotAt('q:tramonto');
  t.check(`the map: Walk to Ponte Molino and to the Giardini; the "!" spots on the bridge (${fx}, ${fy}: the photo, the sunset beside it) and in the park (${ax}, ${ay})`,
    !!(await p.$('[data-go="ponte"]')) && !!(await p.$('[data-go="parco"]')) && Math.abs(fx - 607) < 60 && fy < 130 && Math.abs(tx2 - 607) < 80 && ax < 180 && ay > 300 && ay < 360);
  await press('Escape');
  await travel('ponte');
  d = await dbg();
  t.check('the bridge by day: a day sky, Anna (her marker) and Giulio at the parapet; Sara and Tommaso not out yet', d.ponte.sky === 'day' && !!d.npcs.anna && !!d.npcs.giulio && !d.npcs.sara && !d.npcs.tommaso && (await Q()).markers.includes('anna'));
  const pDay = await lum();
  await t.talkTo(458, 396);                                                    // Giulio
  t.check('Giulio lets Anna do the talking: Buongiorno! Che bella giornata, eh? (the task starts)', (await t.lines()).some(l => l.includes('Che bella giornata, eh?')) && (await Q()).quests.foto.state === 'active');
  await t.leave();
  await until(async () => (await Q()).scheda.open, 'the scheda', 6000); await press('Escape');
  await t.talkTo(420, 394);
  await p.click('#bank .tile >> text="Sì"'); await p.click('#btnSay');
  await until(async () => p.$eval('#hint', h => !h.hidden && /scheda/.test(h.innerText)), 'the hint', 8000);
  t.check('before its scheda: Prego?, and the hint sends you to the scheda', (await t.lines()).some(l => l.includes('Prego?')) && !(await dbg()).foto.handed);
  await t.leave();
  await p.evaluate(() => __debug.daytime('night')); await p.waitForTimeout(400);
  d = await dbg();
  t.check('the bridge in the evening (the sunset task open): the sunset sky, Sara and Tommaso, no Anna; the photo closed (apre domani)', d.ponte.sky === 'sunset' && !!d.npcs.sara && !!d.npcs.tommaso && !d.npcs.anna && (await Q()).quests.foto.state === 'closed' && /apre domani/.test((await Q()).spots.find(x => x.id === 'q:foto').note));
  await until(async () => (await dbg()).ponte.fade === null, 'the fade', 6000);
  const pSun = await lum();
  await p.evaluate(() => __debug.questDone('tramonto')); await p.waitForTimeout(300);
  await until(async () => (await dbg()).ponte.fade === null && (await dbg()).ponte.lamps === 5, 'the lamps', 12000);
  d = await dbg();
  const pNight = await lum();
  t.check(`the sunset task done: night on the bridge, its five lamps lit; the light: day ${pDay.toFixed(0)} > sunset ${pSun.toFixed(0)} > night ${pNight.toFixed(0)}`, d.ponte.sky === 'night' && d.ponte.lamps === 5 && pDay > pSun && pSun > pNight);
  await t.shot('quests-08-ponte-night');
  await p.evaluate(() => __debug.daytime('afternoon')); await p.waitForTimeout(300);
  await travel('parco');
  d = await dbg();
  const kDay = await lum();
  t.check('the park by day: Pietro (his marker), the gardener, the children, the old man, the dog walker; the kite in the big tree, the ladder by the shed',
    !!d.npcs.pietro && !!d.npcs.giardiniere && !!d.npcs.bimbo && !!d.npcs.bimba && !!d.npcs.nonno && !!d.npcs.signoracane && (await Q()).markers.includes('pietro') && d.parco.kite === 'tree' && d.parco.ladder === 'shed');
  await p.evaluate(() => __debug.daytime('night')); await p.waitForTimeout(400);
  d = await dbg();
  const kNight = await lum();
  t.check(`the park at night: only the dog walker; darker (${kDay.toFixed(0)} → ${kNight.toFixed(0)}); the kite's task closed`, !d.npcs.pietro && !d.npcs.giardiniere && !d.npcs.bimbo && !d.npcs.nonno && !!d.npcs.signoracane && kNight < kDay * 0.75 && (await Q()).quests.aquilone.state === 'closed');
  await t.shot('quests-09-parco-night');
  await p.evaluate(() => __debug.daytime('afternoon')); await travel('piazza', 600, 520);

  /* ---------- free play after the lesson ---------- */
  await p.evaluate(() => { __debug.set({ tut:'l12-done' }); __debug.daytime('night'); }); await p.waitForTimeout(300);
  q = await Q();
  t.check('free play: after Lesson 12 a quest not done is open at any time', q.free && q.quests.messaggio.state === 'active');
  await p.evaluate(() => __debug.daytime('afternoon')); await p.waitForTimeout(200);
  q = await Q(); d = await dbg();
  t.check('free play in the afternoon: the night quests open, their people out (the buskers, Marta)', q.quests.musica.state === 'open' && q.quests.gelateria.state === 'open' && !!d.npcs.chitarrista && !!d.npcs.marta);
  const out = await p.evaluate(() => { const at = (sc, d) => { __debug.daytime(d); __debug.set({ scene:sc }); return Object.keys(__dbg().npcs); };
    const r = { ponteDay:at('ponte', 'afternoon'), ponteNight:at('ponte', 'night'), parcoNight:at('parco', 'night') }; __debug.set({ scene:'piazza' }); __debug.daytime('afternoon'); return r; });
  t.check('free play: everyone out at any time (Sara and Anna on the bridge by day and at night, Pietro and the gardener in the park at night)',
    ['anna', 'sara'].every(id => out.ponteDay.includes(id) && out.ponteNight.includes(id)) && ['pietro', 'giardiniere'].every(id => out.parcoNight.includes(id)) && (await Q()).quests.aquilone.state === 'open');

  /* ---------- Lesson 11's ending offers Lezione 12 ---------- */
  await p.evaluate(() => { localStorage.clear(); }); await p.reload(); await p.waitForTimeout(500);
  await p.fill('#nameInput', 'Sam'); await p.click('[data-jump="11"]'); await p.waitForTimeout(2800);
  await p.evaluate(() => { if (__dbg().cut.on) __debug.cutscene([], {}); __debug.set({ tut:'l11-done' }); }); await p.waitForTimeout(800);
  const gb = await p.$('#guideText [data-action="l12"]');
  t.check('Lesson 11 done: the guide offers Start Lezione 12 · Un giorno in città', !!gb && (await gb.textContent()).includes('Start Lezione 12 · Un giorno in città'));
  await gb.click(); await p.waitForTimeout(3000);
  t.check('…and starts it', (await dbg()).lesson === 12 && (await dbg()).tut === 'l12-start');
}, { fakeSpeech:true, viewport:{ width:1280, height:720 } });
