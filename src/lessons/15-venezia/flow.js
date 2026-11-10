/* Lesson 15 · Venezia. The flow (docs/lessons/15-venezia.md, the loop): the hook, the states, who is where, the doors, the beats in
   the world (the bench, il signor Bepi coming along, the boat coming in, the ticket readers, the voyage). The conversations are
   convos.js; the unit-completion screen, free play and replays are unit.js; the scenes world/venezia.js and render/venezia.js.

   The tutorial states (S.tut):
     l15-start       Venezia Santa Lucia, binario 3, the morning: Margaret (English) asks to tag along; she follows (with Biscuit)
     l15-ask         the information desk: the greeting, your name; Margaret: "ask about the boat"; the half-English tile
                     "Dov'è… the boat… per San Marco?" → "La barca? Ah, il vaporetto!…" → the handbook
     l15-handbook → l15-vocab → l15-practice   chapter 15, its word check, its practice (12 items across the unit)
     l15-directions  the desk again: "Scusi, dov'è la fermata del vaporetto per San Marco?" → the way; Margaret: "Which way?" (a pick)
     l15-ticket      outside: the travellers with suitcases (Permesso!), the ACTV booth: two tickets (the price on the notepad), the
                     next boat (the time on the notepad), the dog (Margaret: "What did he say?", a pick)
     l15-breakfast   the station bar: which cornetti (Margaret: "What kinds?", a pick; she chooses), the order for both, the price
     l15-bepi        the bench by the water: il signor Bepi stops for Biscuit (a long conversation: introductions, the train, Padova from
                     your stamps, Venice or Padova, Margaret's news, "Lei parla bene l'italiano!", the horn)
     l15-board       the tour group at the gate (Permesso!), the two tickets on the readers, then the voyage (a cutscene: boarding,
                     the Grand Canal, the Rialto, San Marco); l15-arrival while the boat goes; then the unit-completion screen
     l15-done        free play in Padova (unit.js), or a replay
   Saved: S.l15 = { flow, clock, met, follow, prompted, barrier, dirOK, tickets, paid, timeNoted, dogOK, mgPick, kindsOK, ordered,
     order:{ me, lei, total }, bar (the two orders being taken: convos.js l15Bar), barPaid, barDone, bepiCome, bepi:{ stage, … }, bepiDone, bepiGone, boatIn, validated (0–2), carried,
     arrived, done, free, unitSeen, mg:{ key:true }, said:[sentences] }. Tests: __dbg().l15 (+ the open conversation). */
const L15_ORDER = ['l15-start', 'l15-ask', 'l15-handbook', 'l15-vocab', 'l15-practice', 'l15-directions', 'l15-ticket', 'l15-breakfast', 'l15-bepi', 'l15-board', 'l15-arrival', 'l15-done'];
const L15_CROWD = ['valigia1', 'valigia2', 'valigia3', 'valigia4', 'guidaven', 'gita1', 'gita2', 'gita3'];
const L15_FILLINGS = ['crema', 'marmellata', 'cioccolato', 'vuoto'];
const freshL15 = () => ({ flow:1, clock:8 * 60 + 40, met:false, follow:false, prompted:false, barrier:false, dirOK:false, tickets:false, paid:false, timeNoted:false, dogOK:false,
  mgPick:L15_FILLINGS[Math.floor(Math.random() * 3)], kindsOK:false, ordered:false, order:null, bar:null, barPaid:false, barDone:false,
  bepiCome:false, bepi:{ stage:'pet' }, bepiDone:false, bepiGone:false, boatIn:false, validated:0, carried:false, arrived:false, done:false, free:false, unitSeen:false, mg:{}, said:[] });
const l15On = () => S.lesson === 15 && !!S.l15 && S.l15.flow === 1;
const l15Live = () => l15On() && !S.l15.free;                         // in Venice, the lesson going on (not free play)
const l15At = t => L15_ORDER.indexOf(S.tut) >= L15_ORDER.indexOf(t);
const l15HHMM = m => `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, '0')}`;
function l15Clock(m){ if (!l15On()) return; S.l15.clock = Math.max(S.l15.clock, m); save(); renderHUD(); }
const L15C = { say:[], busy:null };                                   // Margaret's bubbles waiting; a beat running
/* Margaret, in the world: a bubble over her once nothing is open */
function l15MgSay(t, ms = 3200){ L15C.say.push({ t, ms }); }
function l15MgOnce(key, t){ const L = S.l15; if (L.mg[key]) return false; L.mg[key] = true; save(); l15MgSay(t); return true; }

