/* The bridge (scene 'ponte', Lesson 12 on): Ponte Molino, the old stone bridge over the river nearest the centre and San
   Lorenzo (on the city map: the upper bridge, row 1). You stand on its deck and look upriver over the north parapet: the
   water below, the town's houses along both banks, a bell tower and the domes on the far bank, the hills, and a second
   bridge further up. Benches against the parapet, lamp posts, a few passers-by. Drawing: render/ponte.js.
   - The sky: ponteSky() → 'day' | 'sunset' | 'night'. By day (the afternoon) it is day. In the evening (daytime() 'night')
     it is sunset while Il tramonto sul ponte (quest 11) can still be played and its lights have not come on (its record's
     lit), then night. PONTE.evening: a free-play visit for that quest in the afternoon (sunset, then night, until you leave).
     The light changes with a fade (render/ponte.js: the backdrop, the lamps coming on one by one).
   - Quests: 8 · Una foto sul ponte (afternoon: Anna and Giulio), 11 · Il tramonto sul ponte (night: Sara and Tommaso).
   - Strollers (any scene): an NPC with stroll:{ path:[[x, y], …], speed, back? } walks its path (back and forth with back),
     waits for the player in its way (2.5 s at most) and is never an obstacle (world/scenes.js blocked()).
   Tests: __dbg().ponte = { sky, shown, fade, lamps (lit), evening }. */
const PONTE = {
  rail:318,                                   // the top of the north parapet: the view above it
  deck:[352, 556],                            // the deck between the parapets (walkable: y 366 … 542)
  benches:[{ x:140, y:356, w:104, h:22 }, { x:742, y:356, w:104, h:22 }],
  lamps:[[60, 362], [460, 362], [920, 362], [262, 566], [700, 566]],   // the lamp posts: [x, base y]
  plaque:{ x:572, y:352 },
  VP:{ x:515, y:128 }, EYE:190, RIVER:285,    // the view's perspective: vanishing point, eye height, half the river's width (render/ponte.js)
  evening:false, fadeMs:0,
};
SCENES.ponte = {
  minY:360, spawn:{ x:70, y:440 },
  guideKeep:[{ x:0, y:PONTE.deck[0], w:W, h:PONTE.deck[1] - PONTE.deck[0] }],   // (the guide never covers the deck, where the people are: ui/hud.js guideDock)
  C:PONTE.lamps.map(([x, y]) => ({ x, y:y - 2, r:9 })),
  R:[ { x:0, y:0, w:W, h:PONTE.deck[0] }, { x:0, y:PONTE.deck[1] + 4, w:W, h:H - PONTE.deck[1] - 4 }, ...PONTE.benches ],
  doors:[
    { id:'targa', x:PONTE.plaque.x, y:PONTE.plaque.y + 22, label:'Leggi', hit:{ x:PONTE.plaque.x - 24, y:PONTE.plaque.y - 22, w:48, h:30 },
      msg:'<b>Ponte Molino.</b> A Roman bridge, two thousand years old: its five stone arches still carry the street over the river.' },
  ],
};
/* the sky now */
function ponteSky(){
  const q = questById('tramonto'), r = questPeek('tramonto'), st = q ? questState(q) : 'locked';
  if (PONTE.evening) return r && r.lit ? 'night' : 'sunset';
  if (daytime() !== 'night') return 'day';
  return (st === 'open' || st === 'active') && !(r && r.lit) ? 'sunset' : 'night';
}
/* a free-play visit at sunset ends when you leave the bridge */
setInterval(() => { if (PONTE.evening && S.scene !== 'ponte' && !traveling) PONTE.evening = false; }, 300);

/* ---------- strollers (the bridge's and the park's passers-by) ---------- */
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
function ponteDbg(){
  const v = typeof PONTE_VIEW !== 'undefined' ? PONTE_VIEW : {};
  return { sky:ponteSky(), shown:v.to || null, fade:v.from ? Math.round(v.k * 100) / 100 : null, lamps:typeof ponteLampsLit === 'function' ? ponteLampsLit() : 0, evening:PONTE.evening };
}
/* tests: __debug.ponte({ evening:true }) (a sunset visit) */
Object.assign(window.__debug, { ponte(o){ Object.assign(PONTE, o || {}); return ponteDbg(); } });
