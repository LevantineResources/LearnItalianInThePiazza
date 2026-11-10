/* Vocabolario: every word a lesson uses, and the required word check (flashcards, then a quiz).
   Shared code for Lessons 7+; see CLAUDE.md ("Vocabolario and the word check").

   A handbook chapter opts in with a `vocab` field (LESSONS.push({ …, vocab:[…] })):
     vocab:[
       { group:'At the stalls', note?:'…', words:[
           { it:'la maglietta', g:'f', en:'the T-shirt', note?:'Plural: le magliette.', say?:'…', also?:['magliette'], quiz?:false },
           { it:'rosso / rossa', en:'red' },                       adjectives: both forms, no g
       ] },
       { group:'Numbers 0–20', numbers:true, note:'…' },           numbers taught by the numbers drill (no cards)
     ]
   it: Italian as the player meets it (nouns WITH their article; g: 'm', 'f', 'm pl', 'f pl' is shown as a badge);
   en: a natural English gloss, unique within the lesson (it is a quiz answer); say: what the voice says (default: it,
   with " / " read as a pause and "…" dropped); also: other forms the coverage audit should count as taught;
   quiz:false: listed, but not a flashcard or a quiz item.

   What it does:
   - renderVocabSection(L)   the "Vocabolario" section at the end of the chapter's Lesson tab (ui/handbook.js)
   - the Words tab           the word check: 1) flashcards (each card is turned over: Italian ↔ English, spoken),
                             2) a quiz: every word answered right once (Italian → English, or English → Italian, 4 options,
                             distractors from the same group first); a missed word comes back three items later.
   - gating                  the chapter's Practice tab stays locked until the check is passed: vocabCheckDone(n) is
                             S['vocabCheck' + n] (set lazily, not in FRESH()) or practiceDone(n) (old saves).
   - finishVocabCheck(n)     sets S['vocabCheck' + n], toasts, and calls the lesson's onVocab() hook the first time.
   - vocabAudit()            { lesson: [words used in its tiles / typed model answers that no Vocabolario teaches] }
                             (window.__vocabAudit, tests/vocab-coverage.js); vocabLint() checks the lists themselves.
   Tests drive the check through __dbg().words (vocabDbg) and t.wordCheck() in tests/lib/harness.js.
   The flashcards and the quiz run on a "session" (below), so Studio (ui/study.js) reuses them for any word list. */

