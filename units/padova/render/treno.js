/* The night train's drawing (world/treno.js has the layout): the cars' background (built once, lazily, at the scene's full
   size, with the windows and the track left transparent), the view in the windows (the sky and three layers of scenery
   that slide past at their own speeds, per sky: night, dawn, day, the lagoon), the track under the train, and in the
   depth-sorted pass the chairs, the table lamps, the counter, the gangway doors, the compartment doors that open, the
   kitchen's steam; after the people: the lamps' glow and the voices behind doors. The compartments' interiors (scenes
   'cabina11' … 'cabina18') have a background of their own, with the same view in their window. A dog: drawDog(). The
   train rocks a little (SCENE_ART.treno.sway). */

let bgTreno = null;
const TR_COL = { wood:'#6b3a22', woodD:'#4e2814', woodL:'#8a4f2c', brass:'#c9a54a', brassD:'#8f6f26', navy:'#1c2848', navyD:'#121a33', cream:'#efe6d0',
  carpet:'#7a1f2c', carpetD:'#5e1520', green:'#2f5a3a', red:'#7a2232', floor:'#5a3820' };
/* the windows in the north faces: [x, w] (their glass from y 52 to 136) */
const TR_WIN = [
  [40, 80],
  ...TRENO.comps.map(c => [c.cx - 40, 80]),
  ...[1150, 1230, 1310, 1390, 1470, 1550, 1630, 1710, 1790].map(x => [x - 30, 60]),
  ...[2110, 2210, 2310].map(x => [x - 34, 68]),
];
const TR_WIN_Y = [52, 136];

