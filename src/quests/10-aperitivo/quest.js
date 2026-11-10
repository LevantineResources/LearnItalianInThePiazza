/* Quest 10 · Aperitivo con Rosa (night). Design: docs/lessons/12-la-citta.md, the quests; system: engine/quests.js.
   Rosa is Lesson 3's lady with the dog in San Lorenzo (she gave you the way to Via dei Mille, and in Lesson 6 she had seen
   your book). In the evening she sits at a table in Caffè Aurora (San Lorenzo, Via dei Mille 12: the café is the
   neighbourhood's bar, Davide serves the aperitivo), sees you and calls you over, using tu (no comment: she just does):
   "Prendi un aperitivo con me?" → "Sì, grazie!" → "Che bello! Siediti! Vuoi qualcosa da bere?" → "Sì, vorrei qualcosa da
   bere." → "Cosa ti piace bere?" → "Mi piace lo spritz." (or il vino, l'acqua; or ask her back: "E tu? Cosa ti piace bere?")
   → "In Italia beviamo lo spritz la sera!" → she sends you to order (Davide, a waiter: Lei): "Due spritz, per favore." →
   Davide goes to the bar (a cutscene: you sit down at her table) and, while you wait, the small talk (tu): "Di dove sei?" →
   "Sono di Londra." → ask her back, "E tu?" / "Di dove sei?" → "Io sono di Padova…" → "Ah, ecco Davide!": he brings the drinks
   and the stuzzichini (a cutscene) → "Facciamo un brindisi!" → "Salute!" / "Cin cin!" → tonight: "Parti per Venezia, vero? A
   che ora parte il treno?" → "Il treno parte alle ventitré e quindici." (your ticket is in the bag) → "Ancora uno
   stuzzichino?" → "Sì, grazie!" / "No, grazie, basta così." → you ask for the bill, "Il conto, per favore!" (or offer to pay,
   "Offro io!") → "No, no! Offro io!" → "Grazie mille, Rosa!" → "Prego! Buon viaggio!" and the stamp. The replies follow what
   you say: uno spritz (and Rosa?), the polite forms to Rosa (she says tu), ciao to Davide, the toast before the drinks are
   here, small talk before the toast, a time that isn't your train's, "Offro io!" from you, a drink that isn't spritz ("Il
   vino? Buono! Ma la sera…").
   Italian: l'aperitivo, lo spritz (uno spritz, due spritz), gli stuzzichini, Vorrei qualcosa da bere, Vuoi qualcosa da bere?,
   Cosa ti piace bere?, In Italia beviamo lo spritz la sera (heard), Facciamo un brindisi!, Salute! / Cin cin!, Offro io!,
   Di dove sei?, basta così; city names (Londra, Dublino, Edimburgo, New York, Sydney, Toronto). Review: Mi piace (Lesson 8),
   Sono di … (Lesson 9), il conto (Lesson 4), parte alle … (Lesson 12), the 24-hour clock (Lesson 10), sì / no.
   The night dressing of Caffè Aurora (candles on the tables, the aperitivo board, the warm light; an APERITIVO board outside in
   Via dei Mille) is drawn here at night. Saved on the quest's record: greeted (you said yes), drink (what you like), spritz
   (she told you about it), ordered, waiting (Davide at the bar), origin (the city), back (you asked her), served, toast,
   train, nibble ('yes' | 'no'), bill (she said offro io), thanked, mistakes:{ formal, count, time }. Tests: __dbg().aperitivo. */
const M10 = { id:'aperitivo', SEAT:{ x:690, y:250, face:{ x:-1, y:0 } }, CHAIR:{ x:612, y:252 }, TABLE:{ x:650, y:250 }, BAR:{ x:740, y:214 },
  CITIES:{ londra:['Londra', 'London'], dublino:['Dublino', 'Dublin'], edimburgo:['Edimburgo', 'Edinburgh'], 'new york':['New York', 'New York'], sydney:['Sydney', 'Sydney'], toronto:['Toronto', 'Toronto'] },
  DRINKS:{ spritz:['lo spritz', 'spritz'], vino:['il vino', 'wine'], acqua:["l'acqua", 'water'] } };
const m10Rec = () => { const r = questRec(M10.id); if (!r.mistakes) r.mistakes = { formal:0, count:0, time:0 }; return r; };
const m10Rosa = n => !!n && n.id === 'rosa' && questState(M10.id) === 'active';
const m10Davide = n => !!n && n.id === 'davide' && questState(M10.id) === 'active' && (questAt(M10.id, 'ordina') || questAt(M10.id, 'attesa'));
const m10Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
const M10_DRINK = [m10Tile('vorrei', 'Vorrei', "I'd like"), m10Tile('qualcosa da bere', 'qualcosa da bere', 'something to drink'), m10Tile('vuoi qualcosa da bere', 'Vuoi qualcosa da bere?', 'do you want something to drink? (to a friend)'),
  m10Tile('cosa ti piace bere', 'Cosa ti piace bere?', 'what do you like to drink? (to a friend)'), m10Tile('mi piace', 'Mi piace', 'I like'),
  m10Tile('lo spritz', 'lo spritz', 'spritz (the drink)'), m10Tile('il vino', 'il vino', 'wine'), m10Tile("l'acqua", "l'acqua", 'water'),
  m10Tile('uno spritz', 'uno spritz', 'a spritz'), m10Tile('due spritz', 'due spritz', 'two spritzes'), m10Tile('per favore', 'per favore', 'please')];
const M10_TOAST = [m10Tile('salute', 'Salute!', 'cheers! (to your health)'), m10Tile('cin cin', 'Cin cin!', 'cheers! (clink)'), m10Tile('basta così', 'basta così', "that's enough"),
  m10Tile('il conto', 'Il conto', 'the bill'), m10Tile('offro io', 'Offro io!', "it's on me!")];
const M10_CHAT = [m10Tile('di dove sei', 'Di dove sei?', 'where are you from? (to a friend)'), m10Tile('sono di', 'Sono di', "I'm from"),
  ...Object.entries(M10.CITIES).map(([k, [it, en]]) => m10Tile(k, it, en))];
const M10_TRAIN = [m10Tile('il treno parte', 'Il treno parte', 'the train leaves'), m10Tile('alle', 'alle', 'at (a time)'), m10Tile('ventitré', 'ventitré', 'twenty-three'), m10Tile('undici', 'undici', 'eleven'),
  m10Tile('e', 'e', 'and'), m10Tile('quindici', 'quindici', 'fifteen'), m10Tile('un quarto', 'un quarto', 'a quarter')];
const M10_BAR = ['vorrei', 'qualcosa da bere', 'uno spritz', 'due spritz', 'per favore'].map(k => M10_DRINK.find(t => t.key === k));
EXCL.add('salute'); EXCL.add('cin cin'); EXCL.add('offro io'); CLAUSE.add('salute'); CLAUSE.add('cin cin'); CLAUSE.add('offro io'); CLAUSE.add('il treno parte');
GREET.add('buonasera'); QWORDS.add('di dove'); CLAUSE.add('di dove'); CLAUSE.add('sono di'); JOIN.add('sono di');
QWORDS.add('vuoi qualcosa'); JOIN.add('cosa ti'); COMMA_BEFORE.add('grazie basta');     /* (formatting is global: nothing that would split another lesson's sentences, like Lesson 13's "perché mi piace") */
/* Sì and No in Rosa's bank (for "Ancora uno stuzzichino?"), unless the set phrases already have them */
const m10HasYesNo = groups => groups.some(g => g.tiles.some(t => /^s[iì]$/i.test((t.label || '').replace(/[.!]/g, ''))));

