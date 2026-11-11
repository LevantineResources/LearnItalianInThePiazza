/* Tile maps and loading zones (first built for Unit 2's walkable city; any unit can use them). Generic: a unit makes the
   grid and the chunks, the engine only reads these scene fields (world/scenes.js SCENES):
     tiles:{ size (px), cols, rows, solid:Uint8Array (cols × rows, 1 = solid) }   grid collision, as well as the C and R lists
     camBox:{ x, y, w, h }      the camera stays inside it (a chunk of a big map; world/scenes.js updateCam)
     camEase:k                  the camera follows with smoothing (k per second; 0 / none = locked on the player)
     pathBox:{ x, y, w, h }     tap-to-walk's A* grid covers only this box (a big map's chunk, so a tap stays cheap)
     zoneAt(x, y) → null | key | { to, spawn? }   (x, y) belongs to another scene: walking there loads it (a loading zone).
                                The switch is quick: a short dip of the light and the new place's name, the player keeps
                                walking (keys held stay held, a tap-to-walk route goes on), and keeps their position unless
                                the zone gives a spawn (chunks of one map share their coordinates).
     speed                      the walking speed in px/s (default 170)
     personLift                 how far above (x, y) a person's head is (people drawn upright): name pills, "?" marks and
                                speech bubbles go that much higher
     camAnchor                  how far down the view the camera keeps the player (default 0.5; more shows more of what
                                rises above them: tall fronts)
     zoom                       the camera's zoom (default 1; 0.9 shows 1/0.9 as much world each way): world/scenes.js camZoom,
                                viewW / viewH (the view in world px), screenToWorld (taps); tests: window.__view()
     camCenter                  a scene smaller than the view (a room at a zoom) sits centred in it, along each axis it is
                                smaller in (the camera's corner goes negative); bigger along an axis, the camera follows as usual
   Tests: __dbg().zone = { last, at, title }. */

/* is any solid tile under the body (x, y, r)? `out(gNew, gOld)` is blocked()'s rule (a step that does not go deeper into
   something already overlapped is allowed) */
function tileSolidAt(T, c, r){ return c < 0 || r < 0 || c >= T.cols || r >= T.rows || T.solid[r * T.cols + c] === 1; }
function tileHit(T, x, y, r, from, out){
  const s = T.size, c0 = Math.floor((x - r) / s), c1 = Math.floor((x + r) / s), r0 = Math.floor((y - r) / s), r1 = Math.floor((y + r) / s);
  for (let j = r0; j <= r1; j++) for (let i = c0; i <= c1; i++){
    if (!tileSolidAt(T, i, j)) continue;
    const o = { x:i * s, y:j * s, w:s, h:s }, gn = rectGap(o, x, y) - r;
    if (gn < 0 && out(gn, from ? rectGap(o, from.x, from.y) - r : 0)) return true;
  }
  return false;
}

/* ---------- loading zones ---------- */
const ZONE = { t0:-1e9, ms:340, title:'', titleMs:2200, last:null, n:0 };
function zoneCheck(){
  const sc = scene(); if (!sc.zoneAt || traveling) return;
  const z = sc.zoneAt(player.x, player.y); if (!z) return;
  const to = typeof z === 'string' ? z : z.to;
  if (!to || to === S.scene || !SCENES[to]) return;
  zoneSwitch(to, typeof z === 'string' ? null : z.spawn);
}
function zoneSwitch(to, spawn){
  const from = S.scene;
  S.scene = to;
  if (spawn){ player.x = spawn.x; player.y = spawn.y; route = []; target = null; goalPt = null; }
  ZONE.t0 = performance.now(); ZONE.last = { from, to, at:[Math.round(player.x), Math.round(player.y)] }; ZONE.n++;
  ZONE.title = SCENES[to].title || unitHook('travelTitle', to) || '';
  trail.length = 0;
  unitHook('arrive', to);
  save(); renderHUD(); lastGuide = '';
}
/* the dip of the light and the new place's name (screen space; draw() calls it last) */
function zoneDraw(){
  const age = performance.now() - ZONE.t0;
  if (age > Math.max(ZONE.ms, ZONE.titleMs)) return;
  ctx.save(); ctx.setTransform(RES, 0, 0, RES, 0, 0);
  if (age < ZONE.ms && !RM){ ctx.fillStyle = `rgba(16,20,40,${0.42 * (1 - age / ZONE.ms)})`; ctx.fillRect(0, 0, W, H); }
  if (ZONE.title){
    const a = Math.max(0, Math.min(1, age / 200, (ZONE.titleMs - age) / 400));
    ctx.globalAlpha = a; ctx.font = 'italic 700 20px "Bodoni Moda", Georgia, serif';
    const w = ctx.measureText(ZONE.title).width + 36;
    ctx.fillStyle = 'rgba(15,34,96,.82)'; rr(ctx, W / 2 - w / 2, 18, w, 36, 18); ctx.fill();
    ctx.fillStyle = '#f4b928'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ZONE.title, W / 2, 37);
  }
  ctx.restore();
}
dbgField('zone', () => ({ last:ZONE.last, n:ZONE.n, title:performance.now() - ZONE.t0 < ZONE.titleMs ? ZONE.title : '' }));
