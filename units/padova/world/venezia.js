/* Venice (Lesson 15): three scenes. Drawing: render/venezia.js.
   - 'santalucia': Venezia Santa Lucia from above. At the top the end of binario 3, where the night train (the Laguna Express,
     Lessons 13–14) stands at its buffers, with the platform between it and binario 2; below, the station hall: the information
     desk (Informazioni, the clerk 'infopoint' behind it) on the left, the station bar (Bar · Caffetteria, the barista
     'baristaSL' behind its counter) on the right, the departures board in the middle, the glass doors out at the bottom
     (door 'sl-out' → 'ferrovia').
   - 'ferrovia': outside. The station's façade at the top (door 'fer-in' back into the hall), the wide steps, the fondamenta (the
     stone quay) and the Grand Canal at the bottom, with boats going by (a gondola, a water taxi, a barge) and the church of San
     Simeone Piccolo's green dome on the far bank. On the right: the ACTV ticket booth (the seller 'actv' behind its glass) and the
     floating pontoon, the vaporetto stop "Ferrovia B", reached by a gangway through a gate with two ticket readers (doors 'lettore1',
     'lettore2'; the gate stays shut until the tickets are validated: VEN.gate). A bench by the water (where il signor Bepi stops).
     The travellers with suitcases and the tour group are a Lesson 10 crowd (Permesso!). The vaporetto (VEN.boat: 'away' |
     'arriving' | 'docked') pulls in at the pontoon.
   - 'vaporetto': not a place to walk. The eye-level views of Lesson 15's two cutscenes (boarding at Ferrovia; down the Grand
     Canal to San Marco) are painted in it, full screen (SCENE_ART.vaporetto: the player is parked off screen). VEN.view =
     { kind:'board' | 'canal' | 'bacino', from, to, t0, ms }: venViewGo(kind, ms, from, to) eases the view along (a promise).
   Tests: __dbg().venezia = { scene, boat, gate, view, readers, near }. */
