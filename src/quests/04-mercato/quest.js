/* Quest 4 · Il mercato coperto (afternoon). Design: docs/lessons/12-la-citta.md, the quests; system: engine/quests.js; the
   place: world/salone.js ("Sotto il Salone", the covered market under the Palazzo della Ragione, in from Piazza delle Erbe).
   A snack for the night train: some good cheese from Marisa's deli counter (Lei). Ask to taste it, "Posso assaggiare?" →
   she gives you two pieces of Asiago, fresh and aged: "Quale preferisce?" → you can compare first, "Qual è più dolce?" (or
   forte, morbido, duro, salato) → "Il fresco è più dolce. Lo stagionato è più forte del fresco." → say which you prefer or
   what you think, in any natural way (m4Taste): "Preferisco lo stagionato. È buonissimo!", "Mi piace il fresco", a cheese alone
   ("Lo stagionato, eh? E… Le piace?" → Sì / Sì, mi piace (molto) / È buono / Preferisco il fresco), No / Non mi piace / È troppo
   forte (she offers the other one), a comparison ("Il fresco è più dolce" → "Esatto! Allora preferisce il fresco?"); she answers
   what was said, and moves on as soon as there is one you like ("Ha ragione: è più forte del fresco.") → "Quanto ne vuole?" (you can ask "Quanto costa un etto?" first) →
   a weight, "Vorrei due etti, per favore." (un etto, due etti, mezzo chilo; di formaggio / di prosciutto) → "Altro?" (some
   prosciutto: "Crudo o cotto? Il crudo è più salato…", or "No, grazie") → you ask the price, "Quanto costa?" → the price,
   heard (a listening line) → your notepad → you pay, the cheese goes in your bag → "Arrivederci!" → "Arrivederci! Buona
   giornata!" and the stamp. The replies follow what you say: a weight before tasting ("Prima assaggi!"), the cheese you didn't
   taste, "il stagionato" (lo stagionato), an adjective that doesn't fit ("Il fresco, forte? No, no: è dolce!"), too much
   prosciutto, the price before you've finished ordering (the price per etto), ciao to a stranger.
   Italian: Posso assaggiare?, il formaggio, fresco / stagionato, dolce / forte, morbido / duro, Qual è più …?, È buonissimo!,
   il prosciutto crudo / cotto, salato, un etto / mezzo chilo, Quanto ne vuole? (heard); review: preferisco, più … di (Lesson
   11), vorrei, Altro? (Lesson 9), Quanto costa? (Lesson 7).
   Prices (per etto, 100 g): Asiago fresco € 2, stagionato € 3; prosciutto crudo € 3, cotto € 2; at most € 24 (the numbers
   taught so far). The cheese stays in your bag (for the train: not a quest item, so finishing the task doesn't take it away).
   Saved on the quest's record: tasted, asked (the adjectives you compared), pref ('fresco' | 'stagionato'), liked, disliked (the cheeses you said no to, while choosing), kg (the
   cheese, in etti), pr (the prosciutto, in etti: 0 = none), ham ('crudo' | 'cotto'), price, noted, paid, mistakes:{ art,
   formal, pad, adj }. Tests: __dbg().mercato. */
/* the words of the sentence just said (a react hook has only the intents; batch 4's quests read a word or two: ciao, tu) */
const questUsedWords = () => ((convo && convo.lastUsed) || []).flatMap(t => t.tokens ? t.tokens.map(x => x.w) : [t.w || '']);
const M4 = { id:'mercato', PRICE:{ fresco:2, stagionato:3, crudo:3, cotto:2 }, MAX:24 };
const m4Rec = () => { const r = questRec(M4.id); if (!r.mistakes) r.mistakes = { art:0, formal:0, pad:0, adj:0 }; if (!r.asked) r.asked = []; return r; };
const m4Busy = n => !!n && n.id === 'marisa' && questState(M4.id) === 'active';
const m4Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
const M4_TASTE = [
  m4Tile('posso assaggiare', 'Posso assaggiare?', 'can I taste it?'), m4Tile('qual è più', 'Qual è più', 'which one is more'),
  m4Tile('dolce', 'dolce', 'mild, sweet'), m4Tile('forte', 'forte', 'strong'), m4Tile('morbido', 'morbido', 'soft'), m4Tile('duro', 'duro', 'hard'), m4Tile('salato', 'salato', 'salty'),
  m4Tile('preferisco', 'Preferisco', 'I prefer'), m4Tile('il fresco', 'il fresco', 'the fresh (young) one'), m4Tile('lo stagionato', 'lo stagionato', 'the aged one'),
  m4Tile('è buonissimo', 'È buonissimo!', "it's delicious!"),
];
/* what you think of it (her "Le piace?"): Sì / No are in the Polite group */
const M4_LIKE = [
  m4Tile('mi piace', 'Mi piace', 'I like it'), m4Tile('non mi piace', 'Non mi piace', "I don't like it"), m4Tile('molto', 'molto', 'a lot, very'),
  m4Tile('è', 'è', 'it is'), m4Tile('buono', 'buono', 'good (tasty)'), m4Tile('più', 'più', 'more (più dolce: milder)'), m4Tile('troppo', 'troppo', 'too (troppo forte: too strong)'),
];
const M4_BUY = [
  m4Tile('vorrei', 'Vorrei', "I'd like"), m4Tile('un etto', 'un etto', '100 grams (one etto)'), m4Tile('due etti', 'due etti', '200 grams'), m4Tile('mezzo chilo', 'mezzo chilo', 'half a kilo'),
  m4Tile('di formaggio', 'di formaggio', 'of cheese'), m4Tile('di prosciutto', 'di prosciutto', 'of ham (prosciutto)'), m4Tile('crudo', 'crudo', 'cured (raw) ham'), m4Tile('cotto', 'cotto', 'cooked ham'),
  m4Tile('quanto costa', 'Quanto costa?', 'how much is it?'), m4Tile('per favore', 'per favore', 'please'),
];
const M4_TILES = [...M4_TASTE, ...M4_LIKE, ...M4_BUY];
const m4En = n => n <= 20 ? NUM_EN[n] : 'twenty-' + NUM_EN[n - 20];
const M4_W = { 'un etto':1, 'due etti':2, 'tre etti':3, 'mezzo chilo':5 };
const M4_W_IT = { 1:'un etto', 2:'due etti', 3:'tre etti', 5:'mezzo chilo' }, M4_W_EN = { 1:'100 grams', 2:'200 grams', 3:'300 grams', 5:'half a kilo' };
const M4_CHEESE = { fresco:['il fresco', 'l\'Asiago fresco', 'the fresh one'], stagionato:['lo stagionato', 'l\'Asiago stagionato', 'the aged one'] };
/* which cheese (or ham) each word describes, and what Marisa says when you ask "Qual è più …?" */
const M4_ADJ = {
  dolce:{ cheese:'fresco', ham:'cotto', en:'mild', it:['Il fresco è più dolce. Lo stagionato è più forte del fresco.', 'The fresh one is milder. The aged one is stronger than the fresh one.'], hit:['Il cotto è più dolce. Il crudo è più salato.', 'The cooked one is milder. The cured one is saltier.'] },
  forte:{ cheese:'stagionato', ham:'crudo', en:'strong', it:['Lo stagionato! È più forte del fresco.', 'The aged one! It\'s stronger than the fresh one.'], hit:['Il crudo è più forte, e più salato.', 'The cured one is stronger, and saltier.'] },
  morbido:{ cheese:'fresco', ham:'cotto', en:'soft', it:['Il fresco è più morbido. Lo stagionato è più duro.', 'The fresh one is softer. The aged one is harder.'], hit:['Il cotto è più morbido.', 'The cooked one is softer.'] },
  duro:{ cheese:'stagionato', ham:'crudo', en:'hard', it:['Lo stagionato è più duro del fresco.', 'The aged one is harder than the fresh one.'], hit:['Duro? No, no: il prosciutto non è duro! Il crudo è più salato, il cotto è più dolce.', 'Hard? No, no: ham isn\'t hard! The cured one is saltier, the cooked one milder.'] },
  salato:{ cheese:'stagionato', ham:'crudo', en:'salty', it:['Lo stagionato è più salato del fresco.', 'The aged one is saltier than the fresh one.'], hit:['Il crudo è più salato del cotto.', 'The cured one is saltier than the cooked one.'] },
};
/* the comparative in English, for her echo of what you said ("Esatto! Il fresco è più dolce.") */
const M4_MORE_EN = { dolce:'milder', forte:'stronger', morbido:'softer', duro:'harder', salato:'saltier' };
const m4Other = c => c === 'fresco' ? 'stagionato' : 'fresco';
const m4Fits = (adj, c) => !!M4_ADJ[adj] && M4_ADJ[adj].cheese === c;
QWORDS.add('posso assaggiare'); QWORDS.add('qual è'); EXCL.add('è buonissimo'); CLAUSE.add('è buonissimo'); CLAUSE.add('preferisco'); CLAUSE.add('qual è');
/* Sì, è buonissimo! · No, non mi piace. · Sì, mi piace molto. (one sentence after the interjection) */
JOIN.add('sì è'); JOIN.add('no è'); JOIN.add('no non');

