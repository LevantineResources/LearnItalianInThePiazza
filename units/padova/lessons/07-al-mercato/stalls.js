/* Lesson 7 · Al mercato. The stall conversations (tile bank + hooks): greet first (how-are-you is optional politeness), then
   Quanto costa? → the price as a listening line → Mark's notepad (askNumber, ui/notepad.js).
   A wrong number: Mark asks you to get it repeated (Può ripetere? / Non ho capito → said again slowly);
   a second wrong number reveals the line's text. Until the numbers drill is mastered, Mark stops you. */

/* is this one of the Lesson 7 vendors, in Lesson 7? (Lesson 8 brings its own hooks for them) */
const l7Vendor = n => !!n && S.lesson === 7 && !!S.l7 && !!L7_STALLS[n.id];
/* per-conversation state at a stall */
const l7St = st => st.l7 || (st.l7 = { greeted:false, how:false, pending:false, wrong:0 });
const l7Noted = id => !!S.l7 && S.l7.noted[id] !== undefined;
/* can the player write prices down yet? (the drill must be mastered first: the stalls are "locked") */
const l7CanNote = () => !!(S.vocab7 && S.numbers && S.numbers.mastered);
const l7StallOf = item => Object.values(L7_STALLS).find(s => s.item === item);
const l7Obj = n => n.pron[1] === 'his' ? 'him' : 'her';
/* Mark only speaks when he is in the conversation (he follows you at the market) */
const l7Mark = t => { if (convo && convo.companion === NPC.mark) companionLine(t); };

/* "Sono quindici euro." / "Costa dodici euro." / "È un euro." */
function l7PriceLine(id, p){
  const en = NUM_EN[p];
  if (p === 1) return { it:'È un euro.', en:"It's one euro." };
  return L7_STALLS[id].verb === 'costa' ? { it:`Costa ${numIt(p)} euro.`, en:`It costs ${en} euros.` } : { it:`Sono ${numIt(p)} euro.`, en:`It's ${en} euros.` };
}

/* openConvo (talk hook, before the vendor's opening): Mark points at what he wants */
function l7StallOpen(npc){
  if (!S.l5follow) return;
  convo.companion = NPC.mark;
  const V = L7_STALLS[npc.id];
  if (S.vocab7 && !l7Noted(npc.id)) setTimeout(() => { if (convo && convo.npc === npc) companionLine(V.point); }, 300);
}

/* the price, or why not */
function l7AnswerPrice(n, st, add, out, ints){
  const s = l7St(st), V = L7_STALLS[n.id];
  out.asked = true; st.lastQ = null;
  if (!s.greeted){ add('Buongiorno, eh!', 'Good morning, eh!'); out.l7rude = true; return true; }   // a greeting in the same turn counts
  const other = ints.filter(i => i.startsWith('item7:')).map(i => i.slice(6)).find(i => i !== V.item);
  if (other){
    const o = l7StallOf(other);
    add(`${cap(o.label)}? No, mi dispiace: qui solo ${V.sells.it}.`, `${cap(o.en)}? No, sorry: only ${V.sells.en} here.`);
    out.l7other = true; return true;
  }
  const p = S.l7.prices[V.item], line = l7PriceLine(n.id, p), noted = l7Noted(n.id);
  const pointed = ints.find(i => i.startsWith('this7:'));
  add(V.ask.it, V.ask.en);
  add(line.it, line.en, noted ? undefined : { listen:true });
  s.pending = !noted; S.l7.asked++;
  out.l7price = { id:n.id, p, noted, gender:pointed && pointed.slice(6) !== V.g ? pointed.slice(6) : null };
  return true;
}

