/* Pre-rendered scene backgrounds: piazza, San Lorenzo, Caffè Aurora, Piazza del Santo, the market (Piazza delle Erbe). */

let bg = null, bgSL = null;
function buildBg(){
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const r = rng(7);
  g.fillStyle = '#a79a80'; g.fillRect(0, 0, W, H);
  cobbles(g, r, 0, 112, W, H, 34, 16, 68);
  g.save(); circ(g, FOUNTAIN.x, FOUNTAIN.y, 150); g.clip();
  g.fillStyle = '#8c826e'; g.fillRect(FOUNTAIN.x - 150, FOUNTAIN.y - 150, 300, 300);
  for (let ring = 0; ring < 5; ring++){
    const r0 = 90 + ring * 12, r1 = r0 + 11, n = Math.round(2 * Math.PI * r0 / 17);
    for (let k = 0; k < n; k++){
      const a0 = k / n * 2 * Math.PI + ring * 0.13, a1 = (k + 0.86) / n * 2 * Math.PI + ring * 0.13;
      const l = r(); g.fillStyle = `hsl(40, ${12 + l * 8}%, ${78 + l * 7}%)`;
      g.beginPath(); g.arc(FOUNTAIN.x, FOUNTAIN.y, r1, a0, a1); g.arc(FOUNTAIN.x, FOUNTAIN.y, r0, a1, a0, true); g.closePath(); g.fill();
    }
  }
  g.restore();
  const BLD = [[0, 236, '#b4512e'], [236, 476, '#a5462b'], [476, 690, '#bd6538'], [690, 960, '#9f4a2c']];
  BLD.forEach(([x0, x1, col], bi) => {
    g.save(); g.beginPath(); g.rect(x0, 0, x1 - x0, 114); g.clip();
    g.fillStyle = col; g.fillRect(x0, 0, x1 - x0, 114);
    g.strokeStyle = 'rgba(70,22,10,.38)'; g.lineWidth = 1.3;
    for (let y = 4, row = 0; y < 114; y += 9, row++){
      const off = row % 2 ? 6 : 0;
      for (let x = x0 - 12 + off; x < x1 + 12; x += 12){ g.beginPath(); g.arc(x + 6, y, 6, 0, Math.PI); g.stroke(); }
    }
    g.fillStyle = 'rgba(255,225,190,.2)'; g.fillRect(x0, 52, x1 - x0, 5);
    const cx = x0 + 40 + (bi * 53) % 110;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(cx + 4, 22, 18, 16);
    g.fillStyle = '#6f2f1b'; g.fillRect(cx, 18, 18, 16); g.fillStyle = '#2b1810'; g.fillRect(cx + 4, 22, 10, 8);
    g.restore();
    g.fillStyle = 'rgba(40,12,6,.55)'; g.fillRect(x1 - 2, 0, 4, 114);
  });
  g.fillStyle = '#5e2614'; g.fillRect(0, 112, W, 4);
  g.fillStyle = 'rgba(30,18,8,.25)'; g.fillRect(0, 116, W, 12);
  for (let i = 0; i < 15; i++){
    const x = 700 + i * 16;
    g.fillStyle = i % 2 ? '#f5f1e8' : '#1c3d8f';
    g.fillRect(x, 128, 16, 20); g.beginPath(); g.arc(x + 8, 148, 8, 0, Math.PI); g.fill();
  }
  g.fillStyle = '#0f2260'; g.fillRect(700, 116, 240, 13);
  g.fillStyle = '#f4b928'; g.font = '700 10px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('B A R   C E N T R A L E', 820, 123);
  TABLES.forEach(([x, y]) => {
    g.fillStyle = 'rgba(30,20,10,.2)'; circ(g, x + 3, y + 5, 16); g.fill();
    g.fillStyle = '#1c3d8f'; rr(g, x - 32, y - 6, 12, 12, 3); g.fill(); rr(g, x + 20, y - 6, 12, 12, 3); g.fill();
    g.fillStyle = '#f7f3ea'; circ(g, x, y, 15); g.fill(); g.strokeStyle = '#8f8778'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = '#fff'; circ(g, x + 4, y - 3, 4); g.fill(); g.stroke();
    g.fillStyle = '#5a3420'; circ(g, x + 4, y - 3, 2.2); g.fill();
  });
  g.fillStyle = 'rgba(0,0,0,.2)'; rr(g, 105, 324, 128, 112, 6); g.fill();
  g.fillStyle = '#2e6a4e'; rr(g, 100, 318, 128, 102, 6); g.fill();
  g.fillStyle = '#3a7d5d'; rr(g, 108, 326, 112, 86, 4); g.fill();
  g.fillStyle = '#f4b928'; g.font = '700 16px "Titillium Web", sans-serif'; g.fillText('EDICOLA', 164, 369);
  ['#c23b2a', '#f4b928', '#1c3d8f', '#f5f1e8', '#2e6a4e', '#d97a4a', '#7a4b8c', '#c23b2a'].forEach((col, i) => {
    g.fillStyle = col; g.fillRect(104 + i * 15, 421, 13, 13);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(106 + i * 15, 424, 9, 2);
  });
  [[40, 168], [300, 166], [640, 166], [40, 560], [930, 560]].forEach(([x, y]) => tree(g, r, x, y));
  g.save(); g.translate(330, 556); g.rotate(-0.25); vespa(g); g.restore();
  g.fillStyle = '#8e836f'; g.fillRect(0, 590, W, 10);
  bg = c;
}
function tree(g, r, x, y){
  g.fillStyle = 'rgba(30,20,10,.22)'; circ(g, x + 5, y + 6, 22); g.fill();
  g.fillStyle = '#b4512e'; circ(g, x, y, 17); g.fill();
  for (let k = 0; k < 7; k++){ const a = k / 7 * 6.28; g.fillStyle = '#466f33'; circ(g, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 10); g.fill(); }
  g.fillStyle = '#5d8f44'; circ(g, x, y, 11); g.fill();
  g.fillStyle = '#74a855'; circ(g, x - 4, y - 5, 6); g.fill();
  for (let k = 0; k < 6; k++){ g.fillStyle = '#f6d23c'; circ(g, x + (r() - 0.5) * 26, y + (r() - 0.5) * 26, 2.6); g.fill(); }
}
function vespa(g, col = '#8ecab4'){
  g.fillStyle = 'rgba(30,20,10,.22)'; ell(g, 3, 5, 27, 12); g.fill();
  g.fillStyle = col; ell(g, 0, 0, 24, 10); g.fill(); ell(g, 17, 0, 7, 11); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.5; ell(g, 0, 0, 24, 10); g.stroke();
  g.fillStyle = '#4a3328'; ell(g, -6, 0, 10, 5.5); g.fill();
  g.strokeStyle = '#2a2a2a'; g.lineWidth = 3; g.beginPath(); g.moveTo(19, -13); g.lineTo(19, 13); g.stroke();
  g.fillStyle = '#fff7d0'; circ(g, 25, 0, 3); g.fill();
}
function sign(g, x, y, w, h, text, bgc, fg, font = '700 10px "Titillium Web", sans-serif'){
  g.fillStyle = 'rgba(0,0,0,.25)'; rr(g, x + 1.5, y + 2, w, h, 3); g.fill();
  g.fillStyle = bgc; rr(g, x, y, w, h, 3); g.fill();
  g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x + w / 2, y + h / 2 + 0.5);
}
function streetName(g, x, y, text, rot){
  g.save(); g.translate(x, y); g.rotate(rot || 0);
  g.font = '700 11px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const w = g.measureText(text).width + 14;
  g.fillStyle = 'rgba(245,240,230,.92)'; rr(g, -w / 2, -9, w, 18, 3); g.fill();
  g.strokeStyle = '#8a7f6c'; g.lineWidth = 1; g.stroke();
  g.fillStyle = '#2b2b2b'; g.fillText(text, 0, 0.5);
  g.restore();
}
function houseNo(g, x, y, n){
  g.fillStyle = '#1c3d8f'; rr(g, x - 9, y - 7, 18, 14, 3); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 1.2; rr(g, x - 7.5, y - 5.5, 15, 11, 2); g.stroke();
  g.fillStyle = '#fff'; g.font = '700 9px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), x, y + 0.5);
}
function buildBgSL(){
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const r = rng(23);
  g.fillStyle = '#8f877a'; g.fillRect(0, 0, W, H);
  cobbles(g, r, 0, 0, W, H, 30, 8, 60);
  // piazzetta slabs
  g.fillStyle = '#c9bb9e'; g.fillRect(0, 168, 340, 132);
  for (let y = 168; y < 300; y += 22) for (let x = 0; x < 340; x += 22){ const l = r(); g.fillStyle = `hsl(40, ${14 + l * 8}%, ${74 + l * 8}%)`; g.fillRect(x + 1, y + 1, 20, 20); }
  // church block
  roofs(g, 0, 0, 340, 168, '#a4512f', r);
  g.fillStyle = '#e9e1cf'; g.fillRect(84, 8, 172, 160);
  g.fillStyle = '#9c8f7b'; g.fillRect(92, 14, 156, 140);
  g.strokeStyle = 'rgba(60,50,40,.3)'; g.lineWidth = 1; for (let x = 100; x < 248; x += 10){ g.beginPath(); g.moveTo(x, 14); g.lineTo(x, 154); g.stroke(); }
  g.fillStyle = '#e9e1cf'; g.fillRect(166, 14, 8, 140);
  g.fillStyle = '#7d8a96'; circ(g, 170, 62, 36); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 8; k++){ const a = k / 8 * 6.28; g.beginPath(); g.moveTo(170, 62); g.lineTo(170 + Math.cos(a) * 36, 62 + Math.sin(a) * 36); g.stroke(); }
  g.fillStyle = '#d9b44a'; circ(g, 170, 62, 6); g.fill();
  g.fillStyle = '#f2ead8'; g.fillRect(80, 156, 180, 12);
  g.fillStyle = '#d9cfba'; g.fillRect(130, 168, 80, 6); g.fillRect(140, 174, 60, 6);
  sign(g, 110, 140, 120, 14, 'CHIESA DI SAN LORENZO', '#f2ead8', '#5a4a3a', '700 9px "Titillium Web", sans-serif');
  // block B: Bar Sport + Banca
  roofs(g, 400, 0, 220, 300, '#b0603a', r);
  g.fillStyle = '#d9d3c7'; g.fillRect(500, 222, 120, 78); g.fillStyle = '#c7c0b2'; for (let x = 506; x < 620; x += 14) g.fillRect(x, 226, 8, 70);
  sign(g, 510, 268, 100, 16, 'BANCA', '#1c3d8f', '#fff');
  for (let i = 0; i < 4; i++){ g.fillStyle = i % 2 ? '#fff' : '#c23b2a'; g.fillRect(384, 70 + i * 15, 16, 15); }
  sign(g, 404, 92, 80, 16, 'BAR SPORT', '#c23b2a', '#fff');
  houseNo(g, 612, 70, 13); houseNo(g, 612, 200, 11);
  // block C: Caffè Aurora + Farmacia
  roofs(g, 680, 0, 280, 300, '#9f4a2c', r);
  g.fillStyle = '#efd9b8'; g.fillRect(680, 80, 120, 92);
  g.fillStyle = '#d9c09a'; g.fillRect(684, 84, 112, 84);
  for (let i = 0; i < 4; i++){ g.fillStyle = i % 2 ? '#fff6e8' : '#e07a2f'; g.fillRect(664, 96 + i * 15, 16, 15); }
  g.fillStyle = '#4a2f1e'; g.fillRect(678, 116, 4, 20);
  houseNo(g, 690, 30, 14); houseNo(g, 690, 146, 12); houseNo(g, 690, 236, 10);
  g.fillStyle = '#e6e2d6'; g.fillRect(800, 222, 160, 78);
  sign(g, 830, 268, 110, 16, 'FARMACIA', '#2e8b57', '#fff');
  g.fillStyle = '#2e8b57'; g.fillRect(812, 270, 12, 4); g.fillRect(816, 266, 4, 12);
  // south blocks
  roofs(g, 0, 370, 520, 230, '#b4512e', r);
  sign(g, 200, 376, 120, 16, 'PANETTERIA', '#f2ead8', '#7a4b2a');
  roofs(g, 580, 370, 380, 230, '#a5462b', r);
  // street names on corner plaques
  streetName(g, 480, 336, 'VIA GARIBALDI');
  streetName(g, 650, 230, 'VIA DEI MILLE', -Math.PI / 2);
  streetName(g, 370, 230, 'VIA VERDI', -Math.PI / 2);
  streetName(g, 550, 470, 'VIA CAVOUR', -Math.PI / 2);
  // piazzetta details
  tree(g, r, 60, 280);
  g.fillStyle = '#7a5a3a'; rr(g, 150, 198, 60, 12, 3); g.fill();
  g.fillStyle = '#c9c0ac'; circ(g, 330, 200, 14); g.fill(); g.fillStyle = '#7db7d9'; circ(g, 330, 200, 9); g.fill();
  g.save(); g.translate(550, 540); g.rotate(Math.PI / 2 - 0.1); vespa(g, '#e07a2f'); g.restore();
  bgSL = c;
}

