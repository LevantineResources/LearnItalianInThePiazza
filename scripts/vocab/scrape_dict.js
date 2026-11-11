/* Open the built game with every lesson 1..N and every quest done, open the dictionary, and dump its entries. */
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const file = process.argv[2], out = process.argv[3], N = +(process.argv[4] || 14);
  const b = await chromium.launch(); const p = await b.newPage({ viewport:{ width:1280, height:800 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + file);
  await p.fill('#nameInput', 'Sam'); await p.click('#nameForm button[type=submit]'); await p.waitForTimeout(800);
  await p.evaluate((N) => {
    const o = { lesson:N };
    for (let n = 1; n <= N; n++){ o['vocab' + (n === 1 ? '' : n)] = true; o['practiceDone' + (n === 1 ? '' : n)] = true; o['vocabCheck' + n] = true; o['vocab' + n] = true; o['practiceDone' + n] = true; }
    o.numbers = { introDone:true, mastered:true, best:20 };
    __debug.set(o);
    const ids = Object.keys(__dbg().quests.quests);
    __debug.set({ quests:Object.fromEntries(ids.map(id => [id, { done:true, words:true, practice:true }])) });
    try { for (let q = 1; q <= 12; q++) __debug.questDone && __debug.questDone(q); } catch(e){}
    try { if (typeof QUESTS !== 'undefined') for (const q of (Array.isArray(QUESTS) ? QUESTS : Object.values(QUESTS))) { try { __debug.questDone(q.id); } catch(e){} } } catch(e){}
    return null; }, N);
  await p.waitForTimeout(500);
  await p.click('#btnDict'); await p.waitForTimeout(1200);
  const res2 = await p.evaluate(() => {
    const entries = [...document.querySelectorAll('.sheet .entry')].map(e => ({ w:(e.querySelector('.w')||{}).innerText || '', g:(e.querySelector('.g')||{}).innerText || '' }));
    const heads = [...document.querySelectorAll('.sheet h3')].map(h => h.innerText);
    return { entries, heads };
  });
  const res = res2;
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log('entries', res.entries.length, 'sections', res.heads.length, 'errors', errs.join(' | ') || 'none');
  await b.close();
})();