/* the parser's punctuation for our tokens (content.js: q, cl, ex), and "per me, e per lei" */
L15_BANK.forEach(t => { const w = l15W(t); if (!w) return; if (t.q){ QWORDS.add(w); } if (t.cl) CLAUSE.add(w); if (t.ex) EXCL.add(w); });
QWORDS.add('@15:boat'); COMMA_BEFORE.add(l15W(L15_TILES.bar[1]) + ' e');

LESSON_HOOKS[15] = {
  n:15,
  vocab:L15_BANK, bankTiles:L15_BANK,
  vocabNote:'The tiles of Venice: the vaporetto, the tickets, the bar, il signor Bepi.',
  doneTut:'l15-done',
  bookPulse:['l15-handbook', 'l15-vocab', 'l15-practice'],
  objective:{
    'l15-start':'Talk to Margaret',
    'l15-ask':'Ask how to get to San Marco',
    'l15-handbook':'Open your handbook',
    'l15-vocab':'Learn the Lesson 15 words',
    'l15-practice':'Finish the Lesson 15 practice',
    'l15-directions':'Ask the way to the vaporetto',
    'l15-ticket':() => !S.l15 ? '' : `Buy the tickets · ${[S.l15.paid, S.l15.timeNoted, S.l15.dogOK].filter(Boolean).length}/3`,
    'l15-breakfast':'Breakfast for two',
    'l15-bepi':() => S.l15 && S.l15.bepiCome ? 'Talk to il signor Bepi' : 'Wait for the vaporetto',
    'l15-board':'Board the vaporetto',
    'l15-arrival':'Down the Grand Canal',
    'l15-done':() => S.l15 && S.l15.free ? 'Free play · Padova' : 'Unit 1 completata',
  },
  guide:{
    'l15-start':near => near === NPC.margaret ? 'Press <kbd>E</kbd> to talk to Margaret.' : 'Venezia Santa Lucia, the end of the line. Margaret is on the platform with Biscuit.',
    'l15-ask':near => {
      if (near === NPC.infopoint) return 'Press <kbd>E</kbd>. He is a stranger: polite. Greet him, say who you are, and ask how to get to San Marco.';
      return S.scene === 'santalucia' ? 'Down the platform into the station hall: the <b>information desk</b> (<i>Informazioni</i>, on the left) will know how to get to San Marco.' : 'Back into the station: the information desk.';
    },
    'l15-handbook':() => {
      if (modalOpen && sheet.classList.contains('book') && hbLesson === 15) setTut(vocabCheckDone(15) ? 'l15-practice' : 'l15-vocab');
      return 'A <i>vaporetto</i>? Open the handbook (<kbd>H</kbd>): <b>Lezione 15 · Venezia</b>.';
    },
    'l15-vocab':'Read Lezione 15 (the vaporetto, and the whole unit in one page). Then learn its words: the <b>Words</b> tab, the flashcards and the quiz. The <b>Practice</b> opens after that.',
    'l15-practice':'Words learned! Now finish the <b>Practice</b> tab of Lezione 15: twelve questions from the whole unit.',
    'l15-directions':near => near === NPC.infopoint ? 'Press <kbd>E</kbd>. Ask him where the vaporetto stop is, for San Marco.' : 'Back to the <b>information desk</b>: ask properly this time, where the vaporetto stop is.',
    'l15-ticket':near => {
      const L = S.l15; if (!L) return '';
      if (S.scene === 'santalucia') return 'Out of the station (the glass doors at the bottom), down the steps, then right.';
      if (near === NPC.actv) return 'Press <kbd>E</kbd>. Two tickets to San Marco, the time of the next boat, and Biscuit: does he pay?';
      if (L15_CROWD.slice(0, 4).some(id => !crowdMoved(NPC[id]))) return 'The Grand Canal! The ticket booth (<i>ACTV · Biglietti</i>) is on the right, but travellers with suitcases are in the way. (Lezione 10: how do you get past?)';
      return 'The <b>ACTV</b> booth, on the right: two tickets, the next boat, and Biscuit.';
    },
    'l15-breakfast':near => near === NPC.baristaSL ? 'Press <kbd>E</kbd>. Breakfast for both of you: what Margaret wants, and something for you.'
      : S.scene === 'ferrovia' ? 'Twenty minutes to wait. Back up the steps into the station: the <b>bar</b> is in the hall, on the right.' : 'The <b>bar</b>, on the right of the hall.',
    'l15-bepi':near => {
      const L = S.l15; if (!L) return '';
      if (L.bepiCome) return near === NPC.bepi ? 'Press <kbd>E</kbd> to talk to il signor Bepi. Polite: <i>Lei</i>.' : 'Il signor Bepi stopped for Biscuit. Talk to him.';
      return S.scene === 'ferrovia' ? 'The boat leaves at 9:10. Sit on the <b>bench</b> by the water (<kbd>E</kbd>) and wait.' : 'Back out to the vaporetto stop: the boat leaves at 9:10.';
    },
    'l15-board':() => {
      const L = S.l15; if (!L) return '';
      if (L.validated >= 2) return '';
      if (['guidaven', 'gita1', 'gita2', 'gita3'].some(id => !crowdMoved(NPC[id]))) return 'The vaporetto is in! A tour group is standing at the gate. Get past them, politely.';
      return `The ticket readers at the gate: tap your tickets on a reader (<kbd>E</kbd>). ${L.validated ? 'One done: now Margaret\'s.' : 'Two tickets: yours and Margaret\'s.'}`;
    },
    'l15-arrival':'',
    'l15-done':() => S.l15 && S.l15.free
      ? 'Unit 1 completata! Free play in Padova: the quests you haven\'t done are open (the phone\'s <b>Compiti</b>), Studio (<kbd>T</kbd>), fast travel on the map (<kbd>M</kbd>). <button class="gbtn" data-l15unit>Unit 1 · Riepilogo</button>'
      : 'Unit 1 completata! <button class="gbtn" data-l15unit>Unit 1 · Riepilogo</button>',
  },
  markers:{
    'l15-start':'margaret', 'l15-ask':'infopoint', 'l15-directions':'infopoint', get 'l15-ticket'(){ return 'actv'; }, 'l15-breakfast':'baristaSL',
    get 'l15-bepi'(){ return S.l15 && S.l15.bepiCome ? 'bepi' : null; },
  },

  start(){
    if (modalOpen) closeModal();
    if (cutsceneOn()) cutsceneEnd();
    if (dialogOpen) closeDialog();
    delete S.replayDone;
    S.lesson = 15; S.l5follow = false; S.brunoFollow = false; S.l15 = freshL15(); S.daytime = 'morning';
    if (S.l12) S.l12.free = true;
    crowdReset(L15_CROWD); L15_CROWD.forEach(id => { const n = NPC[id]; n.x = n.home.x; n.y = n.home.y; n.walkPath = null; });
    Object.assign(VEN, { gate:false, boat:'away', boatX:0, beep:[0, 0] });
    Object.assign(NPC.margaret, { carryDog:false, seated:false }); dogFollow('biscuit', 'margaret');
    L15C.say = []; L15C.busy = null;
    setTut('l15-start'); lastGuide = '';
    travelTo('santalucia', { x:470, y:96 }, 'Venezia Santa Lucia', 'Il mattino · binario 3', { face:{ x:1, y:0 } });
    setTimeout(() => toast('<b>Lezione 15 · Venezia</b> has started'), 1800);
  },
  /* the end of Lesson 15 (and of Unit 1): free play in Padova, in the afternoon */
  skip(){
    const l15 = Object.assign(freshL15(), { met:true, prompted:true, barrier:true, dirOK:true, tickets:true, paid:true, timeNoted:true, dogOK:true, kindsOK:true, ordered:true,
      barPaid:true, barDone:true, bepiCome:true, bepiDone:true, bepiGone:true, boatIn:true, validated:2, carried:true, arrived:true, done:true, free:true, unitSeen:true, clock:9 * 60 + 40 });
    Object.assign(S, { lesson:15, vocab15:true, practiceDone15:true, vocabCheck15:true, tut:'l15-done', scene:'piazza', l5follow:false, brunoFollow:false, l15, daytime:'afternoon' });
    ['margaret', 'infopoint', 'actv', 'baristaSL', 'bepi'].forEach(id => { S.met[id] = S.known[id] = true; });
    (PX[15] = freshPX()).i = LESSONS[14].exercises.length;
  },
  restore(){
    if (S.lesson < 15) return;
    if (!S.l15 || typeof S.l15 !== 'object') S.l15 = freshL15();
    const f = freshL15();
    Object.keys(f).forEach(k => { if (S.l15[k] === undefined) S.l15[k] = f[k]; });
    ['mg', 'bepi'].forEach(k => { if (!S.l15[k] || typeof S.l15[k] !== 'object') S.l15[k] = f[k]; });
    if (!Array.isArray(S.l15.said)) S.l15.said = [];
    S.l15.flow = 1;
    if (S.lesson !== 15) return;
    const L = S.l15;
    if (S.tut === 'l15-practice' && !vocabCheckDone(15)) S.tut = 'l15-vocab';
    /* saved during the voyage (or on the boat): the unit is over */
    if (S.scene === 'vaporetto' || S.tut === 'l15-arrival' || (S.tut === 'l15-board' && L.validated >= 2)){ l15Arrived(); S.tut = 'l15-done'; }
    if (S.tut === 'l15-done'){ l15ToFreeState(); if (!L.unitSeen) setTimeout(() => { if (!introOpen) openUnitComplete(); else unitAfterIntro = true; }, 900); return; }
    if (L.follow) dogFollow('biscuit', 'margaret');
    VEN.boat = L.boatIn ? 'docked' : 'away'; VEN.boatX = 0; VEN.gate = L.validated >= 2;
    NPC.margaret.carryDog = !!L.carried;
    /* the bench beat cut short: Bepi is there, waiting (E talks to him) */
    if (S.tut === 'l15-bepi' && L.bepiCome) l15PutBepi();
  },

  /* the header clock: 8:40 on the platform → 9:10 the boat → 9:40 San Marco */
  gameClock(){ return l15Live() && !S.l15.done ? { h:Math.floor(S.l15.clock / 60) % 24, m:S.l15.clock % 60 } : null; },
  stamps(){ return S.l15 && S.l15.arrived ? [{ id:'l15-venezia', title_it:'Benvenuti a Venezia!', title_en:'Welcome to Venice', icon:'🚤', color:'#1f4e8a', when:'09:40 · mattina' }] : []; },
  follower(){ return l15Live() && S.l15.follow ? NPC.margaret : null; },
  fastTravel(){ return l15Live() ? "You are in Venice: no fast travel here (the map is of Padova)." : undefined; },
  /* free play after the unit: the town's quests open again, at any time (unit.js) */
  townOpen(){ return l15On() && S.l15.free ? true : undefined; },
  questFree(){ return l15On() && S.l15.free ? true : undefined; },

  /* who is where */
  sceneOf(n){
    if (!l15Live()) return null;
    const L = S.l15, id = n.id;
    if (id === 'margaret') return L.follow ? S.scene : 'santalucia';
    if (id === 'biscuit') return L.carried ? 'away' : L.follow ? S.scene : 'santalucia';
    if (id === 'bepi') return L.bepiCome && !L.bepiGone ? 'ferrovia' : 'away';
    if (['guidaven', 'gita1', 'gita2', 'gita3'].includes(id)) return L.barDone ? 'ferrovia' : 'away';
    if (id === 'marinaio') return L.boatIn ? 'ferrovia' : 'away';
    return null;
  },
  place(){ if (l15Live()) l15Place(); },
  door(d){ return l15Door(d); },
  crowdHint(n, choice){
    if (!l15Live() || !L15_CROWD.includes(n.id)) return undefined;
    return choice === 'scusi' ? '<i>Scusi</i> gets their attention. To get past people, Bruno taught you the word in Lezione 10.' : choice === 'prego' ? '<i>Prego</i> is what <i>they</i> say back.' : undefined;
  },
  onCrowdMoved(n){ if (l15Live() && n.id === 'valigia1') l15MgOnce('crowd', 'Well done, dear. Permesso: I must remember that one.'); },

  talk(npc){ return l15Talk(npc); },
  bank(npc, groups, names){ return l15Bank(npc, groups, names); },
  phrases(){ return l15On() ? l15Phrases() : []; },
  react(id, n, st, add, out, ints, k){ return l15React(id, n, st, add, out, ints, k); },
  afterTurn(n, out){ return l15After(n, out); },
  hint(n, st){ return l15Hint(n, st); },
  onClose(closedId, closedDone, wasCut){ return l15OnClose(closedId, closedDone, wasCut); },

  onVocab(){ if (l15On() && ['l15-ask', 'l15-handbook', 'l15-vocab'].includes(S.tut) && S.l15.barrier) setTut('l15-practice'); },
  onPractice(){
    if (!l15On() || !S.l15.barrier || !['l15-ask', 'l15-handbook', 'l15-vocab', 'l15-practice'].includes(S.tut)) return;
    l15ToDirections();
  },
  cutsceneResume(c){
    if (!l15On()) return false;
    const L = S.l15;
    if (c.id === 'l15-bench'){ if (!L.bepiCome){ L.bepiCome = true; save(); } l15PutBepi(); return true; }
    if (c.id === 'l15-voyage'){ l15Arrived(); S.tut = 'l15-done'; l15ToFreeState(); save(); setTimeout(openUnitComplete, 600); return true; }
    return /^l15-/.test(c.id);
  },
  dbgLesson(n){
    if (n !== 15 || !S.l15) return null;
    const C = convo && convo.l15 ? convo.l15 : null, M = NPC.margaret;
    return { time:l15HHMM(S.l15.clock), busy:L15C.busy, following:followerNpc() === M, margaret:{ scene:sceneOf(M), at:[Math.round(M.x), Math.round(M.y)], carry:!!M.carryDog, moving:!!M.moving },
      biscuit:{ scene:sceneOf(NPC.biscuit), at:[Math.round(NPC.biscuit.x), Math.round(NPC.biscuit.y)], moving:!!NPC.biscuit.moving },
      convo:C ? { kind:C.kind, stage:C.kind === 'bepi' ? S.l15.bepi.stage : null, npc:convo.npc.id } : null, timePad:l15TimePadDbg(), tickets:bagHas('l15-biglietti'),
      day:{ yes:l15DayInfo(S.l15.bepi.qYes), no:l15DayInfo(S.l15.bepi.qNo), done:l13DoneQuests(), free:l13Free(), items:l13DayItems().map(d => d.key) } };
  },
};
/* for tests: what Bepi asked about (the thing's tile and a participle that fits it) */
function l15DayInfo(key){ if (!key) return null; if (key === 'chapel') return { key, q:l15DayQ(key).it }; const d = l13AnyItem(key); return d ? { key, label:d.label, pp:d.pp[0], quest:d.quest, q:l15DayQ(key).it } : { key }; }
function l15ToDirections(){
  setTut('l15-directions'); l15Clock(8 * 60 + 45); save(); renderHUD();
  toast('New tiles: <b>Dov\'è</b>, <b>la fermata</b>, <b>del vaporetto</b>, <b>per San Marco</b>… Back to the information desk!');
}

