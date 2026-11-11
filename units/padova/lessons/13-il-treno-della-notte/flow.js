/* Lesson 13 · Il treno della notte. Lesson flow: the start on the night platform (Lesson 12's 23:15, binario 3: the
   conductor, the door), on board (the sleeper's corridor, compartment 17 on the ticket, "Permesso!" past il signor Rinaldi on
   the phone), compartment 17: the handbook, the word check and the practice (people on trains always ask what you did today),
   the dining car (Nino seats you with Margaret; the order for her, typed; dinner; then you introduce yourself and Margaret to
   the other tables; the Bassis: your day, from your real Lesson 12; la signora Ferri and Margaret: a translation), the evening's
   background beats (the clues for Lesson 14), bed, the completion screen and skip. The conversations: dinner.js.
   Design: docs/lessons/13-il-treno-della-notte.md (its "As built" notes list the places and the API).

   The tutorial states: l13-board → l13-handbook → l13-vocab → l13-practice → l13-dinner → l13-day → l13-night → l13-done.
   Within them S.l13.phase:
     l13-board   'platform' (the station) → 'corridor' (on board: find 17) (entering 17 → l13-handbook, in the compartment)
     l13-dinner  'arrive' (the practice done: the dinner call; to the dining car) → 'seat' (Nino) → 'meet' (Margaret) → 'order'
                 (Nino and Margaret: typed) → 'eat' (served; Nino's scrap for Biscuit) → 'intro' (you and Margaret, to the
                 three other tables) (all three → l13-day)
     l13-day     'bassi' (Lina and Ernesto: your day; S.l13 dopo / yes / ma / anche / why, dinner.js l13Stage) → 'ferri' (she
                 calls you both over: TYPED_SCRIPTS.l13_ferri) → 'beats' (the children peek in, Gianni's parcel, Biscuit at the
                 hatch) → l13-night
     l13-night   'bed' (Nino: Quando arriviamo a Venezia?; to compartment 17, E on the bunk: Buonanotte, sleep) → l13-done

   Saved state: S.l13 = { phase, clock (minutes; 23:12 on the platform …), boarded, rinaldiIn (stepped into his compartment),
   permesso / scusi / prego (crowd picks), seated, met:{ margaret, bassi, ferri, rinaldi } (introductions done), ordered:{ her,
   me }, served, told:{ bassi:[keys] } (what you told them, item keys), said:[sentences], asked (you asked the Bassis about their
   day), dopo ('asked' | 'done': Ernesto's "E dopo?"), yes ('asked' | 'done'), qYes (the item Lina asked about: "Ha visto il
   tramonto?"), ma ('asked' | 'done'), qNo (the item or 'chapel' of the "No, ma …" question), anche ('asked' | 'done': Margaret's
   "Tell her I saw the church too!"), why ('asked' | 'done': Ernesto's "E perché Venezia?"), reason ('bella' | 'arte' | 'mare'),
   askedBack (E Lei, perché Venezia?), margBack (Margaret's "Ask them why…"), ferri ('call' | 'talk' | 'done'), margAt (null |
   'ferri': Margaret at la signora Ferri's table), askedWhen (you asked Nino "Quando arriviamo a Venezia?" at bedtime: for Lesson
   14), arrive ('7:30', what he said), heardWhen (picked the right time), nudgedWhen (the bunk reminded you once), mistakes:{ aux,
   pp, match, alone }, beats:{ scrap, kids, ferriDog, gianni, beg, phone, bed } (the clue beats: L13_CLUES), seen:[ids] (the same,
   as Lesson 14's notebook ids: nino-pollo, ferri-vogliono, bambini-guardano, gianni-avanzi, biscuit-cucina, bassi-letto,
   rinaldi-telefono), kidsOut, bassiBed, ferriBed, gianniGone, slept }. Tests read it through __dbg().l13. */

const L13_MINE = 17;
const freshL13 = () => ({ phase:'platform', clock:23 * 60 + 12, boarded:false, rinaldiIn:false, permesso:0, scusi:0, prego:0, seated:false,
  met:{ margaret:false, bassi:false, ferri:false, rinaldi:false }, ordered:{ her:null, me:null }, served:false,
  told:{ bassi:[] }, said:[], asked:false, mistakes:{ aux:0, pp:0, match:0, alone:0 },
  beats:{ scrap:false, kids:false, ferriDog:false, gianni:false, beg:false, phone:false, bed:false }, seen:[], kidsOut:false, bassiBed:false, ferriBed:false, gianniGone:false, slept:false,
  dopo:null, yes:null, qYes:null, ma:null, qNo:null, anche:null, why:null, reason:null, askedBack:false, margBack:false, ferri:null, margAt:null,
  askedWhen:false, heardWhen:false, arrive:null, nudgedWhen:false });
const l13On = () => S.lesson === 13 && !!S.l13;
const l13HHMM = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
function l13Clock(m){ if (!l13On()) return; S.l13.clock = Math.max(S.l13.clock, m); save(); renderHUD(); }
const l13Told = who => S.l13 && S.l13.told[who] ? S.l13.told[who].length : 0;
/* the Bassis have heard your day: the things, Lina's questions, Margaret's "too", Ernesto's "E perché Venezia?" */
const l13BassiDone = () => !!S.l13 && S.l13.why === 'done';
const l13MetCount = () => S.l13 ? ['bassi', 'ferri', 'rinaldi'].filter(k => S.l13.met[k]).length : 0;
const l13BookTut = t => ['l13-handbook', 'l13-vocab', 'l13-practice'].includes(t);

/* the clues Lesson 14 can use ("Ieri sera…" in the notebook): what you saw and heard at dinner. Each one is set in
   S.l13.beats when it happened. */
const L13_CLUES = [
  { id:'scrap', seen:'nino-pollo', who:'nino', it:'Tieni, piccolo: un pezzetto di pollo! Solo questa volta!', en:'Here you go, little one: a bit of chicken! Just this once!', note:'Nino gave Biscuit a piece of chicken.' },
  { id:'ferriDog', seen:'ferri-vogliono', who:'ferri', it:'I miei bambini amano i cani. Vogliono sempre un cane!', en:'My children love dogs. They always want a dog!', note:'La signora Ferri, looking at Biscuit.' },
  { id:'kids', seen:'bambini-guardano', who:'sofiaferri', it:'Guarda, Luca! Un cane!', en:'Look, Luca! A dog!', note:'Luca and Sofia came in in their pyjamas and stared at Biscuit. Their mother sent them back to bed.' },
  { id:'gianni', seen:'gianni-avanzi', who:'gianni', it:'Grazie, Nino. Buonanotte!', en:'Thanks, Nino. Good night!', note:'Gianni, the driver, ate in a hurry and left with a little parcel of leftovers Nino packed for him.' },
  { id:'beg', seen:'biscuit-cucina', who:'biscuit', it:'Bau?', en:'Woof?', note:'Biscuit sat at the kitchen hatch, begging.' },
  { id:'bed', seen:'bassi-letto', who:'ernesto', it:'Ernesto, è tardi! Andiamo a letto.', en:"Ernesto, it's late! Let's go to bed.", note:'Ernesto and Lina went to bed early.' },
  { id:'phone', seen:'rinaldi-telefono', who:'rinaldi', it:'Pronto? Sì, sì… domani mattina, a Venezia.', en:'Hello? Yes, yes… tomorrow morning, in Venice.', note:'Il signor Rinaldi was on the phone all evening. He noticed nothing.' },
];
/* a clue beat has happened: S.l13.beats[id], and its Lesson 14 notebook id in S.l13.seen ("Ieri sera…") */
function l13Clue(id, noSave){
  const L = S.l13; if (!L) return;
  L.beats[id] = true;
  const c = L13_CLUES.find(x => x.id === id);
  if (!Array.isArray(L.seen)) L.seen = [];
  if (c && !L.seen.includes(c.seen)) L.seen.push(c.seen);
  if (!noSave) save();
}

