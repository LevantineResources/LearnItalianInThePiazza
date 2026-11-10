/* Lesson 8 · Mi piace! Lesson flow: start, Mark's news, the barrier at Teresa's stall, who is where (Lucia at the
   market, Mark at the fruit stall / beside you / gone to change), tutorial transitions, completion screen and skip.
   The tile-bank stalls are in stalls.js, the typed scenes (translating for Mark) in scripts.js.
   Design: docs/lessons/08-mi-piace.md.

   Saved state: S.l8 = { told, barrier, mentioned, red, size, friend, gotShirt, fitDone, luciaDone, shirtPaid, wearing,
   rosesAsked, rosesPrice, paid, heardChange, fixed, markBack, markPos, saidBye, left, agree, lo, choiceWrong, s0,
   melonPrice, melonPaid }: melonPrice / melonPaid are Pina's optional melon (null until heard / bought).
   Prices come from Lesson 7 (S.l7.prices: the shirt and the flowers). Gino's change is two euros short.
   s0 = S.l6's typing counters when the lesson started (the typed scripts count into S.l6). Tests read S.l8 via __dbg().l8. */

const L8_SCRIPTS = ['teresa_fitting', 'lucia_opinion', 'teresa_buy'];
const L8_SHIRT = '#c23b2a', L8_WHITE = '#f3efe6';

const freshL8 = () => ({ told:false, barrier:0, mentioned:false, red:false, size:null, friend:false, gotShirt:false, fitDone:false,
  luciaDone:false, shirtPaid:false, wearing:null, rosesAsked:false, rosesPrice:null, paid:false, heardChange:null, fixed:false,
  priceSaid:false, markBack:false, markPos:null, saidBye:false, left:false, agree:0, lo:0, choiceWrong:0, melonPrice:null, melonPaid:null,
  s0:{ lines:S.l6 ? S.l6.lines : 0, clean:S.l6 ? S.l6.clean : 0, models:S.l6 ? S.l6.models : 0 } });
/* the prices (Lesson 7) and the change */
const l8ShirtPrice = () => S.l7.prices.maglietta;
const l8RosesPrice = () => S.l7.prices.fiori;
const l8ShirtChange = () => 20 - l8ShirtPrice();
const l8RightChange = () => 20 - l8RosesPrice();
const l8WrongChange = () => l8RightChange() - 2;
/* "Ecco il resto: sei euro." / "un euro" */
const l8ChangeLine = c => ({ it:`Grazie! Ecco il resto: ${c === 1 ? 'un' : numIt(c)} euro.`, en:`Thank you! Here's your change: ${NUM_EN[c]} ${c === 1 ? 'euro' : 'euros'}.` });
/* Mark is off changing into the white shirt (while you buy the roses), or has gone to get ready */
const l8MarkAway = () => !!S.l8 && ((S.tut === 'l8-roses' && !S.l8.markBack) || S.l8.left);

/* formatSentence: new sentences and question marks for this lesson's phrases */
['ecco', 'mancano', 'la prendo', 'lo prendo', 'a emma', 'ad emma', 'le piace', 'ti piace', 'è per'].forEach(w => CLAUSE.add(w));
['le piace', 'ti piace', 'davvero'].forEach(w => QWORDS.add(w));
['resto non', 'piace a'].forEach(w => JOIN.add(w));

/* the vendors open with "Cosa cerca?" in Lesson 8 too (cosa: Lesson 2's "Cosa prende?"; cerca: Lesson 6's cerco);
   Gino greets you with his flowers when you come for the roses */
Object.keys(L7_STALLS).forEach(id => {
  const n = NPC[id], prev = Object.getOwnPropertyDescriptor(n, 'opening');
  const open = () => prev.get ? prev.get() : prev.value;
  Object.defineProperty(n, 'opening', { configurable:true, enumerable:true,
    get:() => S.lesson !== 8 ? open()
      : id === 'gino' && S.tut === 'l8-roses' ? { it:'Buongiorno! Fiori freschi, di stamattina!', en:'Good morning! Fresh flowers, from this morning!' }
      : { it:'Buongiorno! Cosa cerca?', en:'Good morning! What are you looking for?' } });
});

