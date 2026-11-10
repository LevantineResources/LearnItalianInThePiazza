/* Lesson 7 · Al mercato. Lesson flow: start, Mark's opening beat, Bruno's directions, the map route, the
   barrier at Teresa's stall, completion screen and skip. The stall conversations are in stalls.js.
   Design: docs/lessons/07-al-mercato.md.

   Saved state: S.l7 = { prices:{ maglietta, cravatta, fiori, melone }, noted:{ vendorId:price }, notes, routeOK,
   told, barrier, markAsked (Mark has asked "how much is the shirt?" at Teresa's), asked, repeats, wrong, allNoted }. Prices are random per playthrough (the three required ones
   all different) and stay the same for Lesson 8. Tests read S.l7 through __dbg().l7. */

QWORDS.add('costa');
CLAUSE.add('quanto');

/* ---------- state ---------- */
function l7Prices(){
  const pick = ([a, b]) => a + Math.floor(Math.random() * (b - a + 1));
  const out = {}, used = new Set();
  Object.values(L7_STALLS).forEach(s => {
    let x; do { x = pick(s.range); } while (s.req && used.has(x));
    if (s.req) used.add(x);
    out[s.item] = x;
  });
  return out;
}
const freshL7 = () => ({ prices:l7Prices(), noted:{}, notes:null, routeOK:false, told:false, barrier:false, markAsked:false, asked:0, repeats:0, wrong:0, allNoted:false });
const l7NotedCount = () => S.l7 ? L7_REQUIRED.filter(id => S.l7.noted[id] !== undefined).length : 0;
const l7AllNoted = () => l7NotedCount() === L7_REQUIRED.length;
const l7NextStall = () => S.l7 ? L7_REQUIRED.find(id => S.l7.noted[id] === undefined) || null : null;
/* the state after the practice: the drill first, unless it is already mastered */
const l7AfterPractice = () => S.numbers && S.numbers.mastered ? 'l7-prices' : 'l7-numbers';

/* ---------- Bruno: the way to the market (Lei forms). Lessons 1–6 are unchanged: he only has these
   directions from Lesson 7 on, and his Lesson 7 opening and goodbye are getters. ---------- */
Object.assign(NPC.bruno, { needDirIn:['l7-ask'], askModel:"Scusi, dov'è il mercato?" });
NPC.bruno.directions = Object.assign(NPC.bruno.directions || {}, { mercato:L7_BRUNO_DIR });
{
  const open = NPC.bruno.revisitOpening;
  Object.defineProperty(NPC.bruno, 'revisitOpening', { configurable:true, enumerable:true,
    get:() => S.lesson === 7 && ['l7-start', 'l7-ask'].includes(S.tut)
      ? { it:'Buongiorno, {Me}! … Oh, no! Mark, il caffè!', en:'Good morning, {Me}! … Oh no! Mark, the coffee!' } : open });
  Object.defineProperty(NPC.bruno, 'dirBye', { configurable:true, enumerable:true,
    get:() => S.lesson === 7 ? { it:'Prego! E… good luck with the shirt, Mark!', en:'You\'re welcome! And… (in English) “good luck with the shirt, Mark!”' }
      : { it:'Prego! Buona giornata!', en:"You're welcome! Have a nice day!" } });
}
/* Emma has gone home by Lesson 7 (she is Mark's date, revealed in Lesson 8) */
if (!NPC.emma.hideFrom) NPC.emma.hideFrom = 7;
/* the vendors open with "Cosa cerca?" in Lesson 7 (cosa from Lesson 2's "Cosa prende?", cerca: the Lei form of
   Lesson 6's "cerco") */
Object.keys(L7_STALLS).forEach(id => {
  const n = NPC[id], open = n.opening;
  Object.defineProperty(n, 'opening', { configurable:true, enumerable:true,
    get:() => S.lesson === 7 ? { it:'Buongiorno! Cosa cerca?', en:'Good morning! What are you looking for?' } : open });
  /* asked "dov'è il mercato?" at the market (e.g. trying to ask the price with the tiles you have): "it's here!" */
  if (n.directions === undefined) Object.defineProperty(n, 'directions', { configurable:true, enumerable:true,
    get:() => S.lesson === 7 ? { mercato:{ intro:{ it:'Il mercato? È qui!', en:"The market? It's here!" }, lines:[] } } : undefined });
});

