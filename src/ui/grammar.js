/* The grammar drill: Studio's second tab, "Verbi" (docs/playtest-notes.md, "Feature · grammar drill"). See CLAUDE.md
   ("Grammar drill"). No effect on progress.

   grammarVerbs()       every verb taught: VERBS (content/verbs.js, Lessons 1–9) merged with every handbook chapter's
                        `verbs` field (Lessons 10+: forms take the chapter's n; a verb already listed gets the new forms).
                        Each verb: { inf, en, irr, note, lesson (its first form's), forms:[{ id, key, inf, p, it, en, lesson,
                        ex, mood }] }.
   grammarUnlocked()    lessonCompleted(4): Lesson 4 (the restaurant) is where verbs first change for who does them.
                        Before that the tab shows a locked card.
   a form is open       once its lesson is completed (lessonCompleted(f.lesson)); only open forms are drilled or shown.
   The list             the open verbs, grouped by the lesson that brought them, each selectable (all selected by default:
                        GR.off holds the ones switched off), each with a conjugation table (GR.view = 'table').
   A round              GR_ROUND (8 / 12 / 15) open forms of the selected verbs, the player's weakest first-ish, never the
                        same verb twice in a row if it can be helped. The English is shown (with the verb, its meaning and
                        the person: tu = "you (friend)", Lei = "you (polite)", lui / lei = "he / she"); the player types
                        the Italian (grMatch: case, punctuation, accents and apostrophes never matter, shown corrected; a
                        subject pronoun in front is accepted, "lui vorrebbe"; no typos: the ending is the grammar).
                        A miss comes back three prompts later; every prompt must be right once; then a results screen.
   The record           S.grammar = { rec:{ key:{ right, wrong, last } }, rounds, best } (lazy, not in FRESH()); key =
                        'inf:p:it'. Weak forms are picked first. Answers also count in Studio's weak-word record
                        (studyRecord) when the form is one of Studio's words (vorrebbe, può, hai…).
   Tests: __dbg().grammar (grammarDbg), __debug.grammarMatch(raw, it, p), __grammarVerbs(), __grammarLint(). */

const GR_PERSONS = [
  { p:'io', it:'io', en:'I' }, { p:'tu', it:'tu', en:'you, to a friend' }, { p:'Lei', it:'Lei', en:'you, polite' },
  { p:'lui', it:'lui / lei', en:'he, she, it' }, { p:'noi', it:'noi', en:'we' }, { p:'voi', it:'voi', en:'you, more than one' },
  { p:'loro', it:'loro', en:'they' },
];
const GR_PERSON = Object.fromEntries(GR_PERSONS.map(x => [x.p, x]));
/* what a form's English must start with (the lint), and the subject pronouns a player may type in front */
const GR_EN = { io:/^I\b/, tu:/^you \(friend\)|\(to a friend\)$/, Lei:/^you \(polite\)|\(polite\)$/, lui:/^(he \/ she|he|she|it)\b/, noi:/^we\b/, voi:/^you \(all\)/, loro:/^they\b/ };
const GR_PRON = { io:['io'], tu:['tu'], Lei:['lei'], lui:['lui', 'lei'], noi:['noi'], voi:['voi'], loro:['loro'] };
const GR_MOODS = { present:'Present', conditional:'Would like · conditional', imperative:'Commands · imperative', past:'Past · passato prossimo' };
/* the past (Lessons 13–14): a form with g ('m' / 'f') says who did it, so the essere participle's ending can be checked (è andato / è andata) */
const GR_MOOD_TAG = { imperative:'a command', conditional:'conditional', past:'passato prossimo' };
const GR_ROUNDS = [8, 12, 15];
let GR_ROUND = 12;