/* ---------- the view: sky + three layers of scenery, per sky ---------- */
const TR_VIEW = {};       // per sky: { sky (a 1 × band gradient canvas), far, mid, near (tile canvases), tw:{ far, mid, near } }
const TR_SPEED = { far:7, mid:46, near:300, track:300 };
function trViewLayers(sky){
  if (TR_VIEW[sky]) return TR_VIEW[sky];
  const BH = 160, hz = 84;                         // the band's height (from its top), the horizon in it
  const mk = (w) => { const c = document.createElement('canvas'); c.width = w * DPR; c.height = BH * DPR; const g = c.getContext('2d'); g.scale(DPR, DPR); return [c, g]; };
  const r = rng({ night:7, dawn:11, day:13, lagoon:17 }[sky] || 5);
  const P = {
    night:{ top:'#070d22', mid:'#13204a', hz:'#26346a', hill:'#0e1630', hill2:'#141f3e', field:'#0b1324', tree:'#060c1a', pole:'#03060e', light:'#ffd27a' },
    dawn:{ top:'#3b3f78', mid:'#b8708a', hz:'#f6c48a', hill:'#6a6596', hill2:'#7d769e', field:'#7d8a70', tree:'#3f4a46', pole:'#2a2a38', light:'#ffe2b0' },
    day:{ top:'#5d9fd6', mid:'#9cc9ea', hz:'#dff0f8', hill:'#8aa6b6', hill2:'#9bb59a', field:'#86b45a', tree:'#3f6e34', pole:'#3a3a40', light:'#fff' },
    lagoon:{ top:'#8fb2d8', mid:'#d8c3c0', hz:'#f8d6a8', hill:'#8a86a6', hill2:'#9a96b2', field:'#86a8c0', tree:'#3a2a20', pole:'#3a3038', light:'#fff2c8' },
  }[sky] || {};
  const V = { tw:{ far:1400, mid:1100, near:620 }, P, hz, BH };
  /* the sky gradient (1 px wide) */
  { const [c, g] = mk(1); const gr = g.createLinearGradient(0, 0, 0, hz + 6); gr.addColorStop(0, P.top); gr.addColorStop(0.62, P.mid); gr.addColorStop(1, P.hz); g.fillStyle = gr; g.fillRect(0, 0, 1, BH); V.sky = c; }
  /* far: hills (or the water and Venice), distant towns */
  { const w = V.tw.far, [c, g] = mk(w);
    if (sky === 'night'){ for (let i = 0; i < 90; i++){ g.fillStyle = `rgba(255,255,240,${0.3 + r() * 0.6})`; g.fillRect(r() * w, r() * (hz - 24), 1.2, 1.2); } }
    if (sky === 'lagoon'){
      const wg = g.createLinearGradient(0, hz, 0, BH); wg.addColorStop(0, '#c9b9b8'); wg.addColorStop(0.25, '#9eb6c8'); wg.addColorStop(1, '#6f93ad'); g.fillStyle = wg; g.fillRect(0, hz, w, BH - hz);
      /* Venice on the horizon: roofs, bell towers, domes */
      g.fillStyle = '#8a809c';
      for (let x = 0; x < w; x += 6){ const near = Math.abs(((x / w) * 2 - 1)) < 0.6; if (!near) continue; g.fillRect(x, hz - 4 - r() * 6, 6, 10); }
      [[w * 0.3, 30], [w * 0.42, 22], [w * 0.55, 34], [w * 0.68, 18]].forEach(([x, h]) => { g.fillRect(x, hz - h, 5, h); g.beginPath(); g.moveTo(x - 1, hz - h); g.lineTo(x + 2.5, hz - h - 7); g.lineTo(x + 6, hz - h); g.fill(); });
      [[w * 0.47, 9], [w * 0.5, 7], [w * 0.62, 8]].forEach(([x, rr2]) => { g.beginPath(); g.arc(x, hz - 6, rr2, Math.PI, 0); g.fill(); });
      g.strokeStyle = 'rgba(255,240,220,.35)'; g.lineWidth = 1;
      for (let i = 0; i < 70; i++){ const x = r() * w, y = hz + 4 + r() * (BH - hz - 8); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8 + r() * 14, y); g.stroke(); }
    } else {
      const hill = (col, amp, base, f) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, BH); for (let x = 0; x <= w; x += 8) g.lineTo(x, hz - base - amp * (0.5 + 0.5 * Math.sin(x / w * Math.PI * 2 * f) * Math.sin(x / w * Math.PI * 2 * (f + 1) + 1)) ); g.lineTo(w, BH); g.closePath(); g.fill(); };
      hill(P.hill, 26, 4, 2); hill(P.hill2, 12, -2, 3);
      /* distant towns: a cluster of roofs, a bell tower, lit windows at night */
      [0.12, 0.38, 0.7, 0.88].forEach((k, i) => {
        const tx = w * k, n = 6 + Math.floor(r() * 7);
        g.fillStyle = sky === 'night' ? '#0a1124' : sky === 'dawn' ? '#5a557e' : '#7e8c98';
        for (let j = 0; j < n; j++){ const bx = tx + j * 9 - n * 4, bh = 6 + r() * 8; g.fillRect(bx, hz - bh + 2, 8, bh); }
        if (i % 2 === 0){ g.fillRect(tx + 6, hz - 24, 5, 26); g.beginPath(); g.moveTo(tx + 5, hz - 24); g.lineTo(tx + 8.5, hz - 31); g.lineTo(tx + 12, hz - 24); g.fill(); }
        if (sky === 'night') for (let j = 0; j < n * 2; j++){ g.fillStyle = r() < 0.7 ? P.light : '#ffeec0'; g.fillRect(tx - n * 4 + r() * n * 9, hz - 2 - r() * 8, 1.4, 1.4); }
      });
    }
    V.far = c; }
  /* mid: fields, poplars, a farmhouse; in the lagoon the wooden posts (bricole) and a boat */
  { const w = V.tw.mid, [c, g] = mk(w);
    if (sky === 'lagoon'){
      for (let i = 0; i < 9; i++){ const x = 60 + i * 120 + r() * 40, y = hz + 18 + r() * 26; g.fillStyle = P.tree; [-5, 0, 5].forEach(dx => g.fillRect(x + dx, y - 26, 3.4, 30)); g.strokeStyle = P.tree; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 5, y - 22); g.lineTo(x + 8, y - 22); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(x - 8, y + 4); g.lineTo(x + 12, y + 4); g.stroke(); }
      g.fillStyle = '#5a3a2a'; g.beginPath(); g.moveTo(520, hz + 40); g.lineTo(580, hz + 40); g.lineTo(570, hz + 47); g.lineTo(528, hz + 47); g.closePath(); g.fill(); g.fillStyle = '#e8e0cc'; g.fillRect(540, hz + 30, 14, 10);
      g.strokeStyle = '#555'; g.lineWidth = 1.4; [[300, hz - 20], [314, hz - 26], [760, hz - 14]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x - 6, y + 2); g.quadraticCurveTo(x - 3, y - 2, x, y + 1); g.quadraticCurveTo(x + 3, y - 2, x + 6, y + 2); g.stroke(); });
    } else {
      g.fillStyle = P.field; g.fillRect(0, hz + 6, w, BH - hz);
      g.strokeStyle = sky === 'night' ? 'rgba(40,60,100,.35)' : 'rgba(0,0,0,.12)'; g.lineWidth = 1;
      for (let y = hz + 12; y < BH; y += 7){ g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      if (sky === 'dawn'){ const mg = g.createLinearGradient(0, hz, 0, hz + 30); mg.addColorStop(0, 'rgba(255,230,230,.55)'); mg.addColorStop(1, 'rgba(255,230,230,0)'); g.fillStyle = mg; g.fillRect(0, hz, w, 30); }
      /* rows of poplars, single trees, a farmhouse (a lit window at night) */
      for (let i = 0; i < 14; i++){ const x = r() * w, h = 22 + r() * 22; g.fillStyle = P.tree; g.beginPath(); g.ellipse(x, hz + 8 - h / 2, 5 + r() * 3, h / 2, 0, 0, Math.PI * 2); g.fill(); g.fillRect(x - 1, hz + 6, 2, 6); }
      for (let i = 0; i < 4; i++){ const x = 80 + i * 280 + r() * 60, y = hz + 10; g.fillStyle = sky === 'night' ? '#0d1424' : sky === 'dawn' ? '#9a7a7a' : '#d8c8a8'; g.fillRect(x, y - 14, 30, 16); g.fillStyle = sky === 'night' ? '#080d18' : '#8a4a32'; g.beginPath(); g.moveTo(x - 3, y - 14); g.lineTo(x + 15, y - 24); g.lineTo(x + 33, y - 14); g.fill();
        if (sky === 'night' && i % 2 === 0){ g.fillStyle = P.light; g.fillRect(x + 6, y - 9, 4, 4); const gl = g.createRadialGradient(x + 8, y - 7, 0, x + 8, y - 7, 14); gl.addColorStop(0, 'rgba(255,200,110,.45)'); gl.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = gl; g.fillRect(x - 8, y - 22, 32, 30); } }
    }
    V.mid = c; }
  /* near: the poles and the wires, rushing past (in the lagoon: the causeway's lamp posts) */
  { const w = V.tw.near, [c, g] = mk(w);
    g.fillStyle = P.pole; g.strokeStyle = P.pole;
    [0, 310].forEach(x => { g.fillRect(x + 20, 4, 5, BH); g.fillRect(x + 8, 14, 30, 3);
      if (sky === 'lagoon'){ g.fillStyle = '#2a2a30'; g.fillRect(x + 14, 8, 16, 6); g.fillStyle = P.pole; } });
    g.lineWidth = 1; g.beginPath(); g.moveTo(0, 16); g.quadraticCurveTo(w / 4, 30, w / 2, 16); g.quadraticCurveTo(w * 3 / 4, 30, w, 16); g.stroke();
    if (sky !== 'lagoon'){ g.fillStyle = sky === 'night' ? '#05080f' : 'rgba(40,50,30,.8)'; g.fillRect(0, BH - 14, w, 14); }
    V.near = c; }
  return TR_VIEW[sky] = V;
}
/* the view in a window band: world x0…x1, the band's top y0 (the face's top), drawn for the time t (seconds) */
function trDrawView(x0, x1, y0, t, sky){
  const V = trViewLayers(sky), mv = trenoMoving() && !RM;
  ctx.drawImage(V.sky, x0, y0, x1 - x0, V.BH);
  if (sky === 'night'){ const mx = 1430, my = y0 + 34; if (mx > x0 - 40 && mx < x1 + 40){ const gl = ctx.createRadialGradient(mx, my, 4, mx, my, 46); gl.addColorStop(0, 'rgba(255,250,220,.45)'); gl.addColorStop(1, 'rgba(255,250,220,0)'); ctx.fillStyle = gl; ctx.fillRect(mx - 46, my - 46, 92, 92); ctx.fillStyle = '#fbf6dc'; circ(ctx, mx, my, 11); ctx.fill(); ctx.fillStyle = 'rgba(200,196,170,.5)'; circ(ctx, mx - 3, my - 2, 2.5); ctx.fill(); circ(ctx, mx + 4, my + 3, 1.8); ctx.fill(); } }
  if (sky === 'dawn' || sky === 'lagoon'){ const sx = 1500, sy = y0 + V.hz - 4; if (sx > x0 - 60 && sx < x1 + 60){ const gl = ctx.createRadialGradient(sx, sy, 4, sx, sy, 70); gl.addColorStop(0, 'rgba(255,230,160,.8)'); gl.addColorStop(1, 'rgba(255,200,140,0)'); ctx.fillStyle = gl; ctx.fillRect(sx - 70, sy - 70, 140, 140); ctx.fillStyle = '#ffd88a'; circ(ctx, sx, sy, 13); ctx.fill(); } }
  [['far', V.far], ['mid', V.mid], ['near', V.near]].forEach(([k, c]) => {
    const tw = V.tw[k], off = mv ? (t * TR_SPEED[k]) % tw : 0;
    for (let x = Math.floor((x0 + off) / tw) * tw - off; x < x1; x += tw) ctx.drawImage(c, x, y0, tw, V.BH);
  });
}
/* the track under the train, rushing past (y 544 → 600) */
function trDrawTrack(x0, x1, t){
  const mv = trenoMoving() && !RM, night = trenoSky() === 'night', off = mv ? (t * TR_SPEED.track) % 40 : 0;
  ctx.fillStyle = night ? '#1e1c1e' : trenoSky() === 'lagoon' ? '#7f97ab' : '#5e5650'; ctx.fillRect(x0, 540, x1 - x0, 60);
  if (trenoSky() !== 'lagoon'){ ctx.fillStyle = night ? 'rgba(90,80,70,.35)' : 'rgba(150,140,120,.5)'; for (let x = Math.floor(x0 / 7) * 7 - (off % 7); x < x1; x += 7) ctx.fillRect(x, 548 + ((x * 13) % 40), 2, 2); }
  ctx.fillStyle = night ? '#2c221a' : '#5a4430';
  for (let x = Math.floor(x0 / 40) * 40 - off; x < x1; x += 40) ctx.fillRect(x, 556, 14, 40);
  ctx.fillStyle = night ? '#6a6e78' : '#b8bcc4'; ctx.fillRect(x0, 562, x1 - x0, 4); ctx.fillRect(x0, 586, x1 - x0, 4);
}

