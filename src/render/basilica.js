/* The basilica's drawing (scene 'basilica', world/basilica.js): the background (built lazily: the patterned marble floor, the
   coloured light of the high windows on it, the pews, the great piers, the chapel of the saint's tomb behind its brass rail,
   the stand of votive candles, the raised sanctuary with the high altar, its candles and the apse, the sacristy door and a
   confessional, the wooden inner porch with its gap, the vestibule and the open doors), and its own light pass at all times
   (SCENE_ART.basilica.night): dim, with warm pools at the candles, the altar and the tomb, the red sanctuary lamp, daylight at
   the doors; the candle flames flicker on top (one more once you have lit yours: BASILICA.lit). */
let bgBasilica = null, BASILICA_LIGHT = null;
function buildBgBasilica(){
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const r = rng(1231), B = BASILICA;
  /* the floor: diamonds of red, cream and grey marble */
  g.fillStyle = '#d9cdb6'; g.fillRect(0, 0, W, H);
  const D = 30;
  for (let y = -D, row = 0; y < H + D; y += D / 2, row++) for (let x = (row % 2) * D / 2 - D; x < W + D; x += D){
    const k = (Math.floor(x / D) + row) % 3, l = r() * 5;
    g.fillStyle = k === 0 ? `hsl(12, 45%, ${44 + l}%)` : k === 1 ? `hsl(40, 35%, ${86 + l * 0.5}%)` : `hsl(40, 6%, ${62 + l}%)`;
    g.beginPath(); g.moveTo(x, y - D / 2); g.lineTo(x + D / 2, y); g.lineTo(x, y + D / 2); g.lineTo(x - D / 2, y); g.closePath(); g.fill();
  }
  /* the central aisle: a long runner of red stone with a border */
  g.fillStyle = '#9a4a36'; g.fillRect(452, 180, 56, B.wall - 180); g.strokeStyle = '#e8dcc0'; g.lineWidth = 3; g.strokeRect(452, 180, 56, B.wall - 180);
  /* the coloured light of the high windows, falling across the floor */
  [[300, 214, '#5a7ad0'], [660, 214, '#d05a5a'], [300, 444, '#e0b040'], [660, 444, '#5aa070']].forEach(([x, y, col]) => {
    g.save(); g.globalAlpha = 0.16; g.fillStyle = col; g.beginPath(); g.moveTo(x - 30, y - 30); g.lineTo(x + 40, y - 30); g.lineTo(x + 70, y + 20); g.lineTo(x, y + 20); g.closePath(); g.fill(); g.restore(); });
  /* the side walls: thick masonry */
  g.fillStyle = '#8a7a64'; g.fillRect(0, 0, W, 34); g.fillRect(0, 0, 10, B.wall); g.fillRect(W - 10, 0, 10, B.wall);
  /* the chapel of the tomb: a raised floor of white marble, the Arca, flowers, notes and photos left by pilgrims */
  const Ch = B.chapel;
  g.fillStyle = '#efe9dc'; g.fillRect(Ch.x + 10, Ch.y, Ch.w - 10, Ch.h);
  g.strokeStyle = '#c9bfa8'; g.lineWidth = 1; for (let y = Ch.y; y < Ch.y + Ch.h; y += 24){ g.beginPath(); g.moveTo(Ch.x + 10, y); g.lineTo(Ch.x + Ch.w, y); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.2)'; rr(g, 30, 222, 66, 86, 4); g.fill();
  g.fillStyle = '#5a7a6a'; rr(g, 26, 216, 66, 86, 4); g.fill();
  g.fillStyle = '#f2ece0'; rr(g, 32, 222, 54, 74, 3); g.fill();
  [[34, 224], [80, 224], [34, 290], [80, 290]].forEach(([x, y]) => { g.fillStyle = '#c9a24a'; circ(g, x, y, 4); g.fill(); });
  g.fillStyle = '#c9a24a'; g.font = '700 7px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('S. ANTONIO', 59, 259);
  [[100, 214, '#e0405a'], [100, 304, '#f4f0e0'], [24, 312, '#f4b928']].forEach(([x, y, col]) => { g.fillStyle = '#4f7a3a'; circ(g, x, y, 7); g.fill(); for (let k = 0; k < 5; k++){ g.fillStyle = col; circ(g, x + Math.cos(k * 1.3) * 4, y + Math.sin(k * 1.3) * 4, 2.2); g.fill(); } });
  for (let k = 0; k < 9; k++){ g.fillStyle = k % 3 ? '#fffdf8' : '#d8e0e8'; g.save(); g.translate(98 + (k % 3) * 6, 236 + Math.floor(k / 3) * 16); g.rotate((r() - 0.5) * 0.5); g.fillRect(-4, -5, 8, 10); g.restore(); }
  /* the brass rail */
  g.fillStyle = '#b8902e'; g.fillRect(B.rail.x, B.rail.y, 4, B.rail.h); g.fillStyle = '#e0c060'; g.fillRect(B.rail.x, B.rail.y, 2, B.rail.h);
  for (let y = B.rail.y; y < B.rail.y + B.rail.h; y += 14){ g.fillStyle = '#8a6a1e'; circ(g, B.rail.x + 2, y, 2.6); g.fill(); }
  /* the stand of votive candles: an iron frame in three tiers, the offering box */
  const Cd = B.candles;
  g.fillStyle = 'rgba(0,0,0,.25)'; rr(g, Cd.x + 3, Cd.y + 4, Cd.w, Cd.h, 3); g.fill();
  g.fillStyle = '#2b2620'; rr(g, Cd.x, Cd.y, Cd.w, Cd.h, 3); g.fill();
  for (let row = 0; row < 3; row++) for (let k = 0; k < 6; k++){ g.fillStyle = '#e8e0cc'; circ(g, Cd.x + 6 + k * 8, Cd.y + 6 + row * 8, 2.8); g.fill(); g.fillStyle = '#c9c0a8'; circ(g, Cd.x + 6 + k * 8, Cd.y + 6 + row * 8, 1.6); g.fill(); }
  g.fillStyle = '#6b4a2a'; rr(g, Cd.x + Cd.w + 4, Cd.y + 6, 14, 18, 2); g.fill(); g.fillStyle = '#1a1410'; g.fillRect(Cd.x + Cd.w + 8, Cd.y + 9, 6, 2);
  g.fillStyle = '#f5f1e8'; g.font = '700 5.5px "Titillium Web", sans-serif'; g.fillText('OFFERTE', Cd.x + Cd.w + 11, Cd.y + 18);
  /* the pews: dark wooden benches with a kneeler */
  const P = B.pews;
  P.rows.forEach(y => [P.left, P.right].forEach(([x0, x1]) => {
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x0 + 2, y + 3, x1 - x0, 12);
    g.fillStyle = '#5a3a24'; g.fillRect(x0, y, x1 - x0, 12); g.fillStyle = '#7a5234'; g.fillRect(x0, y, x1 - x0, 4);
    g.fillStyle = '#3a2416'; g.fillRect(x0, y + 15, x1 - x0, 4); g.fillRect(x0, y - 1, 5, 20); g.fillRect(x1 - 5, y - 1, 5, 20);
  }));
  /* the inner porch (la bussola): wooden panels with the gap; the vestibule; the doors open to the daylight */
  g.fillStyle = '#6a4a2e'; g.fillRect(0, B.wall, B.gap.x, 16); g.fillRect(B.gap.x + B.gap.w, B.wall, W, 16);
  g.fillStyle = '#8a643e'; for (let x = 6; x < W; x += 30) if (x < B.gap.x - 20 || x > B.gap.x + B.gap.w + 4) g.fillRect(x, B.wall + 3, 22, 10);
  g.fillStyle = '#8a7a64'; g.fillRect(0, B.wall + 16, 320, H); g.fillRect(640, B.wall + 16, W, H);
  g.fillStyle = '#cfc4ae'; g.fillRect(320, B.wall + 16, 320, H);
  const day = g.createLinearGradient(0, H, 0, 520); day.addColorStop(0, 'rgba(255,244,214,.9)'); day.addColorStop(1, 'rgba(255,244,214,0)');
  g.fillStyle = day; g.fillRect(400, 520, 160, 80);
  g.fillStyle = '#5a3a24'; g.fillRect(372, 590, 30, 10); g.fillRect(558, 590, 30, 10);
  /* the holy-water stoup by the gap */
  g.fillStyle = '#bdb3a0'; circ(g, 410, 500, 10); g.fill(); g.fillStyle = '#9ab8c8'; circ(g, 410, 500, 6); g.fill();
  /* the volunteer's little table: leaflets */
  g.fillStyle = '#6a4a2e'; rr(g, 580, 510, 44, 22, 2); g.fill(); g.fillStyle = '#f5f1e8'; [[588, 516], [602, 518], [612, 514]].forEach(([x, y]) => g.fillRect(x, y, 8, 10));
  /* the sanctuary: raised, white marble, three steps; the high altar with its cloth and six tall candles; the apse */
  const Al = B.altar;
  g.fillStyle = '#8a7a64'; g.beginPath(); g.moveTo(Al.x - 10, 34); g.quadraticCurveTo(480, -40, Al.x + Al.w + 10, 34); g.closePath(); g.fill();
  g.fillStyle = '#ece4d2'; g.fillRect(Al.x, Al.y, Al.w, Al.h);
  for (let k = 0; k < 3; k++){ g.fillStyle = k % 2 ? '#d8cdb6' : '#e4dac4'; g.fillRect(Al.x - 6 - k * 6, Al.y + Al.h - 4 + k * 5, Al.w + 12 + k * 12, 5); }
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(404, 86, 156, 40);
  g.fillStyle = '#f7f3ea'; g.fillRect(400, 82, 160, 38); g.fillStyle = '#c9a24a'; g.fillRect(400, 116, 160, 4);
  g.fillStyle = '#8a6a1e'; g.fillRect(476, 70, 8, 26); g.fillRect(468, 76, 24, 5);
  [410, 432, 454, 506, 528, 550].forEach(x => { g.fillStyle = '#c9a24a'; circ(g, x, 90, 3.5); g.fill(); g.fillStyle = '#fffdf8'; g.fillRect(x - 1.5, 84, 3, 6); });
  /* Donatello's bronzes on the altar's sides (dark figures) */
  [[340, 70], [370, 64], [590, 64], [620, 70]].forEach(([x, y]) => { g.fillStyle = '#3a3226'; circ(g, x, y, 7); g.fill(); g.fillStyle = '#5a4a36'; circ(g, x - 1, y - 2, 3); g.fill(); });
  /* the piers */
  B.piers.forEach(([x, y]) => { g.fillStyle = 'rgba(0,0,0,.28)'; circ(g, x + 4, y + 5, 25); g.fill(); g.fillStyle = '#b8a888'; circ(g, x, y, 24); g.fill(); g.fillStyle = '#d4c6a8'; circ(g, x - 5, y - 5, 14); g.fill(); g.strokeStyle = '#8a7a5a'; g.lineWidth = 2; circ(g, x, y, 24); g.stroke(); });
  /* the sacristy door; a confessional against the right wall */
  g.fillStyle = '#5a3a24'; g.fillRect(902, 42, 56, 56); g.fillStyle = '#7a5234'; g.fillRect(908, 48, 20, 46); g.fillRect(932, 48, 20, 46); g.fillStyle = '#c9a24a'; circ(g, 929, 72, 2.2); g.fill();
  g.fillStyle = '#f5f1e8'; rr(g, 896, 102, 62, 14, 2); g.fill(); g.fillStyle = '#5a4a32'; g.font = '700 7px "Titillium Web", sans-serif'; g.fillText('SACRESTIA', 927, 109);
  g.fillStyle = '#4a2e1c'; g.fillRect(912, 300, 40, 76); g.fillStyle = '#6a4a2e'; g.fillRect(916, 304, 32, 20); g.fillRect(916, 330, 32, 20); g.fillRect(916, 354, 32, 18);
  bgBasilica = c;
  return c;
}
/* the light: a dim layer with holes where the light is, and the warm and coloured glows (built once) */
function buildBasilicaLight(){
  const mk = () => { const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR; const g = c.getContext('2d'); g.scale(DPR, DPR); return [c, g]; };
  const [dark, d] = mk(), [glow, g] = mk();
  d.fillStyle = 'rgba(22,14,8,.56)'; d.fillRect(0, 0, W, H);
  d.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r, a) => { const gr = d.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = gr; d.fillRect(x - r, y - r, 2 * r, 2 * r); };
  hole(480, 96, 180, 0.75); hole(208, 228, 110, 0.8); hole(60, 260, 100, 0.7); hole(480, 590, 140, 0.9);
  [[300, 214], [660, 214], [300, 444], [660, 444]].forEach(([x, y]) => hole(x + 20, y - 4, 70, 0.45));
  hole(860, 210, 80, 0.4);
  const pool = (x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
  pool(480, 96, 150, 'rgba(255,190,100,.22)'); pool(208, 228, 90, 'rgba(255,170,80,.30)'); pool(60, 260, 80, 'rgba(255,200,120,.18)');
  pool(560, 150, 30, 'rgba(230,40,30,.45)');
  return BASILICA_LIGHT = { dark, glow };
}
/* the candle flames (they flicker; the votive stand: 9 lit, plus the player's) and the red sanctuary lamp */
function basilicaFlames(t){
  const B = BASILICA, Cd = B.candles;
  const flame = (x, y, k) => { const f = RM ? 1 : 0.8 + Math.sin(t * 9 + k * 2.3) * 0.15 + Math.sin(t * 23 + k) * 0.08;
    const gl = ctx.createRadialGradient(x, y, 0, x, y, 9 * f); gl.addColorStop(0, 'rgba(255,200,110,.55)'); gl.addColorStop(1, 'rgba(255,200,110,0)'); ctx.fillStyle = gl; ctx.fillRect(x - 10, y - 10, 20, 20);
    ctx.fillStyle = '#ffd77a'; ell(ctx, x, y - 1, 1.6, 2.8 * f); ctx.fill(); ctx.fillStyle = '#fff6d0'; ell(ctx, x, y - 0.5, 0.8, 1.4 * f); ctx.fill(); };
  const on = [0, 2, 3, 5, 7, 8, 10, 13, 16].concat(B.lit ? [11] : []);
  on.forEach(i => flame(Cd.x + 6 + (i % 6) * 8, Cd.y + 5 + Math.floor(i / 6) * 8, i));
  [410, 432, 454, 506, 528, 550].forEach((x, k) => flame(x, 82, k + 20));
  const lamp = RM ? 1 : 0.85 + Math.sin(t * 2.1) * 0.1;
  ctx.fillStyle = `rgba(220,40,30,${0.9 * lamp})`; circ(ctx, 560, 150, 4.5); ctx.fill();
}
SCENE_ART.basilica = {
  back(){ if (!bgBasilica) buildBgBasilica(); ctx.drawImage(bgBasilica, 0, 0, W, H); },
  base(){ return bgBasilica || buildBgBasilica(); },
  probe(){
    const base = bgBasilica || buildBgBasilica(), L = BASILICA_LIGHT || buildBasilicaLight();
    const c = document.createElement('canvas'); c.width = W / 4; c.height = H / 4; const g = c.getContext('2d');
    g.drawImage(base, 0, 0, c.width, c.height); g.drawImage(L.dark, 0, 0, c.width, c.height); g.globalCompositeOperation = 'lighter'; g.drawImage(L.glow, 0, 0, c.width, c.height);
    const d = g.getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += (d[i] + d[i + 1] + d[i + 2]) / 3; return s / (d.length / 4);
  },
  /* its own light, at all times */
  night(){
    const L = BASILICA_LIGHT || buildBasilicaLight();
    ctx.save(); ctx.drawImage(L.dark, 0, 0, W, H); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(L.glow, 0, 0, W, H); ctx.restore();
    basilicaFlames(performance.now() / 1000);
  },
};
