/* Lesson 4. Lesson-specific conversation engine. */

/* =========================================================
   LESSON 4: ordering lunch for two at Caffè Aurora
   ========================================================= */
/* Turn the intent stream into acts with a "who": per me / per lui / io / lui and the
   verb ending all decide who an order or a restriction belongs to. */
const VFORMS = { want:['vorrei','vorrebbe'], can:['posso','può'], eat:['mangio','mangia'], is:['sono','è'] };
function interpretL4(ints){
  const acts = []; let cur = null, lastItems = [], lastPron = null, neg = false, restrictWho = null, asking = false;
  const isItem = id => !!id && id.startsWith('food:');
  for (let k = 0; k < ints.length; k++){
    const id = ints[k], prev = ints[k - 1];
    if (id === 'subj:me' || id === 'subj:him'){
      const who = id.slice(5);
      const afterItem = isItem(prev) || (prev === 'please' && isItem(ints[k - 2]));
      if (afterItem && lastItems.length && !(cur && cur.explicit)) lastItems.forEach(a => a.who = who);
      lastItems = []; cur = { who, explicit:true }; continue;
    }
    if (id === 'and'){ if (cur) cur = { who:cur.who, explicit:false }; lastItems = []; lastPron = null; neg = false; restrictWho = null; continue; }
    if (id === 'pron:me' || id === 'pron:him'){ lastPron = id.slice(5); if (!(cur && cur.explicit)) cur = { who:lastPron, explicit:false }; lastItems = []; continue; }
    if (id === 'not'){ neg = true; continue; }
    const vm = id.match(/^(want|can|eat|is):(me|him)$/);
    if (vm){
      const [, verb, who] = vm;
      if (lastPron && lastPron !== who) return { error:{ pron:lastPron, verb, who } };
      if (!(cur && cur.explicit)){ cur = { who, explicit:false }; lastItems = []; }
      if ((verb === 'can' || verb === 'eat') && neg) restrictWho = who;
      if (verb === 'is'){ if (ints[k + 1] === 'veg'){ acts.push({ t:'restrict', who, item:'veg' }); k++; } else acts.push({ t:'noop' }); }
      continue;
    }
    if (id === 'eat') continue;
    if (id === 'veg'){ acts.push({ t:'restrict', who:lastPron || 'him', item:'veg' }); continue; }
    if (id === 'have'){ asking = true; continue; }
    if (isItem(id)){
      const key = id.slice(5);
      if (restrictWho){ acts.push({ t:'restrict', who:restrictWho, item:key }); continue; }
      if (asking){ acts.push({ t:'ask', item:key }); continue; }
      if (neg){ acts.push({ t:'noop' }); continue; }
      const a = { t:'order', who:cur ? cur.who : null, item:key };
      acts.push(a); lastItems.push(a); continue;
    }
    acts.push({ t:id });
  }
  return { acts };
}
function agreeMsg(e){
  const P = e.pron === 'him' ? 'Lui' : 'Io', right = VFORMS[e.verb][e.pron === 'him' ? 1 : 0], wrong = VFORMS[e.verb][e.who === 'him' ? 1 : 0];
  return `<b>${P}</b> needs the ${e.pron === 'him' ? '“he”' : '“I”'} form of the verb: <b>${P.toLowerCase()} ${right}</b>, not <b>${wrong}</b>.`;
}