Object.assign(LESSON_HOOKS[7], {
  /* the market pack, at the stalls */
  bank(npc, groups){
    /* the opening at Teresa's (flow.js): once Mark has asked, his question is a tile, first in the bank. The usual
       groups follow (the groups array is shared: push and fall through) */
    if (l7BarrierOn(npc) && convo && l7St(convo.st).prompt){ groups.unshift({ label:"Mark's question", tiles:[L7_ASK_TILE] }); return null; }
    if (!S.vocab7 || !l7Vendor(npc)) return null;
    groups.push({ label:'Al mercato', tiles:L7_TILES.map(phraseTile) });
    groups.push({ label:'Polite', tiles:L7_POLITE.map(phraseTile) });
    return groups;
  },
  /* parser words (also what readTyped knows). "Non ho capito" works like "Può ripetere?". */
  phrases(){
    return S.lesson >= 7 ? [['ask_cost', 'quanto costa'], ['this7:m', 'questo'], ['this7:f', 'questa'],
      ['item7:maglietta', 'la maglietta'], ['item7:cravatta', 'la cravatta'], ['item7:fiori', 'il mazzo di fiori'], ['item7:melone', 'il melone'],
      ['repeat', 'non ho capito'], ['l7shirt', 'l7:the-blue-shirt']] : [];   // (l7shirt: the English half of Mark's question tile)
  },

  react(id, n, st, add, out, ints){
    if (!l7Vendor(n)) return false;
    if (l7BarrierOn(n)) return l7BarrierReact(id, n, st, add, out, ints || [id]);   // the opening (flow.js)
    const s = l7St(st), V = L7_STALLS[n.id];
    if (id === 'greet'){ s.greeted = true; return false; }                       // the brain answers as usual
    if (id === 'ask_how' || id === 'answer_how'){ s.how = true; return false; }
    if (id === 'ask_cost') return l7AnswerPrice(n, st, add, out, ints || [id]);
    if (id.startsWith('item7:') || id.startsWith('this7:')){
      if ((ints || []).includes('ask_cost')) return true;                        // part of the question
      const it = id.startsWith('item7:') ? id.slice(6) : V.item, o = l7StallOf(it);
      if (it !== V.item) add(`${cap(o.label)}? No, mi dispiace: qui solo ${V.sells.it}.`, `${cap(o.en)}? No, sorry: only ${V.sells.en} here.`);
      else add(`${V.ask.it.replace(/\?$/, '')}? Sì, bella!`.replace('bella', V.g === 'f' ? 'bella' : 'bello'), `${V.ask.en.replace(/\?$/, '')}? Yes, it's lovely!`);
      return true;
    }
    if (id === 'repeat' && s.pending){
      const line = l7PriceLine(n.id, S.l7.prices[V.item]);
      add('Sì, certo!', 'Yes, of course!'); add(line.it, line.en, { listen:true, rate:0.7 });
      S.l7.repeats++; out.asked = true; out.l7price = { id:n.id, p:S.l7.prices[V.item], noted:false, repeat:true };
      return true;
    }
    if (id === 'thanks'){
      out.asked = true;
      if ((ints || []).includes('bye')){ add('Prego!', "You're welcome!"); return true; }
      if (l7Noted(n.id) || !l7CanNote()){ add('Prego! Arrivederci!', "You're welcome! Goodbye!"); out.end = true; }
      else add('Prego!', "You're welcome!");
      return true;
    }
    if (id === 'bye'){ add('Arrivederci! Buona giornata!', 'Goodbye! Have a nice day!'); out.asked = true; out.end = true; return true; }
    if (id === 'yes' && l7Noted(n.id)){ add('Bene!', 'Good!'); out.asked = true; return true; }
    return false;
  },

  afterTurn(n, out, res){
    if (S.lesson !== 7 || !S.l7) return false;
    /* Bruno told you the way: Mark follows you from now on */
    if (n.id === 'bruno' && out.directions === 'mercato' && S.tut === 'l7-ask'){
      S.l7.notes = L7_BRUNO_DIR.lines.map(l => ({ it:l.it, en:l.en }));
      S.l5follow = true; trail.length = 0;
      setTut('l7-route');
    }
    /* (the generic "he told you the way" hint quotes the Italian to say: this one doesn't) */
    if (n.id === 'bruno' && out.directions === 'mercato'){
      showHint("He told you the way! Didn't catch it? Ask him to repeat, or check a direction. Then thank him.", 'Fatto!');
      return true;
    }
    if (n.id === 'bruno' && out.end && convo.st.lastDir === 'mercato'){ l7Mark('Thanks, Bruno!'); return false; }
    if (!l7Vendor(n)) return false;
    if (l7BarrierOn(n)) return l7BarrierTurn(n, out, res);
    const V = L7_STALLS[n.id], tries = stepTries(convo.st, l7Step(n, convo.st));
    if (out.l7rude){ showHint(hintAfter(tries, 'Greet first: market vendors expect a greeting before business.', 'Greet first: <b>Buongiorno!</b> Market vendors expect a greeting before business.'), 'Consiglio'); return true; }
    if (out.l7other){ showHint(hintAfter(tries, `This stall sells ${esc(V.sells.en)}. Ask about something here.`, `This stall sells ${esc(V.sells.en)}. Ask about something here: <b>quanto costa</b> … <b>${esc(V.label)}</b>`)); return true; }
    const P = out.l7price; if (!P) return false;
    if (P.noted){
      l7Mark(`Already in my notepad: ${NUM_EN[P.p]}.`);
      showHint('You have this price already. Say goodbye.', 'Fatto!'); return true;
    }
    if (!l7CanNote()){
      l7Mark("Way too fast for me. And you look as lost as I am! Let's get the numbers down first. Then we come back.");
      showHint('Master the numbers first: open the numbers drill (<kbd>N</kbd>, or the <b>Numeri</b> button). The stalls will wait.');
      return true;
    }
    enqueue(() => { hintEl.hidden = true; });              // the last hint ("ask the price") is done
    if (P.gender) showHint(`<b>${esc(V.label)}</b> is ${V.g === 'f' ? 'feminine' : 'masculine'}: <b>${V.g === 'f' ? 'questa' : 'questo'}</b>, not ${V.g === 'f' ? 'questo' : 'questa'}. ${n.pron[0]} understood you anyway.`, 'Consiglio');
    l7AskPad(n);
    return true;
  },

  /* the hint at a stall (a vendor chat never "completes" by names, so the generic "introduce yourself" hint is wrong
     here), and Bruno's while he is asked the way. { h, strong, step }: the mild hint never contains the Italian answer;
     the strong one (from the third failed attempt at the step, hintAfter in conversation/turns.js) names the key words. */
  hint(n, st){
    if (S.lesson === 7 && n.id === 'bruno' && ['l7-start', 'l7-ask'].includes(S.tut)) return l7BrunoHint(st);
    if (!l7Vendor(n)) return null;
    if (l7BarrierOn(n)) return l7BarrierHint(st);
    const s = l7St(st), V = L7_STALLS[n.id], P = n.pron[0], step = l7Step(n, st), bye = h => ({ h, strong:`${h} (<b>arrivederci</b>)`, step });
    if (step === 'greet') return { h:'Greet first: market vendors expect a greeting before business.', strong:'Greet first: <b>Buongiorno!</b>', step };
    if (step === 'how') return { h:`${P} asked how you are.`, strong:`${P} asked how you are: <b>sto bene</b>…`, step };
    if (step === 'novocab') return bye(S.tut === 'l7-market' && n.id !== 'teresa' ? "Mark wants the blue shirt on Teresa's stall. Say goodbye, then talk to her." : "You can't ask prices yet. Say goodbye for now.");
    if (step === 'bye') return bye("The price is in Mark's notepad. Say goodbye.");
    if (step === 'drill') return bye('Master the numbers drill first (N). Say goodbye for now.');
    if (step === 'repeat') return { h:`Didn't catch the price? Ask ${l7Obj(n)} to say it again.`, strong:`Didn't catch the price? Ask ${l7Obj(n)} to say it again, politely: <b>ripetere</b>.`, step };
    return { h:`Ask the price of ${V.en}.`, strong:`Ask the price of ${V.en}: <b>quanto costa</b> …`, step };
  },
});