/* ---------- data ---------- */
/* n: a lesson number, or a quest's scheda key 'q:<id>' (engine/quests.js, ui/quests.js) */
const vocabOf = n => { if (isQuestKey(n)){ const s = questScheda(n.slice(2)); return s && Array.isArray(s.vocab) ? s.vocab : null; } const L = LESSONS[n - 1]; return L && Array.isArray(L.vocab) ? L.vocab : null; };
/* the cards / quiz items of a lesson, in order */
function vocabWords(n, all){
  const V = vocabOf(n); if (!V) return [];
  const out = [];
  V.forEach((g, gi) => (g.words || []).forEach((w, k) => { if (all || w.quiz !== false) out.push({ ...w, id:`${n}.${gi}.${k}`, gi, group:g.group }); }));
  return out;
}
const hasVocabCheck = n => vocabWords(n).length > 0;
const vocabCheckDone = n => !hasVocabCheck(n) || (isQuestKey(n) ? !!(questPeek(n.slice(2)) || {}).words : !!S['vocabCheck' + n]) || practiceDone(n);
const vcSay = w => w.say || w.it.replace(/\s*\/\s*/g, ', ').replace(/…/g, ' ').replace(/\s+([?.!,])/g, '$1').replace(/\s+/g, ' ').trim();
const VC_GENDER = { m:'masculine', f:'feminine', 'm pl':'masculine plural', 'f pl':'feminine plural' };
const vcBadge = g => g ? `<span class="vg-g ${g[0] === 'f' ? 'f' : 'm'}" title="${VC_GENDER[g] || esc(g)}">${esc(g)}</span>` : '';
function vcShuffle(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- the Vocabolario section (Lesson tab) ---------- */
function renderVocabSection(L){
  const V = vocabOf(L.n); if (!V) return '';
  const N = vocabWords(L.n).length, done = vocabCheckDone(L.n);
  const row = w => `<div class="vrow"><button class="play" data-say="${esc(vcSay(w))}" aria-label="Play: ${esc(w.it)}">${SPK}</button>
      <div class="vtxt"><div class="vit">${esc(w.it)}${vcBadge(w.g)}</div><div class="ven">${esc(w.en)}</div>${w.note ? `<div class="vnote">${esc(w.note)}</div>` : ''}</div></div>`;
  const grp = g => g.numbers
    ? `<div class="vgroup vnums"><p class="vg-title">${esc(g.group)}</p><p class="vnote">${g.note || ''}</p></div>`
    : `<div class="vgroup"><p class="vg-title">${esc(g.group)} <span>${g.words.length}</span></p>${g.note ? `<p class="vnote">${esc(g.note)}</p>` : ''}<div class="vlist">${g.words.map(row).join('')}</div></div>`;
  return `<h3 id="vocabolario">Vocabolario</h3>
    <p class="note">Every word you will tap, type or need to understand in this lesson. Tap a speaker to hear it. <b>f</b> = feminine (la), <b>m</b> = masculine (il).
      ${done ? '' : ` Before the practice: the <b>word check</b>, ${N} flashcards and a quick quiz.`}</p>
    <div class="vocab">${V.map(grp).join('')}</div>`;
}

/* ---------- sessions: the word check (Words tab) and Studio (ui/study.js), not saved ----------
   A session drives the flashcards and the quiz. The word check of chapter n is VC[n] (vcFresh(n)); Studio makes its own
   (studyStart in ui/study.js). Fields: n, mode:'check'|'study', words? (default vocabWords(n)), first:'it'|'en' (the side a
   card shows first), typeable?(w) (study: the word may be a typed item), pool?(w) (more distractors for w, best first), body?() (where it
   renders, default #hbBody). Every quiz answer, in either mode, is counted in the weak-word record (studyRecord). */
const VC = {};
let vcTimer = 0, vcTok = 0;
const vcFresh = n => ({ n, mode:'check', first:'it', phase:vocabCheckDone(n) ? 'passed' : 'cards', i:0, flipped:false, queue:[], right:new Set(), missed:[], cur:null, status:'answer', picked:-1 });
const vcState = n => VC[n] || (VC[n] = vcFresh(n));
const vcWords = s => s.words || vocabWords(s.n);
const vcIsStudy = s => !!s && s.mode === 'study';
/* the session whose screen is open: Studio's, or the word check of the chapter on the Words tab */
function vcActive(){
  if (!modalOpen) return null;
  if (sheet.classList.contains('study')) return studySession();
  if (sheet.classList.contains('scheda')) return SCH.tab === 'words' && SCH.id ? VC[questKey(SCH.id)] || null : null;   // a quest's scheda (ui/quests.js)
  if (sheet.classList.contains('book') && hbTab === 'words') return VC[hbLesson] || null;
  return null;
}
const vcOpen = () => !!vcActive();
const vcBody = s => s && s.body ? s.body() : $('#hbBody');

function renderWords(body, L){
  const s = vcState(L.n);
  /* the tab button that opened this must not keep focus: Enter / Space belong to the check */
  if (document.activeElement && sheet.contains(document.activeElement)) document.activeElement.blur();
  sheet.classList.add('vc-mode');                      // (narrow screens: a compact chapter header, see styles.css)
  vcRender(body, s);
}
function vcRender(body, s){
  if (s.phase === 'cards') vcCards(body, s, true);
  else if (s.phase === 'quiz') vcQuiz(body, s);
  else if (s.phase === 'done') vcDone(body, s);
  else vcPassed(body, s);
}
const vcTicks = (N, isDone, isCur) => `<div class="vc-ticks" aria-hidden="true">${Array.from({ length:N }, (_, k) => `<i class="${isDone(k) ? 'done' : isCur(k) ? 'cur' : ''}"></i>`).join('')}</div>`;
/* 1 Flashcards → 2 Quiz (→ 3 Practice, for the required check) */
const vcSteps = (step, s) => `<p class="vc-steps"><span class="${step === 1 ? 'on' : 'ok'}"><b>1</b> Flashcards</span><span class="vc-arrow">→</span><span class="${step === 2 ? 'on' : step > 2 ? 'ok' : ''}"><b>2</b> Quiz</span>${vcIsStudy(s) ? ''
  : `<span class="vc-arrow">→</span><span class="${step === 3 ? 'on' : ''}"><b>3</b> Practice</span>`}</p>`;

/* 1 · flashcards: Next turns the card over first, then moves on, so every card is seen both ways.
   s.first = 'en' (Studio's toggle) shows the English first; the Italian is spoken whenever its side comes up. */
const vcItalianUp = s => (s.first === 'en') === s.flipped;
function vcCards(body, s, speakIt){
  const W = vcWords(s), w = W[s.i], enFirst = s.first === 'en';
  const play = `<button class="play" data-say="${esc(vcSay(w))}" aria-label="Play: ${esc(w.it)}">${SPK}</button>`;
  const note = w.note ? `<span class="vc-note">${esc(w.note)}</span>` : '';
  const hint = '<span class="vc-hint">Tap to turn over</span>';
  const front = enFirst
    ? `<div class="vc-face vc-front en-first"><span class="vc-group">${esc(w.group)}</span><span class="vc-en">${esc(w.en)}</span>${hint}</div>`
    : `<div class="vc-face vc-front"><span class="vc-group">${esc(w.group)}</span><span class="vc-it">${esc(w.it)}${vcBadge(w.g)}</span>${play}${hint}</div>`;
  const back = enFirst
    ? `<div class="vc-face vc-back it-back"><span class="vc-group">${esc(w.en)}</span><span class="vc-it">${esc(w.it)}${vcBadge(w.g)}</span>${play}${note}</div>`
    : `<div class="vc-face vc-back"><span class="vc-group">${esc(w.it)}</span><span class="vc-en">${esc(w.en)}</span>${note}</div>`;
  const side = vcIsStudy(s) ? `<div class="vc-side"><div class="vc-seg" role="group" aria-label="Which side first">
        <button data-vc="first-it" aria-pressed="${!enFirst}">Italian first</button><button data-vc="first-en" aria-pressed="${enFirst}">English first</button></div>
        <button class="linkbtn" data-vc="skip">Skip to the quiz →</button></div>` : '';
  body.innerHTML = `<div class="vc">
      <div class="vc-top">${vcSteps(1, s)}<p class="vc-count"><b>${s.i + 1}</b> / ${W.length}</p></div>
      ${vcTicks(W.length, k => k < s.i, k => k === s.i)}
      ${side}
      <div class="vc-cardwrap">
        <div class="vc-card${s.flipped ? ' flipped' : ''}" data-vc="flip" role="button" tabindex="-1" aria-label="Turn the card over">${front}${back}</div>
      </div>
      <div class="vc-acts"><button class="btn" data-vc="prev" ${s.i ? '' : 'disabled'}>← Back</button><button class="btn primary" data-vc="next">${vcNextLabel(s, W)}</button></div>
      <p class="note vc-kbd"><kbd>Space</kbd> turn over / next · <kbd>←</kbd> back · <kbd>R</kbd> hear it again</p>
    </div>`;
  body.scrollTop = 0;
  if (speakIt && vcItalianUp(s)) speak(vcSay(w));
}
const vcNextLabel = (s, W) => !s.flipped ? 'Turn over' : s.i === W.length - 1 ? 'Start the quiz →' : 'Next card →';
function vcFlip(s){
  s.flipped = !s.flipped;
  const c = sheet.querySelector('.vc-card'), b = sheet.querySelector('[data-vc="next"]');
  if (c) c.classList.toggle('flipped', s.flipped);
  if (b) b.textContent = vcNextLabel(s, vcWords(s));
  if (vcItalianUp(s)) speak(vcSay(vcWords(s)[s.i]));
}
function vcCardNext(s){
  const W = vcWords(s);
  if (!s.flipped){ vcFlip(s); return; }
  if (s.i >= W.length - 1){ vcStartQuiz(s); return; }
  s.i++; s.flipped = false; vcCards(vcBody(s), s, true);
}
function vcCardPrev(s){ if (!s.i) return; s.i--; s.flipped = false; vcCards(vcBody(s), s, true); }

/* 2 · the quiz. Item types (dir): 'it' hear / see the Italian → pick the English; 'en' the English → pick the Italian;
   'type' the English → type the Italian (Studio only, words for which s.typeable(w) is true). */
function vcStartQuiz(s){
  const W = vcWords(s);
  s.phase = 'quiz'; s.right = new Set(); s.missed = [];
  s.queue = vcShuffle(W).map((w, k) => ({ id:w.id, dir:s.typeable && s.typeable(w) ? ['it', 'en', 'type'][k % 3] : k % 2 ? 'en' : 'it', again:false }));
  vcNextItem(s);
}
/* up to three distractors: same group first, then the rest of the list, then s.pool() (Studio) or earlier lessons.
   Never one with the same Italian or the same English as the answer (it would be right too), never two alike. */
function vcOptions(s, w, dir){
  const show = dir === 'it' ? 'en' : 'it', grp = x => x.gk || x.gi;
  const ok = x => x.id !== w.id && keyOf(x.it) !== keyOf(w.it) && keyOf(x.en) !== keyOf(w.en);
  const own = vcWords(s).filter(ok);
  let pool = [...vcShuffle(own.filter(x => grp(x) === grp(w))), ...vcShuffle(own.filter(x => grp(x) !== grp(w)))];
  if (s.pool) pool = pool.concat(s.pool(w).filter(ok));
  else for (let m = isQuestKey(s.n) ? LESSONS.length : s.n - 1; m >= 1 && pool.length < 3; m--) pool = pool.concat(vcShuffle(vocabWords(m).filter(ok)));
  const seen = new Set();
  pool = pool.filter(x => { const k = keyOf(x[show]); return !seen.has(k) && seen.add(k); });
  const opts = vcShuffle([w, ...pool.slice(0, 3)]);
  return { opts, answer:opts.indexOf(w), show };
}
function vcNextItem(s){
  clearTimeout(vcTimer); vcTok++;
  if (!s.queue.length){ vcFinish(s); return; }
  const q = s.queue.shift(), w = vcWords(s).find(x => x.id === q.id);
  s.cur = q.dir === 'type' ? { ...q, w, opts:[], answer:-1, show:'it', typed:'', fixed:null } : { ...q, w, ...vcOptions(s, w, q.dir) };
  s.status = 'answer'; s.picked = -1;
  vcQuiz(vcBody(s), s);
  if (q.dir === 'it') speak(vcSay(w));
}
function vcQuiz(body, s){
  if (!body) return;
  const W = vcWords(s), c = s.cur, w = c.w, st = s.status, N = W.length;
  const order = W.map(x => x.id);
  const prompt = c.dir === 'it'
    ? `<p class="vc-ask">What does it mean?</p><div class="vc-prompt"><button class="vc-disc" data-vc="say" aria-label="Hear it again">${SPK}</button><span class="vc-pit">${esc(w.it)}</span></div>`
    : `<p class="vc-ask">${c.dir === 'type' ? 'Type it in Italian' : 'How do you say it in Italian?'}</p><div class="vc-prompt"><span class="vc-pen">${esc(w.en)}</span></div>`;
  const label = x => c.show === 'en' ? esc(x.en) : esc(x.it);
  let answer;
  if (c.dir === 'type'){
    answer = `<div class="vc-type${st === 'answer' ? '' : ' ' + st}"><input id="vcType" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(c.typed)}" placeholder="In italiano… accents optional"
        aria-label="${esc(w.en)} in Italian" ${st === 'answer' ? '' : 'disabled'}>${st === 'answer' ? '<button class="btn primary" data-vc="check">Check</button>' : ''}</div>`;
  } else answer = `<div class="vc-opts">${c.opts.map((x, k) => {
    const cls = st === 'answer' ? '' : k === c.answer ? ' right' : k === s.picked ? ' wrong' : ' dim';
    return `<button class="opt vc-opt${c.show === 'it' ? ' it' : ''}${cls}" data-vq="${k}" ${st === 'answer' ? '' : 'tabindex="-1"'}><kbd>${k + 1}</kbd><span>${label(x)}</span></button>`;
  }).join('')}</div>`;
  const fix = c.fixed ? ` <span class="fixes vc-fix">Fixed: ${esc(c.typed)} → ${esc(w.it)}</span>` : '';
  const typed = c.dir === 'type' && c.typed ? ` You typed <s>${esc(c.typed)}</s>.` : '';
  let fb = '';
  if (st === 'right') fb = `<div class="vc-fb good"><p><b>Esatto!</b> <i>${esc(w.it)}</i> = ${esc(w.en)}${fix}</p><button class="btn${c.fixed ? ' primary' : ''}" data-vc="next">Next →</button></div>`;
  else if (st === 'wrong') fb = `<div class="vc-fb bad"><p><b>Not quite.</b>${typed} <i>${esc(w.it)}</i> = ${esc(w.en)}. <span class="vc-comeback">↻ It comes back later.</span></p><button class="btn primary" data-vc="next">Got it →</button></div>`;
  const keysNote = c.dir === 'type' ? '<kbd>Enter</kbd> to check, then next · accents and small typos are fixed for you'
    : `<kbd>1</kbd>–<kbd>${c.opts.length}</kbd> to answer · <kbd>Enter</kbd> next · <kbd>R</kbd> hear it again`;
  body.innerHTML = `<div class="vc">
      <div class="vc-top">${vcSteps(2, s)}<p class="vc-count"><b>${s.right.size}</b> / ${N} right</p></div>
      ${vcTicks(N, k => s.right.has(order[k]), k => order[k] === c.id && st === 'answer')}
      <div class="vc-stage ${st}">${c.again ? '<span class="vc-again">↻ Again</span>' : ''}<span class="vc-group">${esc(w.group)}</span>${prompt}</div>
      ${answer}
      <div id="vcFb">${fb}</div>
      <p class="note vc-kbd">${keysNote}</p>
    </div>`;
  if (st === 'answer') body.scrollTop = 0; else $('#vcFb').scrollIntoView({ block:'nearest' });
  const inp = $('#vcType');
  if (inp && st === 'answer'){
    inp.onkeydown = e => { if (e.key === 'Enter'){ e.preventDefault(); e.stopPropagation(); vcCheckTyped(s); } else if (e.key === 'Escape'){ e.preventDefault(); closeModal(); } };
    setTimeout(() => { if (vcActive() === s && document.activeElement !== inp) inp.focus({ preventScroll:true }); }, 30);
  }
}
function vcPick(s, k){
  if (s.phase !== 'quiz' || s.status !== 'answer' || !s.cur || s.cur.dir === 'type' || k >= s.cur.opts.length) return;
  s.picked = k;
  vcAnswer(s, k === s.cur.answer);
}
/* a typed item: accents, apostrophes and small typos are forgiven (and shown corrected); see vcTypedMatch */
function vcCheckTyped(s){
  if (s.phase !== 'quiz' || s.status !== 'answer' || !s.cur || s.cur.dir !== 'type') return;
  const inp = $('#vcType'), raw = inp ? inp.value.trim().replace(/\s+/g, ' ') : '';
  if (!raw){ if (inp){ inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); } return; }
  const r = vcTypedMatch(raw, s.cur.w);
  s.cur.typed = raw; s.cur.fixed = r.ok && r.fixed;
  vcAnswer(s, r.ok);
}
/* right or wrong: count it (studyRecord), say the word; a miss comes back three items later, the other way round
   (a typed item comes back typed) */
