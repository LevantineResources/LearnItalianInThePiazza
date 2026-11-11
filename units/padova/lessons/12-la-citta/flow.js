/* Lesson 12 · Un giorno in città. Lesson flow: start, Chiara's directions and the map route, the station (the barrier,
   the handbook), the ticket (station.js: the clerk, the train that pulls out), the town's quests (the "!" spots, the task
   list, the passport: engine/quests.js), the clock that moves on with every task, the dusk cutscene, the night, 23:00, the
   night train (validate, the conductor, board), the completion screen and skip. Design: docs/lessons/12-la-citta.md.

   The tutorial states: l12-start → l12-route → l12-barrier → l12-handbook → l12-vocab → l12-practice → l12-ticket →
   l12-explore (afternoon tasks) → l12-dusk (the cutscene) → l12-night (night tasks) → l12-late (23:00: to the station,
   validate, the conductor, board) → l12-done.

   How many tasks: L12_NEED = { afternoon:3, night:2 } (the design). The town has 12 quests in the design but only those
   built are in QUESTS; so the counts actually asked are l12Need(window) = min(L12_NEED[window], the quests that can still be
   done in that window): afternoon, the quests whose window is 'any' or 'afternoon'; night, those not done yet whose window
   is 'any' or 'night' (plus the ones already done tonight). With fewer quests built the lesson stays completable (with no
   night quest left, 23:00 comes straight after the dusk). When all 12 exist this is simply 3 and 2.

   The clock (S.l12.clock, minutes): 14:00 in the piazza, 14:30 at the station, 14:35 the Venice train leaves, 15:00 the
   town opens; every afternoon task moves it on (15:00 → 19:30 in l12Need('afternoon') steps: 16:30, 18:00, 19:30 for 3);
   the dusk is 19:30 → 20:00; every night task moves it (20:00 → 23:00: 21:30, 23:00 for 2). It is the museum tower's
   time too (the clock hook) and is shown in the header (gameClock).

   Saved state: S.l12 = { notes (Chiara's lines, for the map), routeOK, barrier, trainGone, missed (the clerk said it had
   just left), when ('tonight'), kind ('andata' | 'ar'), price, noted, paid, given, ticket, repeats, mistakes:{ rude, when,
   pad, pay }, townOpen, clock, doneA:[ids], doneN:[ids] (tasks done in the afternoon / at night), dusk, late, validated,
   checked (the conductor saw the ticket), boarded, stampAt:{ ticket, train } }. Tests read it through __dbg().l12. */

const L12_NEED = { afternoon:3, night:2 };
const L12_PRICE = { andata:12, ar:24 };
const freshL12 = () => ({ notes:null, routeOK:false, barrier:false, trainGone:false, missed:false, when:null, kind:null, price:null, noted:false, paid:false, given:null, ticket:false,
  repeats:0, mistakes:{ rude:0, when:0, pad:0, pay:0 }, townOpen:false, clock:14 * 60, doneA:[], doneN:[], dusk:false, late:false, validated:false, checked:false, boarded:false, stampAt:{}, free:false });
const l12On = () => S.lesson === 12 && !!S.l12;
const l12HHMM = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
function l12SetClock(m){ if (!l12On()) return; S.l12.clock = m; save(); renderHUD(); }
/* the tasks asked in a window (see the header comment) */
function l12Need(win){
  const L = S.l12 || freshL12();
  if (win === 'afternoon') return Math.min(L12_NEED.afternoon, QUESTS.filter(q => q.window !== 'night').length);
  const left = QUESTS.filter(q => q.window !== 'afternoon' && !(questPeek(q.id) || {}).done).length;
  return Math.min(L12_NEED.night, L.doneN.length + left);
}
const l12Count = win => S.l12 ? (win === 'afternoon' ? S.l12.doneA : S.l12.doneN).length : 0;

