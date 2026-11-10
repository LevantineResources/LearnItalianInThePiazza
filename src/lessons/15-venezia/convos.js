/* Lesson 15 · Venezia: the conversations. Margaret (English, her own conversation); the information desk ('ask': the barrier,
   'dir': the way, properly), the ACTV booth ('ticket': two tickets and the price on the notepad, the next boat and its time on the
   notepad, the dog and Margaret's question), the station bar ('bar': which cornetti, the order for both, the price), il signor Bepi
   ('bepi': a long conversation in stages, S.l15.bepi.stage: pet → intro → train → liked → day1 → day2 → compare → family →
   compliment → bye).
   Each is a tile conversation set up by our talk hook (l15Open): our bank hook gives its tiles; our react hook reads the whole turn
   once, at its first intent, from the tiles used (l15Keys: their keys; the Frasi fatte by theirs), so a greeting in the same turn
   as a question counts, and the reply follows what was said; afterTurn plays what comes after the lines (Margaret, the notepad, a
   pick for Margaret, the step moving on) and the hint (English: what is needed; the key words from the third failed try). */
const L15_STAFF = ['infopoint', 'baristaSL', 'actv'];
const L15_TICKETS = { id:'l15-biglietti', label_it:'i biglietti', label_en:'two vaporetto tickets (75 minutes)', icon:'🎫' };
const L15_PRICES = { caffè:1, cappuccino:2, tè:2 }, L15_CORNETTO = 2;          // the station bar (whole euros: the notepad)
const L15_ITEMS = { 'un caffè':{ d:'caffè' }, 'un cappuccino':{ d:'cappuccino' }, 'un tè':{ d:'tè' }, 'un cornetto':{ c:1 }, 'due cornetti':{ c:2 } };
const L15_FILL = { 'vuoto':'vuoto', 'vuoti':'vuoto', 'alla crema':'crema', 'alla marmellata':'marmellata', 'al cioccolato':'cioccolato' };
const L15_FILL_IT = { vuoto:['vuoto', 'vuoti'], crema:['alla crema', 'alla crema'], marmellata:['alla marmellata', 'alla marmellata'], cioccolato:['al cioccolato', 'al cioccolato'] };
const L15_FILL_EN = { vuoto:'plain', crema:'custard', marmellata:'jam', cioccolato:'chocolate' };
const L15_DAY_PP = ['visto', 'preso', 'fatto', 'mangiato', 'comprato', 'assaggiato', 'aiutato', 'acceso', 'portato', 'ballato', 'bevuto'];
const L15_CHAPEL_REPLY = { it:'Bellissima, vero? Giotto! Io la conosco bene.', en:"Beautiful, isn't it? Giotto! I know it well." };

/* ---------- tiles ---------- */
/* our tile, for the bank: one token of its own (content.js), shown with its label's capitals; a raw tile is a plain phrase tile */
function l15PT(t){
  if (t.tokens) return { ...t, gloss:t.gloss || t.en };
  if (t.raw) return phraseTile(t);
  let lab = fill(t.label).replace(/[?!.]+$/, '');
  if (!t.keep) lab = lab.charAt(0).toLowerCase() + lab.slice(1);
  return { key:t.key, label:fill(t.label), gloss:fill(t.en), tokens:[{ w:l15W(t), label:lab }] };
}
/* Bepi's "Padova" question: Lesson 13's words (Ho + the participles + the day's things + the places), as our tiles */
const l15DayT = { ho:() => l15T('d:ho', 'Ho', 'I have (+ a participle: I did …)', { words:'ho', cl:true }),
  pp:p => l15T(p.key, p.label, p.en), obj:d => l15T('obj:' + d.key, d.label, d.en), loc:k => l15T('loc:' + k, L13_LOC[k][0], L13_LOC[k][1]) };
function l15DayTiles(){
  return [l15DayT.ho(), ...L13_PP.filter(p => L15_DAY_PP.includes(p.key.slice(3))).map(l15DayT.pp), ...l13DayItems().map(l15DayT.obj), ...l13Locs().map(l15DayT.loc)];
}
/* every one of them (for the parser) */
let L15_DAY_ALL = null;
const l15DayAll = () => L15_DAY_ALL || (L15_DAY_ALL = [l15DayT.ho(), ...L13_PP.map(l15DayT.pp), ...l13AllItems().map(l15DayT.obj), ...Object.keys(L13_LOC).map(l15DayT.loc)]);
let L15_PHRASES = null;
function l15Phrases(){
  if (L15_PHRASES) return L15_PHRASES;
  const P = [], seen = new Set();
  [...L15_BANK, ...l15DayAll()].forEach(t => { const w = l15W(t); if (w && !seen.has(w)){ seen.add(w); P.push(['l15:' + t.key.slice(2), w]); } });
  P.push(['l15:boat', '@15:boat']);
  /* "No, ma ho mangiato un gelato." · "Sì, ho visto il tramonto." · "Sì, mi è piaciuto molto!" · "È inglese e non parla italiano." */
  const ho = l15W(l15DayT.ho()), w = k => l15W({ key:'v:' + k });
  CLAUSE.add(ho);
  ['ma', 'e', 'poi', 'sì', 'no', 'quindi'].forEach(x => JOIN.add(x + ' ' + ho));
  ['abbiamo preso', 'mi è piaciuto molto', 'sto imparando'].forEach(k => { JOIN.add('sì ' + w(k)); });
  EXCL.add('sì ' + w('mi è piaciuto molto'));
  JOIN.add('e ' + w('non parla italiano'));
  return L15_PHRASES = P;
}
/* the keys of the tiles used this turn ('v:' dropped; the Frasi fatte by their own keys; a name tile: 'name') */
const l15Keys = () => (convo.lastUsed || []).map(t => t.key ? t.key.replace(/^v:/, '') : t.name ? 'name' : t.w);
/* the bank */
function l15Bank(npc, groups){
  if (!l15Live() || !convo || !convo.l15 || convo.npc !== npc) return null;
  const C = convo.l15, T = L15_TILES, g = (label, tiles) => groups.push({ label, tiles:tiles.map(l15PT) });
  if (C.kind === 'ask'){ if (S.l15.prompted) groups.push({ label:'San Marco?', tiles:[L15_BOAT_TILE()] }); g('Cortesia', T.cortesia); }
  else if (C.kind === 'dir'){ g('La strada', T.strada); g('Cortesia', T.cortesia); }
  else if (C.kind === 'ticket'){ g('Biglietti', T.biglietti); g('Il cane', T.cane); g('Cortesia', T.cortesia); }
  else if (C.kind === 'bar'){ g('Al bar', T.bar); g('Cortesia', T.cortesia); }
  else if (C.kind === 'bepi'){
    const st = S.l15.bepi.stage;
    if (st === 'pet') g('Bepi', [T.noi[0]]);
    else if (st === 'intro') g('Chi siete', T.noi);
    else if (st === 'train' || st === 'liked') g('Il viaggio', T.viaggio);
    else if (st === 'day1' || st === 'day2') g('A Padova', l15DayTiles());
    else if (st === 'compare') g('Venezia o Padova?', T.confronto);
    else if (st === 'family') g('Per Margaret', T.biscuit);
    else if (st === 'compliment') g('Grazie', T.saluti);
    g('Cortesia', T.cortesia);
  }
  return groups;
}

