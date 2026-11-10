/* The night train, Il Laguna Express (scene 'treno', Lesson 13 on; Lesson 14 reuses it). Drawing: render/treno.js.
   Three cars in a row, west to east (the train runs east: the scenery in the windows slides west), bigger than the canvas
   (TRENO.w × TRENO.h = 2480 × 600), so the camera follows the player (cam, world/scenes.js). Top-down, north up; the north
   wall of every car shows its face (the oblique view of the museum's rooms) with the windows in it:

     | vestibule · corridor along the windows ……………………… |  | windows · tables ………… counter, hatch |  | vestibule · cab |
     | (boarding)  [11][12][13][14][15][16][17][18] doors  |==| tables · (aisle) · tables   kitchen |==|  luggage   [cab]|
          1 · the sleeper car (vagone letto)                    2 · the dining car (vagone ristorante)      3 · the front car

   - The sleeper car (x 0–1060): the vestibule at its west end (the outside door, where you board: door 'tr-porta'), then a
     narrow corridor along the windows (y 176–258: two people can't pass without a "Permesso!") with eight compartment
     doors in its south wall, 11 to 18 (TRENO.comps; door ids 'comp:<n>'). The compartments themselves are closed (their
     roofs are drawn): each has an interior scene of its own, 'cabina<n>' (below).
   - The dining car (x 1100–2000): four tables along the windows and four along the south wall, white cloths and lamps
     (TRENO.tables: their seats, west and east of each table), the counter with its stools, the kitchen behind it and the
     kitchen hatch (TRENO.hatch: where a dog begs).
   - The front car (x 2040–2480): a short vestibule (luggage, mail sacks) and the driver's cab door at its east end (door 'cab').
   - Between the cars: gangways with sliding glass doors that open by themselves for anyone near (TRENO.slide).

   KNOCKING (the hook Lessons 13 and 14 use). E (or a tap) on a compartment door or the cab door calls trenoKnock(id), id =
   the compartment number (11–18) or 'cab'. The lessons' knock(id) hook decides what happens (return true when handled): an
   answer from inside, a sound behind the door, the door opening in a cutscene, going in. Helpers for it:
     trenoKnockFx(id)          "Toc toc!" over the player and the knock's sound (no hook asked)
     trenoDoorSay(id, it, o)   a voice from behind the door: a bubble on the door, spoken (o.ms, o.silent, o.pitch, o.en: a toast)
     trenoDoorOpen(id, open)   the door slides open (or shut): a promise, done when it has
     trenoEnter(n, o)          into compartment n's interior (travel; o.title, o.sub, o.spawn); trenoLeave() back to its door
     trenoDoorSpot(id)         where to stand in front of a door (the corridor side)
   THE CAMERA: trenoLook(x) eases the view towards x (a beat at the counter), never losing the player; trenoLook(null) back.
   Without a hook: your own compartment (TRENO.mine, a lesson sets it) opens and you go in; any other: "Toc toc!", no answer.

   THE COMPARTMENTS: scenes 'cabina11' … 'cabina18' (trenoCabinScene(n)), one small bunk room each (960 × 600, the room in
   the middle): the window in its north wall (the same scenery), the bunk along the west wall (door 'cabina-letto': E on it,
   label "Dormi" in your own compartment: a lesson's door hook decides; default a toast), a seat and a little table, the door
   out ('cabina-esci', back to the corridor at its door). Put people in one with a sceneOf hook (scene 'cabina14') and a place
   hook; TRENO.look[n] = { color, bags, kids } varies the furnishings.

   THE WINDOWS: trenoSky() → 'night' | 'dawn' | 'day' | 'lagoon': TRENO.sky (tests), else a lesson's trenoSky() hook, else by
   daytime() (night → 'night', morning → 'dawn', afternoon → 'day'). trenoMoving(): the scenery scrolls (a lesson's
   trenoMoving() hook can return false: stopped in a station). The train rocks gently (none with reduced motion) and, with the
   voice on, clacks softly over the rail joints.

   DOGS: an NPC with animal:'dog' is drawn as a dog (render/treno.js: drawDog; size, coat, ears, patch). n.sit = true sits;
   n.follows = 'player' | an NPC id makes it trot after them (and sit when they stop): dogFollow(id, who | null). A dog is
   'ambient' (E: a "Bau!" bubble, no conversation unless a lesson's visitorTalk hook takes it). Biscuit and Brigante:
   content/npcs.js.

   Tests: __dbg().treno = { scene, car, sky, moving, near, mine, open:[ids], knocks:[ids], dogs:{ id:{ at, sit, follows } },
   slide:[open amounts], cam }; __debug.treno({ sky, mine, moving }) sets TRENO fields; __debug.knock(id); __debug.dog(id, { x, y, sit,
   scene, follows }); window.__treno = the helpers above (for a test's own knock hook). */

