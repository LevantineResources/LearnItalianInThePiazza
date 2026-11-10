/* Quest 2 · In farmacia (any time). Design: docs/lessons/12-la-citta.md, the quests; system: engine/quests.js; the shop:
   world/shops.js (FARMACIA: the template's first use).
   Before Venice you need a few things: sun cream, plasters, toothpaste. In the pharmacy in San Lorenzo you ask the
   pharmacist (Lei) where they are or whether they have them: "Dov'è la crema solare?" "Dove sono i cerotti?" "Avete il
   dentifricio?" She answers with Lesson 10's prepositions: "È in fondo, a destra, sopra lo scaffale." You find each thing
   on the shelves (E: the shelf close up; tap it: into your bag), then pay at the counter: "Quant'è?" → the total (heard) →
   your notepad → "Ecco … euro" → the change. Optional: "Mi fa male la testa: ha qualcosa?" → an aspirin (behind the
   counter: medicines always are), added to the bill.
   Italian: la crema solare, i cerotti, il dentifricio, lo spazzolino, l'aspirina, lo scaffale; Dov'è / Dove sono…? (one /
   more than one), Avete…?, Mi fa male la testa, Ha qualcosa?; heard: in fondo, a destra / a sinistra, sopra / sullo / sotto
   lo scaffale.
   Saved on the quest's record (questRec('farmacia')): asked:{ id:true } (what you asked about), aspirina, noted, paid,
   given, mistakes:{ agree, pad, pay, rude }. */
const M2 = { id:'farmacia', LIST:['crema', 'cerotti', 'dentifricio'] };
/* what the pharmacist sells that the player can name, where it is (her words), and the price */
const M2_ITEMS = {
  crema:{ it:'la crema solare', en:'sun cream', pl:false, where:'in fondo, a destra, sopra lo scaffale', where_en:'at the back, on the right, on top of the shelf', price:9, fixture:'fondo-dx' },
  cerotti:{ it:'i cerotti', en:'plasters', pl:true, where:'a sinistra, sopra lo scaffale', where_en:'on the left, on top of the shelf', price:3, fixture:'sx' },
  dentifricio:{ it:'il dentifricio', en:'toothpaste', pl:false, where:'in fondo, a sinistra, sotto lo scaffale', where_en:'at the back, on the left, under the shelf', price:2, fixture:'fondo-sx' },
  spazzolino:{ it:'lo spazzolino', en:'a toothbrush', pl:false, where:'in fondo, a sinistra, sullo scaffale', where_en:'at the back, on the left, on the shelf', price:3, fixture:'fondo-sx' },
  aspirina:{ it:"l'aspirina", en:'aspirin', pl:false, where:'qui, dietro il banco', where_en:'here, behind the counter', price:4 },
};
const M2_ASPIRINA = 4;
const m2Rec = () => { const r = questRec(M2.id); if (!r.asked) r.asked = {}; if (!r.mistakes) r.mistakes = { agree:0, pad:0, pay:0, rude:0 }; return r; };
const m2Has = id => bagHas(id);
const m2Missing = () => M2.LIST.filter(id => !m2Has(id));
const m2Total = () => M2.LIST.reduce((a, id) => a + M2_ITEMS[id].price, 0) + (m2Rec().aspirina ? M2_ASPIRINA : 0);
const m2Keeper = n => !!n && n.id === 'farmacista' && ['open', 'active'].includes(questState(M2.id));
const m2Busy = n => !!n && n.id === 'farmacista' && questState(M2.id) === 'active';
QWORDS.add('dove sono'); QWORDS.add('qualcosa'); CLAUSE.add('dove'); CLAUSE.add('mi fa'); NOTQ.add('fa male');
const m2Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
const M2_TILES = [
  m2Tile("dov'è", "Dov'è…?", 'where is…?'), m2Tile('dove sono', 'Dove sono…?', 'where are…? (more than one)'), m2Tile('avete', 'Avete…?', 'do you have…? (a shop)'),
  m2Tile('la crema solare', 'la crema solare', 'sun cream'), m2Tile('i cerotti', 'i cerotti', 'plasters'), m2Tile('il dentifricio', 'il dentifricio', 'toothpaste'),
  m2Tile('lo spazzolino', 'lo spazzolino', 'a toothbrush'), m2Tile("l'aspirina", "l'aspirina", 'aspirin'),
  m2Tile('mi fa male la testa', 'Mi fa male la testa.', 'I have a headache'), m2Tile('ha qualcosa', 'Ha qualcosa?', 'have you got something? (polite)'),
];
const M2_PAY = [m2Tile("quant'è", "Quant'è?", 'how much is it?'), m2Tile('ecco', 'Ecco', 'here is / here you are'), m2Tile('euro', 'euro', 'euro, euros')];

