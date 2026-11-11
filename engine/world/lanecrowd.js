/* Lane crowds (first built for Unit 2's streets): hundreds of passers-by flowing along a graph of lanes and squares, cheap
   enough for every frame. Generic: the unit builds the graph and gives the looks, the densities and its collision; the
   engine moves, separates and draws them (through the unit's draw function). They are not NPCs (no conversation, not in
   NPCS: they would cost every activeNpcs() call); a few of them can say a word in a bubble (worldSay works with them).

     const C = laneCrowd({
       nodes:[{ x, y, hw, cls, zone? }],   the graph's nodes (px); hw: how far either side of the line people may walk (px);
                                            cls: its kind (the densities are per kind); zone: its part of the map (focus)
       edges:[[a, b, pts?]],               node indices, and the waypoints between them ([[x, y], …], if not a straight line)
       density:{ cls:n },                  people per node of each kind (relative: scaled so the total is `total`)
       focus(zone) → weight,               where they gather (the camera's zone: 1, the others less); laneCrowdFocus(C, fn) changes it
       absolute                            the densities in the zones in focus are people per node (the rest go elsewhere)
       total,                              how many walk in the whole graph
       looks:[{ key, weight, speed?, group?:{ n:[a, b], looks:[keys], lag, umbrella? }, pet?:key, kid?:key }],
                                            what they look like (opaque to the engine but for these fields); a look with a
                                            group leads followers (a guided tour), pet / kid: a dog on a lead or a child
                                            beside them (a follower of that look)
       standing:[{ x, y, look, face, seated?, cls? }],   people who stay put (shopkeepers, gondoliers, people sitting)
       walkable(x, y, r) → bool,           the world's collision for a body of radius r (walls, water, props)
       draw(g, a, t),                      draws one person (a.look, a.face 0 down 1 left 2 right 3 up, a.frame 0–3 walking or 4
                                            standing, a.x, a.y)
       seed,
       pace:[lo, hi],                      the usual walking pace (px/s, × a look's speed; default 52–74)
       dests:[{ node, w, linger:[a, b], face? }],   where people go (a campo, a shop, a bridge, the vaporetto, a café): each
                                            walker (and each group's leader) heads for one, by the graph's shortest way, lingers
                                            there a moment (face: which way they look), then picks another; without dests
                                            they wander, by the densities
       browse:{ cls:[kinds], chance, secs:[a, b], sights:[{ x, y, r }] },   a walker whose look has `browse` (0–1) stops now
                                            and then at a node of those kinds: at a shop window (facing the fronts: up), or
                                            turned to a sight within its r (the Basilica, the Campanile); heads turn while they stand
     })
     laneCrowdUpdate(C, dt, view, player)  view: the camera's world rect. Near the view everyone is steered every frame
                                            (separation by a spatial hash, around the player, along walls); further off they
                                            just move along their lines about 5 times a second. Out of view, people of an
                                            over-full kind of place leave and appear in an under-full one: the densities hold,
                                            and nobody pops in or out where you can see.
     laneCrowdEnts(C, view, t)            the depth-sort entries ({ y, draw }) of the people in view
     laneCrowdSlow(C, x, y, fx, fy)       how much the crowd ahead slows someone walking that way (1: not at all … 0.35)
     laneCrowdPermesso(C, x, y, fx, fy)   the people in the way step to the side and let them through for a few seconds;
                                            returns them (the unit says the words)
     laneCrowdCount(C, rect)              how many people (walking + standing) are inside a world rect
     laneCrowdJam(C, x, y, secs)          the nearest group stops at the node nearest (x, y) (a jam: tests)
   A group's leader stops now and then (cfg.pause:{ cls:[kinds], chance (at each node), secs:[a, b], also?:[{ cls, chance,
   secs }] }: e.g. long stops on the campi, rare short ones in the calli), the group bunched across the lane round them: a jam
   in a narrow calle, which Permesso opens.
   C.agents, C.standing, C.ms (the last update's ms), C.near (how many were steered). */