/* ---------- places ---------- */
const L15S = {
  margaret:{ x:530, y:70, face:{ x:-1, y:0.4 } },
  bepi:{ x:548, y:336, face:{ x:-0.7, y:0.7 } },             // beside the bench: in reach from the seat (498, 346)
  marinaio:{ x:780, y:436, face:{ x:0, y:-1 } },             // at the gangway's foot, between the readers (in reach from the gate)
  seat:{ x:498, y:346 }, mgSeat:{ x:456, y:338 },
};
function l15Put(id, spot){
  const n = NPC[id]; if (!n || n.cutWalk || !spot || isFollower(n)) return;
  n.x = spot.x; n.y = spot.y; if (spot.face){ n.baseFace = { ...spot.face }; if (!dialogOpen || !convo || convo.npc !== n) n.face = { ...spot.face }; }
}
function l15PutBepi(){ l15Put('bepi', L15S.bepi); }
function l15Place(){
  const L = S.l15;
  if (L15C.busy === 'beat') return;
  if (!L.follow) l15Put('margaret', L15S.margaret);
  if (L.bepiCome && !L.bepiGone) l15PutBepi();
  if (L.boatIn && L15C.busy !== 'voyage') l15Put('marinaio', L15S.marinaio);
  if (L.boatIn && VEN.boat === 'away'){ VEN.boat = 'docked'; VEN.boatX = 0; }
  if (S.scene === 'santalucia' && !L.follow && !NPC.biscuit.follows) dogFollow('biscuit', 'margaret');
}

