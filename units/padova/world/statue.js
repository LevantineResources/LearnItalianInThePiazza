/* The Gattamelata in Piazza del Santo: a landmark you can look at.
   One drawing of the bronze horse and rider (GM_ART, in profile, facing left) is used three ways:
   - in the scene, on top of its tall plinth (an oblique sprite drawn in the depth-sorted pass, render/sprites.js),
   - as its long shadow on the paving (buildBgSanto, render/backgrounds.js),
   - in the picture that opens when you press E beside it (openStatue): an eye-level view with the basilica behind.
   Walking up to it works like a door (world/doors.js): SCENES.santo has a door { id:'gattamelata', area, look:true };
   nearestDoor measures to the area, the prompt says "Guarda · E", and the guide adds a line. NPCs nearby win
   (E talks to Lucia or Bruno first; a follower like Mark does not), and the plinth is big enough to be reached from its other sides. */

/* GM_ART coordinates: origin on the plinth top between the hooves, x to the right, y down (up is negative).
   The horse is about 230 long and the rider's head is 215 above the plinth. */
const GM_ART = {
  body:'M -54 -128 C -60 -154 -76 -172 -90 -180 L -91 -192 L -98 -183 C -105 -178 -112 -164 -118 -150 C -122 -140 -125 -131 -126 -124 C -127 -113 -119 -108 -110 -110 C -102 -112 -97 -119 -93 -128 C -88 -118 -82 -104 -78 -93 C -75 -84 -69 -78 -58 -75 C -20 -70 30 -70 56 -76 C 70 -80 82 -92 86 -108 C 90 -124 80 -137 62 -139 C 30 -138 -20 -129 -40 -131 C -48 -131 -55 -130 -54 -128 Z',
  mane:'M -54 -128 C -60 -154 -76 -172 -90 -180 L -86 -170 C -74 -160 -64 -146 -58 -132 Z',
  legsFar:['M -48 -82 L -52 -44 L -54 -6', 'M 40 -82 L 50 -44 L 44 -6'],
  legsNear:['M -64 -88 L -80 -50 L -96 -28', 'M 56 -86 L 68 -46 L 62 -6'],
  tail:'M 84 -120 C 100 -108 104 -84 98 -54',
  cloth:'M -36 -133 C -10 -130 20 -134 40 -137 L 44 -112 C 20 -104 -12 -102 -38 -106 Z',
  leg:'M -2 -140 L -14 -112 L -12 -80 L -25 -77',
  torso:'M -13 -140 L 13 -141 C 12 -158 14 -176 12 -192 C 8 -198 -10 -199 -19 -193 C -17 -178 -12 -160 -13 -140 Z',
  skirt:'M -16 -146 L 18 -148 L 24 -126 L -20 -124 Z',
  arm:'M -10 -188 L -20 -166 L -38 -166',
  baton:'M -28 -160 L -76 -198',
  sword:'M 10 -136 L 58 -98',
  shine:'M -86 -176 C -74 -166 -62 -148 -56 -130 M -30 -132 C 0 -134 30 -140 62 -138 C 76 -136 86 -124 86 -110 M -116 -150 C -120 -138 -124 -130 -124 -124',
  shine2:'M -16 -190 C -14 -170 -10 -156 -11 -144',
};
const GM_BRONZE = { bronze:'#4e4430', dark:'#2f261a', light:'#9a8558' };
const gmRect = (x, y, w, h) => `M ${x} ${y} h ${w} v ${h} h ${-w} Z`;
const gmCirc = (x, y, r) => `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
/* the drawing as a list of shapes: { d, fill } or { d, stroke, w }, optional a (opacity) */
function gmOps(c = GM_BRONZE){
  const A = GM_ART, ops = [];
  A.legsFar.forEach(d => ops.push({ d, stroke:c.dark, w:13 }));
  [-54, 44].forEach(x => ops.push({ d:gmRect(x - 7, -8, 14, 8), fill:c.dark }));
  ops.push({ d:A.tail, stroke:c.dark, w:11 });
  ops.push({ d:gmCirc(-96, -13, 12), fill:c.dark });
  ops.push({ d:A.body, fill:c.bronze });
  ops.push({ d:A.mane, fill:c.dark });
  ops.push({ d:A.cloth, fill:c.dark, a:0.55 });
  A.legsNear.forEach(d => ops.push({ d, stroke:c.bronze, w:15 }));
  ops.push({ d:gmRect(54.5, -8, 15, 8), fill:c.dark });
  ops.push({ d:A.sword, stroke:c.dark, w:4 });
  ops.push({ d:A.skirt, fill:c.dark });
  ops.push({ d:A.leg, stroke:c.dark, w:17 });
  ops.push({ d:A.leg, stroke:c.bronze, w:13 });
  ops.push({ d:A.torso, fill:c.bronze });
  ops.push({ d:gmRect(-7.5, -205, 7, 12), fill:c.bronze });
  ops.push({ d:gmCirc(-4, -205, 8.5), fill:c.bronze });
  ops.push({ d:A.baton, stroke:c.dark, w:5 });
  ops.push({ d:A.arm, stroke:c.bronze, w:10 });
  if (c.light){
    ops.push({ d:A.shine, stroke:c.light, w:3, a:0.7 });
    ops.push({ d:A.shine2, stroke:c.light, w:2.5, a:0.6 });
    ops.push({ d:gmCirc(-6, -208, 3), fill:c.light, a:0.5 });
    ops.push({ d:gmCirc(-100, -160, 2), fill:c.dark });
  }
  return ops;
}
function gmSVG(c){
  return gmOps(c).map(o => `<path d="${o.d}" ${o.fill ? `fill="${o.fill}"` : `fill="none" stroke="${o.stroke}" stroke-width="${o.w}" stroke-linecap="round" stroke-linejoin="round"`}${o.a ? ` opacity="${o.a}"` : ''}/>`).join('');
}
function gmCanvas(g, c){
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const o of gmOps(c)){
    const p = new Path2D(o.d); g.globalAlpha = o.a || 1;
    if (o.fill){ g.fillStyle = o.fill; g.fill(p); } else { g.strokeStyle = o.stroke; g.lineWidth = o.w; g.stroke(p); }
  }
  g.globalAlpha = 1;
}

/* ---------- in the scene ----------
   GATTA (world/scenes.js) is the walk-blocking area. The plinth is drawn in an oblique view: its front (south) face
   rises PLINTH.h above the ground line, its top face is PLINTH.d deep, the statue stands on the middle of the top. */
const PLINTH = { x0:226, x1:374, ground:398, h:112, d:24, scale:0.52 };
let GM_SPRITE = null;
function buildStatueSprite(){
  const top = 140, bottom = GATTA.y + GATTA.h + 2, c = document.createElement('canvas');
  c.width = W * DPR; c.height = (bottom - top) * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR); g.translate(0, -top);
  const { x0, x1, ground, h, d, scale } = PLINTH, cx = (x0 + x1) / 2, ft = ground - h;
  // front face: stone blocks, a blind door with a carved frame, the inscription
  g.fillStyle = '#d9d0bd'; g.fillRect(x0, ft, x1 - x0, h);
  g.fillStyle = 'rgba(120,105,80,.18)'; g.fillRect(x1 - 18, ft, 18, h);
  g.strokeStyle = 'rgba(120,105,80,.35)'; g.lineWidth = 1;
  for (let y = ft + 16; y < ground - 6; y += 16){ g.beginPath(); g.moveTo(x0, y + 0.5); g.lineTo(x1, y + 0.5); g.stroke(); }
  g.fillStyle = '#c4b89f'; g.fillRect(x0 - 4, ground - 8, x1 - x0 + 8, 8);           // base moulding
  g.fillStyle = '#efe8da'; g.fillRect(x0 - 5, ft - 2, x1 - x0 + 10, 9);              // cornice
  g.fillStyle = 'rgba(90,75,55,.35)'; g.fillRect(x0 - 5, ft + 7, x1 - x0 + 10, 2);
  g.fillStyle = '#e3dac6'; g.fillRect(x0, ft + 8, x1 - x0, 18);                        // frieze
  for (let k = 0; k < 6; k++){ g.fillStyle = '#cdbfa3'; rr(g, x0 + 12 + k * 22.5, ft + 11, 14, 12, 1.5); g.fill(); }
  g.fillStyle = '#b9ac92'; rr(g, cx - 17, ft + 36, 34, 58, 2); g.fill();             // the blind door
  g.fillStyle = '#8f8169'; rr(g, cx - 13, ft + 40, 26, 54, 1.5); g.fill();
  g.strokeStyle = 'rgba(60,50,35,.5)'; g.beginPath(); g.moveTo(cx, ft + 40); g.lineTo(cx, ft + 94); g.stroke();
  [[x0 + 30, ft + 52], [x1 - 30, ft + 52]].forEach(([x, y]) => { g.fillStyle = '#c9bea6'; circ(g, x, y, 10); g.fill(); g.strokeStyle = 'rgba(90,75,55,.4)'; g.stroke(); g.fillStyle = '#a99c82'; circ(g, x, y, 5); g.fill(); });
  g.fillStyle = '#5a4a3a'; g.font = '700 7px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('OPUS DONATELLI FLO', cx, ground - 14);
  // top face
  g.fillStyle = '#f2ece0'; g.fillRect(x0 - 5, ft - 2 - d, x1 - x0 + 10, d);
  g.strokeStyle = 'rgba(150,135,110,.6)'; g.strokeRect(x0 - 4.5, ft - 1.5 - d, x1 - x0 + 9, d);
  g.fillStyle = 'rgba(60,45,30,.18)'; ell(g, cx - 4, ft - 2 - d / 2 + 2, 66, 7); g.fill();
  // the statue, standing on the middle of the top face
  g.save(); g.translate(cx + 8, ft - 2 - d / 2 + 4); g.scale(scale, scale); gmCanvas(g); g.restore();
  GM_SPRITE = { c, top, h:bottom - top, y:GATTA.y + GATTA.h };
}
/* the long shadow of plinth, horse and rider, thrown down and to the right across the steps and the paving (drawn into
   bgSanto; the light comes from the top left, as for every other shadow in the game) */
function drawStatueShadow(g){
  const { x0, x1, ground, h, scale } = PLINTH, cx = (x0 + x1) / 2, k = 0.75, s = 0.42, gy = ground - 12;
  const c = document.createElement('canvas'); c.width = W * DPR; c.height = H * DPR;
  const q = c.getContext('2d'); q.scale(DPR, DPR);
  q.transform(1, 0, -k, -s, k * gy, (1 + s) * gy);      // (x, y) → (x + k·(gy − y), gy + s·(gy − y)): heights lie down on the ground
  q.fillStyle = '#000'; q.fillRect(x0 - 5, gy - h - 2, x1 - x0 + 10, h + 2);
  q.save(); q.translate(cx + 8, gy - h - 2); q.scale(scale, scale);
  gmCanvas(q, { bronze:'#000', dark:'#000' }); q.restore();
  g.save(); g.globalAlpha = 0.22; g.drawImage(c, 0, 0, W, H); g.restore();
}
function drawStatueSprite(){ if (GM_SPRITE) ctx.drawImage(GM_SPRITE.c, 0, GM_SPRITE.top, W, GM_SPRITE.h); }
/* where a tap counts as "the statue" (the sprite's outline, roughly) */
const statueTapped = (x, y) => S.scene === 'santo' && x > PLINTH.x0 - 40 && x < PLINTH.x1 + 10 && y > 165 && y < GATTA.y + GATTA.h;

/* ---------- the picture: the statue from the paving, the basilica behind ---------- */
function statueSceneSVG(){
  const dome = (x, y, r, lantern = true) => `<path d="M ${x - r} ${y} A ${r} ${r * 0.95} 0 0 1 ${x + r} ${y} Z" fill="#8d97a0"/>
    <path d="M ${x - r * 0.55} ${y - r * 0.15} A ${r * 0.6} ${r * 0.8} 0 0 1 ${x - r * 0.05} ${y - r * 0.88}" fill="none" stroke="#b9c2c9" stroke-width="2.5" stroke-linecap="round"/>
    ${[-0.6, -0.2, 0.2, 0.6].map(f => `<path d="M ${x + f * r} ${y} Q ${x + f * r * 0.7} ${y - r * 0.6} ${x} ${y - r * 0.95}" fill="none" stroke="#6f7a84" stroke-width="1"/>`).join('')}
    <rect x="${x - r - 3}" y="${y - 3}" width="${2 * r + 6}" height="7" fill="#c9825a"/>
    ${lantern ? `<rect x="${x - 4}" y="${y - r * 0.95 - 14}" width="8" height="14" fill="#d8cdb8"/><path d="M ${x - 6} ${y - r * 0.95 - 14} L ${x} ${y - r * 0.95 - 24} L ${x + 6} ${y - r * 0.95 - 14} Z" fill="#8d97a0"/><circle cx="${x}" cy="${y - r * 0.95 - 27}" r="2.5" fill="#d9b44a"/>` : ''}`;
  const tower = x => `<rect x="${x - 6}" y="214" width="12" height="160" fill="#c47a52"/><rect x="${x - 8}" y="236" width="16" height="6" fill="#d8cdb8"/>
    <rect x="${x - 7}" y="200" width="14" height="16" fill="#d8cdb8"/><rect x="${x - 3}" y="203" width="6" height="10" fill="#7a5a44"/>
    <path d="M ${x - 8} 200 L ${x} 168 L ${x + 8} 200 Z" fill="#8d97a0"/><circle cx="${x}" cy="166" r="2.5" fill="#d9b44a"/>`;
  const arches = (x0, n, w, y, h) => Array.from({ length:n }, (_, i) => { const x = x0 + i * w; return `<path d="M ${x + 3} ${y + h} V ${y + w / 2} A ${w / 2 - 3} ${w / 2 - 3} 0 0 1 ${x + w - 3} ${y + w / 2} V ${y + h} Z" fill="#6e4434"/>`; }).join('');
  const people = [[392, 486, '#2f4f6f'], [404, 489, '#c23b2a'], [548, 484, '#6b8f71']].map(([x, y, col]) => `<rect x="${x - 3}" y="${y - 16}" width="6" height="12" rx="2" fill="${col}"/><circle cx="${x}" cy="${y - 19}" r="3" fill="#d9a37e"/><rect x="${x - 2.5}" y="${y - 5}" width="5" height="6" fill="#3a3a3a"/>`).join('');
  return `<svg class="gm-svg" viewBox="0 0 600 620" role="img" aria-label="The bronze Gattamelata, a rider on horseback, on its tall stone pedestal, with the domes of the Basilica del Santo behind">
  <defs>
    <linearGradient id="gmSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc6e0"/><stop offset="0.7" stop-color="#d7e6ec"/><stop offset="1" stop-color="#f3e6cf"/></linearGradient>
    <linearGradient id="gmStone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9e2d2"/><stop offset="0.75" stop-color="#ddd3bf"/><stop offset="1" stop-color="#c9bea6"/></linearGradient>
    <clipPath id="gmClip"><rect width="600" height="620"/></clipPath>
    <linearGradient id="gmGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9bb9e"/><stop offset="1" stop-color="#b3a385"/></linearGradient>
  </defs>
  <g clip-path="url(#gmClip)">
  <rect width="600" height="620" fill="url(#gmSky)"/>
  <g fill="#fffdf8" opacity=".8"><ellipse cx="96" cy="96" rx="46" ry="12"/><ellipse cx="128" cy="86" rx="30" ry="12"/><ellipse cx="470" cy="60" rx="40" ry="10"/><ellipse cx="500" cy="52" rx="24" ry="10"/></g>
  <g class="gm-basilica">
    ${tower(318)}${tower(578)}
    ${dome(372, 300, 40)}${dome(530, 300, 40)}${dome(420, 262, 34)}${dome(482, 262, 34)}${dome(451, 300, 54)}
    <path d="M 451 196 L 470 236 L 432 236 Z" fill="#8d97a0"/><circle cx="451" cy="193" r="3" fill="#d9b44a"/>
    <path d="M 334 476 V 352 H 360 L 451 300 L 542 352 H 568 V 476 Z" fill="#c9825a"/>
    <path d="M 360 352 L 451 300 L 542 352" fill="none" stroke="#e3d6bf" stroke-width="4"/>
    <rect x="334" y="352" width="234" height="5" fill="#e3d6bf"/>
    ${arches(352, 9, 22, 362, 24)}
    <rect x="334" y="392" width="234" height="4" fill="#e3d6bf"/>
    <path d="M 428 476 V 430 A 23 23 0 0 1 474 430 V 476 Z" fill="#5a3426"/><path d="M 428 430 A 23 23 0 0 1 474 430" fill="none" stroke="#e3d6bf" stroke-width="3"/>
    <path d="M 370 476 V 438 A 14 14 0 0 1 398 438 V 476 Z M 504 476 V 438 A 14 14 0 0 1 532 438 V 476 Z" fill="#6e4434"/>
    <circle cx="451" cy="330" r="10" fill="#e3d6bf"/><circle cx="451" cy="330" r="6" fill="#7d8a96"/>
  </g>
  <rect y="474" width="600" height="146" fill="url(#gmGround)"/>
  <g stroke="rgba(110,95,70,.35)" stroke-width="1.2">${[490, 510, 535, 565, 600].map(y => `<line x1="0" y1="${y}" x2="600" y2="${y}"/>`).join('')}${[-300, -150, 0, 150, 300, 450, 600, 750, 900].map(x => `<line x1="${300 + (x - 300) * 0.25}" y1="474" x2="${x}" y2="620"/>`).join('')}</g>
  ${people}
  <ellipse cx="300" cy="590" rx="210" ry="16" fill="rgba(60,45,30,.25)"/>
  <g class="gm-plinth">
    <rect x="70" y="560" width="290" height="22" fill="#cfc5af"/><rect x="70" y="560" width="290" height="4" fill="#e9e2d2"/>
    <rect x="84" y="540" width="262" height="22" fill="#d9d0bd"/><rect x="84" y="540" width="262" height="4" fill="#efe8da"/>
    <rect x="100" y="512" width="230" height="30" fill="#c9bea6"/><rect x="100" y="512" width="230" height="5" fill="#e9e2d2"/>
    <rect x="112" y="300" width="206" height="214" fill="url(#gmStone)"/>
    ${[330, 360, 390, 420, 450, 480].map(y => `<line x1="112" y1="${y}" x2="318" y2="${y}" stroke="rgba(120,105,80,.28)"/>`).join('')}
    <rect x="186" y="364" width="58" height="140" rx="3" fill="#b9ac92"/><rect x="194" y="372" width="42" height="132" rx="2" fill="#8f8169"/>
    <line x1="215" y1="372" x2="215" y2="504" stroke="rgba(60,50,35,.5)" stroke-width="1.5"/>
    <rect x="194" y="372" width="42" height="6" fill="#a99c82"/>
    ${[[146, 404], [284, 404]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#d6ccb6" stroke="rgba(90,75,55,.4)"/><circle cx="${x}" cy="${y}" r="11" fill="#b5a88e"/>`).join('')}
    <rect x="112" y="300" width="206" height="40" fill="#e3dac6"/>
    ${Array.from({ length:7 }, (_, i) => `<rect x="${124 + i * 28}" y="308" width="18" height="24" rx="2" fill="#cdbfa3"/>`).join('')}
    <text x="215" y="466" text-anchor="middle" font-family="Titillium Web, sans-serif" font-weight="700" font-size="11" letter-spacing="1.5" fill="#5a4a3a" opacity=".85">OPUS · DONATELLI · FLO</text>
    <rect x="100" y="286" width="230" height="16" fill="#efe8da"/><rect x="100" y="300" width="230" height="4" fill="rgba(90,75,55,.3)"/>
    <rect x="106" y="276" width="218" height="12" fill="#f6f1e6"/>
    <rect x="300" y="300" width="18" height="214" fill="rgba(110,95,70,.16)"/>
  </g>
  <g transform="translate(222 280) scale(1.15)">${gmSVG()}</g>
  <g fill="#7d8088"><ellipse cx="128" cy="273" rx="6" ry="4"/><circle cx="133" cy="270" r="2.6"/><ellipse cx="304" cy="273" rx="6" ry="4"/><circle cx="299" cy="270" r="2.6"/></g>
  </g>
</svg>`;
}
const STATUE_CAPTION = 'Il Gattamelata · Donatello, 1453';
function openStatue(){
  if (frozen()) return;
  openModal('statue');
  const l5ask = S.tut === 'l5-statue' && !S.l5statue;
  sheet.innerHTML = `<button class="x gm-x" data-close aria-label="Close">×</button>
    <figure class="gm-fig">${statueSceneSVG()}
      <figcaption><b class="gm-cap">${STATUE_CAPTION}</b><span class="gm-note">The first life-size bronze horse and rider since antiquity.</span></figcaption>
    </figure>
    <div class="gm-foot"><p>On the pedestal: <i>OPUS DONATELLI FLO</i>, “the work of Donatello the Florentine”.${l5ask ? ' Is this really it? Ask the girl who is sketching it.' : ''}</p>
      <button class="btn primary" data-close>Close</button></div>`;
  setTimeout(() => { const b = sheet.querySelector('.gm-foot [data-close]'); if (b) b.focus({ preventScroll:true }); }, 30);
}
const statueOpen = () => modalOpen && sheet.classList.contains('statue') && !sheet.classList.contains('clockface');
/* for tests: __dbg().statue */
function statueDbg(){
  const d = S.scene === 'santo' ? scene().doors.find(x => x.id === 'gattamelata') : null;
  const nd = !frozen() ? nearLandmark() : null;
  return { open:statueOpen(), near:!!(nd && nd.id === 'gattamelata'), area:d ? { ...d.area } : null,
    caption:statueOpen() ? (sheet.querySelector('.gm-cap') || {}).textContent : null, picture:statueOpen() && !!sheet.querySelector('svg.gm-svg .gm-plinth') };
}
