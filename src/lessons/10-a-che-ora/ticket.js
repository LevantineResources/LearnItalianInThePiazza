/* Lesson 10 · A che ora? The ticket booth: the cashier (cassiera, formal: Lei), a tile-bank conversation.
   The barrier: she opens with "Un biglietto? A che ora?" and you have no time words. Whatever you try (beyond small talk),
   she answers fast, as a listening line: "Per le tre e mezza è pieno. Il prossimo ingresso è alle quattro." → the handbook.
   The ticket: greet (in the same turn counts) → "Un biglietto? A che ora?" → a time: alle quattro / per le quattro /
   un biglietto per le sedici… (before now: "Ma… sono già le tre!"; 15:00–16:00: "è pieno"; 16:00–18:00 on the hour or the
   half hour: fine, that is the slot; later: the last entry is at six) → "Sono quattordici euro." (listening) → the notepad
   → "Ecco venti euro." → the change (listening) → the notepad → "Ecco il biglietto. Ingresso alle quattro: tra un'ora."

   Time parsing: the parser words below turn a time into parts (t10:at alle, t10:now sono le, num:N, and, t10:meno …);
   l10Read() strings the parts of one time together into the keys of Vedo, vedo's time tiles and reads them with
   ispyParseTime() (ui/ispy.js): 12- and 24-hour forms, e / meno / un quarto / mezza, the minute words. */

const l10Cashier = n => !!n && n.id === 'cassiera' && S.lesson === 10 && !!S.l10;
const l10St = st => st.l10 || (st.l10 = { greeted:false, asked:false, pending:null, wrong:0 });
const l10BarrierOn = () => !!S.l10 && !S.l10.barrier && !S.vocab10;
const L10_SOCIAL = new Set(['greet', 'ask_how', 'answer_how', 'ask_back', 'address', 'name_only', 'nice', 'excuse', 'please', 'and', 'sir', 'madam']);
/* the cashier's lines, by situation: her opening, and no small talk agenda in Lesson 10 (a busy ticket window) */
{
  const c = NPC.cassiera, op = c.opening, ag = c.agenda;
  const opening = () => {
    if (S.lesson !== 10 || !S.l10) return op;
    if (l10BarrierOn()) return { it:'Buongiorno! Un biglietto? A che ora?', en:'Good afternoon! A ticket? At what time?' };
    if (S.l10.ticket) return { it:`Buongiorno! Ingresso ${l10AtIt(l10Slot())}, eh!`, en:`Good afternoon! Entry at ${ispyTimeEn(l10Slot())}, eh!` };
    return op;
  };
  ['opening', 'revisitOpening'].forEach(k => Object.defineProperty(c, k, { configurable:true, enumerable:true, get:opening }));
  Object.defineProperty(c, 'agenda', { configurable:true, enumerable:true, get:() => S.lesson === 10 ? [] : ag });
}

/* ---------- parser words (also what typing will accept: the hard-mode alternatives) ---------- */
function l10Phrases(){
  const P = [
    ['t10:at', 'alle'], ['t10:at', 'per le'], ['t10:at', 'a le'], ['t10:atone', "all'una"], ['t10:atone', "per l'una"], ['t10:atone', "alla una"],
    ['t10:now', 'sono le'], ['t10:nowone', "è l'una"], ['t10:le', 'le'], ['t10:one', "l'una"],
    ['t10:meno', 'meno'], ['t10:quarto', 'un quarto'], ['t10:quarto', 'quarto'], ['t10:mezza', 'mezza'], ['t10:mezza', 'mezzo'],
    ['t10:noon:at', 'a mezzogiorno'], ['t10:noon:now', 'è mezzogiorno'], ['t10:noon:at', 'mezzogiorno'],
    ['t10:midnight:at', 'a mezzanotte'], ['t10:midnight:now', 'è mezzanotte'], ['t10:midnight:at', 'mezzanotte'],
    ['ask_time', 'che ore sono'], ['ask_time', 'che ore sono adesso'], ['ask_time', "che ora è"], ['ask_when', 'a che ora'],
    ['ticket10', 'un biglietto'], ['ticket10', 'il biglietto'], ['ticket10', 'biglietto'], ['ticket10', 'un biglietto intero'],
    ['now10', 'adesso'], ['soon10', "tra un'ora"], ['permesso', 'permesso'],
    ['excuse', 'mi scusi'], ['thanks', 'grazie tante'], ['ok10', 'va bene'],
    ['num:21', 'ventuno'], ['num:22', 'ventidue'], ['num:23', 'ventitré'], ['num:23', 'ventitre'], ['num:24', 'ventiquattro'],
    ['num:30', 'trenta'], ['num:45', 'quarantacinque'],
  ];
  /* the numbers 0–20 come from Lesson 8's words (num:N); without them (a test lesson order), add them */
  if (!hookFor(8)) for (let i = 0; i <= 20; i++) P.push(['num:' + i, numIt(i)]);
  return P;
}