function currentWish(){
  const L = S.l4;
  if (!L.askedPizza) return "Can you ask him if they have pizza? I've been dreaming about real Italian pizza.";
  if (!L.himVeg) return "Tell him I'm vegetarian. I can't eat meat.";
  if (!L.him.dish) return "Tell him I'd like the mushroom risotto, please.";
  if (!L.me.dish) return 'Your turn! Order whatever you like.';
  if (!L.him.drink) return 'Just a sparkling water for me, please.';
  if (!L.served) return 'I hope the food comes soon…';
  if (!L.billAsked) return 'Could you ask for the bill?';
  return 'Say thanks for us!';
}
function l4Hint(withModel){
  const L = S.l4;
  let h, m;
  if (!L.askedPizza){ h = 'Ask if they have pizza. Use <b>Avete …?</b> (do you have …?).'; m = 'Scusi, avete la pizza?'; }
  else if (!L.himVeg){ h = 'Tell the waiter Mark is vegetarian: <b>lui è …</b> or <b>lui non può mangiare …</b>'; m = 'Lui è vegetariano. Non può mangiare la carne.'; }
  else if (!L.him.dish){ h = 'Order for Mark with <b>per lui</b> or <b>lui vorrebbe</b>.'; m = 'Per lui, il risotto ai funghi, per favore.'; }
  else if (!L.me.dish){ h = 'Order for yourself with <b>per me</b> or <b>vorrei</b>.'; m = 'Per me, la lasagna, per favore.'; }
  else if (!L.him.drink){ h = "Mark wants sparkling water: <b>per lui</b> + <b>un'acqua frizzante</b>."; m = "Per lui, un'acqua frizzante, per favore."; }
  else if (!L.served){ h = 'The food is on its way.'; m = 'Grazie!'; }
  else if (!L.billAsked){ h = 'Ask for the bill: <b>il conto</b> + <b>per favore</b>.'; m = 'Il conto, per favore.'; }
  else { h = 'Say thank you.'; m = 'Grazie!'; }
  return h + (withModel ? ` Try: <b>${esc(m)}</b>` : '');
}
function billTotal(){
  const L = S.l4;
  return [L.him.dish, L.me.dish, L.him.drink, L.me.drink].filter(Boolean).reduce((a, k) => a + FOOD[k].price, 0) + 2 * COPERTO;
}

/* Mark steps in before the waiter answers when you are about to get it wrong */
function markObjection(acts){
  const L = S.l4;
  for (const a of acts){
    if (a.t === 'order' && a.who === 'him'){
      const f = FOOD[a.item], drink = isDrink(a.item);
      if (isIngr(a.item)) continue;
      if (!drink && !L.askedPizza) return { text:'Hold on! Ask him about the pizza first.', hint:'Mark wants to know about pizza first: <b>Avete la pizza?</b>' };
      if (!drink && !L.himVeg) return { text:"Wait, tell him I'm vegetarian first, so he knows what I can eat.", hint:'<b>Lui è vegetariano.</b> or <b>Lui non può mangiare la carne.</b>' };
      if (f.tags && f.tags.includes('carne')) return { text:`I can't eat ${f.en}, it has meat!`, hint:'Pick something vegetarian for Mark. The waiter listed three options.' };
      if (f.tags && f.tags.includes('pesce')) return { text:"Fish isn't vegetarian! I'd love the mushroom risotto.", hint:'<b>Per lui, il risotto ai funghi.</b>' };
      if (a.item === 'tiramisu') return { text:'Dessert first? Ha. Let me start with the risotto.', hint:'<b>Per lui, il risotto ai funghi.</b>' };
      if (drink && a.item !== 'frizzante') return { text:`Not ${f.en}. A sparkling water, please!`, hint:"Frizzante = sparkling: <b>un'acqua frizzante</b>." };
    }
    if (a.t === 'restrict'){
      if (!L.askedPizza) return { text:"First, can you ask if they have pizza? Then we'll sort out the rest.", hint:'<b>Avete la pizza?</b>' };
      if (a.who === 'me' && !L.himVeg && (a.item === 'carne' || a.item === 'veg'))
        return { text:'Not you, me! You just told him that YOU can\'t eat meat. Say that HE can\'t.', hint:'<b>posso</b> = I can, <b>può</b> = he can. <b>mangio</b> = I eat, <b>mangia</b> = he eats. Try <b>Lui non può mangiare la carne.</b>' };
      if (a.who === 'him' && a.item === 'formaggio') return { text:"Cheese is fine! It's meat I can't eat.", hint:'<b>la carne</b> = meat, <b>il formaggio</b> = cheese.' };
      if (a.who === 'him' && a.item === 'pesce_i') return { text:"I don't eat fish either, but meat is the big one. Tell him I can't eat meat.", hint:'<b>la carne</b> = meat.' };
    }
  }
  return null;
}

