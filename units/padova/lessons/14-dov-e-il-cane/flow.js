/* Lesson 14 · Dov'è il cane? The flow on the night train, the morning after Lesson 13 (docs/lessons/14-dov-e-il-cane.md: the
   trail, steps 1–9; its "As built (flow)" notes list the states, places and hooks). The data, the scripts and the helpers that
   read a sentence and pick a reply are content.js / trail.js; the notebook is ui/notebook.js; the train is world/treno.js.
   This file EXTENDS the base hook (content.js: vocab, phrases, notebook, doneTut) with Object.assign: never replace it.

   The tutorial states (S.tut) and, within them, S.l14.phase:
     l14-start    compartment 17 at dawn: 'knock' (Margaret knocks, a cutscene) → 'talk' (her conversation, English) → she follows
     l14-barrier  the dining car: il signor Rinaldi (tiles without "where did it go?"): his fast answer, the barrier
     l14-handbook → l14-vocab → l14-practice   chapter 14, its word check, its practice (the notebook switches on)
     l14-dining   Rinaldi and la signora Ferri (tiles): "Sa dov'è andato il cane?" → nothing seen; pressed ("È sicuro?" /
                  "È sicura?"), both point to room 14
     l14-couple   knock on 14: "Chi è?" behind the door (tiles: Siamo io e Margaret, or something polite) → inside: Ernesto (6:00,
                  towards the dining car) and Lina (6:45, towards the front), each time written with the notebook's "A che ora?";
                  their bickering; Margaret: "The chef feeds everyone — let's ask him!" (the Confronta page: optional)
     l14-nino     Nino (tiles): "C'è un cane davanti, con il macchinista!"
     l14-front    'door' (knock on the cab: barking; Gianni behind the door, tiles: "Scusi il disturbo, permesso?" → "No, no! Esco
                  io!") → 'out' → a cutscene: he steps out, pulls the door to, and a dog slips past him (Brigante) → 'typed' (the
                  typed translation for Margaret: not my dog, what he begs) → 'promise' (Gianni, tiles: "Non lo dico a nessuno." →
                  "Chieda al cuoco!")
     l14-chef     back to Nino (tiles): "Ci sono due cani!" (or the lady's dog): "Ha guardato la cena, voleva un osso!"
     l14-memory   Ernesto and Lina come after you: "Mi sono ricordato!": the room next to theirs (the notebook's where)
     l14-reveal   'knock' (knock on 15: barking, giggling) → 'door' (la signora Ferri in the doorway, tiles) → 'in' (the children
                  and Biscuit: "Abbiamo sempre voluto un cane!")
     l14-done     'reunion' (the typed translation for Margaret to the children, tu) → 'goodbye' (la signora Ferri, tiles) →
                  'arrive' (Venezia Santa Lucia over the lagoon) → 'end' (the completion screen)
   Margaret follows the player from her knock on (the follower hook, like Mark); in a conversation her lines sit on the
   player's side (companion lines: the translator rule).

   Saved: S.l14 = { flow:1, phase, clock (minutes), met, follow, barrier, notebook, talked:{ 'id:step':n }, asked:{ who:[keys] },
   nothing:{ rinaldi, ferri } (they said they saw nothing), pointed:{ rinaldi, ferri }, mg:{ key:true } (Margaret's lines said), inside14,
   bothNoted, deduced (the Confronta page's answer: two dogs), ninoFront (Nino: a dog at the front), cabKnocked, cabOpen (Gianni and
   Brigante out in the corridor), cabShut (back in),
   promised, chef, memoryCome, memoryHeard, memoryDone, revealReady, found, reunion, goodbye, arrived, agree (wrong endings),
   slips (the driver's secret nearly told), ieriFilled (S.l13.seen was empty: filled with every clue) }. Tests: __dbg().l14. */

const L14_MINE = 17;
const L14_ORDER = ['l14-start', 'l14-barrier', 'l14-handbook', 'l14-vocab', 'l14-practice', 'l14-dining', 'l14-couple', 'l14-nino', 'l14-front', 'l14-chef', 'l14-memory', 'l14-reveal', 'l14-done'];
const freshL14 = () => ({ flow:1, phase:'knock', clock:7 * 60 + 20, met:false, follow:false, barrier:false, notebook:false, talked:{}, asked:{},
  nothing:{ rinaldi:false, ferri:false }, pointed:{ rinaldi:false, ferri:false }, mg:{}, inside14:false, bothNoted:false, deduced:false, ninoFront:false,
  cabKnocked:false, cabOpen:false, cabShut:false, promised:false,
  chef:false, memoryCome:false, memoryHeard:false, memoryDone:false, revealReady:false, found:false, reunion:false, goodbye:false, arrived:false,
  agree:0, slips:0, ieriFilled:false });
const l14On = () => S.lesson === 14 && !!S.l14 && S.l14.flow === 1;
const l14At = t => L14_ORDER.indexOf(S.tut) >= L14_ORDER.indexOf(t);         // the lesson has reached state t
const l14HHMM = m => `${Math.floor(m / 60) % 24}:${String(m % 60).padStart(2, '0')}`;
function l14Clock(m){ if (!l14On()) return; S.l14.clock = Math.max(S.l14.clock, m); save(); renderHUD(); }
const L14_CASTIDS = ['margaret', 'rinaldi', 'ferri', 'ernesto', 'lina', 'gianni', 'nino', 'lucaferri', 'sofiaferri'];
const l14Who = n => n.l14who || n.id;                          // the cast key of L14.scripts (the children: luca, sofia)
const L14C = { pending:null, say:[], busy:null };               // the next conversation's kind; Margaret's bubbles waiting; a beat running
const L14_ANNOUNCE = L14_SCRIPTS['l14-done'].announce;

/* the typed translations (content.js L14_TYPED), registered for the train's people: each opens only at its moment (scene) */
{
  const D = L14_TYPED.margaret_door;
  const R = L14_TYPED.margaret_reunion;
  Object.assign(TYPED_SCRIPTS, {
    /* outside the cab, after the dog slipped past Gianni (phase 'typed'): "Non è il mio cane!", then what he begs (a CHOICE) */
    margaret_door:{ ...D, npc:'gianni', companion:'margaret',
      get scene(){ return l14On() && S.tut === 'l14-front' && S.l14.phase === 'typed' ? 'treno' : '-'; },
      done(){ const L = S.l14; L.phase = 'promise'; S.met.gianni = S.known.gianni = true; save(); enqueue(() => nbNote('gianni-brigante')); renderHUD(); } },
    margaret_reunion:{ ...R, npc:'sofiaferri', companion:'margaret',
      get scene(){ return l14On() && S.tut === 'l14-done' && S.l14.phase === 'reunion' ? trenoCabinScene(15) : '-'; },
      done(){
        const L = S.l14; L.reunion = true; L.phase = 'goodbye'; save();
        enqueue(() => { if (convo) worldSay('biscuit', 'Gnam!', { ms:1200, silent:true }); });
        L14_MARGARET['l14-done'].forEach(t => companionLine(t));
        renderHUD();
      } },
  });
}

/* ---------- places ---------- */
let L14_SPOT_C = null;
const L14S = () => L14_SPOT_C || (L14_SPOT_C = {
  rinaldi:{ ...trenoSeat('S2', 'w'), seated:true }, ferri:{ ...trenoSeat('N3', 'w'), seated:true },
  nino:{ x:1856, y:420, face:{ x:-1, y:0 } },
  ernesto14:{ x:446, y:300, face:{ x:0.6, y:0.8 } }, lina14:{ x:590, y:268, face:{ x:-0.6, y:0.8 } },
  ernestoN2:{ ...trenoSeat('N2', 'w'), seated:true }, linaN2:{ ...trenoSeat('N2', 'e'), seated:true },
  /* outside the cab (he came out and pulled the door to): Gianni in front of it, Brigante at his feet; the player a step back */
  gianni:{ x:2378, y:230, face:{ x:-1, y:0 } }, brigante:{ x:2350, y:266, face:{ x:-0.6, y:-0.6 }, sit:true }, cabBack:{ x:2316, y:226 },
  ferriDoor:{ x:635, y:262, face:{ x:0, y:-1 } }, ferri15:{ x:540, y:300, face:{ x:-0.8, y:0.4 } },
  luca:{ x:366, y:292, face:{ x:0.4, y:1 } }, sofia:{ x:372, y:396, face:{ x:0.5, y:-0.4 } }, biscuit:{ x:384, y:346, face:{ x:1, y:0 }, sit:true },
  mgDoor:{ x:480, y:500, face:{ x:0, y:-1 } }, mgIn:{ x:500, y:470, face:{ x:0.3, y:-1 } },
});
function l14Put(id, spot){
  const n = NPC[id]; if (!n || n.cutWalk || !spot || isFollower(n)) return;
  n.x = spot.x; n.y = spot.y; if (spot.face){ n.baseFace = { ...spot.face }; if (!dialogOpen || !convo || convo.npc !== n) n.face = { ...spot.face }; }
  n.seated = !!spot.seated; if (n.animal && !n.follows) n.sit = spot.sit !== undefined ? spot.sit : n.sit;
}
function l14Place(){
  const L = S.l14, sc = S.scene;
  if (L14C.busy === 'beat') return;
  const M = NPC.margaret; if (L.follow){ M.seated = false; } else if (sc === 'cabina17') l14Put('margaret', L.phase === 'knock' ? L14S().mgDoor : L14S().mgIn);
  l14Put('rinaldi', L14S().rinaldi);
  if (sc === 'treno' && !l14At('l14-chef')) l14Put('ferri', L14S().ferri);
  if (sc === 'treno' && S.tut === 'l14-reveal' && L.phase === 'door') l14Put('ferri', L14S().ferriDoor);
  if (sc === trenoCabinScene(15)) l14Put('ferri', L14S().ferri15);
  l14Put('nino', L14S().nino);
  if (!L.memoryCome){ l14Put('ernesto', L14S().ernesto14); l14Put('lina', L14S().lina14); }
  else if (L.memoryDone){ l14Put('ernesto', L14S().ernestoN2); l14Put('lina', L14S().linaN2); }
  if (L.cabOpen && !L.cabShut){ l14Put('gianni', L14S().gianni); if (!NPC.brigante.cutWalk) l14Put('brigante', L14S().brigante); }
  l14Put('lucaferri', L14S().luca); l14Put('sofiaferri', L14S().sofia);
  if (!NPC.biscuit.follows) l14Put('biscuit', L14S().biscuit);
}

/* ---------- Margaret: her lines (English) ---------- */
/* in a conversation, on the player's side (the translator rule) */
function l14Mg(t){ npcLine(fill(t), null, { english:true, companion:true, speaker:NPC.margaret }); }
/* once per key: S.l14.mg[key] */
function l14MgOnce(key, t){ const L = S.l14; if (L.mg[key]) return false; L.mg[key] = true; save(); l14Mg(t); return true; }
/* in the world: a bubble over her (when nothing else is open) */
function l14MgSay(t, ms = 3200){ L14C.say.push({ t, ms }); }
const L14_MG_STATUS = () => {
  const L = S.l14, M = L14_MARGARET, t = S.tut;
  if (t === 'l14-barrier') return L.barrier ? M['l14-barrier'][1] : M['l14-start-after'];
  if (['l14-handbook', 'l14-vocab', 'l14-practice'].includes(t)) return M['l14-barrier'][1];
  if (t === 'l14-dining') return L.pointed.rinaldi || L.pointed.ferri ? M['l14-dining'][0] : "Somebody must have seen him. Ask them, dear: you're my voice.";
  if (t === 'l14-couple') return L.bothNoted ? M['l14-couple'][0] : M['l14-dining'][1];
  if (t === 'l14-nino') return M['l14-couple'][1];
  if (t === 'l14-front') return L.phase === 'promise' ? 'Poor man. He looks terrified. Say something kind to him, dear.' : M['l14-nino'][0];
  if (t === 'l14-chef') return M['l14-front'][3];
  if (t === 'l14-memory') return L.memoryHeard ? M['l14-memory'][0] : M['l14-front'][3];
  if (t === 'l14-reveal') return M['l14-memory'][0];
  if (t === 'l14-done') return L.reunion ? M['l14-done'][1] : M['l14-done'][0];
  return "Oh, I do hope he's all right.";
};