/* ---------- doors ---------- */
function l15Door(d){
  if (!l15Live()) return false;
  const L = S.l15;
  if (d.id === 'sl-out'){
    if (!L.follow){ toast('Margaret is still on the platform. Talk to her first.'); return true; }
    if (!L.dirOK){ toast(`Margaret: <i>“Shouldn't we ask the way first, dear? There's an information desk.”</i>`); return true; }
    travelTo('ferrovia', { x:480, y:146 }, 'Ferrovia', 'Il Canal Grande', { face:{ x:0, y:1 } });
    return true;
  }
  if (d.id === 'fer-in'){ travelTo('santalucia', { x:480, y:548 }, 'Venezia Santa Lucia', 'La stazione', { face:{ x:0, y:-1 } }); return true; }
  if (d.id === 'fer-cartello'){ toast('<b>ACTV · Biglietti.</b> <i>Biglietto 75 minuti: € 9,50</i>: one ticket, good for 75 minutes on the boats.'); return true; }
  if (d.id === 'fer-panchina'){
    if (S.tut === 'l15-bepi' && !L.bepiCome){ l15BenchBeat(); return true; }
    toast(S.tut === 'l15-ticket' ? 'A bench by the water. No time to sit: the tickets first!' : 'A bench by the Grand Canal. Boats go by: a gondola, a water taxi…');
    return true;
  }
  if (d.id === 'lettore1' || d.id === 'lettore2'){ l15Reader(d.id === 'lettore1' ? 0 : 1); return true; }
  return false;
}