LESSON_HOOKS[7] = {
  n:7,
  vocab:L7_TILES,
  vocabNote:'In your tile bank at the market stalls.',
  bankTiles:[...L7_POLITE, L7_PLACE_TILE],                 // also in this lesson's bank: checked by the vocab audit
  doneTut:'l7-done',
  bookPulse:['l7-handbook', 'l7-vocab', 'l7-practice'],
  mapPulse:['l7-route'],
  numbersPulse:['l7-numbers'],

  objective:{
    'l7-start':'Talk to Mark',
    'l7-ask':'Ask Bruno the way to the market',
    'l7-route':() => S.l7 && S.l7.routeOK ? 'Walk to the market' : 'Trace the route to the market',
    'l7-market':'Ask how much the shirt is',
    'l7-handbook':'Open your handbook',
    'l7-vocab':'Learn the Lesson 7 words',
    'l7-practice':'Finish the Lesson 7 practice',
    'l7-numbers':'Master the numbers drill',
    'l7-prices':() => `Ask the prices for Mark · ${l7NotedCount()}/3`,
    'l7-done':'Lezione 7 completata',
  },
  guide:{
    'l7-start':near => near === NPC.mark ? 'Press <kbd>E</kbd> to talk to Mark.' : "Mark is waving at you from <b>Bar Centrale</b>, and he doesn't look happy.",
    'l7-ask':"Ask Bruno where the market is. He's older and formal, so speak to him like a stranger: the polite <i>Lei</i> forms.",
    'l7-route':() => S.l7 && S.l7.routeOK ? 'Route marked. Open the map (<kbd>M</kbd>) and walk to the <b>Mercato</b>. Mark will follow you.'
      : "Open the map (<kbd>M</kbd>) and trace Bruno's directions from the piazza. Mark is following you.",
    'l7-market':near => near === NPC.teresa ? (S.l7 && S.l7.markAsked ? "Press <kbd>E</kbd> to talk to Teresa. Mark wants the price: try the tile with Mark's question."
        : "Press <kbd>E</kbd> to talk to Teresa. She's a stranger: greet her politely first.")
      : "Mark wants to know how much the blue shirt on <b>Teresa's</b> stall is (<i>Magliette</i>, top left). Go and talk to her.",
    'l7-handbook':() => {
      /* hooked lessons don't get a "handbook opened" event: move on once Lezione 7 is open in the handbook */
      if (modalOpen && sheet.classList.contains('book') && hbLesson === 7) setTut(vocabCheckDone(7) ? 'l7-practice' : 'l7-vocab');
      return 'Numbers! Open the handbook (<kbd>H</kbd>): <b>Lezione 7 · Al mercato</b>.';
    },
    'l7-vocab':'Read Lezione 7. Then learn its words: open the <b>Words</b> tab, flip through the flashcards and pass the quiz. The <b>Practice</b> opens after that.',
    'l7-practice':'Words learned! Now finish the <b>Practice</b> tab of Lezione 7.',
    'l7-numbers':'Open the numbers drill (<kbd>N</kbd>, or the <b>Numeri</b> button). Spell 0–20 and back, then listen and type.',
    'l7-prices':() => {
      const left = L7_REQUIRED.filter(id => !S.l7 || S.l7.noted[id] === undefined).map(id => `<b>${L7_STALLS[id].en}</b>`);
      return "Ask each vendor the price (greet them first!) and write each price in Mark's notepad."
        + (left.length ? ` Still to do: ${listJoin(left, 'and')}.` : '');
    },
    'l7-done':() => 'Lezione 7 completata! Mark has his shirt picked out.' + (hookFor(8) && hookFor(8).start ? ` <button class="gbtn" data-action="l8">Start Lezione 8 · ${esc(LESSONS[7].title)}</button>` : ''),
  },
  markers:{ 'l7-start':'mark', 'l7-ask':'bruno', 'l7-market':'teresa', get 'l7-prices'(){ return l7NextStall(); } },

  start(){
    if (modalOpen) closeModal();
    S.lesson = 7; S.l5follow = false; S.brunoFollow = false; S.l7 = freshL7();
    S.l5intros.bruno = true;          // Mark and Bruno met in Lesson 6
    setTut('l7-start'); lastGuide = '';
    travelTo('piazza', { x:700, y:400 }, 'La mattina dopo', 'The next morning');
    setTimeout(() => toast('<b>Lezione 7 · Al mercato</b> has started'), 1800);
  },
  /* the end of Lesson 7: at the market with Mark, all three prices in his notepad, the numbers mastered */
  skip(){
    const l7 = Object.assign(freshL7(), { routeOK:true, told:true, barrier:true, markAsked:true, allNoted:true, notes:L7_BRUNO_DIR.lines.map(l => ({ ...l })) });
    L7_REQUIRED.forEach(id => { l7.noted[id] = l7.prices[L7_STALLS[id].item]; });
    Object.assign(S, { lesson:7, vocab7:true, practiceDone7:true, tut:'l7-done', scene:'mercato', l5follow:true, brunoFollow:false, l7 });
    S.numbers = { introDone:true, best:NUM_MASTER, mastered:true };
    S.l5intros.bruno = true;
    L7_REQUIRED.forEach(id => { S.met[id] = S.known[id] = true; });   // their names are on their stall signs
    (PX[7] = freshPX()).i = LESSONS[6].exercises.length;
  },
  restore(){
    if (S.lesson < 7) return;
    if (!S.l7 || typeof S.l7 !== 'object') S.l7 = freshL7();
    const f = freshL7();
    Object.keys(f).forEach(k => { if (S.l7[k] === undefined || S.l7[k] === null && k !== 'notes') S.l7[k] = f[k]; });
    Object.keys(f.prices).forEach(k => { if (typeof S.l7.prices[k] !== 'number') S.l7.prices[k] = f.prices[k]; });
    /* saves from before the word check: the practice is locked until the words are learned */
    if (S.tut === 'l7-practice' && !vocabCheckDone(7)) S.tut = 'l7-vocab';
  },

  /* Mark's coffee stain; arriving at the market */
  place(){
    const m = NPC.mark;
    if (S.lesson === 7){ m.stain = S.tut !== 'l7-done'; m.l7stain = true; }
    else if (m.l7stain){ m.stain = false; m.l7stain = false; }
    /* (placeMark has just put them at their Lesson 6 spots, whose name tags overlap) */
    if (S.lesson === 7 && !S.l5follow){ m.x = 880; m.y = 238; m.baseFace = { x:-1, y:0 }; }
    if (S.lesson === 7 && !S.brunoFollow){ const b = NPC.bruno; b.x = 796; b.y = 232; b.baseFace = { x:1, y:0 }; }
    if (S.lesson === 7 && S.tut === 'l7-route' && S.scene === 'mercato' && S.l7){
      setTut('l7-market');
      setTimeout(() => toast('<b>Piazza delle Erbe.</b> Mark: “There! The blue shirt, on that stall. Go and see how much it is!”'), 900);
    }
  },

  talk(npc){
    if (S.lesson !== 7 || !S.l7) return false;
    if (npc.id === 'mark') return l7MarkTalk();
    if (npc.id === 'teresa' && S.tut === 'l7-market' && !S.l7.barrier){ l7BarrierOpen(npc); return false; }   // the tile bank, as usual
    if (npc.id === 'bruno' && ['l7-start', 'l7-ask'].includes(S.tut)) convo.companion = NPC.mark;   // they share a table
    if (L7_STALLS[npc.id]) l7StallOpen(npc);
    return false;
  },

  /* the word check (ui/vocab.js) is passed: on to the practice */
  onVocab(){
    if (['l7-market', 'l7-handbook', 'l7-vocab'].includes(S.tut) && S.l7 && S.l7.barrier) setTut('l7-practice');
  },
  onPractice(){
    toast('New tiles: <b>Al mercato</b>. The <b>numbers drill</b> is open: press <kbd>N</kbd>.');
    if (['l7-market', 'l7-handbook', 'l7-vocab', 'l7-practice'].includes(S.tut) && S.l7 && S.l7.barrier) setTut(l7AfterPractice());
    /* "Open the numbers drill": the practice's last button opens the drill (any [data-numbers] button does) */
    if (!(S.numbers && S.numbers.mastered)) setTimeout(() => { const b = $('#pxGo'); if (b) b.dataset.numbers = ''; }, 0);
  },
  onNumbersMastered(){
    if (S.lesson === 7 && S.tut === 'l7-numbers'){ setTut('l7-prices'); toast('Back to the stalls: ask the prices for Mark!'); }
  },

  placeTiles(){ return S.lesson >= 7 ? [L7_PLACE_TILE] : []; },
  mapRoute:{
    key:'l7', who:'Bruno', route:L7_ROUTE, dest:'mercato',
    notes:() => S.l7 && S.l7.notes,
    tracing:() => S.tut === 'l7-route', ok:() => !!(S.l7 && S.l7.routeOK), onOK(){ S.l7.routeOK = true; },
    notThere:"You're not there yet. The market is <b>vicino alla chiesa</b>: near the church.",
    wrong(i, node){
      const at = node.join(',');
      if (i === 1) return 'He started with <b>Vada sempre dritto</b>: go straight first.';
      if (i === 2) return at === '3,3' ? '<b>Giri a sinistra</b>: left, not right.' : '<b>Alla prima strada</b>: turn at the first street.';
      if (i === 3) return at === '1,4' ? '<b>Poi giri a destra</b>: right, not left.' : '<b>Poi giri a destra</b>: turn right, don\'t carry straight on.';
      if (i === 4) return at === '2,2' ? '<b>Alla farmacia giri a sinistra</b>: left at the pharmacy, not right.' : '<b>Alla farmacia giri a sinistra</b>: turn at the pharmacy.';
      if (i === 5) return '<b>E poi subito a destra</b>: then right, straight away.';
      return null;
    },
  },
  dests:{ mercato:() => !!(S.l7 && S.l7.routeOK) },

  onClose(){
    if (S.lesson !== 7 || !S.l7) return false;
    if (S.tut === 'l7-prices' && l7AllNoted()){ setTut('l7-done'); setTimeout(openComplete7, 350); return true; }
    return false;
  },
};

