/* The museum interior's drawing (scene 'galleria', layout and logic: world/galleria.js): the background (floors, walls and
   their faces, frames, plaques, benches, the skylight; built once, lazily, scene-sized), the pictures in their frames
   (thumbnails, drawn every frame as they load), the statues on their plinths and the doorway lintels (depth-sorted). */

/* the thumbnails, loaded when the scene is first drawn ('art/<thumb>': scripts/build.js copies them next to index.html) */
const GAL_THUMB = {};
function galLoadThumbs(){
  if (Object.keys(GAL_THUMB).length) return;
  for (const p of GAL_WORKS){ const im = new Image(); im.decoding = 'async'; im.src = 'art/' + p.w.thumb; GAL_THUMB[p.id] = im; }
}
const galThumbsLoaded = () => Object.values(GAL_THUMB).filter(im => im.complete && im.naturalWidth > 0).length;
const galReady = id => { const im = GAL_THUMB[id]; return im && im.complete && im.naturalWidth > 0 ? im : null; };

let BG_GAL = null;
function galleriaBg(){ if (!BG_GAL) buildBgGalleria(); return BG_GAL; }
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { BG_GAL = null; });   // rebuilt with the fonts

/* ---------- floors ---------- */
function galFloor(g, r, R, x, y, w, h){
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  if (R.floor === 'parquet'){
    /* parquet a quadrotte: squares of four planks, turned every other square */
    const u = 28, base = R.wood;
    g.fillStyle = base; g.fillRect(x, y, w, h);
    for (let yy = y - ((y) % u), row = 0; yy < y + h; yy += u, row++) for (let xx = x - (x % u), col = 0; xx < x + w; xx += u, col++){
      const across = (Math.round(xx / u) + Math.round(yy / u)) % 2 === 0;
      for (let k = 0; k < 4; k++){
        const l = r(); g.fillStyle = `rgba(${l < 0.5 ? '60,30,10' : '255,235,200'},${0.05 + Math.abs(l - 0.5) * 0.14})`;
        if (across) g.fillRect(xx, yy + k * 7, u, 7); else g.fillRect(xx + k * 7, yy, 7, u);
      }
      g.strokeStyle = 'rgba(60,32,12,.28)'; g.lineWidth = 0.8;
      for (let k = 1; k < 4; k++){ g.beginPath(); if (across){ g.moveTo(xx, yy + k * 7 + 0.4); g.lineTo(xx + u, yy + k * 7 + 0.4); } else { g.moveTo(xx + k * 7 + 0.4, yy); g.lineTo(xx + k * 7 + 0.4, yy + u); } g.stroke(); }
      g.strokeStyle = 'rgba(50,25,8,.4)'; g.strokeRect(xx + 0.4, yy + 0.4, u, u);
    }
  } else if (R.floor === 'resin'){
    /* the modern room: pale grey resin, big slabs, a sheen */
    g.fillStyle = '#dedcd6'; g.fillRect(x, y, w, h);
    for (let k = 0; k < 900; k++){ g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.35)' : 'rgba(120,115,105,.12)'; g.fillRect(x + r() * w, y + r() * h, 2, 2); }
    g.strokeStyle = 'rgba(120,115,105,.22)'; g.lineWidth = 1;
    for (let xx = x + 110; xx < x + w; xx += 110){ g.beginPath(); g.moveTo(xx + 0.5, y); g.lineTo(xx + 0.5, y + h); g.stroke(); }
    for (let yy = y + 100; yy < y + h; yy += 100){ g.beginPath(); g.moveTo(x, yy + 0.5); g.lineTo(x + w, yy + 0.5); g.stroke(); }
  } else if (R.floor === 'terrazzo'){
    /* Sala 5: Venetian terrazzo with a red border band */
    g.fillStyle = '#e3d8c4'; g.fillRect(x, y, w, h);
    const dots = w * h / 60;
    for (let k = 0; k < dots; k++){ const l = r(); g.fillStyle = l < 0.4 ? 'rgba(150,70,50,.45)' : l < 0.75 ? 'rgba(110,105,95,.4)' : 'rgba(255,255,255,.7)'; circ(g, x + r() * w, y + r() * h, 0.8 + r() * 1.6); g.fill(); }
    g.strokeStyle = 'rgba(150,60,45,.55)'; g.lineWidth = 6; g.strokeRect(x + 16, y + 14, w - 32, h - 28);
    g.strokeStyle = 'rgba(90,80,70,.35)'; g.lineWidth = 1; g.strokeRect(x + 22, y + 20, w - 44, h - 40);
  } else {
    /* the atrium: a chequerboard of white and grey marble, with a grey border */
    const u = 40;
    for (let yy = y, i = 0; yy < y + h; yy += u, i++) for (let xx = x, j = 0; xx < x + w; xx += u, j++){
      const l = r(), dark = (i + j) % 2 === 1;
      g.fillStyle = dark ? `hsl(30, 5%, ${60 + l * 6}%)` : `hsl(40, 25%, ${90 + l * 4}%)`; g.fillRect(xx, yy, u, u);
      g.strokeStyle = dark ? 'rgba(255,255,255,.18)' : 'rgba(120,110,95,.16)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(xx + r() * u, yy); g.bezierCurveTo(xx + r() * u, yy + u * 0.4, xx + r() * u, yy + u * 0.6, xx + r() * u, yy + u); g.stroke();
    }
    g.strokeStyle = 'rgba(90,80,70,.25)'; g.lineWidth = 0.8;
    for (let xx = x; xx <= x + w; xx += u){ g.beginPath(); g.moveTo(xx + 0.5, y); g.lineTo(xx + 0.5, y + h); g.stroke(); }
    for (let yy = y; yy <= y + h; yy += u){ g.beginPath(); g.moveTo(x, yy + 0.5); g.lineTo(x + w, yy + 0.5); g.stroke(); }
    g.fillStyle = '#8f877a'; g.fillRect(x, y, w, 10); g.fillRect(x, y, 10, h); g.fillRect(x + w - 10, y, 10, h); g.fillRect(x, y + h - 10, w, 10);
  }
  g.restore();
}