QUESTS.push({
  id:M2.id, n:2, title_it:'In farmacia', title_en:'Shopping at the pharmacy',
  window:'any',
  place:{ scene:'farmacia', x:480, y:540, label:'Farmacia, San Lorenzo' },
  giver:'farmacista',
  steps:[
    { id:'find', en:'Find sun cream, plasters and toothpaste: ask the pharmacist where they are', who:'farmacista', where:'Farmacia, San Lorenzo' },
    { id:'pay', en:'Pay at the counter', who:'farmacista', where:'Farmacia, San Lorenzo' },
  ],
  items:{
    crema:{ label_it:'la crema solare', label_en:'sun cream (for Venice)', icon:'🧴', for:'farmacista' },
    cerotti:{ label_it:'i cerotti', label_en:'plasters', icon:'🩹', for:'farmacista' },
    dentifricio:{ label_it:'il dentifricio', label_en:'toothpaste', icon:'🪥', for:'farmacista' },
  },
  stamp:{ icon:'✚', color:'#2e8b57', label:'Farmacia' },
  scheda:{
    phrases:[
      ["Dov'è la crema solare?", 'Where is the sun cream?', "Dov'è + one thing."],
      ['Dove sono i cerotti?', 'Where are the plasters?', 'Dove sono + more than one thing.'],
      ['Avete il dentifricio?', 'Do you have toothpaste?', 'Avete: do you (the shop, all of you) have…?'],
      ['È in fondo, a destra, sopra lo scaffale.', "It's at the back, on the right, on top of the shelf.", 'What you will hear. Sopra and sotto are from Lesson 10.'],
      ['Mi fa male la testa: ha qualcosa?', 'I have a headache: have you got something?', 'Mi fa male…: … hurts (literally: it does me harm).'],
    ],
    how:`<p><b>Dov'è</b> asks about one thing, <b>dove sono</b> about more than one: <i>Dov'è la crema solare?</i> · <i>Dove sono i cerotti?</i></p>
      <p><b>Avete…?</b> asks a shop what it has (<i>voi</i>: everyone who works there). <b>Ha…?</b> asks one person, politely: <i>Ha qualcosa?</i></p>
      <p>The answers put things in place: <b>in fondo</b> (at the back), <b>a destra / a sinistra</b>, and on the shelf, <b>lo scaffale</b>:
      <b>sopra</b> lo scaffale (on top of it), <b>sullo</b> scaffale (on it), <b>sotto</b> lo scaffale (under it).</p>`,
    culture:`<p>The green cross means <b>farmacia</b>. Medicines, even aspirin, are kept behind the counter: you ask the pharmacist, who often gives advice too. At night one pharmacy in each area stays open: <i>la farmacia di turno</i>.</p>`,
    vocab:[
      { group:'In farmacia', words:[
        { it:'la crema solare', g:'f', en:'the sun cream', also:['crema', 'solare'] },
        { it:'i cerotti', g:'m pl', en:'the plasters', also:['cerotti'] },
        { it:'il dentifricio', g:'m', en:'the toothpaste', also:['dentifricio'] },
        { it:'lo spazzolino', g:'m', en:'the toothbrush', also:['spazzolino'] },
        { it:"l'aspirina", g:'f', en:'the aspirin', also:['aspirina'] },
        { it:'lo scaffale', g:'m', en:'the shelf', also:['scaffale', 'sullo'] },
      ] },
      { group:'Asking', words:[
        { it:'Dove sono…?', say:'Dove sono i cerotti?', en:'Where are…? (more than one)', also:['dove'] },
        { it:'Avete…?', say:'Avete il dentifricio?', en:'Do you have…? (a shop)' },
        { it:'Mi fa male la testa.', en:'I have a headache.', also:['fa', 'male', 'testa'] },
        { it:'Ha qualcosa?', en:'Have you got something? (polite)', also:['qualcosa'] },
      ] },
    ],
    exercises:[
      { type:'mc', q:'The plasters: “___ i cerotti?”', opts:["Dov'è", 'Dove sono', "Quant'è"], a:1, why:'I cerotti: more than one, so dove sono.', nudge:'Cerotti is plural.' },
      { type:'mc', q:'“La crema solare? È in fondo, a destra, sopra lo scaffale.” Where do you look?', opts:['At the back on the right, on top of the shelf', 'On the left, under the shelf', 'At the back on the left, on the shelf'], a:0, why:'In fondo: at the back. A destra: on the right. Sopra: on top of.', nudge:'Sopra is on top, sotto is under.' },
      { type:'mc', q:'Your head hurts. You tell the pharmacist: “Mi fa male ___.”', opts:['lo scaffale', 'la testa', 'il dentifricio'], a:1, why:'La testa: the head.', nudge:'Which one is part of you?' },
      { type:'mc', q:'You ask the shop whether they have toothpaste:', opts:['Avete il dentifricio?', 'Dove sono il dentifricio?', 'Mi fa male il dentifricio.'], a:0, why:'Avete…? asks a shop what it has.', nudge:'Dove sono is for more than one thing.' },
    ],
    tiles:M2_TILES, bankTiles:M2_PAY,
  },
  hooks:{
    talk(npc){
      if (npc.id !== 'farmacista') return false;
      if (questState(M2.id) === 'open') return m2Start(npc);
      if (m2Busy(npc)){ convo.m2 = true; convo.known = true; $('#dlgWho').innerHTML = `<b>${esc(npc.name)}</b> <span class="where">· ${esc(npc.place)}</span>`; }
      return false;
    },
    bank(npc, groups){
      if (!m2Busy(npc)) return null;
      if (schedaDone(M2.id)){
        groups.push({ label:'In farmacia', tiles:M2_TILES.map(phraseTile) });
        groups.push({ label:'Pagare', tiles:M2_PAY.map(phraseTile) });
        groups.push({ label:'Numeri', tiles:Array.from({ length:24 }, (_, i) => ({ w:numIt(i + 1), label:numIt(i + 1), gloss:String(i + 1) })) });
      }
      groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
      return groups;
    },
    phrases(npc){
      if (!m2Busy(npc)) return [];
      const P = [['m2:where', "dov'è"], ['m2:wherepl', 'dove sono'], ['m2:have', 'avete'], ['m2:head', 'mi fa male la testa'], ['m2:head', 'mi fa male'], ['m2:sth', 'ha qualcosa'],
        ['m2:sth', 'avete qualcosa'], ['how_much', "quant'è"]];
      Object.entries(M2_ITEMS).forEach(([id, d]) => {
        const w = d.it.toLowerCase(), bare = w.replace(/^(il|lo|la|i|gli|le) /, '').replace(/^l'/, '');
        P.push(['m2:item:' + id, w], ['m2:item:' + id, bare]);
        P.push([(d.pl ? 'm2:bad-where:' : 'm2:where:') + id, "dov'è " + w], [(d.pl ? 'm2:where:' : 'm2:bad-wherepl:') + id, 'dove sono ' + w]);
        P.push(['m2:have:' + id, 'avete ' + w], ['m2:have:' + id, 'ha ' + w]);
      });
      return P;
    },
    react(id, n, st, add, out, ints){ return m2React(id, n, st, add, out, ints || [id]); },
    hint(n, st){ return m2Hint(n, st); },
    afterTurn(n, out, res, words){ return m2After(n, out, words); },
    /* the shelves: taking the things on the list */
    shopTake(shop, f, it){
      if (shop !== 'farmacia' || questState(M2.id) !== 'active') return null;
      if (M2.LIST.includes(it.id)){
        bagAdd(it.id, questById(M2.id));
        const left = m2Missing();
        if (!left.length && questAt(M2.id, 'find')) questStep(M2.id, 'pay');
        return { ok:true, msg:`<b>${esc(cap(it.it))}</b>: in your bag! ` + (left.length ? `Still on your list: ${left.map(id => M2_ITEMS[id].en).join(', ')}.` : 'That\'s everything on your list. Now pay at the counter.') };
      }
      return { ok:false, msg:'That isn\'t on your list. You put it back.' };
    },
    checklist(){
      if (questState(M2.id) !== 'active' || S.scene !== 'farmacia') return null;
      const r = m2Rec();
      return { title:'La lista', button:'Lista', sub:'For Venice tomorrow', items:[
        ...M2.LIST.map(id => ({ label:M2_ITEMS[id].en, done:m2Has(id), cur:!m2Has(id) })),
        ...(r.aspirina ? [{ label:'aspirin (for your head)', done:true }] : []),
      ], foot:r.noted ? `Total: <b>€ ${m2Total()}</b>` : '' };
    },
  },
});
/* the pharmacist's opening: at night "Buonasera"; once everything is found, "found everything?" */
{
  const f = NPC.farmacista;
  const op = () => questAt(M2.id, 'pay') ? (daytime() === 'night' ? { it:'Buonasera! Allora, ha trovato tutto?', en:'Good evening! So, have you found everything?' } : { it:'Allora, ha trovato tutto?', en:'So, have you found everything?' })
    : daytime() === 'night' ? { it:'Buonasera! Mi dica.', en:'Good evening! How can I help?' } : { it:'Buongiorno! Mi dica.', en:'Good afternoon! How can I help?' };
  ['opening', 'revisitOpening'].forEach(k => Object.defineProperty(f, k, { configurable:true, enumerable:true, get:op }));
  Object.defineProperty(f, 'greet', { configurable:true, enumerable:true, get:() => daytime() === 'night' ? { it:'Buonasera', en:'Good evening' } : { it:'Buongiorno', en:'Good afternoon' } });
}

/* the start: your list for Venice (scripted lines; then the scheda opens) */
function m2Start(npc){
  convo.known = true;
  $('#dlgWho').innerHTML = `<b>${esc(npc.name)}</b> <span class="where">· ${esc(npc.place)}</span>`;
  builder.hidden = true;
  const o = npc.opening;
  npcLine(o.it, o.en);
  sysLine('Venice tomorrow, and you have packed almost nothing. Your list: <b>sun cream</b>, <b>plasters</b>, <b>toothpaste</b>. But what are they called in Italian, and where are they? The task\'s <b>scheda</b> has the words.');
  questStart(M2.id); m2Rec(); save();                     // (at once: closing the dialog early must not lose the task)
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  return true;
}

/* what the player said */
function m2Read(ints){
  const R = { where:[], have:[], bad:[], bare:[], qWhere:false, qHave:false, head:false, sth:false, howMuch:false, give:false, pay:null, payBare:false, thanks:false, bye:false, greet:false, yes:false, no:false, repeat:false, other:[] };
  let ecco = false;
  ints.forEach(id => {
    let m;
    if ((m = id.match(/^m2:where:(.+)$/))) R.where.push(m[1]);
    else if ((m = id.match(/^m2:have:(.+)$/))) R.have.push(m[1]);
    else if ((m = id.match(/^m2:bad-(where|wherepl):(.+)$/))){ R.bad.push({ kind:m[1], id:m[2] }); R.where.push(m[2]); }
    else if ((m = id.match(/^m2:item:(.+)$/))) R.bare.push(m[1]);
    else if (id === 'm2:where' || id === 'm2:wherepl' || id === 'where') R.qWhere = true;
    else if (id === 'm2:have' || id === 'have') R.qHave = true;
    else if (id === 'm2:head') R.head = true;
    else if (id === 'm2:sth') R.sth = true;
    else if (id === 'how_much') R.howMuch = true;
    else if (/^(give|bag):/.test(id)){ const k = id.split(':')[1]; if (M2.LIST.includes(k)) R.give = true; else R.other.push(id); }
    else if (id === 'here_is'){ ecco = true; R.payBare = true; }
    else if ((m = id.match(/^num:(\d+)$/))){ if (ecco || R.pay === null) R.pay = +m[1]; }
    else if (id === 'euro'){}
    else if (id === 'thanks') R.thanks = true;
    else if (id === 'bye') R.bye = true;
    else if (id === 'greet') R.greet = true;
    else if (id === 'yes' || id === 'ok10') R.yes = true;
    else if (id === 'no') R.no = true;
    else if (id === 'repeat') R.repeat = true;
    else if (!['excuse', 'please', 'and', 'madam', 'sir', 'address'].includes(id)) R.other.push(id);
  });
  /* a bare item after "dov'è" / "avete" on its own tile (a parse the full phrases did not catch) */
  if (R.qWhere && R.bare.length){ R.where.push(...R.bare); R.bare = []; }
  if (R.qHave && R.bare.length){ R.have.push(...R.bare); R.bare = []; }
  if (R.pay !== null && !R.payBare && !ints.includes('euro')) R.pay = null;
  return R;
}
const m2Place = id => { const d = M2_ITEMS[id]; return `${cap(d.it)}? ${d.pl ? 'Sono' : 'È'} ${d.where}.`; };
const m2PlaceEn = id => { const d = M2_ITEMS[id]; return `${cap(d.en)}? ${d.pl ? 'They\'re' : 'It\'s'} ${d.where_en}.`; };
function m2React(id, n, st, add, out, ints){
  if (!m2Busy(n)) return false;
  if (out.m2) return true;
  /* the polite words alone (a greeting, scusi): the brain's own answer */
  const R = m2Read(ints);
  const business = R.where.length || R.have.length || R.bare.length || R.qWhere || R.qHave || R.head || R.sth || R.howMuch || R.give || R.pay !== null || R.payBare || R.other.length || R.yes || R.no;
  if (!business && !R.thanks && !R.bye && !R.repeat){
    if (R.greet){ out.m2 = true; out.asked = true; add(n.greet.it + '!', n.greet.en + '!'); }
    return !!R.greet;
  }
  out.m2 = true; out.asked = true;
  if (!schedaDone(M2.id)){ add('Mi dica.', 'How can I help?'); out.m2fb = 'scheda'; return true; }
  const r = m2Rec(), fb = h => { if (!out.m2fb) out.m2fb = h; };
  if (R.repeat && st.m2last){ add('Sì, certo!', 'Yes, of course!'); add(st.m2last.it, st.m2last.en, st.m2last.listen ? { listen:true, rate:0.68 } : undefined); if (st.m2last.listen) out.m2pad = true; return true; }
  if (R.repeat){ add('Sì? Mi dica.', 'Yes? How can I help?'); return true; }
  const said = [];
  const say = (it, en, o) => { add(it, en, o); said.push({ it, en, listen:!!(o && o.listen) }); };
  /* where things are / whether they have them */
  const asked = [...new Set([...R.where, ...R.have])];
  asked.forEach(k => {
    r.asked[k] = true;
    if (k === 'aspirina'){ say("L'aspirina? È qui, dietro il banco. Le fa male la testa?", "Aspirin? It's here, behind the counter. Have you got a headache?"); st.m2askHead = true; return; }
    const have = R.have.includes(k) && !R.where.includes(k);
    if (have) say(`Sì, certo! ${m2Place(k).replace(/^[^?]+\? /, '')}`, `Yes, of course! ${m2PlaceEn(k).replace(/^[^?]+\? /, '')}`);
    else say(m2Place(k), m2PlaceEn(k));
    if (m2Has(k)) fb(`You have that one already: it's in your bag.`);
    out.m2told = true;
  });
  R.bad.forEach(b => { r.mistakes.agree++; const d = M2_ITEMS[b.id]; fb(b.kind === 'where' ? `She understood. But <b>${esc(d.it)}</b> is plural: <b>dove sono</b>, not dov'è.` : `She understood. But <b>${esc(d.it)}</b> is one thing: <b>dov'è</b>, not dove sono.`); });
  if (R.bare.length && !asked.length){
    R.bare.forEach(k => { r.asked[k] = true; if (k === 'aspirina') say("L'aspirina? È qui, dietro il banco.", "Aspirin? It's here, behind the counter."); else say(m2Place(k), m2PlaceEn(k)); });
    fb('She understood! Next time ask a whole question, politely: where it is, or whether they have it.');
  }
  if ((R.qWhere || R.qHave) && !asked.length && !R.bare.length && !R.head && !R.sth){ say(R.qWhere ? "Dov'è… cosa?" : 'Avete… cosa?', R.qWhere ? 'Where is… what?' : 'Do we have… what?'); fb('Say what you are looking for: the things on your list.'); }
  /* a headache: an aspirin (optional) */
  if (R.head || (R.sth && st.m2askHead) || (R.yes && st.m2askHead && !R.howMuch)){
    st.m2askHead = false;
    if (r.aspirina) say("Ha già l'aspirina, eh!", 'You have the aspirin already!');
    else { r.aspirina = true; say("Le fa male la testa? Mi dispiace! Ecco un'aspirina. Prenda una compressa con un po' d'acqua.", "You have a headache? I'm sorry! Here's some aspirin. Take one tablet with a little water."); out.m2asp = true; }
  } else if (R.sth){ say('Qualcosa? Per che cosa?', 'Something? For what?'); fb('Something for what? Say what hurts.'); }
  else if (R.no && st.m2askHead){ st.m2askHead = false; say('Va bene.', 'All right.'); }
  /* paying */
  if (R.howMuch || R.give || R.pay !== null || R.payBare){
    const left = m2Missing();
    if (left.length && !r.noted){ say(R.howMuch ? 'Quant\'è? Ha trovato tutto?' : 'Ha trovato tutto?', R.howMuch ? 'How much? Have you found everything?' : 'Have you found everything?'); fb(`Your list isn't done yet: ${left.map(k => M2_ITEMS[k].en).join(', ')}.`); }
    else if (!r.noted || R.howMuch && !R.pay){ const p = m2PriceLine(); say(p.it, p.en, { listen:!r.noted }); if (!r.noted) out.m2pad = true; else fb(`Pay her: € ${m2Total()}, as in your notepad.`); }
    else if (R.pay === null){ say('Ecco… quanto?', "Here's… how much?"); fb('Say how much you are giving her: a number of euros.'); }
    else if (R.pay < m2Total()){ r.mistakes.pay++; say(`${cap(numIt(R.pay))} euro? Sono ${numIt(m2Total())} euro!`, `${cap(NUM_EN[R.pay] || String(R.pay))} euros? It's ${NUM_EN[m2Total()]} euros!`); fb(`That's less than the € ${m2Total()} in your notepad.`); }
    else {
      r.paid = true; r.given = R.pay; const c = R.pay - m2Total();
      if (c > 0) say(`Grazie. Ecco il resto: ${c === 1 ? 'un' : numIt(c)} euro.`, `Thank you. Here's your change: ${NUM_EN[c]} ${c === 1 ? 'euro' : 'euros'}.`); else say('Grazie, giusto così.', "Thank you, that's exactly right.");
      say(daytime() === 'night' ? 'Buon viaggio! Buonasera!' : 'Buon viaggio! Arrivederci!', 'Have a good trip! Goodbye!');
      out.m2done = true;
    }
  }
  /* thanks / goodbye */
  if ((R.thanks || R.bye) && !said.length){
    if (r.paid || questState(M2.id) === 'done'){ say('Prego! Arrivederci!', "You're welcome! Goodbye!"); out.end = true; }
    else if (R.bye){ say('Arrivederci!', 'Goodbye!'); out.end = true; }
    else say('Prego!', "You're welcome!");
  }
  if (!said.length && !out.end){ say('Mi dica.', 'How can I help?'); fb('Ask her where the things on your list are, or whether they have them.'); }
  if (said.length) st.m2last = said[said.length - 1];
  save();
  return true;
}
const m2PriceLine = () => { const r = m2Rec(), t = m2Total();
  return { it:`Allora: la crema solare, i cerotti, il dentifricio${r.aspirina ? " e l'aspirina" : ''}… Sono ${numIt(t)} euro.`, en:`So: the sun cream, the plasters, the toothpaste${r.aspirina ? ' and the aspirin' : ''}… That's ${NUM_EN[t]} euros.` }; };
function m2After(n, out, words){
  if (!m2Busy(n) && !out.m2done) return false;
  if (!out.m2) return false;
  if (out.m2fb === 'scheda'){ showHint('First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).'); return true; }
  if (out.m2done){ enqueue(() => { questDone(M2.id); renderHUD(); }); convo.keepHint = true; showHint('Done! Everything for Venice, and a stamp in your passport.', 'Fatto!'); enqueue(() => { if (convo) endConvo(); }); return true; }
  if (out.m2pad){ enqueue(() => { hintEl.hidden = true; }); m2AskPad(n); return true; }
  if (out.end) return false;
  const tip = m2FormalTip(words);
  if (tip){ showHint(tip, 'Consiglio'); return true; }
  if (out.m2asp){ showHint('An aspirin, on the bill too. Now the rest of your list.', 'Fatto!'); return true; }
  if (out.m2fb){ showHint(hintAfter(stepTries(convo.st, 'm2-' + (questCurStep(M2.id) || {}).id), out.m2fb, m2Strong()), 'Consiglio'); return true; }
  if (out.m2told){ const left = m2Missing().filter(k => !m2Rec().asked[k]);
    showHint(left.length ? `She told you where to look. Ask about the rest of your list too (${left.map(k => M2_ITEMS[k].en).join(', ')}), or say goodbye and go and look: a shelf, <kbd>E</kbd>.`
      : 'She told you where everything is. Say goodbye, then go and look: walk up to a shelf and press <kbd>E</kbd>.', 'Fatto!'); return true; }
  showHint(contextHint(false));
  return true;
}
function m2FormalTip(words){
  if (convo.tips.formal || !words) return null;
  const fix = [['ciao', '<b>buongiorno</b>, not ciao'], ['stai', '<b>come sta</b>, not come stai'], ['scusa', '<b>scusi</b>, not scusa'], ['puoi', '<b>può</b>, not puoi']].filter(([w]) => words.includes(w)).map(f => f[1]);
  if (!fix.length) return null;
  convo.tips.formal = true;
  return `She's a stranger at work: use the polite forms. ${fix.join('; ')}.`;
}
function m2AskPad(n){
  const r = m2Rec(), st = convo.st;
  askNumber({ title:'Your notepad', label:'la farmacia', tip:'How much did she say? Write it in digits.',
    onAnswer(x){
      if (!convo || convo.npc !== n) return true;
      if (x === m2Total()){
        revealListen({ all:true }); r.noted = true; st.m2wrong = 0; save(); renderHUD();
        sysLine(`Your notepad: <b>la farmacia · € ${x}</b>`);
        showHint('Written down! Now pay her.', 'Fatto!');
        return true;
      }
      st.m2wrong = (st.m2wrong || 0) + 1; r.mistakes.pad++; save();
      sysLine(`You write <b>€ ${x}</b>. Hmm… is that what she said?`);
      if (st.m2wrong === 1){ showHint('Not sure? Ask her, politely, to say it again.'); return true; }
      if (st.m2wrong === 2){ showHint('Still not it. Press <b>🔊 Ascolta di nuovo</b> on her line above to hear it again, slowly.'); return false; }
      revealListen({ all:true }); showHint('Read the total above, then write it in digits.');
      return false;
    } });
}
const m2Strong = () => {
  const s = questCurStep(M2.id); if (!s) return null;
  if (s.id === 'find') return 'Ask her: <b>Dov\'è</b> … ? / <b>Dove sono</b> … ? / <b>Avete</b> … ? and the thing on your list.';
  return m2Rec().noted ? 'Pay: <b>ecco</b> … <b>euro</b>.' : 'Ask the price: <b>Quant\'è?</b>';
};
function m2Hint(n, st){
  if (!m2Busy(n)) return null;
  if (!schedaDone(M2.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
  const r = m2Rec(), s = questCurStep(M2.id) || {};
  if (s.id === 'find'){
    const left = m2Missing(), unasked = left.filter(k => !r.asked[k]);
    if (unasked.length) return { h:`Ask the pharmacist where the things on your list are, or whether they have them. Still to find: ${left.map(k => M2_ITEMS[k].en).join(', ')}. She's at work: polite.`, strong:m2Strong(), step:'m2-find' };
    return { h:'She told you where everything is. Say goodbye, then look at the shelves she described (walk up to one and press <kbd>E</kbd>).', step:'m2-look' };
  }
  if (!r.noted) return { h:'Everything is in your bag. Ask how much it is.', strong:m2Strong(), step:'m2-price' };
  return { h:`Pay her: € ${m2Total()}, as in your notepad.`, strong:m2Strong(), step:'m2-pay' };
}