/* ---------- data ---------- */
function grammarVerbs(){
  const out = [], by = {};
  const add = (v, n) => {
    let V = by[v.inf];
    if (!V){ V = by[v.inf] = { inf:v.inf, en:v.en, irr:!!v.irr, note:v.note, mood:v.mood, forms:[] }; out.push(V); }
    else ['en', 'note', 'mood'].forEach(k => { if (!V[k] && v[k]) V[k] = v[k]; });
    (v.forms || []).forEach(f => {
      const mood = f.mood || v.mood || 'present';
      if (V.forms.some(x => x.p === f.p && x.it === f.it && x.mood === mood)) return;
      V.forms.push({ ...f, inf:v.inf, mood, lesson:f.lesson || n, key:`${v.inf}:${f.p}:${f.it}` });
    });
  };
  VERBS.forEach(v => add(v, 0));
  LESSONS.forEach(L => (L.verbs || []).forEach(v => add(v, L.n)));
  out.forEach(V => {
    V.forms.forEach((f, k) => f.id = `${V.inf}.${k}`);
    V.lesson = Math.min(...V.forms.map(f => f.lesson));
  });
  return out.sort((a, b) => a.lesson - b.lesson);
}
const grammarUnlocked = () => lessonCompleted(4);
const grOpen = f => lessonCompleted(f.lesson);
const grOpenVerbs = () => grammarUnlocked() ? grammarVerbs().filter(V => V.forms.some(grOpen)) : [];
const grForms = () => grammarVerbs().flatMap(V => V.forms);
const grVerb = inf => grammarVerbs().find(V => V.inf === inf);
const grFormById = id => grForms().find(f => f.id === id);
const grWho = (p, g) => p === 'lui' && g ? (g === 'f' ? 'lei' : 'lui') : (GR_PERSON[p] || { it:p }).it + (g && p !== 'lui' ? (g === 'f' ? ' · a woman' : ' · a man') : '');
/* the essere past: the typed form is the right one but for the participle's last letter (-o -a -i -e): the agreement */
function grAgree(raw, f){
  if (f.mood !== 'past') return null;
  const want = grBare(f.it), got = grBare(raw).replace(/^(io|tu|lui|lei|noi|voi|loro) /, '');
  if (!/^(sono|sei|e|siamo|siete) /.test(want) || got.length !== want.length || got === want || got.slice(0, -1) !== want.slice(0, -1) || !/[oaie]$/.test(got)) return null;
  return { end:want.slice(-1), who:f.g === 'f' ? (f.p === 'noi' ? 'only women' : 'a woman') : f.p === 'noi' ? 'a group' : 'a man' };
}

/* ---------- the record ---------- */
function grammarState(){
  if (!S.grammar || typeof S.grammar !== 'object' || Array.isArray(S.grammar)) S.grammar = {};
  const g = S.grammar;
  if (!g.rec || typeof g.rec !== 'object') g.rec = {};
  g.rounds = +g.rounds || 0; g.best = +g.best || 0;
  return g;
}
function grRecord(f, ok){
  const R = grammarState().rec, r = R[f.key] || (R[f.key] = { right:0, wrong:0, last:0 });
  if (ok) r.right++; else r.wrong++;
  r.last = Date.now();
  /* the same word in Studio's weak-word record, if it is one of Studio's words */
  const w = studyIndex().get(studyKey(f.it));
  if (w) studyRecord(w.key, ok); else save();
}
const grWeak = f => { const r = (S.grammar && S.grammar.rec || {})[f.key]; return !!r && r.wrong > 0 && r.right < r.wrong + 2; };

