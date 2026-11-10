/* The museum interior: scene 'galleria', the Museo d'Arte · I Capolavori from the inside (Lesson 11's shared world; design
   notes: docs/lessons/11-al-museo.md, "Interior"). Background, paintings and statue sprites: render/galleria.js.

   It is bigger than the canvas (GAL.w × GAL.h = 1824 × 1132), so the camera follows the player (cam, world/scenes.js).
   Top-down, north up:

        roofs  |        Sala 5 · Raffaello (the connecting gallery)        |  roofs
     Sala 2 · Il Rinascimento   |   Atrio · Le sculture   |   Sala 3 · Il Barocco
     Sala 1 · Gotico e primo …  |   (5 statues)           |   Sala 4 · Dopo il 1900
                                       [ entrance ]

   The chronological loop: atrium → Sala 1 → Sala 2 → Sala 5 → Sala 3 → Sala 4 → atrium. All four rooms also open onto
   the atrium; the atrium does not open onto Sala 5. Each room's works hang in walking order.
   Every painting hangs on its room's NORTH wall: in the game's oblique view north walls show their face (like the
   museum's front on the square), so every picture is seen face on. Side walls are seen from above (bands).
   Doorways in a north wall are passages through the face; the lintel above them is drawn in the depth-sorted pass, so
   the player walks under it. Plaques name the room a doorway leads to.

   The works come from ART (generated from assets/art/manifest.json by scripts/build.js): the scene shows the thumbnails
   ('art/<thumb>'), the look modal the full image ('art/<file>'). Every work is a look landmark (a door with an area and
   look:true): walk up to it and press E, or tap it → openWork(id). The nearest wins; a person in range wins over it. */

const GAL = {
  w:1824, h:1132, T:16, doorW:80, open:64,      // T: wall thickness; doorways 80 wide; in a north wall the opening is the face's lower 64 px
  /* rooms: the inside (x, y, w, h, from the wall top's lower edge), the north wall's face height, colours; door: a doorway in
     the north wall (x = its left edge) to room `to`; span: the stretch of that wall the works hang on; rtl: hung right to left
     (walking order: you enter these rooms from the east) */
  rooms:{
    5:{ n:5, x:436, y:16, w:952, h:324, face:176, wall:'#b1a58f', floor:'terrazzo', span:[436, 1388] },
    2:{ n:2, x:16, y:356, w:660, h:372, face:112, wall:'#6f8569', floor:'parquet', wood:'#c39a62', door:{ x:540, to:5 }, span:[24, 534] },
    3:{ n:3, x:1148, y:356, w:660, h:372, face:112, wall:'#7f2a2e', floor:'parquet', wood:'#94653d', door:{ x:1204, to:5 }, span:[1290, 1800] },
    1:{ n:1, x:16, y:744, w:660, h:372, face:112, wall:'#4f6476', floor:'parquet', wood:'#b98a55', door:{ x:36, to:2 }, span:[122, 670], rtl:true },
    4:{ n:4, x:1148, y:744, w:660, h:372, face:112, wall:'#f4f2ed', floor:'resin', door:{ x:1708, to:3 }, span:[1154, 1702], rtl:true },
    0:{ n:0, x:692, y:356, w:440, h:760, face:112, wall:'#e7dece', floor:'marble' },
  },
  /* doorways between the atrium and the side rooms (in the walls at x 676 and 1132): y .. y + 80 */
  side:[{ y:642, left:2, right:3 }, { y:900, left:1, right:4 }],
  exit:{ x:912, y:1116 },
  spawn:{ x:912, y:1062 },
  /* the statues: plinth centre x, front ground line y; rope: velvet ropes round it */
  /* every statue is roped off (Lesson 11): the rope's square is walkable, but stepping inside it gets the custodian's
     "Troppo vicino!" (galTooClose); only the plinth blocks */
  statues:[
    { id:'bernini-apollo', x:768, y:590, rope:true },        // NW corner
    { id:'canova-psiche', x:1056, y:590, rope:true },        // NE
    { id:'michelangelo-pieta', x:912, y:836, rope:true },    // the middle (the custodian sits by the west wall)
    { id:'cellini-perseo', x:762, y:1042, rope:true },       // SW, beside Sala 1
    { id:'boccioni-forme', x:1062, y:1042, rope:true },      // SE, beside Sala 4 (after 1900)
  ],
  benches:[ { x:270, y:1010, w:152, h:26 }, { x:270, y:618, w:152, h:26 }, { x:1402, y:618, w:152, h:26 }, { x:1402, y:1010, w:152, h:26 }, { x:832, y:276, w:160, h:24 } ],
  chair:{ x:714, y:800 },                                   // the custodian's chair, against the atrium's west wall
  rail:{ x:786, y:196, w:252, h:22 },                       // the rope in front of the Raffaello fresco
};
const galRoom = n => GAL.rooms[n];
const galFaceBottom = R => R.y + R.face;
const ART_BY_ID = Object.fromEntries(ART.works.map(w => [w.id, w]));

