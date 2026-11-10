/* Lesson 8 · Mi piace! The stall conversations in the tile bank (you, alone, speaking for yourself):
   the barrier (Teresa talks fast), colours and sizes with Teresa, the roses and the wrong change at Gino's, and Pina's
   melon (optional). Vendors expect a greeting first, as in Lesson 7: a greeting in the same turn counts, and "come sta?"
   is optional politeness. Other stalls (and these, outside their scene) just chat: greet, ask a price, say goodbye.
   Hints follow CLAUDE.md: they say what the situation needs, never the Italian sentence; from the third failed attempt
   at a step (stepTries / hintAfter, conversation/turns.js) they may name the key words. */

const l8Vendor = n => !!n && S.lesson === 8 && !!S.l8 && !!L7_STALLS[n.id];
const l8St = st => st.l8 || (st.l8 = { greeted:false, how:false, lastQ:null, pending:null, wrong:0, took:false });
/* "colour:rosso:f" → { c:'rosso', g:'f' }; the Lesson 6 'blue' intent is blu */
const l8Colour = id => id === 'blue' ? { c:'blu', g:'x' } : { c:id.split(':')[1], g:id.split(':')[2] };
const l8Fem = c => L8_COLOUR[c].f || L8_COLOUR[c].x;
const l8Num = (ints, after) => { const k = after ? ints.indexOf(after) : -1; const i = ints.slice(k + 1).find(x => x.startsWith('num:')); return i ? +i.slice(4) : null; };
/* intents that are not business: the brain (or the thanks/bye/repeat handling below) answers them */
const L8_SOCIAL = new Set(['greet', 'ask_how', 'answer_how', 'ask_back', 'address', 'name_only', 'nice', 'excuse', 'please', 'thanks', 'bye', 'repeat', 'yes', 'no', 'and', 'sir', 'madam']);
/* a hint for this turn: h, the mild one (never the Italian answer); strong, from the third failed attempt at the step */
const l8Hint = (out, h, label, strong) => { out.l8hint = { h, label:label || 'Suggerimento', strong }; };
const l8Pina = n => n.id === 'pina' && !!S.vocab8;

/* the parser words for Lesson 8 (also everything readTyped accepts in the typed scenes) */
function l8Phrases(){
  const P = [];
  Object.entries(L8_COLOUR).forEach(([c, f]) => {
    if (f.x) P.push(['colour:' + c + ':x', f.x], ['colour:' + c + ':x', 'la ' + f.x]);
    else P.push(['colour:' + c + ':m', f.m], ['colour:' + c + ':f', f.f], ['colour:' + c + ':f', 'la ' + f.f], ['colour:' + c + ':n', 'il ' + f.m]);
  });
  P.push(['colour:rosso:p', 'rosse'], ['colour:bianco:p', 'bianche']);
  P.push(['item8:maglietta', 'una maglietta'], ['item8:maglietta', 'maglietta'], ['item8:maglietta', 'questa maglietta'], ['item8:maglietta', 'la maglietta di mark'],
    ['size:piccola', 'piccola'], ['size:piccolo', 'piccolo'], ['size:grande', 'grande'], ['size:grande', 'taglia grande'], ['size:grande', 'la taglia grande'],
    ['size:xl', 'extra large'], ['size:xl', 'la extra large'], ['size:xl', 'xl'], ['size:xl', 'la xl'], ['size:xl', 'taglia extra large'],
    ['too', 'troppo'], ['bigger', 'una taglia più grande'], ['bigger', 'taglia più grande'], ['bigger', 'una più grande'], ['bigger', 'più grande'],
    ['like:me', 'mi piace'], ['dislike:me', 'non mi piace'], ['like:le', 'le piace'], ['like:ti', 'ti piace'],
    ['like:emma', 'a emma piace'], ['like:emma', 'ad emma piace'], ['like:emma', 'piace a emma'], ['like:emma_bad', 'emma piace'], ['really', 'davvero'],
    ['for_emma', 'per emma'], ['for_emma', 'è per emma'], ['for_mark', 'per mark'], ['for_mark', 'è per mark'],
    ['for_friend', 'è per il mio amico'], ['for_friend', 'per il mio amico'],
    ['take:la', 'la prendo'], ['take:lo', 'lo prendo'], ['here_is', 'ecco'], ['euro', 'euro'],
    ['change', 'il resto'], ['notright', 'non è giusto'], ['missing', 'mancano'], ['missing', 'manca'],
    ['roses', 'le rose rosse'], ['roses', 'le rose'], ['roses', 'rose rosse'], ['mazzo', 'il mazzo'], ['mazzo', 'un mazzo'], ['mazzo', 'il mazzo di rose'], ['mazzo', 'questo mazzo']);
  for (let i = 0; i <= 20; i++) P.push(['num:' + i, numIt(i)]);
  return P;
}