/* ---------- Chiara: the way to the station (tu). Only from Lesson 12 on. ---------- */
NPC.chiara.directions = Object.assign(NPC.chiara.directions || {}, { stazione:L12_CHIARA_DIR });
NPC.chiara.needDirIn.push('l12-start');
{
  const bye = Object.getOwnPropertyDescriptor(NPC.chiara, 'dirBye'), orig = bye && !bye.get ? bye.value : undefined;
  Object.defineProperty(NPC.chiara, 'dirBye', { configurable:true, enumerable:true,
    get:() => S.lesson === 12 && S.tut === 'l12-route' ? { it:'Prego! Buon viaggio, {Me}!', en:'You\'re welcome! Have a good trip, {Me}!' } : orig });
}
function l12ChiaraHint(st){
  if (st.lastDir === 'stazione') return { h:"She told you the way. Didn't catch it? Ask her to repeat, or check a direction. Then thank her.",
    strong:'She told you the way. Ask her to repeat (<b>ripetere</b>), or thank her (<b>grazie</b>).', step:'dirs' };
  if (st.lastQ === 'how') return { h:'She asked how you are.', strong:'She asked how you are: <b>sto bene</b>…', step:'how' };
  if (!st.npcGreeted) return { h:"She's reading. Get her attention: she's a friend.", strong:'Get her attention: <b>ciao</b>.', step:'greet' };
  return { h:"Ask Chiara the way to the station. She's a friend: the <i>tu</i> forms.", strong:"Ask her where (<b>dov'è</b>) the station is: the <b>Places</b> tiles. A friend: <b>scusa</b>.", step:'ask' };
}

/* the station's board, by the time of day */
function l12Board(){
  const L = S.l12;
  if (!L.trainGone) return [{ time:'14:35', dest:'Venezia S. Lucia', bin:3, note:'in partenza', cls:'hot' }, { time:'15:10', dest:'Verona Porta Nuova', bin:1 },
    { time:'15:42', dest:'Bologna Centrale', bin:2 }, { time:'16:05', dest:'Milano Centrale', bin:4 }, { time:'16:30', dest:'Treviso Centrale', bin:1 }];
  if (daytime() !== 'night') return [{ time:'15:10', dest:'Verona Porta Nuova', bin:1 }, { time:'15:42', dest:'Bologna Centrale', bin:2 }, { time:'16:05', dest:'Milano Centrale', bin:4 },
    { time:'16:30', dest:'Treviso Centrale', bin:1 }, { time:'23:15', dest:'Venezia S. Lucia', bin:3, note:'Laguna Express', cls:'hot' }];
  return [{ time:'22:40', dest:'Verona Porta Nuova', bin:1, note:L.late ? 'partito' : '', cls:L.late ? 'gone' : '' }, { time:'23:15', dest:'Venezia S. Lucia', bin:3, note:'Laguna Express · in partenza', cls:'hot' },
    { time:'23:40', dest:'Bologna Centrale', bin:2 }, { time:'23:58', dest:'Vicenza', bin:4 }];
}