/* outside, beside Sala 5: the museum's courtyards (gravel, a lawn in a box hedge, a fountain, potted trees), open to the sky */
function galCourtyard(g, r, x, y, w, h){
  g.fillStyle = '#d9cdb2'; g.fillRect(x, y, w, h);
  for (let k = 0; k < w * h / 40; k++){ g.fillStyle = r() < 0.5 ? 'rgba(140,120,90,.3)' : 'rgba(255,250,235,.5)'; g.fillRect(x + r() * w, y + r() * h, 1.6, 1.6); }
  const lx = x + 50, ly = y + 50, lw = w - 100, lh = h - 110;
  g.fillStyle = '#3f6a33'; rr(g, lx - 8, ly - 8, lw + 16, lh + 16, 8); g.fill();
  g.fillStyle = '#86ad66'; g.fillRect(lx, ly, lw, lh);
  for (let k = 0; k < lw * lh / 120; k++){ g.fillStyle = r() < 0.5 ? 'rgba(60,90,40,.25)' : 'rgba(170,200,120,.3)'; g.fillRect(lx + r() * lw, ly + r() * lh, 2, 3); }
  g.fillStyle = '#d9cdb2'; g.fillRect(lx + lw / 2 - 12, ly - 8, 24, lh + 16); g.fillRect(lx - 8, ly + lh / 2 - 12, lw + 16, 24);
  g.fillStyle = 'rgba(30,20,10,.2)'; circ(g, lx + lw / 2 + 4, ly + lh / 2 + 5, 22); g.fill();
  g.fillStyle = '#e3dccd'; circ(g, lx + lw / 2, ly + lh / 2, 20); g.fill(); g.strokeStyle = '#a99f8a'; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = '#7db7d9'; circ(g, lx + lw / 2, ly + lh / 2, 14); g.fill();
  tree(g, r, lx + lw * 0.22, ly + lh * 0.26); tree(g, r, lx + lw * 0.78, ly + lh * 0.74);
  g.fillStyle = '#6b4a2e'; rr(g, x + w / 2 - 35, y + h - 40, 70, 12, 3); g.fill();
}

