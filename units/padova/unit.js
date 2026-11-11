/* Unit 1 · Padova: the unit's settings and its own fields of the save (engine/core/registry.js UNIT; CLAUDE.md, "Units").
   The unit hooks that wire Lessons 1–6 into the engine are in early/ (they were written into the engine's files before
   LESSON_HOOKS existed); Padova's __dbg fields and __debug helpers are in debug.js. */

Object.assign(UNIT, {
  id:'padova', title:'Piazza', unitNo:1,
  saveKey:'piazza-lezione-1',                         // never change it: players keep their saves
  start:{ scene:'piazza', x:480, y:520, tut:'walk' },
  friend:{ id:'mark', name:'Mark' },                  // Lesson 5: Ti presento il mio amico Mark; the companion of the typed scripts
  properNames:['mille', 'aurora', 'gattamelata', 'mark'],
  /* Padova's own fields in a new save (FRESH(), engine/core/state.js): Lessons 1–6's flags and records */
  fresh:() => ({ vocab:false, handbookOpened:false, practiceDone:false,
    vocab2:false, practiceDone2:false, l2own:false, l2EmmaDone:false,
    vocab3:false, practiceDone3:false, vocab4:false, practiceDone4:false, l4:freshL4(), vocab6:false, practiceDone6:false, handbookLost:false, brunoFollow:false, l6:{ steps:{}, lines:0, clean:0, models:0, order:null, orderDone:false }, vocab5:false, practiceDone5:false, phoneReplied5:false, l5follow:false, l5notes:null, l5routeOK:false, l5statue:false, l5intros:{}, phoneUnread:false, phoneReplied:false, l3notes:null, l3routeOK:false, visited:{} }),
});
