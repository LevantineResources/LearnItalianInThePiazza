/* Quest 7 · Il caffè è finito! (afternoon). Design: docs/lessons/12-la-citta.md, the quests; system: engine/quests.js.
   Bar Centrale has run out of coffee. Ask Enzo for one and he tells you: "Il caffè è finito!" Caffè Aurora in San Lorenzo
   has plenty: ask Davide (a stranger at work: Lei) to lend a packet, "Enzo ha bisogno di caffè. Ci può prestare un
   pacco?"; carry it back in the bag; "Ecco il caffè!" (the bag's tiles, Nella borsa) → a free coffee from Enzo.
   Italian: è finito (Lesson 8's è finita), ha bisogno di (needs), prestare (to lend), Ci può …? (polite), il pacco.
   A template for a giving quest: a bag item (items), a tile conversation with a waiter whose usual engine (Lesson 4's
   restaurant) the talk hook replaces (m7Tiles: the tile bank set up by hand), and giving the item (give:caffe). */

const M7 = { id:'caffe' };
const m7Rec = () => { const r = questRec(M7.id); if (!r.mistakes) r.mistakes = { lend:0, who:0, formal:0 }; if (!r.got) r.got = { who:false, lend:false }; return r; };
/* formatSentence: "Ci può prestare un pacco?" is one question; "Enzo ha bisogno di caffè." a statement */
QWORDS.add('ci può'); JOIN.add('ci può'); JOIN.add('enzo ha'); NOTQ.add('bisogno');
const m7Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
const M7_TILES = [
  m7Tile('enzo', 'Enzo', 'Enzo'), m7Tile('ha bisogno di', 'ha bisogno di', 'needs (has need of)'), m7Tile('caffè', 'caffè', 'coffee'),
  m7Tile('il caffè è finito', 'il caffè è finito', 'the coffee has run out'), m7Tile('ci può prestare', 'Ci può prestare…?', 'can you lend us…? (polite)'),
  m7Tile('un pacco', 'un pacco', 'a packet'), m7Tile('per enzo', 'per Enzo', 'for Enzo'),
];
const M7_COFFEES = () => ITEMS.filter(i => i.kind === 'coffee').map(i => `${i.art} ${i.w}`);
const m7Enzo = n => !!n && n.id === 'enzo' && ['open', 'active'].includes(questState(M7.id));
const m7Davide = n => !!n && n.id === 'davide' && questAt(M7.id, 'davide');