/* ---------- the works: sizes and places ----------
   Real sizes are squeezed (display height ∝ height^0.4, one scale K for every room, as big as the fullest wall allows), so
   a small Leonardo is still small but readable. The Raffaello is a fresco: it fills its wall (Sala 5's taller face). */
const galYear = w => +String(w.date).match(/\d{3,4}/)[0];
const galCm = w => { const m = String(w.size_cm).match(/[\d.]+/g).map(Number); return { h:m[0], w:m[1] || m[0] }; };
const GAL_WORKS = (() => {
  const out = [], GAP = 16;
  const rel = w => { const c = galCm(w), hk = Math.pow(c.h, 0.4); return { hk, wk:hk * c.w / c.h }; };
  let K = 8.6;
  [1, 2, 3, 4].forEach(n => {
    const R = galRoom(n), ws = ART.works.filter(w => w.room === n), sum = ws.reduce((a, w) => a + rel(w).wk, 0);
    K = Math.min(K, (R.span[1] - R.span[0] - (ws.length + 1) * GAP) / sum);
  });
  for (const n of [1, 2, 3, 4, 5]){
    const R = galRoom(n), fb = galFaceBottom(R);
    let ws = ART.works.filter(w => w.room === n);
    if (R.rtl) ws = ws.slice().reverse();
    const dims = ws.map(w => {
      if (n === 5 && w.material === 'affresco'){ const dh = R.face - 26; return { dh, dw:dh * w.w / w.h }; }       // the fresco: as big as the wall
      const q = rel(w); return { dh:K * q.hk, dw:K * q.wk };
    });
    const put = (w, i, x) => { const { dw, dh } = dims[i], fresco = n === 5 && w.material === 'affresco', top = R.y + (R.face - dh) * (fresco ? 0.42 : 0.46);
      out.push({ id:w.id, w, room:n, kind:'painting', x:Math.round(x), y:Math.round(top), dw:Math.round(dw), dh:Math.round(dh), cx:Math.round(x + dw / 2), fb, fresco }); };
    if (n === 5){
      /* Sala 5: the fresco is the centrepiece, as big as the wall, in the middle (behind its rope); the other Raphaels hang
         in date order on either side of it, two by two, spread over each half of the wall (the room's plaque at the west
         end, the painter's name at the east end) */
      const fi = ws.findIndex(w => w.material === 'affresco'), fd = dims[fi], fx = R.x + (R.w - fd.dw) / 2;
      const rest = ws.map((w, i) => i).filter(i => i !== fi).sort((a, b) => galYear(ws[a]) - galYear(ws[b]) || a - b);
      const half = Math.ceil(rest.length / 2), sides = [[rest.slice(0, half), R.x + 196, fx - 36], [rest.slice(half), fx + fd.dw + 36, R.x + R.w - 70]];
      const placed = [];
      sides.forEach(([idx, a, b]) => { const tot = idx.reduce((s, i) => s + dims[i].dw, 0), g = (b - a - tot) / (idx.length + 1); let x = a + g; idx.forEach(i => { placed.push([i, x]); x += dims[i].dw + g; }); });
      placed.push([fi, fx]);
      placed.sort((a, b) => a[1] - b[1]).forEach(([i, x]) => put(ws[i], i, x));
      continue;
    }
    const total = dims.reduce((a, d) => a + d.dw, 0), gap = (R.span[1] - R.span[0] - total) / (ws.length + 1);
    let x = R.span[0] + gap;
    ws.forEach((w, i) => { put(w, i, x); x += dims[i].dw + gap; });
  }
  /* zones in front of each painting (a strip of floor under it), as wide as the picture but at least 56, never past the
     midpoint to the next one */
  out.forEach((p, i) => {
    const prev = out[i - 1] && out[i - 1].room === p.room ? out[i - 1] : null, next = out[i + 1] && out[i + 1].room === p.room ? out[i + 1] : null;
    if (p.fresco){ p.zone = { x:GAL.rail.x, y:p.fb, w:GAL.rail.w, h:36 }; return; }      // the fresco: along its rope
    let x0 = Math.min(p.x, p.cx - 28), x1 = Math.max(p.x + p.dw, p.cx + 28);
    if (prev) x0 = Math.max(Math.min(p.x, p.cx - 28), (prev.x + prev.dw + p.x) / 2);
    if (next) x1 = Math.min(Math.max(p.x + p.dw, p.cx + 28), (p.x + p.dw + next.x) / 2);
    p.zone = { x:Math.round(x0), y:p.fb, w:Math.round(x1 - x0), h:36 };
  });
  /* statues: display height ∝ √(real height); the plinth is a little wider than the statue */
  for (const s of GAL.statues){
    const w = ART_BY_ID[s.id], c = galCm(w), sh = Math.round(6.4 * Math.sqrt(c.h)), sw = Math.round(sh * w.w / w.h);
    const pw = Math.max(58, sw + 14), ph = 30, pd = 18;
    const plinth = { x:s.x - pw / 2, y:s.y - 34, w:pw, h:34 };                    // walk-blocking footprint (the front part)
    /* the rope: far enough round the plinth that a step over it is a step inside (the player is 14 px round) */
    const block = s.rope ? { x:plinth.x - 28, y:plinth.y - 26, w:pw + 56, h:plinth.h + 26 + 34 } : plinth;
    const top = s.y - ph - pd / 2 + 3;                                             // where the statue's feet stand
    out.push({ id:w.id, w, room:0, kind:'statue', x:s.x, y:s.y, sw, sh, pw, ph, pd, top, rope:!!s.rope, plinth, block,
      sprite:{ x:s.x - Math.max(sw, pw) / 2 - 4, y:top - sh - 6, w:Math.max(sw, pw) + 8, h:s.y - (top - sh - 6) } });
  }
  return out;
})();
const GAL_WORK = Object.fromEntries(GAL_WORKS.map(p => [p.id, p]));
/* where to stand to look at a work (tests; tap-to-walk uses doorSpot) */
const galSpot = p => p.kind === 'painting' ? { x:p.cx, y:p.fresco ? GAL.rail.y + GAL.rail.h + 22 : p.fb + 34 } : { x:p.x, y:p.block.y + p.block.h + 20 };