/* where a stall conversation is (the step whose failed attempts stepTries counts) */
function l7Step(n, st){
  const s = l7St(st);
  if (!s.greeted) return 'greet';
  if (st.lastQ === 'how') return 'how';
  if (!S.vocab7) return 'novocab';
  if (l7Noted(n.id)) return 'bye';
  if (!l7CanNote()) return 'drill';
  return s.pending ? 'repeat' : 'price';
}
/* Bruno, asked the way to the market: formal, and the hint never says the question for you */
function l7BrunoHint(st){
  if (st.lastDir) return { h:"He told you the way. Didn't catch it? Ask him to repeat, or check a direction. Then thank him.",
    strong:"He told you the way. Ask him to repeat, politely (<b>ripetere</b>), or thank him (<b>grazie</b>).", step:'dirs' };
  if (st.lastQ === 'how') return { h:'He asked how you are.', strong:'He asked how you are: <b>sto bene</b>…', step:'how' };
  if (!st.npcGreeted) return { h:"Greet him first. He's older and formal: speak to him like a stranger.", strong:'Greet him first, politely: <b>Buongiorno</b>.', step:'greet' };
  return { h:'Ask him the way to the market, politely (Lei).', strong:"Ask him where (<b>dov'è</b>) the market is, politely.", step:'ask' };
}