/* ---------- the bench: il signor Bepi comes along the fondamenta ---------- */
function l15BenchBeat(){
  const L = S.l15, B = NPC.bepi;
  L15C.busy = 'beat';
  L.bepiCome = true; save();
  B.x = 30; B.y = 300; B.face = { x:1, y:0 }; renderHUD();
  cutscene([
    { walk:'player', to:L15S.seat, speed:110 },
    { face:'player', to:{ x:498, y:420 } },
    { walk:'margaret', to:L15S.mgSeat, speed:90 },
    { face:'margaret', to:{ x:470, y:420 } },
    { guide:'You sit by the water. A gondola glides past… and an old gentleman with a shopping bag comes along the fondamenta.' },
    { wait:900 },
    { walk:'bepi', path:[[300, 312], [L15S.bepi.x, L15S.bepi.y]], speed:70 },
    { face:'bepi', to:'biscuit' },
    { say:L15_LINES.bepi.arrive.it, who:'bepi' },
  ], { id:'l15-bench', guide:'' }).then(() => {
    L15C.busy = null; B.cutWalk = false; l15PutBepi(); renderHUD(); l15Clock(9 * 60 + 3);
    setTimeout(() => { if (!dialogOpen && l15Live()) openConvo(B); }, 300);
  });
}
/* after the goodbye: Bepi goes on his way (west, over the bridge); the deckhand calls; Margaret */
function l15BepiLeave(){
  const L = S.l15, B = NPC.bepi;
  worldSay(B, 'Ciao, Biscuit!', { ms:1600 }); setTimeout(() => toast('<i>“Ciao, Biscuit!”</i> · Bye, Biscuit!'), 300);
  venWalk(B, [[400, 300], [120, 290], [-40, 290]], 70).then(() => { L.bepiGone = true; save(); renderHUD(); });
  l15MgSay(L15_MARGARET.bepiAfter);
  l15MgSay(L15_MARGARET.board);
}

