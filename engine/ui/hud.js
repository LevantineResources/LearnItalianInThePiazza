/* Header, objectives, quest markers (OBJ_NPC), the guide banner text per tutorial state (the unit's: UNIT.objective(),
   UNIT.guide(near); the lessons': their objective / guide hooks). */

/* ---------- HUD, guide, toasts ---------- */
function toast(html){
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = html;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 4200);
}
function setTut(t){ S.tut = t; save(); renderHUD(); }
/* who gets the quest marker in each tutorial state: a unit's own (Object.assign(OBJ_NPC, { tut:npcId })); lesson hooks add
   theirs via markers:{} */
const OBJ_NPC = {};
function renderHUD(){
  questHooksBust();
  const o = $('#objective');
  const txt = unitHook('objective') || hookText('objective') || '';
  /* (the text in a span of its own, so a long objective is cut short with … rather than pushing the tools onto a second row;
     an empty objective keeps its place but isn't drawn) */
  const ot = o.firstElementChild && o.firstElementChild.classList.contains('obj-t') ? o.firstElementChild : (o.textContent = '', o.appendChild(Object.assign(document.createElement('span'), { className:'obj-t' })));
  ot.textContent = txt; o.title = txt; o.classList.toggle('obj-empty', !txt); o.classList.toggle('done', Object.values(DONE_TUTS).includes(S.tut) || hooks().some(h => h.doneTut === S.tut));
  $('#lessonLabel').textContent = unitHook('lessonLabel', S.lesson) || (LESSONS[S.lesson - 1] ? `Lezione ${S.lesson} · ${LESSONS[S.lesson - 1].title}` : '');
  $('#dictCount').textContent = vocabCount();
  $('#btnBook').classList.toggle('pulse', (UNIT.bookPulse || []).includes(S.tut) || hooks().some(h => (h.bookPulse || []).includes(S.tut)));
  $('#btnPhone').hidden = !unitHook('phoneShown'); $('#btnMap').hidden = !unitHook('mapShown');
  $('#btnNum').hidden = !numbersUnlocked();
  $('#btnStudy').hidden = !studyUnlocked();
  $('#btnNum').classList.toggle('pulse', hooks().some(h => (h.numbersPulse || []).includes(S.tut)));
  $('#phoneDot').hidden = !S.phoneUnread;
  $('#btnPhone').classList.toggle('pulse', S.phoneUnread);
  $('#btnMap').classList.toggle('pulse', (UNIT.mapPulse || []).includes(S.tut) || hooks().some(h => (h.mapPulse || []).includes(S.tut)));
  renderSoundBtn();
  unitHook('place'); placeCrowd(); placeByHours(); askHooks('place');
  renderListButton(); renderNotebookButton(); renderQuestHUD();
}
/* objective / guide text from a lesson hook: a string, or a function of (near) */
function hookText(kind, near){
  for (const h of hooks()){ const t = h[kind] && h[kind][S.tut]; if (t !== undefined) return typeof t === 'function' ? t(near) : t; }
  return null;
}
let lastGuide = '';
function guideHTML(){
  const near = nearestNpc();
  { const h = hookText('guide', near); if (h !== null) return h; }
  return unitHook('guide', near) || '';
}
function renderGuide(){
  const g = $('#guide');
  const cut = cutsceneOn();                       // a cutscene shows its own line, or none (world/cutscene.js)
  g.hidden = frozen() || (cut && !cutsceneGuide());
  let h = cut ? cutsceneGuide() || '' : guideHTML();
  { const l = !frozen() && !cut && nearLandmark(), u = l && unitHook('landmarkGuide', l); if (u) h += u;     // (the unit's line for a landmark: Padova, choosing a work in Vedo, vedo… nel museo)
    else if (l){ const what = l.lookAt || 'the statue'; h += `<span class="gnear"><span class="gkey">Press <kbd>E</kbd> (or click it) to look at ${what}.</span><span class="gtap">Tap ${what} to look at it.</span></span>`; } }
  if (h !== lastGuide){
    lastGuide = h; $('#guideText').innerHTML = h;
    g.classList.remove('flash'); void g.offsetWidth; g.classList.add('flash');
  }
  guideDock(g);
}
/* in a shop (world/shops.js) the top of the room is its sign, its posters and its price board: the guide moves to the
   bottom left corner of the canvas there (beside the door, over the floor), narrower; elsewhere it stays at the top, unless
   it would cover what the scene needs in view: a scene's guideKeep:[{ x, y, w, h }] (world rects: the covered market's shop
   signs and Marisa's counter; the bridge's deck) moves it down too whenever the banner at the top would overlap one */
function guideCovers(g, keep){
  const s = $('#stage').getBoundingClientRect(), c = cv.getBoundingClientRect(), k = c.width / W * camZoom();
  const w = Math.min(640, s.width - 32), h = g.classList.contains('low') ? (g.topH || g.offsetHeight) : g.offsetHeight;
  if (!g.classList.contains('low')) g.topH = h;
  const top = { l:s.left + s.width / 2 - w / 2, r:s.left + s.width / 2 + w / 2, t:s.top + 12, b:s.top + 12 + h };
  return keep.some(o => { const l = c.left + (o.x - cam.x) * k, t = c.top + (o.y - cam.y) * k, r = l + o.w * k, b = t + o.h * k; return l < top.r && r > top.l && t < top.b && b > top.t; });
}
function guideDock(g){
  const sc = scene(), wide = cv.getBoundingClientRect().width >= 640;
  const low = !g.hidden && wide && ((typeof shopOf === 'function' && !!shopOf()) || (!!sc.guideKeep && guideCovers(g, sc.guideKeep)));
  g.classList.toggle('low', low);
  if (!low) return;
  const s = $('#stage').getBoundingClientRect(), c = cv.getBoundingClientRect();
  const l = Math.round(Math.max(8, c.left - s.left + 12)), b = Math.round(Math.max(8, s.bottom - c.bottom + 12)), w = Math.round(Math.min(430, c.width * 0.4));
  if (g.dockKey !== `${l},${b},${w}`){ g.dockKey = `${l},${b},${w}`; g.style.setProperty('--gl', l + 'px'); g.style.setProperty('--gb', b + 'px'); g.style.setProperty('--gw', w + 'px'); }
}
$('#guide').addEventListener('click', e => {
  const a = e.target.closest('[data-action^="l"]'); if (a){ const h = hookFor(+a.dataset.action.slice(1)); if (h && h.start) h.start(); }
});