/* ---------- the hook (extends the base hook of content.js) ---------- */
Object.assign(LESSON_HOOKS[14], {
  bookPulse:['l14-handbook', 'l14-vocab', 'l14-practice'],
  objective:{
    'l14-start':() => S.l14 && S.l14.phase === 'knock' ? 'Someone is knocking…' : 'Help Margaret',
    'l14-barrier':'Ask about Biscuit in the dining car',
    'l14-handbook':'Open your handbook',
    'l14-vocab':'Learn the Lesson 14 words',
    'l14-practice':'Finish the Lesson 14 practice',
    'l14-dining':() => `Ask in the dining car · ${l14Pointed()}/2`,
    'l14-couple':() => !S.l14 ? '' : !S.l14.inside14 ? 'Knock on room 14' : `Question Ernesto and Lina · ${l14Sightings()}/2`,
    'l14-nino':'Ask Nino, the chef',
    'l14-front':() => !S.l14 ? '' : S.l14.phase === 'promise' ? 'Answer Gianni' : S.l14.phase === 'typed' ? 'Translate for Margaret' : "Knock on the driver's door",
    'l14-chef':'Back to Nino, the chef',
    'l14-memory':'Ernesto has remembered something',
    'l14-reveal':'Knock on the room next to 14',
    'l14-done':() => !S.l14 ? '' : S.l14.phase === 'reunion' ? 'Translate for Margaret' : S.l14.phase === 'goodbye' ? 'Say goodbye' : S.l14.phase === 'arrive' ? 'Venezia Santa Lucia' : 'Lezione 14 completata',
  },
  guide:{
    'l14-start':near => {
      const L = S.l14; if (!L) return '';
      if (L.phase === 'knock') return '';
      return near === NPC.margaret ? 'Press <kbd>E</kbd> to talk to Margaret.' : 'Margaret is at your door.';
    },
    'l14-barrier':near => {
      const L = S.l14; if (!L) return '';
      if (S.scene === trenoCabinScene(L14_MINE)) return 'Margaret is coming with you. The dining car, where she last saw Biscuit, is the next car along: out of your compartment, then right (east).';
      if (S.scene !== 'treno' || player.x < 1080) return 'To the dining car, <i>il vagone ristorante</i>: the next car along, through the sliding doors. Margaret follows you.';
      return near === NPC.rinaldi ? 'Press <kbd>E</kbd> to talk to him. A stranger: the polite forms.'
        : 'Il signor Rinaldi, on the phone at the back of the dining car, was here last night. Ask him about the dog.';
    },
    'l14-handbook':() => {
      if (modalOpen && sheet.classList.contains('book') && hbLesson === 14) setTut(vocabCheckDone(14) ? 'l14-practice' : 'l14-vocab');
      return 'You can ask what someone <i>saw</i>, but not where the dog <i>went</i>. Open the handbook (<kbd>H</kbd>): <b>Lezione 14 · Dov\'è il cane?</b>';
    },
    'l14-vocab':'Read Lezione 14 (the past with <i>essere</i>: going, coming back, going out). Then learn its words: the <b>Words</b> tab, the flashcards and the quiz. The <b>Practice</b> opens after that.',
    'l14-practice':'Words learned! Now finish the <b>Practice</b> tab of Lezione 14.',
    'l14-dining':near => {
      if (near === NPC.rinaldi || near === NPC.ferri) return 'Press <kbd>E</kbd>. Strangers: <i>Lei</i>. Ask if they know where the dog went.';
      const left = ['rinaldi', 'ferri'].filter(k => !S.l14.pointed[k]).map(k => k === 'rinaldi' ? '<b>il signor Rinaldi</b> (on the phone)' : '<b>la signora Ferri</b> (by the window)');
      return `Ask in the dining car: ${left.join(' and ')}. Your notebook (<b>Taccuino</b>, <kbd>J</kbd>) keeps what you understand.`;
    },
    'l14-couple':near => {
      const L = S.l14; if (!L) return '';
      if (!L.inside14) return S.scene === 'treno' && trenoDoorSpotNear(14) ? 'Press <kbd>E</kbd> to knock on room 14.'
        : 'Two people sent you to <b>room 14</b>, Ernesto and Lina\'s, in the sleeping car. Go and knock.';
      if (S.scene !== trenoCabinScene(14)) return 'Ernesto and Lina are in room 14.';
      if (near === NPC.ernesto || near === NPC.lina) return 'Press <kbd>E</kbd>. Ask where the dog went, and <i>at what time</i>: the notebook asks you for the time you heard.';
      return 'Ernesto and Lina both saw a dog this morning. Question each of them: where did it go, and at what time?';
    },
    'l14-nino':near => {
      if (near === NPC.nino) return 'Press <kbd>E</kbd> to talk to Nino, the chef. Ask if he knows where the dog went.';
      return 'Margaret wants to ask <b>Nino</b>, the chef, in the dining car (at the counter, by the kitchen). Your notebook\'s <b>Confronta</b> page (<kbd>J</kbd>) puts the two sightings side by side.';
    },
    'l14-front':near => {
      const L = S.l14; if (!L) return '';
      if (L.phase === 'promise') return near === NPC.gianni ? 'Press <kbd>E</kbd>. Gianni is begging you.' : 'Gianni, the driver, is begging you to keep his secret. Answer him.';
      if (L.phase === 'typed') return near === NPC.gianni ? 'Press <kbd>E</kbd>: Margaret needs you to translate.' : 'The driver is out in the corridor. Talk to him: Margaret needs you to translate.';
      if (S.scene === 'treno' && trenoDoorSpotNear('cab')) return 'Press <kbd>E</kbd> to knock on the driver\'s door.';
      return 'A dog at the front, with the driver… The driver\'s cab is at the very end of the train, past the dining car. Margaret is coming with you.';
    },
    'l14-chef':near => near === NPC.nino ? 'Press <kbd>E</kbd> to talk to Nino. Tell him what you found out at the cab.' : 'Gianni said: ask the chef. Back to <b>Nino</b>, in the dining car. He thinks there was only one dog…',
    'l14-memory':() => 'Ernesto is calling you…',
    'l14-reveal':() => S.l14 && S.l14.phase === 'door' ? 'La signora Ferri is at the door. Ask her about the dog.'
      : S.scene === 'treno' && trenoDoorSpotNear(15) ? 'Press <kbd>E</kbd> to knock.' : 'The barking came from the room <b>next to room 14</b>. Which room is that? Go and knock.',
    'l14-done':near => {
      const L = S.l14; if (!L) return '';
      if (L.phase === 'reunion') return near === NPC.sofiaferri || near === NPC.lucaferri ? 'Press <kbd>E</kbd>: Margaret wants to talk to the children. Translate for her (typing). Children: <i>tu</i>.' : 'Margaret wants to talk to the children: translate for her.';
      if (L.phase === 'goodbye') return near === NPC.ferri ? 'Press <kbd>E</kbd> to say goodbye to la signora Ferri.' : 'Venice is close. Say goodbye to la signora Ferri.';
      if (L.phase === 'arrive') return '';
      return 'Lezione 14 completata! Biscuit is back with Margaret, and the train is in <b>Venezia Santa Lucia</b>.'
        + (hookFor(15) && hookFor(15).start && LESSONS[14] ? ` <button class="gbtn" data-action="l15">Start Lezione 15 · ${esc(LESSONS[14].title)}</button>` : ' Lezione 15, <i>Venezia</i>, is coming soon.');
    },
  },
  markers:{
    get 'l14-start'(){ return S.l14 && S.l14.phase === 'talk' && !S.l14.met ? 'margaret' : null; },
    'l14-barrier':'rinaldi',
    get 'l14-dining'(){ return !S.l14 ? null : !S.l14.pointed.rinaldi ? 'rinaldi' : !S.l14.pointed.ferri ? 'ferri' : null; },
    get 'l14-couple'(){ return !S.l14 || !S.l14.inside14 || S.l14.bothNoted ? null : !nbComplete('ernesto-visto') ? 'ernesto' : !nbComplete('lina-visto') ? 'lina' : null; },
    'l14-nino':'nino',
    get 'l14-front'(){ return S.l14 && (S.l14.phase === 'promise' || S.l14.phase === 'typed') ? 'gianni' : null; },
    'l14-chef':'nino',
    get 'l14-memory'(){ return S.l14 && S.l14.memoryCome ? 'ernesto' : null; },
    get 'l14-reveal'(){ return S.l14 && S.l14.phase === 'door' ? 'ferri' : null; },
    get 'l14-done'(){ return !S.l14 ? null : S.l14.phase === 'reunion' ? 'sofiaferri' : S.l14.phase === 'goodbye' ? 'ferri' : null; },
  },

  start(){
    if (modalOpen) closeModal();
    if (cutsceneOn()) cutsceneEnd();
    S.lesson = 14; S.l5follow = false; S.brunoFollow = false; S.l14 = freshL14(); S.daytime = 'morning';
    if (S.l12) S.l12.free = true;
    /* the notebook's "Ieri sera…": the dinner clues of Lesson 13 (S.l13.seen); none recorded (an older save): every one */
    if (!S.l13 || typeof S.l13 !== 'object') S.l13 = {};
    if (!Array.isArray(S.l13.seen) || !S.l13.seen.length){ S.l13.seen = L14_IERI_SERA.map(x => x.id).concat(['rinaldi-telefono']); S.l14.ieriFilled = true; }
    delete S.notebook;
    TRENO.mine = L14_MINE; TRENO.sky = null; TRENO.moving = true; TRENO.open = {}; TRENO.openTo = {};
    delete S.l6.steps.margaret_door; delete S.l6.steps.margaret_reunion;   // (skipL6 marks every typed script as done)
    ['biscuit', 'brigante'].forEach(id => dogFollow(id, null));
    L14C.pending = null; L14C.say = []; L14C.busy = null;
    setTut('l14-start'); lastGuide = '';
    travelTo(trenoCabinScene(L14_MINE), { x:540, y:330 }, 'Il mattino dopo', 'Cabina 17 · Il Laguna Express');
    setTimeout(() => toast('<b>Lezione 14 · Dov\'è il cane?</b> has started'), 1800);
  },
  /* the end of Lesson 14: Biscuit found, the train in Venezia Santa Lucia. The world is left in the piazza (like the skips of
     Lessons 12 and 13): the next lesson's start puts the player where it begins. */
  skip(){
    const l14 = Object.assign(freshL14(), { phase:'end', clock:8 * 60 + 35, met:true, barrier:true, notebook:true, nothing:{ rinaldi:true, ferri:true }, pointed:{ rinaldi:true, ferri:true },
      inside14:true, bothNoted:true, deduced:true, ninoFront:true, cabKnocked:true, cabOpen:true, cabShut:true, promised:true, chef:true, memoryCome:true, memoryHeard:true, memoryDone:true,
      revealReady:true, found:true, reunion:true, goodbye:true, arrived:true });
    Object.assign(S, { lesson:14, vocab14:true, practiceDone14:true, vocabCheck14:true, tut:'l14-done', scene:'piazza', l5follow:false, brunoFollow:false, l14, daytime:'afternoon' });
    ['margaret', 'gianni', 'nino', 'ferri', 'rinaldi', 'ernesto', 'lina', 'lucaferri', 'sofiaferri'].forEach(id => { S.met[id] = S.known[id] = true; });
    S.l6.steps.margaret_door = TYPED_SCRIPTS.margaret_door.steps.length; S.l6.steps.margaret_reunion = TYPED_SCRIPTS.margaret_reunion.steps.length;
    (PX[14] = freshPX()).i = LESSONS[13].exercises.length;
  },
  restore(){
    if (S.lesson < 14) return;
    if (!S.l14 || typeof S.l14 !== 'object') S.l14 = freshL14();
    const f = freshL14();
    Object.keys(f).forEach(k => { if (S.l14[k] === undefined) S.l14[k] = f[k]; });
    ['talked', 'asked', 'nothing', 'pointed', 'mg'].forEach(k => { if (!S.l14[k] || typeof S.l14[k] !== 'object') S.l14[k] = f[k]; });
    S.l14.flow = 1;
    TRENO.mine = L14_MINE;
    if (S.lesson !== 14) return;
    const L = S.l14;
    if (S.tut === 'l14-practice' && !vocabCheckDone(14)) S.tut = 'l14-vocab';
    /* saved in the middle of a scripted moment: start it again, or put things where they would be after it */
    if (S.tut === 'l14-start' && !L.met) L.phase = 'knock';
    if (S.tut === 'l14-memory' && !L.memoryHeard) L.memoryCome = false;
    if (L.memoryHeard) L.memoryDone = true;
    if (S.tut === 'l14-reveal' && L.phase === 'knock' && L.found) L.phase = 'in';
    if (S.tut === 'l14-reveal' && L.phase === 'in'){ S.tut = 'l14-done'; L.phase = 'reunion'; L.found = true; }
    if (S.tut === 'l14-done' && L.phase === 'arrive'){ L.arrived = true; L.phase = 'end'; }
    if (L.goodbye || L.phase === 'end') dogFollow('biscuit', 'margaret');
    /* saved while Gianni was coming out (the cutscene): he is out, the typed translation next; saved between "Esco io!" and the
       cutscene: it plays again when the door is knocked on (phase 'door') */
    /* a save from before the reorder: both sightings written in room 14 (it waited for the Confronta page) → Nino; the cab done */
    if (S.tut === 'l14-couple' && L.bothNoted) S.tut = 'l14-nino';
    if (S.tut === 'l14-front' && L.phase === '' && L.promised) S.tut = 'l14-chef';
    if (S.tut === 'l14-front' && L.phase === 'out' && !L.cabOpen) L.phase = 'door';
    if (S.tut === 'l14-front' && L.cabOpen && L.phase === 'door') L.phase = 'typed';
    /* the doors standing open (TRENO.open is not saved) */
    if (S.tut === 'l14-reveal' && L.phase === 'door') TRENO.open[15] = TRENO.openTo[15] = 1;
  },

  /* the windows, the clock, the train stopping */
  trenoSky(){ return l14On() ? (S.tut === 'l14-done' ? 'lagoon' : 'dawn') : null; },
  trenoMoving(){ return l14On() && S.l14.arrived ? false : undefined; },
  gameClock(){ return l14On() && S.l14.phase !== 'end' ? { h:Math.floor(S.l14.clock / 60) % 24, m:S.l14.clock % 60 } : null; },
  stamps(){
    if (!S.l14 || !S.l14.found) return [];
    return [{ id:'l14-biscuit', title_it:'Biscuit ritrovato!', title_en:'Biscuit found', icon:'🐶', color:'#a8743c', when:'08:20 · mattina' }];
  },
  follower(){ return l14On() && S.l14.follow ? NPC.margaret : null; },

  /* who is where */
  sceneOf(n){
    if (!l14On()) return null;
    const L = S.l14, id = n.id, t = S.tut;
    if (id === 'margaret') return L.follow ? S.scene : t === 'l14-start' && L.phase === 'talk' ? trenoCabinScene(L14_MINE) : trenoCabinScene(11);
    if (id === 'ferri'){
      if (t === 'l14-reveal' && L.phase === 'door') return 'treno';
      return l14At('l14-chef') ? trenoCabinScene(15) : 'treno';
    }
    if (id === 'ernesto' || id === 'lina') return L.memoryCome ? 'treno' : trenoCabinScene(14);
    if (id === 'gianni' || id === 'brigante') return L.cabOpen && !L.cabShut ? 'treno' : 'away';
    if (id === 'biscuit') return L.goodbye ? (L.follow ? S.scene : 'treno') : trenoCabinScene(15);
    if (id === 'rinaldi' || id === 'nino') return 'treno';
    return null;
  },
  place(){ if (l14On()) l14Place(); },
  visitorTalk(n){ return l14On() && (n.id === 'lucaferri' || n.id === 'sofiaferri') && l14At('l14-reveal') && S.scene === trenoCabinScene(15) ? true : null; },
  redirect(n){ return l14On() && n.id === 'lucaferri' && S.tut === 'l14-done' && S.l14.phase === 'reunion' ? NPC.sofiaferri : null; },
  door(d){ return l14Door(d); },
  knock(id){ return l14Knock(id); },

  talk(npc){ return l14Talk(npc); },
  bank(npc, groups, names){ return l14Bank(npc, groups, names); },
  react(id, n, st, add, out, ints, k){ return l14React(id, n, st, add, out, ints, k); },
  afterTurn(n, out){ return l14After(n, out); },
  hint(n, st){ return l14Hint(n, st); },
  onClose(closedId, closedDone, wasCut){ return l14OnClose(closedId, closedDone, wasCut); },

  onVocab(){ if (['l14-barrier', 'l14-handbook', 'l14-vocab'].includes(S.tut) && S.l14 && S.l14.barrier) setTut('l14-practice'); },
  onPractice(){
    if (!l14On() || !S.l14.barrier || !['l14-barrier', 'l14-handbook', 'l14-vocab', 'l14-practice'].includes(S.tut)) return;
    l14ToDining();
  },
  /* the Confronta page's question: nothing waits on it (the trail goes to the chef either way); "two dogs" is a hunch the cab
     confirms. Margaret says what she thinks of the player's answer, once. */
  onNotebookDeduce(opt, r){
    if (!l14On() || !S.l14.bothNoted) return;
    const L = S.l14; L.deduced = !!r.correct; save();
    if (r.first && ['l14-couple', 'l14-nino', 'l14-front'].includes(S.tut) && !L.cabOpen)
      l14MgSay(r.correct ? 'Two dogs? Goodness, on one train! Well, the chef will know.' : 'The same dog, both ways? Maybe. The chef will know.');
  },
  cutsceneResume(c){
    if (!l14On()) return false;
    const L = S.l14;
    if (c.id === 'l14-knock'){ L.phase = 'knock'; save(); return true; }
    if (c.id === 'l14-memory'){ L.memoryCome = false; save(); return true; }
    if (c.id === 'l14-slip'){ L.cabOpen = true; L.phase = 'typed'; save(); return true; }
    if (c.id === 'l14-cab'){ L.cabKnocked = true; save(); return true; }
    if (c.id === 'l14-reveal'){ if (L.found){ S.tut = 'l14-done'; L.phase = 'reunion'; } else L.phase = 'knock'; save(); return true; }
    if (c.id === 'l14-arrive'){ L.arrived = true; L.phase = 'end'; save(); setTimeout(openComplete14, 600); return true; }
    return /^l14-/.test(c.id);
  },
  dbgLesson(n){
    if (n !== 14 || !S.l14) return null;
    const C = convo && convo.l14 ? convo.l14 : null, M = NPC.margaret;
    return { time:l14HHMM(S.l14.clock), busy:L14C.busy, following:followerNpc() === M, margaret:{ scene:sceneOf(M), at:[Math.round(M.x), Math.round(M.y)] },
      convo:C ? { kind:C.kind, step:C.step, npc:convo.npc.id, who:C.who } : null, script:convo && convo.scriptKey ? { key:convo.scriptKey, step:convo.step } : null,
      companion:convo && convo.companion ? convo.companion.id : null, sightings:l14Sightings(), ieri:(l14NotebookSpec().ieriSera || []).filter(x => x.seen).map(x => x.id) };
  },
});
const l14Pointed = () => S.l14 ? ['rinaldi', 'ferri'].filter(k => S.l14.pointed[k]).length : 0;
const l14Sightings = () => ['ernesto-visto', 'lina-visto'].filter(id => nbComplete(id)).length;
const trenoDoorSpotNear = id => { const p = trenoDoorSpot(id); return !!p && Math.hypot(player.x - p.x, player.y - p.y) < 40; };

