/* Lesson 12 · Un giorno in città. The station: the clerk at the ticket office (bigliettaio, formal: Lei) and the night
   train's conductor (capotreno), both tile-bank conversations; the Venice train that pulls out (a cutscene); the green
   machine (validating the ticket) and getting on the night train.

   The barrier (before the Lesson 12 words): whatever you try beyond small talk, he answers fast, as a listening line, with
   times, platforms and ticket kinds → the handbook.
   The ticket: greet (in the same turn counts) → a ticket to Venice → "Il treno parte adesso! Binario tre!" → the
   cutscene: you run towards binario 3 and the train pulls out → back at the window: "È appena partito. Il prossimo treno
   parte stasera, alle ventitré e quindici." → for this evening (per stasera / per oggi / allora… sì; per domani: the
   first train is at six) → andata / andata e ritorno → the price (listening) → the notepad → "Ecco … euro" (the change,
   heard) → the ticket goes in the bag. Questions at any point: A che ora parte (il prossimo treno)? Da che binario parte?
   At 23:00: the board shows binario 3; the green machine stamps the ticket; the conductor asks for it ("Ecco il
   biglietto!", the bag's tiles): stamped → "carrozza cinque, buon viaggio"; not stamped → he points at the machine; then
   the train's door (E) → on board → the completion screen. */

const l12Clerk = n => !!n && n.id === 'bigliettaio' && l12On();
const l12Cond = n => !!n && n.id === 'capotreno' && l12On();
const l12St = st => st.l12 || (st.l12 = { greeted:false, asked:null, pending:null, wrong:0 });
const l12BarrierOn = () => !!S.l12 && !S.l12.barrier && !S.vocab12;
const L12_SOCIAL = new Set(['greet', 'ask_how', 'answer_how', 'ask_back', 'address', 'name_only', 'nice', 'excuse', 'please', 'and', 'sir', 'madam']);
const L12_TICKET_ITEM = { id:'biglietto', label_it:'il biglietto', label_en:'the train ticket: Venezia, 23:15, binario 3', icon:'🎫', giveTo:['capotreno'] };
const L12_AT_2315 = { it:'alle ventitré e quindici', en:'at 23:15' };
/* the clerk's lines by situation (the brain's opening) */
{
  const c = NPC.bigliettaio, op = c.opening;
  const opening = () => {
    if (!l12On()) return op;
    const L = S.l12;
    if (L.ticket) return { it:`Buongiorno! Il Suo treno: stasera, ${L12_AT_2315.it}, binario tre.`, en:'Good afternoon! Your train: this evening, at 23:15, platform three.' };
    if (L.trainGone && convo && convo.npc === c && convo.st.l12 && convo.st.l12.missedNow) return { it:`Eh… mi dispiace! È appena partito. Il prossimo treno per Venezia parte stasera, ${L12_AT_2315.it}.`, en:"Ah… I'm sorry! It has just left. The next train to Venice leaves this evening, at 23:15." };
    return op;
  };
  ['opening', 'revisitOpening'].forEach(k => Object.defineProperty(c, k, { configurable:true, enumerable:true, get:opening }));
  const cp = NPC.capotreno, cop = cp.opening;
  const condOpening = () => l12On() && !S.l12.checked ? { it:'Buonasera! Il biglietto, prego.', en:'Good evening! Your ticket, please.' } : l12On() ? { it:'Buonasera! Carrozza cinque, eh!', en:'Good evening! Carriage five, eh!' } : cop;
  ['opening', 'revisitOpening'].forEach(k => Object.defineProperty(cp, k, { configurable:true, enumerable:true, get:condOpening }));
}