/* ---------- opening a conversation of ours ---------- */
function l15Open(kind, opening, o = {}){
  convo.l15 = { kind, greeted:false, hello:false, fails:0, nudged:{}, last:null, ...o };
  convo.companion = NPC.margaret;                            // (Margaret's lines and picks sit on your side: translatePrompt, companionLine)
  convo.words = []; renderBank(); renderSentence(); builder.hidden = false;
  if (opening){ npcLine(fill(opening.it), fill(opening.en)); convo.l15.last = [opening]; }
  return true;
}
const l15Mg = t => npcLine(fill(t), null, { english:true, companion:true, speaker:NPC.margaret });
function l15Talk(npc){
  if (!l15Live()) return false;
  const L = S.l15, t = S.tut, id = npc.id, D = L15_LINES;
  /* the staff go by their job (the Lesson 10 cashier, the Lesson 12 clerk): the role label, never "???" */
  if (L15_STAFF.includes(id)){ convo.known = true; $('#dlgWho').innerHTML = `<b>${esc(npc.name)}</b> <span class="where">· ${esc(npc.place)}</span>`; }
  const cut = () => { convo.mode = 'cutscene'; convo.known = convo.known || !!S.known[id]; };
  const leave = (extra = []) => showChoices([...extra, { label:'Leave', primary:!extra.length, fn:closeDialog }]);
  const say = l => npcLine(fill(l.it), fill(l.en));
  if (id === 'margaret') return l15Margaret(npc, cut, leave);
  if (id === 'infopoint'){
    if (t === 'l15-start'){ cut(); say({ it:'Buongiorno!', en:'Good morning!' }); sysLine('Margaret is still on the platform: talk to her first.'); leave(); return true; }
    if (t === 'l15-ask' && !L.barrier) return l15Open('ask', L.prompted ? D.desk.revisit : D.desk.opening);
    if (!l15At('l15-directions')){
      cut(); say({ it:'Il vaporetto per San Marco? Alla fermata Ferrovia, qui davanti.', en:'The vaporetto to San Marco? At the Ferrovia stop, right out in front.' });
      sysLine('A vaporetto…? Read <b>Lezione 15 · Venezia</b> in your handbook, learn its words and do the practice.');
      leave([{ label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(15); } }]); return true;
    }
    return l15Open('dir', L.dirOK ? D.desk.revisit : D.desk.opening);
  }
  if (id === 'actv'){
    if (!l15At('l15-ticket')){ cut(); say(D.actv.opening); leave(); return true; }
    const r = l15Open('ticket', L.tickets || L.timeNoted || L.dogOK ? D.actv.revisit : D.actv.opening);
    if (!L.mg.ticketIn){ L.mg.ticketIn = true; save(); l15Mg(L15_MARGARET.ticketIn); }
    return r;
  }
  if (id === 'baristaSL'){
    if (!l15At('l15-breakfast')){ cut(); say({ it:'Buongiorno! Un caffè?', en:'Good morning! A coffee?' }); l15Mg('Breakfast later, dear. First, how do we get to San Marco?'); leave(); return true; }
    if (L.barDone){ cut(); say({ it:'Buona giornata! Buon viaggio!', en:'Have a nice day! Have a good trip!' }); leave(); return true; }
    const r = l15Open('bar', L.ordered ? D.bar.revisit : D.bar.opening);
    if (!L.kindsOK) l15Mg(L15_MARGARET.barIn);
    return r;
  }
  if (id === 'bepi'){
    if (L.bepiDone || S.tut !== 'l15-bepi'){ cut(); say({ it:'Buon viaggio! Ciao, Biscuit!', en:'Have a good trip! Bye, Biscuit!' }); leave(); return true; }
    convo.known = !!S.known.bepi;
    const r = l15Open('bepi', l15BepiQ());
    if (L.bepi.stage === 'family') l15Mg(L15_MARGARET.bepiFamily);
    return r;
  }
  return false;
}
/* Margaret's own conversation (English): the start; then a word about what comes next */
function l15Margaret(npc, cut, leave){
  const L = S.l15, t = S.tut;
  cut();
  const say = s => npcLine(fill(s), null, { english:true });
  if (t === 'l15-start' && !L.met){
    L15_MARGARET.start.forEach(say);
    showChoices(L15_MARGARET.startChoices.map((c, i) => ({ label:`“${c.label}”`, primary:i === 0, cls:'english', fn:() => {
      choices.hidden = true; meLine(c.label, { english:true });
      say(L15_MARGARET.startAfter);
      enqueue(() => {
        L.met = true; L.follow = true; S.met.margaret = S.known.margaret = true; NPC.margaret.seated = false; save();
        setTut('l15-ask'); l15Clock(8 * 60 + 42);
        if (convo) convo.done = true;
      });
      leave();
    } })));
    return true;
  }
  const M = L15_MARGARET;
  say({ 'l15-ask':M.deskIn, 'l15-handbook':'A vaporetto… Look it up in that book of yours, dear.', 'l15-vocab':'A vaporetto… Look it up in that book of yours, dear.',
    'l15-practice':'Nearly there with the book? Biscuit is getting impatient.', 'l15-directions':'Back to the information desk, dear: ask him properly this time.',
    'l15-ticket':L.dirOK ? 'The tickets, dear! And Biscuit: does he need one?' : M.dirWhich, 'l15-breakfast':M.tenPast,
    'l15-bepi':L.bepiCome ? 'What a charming gentleman. Talk to him, dear!' : M.bench, 'l15-board':M.board }[t] || "Oh, isn't it lovely?");
  leave();
  return true;
}

/* ---------- a turn ---------- */
const L15_REP = ['ancora una volta', 'può ripetere'];
const L15_FILLER = ['e', 'poi', 'ma', 'quindi', 'per favore', 'scusi', 'buongiorno'];
function l15React(id, n, st, add, out){
  if (!l15Live() || !convo || !convo.l15 || convo.npc !== n) return false;
  if (out.l15) return true;
  const C = convo.l15, K = l15Keys();
  /* Ancora una volta, per favore / Può ripetere? on their own: the last lines again, slowly */
  if (K.some(k => L15_REP.includes(k)) && K.every(k => L15_REP.includes(k) || L15_FILLER.includes(k))){
    const last = C.last || (convo.lastNpcText ? [convo.lastNpcText] : []);
    add('Sì, certo!', 'Yes, of course!', { rate:0.88 });
    last.forEach(l => add(fill(l.it), fill(l.en), l.listen ? { listen:true, rate:0.68 } : { rate:0.7 }));
    out.asked = true; out.l15 = { lines:[], after:[], repeat:true, C };
    return true;
  }
  const R = l15Turn(C, n, K);
  /* a greeting back and the answer are one reply ("Buongiorno! Abbiamo cornetti vuoti, …"), unless the answer is a listening line */
  const shown = R.lines.reduce((a, l) => { const p = a[a.length - 1]; if (p && p.hello && !l.listen){ a[a.length - 1] = { ...l, it:p.it + ' ' + l.it, en:p.en + ' ' + l.en }; } else a.push(l); return a; }, []);
  shown.forEach(l => add(l.it, l.en, l.listen ? { listen:true, rate:l.rate || 0.9 } : { rate:l.rate || 0.88 }));
  if (R.lines.length) C.last = R.lines.filter(l => !l.hello);
  out.asked = true; out.l15 = R;
  return true;
}
/* what the person says back, and what it changes */
function l15Turn(C, n, K){
  const L = S.l15, R = { lines:[], after:[], fb:null, end:false, C, K };
  const has = k => K.includes(k), any = (...ks) => ks.some(has);
  const greet = any('buongiorno', 'ciao');
  const fix = [['ciao', '<b>buongiorno</b> (or <b>arrivederci</b>), not ciao'], ['come stai', '<b>come sta</b>, not come stai'], ['e tu', '<b>E Lei?</b>, not e tu']].filter(([w]) => has(w)).map(f => f[1]);
  if (fix.length) R.fb = `${n.id === 'bepi' ? 'Il signor Bepi' : n.pron[0]} ${L15_HINTS.formal} ${fix.join('; ')}.`;
  const say = (l, o) => R.lines.push({ it:fill(l.it), en:fill(l.en), ...(o || {}) });
  const hello = () => { if (greet && !C.greeted && K.some(k => !['buongiorno', 'ciao'].includes(k))) R.lines.push({ it:'Buongiorno!', en:'Good morning!', hello:true }); if (greet) C.greeted = true; };
  const thanks = any('grazie', 'grazie mille'), bye = has('arrivederci') || (has('ciao') && K.length === 1);
  const D = L15_LINES;

  if (C.kind === 'ask'){
    if (has('boat')){ hello(); say(D.desk.boat); R.barrier = true; return R; }
    let said = false;
    if (has('mi chiamo')){ hello(); say(C.intro ? { it:'Sì, {Me}! Mi dica.', en:'Yes, {Me}! How can I help?' } : D.desk.piacere); C.intro = true; said = true; }
    if (any('come sta', 'come stai')){ if (!said) hello(); say(D.desk.how); said = true; }
    if (!said && greet && K.every(k => ['buongiorno', 'ciao', 'scusi', 'per favore'].includes(k))){ say(C.hello ? D.desk.revisit : D.desk.opening); said = true; }
    if (bye){ say({ it:'Prego! Arrivederci!', en:"You're welcome! Goodbye!" }); R.end = true; R.leftEarly = true; said = true; }
    else if (thanks){ say(said ? { it:'Prego!', en:"You're welcome!" } : { it:'Prego! Mi dica.', en:"You're welcome! How can I help?" }); said = true; }
    if (!said && !l15Small(n, C, K, say)) say(D.desk.huh);
    if (greet) C.hello = true;
    return R;
  }

  if (C.kind === 'dir'){
    const place = has('per san marco');
    const asks = (has("dov'è") && any('la fermata', 'del vaporetto', 'il vaporetto')) || (any('il vaporetto', 'la fermata') && place);
    let said = false;
    if (asks || (C.perDove && place)){
      hello();
      if (place){ D.desk.dir.forEach(l => say(l)); R.dir = true; C.dirGiven = true; }
      else { say(D.desk.perDove); C.perDove = true; }
      said = true;
    } else if (has("dov'è")){ hello(); say({ it:"Dov'è… cosa?", en:'Where is… what?' }); said = true; }
    if (has('a destra')){ say(C.dirGiven ? D.desk.right : { it:'A destra? Cosa?', en:'To the right? What is?' }); said = true; }
    if (has('a sinistra')){ say(C.dirGiven ? D.desk.left : { it:'A sinistra? Cosa?', en:'To the left? What is?' }); said = true; }
    if (has('è lontano')){ say(C.dirGiven ? D.desk.far : { it:'Lontano? Cosa?', en:'Far? What is?' }); said = true; }
    if (thanks || bye){
      if (L.dirOK || C.dirGiven){ say(has('ciao') && !has('arrivederci') ? D.desk.ciao : D.desk.bye); R.end = true; }
      else say(D.desk.thanks);
      said = true;
    }
    if (!said && greet){ say(C.hello ? D.desk.revisit : D.desk.opening); said = true; }
    if (greet) C.hello = true;
    if (!said && !l15Small(n, C, K, say)) say(D.desk.huh);
    return R;
  }

  if (C.kind === 'ticket'){
    const A = D.actv; let said = false;
    hello();
    /* the tickets */
    const two = has('due') || (C.one && has('sì') && !has('no'));        // "Uno? E la signora?" → "Due" / "Sì"
    if (has('un biglietto')){ say(A.one); C.fails++; said = true; R.one = true; C.one = C.howMany = true; }
    else if (has('due') && has('biglietto') && !has('biglietti')){ say(A.plural); R.fb = L15_HINTS.plural; C.fails++; said = true; }
    else if (has('biglietti') && !has('due') && !C.howMany){ say(A.howMany); C.howMany = true; said = true; }
    else if (two && (has('biglietti') || C.howMany)){
      if (L.tickets) say({ it:'Ha già due biglietti, no?', en:'You already have two tickets, haven\'t you?' });
      else { say(has('per san marco') ? A.two : A.twoNoPlace); say(A.price, { listen:true, rate:0.95 }); L.tickets = true; R.pricePad = true; }
      said = true;
    }
    /* the price */
    if (any("quant'è", 'quanto costa')){
      if (!L.tickets) say(A.priceBefore);
      else if (!L.paid){ if (!R.pricePad){ say(A.price, { listen:true, rate:0.8 }); R.pricePad = true; } }
      else say({ it:'Diciannove euro: ha già pagato, grazie!', en:"Nineteen euros: you've already paid, thank you!" });
      said = true;
    }
    /* the next boat */
    if (has('a che ora parte') || (has('il prossimo vaporetto') && !has('due') && !has('un biglietto'))){
      if (!L.timeNoted){ say(A.time, { listen:true, rate:0.95 }); R.timePad = true; } else say(A.time);
      said = true;
    } else if (has('il vaporetto') && !said){ say({ it:'Il vaporetto per San Marco: linea 1 o linea 2. Dalla fermata B.', en:'The vaporetto to San Marco: line 1 or line 2. From stop B.' }); said = true; }
    /* the dog */
    if (any('e il cane', 'il cane paga')){ say(A.dog); if (!L.dogOK) R.dogQ = true; said = true; }
    /* thanks, goodbye */
    if (thanks || bye){
      if (L.paid && L.timeNoted && L.dogOK && !R.pricePad && !R.timePad && !R.dogQ){ if (thanks) say(A.thanks); say(A.bye); R.end = true; }
      else if (!said) say(A.thanks);
      said = true;
    }
    if (!said && !(!greet && l15Small(n, C, K, say))) say(greet ? (C.hello ? A.revisit : A.hello) : A.huh);
    if (greet) C.hello = true;
    return R;
  }

  if (C.kind === 'bar') return l15BarTurn(C, n, K, R, say, hello, has, any, greet, thanks, bye);

  if (C.kind === 'bepi') return l15BepiTurn(C, n, K, R, say, hello, has, any, greet, thanks, bye);
  return R;
}

