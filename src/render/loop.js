/* The animation loop. */

let last = 0;
function loop(ts){
  const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
  questHooksBust();                          // (the quests' hooks are worked out again each frame: engine/quests.js)
  update(dt); draw(ts / 1000);
  if (!introOpen) renderGuide(); else $('#guide').hidden = true;
  requestAnimationFrame(loop);
}
