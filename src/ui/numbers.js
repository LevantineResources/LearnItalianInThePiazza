/* Numbers drill (shared UI, first used in Lesson 7; see docs/lessons/07-al-mercato.md).

   openNumbers()            open it (N key, the Numeri header button, any [data-numbers] button in a modal)
   numbersUnlocked()        true when S.vocab7 is set or any lesson hook's numbersUnlocked() returns true
   numbersState()           S.numbers = { introDone, best, mastered }, created on first use (not in FRESH())

   Phase 1, spelling: 0 → 20, then 20 → 0 (42 entries). The digit is shown, the player types the word.
   Phase 2, listening rounds: the voice says n numbers (0–20), the player types the digits. Right → n + 1,
   wrong → what was said is shown and n stays. The first time a 5-number round is right:
   S.numbers.mastered = true and askHooks('onNumbersMastered'). Without an Italian voice (or with the voice
   off) each number word is shown for 1.2 s instead.
   Tests read the round from __dbg().drill (see numbersDbg()). */

const NUM_TOP = 20, NUM_MASTER = 5, NUM_GAP = 700, NUM_SHOW = 1200, NUM_SLOW = 0.7;
const NUM_EN = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen',
  'fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const NUM_SEQ = [...Array(NUM_TOP + 1).keys(), ...Array.from({ length:NUM_TOP + 1 }, (_, i) => NUM_TOP - i)];
const numWord = n => numIt(n);
const NUM_KEYS = Array.from({ length:NUM_TOP + 1 }, (_, i) => keyOf(numWord(i)));

function numbersState(){
  if (!S.numbers || typeof S.numbers !== 'object') S.numbers = { introDone:false, best:0, mastered:false };
  const s = S.numbers;
  s.introDone = !!s.introDone; s.best = Math.max(0, +s.best || 0); s.mastered = !!s.mastered;
  return s;
}
function numbersUnlocked(){ return !!S.vocab7 || !!askHooks('numbersUnlocked'); }

/* the drill in progress (not saved): a new save state (new game, reset, load) starts a fresh one */
const freshND = owner => ({ owner, phase:'intro', redo:false, i:0, shown:false, last:null, misses:0, fixes:0,
  n:1, current:[], typed:[], buf:'', status:'ready', playing:-1, word:'', visual:false, replays:0, token:0, justDone:false, result:null });
let ND = freshND(null);
const ndIsOpen = () => modalOpen && sheet.classList.contains('numbers');
/* for tests: what the drill is doing, including the numbers of the current round */
function numbersDbg(){
  return { open:ndIsOpen(), phase:ND.phase, i:ND.i, n:ND.n, current:ND.current.slice(), typed:ND.typed.slice(), buf:ND.buf,
    status:ND.status, visual:ND.visual, replays:ND.replays, spell:ND.phase === 'intro' ? NUM_SEQ[ND.i] : null };
}
/* can the drill speak? (re-checks the voice list, which some browsers fill in late) */
function ndVoice(){ if (!hasTTS || !S.sound) return false; pickVoice(); return !!itVoice; }

function openNumbers(){
  if (introOpen) return;
  const st = numbersState();
  if (ND.owner !== st) ND = freshND(st);
  if (st.introDone && ND.phase === 'intro' && !ND.redo) ND.phase = 'listen';
  ND.token++; ND.playing = -1; ND.word = '';
  if (ND.status === 'playing') ND.status = 'answer';
  /* the button or key that opened the drill must not keep focus: Enter belongs to the drill */
  if (document.activeElement && document.activeElement !== document.body && !sheet.contains(document.activeElement)) document.activeElement.blur();
  openModal('numbers');
  renderNumbers();
}

/* ---------- rendering ---------- */
function renderNumbers(){
  if (!ndIsOpen()) return;
  if (ND.phase === 'intro') renderSpell(); else renderListen();
}
const ndHead = (title, sub) => `<div class="sheet-head"><div><p class="kicker">Numeri · 0–20</p><h2>${title}</h2><p class="sub">${sub}</p></div>
  <button class="x" data-close aria-label="Close the numbers drill">×</button></div>`;

