/* EXAMPLE LESSON flow. Every key in LESSON_HOOKS[n] is optional; see CLAUDE.md for the list.

   The loop: talk to Giulia -> she asks you the time and you can't answer (barrier)
   -> handbook + practice -> ask her the time with the new tiles -> lesson complete.

   Keep this lesson's saved state under S.lex (a real lesson: S.lN; create it in start(), repair it in restore()),
   and its tutorial states named 'lex-…' (a real lesson: 'lN-…'). Never add fields to FRESH() in engine/state.js.
   S['vocab' + EX_N] / S['practiceDone' + EX_N] are set by the handbook when the practice is finished. */

/* formatSentence (engine/parser.js) adds "?" when a sentence contains a question word, and
   starts a new sentence at clause words (CLAUSE). Lessons add their own words to these sets. */
QWORDS.add('ore');

LESSON_HOOKS[EX_N] = {
  n:EX_N,
  vocab:LEX_TILES,                                   // counted in the header, listed in the dictionary
  vocabNote:'In your tile bank whenever you are in the piazza.',
  doneTut:'lex-done',                                // objective shows as completed in this state
  bookPulse:['lex-handbook', 'lex-practice'],         // Handbook button pulses in these states

  /* header objective and the guide banner, per tutorial state (string, or function of nearest NPC) */
  objective:{
    'lex-start':'Say hello to Giulia', 'lex-handbook':'Open your handbook', 'lex-practice':`Finish the Lesson ${EX_N} practice`,
    'lex-ask':'Ask Giulia the time', 'lex-done':`Lezione ${EX_N} completata`,
  },
  guide:{
    'lex-start':near => near === NPC.giulia ? 'Press <kbd>E</kbd> to talk to Giulia.' : 'Giulia is looking at her wrist. Go and say hello.',
    'lex-handbook':'Giulia asked you the time and you froze. Open the handbook (<kbd>H</kbd>): learn the <b>Words</b> first, then the practice.',
    'lex-practice':`Read Lezione ${EX_N}, then finish its <b>Practice</b> tab.`,
    'lex-ask':'Ask Giulia what time it is: <i>Scusa, che ore sono?</i>',
    'lex-done':`Lezione ${EX_N} completata!`,
  },
  markers:{ 'lex-start':'giulia', 'lex-ask':'giulia' },   // quest marker above this NPC

  /* start the lesson (from the previous lesson's "Start" button or the intro skip links) */
  start(){
    if (modalOpen) closeModal();
    S.lesson = EX_N; S.l5follow = false; S.lex = { asked:false }; setTut('lex-start'); lastGuide = '';
    travelTo('piazza', { x:480, y:520 }, 'Il pomeriggio', 'That afternoon');
    setTimeout(() => toast(`<b>Lezione ${EX_N} · Che ore sono?</b> has started`), 1800);
  },
  /* the state at the end of this lesson, for the skip links of later lessons */
  skip(){ Object.assign(S, { lesson:EX_N, ['vocab' + EX_N]:true, ['practiceDone' + EX_N]:true, tut:'lex-done', lex:{ asked:true } }); },
  /* repair saved state after loading a save */
  restore(){ if (S.lesson >= EX_N && !S.lex) S.lex = { asked:false }; },

  /* openConvo: return true when this lesson took over the conversation */
  talk(npc){
    if (npc.id !== 'giulia' || S.tut !== 'lex-start') return false;
    convo.mode = 'cutscene';
    npcLine(fill('Ciao, {Me}! Scusa, che ore sono?'), fill('Hi, {Me}! Sorry, what time is it?'));
    sysLine("You don't know how to tell the time in Italian yet.");
    showChoices([{ label:'Leave', primary:true, fn:() => { convo.done = true; closeDialog(); } }]);
    return true;
  },
  /* the word check (the chapter's Vocabolario: flashcards, then a quiz) passed for the first time: the practice is open */
  onVocab(){ if (['lex-start', 'lex-handbook'].includes(S.tut)) setTut('lex-practice'); },
  /* practice finished for the first time */
  onPractice(){ if (['lex-start', 'lex-handbook', 'lex-practice'].includes(S.tut)) setTut('lex-ask'); toast('New tiles: <b>telling the time</b>.'); },

  /* tile bank: return the groups to show, or nothing to fall through to the normal bank */
  bank(npc, groups, names){
    if (!S['vocab' + EX_N] || !npc || npc.id !== 'giulia') return null;
    groups.push({ label:"L'ora", tiles:LEX_TILES.map(phraseTile) });
    if (names.length) groups.push({ label:'Names', tiles:names });
    return groups;
  },
  /* extra phrases for the parser: [intent, 'words in order'] */
  phrases(npc){ return S['vocab' + EX_N] ? [['ask_time', 'che ore sono'], ['time:2', 'sono le due'], ['time:1', "è l'una"]] : []; },
  /* the NPC brain asks this for every intent it parses: return true when handled */
  react(id, npc, st, add, out){
    if (id === 'ask_time'){ add('Sono le due.', "It's two o'clock."); if (S.lex) S.lex.asked = true; st.wrapping = true; return true; }
    if (id.startsWith('time:')){ add('Grazie!', 'Thanks!'); return true; }
    return false;
  },
  /* OPTIONAL (delete what your lesson doesn't need). Here: once the lesson is done, Giulia's directions to the
     market can be traced on the map, which unlocks the Mercato destination.
     placeTiles: extra tiles for the "Places" group of the tile bank. place = a PLACES key (content/places.js);
     the parser turns "dov'è" + the tile into the intent where:<place>. */
  placeTiles(){ return S['vocab' + EX_N] ? [{ key:'il mercato', label:'il mercato', words:'il mercato', en:'the market', place:'mercato' }] : []; },
  /* mapRoute: a route to trace on the city map (M), like Lessons 3 and 5. Nodes are [column, row]; [2,4] is the
     piazza. accept: extra end nodes also counted as right. notes(): the directions shown beside the map.
     wrong(i, node, path): the hint when step i is wrong. onOK(): store that the route is done. */
  mapRoute:{
    key:'lex', who:'Giulia', route:[[2,4],[2,3],[1,3]], accept:[[0,3]], dest:'mercato',
    notes:() => S.lex && S.lex.asked ? [{ it:'Vai dritto, poi gira a sinistra.', en:'Go straight, then turn left.' }] : null,
    wrong:i => i === 2 ? '<b>Gira a sinistra</b>: turn left, not right.' : null,
    tracing:() => S.tut === 'lex-done', ok:() => !!(S.lex && S.lex.routeOK), onOK(){ S.lex.routeOK = true; },
  },
  /* dests: unlock a destination of the map (DESTS in world/map.js) */
  dests:{ mercato:() => !!(S.lex && S.lex.routeOK) },

  /* closeDialog: run tutorial transitions; return true when handled */
  onClose(closedId, closedDone){
    if (S.tut === 'lex-start' && closedId === 'giulia' && closedDone){ setTut('lex-handbook'); return true; }
    if (S.tut === 'lex-ask' && S.lex && S.lex.asked){ setTut('lex-done'); setTimeout(openCompleteEx, 350); return true; }
    return false;
  },
};

function openCompleteEx(){
  openModal('');
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione ${EX_N} completata!</em></h2><p class="sub">Che ore sono? · Telling the time</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>You asked the time with <b>Che ore sono?</b> and understood the answer.</p>
      <h3>Your numbers</h3>${statsBlock([1, 'times you asked the time'])}
      <div class="cta"><button class="btn primary" data-close>Keep exploring</button></div>
    </div>`;
}