/* the practice is done: back to the dining car, with the past of essere and the notebook */
function l14ToDining(){
  const L = S.l14; L.notebook = true; setTut('l14-dining'); l14Clock(7 * 60 + 40); save(); renderHUD();
  toast('New tiles: <b>Sa …?</b>, <b>Dov\'è andato?</b>, <b>È sicuro?</b>, <b>A che ora?</b>… And your notebook, the <b>Taccuino</b> (<kbd>J</kbd>): what you understand is written there.');
}

/* ---------- doors: the bunk, the outside door ---------- */
function l14Door(d){
  if (!l14On()) return false;
  if (d.id === 'cabina-letto' && trenoCabinOf() === L14_MINE){ toast('<b>La cuccetta</b>: not now. Biscuit is missing!'); return true; }
  if (d.id === 'tr-porta'){
    if (S.l14.arrived && hookFor(15) && hookFor(15).start){ hookFor(15).start(); return true; }      // (out onto the platform: Lezione 15)
    toast(S.l14.arrived ? 'Venezia Santa Lucia! The lagoon, the Grand Canal… (<b>Lezione 15 · Venezia</b> is coming soon.)' : 'The outside door is locked while the train is moving. Next stop: Venezia Santa Lucia.'); return true; }
  return false;
}

/* ---------- knocking ---------- */
function l14Knock(id){
  if (!l14On()) return false;
  const L = S.l14, t = S.tut;
  if (id === L14_MINE) return false;                         // (your own door: in you go)
  const voice = (it, en, o = {}) => setTimeout(() => { if (S.scene === 'treno') trenoDoorSay(id, it, { ms:2600, en, ...o }); }, 900);
  if (id === 14){
    if (t === 'l14-couple' && !L.inside14){ trenoKnockFx(14); l14DoorConvo(14); return true; }
    if (L.inside14 && !L.memoryCome){ trenoKnockFx(14); voice('Avanti, avanti!', 'Come in, come in!', { pitch:0.74 }); setTimeout(() => trenoDoorOpen(14, true).then(() => trenoEnter(14, { title:'Cabina 14', sub:'Ernesto e Lina' })), 1400); return true; }
    if (!L.memoryCome){ trenoKnockFx(14); voice('Sì? Un momento… non siamo pronti!', "Yes? One moment… we're not ready!", { pitch:1.22 }); return true; }
    return false;
  }
  if (id === 'cab'){
    if (t === 'l14-front' && L.phase === 'door' && !L.cabOpen){ l14CabKnock(); return true; }
    if (t === 'l14-front' && L.phase === 'out' && !L.cabOpen){ trenoKnockFx('cab'); setTimeout(l14CabSlip, 600); return true; }
    if (L.cabOpen && !L.cabShut) return true;
    trenoKnockFx('cab'); voice('Occupato! Sto guidando!', "Busy! I'm driving!", { pitch:0.75 }); return true;
  }
  if (id === 15){
    if (t === 'l14-reveal' && L.phase === 'knock'){ l14RevealKnock(); return true; }
    if (L.found){ trenoKnockFx(15); voice('Avanti!', 'Come in!', { pitch:1.6 }); setTimeout(() => trenoDoorOpen(15, true).then(() => trenoEnter(15, { title:'Cabina 15', sub:'Luca e Sofia' })), 1300); return true; }
    trenoKnockFx(15);
    if (l14At('l14-chef')) voice('Un momento… No, scusi: i bambini dormono!', "One moment… No, sorry: the children are asleep!", { pitch:1.12 });
    else voice('Shh! … Non c\'è nessuno!', "Shh! … There's nobody here!", { pitch:1.6 });
    return true;
  }
  if (id === 13 && t === 'l14-reveal'){ trenoKnockFx(13); setTimeout(() => toast('Compartment 13. Nobody answers: it\'s empty. Room 14 has two neighbours…'), 1200); return true; }
  return false;
}
/* room 14 (and the children's room): a conversation through the door */
function l14DoorConvo(id){
  const sc = L14_SCRIPTS['l14-couple'].door;
  setTimeout(() => {
    if (!l14On() || frozen() || S.scene !== 'treno') return;
    trenoDoorSay(id, sc.answer.it, { ms:3200, pitch:NPC.lina.pitch, silent:true });
    L14C.pending = { kind:'door', door:id };
    openConvo(NPC.ernesto);
  }, 1000);
}
/* the driver's door: knocking, barking (Margaret hears it, the first time), then Gianni behind the door (tiles, kind 'cab') */
function l14CabKnock(){
  const L = S.l14, open = () => { L14C.busy = null; if (!dialogOpen && l14On()){ L14C.pending = { kind:'cab' }; openConvo(NPC.gianni); } };
  if (L.cabKnocked){ trenoKnockFx('cab'); setTimeout(open, 1100); return; }
  L14C.busy = 'cab';
  cutscene([
    { run:() => trenoKnockFx('cab') },
    { wait:900 },
    { run:() => trenoDoorSay('cab', L14_SCRIPTS['l14-front'].door.bark, { ms:1800, pitch:0.7, en:'Woof! Woof!' }) },
    { wait:1300 },
    { face:'margaret', to:'player' },
    { say:L14_MARGARET['l14-front'][0], who:'margaret', silent:true, ms:2600 },
  ], { id:'l14-cab', guide:'<i>Toc toc!</i> … and behind the door, a dog barks!' }).then(() => { L.cabKnocked = true; save(); open(); });
}
/* "No, no! Esco io!": Gianni comes out and pulls the door to behind him… and a big dark dog slips past him into the car, runs
   off a few steps, and back to his feet. Not Biscuit. Then Margaret's typed translation (TYPED_SCRIPTS.margaret_door). */