/* ---------- the ticket readers, then the voyage ---------- */
function l15Reader(i){
  const L = S.l15;
  if (S.tut !== 'l15-board'){ toast(L.tickets ? 'The ticket readers. Not yet: the boat isn\'t in.' : 'A ticket reader (<i>convalidatrice</i>). You need a ticket first: the ACTV booth.'); return; }
  if (!bagHas('l15-biglietti')){ toast('Your tickets…? They are in your bag (<b>Borsa</b>).'); return; }
  if (L.validated >= 2) return;
  L.validated++; save(); venBeep(i);
  worldSay('player', 'Bip!', { ms:900, silent:true });
  toast(`<b>✓ Convalidato!</b> ${L.validated === 1 ? 'Your ticket. Now Margaret\'s.' : 'Margaret\'s ticket too. The gate opens.'}`);
  if (L.validated >= 2){
    VEN.gate = true; bagRemove('l15-biglietti'); save(); renderHUD();
    setTimeout(l15Voyage, 900);
  }
}
/* the voyage: through the gate onto the boat (the eye-level view of the pontoon), down the Grand Canal, under the Rialto, out into the
   basin and San Marco; Margaret's thanks; the unit-completion screen. One cutscene (lines wait for the reader; Esc skips). */
function l15Voyage(){
  const L = S.l15, M = NPC.margaret, gx = VFER.gangway.x + VFER.gangway.w / 2;
  if (L15C.busy) return;
  L15C.busy = 'voyage';
  const line = (who, it, en) => ({ guide:`<b>${esc(who)}:</b> <i>“${esc(it)}”</i>${en ? ` · ${esc(en)}` : ''}` });
  const say = (it, pitch) => ({ run:() => speak(it, pitch || 1, false, 0.9) });
  const mg = t => ({ guide:`<b>Margaret:</b> “${esc(t)}”` });
  const travel = (sc, title, sub) => ({ run:() => new Promise(res => { travelTo(sc, sc === 'vaporetto' ? { x:-400, y:-400 } : null, title, sub); const w = () => traveling ? setTimeout(w, 120) : res(); setTimeout(w, 200); }) });
  cutscene([
    { run:() => { L.carried = true; M.carryDog = true; save(); renderHUD(); } },
    { say:'Up you come, Biscuit!', who:'margaret', silent:true, ms:1400 },
    { walk:'marinaio', to:{ x:836, y:458 }, speed:110 },
    { walk:'player', path:[[gx, 372], [gx, 420]], speed:90 },
    travel('vaporetto', 'Linea 2', 'Ferrovia → San Marco'),
    { run:() => { VEN.view = { kind:'board', from:0, to:0, t0:performance.now(), ms:1 }; venViewGo('board', 6000, 0, 1); } },
    line('Il marinaio', 'Linea 2 per San Marco! Avanti, avanti: c\'è posto dentro!', 'Line 2 to San Marco! Come on, come on: there\'s room inside!'),
    say('Linea due per San Marco! Avanti, avanti: c\'è posto dentro!', 0.85),
    { wait:1600 },
    mg(L15_MARGARET.boardArms),
    { wait:1200 },
    { run:() => { venHorn(); setTut('l15-arrival'); l15Clock(9 * 60 + 10); } },
    { guide:'<i>Tuuu-tuuu!</i> The vaporetto pulls away from Ferrovia and out into the Grand Canal.' },
    { wait:1400 },
    { run:() => { venViewGo('canal', RM ? 1 : 16000, 0, 1); } },
    { guide:'Palaces on both banks: pink, ochre, white stone, pointed gothic windows, striped mooring poles. Gondolas glide by.' },
    { wait:2600 },
    { run:() => l15Clock(9 * 60 + 25) },
    { until:() => venViewK() > 0.78 || RM },
    mg(L15_MARGARET.rialto),
    { guide:'<b>Il ponte di Rialto.</b> The oldest bridge over the Grand Canal: a white stone arch with shops on top. The boat passes underneath…' },
    { wait:1800 },
    { until:() => venViewK() >= 0.999 || RM },
    { run:() => { venViewGo('bacino', RM ? 1 : 12000, 0, 1); l15Clock(9 * 60 + 38); } },
    { guide:'…and out into the basin, the <i>Bacino di San Marco</i>: the Doge\'s Palace, pink and white; the campanile; the domes of the basilica; the two columns.' },
    { wait:2400 },
    line('Voce', 'San Marco! San Marco, Vallaresso!', 'San Marco! San Marco, Vallaresso!'),
    say('San Marco! San Marco, Vallaresso!', 0.9),
    { wait:1400 },
    { until:() => venViewK() > 0.85 || RM },
    mg(L15_MARGARET.thanks),
    { wait:2200 },
  ], { id:'l15-voyage', guide:'', timeout:240000, onSkip:() => {} }).then(() => {
    L15C.busy = null;
    l15Arrived(); save(); renderHUD();
    openUnitComplete();
  });
}
/* the boat has arrived: the lesson (and the unit) is complete */
function l15Arrived(){
  const L = S.l15; if (!L) return;
  Object.assign(L, { arrived:true, done:true, carried:true, validated:2, boatIn:true, bepiGone:true });
  l15Clock(9 * 60 + 40);
  if (S.tut !== 'l15-done') S.tut = 'l15-done';
  S.met.margaret = S.known.margaret = true;
}