/* small talk the turn's own logic didn't use (the Frasi fatte: Come sta?, E Lei?, Piacere, Grazie, Sì / No, the little words): a sensible
   answer instead of "Sorry?" (returns true when it said something) */
function l15Small(n, C, K, say){
  const has = k => K.includes(k), B = S.l15.bepi, bepi = n.id === 'bepi';
  if (has('come sta') || has('come stai')){ say(bepi ? { it:'Bene, grazie! Un po\' vecchio, ma bene!', en:"Fine, thanks! A bit old, but fine!" } : { it:'Bene, grazie!', en:'Fine, thanks!' }); return true; }
  if (has('e lei') || has('e tu')){
    const st = bepi ? B.stage : '';
    say(st === 'liked' || st === 'train' ? { it:'Io? Io prendo il vaporetto, non il treno! Ah ah!', en:"Me? I take the vaporetto, not the train! Ha ha!" }
      : st === 'day1' || st === 'day2' ? { it:'Io? Padova… la conosco poco. Io sono veneziano!', en:"Me? Padova… I hardly know it. I'm Venetian!" }
      : st === 'compare' ? { it:'Io? Venezia, sempre!', en:'Me? Venice, always!' } : { it:'Io? Bene, grazie!', en:'Me? Fine, thanks!' });
    return true;
  }
  if (has('piacere')){ say({ it:'Piacere!', en:'Nice to meet you!' }); return true; }
  if (has('mi chiamo')){ say({ it:'Sì, {Me}!', en:'Yes, {Me}!' }); return true; }
  if (has('grazie') || has('grazie mille')){ say({ it:'Prego!', en:"You're welcome!" }); return true; }
  if (K.length && K.every(k => ['sì', 'no', 'e', 'poi', 'ma', 'quindi', 'per favore', 'scusi'].includes(k))){ say(has('no') ? { it:'No?', en:'No?' } : { it:'Sì?', en:'Yes?' }); return true; }
  return false;
}

/* ---------- the station bar: two orders, each said back by the barista and confirmed ----------
   S.l15.bar = { mg:{ d, p, ok }, me:{ d, p, ok }, pend:[who…], loose, nudged } (who: 'mg' = Margaret, 'me' = the player).
   d: the drink ('caffè' | 'cappuccino' | 'tè'); p: the cornetto { c (1 | 2), f (the filling, or null: not said yet) }; ok: confirmed.
   pend: whose order she has just said back (asking "…?", or for the missing part: "E un cornetto?", "Che cornetto?", "E da bere?");
   loose: things said for nobody in particular while both orders were open ("Per chi? Per Lei o per la signora?").
   A turn is read into segments (l15BarRead), each for one person: per me / per lei, before or after its things, or nobody named
   (l15BarWho: the pending order if they fit it or correct it, else the other one, else she asks). A Sì confirms the pending order(s);
   a No with things corrects them (only the part said changes); the other person named while an order is pending and complete takes it
   as right. Margaret judges only her own order (l15MgWrong), and says "Perfect, dear!" when it is said back right. */