Object.assign(LESSON_HOOKS[8], {
  /* the market pack, plus colours, buying, and (at Gino's) the flowers and the numbers 0–20. Before the practice
     (the barrier) only the Lesson 7 tiles. */
  bank(npc, groups){
    if (!l8Vendor(npc)) return null;
    const G = {
      polite:{ label:'Polite', tiles:[...L7_POLITE, L8_PLEASE].map(phraseTile) },
      market:{ label:'Al mercato', tiles:L7_TILES.map(phraseTile) },
      buy:{ label:'Comprare', tiles:L8_BUY.map(phraseTile) },
      colours:{ label:'Colori', tiles:L8_COLOURS.map(phraseTile) },
      flowers:{ label:'Fiori', tiles:L8_FLOWERS.map(phraseTile) },
      nums:{ label:'Numeri', tiles:Array.from({ length:21 }, (_, i) => ({ w:numIt(i), label:numIt(i), gloss:String(i) })) },
      shop:{ label:'Cerco…', tiles:L8_SHOP().map(phraseTile) },
    };
    G.polite.tiles.push(...L8_ADDRESS.map(phraseTile));
    /* what the scene needs first: the colours at Teresa's, the flowers and the numbers at Gino's, the melon and the
       numbers at Pina's. Before the practice (the barrier): what a shopper has from Lessons 6 and 7. */
    const order = !S.vocab8 ? ['polite', 'shop', 'market'] : npc.id === 'gino' ? ['flowers', 'buy', 'nums', 'polite', 'market', 'colours']
      : npc.id === 'pina' ? ['market', 'buy', 'nums', 'polite', 'colours'] : ['colours', 'buy', 'polite', 'market'];
    order.forEach(k => groups.push(G[k]));
    return groups;
  },
  phrases(){ return S.lesson >= 8 ? l8Phrases() : []; },

  react(id, n, st, add, out, ints, k){
    if (!l8Vendor(n)) return false;
    const s = l8St(st), L = S.l8;
    if (id === 'greet'){ s.greeted = true; return false; }
    if (id === 'ask_how' || id === 'answer_how'){ s.how = true; return false; }
    /* 2 · the barrier: greetings and "come sta?" are answered as usual (by the brain); anything else gets her fast
       questions, which follow from what you said (English hidden) */
    if (n.id === 'teresa' && S.tut === 'l8-teresa'){
      if (id === 'thanks' || id === 'bye') return l8Bye(id, n, s, add, out, ints);
      if (id === 'repeat' && !L.barrier && !out.l8barrier) return false;          // (nothing fast said yet: the brain repeats)
      if (L8_SOCIAL.has(id) && id !== 'repeat') return false;
      if (!out.l8barrier){ out.l8barrier = true; out.asked = true; st.lastQ = null; add(l8BarrierLine(ints, L.barrier), null, { rate:1 }); }
      return true;
    }
    if (id === 'repeat') return l8Repeat(n, s, add, out);
    if (id === 'yes' && n.id === 'gino' && s.lastQ === 'mazzo'){
      s.lastQ = null; out.asked = true; add('Bene! Un bel mazzo di rose rosse.', 'Good! A nice bunch of red roses.');
      l8Hint(out, 'Ask how much the bunch is.', null, 'Ask how much the bunch is: <b>quanto costa</b> … <b>il mazzo</b>?'); return true;
    }
    if (id === 'thanks' || id === 'bye') return l8Bye(id, n, s, add, out, ints);
    if (L8_SOCIAL.has(id)) return false;
    /* business: the whole sentence is handled once, at its first business intent. A greeting earlier in the same
       sentence counts ("Buongiorno! Ha una maglietta rossa?"); "come sta?" is optional politeness. */
    if (out.l8biz) return true;
    out.l8biz = true; out.asked = true;
    if (!s.greeted){ add('Buongiorno, eh!', 'Good morning, eh!'); out.l8rude = true; return true; }
    if (st.lastQ === 'how') st.lastQ = null;                                     // (business instead of "sto bene": fine)
    if (ints.includes('have:tu')) l8Hint(out, `${n.name} is a stranger: <b>Ha …?</b> (or <b>Avete …?</b>), not hai.`, 'Consiglio');
    if (n.id === 'teresa' && S.tut === 'l8-colours') l8Colours(n, s, add, out, ints);
    else if (n.id === 'gino' && S.tut === 'l8-roses') l8Roses(n, s, add, out, ints);
    else if (l8Pina(n)) l8Melon(n, s, add, out, ints);
    else l8Idle(n, s, add, out, ints);
    return true;
  },

  afterTurn(n, out){
    if (!l8Vendor(n)) return false;
    const tries = stepTries(convo.st, l8Step(n, convo.st));
    if (out.l8barrier) return l8BarrierTurn();
    if (out.l8rude){ showHint(hintAfter(tries, 'Greet first: market vendors expect a greeting before business.', 'Greet first: <b>Buongiorno!</b> Market vendors expect a greeting before business.'), 'Consiglio'); return true; }
    if (out.l8got){
      sysLine('Teresa folds the red T-shirt and hands it to you. Over at the fruit stall, Mark looks up from his phone and comes over.');
      enqueue(() => { if (S.tut === 'l8-colours') setTut('l8-fitting'); });
      showHint('Got it! Now Mark can try it on. Leave the stall, then talk to Teresa again: Mark is with you now.', 'Fatto!');
      convo.keepHint = true; endConvo();
      return true;
    }
    if (out.l8price){ enqueue(() => { hintEl.hidden = true; }); if (out.l8hint) showHint(out.l8hint.h, out.l8hint.label); l8RosesPad(n); return true; }
    if (out.l8melon){ enqueue(() => { hintEl.hidden = true; }); l8MelonPad(n); return true; }
    if (out.l8change){ enqueue(() => { hintEl.hidden = true; }); l8ChangePad(n); return true; }
    if (out.end) return false;
    if (out.l8hint){ showHint(hintAfter(tries, out.l8hint.h, out.l8hint.strong), out.l8hint.label); return true; }
    /* stuck (three failed attempts at the same step, e.g. after "Che taglia?"): the step's hint */
    if (tries >= HINT_STRONG_AT){ const h = contextHint(false); if (h){ showHint(h); return true; } }
    return false;
  },

  /* the hint at a stall: { h, strong, step } (contextHint, conversation/turns.js). h never contains the Italian answer;
     strong (from the third failed attempt at the step) may name the key words, never the whole sentence. */
  hint(n, st){
    if (S.lesson !== 8 || !S.l8) return null;
    const L = S.l8;
    if (n.id === 'lucia') return S.tut === 'l8-lucia' ? null : L.luciaDone
      ? { h:'Lucia has given you her honest opinion already. Say goodbye.', strong:'Say goodbye: <b>arrivederci</b>.', step:'bye' }
      : { h:'Lucia is sketching. Say hello, politely.', strong:'Say hello, politely: <b>buongiorno</b>.', step:'hello' };
    if (!l8Vendor(n)) return null;
    const P = n.pron[0], step = l8Step(n, st), H = (h, strong) => ({ h, strong, step });
    const again = (what, o) => H(`Didn't catch ${what}? Ask ${o} to say it again.`, `Didn't catch ${what}? Ask ${o} to say it again, politely: <b>ripetere</b>.`);
    switch (step){
      case 'barrier': return H("Tell Teresa what you're looking for: Mark wants the T-shirt in red, size large. Try what you have.",
        "Tell Teresa what you're looking for: <b>cerco</b> … <b>una maglietta</b>.");
      case 'greet': return H('Greet first: market vendors expect a greeting before business.', 'Greet first: <b>Buongiorno!</b>');
      case 'how': return H(`${P} asked how you are.`, `${P} asked how you are: <b>sto bene</b>…`);
      case 'red': return H('Mark wants the red T-shirt.', 'Mark wants the red T-shirt: <b>una maglietta</b> … <b>rossa</b>.');
      case 'size': return H('', 'Mark told you his size.');
      case 'g-price?': return again('the price', 'him');
      case 'g-change?': return again('the change', 'him');
      case 'g-roses': return H('Ask if he has red roses.', 'Ask if he has red roses: <b>le rose rosse</b>.');
      case 'g-price': return H('Ask how much the bunch is.', 'Ask how much the bunch is: <b>quanto costa</b> … <b>il mazzo</b>?');
      case 'g-take': return H("Tell him you'll take it.", "Tell him you'll take it: il mazzo is masculine, so <b>lo</b> …");
      case 'g-pay': return H("Pay with Mark's twenty.", "Pay with Mark's twenty: <b>ecco</b> … <b>venti euro</b>.");
      case 'g-heard': return again('how much change he gave you', 'him');
      case 'g-fix': return H("That's two euros short! Tell him, politely.", "That's two euros short! Tell him the change (<b>il resto</b>) is wrong, and how much is missing (<b>mancano</b>).");
      case 'g-bye': return H('Say thank you and goodbye.', 'Say thank you and goodbye: <b>grazie</b>, <b>arrivederci</b>.');
      case 'p-price?': return again('the price', 'her');
      case 'p-price': return H('The melons look good. If you like, ask how much one is.', 'Ask how much the melon is: <b>quanto costa</b> … <b>il melone</b>?');
      case 'p-buy': return H("Buy it if you like: tell her you'll take it, and pay.", "Tell her you'll take it (il melone is masculine: <b>lo</b> …), and pay: <b>ecco</b> …");
      case 'p-bye': return H('Say thank you and goodbye.', 'Say thank you and goodbye: <b>grazie</b>, <b>arrivederci</b>.');
    }
    return H('Nothing to buy here right now. Say goodbye.', 'Say goodbye: <b>arrivederci</b>.');
  },
});