/* ---------- typed answers ---------- */
const grPlain = s => fill(String(s)).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[^\p{L}'\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const grBare = s => keyOf(grPlain(s)).replace(/\s+/g, ' ').trim();
/* { ok, fixed, pron } — fixed: accents (or apostrophes) were missing; pron: a subject pronoun was typed in front */
function grMatch(raw, f){
  const want = grBare(f.it), got = grBare(raw);
  if (got === want) return { ok:true, fixed:grPlain(raw) !== grPlain(f.it), pron:false };
  if (f.mood !== 'imperative' && !/^(mi|ti|le|lo|la) /.test(want)){
    for (const p of (f.p === 'lui' && f.g ? [f.g === 'f' ? 'lei' : 'lui'] : GR_PRON[f.p] || [])) if (got === p + ' ' + want){
      const rest = grPlain(raw).replace(/^\S+ /, '');
      return { ok:true, fixed:rest !== grPlain(f.it), pron:true };
    }
  }
  return { ok:false, fixed:false, pron:false };
}
/* a wrong answer that is another form of the same verb (or of another verb): what it is, for the feedback */
function grOther(raw, f){
  const got = grBare(raw).replace(/^(io|tu|lui|lei|noi|voi|loro) /, '');
  if (!got || got === grBare(f.it)) return null;
  const V = grVerb(f.inf), mine = V ? V.forms.filter(x => grOpen(x) && grBare(x.it) === got && x.id !== f.id) : [];
  if (mine.length) return mine[0];
  return grForms().find(x => grOpen(x) && x.inf !== f.inf && grBare(x.it) === got) || null;
}
/* the example with the form blanked out, if anything else is left to read */
function grClue(f){
  if (!f.ex) return '';
  const ex = fill(f.ex), i = ex.toLowerCase().indexOf(fill(f.it).toLowerCase());
  if (i < 0) return '';
  const blank = ex.slice(0, i) + '___' + ex.slice(i + fill(f.it).length);
  return /\p{L}/u.test(blank.replace('___', '')) ? blank : '';
}
const grExHTML = f => { if (!f.ex) return ''; const ex = esc(fill(f.ex)), it = esc(fill(f.it)), i = ex.toLowerCase().indexOf(it.toLowerCase());
  return i < 0 ? ex : ex.slice(0, i) + '<b>' + ex.slice(i, i + it.length) + '</b>' + ex.slice(i + it.length); };

/* ---------- state ---------- */
const GR = { view:'list', off:new Set(), table:null, s:null, from:'list' };
const grIsOpen = () => stIsOpen() && ST.tab === 'verbs';
const grSelected = () => grOpenVerbs().filter(V => !GR.off.has(V.inf));
const grPool = verbs => verbs.flatMap(V => V.forms.filter(grOpen));

/* ---------- rendering ---------- */
function renderGrammar(){
  if (!grIsOpen()) return;
  if (!grammarUnlocked()) return grLocked();
  if (GR.view === 'drill' && GR.s) return GR.s.phase === 'done' ? grDone() : grDrill();
  if (GR.view === 'table' && GR.table && grVerb(GR.table)) return grTable();
  GR.view = 'list'; grList();
}
const grIrr = V => V.irr ? '<span class="gr-irr" title="Irregular: learn each form">irregolare</span>' : '';
function grLocked(){
  const L = LESSONS[3];
  sheet.innerHTML = stHead('verbs') + `
    <div class="sheet-body st-body" id="stBody">
      <div class="vc-lock gr-lock">
        <div class="vc-lockcard"><span class="vc-lockico" aria-hidden="true">🔒</span><div><h3>Unlocks after Lezione 4</h3>
          <p>In <b>Lezione 4 · ${esc(L.title)}</b> you order for Mark, and the verbs start to change for who is doing it:
            <i>vorrei</i> → <i>vorrebbe</i>, <i>posso</i> → <i>può</i>. Finish it, and every verb you have learned is here to drill.</p></div></div>
        <div class="gr-preview" aria-hidden="true"><span>sto · stai · sta</span><span>vorrei · vorrebbe</span><span>posso · puoi · può</span><span>ho · hai · ha</span></div>
      </div>
    </div>`;
}
function grList(){
  const verbs = grOpenVerbs(), sel = grSelected(), pool = grPool(sel), N = Math.min(GR_ROUND, pool.length);
  const groups = [];
  verbs.forEach(V => { let g = groups.find(x => x.n === V.lesson); if (!g) groups.push(g = { n:V.lesson, verbs:[] }); g.verbs.push(V); });
  const later = grammarVerbs().filter(V => !V.forms.some(grOpen)), next = LESSONS.find(L => !lessonCompleted(L.n));
  const weak = grForms().filter(f => grOpen(f) && grWeak(f));
  const card = V => { const on = !GR.off.has(V.inf), open = V.forms.filter(grOpen);
    return `<div class="gr-verb${on ? ' on' : ''}">
        <button class="gr-pick" data-gr-pick="${esc(V.inf)}" aria-pressed="${on}"><span class="gr-inf">${esc(V.inf)}</span>
          <span class="gr-en">${esc(V.en)}</span><span class="gr-forms">${open.map(f => esc(fill(f.it))).filter((x, k, a) => a.indexOf(x) === k).map(x => `<span>${x}</span>`).join(' · ')}</span>
          <span class="st-tick" aria-hidden="true">✓</span></button>
        <button class="gr-tbl" data-gr-table="${esc(V.inf)}" title="The table: every form of ${esc(V.inf)}" aria-label="Table: ${esc(V.inf)}">${GR_TABLE_ICON}</button>
      </div>`; };
  const grp = g => { const all = g.verbs.every(V => !GR.off.has(V.inf));
    return `<div class="gr-group"><div class="gr-ghead"><p class="vg-title">Lezione ${g.n} · ${esc(LESSONS[g.n - 1].title)}</p>
        <button class="linkbtn" data-gr-group="${g.n}">${all ? 'None' : 'All'}</button></div>
      <div class="gr-verbs">${g.verbs.map(card).join('')}</div></div>`; };
  sheet.innerHTML = stHead('verbs') + `
    <div class="sheet-body st-body" id="stBody">
      <p class="note gr-intro">Read the English, type the Italian verb. Who is doing it decides the ending: <b>tu</b> for a friend,
        <b>Lei</b> for a stranger (the same form as <b>lui / lei</b>). Tap ${GR_TABLE_ICON.replace('<svg', '<svg class="gr-inl"')} for a verb's table.</p>
      ${weak.length ? `<p class="gr-weaknote"><span class="st-weakico" aria-hidden="true">!</span><span><b>${weak.length} ${weak.length === 1 ? 'form' : 'forms'}</b> you have missed: they come up first.</span></p>` : ''}
      <div class="st-headrow"><h3>Your verbs</h3>${verbs.length > 1 ? `<button class="linkbtn" data-gr="${sel.length === verbs.length ? 'none' : 'all'}">${sel.length === verbs.length ? 'Clear' : 'Select all'}</button>` : ''}</div>
      ${groups.map(grp).join('')}
      ${later.length && next ? `<p class="note">${later.length} more ${later.length === 1 ? 'verb joins' : 'verbs join'} as you finish lessons. Lezione ${next.n} adds new forms too.</p>` : ''}
      <div class="st-go gr-go"><p>${sel.length ? `<b>${N} prompts</b> · ${sel.length} ${sel.length === 1 ? 'verb' : 'verbs'}, ${pool.length} forms` : 'Pick a verb'}</p>
        <div class="gr-go-r"><div class="vc-seg" role="group" aria-label="Prompts per round">${GR_ROUNDS.map(n => `<button data-gr-round="${n}" aria-pressed="${n === GR_ROUND}">${n}</button>`).join('')}</div>
        <button class="btn primary" data-gr="start" ${sel.length ? '' : 'disabled'}>Start<span class="st-go-more"> · type the verbs</span></button></div></div>
    </div>`;
}
const GR_TABLE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/></svg>';

/* the conjugation table of one verb: its taught forms by mood and person; forms of lessons not finished yet are locked */
function grTable(){
  const V = grVerb(GR.table), moods = [...new Set(V.forms.map(f => f.mood))];
  const cell = f => grOpen(f)
    ? `<div class="gr-form"><span class="gr-fit"><b>${esc(fill(f.it))}</b><button class="play" data-say="${esc(fill(f.it))}" aria-label="Play: ${esc(fill(f.it))}">${SPK}</button></span>
        <span class="gr-fen">${esc(f.en)}</span>${f.ex ? `<span class="gr-fex">${grExHTML(f)}</span>` : ''}<span class="gr-l">L${f.lesson}</span></div>`
    : `<div class="gr-form locked"><span class="gr-fit">🔒 <i>Lezione ${f.lesson}</i></span><span class="gr-fen">${esc(f.en)}</span></div>`;
  const block = m => { const F = V.forms.filter(f => f.mood === m);
    const rows = GR_PERSONS.filter(P => F.some(f => f.p === P.p));
    return `${moods.length > 1 || m !== 'present' ? `<p class="vg-title gr-mood">${GR_MOODS[m] || esc(m)}</p>` : ''}
      <table class="gr-table"><tbody>${rows.map(P => `<tr><th scope="row"><b>${esc(P.it)}</b><span>${esc(P.en)}</span></th>
        <td>${F.filter(f => f.p === P.p).map(cell).join('')}</td></tr>`).join('')}</tbody></table>`; };
  const open = V.forms.filter(grOpen);
  sheet.innerHTML = stHead('verbs', true, `<button class="st-back" data-gr="back">← Verbi</button><span>Studio · the table</span>`,
      `<em>${esc(V.inf)}</em> ${grIrr(V)}`, esc(V.en)) + `
    <div class="sheet-body st-body" id="stBody">
      ${V.note ? `<p class="note gr-tnote">${esc(V.note)}</p>` : ''}
      ${moods.map(block).join('')}
      <p class="note">Only the forms the lessons have taught so far. ${GR_PERSONS.length > new Set(V.forms.map(f => f.p)).size ? 'The other persons come later.' : ''}</p>
      <div class="cta"><button class="btn" data-gr="back">Back to the verbs</button>
        <button class="btn primary" data-gr="drill-one" data-inf="${esc(V.inf)}" ${open.length ? '' : 'disabled'}>Drill ${esc(V.inf)} · ${open.length}</button></div>
    </div>`;
}

/* ---------- a round ---------- */
function grStart(forms, from){
  if (!forms.length) return;
  const shuffled = vcShuffle(forms), score = f => Math.random() + (grWeak(f) ? 1.2 : 0) + (grammarState().rec[f.key] ? 0 : 0.3);
  let pick = shuffled.map(f => ({ f, s:score(f) })).sort((a, b) => b.s - a.s).slice(0, Math.min(GR_ROUND, forms.length)).map(x => x.f);
  pick = vcShuffle(pick);
  /* never the same verb twice in a row, if it can be helped */
  for (let i = 1; i < pick.length; i++) if (pick[i].inf === pick[i - 1].inf){
    const j = pick.findIndex((x, k) => k > i && x.inf !== pick[i - 1].inf && (!pick[i + 1] || x.inf !== pick[i + 1].inf));
    if (j > 0) [pick[i], pick[j]] = [pick[j], pick[i]];
  }
  GR.view = 'drill'; GR.from = from || 'list';
  GR.s = { ids:pick.map(f => f.id), queue:pick.map(f => ({ id:f.id, again:false })), right:new Set(), missed:[], phase:'drill', cur:null, status:'answer' };
  grNext();
}
let grTimer = 0, grTok = 0;
function grNext(){
  clearTimeout(grTimer); grTok++;
  const s = GR.s; if (!s) return;
  if (!s.queue.length){ grFinish(); return; }
  const q = s.queue.shift();
  s.cur = { ...q, f:grFormById(q.id), typed:'', fixed:false, pron:false, other:null };
  s.status = 'answer';
  renderGrammar();
}
function grDrill(){
  const s = GR.s, c = s.cur, f = c.f, V = grVerb(f.inf), st = s.status, N = s.ids.length;
  const clue = grClue(f);
  const back = `<button class="st-back" data-gr="${GR.from === 'table' ? 'table-back' : 'back'}">← ${GR.from === 'table' ? esc(f.inf) : 'Verbi'}</button>`;
  sheet.innerHTML = stHead('verbs', true, `${back}<span>Studio · verbi</span>`, 'Type <em>the verb</em>', `${N} prompts. Who is doing it?`) + `
    <div class="sheet-body" id="stBody"><div class="vc gr-drill">
      <div class="vc-top"><p class="gr-k">Verbi · ${s.missed.length ? `<span class="gr-miss">${s.missed.length} to come back</span>` : 'first time right counts'}</p><p class="vc-count"><b>${s.right.size}</b> / ${N} right</p></div>
      ${vcTicks(N, k => s.right.has(s.ids[k]), k => s.ids[k] === c.id && st === 'answer')}
      <div class="vc-stage gr-stage ${st}">${c.again ? '<span class="vc-again">↻ Again</span>' : ''}
        <span class="vc-group gr-verbline"><b>${esc(f.inf)}</b> · ${esc(V.en)}${V.irr ? ' · <i>irregolare</i>' : ''}${f.mood !== 'present' ? ` · ${GR_MOOD_TAG[f.mood] || esc(f.mood)}` : ''}</span>
        <span class="gr-who">${esc(grWho(f.p, f.g))}</span>
        <div class="vc-prompt"><span class="vc-pen">${esc(f.en)}</span></div>
        ${st === 'answer' ? (clue ? `<p class="gr-clue">${esc(clue)}</p>` : '') : `<p class="gr-clue said"><span class="vc-pit">${esc(fill(f.it))}</span>${f.ex ? `<span class="gr-ex">${grExHTML(f)}</span>` : ''}</p>`}
      </div>
      <div class="vc-type${st === 'answer' ? '' : ' ' + st}"><input id="grType" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(c.typed)}" placeholder="In italiano… accents optional"
          aria-label="${esc(f.en)} in Italian" ${st === 'answer' ? '' : 'disabled'}>${st === 'answer' ? '<button class="btn primary" data-gr="check">Check</button>' : ''}</div>
      <div id="vcFb">${grFeedback(s)}</div>
      <p class="note vc-kbd"><kbd>Enter</kbd> to check, then next · accents are fixed for you, the ending must be right</p>
    </div></div>`;
  const inp = $('#grType');
  if (inp && st === 'answer'){
    inp.onkeydown = e => { if (e.key === 'Enter'){ e.preventDefault(); e.stopPropagation(); grCheck(); } else if (e.key === 'Escape'){ e.preventDefault(); closeModal(); } };
    setTimeout(() => { if (grIsOpen() && GR.s === s && document.activeElement !== inp) inp.focus({ preventScroll:true }); }, 30);
  } else { const nx = sheet.querySelector('[data-gr="next"]'); if (nx) nx.focus({ preventScroll:true }); }
}
function grFeedback(s){
  const c = s.cur, f = c.f, st = s.status, it = esc(fill(f.it));
  if (st === 'right'){
    const fix = c.fixed ? ` <span class="fixes vc-fix">Fixed: ${esc(c.typed)} → ${c.pron ? esc(c.typed.split(' ')[0]) + ' ' : ''}${it}</span>` : '';
    const pron = c.pron ? ` <span class="gr-pron">Italians usually leave out <i>${esc(c.typed.split(' ')[0].toLowerCase())}</i>: the ending already says who.</span>` : '';
    return `<div class="vc-fb good"><p><b>Esatto!</b> <i>${it}</i> = ${esc(f.en)}${fix}${pron}</p><button class="btn${c.fixed || c.pron ? ' primary' : ''}" data-gr="next">Next →</button></div>`;
  }
  if (st === 'wrong'){
    const o = c.other, ag = c.agree, what = ag ? ` <span class="gr-agree">Agreement: with <i>essere</i> the ending agrees with who did it. ${esc(ag.who === 'a group' || ag.who === 'only women' ? 'We' : grWho(f.p, f.g))} (${ag.who}): <b>-${ag.end}</b>.</span>`
      : o ? (o.inf === f.inf ? ` <i>${esc(fill(o.it))}</i> is <b>${esc(grWho(o.p, o.g))}</b>: ${esc(o.en)}.` : ` <i>${esc(fill(o.it))}</i> is ${esc(o.inf)}: ${esc(o.en)}.`) : '';
    return `<div class="vc-fb bad"><p><b>Not quite.</b> You typed <s>${esc(c.typed)}</s>.${what} For “${esc(f.en)}”: <b>${it}</b>. <span class="vc-comeback">↻ It comes back later.</span></p>
      <button class="btn primary" data-gr="next">Got it →</button></div>`;
  }
  return '';
}
function grCheck(){
  const s = GR.s; if (!s || s.status !== 'answer') return;
  const inp = $('#grType'), raw = inp ? inp.value.trim().replace(/\s+/g, ' ') : '';
  if (!raw){ if (inp){ inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); } return; }
  const c = s.cur, r = grMatch(raw, c.f);
  c.typed = raw; c.fixed = r.ok && r.fixed; c.pron = r.ok && r.pron;
  grRecord(c.f, r.ok);
  speak(fill(c.f.it));
  if (r.ok){
    s.status = 'right'; s.right.add(c.id);
    if (!c.fixed && !c.pron){ const tok = grTok; grTimer = setTimeout(() => { if (tok === grTok && grIsOpen() && GR.s === s && s.status === 'right') grNext(); }, 1300); }
  } else {
    s.status = 'wrong'; c.agree = grAgree(raw, c.f); c.other = grOther(raw, c.f);
    if (!s.missed.includes(c.id)) s.missed.push(c.id);
    s.queue.splice(Math.min(3, s.queue.length), 0, { id:c.id, again:true });
  }
  renderGrammar();
}
function grFinish(){
  const s = GR.s, g = grammarState();
  s.phase = 'done'; s.cur = null;
  g.rounds++; g.best = Math.max(g.best, s.ids.length - s.missed.length); save();
  renderGrammar();
}
function grDone(){
  const s = GR.s, N = s.ids.length, missed = s.missed.map(grFormById).filter(Boolean), first = N - missed.length;
  sheet.innerHTML = stHead('verbs', true, `<button class="st-back" data-gr="back">← Verbi</button><span>Studio · verbi</span>`, 'Type <em>the verb</em>', `${N} prompts. Who is doing it?`) + `
    <div class="sheet-body" id="stBody"><div class="vc gr-drill">
      <div class="vc-top"><p class="gr-k">Verbi · round done</p><p class="vc-count"><b>${N}</b> / ${N} right</p></div>
      ${vcTicks(N, () => true, () => false)}
      <div class="vc-stage done${missed.length ? '' : ' perfect'}">
        <div class="nd-stamp">${missed.length ? 'Bravo!' : 'Perfetto!'}</div>
        <p class="vc-status"><b>${first} / ${N}</b> right first time.${missed.length ? ' The rest right in the end.' : ''}</p>
        ${missed.length ? `<p class="vc-status vc-sub">${missed.length === 1 ? 'This one came back:' : 'These came back:'}</p>
          <div class="vc-pills">${missed.map(f => `<span class="vc-pill"><b>${esc(fill(f.it))}</b><i>${esc(f.inf)} · ${esc(f.en)}</i></span>`).join('')}</div>` : ''}
      </div>
      <div class="cta">${missed.length ? `<button class="btn" data-gr="missed">Just these · ${missed.length}</button>` : ''}
        <button class="btn" data-gr="back">Back to the verbs</button><button class="btn primary" data-gr="again">Another round</button></div>
    </div></div>`;
  const b = sheet.querySelector('[data-gr="again"]'); if (b) b.focus({ preventScroll:true });
}