/* ---------- reading what the player said ----------
   → { time:{ kind:'at'|'now'|'bare', keys, p, abs } | null, ticket, want, pay, payBare, askTime, askWhen, thanks, bye, repeat, yes, no, other } */
const L10_START = { 't10:at':['at', 'sono le'], 't10:le':['at', 'sono le'], 't10:atone':['at', "è l'una"], 't10:one':['at', "è l'una"],
  't10:now':['now', 'sono le'], 't10:nowone':['now', "è l'una"] };
const l10MinKey = id => { const m = id.match(/^num:(\d+)$/); if (m) return +m[1] === 30 ? 'trenta' : +m[1] === 45 ? 'quarantacinque' : 'n' + m[1];
  return { 't10:meno':'meno', 't10:quarto':'un quarto', 't10:mezza':'mezza' }[id] || null; };
/* a time said with the hour 1–12 is read in the afternoon (1–7) or the morning (8–12); 13–24: as said */
function l10Abs(p){
  let tot = p.tot != null ? p.tot : p.hour * 60;
  if (p.hour <= 12 && p.hour < 8) tot += 720;
  return tot;
}
function l10Read(ints){
  const R = { time:null, cost:false, ticket:false, want:false, pay:null, payBare:false, askTime:false, askWhen:false, thanks:false, bye:false, repeat:false, yes:false, no:false, other:[] };
  let i = 0, ecco = false;
  while (i < ints.length){
    const id = ints[i]; let m;
    if (id === 'here_is'){ ecco = true; R.payBare = true; i++; continue; }
    if ((m = id.match(/^num:(\d+)$/)) && ecco){ R.pay = +m[1]; ecco = false; i++; continue; }
    if (id === 'euro'){ i++; continue; }
    ecco = false;
    if ((m = id.match(/^t10:(noon|midnight):(at|now)$/))){
      if (!R.time) R.time = { kind:m[2], keys:[], p:{ hour:m[1] === 'noon' ? 12 : 24, h:m[1] === 'noon' ? 12 : 0, m:0, tot:m[1] === 'noon' ? 720 : 1440, special:m[1] } };
      i++; continue;
    }
    const st = L10_START[id], bare = /^num:\d+$/.test(id);
    if (st || bare){
      const keys = st ? [st[1]] : ['sono le', 'n' + id.slice(4)];
      let j = i + 1;
      if (st && keys[0] === 'sono le' && ints[j] && /^num:\d+$/.test(ints[j])){ keys.push('n' + ints[j].slice(4)); j++; }
      /* the minutes: e / meno + a number, un quarto, mezza (an "e" that starts something else is not part of it) */
      while (j < ints.length){
        const x = ints[j];
        if (x === 'and' || x === 't10:meno'){ const nx = ints[j + 1]; if (!nx || !l10MinKey(nx) || nx === 't10:meno') break; keys.push(x === 'and' ? 'e' : 'meno'); j++; continue; }
        const k = l10MinKey(x); if (!k || x === 't10:meno') break;
        keys.push(k); j++;
      }
      /* "venti euro" with no "ecco": that is money, not a time */
      if (bare && keys.length === 2 && ints[j] === 'euro'){ R.pay = +id.slice(4); R.payBare = true; i = j + 1; continue; }
      if (!R.time){ const p = ispyParseTime(keys); R.time = { kind:st ? st[0] : 'bare', keys, p }; if (!p.err) R.time.abs = l10Abs(p); }
      i = j; continue;
    }
    if (id === 'ticket10') R.ticket = true;
    else if (id === 'want:me') R.want = true;
    else if (id === 'ask_time') R.askTime = true;
    else if (id === 'ask_when') R.askWhen = true;
    else if (id === 'ask_cost' || id === 'how_much') R.cost = true;
    else if (id === 'thanks') R.thanks = true;
    else if (id === 'bye') R.bye = true;
    else if (id === 'repeat') R.repeat = true;
    else if (id === 'yes' || id === 'ok10') R.yes = true;
    else if (id === 'no') R.no = true;
    else if (!L10_SOCIAL.has(id) && !['now10', 'soon10'].includes(id)) R.other.push(id);
    i++;
  }
  if (R.time && R.time.p.special) R.time.abs = R.time.p.tot;
  return R;
}
/* feedback on a time that doesn't hold together: about the player's own words, never the answer */
function l10TimeFb(T){
  const E = { nohour:'Which hour? A number comes after it.', nohour2:'After that comes the hour: a number.',
    una:"One o'clock is singular: it has a tile of its own.", unaextra:"That tile already says the hour: one o'clock." };
  return E[T.p.err] || ispyTimeFb(T.keys, L10_NOW);
}
const l10Business = ints => ints.some(id => !L10_SOCIAL.has(id) && id !== 'repeat');

