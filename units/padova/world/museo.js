/* The museum square (scene 'museo', Lesson 10 on): the clock tower (its sprite, its hands, and the close-up you open with
   E). The crowd and the Permesso pick, and the speech bubbles in the world, are the engine's (engine/world/crowd.js).
   Layout: MUSEO in world/scenes.js; background: buildBgMuseo in render/backgrounds.js; the people: content/npcs.js.

   THE CLOCK: museoClock() → { h, m }: a lesson's clock() hook, else S.clock (setClock(h, m)), else 15:00. The tower's
   hands sweep to a new time rather than jump. */

Object.assign(CROWD_HINTS, { scusi:'<i>Scusi</i> gets someone’s attention. To get past, use the word Bruno taught you.' });   // (Lesson 10)
UNIT.crowdAsideFace = n => ({ x:(MUSEO.booth.x + 72 - n.x) / 300, y:-1 });   // someone who stepped aside faces the booth

/* ---------- the clock ---------- */
function museoClock(){
  const h = askHooks('clock');
  const c = h && typeof h === 'object' ? h : S.clock || { h:15, m:0 };
  return { h:((Math.floor(c.h) % 24) + 24) % 24, m:((Math.floor(c.m) % 60) + 60) % 60 };
}
function setClock(h, m = 0){ S.clock = { h, m }; save(); }
let clockShown = null;          // minutes on the dial (0–719), sweeping towards museoClock()
function clockTick(dt){
  const c = museoClock(), tgt = (c.h % 12) * 60 + c.m;
  if (clockShown === null || RM){ clockShown = tgt; return; }
  let d = ((tgt - clockShown) % 720 + 720) % 720; if (d > 360) d -= 720;
  if (Math.abs(d) < 0.05) clockShown = tgt; else clockShown = (clockShown + d * Math.min(1, dt * 3.5) + 720) % 720;
}
function clockDbg(){
  const c = museoClock(), s = clockShown === null ? (c.h % 12) * 60 + c.m : clockShown;
  return { h:c.h, m:c.m, text:`${String(c.h).padStart(2, '0')}:${String(c.m).padStart(2, '0')}`,
    shown:{ h:Math.floor(s / 60) || 12, m:Math.round(s % 60) }, open:clockOpen(), near:S.scene === 'museo' && !frozen() && (nearLandmark() || {}).id === 'orologio' };
}
/* hands on a dial: minutes since 12 → [hour angle, minute angle], 0 = up, clockwise */
const handAngles = mins => [mins / 720 * 2 * Math.PI, (mins % 60) / 60 * 2 * Math.PI];

/* ---------- the clock tower in the scene ----------
   An oblique sprite like the Gattamelata's plinth: the front (south) face rises from the ground line, the clock on it. */
