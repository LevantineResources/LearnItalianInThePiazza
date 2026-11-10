/* Lesson 10 · A che ora? Lesson flow: start, Paolo's directions and the map route, the tutorial states, completion
   screen and skip. The museum square (Bruno, the crowd, Vedo, vedo, the doors) is in square.js, the ticket booth in
   ticket.js. Design: docs/lessons/10-a-che-ora.md.

   Saved state: S.l10 = { routeOK, notes (Paolo's lines, for the map), taught (Bruno's permesso lesson), demo (his
   demonstration is over), permesso / scusi / prego (picks made), barrier, slot (the ticket's entry time, minutes after
   midnight: 960 = 16:00), noted:{ price, change } (the notepad), given (the note paid with), paid, ticket, repeats,
   mistakes:{ time, full, before, rude, pad }, seed (Vedo, vedo's scenes), found (finds so far), clock:{ h, m } (the
   tower, synced with the game), time:{ right, wrong, answers }, result (the game's onDone), ispyDone, brunoAt (where
   Bruno stands, null = the bench), inside }. Tests read it through __dbg().l10. */

const L10_PRICE = 14, L10_NOW = 15 * 60;

/* the Vocabolario: the chapter's own groups (content.js) and Vedo, vedo's words (ISPY_VOCAB, ui/ispy.js), in teaching
   order: the time (ours, then the game's time tiles), the museum, Paolo, then the game (with vede), its people, animals,
   things and prepositions. The cap of 50 terms (CLAUDE.md, "Vocabolario"): Bruno's reactions in the game (Giusto! Ritenta!
   Tocca a te!…) are not cards: the game shows their English under them (ui/ispy.js), and the phrases list has them. */
const L10_GLOSSED = ['Vedo, vedo…', 'Giusto!', 'Esatto!', 'Bravo!', 'No, sbagliato!', 'Ritenta!', 'È lì!', 'Tocca a te!', 'Eccolo! / Eccola!', 'Non lo vedo!'];
{
  const ch = LESSONS.find(L => L.n === 10), own = ch.vocab, by = g => own.find(x => x.group === g);
  const iTime = ISPY_VOCAB.find(g => /time/i.test(g.group)), iGame = ISPY_VOCAB[0], rest = ISPY_VOCAB.filter(g => g !== iTime && g !== iGame);
  ch.vocab = [by('Telling the time'), iTime, by('At the museum'), by('Paolo’s directions'),
    { ...iGame, words:[...iGame.words.filter(w => !L10_GLOSSED.includes(w.it)), ...by('Seeing').words] }, ...rest];
}
QWORDS.add('ore'); QWORDS.add('ora');
CLAUSE.add('che ore'); CLAUSE.add('a che');

const freshL10 = () => ({ routeOK:false, notes:null, taught:false, demo:false, permesso:0, scusi:0, prego:0, barrier:false, slot:null,
  noted:{}, given:null, paid:false, ticket:false, repeats:0, mistakes:{ time:0, full:0, before:0, rude:0, pad:0 },
  seed:Math.floor(Math.random() * 1e9), found:0, clock:null, time:{ right:0, wrong:0, answers:[] }, result:null, ispyDone:false,
  brunoAt:null, inside:false });
const l10Slot = () => (S.l10 && S.l10.slot) || 960;
const l10HHMM = mins => `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`;

/* times in Italian, as the cashier and Bruno say them (12-hour, as people talk): "alle quattro e mezza", "sono le tre" */
function l10TimeWords(mins){
  let h = Math.floor(mins / 60) % 12 || 12, m = mins % 60, tail = '';
  if (m === 15) tail = ' e un quarto';
  else if (m === 30) tail = ' e mezza';
  else if (m === 45){ tail = ' meno un quarto'; h = h % 12 + 1; }
  else if (m && m < 30) tail = ' e ' + numIt(m);
  else if (m){ tail = ' meno ' + numIt(60 - m); h = h % 12 + 1; }
  return { one:h === 1, hour:numIt(h), tail };
}
const l10AtIt = mins => { const t = l10TimeWords(mins); return (t.one ? "all'una" : 'alle ' + t.hour) + t.tail; };
const l10NowIt = mins => { const t = l10TimeWords(mins); return (t.one ? "è l'una" : 'sono le ' + t.hour) + t.tail; };
/* "tra un'ora", "tra un'ora e mezza", "tra due ore" (from 15:00) */
function l10In(mins){
  const d = mins - L10_NOW, h = Math.floor(d / 60), half = d % 60 === 30;
  return { it:'tra ' + (h === 1 ? "un'ora" : numIt(h) + ' ore') + (half ? ' e mezza' : ''), en:'in ' + (h === 1 ? 'an hour' : NUM_EN[h] + ' hours') + (half ? ' and a half' : '') };
}
const l10WaitEn = () => { const d = l10Slot() - L10_NOW, h = Math.floor(d / 60), half = d % 60 === 30;
  return (h === 1 ? 'An hour' : cap(NUM_EN[h]) + ' hours') + (half ? ' and a half' : ''); };

