/* Lesson 9 · Due magliette, tre rose. The stall conversations (tile bank + hooks).
   The barrier: before the handbook you only have singular tiles, so "Vorrei due maglietta" confuses the vendor.
   Shopping: greet and "come sta?" first (Lesson 7), then ask for what is on your list: number + plural noun (+ a colour at
   Teresa's, which must agree). A wrong ending → the vendor's confused echo and a hint that points at the ending. A wrong
   number → the vendor gives you that many and the list shows it: "No, scusi, due cravatte." Gino and Pina check the
   quantity (Quante rose? Tre? / Quanti pomodori? Sei?). Once the order matches the list: the total (a listening line) →
   the notepad → "Ecco venti euro" → the stall is ticked. */

const l9Vendor = n => !!n && S.lesson === 9 && !!S.l9 && L9_STALL_IDS.includes(n.id);
const l9St = st => st.l9 || (st.l9 = { greeted:false, how:false, check:null, recast:null, pending:false, wrong:0 });
const L9_SOCIAL = new Set(['greet', 'ask_how', 'answer_how', 'ask_back', 'address', 'name_only', 'nice', 'excuse', 'please', 'and', 'sir', 'madam']);
const l9Him = n => n.pron[1] === 'his' ? 'him' : 'her';
const l9Quanti = k => L9_GOODS[k].g === 'f' ? 'quante' : 'quanti';
const l9One = G => G.one.endsWith("'") ? G.one + G.sg : `${G.one} ${G.sg}`;
/* the key word(s) a hint may name: only after three misses in a row at the same step, and never the whole sentence */
const l9Key = w => convo && convo.fails >= 3 ? w : null;

/* formatSentence: sentences and questions for this lesson's phrases (directions are statements: Giri a destra.) */
['vada', 'giri', 'gira', 'vai', 'poi', 'ecco'].forEach(w => CLAUSE.add(w));
['non è', 'strada giri', 'strada gira', 'poi giri', 'poi vada', 'giri a', 'gira a', 'farmacia giri', 'chiesa giri', 'banca giri', 'e poi'].forEach(w => JOIN.add(w));
['vada', 'giri', 'gira', 'vai', 'vorrei', 'non è'].forEach(w => NOTQ.add(w));

/* ---------- parser words (also what readTyped accepts: natural alternatives for hard mode) ---------- */
function l9Phrases(){
  const P = [];
  Object.entries(L9_GOODS).forEach(([k, g]) => {
    const glue = (a, w) => a.endsWith("'") ? a + w : `${a} ${w}`;
    P.push(['g9:' + k + ':s', g.sg], ['g9:' + k + ':p', g.pl], ['g9:' + k + ':s:the', glue(g.the, g.sg)], ['g9:' + k + ':p:the', `${g.thePl} ${g.pl}`],
      ['g9:' + k + ':s:one', glue(g.one, g.sg)]);
  });
  P.push(['art9:un', 'un'], ['art9:una', 'una'], ['want:me', 'prendo'], ['want:me', 'vorrei avere'],
    ['col9:rosso:mp', 'rossi'], ['col9:bianco:mp', 'bianchi'], ['col9:nero:mp', 'neri'], ['col9:nero:fp', 'nere'],
    ['col9:giallo:mp', 'gialli'], ['col9:giallo:fp', 'gialle'], ['col9:verde:p', 'verdi'],
    ['nothing', 'basta così'], ['nothing', 'basta'], ['nothing', 'niente altro'], ['nothing', 'nient\'altro'], ['nothing', 'no grazie'],
    /* directions (sofia.js) */
    ['d9:straight', 'vada dritto'], ['d9:always', 'vada sempre dritto'], ['d9:straight:tu', 'vai dritto'], ['d9:always:tu', 'vai sempre dritto'],
    ['d9:turn:R', 'giri a destra'], ['d9:turn:L', 'giri a sinistra'], ['d9:turn:R:tu', 'gira a destra'], ['d9:turn:L:tu', 'gira a sinistra'],
    ['d9:turn:R', 'giri destra'], ['d9:turn:L', 'giri sinistra'],
    ['d9:nth:1', 'alla prima strada'], ['d9:nth:2', 'alla seconda strada'], ['d9:nth:3', 'alla terza strada'],
    ['d9:nth:1', 'alla prima'], ['d9:nth:2', 'alla seconda'], ['d9:nth:3', 'alla terza'], ['d9:nth:1', 'la prima strada'], ['d9:nth:2', 'la seconda strada'],
    ['d9:nth:1', 'prima strada'], ['d9:nth:2', 'seconda strada'],
    ['d9:until:farmacia', 'fino alla farmacia'], ['d9:until:chiesa', 'fino alla chiesa'], ['d9:until:banca', 'fino alla banca'],
    ['d9:until:ospedale', "fino all'ospedale"], ['d9:until:basilica', 'fino alla basilica'],
    ['d9:at:farmacia', 'alla farmacia'], ['d9:at:chiesa', 'alla chiesa'], ['d9:at:banca', 'alla banca'],
    ['d9:then', 'poi'], ['d9:then', 'e poi'], ['d9:then', 'dopo'],
    ['d9:there', 'san lorenzo è lì'], ['d9:there', 'è lì'], ['d9:there', 'lì'], ['d9:there', 'san lorenzo è qui'], ['d9:there', 'è qui'], ['d9:sl', 'san lorenzo'],
    ['d9:notfar', 'non è lontano'], ['d9:notfar', 'no non è lontano'], ['d9:notfar', 'è vicino'], ['d9:notfar', 'vicino'],
    ['d9:undo', 'no scusi'], ['d9:undo', 'cancella'],
    ['origin', 'sono di padova'], ['origin', 'sono inglese'], ['origin', 'sono di'], ['dontknow', 'non so']);
  return P;
}

