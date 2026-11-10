/* Handbook (lesson + practice tabs), special handbook tables, dictionary. */

/* =========================================================
   HANDBOOK, PRACTICE, DICTIONARY, PHONE, MAP, MODALS
   ========================================================= */
const modal = $('#modal'), sheet = $('#sheet');
let hbTab = 'lesson', hbLesson = 1;
const freshPX = () => ({ i:0, answered:false, picked:[] });
let PX = { 1:freshPX(), 2:freshPX(), 3:freshPX(), 4:freshPX(), 5:freshPX(), 6:freshPX() };
const practiceDone = n => isQuestKey(n) ? !!(questPeek(n.slice(2)) || {}).practice : ({ 1:S.practiceDone, 2:S.practiceDone2, 3:S.practiceDone3, 4:S.practiceDone4, 5:S.practiceDone5, 6:S.practiceDone6 })[n] ?? !!S['practiceDone' + n];

function openModal(cls){ sheet.className = 'sheet ' + (cls || ''); modal.hidden = false; modalOpen = true; keys.clear(); target = null; }
function closeModal(){ modal.hidden = true; modalOpen = false; sheet.innerHTML = ''; renderHUD(); const f = modalAfter; modalAfter = null; if (f) try { f(); } catch(e){ console.error(e); } }
let modalAfter = null;          // a one-off callback for when the modal closes (openHandbook's onClose)
modal.addEventListener('click', e => {
  if (e.target === modal) { closeModal(); return; }
  if (e.target.closest('[data-close]')) { closeModal(); return; }
  if (schedaClick(e)) return;                       // a quest's scheda: its own tabs (ui/quests.js)
  const s = e.target.closest('[data-say]'); if (s) { speak(s.dataset.say, +(s.dataset.pitch || 1)); return; }
  const st = e.target.closest('[data-study]'); if (st) { openStudy({ lessons:[+st.dataset.study], from:'handbook' }); return; }
  const ch = e.target.closest('[data-ch]'); if (ch && !ch.disabled) { hbLesson = +ch.dataset.ch; hbTab = 'lesson'; renderHandbook(); return; }
  const tab = e.target.closest('[data-tab]'); if (tab) { hbTab = tab.dataset.tab; renderHandbook(); return; }
  if (e.target.closest('[data-numbers]')) { openNumbers(); return; }
  const node = e.target.closest('[data-node]'); if (node) { onMapNode(node.dataset.node.split(',').map(Number)); return; }
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
  if (S.tut === 'walk' || S.tut === 'handbook') setTut('practice');
  if (S.tut === 'l2-handbook') setTut('l2-practice');
  if (S.tut === 'l3-handbook') setTut('l3-practice');
  if (S.tut === 'l4-handbook') setTut('l4-practice');
  if (S.tut === 'l5-handbook') setTut('l5-practice');
  const want = S.handbookLost ? 6 : (lesson || S.lesson);
  if (want !== hbLesson){ hbLesson = want; hbTab = 'lesson'; }
  if (opts.section) hbTab = 'lesson';
  openModal(S.handbookLost ? 'book page' : 'book'); renderHandbook();
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
function renderHandbook(){
  const L = LESSONS[hbLesson - 1];
  const pending = !practiceDone(hbLesson);
  /* the word check (ui/vocab.js): a chapter with a Vocabolario gets a Words tab, and its practice waits for it */
  const vc = hasVocabCheck(hbLesson), locked = !vocabCheckDone(hbLesson);
  if (hbTab === 'words' && !vc) hbTab = 'lesson';
  sheet.innerHTML = `
    <div class="sheet-head">
      <div><p class="kicker">${S.handbookLost ? 'A loose page · the rest of your handbook is missing' : 'Learn Italian Handbook'}</p><h2>Lezione ${L.n} · <em>${esc(L.title)}</em></h2><p class="sub">${esc(L.sub)}</p>
        <div class="chapters" role="group" aria-label="Chapters" ${S.handbookLost ? 'hidden' : ''}>
          ${LESSONS.map(x => { const lock = S.lesson < x.n || x.placeholder;     /* (placeholder: a stand-in chapter, lessons/14-dov-e-il-cane/content.js) */
            return `<button data-ch="${x.n}" aria-pressed="${x.n === hbLesson}" ${lock ? 'disabled title="' + (x.placeholder ? 'Coming soon' : 'Unlocks in Lezione ' + x.n) + '"' : ''}>${x.n} · ${esc(x.title)}${lock ? ' 🔒' : ''}</button>`; }).join('')}
        </div>
      </div>
      <button class="x" data-close aria-label="Close handbook">×</button>
    </div>
    <div class="tabs" role="tablist">
      <button role="tab" data-tab="lesson" aria-selected="${hbTab === 'lesson'}">Lesson</button>
      ${vc ? `<button role="tab" data-tab="words" aria-selected="${hbTab === 'words'}" class="${locked && hbTab !== 'words' ? 'pulse' : ''}">Words${locked ? ' · ' + vocabWords(hbLesson).length : ' ✓'}</button>` : ''}
      <button role="tab" data-tab="practice" aria-selected="${hbTab === 'practice'}" class="${pending && !locked && hbTab !== 'practice' ? 'pulse' : ''}">Practice${locked ? ' 🔒' : pending ? ' · ' + L.exercises.length : ' ✓'}</button>
      ${lessonCompleted(L.n) && !S.handbookLost ? `<button class="tab-study" data-study="${L.n}" title="Study this lesson's words in Studio: flashcards and a quiz">${STUDY_ICON}Studia <span>${studyList(L.n).length}</span></button>` : ''}
    </div>
    <div class="sheet-body" id="hbBody"></div>`;
  const body = $('#hbBody');
  sheet.classList.remove('vc-mode');
  if (hbTab === 'lesson') renderLesson(body, L);
  else if (hbTab === 'words') renderWords(body, L);
  else if (locked) renderVocabLock(body, L);
  else renderPractice(body, L);
}
function renderMenu(){
  const row = i => `<div class="li"><span class="nm">${esc(i.w)}</span><span class="art">${i.art}</span><span class="leader"></span><span class="price">${euroIt(i.price)}</span>
      <button class="play" data-say="${i.art} ${esc(i.w)}" aria-label="Play: ${i.art} ${esc(i.w)}">${SPK}</button><span class="desc">${esc(i.desc)}</span></div>`;
  return `<div class="listino"><p class="listino-title">Bar Centrale · <i>Listino prezzi</i></p>
    <p class="listino-sec">Da bere · to drink</p>${ITEMS.filter(i => i.kind === 'coffee' || i.kind === 'drink').map(row).join('')}
    <p class="listino-sec">Da mangiare · to eat</p>${ITEMS.filter(i => i.kind === 'pastry' || i.kind === 'food').map(row).join('')}</div>`;
}
/* Lesson 3's directions table (also a Studio word list, ui/study.js): [arrow, English, to a friend (tu), polite (Lei)],
   then the words around them [Italian, English] */
const DIR_TABLE = [
  ['↑', 'Go straight', 'Vai dritto', 'Vada dritto'],
  ['⇈', 'Keep going straight', 'Vai sempre dritto', 'Vada sempre dritto'],
  ['→', 'Turn right', 'Gira a destra', 'Giri a destra'],
  ['←', 'Turn left', 'Gira a sinistra', 'Giri a sinistra'],
];
const DIR_WORDS = [
  ['a destra','on / to the right'], ['a sinistra','on / to the left'], ['qui','here'], ['lì','there'],
  ['qui vicino','near here, around here'], ['vicino a …','near …'], ['dopo …','after …'], ['poi','then'],
  ['alla prima / seconda strada','at the first / second street'], ['non è lontano',"it's not far"],
  ['il quartiere','the neighbourhood'], ['non lo so',"I don't know"],
];
function renderDirTable(){
  const R = DIR_TABLE, P = DIR_WORDS;
  return `<table class="dirtable"><thead><tr><th></th><th></th><th>to a friend (tu)</th><th>polite (Lei)</th></tr></thead><tbody>
    ${R.map(r => `<tr><td class="arrow">${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b> <button class="play" data-say="${r[2]}" aria-label="Play ${r[2]}">${SPK}</button></td><td><b>${r[3]}</b> <button class="play" data-say="${r[3]}" aria-label="Play ${r[3]}">${SPK}</button></td></tr>`).join('')}
    </tbody></table>
    <div class="wordgrid">${P.map(p => `<div><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>`;
}
function renderMenu4(){
  const chip = t => t === 'veg' ? '<span class="art" style="background:#7fc89a">V</span>' : t === 'carne' ? '<span class="art" style="background:#f0a48f">carne</span>' : '<span class="art" style="background:#9cc3e6">pesce</span>';
  const row = d => `<div class="li"><span class="nm">${esc(d.label)}</span>${d.tags ? chip(d.tags[0]) : '<span></span>'}<span class="leader"></span><span class="price">${euroIt(d.price)}</span>
      <button class="play" data-say="${esc(d.label)}" aria-label="Play: ${esc(d.label)}">${SPK}</button><span class="desc">${esc(d.desc || d.en)}</span></div>`;
  const sec = c => `<p class="listino-sec">${c}</p>${DISHES.filter(d => d.course === c).map(row).join('')}`;
  return `<div class="listino"><p class="listino-title">Caffè Aurora · <i>Menù del giorno</i></p>
    ${['Primi','Secondi','Contorni','Dolci'].map(sec).join('')}
    <p class="listino-sec">Da bere</p>${DRINKS4.map(d => row({ ...d, desc:d.en })).join('')}
    <p class="listino-sec">Note</p>
    <div class="li"><span class="nm">Coperto</span><span></span><span class="leader"></span><span class="price">${euroIt(COPERTO)}</span><span></span><span class="desc">per person: bread and the table</span></div>
    <div class="li"><span class="nm">La pizza</span><span></span><span class="leader"></span><span class="price">solo la sera</span><span></span><span class="desc">evenings only, when the wood oven is lit</span></div></div>`;
}
function renderConj(){
  const P = ['io','tu','lui / lei / Lei','noi','voi','loro'];
  const V = [['mangiare','to eat',['mangio','mangi','mangia','mangiamo','mangiate','mangiano']],
             ['prendere','to have, take',['prendo','prendi','prende','prendiamo','prendete','prendono']],
             ['avere','to have',['ho','hai','ha','abbiamo','avete','hanno']],
             ['essere','to be',['sono','sei','è','siamo','siete','sono']],
             ['potere','can',['posso','puoi','può','possiamo','potete','possono']],
             ['volere','would like',['vorrei','vorresti','vorrebbe','vorremmo','vorreste','vorrebbero']]];
  return `<div class="conjwrap"><table class="conj"><thead><tr><th></th>${V.map(v => `<th>${v[0]}<span>${v[1]}</span></th>`).join('')}</tr></thead><tbody>
    ${P.map((p, i) => `<tr class="${[0, 2, 4].includes(i) ? 'hot' : ''}"><td class="who">${p}</td>${V.map(v => `<td>${v[2][i]}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>
    <p class="note">Highlighted: the rows you need today. <b>io</b> is you, <b>lui</b> is Mark, <b>voi</b> is how you ask the restaurant. Mangiare and prendere are regular: learn their endings and you can conjugate thousands of verbs. Volere is shown in its polite “would like” form.</p>`;
}
function renderLesson(body, L){
  const dlgRows = L.dialogue.map(([who, it, en]) =>
    `<li><span class="who">${who}</span><span class="it">${esc(it)}</span><span class="en">${esc(en)}</span>
      <button class="play" data-say="${esc(it)}" data-pitch="${L.pitches[who] || 1}" aria-label="Play: ${esc(it)}">${SPK}</button></li>`).join('');
  const cards = L.phrases.map(([it, en, note]) =>
    `<div class="phrase"><div class="it"><span>${esc(it)}</span><button class="play" data-say="${esc(it)}" aria-label="Play: ${esc(it)}">${SPK}</button></div>
      <div class="en">${esc(en)}</div><div class="note">${esc(note)}</div></div>`).join('');
  const boxes = (L.boxes || []).map(b => `<section class="hb-box" id="hb-${esc(b.id)}"><h3>${esc(b.title)}</h3><div class="callout">${b.html}</div></section>`).join('');
  body.innerHTML = `${boxes}
    <h3 id="hb-conversation">The conversation</h3>
    <p class="note">${esc(L.dlgNote)}${hasTTS ? '' : ' Your browser has no Italian voice, so read along.'}</p>
    <ol class="dialogue">${dlgRows}</ol>
    ${L.menu ? '<h3>The price list</h3><p class="note">Learn each word with its article. Tap a speaker to hear it.</p>' + renderMenu() : ''}
    ${L.menu4 ? '<h3>Il menù</h3><p class="note">Today\'s menu at Caffè Aurora. V = vegetarian.</p>' + renderMenu4() : ''}
    ${L.conj ? '<h3>Verbs: who is doing it?</h3><p class="note">Each verb changes its ending for each person.</p>' + renderConj()
      + (grammarUnlocked() ? '<div class="callout conj-drill"><p><b>Drill them.</b> Studio\'s <i>Verbi</i> tab: type the right form of every verb you have learned.</p><button class="btn primary" data-gr-open>Drill the verbs</button></div>' : '') : ''}
    ${L.directionsTable ? '<h3>Understanding directions</h3><p class="note">You will mostly <i>hear</i> these. Learn to recognise both columns.</p>' + renderDirTable() : ''}
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
  const prog = EX.map((_, k) => `<i class="${k < P.i ? 'done' : k === P.i ? 'cur' : ''}"></i>`).join('');
  let html = `<div class="ex-progress">${prog}</div><p class="ex-num">Question ${P.i + 1} of ${EX.length}</p>
    <p class="ex-q">${esc(fill(ex.q))}</p>${ex.en ? `<p class="ex-en">${esc(fill(ex.en))}</p>` : ''}`;
  if (ex.type === 'mc') html += `<div class="opts">${ex.opts.map((o, k) => `<button class="opt" data-opt="${k}">${esc(o)}</button>`).join('')}</div>`;
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
  const bad = () => { fb.innerHTML = `<div class="feedback bad"><p><b>Not quite.</b> ${esc(fill(ex.nudge))}</p></div>`; };
  if (ex.type === 'mc'){
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
  if (n === 1){
    const first = !S.practiceDone;
    S.practiceDone = true; S.vocab = true;
    if (first){ setTut('meet'); toast(`<b>${VOCAB1.length} words</b> added to your dictionary`); }
  } else if (n === 2){
    const first = !S.practiceDone2;
    S.practiceDone2 = true; S.vocab2 = true;
    if (first){ if (['l2-bar','l2-handbook','l2-practice'].includes(S.tut)) setTut('l2-order'); toast(`<b>${VOCAB2.length} bar words</b> added to your dictionary`); }
  } else if (n === 6){
    const first = !S.practiceDone6;
    S.practiceDone6 = true; S.vocab6 = true;
    if (first){ if (S.tut === 'l6-page') setTut('l6-chiara'); toast('The page\'s words are in your <b>dictionary</b>. Use its search box while you type.'); }
  } else if (n === 5){
    const first = !S.practiceDone5;
    S.practiceDone5 = true; S.vocab5 = true;
    if (first){ if (['l5-meet','l5-handbook','l5-practice'].includes(S.tut)) setTut('l5-introduce'); toast('New tiles: <b>introducing people</b>, plus a <b>Mark</b> name tile.'); }
  } else if (n === 4){
    const first = !S.practiceDone4;
    S.practiceDone4 = true; S.vocab4 = true;
    if (first){ if (['l4-start','l4-handbook','l4-practice'].includes(S.tut)) setTut('l4-order'); toast('New tiles for ordering for two: <b>who</b>, <b>verbs</b>, the <b>menu</b>. Your direction phrases are put away for now.'); }
  } else if (hookFor(n)){
    const first = !S['practiceDone' + n];
    S['practiceDone' + n] = true; S['vocab' + n] = true;
    const h = hookFor(n); if (first && h.onPractice) h.onPractice();
  } else {
    const first = !S.practiceDone3;
    S.practiceDone3 = true; S.vocab3 = true;
    if (first){ if (['l3-ask','l3-handbook','l3-practice'].includes(S.tut)) setTut('l3-directions'); toast('New tiles: <b>phrases for asking the way</b>. Your bar words are put away until you are back at the counter.'); }
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
function openDict(){
  if (introOpen) return;
  setTimeout(() => { const i = $('#dictSearch'); if (i) i.oninput = () => filterDict(i.value); }, 0);
  openModal('');
  const uses = k => S.wordStats[k] ? '×' + S.wordStats[k] : '';
  const entry = (w, g, k, say) => `<div class="entry"><button class="play" data-say="${esc(say || w)}" aria-label="Play ${esc(w)}">${SPK}</button>
        <div><div class="w">${esc(w)}</div><div class="g">${esc(g)}</div></div><span class="uses" title="Times you used this correctly">${uses(k)}</span></div>`;
  let html = '';
  const nums = S.numbers && S.numbers.introDone
    ? `<h3>Numeri 0–20</h3><p class="note">From the numbers drill (<kbd>N</kbd>). Careful with <i>sei</i> / <i>sedici</i> and <i>tre</i> / <i>tredici</i>.</p><div class="dict nums">${NUM_SEQ.slice(0, NUM_TOP + 1).map(n => `<div class="entry"><button class="play" data-say="${numWord(n)}" aria-label="Play ${numWord(n)}">${SPK}</button>
        <div><div class="w"><span class="d">${n}</span> · ${numWord(n)}</div><div class="g">${NUM_EN[n]}</div></div></div>`).join('')}</div>` : '';
  if (!S.vocab) html += '<h3>Words</h3><div class="empty">Your dictionary is empty. Words are added when you finish the practice in your handbook.</div>';
  else if (!L1done()) html += `<h3>Lezione 1 · Primi incontri</h3><div class="dict">${VOCAB1.map(v => entry(v.w, v.en, v.w)).join('')}</div>`;
  else {
    html += `<h3>Frasi fatte · set phrases</h3><p class="note">Everyday phrases you have mastered, now one tile each. They are always in your tile bank.</p>
      <div class="dict">${setPhrases().map(p => entry(p.label, p.gloss, p.key)).join('')}</div>` + nums;
    /* Lessons 7+: the tiles (once practised), then the rest of the lesson's Vocabolario (every word it uses: what you
       type for Mark, what you hear), for every completed or current lesson, so any word a typed task needs can be
       looked up (davvero). Words already listed as a tile are not repeated. */
    hooks().slice().sort((a, b) => b.n - a.n).forEach(h => {
      const tiles = S['vocab' + h.n] && h.vocab ? h.vocab : [];
      const seen = new Set(tiles.map(t => dictKey(fill(t.label))));
      const words = h.n <= S.lesson ? vocabWords(h.n, true).filter(w => !seen.has(dictKey(w.it))) : [];
      if (!tiles.length && !words.length) return;
      html += `<h3>Lezione ${h.n} · ${esc(LESSONS[h.n - 1].title)}</h3>`;
      if (tiles.length) html += `${h.vocabNote ? `<p class="note">${h.vocabNote}</p>` : ''}<div class="dict">${tiles.map(t => entry(fill(t.label), t.en, t.key)).join('')}</div>`;
      if (words.length) html += `<p class="note">Vocabolario: the other words of the lesson.</p><div class="dict">${words.map(w => entry(w.it, w.en, w.it, vcSay(w))).join('')}</div>`;
    });
    /* the quests' schede (Lesson 12 on): once a scheda's word check is passed */
    QUESTS.filter(q => q.scheda && vocabCheckDone(questKey(q.id)) && hasVocabCheck(questKey(q.id))).forEach(q => {
      html += `<h3>Compito · ${esc(q.title_it)}</h3><p class="note">From the task's scheda.</p><div class="dict">${vocabWords(questKey(q.id), true).map(w => entry(w.it, w.en, w.it, vcSay(w))).join('')}</div>`;
    });
    if (S.vocab6) html += `<h3>Lezione 6 · La pagina</h3><p class="note">The words from the loose page.</p><div class="dict">${L6_TILES.map(t => entry(t.label, t.en, t.key)).join('')}</div>`;
    if (S.vocab5) html += `<h3>Lezione 5 · Ti presento…</h3><p class="note">In your tile bank whenever Mark is with you, and outside the bar and restaurant.</p><div class="dict">${L5_TILES.map(t => entry(t.label, t.en, t.key)).join('')}</div>`;
    if (S.vocab4) html += `<h3>Lezione 4 · A pranzo</h3><p class="note">In your tile bank when you talk to a waiter.</p><div class="dict">${L4_ALL.map(t => entry(t.label, t.en, t.key)).join('')}</div>`;
    if (S.vocab3) html += `<h3>Lezione 3 · Asking the way</h3><p class="note">In your tile bank when you talk to people outside the bar.</p><div class="dict">${DIR_TILES.map(t => entry(fill(t.label), t.en, t.key)).join('')}</div>`;
    if (S.vocab2) html += `<h3>Lezione 2 · Al bar</h3><p class="note">In your tile bank when you talk to a barista.</p><div class="dict">${VOCAB2.map(v => entry(v.w, v.en, v.w)).join('')}</div>`;
    html += `<h3>Lezione 1 · Primi incontri</h3><p class="note">These words now live inside your set phrases.</p><div class="dict">${VOCAB1.map(v => entry(v.w, v.en, v.w)).join('')}</div>`;
  }
  if (!L1done()) html += nums;
  const people = NPCS.filter(n => S.met[n.id]);
  const ppl = people.length
    ? `<div class="dict people">${people.map(n => `<div class="entry"><div><div class="w">${esc(n.name)}</div><div class="g">${esc(n.where)}</div></div></div>`).join('')}</div>`
    : '<div class="empty">No one yet. Names you learn in conversation appear here, and as tiles you can use.</div>';
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Il mio vocabolario</p><h2>Dictionary</h2><p class="sub">Your tile bank shows your set phrases plus the words for the situation you're in.</p></div>
      <button class="x" data-close aria-label="Close dictionary">×</button></div>
    <div class="sheet-body"><input id="dictSearch" class="dict-search" type="search" placeholder="Search in Italian or English…" autocomplete="off" aria-label="Search the dictionary">${html}<h3>People you know</h3>${ppl}
      ${S.vocab ? '<p class="note" style="margin-top:14px">The green counter shows how often you have used a word or phrase correctly.</p>' : ''}</div>`;
}

/* tests: the words of the typed scripts' model answers (Lessons `from`+) that the OPEN dictionary has no entry for
   (matched on the Italian of each entry, whole words, accents and apostrophes ignored). tests/l08-mi-piace.js */
window.__dictAudit = (from = 6, to = S.lesson) => {
  const have = new Set(), out = new Set();
  document.querySelectorAll('.sheet .entry .w').forEach(e => vcTokens(e.textContent).forEach(w => have.add(keyOf(w))));
  const skip = new Set([...VOCAB_FUNCTION_WORDS, ...NPCS.map(n => n.name.toLowerCase()), 'mark', 'emma', S.playerName.toLowerCase()].map(keyOf));
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
function hbDbg(){ const hl = sheet.querySelector('.hb-hl'); return { open:modalOpen && sheet.classList.contains('book'), lesson:hbLesson, tab:hbTab, section:hbLastSection, highlighted:hl ? hl.id : null }; }