/* ---------- the cars: the background, built once at full size ---------- */
function buildBgTreno(){
  const k = Math.min(DPR, 1.5), c = document.createElement('canvas'); c.width = Math.round(TRENO.w * k); c.height = Math.round(TRENO.h * k);
  const g = c.getContext('2d'); g.scale(k, k); bgTreno = c; bgTreno.k = k;
  const r = rng(1313), F = TRENO.face, C = TR_COL;
  /* outside, between and above the cars: the night (it is covered again where the cars are) */
  g.fillStyle = '#0c1020'; g.fillRect(0, 0, TRENO.w, TRENO.h);
  TRENO.cars.forEach(car => {
    const x0 = car.x0, x1 = car.x1, w = x1 - x0;
    /* the roof edge, seen from above */
    g.fillStyle = C.navyD; g.fillRect(x0, 0, w, F.top);
    g.fillStyle = 'rgba(255,255,255,.06)'; for (let x = x0 + 14; x < x1; x += 28) g.fillRect(x, 0, 2, F.top);
    g.fillStyle = C.brass; g.fillRect(x0, F.top - 3, w, 2);
    /* the north face: panelling, brass, the windows (cut out below) */
    const fg = g.createLinearGradient(0, F.top, 0, F.bottom); fg.addColorStop(0, C.woodL); fg.addColorStop(0.5, C.wood); fg.addColorStop(1, C.woodD);
    g.fillStyle = fg; g.fillRect(x0, F.top, w, F.bottom - F.top);
    /* the panels under the windows: marquetry lozenges */
    for (let x = x0 + 8; x < x1 - 30; x += 52){ g.strokeStyle = 'rgba(30,10,0,.35)'; g.lineWidth = 1.2; rr(g, x, 142, 46, 28, 3); g.stroke();
      g.fillStyle = 'rgba(255,220,170,.10)'; g.beginPath(); g.moveTo(x + 23, 146); g.lineTo(x + 40, 156); g.lineTo(x + 23, 166); g.lineTo(x + 6, 156); g.closePath(); g.fill(); }
    g.fillStyle = C.brass; g.fillRect(x0, 140, w, 2.5); g.fillRect(x0, F.bottom - 3, w, 3);
    /* the car's name on a little brass plaque at its west end */
    g.fillStyle = C.brassD; rr(g, x0 + 14, 34, 96, 14, 3); g.fill(); g.fillStyle = '#f6e7b8'; g.font = '700 9px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(car.name.toUpperCase(), x0 + 62, 41.5);
    /* the floor */
    if (car.id === 'letto'){
      g.fillStyle = C.floor; g.fillRect(x0, F.bottom, w, TRENO.corr.y1 - F.bottom);
      g.fillStyle = C.carpet; g.fillRect(x0 + 20, F.bottom + 12, w - 20, 58); g.fillStyle = C.brass; g.fillRect(x0 + 20, F.bottom + 12, w - 20, 2); g.fillRect(x0 + 20, F.bottom + 68, w - 20, 2);
      g.fillStyle = 'rgba(255,210,140,.10)'; for (let x = x0 + 30; x < x1; x += 22){ g.beginPath(); g.moveTo(x, F.bottom + 41); g.lineTo(x + 6, F.bottom + 34); g.lineTo(x + 12, F.bottom + 41); g.lineTo(x + 6, F.bottom + 48); g.closePath(); g.fill(); }
      /* the vestibule: a plain floor, the door out */
      g.fillStyle = '#6e5a46'; g.fillRect(x0 + 20, F.bottom, 120, TRENO.vest.y1 - F.bottom);
      g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = F.bottom; y < TRENO.vest.y1; y += 12) g.fillRect(x0 + 20, y, 120, 1);
      g.fillStyle = '#3d2a1a'; g.fillRect(x0 + 20, TRENO.vest.y1 - 6, 120, 6);
      g.fillStyle = C.navy; rr(g, 46, TRENO.vest.y1 - 14, 68, 14, 2); g.fill(); g.fillStyle = 'rgba(160,190,230,.45)'; g.fillRect(58, TRENO.vest.y1 - 12, 44, 8); g.fillStyle = C.brass; g.fillRect(104, TRENO.vest.y1 - 10, 6, 3);
      /* the compartments' roofs (closed rooms: the carriage's curved roof, panel by panel, a ventilator and the number on
         each), and the roof over the vestibule's end */
      const roof = (x, y, w2, h2) => { const rg = g.createLinearGradient(0, y, 0, y + h2); rg.addColorStop(0, '#2a3a66'); rg.addColorStop(0.45, '#3a4c7e'); rg.addColorStop(1, '#1e2a4e'); g.fillStyle = rg; g.fillRect(x, y, w2, h2); };
      roof(0, TRENO.vest.y1 + 6, 140, TRENO.floorBottom - TRENO.vest.y1 - 6); roof(140, 274, 920, TRENO.floorBottom - 274);
      TRENO.comps.forEach(cp => {
        g.strokeStyle = 'rgba(8,12,28,.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cp.x, 276); g.lineTo(cp.x, TRENO.floorBottom); g.stroke();
        g.strokeStyle = 'rgba(160,180,230,.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cp.x + 3, 276); g.lineTo(cp.x + 3, TRENO.floorBottom); g.stroke();
        for (let y = 292; y < TRENO.floorBottom - 8; y += 16){ g.fillStyle = 'rgba(0,0,0,.25)'; circ(g, cp.x + 9, y, 1.3); g.fill(); circ(g, cp.x + cp.w - 7, y, 1.3); g.fill(); }
        /* a mushroom ventilator, its shadow */
        g.fillStyle = 'rgba(0,0,0,.3)'; ell(g, cp.cx + 5, 444, 17, 9); g.fill(); g.fillStyle = '#56628a'; ell(g, cp.cx, 438, 16, 9); g.fill(); g.fillStyle = '#6c79a2'; ell(g, cp.cx - 2, 436, 10, 5); g.fill();
        g.fillStyle = 'rgba(201,165,74,.62)'; g.font = '700 30px "Bodoni Moda", Georgia, serif'; g.fillText(String(cp.n), cp.cx, 352);
        g.strokeStyle = 'rgba(201,165,74,.35)'; g.lineWidth = 1.2; rr(g, cp.cx - 26, 326, 52, 50, 6); g.stroke();
      });
      g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0, 392, 1060, 3);
      g.fillStyle = C.woodD; g.fillRect(140, 258, 920, 16); g.fillStyle = C.brass; g.fillRect(140, 258, 920, 2);
    } else if (car.id === 'ristorante'){
      g.fillStyle = C.carpet; g.fillRect(x0, F.bottom, w, TRENO.floorBottom - F.bottom);
      g.strokeStyle = 'rgba(201,165,74,.22)'; g.lineWidth = 1;
      for (let x = x0; x < x1; x += 30) for (let y = F.bottom + 10; y < TRENO.floorBottom; y += 30){ g.beginPath(); g.moveTo(x + 15, y); g.lineTo(x + 25, y + 10); g.lineTo(x + 15, y + 20); g.lineTo(x + 5, y + 10); g.closePath(); g.stroke(); }
      g.fillStyle = C.carpetD; g.fillRect(x0, F.bottom, w, 6); g.fillRect(x0, TRENO.floorBottom - 6, w, 6);
      /* the kitchen: a tiled wall, the hatch; the strip behind the counter: a plain wooden floor */
      const K = TRENO.kitchen; g.fillStyle = '#5a3820'; g.fillRect(TRENO.counter.x + TRENO.counter.w, K.y, K.x - TRENO.counter.x - TRENO.counter.w, K.h);
      g.fillStyle = '#d8d4c8'; g.fillRect(K.x, K.y, K.w, K.h); g.strokeStyle = 'rgba(0,0,0,.08)'; for (let x = K.x; x < K.x + K.w; x += 12) for (let y = K.y; y < K.y + K.h; y += 12) g.strokeRect(x, y, 12, 12);
      g.fillStyle = '#9a9690'; rr(g, K.x + 30, K.y + 30, 60, 40, 4); g.fill(); g.fillStyle = '#2b2b2b'; [[45, 42], [75, 42], [45, 60], [75, 60]].forEach(([dx, dy]) => { circ(g, K.x + dx, K.y + dy, 7); g.fill(); });
      g.fillStyle = '#b8b4ac'; rr(g, K.x + 20, K.y + 120, 80, 30, 3); g.fill(); g.fillStyle = '#8fb0c8'; rr(g, K.x + 30, K.y + 125, 30, 20, 3); g.fill();
      g.fillStyle = C.woodD; g.fillRect(K.x - 6, K.y, 6, K.h);
      const Hh = TRENO.hatch; g.fillStyle = '#2a1a10'; g.fillRect(Hh.x - 6, Hh.y, 16, Hh.h); g.fillStyle = C.brass; g.fillRect(Hh.x - 10, Hh.y - 2, 22, 3); g.fillRect(Hh.x - 10, Hh.y + Hh.h - 1, 22, 3);
      /* the end wall above the gangway into the front car, and the bottles behind the counter */
      g.fillStyle = C.woodD; g.fillRect(K.x - 6, K.y - 6, K.w + 6, 6);
    } else {
      g.fillStyle = '#7a6048'; g.fillRect(x0, F.bottom, w, TRENO.floorBottom - F.bottom);
      g.fillStyle = 'rgba(0,0,0,.14)'; for (let x = x0; x < x1; x += 18) g.fillRect(x, F.bottom, 1.2, TRENO.floorBottom - F.bottom);
      /* the luggage (trunks, cases) and mail sacks */
      [[2066, 438, 66, 40, '#6b4226'], [2138, 446, 64, 34, '#2f4a6a'], [2072, 482, 58, 32, '#7a2a2a'], [2140, 484, 64, 30, '#8a6a3a'], [2256, 476, 48, 40, '#c8c0a8'], [2308, 480, 46, 36, '#c8c0a8']].forEach(([x, y, ww, hh, col], i) => {
        g.fillStyle = 'rgba(0,0,0,.3)'; rr(g, x + 3, y + 3, ww, hh, i > 3 ? 12 : 4); g.fill(); g.fillStyle = col; rr(g, x, y, ww, hh, i > 3 ? 12 : 4); g.fill();
        if (i < 4){ g.fillStyle = C.brass; g.fillRect(x + 6, y, 3, hh); g.fillRect(x + ww - 9, y, 3, hh); } else { g.strokeStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.moveTo(x + ww / 2, y + 4); g.lineTo(x + ww / 2, y + hh - 4); g.stroke(); g.fillStyle = '#5a4a2a'; g.font = '700 7px sans-serif'; g.fillText('POSTE', x + ww / 2, y + hh / 2); }
      });
      /* a runner to the cab door, a bench, a coat stand, the fire extinguisher */
      g.fillStyle = '#3a5a4a'; g.fillRect(x0, 200, TRENO.cabX - x0, 36); g.fillStyle = 'rgba(201,165,74,.4)'; g.fillRect(x0, 200, TRENO.cabX - x0, 2); g.fillRect(x0, 234, TRENO.cabX - x0, 2);
      g.fillStyle = 'rgba(0,0,0,.3)'; rr(g, 2232, 300, 120, 28, 5); g.fill(); g.fillStyle = C.woodL; rr(g, 2228, 296, 120, 26, 5); g.fill(); g.fillStyle = C.green; rr(g, 2232, 300, 112, 18, 4); g.fill();
      g.fillStyle = '#b02a20'; rr(g, 2372, 380, 14, 30, 4); g.fill(); g.fillStyle = '#2b2b2b'; g.fillRect(2375, 376, 8, 6);
      g.fillStyle = C.woodD; circ(g, 2080, 300, 9); g.fill(); g.fillStyle = '#5a4a6a'; ell(g, 2084, 298, 8, 5); g.fill(); g.fillStyle = '#2f4a6a'; ell(g, 2076, 303, 7, 4); g.fill();
      /* the cab: its wall, a door with a round window, a sign */
      g.fillStyle = C.navy; g.fillRect(TRENO.cabX, F.bottom, 80, TRENO.floorBottom - F.bottom); g.fillStyle = C.navyD; g.fillRect(TRENO.cabX, F.bottom, 8, TRENO.floorBottom - F.bottom);
      g.fillStyle = '#20283e'; g.fillRect(TRENO.cabX + 18, 200, 50, 120); g.fillStyle = '#6a7e9a'; circ(g, TRENO.cabX + 30, 240, 6); g.fill(); circ(g, TRENO.cabX + 52, 260, 5); g.fill(); g.fillStyle = '#e04030'; circ(g, TRENO.cabX + 42, 300, 4); g.fill();
      g.fillStyle = '#efe6d0'; rr(g, TRENO.cabX - 100, 150, 92, 22, 3); g.fill(); g.fillStyle = '#b02a20'; g.font = '700 8px "Titillium Web", sans-serif'; g.fillText('CABINA DI GUIDA', TRENO.cabX - 54, 157); g.fillText('VIETATO L\'INGRESSO', TRENO.cabX - 54, 166);
    }
    /* the south wall, seen from above, and the car's end walls */
    g.fillStyle = C.navy; g.fillRect(x0, TRENO.floorBottom, w, 20); g.fillStyle = C.brass; g.fillRect(x0, TRENO.floorBottom + 3, w, 2);
    g.fillStyle = '#efe6d0'; g.font = '700 10px "Bodoni Moda", Georgia, serif'; g.fillText('LAGUNA  EXPRESS', x0 + w / 2, TRENO.floorBottom + 13);
    g.fillStyle = C.navyD; g.fillRect(x0, TRENO.floorBottom + 20, w, 6);
  });
  /* the gangways: a floor plate between the bellows */
  TRENO.gang.forEach(gw => {
    g.fillStyle = '#1a1a1e'; g.fillRect(gw.x0, 120, gw.x1 - gw.x0, 180);
    for (let y = 124; y < 296; y += 6){ g.fillStyle = y % 12 ? '#2b2b30' : '#3a3a40'; g.fillRect(gw.x0, y, gw.x1 - gw.x0, 3); }
    g.fillStyle = '#7a7a80'; g.fillRect(gw.x0 - 2, TRENO.gangY[0] - 6, gw.x1 - gw.x0 + 4, TRENO.gangY[1] - TRENO.gangY[0] + 14);
    g.strokeStyle = 'rgba(0,0,0,.35)'; for (let x = gw.x0; x < gw.x1; x += 5){ g.beginPath(); g.moveTo(x, TRENO.gangY[0] - 6); g.lineTo(x, TRENO.gangY[1] + 8); g.stroke(); }
  });
  /* the windows: cut out (the view shows through), then their frames, a sheen, the curtains */
  g.save(); g.globalCompositeOperation = 'destination-out';
  TR_WIN.forEach(([x, w]) => { rr(g, x, TR_WIN_Y[0], w, TR_WIN_Y[1] - TR_WIN_Y[0], 8); g.fill(); });
  g.fillRect(0, 540, TRENO.w, 60);
  g.restore();
  TR_WIN.forEach(([x, w]) => {
    const y0 = TR_WIN_Y[0], h = TR_WIN_Y[1] - y0;
    g.fillStyle = 'rgba(200,220,255,.07)'; g.beginPath(); g.moveTo(x + 10, y0); g.lineTo(x + 26, y0); g.lineTo(x + 6, y0 + h); g.lineTo(x - 10, y0 + h); g.closePath(); g.fill();
    g.strokeStyle = C.brass; g.lineWidth = 3; rr(g, x, y0, w, h, 8); g.stroke(); g.strokeStyle = C.brassD; g.lineWidth = 1; rr(g, x - 3, y0 - 3, w + 6, h + 6, 10); g.stroke();
    g.fillStyle = C.brass; g.fillRect(x + 4, y0 + h * 0.45, w - 8, 1.5);
    /* curtains, tied back */
    [[x - 4, 1], [x + w + 4, -1]].forEach(([cx, s]) => { g.fillStyle = '#8e2433'; g.beginPath(); g.moveTo(cx, y0 - 6); g.quadraticCurveTo(cx + s * 16, y0 + 18, cx + s * 6, y0 + 40); g.quadraticCurveTo(cx + s * 12, y0 + 64, cx + s * 2, y0 + h + 6); g.lineTo(cx - s * 4, y0 + h + 6); g.lineTo(cx - s * 4, y0 - 6); g.closePath(); g.fill();
      g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(cx - s * 4 - (s > 0 ? 0 : 2), y0 - 6, 2, h + 12); g.fillStyle = C.brass; circ(g, cx + s * 6, y0 + 40, 2.2); g.fill(); });
    /* a little lamp on the panel between windows */
    g.fillStyle = C.brass; g.fillRect(x + w + 14, 112, 3, 12); g.fillStyle = '#f7dca0'; circ(g, x + w + 15.5, 110, 4); g.fill();
  });
  /* the compartment doors' frames and number plates (the doors themselves are drawn in the depth-sorted pass) */
  TRENO.comps.forEach(cp => { g.fillStyle = '#2a160a'; g.fillRect(cp.cx - 24, 258, 48, 16); });
  return bgTreno;
}