/* ---------- reading a shopping sentence ----------
   → { items:[{ key, pl, n, art, artG, col }], pay, payBare, num (a number with no noun), yes, no, nothing, cost, repeat,
   thanks, bye, other } */
function l9Noun(id, stall){
  let m;
  if ((m = id.match(/^g9:(\w+):(s|p)(?::(the|one))?$/))){
    const pl = m[2] === 'p', art = m[3] || null;
    return { key:m[1], pl, art, artG:null, n:art === 'one' || (art === 'the' && !pl) ? 1 : null };
  }
  if ((m = id.match(/^item7:(maglietta|cravatta|melone)$/))) return { key:m[1], pl:false, art:'the', artG:null, n:1 };
  if (id === 'item8:maglietta') return { key:'maglietta', pl:false, art:'one', artG:null, n:1 };
  if (id === 'roses') return { key:'rosa', pl:true, art:'the', artG:null, n:null };
  return null;
}
/* a colour intent → { c, form: 'm' | 'f' | 'mp' | 'fp' | 'p' (verdi) | 'x' (verde, blu, rosa) } */
function l9Col(id){
  let m;
  if (id === 'blue') return { c:'blu', form:'x' };
  if ((m = id.match(/^colour:(\w+):(m|f|n|x|p)$/))) return { c:m[1], form:m[2] === 'n' ? 'm' : m[2] === 'p' ? 'fp' : m[2] };
  if ((m = id.match(/^col9:(\w+):(mp|fp|p)$/))) return { c:m[1], form:m[2] };
  return null;
}
const l9ColWord = col => col.form === 'x' ? (L9_COLOUR[col.c].x || L9_COLOUR[col.c].m) : col.form === 'p' ? L9_COLOUR[col.c].mp : L9_COLOUR[col.c][col.form];
/* the form a colour needs with this noun (blu, rosa: never change) */
function l9ColNeed(G, pl, c){ const C = L9_COLOUR[c]; return C.x || C[pl ? (G.g === 'f' ? 'fp' : 'mp') : G.g]; }
function l9Read(ints, stall){
  const R = { items:[], pay:null, payBare:false, num:null, yes:false, no:false, nothing:false, cost:false, repeat:false, thanks:false, bye:false, other:[] };
  let num = null, art = null, ecco = false;
  ints.forEach(id => {
    let m;
    if (id === 'here_is'){ ecco = true; R.payBare = true; return; }
    if ((m = id.match(/^num:(\d+)$/))){ if (ecco){ R.pay = +m[1]; ecco = false; } else { num = +m[1]; art = null; } return; }
    if (id === 'euro') return;
    ecco = false;
    if ((m = id.match(/^art9:(un|una)$/))){ art = m[1]; num = 1; return; }
    /* rosa after a noun (or anywhere at Teresa's, who sells no flowers) is the colour pink */
    const last = R.items[R.items.length - 1];
    if (id === 'g9:rosa:s' && (stall === 'teresa' || (last && !last.col && last.key !== 'rosa'))){
      if (last && !last.col) last.col = { c:'rosa', form:'x' }; else R.other.push(id); return;
    }
    const noun = l9Noun(id, stall);
    if (noun){
      R.items.push({ ...noun, n:num !== null ? num : noun.n, numSaid:num !== null, artG:art === 'un' ? 'm' : art === 'una' ? 'f' : null, col:null });
      num = null; art = null; return;
    }
    const col = l9Col(id);
    if (col){ if (last && !last.col) last.col = col; else R.other.push(id); return; }
    if (id === 'yes') R.yes = true;
    else if (id === 'no' || id === 'd9:undo') R.no = true;
    else if (id === 'nothing'){ R.nothing = true; R.no = true; }
    else if (id === 'ask_cost' || id === 'how_much') R.cost = true;
    else if (id === 'repeat') R.repeat = true;
    else if (id === 'thanks') R.thanks = true;
    else if (id === 'bye') R.bye = true;
    else if (!['want:me', 'have:lei', 'have', 'have:tu', 'please'].includes(id)) R.other.push(id);
  });
  if (num !== null) R.num = num;                       // "Tre." / "Sì, tre." / "Una."
  return R;
}

