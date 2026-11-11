/* Handbook (lesson + practice tabs), special handbook tables, dictionary. */

/* =========================================================
   HANDBOOK, PRACTICE, DICTIONARY, PHONE, MAP, MODALS
   ========================================================= */
const modal = $('#modal'), sheet = $('#sheet');
let hbTab = 'lesson', hbLesson = 1;
const freshPX = () => ({ i:0, answered:false, picked:[] });
/* each chapter's practice in progress (PX[n]: lazy; the unit's own chapters may start with one: UNIT.practiceSlots) */
const freshPXAll = () => Object.fromEntries((UNIT.practiceSlots || []).map(n => [n, freshPX()]));
let PX = freshPXAll();
/* a chapter's practice is done: S.practiceDone<n> (the unit can say otherwise: UNIT.practiceDone(n), Padova's Lesson 1 is S.practiceDone) */
const practiceDone = n => isQuestKey(n) ? !!(questPeek(n.slice(2)) || {}).practice : unitHook('practiceDone', n) ?? !!S['practiceDone' + n];
/* the handbook is lost but for a loose page (chapter n): UNIT.loosePage() → n or nothing (Padova's Lesson 6) */
const loosePage = () => unitHook('loosePage') || null;

function openModal(cls){ sheet.className = 'sheet ' + (cls || ''); modal.hidden = false; modalOpen = true; keys.clear(); target = null; }
function closeModal(){ modal.hidden = true; modalOpen = false; sheet.innerHTML = ''; renderHUD(); const f = modalAfter; modalAfter = null; if (f) try { f(); } catch(e){ console.error(e); } }
let modalAfter = null;          // a one-off callback for when the modal closes (openHandbook's onClose)
modal.addEventListener('click', e => {
  if (e.target === modal) { closeModal(); return; }
  if (e.target.closest('[data-close]')) { closeModal(); return; }
  if (schedaClick(e)) return;                       // a quest's scheda: its own tabs (ui/quests.js)
  const s = e.target.closest('[data-say]'); if (s) { speak(s.dataset.say, +(s.dataset.pitch || 1)); return; }
  const st = e.target.closest('[data-study]'); if (st) { openStudy({ lessons:[+st.dataset.study], from:'handbook' }); return; }
  if (e.target.closest('[data-hb-switch]')) { hbSwitch(); return; }                 // (Lezioni ▾: the chapter list)
  if (e.target.matches && e.target.matches('.hb-lessons')) { hbSwitch(false); return; }   // (a tap beside the list closes it)
  const ch = e.target.closest('[data-ch]'); if (ch && !ch.disabled) { hbLesson = +ch.dataset.ch; hbTab = 'lesson'; renderHandbook(); return; }
  const nt = e.target.closest('[data-notes]'); if (nt) { hbTab = 'notes:' + nt.dataset.notes; renderHandbook(); return; }
  const tab = e.target.closest('[data-tab]'); if (tab) { hbTab = tab.dataset.tab; renderHandbook(); return; }
  if (e.target.closest('[data-numbers]')) { openNumbers(); return; }
  const node = e.target.closest('[data-node]'); if (node) { unitHook('mapNode', node.dataset.node.split(',').map(Number)); return; }   // (a crossing on the unit's map)
  const en = e.target.closest('[data-toggle-en]'); if (en) { sheet.querySelectorAll('.notes .en, .msg .en').forEach(x => x.hidden = !x.hidden); return; }
});

/* openHandbook(n, { section, onClose }): open chapter n (default: the current lesson's); section scrolls the Lesson tab
   to a box and highlights it: one of the chapter's own boxes (L.boxes: [{ id, title, html }], shown first, as
   #hb-<id>) or a standard section: 'conversation', 'phrases', 'phrases2', 'extra', 'how', 'culture', 'vocab'.
   onClose runs once, when the handbook is closed. */