/* where everyone is (the dining car: world/treno.js TRENO.tables; the kitchen hatch; the corridor) */
/* (built on first use: world/treno.js is loaded after the lessons) */
let L13_SPOT_C = null;
const L13S = () => L13_SPOT_C || (L13_SPOT_C = {
  margaret:{ ...trenoSeat('N1', 'w'), seated:true }, me:trenoSeat('N1', 'e'),
  biscuit:{ x:1202, y:254, face:{ x:0.3, y:-1 }, sit:true }, hatch:{ ...TRENO.hatch.spot, face:{ x:1, y:0 }, sit:true },
  ernesto:{ ...trenoSeat('N2', 'w'), seated:true }, lina:{ ...trenoSeat('N2', 'e'), seated:true },
  ferri:{ ...trenoSeat('S1', 'w'), seated:true }, rinaldi:{ ...trenoSeat('S2', 'w'), seated:true },
  /* la signora Ferri's table: Margaret opposite her (S1 east), Biscuit at her feet, you standing at the table's end */
  margFerri:{ ...trenoSeat('S1', 'e'), seated:true }, biscuitFerri:{ x:1290, y:452, face:{ x:-1, y:0.3 }, sit:true }, meFerri:{ x:1230, y:448 },
  rinaldiCorr:{ x:305, y:216, face:{ x:0, y:-1 } },
  gianni:{ x:1796, y:470, face:{ x:1, y:0 } }, nino:{ x:1856, y:420, face:{ x:-1, y:0 } }, ninoTable:{ x:1230, y:262, face:{ x:0, y:-1 } },
  kidsDoor:{ x:1132, y:222 },
});
const L13_CAST = ['margaret', 'biscuit', 'nino', 'ferri', 'gianni', 'rinaldi', 'ernesto', 'lina', 'lucaferri', 'sofiaferri'];
let l13Busy = null;                              // a beat or a cutscene of ours is running ('seat', 'kids', …)

/* il signor Rinaldi is a crowd member in the corridor while you look for your compartment (the Permesso pick, Lesson 10) */
{
  const r = NPC.rinaldi;
  Object.defineProperty(r, 'crowd', { configurable:true, enumerable:true, get:() => l13On() && S.tut === 'l13-board' && !S.l13.rinaldiIn && S.scene === 'treno' });
  r.aside = [[305, 248]]; r.asideFace = { x:0, y:1 };
  /* the openings: the line of the moment (L13C.open), set by the talk hook (dinner.js) */
  L13_CAST.concat(['capotreno']).forEach(id => {
    const n = NPC[id], keep = k => { const d = Object.getOwnPropertyDescriptor(n, k); return () => d && d.get ? d.get() : d && d.value; };
    const was = { opening:keep('opening'), revisitOpening:keep('revisitOpening') };
    ['opening', 'revisitOpening'].forEach(k => Object.defineProperty(n, k, { configurable:true, enumerable:true, get:() => l13On() && L13C.open && convo && convo.npc === n ? L13C.open : was[k]() }));
  });
}