const l15BarFresh = () => ({ mg:{ d:null, p:null, ok:false }, me:{ d:null, p:null, ok:false }, pend:[], loose:null, nudged:false });
function l15Bar(){ const L = S.l15; if (!L.bar || !L.bar.mg || !L.bar.me) L.bar = l15BarFresh(); return L.bar; }
const L15_WHO = { mg:{ it:'la signora', en:'the lady' }, me:{ it:'Lei', en:'you' } };
const L15_DRINK_EN = { caffè:'an espresso', cappuccino:'a cappuccino', tè:'a tea' };
const l15Other = w => w === 'mg' ? 'me' : 'mg';
const l15Done = P => !!(P.d && P.p && P.p.f);
const l15Empty = P => !P.d && !P.p;
const l15PIt = p => (p.c === 2 ? 'due cornetti' : 'un cornetto') + (p.f ? ' ' + L15_FILL_IT[p.f][p.c === 2 ? 1 : 0] : '');
const l15PEn = p => (p.c === 2 ? 'two ' : 'a ') + (p.f ? L15_FILL_EN[p.f] + ' ' : '') + (p.c === 2 ? 'croissants' : 'croissant');
const l15OIt = P => [P.d && 'un ' + P.d, P.p && l15PIt(P.p)].filter(Boolean).join(' e ');
const l15OEn = P => [P.d && L15_DRINK_EN[P.d], P.p && l15PEn(P.p)].filter(Boolean).join(' and ');
const l15OCost = P => (P.d ? L15_PRICES[P.d] : 0) + (P.p ? L15_CORNETTO * P.p.c : 0);
/* Margaret's order, by her wish: her line about the first thing wrong, or null (nothing wrong, so far) */
function l15MgWrong(P){
  const want = S.l15.mgPick, M = L15_MARGARET;
  if (P.d && P.d !== 'caffè') return M.barDrink;
  if (P.p && P.p.f && P.p.f !== want) return M.barWrong[want];
  if (P.p && P.p.c === 2) return M.barTwo;
  return null;
}
/* the turn, read: segments { who, d, p:{ c, f }, f (a filling on its own), same (lo stesso), anche, items }, Sì / No, feedback */
function l15BarRead(K){
  const segs = []; let cur = null, fb = null;
  const seg = (who = null) => { cur = { who, d:null, p:null, f:null, same:false, anche:false, items:false }; segs.push(cur); return cur; };
  K.forEach(k => {
    if (k === 'per me' || k === 'per lei'){
      const w = k === 'per me' ? 'me' : 'mg';
      if (cur && !cur.who && (cur.items || cur.same || cur.anche)){ cur.who = w; if (cur.items || cur.same) cur = null; }   // "un caffè per lei"
      else if (cur && !cur.who && !cur.items) cur.who = w;
      else seg(w);                                                                                       // "per lei …, e per me …"
      return;
    }
    if (k === 'lo stesso' || k === 'anche'){ if (!cur || cur.items || (k === 'lo stesso' && cur.same)) seg(cur && !cur.items ? cur.who : null); cur[k === 'anche' ? 'anche' : 'same'] = true; return; }
    const it = L15_ITEMS[k];
    if (it){
      if (!cur || (it.d && cur.d) || (it.c && (cur.p || cur.f))) seg(cur && !cur.items ? cur.who : null);
      if (it.d) cur.d = it.d; else cur.p = { c:it.c, f:null };
      cur.items = true; return;
    }
    const F = L15_FILL[k];
    if (F){
      if (cur && cur.p && !cur.p.f){
        cur.p.f = F;
        if (k === 'vuoto' && cur.p.c === 2) fb = fb || '<b>Due cornetti</b>: more than one, so the plural: <b>vuoti</b>.';
        if (k === 'vuoti' && cur.p.c === 1) fb = fb || '<b>Un cornetto</b>: just one, so <b>vuoto</b>.';
      } else { if (!cur || cur.p || cur.f) seg(cur && !cur.items ? cur.who : null); cur.f = F; }
      cur.items = true;
    }
  });
  return { segs, yes:K.includes('sì') && !K.includes('no'), no:K.includes('no'), fb };
}
/* nobody named: whose are these things? (null: she has to ask) */
function l15BarWho(O, sg, rd, pend){
  const fits = w => { const P = O[w]; return (!sg.d || !P.d) && (!sg.p || !P.p) && (!sg.f || !P.p || !P.p.f); };
  if (sg.same || (sg.anche && !sg.items)){
    if (l15Empty(O.me) && !l15Empty(O.mg)) return 'me';
    if (l15Empty(O.mg) && !l15Empty(O.me)) return 'mg';
    return pend.length === 1 ? l15Other(pend[0]) : null;
  }
  const mgWrong = pend.includes('mg') && !!l15MgWrong(O.mg);
  if (pend.length){
    if (rd.no) return pend.length === 1 ? pend[0] : mgWrong ? 'mg' : 'me';           // a correction of what she said back
    const open = pend.filter(w => !O[w].ok && fits(w));
    if (open.length) return open[0];                                                 // the missing part ("E un cornetto?" → un cornetto vuoto)
    if (mgWrong) return 'mg';                                                        // a correction of what Margaret objected to
    if (pend.length === 1 && !O[l15Other(pend[0])].ok) return l15Other(pend[0]);    // that one is complete: these are the other one's
  }
  const open = ['mg', 'me'].filter(w => !O[w].ok);
  if (open.length === 1) return open[0];
  const begun = open.filter(w => !l15Empty(O[w]) && fits(w));
  return begun.length === 1 ? begun[0] : null;
}
function l15BarMerge(P, sg){
  if (sg.d) P.d = sg.d;
  if (sg.p) P.p = { ...sg.p };
  if (sg.f){ if (P.p && !sg.p) P.p.f = sg.f; else if (!P.p) P.p = { c:1, f:sg.f }; }
}
/* what she says back about one order: a question to confirm it, or the part still missing */
function l15BarEcho(w, P, again){
  const X = L15_WHO[w];
  if (l15Done(P)) return { it:`per ${X.it} ${l15OIt(P)}`, en:`for ${X.en} ${l15OEn(P)}`, q:true };
  if (l15Empty(P)) return { it:`Per ${X.it}? Mi dica!`, en:`For ${X.en}? Go ahead!` };
  const B = L15_LINES.bar;
  if (P.p && !P.p.f){ const W = again ? B.whichAgain : B.which; return P.d ? { it:`Per ${X.it} ${'un ' + P.d} e ${l15PIt(P.p)}… ${W.it}`, en:`For ${X.en} ${L15_DRINK_EN[P.d]} and a croissant… ${W.en}` } : { it:`Per ${X.it} ${l15PIt(P.p)}… ${W.it}`, en:`For ${X.en} a croissant… ${W.en}` }; }
  if (!P.p) return { it:`Per ${X.it} ${l15OIt(P)}. E un cornetto?`, en:`For ${X.en} ${l15OEn(P)}. And a croissant?` };
  return again ? { it:`Per ${X.it} ${l15OIt(P)}… ${B.drinkWhat.it}`, en:`For ${X.en} ${l15OEn(P)}… ${B.drinkWhat.en}` } : { it:`Per ${X.it} ${l15OIt(P)}. E da bere?`, en:`For ${X.en} ${l15OEn(P)}. And to drink?` };
}
/* the order part of a turn (once Margaret has chosen): R.lines (one bubble), R.mg (Margaret), R.ordered */
function l15BarOrder(C, O, rd, R, say){
  const L = S.l15, B = L15_LINES.bar, M = L15_MARGARET, ws = ['mg', 'me'];
  const before = { mg:JSON.stringify(O.mg), me:JSON.stringify(O.me) };
  const pend = O.pend.slice(), loose = O.loose, touched = [], mg = [], out = [];
  let yesOk = [], mgYesWrong = false, whose = null, sameWhat = false;
  const touch = w => { if (!touched.includes(w)) touched.push(w); };
  O.loose = null;
  /* Sì: the order she said back is right (Sì to "E un cornetto?": yes, one, which?) */
  if (rd.yes && !loose) pend.forEach(w => {
    const P = O[w];
    if (l15Done(P)){ if (w === 'mg' && l15MgWrong(P)) mgYesWrong = true; else if (!P.ok){ P.ok = true; yesOk.push(w); } }
    else { if (P.d && !P.p) P.p = { c:1, f:null }; touch(w); }
  });
  const mid = { mg:JSON.stringify(O.mg), me:JSON.stringify(O.me) };
  /* the things said, person by person */
  rd.segs.forEach(sg => {
    if (!sg.items && !sg.same && !sg.anche){                        // a person on their own: "per me" (the answer to "Per chi?"), "E per me."
      if (loose) l15BarMerge(O[sg.who], loose);
      touch(sg.who);
      return;
    }
    const w = sg.who || l15BarWho(O, sg, rd, pend);
    if (!w){ whose = sg; return; }
    if (sg.same || (sg.anche && !sg.items)){
      const src = O[l15Other(w)];
      if (l15Empty(src)){ sameWhat = true; return; }
      O[w].d = src.d; O[w].p = src.p ? { ...src.p } : null;
    }
    if (sg.items) l15BarMerge(O[w], sg);
    touch(w);
  });
  ws.forEach(w => { if (JSON.stringify(O[w]) !== mid[w]){ O[w].ok = false; yesOk = yesOk.filter(x => x !== w); } });
  /* a correction of one of two orders said back together: she says both back again */
  if (rd.no && rd.segs.length && touched.length) pend.forEach(w => { if (!O[w].ok && !l15Empty(O[w])) touch(w); });
  /* the other one named while this order was said back, complete (and right, for Margaret): she takes it as right */
  if (!rd.no) pend.forEach(w => { if (!touched.includes(w) && touched.length && l15Done(O[w]) && !(w === 'mg' && l15MgWrong(O[w]))) O[w].ok = true; });

  /* both confirmed: the order is complete */
  if (O.mg.ok && O.me.ok){
    const it = ws.map(w => `per ${L15_WHO[w].it} ${l15OIt(O[w])}`).join(', e '), en = ws.map(w => `for ${L15_WHO[w].en} ${l15OEn(O[w])}`).join(', and ');
    say({ it:`${yesOk.length ? 'Perfetto! ' : ''}Allora: ${it}. Ecco!`, en:`${yesOk.length ? 'Perfect! ' : ''}So: ${en}. Here you are!` });
    const list = P => [P.d && 'un ' + P.d, P.p && l15PIt(P.p)].filter(Boolean);
    L.ordered = true; L.order = { me:list(O.me), lei:list(O.mg), all:[...list(O.mg), ...list(O.me)], total:l15OCost(O.mg) + l15OCost(O.me) };
    O.pend = []; save(); R.ordered = true;
    return;
  }
  /* what she says back */
  if (mgYesWrong){ out.push(B.okWrong); mg.push(l15MgWrong(O.mg) + ' ' + M.barTell); }
  else if (yesOk.length) out.push(B.ok);
  /* Margaret's first, then yours: a complete order as a question ("Allora: per la signora …?"; both complete: one question), a part
     missing as its own question ("E un cornetto?"), one already confirmed and said again: "Sì, sì: …" */
  const ech = ws.filter(w => touched.includes(w)).map(w => O[w].ok ? { it:`Sì, sì: per ${L15_WHO[w].it} ${l15OIt(O[w])}.`, en:`Yes, yes: for ${L15_WHO[w].en} ${l15OEn(O[w])}.`, ok:true }
    : l15BarEcho(w, O[w], pend.includes(w) && JSON.stringify(O[w]) === before[w]));
  let newPend = touched.filter(w => !O[w].ok);
  if (ech.length > 1 && ech.every(e => e.q)) out.push({ it:`Allora: ${ech.map(e => e.it).join(', e ')}?`, en:`So: ${ech.map(e => e.en).join(', and ')}?` });
  else ech.forEach((e, i) => out.push(!e.q ? e : i && ech[i - 1].ok ? { it:`E ${e.it}, giusto?`, en:`And ${e.en}, right?` } : { it:`Allora: ${e.it}?`, en:`So: ${e.en}?` }));
  if (whose){
    const G = { ...whose, who:null }, P = { d:G.d, p:G.p || (G.f ? { c:1, f:G.f } : null) };
    out.push({ it:`${cap(l15OIt(P))}… ${B.whose.it}`, en:`${cap(l15OEn(P))}… ${B.whose.en}` });
    O.loose = { d:G.d, p:G.p, f:G.f };
  } else if (rd.yes && loose){ out.push({ it:`Sì… ma ${B.whose.it.toLowerCase()}`, en:`Yes… but ${B.whose.en.toLowerCase()}` }); O.loose = loose; }
  if (sameWhat) out.push(B.sameWhat);
  /* a No on its own: she said it back wrong (or you don't want the missing part) */
  if (rd.no && !rd.segs.length && !touched.length){
    pend.forEach(w => {
      const P = O[w], X = L15_WHO[w];
      if (l15Done(P) || l15Empty(P)) out.push({ it:`No? Scusi! Allora: cosa prende ${X.it}?`, en:`No? Sorry! So: what will ${w === 'me' ? 'you' : 'the lady'} have?` });
      else if (!P.p){ out.push(B.noCorn); mg.push(w === 'mg' ? `And my cornetto, dear? ${cap(L15_FILL_EN[L.mgPick])}, I said!` : M.barEat); }
      else if (!P.p.f) out.push(L15_LINES.bar.whichAgain);
      else { out.push(B.noDrink); mg.push(w === 'mg' ? M.barCoffee : M.barSip); }
    });
    newPend = pend;
    if (!pend.length) out.push({ it:'No? Allora… cosa prende?', en:'No? So… what will you have?' });
  }
  /* nothing said back this turn (a Sì): the next one */
  if (!touched.length && !whose && !(rd.no && !rd.segs.length) && !(rd.yes && loose) && !sameWhat){
    const nx = ws.find(w => !O[w].ok && !l15Empty(O[w])) || ws.find(w => !O[w].ok);
    if (!yesOk.length && !mgYesWrong && !rd.segs.length) out.push({ it:'Sì? Mi dica: cosa prende?', en:'Yes? Go ahead: what will you have?' });
    else if (!mgYesWrong && nx){
      const P = O[nx];
      if (l15Empty(P)) out.push({ it:`E per ${L15_WHO[nx].it}?`, en:`And for ${L15_WHO[nx].en}?` });
      else { const e = l15BarEcho(nx, P); out.push(e.q ? { it:`E ${e.it}, giusto?`, en:`And ${e.en}, right?` } : e); newPend = [nx]; }
      if (!l15Empty(P)) newPend = [nx];
    }
    if (mgYesWrong) newPend = ['mg'];
  } else if (touched.length && touched.every(w => O[w].ok)){
    /* only restated what was already right: on to the one still open */
    const nx = ws.find(w => !O[w].ok);
    if (nx){ const P = O[nx]; if (l15Empty(P)) out.push({ it:`E per ${L15_WHO[nx].it}?`, en:`And for ${L15_WHO[nx].en}?` }); else { const e = l15BarEcho(nx, P); out.push(e.q ? { it:`E ${e.it}, giusto?`, en:`And ${e.en}, right?` } : e); newPend = [nx]; } }
  }
  O.pend = newPend;
  if (out.length) say({ it:out.map(l => l.it).join(' '), en:out.map(l => l.en).join(' ') });
  /* Margaret: only about her own order, when it has just been said back */
  if (touched.includes('mg') && !O.mg.ok && !mgYesWrong){
    const wrong = l15MgWrong(O.mg);
    if (wrong) mg.push(wrong); else if (l15Done(O.mg) && JSON.stringify(O.mg) !== before.mg) mg.push(M.barPerfect);
  }
  if (O.mg.ok && l15Empty(O.me) && !O.nudged){ O.nudged = true; mg.push(M.barMine); }
  if (mg.length) R.mg = mg.join(' ');
  save();
}
function l15BarTurn(C, n, K, R, say, hello, has, any, greet, thanks, bye){
  const L = S.l15, B = L15_LINES.bar, O = l15Bar();
  let said = false;
  hello();
  if (has('che cornetti avete')){ say(B.kinds); if (!L.kindsOK) R.kindsQ = true; said = true; }
  const rd = l15BarRead(K);
  if (rd.fb) R.fb = rd.fb;
  if (rd.segs.length && !L.kindsOK){
    if (!R.kindsQ){ say({ it:'…', en:'(She waits, pen in hand.)' }); R.mg = "Hold on, dear: ask her what cornetti they have first! I'm fussy."; }
    said = true;
  } else if (L.ordered && rd.segs.length){ say(B.already); said = true; }
  else if (L.kindsOK && !L.ordered && !R.kindsQ && (rd.segs.length || rd.yes || rd.no)){ l15BarOrder(C, O, rd, R, say); said = true; }
  if (has("quant'è")){
    if (!L.ordered) say(B.notYet);
    else if (!L.barPaid){ say({ it:`Sono ${numIt(L.order.total)} euro.`, en:`That's ${L.order.total} euros.` }, { listen:true, rate:0.95 }); R.pricePad = true; }
    else say({ it:'Ha già pagato, grazie!', en:"You've already paid, thank you!" });
    said = true;
  }
  if (thanks || bye){
    if (L.barPaid && !R.pricePad){ say(B.thanks); R.end = true; }
    else if (bye && !said) say(L.ordered ? { it:'Ehm… deve ancora pagare!', en:'Er… you still have to pay!' } : B.leaving);
    else if (!said) say({ it:'Prego!', en:"You're welcome!" });
    said = true;
  }
  if (!said && !(!greet && l15Small(n, C, K, say))) say(greet ? (C.hello ? B.revisit : B.opening) : B.huh);
  if (greet) C.hello = true;
  return R;
}

