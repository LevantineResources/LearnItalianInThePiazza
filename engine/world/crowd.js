/* The crowd and the Permesso pick, and speech bubbles in the world (first built for Padova's museum square, Lesson 10).

   THE CROWD (any NPC with crowd:true, in any scene)
   - A crowd member is in the way, not someone to talk to: bumping into one (walking into them for a moment), pressing E
     beside one or tapping one opens a quick pick above the player: Permesso / Scusi / Prego (1 / 2 / 3, ← → Enter, Esc).
   - Permesso: "Permesso!" over the player (spoken), "Prego!" over them, and they walk out of the way along n.aside
     (waypoints; the last is where they stay, or a free spot near it), then face n.asideFace (or the unit's
     UNIT.crowdAsideFace(n)). S.crowd[id] = { x, y } remembers it (lazy, not in FRESH()); placeCrowd() (every renderHUD)
     puts moved people there and everyone else at home.
   - Scusi: they turn round, "Sì?", and stay put; then a hint. Prego: a puzzled "?", and a hint.
   - Hooks (CLAUDE.md): crowdActive() → true / false (first hook returning a boolean wins; default true);
     onCrowd(npc, choice) → true when handled (choice 'permesso' | 'scusi' | 'prego', or null when the crowd is touched
     while inactive); crowdHint(npc, choice) → the hint html ('' for none); onCrowdMoved(npc) after they have stepped aside.
   - For lessons: crowdStepAside(npc | id, { by }) moves someone (by: an NPC id or 'player' says "Permesso!" first),
     crowdReset(ids?) puts people back, crowdPick(npc) opens the pick, worldSay(who, text, o) shows a bubble over the
     player ('player') or a person (an NPC or id) and speaks it (o.silent, o.ms, o.puzzled). */

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
window.__bubbleAt = id => { const n = NPC[id], L = scene().personLift || 0; return n ? { bubbleBottom:n.y - L - (personHasPill(n) ? 52 : n.kid ? 30 : 36), pillTop:personHasPill(n) ? n.y - L - 46 : null } : null; };
function drawWorldBubbles(){
  const now = performance.now();
  for (let i = BUBBLES.length - 1; i >= 0; i--) if (now - BUBBLES[i].t0 > BUBBLES[i].ms) BUBBLES.splice(i, 1);
  for (const b of BUBBLES){
    const p = b.who, age = now - b.t0, a = Math.min(1, age / 120, (b.ms - age) / 250);
    if (p !== player && !p.agent && !activeNpcs().includes(p)) continue;   // (p.agent: a lane crowd's passer-by, world/lanecrowd.js)
    /* above the name pill (or the "?" / "!" mark) when the person has one (render/sprites.js draws them at y − 24 … y − 46) */
    const x = p.x, y = p.y - (scene().personLift || 0) - (personHasPill(p) ? 52 : p.kid ? 30 : 36) - (RM ? 0 : Math.min(1, age / 160) * 4);
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
/* the hints after Scusi / Prego (a unit may word them its own way: Object.assign(CROWD_HINTS, { … })) */
const CROWD_HINTS = {
  scusi:'<i>Scusi</i> gets someone’s attention. To get past, there is another word: the one for <i>may I get by?</i>',
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
  const z = camZoom(), x = c.left - s.left + (player.x - cam.x) * z / W * c.width, y = c.top - s.top + (player.y - cam.y - 30) * z / H * c.height;
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
        n.baseFace = n.asideFace ? { ...n.asideFace } : (unitHook('crowdAsideFace', n) || { x:0, y:-1 });   // (a unit can turn them: Padova, towards the museum's booth)
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
/* an ambient person (ambient:true: a museum visitor, a dog…): E or a tap says their line (n.says) in a bubble, its English in a toast */
function ambientSay(n){
  const l = n.says || { it:'Buongiorno.', en:'Good morning.' };
  crowdAttend(n, 2600); worldSay(n, l.it, { ms:2400 });
  toast(`<i>“${esc(l.it)}”</i> · ${esc(l.en)}`);
}
dbgField('crowd', () => crowdDbg());
Object.assign(window.__debug, { crowdReset(ids){ crowdReset(ids); } });