LESSON_HOOKS[13] = {
  n:13,
  vocab:[...L13_AUX, ...L13_PP, ...L13_WORDS, ...L13_BEFORE, ...L13_ANCHE, ...L13_ASK.filter(t => t.key !== 'soc:elei'), ...L13_WHY, ...L13_WHEN,
    ...L13_MARG.filter(t => ['mg:lei è', 'mg:londra'].includes(t.key)), ...l13AllItems().map(l13ObjTile), ...Object.keys(L13_LOC).map(l13LocTile)],
  vocabNote:'In your tile bank at dinner (Il passato, Participi, Oggi a Padova, Dove · con chi, Parole, Prima di…, Margaret, Venezia) and at bedtime (Il viaggio).',
  bankTiles:[...L13_INTRO, ...L13_MARG, L13_NON],
  doneTut:'l13-done',
  bookPulse:['l13-handbook', 'l13-vocab', 'l13-practice'],

  objective:{
    'l13-board':() => !S.l13 ? '' : S.l13.phase === 'platform' ? 'Board the night train' : 'Find your compartment',
    'l13-handbook':'Open your handbook',
    'l13-vocab':'Learn the Lesson 13 words',
    'l13-practice':'Finish the Lesson 13 practice',
    'l13-dinner':() => {
      const p = S.l13 && S.l13.phase;
      if (p === 'arrive') return 'Go to the dining car';
      if (p === 'seat') return 'The chef is waiting for you';
      if (p === 'meet') return 'Sit down for dinner';
      if (p === 'order') return 'Order dinner for Margaret and you';
      if (p === 'intro') return `Introduce yourself and Margaret · ${l13MetCount()}/3`;
      return 'Dinner!';
    },
    'l13-day':() => {
      const L = S.l13; if (!L) return '';
      if (L.phase === 'bassi') return 'Tell Lina and Ernesto about your day';
      if (L.phase === 'ferri') return 'La signora Ferri is calling you';
      return 'The evening goes on…';
    },
    'l13-night':() => S.l13 && !S.l13.askedWhen ? 'Ask Nino when the train gets to Venice' : 'Time for bed: compartment 17',
    'l13-done':'Lezione 13 completata',
  },
  guide:{
    'l13-board':near => {
      const L = S.l13; if (!L) return '';
      if (L.phase === 'platform') return near === NPC.capotreno ? 'Press <kbd>E</kbd> to talk to the conductor.'
        : 'Binario 3, <b>23:15</b>: the <i>Laguna Express</i> to Venice. Your ticket is stamped. Get on: the open door, by the conductor (<kbd>E</kbd>).';
      if (S.scene === trenoCabinScene(L13_MINE)) return '';
      if (!L.rinaldiIn && S.scene === 'treno' && player.x < 360) return 'The corridor is narrow, and a man on the phone is in the way. You know the word for getting past people…';
      return 'The sleeping car: a narrow corridor and numbered doors. Which one is yours? The number is on your ticket (your bag: <b>Borsa</b>).';
    },
    'l13-handbook':() => {
      if (modalOpen && sheet.classList.contains('book') && hbLesson === 13) setTut(vocabCheckDone(13) ? 'l13-practice' : 'l13-vocab');
      return 'Dinner is at a quarter to midnight. On a train people always ask <i>what you did today</i>, and you can only say what you <i>do</i>. Before dinner, open the handbook (<kbd>H</kbd>): <b>Lezione 13 · Il treno della notte</b>.';
    },
    'l13-vocab':'Read Lezione 13 (the past: <i>ho visto, ho mangiato</i>; <i>prima, dopo</i>). Then learn its words: open the <b>Words</b> tab, flip through the flashcards and pass the quiz. The <b>Practice</b> opens after that.',
    'l13-practice':'Words learned! Now finish the <b>Practice</b> tab of Lezione 13. Then: dinner.',
    'l13-dinner':near => {
      const L = S.l13; if (!L) return '';
      if (L.phase === 'arrive') return S.scene === trenoCabinScene(L13_MINE) ? 'Dinner is served! The dining car, <i>il vagone ristorante</i>, is the next car along: out of your compartment, then right (east).'
        : 'Dinner is served in the dining car, <i>il vagone ristorante</i>: the next car along, through the sliding doors.';
      if (L.phase === 'seat') return near === NPC.nino ? 'Press <kbd>E</kbd> to talk to the chef. Strangers: the polite forms.' : 'The chef, <b>Nino</b>, is waiting to give you a table.';
      if (L.phase === 'meet') return near === NPC.margaret ? 'Press <kbd>E</kbd> to talk to Margaret.' : 'The English lady at your table is smiling at you: <b>Margaret</b>.';
      if (L.phase === 'order') return near === NPC.nino ? 'Press <kbd>E</kbd>: Nino has the menu.' : 'Nino is at your table with the menu.';
      if (L.phase === 'intro') return `Everyone in the dining car is curious about the two of you. Go round the tables: <b>Lina and Ernesto</b>, <b>la signora Ferri</b>, <b>il signor Rinaldi</b> (<b>${l13MetCount()}/3</b>). Introduce yourself, and Margaret: she can't say a word in Italian. Strangers: <i>Lei</i>.`;
      return 'Buon appetito!';
    },
    'l13-day':near => {
      const L = S.l13; if (!L) return '';
      if (L.phase === 'bassi') return near === NPC.lina || near === NPC.ernesto ? 'Press <kbd>E</kbd>: tell them what you did today.'
        : '<b>Lina and Ernesto</b> want to hear all about your day in Padua. New tiles: <b>Il passato</b>, <b>Participi</b>, <b>Oggi a Padova</b>: the things <i>you</i> did.';
      if (L.phase === 'ferri') return near === NPC.ferri ? 'Press <kbd>E</kbd> to talk to la signora Ferri. Margaret is with you: you translate.' : '<b>La signora Ferri</b> is calling you and Margaret over to her table.';
      return 'The dining car is getting quiet. It\'s late…';
    },
    'l13-night':near => {
      const mine = S.scene === trenoCabinScene(L13_MINE);
      if (S.l13 && !S.l13.askedWhen){
        if (near === NPC.nino) return 'Press <kbd>E</kbd> to talk to Nino.';
        return mine ? 'Your compartment. But before you sleep: when does the train get to Venice tomorrow? <b>Nino</b>, the chef, is still in the dining car.'
          : 'It\'s late, and everyone is going to bed. One last thing: when does the train get to Venice tomorrow? Ask <b>Nino</b>, the chef, at his counter.';
      }
      return mine ? 'Your compartment. The bunk is made: press <kbd>E</kbd> on it to go to sleep.'
        : "It's late. Everyone is going to bed: back to your compartment, <b>17</b>, in the sleeping car.";
    },
    'l13-done':() => 'Lezione 13 completata! Buonanotte… Venice in the morning.'
      + (hookFor(14) && hookFor(14).start && LESSONS[13] ? ` <button class="gbtn" data-action="l14">Start Lezione 14 · ${esc(LESSONS[13].title)}</button>` : ''),
  },
  markers:{
    get 'l13-board'(){ return S.l13 && S.l13.phase === 'platform' ? 'capotreno' : null; },
    get 'l13-dinner'(){
      const L = S.l13; if (!L || l13Busy) return null;
      if (L.phase === 'seat' || L.phase === 'order') return 'nino';
      if (L.phase === 'meet') return 'margaret';
      if (L.phase === 'intro') return !L.met.bassi ? 'lina' : !L.met.ferri ? 'ferri' : !L.met.rinaldi ? 'rinaldi' : null;
      return null;
    },
    get 'l13-day'(){ const L = S.l13; return l13Busy || !L ? null : L.phase === 'bassi' ? 'lina' : L.phase === 'ferri' && L.ferri === 'talk' ? 'ferri' : null; },
    get 'l13-night'(){ return l13Busy || !S.l13 || S.l13.askedWhen ? null : 'nino'; },
  },

  start(){
    if (modalOpen) closeModal();
    if (cutsceneOn()) cutsceneEnd();
    S.lesson = 13; S.l5follow = false; S.brunoFollow = false; S.l13 = freshL13(); S.daytime = 'night';
    if (S.l12) S.l12.free = true;
    TRENO.mine = L13_MINE; TRENO.sky = null; TRENO.moving = true; TRENO.open = {}; TRENO.openTo = {};
    delete S.l6.steps.l13_order; delete S.l6.steps.l13_ferri;       // (skipL6 marks every typed script as done)
    l13Ticket();
    setTut('l13-board'); lastGuide = ''; l13Busy = null;
    travelTo('stazione', { x:640, y:248 }, 'Stazione · binario 3', 'Il treno delle 23:15');
    setTimeout(() => toast('<b>Lezione 13 · Il treno della notte</b> has started'), 1800);
  },
  /* the end of Lesson 13: dinner, the day told, asleep in compartment 17 (S.l13.slept) */
  skip(){
    const l13 = Object.assign(freshL13(), { phase:'bed', clock:50, boarded:true, rinaldiIn:true, permesso:1, seated:true, met:{ margaret:true, bassi:true, ferri:true, rinaldi:true },
      ordered:{ her:'risotto', me:'pollo' }, served:true, told:{ bassi:['biglietto', 'treno', 'gelato', 'tramonto'] },
      said:['Ho comprato il biglietto.', 'Dopo, ho preso il treno.', 'Sì, ho visto il tramonto sul ponte.', 'No, ma ho mangiato un gelato.', 'Anche Margaret ha visto la chiesa.', 'Perché è bellissima!'],
      beats:{ scrap:true, kids:true, ferriDog:true, gianni:true, beg:true, phone:true, bed:true }, seen:L13_CLUES.map(c => c.seen),
      bassiBed:true, ferriBed:true, gianniGone:true, slept:true, dopo:'done', yes:'done', qYes:'tramonto', ma:'done', qNo:'chapel', anche:'done', why:'done', reason:'bella', ferri:'done',
      askedWhen:true, heardWhen:true, arrive:L13_ARRIVE.time });
    /* (the world is left neutral, in the piazza in the afternoon, like Lesson 12's skip: Lesson 14's start puts the player in
       compartment 17 in the morning, TRENO.mine) */
    Object.assign(S, { lesson:13, vocab13:true, practiceDone13:true, vocabCheck13:true, tut:'l13-done', scene:'piazza', l5follow:false, brunoFollow:false, l13, daytime:'afternoon' });
    ['margaret', 'nino', 'ferri', 'rinaldi', 'ernesto', 'lina'].forEach(id => { S.met[id] = S.known[id] = true; });
    TRENO.mine = L13_MINE; S.l6.steps.l13_order = TYPED_SCRIPTS.l13_order.steps.length; S.l6.steps.l13_ferri = TYPED_SCRIPTS.l13_ferri.steps.length;
    (PX[13] = freshPX()).i = LESSONS[12].exercises.length;
  },
  restore(){
    if (S.lesson < 13) return;
    if (!S.l13 || typeof S.l13 !== 'object') S.l13 = freshL13();
    const f = freshL13();
    Object.keys(f).forEach(k => { if (S.l13[k] === undefined) S.l13[k] = f[k]; });
    ['met', 'ordered', 'told', 'mistakes', 'beats'].forEach(k => { if (!S.l13[k] || typeof S.l13[k] !== 'object') S.l13[k] = f[k]; else Object.keys(f[k]).forEach(j => { if (S.l13[k][j] === undefined) S.l13[k][j] = f[k][j]; }); });
    if (!Array.isArray(S.l13.seen)) S.l13.seen = [];
    TRENO.mine = L13_MINE;
    if (S.lesson !== 13) return;
    const L = S.l13;
    /* a save from before the reorder (the handbook came after the dinner's barrier): the book first, then on from where dinner was */
    if (S.tut === 'l13-barrier') S.tut = vocabCheckDone(13) ? (practiceDone(13) ? 'l13-dinner' : 'l13-practice') : 'l13-handbook';
    if (S.tut === 'l13-dinner' && !practiceDone(13)) S.tut = vocabCheckDone(13) ? 'l13-practice' : 'l13-handbook';
    if (S.tut === 'l13-practice' && !vocabCheckDone(13)) S.tut = 'l13-vocab';
    if (S.tut === 'l13-dinner'){
      if (L.phase === 'meet' && L.met.margaret) L.phase = L.served ? 'intro' : 'order';
      if (L.phase === 'eat' && !L.beats.scrap){ l13Clue('scrap', true); L.served = true; }
      if (L.phase === 'eat') L.phase = 'intro';
      if (L.phase === 'intro' && l13MetCount() >= 3){ S.tut = 'l13-day'; L.phase = 'bassi'; }
    }
    if (S.tut === 'l13-day' && !['bassi', 'ferri', 'beats'].includes(L.phase)) L.phase = l13BassiDone() ? 'ferri' : 'bassi';
    /* the Ferri scene cut short: back to calling you over; Margaret at her own table */
    if (S.tut === 'l13-day' && L.phase === 'ferri' && L.ferri !== 'done'){ L.ferri = 'talk'; L.margAt = 'ferri'; }
    if (S.tut === 'l13-day' && L.phase === 'ferri' && L.ferri === 'done'){ L.phase = 'beats'; L.margAt = null; }
    if (S.tut !== 'l13-day' || L.phase !== 'ferri') L.margAt = null;
    /* a beat cut short by the reload: the children are back in bed; Gianni's beat finishes; everyone goes to bed */
    L.kidsOut = false;
    if (S.tut === 'l13-day' && L.beats.gianni){ L.gianniGone = true; l13Clue('beg', true); S.tut = 'l13-night'; L.phase = 'bed'; }
    if (S.tut === 'l13-night' || S.tut === 'l13-done'){ L.gianniGone = true; L.bassiBed = true; L.ferriBed = true; l13Clue('bed', true); L.margAt = null; }
  },

  /* the clock in the header: 23:12 on the platform, past midnight at bedtime */
  gameClock(){ return l13On() && S.tut !== 'l13-done' ? { h:Math.floor(S.l13.clock / 60) % 24, m:S.l13.clock % 60 } : null; },
  trenoSky(){ return l13On() ? 'night' : null; },
  stamps(){
    if (!S.l13 || !S.l13.served) return [];
    return [{ id:'l13-cena', title_it:'Cena sul Laguna Express', title_en:'Dinner on the night train', icon:'🍝', color:'#7a2232', when:'00:10 · notte' }];
  },

  /* the station at night: the board, the train on binario 3, its door */
  board(){
    if (!l13On() || S.tut !== 'l13-board') return null;
    return [{ time:'22:40', dest:'Verona Porta Nuova', bin:1, note:'partito', cls:'gone' }, { time:'23:15', dest:'Venezia S. Lucia', bin:3, note:'Laguna Express · in partenza', cls:'hot' },
      { time:'23:40', dest:'Bologna Centrale', bin:2 }, { time:'23:58', dest:'Vicenza', bin:4 }];
  },
  stazioneTrain(){ return l13On() && S.tut === 'l13-board' && !S.l13.boarded ? { kind:'night' } : null; },
  door(d){ return l13Door(d); },
  knock(id){ return l13Knock(id); },

  /* who is where */
  sceneOf(n){
    if (!l13On()) return null;
    const L = S.l13, id = n.id;
    if (id === 'rinaldi') return S.tut === 'l13-board' && L.rinaldiIn ? trenoCabinScene(12) : 'treno';
    if (id === 'lucaferri' || id === 'sofiaferri') return L.kidsOut ? 'treno' : trenoCabinScene(15);
    if (id === 'lina' || id === 'ernesto') return L.bassiBed ? trenoCabinScene(14) : 'treno';
    if (id === 'ferri') return L.ferriBed ? trenoCabinScene(16) : 'treno';
    if (id === 'gianni') return L.gianniGone ? 'away' : 'treno';
    return null;
  },
  place(){ if (l13On()) l13Place(); },
  redirect(n){ return l13On() && n.id === 'ernesto' && !S.l13.bassiBed ? NPC.lina : null; },

  /* the corridor: Permesso past il signor Rinaldi */
  onCrowd(n, choice){
    if (!l13On() || n.id !== 'rinaldi' || !choice) return false;
    S.l13[choice] = (S.l13[choice] || 0) + 1; save();
    if (choice !== 'permesso') return false;
    l13RinaldiIn();
    return true;
  },
  crowdHint(n, kind){
    if (!l13On() || n.id !== 'rinaldi') return null;
    if (kind === 'scusi') return 'He turned round… and went back to his phone. <i>Scusi</i> gets attention; to squeeze past someone, there is another word. You used it outside the museum.';
    if (kind === 'prego') return '<i>Prego</i> is what <i>he</i> would say back.';
    return null;
  },

  /* the conversations (dinner.js) */
  talk(npc){ return l13Talk(npc); },
  bank(npc, groups, names){ return l13Bank(npc, groups, names); },
  phrases(npc){ return l13Phrases(npc); },
  react(id, n, st, add, out, ints, k){ return l13React(id, n, st, add, out, ints, k); },
  hint(n, st){ return l13Hint(n, st); },
  afterTurn(n, out, res, words){ return l13After(n, out, res, words); },
  onClose(closedId, closedDone, wasCut){ return l13OnClose(closedId, closedDone, wasCut); },

  onVocab(){ if (['l13-handbook', 'l13-vocab'].includes(S.tut) && S.l13) setTut('l13-practice'); },
  onPractice(){
    if (!l13BookTut(S.tut) || !S.l13) return;
    toast('New tiles for dinner: <b>Il passato</b>, <b>Participi</b>, <b>Oggi a Padova</b> (the things <i>you</i> did today), <b>Prima di…</b>');
    l13AfterBook();
  },
  cutsceneResume(c){
    if (!l13On()) return false;
    if (c.id === 'l13-board'){ S.l13.boarded = true; S.l13.phase = 'corridor'; S.scene = 'treno'; player.x = 80; player.y = 290; save(); return true; }
    if (c.id === 'l13-seat'){ S.l13.seated = true; S.l13.phase = 'meet'; player.x = L13S().me.x; player.y = L13S().me.y + 40; save(); return true; }
    if (c.id === 'l13-ferri'){ S.l13.ferri = 'talk'; S.l13.margAt = 'ferri'; player.x = L13S().meFerri.x; player.y = L13S().meFerri.y; save(); return true; }
    if (c.id === 'l13-sleep'){ l13Sleep(true); return true; }
    if (c.id === 'l13-dinnercall'){ l13DinnerCall(true); return true; }
    if (['l13-depart', 'l13-cabin', 'l13-nino', 'l13-order'].includes(c.id)) return true;
    return false;
  },
  dbgLesson(n){
    if (n !== 13 || !S.l13) return null;
    const C = convo && convo.l13 ? convo.l13 : null;
    return { time:l13HHMM(S.l13.clock), busy:l13Busy, quests:l13DoneQuests(), free:l13Free(), stage:l13Stage(), metCount:l13MetCount(), dayItems:l13DayItems().map(d => d.key), dayTiles:l13DayItems().map(d => d.label), pps:l13PPs(),
      convo:C ? { kind:C.kind, npc:convo.npc.id, said:(C.said || []).slice(), need:C.need || null } : null,
      script:convo && convo.scriptKey ? { key:convo.scriptKey, step:convo.step } : null };
  },
};

