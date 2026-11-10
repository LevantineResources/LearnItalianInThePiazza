/* Fast travel on the city map (world/map.js): a place you know the way to (the route you were told and traced, the town
   opened in Lesson 12) is a button in the "Go straight there" list beside the map ([data-go], the old "Walk to" buttons): the
   only way to fast travel, the map itself has no ▸ buttons (too crowded; the "!" quest spots stay). Clicking one fades out, arrives at the place's entrance facing in, and closes the map. The places are
   remembered in the save (S.fast) and filled in for a save already past the lessons that taught them. Fast travel is off
   during a cutscene, on the night train, and when a lesson's fastTravel() hook says so (Lucia showing you round the museum,
   Bruno's crowd lesson). */
const path = require('path'), fs = require('fs');
const { play } = require('./lib/harness');
const REVIEW = path.resolve(__dirname, '../review/fix-general');

play(async t => {
  const p = t.page, dbg = () => p.evaluate(() => __dbg());
  fs.mkdirSync(REVIEW, { recursive:true });
  const until = async (fn, ms = 12000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } return false; };
  const map = async () => { if (!(await p.isVisible('.mapsvg'))){ await p.click('#btnMap'); await p.waitForSelector('.mapsvg'); } await p.waitForTimeout(250);
    return { onMap:await p.$$eval('.mapsvg [data-fast], .mapsvg [data-go], .mapsvg .fastgo', bs => bs.length), list:await p.$$eval('[data-go]', bs => bs.map(b => b.dataset.go)), text:await p.textContent('.sheet') }; };
  const close = async () => { if (await p.isVisible('#modal')) await p.keyboard.press('Escape'); await p.waitForTimeout(250); };
  const fresh = async n => { await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500); await t.jump(n); };

  /* ---------- Lesson 3: San Lorenzo once Chiara's route is traced ---------- */
  await t.jump(3);
  await p.evaluate(() => __debug.set({ tut:'l3-mark', l3notes:[{ it:'Vai sempre dritto.', en:'Go straight on.' }] }));
  let m = await map();
  t.check('Lesson 3, the route not traced yet: no fast travel to San Lorenzo (tracing it is the lesson)', !m.list.includes('sanlorenzo'));
  await close();
  await p.evaluate(() => __debug.set({ l3routeOK:true }));
  m = await map();
  console.log('   offered:', m.list.join(', '));
  t.check('the route traced: San Lorenzo is in the Go straight there list beside the map; no ▸ on the map itself', m.list.includes('sanlorenzo') && /Go straight there/.test(m.text) && m.onMap === 0);
  t.check('… and remembered in the save (S.fast)', (await dbg()).fast.known.includes('sanlorenzo') && await p.evaluate(() => JSON.parse(localStorage.getItem('piazza-lezione-1')).fast.sanlorenzo === true));
  await p.click('[data-go="sanlorenzo"]');
  t.check('a click on its button: the map closes, the fade, San Lorenzo', await until(async () => (await dbg()).scene === 'sanlorenzo') && !(await p.isVisible('#modal')));
  await p.waitForTimeout(1800);
  let d = await dbg();
  t.check('… at the entrance (the scene\'s spawn), facing in (east, along the street)', d.me.join() === '170,240' && await p.evaluate(() => __debug.playerFace().x > 0.9));

  /* ---------- an old save already past the lessons: filled in ---------- */
  await fresh(9);
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('piazza-lezione-1')); delete s.fast; localStorage.setItem('piazza-lezione-1', s && JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(600);
  if (await p.isVisible('#btnContinue')) { await p.click('#btnContinue'); await p.waitForTimeout(800); }
  d = await dbg();
  console.log('   Lesson 9 save without S.fast → known:', d.fast.known.join(', '));
  t.check('a Lesson 9 save without S.fast: the piazza, San Lorenzo, Caffè Aurora, Piazza del Santo, the market (not the museum, the station)',
    ['piazza', 'sanlorenzo', 'aurora', 'santo', 'mercato'].every(k => d.fast.known.includes(k)) && !d.fast.known.includes('museo') && !d.fast.known.includes('stazione'));
  m = await map();
  t.check('… all of them on the map (but the one you are in)', ['sanlorenzo', 'aurora', 'santo', 'mercato', 'piazza'].filter(k => k !== d.scene).every(k => m.list.includes(k)));
  console.log('   (in', d.scene + ')');
  await p.click('[data-go="santo"]');
  t.check('the list\'s button travels too (Piazza del Santo)', await until(async () => (await dbg()).scene === 'santo'));
  await p.waitForTimeout(1800);
  t.check('… arriving at its entrance (the bottom of the square), facing the basilica', (await dbg()).me.join() === '480,556' && await p.evaluate(() => __debug.playerFace().y < -0.9));

  /* ---------- Lesson 12: the town (its quest spots and the station) ---------- */
  await fresh(12);
  await p.evaluate(() => __debug.l12Explore()); await p.waitForTimeout(500);
  await until(async () => !(await dbg()).cut.on || (await dbg()).cut.kind === 'until', 8000);
  m = await map();
  console.log('   Lesson 12, the town open:', m.list.join(', '));
  t.check('Lesson 12, the town open: the bridge, the park, the pharmacy, the covered market (by day); not the gelateria (closed)',
    ['ponte', 'parco', 'farmacia', 'salone'].every(k => m.list.includes(k)) && !m.list.includes('gelateria'));
  t.check('the map has no ▸ buttons, only the list beside it (one button per place)', m.onMap === 0 && !(await p.$('.mapsvg .fastgo')) && new Set(m.list).size === m.list.length && /Go straight there/.test(m.text));
  t.check('the long list scrolls inside its panel', await p.$eval('.fl-items', e => getComputedStyle(e).overflowY === 'auto' && e.scrollHeight > e.clientHeight));
  t.check('the quest spots ("!") are still there', (await p.$$('[data-qspot]')).length > 0);
  await p.screenshot({ path:path.join(REVIEW, 'map-fast-travel.png') });
  await p.click('[data-go="ponte"]');
  t.check('to the bridge', await until(async () => (await dbg()).scene === 'ponte'));
  await p.waitForTimeout(1800);
  t.check('… at its west end (the entrance), facing east along it', (await dbg()).me.join() === '70,440' && await p.evaluate(() => __debug.playerFace().x > 0.9));
  await close();
  m = await map();
  await p.click('[data-go="parco"]'); await until(async () => (await dbg()).scene === 'parco'); await p.waitForTimeout(1800);
  t.check('to the park, facing in (north)', await p.evaluate(() => __debug.playerFace().y < -0.9));

  /* ---------- off: a cutscene, a lesson's hook, the train ---------- */
  await close();
  await p.evaluate(() => __debug.cutscene([{ walk:'player', to:{ x:480, y:400 }, speed:20 }], { id:'ft-cut' }));
  await p.waitForTimeout(300);
  t.check('during a cutscene: off', /Not during a scene/.test((await dbg()).fast.off || '') && !(await dbg()).fast.offer.length);
  await p.keyboard.press('Escape'); await until(async () => !(await dbg()).cut.on, 3000);
  t.check('after it: on again', !(await dbg()).fast.off && (await dbg()).fast.offer.length > 0);
  /* a cutscene that opens the map and waits for it to close (Lesson 12's "the town opens"): fast travel works from it */
  await p.evaluate(() => __debug.cutscene([{ guide:'The town is yours!' }, { run:() => document.querySelector('#btnMap').click() }, { guide:null, until:'modalClosed' }], { id:'ft-map' }));
  t.check('a cutscene waiting for the map to close: the list\'s buttons are there', await until(async () => (await p.$$('[data-go]')).length > 0, 4000));
  await p.click('[data-go="piazza"]');
  t.check('… one takes you there and the cutscene ends', await until(async () => (await dbg()).scene === 'piazza' && !(await dbg()).cut.on));
  await p.waitForTimeout(1800);
  await p.evaluate(() => __debug.hook({ fastTravel(){ return 'Giorgia must walk with you.'; } }));
  m = await map();
  t.check('a lesson\'s fastTravel() hook with a reason: no buttons, the reason shown', !m.list.length && !m.list.length && /Giorgia must walk with you/.test(m.text));
  await close();
  await p.evaluate(() => __debug.hook(null));
  const l11 = JSON.parse(await p.evaluate(() => localStorage.getItem('piazza-lezione-1'))).l11;
  await p.evaluate(l => __debug.set({ lesson:11, l11:{ ...l, follow:true } }), l11);
  t.check('Lesson 11, Lucia showing you round: off (its hook)', /Lucia/.test(await p.evaluate(() => __fast().off) || ''));
  await p.evaluate(l => __debug.set({ lesson:12, l11:l }), l11);
  await p.evaluate(() => __debug.set({ lesson:10, tut:'l10-crowd' })); await p.evaluate(() => __debug.travel('museo')); await until(async () => (await dbg()).scene === 'museo'); await p.waitForTimeout(1800);
  t.check('Lesson 10, the crowd scene: off (its hook)', /crowd/.test(await p.evaluate(() => __fast().off) || ''));
  await p.evaluate(() => __debug.set({ lesson:12, tut:'l12-explore', scene:'treno' }));
  t.check('on the night train: off', /train/.test(await p.evaluate(() => __fast().off) || ''));
});
