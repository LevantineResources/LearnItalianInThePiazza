/* The cutscene system (world/cutscene.js): the controls freeze (keys, hotkeys, taps), scripted walks for the player and an
   NPC in the scrolling museum (and the camera follows), speech that waits for the voice, the guide's line, an "only E"
   step (E or a tap on what E would open; nothing else), Esc skips everything at once, a timeout never leaves the game
   stuck, the rope's nudge is a quiet cutscene, and a reload during a cutscene gives control back (and asks the lesson). */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page, dbg = () => p.evaluate(() => __dbg());
  const waitFor = (fn, arg, ms = 8000) => p.waitForFunction(fn, arg, { timeout:ms, polling:100 }).then(() => true).catch(() => false);
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(200); };

  await t.jump(10);
  await p.evaluate(() => { __debug.set({ lesson:11, tut:'l10-done' }); __debug.travel('galleria', { x:912, y:1062 }); }); await p.waitForTimeout(2700);
  t.check('in the galleria, controls free', (await dbg()).scene === 'galleria' && !(await dbg()).cut.on);

  // 1. a scripted walk for the player and the custodian, a line, the guide
  await p.evaluate(() => __debug.cutscene([
    { guide:'You can\'t take your eyes off <i>La Pietà</i>…' },
    { walk:'guardia', to:{ x:780, y:900 }, speed:90, async:true },
    { walk:'player', path:[{ x:912, y:990 }, { x:820, y:930 }, { x:912, y:890 }], speed:120 },
    { say:'Che bello!', who:'player' },
    { walk:'guardia', to:{ x:716, y:800 }, speed:140, face:{ x:1, y:0 } },
  ], { id:'test-walk' }));
  await p.waitForTimeout(300);
  let d = await dbg();
  t.check('a cutscene: on, saved in S.cut, the guide shows its line', d.cut.on && d.cut.saved && d.cut.saved.id === 'test-walk' && /take your eyes/.test(await p.$eval('#guideText', e => e.textContent)) && !(await p.$eval('#guide', e => e.hidden)));
  t.check('both walk', d.cut.walking.includes('player') && d.cut.walking.includes('guardia'));
  const y0 = d.me[1];
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(500); await p.keyboard.up('ArrowDown');
  await press('h'); await press('m');
  d = await dbg();
  t.check('the arrow keys don\'t move the player off the script, H and M do nothing', d.me[1] <= y0 && !(await p.isVisible('#modal')) && d.cut.on);
  await t.clickWorld(100, 100); await p.waitForTimeout(300);
  t.check('a tap does nothing either', (await dbg()).cut.on && !(await p.evaluate(() => !!document.querySelector('#crowdPick:not([hidden])'))));
  await t.shot('cutscene-walk');
  t.check('the walk arrives, the line is said, the custodian is back on his chair', await waitFor(() => !__dbg().cut.on, null, 15000));
  d = await dbg();
  t.check('… where the script put them', d.me.join() === '912,890' && d.npcs.guardia.join() === '716,800' && /player:Che bello!/.test(d.crowd.said.map(x => x.join(':')).join()));
  t.check('the cutscene resolved (not skipped), S.cut cleared', await p.evaluate(() => window.__cutRes && !window.__cutRes.skipped && !window.__cutRes.timedOut) && !d.cut.saved);
  await p.keyboard.down('ArrowDown'); await p.waitForTimeout(300); await p.keyboard.up('ArrowDown');
  t.check('controls are back afterwards', (await dbg()).me[1] > 890);

  // 2. only E: walk over the rope to the Pietà, only E works (no "Troppo vicino!" during a cutscene), E opens it
  const ropeCount = (await dbg()).galleria.rope.count;
  await p.evaluate(() => __debug.cutscene([
    { walk:'player', to:{ x:912, y:860 }, speed:120 },
    { allowKeys:['e'], until:'workOpened', work:'michelangelo-pieta', guide:'Press <kbd>E</kbd>' },
    { until:'workClosed', guide:null },
    { walk:'player', to:{ x:912, y:910 }, speed:160 },
  ], { id:'test-pieta' }));
  t.check('only-E step reached (the player stands inside the rope)', await waitFor(() => __dbg().cut.kind === 'allowKeys' && __dbg().cut.keys.join() === 'e', null, 6000));
  d = await dbg();
  t.check('inside the rope during a cutscene: no "Troppo vicino!"', d.galleria.rope.in === 'michelangelo-pieta' && d.galleria.rope.count === ropeCount);
  t.check('the guide says Press E, the E prompt shows', /Press/.test(await p.$eval('#guideText', e => e.textContent)) && !(await p.$eval('#guide', e => e.hidden)));
  const me0 = d.me.join();
  await press('ArrowLeft'); await press('h'); await press('v'); await press(' '); await press('Enter');
  d = await dbg();
  t.check('only E: arrows, H, V, Space and Enter do nothing', d.me.join() === me0 && !d.galleria.open && !(await p.isVisible('#modal')) && d.cut.kind === 'allowKeys');
  await press('e');
  t.check('E opens the Pietà', await waitFor(() => __dbg().galleria.open === 'michelangelo-pieta', null, 3000));
  await t.shot('cutscene-pieta');
  await press('e');
  t.check('closing it, the script walks the player back out and ends', await waitFor(() => !__dbg().cut.on, null, 6000) && (await dbg()).me.join() === '912,910' && (await dbg()).galleria.rope.count === ropeCount);

  // 3. only E, by tap: a tap on what E would open opens it; a tap elsewhere does nothing
  await p.evaluate(() => __debug.cutscene([{ walk:'player', to:{ x:912, y:900 } }, { allowKeys:['e'], until:'workOpened' }], { id:'test-tap' }));
  await waitFor(() => __dbg().cut.kind === 'allowKeys', null, 4000);
  let cam = (await dbg()).galleria.cam;
  await t.clickWorld(300, 300); await p.waitForTimeout(400);
  t.check('a tap elsewhere: nothing', (await dbg()).cut.on && (await dbg()).me.join() === '912,900');
  const pieta = (await dbg()).galleria.works.find(w => w.id === 'michelangelo-pieta');
  await t.clickWorld(pieta.rect.x + pieta.rect.w / 2 - cam[0], pieta.rect.y + pieta.rect.h / 2 - cam[1]);
  t.check('a tap on the Pietà opens it (the step ends)', await waitFor(() => __dbg().galleria.open === 'michelangelo-pieta' && !__dbg().cut.on, null, 3000));
  await press('Escape');

  // 4. Esc skips: every step finishes at once (walks arrive, waits end, an only-E step calls its onSkip)
  await p.evaluate(() => __debug.cutscene([
    { walk:'player', to:{ x:400, y:960 }, speed:30 },
    { wait:60000 },
    { allowKeys:['e'], until:() => false, onSkip(){ window.__skipped = 'step'; } },
    { walk:'player', to:{ x:450, y:960 } },
  ], { id:'test-skip', onSkip(){ window.__skipped2 = true; } }));
  await p.waitForTimeout(500);
  t.check('a long cutscene runs, with the "Esc · skip" chip', (await dbg()).cut.on && await p.isVisible('#cutChip'));
  await press('Escape');
  t.check('Esc: it is over at once (skipped), the player where the script ends', await waitFor(() => !__dbg().cut.on && window.__cutRes && window.__cutRes.skipped, null, 2000) && (await dbg()).me.join() === '450,960');
  t.check('onSkip hooks ran (the step\'s and the cutscene\'s)', await p.evaluate(() => window.__skipped === 'step' && window.__skipped2 === true) && !(await p.isVisible('#cutChip')));
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(300); await p.keyboard.up('ArrowRight');
  t.check('controls back after a skip', (await dbg()).me[0] > 452);

  // 5. a timeout never soft-locks
  await p.evaluate(() => __debug.cutscene([{ allowKeys:['e'], until:() => false }], { id:'test-timeout', timeout:1500 }));
  t.check('a step that never ends: the timeout ends the cutscene', await waitFor(() => !__dbg().cut.on && window.__cutRes && window.__cutRes.timedOut, null, 4000));

  // 6. a reload during a cutscene: control back, the lesson is asked (cutsceneResume)
  await p.evaluate(() => __debug.cutscene([{ walk:'player', to:{ x:600, y:960 }, speed:20 }, { wait:60000 }], { id:'test-reload' }));
  await p.waitForTimeout(600);
  t.check('saved mid-cutscene', (await dbg()).cut.saved && (await dbg()).cut.saved.id === 'test-reload');
  await p.reload(); await p.waitForTimeout(800);
  await p.evaluate(() => __debug.hook({ cutsceneResume(c){ window.__resumed = c; return true; } }));
  await p.click('#btnContinue'); await p.waitForTimeout(600);
  d = await dbg();
  t.check('after the reload: no cutscene, S.cut cleared, the lesson asked to resume it', !d.cut.on && !d.cut.saved && d.cut.resumed && d.cut.resumed.id === 'test-reload' && d.cut.resumed.handled
    && await p.evaluate(() => window.__resumed && window.__resumed.id === 'test-reload'));
  const x0 = d.me[0];
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(300); await p.keyboard.up('ArrowRight');
  t.check('and the player can walk', (await dbg()).me[0] > x0);
});