/* ---------- Paolo: the way to the museum (tu). Older lessons are unchanged: he only knows this from Lesson 10. ---------- */
NPC.marco.directions = Object.assign(NPC.marco.directions || {}, { museo:L10_PAOLO_DIR });
NPC.marco.needDirIn.push('l10-start');
{
  const bye = Object.getOwnPropertyDescriptor(NPC.marco, 'dirBye'), orig = bye && !bye.get ? bye.value : undefined;
  Object.defineProperty(NPC.marco, 'dirBye', { configurable:true, enumerable:true,
    get:() => S.lesson === 10 ? { it:'Prego! Buona visita, {Me}!', en:'You\'re welcome! Enjoy the museum, {Me}!' } : orig });
}
function l10PaoloHint(st){
  if (st.lastDir === 'museo') return { h:"He told you the way. Didn't catch it? Ask him to repeat, or check a direction. Then thank him.",
    strong:'He told you the way. Ask him to repeat (<b>ripetere</b>), or thank him (<b>grazie</b>).', step:'dirs' };
  if (st.lastQ === 'how') return { h:'He asked how you are.', strong:'He asked how you are: <b>sto bene</b>…', step:'how' };
  return { h:"Ask Paolo the way to the museum. He's a friend: use the <i>tu</i> forms.", strong:"Ask him where (<b>dov'è</b>) the museum is. He's a friend: <b>scusa</b>, not scusi.", step:'ask' };
}

