/* People and animals that walk on their own, in any scene: strollers and dogs (first built for Padova's bridge and park,
   and the night train's dogs).
   - Strollers: an NPC with stroll:{ path:[[x, y, pause?, face?], …], speed, back? } walks its path (back and forth with back),
     waits for the player in its way (2.5 s at most) and is never an obstacle (world/scenes.js blocked()).
   - Dogs: an NPC with animal:'dog' is drawn as a dog (render/sprites.js drawDog: size, coat, ears, patch). n.sit = true sits;
     n.follows = 'player' | an NPC id makes it trot after them (and sit when they stop): dogFollow(id, who | null). A dog at
     someone's heels is never an obstacle, and follows them in every scene. */

/* ---------- strollers ---------- */
function strollUpdate(dt){
  for (const n of activeNpcs()){
    if (!n.stroll || n.cutWalk) continue;
    const w = n.stroll, P = w.path;
    if (!n.sv){ n.sv = { i:w.start || 0, dir:1, pause:0, wait:0 }; const p0 = P[n.sv.i]; n.x = p0[0]; n.y = p0[1]; }
    const st = n.sv;
    if (dialogOpen && convo && convo.npc === n){ n.moving = false; continue; }
    if (st.pause > 0){ st.pause -= dt; n.moving = false; continue; }
    let j = st.i + st.dir;
    if (j >= P.length || j < 0){ if (w.back){ st.dir = -st.dir; j = st.i + st.dir; } else j = (j + P.length) % P.length; }
    const nx = P[j], dx = nx[0] - n.x, dy = nx[1] - n.y, d = Math.hypot(dx, dy) || 1, sp = (w.speed || 40) * dt;
    const ax = n.x + dx / d * 26, ay = n.y + dy / d * 26;
    if (Math.hypot(player.x - ax, player.y - ay) < 34 && st.wait < 2.5){
      st.wait += dt; n.moving = false; const pd = Math.hypot(player.x - n.x, player.y - n.y) || 1; n.face = { x:(player.x - n.x) / pd, y:(player.y - n.y) / pd }; continue;
    }
    if (Math.hypot(player.x - ax, player.y - ay) >= 40) st.wait = 0;
    n.moving = true; n.walk = (n.walk || 0) + dt * 7;
    if (d <= sp){ n.x = nx[0]; n.y = nx[1]; st.i = j; if (nx[2]){ st.pause = nx[2]; n.moving = false; if (nx[3]) n.face = n.baseFace = { ...nx[3] }; } }
    else { n.x += dx / d * sp; n.y += dy / d * sp; n.face = { x:dx / d, y:dy / d }; }
  }
}
/* ---------- dogs ---------- */
function dogFollow(id, who){ const n = typeof id === 'string' ? NPC[id] : id; if (!n) return; n.follows = who || null; if (who) n.sit = false; }
/* dogs that follow someone (every scene) */
function dogsUpdate(dt){
  for (const n of activeNpcs()){
    if (!n.animal || !n.follows || n.cutWalk) continue;
    const L = n.follows === 'player' ? player : NPC[n.follows];
    if (!L || !(L === player || activeNpcs().includes(L))) continue;
    /* the spot at their heels: behind them (by the way they face), a little to the side; never inside a wall or a table, never on the
       player (another spot round them then). Hysteresis: the dog sets off when the spot is 22 px away and settles there, so it does
       not twitch with every small turn of its leader. */
    const f = L.face || { x:0, y:1 }, fl = Math.hypot(f.x, f.y) || 1, fx = f.x / fl, fy = f.y / fl;
    const ok = (x, y) => !blocked(x, y, 8, true) && (L === player || Math.hypot(x - player.x, y - player.y) > 24);
    let tx = L.x - fx * 30 + 14, ty = L.y - fy * 18 + 12;
    if (!ok(tx, ty)){ const alt = [[-fx * 26 - fy * 18, -fy * 26 + fx * 18], [-fx * 26 + fy * 18, -fy * 26 - fx * 18], [-fy * 22, fx * 22], [fy * 22, -fx * 22], [-fx * 34, -fy * 34]].map(([ax, ay]) => [L.x + ax, L.y + ay]).find(([x, y]) => ok(x, y));
      if (alt){ tx = alt[0]; ty = alt[1]; } else if (n.dogTo){ tx = n.dogTo.x; ty = n.dogTo.y; } }
    n.dogTo = { x:tx, y:ty };
    const dx = tx - n.x, dy = ty - n.y, d = Math.hypot(dx, dy);
    if (d > (n.moving ? 2 : 22)){ const sp = Math.min(d, (d > 90 ? 230 : d > 40 ? 180 : 130) * dt); n.x += dx / d * sp; n.y += dy / d * sp; n.face = { x:dx / d, y:dy / d }; n.moving = true; n.walk = (n.walk || 0) + dt * 16; n.idle = 0; n.sit = false; }
    else { n.moving = false; n.idle = (n.idle || 0) + dt; if (n.idle > 1.2) n.sit = true; }
  }
}