/* ---------- the scene: walls, collision, doors ---------- */
const GAL_WALLS = (() => {      // the walls' tops (seen from above), as rects; doorway gaps left out
  const { T, doorW } = GAL, A = galRoom(0), L = [];
  const hband = (x0, x1, y, gaps) => { let x = x0; gaps.slice().sort((a, b) => a - b).forEach(g => { if (g > x) L.push({ x, y, w:g - x, h:T }); x = g + doorW; }); if (x1 > x) L.push({ x, y, w:x1 - x, h:T }); };
  const vband = (x, y0, y1, gaps) => { let y = y0; gaps.forEach(g => { L.push({ x, y, w:T, h:g - y }); y = g + doorW; }); L.push({ x, y, w:T, h:y1 - y }); };
  const R5 = galRoom(5);
  hband(R5.x - T, R5.x + R5.w + T, 0, []);                                            // Sala 5's north wall
  L.push({ x:R5.x - T, y:0, w:T, h:R5.y + R5.h }, { x:R5.x + R5.w, y:0, w:T, h:R5.y + R5.h });
  hband(0, GAL.w, A.y - T, [galRoom(2).door.x, galRoom(3).door.x]);                  // y 340: Sala 5 | Sala 2, atrium, Sala 3
  L.push({ x:0, y:A.y - T, w:T, h:GAL.h - A.y + T }, { x:GAL.w - T, y:A.y - T, w:T, h:GAL.h - A.y + T });   // outer west, east
  vband(A.x - T, A.y, A.y + A.h, GAL.side.map(s => s.y));                             // atrium | west rooms
  vband(A.x + A.w, A.y, A.y + A.h, GAL.side.map(s => s.y));                           // atrium | east rooms
  const mid = galRoom(1).y - T;
  hband(0, A.x - T, mid, [galRoom(1).door.x]);                                         // Sala 2 | Sala 1
  hband(A.x + A.w + T, GAL.w, mid, [galRoom(4).door.x]);                               // Sala 3 | Sala 4
  hband(0, GAL.w, A.y + A.h, []);                                                       // the south wall (the entrance is drawn on it)
  return L;
})();
/* the north walls' faces, as rects (with the doorway openings cut out: they are passages) */
const GAL_FACES = (() => {
  const L = [];
  for (const n of [5, 2, 0, 3, 1, 4]){
    const R = galRoom(n);
    if (R.door){ L.push({ n, x:R.x, y:R.y, w:R.door.x - R.x, h:R.face }, { n, x:R.door.x + GAL.doorW, y:R.y, w:R.x + R.w - R.door.x - GAL.doorW, h:R.face }); }
    else L.push({ n, x:R.x, y:R.y, w:R.w, h:R.face });
  }
  return L;
})();
SCENES.galleria = {
  w:GAL.w, h:GAL.h, minY:0, spawn:GAL.spawn,
  C:[ { x:GAL.chair.x, y:GAL.chair.y, r:13 } ],
  R:[ { x:0, y:0, w:galRoom(5).x - GAL.T, h:galRoom(0).y - GAL.T }, { x:galRoom(5).x + galRoom(5).w + GAL.T, y:0, w:GAL.w, h:galRoom(0).y - GAL.T },   // the roofs
      ...GAL_WALLS, ...GAL_FACES, ...GAL.benches, GAL.rail, ...GAL_WORKS.filter(p => p.kind === 'statue').map(p => p.plinth) ],
  /* avoid: walkable, but tap-to-walk routes go round them (the statues' ropes: world/scenes.js walkGrid, steerMove) */
  avoid:GAL_WORKS.filter(p => p.rope).map(p => p.block),
  doors:[
    { id:'uscita', x:GAL.exit.x, y:GAL.exit.y - 6, label:'Esci', msg:'' },
    ...GAL_WORKS.map(p => ({ id:'opera:' + p.id, work:p.id, look:true, lookAt:`<i>${esc(p.w.title_it)}</i>`, msg:'',
      area:p.kind === 'painting' ? p.zone : p.block,
      hit:p.kind === 'painting' ? { x:p.x - 6, y:p.y - 6, w:p.dw + 12, h:p.dh + 12 } : p.sprite,
      pill:p.kind === 'painting' ? { x:p.cx, y:p.y - 7 } : { x:p.x, y:p.sprite.y + 2 },
      x:p.kind === 'painting' ? p.cx : p.x, y:p.kind === 'painting' ? p.fb + 14 : p.block.y + p.block.h - 22 })),
  ],
};
function enterGalleria(){
  if (S.lesson !== 11) galCrowdReset();          // free play: the visitors are back in front of their paintings (Lesson 11 keeps them where they went)
  travelTo('galleria', GAL.spawn, "Museo d'Arte", 'I Capolavori');
}