/* ---------- Mark ---------- */
function l7MarkTalk(){
  const say = t => npcLine(t, null, { english:true });
  const leave = () => showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  if (S.tut === 'l7-start'){
    say('Look at this. A whole cappuccino, all down my shirt.');
    say("And I've got a date tonight! I can't go like this.");
    say("I need a new shirt. Is there a market around here? … Bruno will know. Ask him!");
    showChoices([{ label:'“Leave it to me.”', primary:true, cls:'english', fn:() => {
      choices.hidden = true; meLine('Leave it to me.', { english:true });
      enqueue(() => { S.l7.told = true; if (S.tut === 'l7-start') setTut('l7-ask'); });
      leave();
    } }]);
    return true;
  }
  const noted = l7NotesEn();
  const lines = {
    'l7-ask':"Bruno's right there. Ask him where the market is. Il… mercato? Is that the word?",
    'l7-route':S.l7.routeOK ? "Lead the way! I'm right behind you." : 'Bruno said something about a pharmacy and a church. Can you put it on the map (M)?',
    'l7-market':'The blue one, on the T-shirt stall! Go and ask her how much.',
    'l7-handbook':"Numbers. Of course it's numbers. I'll stand here and look stained while you study.",
    'l7-vocab':"Numbers. Of course it's numbers. I'll stand here and look stained while you study.",
    'l7-practice':"Numbers. Of course it's numbers. I'll stand here and look stained while you study.",
    'l7-numbers':"Practise the numbers (N). Say them out loud, it helps. Uno, due, tre… that's all I've got.",
    'l7-prices':'Shirt, tie, flowers. You ask, I write.' + (noted ? ` So far: ${noted}.` : ''),
    'l7-done':`${noted ? cap(noted) + '. ' : ''}The shirt it is. Cash machine, then back here. Grazie, amico!`,
  };
  say(lines[S.tut] || 'Hey!');
  leave();
  return true;
}
/* "shirt €15, tie €9" */
function l7NotesEn(){
  if (!S.l7) return '';
  return Object.keys(L7_STALLS).filter(id => S.l7.noted[id] !== undefined).map(id => `${L7_STALLS[id].short.toLowerCase()} €${S.l7.noted[id]}`).join(', ');
}