LESSON_HOOKS[12] = {
  n:12,
  vocab:L12_TILES,
  vocabNote:'In your tile bank at the station (In stazione), with the numbers up to 24.',
  bankTiles:[...L10_POLITE, ...L10_BUY, L12_PLACE_TILE],
  doneTut:'l12-done',
  bookPulse:['l12-handbook', 'l12-vocab', 'l12-practice'],
  mapPulse:['l12-route'],

  objective:{
    'l12-start':'Ask Chiara the way to the station',
    'l12-route':() => S.l12 && S.l12.routeOK ? 'Walk to the station' : 'Trace the route to the station',
    'l12-barrier':'Buy a ticket to Venice',
    'l12-handbook':'Open your handbook',
    'l12-vocab':'Learn the Lesson 12 words',
    'l12-practice':'Finish the Lesson 12 practice',
    'l12-ticket':() => S.l12 && S.l12.ticket ? 'Ticket bought!' : 'Buy a ticket to Venice',
    'l12-explore':() => `Explore the town · ${l12Count('afternoon')}/${l12Need('afternoon')}`,
    'l12-dusk':'',
    'l12-night':() => l12Need('night') ? `The town by night · ${l12Count('night')}/${l12Need('night')}` : 'Evening in town',
    'l12-late':() => S.l12 && S.l12.checked ? 'Get on the train' : S.l12 && S.l12.validated ? 'Show your ticket to the conductor' : 'Catch the 23:15 to Venice',
    'l12-done':'Lezione 12 completata',
  },
  guide:{
    'l12-start':near => near === NPC.chiara ? 'Press <kbd>E</kbd> to talk to Chiara.'
      : "Lucia was right: you have to see <b>Venice</b>. The trains go from the station… but where is it? Ask someone the way: <b>Chiara</b> is at the newsstand.",
    'l12-route':() => S.l12 && S.l12.routeOK ? 'Route marked. Open the map (<kbd>M</kbd>) and walk to the <b>Stazione</b>.'
      : "Open the map (<kbd>M</kbd>) and trace Chiara's directions from the piazza.",
    'l12-barrier':near => near === NPC.bigliettaio ? "Press <kbd>E</kbd> to talk to the clerk. A stranger at work: polite forms."
      : 'The station! The <b>board</b> (<i>Partenze</i>), the platforms, and the ticket office on the left, the <i>Biglietteria</i>. Buy a ticket to Venice at its window.',
    'l12-handbook':() => {
      if (modalOpen && sheet.classList.contains('book') && hbLesson === 12) setTut(vocabCheckDone(12) ? 'l12-practice' : 'l12-vocab');
      return 'Trains, times, platforms: far too fast. Open the handbook (<kbd>H</kbd>): <b>Lezione 12 · Un giorno in città</b>.';
    },
    'l12-vocab':'Read Lezione 12 (tickets, times, platforms). Then learn its words: open the <b>Words</b> tab, flip through the flashcards and pass the quiz. The <b>Practice</b> opens after that.',
    'l12-practice':'Words learned! Now finish the <b>Practice</b> tab of Lezione 12.',
    'l12-ticket':near => S.l12 && S.l12.ticket ? 'Ticket bought! Say goodbye to the clerk.'
      : near === NPC.bigliettaio ? 'Press <kbd>E</kbd> to talk to the clerk, politely.' : 'Back to the ticket office, the <i>Biglietteria</i>: a ticket to Venice.',
    'l12-explore':() => `Your train leaves at <b>23:15</b>, so the town is yours until tonight. The <b>!</b> spots on your map (<kbd>M</kbd>) are things to do; your phone (<kbd>P</kbd>) has the list, <b>Compiti</b>. This afternoon: <b>${l12Count('afternoon')}/${l12Need('afternoon')}</b>.`,
    'l12-dusk':'',
    'l12-night':() => l12Need('night') ? `Evening in town. The night's <b>!</b> spots are on your map (<kbd>M</kbd>); your phone has the list. Tonight: <b>${l12Count('night')}/${l12Need('night')}</b>. Your train: <b>23:15</b>.`
      : 'Evening in town. Your train: <b>23:15</b>.',
    'l12-late':near => {
      const L = S.l12; if (!L) return '';
      if (S.scene !== 'stazione') return "It's <b>23:00</b>! The train to Venice leaves at <b>23:15</b>. Back to the station: the <b>!</b> on your map (<kbd>M</kbd>).";
      if (near === NPC.capotreno) return 'Press <kbd>E</kbd> to talk to the conductor. Polite forms.';
      if (!L.validated) return 'Which platform? Look at the board (<i>Partenze</i>). Then, before you get on: the culture note in your handbook said something about green machines…';
      if (!L.checked) return 'Ticket stamped. The conductor is by the train\'s door: show him your ticket.';
      return 'All set! Get on the train: its open door, by the conductor (<kbd>E</kbd>).';
    },
    'l12-done':() => 'Lezione 12 completata! Venice tomorrow morning. The tasks you didn\'t do are still on your map, any time.'
      + (hookFor(13) && hookFor(13).start && LESSONS[12] ? ` <button class="gbtn" data-action="l13">Start Lezione 13 · ${esc(LESSONS[12].title)}</button>` : ''),
  },
  markers:{ 'l12-start':'chiara', 'l12-barrier':'bigliettaio', get 'l12-ticket'(){ return S.l12 && S.l12.ticket ? null : 'bigliettaio'; },
    get 'l12-late'(){ return S.l12 && S.l12.validated && !S.l12.checked ? 'capotreno' : null; } },

  start(){
    if (modalOpen) closeModal();
    if (cutsceneOn()) cutsceneEnd();
    S.lesson = 12; S.l5follow = false; S.brunoFollow = false; S.l12 = freshL12(); S.daytime = 'afternoon';
    setTut('l12-start'); lastGuide = '';
    travelTo('piazza', { x:480, y:520 }, 'Il giorno dopo', 'Piazza Centrale, after lunch');
    setTimeout(() => toast('<b>Lezione 12 · Un giorno in città</b> has started'), 1800);
  },
  /* the end of Lesson 12: the ticket bought, the town's tasks done, the night train boarded */
  skip(){
    const l12 = Object.assign(freshL12(), { notes:L12_CHIARA_DIR.lines.map(l => ({ ...l })), routeOK:true, barrier:true, trainGone:true, missed:true, when:'tonight', kind:'andata',
      price:L12_PRICE.andata, noted:true, paid:true, given:20, ticket:true, townOpen:true, clock:23 * 60 + 15, dusk:true, late:true, validated:true, checked:true, boarded:true,
      stampAt:{ ticket:'14:45', train:'23:12' }, free:true });
    Object.assign(S, { lesson:12, vocab12:true, practiceDone12:true, vocabCheck12:true, tut:'l12-done', scene:'piazza', l5follow:false, brunoFollow:false, l12, daytime:'afternoon' });
    S.met.bigliettaio = S.known.bigliettaio = true;
    (PX[12] = freshPX()).i = LESSONS[11].exercises.length;
  },
  restore(){
    if (S.lesson < 12) return;
    if (!S.l12 || typeof S.l12 !== 'object') S.l12 = freshL12();
    const f = freshL12();
    Object.keys(f).forEach(k => { if (S.l12[k] === undefined) S.l12[k] = f[k]; });
    ['mistakes', 'stampAt'].forEach(k => { if (!S.l12[k] || typeof S.l12[k] !== 'object') S.l12[k] = f[k]; });
    ['doneA', 'doneN'].forEach(k => { if (!Array.isArray(S.l12[k])) S.l12[k] = []; });
    if (S.lesson !== 12) return;
    if (S.tut === 'l12-practice' && !vocabCheckDone(12)) S.tut = 'l12-vocab';
    /* saved during the dusk cutscene: it is night now */
    if (S.tut === 'l12-dusk'){ S.tut = 'l12-night'; S.daytime = 'night'; S.l12.dusk = true; if (S.l12.clock < 20 * 60) S.l12.clock = 20 * 60; }
    /* saved during the train's departure: it has gone */
    if (S.tut === 'l12-ticket' && !S.l12.trainGone && S.l12.barrier && S.cut && S.cut.id === 'l12-train'){ S.l12.trainGone = true; }
  },

  /* the clock: the header, and the tower on the museum square */
  /* (none in free play after the lesson: the next day, no clock to keep) */
  gameClock(){ return l12On() && !S.l12.free ? { h:Math.floor(S.l12.clock / 60) % 24, m:S.l12.clock % 60 } : null; },
  clock(){ return l12On() && !S.l12.free ? { h:Math.floor(S.l12.clock / 60) % 24, m:S.l12.clock % 60 } : null; },

  place(){
    if (!l12On()) return;
    const L = S.l12;
    /* arriving at the station after tracing the route */
    if (S.tut === 'l12-route' && S.scene === 'stazione' && L.routeOK){ setTut('l12-barrier'); if (L.clock < 14 * 60 + 30) L.clock = 14 * 60 + 30; save(); }
  },
  onVocab(){ if (['l12-barrier', 'l12-handbook', 'l12-vocab'].includes(S.tut) && S.l12 && S.l12.barrier) setTut('l12-practice'); },
  onPractice(){
    toast('New tiles: <b>In stazione</b>, and the numbers up to <b>24</b>. Back to the ticket office!');
    if (['l12-barrier', 'l12-handbook', 'l12-vocab', 'l12-practice'].includes(S.tut) && S.l12 && S.l12.barrier) setTut('l12-ticket');
  },
  placeTiles(){ return S.lesson >= 12 ? [L12_PLACE_TILE] : []; },
  mapRoute:{
    key:'l12', who:'Chiara', route:L12_ROUTE, dest:'stazione',
    notes:() => S.l12 && S.l12.notes,
    tracing:() => S.tut === 'l12-route', ok:() => !!(S.l12 && S.l12.routeOK), onOK(){ S.l12.routeOK = true; },
    notThere:"You're not there yet. The station is <b>in fondo</b>: at the very end.",
    wrong(i, node){
      const at = node.join(',');
      if (i === 1) return 'Chiara started with <b>Vai dritto fino alla banca</b>. Where is the bank on the map?';
      if (i === 2) return at === '2,2' ? '<b>Fino alla banca</b>: as far as the bank, and no further. Turn there.' : '<b>Alla banca gira a sinistra</b>: which way is <i>sinistra</i>?';
      if (i === 3) return at === '1,4' ? 'That was Paolo\'s way to the museum. Chiara said <b>vai sempre dritto</b>: keep going straight on.' : '<b>Vai sempre dritto</b>: keep going straight on, the same way.';
      if (i === 4) return at === '0,2' ? '<b>In fondo alla strada gira a sinistra</b>: left, not right.' : '<b>In fondo alla strada</b>: at the very end of the street, then turn.';
      return null;
    },
  },
  dests:{ stazione:() => S.lesson > 12 || !!(S.l12 && S.l12.routeOK) },

  /* the station: the board, the Venice train on binario 3 (by day until it leaves; the night train at night) */
  board(){ return l12On() ? l12Board() : null; },
  stazioneTrain(){
    if (!l12On() || STAZ_TRAIN.departing) return null;
    const L = S.l12;
    if (!L.trainGone) return { kind:'day' };
    if (daytime() === 'night') return { kind:'night' };
    return null;
  },
  door(d){ return l12Door(d); },

  /* conversations: Chiara (the brain gives her directions), the clerk and the conductor (station.js) */
  talk(npc){
    if (!l12On()) return false;
    if (npc.id === 'bigliettaio') return l12ClerkOpen(npc);
    if (npc.id === 'capotreno') return l12ConductorOpen(npc);
    return false;
  },
  bank(npc, groups){ return l12Bank(npc, groups); },
  phrases(){ return S.lesson >= 12 ? l12Phrases() : []; },
  react(id, n, st, add, out, ints, k){ return l12React(id, n, st, add, out, ints || [id], k); },
  hint(n, st){
    if (S.lesson === 12 && n.id === 'chiara' && ['l12-start', 'l12-route'].includes(S.tut)) return l12ChiaraHint(st);
    return l12StationHint(n, st);
  },
  afterTurn(n, out, res, words){
    if (!l12On()) return false;
    if (n.id === 'bigliettaio' || n.id === 'capotreno') return l12StationAfter(n, out, res, words);
    if (n.id !== 'chiara' || out.directions !== 'stazione') return false;
    if (S.tut === 'l12-start'){ S.l12.notes = L12_CHIARA_DIR.lines.map(l => ({ it:l.it, en:l.en })); setTut('l12-route'); }
    showHint("She told you the way! Didn't catch it? Ask her to repeat, or check a direction. Then thank her, and open the map (<kbd>M</kbd>).", 'Fatto!');
    return true;
  },
  onClose(closedId, closedDone){ return l12OnClose(closedId, closedDone); },

  /* the town (engine/quests.js) */
  /* the town: open from l12-explore on, and in free play once Lesson 12 is completed (l12-done: every quest not done is
     open at any time). A later lesson opts in with its own townOpen() / questFree() hooks (e.g. back in town): until then
     the quests are dormant, so a lesson under way never has its people taken over by a quest giver. */
  townOpen(){ return l12On() && S.l12.townOpen; },
  questFree(){ return S.lesson === 12 && lessonCompleted(12); },
  questGate(){ return l12On() && ['l12-late', 'l12-dusk'].includes(S.tut) ? { closed:S.tut === 'l12-late' ? 'chiuso · è tardi' : 'chiuso' } : null; },
  onQuestDone(q){ l12QuestDone(q); },
  mapSpots(){
    if (!l12On() || S.tut !== 'l12-late' || S.l12.boarded) return [];
    return [{ id:'l12:treno', lesson:true, x:80, y:444, label:'Il treno delle 23:15', go:{ scene:'stazione', spawn:{ x:480, y:560 }, title:'Stazione', sub:'Il treno delle 23:15 · binario 3' } }];
  },
  taskList(){
    if (!l12On() || !S.l12.townOpen) return [];
    const L = S.l12, rows = [];
    if (['l12-explore'].includes(S.tut)) rows.push({ icon:'☀', title:`This afternoon · ${l12Count('afternoon')}/${l12Need('afternoon')}`, sub:'Then the evening: the restaurants open.' });
    if (['l12-night'].includes(S.tut) && l12Need('night')) rows.push({ icon:'☾', title:`Tonight · ${l12Count('night')}/${l12Need('night')}`, sub:'Your train: 23:15.' });
    rows.push({ icon:'🚆', title:'Il treno delle 23:15', sub:L.boarded ? 'On board!' : S.tut === 'l12-late' ? 'Now! Binario 3 · validate first' : 'Venezia S. Lucia · binario 3', done:L.boarded });
    return rows;
  },
  stamps(){
    if (!S.l12) return [];
    const out = [];
    if (S.l12.ticket) out.push({ id:'l12-biglietto', title_it:'Biglietto · Venezia', title_en:'A ticket to Venice', icon:'🎫', color:'#1f3f7a', when:`${S.l12.stampAt.ticket || '14:45'} · pomeriggio` });
    if (S.l12.boarded) out.push({ id:'l12-treno', title_it:'Il treno delle 23:15', title_en:'The night train', icon:'🚆', color:'#7a3a6e', when:`${S.l12.stampAt.train || '23:12'} · sera` });
    return out;
  },
  cutsceneResume(c){
    if (!l12On()) return false;
    if (c.id === 'l12-train'){ S.l12.trainGone = true; player.x = 107; player.y = 446; save(); return true; }
    if (c.id === 'l12-dusk'){ S.daytime = 'night'; S.l12.dusk = true; if (S.tut === 'l12-dusk') S.tut = 'l12-night'; save(); return true; }
    if (c.id === 'l12-explore' || c.id === 'l12-board') return true;
    return false;
  },
  dbgLesson(n){
    if (n !== 12 || !S.l12) return null;
    return { need:{ afternoon:l12Need('afternoon'), night:l12Need('night') }, count:{ afternoon:l12Count('afternoon'), night:l12Count('night') }, time:l12HHMM(S.l12.clock),
      convo:convo && convo.npc && ['bigliettaio', 'capotreno'].includes(convo.npc.id) && convo.st.l12 ? { ...convo.st.l12 } : null };
  },
};