Object.assign(LESSON_HOOKS[9], {
  phrases(){ return S.lesson >= 9 ? l9Phrases() : []; },

  /* the tiles: before the handbook only singular nouns; then both forms of each stall's goods, colours at Teresa's */
  bank(npc, groups){
    if (S.lesson !== 9 || !S.l9) return null;
    if (npc && npc.id === 'sofia') return l9SofiaBank(groups);
    if (!l9Vendor(npc)) return null;
    const goods = l9Def(npc.id).items.map(([k]) => k).concat(npc.id === 'gino' ? ['pianta'] : []);
    const nums = top => ({ label:'Numeri', tiles:Array.from({ length:top }, (_, i) => ({ w:numIt(i + 1), label:numIt(i + 1), gloss:String(i + 1) })) });
    if (!S.vocab9){
      groups.push({ label:'Al mercato', tiles:goods.filter(k => !L9_GOODS[k].off).map(k => L9_NOUN_TILES[k][0]).map(phraseTile) });
      groups.push({ label:'Comprare', tiles:L9_BUY.filter(t => ['vorrei', 'ha', 'un', 'una', 'e', 'per favore'].includes(t.key)).map(phraseTile) });
      groups.push(nums(10));
      groups.push({ label:'Polite', tiles:L9_POLITE.map(phraseTile) });
      return groups;
    }
    groups.push({ label:'Plurali', tiles:goods.flatMap(k => L9_NOUN_TILES[k]).map(phraseTile) });
    groups.push({ label:'Comprare', tiles:L9_BUY.map(phraseTile) });
    if (npc.id === 'teresa') groups.push({ label:'Colori', tiles:L9_COLOUR_TILES.map(phraseTile) });
    groups.push(nums(20));
    groups.push({ label:'Polite', tiles:L9_POLITE.map(phraseTile) });
    return groups;
  },

  react(id, n, st, add, out, ints){
    if (S.lesson !== 9 || !S.l9) return false;
    if (n.id === 'sofia') return l9SofiaReact(id, n, st, add, out, ints);
    if (!l9Vendor(n)) return false;
    const s = l9St(st);
    if (id === 'greet'){ s.greeted = true; return false; }                       // the brain answers as usual
    if (id === 'ask_how' || id === 'answer_how'){ s.how = true; return false; }
    if (L9_SOCIAL.has(id)) return false;
    if (out.l9biz) return true;                                                  // the whole sentence is handled once
    out.l9biz = true; out.asked = true;
    if (ints.includes('greet')) s.greeted = true;                                // "Buongiorno, vorrei…": greeted in the same turn
    if (st.lastQ === 'how') st.lastQ = null;                                     // straight to business: Come sta? was optional
    const R = l9Read(ints, n.id);
    if (!S.vocab9) l9Barrier(n, s, add, out, R); else l9Shop(n, s, add, out, R);
    return true;
  },

  afterTurn(n, out, res, words){
    if (S.lesson !== 9 || !S.l9) return false;
    if (n.id === 'sofia') return l9SofiaAfter(n, out, res, words);
    if (!l9Vendor(n)) return false;
    enqueue(() => { if (convo && convo.npc === n) setDialogList(l9ListSpec(n.id)); });
    if (out.l9barrier) return l9BarrierTurn(n, out);
    if (out.l9rude){ showHint('Greet first: market vendors expect a greeting before business (polite: a stranger).', 'Consiglio'); return true; }
    if (out.l9total){ enqueue(() => { hintEl.hidden = true; }); if (out.l9hint) showHint(out.l9hint.h, out.l9hint.label); l9AskTotal(n); return true; }
    if (out.l9paid){
      const all = l9PaidCount() === 4;
      sysLine(`Your list: <b>${esc(l9Def(n.id).at)}</b> ✓ <span class="l9-tick">${l9PaidCount()}/4</span>`);
      enqueue(() => renderHUD());
      showHint(all ? `Everything on your list! Thank ${l9Him(n)} and say goodbye.` : `Bought! Thank ${l9Him(n)} and say goodbye, then on to the next stall.`, 'Fatto!');
      return true;
    }
    if (out.end) return false;
    if (out.l9hint){ showHint(out.l9hint.h, out.l9hint.label); return true; }
    return false;
  },

  /* the hint at a stall, and with Sofia. Hints help you find the answer, they never give it: h is English (what the
     situation needs, a rule, where to look); m (the "Try:" after the misses) is only the key word(s), and only once the
     sentence has failed three times in a row (l9Key) */
  hint(n, st){
    if (S.lesson !== 9 || !S.l9) return null;
    if (n.id === 'sofia') return l9SofiaHint(n, st);
    if (!l9Vendor(n)) return null;
    const s = l9St(st), L = S.l9, P = n.pron[0], id = n.id;
    if (!s.greeted) return { h:'Greet first: market vendors expect a greeting before business.', m:l9Key('buongiorno') };
    const first = l9Def(id).items[0][0];
    if (!S.vocab9) return { h:`Ask for what is on your list: ${l9En(first, L.list[first])}.`, m:l9Key('vorrei') };
    if (L.paid[id]) return { h:`All bought here. Thank ${l9Him(n)} and say goodbye.`, m:l9Key('arrivederci') };
    if (s.check) return { h:`${P} asked you something about your order. Check your list and answer. Not sure what ${l9Quanti(s.check.key)} means? Look it up in your dictionary (V).`, m:l9Key(numIt(L.list[s.check.key])) };
    if (s.pending) return { h:`Didn't catch the total? Ask ${l9Him(n)} to say it again (politely).`, m:l9Key('ripetere') };
    if (L.noted[id] !== undefined) return { h:'Pay with a twenty-euro note.', m:l9Key('ecco … venti') };
    const O = L.order[id], next = l9Def(id).items.find(([k]) => O[k] !== L.list[k]);
    if (st.lastQ === 'how' && !s.how) return { h:`${P} asked you a question (Lesson 1!). Answer it, or go straight to your shopping list.`, m:l9Key('bene') };
    if (next){
      const k = next[0], G = L9_GOODS[k], q = L.list[k], R9 = L9_RULES[G.rule];
      return { h:`Ask for ${l9En(k, q)}. ` + (q > 1 ? `Careful with the ending: ${G.sg} is ${G.g === 'f' ? 'feminine' : 'masculine'}; plural ${R9.end} → ${R9.pl}.` : 'Just one: the singular.'), m:l9Key(q > 1 ? G.pl : G.sg) };
    }
    return { h:`Thank ${l9Him(n)} and say goodbye.`, m:l9Key('arrivederci') };
  },
});

