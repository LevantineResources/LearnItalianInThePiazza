/* Keyboard controls. */

/* ---------- keyboard ---------- */
const DIRS = { arrowup:[0,-1], w:[0,-1], arrowdown:[0,1], s:[0,1], arrowleft:[-1,0], a:[-1,0], arrowright:[1,0], d:[1,0] };
document.addEventListener('keydown', e => {
  if (e.target.matches && e.target.matches('input')) return;
  const k = e.key.toLowerCase();
  if (introOpen || traveling) return;
  if (modalOpen){ if (k === 'escape' || (k === 'e' && (statueOpen() || clockOpen() || workOpen() || fixtureOpen()))) closeModal(); return; }
  if (pickOpen){ e.preventDefault(); crowdPickKey(k); return; }
  if (cutsceneOn() && !dialogOpen && cutsceneKey(k)){ e.preventDefault(); return; }    /* a cutscene: only its keys (world/cutscene.js) */
  if (mispyKey(k, e)) return;                                                          /* the museum's Vedo, vedo: R repeats (ui/museum-ispy.js) */
  const plain = !e.metaKey && !e.ctrlKey && !e.altKey;
  if (k === 'h' && plain){ e.preventDefault(); openHandbook(); return; }
  if (k === 'v' && plain){ e.preventDefault(); openDict(); return; }
  if (k === 'n' && plain && numbersUnlocked()){ e.preventDefault(); openNumbers(); return; }
  if (k === 't' && plain && studyUnlocked()){ e.preventDefault(); openStudy(); return; }     /* Studio (S is WASD movement) */
  if (k === 'm' && plain && S.lesson >= 3){ e.preventDefault(); openMap(); return; }
  if (k === 'p' && plain && S.lesson >= 3){ e.preventDefault(); openPhone(); return; }
  if (dialogOpen){
    if (k === 'escape'){ closeDialog(); return; }
    if (k === 'enter'){
      if (e.target.closest && e.target.closest('button') && !builder.contains(e.target)) return;
      e.preventDefault();
      if (!builder.hidden) submit(); else choices.querySelector('.primary')?.click();
      return;
    }
    if (k === 'backspace' && convo && convo.words.length){ e.preventDefault(); convo.words.pop(); renderSentence(); }
    return;
  }
  if (DIRS[k]){ e.preventDefault(); keys.add(k); target = null; pendingTalk = null; pendingDoor = null; return; }
  if (k === 'e' || k === ' ' || k === 'enter'){
    e.preventDefault();
    const l = nearLandmark(); if (l){ enterDoor(l); return; }      /* a landmark (the Gattamelata) beats a follower, not a person */
    const n = nearestNpc(); if (n){ openConvo(n); return; }
    const d = nearestDoor(); if (d) enterDoor(d);
  }
});
document.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
window.addEventListener('blur', () => keys.clear());
