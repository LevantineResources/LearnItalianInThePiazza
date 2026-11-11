/* Cached static layers (first built for Unit 2's walkable city): a big map's ground and buildings are drawn once, in square
   tiles of `size` world px, onto offscreen canvases, and each frame only draws the tiles in view (drawImage). The least
   recently used are dropped beyond `max`.
     const L = layerCache((g, x, y, w, h) => { … draw the world rect (x, y, w, h) into g, in world coordinates … }, { size, max, res })
       res: () → the tiles' px per world px (default DPR; a zoomed camera on a sharp canvas wants camZoom() × RES). A tile made
       at another res (the zoom or the window changed) is still drawn, and made again at the new one in idle time
       bleed: world px each tile draws past its right and bottom edges (default 0), so tiles overlap and no seam shows between
       them at a zoom that puts their edges between screen px
       ring: how many tiles round the view are made ahead in idle time (default 1; more for a fast walk)
     drawLayer(L, x, y, w, h)       draw the world rect (the view) from the cache, into ctx (which has the camera's transform)
     layerWarm(L, x, y, w, h)       queue every tile of that rect, to be made in idle time (a chunk being entered)
     layerWarmNow(L, x, y, w, h)    make them now
     layerClear(L)                  forget every tile (fonts loaded, a change of look)
   IDLE-TIME SLICES. The draw function may be a generator function (function*): it yields between steps, each step a few ms of
   drawing. A tile that is not needed yet (the ring round the view, a warmed rect) is then made in slices of at most
   `slice` ms (default 4) in idle time (requestIdleCallback, or a timeout), never inside a frame, so walking on never waits
   for one; a tile that is needed in view and not ready is finished at once (a jump across the map). A plain draw function
   works too (made whole, as before). L.made / L.ms count the tiles made and their time; L.sliceMax is the longest slice.
   idleRun(generator, { slice, done }) runs any other generator the same way (a unit's warm-up work).
   And seeThrough(box, baseY): the alpha for something tall drawn in the depth-sorted pass (box: its rect on screen, in world
   coordinates; baseY: its depth) when the player stands behind it (their figure overlaps it and they are further back):
   faded, so nobody is ever lost behind a tower or under an arcade. */
