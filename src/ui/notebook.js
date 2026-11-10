/* The detective notebook (Lesson 14 on; docs/lessons/14-dov-e-il-cane.md, "As built (content)"). A notepad of its own: the
   people questioned, what each said (a short Italian line), where the dog went (verso…) and the time. The entries are in Italian
   only (the designer: no English in the notebook; a spec's `en` fields are data, not shown); the chrome (tabs' tips, the empty
   states, the intro lines) stays English.
   An entry is written only when the player has understood it: after a listening line the notebook asks "A che ora?" and
   the player types (or picks) the time they heard; "Dove è andato?" is a pick of the direction. A page "Ieri sera…" lists
   clues remembered from Lesson 13's dinner, and a page compares two sightings side by side (the "two dogs" idea).

   Turned on by a lesson hook, notebook() → spec (CLAUDE.md, the hooks table); off when no hook returns one. Spec:
     { id, title, sub?, button?, case?:{ it, en },
       people:[{ id, name, role? }],                          the order of the people's cards
       clues:{ id:{ who, it, en, where?:key, time?:key, when?, secret?, also? } },
       times:{ key:{ h, m, it, en } }, where:{ key:{ it, en } },
       ieriSera:[{ id, who, it, en, seen? }],                 (seen === false: not shown)
       compare:{ a:clueId, b:clueId, title, sub?, q?:{ it, en, options:[{ id, it, en, correct?, reply:{ it, en } }] } } }
   Saved: S.notebook = { id, clues:{ id:{ line, time:{ h, m } | null, where:key | null, at } }, deduced:{ two:'…' }, tries }
   (lazy, not in FRESH(); a spec with another id starts a fresh notebook).

   API
     notebookSpec(), notebookOn()          the hook's spec / is it on
     nbNote(id, { time?, where?, quiet? }) write a clue (the line; time:true / where:true also write those parts, from the
                                           spec's truth). Toasts "Taccuino: …", pulses the button, asks the hooks'
                                           onNotebook(id, rec). Returns the record.
     nbHeard(id) / nbHas(id) / nbComplete(id) / nbRec(id)
     nbAskTime({ clue, line?:{ it, rate?, pitch? }, mode?:'type' | 'pick', onDone?(rec, tries) })
                                           in the open conversation (the dialog's foot, like askNumber): "A che ora?"; the
                                           player types hours and minutes (12- or 24-hour) or picks a time. Right → the time
                                           is written; wrong → feedback on what they wrote (never the time), the line again,
                                           slowly; from the 3rd miss the line is revealed (revealListen); from the 6th a
                                           "Show me" link writes it.
     nbAskWhere({ clue, line?, options?:[keys], onDone? })   the same, a pick of where the dog went (English labels)
     closeNotebookAsk()                    (closeDialog does it too)
     openNotebook(page)                    the notebook sheet: 'people' | 'ieri' | 'compare'; key J, header button #btnNotebook
   Tests: __dbg().notebook (notebookDbg), __debug.nbNote / nbOpen / nbTry (ui), lessons/14-dov-e-il-cane/debug.js for Lesson 14. */

const NB = { page:'people', ask:null, picked:null };
function notebookSpec(){ return askHooks('notebook') || null; }
const notebookOn = () => !!notebookSpec();
function nbState(spec = notebookSpec()){
  if (!S.notebook || typeof S.notebook !== 'object' || (spec && S.notebook.id !== spec.id)) S.notebook = { id:spec ? spec.id : null, clues:{}, deduced:{}, tries:0 };
  if (!S.notebook.clues) S.notebook.clues = {};
  if (!S.notebook.deduced) S.notebook.deduced = {};
  return S.notebook;
}
const nbRec = id => (S.notebook && S.notebook.clues && S.notebook.clues[id]) || null;
const nbHas = id => !!(nbRec(id) && nbRec(id).line);
function nbComplete(id, spec = notebookSpec()){
  const c = spec && spec.clues[id], r = nbRec(id);
  return !!(c && r && r.line && (!c.time || r.time) && (!c.where || r.where));
}
/* the times: { h, m } ↔ "6:45" ↔ "alle sette meno un quarto" */
const nbClock = t => t ? `${t.h}:${String(t.m).padStart(2, '0')}` : '';
function nbTimeIt(t){
  if (!t) return '';
  let h = t.h % 12, m = t.m, tail = '';
  if (m === 0) tail = ''; else if (m === 15) tail = ' e un quarto'; else if (m === 30) tail = ' e mezza'; else if (m === 45){ h = (h + 1) % 12; tail = ' meno un quarto'; }
  else tail = m < 35 ? ' e ' + numIt(m) : (h = (h + 1) % 12, ' meno ' + numIt(60 - m));
  return (h === 1 ? "all'una" : h === 0 ? 'alle dodici' : 'alle ' + numIt(h)) + tail;
}
const nbSame = (a, b) => !!a && !!b && a.h % 12 === b.h % 12 && a.m === b.m;
const nbTruth = (spec, c) => c && c.time ? spec.times[c.time] : null;
const nbWhereOf = (spec, k) => k ? spec.where[k] : null;
function nbPerson(spec, id){ return (spec.people || []).find(p => p.id === id) || { id, name:id }; }