/* the waiter's answer to everything you said this turn */
function waiterTurn(acts){
  const L = S.l4, out = { lines:[], events:[], progressed:false, price:0, end:false };
  const ack = [], ackEn = [];
  const a1 = (it, en) => { ack.push(it); ackEn.push(en); };
  const flush = () => { if (ack.length){ out.lines.push({ it:ack.join(' '), en:ackEn.join(' ') }); ack.length = 0; ackEn.length = 0; } };
  const big = (it, en) => { flush(); out.lines.push({ it, en }); };
  const forMe = acts.some(a => a.t === 'order' && a.who === 'me'), forHim = acts.some(a => a.t === 'order' && a.who === 'him');
  for (const a of acts){
    const f = a.item && FOOD[a.item];
    switch (a.t){
      case 'greet': if (!convo.greeted){ a1('Buongiorno!', 'Good morning!'); convo.greeted = true; } break;
      case 'ask_how': a1('Bene, grazie!', 'Fine, thanks!'); break;
      case 'ask':
        out.progressed = true;
        if (a.item === 'pizza'){ big('No, mi dispiace. La pizza solo la sera.', 'No, sorry. Pizza only in the evening.'); if (!L.askedPizza){ L.askedPizza = true; out.events.push('pizza'); } }
        else if (isIngr(a.item)) a1(`${cap(f.label)}? Sì.`, `${cap(f.en)}? Yes.`);
        else a1(`${cap(f.label)}? Sì, certo!`, `${cap(f.en)}? Yes, of course!`);
        break;
      case 'restrict':
        out.progressed = true;
        if (a.who === 'him' && (a.item === 'carne' || a.item === 'veg')){
          if (!L.himVeg){ L.himVeg = true; out.events.push('veg');
            big('Ah, è vegetariano! Allora, per lui: gli spaghetti al pomodoro, il risotto ai funghi o la parmigiana di melanzane.',
                "Ah, he's vegetarian! Then for him: spaghetti with tomato sauce, mushroom risotto or aubergine parmigiana."); }
          else a1('Sì, sì, niente carne.', 'Yes, yes, no meat.');
        } else {
          const noun = a.item === 'veg' ? 'carne' : f.label.split(' ').slice(1).join(' ');
          a1(`Va bene, niente ${noun}.`, `All right, no ${a.item === 'veg' ? 'meat' : f.en}.`);
        }
        break;
      case 'order': {
        if (isIngr(a.item)){ a1('Eh? Quale piatto?', 'Huh? Which dish?'); break; }
        if (!a.who){ big(`${cap(f.label)}… per chi?`, `${cap(f.en)}… for whom?`); out.events.push('forwhom'); break; }
        out.progressed = true;
        const slot = isDrink(a.item) ? 'drink' : 'dish';
        L[a.who][slot] = a.item;
        a1(`${cap(f.label)} per ${a.who === 'me' ? 'Lei' : 'lui'}.`, `${cap(f.en)} for ${a.who === 'me' ? 'you' : 'him'}.`);
        if (a.who === 'me' && a.item === 'risotto' && !L.him.dish) out.events.push('selfRisotto');
        if (a.who === 'him' && slot === 'dish') out.events.push('himDish');
        break;
      }
      case 'bill':
        out.progressed = true;
        if (!L.served) a1('Il conto? Ma… non avete ancora mangiato!', "The bill? But… you haven't eaten yet!");
        else { const p = billTotal(); big(`Ecco il conto. ${priceIt(p)}`, `Here's the bill. That's ${euroEn(p)}.`); out.price = p; if (!L.billAsked){ L.billAsked = true; } out.events.push('bill'); }
        break;
      case 'thanks':
        if (L.p5){ big('Grazie a voi! Buona giornata!', 'Thank you both! Have a nice day!'); L.done = true; out.end = true; }
        else if (L.served) a1('Prego!', "You're welcome!");
        break;
      case 'excuse': if (acts.length === 1) a1('Sì?', 'Yes?'); break;
    }
  }
  if (!out.end && !out.events.includes('bill') && L.himVeg && !out.events.includes('veg') && !L.served){
    if (!L.him.dish && forMe) a1('E per lui?', 'And for him?');
    else if (L.him.dish && !L.me.dish && forHim) a1('E per Lei?', 'And for you?');
    else if (L.him.dish && L.me.dish && !L.him.drink && !L.drinkAsked){ a1('E da bere?', 'And to drink?'); L.drinkAsked = true; out.events.push('drinkQ'); }
    else if (L.him.dish && L.me.dish && L.him.drink){ a1('Va bene! Arrivo subito.', 'Very good! Coming right up.'); out.events.push('serve'); }
  }
  flush();
  return out;
}

