/* The registries a unit fills (units/<id>/: CLAUDE.md, "Units"). The engine never names a unit's people, scenes or
   lessons: it asks these.
   UNIT: the unit itself (units/<id>/unit.js): its id, title, save key, where a new game starts, and the unit hooks
     (UNIT.name = function, asked with unitHook('name', …): the places where a unit takes over a piece of the engine,
     e.g. Padova's Lessons 1–6, which were wired into the engine before LESSON_HOOKS existed).
   LESSONS: every lessons/NN-name/content.js pushes its handbook chapter, in order.
   LESSON_HOOKS: lessons from 7 on plug into the shared engine through hooks instead of
   editing shared files. See CLAUDE.md, "Adding a lesson", for every hook. */

const UNIT = {
  id:'', title:'', saveKey:'',
  start:{ scene:'', x:480, y:520, tut:'walk' },      // a new game: the scene, the player's spot, the first tutorial state
  /* the friend the player introduces to people (the brain's "Ti presento…": parser intent name:<id>, n.markHello, the
     introMark agenda goal) and the default companion of a typed script (companion:true); Padova: Mark */
  friend:null,                                         // { id, name }
  properNames:[],                                      // words typed answers never correct (place names, the friend's name)
};
/* a unit hook: UNIT[name](...args), or undefined when the unit has none */
const unitHook = (name, ...args) => typeof UNIT[name] === 'function' ? UNIT[name](...args) : undefined;

const LESSONS = [];
const LESSON_HOOKS = {};
/* QUESTS: every quests/NN-name/*.js pushes one quest, QUESTS.push({ id, … }). The quest system is
   core/quests.js (docs/features/quests-and-night.md). While a quest is open or under way its `hooks` (the same keys as
   LESSON_HOOKS) join hooks(), after the lessons' hooks, so askHooks() asks them too. */
const QUESTS = [];
const hooks = () => Object.values(LESSON_HOOKS).concat(questHooks());
const hookFor = n => LESSON_HOOKS[n] || null;
/* first hook that returns something other than undefined/null/false */
function askHooks(name, ...args){
  for (const h of hooks()){ if (typeof h[name] !== 'function') continue; const r = h[name](...args); if (r !== undefined && r !== null && r !== false) return r; }
  return null;
}
/* every hook that has it, in order (not the first answer: a per-frame hook, tick(dt), that each lesson runs for itself) */
function hooksEach(name, ...args){ for (const h of hooks()) if (typeof h[name] === 'function') h[name](...args); }

/* The cast: NPCS.push({ id, … }) (a unit's content/npcs.js; the format is in CLAUDE.md), NPC = map by id (the unit fills
   it in after pushing: NPCS.forEach(n => NPC[n.id] = n)). */
const NPCS = [];
const NPC = {};
/* GLOSS_OK: the gloss lint's reviewed exceptions (ui/vocab.js glossLint: a word card's English prompt never contains its Italian).
   Only true cognates where no other English exists, each with its reason: { 'il bar':'why' } (keys as studyKey(it): lower case,
   punctuation dropped). A unit fills it (Object.assign(GLOSS_OK, {…}) in a content file). */
const GLOSS_OK = {};
/* SET_PHRASES (the Frasi fatte: one-tile everyday phrases, conversation/bank.js), PLACES (names the parser knows:
   { key:['il nome', 'The name'] }), VERBS (the grammar drill's forms: ui/grammar.js, format in a unit's content/verbs.js) */
const SET_PHRASES = [];
const PLACES = {};
const VERBS = [];
/* ITEMS: what can be ordered at a bar (Padova's Lesson 2: { w, art, en, price, kind:'coffee'|'drink'|'pastry'|'food', desc? });
   ITEM = map by word (the unit fills it in). The parser reads "un caffè" as item:caffè, and catches the wrong article. */
const ITEMS = [];
const ITEM = {};
/* the NPC "huh?" replies */
const FAILS = [
  { it:'Eh? Non capisco.', en:"Huh? I don't understand." },
  { it:'Come?', en:'Pardon?' },
  { it:'Scusi?', en:'Sorry?' },
];