const TRENO = {
  w:2480, h:600,
  face:{ top:30, bottom:176 },                          // the north wall's face (windows in it); the roof edge above it
  floorBottom:520,                                     // the cars' south wall (seen from above) below it, then the track
  cars:[ { id:'letto', name:'Vagone letto', x0:0, x1:1060 }, { id:'ristorante', name:'Vagone ristorante', x0:1100, x1:2000 },
         { id:'testa', name:'Locomotiva', x0:2040, x1:2480 } ],
  corr:{ y0:176, y1:258 },                             // the sleeper's corridor floor
  vest:{ x0:20, x1:140, y1:340 },                      // the sleeper's vestibule (where you board)
  comps:[11, 12, 13, 14, 15, 16, 17, 18].map((n, i) => ({ n, x:140 + i * 110, w:110, cx:195 + i * 110 })),
  gang:[ { x0:1060, x1:1100 }, { x0:2000, x1:2040 } ],
  gangY:[186, 250],                                    // the gangways' walkable band
  tables:[],                                           // (filled below)
  counter:{ x:1820, y:340, w:26, h:160 },
  kitchen:{ x:1890, y:274, w:110, h:246 },
  hatch:{ x:1890, y:296, w:10, h:44, spot:{ x:1868, y:318 } },    // the kitchen hatch in the kitchen's west wall; spot: in front of it
  cabX:2400,                                           // the driver's cab: its wall and door at x 2400
  cabDoor:{ x:2400, y:217 },
  mine:null,                                           // the player's compartment (a lesson sets it: Lesson 13 → 17)
  sky:null, moving:true,
  open:{},                                             // doors standing open: { 14:1, cab:0.4 } (0 shut … 1 open)
  openTo:{},
  look:{ 11:{ color:'#7a2232', bags:2 }, 12:{ color:'#2f5a3a', bags:1 }, 13:{ color:'#7a2232', bags:0 }, 14:{ color:'#2f5a3a', bags:2 },
         15:{ color:'#7a2232', bags:1, kids:true }, 16:{ color:'#2f5a3a', bags:1 }, 17:{ color:'#7a2232', bags:1 }, 18:{ color:'#2f5a3a', bags:0 } },
  knocks:[], says:[], slide:[0, 0, 0, 0],
};
/* the dining tables: four along the windows (north), four along the south wall; seats west and east of each */
[1230, 1390, 1550, 1710].forEach((cx, i) => {
  TRENO.tables.push({ id:'N' + (i + 1), cx, x:cx - 36, y:186, w:72, h:42, seats:{ w:{ x:cx - 54, y:212, face:{ x:1, y:0 } }, e:{ x:cx + 54, y:212, face:{ x:-1, y:0 } } } });
  TRENO.tables.push({ id:'S' + (i + 1), cx, x:cx - 36, y:476, w:72, h:42, seats:{ w:{ x:cx - 54, y:494, face:{ x:1, y:0 } }, e:{ x:cx + 54, y:494, face:{ x:-1, y:0 } } } });
});
const trenoTable = id => TRENO.tables.find(t => t.id === id);
const trenoSeat = (id, side) => { const t = trenoTable(id); return t ? { ...t.seats[side], face:{ ...t.seats[side].face } } : null; };
const trenoComp = n => TRENO.comps.find(c => c.n === +n) || null;
const trenoCabinScene = n => 'cabina' + n;
const trenoCabinOf = sc => { const m = /^cabina(\d+)$/.exec(sc || S.scene); return m ? +m[1] : null; };
const trenoScene = (sc = S.scene) => sc === 'treno' || !!trenoCabinOf(sc);
/* where to stand in front of a door, in the corridor (a compartment) or the front car (the cab) */
function trenoDoorSpot(id){
  if (id === 'cab') return { x:TRENO.cabDoor.x - 30, y:TRENO.cabDoor.y };
  const c = trenoComp(id); return c ? { x:c.cx, y:236 } : null;
}
/* which car the player (or a point) is in */
function trenoCar(x = player.x){ return (TRENO.cars.find(c => x >= c.x0 - 20 && x <= c.x1 + 20) || {}).id || 'gangway'; }

