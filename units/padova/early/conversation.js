/* Padova's Lessons 1–6 in the conversation engine (engine/conversation/*.js asks the unit hooks below at fixed points of a
   conversation: opening it, a turn's hints, the turn itself, after the turn, closing it). These lessons were wired into the
   engine before LESSON_HOOKS existed; lessons 7+ use LESSON_HOOKS. */

/* ---------- the parser's phrases (engine/core/parser.js) ---------- */
UNIT.basePhrases = (npc, part) => part === 'menu' ? Object.values(FOOD).map(f => ['food:' + f.key, f.label.toLowerCase()])
  : part === 'names' ? [['place:gattamelata','la statua di gattamelata'], ['name:mark','mark'],
    ['place:mille','via dei mille'], ['place:aurora','il caffè aurora'], ['place:banca','la banca'], ['place:farmacia','la farmacia'], ['place:chiesa','la chiesa']] : [];

/* ---------- opening a conversation (engine/conversation/dialog.js) ---------- */
Object.assign(UNIT, {
  redirectTo(npc){
    if (npc.id === 'mark' && ['l5-meet','l5-introduce'].includes(S.tut)) return NPC.marco;
    if (npc.id === 'mark' && S.tut === 'l6-bring' && S.scene === 'piazza') return NPC.bruno;
  },
  barrier:() => !S.vocab,                                  // Lesson 1: no dictionary yet, nobody understands you
  companion:npc => npc.barista && S.tut === 'l2-translate' ? NPC.emma : null,
  placeLabel:npc => npc.id === 'bruno' && sceneOf(npc) === 'piazza' ? (S.lesson >= 9 ? 'Bar Centrale' : 'Bar Centrale, with Mark') : undefined,
  englishTalk(npc){ if (npc.id === 'mark') markTalk(); else emmaTalk(); },
  convoStart(npc, mode){
    if (npc.waiter){
      convo.companion = NPC.mark;
      if (!S.vocab4){ waiterFail(); return true; }
      openRestaurant(); return true;
    }
    if (mode === 'barrier'){
      npcLine(npc.unknown, null);
      showChoices([{ label:'“Hi! Sorry… do you speak English?”', cls:'english', fn:barrierReply }]);
      return true;
    }
  },
  convoCompanion:npc => (S.l5follow || ['l5-meet','l5-introduce'].includes(S.tut)) ? NPC.mark : null,
  convoBank(npc){ if (npc.id === 'marco' && S.tut === 'l5-meet'){ paoloMeetsMark(); return true; } },
  convoOpened(npc){
    if (convo.companion === NPC.emma) setTimeout(() => companionLine('A fresh orange juice and a croissant for me, please! And can you ask how much it is?'), 500);
    if (convo.companion === NPC.mark && npc.id === 'marco' && S.tut === 'l5-introduce') setTimeout(() => companionLine("Go on, introduce me! What's the word… presento?"), 500);
    if (convo.companion === NPC.mark && npc.id === 'lucia' && S.tut === 'l5-statue') setTimeout(() => companionLine("Is that it? Ask her! And introduce me while you're at it."), 500);
    checkBarFail();
    if (l3AskInEnglish(npc)) setTimeout(l3OfferEnglishAsk, 400);
  },
  friendHere:() => S.l5follow,                             // Mark is with you (Lesson 5's tour): people want to meet him
  askInEnglish:n => l3AskInEnglish(n),                     // Lesson 3, before its words: ask the way in English
});
/* ---------- a turn (engine/conversation/turns.js) ---------- */
Object.assign(UNIT, {
  /* contextHint: before the greeting, and after the questions about how you are and your name */
  hintFirst(n, st){
    if (S.tut === 'l5-introduce' && n.id === 'marco' && !st.introducedMark) return { h:'Introduce Mark to Paolo.', m:'Paolo, questo è il mio amico Mark.' };
    if (st.lastQ === 'friend') return { h:'She asked about your friend. Introduce Mark.', m:'Le presento il mio amico Mark.' };
  },
  hintThen(n, st){
    const [P, o] = n.pron;
    const markHere = convo.companion === NPC.mark && !st.introducedMark && !S.l5intros[n.id] && S.vocab5;
    let h, m;
    if (n.barista && st.lastQ === 'order'){ h = 'He asked what you would like.'; m = convo.companion ? wishModel() : 'Vorrei un caffè e un cornetto, per favore.'; }
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
    return h === undefined ? undefined : { h, m };
  },
  hintTail:n => n.barista || S.lesson >= 3 ? ' The handbook has everything you need.' : ' You can chain phrases, like <i>Ciao! Come stai?</i>',
  failHint:withModel => convo.restaurant ? l4Hint(withModel) : undefined,
  afterHint(n){ if (l3AskInEnglish(n)) l3OfferEnglishAsk(); },
  /* the turn, before the brain answers: true = the unit took it */
  takeTurn(res, used){
    const n = convo.npc, st = convo.st;
    /* the waiter's engine (Lesson 4) has no repeat of its own: he says his last line again */
    if (convo.restaurant && pureRepeat(res.intents) && convo.lastNpcText){
      const l = convo.lastNpcText;
      setTimeout(() => playLines([{ it:'Sì, certo!', en:'Yes, of course!' }, { it:l.it, en:l.en, listen:l.listen, rate:0.7 }], { hideEn:true }, () => { convoBusy = false; }), 900);
      return true;
    }
    if (convo.restaurant){ submitL4(res); return true; }

    /* Lesson 5: Mark is a man, so questo and il mio amico */
    if (res.intents.includes('name:mark') && (res.intents.includes('this:f') || res.intents.includes('myfriend:f')) && !res.intents.some(i => i.startsWith('place:'))){
      convo.fails++;
      studyTileMiss({ gender:[res.intents.includes('this:f') && 'questa è', res.intents.includes('myfriend:f') && 'la mia amica'].filter(Boolean) });
      setTimeout(() => { convoBusy = false; npcLine('Eh? La tua amica?', null);
        if (convo.companion === NPC.mark) companionLine('Did you just call me your *female* friend? I caught “amica”…');
        showHint('Mark is a man: <b>questo è</b> and <b>il mio amico</b>. <i>Questa</i> and <i>la mia amica</i> are for women.', 'Consiglio'); }, 800);
      return true;
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
        return true;
      }
    }
  },
  hideEn:(n, out) => n.id === 'lucia' && out.directions === 'gattamelata',
  translatedTurn(out){ afterCompanionTurn(out); },
  afterTurnPre(n, out){ if (out.introMark){ S.l5intros[n.id] = true; save(); } },
  afterTurnMid(n, out){
    if (n.id === 'marco' && S.tut === 'l5-meet' && out.directions === 'gattamelata'){
      S.l5notes = n.directions.gattamelata.lines.map(l => ({ it:l.it, en:l.en })); save();
      markKnowEachOther(); return true;
    }
    if (out.introMark && n.id === 'marco' && S.tut === 'l5-introduce'){
      S.l5follow = true; setTut('l5-tour');
      companionLine("Piacere, Paolo! … That's “nice to meet you”, right? OK, lead the way. I'll follow you.");
      showHint('Mark is following you now. Introduce him to anyone you like, then open the map (<kbd>M</kbd>) and trace Paolo\'s route.', 'Fatto!');
      return true;
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
      return true;
    }
    if (out.whoMark){ showHint('Introduce him first: <b>Questo è il mio amico Mark</b> or <b>Ti presento Mark</b>.'); return true; }
    checkBarFail();
    if (convo.failShown) return true;
  },
  toldTheWay(n, out){
    if (n.id === 'chiara' && S.tut === 'l3-directions'){
      S.l3notes = n.directions[out.directions].lines.map(l => ({ it:l.it, en:l.en })); setTut('l3-mark');
    }
    if (n.id === 'rosa' && S.tut === 'l3-stranger') setTut('l3-find');
  },
  turnHint(n, out, res, words){
    const st = convo.st; let hint = null, label = 'Suggerimento';
    if (n.barista && out.served && S.tut === 'l2-order'){
      const kinds = st.order.map(w => ITEM[w].kind);
      if (kinds.includes('coffee') && kinds.includes('pastry')){
        S.l2own = true; save(); label = 'Fatto!';
        hint = `You ordered ${esc(orderEn(st.order).toLowerCase().replace(/\.$/, ''))}. ` + (out.price
          ? (convo.tips.again = true, "Didn't catch the price? Ask Enzo to say it again: the <b>little words</b> in your handbook. Then say <b>Grazie!</b>")
          : "Say <b>Grazie!</b>, or ask <b>Quant'è?</b> to hear the price.");
      } else hint = 'Enzo served you, but your task was <b>a coffee and a pastry</b>. Order again: <i>Vorrei un caffè e un cornetto, per favore.</i>';
      return { hint, label };
    }
    if (n.barista && out.price && !convo.tips.again){
      /* the little words (Lesson 2): the price once more, if it went by too fast */
      convo.tips.again = true; label = 'Consiglio';
      hint = 'Too fast? Ask Enzo to say it again: the <b>little words</b> in your handbook. Then say thank you.';
      return { hint, label };
    }
  },
  turnHintLate(n, out, res, words){
    let hint = null, label = 'Suggerimento';
    if (n.barista && out.items.length && !res.intents.includes('please') && !convo.tips.please){
      convo.tips.please = true; label = 'Consiglio';
      hint = 'Enzo didn\'t mind, but adding <b>per favore</b> (please) at the end is more polite.';
      return { hint, label };
    }
  },
});