/* ---------- the conversation ---------- */
function l10CashierOpen(npc){
  const L = S.l10;
  convo.known = true;                                                                   // (her job is her name tag)
  $('#dlgWho').innerHTML = `<b>${esc(npc.name)}</b> <span class="where">· ${esc(npc.place)}</span>`;
  if (S.tut === 'l10-crowd') setTut('l10-booth');
  if (S.tut === 'l10-booth' && S.vocab10){ L.barrier = true; setTut('l10-ticket'); }     // (practised before the barrier)
  if (l10BarrierOn()) l10St(convo.st).asked = true;                                     // her opening asks
  return false;                                                                         // the tile bank, as usual
}
function l10CashierBank(npc, groups){
  if (!l10Cashier(npc)) return null;
  const nums = top => ({ label:'Numeri', tiles:Array.from({ length:top }, (_, i) => ({ w:numIt(i + 1), label:numIt(i + 1), gloss:String(i + 1) })) });
  if (!S.vocab10){
    groups.push({ label:'Al museo', tiles:L10_BUY.map(phraseTile) });
    groups.push(nums(20));
    groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
    return groups;
  }
  groups.push({ label:"L'ora", tiles:L10_TIME_TILES.map(phraseTile) });
  groups.push(nums(24));
  groups.push({ label:'Al museo', tiles:L10_BUY.map(phraseTile) });
  groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
  return groups;
}

