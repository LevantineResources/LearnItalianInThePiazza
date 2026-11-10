/* The end of Unit 1 (after Lesson 15): the unit-completion screen, free play in Padova, and replaying a lesson.
   - openUnitComplete(): a summary of the unit (words learned, quests done, the passport's stamps, sentences said; the morning in Venice
     in your own Italian), then three choices: Free play in Padova · Replay a lesson · Unit 2 · Venezia (coming soon). While you are still
     in Venice (the screen at the end of the voyage), closing it brings it back: there is nothing more to do there yet.
   - Free play (l15ToFreeState, unitFreePlay): S.l15.free; back to the piazza in the afternoon; Margaret and Biscuit stay in Venice (the
     follower and the lesson's scenes are off), the town's quests open at any time (the townOpen / questFree hooks), Studio, fast travel.
     A save in l15-done always loads into free play (restore()); the screen opens once if it was never seen.
   - Replay a lesson (replayLesson(n)): the real save is kept, whole, in S.replay.home (JSON); the game is set up as it is at the start
     of lesson n (every earlier lesson's skip, as the intro's skip links do) and lesson n's own start() runs. When lesson n is completed
     (lessonCompleted(n)), its completion screen's "Start Lezione n+1" (and the guide's) become "Back to free play", and a small screen
     follows: back to free play (replayHome(): the home save again, with the Studio record, the verbs drill and the sentences carried over).
     Hard mode (docs/features/study-and-hard-mode.md part 2) is not built: the list shows it as coming soon.
   Tests: __dbg().unit = { open, view, replay:{ n, finished, shown } | null, free }; __debug.unitComplete(), __debug.replay(n). */