function renderSpell(){
  const n = NUM_SEQ[ND.i], up = ND.i <= NUM_TOP, L = ND.last;
  const ticks = NUM_SEQ.map((_, k) => `<i class="${k < ND.i ? 'done' : k === ND.i ? 'cur' : ''}${k === NUM_TOP ? ' turn' : ''}"></i>`).join('');
  let fb = '';
  if (ND.shown) fb = `<p class="nd-fb bad"><b>${n}</b> is <b>${esc(numWord(n))}</b>. Type it to go on.</p>`;
  else if (L && L.fixed) fb = `<p class="nd-fb good"><span class="fixes">Fixed: ${esc(L.fixed)} → ${esc(L.word)}</span> ${L.n} · ${esc(L.word)}</p>`;
  else if (L) fb = `<p class="nd-fb good">✓ ${L.n} · <b>${esc(L.word)}</b></p>`;
  sheet.innerHTML = ndHead('Spell <em>the numbers</em>', 'Type each number in Italian: up to twenty, then back down to zero.') + `
    <div class="sheet-body nd-body">
      <div class="nd-track" aria-hidden="true"><div class="nd-ticks">${ticks}</div></div>
      <p class="nd-count"><span>${up ? '↑ Counting up to 20' : '↓ Back down to 0'}</span><b>${ND.i} / ${NUM_SEQ.length}</b></p>
      <div class="nd-spell">
        <div class="nd-tag${ND.shown ? ' shown' : ''}" aria-label="Number ${n}"><span class="hole"></span><b>${n}</b>${ND.shown ? `<span class="w">${esc(numWord(n))}</span>` : ''}</div>
        <div class="nd-spell-in">
          <label for="ndInput">How do you say <b>${n}</b> in Italian?</label>
          <div class="nd-row"><input id="ndInput" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${ND.shown ? esc(numWord(n)) : 'Type the word…'}" aria-label="The number ${n} in Italian">
            <button class="btn primary" data-nd="spell">Check</button></div>
          <div id="ndFb">${fb}</div>
        </div>
      </div>
      <p class="note">Accents and small typos are fixed for you. Each word is said aloud when you get it right.</p>
    </div>`;
  const inp = $('#ndInput');
  inp.onkeydown = e => {
    if (e.key === 'Enter'){ e.preventDefault(); ndSpell(); }
    else if (e.key === 'Escape'){ e.preventDefault(); closeModal(); }
  };
  setTimeout(() => { if (ndIsOpen() && document.activeElement !== inp) inp.focus({ preventScroll:true }); }, 30);
}

function ndSpell(){
  const inp = $('#ndInput'); if (!inp) return;
  const raw = inp.value.trim().replace(/\s+/g, ' ');
  if (!raw) return;
  const n = NUM_SEQ[ND.i], word = numWord(n), target = NUM_KEYS[n];
  const k = keyOf(raw).replace(/[^a-z]/g, '');
  let ok = k === target, fixed = null;
  if (!ok && target.length > 3 && !NUM_KEYS.includes(k) && lev(k, target, 1) <= 1){ ok = true; fixed = raw; }
  if (ok && !fixed && raw.toLowerCase() !== word) fixed = raw;          // accents: accepted, shown corrected
  if (!ok){
    ND.misses++; ND.shown = true; ND.last = null; renderSpell();
    const t = sheet.querySelector('.nd-tag'); t.classList.add('shake');
    return;
  }
  if (fixed) ND.fixes++;
  speak(word);
  ND.last = { n, word, fixed }; ND.shown = false; ND.i++;
  if (ND.i >= NUM_SEQ.length){ ndSpellDone(); return; }
  renderSpell();
}
function ndSpellDone(){
  const st = numbersState(), first = !st.introDone;
  st.introDone = true; save();
  if (first) toast('<b>Numbers 0–20</b> added to your dictionary');
  ND.phase = 'listen'; ND.redo = false; ND.i = 0; ND.last = null; ND.justDone = true;
  ND.status = 'ready'; ND.current = []; ND.typed = []; ND.buf = '';
  renderHUD(); renderListen();
}

