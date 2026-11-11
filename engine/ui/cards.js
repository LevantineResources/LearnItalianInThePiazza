/* Two shared screens (first used by Unit 2; Padova's lessons each wrote their own completion screen to the same pattern):
   - openLessonComplete(spec): the lesson-complete screen. spec = { n, title (shown in italics: "Lezione 1 completata!"), sub,
       story (html: what you did), sections?:[{ title, html }], stats?:[[value, label]], next?:{ html, n? (the lesson its
       "Start Lezione n" button starts: hookFor(n).start), go?:{ label, fn } (without a lesson to start: a button of its own, #goNext;
       Unit 2's Lesson 3: Open the Albero) }, kicker? ('Lesson complete'), onClose? }
     Its "Start Lezione n" button has the id goL<n> (the replay system patches it: CLAUDE.md, "After the unit").
   - openInfoCard(spec): a small card over the game (a sight's history, a note): spec = { kicker?, title, sub?, img? (a URL or a
       function returning one: an illustration), alt?, html, cls?, onClose?, button? ('Chiudi') }. E, Esc, × or the button close it.
   Tests: __dbg().card = { open, kind:'complete' | 'info', title, img }. */
let CARD = null;
function openLessonComplete(spec){
  openModal('');
  const next = spec.next || null, start = next && next.n && hookFor(next.n) && hookFor(next.n).start, go = !start && next && next.go;
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">${spec.kicker || 'Lesson complete'}</p><h2><em>${esc(spec.title)}</em></h2><p class="sub">${esc(spec.sub || '')}</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>${spec.story || ''}</p>
      ${(spec.sections || []).map(s => `<h3>${esc(s.title)}</h3>${s.html}`).join('')}
      ${spec.stats && spec.stats.length ? `<h3>Your numbers</h3><div class="stats">${spec.stats.map(([v, l]) => `<div><b>${esc(String(v))}</b><span>${l}</span></div>`).join('')}</div>` : ''}
      ${next ? `<div class="next"><p class="kicker">Next</p><p>${next.html}${next.n && !start ? ' <i>(Coming soon.)</i>' : ''}</p></div>` : ''}
      <div class="cta"><button class="btn${start || go ? '' : ' primary'}" data-close>Close</button>${start ? `<button class="btn primary" id="goL${next.n}">Start Lezione ${next.n}</button>` : go ? `<button class="btn primary" id="goNext">${esc(go.label)}</button>` : ''}</div>
    </div>`;
  if (start) $('#goL' + next.n).onclick = () => hookFor(next.n).start();
  if (go) $('#goNext').onclick = () => go.fn();
  CARD = { kind:'complete', title:spec.title };
  modalAfter = () => { CARD = null; if (spec.onClose) spec.onClose(); };
}
function openInfoCard(spec){
  openModal('infocard ' + (spec.cls || ''));
  const img = typeof spec.img === 'function' ? spec.img() : spec.img;
  sheet.innerHTML = `
    <div class="sheet-head"><div>${spec.kicker ? `<p class="kicker">${spec.kicker}</p>` : ''}<h2><em>${esc(spec.title)}</em></h2>${spec.sub ? `<p class="sub">${esc(spec.sub)}</p>` : ''}</div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      ${img ? `<figure class="ic-fig"><img src="${img}" alt="${esc(spec.alt || spec.title)}"></figure>` : ''}
      <div class="ic-text">${spec.html || ''}</div>
      <div class="cta"><button class="btn primary" data-close>${spec.button || 'Chiudi'}</button></div>
    </div>`;
  CARD = { kind:'info', title:spec.title, img:!!img };
  setTimeout(() => { const b = sheet.querySelector('.cta [data-close]'); if (b) b.focus({ preventScroll:true }); }, 30);
  modalAfter = () => { CARD = null; if (spec.onClose) spec.onClose(); };
}
const cardOpen = () => !!CARD && modalOpen;
dbgField('card', () => ({ open:cardOpen(), kind:CARD ? CARD.kind : null, title:CARD ? CARD.title : null, img:CARD ? !!CARD.img : false }));