function openHandbook(lesson, opts = {}){
  if (introOpen) return;
  if (lesson && !LESSONS[lesson - 1]) lesson = null;
  S.handbookOpened = true;
  unitHook('handbookOpened');                        // (the unit's tutorial beats: Padova's Lessons 1–5, "open your handbook")
  const want = loosePage() || (lesson || S.lesson);
  if (want !== hbLesson){ hbLesson = want; hbTab = 'lesson'; }
  if (opts.section) hbTab = 'lesson';
  if (opts.notes) hbTab = 'notes:' + opts.notes;     // (the unit's notes: UNIT.handbookNotes(), below)
  if (opts.tab) hbTab = opts.tab;                    // ('albero': the skill tree, ui/tree.js)
  openModal(loosePage() ? 'book page' : 'book'); renderHandbook();
  modalAfter = opts.onClose || null;
  if (opts.section) hbShowSection(opts.section);
}
/* scroll the open chapter to a section (#hb-<id>) and highlight it for a moment */
function hbShowSection(id){
  const el = sheet.querySelector('#hb-' + CSS.escape(id));
  if (!el) return false;
  const body = $('#hbBody');
  if (body) body.scrollTop = Math.max(0, el.offsetTop - body.offsetTop - 12);
  el.scrollIntoView({ block:'start', behavior:'auto' });
  el.classList.remove('hb-hl'); void el.offsetWidth; el.classList.add('hb-hl');
  setTimeout(() => el.classList.remove('hb-hl'), 3200);
  hbLastSection = id;
  return true;
}
let hbLastSection = null;
/* the unit's notes in the handbook (Unit 2: the sights' history cards, kept in a "Venezia" section): UNIT.handbookNotes() →
   [{ id, title, sub?, intro? (html), cards:[{ id, title, sub?, img? (a URL, or a function returning one), alt?, html }], empty? (html) }].
   Each is a tab after the chapter's own and the Albero (✎ title); hbTab 'notes:<id>' shows it. */
const hbNotes = () => unitHook('handbookNotes') || [];
const hbNotesButtons = () => hbNotes().map(N => `<button data-notes="${esc(N.id)}" role="tab" class="hb-notes-btn" aria-selected="${hbTab === 'notes:' + N.id}" aria-pressed="${hbTab === 'notes:' + N.id}">✎ ${esc(N.title)}${N.cards.length ? ` · ${N.cards.length}` : ''}</button>`).join('');
function renderNotes(N){
  sheet.innerHTML = `
    ${hbHead({ title:`✎ <em>${esc(N.title)}</em>`, tabs:hbTabs() })}
    <div class="sheet-body hb-notes" id="hbBody">
      ${N.sub ? `<p class="hb-about">${esc(N.sub)}</p>` : ''}
      ${N.intro ? `<p class="note">${N.intro}</p>` : ''}
      ${N.cards.length ? N.cards.map(c => { const img = typeof c.img === 'function' ? c.img() : c.img;
        return `<section class="hb-note" id="hbn-${esc(c.id)}">${img ? `<figure class="ic-fig"><img src="${img}" alt="${esc(c.alt || c.title)}"></figure>` : ''}
          <div><h3>${esc(c.title)}</h3>${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}<div class="ic-text">${c.html}</div></div></section>`; }).join('')
        : `<div class="empty">${N.empty || 'Nothing here yet.'}</div>`}
    </div>`;
  hbAfterRender();
}
/* ---------- the head of every handbook page (a chapter, the Albero, the notes): compact, so the page gets the room ----------
   One bar: the page's short title (L3 · Da bambina; the full "Lezione 3" for screen readers), Lezioni ▾ (the chapter list as an overlay
   over the page: hbSwitch, data-hb-switch; Esc closes it first) and ×. Then one row of tabs: the chapter's Lesson · Words · Practice,
   the Albero (ui/tree.js hbTreeButton), the unit's notes (✎), Studia; it scrolls sideways when it doesn't fit (a phone). The chapter's
   description is the first line of its Lesson tab (.hb-about); the chapter list shows every chapter's. On a phone the handbook is the
   whole screen; on a short one (a phone on its side) the bar and the tabs share one row (styles.css, "the handbook's head"). */