/* ---------- the ticket in the bag: carriage 5, compartment 17 ---------- */
function l13Ticket(){
  const item = { id:'biglietto', label_it:'il biglietto', label_en:'the train ticket: Venezia, 23:15 · carrozza 5, cabina 17', icon:'🎫', giveTo:['capotreno'], note:'Convalidato · carrozza 5 · cabina 17' };
  if (bagHas('biglietto')) bagSet('biglietto', item); else bagAdd(item);
}

/* ---------- places ---------- */
function l13Put(id, spot){
  const n = NPC[id]; if (!n || n.cutWalk || !spot) return;
  n.x = spot.x; n.y = spot.y; if (spot.face){ n.baseFace = { ...spot.face }; if (!dialogOpen || !convo || convo.npc !== n) n.face = { ...spot.face }; }
  n.seated = !!spot.seated; if (n.animal) n.sit = spot.sit !== undefined ? spot.sit : n.sit;
}
function l13Place(){
  const L = S.l13, t = S.tut;
  if (l13Busy === 'beat') return;
  const atFerri = L.margAt === 'ferri';
  l13Put('margaret', atFerri ? L13S().margFerri : L13S().margaret);
  if (!NPC.biscuit.follows) l13Put('biscuit', L.beats.beg ? L13S().hatch : atFerri ? L13S().biscuitFerri : L13S().biscuit);
  if (!L.bassiBed){ l13Put('ernesto', L13S().ernesto); l13Put('lina', L13S().lina); }
  else { l13Put('ernesto', { x:400, y:330, face:{ x:1, y:0 } }); l13Put('lina', { x:560, y:320, face:{ x:-1, y:0 } }); }
  if (!L.ferriBed) l13Put('ferri', L13S().ferri); else l13Put('ferri', { x:480, y:330, face:{ x:0, y:-1 } });
  if (t === 'l13-board' && !L.rinaldiIn) l13Put('rinaldi', L13S().rinaldiCorr); else if (t === 'l13-board') l13Put('rinaldi', { x:480, y:320, face:{ x:0, y:1 } }); else l13Put('rinaldi', L13S().rinaldi);
  if (!L.gianniGone) l13Put('gianni', L13S().gianni);
  if (!(L.phase === 'order' && t === 'l13-dinner')) l13Put('nino', L13S().nino); else l13Put('nino', L13S().ninoTable);
  if (!L.kidsOut){ l13Put('lucaferri', { x:380, y:330, face:{ x:0, y:1 } }); l13Put('sofiaferri', { x:430, y:340, face:{ x:0, y:1 } }); }
}

