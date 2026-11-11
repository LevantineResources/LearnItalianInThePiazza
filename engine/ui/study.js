/* Studio: study a completed lesson's words on their own (docs/features/study-and-hard-mode.md, part 1).
   No effect on progress. See CLAUDE.md ("Studio").

   openStudy(opts?)        the Studio screen: the T key (S is taken by WASD movement), the "Studio" header button (#btnStudy),
                           or a chapter's Studia button in the handbook (opts = { lessons:[n], from:'handbook' } starts at once)
   lessonCompleted(n)      the lesson's completion state is reached: S.lesson > n (a later lesson has started), or
                           S.lesson === n and S.tut is the lesson's done state ('done', 'l2-done' … 'l6-done', or the hook's
                           doneTut for 7+). Only completed lessons are listed; Studio is unlocked by the first one.
   studyList(n)            the lesson's words, as Vocabolario words ({ it, en, g?, note?, say? } + id, key, gi, gk, group, lesson):
                           Lessons 7+: the chapter's `vocab` (numbers groups left out). Lessons 1–6: built from their data
                           (STUDY_SOURCES below), leaving out words an earlier lesson's list already has.
   the weak-word record    S.study[key] = { right, wrong, last } (created lazily, not in FRESH()); key = studyKey(word).
                           Counted by every Studio quiz answer and every word-check answer (ui/vocab.js, vcAnswer), and as
                           wrong by a tile-bank turn that fails on a word (studyTileMiss, conversation/turns.js).
                           A word is weak while wrong > 0 and right < wrong + 2; "My weak words" lists the weak words of
                           completed lessons, worst right/(right+wrong) first (then most wrong, then most recent), 20 at most.
   The flashcards and the quiz are ui/vocab.js's sessions (mode:'study'): a side toggle (Italian / English first), and from
   STUDY_TYPE_FROM (Lesson 9) on, a third quiz item type: type the Italian (vcTypedMatch: accents and small typos forgiven).
   Two tabs: Parole (this file) and Verbi (the grammar drill, ui/grammar.js): ST.tab, stHead(). A third, Vedo, vedo (the I spy
   game, ui/ispy.js), once Lesson 10 is completed.
   Tests: __dbg().study (studyDbg), __debug.studyTypeFrom(n) (lets an earlier lesson's words be typed items),
   __debug.typedMatch(raw, it), __studyList(n), __studyLint(). */

let STUDY_TYPE_FROM = 9;
const STUDY_MAX_WEAK = 20;
const STUDY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="13" height="13" rx="2"/><path d="M8 8V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3"/></svg>';

/* ---------- completion ---------- */
/* the done state of the unit's own chapters (the lessons without a doneTut hook: Padova's 1–6), DONE_TUTS[n] = tut */
const DONE_TUTS = {};
function lessonCompleted(n){
  if (!LESSONS[n - 1]) return false;
  if (S.lesson > n) return true;
  if (S.lesson < n) return false;
  const h = hookFor(n), done = DONE_TUTS[n] || (h && h.doneTut);
  return !!done && S.tut === done;
}
const completedLessons = () => LESSONS.filter(L => !L.placeholder).map(L => L.n).filter(lessonCompleted);   // (placeholder: a stand-in chapter)
const studyUnlocked = () => lessonCompleted(1);

