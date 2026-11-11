/* Scenes (the SCENES registry), the camera, collision, A* pathfinding, pigeons. */

/* =========================================================
   WORLD: scenes, collision, movement, pigeons
   ========================================================= */
/* the scenes: SCENES[key] = { minY, spawn:{ x, y }, C:[circles { x, y, r }], R:[rects { x, y, w, h }], doors:[…], w?, h? (a scene
   bigger than the canvas: the camera follows), avoid?, guideKeep?, hush?, focusX?() }. Every unit registers its own
   (units/<id>/world/scenes.js, or a scene's own world/ file); the engine's shop template registers shops. */
const SCENES = {};
const scene = () => SCENES[S.scene] || SCENES[UNIT.start.scene];
/* the camera. Every scene is 960 × 600 (the canvas) unless it has its own size (w, h: the museum interior, 'galleria',
   world/galleria.js): then the view follows the player, clamped to the scene's edges. World coordinates are used
   everywhere (positions, collision, doors, drawing); only draw() (translate by -cam) and the pointer (+cam) convert.
   A scene's zoom (scene.zoom, default 1; world/tilemap.js): the canvas shows a view of W / zoom × H / zoom world px (viewW,
   viewH), so below 1 more of the world is in view; draw() scales by it and the pointer divides by it. */
const cam = { x:0, y:0, overview:false };
const sceneW = () => scene().w || W, sceneH = () => scene().h || H;
const camZoom = () => cam.overview ? 1 : scene().zoom || 1;
const viewW = () => W / camZoom(), viewH = () => H / camZoom();
/* the world point under a point of the canvas (cx, cy in canvas px, 0–W × 0–H), and back (tests: window.__view) */
const screenToWorld = (cx, cy) => ({ x:cx / camZoom() + cam.x, y:cy / camZoom() + cam.y });
window.__view = () => ({ x:cam.x, y:cam.y, z:camZoom(), w:viewW(), h:viewH() });
function updateCam(){
  const sw = sceneW(), sh = sceneH(), sc = scene(), W = viewW(), H = viewH();     // (the view in world px: the canvas over the zoom)
  /* camCenter: a scene smaller than the view (a zoomed-in room) sits centred in it, along each axis it is smaller in; else at 0, 0 */
  const midX = sc.camCenter && sw < W ? (sw - W) / 2 : null, midY = sc.camCenter && sh < H ? (sh - H) / 2 : null;
  const clampX = v => midX !== null ? midX : Math.max(0, Math.min(sw - W, v)), clampY = v => midY !== null ? midY : Math.max(0, Math.min(sh - H, v));
  if (cam.overview || (sw <= W && sh <= H)){ cam.x = cam.overview || midX === null ? 0 : Math.round(midX); cam.y = cam.overview || midY === null ? 0 : Math.round(midY); return; }
  const fx = sc.focusX ? sc.focusX() : player.x;          // (a scene can look elsewhere for a moment: the night train's beats; focusY too)
  /* a big map's chunk keeps the camera inside its camBox, and may follow with smoothing (camEase: world/tilemap.js) */
  const B = sc.camBox || { x:0, y:0, w:sw, h:sh };
  const tx = Math.max(B.x, Math.min(B.x + Math.max(0, B.w - W), fx - W / 2)), ty = Math.max(B.y, Math.min(B.y + Math.max(0, B.h - H), (sc.focusY ? sc.focusY() : player.y) - H * (sc.camAnchor || 0.5)));   // (camAnchor: how far down the view the player is)
  if (!sc.camEase){ cam.x = Math.round(clampX(tx)); cam.y = Math.round(clampY(ty)); return; }
  const now = performance.now(), dt = Math.min(0.1, (now - (cam.lt || now)) / 1000); cam.lt = now;
  if (cam.trav !== traveling || cam.fx === undefined || Math.hypot(tx - cam.fx, ty - cam.fy) > 1.5 * W || RM){ cam.fx = tx; cam.fy = ty; }   // (through a door: no slide; into the next chunk: a slide)
  else { const k = 1 - Math.exp(-sc.camEase * dt); cam.fx += (tx - cam.fx) * k; cam.fy += (ty - cam.fy) * k; }
  cam.trav = traveling;
  cam.x = Math.round(clampX(cam.fx)); cam.y = Math.round(clampY(cam.fy));
}
/* is (x, y) blocked for a body of radius r? `from` (the player's own move: world/update.js) lets a body that already overlaps
   something (someone walked onto it, it arrived inside a collider) move away from it: a step that does not go deeper is
   allowed, so nothing can ever trap the player (Lesson 15: Biscuit sitting at the player's feet under the departures board). */
