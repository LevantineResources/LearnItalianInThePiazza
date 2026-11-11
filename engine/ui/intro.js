/* Intro screen (the unit's poster: units/<id>/intro.html), new game, lesson-skip buttons, restoring a save. */

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
  PX = freshPXAll(); hbTab = 'lesson'; hbLesson = 1; unitHook('newGame');
  player.x = UNIT.start.x; player.y = UNIT.start.y;
}
$('#nameForm').addEventListener('submit', e => { e.preventDefault(); newGame(); save(); startGame(); });
/* skip buttons for hooked lessons: run every earlier skip (the unit's own chapters' skips, UNIT.skips[n - 1], then the hooks'),
   then start the lesson. The unit's own chapters have their skip buttons in its intro (Padova's #btnJump2 … 6). */
function jumpTo(n){
  newGame();
  for (let k = 1; k < n; k++){ const f = (UNIT.skips || [])[k - 1] || (hookFor(k) && hookFor(k).skip); if (f) f(); }
  startGame();
  hookFor(n).start();
}
hooks().filter(h => h.n > (UNIT.skips || []).length && h.start).forEach(h => {
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
  PX = freshPXAll();
  unitHook('restore');                            // (the unit's repairs of an older save: Padova's Lessons 1–6)
  hbLesson = S.lesson;
  hooks().forEach(h => { if (S['practiceDone' + h.n]) (PX[h.n] = freshPX()).i = LESSONS[h.n - 1].exercises.length; if (h.restore) h.restore(); });
  if (!SCENES[S.scene]) S.scene = UNIT.start.scene;
  cutsceneRestore();                              // saved during a cutscene: control back, a lesson may restart it (world/cutscene.js)
}
function startGame(){ introOpen = false; $('#intro').hidden = true; renderHUD(); lastGuide = ''; renderGuide(); }