/* where a stall conversation is: the step whose failed attempts stepTries counts (and whose hint the hook gives) */
function l8Step(n, st){
  const s = l8St(st), L = S.l8;
  if (n.id === 'teresa' && S.tut === 'l8-teresa') return 'barrier';
  if (!s.greeted) return 'greet';
  if (st.lastQ === 'how') return 'how';
  if (n.id === 'teresa' && S.tut === 'l8-colours' && !L.gotShirt) return L.red ? 'size' : 'red';
  if (n.id === 'gino' && S.tut === 'l8-roses'){
    if (L.fixed) return 'g-bye';
    if (s.pending === 'price') return 'g-price?';
    if (s.pending === 'change') return 'g-change?';
    if (!L.rosesAsked) return 'g-roses';
    if (L.rosesPrice === null) return 'g-price';
    if (!L.paid) return s.took ? 'g-pay' : 'g-take';
    return L.heardChange === null ? 'g-heard' : 'g-fix';
  }
  if (l8Pina(n)){
    if (s.pending === 'melon') return 'p-price?';
    if (L.melonPaid) return 'p-bye';
    return L.melonPrice === null ? 'p-price' : 'p-buy';
  }
  return 'idle';
}

/* ---------- the barrier ---------- */
function l8BarrierTurn(){
  const L = S.l8;
  L.barrier++; save();
  if (L.barrier < 2){ showHint("Teresa is talking very fast! Try once more with what you have (Mark wants red, size large), or ask her to say it again."); return true; }
  enqueue(() => { builder.hidden = true; });
  sysLine('You caught <i>maglietta</i>… and nothing else. Colours, sizes, “do you like it?”: time for the handbook, <b>Lezione 8 · Mi piace!</b>');
  enqueue(() => { if (S.tut === 'l8-teresa') setTut(S.vocab8 ? 'l8-colours' : 'l8-handbook'); });
  showChoices([{ label:'Leave', fn:closeDialog }, { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(8); } }]);
  return true;
}

