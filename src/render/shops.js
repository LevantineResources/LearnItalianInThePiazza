/* The shop interiors' drawing (the template: world/shops.js). One background per shop, built lazily from its cfg (the floor,
   the back wall and its sign, the fixtures from above with what stands on top of them, the counter, the props, the front
   wall with the door), and per frame: the glass case in the depth-sorted pass (the keeper stands behind it) and the shop
   windows, which show the street: daylight, or at night the dark with a street lamp's glow. */
const SHOP_BG = {};
function shopBg(id){ return SHOP_BG[id] || buildShopBg(SHOPS[id]); }
function buildShopBg(c){
  const cv = document.createElement('canvas'); cv.width = W * DPR; cv.height = H * DPR;
  const g = cv.getContext('2d'); g.scale(DPR, DPR);
  const K = c.colors || {}, r = rng(c.seed || 77);
  /* the floor: two-tone tiles */
  const F = K.floor || ['#efe7d6', '#e2d6bd'], T = c.tile || 32;
  for (let y = SHOP_WALL, row = 0; y < H; y += T, row++) for (let x = 0, col = 0; x < W; x += T, col++){
    g.fillStyle = (row + col) % 2 ? F[1] : F[0]; g.fillRect(x, y, T, T);
    const l = r(); g.fillStyle = `rgba(255,255,255,${0.04 + l * 0.06})`; g.fillRect(x + 2, y + 2, T - 4, 3);
  }
  g.strokeStyle = 'rgba(90,70,50,.10)'; g.lineWidth = 1;
  for (let x = 0; x <= W; x += T){ g.beginPath(); g.moveTo(x + 0.5, SHOP_WALL); g.lineTo(x + 0.5, H); g.stroke(); }
  for (let y = SHOP_WALL; y <= H; y += T){ g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
  /* the back wall: its face, a skirting board, the sign in the middle */
  g.fillStyle = K.wall || '#f3ead8'; g.fillRect(0, 0, W, SHOP_WALL);
  g.fillStyle = 'rgba(0,0,0,.05)'; for (let x = 0; x < W; x += 24) g.fillRect(x, 0, 12, SHOP_WALL - 10);
  g.fillStyle = K.trim || '#7a4b2a'; g.fillRect(0, SHOP_WALL - 10, W, 10);
  g.fillStyle = 'rgba(30,20,10,.18)'; g.fillRect(0, SHOP_WALL, W, 8);
  const sw = Math.max(150, c.sign.length * 15 + 60), sx = 480 - sw / 2;
  g.fillStyle = 'rgba(0,0,0,.2)'; rr(g, sx + 3, 13, sw, 34, 5); g.fill();
  g.fillStyle = K.sign || '#2e8b57'; rr(g, sx, 10, sw, 34, 5); g.fill();
  g.fillStyle = K.signInk || '#fff'; g.font = '800 17px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(c.sign.split('').join(' '), 480 + (c.icon ? 14 : 0), 28);
  if (c.icon === 'cross'){ const x = sx + 22, y = 27; g.fillStyle = '#7fe0a0'; g.fillRect(x - 9, y - 3.5, 18, 7); g.fillRect(x - 3.5, y - 9, 7, 18); g.fillStyle = '#fff'; g.fillRect(x - 7, y - 2, 14, 4); g.fillRect(x - 2, y - 7, 4, 14); }
  if (c.icon === 'cone'){ const x = sx + 22, y = 27; g.fillStyle = '#e3b25a'; g.beginPath(); g.moveTo(x - 7, y - 2); g.lineTo(x + 7, y - 2); g.lineTo(x, y + 13); g.closePath(); g.fill(); g.fillStyle = '#f7c6d0'; circ(g, x - 3, y - 5, 5); g.fill(); g.fillStyle = '#b8e0a0'; circ(g, x + 3, y - 6, 5); g.fill(); }
  /* the props */
  (c.props || []).forEach(p => shopProp(g, c, p, r));
  /* the area behind the counter: a darker floor, a wall shelf full of boxes */
  if (c.behind){ const b = c.behind; g.fillStyle = 'rgba(60,40,20,.08)'; g.fillRect(b.x, b.y, b.w, b.h); }
  /* the fixtures from above */
  (c.fixtures || []).forEach(f => { if (f.kind !== 'case') shopShelfTop(g, c, f, r); });
  /* the counter (a banco; a glass case is drawn per frame, in front of the keeper) */
  if (c.counter && c.counter.kind !== 'vetrina') shopBanco(g, c, c.counter);
  /* a narrower room (room:{ x0, x1 }): the neighbours' roofs either side, a wall edge */
  if (c.room){ const { x0, x1 } = c.room;
    if (x0 > 0){ roofs(g, 0, 0, x0, H, K.roof || '#a5462b', r); g.fillStyle = K.trim || '#7a4b2a'; g.fillRect(x0 - 8, 0, 8, H); g.fillStyle = 'rgba(30,20,10,.18)'; g.fillRect(x0, SHOP_WALL, 8, H - SHOP_WALL); }
    if (x1 < W){ roofs(g, x1, 0, W - x1, H, K.roof || '#9f4a2c', r); g.fillStyle = K.trim || '#7a4b2a'; g.fillRect(x1, 0, 8, H); } }
  /* the front wall, the door mat */
  g.fillStyle = K.trim || '#7a4b2a'; g.fillRect(0, 572, 440, 28); g.fillRect(520, 572, 440, 28);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 566, 440, 6); g.fillRect(520, 566, 440, 6);
  g.fillStyle = '#b08a5a'; rr(g, 446, 556, 68, 16, 3); g.fill();
  g.fillStyle = '#5a3a22'; g.font = '700 9px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('USCITA', 480, 564.5);
  return SHOP_BG[c.id] = cv;
}
/* a shelf unit from above: its top board, and what stands on top of it (sopra) as little packets seen from above */
function shopShelfTop(g, c, f, r){
  const K = c.colors || {};
  g.fillStyle = 'rgba(30,20,10,.22)'; rr(g, f.x + 4, f.y + 5, f.w, f.h, 3); g.fill();
  g.fillStyle = K.shelfDark || '#8a6a4a'; rr(g, f.x, f.y, f.w, f.h, 3); g.fill();
  g.fillStyle = K.shelf || '#b08a5a'; rr(g, f.x + 3, f.y + 3, f.w - 6, f.h - 6, 2); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 1; rr(g, f.x + 3, f.y + 3, f.w - 6, f.h - 6, 2); g.stroke();
  /* the front (where the shelves face): a darker strip with the packets' fronts in two rows, the baskets under it */
  const front = f.face || 'S', R = f.rows || {}, rowsOf = [R.mezzo || [], R.mezzo2 || [], R.sotto || []];
  if (front === 'S'){
    const fy = f.y + f.h - 16; g.fillStyle = K.shelfDark || '#8a6a4a'; g.fillRect(f.x + 2, fy, f.w - 4, 14);
    rowsOf.forEach((L, k) => L.forEach((it, i) => { const w = (f.w - 16) / Math.max(1, L.length); g.fillStyle = it.color || '#c23b2a'; g.fillRect(f.x + 8 + i * w + 2, fy + 1 + k * 4.5, w - 6, 3.5); }));
  } else {
    const fx = front === 'E' ? f.x + f.w - 16 : f.x + 2; g.fillStyle = K.shelfDark || '#8a6a4a'; g.fillRect(fx, f.y + 2, 14, f.h - 4);
    rowsOf.forEach((L, k) => L.forEach((it, i) => { const h = (f.h - 16) / Math.max(1, L.length); g.fillStyle = it.color || '#c23b2a'; g.fillRect(fx + (front === 'E' ? 1 + k * 4.5 : 9.5 - k * 4.5), f.y + 8 + i * h + 2, 3.5, h - 6); }));
  }
}
/* what stands on top of a shelf, drawn per frame (it can be taken: then it is gone from the top too) */
function shopShelfTopItems(c, f){
  const top = fxItems((f.rows || {}).sopra), n = Math.max(1, top.length);
  top.forEach((it, i) => {
    const vertical = f.face === 'E' || f.face === 'W';
    const cx = vertical ? f.x + f.w / 2 : f.x + 14 + (i + 0.5) * ((f.w - 28) / n), cy = vertical ? f.y + 16 + (i + 0.5) * ((f.h - 32) / n) : f.y + f.h / 2;
    const w = vertical ? 22 : Math.min(30, (f.w - 28) / n - 6), h = vertical ? Math.min(30, (f.h - 32) / n - 6) : 22;
    ctx.fillStyle = 'rgba(0,0,0,.18)'; rr(ctx, cx - w / 2 + 2, cy - h / 2 + 2, w, h, 3); ctx.fill();
    ctx.fillStyle = it.color || '#c23b2a'; rr(ctx, cx - w / 2, cy - h / 2, w, h, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,253,248,.85)'; rr(ctx, cx - w / 2 + 4, cy - h / 2 + 4, w - 8, h - 8, 2); ctx.fill();
  });
}
function shopBanco(g, c, b){
  const K = c.colors || {};
  g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, b.x + 4, b.y + 5, b.w, b.h, 4); g.fill();
  g.fillStyle = K.counter || '#2e6a4e'; rr(g, b.x, b.y, b.w, b.h, 4); g.fill();
  g.fillStyle = K.counterTop || '#f3f1ec'; rr(g, b.x + 3, b.y + 3, b.w - 6, b.h - 6, 3); g.fill();
  if (b.till){                                                          // the till (la cassa), a card reader, a little stand of lip balms
    const vx = b.w < b.h, tx = vx ? b.x + b.w / 2 : b.x + b.w - 40, ty = vx ? b.y + b.h - 50 : b.y + b.h / 2;
    g.fillStyle = '#2b2b2b'; rr(g, tx - 10, ty - 13, 20, 26, 3); g.fill(); g.fillStyle = '#7fd18b'; g.fillRect(tx - 6, ty - 9, 12, 5);
    g.fillStyle = '#c9ccd2'; rr(g, tx - 7, ty + 16, 14, 10, 2); g.fill();
    ['#e58fa0', '#f4b928', '#7fb3e0'].forEach((col, i) => { g.fillStyle = col; circ(g, vx ? tx - 6 + i * 6 : tx - 50 + i * 7, vx ? ty - 50 : ty, 3); g.fill(); });
  }
}
function shopProp(g, c, p, r){
  const K = c.colors || {};
  if (p.kind === 'plant'){ g.fillStyle = 'rgba(30,20,10,.2)'; circ(g, p.x + 4, p.y + 5, 17); g.fill(); g.fillStyle = '#b4512e'; circ(g, p.x, p.y, 13); g.fill();
    for (let k = 0; k < 8; k++){ const a = k / 8 * 6.28; g.fillStyle = k % 2 ? '#466f33' : '#5d8f44'; ell(g, p.x + Math.cos(a) * 10, p.y + Math.sin(a) * 10, 9, 5, a); g.fill(); } g.fillStyle = '#74a855'; circ(g, p.x, p.y, 7); g.fill(); }
  else if (p.kind === 'table'){
    g.fillStyle = K.chair || '#7a4b2a'; [[-26, 0], [26, 0]].forEach(([dx, dy]) => { rr(g, p.x + dx - 7, p.y + dy - 8, 14, 16, 4); g.fill(); });
    g.fillStyle = 'rgba(30,20,10,.22)'; circ(g, p.x + 3, p.y + 5, 18); g.fill();
    g.fillStyle = K.table || '#fffdf8'; circ(g, p.x, p.y, 17); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.5; g.stroke();
    if (p.cup){ g.fillStyle = '#f7c6d0'; circ(g, p.x - 5, p.y - 3, 4); g.fill(); g.fillStyle = '#e3b25a'; circ(g, p.x + 6, p.y + 2, 3); g.fill(); }
  }
  else if (p.kind === 'poster'){ g.fillStyle = 'rgba(0,0,0,.15)'; rr(g, p.x + 2, p.y + 2, p.w, p.h, 2); g.fill(); g.fillStyle = p.color || '#fffdf8'; rr(g, p.x, p.y, p.w, p.h, 2); g.fill();
    g.fillStyle = p.ink || '#2e8b57'; g.font = `700 ${p.size || 9}px "Titillium Web", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; (p.lines || []).forEach((l, i) => g.fillText(l, p.x + p.w / 2, p.y + 10 + i * ((p.size || 9) + 3))); }
  else if (p.kind === 'board'){                                            // a menu board on the wall (the gelateria's listino)
    g.fillStyle = '#5a3a22'; rr(g, p.x - 3, p.y - 3, p.w + 6, p.h + 6, 3); g.fill(); g.fillStyle = '#263028'; rr(g, p.x, p.y, p.w, p.h, 2); g.fill();
    g.fillStyle = '#f3efe6'; g.textAlign = 'left'; g.textBaseline = 'middle';
    (p.lines || []).forEach((l, i) => { g.font = i ? '600 10px "Titillium Web", sans-serif' : 'italic 700 12px "Bodoni Moda", Georgia, serif'; g.fillText(l[0], p.x + 8, p.y + 11 + i * 13); if (l[1]){ g.textAlign = 'right'; g.fillText(l[1], p.x + p.w - 8, p.y + 11 + i * 13); g.textAlign = 'left'; } }); }
  else if (p.kind === 'cones'){ for (let k = 0; k < (p.n || 5); k++){ const x = p.x + k * 12; g.fillStyle = '#d99a4a'; g.beginPath(); g.moveTo(x - 5, p.y - 6); g.lineTo(x + 5, p.y - 6); g.lineTo(x, p.y + 8); g.closePath(); g.fill(); g.strokeStyle = 'rgba(90,50,10,.4)'; g.lineWidth = 0.8; g.stroke(); } }
  else if (p.kind === 'scale'){ g.fillStyle = 'rgba(30,20,10,.2)'; circ(g, p.x + 3, p.y + 4, 14); g.fill(); g.fillStyle = '#c9ccd2'; rr(g, p.x - 12, p.y - 12, 24, 24, 4); g.fill(); g.fillStyle = '#2e8b57'; circ(g, p.x, p.y - 2, 6); g.fill(); g.fillStyle = '#fff'; g.fillRect(p.x - 1, p.y - 6, 2, 6); }
  else if (p.kind === 'rug'){ g.fillStyle = p.color || 'rgba(46,139,87,.25)'; rr(g, p.x, p.y, p.w, p.h, 8); g.fill(); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; rr(g, p.x + 6, p.y + 6, p.w - 12, p.h - 12, 6); g.stroke(); }
  else if (p.kind === 'wallshelf'){                                        // shelves on a wall behind the counter: boxes of medicines
    g.fillStyle = 'rgba(30,20,10,.2)'; g.fillRect(p.x + 3, p.y + 3, p.w, p.h); g.fillStyle = K.shelfDark || '#8a6a4a'; g.fillRect(p.x, p.y, p.w, p.h);
    const cols = p.cols || ['#fffdf8', '#e58fa0', '#7fb3e0', '#f4b928', '#9ed0a8'];
    for (let y = p.y + 4; y < p.y + p.h - 8; y += 11) for (let x = p.x + 4; x < p.x + p.w - 6; x += 9){ g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x, y, 7, 8); }
  }
  else if (p.kind === 'counterback'){                                      // the gelateria's back counter: machines, cups, cones
    g.fillStyle = 'rgba(30,20,10,.2)'; rr(g, p.x + 3, p.y + 4, p.w, p.h, 3); g.fill();
    g.fillStyle = K.counter || '#c9ccd2'; rr(g, p.x, p.y, p.w, p.h, 3); g.fill(); g.fillStyle = K.counterTop || '#f3f1ec'; rr(g, p.x + 3, p.y + 3, p.w - 6, p.h - 6, 2); g.fill();
    g.fillStyle = '#c9ccd2'; rr(g, p.x + 20, p.y + 8, 40, 22, 3); g.fill(); g.fillStyle = '#c23b2a'; rr(g, p.x + 24, p.y + 11, 32, 5, 2); g.fill();
    for (let k = 0; k < 6; k++){ g.fillStyle = k % 2 ? '#f7c6d0' : '#fffdf8'; circ(g, p.x + 90 + k * 12, p.y + p.h / 2, 5); g.fill(); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1; g.stroke(); }
    for (let k = 0; k < 4; k++){ const x = p.x + p.w - 90 + k * 14, y = p.y + p.h / 2; g.fillStyle = '#d99a4a'; g.beginPath(); g.moveTo(x - 5, y - 6); g.lineTo(x + 5, y - 6); g.lineTo(x, y + 8); g.closePath(); g.fill(); }
  }
}
/* a glass display case from above (the gelateria's vetrina): steel, the glass, the trays of gelato, in the depth-sorted pass */
function drawShopCase(c, f){
  ctx.fillStyle = 'rgba(30,20,10,.25)'; rr(ctx, f.x + 4, f.y + 6, f.w, f.h, 5); ctx.fill();
  ctx.fillStyle = (c.colors || {}).counter || '#c9ccd2'; rr(ctx, f.x, f.y, f.w, f.h, 5); ctx.fill();
  const T = f.tubs, tw = (f.w - 16) / T.length;
  T.forEach((it, i) => { const x = f.x + 8 + i * tw; ctx.fillStyle = '#9aa0aa'; ctx.fillRect(x + 1, f.y + 5, tw - 2, f.h - 10); if (!bagHas(it.bag || it.id)){ ctx.fillStyle = it.color; rr(ctx, x + 2, f.y + 6, tw - 4, f.h - 12, 4); ctx.fill(); } });
  ctx.fillStyle = 'rgba(200,228,238,.35)'; rr(ctx, f.x + 4, f.y + 3, f.w - 8, f.h - 6, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(f.x + 10, f.y + 5); ctx.lineTo(f.x + f.w - 10, f.y + 5); ctx.stroke();
}
/* the shop windows in the front wall: the street outside, by day or by night */
function drawShopWindows(c){
  const night = daytime() === 'night';
  [[96, 330], [630, 330]].forEach(([x, w]) => {
    const g = ctx.createLinearGradient(0, 574, 0, 600);
    if (night){ g.addColorStop(0, '#1b2a52'); g.addColorStop(1, '#0d1633'); } else { g.addColorStop(0, '#cfe3ee'); g.addColorStop(1, '#a9c4d3'); }
    ctx.fillStyle = g; ctx.fillRect(x, 576, w, 22);
    if (night){ const gl = ctx.createRadialGradient(x + w * 0.7, 592, 0, x + w * 0.7, 592, 70); gl.addColorStop(0, 'rgba(255,200,120,.55)'); gl.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = gl; ctx.fillRect(x, 576, w, 22); }
    else { ctx.fillStyle = 'rgba(255,255,255,.45)'; for (let k = 0; k < 3; k++) ctx.fillRect(x + 30 + k * 110, 578, 40, 2); }
    ctx.strokeStyle = (c.colors || {}).trim || '#7a4b2a'; ctx.lineWidth = 3; ctx.strokeRect(x, 576, w, 22);
    ctx.lineWidth = 2; for (let k = 1; k < 3; k++){ ctx.beginPath(); ctx.moveTo(x + k * w / 3, 576); ctx.lineTo(x + k * w / 3, 598); ctx.stroke(); }
  });
  /* the door: glass too */
  ctx.fillStyle = night ? 'rgba(20,32,70,.85)' : 'rgba(190,220,232,.8)'; ctx.fillRect(444, 576, 72, 24);
  ctx.strokeStyle = '#4a4e56'; ctx.lineWidth = 2; ctx.strokeRect(444, 576, 72, 24); ctx.beginPath(); ctx.moveTo(480, 576); ctx.lineTo(480, 600); ctx.stroke();
}
/* the shop's things in the depth-sorted pass (the case in front of the keeper) and per frame */
function shopEnts(){
  const c = shopOf(); if (!c) return [];
  const out = [{ y:-1, draw:() => { (c.fixtures || []).forEach(f => { if (f.kind !== 'case') shopShelfTopItems(c, f); }); drawShopWindows(c); } }];
  (c.fixtures || []).forEach(f => { if (f.kind === 'case') out.push({ y:f.y + f.h, draw:() => drawShopCase(c, f) }); });
  return out;
}