const TOWER = { x0:64, x1:160, ground:MUSEO.tower.y + MUSEO.tower.h, top:56, cx:112, cy:113, r:23 };
let TOWER_SPRITE = null;
function buildTowerSprite(){
  const T = TOWER, top = 0, bottom = T.ground + 2, c = document.createElement('canvas');
  c.width = W * DPR; c.height = (bottom - top) * DPR;
  const g = c.getContext('2d'); g.scale(DPR, DPR); g.translate(0, -top);
  const { x0, x1, ground } = T, w = x1 - x0, mid = T.cx;
  // the roof: a tiled pyramid seen from the front and a little above
  g.fillStyle = '#9f4a2c'; g.beginPath(); g.moveTo(x0 - 6, T.top); g.lineTo(mid, 8); g.lineTo(x1 + 6, T.top); g.closePath(); g.fill();
  g.save(); g.clip();
  g.strokeStyle = 'rgba(70,22,10,.4)'; g.lineWidth = 1.2;
  for (let y = 14; y < T.top; y += 7){ g.beginPath(); g.moveTo(x0 - 10, y); g.lineTo(x1 + 10, y); g.stroke(); }
  for (let x = x0 - 6; x < x1 + 6; x += 9){ g.beginPath(); g.moveTo(mid, 8); g.lineTo(x, T.top); g.stroke(); }
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.moveTo(mid, 8); g.lineTo(x1 + 6, T.top); g.lineTo(mid + 10, T.top); g.closePath(); g.fill();
  g.restore();
  g.fillStyle = '#d9b44a'; circ(g, mid, 8, 3); g.fill(); g.fillStyle = '#5a4030'; g.fillRect(mid - 1, 0, 2, 7);
  g.fillStyle = '#efe8da'; g.fillRect(x0 - 7, T.top - 2, w + 14, 6);
  // the belfry: an arch with the bell
  g.fillStyle = '#b8613a'; g.fillRect(x0, T.top + 4, w, 30);
  g.fillStyle = '#3a2418'; g.beginPath(); g.moveTo(mid - 12, T.top + 32); g.lineTo(mid - 12, T.top + 18); g.arc(mid, T.top + 18, 12, Math.PI, 0); g.lineTo(mid + 12, T.top + 32); g.closePath(); g.fill();
  g.fillStyle = '#c9a03a'; g.beginPath(); g.moveTo(mid - 7, T.top + 27); g.quadraticCurveTo(mid, T.top + 8, mid + 7, T.top + 27); g.closePath(); g.fill();
  g.fillStyle = '#efe8da'; g.fillRect(x0 - 4, T.top + 32, w + 8, 5);
  // the clock panel: white stone, a blue ring with gold stars, the dial
  g.fillStyle = '#e9e1cf'; g.fillRect(x0 + 6, T.top + 37, w - 12, 50);
  g.fillStyle = '#1f3f7a'; circ(g, T.cx, T.cy, T.r + 6); g.fill();
  for (let k = 0; k < 12; k++){ const a = k / 12 * 2 * Math.PI; g.fillStyle = '#e8c45a'; circ(g, T.cx + Math.sin(a) * (T.r + 3), T.cy - Math.cos(a) * (T.r + 3), 1.1); g.fill(); }
  g.fillStyle = '#fbf6e6'; circ(g, T.cx, T.cy, T.r); g.fill();
  g.strokeStyle = '#2b2b2b';
  for (let k = 0; k < 12; k++){
    const a = k / 12 * 2 * Math.PI, big = k % 3 === 0, r0 = T.r - (big ? 7 : 4.5);
    g.lineWidth = big ? 2.4 : 1.4; g.beginPath(); g.moveTo(T.cx + Math.sin(a) * r0, T.cy - Math.cos(a) * r0); g.lineTo(T.cx + Math.sin(a) * (T.r - 1.5), T.cy - Math.cos(a) * (T.r - 1.5)); g.stroke();
  }
  g.fillStyle = '#2b2b2b'; g.font = '700 7px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('XII', T.cx, T.cy - T.r + 11);
  // the brick shaft with a slit window, the stone base with its door
  const shaftTop = T.top + 87;
  g.fillStyle = '#b8613a'; g.fillRect(x0, shaftTop, w, ground - 30 - shaftTop);
  g.strokeStyle = 'rgba(80,30,12,.35)'; g.lineWidth = 1;
  for (let y = shaftTop + 5; y < ground - 30; y += 5){ g.beginPath(); g.moveTo(x0, y + 0.5); g.lineTo(x1, y + 0.5); g.stroke(); }
  g.fillStyle = '#3a2418'; rr(g, mid - 4, shaftTop + 14, 8, 22, 4); g.fill();
  g.fillStyle = '#d9d0bd'; g.fillRect(x0 - 2, ground - 32, w + 4, 32);
  g.strokeStyle = 'rgba(120,105,80,.35)'; for (let y = ground - 24; y < ground; y += 8){ g.beginPath(); g.moveTo(x0 - 2, y + 0.5); g.lineTo(x1 + 2, y + 0.5); g.stroke(); }
  g.fillStyle = '#5a3a22'; g.beginPath(); g.moveTo(mid - 11, ground); g.lineTo(mid - 11, ground - 18); g.arc(mid, ground - 18, 11, Math.PI, 0); g.lineTo(mid + 11, ground); g.closePath(); g.fill();
  g.strokeStyle = '#efe8da'; g.lineWidth = 2; g.beginPath(); g.arc(mid, ground - 18, 12, Math.PI, 0); g.stroke();
  g.fillStyle = 'rgba(70,30,15,.2)'; g.fillRect(x1 - 14, T.top + 4, 14, ground - T.top - 4);           // the shaded side
  g.strokeStyle = 'rgba(60,30,15,.45)'; g.lineWidth = 1; g.strokeRect(x0 + 0.5, T.top + 4.5, w - 1, ground - T.top - 5);
  TOWER_SPRITE = { c, top, h:bottom - top, y:ground };
}
function drawTowerSprite(){
  if (!TOWER_SPRITE) return;
  ctx.drawImage(TOWER_SPRITE.c, 0, TOWER_SPRITE.top, W, TOWER_SPRITE.h);
  const T = TOWER, [ha, ma] = handAngles(clockShown === null ? 0 : clockShown);
  ctx.save(); ctx.translate(T.cx, T.cy); ctx.lineCap = 'round';
  ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ha) * 12, -Math.cos(ha) * 12); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ma) * 19, -Math.cos(ma) * 19); ctx.stroke();
  ctx.fillStyle = '#c9a03a'; circ(ctx, 0, 0, 2.6); ctx.fill();
  ctx.restore();
}
/* its long shadow on the paving (drawn into the background, light from the top left) */
function drawTowerShadow(g){
  const T = TOWER, k = 0.75, s = 0.42, gy = T.ground;
  g.save(); g.globalAlpha = 0.2; g.fillStyle = '#000';
  g.transform(1, 0, -k, -s, k * gy, (1 + s) * gy);
  g.fillRect(T.x0, T.top, T.x1 - T.x0, gy - T.top);
  g.beginPath(); g.moveTo(T.x0 - 6, T.top); g.lineTo(T.cx, 8); g.lineTo(T.x1 + 6, T.top); g.closePath(); g.fill();
  g.restore();
}
const towerTapped = (x, y) => S.scene === 'museo' && x > TOWER.x0 - 8 && x < TOWER.x1 + 8 && y > 4 && y < TOWER.ground;