/* the camera: it follows the player, or looks a little towards something happening (trenoLook(x): a beat at the counter; null:
   back to the player), keeping the player in view */
TRENO.camX = null; TRENO.lookX = null;
function trenoLook(x){ TRENO.lookX = x === undefined ? null : x; }
SCENES.treno = {
  w:TRENO.w, h:TRENO.h, minY:188, spawn:{ x:80, y:300 },
  focusX:() => TRENO.camX === null ? player.x : TRENO.camX,
  C:[],
  R:[
    /* the sleeper: the west end wall, the vestibule's south wall, the compartments (and the corridor's south wall) */
    { x:0, y:0, w:20, h:600 }, { x:0, y:TRENO.vest.y1, w:140, h:260 }, { x:140, y:258, w:920, h:342 },
    /* the gangways (only their middle band is open) */
    ...TRENO.gang.flatMap(g => [{ x:g.x0, y:0, w:g.x1 - g.x0, h:TRENO.gangY[0] - 14 }, { x:g.x0, y:TRENO.gangY[1] + 8, w:g.x1 - g.x0, h:600 }]),
    /* the dining car: its south wall, the tables, the counter, the kitchen */
    { x:1100, y:TRENO.floorBottom, w:900, h:80 }, ...TRENO.tables.map(t => ({ x:t.x, y:t.y, w:t.w, h:t.h })),
    { ...TRENO.counter }, { ...TRENO.kitchen },
    /* the front car: its south wall, the luggage, the cab */
    { x:2040, y:TRENO.floorBottom, w:440, h:80 }, { x:2060, y:430, w:150, h:90 }, { x:2250, y:470, w:110, h:50 }, { x:TRENO.cabX, y:0, w:80, h:600 },
  ],
  doors:[
    { id:'tr-porta', x:80, y:330, label:'Porta', hit:{ x:44, y:316, w:72, h:30 }, msg:'' },
    ...TRENO.comps.map(c => ({ id:'comp:' + c.n, comp:c.n, x:c.cx, y:250, get label(){ return c.n === TRENO.mine ? 'Entra' : 'Bussa'; },
      hit:{ x:c.cx - 24, y:226, w:48, h:46 }, pill:{ x:c.cx, y:296 }, msg:'' })),
    { id:'cab', x:TRENO.cabDoor.x - 14, y:TRENO.cabDoor.y, label:'Bussa', hit:{ x:TRENO.cabDoor.x - 20, y:TRENO.cabDoor.y - 30, w:24, h:60 }, msg:'' },
  ],
};
/* the compartments' interiors: one small bunk room each (the room x 300–660, its north face y 40–190, the floor to y 540) */
const CABINA = { x0:300, x1:660, face:{ top:40, bottom:190 }, y1:540, bunk:{ x:304, y:214, w:112, h:236 }, seat:{ x:602, y:300, w:54, h:150 },
  table:{ x:540, y:196, w:84, h:34 }, basin:{ x:604, y:470, w:52, h:66 }, door:{ x:480, y:536 }, spawn:{ x:520, y:420 } };