const VEN = { boat:'away', boatX:0, gate:false, view:{ kind:'board', from:0, to:0, t0:0, ms:1 }, beep:[0, 0], horn:0 };
/* the hall */
const VSL = {
  track:{ x:560, w:64 },                                  // binario 3: the night train's track (y 0 → the buffers)
  track2:{ x:236, w:60 },                                 // binario 2: an empty track
  platform:{ x:296, w:264 },                              // between them: the platform (walkable), y 0 → 196
  hallTop:196,                                            // the hall starts at the barrier line
  desk:{ x:52, y:300, w:184, h:34 },                      // Informazioni: the clerk behind it (y < 300); shallow enough that the player at
                                                          // its front (y 348) is within NEAR of him (144, 298), like Enzo at the piazza's bar
  bar:{ x:690, y:262, w:226, h:30 },                      // the bar's counter: the barista behind it (800, 256; the front at y 292)
  board:{ x:400, y:226, w:160, h:20 },                    // the departures board, hanging: drawn only (not in the way)
  tables:[[748, 420], [856, 420], [802, 496]],
  benches:[{ x:120, y:460, w:90, h:16 }, { x:120, y:530, w:90, h:16 }],   // the hall's benches (on the left)
  pillars:[[178, 60], [178, 150], [428, 50], [428, 130], [874, 60], [874, 150]],   // the platforms' canopy pillars
  platBench:{ x:330, y:70, w:22, h:54 },                  // the bench on our platform
  doorsX:[360, 600],                                      // the glass doors at the bottom (y 588)
};
SCENES.santalucia = {
  minY:16, spawn:{ x:520, y:96 },
  C:[ ...VSL.tables.map(([x, y]) => ({ x, y, r:20 })), { x:470, y:430, r:22 }, ...VSL.pillars.map(([x, y]) => ({ x, y, r:5 })) ],
  R:[ { x:0, y:0, w:VSL.platform.x, h:VSL.hallTop }, { x:VSL.platform.x + VSL.platform.w, y:0, w:W - VSL.platform.x - VSL.platform.w, h:VSL.hallTop },
      VSL.desk, { x:VSL.desk.x, y:VSL.desk.y - 70, w:VSL.desk.w, h:70 }, VSL.bar, { x:VSL.bar.x, y:VSL.bar.y - 60, w:VSL.bar.w, h:60 },
      { x:0, y:VSL.hallTop, w:30, h:H - VSL.hallTop }, { x:W - 24, y:VSL.hallTop, w:24, h:H - VSL.hallTop },
      { x:296, y:188, w:30, h:12 }, { x:530, y:188, w:30, h:12 }, ...VSL.benches, VSL.platBench ],
  doors:[
    { id:'sl-out', x:480, y:584, label:'Esci', msg:'' },
    { id:'sl-treno', x:VSL.track.x - 6, y:110, label:'Il treno', hit:{ x:VSL.track.x, y:20, w:VSL.track.w, h:170 },
      msg:'<b>Il Laguna Express.</b> The night train from Padova, at the end of the line. Biscuit has had quite enough of trains.' },
    { id:'sl-tabellone', x:480, y:262, label:'Guarda', hit:{ x:VSL.board.x, y:VSL.board.y - 6, w:VSL.board.w, h:30 },
      msg:'<b>Partenze · Arrivi.</b> Trains to Padova, Verona, Milano, Trieste… You are not going anywhere by train today: the next stop is a boat.' },
  ],
};
/* outside: the steps, the fondamenta, the Grand Canal, the booth, the pontoon */
const VFER = {
  facade:110, steps:{ x:150, w:530, y0:110, y1:226 },     // the steps (walkable) below the façade; a wall beside them on the right
  quay:{ y0:226, y1:392 },                                // the fondamenta; the Grand Canal below it
  booth:{ x:812, y:236, w:136, h:64 },                    // the ACTV booth: the seller behind the glass (front at y 300)
  pontoon:{ x:640, y:432, w:300, h:80 },                  // the floating stop, Ferrovia B
  gangway:{ x:752, w:56, y0:388, y1:436 },                // from the quay to the pontoon, through the gate
  readers:[{ id:'lettore1', x:744, y:398 }, { id:'lettore2', x:816, y:398 }],
  bench:{ x:452, y:362, w:92, h:16 }, seat:{ x:498, y:352 },
  lamps:[[200, 236], [640, 236], [300, 380], [930, 382]],    // the lamp posts along the quay (render/venezia.js draws them here)
  boatY:536,                                              // the vaporetto's centre line, alongside the pontoon (its hull south of it)
};
SCENES.ferrovia = {
  minY:118, spawn:{ x:480, y:150 },
  C:[ { x:96, y:300, r:16 }, ...VFER.lamps.map(([x, y]) => ({ x, y, r:6 })) ],
  R:[ { x:0, y:0, w:W, h:VFER.facade }, { x:0, y:VFER.facade, w:VFER.steps.x, h:VFER.steps.y1 - VFER.facade },
      { x:VFER.steps.x + VFER.steps.w, y:VFER.facade, w:W - VFER.steps.x - VFER.steps.w, h:VFER.steps.y1 - VFER.facade },
      VFER.booth, VFER.bench, { x:0, y:226, w:62, h:170 },
      /* the Grand Canal: water, except the gangway (shut by the gate until the tickets are validated) */
      { x:0, y:VFER.quay.y1, w:VFER.gangway.x, h:H - VFER.quay.y1 }, { x:VFER.gangway.x + VFER.gangway.w, y:VFER.quay.y1, w:W - VFER.gangway.x - VFER.gangway.w, h:H - VFER.quay.y1 } ],
  doors:[
    { id:'fer-in', x:480, y:122, label:'Entra', msg:'' },
    /* the readers on the gate's posts, either side of the gangway; between them (the gangway's middle) the deckhand is in reach */
    ...VFER.readers.map(r => ({ id:r.id, x:r.x, y:r.y - 10, label:'Convalida', reach:30, hit:{ x:r.x - 12, y:r.y - 22, w:24, h:30 }, msg:'' })),
    { id:'fer-panchina', x:VFER.seat.x, y:VFER.seat.y - 6, label:'Siediti', hit:{ x:VFER.bench.x, y:VFER.bench.y - 10, w:VFER.bench.w, h:30 }, msg:'' },
    { id:'fer-cartello', x:880, y:306, label:'Leggi', hit:{ x:VFER.booth.x, y:VFER.booth.y, w:VFER.booth.w, h:VFER.booth.h }, when:() => player.y < 340 && player.x > 790,
      msg:'' },
  ],
};
/* the gate: the gangway's water rect is a wall until the tickets are validated (the scene's R plus the gate) */
{
  const R0 = SCENES.ferrovia.R;
  Object.defineProperty(SCENES.ferrovia, 'R', { configurable:true, get(){ return R0.concat(VEN.gate ? [] : [{ x:VFER.gangway.x, y:VFER.quay.y1 + 6, w:VFER.gangway.w, h:H - VFER.quay.y1 }]); } });
}
/* the painted views: nobody walks here */
SCENES.vaporetto = { minY:0, spawn:{ x:-400, y:-400 }, C:[], R:[], doors:[] };

