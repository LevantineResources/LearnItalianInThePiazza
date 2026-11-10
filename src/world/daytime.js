/* Day and night (Lesson 12 on; design docs/features/quests-and-night.md). The lighting pass is render/night.js.
   - daytime() (engine/quests.js) = S.daytime || 'afternoon': 'afternoon' | 'night' ('morning' for scripted scenes). A
     lesson sets it (Lesson 12's dusk cutscene); duskFade(ms) animates the change (gold, then dark).
   - Who is where: an NPC's hours = { afternoon?, night? } (content/npcs.js, the opening-hours block at the end): false = not
     there at that time (npcAround(n), used by activeNpcs()), { x, y, face } = stands there at that time (placeByHours(),
     every renderHUD, before the lessons' place hooks). Missing = there as usual.
   - The bells: ringBells(n, { gap }) tolls a bell n times (Web Audio, a synthesised bell; silent with the voice off) and
     returns a promise; world bubbles say the time if asked. BELLS.total counts every toll (tests: __dbg().night.bells).
   - nightAmount(): 0 (day) … 1 (night), animated during duskFade; interiorScene(): scenes that are lit inside at night. */
const INTERIOR = { aurora:true, galleria:true, salone:true, basilica:true };
const interiorScene = (sc = S.scene) => !!INTERIOR[sc];
const NIGHT = { from:null, to:null, t0:0, ms:0, gold:0 };
function nightAmount(){
  if (NIGHT.to !== null){
    const k = Math.min(1, (performance.now() - NIGHT.t0) / NIGHT.ms);
    if (k >= 1){ NIGHT.gold = 0; if (daytime() !== NIGHT.to) return NIGHT.toV; NIGHT.to = null; }   // (until S.daytime has caught up)
    else { NIGHT.gold = Math.sin(Math.min(1, k * 1.6) * Math.PI); const e = k * k * (3 - 2 * k); return NIGHT.from + (NIGHT.toV - NIGHT.from) * e; }
  }
  return daytime() === 'night' ? 1 : 0;
}
/* the light changes over ms; S.daytime changes when the light has (people and shops follow the new time then: the bar's
   shutter comes down once it is dark) */
function duskFade(ms = 4200, to = 'night'){
  const from = nightAmount(), dur = RM ? 300 : ms;
  Object.assign(NIGHT, { from, to, toV:to === 'night' ? 1 : 0, t0:performance.now(), ms:dur });
  return new Promise(res => setTimeout(() => { S.daytime = to; save(); renderHUD(); res(); }, dur));
}

/* ---------- opening hours ---------- */
function npcAround(n){
  const h = n.hours && n.hours[daytime()];
  return h !== false;
}
function placeByHours(){
  const d = daytime();
  for (const n of NPCS){
    if (!n.hours) continue;
    const spot = n.hours[d];
    if (spot && typeof spot === 'object'){
      if (!n.dayPos) n.dayPos = { x:n.x, y:n.y, face:{ ...n.baseFace } };
      if (!n.cutWalk){ n.x = spot.x; n.y = spot.y; if (spot.face) n.baseFace = { ...spot.face }; }
    } else if (n.dayPos){ n.x = n.dayPos.x; n.y = n.dayPos.y; n.baseFace = { ...n.dayPos.face }; n.dayPos = null; }
  }
}

/* ---------- the bells ---------- */
const BELLS = { total:0, last:0, ringing:false };
let bellCtx = null;
function bellToll(at = 0){
  BELLS.total++; BELLS.last = performance.now();
  if (!S.sound) return;
  try {
    bellCtx = bellCtx || new (window.AudioContext || window.webkitAudioContext)();
    const c = bellCtx, t = c.currentTime + at, out = c.createGain();
    out.gain.value = 0.16; out.connect(c.destination);
    [[196, 1, 3.2], [392, 0.5, 2.4], [470, 0.35, 2], [588, 0.3, 1.6], [784, 0.18, 1.1], [1046, 0.1, 0.8]].forEach(([f, a, d]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + d + 0.1);
    });
  } catch(e){}
}
/* n tolls, gap ms apart; resolves after the last one has rung out a little */
function ringBells(n, o = {}){
  const gap = RM ? 250 : o.gap || 900;
  BELLS.ringing = true;
  for (let i = 0; i < n; i++) setTimeout(() => bellToll(), i * gap);
  return new Promise(res => setTimeout(() => { BELLS.ringing = false; res(); }, (n - 1) * gap + (RM ? 200 : 1200)));
}

function nightDbg(){
  return { daytime:daytime(), amount:Math.round(nightAmount() * 100) / 100, interior:interiorScene(), lights:nightLights(S.scene).lamps.length,
    bells:{ total:BELLS.total, ringing:BELLS.ringing }, barClosed:barClosed(), fading:NIGHT.to !== null };
}