/* ---------- the depth-sorted things ---------- */
function trChair(x, y, face, col){
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(face.y, face.x));
  ctx.fillStyle = 'rgba(0,0,0,.25)'; rr(ctx, -15, -14, 28, 30, 6); ctx.fill();
  ctx.fillStyle = col; rr(ctx, -16, -15, 28, 30, 6); ctx.fill();
  ctx.fillStyle = galShade(col, -0.25); rr(ctx, -18, -15, 9, 30, 4); ctx.fill();      // the back
  ctx.fillStyle = galShade(col, 0.12); rr(ctx, -8, -11, 17, 22, 4); ctx.fill();       // the cushion
  ctx.restore();
}
function trTable(T, t){
  const { x, y, w, h } = T, north = y < 300;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; rr(ctx, x + 3, y + 5, w, h, 4); ctx.fill();
  ctx.fillStyle = '#fbf8f0'; rr(ctx, x - 3, y - 2, w + 6, h + 6, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(160,150,130,.5)'; ctx.lineWidth = 1; for (let k = 0; k < 4; k++){ ctx.beginPath(); ctx.moveTo(x - 3 + k * (w + 6) / 3, y + h + 4); ctx.lineTo(x + 2 + k * (w + 6) / 3, y + h + 1); ctx.stroke(); }
  /* two places laid, the lamp, a rose */
  [[x + 16, y + h / 2 + 2], [x + w - 16, y + h / 2 + 2]].forEach(([px, py]) => { ctx.fillStyle = '#fff'; circ(ctx, px, py, 8); ctx.fill(); ctx.strokeStyle = '#c9a54a'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = 'rgba(200,220,240,.8)'; circ(ctx, px + 4, py - 10, 3); ctx.fill(); });
  const lx = x + w / 2, ly = north ? y + 9 : y + h - 9;
  ctx.fillStyle = '#c9a54a'; circ(ctx, lx, ly, 3); ctx.fill(); ctx.fillStyle = '#f2c7a0'; circ(ctx, lx, ly - 2, 7.5); ctx.fill(); ctx.fillStyle = '#ffe6b8'; circ(ctx, lx, ly - 2, 4); ctx.fill();
  ctx.fillStyle = '#3f6e2e'; ctx.fillRect(lx - 1, ly + 8, 1.6, 8); ctx.fillStyle = '#c23b2a'; circ(ctx, lx, ly + 8, 2.6); ctx.fill();
  if (T.food) T.food.forEach(([px, col]) => { ctx.fillStyle = col; circ(ctx, x + (px === 'w' ? 16 : w - 16), y + h / 2 + 2, 5); ctx.fill(); });
}
function trCounter(t){
  const C = TRENO.counter;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; rr(ctx, C.x + 3, C.y + 4, C.w, C.h, 3); ctx.fill();
  ctx.fillStyle = TR_COL.woodD; rr(ctx, C.x, C.y, C.w, C.h, 3); ctx.fill();
  ctx.fillStyle = '#8a5a34'; rr(ctx, C.x - 2, C.y - 2, C.w + 4, C.h + 4, 4); ctx.fill(); ctx.fillStyle = 'rgba(255,230,190,.18)'; ctx.fillRect(C.x + 2, C.y, 4, C.h);
  ctx.fillStyle = TR_COL.brass; ctx.fillRect(C.x - 6, C.y + 4, 2.5, C.h - 8);
  /* on the counter: a bread basket, a bottle, glasses */
  ctx.fillStyle = '#c99a5a'; ell(ctx, C.x + 13, C.y + 30, 9, 6); ctx.fill(); ctx.fillStyle = '#e8c690'; circ(ctx, C.x + 11, C.y + 29, 3); ctx.fill(); circ(ctx, C.x + 16, C.y + 31, 3); ctx.fill();
  ctx.fillStyle = '#2f5a3a'; circ(ctx, C.x + 13, C.y + 80, 4); ctx.fill(); ctx.fillStyle = 'rgba(210,230,250,.85)'; circ(ctx, C.x + 12, C.y + 110, 3); ctx.fill(); circ(ctx, C.x + 14, C.y + 122, 3); ctx.fill();
  /* the stools */
  [380, 430, 470].forEach(y => { ctx.fillStyle = 'rgba(0,0,0,.25)'; circ(ctx, C.x - 22, y + 3, 9); ctx.fill(); ctx.fillStyle = TR_COL.red; circ(ctx, C.x - 24, y, 9); ctx.fill(); ctx.strokeStyle = TR_COL.brass; ctx.lineWidth = 1.5; ctx.stroke(); });
}
/* the gangways' sliding doors: x is the doorway; the panel slides north (into the face) when it opens */
function trSlideDoor(x, a, west){
  const y0 = TRENO.gangY[0] - 8, y1 = TRENO.gangY[1] + 8, h = y1 - y0, off = a * (h - 6);
  ctx.fillStyle = TR_COL.woodD; ctx.fillRect(x - 5, y0 - 4, 10, 4); ctx.fillRect(x - 5, y1, 10, 4);
  ctx.save(); ctx.beginPath(); ctx.rect(x - 8, y0 - 2, 16, h + 2); ctx.clip();
  ctx.fillStyle = '#7d4529'; ctx.fillRect(x - 4, y0 - off, 8, h); ctx.fillStyle = 'rgba(190,215,240,.75)'; ctx.fillRect(x - 2.5, y0 - off + 10, 5, h - 20);
  ctx.fillStyle = TR_COL.brass; ctx.fillRect(x - 4, y0 - off + h / 2 - 3, 8, 3);
  ctx.restore();
}
/* a compartment door in the corridor's south wall: a wooden panel, a brass number plate; open = slid west into the wall */
function trCompDoor(cp){
  const a = TRENO.open[cp.n] || 0, x = cp.cx - 22, y = 258, w = 44, off = a * 40;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, 16); ctx.clip();
  if (a > 0.02){ ctx.fillStyle = '#f2d9a4'; ctx.fillRect(x, y, w, 16); ctx.fillStyle = 'rgba(255,220,150,.6)'; ctx.fillRect(x + 4, y + 2, w - 8, 12); }
  ctx.fillStyle = '#8a4f2c'; ctx.fillRect(x - off, y, w, 16); ctx.fillStyle = 'rgba(255,230,190,.16)'; ctx.fillRect(x - off + 3, y + 2, w - 6, 3);
  ctx.fillStyle = TR_COL.brass; ctx.fillRect(x - off + w - 7, y + 5, 3, 7);
  ctx.restore();
  ctx.fillStyle = TR_COL.brass; rr(ctx, cp.cx - 11, 244, 22, 12, 2); ctx.fill(); ctx.fillStyle = '#2a160a'; ctx.font = '700 9px "Titillium Web", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(cp.n), cp.cx, 250.5);
  if (cp.n === TRENO.mine){ ctx.strokeStyle = 'rgba(244,185,40,.9)'; ctx.lineWidth = 1.5; rr(ctx, cp.cx - 13, 242, 26, 16, 3); ctx.stroke(); }
}
function trCabDoor(){
  const a = TRENO.open.cab || 0, x = TRENO.cabX - 6, y = TRENO.cabDoor.y - 30;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, 12, 60); ctx.clip();
  if (a > 0.02){ ctx.fillStyle = '#3a4a6a'; ctx.fillRect(x, y, 12, 60); }
  ctx.fillStyle = '#2c3a5c'; ctx.fillRect(x, y - a * 56, 12, 60); ctx.fillStyle = '#9ab8d8'; circ(ctx, x + 6, y - a * 56 + 18, 3.5); ctx.fill(); ctx.fillStyle = TR_COL.brass; ctx.fillRect(x + 2, y - a * 56 + 34, 8, 3);
  ctx.restore();
}
/* the kitchen's steam through the hatch */
function trSteam(t){
  if (RM) return;
  const H = TRENO.hatch;
  for (let k = 0; k < 3; k++){ const ph = (t * 0.4 + k / 3) % 1; ctx.fillStyle = `rgba(255,255,255,${0.25 * (1 - ph)})`; circ(ctx, H.x - 8 - ph * 20, H.y + 10 + k * 10 - ph * 16, 5 + ph * 8); ctx.fill(); }
}
function trenoEnts(t){
  const out = [];
  TRENO.tables.forEach(T => {
    const chairCol = T.y < 300 ? TR_COL.green : TR_COL.red;
    ['w', 'e'].forEach(s => { const p = T.seats[s]; out.push({ y:p.y - 1, draw:() => trChair(p.x, p.y, p.face, chairCol) }); });
    out.push({ y:T.y + T.h + (T.y < 300 ? 0 : 0), draw:() => trTable(T, t) });
  });
  out.push({ y:TRENO.counter.y + TRENO.counter.h, draw:() => trCounter(t) });
  out.push({ y:TRENO.hatch.y + TRENO.hatch.h, draw:() => trSteam(t) });
  TRENO.comps.forEach(cp => out.push({ y:258, draw:() => trCompDoor(cp) }));
  out.push({ y:TRENO.cabDoor.y + 30, draw:trCabDoor });
  [1060, 1100, 2000, 2040].forEach((x, i) => out.push({ y:TRENO.gangY[1] + 8, draw:() => trSlideDoor(x, TRENO.slide[i], i % 2 === 0) }));
  return out;
}
/* after the people: the lamps' glow (warm, additive), the voices behind doors */
function trenoAfter(t){
  const x0 = cam.x - 40, x1 = cam.x + W + 40;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const glow = (x, y, r2, a) => { if (x < x0 - r2 || x > x1 + r2) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r2); g.addColorStop(0, `rgba(255,190,110,${a})`); g.addColorStop(1, 'rgba(255,190,110,0)'); ctx.fillStyle = g; ctx.fillRect(x - r2, y - r2, r2 * 2, r2 * 2); };
  TRENO.tables.forEach(T => glow(T.cx, T.y < 300 ? T.y + 7 : T.y + T.h - 11, 46, 0.22));
  TR_WIN.forEach(([x, w]) => glow(x + w + 15, 112, 26, 0.18));
  ctx.restore();
  trDoorBubbles();
}
function trDoorBubbles(){
  const now = performance.now();
  for (let i = TRENO.says.length - 1; i >= 0; i--) if (now - TRENO.says[i].t0 > TRENO.says[i].ms) TRENO.says.splice(i, 1);
  if (S.scene !== 'treno') return;
  TRENO.says.forEach(b => {
    const age = now - b.t0, a = Math.min(1, age / 120, (b.ms - age) / 250), x = b.x, y = b.y - (RM ? 0 : Math.min(1, age / 160) * 4);
    ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.font = 'italic 700 15px "Bodoni Moda", Georgia, serif';
    const w = Math.max(30, ctx.measureText(b.text).width + 20), h = 26;
    ctx.fillStyle = 'rgba(0,0,0,.22)'; rr(ctx, x - w / 2 + 2, y - h + 3, w, h, 11); ctx.fill();
    ctx.fillStyle = '#fff4dc'; rr(ctx, x - w / 2, y - h, w, h, 11); ctx.fill();
    ctx.setLineDash([4, 3]); ctx.strokeStyle = '#7a3a2a'; ctx.lineWidth = 2; rr(ctx, x - w / 2, y - h, w, h, 11); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#4a1a10'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.text, x, y - h / 2 + 1);
    ctx.restore();
  });
}
SCENE_EXTRAS.push({ scene:'treno', ents:() => [], after:trenoAfter });
const trSway = t => RM || !trenoMoving() ? 0 : Math.sin(t * 2.3) * 0.7 + Math.sin(t * 5.1 + 1) * 0.3;
SCENE_ART.treno = {
  back(t){
    if (!bgTreno) buildBgTreno();
    const x0 = cam.x - 4, x1 = cam.x + (cam.overview ? TRENO.w : W) + 4, sky = trenoSky();
    trDrawView(x0, x1, TRENO.face.top - 6, t, sky);
    const k = bgTreno.k, vw = cam.overview ? TRENO.w : W;
    ctx.drawImage(bgTreno, cam.x * k, 0, vw * k, TRENO.h * k, cam.x, 0, vw, TRENO.h);
    trDrawTrack(x0, x1, t);
  },
  ents:t => trenoEnts(t),
  sway:trSway,
  base(){ return bgTreno || buildBgTreno(); },
};