function l14CabSlip(){
  const L = S.l14, g = NPC.gianni, b = NPC.brigante, D = L14_SCRIPTS['l14-front'].door, sp = L14S();
  if (!l14On() || L.cabOpen) return;
  L14C.busy = 'beat';
  const tr = (l, en) => `<i>“${esc(l)}”</i> · ${esc(en)}`;
  cutscene([
    { walk:'player', to:sp.cabBack, speed:110 },
    { face:'player', to:{ x:TRENO.cabDoor.x, y:TRENO.cabDoor.y } },
    { run:() => trenoDoorOpen('cab', true) },
    { run:() => { L.cabOpen = true; save(); g.x = TRENO.cabDoor.x + 12; g.y = TRENO.cabDoor.y + 6; g.face = { x:-1, y:0 }; b.x = TRENO.cabDoor.x + 16; b.y = TRENO.cabDoor.y + 22; b.sit = false; renderHUD(); } },
    { walk:'gianni', to:{ x:sp.gianni.x, y:sp.gianni.y }, speed:60 },
    { guide:'Gianni steps out and pulls the door to behind him… but something slips past his legs!' },
    { walk:'brigante', path:[[TRENO.cabDoor.x - 10, 252], [2330, 290], [2250, 318], [2186, 304]], speed:230, async:true },
    { run:() => { trenoDoorOpen('cab', false); } },
    { wait:500 },
    { say:'Bau! Bau!', who:'brigante', silent:true, ms:1300 },
    { face:'margaret', to:'brigante' },
    { say:'Biscuit?!', who:'margaret', silent:true, ms:1300 },
    { guide:tr(D.call.it, D.call.en) },
    { say:D.call.it, who:'gianni' },
    { walk:'brigante', path:[[2260, 300], [sp.brigante.x, sp.brigante.y]], speed:200 },
    { run:() => { b.sit = true; b.face = { ...sp.brigante.face }; renderHUD(); } },
    { face:'gianni', to:'player' },
    { guide:tr(D.fluster.it, D.fluster.en) },
    { say:D.fluster.it, who:'gianni' },
    { say:"No… that's not Biscuit.", who:'margaret', silent:true, ms:1800 },
  ], { id:'l14-slip', guide:'' }).then(() => {
    L14C.busy = null; g.cutWalk = false; b.cutWalk = false;
    L.cabOpen = true; L.phase = 'typed'; save();
    l14Put('gianni', sp.gianni); l14Put('brigante', sp.brigante); renderHUD(); l14Clock(8 * 60 + 2);
    setTimeout(() => { if (!dialogOpen && l14On()) openConvo(NPC.gianni); }, 400);
  });
}
/* after the promise: Gianni opens the door, he and Brigante go back in; the door shuts */
function l14GianniBack(){
  const L = S.l14, g = NPC.gianni, b = NPC.brigante;
  worldSay(g, 'Vieni, Brigante!', { ms:1600 });
  setTimeout(() => toast('<i>“Vieni, Brigante!”</i> · Come on, Brigante!'), 300);
  trenoDoorOpen('cab', true).then(() => Promise.all([trenoWalk(b, [[TRENO.cabDoor.x - 8, 236], [TRENO.cabDoor.x + 14, 230]], 140), trenoWalk(g, [[TRENO.cabDoor.x + 12, 226]], 70)])).then(() => {
    L.cabShut = true; save(); renderHUD(); trenoDoorOpen('cab', false);
  });
}

/* ---------- talk: who you talk to, and how ---------- */
function l14Talk(npc){
  if (!l14On() || !L14_CASTIDS.includes(npc.id)) return false;
  const L = S.l14, t = S.tut, id = npc.id, who = l14Who(npc);
  /* the next conversation's kind (a door, the reveal), for the person it was meant for */
  const pend = L14C.pending && ((L14C.pending.kind === 'door' && id === 'ernesto') || (L14C.pending.kind === 'cab' && id === 'gianni') || (L14C.pending.kind === 'found' && id === 'sofiaferri')) ? L14C.pending : null; L14C.pending = null;
  const cut = () => { convo.mode = 'cutscene'; convo.known = !!S.known[id]; };
  const leave = (extra = []) => showChoices([...extra, { label:'Leave', primary:!extra.length, fn:closeDialog }]);
  const say = (l, o) => npcLine(fill(l.it), l.noEn ? null : fill(l.en), o || {});
  const book = () => { cut(); npcLine(...l14Open(id, 'l14-dining')); sysLine('You can\'t ask where the dog went yet. Read <b>Lezione 14 · Dov\'è il cane?</b> in your handbook, learn its words and do the practice.');
    leave([{ label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(14); } }]); return true; };
  if (id === 'margaret') return l14Margaret(npc, cut, leave);
  if (pend && pend.kind === 'found') return l14FoundConvo();
  if (pend && pend.kind === 'door') return l14Tiles('door', { door:pend.door, step:'l14-couple', who:'lina' }, L14_SCRIPTS['l14-couple'].door.answer, NPC.lina, { behind:pend.door });
  if (pend && pend.kind === 'cab') return l14Tiles('cab', { step:'l14-front', who:'gianni' }, L14_SCRIPTS['l14-front'].door.answer, NPC.gianni, { behind:'cab' });
  if (id === 'rinaldi'){
    if (t === 'l14-start'){ cut(); say({ it:'Pronto? Sì, sì…', en:'Hello? Yes, yes…' }); leave(); return true; }
    if (t === 'l14-barrier' && !L.barrier) return l14Tiles('barrier', { step:'l14-barrier', who }, L14_SCRIPTS['l14-barrier'].rinaldi.opening);
    if (!l14At('l14-dining')) return book();
    return l14Tiles('ask', { step:'l14-dining', who }, l14OpenLine(id, 'l14-dining'));
  }
  if (id === 'ferri'){
    if (t === 'l14-reveal' && L.phase === 'door') return l14Tiles('reveal', { step:'l14-reveal', who }, L14_SCRIPTS['l14-reveal'].ferri.opening);
    if (t === 'l14-done' && L.phase === 'goodbye' && L.reunion) return l14Tiles('bye', { step:'l14-done', who }, L14_SCRIPTS['l14-done'].ferri.bye[0]);
    if (t === 'l14-start' || (t === 'l14-barrier' && !L.barrier)){
      cut(); say(L14_SCRIPTS['l14-dining'].ferri.opening);
      l14Mg('Try the man on the phone, dear. He was in here all evening, and he\'s been here since early.'); leave(); return true;
    }
    if (!l14At('l14-dining')) return book();
    if (S.scene === trenoCabinScene(15)){ cut(); say({ it:'Che vergogna… Grazie, grazie!', en:'How embarrassing… Thank you, thank you!' }); leave(); return true; }
    return l14Tiles('ask', { step:'l14-dining', who }, l14OpenLine(id, 'l14-dining'));
  }
  if (id === 'nino'){
    if (!l14At('l14-nino')){ cut(); say({ it:'Buongiorno! Un momento, un momento… le colazioni!', en:'Good morning! One moment, one moment… the breakfasts!' });
      sysLine('Nino is rushing about with trays of coffee and croissants.'); leave(); return true; }
    const step = l14At('l14-chef') ? 'l14-chef' : 'l14-nino';
    const r = l14Tiles('ask', { step, who }, l14OpenLine(id, step));
    if (S.tut === 'l14-chef') l14MgOnce('chef', L14_MARGARET['l14-chef'][0]);
    return r;
  }
  if (id === 'ernesto' || id === 'lina'){
    if (id === 'ernesto' && L.memoryCome && !L.memoryHeard) return l14MemoryConvo();
    const step = id === 'ernesto' && L.memoryHeard ? 'l14-memory' : 'l14-couple';
    if (step === 'l14-memory') return l14Tiles('ask', { step, who }, { it:'Sì? La camera accanto!', en:'Yes? The room next door!' });
    return l14Tiles('ask', { step, who }, l14OpenLine(id, step));
  }
  if (id === 'gianni'){
    if (t === 'l14-front' && L.phase === 'typed') return false;          // (the typed translation: TYPED_SCRIPTS.margaret_door)
    if (!L.cabOpen || L.cabShut){ cut(); say({ it:'Occupato! Sto guidando!', en:"Busy! I'm driving!" }); leave(); return true; }
    return l14Tiles('ask', { step:'l14-front', who }, L.promised ? { it:'Grazie ancora! E… zitto, eh!', en:'Thanks again! And… not a word, eh!' } : L14_SCRIPTS['l14-front'].gianni.on.notPromised[0]);
  }
  if (id === 'lucaferri' || id === 'sofiaferri'){
    if (t === 'l14-done' && L.phase === 'reunion' && id === 'sofiaferri') return false;   // (the typed reunion: TYPED_SCRIPTS.margaret_reunion)
    cut(); say(id === 'sofiaferri' ? { it:'Ciao! Ciao, Biscuit!', en:'Hi! Hi, Biscuit!' } : { it:'Biscuit! Bravo!', en:'Biscuit! Good boy!' }); leave(); return true;
  }
  return false;
}
/* the opening by situation: the first time in this step, or again */
function l14OpenLine(id, step){
  const P = (L14_SCRIPTS[step] || {})[l14Who(NPC[id])] || {}, k = id + ':' + step, n = S.l14.talked[k] || 0;
  return n && P.revisit ? P.revisit : P.opening || { it:'Sì? Mi dica.', en:'Yes? Go ahead.' };
}
const l14Open = (id, step) => { const l = l14OpenLine(id, step); return [fill(l.it), fill(l.en)]; };
/* a tile conversation of ours: kind (barrier | ask | door | reveal | bye | memory), the step whose scripts answer, the opening */
function l14Tiles(kind, o, open, speaker, opts = {}){
  const L = S.l14, n = convo.npc;
  convo.l14 = { kind, greeted:false, fails:0, said:{}, ...o };
  const k = n.id + ':' + (kind === 'ask' ? o.step : kind); L.talked[k] = (L.talked[k] || 0) + 1; save();
  if (opts.behind){ convo.known = false; $('#dlgWho').innerHTML = `<b>Behind the door</b> <span class="where">· ${opts.behind === 'cab' ? 'La cabina di guida' : 'Cabina ' + opts.behind}</span>`; }
  convo.words = []; renderBank(); renderSentence(); builder.hidden = false;
  if (open){ npcLine(fill(open.it), fill(open.en), speaker ? { speaker, forceKnown:!opts.behind && !!S.known[speaker.id] } : {}); convo.lastNpcText = { it:fill(open.it), en:fill(open.en) }; }
  return true;
}

