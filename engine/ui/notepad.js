/* The notepad (shared). 1) askNumber: write a number down inside a conversation (Lesson 7 prices, Lesson 8 totals and
   change, Lesson 9 totals). 2) Checklist mode (Lesson 9 on, further down): a titled list with ticks, shown as a small
   sheet (the List button, key L) and beside the tile bank.

   askNumber({ label, onAnswer, title, prefix, notes, max, tip })
     label      what is being written down, e.g. 'la maglietta'  →  "la maglietta: € ___"
     onAnswer(n, pad)  called with the whole number typed (digits only). Return true to close the notepad
                (the tile bank or typer it hid comes back); return anything else to keep it open (the box is
                cleared and shakes). pad = { close(), shake(), el }.
     title      header (default "Mark's notepad"; "Your notepad" when Mark is gone)   prefix  before the box ('€'; '' for none)
     notes      earlier entries shown above, [{ label, value }]  (e.g. prices already written down)
     max        largest number accepted (default 999)    tip     small help line under the box
   It goes through the display queue (like showChoices), so it appears once the lines before it have been
   spoken. While it is open, the tile bank (#builder) and the typer are hidden. The box is a numeric text
   input (inputmode="numeric"), so phones show their number pad.
   closeNumberPad() closes it (closeDialog does too); numberPadDbg() is for tests (__dbg().pad). */
let NPAD = null;
const askNumber = o => enqueue(() => { if (dialogOpen && convo) _askNumber(o); });
function _askNumber(o){
  closeNumberPad();
  const restore = { builder:builder.hidden, typer:typer.hidden };
  builder.hidden = true; typer.hidden = true;
  const el = document.createElement('div');
  el.className = 'npad'; el.id = 'npad';
  const pre = o.prefix === undefined ? '€' : o.prefix;
  const notes = (o.notes || []).map(x => `<p class="npad-line done"><span class="lbl">${esc(x.label)}</span><span class="dots"></span><b>${esc(pre)} ${esc(x.value)}</b></p>`).join('');
  el.innerHTML = `<div class="npad-paper">
      <p class="npad-title">${esc(o.title || unitHook('notepadTitle') || 'Your notepad')}</p>
      ${notes}
      <label class="npad-line cur" for="npadInput"><span class="lbl">${esc(o.label)}:</span><span class="dots"></span>
        ${pre ? `<span class="pre">${esc(pre)}</span>` : ''}<input id="npadInput" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3"
          autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="__" aria-label="${esc(o.label)}: write the number in digits"></label>
    </div>
    <div class="npad-side"><button class="btn primary" id="npadOK">Write it down</button>
      <p class="npad-tip">${o.tip || 'Digits only, like <b>15</b>.'}</p></div>`;
  choices.before(el);                                      // (in the dialog's foot, #dlgFoot)
  const inp = el.querySelector('#npadInput');
  const pad = {
    el,
    close: () => closeNumberPad(),
    shake(){ inp.value = ''; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); focus(); },
  };
  const focus = () => setTimeout(() => { if (NPAD === pad && document.activeElement !== inp) inp.focus({ preventScroll:true }); }, 30);
  const submitPad = () => {
    const v = inp.value.replace(/\D/g, '');
    if (!v || +v > (o.max || 999)){ pad.shake(); return; }
    if (o.onAnswer(+v, pad) === true){ if (NPAD === pad) closeNumberPad(); }
    else if (NPAD === pad) pad.shake();
  };
  inp.addEventListener('input', () => { const v = inp.value.replace(/\D/g, '').slice(0, 3); if (v !== inp.value) inp.value = v; });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); submitPad(); } });
  el.querySelector('#npadOK').onclick = submitPad;
  NPAD = pad; pad.restore = restore; pad.label = o.label;
  scrollTr(); focus();
  requestAnimationFrame(() => { if (NPAD === pad) footReveal(el); });    // on a short window: scrolled into view
}
function closeNumberPad(){
  if (!NPAD) return;
  const p = NPAD; NPAD = null;
  p.el.remove();
  if (dialogOpen && convo && !convo.done){ builder.hidden = p.restore.builder; typer.hidden = p.restore.typer; }
}
const numberPadOpen = () => !!NPAD;
function numberPadDbg(){ return NPAD ? { open:true, label:NPAD.label } : { open:false }; }

