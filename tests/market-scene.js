/* The market scene (Piazza delle Erbe, Lesson 7 shared world): the vendors only appear from Lesson 7 on,
   every vendor can be reached from the aisle in front of their counter and answers in the tile bank,
   and the Mercato destination stays locked on the map until a lesson hook unlocks it. */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page, dbg = () => p.evaluate(() => __dbg());
  await t.jump(6);
  await p.evaluate(() => { __debug.set({ tut:'l6-done' }); __debug.travel('mercato'); }); await p.waitForTimeout(2600);
  let d = await dbg();
  t.check('market scene', d.scene === 'mercato');
  t.check('no vendors before Lesson 7', !['teresa', 'franco', 'gino', 'pina'].some(id => d.npcs[id]));
  await t.shot('80-market-l6');

  await p.evaluate(() => __debug.set({ lesson:7 })); await p.waitForTimeout(300);
  d = await dbg(); console.log('   npcs:', JSON.stringify(d.npcs), 'me:', JSON.stringify(d.me));
  t.check('vendors at the market', ['teresa', 'franco', 'gino', 'pina'].every(id => d.npcs[id]));
  await t.shot('81-market-l7');

  for (const id of ['teresa', 'gino', 'franco', 'pina']){
    const [x, y] = d.npcs[id];
    console.log(id.toUpperCase()); await t.talkTo(x, y);
    const me = (await dbg()).me;
    t.check(`${id} reached from the aisle`, me[1] > y + 30 && Math.hypot(me[0] - x, me[1] - y) < 58);
    if (id === 'teresa') await t.shot('82-market-talk');
    await t.say(['Buongiorno', 'Come sta?']);
    t.check(`${id} answered`, (await t.lines()).some(l => l.includes('Bene, grazie. E Lei?')));
    await t.say(['Sto bene, grazie']);
    await t.leave();
  }
  await p.evaluate(() => __debug.place(480, 300)); await p.waitForTimeout(200);
  await t.shot('83-market-aisle');
  await p.keyboard.press('m'); await p.waitForSelector('.mapsvg'); await p.waitForTimeout(300);
  const go = await p.$$eval('[data-go]', bs => bs.map(b => b.dataset.go));
  console.log('   destinations:', go.join(', '));
  t.check('mercato locked without a hook', !go.includes('mercato') && go.includes('piazza'));
  t.check('map shows Mercato', (await p.textContent('.mapsvg')).includes('Mercato'));
  await t.shot('84-market-map');
});