TRENO.comps.forEach(c => {
  SCENES[trenoCabinScene(c.n)] = {
    minY:206, spawn:{ ...CABINA.spawn }, cabin:c.n,
    C:[],
    R:[ { x:0, y:0, w:CABINA.x0, h:600 }, { x:CABINA.x1, y:0, w:300, h:600 }, { x:0, y:CABINA.y1, w:960, h:60 },
        { ...CABINA.bunk }, { ...CABINA.seat }, { ...CABINA.table }, { ...CABINA.basin } ],
    doors:[
      { id:'cabina-esci', x:CABINA.door.x, y:CABINA.door.y - 16, label:'Esci', hit:{ x:440, y:510, w:80, h:34 }, pill:{ x:CABINA.door.x, y:CABINA.door.y + 30 }, msg:'' },
      { id:'cabina-letto', x:CABINA.bunk.x + CABINA.bunk.w / 2, y:CABINA.bunk.y + CABINA.bunk.h / 2, area:CABINA.bunk, get label(){ return c.n === TRENO.mine ? 'Dormi' : 'Guarda'; },
        get lookAt(){ return 'the bunk'; }, hit:{ ...CABINA.bunk }, pill:{ x:CABINA.bunk.x + CABINA.bunk.w / 2, y:CABINA.bunk.y + 66 }, msg:'' },
    ],
  };
  INTERIOR[trenoCabinScene(c.n)] = true;
});
INTERIOR.treno = true;

/* ---------- the sky in the windows ---------- */
function trenoSky(){
  if (TRENO.sky) return TRENO.sky;                      // (set by tests: __debug.treno({ sky }))
  const h = askHooks('trenoSky'); if (h) return h;
  const d = daytime(); return d === 'night' ? 'night' : d === 'morning' ? 'dawn' : 'day';
}
function trenoMoving(){ for (const h of hooks()){ if (typeof h.trenoMoving !== 'function') continue; const r = h.trenoMoving(); if (r === true || r === false) return r; } return TRENO.moving; }

/* ---------- the doors ---------- */
/* E or a tap on a door in the train (world/doors.js enterDoor → askHooks('door') first, then here) */
function trenoDoor(d){
  if (!trenoScene()) return false;
  if (d.comp){ trenoKnock(d.comp); return true; }
  if (d.id === 'cab'){ trenoKnock('cab'); return true; }
  if (d.id === 'tr-porta'){ toast(trenoMoving() ? 'The outside door. Not while the train is moving!' : 'The outside door.'); return true; }
  if (d.id === 'cabina-esci'){ trenoLeave(); return true; }
  if (d.id === 'cabina-letto'){ toast(trenoCabinOf() === TRENO.mine ? '<b>La cuccetta</b>, your bunk: crisp white sheets and a red blanket. Not sleepy yet.' : '<b>La cuccetta</b>, a bunk, neatly made.'); return true; }
  return false;
}
function trenoKnock(id){
  TRENO.knocks.push(id); if (TRENO.knocks.length > 20) TRENO.knocks.shift();
  if (askHooks('knock', id)) return;
  if (id === TRENO.mine){ trenoDoorOpen(id, true).then(() => trenoEnter(id)); return; }
  trenoKnockFx(id);
  setTimeout(() => { if (S.scene === 'treno') toast(id === 'cab' ? 'The driver\'s cab. Nobody answers: the driver is busy driving.' : `Compartment ${id}. Nobody answers.`); }, 1300);
}
function trenoKnockFx(id){
  worldSay('player', 'Toc toc!', { ms:1100, silent:true });
  trenoSound('knock');
}
/* a voice behind a door: a bubble on the door (drawn by render/treno.js), spoken */
function trenoDoorSay(id, it, o = {}){
  const p = trenoDoorSpot(id); if (!p) return;
  for (let i = TRENO.says.length - 1; i >= 0; i--) if (TRENO.says[i].id === id) TRENO.says.splice(i, 1);
  TRENO.says.push({ id, text:it, x:id === 'cab' ? TRENO.cabDoor.x - 40 : p.x, y:id === 'cab' ? TRENO.cabDoor.y + 70 : 356, t0:performance.now(), ms:o.ms || 2200 });
  SAID.push(['door:' + id, it]); if (SAID.length > 12) SAID.shift();
  if (!o.silent) speak(it, o.pitch || 1, true);
  if (o.en) toast(`<i>“${esc(it)}”</i> · ${esc(o.en)}`);
}
/* a door slides open (open = true) or shut: resolves when it has (at once with reduced motion) */
function trenoDoorOpen(id, open = true){
  TRENO.openTo[id] = open ? 1 : 0;
  if (RM || !trenoScene()){ TRENO.open[id] = TRENO.openTo[id]; return Promise.resolve(); }
  if (TRENO.open[id] === undefined) TRENO.open[id] = open ? 0 : 1;
  trenoSound('slide');
  return new Promise(res => { const t0 = performance.now(); const chk = () => { if (Math.abs((TRENO.open[id] || 0) - TRENO.openTo[id]) < 0.02 || performance.now() - t0 > 2000){ TRENO.open[id] = TRENO.openTo[id]; res(); } else setTimeout(chk, 40); }; chk(); });
}
const trenoDoorIsOpen = id => (TRENO.open[id] || 0) > 0.5;
/* into compartment n (its interior scene), and back out to its door */
function trenoEnter(n, o = {}){
  travelTo(trenoCabinScene(n), o.spawn || CABINA.spawn, o.title || `Cabina ${n}`, o.sub || (n === TRENO.mine ? 'La tua cabina' : 'Vagone letto'));
  setTimeout(() => { TRENO.open[n] = TRENO.openTo[n] = 0; }, RM ? 400 : 1600);
}
function trenoLeave(){
  const n = trenoCabinOf(); if (!n) return;
  const p = trenoDoorSpot(n);
  travelTo('treno', { x:p.x, y:p.y }, 'Vagone letto', `Cabina ${n}`);
}