/* ---------- Margaret (English only) ---------- */
function l14Margaret(npc, cut, leave){
  const L = S.l14, t = S.tut;
  cut();
  const say = s => npcLine(fill(s), null, { english:true });
  if (t === 'l14-start' && !L.met){
    L14_MARGARET['l14-start'].forEach(say);
    showChoices(L14_MARGARET['l14-start-choices'].map((c, i) => ({ label:`“${c.label}”`, primary:i === 0, cls:'english', fn:() => {
      choices.hidden = true; meLine(c.label, { english:true });
      say(L14_MARGARET['l14-start-after']);
      enqueue(() => {
        L.met = true; L.follow = true; L.phase = ''; NPC.margaret.seated = false;
        S.met.margaret = S.known.margaret = true; save();
        setTut('l14-barrier'); l14Clock(7 * 60 + 25);
        if (convo) convo.done = true;
      });
      leave();
    } })));
    return true;
  }
  say(L14_MG_STATUS());
  leave();
  return true;
}

/* ---------- the tile bank ---------- */
/* a tile with a capitalised word kept as written (Margaret), a tile key shown once per bank, the spoiler tiles only once discovered */
function l14PT(t){ const p = phraseTile(t), w = fill(t.words).split(' '); p.tokens.forEach((k, i) => { if (/^[A-Z]/.test(w[i]) && t.key === 'margaret'){ k.label = w[i]; k.name = true; } }); return p; }
function l14Bank(npc, groups, names){
  if (!l14On() || !convo || !convo.l14 || convo.npc !== npc) return null;
  const C = convo.l14, T = L14_TILES, seen = new Set();
  const pt = l => l.filter(x => (!x.spoiler || l14Discovered()) && !seen.has(x.key) && seen.add(x.key)).map(l14PT);
  if (C.kind === 'barrier'){
    const no = ['sa', "dov'è andato", "dov'è andata", 'il cane', 'è sicuro', 'è sicura', 'a che ora', 'dove', 'si ricorda'];
    groups.push({ label:'Il cane', tiles:pt(T.domande.filter(x => !no.includes(x.key))) });
    groups.push({ label:'Cortesia', tiles:pt(T.cortesia) });
  } else if (C.kind === 'bye'){
    groups.push({ label:'Cortesia', tiles:pt(T.cortesia) });
  } else {
    /* at a door: knocking, asking to come in, saying who you are (your name too) */
    if (C.kind === 'door' || C.kind === 'cab' || C.kind === 'reveal')
      groups.push({ label:'Alla porta', tiles:[...pt(T.porta), { w:S.playerName.toLowerCase(), label:S.playerName, name:true, gloss:'your name' }] });
    groups.push({ label:'Il cane', tiles:pt(T.domande) });
    if (l14At('l14-front')) groups.push({ label:l14Discovered() ? 'Due cani' : 'Risposte', tiles:pt(T.risposte) });
    groups.push({ label:'Cortesia', tiles:pt(T.cortesia) });
  }
  if (names.length) groups.push({ label:'Names', tiles:names });
  return groups;
}

/* ---------- a turn ---------- */
const L14_FORMAL_FIX = [['ciao', '<b>buongiorno</b> (or <b>arrivederci</b>), not ciao'], ['stai', '<b>come sta</b>, not come stai']];
function l14React(id, n, st, add, out, ints){
  if (!l14On() || !convo || !convo.l14 || convo.npc !== n) return false;
  if (out.l14) return true;
  if (pureRepeat(ints) && convo.lastNpcText) return false;     // (Ancora una volta, per favore: the brain says the last line again)
  /* "Può ripetere?" / "Ancora una volta, per favore" (the set phrases), alone or with please / excuse me / so / and: the brain's own
     repeat answers (the last line again, slowly); little words (e, poi, ma, quindi) never change what a question asks */
  const rep = i => /^(repeat|again|ancora)/.test(i), filler = i => ['please', 'excuse', 'l14:excuse', 'greet', 'and', 'then', 'but', 'so'].includes(i) || /^(and|then|but|so|poi|ma|quindi)$/.test(i);
  if (ints.some(rep) && ints.every(i => rep(i) || filler(i))) return false;
  const C = convo.l14, words = (convo.lastUsed || []).flatMap(t => t.tokens || [t]).map(t => t.w);
  const read = l14Read(ints, words);
  const R = l14Turn(C, n, read, words);
  R.lines.filter(l => !l.sys && !l.who).forEach(l => add(l.it, l.noEn ? null : l.en, l.listen ? { listen:true, rate:l.rate } : l.rate ? { rate:l.rate } : undefined));
  R.sys = R.lines.filter(l => l.sys).map(l => l.sys === true ? l.it : l.sys);
  R.extra = (R.extra || []).concat(R.lines.filter(l => l.who && !l.sys));
  out.asked = true; out.l14 = R;
  return true;
}
/* what the person says back, from the step's script (l14Reply), and what it changes */
function l14Turn(C, n, read, words){
  const L = S.l14, who = C.who, adult = n.formal !== false;
  const R = { lines:[], clues:[], asks:[], keys:[], extra:[], mg:[], fb:null, end:false, read };
  const P = (L14_SCRIPTS[C.step] || {})[who] || {};
  /* the polite forms: feedback on the player's own words */
  const formal = adult ? L14_FORMAL_FIX.filter(([w]) => words.includes(w)).map(f => f[1]) : [];
  if (formal.length) R.fb = `${esc(n.name)} is a stranger: the polite forms (<i>Lei</i>). ${formal.join('; ')}.`;
  /* the driver's secret: you promised (only Nino, who knows already, may hear it) */
  if (L.promised && who !== 'nino' && who !== 'gianni' && (read.driver || read.two)){
    L.slips++; save();
    const other = (P.on && P.on.other) || [{ it:'Come?', en:'Sorry?' }];
    R.lines.push(...other); R.fb = 'Shh! You promised Gianni: not a word about his dog. (Nino knows already; nobody else.)';
    return R;
  }
  const greetFirst = read.greet && read.keys.some(k => k !== 'greet') && !C.greeted;
  if (read.greet) C.greeted = true;
  const hello = () => { if (greetFirst) R.lines.push(adult ? { it:'Buongiorno!', en:'Good morning!' } : { it:'Ciao!', en:'Hi!' }); };

  /* room 14's door: "Chi è?" → who you are (Siamo io e Margaret; Sono io…: they remember you), or something polite */
  if (C.kind === 'door'){
    const D = L14_SCRIPTS['l14-couple'].door;
    if (read.who){
      R.lines.push({ it:D.openWho.it, en:D.openWho.en }); R.opened = true; C.opened = true;
      if (read.who === 'sono-pl') R.fb = L14_HINTS.agree.siamo;
    } else if (read.door || (read.greet && read.polite)){
      R.lines.push({ it:D.open.it, en:D.open.en }); R.opened = true; C.opened = true;
      if (!read.door) R.fb = 'They opened. Next time, you can apologise for disturbing them: they are strangers.';
    } else { R.lines.push({ it:D.unclear.it, en:D.unclear.en }); C.fails++; }
    return R;
  }
  /* the driver's door: Gianni behind it. Asking to come in (permesso) → "No, no! Esco io!"; a dog? → he denies it (a bark) */
  if (C.kind === 'cab'){
    const D = L14_SCRIPTS['l14-front'].door, line = l => R.lines.push({ it:l.it, en:l.en });
    hello();
    if (read.permesso){
      line(D.out); R.cabOut = true;
      if (!read.disturb) R.fb = 'He heard you. You are disturbing a man who is driving a train: next time, apologise first.';
    } else if (read.keys.includes('seen') || read.keys.includes('went')){ line(D.deny); R.lines.push({ sys:D.deny2.sys + ' «' + D.deny2.it + '»' }); C.fails++; }
    else if (read.who){ line(D.who); C.fails++; }
    else if (read.disturb || read.polite){ line(D.sorry); C.fails++; }
    else if (!R.lines.length){ line(D.unclear); C.fails++; }
    return R;
  }
  if (C.kind === 'bye'){
    const F = L14_SCRIPTS['l14-done'];
    if (read.keys.includes('bye') || (read.keys.includes('thanks') && !words.includes('ciao'))){
      if (read.keys.includes('thanks')) R.lines.push({ it:'Si figuri! Grazie a Lei!', en:"Don't mention it! Thank you!" });
      R.lines.push({ it:'Arrivederci!', en:'Goodbye!' });
      R.extra.push({ who:'sofiaferri', ...F.sofia.bye[0] });
      R.end = true; R.bye = true;
    } else if (words.includes('ciao')){
      R.lines.push({ it:'Ciao, ciao… Arrivederci!', en:'Bye, bye… Goodbye!' }); R.fb = 'La signora Ferri is a stranger: the polite goodbye, <b>arrivederci</b>, not ciao. (Ciao is for the children.)';
    } else R.lines.push({ it:'Sì? … Allora, arrivederci!', en:'Yes? … Well then, goodbye!' });
    return R;
  }
  if (C.kind === 'barrier'){
    const rep = l14Reply('l14-barrier', 'rinaldi', read, C);
    hello(); R.lines.push(...rep.lines);
    if (rep.keys.includes('seen')) R.barrier = true;
    return R;
  }
  if (C.kind === 'reveal'){
    const r2 = { ...read, keys:read.keys.map(k => k === 'went' ? 'seen' : k) };
    if (!read.keys.length && read.polite){ hello(); R.lines.push({ it:'Si figuri. Mi dica!', en:"Don't worry. Go ahead!" }); return R; }
    const rep = l14Reply('l14-reveal', 'ferri', r2, C);
    hello(); R.lines.push(...rep.lines);
    if (rep.keys.some(k => k === 'seen' || k === 'her')){ R.reveal = true; L.revealReady = true; save(); }
    if (read.agree === 'f'){ R.fb = L14_HINTS.agree.f; L.agree++; }
    return R;
  }
  /* 'ask': the trail's people. In the dining car "È sicuro? / È sicura?" is answered here (it presses them, after they saw nothing) */
  const pressing = C.step === 'l14-dining' && S.tut === 'l14-dining' && (who === 'rinaldi' || who === 'ferri') && read.keys.includes('sure');
  const rest = pressing ? { ...read, keys:read.keys.filter(k => k !== 'sure') } : read;
  const rep = !pressing || rest.keys.length ? l14Reply(C.step, who, rest, C) : { lines:[], clues:[], asks:[], keys:[], other:false };
  hello();
  R.lines.push(...rep.lines); R.clues.push(...rep.clues); R.keys = rep.keys;
  R.asks = rep.asks.filter(a => { const r = nbRec(a.clue) || {}; return a.kind === 'time' ? !r.time : !r.where; });
  (L.asked[who] = L.asked[who] || []); rep.keys.forEach(k => { if (!L.asked[who].includes(k)) L.asked[who].push(k); });
  if (read.keys.includes('went') && read.agree === 'f'){ R.fb = L14_HINTS.agree.f; L.agree++; }
  if (read.keys.includes('bye')) R.end = true;
  /* step by step */
  if (C.step === 'l14-dining' && S.tut === 'l14-dining' && (who === 'rinaldi' || who === 'ferri')){
    if (rep.keys.includes('seen') || (rep.keys.includes('went') && read.agree !== 'f')){
      if (!L.nothing[who]) R.mgNothing = true; L.nothing[who] = true;
      if (!R.clues.includes(who + '-niente')) R.clues.push(who + '-niente');      // "Non ho visto niente": asked either way
    }
    if (pressing){
      const g = who === 'rinaldi' ? 'm' : 'f';
      if (!L.nothing[who]) R.lines.push(...P.on.sure);
      else if (read.sure !== g){ R.lines.push(...P.on.sureWrong); R.fb = L14_HINTS.agree.sure[who]; L.agree++; }
      else if (!L.pointed[who]){ R.lines.push(...P.point); R.clues.push(P.pointClue); L.pointed[who] = true; R.pointed = true; }
      else R.lines.push(...P.pointAgain);
      R.keys.push('sure'); if (!L.asked[who].includes('sure')) L.asked[who].push('sure');
    }
  }
  /* Nino, the first time: a dog at the front, with the driver */
  if (C.step === 'l14-nino' && who === 'nino' && (rep.keys.includes('seen') || rep.keys.includes('went')) && !L.ninoFront){
    L.ninoFront = true; R.ninoFront = true; R.clues = R.clues.filter(c => c !== 'nino-davanti');
  }
  if (C.step === 'l14-front' && who === 'gianni'){
    if (rep.keys.includes('promise') && !L.promised){ L.promised = true; R.promised = true; }
    else if (!L.promised && !rep.keys.includes('promise')) R.lines.push(...L14_SCRIPTS['l14-front'].gianni.on.notPromised);
  }
  if (C.step === 'l14-chef' && who === 'nino' && (rep.keys.includes('her') || rep.keys.includes('two')) && S.tut === 'l14-chef'){ L.chef = true; R.chef = true; }
  save();
  return R;
}

