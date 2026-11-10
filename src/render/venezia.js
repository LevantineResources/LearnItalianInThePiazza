/* Venice's drawing (Lesson 15; layouts in world/venezia.js). Top-down, in the game's flat warm style:
   - santalucia: the end of the platforms (the Laguna Express at its buffers on binario 3), the hall, the information desk, the bar.
   - ferrovia: the façade, the steps, the fondamenta, the Grand Canal (water moving, boats going by, San Simeone Piccolo's dome on
     the far bank, the Ponte degli Scalzi), the ACTV booth (its glass in the depth-sorted pass), the pontoon "Ferrovia B", the gate
     with its two ticket readers, the bench, the vaporetto alongside when it has come in.
   - vaporetto: the eye-level views of the cutscenes, painted in code like Lesson 14's lagoon in the train's windows:
     'board' (on the pontoon: the boat alongside, people boarding, Margaret with Biscuit in her arms, San Simeone across the water),
     'canal' (down the Grand Canal: the palaces on both banks in perspective, gondolas, the Rialto bridge coming up and passing
     overhead), 'bacino' (out into the basin: the Doge's Palace, the campanile, the domes of San Marco, the columns, San Giorgio
     across the water, the stop coming closer). VEN.view (world/venezia.js) says which and how far along. */
let bgVSL = null, bgFer = null;
const VNC = { stone:'#e8e1d2', stoneD:'#cfc5b0', ist:'#f1ece0', brick:'#b8664a', water:'#3f8a8e', waterD:'#2f6f75', waterL:'#6fb3b0',
  navy:'#1c2848', navyD:'#121a33', cream:'#efe6d0', actv:'#f2c230', actvB:'#1f4e8a', wood:'#7a5233', woodD:'#5a3a22' };
function venCanvas(){ const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR; const g = c.getContext('2d'); g.scale(DPR, DPR); return [c, g]; }
const venText = (g, s, x, y, font, col, align = 'center') => { g.font = font; g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(s, x, y); };