/* ---------- the visitors (content/npcs.js, Lesson 11 on) ----------
   Crowd blockers (crowd:true, blocks:<work id>) hide a painting: E on it or a tap opens the Permesso pick (world/museo.js)
   until they have moved. Ambient visitors (ambient:true) wander slowly round the loop (wander.path: [x, y, look?]; look =
   pause there, facing the wall), sit on a bench, and say their line in a bubble when spoken to. A wanderer waits (at
   most 2.5 s) for the player in its way and is no obstacle while it walks, so it can never trap anyone. */
const galBlocker = id => activeNpcs().find(n => n.crowd && n.blocks === id && !crowdAway(n)) || null;
const GAL_CROWD = () => NPCS.filter(n => n.crowd && n.scene === 'galleria').map(n => n.id);
function galCrowdReset(){ if (S.crowd && GAL_CROWD().some(id => S.crowd[id])) crowdReset(GAL_CROWD().filter(id => S.crowd[id])); }
/* in a doorway (side doors of the atrium, the passages through north walls): a wanderer never stops there */
function galInDoorway(x, y){
  const A = galRoom(0);
  if (GAL.side.some(s => y > s.y - 10 && y < s.y + GAL.doorW + 10 && (Math.abs(x - A.x + GAL.T / 2) < 40 || Math.abs(x - A.x - A.w - GAL.T / 2) < 40))) return true;
  return [2, 3, 1, 4].some(n => { const R = galRoom(n), d = R.door; return x > d.x - 10 && x < d.x + GAL.doorW + 10 && y > R.y - GAL.T - 30 && y < galFaceBottom(R) + 30; });
}
function galWander(n, dt){
  const w = n.wander, P = w.path;
  if (!n.wv){ n.wv = { i:w.start || 0, pause:0, wait:0 }; }
  const st = n.wv;
  if (st.pause > 0){ st.pause -= dt; n.moving = false; return; }
  const nx = P[(st.i + 1) % P.length], dx = nx[0] - n.x, dy = nx[1] - n.y, d = Math.hypot(dx, dy) || 1, sp = w.speed * dt;
  const ax = n.x + dx / d * 26, ay = n.y + dy / d * 26;
  if (Math.hypot(player.x - ax, player.y - ay) < 34 && !galInDoorway(n.x, n.y) && st.wait < 2.5){
    st.wait += dt; n.moving = false; const pd = Math.hypot(player.x - n.x, player.y - n.y) || 1; n.face = { x:(player.x - n.x) / pd, y:(player.y - n.y) / pd }; return;
  }
  if (Math.hypot(player.x - ax, player.y - ay) >= 40) st.wait = 0;
  n.moving = true; n.walk = (n.walk || 0) + dt * 7;
  if (d <= sp){
    n.x = nx[0]; n.y = nx[1]; st.i = (st.i + 1) % P.length;
    if (nx[2] !== undefined){ st.pause = 3.5 + Math.random() * 4; n.moving = false; n.face = { x:0, y:-1 }; n.baseFace = { x:0, y:-1 }; }
  } else { n.x += dx / d * sp; n.y += dy / d * sp; n.face = { x:dx / d, y:dy / d }; }
}
/* E (or a tap) on an ambient visitor: their line in a bubble, its English in a toast. A lesson's visitorTalk(npc) hook
   returning true opens a real conversation instead (then its talk hook takes over). */