/* ---------- writing ---------- */
function nbHeard(id){
  const spec = notebookSpec(); if (!spec || !spec.clues[id]) return null;
  const st = nbState(spec), r = st.clues[id] || (st.clues[id] = { line:false, time:null, where:null, at:0 });
  return r;
}
function nbNote(id, o = {}){
  const spec = notebookSpec(); if (!spec || !spec.clues[id]) return null;
  const c = spec.clues[id], r = nbHeard(id), was = nbComplete(id, spec), had = r.line;
  r.line = true; r.at = r.at || Date.now();
  if (o.time && c.time) r.time = o.time === true ? { h:nbTruth(spec, c).h, m:nbTruth(spec, c).m } : { h:o.time.h, m:o.time.m };
  if (o.where && c.where) r.where = o.where === true ? c.where : o.where;
  save();
  if (!o.quiet && (!had || (!was && nbComplete(id, spec)) || o.time || o.where)){
    const who = nbPerson(spec, c.who).name, bits = [r.time ? nbClock(r.time) : '', r.where ? (nbWhereOf(spec, r.where) || {}).it : ''].filter(Boolean).join(' · ');
    toast(`<b>${esc(spec.title || 'Taccuino')}</b>: ${esc(who)}${bits ? ' · ' + esc(bits) : ''}`);
    const b = $('#btnNotebook'); if (b){ b.classList.remove('nb-flash'); void b.offsetWidth; b.classList.add('nb-flash'); }
  }
  askHooks('onNotebook', id, r);
  renderNotebookButton();
  if (nbIsOpen()) renderNotebook();
  return r;
}