/* the views: ease the view of `kind` from → to over ms (a promise; at once when the cutscene is skipped) */
function venViewGo(kind, ms, from = 0, to = 1){
  VEN.view = { kind, from, to, t0:performance.now(), ms:RM ? 1 : ms };
  return new Promise(res => {
    const step = () => {
      if ((cutsceneOn() && CUT.skip) || S.scene !== 'vaporetto'){ VEN.view.ms = 1; res(); return; }
      if (performance.now() - VEN.view.t0 >= VEN.view.ms){ res(); return; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
/* where along the view we are (0…1), eased */
function venViewK(){
  const v = VEN.view, k = Math.min(1, (performance.now() - v.t0) / Math.max(1, v.ms)), e = k * k * (3 - 2 * k);
  return v.from + (v.to - v.from) * e;
}
/* the vaporetto at the stop: arrives from the west (a promise), stays ('docked'), leaves */
function venBoatArrive(){
  VEN.boat = 'arriving';
  const t0 = performance.now(), ms = RM ? 1 : 5200;
  return new Promise(res => {
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      VEN.boatX = -1 + (k * (2 - k));                     // −1 (off to the west) → 0 (alongside), slowing down
      if (k >= 1 || (cutsceneOn() && CUT.skip) || S.scene !== 'ferrovia'){ VEN.boatX = 0; VEN.boat = 'docked'; res(); return; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
/* the horn: two low notes (Web Audio; silent with the voice off) */
function venHorn(){
  VEN.horn = performance.now();
  if (!S.sound) return;
  try {
    const A = venHorn.ac || (venHorn.ac = new (window.AudioContext || window.webkitAudioContext)());
    [[0, 1.1], [1.35, 0.9]].forEach(([at, len]) => {
      const t = A.currentTime + at, o = A.createOscillator(), o2 = A.createOscillator(), g = A.createGain();
      o.type = 'sawtooth'; o.frequency.value = 110; o2.type = 'square'; o2.frequency.value = 138.6;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.07, t + 0.08); g.gain.setValueAtTime(0.07, t + len - 0.15); g.gain.linearRampToValueAtTime(0, t + len);
      o.connect(g); o2.connect(g); g.connect(A.destination); o.start(t); o2.start(t); o.stop(t + len + 0.05); o2.stop(t + len + 0.05);
    });
  } catch(e){}
}
/* a reader's beep (a validated ticket: green) */
function venBeep(i){
  VEN.beep[i] = performance.now();
  if (!S.sound) return;
  try {
    const A = venHorn.ac || (venHorn.ac = new (window.AudioContext || window.webkitAudioContext)());
    const t = A.currentTime, o = A.createOscillator(), g = A.createGain();
    o.type = 'sine'; o.frequency.value = 1760; g.gain.setValueAtTime(0.05, t); g.gain.linearRampToValueAtTime(0, t + 0.18);
    o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + 0.2);
  } catch(e){}
}
function veneziaDbg(){
  const v = VEN.view;
  return { scene:['santalucia', 'ferrovia', 'vaporetto'].includes(S.scene) ? S.scene : null, boat:VEN.boat, gate:VEN.gate, beep:VEN.beep.map(b => !!b),
    view:S.scene === 'vaporetto' ? { kind:v.kind, k:Math.round(venViewK() * 100) / 100 } : null,
    near:['santalucia', 'ferrovia'].includes(S.scene) && !frozen() ? (nearestDoor() || {}).id || null : null,
    talk:['santalucia', 'ferrovia'].includes(S.scene) && !frozen() ? (nearestNpc() || {}).id || null : null };
}
/* someone walks a path without freezing the player (like the train's trenoWalk, in any scene): a promise */
function venWalk(n, path, speed = 90){
  if (typeof n === 'string') n = NPC[n];
  if (!n) return Promise.resolve();
  const pts = path.map(p => Array.isArray(p) ? { x:p[0], y:p[1] } : { x:p.x, y:p.y });
  n.cutWalk = true; n.seated = false;
  return new Promise(res => {
    let last = performance.now();
    const end = () => { n.moving = false; n.cutWalk = false; res(); };
    const tick = now => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = Math.max(last, now);
      if (!pts.length){ end(); return; }
      if (RM || !activeNpcs().includes(n) || (cutsceneOn() && CUT.skip)){ const p = pts[pts.length - 1]; n.x = p.x; n.y = p.y; end(); return; }
      const t = pts[0], dx = t.x - n.x, dy = t.y - n.y, d = Math.hypot(dx, dy), sp = speed * dt;
      n.moving = true; n.walk = (n.walk || 0) + dt * 10;
      if (d <= sp){ n.x = t.x; n.y = t.y; pts.shift(); }
      else { n.x += dx / d * sp; n.y += dy / d * sp; n.face = { x:dx / d, y:dy / d }; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
/* tests and screenshots: show a painted view at a point along it (__debug.venView('canal', 0.8)), or the boat in */
Object.assign(window.__debug, {
  venView(kind, k = 0){ S.scene = 'vaporetto'; player.x = -400; player.y = -400; VEN.view = { kind, from:k, to:k, t0:0, ms:1 }; renderHUD(); },
  venBoat(state = 'docked'){ VEN.boat = state; VEN.boatX = 0; },
  /* who stands inside a wall, a desk, a table (the player, the follower, a dog at someone's heels): [[id, x, y]] */
  walkCheck(){
    const out = [], chk = (id, x, y, r) => { if (blocked(x, y, r, true)) out.push([id, Math.round(x), Math.round(y)]); };
    chk('player', player.x, player.y, 12);
    const m = followerNpc(); if (m && activeNpcs().includes(m)) chk(m.id, m.x, m.y, 8);
    activeNpcs().forEach(n => { if (n.animal && n.follows && !n.moving) chk(n.id, n.x, n.y, 5); });
    return out;
  },
});