function vcAnswer(s, ok){
  const c = s.cur;
  studyRecord(c.w, ok);
  if (ok){
    s.status = 'right'; s.right.add(c.id);
    speak(vcSay(c.w));
    if (!c.fixed){
      const tok = vcTok; clearTimeout(vcTimer);
      vcTimer = setTimeout(() => { if (tok === vcTok && vcActive() === s && s.status === 'right') vcNextItem(s); }, 1300);
    }
  } else {
    s.status = 'wrong';
    if (!s.missed.includes(c.id)) s.missed.push(c.id);
    s.queue.splice(Math.min(3, s.queue.length), 0, { id:c.id, dir:c.dir === 'type' ? 'type' : c.dir === 'it' ? 'en' : 'it', again:true });
    speak(vcSay(c.w));
  }
  vcQuiz(vcBody(s), s);
  const nx = sheet.querySelector('[data-vc="next"]'); if (nx && (s.status === 'wrong' || c.fixed)) nx.focus({ preventScroll:true });
}
/* is a typed answer the word? Case, punctuation, accents and apostrophes never matter (shown corrected). A small typo is
   forgiven inside a word of 4+ letters (1 edit; 2 from 8 letters), but never in its last letter (the ending is the grammar:
   rosso / rossa, questo / questa) and never in short words (il / la, un / una). "rosso / rossa": either form, or both. */