/* ---------- asking inside a conversation: A che ora? / Dove è andato? ---------- */
const nbAskTime = o => enqueue(() => { if (dialogOpen && convo) _nbAsk({ ...o, kind:'time' }); });
const nbAskWhere = o => enqueue(() => { if (dialogOpen && convo) _nbAsk({ ...o, kind:'where' }); });
function _nbAsk(o){
  const spec = notebookSpec(); if (!spec || !spec.clues[o.clue]) return;
  closeNotebookAsk(); closeNumberPad();
  const c = spec.clues[o.clue], truth = o.kind === 'time' ? nbTruth(spec, c) : c.where;
  if (!truth) return;
  nbHeard(o.clue);
  const restore = { builder:builder.hidden, typer:typer.hidden };
  builder.hidden = true; typer.hidden = true;
  const el = document.createElement('div');
  el.className = 'npad nbask'; el.id = 'nbAsk';
  const A = NB.ask = { ...o, el, restore, tries:0, fb:'', truth, spec, c, showMe:false, mode:o.kind === 'time' ? (o.mode || 'type') : 'pick' };
  if (A.kind === 'time' && A.mode === 'pick') A.opts = nbTimeOptions(truth);
  if (A.kind === 'where') A.opts = vcShuffle([c.where, ...(o.options || Object.keys(spec.where).filter(k => k !== c.where)).filter(k => k !== c.where).slice(0, 2)]);
  nbAskRender();
  choices.before(el);
  scrollTr();
  requestAnimationFrame(() => { if (NB.ask === A) footReveal(el); });
}
/* four times to pick from: the right one and the usual mix-ups (an hour off, e ↔ meno, a quarter off) */
function nbTimeOptions(t){
  const mins = t.h * 60 + t.m, opts = new Set([mins]);
  [t.m === 45 ? mins + 30 : t.m === 15 ? mins - 30 : mins + 60, mins + 60, mins - 15, mins + 30, mins - 60].forEach(x => { if (opts.size < 4 && x > 0) opts.add(x); });
  return vcShuffle([...opts].map(x => ({ h:Math.floor(x / 60), m:x % 60 })));
}
function nbAskRender(){
  const A = NB.ask; if (!A) return;
  const who = nbPerson(A.spec, A.c.who).name;
  const replay = A.line && hasTTS && S.sound ? `<button class="nb-replay" type="button" data-nb="replay">${SPK}<span>Ascolta di nuovo</span></button>` : '';
  const notes = Object.entries(A.spec.clues).filter(([id, c]) => c.who === A.c.who && id !== A.clue && nbHas(id))
    .map(([id]) => `<p class="npad-line done"><span class="lbl">${esc(A.spec.clues[id].it)}</span></p>`).join('');
  let field = '';
  if (A.kind === 'time' && A.mode === 'type') field = `<label class="npad-line cur nb-tline" for="nbH"><span class="lbl">🕖 ${esc(who)}:</span><span class="dots"></span>
      <input id="nbH" class="nb-t" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" placeholder="__" aria-label="The hour, in digits">
      <b class="nb-colon">:</b><input id="nbM" class="nb-t" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" placeholder="__" aria-label="The minutes, in digits"></label>`;
  else field = `<p class="npad-line cur"><span class="lbl">${A.kind === 'time' ? '🕖' : '➜'} ${esc(who)}:</span><span class="dots"></span></p>
      <div class="nb-opts" role="group" aria-label="${A.kind === 'time' ? 'The time you heard' : 'Where it went'}">${A.opts.map((x, k) =>
        `<button class="btn nb-opt" type="button" data-nb-opt="${k}">${A.kind === 'time' ? nbClock(x) : esc((A.spec.where[x] || {}).en || x)}</button>`).join('')}</div>`;
  A.el.innerHTML = `<div class="npad-paper nb-paper">
      <p class="npad-title">${esc(A.spec.title || 'Il taccuino')} · <span class="nb-q">${A.kind === 'time' ? 'A che ora?' : 'Dove è andato?'}</span></p>
      ${notes}${field}
    </div>
    <div class="npad-side">${A.kind === 'time' && A.mode === 'type' ? '<button class="btn primary" type="button" data-nb="write" title="Write it down">Scrivi ✎</button>' : ''}${replay}
      <p class="npad-tip" id="nbFb">${A.fb || (A.kind === 'time' ? (A.mode === 'type' ? 'What time did you hear? Digits: hours, then minutes.' : 'What time did you hear?') : 'Where did it go? What did you hear?')}</p>
      ${A.showMe ? '<button class="linkbtn nb-showme" type="button" data-nb="showme">Show me</button>' : ''}</div>`;
  const h = A.el.querySelector('#nbH'), m = A.el.querySelector('#nbM');
  if (h){
    const dig = e => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); if (v !== e.target.value) e.target.value = v; };
    h.addEventListener('input', e => { dig(e); if (h.value.length === 2 || (h.value.length === 1 && +h.value > 2)) m.focus({ preventScroll:true }); });
    m.addEventListener('input', dig);
    h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ':'){ e.preventDefault(); if (h.value && !m.value) m.focus({ preventScroll:true }); else nbAskCheck(); } });
    m.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); nbAskCheck(); } else if (e.key === 'Backspace' && !m.value) h.focus({ preventScroll:true }); });
    setTimeout(() => { if (NB.ask === A && document.activeElement !== m) h.focus({ preventScroll:true }); }, 30);
  }
}
/* feedback on what the player wrote: never the time itself */
function nbTimeFb(t, got){
  const meno = t.m > 30, hourSaid = meno ? (t.h + 1) % 12 : t.h % 12;
  if (got.h % 12 === hourSaid && meno) return `Close: that is the hour you heard. But listen to what comes after it: <i>meno</i> means minus, so it is before that hour.`;
  if (got.h % 12 === t.h % 12 && got.m !== t.m) return 'The hour is right. Now the minutes: listen for <i>e</i>, <i>meno</i>, <i>un quarto</i>, <i>mezza</i>.';
  if (got.m === t.m && got.h % 12 !== t.h % 12) return 'The minutes are right. Listen to the hour again.';
  return 'Hmm… is that what you heard? Listen again.';
}
function nbAskCheck(){
  const A = NB.ask; if (!A || A.kind !== 'time' || A.mode !== 'type') return;
  const h = A.el.querySelector('#nbH'), m = A.el.querySelector('#nbM');
  if (!h.value){ nbAskShake(); return; }
  nbAnswer({ h:+h.value, m:+(m.value || 0) });
}
function nbAnswer(got){
  const A = NB.ask; if (!A) return;
  const ok = A.kind === 'time' ? nbSame(got, A.truth) && got.h <= 24 && got.m < 60 : got === A.truth;
  A.tries++; S.notebook.tries = (S.notebook.tries || 0) + 1;
  if (ok){
    revealListen({ all:true });
    const rec = nbNote(A.clue, A.kind === 'time' ? { time:{ h:A.truth.h, m:A.truth.m } } : { where:A.truth });
    const done = A.onDone, tries = A.tries;
    sysLine(`<span class="nb-sys">✎ ${esc(A.spec.title || 'Il taccuino')}: <b>${esc(nbPerson(A.spec, A.c.who).name)}</b> · ${A.kind === 'time' ? `${nbClock(A.truth)} <i>(${esc(nbTimeIt(A.truth))})</i>` : esc(A.spec.where[A.truth].it)}</span>`);
    closeNotebookAsk();
    if (done) done(rec, tries);
    return;
  }
  /* wrong: feedback on what they wrote; the line again; from the 3rd try the line is revealed; from the 6th, "Show me" */
  A.fb = A.kind === 'time' ? nbTimeFb(A.truth, got) : `Hmm… is that what you heard? <i>Verso</i> means towards: listen for the place after it.`;
  if (A.tries >= 3){ revealListen({ all:true }); A.fb += ' Read the line above.'; }
  if (A.tries >= 5 && A.kind === 'time') A.fb = 'Remember (Lezione 10): <i>alle</i> + the hour; <i>e</i> adds minutes, <i>meno</i> takes them away; <i>un quarto</i> is 15, <i>mezza</i> 30. Read the line above.';
  A.showMe = A.tries >= 6;
  if (A.tries === 2 && A.line) speak(A.line.it, A.line.pitch || 1, false, Math.min(0.7, A.line.rate || 0.7));
  nbAskRender(); nbAskShake();
}
function nbAskShake(){ const A = NB.ask; if (!A) return; A.el.classList.remove('shake'); void A.el.offsetWidth; A.el.classList.add('shake'); }
function closeNotebookAsk(){
  const A = NB.ask; if (!A) return;
  NB.ask = null; A.el.remove();
  if (dialogOpen && convo && !convo.done){ builder.hidden = A.restore.builder; typer.hidden = A.restore.typer; }
}
document.addEventListener('click', e => {
  const A = NB.ask; if (!A || !A.el.contains(e.target)) return;
  const o = e.target.closest('[data-nb-opt]'); if (o){ nbAnswer(A.opts[+o.dataset.nbOpt]); return; }
  const b = e.target.closest('[data-nb]'); if (!b) return;
  if (b.dataset.nb === 'write') nbAskCheck();
  else if (b.dataset.nb === 'replay' && A.line) speak(A.line.it, A.line.pitch || 1, false, Math.min(0.7, A.line.rate || 0.7));
  else if (b.dataset.nb === 'showme') nbAnswer(A.truth);
});