/* ---------- il signor Bepi ---------- */
/* his question at each stage (also his opening when you talk to him again) */
function l15BepiQ(){
  const B = S.l15.bepi, D = L15_LINES.bepi;
  switch (B.stage){
    case 'pet': return D.arrive;
    case 'intro': return B.name ? { it:'E la signora?', en:'And the lady?' } : B.marg ? { it:'E Lei, come si chiama?', en:'And you, what is your name?' } : { it:'Allora? Io sono Bepi. E Lei?', en:"So? I'm Bepi. And you?" };
    case 'train': return D.train;
    case 'liked': return D.liked;
    case 'day1': return l15DayQ(B.qYes);
    case 'day2': return l15DayQ(B.qNo);
    case 'compare': return D.compare;
    case 'family': return { it:'Sì? La signora vuole dire qualcosa?', en:'Yes? The lady wants to say something?' };
    case 'compliment': return D.compliment;
    case 'bye': return D.horn;
    default: return { it:'Buon viaggio!', en:'Have a good trip!' };
  }
}
/* the Padova questions: from your stamps, as in Lesson 13 (a quest you did → "Sì, ho…"; one you didn't → "No, ma ho…"); with few
   quests done, random ones (and every quest's words are in the bank) */
/* Bepi's own words for them (Lesson 13's were Lina's, at night): his question, and what he says to your answer */
const L15_DAY_BEPI = {
  chapel:{ q:{ it:'Ha visto la Cappella degli Scrovegni? Giotto!', en:'Did you see the Scrovegni Chapel? Giotto!' }, reply:L15_CHAPEL_REPLY },
  bambina:{ reply:{ it:'Una bambina? Che gentile!', en:'A little girl? How kind!' } },
  qualcosa:{ reply:{ it:'Qualcosa? Cosa? Un mistero! Ah ah!', en:'Something? What? A mystery! Ha ha!' } },
  messaggio:{ reply:{ it:'Un messaggio? Come un postino! Ah ah!', en:'A message? Like a postman! Ha ha!' } },
  formaggio:{ q:{ it:'Ha comprato il formaggio al mercato?', en:'Did you buy cheese at the market?' }, reply:{ it:'Il formaggio! Buonissimo, vero?', en:"Cheese! Delicious, isn't it?" } },
  basilica:{ q:{ it:'Ha visto la basilica del Santo?', en:"Did you see Saint Anthony's basilica?" }, reply:{ it:'Il Santo! Bellissima. Ma aspetti di vedere San Marco!', en:'The Santo! Beautiful. But wait till you see San Marco!' } },
  candela:{ q:{ it:'Ha acceso una candela per il Santo?', en:'Did you light a candle for the Saint?' }, reply:{ it:'Una candela? Che bello. Anch\'io, quando vado a Padova!', en:'A candle? How lovely. Me too, when I go to Padova!' } },
  bambino:{ reply:{ it:'Un bambino? Che gentile!', en:'A little boy? How kind!' } },
  caffe:{ q:{ it:'Ha preso un caffè in piazza, a Padova?', en:'Did you have a coffee in the square, in Padova?' }, reply:{ it:'Il caffè! Senza caffè, niente Italia!', en:'Coffee! No coffee, no Italy!' } },
  foto:{ q:{ it:'Ha fatto delle foto?', en:'Did you take any photos?' }, reply:{ it:'Una foto? Che bello! E qui a Venezia… mille foto!', en:'A photo? How lovely! And here in Venice… a thousand photos!' } },
  gelato:{ q:{ it:'Ha assaggiato il gelato? A Padova è buonissimo!', en:'Did you try the ice cream? In Padova it is delicious!' }, reply:{ it:'Un gelato! Io adoro il pistacchio!', en:'An ice cream! I love pistachio!' } },
  aperitivo:{ q:{ it:'Ha preso un aperitivo? Uno spritz, come noi veneti?', en:'Did you have an aperitif? A spritz, like us people of the Veneto?' }, reply:{ it:'Uno spritz! Salute! Lo spritz è nato qui, sa?', en:'A spritz! Cheers! The spritz was born here, you know?' } },
  tramonto:{ q:{ it:'Ha visto il tramonto sul ponte?', en:'Did you see the sunset from the bridge?' }, reply:{ it:'Il tramonto! Che romantico!', en:'The sunset! How romantic!' } },
  piazza:{ q:{ it:'Ha sentito la musica in piazza, ieri sera?', en:'Did you hear the music in the square last night?' }, reply:{ it:'Ha ballato in piazza? Anch\'io, cinquant\'anni fa! Ah ah!', en:'You danced in the square? Me too, fifty years ago! Ha ha!' } },
  biglietto:{ reply:{ it:'Il biglietto per Venezia, certo!', en:'The ticket to Venice, of course!' } },
  treno:{ reply:{ it:'Il treno, sì: ed eccovi qui!', en:'The train, yes: and here you are!' } },
};
const l15DayQ = key => (L15_DAY_BEPI[key] || {}).q || (l13AnyItem(key) || {}).q || L15_DAY_BEPI.chapel.q;
const l15DayReply = key => (L15_DAY_BEPI[key] || {}).reply || (l13AnyItem(key) || {}).reply || { it:'Che bello!', en:'How lovely!' };
function l15PickDay(){
  const B = S.l15.bepi, asked = L13_ASK_ORDER.filter(k => l13AnyItem(k) && l13AnyItem(k).q);
  const done = new Set(l13DoneQuests()), did = asked.filter(k => done.has(l13AnyItem(k).quest)), not = asked.filter(k => !done.has(l13AnyItem(k).quest));
  if (l13Free()){ const sh = vcShuffle(asked.slice()); B.qYes = sh[0]; B.qNo = sh[1]; B.free = true; }
  else { B.qYes = did[0] || asked[0]; B.qNo = not.length ? not[Math.floor(Math.random() * not.length)] : 'chapel'; B.free = false; }
  save();
}
/* a sentence about your day this turn: Ho + a participle + a thing (+ a place) */
function l15DayClause(K){
  const pp = K.find(k => k.startsWith('pp:')), obj = K.find(k => k.startsWith('obj:'));
  if (!pp && !obj) return null;
  return { ho:K.includes('d:ho'), pp:pp && pp.slice(3), obj:obj && obj.slice(4) };
}
function l15BepiTurn(C, n, K, R, say, hello, has, any, greet, thanks, bye){
  const L = S.l15, B = L.bepi, D = L15_LINES.bepi, st = B.stage;
  const to = s => { B.stage = s; R.stage = s; save(); };
  /* a greeting on its own, mid-conversation: one back, and his question again */
  if (greet && K.every(k => ['buongiorno', 'ciao', 'scusi', 'per favore'].includes(k)) && st !== 'pet' && st !== 'bye'){ say({ it:'Buongiorno!', en:'Good morning!' }); say(l15BepiQ()); return R; }
  hello();
  const rec = () => { const s = l15TurnText(); if (s && !L.said.includes(s)) L.said.push(s); };
  if (st === 'pet'){
    if (any('sì certo', 'sì')){ say(D.yes); to('intro'); R.named = true; }
    else if (has('no')){ say(D.noPet); to('intro'); R.named = true; }
    else if (greet) say({ it:'Buongiorno! Che bel cagnolino… Posso?', en:'Good morning! What a lovely little dog… May I?' });
    else if (!l15Small(n, C, K, say)) say(D.huh);
    return R;
  }
  if (st === 'intro'){
    const name = has('mi chiamo'), marg = has('lei è margaret'), eng = any('è inglese', 'non parla italiano');
    if (name) B.name = true; if (marg) B.marg = true;
    if (B.name && B.marg){ say(D.both); if (eng) say(D.english); rec(); say(D.train); to('train'); }
    else if (name){ say(D.nameOnly); rec(); }
    else if (marg){ say(D.margOnly); if (eng) say(D.english); rec(); }
    else if (eng) say({ it:'Inglese? Chi? La signora?', en:'English? Who? The lady?' });
    else if (greet) say({ it:'Buongiorno! Allora, Lei come si chiama?', en:'Good morning! So, what is your name?' });
    else if (!l15Small(n, C, K, say)) say(D.huh);
    return R;
  }
  if (st === 'train'){
    if (has('abbiamo preso') && any('il treno di notte', 'da padova')){ say(D.trainYes); rec(); say(D.liked); to('liked'); }
    else if (has('abbiamo preso')){ say({ it:'Avete preso… cosa? Il treno?', en:'You took… what? The train?' }); C.fails++; }
    else if (has('sì') && !B.trainBare){ say(D.trainYesBare); B.trainBare = true; save(); }
    else if (any('sì', 'il treno di notte', 'da padova')){ say(D.trainYes); say(D.liked); to('liked'); }
    else if (has('no')){ say(D.trainNo); B.trainBare = true; save(); }
    else if (!l15Small(n, C, K, say)) say(D.huh);
    return R;
  }
  if (st === 'liked'){
    if (has('mi è piaciuto molto') || has('molto') || (B.likedBare && has('sì'))){ if (has('mi è piaciuto molto')) rec(); say(D.likedYes); l15PickDay(); say(l15DayQ(B.qYes)); to('day1'); }
    else if (has('sì') || has('molto')){ say(D.likedBare); B.likedBare = true; save(); }
    else if (has('no')){ say(D.likedNo); l15PickDay(); say(l15DayQ(B.qYes)); to('day1'); }
    else if (!l15Small(n, C, K, say)) say(D.huh);
    return R;
  }
  if (st === 'day1' || st === 'day2'){
    const key = st === 'day1' ? B.qYes : B.qNo, cl = l15DayClause(K);
    if (cl && !cl.ho) R.fb = 'The past needs two words: <b>ho</b> (avere), then the participle (Lezione 13).';
    if (cl && cl.ho && !cl.pp) R.fb = '<b>Ho</b>… and then? The participle: what you did (Lezione 13).';
    const next = () => { B.need = false; if (st === 'day1'){ say(l15DayQ(B.qNo)); to('day2'); } else { say(D.compare); to('compare'); } };
    const tell = () => { const r = cl.obj ? l15DayReply(cl.obj) : { it:'Ah sì?', en:'Oh yes?' }; say(r); rec(); };
    if (has('sì') && !has('no')){ say(l15DayReply(key)); if (cl && cl.obj && cl.obj !== key) tell(); else if (cl) rec(); next(); }
    else if (has('no')){ if (cl && cl.obj){ say({ it:'No? Peccato!', en:'No? Pity!' }); tell(); next(); } else { say(D.whatElse); B.need = true; save(); } }
    else if (cl && cl.obj){ tell(); next(); }
    else if (cl){ say(D.sayMore); B.need = true; save(); }
    else if (!l15Small(n, C, K, say)) say(D.huh);
    return R;
  }
  if (st === 'compare'){
    const adj = K.find(k => ['bella', 'bello', 'tranquilla', 'grande'].includes(k)), piu = has('più');
    /* no city named: he asked about Venice ("Sì, è più bella!"), unless it is "… di Venezia" */
    const subj = K.find(k => k === 'venezia' || k === 'padova') || (adj ? (has('di venezia') ? 'padova' : 'venezia') : null);
    if (adj === 'bello') R.fb = `<b>${subj === 'padova' ? 'Padova' : 'Venezia'}</b> is a city, and feminine: <b>bella</b>.`;
    const a = adj === 'bello' ? 'bella' : adj;
    let r = null;
    if (subj && a){
      if (subj === 'venezia') r = a === 'bella' ? (piu ? D.venBella : { it:'Bella? Bellissima!', en:'Beautiful? Very beautiful!' }) : a === 'grande' ? D.venGrande : { it:'Più tranquilla? Venezia? Di notte, forse! Ah ah!', en:'Quieter? Venice? At night, maybe! Ha ha!' };
      else r = a === 'tranquilla' ? D.padTranq : a === 'bella' ? D.padBella : { it:'Più grande, sì! Ma Venezia è più bella, eh!', en:'Bigger, yes! But Venice is more beautiful, eh!' };
      if (adj !== 'bello') rec();
    } else if (has('sì') && !a) r = D.sameYes;
    else if (has('no') && !a) r = D.sameNo;
    if (!r){ if (!l15Small(n, C, K, say)) say(D.huh); return R; }
    say(r);
    if (subj && a || has('sì') || has('no')){ to('family'); R.mgFamily = true; }
    return R;
  }
  if (st === 'family'){
    if (has('una famiglia') && any('ha trovato', 'biscuit')){ say(D.family); rec(); say(D.compliment); to('compliment'); }
    else if (has('ha trovato')) say({ it:'Ha trovato… cosa?', en:'Found… what?' });
    else if (has('biscuit')) say({ it:'Biscuit? Sì? Cosa ha fatto Biscuit?', en:'Biscuit? Yes? What did Biscuit do?' });
    else if (has('una famiglia')) say({ it:'Una famiglia? Chi?', en:'A family? Who?' });
    else if (!l15Small(n, C, K, say)) say(D.huh);
    return R;
  }
  if (st === 'compliment'){
    if (has('sto imparando') || (B.thanked && has('sì'))){ if (thanks) say({ it:'Prego!', en:"You're welcome!" }); say(D.learning); rec(); R.horn = true; to('bye'); }
    else if (thanks){ say(D.thanksOnly); B.thanked = true; save(); }
    else if (!l15Small(n, C, K, say)) say(D.huh);
    return R;
  }
  if (st === 'bye'){
    if (has('arrivederci') || thanks){ if (thanks && !has('arrivederci')) say({ it:'Prego, prego!', en:"You're welcome!" }); say(D.bye); R.end = true; to('done'); }
    else if (has('ciao')){ say(D.ciao); R.end = true; to('done'); }
    else say({ it:'Vada, vada! Il vaporetto parte!', en:'Go, go! The vaporetto is leaving!' });
    return R;
  }
  return R;
}
const l15TurnText = () => convo && convo.lastUsed ? formatSentence(convo.lastUsed.flatMap(t => t.tokens || [t])) : '';

