/* The covered market's drawing (scene 'salone', world/salone.js): the background (built lazily: the hall's arch band with
   the shop signs, the shops in their arches with their back shelves and stock, the counters with their glass cases, the
   pink-and-cream stone floor of the aisle, the way out to Piazza delle Erbe with the daylight), and in the depth-sorted pass
   the pillars of the arcade and the lamps hanging over the aisle; Marisa's tasting plate (quest 4). The hall is covered: no
   night pass (it is shut at night). */
let bgSalone = null;
function buildBgSalone(){
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const r = rng(404), A = SALONE.aisle;
  /* the aisle's floor: big squares of pink and cream stone, worn */
  g.fillStyle = '#e6d6be'; g.fillRect(0, 0, W, H);
  for (let y = A[0] - 40, row = 0; y < A[1] + 60; y += 44, row++) for (let x = -22 + (row % 2) * 22, k = 0; x < W; x += 44, k++){
    const pink = (k + row) % 2 === 0, l = r() * 6;
    g.fillStyle = pink ? `hsl(14, 42%, ${70 + l}%)` : `hsl(38, 38%, ${86 + l * 0.6}%)`;
    g.fillRect(x + 1, y + 1, 42, 42);
  }
  g.strokeStyle = 'rgba(120,90,60,.18)'; g.lineWidth = 1;
  for (let i = 0; i < 260; i++){ const x = r() * W, y = A[0] + r() * (A[1] - A[0]); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 14, y + (r() - 0.5) * 6); g.stroke(); }
  /* the way out: the arch to the piazza, the sunlit cobbles beyond */
  const Gt = SALONE.gate;
  g.fillStyle = '#d8cbb4'; g.fillRect(Gt.x, A[1], Gt.w, H - A[1]);
  cobbles(g, r, Gt.x + 4, 470, Gt.x + Gt.w - 4, H, 38, 18, 74);
  const sun = g.createLinearGradient(0, 600, 0, 440); sun.addColorStop(0, 'rgba(255,240,200,.55)'); sun.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = sun; g.fillRect(Gt.x, 440, Gt.w, 160);
  g.fillStyle = 'rgba(255,245,215,.35)'; g.beginPath(); g.moveTo(Gt.x + 10, H); g.lineTo(Gt.x + 50, A[1] + 10); g.lineTo(Gt.x + Gt.w - 50, A[1] + 10); g.lineTo(Gt.x + Gt.w - 10, H); g.closePath(); g.fill();
  /* a shop in its arch: the shop floor, the back wall with shelves, the stock; the counter with its glass case */
  const shop = (s, top, south) => {
    const y0 = south ? A[1] + 6 : 0, y1 = south ? H : A[0] - 10;
    g.fillStyle = '#8a6a4e'; g.fillRect(s.x, y0, s.w, y1 - y0);
    for (let y = y0, row = 0; y < y1; y += 20, row++) for (let x = s.x + (row % 2) * 10; x < s.x + s.w; x += 20){ g.fillStyle = `hsl(24, 34%, ${50 + r() * 6}%)`; g.fillRect(x + 1, y + 1, 18, 18); }
    /* the back wall: whitewashed, with wooden shelves */
    const wy = south ? H - 64 : 30, wh = 40;
    g.fillStyle = '#efe6d6'; g.fillRect(s.x, wy, s.w, wh);
    g.fillStyle = '#8a5a32'; g.fillRect(s.x + 6, south ? wy : wy + wh - 8, s.w - 12, 8);
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(s.x, south ? wy - 6 : wy + wh, s.w, 6);
    /* the counter */
    const cy = south ? A[1] + 6 : A[0] - 34, ch = 24;
    g.fillStyle = 'rgba(30,20,10,.25)'; g.fillRect(s.x + 14, cy + 4, s.w - 28, ch);
    g.fillStyle = '#f2ece2'; rr(g, s.x + 10, cy, s.w - 20, ch, 3); g.fill();
    g.fillStyle = 'rgba(190,225,236,.75)'; rr(g, s.x + 16, cy + 3, s.w - 32, ch - 9, 2); g.fill();
    g.strokeStyle = '#8fb3c2'; g.lineWidth = 1.5; g.stroke();
    return { wy, wh, cy, ch };
  };
  /* the stock, drawn by the shop's kind */
  const loaf = (x, y, w, h, col) => { g.fillStyle = col; ell(g, x, y, w, h); g.fill(); g.strokeStyle = 'rgba(90,50,20,.45)'; g.lineWidth = 1.2; for (let k = -1; k <= 1; k++){ g.beginPath(); g.moveTo(x + k * w * 0.45 - 3, y - h * 0.5); g.lineTo(x + k * w * 0.45 + 3, y + h * 0.5); g.stroke(); } };
  const wheel = (x, y, rad, col, rind) => { g.fillStyle = rind; circ(g, x, y, rad); g.fill(); g.fillStyle = col; circ(g, x, y, rad - 3); g.fill(); g.strokeStyle = 'rgba(120,80,20,.3)'; g.lineWidth = 1; circ(g, x, y, rad * 0.55); g.stroke(); };
  const wedge = (x, y, w, h, col, holes) => { g.fillStyle = col; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w * 0.2, y); g.closePath(); g.fill(); g.strokeStyle = 'rgba(150,110,30,.5)'; g.lineWidth = 1; g.stroke();
    if (holes) for (let k = 0; k < 4; k++){ g.fillStyle = 'rgba(200,170,90,.7)'; circ(g, x + w * (0.35 + r() * 0.4), y + h * (0.45 + r() * 0.4), 1.2); g.fill(); } };
  const sal = (x, y, rad) => { g.fillStyle = '#9a2f2a'; circ(g, x, y, rad); g.fill(); for (let k = 0; k < 6; k++){ g.fillStyle = '#f2e0d0'; circ(g, x + (r() - 0.5) * rad * 1.3, y + (r() - 0.5) * rad * 1.3, 0.9); g.fill(); } };
  const N = SALONE.north, Sx = SALONE.south;
  /* PANE · FORNO: loaves on the shelf and in baskets, focacce and rolls in the case */
  { const s = N[0], L = shop(s);
    for (let k = 0; k < 8; k++) loaf(s.x + 26 + k * 32, L.wy + 18, 13, 7, k % 2 ? '#c98a3e' : '#b5702f');
    for (let k = 0; k < 6; k++){ g.fillStyle = '#c9a26a'; rr(g, s.x + 30 + k * 40, L.cy + 5, 30, 11, 3); g.fill(); g.fillStyle = k % 2 ? '#e0b060' : '#d9984a'; for (let j = 0; j < 3; j++){ circ(g, s.x + 37 + k * 40 + j * 8, L.cy + 10, 3.4); g.fill(); } }
    [[s.x + 40, 120], [s.x + 240, 128]].forEach(([x, y]) => { g.fillStyle = '#a07a4a'; circ(g, x, y, 15); g.fill(); g.fillStyle = '#7a5a32'; circ(g, x, y, 12); g.fill(); for (let j = 0; j < 4; j++) loaf(x + (j % 2 ? 4 : -4), y + (j < 2 ? -4 : 4), 6, 3.5, '#d9984a'); }); }
  /* SALUMERIA da Marisa: hams hanging on the back wall, a slicer, salami; in the case cheese wedges (fresh: pale, with holes;
     aged: deeper yellow), prosciutto slices, salami, olives */
  { const s = N[1], L = shop(s);
    for (let k = 0; k < 6; k++){ const x = s.x + 30 + k * 44; g.strokeStyle = '#5a3a22'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, L.wy); g.lineTo(x, L.wy + 6); g.stroke();
      g.fillStyle = '#b8574a'; g.beginPath(); g.moveTo(x - 9, L.wy + 6); g.quadraticCurveTo(x - 13, L.wy + 26, x - 3, L.wy + 34); g.lineTo(x + 3, L.wy + 34); g.quadraticCurveTo(x + 13, L.wy + 26, x + 9, L.wy + 6); g.closePath(); g.fill();
      g.fillStyle = '#e8b8a8'; ell(g, x, L.wy + 30, 4, 3); g.fill(); g.fillStyle = '#f5ece0'; ell(g, x, L.wy + 9, 6, 2.5); g.fill(); }
    /* the back counter: the red slicer, a block of cheese */
    g.fillStyle = '#d9cbb4'; g.fillRect(s.x + 16, 82, s.w - 32, 16);
    g.fillStyle = '#c23b2a'; rr(g, s.x + 34, 80, 34, 18, 4); g.fill(); g.fillStyle = '#d9d9d9'; circ(g, s.x + 51, 89, 7); g.fill(); g.strokeStyle = '#8a8a8a'; g.lineWidth = 1; g.stroke();
    wheel(s.x + s.w - 44, 90, 11, '#f0d27a', '#c9a24a');
    /* the glass case */
    const y = L.cy + 4;
    wedge(s.x + 30, y, 22, 12, '#f6ecc8', true); wedge(s.x + 58, y, 22, 12, '#f6ecc8', true);
    wedge(s.x + 92, y, 22, 12, '#f0cf6a', false); wedge(s.x + 120, y, 22, 12, '#ebc65a', false);
    for (let k = 0; k < 5; k++){ g.fillStyle = k % 2 ? '#e7a7a0' : '#de938a'; ell(g, s.x + 160 + k * 10, y + 7, 7, 4.5, 0.3); g.fill(); g.strokeStyle = '#f7e6dc'; g.lineWidth = 1; g.stroke(); }
    sal(s.x + 222, y + 6, 5.5); sal(s.x + 236, y + 7, 5.5);
    g.fillStyle = '#4f6a2a'; for (let k = 0; k < 7; k++){ circ(g, s.x + 250 + (k % 3) * 4, y + 4 + Math.floor(k / 3) * 4, 2); g.fill(); }
    /* the scale on the counter, the price cards */
    g.fillStyle = '#fffdf8'; rr(g, s.x + s.w - 54, L.cy - 14, 26, 14, 2); g.fill(); g.strokeStyle = '#8a8f99'; g.stroke();
    g.fillStyle = '#2b2b2b'; g.fillRect(s.x + s.w - 50, L.cy - 11, 18, 6); g.fillStyle = '#7fe08a'; g.font = '700 5px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('0,200', s.x + s.w - 41, L.cy - 8);
  }
  /* FORMAGGI: wheels of Grana and Asiago stacked on the shelf and the floor, wedges in the case */
  { const s = N[2], L = shop(s);
    for (let k = 0; k < 7; k++) wheel(s.x + 28 + k * 36, L.wy + 16, 14, k % 3 === 2 ? '#f6ecc8' : '#f0d27a', k % 3 === 2 ? '#d8c8a0' : '#b98a3a');
    [[s.x + 34, 126], [s.x + 64, 140], [s.x + 236, 120]].forEach(([x, y]) => { wheel(x, y, 16, '#f0d27a', '#a87a2a'); wheel(x + 2, y - 3, 13, '#f0d27a', '#b98a3a'); });
    for (let k = 0; k < 7; k++) wedge(s.x + 24 + k * 34, L.cy + 4, 24, 12, ['#f0cf6a', '#f6ecc8', '#ebc65a', '#f3dc94'][k % 4], k % 4 === 1);
  }
  /* PASTA FRESCA: trays of tortellini and tagliatelle */
  { const s = Sx[0], L = shop(s, 0, true);
    for (let k = 0; k < 8; k++){ const x = s.x + 26 + k * 38; g.fillStyle = '#d9cbb4'; rr(g, x - 14, L.cy + 4, 28, 13, 2); g.fill();
      for (let j = 0; j < 6; j++){ g.fillStyle = k % 2 ? '#f3d68a' : '#efc870'; circ(g, x - 9 + (j % 3) * 9, L.cy + 8 + Math.floor(j / 3) * 5, 2.4); g.fill(); } }
    for (let k = 0; k < 9; k++){ g.fillStyle = '#f0d590'; rr(g, s.x + 20 + k * 34, L.wy + 6, 24, 20, 3); g.fill(); g.strokeStyle = 'rgba(160,120,40,.4)'; g.lineWidth = 1; for (let j = 0; j < 4; j++){ g.beginPath(); g.moveTo(s.x + 24 + k * 34, L.wy + 10 + j * 4); g.lineTo(s.x + 40 + k * 34, L.wy + 10 + j * 4); g.stroke(); } }
  }
  /* VINI · OLIO: bottles on the shelves, a cask */
  { const s = Sx[1], L = shop(s, 0, true);
    for (let k = 0; k < 18; k++){ g.fillStyle = ['#5a1a2a', '#2f4a2a', '#c9b44a', '#6a2a3a'][k % 4]; circ(g, s.x + 18 + k * 17, L.wy + 18, 6); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; circ(g, s.x + 16 + k * 17, L.wy + 16, 2); g.fill(); }
    for (let k = 0; k < 9; k++){ g.fillStyle = k % 3 === 1 ? '#c9b44a' : '#5a1a2a'; circ(g, s.x + 30 + k * 32, L.cy + 10, 5); g.fill(); }
    g.fillStyle = '#7a4a2a'; circ(g, s.x + s.w - 40, 490, 22); g.fill(); g.strokeStyle = '#3a2410'; g.lineWidth = 2; circ(g, s.x + s.w - 40, 490, 16); g.stroke(); circ(g, s.x + s.w - 40, 490, 9); g.stroke();
  }
  /* the hall's walls: the arch band along the top (the arcade's arches, the shop signs on them) and the bottom */
  const archBand = (y, h, list, flip) => {
    g.fillStyle = '#cdb898'; g.fillRect(0, y, W, h);
    list.forEach(s => {
      g.fillStyle = '#4a3a2c'; g.beginPath();
      if (!flip){ g.moveTo(s.x + 6, y + h); g.lineTo(s.x + 6, y + h - 6); g.quadraticCurveTo(s.x + s.w / 2, y - 6, s.x + s.w - 6, y + h - 6); g.lineTo(s.x + s.w - 6, y + h); }
      else { g.moveTo(s.x + 6, y); g.lineTo(s.x + 6, y + 6); g.quadraticCurveTo(s.x + s.w / 2, y + h + 6, s.x + s.w - 6, y + 6); g.lineTo(s.x + s.w - 6, y); }
      g.closePath(); g.fill();
      /* the sign board on the arch */
      const bw = Math.min(170, s.w - 60), bx = s.x + s.w / 2 - bw / 2, by = flip ? y + 4 : y + 6, bh = s.sub ? 24 : 18;
      g.fillStyle = 'rgba(0,0,0,.25)'; rr(g, bx + 2, by + 2, bw, bh, 3); g.fill();
      g.fillStyle = s.col; rr(g, bx, by, bw, bh, 3); g.fill(); g.strokeStyle = 'rgba(255,240,210,.6)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = s.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 10px "Titillium Web", sans-serif';
      g.fillText(s.sign, bx + bw / 2, by + (s.sub ? 8 : bh / 2 + 0.5));
      if (s.sub){ g.font = 'italic 700 9px "Bodoni Moda", Georgia, serif'; g.fillText(s.sub, bx + bw / 2, by + 18); }
    });
  };
  archBand(0, 30, N, false);
  archBand(H - 24, 24, [...Sx], true);
  /* the gate's arch and its stone frame */
  g.fillStyle = '#b8a07e'; g.fillRect(Gt.x - 8, A[1] + 6, 10, H - A[1]); g.fillRect(Gt.x + Gt.w - 2, A[1] + 6, 10, H - A[1]);
  g.fillStyle = '#7a6a54'; g.font = '700 9px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.fillText('PIAZZA DELLE ERBE', 480, H - 8);
  /* the plaque on the north pillar */
  g.fillStyle = '#f5f1e8'; rr(g, 826, 216, 68, 20, 3); g.fill(); g.strokeStyle = '#8a7a5a'; g.lineWidth = 1; g.stroke();
  g.fillStyle = '#5a4a32'; g.font = '700 7px "Titillium Web", sans-serif'; g.fillText('SOTTO IL SALONE', 860, 223); g.fillText('dal 1219', 860, 231);
  bgSalone = c;
  return c;
}
/* the arcade's pillars (square, stone), the hanging lamps, the tasting plate */
function salonePillar(x, y){
  ctx.fillStyle = 'rgba(30,20,10,.22)'; ctx.fillRect(x - 13 + 4, y - 12 + 5, 26, 26);
  ctx.fillStyle = '#c4ae8c'; ctx.fillRect(x - 13, y - 12, 26, 26);
  ctx.fillStyle = '#d8c6a6'; ctx.fillRect(x - 13, y - 12, 26, 5); ctx.fillStyle = '#a8916e'; ctx.fillRect(x - 13, y + 10, 26, 4);
}
function saloneLamp(x, y, t){
  ctx.strokeStyle = 'rgba(40,30,20,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x, y - 4); ctx.stroke();
  const gl = ctx.createRadialGradient(x, y, 2, x, y, 70); gl.addColorStop(0, 'rgba(255,214,140,.32)'); gl.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = gl; ctx.fillRect(x - 70, y - 70, 140, 140);
  ctx.fillStyle = '#2b2620'; circ(ctx, x, y, 9); ctx.fill(); ctx.fillStyle = '#ffe2a8'; circ(ctx, x, y, 5); ctx.fill();
}
function saloneTaste(){
  const x = 404, y = SALONE.aisle[0] - 30;
  ctx.fillStyle = '#9a6a3a'; rr(ctx, x - 16, y - 6, 32, 12, 2); ctx.fill();
  ctx.fillStyle = '#f6ecc8'; ctx.fillRect(x - 11, y - 3, 7, 6); ctx.fillStyle = '#f0cf6a'; ctx.fillRect(x + 3, y - 3, 7, 6);
  ctx.strokeStyle = '#d9b07a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 7, y - 3); ctx.lineTo(x - 5, y - 9); ctx.moveTo(x + 7, y - 3); ctx.lineTo(x + 9, y - 9); ctx.stroke();
}
SCENE_ART.salone = {
  back(){ if (!bgSalone) buildBgSalone(); ctx.drawImage(bgSalone, 0, 0, W, H); },
  base(){ return bgSalone || buildBgSalone(); },
  ents(t){
    const A = SALONE.aisle, out = [];
    SALONE.pillarsN.forEach(x => out.push({ y:A[0] - 4, draw:() => salonePillar(x, A[0] - 18) }));
    SALONE.pillarsS.forEach(x => out.push({ y:A[1] + 22, draw:() => salonePillar(x, A[1] + 8) }));
    if (SALONE.taste) out.push({ y:A[0] - 20, draw:saloneTaste });
    SALONE.lamps.forEach(([x, y]) => out.push({ y:9000, draw:() => saloneLamp(x, y, t) }));
    return out;
  },
};
