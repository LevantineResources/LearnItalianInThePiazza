/* Quest 9 · La gelateria (night). Design: docs/lessons/12-la-citta.md, the quests; system: engine/quests.js; the shop:
   world/shops.js (GELATERIA: the shop template's second use).
   The gelataio (Lei) asks before you have said a word: "Buonasera! Cono o coppetta?" Then two flavours (due gusti: you
   choose; the trays are in the display case, E), whipped cream or not (la panna), and you pay what he says. The replies follow
   what you said: the flavours before the cone, one flavour or three, the cream before he asks, un / una wrong.
   Italian: il cono, la coppetta, il gusto (due gusti), il pistacchio, la fragola, il cioccolato, il limone, la panna, con / senza
   (panna); Buonasera. Prices: a cone or a cup with two flavours € 3, the cream € 1 (the board on the wall).
   Saved on the quest's record: kind ('cono' | 'coppetta'), gusti:[…], panna (true / false / null), price, paid, given,
   mistakes:{ art, count, rude }. */
const M9 = { id:'gelateria', PRICE:3, PANNA:1, FLAVOURS:{ pistacchio:['il pistacchio', 'pistachio'], fragola:['la fragola', 'strawberry'], cioccolato:['il cioccolato', 'chocolate'], limone:['il limone', 'lemon'] } };
const m9Rec = () => { const r = questRec(M9.id); if (!r.gusti) r.gusti = []; if (!r.mistakes) r.mistakes = { art:0, count:0, rude:0 }; if (r.panna === undefined) r.panna = null; return r; };
const m9Busy = n => !!n && n.id === 'gelataio' && questState(M9.id) === 'active';
const m9Price = () => M9.PRICE + (m9Rec().panna ? M9.PANNA : 0);
const m9Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
const M9_TILES = [
  m9Tile('buonasera', 'Buonasera', 'good evening (polite)'),
  m9Tile('un cono', 'un cono', 'a cone'), m9Tile('una coppetta', 'una coppetta', 'a cup (a small tub)'), m9Tile('due gusti', 'due gusti', 'two flavours'),
  m9Tile('pistacchio', 'pistacchio', 'pistachio'), m9Tile('fragola', 'fragola', 'strawberry'), m9Tile('cioccolato', 'cioccolato', 'chocolate'), m9Tile('limone', 'limone', 'lemon'),
  m9Tile('e', 'e', 'and'), m9Tile('con la panna', 'con la panna', 'with whipped cream'), m9Tile('senza panna', 'senza panna', 'without cream'),
];
const M9_PAY = [m9Tile('vorrei', 'Vorrei', "I'd like"), m9Tile('per favore', 'per favore', 'please'), m9Tile("quant'è", "Quant'è?", 'how much is it?'), m9Tile('ecco', 'Ecco', 'here is / here you are'), m9Tile('euro', 'euro', 'euro, euros')];
QWORDS.add('cono o');