const rectGap = (o, x, y) => {                       // signed distance to a rect: negative inside it
  const cx = Math.max(o.x, Math.min(x, o.x + o.w)), cy = Math.max(o.y, Math.min(y, o.y + o.h));
  if (cx !== x || cy !== y) return Math.hypot(x - cx, y - cy);
  return -Math.min(x - o.x, o.x + o.w - x, y - o.y, o.y + o.h - y);
};
const npcObstacle = n => !isFollower(n) && !n.talkZone && !(n.wander && n.moving) && !n.stroll && !(n.animal && n.follows);   // (a museum visitor walking past, a passer-by, a dog at someone's heels: no obstacle)
function blocked(x, y, r, ignoreNpc, from){
  const sc = scene();
  if (x < r + 4 || x > sceneW() - r - 4 || y < sc.minY || y > sceneH() - 18) return true;
  const out = (gNew, gOld) => gNew < 0 && !(from && gOld < 0 && gNew >= gOld - 0.01);     // in the way (unless already in it and not going deeper)
  for (const c of sc.C){ const gn = Math.hypot(x - c.x, y - c.y) - c.r - r; if (gn < 0 && out(gn, from ? Math.hypot(from.x - c.x, from.y - c.y) - c.r - r : 0)) return true; }
  for (const o of sc.R){ const gn = rectGap(o, x, y) - r; if (gn < 0 && out(gn, from ? rectGap(o, from.x, from.y) - r : 0)) return true; }
  if (sc.tiles && tileHit(sc.tiles, x, y, r, from, out)) return true;          // (a tile map's solid tiles: world/tilemap.js)
  if (!ignoreNpc) for (const n of activeNpcs()){
    if (!npcObstacle(n)) continue;
    const gn = Math.hypot(x - n.x, y - n.y) - r - 16;
    if (gn < 0 && out(gn, from ? Math.hypot(from.x - n.x, from.y - n.y) - r - 16 : 0)) return true;
  }
  return false;
}
/* a scene's avoid rects (the galleria's ropes): walkable, but tap-to-walk keeps out of them */
function inAvoid(x, y, r){
  const A = scene().avoid; if (!A) return false;
  for (const o of A){ const cx = Math.max(o.x, Math.min(x, o.x + o.w)), cy = Math.max(o.y, Math.min(y, o.y + o.h)); if (Math.hypot(x - cx, y - cy) < r) return true; }
  return false;
}
/* how far the player is from someone, for talking: someone behind a long counter (talkZone: the strip in front of it, Lesson 15's
   information desk, bar and ticket booth) is in reach from anywhere along it, not only from the middle */
function npcDist(n, x = player.x, y = player.y){
  const d = Math.hypot(n.x - x, n.y - y), z = n.talkZone;
  return z && x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h ? Math.min(d, NEAR - 12) : d;
}
/* someone within `reach` whom the player is not turned away from */
function facesAt(n, reach){
  const f = player.face || { x:0, y:-1 }, fl = Math.hypot(f.x, f.y) || 1, dx = n.x - player.x, dy = n.y - player.y, d = Math.hypot(dx, dy);
  return d < reach && (d < 0.5 || (dx * f.x + dy * f.y) / (d * fl) > -0.35);
}
/* who E talks to. Among the people in reach: someone the current objective or a quest step needs wins; otherwise the
   one the player is facing wins over a slightly nearer one beside or behind (so a bystander standing close, like
   Bruno beside the bar, never hides the person the player is turned towards). */