/* ---------- every 400 ms: Margaret's bubbles; beats waiting for their moment ---------- */
function l15Tick(){
  if (!l15Live() || introOpen || traveling) return;
  const L = S.l15, free = !L15C.busy && !dialogOpen && !modalOpen && !cutsceneOn() && !pickOpen;
  if (free && L15C.say.length && ['santalucia', 'ferrovia'].includes(S.scene)){ const s = L15C.say.shift(); worldSay(NPC.margaret, s.t, { ms:s.ms, silent:true }); }
  if (!free) return;
  if (S.scene === 'ferrovia' && S.tut === 'l15-ticket') l15MgOnce('canal', 'The Grand Canal! Oh, look at it. And there\'s the ticket booth, dear: ACTV.');
  if (S.scene === 'ferrovia' && S.tut === 'l15-bepi' && !L.bepiCome) l15MgOnce('bench', L15_MARGARET.bench);
  if (S.scene === 'santalucia' && S.tut === 'l15-breakfast') l15MgOnce('bar', 'There, dear: the bar. Coffee!');
  /* the deckhand calls out when you come to the gate */
  if (S.scene === 'ferrovia' && S.tut === 'l15-board' && L.validated < 2 && player.x > 690 && player.y > 330 && !L.mg.called){
    L.mg.called = true; save(); worldSay(NPC.marinaio, 'Convalidi il biglietto!', { ms:2200 }); setTimeout(() => toast('<i>“Convalidi il biglietto!”</i> · Validate your ticket! (polite)'), 400);
  }
}
setInterval(l15Tick, 400);