/* ---------- the barrier: singular tiles only ---------- */
function l9Barrier(n, s, add, out, R){
  const L = S.l9, mine = l9Def(n.id).items.map(([k]) => k);
  const hint = h => { out.l9hint = { h, label:'Suggerimento' }; };
  const first = mine[0], want = L.list[first];
  if (R.thanks || R.bye){ add('Prego! Arrivederci!', "You're welcome! Goodbye!"); out.end = true; return; }
  if (!s.greeted){ add('Buongiorno, eh!', 'Good morning, eh!'); out.l9rude = true; return; }
  const it = R.items.find(i => mine.includes(i.key)), other = R.items.find(i => !mine.includes(i.key));
  if (it && it.n > 1 && !it.pl){
    const G = L9_GOODS[it.key];
    add(`${cap(numIt(it.n))}… ${G.sg}?`, `${cap(NUM_EN[it.n])}… ${G.en[0]}?`);
    add(`${cap(l9One(G))}… o ${numIt(it.n)} ${G.pl}?`, `One ${G.en[0]}… or ${NUM_EN[it.n]} ${G.en[1]}?`, { rate:0.66 });
    out.l9barrier = { key:it.key, n:it.n }; return;
  }
  if (it){ const G = L9_GOODS[it.key]; add(`${cap(l9One(G))}? Sì… solo una?`.replace('solo una', G.g === 'f' ? 'solo una' : 'solo uno'), `One ${G.en[0]}? Yes… just one?`);
    hint(`Your list says <b>${l9En(first, want)}</b>, not one. Ask for ${want}.`); return; }
  if (other){ const G = L9_GOODS[other.key]; add(`${cap(G.sg)}? No, mi dispiace: qui solo ${L9_SELLS[n.id].it}.`, `${cap(G.en[0])}? No, sorry: only ${L9_SELLS[n.id].en} here.`); return; }
  if (R.num !== null){ add(`${cap(numIt(R.num))}… cosa?`, `${cap(NUM_EN[R.num])}… what?`); hint('You gave a number, but not the thing. Say what you would like, too.'); return; }
  add('Mmm? Cosa desidera?', 'Hmm? What would you like?');
  hint(`Ask for what is on your list: <b>${l9En(first, want)}</b>.`);
}
function l9BarrierTurn(n, out){
  const G = L9_GOODS[out.l9barrier.key];
  enqueue(() => { builder.hidden = true; hintEl.hidden = true; });
  sysLine(`${n.pron[0]} heard <i>${NUM_EN[out.l9barrier.n]}</i> and <i>one ${esc(G.en[0])}</i> at the same time. More than one needs the <b>plural</b>, and all you have is <i>${esc(G.sg)}</i>. Time for the handbook: <b>Lezione 9 · Due magliette, tre rose</b>.`);
  enqueue(() => { S.l9.barrier = true; save(); if (S.tut === 'l9-barrier') setTut(S.vocab9 ? 'l9-shopping' : 'l9-handbook'); });
  showChoices([{ label:'Leave', fn:closeDialog }, { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(9); } }]);
  return true;
}

