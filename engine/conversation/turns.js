/* Hints, submit(), playLines(), afterTurn(): one turn of a tile-bank conversation. */

/* Hints help the player find the answer; they never give it (CLAUDE.md, "Teaching and writing conventions").
   hintAfter(attempts, mild, strong): the mild hint (English: what the situation needs, a grammar rule, where to look)
   until the third failed attempt at the same step, then the strong one, which may name the key Italian word(s), never
   the whole sentence. stepTries(st, step) counts the failed attempts: call it (once or more per turn) with the key of the
   step the conversation is at AFTER the turn; a turn that leaves the step where it was counts as one failed attempt,
   a new step starts again at 0. Used by the Lesson 7 and 8 stalls (their hint hooks return { h, strong, step }). */
const HINT_STRONG_AT = 3;
function hintAfter(attempts, mild, strong){ return attempts >= HINT_STRONG_AT && strong ? strong : mild; }
function stepTries(st, step){
  const turn = convo ? convo.turns || 0 : 0;
  if (st.tryTurn !== turn){
    st.tryTurn = turn;
    if (st.tryStep === step) st.tries = (st.tries || 0) + 1; else { st.tryStep = step; st.tries = 0; }
  }
  return st.tries || 0;
}

function contextHint(withModel){
  const st = convo.st, n = convo.npc, [P, o] = n.pron;
  let h, m, u;
  const ex = n.formal ? 'Scusi' : 'Scusa';
  /* lesson hooks (7+): hint(npc, st) returns { h, strong?, step? }: the mild hint (HTML, never the Italian answer), and
     the strong one shown from the third failed attempt at the step (hintAfter; step defaults to the hint text).
     The older form { h, m } still works: m (a model sentence) is shown as "Try: …" only from the third failed attempt,
     and m:null shows none. */
  const hk = askHooks('hint', n, st);
  if (hk){
    const strong = hk.strong || (hk.m ? `${hk.h || ''} Try: <b>${esc(fill(hk.m))}</b>` : null);
    return hintAfter(stepTries(st, hk.step || hk.h), hk.h || '', strong);
  }
  if (st.wrapping){ h = n.formal ? 'Say goodbye (politely).' : 'Say goodbye.'; m = n.formal ? 'Buongiorno!' : 'Ciao!'; }
  else if ((u = unitHook('hintFirst', n, st))) ({ h, m } = u);       // (the unit's: Padova, introducing Mark)
  else if (!st.npcGreeted){ h = `Get ${o} attention with a greeting.`; m = 'Ciao!'; }
  else if (st.lastQ === 'how'){ h = `${P} asked how you are.`; m = n.formal ? 'Sto bene, grazie.' : 'Sto bene, grazie. E tu?'; }
  else if (st.lastQ === 'name'){ h = `${P} asked your name.`; m = n.formal ? 'Mi chiamo {Me}.' : 'Mi chiamo {Me}. E tu?'; }
  else if ((u = unitHook('hintThen', n, st))){ if (typeof u === 'string') return u; ({ h, m } = u); }   // (Padova: the bar, directions, Mark: Lessons 2–5)
  else if (!st.playerGaveName){ h = 'Introduce yourself.'; m = n.formal ? 'Buongiorno, mi chiamo {Me}.' : 'Mi chiamo {Me}. Come ti chiami?'; }
  else if (!st.npcToldName){ h = `Ask ${o === 'his' ? 'his' : 'her'} name.`; m = 'Come ti chiami?'; }
  else if (!st.playerToldHow){ h = `Ask how ${P.toLowerCase()} is.`; m = n.formal ? 'Come sta?' : 'Come stai?'; }
  else { h = 'Say goodbye.'; m = 'Ciao!'; }
  const tail = unitHook('hintTail', n) || ' The handbook has everything you need.';
  /* a hook can return m:null (Lesson 9 names its key words only after three misses, never the whole sentence) */
  return esc(h) + (withModel && m ? ` Try: <b>${esc(fill(m))}</b>` : tail);
}

/* "Ancora una volta, per favore" (or Può ripetere?) said on its own: a repeat request and nothing else */
const REPEAT_ONLY = new Set(['repeat', 'please', 'excuse', 'address', 'and']);
const pureRepeat = ints => ints.includes('repeat') && ints.every(i => REPEAT_ONLY.has(i));
function endConvo(){
  convo.done = true;
  S.convos[convo.npc.id] = (S.convos[convo.npc.id] || 0) + 1; save();
  builder.hidden = true; if (!convo.keepHint) hintEl.hidden = true;
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
}