/* ---------- the barrier: "How much is the shirt?", and you can't understand the answer ----------
   A tile-bank conversation with Teresa (a stranger: Lei). Design: docs/lessons/07-al-mercato.md, the loop, row 4.
   1) The introductions: she opens with "Buongiorno! Cosa cerca?"; you greet her and do the how-are-you exchange (the
      brain answers as usual).
   2) Mark (English): "Ask her how much the shirt is!" The tile bank gets ONE extra tile, Mark's question, a half-Italian
      try built from what you know (Quant'è? from Lesson 2): "Quant'è… the blue shirt?". S.l7.markAsked is saved, so
      after closing and reopening the dialog Mark asks again straight away and the tile is there from the start.
      Small talk is answered as usual; anything else gets a sensible answer (Dov'è il mercato? → Il mercato? È qui!, or
      Eh? Non capisco.), and the hint points at the tile. A goodbye ends the chat (Mark: "Hang on… what about the shirt?").
   3) The tile (alone, or with a greeting): she catches quant'è and answers with the price, fast (rate 1), one listening
      line, text hidden, no English, with S.l7.prices.maglietta (the price later noted for the shirt).
   4) Mark: "What did she say? How much?" → "I… didn't catch the number." → the handbook.
   Per-conversation state: l7St(st) (greeted, how, prompt, since: turns since the greeting). */