/* where the dialog header says they are, while Lucia and Mark are at the market */
[['mark', 'Piazza delle Erbe'], ['lucia', 'sketching, Piazza delle Erbe']].forEach(([id, at]) => {
  const n = NPC[id], prev = Object.getOwnPropertyDescriptor(n, 'place'), was = () => prev.get ? prev.get() : prev.value;
  Object.defineProperty(n, 'place', { configurable:true, enumerable:true, get:() => S.lesson === 8 && S.scene === 'mercato' ? at : was() });
});

LESSON_HOOKS[8] = {
  n:8,
  vocab:[...L8_COLOURS, ...L8_BUY, ...L8_FLOWERS],
  vocabNote:'In your tile bank at the market stalls. Number tiles (0–20) come out at the flower stall.',
  bankTiles:[L8_PLEASE],                                   // also in this lesson's bank (with Lesson 7's tiles and the numbers)
  doneTut:'l8-done',
  bookPulse:['l8-handbook', 'l8-vocab', 'l8-practice'],

  objective:{
    'l8-start':'Talk to Mark',
    'l8-teresa':'Ask Teresa for a red shirt',
    'l8-handbook':'Open your handbook',
    'l8-vocab':'Learn the Lesson 8 words',
    'l8-practice':'Finish the Lesson 8 practice',
    'l8-colours':"Find a red shirt in Mark's size",
    'l8-fitting':'Help Mark try it on',
    'l8-lucia':'Ask Lucia what she thinks',
    'l8-buy':'Buy the white shirt for Mark',
    'l8-roses':() => S.l8 && S.l8.markBack ? 'Give Mark the roses' : "Buy red roses at Gino's",
    'l8-done':'Lezione 8 completata',
  },
  guide:{
    'l8-start':near => near === NPC.mark ? 'Press <kbd>E</kbd> to talk to Mark.' : 'Mark is back at the market with cash, and he is grinning. Talk to him.',
    'l8-teresa':"Mark wants the shirt <b>in red</b>, size <b>large</b>. Ask <b>Teresa</b> (<i>Magliette</i>, top left).",
    'l8-handbook':() => {
      if (modalOpen && sheet.classList.contains('book') && hbLesson === 8) setTut(vocabCheckDone(8) ? 'l8-practice' : 'l8-vocab');
      return 'Colours, sizes, “do you like it?” Open the handbook (<kbd>H</kbd>): <b>Lezione 8 · Mi piace!</b>';
    },
    'l8-vocab':'Read Lezione 8. Then learn its words: open the <b>Words</b> tab, flip through the flashcards and pass the quiz. The <b>Practice</b> opens after that.',
    'l8-practice':'Words learned! Now finish the <b>Practice</b> tab of Lezione 8.',
    'l8-colours':"Mark is at the fruit stall, texting. Greet Teresa, then ask her for the T-shirt <b>in red</b>, in Mark's size (<b>large</b>). The handbook has the words.",
    'l8-fitting':"Mark is back to try it on. Talk to <b>Teresa</b>: Mark tells you what to say, and you <b>type</b> it in Italian.",
    'l8-lucia':'Mark wants an honest opinion. <b>Lucia</b> is sketching by the flower stall. She is still a stranger: use the polite <i>Lei</i> forms.',
    'l8-buy':'White shirt, red roses! Buy the <b>white</b> T-shirt for Mark at Teresa\'s stall.',
    'l8-roses':() => {
      const L = S.l8 || {};
      if (L.markBack) return 'Mark is back, in his new white T-shirt. Talk to him.';
      if (L.heardChange !== null && L.heardChange !== undefined && !L.fixed) return "That's two euros short! Tell Gino, politely.";
      return "Mark is changing. Buy <b>red roses</b> at <b>Gino's</b> flower stall with his twenty: greet him, ask for red roses, ask the price, pay, and <b>count your change</b>.";
    },
    'l8-done':() => 'Lezione 8 completata! Mark is off to get ready for his date.' + (hookFor(9) && hookFor(9).start ? ` <button class="gbtn" data-action="l9">Start Lezione 9 · ${esc(LESSONS[8].title)}</button>` : ''),
  },
  markers:{ 'l8-start':'mark', 'l8-teresa':'teresa', 'l8-colours':'teresa', 'l8-fitting':'teresa', 'l8-lucia':'lucia', 'l8-buy':'teresa',
    get 'l8-roses'(){ return S.l8 && S.l8.markBack ? 'mark' : 'gino'; } },

  start(){
    if (modalOpen) closeModal();
    S.lesson = 8; LESSON_HOOKS[7].restore();                       // the Lesson 7 prices are needed
    if (!S.l6 || !S.l6.steps) S.l6 = FRESH().l6;
    S.l5follow = false; S.brunoFollow = false; S.l8 = freshL8();
    L8_SCRIPTS.forEach(k => { delete S.l6.steps[k]; });              // (skipL6 marks every typed script as done)
    setTut('l8-start'); lastGuide = '';
    travelTo('mercato', { x:480, y:556 }, 'Più tardi', 'Later that day');
    setTimeout(() => toast('<b>Lezione 8 · Mi piace!</b> has started'), 1800);
  },
  /* the end of Lesson 8: the shirt and the roses bought, Mark gone to get ready */
  skip(){
    const p = S.l7 ? S.l7.prices.fiori : 8;
    const l8 = Object.assign(freshL8(), { told:true, barrier:2, mentioned:true, red:true, gotShirt:true, fitDone:true, luciaDone:true,
      shirtPaid:true, wearing:'white', rosesAsked:true, rosesPrice:p, paid:true, heardChange:18 - p, fixed:true, markBack:true, saidBye:true, left:true });
    Object.assign(S, { lesson:8, vocab8:true, practiceDone8:true, tut:'l8-done', scene:'mercato', l5follow:false, brunoFollow:false, l8 });
    L8_SCRIPTS.forEach(k => { S.l6.steps[k] = TYPED_SCRIPTS[k].steps.length; });
    (PX[8] = freshPX()).i = LESSONS[7].exercises.length;
  },
  restore(){
    if (S.lesson < 8) return;
    if (!S.l8 || typeof S.l8 !== 'object') S.l8 = freshL8();
    const f = freshL8();
    Object.keys(f).forEach(k => { if (S.l8[k] === undefined) S.l8[k] = f[k]; });
    /* saves from before the word check: the practice is locked until the words are learned */
    if (S.tut === 'l8-practice' && !vocabCheckDone(8)) S.tut = 'l8-vocab';
  },

  /* Lucia sketches at the market in Lesson 8; Mark is at the market when he isn't following you (or nowhere, when
     he has gone off to change) */
  sceneOf(n){
    if (S.lesson !== 8 || !S.l8) return null;
    if (n.id === 'lucia') return 'mercato';
    if (n.id === 'mark') return S.l5follow ? S.scene : l8MarkAway() ? 'away' : 'mercato';
    return null;
  },
  place(){
    const m = NPC.mark, lu = NPC.lucia;
    /* Lucia: at the end of the aisle beside Gino's flower stall, facing the market */
    if (S.lesson === 8){ lu.x = 918; lu.y = 274; lu.baseFace = { x:-1, y:0.2 }; lu.l8moved = true; }
    else if (lu.l8moved){ lu.x = lu.home.x; lu.y = lu.home.y; lu.baseFace = { ...lu.home.face }; lu.l8moved = false; }
    /* Mark's shirt: the red one from the fitting on, the white one when he comes back */
    if (S.lesson === 8 && S.l8){
      if (m.l8body === undefined) m.l8body = m.body;
      m.body = S.l8.wearing === 'red' ? L8_SHIRT : S.l8.wearing === 'white' ? L8_WHITE : m.l8body;
    } else if (m.l8body !== undefined){ m.body = m.l8body; delete m.l8body; }
    if (S.lesson !== 8 || !S.l8 || S.l5follow) return;
    /* where Mark waits (placeMark has just put him at his Bar Centrale spot) */
    const at = (x, y, fx, fy) => { m.x = x; m.y = y; m.baseFace = { x:fx, y:fy }; };
    if (S.l8.markBack && S.l8.markPos) at(S.l8.markPos.x, S.l8.markPos.y, -1, 0);
    else if (S.tut === 'l8-start') at(480, 470, 0, 1);
    else if (S.tut === 'l8-fitting') at(250, 282, 1, -0.3);                 // beside Teresa's stall, out of the aisle
    else at(712, 446, -0.3, -1);                                          // at Pina's fruit stall, texting Emma
  },

  talk(npc){
    if (S.lesson !== 8 || !S.l8) return false;
    if (npc.id === 'mark') return l8MarkTalk();
    if (npc.id === 'teresa' && S.tut === 'l8-teresa' && S.vocab8) setTut('l8-colours');   // practised before the barrier
    return false;
  },
  /* during the fitting Mark stands at Teresa's stall: talking to him starts the fitting */
  redirect(npc){ return S.lesson === 8 && npc.id === 'mark' && S.tut === 'l8-fitting' ? NPC.teresa : null; },

  /* the word check (ui/vocab.js) is passed: on to the practice */
  onVocab(){
    if (['l8-start', 'l8-teresa', 'l8-handbook', 'l8-vocab'].includes(S.tut) && S.l8 && S.l8.barrier >= 2) setTut('l8-practice');
  },
  onPractice(){
    toast('New tiles: <b>Colori</b> and <b>Comprare</b>. Go back to Teresa!');
    if (['l8-start', 'l8-teresa', 'l8-handbook', 'l8-vocab', 'l8-practice'].includes(S.tut) && S.l8 && S.l8.barrier >= 2) setTut('l8-colours');
  },

  onClose(closedId){
    if (S.lesson !== 8 || !S.l8) return false;
    const L = S.l8;
    if (closedId === 'teresa' && S.tut === 'l8-fitting' && L.fitDone){
      S.l5follow = true; trail.length = 0; setTut('l8-lucia');
      toast('Mark is following you, still in the red T-shirt.'); return true;
    }
    if (closedId === 'lucia' && S.tut === 'l8-lucia' && L.luciaDone){ setTut('l8-buy'); return true; }
    if (closedId === 'teresa' && S.tut === 'l8-buy' && L.shirtPaid){
      S.l5follow = false; trail.length = 0; setTut('l8-roses');
      toast("Mark has gone to change. Get the <b>red roses</b> at Gino's!"); return true;
    }
    if (closedId === 'gino' && S.tut === 'l8-roses' && L.fixed && !L.markBack){
      L.markBack = true; L.wearing = 'white'; L.markPos = l8MarkSpot(); save(); renderHUD();
      setTimeout(() => { if (!frozen() && S.tut === 'l8-roses') openConvo(NPC.mark); }, 900);
      return true;
    }
    if (closedId === 'mark' && S.tut === 'l8-roses' && L.markBack && L.saidBye){
      L.left = true; setTut('l8-done'); setTimeout(openComplete8, 350); return true;
    }
    return false;
  },
};

