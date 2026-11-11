/* The night lighting pass (first built for Padova's Lesson 12; world/daytime.js has the time of day). No new art per scene: every outdoor
   scene gets a dark-blue layer with holes where the light is (street lamps, lit windows, the fountain), and a warm glow
   added on top. Both layers are drawn once per scene (NIGHT_CACHE) from NIGHT_LIGHTS and drawn with nightAmount() as
   their strength, so the dusk fades smoothly (a gold tint at its middle). Interiors (INTERIOR, world/daytime.js) are lit:
   no pass. A new scene adds its entry to NIGHT_LIGHTS (lamps: [x, y, r?], wins: [x, y, w, h] lit windows, glows:
   [x, y, r, 'rgba(…)'] coloured light, e.g. a fountain); without one it gets a few default lamps. __nightProbe() reads the
   scene's background from its SCENE_ART probe / base, or the unit's UNIT.sceneBase(scene). */
const NIGHT_LIGHTS = {};          // a unit's scenes: Object.assign(NIGHT_LIGHTS, { scene:{ lamps, wins, glows } })
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

/* tests: the mean brightness (0–255) of the current scene's background with the night pass as it is drawn now, on a
   canvas of its own (the game canvas may be tainted by the museum's pictures, which forbids reading it) */
window.__nightProbe = () => {
  const art = SCENE_ART[S.scene]; if (art && art.probe) return art.probe();
  const base = unitHook('sceneBase', S.scene) || (art && art.base ? art.base() : null) || (shopOf() ? shopBg(S.scene) : null);
  if (!base) return null;
  const c = document.createElement('canvas'); c.width = W / 4; c.height = H / 4;
  const g = c.getContext('2d'); g.drawImage(base, 0, 0, c.width, c.height);
  const a = interiorScene() ? 0 : nightAmount();
  if (a > 0){ const N = NIGHT_CACHE[S.scene] || buildNight(S.scene); g.globalAlpha = a; g.drawImage(N.dark, 0, 0, c.width, c.height); g.globalCompositeOperation = 'lighter'; g.drawImage(N.glow, 0, 0, c.width, c.height); }
  const d = g.getImageData(0, 0, c.width, c.height).data; let s = 0;
  for (let i = 0; i < d.length; i += 4) s += (d[i] + d[i + 1] + d[i + 2]) / 3;
  return s / (d.length / 4);
};
