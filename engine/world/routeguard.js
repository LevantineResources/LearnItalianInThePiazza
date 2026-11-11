/* A route's corridor (first used by Unit 2's Lesson 1: the way the gondolier gave): while it is on, the player is expected
   to keep near a route. Stepping out of the corridor (by more than its half width, after a short grace) calls the lesson
   back (onLeave, at most every `every` seconds) and a soft arrow on the ground points the way back to the route.

   routeGuard(spec) turns it on, routeGuard(null) off. spec = {
     pts:[[x, y, r?], …]   the route in world px; r: the corridor's half width on the leg that starts there (default slack)
     slack                 the default half width (px; default 72, 3 m at 24 px a metre)
     scenes                the scenes it is on in: an array of keys, or (key) => bool (default: every scene)
     every                 seconds between two onLeave calls (default 8)
     grace                 seconds outside before it counts (default 0.25)
     onLeave(info)         info = { d (px outside), at:{ x, y } (the nearest point of the route), n (times so far) }
     onBack()              the player is back inside
     arrow                 draw the arrow while outside (default true) }
   routeDist(pts, x, y, slack) → { d (px outside the corridor; 0 inside), at:{ x, y }, k (the leg) }.
   Tests: __dbg().guard = { on, out, d, n, arrow, at, times (the last onLeave calls, ms) }. */
let ROUTE_GUARD = null;
function routeGuard(spec){
  ROUTE_GUARD = spec ? { slack:72, every:8, grace:0.25, arrow:true, ...spec, out:false, t:0, last:-1e9, n:0, d:0, at:null } : null;
  return ROUTE_GUARD;
}
/* the distance from (x, y) to the corridor: to each leg (a segment), less that leg's half width */
function routeDist(pts, x, y, slack = 72){
  let best = { d:Infinity, at:null, k:-1 };
  for (let k = 0; k + 1 < pts.length; k++){
    const [ax, ay, ar] = pts[k], [bx, by] = pts[k + 1], vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy;
    const u = L2 ? Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / L2)) : 0, px = ax + vx * u, py = ay + vy * u;
    const d = Math.hypot(x - px, y - py) - (ar === undefined ? slack : ar);
    if (d < best.d) best = { d, at:{ x:px, y:py }, k };
  }
  if (pts.length === 1){ const [ax, ay, ar] = pts[0]; best = { d:Math.hypot(x - ax, y - ay) - (ar === undefined ? slack : ar), at:{ x:ax, y:ay }, k:0 }; }
  best.d = Math.max(0, best.d);
  return best;
}
const routeGuardOn = () => { const G = ROUTE_GUARD; if (!G) return false; const s = G.scenes; return !s || (typeof s === 'function' ? !!s(S.scene) : s.includes(S.scene)); };
/* every frame (world/update.js): out of the corridor → onLeave (at most every `every` s); back in → onBack */
function routeGuardUpdate(dt){
  const G = ROUTE_GUARD; if (!G) return;
  if (!routeGuardOn() || frozen() || cutsceneOn() || traveling){ G.t = 0; return; }
  const r = routeDist(G.pts, player.x, player.y, G.slack);
  G.d = r.d; G.at = r.at;
  if (r.d > 0){
    G.t += dt;
    if (G.t < G.grace) return;
    if (!G.out){ G.out = true; }
    const now = performance.now() / 1000;
    if (now - G.last >= G.every){ G.last = now; G.n++; (G.times || (G.times = [])).push(Math.round(now * 1000)); if (G.onLeave) G.onLeave({ d:r.d, at:r.at, n:G.n }); }
  } else {
    G.t = 0;
    if (G.out){ G.out = false; if (G.onBack) G.onBack(); }
  }
}
/* the soft arrow: chevrons on the ground in front of the player, pointing to the route (render/sprites.js draw) */
function routeGuardDraw(t){
  const G = ROUTE_GUARD; if (!G || !G.out || !G.arrow || !G.at || !routeGuardOn() || frozen()) return;
  const dx = G.at.x - player.x, dy = G.at.y - player.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  const a = 0.45 + (RM ? 0 : Math.sin(t * 4) * 0.2);
  ctx.save(); ctx.translate(player.x, player.y + 6); ctx.rotate(Math.atan2(uy, ux));
  for (let k = 0; k < 3; k++){
    const x = 34 + k * 18 + (RM ? 0 : ((t * 30) % 18));
    ctx.globalAlpha = a * (1 - k * 0.22);
    ctx.fillStyle = 'rgba(244,185,40,1)'; ctx.strokeStyle = 'rgba(15,34,96,.55)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, -9); ctx.lineTo(x + 11, 0); ctx.lineTo(x, 9); ctx.lineTo(x + 4, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}
dbgField('guard', () => { const G = ROUTE_GUARD; return G ? { on:routeGuardOn(), out:G.out, d:Math.round(G.d), n:G.n, arrow:!!(G.out && G.arrow), at:G.at ? [Math.round(G.at.x), Math.round(G.at.y)] : null, times:(G.times || []).slice(-4) } : { on:false }; });
