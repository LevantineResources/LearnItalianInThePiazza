/* Who E talks to when several people are in reach: the person the objective/quest needs, or the one the player
   faces, wins over a bystander standing slightly closer (regression: Bruno beside Bar Centrale hid Enzo in Lesson 12). */
const { play } = require('./lib/harness');
play(async t => {
  const p = t.page;
  await t.jump(12); await p.waitForTimeout(800);
  await p.evaluate(() => { __debug.l12Explore(); });
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.evaluate(() => { __debug.travel('piazza'); });
  await p.waitForTimeout(3500);
  const at = async (x, y, face) => { await p.evaluate(([x, y, f]) => __debug.place(x, y, f), [x, y, face === 'ArrowUp' ? { x:0, y:-1 } : { x:0, y:1 }]); await p.waitForTimeout(200); };
  const near = () => p.evaluate(() => __dbg().near || (window.__nearId && window.__nearId()) || null);
  // stand at the counter, facing Enzo, with Bruno just behind/beside
  await at(845, 196, 'ArrowUp');
  const d = await p.evaluate(() => { const n = __dbg().npcs; return { me:__dbg().me, enzo:n.enzo, bruno:n.bruno }; });
  console.log('   positions', JSON.stringify(d));
  await p.keyboard.press('e'); await p.waitForTimeout(1500);
  const who = await p.evaluate(() => document.querySelector('#dialog:not([hidden]) .who, #dlgWho, #dialog header b')?.textContent || '');
  const head = await p.evaluate(() => document.querySelector('#dialog')?.innerText.slice(0, 80) || '');
  console.log('   dialog:', head.replace(/\s+/g, ' '));
  t.check('E at the counter talks to Enzo, not Bruno', /Enzo/.test(head) && !/^Bruno/.test(head.trim()));
  await t.leave();
  // no quest needing Enzo (Lesson 9, at the bar): the one the player faces wins
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  await t.jump(9); await p.waitForTimeout(1200); await p.evaluate(() => __debug.travel('piazza')); await p.waitForTimeout(3500);
  console.log('   L9 npcs:', JSON.stringify(await p.evaluate(() => __dbg().npcs)));
  const open = () => p.evaluate(() => { const d = document.querySelector('#dialog'); return d.hidden ? '' : d.innerText.slice(0, 80).replace(/\s+/g, ' '); });
  await at(845, 196, 'ArrowDown'); await p.keyboard.press('e'); await p.waitForTimeout(1500);
  const h1 = await open(); console.log('   facing Bruno:', h1);
  t.check('facing Bruno, E talks to Bruno', /^\s*Bruno/.test(h1));
  await t.leave();
  await at(845, 196, 'ArrowUp'); await p.keyboard.press('e'); await p.waitForTimeout(1500);
  const h2 = await open(); console.log('   facing Enzo:', h2);
  t.check('facing Enzo, E talks to Enzo', /^\s*Enzo/.test(h2));
}, { fakeSpeech: true });