/* where Mark turns up when he comes back: next to you, somewhere free */
function l8MarkSpot(){
  const tries = [[50, 14], [-50, 14], [0, 46], [56, -10], [-56, -10], [40, 50], [-40, 50]];
  for (const [dx, dy] of tries){
    const x = player.x + dx, y = player.y + dy;
    if (!blocked(x, y, 16, true) && activeNpcs().every(n => n.id === 'mark' || Math.hypot(n.x - x, n.y - y) > 44)) return { x, y };
  }
  return { x:player.x, y:Math.min(H - 30, player.y + 50) };
}

/* ---------- Mark ---------- */
function l8MarkTalk(){
  const say = t => npcLine(t, null, { english:true });
  const leave = () => showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  const L = S.l8;
  if (S.tut === 'l8-start'){
    say("Got the cash! And… my date tonight? It's Emma. Yes, Emma from the café!");
    say("She told me red is her favourite colour. Can you get the shirt in red? I'm a large, I think.");
    say("I'll be at the fruit stall, texting her.");
    showChoices([{ label:'“Leave it to me.”', primary:true, cls:'english', fn:() => {
      choices.hidden = true; meLine('Leave it to me.', { english:true });
      enqueue(() => { L.told = true; if (S.tut === 'l8-start') setTut(S.vocab8 ? 'l8-colours' : 'l8-teresa'); });
      leave();
    } }]);
    return true;
  }
  /* back in the white shirt: the end of the lesson */
  if (S.tut === 'l8-roses' && L.markBack){
    convo.mode = 'cutscene';
    say("Ta-da! White shirt. Lucia was right, I look like a film star. … Are those for Emma?");
    say("Red roses, white shirt. I owe you. I've got to get ready!");
    showChoices([{ label:'“Good luck tonight!”', primary:true, cls:'english', fn:() => {
      choices.hidden = true; meLine('Good luck tonight!', { english:true });
      say('Grazie, amico! … See? Practically Italian.');
      sysLine('Mark hurries off across Piazza delle Erbe, the roses held up high like a torch.');
      enqueue(() => { L.saidBye = true; save(); });
      leave();
    } }]);
    return true;
  }
  const lines = {
    'l8-teresa':"Red, large. Teresa's stall, top left. I'll be right here with the melons.",
    'l8-handbook':'Colours? Sizes? All yours. Emma just sent me a heart. A red one, obviously.',
    'l8-vocab':'Colours? Sizes? All yours. Emma just sent me a heart. A red one, obviously.',
    'l8-practice':'Colours? Sizes? All yours. Emma just sent me a heart. A red one, obviously.',
    'l8-colours':"Red. Large. I believe in you. … Don't tell Teresa it's for a date.",
    'l8-lucia':"Lucia! Over there, by the flowers. Ask her what she thinks of the shirt.",
    'l8-buy':"The white one, extra large. Teresa's stall. Lead the way!",
  };
  say(lines[S.tut] || 'Hey!');
  leave();
  return true;
}