/* ---------- checklist mode ----------
   A list on notepad paper: spec = { title, sub?, items:[{ label, note?, value?, head?, done?, ok?, warn?, cur? }], foot? }
     head  a heading row (e.g. a stall: "At Teresa's"), value shown on the right (a total)
     done  ticked and struck through (bought)         ok    a pencil tick (agreed, not paid yet)
     warn  marked in red (note says why: "you got 3") cur   the part that matters now (highlighted; others dimmed)
   checklistHTML(spec, { compact })  the paper itself (compact: only the cur rows, for the dialog on a phone)
   openChecklist(spec)   a small sheet with the list and an OK button (closeModal closes it)
   setDialogList(spec)   beside the tile bank in the open conversation (#builder.with-list); null removes it
   The List button: any lesson hook's checklist() returning a spec shows a floating "List" button (#btnList) over the
   world, and the L key opens it. renderListButton() runs on every HUD render. checklistDbg() → __dbg().list = { button, sheet (the open list sheet's rows), dialog (the rows beside the bank) }.
   (Not "modal": tests/run.js counts any log line with "modal …: false" as a failure.) */
function checklistHTML(spec, o = {}){
  const rows = spec.items.map(it => {
    const cls = ['ckl-row', it.head ? 'head' : 'item', it.done ? 'done' : '', it.ok ? 'ok' : '', it.warn ? 'warn' : '', it.cur ? 'cur' : ''].filter(Boolean).join(' ');
    if (it.head) return `<li class="${cls}"><span class="lbl">${esc(it.label)}</span>${it.value !== undefined && it.value !== null ? `<b class="val">${esc(it.value)}</b>` : ''}</li>`;
    const box = it.done ? '✓' : it.warn ? '!' : it.ok ? '✓' : '';
    return `<li class="${cls}"><span class="box" aria-hidden="true">${box}</span><span class="lbl">${esc(it.label)}</span>${it.note ? `<em class="note">${esc(it.note)}</em>` : ''}</li>`;
  }).join('');
  const dim = spec.items.some(i => i.cur) ? ' has-cur' : '';
  return `<div class="ckl${o.compact ? ' compact' : ''}${dim}"><div class="ckl-paper">
      <p class="ckl-title">${esc(spec.title)}</p>${spec.sub ? `<p class="ckl-sub">${esc(spec.sub)}</p>` : ''}
      <ul class="ckl-list">${rows}</ul>${spec.foot ? `<p class="ckl-foot">${spec.foot}</p>` : ''}</div></div>`;
}
let CKL = { modal:null, dialog:null };
function openChecklist(spec){
  if (!spec) return;
  openModal('small notebook');
  CKL.modal = spec;
  sheet.innerHTML = `<div class="sheet-head"><div><p class="kicker">Notepad</p><h2>${esc(spec.title)}</h2></div><button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">${checklistHTML({ ...spec, title:spec.paperTitle || spec.title })}<div class="cta"><button class="btn primary" data-close>OK</button></div></div>`;
  setTimeout(() => { const b = sheet.querySelector('.cta [data-close]'); if (b) b.focus({ preventScroll:true }); }, 30);
}
function setDialogList(spec){
  CKL.dialog = spec || null;
  let el = $('#dlgList');
  if (!spec){ if (el) el.remove(); builder.classList.remove('with-list'); return; }
  if (!el){ el = document.createElement('aside'); el.id = 'dlgList'; el.setAttribute('aria-label', spec.title); builder.appendChild(el); }
  builder.classList.add('with-list');
  el.innerHTML = checklistHTML(spec) + checklistHTML(spec, { compact:true });
}
/* the floating List button: shown while a hook has a list (hooks' checklist()), hidden in conversations and modals */
function renderListButton(){
  let b = $('#btnList');
  const spec = askHooks('checklist');
  if (!spec){ if (b) b.hidden = true; return; }
  if (!b){
    b = document.createElement('button'); b.id = 'btnList'; b.className = 'listbtn'; b.type = 'button';
    b.title = 'Your list (L)'; b.onclick = () => { const s = askHooks('checklist'); if (s && !frozen()) openChecklist(s); };
    $('#stage').appendChild(b);
  }
  const left = spec.items.filter(i => !i.head && !i.done).length;
  b.innerHTML = `<span class="ico" aria-hidden="true"></span><span class="lbl">${esc(spec.button || spec.title)}</span>${left ? `<b class="badge">${left}</b>` : '<b class="badge ok">✓</b>'}<kbd>L</kbd>`;
  b.hidden = false;                                         // (hidden by CSS behind a conversation or a sheet)
}
document.addEventListener('keydown', e => {
  if (e.key.toLowerCase() !== 'l' || e.metaKey || e.ctrlKey || e.altKey || (e.target.matches && e.target.matches('input, textarea'))) return;
  if (frozen()) return;
  const s = askHooks('checklist'); if (s){ e.preventDefault(); openChecklist(s); }
});
function checklistDbg(){
  const b = $('#btnList');
  return { button:!!b && !b.hidden, sheet:modalOpen && sheet.classList.contains('notebook') ? CKL.modal.items.map(i => i.label) : null,
    dialog:$('#dlgList') ? CKL.dialog.items.map(i => (i.done ? '✓ ' : i.warn ? '! ' : i.ok ? '~ ' : '') + i.label) : null };
}