function submit(){
  if (!convo || convo.mode !== 'talk' || convo.done || convoBusy || builder.hidden) return;
  if (displayBusy()){
    if (!convo.pendingSubmit){ convo.pendingSubmit = true; $('#btnSay').classList.add('waiting');
      enqueue(() => { $('#btnSay').classList.remove('waiting'); if (convo){ convo.pendingSubmit = false; submit(); } }); }
    return;
  }
  if (!convo.words.length){ const s = $('#sentence'); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); return; }
  convo.turns = (convo.turns || 0) + 1;            // (stepTries: failed attempts per step)
  const used = convo.words.slice();
  const tokens = used.flatMap(t => t.tokens || [t]);
  const words = tokens.map(t => t.w);
  const res = parse(words, convo.npc);
  const text = formatSentence(tokens);
  enqueue(() => { if (!dialogOpen) return; _meLine(text, { miss:!res.ok }); speak(text, 1); });
  convo.words = []; renderSentence();
  convoBusy = true;
  choices.hidden = true;
  const n = convo.npc, st = convo.st;
  convo.lastUsed = used;

  if (!res.ok){
    convo.fails++;
    studyTileMiss(res, used);                       /* the word it failed on counts as wrong in the weak-word record (ui/study.js) */
    const f = FAILS[(convo.fails - 1) % FAILS.length];
    const lost = tokens.slice(Math.max(0, res.at)).map(t => t.label).join(' ');
    setTimeout(() => {
      convoBusy = false;
      npcLine(f.it, convo.companion ? null : f.en);
      let why;
      if (res.wrongName) why = "That's someone else's name.";
      else if (res.article){
        const i = ITEM[res.article];
        why = res.bare ? `Put an article before <b>${esc(i.w)}</b>: <b>${i.art} ${esc(i.w)}</b>.`
          : `<b>${esc(i.w)}</b> takes <b>${i.art}</b>, not <b>${i.art === 'un' ? 'una' : 'un'}</b>: <b>${i.art} ${esc(i.w)}</b>.`;
      } else why = `The sentence stopped making sense at “${esc(lost)}”.`;
      const uh = unitHook('failHint', convo.fails >= 2);     // (Padova: the Lesson 4 waiter's own hints)
      showHint(why + ' ' + (uh !== undefined ? uh : contextHint(convo.fails >= 2)));
      unitHook('afterHint', n);
    }, 800);
    return;
  }

  if (unitHook('takeTurn', res, used)) return;       // the unit takes the turn (Padova: the Lesson 4 waiter, Mark's gender, Emma's order)

  convo.fails = 0;
  S.sentences++;
  used.forEach(t => { if (!(t.name && !t.tokens)){ const k = t.key || t.w; S.wordStats[k] = (S.wordStats[k] || 0) + 1; } });
  const out = respond(res.intents);
  save();
  setTimeout(() => {
    const hideEn = !!(convo.companion && convo.companion.translateFor) || !!unitHook('hideEn', n, out);   // (translating for a companion; Padova: Lucia on the statue)
    const lines = [];
    /* consecutive fragments share one bubble; a listening fragment, or one with its own speech rate
       (add(it, en, { rate:1 }): Lesson 8's fast barrier line), gets a bubble of its own */
    out.frags.forEach(f => {
      const last = lines[lines.length - 1];
      if (f.listen) lines.push({ it:f.it, en:f.en, listen:true, rate:f.rate });
      else if (f.rate || f.gloss || f.speaker) lines.push({ it:f.it, en:f.en, rate:f.rate, gloss:f.gloss, speaker:f.speaker });     // (gloss: words with a hover gloss, a bubble of its own; speaker: someone else in the conversation says it)
      else if (last && !last.listen && !last.rate && !last.speaker) { last.it += ' ' + f.it; last.en += ' ' + f.en; }
      else lines.push({ it:f.it, en:f.en });
    });
    lines.push(...out.dirLines);
    if (!lines.length) lines.push({ it:'…', en:`(${n.pron[0]} smiles and waits for you.)`, quiet:true });
    playLines(lines, { hideEn, slow:out.slow }, () => {
      convoBusy = false;
      afterTurn(out, res, words);
    });
  }, 900);
}

