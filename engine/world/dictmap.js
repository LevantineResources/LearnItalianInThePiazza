/* The dictated map: give someone directions, and a cursor walks them on a street grid inside the conversation. */

const nodeEq = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
/* =========================================================
   THE DICTATED MAP (first used in Padova's Lesson 9, reusable for any street grid, e.g. Venice)
   The player gives someone directions and a cursor (a node + a heading) walks them on the map, inside the
   conversation: the route grows sentence by sentence. The lesson turns direction intents into mapStep() calls.

   mapDictStart(cfg)   cfg = { start:[c,r], heading:'N'|'E'|'S'|'W', area:[[c,r],…], areaLabel?, grid?, steps? }
                       grid: default the unit's (UNIT.mapGrid(): Padova's city map, cityGrid()). A grid is { cols, rows, px([c,r]) → [x,y], step:[dx,dy],
                       blocked(a, b) → null | 'edge' | 'river' | any reason, landmarks:[{ t, nodes }], base() → svg, view, label }.
                       steps: earlier steps to replay (mapDictState().steps, e.g. from a save).
   mapStep(op)         op = { k:'straight' }                   to the next crossroads
                            { k:'straightUntil' }              on until the edge, the river or a landmark you weren't already at
                            { k:'turn', dir:'L'|'R', move? }   turn, then (unless move:false) on to the next crossroads
                            { k:'nth', n, dir?, move? }        n crossroads on, then turn (and on to the next one)
                            { k:'until', lm:'<landmark type>' } on until that landmark
                       → { ok, op, path:[[c,r],…] (start included), reason?, stop?, arrived }. A step that can't be done
                       (ok:false; reason 'edge', 'river', 'nolandmark') leaves the cursor where it was; the attempt is
                       drawn red (MAPD.bad) until the next step or undo.
   mapUndo()           takes the last step back (→ the step, or null)     mapArrived()  the cursor is in the area
   mapHintStep()       the first op of a shortest way from the cursor to the area (for "try this" hints)
   mapDictState()      { node, heading, steps:[{ op }] }: save it, pass steps back to mapDictStart to restore
   mountDictMap(o)     shows the map inside the open conversation (#dlgMap, #dialog.with-map: beside the transcript on
                       wide screens, above it on phones). o = { title, undo?:fn } (undo adds a "Cancella" button).
   mapDictNote(html, kind)  the status line under the title (kind: 'good' | 'bad' | ''); renderDictMap() redraws.
   unmountDictMap()    closeDialog calls it.    mapDictDbg() → __dbg().dict */