/* ---------- the tasks: counting, the clock, the dusk, 23:00 ---------- */
function l12QuestDone(q){
  if (!l12On() || !S.l12.townOpen || S.l12.late) return;
  const L = S.l12, night = daytime() === 'night';
  if (night){
    if (!L.doneN.includes(q.id)) L.doneN.push(q.id);
    const need = Math.max(1, l12Need('night')), k = L.doneN.length;
    L.clock = Math.max(L.clock, 20 * 60 + Math.round(180 * Math.min(k, need) / need / 5) * 5);
  } else {
    if (!L.doneA.includes(q.id)) L.doneA.push(q.id);
    const need = Math.max(1, l12Need('afternoon')), k = L.doneA.length;
    L.clock = Math.max(L.clock, 15 * 60 + Math.round(270 * Math.min(k, need) / need / 5) * 5);
  }
  save(); renderHUD();
}
/* every 300 ms: the dusk and 23:00 wait until nothing else is open */
function l12Tick(){
  if (!l12On() || introOpen) return;
  const L = S.l12, free = !dialogOpen && !modalOpen && !traveling && !cutsceneOn() && !pickOpen;
  if (!free) return;
  if (S.tut === 'l12-explore' && l12Count('afternoon') >= l12Need('afternoon') && !L.dusk) l12Dusk();
  else if (S.tut === 'l12-night' && l12Count('night') >= l12Need('night') && !L.late) l12Late();
}
setInterval(l12Tick, 300);