QUESTS.push({
  id:M9.id, n:9, title_it:'La gelateria', title_en:'An ice cream in the evening',
  window:'night',
  place:{ scene:'gelateria', x:480, y:540, map:[372, 350], label:'Gelateria, Piazza Centrale' },
  giver:'gelataio',
  steps:[
    { id:'order', en:'Order an ice cream: a cone or a cup, two flavours', who:'gelataio', where:'Gelateria, by the piazza' },
    { id:'pay', en:'Pay for your ice cream', who:'gelataio', where:'Gelateria, by the piazza' },
  ],
  stamp:{ icon:'🍦', color:'#b55470', label:'Gelateria' },
  scheda:{
    phrases:[
      ['Cono o coppetta?', 'A cone or a cup?', 'What the gelataio asks first.'],
      ['Un cono, per favore.', 'A cone, please.', 'Il cono is masculine: un cono. La coppetta: una coppetta.'],
      ['Due gusti: pistacchio e fragola.', 'Two flavours: pistachio and strawberry.', 'Il gusto, i gusti: the flavour(s). No article for the flavours.'],
      ['Con la panna?', 'With whipped cream?', 'Sì, con la panna! or No, grazie: senza panna.'],
      ['Buonasera!', 'Good evening!', 'From late afternoon on, instead of buongiorno.'],
    ],
    how:`<p><b>Un</b> cono (masculine), <b>una</b> coppetta (feminine). Then the flavours, just their names: <i>pistacchio e fragola</i>.</p>
      <p><b>Due gusti</b>: two flavours, the usual for a small cone. <i>Il gusto</i> is the flavour (and the taste): one gusto, two gust<b>i</b>.</p>
      <p><b>Con</b> la panna, with cream; <b>senza</b> panna, without. The price is on the board: <i>€ 3</i>, cream <i>€ 1</i>.</p>`,
    culture:`<p>An evening <b>passeggiata</b> often ends with a gelato. In a good <i>gelateria artigianale</i> pistachio is a dull green-brown, not bright green: bright colours mean colouring.</p>`,
    vocab:[
      { group:'In gelateria', words:[
        { it:'il cono', g:'m', en:'the cone', also:['cono'] },
        { it:'la coppetta', g:'f', en:'the cup (for ice cream)', also:['coppetta'] },
        { it:'il gusto', g:'m', en:'the flavour', also:['gusti', 'gusto'] },
        { it:'il pistacchio', g:'m', en:'pistachio', also:['pistacchio'] },
        { it:'la fragola', g:'f', en:'strawberry', also:['fragola'] },
        { it:'il cioccolato', g:'m', en:'chocolate', also:['cioccolato'] },
        { it:'il limone', g:'m', en:'lemon', also:['limone'] },
        { it:'la panna', g:'f', en:'the whipped cream', also:['panna'] },
        { it:'senza', say:'senza panna', en:'without' },
        { it:'Buonasera!', en:'Good evening!', also:['buonasera'] },
      ] },
    ],
    exercises:[
      { type:'mc', q:'“Cono o coppetta?” You want a cup:', opts:['Un coppetta, per favore.', 'Una coppetta, per favore.', 'La coppetta è finita.'], a:1, why:'La coppetta is feminine: una coppetta.', nudge:'Coppetta ends in -a.' },
      { type:'mc', q:'“Due gusti” means…', opts:['two cones', 'two flavours', 'two euros'], a:1, why:'Il gusto: the flavour. Due gusti: two flavours.', nudge:'Gusto: taste, flavour.', noSpeak:true },
      { type:'mc', q:'“Con la panna?” You don\'t want any:', opts:['Sì, con la panna!', 'No, grazie: senza panna.', 'Senza cono.'], a:1, why:'Senza: without.', nudge:'Con is with; the opposite?' },
      { type:'mc', q:'A cone with two flavours is € 3, the cream € 1. A cone with cream:', opts:['tre euro', 'quattro euro', 'cinque euro'], a:1, why:'Tre + uno = quattro.', nudge:'Add the cream.' },
    ],
    tiles:M9_TILES, bankTiles:M9_PAY,
  },
  hooks:{
    talk(npc){
      if (npc.id !== 'gelataio') return false;
      if (questState(M9.id) === 'open') return m9Start(npc);
      if (m9Busy(npc)){ convo.m9 = true; convo.known = true; $('#dlgWho').innerHTML = `<b>${esc(npc.name)}</b> <span class="where">· Gelateria</span>`; if (!m9Rec().kind) convo.st.m9q = 'kind'; }
      return false;
    },
    bank(npc, groups){
      if (!m9Busy(npc)) return null;
      if (schedaDone(M9.id)){
        groups.push({ label:'Il gelato', tiles:M9_TILES.map(phraseTile) });
        groups.push({ label:'Pagare', tiles:M9_PAY.map(phraseTile) });
        groups.push({ label:'Numeri', tiles:Array.from({ length:10 }, (_, i) => ({ w:numIt(i + 1), label:numIt(i + 1), gloss:String(i + 1) })) });
      }
      groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
      return groups;
    },
    phrases(npc){
      if (!m9Busy(npc)) return [];
      const P = [['greet', 'buonasera'], ['m9:kind:cono', 'un cono'], ['m9:kind:coppetta', 'una coppetta'], ['m9:badart:cono', 'una cono'], ['m9:badart:coppetta', 'un coppetta'],
        ['m9:kind:cono', 'il cono'], ['m9:kind:coppetta', 'la coppetta'], ['m9:kind:cono', 'cono'], ['m9:kind:coppetta', 'coppetta'],
        ['m9:two', 'due gusti'], ['m9:panna', 'con la panna'], ['m9:panna', 'con panna'], ['m9:nopanna', 'senza panna'], ['m9:panna?', 'la panna'], ['how_much', "quant'è"]];
      Object.entries(M9.FLAVOURS).forEach(([k, [it]]) => P.push(['m9:g:' + k, k], ['m9:g:' + k, it]));
      return P;
    },
    react(id, n, st, add, out, ints){ return m9React(id, n, st, add, out, ints || [id]); },
    hint(n, st){ return m9Hint(n, st); },
    afterTurn(n, out, res, words){ return m9After(n, out, words); },
    shopTake(shop, f, it){
      if (shop !== 'gelateria') return null;
      return { ok:false, msg:`<b>${esc(it.label)}</b>. Mmm… ${questState(M9.id) === 'active' ? 'Ask the gelataio for it: two flavours.' : 'It looks delicious.'}` };
    },
  },
});
/* the gelataio asks first; once you have ordered, he waits for you to pay */
{
  const g = NPC.gelataio;
  const op = () => questAt(M9.id, 'pay') ? { it:`Ecco il Suo gelato! Sono ${numIt(m9Price())} euro.`, en:`Here's your ice cream! That's ${NUM_EN[m9Price()]} euros.` }
    : questState(M9.id) === 'done' ? { it:'Buonasera! Ancora un gelato?', en:'Good evening! Another ice cream?' } : { it:'Buonasera! Cono o coppetta?', en:'Good evening! A cone or a cup?' };
  ['opening', 'revisitOpening'].forEach(k => Object.defineProperty(g, k, { configurable:true, enumerable:true, get:op }));
}
function m9Start(npc){
  convo.known = true;
  $('#dlgWho').innerHTML = `<b>${esc(npc.name)}</b> <span class="where">· Gelateria</span>`;
  builder.hidden = true;
  npcLine('Buonasera! Cono o coppetta?', 'Good evening! A cone or a cup?');
  sysLine('He is asking you something, and the trays in the glass case look wonderful… but you have no words for any of it yet. The task\'s <b>scheda</b> has them.');
  questStart(M9.id); m9Rec(); save();
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  return true;
}
function m9Read(ints){
  const R = { kind:null, bad:null, gusti:[], two:false, panna:null, pannaQ:false, howMuch:false, pay:null, payBare:false, yes:false, no:false, thanks:false, bye:false, greet:false, want:false, repeat:false, other:[] };
  let ecco = false;
  ints.forEach(id => {
    let m;
    if ((m = id.match(/^m9:kind:(.+)$/))) R.kind = m[1];
    else if ((m = id.match(/^m9:badart:(.+)$/))){ R.bad = m[1]; R.kind = m[1]; }
    else if ((m = id.match(/^m9:g:(.+)$/))) R.gusti.push(m[1]);
    else if (id === 'm9:two') R.two = true;
    else if (id === 'm9:panna') R.panna = true;
    else if (id === 'm9:nopanna') R.panna = false;
    else if (id === 'm9:panna?') R.pannaQ = true;
    else if (id === 'how_much') R.howMuch = true;
    else if (id === 'here_is'){ ecco = true; R.payBare = true; }
    else if ((m = id.match(/^num:(\d+)$/))){ if (ecco || R.pay === null) R.pay = +m[1]; }
    else if (id === 'euro'){}
    else if (id === 'yes' || id === 'ok10') R.yes = true;
    else if (id === 'no') R.no = true;
    else if (id === 'thanks') R.thanks = true;
    else if (id === 'bye') R.bye = true;
    else if (id === 'greet') R.greet = true;
    else if (id === 'want:me') R.want = true;
    else if (id === 'repeat') R.repeat = true;
    else if (!['please', 'and', 'excuse', 'sir', 'address'].includes(id)) R.other.push(id);
  });
  if (R.pay !== null && !R.payBare && !ints.includes('euro')) R.pay = null;
  R.gusti = [...new Set(R.gusti)];
  return R;
}
const m9Gusti = g => g.length > 1 ? g.slice(0, -1).join(', ') + ' e ' + g[g.length - 1] : g.join('');
function m9React(id, n, st, add, out, ints){
  if (!m9Busy(n)) return false;
  if (out.m9) return true;
  out.m9 = true; out.asked = true;
  const R = m9Read(ints), r = m9Rec();
  if (!schedaDone(M9.id)){ add('Cono o coppetta?', 'A cone or a cup?'); out.m9fb = 'scheda'; return true; }
  const fb = h => { if (!out.m9fb) out.m9fb = h; };
  const lines = [];
  const say = (it, en) => { add(it, en); lines.push({ it, en }); };
  if (R.repeat && st.m9last){ add('Sì, certo! ' + st.m9last.it, 'Yes, of course! ' + st.m9last.en); out.slow = true; return true; }
  const business = R.kind || R.gusti.length || R.two || R.panna !== null || R.pannaQ || R.howMuch || R.pay !== null || R.payBare || R.yes || R.no || R.want || R.other.length;
  if (!business){
    if (R.greet){ say('Buonasera! Cono o coppetta?', 'Good evening! A cone or a cup?'); st.m9q = r.kind ? st.m9q : 'kind'; }
    else if (R.thanks || R.bye){ if (r.paid){ say('Prego! Buona serata!', "You're welcome! Have a nice evening!"); out.end = true; } else if (R.bye){ say('Arrivederci!', 'Goodbye!'); out.end = true; } else say('Prego!', "You're welcome!"); }
    else say('Sì?', 'Yes?');
    st.m9last = lines[lines.length - 1]; return true;
  }
  if (!r.paid && questAt(M9.id, 'order')){
    /* the cone or the cup (un / una) */
    if (R.kind){ if (R.bad){ r.mistakes.art++; fb(R.bad === 'cono' ? '<b>Cono</b> is masculine: <b>un</b> cono.' : '<b>Coppetta</b> is feminine: <b>una</b> coppetta.'); } r.kind = R.kind; }
    /* the flavours: two */
    const g = R.gusti.length ? R.gusti : null;
    if (g){
      const all = [...new Set([...(r.gusti.length < 2 ? r.gusti : []), ...g])];
      if (all.length > 2){ r.mistakes.count++; say(`${cap(m9Gusti(all))}? No, no: due gusti!`, `${all.map(k => cap(M9.FLAVOURS[k][1])).join(', ')}? No, no: two flavours!`); r.gusti = []; fb('Count your flavours: how many go in a cone or a cup? The board on the wall says.'); st.m9q = 'gusti'; }
      else r.gusti = all;
    }
    if (R.panna !== null) r.panna = R.panna;
    else if (st.m9q === 'panna' && (R.yes || R.no)) r.panna = R.yes && !R.no;
    else if (R.pannaQ && st.m9q === 'panna') r.panna = true;
    /* what he says next: the first thing still missing (after a word on what you just said) */
    if (!lines.length){
      const gEn = () => r.gusti.map(k => M9.FLAVOURS[k][1]).join(' and ');
      const pre = R.kind && r.gusti.length < 2 && (r.gusti.length || !R.gusti.length) && r.panna === null ? (r.kind === 'cono' ? ['Un cono, va bene.', 'A cone, all right.'] : ['Una coppetta, va bene.', 'A cup, all right.'])
        : (R.pay !== null || R.payBare || R.howMuch) && (!r.kind || r.gusti.length < 2 || r.panna === null) ? ['Prima il gelato!', 'The ice cream first!'] : null;
      if (pre && r.kind && !r.gusti.length && !(R.pay !== null || R.payBare || R.howMuch)){ /* (the cup alone: "Una coppetta! Che gusti?" says it) */ }
      else if (pre){ add(pre[0], pre[1]); }
      if (!r.kind){
        if (r.gusti.length) say(`${cap(m9Gusti(r.gusti))}… in un cono o in una coppetta?`, `${cap(gEn())}… in a cone or in a cup?`);
        else if (R.two) say('Due gusti, sì! Cono o coppetta?', 'Two flavours, yes! A cone or a cup?');
        else say('Cono o coppetta?', 'A cone or a cup?');
        st.m9q = 'kind'; fb(r.gusti.length ? 'He needs to know what to put them in.' : 'He asked you something. Not sure? Your scheda has his question.');
      } else if (r.gusti.length < 2){
        const what = r.kind === 'cono' ? 'Un cono' : 'Una coppetta';
        if (r.gusti.length === 1) say(`${cap(r.gusti[0])}… e poi? Sono due gusti!`, `${cap(M9.FLAVOURS[r.gusti[0]][1])}… and what else? It's two flavours!`);
        else say(R.kind ? `${what}! Che gusti?` : 'Che gusti?', R.kind ? `${r.kind === 'cono' ? 'A cone' : 'A cup'}! Which flavours?` : 'Which flavours?');
        st.m9q = 'gusti'; if (r.gusti.length === 1) fb('One more flavour: two in all. The flavours are in the glass case (look: <kbd>E</kbd> at its ends).');
      } else if (r.panna === null){
        say(`${cap(m9Gusti(r.gusti))}, perfetto! Con la panna?`, `${cap(gEn())}, perfect! With whipped cream?`); st.m9q = 'panna';
      } else {
        r.price = m9Price(); questStep(M9.id, 'pay');
        say(`Ecco il Suo gelato! ${r.kind === 'cono' ? 'Un cono' : 'Una coppetta'}, ${m9Gusti(r.gusti)}${r.panna ? ', con la panna' : ''}. Sono ${numIt(r.price)} euro.`,
          `Here's your ice cream! ${r.kind === 'cono' ? 'A cone' : 'A cup'}, ${gEn()}${r.panna ? ', with cream' : ''}. That's ${NUM_EN[r.price]} euros.`);
        st.m9q = 'pay'; out.m9served = true;
      }
    }
  } else if (questAt(M9.id, 'pay')){
    if (R.howMuch && R.pay === null && !R.payBare) say(`Sono ${numIt(m9Price())} euro.`, `That's ${NUM_EN[m9Price()]} euros.`);
    else if (R.pay === null && R.payBare){ say('Ecco… quanto?', "Here's… how much?"); fb('Say how much you are giving him: a number of euros.'); }
    else if (R.pay !== null && R.pay < m9Price()){ say(`${cap(numIt(R.pay))} euro? Sono ${numIt(m9Price())} euro!`, `${cap(NUM_EN[R.pay] || String(R.pay))} euros? It's ${NUM_EN[m9Price()]} euros!`); fb('Listen to the price again, or look at the board on the wall.'); }
    else if (R.pay !== null){
      r.paid = true; r.given = R.pay; const c = R.pay - m9Price();
      if (c > 0) say(`Grazie! Ecco il resto: ${c === 1 ? 'un' : numIt(c)} euro. Buona serata!`, `Thank you! Here's your change: ${NUM_EN[c]} ${c === 1 ? 'euro' : 'euros'}. Have a nice evening!`);
      else say('Grazie! Buona serata!', 'Thank you! Have a nice evening!');
      out.m9done = true;
    }
    else if (R.kind || R.gusti.length || R.panna !== null){ say(`Il Suo gelato è pronto! Sono ${numIt(m9Price())} euro.`, `Your ice cream is ready! That's ${NUM_EN[m9Price()]} euros.`); fb('Your ice cream is ready: pay him.'); }
    else { say(`Sono ${numIt(m9Price())} euro.`, `That's ${NUM_EN[m9Price()]} euros.`); fb('Pay him.'); }
  }
  if (!lines.length) say('Sì?', 'Yes?');
  st.m9last = lines[lines.length - 1];
  save();
  return true;
}
function m9After(n, out, words){
  if (!out.m9) return false;
  if (out.m9fb === 'scheda'){ showHint('First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).'); return true; }
  if (out.m9done){ enqueue(() => { questDone(M9.id); renderHUD(); }); convo.keepHint = true; showHint('Buonissimo! A gelato in the evening, and a stamp in your passport.', 'Fatto!'); enqueue(() => { if (convo) endConvo(); }); return true; }
  if (out.end) return false;
  const tip = !convo.tips.formal && words && words.includes('ciao') ? (convo.tips.formal = true, 'He\'s a stranger at work: <b>buonasera</b>, not ciao.') : null;
  if (tip){ showHint(tip, 'Consiglio'); return true; }
  if (out.m9served){ showHint('Your ice cream! Now pay him what he said.', 'Fatto!'); return true; }
  if (out.m9fb){ showHint(hintAfter(stepTries(convo.st, 'm9-' + (convo.st.m9q || 'kind')), out.m9fb, m9Strong(convo.st)), 'Consiglio'); return true; }
  showHint(contextHint(false));
  return true;
}
const m9Strong = st => ({ kind:'Choose: <b>un cono</b> … or <b>una coppetta</b>.', gusti:'Two flavours: <b>pistacchio</b>, <b>fragola</b>, <b>cioccolato</b>, <b>limone</b>… joined with <b>e</b>.', panna:'<b>con la panna</b> … or <b>senza panna</b>.', pay:'Pay: <b>ecco</b> … <b>euro</b>.' })[st.m9q || 'kind'];
function m9Hint(n, st){
  if (!m9Busy(n)) return null;
  if (!schedaDone(M9.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
  const r = m9Rec(), q = questAt(M9.id, 'pay') ? 'pay' : !r.kind ? 'kind' : r.gusti.length < 2 ? 'gusti' : 'panna';
  st.m9q = q;
  const h = { kind:'He asked you to choose between two things. Your scheda has his question.', gusti:'Now the flavours: two of them. The trays are in the glass case.', panna:'He asked you something about your ice cream: yes or no?',
    pay:`Pay him: € ${m9Price()}.` }[q];
  return { h, strong:m9Strong(st), step:'m9-' + q };
}