function galAmbientSay(n){
  const l = n.says || { it:'Buongiorno.', en:'Good morning.' };
  crowdAttend(n, 2600); worldSay(n, l.it, { ms:2400 });
  toast(`<i>“${esc(l.it)}”</i> · ${esc(l.en)}`);
}

/* ---------- the ropes and the custodian ----------
   Every statue stands inside a velvet rope (p.block). The rope's square is walkable, but stepping inside it (or pressing E
   or tapping the statue from inside it) makes the custodian call "Troppo vicino!" from his chair (a bubble, spoken), and
   the player is walked back out (a short cutscene walk: world/cutscene.js). A lesson can take over: its onTooClose(id)
   hook returning true means it handled it (nothing else happens). Not during a cutscene. E from outside the rope opens
   the statue as usual. */
const GALR = { cool:0, count:0, last:null };
function galRopeAt(x, y){
  if (S.scene !== 'galleria') return null;
  return GAL_WORKS.find(p => p.rope && x > p.block.x + 4 && x < p.block.x + p.block.w - 4 && y > p.block.y + 4 && y < p.block.y + p.block.h - 4) || null;
}
function galRopeExit(p){
  const b = p.block, m = 22, x = player.x, y = player.y;
  const c = [{ x:b.x - m, y }, { x:b.x + b.w + m, y }, { x, y:b.y - m }, { x, y:b.y + b.h + m }]
    .sort((a, q) => Math.hypot(a.x - x, a.y - y) - Math.hypot(q.x - x, q.y - y));
  return c.find(q => !blocked(q.x, q.y, 14, true) && !inAvoid(q.x, q.y, 6)) || galSpot(p);
}
function galTooClose(p, how){
  const now = performance.now();
  if (now < GALR.cool) return true;
  GALR.cool = now + 1400; GALR.count++; GALR.last = p.id;
  keys.clear(); target = null; route = []; goalPt = null; pendingTalk = null; pendingDoor = null;
  if (askHooks('onTooClose', p.id, how || 'step')) return true;
  const c = NPC.guardia;
  if (c && activeNpcs().includes(c)){ crowdAttend(c, 2600); worldSay(c, 'Troppo vicino!', { ms:2200 }); }
  cutscene([{ walk:'player', to:galRopeExit(p), speed:150 }], { id:'troppo-vicino', quiet:true });
  return true;
}
/* a work's door (E, a tap): a visitor in front → the Permesso pick; inside a statue's rope → too close; the museum's
   Vedo, vedo picks it (ui/museum-ispy.js); else its picture */
