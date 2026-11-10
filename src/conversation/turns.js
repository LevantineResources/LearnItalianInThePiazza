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
  let h, m;
  const ex = n.formal ? 'Scusi' : 'Scusa';
  const markHere = convo.companion === NPC.mark && !st.introducedMark && !S.l5intros[n.id] && S.vocab5;
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
  else if (S.tut === 'l5-introduce' && n.id === 'marco' && !st.introducedMark){ h = 'Introduce Mark to Paolo.'; m = 'Paolo, questo è il mio amico Mark.'; }
  else if (st.lastQ === 'friend'){ h = 'She asked about your friend. Introduce Mark.'; m = 'Le presento il mio amico Mark.'; }
  else if (!st.npcGreeted){ h = `Get ${o} attention with a greeting.`; m = 'Ciao!'; }
  else if (st.lastQ === 'how'){ h = `${P} asked how you are.`; m = n.formal ? 'Sto bene, grazie.' : 'Sto bene, grazie. E tu?'; }
  else if (st.lastQ === 'name'){ h = `${P} asked your name.`; m = n.formal ? 'Mi chiamo {Me}.' : 'Mi chiamo {Me}. E tu?'; }
  else if (n.barista && st.lastQ === 'order'){ h = 'He asked what you would like.'; m = convo.companion ? wishModel() : 'Vorrei un caffè e un cornetto, per favore.'; }
  else if (n.barista && st.lastQ === 'more'){
    h = 'He asked if you want anything else.';
    const miss = convo.companion ? missingWish() : [];
    m = miss.length ? `Sì, ${ITEM[miss[0]].art} ${miss[0]}, per favore.` : 'No, grazie.';
  }
  else if (n.barista && st.served){ const ask = !st.priceHeard; h = ask ? (convo.companion ? 'Ask how much it is.' : 'Say thank you, or ask the price.') : 'Say thank you.'; m = ask && convo.companion ? "Quant'è?" : 'Grazie!'; }
  else if (n.directions && S.vocab3 && st.lastDir && !(n.id === 'lucia')){ h = `Check a direction (“a destra?”), ask ${o === 'his' ? 'him' : 'her'} to repeat, or say thank you.`; m = n.formal ? 'Grazie mille!' : 'Puoi ripetere?'; }
  else if (l3AskInEnglish(n)){
    /* before the Lesson 3 words: the English question (the choice under the transcript) is the way to ask */
    return S.tut === 'l3-ask' ? 'Ask Chiara the way to Via dei Mille. You can\'t say it in Italian yet, so ask in English.'
      : 'You still need the words to ask the way. Read <b>Lezione 3</b> in your handbook and finish its <b>Practice</b>.';
  }
  else if (n.askNameFirst && !st.playerGaveName){ h = 'Introduce yourself first. She likes to know who she is talking to.'; m = 'Buongiorno! Mi chiamo {Me}.'; }
  else if (n.needDirIn && n.needDirIn.includes(S.tut) && !st.lastDir && !(n.needsMarkIntro && S.l5follow && !st.introducedMark)){ h = n.id === 'lucia' ? 'Ask her if this is the statue.' : `Ask ${o === 'his' ? 'him' : 'her'} the way.`; m = n.askModel; }
  else if (n.needsMarkIntro && S.l5follow && !st.introducedMark && st.playerGaveName){ h = 'Introduce Mark too.'; m = 'Le presento il mio amico Mark.'; }
  else if (markHere && st.npcGreeted && st.revisit){ h = `Introduce Mark to ${n.name}.`; m = n.formal ? 'Le presento il mio amico Mark.' : 'Ti presento il mio amico Mark.'; }
  else if (!st.playerGaveName){ h = 'Introduce yourself.'; m = n.formal ? 'Buongiorno, mi chiamo {Me}.' : 'Mi chiamo {Me}. Come ti chiami?'; }
  else if (!st.npcToldName){ h = `Ask ${o === 'his' ? 'his' : 'her'} name.`; m = 'Come ti chiami?'; }
  else if (!st.playerToldHow){ h = `Ask how ${P.toLowerCase()} is.`; m = n.formal ? 'Come sta?' : 'Come stai?'; }
  else { h = 'Say goodbye.'; m = 'Ciao!'; }
  const tail = n.barista || S.lesson >= 3 ? ' The handbook has everything you need.' : ' You can chain phrases, like <i>Ciao! Come stai?</i>';
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
      showHint(why + ' ' + (convo.restaurant ? l4Hint(convo.fails >= 2) : contextHint(convo.fails >= 2)));
      if (l3AskInEnglish(n)) l3OfferEnglishAsk();
    }, 800);
    return;
  }

  /* the waiter's engine (Lesson 4) has no repeat of its own: he says his last line again */
  if (convo.restaurant && pureRepeat(res.intents) && convo.lastNpcText){
    const l = convo.lastNpcText;
    setTimeout(() => playLines([{ it:'Sì, certo!', en:'Yes, of course!' }, { it:l.it, en:l.en, listen:l.listen, rate:0.7 }], { hideEn:true }, () => { convoBusy = false; }), 900);
    return;
  }
  if (convo.restaurant) return submitL4(res);

  /* Lesson 5: Mark is a man, so questo and il mio amico */
  if (res.intents.includes('name:mark') && (res.intents.includes('this:f') || res.intents.includes('myfriend:f')) && !res.intents.some(i => i.startsWith('place:'))){
    convo.fails++;
    studyTileMiss({ gender:[res.intents.includes('this:f') && 'questa è', res.intents.includes('myfriend:f') && 'la mia amica'].filter(Boolean) });
    setTimeout(() => { convoBusy = false; npcLine('Eh? La tua amica?', null);
      if (convo.companion === NPC.mark) companionLine('Did you just call me your *female* friend? I caught “amica”…');
      showHint('Mark is a man: <b>questo è</b> and <b>il mio amico</b>. <i>Questa</i> and <i>la mia amica</i> are for women.', 'Consiglio'); }, 800);
    return;
  }

  /* Emma steps in before Enzo answers if you are about to get her order wrong */
  if (convo.companion === NPC.emma){
    const items = res.intents.filter(i => i.startsWith('item:')).map(i => i.slice(5));
    let objection = null;
    const wrong = items.filter(w => !EMMA_WISH.includes(w));
    if (wrong.length) objection = `Hmm, I don't think that's what I asked for. I'd like a fresh orange juice and a croissant!`;
    else if (!items.length && res.intents.includes('no') && st.lastQ === 'more' && missingWish().length)
      objection = `Wait! I also wanted ${ITEM[missingWish()[0]].en}!`;
    else if (res.intents.includes('thanks') && st.served && !convo.didPrice)
      objection = 'Before we go, can you ask him how much it is?';
    if (objection){
      setTimeout(() => {
        convoBusy = false; companionLine(objection);
        showHint(wrong.length ? 'Emma wants <b>una spremuta</b> (fresh orange juice) and <b>un cornetto</b> (croissant).' : contextHint(true));
      }, 700);
      return;
    }
  }

  convo.fails = 0;
  S.sentences++;
  used.forEach(t => { if (!(t.name && !t.tokens)){ const k = t.key || t.w; S.wordStats[k] = (S.wordStats[k] || 0) + 1; } });
  const out = respond(res.intents);
  save();
  setTimeout(() => {
    const hideEn = convo.companion === NPC.emma || (n.id === 'lucia' && out.directions === 'gattamelata');
    const lines = [];
    /* consecutive fragments share one bubble; a listening fragment, or one with its own speech rate
       (add(it, en, { rate:1 }): Lesson 8's fast barrier line), gets a bubble of its own */
    out.frags.forEach(f => {
      const last = lines[lines.length - 1];
      if (f.listen) lines.push({ it:f.it, en:f.en, listen:true, rate:f.rate });
      else if (f.rate) lines.push({ it:f.it, en:f.en, rate:f.rate });
      else if (last && !last.listen && !last.rate) { last.it += ' ' + f.it; last.en += ' ' + f.en; }
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
    else { npcLine(l.it, opt.hideEn ? null : l.en, { queue:i > 0, rate:l.rate || (opt.slow ? 0.68 : 0.88), listen:!!l.listen }); if (!l.quiet) convo.lastNpcText = { it:l.it, en:l.en, listen:!!l.listen }; }
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
  if (convo.companion === NPC.emma){ afterCompanionTurn(out); return; }
  /* lesson hooks (7+): afterTurn(npc, out, res, words) runs after the NPC's lines; return true when it handled the turn */
  if (askHooks('afterTurn', n, out, res, words)) return;
  if (out.introMark){ S.l5intros[n.id] = true; save(); }
  if (out.end){ endConvo(); return; }
  if (n.id === 'marco' && S.tut === 'l5-meet' && out.directions === 'gattamelata'){
    S.l5notes = n.directions.gattamelata.lines.map(l => ({ it:l.it, en:l.en })); save();
    markKnowEachOther(); return;
  }
  if (out.introMark && n.id === 'marco' && S.tut === 'l5-introduce'){
    S.l5follow = true; setTut('l5-tour');
    companionLine("Piacere, Paolo! … That's “nice to meet you”, right? OK, lead the way. I'll follow you.");
    showHint('Mark is following you now. Introduce him to anyone you like, then open the map (<kbd>M</kbd>) and trace Paolo\'s route.', 'Fatto!');
    return;
  }
  if (out.introMark && convo.companion === NPC.mark){
    const quips = ['Piacere! I\'m getting good at this.', 'Piacere! … That\'s all I\'ve got, but I said it with feeling.', 'Piacere! Tell them I love it here.'];
    companionLine(quips[Object.keys(S.l5intros).length % quips.length]);
  }
  if (n.id === 'lucia' && out.directions === 'gattamelata' && S.tut === 'l5-statue' && !S.l5statue){
    translatePrompt('What did she say?', ["Yes, this is Donatello's Gattamelata, from 1453.", 'No, the real statue is in a museum.', "Yes, but it's a copy made in 1953."], 0, () => {
      S.l5statue = true; save();
      companionLine('1453! The first big bronze horse since the Romans… Incredible. Tell her thanks from both of us.');
      showHint('Say <b>Grazie mille!</b>', 'Fatto!');
    }, 'Listen again: <i>è del 1453</i> means “it is from 1453”.');
    return;
  }
  if (out.whoMark){ showHint('Introduce him first: <b>Questo è il mio amico Mark</b> or <b>Ti presento Mark</b>.'); return; }
  checkBarFail();
  if (convo.failShown) return;

  let hint = null, label = 'Suggerimento';
  if (out.directions && n.directions[out.directions].route){
    if (n.id === 'chiara' && S.tut === 'l3-directions'){
      S.l3notes = n.directions[out.directions].lines.map(l => ({ it:l.it, en:l.en })); setTut('l3-mark');
    }
    if (n.id === 'rosa' && S.tut === 'l3-stranger') setTut('l3-find');
    label = 'Fatto!';
    hint = `${n.pron[0]} told you the way. Didn't catch it? Ask <b>${n.formal ? 'Può' : 'Puoi'} ripetere?</b> or check a direction (<i>a destra?</i>). Then say <b>Grazie mille!</b>`;
  } else if (n.barista && out.served && S.tut === 'l2-order'){
    const kinds = st.order.map(w => ITEM[w].kind);
    if (kinds.includes('coffee') && kinds.includes('pastry')){
      S.l2own = true; save(); label = 'Fatto!';
      hint = `You ordered ${esc(orderEn(st.order).toLowerCase().replace(/\.$/, ''))}. ` + (out.price
        ? (convo.tips.again = true, "Didn't catch the price? Ask Enzo to say it again: the <b>little words</b> in your handbook. Then say <b>Grazie!</b>")
        : "Say <b>Grazie!</b>, or ask <b>Quant'è?</b> to hear the price.");
    } else hint = 'Enzo served you, but your task was <b>a coffee and a pastry</b>. Order again: <i>Vorrei un caffè e un cornetto, per favore.</i>';
  } else if (n.barista && out.price && !convo.tips.again){
    /* the little words (Lesson 2): the price once more, if it went by too fast */
    convo.tips.again = true; label = 'Consiglio';
    hint = 'Too fast? Ask Enzo to say it again: the <b>little words</b> in your handbook. Then say thank you.';
  } else if (n.formal && !convo.tips.formal && (out.tiToFormal || words.includes('ciao') || words.includes('stai') || words.includes('scusa') || words.includes('puoi'))){
    convo.tips.formal = true; label = 'Consiglio';
    /* (the corrected forms of the words the player used: feedback, not the sentence to say) */
    const fix = [['ciao', '<b>buongiorno</b>, not ciao'], ['stai', '<b>come sta</b>, not come stai'], ['scusa', '<b>scusi</b>, not scusa'], ['puoi', '<b>può</b>, not puoi']]
      .filter(([w]) => words.includes(w)).map(f => f[1]);
    if (out.tiToFormal) fix.push('<b>Le presento</b>, not ti presento');
    hint = `With ${n.name}, use the polite forms: ${fix.join('; ') || '<b>Lei</b>'}.`;
  } else if (n.barista && out.items.length && !res.intents.includes('please') && !convo.tips.please){
    convo.tips.please = true; label = 'Consiglio';
    hint = 'Enzo didn\'t mind, but adding <b>per favore</b> (please) at the end is more polite.';
  } else if (st.wrapping){
    label = 'Fatto!';
    const bye = n.formal ? 'Say goodbye politely' : 'Say <b>Ciao!</b>';
    hint = st.revisit ? `Nice chat! ${bye} to say goodbye, or keep talking.`
      : `You learned ${n.pron[1]} name: <b>${esc(n.name)}</b>! ${n.formal ? 'Say goodbye politely' : 'Say <b>Ciao!</b> or <b>Piacere!</b>'} to say goodbye, or keep talking.`;
  } else if (!out.asked || (n.askNameFirst && st.pendingWhere)) hint = contextHint(false);
  if (hint) showHint(hint, label); else hintEl.hidden = true;
  if (l3AskInEnglish(n)) l3OfferEnglishAsk();
}
