/* The park's drawing (scene 'parco', world/parco.js): the background (built lazily: lawns with mowing stripes, gravel
   paths, the plaza, hedges, flowerbeds, the pond with its lilies and reeds, benches, the big tree's shadow), and in the
   depth-sorted pass the big tree (trunk and canopy, the kite caught in it), the shed, the ladder, the lamp posts, the small
   trees; the children's ball, the ducks; Pietro's kite flying once he has it back. Night: the generic lighting pass
   (NIGHT_LIGHTS.parco, render/night.js). */
let bgParco = null;
function buildBgParco(){
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const r = rng(616), P = PARCO;
  /* the lawn, with mowing stripes and speckles */
  g.fillStyle = '#7fae5a'; g.fillRect(0, 0, W, H);
  for (let x = -60, k = 0; x < W + 60; x += 46, k++){ g.fillStyle = k % 2 ? 'rgba(255,255,220,.06)' : 'rgba(30,60,10,.05)'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 46, 0); g.lineTo(x + 46 - 60, H); g.lineTo(x - 60, H); g.closePath(); g.fill(); }
  for (let i = 0; i < 2600; i++){ g.fillStyle = r() < 0.5 ? 'rgba(60,110,40,.35)' : 'rgba(170,210,120,.3)'; g.fillRect(r() * W, r() * H, 1.5, 2.5); }
  /* the gravel paths: the gate up to the plaza, across the park, to the shed, round the pond */
  const path = (pts, w) => { g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = '#b9a984'; g.lineWidth = w + 6; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    g.strokeStyle = '#e1d4b2'; g.lineWidth = w; g.stroke(); };
  path([[480, 640], [480, 330]], 62);
  path([[-20, 334], [300, 330], [480, 330], [700, 322], [980, 330]], 46);
  path([[540, 300], [660, 236], [760, 178], [850, 168]], 40);
  path([[560, 380], [640, 410], [650, 470], [700, 540], [800, 552], [910, 520]], 34);
  path([[230, 330], [240, 380], [200, 460], [130, 520]], 30);
  g.fillStyle = '#e1d4b2'; circ(g, P.plaza.x, P.plaza.y, P.plaza.r); g.fill(); g.strokeStyle = '#b9a984'; g.lineWidth = 3; g.stroke();
  /* gravel speckle, only on the paths (drawn through a mask of the path colour) */
  {
    const m = document.createElement('canvas'); m.width = W; m.height = H; const mg = m.getContext('2d');
    mg.drawImage(c, 0, 0, W, H);
    const d = mg.getImageData(0, 0, W, H).data;
    for (let i = 0; i < 9000; i++){ const x = Math.floor(r() * W), y = Math.floor(r() * H), k = (y * W + x) * 4;
      if (d[k] > 200 && d[k + 1] > 190 && d[k + 2] > 150){ g.fillStyle = r() < 0.5 ? 'rgba(140,120,90,.45)' : 'rgba(255,250,235,.6)'; g.fillRect(x, y, 1.6, 1.6); } }
  }
  /* the central flowerbed in the plaza: a ring of flowers round a little urn */
  const flowers = (x, y, n, rad, cols) => { for (let i = 0; i < n; i++){ const a = r() * 6.28, d = Math.sqrt(r()) * rad; g.fillStyle = '#3f6e2e'; circ(g, x + Math.cos(a) * d + 1, y + Math.sin(a) * d + 1, 2.6); g.fill(); g.fillStyle = cols[i % cols.length]; circ(g, x + Math.cos(a) * d, y + Math.sin(a) * d, 2.1); g.fill(); } };
  g.fillStyle = '#6b4a30'; circ(g, P.bed.x, P.bed.y, P.bed.r); g.fill(); g.strokeStyle = '#c9c2b0'; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#4f7d36'; circ(g, P.bed.x, P.bed.y, P.bed.r - 4); g.fill();
  flowers(P.bed.x, P.bed.y, 130, P.bed.r - 6, ['#e0405a', '#f4b928', '#f7f3ea', '#c46ad0', '#ff8a3c']);
  g.fillStyle = '#d8d0bc'; circ(g, P.bed.x, P.bed.y, 9); g.fill(); g.fillStyle = '#b5ab92'; circ(g, P.bed.x, P.bed.y, 5); g.fill(); g.fillStyle = '#5d8f44'; circ(g, P.bed.x, P.bed.y, 4); g.fill();
  /* the long beds by the main path, the bed by the shed */
  P.beds.forEach((b, i) => {
    g.fillStyle = 'rgba(30,20,10,.2)'; rr(g, b.x + 2, b.y + 3, b.w, b.h, 8); g.fill();
    g.fillStyle = '#6b4a30'; rr(g, b.x, b.y, b.w, b.h, 8); g.fill(); g.strokeStyle = '#c9c2b0'; g.lineWidth = 3; g.stroke();
    const cols = [['#e0405a', '#f7c6d0', '#f7f3ea'], ['#f4b928', '#ff8a3c', '#f7f3ea'], ['#7a5ad0', '#c46ad0', '#f7f3ea']][i % 3];
    for (let k = 0; k < b.w * b.h / 18; k++){ const x = b.x + 5 + r() * (b.w - 10), y = b.y + 5 + r() * (b.h - 10); g.fillStyle = '#3f6e2e'; circ(g, x + 1, y + 1, 2.8); g.fill(); g.fillStyle = cols[k % 3]; circ(g, x, y, 2.2); g.fill(); }
  });
  /* the pond: a stone rim, the water, lily pads, reeds */
  const Pd = P.pond;
  g.fillStyle = 'rgba(30,20,10,.22)'; ell(g, Pd.x + 3, Pd.y + 5, Pd.rx + 8, Pd.ry + 8); g.fill();
  g.fillStyle = '#cfc6b0'; ell(g, Pd.x, Pd.y, Pd.rx + 8, Pd.ry + 8); g.fill();
  const wg = g.createRadialGradient(Pd.x - 30, Pd.y - 20, 10, Pd.x, Pd.y, Pd.rx); wg.addColorStop(0, '#7fbbd2'); wg.addColorStop(1, '#3d7896');
  g.fillStyle = wg; ell(g, Pd.x, Pd.y, Pd.rx, Pd.ry); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1.5; ell(g, Pd.x - 10, Pd.y - 6, Pd.rx - 24, Pd.ry - 18); g.stroke();
  [[Pd.x - 70, Pd.y + 20], [Pd.x - 52, Pd.y + 34], [Pd.x + 64, Pd.y - 30], [Pd.x + 80, Pd.y - 14], [Pd.x + 20, Pd.y + 46]].forEach(([x, y], i) => {
    g.fillStyle = '#4f8a3a'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, 9 + (i % 2) * 2, 0.4, Math.PI * 2 - 0.2); g.closePath(); g.fill();
    if (i % 2 === 0){ g.fillStyle = '#f7c6d0'; circ(g, x + 3, y - 2, 3); g.fill(); g.fillStyle = '#fff3a0'; circ(g, x + 3, y - 2, 1.2); g.fill(); }
  });
  for (let k = 0; k < 26; k++){ const a = 2.4 + r() * 1.1, x = Pd.x + Math.cos(a) * (Pd.rx + 2), y = Pd.y + Math.sin(a) * (Pd.ry + 2); g.strokeStyle = '#5a7a32'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y - 10 - r() * 8); g.stroke(); g.fillStyle = '#7a5a30'; ell(g, x + (r() - 0.5) * 4, y - 14, 1.6, 3.5); g.fill(); }
  /* the hedges round the park, the gate */
  const hedge = (x0, y0, x1, y1) => { for (let x = x0; x <= x1; x += 13) for (let y = y0; y <= y1; y += 13){ g.fillStyle = '#2f5a2a'; circ(g, x + (r() - 0.5) * 4, y + (r() - 0.5) * 4, 11); g.fill(); g.fillStyle = 'rgba(120,170,80,.35)'; circ(g, x - 3, y - 3, 5); g.fill(); } };
  hedge(0, 0, W, 20); hedge(0, 0, 14, H); hedge(W - 14, 0, W, H); hedge(0, H - 10, 424, H); hedge(536, H - 10, W, H);
  g.fillStyle = '#2b2b2b'; [[426, 584], [530, 584]].forEach(([x, y]) => { rr(g, x - 6, y - 8, 12, 24, 2); g.fill(); g.fillStyle = '#c9a54a'; circ(g, x, y - 8, 4); g.fill(); g.fillStyle = '#2b2b2b'; });
  /* the benches: wooden slats on iron feet */
  P.benches.forEach(b => {
    g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, b.x + 3, b.y + 5, b.w, b.h, 3); g.fill();
    g.fillStyle = '#2f2f2f'; [b.x + 6, b.x + b.w - 10].forEach(x => g.fillRect(x, b.y - 1, 4, b.h + 2));
    for (let k = 0; k < 4; k++){ g.fillStyle = k % 2 ? '#8a5a32' : '#9a6a3c'; rr(g, b.x, b.y + 1 + k * 4.2, b.w, 3.4, 1.5); g.fill(); }
  });
  /* the shadows of the trees and the shed on the grass */
  g.fillStyle = 'rgba(20,50,10,.15)'; ell(g, P.tree.x + 26, P.tree.y + 8, 112, 40); g.fill();
  P.trees.forEach(([x, y, rad]) => { g.fillStyle = 'rgba(20,50,10,.2)'; ell(g, x + 10, y + 10, rad, rad * 0.7); g.fill(); });
  g.fillStyle = 'rgba(20,50,10,.22)'; g.fillRect(P.shed.x + 8, P.shed.y + P.shed.h, P.shed.w, 12);
  /* a little sign at the gate */
  g.fillStyle = '#2f5a2a'; rr(g, 448, 566, 64, 18, 3); g.fill(); g.fillStyle = '#f5f1e8'; g.font = '700 7.5px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('GIARDINI', 480, 572); g.fillText("DELL'ARENA", 480, 579.5);
  bgParco = c;
  return c;
}
/* ---------- sprites ---------- */
function parcoSmallTree(x, y, rad){
  ctx.fillStyle = '#5a3d26'; rr(ctx, x - 4, y - 10, 8, 14, 3); ctx.fill();
  ctx.fillStyle = '#3f6e2e'; circ(ctx, x, y - 26, rad); ctx.fill();
  [[-0.4, -0.5, 0.55], [0.45, -0.2, 0.5], [0, 0.35, 0.5], [-0.1, -0.1, 0.45]].forEach(([dx, dy, k], i) => { ctx.fillStyle = i % 2 ? '#5b8f45' : '#4f8a3a'; circ(ctx, x + dx * rad, y - 26 + dy * rad, rad * k); ctx.fill(); });
  ctx.fillStyle = 'rgba(200,240,140,.25)'; circ(ctx, x - rad * 0.3, y - 26 - rad * 0.35, rad * 0.35); ctx.fill();
}
/* the big tree: a thick trunk with roots, a wide layered canopy; the kite caught in it (until it is fetched) */
function parcoBigTree(t){
  const T = PARCO.tree, Cn = T.canopy, sw = RM ? 0 : Math.sin(t * 0.8) * 1.5;
  ctx.fillStyle = '#5a3d26';
  ctx.beginPath(); ctx.moveTo(T.x - 26, T.y + 4); ctx.quadraticCurveTo(T.x - 14, T.y - 8, T.x - 13, T.y - 40); ctx.lineTo(T.x - 10, Cn.y + 40); ctx.lineTo(T.x + 12, Cn.y + 40); ctx.lineTo(T.x + 14, T.y - 40); ctx.quadraticCurveTo(T.x + 16, T.y - 8, T.x + 30, T.y + 4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(30,18,10,.35)'; ctx.lineWidth = 1.4; for (let k = -2; k <= 2; k++){ ctx.beginPath(); ctx.moveTo(T.x + k * 4, T.y - 6); ctx.quadraticCurveTo(T.x + k * 5 + 2, T.y - 50, T.x + k * 3, Cn.y + 44); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,240,200,.12)'; ctx.fillRect(T.x - 9, Cn.y + 44, 6, T.y - Cn.y - 80);
  /* branches into the canopy */
  ctx.strokeStyle = '#5a3d26'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(T.x, Cn.y + 50); ctx.quadraticCurveTo(T.x - 40, Cn.y + 10, T.x - 64, Cn.y - 40); ctx.moveTo(T.x + 2, Cn.y + 46); ctx.quadraticCurveTo(T.x + 40, Cn.y + 14, T.x + 60, Cn.y - 30); ctx.stroke();
  /* the canopy: shadowed blobs, then lit ones */
  const r = rng(51);
  for (let i = 0; i < 26; i++){ const a = r() * 6.28, d = Math.sqrt(r()) * Cn.r * 0.82, rad = 26 + r() * 22; ctx.fillStyle = '#365f28'; circ(ctx, Cn.x + Math.cos(a) * d + sw * 0.5, Cn.y + Math.sin(a) * d * 0.9 + 6, rad); ctx.fill(); }
  for (let i = 0; i < 30; i++){ const a = r() * 6.28, d = Math.sqrt(r()) * Cn.r * 0.78, rad = 18 + r() * 18; ctx.fillStyle = i % 3 ? '#4f8a3a' : '#5d9a44'; circ(ctx, Cn.x + Math.cos(a) * d + sw, Cn.y + Math.sin(a) * d * 0.9 - 4, rad); ctx.fill(); }
  for (let i = 0; i < 10; i++){ const a = 3.6 + r() * 1.6, d = r() * Cn.r * 0.7, rad = 6 + r() * 7; ctx.fillStyle = 'rgba(170,215,110,.3)'; circ(ctx, Cn.x + Math.cos(a) * d + sw, Cn.y + Math.sin(a) * d * 0.9 - 10, rad); ctx.fill(); }
  if (PARCO.kite === 'tree') parcoKite(PARCO.kiteAt.x + sw, PARCO.kiteAt.y, -0.5, t, true);
}
/* a diamond kite (red and yellow) with its tail of bows; caught: the tail hangs down through the leaves */
function parcoKite(x, y, rot, t, caught){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.moveTo(2, -20); ctx.lineTo(16, 2); ctx.lineTo(2, 28); ctx.lineTo(-12, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d8342a'; ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(14, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-14, 0); ctx.lineTo(0, 26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f4b928'; ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(-14, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, 0); ctx.lineTo(0, 26); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(0, 26); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke();
  ctx.restore();
  /* the tail: a curve with bows */
  const tx = x + Math.sin(rot) * -26, ty = y + Math.cos(rot) * 26;
  ctx.strokeStyle = '#3a3a3a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx, ty);
  const pts = [];
  for (let k = 1; k <= 6; k++){ const px = caught ? tx + Math.sin(k * 0.9 + t * 1.5) * 3 : tx - k * 7 + Math.sin(k + t * 4) * 4, py = caught ? ty + k * 9 : ty + k * 6 + Math.cos(k + t * 4) * 3; ctx.lineTo(px, py); pts.push([px, py]); }
  ctx.stroke();
  pts.forEach(([px, py], i) => { if (i % 2) return; ctx.fillStyle = i % 4 ? '#2f7fd0' : '#d8342a'; ctx.beginPath(); ctx.moveTo(px - 4, py - 2); ctx.lineTo(px + 4, py + 2); ctx.lineTo(px + 4, py - 2); ctx.lineTo(px - 4, py + 2); ctx.closePath(); ctx.fill(); });
}
/* the shed: plank walls, a door and a window in front, a tiled roof; a watering can, a wheelbarrow, pots */
function parcoShed(){
  const s = PARCO.shed, fy = s.y + 58;                                                   // the roof down to fy, the front wall below
  ctx.fillStyle = '#7a5434'; ctx.fillRect(s.x, fy, s.w, s.h - 58 + 4);
  ctx.strokeStyle = 'rgba(40,24,12,.35)'; ctx.lineWidth = 1; for (let x = s.x + 10; x < s.x + s.w; x += 10){ ctx.beginPath(); ctx.moveTo(x, fy); ctx.lineTo(x, s.y + s.h + 4); ctx.stroke(); }
  ctx.fillStyle = '#4a3220'; rr(ctx, s.x + 54, fy + 4, 30, s.h - 58, 2); ctx.fill(); ctx.fillStyle = '#c9a54a'; circ(ctx, s.x + 79, fy + 22, 1.8); ctx.fill();
  ctx.fillStyle = '#cfe2ea'; ctx.fillRect(s.x + 100, fy + 8, 22, 14); ctx.strokeStyle = '#4a3220'; ctx.lineWidth = 2; ctx.strokeRect(s.x + 100, fy + 8, 22, 14); ctx.beginPath(); ctx.moveTo(s.x + 111, fy + 8); ctx.lineTo(s.x + 111, fy + 22); ctx.stroke();
  ctx.fillStyle = '#5a6a4a'; ctx.beginPath(); ctx.moveTo(s.x - 8, fy + 2); ctx.lineTo(s.x + s.w + 8, fy + 2); ctx.lineTo(s.x + s.w - 6, s.y - 2); ctx.lineTo(s.x + 6, s.y - 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(20,30,15,.35)'; ctx.lineWidth = 1.2; for (let y = s.y + 6; y < fy; y += 8){ ctx.beginPath(); ctx.moveTo(s.x + 2, y); ctx.lineTo(s.x + s.w - 2, y); ctx.stroke(); }
  ctx.fillStyle = '#6f805a'; ctx.fillRect(s.x - 8, fy - 1, s.w + 16, 4);
  ctx.fillStyle = '#f5f1e8'; rr(ctx, s.x + 36, s.y + 18, 68, 16, 3); ctx.fill(); ctx.fillStyle = '#2f5a2a'; ctx.font = '700 8px "Titillium Web", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('GIARDINIERE', s.x + 70, s.y + 26.5);
  /* the watering can, flower pots, the wheelbarrow */
  ctx.fillStyle = '#2e7a5a'; rr(ctx, s.x + 128, s.y + s.h - 6, 12, 10, 2); ctx.fill(); ctx.strokeStyle = '#2e7a5a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x + 140, s.y + s.h - 2); ctx.lineTo(s.x + 148, s.y + s.h - 8); ctx.stroke();
  [[s.x + 6, '#e0405a'], [s.x + 22, '#f4b928'], [s.x + 38, '#c46ad0']].forEach(([x, col]) => { ctx.fillStyle = '#b5532f'; rr(ctx, x - 5, s.y + s.h - 2, 10, 9, 2); ctx.fill(); ctx.fillStyle = '#4f8a3a'; circ(ctx, x, s.y + s.h - 4, 5); ctx.fill(); ctx.fillStyle = col; circ(ctx, x, s.y + s.h - 5, 2.4); ctx.fill(); });
}
function parcoBarrow(){ const x = 764, y = 200;
  ctx.fillStyle = 'rgba(20,40,10,.2)'; ell(ctx, x + 3, y + 4, 18, 9); ctx.fill();
  ctx.fillStyle = '#3a6a8a'; ctx.beginPath(); ctx.moveTo(x - 16, y - 8); ctx.lineTo(x + 14, y - 8); ctx.lineTo(x + 10, y + 6); ctx.lineTo(x - 12, y + 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6b4a30'; ctx.fillRect(x - 13, y - 6, 24, 6); ctx.fillStyle = '#4f8a3a'; circ(ctx, x - 4, y - 7, 4); ctx.fill(); circ(ctx, x + 4, y - 6, 3); ctx.fill();
  ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 12, y - 4); ctx.lineTo(x + 26, y + 4); ctx.moveTo(x + 10, y + 4); ctx.lineTo(x + 24, y + 12); ctx.stroke();
  ctx.fillStyle = '#2b2b2b'; circ(ctx, x - 18, y + 1, 4); ctx.fill(); }
/* the ladder: its foot at (x, y), leaning up (length len, a slight lean), or carried flat over someone's shoulder */
function parcoLadder(x, y, len, lean, flat){
  ctx.save(); ctx.translate(x, y);
  if (flat){ ctx.rotate(lean); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(-len / 2 + 3, -5, len, 12); }
  const L = flat ? len : len, w = 13;
  ctx.strokeStyle = '#a0703c'; ctx.lineWidth = 3;
  if (flat){ ctx.beginPath(); ctx.moveTo(-L / 2, -w / 2); ctx.lineTo(L / 2, -w / 2); ctx.moveTo(-L / 2, w / 2); ctx.lineTo(L / 2, w / 2); ctx.stroke(); ctx.lineWidth = 2; for (let k = -L / 2 + 6; k < L / 2; k += 10){ ctx.beginPath(); ctx.moveTo(k, -w / 2); ctx.lineTo(k, w / 2); ctx.stroke(); } }
  else { const dx = Math.sin(lean) * L; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2 + dx, -L); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2 + dx, -L); ctx.stroke(); ctx.lineWidth = 2; for (let k = 8; k < L; k += 11){ const kx = dx * k / L; ctx.beginPath(); ctx.moveTo(-w / 2 + kx, -k); ctx.lineTo(w / 2 + kx, -k); ctx.stroke(); }
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ell(ctx, 2, 2, 10, 4); ctx.fill(); }
  ctx.restore();
}
function parcoLampPost(x, y){
  ctx.fillStyle = 'rgba(20,40,10,.25)'; ell(ctx, x + 3, y + 2, 7, 3.5); ctx.fill();
  ctx.fillStyle = '#23302a'; ctx.fillRect(x - 1.6, y - 54, 3.2, 54); rr(ctx, x - 4, y - 6, 8, 7, 2); ctx.fill();
  ctx.fillStyle = daytime() === 'night' ? '#fff2c0' : '#e8efe6'; circ(ctx, x, y - 60, 6.5); ctx.fill(); ctx.strokeStyle = '#23302a'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = '#23302a'; rr(ctx, x - 5, y - 68, 10, 3, 1); ctx.fill();
}
/* the children's ball (it hops from one to the other), the ducks */
function parcoBall(t){
  const a = NPC.bimbo, b = NPC.bimba; if (!a || !b || !activeNpcs().includes(a) || !activeNpcs().includes(b)) return null;
  const ph = RM ? 0.25 : (t * 0.45) % 2, k = ph < 1 ? ph : 2 - ph, x = a.x + (b.x - a.x) * k, y0 = a.y + (b.y - a.y) * k, hop = Math.abs(Math.sin(k * Math.PI * 2)) * 16;
  return { y:y0 + 12, draw:() => { ctx.fillStyle = 'rgba(20,40,10,.25)'; ell(ctx, x + 2, y0 + 12, 6, 3); ctx.fill();
    ctx.fillStyle = '#f5f1e8'; circ(ctx, x, y0 + 4 - hop, 6); ctx.fill(); ctx.fillStyle = '#d8342a'; ctx.beginPath(); ctx.arc(x, y0 + 4 - hop, 6, 0.3, 1.6); ctx.lineTo(x, y0 + 4 - hop); ctx.fill(); ctx.beginPath(); ctx.arc(x, y0 + 4 - hop, 6, 3.4, 4.7); ctx.lineTo(x, y0 + 4 - hop); ctx.fill(); } };
}
function parcoDucks(t){
  const Pd = PARCO.pond, out = [];
  [[0, 0.62, '#6b5a3a'], [2.2, 0.5, '#3f7a4a'], [4, 0.7, '#6b5a3a']].forEach(([a0, k, head], i) => {
    const a = a0 + (RM ? 0 : t * 0.12 * (i % 2 ? -1 : 1)), x = Pd.x + Math.cos(a) * Pd.rx * k, y = Pd.y + Math.sin(a) * Pd.ry * k, dir = a + (i % 2 ? -Math.PI / 2 : Math.PI / 2);
    out.push({ y, draw:() => {
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - Math.cos(dir) * 16 - Math.sin(dir) * 6, y - Math.sin(dir) * 16 + Math.cos(dir) * 6); ctx.lineTo(x, y); ctx.lineTo(x - Math.cos(dir) * 16 + Math.sin(dir) * 6, y - Math.sin(dir) * 16 - Math.cos(dir) * 6); ctx.stroke();
      ctx.save(); ctx.translate(x, y); ctx.rotate(dir);
      ctx.fillStyle = '#e8dcc0'; ell(ctx, 0, 0, 8, 5); ctx.fill(); ctx.fillStyle = '#a89878'; ell(ctx, -2, 0, 5, 3.5); ctx.fill();
      ctx.fillStyle = head; circ(ctx, 6, 0, 3.4); ctx.fill(); ctx.fillStyle = '#f4b928'; ell(ctx, 9.5, 0, 2.2, 1.2); ctx.fill();
      ctx.restore(); } });
  });
  return out;
}
SCENE_ART.parco = {
  back(){ if (!bgParco) buildBgParco(); ctx.drawImage(bgParco, 0, 0, W, H); },
  base(){ return bgParco || buildBgParco(); },
  ents(t){
    const P = PARCO, out = [];
    out.push({ y:P.tree.y, draw:() => parcoBigTree(t) });
    out.push({ y:P.shed.y + P.shed.h, draw:parcoShed });
    out.push({ y:200, draw:parcoBarrow });
    P.trees.forEach(([x, y, rad]) => out.push({ y, draw:() => parcoSmallTree(x, y, rad) }));
    P.lamps.forEach(([x, y]) => out.push({ y, draw:() => parcoLampPost(x, y) }));
    if (P.ladder === 'shed') out.push({ y:P.ladderShed.y, draw:() => parcoLadder(P.ladderShed.x, P.ladderShed.y, 78, 0.02) });
    if (P.ladder === 'tree') out.push({ y:P.ladderTree.y + 2, draw:() => parcoLadder(P.ladderTree.x, P.ladderTree.y, 170, -0.14) });
    const ball = parcoBall(t); if (ball) out.push(ball);
    parcoDucks(t).forEach(d => out.push(d));
    return out;
  },
};
