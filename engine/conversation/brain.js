/* respond(): how a tile-bank NPC reacts to the intents you said. */

/* ---------- the NPC brain ----------
   1. resolve "e tu?", bare names and bare places from context
   2. react to every phrase the player said, in order (greetings, names, how-are-you, orders, directions)
   3. if the player asked something they haven't answered themselves, bounce it back ("E tu?")
   4. otherwise re-ask an ignored question, or follow the NPC's own agenda
   5. once the conversation's goal is met, wait for the player's goodbye */
const CLOSE_FIRST = { it:'Ciao, {Me}! A presto!', en:'Bye, {Me}! See you soon!' };
const CLOSE_AGAIN = { it:'A dopo, {Me}!', en:'See you later, {Me}!' };
/* the generic goodbye follows the NPC's register: someone who uses Lei (a vendor, the cashier, Rosa) says arrivederci, and
   wishes you a good day or, in the evening (night, or a game clock from 17:00), a good evening */
function closeLine(n, again){
  if (!n.formal) return again ? CLOSE_AGAIN : CLOSE_FIRST;
  const c = typeof gameClock === 'function' ? gameClock() : null;
  return daytime() === 'night' || (c && c.h >= 17) ? { it:'Arrivederci! Buonasera!', en:'Goodbye! Good evening!' }
    : { it:'Arrivederci! Buona giornata!', en:'Goodbye! Have a nice day!' };
}
function question(n, key){
  const F = n.formal;
  return {
    how:   F ? { it:'Come sta?', en:'How are you?' } : { it:'Come stai?', en:'How are you?' },
    name:  F ? { it:'Come si chiama?', en:"What's your name?" } : { it:'Come ti chiami?', en:"What's your name?" },
    order: { it:'Cosa prende?', en:'What will you have?' },
    more:  { it:'Altro?', en:'Anything else?' },
    friend: F ? { it:'E il Suo amico?', en:'And your friend?' } : { it:'E il tuo amico?', en:'And your friend?' },
  }[key];
}
const backQ = n => n.formal ? { it:'E Lei?', en:'And you?' } : { it:'E tu?', en:'And you?' };