function hbHead(o){
  const loose = loosePage();
  return `<div class="hb-top">
    <div class="sheet-head hb-head">
      ${o.kicker ? `<p class="kicker hb-kick">${o.kicker}</p>` : ''}
      <div class="hb-bar"><h2 class="hb-title">${o.num ? `<span class="hb-num"><span aria-hidden="true">L${o.num}</span><span class="sr-only">Lezione ${o.num}</span></span> · ` : ''}${o.title}</h2>
        ${loose ? '' : `<button class="hb-lz" data-hb-switch aria-haspopup="true" aria-expanded="false" aria-controls="hbLessons" title="Switch lesson">Lezioni <span class="hb-caret" aria-hidden="true">▾</span></button>`}
        <button class="x" data-close aria-label="Close handbook">×</button></div>
    </div>
    <div class="tabs" role="tablist">${o.tabs || ''}</div>
  </div>
  ${loose ? '' : hbLessons()}`;
}
/* the chapter list (Lezioni ▾): every chapter with its description; locked ones greyed with why */
function hbLessons(){
  const rows = LESSONS.map(x => { const lock = S.lesson < x.n || x.placeholder;     /* (placeholder: a stand-in chapter, lessons/14-dov-e-il-cane/content.js) */
    const on = x.n === hbLesson && !hbTab.startsWith('notes:') && hbTab !== 'albero';
    return `<button data-ch="${x.n}" aria-pressed="${on}" ${lock ? 'disabled title="' + (x.placeholder ? 'Coming soon' : 'Unlocks in Lezione ' + x.n) + '"' : ''}><span class="hb-ch-n">${x.n}</span><span class="hb-ch-t">${esc(x.title)}${lock ? ' 🔒' : ''}</span>${x.sub ? `<small>${esc(x.sub)}</small>` : ''}</button>`; }).join('');
  return `<div class="hb-lessons" id="hbLessons" hidden>
    <div class="hb-lessons-in" role="dialog" aria-label="Lessons">
      <div class="hb-lessons-head"><p class="kicker">Learn Italian Handbook · ${esc(UNIT.title || '')}</p><button class="x" data-hb-switch aria-label="Close the list of lessons">×</button></div>
      <div class="chapters" role="group" aria-label="Chapters">${rows}</div>
    </div>
  </div>`;
}
/* the tabs row: the chapter's own tabs (L: the chapter shown, or the last one, on the Albero and the notes), the Albero, the notes, Studia */
function hbTabs(L = LESSONS[hbLesson - 1]){
  const own = !!L && !hbTab.startsWith('notes:') && hbTab !== 'albero';
  let h = '';
  if (L && !(loosePage() && !own)){
    const pending = !practiceDone(L.n), vc = hasVocabCheck(L.n), locked = !vocabCheckDone(L.n), sel = t => own && hbTab === t;
    h += `<button role="tab" data-tab="lesson" aria-selected="${sel('lesson')}">Lesson</button>`;
    if (vc) h += `<button role="tab" data-tab="words" aria-selected="${sel('words')}" class="${locked && !sel('words') ? 'pulse' : ''}">Words${locked ? ' · ' + vocabWords(L.n).length : ' ✓'}</button>`;
    h += `<button role="tab" data-tab="practice" aria-selected="${sel('practice')}" class="${pending && !locked && !sel('practice') ? 'pulse' : ''}">Practice${locked ? ' 🔒' : pending ? ' · ' + L.exercises.length : ' ✓'}</button>`;
  }
  h += hbTreeButton() + hbNotesButtons();
  if (L && own && lessonCompleted(L.n) && !loosePage()) h += `<button class="tab-study" data-study="${L.n}" title="Study this lesson's words in Studio: flashcards and a quiz">${STUDY_ICON}Studia <span>${studyList(L.n).length}</span></button>`;
  return h;
}
/* the chapter list open or closed (Lezioni ▾); returns whether it is open */
function hbSwitch(open){
  const box = sheet.querySelector('#hbLessons'), b = sheet.querySelector('.hb-lz'); if (!box) return false;
  if (open === undefined) open = box.hidden;
  box.hidden = !open; if (b) b.setAttribute('aria-expanded', String(open));
  if (open){ const cur = box.querySelector('[data-ch][aria-pressed="true"]') || box.querySelector('[data-ch]:not(:disabled)'); if (cur){ cur.scrollIntoView({ block:'nearest' }); cur.focus({ preventScroll:true }); } }
  else if (b) b.focus({ preventScroll:true });
  return open;
}
const hbSwitchOpen = () => !!(modalOpen && sheet.querySelector('#hbLessons:not([hidden])'));
/* after a page is drawn: the tab shown scrolled into the row, the Albero's pointer line placed under its button (it is drawn outside the
   row's scrolling, position:fixed, so the row never clips it) */
