/* Boot: build the unit's backgrounds, restore or show the intro. */

/* ---------- boot ---------- */
function start(data){
  unitHook('buildBackgrounds'); fit(); renderHUD();          // the unit's pre-rendered backgrounds (again once the fonts are in)
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => unitHook('buildBackgrounds'));
  requestAnimationFrame(loop);
  if (data && data.S && data.S.playerName){
    S = Object.assign(FRESH(), data.S); player.x = S.px; player.y = S.py;
    restoreAux();
    startGame();
  } else showIntro();
}
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