function vcTypedMatch(raw, w){
  const plain = t => fill(String(t)).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[^\p{L}'\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  const words = t => keyOf(plain(t)).split(' ').filter(Boolean);
  const forms = [w.it, ...(w.it.includes(' / ') ? w.it.split(' / ') : [])];
  const typed = words(raw);
  const wordOk = (a, b) => a === b || (b.length >= 4 && a.slice(-1) === b.slice(-1) && lev(a, b, 2) <= (b.length >= 8 ? 2 : 1));
  for (const f of forms){
    const want = words(f);
    if (want.length !== typed.length) continue;
    if (want.every((x, k) => x === typed[k])) return { ok:true, fixed:plain(raw) !== plain(f) };
  }
  for (const f of forms){
    const want = words(f);
    if (want.length === typed.length && want.every((x, k) => wordOk(typed[k], x))) return { ok:true, fixed:true };
  }
  return { ok:false, fixed:false };
}
function vcFinish(s){
  s.phase = 'done'; s.cur = null;
  if (vcIsStudy(s)){ vcDone(vcBody(s), s); return; }
  finishVocabCheck(s.n);
  if (isQuestKey(s.n)){ renderScheda(); return; }      // a quest's scheda (ui/quests.js)
  renderHandbook();                                   // the tabs change: Words ✓, Practice unlocked
}
function vcDone(body, s){
  if (vcIsStudy(s)){ studyDone(body, s); return; }
  const W = vcWords(s), L = chapterOf(s.n), missed = s.missed.map(id => W.find(w => w.id === id)).filter(Boolean);
  body.innerHTML = `<div class="vc">
      <div class="vc-top">${vcSteps(3, s)}<p class="vc-count"><b>${W.length}</b> / ${W.length} right</p></div>
      ${vcTicks(W.length, () => true, () => false)}
      <div class="vc-stage done${missed.length ? '' : ' perfect'}">
        <div class="nd-stamp">${missed.length ? 'Bravo!' : 'Perfetto!'}</div>
        <p class="vc-status">${missed.length ? `All <b>${W.length} words</b> right in the end.` : `All <b>${W.length} words</b> right, first time.`} The practice is open.</p>
        ${missed.length ? `<p class="vc-status vc-sub">${missed.length === 1 ? 'This one came back:' : 'These came back:'}</p>${vcPills(missed)}` : ''}
      </div>
      <div class="cta"><button class="btn" data-vc="again">Flashcards again</button><button class="btn primary" data-tab="practice">${practiceDone(s.n) ? 'Go to the practice' : `Start the practice · ${L.exercises.length} questions`}</button></div>
    </div>`;
}
const vcPills = W => `<div class="vc-pills">${W.map(w => `<span class="vc-pill"><b>${esc(w.it)}</b><i>${esc(w.en)}</i></span>`).join('')}</div>`;
/* the check was passed before (or the practice was done in an older version): review, nothing required */
function vcPassed(body, s){
  const W = vcWords(s), L = chapterOf(s.n);
  body.innerHTML = `<div class="vc">
      <div class="vc-top">${vcSteps(3, s)}<p class="vc-count"><b>${W.length}</b> words</p></div>
      <div class="vc-stage done passed"><p class="vc-status"><b>✓ Word check passed.</b> Go through the cards or the quiz again whenever you like. The full list is at the end of the Lesson tab.</p></div>
      <div class="cta"><button class="btn" data-vc="again">Flashcards</button><button class="btn" data-vc="quiz">Quiz</button><button class="btn primary" data-tab="practice">${practiceDone(s.n) ? 'Practice' : `Start the practice · ${L.exercises.length} questions`}</button></div>
    </div>`;
}
function finishVocabCheck(n){
  if (isQuestKey(n)){ schedaWordsPassed(n.slice(2)); return; }
  const first = !S['vocabCheck' + n];
  S['vocabCheck' + n] = true; save();
  if (first){
    toast(`<b>${vocabWords(n).length} words learned!</b> The practice is open.`);
    const h = hookFor(n); if (h && h.onVocab) h.onVocab();
  }
  renderHUD();
}
/* the Practice tab while the check is still to do */
function renderVocabLock(body, L){
  const N = vocabWords(L.n).length;
  body.innerHTML = `<div class="vc-lock">
      ${vcSteps(1)}
      <div class="vc-lockcard"><span class="vc-lockico" aria-hidden="true">🔒</span><div><h3>Words first</h3>
        <p>The practice opens once you know this lesson's <b>${N} words</b>: flip through the flashcards, then get each one right in a short quiz.</p></div></div>
      <div class="cta"><button class="btn primary" data-tab="words">Learn the words · ${N}</button></div>
    </div>`;
}

/* ---------- input ---------- */
sheet.addEventListener('mousedown', e => { if (vcOpen() && e.target.closest('[data-vc], [data-vq]')) e.preventDefault(); });
sheet.addEventListener('click', e => {
  const s = vcActive(); if (!s) return;
  if (e.target.closest('[data-say]')) return;                    // the play button (ui/handbook.js speaks it)
  const q = e.target.closest('[data-vq]'); if (q){ vcPick(s, +q.dataset.vq); return; }
  const b = e.target.closest('[data-vc]'); if (!b || b.disabled) return;
  vcAct(s, b.dataset.vc);
});
function vcAct(s, a){
  if (a === 'flip') vcFlip(s);
  else if (a === 'next') s.phase === 'cards' ? vcCardNext(s) : s.status !== 'answer' && vcNextItem(s);
  else if (a === 'prev') vcCardPrev(s);
  else if (a === 'say') speak(vcSay(s.phase === 'cards' ? vcWords(s)[s.i] : s.cur.w), 1, false, 0.75);
  else if (a === 'again'){ Object.assign(s, { phase:'cards', i:0, flipped:false }); vcCards(vcBody(s), s, true); }
  else if (a === 'quiz' || a === 'skip') vcStartQuiz(s);
  else if (a === 'check') vcCheckTyped(s);
  else if (a === 'first-it' || a === 'first-en'){ s.first = a.slice(6); s.flipped = false; vcCards(vcBody(s), s, true); }
}
document.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const s = vcActive(); if (!s) return;
  if (e.target.closest && e.target.closest('#sheet button, #sheet input')) return;   // a focused button: its own click
  const k = e.key;
  if (s.phase === 'cards'){
    if (k === ' ' || k === 'Enter' || k === 'ArrowRight'){ e.preventDefault(); vcCardNext(s); }
    else if (k === 'ArrowLeft'){ e.preventDefault(); vcCardPrev(s); }
    else if (k === 'r' || k === 'R') vcAct(s, 'say');
  } else if (s.phase === 'quiz'){
    if (/^[1-4]$/.test(k)){ e.preventDefault(); vcPick(s, +k - 1); }
    else if (k === 'Enter' || k === ' '){ e.preventDefault(); if (s.status !== 'answer') vcNextItem(s); }
    else if (k === 'r' || k === 'R') vcAct(s, 'say');
  }
});

