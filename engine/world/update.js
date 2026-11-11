/* Per-frame update (player, follower trail, NPC facing), pointer input, canvas fit. */

function update(dt){
  cutsceneTick(dt);                              // scripted walks (world/cutscene.js)
  if (!frozen()){
    let dx = 0, dy = 0;
    const ctl = cutsceneControls();               // a cutscene: no walking (unless it allows the arrow keys)
    if (!ctl){ target = null; route = []; goalPt = null; }
    if (ctl) for (const k of keys){ const d = DIRS[k]; if (d){ dx += d[0]; dy += d[1]; } }
    player.moving = false;
    const px0 = player.x, py0 = player.y;
    if (dx || dy){
      const l = Math.hypot(dx, dy); dx /= l; dy /= l;
      const sp = walkSpeed() * dt;                  // (a scene's own walking speed: world/tilemap.js; × its run when running)
      let moved = false;
      if (dx && !blocked(player.x + dx * sp, player.y, 14, false, player)){ player.x += dx * sp; moved = true; }
      if (dy && !blocked(player.x, player.y + dy * sp, 14, false, player)){ player.y += dy * sp; moved = true; }
      player.face = { x:dx, y:dy }; player.moving = moved;
      crowdBump(dx, dy, dt);                     // pushing into a crowd member opens the Permesso pick (world/crowd.js)
    } else if (target && ctl){
      if (pendingTalk && npcDist(pendingTalk) < NEAR - 4){
        const n = pendingTalk; target = null; route = []; goalPt = null; pendingTalk = null; openConvo(n);
      } else if (pendingDoor && doorDist(pendingDoor, player.x, player.y) < (pendingDoor.area ? 40 : 24)){
        const d = pendingDoor; target = null; route = []; goalPt = null; pendingDoor = null; enterDoor(d);
      } else {
        const vx = target.x - player.x, vy = target.y - player.y, d = Math.hypot(vx, vy);
        if (d < 3){ route.shift(); target = route[0] || null; if (!target){ goalPt = null; RUN.tap = false; } }
        else {
          const moved = steerMove(vx, vy, Math.min(d, walkSpeed() * dt));
          player.moving = moved;
          if (!moved && crowdBump(vx / d, vy / d, dt)) return;
          stuckT = moved ? 0 : stuckT + dt;
          if (stuckT > 0.8){ target = null; route = []; goalPt = null; pendingTalk = null; pendingDoor = null; stuckT = 0; }
        }
      }
    }
    /* the walk cycle: a scene with a stride (px of ground per radian of the cycle) steps with the ground covered, so the feet
       keep up at any speed; else a fixed cadence */
    if (player.moving){ const st = scene().stride; player.walk += st ? Math.hypot(player.x - px0, player.y - py0) / (typeof st === 'function' ? st() : st) : dt * 11; }
    player.running = player.moving && running();
    zoneCheck();                                 // walked into another chunk of a tile map: load it (world/tilemap.js)
    followerUpdate(dt);
    crowdUnlatch();
    for (const n of activeNpcs()){
      if (isFollower(n) && n.moving) continue;
      if (n.cutWalk || ((n.wander || n.stroll) && n.moving)) continue;
      if (n.crowd){ if (n.walkPath && n.walkPath.length) continue; if (!(n.attendUntil > performance.now())) { n.face = { ...n.baseFace }; continue; } }
      const d = Math.hypot(player.x - n.x, player.y - n.y);
      if (d < 130){ n.face = { x:(player.x - n.x) / d, y:(player.y - n.y) / d }; }
      else n.face = { ...n.baseFace };
    }
  }
  unitHook('updateWorld', dt);                   // the unit's own (Padova: the museum's wandering visitors and ropes)
  if (!frozen()) strollUpdate(dt);               // passers-by (world/walkers.js)
  dogsUpdate(dt);                                // dogs that follow someone (world/walkers.js)
  unitHook('updateWorldLate', dt);               // (Padova: the night train's doors and sound, the museum square's clock)
  updateCrowd(dt);
  updatePigeons(dt);
  routeGuardUpdate(dt);                          // a lesson's route corridor (world/routeguard.js)
  hooksEach('tick', dt);                         // the lessons' own per-frame beats (a lesson hook tick(dt); guard it with your lesson)
}

/* the follower (Mark, Bruno, Lucia, Margaret) walks the player's trail, FOLLOW_GAP behind along it, at the player's own pace (no
   catching up and stopping: no stutter). Close to the player in a straight line (the player turned back, or stopped), they wait
   where they are and the trail starts again from there, so they never walk back onto the player; if the player walks into
   them, they step aside, out of the way (checked against the scene: never into a wall, a desk or a table). */