function renderListen(){
  const keys = ['1','2','3','4','5','6','7','8','9','sep','0','back'].map(k =>
    k === 'sep' ? '<button class="nd-key alt" data-nd="sep" aria-label="Next number"><b>·</b><small>next</small></button>'
    : k === 'back' ? '<button class="nd-key alt" data-nd="back" aria-label="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 5H9l-6 7 6 7h12z"/><path d="M17 9l-6 6M11 9l6 6"/></svg></button>'
    : `<button class="nd-key" data-nd="d${k}">${k}</button>`).join('');
  const voiceNote = ndVoice() ? ''
    : `<p class="nd-novoice">${hasTTS && !S.sound ? 'Your voice is off' : 'Your browser has no Italian voice'}, so each number is <b>shown as a word</b> for a moment instead. Read it, then type the digits.</p>`;
  sheet.innerHTML = ndHead('Ascolta <em>e scrivi</em>', 'Listen, then type the numbers you hear, in order.') + `
    <div class="sheet-body nd-body">
      <div id="ndStats" class="nd-stats"></div>
      ${ND.justDone ? '<p class="nd-fb good nd-done">Spelling done! The numbers 0–20 are in your dictionary (<kbd>V</kbd>). Now the real test: understanding them.</p>' : ''}
      ${voiceNote}
      <div class="nd-grid">
        <div class="nd-left">
          <div id="ndStage" class="nd-stage"></div>
          <div id="ndAnswer" class="nd-answer" aria-live="polite"></div>
        </div>
        <div class="nd-pad">
          <div class="nd-keys">${keys}</div>
          <div class="nd-acts"><button class="btn" data-nd="replay" title="Hear it again, slower (R)">↻ Ripeti</button><button class="btn primary" data-nd="submit" title="Check (Enter)">Controlla</button></div>
        </div>
      </div>
      <div class="nd-foot"><p class="note nd-kbd">Keyboard: digits, <kbd>Space</kbd> or <kbd>,</kbd> between numbers, <kbd>Enter</kbd> to check, <kbd>R</kbd> to repeat.</p>
        <button class="linkbtn nd-respell" data-nd="respell">Spell 0–20 again</button></div>
    </div>`;
  ndPaint();
}

/* repaint the parts of the listening screen that change during a round */
function ndPaint(){
  if (!ndIsOpen() || ND.phase !== 'listen') return;
  const stage = $('#ndStage'), ans = $('#ndAnswer'); if (!stage) return;
  const s = ND.status, n = ND.n, st = numbersState();
  $('#ndStats').innerHTML = `<span class="nd-stat"><b>${n}</b> <span class="lng">${n === 1 ? 'number' : 'numbers'}</span> ${s === 'right' || s === 'wrong' ? 'next round' : 'this round'}</span>
      <span class="nd-stat"><b>${st.best}</b> best</span>
      ${st.mastered ? '<span class="nd-badge">✓ Mastered</span>' : `<span class="nd-goal">Goal: ${NUM_MASTER} in a row</span>`}`;
  stage.className = 'nd-stage ' + s + (ND.visual ? ' visual' : '');
  const dots = `<div class="nd-dots" aria-hidden="true">${Array.from({ length:n }, (_, k) =>
    `<i class="${s === 'playing' ? (k < ND.playing ? 'on' : k === ND.playing ? 'now' : '') : s === 'ready' ? '' : 'on'}"></i>`).join('')}</div>`;
  const disc = `<button class="nd-disc" data-nd="${s === 'ready' ? 'go' : 'replay'}" aria-label="${s === 'ready' ? 'Listen' : 'Hear it again'}">${SPK}<span class="ring"></span><span class="ring r2"></span></button>`;
  const said = () => `<div class="nd-said">${ND.current.map((x, k) => `<span class="nd-pill${ND.result && ND.result.bad[k] ? ' miss' : ''}"><b>${x}</b><i>${esc(numWord(x))}</i></span>`).join('')}</div>`;
  if (s === 'ready'){
    stage.innerHTML = disc + `<p class="nd-status"><b>Ascolta!</b> You'll hear <b>${n} ${n === 1 ? 'number' : 'numbers'}</b>.<br><button class="btn primary nd-go" data-nd="go">▶ Play · Enter</button></p>`;
  } else if (s === 'playing' || s === 'answer'){
    const main = ND.visual ? `<div class="nd-word${ND.word ? ' on' : ''}">${esc(ND.word || ' ')}</div>` : disc;
    stage.innerHTML = main + dots + `<p class="nd-status">${s === 'playing' ? (ND.visual ? 'Read…' : 'Listen…') : `Your turn: type the ${n === 1 ? 'number' : n + ' numbers'}.`}</p>`;
  } else if (s === 'right'){
    const m = ND.result && ND.result.mastered;
    stage.className += m ? ' mastered' : '';
    stage.innerHTML = `<div class="nd-stamp">${m ? 'Bravissimo!' : 'Esatto!'}</div>${said()}
      <p class="nd-status">${m ? `<b>Mastered!</b> ${ND.result.n} numbers in a row.` : ND.result.n === 1 ? 'Right!' : `All ${ND.result.n} right.`} Next: <b>${n} numbers</b>.</p>
      <button class="btn primary nd-go" data-nd="go">Next round · Enter</button>`;
  } else if (s === 'wrong'){
    stage.innerHTML = `<p class="nd-verdict">Not quite. You heard:</p>${said()}
      <p class="nd-status">Listen again with <b>Ripeti</b>, then try a new set of ${n}.</p>
      <button class="btn primary nd-go" data-nd="go">Try another · Enter</button>`;
  }
  /* the answer line: chips, then the number being typed */
  const res = ND.result && (s === 'right' || s === 'wrong') ? ND.result : null;
  const chips = ND.typed.map((x, k) => `<span class="nd-chip${res ? (res.bad[k] || res.extra && k >= ND.current.length ? ' bad' : ' good') : ''}">${x}</span>`);
  const live = s === 'playing' || s === 'answer';
  if (live) chips.push(`<span class="nd-chip buf${ND.buf ? '' : ' empty'}">${esc(ND.buf)}<span class="caret"></span></span>`);
  ans.innerHTML = chips.length ? chips.join('<span class="nd-sep">·</span>') : `<span class="nd-ph">${s === 'ready' ? 'Your numbers will appear here' : ''}</span>`;
  ans.classList.toggle('live', live);
  sheet.querySelectorAll('.nd-key, [data-nd="submit"]').forEach(b => b.disabled = !live);
  const rp = sheet.querySelector('[data-nd="replay"]'); if (rp) rp.disabled = s === 'ready';
}

