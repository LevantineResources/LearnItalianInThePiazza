/* The museum square (scene 'museo', Lesson 10's shared world, world/museo.js): the scene renders, the crowd blocks the
   way to the ticket booth until people step aside, the Permesso / Scusi / Prego pick (E, a bump, a tap) behaves as
   designed, moved people stay out of the way (and pathfinding knows it), the lesson hooks (crowdActive, onCrowd,
   crowdHint, clock, door, dests) take over, the clock tower shows the time it is given, and the Musei landmark and
   destination are on the map, the destination locked unless a hook opens it. */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page, dbg = () => p.evaluate(() => __dbg()), cr = async () => (await dbg()).crowd;
  const waitFor = (fn, arg, ms = 8000) => p.waitForFunction(fn, arg, { timeout:ms, polling:100 }).then(() => true).catch(() => false);
  const pickOpen = () => waitFor(() => !!__dbg().crowd.pick, null, 4000);
  const CROWD = ['turista1', 'turista2', 'turista3', 'turista4', 'maestra', 'alunno1', 'alunno2', 'alunna'];
  const toastHas = re => p.$$eval('.toast', ts => ts.map(x => x.innerText).join(' | ')).then(s => re.test(s));

  await t.jump(9);
  await p.evaluate(() => { __debug.set({ tut:'l9-done' }); __debug.travel('museo'); }); await p.waitForTimeout(2600);
  let d = await dbg();
  t.check('museum square scene', d.scene === 'museo');
  t.check('no crowd or cashier before Lesson 10', !d.npcs.cassiera && !CROWD.some(id => d.npcs[id]));

  await p.evaluate(() => __debug.set({ lesson:10, tut:'l10-test' })); await p.waitForTimeout(300);
  d = await dbg(); console.log('   npcs:', JSON.stringify(d.npcs), 'me:', JSON.stringify(d.me));
  t.check('cashier and crowd from Lesson 10', d.npcs.cassiera && CROWD.every(id => d.npcs[id]));
  t.check('8 crowd members, none moved', Object.keys(d.crowd.people).length === 8 && Object.values(d.crowd.people).every(x => !x.moved));
  t.check('clock shows 15:00 by default', d.clock.text === '15:00' && d.clock.shown.h === 3 && d.clock.shown.m === 0);
  const painted = await p.evaluate(() => { const c = document.querySelector('#cv'), g = c.getContext('2d'), px = g.getImageData(c.width / 2, c.height / 5, 1, 1).data; return px[3] > 0 && px[0] + px[1] + px[2] > 60; });
  t.check('the scene renders', painted);
  await t.shot('95-museo');

  // the crowd seals the bay in front of the booth
  t.check('booth not reachable through the crowd', !(await p.evaluate(() => __debug.reach(628, 252))));
  t.check('the doors are reachable', await p.evaluate(() => __debug.reach(400, 186)));
  t.check('the bench is reachable', await p.evaluate(() => __debug.reach(198, 420)));

  // tap the cashier: you walk up and bump into the crowd, the pick opens
  console.log('TAP THE CASHIER');
  await t.clickWorld(628, 200);
  t.check('bumping into the crowd opens the pick', await pickOpen());
  let c = await cr(); console.log('   pick:', JSON.stringify(c.pick), 'me', JSON.stringify((await dbg()).me));
  t.check('pick offers Permesso / Scusi / Prego', c.pick && c.pick.options.join() === 'Permesso,Scusi,Prego');
  t.check('pick is on screen above the player', await p.isVisible('#crowdPick .cp-opt[data-pick=permesso]'));
  await t.shot('96-museo-pick');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  t.check('Escape closes the pick', !(await cr()).pick && !(await p.isVisible('#crowdPick')));

  // Prego: a puzzled look and the hint
  console.log('PREGO');
  await p.evaluate(() => __debug.place(618, 334)); await p.waitForTimeout(300);
  await p.keyboard.press('e');
  t.check('E beside a crowd member opens the pick', await pickOpen());
  c = await cr(); t.check('pick for the person in front', c.pick && c.pick.npc === 'turista2');
  await p.keyboard.press('3');
  await waitFor(() => !!__dbg().crowd.hint);
  c = await cr(); console.log('   said', JSON.stringify(c.said.slice(-3)), 'hint', JSON.stringify(c.hint));
  t.check('Prego: puzzled look', c.said.some(b => b[0] === 'turista2' && b[1] === '?'));
  t.check('Prego: the hint', c.hint && c.hint.kind === 'prego' && /what <i>they<\/i> say back/.test(c.hint.html) && await toastHas(/what they say back/));
  t.check('Prego: nobody moved', !c.people.turista2.moved);
  await t.shot('97-museo-prego');

  // Scusi (clicking the button): they turn round, "Sì?", and stay
  console.log('SCUSI');
  await p.evaluate(() => { __debug.place(618, 334); }); await p.waitForTimeout(1500);
  await p.keyboard.press('e'); await pickOpen();
  await p.click('#crowdPick [data-pick=scusi]');
  await waitFor(() => (__dbg().crowd.hint || {}).kind === 'scusi');
  c = await cr(); console.log('   said', JSON.stringify(c.said.slice(-3)), 'hint', JSON.stringify(c.hint));
  t.check('Scusi: the player says it', c.said.some(b => b[0] === 'player' && b[1] === 'Scusi!'));
  t.check('Scusi: Sì?', c.said.some(b => b[0] === 'turista2' && b[1] === 'Sì?'));
  t.check('Scusi: the hint', /gets someone’s attention/.test(c.hint.html));
  t.check('Scusi: they stay put', !c.people.turista2.moved && c.people.turista2.at.join() === '618,300');

  // Permesso, by bumping (hold the arrow key into them), Enter picks the first option
  console.log('PERMESSO (BUMP)');
  await p.evaluate(() => __debug.place(618, 340)); await p.waitForTimeout(400);
  await p.keyboard.down('ArrowUp'); const bumped = await pickOpen(); await p.keyboard.up('ArrowUp');
  t.check('walking into them opens the pick', bumped && (await cr()).pick.npc === 'turista2');
  await p.keyboard.press('Enter');
  await waitFor(() => __dbg().crowd.bubbles.some(b => b[1] === 'Prego!'));
  c = await cr(); console.log('   bubbles', JSON.stringify(c.bubbles));
  t.check('Permesso! over the player', c.said.some(b => b[0] === 'player' && b[1] === 'Permesso!'));
  t.check('Prego! from them', c.said.some(b => b[0] === 'turista2' && b[1] === 'Prego!'));
  await t.shot('98-museo-permesso');
  t.check('they step aside', await waitFor(() => { const x = __dbg().crowd.people.turista2; return x.moved && !x.walking; }));
  c = await cr(); console.log('   turista2 now at', JSON.stringify(c.people.turista2), 'saved', JSON.stringify(c.saved));
  t.check('stepped out of the bay', c.people.turista2.at[1] > 320 || c.people.turista2.at[0] > 740);
  t.check('remembered in the save', c.saved && c.saved.turista2 && c.saved.turista2.x === c.people.turista2.at[0]);
  t.check('the bay is open now', await p.evaluate(() => __debug.reach(618, 280)));

  // E on the person at the window, Permesso by clicking; then the cashier, by a tap
  console.log('THE WINDOW');
  await p.evaluate(() => __debug.place(630, 300)); await p.waitForTimeout(300);
  await t.clickWorld(628, 250); t.check('a tap on someone opens the pick', await pickOpen());
  t.check('the person at the window', (await cr()).pick.npc === 'turista4');
  await p.click('#crowdPick [data-pick=permesso]');
  t.check('the person at the window steps aside', await waitFor(() => { const x = __dbg().crowd.people.turista4; return x.moved && !x.walking; }));
  c = await cr(); console.log('   turista4 now at', JSON.stringify(c.people.turista4));
  await p.evaluate(() => __debug.place(618, 340)); await p.waitForTimeout(300);
  t.check('cashier approach reachable', await p.evaluate(() => __debug.reach(628, 252)));
  await t.talkTo(628, 200);
  t.check('talking to the cashier', /Biglietteria/.test(await p.textContent('#dlgWho')));
  t.check('cashier answers', (await t.lines()).some(l => /Buongiorno/.test(l)));
  await t.shot('99-museo-cassiera');
  await t.leave();
  t.check('no pick on a moved person', await (async () => { await p.evaluate(([x, y]) => __debug.place(x, y - 12), c.people.turista4.at); await p.waitForTimeout(200); await p.keyboard.press('e'); await p.waitForTimeout(400); return !(await cr()).pick; })());
  await p.keyboard.press('Escape'); await p.evaluate(() => { if (document.querySelector('#dialog:not([hidden])')) document.querySelector('#dlgClose').click(); }); await p.waitForTimeout(300);

  // not trapped: back out of the bay to the spawn
  await p.evaluate(() => __debug.place(628, 252)); await p.waitForTimeout(200);
  t.check('walk back out of the bay', await p.evaluate(() => __debug.reach(480, 556)));

  // moved people stay moved after leaving and coming back
  await p.evaluate(() => __debug.travel('piazza')); await p.waitForTimeout(2600);
  await p.evaluate(() => __debug.travel('museo')); await p.waitForTimeout(2600);
  c = await cr();
  t.check('still out of the way after coming back', c.people.turista2.moved && c.people.turista4.moved && c.people.turista2.at[0] === c.saved.turista2.x && !c.people.turista1.moved);
  await p.evaluate(() => __debug.place(618, 340)); await p.waitForTimeout(200);
  t.check('still reachable after coming back', await p.evaluate(() => __debug.reach(628, 252)));
  await p.evaluate(() => __debug.crowdReset()); await p.waitForTimeout(200);
  c = await cr(); t.check('crowdReset puts them back', !c.people.turista2.moved && c.people.turista2.at.join() === '618,300' && !(await p.evaluate(() => __debug.reach(628, 252))));

  // lesson hooks
  console.log('HOOKS');
  await p.evaluate(() => __debug.hook({ crowdActive:() => false })); await p.waitForTimeout(1200);
  await p.evaluate(() => __debug.place(618, 334)); await p.waitForTimeout(200);
  await p.keyboard.press('e'); await p.waitForTimeout(500);
  c = await cr(); t.check('crowdActive() false: no pick', !c.active && !c.pick && c.hint && c.hint.kind === 'inactive');
  await p.evaluate(() => __debug.hook({ crowdHint:(n, k) => k === 'scusi' ? 'CUSTOM HINT' : undefined, onCrowd:(n, k) => k === 'prego' ? (window.__onCrowd = n.id + ':' + k, true) : undefined }));
  await p.keyboard.press('e'); await pickOpen(); await p.keyboard.press('2');
  await waitFor(() => (__dbg().crowd.hint || {}).html === 'CUSTOM HINT');
  t.check('crowdHint() replaces the hint', (await cr()).hint.html === 'CUSTOM HINT');
  await p.waitForTimeout(2500);
  await p.keyboard.press('e'); await pickOpen(); await p.keyboard.press('3'); await p.waitForTimeout(1500);
  c = await cr();
  t.check('onCrowd() takes over', await p.evaluate(() => window.__onCrowd) === 'turista2:prego' && !c.bubbles.some(b => b[1] === '?'));
  await p.evaluate(() => __debug.hook({ clock:() => ({ h:16, m:30 }) })); await p.waitForTimeout(1500);
  d = await dbg(); t.check('clock() hook sets the clock', d.clock.text === '16:30' && d.clock.shown.h === 4 && d.clock.shown.m === 30);
  await p.evaluate(() => __debug.hook(null));

  // the clock: set, swept to, read on the tower and close up
  console.log('CLOCK');
  await p.evaluate(() => __debug.clock(15, 45)); await p.waitForTimeout(1800);
  d = await dbg(); console.log('   clock', JSON.stringify(d.clock));
  t.check('clock reads what was set', d.clock.text === '15:45' && d.clock.shown.h === 3 && d.clock.shown.m === 45);
  await p.evaluate(() => __debug.place(112, 262)); await p.waitForTimeout(300);
  t.check('near the clock tower', (await dbg()).clock.near && /look at the clock/.test(await p.textContent('#guideText')));
  await t.shot('100-museo-tower');
  await p.keyboard.press('e'); await p.waitForTimeout(400);
  d = await dbg(); t.check('clock face modal opened with E', d.clock.open && !d.statue.open);
  t.check('clock face caption', (await p.textContent('.gm-cap')) === 'La torre dell’orologio');
  const hands = await p.evaluate(() => { const l = document.querySelector('.ck-min'); return [+l.getAttribute('x2'), +l.getAttribute('y2')]; });
  t.check('the minute hand points at 9 (quarter to)', hands[0] < 200 && Math.abs(hands[1] - 300) < 3);
  await t.shot('101-museo-clockface');
  await p.keyboard.press('e'); await p.waitForTimeout(300);
  t.check('clock face modal closed with E', !(await dbg()).clock.open);

  // the museum doors: neutral text, or a hook's door()
  await p.evaluate(() => __debug.place(400, 190)); await p.waitForTimeout(300);
  await p.keyboard.press('e'); await p.waitForTimeout(400);
  t.check('doors: timed entry', await toastHas(/timed ticket/));
  await p.evaluate(() => __debug.hook({ door:d => d.id === 'museo' ? (window.__door = true) : undefined }));
  await p.keyboard.press('e'); await p.waitForTimeout(300);
  t.check('door() hook takes over the doors', await p.evaluate(() => window.__door === true));
  await p.evaluate(() => __debug.hook(null));

  // the map: Musei near the station, its destination locked unless a hook opens it
  console.log('MAP');
  await p.keyboard.press('m'); await p.waitForSelector('.mapsvg'); await p.waitForTimeout(300);
  let go = await p.$$eval('[data-go]', bs => bs.map(b => b.dataset.go)); console.log('   destinations:', go.join(', '));
  t.check('map shows Musei', (await p.textContent('.mapsvg')).includes('Museo'));
  t.check('Musei locked without a hook', !go.includes('museo'));
  await t.shot('102-museo-map');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  await p.evaluate(() => __debug.hook({ dests:{ museo:() => true } }));
  await p.keyboard.press('m'); await p.waitForSelector('.mapsvg'); await p.waitForTimeout(300);
  await p.evaluate(() => __debug.travel('piazza')); await p.waitForTimeout(2600);
  await p.keyboard.press('m'); await p.waitForSelector('.mapsvg'); await p.waitForTimeout(300);
  go = await p.$$eval('[data-go]', bs => bs.map(b => [b.dataset.go, b.textContent]));
  t.check('dests.museo() unlocks it', go.some(([k, l]) => k === 'museo' && /Museo d'Arte/.test(l)));
  await p.click('[data-go=museo]'); await p.waitForTimeout(2600);
  t.check('walked to the museum square', (await dbg()).scene === 'museo');
  await p.evaluate(() => { __debug.hook(null); __debug.set({ lesson:9 }); });
  await p.keyboard.press('m'); await p.waitForSelector('.mapsvg'); await p.waitForTimeout(300);
  t.check('no Musei on the map before Lesson 10', !(await p.textContent('.mapsvg')).includes('Museo'));
  await p.keyboard.press('Escape');

  // phone size
  await p.evaluate(() => __debug.set({ lesson:10 }));
  await p.setViewportSize({ width:390, height:844 }); await p.waitForTimeout(500);
  await p.evaluate(() => __debug.place(618, 334)); await p.waitForTimeout(300);
  await t.clickWorld(618, 300); await pickOpen();
  const box = await p.$eval('#crowdPick', e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; });
  console.log('   pick on a phone:', box.map(Math.round).join(', '));
  t.check('pick fits the phone', box[0] >= 0 && box[1] >= 0 && box[2] <= 390 && box[3] <= 844);
  await t.shot('103-museo-pick-phone');
}, { fakeSpeech:true });