/* ---------- the notebook sheet ---------- */
const nbIsOpen = () => modalOpen && sheet.classList.contains('nbook');
function openNotebook(page){
  const spec = notebookSpec(); if (!spec || introOpen) return;
  nbState(spec);
  if (page) NB.page = page;
  openModal('nbook');
  renderNotebook();
}
const NB_PAGES = [['people', 'Persone'], ['ieri', 'Ieri sera…'], ['compare', 'Confronta']];
function renderNotebook(){
  const spec = notebookSpec(); if (!spec){ if (nbIsOpen()) closeModal(); return; }
  const st = nbState(spec), noted = Object.keys(st.clues).filter(nbHas);
  const ieri = (spec.ieriSera || []).filter(x => x.seen !== false);
  sheet.innerHTML = `
    <div class="sheet-head nb-head"><div><p class="kicker">${esc(spec.title || 'Il taccuino')}${spec.sub ? ' · ' + esc(spec.sub) : ''}</p>
        <div class="tabs nb-tabs" role="tablist">${NB_PAGES.filter(([k]) => k !== 'ieri' || ieri.length).map(([k, l]) =>
          `<button role="tab" data-nb-page="${k}" aria-selected="${NB.page === k}">${l}${k === 'people' ? ` <span>${noted.length}</span>` : ''}</button>`).join('')}</div></div>
      <button class="x" data-close aria-label="Close the notebook">×</button></div>
    <div class="sheet-body nb-body" id="nbBody"><div class="nb-page">${NB.page === 'ieri' ? nbIeriHTML(spec, ieri) : NB.page === 'compare' ? nbCompareHTML(spec) : nbPeopleHTML(spec)}</div></div>`;
}
function nbClueHTML(spec, id, o = {}){
  const c = spec.clues[id], r = nbRec(id) || {}, t = r.time, w = r.where ? spec.where[r.where] : null;
  const timeSlot = c.time ? (t ? `<span class="nb-time" title="${esc(nbTimeIt(t))}">🕖 ${nbClock(t)} <i>${esc(nbTimeIt(t))}</i></span>` : '<span class="nb-time nb-blank" title="Not written yet">🕖 __:__ ?</span>') : '';
  const whereSlot = c.where ? (w ? `<span class="nb-where">➜ ${esc(w.it)}</span>` : '<span class="nb-where nb-blank">➜ verso … ?</span>') : '';
  const when = c.when ? `<span class="nb-when">${esc(c.when)}</span>` : '';
  return `<li class="nb-clue${c.secret ? ' secret' : ''}" data-clue="${esc(id)}">
      <p class="nb-it">«${esc(c.it)}»${c.secret ? ' <span class="nb-secret" title="A secret: you promised">🤫 segreto</span>' : ''}</p>
      ${timeSlot || whereSlot || when ? `<p class="nb-meta">${when}${whereSlot}${timeSlot}</p>` : ''}</li>`;
}
function nbPeopleHTML(spec){
  const ids = Object.keys(spec.clues).filter(nbHas);
  const people = (spec.people || []).filter(p => ids.some(id => spec.clues[id].who === p.id));
  const caseCard = spec.case ? `<div class="nb-case"><p class="nb-it">${esc(spec.case.it)}</p></div>` : '';
  if (!people.length) return caseCard + '<p class="nb-empty">Nobody yet. Ask people what they saw: what you understand is written here.</p>';
  return caseCard + `<div class="nb-people">${people.map(p => `<section class="nb-person" data-person="${esc(p.id)}">
      <h3><span class="nb-name">${esc(p.name)}</span>${p.role ? `<span class="nb-role">${esc(p.role)}</span>` : ''}</h3>
      <ul class="nb-clues">${ids.filter(id => spec.clues[id].who === p.id).map(id => nbClueHTML(spec, id)).join('')}</ul></section>`).join('')}</div>`;
}
function nbIeriHTML(spec, ieri){
  return `<p class="nb-intro">From last night's dinner, in the dining car. Little things… or clues?</p>
    <ul class="nb-ieri">${ieri.map(x => `<li><span class="nb-who">${esc(nbPerson(spec, x.who).name || x.who)}</span><p class="nb-it">${esc(x.it)}</p></li>`).join('')}</ul>`;
}
/* a small clock face for a time (or a "?" face) */
function nbClockSVG(t){
  const R = 30, hand = (a, l, w) => `<line x1="0" y1="0" x2="${(Math.sin(a) * l).toFixed(1)}" y2="${(-Math.cos(a) * l).toFixed(1)}" stroke-width="${w}" stroke-linecap="round"/>`;
  const ticks = Array.from({ length:12 }, (_, k) => { const a = k * Math.PI / 6; return `<line x1="${(Math.sin(a) * 25).toFixed(1)}" y1="${(-Math.cos(a) * 25).toFixed(1)}" x2="${(Math.sin(a) * 28).toFixed(1)}" y2="${(-Math.cos(a) * 28).toFixed(1)}" stroke-width="${k % 3 ? 1.2 : 2.4}"/>`; }).join('');
  const hands = t ? hand(((t.h % 12) + t.m / 60) * Math.PI / 6, 15, 3.4) + hand(t.m * Math.PI / 30, 22, 2.2) : '';
  return `<svg class="nb-clock" viewBox="-34 -34 68 68" aria-hidden="true"><circle r="${R}" class="face"/><g class="ticks">${ticks}</g><g class="hands">${hands}</g>${t ? '<circle r="2.6" class="pin"/>' : '<text y="9" text-anchor="middle" class="q">?</text>'}</svg>`;
}
function nbCompareHTML(spec){
  const K = spec.compare; if (!K) return '<p class="nb-empty">Nothing to compare yet.</p>';
  const side = id => { const c = spec.clues[id], r = nbRec(id) || {}, p = nbPerson(spec, c.who), w = r.where ? spec.where[r.where] : null;
    return `<div class="nb-side${nbComplete(id, spec) ? ' full' : ''}" data-side="${esc(id)}">
        <p class="nb-sname">${esc(p.name)}</p>
        ${nbClockSVG(r.time)}
        <p class="nb-stime">${r.time ? `${nbClock(r.time)}<i>${esc(nbTimeIt(r.time))}</i>` : '<span class="nb-blank">A che ora? __:__</span>'}</p>
        <p class="nb-swhere">${w ? `<b>➜ ${esc(w.it)}</b>` : '<span class="nb-blank">➜ verso … ?</span>'}</p>
        ${r.line ? `<p class="nb-it nb-sline">«${esc(c.it)}»</p>` : ''}</div>`; };
  const a = nbRec(K.a) || {}, b = nbRec(K.b) || {}, ready = nbComplete(K.a, spec) && nbComplete(K.b, spec);
  /* the timeline: the hour around the two times */
  const ts = [a.time, b.time].filter(Boolean).map(t => t.h * 60 + t.m), lo = ts.length ? Math.floor(Math.min(...ts) / 60) * 60 : 360, hi = Math.max(lo + 60, ts.length ? Math.ceil((Math.max(...ts) + 1) / 60) * 60 : 420);
  const pos = t => ((t.h * 60 + t.m - lo) / (hi - lo) * 100).toFixed(1);
  const mark = (t, id, cls) => t ? `<span class="nb-tmark ${cls}" style="left:${pos(t)}%"><b>${nbClock(t)}</b><i>${esc(nbPerson(spec, spec.clues[id].who).name.split(' ')[0])}</i></span>` : '';
  const ticks = []; for (let m = lo; m <= hi; m += 15) ticks.push(`<span class="nb-tick${m % 60 ? '' : ' hr'}" style="left:${((m - lo) / (hi - lo) * 100).toFixed(1)}%">${m % 60 ? '' : `${m / 60}:00`}</span>`);
  const picked = S.notebook.deduced[K.a + '|' + K.b], opt = picked && K.q ? K.q.options.find(x => x.id === picked) : null;
  const q = K.q ? (ready ? `<div class="nb-think"><p class="nb-it nb-qline">${esc(K.q.it)}</p>
        <div class="nb-qopts">${K.q.options.map(x => `<button class="btn nb-qopt${picked === x.id ? ' on' : ''}" type="button" data-nb-q="${esc(x.id)}" aria-pressed="${picked === x.id}">${esc(x.it)}</button>`).join('')}</div>
        ${opt ? `<p class="nb-reply${opt.correct ? ' good' : ''}"><span class="nb-it">${esc(opt.reply.it)}</span></p>` : ''}</div>`
      : '<p class="nb-intro nb-wait">Write down both sightings first: where each one says it went, and at what time (ask them <i>A che ora?</i>).</p>') : '';
  return `<p class="nb-intro"><b>${esc(K.title || 'Confronta')}</b>${K.sub ? ' · ' + esc(K.sub) : ''}</p>
    <div class="nb-compare">${side(K.a)}<span class="nb-vs" aria-hidden="true">≠?</span>${side(K.b)}</div>
    <div class="nb-timeline" aria-label="Timeline">${ticks.join('')}${mark(a.time, K.a, 'a')}${mark(b.time, K.b, 'b')}</div>
    ${q}${opt && opt.correct ? '<p class="nb-stamp">Due cani?!</p>' : ''}`;
}
modal.addEventListener('click', e => {
  if (!nbIsOpen()) return;
  const p = e.target.closest('[data-nb-page]'); if (p){ NB.page = p.dataset.nbPage; renderNotebook(); return; }
  const q = e.target.closest('[data-nb-q]');
  if (q){ const spec = notebookSpec(), K = spec.compare, k = K.a + '|' + K.b, first = !S.notebook.deduced[k];
    S.notebook.deduced[k] = q.dataset.nbQ; save(); renderNotebook();
    const opt = K.q.options.find(x => x.id === q.dataset.nbQ);
    if (opt && opt.reply) speak(opt.reply.it);
    askHooks('onNotebookDeduce', q.dataset.nbQ, { first, correct:!!(opt && opt.correct) }); }
});