/* ---------- Teresa: a red T-shirt in Mark's size ---------- */
function l8Colours(n, s, add, out, ints){
  const L = S.l8;
  const cols = ints.filter(i => i.startsWith('colour:') || i === 'blue').map(l8Colour);
  const shirt = ints.some(i => i === 'item8:maglietta' || i === 'item7:maglietta' || i === 'this7:f');
  const size = (ints.find(i => i.startsWith('size:')) || '').slice(5) || null;
  if (ints.some(i => i === 'for_friend' || i === 'for_mark' || i === 'subj:him')){ L.friend = true; add('Per il Suo amico? Che gentile!', 'For your friend? How kind!'); }
  if (shirt) L.mentioned = true;
  if (L.gotShirt){ add('Ecco la maglietta: rossa, taglia grande!', "Here's the T-shirt: red, size large!"); return; }
  const give = () => {
    L.gotShirt = true; out.l8got = true; save();
    add('Ecco: la maglietta rossa, taglia grande.', 'Here you are: the red T-shirt, size large.');
  };
  if (cols.length){
    const c = cols[0];
    const said = c.g === 'p' ? (c.c === 'rosso' ? 'rosse' : 'bianche') : c.g === 'n' ? 'il ' + L8_COLOUR[c.c].m : c.g === 'm' ? L8_COLOUR[c.c].m : l8Fem(c.c);
    if (c.g === 'm' || c.g === 'n' || c.g === 'p'){
      L.agree++; save();
      if (L.mentioned){
        add(`Una maglietta… ${said}? Mmm…`, `A T-shirt… ${L8_COLOUR[c.c].en} (masculine)? Hmm…`);
        l8Hint(out, `<i>Maglietta</i> is feminine, so its colour is too: una maglietta <b>${l8Fem(c.c)}</b>, not ${esc(said)}.`, 'Consiglio');
      } else {
        add(`${cap(said)}? Cosa, ${said}?`, `${cap(L8_COLOUR[c.c].en)}? What's ${L8_COLOUR[c.c].en}?`);
        l8Hint(out, `Say what you are looking for, too. And <i>maglietta</i> is feminine: <b>${l8Fem(c.c)}</b>, not ${esc(said)}.`, 'Consiglio');
      }
      return;
    }
    const fem = l8Fem(c.c);
    if (!L.mentioned){
      add(`${cap(fem)}? Cosa, ${fem}?`, `${cap(L8_COLOUR[c.c].en)}? What's ${L8_COLOUR[c.c].en}?`);
      l8Hint(out, "Say what you are looking for, too: she doesn't know what you mean.", null, 'Say what you are looking for, too: <b>una maglietta</b> …'); return;
    }
    if (c.c === 'blu'){ add('La blu? È finita, mi dispiace! Rossa, bianca o nera?', "The blue one? It's sold out, I'm sorry! Red, white or black?"); l8Hint(out, 'Mark wants the red T-shirt.', null, 'Mark wants the red T-shirt: <b>rossa</b>.'); return; }
    if (c.c !== 'rosso'){
      if (c.c === 'bianco' || c.c === 'nero') add(`${cap(fem)}? Sì, certo. E anche rossa.`, `${cap(L8_COLOUR[c.c].en)}? Yes, of course. And red too.`);
      else add(`${cap(fem)}? No, mi dispiace. Solo rossa, bianca e nera.`, `${cap(L8_COLOUR[c.c].en)}? No, I'm sorry. Only red, white and black.`);
      l8Hint(out, 'Mark wants the red T-shirt.', null, 'Mark wants the red T-shirt: <b>rossa</b>.'); return;
    }
    if (!L.red){
      L.red = true; save();
      add('Rossa? Sì! E anche bianca e nera. La blu è finita, mi dispiace.', "Red? Yes! And white and black too. The blue one is sold out, I'm sorry.");
    }
    const sz = size || L.size;
    if (sz === 'grande' || sz === 'xl'){ give(); return; }
    if (sz === 'piccola' || sz === 'piccolo'){ add('Piccola? Per Lei?', 'Small? For you?'); l8Hint(out, 'Is that Mark\'s size?', null, 'Mark told you his size.'); return; }
    add('Che taglia?', 'What size?'); s.lastQ = 'size';                     // (no hint: understanding her is the task)
    return;
  }
  if (size){
    if (size === 'piccolo'){ add('Piccolo?', 'Small (masculine)?'); l8Hint(out, '<i>Taglia</i> and <i>maglietta</i> are feminine: <b>piccola</b>, not piccolo. But is that Mark\'s size?', 'Consiglio'); return; }
    if (size === 'piccola'){ add('Piccola? Per Lei?', 'Small? For you?'); l8Hint(out, 'Is that Mark\'s size?', null, 'Mark told you his size.'); return; }
    if (!L.red){ L.size = size; save(); add('Taglia grande, sì. Ma… di che colore?', 'Size large, yes. But… what colour?'); s.lastQ = 'colour'; l8Hint(out, 'Mark wants the red T-shirt.', null, 'Mark wants the red T-shirt: <b>rossa</b>.'); return; }
    give(); return;
  }
  if (shirt){
    if (L.red){ add('La maglietta rossa, sì. Che taglia?', 'The red T-shirt, yes. What size?'); s.lastQ = 'size'; return; }
    add('Una maglietta? Sì! Di che colore?', 'A T-shirt? Yes! What colour?'); s.lastQ = 'colour';
    l8Hint(out, 'Mark wants the red T-shirt.', null, 'Mark wants the red T-shirt: <b>rossa</b>.'); return;
  }
  if (ints.includes('ask_cost') || ints.includes('how_much')){ const p = l8ShirtPrice(); add(`La maglietta? ${l7PriceLine('teresa', p).it}`, `The T-shirt? ${l7PriceLine('teresa', p).en}`); return; }
  if (l8Likes(n, add, out, ints)) return;
  if (L.friend) return;
  if (L.red){ add('Sì? Che taglia?', 'Yes? What size?'); s.lastQ = 'size'; return; }
  add('Mmm? Cosa cerca?', 'Hmm? What are you looking for?');
  l8Hint(out, 'Mark wants the red T-shirt.', null, 'Mark wants the red T-shirt: <b>una maglietta</b> … <b>rossa</b>.');
}