const HEADINGS = { N:[0, -1], E:[1, 0], S:[0, 1], W:[-1, 0] };
const TURN = { L:{ N:'W', W:'S', S:'E', E:'N' }, R:{ N:'E', E:'S', S:'W', W:'N' } };
const HEAD_ANGLE = { N:-90, E:0, S:90, W:180 };
let MAPD = null;
function mapDictStart(cfg){
  MAPD = { G:cfg.grid || unitHook('mapGrid'), start:[...cfg.start], heading0:cfg.heading, node:[...cfg.start], heading:cfg.heading,
    area:cfg.area.map(n => [...n]), areaLabel:cfg.areaLabel || '', steps:[], bad:null, ui:null, note:null };
  (cfg.steps || []).forEach(s => mapStep(s.op));
  MAPD.bad = null;
  return MAPD;
}
const mapDictState = () => MAPD ? { node:[...MAPD.node], heading:MAPD.heading, steps:MAPD.steps.map(s => ({ op:{ ...s.op } })) } : null;
const mapArrived = (D = MAPD) => !!D && D.area.some(n => nodeEq(n, D.node));
/* the landmarks at a node (of one type, or any) */
const mapLmAt = (node, t) => MAPD.G.landmarks.filter(l => (!t || l.t === t) && l.nodes.some(n => nodeEq(n, node)));
function mapStep(op){
  const D = MAPD, G = D.G;
  let node = D.node, h = D.heading, stop = null;
  const path = [node];
  const fail = reason => { D.bad = { path:path.slice(), h, reason }; return { ok:false, op, path, reason, arrived:mapArrived() }; };
  /* one crossroads on: null when done, else the reason it can't be */
  const step = () => { const [dx, dy] = HEADINGS[h], nb = [node[0] + dx, node[1] + dy], why = G.blocked(node, nb); if (why) return why; node = nb; path.push(nb); return null; };
  let why;
  if (op.k === 'straight'){ if ((why = step())) return fail(why); }
  else if (op.k === 'straightUntil'){
    const seen = new Set(mapLmAt(node));                     // landmarks you were already standing at don't stop you
    if ((why = step())) return fail(why);
    for (;;){
      const lm = mapLmAt(node).find(l => !seen.has(l));
      if (lm){ stop = 'landmark:' + lm.t; break; }
      const [dx, dy] = HEADINGS[h], w = G.blocked(node, [node[0] + dx, node[1] + dy]);
      if (w){ stop = w; break; }
      step();
    }
  }
  else if (op.k === 'turn'){ h = TURN[op.dir][h]; if (op.move !== false && (why = step())) return fail(why); }
  else if (op.k === 'nth'){
    for (let i = 0; i < op.n; i++) if ((why = step())) return fail(why);
    if (op.dir){ h = TURN[op.dir][h]; if (op.move !== false && (why = step())) return fail(why); }
  }
  else if (op.k === 'until'){
    if ((why = step())) return fail(why);
    while (!mapLmAt(node, op.lm).length) if (step()) return fail('nolandmark');
    stop = 'landmark:' + op.lm;
  }
  else return fail('unknown');
  D.steps.push({ op:{ ...op }, path, from:D.heading, heading:h });
  D.node = node; D.heading = h; D.bad = null;
  return { ok:true, op, path, stop, arrived:mapArrived() };
}
function mapUndo(){
  const D = MAPD; if (!D) return null;
  D.bad = null;
  const s = D.steps.pop(); if (!s) return null;
  D.node = s.path[0]; D.heading = s.from;
  return s;
}
/* breadth-first over (node, heading): straight on, or turn left / right and go one crossroads */
function mapHintStep(){
  const D = MAPD; if (!D || mapArrived()) return null;
  const key = (n, h) => n.join(',') + h, seen = new Set([key(D.node, D.heading)]);
  let q = [{ n:D.node, h:D.heading, first:null }];
  while (q.length){
    const nq = [];
    for (const s of q) for (const op of [{ k:'straight' }, { k:'turn', dir:'L' }, { k:'turn', dir:'R' }]){
      const h = op.k === 'turn' ? TURN[op.dir][s.h] : s.h, [dx, dy] = HEADINGS[h], nb = [s.n[0] + dx, s.n[1] + dy];
      if (D.G.blocked(s.n, nb) || seen.has(key(nb, h))) continue;
      const first = s.first || op;
      if (D.area.some(a => nodeEq(a, nb))) return first;
      seen.add(key(nb, h)); nq.push({ n:nb, h, first });
    }
    q = nq;
  }
  return null;
}
function mapDictSvg(){
  const D = MAPD; if (!D) return '';
  const G = D.G, P = n => G.px(n), pts = A => A.map(n => P(n).join(',')).join(' ');
  let s = `<svg class="mapsvg dictsvg" viewBox="${G.view}" role="img" aria-label="${esc(G.label)}: the route so far">${G.base()}`;
  const xs = D.area.map(n => P(n)[0]), ys = D.area.map(n => P(n)[1]);
  const ax = Math.min(...xs) - 32, ay = Math.max(2, Math.min(...ys) - 32);
  s += `<rect class="dm-area${mapArrived() ? ' on' : ''}" x="${ax}" y="${ay}" width="${Math.max(...xs) + 32 - ax}" height="${Math.max(...ys) + 32 - ay}" rx="22"/>`;
  for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++){ const [x, y] = P([c, r]); s += `<circle cx="${x}" cy="${y}" r="3.5" class="dm-dot"/>`; }
  const full = [D.start, ...D.steps.flatMap(st => st.path.slice(1))];
  if (full.length > 1) s += `<polyline points="${pts(full)}" class="dm-route-o"/><polyline points="${pts(full)}" class="dm-route"/>`;
  if (D.bad){
    const B = D.bad.path.map(P), [lx, ly] = B[B.length - 1], [dx, dy] = HEADINGS[D.bad.h];
    const ex = lx + dx * G.step[0] * 0.55, ey = ly + dy * G.step[1] * 0.55;
    s += `<polyline points="${B.map(p => p.join(',')).join(' ')} ${ex},${ey}" class="dm-bad"/>
      <g class="dm-x" transform="translate(${ex} ${ey})"><circle r="11"/><path d="M-5 -5L5 5M5 -5L-5 5"/></g>`;
  }
  const [sx, sy] = P(D.start);
  s += `<g class="dm-start"><circle cx="${sx}" cy="${sy}" r="8"/></g>`;
  D.steps.forEach((st, i) => {
    if (i === D.steps.length - 1) return;                   // the cursor stands on the last one
    const [x, y] = P(st.path[st.path.length - 1]);
    s += `<g class="dm-num" transform="translate(${x + 13} ${y - 13})"><circle r="9"/><text y="4" text-anchor="middle">${i + 1}</text></g>`;
  });
  const [cx, cy] = P(D.node);
  s += `<g class="dm-cursor" transform="translate(${cx} ${cy}) rotate(${HEAD_ANGLE[D.heading]})">
      <circle r="21" class="dm-halo"/><path d="M17 -8 L30 0 L17 8 Z" class="dm-arrow"/>
      <rect x="-15" y="-8" width="9" height="16" rx="3.5" class="dm-pack"/><ellipse rx="7.5" ry="12.5" class="dm-body"/><circle cx="1" r="6.8" class="dm-head"/></g>`;
  return s + '</svg>';
}
function mountDictMap(o = {}){
  if (!MAPD || !dialogOpen) return;
  MAPD.ui = o;
  let el = $('#dlgMap');
  if (!el){ el = document.createElement('div'); el.id = 'dlgMap'; el.className = 'dlgmap'; dlg.insertBefore(el, tr); }
  dlg.classList.add('with-map');
  renderDictMap(); scrollTr();
}
function unmountDictMap(){ const el = $('#dlgMap'); if (el) el.remove(); dlg.classList.remove('with-map'); if (MAPD) MAPD.ui = null; }
function mapDictNote(html, kind){ if (!MAPD) return; MAPD.note = html ? { html, kind:kind || '' } : null; renderDictMap(); }
function renderDictMap(){
  const el = $('#dlgMap'); if (!el || !MAPD) return;
  const o = MAPD.ui || {}, n = MAPD.note;
  el.innerHTML = `<div class="dm-top"><p class="dm-title">${o.title || 'Your directions'}</p>
      ${o.undo ? `<button class="tile dm-undo" id="dmUndo" ${MAPD.steps.length || MAPD.bad ? '' : 'disabled'} title="Take the last step back">↶ Cancella</button>` : ''}</div>
    <div class="dm-svg">${mapDictSvg()}</div>
    <p class="dm-status ${n ? n.kind : ''}">${n ? n.html : ''}</p>`;
  const u = el.querySelector('#dmUndo'); if (u) u.onclick = () => { if (!convoBusy) o.undo(); };
}
function mapDictDbg(){
  const D = MAPD; if (!D) return { on:false };
  return { on:true, mounted:!!$('#dlgMap'), node:[...D.node], heading:D.heading, steps:D.steps.length, bad:D.bad ? D.bad.reason : null, arrived:mapArrived(),
    path:[D.start, ...D.steps.flatMap(st => st.path.slice(1))].map(n => n.join(',')) };
}
dbgField('dict', () => mapDictDbg());
