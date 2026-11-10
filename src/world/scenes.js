/* Scenes, collision, A* pathfinding, pigeons. */

/* =========================================================
   WORLD: scenes, collision, movement, pigeons
   ========================================================= */
const FOUNTAIN = { x:470, y:340 };
const TABLES = [[722, 226], [905, 262], [830, 302]];
const COUNTER = { x:770, y:150, w:140, h:30 };
/* the market (Piazza delle Erbe): four stalls around a central walkway (x 400–560).
   Each stall: striped awning at the back, the vendor behind the counter, the player talks from the front.
   Vendor positions (content/npcs.js) sit at vx, row 0 → y 210, row 1 → y 378. */
const STALLS = [
  { id:'teresa', x:70,  row:0, vx:330, awn:['#1c3d8f', '#f5f1e8'] },
  { id:'gino',   x:560, row:0, vx:630, awn:['#c23b2a', '#f5f1e8'] },
  { id:'franco', x:70,  row:1, vx:330, awn:['#2e6a4e', '#f5f1e8'] },
  { id:'pina',   x:560, row:1, vx:630, awn:['#e07a2f', '#f6e3a0'] },
];
const STALL_W = 330;
/* per row: awning top, counter top, counter height, vendor y */
const STALL_ROW = [{ top:140, awn:146, ct:220, ch:24, vy:210 }, { top:312, awn:316, ct:388, ch:24, vy:378 }];
/* the Gattamelata's stepped plinth in Piazza del Santo (world/statue.js): blocks walking, and is where you look at it from */
const GATTA = { x:206, y:296, w:188, h:114 };
/* the museum square (scene 'museo', Lesson 10 on): the Museo d'Arte at the top with its doors, the ticket booth
   (Biglietteria) beside them between two long planters, so the booth's window is reached only through the bay between
   the planters (the crowd stands in it: world/museo.js), the clock tower on the left (an oblique sprite, like the
   Gattamelata), a bench, the Giardini dell'Arena behind a railing on the right. */
const MUSEO = {
  doors:{ x:400, y:166 },
  booth:{ x:556, y:150, w:144, h:72 },               // walk-blocking; its glass window and counter are the front (y 206–222)
  planters:[{ x:500, y:150, w:36, h:154 }, { x:700, y:150, w:36, h:154 }],
  tower:{ x:60, y:150, w:104, h:84 },                 // the clock tower's footprint; ground line at y 234
  bench:{ x:150, y:440, w:96, h:20 }, seat:{ x:198, y:446 },   // Bruno sits on the seat (a lesson places him there)
  garden:{ x:840, y:150, w:120, h:450 },
  bikes:{ x:640, y:548, w:150, h:30 },
  trees:[[34, 330], [34, 520], [300, 574]],
};
const MARKET_PROPS = [[34, 470, 20], [926, 470, 20], [180, 520, 18], [800, 528, 18]];   // loose crates and a cart: [x, y, r]
const SCENES = {
  piazza: {
    minY:160, spawn:{ x:480, y:520 },
    C:[ { x:470, y:340, r:84 }, ...TABLES.map(([x, y]) => ({ x, y, r:22 })),
        { x:40, y:168, r:20 }, { x:300, y:166, r:20 }, { x:640, y:166, r:20 }, { x:40, y:560, r:20 }, { x:930, y:560, r:20 }, { x:330, y:556, r:26 } ],
    R:[ { x:100, y:318, w:128, h:116 }, COUNTER ],
    doors:[],
  },
  santo: {
    minY:24, spawn:{ x:480, y:556 },
    C:[ { x:70, y:250, r:22 }, { x:890, y:250, r:22 }, { x:70, y:470, r:22 }, { x:890, y:470, r:22 } ],
    R:[ { x:200, y:0, w:560, h:172 }, GATTA, { x:600, y:420, w:70, h:14 }, { x:250, y:470, w:70, h:14 } ],
    doors:[
      { id:'gattamelata', x:300, y:GATTA.y + GATTA.h, area:GATTA, look:true, msg:'' },   // opens the picture (world/statue.js)
      { id:'basilica', x:480, y:190, msg:'<b>La Basilica del Santo.</b> People here just call it “il Santo”. Cool and quiet inside.' },
    ],
  },
  aurora: {
    minY:104, spawn:{ x:378, y:376 },
    C:[ { x:420, y:320, r:34 }, { x:190, y:230, r:34 }, { x:200, y:470, r:34 }, { x:680, y:470, r:34 }, { x:650, y:250, r:34 },
        { x:150, y:230, r:14 }, { x:230, y:230, r:14 }, { x:640, y:470, r:14 }, { x:40, y:130, r:20 }, { x:920, y:560, r:20 } ],
    R:[ { x:760, y:90, w:200, h:100 } ],
    doors:[ { id:'exit', x:480, y:576, msg:'' } ],
  },
  sanlorenzo: {
    minY:16, spawn:{ x:170, y:240 },
    C:[ { x:60, y:280, r:18 }, { x:330, y:200, r:16 } ],
    R:[ { x:0, y:0, w:340, h:168 }, { x:400, y:0, w:220, h:300 }, { x:680, y:0, w:280, h:300 }, { x:0, y:370, w:520, h:230 }, { x:580, y:370, w:380, h:230 }, { x:150, y:196, w:60, h:16 } ],
    doors:[
      { id:'aurora', x:658, y:126, msg:'' },
      { id:'barsport', x:378, y:100, msg:'<b>Bar Sport</b>, Via Verdi. A football match is on the TV. Not the café Marco meant.' },
      { id:'banca', x:560, y:318, msg:'<b>La banca.</b> A sign on the door says <i>Chiuso per pranzo</i>: closed for lunch.' },
      { id:'farmacia', x:880, y:318, msg:'<b>La farmacia.</b> The green cross means pharmacy all over Italy.' },
      { id:'panetteria', x:260, y:352, msg:'<b>La panetteria.</b> It smells of fresh bread. Maybe later!' },
      { id:'chiesa', x:170, y:184, msg:'<b>La chiesa di San Lorenzo.</b> Cool and quiet inside.' },
    ],
  },
  mercato: {
    minY:150, spawn:{ x:480, y:556 },
    C:MARKET_PROPS.map(([x, y, r]) => ({ x, y, r })),
    R:[ ...STALLS.map(s => { const R = STALL_ROW[s.row]; return { x:s.x, y:R.top, w:STALL_W, h:R.ct + R.ch - R.top }; }) ],
    doors:[
      { id:'ragione', x:480, y:164, msg:'<b>Il Palazzo della Ragione.</b> For eight hundred years Padua has held its markets on both sides of it: <i>le erbe</i> (herbs and vegetables) here, fruit in Piazza della Frutta.' },
    ],
  },
  museo: {
    minY:150, spawn:{ x:480, y:556 },
    C:MUSEO.trees.map(([x, y]) => ({ x, y, r:20 })),
    R:[ MUSEO.booth, ...MUSEO.planters, MUSEO.tower, MUSEO.bench, MUSEO.garden, MUSEO.bikes ],
    doors:[
      { id:'museo', x:MUSEO.doors.x, y:MUSEO.doors.y, msg:'<b>Museo d\'Arte · I Capolavori.</b> Entry with a timed ticket only. The ticket office, the <i>Biglietteria</i>, is beside the doors.' },
      { id:'orologio', x:112, y:MUSEO.tower.y + MUSEO.tower.h, area:MUSEO.tower, look:true, lookAt:'the clock', msg:'' },   // opens the clock face (world/museo.js)
    ],
  },
};
const scene = () => SCENES[S.scene] || SCENES.piazza;
/* the camera. Every scene is 960 × 600 (the canvas) unless it has its own size (w, h: the museum interior, 'galleria',
   world/galleria.js): then the view follows the player, clamped to the scene's edges. World coordinates are used
   everywhere (positions, collision, doors, drawing); only draw() (translate by -cam) and the pointer (+cam) convert. */