function l10CashierReact(id, n, st, add, out, ints){
  if (!l10Cashier(n)) return false;
  const s = l10St(st), L = S.l10;
  /* (a conversation picked up again: what she is still waiting for you to write down) */
  if (!s.pending && L.slot && !L.ticket) s.pending = L.noted.price === undefined ? 'price' : L.paid && L.noted.change === undefined ? 'change' : null;
  if (id === 'greet'){
    s.greeted = true;
    if (!l10Business(ints) && !ints.includes('ask_how')){ add('Buongiorno!', 'Good afternoon!'); out.l10greet = true; }
    return true;
  }
  /* the barrier: small talk is answered as usual; anything else is a try at her question */
  if (l10BarrierOn()){
    if (L10_SOCIAL.has(id) || id === 'repeat') return false;
    if (out.l10barrier) return true;
    out.l10barrier = true; out.asked = true;
    add('Per le tre e mezza è pieno. Il prossimo ingresso è alle quattro.', "It's full for half past three. The next entry is at four.", { listen:true, rate:1.05 });
    return true;
  }
  if (id === 'repeat' && s.pending && !out.l10biz){
    out.l10biz = true; out.asked = true; L.repeats++;
    const line = l10PendingLine(s.pending);
    add('Sì, certo!', 'Yes, of course!'); add(line.it, line.en, { listen:true, rate:0.68 });
    out.l10pad = s.pending;
    return true;
  }
  if (L10_SOCIAL.has(id) || id === 'repeat') return false;
  if (out.l10biz) return true;                                                  // the whole sentence is handled once
  out.l10biz = true; out.asked = true;
  l10Booth(n, s, st, add, out, ints);
  return true;
}
/* what she is waiting for you to write down: the price, or the change */
function l10PendingLine(kind){
  const L = S.l10;
  if (kind === 'change'){ const c = L.given - L10_PRICE; return { it:`Ecco il resto: ${c === 1 ? 'un' : numIt(c)} euro.`, en:`Here's your change: ${NUM_EN[c]} ${c === 1 ? 'euro' : 'euros'}.` }; }
  return { it:`Sono ${numIt(L10_PRICE)} euro.`, en:`That's ${NUM_EN[L10_PRICE]} euros.` };
}
function l10TicketLine(){
  const slot = l10Slot(), i = l10In(slot);
  return { it:`Ecco il biglietto. Ingresso ${l10AtIt(slot)}: ${i.it}.`, en:`Here's your ticket. Entry at ${ispyTimeEn(slot)}: ${i.en}.` };
}
function l10Booth(n, s, st, add, out, ints){
  const L = S.l10, R = l10Read(ints);
  const hint = (h, label) => { if (!out.l10hint) out.l10hint = { h, label:label || 'Suggerimento' }; };
  const business = R.time || R.cost || R.ticket || R.want || R.pay !== null || R.payBare || R.askTime || R.askWhen || R.other.length;
  /* goodbye */
  if ((R.thanks || R.bye) && !business){
    if (L.ticket){ add('Grazie a Lei! Arrivederci, buona visita!', 'Thank you! Goodbye, enjoy your visit!'); out.end = true; return; }
    if (R.bye || !L.slot){ add('Prego! Arrivederci!', "You're welcome! Goodbye!"); out.end = true; return; }
    add('Prego!', "You're welcome!"); return;
  }
  if (L.ticket){
    if (R.askTime){ add(`${cap(l10NowIt(L10_NOW))}.`, "It's three o'clock."); }
    add(`Ha già il biglietto: ingresso ${l10AtIt(l10Slot())}.`, `You have your ticket already: entry at ${ispyTimeEn(l10Slot())}.`);
    hint('You have your ticket. Thank her and say goodbye.', 'Fatto!'); return;
  }
  if (!s.greeted && !ints.includes('greet')){ add('Buongiorno, eh!', 'Good afternoon, eh!'); L.mistakes.rude++; out.l10rude = true; return; }
  /* questions she can answer */
  if (R.askTime){ add(`${cap(l10NowIt(L10_NOW))}.`, "It's three o'clock."); if (!R.time && !R.ticket && R.pay === null && !R.askWhen){ if (!L.slot){ add('Un biglietto? A che ora?', 'A ticket? At what time?'); s.asked = true; } return; } }
  if (R.askWhen && !R.time && !L.slot){ add('Il prossimo ingresso è alle quattro.', 'The next entry is at four.'); s.asked = true; hint('Now ask for a ticket for that time.'); return; }
  /* paying */
  if (R.pay !== null || R.payBare){
    if (!L.slot){ add('Un momento! Prima: a che ora?', 'One moment! First: at what time?'); s.asked = true; hint('First the time: when do you want to go in?'); return; }
    if (L.noted.price === undefined){ const l = l10PendingLine('price'); add(l.it, l.en, { listen:true }); s.pending = 'price'; out.l10pad = 'price'; return; }
    if (L.paid){ const l = l10PendingLine('change'); add('Ha già pagato!', 'You have paid already!'); add(l.it, l.en, { listen:true }); s.pending = 'change'; out.l10pad = 'change'; return; }
    if (R.pay === null){ add('Ecco… quanto?', "Here's… how much?"); hint('Say how much you are giving her: a twenty-euro note.'); return; }
    if (R.pay < L10_PRICE){ add(`${cap(numIt(R.pay))} euro? Ma sono ${numIt(L10_PRICE)} euro!`, `${cap(NUM_EN[R.pay] || String(R.pay))} euros? But it's ${NUM_EN[L10_PRICE]} euros!`);
      hint(`That's less than the € ${L10_PRICE} in your notepad. Pay with a twenty-euro note.`); return; }
    L.paid = true; L.given = R.pay; save();
    if (R.pay === L10_PRICE){ const t = l10TicketLine(); add('Grazie! Giusto così. ' + t.it, "Thank you! That's exactly right. " + t.en); L.ticket = true; L.noted.change = 0; save(); out.l10ticket = true; return; }
    const l = l10PendingLine('change');
    add('Grazie!', 'Thank you!'); add(l.it, l.en, { listen:true });
    s.pending = 'change'; out.l10pad = 'change'; return;
  }
  /* the time */
  const T = R.time;
  if (T){
    s.asked = true;
    if (T.p.err){ add('Scusi? A che ora?', 'Sorry? At what time?'); L.mistakes.time++; hint(l10TimeFb(T), 'Consiglio'); return; }
    if (T.kind === 'now'){
      if (ispyTimeRight(T.p, L10_NOW)) add('Sì, sono le tre. Un biglietto? A che ora?', "Yes, it's three o'clock. A ticket? At what time?");
      else add(`${cap(T.p.special ? (T.p.special === 'noon' ? 'mezzogiorno' : 'mezzanotte') : l10NowIt(T.abs % 1440 || 1440).replace(/^sono |^è /, ''))}? No, sono le tre!`, `${cap(T.p.special ? (T.p.special === 'noon' ? 'midday' : 'midnight') : ispyTimeEn(T.abs))}? No, it's three o'clock!`);
      L.mistakes.time++;
      hint('You told her what time it <i>is</i>. She wants to know <i>at</i> what time you want to go in. How do you say <i>at</i> a time? Look in the handbook (<kbd>H</kbd>), How it works.', 'Consiglio');
      return;
    }
    if (T.kind === 'bare'){
      const h = T.p.hour;
      add(h === 1 ? 'Uno? Un biglietto, sì… e a che ora?' : `${cap(numIt(h))}? ${cap(numIt(h))} biglietti?`, h === 1 ? 'One? One ticket, yes… and at what time?' : `${cap(NUM_EN[h] || String(h))}? ${cap(NUM_EN[h] || String(h))} tickets?`);
      L.mistakes.time++;
      hint('She thought you meant how many tickets. To say <i>at</i> a time, look in the handbook (<kbd>H</kbd>), How it works.', 'Consiglio');
      return;
    }
    const a = T.abs, at = T.p.special === 'noon' ? 'a mezzogiorno' : T.p.special === 'midnight' ? 'a mezzanotte' : l10AtIt(a % 1440 || 1440), atEn = T.p.special ? (T.p.special === 'noon' ? 'midday' : 'midnight') : ispyTimeEn(a);
    if (a <= L10_NOW){
      add(`${cap(at)}? Ma… sono già le tre!`, `At ${atEn}? But… it's already three o'clock!`); L.mistakes.before++;
      hint('That time has gone: look at the clock on the tower. The little sign on the glass says when the next entry is.'); return;
    }
    if (a < 960){
      add(`Mi dispiace, ${at} è pieno.`, `I'm sorry, at ${atEn} it's full.`); add('Il prossimo ingresso è alle quattro.', 'The next entry is at four.');
      L.mistakes.full++;
      hint('Full! Did you catch when the next entry is? The little sign on the glass says it too. Ask for a ticket for then.'); return;
    }
    if (a > 1080){
      add(`${cap(at)}? Mi dispiace, l'ultimo ingresso è alle sei.`, `At ${atEn}? I'm sorry, the last entry is at six.`);
      hint('Too late: the museum closes. The little sign on the glass says when the next entry is.'); return;
    }
    if (a % 30){
      const lo = a - a % 30, hi = lo + 30;
      add(`${cap(at)}? No, mi dispiace: ${l10AtIt(lo)} o ${l10AtIt(hi)}.`, `At ${atEn}? No, sorry: at ${ispyTimeEn(lo)} or at ${ispyTimeEn(hi)}.`);
      hint('Entries are on the hour and at half past.'); return;
    }
    L.slot = a; s.pending = 'price'; save();
    add(`${cap(l10AtIt(a))}, va bene.`, `At ${ispyTimeEn(a)}, fine.`);
    const l = l10PendingLine('price'); add(l.it, l.en, { listen:true });
    out.l10pad = 'price';
    return;
  }
  if (R.ticket || R.want || R.cost){
    if (L.slot && L.paid){ add('Ha già pagato, grazie!', "You've paid already, thank you!"); return; }
    if (L.slot){ const l = l10PendingLine('price'); add(`Sì, ${l10AtIt(L.slot)}. ${l.it}`, `Yes, at ${ispyTimeEn(L.slot)}. ${l.en}`, L.noted.price === undefined ? { listen:true } : undefined);
      if (L.noted.price === undefined){ s.pending = 'price'; out.l10pad = 'price'; } else hint('Pay with a twenty-euro note.'); return; }
    add('Un biglietto, sì. A che ora?', 'A ticket, yes. At what time?'); s.asked = true;
    hint('She asked you something about your ticket. Not sure what? Look it up in your dictionary (<kbd>V</kbd>). The little sign on the glass may help too.');
    return;
  }
  add('Mmm? Mi dica.', 'Hmm? How can I help?');
  hint(L.slot ? 'Pay with a twenty-euro note.' : 'Ask for a ticket for the next entry. The little sign on the glass says when.');
}