QUESTS.push({
  id:M10.id, n:10, title_it:'Aperitivo con Rosa', title_en:'An aperitivo with Rosa',
  window:'night',
  place:{ scene:'aurora', x:560, y:330, map:[548, 214], label:'Caffè Aurora, San Lorenzo' },
  giver:'rosa',
  steps:[
    { id:'rosa', en:'Rosa has asked you for an aperitivo: answer her, and talk about drinks', who:'rosa', where:'Caffè Aurora, Via dei Mille 12' },
    { id:'ordina', en:'Order the drinks from Davide', who:'davide', where:'Caffè Aurora' },
    { id:'attesa', en:'While Davide makes the drinks: a chat with Rosa (tu)', who:'rosa', where:'Caffè Aurora' },
    { id:'brindisi', en:'The drinks are here: a toast, and the rest of the evening', who:'rosa', where:'Caffè Aurora' },
  ],
  stamp:{ icon:'🍹', color:'#d9622a', label:'Caffè Aurora' },
  scheda:{
    phrases:[
      ['Vuoi qualcosa da bere? — Sì, vorrei qualcosa da bere.', 'Do you want something to drink? — Yes, I\'d like something to drink.', 'Vuoi: you want (to a friend). Qualcosa da bere: something to drink.'],
      ['Cosa ti piace bere? — Mi piace lo spritz.', 'What do you like to drink? — I like spritz.', 'Ti piace (to a friend) → mi piace (Lesson 8). Ask back: E tu?'],
      ['In Italia beviamo lo spritz la sera.', 'In Italy we drink spritz in the evening.', 'Beviamo: we drink (bere). La sera: in the evening.'],
      ['Due spritz, per favore.', 'Two spritzes, please.', 'Uno spritz (s + consonant takes uno), due spritz: it never changes.'],
      ['Di dove sei? — Sono di Londra. E tu?', 'Where are you from? — I\'m from London. And you?', 'Tu: di dove sei? Sono di + the city.'],
      ['Facciamo un brindisi! — Salute! Cin cin!', "Let's make a toast! — Cheers!", 'Il brindisi: the toast. Raise your glass and look the others in the eye.'],
      ['Ancora uno stuzzichino? — Sì, grazie! / No, grazie, basta così.', 'Another nibble? — Yes, please! / No, thanks, that\'s enough.', 'Basta così: that\'s enough.'],
    ],
    how:`<p><b>Qualcosa da bere</b> = something to drink: <i>Vuoi qualcosa da bere?</i> (to a friend) — <i>Sì, vorrei qualcosa da bere.</i> <b>Cosa ti piace bere?</b> — <i>Mi piace lo spritz, mi piace il vino.</i> (<i>Bere</i>, to drink: <i>beviamo</i> = we drink.)</p>
      <p><b>Uno spritz</b>: before <i>s + consonant</i>, <i>un</i> becomes <b>uno</b> (as <i>lo</i>: <i>lo spritz, lo studente</i>). Two: <b>due spritz</b> (foreign words never change).</p>
      <p><b>Di dove sei?</b> (to a friend; politely: <i>di dov'è?</i>) → <b>Sono di</b> + a city. Ask back: <b>E tu?</b> <b>Facciamo un brindisi!</b> = let's make a toast: <i>Salute!</i> (to your health), <i>Cin cin!</i> (the clink). Rosa pays: <i>Offro io!</i></p>`,
    culture:`<p>From about six in the evening, bars serve the <b>aperitivo</b>: a drink, often a bright orange <i>spritz</i> (Venetian, born in this part of Italy), with <b>stuzzichini</b> (olives, crisps, little bites) brought free with it. Italians often argue over the bill: <i>Offro io!</i> <i>No, offro io!</i></p>`,
    vocab:[
      { group:'Da bere', words:[
        { it:"l'aperitivo", g:'m', en:'the aperitivo (an evening drink with bites)', note:'Prendi un aperitivo con me? Will you have an aperitivo with me?', also:['aperitivo'] },
        { it:'lo spritz', g:'m', en:'the spritz (an orange wine cocktail)', note:'Uno spritz, due spritz. In Italia beviamo lo spritz la sera: in Italy we drink spritz in the evening.', also:['spritz', 'uno', 'beviamo'] },
        { it:'gli stuzzichini', g:'m pl', en:'the nibbles (small bites)', note:'One: lo stuzzichino. Ancora uno stuzzichino? Another nibble?', also:['stuzzichini', 'stuzzichino'] },
        { it:'Vorrei qualcosa da bere.', en:"I'd like something to drink.", also:['qualcosa', 'da', 'bere'] },
        { it:'Vuoi qualcosa da bere?', en:'Do you want something to drink? (to a friend)', also:['vuoi'] },
        { it:'Cosa ti piace bere?', en:'What do you like to drink? (to a friend)', note:'Mi piace lo spritz (il vino, l\'acqua): I like spritz (wine, water).', also:['cosa', 'ti', 'piace', "l'acqua", 'acqua', 'vino'] },
        { it:'basta così', en:"that's enough (no more, thanks)", also:['basta', 'così'], quiz:false },
      ] },
      { group:'Cin cin!', words:[
        { it:'Facciamo un brindisi!', en:"Let's make a toast!", note:'Il brindisi: the toast.', also:['facciamo', 'brindisi'] },
        { it:'Salute! / Cin cin!', en:'Cheers!', note:'Salute: (to your) health. Cin cin: the clink of glasses.', also:['salute', 'cin'] },
        { it:'Offro io!', en:"It's on me! (I'm paying)", also:['offro'] },
        { it:'Di dove sei?', en:'Where are you from? (to a friend)', also:['dove', 'sei'] },
        { it:'Londra · Dublino · Edimburgo', en:'London · Dublin · Edinburgh', note:'Sono di Londra. New York, Sydney, Toronto: the same in Italian.', also:['londra', 'dublino', 'edimburgo', 'new', 'york', 'sydney', 'toronto'], quiz:false },
      ] },
    ],
    exercises:[
      { type:'mc', q:'Rosa: “Cosa ti piace bere?” She wants to know…', opts:['what you like to drink', 'where you are from', 'what time your train leaves'], a:0, why:'Bere: to drink. Ti piace: you like (to a friend).', nudge:'Bere: to drink.', noSpeak:true },
      { type:'mc', q:'You order for you and Rosa:', opts:['Due spritz, per favore.', 'Due spritzi, per favore.', 'Un spritz, per favore.'], a:0, why:'Spritz never changes: due spritz.', nudge:'A foreign word: no plural ending.' },
      { type:'mc', q:'The drinks are here. Rosa: “Facciamo un brindisi!” You say:', opts:['Cin cin!', 'Offro io!', 'Basta così!'], a:0, why:'Un brindisi: a toast. Cin cin! (or Salute!)', nudge:'Glasses up!' },
      { type:'mc', q:'“Ancora uno stuzzichino?” You have had enough:', opts:['No, grazie, basta così.', 'Sì, grazie!', 'Di dove sei?'], a:0, why:'Basta così: that\'s enough.', nudge:'Enough, thanks.' },
    ],
    tiles:[...M10_DRINK, ...M10_TOAST, ...M10_CHAT, ...M10_TRAIN],
  },
  hooks:{
    place(){ m10Sync(); },
    talk(npc){
      if (npc.id === 'rosa' && questState(M10.id) === 'open') return m10Start(npc);
      if (m10Davide(npc)) return m10DavideOpen(npc);
      if (m10Rosa(npc)){ convo.m10 = true; convo.known = true; S.met.rosa = S.known.rosa = true; $('#dlgWho').innerHTML = `<b>Rosa</b> <span class="where">· Caffè Aurora</span>`; }
      return false;
    },
    bank(npc, groups){
      if (m10Davide(npc)){
        if (schedaDone(M10.id)) groups.push({ label:'Al bar', tiles:M10_BAR.map(phraseTile) });
        groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
        return groups;
      }
      if (!m10Rosa(npc)) return null;
      if (!m10HasYesNo(groups)) groups.push({ label:'Sì, no', tiles:[{ key:'sì', label:'Sì', words:'sì', en:'yes' }, { key:'no', label:'No', words:'no', en:'no' }].map(phraseTile) });
      if (schedaDone(M10.id)){
        groups.push({ label:'Da bere', tiles:M10_DRINK.filter(t => t.key !== 'due spritz').map(phraseTile) });
        groups.push({ label:'Cin cin!', tiles:M10_TOAST.map(phraseTile) });
        /* (a city keeps its capital letters in the sentence: Sono di Londra, Sono di New York) */
        groups.push({ label:'Di dove sei?', tiles:M10_CHAT.map(t => { const pt = phraseTile(t); return M10.CITIES[t.key] ? { ...pt, tokens:pt.tokens.map(x => ({ ...x, label:x.w.charAt(0).toUpperCase() + x.w.slice(1) })) } : pt; }) });
        groups.push({ label:'Stasera', tiles:M10_TRAIN.map(phraseTile) });
      }
      groups.push({ label:'Names', tiles:[{ w:'rosa', label:'Rosa', name:true, gloss:'Rosa, from San Lorenzo' }] });
      return groups;
    },
    phrases(npc){
      const D = [['m10:want', 'vorrei qualcosa da bere'], ['m10:want', 'qualcosa da bere'], ['m10:two', 'due spritz'], ['m10:one', 'uno spritz']];
      if (m10Davide(npc)) return [...D, ['m10:bad1', 'un spritz'], ['m10:spritz', 'spritz'], ['m10:spritz', 'lo spritz'], ['greet', 'buonasera'], ['m10:rosa', 'per rosa'], ['m10:me', 'per me']];
      if (!m10Rosa(npc)) return [];
      const P = [...D, ['m10:offer', 'vuoi qualcosa da bere'], ['m10:likeq', 'cosa ti piace bere'], ['m10:likeq', 'e tu cosa ti piace bere'], ['m10:like', 'mi piace'],
        ['m10:d:spritz', 'lo spritz'], ['m10:d:spritz', 'spritz'], ['m10:d:vino', 'il vino'], ['m10:d:vino', 'vino'], ['m10:d:acqua', "l'acqua"], ['m10:basta', 'basta così'],
        ['m10:toast', 'salute'], ['m10:toast', 'cin cin'], ['m10:offro', 'offro io'], ['m10:dove', 'di dove sei'], ['m10:dove', 'e tu di dove sei'], ['m10:dove:lei', "di dov'è"], ['m10:sonodi', 'sono di'],
        ['greet', 'buonasera'], ['m10:parte', 'il treno parte'], ['m10:parte', 'parte'], ['m10:alle', 'alle'],
        ['m10:t:2315', 'ventitré e quindici'], ['m10:t:2315', 'undici e un quarto'], ['m10:t:2315', 'ventitré e un quarto'], ['m10:t:2315', 'undici e quindici'],
        ['m10:t:2300', 'ventitré'], ['m10:t:x', 'quindici'], ['m10:t:x', 'un quarto'], ['m10:t:x', 'undici'], ['rosa', 'rosa']];
      Object.keys(M10.CITIES).forEach(k => P.push(['m10:city:' + k, 'sono di ' + k], ['m10:cityonly:' + k, k]));
      return P;
    },
    react(id, n, st, add, out, ints){ return m10React(id, n, st, add, out, ints || [id]); },
    hint(n, st){ return m10Hint(n, st); },
    afterTurn(n, out, res, words){ return m10After(n, out, words); },
    onClose(closedId){
      const r = questPeek(M10.id);
      if (closedId === 'davide' && r && r.ordered && !r.waiting && !r.served && !cutsceneOn()){ setTimeout(m10Wait, 300); return true; }
      if (closedId === 'rosa' && r && r.ordered && r.origin && r.back && !r.served && M10.arrive && !cutsceneOn()){ M10.arrive = false; setTimeout(m10Serve, 300); return true; }
      if (closedId === 'rosa' && r && r.thanked && !r.done){ questDone(M10.id); return true; }
      return false;
    },
    cutsceneResume({ id }){ if (id === 'm10-serve'){ m10Served(); return true; } if (id === 'm10-bar'){ m10Rec().waiting = true; save(); return true; } return false; },
  },
  onDone(){ m10Sync(); },
});
/* Rosa is at Caffè Aurora in the evening while the task is open or under way (and stays till you leave, once it's done) */
const m10RosaOut = () => { const s = questState(M10.id); return s === 'open' || s === 'active' || (s === 'done' && M10.stay && S.scene === 'aurora'); };
function m10Sync(){
  const ro = NPC.rosa; if (!ro) return;
  if (!ro.home) ro.home = { x:ro.x, y:ro.y, face:{ ...ro.baseFace } };
  const there = m10RosaOut() && sceneOf(ro) === 'aurora';
  ro.seated = there;
  if (there) ro.approach = { x:726, y:266 }; else delete ro.approach;     // (a tap on her: you walk round the table, to her side)
  if (there){ ro.x = M10.SEAT.x; ro.y = M10.SEAT.y; ro.baseFace = { ...M10.SEAT.face }; }
  else if (ro.x === M10.SEAT.x && ro.y === M10.SEAT.y){ ro.x = ro.home.x; ro.y = ro.home.y; ro.baseFace = { ...ro.home.face }; }
  if (M10.stay && S.scene !== 'aurora' && !traveling) M10.stay = false;
}
setInterval(() => { if (questPeek(M10.id)) m10Sync(); }, 300);
/* Rosa says tu once she has invited you (the task started): the brain's forms and greetings follow */
{
  const ro = NPC.rosa, keep = k => { const d = Object.getOwnPropertyDescriptor(ro, k); return () => d.get ? d.get() : d.value; };
  const fo = keep('formal'), gr = keep('greet'), op = keep('opening'), re = keep('revisitOpening'), ah = keep('answerHow');
  const tu = () => { const r = questPeek(M10.id); return !!(r && r.started); };
  const step = () => { const r = questPeek(M10.id); if (!r || !r.started) return null;
    if (r.done) return { it:'Ciao, {Me}! Buon viaggio!', en:'Hi, {Me}! Have a good trip!' };
    if (r.served) return r.toast ? { it:'Allora?', en:'So?' } : { it:'Ecco gli spritz! E gli stuzzichini: olive, patatine… Facciamo un brindisi!', en:'Here are the spritzes! And the nibbles: olives, crisps… Let\'s make a toast!' };
    if (r.ordered) return !r.origin ? { it:'Allora, {Me}… di dove sei?', en:'So, {Me}… where are you from?' } : { it:'Allora?', en:'So?' };
    if (r.spritz) return { it:'Allora? Ordini tu a Davide?', en:'So? Will you order from Davide?' };
    if (r.greeted) return r.wantDrink ? { it:'Allora… cosa ti piace bere?', en:'So… what do you like to drink?' } : { it:'Allora… vuoi qualcosa da bere?', en:'So… do you want something to drink?' };
    return { it:'Ciao, {Me}! Prendi un aperitivo con me?', en:'Hi, {Me}! Will you have an aperitivo with me?' }; };
  Object.defineProperty(ro, 'formal', { configurable:true, enumerable:true, get:() => tu() ? false : fo() });
  Object.defineProperty(ro, 'greet', { configurable:true, enumerable:true, get:() => tu() ? { it:'Ciao', en:'Hi' } : gr() });
  Object.defineProperty(ro, 'answerHow', { configurable:true, enumerable:true, get:() => tu() ? { it:'Bene, grazie! E tu?', en:'Fine, thanks! And you?' } : ah() });
  Object.defineProperty(ro, 'opening', { configurable:true, enumerable:true, get:() => step() || op() });
  Object.defineProperty(ro, 'revisitOpening', { configurable:true, enumerable:true, get:() => step() || re() });
  /* Rosa's scene: at her table in Caffè Aurora while the task is open or under way (seated, her dog beside her) */
  Object.defineProperty(ro, 'scene', { configurable:true, enumerable:true, get:() => m10RosaOut() ? 'aurora' : 'sanlorenzo' });
  /* Davide in the evening: buonasera */
  const dv = NPC.davide;
  const dk = k => { const d = Object.getOwnPropertyDescriptor(dv, k); return () => d.get ? d.get() : d.value; };
  const dOp = dk('opening'), dRe = dk('revisitOpening'), dGr = dk('greet');
  const eve = () => daytime() === 'night' && S.lesson >= 12;
  Object.defineProperty(dv, 'opening', { configurable:true, enumerable:true, get:() => eve() ? { it:'Buonasera! Mi dica.', en:'Good evening! How can I help?' } : dOp() });
  Object.defineProperty(dv, 'revisitOpening', { configurable:true, enumerable:true, get:() => eve() ? { it:'Buonasera! Mi dica.', en:'Good evening! How can I help?' } : dRe() });
  Object.defineProperty(dv, 'greet', { configurable:true, enumerable:true, get:() => eve() ? { it:'Buonasera', en:'Good evening' } : dGr() });
}
/* the start: Rosa calls you over (tu: she just uses it) */
function m10Start(npc){
  const knew = !!S.met.rosa;
  convo.known = true; S.met.rosa = S.known.rosa = true;
  $('#dlgWho').innerHTML = `<b>Rosa</b> <span class="where">· Caffè Aurora</span>`;
  builder.hidden = true;
  npcLine(fill(knew ? '{Me}! Che bella sorpresa! Ciao!' : 'Ciao! Io sono Rosa, di San Lorenzo.'), fill(knew ? '{Me}! What a lovely surprise! Hi!' : 'Hi! I\'m Rosa, from San Lorenzo.'));
  npcLine('Prendi un aperitivo con me?', 'Will you have an aperitivo with me?', { queue:true });
  sysLine(`${knew ? 'Rosa, the lady with the dog from San Lorenzo,' : 'Rosa, a lady from the neighbourhood,'} waves you over to her table. What do you say? The task's <b>scheda</b> has the words.`);
  questStart(M10.id); m10Rec(); save();
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  return true;
}
/* Davide: a tile conversation instead of the restaurant (a waiter: openConvo would send him to Lesson 4's engine) */
function m10DavideOpen(npc){
  convo.known = true; convo.m10 = true;
  $('#dlgWho').innerHTML = `<b>Davide</b> <span class="where">· Caffè Aurora</span>`;
  if (questAt(M10.id, 'attesa')){
    builder.hidden = true;
    npcLine('Un momento! Arrivo subito con gli spritz.', "Just a moment! I'll be right there with the spritzes.");
    showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
    return true;
  }
  convo.words = []; renderBank(); renderSentence();
  builder.hidden = false;
  npcLine('Buonasera! Mi dica.', 'Good evening! How can I help?');
  return true;
}
function m10Read(ints){
  const R = { toast:false, offro:false, dove:false, doveLei:false, sonodi:false, city:null, parte:false, alle:false, time:null, timeBits:false, two:false, one:false, bad1:false, spritz:false,
    want:false, wantDrink:false, offer:false, likeQ:false, like:false, drink:null, basta:false,
    forRosa:false, forMe:false, bill:false, greet:false, thanks:false, bye:false, yes:false, no:false, askBack:false, ask:false, rosa:false, other:[] };
  ints.forEach(id => {
    let m;
    if (id === 'm10:toast') R.toast = true;
    else if (id === 'm10:offro') R.offro = true;
    else if (id === 'm10:dove') R.dove = true;
    else if (id === 'm10:dove:lei'){ R.dove = true; R.doveLei = true; }
    else if (id === 'm10:sonodi' || id === 'origin') R.sonodi = true;
    else if ((m = id.match(/^m10:city(?:only)?:(.+)$/))) R.city = m[1];
    else if (id === 'm10:parte') R.parte = true;
    else if (id === 'm10:alle' || id === 't10:at') R.alle = true;
    else if ((m = id.match(/^m10:t:(\d+)$/))) R.time = R.time || m[1];
    else if (id === 'm10:t:x' || /^num:/.test(id)) R.timeBits = true;
    else if (id === 'm10:two') R.two = true;
    else if (id === 'm10:one'){ R.one = true; R.drink = R.drink || 'spritz'; }
    else if (id === 'm10:bad1'){ R.one = true; R.bad1 = true; }
    else if (id === 'm10:spritz') R.spritz = true;
    else if (id === 'm10:want') R.wantDrink = true;
    else if (id === 'm10:offer') R.offer = true;
    else if (id === 'm10:likeq') R.likeQ = true;
    else if (id === 'm10:like' || id === 'like:me') R.like = true;
    else if ((m = id.match(/^m10:d:(\w+)$/))) R.drink = m[1];
    else if (id === 'm10:basta') R.basta = true;
    else if (id === 'm10:rosa' || id === 'rosa' || id === 'address') R.rosa = true;
    else if (id === 'm10:me') R.forMe = true;
    else if (id === 'bill') R.bill = true;
    else if (id === 'greet') R.greet = true;
    else if (id === 'thanks') R.thanks = true;
    else if (id === 'bye') R.bye = true;
    else if (id === 'yes' || id === 'ok10') R.yes = true;
    else if (id === 'no') R.no = true;
    else if (id === 'nothing'){ R.no = true; R.nothing = true; }     /* (Lesson 9's parser words: no grazie, basta così) */
    else if (id === 'ask_how' || id === 'ask_name') R.askBack = true;
    else if (id === 'want:me') R.want = true;
    else if (!['please', 'and', 'excuse'].includes(id)) R.other.push(id);
  });
  return R;
}
function m10React(id, n, st, add, out, ints){
  if (!m10Rosa(n) && !m10Davide(n)) return false;
  if (out.m10) return true;
  out.m10 = true; out.asked = true;
  if (!schedaDone(M10.id)){ add(n.id === 'rosa' ? 'Eh?' : 'Prego?', n.id === 'rosa' ? 'Huh?' : 'Pardon?'); out.m10fb = 'scheda'; return true; }
  const R = m10Read(ints), r = m10Rec(), word = questUsedWords(), fb = h => { if (!out.m10fb) out.m10fb = h; };
  if (word.includes('basta')) R.basta = true;
  R.grazie = word.includes('grazie');
  if (n.id === 'davide') return m10DavideReact(R, r, st, add, out, fb, word);
  return m10RosaReact(R, r, st, add, out, fb, word);
}
function m10DavideReact(R, r, st, add, out, fb, word){
  if (word.includes('ciao')){ r.mistakes.formal++; out.m10formal = 'davide'; }
  const count = R.two ? 2 : R.one && R.rosa && R.forMe ? 2 : R.one ? 1 : 0;
  if (R.bad1){ fb('<b>Spritz</b> starts with s + a consonant: <b>uno</b> spritz.'); }
  if (count === 2){
    add(R.greet ? 'Buonasera! Due spritz, subito!' : 'Due spritz, subito!', R.greet ? 'Good evening! Two spritzes, right away!' : 'Two spritzes, right away!');
    add('E vi porto anche gli stuzzichini.', "And I'll bring you some nibbles too.");
    r.ordered = true; save(); out.m10ordered = true; out.end = true; return true;
  }
  if (count === 1){ r.mistakes.count++; add('Uno spritz… e per la signora Rosa? Niente?', 'One spritz… and for Rosa? Nothing?'); fb('Rosa would like one too. How many is that?'); st.m10q = 'order'; save(); return true; }
  if (R.wantDrink){ add('Certo! Che cosa?', 'Of course! What would you like?'); fb('What would you both like? You and Rosa chose the same.'); return true; }
  if (R.spritz){ add('Lo spritz? Quanti?', 'Spritz? How many?'); fb('How many? One for you, one for Rosa.'); return true; }
  if (R.greet || out.m10formal){ add('Buonasera! Mi dica.', 'Good evening! How can I help?'); fb('Order the drinks: one for you, one for Rosa.'); return true; }
  if (R.thanks){ add('Prego!', "You're welcome!"); fb('Order the drinks for you and Rosa.'); return true; }
  if (R.bye){ add('Arrivederci!', 'Goodbye!'); out.end = true; return true; }
  if (R.want){ add('Sì? Che cosa?', 'Yes? What?'); fb('What would you like? The same for both of you.'); return true; }
  add('Mi dica.', 'How can I help?'); fb('Order the drinks for you and Rosa.'); return true;
}
/* Rosa: "In Italia beviamo lo spritz la sera" (once), then she sends you to order */
function m10Spritz(r, say, out, opener){
  if (opener) say(opener[0], opener[1]);
  if (!r.spritz){ say('In Italia beviamo lo spritz la sera!', 'In Italy we drink spritz in the evening!'); r.spritz = true; }
  say('Allora: due spritz! Ordini tu? Davide è lì.', 'So: two spritzes! Will you order? Davide is over there.');
  if (questAt(M10.id, 'rosa')) questStep(M10.id, 'ordina');
  out.m10go = 'davide';
}
function m10RosaReact(R, r, st, add, out, fb, word){
  const lines = [];
  const say = (it, en, o) => { add(it, en, o); lines.push(it); };
  if (['buongiorno', 'arrivederci', 'scusi'].some(w => word.includes(w)) || R.doveLei || (word.includes('sta') && word.includes('come'))){ r.mistakes.formal++; out.m10formal = 'rosa'; }
  const asksDrink = R.likeQ || (R.askBack && !r.ordered && r.greeted);
  /* 1 · the invitation: yes (a greeting in the same turn is fine) */
  if (!r.greeted){
    if (R.no && !R.yes){ say('No? Peccato… Dai, solo uno!', 'No? What a pity… Come on, just one!'); fb('She would really like you to join her. Why not say yes?'); return true; }
    if (R.yes || R.thanks || R.wantDrink || R.offer || R.likeQ || R.drink || R.two || R.one){
      r.greeted = true;
      if (R.likeQ && !R.drink){ say('Che bello! Siediti, siediti!', 'Lovely! Sit down, sit down!'); r.wantDrink = true; m10Spritz(r, say, out, ['Cosa mi piace bere? Lo spritz!', 'What do I like to drink? Spritz!']); save(); return true; }
      if (R.offer){ say('Sì, grazie! Che gentile! Siediti, siediti!', 'Yes, please! How kind! Sit down, sit down!'); r.wantDrink = true; m10Spritz(r, say, out, ['Io prendo uno spritz.', "I'll have a spritz."]); save(); return true; }
      say(R.greet || R.rosa ? 'Ciao, {Me}! Che bello! Siediti, siediti!' : 'Che bello! Siediti, siediti!', R.greet || R.rosa ? 'Hi, {Me}! Lovely! Sit down, sit down!' : 'Lovely! Sit down, sit down!');
      if (R.drink || R.two || R.one){ m10Spritz(r, say, out, R.drink && R.drink !== 'spritz' ? m10Other(R.drink) : ['Lo spritz! Anche a me piace!', 'Spritz! I like it too!']); save(); return true; }
      if (R.wantDrink){ r.wantDrink = true; say('Cosa ti piace bere?', 'What do you like to drink?'); st.m10q = 'like'; }
      else { say('Vuoi qualcosa da bere?', 'Do you want something to drink?'); st.m10q = 'drink'; }
      save(); return true;
    }
    if (R.greet || R.rosa || R.askBack){ say(R.askBack ? 'Bene, grazie! Allora… prendi un aperitivo con me?' : 'Ciao, {Me}! Allora… prendi un aperitivo con me?', R.askBack ? 'Fine, thanks! So… will you have an aperitivo with me?' : 'Hi, {Me}! So… will you have an aperitivo with me?'); fb('Rosa asked you something. Answer her.'); return true; }
    say('Mmm? Prendi un aperitivo con me?', 'Hmm? Will you have an aperitivo with me?'); fb('Rosa asked you something. Answer her.'); return true;
  }
  /* 2 · something to drink: what you like (or ask her), then she sends you to Davide */
  if (!r.spritz && !r.ordered){
    if (R.offer){ say('Sì, grazie! Io prendo uno spritz.', "Yes, please! I'll have a spritz."); m10Spritz(r, say, out); save(); return true; }
    if (R.drink || R.two || R.one){ r.drink = R.drink || 'spritz'; m10Spritz(r, say, out, r.drink === 'spritz' ? ['Lo spritz! Anche a me piace!', 'Spritz! I like it too!'] : m10Other(r.drink)); save(); return true; }
    if (asksDrink){ say('Io? Lo spritz! In Italia beviamo lo spritz la sera.', 'Me? Spritz! In Italy we drink spritz in the evening.'); r.spritz = true; say('Allora: due spritz! Ordini tu? Davide è lì.', 'So: two spritzes! Will you order? Davide is over there.'); if (questAt(M10.id, 'rosa')) questStep(M10.id, 'ordina'); out.m10go = 'davide'; save(); return true; }
    if (R.like){ say('Ti piace… che cosa?', 'You like… what?'); fb('Say what you like to drink.'); st.m10q = 'like'; return true; }
    if (R.no){ say('Niente? Ma è l\'aperitivo! Dai: cosa ti piace bere?', 'Nothing? But it\'s aperitivo time! Come on: what do you like to drink?'); r.wantDrink = true; st.m10q = 'like'; fb('She asked what you like to drink.'); save(); return true; }
    if (R.yes || R.wantDrink || R.thanks){ r.wantDrink = true; say(st.m10q === 'like' ? 'Sì, ma… cosa ti piace bere?' : 'Bene! Cosa ti piace bere?', st.m10q === 'like' ? 'Yes, but… what do you like to drink?' : 'Good! What do you like to drink?'); if (st.m10q === 'like') fb('She asked what you like to drink.'); st.m10q = 'like'; save(); return true; }
    say(r.wantDrink ? 'Allora? Cosa ti piace bere?' : 'Allora? Vuoi qualcosa da bere?', r.wantDrink ? 'So? What do you like to drink?' : 'So? Do you want something to drink?'); fb(r.wantDrink ? 'She asked what you like to drink.' : 'Rosa asked you something. Answer her.'); return true;
  }
  if (!r.ordered){
    if (R.two || R.one || R.spritz || R.drink) say('Sì, sì! Ordina a Davide!', 'Yes, yes! Order from Davide!');
    else say('Allora? Davide è lì!', 'Well? Davide is over there!');
    fb('Davide takes the order. He\'s by the tables.'); return true;
  }
  /* 3 · while Davide makes the drinks: where from (yours, then hers, in either order) */
  if (!r.served){
    if (R.toast){ say('Cin cin? Aspetta! Gli spritz non ci sono ancora!', 'Cheers? Wait! The spritzes aren\'t here yet!'); fb('No drinks yet: Davide is still at the bar. Rosa asked you something.'); return true; }
    m10Origin(R, r, st, say, fb, word, lines);
    if (r.origin && r.back){ say('Ah, ecco Davide!', 'Ah, here\'s Davide!'); out.m10arrive = true; M10.arrive = true; out.end = true; }
    save(); return true;
  }
  /* 4 · the toast */
  if (!r.toast){
    if (R.toast){
      r.toast = true; out.m10clink = true;
      say('Cin cin! Salute, {Me}!', 'Cheers! To your health, {Me}!');
      if (!r.train){ say('E stasera parti per Venezia, vero? A che ora parte il treno?', 'And tonight you\'re off to Venice, right? What time does the train leave?'); st.m10q = 'train'; }
      else { say('Ancora uno stuzzichino?', 'Another nibble?'); st.m10q = 'nibble'; }
      save(); return true;
    }
    if (R.dove || R.city || R.sonodi || R.parte || R.time || R.bill || R.offro){ say('Aspetta, aspetta! Prima il brindisi!', 'Wait, wait! The toast first!'); fb('Glasses up first: what do Italians say when they raise their glasses?'); return true; }
    if (R.yes){ say('Allora… cin cin!', 'Well then… cheers!'); fb('She is raising her glass. What do you say?'); return true; }
    if (R.thanks){ say('Prego! Ma… il brindisi!', "You're welcome! But… the toast!"); fb('Rosa is raising her glass. What do you say?'); return true; }
    say('Dai, il bicchiere! Facciamo un brindisi!', 'Come on, your glass! Let\'s make a toast!'); fb('Rosa is raising her glass. What do you say?'); return true;
  }
  /* 5 · tonight: the train */
  if (!r.train){
    if (m10Train(R, r, st, say, fb)){ if (r.train){ say('Venezia… che bello! Ancora uno stuzzichino?', 'Venice… how lovely! Another nibble?'); st.m10q = 'nibble'; } save(); return true; }
    say('E stasera… Venezia! A che ora parte il treno?', 'And tonight… Venice! What time does the train leave?'); st.m10q = 'train'; fb('She asked what time your train leaves. Your ticket is in your bag.'); save(); return true;
  }
  /* 6 · another nibble? (sì / no), then the bill: she pays */
  if (!r.bill){
    if (st.m10q === 'nibble' && (R.yes || R.no || R.basta)){
      const no = (R.no || R.basta) && !(R.yes && !R.no);
      r.nibble = no ? 'no' : 'yes'; st.m10q = 'bill';
      if (no) say(R.basta ? 'Basta così? Va bene!' : 'No? Va bene!', R.basta ? "That's enough? All right!" : 'No? All right!');
      else say(R.grazie ? 'Prego! Prendi, prendi: le olive sono buonissime.' : 'Ecco! Prendi, prendi: le olive sono buonissime.', R.grazie ? "You're welcome! Go on, help yourself: the olives are delicious." : 'Here! Go on, help yourself: the olives are delicious.');
      out.m10nibble = r.nibble;
      if (!R.bill && !R.offro){ save(); return true; }
    }
    if (R.bill || R.offro){
      r.bill = true; st.m10q = 'thanks';
      say(R.offro ? 'No, no, no! Offro io! Sei a Padova: sei mia ospite!' : 'No, no! Offro io!', R.offro ? 'No, no, no! It\'s on me! You\'re in Padua: you\'re my guest!' : 'No, no! It\'s on me!');
      save(); return true;
    }
    if (R.thanks){ say('Prego! Prendi, prendi!', "You're welcome! Help yourself!"); fb('It\'s getting late, and there\'s a train to catch: ask for the bill.'); return true; }
    if (R.greet || R.bye){ say('Vai già? Aspetta, il conto…', 'Going already? Wait, the bill…'); fb('Before you go: the bill.'); return true; }
    say('Mmm… che buono, lo spritz!', 'Mmm… the spritz is good!'); fb(st.m10q === 'nibble' ? 'She offered you another nibble. Yes or no?' : 'It\'s getting late, and there\'s a train to catch: ask for the bill.'); return true;
  }
  /* 7 · thanks */
  if (R.thanks){
    r.thanked = true;
    say(word.includes('rosa') ? 'Prego, {Me}! Buon viaggio! Ciao!' : 'Di niente! Buon viaggio a Venezia, {Me}! Ciao!', word.includes('rosa') ? "You're welcome, {Me}! Have a good trip! Bye!" : "Not at all! Have a good trip to Venice, {Me}! Bye!");
    out.m10done = true; out.end = true; save(); return true;
  }
  if (R.offro || R.bill){ say('No, no! Offro io! Insisto!', "No, no! It's on me! I insist!"); fb('She insists. What do you say when someone treats you?'); return true; }
  if (R.bye || R.greet){ say('Ciao! Ma… niente grazie?', 'Bye! But… no thank you?'); fb('She has just treated you.'); return true; }
  say('Offro io, eh!', "It's on me, eh!"); fb('She is paying. What do you say?'); return true;
}
const m10Other = d => [`${cap(M10.DRINKS[d][0])}? Buono! Ma qui, la sera…`, `${cap(M10.DRINKS[d][1])}? Nice! But here, in the evening…`];
/* where you're from, and asking her back */
function m10Origin(R, r, st, say, fb, word, lines){
  if (R.city){
    const [it, en] = M10.CITIES[R.city]; r.origin = R.city;
    say(R.city === 'londra' ? 'Di Londra! Che bello! Londra è una grande città.' : `Di ${it}! Che bello!`, R.city === 'londra' ? 'From London! How lovely! London is a big city.' : `From ${en}! How lovely!`);
  } else if (R.sonodi && !r.origin){ say('Di…? Di dove?', 'From…? From where?'); fb('Say which city you are from.'); }
  const asked = R.dove || (R.askBack && word.includes('tu') && !word.includes('come'));
  if (asked){
    if (!r.back){ r.back = true; say('Io? Sono di Padova! Di San Lorenzo, da sempre.', 'Me? I\'m from Padua! From San Lorenzo, all my life.'); }
    else say('Di Padova! Te l\'ho detto!', 'From Padua! I told you!');
    if (!r.origin && !R.city){ say('E tu?', 'And you?'); st.m10q = 'origin'; }
  }
  if (!r.origin){ if (!lines.length){ say('Allora? Di dove sei?', 'So? Where are you from?'); fb('Rosa asked where you are from.'); } return; }
  if (!r.back){ if (R.city) st.m10q = 'back'; if (!lines.length) say('Mmm?', 'Hmm?'); fb('Ask her the same question.'); }
}
/* the train time (from the ticket in the bag): true when the sentence was about it */
function m10Train(R, r, st, say, fb){
  if (R.time === '2315'){ r.train = true; say('Alle ventitré e quindici? Allora c\'è tempo!', 'At twenty-three fifteen? Then there\'s time!'); return true; }
  if (R.time === '2300' || R.timeBits || R.alle){ r.mistakes.time++; say('Alle…? Sicuro? Guarda il biglietto!', 'At…? Are you sure? Look at your ticket!'); fb('Your ticket is in your bag (<b>Borsa</b>): look at the time on it.'); return true; }
  if (R.parte){ say('Parte… a che ora?', 'It leaves… at what time?'); fb('Say what time your train leaves.'); return true; }
  return false;
}
function m10After(n, out, words){
  if (!out.m10) return false;
  const r = m10Rec();
  if (out.m10fb === 'scheda'){ showHint('First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).'); return true; }
  const formal = out.m10formal === 'rosa' ? 'Rosa says <b>tu</b> to you: <b>ciao</b>, <b>sei</b>, not the polite forms. ' : out.m10formal === 'davide' ? 'Davide is at work, and a stranger: the polite forms, not ciao. ' : '';
  if (out.m10done){
    enqueue(() => { if (!questPeek(M10.id).done){ M10.stay = true; questDone(M10.id); } });
    convo.keepHint = true; showHint(formal + 'An aperitivo with a friend: done! A stamp in your passport.', 'Fatto!');
    enqueue(() => { if (convo) endConvo(); }); return true;
  }
  if (out.m10ordered){ convo.keepHint = true; showHint(formal + (out.m10fb ? out.m10fb + ' ' : '') + 'Ordered! Davide goes to the bar to make the drinks…', 'Fatto!'); enqueue(() => { if (convo) endConvo(); }); return true; }
  if (out.m10arrive){ convo.keepHint = true; showHint(formal + 'Here come the drinks…', 'Fatto!'); enqueue(() => setTimeout(() => { if (convo && convo.npc === NPC.rosa) closeDialog(); }, 1200)); return true; }
  if (out.m10go){ showHint(formal + 'Davide takes the orders: he\'s by the middle table. Order the drinks from him (politely: he is at work).', 'Fatto!'); return true; }
  if (out.m10clink) enqueue(() => worldSay('player', 'Cin cin!', { ms:1200, silent:true }));
  if (out.end) return false;
  if (formal && !convo.tips.formal){ convo.tips.formal = true; showHint(formal + (out.m10fb || ''), 'Consiglio'); return true; }
  if (out.m10fb){ showHint(hintAfter(stepTries(convo.st, m10Step(n)), out.m10fb, m10Strong(n)), 'Consiglio'); return true; }
  if (out.m10clink){ showHint(r.train ? 'Cheers! She is offering you something.' : 'Cheers! Now she wants to know about your train tonight.', 'Fatto!'); return true; }
  if (out.m10nibble){ showHint('It\'s getting late, and there\'s a train to catch: ask for the bill.', 'Fatto!'); return true; }
  showHint(contextHint(false));
  return true;
}
const m10Step = n => { const r = m10Rec(), st = convo ? convo.st : {}; return n.id === 'davide' ? 'm10-order' : !r.greeted ? 'm10-hello' : !r.spritz && !r.ordered ? 'm10-drink' : !r.ordered ? 'm10-go' : !r.origin ? 'm10-origin' : !r.back ? 'm10-back'
  : !r.served ? 'm10-wait' : !r.toast ? 'm10-toast' : !r.train ? 'm10-train' : !r.bill ? (st.m10q === 'nibble' ? 'm10-nibble' : 'm10-bill') : 'm10-thanks'; };