const LANE_HASH = 40;
function laneCrowd(cfg){
  const r = rng(cfg.seed || 4321), nodes = cfg.nodes.map((n, i) => ({ ...n, i, adj:[] }));
  const edges = cfg.edges.map(([a, b, pts], i) => {
    const P = [[nodes[a].x, nodes[a].y], ...(pts || []), [nodes[b].x, nodes[b].y]], cum = [0];
    for (let k = 1; k < P.length; k++) cum.push(cum[k - 1] + Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]));
    const e = { i, a, b, P, cum, len:cum[cum.length - 1] || 1, hw:Math.min(nodes[a].hw, nodes[b].hw) };
    nodes[a].adj.push(i); nodes[b].adj.push(i);
    return e;
  });
  const C = { cfg, nodes, edges, agents:[], standing:[], r, t:0, ms:0, near:0, hash:new Map(), rebalT:0, slowSeen:0 };
  /* the targets: per bucket of nodes (their zone and kind), density × nodes × the zone's focus, scaled to the total */
  const byCls = {}; nodes.forEach(n => { n.bucket = (n.zone || '') + '|' + n.cls; (byCls[n.bucket] = byCls[n.bucket] || []).push(n.i); });
  Object.assign(C, { byCls, want:{}, focus:cfg.focus || (() => 1), burst:0 });
  laneCrowdTargets(C);
  /* the looks by weight */
  const looks = cfg.looks.filter(l => l.weight > 0), lw = looks.reduce((a, l) => a + l.weight, 0), lookByKey = Object.fromEntries(cfg.looks.map(l => [l.key, l]));
  C.lookByKey = lookByKey;
  const pickLook = () => { let v = r() * lw; for (const l of looks){ v -= l.weight; if (v <= 0) return l; } return looks[0]; };
  /* people: walkers (with their followers), then the ones who stand */
  let id = 0;
  const mk = (look, o = {}) => ({ id:'lc' + (id++), agent:true, look, x:0, y:0, face:0, frame:4, walk:r() * 4, moving:false, e:0, dir:1, s:0,
    off:(r() - 0.7) * 1.2, speed:(look.speed || 1) * ((cfg.pace || [52, 74])[0] + r() * ((cfg.pace || [52, 74])[1] - (cfg.pace || [52, 74])[0])), acc:0, near:false, yieldT:0, yieldSide:0, slow:1, pitch:0.9 + r() * 0.3, ...o });
  /* the destinations: the hops from every node to each (a breadth-first search per destination) */
  if (cfg.dests && cfg.dests.length){
    C.dests = cfg.dests.filter(d => nodes[d.node] && nodes[d.node].adj.length); C.destW = C.dests.reduce((a, d) => a + (d.w || 1), 0);
    C.destHop = C.dests.map(d => { const D = new Int16Array(nodes.length).fill(-1), q = [d.node]; D[d.node] = 0;
      for (let h = 0; h < q.length; h++){ const n = nodes[q[h]]; for (const k of n.adj){ const e = edges[k], o = e.a === n.i ? e.b : e.a; if (D[o] < 0){ D[o] = D[n.i] + 1; q.push(o); } } } return D; });
  }
  const total = cfg.total || 200;
  while (C.agents.length < total){
    const look = pickLook(), a = mk(look);
    C.agents.push(a);
    const fol = [];
    if (look.group){ const [lo, hi] = look.group.n, n = lo + Math.floor(r() * (hi - lo + 1)); for (let k = 0; k < n; k++) fol.push(mk(lookByKey[look.group.looks[Math.floor(r() * look.group.looks.length)]], { lead:a, lag:(look.group.lag || 26) * (1 + Math.floor(k / 2)) + r() * 8, side:(k % 2 ? 1 : -1) * (0.3 + r() * 0.5) })); }
    if (look.pet) fol.push(mk(lookByKey[look.pet], { lead:a, lag:16, side:0.7, pet:true }));
    if (look.kid) fol.push(mk(lookByKey[look.kid], { lead:a, lag:10, side:-0.8 }));
    if (fol.length){ a.trail = []; a.followers = fol; fol.forEach(f => { f.speed = a.speed; C.agents.push(f); }); }
    laneCrowdPlace(C, a, laneCrowdPickNode(C, null));
    laneCrowdGoal(C, a);
  }
  C.standing = (cfg.standing || []).map(s => ({ ...mk(lookByKey[s.look] || looks[0]), ...s, look:lookByKey[s.look] || looks[0], standing:true, frame:4, moving:false }));
  return C;
}
/* a walker's next destination (cfg.dests), by weight; one it can reach from where it is */
function laneCrowdGoal(C, a){
  if (!C.dests) return;
  const e = C.edges[a.e], at = a.dir > 0 ? e.b : e.a;
  for (let tries = 0; tries < 12; tries++){
    let v = C.r() * C.destW, k = 0; for (; k < C.dests.length - 1; k++){ v -= C.dests[k].w || 1; if (v <= 0) break; }
    if (C.destHop[k][at] > 0){ a.goal = k; return; }
  }
  a.goal = undefined;
}
/* the targets per bucket (again when the focus changes: laneCrowdFocus). The zones in focus (focus(zone) = 1) get their density
   as people per node (cfg.absolute) or their share by density × nodes; whoever is left is spread over the other zones by
   density × nodes × focus */