/* ---------- a listening round ---------- */
function ndRound(){
  const nums = [];
  for (let k = 0; k < ND.n; k++){ let x; do { x = Math.floor(Math.random() * (NUM_TOP + 1)); } while (k && x === nums[k - 1]); nums.push(x); }
  ND.current = nums; ND.typed = []; ND.buf = ''; ND.result = null; ND.justDone = false; ND.replays = 0;
  if (sheet.querySelector('.nd-done')) sheet.querySelector('.nd-done').remove();
  ndPlay(0.88);
}
function ndPlay(rate){
  if (!ND.current.length) return;
  const tok = ++ND.token, nums = ND.current.slice();
  const alive = () => tok === ND.token && ndIsOpen();
  ND.visual = !ndVoice();
  ND.status = 'playing'; ND.playing = 0; ND.word = '';
  let i = 0;
  const next = () => {
    if (!alive()) return;
    if (i >= nums.length){ ND.playing = -1; ND.word = ''; ND.status = 'answer'; ndPaint(); return; }
    ND.playing = i;
    const go = () => { i++; setTimeout(next, i < nums.length ? NUM_GAP : 150); };
    if (ND.visual){
      ND.word = numWord(nums[i]); ndPaint();
      setTimeout(() => { if (!alive()) return; ND.word = ''; ndPaint(); i++; setTimeout(next, i < nums.length ? 350 : 0); }, NUM_SHOW);
      return;
    }
    ndPaint();
    speak(numWord(nums[i]), 1, false, rate);
    ndAfterSpeech(alive, go);
  };
  next();
}
/* call cb once the voice has finished the word just started */
function ndAfterSpeech(alive, cb){
  const t0 = performance.now();
  const wait = () => { if (!alive()) return; if (performance.now() - t0 < 250 || speechBusy()){ setTimeout(wait, 60); return; } cb(); };
  setTimeout(wait, 60);
}
function ndReplay(){
  if (!ND.current.length || ND.status === 'ready') return;
  ND.replays++;
  if (ND.status === 'right' || ND.status === 'wrong') ndReplayResult(); else ndPlay(NUM_SLOW);
}
/* Ripeti on the result screen: say the numbers again (slower), lighting up each one as it is said */
function ndReplayResult(){
  const tok = ++ND.token, nums = ND.current.slice(), voice = ndVoice();
  const alive = () => tok === ND.token && ndIsOpen();
  let i = 0;
  const step = () => {
    if (!alive()) return;
    sheet.querySelectorAll('.nd-said .nd-pill').forEach((p, k) => p.classList.toggle('now', k === i));
    if (i >= nums.length) return;
    const go = () => { i++; setTimeout(step, i < nums.length ? NUM_GAP : 0); };
    if (voice){ speak(numWord(nums[i]), 1, false, NUM_SLOW); ndAfterSpeech(alive, go); } else setTimeout(go, NUM_SHOW);
  };
  step();
}
function ndStop(){ ND.token++; ND.playing = -1; ND.word = ''; if (!ND.visual) try { if (hasTTS) speechSynthesis.cancel(); } catch(e){} speakDeadline = 0; }