/* ---------- parser words ---------- */
function l12Phrases(){
  return [
    ['t12:venezia', 'per venezia'], ['t12:venezia', 'venezia'], ['t12:venezia', 'a venezia'],
    ['t12:oneway', 'andata'], ['t12:oneway', 'solo andata'], ['t12:return', 'andata e ritorno'],
    ['t12:today', 'per oggi'], ['t12:today', 'oggi'], ['t12:tonight', 'per stasera'], ['t12:tonight', 'stasera'], ['t12:tonight', 'per stanotte'], ['t12:tonight', 'stanotte'],
    ['t12:tomorrow', 'per domani'], ['t12:tomorrow', 'domani'], ['t12:tomorrow', 'per domani mattina'], ['t12:tomorrow', 'domani mattina'],
    ['t12:when', 'a che ora parte'], ['t12:when', 'a che ora parte il prossimo treno'], ['t12:when', 'a che ora parte il treno'],
    ['t12:next', 'il prossimo treno'], ['t12:next', 'il treno'], ['t12:platform', 'da che binario parte'], ['t12:platform', 'da che binario'], ['t12:platform', 'che binario'],
    ['t12:then', 'allora'], ['ok10', 'va bene'], ['t12:ticket', 'un biglietto'], ['t12:ticket', 'il biglietto'], ['t12:ticket', 'biglietto'],
  ];
}
/* what the player said → { ticket, venezia, oneway, ret, today, tonight, tomorrow, when, platform, then, want, pay, payBare, give, thanks, bye, repeat, yes, no, other } */
function l12Read(ints){
  const R = { ticket:false, venezia:false, oneway:false, ret:false, today:false, tonight:false, tomorrow:false, when:false, platform:false, then:false, want:false,
    pay:null, payBare:false, give:false, thanks:false, bye:false, repeat:false, yes:false, no:false, other:[] };
  let ecco = false;
  ints.forEach(id => {
    const m = id.match(/^num:(\d+)$/);
    if (id === 'here_is'){ ecco = true; R.payBare = true; return; }
    if (m){ if (ecco || R.pay === null) R.pay = +m[1]; ecco = false; return; }
    if (id === 'euro') return;
    ecco = false;
    const k = { 't12:venezia':'venezia', 't12:oneway':'oneway', 't12:return':'ret', 't12:today':'today', 't12:tonight':'tonight', 't12:tomorrow':'tomorrow', 't12:when':'when',
      't12:platform':'platform', 't12:then':'then', 't12:ticket':'ticket', ticket10:'ticket', 'want:me':'want', thanks:'thanks', bye:'bye', repeat:'repeat', yes:'yes', ok10:'yes', no:'no',
      'give:biglietto':'give', 'bag:biglietto':'ticket', 't12:next':'next' }[id];
    if (k === 'next') return;
    if (k) R[k] = true;
    else if (!L12_SOCIAL.has(id)) R.other.push(id);
  });
  if (R.pay !== null && !R.payBare && !ints.includes('euro')) R.pay = null;      // a bare number is not money
  return R;
}
const l12Business = ints => ints.some(id => !L12_SOCIAL.has(id) && id !== 'repeat');