function laneCrowdTargets(C){
  const want = {}, total = C.cfg.total || 200; let inF = 0, outW = 0;
  for (const b in C.byCls){ const n0 = C.nodes[C.byCls[b][0]], f = C.focus(n0.zone || ''), w = (C.cfg.density[n0.cls] || 0) * C.byCls[b].length; want[b] = [w, f]; if (f >= 1) inF += w; else outW += w * f; }
  if (C.cfg.absolute){
    const k = inF > total * 0.92 ? total * 0.92 / inF : 1, left = total - inF * k;
    for (const b in want){ const [w, f] = want[b]; want[b] = f >= 1 ? w * k : outW ? w * f / outW * left : 0; }
  } else {
    const sum = inF + outW || 1;
    for (const b in want){ const [w, f] = want[b]; want[b] = w * Math.min(1, f) / sum * total; }
  }
  C.want = want;
}
/* where the crowd should be thickest: focus(zone) → a weight (the zone the camera is in: 1, the others less). People move
   over out of view, quickly at first (a burst) */
function laneCrowdFocus(C, focus){ C.focus = focus; laneCrowdTargets(C); C.burst = 400; }
/* a node of an under-full bucket (or any, by the targets), out of the rect `avoid` */
function laneCrowdPickNode(C, cls, avoid){
  const r = C.r;
  for (let tries = 0; tries < 30; tries++){
    let c = cls;
    if (!c){ let v = r() * Object.values(C.want).reduce((a, b) => a + b, 0); for (const k in C.want){ v -= C.want[k]; if (v <= 0){ c = k; break; } } c = c || Object.keys(C.want)[0]; }
    const list = C.byCls[c]; if (!list || !list.length) continue;
    const n = C.nodes[list[Math.floor(r() * list.length)]];
    if (!n.adj.length) continue;
    if (avoid && n.x > avoid.x - 80 && n.x < avoid.x + avoid.w + 80 && n.y > avoid.y - 120 && n.y < avoid.y + avoid.h + 80) continue;
    return n;
  }
  C.fallback = (C.fallback || 0) + 1;
  return C.nodes.find(n => n.adj.length);
}
/* put a walker (and its followers) on an edge leaving node n, somewhere along it */
function laneCrowdPlace(C, a, n){
  const e = C.edges[n.adj[Math.floor(C.r() * n.adj.length)]];
  a.e = e.i; a.dir = e.a === n.i ? 1 : -1; a.s = C.r() * e.len * 0.8; a.acc = 0;
  const p = laneEdgeAt(e, a.dir > 0 ? a.s : e.len - a.s, a.off * a.dir);
  a.x = p.x; a.y = p.y;
  if (a.followers){ a.trail = []; a.followers.forEach(f => { f.x = a.x + (C.r() - 0.5) * 20; f.y = a.y + (C.r() - 0.5) * 20; }); }
}
/* the point at distance u along an edge (from its node a), shifted sideways by off (−1 … 1, × its half-width; + is the
   left of the way from a to b), and the way's direction there */
