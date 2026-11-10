/* Lesson registry.
   LESSONS: every lessons/NN-name/content.js pushes its handbook chapter, in order.
   LESSON_HOOKS: lessons from 7 on plug into the shared engine through hooks instead of
   editing shared files. See CLAUDE.md, "Adding a lesson", for every hook. */

const LESSONS = [];
const LESSON_HOOKS = {};
/* QUESTS (Lesson 12 on): every quests/NN-name/*.js pushes one quest, QUESTS.push({ id, … }). The quest system is
   engine/quests.js (docs/features/quests-and-night.md). While a quest is open or under way its `hooks` (the same keys as
   LESSON_HOOKS) join hooks(), after the lessons' hooks, so askHooks() asks them too. */
const QUESTS = [];
const hooks = () => Object.values(LESSON_HOOKS).concat(questHooks());
const hookFor = n => LESSON_HOOKS[n] || null;
/* first hook that returns something other than undefined/null/false */
function askHooks(name, ...args){
  for (const h of hooks()){ if (typeof h[name] !== 'function') continue; const r = h[name](...args); if (r !== undefined && r !== null && r !== false) return r; }
  return null;
}