/* Mark's notepad: write down the price you heard */
function l7AskPad(n){
  const V = L7_STALLS[n.id], s = l7St(convo.st);
  const notes = Object.keys(L7_STALLS).filter(l7Noted).map(id => ({ label:L7_STALLS[id].label, value:S.l7.noted[id] }));
  askNumber({ label:V.label, notes, tip:`What did ${l7Obj(n) === 'him' ? 'he' : 'she'} say? Write it in digits.`,
    onAnswer(x){
      if (!convo || convo.npc !== n) return true;
      const p = S.l7.prices[V.item];
      if (x === p){ l7Right(n, p); return true; }
      s.wrong++; S.l7.wrong++;
      sysLine(`You write <b>€ ${x}</b>.`);
      if (s.wrong === 1){
        l7Mark(`€${x}? Hmm, are you sure? Ask ${l7Obj(n)} to repeat.`);
        showHint(`Ask ${l7Obj(n)} to say it again, slowly. Your <b>Polite</b> and <b>Al mercato</b> tiles have a way to say it.`);
        return true;                                       // the tile bank comes back
      }
      revealListen({ all:true });
      l7Mark("Still not sure… Look, you can read it now. Check the dictionary if you need to.");
      showHint('Read the price above. Look the number up in the dictionary (<b>Numeri 0–20</b>), then write it in digits.');
      return false;                                        // the notepad stays open
    } });
}
function l7Right(n, p){
  const V = L7_STALLS[n.id], s = l7St(convo.st);
  revealListen({ all:true });
  S.l7.noted[n.id] = p; s.pending = false; save(); renderHUD();
  sysLine(`Mark's notepad: <b>${esc(V.label)} · € ${p}</b>`);
  l7Mark(`${cap(NUM_EN[p])}. Got it.`);
  npcLine(V.after.it, V.after.en);
  if (l7AllNoted() && !S.l7.allNoted){
    S.l7.allNoted = true; save();
    const w = id => NUM_EN[S.l7.noted[id]];
    l7Mark(`Shirt ${w('teresa')}, tie ${w('franco')}, flowers ${w('gino')}… the shirt it is. I'll grab some cash and come back for it. Grazie, amico!`);
    showHint('All three prices are in Mark\'s notepad! Say goodbye.', 'Fatto!');
  } else showHint('Written down! Say goodbye, or just leave.', 'Fatto!');
}
