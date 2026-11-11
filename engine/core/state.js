/* Constants, the save state S (FRESH), persistence, and who is where (sceneOf, activeNpcs, followers). */

/* =========================================================
   ENGINE
   ========================================================= */
const W = 960, H = 600, NEAR = 58, KEY = UNIT.saveKey;     // each unit saves under its own key (units/<id>/unit.js)
const DPR = Math.min(2, window.devicePixelRatio || 1);
/* the canvas's resolution: its px per W × H unit. DPR, or (a unit with UNIT.sharpCanvas: Venezia) the canvas's CSS scale times the
   device's pixel ratio, so a canvas shown larger than 960 × 600 is drawn at the screen's own resolution, not upscaled
   (world/update.js fit) */
let RES = DPR;
const RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* a new save: the engine's fields, with the unit's own (UNIT.fresh()) between the start and the people met */
const FRESH = () => ({ v:1, playerName:'', lesson:1, tut:UNIT.start.tut, scene:UNIT.start.scene, ...(unitHook('fresh') || {}),
  met:{}, known:{}, convos:{}, wordStats:{}, sentences:0, sound:true, px:UNIT.start.x, py:UNIT.start.y });
let S = FRESH();
/* for tests and debugging: a snapshot of the game state (tests read it with page.evaluate(() => __dbg())): scene, lesson,
   tut, me, npcs, then every field registered with dbgField(name, fn) (the engine's below, the unit's and its lessons'), in
   the order of UNIT.dbgOrder if the unit gives one, then study. Keep study last: some tests print the whole snapshot on
   one line, and tests/run.js fails a line with "complete…: false". */
const DBG_FIELDS = [];
const dbgField = (name, fn) => { const i = DBG_FIELDS.findIndex(f => f[0] === name); if (i >= 0) DBG_FIELDS[i] = [name, fn]; else DBG_FIELDS.push([name, fn]); };
window.__dbg = () => {
  const o = { scene:S.scene, lesson:S.lesson, tut:S.tut, me:[Math.round(player.x), Math.round(player.y)],
    npcs:Object.fromEntries(activeNpcs().map(n => [n.id, [Math.round(n.x), Math.round(n.y)]])) };
  const order = UNIT.dbgOrder || [], rank = k => { const i = order.indexOf(k); return i < 0 ? order.length : i; };
  DBG_FIELDS.map((f, i) => [f, i]).sort((a, b) => rank(a[0][0]) - rank(b[0][0]) || a[1] - b[1]).forEach(([[k, fn]]) => { o[k] = fn(); });
  o.study = studyDbg();   // study last: run.js reads "completed…: false" as a failure
  return o;
};
[['numbers', () => S.numbers ? { ...S.numbers } : null], ['drill', () => numbersDbg()], ['pad', () => numberPadDbg()], ['words', () => vocabDbg()],
 ['list', () => checklistDbg()], ['grammar', () => grammarDbg()], ['cut', () => cutsceneDbg()], ['handbook', () => hbDbg()], ['quests', () => questDbg()],
 ['night', () => nightDbg()], ['shop', () => shopDbg()], ['notebook', () => notebookDbg()], ['fast', () => window.__fast ? window.__fast() : null]]
  .forEach(([k, fn]) => dbgField(k, fn));
/* for tests: change state directly. __debug.set({ lesson:7 }) merges into S; __debug.travel('mercato') walks there
   (optional spawn {x,y}); __debug.place(x, y, face?) moves the player (and turns it, e.g. {x:0,y:-1}); __debug.npc(id, { stain:true }) merges into an NPC.
   __debug.fmt('grazie mille Bruno arrivederci') runs formatSentence (core/parser.js) on those words, as typed:
   a capitalised word is a name token. See tests/padova/format.js. Not used by the game itself. Units and lessons add their
   own (Object.assign(window.__debug, { … })). */
