/* The bridge's drawing (scene 'ponte', world/ponte.js). Two layers, built once (lazily):
   - the view over the north parapet (y < 352), one canvas per sky ('day' | 'sunset' | 'night'): the sky, the hills, the far
     town with its domes, the bell tower, the houses along both banks in perspective, the embankments with their plane
     trees and lamps, a second bridge upriver, and the river, which mirrors all of it (column by column about the bank's
     water line), with ripples; the sun low over the hills at sunset (its path of light on the water), the moon, the stars,
     lit windows and the lamps' long reflections at night;
   - the deck (one canvas, lit by day): the north parapet with its balusters (the water shows between them), the paving,
     the benches, the south parapet with the water beyond.
   At run time: the sky's fade (sunset → night: the lamps come on one by one, from the far end), glints on the water, the
   lamp posts (depth-sorted sprites), and the bridge's own lighting pass over the deck (warm at sunset, dark at night with
   pools of lamplight). */
let PONTE_BG = null;
const PONTE_VIEW = { a:null, b:null, k:1, t0:0, ms:0, last:0, to:null, from:null };
const pMix = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };
const PONTE_PAL = {
  day:{ sky:[[0, '#4f93cf'], [0.6, '#8fc0e4'], [1, '#d8eaf0']], hills:['#7f9fa0', '#9ab6b2'], tint:null, wall:'#b9aa8e', street:'#c9bfa9', winDark:'#2f3a46', shutter:'#4f7a52',
    water:'#2e6c96', waterA:0.5, roof:'#b5532f', lit:0, tree:['#5b8a45', '#77a85a'] },
  sunset:{ sky:[[0, '#2a2f63'], [0.32, '#7b3f78'], [0.62, '#e2675a'], [0.84, '#ffab4c'], [1, '#ffd88c']], hills:['#55345e', '#7a4566'], tint:['#ff9a4a', 0.32], shade:['#5a3a6a', 0.38],
    wall:'#a88a7a', street:'#b8977f', winDark:'#3a2a36', shutter:'#5a4a3a', water:'#4a3058', waterA:0.30, roof:'#a8492c', lit:0.12, tree:['#4f5a3a', '#6a6a40'] },
  night:{ sky:[[0, '#050a1e'], [0.6, '#0f1b40'], [1, '#283a6c']], hills:['#0c1430', '#141f44'], tint:['#1a2550', 0.8], shade:['#121a3a', 0.84], wall:'#3a4058', street:'#40465e',
    winDark:'#1a2036', shutter:'#24304a', water:'#06102c', waterA:0.48, roof:'#2e2a40', lit:0.55, tree:['#1c2a2a', '#24363a'] },
};
const P_HOUSE = ['#e3b36a', '#d98f5c', '#e8c99a', '#c9764e', '#efd7a8', '#d9a36e', '#e6a487', '#cfa168', '#f0c58a', '#bf8a63'];
function ponteBuild(){
  const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w * DPR; c.height = h * DPR; const g = c.getContext('2d'); g.scale(DPR, DPR); return [c, g]; };
  PONTE_BG = { mk, view:{}, deck:null };
  PONTE_BG.deck = ponteDeck(mk);
  return PONTE_BG;
}
const ponteView = sky => (PONTE_BG || ponteBuild()).view[sky] || (PONTE_BG.view[sky] = ponteBackdrop(PONTE_BG.mk, sky));