LESSON_HOOKS[10] = {
  n:10,
  vocab:[...L10_TIME_TILES, ...L10_BUY, ...L10_NUM_NEW],
  vocabNote:'In your tile bank at the ticket booth (L’ora, Al museo, the numbers up to 24).',
  bankTiles:[...L10_POLITE, L10_PLACE_TILE],               // also in this lesson's banks: checked by the vocab audit
  doneTut:'l10-done',
  bookPulse:['l10-handbook', 'l10-vocab', 'l10-practice'],
  mapPulse:['l10-route'],

  objective:{
    'l10-start':'Ask Paolo the way to the museum',
    'l10-route':() => S.l10 && S.l10.routeOK ? 'Walk to the museum' : 'Trace the route to the museum',
    'l10-crowd':() => S.l10 && S.l10.taught ? 'Get to the ticket booth' : 'Talk to Bruno',
    'l10-booth':'Buy a ticket',
    'l10-handbook':'Open your handbook',
    'l10-vocab':'Learn the Lesson 10 words',
    'l10-practice':'Finish the Lesson 10 practice',
    'l10-ticket':'Buy a ticket for the next entry',
    'l10-wait':'Wait with Bruno',
    'l10-ispy':() => `Play Vedo, vedo · ${S.l10 ? S.l10.found : 0}/10`,
    'l10-go':'Show your ticket at the museum doors',
    'l10-done':'Lezione 10 completata',
  },
  guide:{
    'l10-start':near => near === NPC.marco ? 'Press <kbd>E</kbd> to talk to Paolo.'
      : "You'd like to see the masterpieces at the <b>Museo d'Arte · I Capolavori</b>: Leonardo, Botticelli, Caravaggio… But where is it? Ask someone the way. <b>Paolo</b> is by the fountain.",
    'l10-route':() => S.l10 && S.l10.routeOK ? "Route marked. Open the map (<kbd>M</kbd>) and walk to the <b>Museo d'Arte</b>."
      : "Open the map (<kbd>M</kbd>) and trace Paolo's directions from the piazza.",
    'l10-crowd':near => {
      if (!S.l10 || !S.l10.taught) return near === NPC.bruno ? 'Press <kbd>E</kbd> to talk to Bruno.' : "The museum square, and it's packed! <b>Bruno</b> is on the bench, waving at you.";
      if (!S.l10.demo) return 'Watch Bruno…';
      return 'Get through the crowd to the ticket booth, the <i>Biglietteria</i> beside the doors. Walk into someone in your way, or press <kbd>E</kbd> beside them.';
    },
    'l10-booth':near => near === NPC.cassiera ? "Press <kbd>E</kbd> to talk to the cashier. She's a stranger at work: polite forms."
      : "You're through! Buy a ticket at the window of the <i>Biglietteria</i>.",
    'l10-handbook':() => {
      if (modalOpen && sheet.classList.contains('book') && hbLesson === 10) setTut(vocabCheckDone(10) ? 'l10-practice' : 'l10-vocab');
      return 'Times, and you had none. Open the handbook (<kbd>H</kbd>): <b>Lezione 10 · A che ora?</b>';
    },
    'l10-vocab':'Read Lezione 10 (the clock face!). Then learn its words: open the <b>Words</b> tab, flip through the flashcards and pass the quiz. The <b>Practice</b> opens after that.',
    'l10-practice':'Words learned! Now finish the <b>Practice</b> tab of Lezione 10.',
    'l10-ticket':near => near === NPC.cassiera ? 'Press <kbd>E</kbd> to talk to the cashier, politely. The little sign on the glass says <b>16:00</b>.'
      : 'Back to the ticket booth: buy a ticket for the next entry. The little sign on the glass says <b>16:00</b>.',
    'l10-wait':near => near === NPC.bruno ? 'Press <kbd>E</kbd> to talk to Bruno.'
      : `Ticket in hand: entry at <b>${l10HHMM(l10Slot())}</b>, and it's only three. Bruno is on the bench: go and sit with him.`,
    'l10-ispy':near => near === NPC.bruno ? 'Press <kbd>E</kbd> to carry on with the game.'
      : `Play <b>Vedo, vedo</b> with Bruno until <b>${l10HHMM(l10Slot())}</b>: talk to him on the bench to carry on.`,
    'l10-go':() => `It's ${esc(ispyTimeEn(l10Slot()))}! Walk up to the museum doors and press <kbd>E</kbd> to show your ticket.`,
    'l10-done':() => "Lezione 10 completata! Ticket shown, doors open: the masterpieces are waiting."
      + (hookFor(11) && hookFor(11).start && LESSONS[10] ? ` <button class="gbtn" data-action="l11">Start Lezione 11 · ${esc(LESSONS[10].title)}</button>` : ''),
  },
  markers:{ 'l10-start':'marco', get 'l10-crowd'(){ return S.l10 && !S.l10.taught ? 'bruno' : null; }, 'l10-booth':'cassiera', 'l10-ticket':'cassiera',
    'l10-wait':'bruno', 'l10-ispy':'bruno' },

  start(){
    if (modalOpen) closeModal();
    S.lesson = 10; S.l5follow = false; S.brunoFollow = false; S.l10 = freshL10(); S.crowd = {};
    setTut('l10-start'); lastGuide = '';
    travelTo('piazza', { x:480, y:520 }, 'Il pomeriggio', 'That afternoon, Piazza Centrale');
    setTimeout(() => toast('<b>Lezione 10 · A che ora?</b> has started'), 1800);
  },
  /* the end of Lesson 10: the ticket for 16:00 bought, Vedo, vedo played, the museum doors open */
  skip(){
    const l10 = Object.assign(freshL10(), { routeOK:true, notes:L10_PAOLO_DIR.lines.map(l => ({ ...l })), taught:true, demo:true, permesso:2, barrier:true,
      slot:960, noted:{ price:L10_PRICE, change:20 - L10_PRICE }, given:20, paid:true, ticket:true, found:10, clock:{ h:16, m:0 }, ispyDone:true,
      time:{ right:3, wrong:0, answers:[] }, brunoAt:{ x:326, y:212 }, inside:true });
    Object.assign(S, { lesson:10, vocab10:true, practiceDone10:true, tut:'l10-done', scene:'museo', l5follow:false, brunoFollow:false, l10,
      crowd:{ maestra:{ x:536, y:404 }, turista2:{ x:770, y:346 }, turista4:{ x:572, y:242 } } });
    (PX[10] = freshPX()).i = LESSONS[9].exercises.length;
  },
  restore(){
    if (S.lesson < 10) return;
    if (!S.l10 || typeof S.l10 !== 'object') S.l10 = freshL10();
    const f = freshL10();
    Object.keys(f).forEach(k => { if (S.l10[k] === undefined || (S.l10[k] === null && !['notes', 'slot', 'given', 'clock', 'result', 'brunoAt'].includes(k))) S.l10[k] = f[k]; });
    ['noted', 'mistakes', 'time'].forEach(k => { if (typeof S.l10[k] !== 'object') S.l10[k] = f[k]; });
    /* saves from before the word check: the practice is locked until the words are learned */
    if (S.tut === 'l10-practice' && !vocabCheckDone(10)) S.tut = 'l10-vocab';
    /* saved during Bruno's demonstration: it is over (the teacher has stepped aside) */
    if (S.l10.taught && !S.l10.demo){ S.l10.demo = true; S.crowd = S.crowd || {}; if (!S.crowd.maestra) S.crowd.maestra = { x:536, y:404 }; }
    /* a game left open: carry on from the bench */
    if (S.tut === 'l10-go' && !S.l10.ispyDone) S.tut = 'l10-ispy';
  },

  /* the museum square, Lesson 10: Bruno is there (on the bench) */
  sceneOf(n){
    if (n.id === 'bruno' && S.lesson === 10 && S.l10) return 'museo';
    return null;
  },
  place(){
    if (S.lesson !== 10 || !S.l10) return;
    l10PlaceBruno();
    /* arriving at the museum square after tracing the route */
    if (S.tut === 'l10-route' && S.scene === 'museo' && S.l10.routeOK){
      setTut('l10-crowd');
      setTimeout(l10Arrive, 1700);
    }
  },

  /* the word check (ui/vocab.js) is passed: on to the practice */
  onVocab(){
    if (['l10-booth', 'l10-handbook', 'l10-vocab'].includes(S.tut) && S.l10 && S.l10.barrier) setTut('l10-practice');
  },
  onPractice(){
    toast("New tiles: <b>L'ora</b> and the numbers up to <b>24</b>. Back to the ticket booth!");
    if (['l10-booth', 'l10-handbook', 'l10-vocab', 'l10-practice'].includes(S.tut) && S.l10 && S.l10.barrier) setTut('l10-ticket');
  },

  placeTiles(){ return S.lesson >= 10 ? [L10_PLACE_TILE] : []; },
  mapRoute:{
    key:'l10', who:'Paolo', route:L10_ROUTE, dest:'museo',
    notes:() => S.l10 && S.l10.notes,
    tracing:() => S.tut === 'l10-route', ok:() => !!(S.l10 && S.l10.routeOK), onOK(){ S.l10.routeOK = true; },
    notThere:"You're not there yet. The museum is <b>vicino alla stazione</b>.",
    wrong(i, node){
      const at = node.join(',');
      if (i === 1) return 'Paolo started with <b>Vai dritto fino alla banca</b>. Where is the bank on the map?';
      if (i === 2) return at === '2,2' ? '<b>Fino alla banca</b>: as far as the bank, and no further. Turn there.' : '<b>Alla banca gira a sinistra</b>: which way is <i>sinistra</i>?';
      if (i === 3) return at === '0,3' ? '<b>Alla prima strada</b>: turn at the first street you come to.' : 'Gira <b>ancora</b> a sinistra: the same way you turned at the bank.';
      return null;
    },
  },
  dests:{ museo:() => S.lesson > 10 || !!(S.l10 && S.l10.routeOK) },
  /* the map's fast travel (world/map.js): not in the middle of the crowd, while Bruno shows you how to get through */
  fastTravel(){ if (S.lesson === 10 && S.tut === 'l10-crowd' && S.scene === 'museo') return 'Bruno is showing you how to get through the crowd.'; },

  /* conversations: Bruno (square.js) and the cashier (ticket.js) */
  talk(npc){
    if (S.lesson !== 10 || !S.l10) return false;
    if (npc.id === 'bruno') return l10BrunoTalk();
    if (npc.id === 'cassiera') return l10CashierOpen(npc);
    return false;
  },
  bank(npc, groups){ return l10CashierBank(npc, groups); },
  phrases(){ return S.lesson >= 10 ? l10Phrases() : []; },
  react(id, n, st, add, out, ints, k){ return l10CashierReact(id, n, st, add, out, ints || [id], k); },
  /* Paolo's directions (the tile-bank brain gives them: directions.museo); the cashier's hints */
  hint(n, st){
    if (S.lesson === 10 && n.id === 'marco' && ['l10-start', 'l10-route'].includes(S.tut)) return l10PaoloHint(st);
    return l10CashierHint(n, st);
  },
  afterTurn(n, out, res, words){
    if (S.lesson !== 10 || !S.l10) return false;
    if (n.id === 'cassiera') return l10CashierAfter(n, out, res, words);
    if (n.id !== 'marco' || out.directions !== 'museo') return false;
    if (S.tut === 'l10-start'){ S.l10.notes = L10_PAOLO_DIR.lines.map(l => ({ it:l.it, en:l.en })); setTut('l10-route'); }
    /* (the generic "he told you the way" hint quotes the Italian to say: this one doesn't) */
    showHint("He told you the way! Didn't catch it? Ask him to repeat, or check a direction. Then thank him, and open the map (<kbd>M</kbd>).", 'Fatto!');
    return true;
  },
  onClose(closedId, closedDone){ return l10OnClose(closedId, closedDone); },

  /* the museum square (square.js): the crowd, the clock, the doors */
  crowdActive(){ return S.lesson === 10 && S.l10 ? !!S.l10.taught : undefined; },
  onCrowd(n, choice){ return l10OnCrowd(n, choice); },
  crowdHint(n, kind){ return l10CrowdHint(n, kind); },
  onCrowdMoved(n){ l10CrowdMoved(n); },
  clock(){ return S.lesson === 10 && S.l10 ? (S.l10.clock || { h:15, m:0 }) : null; },
  door(d){ return l10Door(d); },
};