/* ---------- word lists ---------- */
/* a word's key in the record: lower case, punctuation and {Me} dropped, accents kept (è ≠ e) */
const studyKey = s => String(s || '').replace(/\{me\}/gi, ' ').toLowerCase().replace(/[’‘`´]/g, "'")
  .replace(/[^\p{L}'\s]/gu, ' ').replace(/\s+/g, ' ').trim();
/* the gender badge from a noun's article (only used for noun groups: "le presento" is not a plural) */
function studyGender(it){
  const s = it.toLowerCase();
  if (/^(il|lo|un|uno) /.test(s)) return 'm';
  if (/^(la|una) /.test(s) || /^un'/.test(s)) return 'f';
  if (/^(i|gli) /.test(s)) return 'm pl';
  if (/^le /.test(s)) return 'f pl';
  return { "l'insalata mista":'f' }[s] || undefined;
}
const tileWord = (t, o = {}) => ({ it:t.label, en:t.en, key:t.key, ...o });
const nounWord = (it, en, o = {}) => ({ it, en, g:studyGender(it), ...o });
const setPhrase = key => tileWord(SET_PHRASES.find(p => p.key === key));
/* the word lists of the unit's chapters without a Vocabolario (Padova's Lessons 1–6, built from the data their tiles and
   handbook pages use): STUDY_SOURCES[n] = () => [{ group, note?, words:[{ it, en, key?, g?, say?, note? }] }] */
const STUDY_SOURCES = {};
/* the handbook's phrase notes ("Literally: …") as card notes for Lessons 1–6 */
function studyNotes(n){
  const L = LESSONS[n - 1], m = new Map();
  [...(L.phrases || []), ...(L.phrases2 || [])].forEach(([it, , note]) => { if (note) m.set(studyKey(it), note); });
  return m;
}
const STUDY_CACHE = {};
function studyList(n){
  const me = S.playerName || '';
  if (STUDY_CACHE[n] && STUDY_CACHE[n].me === me) return STUDY_CACHE[n].words;
  const own = vocabOf(n), earlier = new Set();
  if (!own) for (let m = 1; m < n; m++) studyList(m).forEach(w => earlier.add(w.key));
  const groups = own || (STUDY_SOURCES[n] ? STUDY_SOURCES[n]() : []);
  const notes = own ? null : studyNotes(n), seen = new Set(), out = [];
  groups.forEach((g, gi) => !g.numbers && (g.words || []).forEach((w, k) => {     /* ids as in ui/vocab.js: lesson.group.word */
    if (w.quiz === false) return;
    const key = studyKey(w.key || w.it);
    if (!own && (earlier.has(key) || seen.has(key))) return;
    seen.add(key);
    const it = fill(w.it), note = w.note || (notes && notes.get(studyKey(w.it))) || undefined;
    out.push({ ...w, it, en:fill(w.en), note, key, id:`${n}.${gi}.${k}`, gi, gk:`${n}.${gi}`, group:g.group, lesson:n });
  }));
  STUDY_CACHE[n] = { me, words:out };
  return out;
}
/* every word of every lesson by key (and by its Italian), for the record: the first lesson that has it */
function studyIndex(){
  const m = new Map();
  LESSONS.forEach(L => studyList(L.n).forEach(w => { if (!m.has(w.key)) m.set(w.key, w); const k = studyKey(w.it); if (!m.has(k)) m.set(k, w); }));
  return m;
}
const studyResolve = k => { const w = studyIndex().get(studyKey(k)); return w ? w.key : studyKey(k); };

/* ---------- the weak-word record ---------- */
function studyRec(){ if (!S.study || typeof S.study !== 'object' || Array.isArray(S.study)) S.study = {}; return S.study; }
/* w: a word ({ key?, it }) or a key */
function studyRecord(w, ok){
  const k = typeof w === 'string' ? studyKey(w) : w.key || studyKey(w.it);
  if (!k) return;
  const R = studyRec(), r = R[k] || (R[k] = { right:0, wrong:0, last:0 });
  if (ok) r.right++; else r.wrong++;
  r.last = Date.now(); save();
}
/* a tile-bank turn that did not make sense (conversation/turns.js): the word it failed on counts as wrong — the noun with
   the wrong article (una caffè), the tile where the sentence stopped making sense, or questa / la mia amica for Mark */
function studyTileMiss(res, used){
  if (!res || res.wrongName) return;
  if (res.article){ const i = ITEM[res.article]; if (i) studyRecord(studyResolve(`${i.art} ${i.w}`), false); return; }
  if (res.gender){ res.gender.forEach(k => studyRecord(studyResolve(k), false)); return; }
  let k = 0;
  for (const t of used || []){
    const n = (t.tokens || [t]).length;
    if (res.at < k + n){ if (!(t.name && !t.tokens)) studyRecord(studyResolve(t.key || t.w || t.label), false); return; }
    k += n;
  }
}
const studyIsWeak = r => !!r && r.wrong > 0 && r.right < r.wrong + 2;
function studyWeak(){
  const R = S.study || {}, seen = new Set(), out = [];
  completedLessons().forEach(n => studyList(n).forEach(w => { if (seen.has(w.key)) return; seen.add(w.key); if (studyIsWeak(R[w.key])) out.push({ w, r:R[w.key] }); }));
  const ratio = x => x.r.right / (x.r.right + x.r.wrong);
  return out.sort((a, b) => ratio(a) - ratio(b) || b.r.wrong - a.r.wrong || b.r.last - a.r.last).slice(0, STUDY_MAX_WEAK).map(x => x.w);
}

/* ---------- the Studio screen ---------- */
const ST = { tab:'words', view:'list', sel:new Set(), from:null, s:null, first:'it' };
const stIsOpen = () => modalOpen && sheet.classList.contains('study');
const studySession = () => ST.tab === 'words' && ST.view === 'session' ? ST.s : null;
/* the head of every Studio screen. On the two list screens it has the tabs: Parole (words) and Verbi (the grammar drill,
   ui/grammar.js); a session or a table has a back button in its kicker instead. */
const ST_HEADS = {
  words:['Studio · ripasso', 'Study <em>your words</em>', 'Flashcards, then a quiz, for any lesson you have finished. Just practice: nothing here changes your progress.'],
  verbs:['Studio · grammatica', 'Drill <em>your verbs</em>', 'Type the right form for who is doing it. Just practice: nothing here changes your progress.'],
};
/* a unit's own Studio tabs, after Parole and Verbi: STUDY_TABS.push({ key, label, head:[kicker, title, sub], unlocked(), render() })
   (Padova: Vedo, vedo) */
const STUDY_TABS = [];
const studyTab = k => STUDY_TABS.find(t => t.key === k) || null;
function stHead(tab, inner, kicker, title, sub){
  const H = ST_HEADS[tab] || (studyTab(tab) || {}).head, locked = !grammarUnlocked();
  const tabs = inner ? '' : `<div class="tabs st-tabs" role="tablist">
      <button role="tab" data-st-tab="words" aria-selected="${tab === 'words'}">Parole · words</button>
      <button role="tab" data-st-tab="verbs" aria-selected="${tab === 'verbs'}"${locked ? ` title="Unlocks after Lezione ${UNIT.grammarFrom}"` : ''}>Verbi · verbs${locked ? ' 🔒' : ''}</button>${STUDY_TABS.filter(t => t.unlocked()).map(t => `
      <button role="tab" data-st-tab="${t.key}" aria-selected="${tab === t.key}">${t.label}</button>`).join('')}</div>`;
  return `<div class="sheet-head"><div><p class="kicker">${kicker || H[0]}</p><h2>${title || H[1]}</h2><p class="sub">${sub || H[2]}</p></div>
      <button class="x" data-close aria-label="Close Studio">×</button></div>${tabs}`;
}

function openStudy(opts = {}){
  if (introOpen || !studyUnlocked()) return;
  if (document.activeElement && document.activeElement !== document.body && !sheet.contains(document.activeElement)) document.activeElement.blur();
  ST.from = opts.from || null;
  ST.tab = opts.lessons || opts.weak ? 'words' : opts.tab || ST.tab;
  if (studyTab(ST.tab) && !studyTab(ST.tab).unlocked()) ST.tab = 'words';
  ST.sel = new Set([...ST.sel].filter(lessonCompleted));
  if (!ST.sel.size){ const done = completedLessons(); if (done.length) ST.sel.add(done[done.length - 1]); }   // the latest lesson, to start with
  openModal('study');
  if (opts.lessons && opts.lessons.length) studyStart(opts.lessons.filter(lessonCompleted));
  else if (opts.weak) studyStart([], true);
  else { ST.view = 'list'; ST.s = null; renderStudy(); }
}
const stLessonTitle = n => `Lezione ${n} · <em>${esc(LESSONS[n - 1].title)}</em>`;
function renderStudy(){
  if (!stIsOpen()) return;
  if (ST.tab === 'verbs') return renderGrammar();
  if (studyTab(ST.tab)) return studyTab(ST.tab).render();
  if (ST.view === 'session' && ST.s) return renderStudySession();
  const done = completedLessons(), weak = studyWeak(), next = LESSONS.find(L => !lessonCompleted(L.n));
  const sel = done.filter(n => ST.sel.has(n)), nWords = studyWordsFor(sel).length;
  const card = n => { const L = LESSONS[n - 1], on = ST.sel.has(n);
    return `<button class="st-lesson${on ? ' on' : ''}" data-st-pick="${n}" aria-pressed="${on}"><span class="st-n">${n}</span>
      <span class="st-t"><b>${esc(L.title)}</b><i>${esc(L.sub)}</i></span><span class="st-c"><b>${studyList(n).length}</b> words</span><span class="st-tick" aria-hidden="true">✓</span></button>`; };
  sheet.innerHTML = stHead('words') + `
    <div class="sheet-body st-body" id="stBody">
      <div class="st-weak${weak.length ? '' : ' empty'}">
        <span class="st-weakico" aria-hidden="true">!</span>
        <div><h3>My weak words</h3><p>${weak.length ? `<b>${weak.length} ${weak.length === 1 ? 'word' : 'words'}</b> you missed in a quiz or a conversation. Get each right a few more times and it drops off the list.`
          : 'Nothing yet. Words you miss in a quiz or a conversation collect here, so you can come back to them.'}</p>
          ${weak.length ? `<div class="st-weaklist">${weak.slice(0, 8).map(w => `<span>${esc(w.it)}</span>`).join('')}${weak.length > 8 ? `<span class="more">+${weak.length - 8}</span>` : ''}</div>` : ''}</div>
        <button class="btn${weak.length ? ' primary' : ''}" data-st="weak" ${weak.length ? '' : 'disabled'}>Study them${weak.length ? ' · ' + weak.length : ''}</button>
      </div>
      <div class="st-headrow"><h3>Your lessons</h3>${done.length > 1 ? `<button class="linkbtn" data-st="${sel.length === done.length ? 'none' : 'all'}">${sel.length === done.length ? 'Clear' : 'Select all'}</button>` : ''}</div>
      <p class="note">Pick one lesson, or several to mix them.${next ? ` Lezione ${next.n} joins the list when you finish it.` : ''}</p>
      <div class="st-lessons">${done.map(card).join('')}</div>
      ${studyQuests().length ? `<div class="st-headrow"><h3>Your tasks</h3></div><p class="note">The words of the town's tasks (Lezione 12 on): their <i>schede</i>.</p>
      <div class="st-lessons">${studyQuests().map(q => `<button class="st-lesson" data-st-quest="${q.id}"><span class="st-n">${(q.stamp || {}).icon || '!'}</span>
        <span class="st-t"><b>${esc(q.title_it)}</b><i>${esc(q.title_en)}</i></span><span class="st-c"><b>${studyList(questKey(q.id)).length}</b> words</span></button>`).join('')}</div>` : ''}
      <div class="st-go"><p>${sel.length ? `<b>${sel.length === 1 ? 'Lezione ' + sel[0] : sel.length + ' lessons'}</b> · ${nWords} words` : 'Pick a lesson'}</p>
        <button class="btn primary" data-st="start" ${sel.length ? '' : 'disabled'}>Start<span class="st-go-more"> · flashcards + quiz</span></button></div>
    </div>`;
}
/* the words of several lessons, each once (the earliest lesson's card) */
function studyWordsFor(ns){
  const seen = new Set(), out = [];
  ns.slice().sort((a, b) => a - b).forEach(n => studyList(n).forEach(w => { if (!seen.has(w.key)){ seen.add(w.key); out.push(w); } }));
  return out;
}
function studyStart(ns, weak){
  ns = [...new Set(ns)].sort((a, b) => a - b);
  let words = weak ? studyWeak() : studyWordsFor(ns);
  if (!words.length){ ST.view = 'list'; ST.s = null; renderStudy(); return; }
  const many = weak || ns.length > 1;
  if (many) words = words.map(w => ({ ...w, group:`L${w.lesson} · ${w.group}` }));
  if (!weak) ns.forEach(n => ST.sel.add(n));
  const all = () => studyWordsFor(completedLessons());
  ST.view = 'session';
  ST.s = { n:ns[0] || 0, mode:'study', lessons:ns, weak:!!weak, words,
    get first(){ return ST.first; }, set first(v){ ST.first = v; },          // the side toggle is kept between sessions
    phase:'cards', i:0, flipped:false, queue:[], right:new Set(), missed:[], cur:null, status:'answer', picked:-1,
    typeable:w => w.lesson >= STUDY_TYPE_FROM && !/…/.test(w.it),
    pool:w => [...vcShuffle(studyList(w.lesson)), ...vcShuffle(all())],   // more distractors: the word's lesson first
    body:() => $('#stBody') };
  renderStudySession();
}
/* the quests whose scheda's word check is passed (ui/quests.js): one list each, "Quest: …" */
const studyQuests = () => QUESTS.filter(q => q.scheda && (questPeek(q.id) || {}).words).sort((a, b) => (a.n || 0) - (b.n || 0));
function studyStartQuest(id){
  const q = questById(id), key = questKey(id), words = studyList(key);
  if (!q || !words.length) return;
  ST.view = 'session';
  ST.s = { n:key, mode:'study', lessons:[], quest:id, weak:false, words,
    get first(){ return ST.first; }, set first(v){ ST.first = v; },
    phase:'cards', i:0, flipped:false, queue:[], right:new Set(), missed:[], cur:null, status:'answer', picked:-1,
    pool:() => [...vcShuffle(words), ...vcShuffle(studyWordsFor(completedLessons()))], body:() => $('#stBody') };
  renderStudySession();
}
function renderStudySession(){
  const s = ST.s, ns = s.lessons;
  if (s.quest){ const q = questById(s.quest);
    sheet.innerHTML = stHead('words', true, `<button class="st-back" data-st="back">← Studio</button><span>Studio · ${s.words.length} words</span>`, `Compito · <em>${esc(q.title_it)}</em>`, esc(q.title_en)) + '<div class="sheet-body" id="stBody"></div>';
    vcRender($('#stBody'), s); return; }
  const title = s.weak ? 'My <em>weak words</em>' : ns.length === 1 ? stLessonTitle(ns[0]) : `<em>${ns.length} lessons</em> mixed`;
  const sub = s.weak ? 'The words you have missed most, worst first.' : ns.length === 1 ? esc(LESSONS[ns[0] - 1].sub) : ns.map(n => 'Lezione ' + n).join(' · ');
  const back = ST.from === 'handbook' ? '<button class="st-back" data-st="handbook">← Handbook</button>' : '<button class="st-back" data-st="back">← Studio</button>';
  sheet.innerHTML = stHead('words', true, `${back}<span>Studio · ${s.words.length} words</span>`, title, sub) + `
    <div class="sheet-body" id="stBody"></div>`;
  vcRender($('#stBody'), s);
}
/* the end of a Studio quiz (ui/vocab.js calls it from vcDone) */
function studyDone(body, s){
  const W = vcWords(s), missed = s.missed.map(id => W.find(w => w.id === id)).filter(Boolean), weak = studyWeak().length;
  body.innerHTML = `<div class="vc">
      <div class="vc-top">${vcSteps(3, s)}<p class="vc-count"><b>${W.length}</b> / ${W.length} right</p></div>
      ${vcTicks(W.length, () => true, () => false)}
      <div class="vc-stage done${missed.length ? '' : ' perfect'}">
        <div class="nd-stamp">${missed.length ? 'Bravo!' : 'Perfetto!'}</div>
        <p class="vc-status">${missed.length ? `All <b>${W.length} words</b> right in the end.` : `All <b>${W.length} words</b> right, first time.`}</p>
        ${missed.length ? `<p class="vc-status vc-sub">${missed.length === 1 ? 'This one is in your weak words now:' : 'These are in your weak words now:'}</p>${vcPills(missed)}` : ''}
      </div>
      <div class="cta"><button class="btn" data-vc="again">Flashcards again</button><button class="btn" data-vc="quiz">Quiz again</button>
        ${weak && !s.weak ? `<button class="btn" data-st="weak">My weak words · ${weak}</button>` : ''}
        <button class="btn primary" data-st="${ST.from === 'handbook' ? 'handbook' : 'back'}">${ST.from === 'handbook' ? 'Back to the handbook' : 'Back to Studio'}</button></div>
    </div>`;
}

/* ---------- input ---------- */
sheet.addEventListener('click', e => {
  if (!stIsOpen()) return;
  const tb = e.target.closest('[data-st-tab]');
  if (tb){ if (ST.tab !== tb.dataset.stTab){ ST.tab = tb.dataset.stTab; clearTimeout(vcTimer); renderStudy(); } return; }
  if (ST.tab !== 'words') return;
  const sq = e.target.closest('[data-st-quest]'); if (sq){ studyStartQuest(sq.dataset.stQuest); return; }
  const p = e.target.closest('[data-st-pick]');
  if (p){ const n = +p.dataset.stPick; ST.sel.has(n) ? ST.sel.delete(n) : ST.sel.add(n); renderStudy(); return; }
  const b = e.target.closest('[data-st]'); if (!b || b.disabled) return;
  const a = b.dataset.st;
  if (a === 'start') studyStart(completedLessons().filter(n => ST.sel.has(n)));
  else if (a === 'weak') studyStart([], true);
  else if (a === 'all'){ completedLessons().forEach(n => ST.sel.add(n)); renderStudy(); }
  else if (a === 'none'){ ST.sel.clear(); ST.view = 'list'; renderStudy(); }
  else if (a === 'back'){ ST.view = 'list'; ST.s = null; ST.from = null; renderStudy(); }
  else if (a === 'handbook'){ const n = ST.s && ST.s.lessons[0]; ST.view = 'list'; ST.s = null; ST.from = null; openHandbook(n || undefined); }
});
$('#btnStudy').onclick = () => openStudy();
Object.assign(window.__debug, { studyTypeFrom(n){ STUDY_TYPE_FROM = n; }, typedMatch:(raw, it) => vcTypedMatch(raw, { it }) });

/* for tests: __dbg().study */
function studyDbg(){
  return { open:stIsOpen(), view:ST.view, unlocked:studyUnlocked(), completed:completedLessons(), sel:[...ST.sel].sort((a, b) => a - b),
    lessons:completedLessons().map(n => ({ n, words:studyList(n).length })), weak:studyWeak().map(w => w.key),
    record:S.study ? JSON.parse(JSON.stringify(S.study)) : null,
    quests:studyQuests().map(q => q.id),
    session:ST.view === 'session' && ST.s ? { ...vcDbg(ST.s), lessons:ST.s.lessons.slice(), quest:ST.s.quest || null, weak:ST.s.weak, words:ST.s.words.map(w => w.key) } : null };
}
/* for tests and authors: every Lessons 1–6 list with duplicate Italian / English inside a list (quiz answers must be unique) */
window.__studyLint = () => {
  const out = {};
  LESSONS.forEach(L => { const P = [], seen = { it:new Set(), en:new Set() };
    studyList(L.n).forEach(w => ['it', 'en'].forEach(f => { const k = keyOf(String(w[f])); if (seen[f].has(k)) P.push(`duplicate ${f}: ${w[f]}`); seen[f].add(k); if (!w.en) P.push(w.it + ': no English'); }));
    out[L.n] = P; });
  return out;
};
/* for tests: a lesson's study list */
window.__studyList = n => studyList(n).map(w => ({ key:w.key, it:w.it, en:w.en, g:w.g, group:w.group, note:w.note }));