/* ---------- typing ---------- */
const ndLive = () => ND.status === 'playing' || ND.status === 'answer';
function ndDigit(d){
  if (!ndLive()) return;
  if (ND.typed.length >= 12) return;
  if (ND.buf && (ND.buf === '0' || +(ND.buf + d) > NUM_TOP)){ ND.typed.push(+ND.buf); ND.buf = ''; }
  ND.buf += d; ndPaint();
}
function ndSep(){ if (!ndLive() || !ND.buf) return; ND.typed.push(+ND.buf); ND.buf = ''; ndPaint(); }
function ndBack(){
  if (!ndLive()) return;
  if (!ND.buf && ND.typed.length) ND.buf = String(ND.typed.pop());
  ND.buf = ND.buf.slice(0, -1); ndPaint();
}
function ndSubmit(){
  if (!ndLive()) return;
  if (ND.buf){ ND.typed.push(+ND.buf); ND.buf = ''; }
  if (!ND.typed.length){ const a = $('#ndAnswer'); a.classList.remove('shake'); void a.offsetWidth; a.classList.add('shake'); return; }
  if (ND.status === 'playing') ndStop();
  const want = ND.current, got = ND.typed;
  const bad = want.map((x, k) => got[k] !== x);
  const right = got.length === want.length && !bad.some(Boolean);
  const st = numbersState();
  ND.result = { n:want.length, bad, extra:got.length > want.length, mastered:false };
  if (right){
    st.best = Math.max(st.best, want.length);
    if (want.length >= NUM_MASTER && !st.mastered){
      st.mastered = true; ND.result.mastered = true;
      toast('<b>Numeri: mastered!</b> You understood ' + want.length + ' numbers in a row.');
      askHooks('onNumbersMastered');
    }
    ND.n = Math.min(ND.n + 1, 12);
    ND.status = 'right';
  } else ND.status = 'wrong';
  save(); renderListen();
  if (ND.status === 'right') sheet.querySelectorAll('.nd-chip').forEach((c, k) => c.style.animationDelay = (k * 70) + 'ms');
}
function ndRespell(){ ndStop(); ND.phase = 'intro'; ND.redo = true; ND.i = 0; ND.shown = false; ND.last = null; renderSpell(); }

/* ---------- input ---------- */
/* buttons don't take focus on click, so Enter keeps meaning "check" / "next round" (and the spelling input keeps focus) */
sheet.addEventListener('mousedown', e => { if (ndIsOpen() && e.target.closest('[data-nd]')) e.preventDefault(); });
sheet.addEventListener('click', e => {
  if (!ndIsOpen()) return;
  const b = e.target.closest('[data-nd]'); if (!b || b.disabled) return;
  const a = b.dataset.nd;
  if (a === 'spell') ndSpell();
  else if (a === 'go') ndRound();
  else if (a === 'replay') ndReplay();
  else if (a === 'submit') ndSubmit();
  else if (a === 'sep') ndSep();
  else if (a === 'back') ndBack();
  else if (a === 'respell') ndRespell();
  else if (a[0] === 'd') ndDigit(a.slice(1));
});
/* physical keyboard in the listening phase (the spelling phase uses its own input) */
document.addEventListener('keydown', e => {
  if (!ndIsOpen() || ND.phase !== 'listen') return;
  if (e.target.matches && e.target.matches('input, textarea')) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key, onBtn = e.target.closest && e.target.closest('#sheet button');
  if (/^[0-9]$/.test(k)){ e.preventDefault(); ndDigit(k); return; }
  if (k === ',' || (k === ' ' && !onBtn)){ e.preventDefault(); ndSep(); return; }
  if (k === 'Backspace'){ e.preventDefault(); ndBack(); return; }
  if (k === 'r' || k === 'R'){ e.preventDefault(); ndReplay(); return; }
  if (k === 'Enter' && !onBtn){
    e.preventDefault();
    if (ndLive()) ndSubmit(); else ndRound();
  }
});
