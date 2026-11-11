/* A route traced on a small map inside the conversation (first used by Unit 2's Lesson 1: the gondolier's way to the hotel). Padova
   traces its routes on its own city map (units/padova/world/map.js, Lessons 3, 5, 7…) and dictates them on the grid of the dictated
   map (world/dictmap.js, Lesson 9); this is the same idea for any picture: a map with crossings (nodes) joined by streets (edges).
   The player draws the route from its start, crossing by crossing: a tap on the next crossing (they pulse), or a drag across
   them; a tap on the crossing before takes a step back. "È giusto?" checks it against the route the person gave.

   mountTraceMap(spec) shows it beside the transcript (the dictated map's place: #dialog.with-map, .dlgmap; above it on phones).
     spec = { title, sub?, w, h (the picture's size), base (SVG markup drawn under everything: the streets, the water, the names),
       nodes:{ id:{ x, y, label?, side? } }, edges:[[a, b], …], start (a node id), route:[ids] (from the start: the right way),
       accept?:[ids] (other right last nodes), wrong(i, id, path) → html (a step that leaves the route: what the directions said
       there, never the answer's Italian), notThere?, tooFar?, onOK(path), onTry?(ok, path, msg), done? (drawn finished) }
   unmountTraceMap() (closeDialog does it), traceMapNote(html, kind), traceTry() (the check), traceStep(id) (a tap on a node).
   Tests: __dbg().trace = { on, mounted, path, next, ok, tries, note }; __debug.trace(ids) taps those nodes in turn. */