window.__debug = {
  set(o){ Object.assign(S, o); save(); renderHUD(); },
  travel(scene, spawn){ travelTo(scene, spawn || null, scene, ''); },
  place(x, y, face){ player.x = x; player.y = y; target = null; route = []; goalPt = null; if (face) player.face = { ...face }; },
  npc(id, o){ Object.assign(NPC[id], o); },
  price(c){ return { shown:priceIt(c), said:sayIt(priceIt(c)) }; },     // a price before Lesson 7: written in digits, spoken in words
  reach(x, y){ const p = findPath(player.x, player.y, x, y); return !!p && Math.hypot(p[p.length - 1].x - x, p[p.length - 1].y - y) < 24; },   // tap-to-walk can get there
  hook(o){ if (o) LESSON_HOOKS.dbg = Object.assign({ n:0 }, o); else delete LESSON_HOOKS.dbg; renderHUD(); },   // a test lesson hook (functions from page.evaluate)
  fmt(words){ return formatSentence((Array.isArray(words) ? words : words.split(' ')).map(w => ({ w:w.toLowerCase(), label:w, name:/^[A-Z]/.test(w) }))); },
};
const player = { x:480, y:520, face:{x:0,y:-1}, moving:false, walk:0, body:'#1c3d8f', hair:'#5a3a22', skin:'#e2b08a', isPlayer:true };
NPCS.forEach(n => { n.home = { x:n.x, y:n.y, face:{...n.baseFace} }; n.face = {...n.baseFace}; });

function save(){ questHooksBust(); S.px = player.x; S.py = player.y; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
function loadSaved(){ try { const raw = localStorage.getItem(KEY); if (raw){ const d = JSON.parse(raw); if (d && d.v === 1 && d.playerName) return d; } } catch(e){} return null; }
window.claude?.hot?.snapshot?.(() => ({ S:{...S, px:player.x, py:player.y} }));

let introOpen = false, dialogOpen = false, modalOpen = false, traveling = false, pickOpen = false;   // pickOpen: the Permesso pick (world/museo.js)
let convo = null, convoBusy = false;
let target = null, pendingTalk = null, pendingDoor = null, stuckT = 0;
const keys = new Set();
/* running (a scene with run: × its walking speed): Shift held (ui/keyboard.js), or a double tap (and hold) on the canvas
   (world/update.js): the walk to that spot is run */
const RUN = { key:false, tap:false };
const running = () => !!(scene().run && (RUN.key || RUN.tap));
const walkSpeed = () => (scene().speed || 170) * (running() ? scene().run : 1);
const frozen = () => introOpen || dialogOpen || modalOpen || traveling || pickOpen;
/* which scene an NPC is in. Lesson hooks can move someone for their lesson: sceneOf(n) returns a scene key
   (Lesson 8 puts Lucia and Mark at the market); otherwise the unit's default (UNIT.defaultScene(n)), the NPC's own
   scene, or the unit's start scene. */
const sceneOf = n => askHooks('sceneOf', n) || defaultSceneOf(n);
const defaultSceneOf = n => unitHook('defaultScene', n) || n.scene || UNIT.start.scene;
const activeNpcs = () => NPCS.filter(n => sceneOf(n) === S.scene && (!n.lesson || S.lesson >= n.lesson) && !(n.hideFrom && S.lesson >= n.hideFrom) && npcAround(n));
/* followers walk the player's trail: the unit's (UNIT.follower(): Padova's Mark and Bruno), or whoever a lesson's
   follower() hook returns (an NPC or an id: Lesson 11's Lucia) */
const hookFollower = () => { const f = askHooks('follower'); return f ? (typeof f === 'string' ? NPC[f] : f) : null; };
const followerNpc = () => unitHook('follower') || hookFollower();
const isFollower = n => !!unitHook('isFollower', n) || (!!n && followerNpc() === n);
/* the dictionary's count (the header's badge): the unit's own words (UNIT.vocabCount()), the numbers, every practised lesson's tiles */
const vocabCount = () => (unitHook('vocabCount') || 0) + (S.numbers && S.numbers.introDone ? NUM_TOP + 1 : 0)
  + hooks().reduce((a, h) => a + (S['vocab' + h.n] && h.vocab ? h.vocab.length : 0), 0);