function runSeq(steps, done){
  let i = 0;
  const next = () => { if (!convo) return; if (i < steps.length) steps[i++](next); else if (done) done(); };
  next();
}
function fadeMsg(title, sub, cb){
  const f = $('#fade'); $('#fadeTitle').textContent = title; $('#fadeSub').textContent = sub;
  f.classList.add('on');
  setTimeout(() => { cb(); f.classList.remove('on'); }, RM ? 400 : 1600);
}
function pricePrompt(p, cb){
  const e = Math.floor(p / 100), c = p % 100;
  const TEEN = { 0:10, 10:11, 20:12, 30:13, 40:14, 50:15, 60:16, 70:17, 80:18, 90:19 };
  const alts = [(e + 10) * 100 + c, e * 100 + (TEEN[c] ?? (c + 5) % 100)];
  translatePrompt('How much is it?', [euroEn(alts[0]), euroEn(p), euroEn(alts[1])], 1, () => { companionLine(`${euroEn(p)} for both of us? Not bad at all.`); cb(); },
    'Look at the price again. Italian writes a comma where English writes a point: <i>1,20 euro</i> is €1.20.');
}

function afterL4(out){
  const L = S.l4, steps = [];
  let hint = null, label = 'Suggerimento';
  const ev = e => out.events.includes(e);
  const mark = t => steps.push(n => setTimeout(() => { companionLine(t); n(); }, 500));
  if (ev('pizza') && !L.p1) steps.push(n => setTimeout(() => translatePrompt('What did he say?',
    ['They only make pizza in the evening.', 'The pizza takes half an hour.', 'Pizza is the house speciality.'], 0,
    () => { L.p1 = true; save(); companionLine("Only in the evening? Classic. OK, plan B: tell him I'm vegetarian. I can't eat meat."); n(); },
    '<i>Solo</i> = only, <i>la sera</i> = the evening.'), 500));
  if (ev('veg') && !L.p2) steps.push(n => setTimeout(() => translatePrompt('What can I have?',
    ['Spaghetti with tomato sauce, mushroom risotto or aubergine parmigiana.', 'Lasagna, roast chicken or the fish of the day.', 'Only the mixed salad.'], 0,
    () => { L.p2 = true; save(); companionLine("Mushroom risotto, definitely. Tell him I'd like the risotto, please."); n(); },
    'Check the menu in your handbook: <i>funghi</i> are mushrooms, <i>melanzane</i> are aubergines.'), 500));
  if (ev('selfRisotto')){
    mark('Ha! You just ordered the risotto for yourself. “Vorrei” means “I\'d like”. For me it\'s “lui vorrebbe”, or just “per lui”.');
    hint = '<b>vorrei</b> = I would like, <b>vorrebbe</b> = he would like. Or say <b>Per lui, il risotto ai funghi.</b>'; label = 'Consiglio';
  } else if (ev('himDish') && !L.me.dish) mark(L.him.dish === 'risotto' ? 'Perfect! Your turn, order whatever you like.' : 'That works! Your turn, order whatever you like.');
  if (ev('drinkQ') && !L.p3) steps.push(n => setTimeout(() => translatePrompt('What did he ask?',
    ['And to drink?', 'Anything else to eat?', 'Are you ready for dessert?'], 0,
    () => { L.p3 = true; save(); companionLine('Just a sparkling water for me, please. And get whatever you like!'); n(); },
    '<i>Bere</i> means “to drink”.'), 500));
  if (ev('forwhom')){ hint = 'He asked <i>per chi?</i>: for whom? Start with <b>per me</b> or <b>per lui</b>.'; }
  if (ev('serve')) steps.push(n => setTimeout(() => fadeMsg("Mezz'ora dopo…", 'Half an hour later', () => {
    L.served = true; save();
    npcLine('Ecco qua. Buon appetito!', null);
    setTimeout(() => { companionLine(`Wow. The ${FOOD[L.him.dish].en.replace(/^(the|a) /, '')} is incredible. OK, could you ask for the bill?`); n(); }, 900);
  }), 700));
  if (ev('bill')){
    if (!L.p4) steps.push(n => setTimeout(() => pricePrompt(out.price, () => { L.p4 = true; save(); n(); }), 500));
    if (!L.p5) steps.push(n => setTimeout(() => translatePrompt('And what\'s this “coperto” on the bill?',
      ['A cover charge for the bread and the table.', 'A tip for the waiter.', 'A charge for the sparkling water.'], 0,
      () => { L.p5 = true; save(); companionLine('Makes sense. Lunch is on me: you did all the talking! Say thanks for us.'); n(); },
      'Check the culture note in Lezione 4.'), 500));
  }
  if (out.end){ runSeq(steps, () => endConvo()); return; }
  if (!steps.length && !out.progressed) mark(currentWish());
  runSeq(steps, () => { if (hint) showHint(hint, label); else showHint(l4Hint(false)); });
}