let unitAfterIntro = false;
const UNIT = { view:'main' };
const unitIsOpen = () => modalOpen && sheet.classList.contains('unit');
const inVenice = () => ['santalucia', 'ferrovia', 'vaporetto'].includes(S.scene);
function unitStats(){
  const done = QUESTS.filter(q => (questPeek(q.id) || {}).done).length;
  return { words:vocabCount(), quests:done, questsAll:QUESTS.length, stamps:passportStamps(), sentences:S.sentences };
}
function openUnitComplete(view = 'main'){
  if (S.l15){ S.l15.unitSeen = true; save(); }
  UNIT.view = view;
  if (dialogOpen) closeDialog();
  openModal('unit');
  unitRender();
  /* still in Venice: closing the screen brings it back (choose free play, or a lesson to replay) */
  modalAfter = () => {
    if (S.replay && S.replay.finished){ setTimeout(() => { if (S.replay && !modalOpen) replayHome(); }, 50); return; }
    if (inVenice() && S.l15 && !S.l15.free && !S.replay) setTimeout(() => { if (!modalOpen) openUnitComplete(UNIT.view); }, 250);
  };
}
function unitRender(){
  const T = unitStats(), L = S.l15 || {};
  const stamps = T.stamps.map(s => `<span class="u-stamp" style="--c:${esc(s.color || '#1c3d8f')}" title="${esc(s.title_it)} · ${esc(s.title_en)}">${esc(s.icon || '★')}</span>`).join('');
  const said = (L.said || []).slice(-6).map(s => `<p>«${esc(s)}»</p>`).join('');
  if (UNIT.view === 'replay'){
    const rows = LESSONS.filter(c => !c.placeholder && c.n <= 15).map(c => `<li class="u-lesson"><span class="u-n">${c.n}</span><span class="u-t"><b>${esc(c.title)}</b><small>${esc(c.sub || '')}</small></span>
        <span class="u-go"><button class="btn primary" data-replay="${c.n}">Replay</button><button class="btn" disabled title="Hard mode: no tiles, typed answers. Coming soon.">Hard mode · soon</button></span></li>`).join('');
    sheet.innerHTML = `<div class="sheet-head"><div><p class="kicker">Unit 1 · Padova → Venezia</p><h2><em>Replay a lesson</em></h2>
        <p class="sub">Play any lesson again from its start. Your own game is kept: when the lesson is done, you come back to free play.</p></div>
        <button class="x" data-close aria-label="Close">×</button></div>
      <div class="sheet-body"><ol class="u-lessons">${rows}</ol>
        <p class="note"><b>Hard mode</b> (the same lesson with no tile bank: you type every answer) is coming soon.</p>
        <div class="cta"><button class="btn" data-unit="back">← Back</button></div></div>`;
    return;
  }
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Unità 1 completata</p><h2><em>Benvenuti a Venezia!</em></h2><p class="sub">Unit 1 · From Padova to Venezia, zero to upper A1</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>Fifteen lessons ago you couldn't order a coffee. This morning you found the water bus, bought the tickets, had breakfast for two, chatted
        with a Venetian, and rode the vaporetto down the Grand Canal to San Marco, translating for a friend all the way. <b>Bravo!</b></p>
      <div class="stats">
        <div><b>${T.words}</b><span>words and phrases in your dictionary</span></div>
        <div><b>${T.quests} / ${T.questsAll}</b><span>quests done in Padova</span></div>
        <div><b>${T.stamps.length}</b><span>stamps in your passport</span></div>
        <div><b>${T.sentences}</b><span>sentences said in Italian</span></div>
      </div>
      ${stamps ? `<div class="u-stamps" aria-label="Your passport's stamps">${stamps}</div>` : ''}
      <h3>What next?</h3>
      <div class="u-choices">
        <button class="u-choice primary" data-unit="free"><b>Free play in Padova</b><span>Back to the piazza: every place, the quests you haven't done, Studio, fast travel.</span></button>
        <button class="u-choice" data-unit="replay"><b>Replay a lesson</b><span>Any lesson, from its start. Your game is kept. <i>Hard mode: coming soon.</i></span></button>
        <div class="u-choice soon" aria-disabled="true"><b>Unit 2 · Venezia</b><span>Margaret, Biscuit, il signor Bepi… and the calli of Venice. <i>Coming soon.</i></span></div>
      </div>
      ${said ? `<h3>This morning, in your Italian</h3><div class="l13-said">${said}</div>` : ''}
    </div>`;
}
document.addEventListener('click', e => {
  if (e.target.closest('[data-l15unit]')){ e.preventDefault(); openUnitComplete(); return; }
  if (!unitIsOpen()) return;
  const u = e.target.closest('[data-unit]');
  if (u){ const k = u.dataset.unit;
    if (k === 'free') unitFreePlay();
    else if (k === 'replay'){ UNIT.view = 'replay'; unitRender(); }
    else if (k === 'back'){ UNIT.view = 'main'; unitRender(); }
    return; }
  const r = e.target.closest('[data-replay]'); if (r) replayLesson(+r.dataset.replay);
});

/* ---------- free play ---------- */
/* the state of free play after the unit (also what a save in l15-done loads into) */
function l15ToFreeState(){
  const L = S.l15; if (!L) return;
  Object.assign(L, { free:true, follow:false, carried:false, done:true, arrived:true });
  S.tut = 'l15-done';
  NPC.margaret.carryDog = false; dogFollow('biscuit', null);
  if (S.crowd) L15_CROWD.forEach(id => { delete S.crowd[id]; });
  if (typeof bagRemove === 'function') bagRemove('l15-biglietti');
  Object.assign(VEN, { gate:false, boat:'away', boatX:0 });
  S.daytime = 'afternoon';
  if (S.l12) S.l12.free = true;
  if (inVenice()){ S.scene = 'piazza'; player.x = 480; player.y = 520; }
  save();
}
function unitFreePlay(){
  if (S.replay){ replayHome(); return; }
  modalAfter = null;
  l15ToFreeState();
  if (cutsceneOn()) cutsceneEnd();
  closeModal();
  travelTo('piazza', { x:480, y:520 }, 'Padova', 'Free play · il pomeriggio');
  setTimeout(() => toast('<b>Free play.</b> The quests you haven\'t done are open (the phone, <kbd>P</kbd>), and Studio (<kbd>T</kbd>) has every lesson\'s words.'), 1900);
}

/* ---------- replaying a lesson ---------- */
function replayLesson(n){
  if (!LESSONS[n - 1] || !(n <= 6 || (hookFor(n) && hookFor(n).start))) return;
  const home = S.replay ? S.replay.home : JSON.stringify({ ...S, px:player.x, py:player.y });
  const keep = { study:S.study, grammar:S.grammar, numbers:S.numbers, sound:S.sound };
  modalAfter = null;
  if (modalOpen) closeModal();
  if (dialogOpen) closeDialog();
  if (cutsceneOn()) cutsceneEnd();
  S = FRESH(); S.playerName = JSON.parse(home).playerName;
  Object.keys(keep).forEach(k => { if (keep[k] !== undefined) S[k] = keep[k]; });
  PX = { 1:freshPX(), 2:freshPX(), 3:freshPX(), 4:freshPX(), 5:freshPX(), 6:freshPX() }; hbTab = 'lesson'; hbLesson = n; MAP = { key:null, path:[[2,4]], status:null };
  player.x = 480; player.y = 520;
  for (let k = 1; k < n; k++){ const f = BUILTIN_SKIPS[k - 1] || (hookFor(k) && hookFor(k).skip); if (f) f(); }
  S.replay = { n, home, finished:false, shown:false };
  save(); renderHUD(); lastGuide = '';
  const starts = { 2:startLesson2, 3:startLesson3, 4:startLesson4, 5:startLesson5, 6:startLesson6 };
  if (n === 1) travelTo('piazza', { x:480, y:520 }, 'Lezione 1', 'Primi incontri · a replay');
  else if (starts[n]) starts[n]();
  else hookFor(n).start();
  setTimeout(() => toast(`<b>Replay · Lezione ${n}.</b> When it is done, you go back to free play.`), 2100);
}
/* back to the real game (free play), with what was learned on the way */
function replayHome(){
  const R = S.replay; if (!R) return;
  let home; try { home = JSON.parse(R.home); } catch(e){ home = null; }
  const carry = { study:S.study, grammar:S.grammar, numbers:S.numbers, sound:S.sound }, said = S.sentences || 0;
  modalAfter = null;
  if (modalOpen) closeModal();
  if (dialogOpen) closeDialog();
  if (cutsceneOn()) cutsceneEnd();
  if (!home){ delete S.replay; save(); return; }
  S = Object.assign(FRESH(), home);
  Object.keys(carry).forEach(k => { if (carry[k] !== undefined) S[k] = carry[k]; });
  S.sentences = (home.sentences || 0) + said;
  delete S.replay; S.replayDone = R.n;
  player.x = 480; player.y = 520;
  restoreAux();
  if (S.l15) l15ToFreeState();
  travelTo('piazza', { x:480, y:520 }, 'Padova', 'Free play · back from the replay');
  setTimeout(() => toast(`<b>Lezione ${R.n}</b> replayed. Back to free play.`), 1900);
}
/* the replayed lesson done: its "Start Lezione n+1" buttons go back to free play, then a small screen says so */
function replayWatch(){
  const R = S.replay; if (!R || introOpen) return;
  if (!lessonCompleted(R.n)){ R.doneAt = 0; return; }
  if (!R.finished){ R.finished = true; save(); }
  if (!R.doneAt) R.doneAt = performance.now();
  if (modalOpen){
    sheet.querySelectorAll('[id^="goL"], [data-action^="l"]').forEach(b => {
      if (b.dataset.replayPatched) return;
      const nb = b.cloneNode(false); nb.textContent = 'Back to free play'; nb.dataset.replayPatched = '1'; nb.removeAttribute('id'); nb.removeAttribute('data-action');
      nb.addEventListener('click', ev => { ev.stopPropagation(); replayHome(); });
      b.replaceWith(nb);
    });
    return;
  }
  if (dialogOpen || cutsceneOn() || traveling || pickOpen || R.shown || performance.now() - R.doneAt < 1500) return;
  R.shown = true; save();
  openModal('unit replaydone');
  sheet.innerHTML = `<div class="sheet-head"><div><p class="kicker">Replay complete</p><h2><em>Lezione ${R.n} · ${esc(LESSONS[R.n - 1].title)}</em></h2>
      <p class="sub">Well played! Your own game is waiting where you left it.</p></div></div>
    <div class="sheet-body"><div class="cta"><button class="btn" data-replay-another>Replay another lesson</button><button class="btn primary" data-replay-home>Back to free play</button></div></div>`;
  modalAfter = () => { if (S.replay && S.replay.finished) setTimeout(() => { if (S.replay && !modalOpen) replayHome(); }, 50); };
}
setInterval(replayWatch, 500);
document.addEventListener('click', e => {
  if (e.target.closest('[data-replay-home]')){ replayHome(); return; }
  if (e.target.closest('[data-replay-another]')){ const home = S.replay; modalAfter = null; closeModal(); openUnitComplete('replay'); return; }
  /* the guide's "Start Lezione n+1" while a replayed lesson is done: back to free play instead */
  const a = e.target.closest('[data-action^="l"]');
  if (a && S.replay && S.replay.finished){ e.stopImmediatePropagation(); e.preventDefault(); replayHome(); }
}, true);

function unitDbg(){
  return { open:unitIsOpen(), view:unitIsOpen() ? (sheet.classList.contains('replaydone') ? 'replaydone' : UNIT.view) : null,
    replay:S.replay ? { n:S.replay.n, finished:!!S.replay.finished, shown:!!S.replay.shown } : null, free:!!(S.l15 && S.l15.free), replayDone:S.replayDone || null };
}
Object.assign(window.__debug, { unitComplete(){ openUnitComplete(); }, replay(n){ replayLesson(n); } });