/* ---------- walls ---------- */
/* a north wall's face: the room's colour, darker towards the floor, a cornice, a picture rail, a skirting board */
function galFace(g, f){
  const R = galRoom(f.n);
  const gr = g.createLinearGradient(0, f.y, 0, f.y + f.h);
  gr.addColorStop(0, R.wall); gr.addColorStop(1, galShade(R.wall, -0.16));
  g.fillStyle = gr; g.fillRect(f.x, f.y, f.w, f.h);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(f.x, f.y, f.w, 4);                          // cornice
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(f.x, f.y + 4, f.w, 2);
  g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(f.x, f.y + 9, f.w, 1.5);                    // picture rail
  g.fillStyle = f.n === 4 ? '#d8d5ce' : f.n === 0 || f.n === 5 ? '#8f877a' : '#3b2a1e'; g.fillRect(f.x, f.y + f.h - 6, f.w, 6);   // skirting
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(f.x, f.y + f.h - 1, f.w, 1);
}
function galShade(hex, k){ return shade(hex, k); }
function galWallTop(g, w){
  g.fillStyle = '#d6cebf'; g.fillRect(w.x, w.y, w.w, w.h);
  g.strokeStyle = 'rgba(90,80,65,.55)'; g.lineWidth = 1; g.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
}
/* a plaque: two lines (the room's number, its name) on a dark panel */
function galPlaque(g, cx, y, top, sub, dark = '#22262e'){
  g.font = '700 9px "Titillium Web", sans-serif'; const w1 = g.measureText(top).width;
  g.font = 'italic 600 9px "Titillium Web", sans-serif'; const w2 = sub ? g.measureText(sub).width : 0;
  const w = Math.max(w1, w2) + 16, h = sub ? 26 : 16;
  g.fillStyle = 'rgba(0,0,0,.25)'; rr(g, cx - w / 2 + 1.5, y + 2, w, h, 3); g.fill();
  g.fillStyle = dark; rr(g, cx - w / 2, y, w, h, 3); g.fill();
  g.strokeStyle = '#c9a54e'; g.lineWidth = 1; rr(g, cx - w / 2 + 2.5, y + 2.5, w - 5, h - 5, 2); g.stroke();
  g.fillStyle = '#f2ead8'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '700 9px "Titillium Web", sans-serif'; g.fillText(top, cx, y + (sub ? 8.5 : h / 2 + 0.5));
  if (sub){ g.fillStyle = '#e3c47a'; g.font = 'italic 600 9px "Titillium Web", sans-serif'; g.fillText(sub, cx, y + 18.5); }
  return w;
}
const galRoomName = n => { const s = ART.rooms[String(n)], i = s.indexOf(' · '); return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + 3)]; };