/* ---------- input ---------- */
sheet.addEventListener('mousedown', e => { if (grIsOpen() && e.target.closest('[data-gr], [data-gr-pick], [data-gr-round]')) e.preventDefault(); });
sheet.addEventListener('click', e => {
  if (!grIsOpen()) return;
  const p = e.target.closest('[data-gr-pick]');
  if (p){ const v = p.dataset.grPick; GR.off.has(v) ? GR.off.delete(v) : GR.off.add(v); renderGrammar(); return; }
  const t = e.target.closest('[data-gr-table]'); if (t){ GR.table = t.dataset.grTable; GR.view = 'table'; renderGrammar(); sheet.querySelector('#stBody').scrollTop = 0; return; }
  const g = e.target.closest('[data-gr-group]');
  if (g){ const vs = grOpenVerbs().filter(V => V.lesson === +g.dataset.grGroup), all = vs.every(V => !GR.off.has(V.inf));
    vs.forEach(V => all ? GR.off.add(V.inf) : GR.off.delete(V.inf)); renderGrammar(); return; }
  const r = e.target.closest('[data-gr-round]'); if (r){ GR_ROUND = +r.dataset.grRound; renderGrammar(); return; }
  const b = e.target.closest('[data-gr]'); if (!b || b.disabled) return;
  const a = b.dataset.gr;
  if (a === 'start' || a === 'again') grStart(grPool(GR.from === 'table' && a === 'again' && GR.table ? grOpenVerbs().filter(V => V.inf === GR.table) : grSelected()), a === 'again' ? GR.from : 'list');
  else if (a === 'missed') grStart(GR.s.missed.map(grFormById).filter(Boolean), GR.from);
  else if (a === 'drill-one') grStart(grPool(grOpenVerbs().filter(V => V.inf === b.dataset.inf)), 'table');
  else if (a === 'check') grCheck();
  else if (a === 'next'){ if (GR.s && GR.s.status !== 'answer') grNext(); }
  else if (a === 'all'){ GR.off.clear(); renderGrammar(); }
  else if (a === 'none'){ grOpenVerbs().forEach(V => GR.off.add(V.inf)); renderGrammar(); }
  else if (a === 'table-back'){ clearTimeout(grTimer); GR.s = null; GR.view = 'table'; renderGrammar(); }
  else if (a === 'back'){ clearTimeout(grTimer); GR.s = null; GR.view = 'list'; GR.from = 'list'; renderGrammar(); }
});
document.addEventListener('keydown', e => {
  if (!grIsOpen() || GR.view !== 'drill' || !GR.s || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.closest && e.target.closest('#sheet button, #sheet input')) return;
  if ((e.key === 'Enter' || e.key === ' ') && GR.s.phase === 'drill' && GR.s.status !== 'answer'){ e.preventDefault(); grNext(); }
});
/* the handbook's Lesson 4 verb table: "Drill these verbs" */
modal.addEventListener('click', e => { if (e.target.closest('[data-gr-open]')){ clearTimeout(grTimer); GR.s = null; GR.view = 'list'; GR.from = 'list'; openStudy({ tab:'verbs' }); } });

