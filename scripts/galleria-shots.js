#!/usr/bin/env node
/* Screenshots of the museum interior (scene 'galleria') for the layout review: node scripts/galleria-shots.js
   (after npm run build). Writes review/*.png. */
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const OUT = path.resolve(__dirname, '..', 'review'), FILE = path.resolve(__dirname, '..', 'dist', 'padova', 'index.html');
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
const want = n => !only.length || only.some(o => n.includes(o));

async function page(b, viewport, scale = 1){
  const p = await b.newPage({ viewport, deviceScaleFactor: scale });
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.goto('file://' + FILE);
  await p.fill('#nameInput', 'Sam'); await p.click('[data-jump="10"]'); await p.waitForTimeout(2800);
  await p.evaluate(() => { __debug.set({ tut:'l10-done' }); __debug.npc('guardia', { lesson:10 }); __debug.travel('galleria'); });
  await p.waitForTimeout(2600);
  await p.waitForFunction(() => __dbg().galleria.thumbs >= 23, null, { timeout: 10000 });
  return p;
}
const at = async (p, x, y, face) => { await p.evaluate(([x, y, f]) => { __debug.place(x, y); }, [x, y, face]); await p.waitForTimeout(250); };
const canvasShot = (p, name) => p.locator('#cv').screenshot({ path: path.join(OUT, name + '.png') });

(async () => {
  const b = await chromium.launch();
  let p = await page(b, { width: 1280, height: 800 }, 1);
  if (want('00-overview')){
    await p.setViewportSize({ width: 1824, height: 1212 });
    await at(p, 912, 1000);
    await p.evaluate(() => __debug.overview(true)); await p.waitForTimeout(400);
    await p.locator('#cv').screenshot({ path: path.join(OUT, '00-overview.png') });
    await p.evaluate(() => __debug.overview(false)); await p.setViewportSize({ width: 1280, height: 800 }); await p.waitForTimeout(300);
  }
  await p.close();
  p = await page(b, { width: 1280, height: 800 }, 2);
  const views = [
    ['01-entrance', 912, 1062],
    ['02-atrium-statues', 912, 760],
    ['03-sala1', 380, 1000],
    ['04-sala2', 330, 560],
    ['05-sala5', 912, 250],
    ['06-sala3', 1500, 560],
    ['07-sala4', 1480, 1000],
  ];
  for (const [name, x, y] of views) if (want(name)){ await at(p, x, y); await canvasShot(p, name); }
  if (want('08-player')){ await at(p, 470, 1000); await p.screenshot({ path: path.join(OUT, '08-player-in-sala1-fullpage.png') }); }
  const openAt = async (id, name) => {
    const w = await p.evaluate(id => __dbg().galleria.works.find(w => w.id === id), id);
    await at(p, w.spot.x, w.spot.y); await p.keyboard.press('e'); await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(OUT, name + '.png') }); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  };
  if (want('10-modal')){
    await openAt('raffaello-atene', '10-modal-atene');
    await openAt('leonardo-dama', '11-modal-dama');
    await openAt('caravaggio-giuditta', '12-modal-giuditta');
    await openAt('michelangelo-pieta', '13-modal-pieta');
    await openAt('cellini-perseo', '14-modal-perseo');
  }
  if (want('20-near')){ const w = await p.evaluate(() => __dbg().galleria.works.find(w => w.id === 'botticelli-primavera')); await at(p, w.spot.x, w.spot.y); await canvasShot(p, '09-near-a-painting'); }
  await p.close();
  if (want('30-phone')){
    p = await page(b, { width: 390, height: 844 }, 3);
    await at(p, 912, 760); await p.screenshot({ path: path.join(OUT, '30-phone-atrium.png') });
    await at(p, 330, 560); await p.screenshot({ path: path.join(OUT, '31-phone-sala2.png') });
    const w = await p.evaluate(() => __dbg().galleria.works.find(w => w.id === 'leonardo-dama'));
    await at(p, w.spot.x, w.spot.y); await p.keyboard.press('e'); await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(OUT, '32-phone-modal-dama.png') });
    await p.close();
  }
  await b.close();
  console.log('wrote', fs.readdirSync(OUT).filter(f => f.endsWith('.png')).join(', '));
})();