/* ---------- Santa Lucia: the platforms' end and the hall ---------- */
function buildBgSantaLucia(){
  const [c, g] = venCanvas(), r = rng(1515), T = VSL;
  /* the hall's floor: big pale slabs, a darker band to the doors */
  g.fillStyle = '#d9d2c2'; g.fillRect(0, 0, W, H);
  for (let y = T.hallTop, row = 0; y < H; y += 40, row++) for (let x = -(row % 2) * 40; x < W; x += 80){
    const l = r(); g.fillStyle = `hsl(40, ${6 + l * 6}%, ${80 + l * 7}%)`; rr(g, x + 1, y + 1, 78, 38, 2); g.fill();
  }
  g.fillStyle = 'rgba(160,140,110,.14)'; g.fillRect(340, T.hallTop, 280, H - T.hallTop);
  /* the tracks to either side of our platform, with more tracks and platforms beyond */
  const track = (x, w) => {
    g.fillStyle = '#7d7468'; g.fillRect(x, 0, w, T.hallTop - 8);
    for (let k = 0; k < 120; k++){ g.fillStyle = r() < 0.5 ? 'rgba(40,36,30,.35)' : 'rgba(190,180,160,.3)'; g.fillRect(x + r() * w, r() * (T.hallTop - 10), 2, 2); }
    for (let y = 4; y < T.hallTop - 14; y += 12){ g.fillStyle = '#5b4a3a'; g.fillRect(x + 4, y, w - 8, 6); }
    g.fillStyle = '#c8ccd2'; g.fillRect(x + 14, 0, 3, T.hallTop - 14); g.fillRect(x + w - 17, 0, 3, T.hallTop - 14);
    g.fillStyle = '#c23b2a'; g.fillRect(x + 6, T.hallTop - 22, w - 12, 10); g.fillStyle = '#fffdf8'; for (let xx = x + 8; xx < x + w - 8; xx += 10) g.fillRect(xx, T.hallTop - 22, 5, 10);
  };
  const plat = (x, w) => { g.fillStyle = '#cfc6b3'; g.fillRect(x, 0, w, T.hallTop);
    for (let y = 0, row = 0; y < T.hallTop; y += 24, row++) for (let xx = x + (row % 2) * 12; xx < x + w; xx += 24){ const l = r(); g.fillStyle = `hsl(40, 10%, ${76 + l * 7}%)`; g.fillRect(xx + 1, y + 1, 22, 22); }
    g.fillStyle = '#f4b928'; g.fillRect(x + 6, 0, 4, T.hallTop - 12); g.fillRect(x + w - 10, 0, 4, T.hallTop - 12); };
  plat(0, 60); track(60, 60); plat(120, 116); track(T.track2.x, T.track2.w); plat(T.platform.x, T.platform.w); track(T.track.x, T.track.w); plat(624, 120); track(744, 60); plat(804, 156);
  /* the canopy's pillars on the platforms, a bench, the number signs */
  T.pillars.forEach(([x, y]) => { g.fillStyle = '#6b6f78'; g.fillRect(x - 4, y - 4, 8, 8); });
  g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, 333, 72, 22, 54, 3); g.fill(); g.fillStyle = '#7a5a3a'; rr(g, 330, 70, 22, 54, 3); g.fill();
  [[300, '2'], [528, '3']].forEach(([x, n]) => { g.fillStyle = '#1f3f7a'; rr(g, x, 150, 26, 26, 4); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.4; rr(g, x + 2, 152, 22, 22, 3); g.stroke(); venText(g, n, x + 13, 163.5, '800 15px "Titillium Web", sans-serif', '#fff'); });
  /* the regional on binario 4 (red and grey) */
  g.fillStyle = 'rgba(0,0,0,.25)'; rr(g, 747, -10, 58, 168, 8); g.fill();
  g.fillStyle = '#c9ccd2'; rr(g, 744, -14, 58, 168, 8); g.fill(); g.fillStyle = '#c23b2a'; g.fillRect(744, 20, 58, 10); g.fillStyle = '#4a5462'; g.fillRect(756, -14, 34, 160);
  for (let y = 0; y < 140; y += 24){ g.fillStyle = 'rgba(160,200,230,.6)'; g.fillRect(746, y, 4, 14); g.fillRect(796, y, 4, 14); }
  /* the barrier line at the platforms' end: low gates with the gaps to the platforms */
  g.fillStyle = '#8b8f98'; g.fillRect(0, T.hallTop - 4, T.platform.x + 30, 6); g.fillRect(T.platform.x + T.platform.w - 30, T.hallTop - 4, W, 6);
  /* the hall's side walls */
  g.fillStyle = '#b9ae96'; g.fillRect(0, T.hallTop, 28, H); g.fillRect(W - 24, T.hallTop, 24, H);
  /* the information desk: the back wall, the clerk's floor, the counter with its sign */
  const D = T.desk;
  g.fillStyle = '#e9e1cf'; g.fillRect(D.x, D.y - 70, D.w, 70);
  g.fillStyle = '#c9b48a'; g.fillRect(D.x, D.y - 70, D.w, 6);
  g.fillStyle = '#3a4a6a'; rr(g, D.x + 20, D.y - 56, 34, 22, 2); g.fill(); g.fillStyle = '#9cc4e4'; g.fillRect(D.x + 23, D.y - 53, 28, 16);   // a screen
  g.fillStyle = '#5a4a3a'; g.fillRect(D.x + 120, D.y - 50, 44, 14);                                                                   // leaflets
  for (let k = 0; k < 5; k++){ g.fillStyle = ['#c23b2a', '#f4b928', '#2e8b57', '#1c3d8f', '#e07a2f'][k]; g.fillRect(D.x + 122 + k * 8, D.y - 48, 6, 10); }
  g.fillStyle = 'rgba(30,20,10,.28)'; rr(g, D.x + 4, D.y + 4, D.w, D.h, 4); g.fill();
  g.fillStyle = '#1f3f7a'; rr(g, D.x, D.y, D.w, D.h, 4); g.fill();
  g.fillStyle = '#e8e2d4'; rr(g, D.x - 2, D.y - 4, D.w + 4, 12, 3); g.fill();
  const dm = D.y + D.h / 2 + 3;
  g.fillStyle = '#fffdf8'; circ(g, D.x + 26, dm, 10); g.fill(); venText(g, 'i', D.x + 26, dm + 1, 'italic 800 15px "Bodoni Moda", Georgia, serif', '#1f3f7a');
  venText(g, 'INFORMAZIONI', D.x + 106, dm, '800 12px "Titillium Web", sans-serif', '#fffdf8');
  /* the bar: the back counter, the coffee machine, shelves, the counter (marble top), the pastry case, the sign */
  const B = T.bar;
  g.fillStyle = '#efe4cc'; g.fillRect(B.x, B.y - 60, B.w, 60);
  g.fillStyle = '#6b3a22'; g.fillRect(B.x, B.y - 60, B.w, 12);
  for (let k = 0; k < 14; k++){ g.fillStyle = ['#2e6a4e', '#c9a54a', '#8a2a2a', '#d9d0bd'][k % 4]; g.fillRect(B.x + 8 + k * 15, B.y - 58, 6, 8); }
  g.fillStyle = '#9aa0aa'; rr(g, B.x + 70, B.y - 44, 70, 26, 4); g.fill(); g.fillStyle = '#c23b2a'; g.fillRect(B.x + 72, B.y - 42, 66, 5);   // the coffee machine
  g.fillStyle = '#3b3b3b'; [B.x + 82, B.x + 104, B.x + 126].forEach(x => { circ(g, x, B.y - 26, 4); g.fill(); });
  g.fillStyle = 'rgba(30,20,10,.28)'; rr(g, B.x + 4, B.y + 4, B.w, B.h, 4); g.fill();
  g.fillStyle = '#6b3a22'; rr(g, B.x, B.y, B.w, B.h, 4); g.fill();
  g.fillStyle = '#efe9dc'; rr(g, B.x - 2, B.y - 4, B.w + 4, 14, 3); g.fill(); g.strokeStyle = 'rgba(150,140,120,.4)'; g.lineWidth = 1;
  for (let k = 0; k < 9; k++){ g.beginPath(); g.moveTo(B.x + r() * B.w, B.y - 3); g.lineTo(B.x + r() * B.w, B.y + 9); g.stroke(); }
  /* the glass pastry case on the counter: cornetti in rows */
  g.fillStyle = 'rgba(200,225,235,.7)'; rr(g, B.x + 140, B.y - 6, 74, 16, 3); g.fill();
  for (let k = 0; k < 8; k++){ g.fillStyle = k % 4 === 3 ? '#8a5a33' : '#d9a050'; ell(g, B.x + 148 + k * 8.5, B.y + 2, 3.8, 2.6, 0.4); g.fill(); }
  g.fillStyle = '#1c3d8f'; rr(g, B.x + 20, B.y + 11, 118, 16, 3); g.fill(); venText(g, 'BAR · CAFFETTERIA', B.x + 79, B.y + 19.5, '800 10px "Titillium Web", sans-serif', '#f4b928');
  /* the bar's tables and chairs */
  T.tables.forEach(([x, y]) => {
    [[-22, 0], [22, 0], [0, -22], [0, 22]].forEach(([dx, dy]) => { g.fillStyle = '#7a5233'; rr(g, x + dx - 7, y + dy - 7, 14, 14, 3); g.fill(); });
    g.fillStyle = 'rgba(30,20,10,.25)'; circ(g, x + 3, y + 3, 17); g.fill(); g.fillStyle = '#f2ede2'; circ(g, x, y, 16); g.fill(); g.strokeStyle = '#b5ab92'; g.lineWidth = 2; g.stroke();
  });
  /* the departures board, hanging over the hall (its shadow on the floor) */
  const Bo = T.board;
  g.fillStyle = 'rgba(30,20,10,.18)'; g.fillRect(Bo.x + 10, Bo.y + 40, Bo.w, 10);
  g.fillStyle = '#16181f'; rr(g, Bo.x, Bo.y, Bo.w, Bo.h + 18, 3); g.fill();
  venText(g, 'PARTENZE', Bo.x + 8, Bo.y + 8, '800 8px "Titillium Web", sans-serif', '#f4b928', 'left');
  ['9:12 PADOVA', '9:25 TRIESTE', '9:40 MILANO'].forEach((s, k) => venText(g, s, Bo.x + 8 + k * 52, Bo.y + 25, '700 7px "Titillium Web", sans-serif', '#f7e7a8', 'left'));
  /* the round column with the city map, the benches */
  g.fillStyle = 'rgba(30,20,10,.25)'; circ(g, 474, 434, 22); g.fill(); g.fillStyle = '#e9e1cf'; circ(g, 470, 430, 22); g.fill(); g.strokeStyle = '#b9ae96'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#7fb3c9'; circ(g, 470, 430, 13); g.fill(); g.fillStyle = '#e9dcb8'; ell(g, 466, 428, 8, 5, 0.7); g.fill(); venText(g, 'VENEZIA', 470, 452, '700 7px "Titillium Web", sans-serif', '#5a4a3a');
  T.benches.forEach(({ x, y }) => { g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, x + 3, y + 3, 90, 16, 3); g.fill(); g.fillStyle = '#7a5233'; rr(g, x, y, 90, 16, 3); g.fill(); g.fillStyle = '#9a7048'; for (let k = 0; k < 4; k++) g.fillRect(x + 4 + k * 22, y + 2, 18, 12); });
  /* the glass doors at the bottom, with the light off the canal coming in */
  g.fillStyle = '#8e836f'; g.fillRect(28, H - 10, W - 52, 10);
  for (let x = T.doorsX[0]; x < T.doorsX[1]; x += 48){ g.fillStyle = 'rgba(150,215,225,.75)'; g.fillRect(x + 2, H - 9, 42, 8); }
  const lg = g.createLinearGradient(0, H - 90, 0, H); lg.addColorStop(0, 'rgba(255,250,220,0)'); lg.addColorStop(1, 'rgba(255,250,220,.4)');
  g.fillStyle = lg; g.fillRect(T.doorsX[0], H - 90, T.doorsX[1] - T.doorsX[0], 80);
  return bgVSL = c;
}
/* the night train at its buffers on binario 3 (the Laguna Express: navy, a cream band, brass) */
function venTrain(){
  const x = VSL.track.x + 4, w = VSL.track.w - 8, C = VNC;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; rr(ctx, x + 4, -10, w, 196, 10); ctx.fill();
  ctx.fillStyle = C.navy; rr(ctx, x, -14, w, 196, 10); ctx.fill();
  ctx.fillStyle = C.navyD; ctx.fillRect(x + 10, -14, w - 20, 192);
  ctx.fillStyle = '#c9a54a'; ctx.fillRect(x, 60, w, 3); ctx.fillRect(x, 64 + 2, w, 1);
  ctx.fillStyle = C.cream; ctx.fillRect(x + 4, 150, w - 8, 16);
  venText(ctx, 'LAGUNA EXPRESS', x + w / 2, 158.5, '800 6.5px "Titillium Web", sans-serif', C.navy);
  for (let y = 0; y < 140; y += 22){ ctx.fillStyle = 'rgba(255,220,150,.55)'; ctx.fillRect(x + 1, y, 4, 12); ctx.fillRect(x + w - 5, y, 4, 12); }
  ctx.fillStyle = '#efe6d0'; rr(ctx, x + w - 8, 104, 8, 22, 2); ctx.fill();          // the open door, on the platform side (west)…
  ctx.fillStyle = '#c9a54a'; ctx.fillRect(x - 3, 108, 4, 14);                          // …and its handrail
}
SCENE_ART.santalucia = {
  back(){ if (!bgVSL) buildBgSantaLucia(); ctx.drawImage(bgVSL, 0, 0, W, H); venTrain(); },
  base(){ return bgVSL || buildBgSantaLucia(); },
  night(){},
  ents(){ return []; },
};