let TRACE = null;
function mountTraceMap(spec){
  TRACE = { ...spec, path:[spec.start], ok:!!spec.done, tries:0, note:null, drag:false };
  if (spec.done) TRACE.path = spec.route.slice();
  if (!dialogOpen) return TRACE;
  let el = $('#dlgTrace');
  if (!el){ el = document.createElement('div'); el.id = 'dlgTrace'; el.className = 'dlgmap trace'; dlg.insertBefore(el, tr); }
  dlg.classList.add('with-map');
  renderTraceMap(); scrollTr();
  return TRACE;
}
function unmountTraceMap(){ const el = $('#dlgTrace'); if (el){ el.remove(); if (!$('#dlgMap')) dlg.classList.remove('with-map'); } TRACE = null; }
const traceAdj = id => TRACE.edges.filter(e => e.includes(id)).map(e => e[0] === id ? e[1] : e[0]);
const traceNext = () => { if (!TRACE || TRACE.ok) return []; const P = TRACE.path, last = P[P.length - 1], prev = P[P.length - 2]; return traceAdj(last).filter(n => n !== prev && !P.includes(n)); };
function traceMapNote(html, kind){ if (!TRACE) return; TRACE.note = html ? { html, kind:kind || '' } : null; renderTraceMap(); }
/* a tap (or a drag) on a crossing: the next one goes on the route, the one before takes a step back */
function traceStep(id){
  if (!TRACE || TRACE.ok) return false;
  const P = TRACE.path;
  if (P.length > 1 && id === P[P.length - 2]){ P.pop(); TRACE.note = null; renderTraceMap(); return true; }
  if (!traceNext().includes(id)) return false;
  P.push(id); TRACE.note = null; renderTraceMap();
  return true;
}
/* the check: the route so far against the one given */
function traceCheck(){
  const T = TRACE, P = T.path, R = T.route;
  for (let i = 1; i < R.length; i++){
    if (!P[i]) return { ok:false, msg:T.notThere || "You're not there yet. Keep following the directions." };
    if (P[i] !== R[i]) return { ok:false, msg:(T.wrong && T.wrong(i, P[i], P)) || "That's not the way you were told. Listen to the directions again, one step at a time." };
  }
  if (P.length === R.length || (P.length === R.length + 1 && (T.accept || []).includes(P[R.length]))) return { ok:true };
  return { ok:false, msg:T.tooFar || 'You went too far. Stop where the directions end.' };
}
function traceTry(){
  if (!TRACE || TRACE.ok) return null;
  const r = traceCheck(); TRACE.tries++;
  if (r.ok){ TRACE.ok = true; TRACE.note = { html:'<b>Sì!</b> That\'s the way.', kind:'good' }; }
  else TRACE.note = { html:r.msg, kind:'bad' };
  renderTraceMap();
  if (TRACE.onTry) TRACE.onTry(r.ok, TRACE.path.slice(), r.msg);
  if (r.ok && TRACE.onOK) TRACE.onOK(TRACE.path.slice());
  return r;
}
function traceSvg(){
  const T = TRACE, N = T.nodes, nx = traceNext(), P = T.path;
  const pts = P.map(id => `${N[id].x},${N[id].y}`).join(' ');
  let s = `<svg class="mapsvg tracesvg" viewBox="0 0 ${T.w} ${T.h}" role="img" aria-label="${esc(T.title || 'Map')}">${T.base || ''}`;
  if (P.length > 1) s += `<polyline points="${pts}" fill="none" stroke="#0f2260" stroke-width="11" stroke-linejoin="round" stroke-linecap="round"/>
      <polyline points="${pts}" fill="none" stroke="${T.ok ? '#3f9a62' : '#f4b928'}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>`;
  Object.entries(N).forEach(([id, n]) => {
    const next = nx.includes(id), undo = !T.ok && P.length > 1 && id === P[P.length - 2], on = P.includes(id);
    s += `<circle data-trace="${id}" cx="${n.x}" cy="${n.y}" r="${next ? 11 : on ? 7 : 5}" class="node${next ? ' next' : ''}${undo ? ' undo' : ''}${on ? ' on' : ''}"/>`;
    if (n.label) s += `<text x="${n.x}" y="${n.y + (n.side === 'up' ? -14 : 22)}" text-anchor="middle" class="mlm tr-lbl">${esc(n.label)}</text>`;
  });
  const end = N[P[P.length - 1]];
  s += `<circle cx="${end.x}" cy="${end.y}" r="6" fill="#0f2260" pointer-events="none"/>`;
  return s + '</svg>';
}
function renderTraceMap(){
  const el = $('#dlgTrace'); if (!el || !TRACE) return;
  const T = TRACE, n = T.note;
  el.innerHTML = `<div class="dm-top"><p class="dm-title">${T.title || 'Trace the way'}</p>
      <button class="tile dm-undo" data-trace-undo ${T.path.length > 1 && !T.ok ? '' : 'disabled'} title="Take the last step back">↶ Cancella</button></div>
    ${T.sub ? `<p class="tr-sub">${T.sub}</p>` : ''}
    <div class="dm-svg">${traceSvg()}</div>
    <div class="tr-foot"><p class="dm-status ${n ? n.kind : ''}">${n ? n.html : T.ok ? '' : 'Tap the crossings in order (or drag along the way), then check.'}</p>
      ${T.ok ? '' : `<button class="btn primary" data-trace-check ${T.path.length > 1 ? '' : 'disabled'}>È giusto?</button>`}</div>`;
}
/* taps and drags on the map */
{
  const nodeAt = e => { const c = e.target.closest && e.target.closest('[data-trace]'); if (c) return c.dataset.trace;
    const svg = $('#dlgTrace svg'); if (!svg || !TRACE) return null; const r = svg.getBoundingClientRect(), k = TRACE.w / r.width;
    const x = (e.clientX - r.left) * k, y = (e.clientY - r.top) * k;
    let best = null, bd = 22 * Math.max(1, k * 0.8); Object.entries(TRACE.nodes).forEach(([id, n]) => { const d = Math.hypot(n.x - x, n.y - y); if (d < bd){ bd = d; best = id; } }); return best; };
  document.addEventListener('pointerdown', e => {
    if (!TRACE || !e.target.closest || !e.target.closest('#dlgTrace')) return;
    if (e.target.closest('[data-trace-undo]')){ if (!convoBusy){ const P = TRACE.path; if (P.length > 1 && !TRACE.ok){ P.pop(); TRACE.note = null; renderTraceMap(); } } return; }
    if (e.target.closest('[data-trace-check]')){ if (!convoBusy) traceTry(); return; }
    if (!e.target.closest('svg')) return;
    const id = nodeAt(e); if (id) traceStep(id);
    TRACE.drag = true; e.preventDefault();
  });
  document.addEventListener('pointermove', e => { if (!TRACE || !TRACE.drag) return; const id = nodeAt(e); if (id && traceNext().includes(id)) traceStep(id); });
  document.addEventListener('pointerup', () => { if (TRACE) TRACE.drag = false; });
}
dbgField('trace', () => TRACE ? { on:true, mounted:!!$('#dlgTrace'), path:TRACE.path.slice(), next:traceNext(), ok:TRACE.ok, tries:TRACE.tries, note:TRACE.note ? TRACE.note.html : null } : { on:false });
Object.assign(window.__debug, { trace(ids){ (ids || []).forEach(id => traceStep(id)); return TRACE ? TRACE.path.slice() : null; }, traceTry:() => traceTry() });
