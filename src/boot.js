/* Boot: build backgrounds, restore or show the intro. */

/* ---------- boot ---------- */
function start(data){
  buildBg(); buildBgSL(); buildBgAU(); buildBgSanto(); buildBgMercato(); buildBgMuseo(); fit(); renderHUD();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { buildBg(); buildBgSL(); buildBgAU(); buildBgSanto(); buildBgMercato(); buildBgMuseo(); });
  requestAnimationFrame(loop);
  if (data && data.S && data.S.playerName){
    S = Object.assign(FRESH(), data.S); player.x = S.px; player.y = S.py;
    restoreAux();
    startGame();
  } else showIntro();
}
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