/* ---------- the clock face, close up (E beside the tower, or a tap) ---------- */
function clockFaceSVG(){
  const c = museoClock(), [ha, ma] = handAngles((c.h % 12) * 60 + c.m), cx = 300, cy = 300, R = 190;
  const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  const pt = (a, r) => [cx + Math.sin(a) * r, cy - Math.cos(a) * r].map(v => v.toFixed(1));
  const ticks = Array.from({ length:60 }, (_, k) => { const a = k / 60 * 2 * Math.PI, big = k % 5 === 0, [x1, y1] = pt(a, R - 4), [x2, y2] = pt(a, R - (big ? 22 : 12));
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2b2b2b" stroke-width="${big ? 5 : 2}" stroke-linecap="round"/>`; }).join('');
  const nums = ROMAN.map((t, k) => { const [x, y] = pt(k / 12 * 2 * Math.PI, R - 50); return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Bodoni Moda, Georgia, serif" font-weight="700" font-size="32" fill="#1b1b1b">${t}</text>`; }).join('');
  const stars = Array.from({ length:24 }, (_, k) => { const [x, y] = pt(k / 24 * 2 * Math.PI, R + 22); return `<circle cx="${x}" cy="${y}" r="${k % 2 ? 2.5 : 4}" fill="#e8c45a"/>`; }).join('');
  const [hx, hy] = pt(ha, R * 0.52), [mx, my] = pt(ma, R * 0.84);
  return `<svg class="gm-svg ck-svg" viewBox="0 0 600 620" role="img" aria-label="The clock on the tower, close up">
  <rect width="600" height="620" fill="#b8613a"/>
  <g stroke="rgba(80,30,12,.3)" stroke-width="2">${Array.from({ length:31 }, (_, i) => `<line x1="0" y1="${i * 20 + 10}" x2="600" y2="${i * 20 + 10}"/>`).join('')}</g>
  <rect x="40" y="40" width="520" height="540" fill="#e9e1cf"/><rect x="40" y="40" width="520" height="540" fill="none" stroke="#c9bea6" stroke-width="8"/>
  <circle cx="${cx}" cy="${cy}" r="${R + 38}" fill="#1f3f7a"/>${stars}
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="#fbf6e6" stroke="#c9a03a" stroke-width="6"/>
  ${ticks}${nums}
  <line class="ck-hour" x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="#1b1b1b" stroke-width="16" stroke-linecap="round"/>
  <line class="ck-min" x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="#1b1b1b" stroke-width="8" stroke-linecap="round"/>
  <circle cx="${cx}" cy="${cy}" r="14" fill="#c9a03a"/>
  <text x="300" y="566" text-anchor="middle" font-family="Titillium Web, sans-serif" font-weight="700" font-size="16" letter-spacing="3" fill="#5a4a3a">HORA · FUGIT</text>
</svg>`;
}
const CLOCK_CAPTION = 'La torre dell’orologio';
function openClockFace(){
  if (frozen()) return;
  openModal('statue clockface');
  sheet.innerHTML = `<button class="x gm-x" data-close aria-label="Close">×</button>
    <figure class="gm-fig">${clockFaceSVG()}
      <figcaption><b class="gm-cap">${CLOCK_CAPTION}</b><span class="gm-note">The clock on the tower over the museum square.</span></figcaption>
    </figure>
    <div class="gm-foot"><p>The short hand shows the hour, the long one the minutes.</p>
      <button class="btn primary" data-close>Close</button></div>`;
  setTimeout(() => { const b = sheet.querySelector('.gm-foot [data-close]'); if (b) b.focus({ preventScroll:true }); }, 30);
}
const clockOpen = () => modalOpen && sheet.classList.contains('clockface');
