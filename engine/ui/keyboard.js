/* Keyboard controls. */

/* ---------- keyboard ---------- */
const DIRS = { arrowup:[0,-1], w:[0,-1], arrowdown:[0,1], s:[0,1], arrowleft:[-1,0], a:[-1,0], arrowright:[1,0], d:[1,0] };
document.addEventListener('keydown', e => {
  RUN.key = e.shiftKey;
  if (e.target.matches && e.target.matches('input')) return;
  const k = e.key.toLowerCase();
  if (introOpen || traveling) return;
  if (modalOpen && k === 'escape' && hbSwitchOpen()){ hbSwitch(false); return; }   // (the handbook's list of lessons first: ui/handbook.js)
  if (modalOpen){ if (k === 'escape' || (k === 'e' && (unitHook('eClosesModal') || fixtureOpen() || (CARD && CARD.kind === 'info')))) closeModal(); return; }   // (E also closes a look: a shop's fixture, the unit's pictures, an info card: ui/cards.js)
  if (pickOpen){ e.preventDefault(); crowdPickKey(k); return; }
  if (cutsceneOn() && !dialogOpen && cutsceneKey(k)){ e.preventDefault(); return; }    /* a cutscene: only its keys (world/cutscene.js) */
  if (unitHook('key', k, e)) return;                                                   /* the unit's own keys (Padova: R in the museum's Vedo, vedo) */
  const plain = !e.metaKey && !e.ctrlKey && !e.altKey;
  if (k === 'h' && plain){ e.preventDefault(); openHandbook(); return; }
  if (k === 'v' && plain){ e.preventDefault(); openDict(); return; }
  if (k === 'n' && plain && numbersUnlocked()){ e.preventDefault(); openNumbers(); return; }
  if (k === 't' && plain && studyUnlocked()){ e.preventDefault(); openStudy(); return; }     /* Studio (S is WASD movement) */
  if (k === 'm' && plain && unitHook('mapShown')){ e.preventDefault(); openMap(); return; }
  if (k === 'p' && plain && unitHook('phoneShown')){ e.preventDefault(); openPhone(); return; }
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
    const l = nearLandmark(); if (l){ enterDoor(l); return; }      /* a landmark beats a follower, not a person */
    const n = nearestNpc(); if (n){ openConvo(n); return; }
    const d = nearestDoor(); if (d) enterDoor(d);
  }
});
document.addEventListener('keyup', e => { keys.delete(e.key.toLowerCase()); RUN.key = e.shiftKey; });
window.addEventListener('blur', () => { keys.clear(); RUN.key = false; RUN.tap = false; });