/* ---------- the doors: the train on binario 3, your compartment, the bunk ---------- */
function l13Door(d){
  if (!l13On()) return false;
  const L = S.l13;
  if (S.scene === 'stazione' && S.tut === 'l13-board'){
    if (/^convalida/.test(d.id)){ toast('Your ticket is stamped already: <b>convalidato</b>.'); return true; }
    if (d.id === 'treno'){ l13GetOn(); return true; }
  }
  if (d.id === 'cabina-letto' && trenoCabinOf() === L13_MINE){
    if (S.tut === 'l13-night'){
      if (!L.askedWhen && !L.nudgedWhen){ L.nudgedWhen = true; save(); toast('One more thing before you sleep: when does the train get to Venice tomorrow? <b>Nino</b>, in the dining car, will know. (Or press <kbd>E</kbd> again to sleep now.)'); return true; }
      l13Sleep(); return true;
    }
    if (S.tut === 'l13-done'){ toast('Sweet dreams. (Lesson 14 starts in the morning.)'); return true; }
    if (l13BookTut(S.tut)){ toast('<b>La cuccetta</b>: your bunk, made up with crisp sheets. Not yet: the handbook (<kbd>H</kbd>), then dinner!'); return true; }
    toast(S.tut === 'l13-board' || (S.tut === 'l13-dinner' && L.phase === 'arrive') ? '<b>La cuccetta</b>: your bunk, made up with crisp sheets. Not yet: dinner first!' : '<b>La cuccetta</b>: your bunk. Later!');
    return true;
  }
  if (d.id === 'tr-porta'){ toast('The outside door is locked while the train is moving. Next stop: Venezia Santa Lucia, in the morning.'); return true; }
  return false;
}
/* the conductor's whistle, on board */
function l13GetOn(){
  const L = S.l13;
  cutscene([
    { face:'capotreno', to:'player' },
    { say:'Prego, salga! Buon viaggio!', who:'capotreno', ms:1800 },
    { walk:'player', path:[{ x:STAZ.door.x + 14, y:STAZ.door.y }], speed:110, face:{ x:-1, y:0 } },
    { run:() => { L.boarded = true; L.phase = 'corridor'; L.clock = 23 * 60 + 14; save(); } },
    { say:'Fiiiii!', who:'capotreno', ms:1200, silent:true },
  ], { id:'l13-board', guide:'<i>“Please, get on! Have a good trip!”</i> You climb aboard. Carriage five, the sleeping car…', onSkip:() => { L.boarded = true; L.phase = 'corridor'; } }).then(() => {
    L.boarded = true; L.phase = 'corridor'; save();
    travelTo('treno', { x:80, y:290 }, 'Il Laguna Express', 'Carrozza 5 · Vagone letto');
    setTimeout(l13Departs, RM ? 600 : 2400);
  });
}
function l13Departs(){
  if (!l13On() || S.scene !== 'treno') return;
  player.face = { x:1, y:0 };
  cutscene([
    { guide:'A jolt, a long whistle… and Padova slides away behind you. <b>23:15</b>: the <i>Laguna Express</i> is on its way.' },
    { run:() => l13Clock(23 * 60 + 15) },
    { wait:2600 },
  ], { id:'l13-depart' }).then(() => toast('Your compartment\'s number is on your ticket: your bag (<b>Borsa</b>).'));
}
/* Permesso: he says Prego, his door slides open, he steps in, the door shuts */
function l13RinaldiIn(){
  const r = NPC.rinaldi, L = S.l13;
  worldSay('player', 'Permesso!', { ms:1050 }); S.sentences++; save();
  setTimeout(() => { crowdAttend(r, 1600); worldSay(r, 'Prego, prego!'); }, 800);
  setTimeout(() => {
    trenoDoorOpen(12, true);
    trenoWalk(r, [[305, 246], [305, 270]], 70).then(() => {
      L.rinaldiIn = true; save(); renderHUD(); trenoDoorOpen(12, false);
      setTimeout(() => toast('<i>“Prego, prego!”</i> · Go ahead, go ahead!'), 200);
    });
  }, 1500);
}
/* the knock hook: your own door (17) opens; the others: nobody, or a voice */
function l13Knock(id){
  if (!l13On()) return false;
  const L = S.l13, t = S.tut;
  if (id === L13_MINE){
    trenoDoorOpen(id, true).then(() => trenoEnter(id, { title:'Cabina 17', sub:t === 'l13-night' ? 'Buonanotte…' : 'La tua cabina' }));
    if (t === 'l13-board') setTimeout(l13InCabin, RM ? 800 : 2600);
    return true;
  }
  trenoKnockFx(id);
  const voice = { 12:L.rinaldiIn && t === 'l13-board' ? ['Sì? … Ah no, scusi, sono al telefono!', "Yes? … Oh no, sorry, I'm on the phone!"] : null,
    14:L.bassiBed ? ['Buonanotte! A domani!', 'Good night! See you tomorrow!'] : null,
    15:['Shhh! … Mamma?', 'Shhh! … Mum?'], 16:L.ferriBed ? ['Sì? … Buonanotte!', 'Yes? … Good night!'] : null,
    cab:['Occupato! Sto guidando!', "Busy! I'm driving!"] }[id];
  setTimeout(() => {
    if (S.scene !== 'treno') return;
    if (voice){ trenoDoorSay(id, voice[0], { ms:2400, pitch:id === 15 ? 1.6 : id === 'cab' ? 0.75 : 1, en:voice[1] }); if (id === 15 && L.beats) { L.knock15 = true; save(); } }
    else toast(`Compartment ${id}. Nobody answers.`);
  }, 900);
  return true;
}
/* in compartment 17: the bag on the rack, a card on the table (dinner at 23:45), and the handbook: on a train people always ask
   what you did today */
