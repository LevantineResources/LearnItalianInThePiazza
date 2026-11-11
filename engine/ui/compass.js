/* The compass rose (first used by Unit 2's Lesson 1: nord, sud, est, ovest): a pick of a direction, in a conversation or in the
   handbook's practice (ui/handbook.js, type 'compass').
   compassSVG({ size, points (4 | 8), right?, wrong?:[dirs] }) → the rose as SVG markup, each point a [data-compass="N"] button
     (N, NE, E, SE, S, SW, W, NW; the labels in Italian: nord, nord-est…)
   askCompass({ label, answer (a dir), points?, onAnswer(dir, ok, tries) → true closes it, title? }): the rose in the open
     conversation's foot (like the notepad), the tiles hidden meanwhile; closeCompass() (closeDialog does it).
   Tests: __dbg().compass = { open, label, answer, picks }. */
const COMPASS_IT = { N:'nord', NE:'nord-est', E:'est', SE:'sud-est', S:'sud', SW:'sud-ovest', W:'ovest', NW:'nord-ovest' };
const COMPASS_EN = { N:'north', NE:'north-east', E:'east', SE:'south-east', S:'south', SW:'south-west', W:'west', NW:'north-west' };
const COMPASS_ANG = { N:-90, NE:-45, E:0, SE:45, S:90, SW:135, W:180, NW:-135 };
function compassSVG(o = {}){
  const S0 = 240, c = S0 / 2, dirs = (o.points || 4) === 8 ? Object.keys(COMPASS_ANG) : ['N', 'E', 'S', 'W'], wrong = o.wrong || [];
  const pt = (a, r) => [c + Math.cos(a * Math.PI / 180) * r, c + Math.sin(a * Math.PI / 180) * r];
  let s = `<svg class="compass" viewBox="-4 -4 ${S0 + 8} ${S0 + 8}" width="${o.size || S0}" height="${o.size || S0}" role="group" aria-label="Compass rose">
    <circle cx="${c}" cy="${c}" r="${c - 36}" class="cp-ring"/><circle cx="${c}" cy="${c}" r="${c - 62}" class="cp-ring2"/>`;
  /* the star: long points at N E S W, short ones between */
  Object.keys(COMPASS_ANG).forEach(d => { const a = COMPASS_ANG[d], long = d.length === 1, [tx, ty] = pt(a, long ? c - 40 : c - 66), [lx, ly] = pt(a - 90, 9), [rx, ry] = pt(a + 90, 9);
    s += `<path d="M${tx} ${ty} L${lx} ${ly} L${c} ${c} Z" class="cp-a"/><path d="M${tx} ${ty} L${rx} ${ry} L${c} ${c} Z" class="cp-b"/>`; });
  dirs.forEach(d => { const a = COMPASS_ANG[d], [x, y] = pt(a, d.length === 1 ? c - 19 : c - 30), cls = o.right === d ? ' right' : wrong.includes(d) ? ' wrong' : '';
    s += `<g class="cp-pt${cls}" data-compass="${d}" tabindex="0" role="button" aria-label="${COMPASS_IT[d]}"><circle cx="${x}" cy="${y}" r="${d.length === 1 ? 17 : 15}"/>
      <text x="${x}" y="${y + 1}" text-anchor="middle" dominant-baseline="middle">${d.replace('W', 'O')}</text></g>`; });
  return s + `<circle cx="${c}" cy="${c}" r="5" class="cp-hub"/></svg>`;
}
let CPS = null;
function askCompass(o){
  enqueue(() => {
    if (!dialogOpen) return;
    closeCompass();
    CPS = { ...o, picks:[], wrong:[] };
    builder.hidden = true; typer.hidden = true; choices.hidden = true;
    const el = document.createElement('div'); el.id = 'cpAsk'; el.className = 'cp-ask';
    el.innerHTML = `<p class="cp-lbl">${o.title || '<b>La bussola</b> · the compass'}${o.label ? ' · ' + o.label : ''}</p><div class="cp-rose">${compassSVG({ points:o.points, size:200 })}</div>`;
    dlgFoot.insertBefore(el, choices);
    el.addEventListener('click', e => { const g = e.target.closest('[data-compass]'); if (g) compassPick(g.dataset.compass); });
    el.addEventListener('keydown', e => { const g = e.target.closest('[data-compass]'); if (g && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); compassPick(g.dataset.compass); } });
    scrollTr();
  });
}
function compassPick(d){
  if (!CPS || convoBusy) return;
  const ok = d === CPS.answer; CPS.picks.push(d); if (!ok) CPS.wrong.push(d);
  const el = $('#cpAsk'); if (el) el.querySelector('.cp-rose').innerHTML = compassSVG({ points:CPS.points, size:200, right:ok ? d : null, wrong:CPS.wrong });
  const r = CPS.onAnswer ? CPS.onAnswer(d, ok, CPS.picks.length) : ok;
  if (r === true) setTimeout(closeCompass, ok ? 500 : 0);
}
function closeCompass(){ const el = $('#cpAsk'); if (el) el.remove(); CPS = null; }
dbgField('compass', () => ({ open:!!$('#cpAsk'), label:CPS ? CPS.label || null : null, answer:CPS ? CPS.answer : null, picks:CPS ? CPS.picks.slice() : [] }));
Object.assign(window.__debug, { compass:d => compassPick(d) });