function hbAfterRender(){
  const row = sheet.querySelector('.hb-top .tabs'); if (!row) return;
  const cur = row.querySelector('.hb-point') || row.querySelector('[aria-selected="true"]');
  if (cur && row.scrollWidth > row.clientWidth) row.scrollLeft = Math.max(0, cur.offsetLeft - (row.clientWidth - cur.offsetWidth) / 2);
  if (!row.dataset.hbScroll){ row.dataset.hbScroll = '1'; row.addEventListener('scroll', hbPlacePoint, { passive:true }); }
  hbPlacePoint();
}
function hbPlacePoint(){
  const line = modalOpen ? sheet.querySelector('.hb-top .hb-point-line') : null; if (!line) return;
  const b = line.parentElement.getBoundingClientRect(), w = line.offsetWidth, x = Math.max(8, Math.min(innerWidth - w - 8, b.left + b.width / 2 - w / 2));
  line.style.left = x + 'px'; line.style.top = (b.bottom + 10) + 'px';
  line.style.setProperty('--ax', (b.left + b.width / 2 - x) + 'px');
}
window.addEventListener('resize', () => { if (modalOpen && sheet.classList.contains('book')) hbAfterRender(); });
function renderHandbook(){
  if (hbTab === 'albero'){ if (treeShown() && !loosePage()){ sheet.classList.remove('vc-mode'); renderTree(); return; } hbTab = 'lesson'; }   // (the skill tree: ui/tree.js)
  if (hbTab.startsWith('notes:')){ const N = hbNotes().find(x => 'notes:' + x.id === hbTab); if (N && !loosePage()){ sheet.classList.remove('vc-mode'); renderNotes(N); return; } hbTab = 'lesson'; }
  const L = LESSONS[hbLesson - 1];
  if (!L){ sheet.innerHTML = `${hbHead({ title:esc(UNIT.title), tabs:hbTabs(null) })}<div class="sheet-body" id="hbBody"><p class="hb-about">${unitHook('handbookEmpty') || 'No chapters yet.'}</p></div>`; hbAfterRender(); return; }   // (a unit with no chapters yet)
  /* the word check (ui/vocab.js): a chapter with a Vocabolario gets a Words tab, and its practice waits for it */
  const vc = hasVocabCheck(hbLesson), locked = !vocabCheckDone(hbLesson);
  if (hbTab === 'words' && !vc) hbTab = 'lesson';
  sheet.innerHTML = `
    ${hbHead({ num:L.n, title:`<em>${esc(L.title)}</em>`, kicker:loosePage() ? 'A loose page · the rest of your handbook is missing' : '', tabs:hbTabs(L) })}
    <div class="sheet-body" id="hbBody"></div>`;
  const body = $('#hbBody');
  sheet.classList.remove('vc-mode');
  if (hbTab === 'lesson') renderLesson(body, L);
  else if (hbTab === 'words') renderWords(body, L);
  else if (locked) renderVocabLock(body, L);
  else renderPractice(body, L);
  hbAfterRender();
}
function renderLesson(body, L){
  const dlgRows = L.dialogue.map(([who, it, en]) =>
    `<li><span class="who">${who}</span><span class="it">${esc(it)}</span><span class="en">${esc(en)}</span>
      <button class="play" data-say="${esc(it)}" data-pitch="${L.pitches[who] || 1}" aria-label="Play: ${esc(it)}">${SPK}</button></li>`).join('');
  const cards = L.phrases.map(([it, en, note]) =>
    `<div class="phrase"><div class="it"><span>${esc(it)}</span><button class="play" data-say="${esc(it)}" aria-label="Play: ${esc(it)}">${SPK}</button></div>
      <div class="en">${esc(en)}</div><div class="note">${esc(note)}</div></div>`).join('');
  const boxes = (L.boxes || []).map(b => `<section class="hb-box" id="hb-${esc(b.id)}"><h3>${esc(b.title)}</h3><div class="callout">${b.html}</div></section>`).join('');
  body.innerHTML = `<p class="hb-about">${esc(L.sub)}</p>${boxes}
    <h3 id="hb-conversation">The conversation</h3>
    <p class="note">${esc(L.dlgNote)}${hasTTS ? '' : ' Your browser has no Italian voice, so read along.'}</p>
    <ol class="dialogue">${dlgRows}</ol>
    ${unitHook('chapterSections', L) || ''}
    <h3 id="hb-phrases">${esc(L.phrasesTitle)}</h3>
    <div class="phrases">${cards}</div>
    ${L.phrases2 ? `<h3 id="hb-phrases2">${esc(L.phrases2Title)}</h3><div class="phrases">${L.phrases2.map(([it, en, note]) =>
      `<div class="phrase"><div class="it"><span>${esc(it)}</span><button class="play" data-say="${esc(it)}" aria-label="Play: ${esc(it)}">${SPK}</button></div><div class="en">${esc(en)}</div><div class="note">${esc(note)}</div></div>`).join('')}</div>` : ''}
    ${L.extra ? `<h3 id="hb-extra">${esc(L.extraTitle)}</h3><p class="note">${esc(L.extraNote)}</p><div class="wordgrid">${L.extra.map(p => `<div><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>` : ''}
    ${L.numbersDrill ? `<div class="callout nd-call"><p><b>Numbers drill.</b> ${L.numbersDrillNote || 'Spell the numbers 0–20, then listen and type what you hear.'}</p><button class="btn primary" data-numbers>Open the numbers drill <small>N</small></button></div>` : ''}
    <section id="hb-how"><h3>How it works</h3>
    <div class="callout">${L.how}</div></section>
    <section id="hb-culture"><h3>Culture note</h3>
    <div class="callout culture">${L.culture}</div></section>
    <section id="hb-vocab">${renderVocabSection(L)}</section>
    <div class="cta">${!vocabCheckDone(L.n) ? `<button class="btn primary" data-tab="words">Learn the words · ${vocabWords(L.n).length}</button>`
      : `<button class="btn primary" data-tab="practice">${practiceDone(L.n) ? 'Practice again' : `Start practice · ${L.exercises.length} questions`}</button>`}</div>`;
}

window.__pxRight = () => PX.cur ? PX.cur.a : null;   // the tests: the right option of the question shown
function renderPractice(body, L){
  const EX = L.exercises;
  let P = PX[L.n] || (PX[L.n] = freshPX());
  if (practiceDone(L.n) && P.i >= EX.length){
    body.innerHTML = `
      <h3>${esc(L.doneTitle)}</h3>
      <p>Your tile bank now has what you need for this ${L.quest ? 'task' : 'lesson'}. Open the dictionary (<kbd>V</kbd>) to see everything you have learned.</p>
      <p class="note">Hover over a tile in a conversation to see what it means.</p>
      <div class="cta"><button class="btn" id="pxRedo">Practice again</button><button class="btn primary" id="pxGo">${esc(L.doneGo)}</button></div>`;
    $('#pxRedo').onclick = () => { PX[L.n] = freshPX(); renderPractice(body, L); };
    $('#pxGo').onclick = closeModal;
    return;
  }
  if (P.i >= EX.length) P = PX[L.n] = freshPX();
  const ex = EX[P.i];
  PX.cur = ex;                                   // (the tests: __pxRight())
  const prog = EX.map((_, k) => `<i class="${k < P.i ? 'done' : k === P.i ? 'cur' : ''}"></i>`).join('');
  let html = `<div class="ex-progress">${prog}</div><p class="ex-num">Question ${P.i + 1} of ${EX.length}</p>
    <p class="ex-q">${esc(fill(ex.q))}</p>${ex.en ? `<p class="ex-en">${esc(fill(ex.en))}</p>` : ''}`;
  /* the types: mc (options), order (tiles), and (Unit 2 on) listen (hear a line, its text hidden until answered, then options), pic
     (picture options: opts [{ svg, label }]), compass (tap a point of the rose: a = 'N' | 'E' | 'S' | 'W' …), type (type the Italian:
     answer, or accept:[…]; accents, case, punctuation and a small typo forgiven, as in Studio) */
  const listenBtn = () => `<div class="px-listen"><button class="btn px-play" data-px-say>${SPK}<span>${P.answered ? 'Ascolta di nuovo' : 'Ascolta'}</span></button>
      ${P.answered ? `<p class="px-heard">«${esc(fill(ex.say))}»</p>` : '<span class="listen-ph" aria-label="Text hidden: listen"><i style="width:5em"></i><i style="width:3em"></i><i style="width:4em"></i></span>'}</div>`;
  if (ex.type === 'listen') html += listenBtn() + `<div class="opts">${ex.opts.map((o, k) => `<button class="opt" data-opt="${k}">${esc(o)}</button>`).join('')}</div>`;
  else if (ex.type === 'pic') html += (ex.say ? listenBtn() : '') + `<div class="opts pics">${ex.opts.map((o, k) => `<button class="opt pic" data-opt="${k}" aria-label="${esc(o.label)}">${o.svg}<span>${esc(o.label)}</span></button>`).join('')}</div>`;
  else if (ex.type === 'compass') html += (ex.say ? listenBtn() : '') + `<div class="px-compass">${compassSVG({ points:ex.points, size:230, right:P.answered ? ex.a : null, wrong:P.picked })}</div>`;
  else if (ex.type === 'type') html += `<div class="px-type"><input id="pxIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type in Italian… no accents needed" aria-label="Your answer in Italian">
      <button class="btn primary" id="pxCheck">Check</button></div>`;
  else if (ex.type === 'mc') html += `<div class="opts">${ex.opts.map((o, k) => `<button class="opt" data-opt="${k}">${esc(o)}</button>`).join('')}</div>`;
  else html += `<div class="order"><div class="sentence" id="pxSlot" data-empty="Tap the tiles in order"></div><div class="bank" id="pxBank"></div>
      <div class="actions"><button class="btn" id="pxClear">Clear</button><button class="btn primary" id="pxCheck">Check</button></div></div>`;
  html += '<div id="pxFb"></div>';
  body.innerHTML = html;
  const fb = $('#pxFb');
  const good = () => {
    P.answered = true;
    const last = P.i === EX.length - 1;
    fb.innerHTML = `<div class="feedback good"><p><b>Esatto!</b> ${esc(fill(ex.why))}</p><button class="btn primary" id="pxNext">${last ? 'Finish' : 'Next'}</button></div>`;
    const nx = $('#pxNext'); nx.focus({ preventScroll:true });
    nx.onclick = () => {
      P.i++; P.answered = false; P.picked = [];
      if (P.i >= EX.length) finishPractice(L.n);
      if (isQuestKey(L.n)) renderScheda(); else renderHandbook();
    };
  };
  const bad = (extra = '') => { fb.innerHTML = `<div class="feedback bad"><p><b>Not quite.</b> ${extra}${esc(fill(ex.nudge))}</p></div>`; };
  const sayBtn = () => { const b = body.querySelector('[data-px-say]'); if (b) b.onclick = () => speak(fill(ex.say), 1, false, P.answered ? 0.75 : 0.9); };
  sayBtn();
  if (ex.say && !P.answered && P.spoken !== P.i){ P.spoken = P.i; setTimeout(() => speak(fill(ex.say), 1, false, 0.9), 250); }
  const reveal = () => { if (!ex.say) return; const w = body.querySelector('.px-listen'); if (w){ w.outerHTML = listenBtn(); sayBtn(); } };
  if (ex.type === 'listen' || ex.type === 'pic'){
    body.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => {
      if (P.answered) return;
      const k = +b.dataset.opt;
      if (k === ex.a){ b.classList.add('right'); good(); reveal(); if (ex.sayAfter) speak(fill(ex.sayAfter)); }
      else { b.classList.add('wrong'); bad(); }
    });
  } else if (ex.type === 'compass'){
    const wire = () => body.querySelectorAll('[data-compass]').forEach(g => g.onclick = () => {
      if (P.answered) return;
      const d = g.dataset.compass;
      if (d === ex.a){ P.answered = true; body.querySelector('.px-compass').innerHTML = compassSVG({ points:ex.points, size:230, right:d, wrong:P.picked }); speak(COMPASS_IT[d]); P.answered = false; good(); reveal(); }
      else { if (!P.picked.includes(d)) P.picked.push(d); body.querySelector('.px-compass').innerHTML = compassSVG({ points:ex.points, size:230, wrong:P.picked }); wire();
        bad(`That is <b>${COMPASS_IT[d]}</b> (${COMPASS_EN[d]}). `); }
    });
    wire();
  } else if (ex.type === 'type'){
    const inp = $('#pxIn');
    const check = () => {
      if (P.answered) return;
      const raw = inp.value.trim(); if (!raw){ inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); return; }
      const forms = [ex.answer, ...(ex.accept || [])].map(fill);
      const m = forms.map(f => ({ f, r:vcTypedMatch(raw, { it:f }) })).find(x => x.r.ok);
      if (m){ inp.disabled = true; speak(m.f); good(); if (m.r.fixed) fb.querySelector('.feedback p').insertAdjacentHTML('afterbegin', `<span class="fixes">${esc(m.f)}</span> `); }
      else bad();
    };
    $('#pxCheck').onclick = check;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); check(); } });
    setTimeout(() => inp.focus({ preventScroll:true }), 30);
  } else if (ex.type === 'mc'){
    body.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => {
      if (P.answered) return;
      const k = +b.dataset.opt;
      if (k === ex.a){ b.classList.add('right'); if (!ex.noSpeak && !/^[←→↑]|^At |^She |^It /.test(ex.opts[k])) speak(ex.opts[k]); good(); }
      else { b.classList.add('wrong'); bad(); }
    });
  } else {
    const tiles = ex.tiles.map(s => ({ w:norm(fill(s)), label:fill(s), name:s.includes('{') }));
    const draw = () => {
      const slot = $('#pxSlot'), bank = $('#pxBank');
      slot.innerHTML = ''; bank.innerHTML = '';
      P.picked.forEach((ti, k) => {
        const b = document.createElement('button'); const t = tiles[ti];
        b.className = 'tile' + (t.name ? ' name' : ''); b.textContent = t.label;
        b.onclick = () => { if (P.answered) return; P.picked.splice(k, 1); draw(); };
        slot.appendChild(b);
      });
      tiles.forEach((t, ti) => {
        const b = document.createElement('button');
        b.className = 'tile' + (t.name ? ' name' : '') + (P.picked.includes(ti) ? ' used' : '');
        b.textContent = t.label;
        b.onclick = () => { if (P.answered || P.picked.includes(ti)) return; P.picked.push(ti); draw(); };
        bank.appendChild(b);
      });
    };
    draw();
    $('#pxClear').onclick = () => { if (!P.answered){ P.picked = []; draw(); fb.innerHTML = ''; } };
    $('#pxCheck').onclick = () => {
      if (P.answered) return;
      const said = P.picked.map(i => tiles[i].w).join(' ');
      if (said === norm(fill(ex.answer))){ speak(P.picked.map(i => tiles[i].label).join(' ')); good(); }
      else bad();
    };
  }
}
function finishPractice(n){
  const dict = $('#btnDict');
  if (isQuestKey(n)){ schedaPracticeDone(n.slice(2)); dict.classList.add('pulse'); setTimeout(() => dict.classList.remove('pulse'), 4500); return; }
  if (unitHook('practiceFinished', n)){}            // (the unit's own chapters: Padova's Lessons 1–6)
  else if (hookFor(n)){
    const first = !S['practiceDone' + n];
    S['practiceDone' + n] = true; S['vocab' + n] = true;
    const h = hookFor(n); if (first && h.onPractice) h.onPractice();
  }
  dict.classList.add('pulse'); setTimeout(() => dict.classList.remove('pulse'), 4500);
  save(); renderHUD();
}

function filterDict(q){
  const k = keyOf(q.trim());
  sheet.querySelectorAll('.entry').forEach(e => { e.style.display = !k || keyOf(e.textContent).includes(k) ? '' : 'none'; });
  sheet.querySelectorAll('.sheet-body h3, .sheet-body .note, .sheet-body .empty').forEach(h => { h.style.display = k ? 'none' : ''; });
}
/* a dictionary word without its punctuation and ellipsis, to tell a tile and a Vocabolario word apart ("Ha …?" / "Ha …?") */
const dictKey = w => keyOf(String(w).replace(/[…?!.,]/g, ' ').replace(/\s+/g, ' ').trim());
/* The dictionary's contents as data: [{ title (html), blocks:[{ note? (html), cls?, entries:[{ w, en, key?, say? } | { num }] }], empty? (html) }].
   The engine's parts: the set phrases, the numbers, every completed or current lesson with a hook (its tiles once practised,
   then the rest of its Vocabolario), every quest's scheda once its word check is passed. The unit puts them in order and adds
   its own (UNIT.dictSections(parts): Padova's Lessons 1–6; Venezia's Unit 1 words); without one: set phrases, numbers,
   lessons, quests. */
function dictParts(){
  const ent = (w, en, key, say) => ({ w, en, key, say });
  const setP = { title:'Frasi fatte · set phrases', blocks:[{ note:'Everyday phrases you have mastered, now one tile each. They are always in your tile bank.',
    entries:setPhrases().map(p => ent(p.label, p.gloss, p.key)) }] };
  const nums = S.numbers && S.numbers.introDone ? { title:'Numeri 0–20', blocks:[{ note:'From the numbers drill (<kbd>N</kbd>). Careful with <i>sei</i> / <i>sedici</i> and <i>tre</i> / <i>tredici</i>.',
    cls:'dict nums', entries:NUM_SEQ.slice(0, NUM_TOP + 1).map(n => ({ num:n })) }] } : null;
  /* Lessons with hooks: the tiles (once practised), then the rest of the lesson's Vocabolario (every word it uses: what you
     type for a companion, what you hear), for every completed or current lesson, so any word a typed task needs can be
     looked up (davvero). Words already listed as a tile are not repeated. */
  const lessons = [];
  hooks().slice().sort((a, b) => b.n - a.n).forEach(h => {
    const tiles = S['vocab' + h.n] && h.vocab ? h.vocab : [];
    const seen = new Set(tiles.map(t => dictKey(fill(t.label))));
    const words = h.n <= S.lesson ? vocabWords(h.n, true).filter(w => !seen.has(dictKey(w.it))) : [];
    if (!tiles.length && !words.length) return;
    const blocks = [];
    if (tiles.length) blocks.push({ note:h.vocabNote || null, entries:tiles.map(t => ent(fill(t.label), t.en, t.key)) });
    if (words.length) blocks.push({ note:'Vocabolario: the other words of the lesson.', entries:words.map(w => ent(w.it, w.en, w.it, vcSay(w))) });
    lessons.push({ n:h.n, title:`Lezione ${h.n} · ${esc(LESSONS[h.n - 1].title)}`, blocks });
  });
  /* the quests' schede: once a scheda's word check is passed */
  const quests = QUESTS.filter(q => q.scheda && vocabCheckDone(questKey(q.id)) && hasVocabCheck(questKey(q.id))).map(q =>
    ({ id:q.id, title:`Compito · ${esc(q.title_it)}`, blocks:[{ note:'From the task\'s scheda.', entries:vocabWords(questKey(q.id), true).map(w => ent(w.it, w.en, w.it, vcSay(w))) }] }));
  return { setPhrases:setP, nums, lessons, quests };
}
const dictSections = () => { const P = dictParts(); return unitHook('dictSections', P) || [P.setPhrases, P.nums, ...P.lessons, ...P.quests].filter(Boolean); };
function dictSectionHTML(sec){
  const uses = k => k && S.wordStats[k] ? '×' + S.wordStats[k] : '';
  const entry = e => e.num !== undefined
    ? `<div class="entry"><button class="play" data-say="${numWord(e.num)}" aria-label="Play ${numWord(e.num)}">${SPK}</button>
        <div><div class="w"><span class="d">${e.num}</span> · ${numWord(e.num)}</div><div class="g">${NUM_EN[e.num]}</div></div></div>`
    : `<div class="entry"><button class="play" data-say="${esc(e.say || e.w)}" aria-label="Play ${esc(e.w)}">${SPK}</button>
        <div><div class="w">${esc(e.w)}</div><div class="g">${esc(e.en)}</div></div><span class="uses" title="Times you used this correctly">${uses(e.key)}</span></div>`;
  return `<h3>${sec.title}</h3>` + (sec.blocks || []).map(b => (b.note ? `<p class="note">${b.note}</p>` : '') + `<div class="${b.cls || 'dict'}">${b.entries.map(entry).join('')}</div>`).join('')
    + (sec.empty ? `<div class="empty">${sec.empty}</div>` : '');
}
/* the dictionary, as data (tests; the next unit's build) */
window.__dictData = () => dictSections().map(sec => ({ title:sec.title, blocks:(sec.blocks || []).map(b => ({ note:b.note || null, entries:b.entries })) }));
/* for the next unit's build (scripts/unit1-words.js, run in Node on this unit's bundle): every word this unit teaches, as its
   dictionary shows them at the end of the unit (the save the unit's UNIT.finishedState() describes; {Me} left for the
   player's name), and its set phrases. The real save is untouched. */
window.__unitExport = () => {
  const keep = S;
  S = Object.assign(FRESH(), { playerName:'{Me}' }, unitHook('finishedState') || {});
  try { return { unit:UNIT.id, title:UNIT.title, dictionary:window.__dictData(), setPhrases:SET_PHRASES.map(({ key, label, words, en }) => ({ key, label, words, en })) }; }
  finally { S = keep; }
};
function openDict(){
  if (introOpen) return;
  setTimeout(() => { const i = $('#dictSearch'); if (i) i.oninput = () => filterDict(i.value); }, 0);
  openModal('');
  const html = dictSections().map(dictSectionHTML).join('');
  const people = NPCS.filter(n => S.met[n.id]);
  const ppl = people.length
    ? `<div class="dict people">${people.map(n => `<div class="entry"><div><div class="w">${esc(n.name)}</div><div class="g">${esc(n.where)}</div></div></div>`).join('')}</div>`
    : '<div class="empty">No one yet. Names you learn in conversation appear here, and as tiles you can use.</div>';
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Il mio vocabolario</p><h2>Dictionary</h2><p class="sub">Your tile bank shows your set phrases plus the words for the situation you're in.</p></div>
      <button class="x" data-close aria-label="Close dictionary">×</button></div>
    <div class="sheet-body"><input id="dictSearch" class="dict-search" type="search" placeholder="Search in Italian or English…" autocomplete="off" aria-label="Search the dictionary">${html}<h3>People you know</h3>${ppl}
      ${unitHook('dictUsed') !== false ? '<p class="note" style="margin-top:14px">The green counter shows how often you have used a word or phrase correctly.</p>' : ''}</div>`;
}

/* tests: the words of the typed scripts' model answers (Lessons `from`+) that the OPEN dictionary has no entry for
   (matched on the Italian of each entry, whole words, accents and apostrophes ignored). tests/l08-mi-piace.js */
window.__dictAudit = (from = 6, to = S.lesson) => {
  const have = new Set(), out = new Set();
  document.querySelectorAll('.sheet .entry .w').forEach(e => vcTokens(e.textContent).forEach(w => have.add(keyOf(w))));
  const skip = new Set([...VOCAB_FUNCTION_WORDS, ...NPCS.map(n => n.name.toLowerCase()), S.playerName.toLowerCase()].map(keyOf));
  Object.entries(TYPED_SCRIPTS).forEach(([k, sc]) => {
    const m = /^l(\d+)-/.exec(sc.tut || ''); if (!m || +m[1] < from || +m[1] > to) return;
    (sc.steps || []).forEach(st => { if (typeof st.model === 'string') vcTokens(fill(st.model)).forEach(w => { if (!skip.has(keyOf(w)) && !have.has(keyOf(w))) out.add(`${k}: ${w}`); }); });
  });
  return [...out];
};
/* tests: the typed scripts' model answers, { key, tut, models } */
window.__typedModels = () => Object.entries(TYPED_SCRIPTS).map(([key, sc]) => ({ key, tut:sc.tut, models:(sc.steps || []).filter(s => typeof s.model === 'string').map(s => fill(s.model)) }));
/* for tests: __debug.handbook(n, { section }) opens a chapter at a section (window.__hbClosed is set when it closes);
   __debug.hbBoxes(n, boxes) gives a chapter boxes of its own */
Object.assign(window.__debug, { handbook(n, o = {}){ window.__hbClosed = false; openHandbook(n, { ...o, onClose:() => { window.__hbClosed = true; } }); },
  hbBoxes(n, boxes){ LESSONS[n - 1].boxes = boxes; } });
function hbDbg(){ const hl = sheet.querySelector('.hb-hl'); return { open:modalOpen && sheet.classList.contains('book'), lesson:hbLesson, tab:hbTab, section:hbLastSection, highlighted:hl ? hl.id : null,
  notes:hbNotes().map(N => ({ id:N.id, cards:N.cards.map(c => c.id) })) }; }