/* ---------- the view (a perspective: VP the vanishing point, s = 1 / distance, heights above the water) ---------- */
function ponteBackdrop(mk, sky){
  const P = PONTE_PAL[sky], VP = PONTE.VP, E = PONTE.EYE, RW = PONTE.RIVER, TOP = PONTE.deck[0];
  const X = (lat, s) => VP.x + lat * s, Y = (h, s) => VP.y + (E - h) * s;
  const night = sky === 'night', sunset = sky === 'sunset';
  const shade = (col, side) => {                                      // the light on a facade: by day the left bank in the sun
    if (sky === 'day') return side > 0 ? pMix(col, '#6a7a8a', 0.16) : col;
    if (sunset) return side > 0 ? pMix(col, P.tint[0], P.tint[1]) : pMix(col, P.shade[0], P.shade[1]);
    return pMix(col, side > 0 ? P.tint[0] : P.shade[0], side > 0 ? P.tint[1] : P.shade[1]);
  };
  const [land, g] = mk(W, TOP);
  const r = rng(sky === 'night' ? 4242 : 4242);                         // (the same town in every light)
  /* the sky */
  const sg = g.createLinearGradient(0, 0, 0, VP.y + 6); P.sky.forEach(([k, c]) => sg.addColorStop(k, c));
  g.fillStyle = sg; g.fillRect(0, 0, W, TOP);
  if (night){ const rs = rng(77); for (let i = 0; i < 140; i++){ const x = rs() * W, y = rs() * 112, a = 0.3 + rs() * 0.7; g.fillStyle = `rgba(255,250,230,${a})`; g.fillRect(x, y, rs() < 0.1 ? 2 : 1.2, rs() < 0.1 ? 2 : 1.2); }
    const mg = g.createRadialGradient(812, 44, 4, 812, 44, 60); mg.addColorStop(0, 'rgba(230,236,255,.35)'); mg.addColorStop(1, 'rgba(230,236,255,0)'); g.fillStyle = mg; g.fillRect(740, 0, 150, 110);
    g.fillStyle = '#f2f0dc'; circ(g, 812, 44, 12); g.fill(); g.fillStyle = 'rgba(180,180,160,.35)'; circ(g, 808, 41, 3); g.fill(); circ(g, 816, 48, 2); g.fill(); }
  if (sunset){
    const sun = g.createRadialGradient(600, 100, 4, 600, 100, 260); sun.addColorStop(0, 'rgba(255,236,170,.95)'); sun.addColorStop(0.12, 'rgba(255,190,100,.6)'); sun.addColorStop(0.5, 'rgba(255,120,80,.18)'); sun.addColorStop(1, 'rgba(255,120,80,0)');
    g.fillStyle = sun; g.fillRect(300, 0, 600, TOP);
    g.fillStyle = '#fff1c2'; circ(g, 600, 100, 15); g.fill(); g.fillStyle = 'rgba(255,255,240,.6)'; circ(g, 600, 100, 9); g.fill();
    [[150, 40, 120], [330, 70, 90], [720, 52, 140], [880, 86, 80]].forEach(([x, y, w]) => { g.fillStyle = 'rgba(255,170,120,.55)'; ell(g, x, y, w / 2, 4); g.fill(); g.fillStyle = 'rgba(120,60,110,.35)'; ell(g, x + 8, y + 3, w / 2.4, 2.5); g.fill(); });
  }
  if (sky === 'day') [[120, 46, 90], [300, 30, 70], [760, 60, 110]].forEach(([x, y, w]) => { g.fillStyle = 'rgba(255,255,255,.7)'; ell(g, x, y, w / 2, 9); g.fill(); ell(g, x - w / 5, y - 6, w / 4, 9); g.fill(); ell(g, x + w / 6, y - 5, w / 5, 8); g.fill(); });
  /* the hills (Colli Euganei), two layers */
  [[P.hills[0], 96, 18, 0.011], [P.hills[1], 108, 12, 0.017]].forEach(([c, y0, a, f]) => {
    g.fillStyle = c; g.beginPath(); g.moveTo(0, VP.y + 10);
    for (let x = 0; x <= W; x += 8) g.lineTo(x, y0 + Math.sin(x * f + 1.3) * a + Math.sin(x * f * 2.7) * a * 0.4);
    g.lineTo(W, VP.y + 10); g.closePath(); g.fill();
  });
  /* the far town at the end of the river: low roofs, the basilica's domes */
  for (let x = 330; x < 720; x += 7 + r() * 9){
    const h = 6 + r() * 12, w = 10 + r() * 14, c = P_HOUSE[(x | 0) % P_HOUSE.length];
    g.fillStyle = pMix(c, night ? '#10183a' : sunset ? '#7a4a6a' : '#9aa7b8', night ? 0.75 : sunset ? 0.45 : 0.35); g.fillRect(x, VP.y - h, w, h + 4);
    g.fillStyle = pMix(P.roof, night ? '#10183a' : '#9aa7b8', 0.4); g.fillRect(x - 1, VP.y - h - 2, w + 2, 3);
  }
  const dome = (x, y, rad) => { const dc = night ? '#2a3050' : sunset ? '#8a5a6a' : '#9aa6a0';
    g.fillStyle = night ? '#1e2440' : sunset ? '#b07a6a' : '#d9cdb4'; g.fillRect(x - rad, y, rad * 2, rad * 0.9);
    g.fillStyle = dc; g.beginPath(); g.arc(x, y, rad, Math.PI, 0); g.fill(); g.fillRect(x - 1.5, y - rad - 6, 3, 6); circ(g, x, y - rad - 6, 2); g.fill(); };
  dome(596, 112, 9); dome(612, 109, 7); dome(580, 114, 6); dome(626, 113, 5);
  { const tx = 640; g.fillStyle = night ? '#1e2440' : sunset ? '#9a6a6a' : '#d4c4a4'; g.fillRect(tx, 92, 5, 26); g.beginPath(); g.moveTo(tx - 1, 92); g.lineTo(tx + 2.5, 84); g.lineTo(tx + 6, 92); g.fill(); }
  /* the houses along both banks, far to near; the bell tower among them on the left */
  const items = [];
  [-1, 1].forEach(side => {
    let D = 0.6; const rs = rng(side < 0 ? 91 : 57);
    while (D < 16){
      const D1 = D * (1.16 + rs() * 0.12), hh = 100 + rs() * 120, col = P_HOUSE[Math.floor(rs() * P_HOUSE.length)], set = rs() < 0.2 ? 18 : 0;
      items.push({ kind:'house', side, D0:D, D1, hh, col, set, seed:Math.floor(rs() * 1e6), arcade:rs() < 0.35, floors:Math.max(2, Math.round(hh / 46)) });
      D = D1;
    }
  });
  items.push({ kind:'tower', side:-1, D0:3.4, D1:3.4 });
  items.push({ kind:'trees', side:-1 }, { kind:'trees', side:1 });
  items.sort((a, b) => (b.D0 || 99) - (a.D0 || 99));
  const quad = (pts, c) => { g.fillStyle = c; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); };
  const house = h => {
    const sd = h.side, lat = (345 + h.set) * sd, s0 = 1 / h.D0, s1 = 1 / h.D1;
    const x0 = X(lat, s0), x1 = X(lat, s1), b0 = Y(40, s0), b1 = Y(40, s1), t0 = Y(40 + h.hh, s0), t1 = Y(40 + h.hh, s1);
    const face = shade(h.col, sd);
    /* the end wall facing you (seen where the nearer house is lower) */
    const xe = X(lat + 70 * sd, s0);
    quad([[x0, b0], [xe, b0], [xe, t0], [x0, t0]], shadeDark(face, 0.22));
    quad([[x0, b0], [x1, b1], [x1, t1], [x0, t0]], face);
    /* the roof: a strip of tiles above the facade, its eaves */
    const rt = 7;
    quad([[x0, t0], [x1, t1], [x1, t1 - rt * s1], [xe + (x0 - xe) * 0.1, t0 - rt * s0]], shade(P.roof, sd) );
    g.strokeStyle = 'rgba(30,15,10,.35)'; g.lineWidth = Math.max(0.5, 1.6 * s0); g.beginPath(); g.moveTo(x0, t0); g.lineTo(x1, t1); g.stroke();
    /* windows: rows per floor, columns along the facade, with shutters */
    const rw = rng(h.seed), nc = Math.max(1, Math.round((h.D1 - h.D0) * 2.2 / Math.max(0.6, h.D0 * 0.5)));
    for (let f = 0; f < h.floors; f++){
      const hy0 = 40 + 18 + f * (h.hh - 24) / h.floors, hy1 = hy0 + Math.min(26, (h.hh - 24) / h.floors * 0.55);
      for (let c = 0; c < nc; c++){
        const da = h.D0 + (h.D1 - h.D0) * (c + 0.3) / nc, db = h.D0 + (h.D1 - h.D0) * (c + 0.7) / nc, sa = 1 / da, sb = 1 / db;
        const xa = X(lat, sa), xb = X(lat, sb);
        if (Math.abs(xb - xa) < 0.6) continue;
        const ground = f === 0 && h.arcade;
        const ya0 = Y(ground ? 40 : hy0, sa), ya1 = Y(ground ? 40 + 34 : hy1, sa), yb0 = Y(ground ? 40 : hy0, sb), yb1 = Y(ground ? 40 + 34 : hy1, sb);
        const litW = night ? rw() < 0.5 : sunset ? sd > 0 && rw() < 0.35 : false;
        const wc = litW ? (night ? '#ffd27a' : '#ffcf86') : P.winDark;
        quad([[xa, ya0], [xb, yb0], [xb, yb1], [xa, ya1]], wc);
        if (!ground && !litW && Math.abs(xb - xa) > 3 && sky === 'day'){ const w = (xb - xa) * 0.28; quad([[xa - w, ya0], [xa, ya0], [xa, ya1], [xa - w, ya1]], P.shutter); quad([[xb, yb0], [xb + w, yb0], [xb + w, yb1], [xb, yb1]], P.shutter); }
        if (litW && night){ const gl = g.createRadialGradient((xa + xb) / 2, (ya0 + ya1) / 2, 0, (xa + xb) / 2, (ya0 + ya1) / 2, 10 * sa + 4); gl.addColorStop(0, 'rgba(255,200,110,.35)'); gl.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = gl; g.fillRect(Math.min(xa, xb) - 14, Math.min(ya1, yb1) - 14, Math.abs(xb - xa) + 28, Math.abs(ya0 - ya1) + 28); }
      }
    }
  };
  const shadeDark = (c, k) => { const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(c); const v = m ? m.slice(1).map(Number) : [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); return `rgb(${v.map(x => Math.round(x * (1 - k))).join(',')})`; };
  const tower = () => {
    const s = 1 / 3.4, lat = -430, x = X(lat, s), w = 74 * s, base = Y(40, s), top = Y(40 + 430, s);
    const c = night ? '#2a2f4a' : sunset ? '#c7826a' : '#d9b48a', d = shadeDark(c, 0.25);
    g.fillStyle = c; g.fillRect(x - w / 2, top, w, base - top);
    g.fillStyle = d; g.fillRect(x + w / 2 - w * 0.22, top, w * 0.22, base - top);
    for (let k = 1; k < 6; k++){ g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x - w / 2, top + (base - top) * k / 7, w, 1); }
    /* the belfry: two arches, the bells inside (lit at night), a cornice, the conical spire with its cross */
    const by = top + 5, bh = Math.max(14, 50 * s);
    g.fillStyle = night ? '#ffcf7a' : '#3a2a26';
    [-0.22, 0.22].forEach(o => { const aw = w * 0.15; g.beginPath(); g.moveTo(x + o * w - aw, by + bh); g.lineTo(x + o * w - aw, by + aw); g.arc(x + o * w, by + aw, aw, Math.PI, 0); g.lineTo(x + o * w + aw, by + bh); g.closePath(); g.fill(); });
    if (night){ const gl = g.createRadialGradient(x, by + bh / 2, 0, x, by + bh / 2, 30); gl.addColorStop(0, 'rgba(255,200,110,.35)'); gl.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = gl; g.fillRect(x - 30, by - 20, 60, 60); }
    g.fillStyle = shadeDark(c, 0.1); g.fillRect(x - w / 2 - 2, top - 3, w + 4, 4);
    g.fillStyle = night ? '#232a44' : sunset ? '#7a4a52' : '#8a5a3a'; g.beginPath(); g.moveTo(x - w / 2 - 1, top - 3); g.lineTo(x, top - 48); g.lineTo(x + w / 2 + 1, top - 3); g.closePath(); g.fill();
    g.strokeStyle = night ? '#6a6a7a' : '#4a3a2a'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, top - 48); g.lineTo(x, top - 57); g.moveTo(x - 3, top - 53); g.lineTo(x + 3, top - 53); g.stroke();
    if (sunset){ g.fillStyle = 'rgba(255,190,120,.35)'; g.fillRect(x - w / 2, top, w * 0.4, base - top); }
  };
  /* the embankments: the stone wall from the water up to the street, the street (a wedge), its railing and lamps, the trees */
  const bank = sd => {
    const sN = 1.8, sF = 0.02;
    quad([[X(285 * sd, sN), Y(0, sN)], [X(285 * sd, sF), Y(0, sF)], [X(285 * sd, sF), Y(40, sF)], [X(285 * sd, sN), Y(40, sN)]], shade(P.wall, sd));
    g.strokeStyle = 'rgba(40,30,20,.18)'; g.lineWidth = 0.8;
    for (let h = 8; h < 40; h += 8){ g.beginPath(); g.moveTo(X(285 * sd, sN), Y(h, sN)); g.lineTo(X(285 * sd, sF), Y(h, sF)); g.stroke(); }
    quad([[X(285 * sd, sN), Y(40, sN)], [X(285 * sd, sF), Y(40, sF)], [X(345 * sd, sF), Y(40, sF)], [X(345 * sd, sN), Y(40, sN)]], shade(P.street, sd));
    /* the green stains of the water line */
    quad([[X(285 * sd, sN), Y(0, sN)], [X(285 * sd, sF), Y(0, sF)], [X(285 * sd, sF), Y(5, sF)], [X(285 * sd, sN), Y(5, sN)]], night ? 'rgba(20,40,40,.6)' : 'rgba(70,90,60,.45)');
  };
  const trees = sd => {
    for (let D = 1.1; D < 9; D *= 1.32){
      const s = 1 / D, x = X(300 * sd, s), y = Y(40, s);
      g.fillStyle = night ? '#1a1a22' : '#6a5a48'; g.fillRect(x - 1.2 * s * 3, y - 70 * s, 2.4 * s * 3, 70 * s);
      [[0, -86, 30], [-14, -76, 22], [14, -78, 22], [0, -104, 20]].forEach(([dx, dy, rr_], i) => { g.fillStyle = P.tree[i % 2]; circ(g, x + dx * s, y + dy * s, rr_ * s); g.fill(); });
    }
  };
  const bankLamps = (sd, lit) => {
    for (let D = 0.9; D < 12; D *= 1.45){
      const s = 1 / D, x = X(288 * sd, s), y = Y(40, s);
      g.strokeStyle = night ? '#101420' : '#2b2f2a'; g.lineWidth = Math.max(0.6, 2.4 * s); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 62 * s); g.stroke();
      g.fillStyle = lit ? '#ffe6a6' : '#3a3e3a'; circ(g, x, y - 64 * s, Math.max(1, 4 * s)); g.fill();
      if (lit){ const gl = g.createRadialGradient(x, y - 64 * s, 0, x, y - 64 * s, 26 * s + 6); gl.addColorStop(0, 'rgba(255,214,140,.7)'); gl.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = gl; g.fillRect(x - 40, y - 64 * s - 40, 80, 80); }
    }
  };
  /* the railing along the embankment */
  const rail = sd => { g.strokeStyle = night ? 'rgba(20,24,40,.9)' : 'rgba(60,50,40,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X(287 * sd, 1.8), Y(52, 1.8)); g.lineTo(X(287 * sd, 0.03), Y(52, 0.03)); g.stroke(); };
  items.forEach(it => { if (it.kind === 'house') house(it); else if (it.kind === 'tower') tower(); });
  [-1, 1].forEach(sd => { bank(sd); trees(sd); rail(sd); bankLamps(sd, night); });
  /* the river: the land mirrored, column by column, about the bank's water line; then the bridge upriver and its mirror */
  const [wat, w] = mk(W, TOP);
  const wy = x => VP.y + E * Math.min(1.8, Math.abs(x - VP.x) / RW);
  const sky2 = w.createLinearGradient(0, VP.y, 0, TOP); P.sky.slice().reverse().forEach(([k, c]) => sky2.addColorStop(1 - k, c));
  w.fillStyle = sky2; w.fillRect(0, VP.y, W, TOP - VP.y);
  for (let x = 0; x < W; x++){
    const y0 = wy(x + 0.5); if (y0 >= TOP) continue;
    const L = Math.min(y0, TOP - y0) + 1;
    w.save(); w.translate(0, 2 * y0); w.scale(1, -1);
    w.drawImage(land, x * DPR, (y0 - L) * DPR, DPR, L * DPR, x, y0 - L, 1, L);
    w.restore();
  }
  /* the bridge upriver (D 4): its face with three arches, its parapet; mirrored about its own water line */
  const bridge = (gg, flip) => {
    const s = 0.27, yw = Y(0, s), yt = Y(62, s), x0 = X(-330, s), x1 = X(330, s), stone = night ? '#2c3150' : sunset ? '#b07868' : '#cdb894';
    gg.save(); if (flip){ gg.translate(0, 2 * yw); gg.scale(1, -1); }
    gg.fillStyle = stone;
    gg.beginPath(); gg.rect(x0, yt, x1 - x0, yw - yt);
    [-1, 0, 1].forEach(k => { const cx = VP.x + k * 62 * s, half = 25 * s, rise = 30 * s; gg.moveTo(cx - half, yw); gg.quadraticCurveTo(cx - half, yw - rise * 1.25, cx, yw - rise * 1.25); gg.quadraticCurveTo(cx + half, yw - rise * 1.25, cx + half, yw); gg.closePath(); });
    gg.fill('evenodd');
    gg.strokeStyle = 'rgba(40,30,30,.25)'; gg.lineWidth = 0.6; gg.beginPath(); gg.moveTo(x0, yt + 3); gg.lineTo(x1, yt + 3); gg.stroke();
    gg.fillStyle = night ? '#3a4060' : sunset ? '#c98a72' : '#ddcaa6'; gg.fillRect(x0 - 1, yt - 3.5, x1 - x0 + 2, 3.5);
    if (night) for (let k = 0; k < 5; k++){ const lx = x0 + 8 + k * (x1 - x0 - 16) / 4; gg.fillStyle = '#ffe2a0'; circ(gg, lx, yt - 7, 1.7); gg.fill(); const gl = gg.createRadialGradient(lx, yt - 7, 0, lx, yt - 7, 9); gl.addColorStop(0, 'rgba(255,214,140,.5)'); gl.addColorStop(1, 'rgba(255,214,140,0)'); gg.fillStyle = gl; gg.fillRect(lx - 9, yt - 16, 18, 18); }
    gg.restore();
  };
  bridge(w, true);
  /* the water's colour over the mirror, then ripples: the image wobbles more near you */
  w.fillStyle = P.water; w.globalAlpha = P.waterA; w.fillRect(0, VP.y, W, TOP - VP.y); w.globalAlpha = 1;
  const [rip, q] = mk(W, TOP);
  q.drawImage(wat, 0, 0, W, TOP);
  for (let y = VP.y; y < TOP; y += 2){ const k = (y - VP.y) / E, off = Math.sin(y * 0.55) * (0.5 + k * 1.8) + Math.sin(y * 0.17 + 2) * k * 0.9; q.drawImage(wat, 0, y * DPR, W * DPR, 2 * DPR, off, y, W, 2); }
  const rr2 = rng(sky === 'day' ? 3 : sky === 'sunset' ? 5 : 7);
  for (let i = 0; i < 900; i++){
    const y = VP.y + 4 + Math.pow(rr2(), 0.7) * (TOP - VP.y - 4), k = (y - VP.y) / E, x = rr2() * W, len = 3 + k * 16 * rr2();
    q.fillStyle = rr2() < 0.5 ? (night ? 'rgba(120,140,200,.10)' : sunset ? 'rgba(255,200,150,.16)' : 'rgba(255,255,255,.16)') : 'rgba(0,10,30,.12)';
    q.fillRect(x, y, len, Math.max(0.6, k * 1.3));
  }
  /* the sun's path of light (sunset); the lamps' long reflections and the windows' glitter (night) */
  if (sunset) for (let i = 0; i < 260; i++){ const y = VP.y + 8 + Math.pow(rr2(), 0.8) * (TOP - VP.y - 8), k = (y - VP.y) / E, x = 598 + (rr2() - 0.5) * (8 + k * 120) * (0.5 + rr2() * 0.5), len = 2 + k * 18 * rr2();
    q.fillStyle = `rgba(255,${190 + Math.floor(rr2() * 50)},120,${0.35 + rr2() * 0.5})`; q.fillRect(x - len / 2, y, len, Math.max(0.8, k * 1.6)); }
  if (night) [-1, 1].forEach(sd => { for (let D = 0.9; D < 12; D *= 1.45){ const s = 1 / D, x = X(288 * sd, s), y0 = Y(0, s);
    for (let y = y0 + 2; y < Math.min(TOP, y0 + 160 * s + 10); y += 2.5 * s + 1){ const a = 0.55 * (1 - (y - y0) / (160 * s + 12)); q.fillStyle = `rgba(255,210,130,${a})`; const wl = (3 + rr2() * 5) * s + 1.5; q.fillRect(x - wl / 2 + (rr2() - 0.5) * 3 * s, y, wl, Math.max(0.8, s * 1.4)); } } });
  /* compose: the water only where the river is (below the banks' water line) */
  const [out, o] = mk(W, H);
  o.drawImage(land, 0, 0, W, TOP);
  o.save(); o.beginPath(); o.moveTo(X(-RW, 1.8), Y(0, 1.8)); o.lineTo(VP.x, VP.y); o.lineTo(X(RW, 1.8), Y(0, 1.8)); o.closePath(); o.clip();
  o.drawImage(rip, 0, 0, W, TOP);
  o.restore();
  bridge(o, false);
  /* the water under the south parapet (the river downstream, glimpsed below the deck's edge) */
  const sw = o.createLinearGradient(0, 560, 0, H); sw.addColorStop(0, night ? '#050c22' : sunset ? '#3a2448' : '#24577a'); sw.addColorStop(1, night ? '#0a1636' : sunset ? '#6a3a50' : '#3a7aa0');
  o.fillStyle = sw; o.fillRect(0, 556, W, H - 556);
  return out;
}
/* ---------- the deck: the north parapet, the paving, the benches, the south parapet ---------- */
function ponteDeck(mk){
  const [c, g] = mk(W, H), r = rng(808), [y0, y1] = PONTE.deck;
  /* the paving: trachyte slabs in rows across the bridge (soft joints), a worn strip down the middle */
  g.fillStyle = '#a2998b'; g.fillRect(0, y0, W, y1 - y0 + 4);
  for (let y = y0 + 1, row = 0; y < y1; y += 22, row++) for (let x = -(row % 2) * 30 - r() * 20; x < W; x += 52 + r() * 34){
    const l = r(), w = 48 + r() * 30; g.fillStyle = `hsl(${32 + l * 6}, ${8 + l * 4}%, ${64 + l * 5}%)`; rr(g, x + 1, y + 1, w - 2, 20.5, 3); g.fill();
    g.fillStyle = 'rgba(255,250,235,.10)'; g.fillRect(x + 4, y + 3, w - 10, 2);
  }
  g.fillStyle = 'rgba(255,240,210,.07)'; g.fillRect(0, 430, W, 60);
  /* the north parapet: the stone coping on top, the balusters (gaps: the water shows through), the plinth; its shadow */
  const top = PONTE.rail;
  g.fillStyle = 'rgba(30,20,10,.28)'; g.fillRect(0, y0, W, 10);
  g.fillStyle = '#e2d6bd'; g.fillRect(0, top, W, 10);
  g.fillStyle = '#c9bb9c'; g.fillRect(0, top + 8, W, 3);
  for (let x = 0; x < W; x += 56){ g.fillStyle = 'rgba(80,60,40,.18)'; g.fillRect(x, top, 1.5, 10); }
  g.fillStyle = 'rgba(70,64,58,.62)'; g.fillRect(0, top + 10, W, y0 - top - 10);
  g.fillStyle = '#d4c5a5'; g.fillRect(0, y0 - 7, W, 7);
  g.fillStyle = '#bfae8c'; g.fillRect(0, y0 - 2, W, 2);
  for (let x = 6; x < W; x += 15){
    if (x % 225 < 15) { g.fillStyle = '#d8cbab'; g.fillRect(x - 3, top + 11, 13, y0 - 7 - top - 11); continue; }   // a pier every few balusters
    g.fillStyle = '#d8cbab'; g.beginPath(); g.moveTo(x + 1, top + 11); g.lineTo(x + 6, top + 11); g.quadraticCurveTo(x + 2, top + 17, x + 6.5, top + 24); g.quadraticCurveTo(x + 8, top + 30, x + 5.5, y0 - 7); g.lineTo(x + 1.5, y0 - 7); g.quadraticCurveTo(x - 1, top + 30, x + 0.5, top + 24); g.quadraticCurveTo(x + 5, top + 17, x + 1, top + 11); g.fill();
    g.fillStyle = 'rgba(90,70,50,.22)'; g.fillRect(x + 4.5, top + 12, 1.2, y0 - 7 - top - 12);
  }
  /* the plaque (Ponte Molino) */
  const pl = PONTE.plaque;
  g.fillStyle = '#7a5a2a'; rr(g, pl.x - 20, top + 12, 40, 18, 2); g.fill(); g.fillStyle = '#b08a4a'; rr(g, pl.x - 18, top + 14, 36, 14, 2); g.fill();
  g.fillStyle = '#4a3418'; g.font = '700 5.6px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PONTE MOLINO', pl.x, top + 19); g.fillText('SEC. I a.C.', pl.x, top + 25);
  /* the benches against the parapet: slats, iron legs, the backrest on the parapet side */
  PONTE.benches.forEach(b => {
    g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, b.x + 3, b.y + 5, b.w, b.h, 3); g.fill();
    g.fillStyle = '#3a3a36'; [b.x + 6, b.x + b.w - 10].forEach(x => g.fillRect(x, b.y, 4, b.h));
    for (let k = 0; k < 4; k++){ g.fillStyle = k % 2 ? '#8a5a32' : '#9a6a3c'; rr(g, b.x, b.y + 6 + k * 4, b.w, 3.4, 1.5); g.fill(); }
    g.fillStyle = '#7a4e2a'; rr(g, b.x, b.y, b.w, 4, 1.5); g.fill();
  });
  /* the south parapet, from above: its coping, its outer face; the water beyond is in the view canvas */
  g.fillStyle = 'rgba(30,20,10,.25)'; g.fillRect(0, y1 - 4, W, 6);
  g.fillStyle = '#ddd0b4'; g.fillRect(0, y1, W, 18);
  g.fillStyle = '#c4b495'; g.fillRect(0, y1 + 14, W, 4);
  for (let x = 0; x < W; x += 64){ g.fillStyle = 'rgba(80,60,40,.2)'; g.fillRect(x, y1, 1.5, 18); }
  g.fillStyle = '#a89878'; g.fillRect(0, y1 + 18, W, 8);
  return c;
}
/* ---------- run time ---------- */
/* the sky shown now: a fade from a to b (k 0 → 1); lamps: how lit each deck lamp is (0 … 1), the far end first */
function ponteViewNow(){
  const V = PONTE_VIEW, now = performance.now(), target = ponteSky();
  if ((now - V.last > 400 && !PONTE.fadeMs) || !V.a){ V.a = target; V.b = null; V.k = 1; }   // (just arrived: no fade; a fade asked for, PONTE.fadeMs, always plays, even after a slow frame)
  V.last = now;
  if (target !== (V.b || V.a)){ if (V.b) V.a = V.b; V.b = target; V.t0 = now; V.ms = RM ? 300 : (PONTE.fadeMs || 1400); PONTE.fadeMs = 0; }
  if (V.b){ V.k = Math.min(1, (now - V.t0) / V.ms); if (V.k >= 1){ V.a = V.b; V.b = null; V.k = 1; } }
  V.to = V.b || V.a; V.from = V.b ? V.a : null;
  return V;
}
const PONTE_LAMP_ORDER = PONTE.lamps.map((l, i) => i).sort((a, b) => PONTE.lamps[b][0] - PONTE.lamps[a][0]);
function ponteLampLevel(i){
  const V = PONTE_VIEW, lvl = s => s === 'night' ? 1 : 0;
  if (!V.b) return lvl(V.a);
  if (V.a === 'night' || V.b !== 'night') return lvl(V.a) * (1 - V.k) + lvl(V.b) * V.k;
  const order = PONTE_LAMP_ORDER.indexOf(i), at = 0.25 + order * 0.13;                       // sunset → night: one by one
  return Math.max(0, Math.min(1, (V.k - at) / 0.06));
}
const ponteLampsLit = () => PONTE.lamps.filter((l, i) => ponteLampLevel(i) > 0.5).length;
/* how dark the deck is: 0 (day), sunset 0.25, night 1 */
function ponteDark(){
  const V = PONTE_VIEW, d = s => s === 'night' ? 1 : s === 'sunset' ? 0.22 : 0;
  return V.b ? d(V.a) + (d(V.b) - d(V.a)) * V.k : d(V.a);
}
const ponteWarm = () => { const V = PONTE_VIEW, w = s => s === 'sunset' ? 1 : 0; return V.b ? w(V.a) + (w(V.b) - w(V.a)) * V.k : w(V.a); };
function ponteBack(t, gg = ctx){
  if (!PONTE_BG) ponteBuild();
  const V = ponteViewNow();
  gg.drawImage(ponteView(V.a), 0, 0, W, H);
  if (V.b){ gg.globalAlpha = V.k; gg.drawImage(ponteView(V.b), 0, 0, W, H); gg.globalAlpha = 1; }
  if (gg === ctx && !RM) ponteGlints(t);
  gg.drawImage(PONTE_BG.deck, 0, 0, W, H);
}
/* glints on the water: a few bright dashes that come and go (white by day, gold at sunset, lamplight at night) */
function ponteGlints(t){
  const V = PONTE_VIEW, sky = V.b && V.k > 0.5 ? V.b : V.a, VP = PONTE.VP, r = rng(31);
  ctx.save();
  ctx.beginPath(); ctx.moveTo(VP.x - PONTE.RIVER * 1.8, VP.y + PONTE.EYE * 1.8); ctx.lineTo(VP.x, VP.y); ctx.lineTo(VP.x + PONTE.RIVER * 1.8, VP.y + PONTE.EYE * 1.8); ctx.closePath(); ctx.clip();
  for (let i = 0; i < 46; i++){
    const y = VP.y + 10 + Math.pow(r(), 0.7) * (PONTE.rail - VP.y - 10), k = (y - VP.y) / PONTE.EYE;
    const cx = sky === 'sunset' ? 598 + (r() - 0.5) * (10 + k * 110) : sky === 'night' ? VP.x + (r() < 0.5 ? -1 : 1) * (PONTE.RIVER * 0.95 * k) + (r() - 0.5) * 20 : 200 + r() * 600;
    const ph = r() * 6.28, a = Math.max(0, Math.sin(t * (1.2 + r() * 1.5) + ph));
    if (a < 0.2) continue;
    const len = 2 + k * 10;
    ctx.fillStyle = sky === 'sunset' ? `rgba(255,236,170,${a * 0.85})` : sky === 'night' ? `rgba(255,214,140,${a * 0.6})` : `rgba(255,255,255,${a * 0.7})`;
    ctx.fillRect(cx + Math.sin(t * 0.7 + i) * 3 - len / 2, y, len, Math.max(0.8, k * 1.5));
  }
  ctx.restore();
}
/* a lamp post seen from the front: base, pole, a lantern (lit: its glass glows) */
function ponteLampPost(x, y, lvl){
  ctx.fillStyle = 'rgba(20,20,20,.25)'; ell(ctx, x + 3, y + 2, 9, 4); ctx.fill();
  ctx.fillStyle = '#23302a'; rr(ctx, x - 5, y - 10, 10, 11, 2); ctx.fill();
  ctx.fillRect(x - 1.8, y - 74, 3.6, 66);
  ctx.fillRect(x - 6, y - 76, 12, 3);
  ctx.fillStyle = lvl > 0 ? `rgb(${Math.round(200 + 55 * lvl)},${Math.round(206 + 30 * lvl)},${Math.round(200 - 40 * lvl)})` : '#c8d2d0';
  ctx.beginPath(); ctx.moveTo(x - 6, y - 78); ctx.lineTo(x + 6, y - 78); ctx.lineTo(x + 8, y - 92); ctx.lineTo(x - 8, y - 92); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#23302a'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y - 78); ctx.lineTo(x, y - 92); ctx.stroke();
  ctx.fillStyle = '#23302a'; ctx.beginPath(); ctx.moveTo(x - 10, y - 92); ctx.lineTo(x + 10, y - 92); ctx.lineTo(x, y - 100); ctx.closePath(); ctx.fill();
  circ(ctx, x, y - 101, 2); ctx.fill();
}
SCENE_ART.ponte = {
  back:ponteBack,
  ents(){ return PONTE.lamps.map(([x, y], i) => ({ y, draw:() => ponteLampPost(x, y, ponteLampLevel(i)) })); },
  /* the bridge's own lighting pass (instead of the generic one): warm at sunset, dark with pools of lamplight at night */
  night(){ ponteLight(ctx, 1); },
  probe(){ return ponteProbe(); },
};
let PONTE_SCRATCH = null;
function ponteLight(gg, scale){
  const d = ponteDark(), warm = ponteWarm();
  if (d <= 0.001 && warm <= 0.001) return;
  const lv = PONTE.lamps.map((l, i) => ponteLampLevel(i));
  if (!PONTE_SCRATCH){ PONTE_SCRATCH = document.createElement('canvas'); PONTE_SCRATCH.width = W; PONTE_SCRATCH.height = H; }
  const c = PONTE_SCRATCH, g = c.getContext('2d');
  g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
  g.fillStyle = `rgba(10,18,54,${0.74 * d})`; g.fillRect(0, PONTE.rail, W, H - PONTE.rail);
  g.globalCompositeOperation = 'destination-out';
  PONTE.lamps.forEach(([x, y], i) => { if (lv[i] <= 0) return; const gr = g.createRadialGradient(x, y - 30, 0, x, y - 30, 130); gr.addColorStop(0, `rgba(0,0,0,${0.85 * lv[i]})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - 130, y - 160, 260, 260); });
  gg.save();
  if (warm > 0){ gg.globalAlpha = warm; gg.fillStyle = 'rgba(255,130,60,.16)'; gg.fillRect(0, PONTE.rail, W, H - PONTE.rail); gg.globalAlpha = 1; }
  gg.drawImage(c, 0, 0, W, H);
  gg.globalCompositeOperation = 'lighter';
  PONTE.lamps.forEach(([x, y], i) => {
    if (lv[i] <= 0) return;
    const pool = gg.createRadialGradient(x, y - 10, 0, x, y - 10, 90); pool.addColorStop(0, `rgba(255,186,96,${0.3 * lv[i]})`); pool.addColorStop(1, 'rgba(255,186,96,0)'); gg.fillStyle = pool; gg.fillRect(x - 90, y - 100, 180, 180);
    const head = gg.createRadialGradient(x, y - 85, 0, x, y - 85, 30); head.addColorStop(0, `rgba(255,236,170,${0.85 * lv[i]})`); head.addColorStop(1, 'rgba(255,236,170,0)'); gg.fillStyle = head; gg.fillRect(x - 30, y - 115, 60, 60);
  });
  gg.restore();
}
/* tests (__nightProbe): the mean brightness of the bridge as lit now, on a small canvas of its own */
function ponteProbe(){
  const c = document.createElement('canvas'); c.width = W / 4; c.height = H / 4;
  const g = c.getContext('2d'); g.scale(0.25, 0.25);
  ponteBack(0, g); ponteLight(g, 0.25);
  const d = g.getImageData(0, 0, c.width, c.height).data; let s = 0;
  for (let i = 0; i < d.length; i += 4) s += (d[i] + d[i + 1] + d[i + 2]) / 3;
  return s / (d.length / 4);
}