function layerCache(draw, o = {}){ return { draw, size:o.size || 512, max:o.max || 30, slice:o.slice || 4, res:o.res || null, bleed:o.bleed || 0, ring:o.ring || 1, tiles:new Map(), jobs:new Map(), tick:0, made:0, ms:0, sliceMax:0, sync:0, idle:false }; }
const layerRes = L => L.res ? L.res() : DPR;
/* a job: the tile's canvas and its drawing, started (an iterator when the draw function is a generator) */
function layerJob(L, i, j){
  const key = i + ',' + j;
  let job = L.jobs.get(key); if (job) return job;
  const s = L.size, e = s + L.bleed, c = document.createElement('canvas'), R = layerRes(L);
  c.width = Math.ceil(e * R); c.height = Math.ceil(e * R);
  const g = c.getContext('2d'); g.scale(c.width / e, c.height / e); g.translate(-i * s, -j * s);
  g.save(); g.beginPath(); g.rect(i * s, j * s, e, e); g.clip();
  job = { key, c, g, it:null, started:false, ms:0, res:R };
  L.jobs.set(key, job);
  return job;
}
/* run a job for up to `budget` ms (Infinity: to the end); true when its tile is made */
function layerStep(L, job, budget){
  const t0 = performance.now(), i = +job.key.split(',')[0], j = +job.key.split(',')[1], s = L.size;
  if (!job.started){ job.started = true; const r = L.draw(job.g, i * s, j * s, s + L.bleed, s + L.bleed); job.it = r && typeof r.next === 'function' ? r : null; }
  let done = !job.it;
  while (!done){
    const t1 = performance.now();
    done = job.it.next().done;
    const now = performance.now(); job.step = Math.max((job.step || 0) * 0.8, now - t1);   // (the longest step lately)
    if (now - t0 + job.step > budget) break;                                              // (the next would overrun the slice)
  }
  job.ms += performance.now() - t0;
  if (!done) return false;
  job.g.restore(); L.jobs.delete(job.key);
  L.tiles.set(job.key, { c:job.c, used:++L.tick, res:job.res }); L.made++; L.ms += job.ms;
  if (L.tiles.size > L.max){
    let old = null; for (const [k, v] of L.tiles) if (k !== job.key && (!old || v.used < old[1].used)) old = [k, v];
    if (old) L.tiles.delete(old[0]);
  }
  return true;
}
/* a tile now (finished at once if it was queued or not started) */
function layerTile(L, i, j){
  const key = i + ',' + j;
  let e = L.tiles.get(key);
  if (!e){ const t0 = performance.now(); layerStep(L, layerJob(L, i, j), Infinity); L.sync++; L.syncMs = (L.syncMs || 0) + performance.now() - t0; e = L.tiles.get(key); }
  e.used = ++L.tick;
  return e.c;
}
/* queue a tile for idle time */
function layerQueue(L, i, j){
  if (i < 0 || j < 0 || L.tiles.has(i + ',' + j)) return;
  layerJob(L, i, j); layerIdleSoon(L);
}
function layerIdleSoon(L){
  if (L.idle || !L.jobs.size) return;
  L.idle = true;
  const run = dl => {
    L.idle = false;
    const t0 = performance.now(), avail = dl && dl.timeRemaining ? Math.min(L.slice, Math.max(1, dl.timeRemaining())) : L.slice;
    /* one slice: the oldest job first, as many steps as the slice allows */
    for (const job of L.jobs.values()){
      const left = avail - (performance.now() - t0); if (left <= 0.3) break;
      layerStep(L, job, left);
    }
    L.sliceMax = Math.max(L.sliceMax, performance.now() - t0);
    layerIdleSoon(L);
  };
  if (window.requestIdleCallback) requestIdleCallback(run, { timeout:120 }); else setTimeout(run, 16);
}
/* any generator run in idle-time slices (of `slice` ms): idleRun(gen(), { slice, done }) */
function idleRun(it, o = {}){
  const slice = o.slice || 4, job = { it, step:0, done:false };
  const run = dl => {
    const t0 = performance.now(), avail = dl && dl.timeRemaining ? Math.min(slice, Math.max(1, dl.timeRemaining())) : slice;
    while (!job.done){
      const t1 = performance.now(); job.done = !!it.next().done; const now = performance.now();
      job.step = Math.max(job.step * 0.8, now - t1);
      if (now - t0 + job.step > avail) break;
    }
    if (job.done){ if (o.done) o.done(); } else if (window.requestIdleCallback) requestIdleCallback(run, { timeout:200 }); else setTimeout(run, 16);
  };
  if (window.requestIdleCallback) requestIdleCallback(run, { timeout:200 }); else setTimeout(run, 16);
  return job;
}
function drawLayer(L, x, y, w, h){
  const s = L.size, i0 = Math.floor(x / s), i1 = Math.floor((x + w - 0.01) / s), j0 = Math.floor(y / s), j1 = Math.floor((y + h - 0.01) / s);
  const R = layerRes(L);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++){
    ctx.drawImage(layerTile(L, i, j), i * s, j * s, s + L.bleed, s + L.bleed);
    const e = L.tiles.get(i + ',' + j);                       // (made at another res: made again in idle time, drawn as it is meanwhile)
    if (e && e.res !== R && !L.jobs.has(i + ',' + j)){ layerJob(L, i, j); layerIdleSoon(L); }
  }
  /* the ring round the view, queued for idle time (when the view and its ring fit in the cache: so the tile dropped for one
     is never one in view or in the ring) */
  const g = L.ring; if ((i1 - i0 + 1 + 2 * g) * (j1 - j0 + 1 + 2 * g) > L.max) return;
  for (let j = j0 - g; j <= j1 + g; j++) for (let i = i0 - g; i <= i1 + g; i++) if (!L.tiles.has(i + ',' + j) && !L.jobs.has(i + ',' + j)) layerQueue(L, i, j);
}
function layerWarm(L, x, y, w, h){
  const s = L.size;
  for (let j = Math.floor(y / s); j <= Math.floor((y + h - 0.01) / s); j++) for (let i = Math.floor(x / s); i <= Math.floor((x + w - 0.01) / s); i++) layerQueue(L, i, j);
}
function layerWarmNow(L, x, y, w, h){
  const s = L.size;
  for (let j = Math.floor(y / s); j <= Math.floor((y + h - 0.01) / s); j++) for (let i = Math.floor(x / s); i <= Math.floor((x + w - 0.01) / s); i++) layerTile(L, i, j);
}
function layerClear(L){ L.tiles.clear(); L.jobs.clear(); }
function seeThrough(box, baseY, a = 0.42){
  const L = scene().personLift || 40, px0 = player.x - 12, px1 = player.x + 12, py0 = player.y - L - 12, py1 = player.y;
  return player.y < baseY && px1 > box.x && px0 < box.x + box.w && py1 > box.y && py0 < box.y + box.h ? a : 1;
}
