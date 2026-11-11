/* Reset dialog and header button wiring. */

function openReset(){
  openModal('small');
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Start over</p><h2>Erase your progress?</h2></div><button class="x" data-close aria-label="Cancel">×</button></div>
    <div class="sheet-body"><p>${unitHook('resetNote') || 'You\'ll go back to the start, as a new game.'}</p>
      <div class="cta"><button class="btn" data-close>Cancel</button><button class="btn primary" id="doReset">Start over</button></div></div>`;
  $('#doReset').onclick = () => {
    try { localStorage.removeItem(KEY); } catch(e){}
    closeModal(); closeDialog();
    S = FRESH(); PX = freshPXAll(); hbTab = 'lesson'; hbLesson = 1; unitHook('newGame');
    player.x = UNIT.start.x; player.y = UNIT.start.y;
    NPCS.forEach(n => n.face = { ...n.baseFace });
    renderHUD(); showIntro();
  };
}

$('#btnBook').onclick = () => openHandbook();
$('#btnDict').onclick = () => openDict();
$('#btnPhone').onclick = () => openPhone();
$('#btnMap').onclick = () => openMap();
$('#btnNum').onclick = () => openNumbers();
$('#btnSound').onclick = () => { S.sound = !S.sound; if (!S.sound && hasTTS) try { speechSynthesis.cancel(); } catch(e){} save(); renderSoundBtn(); };
$('#btnReset').onclick = () => { if (!introOpen) openReset(); };