function respond(rawIn){
  let raw = rawIn.slice();
  const st = convo.st, n = convo.npc;
  const out = { frags:[], dirLines:[], slow:false, learned:false, end:false, asked:false, altro:false, served:false, price:0, items:[], directions:null };
  /* add(it, en, { listen, rate, gloss, speaker }?): a listen fragment becomes its own listening line (see npcLine); speaker: another person in the conversation says it (its own bubble) */
  const add = (it, en, o) => out.frags.push({ it:fill(it), en:fill(en), ...(o || {}) });
  const wasWrapping = st.wrapping;

  /* "questa è <place>?" checks a place; an intro marker plus the friend's name (UNIT.friend: Padova's Mark, Lesson 5) introduces him */
  {
    const fixed = [];
    for (let k = 0; k < raw.length; k++){
      if ((raw[k] === 'this:f' || raw[k] === 'this:m') && raw[k + 1] && raw[k + 1].startsWith('place:')){ fixed.push('isthis:' + raw[k + 1].slice(6)); k++; continue; }
      fixed.push(raw[k]);
    }
    raw = fixed;
  }
  const markers = raw.filter(id => /^(intro:|this:|myfriend:|heis$)/.test(id));
  const FN = UNIT.friend ? 'name:' + UNIT.friend.id : null;      // the friend's name (Padova: Mark), as the parser reads it
  if (FN && raw.includes(FN) && markers.length){
    const form = raw.includes('intro:le') ? 'le' : raw.includes('intro:ti') ? 'ti' : '';
    const at = raw.indexOf(markers[0]);
    raw = raw.filter(id => !markers.includes(id) && id !== FN);
    raw.splice(Math.min(at, raw.length), 0, 'intro_mark' + (form ? ':' + form : ''));
  } else if (FN) raw = raw.map(id => id === FN ? 'mention_mark' : id);

  const ints = [];
  raw.forEach((id, k) => {
    const prev = ints[ints.length - 1];
    let r = id;
    if (id.startsWith('isthis:')){ const key = id.slice(7); r = key !== '?' && n.directions && n.directions[key] ? 'where:' + key : id; }
    if (id === 'ask_back') r = prev === 'answer_how' ? 'ask_how' : prev === 'give_name' ? 'ask_name'
      : st.lastQ === 'how' ? 'ask_how' : st.lastQ === 'name' ? 'ask_name'
      : (!st.npcToldName && st.playerGaveName) ? 'ask_name' : 'ask_how';
    if (id === 'name_only') r = st.lastQ === 'name' ? 'give_name' : 'address';
    if (id === 'where'){ const nx = raw[k + 1]; r = nx && nx.startsWith('place:') ? 'skip' : 'where:?'; }
    if (id.startsWith('place:')) r = 'where:' + id.slice(6);
    if (r === 'skip') return;
    if (r !== prev || r.startsWith('item:')) ints.push(r);
  });

  if (!st.npcGreeted){
    const nm = st.playerGaveName ? ', {Me}' : '';
    add(n.greet.it + nm + '!', n.greet.en + nm + '!'); st.npcGreeted = true;
  }
  let askedHowNow = false, askedNameNow = false, saidNo = false, saidYes = false, askedPrice = false, saidThanks = false, onlyExcuse = true;
  const giveDirections = key => {
    const d = n.directions[key];
    add(d.intro.it, d.intro.en);
    out.dirLines = d.lines.map(l => ({ it:fill(l.it), en:fill(l.en) }));
    st.lastDir = key; st.lastQ = null; out.directions = key; out.asked = true;
  };
  ints.forEach((id, k) => {
    const next = ints[k + 1];
    if (!['excuse','greet','address'].includes(id)) onlyExcuse = false;
    if (id.startsWith('item:')){ out.items.push(id.slice(5)); return; }
    if (id.startsWith('where:')){
      const key = id.slice(6);
      if (key === '?'){ add("Dov'è… cosa?", 'Where is… what?'); return; }
      const d = n.directions && n.directions[key];
      if (!d){ add(`${cap(PLACES[key][0])}? Mmm… non lo so.`, `${PLACES[key][1]}? Hmm… I don't know.`); return; }
      if (n.askNameFirst && !st.playerGaveName){ st.pendingWhere = key; add(`${cap(PLACES[key][0])}? Sì, sì!`, `${PLACES[key][1]}? Yes, yes!`); return; }
      giveDirections(key); return;
    }
    if (id.startsWith('intro_mark')){
      const form = id.split(':')[1];
      if (!st.introducedMark){
        st.introducedMark = true; out.introMark = true; if (st.lastQ === 'friend') st.lastQ = null;
        if (form === 'le' && !n.formal) add('Le presento? Che formale!', 'May I introduce? How formal!');
        const F = UNIT.friend.name, h = n.markHello || (n.formal ? { it:`Piacere, ${F}!`, en:`Nice to meet you, ${F}!` } : { it:`Ciao ${F}! Piacere!`, en:`Hi ${F}! Nice to meet you!` });
        add(h.it, h.en);
        if (form === 'ti' && n.formal) out.tiToFormal = true;
      } else add(`Sì, sì! Ciao, ${UNIT.friend.name}!`, `Yes, yes! Hi, ${UNIT.friend.name}!`);
      return;
    }
    if (id.startsWith('isthis:')){
      const key = id.slice(7);
      if (key === '?') add('Questa è… cosa?', 'This is… what?');
      else add(`${cap(PLACES[key][0])}? No, non è qui.`, `${PLACES[key][1]}? No, it isn't here.`);
      return;
    }
    if (id === 'mention_mark'){ const F = UNIT.friend.name; if (st.introducedMark) add(`Sì, ${F}!`, `Yes, ${F}!`); else { add(`${F}? Chi è ${F}?`, `${F}? Who is ${F}?`); out.whoMark = true; } return; }
    if (id === 'english'){ const e = n.englishReply || (n.formal ? { it:'Ah, inglese! Benvenuto in Italia!', en:'Ah, English! Welcome to Italy!' } : { it:'Ah, inglese! Benvenuto!', en:'Ah, English! Welcome!' }); add(e.it, e.en); return; }
    if (id === 'noitalian'){ if (n.formal) add('Nessun problema! Lei parla benissimo.', 'No problem! You speak very well.'); else add('Nessun problema! Parli tu per lui.', 'No problem! You speak for him.'); return; }
    if (id === 'friends'){ add('Che bello!', 'How lovely!'); return; }
    if (id.startsWith('confirm:')){
      const d = st.lastDir && n.directions[st.lastDir];
      const c = d && d.confirm && d.confirm[id.slice(8)];
      if (c) add(c.it, c.en); else add('Cosa?', 'What?');
      out.asked = true; return;
    }
    /* lesson hooks (7+) can answer their own intents: react(id, npc, st, add, out, ints, k) returns true when handled
       (ints: every intent of this sentence, k: the index of this one) */
    if (askHooks('react', id, n, st, add, out, ints, k)) return;
    switch (id){
      case 'ask_how': add(n.answerHow.it, n.answerHow.en); askedHowNow = true; break;
      case 'answer_how':
        st.playerToldHow = true; if (st.lastQ === 'how') st.lastQ = null;
        if (next !== 'ask_how') add('Bene!', 'Good!');
        break;
      case 'give_name':
        st.playerGaveName = true; if (st.lastQ === 'name') st.lastQ = null;
        if (!st.npcSaidPiacere){ add('Piacere, {Me}!', 'Nice to meet you, {Me}!'); st.npcSaidPiacere = true; }
        break;
      case 'ask_name':
        add(`Mi chiamo ${n.name}.`, `My name is ${n.name}.`); askedNameNow = true;
        if (!st.npcToldName){ st.npcToldName = true; out.learned = true; }
        break;
      case 'nice':
        if (!st.npcSaidPiacere && (st.playerGaveName || st.npcToldName)){ add('Piacere!', 'Nice to meet you!'); st.npcSaidPiacere = true; }
        break;
      case 'far': {
        const d = n.directions && n.directions[st.lastDir || st.pendingWhere];
        if (d && d.far) add(d.far.it, d.far.en); else add('Cosa?', 'What?');
        out.asked = true; break;
      }
      case 'repeat':
        if (st.lastDir){
          const d = n.directions[st.lastDir];
          add('Sì, certo!', 'Yes, of course!');
          out.dirLines = (d.lines.length ? d.lines : [d.intro]).map(l => ({ it:fill(l.it), en:fill(l.en) }));
          out.slow = true; out.asked = true;
        } else if (convo.lastNpcText && convo.lastNpcText.listen){ add('Sì, certo!', 'Yes, of course!'); add(convo.lastNpcText.it, convo.lastNpcText.en, { listen:true, rate:0.7 }); }
        /* (the line again in a bubble of its own, a little slower: so it is the last line, and asking again repeats it again) */
        else if (convo.lastNpcText){ add('Sì, certo!', 'Yes, of course!'); add(convo.lastNpcText.it, convo.lastNpcText.en, { rate:0.7 }); }
        out.asked = true;
        break;
      case 'no': saidNo = true; break;
      case 'yes': saidYes = true; break;
      case 'how_much': askedPrice = true; break;
      case 'thanks': saidThanks = true; break;
    }
  });

  if (wasWrapping && !n.barista){ const c = closeLine(n, st.revisit); add(c.it, c.en); out.end = true; return out; }
  if (saidThanks && st.lastDir && n.dirBye && !out.directions){ add(n.dirBye.it, n.dirBye.en); out.end = true; return out; }

  if (n.barista){
    const wasServed = st.served;
    if (out.items.length){
      if (st.served){ st.order = []; st.served = false; }
      out.items.forEach(w => { if (!st.order.includes(w)) st.order.push(w); });
      const q = question(n, 'more');
      add(orderIt(st.order) + ' ' + q.it, orderEn(st.order) + ' ' + q.en);
      st.lastQ = 'more'; out.asked = true; out.altro = true;
    } else if (saidNo && st.lastQ === 'more' && st.order.length){
      st.served = true; st.lastQ = null; add('Ecco!', 'Here you go!'); out.served = true;
    } else if (saidYes && st.lastQ === 'more'){
      add('Cosa?', 'What would you like?'); out.asked = true;
    }
    if (askedPrice && st.order.length){ const p = priceOf(st.order); add(priceIt(p), `That's ${euroEn(p)}.`); out.price = p; st.priceHeard = true; }
    if (saidThanks && wasServed && st.served){ add('Prego! Buona giornata!', "You're welcome! Have a nice day!"); out.end = true; return out; }
  }

  if (!out.asked){
    if (askedHowNow && !st.playerToldHow){ const b = backQ(n); add(b.it, b.en); st.lastQ = 'how'; out.asked = true; }
    else if (askedNameNow && !st.playerGaveName){ const b = backQ(n); add(b.it, b.en); st.lastQ = 'name'; out.asked = true; }
  }
  if (!out.asked && st.lastQ){ const q = question(n, st.lastQ); add(q.it, q.en); out.asked = true; }
  if (!out.asked){
    for (const g of (st.revisit ? n.revisitAgenda : n.agenda)){
      if (g === 'how' && !st.playerToldHow){ const q = question(n, 'how'); add(q.it, q.en); st.lastQ = 'how'; out.asked = true; break; }
      if (g === 'name' && !st.playerGaveName){ const q = question(n, 'name'); add(q.it, q.en); st.lastQ = 'name'; out.asked = true; break; }
      if (g === 'tellName' && st.playerGaveName && !st.npcToldName){
        add(`Mi chiamo ${n.name}.`, `My name is ${n.name}.`); st.npcToldName = true; out.learned = true;
      }
      if (g === 'introMark' && unitHook('friendHere') && st.playerGaveName && !st.introducedMark){ const q = question(n, 'friend'); add(q.it, q.en); st.lastQ = 'friend'; out.asked = true; break; }
      if (g === 'order' && !st.order.length && !st.served){ const q = question(n, 'order'); add(q.it, q.en); st.lastQ = 'order'; out.asked = true; break; }
    }
  }
  if (st.pendingWhere && st.playerGaveName && !(n.needsMarkIntro && unitHook('friendHere') && !st.introducedMark) && !out.directions && !out.asked){ const k = st.pendingWhere; st.pendingWhere = null; giveDirections(k); }

  if (!out.frags.length && !out.dirLines.length && onlyExcuse && ints.length) { add('Sì?', 'Yes?'); }

  if (!n.barista){
    /* she still has to tell you the way (or, before the Lesson 3 words, you still have to ask her in English) */
    const needDir = (n.needDirIn && n.needDirIn.includes(S.tut) && !st.lastDir) || !!unitHook('askInEnglish', n);
    const complete = st.revisit ? st.playerToldHow : (st.npcToldName && st.playerGaveName && st.playerToldHow);
    if (complete && !out.asked && !needDir) st.wrapping = true;
  }
  return out;
}
