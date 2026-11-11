/* Fast travel and the map (first built for Padova's city map).
   openMap() (M, the Map button) opens the unit's map (UNIT.openMap()). Fast travel: the places you can go to straight from the map (the designer: "once the player has been given directions to a place, it
   appears on the map as a button that takes the player straight there"). A DEST is a place: { scene, label, sub, ok (the
   lesson's unlock: the route you were told and traced on the map, or the town opened), now? (open at this time of day),
   spawn? (the entrance; default the scene's spawn), face? (facing in; default north),
   learnt? (the backfill for a save already past the lesson that taught the way) }. Once open, a place is remembered in the
   save, S.fast = { scene:true } (lazy, not in FRESH()), so it stays on the list. Its button is in the "Go straight there" list
   beside the map ([data-go], the old "Walk to" buttons), the only way to fast travel: the map itself has no buttons for it (the
   designer: too crowded with the quest spots), it scrolls inside its panel when long. Fast travel is off (fastOff()) while
   a cutscene plays, on the night train, or when a lesson's fastTravel() hook returns false or a reason (a follower who must
   walk with you, a crowd scene, a step the story needs walked). */
const DESTS = [];               // a unit's places: DESTS.push({ scene, label, sub, ok, now?, spawn?, face?, learnt?, key? })
/* a place's key in S.fast and its button: its key (several places in one scene: Unit 2's sights in the Piazza), else its scene */
const destKey = d => d.key || d.scene;
/* a DEST is open when its own ok() says so, or when any lesson hook's dests[scene]() does (and it is open at this hour) */
const destOpen = d => (d.ok() || hooks().some(h => h.dests && typeof h.dests[destKey(d)] === 'function' && h.dests[destKey(d)]())) && (!d.now || d.now());
/* the places learnt: open ones are remembered, older saves are filled in (learnt), then S.fast says */
function fastKnown(){
  const F = S.fast || (S.fast = {});
  let changed = false;
  DESTS.forEach(d => { const k = destKey(d); if (!F[k] && (d.ok() || hooks().some(h => h.dests && typeof h.dests[k] === 'function' && h.dests[k]()) || (d.learnt && d.learnt()))){ F[k] = true; changed = true; } });
  if (changed) save();
  return F;
}
/* why fast travel is off now (a string), or null */
function fastOff(){
  if (cutscenePlaying()) return 'Not during a scene: watch what happens first.';
  { const u = unitHook('fastOff'); if (u) return u; }        // (the unit's: Padova, on the night train)
  for (const h of hooks()) if (typeof h.fastTravel === 'function'){ const v = h.fastTravel(); if (v === false) return 'Not now: finish what you are doing here first.'; if (typeof v === 'string') return v; }
  return null;
}
/* the places to offer now: learnt (remembered: a later lesson's state can't take one back), open at this hour, not where you are */
const fastDests = () => { if (fastOff()) return []; const F = fastKnown(); return DESTS.filter(d => (d.key ? !(d.here && d.here()) : d.scene !== S.scene) && F[destKey(d)] && (!d.now || d.now())); };
function fastGo(scene){
  const d = DESTS.find(x => destKey(x) === scene); if (!d || fastOff()) return;
  travelTo(d.scene, d.spawn || null, d.label, d.sub, { face:d.face || { x:0, y:-1 } });
}
Object.assign(window.__debug, { playerFace:() => ({ ...(player.face || { x:0, y:-1 }) }) });
window.__fast = () => ({ known:Object.keys(fastKnown()).filter(k => S.fast[k]), offer:fastDests().map(destKey), off:fastOff() });
/* the "Go straight there" list beside a map: primary(d) → that place's button is the highlighted one */
function fastListHTML(primary = () => false){
  const fast = fastDests(), off = fastOff();
  if (fast.length) return `<div class="maptools fastlist"><p class="fl-head">Go straight there</p><div class="fl-items">${fast.map(d => `<button class="btn${primary(d) ? ' primary' : ''}" data-go="${destKey(d)}">Walk to ${d.label}</button>`).join('')}</div></div>`;
  if (off && S.fast && Object.keys(S.fast).length > 1) return `<div class="maptools fastlist"><p class="fl-head">No fast travel now</p><p class="note">${esc(off)}</p></div>`;
  return '';
}
/* M, the Map button: the unit's map (Padova: the city map, units/padova/world/map.js) */
function openMap(){
  if (introOpen) return;
  unitHook('openMap');
}
