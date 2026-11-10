/* The museum square (scene 'museo', Lesson 10 on): the crowd and the Permesso pick, speech bubbles in the world, and the
   clock tower (its sprite, its hands, and the close-up you open with E). Layout: MUSEO in world/scenes.js; background:
   buildBgMuseo in render/backgrounds.js; the people: content/npcs.js.

   THE CROWD (reusable: any NPC with crowd:true, in any scene)
   - A crowd member is in the way, not someone to talk to: bumping into one (walking into them for a moment), pressing E
     beside one or tapping one opens a quick pick above the player: Permesso / Scusi / Prego (1 / 2 / 3, ← → Enter, Esc).
   - Permesso: "Permesso!" over the player (spoken), "Prego!" over them, and they walk out of the way along n.aside
     (waypoints; the last is where they stay, or a free spot near it). S.crowd[id] = { x, y } remembers it (lazy, not in
     FRESH()); placeCrowd() (every renderHUD) puts moved people there and everyone else at home.
   - Scusi: they turn round, "Sì?", and stay put; then a hint. Prego: a puzzled "?", and a hint.
   - Hooks (CLAUDE.md): crowdActive() → true / false (first hook returning a boolean wins; default true);
     onCrowd(npc, choice) → true when handled (choice 'permesso' | 'scusi' | 'prego', or null when the crowd is touched
     while inactive); crowdHint(npc, choice) → the hint html ('' for none); onCrowdMoved(npc) after they have stepped aside.
   - For lessons: crowdStepAside(npc | id, { by }) moves someone (by: an NPC id or 'player' says "Permesso!" first:
     Bruno's demonstration), crowdReset(ids?) puts people back, crowdPick(npc) opens the pick, worldSay(who, text, o)
     shows a bubble over the player ('player') or a person (an NPC or id) and speaks it (o.silent, o.ms, o.puzzled).

   THE CLOCK: museoClock() → { h, m }: a lesson's clock() hook, else S.clock (setClock(h, m)), else 15:00. The tower's
   hands sweep to a new time rather than jump. */

/* ---------- speech bubbles in the world ---------- */
const BUBBLES = [], SAID = [];      // SAID: the last bubbles shown (for tests: __dbg().crowd.said)
function worldSay(who, text, o = {}){
  const n = who === 'player' ? player : typeof who === 'string' ? NPC[who] : who;
  if (!n) return;
  for (let i = BUBBLES.length - 1; i >= 0; i--) if (BUBBLES[i].who === n) BUBBLES.splice(i, 1);
  SAID.push([n === player ? 'player' : n.id, text]); if (SAID.length > 12) SAID.shift();
  BUBBLES.push({ who:n, id:n === player ? 'player' : n.id, text, puzzled:!!o.puzzled, t0:performance.now(), ms:o.ms || 1900 });
  if (!o.silent && !o.puzzled) speak(text, n === player ? 1 : (n.pitch || 1), true);
}
/* for tests: where a world bubble's bottom edge is drawn over someone, and where their name pill / mark's top is (null: none) */
window.__bubbleAt = id => { const n = NPC[id]; return n ? { bubbleBottom:n.y - (personHasPill(n) ? 52 : n.kid ? 30 : 36), pillTop:personHasPill(n) ? n.y - 46 : null } : null; };
function drawWorldBubbles(){
  const now = performance.now();
  for (let i = BUBBLES.length - 1; i >= 0; i--) if (now - BUBBLES[i].t0 > BUBBLES[i].ms) BUBBLES.splice(i, 1);
  for (const b of BUBBLES){
    const p = b.who, age = now - b.t0, a = Math.min(1, age / 120, (b.ms - age) / 250);
    if (p !== player && !activeNpcs().includes(p)) continue;
    /* above the name pill (or the "?" / "!" mark) when the person has one (render/sprites.js draws them at y − 24 … y − 46) */
    const x = p.x, y = p.y - (personHasPill(p) ? 52 : p.kid ? 30 : 36) - (RM ? 0 : Math.min(1, age / 160) * 4);
    ctx.save(); ctx.globalAlpha = Math.max(0, a);
    ctx.font = b.puzzled ? '800 18px "Bodoni Moda", Georgia, serif' : 'italic 700 15px "Bodoni Moda", Georgia, serif';
    const w = Math.max(30, ctx.measureText(b.text).width + 20), h = 26;
    ctx.fillStyle = 'rgba(0,0,0,.22)'; rr(ctx, x - w / 2 + 2, y - h + 3, w, h, 11); ctx.fill();
    ctx.fillStyle = '#fffdf8'; rr(ctx, x - w / 2, y - h, w, h, 11); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 6, y - 1); ctx.lineTo(x + 3, y - 1); ctx.lineTo(x - 3, y + 7); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = p === player ? '#f4b928' : '#1c3d8f'; ctx.lineWidth = 2; rr(ctx, x - w / 2, y - h, w, h, 11); ctx.stroke();
    ctx.fillStyle = b.puzzled ? '#c23b2a' : '#0f2260'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.text, x, y - h / 2 + 1);
    ctx.restore();
  }
}