/* ---------- completion ---------- */
function openComplete10(){
  openModal('');
  const L = S.l10, slot = l10Slot(), R = L.result || {}, T = R.time || { asked:3, right:L.time.right, wrong:L.time.wrong };
  const change = L.noted.change != null ? L.noted.change : (L.given || 20) - L10_PRICE;
  const ticket = `<div style="display:flex;gap:0;max-width:420px;margin:6px 0 14px;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(15,34,96,.18);font-family:'Titillium Web',sans-serif">
      <div style="flex:1;background:#fffdf8;padding:12px 16px;border:2px solid #7a3a6e;border-right:2px dashed #7a3a6e;border-radius:12px 0 0 12px">
        <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7a3a6e;font-weight:700">Museo d'Arte · I Capolavori</div>
        <div style="font-family:'Bodoni Moda',Georgia,serif;font-size:22px;font-style:italic;color:#0f2260;margin:2px 0">Biglietto · intero</div>
        <div style="font-size:14px">Ingresso <b style="font-size:18px">${l10HHMM(slot)}</b> · <i>${esc(l10AtIt(slot))}</i></div></div>
      <div style="width:96px;background:#7a3a6e;color:#fff;display:grid;place-items:center;text-align:center;padding:8px">
        <div><div style="font-size:24px;font-weight:700">€ ${L.noted.price || L10_PRICE}</div><div style="font-size:12px;opacity:.85">resto € ${change}</div></div></div></div>`;
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione 10 completata!</em></h2><p class="sub">A che ora? · Telling the time</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>You followed Paolo's directions to the museum, got through the crowd with <b>Permesso!</b>, froze at <i>A che ora?</i>, learned to tell the time
        (<b>sono le tre e mezza</b>, <b>alle quattro</b>, <i>le sedici</i>), bought a ticket and counted your change. Then <b>Vedo, vedo</b> with Bruno until the clock struck ${esc(ispyTimeEn(slot).replace(/ o'clock$/, ''))}.</p>
      <h3>Your ticket</h3>${ticket}
      <h3>Paolo's way</h3>
      <ol class="l9-route-lines">${L10_PAOLO_DIR.lines.map(l => `<li>${esc(l.it)}</li>`).join('')}</ol>
      <h3>Your numbers</h3>
      <div class="stats">
        <div><b>${R.finds || L.found || 10}</b><span>things found in Vedo, vedo${R.misses ? ` (${R.misses} ${R.misses === 1 ? 'miss' : 'misses'})` : ''}</span></div>
        <div><b>${T.right}/${T.asked || 3}</b><span>times you read the clock right${T.wrong ? ` (and ${T.wrong} wrong ${T.wrong === 1 ? 'try' : 'tries'} on the way)` : ''}</span></div>
        <div><b>${L.permesso}</b><span>${L.permesso === 1 ? 'person' : 'people'} you got past with <i>Permesso!</i></span></div>
      </div>
      <div class="next"><p class="kicker">Next</p><p>Inside, the masterpieces: Leonardo, Botticelli, Caravaggio, Boccioni… Bruno has opinions about all of them.</p></div>
      <div class="cta"><button class="btn${hookFor(11) && hookFor(11).start ? '' : ' primary'}" data-close>Keep exploring</button>${hookFor(11) && hookFor(11).start ? '<button class="btn primary" id="goL11">Start Lezione 11</button>' : ''}</div>
    </div>`;
  if (hookFor(11) && hookFor(11).start) $('#goL11').onclick = () => hookFor(11).start();
}