/* ---------- the header button and the J key ---------- */
const NB_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z"/><path d="M6 3v18"/><path d="M3 7h3M3 12h3M3 17h3"/><circle cx="12.5" cy="10" r="2.6"/><path d="m14.4 11.9 2.3 2.3"/></svg>';
function renderNotebookButton(){
  const spec = notebookSpec();
  let b = $('#btnNotebook');
  if (!spec){ if (b) b.hidden = true; return; }
  if (!b){
    b = document.createElement('button'); b.id = 'btnNotebook'; b.className = 'tool'; b.type = 'button';
    b.onclick = () => { if (!introOpen && !traveling) openNotebook(); };
    const nav = $('#bar .tools'), before = $('#btnBag') || $('#btnMap');
    nav.insertBefore(b, before);
  }
  const n = S.notebook && S.notebook.id === spec.id ? Object.keys(S.notebook.clues).filter(nbHas).length : 0;
  b.title = `${spec.title || 'Il taccuino'}: who said what, and when (J)`;
  b.innerHTML = `${NB_ICON}<span class="lbl">${esc(spec.button || 'Taccuino')}</span><b class="badge">${n}</b><kbd>J</kbd>`;
  b.hidden = false;
}
document.addEventListener('keydown', e => {
  if (e.key.toLowerCase() !== 'j' || e.metaKey || e.ctrlKey || e.altKey || (e.target.matches && e.target.matches('input, textarea'))) return;
  if (nbIsOpen()){ e.preventDefault(); closeModal(); return; }
  if (frozen() || (typeof cutsceneOn === 'function' && cutsceneOn())) return;
  if (notebookOn()){ e.preventDefault(); openNotebook(); }
});