const L7_BARRIER_SOCIAL = new Set(['greet', 'ask_how', 'answer_how', 'ask_back', 'ask_name', 'give_name', 'name_only', 'address', 'nice',
  'thanks', 'bye', 'excuse', 'please', 'yes', 'no', 'sir', 'madam', 'and', 'repeat']);
/* what the brain answers sensibly on its own (directions: "Il mercato? È qui!", introducing Mark, …) */
const l7BrainAnswers = id => /^(where:|confirm:|intro_mark|isthis:)/.test(id) || ['mention_mark', 'english', 'noitalian', 'friends', 'far'].includes(id);
/* Mark's question: one tile, two tokens ("quant'è" → how_much, then the English part → l7shirt) */
const L7_ASK_TILE = { key:'l7-quant-shirt', label:'Quant\'è… the blue shirt?', gloss:'How much is it… (Italian, from the bar) the blue shirt? (English)', cls:'mixed',
  tokens:[{ w:"quant'è", label:'Quant\'è…' }, { w:'l7:the-blue-shirt', label:'the blue shirt' }] };
const l7BarrierOn = n => !!n && n.id === 'teresa' && S.lesson === 7 && !!S.l7 && S.tut === 'l7-market' && !S.l7.barrier;
const l7IntroDone = st => { const s = l7St(st); return s.greeted && st.playerToldHow && st.lastQ !== 'how'; };
const l7IsAsk = ints => ints.some(i => i === 'how_much' || i === 'l7shirt' || i === 'ask_cost');

function l7BarrierOpen(npc){
  convo.companion = NPC.mark;
  const asked = !!S.l7.markAsked;
  if (asked) l7St(convo.st).prompt = true;                 // (renderBank runs after this hook: the tile is there)
  setTimeout(() => {
    if (!convo || convo.npc !== npc) return;
    companionLine(asked ? "That's her! Ask her how much the shirt is!" : "That's the one! The blue shirt.");
    showHint(contextHint(false));
  }, 300);
}
/* react (stalls.js): Teresa's answers during the barrier. Small talk goes to the brain; goodbyes end the chat; Mark's
   question (the tile) gets the price; anything else gets a sensible answer */