/* mi piace / Le piace / ti piace, anywhere at the market */
function l8Likes(n, add, out, ints){
  if (ints.includes('like:ti')){ add('A me? Sì, mi piace!', 'Me? Yes, I like it!'); l8Hint(out, `${n.name} is a stranger: <b>Le piace?</b>, not ti piace.`, 'Consiglio'); return true; }
  if (ints.includes('like:le')){ add('A me? Sì, mi piace molto!', 'Me? Yes, I like it a lot!'); return true; }
  if (ints.includes('like:me')){ add('Le piace? Bene!', 'You like it? Good!'); return true; }
  if (ints.includes('dislike:me')){ add('No? Peccato!', 'No? Shame!'); return true; }
  return false;
}

/* ---------- Gino: red roses, and the wrong change ---------- */
function l8Roses(n, s, add, out, ints){
  const L = S.l8, p = l8RosesPrice();
  const roses = ints.includes('roses'), mazzo = ints.includes('mazzo') || ints.includes('item7:fiori');
  const take = ints.find(i => i.startsWith('take:')), pay = ints.includes('here_is');
  const askPrice = ints.includes('ask_cost') || ints.includes('how_much');
  if (L.fixed){ add('Ecco le rose! Buona serata!', 'Here are the roses! Have a nice evening!'); return; }
  /* the change is wrong */
  if (ints.includes('missing') || ints.includes('notright') || ints.includes('change')){
    if (!L.paid){ add('Il resto? Ma… non ha ancora pagato!', "The change? But… you haven't paid yet!"); return; }
    const m = ints.includes('missing') ? l8Num(ints, 'missing') : null;
    if (m === 2){
      L.fixed = true; if (L.heardChange === null) L.heardChange = l8WrongChange(); s.pending = null; save();
      add('Oh! Mi scusi! Ha ragione. Ecco due euro.', "Oh! I'm sorry! You're right. Here are two euros.");
      out.l8fixed = true;
      l8Hint(out, `Now you have the right change: <b>€ ${l8RightChange()}</b>. Say thank you and goodbye.`, 'Fatto!');
      return;
    }
    if (m !== null){
      add(`${cap(numIt(m))} euro? Mmm… vediamo…`, `${cap(NUM_EN[m])} ${m === 1 ? 'euro' : 'euros'}? Hmm… let's see…`);
      l8Hint(out, `Count again: 20 − ${p} = ${l8RightChange()}, and he gave you ${L.heardChange ?? l8WrongChange()}. How many euros are missing?`); return;
    }
    const much = 'Say how much is missing.', muchStrong = 'Say how much is missing: <b>mancano</b>, the number (<b>Numeri</b> tiles), <b>euro</b>.';
    if (ints.includes('missing')){ add('Mancano… quanto?', "Missing… how much?"); l8Hint(out, much, null, muchStrong); return; }
    add('Non è giusto? Mmm… quanto manca?', "Not right? Hmm… how much is missing?");
    l8Hint(out, much, null, muchStrong); return;
  }
  if (take === 'take:la'){
    L.lo++; save();
    add('La…? Il mazzo?', 'It (feminine)…? The bunch?');
    l8Hint(out, '<b>Il</b> mazzo is masculine: <b>lo</b> prendo.', 'Consiglio'); return;
  }
  if (roses) L.rosesAsked = true;
  if (take || pay){
    if (!L.rosesAsked){ add('Prende… cosa?', "You'll take… what?"); l8Hint(out, 'First ask for red roses.', null, 'First ask for red roses: <b>le rose rosse</b>.'); return; }
    if (L.rosesPrice === null){ l8SayPrice(n, s, add, out); return; }
    if (L.paid){ add('Ha già pagato! Ecco il resto.', "You've already paid! Here's your change."); return; }
    if (take) s.took = true;
    if (!pay){ add(`Bene! Sono ${numIt(p)} euro.`, `Good! That's ${NUM_EN[p]} euros.`); l8Hint(out, "Pay with Mark's twenty.", null, "Pay with Mark's twenty: <b>ecco</b> … <b>venti euro</b>."); return; }
    const x = l8Num(ints, 'here_is');
    if (x === null){ add('Ecco… quanto?', "Here's… how much?"); l8Hint(out, 'Say the amount, too: you have Mark\'s twenty.', null, 'Say the amount, too: <b>venti euro</b>.'); return; }
    if (x !== 20){ add(`${cap(numIt(x))} euro? Sono ${numIt(p)} euro.`, `${cap(NUM_EN[x])} euros? It's ${NUM_EN[p]} euros.`); l8Hint(out, "You have Mark's twenty-euro note.", null, "You have Mark's twenty-euro note: <b>venti</b>."); return; }
    L.paid = true; s.pending = 'change'; s.wrong = 0; save();
    const line = l8ChangeLine(l8WrongChange());
    add(line.it, line.en, { listen:true });
    out.l8change = true; return;
  }
  if (askPrice || (mazzo && L.rosesAsked)){
    if (!L.rosesAsked){ add('Quale? Le rose, i tulipani, le margherite…?', 'Which ones? Roses, tulips, daisies…?'); l8Hint(out, 'First ask for red roses.', null, 'First ask for red roses: <b>le rose rosse</b>.'); return; }
    l8SayPrice(n, s, add, out); return;
  }
  if (roses){ add('Le rose rosse? Sì! Un bel mazzo?', 'Red roses? Yes! A nice bunch?'); s.lastQ = 'mazzo'; l8Hint(out, 'Ask how much the bunch is.', null, 'Ask how much the bunch is: <b>quanto costa</b> … <b>il mazzo</b>?'); return; }
  if (mazzo){ add('Un mazzo? Di cosa? Rose, tulipani…?', 'A bunch? Of what? Roses, tulips…?'); l8Hint(out, 'Say what flowers: Lucia said red roses.', null, 'Say what flowers: <b>le rose rosse</b>.'); return; }
  if (l8Likes(n, add, out, ints)) return;
  add('Mmm? Cosa cerca?', 'Hmm? What are you looking for?');
  l8Hint(out, 'Ask for red roses.', null, 'Ask for red roses: <b>le rose rosse</b>.');
}
/* the price of the roses: a listening line the first time, then the notepad */
function l8SayPrice(n, s, add, out){
  const p = l8RosesPrice(), line = l7PriceLine('gino', p), noted = S.l8.rosesPrice !== null;
  add('Il mazzo di rose rosse?', 'The bunch of red roses?');
  add(line.it, line.en, noted ? undefined : { listen:true });
  if (noted){ l8Hint(out, "Tell him you'll take it.", null, "Tell him you'll take it: il mazzo is masculine, so <b>lo</b> …"); return; }
  s.pending = 'price'; s.wrong = 0; out.l8price = true; S.l8.priceSaid = true;
}
/* Può ripetere? / Non ho capito: the price or the change again, slowly */
function l8Repeat(n, s, add, out){
  if (l8Pina(n) && s.pending === 'melon'){
    const line = l7PriceLine('pina', S.l7.prices.melone);
    add('Sì, certo!', 'Yes, of course!'); add(line.it, line.en, { listen:true, rate:0.7 });
    out.asked = true; out.l8melon = true; return true;
  }
  if (n.id !== 'gino' || S.tut !== 'l8-roses') return false;
  const L = S.l8;                       /* (a conversation closed half-way: what was still to be written down) */
  if (!s.pending) s.pending = L.paid && L.heardChange === null ? 'change' : L.rosesAsked && L.rosesPrice === null && L.priceSaid ? 'price' : null;
  if (!s.pending) return false;
  const line = s.pending === 'price' ? l7PriceLine('gino', l8RosesPrice()) : l8ChangeLine(l8WrongChange());
  add('Sì, certo!', 'Yes, of course!'); add(line.it, line.en, { listen:true, rate:0.7 });
  out.asked = true; if (s.pending === 'price') out.l8price = true; else out.l8change = true;
  return true;
}
/* grazie / arrivederci: not before the change is right */
function l8Bye(id, n, s, add, out, ints){
  const L = S.l8;
  out.asked = true;
  if (n.id === 'gino' && S.tut === 'l8-roses' && L.paid && !L.fixed && !out.l8bye){
    out.l8bye = true; add('Prego!', "You're welcome!");
    l8Hint(out, `Wait! Count Mark's change before you go: 20 − ${l8RosesPrice()} = ${l8RightChange()}, and he gave you ${L.heardChange ?? l8WrongChange()}. Tell him, politely.`, 'Attenzione');
    return true;
  }
  if (out.l8bye) return true;
  if (id === 'thanks' && (ints || []).includes('bye')) return true;           // the goodbye answers both
  out.l8bye = true;
  const busy = (n.id === 'teresa' && S.tut === 'l8-colours' && !L.gotShirt) || (n.id === 'gino' && S.tut === 'l8-roses' && !L.paid && L.rosesAsked);
  if (id === 'thanks' && busy){ add('Prego!', "You're welcome!"); return true; }
  add(id === 'bye' || !busy ? 'Prego! Arrivederci, buona giornata!' : 'Prego!', id === 'bye' || !busy ? "You're welcome! Goodbye, have a nice day!" : "You're welcome!");
  if (id === 'bye' || !busy) out.end = true;
  return true;
}
/* ---------- Pina: the melon (optional; it doesn't change the lesson's progress) ----------
   Quanto costa il melone? → the price by ear (a listening line, then the notepad) → Lo prendo. Ecco … euro (any amount
   at least the price) → the right change, as a listening line → grazie, arrivederci. Il melone is masculine: lo prendo. */