/* ---------- outside: the façade, the steps, the fondamenta, the canal ---------- */
function buildBgFerrovia(){
  const [c, g] = venCanvas(), r = rng(2626), F = VFER;
  /* the fondamenta: grey trachyte slabs (masegni), the white Istrian stone edge along the water */
  g.fillStyle = '#a9a39a'; g.fillRect(0, 0, W, H);
  for (let y = F.quay.y0, row = 0; y < F.quay.y1; y += 18, row++) for (let x = -(row % 3) * 14; x < W; x += 42){
    const l = r(); g.fillStyle = `hsl(30, ${4 + l * 5}%, ${58 + l * 10}%)`; rr(g, x + 1, y + 1, 40, 16, 1.5); g.fill();
  }
  g.fillStyle = VNC.ist; g.fillRect(0, F.quay.y1 - 8, W, 10); g.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 0; x < W; x += 36) g.fillRect(x, F.quay.y1 - 8, 2, 10);
  /* the steps: bands of white stone, each with its shadow */
  const S0 = F.steps;
  for (let y = S0.y0, k = 0; y < S0.y1; y += 13, k++){ g.fillStyle = k % 2 ? '#ece6d8' : '#e2dccd'; g.fillRect(S0.x, y, S0.w, 13); g.fillStyle = 'rgba(80,60,40,.16)'; g.fillRect(S0.x, y + 11, S0.w, 2); }
  /* beside the steps: a low wall and a stone terrace with planters (left), the wall with its railing (right) */
  g.fillStyle = '#d8d0bf'; g.fillRect(0, F.facade, S0.x, S0.y1 - F.facade); g.fillRect(S0.x + S0.w, F.facade, W - S0.x - S0.w, S0.y1 - F.facade);
  g.fillStyle = '#c4baa5'; g.fillRect(S0.x - 6, F.facade, 6, S0.y1 - F.facade); g.fillRect(S0.x + S0.w, F.facade, 6, S0.y1 - F.facade);
  [[60, 160], [870, 150], [760, 176]].forEach(([x, y]) => { g.fillStyle = '#b5ab92'; rr(g, x - 26, y - 16, 52, 32, 4); g.fill(); g.fillStyle = '#4f7a3d'; ell(g, x, y, 22, 12); g.fill(); g.fillStyle = '#6f9a55'; ell(g, x - 5, y - 3, 9, 5); g.fill(); g.fillStyle = '#e0405a'; [[-10, 2], [6, -4], [12, 4]].forEach(([dx, dy]) => { circ(g, x + dx, y + dy, 2.2); g.fill(); }); });
  /* the station's façade: white stone, the long band of windows, the canopy, the name */
  g.fillStyle = '#efe9db'; g.fillRect(0, 0, W, F.facade);
  g.fillStyle = '#d9d1bf'; g.fillRect(0, F.facade - 8, W, 8);
  g.fillStyle = '#2f3a48'; g.fillRect(40, 26, W - 80, 52);
  for (let x = 40; x < W - 40; x += 32){ g.fillStyle = 'rgba(150,200,215,.38)'; g.fillRect(x + 3, 29, 26, 46); g.fillStyle = '#e8e2d4'; g.fillRect(x, 26, 3, 52); }
  g.fillStyle = '#e8e2d4'; g.fillRect(40, 50, W - 80, 3);
  venText(g, 'STAZIONE  DI  VENEZIA  SANTA  LUCIA', W / 2, 13, '800 12px "Titillium Web", sans-serif', '#4a4a4a');
  g.fillStyle = 'rgba(30,20,10,.22)'; g.fillRect(330, F.facade - 4, 300, 12);
  g.fillStyle = '#8b9098'; g.fillRect(320, 80, 320, 22); g.fillStyle = '#a3a8b0'; g.fillRect(320, 80, 320, 4);   // the canopy over the doors
  for (let x = 380; x < 580; x += 50){ g.fillStyle = 'rgba(160,215,230,.8)'; g.fillRect(x + 3, 102, 44, 8); }
  /* the Grand Canal */
  const wg = g.createLinearGradient(0, F.quay.y1, 0, H); wg.addColorStop(0, '#3a7f84'); wg.addColorStop(1, '#2e6c72');
  g.fillStyle = wg; g.fillRect(0, F.quay.y1 + 2, W, H - F.quay.y1);
  /* the far bank at the very bottom: San Simeone Piccolo's green dome, roofs */
  roofs(g, 300, 584, 660, 30, '#a5462b', r);
  g.fillStyle = '#e9e1cf'; g.fillRect(70, 572, 250, 40);
  g.fillStyle = 'rgba(0,0,0,.2)'; circ(g, 200, 640, 76); g.fill();
  g.fillStyle = '#5f9a82'; circ(g, 196, 636, 72); g.fill();
  g.strokeStyle = 'rgba(30,60,50,.45)'; g.lineWidth = 2; for (let a = Math.PI * 1.05; a < Math.PI * 1.96; a += 0.18){ g.beginPath(); g.moveTo(196 + Math.cos(a) * 20, 636 + Math.sin(a) * 20); g.lineTo(196 + Math.cos(a) * 72, 636 + Math.sin(a) * 72); g.stroke(); }
  g.fillStyle = '#7fb8a0'; circ(g, 196, 636, 20); g.fill(); g.fillStyle = '#efe6d0'; circ(g, 196, 636, 9); g.fill();
  /* the Ponte degli Scalzi on the left: white stone, its balustrades, the steps going down over the water */
  g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(4, 228, 66, H - 228);
  g.fillStyle = '#ebe5d6'; g.fillRect(0, 226, 62, H - 226);
  for (let y = 236; y < H; y += 12){ g.fillStyle = 'rgba(80,60,40,.14)'; g.fillRect(0, y, 62, 2); }
  g.fillStyle = '#d2c9b4'; g.fillRect(56, 226, 8, H - 226); for (let y = 232; y < H; y += 10){ g.fillStyle = '#f5f1e6'; g.fillRect(57, y, 6, 5); }
  /* mooring poles (pali): striped, in clusters */
  [[110, 418], [126, 414], [584, 420], [600, 426], [950, 470], [334, 410]].forEach(([x, y], k) => { venPalo(g, x, y, ['#c23b2a', '#1c3d8f', '#2e8b57'][k % 3]); });
  /* the pontoon (Ferrovia B): the dark deck, its rail, the roof's edge (the shelter), the sign; the gangway's planks */
  const P = F.pontoon, Gw = F.gangway;
  g.fillStyle = 'rgba(0,0,0,.28)'; rr(g, P.x + 5, P.y + 6, P.w, P.h, 6); g.fill();
  g.fillStyle = '#3a3f46'; rr(g, P.x, P.y, P.w, P.h, 6); g.fill();
  g.fillStyle = '#6b6258'; rr(g, P.x + 6, P.y + 6, P.w - 12, P.h - 12, 4); g.fill();
  for (let x = P.x + 10; x < P.x + P.w - 10; x += 9){ g.fillStyle = 'rgba(30,20,10,.25)'; g.fillRect(x, P.y + 6, 1.5, P.h - 12); }
  g.fillStyle = 'rgba(200,205,210,.55)'; rr(g, P.x + 20, P.y + 16, P.w - 40, 30, 4); g.fill();          // the shelter's roof (glass)
  g.strokeStyle = '#8b9098'; g.lineWidth = 2; rr(g, P.x + 20, P.y + 16, P.w - 40, 30, 4); g.stroke();
  g.fillStyle = VNC.actv; rr(g, P.x + P.w - 96, P.y + 52, 84, 20, 3); g.fill(); venText(g, 'FERROVIA  B', P.x + P.w - 54, P.y + 62.5, '800 10px "Titillium Web", sans-serif', '#1b1b1b');
  g.fillStyle = '#fffdf8'; rr(g, P.x + 18, P.y + 52, 54, 20, 3); g.fill(); venText(g, '1 · 2', P.x + 45, P.y + 62.5, '800 11px "Titillium Web", sans-serif', VNC.actvB);
  g.fillStyle = '#7a6a58'; g.fillRect(Gw.x, F.quay.y1 - 4, Gw.w, Gw.y1 - F.quay.y1 + 8);
  for (let y = F.quay.y1; y < Gw.y1; y += 7){ g.fillStyle = 'rgba(30,20,10,.3)'; g.fillRect(Gw.x, y, Gw.w, 1.5); }
  g.fillStyle = '#8b9098'; g.fillRect(Gw.x - 3, F.quay.y1 - 4, 3, Gw.y1 - F.quay.y1 + 8); g.fillRect(Gw.x + Gw.w, F.quay.y1 - 4, 3, Gw.y1 - F.quay.y1 + 8);
  /* the bench by the water: wooden slats on stone feet */
  const Bn = F.bench;
  g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, Bn.x + 3, Bn.y + 3, Bn.w, Bn.h, 3); g.fill();
  g.fillStyle = VNC.woodD; rr(g, Bn.x, Bn.y, Bn.w, Bn.h, 3); g.fill(); g.fillStyle = VNC.wood; for (let k = 0; k < 4; k++) g.fillRect(Bn.x + 3 + k * 22, Bn.y + 2, 20, Bn.h - 4);
  /* the ACTV booth: its roof, the walls, the window (the glass is drawn in front, in the pass) */
  const Bt = F.booth;
  g.fillStyle = 'rgba(30,20,10,.28)'; rr(g, Bt.x + 5, Bt.y + 5, Bt.w, Bt.h, 5); g.fill();
  g.fillStyle = '#efe9db'; rr(g, Bt.x, Bt.y, Bt.w, Bt.h, 5); g.fill();
  g.fillStyle = '#e2d9c4'; g.fillRect(Bt.x + 6, Bt.y + 24, Bt.w - 12, Bt.h - 30);
  g.fillStyle = '#5a4a3a'; g.fillRect(Bt.x + 16, Bt.y + 30, 34, 8); g.fillStyle = '#2b2b2b'; g.fillRect(Bt.x + 96, Bt.y + 28, 22, 12);   // a desk, a ticket printer
  g.fillStyle = VNC.actvB; rr(g, Bt.x - 3, Bt.y - 4, Bt.w + 6, 26, 4); g.fill();
  venText(g, 'ACTV · BIGLIETTI', Bt.x + Bt.w / 2, Bt.y + 9, '800 11px "Titillium Web", sans-serif', VNC.actv);
  /* lamp posts along the quay */
  F.lamps.forEach(([x, y]) => { g.fillStyle = 'rgba(30,20,10,.3)'; circ(g, x + 3, y + 3, 6); g.fill(); g.fillStyle = '#2b2f36'; circ(g, x, y, 5.5); g.fill(); g.fillStyle = '#f2ead8'; circ(g, x, y, 2.5); g.fill(); });
  return bgFer = c;
}
function venPalo(g, x, y, col){
  g.fillStyle = 'rgba(0,0,0,.25)'; ell(g, x + 4, y + 4, 6, 4); g.fill();
  g.fillStyle = '#fffdf8'; circ(g, x, y, 5); g.fill(); g.strokeStyle = col; g.lineWidth = 2.4; g.beginPath(); g.arc(x, y, 3.6, 0, Math.PI * 1.2); g.stroke();
  g.fillStyle = col; circ(g, x, y, 1.6); g.fill();
}
/* the water: moving ripples; a gondola and a water taxi go by on the far side, the moored gondola bobs */
function venWater(t){
  const F = VFER, y0 = F.quay.y1 + 4;
  ctx.save(); ctx.beginPath(); ctx.rect(62, y0, W - 62, 572 - y0); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 1.4;
  const off = RM ? 0 : (t * 14) % 60;
  for (let y = y0 + 10, k = 0; y < 572; y += 16, k++) for (let x = -60 + off + (k % 2) * 30; x < W; x += 60){
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 8, y - 3, x + 16, y); ctx.stroke();
  }
  ctx.restore();
  /* the moored gondola by the Scalzi */
  venGondolaTop(150, 438 + (RM ? 0 : Math.sin(t * 1.4) * 1.2), 1, 0.06);
  /* boats going by, west → east and back, at the bottom of the view */
  if (!RM){
    const c1 = (t * 26) % 1500 - 200, c2 = 1300 - (t * 40 + 700) % 1700;
    venGondolaTop(c1, 586, 1, 0);
    venTaxiTop(c2, 560);
  }
}
/* a gondola from above: long, black, curved up at both ends; the gondolier at the back */
function venGondolaTop(x, y, dir, rot){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(dir, 1);
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ell(ctx, 3, 4, 50, 8); ctx.fill();
  ctx.fillStyle = '#16161a'; ctx.beginPath(); ctx.moveTo(-54, -2); ctx.quadraticCurveTo(0, -11, 50, -1); ctx.quadraticCurveTo(0, 10, -54, -2); ctx.fill();
  ctx.fillStyle = '#c9a54a'; ctx.fillRect(40, -3, 9, 2.4);                       // the ferro on the prow
  ctx.fillStyle = '#8a2a2a'; rr(ctx, -12, -4, 16, 8, 2); ctx.fill();            // the seat
  ctx.fillStyle = '#f5f1e6'; circ(ctx, -38, -1, 4.4); ctx.fill(); ctx.strokeStyle = '#1c3d8f'; ctx.lineWidth = 1.4; for (let k = -3; k <= 3; k += 3){ ctx.beginPath(); ctx.moveTo(-42, -1 + k * 0.6); ctx.lineTo(-34, -1 + k * 0.6); ctx.stroke(); }
  ctx.fillStyle = '#e3c47a'; circ(ctx, -38, -1, 2.6); ctx.fill();               // his straw hat
  ctx.restore();
}
/* a water taxi: varnished wood, a white cabin */
function venTaxiTop(x, y){
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ell(ctx, 3, 4, 34, 9); ctx.fill();
  ctx.fillStyle = '#8a4f2c'; ctx.beginPath(); ctx.moveTo(-34, -8); ctx.lineTo(24, -8); ctx.quadraticCurveTo(40, 0, 24, 8); ctx.lineTo(-34, 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f5f1e6'; rr(ctx, -16, -6, 26, 12, 3); ctx.fill(); ctx.fillStyle = 'rgba(120,170,200,.8)'; ctx.fillRect(-13, -4, 20, 8);
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-36, -6); ctx.lineTo(-52, -10); ctx.moveTo(-36, 6); ctx.lineTo(-52, 10); ctx.stroke();
  ctx.restore();
}
/* the vaporetto from above: a long white hull, the black fender, the grey cabin roof, the line number */
function venVaporettoTop(x, y){
  const L = 280, Wd = 44;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; rr(ctx, -L / 2 + 5, -Wd / 2 + 6, L, Wd, 20); ctx.fill();
  ctx.fillStyle = '#2b2b2b'; rr(ctx, -L / 2 - 3, -Wd / 2 - 3, L + 6, Wd + 6, 22); ctx.fill();
  ctx.fillStyle = '#f2efe8'; rr(ctx, -L / 2, -Wd / 2, L, Wd, 20); ctx.fill();
  ctx.fillStyle = '#9aa0a8'; rr(ctx, -L / 2 + 44, -Wd / 2 + 6, L - 96, Wd - 12, 6); ctx.fill();
  ctx.fillStyle = '#b6bbc2'; for (let k = 0; k < 7; k++) ctx.fillRect(-L / 2 + 52 + k * 25, -Wd / 2 + 8, 18, Wd - 16);
  ctx.fillStyle = VNC.actv; rr(ctx, L / 2 - 46, -9, 18, 18, 3); ctx.fill(); venText(ctx, '2', L / 2 - 37, 0.5, '800 13px "Titillium Web", sans-serif', '#1b1b1b');
  ctx.fillStyle = '#6b6258'; ctx.fillRect(-L / 2 + 10, -Wd / 2 + 4, 28, Wd - 8);                 // the open deck at the back
  ctx.restore();
}
/* the booth's glass front, the gate, the readers (in the depth-sorted pass) */
function venFerEnts(t){
  const F = VFER, Bt = F.booth, out = [];
  out.push({ y:Bt.y + Bt.h, draw:() => {
    ctx.fillStyle = 'rgba(190,225,240,.38)'; ctx.fillRect(Bt.x + 6, Bt.y + Bt.h - 30, Bt.w - 12, 26);
    ctx.strokeStyle = '#8b9098'; ctx.lineWidth = 2; ctx.strokeRect(Bt.x + 6, Bt.y + Bt.h - 30, Bt.w - 12, 26);
    ctx.fillStyle = '#efe9db'; ctx.fillRect(Bt.x, Bt.y + Bt.h - 6, Bt.w, 8);
    ctx.fillStyle = '#e8e2d4'; ctx.fillRect(Bt.x + 30, Bt.y + Bt.h - 4, 40, 6);
    /* the price board beside the window */
    ctx.fillStyle = '#fffdf8'; rr(ctx, Bt.x + 80, Bt.y + Bt.h - 2, 52, 22, 3); ctx.fill(); ctx.strokeStyle = VNC.actvB; ctx.lineWidth = 1.5; ctx.stroke();
    venText(ctx, "75' · € 9,50", Bt.x + 106, Bt.y + Bt.h + 9, '800 8.5px "Titillium Web", sans-serif', VNC.actvB);
  } });
  F.readers.forEach((rd, i) => out.push({ y:rd.y + 8, draw:() => {
    const lit = VEN.beep[i] && performance.now() - VEN.beep[i] < 900;
    ctx.fillStyle = 'rgba(30,20,10,.3)'; ell(ctx, rd.x + 3, rd.y + 8, 9, 5); ctx.fill();
    ctx.fillStyle = '#e8e8ea'; rr(ctx, rd.x - 7, rd.y - 14, 14, 22, 3); ctx.fill(); ctx.strokeStyle = '#8b9098'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = lit || VEN.gate ? '#3ec46d' : '#2b3a48'; ctx.fillRect(rd.x - 5, rd.y - 11, 10, 7);
    ctx.fillStyle = VNC.actv; ctx.fillRect(rd.x - 5, rd.y - 1, 10, 3);
  } }));
  /* the gate's bar across the gangway (open: swung aside) */
  out.push({ y:F.quay.y1 + 2, draw:() => {
    const x = F.gangway.x, w = F.gangway.w, y = F.quay.y1 - 2;
    ctx.fillStyle = '#5a5f68'; ctx.fillRect(x - 4, y - 4, 6, 10); ctx.fillRect(x + w - 2, y - 4, 6, 10);
    if (!VEN.gate){ ctx.fillStyle = '#c23b2a'; ctx.fillRect(x, y - 1, w, 4); ctx.fillStyle = '#fffdf8'; for (let k = 0; k < w; k += 12) ctx.fillRect(x + k, y - 1, 6, 4); }
    else { ctx.fillStyle = '#c23b2a'; ctx.fillRect(x - 1, y - 1, 4, 18); }
  } });
  return out;
}
SCENE_ART.ferrovia = {
  back(t){
    if (!bgFer) buildBgFerrovia();
    ctx.drawImage(bgFer, 0, 0, W, H);
    venWater(t);
    if (VEN.boat !== 'away'){ const x = VFER.pontoon.x + VFER.pontoon.w / 2 + VEN.boatX * 900, bob = RM ? 0 : Math.sin(t * 1.2) * 1; venVaporettoTop(x, VFER.boatY + bob); }
  },
  base(){ return bgFer || buildBgFerrovia(); },
  night(){},
  ents(t){ return venFerEnts(t); },
};