const FOLLOW_GAP = 44;
function followerUpdate(dt){
  const m = followerNpc();
  if (!m) return;
  m.moving = false;
  if (m.cutWalk || !activeNpcs().includes(m)){ trail.length = 0; return; }
  const lt = trail[trail.length - 1];
  if (!lt || Math.hypot(player.x - lt.x, player.y - lt.y) > 6) trail.push({ x:player.x, y:player.y });
  const d = Math.hypot(player.x - m.x, player.y - m.y);
  if (d < FOLLOW_GAP - 6){
    trail.length = 0;
    if (d < 26 && player.moving){
      /* the player walks into them: a step to the side of the player's way (or straight back) */
      const f = player.face || { x:0, y:-1 }, fl = Math.hypot(f.x, f.y) || 1, fx = f.x / fl, fy = f.y / fl;
      const side = (m.x - player.x) * -fy + (m.y - player.y) * fx >= 0 ? 1 : -1, ax = (m.x - player.x) / (d || 1), ay = (m.y - player.y) / (d || 1);
      const sp = 150 * dt;
      for (const [vx, vy] of [[-fy * side, fx * side], [ax, ay], [fy * side, -fx * side], [fx, fy]]){
        const nx = m.x + vx * sp, ny = m.y + vy * sp;
        if (!blocked(nx, ny, 12, true) && Math.hypot(nx - player.x, ny - player.y) >= d){ m.x = nx; m.y = ny; m.moving = true; m.walk = (m.walk || 0) + dt * 11; break; }
      }
    }
    return;
  }
  /* how far behind along the trail, and how far to walk now */
  let L = 0, px = m.x, py = m.y;
  for (const q of trail){ L += Math.hypot(q.x - px, q.y - py); px = q.x; py = q.y; }
  L += Math.hypot(player.x - px, player.y - py);
  let go = Math.min(L - FOLLOW_GAP, (L > FOLLOW_GAP + 60 ? 250 : 190) * dt);
  if (go < 0.4) return;
  while (go > 0 && trail.length){
    const tg = trail[0], dx = tg.x - m.x, dy = tg.y - m.y, dd = Math.hypot(dx, dy);
    if (dd <= go){ m.x = tg.x; m.y = tg.y; go -= dd; trail.shift(); continue; }
    m.x += dx / dd * go; m.y += dy / dd * go; m.face = { x:dx / dd, y:dy / dd }; go = 0;
  }
  m.moving = true; m.walk = (m.walk || 0) + dt * 11;
}

/* pointer: tap to walk / tap NPC to talk / tap door to enter */
const cv = $('#cv'), ctx = cv.getContext('2d');
cv.width = W * RES; cv.height = H * RES; cv.tabIndex = 0;
cv.addEventListener('pointerdown', e => {
  if (pickOpen){ closeCrowdPick(); return; }
  if (frozen()) return;
  if (cutsceneOn()){ cutsceneTap(e); return; }    // a cutscene: taps are ignored, or only what E would do (world/cutscene.js)
  const r = cv.getBoundingClientRect();
  const { x, y } = screenToWorld((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H);   // world coordinates (the camera and its zoom)
  const hit = activeNpcs().find(n => !crowdAway(n) && Math.hypot(n.x - x, n.y - y) < 30);
  pendingTalk = null; pendingDoor = null; stuckT = 0;
  /* a double tap (two within 0.35 s, close together): the walk there is run (while held, and on to the spot) */
  const now = performance.now(), dbl = RUN.lastTap && now - RUN.lastTap.t < 350 && Math.hypot(e.clientX - RUN.lastTap.x, e.clientY - RUN.lastTap.y) < 60;
  RUN.tap = !!dbl; RUN.lastTap = dbl ? null : { t:now, x:e.clientX, y:e.clientY };
  if (hit){
    if (npcDist(hit) < NEAR){ openConvo(hit); return; }
    if (hit.approach) setRoute(hit.approach);
    else { const dx = player.x - hit.x, dy = player.y - hit.y, d = Math.hypot(dx, dy) || 1; setRoute({ x:hit.x + dx / d * 40, y:hit.y + dy / d * 40 }); }
    pendingTalk = hit; return;
  }
  const door = scene().doors.find(d => d.when && !d.when() ? false : d.hit ? x >= d.hit.x && x <= d.hit.x + d.hit.w && y >= d.hit.y && y <= d.hit.y + d.hit.h : d.area ? !!(d.tapped && d.tapped(x, y)) : Math.hypot(d.x - x, d.y - y) < 34);   // (a landmark is tapped on its own shape: its door's tapped(x, y))
  if (door){
    if (doorDist(door, player.x, player.y) < doorReach(door)){ enterDoor(door); return; }
    setRoute(doorSpot(door, player.x, player.y)); pendingDoor = door; return;
  }
  setRoute({ x, y });
});
function fit(){
  const r = $('#stage').getBoundingClientRect();
  const sc = Math.min(r.width / W, r.height / H);
  cv.style.width = (W * sc) + 'px'; cv.style.height = (H * sc) + 'px';
  /* a sharp canvas (UNIT.sharpCanvas): as many canvas px as screen px (at most 4 a unit), so nothing is upscaled by the page */
  if (UNIT.sharpCanvas){
    const res = Math.max(1, Math.min(4, (window.devicePixelRatio || 1) * sc));
    if (res !== RES){ RES = res; cv.width = Math.round(W * RES); cv.height = Math.round(H * RES); }
  }
}
window.addEventListener('resize', fit);