/* Caffè Aurora, inside: cementine floor tiles, a chalkboard menu, checked tablecloths */
const AU_TABLES = [[420, 320], [190, 230], [200, 470], [680, 470], [650, 250]];
const DINERS = [
  { x:150, y:230, face:{ x:1, y:0 }, body:'#6b8f71', hair:'#3a2a1a', skin:'#e0b090' },
  { x:230, y:230, face:{ x:-1, y:0 }, body:'#b0563a', hair:'#d9c08a', skin:'#f0c9a8', longHair:true },
  { x:640, y:470, face:{ x:1, y:0 }, body:'#2f4f6f', hair:'#9a9a9a', skin:'#d9a37e' },
];
let bgAU = null;
function buildBgAU(){
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const r = rng(41);
  for (let y = 96; y < H; y += 40) for (let x = 0; x < W; x += 40){
    g.fillStyle = '#efe3cc'; g.fillRect(x, y, 40, 40);
    g.fillStyle = 'rgba(111,143,179,.55)';
    [[0,0,0],[40,0,1],[40,40,2],[0,40,3]].forEach(([cx, cy, q]) => { g.beginPath(); g.moveTo(x + cx, y + cy); g.arc(x + cx, y + cy, 11, q * Math.PI / 2, (q + 1) * Math.PI / 2); g.closePath(); g.fill(); });
    g.save(); g.translate(x + 20, y + 20); g.rotate(Math.PI / 4); g.fillStyle = '#c97a52'; g.fillRect(-6, -6, 12, 12); g.restore();
    g.strokeStyle = 'rgba(120,100,80,.25)'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, 39, 39);
  }
  g.fillStyle = '#e9cfa3'; g.fillRect(0, 0, W, 96);
  g.fillStyle = '#7a4b2a'; g.fillRect(0, 84, W, 12);
  [[30, 300]].forEach(([x0, x1]) => {
    [26, 58].forEach(y => {
      g.fillStyle = '#7a4b2a'; g.fillRect(x0, y + 14, x1 - x0, 4);
      for (let x = x0 + 6; x < x1 - 10; x += 14){ const cols = ['#2e6a4e','#c23b2a','#e3c47a','#5a2a3a','#1c3d8f']; g.fillStyle = cols[Math.floor(r() * cols.length)]; rr(g, x, y - 2, 9, 16, 3); g.fill(); }
    });
  });
  g.fillStyle = '#7a4b2a'; rr(g, 336, 8, 248, 76, 4); g.fill();
  g.fillStyle = '#263028'; rr(g, 342, 14, 236, 64, 3); g.fill();
  g.fillStyle = '#f3efe6'; g.font = 'italic 700 17px "Bodoni Moda", Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('Menù del giorno', 460, 32);
  g.font = '600 11px "Titillium Web", sans-serif'; g.fillStyle = 'rgba(243,239,230,.85)';
  g.fillText('lasagna · risotto ai funghi · spaghetti', 460, 52); g.fillText('pollo arrosto · parmigiana · tiramisù', 460, 67);
  sign(g, 640, 30, 100, 22, 'CAFFÈ AURORA', '#e07a2f', '#fff', '700 11px "Titillium Web", sans-serif');
  g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, 763, 100, 200, 92, 4); g.fill();
  g.fillStyle = '#8a5a33'; rr(g, 760, 96, 200, 92, 4); g.fill();
  g.fillStyle = '#f1ece2'; rr(g, 760, 96, 200, 74, 4); g.fill();
  g.fillStyle = 'rgba(200,228,238,.9)'; rr(g, 776, 112, 70, 22, 3); g.fill();
  for (let k = 0; k < 6; k++){ g.fillStyle = k % 2 ? '#d9a24a' : '#c7843a'; circ(g, 786 + k * 10, 123, 4); g.fill(); }
  g.fillStyle = '#c9ccd2'; rr(g, 870, 104, 60, 28, 4); g.fill(); g.fillStyle = '#c23b2a'; rr(g, 874, 107, 52, 7, 2); g.fill();
  g.fillStyle = '#fff'; circ(g, 884, 145, 4); g.fill(); circ(g, 906, 145, 4); g.fill();
  g.fillStyle = '#2b2b2b'; rr(g, 790, 146, 26, 16, 2); g.fill(); g.fillStyle = '#7fd18b'; g.fillRect(794, 149, 18, 4);
  AU_TABLES.forEach(([x, y], i) => {
    g.fillStyle = '#5a3a22'; rr(g, x - 52, y - 9, 16, 18, 4); g.fill(); rr(g, x + 36, y - 9, 16, 18, 4); g.fill();
    g.fillStyle = 'rgba(30,20,10,.22)'; circ(g, x + 4, y + 5, 32); g.fill();
    g.save(); circ(g, x, y, 30); g.clip();
    g.fillStyle = '#fffdf8'; g.fillRect(x - 30, y - 30, 60, 60);
    g.fillStyle = 'rgba(194,59,42,.82)';
    for (let iy = 0; iy < 8; iy++) for (let ix = 0; ix < 8; ix++) if ((ix + iy) % 2 === 0) g.fillRect(x - 32 + ix * 8, y - 32 + iy * 8, 8, 8);
    g.restore();
    g.strokeStyle = '#8a2a1e'; g.lineWidth = 1.5; circ(g, x, y, 30); g.stroke();
    if (i !== 0){ g.fillStyle = '#fff'; circ(g, x - 12, y, 8); g.fill(); circ(g, x + 12, y, 8); g.fill(); g.fillStyle = '#c9a46a'; circ(g, x - 12, y, 4); g.fill(); circ(g, x + 12, y, 4); g.fill(); }
  });
  tree(g, r, 40, 130); tree(g, r, 920, 560);
  g.fillStyle = '#7a4b2a'; g.fillRect(0, 588, 440, 12); g.fillRect(520, 588, 440, 12);
  g.fillStyle = '#b08a5a'; rr(g, 448, 570, 64, 18, 3); g.fill();
  g.fillStyle = '#7a4b2a'; g.font = '700 9px "Titillium Web", sans-serif'; g.fillText('USCITA', 480, 579);
  bgAU = c;
}
let bgSanto = null;
function buildBgSanto(){
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const r = rng(53);
  g.fillStyle = '#b9ab90'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 30) for (let x = (y / 30) % 2 ? -24 : 0; x < W; x += 48){ const l = r(); g.fillStyle = `hsl(38, ${14 + l * 8}%, ${72 + l * 8}%)`; rr(g, x + 1, y + 1, 46, 28, 2); g.fill(); }
  g.fillStyle = '#a65a38'; g.fillRect(200, 0, 560, 160);
  g.strokeStyle = 'rgba(70,25,10,.25)'; g.lineWidth = 1; for (let y = 6; y < 160; y += 6){ g.beginPath(); g.moveTo(200, y); g.lineTo(760, y); g.stroke(); }
  [[300, 64, 38], [400, 52, 44], [560, 52, 44], [660, 64, 38], [480, 110, 34], [480, 40, 30]].forEach(([x, y, rad]) => {
    g.fillStyle = 'rgba(0,0,0,.2)'; circ(g, x + 4, y + 5, rad); g.fill();
    g.fillStyle = '#8d97a0'; circ(g, x, y, rad); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.35)'; for (let k = 0; k < 10; k++){ const a = k / 10 * 6.28; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); g.stroke(); }
    g.fillStyle = '#d9b44a'; circ(g, x, y, 5); g.fill();
  });
  [[222, 136], [738, 136]].forEach(([x, y]) => { g.fillStyle = 'rgba(0,0,0,.25)'; circ(g, x + 3, y + 4, 15); g.fill(); g.fillStyle = '#c47a52'; circ(g, x, y, 14); g.fill(); g.fillStyle = '#8d97a0'; circ(g, x, y, 7); g.fill(); });
  g.fillStyle = '#d9a07a'; g.fillRect(200, 150, 560, 20);
  g.fillStyle = '#4a2f1e'; rr(g, 458, 150, 44, 20, 3); g.fill();
  g.fillStyle = '#e3dccd'; g.fillRect(420, 170, 120, 6); g.fillRect(432, 176, 96, 6);
  sign(g, 380, 126, 200, 16, 'BASILICA DI SANT’ANTONIO · IL SANTO', '#f2ead8', '#5a3a22', '700 9px "Titillium Web", sans-serif');
  // the Gattamelata: its long shadow and the steps of the plinth on the paving (the plinth and statue: world/statue.js)
  g.fillStyle = 'rgba(30,20,10,.22)'; rr(g, GATTA.x + 4, GATTA.y + 58, GATTA.w, GATTA.h - 54, 4); g.fill();
  g.fillStyle = '#cfc5af'; rr(g, GATTA.x, GATTA.y + 54, GATTA.w, GATTA.h - 54, 3); g.fill(); g.strokeStyle = '#a99f8a'; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = '#e3dccd'; rr(g, GATTA.x + 8, GATTA.y + 60, GATTA.w - 16, GATTA.h - 66, 2); g.fill();
  g.fillStyle = 'rgba(120,105,80,.25)'; g.fillRect(GATTA.x + 8, GATTA.y + GATTA.h - 8, GATTA.w - 16, 2);
  drawStatueShadow(g);
  [[70, 250], [890, 250], [70, 470], [890, 470]].forEach(([x, y]) => {
    g.fillStyle = 'rgba(30,20,10,.22)'; circ(g, x + 6, y + 7, 30); g.fill();
    for (let k = 0; k < 8; k++){ const a = k / 8 * 6.28; g.fillStyle = '#5b7f45'; circ(g, x + Math.cos(a) * 14, y + Math.sin(a) * 14, 15); g.fill(); }
    g.fillStyle = '#6f9655'; circ(g, x, y, 16); g.fill(); g.fillStyle = '#86ad66'; circ(g, x - 6, y - 7, 8); g.fill();
  });
  g.fillStyle = '#6b4a2e'; rr(g, 600, 420, 70, 14, 3); g.fill(); rr(g, 250, 470, 70, 14, 3); g.fill();
  [[160, 200], [800, 200], [160, 540], [800, 540]].forEach(([x, y]) => { g.fillStyle = '#2b2b2b'; circ(g, x, y, 5); g.fill(); g.fillStyle = '#f6e7a6'; circ(g, x, y, 2.5); g.fill(); });
  g.fillStyle = '#8e836f'; g.fillRect(0, 590, W, 10);
  bgSanto = c;
  buildStatueSprite();
}
function drawOurTable(){
  const x = 420, y = 320, L = S.l4;
  const plate = (px, py, food) => {
    ctx.fillStyle = '#fff'; circ(ctx, px, py, 9); ctx.fill(); ctx.strokeStyle = '#d9d2c3'; ctx.lineWidth = 1; ctx.stroke();
    if (food){ const col = { risotto:'#e3cf98', spaghetti:'#d9573a', parmigiana:'#b8452f', lasagna:'#c9643a', pollo:'#b9783a', pesce:'#e9e1d0', insalata:'#7fae5a', tiramisu:'#8a5a33' }[food] || '#ccc'; ctx.fillStyle = col; circ(ctx, px, py, 5.5); ctx.fill(); }
  };
  plate(x + 14, y - 12, L.served && L.him.dish);
  plate(x - 14, y + 10, L.served && L.me.dish);
  ctx.fillStyle = 'rgba(180,215,235,.9)'; circ(ctx, x + 2, y - 2, 3.5); ctx.fill(); circ(ctx, x + 8, y + 6, 3.5); ctx.fill();
  if (S.l4.billAsked){ ctx.fillStyle = '#fffdf8'; ctx.fillRect(x - 6, y + 14, 12, 16); ctx.fillStyle = '#9a948a'; for (let k = 0; k < 4; k++) ctx.fillRect(x - 4, y + 17 + k * 3, 8, 1); }
}

