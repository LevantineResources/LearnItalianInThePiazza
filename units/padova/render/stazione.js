/* The station's drawing (scene 'stazione', world/stazione.js): the background (built lazily, bgStazione), the ticket
   office's glass front (in the depth-sorted pass, so the clerk stands behind it), the departures board with its live
   rows, the trains (a regional on binario 4; the Venice train on binario 3, by day or the night train, pulling out). */
let bgStazione = null, STAZ_FRONT = null;
function buildBgStazione(){
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR);
  const r = rng(131), T = STAZ;
  // the concourse: big polished slabs
  g.fillStyle = '#b9b1a0'; g.fillRect(0, 0, W, H);
  for (let y = T.top, row = 0; y < H; y += 34, row++) for (let x = -(row % 2) * 30; x < W; x += 60){
    const l = r(); g.fillStyle = `hsl(36, ${8 + l * 6}%, ${74 + l * 8}%)`; rr(g, x + 1, y + 1, 58, 32, 2); g.fill();
  }
  g.fillStyle = 'rgba(255,255,255,.08)'; for (let x = 60; x < W; x += 180) g.fillRect(x, T.top, 50, H - T.top);
  // the station's wings beside the tracks: roofs
  roofs(g, 0, 0, 104, 300, '#9f4a2c', r);
  roofs(g, 788, 0, 172, 300, '#a5462b', r);
  g.fillStyle = '#d9cbb0'; g.fillRect(104, 0, 16, 300); g.fillRect(772, 0, 16, 300);
  // the ballast between the middle tracks, with a strip of grass and a fence
  g.fillStyle = '#8f8676'; g.fillRect(372, 0, 148, 300);
  for (let k = 0; k < 420; k++){ g.fillStyle = r() < 0.5 ? 'rgba(60,55,48,.35)' : 'rgba(200,190,170,.35)'; g.fillRect(372 + r() * 148, r() * 300, 2, 2); }
  g.fillStyle = '#7f9a5c'; g.fillRect(412, 0, 68, 280);
  for (let k = 0; k < 60; k++){ g.fillStyle = 'rgba(60,90,40,.35)'; g.fillRect(414 + r() * 64, r() * 278, 2, 4); }
  // the tracks: ballast, sleepers, two rails, the buffer stop
  T.tracks.forEach(t => {
    g.fillStyle = '#7d7468'; g.fillRect(t.x, 0, T.trackW, T.buffer + 8);
    for (let k = 0; k < 160; k++){ g.fillStyle = r() < 0.5 ? 'rgba(40,36,30,.35)' : 'rgba(190,180,160,.3)'; g.fillRect(t.x + r() * T.trackW, r() * T.buffer, 2, 2); }
    for (let y = 4; y < T.buffer; y += 12){ g.fillStyle = '#5b4a3a'; g.fillRect(t.x + 4, y, T.trackW - 8, 6); }
    g.fillStyle = '#c8ccd2'; g.fillRect(t.x + 13, 0, 3, T.buffer); g.fillRect(t.x + T.trackW - 16, 0, 3, T.buffer);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(t.x + 16, 0, 1, T.buffer); g.fillRect(t.x + T.trackW - 13, 0, 1, T.buffer);
    g.fillStyle = '#c23b2a'; g.fillRect(t.x + 6, T.buffer - 6, T.trackW - 12, 10);
    g.fillStyle = '#fffdf8'; for (let x = t.x + 8; x < t.x + T.trackW - 8; x += 10) g.fillRect(x, T.buffer - 6, 5, 10);
  });
  // the platforms: paving, the yellow safety lines, benches, pillars of the canopy, the numbers at their heads
  T.platforms.forEach(p => {
    g.fillStyle = '#cfc6b3'; g.fillRect(p.x, 0, p.w, 300);
    for (let y = 0, row = 0; y < 300; y += 24, row++) for (let x = p.x + (row % 2) * 12; x < p.x + p.w; x += 24){ const l = r(); g.fillStyle = `hsl(40, 10%, ${76 + l * 7}%)`; g.fillRect(x + 1, y + 1, 22, 22); }
    g.fillStyle = '#f4b928'; g.fillRect(p.x + 8, 0, 4, 296); g.fillRect(p.x + p.w - 12, 0, 4, 296);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(p.x, 0, 3, 300); g.fillRect(p.x + p.w - 3, 0, 3, 300);
    [70, 210].forEach(y => { g.fillStyle = '#6b6f78'; g.fillRect(p.x + p.w / 2 - 4, y - 4, 8, 8); });   // the canopy's pillars
    g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, p.x + 27, 152, 20, 40, 3); g.fill();
    g.fillStyle = '#7a5a3a'; rr(g, p.x + 24, 150, 20, 40, 3); g.fill(); g.fillStyle = '#9a7048'; for (let k = 0; k < 3; k++) g.fillRect(p.x + 26 + k * 6, 152, 4, 36);
    p.bins.forEach((b, i) => {                                                               // the platform number signs: FS blue
      const x = i ? p.x + p.w - 34 : p.x + 14;
      g.fillStyle = 'rgba(0,0,0,.25)'; rr(g, x + 2, 252, 22, 24, 3); g.fill();
      g.fillStyle = '#1f3f7a'; rr(g, x, 250, 22, 24, 3); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.2; rr(g, x + 2, 252, 18, 20, 2); g.stroke();
      g.fillStyle = '#fff'; g.font = '800 15px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(b), x + 11, 263);
    });
  });
  // the concourse's north edge: the canopy's shadow line, the buffers' end
  g.fillStyle = 'rgba(30,20,10,.25)'; g.fillRect(0, T.top - 4, W, 6);
  g.fillStyle = '#6b6f78'; g.fillRect(0, T.top - 2, 176, 3); g.fillRect(316, T.top - 2, 260, 3); g.fillRect(716, T.top - 2, 244, 3);
  // the ticket office: the room behind the glass, its roof sign
  const O = T.office;
  g.fillStyle = 'rgba(30,20,10,.28)'; rr(g, O.x + 4, O.y + 4, O.w, O.h, 3); g.fill();
  g.fillStyle = '#e8ddc6'; g.fillRect(O.x + 2, O.y + 34, O.w - 4, O.h - 34);
  g.fillStyle = '#c9b48a'; g.fillRect(O.x + 2, O.y + 34, O.w - 4, 5);
  g.fillStyle = '#5a4a3a'; g.fillRect(O.x + 12, O.y + 40, 30, 8); g.fillStyle = '#2b2b2b'; g.fillRect(O.x + 130, O.y + 40, 22, 10);   // a desk, a printer
  g.fillStyle = '#2e4a6e'; rr(g, O.x - 2, O.y - 4, O.w + 4, 40, 3); g.fill();
  g.fillStyle = '#f2ead8'; g.fillRect(O.x - 2, O.y + 20, O.w + 4, 14);
  g.fillStyle = '#1f3f7a'; g.font = '700 9px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('B I G L I E T T E R I A', O.x + O.w / 2, O.y + 27.5);
  g.fillStyle = '#fff'; g.font = '800 11px "Titillium Web", sans-serif'; g.fillText('FS  ·  Tickets', O.x + O.w / 2, O.y + 9);
  // the departures board's legs and shadow (the board itself: drawBoard, live)
  const B = T.board;
  g.fillStyle = 'rgba(30,20,10,.28)'; g.fillRect(B.x + 6, B.y + B.h, B.w, 8);
  g.fillStyle = '#4a4e56'; g.fillRect(B.x + 14, B.y + B.h - 2, 6, 10); g.fillRect(B.x + B.w - 20, B.y + B.h - 2, 6, 10);
  // the validating machines: green posts
  T.machines.forEach(m => {
    g.fillStyle = 'rgba(30,20,10,.3)'; ell(g, m.x + 3, m.y + 6, 10, 6); g.fill();
    g.fillStyle = '#2e8b57'; rr(g, m.x - 8, m.y - 12, 16, 22, 3); g.fill();
    g.fillStyle = '#1f5f3c'; g.fillRect(m.x - 5, m.y - 4, 10, 3);
    g.fillStyle = '#e8f5ea'; g.fillRect(m.x - 5, m.y - 10, 10, 4);
    g.fillStyle = '#fff'; g.font = '700 6px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FS', m.x, m.y + 5);
  });
  // the street side: glass doors along the bottom, two planters, a kiosk
  g.fillStyle = '#8e836f'; g.fillRect(0, 590, W, 10);
  for (let x = 340; x < 620; x += 46){ g.fillStyle = 'rgba(150,200,220,.55)'; g.fillRect(x, 586, 40, 6); }
  [[120, 520], [840, 520]].forEach(([x, y]) => { g.fillStyle = '#d9d0bd'; circ(g, x, y, 18); g.fill(); g.fillStyle = '#4f7a3d'; circ(g, x, y, 13); g.fill(); g.fillStyle = '#6f9a55'; circ(g, x - 3, y - 3, 6); g.fill(); });
  g.fillStyle = 'rgba(30,20,10,.25)'; rr(g, 864, 334, 100, 40, 4); g.fill();
  g.fillStyle = '#c23b2a'; rr(g, 860, 330, 100, 40, 4); g.fill(); g.fillStyle = '#f2ead8'; g.font = '700 10px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('EDICOLA · BAR', 910, 350);
  // the name on the floor by the entrance, as on a mat
  g.fillStyle = 'rgba(31,63,122,.85)'; rr(g, 404, 548, 152, 22, 4); g.fill(); g.fillStyle = '#fff'; g.font = '700 11px "Titillium Web", sans-serif'; g.fillText('STAZIONE  ·  PADOVA', 480, 559.5);
  bgStazione = c;
  // the office's glass front and counter, in front of the clerk
  const top = O.y + 46, gy = O.y + O.h, h = gy - top + 6, f = document.createElement('canvas'); f.width = W * DPR; f.height = h * DPR;
  const q = f.getContext('2d'); q.scale(DPR, DPR); q.translate(0, -top);
  q.fillStyle = 'rgba(30,20,10,.25)'; q.fillRect(O.x + 3, gy - 6, O.w, 9);
  q.fillStyle = 'rgba(190,225,240,.42)'; q.fillRect(O.x + 2, top, O.w - 4, gy - top - 8);
  q.fillStyle = '#3c4a5c'; for (let x = O.x + 2; x <= O.x + O.w - 1; x += (O.w - 4) / 2) q.fillRect(x - 1.5, top, 3, gy - top - 8);
  q.fillStyle = 'rgba(255,255,255,.55)'; q.fillRect(O.x + 12, top + 2, 18, 1.5);
  q.fillStyle = '#7a6a58'; rr(q, O.x - 2, gy - 9, O.w + 4, 9, 2); q.fill(); q.fillStyle = '#9a8770'; q.fillRect(O.x - 2, gy - 9, O.w + 4, 3);
  q.fillStyle = '#fffdf8'; rr(q, O.x + O.w - 52, gy - 8, 40, 6, 1); q.fill(); q.fillStyle = '#1f3f7a'; q.font = '700 5px "Titillium Web", sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('SPORTELLO 1', O.x + O.w - 32, gy - 5);
  STAZ_FRONT = { c:f, top, h, y:gy };
}
/* a train seen from above: cars along a track, x = the track's left edge, y = the rear end (the buffers' side) */
function drawTrain(x, rear, kind){
  const w = 44, carH = 124, gap = 6, x0 = x + 6;
  const night = kind === 'night', body = night ? '#1b2a52' : kind === 'regional' ? '#e8e4dc' : '#f2f2f2', stripe = night ? '#c9a03a' : kind === 'regional' ? '#2e8b57' : '#c23b2a';
  for (let k = 0; k < 5; k++){
    const y = rear - (k + 1) * carH - k * gap;
    if (y > H || y + carH < -10) continue;
    ctx.fillStyle = 'rgba(0,0,0,.28)'; rr(ctx, x0 + 3, y + 4, w, carH, 7); ctx.fill();
    ctx.fillStyle = body; rr(ctx, x0, y, w, carH, k === 4 ? 18 : 7); ctx.fill();
    ctx.fillStyle = stripe; ctx.fillRect(x0 + 2, y + 6, 4, carH - 12); ctx.fillRect(x0 + w - 6, y + 6, 4, carH - 12);
    ctx.fillStyle = night ? '#2c3d6e' : '#c9ccd2'; ctx.fillRect(x0 + 10, y + 8, w - 20, carH - 16);                       // the roof
    ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1; for (let yy = y + 20; yy < y + carH - 10; yy += 18){ ctx.beginPath(); ctx.moveTo(x0 + 10, yy); ctx.lineTo(x0 + w - 10, yy); ctx.stroke(); }
    ctx.fillStyle = night ? '#38497a' : '#9aa0aa'; rr(ctx, x0 + 16, y + carH / 2 - 10, 12, 20, 3); ctx.fill();         // a vent
    if (night){ ctx.fillStyle = 'rgba(255,214,140,.85)'; for (let yy = y + 14; yy < y + carH - 10; yy += 16){ ctx.fillRect(x0 + w - 3, yy, 3, 9); ctx.fillRect(x0, yy, 3, 9); } }
  }
  if (kind === 'night' || kind === 'day'){                                             // the open door of the last car, on the platform side
    const y = rear - carH + 20;
    ctx.fillStyle = '#2b2b2b'; ctx.fillRect(x0 + w - 3, y + 44, 5, 22);
    ctx.fillStyle = night ? 'rgba(255,214,140,.9)' : '#f4b928'; ctx.fillRect(x0 + w + 1, y + 46, 3, 18);
  }
}
function drawBoard(){
  const B = STAZ.board, all = stazioneBoard(), hot = all.filter(r => r.cls === 'hot');
  const rows = all.filter(r => r.cls !== 'hot').slice(0, 4 - hot.length).concat(hot).sort((a, b) => all.indexOf(a) - all.indexOf(b));   // (the highlighted train always shows)
  ctx.fillStyle = 'rgba(0,0,0,.3)'; rr(ctx, B.x + 3, B.y + 4, B.w, B.h, 4); ctx.fill();
  ctx.fillStyle = '#16181d'; rr(ctx, B.x, B.y, B.w, B.h, 4); ctx.fill();
  ctx.strokeStyle = '#4a4e56'; ctx.lineWidth = 2; rr(ctx, B.x, B.y, B.w, B.h, 4); ctx.stroke();
  ctx.fillStyle = '#f4b928'; ctx.font = '800 8px "Titillium Web", sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('PARTENZE', B.x + 6, B.y + 8);
  ctx.font = '700 7px "Titillium Web", sans-serif';
  rows.forEach((r0, i) => {
    const y = B.y + 18 + i * 9;
    ctx.fillStyle = r0.cls === 'hot' ? '#ffd75a' : '#f2f2f2';
    ctx.fillText(r0.time, B.x + 6, y); ctx.fillText(r0.dest.replace('Porta Nuova', 'P.N.').replace('Centrale', 'C.le').toUpperCase().slice(0, 18), B.x + 32, y);
    ctx.textAlign = 'right'; ctx.fillText(String(r0.bin), B.x + B.w - 6, y); ctx.textAlign = 'left';
  });
}
/* the station's depth-sorted things: the trains (behind everyone), the board, the office front */
function stazioneEnts(){
  const out = [{ y:-1, draw:() => {
    drawTrain(STAZ.tracks[3].x, STAZ.buffer - 4, 'regional');
    const t = stazioneTrain();
    if (t || STAZ_TRAIN.departing) drawTrain(STAZ.tracks[2].x, STAZ.buffer - 4 + (STAZ_TRAIN.departing ? STAZ_TRAIN.y : 0), STAZ_TRAIN.departing ? STAZ_TRAIN.kind : t.kind);
  } }];
  out.push({ y:STAZ.board.y + STAZ.board.h, draw:drawBoard });
  if (STAZ_FRONT) out.push({ y:STAZ_FRONT.y, draw:() => ctx.drawImage(STAZ_FRONT.c, 0, STAZ_FRONT.top, W, STAZ_FRONT.h) });
  return out;
}