function l8Melon(n, s, add, out, ints){
  const L = S.l8, p = S.l7.prices.melone, line = l7PriceLine('pina', p);
  const take = ints.find(i => i.startsWith('take:')), pay = ints.includes('here_is');
  const askPrice = ints.includes('ask_cost') || ints.includes('how_much');
  const melon = ints.some(i => i === 'item7:melone' || i.startsWith('this7:'));
  if (ints.includes('this7:f')) l8Hint(out, '<b>Il</b> melone is masculine: <b>questo</b>, not questa.', 'Consiglio');
  if (L.melonPaid){ add('Il melone è Suo! È dolcissimo.', "The melon is yours! It's very sweet."); return; }
  if (take === 'take:la'){
    L.lo++; save();
    add('La…? Il melone?', 'It (feminine)…? The melon?');
    l8Hint(out, '<b>Il</b> melone is masculine: <b>lo</b> prendo.', 'Consiglio'); return;
  }
  if (take || pay){
    if (L.melonPrice === null){ add('Il melone? Certo!', 'The melon? Of course!'); add(line.it, line.en, { listen:true }); s.pending = 'melon'; s.wrong = 0; out.l8melon = true; return; }
    if (take) s.took = true;
    if (!pay){ add(`Bene! ${line.it}`, `Good! ${line.en}`); l8Hint(out, 'Now pay her.', null, 'Now pay her: <b>ecco</b> … <b>euro</b>.'); return; }
    const x = l8Num(ints, 'here_is');
    if (x === null){ add('Ecco… quanto?', "Here's… how much?"); l8Hint(out, 'Say the amount, too.', null, 'Say the amount, too: a number (<b>Numeri</b> tiles) and <b>euro</b>.'); return; }
    if (x < p){ add(`${cap(numIt(x))} euro? Eh, no! ${line.it}`, `${cap(NUM_EN[x])} ${x === 1 ? 'euro' : 'euros'}? Oh, no! ${line.en}`); l8Hint(out, `That's not enough: the melon is € ${p}.`); return; }
    L.melonPaid = x; save(); renderHUD();
    if (x > p){ const c = l8ChangeLine(x - p); add(c.it, c.en, { listen:true }); }
    else add('Grazie! Giusto così.', "Thank you! That's exactly right.");
    l8Hint(out, x > p ? 'A melon! Count your change (listen again if you like), then say thank you and goodbye.' : 'A melon! Now say thank you and goodbye.', 'Fatto!');
    return;
  }
  if (askPrice){
    if (L.melonPrice !== null){ add(`Il melone? ${line.it}`, `The melon? ${line.en}`); l8Hint(out, "Buy it if you like: tell her you'll take it.", null, "Tell her you'll take it: il melone is masculine, so <b>lo</b> …"); return; }
    add('Il melone?', 'The melon?'); add(line.it, line.en, { listen:true });
    s.pending = 'melon'; s.wrong = 0; out.l8melon = true; return;
  }
  if (melon){ add('Il melone? Sì, bello! È dolcissimo.', "The melon? Yes, a lovely one! It's very sweet."); l8Hint(out, 'If you like, ask how much it is.', null, 'Ask how much it is: <b>quanto costa</b> …'); return; }
  if (l8Likes(n, add, out, ints)) return;
  add('Mmm? Mi dica.', 'Hmm? Go ahead.');
}
/* the notepad at Pina's: the price of the melon */
function l8MelonPad(n){
  const s = l8St(convo.st), p = S.l7.prices.melone;
  askNumber({ label:'il melone', tip:'What did Pina say? Write it in digits.', onAnswer(x){
    if (!convo || convo.npc !== n) return true;
    if (x === p){
      revealListen({ all:true });
      S.l8.melonPrice = p; s.pending = null; save(); renderHUD();
      sysLine(`You write it down: <b>il melone · € ${p}</b>`);
      npcLine('È dolcissimo, eh!', "It's very sweet, eh!");
      showHint("Written down! Buy it if you like: tell her you'll take it.", 'Fatto!');
      return true;
    }
    s.wrong++;
    sysLine(`You write <b>€ ${x}</b>. Hmm… is that what she said?`);
    if (s.wrong === 1){ showHint('Not sure? Ask her to say it again, slowly. Your <b>Polite</b> tiles have a way to say it.'); return true; }
    revealListen({ all:true });
    showHint('Read the price above. Look the number up in the dictionary (<b>Numeri 0–20</b>), then write it in digits.');
    return false;
  } });
}