const cam = { x:0, y:0, overview:false };
const sceneW = () => scene().w || W, sceneH = () => scene().h || H;
function updateCam(){
  const sw = sceneW(), sh = sceneH();
  if (cam.overview || (sw <= W && sh <= H)){ cam.x = 0; cam.y = 0; return; }
  const fx = scene().focusX ? scene().focusX() : player.x;          // (a scene can look elsewhere for a moment: the night train's beats)
  cam.x = Math.round(Math.max(0, Math.min(sw - W, fx - W / 2)));
  cam.y = Math.round(Math.max(0, Math.min(sh - H, player.y - H / 2)));
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
  const G = 20, cols = Math.ceil(sceneW() / G), rows = Math.ceil(sceneH() / G), g = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) g[r * cols + c] = blocked(c * G + 10, r * G + 10, 14) || inAvoid(c * G + 10, r * G + 10, 12) ? 0 : 1;
  return { G, cols, rows, g };
}
function clearLine(a, b){
  const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(d / 6);
  for (let i = 1; i < n; i++){ const t = i / n; const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t; if (blocked(x, y, 13, true) || inAvoid(x, y, 10)) return false; }
  return true;
}
function findPath(sx, sy, tx, ty){
  const { G, cols, rows, g } = walkGrid();
  const open = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows && g[r * cols + c];
  const near = (x, y) => {
    const c0 = Math.floor(x / G), r0 = Math.floor(y / G);
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
  for (let k = goal; k !== -1; k = from[k]) pts.unshift({ x:(k % cols) * G + 10, y:Math.floor(k / cols) * G + 10 });
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

const pigeons = [], pigeonsMuseo = [];
(function initPigeons(){
  const r = rng(11);
  while (pigeons.length < 7){
    const p = { x:380 + r() * 200, y:455 + r() * 90, dir:r() * 6.28, t:r() * 2, fly:0, ph:r() * 6 };
    const d = Math.hypot(p.x - FOUNTAIN.x, p.y - FOUNTAIN.y);
    if (d > 92 && Math.hypot(p.x - 590, p.y - 432) > 24) pigeons.push(p);
  }
  while (pigeonsMuseo.length < 6) pigeonsMuseo.push({ x:290 + r() * 170, y:300 + r() * 120, dir:r() * 6.28, t:r() * 2, fly:0, ph:r() * 6 });
})();
/* the pigeons of the current scene (the piazza's, the museum square's), or none */
const flock = () => S.scene === 'piazza' ? pigeons : S.scene === 'museo' ? pigeonsMuseo : null;
function updatePigeons(dt){
  const F = flock(); if (!F) return;
  const top = scene().minY + 15;
  for (const p of F){
    if (p.fly > 0){
      p.x += Math.cos(p.dir) * 230 * dt; p.y += Math.sin(p.dir) * 230 * dt;
      if (p.x < 30 || p.x > W - 30){ p.dir = Math.PI - p.dir; p.x = Math.max(30, Math.min(W - 30, p.x)); }
      if (p.y < top || p.y > H - 30){ p.dir = -p.dir; p.y = Math.max(top, Math.min(H - 30, p.y)); }
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