function l13InCabin(){
  const L = S.l13;
  if (!l13On() || S.tut !== 'l13-board') return;
  bagRemove('biglietto');
  L.phase = 'cabin'; setTut('l13-handbook'); l13Clock(23 * 60 + 20);
  cutscene([
    { guide:'Compartment 17: a bunk, a little table, a window full of night. You put your bag on the rack.' },
    { wait:1800 },
    { guide:'A card on the table: <i>“Cena nel vagone ristorante · ore 23:45.”</i> Dinner with strangers… and on a train, people always ask <i>what you did today</i>. You can only say what you <i>do</i>. Time for the handbook: <b>Lezione 13</b>.' },
    { wait:3400 },
  ], { id:'l13-cabin' }).then(() => { if (S.tut === 'l13-handbook') toast('Open your handbook (<kbd>H</kbd>): <b>Lezione 13 · Il treno della notte</b>. The past: what you <i>did</i> today.'); });
}
/* the practice is done: on to wherever dinner is (a fresh game: the dinner call in your compartment) */
function l13AfterBook(){
  const L = S.l13;
  if (!L.served){
    if (['platform', 'corridor', 'cabin', 'arrive'].includes(L.phase) || !L.seated){ l13DinnerCall(); return; }
    if (L.phase === 'meet' && L.met.margaret) L.phase = 'order';
    setTut('l13-dinner'); save(); return;
  }
  if (l13MetCount() >= 3){ L.phase = 'bassi'; setTut('l13-day'); save(); return; }
  L.phase = 'intro'; setTut('l13-dinner'); save();
}
/* the dinner call: Din-don! "Signori, la cena è servita nel vagone ristorante!" */
function l13DinnerCall(resumed){
  const L = S.l13;
  L.phase = 'arrive'; setTut('l13-dinner'); l13Clock(23 * 60 + 45);
  if (resumed) return;
  setTimeout(() => {
    if (!l13On() || S.tut !== 'l13-dinner') return;
    cutscene([
      { guide:'<i>Din-don!</i> A voice in the corridor: <i>“Signori, la cena è servita nel vagone ristorante!”</i> (Ladies and gentlemen, dinner is served in the dining car!)' },
      { run:() => speak('Signori, la cena è servita nel vagone ristorante!', 0.95, false, 0.92) },
      { wait:3200 },
    ], { id:'l13-dinnercall' });
  }, modalOpen ? 900 : 300);
}

/* ---------- the dining car: Nino comes to meet you, then seats you with Margaret ---------- */
function l13NinoGreets(){
  const L = S.l13;
  if (l13Busy || L.phase !== 'arrive' || S.scene !== 'treno') return;
  l13Busy = 'nino'; L.phase = 'seat'; save();
  const n = NPC.nino;
  cutscene([
    { walk:'nino', path:[{ x:1790, y:300 }, { x:Math.min(1700, player.x + 70), y:300 }], speed:170, find:false },
    { face:'nino', to:'player' }, { face:'player', to:'nino' },
    { say:'Buonasera! Prego!', who:'nino', ms:1600 },
  ], { id:'l13-nino', guide:'' }).then(() => {
    l13Busy = null; n.cutWalk = false;
    n.x = Math.min(1700, player.x + 70); n.y = 300; n.baseFace = { x:-1, y:0 };
    if (!dialogOpen) openConvo(n);
  });
}
function l13Seat(){
  const L = S.l13, n = NPC.nino, me = L13S().me;
  l13Busy = 'seat';
  cutscene([
    { walk:'nino', path:[{ x:me.x + 20, y:262 }], speed:130, async:true },
    { walk:'player', path:[{ x:me.x, y:262 }, { x:me.x, y:me.y }], speed:120, face:{ x:-1, y:0 } },
    { face:'nino', to:'player' },
    { say:'Prego, si accomodi!', who:'nino', ms:1600 },
    { run:() => { L.seated = true; L.phase = 'meet'; l13Clock(23 * 60 + 50); save(); } },
  ], { id:'l13-seat', guide:'<i>“Please, have a seat!”</i> Nino shows you to a table by the window. Someone is already sitting there…', onSkip:() => { player.x = me.x; player.y = me.y; } }).then(() => {
    l13Busy = null; L.seated = true; L.phase = 'meet'; save(); n.cutWalk = false;
    trenoWalk(n, [[1790, 300], [L13S().nino.x - 60, 340], [L13S().nino.x, L13S().nino.y]], 170).then(renderHUD); renderHUD();
    player.face = { x:-1, y:0 };
    setTimeout(() => { if (!dialogOpen && S.tut === 'l13-dinner') openConvo(NPC.margaret); }, 300);
  });
}
/* Margaret has said hello: Nino brings the menu to your table */
function l13ToOrder(){
  const L = S.l13, me = L13S().me;
  L.phase = 'order'; save();
  l13Busy = 'order';
  cutscene([
    { guide:'Nino is at your table with the menu.' },
    { walk:'player', path:[{ x:player.x, y:Math.max(player.y, 262) }, { x:me.x, y:262 }, { x:me.x, y:me.y }], speed:150, face:{ x:-1, y:0 } },
    { walk:'nino', path:[{ x:1790, y:300 }, L13S().ninoTable], speed:190 },
    { face:'nino', to:'player' },
  ], { id:'l13-order', guide:'Nino arrives with the menu.', onSkip:() => { player.x = me.x; player.y = me.y; } }).then(() => {
    l13Busy = null; NPC.nino.cutWalk = false; renderHUD();
    setTimeout(() => { if (!dialogOpen) openConvo(NPC.nino); }, 300);
  });
}
/* the order is in: half an hour later, dinner; Nino slips Biscuit a scrap (a clue); then Margaret: "Everyone keeps looking at us…" */
function l13Served(){
  const L = S.l13;
  l13Busy = 'beat';
  const f = $('#fade'); $('#fadeTitle').textContent = "Mezz'ora dopo…"; $('#fadeSub').textContent = 'Half an hour later'; f.classList.add('on');
  setTimeout(() => {
    L.served = true; L.phase = 'eat'; l13Clock(24 * 60 + 20); save();
    TRENO.tables.find(T => T.id === 'N1').food = [['w', '#e8c870'], ['e', '#d9965a']];
    NPC.nino.x = 1300; NPC.nino.y = 262; NPC.nino.baseFace = { x:-1, y:0 };
    setTimeout(() => f.classList.remove('on'), RM ? 100 : 400);
    l13Beats([
      { say:'Buon appetito!', who:'nino', ms:1600, en:'Enjoy your meal!' },
      { walk:'nino', path:[[1232, 264]], speed:80 },
      { face:'nino', to:'biscuit' },
      { say:'Tieni, piccolo: un pezzetto di pollo! Solo questa volta!', who:'nino', ms:2800, en:'Here you go, little one: a bit of chicken! Just this once!', clue:'scrap' },
      { say:'Gnam!', who:'biscuit', ms:1000, silent:true },
      { walk:'nino', path:[[1790, 300], [L13S().nino.x - 60, 340], [L13S().nino.x, L13S().nino.y]], speed:170, async:true },
      { wait:1400 },
    ], () => {
      l13Busy = null; L.phase = 'intro'; save(); renderHUD();
      setTimeout(() => { if (!dialogOpen && l13On() && S.tut === 'l13-dinner') openConvo(NPC.margaret); }, 300);
    });
  }, RM ? 300 : 1500);
}

/* ---------- beats: small scenes in the background (the player keeps control) ----------
   steps: { say, who, ms, en?, silent?, clue? } (a bubble; the English in a quiet toast; clue: S.l13.beats[clue] = true),
   { walk:id, path:[[x, y], …], speed, async? }, { face:id, to:id | 'player' }, { wait }, { run } */
function l13Beats(steps, done){
  l13Busy = 'beat';
  let i = 0;
  const next = () => {
    if (!l13On()){ l13Busy = null; return; }
    if (i >= steps.length){ l13Busy = null; save(); renderHUD(); if (done) done(); return; }
    if (dialogOpen || modalOpen || traveling){ setTimeout(next, 300); return; }
    const s = steps[i++];
    if (s.say){
      const n = s.who === 'player' ? 'player' : NPC[s.who];
      if (n !== 'player' && !activeNpcs().includes(n)){ next(); return; }
      worldSay(n, fill(s.say), { ms:s.ms || 2000, silent:!!s.silent });
      if (s.en) setTimeout(() => toast(`<i>“${esc(fill(s.say))}”</i> · ${esc(fill(s.en))}`), 300);
      if (s.clue) l13Clue(s.clue);
      setTimeout(next, RM ? 300 : (s.ms || 2000) + 250); return;
    }
    if (s.walk){ const p = trenoWalk(s.walk, s.path, s.speed || 90); if (s.async) next(); else p.then(next); return; }
    if (s.face){ const n = NPC[s.face], t = s.to === 'player' ? player : NPC[s.to]; if (n && t){ const dx = t.x - n.x, dy = t.y - n.y, d = Math.hypot(dx, dy) || 1; n.face = n.baseFace = { x:dx / d, y:dy / d }; } next(); return; }
    if (s.wait){ setTimeout(next, RM ? 100 : s.wait); return; }
    if (s.run){ const r = s.run(); if (r && r.then) r.then(next); else next(); return; }
    next();
  };
  next();
}
/* l13-day: after the Bassis, la signora Ferri calls you and Margaret over; after her, the children peek in; then Gianni leaves
   with his parcel and Biscuit goes begging at the hatch; then it is late */
