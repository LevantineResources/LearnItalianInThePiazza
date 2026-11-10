/* Display queue (waits for speech) and the transcript lines: npc, me, companion, system, hints, choices. */

/* ---------- display queue ----------
   Everything that appears in the conversation goes through this queue, and each item
   waits until the Italian voice has finished speaking the previous line. */
const lineQ = []; let qRunning = false;
function enqueue(fn){ lineQ.push(fn); pump(); }
function pump(){
  if (qRunning) return;
  qRunning = true;
  let waited = false;
  const tick = () => {
    if (!lineQ.length){ qRunning = false; return; }
    if (speechBusy()){ waited = true; setTimeout(tick, 120); return; }
    if (waited){ waited = false; setTimeout(tick, 350); return; }
    const fn = lineQ.shift();
    try { fn(); } catch(e){ console.error(e); }
    tick();
  };
  tick();
}
const displayBusy = () => lineQ.length > 0 || speechBusy();
function clearDisplayQueue(){ lineQ.length = 0; try { if (hasTTS) speechSynthesis.cancel(); } catch(e){} speakDeadline = 0; }

/* ---------- transcript ---------- */
const scrollTr = () => requestAnimationFrame(() => { tr.scrollTop = tr.scrollHeight; });
/* The dialog's layout (styles.css, #dialog): when the foot grows (the notepad, the list, a hint) the transcript shrinks.
   It stays scrolled to the newest line unless the player has scrolled up to read. */
let trStick = true;
tr.addEventListener('scroll', () => { trStick = tr.scrollHeight - tr.scrollTop - tr.clientHeight < 24; }, { passive:true });
/* The foot (#dlgFoot: hint, tiles, typer, notepad, choices) scrolls itself only when it can't fit (a short window). Then
   the control the player needs now (the notepad, the choices, the typer, the Dillo button) is scrolled into view
   whenever the foot changes: footReveal(). Only the foot is scrolled (never the stage or the page). */
const dlgFoot = $('#dlgFoot');
function footTarget(){
  const pad = $('#npad') || $('#nbAsk'); if (pad) return pad;     // (the notepad, or the notebook's question: ui/notebook.js)
  if (!choices.hidden) return choices;
  if (!typer.hidden) return typer;
  if (!builder.hidden) return builder.querySelector('.actions');
  return null;
}
function footReveal(el = footTarget()){
  if (!el || !dialogOpen || dlgFoot.scrollHeight <= dlgFoot.clientHeight + 1) return;
  const f = dlgFoot.getBoundingClientRect(), r = el.getBoundingClientRect();
  if (r.bottom > f.bottom - 1) dlgFoot.scrollTop += Math.min(r.bottom - f.bottom + 6, r.top - f.top);   // (its top stays in view)
  else if (r.top < f.top) dlgFoot.scrollTop -= f.top - r.top + 6;
}
{
  let raf = 0;
  const later = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (trStick) tr.scrollTop = tr.scrollHeight; footReveal(); }); };
  if (window.ResizeObserver){ const ro = new ResizeObserver(later); ro.observe(tr); ro.observe(dlgFoot); ro.observe(dlg); }
  new MutationObserver(later).observe(dlgFoot, { childList:true, subtree:true, attributes:true, attributeFilter:['hidden'] });
}
/* npcLine(it, en, opt): opt.speaker, opt.english, opt.companion, opt.forceKnown, opt.queue, opt.rate,
   opt.listen: a listening line. It is spoken, but its text and English gloss stay hidden behind a
   "Ascolta di nuovo" button (replays more slowly) until revealListen() is called. */