function l7BarrierReact(id, n, st, add, out, ints){
  const s = l7St(st), ask = s.prompt && l7IsAsk(ints);
  if (id === 'greet'){ s.greeted = true; return false; }
  if (id === 'ask_how' || id === 'answer_how'){ s.how = true; return false; }
  if (id === 'thanks'){ if (!ask) add('Prego!', "You're welcome!"); return true; }
  if (id === 'bye'){ if (!ask){ add('Arrivederci! Buona giornata!', 'Goodbye! Have a nice day!'); out.asked = true; out.end = true; } return true; }
  if (ask && (id === 'how_much' || id === 'l7shirt' || id === 'ask_cost')){
    if (out.l7ask) return true;                                            // (the tile's two parts are one question)
    out.l7ask = true; out.asked = true; st.lastQ = null;
    const it = `Ah, la maglietta blu? ${l7PriceLine('teresa', S.l7.prices.maglietta).it} Bella, eh?`;
    add(it, null, { listen:true, rate:1 });                                // fast, hidden: nobody could tell the number
    return true;
  }
  if (L7_BARRIER_SOCIAL.has(id) || l7BrainAnswers(id)) return false;
  if (ask) return true;                                                    // (the rest of the question)
  /* something she can't make sense of: one "Eh?" for the whole sentence */
  if (!out.l7huh){ out.l7huh = true; out.asked = true; add('Eh? Non capisco.', "Huh? I don't understand."); }
  return true;
}
/* afterTurn (stalls.js): the next step of the barrier */
function l7BarrierTurn(n, out, res){
  const st = convo.st, s = l7St(st);
  if (out.l7ask){ l7BarrierPrice(); return true; }
  if (out.end){ l7Mark(s.prompt ? 'Hang on… what about the shirt?' : "Wait! We haven't asked about the shirt!"); endConvo(); return true; }
  if (!s.prompt && s.greeted) s.since = (s.since || 0) + 1;
  /* Mark asks once the introductions are done (or, if the small talk stalls, two turns after the greeting) */
  if (!s.prompt && (l7IntroDone(st) || s.since > 2)){ l7BarrierPrompt(); return true; }
  showHint(contextHint(false));
  return true;
}
function l7BarrierPrompt(){
  l7St(convo.st).prompt = true;
  S.l7.markAsked = true; save();
  enqueue(() => { hintEl.hidden = true; });
  l7Mark('Ask her how much the shirt is!');
  enqueue(() => { if (convo && l7BarrierOn(convo.npc)) renderBank(); });  // Mark's question: the new tile
  showHint(contextHint(false));
}
/* she has said the price (fast, hidden): nobody can tell what the number was */
function l7BarrierPrice(){
  enqueue(() => { builder.hidden = true; hintEl.hidden = true; });
  l7Mark('What did she say? How much?');
  enqueue(() => { S.l7.barrier = true; save(); if (S.tut === 'l7-market') setTut(S.practiceDone7 ? l7AfterPractice() : 'l7-handbook'); });
  showChoices([{ label:'“I… didn\'t catch the number.”', primary:true, cls:'english', fn:() => {
    choices.hidden = true; meLine("I… didn't catch the number.", { english:true });
    sysLine('You caught <i>maglietta</i> and <i>euro</i>, but not the number. <i>Quant\'è?</i> got you an answer, but at the market prices are <b>said</b>, not written: you need the numbers, and a proper way to ask. Open your handbook, <b>Lezione 7 · Al mercato</b>.');
    showChoices([{ label:'Leave', fn:closeDialog }, { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(7); } }]);
  } }]);
}
/* hint (stalls.js): never the Italian to say. At Mark's question: the tile. */
function l7BarrierHint(st){
  const s = l7St(st);
  if (s.prompt) return { h:"Mark wants the price. You know one way to ask a price from the bar… Try the tile with Mark's question.", step:'ask' };
  if (!s.greeted) return { h:"Teresa is a stranger: greet her politely first.", strong:'Teresa is a stranger: greet her politely first (<b>buongiorno</b>).', step:'greet' };
  if (st.lastQ === 'how') return { h:'She asked how you are.', strong:'She asked how you are: <b>sto bene</b>…', step:'how' };
  return { h:'Now the polite small talk: ask how she is.', strong:'Ask how she is, politely (the <i>Lei</i> form): <b>come</b> …', step:'askhow' };
}

/* ---------- completion ---------- */
function openComplete7(){
  openModal('');
  const rows = Object.keys(L7_STALLS).filter(id => S.l7.noted[id] !== undefined).map(id => {
    const s = L7_STALLS[id], p = S.l7.noted[id];
    return `<div class="entry"><div><div class="w">${esc(s.label)} · €${p}</div><div class="g">${esc(numIt(p))} euro · ${esc(NPC[id].name)}'s stall</div></div></div>`;
  }).join('');
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione 7 completata!</em></h2><p class="sub">Al mercato · Numbers, and how much things cost</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>You asked Bruno the way, traced it to <b>Piazza delle Erbe</b>, learned the numbers <b>0–20</b>, greeted every vendor before talking money, and understood their prices <i>by ear</i> with <b>Quanto costa?</b></p>
      <h3>Mark's notepad</h3>
      <div class="dict people">${rows}</div>
      <h3>Your numbers</h3>${statsBlock([S.l7.repeats, S.l7.repeats === 1 ? 'time you asked a vendor to repeat' : 'times you asked a vendor to repeat'])}
      <div class="next"><p class="kicker">Next</p><p>Mark has picked the shirt. He's off to find a cash machine, and he'll be back for it.</p></div>
      <div class="cta"><button class="btn${hookFor(8) && hookFor(8).start ? '' : ' primary'}" data-close>Keep exploring</button>${hookFor(8) && hookFor(8).start ? '<button class="btn primary" id="goL8">Start Lezione 8</button>' : ''}</div>
    </div>`;
  if (hookFor(8) && hookFor(8).start) $('#goL8').onclick = () => hookFor(8).start();
}