/* ---------- the conversations ---------- */
function l12ClerkOpen(npc){
  const L = S.l12;
  convo.known = true;
  $('#dlgWho').innerHTML = `<b>${esc(npc.name)}</b> <span class="where">· ${esc(npc.place)}</span>`;
  if (S.tut === 'l12-barrier' && S.vocab12){ L.barrier = true; setTut('l12-ticket'); }
  /* back at the window after the train left: he speaks first (the player greeted him before running out) */
  if (L.trainGone && !L.missed && !L.ticket){ L.missed = true; Object.assign(l12St(convo.st), { asked:'when', missedNow:true, greeted:true }); save(); }
  return false;                                                                         // the tile bank, as usual
}
function l12ConductorOpen(npc){
  convo.known = true;
  $('#dlgWho').innerHTML = `<b>${esc(npc.name)}</b> <span class="where">· ${esc(npc.place)}</span>`;
  l12St(convo.st).asked = S.l12.checked ? null : 'ticket';
  return false;
}
function l12Bank(npc, groups){
  if (!l12Clerk(npc) && !l12Cond(npc)) return null;
  const nums = top => ({ label:'Numeri', tiles:Array.from({ length:top }, (_, i) => ({ w:numIt(i + 1), label:numIt(i + 1), gloss:String(i + 1) })) });
  if (l12Clerk(npc) && !S.vocab12){
    groups.push({ label:'Words you have', tiles:L10_BUY.map(phraseTile) });
    groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
    return groups;
  }
  groups.push({ label:'In stazione', tiles:[L10_BUY[1], ...L12_TILES].map(phraseTile) });
  if (l12Clerk(npc)){ groups.push(nums(24)); groups.push({ label:'Comprare', tiles:[L10_BUY[0], L10_BUY[2], L10_BUY[3], L10_BUY[4]].map(phraseTile) }); }
  groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
  return groups;
}
function l12React(id, n, st, add, out, ints){
  if (!l12Clerk(n) && !l12Cond(n)) return false;
  const s = l12St(st);
  if (id === 'greet'){
    s.greeted = true;
    if (!l12Business(ints) && !ints.includes('ask_how')){ add(l12Cond(n) ? 'Buonasera!' : 'Buongiorno!', l12Cond(n) ? 'Good evening!' : 'Good afternoon!'); out.l12greet = true; }
    return true;
  }
  if (l12Clerk(n) && l12BarrierOn()){
    if (L12_SOCIAL.has(id) || id === 'repeat') return false;
    if (out.l12barrier) return true;
    out.l12barrier = true; out.asked = true;
    add('Per Venezia? Il regionale veloce delle quattordici e trentacinque, binario tre. Andata o andata e ritorno? Per oggi?', null, { listen:true, rate:1.12 });
    return true;
  }
  if (id === 'repeat' && s.pending && !out.l12biz){
    out.l12biz = true; out.asked = true; S.l12.repeats++;
    add('Sì, certo!', 'Yes, of course!'); add(l12PriceLine().it, l12PriceLine().en, { listen:true, rate:0.68 });
    out.l12pad = true;
    return true;
  }
  if (L12_SOCIAL.has(id) || id === 'repeat') return false;
  if (out.l12biz) return true;
  out.l12biz = true; out.asked = true;
  if (l12Clerk(n)) l12ClerkTurn(n, s, add, out, ints); else l12CondTurn(n, s, add, out, ints);
  return true;
}
const l12PriceLine = () => { const p = S.l12.price; return { it:`Sono ${numIt(p)} euro.`, en:`That's ${NUM_EN[p] || p} euros.` }; };
function l12ClerkTurn(n, s, add, out, ints){
  const L = S.l12, R = l12Read(ints);
  const hint = (h, label) => { if (!out.l12hint) out.l12hint = { h, label:label || 'Suggerimento' }; };
  const business = R.ticket || R.venezia || R.oneway || R.ret || R.today || R.tonight || R.tomorrow || R.when || R.platform || R.want || R.pay !== null || R.payBare || R.give || R.other.length;
  if ((R.thanks || R.bye) && !business){
    if (L.ticket){ add('Prego! Buon viaggio!', "You're welcome! Have a good trip!"); out.end = true; return; }
    if (R.bye){ add('Prego! Arrivederci!', "You're welcome! Goodbye!"); out.end = true; return; }
    add('Prego!', "You're welcome!"); return;
  }
  if (!s.greeted && !ints.includes('greet')){ add('Buongiorno, eh!', 'Good afternoon, eh!'); L.mistakes.rude++; out.l12rude = true; return; }
  /* questions he answers at any time (once the train has gone) */
  if (L.trainGone){
    if (R.when) add(`Il prossimo treno per Venezia parte stasera, ${L12_AT_2315.it}.`, 'The next train to Venice leaves this evening, at 23:15.');
    if (R.platform) add('Dal binario tre.', 'From platform three.');
  }
  if (L.ticket){ if (!R.when && !R.platform) add(`Ha già il biglietto: stasera, ${L12_AT_2315.it}, binario tre.`, 'You have your ticket already: this evening, at 23:15, platform three.'); hint('You have your ticket. Thank him and say goodbye.', 'Fatto!'); return; }
  /* the train is still there: it is leaving now */
  if (!L.trainGone){
    if (R.ticket || R.venezia || R.when || R.platform || R.want || R.today || R.tonight || R.oneway || R.ret){
      add('Per Venezia? Il treno parte adesso! Binario tre! Presto!', 'To Venice? The train is leaving now! Platform three! Quick!', { rate:1.05 });
      out.l12train = true; return;
    }
    add('Mi dica.', 'How can I help?'); hint('Ask for a ticket to Venice.'); return;
  }
  /* for when */
  if (!L.when){
    if (R.tonight || R.today || (R.yes && s.asked === 'when') || (R.then && (R.yes || R.ticket))){ L.when = 'tonight'; save(); }
    else if (R.tomorrow){ add('Per domani? Il primo treno parte domani mattina, alle sei e dieci.', 'For tomorrow? The first train leaves tomorrow morning, at 6:10.'); L.mistakes.when++; s.asked = 'when';
      hint('Tomorrow morning is a long way off, and you have a whole day here. Wouldn\'t you rather go tonight?'); return; }
    else if (R.ticket || R.venezia || R.want){ add(`Per Venezia: il prossimo treno parte stasera, ${L12_AT_2315.it}. Per stasera?`, 'To Venice: the next train leaves this evening, at 23:15. For this evening?'); s.asked = 'when';
      hint('He asked you something about your ticket. Not sure? Look it up in your dictionary (<kbd>V</kbd>).'); return; }
    else if (R.when || R.platform){ s.asked = 'when'; hint('So the only train is tonight. Ask for a ticket for then.'); return; }
    else { add('Mi dica.', 'How can I help?'); hint('Ask for a ticket to Venice, for tonight\'s train.'); return; }
    if (!R.oneway && !R.ret){ add(`Per stasera, ${L12_AT_2315.it}. Andata o andata e ritorno?`, 'For this evening, at 23:15. One way or return?'); s.asked = 'kind'; return; }
  }
  /* one way or return */
  if (!L.kind){
    if (R.oneway || R.ret){
      L.kind = R.ret ? 'ar' : 'andata'; L.price = L12_PRICE[L.kind]; save();
      add(L.kind === 'ar' ? 'Andata e ritorno, va bene.' : 'Solo andata, va bene.', L.kind === 'ar' ? 'Return, fine.' : 'One way, fine.');
      const p = l12PriceLine(); add(p.it, p.en, { listen:true });
      s.pending = 'price'; out.l12pad = true; return;
    }
    add('Andata o andata e ritorno?', 'One way or return?'); s.asked = 'kind';
    hint('He wants you to choose between two kinds of ticket. Your handbook\'s phrases have both.'); return;
  }
  /* the price, then paying */
  if (!L.noted){ const p = l12PriceLine(); add(p.it, p.en, { listen:true }); s.pending = 'price'; out.l12pad = true; return; }
  if (R.pay !== null || R.payBare){
    if (R.pay === null){ add('Ecco… quanto?', "Here's… how much?"); hint('Say how much you are giving him: a number of euros.'); return; }
    if (R.pay < L.price){ add(`${cap(numIt(R.pay))} euro? Ma sono ${numIt(L.price)} euro!`, `${cap(NUM_EN[R.pay] || String(R.pay))} euros? But it's ${NUM_EN[L.price]} euros!`); L.mistakes.pay++;
      hint(`That's less than the € ${L.price} in your notepad.`); return; }
    L.paid = true; L.given = R.pay;
    const c = R.pay - L.price;
    if (c > 0) add(`Grazie. Ecco il resto: ${c === 1 ? 'un' : numIt(c)} euro.`, `Thank you. Here's your change: ${NUM_EN[c]} ${c === 1 ? 'euro' : 'euros'}.`); else add('Grazie, giusto così.', "Thank you, that's exactly right.");
    add(`Ecco il biglietto: Venezia, stasera ${L12_AT_2315.it}, binario tre. Buon viaggio!`, "Here's your ticket: Venice, this evening at 23:15, platform three. Have a good trip!");
    l12GotTicket(); out.l12ticket = true; return;
  }
  const p = l12PriceLine(); add(p.it, p.en); hint(`Pay him: € ${L.price}, as in your notepad.`);
}
function l12GotTicket(){
  const L = S.l12;
  L.ticket = true; L.clock = Math.max(L.clock, 14 * 60 + 45); L.stampAt.ticket = l12HHMM(L.clock);
  bagAdd({ ...L12_TICKET_ITEM, note:L.kind === 'ar' ? 'Andata e ritorno' : 'Andata' });
  save();
}
function l12CondTurn(n, s, add, out, ints){
  const L = S.l12, R = l12Read(ints);
  const hint = (h, label) => { if (!out.l12hint) out.l12hint = { h, label:label || 'Suggerimento' }; };
  if ((R.thanks || R.bye) && !R.give && !R.ticket && !R.when && !R.platform){
    add(L.checked ? 'Prego! Buon viaggio!' : 'Prego… ma il biglietto?', L.checked ? "You're welcome! Have a good trip!" : 'You\'re welcome… but your ticket?'); if (L.checked) out.end = true; return;
  }
  if (R.when) add(`Alle ventitré e quindici. Tra poco!`, 'At 23:15. Soon!');
  if (R.platform) add('Binario tre: è questo!', 'Platform three: this is it!');
  if (R.give){
    if (!bagHas('biglietto')){ add('Il biglietto? Dov\'è?', 'Your ticket? Where is it?'); return; }
    if (!L.validated){ add('Il biglietto non è convalidato! La macchinetta verde, lì.', "Your ticket isn't validated! The green machine, there."); out.l12cond = 'stamp'; L.mistakes.when++; save(); return; }
    L.checked = true; save();
    add('Grazie. Va bene: carrozza cinque. Buon viaggio!', 'Thank you. That\'s fine: carriage five. Have a good trip!'); out.l12cond = 'ok'; return;
  }
  if (R.ticket){ add(L.checked ? 'Sì, va bene: carrozza cinque.' : 'Sì, il biglietto, prego.', L.checked ? "Yes, that's fine: carriage five." : 'Yes, your ticket, please.'); if (!L.checked) hint('Hand it over: the <b>Nella borsa</b> tiles.'); return; }
  if (!R.when && !R.platform){ add(L.checked ? 'Prego, salga!' : 'Il biglietto, prego.', L.checked ? 'Please, get on!' : 'Your ticket, please.'); if (!L.checked) hint('He wants to see something of yours. Your bag has it.'); }
}