function galBench(g, b){
  g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, b.x + 4, b.y + 6, b.w, b.h, 5); g.fill();
  g.fillStyle = '#9a9ea4'; [[b.x + 8, b.y + 3], [b.x + b.w - 14, b.y + 3], [b.x + 8, b.y + b.h - 7], [b.x + b.w - 14, b.y + b.h - 7]].forEach(([x, y]) => g.fillRect(x, y, 6, 4));
  g.fillStyle = '#3b302b'; rr(g, b.x, b.y, b.w, b.h - 3, 5); g.fill();
  g.fillStyle = '#56463e'; rr(g, b.x + 3, b.y + 3, b.w - 6, b.h - 10, 4); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; for (let x = b.x + 26; x < b.x + b.w - 10; x += 26){ g.beginPath(); g.moveTo(x + 0.5, b.y + 4); g.lineTo(x + 0.5, b.y + b.h - 8); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.12)'; rr(g, b.x + 6, b.y + 4, b.w - 12, 3, 1.5); g.fill();
}
/* a painting's frame on the wall (the picture itself is drawn every frame: drawGalleriaWorks) */
function galFrame(g, p){
  const { x, y, dw, dh } = p, n = p.room;
  // the light of the picture lamp on the wall
  const lg = g.createRadialGradient(p.cx, y - 4, 4, p.cx, y + dh * 0.4, Math.max(dw, dh) * 0.85);
  lg.addColorStop(0, 'rgba(255,240,200,.32)'); lg.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = lg; g.fillRect(x - dw * 0.4, y - 10, dw * 1.8, dh + 20);
  if (p.fresco){      // the fresco: painted on the wall, a plain stone border
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - 5, y - 5, dw + 10, dh + 10);
    g.fillStyle = '#d9cfbb'; g.fillRect(x - 4, y - 4, dw + 8, dh + 8);
    g.fillStyle = '#3a342c'; g.fillRect(x, y, dw, dh);
    return;
  }
  const fw = n === 4 ? 2.5 : dw > 80 ? 6 : 4.5;
  g.fillStyle = 'rgba(0,0,0,.32)'; g.fillRect(x - fw + 3, y - fw + 4, dw + 2 * fw, dh + 2 * fw);
  if (n === 4){ g.fillStyle = '#2a2a2a'; g.fillRect(x - fw, y - fw, dw + 2 * fw, dh + 2 * fw); }
  else {
    const gg = g.createLinearGradient(x - fw, y - fw, x + dw + fw, y + dh + fw);
    gg.addColorStop(0, '#e8cf86'); gg.addColorStop(0.45, '#b98d3c'); gg.addColorStop(1, '#7e5a22');
    g.fillStyle = gg; g.fillRect(x - fw, y - fw, dw + 2 * fw, dh + 2 * fw);
    g.strokeStyle = 'rgba(70,45,10,.6)'; g.lineWidth = 1; g.strokeRect(x - fw + 0.5, y - fw + 0.5, dw + 2 * fw - 1, dh + 2 * fw - 1);
    g.strokeStyle = 'rgba(255,240,190,.55)'; g.strokeRect(x - 1.5, y - 1.5, dw + 3, dh + 3);
  }
  g.fillStyle = '#2f2a24'; g.fillRect(x, y, dw, dh);
  // the picture lamp, and the label beside it
  g.fillStyle = '#7a6a48'; g.fillRect(p.cx - 7, y - fw - 5, 14, 3); g.fillStyle = '#c9b27a'; g.fillRect(p.cx - 6, y - fw - 5, 12, 1.5);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x + dw + fw + 5, y + dh - 9, 11, 8);
  g.fillStyle = '#fbf8f0'; g.fillRect(x + dw + fw + 4, y + dh - 10, 11, 8);
  g.fillStyle = 'rgba(60,50,40,.55)'; g.fillRect(x + dw + fw + 6, y + dh - 8, 7, 1); g.fillRect(x + dw + fw + 6, y + dh - 6, 5, 1); g.fillRect(x + dw + fw + 6, y + dh - 4, 6, 1);
}