function nearestNpc(){
  let best = null, bs = Infinity;
  const goal = OBJ_NPC[S.tut] || (hooks().find(h => h.markers && h.markers[S.tut]) || {}).markers?.[S.tut];
  const qm = typeof questMarkerIds === 'function' ? questMarkerIds() : null;
  const f = player.face || { x:0, y:-1 }, fl = Math.hypot(f.x, f.y) || 1;
  let dog = null;
  for (const n of activeNpcs()){
    if (isFollower(n) || crowdAway(n)) continue;
    /* a dog at someone's heels (Biscuit, Lesson 15) never hides anyone or a door: only when nothing else is in reach */
    if (n.animal && n.follows && n.id !== goal){ if (facesAt(n, NEAR - 20)) dog = n; continue; }
    if ((n.yieldDoor || n.stroll) && nearestDoor()) continue;            // (a passer-by, or someone standing by doors that matter (Lesson 15's deckhand by the ticket readers), never hides a door)
    const dx = n.x - player.x, dy = n.y - player.y, d = npcDist(n);
    if (d >= NEAR) continue;
    const facing = d > 0.5 ? (dx * f.x + dy * f.y) / (d * fl) : 1;        // 1 = straight ahead, -1 = behind
    const wanted = n.id === goal || (qm && (qm.has ? qm.has(n.id) : qm.includes(n.id)));
    const score = d - facing * 18 - (wanted ? 60 : 0);
    if (score < bs){ bs = score; best = n; }
  }
  /* a follower (Mark, Margaret) is talked to only when nothing else is in reach: a door beside the player wins (a knock in the train's corridor),
     and only when the player has turned towards them (walking on with them behind, E does not open their conversation by surprise) */
  if (!best && followerNpc() && !nearestDoor()){
    const m = followerNpc(); if (facesAt(m, NEAR)) best = m;
  }
  if (!best && dog && !nearestDoor()) best = dog;
  return best;
}
/* a door is a point; a landmark (area:{x,y,w,h}, e.g. the Gattamelata) is reached from anywhere along its edge */
function doorDist(d, x, y){
  if (!d.area) return Math.hypot(d.x - x, d.y - y);
  const a = d.area, cx = Math.max(a.x, Math.min(x, a.x + a.w)), cy = Math.max(a.y, Math.min(y, a.y + a.h));
  return Math.hypot(x - cx, y - cy) + 12;     // the player's edge can't get closer than 14: 12 puts "touching" at 26
}
const doorReach = d => d.reach || (d.area ? 44 : 42);
function nearestDoor(){
  let best = null, bd = Infinity;
  for (const d of scene().doors){ if (d.when && !d.when()) continue; const dd = doorDist(d, player.x, player.y); if (dd < doorReach(d) && dd < bd){ bd = dd; best = d; } }
  return best;
}
/* the landmark E would look at (a door with look:true in reach, unless a person is: a follower or an ambient visitor never stands in the way) */
function nearLandmark(){
  const n = nearestNpc(); if (n && !isFollower(n) && !n.ambient) return null;      // (an ambient museum visitor never stands in the way)
  const d = nearestDoor(); return d && d.look ? d : null;
}
/* the point beside a landmark nearest to (x, y), where the player can stand to look at it */
function doorSpot(d, x, y){
  if (!d.area) return { x:d.x, y:d.y };
  const a = d.area, cx = Math.max(a.x, Math.min(x, a.x + a.w)), cy = Math.max(a.y, Math.min(y, a.y + a.h));
  const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy);
  if (l > 0.5) return { x:cx + dx / l * 22, y:cy + dy / l * 22 };
  return { x:d.x, y:d.y + 22 };
}
let steerSide = 1;
function steerMove(dx, dy, sp){
  const base = Math.atan2(dy, dx);
  const tries = [0, 0.5, -0.5, 1, -1, 1.5, -1.5].map(a => a * steerSide);
  for (const a of tries){
    const ang = base + a, nx = player.x + Math.cos(ang) * sp, ny = player.y + Math.sin(ang) * sp;
    if (!blocked(nx, ny, 14, false, player) && (!inAvoid(nx, ny, 10) || inAvoid(player.x, player.y, 10))){ if (a !== 0) steerSide = Math.sign(a); player.x = nx; player.y = ny; player.face = { x:Math.cos(ang), y:Math.sin(ang) }; return true; }
  }
  steerSide = -steerSide; return false;
}