/* for tests: what a session shows (the word check: __dbg().words; Studio: __dbg().study.session) */
function vcDbg(s){
  const c = s && s.cur;
  return { phase:s ? s.phase : null, i:s ? s.i : 0, total:s ? vcWords(s).length : 0, flipped:!!(s && s.flipped), first:s ? s.first : 'it',
    status:s ? s.status : null, right:s ? s.right.size : 0, left:s ? s.queue.length : 0, missed:s ? s.missed.slice() : [],
    cur:c ? { id:c.id, key:c.w.key || studyKey(c.w.it), it:c.w.it, en:c.w.en, dir:c.dir, again:c.again, answer:c.answer, opts:c.opts.map(x => c.show === 'en' ? x.en : x.it),
      typed:c.typed || '', fixed:!!c.fixed } : null };
}
function vocabDbg(){
  const s = VC[hbLesson];
  return { ...vcDbg(s), open:!!s && vcActive() === s, n:hbLesson, total:vocabWords(hbLesson).length, passed:vocabCheckDone(hbLesson) };
}

/* ---------- the coverage audit ----------
   For every lesson with a Vocabolario: each word of its tiles (hook `vocab`, plus `bankTiles`) and of its typed scripts'
   model answers (TYPED_SCRIPTS whose tut starts with "lN-", or with lesson:N) must be taught by its own Vocabolario or an
   earlier one, by Lessons 1–6 (VOCAB1, VOCAB2, DIR_TILES, L4/L5/L6 tiles, SET_PHRASES; not PLACES, which later lessons extend), by an earlier lesson's
   tiles, by a numbers group (0–20), or be a name or one of VOCAB_FUNCTION_WORDS. A hooked lesson (7+) without a
   Vocabolario is reported as ['(no Vocabolario)']. */
