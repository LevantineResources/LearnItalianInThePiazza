/* Constants, the save state S (FRESH), persistence, and who is where (sceneOf, activeNpcs, followers). */

/* =========================================================
   ENGINE
   ========================================================= */
const W = 960, H = 600, NEAR = 58, KEY = 'piazza-lezione-1';
const DPR = Math.min(2, window.devicePixelRatio || 1);
const RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

const FRESH = () => ({ v:1, playerName:'', lesson:1, tut:'walk', scene:'piazza', vocab:false, handbookOpened:false, practiceDone:false,
  vocab2:false, practiceDone2:false, l2own:false, l2EmmaDone:false,
  vocab3:false, practiceDone3:false, vocab4:false, practiceDone4:false, l4:freshL4(), vocab6:false, practiceDone6:false, handbookLost:false, brunoFollow:false, l6:{ steps:{}, lines:0, clean:0, models:0, order:null, orderDone:false }, vocab5:false, practiceDone5:false, phoneReplied5:false, l5follow:false, l5notes:null, l5routeOK:false, l5statue:false, l5intros:{}, phoneUnread:false, phoneReplied:false, l3notes:null, l3routeOK:false, visited:{},
  met:{}, known:{}, convos:{}, wordStats:{}, sentences:0, sound:true, px:480, py:520 });
let S = FRESH();
/* for tests and debugging: a snapshot of the game state (tests read it with page.evaluate(() => __dbg())). Keep study
   last: some tests print the whole snapshot on one line, and tests/run.js fails a line with "complete…: false". */
window.__dbg = () => ({ scene:S.scene, lesson:S.lesson, tut:S.tut, me:[Math.round(player.x), Math.round(player.y)],
  npcs:Object.fromEntries(activeNpcs().map(n => [n.id, [Math.round(n.x), Math.round(n.y)]])), follow:S.brunoFollow, lost:S.handbookLost, bruno:[Math.round(NPC.bruno.x), Math.round(NPC.bruno.y)],
  numbers:S.numbers ? { ...S.numbers } : null, drill:numbersDbg(), l7:S.l7 ? JSON.parse(JSON.stringify(S.l7)) : null, l8:S.l8 ? JSON.parse(JSON.stringify(S.l8)) : null, pad:numberPadDbg(), words:vocabDbg(),
  l9:S.l9 ? JSON.parse(JSON.stringify(S.l9)) : null, l10:S.l10 ? JSON.parse(JSON.stringify(S.l10)) : null, l11:S.l11 ? Object.assign(JSON.parse(JSON.stringify(S.l11)), askHooks('dbgLesson', 11) || {}) : null, dict:mapDictDbg(), list:checklistDbg(), statue:statueDbg(), crowd:crowdDbg(), clock:clockDbg(), grammar:grammarDbg(), ispy:ispyDbg(), galleria:galleriaDbg(), cut:cutsceneDbg(), mispy:mispyDbg(), handbook:hbDbg(), quests:questDbg(), night:nightDbg(), stazione:stazioneDbg(), shop:shopDbg(), ponte:ponteDbg(), parco:parcoDbg(), foto:fotoDbg(), tramonto:tramontoDbg(), aquilone:aquiloneDbg(), salone:saloneDbg(), mercato:mercatoDbg(), basilica:basilicaDbg(), messa:messaDbg(), aperitivo:aperitivoDbg(), notebook:notebookDbg(),
  l12:S.l12 ? Object.assign(JSON.parse(JSON.stringify(S.l12)), askHooks('dbgLesson', 12) || {}) : null, treno:trenoDbg(), fast:window.__fast ? window.__fast() : null,
  l13:S.l13 ? Object.assign(JSON.parse(JSON.stringify(S.l13)), askHooks('dbgLesson', 13) || {}) : null,
  l14:S.l14 ? Object.assign(JSON.parse(JSON.stringify(S.l14)), askHooks('dbgLesson', 14) || {}) : null,
  venezia:veneziaDbg(), l15:S.l15 ? Object.assign(JSON.parse(JSON.stringify(S.l15)), askHooks('dbgLesson', 15) || {}) : null, unit:typeof unitDbg === 'function' ? unitDbg() : null, study:studyDbg() });   // study last: run.js reads "completed…: false" as a failure
/* for tests: change state directly. __debug.set({ lesson:7 }) merges into S; __debug.travel('mercato') walks there
   (optional spawn {x,y}); __debug.place(x, y, face?) moves the player (and turns it, e.g. {x:0,y:-1}); __debug.npc('mark', { stain:true }) merges into an NPC.
   __debug.fmt('grazie mille Bruno arrivederci') runs formatSentence (engine/parser.js) on those words, as typed:
   a capitalised word is a name token. See tests/format.js. Not used by the game itself. */