/* ---------- shopping ---------- */
function l9Shop(n, s, add, out, R){
  const L = S.l9, id = n.id, D = l9Def(id), O = L.order[id] || (L.order[id] = {}), mine = D.items.map(([k]) => k);
  const hint = (h, label) => { if (!out.l9hint) out.l9hint = { h, label:label || 'Suggerimento' }; };
  const T = L.totals[id], totalLine = { it:`Sono ${numIt(T)} euro.`, en:`That's ${NUM_EN[T]} euros.` };
  const business = R.items.length || R.pay !== null || R.payBare || R.cost || R.num !== null || R.yes || R.no;

  /* goodbye */
  if ((R.thanks || R.bye) && !R.items.length && R.pay === null && !R.payBare){
    if (L.paid[id] || R.bye || !Object.keys(O).length){ add(L.paid[id] ? 'Grazie a Lei! Arrivederci, buona giornata!' : 'Prego! Arrivederci!', L.paid[id] ? 'Thank you! Goodbye, have a nice day!' : "You're welcome! Goodbye!"); out.end = true; }
    else add('Prego!', "You're welcome!");
    return;
  }
  if (L.paid[id]){ add('Ha già tutto! Grazie mille.', 'You have everything already! Thanks a lot.'); hint(`All bought here. Thank ${l9Him(n)} and say goodbye.`, 'Fatto!'); return; }
  if (business && !s.greeted){ add('Buongiorno, eh!', 'Good morning, eh!'); out.l9rude = true; return; }

  /* the total: again (slowly), or ask for it before writing it down */
  if (R.repeat){
    if (L.said[id] && L.noted[id] === undefined){ add('Sì, certo!', 'Yes, of course!'); add(totalLine.it, totalLine.en, { listen:true, rate:0.68 }); s.pending = true; out.l9total = true; return; }
    if (convo.lastNpcText){ add('Sì, certo! ' + convo.lastNpcText.it, 'Yes, of course! ' + convo.lastNpcText.en); out.slow = true; return; }
  }
  /* paying */
  if (R.pay !== null || R.payBare){
    if (!L.said[id]){ add('Un momento! Prima mi dica cosa desidera.', "One moment! First tell me what you'd like."); hint('First ask for what is on your list.'); return; }
    if (L.noted[id] === undefined){ add(totalLine.it, totalLine.en, { listen:true }); s.pending = true; out.l9total = true; return; }
    if (R.pay === null){ add('Ecco… quanto?', "Here's… how much?"); hint('Say how much you are giving: a twenty-euro note.'); return; }
    if (R.pay < T){ add(`${cap(numIt(R.pay))} euro? Ma sono ${numIt(T)} euro!`, `${cap(NUM_EN[R.pay])} euros? But it's ${NUM_EN[T]} euros!`); hint(`That is less than the € ${T} in your notepad. Pay with a twenty-euro note.`); return; }
    L.paid[id] = true; save();
    const c = R.pay - T;
    add(c ? `Grazie! Ecco il resto: ${c === 1 ? 'un' : numIt(c)} euro.` : 'Grazie! Giusto così.', c ? `Thank you! Here's your change: ${NUM_EN[c]} ${c === 1 ? 'euro' : 'euros'}.` : 'Thank you! Exactly right.');
    out.l9paid = true; return;
  }
  if (L.said[id]){                                     // the order is complete: only the total is left
    if (R.cost || R.items.length){ add(`Ha già tutto: ${totalLine.it.toLowerCase()}`, `You have everything: ${totalLine.en.toLowerCase()}`, L.noted[id] === undefined ? { listen:true } : undefined);
      if (L.noted[id] === undefined){ s.pending = true; out.l9total = true; } else hint('Pay with a twenty-euro note.'); return; }
  }
  if (R.cost && !R.items.length){ add('Prima mi dica: cosa desidera?', "First tell me: what would you like?"); hint('Ask for what is on your list first. The total comes at the end.'); return; }

  const confirms = [], echo = [];                       // echo: the vendor's confused lines, said after the confirmations
  let ask = null;
  const say = (it, en, o) => echo.push([it, en, o]);
  const set = (k, q) => { const prev = O[k]; O[k] = q; confirms.push({ k, q, fix:prev !== undefined && prev !== q }); if (q !== L.list[k]) L.mistakes.number++; };

  /* an answer to the vendor's question: "Quante rose? Tre?" → Sì / Tre / Sì, tre rose; or to a recast (Due magliette rosse?) */
  if (s.recast && R.yes && !R.items.length){
    const r = s.recast; s.recast = null;
    if (r.col) L.colour = r.col;
    set(r.k, r.q);
  } else if (s.check && !R.items.some(i => i.key === s.check.key)){
    const c = s.check, q = R.num !== null ? R.num : R.yes ? c.n : null;
    if (q !== null && q > 0){ s.check = null; L.checked[id] = true; set(c.key, q); }
    else if (R.no){ add(`No? ${cap(l9Quanti(c.key))}, allora?`, 'No? How many, then?'); hint(`Check your list and tell ${l9Him(n)} the number.`); return; }
    else if (!R.items.length){
      s.checkMiss = (s.checkMiss || 0) + 1;
      add(`${cap(l9Quanti(c.key))} ${L9_GOODS[c.key].pl}?`, `How many ${L9_GOODS[c.key].en[1]}?`);
      /* the question is the thing to understand: no translation; after three misses, the number (the key word) */
      hint(s.checkMiss >= 3 ? `Answer with the number on your list: <b>${numIt(L.list[c.key])}</b>.`
        : `${esc(n.name)} is still waiting for an answer. Not sure what <i>${l9Quanti(c.key)}</i> means? Look it up in the handbook (<kbd>H</kbd>), then check your list.`); return;
    }
  }
  s.recast = null;

  for (const it of R.items){
    const G = L9_GOODS[it.key], R9 = L9_RULES[G.rule];
    if (G.stall !== id){ say(`${cap(G.pl)}? No, mi dispiace: qui solo ${L9_SELLS[id].it}.`, `${cap(G.en[1])}? No, sorry: only ${L9_SELLS[id].en} here.`);
      hint(`${esc(n.name)} sells ${L9_SELLS[id].en}. Ask for what is on your list <i>${esc(D.at.toLowerCase())}</i>.`); continue; }
    if (G.off){ say(`${cap(G.pl)}? Oggi sono finite, mi dispiace!`, `${cap(G.en[1])}? They're sold out today, sorry!`); hint("That's not on your list anyway."); continue; }
    /* the ending must match the number */
    if (it.n !== null && it.n > 1 && !it.pl){
      say(`${cap(numIt(it.n))}… ${G.sg}?`, `${cap(NUM_EN[it.n])}… ${G.en[0]}?`);
      say(`${cap(l9One(G))}… o ${numIt(it.n)} ${G.pl}?`, `One ${G.en[0]}… or ${NUM_EN[it.n]} ${G.en[1]}?`, { rate:0.7 });
      L.mistakes.plural++; out.l9confused = true;
      hint(`More than one: the plural. <b>${R9.end}</b> becomes <b>${R9.pl}</b>: ${G.sg} → <b>${G.pl}</b>.`, 'Consiglio');
      break;
    }
    if (it.pl && it.n === 1){
      say(`${cap(it.artG ? (it.artG === 'm' ? 'un' : 'una') : 'una')}… ${G.pl}?`, `One… ${G.en[1]}?`);
      L.mistakes.plural++; out.l9confused = true;
      hint(`Just one: the singular, <b>${G.sg}</b>. <i>${G.pl}</i> is for two or more.`, 'Consiglio');
      break;
    }
    if (it.artG && it.artG !== G.g){
      L.mistakes.article++;
      hint(`<i>${G.sg}</i> is ${G.g === 'f' ? 'feminine' : 'masculine'}: <b>${l9One(G)}</b>. ${n.pron[0]} understood you anyway.`, 'Consiglio');
    }
    let q = it.n;
    /* a colour must agree (Teresa): due magliette rossa → rosse */
    if (it.col){
      const need = l9ColNeed(G, it.pl || (q !== null && q > 1), it.col.c), said = l9ColWord(it.col);
      if (said !== need){
        say(`${cap(q !== null ? (q === 1 ? l9One(G) : `${numIt(q)} ${G.pl}`) : G.pl)}… ${said}? ${cap(q !== null && q !== 1 ? `${numIt(q)} ${G.pl}` : it.pl ? G.pl : G.sg)} ${need}?`,
          `${cap(q !== null && q !== 1 ? `${NUM_EN[q]} ${G.en[1]}` : G.en[it.pl ? 1 : 0])}… ${L9_COLOUR[it.col.c].en}? ${L9_COLOUR[it.col.c].en} ones?`);
        L.mistakes.agree++; out.l9confused = true;
        if (q) s.recast = { k:it.key, q, col:id === 'teresa' ? need : null };
        hint(`<i>${G.pl}</i> is ${G.g === 'f' ? 'feminine' : 'masculine'} plural, so the colour is too. Plural: <b>${need}</b>.`, 'Consiglio');
        break;
      }
      if (id === 'teresa') L.colour = need;
    }
    /* plural with no number: how many? */
    if (q === null){ s.check = { key:it.key, n:null }; ask = { it:`${cap(G.pl)}, sì! ${cap(l9Quanti(it.key))} ${G.pl}?`, en:`${cap(G.en[1])}, yes! How many ${G.en[1]}?` }; continue; }
    /* Gino and Pina check one thing: Quante rose? Tre? */
    if (D.check === it.key && !L.checked[id]){
      s.check = { key:it.key, n:q };
      const nice = G.g === 'f' ? 'bellissime' : 'buonissimi';
      ask = { it:`${cap(G.pl)}, ${nice}! ${cap(l9Quanti(it.key))} ${G.pl}? ${cap(numIt(q))}?`, en:`${cap(G.en[1])}, lovely! How many ${G.en[1]}? ${cap(NUM_EN[q])}?` };
      continue;
    }
    if (s.check && s.check.key === it.key){ s.check = null; L.checked[id] = true; }
    set(it.key, q);
  }
  save();
  if (confirms.length){ const c = l9ConfirmLine(confirms, id); add(c.it, c.en); }
  echo.forEach(([it, en, o]) => add(it, en, o));
  if (out.l9confused || (echo.length && !confirms.length && !ask)) return;
  if (ask){ add(ask.it, ask.en); hint(`${esc(n.name)} has a question about your order. Check your list and answer ${l9Him(n)}.`); return; }
  /* the order matches the list: the total, by ear */
  if (mine.every(k => O[k] === L.list[k])){
    L.said[id] = true; s.pending = true; save();
    add(`Allora: ${listJoin(mine.map(k => l9Say(k, O[k], k === 'maglietta' ? L.colour : null)), 'e')}.`, `So: ${listJoin(mine.map(k => l9En(k, O[k])), 'and')}.`);
    add(totalLine.it, totalLine.en, { listen:true });
    out.l9total = true;
    return;
  }
  const wrong = mine.find(k => O[k] !== undefined && O[k] !== L.list[k]), missing = mine.find(k => O[k] === undefined);
  if (confirms.length || R.no) add(R.no && !confirms.length ? 'Niente altro? Mmm…' : 'Altro?', R.no && !confirms.length ? 'Nothing else? Hmm…' : 'Anything else?');
  if (wrong){
    hint(`Check your list: does it match what ${esc(n.name)} just gave you? If not, correct ${l9Him(n)}, politely.`, 'Attenzione');
    return;
  }
  if (missing && (confirms.length || R.no)){ hint(`Next on your list: <b>${l9En(missing, L.list[missing])}</b>.`); return; }
  if (!confirms.length && !R.no){
    add('Mmm? Cosa desidera?', 'Hmm? What would you like?');
    hint(`Ask for what is on your list: <b>${l9En(missing || mine[0], L.list[missing || mine[0]])}</b>.`);
  }
}
/* "Due cravatte, ecco!" / after a correction: "Ah, due! Mi scusi. Due cravatte." */
function l9ConfirmLine(confirms, id){
  const L = S.l9, words = confirms.map(c => l9Say(c.k, c.q, c.k === 'maglietta' ? L.colour : null)), fix = confirms.find(c => c.fix);
  const en = confirms.map(c => l9En(c.k, c.q)).join(' and ');
  if (fix) return { it:`Ah, ${fix.q === 1 ? (L9_GOODS[fix.k].g === 'f' ? 'una' : 'uno') : numIt(fix.q)}! Mi scusi. ${cap(listJoin(words, 'e'))}, ecco.`, en:`Ah, ${NUM_EN[fix.q]}! Sorry. ${cap(en)}, here you are.` };
  return { it:`${cap(listJoin(words, 'e'))}, ecco!`, en:`${cap(en)}, here you are!` };
}