/* ---------- the barrier (tiles): Teresa talks fast, and you only catch "maglietta" ----------
   Her fast questions follow from what you said (a T-shirt, the blue one, the price, "can you repeat?"): the blue one is
   sold out, which colour, what size. k: how many fast answers she has given already. */
function l8BarrierLine(ints, k){
  const has = id => ints.includes(id);
  const rest = k ? 'Allora? Rossa, bianca o nera? Le piace questa? Che taglia porta?' : 'Di che colore? Le piace questa? Che taglia porta?';
  if (has('blue')) return 'La blu? Mi dispiace, è finita! ' + rest;
  if (has('repeat')) return 'Sì, sì! La blu è finita, mi dispiace! ' + rest;
  if (has('ask_cost') || has('how_much')) return 'La maglietta? Eh, la blu è finita, mi dispiace! ' + rest;
  if (ints.some(i => i === 'item7:maglietta' || i === 'item8:maglietta' || i.startsWith('this7:'))) return 'Una maglietta? Sì, certo! La blu è finita, mi dispiace. ' + rest;
  return 'Mi dica, mi dica! Una maglietta? La blu è finita! ' + rest;
}

/* ---------- completion ---------- */
function openComplete8(){
  openModal('');
  const L = S.l8, T = S.l6, typed = T.lines - L.s0.lines, clean = T.clean - L.s0.clean;
  const pct = typed ? Math.round(clean / typed * 100) : 0;
  const shirt = l8ShirtPrice(), roses = l8RosesPrice();
  const row = (w, g) => `<div class="entry"><div><div class="w">${w}</div><div class="g">${g}</div></div></div>`;
  /* Pina's melon, if you bought it (optional) */
  const melon = L.melonPaid ? row('il melone', `€${L.melonPrice} at Pina's · paid €${L.melonPaid}${L.melonPaid > L.melonPrice ? `, change €${L.melonPaid - L.melonPrice}` : ''} · a treat, just for you`) : '';
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione 8 completata!</em></h2><p class="sub">Mi piace! · Buying, and what you think</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>You found <b>una maglietta rossa</b> in Mark's size, translated the fitting and Lucia's honest opinion (<b>Le piace?</b>, <b>A Emma piace il rosso</b>), bought the white shirt (<b>la prendo</b>) and the roses (<b>lo prendo</b>), and caught Gino's mistake: <b>Mancano due euro.</b></p>
      <h3>The shopping</h3>
      <div class="dict people">
        ${row('la maglietta bianca', `€${shirt} at Teresa's · paid €20, change €${l8ShirtChange()}`)}
        ${row('le rose rosse', `€${roses} at Gino's · change €${l8RightChange()}, after “Mancano due euro”`)}
        ${melon}
      </div>
      <h3>Your numbers</h3>
      <div class="stats">
        <div><b>${typed}</b><span>sentences typed for Mark</span></div>
        <div><b>${pct}%</b><span>right on the first try</span></div>
        <div><b>${L.choiceWrong}</b><span>${L.choiceWrong === 1 ? 'wrong guess' : 'wrong guesses'} about what someone said</span></div>
      </div>
      <div class="next"><p class="kicker">Next</p><p>Mark is off to get ready, in a white shirt, with red roses. How did it go? You'll have to ask him tomorrow.</p></div>
      <div class="cta"><button class="btn${hookFor(9) && hookFor(9).start ? '' : ' primary'}" data-close>Keep exploring</button>${hookFor(9) && hookFor(9).start ? '<button class="btn primary" id="goL9">Start Lezione 9</button>' : ''}</div>
    </div>`;
  if (hookFor(9) && hookFor(9).start) $('#goL9').onclick = () => hookFor(9).start();
}