/* after her lines: the barrier's end, the notepad, the hints */
function l10CashierAfter(n, out, res, words){
  const L = S.l10, s = l10St(convo.st);
  if (out.l10barrier) return l10BarrierEnd();
  if (out.l10rude){
    showHint(hintAfter(stepTries(convo.st, 'greet'), "Greet her first: she's a stranger at work, so politely.", "Greet her first, politely: <b>buongiorno</b>."), 'Consiglio');
    return true;
  }
  if (out.l10pad){ enqueue(() => { hintEl.hidden = true; }); if (out.l10hint) showHint(out.l10hint.h, out.l10hint.label); l10AskPad(n, out.l10pad); return true; }
  if (out.l10ticket){ enqueue(() => renderHUD()); showHint('Ticket bought! Thank her and say goodbye.', 'Fatto!'); return true; }
  if (out.end) return false;
  if (out.l10hint){ showHint(out.l10hint.h, out.l10hint.label); return true; }
  if (l10BarrierOn()){ showHint(contextHint(false)); return true; }
  /* small talk only: then her question */
  if (!out.asked && !L.slot && !L.ticket && s.greeted && !s.asked){
    s.asked = true;
    const q = { it:'Un biglietto? A che ora?', en:'A ticket? At what time?' };
    npcLine(q.it, q.en); convo.lastNpcText = { ...q, listen:false };
  }
  showHint(l10FormalTip(words) || contextHint(false), convo.tips.formalNow ? 'Consiglio' : undefined);
  return true;
}
/* ciao, come stai, scusa, puoi with the cashier: the polite forms (the corrected words, not a sentence) */
function l10FormalTip(words){
  convo.tips.formalNow = false;
  if (convo.tips.formal || !words) return null;
  const fix = [['ciao', '<b>buongiorno</b>, not ciao'], ['stai', '<b>come sta</b>, not come stai'], ['scusa', '<b>scusi</b>, not scusa'], ['puoi', '<b>può</b>, not puoi']].filter(([w]) => words.includes(w)).map(f => f[1]);
  if (!fix.length) return null;
  convo.tips.formal = convo.tips.formalNow = true;
  return `She's a stranger at work: use the polite forms. ${fix.join('; ')}.`;
}
function l10BarrierEnd(){
  enqueue(() => { builder.hidden = true; hintEl.hidden = true; });
  sysLine('Fast, and full of numbers: you didn\'t catch a single time. And you have no way to say one. On the glass there is a little sign: <b>Prossimo ingresso · 16:00</b>. Time to learn the time: open your handbook, <b>Lezione 10 · A che ora?</b>');
  enqueue(() => { S.l10.barrier = true; save(); if (S.tut === 'l10-booth') setTut(S.vocab10 ? 'l10-ticket' : 'l10-handbook'); });
  showChoices([{ label:'Leave', fn:closeDialog }, { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(10); } }]);
  return true;
}