const npcLine = (...a) => enqueue(() => { if (dialogOpen && convo) _npcLine(...a); });
const LISTEN_LBL = 'Ascolta di nuovo';
const listenRate = r => Math.min(0.7, (r || 0.88) * 0.85);
function _npcLine(it, en, opt = {}){
  const sp = opt.speaker || convo.npc;
  const el = document.createElement('div');
  /* without a voice (no speech synthesis, or the voice turned off) a listening line is shown as text */
  const listen = !!opt.listen && !opt.english && hasTTS && S.sound;
  el.className = 'line npc' + (opt.english ? ' english' : '') + (opt.companion ? ' companion' : '') + (opt.listen ? ' listen' : '') + (opt.listen && !listen ? ' revealed' : '');
  const known = opt.companion || opt.forceKnown || (sp === convo.npc && convo.known);
  const plate = known ? `<div class="nameplate">${esc(sp.name)}</div>` : '<div class="nameplate unknown" title="You don\'t know their name yet">???</div>';
  const isQuiet = it.replace(/…/g, '').trim() === '';
  const tools = [];
  if (!opt.english && !isQuiet && hasTTS) tools.push(`<button class="mini" data-say="${esc(it)}" aria-label="Hear it again"${listen ? ' hidden' : ''}>${SPK}</button>`);
  if (en) tools.push(`<button class="mini" data-en aria-label="Show English translation"${listen ? ' hidden' : ''}>EN</button>`);
  const ph = listen ? `<button class="listen-btn" data-listen="${esc(it)}" data-rate="${listenRate(opt.rate)}" data-pitch="${sp.pitch || 1}">${SPK}<span>${LISTEN_LBL}</span></button>
      <span class="listen-ph" aria-label="Text hidden: listen">${it.split(/\s+/).filter(Boolean).map(w => `<i style="width:${Math.min(9, w.length) * 0.62 + 0.4}em"></i>`).join('')}</span>` : '';
  el.innerHTML = plate + `<div class="bubble"><div class="row">${ph}<p class="it"${listen ? ' hidden' : ''}>${esc(it)}</p>${tools.join('')}</div>${en ? `<p class="en" hidden>${esc(en)}</p>` : ''}</div>`;
  tr.appendChild(el); scrollTr();
  if (!opt.english && !isQuiet) speak(it, sp.pitch || 1, !!opt.queue, opt.rate || 0.88);
  /* the NPC's last line (any engine: an opening, a hook's line), for "Ancora una volta, per favore" / Può ripetere? */
  if (!opt.english && !opt.companion && !isQuiet && sp === convo.npc) convo.lastNpcText = { it, en, listen };
}
/* reveal the most recent listening line (or every hidden one with { all:true }): text, speaker and EN buttons.
   Goes through the display queue, so it waits for the line to appear and for the voice to finish. */
const revealListen = (opt = {}) => enqueue(() => _revealListen(opt));
function _revealListen(opt = {}){
  const ls = [...tr.querySelectorAll('.line.listen')];
  (opt.all ? ls : ls.slice(-1)).filter(el => !el.classList.contains('revealed')).forEach(el => {
    el.classList.add('revealed');
    el.querySelectorAll('.listen-btn, .listen-ph').forEach(x => x.remove());
    el.querySelectorAll('.it, .mini').forEach(x => x.hidden = false);
    if (convo && convo.lastNpcText && convo.lastNpcText.listen && el === ls[ls.length - 1]) convo.lastNpcText.listen = false;
  });
  scrollTr();
}
const companionLine = t => npcLine(t, null, { english:true, companion:true, speaker:convo.companion });
const meLine = (...a) => enqueue(() => { if (dialogOpen) _meLine(...a); });
function _meLine(text, opt = {}){
  const el = document.createElement('div');
  el.className = 'line me' + (opt.english ? ' english' : '') + (opt.miss ? ' miss' : '');
  el.innerHTML = `<div class="nameplate">${esc(S.playerName)}</div><div class="bubble"><p class="it">${esc(text)}</p></div>`;
  tr.appendChild(el); scrollTr();
}
const sysLine = (...a) => enqueue(() => { if (dialogOpen) _sysLine(...a); });
function _sysLine(html){
  const el = document.createElement('div'); el.className = 'line sys'; el.innerHTML = html;
  tr.appendChild(el); scrollTr();
}
const showHint = (...a) => enqueue(() => { if (dialogOpen) _showHint(...a); });
function _showHint(html, label = 'Suggerimento'){
  hintEl.innerHTML = `<span class="lbl">${label}</span>` + html; hintEl.hidden = false; scrollTr();
  if (window.__hintLog) window.__hintLog.push(hintEl.textContent);        // tests: every hint shown (tests/l08-mi-piace.js)
}
const showChoices = (...a) => enqueue(() => { if (dialogOpen) _showChoices(...a); });
function _showChoices(list){
  choices.innerHTML = '';
  list.forEach(c => {
    const b = document.createElement('button');
    b.className = 'btn' + (c.primary ? ' primary' : '') + (c.cls ? ' ' + c.cls : '');
    b.textContent = c.label; b.onclick = () => c.fn(b); choices.appendChild(b);
  });
  choices.hidden = false;
  scrollTr();
  if (builder.hidden) (choices.querySelector('.primary') || choices.querySelector('button'))?.focus({ preventScroll:true });
}
tr.addEventListener('click', e => {
  const l = e.target.closest('[data-listen]'); if (l){ speak(l.dataset.listen, +l.dataset.pitch || 1, false, +l.dataset.rate || 0.7); return; }
  const s = e.target.closest('[data-say]'); if (s){ speak(s.dataset.say, convo ? convo.npc.pitch : 1); return; }
  const en = e.target.closest('[data-en]'); if (en){ const p = en.closest('.bubble').querySelector('.en'); if (p) p.hidden = !p.hidden; }
});