const VOCAB_FUNCTION_WORDS = ['il', 'lo', 'la', "l'", 'i', 'gli', 'le', 'un', 'uno', 'una', 'e', 'di', 'a', 'ad', 'da', 'in', 'per'];
const vcTokens = s => String(s || '').replace(/\{me\}/gi, ' ').toLowerCase().replace(/[’‘`´]/g, "'")
  .replace(/[…?!.,:;()«»"“”–—]/g, ' ').split(/[\s/]+/).map(w => w.replace(/^'+/, '')).filter(Boolean);
const vcTileText = t => t.words || t.label || t.w || '';
function vocabRequired(n){
  const h = hookFor(n), texts = [];
  if (h) [...(h.vocab || []), ...(h.bankTiles || [])].forEach(t => texts.push(vcTileText(t)));
  Object.values(TYPED_SCRIPTS).forEach(sc => {
    if (sc.lesson !== n && !(typeof sc.tut === 'string' && sc.tut.startsWith('l' + n + '-'))) return;
    (sc.steps || []).forEach(st => { if (typeof st.model === 'string') texts.push(st.model); });
  });
  return texts;
}
function vocabAudit(){
  const known = new Set(VOCAB_FUNCTION_WORDS);
  const add = s => vcTokens(s).forEach(w => known.add(w));
  NPCS.forEach(n => add(n.name)); ['mark', 'emma'].forEach(add);
  [...VOCAB1, ...VOCAB2].forEach(v => add(v.w));
  [...DIR_TILES, ...L4_ALL, ...L5_TILES, ...L6_TILES, ...SET_PHRASES].forEach(t => add(vcTileText(t)));
  const out = {};
  LESSONS.forEach(L => {
    const n = L.n, h = hookFor(n), V = vocabOf(n);
    if (V){
      vocabWords(n, true).forEach(w => { add(w.it); (w.also || []).forEach(add); });
      if (V.some(g => g.numbers)) for (let i = 0; i <= 20; i++) add(numIt(i));
    }
    const req = vocabRequired(n);
    if (V) out[n] = [...new Set(req.flatMap(vcTokens).filter(w => !known.has(w)))];
    else if (h && n >= 7) out[n] = ['(no Vocabolario)'];
    req.forEach(add);
  });
  /* the quests (Lesson 12 on): the tiles their conversations use (scheda.tiles, scheda.bankTiles) must be taught by their
     scheda's Vocabolario or by any lesson (they come after every lesson: the town opens in Lesson 12). Key 'q:<id>'. */
  QUESTS.forEach(q => {
    const s = q.scheda; if (!s) return;
    const mine = new Set(known), key = questKey(q.id);
    vocabWords(key, true).forEach(w => { vcTokens(w.it).forEach(x => mine.add(x)); (w.also || []).forEach(a => vcTokens(a).forEach(x => mine.add(x))); });
    const req = [...(s.tiles || []), ...(s.bankTiles || [])].map(vcTileText);
    out[key] = [...new Set(req.flatMap(vcTokens).filter(w => !mine.has(w)))];
  });
  return out;
}
/* the lists themselves: English and Italian unique per lesson (they are quiz answers), nouns with an article have a gender */
function vocabLint(){
  const out = {};
  LESSONS.forEach(L => {
    if (!vocabOf(L.n)) return;
    const P = [], W = vocabWords(L.n, true), seen = { it:new Map(), en:new Map() };
    vocabOf(L.n).forEach(g => { if (!g.group) P.push('a group without a name'); if (!g.numbers && !(g.words || []).length) P.push(`${g.group}: no words`); });
    W.forEach(w => {
      if (!w.it || !w.en) P.push(`${w.it || '?'}: needs it and en`);
      ['it', 'en'].forEach(f => { const k = keyOf(String(w[f] || '')); if (seen[f].has(k)) P.push(`duplicate ${f}: ${w[f]}`); seen[f].set(k, w); });
      if (/^(il|lo|la|l'|i|gli|le) \S/i.test(w.it) && !/[?.!]$/.test(w.it) && !w.g) P.push(`${w.it}: a noun with an article needs g ('m' / 'f')`);
    });
    out[L.n] = P;
  });
  QUESTS.forEach(q => { const key = questKey(q.id); if (!vocabOf(key)) return; const P = [], seen = { it:new Set(), en:new Set() };
    vocabWords(key, true).forEach(w => { if (!w.it || !w.en) P.push(`${w.it || '?'}: needs it and en`);
      ['it', 'en'].forEach(f => { const k = keyOf(String(w[f] || '')); if (seen[f].has(k)) P.push(`duplicate ${f}: ${w[f]}`); seen[f].add(k); });
      if (/^(il|lo|la|l'|i|gli|le) \S/i.test(w.it) && !/[?.!]$/.test(w.it) && !w.g) P.push(`${w.it}: a noun with an article needs g ('m' / 'f')`); });
    out[key] = P; });
  return out;
}
window.__vocabAudit = vocabAudit;
window.__vocabLint = vocabLint;