QUESTS.push({
  id:M4.id, n:4, title_it:'Il mercato coperto', title_en:'Cheese for the train',
  window:'afternoon',
  place:{ scene:'salone', x:480, y:300, map:[240, 150], label:'Sotto il Salone, Palazzo della Ragione' },
  giver:'marisa',
  steps:[
    { id:'assaggia', en:'A snack for the night train: taste the cheese at Marisa\'s counter, and say which one you prefer', who:'marisa', where:'Sotto il Salone (the covered market)' },
    { id:'compra', en:'Buy some by weight, ask the price, and pay', who:'marisa', where:'Sotto il Salone (the covered market)' },
  ],
  stamp:{ icon:'🧀', color:'#b8862a', label:'Sotto il Salone' },
  scheda:{
    phrases:[
      ['Posso assaggiare?', 'Can I taste it?', 'At a deli counter you can always ask: they cut you a sliver.'],
      ['Qual è più dolce?', 'Which one is milder?', 'Più + an adjective (Lesson 11): più dolce, più forte, più morbido.'],
      ['Lo stagionato è più forte del fresco.', 'The aged one is stronger than the fresh one.', 'Più … di: more … than. Di + il = del.'],
      ['Preferisco lo stagionato. È buonissimo!', "I prefer the aged one. It's delicious!", 'Lo before s + consonant: lo stagionato.'],
      ['Vorrei due etti, per favore. — Altro?', "I'd like 200 grams, please. — Anything else?", 'Un etto = 100 grams. Due etti… Mezzo chilo = half a kilo.'],
      ['Quanto costa un etto? · Quanto costa?', 'How much is 100 grams? · How much is it?', 'Lesson 7. She tells you the price; you write it down.'],
    ],
    how:`<p><b>Cheese:</b> <i>fresco</i> (young) is <b>dolce</b> (mild) and <b>morbido</b> (soft); <i>stagionato</i> (aged) is <b>forte</b> (strong) and <b>duro</b> (hard). <b>Ham:</b> il prosciutto <b>crudo</b> (cured: saltier, <i>più salato</i>) or <b>cotto</b> (cooked).</p>
      <p><b>Comparing</b> (Lesson 11): <i>Qual è più dolce?</i> — <i>Il fresco è più dolce. Lo stagionato è più forte <b>del</b> fresco</i> (di + il = del).</p>
      <p><b>By weight:</b> one <b>etto</b> = 100 g: <i>un etto, due etti</i>; <b>mezzo chilo</b> = 500 g. What it is comes after <b>di</b>: <i>due etti <b>di</b> prosciutto</i>. <i><b>Il</b> fresco</i>, but <i><b>lo</b> stagionato</i> (s + consonant, like <i>lo studente</i>).</p>`,
    culture:`<p>Under the great hall of the Palazzo della Ragione, Padua's food shops have stood in the same arches for eight hundred years: Padovans just say <i>sotto il Salone</i>. At the counter, asking to taste is normal; prices are per <i>etto</i> or per <i>chilo</i>. Asiago is the local cheese: mild when <i>fresco</i>, crumbly and strong when <i>stagionato</i>.</p>`,
    vocab:[
      { group:'Al banco', words:[
        { it:'Posso assaggiare?', en:'Can I taste it?', note:'Assaggiare: to taste, to try.', also:['posso', 'assaggiare'] },
        { it:'il formaggio', g:'m', en:'the cheese', also:['formaggio'] },
        { it:'fresco / stagionato', en:'young (fresh) / aged (cheese)', note:'Il fresco, but lo stagionato (s + consonant).', also:['fresco', 'fresca', 'stagionato', 'stagionata'] },
        { it:'dolce / forte', en:'mild (sweet) / strong (in taste)', also:['dolce', 'forte'] },
        { it:'morbido / duro', en:'soft / hard', also:['morbido', 'morbida', 'duro', 'dura'] },
        { it:'Qual è più …?', say:'Qual è più dolce?', en:'Which one is more …?', note:'Lo stagionato è più forte del fresco: più … di, more … than (Lesson 11).', also:['qual'] },
        { it:'È buonissimo! · Mi piace molto.', say:'È buonissimo! Mi piace molto.', en:"It's delicious! · I like it a lot.", note:'Buono: good; buonissimo: very good, delicious. Molto: a lot. Non mi piace: I don\'t like it (Lesson 8).', also:['buonissimo', 'buonissima', 'buono', 'buona', 'molto'] },
      ] },
      { group:'Il prosciutto, il peso', note:'Un etto = 100 grams.', words:[
        { it:'il prosciutto crudo / cotto', g:'m', en:'cured ham / cooked ham', note:'Crudo: raw (cured, air-dried). Cotto: cooked.', also:['prosciutto', 'crudo', 'cotto'] },
        { it:'salato / salata', en:'salty', also:['salato', 'salata'] },
        { it:'un etto · mezzo chilo', g:'m', say:'un etto di prosciutto', en:'100 grams · half a kilo', also:['etto', 'etti', 'mezzo', 'chilo'] },
        { it:'Quanto ne vuole?', en:'How much would you like? (polite)', also:['quanto', 'ne', 'vuole'], quiz:false },
      ] },
    ],
    exercises:[
      { type:'mc', q:'At the counter, you\'d like to try the cheese first:', opts:['Posso assaggiare?', 'Posso pagare?', 'Quanto costa?'], a:0, why:'Assaggiare: to taste.', nudge:'To taste, to try.' },
      { type:'mc', q:'You like strong cheese (forte). You say:', opts:['Preferisco lo stagionato.', 'Preferisco il fresco.', 'Preferisco il cotto.'], a:0, why:'Forte = strong: lo stagionato.', nudge:'Forte: strong.' },
      { type:'mc', q:'You prefer the aged one: “Preferisco ___ stagionato.”', opts:['il', 'lo', 'la'], a:1, why:'S + consonant: lo stagionato (like lo studente).', nudge:'Stagionato starts with s + a consonant.' },
      { type:'mc', q:'You want to know the price of 100 grams:', opts:['Quanto costa un etto?', 'Quanto ne vuole?', 'Qual è più dolce?'], a:0, why:'Un etto = 100 grams. Quanto ne vuole? is what she asks you.', nudge:'Quanto costa…?' },
    ],
    tiles:M4_TILES,
  },
  hooks:{
    talk(npc){
      if (npc.id !== 'marisa') return false;
      if (questState(M4.id) === 'open') return m4Start(npc);
      if (m4Busy(npc)){ convo.m4 = true; convo.known = true; $('#dlgWho').innerHTML = `<b>Marisa</b> <span class="where">· Salumeria, sotto il Salone</span>`; }
      return false;
    },
    bank(npc, groups){
      if (!m4Busy(npc)) return null;
      if (schedaDone(M4.id)){ groups.push({ label:'Assaggiare', tiles:M4_TASTE.map(phraseTile) }); groups.push({ label:'Le piace?', tiles:M4_LIKE.map(phraseTile) }); groups.push({ label:'Comprare', tiles:M4_BUY.map(phraseTile) }); }
      groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
      return groups;
    },
    phrases(npc){
      if (!m4Busy(npc)) return [];
      const P = [['m4:taste', 'posso assaggiare'], ['m4:taste', 'assaggiare'], ['m4:taste', 'posso assaggiare il formaggio'],
        ['m4:c:fresco', 'il fresco'], ['m4:c:fresco', 'fresco'], ['m4:c:stagionato', 'lo stagionato'], ['m4:c:stagionato', 'stagionato'], ['m4:bad:stagionato', 'il stagionato'], ['m4:bad:fresco', 'lo fresco'],
        ['m4:pref', 'preferisco'], ['m4:good', 'è buonissimo'], ['m4:good', 'buonissimo'], ['m4:good', 'mi piace'], ['m4:buono', 'è buono'], ['m4:buono', 'buono'],
        ['m4:dislike', 'non mi piace'], ['m4:molto', 'molto'], ['m4:too', 'troppo'], ['m4:is', 'è'],
        ['m4:which', 'qual è più'], ['m4:which', "qual è il più"], ['m4:which', 'quale è più'], ['m4:more', 'più'],
        ['m4:of:formaggio', 'di formaggio'], ['m4:of:prosciutto', 'di prosciutto'], ['m4:formaggio', 'il formaggio'], ['m4:prosciutto', 'il prosciutto'], ['m4:prosciutto', 'prosciutto'],
        ['m4:h:crudo', 'crudo'], ['m4:h:cotto', 'cotto'], ['m4:h:crudo', 'il crudo'], ['m4:h:cotto', 'il cotto'],
        ['m4:of:fresco', 'di fresco'], ['m4:of:stagionato', 'di stagionato'], ['m4:cost', 'quanto costa'], ['greet', 'buonasera']];
      Object.keys(M4_ADJ).forEach(a => P.push(['m4:a:' + a, a]));
      Object.keys(M4_W).forEach(w => P.push(['m4:w:' + M4_W[w], w]));
      return P;
    },
    react(id, n, st, add, out, ints){ return m4React(id, n, st, add, out, ints || [id]); },
    hint(n, st){ return m4Hint(n, st); },
    afterTurn(n, out, res, words){ return m4After(n, out, words); },
  },
});
/* Marisa's opening by step */
{
  const m = NPC.marisa;
  const op = () => { const r = questPeek(M4.id);
    if (r && r.done) return { it:'Buongiorno! Com\'era il formaggio?', en:'Good afternoon! How was the cheese?' };
    if (r && r.paid) return { it:'Ecco il Suo formaggio!', en:'There\'s your cheese!' };
    if (r && r.kg) return { it:'Allora? Altro?', en:'So? Anything else?' };
    if (r && r.liked) return { it:'Allora, quanto ne vuole?', en:'So, how much would you like?' };
    if (r && r.tasted) return { it:'Allora? Quale preferisce?', en:'Well? Which one do you prefer?' };
    return { it:'Buongiorno! Mi dica.', en:'Good afternoon! How can I help?' }; };
  ['opening', 'revisitOpening'].forEach(k => Object.defineProperty(m, k, { configurable:true, enumerable:true, get:op }));
}
/* the tasting plate on Marisa's counter, while you are tasting */
setInterval(() => { if (typeof SALONE === 'undefined') return; const r = questPeek(M4.id) || {}; SALONE.taste = questState(M4.id) === 'active' && !!r.tasted && !r.paid; }, 250);
function m4Start(npc){
  convo.known = true;
  $('#dlgWho').innerHTML = `<b>Marisa</b> <span class="where">· Salumeria, sotto il Salone</span>`;
  builder.hidden = true;
  npcLine('Buongiorno! Il nostro Asiago è buonissimo, sa? Fresco o stagionato!', 'Good afternoon! Our Asiago is delicious, you know! Fresh or aged!');
  sysLine('A snack for the night train: some good cheese! But at a counter like this you taste first, you can compare, and you buy by weight… The task\'s <b>scheda</b> has the words.');
  questStart(M4.id); m4Rec(); save();
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  return true;
}
/* what was said: the cheese chosen, the weights (a weight then "di …" says what it is of), the rest */
function m4Read(ints){
  const R = { taste:false, pref:false, cheese:[], bad:null, good:false, kg:null, pr:null, bare:null, ofCheese:null, prosc:false, formaggio:false, ham:null, which:false, adj:null, cost:false,
    greet:false, yes:false, no:false, thanks:false, bye:false, repeat:false, want:false, other:[], molto:false, too:false, dislike:false, is:false, segs:[] };
  let w = null;
  const flush = () => { if (w !== null){ if (R.bare === null) R.bare = w; w = null; } };
  /* what you think, piece by piece (the tasting): each piece a cheese (or none: the one she asked about), liked or not, an
     adjective (più / troppo …). A new piece starts at e / ma / poi, at Sì / No, and at a second cheese or a second opinion */
  let seg = null, not = false;
  const piece = () => { seg = { cheese:null, pos:false, neg:false, pref:false, adj:null, more:false, too:false, is:false }; R.segs.push(seg); return seg; };
  const cur = () => seg || piece();
  const opinion = () => { const s = cur(); if ((s.pos || s.neg || s.pref) && s.cheese) piece(); return seg; };
  ints.forEach(id => {
    let m;
    if (id === 'and' || id === 'yes' || id === 'no' || id === 'ok10'){ seg = null; not = false; }
    if (id === 'm4:taste') R.taste = true;
    else if (id === 'm4:pref'){ opinion().pref = true; R.pref = true; }
    else if ((m = id.match(/^m4:c:(\w+)$/)) || (m = id.match(/^m4:bad:(\w+)$/))){
      R.cheese.push(m[1]); if (id.startsWith('m4:bad:')) R.bad = m[1];
      if (cur().cheese && cur().cheese !== m[1]) piece(); seg.cheese = m[1]; }
    else if (id === 'm4:good' || id === 'like:me' || id === 'm4:buono'){ if (id === 'm4:buono') R.buono = true; if (not){ opinion().neg = true; R.dislike = true; not = false; } else { opinion().pos = true; R.good = true; } }
    else if (id === 'm4:dislike' || id === 'dislike:me'){ opinion().neg = true; R.dislike = true; }
    else if (id === 'not') not = true;
    else if (id === 'm4:molto') R.molto = true;
    else if (id === 'm4:too' || id === 'too'){ cur().too = true; R.too = true; }
    else if (id === 'm4:is' || id === 'is:him'){ cur().is = true; R.is = true; }
    else if (id === 'm4:which') R.which = true;
    else if (id === 'm4:more'){ R.more = true; cur().more = true; }
    else if ((m = id.match(/^m4:a:(\w+)$/))){ R.adj = R.adj || m[1]; if (!cur().adj) seg.adj = m[1]; }
    else if ((m = id.match(/^m4:h:(\w+)$/))){ R.ham = m[1]; if (w !== null){ R.pr = w; w = null; } }
    else if (id === 'm4:cost' || id === 'ask_cost' || id === 'how_much') R.cost = true;
    else if ((m = id.match(/^m4:w:(\d+)$/))){ flush(); w = +m[1]; }
    else if (id === 'm4:of:prosciutto'){ R.prosc = true; if (w !== null){ R.pr = w; w = null; } }
    else if ((m = id.match(/^m4:of:(formaggio|fresco|stagionato)$/))){ if (m[1] !== 'formaggio') R.ofCheese = m[1]; if (w !== null){ R.kg = w; w = null; } else R.formaggio = true; }
    else if (id === 'm4:prosciutto') R.prosc = true;
    else if (id === 'm4:formaggio') R.formaggio = true;
    else if (id === 'greet') R.greet = true;
    else if (id === 'yes' || id === 'ok10') R.yes = true;
    else if (id === 'no') R.no = true;
    else if (id === 'nothing'){ R.no = true; R.thanks = true; }     /* (Lesson 9's parser words: no grazie, basta così) */
    else if (id === 'thanks') R.thanks = true;
    else if (id === 'bye') R.bye = true;
    else if (id === 'repeat') R.repeat = true;
    else if (id === 'want:me') R.want = true;
    else if (!['please', 'and', 'excuse', 'address', 'sir', 'madam', 'is:him'].includes(id)) R.other.push(id);
  });
  /* "un etto di prosciutto" with no kind yet: the weight is the ham's; "un etto" with a cheese after it: the cheese's */
  if (w !== null){ if (R.cheese.length && R.kg === null) R.kg = w; else if (R.bare === null) R.bare = w; w = null; }
  /* "Quanto costa un etto?" asks the price of a weight: it doesn't order it */
  if (R.cost && R.bare !== null && R.kg === null && R.pr === null){ R.costOf = R.bare; R.bare = null; }
  R.cheese = [...new Set(R.cheese)];
  return R;
}
const m4Total = r => (r.kg || 0) * M4.PRICE[r.pref || 'stagionato'] + (r.pr || 0) * M4.PRICE[r.ham || 'crudo'];
const m4What = r => [r.kg ? `${M4_W_IT[r.kg]} di ${r.pref}` : '', r.pr ? `${M4_W_IT[r.pr]} di prosciutto ${r.ham}` : ''].filter(Boolean).join(' e ');
const m4WhatEn = r => [r.kg ? `${M4_W_EN[r.kg]} of the ${r.pref === 'fresco' ? 'fresh' : 'aged'} one` : '', r.pr ? `${M4_W_EN[r.pr]} of ${r.ham === 'cotto' ? 'cooked' : 'cured'} ham` : ''].filter(Boolean).join(' and ');
/* the price per etto (asked before the order is complete) */
function m4PerEtto(r, st, say){
  if (st.m4q === 'ham' || st.m4q === 'prosc' || (st.m4q === 'altro' && r.kg)) { say('Il prosciutto? Un etto di crudo costa tre euro, un etto di cotto due euro.', 'The ham? A hundred grams of cured costs three euros, a hundred grams of cooked two euros.'); return; }
  if (r.pref) say(r.pref === 'stagionato' ? 'Un etto di stagionato costa tre euro.' : 'Un etto di fresco costa due euro.', r.pref === 'stagionato' ? 'A hundred grams of the aged one costs three euros.' : 'A hundred grams of the fresh one costs two euros.');
  else say('Un etto di fresco costa due euro, un etto di stagionato tre euro.', 'A hundred grams of the fresh one costs two euros, of the aged one three euros.');
}
function m4React(id, n, st, add, out, ints){
  if (!m4Busy(n)) return false;
  if (out.m4) return true;
  out.m4 = true; out.asked = true;
  const R = m4Read(ints), r = m4Rec(), lines = [];
  const say = (it, en, o) => { add(it, en, o); lines.push({ it, en }); };
  const fb = h => { if (!out.m4fb) out.m4fb = h; };
  const keep = () => { st.m4last = lines[lines.length - 1]; save(); return true; };
  if (!schedaDone(M4.id)){ add('Prego?', 'Pardon?'); out.m4fb = 'scheda'; return true; }
  if (R.repeat && st.m4last){ add('Sì, certo! ' + st.m4last.it, 'Yes, of course! ' + st.m4last.en, st.m4last.listen ? { listen:true, rate:0.7 } : undefined); return true; }
  const word = questUsedWords();
  const ciao = word.includes('ciao');
  if (ciao){ r.mistakes.formal++; out.m4ciao = true; }
  /* "Grazie." after "Altro?": that's all, thanks */
  if (R.thanks && !R.yes && r.kg && !r.paid && (st.m4q === 'altro' || st.m4q === 'altro2')) R.no = true;
  const wasLiked = !!r.liked;
  const business = R.taste || R.pref || R.cheese.length || R.good || R.kg !== null || R.pr !== null || R.bare !== null || R.prosc || R.formaggio || R.ham || R.which || R.adj || R.cost || R.yes || R.no || R.want || R.dislike || R.too || R.molto || R.more || R.other.length;
  /* the goodbye (once you have the cheese) */
  if (r.paid){
    if (R.bye || ciao){ say('Arrivederci! Buona giornata!', 'Goodbye! Have a nice day!'); out.end = true; out.m4done = true; }
    else if (R.thanks){ say('Prego! Buona giornata!', "You're welcome! Have a nice day!"); fb('Say goodbye: she is a stranger, at work.'); }
    else { say('Ecco il Suo formaggio. Altro?', "There's your cheese. Anything else?"); fb('You have your cheese. Say goodbye.'); }
    return keep();
  }
  if (!business){
    if (R.greet || ciao) say('Buongiorno! Mi dica.', 'Good afternoon! How can I help?');
    else if (R.thanks) say('Prego!', "You're welcome!");
    else if (R.bye){ say('Arrivederci!', 'Goodbye!'); out.end = true; }
    else say('Mi dica.', 'How can I help?');
    return keep();
  }
  if (R.bad){ r.mistakes.art++; fb(R.bad === 'stagionato' ? '<b>Stagionato</b> starts with s + a consonant: <b>lo</b> stagionato.' : '<b>Fresco</b> takes <b>il</b>: il fresco.'); }
  /* 1 · tasting */
  if (!r.tasted){
    if (R.taste || (st.m4q === 'offer' && (R.yes || R.no))){
      r.tasted = true; st.m4q = 'pref'; SALONE.taste = true;
      const nope = !R.taste && R.no && !R.yes;
      if (nope) say('No? Ma qui si assaggia sempre, sa!', 'No? But here you always taste first, you know!');
      say((nope ? 'Prego, assaggi' : 'Certo! Assaggi') + ': questo è l\'Asiago fresco… e questo è lo stagionato.', (nope ? 'Go on, try them' : 'Of course! Try them') + ': this is the fresh Asiago… and this is the aged one.');
      say('Quale preferisce?', 'Which one do you prefer?');
    } else if (R.cost){ m4PerEtto(r, st, say); say('Ma prima… vuole assaggiare?', 'But first… would you like to taste it?'); st.m4q = 'offer'; fb('She told you the prices. But at a counter like this you try before you buy: ask her if you can.'); }
    else if (R.kg !== null || R.bare !== null || R.want || R.formaggio || R.cheese.length || R.which || R.adj){
      say(R.cheese.length ? `${cap(M4_CHEESE[R.cheese[0]][1])}? Buonissimo… ma prima assaggi! Vuole assaggiare?` : 'Il formaggio? Abbiamo l\'Asiago, fresco e stagionato. Vuole assaggiare?',
        R.cheese.length ? `The ${R.cheese[0] === 'fresco' ? 'fresh' : 'aged'} Asiago? Delicious… but taste it first! Would you like to taste it?` : 'Cheese? We have Asiago, fresh and aged. Would you like to taste it?');
      st.m4q = 'offer'; fb('She wants you to taste before you buy. Ask her if you can.');
    } else if (R.prosc || R.ham){ say('Il prosciutto è buonissimo, sì! Ma il formaggio… vuole assaggiare?', 'The ham is delicious, yes! But the cheese… would you like to taste it?'); st.m4q = 'offer'; fb('You came for cheese. Ask if you can taste it first.'); }
    else if (R.good){ say('Sì, è buonissimo! Ma… vuole assaggiare?', "Yes, it's delicious! But… would you like to taste it?"); st.m4q = 'offer'; fb('Ask her if you can taste it.'); }
    else { say('Mi dica.', 'How can I help?'); fb('Ask her if you can taste the cheese first.'); }
    return keep();
  }
  /* 2 · which one, and what you think of it (you can compare them first: "Qual è più dolce?"): m4Taste answers what was said */
  if (!r.liked){
    if (!m4Taste(R, r, st, say, fb, out)) return keep();
    if (R.kg === null && R.bare === null){ if (R.cost) m4PerEtto(r, st, say); say('Allora, quanto ne vuole?', 'So, how much would you like?'); st.m4q = 'weight'; return keep(); }
  }
  /* 3 · how much (and anything else: the ham, cured or cooked) */
  if (R.ofCheese && R.ofCheese !== r.pref) r.pref = R.ofCheese;
  if (R.kg !== null) r.kg = R.kg;
  if (R.ham) st.m4ham = R.ham;
  if (R.pr !== null) st.m4pr = R.pr;
  if (R.bare !== null){
    if (st.m4q === 'proscfix' && r.kg){ st.m4ham = st.m4ham || st.m4fix; st.m4pr = R.bare; st.m4q = 'prosc'; }      /* ("Un etto, va bene?" → "Due etti": that much ham) */
    else if (st.m4q === 'prosc' || st.m4q === 'ham' || (R.prosc && r.kg)) st.m4pr = R.bare;
    else if (!r.kg) r.kg = R.bare;
    else if (st.m4q === 'altro'){ say(`${cap(M4_W_IT[R.bare])}… di che cosa?`, `${cap(M4_W_EN[R.bare])}… of what?`); fb('Say what you want it of.'); return keep(); }
  }
  /* the ham's comparisons */
  if (R.adj && (st.m4q === 'ham' || st.m4q === 'prosc' || R.prosc)){ const A = M4_ADJ[R.adj]; say(A.hit[0], A.hit[1]); if (!R.ham && !st.m4ham){ say('Allora? Crudo o cotto?', 'So? Cured or cooked?'); st.m4q = 'ham'; return keep(); } }
  else if (R.adj && !R.which){ /* (an adjective about the cheese, now it's chosen: she agrees) */ }
  if (!r.kg){
    if (R.cost){ m4PerEtto(r, st, say); say('Quanto ne vuole?', 'How much would you like?'); st.m4q = 'weight'; return keep(); }
    if (R.prosc || R.ham || st.m4pr){ say('Il prosciutto, sì… e il formaggio? Quanto ne vuole?', 'The ham, yes… and the cheese? How much would you like?'); }
    else if (wasLiked && R.cheese.length === 1 && R.cheese[0] !== r.pref){       /* (changed your mind: the other one) */
      r.pref = R.cheese[0];
      say(r.pref === 'fresco' ? 'Il fresco, allora! Va bene. Quanto ne vuole?' : 'Lo stagionato, allora! Va bene. Quanto ne vuole?', r.pref === 'fresco' ? 'The fresh one, then! All right. How much would you like?' : 'The aged one, then! All right. How much would you like?');
    }
    else if (wasLiked && (R.good || R.yes || R.cheese.length) && !R.no) say('Bene! Allora… quanto ne vuole?', 'Good! So… how much would you like?');
    else if (wasLiked && R.no) say('Ma per il treno… quanto ne vuole?', 'But for the train… how much would you like?');
    else say('Quanto ne vuole?', 'How much would you like?');
    st.m4q = 'weight'; fb('She asked how much. Answer with a weight.'); return keep();
  }
  /* the ham: which kind, how much */
  const wantsHam = R.prosc || R.ham || st.m4q === 'ham' || st.m4q === 'prosc';
  if (wantsHam && (r.pr === undefined || r.pr === null || R.prosc || R.ham)){
    const kind = st.m4ham, w = st.m4pr;
    if (!kind){ say(w ? `${cap(M4_W_IT[w])} di prosciutto. Crudo o cotto? Il crudo è più salato.` : 'Il prosciutto! Crudo o cotto? Il crudo è più salato.', w ? `${cap(M4_W_EN[w])} of ham. Cured or cooked? The cured one is saltier.` : 'Ham! Cured or cooked? The cured one is saltier.'); st.m4q = 'ham'; fb('Which ham would you like? There are two.'); return keep(); }
    if (!w){ say(kind === 'crudo' ? 'Il crudo! Quanto ne vuole?' : 'Il cotto! Quanto ne vuole?', kind === 'crudo' ? 'The cured one! How much would you like?' : 'The cooked one! How much would you like?'); st.m4q = 'prosc'; fb('How much ham? A weight.'); return keep(); }
    r.ham = kind; r.pr = w; st.m4pr = null; st.m4ham = null;
    if (m4Total(r) > M4.MAX){
      say(`${cap(M4_W_IT[r.pr])} di prosciutto? Eh, è tanto! Un etto, va bene?`, `${cap(M4_W_EN[r.pr])} of ham? Oh, that's a lot! A hundred grams, all right?`);
      st.m4fix = r.ham; r.pr = null; st.m4q = 'proscfix'; return keep();
    }
    say(`${cap(M4_W_IT[r.pr])} di ${r.ham}… ecco qua. Altro?`, `${cap(M4_W_EN[r.pr])} of ${r.ham === 'crudo' ? 'cured' : 'cooked'} ham… here you are. Anything else?`); st.m4q = 'altro2';
    if (!R.cost) return keep();
  }
  if (st.m4q === 'proscfix' && (R.yes || R.no) && (r.pr === null || r.pr === undefined)){
    if (R.yes && !R.no){ r.pr = 1; r.ham = st.m4fix; say('Un etto di ' + r.ham + '. Ecco qua! Altro?', 'A hundred grams of ' + (r.ham === 'crudo' ? 'cured' : 'cooked') + ' ham. Here you are! Anything else?'); st.m4q = 'altro2'; if (!R.cost) return keep(); }
    else { r.pr = 0; st.m4q = 'cost'; say('Va bene, niente prosciutto.', 'All right, no ham.'); if (!R.cost){ fb('Your order is ready. Ask her how much it is.'); return keep(); } }
  }
  if (r.pr === undefined || r.pr === null){
    if (st.m4q === 'altro' && (R.no || R.cost)){ r.pr = 0; }
    else if (st.m4q === 'altro' && R.yes){ say('Sì? Che cosa?', 'Yes? What?'); fb('What else would you like? Or nothing, thanks.'); return keep(); }
    else if (st.m4q !== 'altro'){
      say(`${cap(M4_W_IT[r.kg])} di ${r.pref}… ecco qua. Altro?`, `${cap(M4_W_EN[r.kg])} of the ${r.pref === 'fresco' ? 'fresh' : 'aged'} one… here you are. Anything else?`);
      st.m4q = 'altro'; return keep();
    } else { say('Altro?', 'Anything else?'); fb('She asked if you want anything else.'); return keep(); }
  }
  /* 4 · the price, when you ask it: heard (a listening line), then the notepad */
  if (!R.cost){
    if (R.no || R.thanks) say('Benissimo.', 'Very good.');
    else if (st.m4q !== 'altro2' || !lines.length) say('Altro?', 'Anything else?');
    st.m4q = 'cost'; if (!lines.length || R.no || R.thanks) fb('That is all you want. Now ask her how much it is.');
    return keep();
  }
  r.price = m4Total(r);
  say(`Allora: ${m4What(r)}.`, `So: ${m4WhatEn(r)}.`);
  say(`Sono ${numIt(r.price)} euro.`, `That's ${m4En(r.price)} euros.`, { listen:true });
  st.m4last = { it:`Sono ${numIt(r.price)} euro.`, en:`That's ${m4En(r.price)} euros.`, listen:true };
  st.m4q = 'price'; out.m4price = true; save();
  return true;
}
/* the tasting: which one, and what you think of it. She answers what you said, and moves on as soon as you have one you like:
   - a cheese you like: Preferisco il fresco · Mi piace lo stagionato · Lo stagionato è buonissimo · Sì / Sì, mi piace (molto) / È buono
     to her "Le piace?" (about the one she asked) → chosen ("Il fresco, eh? È più dolce… Ottima scelta!"), then "Quanto ne vuole?";
   - one you don't: No · Non mi piace · È troppo forte (the one that word fits) → she offers the other one ("Allora assaggi il fresco…
     Le piace?"); both → "Ma per il treno… quale prende?";
   - a comparison: Il fresco è più dolce · Lo stagionato è più forte → "Esatto!" (about the one she asked: chosen; about the other:
     "Allora preferisce il fresco?", where Sì chooses it and No the other); a word that doesn't fit gets "No, no: il fresco è dolce!";
   - a question (Qual è più dolce?) → the comparison, then "Quale preferisce?"; a cheese alone → "Il fresco, eh? E… Le piace?".
   Returns true once a cheese is chosen (r.liked). */