/* ---------- people walking on the train (for lessons: no cutscene, the player keeps control) ----------
   trenoWalk(n, path, speed) → a promise; n walks the points (no collisions: it is scripted), n.cutWalk meanwhile. A
   conversation with n open pauses the walk. */
function trenoWalk(n, path, speed = 90){
  if (typeof n === 'string') n = NPC[n];
  if (!n) return Promise.resolve();
  const pts = path.map(p => Array.isArray(p) ? { x:p[0], y:p[1] } : { x:p.x, y:p.y });
  n.cutWalk = true; n.seated = false; n.sit = false;
  return new Promise(res => {
    let last = performance.now();
    const end = () => { n.moving = false; n.cutWalk = false; res(); };
    const tick = now => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = Math.max(last, now);
      if (!pts.length){ end(); return; }
      if (RM || !trenoScene() || !activeNpcs().includes(n)){ const p = pts[pts.length - 1]; n.x = p.x; n.y = p.y; end(); return; }
      if (dialogOpen && convo && convo.npc === n){ n.moving = false; requestAnimationFrame(tick); return; }
      const t = pts[0], dx = t.x - n.x, dy = t.y - n.y, d = Math.hypot(dx, dy), sp = speed * dt;
      n.moving = true; n.walk = (n.walk || 0) + dt * (n.animal ? 16 : 10);
      if (d <= sp){ n.x = t.x; n.y = t.y; pts.shift(); }
      else { n.x += dx / d * sp; n.y += dy / d * sp; n.face = { x:dx / d, y:dy / d }; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ---------- dogs ---------- */
function dogFollow(id, who){ const n = typeof id === 'string' ? NPC[id] : id; if (!n) return; n.follows = who || null; if (who) n.sit = false; }
/* every frame (world/update.js): the sliding doors, dogs that follow someone, the sound */
function trenoUpdate(dt){
  dogsUpdate(dt);                                 // (in any scene: Biscuit follows Margaret round Venice, Lesson 15)
  if (!trenoScene()) { trenoSound('stop'); return; }
  /* the doors: the gangways' doors open for anyone near; compartment doors move to where a lesson wants them */
  const ppl = [player, ...activeNpcs()];
  [1060, 1100, 2000, 2040].forEach((x, i) => {
    const near = S.scene === 'treno' && ppl.some(p => Math.abs(p.x - x) < 64 && p.y < 300);
    TRENO.slide[i] = Math.max(0, Math.min(1, TRENO.slide[i] + (near ? 4 : -2.5) * dt));
  });
  for (const id of Object.keys(TRENO.openTo)){ const a = TRENO.open[id] || 0, b = TRENO.openTo[id]; if (a !== b) TRENO.open[id] = a < b ? Math.min(b, a + 2.6 * dt) : Math.max(b, a - 2.6 * dt); }
  /* the camera: below */
  trenoCam(dt);
}
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
function trenoCam(dt){
  /* the camera's point: eases towards what a beat looks at (but never so far that the player leaves the view) */
  if (S.scene === 'treno'){
    const want = TRENO.lookX === null ? player.x : Math.max(player.x - W / 2 + 90, Math.min(player.x + W / 2 - 90, TRENO.lookX));
    if (TRENO.camX === null) TRENO.camX = player.x;
    const k = RM ? 1 : Math.min(1, dt * 3.2);
    TRENO.camX += (want - TRENO.camX) * k;
    if (TRENO.lookX === null && Math.abs(TRENO.camX - player.x) < 1) TRENO.camX = null;
  } else TRENO.camX = null;
  trenoSound(S.sound && trenoMoving() && !RM ? 'run' : 'stop');
}

/* ---------- the sound: a soft clickety-clack over the rail joints, a knock, a sliding door (Web Audio; off with the voice off) ---------- */
let trenoAC = null, trenoClackT = null;
function trenoNoise(c, t, dur, freq, gain){
  const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = b; f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = gain;
  s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
}
function trenoSound(kind){
  if (kind === 'stop'){ if (trenoClackT){ clearInterval(trenoClackT); trenoClackT = null; } return; }
  if (kind === 'run'){
    if (trenoClackT) return;
    trenoClackT = setInterval(() => {
      if (!S.sound || !trenoScene() || document.hidden) return;
      try { trenoAC = trenoAC || new (window.AudioContext || window.webkitAudioContext)(); const c = trenoAC; if (c.state !== 'running') return;
        const t = c.currentTime; trenoNoise(c, t, 0.07, 420, 0.05); trenoNoise(c, t + 0.16, 0.07, 380, 0.04); } catch(e){}
    }, 1700);
    return;
  }
  if (!S.sound) return;
  try { trenoAC = trenoAC || new (window.AudioContext || window.webkitAudioContext)(); const c = trenoAC, t = c.currentTime;
    if (kind === 'knock'){ trenoNoise(c, t, 0.06, 900, 0.35); trenoNoise(c, t + 0.22, 0.06, 900, 0.35); }
    if (kind === 'slide') trenoNoise(c, t, 0.45, 1800, 0.06);
  } catch(e){}
}

function trenoDbg(){
  const dogs = {};
  NPCS.filter(n => n.animal).forEach(n => { dogs[n.id] = { at:[Math.round(n.x), Math.round(n.y)], scene:sceneOf(n), sit:!!n.sit, follows:n.follows || null, here:activeNpcs().includes(n) }; });
  return { scene:trenoScene() ? S.scene : null, car:S.scene === 'treno' ? trenoCar() : null, cabin:trenoCabinOf(), sky:trenoSky(), moving:trenoMoving(), mine:TRENO.mine,
    near:trenoScene() && !frozen() ? (nearestDoor() || {}).id || null : null, open:Object.keys(TRENO.open).filter(k => TRENO.open[k] > 0.5),
    knocks:TRENO.knocks.slice(), says:TRENO.says.map(s => [s.id, s.text]), dogs, slide:TRENO.slide.map(v => Math.round(v * 100) / 100), cam:[cam.x, cam.y] };
}
Object.assign(window.__debug, {
  treno(o){ Object.assign(TRENO, o || {}); return trenoDbg(); },
  knock(id){ trenoKnock(id); },
  dog(id, o){ const n = NPC[id]; if (!n) return; const { follows, ...rest } = o || {}; Object.assign(n, rest); if (follows !== undefined) dogFollow(n, follows); },
});
/* for tests (a hook installed with __debug.hook runs outside the bundle's scope): the train's helpers */
window.__treno = { look:trenoLook, knockFx:trenoKnockFx, doorSay:trenoDoorSay, doorOpen:trenoDoorOpen, enter:trenoEnter, leave:trenoLeave, walk:trenoWalk, dogFollow, spot:trenoDoorSpot };