/* after their lines: the barrier's end, the train, the notepad, the hints */
function l12StationAfter(n, out, res, words){
  const L = S.l12, s = l12St(convo.st);
  if (out.l12barrier) return l12BarrierEnd();
  if (out.l12rude){ showHint(hintAfter(stepTries(convo.st, 'greet'), "Greet him first: he's a stranger at work, so politely.", 'Greet him first, politely: <b>buongiorno</b>.'), 'Consiglio'); return true; }
  if (out.l12train){
    sysLine('You turn round. Out on <b>binario 3</b>, a whistle: the doors of a long white train are closing…');
    enqueue(() => { if (!convo) return; S.l12.trainCut = true; closeDialog(); });
    return true;
  }
  if (out.l12pad){ enqueue(() => { hintEl.hidden = true; }); if (out.l12hint) showHint(out.l12hint.h, out.l12hint.label); l12AskPad(n); return true; }
  if (out.l12ticket){ enqueue(() => renderHUD()); showHint('Ticket bought: it\'s in your bag. Thank him and say goodbye.', 'Fatto!'); return true; }
  if (out.l12cond === 'stamp'){ showHint(hintAfter(stepTries(convo.st, 'stamp'), 'Something has to happen to a paper ticket before you get on: your handbook\'s culture note. Say goodbye, then find the green machine at the head of the platform.',
    'Validate it (<b>convalidare</b>) in the green machine at the head of the platform, then come back.')); return true; }
  if (out.l12cond === 'ok'){ showHint('All in order! Thank him, then get on: the open door of the train (<kbd>E</kbd>).', 'Fatto!'); return true; }
  if (out.end) return false;
  if (out.l12hint){ showHint(out.l12hint.h, out.l12hint.label); return true; }
  if (l12Clerk(n) && l12BarrierOn()){ showHint(contextHint(false)); return true; }
  showHint(l12FormalTip(words) || contextHint(false), convo.tips.formalNow ? 'Consiglio' : undefined);
  return true;
}
function l12FormalTip(words){
  convo.tips.formalNow = false;
  if (convo.tips.formal || !words) return null;
  const fix = [['ciao', '<b>buongiorno</b>, not ciao'], ['stai', '<b>come sta</b>, not come stai'], ['scusa', '<b>scusi</b>, not scusa'], ['puoi', '<b>può</b>, not puoi']].filter(([w]) => words.includes(w)).map(f => f[1]);
  if (!fix.length) return null;
  convo.tips.formal = convo.tips.formalNow = true;
  return `He's a stranger at work: use the polite forms. ${fix.join('; ')}.`;
}
function l12BarrierEnd(){
  enqueue(() => { builder.hidden = true; hintEl.hidden = true; });
  sysLine('Venezia, binario, andata, ritorno… far too fast, and full of numbers. You have no words for trains. Time to learn some: open your handbook, <b>Lezione 12 · Un giorno in città</b>.');
  enqueue(() => { S.l12.barrier = true; save(); if (S.tut === 'l12-barrier') setTut(S.vocab12 ? 'l12-ticket' : 'l12-handbook'); });
  showChoices([{ label:'Leave', fn:closeDialog }, { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(12); } }]);
  return true;
}
function l12AskPad(n){
  const L = S.l12, s = l12St(convo.st);
  askNumber({ title:'Your notepad', label:'il biglietto', tip:'What did he say? Write the price in digits.',
    onAnswer(x){
      if (!convo || convo.npc !== n) return true;
      if (x === L.price){
        revealListen({ all:true });
        L.noted = true; s.pending = null; s.wrong = 0; save(); renderHUD();
        sysLine(`Your notepad: <b>il biglietto · € ${x}</b>`);
        showHint('Written down! Now pay him.', 'Fatto!');
        return true;
      }
      s.wrong++; L.mistakes.pad++; save();
      sysLine(`You write <b>€ ${x}</b>. Hmm… is that what he said?`);
      if (s.wrong === 1){ showHint('Not sure? Ask him, politely, to say it again.'); return true; }
      if (s.wrong === 2){ showHint('Still not it. Press <b>🔊 Ascolta di nuovo</b> on his line above to hear it again, slowly.'); return false; }
      revealListen({ all:true });
      showHint('Read the price above, then write it in digits.');
      return false;
    } });
}
/* the hint at the window: what the situation needs, never the Italian to say (strong: the key word only) */
function l12StationHint(n, st){
  if (!l12Clerk(n) && !l12Cond(n)) return null;
  const L = S.l12, s = l12St(st);
  if (l12Cond(n)){
    if (L.checked) return { h:'All in order. Thank him and get on the train.', step:'bye' };
    return { h:'He wants to see something of yours. It\'s in your bag: the <b>Nella borsa</b> tiles.', strong:'Hand it over: <b>ecco</b> … (the Nella borsa tiles).', step:'give' };
  }
  if (l12BarrierOn()) return s.greeted ? { h:'Ask for a ticket to Venice with the words you have.', step:'try' } : { h:"Greet him: he's a stranger at work, so politely.", step:'greet' };
  if (L.ticket) return { h:'You have your ticket. Thank him and say goodbye.', strong:'Thank him and say goodbye: <b>grazie</b> … <b>arrivederci</b>.', step:'bye' };
  if (!s.greeted) return { h:"Greet him first: he's a stranger at work, so politely.", strong:'Greet him first, politely: <b>buongiorno</b>.', step:'greet' };
  if (!L.trainGone) return { h:'Ask for a ticket to Venice.', strong:'Ask for <b>un biglietto</b> … the <b>In stazione</b> tiles have where it goes.', step:'ticket' };
  if (!L.when) return { h:'The next train is tonight. Ask for a ticket for tonight\'s train.', strong:'Say when it is for: <b>per</b> + this evening (<b>stasera</b>).', step:'when' };
  if (!L.kind) return { h:'Choose your ticket: just there, or there and back?', strong:'One of two words: <b>andata</b> … or <b>andata e ritorno</b>.', step:'kind' };
  if (s.pending || !L.noted) return { h:"Didn't catch the price? Ask him to say it again, politely.", strong:'Ask him to say it again, politely (<b>ripetere</b>).', step:'repeat' };
  if (!L.paid) return { h:`Pay him: the price is in your notepad (€ ${L.price}).`, strong:'Pay: <b>ecco</b> … <b>euro</b>.', step:'pay' };
  return { h:'Thank him and say goodbye.', step:'bye' };
}

