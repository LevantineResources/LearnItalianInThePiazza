/* Padova's intro and saves (engine/ui/intro.js, menu.js): the skip links to Lessons 2–6, a new game's and an old save's
   records of Lessons 1–6, the route-tracing map's state (world/map.js MAP). */
Object.assign(UNIT, {
  skips:[skipL1, skipL2, skipL3, skipL4, skipL5, skipL6],   // the skips of Lessons 1–6 (jumpTo runs them before a later lesson)
  newGame(){ MAP = { key:null, path:[[2,4]], status:null }; },
  resetNote:() => "You'll go back to the start of Lezione 1 with an empty dictionary.",
  restore(){
    if (S.practiceDone4) PX[4].i = LESSONS[3].exercises.length;
    if (S.practiceDone5) PX[5].i = LESSONS[4].exercises.length;
    if (S.practiceDone6) PX[6].i = LESSONS[5].exercises.length;
    if (!S.l6 || !S.l6.steps) S.l6 = FRESH().l6;
    if (!S.l5intros) S.l5intros = {};
    if (!S.l4 || typeof S.l4 !== 'object') S.l4 = freshL4();
    if (S.practiceDone) PX[1].i = LESSONS[0].exercises.length;
    if (S.practiceDone2) PX[2].i = LESSONS[1].exercises.length;
    if (S.practiceDone3) PX[3].i = LESSONS[2].exercises.length;
    MAP = { key:null, path:[[2,4]], status:null };
  },
});
$('#btnJump2').onclick = () => { newGame(); skipL1(); startGame(); startLesson2(); };
$('#btnJump3').onclick = () => { newGame(); skipL1(); skipL2(); startGame(); startLesson3(); };
$('#btnJump4').onclick = () => { newGame(); skipL1(); skipL2(); skipL3(); startGame(); startLesson4(); };
$('#btnJump5').onclick = () => { newGame(); skipL1(); skipL2(); skipL3(); skipL4(); startGame(); startLesson5(); };
$('#btnJump6').onclick = () => { newGame(); skipL1(); skipL2(); skipL3(); skipL4(); skipL5(); startGame(); startLesson6(); };
