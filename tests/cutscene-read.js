/* Cutscene lines wait for the reader (world/cutscene.js, cutRead): a `say` line keeps its bubble and shows the "▸ Continua"
   prompt until it is clicked (or Space / Enter / E, or a tap on the stage); the first `wait` after a new guide line waits too;
   walks keep their automatic timing; Esc still skips everything; __debug.autoCutscene (what the test harness turns on for
   every other test) goes on by itself after a short reading delay. This test turns the flag off to see the real behaviour. */
const path = require('path'), fs = require('fs');
const { play } = require('./lib/harness');
const REVIEW = path.resolve(__dirname, '../review/fix-general');

play(async t => {
  const p = t.page, dbg = () => p.evaluate(() => __dbg());
  const waitFor = (fn, arg, ms = 8000) => p.waitForFunction(fn, arg, { timeout:ms, polling:100 }).then(() => true).catch(() => false);
  fs.mkdirSync(REVIEW, { recursive:true });

  await t.jump(3);
  t.check('the harness default is off here (autoCutscene:false)', (await dbg()).cut.auto === false);
  await p.evaluate(() => __debug.place(480, 470)); await p.waitForTimeout(200);

  // 1. a guide line, a walk (automatic), a line said (waits), a walk, a new guide line + wait (waits), a walk
  await p.evaluate(() => __debug.cutscene([
    { guide:'The bells ring over the piazza…' },
    { walk:'player', to:{ x:520, y:470 }, speed:40 },
    { say:'Che bella piazza!', who:'player' },
    { walk:'player', to:{ x:560, y:470 }, speed:200 },
    { guide:'Giulia waves at you from the bar.' },
    { wait:300 },
    { walk:'player', to:{ x:600, y:470 }, speed:200 },
  ], { id:'read-1' }));
  t.check('the walk runs by itself (no prompt while walking)', await waitFor(() => __dbg().cut.kind === 'walk' && !__dbg().cut.prompt, null, 3000));
  t.check('the line is said, then the prompt waits for the reader', await waitFor(() => __dbg().cut.kind === 'say' && __dbg().cut.reading && __dbg().cut.prompt, null, 6000));
  await p.waitForTimeout(3500);
  let d = await dbg();
  t.check('… still waiting 3.5 s later, the bubble still up, the player where the walk ended', d.cut.on && d.cut.reading && d.cut.kind === 'say' && d.me.join() === '520,470'
    && d.crowd.bubbles.some(([w, s]) => w === 'player' && /bella piazza/.test(s)));
  t.check('the prompt says Continua, with its key', /Continua/.test(await p.textContent('#cutRead')) && /Space/.test(await p.textContent('#cutRead')));
  await p.screenshot({ path:path.join(REVIEW, 'cutscene-waits-for-the-reader.png') });
  await p.keyboard.press('h'); await p.keyboard.press('m'); await p.waitForTimeout(300);
  t.check('other keys do nothing (no handbook, no map), it still waits', (await dbg()).cut.reading && !(await p.isVisible('#modal')));
  await p.click('#cutRead');
  t.check('a click on ▸ Continua: the next walk, then the new guide line waits (after its wait)', await waitFor(() => __dbg().cut.kind === 'wait' && __dbg().cut.reading, null, 4000)
    && (await dbg()).me.join() === '560,470' && /Giulia waves/.test(await p.$eval('#guideText', e => e.textContent)));
  await p.waitForTimeout(1200);
  t.check('… and stays', (await dbg()).cut.reading && (await dbg()).cut.kind === 'wait');
  await p.keyboard.press(' ');
  t.check('Space goes on: the last walk, the cutscene ends (not skipped)', await waitFor(() => !__dbg().cut.on, null, 4000)
    && (await dbg()).me.join() === '600,470' && await p.evaluate(() => window.__cutRes && !window.__cutRes.skipped));
  t.check('the prompt is gone afterwards', !(await p.isVisible('#cutRead')));

  // 2. Enter and E go on too; a walk-only cutscene never waits
  await p.evaluate(() => __debug.cutscene([{ say:'Uno!', who:'player' }, { say:'Due!', who:'player' }], { id:'read-2' }));
  t.check('a line waits', await waitFor(() => __dbg().cut.reading, null, 5000));
  await p.keyboard.press('Enter');
  t.check('Enter: the next line, which waits', await waitFor(() => __dbg().cut.reading && __dbg().crowd.bubbles.some(([w, s]) => s === 'Due!'), null, 5000));
  await p.keyboard.press('e');
  t.check('E: the end', await waitFor(() => !__dbg().cut.on, null, 3000));
  await p.evaluate(() => __debug.cutscene([{ walk:'player', to:{ x:640, y:470 }, speed:200 }, { wait:200 }, { face:'player', to:{ x:640, y:300 } }], { id:'read-3' }));
  t.check('movement only (no line): it ends by itself', await waitFor(() => !__dbg().cut.on, null, 4000) && (await dbg()).cut.reads >= 0);

  // 3. a tap on the stage goes on; Esc while waiting skips everything
  await p.evaluate(() => __debug.cutscene([{ say:'Tre!', who:'player' }, { say:'Quattro!', who:'player' }, { walk:'player', to:{ x:700, y:470 }, speed:30 }], { id:'read-4', onSkip(){ window.__readSkip = true; } }));
  await waitFor(() => __dbg().cut.reading, null, 5000);
  await t.clickWorld(300, 300);
  t.check('a tap on the stage: the next line', await waitFor(() => __dbg().cut.reading && __dbg().crowd.bubbles.some(([w, s]) => s === 'Quattro!'), null, 5000));
  await p.keyboard.press('Escape');
  t.check('Esc while it waits: skipped at once, the walk arrives, onSkip ran', await waitFor(() => !__dbg().cut.on && window.__cutRes && window.__cutRes.skipped, null, 3000)
    && (await dbg()).me.join() === '700,470' && await p.evaluate(() => window.__readSkip === true) && !(await p.isVisible('#cutRead')));

  // 4. a quiet cutscene (the rope's nudge) and auto:true lines never wait
  await p.evaluate(() => __debug.cutscene([{ say:'Ehi!', who:'player' }, { walk:'player', to:{ x:660, y:470 }, speed:200 }], { quiet:true }));
  t.check('a quiet cutscene: its line does not wait', await waitFor(() => !__dbg().cut.on, null, 5000));
  await p.evaluate(() => __debug.cutscene([{ say:'Via!', who:'player', auto:true }], { id:'read-5' }));
  t.check('{ say, auto:true }: no wait', await waitFor(() => !__dbg().cut.on, null, 5000));

  // 5. the debug flag the harness turns on for every other test: it goes on by itself after a short delay
  await p.evaluate(() => { __debug.autoCutscene = true; __debug.cutscene([{ guide:'A line.' }, { wait:100 }, { say:'Cinque!', who:'player' }], { id:'read-6' }); });
  t.check('__debug.autoCutscene: the lines go on by themselves', await waitFor(() => !__dbg().cut.on && window.__cutRes && !window.__cutRes.skipped, null, 6000) && (await dbg()).cut.reads >= 2);
}, { fakeSpeech:true, autoCutscene:false });