function laneEdgeAt(e, u, off){
  const P = e.P, cum = e.cum; u = Math.max(0, Math.min(e.len, u));
  let k = 1; while (k < P.length - 1 && cum[k] < u) k++;
  const L = cum[k] - cum[k - 1] || 1, f = (u - cum[k - 1]) / L, dx = (P[k][0] - P[k - 1][0]) / L, dy = (P[k][1] - P[k - 1][1]) / L;
  return { x:P[k - 1][0] + (P[k][0] - P[k - 1][0]) * f + dy * off * e.hw, y:P[k - 1][1] + (P[k][1] - P[k - 1][1]) * f - dx * off * e.hw, dx, dy };
}
/* at the end of an edge: the next one (not straight back unless it is a dead end), by the density of where it goes and how
   straight on it is */
function laneCrowdNext(C, a){
  const e = C.edges[a.e], at = a.dir > 0 ? e.b : e.a, n = C.nodes[at];
  const inDir = laneEdgeAt(e, a.dir > 0 ? e.len : 0, 0), ix = inDir.dx * a.dir, iy = inDir.dy * a.dir;
  let best = null, tot = 0; const opts = [];
  for (const k of n.adj){
    if (k === a.e && n.adj.length > 1) continue;
    const f = C.edges[k], dir = f.a === at ? 1 : -1, other = C.nodes[dir > 0 ? f.b : f.a];
    const d0 = laneEdgeAt(f, dir > 0 ? 0 : f.len, 0), ox = d0.dx * dir, oy = d0.dy * dir, turn = ix * ox + iy * oy;     // 1 straight on, −1 back
    let w = Math.sqrt((C.cfg.density[other.cls] || 0) + 0.02) * (turn > 0.7 ? 2.2 : turn > -0.3 ? 1 : 0.15);
    /* going somewhere: the ways that bring them nearer, much more often */
    if (a.goal !== undefined && !a.lead){ const D = C.destHop[a.goal]; if (D[other.i] >= 0 && D[other.i] < D[at]) w *= 40; }
    opts.push([f, dir, w]); tot += w;
  }
  /* there: linger (a look at the campo, the shop, the boats), then the next destination */
  if (a.goal !== undefined && !a.lead && C.destHop[a.goal][at] === 0){
    const d = C.dests[a.goal], L = d.linger || [2, 6];
    a.pauseT = L[0] + C.r() * (L[1] - L[0]); a.pauseFace = d.face; a.pauseLook = null;
    laneCrowdGoal(C, a);
  }
  let v = C.r() * tot; for (const o of opts){ v -= o[2]; if (v <= 0){ best = o; break; } }
  best = best || opts[0];
  if (!best){ a.dir = -a.dir; a.s = 0; return; }
  a.e = best[0].i; a.dir = best[1]; a.s = 0;
  if (C.r() < 0.3) a.off = Math.max(-1, Math.min(0.5, a.off + (C.r() - 0.5) * 0.6));
  /* a group's leader now and then stops (a guide telling the story of a place), the group bunched round them */
  const P = C.cfg.pause;
  if (P && a.followers && !(a.pauseT > 0)) for (const q of [P, ...(P.also || [])]) if (q.cls.includes(n.cls) && C.r() < q.chance){ a.pauseT = q.secs[0] + C.r() * (q.secs[1] - q.secs[0]); a.pauseFace = undefined; break; }
  /* a walker who browses: a moment at a shop window, or turned to a sight */
  const B = C.cfg.browse;
  if (B && a.look.browse && !a.lead && !a.followers && !(a.pauseT > 0) && B.cls.includes(n.cls) && C.r() < B.chance * a.look.browse){
    a.pauseT = B.secs[0] + C.r() * (B.secs[1] - B.secs[0]);
    const sight = (B.sights || []).find(q => Math.hypot(q.x - n.x, q.y - n.y) < q.r);
    a.pauseLook = sight ? { x:sight.x, y:sight.y } : null; a.pauseFace = sight ? undefined : 3;
  }
}
function laneCrowdUpdate(C, dt, view, player){
  const t0 = performance.now(); C.t += dt;
  const m = 220, nx0 = view.x - m, nx1 = view.x + view.w + m, ny0 = view.y - m, ny1 = view.y + view.h + m;
  const isNear = a => a.x > nx0 && a.x < nx1 && a.y > ny0 && a.y < ny1;
  /* the spatial hash of everyone near */
  const H = C.hash; H.clear();
  const hk = (x, y) => (Math.floor(x / LANE_HASH) * 73856093) ^ (Math.floor(y / LANE_HASH) * 19349663);
  const put = a => { const k = hk(a.x, a.y); let b = H.get(k); if (!b) H.set(k, b = []); b.push(a); };
  let near = 0;
  for (const a of C.agents){ a.near = isNear(a); if (a.near){ put(a); near++; } }
  for (const s of C.standing) if (isNear(s)) put(s);
  C.near = near;
  const around = (x, y, f) => { const i0 = Math.floor(x / LANE_HASH), j0 = Math.floor(y / LANE_HASH); for (let j = j0 - 1; j <= j0 + 1; j++) for (let i = i0 - 1; i <= i0 + 1; i++){ const b = H.get((i * 73856093) ^ (j * 19349663)); if (b) for (const o of b) f(o); } };
  const W = C.cfg.walkable;
  for (const a of C.agents){
    if (a.lead) continue;
    a.yieldT = Math.max(0, a.yieldT - dt);
    if (!a.near){
      /* far: along the line, a few times a second */
      a.acc += dt; if (a.acc < 0.2) continue;
      const step = a.acc; a.acc = 0;
      if (a.pauseT > 0) a.pauseT -= step; else laneCrowdAdvance(C, a, a.speed * step);
      const e = C.edges[a.e], p = laneEdgeAt(e, a.dir > 0 ? a.s : e.len - a.s, a.off * a.dir);
      laneCrowdMoveTo(a, p.x, p.y, step, false);
      continue;
    }
    /* near: steer to a point a little ahead on the line, away from the others and the player, never into a wall */
    const e = C.edges[a.e], u = a.dir > 0 ? a.s : e.len - a.s;
    let off = a.off;
    if (a.yieldT > 0) off = a.yieldSide;
    if (a.pauseT > 0){
      a.pauseT -= dt;
      const q = laneEdgeAt(e, u, off * a.dir), dx = q.x - a.x, dy = q.y - a.y, d0 = Math.hypot(dx, dy);
      if (d0 > 2){ const st = Math.min(d0, 40 * dt); laneCrowdMoveTo(a, a.x + dx / d0 * st, a.y + dy / d0 * st, dt, true); }
      else {
        laneCrowdMoveTo(a, a.x, a.y, dt, true);
        /* which way they look: a sight, the shop windows, the destination's way; now and then a glance the way they came (heads turn) */
        const glance = Math.sin(C.t * 1.7 + a.pitch * 9) > 0.75;
        a.face = glance ? laneFace(-q.dx * a.dir, -q.dy * a.dir) : a.pauseLook ? laneFace(a.pauseLook.x - a.x, a.pauseLook.y - a.y) : a.pauseFace !== undefined ? a.pauseFace : laneFace(-q.dx * a.dir, -q.dy * a.dir);
      }
      if (a.pauseT <= 0){ a.pauseLook = null; a.pauseFace = undefined; }
      continue;
    }
    const tgt = laneEdgeAt(e, a.dir > 0 ? u + 30 : u - 30, off * a.dir);
    let vx = tgt.x - a.x, vy = tgt.y - a.y; const d = Math.hypot(vx, vy) || 1; vx /= d; vy /= d;
    let sp = a.speed * (a.yieldT > 0 ? 0.35 : 1), sx = 0, sy = 0;
    around(a.x, a.y, o => {
      if (o === a) return;
      const dx = a.x - o.x, dy = a.y - o.y, dd = dx * dx + dy * dy;
      if (dd > 24 * 24 || dd < 0.01) return;
      const q = Math.sqrt(dd), push = (24 - q) / 24;
      sx += dx / q * push; sy += dy / q * push;
      /* someone close ahead, going the same way or standing: keep behind them */
      if ((-dx * vx - dy * vy) / q > 0.8 && q < 20 && !o.pet) sp = Math.min(sp, o.standing ? sp * 0.6 : Math.max(18, o.speed * 0.95));
    });
    /* the player: people part round them, and slow down when they are right in the way */
    if (player){
      const dx = a.x - player.x, dy = a.y - player.y, q = Math.hypot(dx, dy);
      if (q < 54 && q > 0.01){
        const ahead = (-dx * vx - dy * vy) / q;
        sx += dx / q * (54 - q) / 30; sy += dy / q * (54 - q) / 30;
        if (ahead > 0.3){ const side = (vx * dy - vy * dx) >= 0 ? 1 : -1; sx += -vy * side * 0.9; sy += vx * side * 0.9; if (q < 32) sp *= 0.45; }
      }
    }
    let mx = vx + sx * 1.4, my = vy + sy * 1.4; const ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
    const stepLen = sp * dt, nx = a.x + mx * stepLen, ny = a.y + my * stepLen;
    let x = a.x, y = a.y;
    if (W(nx, ny, 8)){ x = nx; y = ny; } else if (W(nx, a.y, 8)){ x = nx; } else if (W(a.x, ny, 8)){ y = ny; }
    /* caught on a corner for a while: back onto the line */
    if (stepLen > 0.5 && Math.hypot(x - a.x, y - a.y) < stepLen * 0.2){ a.stuck = (a.stuck || 0) + dt; if (a.stuck > 1.2){ const q = laneEdgeAt(e, u, 0); x = q.x; y = q.y; a.stuck = 0; } } else a.stuck = 0;
    const prog = (x - a.x) * vx + (y - a.y) * vy;
    laneCrowdAdvance(C, a, Math.max(prog, stepLen * 0.15));
    laneCrowdMoveTo(a, x, y, dt, true);
  }
  /* followers: the leader's trail, a step or two behind, to one side */
  for (const a of C.agents){
    if (!a.lead) continue;
    const L = a.lead, T = L.trail;
    if (L.pauseT > 0 && !a.pet){
      /* round the stopped leader: across the lane, a little behind them; to one side when they let someone through */
      const e = C.edges[L.e], q = laneEdgeAt(e, L.dir > 0 ? L.s : e.len - L.s, 0), tx0 = q.dx * L.dir, ty0 = q.dy * L.dir, nx = ty0, ny = -tx0;
      /* (spread evenly across the lane by their place in the group, either side of the leader in turn: no gap a body fits through) */
      const fk = L.followers.indexOf(a), fn = Math.ceil(L.followers.length / 2), across = fk < 0 ? (a.side || 0) : (fk % 2 ? 1 : -1) * (Math.floor(fk / 2) + 1) / fn * 0.9;
      const sd = a.yieldT > 0 ? L.yieldSide * (0.55 + 0.4 * Math.abs(across)) : across, back = (a.lag || 20) * 0.45;
      let tx = L.x - tx0 * back + nx * sd * e.hw, ty = L.y - ty0 * back + ny * sd * e.hw;
      if (a.near && !W(tx, ty, 6)){ tx = L.x - tx0 * back; ty = L.y - ty0 * back; }
      const dx = tx - a.x, dy = ty - a.y, d0 = Math.hypot(dx, dy);
      if (!a.near || d0 > 160) laneCrowdMoveTo(a, tx, ty, dt, false);
      else if (d0 > 2){ const st = Math.min(d0, 55 * dt); laneCrowdMoveTo(a, a.x + dx / d0 * st, a.y + dy / d0 * st, dt, true); }
      else { laneCrowdMoveTo(a, a.x, a.y, dt, true); a.face = laneFace(L.x - a.x, L.y - a.y); }
      continue;
    }
    if (!T || !T.length){ laneCrowdMoveTo(a, L.x + 14 * (a.side || 0), L.y - 10, dt, a.near); continue; }
    let need = a.lag, k = T.length - 1, px = L.x, py = L.y;
    while (k >= 0){ const q = Math.hypot(T[k][0] - px, T[k][1] - py); if (q >= need){ const f = need / q; px += (T[k][0] - px) * f; py += (T[k][1] - py) * f; need = 0; break; } need -= q; px = T[k][0]; py = T[k][1]; k--; }
    const ddx = (T[Math.max(0, k)] || [L.x])[0] - px, ddy = (T[Math.max(0, k)] || [0, L.y])[1] - py, dl = Math.hypot(ddx, ddy) || 1;
    const sd = a.yieldT > 0 && L.yieldT > 0 ? L.yieldSide * 1.4 : (a.side || 0);
    let tx = px + (-ddy / dl) * sd * 16, ty = py + (ddx / dl) * sd * 16;
    if (a.near && !W(tx, ty, 6)){ tx = px; ty = py; }
    if (!a.near || Math.hypot(tx - a.x, ty - a.y) > 160){ laneCrowdMoveTo(a, tx, ty, dt, false); continue; }
    const dx = tx - a.x, dy = ty - a.y, q = Math.hypot(dx, dy), sp = Math.min(q, (q > 30 ? 1.6 : 1.05) * a.speed * dt);
    if (q > 1){ const x = a.x + dx / q * sp, y = a.y + dy / q * sp; laneCrowdMoveTo(a, x, y, dt, true); } else { a.moving = L.moving; laneCrowdMoveTo(a, a.x, a.y, dt, true); }
  }
  /* out of view, people leave over-full kinds of places and appear in under-full ones */
  C.rebalT -= dt;
  if (C.rebalT <= 0){ C.rebalT = C.burst > 0 ? 0.1 : 0.5; laneCrowdRebalance(C, view); }
  C.ms = performance.now() - t0;
}
function laneCrowdAdvance(C, a, ds){
  a.s += ds;
  let guard = 0;
  while (a.s >= C.edges[a.e].len && guard++ < 6){ const over = a.s - C.edges[a.e].len; laneCrowdNext(C, a); a.s = over; }
}
/* the facing (0 down, 1 left, 2 right, 3 up) of a direction */
const laneFace = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 1) : dy > 0 ? 0 : 3;
/* move a person to (x, y): their facing, their stride, the leader's trail */
function laneCrowdMoveTo(a, x, y, dt, near){
  const dx = x - a.x, dy = y - a.y, d = Math.hypot(dx, dy);
  if (d > 0.3){
    if (d < 40 || !near){ const ax = Math.abs(dx), ay = Math.abs(dy); if (ax > ay * 1.15) a.face = dx > 0 ? 2 : 1; else if (ay > ax * 1.15) a.face = dy > 0 ? 0 : 3; }
    a.walk += d / 11; a.frame = Math.floor(a.walk) % 4; a.moving = true;
  } else { a.moving = false; a.frame = 4; }
  a.x = x; a.y = y;
  if (a.trail){ const T = a.trail, l = T[T.length - 1]; if (!l || Math.hypot(l[0] - x, l[1] - y) > 8){ T.push([x, y]); if (T.length > 40) T.shift(); } if (d > 120) T.length = 0; }
}
function laneCrowdRebalance(C, view){
  const cnt = {}; for (const c in C.want) cnt[c] = 0;
  const clsOf = a => { const e = C.edges[a.e]; return C.nodes[a.s < e.len / 2 === a.dir > 0 ? e.a : e.b].bucket; };
  for (const a of C.agents) if (!a.lead) cnt[clsOf(a)] = (cnt[clsOf(a)] || 0) + 1 + (a.followers ? a.followers.length : 0);
  const inView = a => a.x > view.x - 60 && a.x < view.x + view.w + 60 && a.y > view.y - 100 && a.y < view.y + view.h + 60;
  const n = C.burst > 0 ? 16 : 3;
  for (let k = 0; k < n; k++){
    let over = null, under = null, ov = 0, un = 0;
    for (const c in C.want){ const d = (cnt[c] || 0) - C.want[c]; if (d > ov){ ov = d; over = c; } if (-d > un){ un = -d; under = c; } }
    if (!over || !under || ov < 1 || un < 1){ C.burst = 0; return; }
    const cand = C.agents.filter(a => !a.lead && clsOf(a) === over && !inView(a) && !(a.followers && a.followers.some(inView)));
    if (!cand.length){ cnt[over] = C.want[over]; continue; }
    const a = cand[Math.floor(C.r() * cand.length)], size = 1 + (a.followers ? a.followers.length : 0);
    laneCrowdPlace(C, a, laneCrowdPickNode(C, under, view));
    cnt[over] -= size; cnt[clsOf(a)] = (cnt[clsOf(a)] || 0) + size;
    C.burst -= 1;
  }
}
function laneCrowdEnts(C, view, t){
  const out = [], x0 = view.x - 30, x1 = view.x + view.w + 30, y0 = view.y - 10, y1 = view.y + view.h + 70;
  const D = C.cfg.draw;
  for (const a of C.agents) if (a.x > x0 && a.x < x1 && a.y > y0 && a.y < y1) out.push({ y:a.y, draw:() => D(ctx, a, t) });
  for (const a of C.standing) if (a.x > x0 && a.x < x1 && a.y > y0 && a.y < y1) out.push({ y:a.y, draw:() => D(ctx, a, t) });
  return out;
}
/* the crowd ahead of someone at (x, y) walking (fx, fy): people within a body or so of the next step (not the ones letting
   them through) */