function galWorkDoor(d){
  const b = galBlocker(d.work); if (b){ crowdTouch(b); return; }
  const p = GAL_WORK[d.work], r = galRopeAt(player.x, player.y);
  if (p.rope && r && !cutsceneOn()){ galTooClose(r, 'e'); return; }
  if (mispyPick(d.work)) return;
  openWork(d.work);
}
function galleriaUpdate(dt){
  if (S.scene !== 'galleria') return;
  for (const n of activeNpcs()) if (n.wander && !n.cutWalk) galWander(n, dt);
  if (!cutsceneOn()){ const r = galRopeAt(player.x, player.y); if (r) galTooClose(r, 'step'); }
}

/* ---------- looking at a work ---------- */
const galSize = w => /alt/.test(w.size_cm) ? `altezza ${w.size_cm.replace(/\s*\(alt\.\)/, '')} cm` : `${w.size_cm} cm`;
let workShown = null;
function openWork(id){
  if (frozen()) return;
  cutsceneEvent('workOpened', id);
  const p = GAL_WORK[id], w = p.w, room = ART.rooms[String(w.room)], R = galRoom(w.room);
  openModal('artwork ' + p.kind);
  workShown = id;
  const pic = p.kind === 'painting'
    ? `<div class="aw-wall" style="--wall:${R.wall}"><div class="aw-frame${w.room === 4 ? ' modern' : p.fresco ? ' fresco' : ''}"><img class="aw-img" src="art/${esc(w.file)}" alt="${esc(w.title_en)}, ${esc(w.artist)}"></div></div>`
    : `<div class="aw-hall"><img class="aw-img" src="art/${esc(w.file)}" alt="${esc(w.title_en)}, ${esc(w.artist)}"><div class="aw-plinth"></div></div>`;
  sheet.innerHTML = `<button class="x aw-x" data-close aria-label="Close">×</button>
    <figure class="aw-fig">${pic}
      <figcaption class="aw-plaque"><b class="aw-title">${esc(w.title_it)}</b><span class="aw-en">${esc(w.title_en)}</span>
        <span class="aw-artist">${esc(w.artist)}<span class="aw-date">, ${esc(w.date)}</span></span>
        <span class="aw-meta">${esc(w.material)} · ${esc(galSize(w))}</span></figcaption>
    </figure>
    <div class="aw-foot"><span class="aw-room">${esc(room)}</span><button class="btn primary" data-close>Chiudi</button></div>`;
  setTimeout(() => { const b = sheet.querySelector('.aw-foot [data-close]'); if (b) b.focus({ preventScroll:true }); }, 30);
}
const workOpen = () => modalOpen && sheet.classList.contains('artwork');