/* ---------- after their lines: the other voices, the notebook, the step moving on, the hint ---------- */
function l14After(n, out){
  if (!l14On() || !out.l14 || !convo || !convo.l14) return false;
  const C = convo.l14, R = out.l14, L = S.l14;
  R.sys.forEach(s => sysLine(esc(s)));
  R.extra.forEach(x => npcLine(fill(x.it), x.noEn ? null : fill(x.en), { speaker:NPC[x.who] || convo.npc, forceKnown:!!(NPC[x.who] && S.known[x.who]), listen:!!x.listen, rate:x.rate }));
  if (R.barrier) return l14BarrierEnd();
  if (C.kind === 'door' && R.opened){
    enqueue(() => { if (convo){ convo.done = true; builder.hidden = true; } });
    if (R.fb) showHint(R.fb, 'Consiglio'); else enqueue(() => { hintEl.hidden = true; });
    showChoices([{ label:'Go in', primary:true, fn:() => { closeDialog(); l14Enter14(); } }]);
    return true;
  }
  if (C.kind === 'reveal' && R.reveal){
    const D = L14_SCRIPTS['l14-reveal'].door;
    sysLine(`From inside the room: <i>«${esc(D.bark)}»</i> … and giggling: <i>«${esc(D.giggle)}»</i> (Hee hee hee! Shh! Quiet!)`);
    if (R.fb) showHint(R.fb, 'Consiglio'); else enqueue(() => { hintEl.hidden = true; });
    enqueue(() => { if (convo){ convo.done = true; builder.hidden = true; } });
    showChoices([{ label:'Look inside', primary:true, fn:() => { closeDialog(); } }]);
    return true;
  }
  if (C.kind === 'cab' && R.cabOut){
    enqueue(() => { L.phase = 'out'; save(); if (convo){ convo.done = true; builder.hidden = true; } });
    if (R.fb) showHint(R.fb, 'Consiglio'); else enqueue(() => { hintEl.hidden = true; });
    showChoices([{ label:'Continue', primary:true, fn:closeDialog }]);
    return true;
  }
  if (C.kind === 'bye' && R.bye){
    L.goodbye = true; save();
    enqueue(() => { if (convo){ convo.done = true; builder.hidden = true; } });
    if (R.fb) showHint(R.fb, 'Consiglio'); else enqueue(() => { hintEl.hidden = true; });
    showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
    return true;
  }
  l14AskAfter(R, { mode:'type', onDone:() => l14Then(n, C, R) });
  return true;
}
/* when the notebook has what it asked: the step moves on; Margaret; the hint */
function l14Then(n, C, R){
  const L = S.l14, who = C.who;
  if (!convo || convo.npc !== n) return;
  if (R.mgNothing && !R.pointed){ l14MgOnce('dining0', L14_MARGARET['l14-dining'][0]); l14MgOnce('press:' + who, L14_MARGARET['l14-dining-press'][who]); }
  if (R.pointed && l14Pointed() >= 2 && S.tut === 'l14-dining'){
    l14MgOnce('dining1', L14_MARGARET['l14-dining'][1]);
    enqueue(() => { if (S.tut === 'l14-dining'){ setTut('l14-couple'); l14Clock(7 * 60 + 50); } });
  }
  /* room 14: Ernesto's aside (once, unprompted, after his sighting); both sightings → the bickering, Margaret, the comparison */
  if (S.tut === 'l14-couple' && who === 'ernesto' && nbHas('ernesto-visto') && !nbHas('ernesto-sentito')){
    const A = L14_SCRIPTS['l14-couple'].ernesto.aside[0];
    npcLine(fill(A.it), fill(A.en)); enqueue(() => nbNote('ernesto-sentito'));
  }
  if (S.tut === 'l14-couple' && !L.bothNoted && nbComplete('ernesto-visto') && nbComplete('lina-visto')){
    L.bothNoted = true; save();
    L14_SCRIPTS['l14-couple'].bicker.forEach(x => npcLine(fill(x.it), fill(x.en), { speaker:NPC[x.who], forceKnown:!!S.known[x.who] }));
    l14MgOnce('couple0', L14_MARGARET['l14-couple'][0]);
    l14MgOnce('couple1', L14_MARGARET['l14-couple'][1]);
    enqueue(() => { if (S.tut === 'l14-couple'){ setTut('l14-nino'); l14Clock(7 * 60 + 55); } });
    showHint('Two sightings, two times, two directions: your notebook\'s <b>Confronta</b> page puts them side by side. Margaret wants to ask the chef.', 'Fatto!');
    enqueue(renderHUD);
    return;
  }
  if (R.ninoFront){
    enqueue(() => nbNote('nino-davanti', { where:true }));
    l14MgOnce('nino0', L14_MARGARET['l14-nino'][0]);
    enqueue(() => { if (S.tut === 'l14-nino'){ setTut('l14-front'); S.l14.phase = 'door'; save(); l14Clock(8 * 60); } });
    showHint(L14_HINTS['l14-nino'].next, 'Fatto!');
    return;
  }
  if (R.promised){
    l14MgOnce('front2', L14_MARGARET['l14-front'][2]);
    l14MgOnce('front3', L14_MARGARET['l14-front'][3]);
    enqueue(() => { setTut('l14-chef'); l14Clock(8 * 60 + 5); });
    enqueue(() => { if (convo){ convo.done = true; builder.hidden = true; } });
    showHint('You kept his secret. He told you who to ask next.', 'Fatto!');
    showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
    return;
  }
  if (R.chef){
    enqueue(() => { setTut('l14-memory'); l14Clock(8 * 60 + 10); });
    enqueue(() => { if (convo){ convo.done = true; builder.hidden = true; } });
    showHint('Nino remembers Biscuit at dinner, but not where he went. Someone else might…', 'Fatto!');
    showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
    return;
  }
  if (R.end){
    enqueue(() => { if (convo){ convo.done = true; builder.hidden = true; } });
    if (R.fb) showHint(R.fb, 'Consiglio'); else enqueue(() => { hintEl.hidden = true; });
    showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
    return;
  }
  const H = l14HintFor(n, C);
  const tries = H ? stepTries(convo.st, H.step) : 0;
  if (R.fb) showHint(R.fb + (H && H.strong && tries >= HINT_STRONG_AT ? ' ' + H.strong.replace(H.h, '').trim() : ''), 'Consiglio');
  else if (H) showHint(hintAfter(tries, H.h, H.strong), H.done ? 'Fatto!' : 'Suggerimento');
  else enqueue(() => { hintEl.hidden = true; });
}
/* the hint for this person now: { h, strong (the key words, from the third failed try), step } (never the Italian sentence) */
function l14HintFor(n, C){
  const L = S.l14, who = C.who, H = L14_HINTS, asked = L.asked[who] || [];
  if (C.kind === 'barrier') return { h:'Ask him if he has seen a dog. He\'s a stranger: polite. (Lezione 13: the past with <i>avere</i>.)', strong:'Ask him if he has seen a dog. Key words: <b>ha visto</b>.', step:'barrier' };
  if (C.kind === 'door') return { h:H['l14-couple'].door, strong:`${H['l14-couple'].door} Key words: <b>siamo</b>, <b>io</b>.`, step:'door' };
  if (C.kind === 'cab') return { h:H['l14-front'].door, strong:`${H['l14-front'].door} Key words: <b>il disturbo</b>, <b>permesso</b>.`, step:'cab' };
  if (C.kind === 'reveal') return { h:`${H['l14-reveal'].door} Then ask about the dog.`, strong:`${H['l14-reveal'].door} Key words: <b>il disturbo</b>; <b>un cane</b>.`, step:'reveal' };
  if (C.kind === 'bye') return { h:'Say goodbye to her. She is a stranger: the polite goodbye.', step:'bye' };
  if (C.step === 'l14-dining' && S.tut === 'l14-dining'){
    if (!L.pointed[who]){
      if (!L.nothing[who]) return { h:H['l14-dining'].seen, strong:`${H['l14-dining'].seen} Key words: <b>sa</b>, <b>andato</b>.`, step:`dining:${who}:seen` };
      return { h:H['l14-dining'].sure[who], strong:`${H['l14-dining'].sure[who]} Key word: <b>${who === 'rinaldi' ? 'sicuro' : 'sicura'}</b>.`, step:`dining:${who}:sure` };
    }
    const other = who === 'rinaldi' ? 'la signora Ferri, by the window' : 'il signor Rinaldi, on the phone';
    return l14Pointed() >= 2 ? { h:H['l14-dining'].next, step:'dining:next', done:true } : { h:`Room 14… Ask ${other} too.`, step:`dining:${who}:other`, done:true };
  }
  if (C.step === 'l14-couple' && S.tut === 'l14-couple'){
    const clue = who === 'ernesto' ? 'ernesto-visto' : 'lina-visto', r = nbRec(clue) || {};
    if (!r.where) return { h:H['l14-couple'].seen, strong:`${H['l14-couple'].seen} Key words: <b>ha visto</b>.`, step:`couple:${who}:seen` };
    if (!r.time) return { h:H['l14-couple'].when, strong:`${H['l14-couple'].when} The key word is <b>ora</b> (Lezione 10).`, step:`couple:${who}:when` };
    const other = who === 'ernesto' ? 'Lina' : 'Ernesto';
    return L.bothNoted ? { h:H['l14-couple'].next, step:'couple:next', done:true } : { h:`You have ${who === 'ernesto' ? 'his' : 'her'} sighting. Now ask ${other}.`, step:`couple:${who}:done`, done:true };
  }
  if (C.step === 'l14-nino' && S.tut === 'l14-nino') return { h:H['l14-nino'].seen, strong:`${H['l14-nino'].seen} Key words: <b>sa</b>, <b>andato</b>.`, step:'nino:seen' };
  if (C.step === 'l14-nino') return { h:H['l14-nino'].next, step:'nino:next', done:true };
  if (C.step === 'l14-front' && !L.promised) return { h:H['l14-front'].promise, strong:`${H['l14-front'].promise} Key words: <b>non lo dico</b>…`, step:'front:promise' };
  if (C.step === 'l14-chef' && S.tut === 'l14-chef'){
    const a = L.asked.nino || [];
    if (!a.includes('two') && !a.includes('driver')) return { h:H['l14-chef'].two, strong:`${H['l14-chef'].two} Key words: <b>due cani</b>.`, step:'chef:two' };
    return { h:H['l14-chef'].whose, strong:`${H['l14-chef'].whose} Key word: <b>della</b>.`, step:'chef:whose' };
  }
  if (C.step === 'l14-memory') return S.tut === 'l14-reveal' ? { h:H['l14-memory'].next, step:'memory:next', done:true } : { h:H['l14-memory'].memory, step:'memory' };
  return null;
}
/* the hint after a sentence that didn't parse (contextHint) */
function l14Hint(n){
  if (!l14On() || !convo || !convo.l14 || convo.npc !== n) return null;
  return l14HintFor(n, convo.l14);
}