/* the notepad: write the total you heard */
function l9AskTotal(n){
  const s = l9St(convo.st), id = n.id, T = S.l9.totals[id];
  const notes = L9_LIST.filter(x => S.l9.noted[x.stall] !== undefined).map(x => ({ label:`${NPC[x.stall].name} · totale`, value:S.l9.noted[x.stall] }));
  askNumber({ title:'Your notepad', label:`${n.name} · totale`, notes, tip:`What did ${n.pron[0].toLowerCase()} say? Write it in digits.`,
    onAnswer(x){
      if (!convo || convo.npc !== n) return true;
      if (x === T){
        revealListen({ all:true });
        S.l9.noted[id] = T; s.pending = false; save(); renderHUD();
        sysLine(`Your notepad: <b>${esc(n.name)} · € ${T}</b>`);
        enqueue(() => { if (convo && convo.npc === n) setDialogList(l9ListSpec(id)); });
        showHint('Written down! Now pay with a twenty-euro note.', 'Fatto!');
        return true;
      }
      s.wrong++;
      sysLine(`You write <b>€ ${x}</b>. Hmm… is that what ${n.pron[0].toLowerCase()} said?`);
      /* 1: ask again (the pad closes); 2: listen again; 3: the line is revealed */
      if (s.wrong === 1){ showHint(`Not sure? Ask ${l9Him(n)}, politely, to say it again. Or tell ${l9Him(n)} you didn't understand.`); return true; }
      if (s.wrong === 2){ showHint('Still not it. Press <b>🔊 Ascolta di nuovo</b> on the total above to hear it again, slowly.'); return false; }
      revealListen({ all:true });
      showHint('Read the total above, then write it in digits.');
      return false;
    } });
}