function buildBgGalleria(){
  galLoadThumbs();
  const c = document.createElement('canvas'); c.width = GAL.w * DPR; c.height = GAL.h * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const r = rng(97), T = GAL.T, A = galRoom(0), R5 = galRoom(5);
  // outside the galleries: the roofs of the museum's other wings
  galCourtyard(g, r, 0, 0, R5.x - T, A.y - T);
  galCourtyard(g, r, R5.x + R5.w + T, 0, GAL.w - R5.x - R5.w - T, A.y - T);
  // floors (the faces are drawn over their top part)
  for (const n of [5, 2, 3, 1, 4, 0]){ const R = galRoom(n); galFloor(g, r, R, R.x, R.y, R.w, R.h); }
  // doorway floors: through the side walls (a marble sill), and the passages through north walls (the next room's floor)
  GAL.side.forEach(s => [A.x - T, A.x + A.w].forEach(x => { g.fillStyle = '#cfc7b8'; g.fillRect(x, s.y, T, GAL.doorW); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x, s.y, T, 2); g.fillRect(x, s.y + GAL.doorW - 2, T, 2); }));
  // the skylight's light on the atrium floor, and the shadows of its glazing bars
  { const sx = A.x + 60, sy = A.y + A.face + 120, sw = A.w - 120, sh = 520;
    g.fillStyle = 'rgba(255,248,225,.22)'; g.fillRect(sx, sy, sw, sh);
    g.fillStyle = 'rgba(80,70,50,.07)'; for (let x = sx + sw / 4; x < sx + sw - 1; x += sw / 4) g.fillRect(x - 2, sy, 4, sh); for (let y = sy + sh / 6; y < sy + sh - 1; y += sh / 6) g.fillRect(sx, y - 2, sw, 4);
    g.strokeStyle = 'rgba(255,250,235,.35)'; g.lineWidth = 2; g.strokeRect(sx, sy, sw, sh); }
  // window light on the floors of the outer rooms
  [[2, 'w'], [1, 'w'], [3, 'e'], [4, 'e']].forEach(([n, side]) => {
    const R = galRoom(n), fy = R.y + R.face;
    [fy + 70, fy + 200].forEach(wy => {
      const x0 = side === 'w' ? R.x : R.x + R.w;
      g.fillStyle = 'rgba(255,250,230,.13)'; g.beginPath();
      if (side === 'w'){ g.moveTo(x0, wy); g.lineTo(x0, wy + 56); g.lineTo(x0 + 120, wy + 96); g.lineTo(x0 + 120, wy + 40); }
      else { g.moveTo(x0, wy); g.lineTo(x0, wy + 56); g.lineTo(x0 - 120, wy + 96); g.lineTo(x0 - 120, wy + 40); }
      g.closePath(); g.fill();
    });
  });
  // north walls: faces, then the passages through them
  GAL_FACES.forEach(f => galFace(g, f));
  for (const n of [2, 3, 1, 4]){
    const R = galRoom(n), d = R.door, fb = galFaceBottom(R), to = galRoom(d.to);
    const oy = fb - GAL.open;
    // what you see through the doorway: the next room's floor, darker into the distance; a stone frame
    g.save(); g.beginPath(); g.rect(d.x, R.y - T, GAL.doorW, R.face + T); g.clip();
    galFloor(g, rng(5 + n), to, d.x, R.y - T, GAL.doorW, R.face + T);
    g.restore();
    const sh = g.createLinearGradient(0, oy, 0, fb); sh.addColorStop(0, 'rgba(20,15,10,.45)'); sh.addColorStop(1, 'rgba(20,15,10,0)');
    g.fillStyle = sh; g.fillRect(d.x, oy, GAL.doorW, GAL.open);
    // the wall above the opening (the lintel, drawn again over the player: galleriaEnts)
    galFace(g, { n, x:d.x, y:R.y, w:GAL.doorW, h:R.face - GAL.open });
    g.fillStyle = '#e7dfcf'; g.fillRect(d.x - 4, oy - 4, GAL.doorW + 8, 4); g.fillRect(d.x - 4, oy, 4, GAL.open); g.fillRect(d.x + GAL.doorW, oy, 4, GAL.open);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(d.x, oy, GAL.doorW, 2);
    const [top, sub] = galRoomName(d.to);
    galPlaque(g, d.x + GAL.doorW / 2, R.y + 13, top.toUpperCase(), sub);
  }
  // the atrium's face: the museum's name, the floor plan, the hall's name
  { const fy = A.y, cx = A.x + A.w / 2;
    g.fillStyle = '#5a4630'; g.font = '700 17px "Bodoni Moda", Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText("MUSEO D'ARTE", cx, fy + 40);
    g.fillStyle = '#8a2a3a'; g.font = 'italic 700 13px "Bodoni Moda", Georgia, serif'; g.fillText('I Capolavori', cx, fy + 60);
    g.fillStyle = 'rgba(90,70,48,.5)'; g.fillRect(cx - 60, fy + 72, 120, 1.5);
    galPlaque(g, cx, fy + 78, 'ATRIO', 'Le sculture');
    // the floor plan, on a panel ("Voi siete qui": you are here)
    const px = A.x + 22, py = fy + 22, pw = 92, ph = 70;
    g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(px + 2, py + 3, pw, ph);
    g.fillStyle = '#f6f2e8'; g.fillRect(px, py, pw, ph); g.strokeStyle = '#7a6a50'; g.lineWidth = 1; g.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
    const k = (pw - 10) / GAL.w, ox = px + 5, oy = py + 12;
    g.fillStyle = '#5a4630'; g.font = '700 6px "Titillium Web", sans-serif'; g.fillText('PIANTA DEL MUSEO', px + pw / 2, py + 6);
    for (const n of [5, 2, 3, 1, 4, 0]){ const R = galRoom(n); g.fillStyle = n ? galShade(R.wall, n === 4 ? -0.12 : 0.15) : '#e9e1d0'; g.fillRect(ox + R.x * k, oy + R.y * k, R.w * k, R.h * k); g.strokeStyle = 'rgba(60,45,30,.6)'; g.lineWidth = 0.6; g.strokeRect(ox + R.x * k, oy + R.y * k, R.w * k, R.h * k);
      if (n){ g.fillStyle = n === 4 ? '#5a4630' : '#fff'; g.font = '700 6px "Titillium Web", sans-serif'; g.fillText(String(n), ox + (R.x + R.w / 2) * k, oy + (R.y + R.h / 2) * k + 0.5); } }
    g.fillStyle = '#c23b2a'; circ(g, ox + GAL.exit.x * k, oy + (GAL.exit.y - 30) * k, 2); g.fill();
    // two banners
    [A.x + A.w - 66, A.x + A.w - 44].forEach((x, i) => {
      g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x + 2, fy + 18, 16, 64);
      g.fillStyle = i ? '#1f3f7a' : '#8a2a3a'; g.fillRect(x, fy + 16, 16, 64);
      g.beginPath(); g.moveTo(x, fy + 80); g.lineTo(x + 8, fy + 73); g.lineTo(x + 16, fy + 80); g.closePath(); g.fillStyle = A.wall; g.fill();
      g.save(); g.translate(x + 8.5, fy + 46); g.rotate(-Math.PI / 2); g.fillStyle = '#f2ead8'; g.font = '700 7px "Titillium Web", sans-serif'; g.fillText(i ? 'SCULTURA' : 'PITTURA', 0, 0); g.restore();
    });
  }
  // Sala 5: its name on the wall, beside the fresco
  { const [top, sub] = galRoomName(5), px = R5.x + 96;
    galPlaque(g, px, R5.y + 34, top.toUpperCase(), sub);
    g.fillStyle = 'rgba(60,45,30,.6)'; g.font = 'italic 600 9px "Titillium Web", sans-serif'; g.textAlign = 'center';
    g.fillText('Raffaello Sanzio', px, R5.y + 78); g.fillText('Urbino 1483 – Roma 1520', px, R5.y + 90); }
  // frames
  GAL_WORKS.filter(p => p.kind === 'painting').forEach(p => galFrame(g, p));
  // wall tops (over everything at their place), windows in the outer walls
  GAL_WALLS.forEach(w => galWallTop(g, w));
  for (const n of [2, 3, 1, 4]){       // over each doorway in a north wall: the wall goes on above it; a sill and a plaque on the far side
    const R = galRoom(n), d = R.door, y = R.y - T;
    galWallTop(g, { x:d.x, y, w:GAL.doorW, h:T });
    g.fillStyle = 'rgba(0,0,0,.14)'; g.fillRect(d.x + 2, y - 12, GAL.doorW - 4, 12); g.fillStyle = '#d3cab9'; g.fillRect(d.x + 2, y - 11, GAL.doorW - 4, 10);
    galPlaque(g, d.x + GAL.doorW / 2, y - 30, galRoomName(n)[0].toUpperCase() + '  ↓');
  }
  [[2, 'w'], [1, 'w'], [3, 'e'], [4, 'e']].forEach(([n, side]) => {
    const R = galRoom(n), fy = R.y + R.face, x = side === 'w' ? 0 : GAL.w - T;
    [fy + 70, fy + 200].forEach(wy => { g.fillStyle = '#9fc3d6'; g.fillRect(x + 4, wy, T - 8, 56); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x + 5, wy + 3, 2, 50); g.fillStyle = '#8a8170'; g.fillRect(x + 3, wy + 27, T - 6, 2); });
  });
  // the atrium's doorways to the side rooms: a plaque beside each (on the atrium side, just north of the doorway)
  GAL.side.forEach(s => {
    [[s.left, A.x + 8, 'l'], [s.right, A.x + A.w - 8, 'r']].forEach(([n, x, side]) => {
      const [top, sub] = galRoomName(n);
      g.font = 'italic 600 9px "Titillium Web", sans-serif'; const w = Math.max(60, g.measureText(sub).width + 16);
      galPlaque(g, side === 'l' ? x + w / 2 : x - w / 2, s.y - 29, top.toUpperCase() + (side === 'l' ? '  ←' : '  →'), sub);
    });
  });
  // the entrance: glass doors in the south wall, a mat, USCITA
  { const ex = GAL.exit.x, ey = GAL.exit.y;
    g.fillStyle = '#26363a'; g.fillRect(ex - 44, ey, 88, T);
    g.fillStyle = 'rgba(150,200,220,.55)'; g.fillRect(ex - 42, ey + 3, 41, T - 6); g.fillRect(ex + 1, ey + 3, 41, T - 6);
    g.fillStyle = '#c9a03a'; g.fillRect(ex - 6, ey + 5, 2, 6); g.fillRect(ex + 4, ey + 5, 2, 6);
    g.fillStyle = '#5a4a3e'; rr(g, ex - 40, ey - 30, 80, 26, 3); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; for (let y = ey - 27; y < ey - 6; y += 4){ g.beginPath(); g.moveTo(ex - 37, y + 0.5); g.lineTo(ex + 37, y + 0.5); g.stroke(); }
    g.fillStyle = '#2e7d4f'; rr(g, ex - 24, ey - 2, 48, 12, 2); g.fill();
    g.fillStyle = '#fff'; g.font = '700 8px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('USCITA', ex, ey + 4.5);
  }
  // benches, the guard's chair, the rope in front of the fresco
  GAL.benches.forEach(b => galBench(g, b));
  { const { x, y } = GAL.chair;
    g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, x - 9, y - 9, 24, 24, 3); g.fill();
    g.fillStyle = '#6b4a2e'; rr(g, x - 12, y - 12, 24, 24, 3); g.fill();
    g.fillStyle = '#8a2a3a'; rr(g, x - 9, y - 9, 18, 18, 3); g.fill();
    g.fillStyle = '#5a3a22'; rr(g, x - 14, y - 13, 6, 26, 2); g.fill(); }
  { const rl = GAL.rail, ry = rl.y + 12;
    g.strokeStyle = '#8a1f2a'; g.lineWidth = 3;
    for (let x = rl.x + 6; x < rl.x + rl.w - 6; x += (rl.w - 12) / 4){ const x2 = x + (rl.w - 12) / 4; g.beginPath(); g.moveTo(x, ry - 6); g.quadraticCurveTo((x + x2) / 2, ry + 2, x2, ry - 6); g.stroke(); }
    for (let x = rl.x + 6; x <= rl.x + rl.w - 5; x += (rl.w - 12) / 4){ g.fillStyle = 'rgba(0,0,0,.25)'; circ(g, x + 2, ry + 3, 5); g.fill(); g.fillStyle = '#b8913f'; circ(g, x, ry, 4.5); g.fill(); g.fillStyle = '#f0d890'; circ(g, x - 1, ry - 7, 2.6); g.fill(); g.strokeStyle = '#8a6a2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, ry); g.lineTo(x, ry - 6); g.stroke(); g.strokeStyle = '#8a1f2a'; g.lineWidth = 3; }
  }
  // the statues' soft shadows (the light comes from the top left)
  GAL_WORKS.filter(p => p.kind === 'statue').forEach(p => {
    g.fillStyle = 'rgba(40,30,20,.16)'; ell(g, p.x + 10, p.y + 2, p.pw * 0.62 + 6, 10); g.fill();
  });
  BG_GAL = c;
}