/* ---------- tests ---------- */
function grammarDbg(){
  const s = GR.s, c = s && s.cur;
  return { open:grIsOpen(), view:GR.view, unlocked:grammarUnlocked(), round:GR_ROUND,
    verbs:grOpenVerbs().map(V => ({ inf:V.inf, lesson:V.lesson, forms:V.forms.filter(grOpen).length, total:V.forms.length })),
    sel:grSelected().map(V => V.inf), table:GR.view === 'table' ? GR.table : null, past:grOpenVerbs().reduce((a, V) => a + V.forms.filter(f => grOpen(f) && f.mood === 'past').length, 0),
    session:s ? { phase:s.phase, total:s.ids.length, right:s.right.size, left:s.queue.length, missed:s.missed.slice(), status:s.status,
      cur:c ? { id:c.id, key:c.f.key, inf:c.f.inf, p:c.f.p, it:fill(c.f.it), en:c.f.en, again:c.again, typed:c.typed, fixed:c.fixed, pron:c.pron, other:c.other ? c.other.id : null, mood:c.f.mood, g:c.f.g || null, agree:c.agree ? c.agree.end : null } : null } : null,
    record:S.grammar ? JSON.parse(JSON.stringify(S.grammar)) : null };
}
Object.assign(window.__debug, { grammarMatch:(raw, it, p = 'io', mood = 'present') => grMatch(raw, { it, p, mood }) });
window.__grammarVerbs = () => grammarVerbs().map(V => ({ inf:V.inf, en:V.en, irr:V.irr, lesson:V.lesson, forms:V.forms.map(f => ({ id:f.id, p:f.p, g:f.g, it:f.it, en:f.en, lesson:f.lesson, mood:f.mood })) }));
/* for tests and authors: problems in the verb list (persons, English that names the person, duplicates, lesson numbers) */
window.__grammarLint = () => {
  const P = [];
  grammarVerbs().forEach(V => {
    if (!V.inf || !V.en) P.push(`${V.inf || '?'}: needs inf and en`);
    const en = new Set();
    V.forms.forEach(f => {
      if (!GR_PERSON[f.p]) P.push(`${V.inf} ${f.it}: unknown person ${f.p}`);
      else if (!GR_EN[f.p].test(f.en)) P.push(`${V.inf} ${f.it}: the English "${f.en}" must name the person (${f.p})`);
      if (en.has(f.en)) P.push(`${V.inf}: duplicate English "${f.en}"`); en.add(f.en);
      if (!(f.lesson >= 1 && f.lesson <= LESSONS.length)) P.push(`${V.inf} ${f.it}: lesson ${f.lesson}`);
      if (!GR_MOODS[f.mood]) P.push(`${V.inf} ${f.it}: unknown mood ${f.mood}`);
      if (f.ex && !grExHTML(f).includes('<b>')) P.push(`${V.inf} ${f.it}: the example does not contain the form`);
    });
  });
  return P;
};