/* ---------- after their lines ---------- */
function l15After(n, out){
  if (!l15Live() || !out.l15 || !convo || !convo.l15) return false;
  const R = out.l15, C = convo.l15, L = S.l15;
  if (R.repeat){ l15ShowHint(n, C, null); return true; }
  const chain = [];                                           // things to do one after another (a notepad, a pick…)
  const run = () => { const f = chain.shift(); if (f){ enqueue(() => { hintEl.hidden = true; }); f(run); } else l15Then(n, C, R); };

  if (C.kind === 'ask'){
    if (R.barrier) return l15BarrierEnd();
    if (R.leftEarly){ l15Mg("Wait, dear! We haven't asked about the boat!"); l15End(); return true; }
    if (!L.prompted && (C.hello || C.intro)){
      L.prompted = true; save();
      l15Mg(L15_MARGARET.deskIn);
      enqueue(() => { if (convo){ renderBank(); } });
      showHint(L15_HINTS.deskAsk.h, 'Suggerimento');
      return true;
    }
  }
  if (C.kind === 'dir' && R.dir && !L.dirOK){
    chain.push(next => l15Pick(L15_MARGARET.dirWhich, ['Out of the station, down the steps, then right: the stop is on the canal. Line 1 or 2.',
      'Out of the station, then left over the bridge, and take line 5.', 'Back to the platform, then straight on to the boats.'], () => {
      L.dirOK = true; save(); l15Mg(L15_MARGARET.dirOK);
      enqueue(() => { if (S.tut === 'l15-directions'){ setTut('l15-ticket'); l15Clock(8 * 60 + 48); } });
      next();
    }, 'Listen again (the speaker buttons on his lines), or ask him to say it again. <i>Destra</i> or <i>sinistra</i>?'));
  }
  if (C.kind === 'ticket'){
    if (R.one) l15Mg('Two, dear! One for you and one for me.');
    if (R.pricePad) chain.push(next => l15PricePad('due biglietti', 19, L15_LINES.actv.price, (ok) => {
      L.paid = true; bagAdd(L15_TICKETS); save();
      npcLine(fill(L15_LINES.actv.paid.it), fill(L15_LINES.actv.paid.en));
      sysLine('You pay with a twenty and put the two tickets in your bag (<b>Borsa</b>).');
      next();
    }, v => v === 9 || v === 950 || v === 10 ? 'That is the price of <i>one</i> ticket (the sign says € 9,50). He said the price for both.' : v === 90 ? 'Ninety? Listen again: <i>dici-</i> is ten and a bit (Lezione 7).' : null));
    if (R.timePad) chain.push(next => l15AskTime({ label:'il prossimo vaporetto', truth:{ h:9, m:10 }, line:L15_LINES.actv.time, notes:L.paid ? [{ label:'due biglietti', value:'€ 19' }] : [], onDone:() => { L.timeNoted = true; save(); next(); } }));
    if (R.dogQ) chain.push(next => l15Pick(L15_MARGARET.dogWhat, ["Biscuit travels free, but on a lead and with a muzzle, or carried if he's small.",
      'Dogs pay half price, and they have to stay outside on the deck.', "Dogs can't go on the boats: only guide dogs."], () => {
      L.dogOK = true; save(); l15Mg(L15_MARGARET.dogOK); next();
    }, 'Listen again: <i>non paga</i>, <i>il guinzaglio</i>, <i>la museruola</i>, <i>in braccio</i>. Your handbook (or the dictionary, <kbd>V</kbd>) has these words.'));
  }
  if (C.kind === 'bar'){
    if (R.mg) l15Mg(R.mg);
    if (R.kindsQ) chain.push(next => l15Pick(L15_MARGARET.barWhat, ['Plain ones, custard ones, jam ones and chocolate ones.', 'Ham ones, cheese ones, egg ones and tomato ones.',
      'Apple ones, cherry ones, honey ones and cream cheese ones.'], () => {
      L.kindsOK = true; save(); l15Mg(L15_MARGARET.barPick[L.mgPick]); next();
    }, 'Listen again: <i>vuoti</i>, <i>alla crema</i>, <i>alla marmellata</i>, <i>al cioccolato</i>. Lezione 15 has them (<i>At the bar</i>).'));
    if (R.ordered) l15Mg(L15_MARGARET.barHow);
    if (R.pricePad) chain.push(next => l15PricePad('la colazione', L.order.total, { it:`Sono ${numIt(L.order.total)} euro.` }, () => {
      L.barPaid = true; save();
      npcLine('Grazie!', 'Thank you!');
      sysLine('You pay. Breakfast at the counter, standing up, like the Venetians: the cornetti are still warm.');
      l15Clock(9 * 60);
      next();
    }, () => null));
  }
  if (C.kind === 'bepi'){
    if (R.named){ S.met.bepi = true; S.known.bepi = true; save(); enqueue(() => { if (convo){ convo.known = true; $('#dlgWho').innerHTML = '<b>Bepi</b> <span class="where">· La fondamenta, Ferrovia</span>'; } renderHUD(); }); }
    if (R.stage) enqueue(() => { if (convo){ convo.words = []; renderBank(); renderSentence(); } });
    if (R.mgFamily) l15Mg(L15_MARGARET.bepiFamily);
    if (R.horn) chain.push(next => {
      enqueue(() => { venHorn(); venBoatArrive().then(() => { L.boatIn = true; save(); renderHUD(); }); });
      sysLine('<i>Tuuu-tuuu!</i> A horn out on the canal: the vaporetto is coming in.');
      npcLine(fill(L15_LINES.bepi.horn.it), fill(L15_LINES.bepi.horn.en));
      enqueue(() => { if (convo) convo.l15.last = [L15_LINES.bepi.horn]; });
      next();
    });
  }
  run();
  return true;
}
/* Margaret asks what was said: an English pick (the first option is the right one; shown in a random order) */
function l15Pick(q, opts, onRight, wrong){
  const order = vcShuffle(opts.map((_, i) => i));
  translatePrompt(q, order.map(i => opts[i]), order.indexOf(0), () => setTimeout(onRight, 0), wrong);
}
/* when the chain is done: the step moving on, Margaret's nudges, the hint */
function l15Then(n, C, R){
  const L = S.l15;
  if (!convo || convo.npc !== n) return;
  if (C.kind === 'ticket' && L.paid && L.timeNoted && L.dogOK && !L.mg.tenPast){
    L.mg.tenPast = true; save();
    l15Mg(L15_MARGARET.tenPast);
    enqueue(() => { if (S.tut === 'l15-ticket'){ setTut('l15-breakfast'); l15Clock(8 * 60 + 52); } });
  } else if (C.kind === 'ticket' && !R.end){
    const miss = !L.paid ? null : !L.timeNoted ? 'time' : !L.dogOK ? 'dog' : null;
    if (miss && !C.nudged[miss]){ C.nudged[miss] = true; l15Mg(miss === 'time' ? L15_MARGARET.ticketTime : L15_MARGARET.ticketDog); }
  }
  if (R.end){ if (C.kind === 'bar'){ L.barDone = true; save(); } if (C.kind === 'bepi'){ L.bepiDone = true; save(); } l15End(R.fb); return; }
  l15ShowHint(n, C, R.fb);
}
function l15End(fb){
  enqueue(() => { if (convo){ convo.done = true; builder.hidden = true; } });
  if (fb) showHint(fb, 'Consiglio'); else enqueue(() => { hintEl.hidden = true; });
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
}
function l15ShowHint(n, C, fb){
  const H = l15HintFor(C), tries = H ? stepTries(convo.st, H.step) : 0;
  if (fb) showHint(fb + (H && H.strong && tries >= HINT_STRONG_AT ? ' ' + H.strong : ''), 'Consiglio');
  else if (H) showHint(hintAfter(tries, H.h, H.strong), H.done ? 'Fatto!' : 'Suggerimento');
  else enqueue(() => { hintEl.hidden = true; });
}
/* the hint for this conversation now: { h, strong, step } (never the Italian sentence) */
function l15HintFor(C){
  const L = S.l15, H = L15_HINTS, B = L.bepi;
  const mk = (x, step, done) => ({ h:x.h || x, strong:x.strong || null, step:C.kind + ':' + step, done });
  if (C.kind === 'ask') return L.prompted ? mk(H.deskAsk, 'ask') : mk(H.deskIntro, 'intro');
  if (C.kind === 'dir') return L.dirOK ? mk(H.dirBye, 'bye', true) : C.dirGiven ? null : C.perDove ? mk(H.dirWhere, 'where') : mk(H.dirAsk, 'ask');
  if (C.kind === 'ticket') return !L.paid ? mk(H.tickets, 'tickets') : !L.timeNoted ? mk(H.time, 'time') : !L.dogOK ? mk(H.dog, 'dog') : mk(H.ticketBye, 'bye', true);
  if (C.kind === 'bar'){
    if (!L.kindsOK) return mk(H.barKinds, 'kinds');
    if (L.ordered) return !L.barPaid ? mk(H.barPay, 'pay') : mk(H.barBye, 'bye', true);
    const O = l15Bar(), p = O.pend;
    if (O.loose) return mk(H.barWhose, 'whose');
    if (p.includes('mg') && l15MgWrong(O.mg)) return mk(H.barFix, 'fix');
    const inc = p.find(w => !l15Done(O[w]) && !l15Empty(O[w]));
    if (inc){ const P = O[inc]; return !P.p ? mk(H.barCorn, 'corn:' + inc) : !P.p.f ? mk(H.barWhich, 'which:' + inc) : mk(H.barDrinkQ, 'drink:' + inc); }
    if (p.some(w => !O[w].ok && l15Done(O[w]))) return mk(H.barConfirm, 'confirm:' + p.join());
    if (O.mg.ok && !O.me.ok) return mk(H.barMe, 'me');
    if (O.me.ok && !O.mg.ok) return mk(H.barMg, 'mg');
    return mk(H.barOrder, 'order');
  }
  if (C.kind === 'bepi'){
    const s = B.stage;
    if (s === 'pet') return mk(H.bepiPet, s);
    if (s === 'intro') return B.name && !B.marg ? mk(H.bepiMarg, s + ':marg') : B.marg && !B.name ? mk(H.bepiName, s + ':name') : mk(H.bepiIntro, s);
    if (s === 'train') return mk(H.bepiTrain, s);
    if (s === 'liked') return mk(H.bepiLiked, s);
    if (s === 'day1' || s === 'day2') return B.need ? mk(H.bepiDayMore, s + ':more') : mk(H.bepiDay, s);
    if (s === 'compare') return mk(H.bepiCompare, s);
    if (s === 'family') return mk(H.bepiFamily, s);
    if (s === 'compliment') return mk(H.bepiThanks, s);
    if (s === 'bye') return mk(H.bepiBye, s);
  }
  return null;
}
function l15Hint(n){ if (!l15Live() || !convo || !convo.l15 || convo.npc !== n) return null; const H = l15HintFor(convo.l15); return H ? { h:H.h, strong:H.strong, step:H.step } : null; }