/* ---------- the barrier: Rinaldi's fast answer; Margaret; the handbook ---------- */
function l14BarrierEnd(){
  const L = S.l14;
  l14Mg(L14_MARGARET['l14-barrier'][0]);
  enqueue(() => { builder.hidden = true; hintEl.hidden = true; });
  sysLine(L14_SCRIPTS['l14-barrier'].sys.html);
  l14Mg(L14_MARGARET['l14-barrier'][1]);
  enqueue(() => { L.barrier = true; save(); if (S.tut === 'l14-barrier'){ if (S.practiceDone14) l14ToDining(); else setTut(vocabCheckDone(14) ? 'l14-practice' : 'l14-handbook'); } if (convo) convo.done = true; });
  showChoices([{ label:'Leave', fn:closeDialog }, { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(14); } }]);
  return true;
}

/* ---------- room 14: in ---------- */
function l14Enter14(){
  const L = S.l14;
  L.inside14 = true; save();
  trenoDoorOpen(14, true).then(() => trenoEnter(14, { title:'Cabina 14', sub:'Ernesto e Lina' }));
}

/* ---------- the memory: Ernesto (and Lina) come after you ---------- */
function l14MemoryBeat(){
  const L = S.l14, e = NPC.ernesto, l = NPC.lina;
  L.memoryCome = true; save();
  L14C.busy = 'memory';
  const inSleeper = player.x < 1060;
  const from = inSleeper ? { x:525, y:244 } : { x:1110, y:222 };
  e.x = from.x; e.y = from.y; l.x = from.x - 26; l.y = from.y + 8; e.seated = l.seated = false;
  const tx = Math.max(inSleeper ? 160 : 1140, Math.min(player.x - 56, inSleeper ? 1000 : 1980));
  const ty = inSleeper ? 222 : Math.max(262, Math.min(440, player.y));
  renderHUD(); trenoLook(from.x);
  cutscene([
    { say:L14_SCRIPTS['l14-memory'].ernesto.opening.it.split('!')[0] + '!', who:'ernesto', ms:1400 },
    { walk:'lina', path:inSleeper ? [[tx - 30, ty + 6]] : [[1140, 262], [tx - 34, Math.min(ty + 10, 440)]], speed:100, async:true },
    { walk:'ernesto', path:inSleeper ? [[tx, ty]] : [[1150, 262], [tx, ty]], speed:120 },
    { face:'ernesto', to:'player' }, { face:'player', to:'ernesto' },
  ], { id:'l14-memory', guide:'Someone is hurrying after you…' }).then(() => {
    L14C.busy = null; trenoLook(null); e.cutWalk = false; l.cutWalk = false;
    e.x = tx; e.y = ty; l.x = tx - 34; l.y = Math.min(ty + 10, 440);
    if (!dialogOpen && l14On()) openConvo(e);
  });
}
/* after the memory: back to their table in the dining car (N2) */
function l14BassiSit(){
  const L = S.l14;
  const path = (n, seat) => { const p = n.x < 1060 ? [[Math.min(n.x, 1040), 222], [1110, 222]] : []; return p.concat([[1150, 262], [seat.x, 262], [seat.x, seat.y]]); };
  Promise.all([trenoWalk(NPC.ernesto, path(NPC.ernesto, L14S().ernestoN2), 80), trenoWalk(NPC.lina, path(NPC.lina, L14S().linaN2), 80)]).then(() => { L.memoryDone = true; save(); renderHUD(); });
}
function l14MemoryConvo(){
  const L = S.l14, M = L14_SCRIPTS['l14-memory'];
  l14Tiles('ask', { step:'l14-memory', who:'ernesto' }, M.ernesto.opening);
  l14Play(M.ernesto.memory);
  l14AskAfter({ lines:M.ernesto.memory, clues:[], asks:[{ kind:'where', clue:M.ernesto.memoryClue }] }, { onDone:() => {
    L.memoryHeard = true; save();
    M.lina.aside.forEach(x => npcLine(fill(x.it), fill(x.en), { speaker:NPC.lina, forceKnown:!!S.known.lina }));
    l14MgOnce('memory0', L14_MARGARET['l14-memory'][0]);
    enqueue(() => { if (S.tut === 'l14-memory'){ setTut('l14-reveal'); S.l14.phase = 'knock'; l14Clock(8 * 60 + 15); } });
    showHint(L14_HINTS['l14-memory'].next, 'Fatto!');
  } });
  return true;
}

/* ---------- the children's room ---------- */
function l14RevealKnock(){
  const L = S.l14, D = L14_SCRIPTS['l14-reveal'].door;
  L14C.busy = 'reveal';
  cutscene([
    { run:() => trenoKnockFx(15) },
    { wait:900 },
    { run:() => trenoDoorSay(15, D.bark, { ms:1600, pitch:1.6, en:'Woof! Woof!' }) },
    { wait:1500 },
    { run:() => trenoDoorSay(15, D.giggle, { ms:1800, pitch:1.6, en:'Hee hee hee! Shh! Quiet!' }) },
    { wait:1900 },
    { say:L14_MARGARET['l14-reveal'][0].split('!')[0] + '?!', who:'margaret', silent:true, ms:1600 },
    { run:() => trenoDoorSay(15, D.answer.it, { ms:1600, pitch:NPC.ferri.pitch, en:D.answer.en }) },
    { wait:1500 },
  ], { id:'l14-reveal', guide:'<i>Toc toc!</i> Behind the door: barking… and giggling!' }).then(() => trenoDoorOpen(15, true)).then(() => {
    L.phase = 'door'; save();
    L14C.busy = null; renderHUD();
    setTimeout(() => { if (!dialogOpen && l14On()) openConvo(NPC.ferri); }, 300);
  });
}
/* "Look inside": la signora Ferri turns round; the children on the bunk with Biscuit */
function l14RevealIn(){
  const L = S.l14, F = L14_SCRIPTS['l14-reveal'];
  S.met.lucaferri = S.known.lucaferri = S.met.sofiaferri = S.known.sofiaferri = true; save();
  NPC.ferri.face = NPC.ferri.baseFace = { x:0, y:1 };
  worldSay(NPC.ferri, F.ferri.found[0].it, { ms:2200 });
  setTimeout(() => toast(`<i>“${esc(F.ferri.found[0].it)}”</i> · ${esc(F.ferri.found[0].en)}`), 300);
  setTimeout(() => {
    L.found = true; L.phase = 'in'; save();
    trenoEnter(15, { title:'Cabina 15', sub:'Luca e Sofia' });
    const wait = () => { if (traveling || S.scene !== trenoCabinScene(15)){ setTimeout(wait, 200); return; }
      setTimeout(() => { if (!dialogOpen && l14On()){ L14C.pending = { kind:'found' }; openConvo(NPC.sofiaferri); } }, 500); };
    setTimeout(wait, 400);
  }, RM ? 300 : 1800);
}
/* the reveal, in the room (a cutscene conversation: everyone's lines) */
function l14FoundConvo(){
  const F = L14_SCRIPTS['l14-reveal'];
  convo.mode = 'cutscene'; convo.known = true;
  $('#dlgWho').innerHTML = '<b>Luca e Sofia</b> <span class="where">· Cabina 15</span>';
  const sp = { ferri:NPC.ferri, sofia:NPC.sofiaferri, luca:NPC.lucaferri };
  const line = (who, l) => npcLine(fill(l.it), fill(l.en), { speaker:sp[who], forceKnown:true });
  enqueue(() => worldSay('biscuit', 'Bau!', { ms:1200, silent:true }));
  line('sofia', F.sofia.found[0]);
  line('luca', F.luca.found[0]); enqueue(() => nbNote(F.luca.foundClue));
  line('sofia', F.sofia.name[0]);
  line('ferri', F.ferri.sorry[0]);
  l14Mg(L14_MARGARET['l14-reveal'][0]);
  enqueue(() => { if (convo) convo.done = true; });
  showChoices([{ label:'Continue', primary:true, fn:closeDialog }]);
  return true;
}