/* ---------- the market, Piazza delle Erbe ----------
   bgMercato: everything behind the people (paving, the Palazzo della Ragione, awnings, racks).
   MERCATO_FRONT: one strip per stall row with the counters and the goods on them, drawn in the
   depth-sorted pass (like the bar counter) so the vendors stand behind their counters.
   drawMercatoProps: what changes from lesson to lesson, drawn in the world pass just in front of the counters
   (Teresa's display shirt: the blue one Mark wants in Lesson 7; it has sold out by Lesson 8). */
let bgMercato = null, MERCATO_FRONT = [];
const MERCATO_PROPS_Y = STALL_ROW[0].ct + STALL_ROW[0].ch + 0.5;
function drawMercatoProps(){
  const s = STALLS.find(t => t.id === 'teresa'), y = STALL_ROW[s.row].ct;
  tshirt(ctx, s.x + 192, y - 8, 26, S.lesson >= 8 ? '#3a3a3a' : '#2f78d8');
}
/* the vendor's hand-painted name board, hung on the awning at the end away from the vendor (NPC.sign):
   reading it is how you learn their name (conversation/dialog.js) */
function stallSign(g, s, R){
  const text = NPC[s.id] && NPC[s.id].sign; if (!text) return;
  g.font = 'italic 700 12px "Bodoni Moda", Georgia, serif';
  const w = Math.round(g.measureText(text).width) + 18, h = 18, y = R.awn + 15;
  const x = s.vx - s.x > STALL_W / 2 ? s.x + 22 : s.x + STALL_W - 22 - w;
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate((s.row ? 1 : -1) * 0.035);
  g.strokeStyle = 'rgba(60,40,20,.7)'; g.lineWidth = 1;
  [-w / 2 + 7, w / 2 - 7].forEach(sx => { g.beginPath(); g.moveTo(sx, -h / 2); g.lineTo(sx * 0.9, -h / 2 - 6); g.stroke(); });
  g.fillStyle = 'rgba(30,20,10,.3)'; rr(g, -w / 2 + 1.5, -h / 2 + 2, w, h, 2); g.fill();
  g.fillStyle = '#8a5a33'; rr(g, -w / 2, -h / 2, w, h, 2); g.fill();
  g.fillStyle = '#f3e6c4'; rr(g, -w / 2 + 2, -h / 2 + 2, w - 4, h - 4, 1.5); g.fill();
  g.fillStyle = '#5a3a22'; [-w / 2 + 7, w / 2 - 7].forEach(sx => { circ(g, sx, -h / 2 + 3.5, 0.9); g.fill(); });
  g.fillStyle = s.awn[0]; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, 1);
  g.restore();
}
function tshirt(g, x, y, w, col, stripe){
  const h = w * 1.05, s = w / 22;
  g.save(); g.translate(x, y);
  const path = () => { g.beginPath(); g.moveTo(-4 * s, 0); g.lineTo(-11 * s, 3 * s); g.lineTo(-13 * s, 9 * s); g.lineTo(-8 * s, 10 * s); g.lineTo(-7 * s, h);
    g.lineTo(7 * s, h); g.lineTo(8 * s, 10 * s); g.lineTo(13 * s, 9 * s); g.lineTo(11 * s, 3 * s); g.lineTo(4 * s, 0); g.quadraticCurveTo(0, 4 * s, -4 * s, 0); g.closePath(); };
  g.fillStyle = 'rgba(30,20,10,.22)'; g.save(); g.translate(1.5, 2); path(); g.fill(); g.restore();
  g.fillStyle = col; path(); g.fill();
  if (stripe){ g.save(); path(); g.clip(); g.fillStyle = stripe; for (let k = 3 * s; k < h; k += 4 * s) g.fillRect(-14 * s, k, 28 * s, 1.8 * s); g.restore(); }
  g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 0.8; path(); g.stroke();
  g.restore();
}
function tie(g, x, y, col, pat){
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(30,20,10,.2)'; g.fillRect(-2, 3, 6, 20);
  g.fillStyle = col;
  g.beginPath(); g.moveTo(-2, 0); g.lineTo(2, 0); g.lineTo(1.5, 3); g.lineTo(4, 18); g.lineTo(0, 23); g.lineTo(-4, 18); g.lineTo(-1.5, 3); g.closePath(); g.fill();
  if (pat){ g.save(); g.clip(); g.strokeStyle = pat; g.lineWidth = 1.2; for (let k = -6; k < 26; k += 4){ g.beginPath(); g.moveTo(-5, k); g.lineTo(5, k + 5); g.stroke(); } g.restore(); }
  g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(-1.5, 0, 3, 3);
  g.restore();
}
function scarf(g, x, y, w, h, col, col2){
  g.fillStyle = 'rgba(30,20,10,.2)'; g.fillRect(x + 1.5, y + 2, w, h);
  g.fillStyle = col; g.fillRect(x, y, w, h);
  g.fillStyle = col2; for (let k = 2; k < h - 2; k += 6) g.fillRect(x, y + k, w, 2);
  g.globalAlpha = 0.5; for (let k = 2; k < w - 1; k += 5) g.fillRect(x + k, y, 1.5, h); g.globalAlpha = 1;
  g.strokeStyle = col; g.lineWidth = 1; for (let k = 1; k < w; k += 2){ g.beginPath(); g.moveTo(x + k, y + h); g.lineTo(x + k, y + h + 3); g.stroke(); }
}
function blooms(g, r, x, y, rad, cols){
  g.fillStyle = '#3f6f2e'; circ(g, x, y, rad); g.fill();
  for (let k = 0; k < 7; k++){ const a = r() * 6.28, d = r() * rad * 0.8; g.fillStyle = '#5d8f44'; ell(g, x + Math.cos(a) * d, y + Math.sin(a) * d, 3, 1.6, a); g.fill(); }
  const n = Math.round(rad * 0.9);
  for (let k = 0; k < n; k++){
    const a = r() * 6.28, d = Math.sqrt(r()) * rad * 0.85, fx = x + Math.cos(a) * d, fy = y + Math.sin(a) * d, col = cols[k % cols.length];
    g.fillStyle = col; circ(g, fx, fy, 2.6 + r() * 1.2); g.fill();
    g.fillStyle = col === '#f6d23c' ? '#7a4b1a' : '#f6e7a6'; circ(g, fx, fy, 0.9); g.fill();
  }
}
function bucket(g, r, x, y, cols, rad = 10){
  g.fillStyle = 'rgba(30,20,10,.25)'; circ(g, x + 2, y + 3, rad + 1); g.fill();
  g.fillStyle = '#8e969c'; circ(g, x, y, rad); g.fill();
  g.strokeStyle = '#c7cdd1'; g.lineWidth = 1.5; circ(g, x, y, rad - 1); g.stroke();
  blooms(g, r, x, y - 2, rad + 1, cols);
}
function crate(g, x, y, w, h, fill_){
  g.fillStyle = 'rgba(30,20,10,.25)'; g.fillRect(x + 2, y + 3, w, h);
  g.fillStyle = '#b98a52'; g.fillRect(x, y, w, h);
  g.fillStyle = '#6e4a26'; g.fillRect(x + 2.5, y + 2.5, w - 5, h - 5);
  g.strokeStyle = 'rgba(90,55,25,.6)'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  if (fill_){ g.save(); g.beginPath(); g.rect(x + 2.5, y + 2.5, w - 5, h - 5); g.clip(); fill_(x + 2.5, y + 2.5, w - 5, h - 5); g.restore(); }
}
/* fill a crate with round produce */
const produce = (g, r, col, rad, extra) => (x, y, w, h) => {
  for (let yy = y + rad - 1; yy < y + h + rad; yy += rad * 1.7) for (let xx = x + rad - 1 + (Math.round(yy) % 2 ? rad * 0.8 : 0); xx < x + w + rad; xx += rad * 1.8){
    const px = xx + (r() - 0.5) * 1.5, py = yy + (r() - 0.5) * 1.5;
    g.fillStyle = col; circ(g, px, py, rad); g.fill();
    g.fillStyle = 'rgba(255,255,255,.3)'; circ(g, px - rad * 0.35, py - rad * 0.35, rad * 0.35); g.fill();
    if (extra) extra(px, py);
  }
};
function melon(g, x, y, rx = 11, ry = 9){
  g.fillStyle = 'rgba(30,20,10,.25)'; ell(g, x + 2, y + 3, rx, ry); g.fill();
  g.fillStyle = '#d9d08a'; ell(g, x, y, rx, ry); g.fill();
  g.save(); ell(g, x, y, rx, ry); g.clip();
  g.strokeStyle = 'rgba(140,130,70,.75)'; g.lineWidth = 0.8;
  for (let k = -rx * 2; k < rx * 2; k += 4){ g.beginPath(); g.moveTo(x + k, y - ry); g.lineTo(x + k + ry * 1.4, y + ry); g.stroke(); g.beginPath(); g.moveTo(x + k, y + ry); g.lineTo(x + k + ry * 1.4, y - ry); g.stroke(); }
  g.fillStyle = 'rgba(120,150,60,.45)'; ell(g, x + 2, y + 2, rx * 0.8, ry * 0.7); g.fill();
  g.restore();
  g.fillStyle = 'rgba(255,255,255,.35)'; ell(g, x - rx * 0.4, y - ry * 0.4, rx * 0.3, ry * 0.25); g.fill();
}
function bouquet(g, r, x, y, cols, rot){
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = 'rgba(30,20,10,.2)'; g.beginPath(); g.moveTo(-15, 2); g.lineTo(9, -8); g.lineTo(11, 10); g.closePath(); g.fill();
  g.fillStyle = '#f3e6c4'; g.beginPath(); g.moveTo(-16, 0); g.lineTo(8, -10); g.lineTo(8, 9); g.closePath(); g.fill();
  g.strokeStyle = '#c9b48a'; g.lineWidth = 0.8; g.stroke();
  g.fillStyle = '#c23b2a'; g.fillRect(-6, -4, 2, 7);
  blooms(g, r, 10, 0, 8, cols);
  g.restore();
}
function awning(g, x, y, w, cols, label){
  const n = Math.round(w / 16), sw = w / n;
  g.fillStyle = 'rgba(30,20,10,.25)'; g.fillRect(x + 3, y + 14, w, 34);
  for (let i = 0; i < n; i++){
    const sx = x + i * sw;
    g.fillStyle = cols[i % 2]; g.fillRect(sx, y + 10, sw + 0.5, 22);
    g.beginPath(); g.arc(sx + sw / 2, y + 32, sw / 2, 0, Math.PI); g.fill();
  }
  g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x, y + 10, w, 4);
  g.fillStyle = cols[0]; g.fillRect(x, y, w, 12);
  g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x, y, w, 12);
  g.fillStyle = '#fffaf0'; g.font = '700 10px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(label.split('').join(' '), x + w / 2, y + 6.5);
}
function stallCounter(g, x, y, w, h, cloth, trim){
  g.fillStyle = 'rgba(30,20,10,.28)'; rr(g, x + 3, y + 5, w, h, 3); g.fill();
  g.fillStyle = '#7a4b2a'; rr(g, x, y, w, h, 3); g.fill();
  g.fillStyle = cloth; rr(g, x, y, w, h - 6, 3); g.fill();
  if (trim){ g.fillStyle = trim; for (let k = x + 4; k < x + w - 4; k += 10) g.fillRect(k, y + h - 8, 5, 2); }
}
function buildBgMercato(){
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const r = rng(67);
  g.fillStyle = '#9c917c'; g.fillRect(0, 0, W, H);
  cobbles(g, r, 0, 118, W, H, 33, 10, 64);
  // the central walkway: big trachyte slabs
  g.save(); g.beginPath(); g.rect(404, 122, 152, H - 122); g.clip();
  for (let y = 122, row = 0; y < H; y += 30, row++) for (let x = 404 - (row % 2 ? 25 : 0); x < 556; x += 50){
    const l = r(); g.fillStyle = `hsl(38, ${10 + l * 8}%, ${72 + l * 9}%)`; rr(g, x + 1, y + 1, 48, 28, 2); g.fill();
  }
  g.restore();
  g.fillStyle = '#8a806c'; g.fillRect(400, 122, 4, H - 122); g.fillRect(556, 122, 4, H - 122);
  // north side: a church on the left, the Palazzo della Ragione, houses on the right
  roofs(g, 0, 0, 220, 122, '#a5462b', r);
  g.fillStyle = '#e9e1cf'; g.fillRect(40, 18, 140, 104);
  g.fillStyle = '#d9cfba'; g.beginPath(); g.moveTo(34, 22); g.lineTo(110, 0); g.lineTo(186, 22); g.closePath(); g.fill();
  g.fillStyle = '#9c8f7b'; circ(g, 110, 58, 22); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1; for (let k = 0; k < 8; k++){ const a = k / 8 * 6.28; g.beginPath(); g.moveTo(110, 58); g.lineTo(110 + Math.cos(a) * 22, 58 + Math.sin(a) * 22); g.stroke(); }
  g.fillStyle = '#d9b44a'; circ(g, 110, 58, 4); g.fill();
  g.fillStyle = '#4a2f1e'; rr(g, 96, 96, 28, 26, 3); g.fill();
  roofs(g, 220, 0, 520, 30, '#a5462b', r);
  // the Palazzo: a long hull-shaped lead roof over an arcade
  g.fillStyle = 'rgba(20,20,20,.25)'; rr(g, 232, 14, 504, 84, 30); g.fill();
  const lead = g.createLinearGradient(0, 8, 0, 92); lead.addColorStop(0, '#9fb0ad'); lead.addColorStop(0.5, '#7d8f8c'); lead.addColorStop(1, '#5f706d');
  g.fillStyle = lead; rr(g, 228, 8, 504, 84, 30); g.fill();
  g.strokeStyle = 'rgba(40,55,52,.45)'; g.lineWidth = 1.2; for (let x = 252; x < 712; x += 12){ g.beginPath(); g.moveTo(x, 12); g.quadraticCurveTo(x + 3, 50, x, 88); g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(258, 26); g.lineTo(702, 26); g.stroke();
  g.fillStyle = '#ead7bf'; g.fillRect(220, 88, 520, 34);
  for (let k = 0; k < 26; k++){ g.fillStyle = k % 2 ? '#c98d7a' : '#efe3cf'; g.fillRect(220 + k * 20, 88, 20, 4); }
  for (let x = 232; x < 730; x += 26){ g.fillStyle = '#5a4030'; g.beginPath(); g.moveTo(x, 122); g.lineTo(x, 104); g.arc(x + 9, 104, 9, Math.PI, 0); g.lineTo(x + 18, 122); g.closePath(); g.fill(); }
  sign(g, 380, 92, 200, 14, 'PALAZZO DELLA RAGIONE', '#f2ead8', '#5a3a22', '700 9px "Titillium Web", sans-serif');
  roofs(g, 740, 0, 220, 122, '#b4512e', r);
  [[790, 30], [900, 64]].forEach(([x, y]) => { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + 4, y + 4, 18, 16); g.fillStyle = '#6f2f1b'; g.fillRect(x, y, 18, 16); g.fillStyle = '#2b1810'; g.fillRect(x + 4, y + 4, 10, 8); });
  g.fillStyle = 'rgba(40,12,6,.55)'; g.fillRect(218, 0, 4, 122); g.fillRect(738, 0, 4, 122);
  g.fillStyle = '#5e2614'; g.fillRect(0, 120, 220, 3); g.fillRect(740, 120, 220, 3);
  g.fillStyle = 'rgba(30,18,8,.22)'; g.fillRect(0, 123, W, 12);

  // the stalls: shade, poles, awning, and what hangs behind the counter
  const GOODS = {
    teresa(x, R){
      g.fillStyle = '#4a4a4a'; g.fillRect(x + 22, R.awn + 40, 3, R.ct - R.awn - 38); g.fillRect(x + 222, R.awn + 40, 3, R.ct - R.awn - 38);
      g.fillStyle = '#6a6a6a'; g.fillRect(x + 20, R.awn + 44, 208, 2.5);
      const cols = [['#f5f1e8'], ['#c23b2a'], ['#3a3a3a'], ['#f4b928'], ['#1c3d8f', '#f5f1e8'], ['#2e8b57'], ['#e58fa0'], ['#c23b2a'], ['#3a3a3a']];   // no blue: the blue one is on the counter (drawMercatoProps)
      cols.forEach(([col, st], k) => { const sx = x + 36 + k * 22.5; g.strokeStyle = '#8a8a8a'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx - 4, R.awn + 49); g.lineTo(sx, R.awn + 45); g.lineTo(sx + 4, R.awn + 49); g.stroke(); tshirt(g, sx, R.awn + 48, 19, col, st); });
    },
    franco(x, R){
      g.fillStyle = '#4a4a4a'; g.fillRect(x + 22, R.awn + 40, 3, R.ct - R.awn - 38); g.fillRect(x + 232, R.awn + 40, 3, R.ct - R.awn - 38);
      g.fillStyle = '#6a6a6a'; g.fillRect(x + 20, R.awn + 44, 218, 2.5);
      const ties = [['#8a2a3a', '#d9b44a'], ['#1c3d8f', '#f5f1e8'], ['#2e6a4e'], ['#c23b2a', '#2b2b2b'], ['#5a3a7a'], ['#d9a24a', '#8a2a3a'], ['#3a5a8a', '#c23b2a'], ['#2b2b2b']];
      ties.forEach(([col, p], k) => tie(g, x + 34 + k * 12, R.awn + 46, col, p));
      [['#c23b2a', '#f4b928'], ['#2f4f6f', '#9fb6d0'], ['#e3c47a', '#8a5a33'], ['#6b8f71', '#2e4a33']].forEach(([a, b], k) => scarf(g, x + 140 + k * 24, R.awn + 46, 16, 20, a, b));
    },
    gino(x, R){
      const F = [['#c23b2a', '#e04a5a'], ['#f6d23c'], ['#f3f0f5', '#e8a0c0'], ['#9a5ad0', '#c99af0'], ['#f08a3a', '#f6d23c'], ['#e04a7a', '#f3f0f5']];
      for (let k = 0; k < 11; k++){ const bx = x + 26 + k * 27; if (Math.abs(bx - 630) < 30) continue; bucket(g, r, bx, R.awn + 56, F[k % F.length], 11); }   // a gap where Gino stands
    },
    pina(x, R){
      const fills = [produce(g, r, '#f08a1c', 4.2), produce(g, r, '#f3d23a', 3.6), produce(g, r, '#c8312a', 4, (px, py) => { g.fillStyle = '#3f7a2e'; circ(g, px, py - 2.5, 1.3); g.fill(); }),
        produce(g, r, '#7fae3a', 4), produce(g, r, '#6a2a6a', 2.4), produce(g, r, '#d94a2a', 4.2)];
      for (let k = 0; k < 8; k++) crate(g, x + 14 + k * 39, R.awn + 44, 36, 26, fills[k % fills.length]);
    },
  };
  const LABEL = { teresa:'MAGLIETTE', franco:'CRAVATTE · SCIARPE', gino:'FIORI', pina:'FRUTTA E VERDURA' };
  STALLS.forEach(s => {
    const R = STALL_ROW[s.row];
    g.fillStyle = 'rgba(30,20,10,.18)'; g.fillRect(s.x, R.awn + 8, STALL_W, R.ct - R.awn);
    g.fillStyle = '#4a4a4a'; g.fillRect(s.x + 4, R.awn + 6, 4, R.ct - R.awn); g.fillRect(s.x + STALL_W - 8, R.awn + 6, 4, R.ct - R.awn);
    GOODS[s.id](s.x, R);
    awning(g, s.x, R.awn, STALL_W, s.awn, LABEL[s.id]);
    stallSign(g, s, R);
  });

  // south side: spare crates, a hand cart, a scooter, a few dropped leaves
  const stack = (x, y) => { crate(g, x - 18, y - 14, 36, 26); crate(g, x - 15, y - 18, 36, 26); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x - 15, y - 18, 36, 3); };
  stack(34, 470); stack(926, 470);
  g.save(); g.translate(180, 520); g.rotate(-0.12);
  g.fillStyle = 'rgba(30,20,10,.25)'; g.fillRect(-26, -16, 56, 36);
  g.fillStyle = '#2b2b2b'; g.fillRect(-24, -20, 8, 4); g.fillRect(-24, 16, 8, 4); g.fillRect(14, -20, 8, 4); g.fillRect(14, 16, 8, 4);
  g.fillStyle = '#8a5a33'; g.fillRect(-28, -17, 54, 34); g.strokeStyle = '#5a3a22'; g.lineWidth = 3; g.beginPath(); g.moveTo(26, -12); g.lineTo(40, -14); g.moveTo(26, 12); g.lineTo(40, 14); g.stroke();
  crate(g, -25, -14, 24, 28, produce(g, r, '#f08a1c', 4)); crate(g, 0, -14, 24, 28, produce(g, r, '#7fae3a', 4));
  g.restore();
  g.save(); g.translate(800, 528); g.rotate(Math.PI / 2 + 0.2); vespa(g, '#c23b2a'); g.restore();
  [[300, 470, '#7fae3a'], [612, 560, '#7fae3a'], [700, 450, '#5d8f44'], [258, 290, '#7fae3a']].forEach(([x, y, col]) => { g.fillStyle = col; ell(g, x, y, 5, 3, x % 3); g.fill(); });
  g.fillStyle = '#f08a1c'; circ(g, 372, 556, 4); g.fill();
  [[160, 450], [800, 450]].forEach(([x, y]) => { g.fillStyle = '#2b2b2b'; circ(g, x, y, 5); g.fill(); g.fillStyle = '#f6e7a6'; circ(g, x, y, 2.5); g.fill(); });
  g.fillStyle = '#8e836f'; g.fillRect(0, 590, W, 10);
  bgMercato = c;

  // the counters, one strip per stall row
  MERCATO_FRONT = STALL_ROW.map((R, row) => {
    const top = R.ct - 18, h = R.ch + 30;
    const f = document.createElement('canvas'); f.width = W * DPR; f.height = h * DPR;
    const q = f.getContext('2d'); q.scale(DPR, DPR); q.translate(0, -top);
    STALLS.filter(s => s.row === row).forEach(s => {
      const x = s.x + 10, w = STALL_W - 20, y = R.ct, vx = s.vx;
      if (s.id === 'teresa'){
        stallCounter(q, x, y, w, R.ch, '#f5f1e8', '#1c3d8f');
        [['#c23b2a', '#e04a3a'], ['#f4b928', '#f6d23c'], ['#2e8b57', '#3a9a64'], ['#f5f1e8', '#e9e3d6'], ['#3a3a3a', '#4a4a4a']].forEach(([a, b], k) => {
          for (let j = 0; j < 3; j++){ q.fillStyle = 'rgba(0,0,0,.15)'; q.fillRect(x + 14 + k * 30, y + 3 - j * 2.5 + 1, 24, 12); q.fillStyle = j % 2 ? b : a; q.fillRect(x + 12 + k * 30, y + 3 - j * 2.5, 24, 12); }
        });
        q.fillStyle = '#8a8a8a'; rr(q, vx - 30, y + 3, 16, 10, 2); q.fill(); q.fillStyle = '#5a5a5a'; q.fillRect(vx - 28, y + 5, 12, 2);
      }
      if (s.id === 'franco'){
        stallCounter(q, x, y, w, R.ch, '#efe6d2', '#2e6a4e');
        [['#c23b2a', '#f4b928'], ['#2f4f6f', '#9fb6d0'], ['#5a3a7a', '#d0b0e0'], ['#e3c47a', '#8a5a33']].forEach(([a, b], k) => scarf(q, x + 10 + k * 34, y + 1, 28, 11, a, b));
        q.fillStyle = '#2b2b2b'; rr(q, x + 150, y, 72, 15, 2); q.fill(); q.fillStyle = '#c9b48a'; rr(q, x + 152, y + 2, 68, 11, 2); q.fill();
        ['#8a2a3a', '#1c3d8f', '#2e6a4e', '#c23b2a', '#5a3a7a', '#d9a24a'].forEach((col, k) => { q.fillStyle = col; circ(q, x + 159 + k * 11, y + 7.5, 4.5); q.fill(); q.strokeStyle = 'rgba(255,255,255,.4)'; q.lineWidth = 0.8; circ(q, x + 159 + k * 11, y + 7.5, 2.2); q.stroke(); });
      }
      if (s.id === 'gino'){
        stallCounter(q, x, y, w, R.ch, '#e7efe0', '#c23b2a');
        bouquet(q, r, vx + 70, y + 8, ['#c23b2a', '#e04a5a', '#f3f0f5'], -0.15);
        bouquet(q, r, vx + 118, y + 8, ['#f6d23c', '#f08a3a'], 0.1);
        bouquet(q, r, vx + 166, y + 8, ['#9a5ad0', '#f3f0f5', '#e8a0c0'], -0.05);
        bucket(q, r, x + w - 40, y + 2, ['#f6d23c'], 12); bucket(q, r, x + w - 14, y + 4, ['#e04a7a', '#f3f0f5'], 11);
        bucket(q, r, x + 14, y + 4, ['#f08a3a', '#c23b2a'], 11);
      }
      if (s.id === 'pina'){
        stallCounter(q, x, y, w, R.ch, '#d9c09a', null);
        crate(q, x + 4, y - 4, 40, 26, (cx, cy, cw, ch) => { melon(q, cx + 10, cy + 10, 10, 8.5); melon(q, cx + 26, cy + 12, 10, 8.5); });
        q.fillStyle = 'rgba(0,0,0,.2)'; rr(q, vx - 12, y + 2, 26, 16, 3); q.fill();
        q.fillStyle = '#c23b2a'; rr(q, vx - 14, y, 26, 16, 3); q.fill(); q.fillStyle = '#d9dde0'; ell(q, vx - 1, y + 6, 10, 5); q.fill();
        q.fillStyle = '#fffdf8'; circ(q, vx - 1, y + 13, 2.6); q.fill(); q.strokeStyle = '#2b2b2b'; q.lineWidth = 0.8; q.beginPath(); q.moveTo(vx - 1, y + 13); q.lineTo(vx, y + 11.3); q.stroke();
        crate(q, vx + 32, y - 4, 40, 26, produce(q, r, '#f08a1c', 4.2));
        crate(q, vx + 76, y - 4, 40, 26, produce(q, r, '#c8312a', 4, (px, py) => { q.fillStyle = '#3f7a2e'; circ(q, px, py - 2.5, 1.3); q.fill(); }));
        crate(q, vx + 120, y - 4, 40, 26, (cx, cy, cw, ch) => { for (let k = 0; k < 7; k++){ q.fillStyle = k % 2 ? '#3f7a2e' : '#4f8a36'; rr(q, cx + 1, cy + 1 + k * 3, cw - 4, 3.4, 1.7); q.fill(); } });
        crate(q, vx + 164, y - 4, 40, 26, produce(q, r, '#f3d23a', 3.6));
        crate(q, vx + 208, y - 4, 40, 26, (cx, cy, cw, ch) => { for (let k = 0; k < 4; k++){ q.fillStyle = k % 2 ? '#7fae3a' : '#9ac85a'; circ(q, cx + 6 + k * 9, cy + 10, 6.5); q.fill(); q.strokeStyle = 'rgba(60,100,30,.6)'; q.lineWidth = 0.8; q.stroke(); } });
      }
    });
    return { c:f, top, h, y:R.ct + R.ch };
  });
}