/* ---------- every frame ---------- */
/* the pictures, in their frames (until a thumbnail has loaded, the frame shows a dark canvas) */
function drawGalleriaWorks(){
  const x0 = cam.x - 20, x1 = cam.x + (cam.overview ? sceneW() : W) + 20, y0 = cam.y - 20, y1 = cam.y + (cam.overview ? sceneH() : H) + 20;
  for (const p of GAL_WORKS){
    if (p.kind !== 'painting' || p.x > x1 || p.x + p.dw < x0 || p.y > y1 || p.y + p.dh < y0) continue;
    const im = galReady(p.id); if (!im) continue;
    ctx.drawImage(im, p.x, p.y, p.dw, p.dh);
    ctx.fillStyle = 'rgba(255,245,215,.08)'; ctx.fillRect(p.x, p.y, p.dw, p.dh * 0.35);              // the lamp's light
  }
}
/* a statue on its plinth: the plinth in an oblique view (front face, top), the statue (its transparent PNG) on top;
   velvet ropes round some (the back half drawn before the statue, the front half after it) */
function drawGalStatue(p){
  const { x, y, pw, ph, pd, sw, sh, top } = p, x0 = x - pw / 2;
  ctx.fillStyle = '#ddd6c8'; ctx.fillRect(x0, y - ph, pw, ph);                                // front face
  ctx.fillStyle = 'rgba(120,105,80,.18)'; ctx.fillRect(x0 + pw - 8, y - ph, 8, ph);
  ctx.fillStyle = '#c9c0ae'; ctx.fillRect(x0 - 3, y - 5, pw + 6, 5);                          // base moulding
  ctx.fillStyle = '#f2ede3'; ctx.fillRect(x0 - 3, y - ph - pd, pw + 6, pd);                    // top
  ctx.strokeStyle = 'rgba(140,125,100,.55)'; ctx.lineWidth = 1; ctx.strokeRect(x0 - 2.5, y - ph - pd + 0.5, pw + 5, pd);
  ctx.fillStyle = '#b8913f'; ctx.fillRect(x - 9, y - ph + 9, 18, 7); ctx.fillStyle = '#e8cf86'; ctx.fillRect(x - 8, y - ph + 10, 16, 1.5);   // brass label
  ctx.fillStyle = 'rgba(60,45,30,.2)'; ell(ctx, x + 3, top, Math.min(sw, pw) * 0.42, 4); ctx.fill();
  const im = galReady(p.id);
  if (im) ctx.drawImage(im, x - sw / 2, top - sh, sw, sh);
  else { ctx.fillStyle = 'rgba(230,225,215,.9)'; rr(ctx, x - sw / 4, top - sh, sw / 2, sh, 8); ctx.fill(); }
}
function drawGalRope(p, half){
  const b = p.block, pts = [[b.x + 6, b.y + 6], [b.x + b.w - 6, b.y + 6], [b.x + b.w - 6, b.y + b.h - 6], [b.x + 6, b.y + b.h - 6]];
  const segs = half === 'back' ? [[0, 1], [1, 2], [3, 0]] : [[2, 3]], posts = half === 'back' ? [0, 1] : [2, 3];
  ctx.strokeStyle = '#8a1f2a'; ctx.lineWidth = 3;
  segs.forEach(([a, c]) => { const [x1, y1] = pts[a], [x2, y2] = pts[c]; ctx.beginPath(); ctx.moveTo(x1, y1 - 12); ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 - 2, x2, y2 - 12); ctx.stroke(); });
  posts.forEach(i => { const [x, y] = pts[i];
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ell(ctx, x + 2, y + 2, 5, 3); ctx.fill();
    ctx.strokeStyle = '#8a6a2a'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 13); ctx.stroke();
    ctx.fillStyle = '#b8913f'; ell(ctx, x, y, 4.5, 2.5); ctx.fill(); ctx.fillStyle = '#f0d890'; circ(ctx, x, y - 14, 2.6); ctx.fill(); });
}
/* the depth-sorted things: statues (and their ropes), and the lintels over the doorways in north walls (copied from the
   background), so the player walks under them */
function galleriaEnts(){
  const out = [];
  for (const p of GAL_WORKS){
    if (p.kind !== 'statue') continue;
    if (p.rope){ out.push({ y:p.block.y + 6, draw:() => drawGalRope(p, 'back') }); out.push({ y:p.block.y + p.block.h - 6, draw:() => drawGalRope(p, 'front') }); }
    out.push({ y:p.y, draw:() => drawGalStatue(p) });
  }
  const bgc = galleriaBg(), k = bgc.width / GAL.w;
  for (const n of [2, 3, 1, 4]){
    const R = galRoom(n), d = R.door, top = R.y - GAL.T - 1, h = R.face - GAL.open + GAL.T + 5, x = d.x - 4, w = GAL.doorW + 8;
    out.push({ y:galFaceBottom(R), draw:() => ctx.drawImage(bgc, x * k, top * k, w * k, h * k, x, top, w, h) });
  }
  return out;
}