window.__debug = {
  set(o){ Object.assign(S, o); save(); renderHUD(); },
  travel(scene, spawn){ travelTo(scene, spawn || null, scene, ''); },
  place(x, y, face){ player.x = x; player.y = y; target = null; route = []; goalPt = null; if (face) player.face = { ...face }; },
  npc(id, o){ Object.assign(NPC[id], o); },
  price(c){ return { shown:priceIt(c), said:sayIt(priceIt(c)) }; },     // a price before Lesson 7: written in digits, spoken in words
  clock(h, m){ setClock(h, m); },                                      // the museum square's clock tower (world/museo.js)
  crowdReset(ids){ crowdReset(ids); },
  reach(x, y){ const p = findPath(player.x, player.y, x, y); return !!p && Math.hypot(p[p.length - 1].x - x, p[p.length - 1].y - y) < 24; },   // tap-to-walk can get there
  overview(on){ galleriaOverview(on); },                               // the museum interior: show the whole scene (world/galleria.js)
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
const frozen = () => introOpen || dialogOpen || modalOpen || traveling || pickOpen;
/* which scene an NPC is in. Lesson hooks can move someone for their lesson: sceneOf(n) returns a scene key
   (Lesson 8 puts Lucia and Mark at the market); otherwise the default below. */
const sceneOf = n => askHooks('sceneOf', n) || defaultSceneOf(n);
const defaultSceneOf = n => n.id === 'bruno' ? (S.brunoFollow ? S.scene : (S.tut === 'l6-done' || S.lesson >= 7) ? 'piazza' : 'santo') : n.id === 'mark' ? (S.l5follow ? S.scene : S.lesson >= 5 ? 'piazza' : 'aurora') : (n.scene || 'piazza');
const activeNpcs = () => NPCS.filter(n => sceneOf(n) === S.scene && (!n.lesson || S.lesson >= n.lesson) && !(n.hideFrom && S.lesson >= n.hideFrom) && npcAround(n));
/* followers walk the player's trail: Mark (S.l5follow), Bruno (S.brunoFollow), or whoever a lesson's follower() hook
   returns (an NPC or an id: Lesson 11's Lucia) */
const hookFollower = () => { const f = askHooks('follower'); return f ? (typeof f === 'string' ? NPC[f] : f) : null; };
const followerNpc = () => S.l5follow ? NPC.mark : S.brunoFollow ? NPC.bruno : hookFollower();
const isFollower = n => (n.id === 'mark' && S.l5follow) || (n.id === 'bruno' && S.brunoFollow) || (!!n && followerNpc() === n);
const metCount = () => L1_PEOPLE.filter(n => S.met[n.id]).length;
const L1done = () => S.lesson >= 2 || S.tut === 'done';
const vocabCount = () => (S.vocab ? VOCAB1.length : 0) + (S.vocab2 ? VOCAB2.length : 0) + (S.vocab3 ? DIR_TILES.length : 0) + (S.vocab4 ? L4_ALL.length : 0) + (S.vocab5 ? L5_TILES.length : 0) + (S.vocab6 ? L6_TILES.length : 0) + (S.numbers && S.numbers.introDone ? NUM_TOP + 1 : 0)
  + hooks().reduce((a, h) => a + (S['vocab' + h.n] && h.vocab ? h.vocab.length : 0), 0);

function placeMark(){
  const m = NPC.mark;
  if (S.lesson >= 6 && !S.l5follow){ m.x = 868; m.y = 232; m.baseFace = { x:1, y:-0.6 }; }
  else if (S.lesson >= 5 && !S.l5follow){ m.x = 636; m.y = 402; m.baseFace = { x:-1, y:0 }; }
  else if (S.lesson === 4){ m.x = m.home.x; m.y = m.home.y; m.baseFace = { ...m.home.face }; }
  const b = NPC.bruno;
  if (S.tut === 'l6-done' || S.lesson >= 7){ b.x = 834; b.y = 226; b.baseFace = { x:1, y:0 }; } else if (!S.brunoFollow){ b.x = b.home.x; b.y = b.home.y; b.baseFace = { ...b.home.face }; }
}
function placeEmma(){
  const e = NPC.emma;
  if (S.tut === 'l2-translate' || S.l2EmmaDone){ e.x = 926; e.y = 196; e.baseFace = { x:-1, y:0 }; }
  else { e.x = e.home.x; e.y = e.home.y; e.baseFace = { ...e.home.face }; }
}