/* ---------- the train that pulls out (a cutscene, from the ticket window) ---------- */
function l12TrainGo(){
  const L = S.l12;
  if (L.trainGone || S.scene !== 'stazione') return;
  cutscene([
    { guide:'Binario 3: the train to Venice!' },
    { walk:'player', path:[{ x:300, y:446 }, { x:560, y:372 }, { x:622, y:316 }], speed:175, face:{ x:0, y:-1 } },
    { guide:null },                                                       // (the banner would hide the train pulling out)
    { run:() => { trainDepart(); L.clock = Math.max(L.clock, 14 * 60 + 35); renderHUD(); } },
    { say:'No…!', who:'player', ms:1500 },
    { wait:3800 },
    { guide:'Too late. The train to Venice has gone.' },
    { wait:1400 },
    { walk:'player', path:[{ x:560, y:400 }, { x:300, y:446 }, { x:107, y:446 }], speed:160, face:{ x:0, y:-1 } },
    { run:() => { L.trainGone = true; L.clock = Math.max(L.clock, 14 * 60 + 38); save(); } },
  ], { id:'l12-train', guide:'', onSkip:() => { player.x = 107; player.y = 446; L.trainGone = true; } }).then(r => {
    if (r.replaced) return;
    L.trainGone = true; save(); renderHUD();
    setTimeout(() => { if (!dialogOpen && S.scene === 'stazione') openConvo(NPC.bigliettaio); }, 350);
  });
}