QUESTS.push({
  id:M7.id, n:7, title_it:'Il caffè è finito!', title_en:'The bar is out of coffee',
  window:'afternoon',
  place:{ scene:'piazza', x:790, y:198, label:'Bar Centrale' },
  giver:'enzo',
  steps:[
    { id:'davide', en:'Ask Davide at Caffè Aurora (San Lorenzo) to lend Enzo a packet of coffee', who:'davide', where:'Caffè Aurora, Via dei Mille 12' },
    { id:'back', en:'Take the coffee back to Enzo at Bar Centrale', who:'enzo', where:'Bar Centrale, Piazza Centrale' },
  ],
  items:{ caffe:{ label_it:'il caffè', label_en:'the coffee: a packet from Davide, for Enzo', for:'enzo', icon:'☕' } },
  stamp:{ icon:'☕', color:'#7a3a2a', label:'Bar Centrale' },
  scheda:{
    phrases:[
      ['Il caffè è finito!', "The coffee's run out!", 'Finito: finished, all gone. (Lesson 8: la taglia è finita.)'],
      ['Enzo ha bisogno di caffè.', 'Enzo needs coffee.', 'Avere bisogno di: to need (literally, to have need of).'],
      ['Ci può prestare un pacco?', 'Can you lend us a packet?', 'Ci = (to) us. Può: polite, to a stranger at work.'],
      ['Ecco il caffè!', "Here's the coffee!", 'Ecco + what you hand over.'],
    ],
    how:`<p><b>Ha bisogno di</b> + a thing: he / she needs it. <i>Enzo ha bisogno di caffè.</i> For yourself: <b>ho bisogno di</b> …</p>
      <p><b>Ci può …?</b> Can you … for us? (polite, <i>Lei</i>). To a friend: <i>ci puoi …?</i> <b>Prestare</b> = to lend: <i>Ci può prestare un pacco?</i></p>
      <p><b>È finito</b>: it has run out. The ending agrees: <i>il caffè è finit<b>o</b></i>, <i>la pizza è finit<b>a</b></i>.</p>`,
    culture:`<p>An espresso at the counter (<i>al banco</i>) costs about a euro and is drunk standing up, in three sips. Neighbouring bars help each other out: running out of coffee is a bar's worst nightmare.</p>`,
    vocab:[
      { group:'Out of coffee', words:[
        { it:'Il caffè è finito!', en:"The coffee's run out!", also:['finito'] },
        { it:'ha bisogno di …', say:'Enzo ha bisogno di caffè.', en:'he / she needs …', also:['bisogno'] },
        { it:'ho bisogno di …', say:'Ho bisogno di un caffè.', en:'I need …', also:['ho'] },
        { it:'prestare', en:'to lend' },
        { it:'Ci può prestare …?', say:'Ci può prestare un pacco?', en:'Can you lend us …? (polite)', also:['ci'] },
        { it:'il pacco', g:'m', en:'the packet, the parcel', also:['pacco'] },
        { it:'Offro io!', en:"It's on me!", also:['offro'], quiz:false },
        { it:'con piacere', en:'with pleasure', quiz:false },
      ] },
    ],
    exercises:[
      { type:'mc', q:'The bar has no coffee left: “Il caffè è ___!”', opts:['finita', 'finito', 'finiti'], a:1, why:'Il caffè is masculine: finito.', nudge:'Il caffè: masculine, one.' },
      { type:'mc', q:'Enzo needs coffee: “Enzo ___ bisogno di caffè.”', opts:['è', 'ha', 'ho'], a:1, why:'Avere bisogno di: Enzo ha bisogno di caffè.', nudge:'It is avere: he has need of it.' },
      { type:'mc', q:'You ask Davide, a waiter you don\'t know, to lend you something:', opts:['Ci puoi prestare un pacco?', 'Ci può prestare un pacco?', 'Prestare un pacco!'], a:1, why:'A stranger at work: Lei, può.', nudge:'He is a stranger at work.' },
      { type:'mc', q:'You hand Enzo the packet: “___ il caffè!”', opts:['Prego', 'Ecco', 'Grazie'], a:1, why:'Ecco: here it is, here you are.', nudge:'The word for handing something over.' },
    ],
    tiles:M7_TILES,
  },
  hooks:{
    /* Enzo: a coffee order starts it (any coffee: they are all off); the packet back finishes it */
    talk(npc){
      if (m7Davide(npc)) return m7DavideOpen(npc);
      if (m7Enzo(npc)){ convo.m7 = true; }
      return false;
    },
    bank(npc, groups, names){
      if (!m7Davide(npc)) return null;
      if (schedaDone(M7.id)) groups.push({ label:'Il caffè è finito!', tiles:M7_TILES.map(t => ({ ...phraseTile(t), name:t.key === 'enzo' })) });
      groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
      groups.push({ label:'Al bar', tiles:[L10_BUY[0], L10_BUY[2]].map(phraseTile) });
      return groups;
    },
    phrases(npc){
      if (m7Enzo(npc)) return M7_COFFEES().map(c => ['m7:coffee', c]);
      if (!m7Davide(npc)) return [];
      return [['m7:need:enzo', 'enzo ha bisogno di caffè'], ['m7:need:enzo', 'enzo ha bisogno di un pacco'], ['m7:need', 'ha bisogno di caffè'], ['m7:need', 'ha bisogno di'],
        ['m7:enzo', 'enzo'], ['m7:enzo', 'per enzo'], ['m7:finished', 'il caffè è finito'], ['m7:finished', 'è finito'],
        ['m7:lend', 'ci può prestare'], ['m7:lend', 'può prestare'], ['m7:lend:tu', 'ci puoi prestare'], ['m7:lend:tu', 'puoi prestare'],
        ['m7:pack', 'un pacco'], ['m7:pack', 'un pacco di caffè'], ['m7:coffee', 'caffè'], ...M7_COFFEES().map(c => ['m7:order', c])];
    },
    react(id, n, st, add, out, ints){ return m7React(id, n, st, add, out, ints || [id]); },
    hint(n, st){ return m7Hint(n, st); },
    afterTurn(n, out){ return m7After(n, out); },
  },
});
/* Enzo's opening by step */
{
  const e = NPC.enzo, keep = k => { const d = Object.getOwnPropertyDescriptor(e, k); return () => d.get ? d.get() : d.value; };
  const op = keep('opening'), re = keep('revisitOpening');
  const step = () => questAt(M7.id, 'davide') ? { it:'Buongiorno, {Me}! Eh… ancora niente caffè.', en:'Good afternoon, {Me}! Ah… still no coffee.' }
    : questAt(M7.id, 'back') ? { it:'Ah, {Me}! Allora?', en:'Ah, {Me}! Well?' } : null;
  Object.defineProperty(e, 'opening', { configurable:true, enumerable:true, get:() => step() || op() });
  Object.defineProperty(e, 'revisitOpening', { configurable:true, enumerable:true, get:() => step() || re() });
}
/* Davide: a tile conversation instead of the restaurant (openConvo would send a waiter to Lesson 4's engine) */
function m7DavideOpen(npc){
  convo.known = true; convo.m7 = true;
  $('#dlgWho').innerHTML = `<b>Davide</b> <span class="where">· Caffè Aurora</span>`;
  convo.words = []; renderBank(); renderSentence();
  builder.hidden = false;
  npcLine('Buongiorno! Mi dica.', 'Good afternoon! How can I help?');
  return true;
}
function m7React(id, n, st, add, out, ints){
  if (m7Enzo(n)) return m7EnzoReact(id, n, st, add, out, ints);
  /* thanks / goodbye to Davide, once he has lent the packet */
  if (n.id === 'davide' && convo && convo.m7 && questAt(M7.id, 'back') && (id === 'thanks' || id === 'bye')){
    if (!out.m7) add('Prego! Saluti a Enzo!', "You're welcome! Say hello to Enzo for me!"); out.m7 = true; out.end = true; return true;
  }
  if (!m7Davide(n)) return false;
  if (!id.startsWith('m7:')) return false;
  out.asked = true;
  if (out.m7) return true;
  out.m7 = true;
  const r = m7Rec(), has = p => ints.some(x => x.startsWith(p));
  const who = has('m7:need:enzo') || has('m7:enzo') || (has('m7:need') && r.got.who) || (has('m7:finished') && ints.includes('m7:enzo'));
  const lend = has('m7:lend'), tu = ints.includes('m7:lend:tu');
  if (who) r.got.who = true;
  if (lend) r.got.lend = true;
  if ((lend || (who && r.got.lend)) && r.got.who){
    add('Il caffè è finito al Bar Centrale? Ma certo!', 'The Bar Centrale has run out of coffee? But of course!');
    add('Ecco un pacco di caffè. Per Enzo, con piacere!', 'Here\'s a packet of coffee. For Enzo, with pleasure!');
    if (tu){ out.m7formal = true; r.mistakes.formal++; }
    out.m7got = true; save(); return true;
  }
  if (lend){ add('Un pacco di caffè? Sì… ma per chi?', 'A packet of coffee? Yes… but who for?'); r.mistakes.who++; save(); out.m7fb = 'He doesn\'t know why you want it. Tell him whose bar has run out.'; if (tu) out.m7formal = true; return true; }
  if (who || has('m7:need') || has('m7:finished')){
    add(who || r.got.who ? 'Enzo, del Bar Centrale? Il caffè è finito? Mamma mia!' : 'Ha bisogno di caffè? Chi?', who || r.got.who ? 'Enzo, from Bar Centrale? He\'s out of coffee? Goodness!' : 'Needs coffee? Who?');
    save(); out.m7fb = who || r.got.who ? 'Now ask him to lend a packet. He\'s a stranger at work: polite.' : 'Say who needs it.'; out.m7step = 'lend'; return true;
  }
  if (has('m7:order')){ add('Un caffè per Lei? Subito! … Ecco.', 'A coffee for you? Right away! … Here you are.'); out.m7fb = 'That was a coffee for you. Enzo needs a whole packet, to lend.'; return true; }
  if (has('m7:pack') || has('m7:coffee')){ add('Un pacco? Di caffè? Per chi?', 'A packet? Of coffee? Who for?'); out.m7fb = 'Tell him who needs it, and ask him to lend it: politely.'; return true; }
  add('Mi dica.', 'How can I help?'); out.m7fb = 'Tell Davide what Enzo needs, and ask him to lend it.'; return true;
}
function m7EnzoReact(id, n, st, add, out, ints){
  const s = questState(M7.id);
  if (id === 'give:caffe' && questAt(M7.id, 'back')){
    if (out.m7) return true; out.m7 = true; out.asked = true;
    add('Il caffè! Grazie mille, {Me}!', 'The coffee! Thank you so much, {Me}!');
    add('Ecco un caffè per Lei. Offro io!', "Here's a coffee for you. It's on me!");
    out.m7done = true; return true;
  }
  if (id !== 'm7:coffee') return false;
  if (out.m7) return true; out.m7 = true; out.asked = true;
  if (s === 'open'){
    add('Un caffè? Mi dispiace, {Me}… il caffè è finito!', "A coffee? I'm sorry, {Me}… the coffee's run out!");
    add('Niente caffè, oggi! Il Caffè Aurora, in San Lorenzo, ha sempre tanto caffè… ma io non posso lasciare il bar.', "No coffee today! Caffè Aurora, in San Lorenzo, always has lots of coffee… but I can't leave the bar.");
    out.m7start = true; return true;
  }
  if (questAt(M7.id, 'back') && bagHas('caffe')){ add('Il caffè è finito… ma Lei ha un pacco?', "The coffee's run out… but have you got a packet?"); out.m7fb = 'You have what he needs: hand it over, the <b>Nella borsa</b> tiles.'; return true; }
  add('Il caffè è finito, eh! Niente caffè.', "The coffee's run out, I told you! No coffee."); out.m7fb = 'Davide at Caffè Aurora, in San Lorenzo, has coffee.';
  return true;
}
function m7After(n, out){
  if (m7Enzo(n)){
    if (out.m7start){ enqueue(() => questStart(M7.id)); sysLine('Enzo is out of coffee! Caffè Aurora, in San Lorenzo, always has plenty: maybe <b>Davide</b>, the waiter there, could lend him some.'); showHint('A new task! Say goodbye to Enzo: its <b>scheda</b> opens with the words you need.', 'Fatto!'); return true; }
    if (out.m7done){ enqueue(() => { questDone(M7.id); }); convo.keepHint = true; showHint('Done! A free coffee, and a stamp in your passport.', 'Fatto!'); enqueue(() => { if (convo) endConvo(); }); return true; }
    /* served something else while the quest is open: Enzo mentions the coffee */
    if (out.served && questState(M7.id) === 'open'){
      npcLine(fill('E il caffè? Mi dispiace, {Me}: oggi il caffè è finito!'), fill("And coffee? I'm sorry, {Me}: the coffee's run out today!"));
      sysLine('Enzo is out of coffee! Caffè Aurora, in San Lorenzo, always has plenty: maybe <b>Davide</b>, the waiter there, could lend him some.');
      enqueue(() => questStart(M7.id)); showHint('A new task! Say goodbye to Enzo: its <b>scheda</b> opens with the words you need.', 'Fatto!'); return true;
    }
    if (out.m7fb){ showHint(out.m7fb); return true; }
    return false;
  }
  if (!m7Davide(n) && !out.m7got) return false;
  if (out.m7got){
    enqueue(() => { bagAdd('caffe', questById(M7.id)); questStep(M7.id, 'back'); });
    sysLine('<b>Il caffè</b> is in your bag.');
    showHint((out.m7formal ? 'He didn\'t mind, but Davide is a stranger at work: <b>può</b>, not puoi. ' : '') + 'Got it! Thank him, then take the coffee back to Enzo at <b>Bar Centrale</b>.', 'Fatto!');
    return true;
  }
  if (!schedaDone(M7.id)){ showHint('First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).'); return true; }
  if (out.m7fb){ showHint(hintAfter(stepTries(convo.st, 'm7-' + (m7Rec().got.who ? 'lend' : 'who')), out.m7fb + (out.m7formal ? ' And he\'s a stranger at work: <b>può</b>, not puoi.' : ''), m7Strong()), 'Consiglio'); return true; }
  return false;
}
const m7Strong = () => m7Rec().got.who ? 'Ask him to lend it, politely: <b>Ci può prestare</b> …' : 'Say who needs it: <b>Enzo ha bisogno di</b> …';
function m7Hint(n, st){
  if (m7Enzo(n)){
    if (questState(M7.id) === 'open') return { h:'Order something at the bar: a coffee, perhaps?', step:'m7-order' };
    if (questAt(M7.id, 'back')) return { h:'You have what Enzo needs. Hand it over: the <b>Nella borsa</b> tiles.', strong:'Hand it over: <b>Ecco</b> … (the Nella borsa tiles).', step:'m7-give' };
    return { h:'Davide at Caffè Aurora, in San Lorenzo, has coffee. Say goodbye to Enzo and go there.', step:'m7-go' };
  }
  if (!m7Davide(n)) return null;
  if (!schedaDone(M7.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
  return { h:'Tell Davide what Enzo needs, and ask him to lend it. He\'s a stranger at work: polite.', strong:m7Strong(), step:'m7-' + (m7Rec().got.who ? 'lend' : 'who') };
}