/* =================== the eye-level views (scene 'vaporetto') =================== */
function venSky(g, top, bottom, warm){
  const sg = g.createLinearGradient(0, top, 0, bottom);
  sg.addColorStop(0, '#8fc0de'); sg.addColorStop(0.65, warm ? '#f3dcc0' : '#d6e8ef'); sg.addColorStop(1, warm ? '#f7e6cf' : '#eef2ea');
  g.fillStyle = sg; g.fillRect(0, top, W, bottom - top);
  g.fillStyle = 'rgba(255,255,255,.7)';
  [[150, 70, 60], [210, 64, 40], [690, 96, 70], [760, 88, 44], [470, 40, 36]].forEach(([x, y, rad]) => { ell(g, x, y, rad, rad * 0.32); g.fill(); });
}
/* water seen at eye level: bands of colour, glints, the reflections of what stands above (cols: [x0, x1, colour]) */
function venWaterEye(g, top, t, cols){
  const wg = g.createLinearGradient(0, top, 0, H); wg.addColorStop(0, '#5fa3a4'); wg.addColorStop(1, '#2c6a70');
  g.fillStyle = wg; g.fillRect(0, top, W, H - top);
  (cols || []).forEach(([x0, x1, col]) => { g.fillStyle = col; g.globalAlpha = 0.25; for (let y = top; y < top + 70; y += 6){ const w = (x1 - x0) * (1 - (y - top) / 90); g.fillRect(x0 + (Math.sin(y * 0.7 + t * 2) * 4), y, Math.max(0, w), 3); } g.globalAlpha = 1; });
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.5;
  for (let k = 0; k < 40; k++){ const y = top + 8 + ((k * 37) % (H - top - 10)), x = ((k * 211 + t * 30 * (1 + (k % 3))) % (W + 60)) - 30, w = 10 + (y - top) * 0.12;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.stroke(); }
}
/* a gothic window: a pointed arch */
function venArch(g, x, y, w, h, col){
  g.fillStyle = col; g.beginPath(); g.moveTo(x, y + h); g.lineTo(x, y + w * 0.5); g.quadraticCurveTo(x, y, x + w / 2, y - w * 0.15); g.quadraticCurveTo(x + w, y, x + w, y + w * 0.5); g.lineTo(x + w, y + h); g.closePath(); g.fill();
}
/* a gondola side on (eye level) */
function venGondolaSide(g, x, y, s, dir = 1){
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  g.fillStyle = '#121216'; g.beginPath(); g.moveTo(-70, -16); g.quadraticCurveTo(-60, 4, 0, 4); g.quadraticCurveTo(58, 4, 66, -20); g.lineTo(68, -24); g.quadraticCurveTo(56, -6, 0, -6); g.quadraticCurveTo(-56, -6, -70, -16); g.fill();
  g.fillStyle = '#d9d2c2'; g.fillRect(60, -30, 5, 12); g.fillRect(56, -28, 12, 2); g.fillRect(56, -24, 12, 2);   // the ferro
  g.fillStyle = '#8a2a2a'; g.fillRect(-12, -14, 22, 8);
  /* the gondolier, standing at the back with his oar */
  g.fillStyle = '#1b1b1b'; g.fillRect(-52, -44, 7, 38); g.fillStyle = '#f5f1e6'; g.fillRect(-54, -66, 11, 24);
  g.strokeStyle = '#1c3d8f'; g.lineWidth = 2; for (let k = -62; k < -42; k += 5){ g.beginPath(); g.moveTo(-54, k); g.lineTo(-43, k); g.stroke(); }
  g.fillStyle = '#e2b08a'; circ(g, -48.5, -71, 5); g.fill(); g.fillStyle = '#e3c47a'; g.fillRect(-57, -77, 17, 3); g.fillRect(-53, -82, 9, 6); g.fillStyle = '#c23b2a'; g.fillRect(-53, -78, 9, 2);
  g.strokeStyle = '#6b4a2a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-44, -58); g.lineTo(-20, 8); g.stroke();
  g.restore();
}
/* a person at eye level (simple): body colour, head, hair, hat?, suitcase? (x = centre, y = feet) */
function venPersonEye(g, x, y, s, o){
  g.save(); g.translate(x, y); g.scale(s, s);
  if (o.suitcase){ g.fillStyle = o.suitcase; rr(g, 14, -34, 22, 32, 3); g.fill(); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(22, -44, 6, 10); g.fillStyle = '#2b2b2b'; circ(g, 18, -1, 2.5); g.fill(); circ(g, 32, -1, 2.5); g.fill(); }
  g.fillStyle = o.legs || '#2b2f3a'; g.fillRect(-9, -44, 7, 44); g.fillRect(2, -44, 7, 44);
  g.fillStyle = o.body; rr(g, -14, -98, 28, 58, 8); g.fill();
  if (o.scarf){ g.fillStyle = o.scarf; g.fillRect(-12, -98, 24, 9); g.fillRect(4, -92, 7, 22); }
  g.fillStyle = o.skin || '#e2b08a'; circ(g, 0, -108, 11); g.fill();
  if (o.back){ g.fillStyle = o.hair; circ(g, 0, -109, 11.5); g.fill(); }
  else if (o.longHair){ g.fillStyle = o.hair; rr(g, -12, -120, 24, 26, 8); g.fill(); g.fillStyle = o.skin || '#e2b08a'; circ(g, 0, -106, 8.5); g.fill(); }
  else { g.fillStyle = o.hair; g.beginPath(); g.arc(0, -110, 11.5, Math.PI, 0); g.fill(); }
  if (o.brim){ g.fillStyle = o.brim; ell(g, 0, -118, 18, 4.5); g.fill(); rr(g, -10, -130, 20, 13, 5); g.fill(); g.fillStyle = '#c9a54a'; g.fillRect(-10, -121, 20, 3); }
  if (o.cap){ g.fillStyle = o.cap; rr(g, -12, -124, 24, 9, 4); g.fill(); g.fillRect(-2, -118, 18, 3); }
  if (o.dog){   /* Biscuit in her arms */
    g.fillStyle = '#e3c08a'; ell(g, 6, -74, 16, 10); g.fill(); circ(g, 18, -84, 8); g.fill();
    g.fillStyle = '#a8743c'; ell(g, 14, -90, 3.5, 6, -0.4); g.fill(); g.fillStyle = '#1b1210'; circ(g, 25, -84, 2); g.fill(); circ(g, 20, -87, 1.2); g.fill();
    g.fillStyle = '#c23b2a'; g.fillRect(12, -80, 9, 2.5);
    g.fillStyle = o.body; rr(g, -8, -82, 26, 8, 4); g.fill();                         // her arm round him
  }
  if (o.rope){ g.strokeStyle = '#d9c7a0'; g.lineWidth = 3; g.beginPath(); g.moveTo(12, -70); g.quadraticCurveTo(40, -30, 70, -40); g.stroke(); }
  g.restore();
}
/* the vaporetto side on (eye level): hull, the dark band, the cabin windows, the roof, the yellow number */
function venVaporettoSide(g, x, y, s){
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = '#2b2b2b'; rr(g, -330, -8, 660, 18, 9); g.fill();                    // the fender
  g.fillStyle = '#f2efe8'; g.beginPath(); g.moveTo(-320, -60); g.lineTo(300, -60); g.quadraticCurveTo(340, -40, 320, 0); g.lineTo(-310, 0); g.quadraticCurveTo(-336, -30, -320, -60); g.fill();
  g.fillStyle = '#1f2a3a'; g.fillRect(-300, -30, 600, 6);
  g.fillStyle = '#d7dadf'; rr(g, -250, -150, 470, 92, 6); g.fill();
  for (let k = 0; k < 9; k++){ g.fillStyle = 'rgba(70,110,140,.85)'; rr(g, -238 + k * 51, -138, 40, 44, 4); g.fill(); g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(-236 + k * 51, -136, 10, 40); }
  g.fillStyle = '#9aa0a8'; g.fillRect(-262, -158, 494, 12);
  g.fillStyle = VNC.actv; rr(g, 160, -196, 50, 40, 4); g.fill(); venText(g, '2', 185, -175, '800 30px "Titillium Web", sans-serif', '#1b1b1b');
  g.fillStyle = '#2b2b2b'; g.fillRect(150, -158, 70, 4);
  venText(g, 'ACTV', -150, -42, '800 18px "Titillium Web", sans-serif', '#1f2a3a');
  g.restore();
}
/* 'board': on the pontoon at Ferrovia, eye level */
function venViewBoard(g, t, k){
  venSky(g, 0, 300, true);
  /* the far bank: houses, San Simeone Piccolo's green dome on its drum, the portico */
  const hz = 300;
  [[0, 120, 150, '#d9a27a'], [120, 90, 120, '#e8c9a0'], [520, 110, 140, '#c98a6a'], [630, 140, 110, '#e3c79a'], [770, 190, 150, '#d49a7a']].forEach(([x, w, h, col]) => {
    g.fillStyle = col; g.fillRect(x, hz - h, w, h); g.fillStyle = '#a5462b'; g.fillRect(x - 4, hz - h - 8, w + 8, 10);
    for (let yy = hz - h + 22; yy < hz - 26; yy += 34) for (let xx = x + 14; xx < x + w - 18; xx += 28) venArch(g, xx, yy, 12, 20, 'rgba(60,40,30,.55)');
  });
  g.fillStyle = '#e6dcc4'; g.fillRect(240, 150, 240, 150);                                    // the church's drum and body
  g.fillStyle = 'rgba(120,100,70,.18)'; g.fillRect(240, 150, 30, 150); g.fillRect(450, 150, 30, 150);
  g.fillStyle = '#5f9a82'; g.beginPath(); g.ellipse(360, 150, 120, 96, 0, Math.PI, 0); g.fill();   // the green dome
  g.strokeStyle = 'rgba(30,60,50,.35)'; g.lineWidth = 2; for (let a = 0.2; a < 1; a += 0.2){ g.beginPath(); g.ellipse(360, 150, 120 * a, 96, 0, Math.PI, 0); g.stroke(); }
  g.fillStyle = '#efe6d0'; g.fillRect(346, 34, 28, 26); g.fillStyle = '#5f9a82'; g.beginPath(); g.moveTo(342, 36); g.lineTo(360, 14); g.lineTo(378, 36); g.fill();
  g.fillStyle = '#c9a54a'; g.fillRect(358, 2, 4, 14);
  g.fillStyle = '#f5f0e2'; g.beginPath(); g.moveTo(268, 190); g.lineTo(360, 140); g.lineTo(452, 190); g.fill();       // the pediment
  g.fillStyle = 'rgba(90,70,50,.28)'; g.fillRect(268, 190, 184, 92);
  for (let x = 276; x < 452; x += 34){ g.fillStyle = '#fbf8ef'; g.fillRect(x, 190, 14, 92); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x + 10, 190, 4, 92); }
  g.strokeStyle = 'rgba(120,100,70,.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(268, 190); g.lineTo(360, 140); g.lineTo(452, 190); g.closePath(); g.stroke();
  g.fillStyle = '#e2dccd'; g.fillRect(250, 282, 220, 18);                                    // the steps down to the water
  venWaterEye(g, hz, t, [[240, 480, '#efe6d0'], [300, 420, '#5f9a82']]);
  venGondolaSide(g, 120 + (RM ? 0 : (t * 12) % 300), 352, 0.55);
  /* the vaporetto alongside (it rocks a little) */
  const bob = RM ? 0 : Math.sin(t * 1.6) * 2;
  venVaporettoSide(g, 600, 470 + bob, 0.95);
  /* the pontoon: its floor in the foreground, the roof's edge at the top, a post */
  g.fillStyle = '#5c544a'; g.fillRect(0, 480, W, 120);
  for (let x = -20; x < W; x += 38){ g.fillStyle = 'rgba(30,20,10,.3)'; g.beginPath(); g.moveTo(x, 480); g.lineTo(x - 60, H); g.lineTo(x - 56, H); g.lineTo(x + 2, 480); g.fill(); }
  g.fillStyle = VNC.actv; g.fillRect(0, 476, W, 6);
  g.fillStyle = '#3a3f46'; g.fillRect(0, 0, W, 26); g.fillStyle = '#8b9098'; g.fillRect(0, 22, W, 6);
  g.fillStyle = '#3a3f46'; g.fillRect(40, 26, 14, 456);
  g.fillStyle = VNC.actv; rr(g, 70, 40, 150, 34, 4); g.fill(); venText(g, 'FERROVIA  B', 145, 57.5, '800 17px "Titillium Web", sans-serif', '#1b1b1b');
  /* people boarding: they move towards the boat as k goes on; the deckhand with his rope; Margaret and Biscuit */
  const go = k * 160;
  venPersonEye(g, 520 + go * 0.6, 560, 1, { body:'#c9b48a', hair:'#c9a46a', suitcase:'#c23b2a' });
  venPersonEye(g, 600 + go * 0.4, 552, 0.95, { body:'#2e6a8e', hair:'#2a1a12', longHair:true, suitcase:'#2b2b2b' });
  venPersonEye(g, 700 + go * 0.2, 548, 0.9, { body:'#e58fa0', hair:'#3a2318', longHair:true });
  venPersonEye(g, 820, 520, 0.92, { body:'#20304a', hair:'#3a2a1a', cap:'#20304a', rope:true });          // il marinaio
  venPersonEye(g, 300 + go, 590, 1.18, { body:'#5a4a6a', hair:'#cfcfd4', skin:'#f0d0b8', longHair:true, brim:'#35577a', dog:true });   // Margaret
  venPersonEye(g, 180 + go * 0.9, 600, 1.22, { body:'#1c3d8f', hair:'#5a3a22', back:true });                          // you, from behind
}
/* 'canal': down the Grand Canal, looking ahead: palaces on both banks in perspective, gondolas, the Rialto coming up */
const VEN_PAL = (() => { const r = rng(777), out = [];
  ['L', 'R'].forEach(side => { let z = 0.6; while (z < 46){ const w = 1.2 + r() * 2.2, h = 2.4 + r() * 2.6;
    out.push({ side, z0:z, z1:z + w, h, col:['#e3b48c', '#d98f6e', '#efd9b0', '#c97a5e', '#e8c9a0', '#b9775a', '#f0e2c4', '#d6a27c'][Math.floor(r() * 8)], win:r() < 0.5 ? 'gothic' : 'round', floors:2 + Math.floor(r() * 3), pole:r() < 0.45 ? ['#c23b2a', '#1c3d8f', '#2e8b57'][Math.floor(r() * 3)] : null });
    z += w + (r() < 0.2 ? 0.4 : 0); } });
  return out; })();