/* ---------- the crowd ---------- */
const CROWD = { pick:null, sel:0, latch:null, bumpT:0, bumpId:null, hint:null, toastT:0 };
const CROWD_OPTS = [{ k:'permesso', label:'Permesso' }, { k:'scusi', label:'Scusi' }, { k:'prego', label:'Prego' }];
const CROWD_HINTS = {
  scusi:'<i>Scusi</i> gets someone’s attention. To get past, use the word Bruno taught you.',
  prego:'<i>Prego</i> is what <i>they</i> say back.',
  inactive:'A crowd of visitors is in the way, and nobody turns round.',
};
const crowdRec = () => S.crowd || (S.crowd = {});
const crowdMoved = n => !!(S.crowd && S.crowd[n.id]);
const crowdAway = n => !!(n.crowd && (crowdMoved(n) || n.walkPath));
function crowdActive(){
  for (const h of hooks()){ if (typeof h.crowdActive !== 'function') continue; const r = h.crowdActive(); if (r === true || r === false) return r; }
  return true;
}
function placeCrowd(){
  for (const n of NPCS){
    if (!n.crowd || n.walkPath || n.cutWalk) continue;
    const r = S.crowd && S.crowd[n.id], p = r || n.home;
    n.x = p.x; n.y = p.y; if (!r) n.baseFace = { ...n.home.face };
  }
}
function crowdReset(ids){
  if (!S.crowd) return;
  (ids || Object.keys(S.crowd)).forEach(id => { delete S.crowd[id]; if (NPC[id]) NPC[id].walkPath = null; });
  save(); renderHUD();
}
/* E, a tap (openConvo) or a bump */
function crowdTouch(npc){
  if (crowdAway(npc) || CROWD.pick || traveling) return;
  if (!crowdActive()){
    if (askHooks('onCrowd', npc, null)) return;
    if (performance.now() - CROWD.toastT > 3000){ CROWD.toastT = performance.now(); crowdHintShow(npc, 'inactive'); }
    return;
  }
  crowdPick(npc);
}
function crowdPick(npc){
  if (typeof npc === 'string') npc = NPC[npc];
  if (!npc || CROWD.pick) return;
  CROWD.pick = npc; CROWD.sel = 0; CROWD.latch = npc.id; pickOpen = true;
  keys.clear(); target = null; route = []; goalPt = null; pendingTalk = null; pendingDoor = null;
  let el = $('#crowdPick');
  if (!el){ el = document.createElement('div'); el.id = 'crowdPick'; el.setAttribute('role', 'group'); $('#stage').appendChild(el); }
  el.setAttribute('aria-label', 'What do you say?');
  el.innerHTML = `<div class="cp-q">Cosa dici?</div><div class="cp-row">${CROWD_OPTS.map((o, i) => `<button class="cp-opt" data-pick="${o.k}"><kbd>${i + 1}</kbd>${o.label}</button>`).join('')}</div>`;
  el.hidden = false;
  el.querySelectorAll('[data-pick]').forEach(b => b.onclick = e => { e.stopPropagation(); crowdChoose(b.dataset.pick); });
  crowdPickPos(); crowdPickSel(0);
}
function crowdPickPos(){
  const el = $('#crowdPick'); if (!el || el.hidden) return;
  const c = cv.getBoundingClientRect(), s = $('#stage').getBoundingClientRect();
  const x = c.left - s.left + (player.x - cam.x) / W * c.width, y = c.top - s.top + (player.y - cam.y - 30) / H * c.height;
  el.style.left = Math.max(8, Math.min(s.width - el.offsetWidth - 8, x - el.offsetWidth / 2)) + 'px';
  el.style.top = Math.max(8, y - el.offsetHeight) + 'px';
}
function crowdPickSel(i){
  CROWD.sel = (i + CROWD_OPTS.length) % CROWD_OPTS.length;
  document.querySelectorAll('#crowdPick .cp-opt').forEach((b, k) => b.classList.toggle('sel', k === CROWD.sel));
}
function closeCrowdPick(){
  const el = $('#crowdPick'); if (el){ el.hidden = true; el.innerHTML = ''; }
  CROWD.pick = null; pickOpen = false;
}
/* keys while the pick is open (ui/keyboard.js) */
function crowdPickKey(k){
  if (k === 'escape'){ closeCrowdPick(); return; }
  if (k === '1' || k === '2' || k === '3'){ crowdChoose(CROWD_OPTS[+k - 1].k); return; }
  if (k === 'arrowleft' || k === 'a' || k === 'arrowup' || k === 'w') crowdPickSel(CROWD.sel - 1);
  else if (k === 'arrowright' || k === 'd' || k === 'arrowdown' || k === 's' || k === 'tab') crowdPickSel(CROWD.sel + 1);
  else if (k === 'enter' || k === ' ' || k === 'e') crowdChoose(CROWD_OPTS[CROWD.sel].k);
}
function crowdAttend(n, ms){ n.attendUntil = performance.now() + ms; const dx = player.x - n.x, dy = player.y - n.y, d = Math.hypot(dx, dy) || 1; n.face = { x:dx / d, y:dy / d }; }
function crowdChoose(choice){
  const n = CROWD.pick; if (!n) return;
  closeCrowdPick();
  if (askHooks('onCrowd', n, choice)) return;
  if (choice === 'permesso'){ crowdStepAside(n, { by:'player' }); return; }
  if (choice === 'scusi'){
    worldSay('player', 'Scusi!', { ms:1000 }); S.sentences++; save();
    setTimeout(() => { crowdAttend(n, 3500); worldSay(n, 'Sì?'); }, 800);
    setTimeout(() => crowdHintShow(n, 'scusi'), 1500);
    return;
  }
  worldSay('player', 'Prego!', { ms:1000 });
  setTimeout(() => { crowdAttend(n, 2500); worldSay(n, '?', { puzzled:true, ms:1600 }); }, 800);
  setTimeout(() => crowdHintShow(n, 'prego'), 1400);
}
function crowdHintShow(n, kind){
  const h = askHooks('crowdHint', n, kind === 'inactive' ? null : kind);
  const html = h !== null && h !== undefined ? h : CROWD_HINTS[kind];
  CROWD.hint = { kind, html, id:n.id };
  if (html) toast(html);
}
/* someone steps out of the way. o.by: who says "Permesso!" first ('player', an NPC id, or nothing) */
function crowdStepAside(n, o = {}){
  if (typeof n === 'string') n = NPC[n];
  if (!n || crowdAway(n)) return false;
  const pts = (n.aside || [[n.x + 50, n.y + 30]]).map(([x, y]) => ({ x, y }));
  pts[pts.length - 1] = crowdFreeSpot(n, pts[pts.length - 1]);
  const end = pts[pts.length - 1];
  crowdRec()[n.id] = { x:Math.round(end.x), y:Math.round(end.y) }; save();
  n.walkPath = [];                          // (away from now on: no second pick, not in the way of E)
  const by = o.by === 'player' ? 'player' : o.by ? NPC[o.by] : null, d0 = by ? 850 : 0;
  if (by){ worldSay(by, 'Permesso!', { ms:1050 }); if (by === 'player'){ S.sentences++; save(); } }
  setTimeout(() => { crowdAttend(n, 1200); worldSay(n, 'Prego!'); }, d0);
  setTimeout(() => { n.walkPath = pts; }, d0 + 650);
  /* a group (the galleria's school groups, couples): one Permesso moves them all */
  if (n.group && o.group !== false) activeNpcs().filter(m => m !== n && m.crowd && m.group === n.group && !crowdAway(m))
    .forEach((m, k) => setTimeout(() => crowdStepAside(m, { group:false }), d0 + 350 + 300 * k));
  return true;
}
/* the spot itself, or the nearest free one around it (no wall, nobody within 34 px, not on the player) */
function crowdFreeSpot(n, p){
  const free = (x, y) => x > 20 && x < sceneW() - 20 && y > scene().minY + 10 && y < sceneH() - 24 && !blocked(x, y, 14, true) && !inAvoid(x, y, 16)
    && Math.hypot(player.x - x, player.y - y) > 40
    && activeNpcs().every(m => m === n || Math.hypot(m.x - x, m.y - y) > 34 && !(S.crowd && S.crowd[m.id] && Math.hypot(S.crowd[m.id].x - x, S.crowd[m.id].y - y) < 34));
  if (free(p.x, p.y)) return p;
  for (let rad = 24; rad <= 96; rad += 12) for (let k = 0; k < 12; k++){
    const a = k / 12 * 2 * Math.PI, x = p.x + Math.cos(a) * rad, y = p.y + Math.sin(a) * rad;
    if (free(x, y)) return { x, y };
  }
  return p;
}
function updateCrowd(dt){
  for (const n of NPCS){
    if (!n.crowd || !n.walkPath) continue;
    if (!n.walkPath.length){ continue; }           // waiting for "Prego!"
    const t = n.walkPath[0], dx = t.x - n.x, dy = t.y - n.y, d = Math.hypot(dx, dy), sp = 95 * dt;
    n.moving = true; n.walk = (n.walk || 0) + dt * 10;
    if (d <= sp){
      n.x = t.x; n.y = t.y; n.walkPath.shift();
      if (!n.walkPath.length){
        n.walkPath = null; n.moving = false;
        const r = crowdRec()[n.id]; if (r){ r.x = Math.round(n.x); r.y = Math.round(n.y); }
        n.baseFace = n.asideFace ? { ...n.asideFace } : { x:(MUSEO.booth.x + 72 - n.x) / 300, y:-1 };
        save(); askHooks('onCrowdMoved', n);
      }
    } else { n.x += dx / d * sp; n.y += dy / d * sp; n.face = { x:dx / d, y:dy / d }; }
  }
}
/* walking into a crowd member for a moment opens the pick (dx, dy: the direction you are pushing) */
function crowdBump(dx, dy, dt){
  let hit = null;
  for (const n of activeNpcs()){
    if (!n.crowd || crowdAway(n)) continue;
    const ex = n.x - player.x, ey = n.y - player.y, d = Math.hypot(ex, ey);
    if (CROWD.latch === n.id && d > 38) CROWD.latch = null;
    if (d < 34 && (ex * dx + ey * dy) / (d || 1) > 0.45 && CROWD.latch !== n.id) hit = n;
  }
  if (!hit){ CROWD.bumpT = 0; CROWD.bumpId = null; return false; }
  CROWD.bumpT = CROWD.bumpId === hit.id ? CROWD.bumpT + dt : 0; CROWD.bumpId = hit.id;
  if (CROWD.bumpT >= 0.12){ CROWD.bumpT = 0; crowdTouch(hit); return true; }
  return false;
}
/* the latch lets go once you are no longer touching that person */
function crowdUnlatch(){
  if (!CROWD.latch) return;
  const n = NPC[CROWD.latch];
  if (!n || Math.hypot(n.x - player.x, n.y - player.y) > 38) CROWD.latch = null;
}
function crowdDbg(){
  const people = {};
  NPCS.filter(n => n.crowd && sceneOf(n) === S.scene && activeNpcs().includes(n)).forEach(n => {
    people[n.id] = { at:[Math.round(n.x), Math.round(n.y)], moved:crowdMoved(n), walking:!!n.walkPath };
  });
  return { active:crowdActive(), pick:CROWD.pick ? { npc:CROWD.pick.id, options:CROWD_OPTS.map(o => o.label), sel:CROWD.sel } : null,
    people, saved:S.crowd ? JSON.parse(JSON.stringify(S.crowd)) : null, latch:CROWD.latch,
    bubbles:BUBBLES.map(b => [b.id, b.text]), said:SAID.slice(), hint:CROWD.hint ? { ...CROWD.hint } : null };
}

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