/* ---------- the doors: the green machines, the train ---------- */
function l12Door(d){
  if (!l12On() || S.scene !== 'stazione') return false;
  const L = S.l12;
  if (/^convalida/.test(d.id)){
    if (!bagHas('biglietto')) return false;
    if (S.tut !== 'l12-late'){ toast('<b>La convalida.</b> Your ticket is for <b>23:15</b>: stamp it just before you get on, tonight.'); return true; }
    if (L.validated){ toast('Your ticket is stamped already: <b>convalidato</b>.'); return true; }
    L.validated = true; bagSet('biglietto', { note:'Convalidato · 23:04' }); save(); renderHUD();
    openModal('small');
    sheet.innerHTML = `<div class="sheet-head"><div><p class="kicker">La convalida</p><h2><em>Clac!</em></h2><p class="sub">The green machine stamps the date and the time on your ticket.</p></div><button class="x" data-close aria-label="Close">×</button></div>
      <div class="sheet-body">${l12TicketHTML()}<p>Now it is valid: <b>convalidato</b>. Without the stamp the conductor could fine you.</p><div class="cta"><button class="btn primary" data-close>OK</button></div></div>`;
    return true;
  }
  if (d.id === 'treno'){
    if (S.tut !== 'l12-late'){ toast('Not your train: yours leaves at <b>23:15</b>.'); return true; }
    if (!L.checked){ toast(L.validated ? 'The conductor wants to see your ticket first.' : 'First things first: the conductor will want a <b>stamped</b> ticket. And he wants to see it.'); return true; }
    l12GetOn();
    return true;
  }
  return false;
}
function l12GetOn(){
  const L = S.l12;
  cutscene([
    { face:'capotreno', to:'player' },
    { say:'Buon viaggio!', who:'capotreno', ms:1600 },
    { walk:'player', path:[{ x:STAZ.door.x + 14, y:STAZ.door.y }], speed:110, face:{ x:-1, y:0 } },
    { run:() => { L.boarded = true; L.clock = 23 * 60 + 12; L.stampAt.train = '23:12'; player.x = STAZ.door.x - 8; save(); } },
    { wait:900 },
  ], { id:'l12-board', guide:'You climb aboard. Carriage five…', onSkip:() => { L.boarded = true; } }).then(() => {
    L.boarded = true; setTut('l12-done'); save();
    setTimeout(openComplete12, 400);
  });
}
/* tests: what the clerk reads from a sentence */
window.__l12Read = words => { const r = parse(String(words).toLowerCase().split(' '), NPC.bigliettaio); return r.ok ? l12Read(r.intents) : { fail:r.at }; };