/* the notepad: the price you heard, then your change */
function l10AskPad(n, kind){
  const L = S.l10, s = l10St(convo.st), want = kind === 'price' ? L10_PRICE : L.given - L10_PRICE;
  const label = kind === 'price' ? 'il biglietto' : 'il resto';
  const notes = kind === 'change' && L.noted.price !== undefined ? [{ label:'il biglietto', value:L.noted.price }] : [];
  askNumber({ title:'Your notepad', label, notes, tip:kind === 'price' ? 'What did she say? Write it in digits.' : 'How much change did she give you? Write it in digits.',
    onAnswer(x){
      if (!convo || convo.npc !== n) return true;
      if (x === want){
        revealListen({ all:true });
        L.noted[kind] = x; s.pending = null; s.wrong = 0; save(); renderHUD();
        sysLine(`Your notepad: <b>${label} · € ${x}</b>`);
        if (kind === 'price'){ showHint('Written down! Now pay with a twenty-euro note.', 'Fatto!'); return true; }
        L.ticket = true; save();
        const t = l10TicketLine(); npcLine(t.it, t.en); convo.lastNpcText = { it:t.it, en:t.en, listen:false };
        enqueue(() => renderHUD());
        showHint('Ticket bought! Thank her and say goodbye.', 'Fatto!');
        return true;
      }
      s.wrong++; L.mistakes.pad++; save();
      sysLine(`You write <b>€ ${x}</b>. Hmm… is that what she said?`);
      /* 1: ask again (the pad closes); 2: listen again; 3: the line is revealed */
      if (s.wrong === 1){ showHint('Not sure? Ask her, politely, to say it again. Or tell her you didn\'t understand.'); return true; }
      if (s.wrong === 2){ showHint('Still not it. Press <b>🔊 Ascolta di nuovo</b> on her line above to hear it again, slowly.'); return false; }
      revealListen({ all:true });
      showHint(kind === 'price' ? 'Read the price above, then write it in digits.' : 'Read her line above, then write the change in digits.');
      return false;
    } });
}