function submitL4(res){
  const r = interpretL4(res.intents);
  if (r.error){
    convo.fails++;
    setTimeout(() => { convoBusy = false; npcLine('Eh? Come?', null); showHint(agreeMsg(r.error) + (convo.fails >= 2 ? ' ' + l4Hint(true) : '')); }, 800);
    return;
  }
  const obj = markObjection(r.acts);
  if (obj){ setTimeout(() => { convoBusy = false; companionLine(obj.text); showHint(obj.hint, 'Consiglio'); }, 700); return; }
  convo.fails = 0;
  S.sentences++;
  convo.lastUsed.forEach(t => { if (!(t.name && !t.tokens)){ const k = t.key || t.w; S.wordStats[k] = (S.wordStats[k] || 0) + 1; } });
  const out = waiterTurn(r.acts);
  save();
  setTimeout(() => {
    const lines = out.lines.length ? out.lines : [{ it:'…', en:'', quiet:true }];
    playLines(lines, { hideEn:true }, () => { convoBusy = false; afterL4(out); });
  }, 900);
}

function waiterFail(){
  const n = convo.npc;
  S.met.davide = true; save();
  if (S.tut !== 'l4-start'){
    npcLine('Allora? Cosa prendete?', 'So? What will you have?');
    setTimeout(() => {
      sysLine('You still can\'t order for Mark. Finish <b>Lezione 4</b> in your handbook first.');
      showChoices([{ label:'Leave', fn:closeDialog }, { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(4); } }]);
    }, 700);
    return;
  }
  runSeq([
    nx => { npcLine('Buongiorno! Sono Davide. Ecco il menù. Cosa prendete?', 'Good morning! I\'m Davide. Here\'s the menu. What will you have?'); setTimeout(nx, 1200); },
    nx => { companionLine("Ooh, let me try! Hi! Do you have pizza? And I'm vegetarian, so nothing with meat, please."); setTimeout(nx, 1300); },
    nx => { npcLine('Eh… pizza? Scusi, non parlo inglese…', 'Huh… pizza? Sorry, I don\'t speak English…'); setTimeout(nx, 1200); },
    nx => { companionLine("Oh no. He doesn't speak English. Can you ask for me? I'd love a pizza, but I can't eat meat."); setTimeout(nx, 900); },
    nx => {
      sysLine('Mark is counting on you, but you can\'t yet say what <i>he</i> would like, ask what they have, or explain what he can\'t eat. Open your handbook: <b>Lezione 4 · A pranzo</b>.');
      setTut('l4-handbook');
      showChoices([{ label:'Leave', fn:closeDialog }, { label:'“Give me a minute, Mark.” Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(4); } }]);
    },
  ]);
}

function openRestaurant(){
  const L = S.l4;
  convo.restaurant = true;
  convo.words = []; renderBank(); renderSentence();
  builder.hidden = false;
  if (L.done){ npcLine('Grazie ancora! Arrivederci!', null); builder.hidden = true; showChoices([{ label:'Leave', primary:true, fn:closeDialog }]); return; }
  const op = (!L.askedPizza && !L.him.dish && !L.me.dish) ? 'Allora, cosa prendete?' : (L.served && !L.billAsked) ? 'Tutto bene?' : 'Sì? Ditemi.';
  convoBusy = true;
  setTimeout(() => {
    convoBusy = false;
    npcLine(op, null);
    const events = [];
    if (L.askedPizza && !L.p1) events.push('pizza');
    if (L.himVeg && !L.p2) events.push('veg');
    if (L.drinkAsked && !L.p3) events.push('drinkQ');
    if (L.billAsked && !L.p5) events.push('bill');
    if (events.length) afterL4({ events, progressed:true, price:billTotal() });
    else setTimeout(() => { companionLine(currentWish()); showHint(l4Hint(false)); }, 600);
  }, 250);
}

function markTalk(){
  if (S.tut === 'l6-start') return markBorrows();
  const say = (t, d = 0) => setTimeout(() => npcLine(fill(t), null, { english:true }), d);
  const leave = { label:'Leave', primary:true, fn:closeDialog };
  const lines = {
    'l4-start':"I'm starving. Let's get the waiter over here.",
    'l4-handbook':"Take your time. I'll keep staring at this menu I can't read.",
    'l4-practice':"Take your time. I'll keep staring at this menu I can't read.",
    'l4-order':S.l4.done ? 'Best lunch ever.' : currentWish(),
    'l4-done':"Best lunch of the trip, and I didn't say a single word in Italian. Where to next?",
    'l5-handbook':'Take your time. Paolo and I are bonding through hand gestures.',
    'l5-practice':'Take your time. Paolo and I are bonding through hand gestures.',
    'l5-tour':S.l5routeOK ? "Lead the way to the statue! I'm right behind you." : 'Lead the way! Or introduce me to more people. I like it here.',
    'l5-statue':"Is that it? Ask her! And introduce me, I'm a person too.",
    'l5-done':'A Donatello! And I met half the town. Best day of the trip.',
    'l6-order':'A cappuccino and a pastry, please! Any pastry. Surprise me.',
    'l6-page':"Go and find your book! Emma and I are fine here.", 'l6-chiara':"Go and find your book! Emma and I are fine here.",
    'l6-rosa':"Still looking? Emma says check everywhere you went yesterday.", 'l6-lucia':"Still looking? Emma says check everywhere you went yesterday.",
    'l6-man':"A man is READING your book? Go and get it!",
    'l6-bring':'Who is this? Introduce us!',
    'l6-done':"You found it! And you found me an Italian teacher? Bruno keeps saying “my friend” very loudly.",
  };
  say(lines[S.tut] || 'Hey!');
  setTimeout(() => showChoices([leave]), 500);
}