/* ---------- tests ---------- */
function notebookDbg(){
  const spec = notebookSpec(), A = NB.ask, b = $('#btnNotebook');
  if (!spec) return { on:false, button:!!b && !b.hidden, open:nbIsOpen(), ask:null };
  const st = S.notebook && S.notebook.id === spec.id ? S.notebook : { clues:{}, deduced:{} };
  const clues = Object.fromEntries(Object.entries(st.clues).map(([id, r]) => [id, { who:spec.clues[id] && spec.clues[id].who, line:!!r.line, time:r.time ? nbClock(r.time) : null,
    where:r.where || null, full:nbComplete(id, spec) }]));
  const K = spec.compare;
  return { on:true, id:spec.id, button:!!b && !b.hidden, open:nbIsOpen(), page:NB.page, clues,
    people:(spec.people || []).filter(p => Object.keys(st.clues).some(id => st.clues[id].line && spec.clues[id] && spec.clues[id].who === p.id)).map(p => p.id),
    ask:A ? { kind:A.kind, mode:A.mode, clue:A.clue, tries:A.tries, fb:A.fb.replace(/<[^>]+>/g, ''), opts:A.opts ? A.opts.map(x => typeof x === 'string' ? x : nbClock(x)) : null, showMe:A.showMe } : null,
    compare:K ? { a:clues[K.a] || null, b:clues[K.b] || null, ready:nbComplete(K.a, spec) && nbComplete(K.b, spec), picked:st.deduced[K.a + '|' + K.b] || null } : null,
    ieri:(spec.ieriSera || []).filter(x => x.seen !== false).length };
}
Object.assign(window.__debug, {
  nbNote(id, o){ return nbNote(id, o || {}); },
  nbOpen(page){ openNotebook(page); },
  /* answer the open "A che ora?" / "Dove?" (time '6:45' or a where key) as a player would: type it, or pick it */
  nbTry(v){ const A = NB.ask; if (!A) return false;
    if (A.kind === 'time' && A.mode === 'type'){ const [h, m] = String(v).split(':'); A.el.querySelector('#nbH').value = h; A.el.querySelector('#nbM').value = m || ''; A.el.querySelector('[data-nb="write"]').click(); return true; }
    const k = A.opts.findIndex(x => typeof x === 'string' ? x === v : nbClock(x) === v); if (k < 0) return false;
    A.el.querySelector(`[data-nb-opt="${k}"]`).click(); return true; },
  nbTimeIt(h, m){ return nbTimeIt({ h, m }); },
});