function laneCrowdSlow(C, x, y, fx, fy){
  const l = Math.hypot(fx, fy) || 1, ax = x + fx / l * 20, ay = y + fy / l * 20;
  let n = 0;
  const i0 = Math.floor(ax / LANE_HASH), j0 = Math.floor(ay / LANE_HASH);
  for (let j = j0 - 1; j <= j0 + 1; j++) for (let i = i0 - 1; i <= i0 + 1; i++){ const b = C.hash.get((i * 73856093) ^ (j * 19349663)); if (b) for (const a of b){ if (a.yieldT > 0 || a.pet || a.standing) continue; const q = Math.hypot(a.x - ax, a.y - ay); if (q < 28) n += q < 20 ? 1 : 0.5; } }
  return Math.max(0.3, 1 - 0.26 * n);
}
function laneCrowdPermesso(C, x, y, fx, fy){
  const l = Math.hypot(fx, fy) || 1, ux = fx / l, uy = fy / l, out = [];
  const inReach = a => { const dx = a.x - x, dy = a.y - y; return Math.hypot(dx, dy) <= 140 && dx * ux + dy * uy >= -10; };
  for (const a of C.agents){
    if (a.lead) continue;
    const grp = [a, ...(a.followers || [])]; if (!grp.some(inReach)) continue;
    const e = C.edges[a.e], d = laneEdgeAt(e, a.dir > 0 ? a.s : e.len - a.s, 0);
    /* the side of their way that is further from the player's line */
    const nx = d.dy * a.dir, ny = -d.dx * a.dir, side = ((a.x - x) * nx + (a.y - y) * ny) >= 0 ? 1 : -1;
    for (const m of grp){ m.yieldT = a.pauseT > 0 ? 6 : 3.5; m.yieldSide = side; out.push(m); }
  }
  for (const s of C.standing) if (Math.hypot(s.x - x, s.y - y) < 130) out.push(s);
  return out;
}
/* stop the group nearest (x, y) right there, for `secs` (tests and a scene that wants a jam): the leader on the line ahead */
function laneCrowdJam(C, x, y, secs = 30){
  let best = null, bd = Infinity;
  for (const a of C.agents) if (a.followers && a.followers.length >= 4){ const d = Math.hypot(a.x - x, a.y - y); if (d < bd){ bd = d; best = a; } }
  if (!best) return null;
  let bn = null, nd = Infinity; for (const n of C.nodes){ if (!n.adj.length) continue; const d = Math.hypot(n.x - x, n.y - y); if (d < nd){ nd = d; bn = n; } }
  laneCrowdPlace(C, best, bn); best.s = 0; const e = C.edges[best.e], p = laneEdgeAt(e, best.dir > 0 ? 0 : e.len, 0); best.x = p.x; best.y = p.y;
  best.followers.forEach((f, k) => { f.x = p.x + ((k % 3) - 1) * 14; f.y = p.y + Math.floor(k / 3) * 12 - 6; });
  best.pauseT = secs; best.yieldT = 0; best.followers.forEach(f => { f.yieldT = 0; });
  return best;
}
function laneCrowdCount(C, R){
  let n = 0; for (const a of C.agents) if (a.x >= R.x && a.x <= R.x + R.w && a.y >= R.y && a.y <= R.y + R.h && !a.pet) n++;
  for (const a of C.standing) if (a.x >= R.x && a.x <= R.x + R.w && a.y >= R.y && a.y <= R.y + R.h && !a.pet) n++;
  return n;
}