function m4Taste(R, r, st, say, fb, out){
  const talk = (st.m4q === 'like' || st.m4q === 'confirm') && r.pref ? r.pref : null;      // the cheese she just asked about
  if (!r.disliked) r.disliked = [];
  const C = c => cap(M4_CHEESE[c][0]), CE = c => c === 'fresco' ? 'fresh' : 'aged';
  const target = s => s.cheese || talk || ((s.too || s.neg) && s.adj ? M4_ADJ[s.adj].cheese : null);
  const choose = (c, pre) => {
    if (pre) say(pre[0], pre[1]);
    say(c === 'stagionato' ? 'Lo stagionato! Ha ragione: è più forte del fresco. È il mio preferito.' : 'Il fresco, eh? È più dolce, e morbido. Ottima scelta!',
      c === 'stagionato' ? 'The aged one! You\'re right: it\'s stronger than the fresh one. It\'s my favourite.' : 'The fresh one, eh? It\'s milder, and soft. Excellent choice!');
    r.pref = c; r.liked = true; r.disliked = []; st.m4fussy = false; questStep(M4.id, 'compra'); return true; };
  const which = (it, en, h) => { say(it, en); r.pref = null; st.m4q = 'pref'; fb(h || 'Say which of the two you prefer.'); return false; };
  /* one you don't like: she offers the other (both: then one of them anyway, for the train) */
  const offer = (c, pre) => {
    if (!r.disliked.includes(c)) r.disliked.push(c);
    const o = m4Other(c);
    if (r.disliked.includes(o)){ r.disliked = []; st.m4fussy = true;
      return which('Non Le piace neanche ' + M4_CHEESE[c][0] + '? Eh… ma per il treno! Quale prende, il fresco o lo stagionato?', `You don't like the ${CE(c)} one either? Well… but for the train! Which one will you take, the fresh or the aged?`, 'It\'s for the train: choose one of the two.'); }
    if (pre) say(pre[0], pre[1]);
    say(o === 'fresco' ? 'Allora assaggi il fresco: è più dolce, e più morbido. Le piace?' : 'Allora assaggi lo stagionato: è più forte, più saporito. Le piace?',
      o === 'fresco' ? "Then try the fresh one: it's milder, and softer. Do you like it?" : "Then try the aged one: it's stronger, with more flavour. Do you like it?");
    r.pref = o; st.m4q = 'like'; fb('Now the other one. Tell her what you think of it.'); return false; };
  /* a word that doesn't fit the cheese: "Il fresco, forte? No, no: il fresco è dolce e morbido!" */
  const bad = R.which ? null : R.segs.find(s => s.adj && (s.cheese || (talk && (s.is || s.more || s.too))) && !m4Fits(s.adj, s.cheese || talk));
  if (bad){
    const c = bad.cheese || talk, A = M4_ADJ[bad.adj]; r.mistakes.adj++;
    say(`${C(c)}, ${bad.too ? 'troppo ' : ''}${bad.adj}? No, no: ${c === 'fresco' ? 'il fresco è dolce e morbido' : 'lo stagionato è forte e duro'}!`, `${cap(M4_CHEESE[c][2])}, ${bad.too ? 'too ' : ''}${A.en}? No, no: ${c === 'fresco' ? 'the fresh one is mild and soft' : 'the aged one is strong and hard'}!`);
    fb(`Not that one: taste them again. Which one is ${A.en}?`); if (!talk) st.m4q = 'pref'; return false;
  }
  if (R.cheese.length > 1 && !R.segs.some(s => s.neg || s.too) && R.segs.filter(s => s.pref).length !== 1){ say('Tutti e due? Eh… quale preferisce?', 'Both? Well… which one do you prefer?'); fb('Choose one of the two.'); return false; }
  /* a comparison asked ("Qual è più dolce?", "più forte?"): she answers it */
  const stmt = R.which ? null : R.segs.find(s => s.adj && !s.too && (s.cheese || (talk && (s.is || s.more))));
  const opinion = R.segs.some(s => s.pos || s.neg || s.pref || s.too);
  if (R.adj && !stmt && !R.segs.some(s => s.too) && (R.which || !R.cheese.length)){
    const A = M4_ADJ[R.adj];
    say(A.it[0], A.it[1]); if (!r.asked.includes(R.adj)) r.asked.push(R.adj); out.m4cmp = R.adj;
    if (!opinion && !R.yes && !R.no){ say('Allora? Quale preferisce?', 'So? Which one do you prefer?'); r.pref = null; st.m4q = 'pref'; return false; }
  } else if (R.which && !R.adj){ say('Più… che cosa?', 'More… what?'); fb('Say what you want to compare: which one is milder, stronger, softer…?'); return false; }
  /* a cheese you like (the one you prefer wins over the one you also like) */
  const likes = R.segs.filter(s => (s.pos || s.pref) && !s.neg && !s.too && target(s));
  if (likes.length){
    const c = (likes.find(s => s.pref) || likes[likes.length - 1]);
    const pre = R.molto ? ['Le piace molto? Che bello!', 'You like it a lot? Lovely!'] : R.buono ? ['Buono? È buonissimo!', "Good? It's delicious!"] : R.yes && !c.cheese ? ['Bene!', 'Good!'] : null;
    return choose(target(c), pre);
  }
  if (R.ofCheese && R.kg !== null) return choose(R.ofCheese);          // ("Vorrei due etti di fresco": that one)
  /* one you don't like */
  const dis = R.segs.find(s => (s.neg || (s.too && s.adj)) && target(s));
  if (dis){
    const A = dis.too && dis.adj ? M4_ADJ[dis.adj] : null;
    return offer(target(dis), A ? [`Troppo ${dis.adj}? Va bene…`, `Too ${A.en}? All right…`] : ['Non Le piace? Peccato!', "You don't like it? What a pity!"]);
  }
  /* a comparison said: "Il fresco è più dolce" → "Esatto!" */
  if (stmt){
    const c = stmt.cheese || talk, echo = [`Esatto! ${C(c)} è più ${stmt.adj}.`, `Exactly! The ${CE(c)} one is ${M4_MORE_EN[stmt.adj]}.`];
    if (!r.asked.includes(stmt.adj)) r.asked.push(stmt.adj);
    if (c === talk) return choose(c, echo);
    say(echo[0], echo[1]); say(`Allora preferisce ${M4_CHEESE[c][0]}?`, `So you prefer the ${CE(c)} one?`);
    r.pref = c; st.m4q = 'confirm'; fb('Answer her question.'); return false;
  }
  /* Sì / No to her question */
  if (R.yes && !R.no){
    if (talk) return choose(talk, st.m4q === 'like' ? ['Sì? Bene!', 'Yes? Good!'] : null);
    return which('Sì… ma quale? Il fresco o lo stagionato?', 'Yes… but which one? The fresh or the aged?');
  }
  if (R.no){
    if (talk && st.m4q === 'confirm' && !r.disliked.includes(m4Other(talk))) return choose(m4Other(talk), ['Ah, no?', 'Oh, no?']);
    if (talk) return offer(talk, ['No? Peccato!', 'No? What a pity!']);
    if (st.m4fussy) return which('Eh… ma per il treno! Il fresco o lo stagionato?', 'Well… but for the train! The fresh or the aged?', 'It\'s for the train: choose one of the two.');
    return which('No? Allora… quale preferisce: il fresco o lo stagionato?', 'No? Then… which one do you prefer: the fresh or the aged?');
  }
  /* a cheese, named alone: "Il fresco, eh? E… Le piace?" (the one she asked about, named again: that one) */
  const named = R.segs.filter(s => s.cheese).map(s => s.cheese).pop();
  if (named){
    if (named === talk || st.m4fussy) return choose(named);
    say(named === 'stagionato' ? 'Lo stagionato, eh? E… Le piace?' : 'Il fresco, eh? E… Le piace?', named === 'stagionato' ? 'The aged one, eh? And… do you like it?' : 'The fresh one, eh? And… do you like it?');
    r.pref = named; st.m4q = 'like'; fb('She asked if you like it. Tell her what you think.'); return false;
  }
  if (out.m4cmp){ st.m4q = 'pref'; return false; }         // (compared, with an opinion that names no cheese)
  if (R.good) return which('Grazie! Ma quale? Il fresco o lo stagionato?', 'Thank you! But which one? The fresh or the aged?', 'Which of the two did you prefer?');
  if (R.dislike) return which('Non Le piace? Quale? Il fresco o lo stagionato?', "You don't like it? Which one? The fresh or the aged?", 'Which one do you mean? Say which of the two.');
  if (R.pref) return which('Preferisce…? Quale?', 'You prefer…? Which one?');
  if (R.taste){ say('Certo! Assaggi, assaggi.', 'Of course! Go on, taste them.'); return which('Allora… quale preferisce?', 'So… which one do you prefer?'); }
  if (R.cost){ m4PerEtto(r, st, say); return which('Ma quale preferisce?', 'But which one do you prefer?', 'First say which of the two you prefer.'); }
  if (R.kg !== null || R.bare !== null || R.want) return which('Sì, sì… ma quale? Il fresco o lo stagionato?', 'Yes, yes… but which one? The fresh or the aged?', 'First say which of the two you prefer.');
  say('Allora? Quale preferisce?', 'Well? Which one do you prefer?'); if (!talk) st.m4q = 'pref'; fb('Which one do you prefer? And do you like it?'); return false;
}
function m4After(n, out, words){
  if (!m4Busy(n) || !out.m4) return false;
  const r = m4Rec();
  if (out.m4fb === 'scheda'){ showHint('First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).'); return true; }
  if (out.m4done){
    enqueue(() => { if (!questPeek(M4.id).done) questDone(M4.id); });
    convo.keepHint = true;
    showHint((out.m4ciao ? 'She said <b>arrivederci</b>: with a stranger at work, that is the goodbye (not ciao). ' : '') + 'Cheese for the train! A stamp in your passport.', 'Fatto!');
    enqueue(() => { if (convo) endConvo(); }); return true;
  }
  if (out.m4price){ m4Pad(n); return true; }
  if (out.m4ciao && !convo.tips.formal){ convo.tips.formal = true; showHint('Marisa is a stranger at work: <b>buongiorno</b>, <b>arrivederci</b>, not ciao.' + (out.m4fb ? ' ' + out.m4fb : ''), 'Consiglio'); return true; }
  if (out.m4fb){ showHint(hintAfter(stepTries(convo.st, 'm4-' + (convo.st.m4q || 'taste')), out.m4fb, m4Strong(convo.st)), 'Consiglio'); return true; }
  if (out.m4cmp && !r.liked){ showHint('Now you know a little more about them. Which one do you prefer? And do you like it?', 'Fatto!'); return true; }
  if (out.end) return false;
  showHint(contextHint(false));
  return true;
}
const m4Strong = st => ({ taste:'Ask if you may taste: <b>posso</b> … <b>assaggiare</b>.', offer:'Ask if you may taste: <b>posso</b> … <b>assaggiare</b>.',
  pref:'Which one: <b>preferisco</b> … (<b>il fresco</b> or <b>lo stagionato</b>). To compare first: <b>qual è più</b> …', like:'What you think: <b>sì</b>, <b>mi piace</b>… or <b>no</b>, <b>non mi piace</b>.', confirm:'<b>Sì</b> or <b>no</b>… or <b>preferisco</b> … (<b>il fresco</b>, <b>lo stagionato</b>).',
  weight:'A weight: <b>un etto</b>, <b>due etti</b>, <b>mezzo chilo</b>…', altro:'Nothing else? Say <b>no</b>, politely… or a weight <b>di prosciutto</b>.', altro2:'Nothing else? Say <b>no</b>, politely; then the price: <b>quanto</b> …',
  ham:'The two hams: <b>crudo</b> or <b>cotto</b>.', prosc:'A weight: <b>un etto</b>, <b>due etti</b>…', proscfix:'<b>Sì</b> or <b>no</b>.', cost:'Ask the price: <b>quanto</b> …',
  bye:'The polite goodbye: <b>arrivederci</b>.' })[st.m4q || 'taste'];