/* ---------- the barrier's end: the vaporetto? → the handbook ---------- */
function l15BarrierEnd(){
  const L = S.l15;
  l15Mg(L15_MARGARET.deskAfter);
  enqueue(() => { builder.hidden = true; hintEl.hidden = true; });
  sysLine('<i>Il vaporetto</i>… and he said a lot more after it. You know the word for “where”, but not the words for getting around Venice. Time for the handbook: <b>Lezione 15 · Venezia</b>.');
  enqueue(() => {
    L.barrier = true; save();
    if (S.tut === 'l15-ask'){ if (S.practiceDone15) l15ToDirections(); else setTut(vocabCheckDone(15) ? 'l15-practice' : 'l15-handbook'); }
    if (convo) convo.done = true;
  });
  showChoices([{ label:'Leave', fn:closeDialog }, { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(15); } }]);
  return true;
}

/* ---------- the notepad: a price (askNumber), a time (hours : minutes) ---------- */
function l15PricePad(label, truth, line, onRight, fbFor){
  let tries = 0;
  askNumber({ title:'Your notepad', label, tip:'What did you hear? Write it in digits.', onAnswer:v => {
    if (v === truth){ revealListen({ all:true }); sysLine(`<span class="nb-sys">✎ Your notepad: <b>${esc(label)}</b> · € ${truth}</span>`); setTimeout(() => onRight(true), 0); return true; }
    tries++;
    const fb = (fbFor && fbFor(v)) || 'Hmm… is that what you heard? Listen again (the speaker button on the line).';
    if (tries === 2 && line) speak(line.it, convo ? convo.npc.pitch || 1 : 1, false, 0.7);
    if (tries >= 3) revealListen({ all:true });
    showHint(fb + (tries >= 3 ? ' Read the line above.' : ''), 'Consiglio');
    return false;
  } });
}
let L15T = null;
const l15AskTime = o => enqueue(() => { if (dialogOpen && convo) _l15AskTime(o); });
function _l15AskTime(o){
  l15TimeClose();
  const restore = { builder:builder.hidden, typer:typer.hidden };
  builder.hidden = true; typer.hidden = true;
  const el = document.createElement('div'); el.className = 'npad nbask'; el.id = 'l15Time';
  const A = L15T = { ...o, el, restore, tries:0, fb:'' };
  l15TimeRender(); choices.before(el); scrollTr();
  el.addEventListener('click', e => { const b = e.target.closest('[data-l15t]'); if (!b) return;
    if (b.dataset.l15t === 'write') l15TimeCheck(); else if (b.dataset.l15t === 'replay') speak(A.line.it, convo ? convo.npc.pitch || 1 : 1, false, 0.7); });
  requestAnimationFrame(() => { if (L15T === A) footReveal(el); });
}
function l15TimeRender(){
  const A = L15T; if (!A) return;
  const notes = (A.notes || []).map(x => `<p class="npad-line done"><span class="lbl">${esc(x.label)}</span><span class="dots"></span><b>${esc(x.value)}</b></p>`).join('');
  A.el.innerHTML = `<div class="npad-paper nb-paper"><p class="npad-title">Your notepad · <span class="nb-q">A che ora?</span></p>${notes}
      <label class="npad-line cur nb-tline" for="l15H"><span class="lbl">🕖 ${esc(A.label)}:</span><span class="dots"></span>
        <input id="l15H" class="nb-t" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" placeholder="__" aria-label="The hour, in digits">
        <b class="nb-colon">:</b><input id="l15M" class="nb-t" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" placeholder="__" aria-label="The minutes, in digits"></label></div>
    <div class="npad-side"><button class="btn primary" type="button" data-l15t="write">Scrivi ✎</button>${hasTTS && S.sound ? `<button class="nb-replay" type="button" data-l15t="replay">${SPK}<span>Ascolta di nuovo</span></button>` : ''}
      <p class="npad-tip">${A.fb || 'What time did you hear? Digits: hours, then minutes.'}</p></div>`;
  const h = A.el.querySelector('#l15H'), m = A.el.querySelector('#l15M');
  const dig = e => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); if (v !== e.target.value) e.target.value = v; };
  h.addEventListener('input', e => { dig(e); if (h.value.length === 2 || (h.value.length === 1 && +h.value > 2)) m.focus({ preventScroll:true }); });
  m.addEventListener('input', dig);
  h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ':'){ e.preventDefault(); if (h.value && !m.value) m.focus({ preventScroll:true }); else l15TimeCheck(); } });
  m.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); l15TimeCheck(); } else if (e.key === 'Backspace' && !m.value) h.focus({ preventScroll:true }); });
  setTimeout(() => { if (L15T === A && document.activeElement !== m) h.focus({ preventScroll:true }); }, 30);
}
function l15TimeCheck(){
  const A = L15T; if (!A) return;
  const h = A.el.querySelector('#l15H'), m = A.el.querySelector('#l15M');
  if (!h.value){ A.el.classList.remove('shake'); void A.el.offsetWidth; A.el.classList.add('shake'); return; }
  const got = { h:+h.value, m:+(m.value || 0) }, t = A.truth;
  A.tries++;
  if (got.h % 12 === t.h % 12 && got.m === t.m && got.h <= 24){
    revealListen({ all:true });
    sysLine(`<span class="nb-sys">✎ Your notepad: <b>${esc(A.label)}</b> · ${t.h}:${String(t.m).padStart(2, '0')} <i>(${esc(nbTimeIt(t))})</i></span>`);
    const done = A.onDone; l15TimeClose(); if (done) done();
    return;
  }
  A.fb = nbTimeFb(t, got);
  if (A.tries === 2) speak(A.line.it, convo ? convo.npc.pitch || 1 : 1, false, 0.7);
  if (A.tries >= 3){ revealListen({ all:true }); A.fb += ' Read the line above.'; }
  l15TimeRender(); A.el.classList.remove('shake'); void A.el.offsetWidth; A.el.classList.add('shake');
}
function l15TimeClose(){
  const A = L15T; if (!A) return;
  L15T = null; A.el.remove();
  if (dialogOpen && convo && !convo.done){ builder.hidden = A.restore.builder; typer.hidden = A.restore.typer; }
}
const l15TimePadDbg = () => L15T ? { open:true, label:L15T.label, tries:L15T.tries, fb:L15T.fb } : { open:false };

/* ---------- closing a conversation ---------- */
function l15OnClose(closedId, closedDone){
  l15TimeClose();
  if (!l15Live()) return false;
  const L = S.l15;
  if (closedId === 'baristaSL' && L.barDone && S.tut === 'l15-breakfast'){
    setTut('l15-bepi'); l15Clock(9 * 60 + 1); l15MgSay(L15_MARGARET.barDone); return true;
  }
  if (closedId === 'bepi' && L.bepiDone && S.tut === 'l15-bepi'){
    setTut('l15-board'); l15Clock(9 * 60 + 8); if (!L.boatIn){ L.boatIn = true; VEN.boat = 'docked'; VEN.boatX = 0; save(); }
    setTimeout(l15BepiLeave, 300); return true;
  }
  return false;
}