/* any other stall, or a stall outside its scene: prices, likes, a chat */
function l8Idle(n, s, add, out, ints){
  if (ints.includes('ask_cost') || ints.includes('how_much')){
    const V = L7_STALLS[n.id], p = S.l7.prices[V.item], line = l7PriceLine(n.id, p);
    add(`${V.ask.it} ${line.it}`, `${V.ask.en} ${line.en}`); return;
  }
  if (l8Likes(n, add, out, ints)) return;
  add('Mmm? Mi dica.', 'Hmm? Go ahead.');
}

/* Mark's notepad at Gino's: the price of the roses */
function l8RosesPad(n){
  const s = l8St(convo.st), p = l8RosesPrice();
  askNumber({ label:'il mazzo di rose', tip:'What did Gino say? Write it in digits.', onAnswer(x){
    if (!convo || convo.npc !== n) return true;
    if (x === p){
      revealListen({ all:true });
      S.l8.rosesPrice = p; s.pending = null; save(); renderHUD();
      sysLine(`Mark's notepad: <b>il mazzo di rose · € ${p}</b>`);
      npcLine('Sono bellissime, eh?', "They're beautiful, eh?");
      showHint("Written down! Tell him you'll take it.", 'Fatto!');
      return true;
    }
    s.wrong++;
    sysLine(`You write <b>€ ${x}</b>. Hmm… is that what he said?`);
    if (s.wrong === 1){ showHint('Not sure? Ask him to say it again, slowly. Your <b>Polite</b> tiles have a way to say it.'); return true; }
    revealListen({ all:true });
    showHint('Read the price above. Look the number up in the dictionary (<b>Numeri 0–20</b>), then write it in digits.');
    return false;
  } });
}
/* Mark's notepad at Gino's: the change. Write what you heard; the notepad shows what it should be. */
function l8ChangePad(n){
  const s = l8St(convo.st), p = l8RosesPrice(), heard = l8WrongChange(), right = l8RightChange();
  askNumber({ label:'il resto', tip:'How much change did Gino give you? Write what you heard.', notes:[{ label:'il mazzo di rose', value:p }, { label:'pagato (paid)', value:20 }],
    onAnswer(x){
      if (!convo || convo.npc !== n) return true;
      if (x === heard){
        revealListen({ all:true });
        S.l8.heardChange = x; s.pending = null; save(); renderHUD();
        sysLine(`You count it: <b>€ ${x}</b>. But Mark's notepad says 20 − ${p} = <b>${right}</b>.`);
        showHint("That's two short! Tell him politely: “Excuse me, the change isn't correct. It's missing two euros.”", 'Attenzione');
        return true;
      }
      s.wrong++;
      if (x === right) sysLine(`You write <b>€ ${x}</b>: that's what it <i>should</i> be (20 − ${p}). But is it what Gino gave you? Listen again.`);
      else sysLine(`You write <b>€ ${x}</b>. Hmm… is that what he said?`);
      if (s.wrong === 1 && x !== right){ showHint('Not sure? Ask him to say it again, slowly. Your <b>Polite</b> tiles have a way to say it.'); return true; }
      if (s.wrong >= 2) revealListen({ all:true });
      showHint(s.wrong >= 2 ? 'Read what Gino said above, then write it in digits.' : 'Press <b>🔊 Ascolta di nuovo</b> to hear it again, and write what <i>he</i> said.');
      return false;
    } });
}
