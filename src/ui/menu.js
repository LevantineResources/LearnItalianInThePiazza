/* Reset dialog and header button wiring. */

function openReset(){
  openModal('small');
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Start over</p><h2>Erase your progress?</h2></div><button class="x" data-close aria-label="Cancel">×</button></div>
    <div class="sheet-body"><p>You'll go back to the start of Lezione 1 with an empty dictionary.</p>
      <div class="cta"><button class="btn" data-close>Cancel</button><button class="btn primary" id="doReset">Start over</button></div></div>`;
  $('#doReset').onclick = () => {
    try { localStorage.removeItem(KEY); } catch(e){}
    closeModal(); closeDialog();
    S = FRESH(); PX = { 1:freshPX(), 2:freshPX(), 3:freshPX(), 4:freshPX(), 5:freshPX(), 6:freshPX() }; hbTab = 'lesson'; hbLesson = 1; MAP = { key:null, path:[[2,4]], status:null };
    player.x = 480; player.y = 520;
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