const m10Strong = n => { const r = m10Rec(), st = convo ? convo.st : {};
  if (n.id === 'davide') return 'Two drinks: <b>due</b> … <b>spritz</b>, <b>per favore</b>.';
  return !r.greeted ? 'Accept: <b>sì</b>… (and thanks).' : !r.spritz && !r.ordered ? (r.wantDrink ? 'What you like: <b>mi piace</b> … (a drink).' : 'Yes: <b>sì</b>… or tell her you would like <b>qualcosa</b> … to drink.') : !r.ordered ? 'Davide: <b>due spritz</b>…'
    : !r.origin ? 'Where you are from: <b>sono di</b> … (your city).' : !r.back ? 'Ask her back: <b>e tu</b>… or <b>di dove sei</b>.' : !r.served ? 'Davide is coming.' : !r.toast ? 'Raise your glass: <b>salute</b>… or <b>cin cin</b>.'
    : !r.train ? 'Your ticket says it: <b>il treno parte alle</b> … (the hour, then the minutes).' : !r.bill ? (st.m10q === 'nibble' ? 'Answer her: <b>sì</b> or <b>no</b> (and <b>grazie</b>).' : 'Ask for the bill: <b>il conto</b>…') : 'Thank her: <b>grazie</b>…'; };
function m10Hint(n, st){
  if (!m10Rosa(n) && !m10Davide(n)) return null;
  if (!schedaDone(M10.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
  const r = m10Rec();
  if (n.id === 'davide') return { h:'Order the drinks: one for you, one for Rosa. Davide is at work: polite.', strong:m10Strong(n), step:'m10-order' };
  const h = !r.greeted ? 'Rosa has invited you. Answer her (she says tu).' : !r.spritz && !r.ordered ? (r.wantDrink ? 'She asked what you like to drink. Tell her, or ask her the same.' : 'She asked you something about drinks. Answer her.')
    : !r.ordered ? 'Order from Davide: he\'s by the middle table.' : !r.origin ? 'While you wait: Rosa asked where you are from.' : !r.back ? 'Ask her the same question.' : !r.served ? 'Davide is bringing the drinks.'
    : !r.toast ? 'The drinks are here, and she is raising her glass.' : !r.train ? 'She asked what time your train leaves. Your ticket is in your bag (Borsa).' : !r.bill ? (st.m10q === 'nibble' ? 'She is offering you something from the plate. Yes or no?' : 'It\'s getting late: ask for the bill.') : 'Rosa is paying. Thank her.';
  return { h, strong:m10Strong(n), step:m10Step(n) };
}
/* Davide goes to the bar to make the drinks; you sit down with Rosa (the wait: where you're from) */
function m10Wait(){
  const dv = NPC.davide;
  if (!M10.dhome) M10.dhome = { x:dv.x, y:dv.y };
  const at = () => { m10Rec().waiting = true; if (questAt(M10.id, 'ordina')) questStep(M10.id, 'attesa'); save(); renderHUD(); };
  cutscene([
    { guide:'Davide goes to the bar to make the drinks… You sit down with Rosa.' },
    { walk:'player', to:M10.CHAIR, speed:120, find:true, async:true, face:{ x:1, y:0 } },
    { walk:'davide', path:[[dv.x, dv.y], [700, 330], [M10.BAR.x, M10.BAR.y]], speed:120, face:{ x:1, y:-0.6 } },
    { run:at },
    { face:'player', to:'rosa' },
  ], { id:'m10-bar', guide:'', onSkip:at }).then(res => {
    if (res.replaced) return;
    at();
    setTimeout(() => { if (!dialogOpen && sceneOf(NPC.rosa) === S.scene) openConvo(NPC.rosa); }, 300);
  });
}
/* Davide brings the drinks and the nibbles to Rosa's table */
function m10Served(){ const r = m10Rec(); if (r.served) return; r.served = true; questStep(M10.id, 'brindisi'); save(); renderHUD(); }
function m10Serve(){
  const dv = NPC.davide, home = M10.dhome || { x:dv.x, y:dv.y };
  cutscene([
    { guide:'Davide comes back from the bar…' },
    { walk:'davide', path:[[dv.x, dv.y], [M10.BAR.x, M10.BAR.y]], speed:120 },
    { wait:RM ? 200 : 600 },
    { walk:'davide', path:[[720, 290], [M10.TABLE.x + 4, M10.TABLE.y + 46]], speed:100, face:{ x:0, y:-1 } },
    { run:m10Served },
    { say:'Ecco: due spritz… e gli stuzzichini!', who:'davide', ms:2200 },
    { walk:'davide', path:[[700, 330], [home.x, home.y]], speed:110 },
    { face:'player', to:'rosa' },
  ], { id:'m10-serve', guide:'', onSkip:m10Served }).then(res => {
    if (res.replaced) return;
    m10Served(); dv.x = home.x; dv.y = home.y;
    setTimeout(() => { if (!dialogOpen && sceneOf(NPC.rosa) === S.scene) openConvo(NPC.rosa); }, 300);
  });
}
/* the evening in Caffè Aurora: candles on the tables, the drinks and the nibbles at Rosa's table, the warm light; an
   APERITIVO board outside in Via dei Mille */
const M10_TABLES = [[420, 320], [190, 230], [200, 470], [680, 470], [650, 250]];
function m10Candle(x, y, t, k){
  const f = RM ? 1 : 0.85 + Math.sin(t * 8 + k * 1.7) * 0.12;
  ctx.fillStyle = 'rgba(255,255,255,.6)'; circ(ctx, x, y, 3.6); ctx.fill();
  ctx.fillStyle = '#ffd77a'; ell(ctx, x, y - 1, 1.5, 2.6 * f); ctx.fill();
}
function m10Drinks(){
  const { x, y } = M10.TABLE;
  [[-14, -8], [14, -8]].forEach(([dx, dy]) => { ctx.fillStyle = 'rgba(0,0,0,.15)'; circ(ctx, x + dx + 1.5, y + dy + 2, 6.5); ctx.fill();
    ctx.fillStyle = 'rgba(240,248,255,.8)'; circ(ctx, x + dx, y + dy, 6.5); ctx.fill(); ctx.fillStyle = '#f2702a'; circ(ctx, x + dx, y + dy, 5); ctx.fill();
    ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.arc(x + dx + 1, y + dy - 1, 3, 0.4, 2.6); ctx.fill(); ctx.fillStyle = '#4f7a3a'; circ(ctx, x + dx - 2, y + dy + 2, 1.4); ctx.fill(); });
  ctx.fillStyle = '#fffdf8'; ell(ctx, x, y + 10, 13, 8); ctx.fill(); ctx.strokeStyle = '#d9d2c3'; ctx.lineWidth = 1; ctx.stroke();
  [[-6, 8, '#4f6a2a'], [-2, 12, '#4f6a2a'], [-8, 12, '#2b2b2b'], [4, 7, '#e8c06a'], [8, 11, '#e8c06a'], [3, 13, '#e8c06a'], [-1, 6, '#c9643a']].forEach(([dx, dy, c]) => { ctx.fillStyle = c; circ(ctx, x + dx, y + dy, 2.2); ctx.fill(); });
}
SCENE_EXTRAS.push({ scene:'aurora', when:() => daytime() === 'night' || ['active', 'done'].includes(questState(M10.id)) && !!(questPeek(M10.id) || {}).served,
  ents(t){
    const out = [];
    if (daytime() === 'night') M10_TABLES.forEach(([x, y], k) => out.push({ y:y + 1, draw:() => m10Candle(x, y + (k === 4 ? -16 : 0), t, k) }));
    const r = questPeek(M10.id);
    if (r && r.served && (questState(M10.id) === 'active' || M10.stay)) out.push({ y:M10.TABLE.y + 2, draw:m10Drinks });
    return out;
  },
  after(t){
    if (daytime() !== 'night') return;
    ctx.save(); ctx.fillStyle = 'rgba(40,18,6,.22)'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    M10_TABLES.forEach(([x, y], k) => { const f = RM ? 1 : 0.9 + Math.sin(t * 7 + k) * 0.08; const g = ctx.createRadialGradient(x, y, 0, x, y, 60 * f); g.addColorStop(0, 'rgba(255,170,80,.22)'); g.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = g; ctx.fillRect(x - 60, y - 60, 120, 120); });
    ctx.restore();
    /* the board by the bar: APERITIVO */
    ctx.fillStyle = '#2b2b2b'; rr(ctx, 900, 204, 40, 26, 3); ctx.fill(); ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#f5f1e8'; ctx.font = '700 6.5px "Titillium Web", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('APERITIVO', 920, 212); ctx.fillStyle = '#f2a04a'; ctx.fillText('SPRITZ', 920, 222);
  } });
SCENE_EXTRAS.push({ scene:'sanlorenzo', when:() => daytime() === 'night' && S.lesson >= 12,
  ents(){ return [{ y:152, draw:() => {
    const x = 632, y = 140;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x - 9, y + 14, 20, 4);
    ctx.fillStyle = '#5a3a24'; ctx.beginPath(); ctx.moveTo(x - 10, y + 16); ctx.lineTo(x - 7, y - 4); ctx.lineTo(x + 7, y - 4); ctx.lineTo(x + 10, y + 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2b2b2b'; ctx.fillRect(x - 6, y - 2, 12, 14);
    ctx.fillStyle = '#f2a04a'; ctx.font = '700 3.6px "Titillium Web", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('APERI', x, y + 2); ctx.fillText('TIVO', x, y + 7);
  } }]; } });
function aperitivoDbg(){ const r = questPeek(M10.id) || {}; return { greeted:!!r.greeted, drink:r.drink || null, spritz:!!r.spritz, ordered:!!r.ordered, waiting:!!r.waiting, served:!!r.served, toast:!!r.toast, origin:r.origin || null, back:!!r.back, train:!!r.train, nibble:r.nibble || null, bill:!!r.bill, thanked:!!r.thanked,
  rosa:{ scene:sceneOf(NPC.rosa), at:[Math.round(NPC.rosa.x), Math.round(NPC.rosa.y)], seated:!!NPC.rosa.seated, formal:!!NPC.rosa.formal } }; }
/* tests: Rosa offers another nibble again (to answer the same question the other way) */
Object.assign(window.__debug, { aperitivoNibble(){ if (convo && convo.npc === NPC.rosa){ convo.st.m10q = 'nibble'; return true; } return false; } });
