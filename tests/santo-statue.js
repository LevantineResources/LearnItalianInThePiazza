/* The Gattamelata in Piazza del Santo (world/statue.js): a big landmark that blocks walking, a "Guarda · E" prompt and a
   guide line when you stand beside it, and E (or a tap) opens a picture of it with its caption. Lucia (Lesson 5) and
   Bruno (Lesson 6) stay reachable beside it: when both are in range, E talks to the person. Works in later lessons too. */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page, dbg = () => p.evaluate(() => __dbg()), st = async () => (await dbg()).statue;
  const guide = () => p.textContent('#guideText');
  /* hold an arrow key until the player stops moving (blocked), at most 8 s: timing-proof under a loaded machine */
  const waitFor = (fn, arg) => p.waitForFunction(fn, arg, { timeout:15000, polling:100 }).catch(() => {});
  const walkTo = async (x, y) => { await t.clickWorld(x, y); await waitFor(([x, y]) => Math.hypot(__dbg().me[0] - x, __dbg().me[1] - y) < 12, [x, y]); await p.waitForTimeout(200); };
  const walkUntilBlocked = async key => {
    await p.keyboard.down(key); let last = null, still = 0;
    for (let i = 0; i < 80 && still < 3; i++){ await p.waitForTimeout(100); const me = (await dbg()).me.join(); still = me === last ? still + 1 : 0; last = me; }
    await p.keyboard.up(key); await p.waitForTimeout(200);
  };
  await t.jump(5);
  await p.evaluate(() => { __debug.set({ tut:'l5-tour', vocab5:true, practiceDone5:true, l5routeOK:true, l5follow:true }); __debug.travel('santo'); });
  await p.waitForTimeout(2800);
  let d = await dbg();
  console.log('   scene:', d.scene, d.tut, 'me', JSON.stringify(d.me), 'npcs', JSON.stringify(d.npcs), 'statue', JSON.stringify(d.statue.area));
  t.check('in Piazza del Santo, Lesson 5', d.scene === 'santo' && d.tut === 'l5-statue' && d.npcs.lucia);
  const A = d.statue.area;
  t.check('Lucia clear of the statue', d.npcs.lucia[0] - (A.x + A.w) > 40 || A.y - d.npcs.lucia[1] > 40);
  t.check('not near the statue at the spawn', !d.statue.near);
  await t.shot('90-santo-statue');

  // tap the statue from the spawn: walk there, the picture opens
  console.log('TAP THE STATUE');
  await t.clickWorld(300, 250); await waitFor(() => __dbg().statue.open); await p.waitForTimeout(300);
  let s = await st();
  console.log('   me', JSON.stringify((await dbg()).me), JSON.stringify(s));
  t.check('statue modal opened by a tap', s.open);
  t.check('statue modal has the picture', s.picture);
  t.check('statue modal caption', s.caption === 'Il Gattamelata · Donatello, 1453');
  const note = await p.textContent('.gm-note');
  t.check('statue modal English note', /first life-size bronze horse and rider/.test(note));
  t.check('Lesson 5: ask Lucia', /Ask the girl who is sketching it/.test(await p.textContent('.gm-foot')));
  await t.shot('91-statue-picture');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  t.check('statue modal closed with Escape', !(await st()).open && !(await p.isVisible('#modal')));

  // walk up to it with the keyboard (west side), the prompt and the guide line, E opens, E closes
  console.log('WALK UP AND PRESS E');
  await p.evaluate(() => __debug.place(150, 360)); await p.waitForTimeout(200);
  t.check('not near from 56px away', !(await st()).near);
  await walkUntilBlocked('ArrowRight');
  d = await dbg(); console.log('   me', JSON.stringify(d.me));
  t.check('the plinth blocks walking', d.me[0] <= A.x - 13);
  t.check('near the statue after walking up', d.statue.near);
  t.check('guide says how to look at it', /look at the statue/.test(await guide()));
  await p.keyboard.press('e'); await p.waitForTimeout(400);
  t.check('statue modal opened with E', (await st()).open);
  await p.keyboard.press('e'); await p.waitForTimeout(300);
  t.check('statue modal closed with E', !(await st()).open);
  await p.evaluate(() => __debug.place(350, 452)); await p.waitForTimeout(150);
  await walkUntilBlocked('ArrowUp');
  d = await dbg(); console.log('   from the front:', JSON.stringify(d.me));
  t.check('the steps block walking', d.me[1] >= A.y + A.h + 13);
  await p.evaluate(([x, y]) => __debug.npc('mark', { x:x + 34, y:y + 26 }), d.me); await p.waitForTimeout(100);   // Mark right behind you
  d = await dbg(); const mark = d.npcs.mark; console.log('   Mark (following) at', JSON.stringify(mark));
  t.check('Mark following close by', mark && Math.hypot(mark[0] - d.me[0], mark[1] - d.me[1]) < 58);
  t.check('the statue beats a follower', d.statue.near);
  await p.keyboard.press('e'); await p.waitForTimeout(400);
  t.check('statue modal with Mark beside you', (await st()).open && !(await p.isVisible('#dialog')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  t.check('guide line goes when you walk away', !/look at the statue/.test(await (async () => { await p.evaluate(() => __debug.place(700, 520)); await p.waitForTimeout(300); return guide(); })()));

  // the paths around it stay walkable: behind it, to the basilica door
  await p.evaluate(() => __debug.place(480, 556));
  await walkTo(160, 230);
  d = await dbg(); console.log('   walked behind it:', JSON.stringify(d.me));
  t.check('walked round to the north-west', Math.hypot(d.me[0] - 160, d.me[1] - 230) < 12);
  await walkTo(470, 450);
  d = await dbg(); console.log('   walked back:', JSON.stringify(d.me)); t.check('walked back past it', Math.hypot(d.me[0] - 470, d.me[1] - 450) < 12);

  // between Lucia and the statue: E talks to Lucia (the person wins), the prompt is "Parla"
  console.log('LUCIA');
  await p.evaluate(() => __debug.place(420, 372)); await p.waitForTimeout(250);
  t.check('in range of the statue there, but Lucia wins', !(await st()).near);
  await p.keyboard.press('e');
  await p.waitForSelector('#dialog:not([hidden])', { timeout:8000 }); await p.waitForTimeout(1200);
  const who = (await p.textContent('#dlgWho')).trim(); console.log('   dialog:', who);
  t.check('E beside both talks to Lucia', /· Piazza del Santo$/.test(who));   // Lucia's place (Bruno's is "a bench, …")
  await t.dump();
  await t.say(['Scusi', 'Questa è', 'la statua di Gattamelata'], 2200);
  t.check('Lucia answered', (await t.lines()).length > 1);
  await t.leave();
  t.check('no picture opened by talking', !(await st()).open);

  // Lesson 6: Bruno on his bench is reachable, and the statue still works
  console.log('LESSON 6');
  await p.evaluate(() => { __debug.set({ lesson:6, tut:'l6-man', handbookLost:true }); __debug.travel('santo'); }); await p.waitForTimeout(2800);
  d = await dbg(); console.log('   npcs', JSON.stringify(d.npcs));
  t.check('Bruno clear of the statue', d.npcs.bruno && d.npcs.bruno[0] - (A.x + A.w) > 40);
  await t.talkTo(d.npcs.bruno[0], d.npcs.bruno[1]);
  t.check('Bruno reached', await p.isVisible('#dialog'));
  await t.leave();
  await p.evaluate(() => __debug.place(300, 440)); await p.waitForTimeout(200);
  await p.keyboard.press('e'); await p.waitForTimeout(400);
  s = await st();
  t.check('statue modal in Lesson 6', s.open && s.caption === 'Il Gattamelata · Donatello, 1453');
  t.check('no Lesson 5 nudge later', !/Ask the girl/.test(await p.textContent('.gm-foot')));
  await p.click('.gm-foot [data-close]'); await p.waitForTimeout(300);
  t.check('statue modal closed with the button', !(await st()).open);

  // phone size: the scene and the picture
  await p.setViewportSize({ width:390, height:844 }); await p.waitForTimeout(500);
  await p.evaluate(() => __debug.place(420, 300)); await p.waitForTimeout(300);
  await t.shot('92-santo-statue-phone');
  await t.clickWorld(300, 250); await p.waitForTimeout(600);
  t.check('statue modal opened by a tap on a phone', (await st()).open);
  const box = await p.$eval('#sheet', e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom]; });
  console.log('   sheet on a phone:', box.map(Math.round).join(', '));
  t.check('statue modal fits the phone', box[0] >= 0 && box[1] >= 0 && box[2] <= 390 && box[3] <= 844);
  await t.shot('93-statue-picture-phone');
}, { fakeSpeech:true });