/* ---------- closing a conversation: the trail moves on ---------- */
function l14OnClose(closedId, closedDone){
  if (!l14On()) return false;
  const L = S.l14, t = S.tut;
  if (closedId === 'gianni' && t === 'l14-front' && L.phase === 'promise' && !L.promised && closedDone){
    /* a moment to see them (Gianni in his doorway, Brigante), then Gianni turns to you, pleading */
    setTimeout(() => { if (l14On() && !dialogOpen) worldSay(NPC.gianni, 'Per favore…', { ms:1200, silent:true }); }, 500);
    setTimeout(() => { if (!dialogOpen && l14On()) openConvo(NPC.gianni); }, 1600); return true; }
  if (closedId === 'gianni' && t === 'l14-front' && L.phase === 'out' && !L.cabOpen){ setTimeout(l14CabSlip, 300); return true; }
  if (closedId === 'gianni' && L.promised && L.cabOpen && !L.cabShut){ setTimeout(l14GianniBack, 300); return true; }
  if (closedId === 'ernesto' && L.memoryHeard && !L.memoryDone){ setTimeout(l14BassiSit, 300); return true; }
  if (closedId === 'ferri' && t === 'l14-reveal' && L.phase === 'door' && L.revealReady){ setTimeout(l14RevealIn, 300); return true; }
  if (closedId === 'sofiaferri' && L.phase === 'in'){
    setTut('l14-done'); L.phase = 'reunion'; l14Clock(8 * 60 + 20); save();
    setTimeout(() => { if (l14On() && !dialogOpen) worldSay(NPC.biscuit, 'Bau!', { ms:1200, silent:true }); }, 300);
    setTimeout(() => { if (!dialogOpen && l14On()) openConvo(NPC.sofiaferri); }, 1800); return true;
  }
  if (closedId === 'sofiaferri' && t === 'l14-done' && L.phase === 'goodbye' && L.reunion && !L.goodbye){ setTimeout(() => { if (!dialogOpen && l14On()) openConvo(NPC.ferri); }, 500); return true; }
  if (closedId === 'ferri' && t === 'l14-done' && L.goodbye && L.phase === 'goodbye'){ setTimeout(l14Arrive, 400); return true; }
  return false;
}

/* ---------- the arrival: Venezia Santa Lucia, over the lagoon ---------- */
function l14Arrive(){
  const L = S.l14;
  L.phase = 'arrive'; save();
  dogFollow('biscuit', 'margaret');
  trenoLeave();
  const go = () => {
    if (traveling || S.scene !== 'treno'){ setTimeout(go, 200); return; }
    player.face = { x:0, y:-1 };
    cutscene([
      { guide:'Out of the window: water, everywhere. The lagoon! The train slows down over the long bridge…'
        + (S.l13 && S.l13.askedWhen ? ' Nino said last night: <i>“alle sette e mezza”</i>. It\'s ' + l14HHMM(S.l14.clock) + ': a little late, but who\'s counting?' : '') },
      { wait:2400 },
      { run:() => { speak(L14_ANNOUNCE.it, 0.92, false, 0.9); toast(`<i>“${esc(L14_ANNOUNCE.it)}”</i> · ${esc(L14_ANNOUNCE.en)}`); } },
      { guide:`<i>Din-don!</i> <i>“${esc(L14_ANNOUNCE.it)}”</i> (${esc(L14_ANNOUNCE.en)})` },
      { wait:2600 },
      { run:() => { L.arrived = true; l14Clock(8 * 60 + 35); save(); } },
      { say:'Venice! Oh, just look at it. Come on, Biscuit!', who:'margaret', silent:true, ms:2600 },
      { wait:1200 },
    ], { id:'l14-arrive', guide:'' }).then(() => {
      L.arrived = true; L.phase = 'end'; save(); renderHUD();
      const f = $('#fade'); $('#fadeTitle').textContent = 'Venezia Santa Lucia'; $('#fadeSub').textContent = 'Il treno è arrivato'; f.classList.add('on');
      setTimeout(() => { f.classList.remove('on'); openComplete14(); }, RM ? 400 : 1800);
    });
  };
  setTimeout(go, 400);
}

/* ---------- every 400 ms: a beat waiting for its moment ---------- */
function l14Tick(){
  if (!l14On() || introOpen || traveling) return;
  const L = S.l14, free = !L14C.busy && !dialogOpen && !modalOpen && !cutsceneOn() && !pickOpen;
  /* Margaret's bubbles, once nothing is open */
  if (free && L14C.say.length && trenoScene()){ const s = L14C.say.shift(); worldSay(NPC.margaret, s.t, { ms:s.ms, silent:true }); }
  /* morning, compartment 17: a knock at the door */
  if (free && S.tut === 'l14-start' && L.phase === 'knock' && S.scene === trenoCabinScene(L14_MINE)) l14KnockBeat();
  /* the first time in the dining car with Margaret */
  if (free && S.tut === 'l14-barrier' && !L.barrier && S.scene === 'treno' && player.x > 1130 && !L.mg.diningIn){
    L.mg.diningIn = true; save(); l14MgSay("That gentleman on the phone was here all last evening. Ask him, dear!");
  }
  /* after Nino: Ernesto comes after you */
  if (free && S.tut === 'l14-memory' && !L.memoryCome && S.scene === 'treno') l14MemoryBeat();
}
setInterval(l14Tick, 400);
/* compartment 17, the morning: knocking; Margaret, in a panic */
function l14KnockBeat(){
  const L = S.l14;
  L.phase = 'talk'; save(); L14C.busy = 'knock';
  const M = NPC.margaret; M.x = L14S().mgDoor.x; M.y = L14S().mgDoor.y + 20; M.seated = false; renderHUD();
  cutscene([
    { wait:1400 },
    { run:() => trenoSound('knock') },
    { guide:'<i>Toc toc! Toc toc toc!</i> Someone is knocking at your door, hard. The window is pink with dawn.' },
    { wait:1200 },
    { run:() => trenoSound('knock') },
    { walk:'margaret', path:[[L14S().mgIn.x, L14S().mgIn.y]], speed:90 },
    { face:'margaret', to:'player' }, { face:'player', to:'margaret' },
    { say:'Hello? Oh, hello! Are you awake?', who:'margaret', silent:true, ms:2200 },
  ], { id:'l14-knock', guide:'' }).then(() => {
    L14C.busy = null; M.cutWalk = false; M.x = L14S().mgIn.x; M.y = L14S().mgIn.y;
    if (!dialogOpen && l14On()) openConvo(M);
  });
}

/* ---------- completion ---------- */
function openComplete14(){
  const L = S.l14, spec = l14NotebookSpec(), rec = id => nbRec(id) || {};
  const nbRow = (id, who) => { const c = spec.clues[id], r = rec(id); return r.line ? `<p><b>${esc(who)}</b> · «${esc(c.it)}»${r.time ? ` <span class="l14-t">🕖 ${nbClock(r.time)}</span>` : ''}</p>` : ''; };
  const noted = Object.keys((S.notebook && S.notebook.clues) || {}).filter(nbHas).length;
  /* the shared lesson-complete screen (engine ui/cards.js) */
  openLessonComplete({ n:14, title:'Lezione 14 completata!', sub:"Dov'è il cane? · The past with essere",
    story:`A knock at dawn, a missing dog, and a whole train of witnesses. You asked where he went (<b>è andato</b>), wrote down who saw what and
        <i>when</i>, worked out that there were <b>two dogs</b>, kept a secret, and followed an old man's memory to the room next door. Biscuit is back
        with Margaret (with one last biscuit from Luca and Sofia), and outside the window: the lagoon. <b>Benvenuti a Venezia!</b>`,
    sections:[{ title:'Your notebook', html:`<div class="l13-said">${nbRow('ernesto-visto', 'Ernesto')}${nbRow('lina-visto', 'Lina')}${nbRow('ernesto-ricordato', 'Ernesto')}${nbRow('bambini', 'Luca e Sofia')}
        ${L.promised ? '<p>🤫 <i>And one secret you promised to keep.</i></p>' : ''}</div>` }],
    stats:[[noted, 'clues in your notebook'], [['rinaldi', 'ferri', 'ernesto', 'lina', 'gianni', 'nino'].filter(k => (L.asked[k] || []).length).length, 'people questioned (and two children)'],
      [S.sentences, 'sentences said in Italian']],
    next:{ html:'<b>Lezione 15 · Venezia.</b> Out of the station, down the steps, and onto the water: the vaporetto, the canals, the calli…', n:15 } });
}

/* tests: __debug.l14At(state) puts Lesson 14 at the start of a state, everything before it done (the notebook filled as a
   player would have it); __debug.l14Margaret(true | false) makes her follow or not */
Object.assign(window.__debug, {
  l14Start(){ LESSON_HOOKS[14].start(); },
  l14At(at){
    if (cutsceneOn()) cutsceneEnd();
    if (dialogOpen) closeDialog();
    if (!l14On()) LESSON_HOOKS[14].start();
    const L = S.l14, i = L14_ORDER.indexOf(at);
    if (i < 0) return false;
    Object.assign(L, { met:true, follow:true, phase:'' }); S.met.margaret = S.known.margaret = true;
    if (i >= L14_ORDER.indexOf('l14-dining')){ Object.assign(S, { vocab14:true, practiceDone14:true, vocabCheck14:true }); (PX[14] = freshPX()).i = LESSONS[13].exercises.length; L.barrier = true; L.notebook = true; }
    if (i >= L14_ORDER.indexOf('l14-couple')){ L.nothing = { rinaldi:true, ferri:true }; L.pointed = { rinaldi:true, ferri:true }; ['rinaldi-niente', 'ferri-niente', 'camera14'].forEach(id => nbNote(id, { quiet:true })); }
    if (i >= L14_ORDER.indexOf('l14-nino')){ L.inside14 = true; L.bothNoted = true; nbNote('ernesto-visto', { time:true, where:true, quiet:true }); nbNote('lina-visto', { time:true, where:true, quiet:true }); nbNote('ernesto-sentito', { quiet:true }); }
    if (i >= L14_ORDER.indexOf('l14-front')){ L.ninoFront = true; nbNote('nino-davanti', { where:true, quiet:true }); L.phase = 'door'; }
    if (i >= L14_ORDER.indexOf('l14-chef')){ L.cabKnocked = true; L.cabOpen = true; L.cabShut = true; L.promised = true; L.phase = ''; S.met.gianni = S.known.gianni = true; S.l6.steps.margaret_door = TYPED_SCRIPTS.margaret_door.steps.length; nbNote('gianni-brigante', { quiet:true }); }
    if (i >= L14_ORDER.indexOf('l14-memory')){ L.chef = true; nbNote('nino-osso', { quiet:true }); }
    if (i >= L14_ORDER.indexOf('l14-reveal')){ L.memoryCome = true; L.memoryHeard = true; L.memoryDone = true; nbNote('ernesto-ricordato', { where:true, quiet:true }); L.phase = 'knock'; }
    S.tut = at; save();
    const spot = { 'l14-dining':{ x:1300, y:300 }, 'l14-couple':{ x:525, y:236 }, 'l14-nino':{ x:1760, y:420 }, 'l14-front':{ x:2300, y:236 }, 'l14-chef':{ x:1760, y:420 }, 'l14-memory':{ x:1760, y:420 }, 'l14-reveal':{ x:635, y:236 } }[at];
    if (spot) travelTo('treno', spot, 'Il Laguna Express', '');
    return true;
  },
});