/* the price on your notepad; then you pay and the cheese goes in your bag */
function m4Pad(n){
  const r = m4Rec(), st = convo.st;
  askNumber({ title:'Your notepad', label:m4What(r), tip:'What did she say? Write the price in digits.',
    onAnswer(x){
      if (!convo || convo.npc !== n) return true;
      if (x === r.price){
        revealListen({ all:true });
        r.noted = true; r.paid = true; save();
        sysLine(`Your notepad: <b>${esc(m4What(r))} · € ${x}</b>. You pay.`);
        const kind = r.pref === 'fresco' ? 'Asiago fresco' : 'Asiago stagionato';
        bagAdd({ id:'formaggio', label_it:'il formaggio', label_en:`${kind}: a snack for the night train`, note:[`${kind} · ${M4_W_IT[r.kg]}`, r.pr ? `prosciutto ${r.ham} · ${M4_W_IT[r.pr]}` : ''].filter(Boolean).join(' · '), icon:'🧀' });
        npcLine('Grazie! Ecco il Suo formaggio.', "Thank you! Here's your cheese.");
        sysLine('<b>Il formaggio</b> is in your bag.');
        st.m4q = 'bye';
        showHint('Got it! Now say goodbye: she is a stranger, at work.', 'Fatto!');
        renderHUD();
        return true;
      }
      st.m4pad = (st.m4pad || 0) + 1; r.mistakes.pad++; save();
      sysLine(`You write <b>€ ${x}</b>. Hmm… is that what she said?`);
      if (st.m4pad === 1){ npcLine(`${cap(numIt(r.price))} euro.`, `${cap(m4En(r.price))} euros.`, { listen:true, rate:0.7 }); showHint('She said it again, slowly. Listen for the number.'); return false; }
      if (st.m4pad === 2){ showHint('Still not it. Press <b>🔊 Ascolta di nuovo</b> on her line above to hear it again.'); return false; }
      revealListen({ all:true });
      showHint('Read the price above, then write it in digits.');
      return false;
    } });
}
function m4Hint(n, st){
  if (!m4Busy(n)) return null;
  if (!schedaDone(M4.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
  const r = m4Rec();
  if (r.paid){ st.m4q = 'bye'; return { h:'You have your cheese. Say goodbye: she is a stranger, at work.', strong:m4Strong(st), step:'m4-bye' }; }
  if (!r.tasted){ st.m4q = st.m4q === 'offer' ? 'offer' : 'taste'; return { h:'Cheese for the train: at a counter like this you try before you buy. Ask her.', strong:m4Strong(st), step:'m4-taste' }; }
  if (!r.liked){ if (st.m4q !== 'like' && st.m4q !== 'confirm') st.m4q = 'pref';
    return { h:st.m4q === 'like' ? 'She asked if you like it. Tell her.' : st.m4q === 'confirm' ? 'Answer her question: is that the one for you?' : 'You tasted both. Say which one you prefer, or what you think of it. Not sure? Ask her which one is milder, or stronger.', strong:m4Strong(st), step:'m4-' + st.m4q }; }
  if (!r.kg){ st.m4q = 'weight'; return { h:'Say how much you would like: a weight. (You can ask the price of 100 grams first.)', strong:m4Strong(st), step:'m4-weight' }; }
  if (st.m4q === 'ham') return { h:'She asked which ham you would like.', strong:m4Strong(st), step:'m4-ham' };
  if (st.m4q === 'prosc') return { h:'How much ham? A weight.', strong:m4Strong(st), step:'m4-prosc' };
  if (st.m4q === 'proscfix') return { h:'She thinks that is a lot of ham, and offers less. Yes or no?', strong:m4Strong(st), step:'m4-proscfix' };
  if (st.m4q === 'cost' || st.m4q === 'altro2') return { h:'Anything else? If not, ask her how much it is.', strong:m4Strong(st), step:'m4-cost' };
  st.m4q = 'altro'; return { h:'She asked if you want anything else.', strong:m4Strong(st), step:'m4-altro' };
}
function mercatoDbg(){ const r = questPeek(M4.id) || {}; return { tasted:!!r.tasted, asked:(r.asked || []).slice(), pref:r.pref || null, liked:!!r.liked, kg:r.kg || null, pr:r.pr == null ? null : r.pr, ham:r.ham || null, price:r.price || null, noted:!!r.noted, paid:!!r.paid, salone:typeof SALONE !== 'undefined' ? saloneDbg() : null }; }
/* tests: Marisa's tasting again from "Quale preferisce?" (the two pieces just tasted; the bag's cheese put aside), for the answer
   variants; __debug.m4Tasting('restore') puts the record and the cheese back as they were before the first call */
{ let before = null;
  window.__debug.m4Tasting = how => {
    const r = questRec(M4.id);
    if (how === 'restore'){ if (before){ S.quests[M4.id] = JSON.parse(before.rec); if (before.bag && !bagHas('formaggio')) bagAdd(before.bag); before = null; save(); renderHUD(); } return; }
    if (!before) before = { rec:JSON.stringify(r), bag:bagGet('formaggio') ? { ...bagGet('formaggio') } : null };
    const keep = { words:r.words, practice:r.practice };
    Object.keys(r).forEach(k => delete r[k]);
    Object.assign(r, { started:true, step:'assaggia', done:false, at:null, ...keep, tasted:true });
    m4Rec(); bagRemove('formaggio'); save(); renderHUD();
  };
}