const VEN_RIALTO_Z = 30;                                 // where the Rialto stands along the canal (the view moves 0 → 34)
function venViewCanal(g, t, k){
  const cz = k * 34, f = 300, cx = 480, hz = 250, half = 3.2, eye = 0.9;      // canal half width, the eye's height above the water
  venSky(g, 0, hz + 4, false);
  g.fillStyle = '#c7b9a0'; g.fillRect(0, hz - 6, W, 10);                                      // far away: the canal's bend, houses in the haze
  for (let x = 380; x < 600; x += 22){ g.fillStyle = 'rgba(190,150,120,.6)'; g.fillRect(x, hz - 26 - (x % 3) * 6, 18, 24 + (x % 3) * 6); }
  venWaterEye(g, hz + 2, t, []);
  const P = (z, X, Y) => ({ x:cx + X / z * f, y:hz - (Y - eye) / z * f });      // X: across (− left), Y: up from the water
  /* the Rialto ahead (drawn among the palaces by depth) */
  const items = VEN_PAL.map(p => ({ z:p.z0 - cz, p })).filter(o => o.p.z1 - cz > 0.35).sort((a, b) => b.z - a.z);
  const rz = VEN_RIALTO_Z - cz;
  let rialtoDone = rz <= 0.5;
  const rialto = () => {
    if (rz <= 0.5) return;
    const Lb = P(rz, -half - 0.7, 0), Rb = P(rz, half + 0.7, 0), U = P(rz, 0, 2.3), TL = P(rz, -half - 0.7, 1.9), TR = P(rz, half + 0.7, 1.9), T = P(rz, 0, 3.5);
    const w = Rb.x - Lb.x;
    /* the stone arch: between its underside (the canal shows through below it) and its top */
    g.fillStyle = '#ece5d4'; g.beginPath(); g.moveTo(Lb.x, Lb.y); g.quadraticCurveTo(cx, 2 * U.y - Lb.y, Rb.x, Rb.y); g.lineTo(TR.x, TR.y); g.quadraticCurveTo(cx, 2 * T.y - TR.y, TL.x, TL.y); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(90,70,50,.35)'; g.lineWidth = Math.max(1, w * 0.006); g.beginPath(); g.moveTo(Lb.x, Lb.y); g.quadraticCurveTo(cx, 2 * U.y - Lb.y, Rb.x, Rb.y); g.stroke();
    g.fillStyle = '#d9cfb8'; g.beginPath(); g.moveTo(TL.x, TL.y); g.quadraticCurveTo(cx, 2 * T.y - TL.y, TR.x, TR.y); g.lineTo(TR.x, TR.y + w * 0.012); g.quadraticCurveTo(cx, 2 * T.y - TL.y + w * 0.012, TL.x, TL.y + w * 0.012); g.closePath(); g.fill();
    /* the shops on top, under their roofs, and the arcade in the middle */
    const sh = (U.y - T.y) * 0.8, y0 = T.y + w * 0.004;
    [[-0.27, -0.06], [0.06, 0.27]].forEach(([a, b]) => {
      const x0 = cx + w * a, x1 = cx + w * b, yb = y0 + Math.abs((a + b) / 2) * w * 0.12;
      g.fillStyle = '#f2ece0'; g.fillRect(x0, yb - sh, x1 - x0, sh);
      for (let k = 0; k < 4; k++) venArch(g, x0 + (x1 - x0) * (0.08 + k * 0.23), yb - sh * 0.82, (x1 - x0) * 0.14, sh * 0.7, 'rgba(110,90,70,.6)');
      g.fillStyle = '#b8664a'; g.beginPath(); g.moveTo(x0 - 4, yb - sh); g.lineTo((x0 + x1) / 2, yb - sh * 1.5); g.lineTo(x1 + 4, yb - sh); g.fill();
    });
    g.fillStyle = '#f7f2e6'; g.fillRect(cx - w * 0.05, y0 - sh * 1.25, w * 0.1, sh * 1.25);
    venArch(g, cx - w * 0.03, y0 - sh * 1.05, w * 0.06, sh * 1.05, 'rgba(110,90,70,.55)');
    g.fillStyle = '#e1d6bf'; g.beginPath(); g.moveTo(cx - w * 0.07, y0 - sh * 1.25); g.lineTo(cx, y0 - sh * 1.7); g.lineTo(cx + w * 0.07, y0 - sh * 1.25); g.fill();
  };
  items.forEach(({ z, p }) => {
    if (!rialtoDone && z < rz){ rialto(); rialtoDone = true; }
    const z0 = Math.max(0.35, p.z0 - cz), z1 = p.z1 - cz, sgn = p.side === 'L' ? -1 : 1, X = sgn * half;
    const a0 = P(z0, X, 0), a1 = P(z1, X, 0), b0 = P(z0, X, p.h), b1 = P(z1, X, p.h);
    g.fillStyle = p.col; g.beginPath(); g.moveTo(a0.x, a0.y); g.lineTo(a1.x, a1.y); g.lineTo(b1.x, b1.y); g.lineTo(b0.x, b0.y); g.closePath(); g.fill();
    g.fillStyle = 'rgba(0,0,0,.06)'; g.fill();
    /* the roof's edge, the windows (columns along the depth, floors up the façade), a water door */
    g.strokeStyle = '#8a3f28'; g.lineWidth = Math.max(1, 6 / z0); g.beginPath(); g.moveTo(b0.x, b0.y); g.lineTo(b1.x, b1.y); g.stroke();
    const cols = Math.max(2, Math.round((p.z1 - p.z0) * 2.2));
    for (let ci = 0; ci < cols; ci++){
      const zz = p.z0 + (p.z1 - p.z0) * (ci + 0.5) / cols - cz; if (zz < 0.4) continue;
      for (let fl = 0; fl < p.floors; fl++){
        const yb = 0.9 + fl * (p.h - 1.2) / p.floors, yt = yb + (p.h - 1.4) / p.floors * 0.62;
        const q0 = P(zz, X, yb), q1 = P(zz, X, yt), ww = Math.max(1.5, 0.32 / zz * f * 0.4);
        if (p.win === 'gothic') venArch(g, q0.x - ww / 2, q1.y, ww, q0.y - q1.y, 'rgba(50,35,30,.62)');
        else { g.fillStyle = 'rgba(50,35,30,.6)'; g.fillRect(q0.x - ww / 2, q1.y, ww, q0.y - q1.y); }
      }
    }
    if (p.pole){ const zz = Math.max(0.4, (z0 + z1) / 2), q0 = P(zz, X * 0.86, -0.1), q1 = P(zz, X * 0.86, 1.6), pw = Math.max(1.5, 3 / zz);
      g.fillStyle = '#fffdf8'; g.fillRect(q0.x - pw / 2, q1.y, pw, q0.y - q1.y); g.fillStyle = p.pole; for (let y = q1.y; y < q0.y; y += pw * 3) g.fillRect(q0.x - pw / 2, y, pw, pw * 1.4); }
  });
  if (!rialtoDone) rialto();
  /* gondolas on the water, coming towards us and going by */
  [[6, -1.6, 1], [14, 1.4, -1], [22, -0.8, 1], [27, 1.9, -1]].forEach(([z0, X, d]) => { const z = z0 - cz + (RM ? 0 : (t * 0.3) % 2); if (z < 0.8 || z > 26) return; const q = P(z, X, 0); venGondolaSide(g, q.x, q.y, 1.4 / z, d); });
  /* our boat's bow and rail in the foreground */
  g.fillStyle = '#f2efe8'; g.beginPath(); g.moveTo(0, H); g.lineTo(0, 520); g.quadraticCurveTo(480, 470, W, 520); g.lineTo(W, H); g.fill();
  g.fillStyle = '#2b2b2b'; g.fillRect(0, 506, W, 6);
  g.strokeStyle = '#8b9098'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 470); g.quadraticCurveTo(480, 430, W, 470); g.stroke();
  for (let x = 30; x < W; x += 90){ g.beginPath(); g.moveTo(x, 470 - 40 * Math.sin(x / W * Math.PI) * 0.4 - 4); g.lineTo(x, 512); g.stroke(); }
  /* Margaret at the rail with Biscuit */
  venPersonEye(g, 760, 600, 1.25, { body:'#5a4a6a', hair:'#cfcfd4', skin:'#f0d0b8', longHair:true, brim:'#35577a', dog:true });
}
/* 'bacino': out into the basin: San Marco from the water */
function venViewBacino(g, t, k){
  const hz = 360, s = 0.76 + k * 0.14, ox = 480 - 600 * s, oy = 470 - hz * s;           // the view comes closer (a zoom on the stop)
  venSky(g, 0, H, true);
  venWaterEye(g, oy + (hz + 10) * s, t, [[ox + 40 * s, ox + 460 * s, '#efc3b0'], [ox + 470 * s, ox + 540 * s, '#b8664a'], [ox + 630 * s, ox + 960 * s, '#f2ede0']]);
  g.save(); g.translate(ox, oy); g.scale(s, s);
  /* far right: San Giorgio Maggiore across the water (small, white, its campanile) */
  g.fillStyle = '#f2ede0'; g.fillRect(1010, 290, 150, 70); g.beginPath(); g.moveTo(1000, 292); g.lineTo(1085, 250); g.lineTo(1170, 292); g.fill(); g.strokeStyle = 'rgba(120,100,80,.4)'; g.lineWidth = 2; g.strokeRect(1010, 290, 150, 70);
  g.fillStyle = '#d9d2c2'; g.beginPath(); g.ellipse(1085, 262, 40, 34, 0, Math.PI, 0); g.fill(); g.fillStyle = '#c96a4a'; g.fillRect(1170, 200, 22, 160); g.fillStyle = '#5f9a82'; g.beginPath(); g.moveTo(1166, 202); g.lineTo(1181, 168); g.lineTo(1196, 202); g.fill();
  /* the campanile of San Marco: brick shaft, the white belfry, the green spire, the golden angel */
  g.fillStyle = '#b8664a'; g.fillRect(470, 40, 70, 300); g.fillStyle = 'rgba(0,0,0,.1)'; for (let x = 478; x < 540; x += 14) g.fillRect(x, 40, 3, 300);
  g.fillStyle = '#f2ede0'; g.fillRect(462, 0, 86, 46); for (let x = 470; x < 540; x += 18) venArch(g, x, 8, 12, 34, 'rgba(60,50,40,.7)');
  g.fillStyle = '#f2ede0'; g.fillRect(466, -30, 78, 32); g.fillStyle = '#5f9a82'; g.beginPath(); g.moveTo(462, -28); g.lineTo(505, -150); g.lineTo(548, -28); g.fill();
  g.fillStyle = '#e8c35a'; g.fillRect(501, -168, 8, 20); g.beginPath(); g.moveTo(498, -166); g.lineTo(512, -160); g.lineTo(498, -156); g.fill();
  /* the domes of the basilica, behind the palace */
  [[300, 210, 46], [380, 196, 56], [460, 214, 40], [230, 222, 36]].forEach(([x, y, rad]) => { g.fillStyle = '#9aa3a8'; g.beginPath(); g.ellipse(x, y, rad, rad * 0.95, 0, Math.PI, 0); g.fill(); g.fillStyle = '#c4cbd0'; g.beginPath(); g.ellipse(x - rad * 0.3, y, rad * 0.35, rad * 0.8, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#8a9196'; g.fillRect(x - 5, y - rad - 20, 10, 22); g.fillStyle = '#e8c35a'; circ(g, x, y - rad - 24, 4); g.fill(); });
  /* the Doge's Palace: the pink upper wall with its diamond pattern, the big windows, the two white gothic arcades */
  const px = 40, pw = 420, top = 210;
  g.fillStyle = '#efc3b0'; g.fillRect(px, top, pw, 80);
  g.save(); g.beginPath(); g.rect(px, top, pw, 80); g.clip();
  g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.2;
  for (let x = px - 80; x < px + pw; x += 14){ g.beginPath(); g.moveTo(x, top); g.lineTo(x + 80, top + 80); g.moveTo(x + 80, top); g.lineTo(x, top + 80); g.stroke(); }
  g.restore();
  for (let x = px + 30; x < px + pw - 30; x += 64) venArch(g, x, top + 22, 26, 46, 'rgba(70,40,40,.75)');
  g.fillStyle = '#f7f2e6'; g.fillRect(px, top - 8, pw, 10); for (let x = px; x < px + pw; x += 14){ g.beginPath(); g.moveTo(x, top - 8); g.lineTo(x + 7, top - 20); g.lineTo(x + 14, top - 8); g.fill(); }
  g.fillStyle = '#f7f2e6'; g.fillRect(px, top + 80, pw, hz - top - 80);
  for (let x = px + 6; x < px + pw - 10; x += 20) venArch(g, x, top + 96, 14, 26, 'rgba(70,60,60,.7)');          // the loggia
  g.fillStyle = '#e9e1cf'; g.fillRect(px, top + 128, pw, 4);
  for (let x = px + 4; x < px + pw - 20; x += 38) venArch(g, x, top + 140, 30, hz - top - 142, 'rgba(60,55,55,.75)');   // the portico at the water
  /* the two columns of the Piazzetta: San Marco's winged lion, San Todaro */
  [[500, '#c9a54a'], [600, '#e9e1cf']].forEach(([x, col], i) => { g.fillStyle = '#d9d2c2'; g.fillRect(x - 8, 210, 16, hz - 210); g.fillStyle = '#efe9db'; g.fillRect(x - 12, 204, 24, 8);
    g.fillStyle = col; if (i === 0){ ell(g, x, 196, 14, 8); g.fill(); g.beginPath(); g.moveTo(x - 4, 194); g.lineTo(x - 18, 172); g.lineTo(x + 4, 190); g.fill(); } else { g.fillRect(x - 4, 172, 8, 32); circ(g, x, 168, 5); g.fill(); } });
  /* the Libreria (white, arcaded) beyond the columns, then the Zecca */
  g.fillStyle = '#f2ede0'; g.fillRect(630, 250, 330, hz - 250); for (let x = 640; x < 950; x += 30){ venArch(g, x, 262, 18, 30, 'rgba(70,60,60,.6)'); venArch(g, x, 310, 18, hz - 314, 'rgba(70,60,60,.7)'); }
  g.fillStyle = '#e6dcc6'; g.fillRect(630, 244, 330, 8);
  g.fillStyle = '#e8d9bd'; g.fillRect(960, 300, 70, hz - 300); for (let x = 966; x < 1024; x += 20) venArch(g, x, 316, 12, hz - 320, 'rgba(90,70,60,.6)');
  g.fillStyle = '#f2ede0'; g.fillRect(-300, 250, 340, hz - 250); for (let x = -290; x < 30; x += 30) venArch(g, x, 280, 16, hz - 284, 'rgba(90,70,60,.6)');
  /* the quay, the gondolas moored with their poles */
  g.fillStyle = '#e9e1cf'; g.fillRect(-400, hz, 2000, 10);
  for (let i = 0; i < 9; i++){ const x = 40 + i * 110; g.fillStyle = '#fffdf8'; g.fillRect(x, hz - 30, 6, 60); g.fillStyle = ['#c23b2a', '#1c3d8f'][i % 2]; for (let y = hz - 30; y < hz + 30; y += 12) g.fillRect(x, y, 6, 5); g.fillStyle = '#c9a54a'; g.fillRect(x - 1, hz - 34, 8, 5); }
  for (let i = 0; i < 7; i++) venGondolaSide(g, 90 + i * 120, hz + 30 + (RM ? 0 : Math.sin(t * 1.3 + i) * 1.5), 0.42, i % 2 ? 1 : -1);
  /* the San Marco stop, coming closer: its yellow-roofed pontoon */
  g.fillStyle = '#3a3f46'; g.fillRect(560, hz + 48, 260, 26); g.fillStyle = VNC.actv; g.fillRect(560, hz + 34, 260, 14); venText(g, 'S. MARCO', 690, hz + 41.5, '800 12px "Titillium Web", sans-serif', '#1b1b1b');
  g.restore();
  /* our boat's bow, Margaret at the rail with Biscuit */
  g.fillStyle = '#f2efe8'; g.beginPath(); g.moveTo(0, H); g.lineTo(0, 540); g.quadraticCurveTo(480, 500, W, 540); g.lineTo(W, H); g.fill();
  g.fillStyle = '#2b2b2b'; g.fillRect(0, 528, W, 6);
  venPersonEye(g, 200, 600, 1.2, { body:'#5a4a6a', hair:'#cfcfd4', skin:'#f0d0b8', longHair:true, brim:'#35577a', dog:true });
}
SCENE_ART.vaporetto = {
  back(t){
    const k = venViewK(), v = VEN.view.kind;
    ctx.save();
    if (v === 'canal') venViewCanal(ctx, t, k); else if (v === 'bacino') venViewBacino(ctx, t, k); else venViewBoard(ctx, t, k);
    /* the horn: a ripple of sound lines */
    if (VEN.horn && performance.now() - VEN.horn < 2600){ const a = 1 - (performance.now() - VEN.horn) / 2600; ctx.strokeStyle = `rgba(255,255,255,${a * 0.7})`; ctx.lineWidth = 3; for (let i = 0; i < 3; i++){ ctx.beginPath(); ctx.arc(820, 300, 30 + i * 22 + (1 - a) * 40, -0.6, 0.6); ctx.stroke(); } }
    ctx.restore();
  },
  night(){},
  ents(){ return []; },
};