/* ---------- the museum square (scene 'museo': MUSEO in world/scenes.js, the crowd and the clock in world/museo.js) ----------
   bgMuseo: the paving, the Museo d'Arte with its doors, the roof of the ticket booth, the planters, the Giardini
   dell'Arena behind their railing, the bench, the bikes, the clock tower's shadow. MUSEO_FRONT: the booth's glass window
   and counter, drawn in the depth-sorted pass so the cashier stands behind it. The tower itself: buildTowerSprite. */
let bgMuseo = null, MUSEO_FRONT = [];
function buildBgMuseo(){
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const r = rng(89), M = MUSEO, B = M.booth;
  g.fillStyle = '#a2967e'; g.fillRect(0, 0, W, H);
  cobbles(g, r, 0, 120, M.garden.x, H, 34, 9, 64);
  // the paved square in front of the museum: big trachyte slabs inside a stone kerb
  g.save(); g.beginPath(); g.rect(250, 150, 580, H - 150); g.clip();
  for (let y = 150, row = 0; y < H; y += 30, row++) for (let x = 250 - (row % 2 ? 26 : 0); x < 830; x += 52){
    const l = r(); g.fillStyle = `hsl(38, ${11 + l * 8}%, ${73 + l * 9}%)`; rr(g, x + 1, y + 1, 50, 28, 2); g.fill();
  }
  g.restore();
  g.fillStyle = '#8a806c'; g.fillRect(246, 150, 4, H - 150); g.fillRect(830, 150, 4, H - 150);
  // the north side: houses on the left, the Museo d'Arte (a long brick building), the garden's trees on the right
  roofs(g, 0, 0, 230, 122, '#a5462b', r);
  [[40, 26], [150, 70]].forEach(([x, y]) => { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + 4, y + 4, 18, 16); g.fillStyle = '#6f2f1b'; g.fillRect(x, y, 18, 16); g.fillStyle = '#2b1810'; g.fillRect(x + 4, y + 4, 10, 8); });
  roofs(g, 230, 0, 610, 96, '#b4512e', r);
  g.fillStyle = 'rgba(255,225,190,.18)'; g.fillRect(230, 44, 610, 5);
  g.fillStyle = '#b8613a'; g.fillRect(230, 96, 610, 54);                                   // the brick front
  g.strokeStyle = 'rgba(80,30,12,.28)'; g.lineWidth = 1; for (let y = 100; y < 146; y += 5){ g.beginPath(); g.moveTo(230, y + 0.5); g.lineTo(840, y + 0.5); g.stroke(); }
  g.fillStyle = '#e3d6bf'; g.fillRect(230, 94, 610, 4); g.fillRect(230, 142, 610, 8);       // cornice and plinth
  for (let x = 252; x < 830; x += 46){                                                      // tall arched windows
    if (x > 340 && x < 470) continue;                                                       // (the portal)
    if (x > B.x - 30 && x < B.x + B.w + 4) continue;                                         // (behind the booth)
    g.fillStyle = '#e3d6bf'; g.beginPath(); g.moveTo(x - 1, 136); g.lineTo(x - 1, 112); g.arc(x + 9, 112, 10, Math.PI, 0); g.lineTo(x + 19, 136); g.closePath(); g.fill();
    g.fillStyle = '#3d3a3a'; g.beginPath(); g.moveTo(x + 2, 134); g.lineTo(x + 2, 112); g.arc(x + 9, 112, 7, Math.PI, 0); g.lineTo(x + 16, 134); g.closePath(); g.fill();
    g.fillStyle = 'rgba(160,200,230,.25)'; g.fillRect(x + 3, 114, 5, 18);
  }
  // the portal: a stone frame, glass doors, the name over them, two banners
  const dx = M.doors.x;
  g.fillStyle = '#efe8da'; g.fillRect(dx - 44, 100, 88, 50);
  g.fillStyle = '#d9cfba'; g.fillRect(dx - 44, 100, 88, 6);
  g.fillStyle = '#26363a'; g.fillRect(dx - 34, 112, 68, 38);
  g.fillStyle = 'rgba(150,200,220,.35)'; g.fillRect(dx - 32, 114, 31, 36); g.fillRect(dx + 1, 114, 31, 36);
  g.fillStyle = '#c9a03a'; g.fillRect(dx - 5, 128, 2, 9); g.fillRect(dx + 3, 128, 2, 9);
  sign(g, dx - 100, 81, 200, 14, "MUSEO D'ARTE · I CAPOLAVORI", '#f2ead8', '#5a3a22', '700 8px "Titillium Web", sans-serif');
  [dx - 64, dx + 52].forEach((x, i) => {
    g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x + 2, 104, 14, 40);
    g.fillStyle = i ? '#1f3f7a' : '#8a2a3a'; g.fillRect(x, 102, 14, 40);
    g.beginPath(); g.moveTo(x, 142); g.lineTo(x + 7, 136); g.lineTo(x + 14, 142); g.closePath(); g.fillStyle = '#b8613a'; g.fill();
    g.fillStyle = '#f2ead8'; g.save(); g.translate(x + 7.5, 121); g.rotate(-Math.PI / 2); g.font = '700 7px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(i ? 'MOSTRA' : 'MUSEO', 0, 0); g.restore();
  });
  g.fillStyle = '#e3dccd'; g.fillRect(dx - 54, 150, 108, 8); g.fillStyle = '#d6cdb9'; g.fillRect(dx - 46, 158, 92, 7);   // steps
  g.fillStyle = 'rgba(120,105,80,.3)'; g.fillRect(dx - 54, 157, 108, 1.5); g.fillRect(dx - 46, 164, 92, 1.5);
  g.fillStyle = 'rgba(30,18,8,.22)'; g.fillRect(0, 150, M.garden.x, 8);
  g.fillStyle = 'rgba(40,12,6,.55)'; g.fillRect(228, 0, 4, 150);
  // the Giardini dell'Arena: lawn, a gravel path, an old brick arc of the Roman arena, trees, the railing
  const G = M.garden;
  g.fillStyle = '#7f9f5c'; g.fillRect(G.x, 0, G.w, H);
  for (let k = 0; k < 260; k++){ g.fillStyle = r() < 0.5 ? 'rgba(60,90,40,.25)' : 'rgba(170,200,120,.25)'; g.fillRect(G.x + r() * G.w, r() * H, 2, 3); }
  g.fillStyle = '#d8c9a6'; g.beginPath(); g.moveTo(G.x + 70, 0); g.bezierCurveTo(G.x + 40, 200, G.x + 100, 360, G.x + 60, H); g.lineTo(G.x + 84, H); g.bezierCurveTo(G.x + 124, 360, G.x + 64, 200, G.x + 94, 0); g.closePath(); g.fill();
  g.strokeStyle = '#a5563a'; g.lineWidth = 9; g.beginPath(); g.arc(G.x + 250, 470, 210, Math.PI * 0.86, Math.PI * 1.12); g.stroke();
  g.strokeStyle = 'rgba(60,20,10,.35)'; g.lineWidth = 1; for (let a = 0.86; a < 1.12; a += 0.025){ const A = a * Math.PI; g.beginPath(); g.moveTo(G.x + 250 + Math.cos(A) * 205, 470 + Math.sin(A) * 205); g.lineTo(G.x + 250 + Math.cos(A) * 215, 470 + Math.sin(A) * 215); g.stroke(); }
  const canopy = (x, y, rad) => {
    g.fillStyle = 'rgba(30,20,10,.22)'; circ(g, x + 6, y + 7, rad + 4); g.fill();
    for (let k = 0; k < 8; k++){ const a = k / 8 * 6.28; g.fillStyle = '#4f7a3d'; circ(g, x + Math.cos(a) * rad * 0.5, y + Math.sin(a) * rad * 0.5, rad * 0.55); g.fill(); }
    g.fillStyle = '#5f8c49'; circ(g, x, y, rad * 0.6); g.fill(); g.fillStyle = '#7aa65e'; circ(g, x - rad * 0.2, y - rad * 0.25, rad * 0.3); g.fill();
  };
  [[870, 40, 34], [930, 120, 30], [880, 250, 30], [935, 360, 28], [878, 470, 32], [930, 570, 26], [790, 34, 26]].forEach(([x, y, rad]) => canopy(x, y, rad));
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(G.x + 2, 150, 3, H - 150);
  g.fillStyle = '#2b2b2b'; g.fillRect(G.x - 1, 150, 3, H - 150);
  for (let y = 154; y < H; y += 12){ g.fillStyle = '#2b2b2b'; circ(g, G.x + 0.5, y, 2.2); g.fill(); }
  sign(g, G.x - 66, 320, 62, 26, '', '#f2ead8', '#2e5a3a');
  g.fillStyle = '#2e5a3a'; g.font = '700 7.5px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('GIARDINI', G.x - 35, 329); g.fillText("DELL'ARENA", G.x - 35, 339);
  // the planters on either side of the booth: stone boxes of box hedge and oleander
  M.planters.forEach(p => {
    g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, p.x + 3, p.y + 4, p.w, p.h, 3); g.fill();
    g.fillStyle = '#d9d0bd'; rr(g, p.x, p.y, p.w, p.h, 3); g.fill(); g.strokeStyle = '#a99f8a'; g.lineWidth = 1.2; g.stroke();
    g.fillStyle = '#5a4030'; rr(g, p.x + 4, p.y + 4, p.w - 8, p.h - 8, 2); g.fill();
    for (let y = p.y + 14; y < p.y + p.h - 8; y += 15){ g.fillStyle = '#3f6a33'; circ(g, p.x + p.w / 2 + (r() - 0.5) * 4, y, 11); g.fill(); g.fillStyle = '#5a8a46'; circ(g, p.x + p.w / 2 - 3, y - 3, 6); g.fill(); }
    for (let k = 0; k < 18; k++){ g.fillStyle = r() < 0.6 ? '#e58fa0' : '#fffaf0'; circ(g, p.x + 8 + r() * (p.w - 16), p.y + 10 + r() * (p.h - 20), 2.4); g.fill(); }
  });
  // the ticket booth: its roof with the name along the front, and the room behind the window (its glass front is MUSEO_FRONT)
  g.fillStyle = 'rgba(30,20,10,.28)'; rr(g, B.x + 4, B.y + 4, B.w, B.h, 3); g.fill();
  g.fillStyle = '#efe3cc'; g.fillRect(B.x + 2, B.y + 40, B.w - 4, B.h - 40);
  g.fillStyle = '#c9b48a'; g.fillRect(B.x + 2, B.y + 40, B.w - 4, 6);
  g.fillStyle = '#7a5a3e'; [B.x + 10, B.x + B.w - 34].forEach(x => { g.fillRect(x, B.y + 44, 24, 6); g.fillStyle = '#f2ead8'; for (let k = 0; k < 4; k++) g.fillRect(x + 2 + k * 6, B.y + 45, 4, 4); g.fillStyle = '#7a5a3e'; });
  g.fillStyle = '#5f7d78'; rr(g, B.x - 2, B.y - 4, B.w + 4, 46, 3); g.fill();
  g.strokeStyle = 'rgba(30,50,48,.4)'; g.lineWidth = 1; for (let x = B.x + 12; x < B.x + B.w; x += 12){ g.beginPath(); g.moveTo(x + 0.5, B.y - 2); g.lineTo(x + 0.5, B.y + 26); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(B.x + 4, B.y, B.w - 8, 4);
  g.fillStyle = '#f2ead8'; g.fillRect(B.x - 2, B.y + 28, B.w + 4, 14);
  g.fillStyle = '#8a2a3a'; g.font = '700 9px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('B I G L I E T T E R I A', B.x + B.w / 2, B.y + 35.5);
  g.fillStyle = 'rgba(30,20,10,.3)'; g.fillRect(B.x - 2, B.y + 42, B.w + 4, 3);
  // the bench (Bruno's), its back to the south
  const bn = M.bench;
  g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, bn.x + 3, bn.y + 5, bn.w, bn.h, 3); g.fill();
  g.fillStyle = '#2b2b2b'; [bn.x + 8, bn.x + bn.w - 12].forEach(x => g.fillRect(x, bn.y - 1, 4, bn.h + 2));
  for (let k = 0; k < 3; k++){ g.fillStyle = k % 2 ? '#86592f' : '#9a6a3a'; rr(g, bn.x, bn.y + k * 4.5, bn.w, 4, 1.5); g.fill(); }
  g.fillStyle = '#6b4a2e'; rr(g, bn.x, bn.y + 15, bn.w, 5, 1.5); g.fill();
  // the bikes in their rack
  const bk = M.bikes;
  g.fillStyle = '#7d7d7d'; g.fillRect(bk.x, bk.y + bk.h - 4, bk.w, 3);
  ['#c23b2a', '#1c3d8f', '#2b2b2b', '#2e6a4e', '#e07a2f', '#7a3a6e'].forEach((col, i) => {
    const x = bk.x + 12 + i * 25, y = bk.y + 2;
    g.save(); g.translate(x, y + 13); g.rotate(-0.08 + (i % 2) * 0.12);
    g.fillStyle = 'rgba(30,20,10,.2)'; g.fillRect(-3, -12, 7, 28);
    g.fillStyle = '#2b2b2b'; ell(g, 0, -10, 1.8, 6); g.fill(); ell(g, 0, 10, 1.8, 6); g.fill();
    g.strokeStyle = col; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, -9); g.lineTo(0, 9); g.stroke();
    g.strokeStyle = '#3a3a3a'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(-6, -9); g.lineTo(6, -9); g.stroke();
    g.fillStyle = '#3a2a1a'; ell(g, 0, 4, 2.2, 3.5); g.fill();
    g.restore();
  });
  // trees and lamps on the square
  M.trees.forEach(([x, y]) => tree(g, r, x, y));
  [[262, 200], [262, 470], [818, 200], [818, 470]].forEach(([x, y]) => { g.fillStyle = 'rgba(0,0,0,.25)'; circ(g, x + 2, y + 3, 6); g.fill(); g.fillStyle = '#2b2b2b'; circ(g, x, y, 5); g.fill(); g.fillStyle = '#f6e7a6'; circ(g, x, y, 2.5); g.fill(); });
  drawTowerShadow(g);
  g.fillStyle = '#d9d0bd'; g.fillRect(M.tower.x - 6, M.tower.y + M.tower.h - 6, M.tower.w + 12, 8);   // the tower's footing
  g.fillStyle = '#8e836f'; g.fillRect(0, 590, M.garden.x, 10);
  bgMuseo = c;
  // the booth's front: the glass and the counter, in front of the cashier
  const top = B.y + 54, h = B.h - 54 + 6, f = document.createElement('canvas'); f.width = W * DPR; f.height = h * DPR;
  const q = f.getContext('2d'); q.scale(DPR, DPR); q.translate(0, -top);
  const gy = B.y + B.h;
  q.fillStyle = 'rgba(30,20,10,.25)'; q.fillRect(B.x + 3, gy - 6, B.w, 9);
  q.fillStyle = 'rgba(190,225,240,.42)'; q.fillRect(B.x + 2, top, B.w - 4, gy - top - 8);
  q.fillStyle = '#4a5c58'; for (let x = B.x + 2; x <= B.x + B.w - 1; x += (B.w - 4) / 3) q.fillRect(x - 1.5, top, 3, gy - top - 8);
  q.fillStyle = 'rgba(255,255,255,.55)'; q.fillRect(B.x + 10, top + 2, 18, 1.5); q.fillRect(B.x + 104, top + 2, 10, 1.5);
  q.strokeStyle = 'rgba(40,40,40,.6)'; q.lineWidth = 1; circ(q, B.x + B.w / 2, top + 5, 3); q.stroke();
  q.fillStyle = '#8a6a48'; rr(q, B.x - 2, gy - 9, B.w + 4, 9, 2); q.fill();
  q.fillStyle = '#a7845c'; q.fillRect(B.x - 2, gy - 9, B.w + 4, 3);
  q.fillStyle = '#2b2b2b'; rr(q, B.x + B.w - 28, gy - 8, 10, 7, 1.5); q.fill(); q.fillStyle = '#7fd18b'; q.fillRect(B.x + B.w - 26, gy - 7, 6, 2);
  ['#c23b2a', '#1f3f7a', '#f2ead8'].forEach((col, i) => { q.fillStyle = col; q.fillRect(B.x + 14 + i * 7, gy - 8, 6, 6); });
  MUSEO_FRONT = [{ c:f, top, h, y:gy }];
  buildTowerSprite();
}
