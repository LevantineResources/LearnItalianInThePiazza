/* Padova's people and their places, as the engine asks for them (engine/core/state.js): where Bruno and Mark are by
   default, the followers of Lessons 5–6 (Mark, Bruno), the dictionary's count of Lessons 1–6, where Mark, Bruno and Emma
   stand. Lessons 1–6 were wired into the engine before LESSON_HOOKS existed: this is that wiring, moved out of it. */

Object.assign(UNIT, {
  defaultScene:n => n.id === 'bruno' ? (S.brunoFollow ? S.scene : (S.tut === 'l6-done' || S.lesson >= 7) ? 'piazza' : 'santo') : n.id === 'mark' ? (S.l5follow ? S.scene : S.lesson >= 5 ? 'piazza' : 'aurora') : undefined,
  /* Mark (Lesson 5's tour, S.l5follow) and Bruno (Lesson 6, S.brunoFollow) walk the player's trail */
  follower:() => S.l5follow ? NPC.mark : S.brunoFollow ? NPC.bruno : null,
  isFollower:n => (n.id === 'mark' && S.l5follow) || (n.id === 'bruno' && S.brunoFollow),
  numbersUnlocked:() => !!S.vocab7,                      // the numbers drill: from Lesson 7's practice (ui/numbers.js)
  showBook:() => S.handbookLost && S.lesson >= 6,        // Bruno holds your blue handbook (Lesson 6: render/sprites.js, the book prop)
  typedRec:() => S.l6,                                  // the typed scripts' record (engine/conversation/typing.js): Lesson 6's
  vocabCount:() => (S.vocab ? VOCAB1.length : 0) + (S.vocab2 ? VOCAB2.length : 0) + (S.vocab3 ? DIR_TILES.length : 0) + (S.vocab4 ? L4_ALL.length : 0) + (S.vocab5 ? L5_TILES.length : 0) + (S.vocab6 ? L6_TILES.length : 0),
});
const metCount = () => L1_PEOPLE.filter(n => S.met[n.id]).length;
const L1done = () => S.lesson >= 2 || S.tut === 'done';

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
