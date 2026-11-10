/* openHandbook(n, { section, onClose }) (ui/handbook.js): the handbook opens at a chapter's own box (Lesson 11's rules box)
   or a standard section, scrolled to it and highlighted; onClose runs once when it is closed. */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page, hb = () => p.evaluate(() => __dbg().handbook);
  await t.jump(10);
  await p.evaluate(() => __debug.hbBoxes(10, [{ id:'rules', title:'Al museo: le regole', html:'<p><b>Troppo vicino!</b> = Too close!</p>' }]));
  await p.evaluate(() => __debug.handbook(10, { section:'culture' })); await p.waitForTimeout(400);
  let h = await hb();
  const vis = sel => p.evaluate(sel => { const e = document.querySelector(sel), b = document.querySelector('#hbBody').getBoundingClientRect(), r = e.getBoundingClientRect(); return r.top >= b.top - 2 && r.top < b.bottom - 40; }, sel);
  t.check('the handbook opens at Lesson 10\'s culture note, highlighted and scrolled into view', h.open && h.lesson === 10 && h.tab === 'lesson' && h.highlighted === 'hb-culture' && await vis('#hb-culture'));
  t.check('(it really scrolled)', await p.$eval('#hbBody', b => b.scrollTop > 100));
  await t.shot('handbook-section');
  await p.click('#sheet [data-close]'); await p.waitForTimeout(200);
  t.check('onClose ran when it was closed', await p.evaluate(() => window.__hbClosed === true));
  await p.evaluate(() => __debug.handbook(10, { section:'rules' })); await p.waitForTimeout(400);
  h = await hb();
  t.check('a chapter\'s own box comes first and can be opened by id (the rules box)', h.highlighted === 'hb-rules' && await p.$eval('#hbBody > *', e => e.id === 'hb-rules') && /Troppo vicino/.test(await p.$eval('#hb-rules', e => e.textContent)));
  await t.shot('handbook-rules-box');
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  t.check('Esc closes it too (onClose)', await p.evaluate(() => window.__hbClosed === true) && !(await hb()).open);
  await p.evaluate(() => __debug.handbook(99, { section:'how' })); await p.waitForTimeout(300);
  t.check('a chapter that does not exist: the current lesson\'s, no error', (await hb()).open && (await hb()).lesson === 10 && (await hb()).highlighted === 'hb-how');
});