/* tests: __debug.l15At(state) puts Lesson 15 at the start of a state, everything before it done */
Object.assign(window.__debug, {
  l15Start(){ LESSON_HOOKS[15].start(); },
  /* the end of the unit, as a save after it has it: free play in the piazza */
  l15Skip(){ if (cutsceneOn()) cutsceneEnd(); if (dialogOpen) closeDialog(); if (modalOpen) closeModal(); LESSON_HOOKS[15].skip(); l15ToFreeState(); travelTo('piazza', { x:480, y:520 }, 'Padova', 'Free play'); },
  l15At(at, o = {}){
    if (cutsceneOn()) cutsceneEnd();
    if (dialogOpen) closeDialog();
    if (!l15On()) LESSON_HOOKS[15].start();
    const L = S.l15, i = L15_ORDER.indexOf(at);
    if (i < 0) return false;
    Object.assign(L, { met:true, follow:true }); S.met.margaret = S.known.margaret = true;
    if (i >= L15_ORDER.indexOf('l15-directions')){ Object.assign(S, { vocab15:true, practiceDone15:true, vocabCheck15:true }); (PX[15] = freshPX()).i = LESSONS[14].exercises.length; Object.assign(L, { prompted:true, barrier:true }); }
    if (i >= L15_ORDER.indexOf('l15-ticket')) L.dirOK = true;
    if (i >= L15_ORDER.indexOf('l15-breakfast')){ Object.assign(L, { tickets:true, paid:true, timeNoted:true, dogOK:true }); if (!bagHas('l15-biglietti')) bagAdd(L15_TICKETS); crowdStepAsideNow(['valigia1', 'valigia2', 'valigia3', 'valigia4']); }
    if (i <= L15_ORDER.indexOf('l15-ticket')){ Object.assign(L, { tickets:false, paid:false, timeNoted:false, dogOK:false }); L.mg.tenPast = false; bagRemove('l15-biglietti'); }
    if (i <= L15_ORDER.indexOf('l15-breakfast')) Object.assign(L, { kindsOK:false, ordered:false, order:null, bar:null, barPaid:false, barDone:false });
    if (i >= L15_ORDER.indexOf('l15-bepi')){ Object.assign(L, { kindsOK:true, ordered:true, barPaid:true, barDone:true }); }
    if (i >= L15_ORDER.indexOf('l15-board')){ Object.assign(L, { bepiCome:true, bepiDone:true, bepiGone:true, boatIn:true }); L.bepi.stage = 'done'; VEN.boat = 'docked'; VEN.boatX = 0; }
    Object.assign(L, o);
    S.tut = at; save();
    const spot = { 'l15-ask':['santalucia', { x:144, y:380 }], 'l15-directions':['santalucia', { x:144, y:380 }], 'l15-ticket':['ferrovia', { x:480, y:300 }],
      'l15-breakfast':['santalucia', { x:800, y:330 }], 'l15-bepi':['ferrovia', { x:480, y:300 }], 'l15-board':['ferrovia', { x:600, y:330 }] }[at];
    if (spot) travelTo(spot[0], spot[1], spot[0], '');
    return true;
  },
});
/* the crowd already out of the way (a test, or a lesson state set up directly) */
function crowdStepAsideNow(ids){
  ids.forEach(id => { const n = NPC[id], a = n.aside[n.aside.length - 1]; crowdRec()[id] = { x:a[0], y:a[1] }; n.walkPath = null; n.x = a[0]; n.y = a[1]; if (n.asideFace) n.baseFace = { ...n.asideFace }; });
  save();
}