function l13AfterDay(){
  const L = S.l13;
  if (l13Busy || S.tut !== 'l13-day' || dialogOpen || cutsceneOn()) return;
  if (S.scene !== 'treno' || player.x < 1080){ setTimeout(l13AfterDay, 800); return; }
  if (L.phase === 'ferri' && !L.ferri) return l13FerriCall();
  if (L.phase === 'beats' && !L.beats.kids) return l13KidsBeat();
  if (L.phase === 'beats' && !L.beats.gianni) return l13GianniBeat();
}
/* "Scusi! Signora! Venite, venite!": Margaret takes the seat opposite la signora Ferri (Biscuit trots after her), you stand at the table */
function l13FerriCall(){
  const L = S.l13, s = L13S();
  L.ferri = 'call'; save();
  l13Busy = 'ferri';
  cutscene([
    { face:'ferri', to:'player' },
    { say:'Scusi! {Me}! Signora! Venite, venite!'.replace('{Me}', S.playerName), who:'ferri', ms:2200 },
    { run:() => { toast('<i>“Excuse me! Madam! Come over, come!”</i> La signora Ferri is waving at you and Margaret.'); companionToast("Me? Oh! She means both of us, dear. Come on!"); } },
    { run:() => { L.margAt = 'ferri'; dogFollow('biscuit', 'margaret'); } },
    { walk:'margaret', path:[{ x:s.margaret.x, y:262 }, { x:s.margFerri.x, y:420 }, { x:s.margFerri.x, y:s.margFerri.y }], speed:80, async:true },
    { walk:'player', path:[{ x:player.x, y:Math.max(player.y, 262) }, { x:s.meFerri.x, y:300 }, { x:s.meFerri.x, y:s.meFerri.y }], speed:120, face:{ x:0, y:1 } },
    { wait:900 },
  ], { id:'l13-ferri', guide:'La signora Ferri calls you and Margaret over to her table.', onSkip:() => { player.x = s.meFerri.x; player.y = s.meFerri.y; } }).then(() => {
    l13Busy = null; NPC.margaret.cutWalk = false; dogFollow('biscuit', null);
    L.ferri = 'talk'; save(); renderHUD();
    setTimeout(() => { if (!dialogOpen && l13On()) { player.face = { x:0, y:1 }; openConvo(NPC.ferri); } }, 400);
  });
}
/* Margaret's English in a quiet toast (outside a conversation) */
function companionToast(s){ setTimeout(() => toast(`<b>Margaret:</b> <i>“${esc(s)}”</i>`), 900); }
/* the translation is done: Margaret goes back to her tea, Biscuit after her */
function l13FerriDone(){
  const L = S.l13, s = L13S();
  L.ferri = 'done'; L.phase = 'beats'; save();
  dogFollow('biscuit', 'margaret');
  trenoWalk('margaret', [[s.margFerri.x, 420], [s.margaret.x, 262], [s.margaret.x, s.margaret.y]], 80).then(() => {
    L.margAt = null; dogFollow('biscuit', null); save(); renderHUD();
    setTimeout(l13AfterDay, 1200);
  });
}
function l13KidsBeat(){
  const L = S.l13, d = L13S().kidsDoor;
  L.kidsOut = true; save();
  const lu = NPC.lucaferri, so = NPC.sofiaferri;
  lu.x = 1090; lu.y = 220; so.x = 1076; so.y = 230; renderHUD(); trenoLook(1150);
  l13Beats([
    { walk:'sofiaferri', path:[[d.x + 18, d.y + 24]], speed:80, async:true },
    { walk:'lucaferri', path:[[d.x, d.y]], speed:80 },
    { face:'sofiaferri', to:'biscuit' }, { face:'lucaferri', to:'biscuit' },
    { say:'Guarda, Luca! Un cane!', who:'sofiaferri', ms:2200, en:'Look, Luca! A dog!', clue:'kids' },
    { say:'Che bello…', who:'lucaferri', ms:1600, en:'How lovely…' },
    { face:'ferri', to:'lucaferri' },
    { say:'Luca! Sofia! A letto, subito!', who:'ferri', ms:2400, en:'Luca! Sofia! To bed, right now!' },
    { say:'Uffa…', who:'sofiaferri', ms:1200, en:'Oh, man…' },
    { walk:'sofiaferri', path:[[1060, 230], [1020, 226]], speed:110, async:true },
    { walk:'lucaferri', path:[[1060, 220], [1020, 220]], speed:110 },
    { run:() => { L.kidsOut = false; save(); renderHUD(); } },
    { say:'Scusi… i bambini!', who:'ferri', ms:1800, en:'Sorry… children!' },
  ], () => { trenoLook(null); setTimeout(l13AfterDay, 1200); });
}
function l13GianniBeat(){
  const L = S.l13, g = NPC.gianni;
  l13Clock(24 * 60 + 40);
  trenoLook(1500);
  l13Beats([
    { say:'Pronto? Sì, sì… domani mattina, a Venezia.', who:'rinaldi', ms:2600, en:'Hello? Yes, yes… tomorrow morning, in Venice.', clue:'phone' },
    { wait:900 },
    { run:() => trenoLook(1820) },
    { face:'nino', to:'gianni' },
    { say:'Ecco, Gianni: il tuo pacchetto. Gli avanzi, come sempre!', who:'nino', ms:2600, en:'Here you are, Gianni: your parcel. The leftovers, as usual!' },
    { run:() => { g.parcel = true; } },
    { say:'Grazie, Nino. Buonanotte!', who:'gianni', ms:2000, en:'Thanks, Nino. Good night!', clue:'gianni' },
    { walk:'gianni', path:[[1790, 300], [1960, 220], [2060, 220], [2380, 218]], speed:120 },
    { run:() => { L.gianniGone = true; g.parcel = false; save(); renderHUD(); } },
    { wait:800 },
    { walk:'biscuit', path:[[1300, 300], [1790, 320], [TRENO.hatch.spot.x, TRENO.hatch.spot.y]], speed:110 },
    { run:() => { NPC.biscuit.sit = true; NPC.biscuit.face = NPC.biscuit.baseFace = { x:1, y:0 }; l13Clue('beg'); } },
    { say:'Bau?', who:'biscuit', ms:1400, en:'Woof?', silent:true },
    { face:'nino', to:'biscuit' },
    { say:'No, no, piccolo! Basta!', who:'nino', ms:2000, en:'No, no, little one! That\'s enough!' },
    { wait:1200 },
    { run:() => trenoLook(null) },
  ], l13ToNight);
}
/* l13-night: the Bassis and la signora Ferri go to bed; Margaret stays with her tea (and Biscuit at the hatch) */
function l13ToNight(){
  const L = S.l13;
  if (S.tut !== 'l13-day') return;
  setTut('l13-night'); L.phase = 'bed'; l13Clock(24 * 60 + 50);
  l13Beats([
    { run:() => trenoLook(1250) },
    { say:'Ernesto, è tardi! Andiamo a letto.', who:'lina', ms:2200, en:"Ernesto, it's late! Let's go to bed.", clue:'bed' },
    { say:'Buonanotte, {Me}! Buonanotte a tutti!', who:'ernesto', ms:2400, en:'Good night, {Me}! Good night, everyone!' },
    { walk:'lina', path:[[1444, 262], [1120, 262], [1084, 222], [1020, 222]], speed:90, async:true },
    { walk:'ernesto', path:[[1336, 262], [1110, 262], [1078, 216], [1000, 216]], speed:85 },
    { run:() => { L.bassiBed = true; save(); renderHUD(); } },
    { say:'Vado anch\'io. Buonanotte!', who:'ferri', ms:2000, en:"I'm going too. Good night!" },
    { walk:'ferri', path:[[1176, 440], [1110, 262], [1080, 228], [1010, 228]], speed:95 },
    { run:() => { L.ferriBed = true; save(); renderHUD(); trenoLook(null);
      toast(L.askedWhen ? "It's nearly one in the morning. Time for bed: compartment <b>17</b>." : "It's nearly one in the morning. Before bed: when does the train get to Venice tomorrow? <b>Nino</b> will know."); } },
  ]);
}
/* in your bunk: Buonanotte, the light goes out, the completion screen */
function l13Sleep(resumed){
  const L = S.l13;
  if (resumed){ L.slept = true; setTut('l13-done'); save(); setTimeout(openComplete13, 400); return; }
  cutscene([
    { walk:'player', path:[{ x:450, y:330 }], speed:90, face:{ x:-1, y:0 } },
    { say:'Buonanotte!', who:'player', ms:1600 },
    { run:() => toast('<i>“Buonanotte!”</i> · Good night!') },
    { guide:'You switch off the little lamp. The train rocks gently; the wheels go <i>ta-tum, ta-tum</i> in the dark…' },
    { run:() => { const f = $('#fade'); $('#fadeTitle').textContent = 'Buonanotte…'; $('#fadeSub').textContent = 'Somewhere between Padova and the sea'; f.classList.add('on'); } },
    { wait:2400 },
    { run:() => { L.slept = true; save(); $('#fade').classList.remove('on'); } },
  ], { id:'l13-sleep', guide:'', onSkip:() => { L.slept = true; $('#fade').classList.remove('on'); } }).then(() => {
    L.slept = true; setTut('l13-done'); save();
    setTimeout(openComplete13, 400);
  });
}

