/* Intro screen, new game, lesson-skip buttons, restoring a save. */

/* ---------- intro ---------- */
function sanitizeName(s){
  const w = (s || '').trim().split(/\s+/)[0] || '';
  const clean = w.replace(/[^\p{L}'-]/gu, '').slice(0, 14);
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() : '';
}
function showIntro(){
  introOpen = true; $('#intro').hidden = false;
  const saved = loadSaved();
  const row = $('#continueRow');
  if (saved){ row.hidden = false; $('#btnContinue').textContent = `Continue as ${saved.playerName}`; }
  else row.hidden = true;
  $('#nameInput').value = '';
  setTimeout(() => $('#nameInput').focus(), 50);
  renderHUD();
}
function newGame(){
  S = FRESH(); S.playerName = sanitizeName($('#nameInput').value) || 'Alex';
  PX = { 1:freshPX(), 2:freshPX(), 3:freshPX(), 4:freshPX(), 5:freshPX(), 6:freshPX() }; hbTab = 'lesson'; hbLesson = 1; MAP = { key:null, path:[[2,4]], status:null };
  player.x = 480; player.y = 520;
}
$('#nameForm').addEventListener('submit', e => { e.preventDefault(); newGame(); save(); startGame(); });
$('#btnJump2').onclick = () => { newGame(); skipL1(); startGame(); startLesson2(); };
$('#btnJump3').onclick = () => { newGame(); skipL1(); skipL2(); startGame(); startLesson3(); };
$('#btnJump4').onclick = () => { newGame(); skipL1(); skipL2(); skipL3(); startGame(); startLesson4(); };
$('#btnJump5').onclick = () => { newGame(); skipL1(); skipL2(); skipL3(); skipL4(); startGame(); startLesson5(); };
$('#btnJump6').onclick = () => { newGame(); skipL1(); skipL2(); skipL3(); skipL4(); skipL5(); startGame(); startLesson6(); };
/* skip buttons for hooked lessons (7+): run every earlier skip, then start the lesson */
const BUILTIN_SKIPS = [skipL1, skipL2, skipL3, skipL4, skipL5, skipL6];
function jumpTo(n){
  newGame();
  for (let k = 1; k < n; k++){ const f = BUILTIN_SKIPS[k - 1] || (hookFor(k) && hookFor(k).skip); if (f) f(); }
  startGame();
  hookFor(n).start();
}
hooks().filter(h => h.n > 6 && h.start).forEach(h => {
  const row = $('#jumpRow'); if (!row) return;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'linkbtn'; b.textContent = 'Lezione ' + h.n; b.dataset.jump = h.n;
  b.onclick = () => jumpTo(h.n); row.append(', ', b);
});
$('#btnContinue').onclick = () => {
  const saved = loadSaved(); if (!saved) return;
  S = Object.assign(FRESH(), saved); player.x = S.px; player.y = S.py;
  restoreAux();
  startGame();
};
function restoreAux(){
  PX = { 1:freshPX(), 2:freshPX(), 3:freshPX(), 4:freshPX(), 5:freshPX(), 6:freshPX() };
  if (S.practiceDone4) PX[4].i = LESSONS[3].exercises.length;
  if (S.practiceDone5) PX[5].i = LESSONS[4].exercises.length;
  if (S.practiceDone6) PX[6].i = LESSONS[5].exercises.length;
  if (!S.l6 || !S.l6.steps) S.l6 = FRESH().l6;
  if (!S.l5intros) S.l5intros = {};
  if (!S.l4 || typeof S.l4 !== 'object') S.l4 = freshL4();
  if (S.practiceDone) PX[1].i = LESSONS[0].exercises.length;
  if (S.practiceDone2) PX[2].i = LESSONS[1].exercises.length;
  if (S.practiceDone3) PX[3].i = LESSONS[2].exercises.length;
  hbLesson = S.lesson; MAP = { key:null, path:[[2,4]], status:null };
  hooks().forEach(h => { if (S['practiceDone' + h.n]) (PX[h.n] = freshPX()).i = LESSONS[h.n - 1].exercises.length; if (h.restore) h.restore(); });
  if (!SCENES[S.scene]) S.scene = 'piazza';
  cutsceneRestore();                              // saved during a cutscene: control back, a lesson may restart it (world/cutscene.js)
}
function startGame(){ introOpen = false; $('#intro').hidden = true; renderHUD(); lastGuide = ''; renderGuide(); }