/* ---------- the tile bank and closing a conversation (engine/conversation/bank.js) ---------- */
Object.assign(UNIT, {
  setPhraseOpen:p => p.from === 2 && S.vocab2,          // the little words, from Lesson 2's practice on
  bankReady:() => L1done(),                             // the bag's group: once Lesson 1 is done
  bankFirst(n, groups, names){
    if (L1done()) return;
    groups.push({ label:'', tiles:VOCAB1.map(v => ({ w:v.w, label:v.w, gloss:v.en })) });
    groups.push({ label:'', tiles:[{ w:S.playerName.toLowerCase(), label:S.playerName, name:true, gloss:'your name' }, ...names] });
    return groups;
  },
  bankMore(n, groups, names){
    if (n && n.waiter && S.vocab4){
      groups.push({ label:'Who', tiles:L4_WHO.map(phraseTile) });
      groups.push({ label:'Verbs', tiles:L4_VERBS.map(phraseTile) });
      groups.push({ label:'Asking', tiles:L4_ASK.map(phraseTile) });
      groups.push({ label:'Menu', tiles:L4_MENU.map(phraseTile) });
      groups.push({ label:'Drinks', tiles:L4_DRINKS.map(phraseTile) });
      groups.push({ label:'Ingredients', tiles:L4_INGR.map(phraseTile) });
      return groups;
    }
    if (n && n.barista && S.vocab2){ groups.push({ label:'Al bar', tiles:VOCAB2.map(v => ({ w:v.w, label:v.w, gloss:v.en })) }); if (S.vocab5) groups.push({ label:'Introducing', tiles:L5_TILES.map(phraseTile) }); }
    else if (S.vocab3){
      if (S.vocab5) groups.push({ label:'Introducing', tiles:L5_TILES.map(phraseTile) });
      groups.push({ label:'Asking the way', tiles:DIR_TILES.filter(t => !t.place).map(phraseTile) });
      groups.push({ label:'Places', tiles:[...(S.lesson >= 5 ? [STATUE_TILE] : []), ...DIR_TILES.filter(t => t.place), ...hookPlaceTiles()].map(phraseTile) });
    }
    if (S.vocab5) names.unshift({ w:'mark', label:'Mark', name:true, gloss:'your friend from home' });
  },
  closed(closedId, closedDone, wasCutscene){
    if (S.tut === 'meet' && L1_PEOPLE.every(n => S.known[n.id])){ setTut('done'); setTimeout(openComplete1, 350); }
    else if (S.tut === 'l2-order' && S.l2own){ setTut('l2-emma'); toast('Someone by the café tables is waving at you.'); }
    else if (S.tut === 'l2-translate' && S.l2EmmaDone){ setTut('l2-done'); setTimeout(openComplete2, 350); }
    else if (wasCutscene && S.tut === 'l3-done'){ setTimeout(openComplete3, 350); }
    else if (S.tut === 'l4-order' && S.l4.done){ setTut('l4-done'); setTimeout(openComplete4, 350); }
    else if (S.tut === 'l5-statue' && S.l5statue && closedId === 'lucia' && closedDone){ setTut('l5-done'); setTimeout(openComplete5, 350); }
    else if (S.tut === 'l6-order' && S.l6.orderDone){ if (S.practiceDone6) setTut('l6-chiara'); else { setTut('l6-page'); setTimeout(() => { toast('While Enzo makes the cappuccino, you unfold the loose page…'); openHandbook(6); }, 500); } }
    else if (S.tut === 'l6-chiara' && closedId === 'chiara' && closedDone) setTut('l6-rosa');
    else if (S.tut === 'l6-rosa' && closedId === 'rosa' && closedDone) setTut('l6-lucia');
    else if (S.tut === 'l6-lucia' && closedId === 'lucia' && closedDone) setTut('l6-man');
    else if (S.tut === 'l6-man' && closedId === 'bruno' && closedDone){ setTut('l6-bring'); toast('Bruno is following you. Take him to <b>Mark</b> at Bar Centrale.'); }
    else if (S.tut === 'l6-bring' && closedId === 'bruno' && closedDone){ setTut('l6-done'); setTimeout(openComplete6, 350); }
  },
});

function barrierReply(){
  choices.hidden = true;
  meLine('Hi! Sorry… do you speak English?', { english:true });
  convoBusy = true;
  setTimeout(() => {
    npcLine('Mi dispiace, non parlo inglese.', null);
    setTimeout(() => {
      convoBusy = false;
      if (S.tut === 'practice'){
        sysLine('Still no English here. Finish the <b>Practice</b> tab in your handbook to unlock your dictionary.');
      } else {
        sysLine('They said <i>“Sorry, I don\'t speak English.”</i> Nobody in this piazza speaks English, so it\'s time to learn some Italian. Your <b>Learn Italian Handbook</b> has everything you need for a first conversation.');
        if (S.tut === 'walk') setTut('handbook');
      }
      showChoices([
        { label:'Leave', fn:closeDialog },
        { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(1); } },
      ]);
    }, 900);
  }, 650);
}