/* NPC lines appear one bubble at a time; directions are spoken in sequence */
function playLines(lines, opt, done){
  let i = 0;
  const step = () => {
    if (!convo) return;
    const l = lines[i];
    if (l.reveal) enqueue(() => { if (convo){ convo.known = true; renderHUD(); } });
    if (l.sys) sysLine(l.sys);
    else { npcLine(l.it, opt.hideEn ? null : l.en, { queue:i > 0, rate:l.rate || (opt.slow ? 0.68 : 0.88), listen:!!l.listen, gloss:l.gloss, speaker:l.speaker, forceKnown:l.speaker ? !!S.known[l.speaker.id] : undefined }); if (!l.quiet) convo.lastNpcText = { it:l.it, en:l.en, listen:!!l.listen }; }
    i++;
    if (i < lines.length) setTimeout(step, opt.slow ? 1300 : 900); else done();
  };
  step();
}

function afterTurn(out, res, words){
  const n = convo.npc, st = convo.st;
  if (out.learned && !S.met[n.id]){
    S.met[n.id] = true; save(); renderHUD(); renderBank();
    toast(`New contact: <b>${esc(n.name)}</b>. Their name tile is in your dictionary.`);
  }
  if (convo.companion && convo.companion.translateFor){ unitHook('translatedTurn', out); return; }   // (Padova: Emma's order, Lesson 2)
  /* lesson hooks (7+): afterTurn(npc, out, res, words) runs after the NPC's lines; return true when it handled the turn */
  if (askHooks('afterTurn', n, out, res, words)) return;
  unitHook('afterTurnPre', n, out);               // (Padova: who Mark has met)
  if (out.end){ endConvo(); return; }
  if (unitHook('afterTurnMid', n, out)) return;   // (Padova: Lesson 5's beats with Paolo, Mark and Lucia; the bar's failure beat)

  let hint = null, label = 'Suggerimento';
  let u;
  if (out.directions && n.directions[out.directions].route){
    unitHook('toldTheWay', n, out);                 // (Padova: Lesson 3's route, from Chiara and from Rosa)
    label = 'Fatto!';
    hint = `${n.pron[0]} told you the way. Didn't catch it? Ask <b>${n.formal ? 'Può' : 'Puoi'} ripetere?</b> or check a direction (<i>a destra?</i>). Then say <b>Grazie mille!</b>`;
  } else if ((u = unitHook('turnHint', n, out, res, words))){ hint = u.hint; label = u.label;   // (Padova: the bar, Lesson 2)
  } else if (n.formal && !convo.tips.formal && (out.tiToFormal || words.includes('ciao') || words.includes('stai') || words.includes('scusa') || words.includes('puoi'))){
    convo.tips.formal = true; label = 'Consiglio';
    /* (the corrected forms of the words the player used: feedback, not the sentence to say) */
    const fix = [['ciao', '<b>buongiorno</b>, not ciao'], ['stai', '<b>come sta</b>, not come stai'], ['scusa', '<b>scusi</b>, not scusa'], ['puoi', '<b>può</b>, not puoi']]
      .filter(([w]) => words.includes(w)).map(f => f[1]);
    if (out.tiToFormal) fix.push('<b>Le presento</b>, not ti presento');
    hint = `With ${n.name}, use the polite forms: ${fix.join('; ') || '<b>Lei</b>'}.`;
  } else if ((u = unitHook('turnHintLate', n, out, res, words))){ hint = u.hint; label = u.label;   // (Padova: per favore at the bar)
  } else if (st.wrapping){
    label = 'Fatto!';
    const bye = n.formal ? 'Say goodbye politely' : 'Say <b>Ciao!</b>';
    hint = st.revisit ? `Nice chat! ${bye} to say goodbye, or keep talking.`
      : `You learned ${n.pron[1]} name: <b>${esc(n.name)}</b>! ${n.formal ? 'Say goodbye politely' : 'Say <b>Ciao!</b> or <b>Piacere!</b>'} to say goodbye, or keep talking.`;
  } else if (!out.asked || (n.askNameFirst && st.pendingWhere)) hint = contextHint(false);
  if (hint) showHint(hint, label); else hintEl.hidden = true;
  unitHook('afterHint', n);
}