/* tap-to-walk pathfinding: A* on a 20px grid of walkable cells, then smoothed */
function walkGrid(){
  const B = scene().pathBox, ox = B ? B.x : 0, oy = B ? B.y : 0;      // (a big map's chunk: only its box, world/tilemap.js)
  const G = 20, cols = Math.ceil((B ? B.w : sceneW()) / G), rows = Math.ceil((B ? B.h : sceneH()) / G), g = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) g[r * cols + c] = blocked(ox + c * G + 10, oy + r * G + 10, 14) || inAvoid(ox + c * G + 10, oy + r * G + 10, 12) ? 0 : 1;
  return { G, cols, rows, g, ox, oy };
}
function clearLine(a, b){
  const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(d / 6);
  for (let i = 1; i < n; i++){ const t = i / n; const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t; if (blocked(x, y, 13, true) || inAvoid(x, y, 10)) return false; }
  return true;
}
function findPath(sx, sy, tx, ty){
  const { G, cols, rows, g, ox, oy } = walkGrid();
  const open = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && g[r * cols + c];
  const near = (x, y) => {
    const c0 = Math.floor((x - ox) / G), r0 = Math.floor((y - oy) / G);
    for (let rad = 0; rad < 6; rad++) for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++)
      if (Math.max(Math.abs(dr), Math.abs(dc)) === rad && open(c0 + dc, r0 + dr)) return [c0 + dc, r0 + dr];
    return null;
  };
  const s = near(sx, sy), t = near(tx, ty);
  if (!s || !t) return null;
  const idx = (c, r) => r * cols + c, goal = idx(t[0], t[1]);
  const gS = new Float32Array(cols * rows).fill(Infinity), from = new Int32Array(cols * rows).fill(-1), closed = new Uint8Array(cols * rows);
  const h = (c, r) => Math.hypot(c - t[0], r - t[1]);
  gS[idx(s[0], s[1])] = 0;
  const openList = [[h(s[0], s[1]), s[0], s[1]]];
  while (openList.length){
    let bi = 0; for (let i = 1; i < openList.length; i++) if (openList[i][0] < openList[bi][0]) bi = i;
    const [, c, r] = openList.splice(bi, 1)[0], k = idx(c, r);
    if (closed[k]) continue; closed[k] = 1;
    if (k === goal) break;
    for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const nc = c + dc, nr = r + dr;
      if (!open(nc, nr) || (dc && dr && (!open(c + dc, r) || !open(c, r + dr)))) continue;
      const nk = idx(nc, nr), ng = gS[k] + (dc && dr ? 1.414 : 1);
      if (ng < gS[nk]){ gS[nk] = ng; from[nk] = k; openList.push([ng + h(nc, nr), nc, nr]); }
    }
  }
  if (from[goal] === -1 && goal !== idx(s[0], s[1])) return null;
  const pts = [];
  for (let k = goal; k !== -1; k = from[k]) pts.unshift({ x:ox + (k % cols) * G + 10, y:oy + Math.floor(k / cols) * G + 10 });
  if (!blocked(tx, ty, 14, true) && !inAvoid(tx, ty, 10)) pts.push({ x:tx, y:ty });
  const out = []; let cur = { x:sx, y:sy }, i = 0;
  while (i < pts.length){
    let j = pts.length - 1;
    while (j > i && !clearLine(cur, pts[j])) j--;
    out.push(pts[j]); cur = pts[j]; i = j + 1;
  }
  return out;
}
let route = [], goalPt = null;
const trail = [];
function setRoute(dest){
  const p = findPath(player.x, player.y, dest.x, dest.y);
  route = p && p.length ? p : [dest]; target = route[0]; goalPt = dest; stuckT = 0;
}

/* pigeons: FLOCKS[scene] = [{ x, y, dir, t, fly, ph }] (a unit puts a flock in a scene: they peck about, and fly off when
   the player comes near) */
const FLOCKS = {};
const flock = () => FLOCKS[S.scene] || null;
function updatePigeons(dt){
  const F = flock(); if (!F) return;
  const B = scene().flockBox || { x0:30, x1:sceneW() - 30, y0:scene().minY + 15, y1:sceneH() - 30 };    // (a big map: the square the pigeons keep to)
  for (const p of F){
    if (p.fly > 0){
      p.x += Math.cos(p.dir) * 230 * dt; p.y += Math.sin(p.dir) * 230 * dt;
      if (p.x < B.x0 || p.x > B.x1){ p.dir = Math.PI - p.dir; p.x = Math.max(B.x0, Math.min(B.x1, p.x)); }
      if (p.y < B.y0 || p.y > B.y1){ p.dir = -p.dir; p.y = Math.max(B.y0, Math.min(B.y1, p.y)); }
      p.fly -= dt;
      if (p.fly <= 0 && blocked(p.x, p.y, 5)) p.fly = 0.2;
    } else {
      if (Math.hypot(p.x - player.x, p.y - player.y) < 62){
        p.dir = Math.atan2(p.y - player.y, p.x - player.x) + (Math.random() - 0.5) * 0.8; p.fly = 1 + Math.random() * 0.6; continue;
      }
      p.t -= dt;
      if (p.t < 0){
        p.dir += (Math.random() - 0.5) * 1.8;
        const nx = p.x + Math.cos(p.dir) * 6, ny = p.y + Math.sin(p.dir) * 6;
        if (!blocked(nx, ny, 5)){ p.x = nx; p.y = ny; }
        p.t = 0.5 + Math.random() * 2;
      }
    }
  }
}