/* ---------- for tests and the review screenshots ---------- */
/* __dbg().galleria: the camera, the works (with a spot to stand at, their tap rect, screen position of it), what is near,
   what is open */
function galleriaDbg(){
  const inGal = S.scene === 'galleria', nd = inGal && !frozen() ? nearLandmark() : null;
  const img = workOpen() ? sheet.querySelector('.aw-img') : null;
  const ppl = {};
  if (inGal) activeNpcs().filter(n => n.scene === 'galleria' && n.id !== 'guardia').forEach(n => { ppl[n.id] = { at:[Math.round(n.x), Math.round(n.y)], crowd:!!n.crowd, blocks:n.blocks || null,
    moved:n.crowd ? crowdAway(n) : null, ambient:!!n.ambient, walking:!!n.moving, seated:!!n.seated }; });
  return { cam:[cam.x, cam.y], size:[sceneW(), sceneH()], thumbs:galThumbsLoaded(),
    visitors:ppl, custodian:NPC.guardia && activeNpcs().includes(NPC.guardia) ? [Math.round(NPC.guardia.x), Math.round(NPC.guardia.y)] : null,
    rope:{ in:inGal ? (galRopeAt(player.x, player.y) || {}).id || null : null, count:GALR.count, last:GALR.last },
    blocked:inGal ? Object.fromEntries(GAL_WORKS.filter(p => galBlocker(p.id)).map(p => [p.id, galBlocker(p.id).id])) : {}, near:nd && nd.work ? nd.work : null, door:inGal && !frozen() ? (nearestDoor() || {}).id || null : null,
    open:workOpen() ? workShown : null, title:img ? sheet.querySelector('.aw-title').textContent : null, en:img ? sheet.querySelector('.aw-en').textContent : null,
    img:img ? { src:img.getAttribute('src'), w:img.naturalWidth, h:img.naturalHeight } : null,
    works:GAL_WORKS.map(p => ({ id:p.id, room:p.room, kind:p.kind, title:p.w.title_it, spot:galSpot(p),
      rect:p.kind === 'painting' ? { x:p.x, y:p.y, w:p.dw, h:p.dh } : p.sprite, block:p.kind === 'statue' ? { ...p.block } : null, zone:p.zone ? { ...p.zone } : null, plinth:p.plinth ? { ...p.plinth } : null })) };
}
/* every wanderer's loop, sampled every 6 px: walls, plinths, benches and ropes it would cross (tests/galleria.js) */
window.__galWanderCheck = () => { const sc0 = S.scene; S.scene = 'galleria';
  const out = NPCS.filter(n => n.wander).map(n => { const P = n.wander.path, bad = [];
    P.forEach((a, i) => { const b = P[(i + 1) % P.length], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (let k = 0; k <= d; k += 6){ const x = a[0] + (b[0] - a[0]) * k / d, y = a[1] + (b[1] - a[1]) * k / d; if (blocked(x, y, 10, true) || inAvoid(x, y, 2)){ bad.push([i, Math.round(x), Math.round(y)]); break; } } });
    return { id:n.id, bad }; });
  S.scene = sc0; return out; };
/* __debug.overview(true): the canvas shows the whole scene at once (for a full-map screenshot); false puts it back */
let galOvHome = null;
function galleriaOverview(on){
  cam.overview = !!on;
  if (on && !galOvHome){ galOvHome = [cv.parentNode, cv.nextSibling]; document.body.appendChild(cv); }      // out of the stage (it clips and centres)
  if (!on && galOvHome){ galOvHome[0].insertBefore(cv, galOvHome[1]); galOvHome = null; }
  if (on){ cv.width = sceneW() * DPR; cv.height = sceneH() * DPR; Object.assign(cv.style, { position:'fixed', left:'0', top:'0', transform:'none', width:sceneW() + 'px', height:sceneH() + 'px', zIndex:'200' }); }
  else { cv.width = W * DPR; cv.height = H * DPR; Object.assign(cv.style, { position:'', left:'', top:'', transform:'', zIndex:'' }); fit(); }
}