/* the town opens: the ticket is in the bag; the map with its "!" spots */
function l12Explore(){
  const L = S.l12;
  L.townOpen = true; L.clock = 15 * 60; setTut('l12-explore'); save();
  cutscene([
    { guide:'The ticket is in your bag. Your train leaves at <b>23:15</b>: the whole afternoon and evening in town!' },
    { wait:1600 },
    { run:() => openMap() },
    { guide:null, until:'modalClosed' },
    { run:() => toast('Your phone has new tabs: <b>Compiti</b> (the task list), <b>Borsa</b> (your bag) and <b>Passaporto</b> (a stamp for every task).') },
  ], { id:'l12-explore', timeout:60000 });
}
/* the dusk: later, in the piazza, the bells; the light goes gold, then dark; Giulia calls out */
function l12Dusk(){
  const L = S.l12;
  L.dusk = true; L.clock = 19 * 60 + 30; setTut('l12-dusk'); save();
  travelTo('piazza', { x:470, y:500 }, 'Più tardi…', 'Piazza Centrale · 19:30');
  setTimeout(() => {
    if (S.tut !== 'l12-dusk') return;
    player.face = { x:0, y:-1 };
    cutscene([
      { guide:'Half past seven. The bells ring out over the rooftops…' },
      { run:() => ringBells(3, { gap:1100 }) },
      { guide:'The sun goes down behind the roofs.' },
      { run:() => duskFade(4600) },
      { run:() => { l12SetClock(20 * 60); } },
      { face:'giulia', to:'player' },
      { say:'I ristoranti sono aperti per la cena!', who:'giulia', ms:3200 },
      { guide:'<i>“The restaurants are open for dinner!”</i> Evening in town: new things to do.' },
      { wait:1800 },
    ], { id:'l12-dusk', onSkip:() => { S.daytime = 'night'; } }).then(() => {
      S.daytime = 'night'; L.clock = Math.max(L.clock, 20 * 60);
      setTut('l12-night');
      toast('Night! Bar Centrale has closed; the night tasks are on your map (<kbd>M</kbd>).');
    });
  }, RM ? 400 : 1700);
}
/* 23:00: the bells toll eleven; back to the station */
function l12Late(){
  const L = S.l12;
  L.late = true; L.clock = 23 * 60; setTut('l12-late'); save();
  cutscene([
    { guide:'The bells… one, two, three…' },
    { run:() => ringBells(11, { gap:520 }) },
    { say:'Le ventitré!', who:'player', ms:1800 },
    { guide:"Eleven o'clock! Your train leaves at <b>23:15</b>. Back to the station: the <b>!</b> on your map." },
    { wait:1400 },
  ], { id:'l12-late' }).then(() => toast("It's <b>23:00</b>. The train to Venice leaves at <b>23:15</b>, binario 3. To the station: the <b>!</b> on your map (<kbd>M</kbd>)."));
}