/* ---------- every 400 ms: a beat waiting for its moment ---------- */
function l13Tick(){
  if (!l13On() || introOpen || traveling) return;
  const free = !l13Busy && !dialogOpen && !modalOpen && !cutsceneOn() && !pickOpen;
  /* arriving in the dining car for the first time: Nino comes to meet you */
  if (free && S.tut === 'l13-dinner' && S.l13.phase === 'arrive' && S.scene === 'treno' && player.x > 1112) l13NinoGreets();
  if (free && S.tut === 'l13-day') l13AfterDay();
}
setInterval(l13Tick, 400);

/* ---------- completion ---------- */
function openComplete13(){
  const L = S.l13, said = (L.said || []).slice(0, 8);
  const quests = QUESTS.filter(q => (questPeek(q.id) || {}).done).map(q => q.n);
  /* the shared lesson-complete screen (engine ui/cards.js) */
  openLessonComplete({ n:13, title:'Lezione 13 completata!', sub:'Il treno della notte · The past with avere',
    story:`The 23:15 to Venice: <b>Permesso!</b> in the corridor, your first steps into the past in compartment 17 (<b>ho visto, ho mangiato, prima, dopo</b>),
        dinner with Margaret and Biscuit, and a whole carriage of new faces: you introduced the two of you, told Lina and Ernesto all about your day, and
        translated for Margaret. Now the train rocks you to sleep. <b>Buonanotte!</b>`,
    sections:[{ title:'Your day, in Italian', html:`<div class="l13-said">${said.length ? said.map(s => `<p>“${esc(s)}”</p>`).join('') : '<p>“Ho preso il treno.”</p>'}</div>` }],
    stats:[[(L.said || []).length, `things you said about your day${quests.length ? ` (from ${quests.length} ${quests.length === 1 ? 'task' : 'tasks'} in town)` : ''}`],
      [l13MetCount() + 1, 'new people at dinner (and one dog)'], [S.sentences, 'sentences said in Italian']],
    next:{ html:'Morning, the lagoon in the windows… and a knock at your door. Margaret, in a panic: Biscuit is gone.', n:14 } });
}
/* tests: __debug.l13At('order' | 'intro' | 'day' | 'ferri' | 'night') puts Lesson 13 at that moment (the handbook done, dinner done
   up to there, in the dining car); __debug.l13Beat('kids' | 'gianni') plays a beat now */
Object.assign(window.__debug, {
  l13At(at){
    if (S.lesson !== 13) LESSON_HOOKS[13].start();
    const L = S.l13;
    Object.assign(L, { boarded:true, rinaldiIn:true, seated:true, phase:'meet', clock:23 * 60 + 50 });
    Object.assign(S, { vocab13:true, practiceDone13:true, vocabCheck13:true });
    TRENO.mine = L13_MINE; bagRemove('biglietto');
    L.met.margaret = true; S.met.margaret = S.known.margaret = true; S.met.nino = S.known.nino = true;
    S.tut = 'l13-dinner';
    if (at === 'order') L.phase = 'order';
    if (['intro', 'day', 'ferri', 'night'].includes(at)){ Object.assign(L, { ordered:{ her:'risotto', me:'pollo' }, served:true, phase:'intro', clock:24 * 60 + 20 }); l13Clue('scrap'); }
    if (['day', 'ferri', 'night'].includes(at)){ L.met = { margaret:true, bassi:true, ferri:true, rinaldi:true }; ['ferri', 'rinaldi', 'ernesto', 'lina'].forEach(id => { S.met[id] = S.known[id] = true; }); L.phase = 'bassi'; S.tut = 'l13-day'; }
    if (['ferri', 'night'].includes(at)){ L.told = { bassi:['biglietto', 'treno', 'tramonto'] }; Object.assign(L, { dopo:'done', yes:'done', qYes:'tramonto', ma:'done', qNo:'chapel', anche:'done', why:'done', reason:'bella', phase:'ferri' }); }
    if (at === 'night'){ Object.assign(L, { ferri:'done' }); S.l6.steps.l13_ferri = TYPED_SCRIPTS.l13_ferri.steps.length; ['ferriDog', 'kids', 'gianni', 'beg', 'phone', 'bed'].forEach(id => l13Clue(id));
      Object.assign(L, { phase:'bed', bassiBed:true, ferriBed:true, gianniGone:true }); S.tut = 'l13-night'; }
    save();
    travelTo('treno', at === 'night' ? { x:855, y:236 } : { x:1234, y:262 }, 'Il Laguna Express', 'Vagone ristorante');
  },
  /* the chapter's lists and every quest's things (tests) */
  l13Data(){ return { vocab:LESSONS[12].vocab, ex:LESSONS[12].exercises, how:LESSONS[12].how, items:l13AllItems() }; },
  l13Beat(k){ if (k === 'kids') l13KidsBeat(); if (k === 'gianni') l13GianniBeat(); },
  /* mark Lesson 12's quests done by their numbers (those that exist): returns the numbers done */
  l13Quests(ns){ QUESTS.filter(q => ns.includes(q.n)).forEach(q => { questRec(q.id); questDone(q.id); }); return l13DoneQuests(); },
  /* the Bassis' conversation from the start, with exactly these quests done (tests: several histories in one page) */
  l13Bassi(ns){
    QUESTS.forEach(q => { const r = S.quests && S.quests[q.id]; if (r && !ns.includes(q.n)) delete S.quests[q.id]; });
    window.__debug.l13Quests(ns);
    const L = S.l13;
    ['dopo', 'yes', 'qYes', 'ma', 'qNo', 'anche', 'why', 'reason', 'askedBack', 'margBack', 'asked'].forEach(k => delete L[k]);
    Object.assign(L, { told:{ bassi:[] }, said:[], phase:'bassi', ferri:L.ferri || 'done' }); S.tut = 'l13-day'; save(); renderHUD();
    return l13DoneQuests();
  },
});