/* the hint at the window: what the situation needs, never the Italian to say. strong (from the third failed attempt at
   the step) names the key word(s) only. */
function l10CashierHint(n, st){
  if (!l10Cashier(n)) return null;
  const L = S.l10, s = l10St(st);
  if (l10BarrierOn()) return s.asked ? { h:'She asked you something about a ticket. Try to answer with the words you have.', step:'try' }
    : { h:"Greet her: she's a stranger at work, so politely.", step:'greet' };
  if (L.ticket) return { h:'You have your ticket. Thank her and say goodbye.', strong:'Thank her and say goodbye: <b>grazie</b> … <b>arrivederci</b>.', step:'bye' };
  if (!s.greeted) return { h:"Greet her first: she's a stranger at work, so politely.", strong:'Greet her first, politely: <b>buongiorno</b>.', step:'greet' };
  if (s.pending) return { h:`Didn't catch the ${s.pending === 'price' ? 'price' : 'change'}? Ask her to say it again, politely.`, strong:`Ask her to say it again, politely (<b>ripetere</b>).`, step:'repeat' };
  if (!L.slot) return { h:'Ask for a ticket for the next entry. The little sign on the glass says when: <b>16:00</b>.', strong:'Ask for a ticket <b>alle</b> … (16:00 is four in the afternoon).', step:'slot' };
  if (L.noted.price === undefined) return { h:'You have chosen your time. Now the price: ask her how much it is, or to say it again.', step:'price' };
  if (!L.paid) return { h:'Pay with a twenty-euro note.', strong:'Pay: <b>ecco</b> … <b>venti</b> …', step:'pay' };
  return { h:'Thank her and say goodbye.', step:'bye' };
}

/* tests: what the cashier reads from a sentence ("un biglietto per le quattro") */
window.__l10Read = words => { const r = parse(String(words).toLowerCase().split(' '), NPC.cassiera); return r.ok ? l10Read(r.intents) : { fail:r.at }; };