/* ---------- a compartment, inside ---------- */
const BG_CABINA = {};
function buildBgCabina(n){
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const L = TRENO.look[n] || { color:TR_COL.red, bags:1 }, K = CABINA, Cc = TR_COL, r = rng(500 + n);
  /* around the room: the dark */
  g.fillStyle = '#1a100a'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.025)'; for (let x = 0; x < W; x += 24) g.fillRect(x, 0, 1, H);
  /* the north face: panelling, the window (cut out), the luggage rack */
  const fg = g.createLinearGradient(0, K.face.top, 0, K.face.bottom); fg.addColorStop(0, Cc.woodL); fg.addColorStop(1, Cc.woodD);
  g.fillStyle = fg; g.fillRect(K.x0, K.face.top, K.x1 - K.x0, K.face.bottom - K.face.top);
  g.fillStyle = Cc.brass; g.fillRect(K.x0, K.face.bottom - 3, K.x1 - K.x0, 3);
  for (let x = K.x0 + 8; x < K.x1 - 40; x += 60){ g.strokeStyle = 'rgba(30,10,0,.35)'; g.lineWidth = 1.2; rr(g, x, 172, 54, 14, 3); g.stroke(); }
  [[K.x0 + 40, 120], [K.x1 - 40, 120]].forEach(([x, y]) => { g.fillStyle = Cc.brass; g.fillRect(x - 1.5, y, 3, 14); g.fillStyle = '#f7dca0'; circ(g, x, y, 5); g.fill(); });
  /* the floor: a carpet */
  g.fillStyle = Cc.floor; g.fillRect(K.x0, K.face.bottom, K.x1 - K.x0, K.y1 - K.face.bottom);
  g.fillStyle = Cc.carpet; rr(g, K.x0 + 120, K.face.bottom + 50, 170, 290, 6); g.fill(); g.strokeStyle = Cc.brass; g.lineWidth = 2; rr(g, K.x0 + 126, K.face.bottom + 56, 158, 278, 4); g.stroke();
  /* the walls (seen from above) */
  g.fillStyle = Cc.woodD; g.fillRect(K.x0 - 10, K.face.top, 10, K.y1 - K.face.top + 10); g.fillRect(K.x1, K.face.top, 10, K.y1 - K.face.top + 10); g.fillRect(K.x0 - 10, K.y1, K.x1 - K.x0 + 20, 12);
  /* the door out (south) */
  g.fillStyle = '#8a4f2c'; g.fillRect(K.door.x - 30, K.y1 - 4, 60, 12); g.fillStyle = 'rgba(190,215,240,.4)'; g.fillRect(K.door.x - 20, K.y1 - 2, 40, 6); g.fillStyle = Cc.brass; g.fillRect(K.door.x + 22, K.y1, 4, 6);
  g.fillStyle = Cc.brassD; rr(g, K.door.x - 14, K.y1 + 12, 28, 14, 2); g.fill(); g.fillStyle = '#f6e7b8'; g.font = '700 10px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), K.door.x, K.y1 + 19.5);
  /* the bunk (la cuccetta): sheets, the blanket, the pillow; the kids' room: a teddy bear and two pillows */
  const B = K.bunk;
  g.fillStyle = 'rgba(0,0,0,.3)'; rr(g, B.x + 4, B.y + 5, B.w, B.h, 6); g.fill();
  g.fillStyle = Cc.woodD; rr(g, B.x - 2, B.y - 2, B.w + 4, B.h + 4, 6); g.fill();
  g.fillStyle = '#f7f4ec'; rr(g, B.x + 4, B.y + 4, B.w - 8, B.h - 8, 5); g.fill();
  g.fillStyle = L.color; rr(g, B.x + 4, B.y + 70, B.w - 8, B.h - 74, 5); g.fill(); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(B.x + 4, B.y + 70, B.w - 8, 6);
  g.strokeStyle = Cc.brass; g.lineWidth = 1.5; g.beginPath(); g.moveTo(B.x + 8, B.y + 82); g.lineTo(B.x + B.w - 8, B.y + 82); g.stroke();
  g.fillStyle = '#fff'; rr(g, B.x + 16, B.y + 14, B.w - 32, 40, 10); g.fill(); g.strokeStyle = 'rgba(0,0,0,.08)'; g.stroke();
  if (L.kids){ g.fillStyle = '#fff'; rr(g, B.x + 16, B.y + 150, B.w - 32, 30, 10); g.fill();
    g.fillStyle = '#b07a4a'; circ(g, B.x + 40, B.y + 120, 10); g.fill(); circ(g, B.x + 33, B.y + 111, 4); g.fill(); circ(g, B.x + 47, B.y + 111, 4); g.fill(); g.fillStyle = '#2b1d14'; circ(g, B.x + 40, B.y + 123, 1.6); g.fill(); }
  g.fillStyle = Cc.brass; g.fillRect(B.x + B.w - 4, B.y + 20, 4, 60);       // the ladder's rail
  /* the seat, the little table under the window with a lamp and a bottle of water, the washbasin */
  const St = K.seat; g.fillStyle = 'rgba(0,0,0,.3)'; rr(g, St.x + 3, St.y + 4, St.w, St.h, 6); g.fill(); g.fillStyle = L.color; rr(g, St.x, St.y, St.w, St.h, 6); g.fill(); g.fillStyle = galShade(L.color, 0.15); rr(g, St.x + 6, St.y + 8, St.w - 18, St.h - 16, 5); g.fill(); g.fillStyle = galShade(L.color, -0.3); rr(g, St.x + St.w - 12, St.y, 12, St.h, 4); g.fill();
  const Tb = K.table; g.fillStyle = Cc.woodL; rr(g, Tb.x, Tb.y, Tb.w, Tb.h, 4); g.fill(); g.fillStyle = Cc.brass; g.fillRect(Tb.x, Tb.y + Tb.h - 3, Tb.w, 3);
  g.fillStyle = 'rgba(200,225,240,.8)'; rr(g, Tb.x + 12, Tb.y + 8, 8, 18, 3); g.fill(); g.fillStyle = '#f2c7a0'; circ(g, Tb.x + 60, Tb.y + 16, 9); g.fill(); g.fillStyle = '#ffe6b8'; circ(g, Tb.x + 60, Tb.y + 16, 4.5); g.fill();
  const Ba = K.basin; g.fillStyle = Cc.woodD; rr(g, Ba.x, Ba.y, Ba.w, Ba.h, 4); g.fill(); g.fillStyle = '#e8e6e0'; ell(g, Ba.x + Ba.w / 2, Ba.y + 30, 18, 14); g.fill(); g.fillStyle = '#c0bdb5'; ell(g, Ba.x + Ba.w / 2, Ba.y + 30, 10, 7); g.fill(); g.fillStyle = Cc.brass; g.fillRect(Ba.x + Ba.w / 2 - 2, Ba.y + 8, 4, 10);
  /* the window (cut out), its frame and curtains; the luggage on the rack above it */
  const wx = 390, ww = 180, wy0 = 62, wy1 = 168;
  g.save(); g.globalCompositeOperation = 'destination-out'; rr(g, wx, wy0, ww, wy1 - wy0, 12); g.fill(); g.restore();
  g.strokeStyle = Cc.brass; g.lineWidth = 4; rr(g, wx, wy0, ww, wy1 - wy0, 12); g.stroke(); g.fillStyle = Cc.brass; g.fillRect(wx + 4, (wy0 + wy1) / 2, ww - 8, 2);
  g.fillStyle = 'rgba(200,220,255,.07)'; g.beginPath(); g.moveTo(wx + 20, wy0); g.lineTo(wx + 50, wy0); g.lineTo(wx + 10, wy1); g.lineTo(wx - 10, wy1); g.closePath(); g.fill();
  [[wx - 6, 1], [wx + ww + 6, -1]].forEach(([cx, s]) => { g.fillStyle = '#8e2433'; g.beginPath(); g.moveTo(cx, wy0 - 8); g.quadraticCurveTo(cx + s * 22, wy0 + 30, cx + s * 8, wy0 + 56); g.quadraticCurveTo(cx + s * 16, wy0 + 84, cx + s * 2, wy1 + 8); g.lineTo(cx - s * 6, wy1 + 8); g.lineTo(cx - s * 6, wy0 - 8); g.closePath(); g.fill(); });
  /* the luggage, on the floor under the window */
  for (let i = 0; i < (L.bags || 0); i++){ const bx = 318 + i * 46, by = 472 - i * 4; g.fillStyle = 'rgba(0,0,0,.3)'; rr(g, bx + 3, by + 3, 40, 52, 4); g.fill(); g.fillStyle = ['#6b4226', '#2f4a6a', '#7a2a2a'][(i + n) % 3]; rr(g, bx, by, 40, 52, 4); g.fill(); g.fillStyle = Cc.brass; g.fillRect(bx, by + 8, 40, 3); g.fillRect(bx, by + 41, 40, 3); g.fillStyle = '#2b1d14'; g.fillRect(bx + 14, by - 4, 12, 5); }
  return BG_CABINA[n] = c;
}
TRENO.comps.forEach(cp => {
  SCENE_ART[trenoCabinScene(cp.n)] = {
    back(t){
      const bgc = BG_CABINA[cp.n] || buildBgCabina(cp.n);
      trDrawView(CABINA.x0, CABINA.x1, 30, t, trenoSky());
      ctx.drawImage(bgc, 0, 0, W, H);
    },
    sway:trSway,
    base(){ return BG_CABINA[cp.n] || buildBgCabina(cp.n); },
  };
});