/* ---------- closing a conversation: the tutorial moves on ---------- */
function l12OnClose(closedId){
  if (!l12On()) return false;
  const L = S.l12;
  if (closedId === 'bigliettaio' && S.tut === 'l12-ticket' && L.ticket && !L.townOpen){ setTimeout(l12Explore, 500); return true; }
  if (closedId === 'bigliettaio' && L.trainCut){ L.trainCut = false; setTimeout(l12TrainGo, 300); return true; }
  return false;
}

/* ---------- completion ---------- */
function l12TicketHTML(){
  const L = S.l12, kind = L.kind === 'ar' ? 'Andata e ritorno' : 'Andata';
  return `<div class="l12-ticket"><div class="tk-main"><div class="tk-k">Trenitalia · Biglietto</div><div class="tk-t">Padova → Venezia S. Lucia</div>
      <div>Stasera · <b>23:15</b> · binario <b>3</b> · carrozza 5</div>${L.validated ? '<span class="tk-stamp">CONVALIDATO · 23:04</span>' : ''}</div>
    <div class="tk-side"><div><b>€ ${L.price || L12_PRICE.andata}</b><div style="font-size:12px;opacity:.85">${kind}</div></div></div></div>`;
}
function openComplete12(){
  openModal('');
  const L = S.l12, done = QUESTS.filter(q => (questPeek(q.id) || {}).done);
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione 12 completata!</em></h2><p class="sub">Un giorno in città · Trains, tickets and times</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>Chiara sent you to the station, the Venice train pulled out under your nose (<b>è appena partito!</b>), and you bought a ticket for the
        night train: <b>un biglietto per stasera</b>. Then a whole day in town: ${done.length ? done.map(q => `<i>${esc(q.title_it)}</i>`).join(', ') : 'a walk'}, the bells at dusk, the
        evening… and at eleven, back to the station: the board, the green machine, the conductor. <b>Buon viaggio!</b></p>
      <h3>Your passport</h3>${passportHTML({ big:true, slots:6 })}
      <h3>Your ticket</h3>${l12TicketHTML()}
      <h3>Your numbers</h3>
      <div class="stats">
        <div><b>${done.length}</b><span>${done.length === 1 ? 'task' : 'tasks'} done in town (${L.doneA.length} in the afternoon, ${L.doneN.length} at night)</span></div>
        <div><b>${vocabCount()}</b><span>words and phrases in your dictionary</span></div>
        <div><b>${S.sentences}</b><span>sentences said in Italian</span></div>
      </div>
      <div class="next"><p class="kicker">Next</p><p>The night train to Venice: a dining car full of strangers, and a little dog…</p></div>
      <div class="cta"><button class="btn${hookFor(13) && hookFor(13).start ? '' : ' primary'}" id="l12Keep">Keep exploring</button>${hookFor(13) && hookFor(13).start ? '<button class="btn primary" id="goL13">Start Lezione 13</button>' : ''}</div>
    </div>`;
  $('#l12Keep').onclick = () => { closeModal(); l12FreePlay(); };
  if (hookFor(13) && hookFor(13).start) $('#goL13').onclick = () => hookFor(13).start();
}
/* after the lesson: free play, the next afternoon; the tasks not done are open at any time */
function l12FreePlay(){
  S.daytime = 'afternoon'; if (S.l12) S.l12.free = true; save();
  travelTo('piazza', { x:480, y:520 }, 'Free play', 'The tasks you didn\'t do are still on your map');
}
/* tests: __debug.l12Explore() puts Lesson 12 at the start of the town (the ticket bought and in the bag, 15:00, l12-explore) */
Object.assign(window.__debug, { l12Need:w => l12Need(w), l12Clock(m){ l12SetClock(m); },
  l12Explore(){
    if (S.lesson !== 12) LESSON_HOOKS[12].start();
    Object.assign(S.l12, { notes:L12_CHIARA_DIR.lines.map(l => ({ ...l })), routeOK:true, barrier:true, trainGone:true, missed:true, when:'tonight', kind:'andata', price:12, noted:true, paid:true, given:12, ticket:true, townOpen:true, clock:15 * 60 });
    S.l12.stampAt.ticket = '14:45';
    Object.assign(S, { vocab12:true, practiceDone12:true, vocabCheck12:true, daytime:'afternoon' });
    bagAdd({ ...L12_TICKET_ITEM, note:'Andata' });
    setTut('l12-explore');
  } });
