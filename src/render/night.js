/* The night lighting pass (Lesson 12 on; world/daytime.js has the time of day). No new art per scene: every outdoor
   scene gets a dark-blue layer with holes where the light is (street lamps, lit windows, the fountain), and a warm glow
   added on top. Both layers are drawn once per scene (NIGHT_CACHE) from NIGHT_LIGHTS and drawn with nightAmount() as
   their strength, so the dusk fades smoothly (a gold tint at its middle). Interiors (Caffè Aurora, the galleria) are lit:
   no pass. A new scene adds its entry to NIGHT_LIGHTS (lamps: [x, y, r?], wins: [x, y, w, h] lit windows, glows:
   [x, y, r, 'rgba(…)'] coloured light, e.g. the fountain); without one it gets a few default lamps.
   Bar Centrale at night: the shutter is down (drawBarShutter, instead of the counter). */
const NIGHT_LIGHTS = {
  piazza:{
    lamps:[[250, 200], [690, 200], [250, 470], [690, 470], [60, 290], [900, 420], [470, 560], [360, 236, 70]],   // (the last: over the buskers, quests/12-musica)
    wins:[18, 78, 140, 200, 262, 318, 384, 440, 500, 552, 616, 664].map(x => [x, 98, 12, 10]),
    glows:[[470, 340, 120, 'rgba(140,195,255,.28)'], [470, 340, 175, 'rgba(255,190,110,.16)']],
  },
  sanlorenzo:{
    lamps:[[360, 320], [640, 330], [60, 330], [880, 345], [540, 560], [240, 190]],
    wins:[[686, 96, 108, 70], [404, 70, 30, 14], [826, 262, 118, 22], [200, 380, 120, 12], [500, 236, 116, 20]],
    glows:[[818, 272, 40, 'rgba(80,230,140,.35)'], [170, 62, 40, 'rgba(255,200,120,.3)'], [658, 126, 50, 'rgba(255,190,110,.35)']],
  },
  santo:{
    lamps:[[150, 250], [810, 250], [150, 470], [810, 470], [480, 560]],
    wins:[[440, 150, 80, 22]],
    glows:[[480, 190, 90, 'rgba(255,200,130,.3)']],
  },
  mercato:{ lamps:[[480, 300], [480, 500], [160, 520], [800, 530], [480, 170]], wins:[], glows:[] },
  museo:{
    lamps:[[262, 200], [262, 470], [818, 200], [818, 470], [540, 560]],
    wins:Array.from({ length:13 }, (_, k) => 252 + k * 46).filter(x => !(x > 340 && x < 470) && !(x > 526 && x < 704)).map(x => [x + 1, 110, 17, 26]).concat([[366, 112, 68, 38]]),
    glows:[[112, 113, 34, 'rgba(255,240,190,.35)']],
  },
  /* the bridge draws its own lighting pass (render/ponte.js: SCENE_ART.ponte.night, the lamps coming on one by one); this entry
     lists its lamps for __dbg().night */
  ponte:{ lamps:PONTE.lamps.map(([x, y]) => [x, y - 85, 90]), wins:[], glows:[] },
  /* the park (world/parco.js): its lamps, the pond in the moonlight */
  parco:{
    lamps:PARCO.lamps.map(([x, y]) => [x, y - 60, 46]),
    wins:[[890, 130, 22, 14]],
    glows:[[770, 462, 130, 'rgba(150,190,255,.20)'], [860, 140, 50, 'rgba(255,200,120,.25)'], ...PARCO.lamps.map(([x, y]) => [x, y - 6, 92, 'rgba(255,186,96,.26)'])],
  },
  /* the station (world/stazione.js): platform lamps, the board, the ticket office, the concourse lights */
  stazione:{
    lamps:[[246, 60], [246, 200], [646, 60], [646, 200], [250, 520], [480, 450], [710, 520]],
    wins:[],
    glows:[[450, 330, 110, 'rgba(255,230,120,.18)'], [96, 420, 100, 'rgba(255,210,140,.3)'], [910, 350, 60, 'rgba(255,190,120,.25)'], [646, 290, 30, 'rgba(90,230,130,.4)'], [246, 290, 30, 'rgba(90,230,130,.4)']],
  },
};
const nightLights = sc => NIGHT_LIGHTS[sc] || { lamps:[[160, 300], [800, 300], [480, 520]], wins:[], glows:[] };
const NIGHT_CACHE = {};
function buildNight(sc){
  const L = nightLights(sc);
  const mk = () => { const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR; const g = c.getContext('2d'); g.scale(DPR, DPR); return [c, g]; };
  const [dark, d] = mk(), [glow, g] = mk();
  d.fillStyle = 'rgba(10,20,58,.74)'; d.fillRect(0, 0, W, H);
  d.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r, a) => { const gr = d.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = gr; d.fillRect(x - r, y - r, 2 * r, 2 * r); };
  L.lamps.forEach(([x, y, r]) => hole(x, y + 6, r || 96, 0.82));
  L.wins.forEach(([x, y, w, h]) => hole(x + w / 2, y + h / 2, Math.max(w, h) * 0.9 + 14, 0.6));
  L.glows.forEach(([x, y, r]) => hole(x, y, r, 0.55));
  /* the warm glow: pools under the lamps, the windows themselves, coloured lights */
  const pool = (x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
  L.lamps.forEach(([x, y, r]) => { pool(x, y + 8, (r || 96) * 0.8, 'rgba(255,186,96,.30)'); });
  L.wins.forEach(([x, y, w, h]) => { pool(x + w / 2, y + h / 2, Math.max(w, h) + 10, 'rgba(255,190,100,.22)'); g.fillStyle = 'rgba(255,205,120,.55)'; rr(g, x, y, w, h, 2); g.fill(); });
  L.glows.forEach(([x, y, r, col]) => pool(x, y, r, col));
  /* the lamp heads: a post seen from above, the lit globe */
  L.lamps.forEach(([x, y]) => { g.fillStyle = 'rgba(255,244,200,.95)'; circ(g, x, y, 4.5); g.fill(); pool(x, y, 16, 'rgba(255,230,160,.8)'); });
  return NIGHT_CACHE[sc] = { dark, glow };
}
function drawNight(){
  { const art = SCENE_ART[S.scene]; if (art && art.night){ art.night(); return; } }   // (a scene with its own lighting: the bridge, render/ponte.js)
  if (interiorScene()) return;
  const a = nightAmount(); if (a <= 0.001 && !NIGHT.gold) return;
  const N = NIGHT_CACHE[S.scene] || buildNight(S.scene);
  ctx.save();
  if (NIGHT.gold > 0){ ctx.globalAlpha = NIGHT.gold * 0.36; ctx.fillStyle = '#ff9a3c'; ctx.fillRect(0, 0, W, H); }
  ctx.globalAlpha = a; ctx.drawImage(N.dark, 0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(N.glow, 0, 0, W, H);
  ctx.restore();
}

/* ---------- Bar Centrale at night: closed, the shutter down ---------- */
const barClosed = () => daytime() === 'night';
function drawBarShutter(){
  const x = 704, y = 128, w = 232, h = 54;
  ctx.fillStyle = 'rgba(30,20,10,.3)'; ctx.fillRect(x + 3, y + 4, w, h);
  ctx.fillStyle = '#8d9096'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(40,44,52,.45)'; ctx.lineWidth = 1;
  for (let yy = y + 4; yy < y + h; yy += 5){ ctx.beginPath(); ctx.moveTo(x, yy + 0.5); ctx.lineTo(x + w, yy + 0.5); ctx.stroke(); }
  ctx.fillStyle = '#5c6068'; ctx.fillRect(x, y + h - 5, w, 5);
  ctx.fillStyle = '#fffdf8'; rr(ctx, x + w / 2 - 40, y + 16, 80, 20, 3); ctx.fill(); ctx.strokeStyle = '#c23b2a'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#c23b2a'; ctx.font = '800 12px "Titillium Web", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CHIUSO', x + w / 2, y + 27);
  /* the chairs, stacked on the tables */
  TABLES.forEach(([tx, ty]) => { ctx.fillStyle = '#1c3d8f'; rr(ctx, tx - 7, ty - 9, 14, 6, 2); ctx.fill(); rr(ctx, tx - 7, ty + 3, 14, 6, 2); ctx.fill(); });
}
/* tests: the mean brightness (0–255) of the current scene's background with the night pass as it is drawn now, on a
   canvas of its own (the game canvas may be tainted by the museum's pictures, which forbids reading it) */
window.__nightProbe = () => {
  const art = SCENE_ART[S.scene]; if (art && art.probe) return art.probe();
  const base = { piazza:bg, sanlorenzo:bgSL, aurora:bgAU, santo:bgSanto, mercato:bgMercato, museo:bgMuseo, stazione:bgStazione }[S.scene] || (art && art.base ? art.base() : null) || (shopOf() ? shopBg(S.scene) : null);
  if (!base) return null;
  const c = document.createElement('canvas'); c.width = W / 4; c.height = H / 4;
  const g = c.getContext('2d'); g.drawImage(base, 0, 0, c.width, c.height);
  const a = interiorScene() ? 0 : nightAmount();
  if (a > 0){ const N = NIGHT_CACHE[S.scene] || buildNight(S.scene); g.globalAlpha = a; g.drawImage(N.dark, 0, 0, c.width, c.height); g.globalCompositeOperation = 'lighter'; g.drawImage(N.glow, 0, 0, c.width, c.height); }
  const d = g.getImageData(0, 0, c.width, c.height).data; let s = 0;
  for (let i = 0; i < d.length; i += 4) s += (d[i] + d[i + 1] + d[i + 2]) / 3;
  return s / (d.length / 4);
};
