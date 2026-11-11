/* Lesson 13 · Il treno della notte. The conversations: the conductor on the platform, Nino (the booking: your name; the
   order, typed, translating for Margaret; at bedtime, quando), Margaret (English only: her lines in her own conversation are
   hers; when you speak or translate for her, her lines sit on your side), the introductions at each table (you and Margaret:
   Lina and Ernesto, la signora Ferri, il signor Rinaldi; tiles, Lessons 1–5 review, Lei), telling your day to Lina and Ernesto
   from the quests you really did in Lesson 12 (content.js L13_DAY, by quest number: their things, Lina's questions about
   them; with few quests done, every quest's things and any question), Margaret's "Tell her I saw the church too!" (anche), and
   la signora Ferri's words for Margaret (TYPED_SCRIPTS.l13_ferri: choices for her Italian, typing for Margaret's English).
   A turn is read whole at its first intent (the react hook) from the tiles used (their keys, or their words for the set
   phrases: e, poi, ma, Sì, No…), so a greeting in the same turn as anything else counts; the reply follows what was said, and
   the hints say what is needed in English, never the Italian (the key words only from the third failed attempt: hintAfter).
   Ernesto talks to you through Lina's conversation (redirect), and adds his own lines (speaker: Ernesto). */

const L13C = { open:null };
const l13Conv = () => convo && convo.l13 ? convo.l13 : null;
const L13_TILE_KINDS = ['seat', 'intro', 'day', 'when'];
const l13Cast = n => !!n && (L13_CAST.includes(n.id) || n.id === 'capotreno');
QWORDS.add('e lei'); QWORDS.add('cosa'); CLAUSE.add('e lei'); CLAUSE.add('cosa'); CLAUSE.add("di dov'è"); JOIN.add("di dov'è"); JOIN.add('cosa ha'); EXCL.add('che bello'); NOTQ.add('ho');
/* the joining words: Ho visto il museo, ma ho preso il treno. · No, ma ho visto il museo. · Perché c'è il mare! · E Lei, perché Venezia? ·
   Quando arriviamo a Venezia? */
COMMA_BEFORE.add('ma'); COMMA_BEFORE.add('lei perché'); EXCL.add('perché'); JOIN.add("perché c'è"); NOTQ.add("perché c'è"); QWORDS.add('quando'); CLAUSE.add('quando');
/* Margaret: Lei è Margaret. È inglese, di Londra. Non parla italiano. · Anche Margaret ha visto la chiesa. */
CLAUSE.add('lei è'); JOIN.add('lei è'); CLAUSE.add('è\u00a0inglese'); CLAUSE.add('non\u00a0parla\u00a0italiano'); COMMA_BEFORE.add('è\u00a0inglese di'); JOIN.add('margaret ha'); NOTQ.add('anche'); NOTQ.add('margaret ha');
/* prima / dopo: Prima di partire, ho comprato il formaggio. · Dopo, ho visto il tramonto. · Prima ho visto la basilica, poi … */
['partire', 'treno', 'ballare', 'dopo'].forEach(w => COMMA_BEFORE.add(w + ' ho'));
{ const last = s => s.split(' ').pop().toLowerCase();
  /* (Lesson 9 makes poi start a sentence: Giri a sinistra. Poi vada…; after one of our things it joins: …la basilica, poi ho…) */
  [...Object.values(L13_DAY).flat(), ...L13_DAY_ANY].map(d => last(d.label)).concat(Object.values(L13_LOC).map(l => last(l[0]))).forEach(w => {
    COMMA_BEFORE.add(w + ' poi'); if (!['farmacia', 'mercato'].includes(w)) JOIN.add(w + ' poi'); }); }

/* ---------- what you can say about your day: the things of the quests you did (or, with few done, of every quest) ---------- */
function l13DoneQuests(){ return QUESTS.filter(q => (questPeek(q.id) || {}).done).map(q => q.n).sort((a, b) => a - b); }
/* few quests done (the skip, a quick Lesson 12): every quest's things are in the bank, and Lina asks about any of them */
const l13Free = () => l13DoneQuests().filter(n => L13_DAY[n]).length < 3;
function l13DayItems(){
  const out = [], free = l13Free(), done = new Set(l13DoneQuests());
  Object.keys(L13_DAY).map(Number).sort((a, b) => a - b).forEach(n => { if (free || done.has(n)) L13_DAY[n].forEach(d => out.push({ ...d, quest:n })); });
  L13_DAY_ANY.forEach(d => out.push({ ...d, quest:0 }));
  return out;
}
const l13Item = key => l13DayItems().find(d => d.key === key) || null;
const l13AnyItem = key => l13AllItems().find(d => d.key === key) || null;
/* the participles in the bank: those the things you can say need, and a few more (in the handbook's order) */
function l13PPs(){
  const need = new Set(['visto', 'preso', 'fatto', 'mangiato', 'comprato']);
  l13DayItems().forEach(d => d.pp.forEach(p => need.add(p)));
  return L13_PP.filter(t => need.has(t.key.slice(3))).map(t => t.key.slice(3));
}
const l13Locs = () => Object.keys(L13_LOC).filter(k => l13DayItems().some(d => (d.locs || []).includes(k)));
/* the sentence a clause makes ("Ho comprato il formaggio al mercato.") */
const l13Sentence = c => `${c.subj === 'margaret' ? 'Margaret ' : ''}${cap(c.aux || 'ho')} ${c.pp} ${(l13AnyItem(c.obj) || { label:c.obj }).label}${(c.locs || []).map(k => ' ' + L13_LOC[k][0]).join('')}.`.replace(/^Margaret Ha/, 'Margaret ha');
/* a tile read as one word by the parser (its words joined by no-break spaces), so the brain's own intents for the same words
   (è inglese, non parla italiano: Lesson 5; la chiesa: a place) don't answer before ours */
const L13_GLUED = new Set(['mg:è inglese', 'mg:non parla italiano', 'obj:chiesa']);
const l13Glue = t => { const p = phraseTile(t); return { ...p, tokens:[{ w:p.tokens.map(x => x.w).join('\u00a0'), label:p.tokens.map(x => x.label).join(' ') }] }; };
/* the Margaret tile: her name, kept with a capital in the sentence (not a name tile: no vocative comma) */
const l13MargTile = () => ({ key:'who:margaret', label:'Margaret', gloss:'Margaret (the English lady at your table)', tokens:[{ w:'margaret', label:'Margaret' }] });

/* ---------- the openings, by situation (read by the cast's opening getters: flow.js) ---------- */
function l13Open(it, en){ L13C.open = { it:fill(it), en:fill(en) }; }
/* Margaret's English, on your side of the transcript (you speak for her); Ernesto's lines in Lina's conversation */
const l13MargLine = s => npcLine(fill(s), null, { english:true, companion:true, speaker:NPC.margaret });
const l13ErnestoLine = (i, e) => npcLine(fill(i), fill(e), { speaker:NPC.ernesto, forceKnown:!!S.known.ernesto });

/* ---------- talk: who you talk to, and how ---------- */
function l13Talk(npc){
  if (!l13On()) return false;
  const L = S.l13, t = S.tut, id = npc.id;
  L13C.open = null;
  const it = (i, e, o) => npcLine(fill(i), fill(e), o), sys = h => sysLine(h);
  const cut = () => { convo.mode = 'cutscene'; convo.known = true; $('#dlgWho').innerHTML = `<b>${esc(npc.name)}</b> <span class="where">· ${esc(npc.place)}</span>`; };
  const leave = (extra = []) => showChoices([...extra, { label:'Leave', primary:!extra.length, fn:closeDialog }]);
  const tile = (kind, o = {}) => { convo.l13 = { kind, fails:0, said:[], ...o }; };
  const later = fn => setTimeout(() => { if (convo && convo.npc === npc) fn(); }, 320);      // (after the opening line)
  const beforeDinner = l13BookTut(t) || t === 'l13-board' || (t === 'l13-dinner' && ['arrive', 'seat', 'meet', 'order', 'eat'].includes(L.phase));
  if (id === 'capotreno'){
    cut();
    if (t === 'l13-board' && !L.boarded){ it('Buonasera! Il Laguna Express per Venezia: carrozza cinque. Prego, salga!', 'Good evening! The Laguna Express to Venice: carriage five. Please, get on!'); leave(); return true; }
    it('Buon viaggio!', 'Have a good trip!'); leave(); return true;
  }
  if (id === 'margaret') return l13Margaret(npc, cut, leave);
  if (id === 'gianni'){
    cut(); S.met.gianni = S.known.gianni = true; save();
    if (t === 'l13-day') it('Scusi, ho fretta: tra poco guido io!', "Sorry, I'm in a hurry: I'm driving soon!");
    else it('Buonasera! Io sono Gianni, il macchinista. Mangio e torno al lavoro!', "Good evening! I'm Gianni, the driver. I eat and go back to work!");
    leave(); return true;
  }
  if (id === 'nino'){
    if (t === 'l13-dinner' && L.phase === 'seat'){ tile('seat', { greeted:false }); l13Open('Buonasera! Prego! Il Suo nome, per la prenotazione?', 'Good evening! Come in! Your name, for the booking?'); convo.known = true; return false; }
    if (t === 'l13-dinner' && L.phase === 'order'){                                    // the typed order (TYPED_SCRIPTS.l13_order)
      if (!(S.l6.steps.l13_order > 0)) sysLine(l13MenuCard());
      return false;
    }
    if (t === 'l13-night' && !L.askedWhen){                                           // bedtime: when do we get to Venice?
      tile('when'); convo.known = true;
      l13Open('Ah, {Me}! È tardi, eh? Mi dica!', "Ah, {Me}! It's late, isn't it? What can I do for you?");
      return false;
    }
    cut();
    if (l13BookTut(t) || t === 'l13-board' || (t === 'l13-dinner' && L.phase === 'arrive')) it('Buonasera! La cena è alle undici e quarantacinque. Ancora un momento!', 'Good evening! Dinner is at a quarter to twelve. Just a moment more!');
    else if (t === 'l13-dinner' && L.phase === 'meet') it('Un momento! Il menù arriva subito!', 'Just a moment! The menu is coming right away!');
    else if (t === 'l13-day' || t === 'l13-night') it('Ha mangiato bene? Grazie! Buonanotte!', 'Did you enjoy your meal? Thank you! Good night!');
    else it('Buon appetito!', 'Enjoy your meal!');
    leave(); return true;
  }
  if (id === 'lina'){
    $('#dlgWho').innerHTML = `<b>${S.known.lina ? 'Lina e Ernesto' : 'Someone'}</b> <span class="where">· the table by the window</span>`;
    if (t === 'l13-dinner' && L.phase === 'intro' && !L.met.bassi){ tile('intro', { who:'bassi', agenda:['name', 'who', 'from'] }); l13Open('Buonasera! Che bello, due visi nuovi!', 'Good evening! How nice, two new faces!'); return false; }
    if (beforeDinner){ return l13NotYet(npc, cut, leave); }
    if (t === 'l13-day' && L.phase === 'bassi'){
      tile('day', { who:'bassi' });
      const st = l13Stage(), q = st === 'yes' ? l13Q(L.qYes) : st === 'ma' ? l13Q(L.qNo) : null;
      if (st === 'why') l13Open('Allora, {Me}: perché Venezia?', 'So, {Me}: why Venice?');
      else if (st === 'back') l13Open('Che bella serata, {Me}!', 'What a lovely evening, {Me}!');
      else if (q) l13Open(q.it, q.en);
      else if (st === 'anche'){ l13Open('Allora, {Me}? La signora vuole dire qualcosa?', 'So, {Me}? The lady wants to say something?'); later(() => l13MargLine(L13_MARG_LINES.again)); }
      else if (st === 'dopo'){ l13Open('Ernesto vuole sapere: e dopo?', 'Ernesto wants to know: and after that?'); }
      else l13Open(l13Told('bassi') ? 'E poi? Cosa ha fatto?' : 'Scusi, {Me}! Venga, venga: siamo curiosi! E Lei, cosa ha fatto oggi a Padova?',
        l13Told('bassi') ? 'And then? What did you do?' : "Excuse me, {Me}! Come, come: we're curious! And you, what did you do in Padua today?");
      return false;
    }
    cut();
    if (t === 'l13-dinner' && L.phase === 'intro') it('Buona cena, {Me}!', 'Enjoy your dinner, {Me}!');
    else if (t === 'l13-day') it('Che bella giornata, la Sua! E domani, Venezia!', 'What a lovely day you had! And tomorrow, Venice!');
    else if (t === 'l13-night') it('Buonanotte, {Me}!', 'Good night, {Me}!');
    else it('Buona cena!', 'Enjoy your dinner!');
    leave(); return true;
  }
  if (id === 'ferri'){
    if (t === 'l13-dinner' && L.phase === 'intro' && !L.met.ferri){ tile('intro', { who:'ferri', agenda:['name', 'who', 'from'] }); l13Open('Buonasera…', 'Good evening…'); return false; }
    if (beforeDinner) return l13NotYet(npc, cut, leave);
    if (t === 'l13-day' && L.phase === 'ferri' && L.ferri === 'talk') return false;      // the typed translation (TYPED_SCRIPTS.l13_ferri)
    cut();
    if (t === 'l13-day' && L.phase === 'bassi') it('Ah, {Me}! Lina e Ernesto La aspettano! Parlano, parlano…', 'Ah, {Me}! Lina and Ernesto are waiting for you! They talk and talk…');
    else if (t === 'l13-day') it('Grazie, {Me}. Che pace, adesso!', 'Thank you, {Me}. So peaceful, now!');
    else it('Buona cena, {Me}.', 'Enjoy your dinner, {Me}.');
    leave(); return true;
  }
  if (id === 'rinaldi'){
    if (t === 'l13-dinner' && L.phase === 'intro' && !L.met.rinaldi){ tile('intro', { who:'rinaldi', agenda:['name', 'who', 'speak'] }); l13Open('Mmm? … Buonasera.', 'Hmm? … Good evening.'); return false; }
    if (beforeDinner) return l13NotYet(npc, cut, leave);
    cut(); it('Scusi, sono al telefono… Pronto? Sì, sì…', "Sorry, I'm on the phone… Hello? Yes, yes…"); leave(); return true;
  }
  if (id === 'lucaferri' || id === 'sofiaferri'){ cut(); it('Ciao! … Shhh!', 'Hi! … Shhh!'); leave(); return true; }
  return false;
}
/* before dinner, the others are busy eating: introductions after */
function l13NotYet(npc, cut, leave){
  cut(); npcLine('Buonasera! … Buon appetito!', 'Good evening! … Enjoy your meal!');
  sysLine(S.tut === 'l13-dinner' && S.l13.phase !== 'arrive' ? 'Dinner first: your table, and Margaret. There will be time to chat afterwards.' : 'Dinner hasn\'t started yet.');
  leave(); return true;
}

/* ---------- Margaret (English only) ---------- */
const L13_MARG_LINES = {
  church:"The basilica? The big church with all the domes? Oh, tell them I saw the church too! This morning, with my guidebook.",
  churchToo:"The basilica! The big church with all the domes? Oh, tell them I saw it too, dear! This morning, with my guidebook.",
  again:"Tell them I saw the church too, dear! The big one.",
  done:"Did that work? She's beaming at me. Wonderful!",
  why:"Venice! Ask them why they're going, dear. I bet it's a honeymoon.",
  anniv:"Fifty years! Oh, how lovely. Tell them congratulations from me… well, they can see it in my face.",
  intro:{ bassi:"Sorry, dear, what is she asking me? You'd better answer for me.", ferri:"Is she talking to me? Help, dear!", rinaldi:"Is he talking to me? I'm afraid I haven't a clue." },
};
function l13Margaret(npc, cut, leave){
  const L = S.l13, t = S.tut;
  cut();
  const say = (s, o) => npcLine(fill(s), null, { english:true, ...(o || {}) });
  if (t === 'l13-dinner' && L.phase === 'meet' && !L.met.margaret){
    say("Oh, hello! You must be seventeen. The chef said you'd keep me company. I'm Margaret, from London. And this little rascal is Biscuit.");
    showChoices([{ label:'“Nice to meet you, Margaret!”', primary:true, cls:'english', fn:() => {
      choices.hidden = true; meLine('Nice to meet you, Margaret!', { english:true });
      say("Do you speak Italian? I don't, not a word, and I can't make head or tail of this menu. Would you help me order? Here comes the chef!");
      showChoices([{ label:'“Of course!”', primary:true, cls:'english', fn:() => {
        choices.hidden = true; meLine('Of course!', { english:true });
        L.met.margaret = true; S.met.margaret = S.known.margaret = true; save(); renderHUD();
        say("Splendid. You're a lifesaver.");
        enqueue(() => { if (convo) convo.done = true; });
        leave();
      } }]);
    } }]);
    return true;
  }
  if (t === 'l13-dinner' && L.phase === 'intro' && !L.margAsked){
    say("That was delicious. Thank you, dear! … Now, everyone in here keeps looking at us. Would you go round and say good evening? And tell them who I am: I can't say a word in Italian! I'm English, from London, if they ask.");
    showChoices([{ label:'“Of course! Leave it to me.”', primary:true, cls:'english', fn:() => {
      choices.hidden = true; meLine('Of course! Leave it to me.', { english:true });
      L.margAsked = true; save(); renderHUD();
      say("Lovely. Biscuit and I will mind the table.");
      enqueue(() => { if (convo) convo.done = true; });
      leave();
    } }]);
    return true;
  }
  if (t === 'l13-board' || l13BookTut(t)) say("Oh, hello there! Dinner's not till a quarter to twelve, I'm told.");
  else if (t === 'l13-dinner' && ['arrive', 'seat'].includes(L.phase)) say('Oh, hello there!');
  else if (t === 'l13-dinner' && ['meet', 'order'].includes(L.phase)) say('Here comes the chef with the menu, I think!');
  else if (t === 'l13-dinner' && L.phase === 'eat') say('Delicious! Thank you so much for ordering for me.');
  else if (t === 'l13-dinner' && L.phase === 'intro') say(l13MetCount() < 3 ? `Go on, dear! ${3 - l13MetCount()} ${3 - l13MetCount() === 1 ? 'table' : 'tables'} to go, by my count. Tell them who I am!` : 'Well done, dear!');
  else if (t === 'l13-day' && L.phase === 'bassi') say("Go on, tell the couple all about your day! I'd only bore them with stories about Biscuit.");
  else if (t === 'l13-day' && L.phase === 'ferri') say('The lady with the children wants us, dear! Over there.');
  else if (t === 'l13-day') say('What a sweet woman. Those poor children, stuck in a compartment all night!');
  else if (t === 'l13-night') say(NPC.biscuit && S.l13.beats.beg ? "Off to bed? Goodnight, dear! I'll finish my tea. Biscuit, come away from that kitchen, you greedy thing!" : 'Goodnight, dear!');
  else say('Goodnight!');
  leave();
  return true;
}

/* ---------- the tile bank ---------- */
function l13Bank(npc, groups, names){
  if (!l13On() || !l13Cast(npc) || !convo || !convo.l13 || !L13_TILE_KINDS.includes(convo.l13.kind)) return null;
  const k = convo.l13.kind, L = S.l13;
  /* (a tile the set phrases already have, e, poi, ma, Sì, No, E Lei?…, is not shown twice) */
  const have = new Set(((groups[0] && groups[0].tiles) || []).map(t => (t.tokens || [t]).map(x => x.w).join(' ')));
  const T = list => list.map(t => t.tokens ? t : L13_GLUED.has(t.key) ? l13Glue(t) : phraseTile(t)).filter(t => !have.has(t.tokens.map(x => x.w).join(' ')));
  const yn = [l13Tile('soc:si', 'Sì', 'yes', 'sì'), l13Tile('no', 'No', 'no', 'no')];
  const push = (label, tiles) => { const ts = T(tiles); if (ts.length) groups.push({ label, tiles:ts }); };
  if (k === 'when'){
    push('Il viaggio', L13_WHEN);
    push('Parole', L13_WORDS);
    push('Rispondere', [L13_INTRO[0], L13_ASK.find(t => t.key === 'soc:buonanotte'), ...yn]);
  } else if (k === 'seat'){
    push('A cena', [...L13_INTRO, ...yn]);
  } else if (k === 'intro'){
    push('A cena', [...L13_INTRO, ...yn]);
    push('Margaret', [L13_MARG[0], L13_MARG[1], L13_MARG[2], l13MargTile(), L13_MARG[3], L13_MARG[4], L13_MARG[5]]);
  } else {
    const items = l13DayItems(), st = l13Stage();
    /* the thing Lina (or Ernesto) asks about, also when you didn't do it: "No, non ho assaggiato il gelato." */
    const asked = l13AskedItem(), pps = l13PPs();
    if (asked) asked.pp.forEach(p => { if (!pps.includes(p)) pps.push(p); });
    push('Il passato', L13_AUX);
    push('Participi', L13_PP.map(t => t.key.slice(3)).filter(p => pps.includes(p)).map(p => L13_PP_OF[p]));
    push('Oggi a Padova', items.map(l13ObjTile));
    push('Dove · con chi', l13Locs().map(l13LocTile));
    push('Parole', [...L13_WORDS, L13_NON]);
    push('Prima di…', L13_BEFORE.filter(t => t.key !== 'inf:ballare' || items.some(d => d.key === 'piazza')));
    if (['anche', 'why', 'back'].includes(st)) push('Margaret', [L13_ANCHE[0], l13MargTile(), L13_ANCHE[1], ...(items.some(d => d.key === 'basilica') ? [] : [l13ObjTile(l13AnyItem('basilica'))])]);
    if (['why', 'back'].includes(st)) push('Venezia', L13_WHY);
    push('Rispondere', [...L13_ASK.slice(0, 4), yn[1], ...L13_ASK.slice(4), L13_INTRO[0], l13Tile('soc:arrivederci', 'Arrivederci', 'goodbye (polite)', 'arrivederci'),
      ...(asked && !items.some(d => d.key === asked.key) ? [l13ObjTile(asked)] : [])]);
  }
  if (names.length) groups.push({ label:'Names', tiles:names });
  return groups;
}
/* the parser only has to accept the words (the turn is read from the tiles' keys); the typed scripts' words have intents */
function l13Phrases(npc){
  if (!l13On() || !l13Cast(npc)) return [];
  const P = [['greet', 'buonasera'], ['l13:forher', 'per lei'], ['l13:her', 'lei'], ['l13:dish:gelato', 'il gelato'], ['l13:night', 'buonanotte'], ['ask_back', 'e lei'],
    ['l13:sichiama', 'si chiama'], ['l13:michiamo', 'mi chiamo'], ['l13:michiamo', 'chiamo'], ['l13:biscuit', 'biscuit'], ['l13:ama', 'ama'], ['l13:amano', 'amano'], ['l13:anche', 'anche'], ['l13:kids', 'i bambini'], ['l13:kids', 'bambini'], ['l13:margaret', 'margaret']];
  const seen = new Set(P.map(p => p[1])), put = s => { s = s.toLowerCase(); if (!seen.has(s)){ seen.add(s); P.push(['l13w', s]); } };
  const all = [...L13_INTRO, ...L13_MARG, ...L13_AUX, ...L13_PP, ...L13_WORDS, L13_NON, ...L13_BEFORE, ...L13_ANCHE, ...L13_ASK, ...L13_WHY, ...L13_WHEN, l13Tile('no', 'No', 'no', 'no'),
    ...l13AllItems().map(l13ObjTile), ...Object.keys(L13_LOC).map(l13LocTile)];
  all.forEach(t => { put(t.words); t.words.split(' ').forEach(put); });
  all.filter(t => L13_GLUED.has(t.key)).forEach(t => put(t.words.replace(/ /g, '\u00a0')));
  return P;
}

/* ---------- reading a turn: the tiles' keys (a set phrase by its words) ---------- */
const L13_KEY_BY_WORDS = { e:'w:e', poi:'w:poi', ma:'w:ma', quindi:'w:quindi', 'sì':'soc:si', si:'soc:si', no:'no', 'e lei':'soc:elei', buonasera:'soc:buonasera',
  arrivederci:'soc:arrivederci', buonanotte:'soc:buonanotte', anche:'w:anche', prima:'w:prima', dopo:'w:dopo', 'ancora una volta per favore':'può ripetere', 'che bello':'soc:chebello' };
function l13KeyOf(t){
  if (t.name) return 'name:' + t.w;
  if (t.key && /^(soc|aux|pp|obj|loc|inf|why|when|ask|w|mg|who):/.test(t.key)) return t.key;
  const words = (t.tokens || [t]).map(x => x.w).join(' ').toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
  return L13_KEY_BY_WORDS[words] || t.key || 'w:' + words;
}
function l13Read(){
  const used = (convo.lastUsed || []), keys = used.map(l13KeyOf);
  const R = { keys, greet:null, name:false, askName:false, elei:false, askHow:false, answerHow:false, eTu:false, from:false, origin:false, nice:false, thanks:false,
    bye:false, night:false, yes:false, no:false, repeat:false, excuse:false, chebello:false, askDay:false, askWhy:false, words:[], clauses:[], why:[], when:[], other:[],
    margaret:false, introWho:false, mgEnglish:false, mgLondon:false, mgNoItalian:false, before:null, beforeBare:false, infAlone:false, strayLoc:null, biz:false };
  let cur = null, prev = null, subj = null, anche = false, before = false, neg = false;
  const fresh = () => { cur = { aux:null, pp:null, obj:null, locs:[], subj, anche, neg }; subj = null; anche = false; neg = false; R.clauses.push(cur); };
  keys.forEach(k => { const p = prev; prev = k;
    if (k === 'ciao' || k === 'buongiorno' || k === 'soc:buonasera'){ R.greet = R.greet || (k === 'soc:buonasera' ? 'buonasera' : k); return; }
    if (k === 'mi chiamo'){ R.name = true; return; }
    if (k === 'come ti chiami'){ R.askName = 'tu'; return; }
    if (k === 'soc:elei'){ R.elei = true; return; }
    if (k === 'e tu'){ R.eTu = true; return; }
    if (k === 'come sta' || k === 'come stai'){ R.askHow = k === 'come stai' ? 'tu' : 'lei'; return; }
    if (k === 'sto bene grazie'){ R.answerHow = true; return; }
    if (k === 'soc:didove'){ R.from = true; return; }
    if (k === 'soc:inglese'){ R.origin = true; return; }
    if (k === 'piacere'){ R.nice = true; return; }
    if (k === 'grazie' || k === 'grazie mille'){ R.thanks = true; return; }
    if (k === 'soc:arrivederci' || k === 'arrivederci'){ R.bye = true; return; }
    if (k === 'soc:buonanotte'){ R.night = true; return; }
    if (k === 'soc:si'){ R.yes = true; return; }
    if (k === 'no'){ R.no = true; return; }
    if (k === 'può ripetere' || k === 'non ho capito'){ R.repeat = true; return; }
    if (k === 'scusi'){ R.excuse = true; return; }
    if (k === 'soc:chebello'){ R.chebello = true; return; }
    if (k === 'ask:cosa'){ R.askDay = true; return; }
    if (k === 'ask:perche'){ R.askWhy = true; return; }
    if (k.startsWith('why:')){ R.why.push(k.slice(4)); return; }
    if (k.startsWith('when:')){ R.when.push(k.slice(5)); return; }
    if (k === 'mg:lei è' || k === 'mg:questa è' || k === 'mg:le presento'){ R.introWho = true; return; }
    if (k === 'mg:è inglese'){ R.mgEnglish = true; return; }
    if (k === 'mg:londra'){ R.mgLondon = true; return; }
    if (k === 'mg:non parla italiano'){ R.mgNoItalian = true; return; }
    if (k === 'who:margaret'){ R.margaret = true; if (cur && !cur.aux && !cur.pp && !cur.obj) cur.subj = 'margaret'; else subj = 'margaret'; return; }
    if (k.startsWith('name:')) return;
    if (k === 'w:anche'){ R.words.push('anche'); anche = true; return; }
    if (k === 'w:non'){ R.non = true; if (cur && cur.aux && !cur.pp && !cur.obj) cur.neg = true; else neg = true; return; }      /* (non ho…: the next clause is a no) */
    if (k === 'w:primadi'){ before = true; return; }
    if (k.startsWith('inf:')){ if (before){ R.before = k.slice(4); before = false; } else R.infAlone = true; return; }
    if (k.startsWith('aux:')){ fresh(); cur.aux = k.slice(4); R.biz = true; return; }
    if (k.startsWith('pp:')){ if (!cur || cur.pp) fresh(); cur.pp = k.slice(3); R.biz = true; return; }
    /* a second thing after "e" shares the clause's verb: Ho visto il museo e la basilica */
    if (k.startsWith('obj:')){
      if (!cur || cur.obj){ const share = cur && cur.obj && p === 'w:e' && cur.aux && cur.pp; const was = cur; fresh(); if (share){ cur.aux = was.aux; cur.pp = was.pp; cur.shared = true; cur.subj = was.subj; } }
      cur.obj = k.slice(4); R.biz = true; return; }
    if (k.startsWith('loc:')){ if (cur) cur.locs.push(k.slice(4)); else R.strayLoc = k.slice(4); R.biz = true; return; }
    if (k.startsWith('w:')){ R.words.push(k.slice(2)); return; }
    R.other.push(k);
  });
  if (before) R.beforeBare = true;
  return R;
}

/* ---------- a turn ---------- */
function l13React(id, n, st, add, out){
  if (!l13On() || !l13Cast(n) || !convo || !convo.l13 || !L13_TILE_KINDS.includes(convo.l13.kind)) return false;
  if (out.l13) return true;
  out.l13 = true; out.asked = true; out.l13extra = []; out.l13fb = null; out.l13hint = null;
  const R = l13Read(), k = convo.l13.kind;
  if (k === 'seat') l13SeatTurn(R, add, out);
  else if (k === 'intro') l13IntroTurn(R, add, out, n);
  else if (k === 'when') l13WhenTurn(R, add, out);
  else l13DayTurn(R, add, out, n);
  return true;
}
/* the formal forms: a tip on the player's own words (not the answer) */
function l13FormalTip(R){
  const fix = [];
  if (R.greet === 'ciao') fix.push('<b>buonasera</b>, not ciao');
  if (R.greet === 'buongiorno') fix.push('it\'s night: <b>buonasera</b>, not buongiorno');
  if (R.askHow === 'tu') fix.push('<b>come sta</b>, not come stai');
  if (R.eTu) fix.push('<b>E Lei?</b>, not e tu');
  if (R.askName === 'tu') fix.push('the polite question, not come ti chiami');
  return fix.length ? `Strangers, and grown-ups: the polite forms. ${fix.join('; ')}.` : null;
}
/* Nino's booking: your name (a greeting first is polite) */
function l13SeatTurn(R, add, out){
  const C = convo.l13;
  if (R.greet){ C.greeted = true; add(R.greet === 'buongiorno' ? 'Buongiorno? Ah ah, è sera! Buonasera!' : 'Buonasera!', R.greet === 'buongiorno' ? "Good morning? Ha ha, it's evening! Good evening!" : 'Good evening!'); }
  out.l13fb = l13FormalTip(R);
  if (R.name){
    add('{Me}… sì, eccoLa! Cabina diciassette. Piacere, sono Nino, il cuoco!', "{Me}… yes, there you are! Compartment seventeen. Nice to meet you, I'm Nino, the chef!");
    add('Prego, Le do un tavolo.', "Please, I'll give you a table.");
    S.met.nino = true; S.known.nino = true; convo.known = true; save(); renderHUD();
    if (!C.greeted && !out.l13fb) out.l13fb = 'Nino didn\'t mind, but greeting him first is more polite.';
    out.l13done = true; return;
  }
  if (R.askHow) add('Bene, grazie! Il Suo nome, prego?', 'Fine, thanks! Your name, please?');
  else if (!R.greet) add('Scusi? Il Suo nome, prego?', 'Sorry? Your name, please?');
  else add('Il Suo nome, prego?', 'Your name, please?');
  out.l13hint = { h:'Nino wants your name, for the booking.', strong:'Nino wants your name. Key words: <b>mi chiamo</b>.', step:'seat:name' };
}
/* the introductions: you and Margaret, at each table in turn (Lessons 1–5). Agenda: your name, who the lady is, where she is from
   (Rinaldi: does she speak Italian?) */
const L13_INTRO_LINES = {
  bassi:{ name:['Piacere, {Me}! Io sono Lina, e lui è mio marito, Ernesto.', "Nice to meet you, {Me}! I'm Lina, and this is my husband, Ernesto."],
    ernesto:['Piacere! Cinquant\'anni di matrimonio, eh! Un viaggio per festeggiare!', 'Nice to meet you! Fifty years married, you know! A trip to celebrate!'],
    who:['Piacere, signora Margaret! E Lei, signora, di dov\'è?', "Nice to meet you, Margaret! And you, madam, where are you from?"],
    english:['Inglese! Che bello! Noi siamo di Bologna.', "English! How lovely! We're from Bologna."], london:['Di Londra! Ernesto, Londra! Noi siamo di Bologna.', "From London! Ernesto, London! We're from Bologna."],
    noItalian:['Non parla italiano? Non importa: hello, signora! Ah ah!', "She doesn't speak Italian? Never mind: hello, madam! Ha ha!"],
    origin:['Anche Lei è inglese! Che bello! Parla bene l\'italiano!', "You're English too! How lovely! You speak Italian well!"],
    from:['Noi? Di Bologna! Siamo di Bologna.', "Us? From Bologna! We're from Bologna."],
    done:['Che piacere! Buona cena, {Me}! Buona cena, signora!', 'What a pleasure! Enjoy your dinner, {Me}! Enjoy your dinner, madam!'], met:['lina', 'ernesto'] },
  ferri:{ name:['Piacere, {Me}. Io sono la signora Ferri. Viaggio con i miei due bambini… sono stanchissima!', "Nice to meet you, {Me}. I'm Mrs Ferri. I'm travelling with my two children… I'm exhausted!"],
    who:['Piacere, signora. E… di dov\'è, la signora?', 'Nice to meet you, madam. And… where is the lady from?'],
    english:['Inglese? Che bello! Io sono di Milano.', "English? How lovely! I'm from Milan."], london:['Di Londra? Che bella città! Io sono di Milano.', "From London? What a beautiful city! I'm from Milan."],
    noItalian:['Ah, non parla italiano… Allora: welcome! Ah ah.', "Ah, she doesn't speak Italian… Well then: welcome! Ha ha."],
    origin:['Inglese anche Lei? Che bello!', 'You\'re English too? How lovely!'], from:['Io? Di Milano.', 'Me? From Milan.'],
    done:['Buona cena, {Me}! E buona cena, signora.', 'Enjoy your dinner, {Me}! And enjoy your dinner, madam.'], met:['ferri'] },
  rinaldi:{ name:['Rinaldi, piacere.', 'Rinaldi, nice to meet you.'],
    who:['Ah. Piacere, signora. … Parla italiano, la signora?', 'Ah. Nice to meet you, madam. … Does the lady speak Italian?'],
    english:['Inglese. Quindi no. Bene.', 'English. So, no. Fine.'], london:['Londra. Bene.', 'London. Fine.'],
    noItalian:['Ah. Peccato.', 'Ah. A pity.'], no:['No? Peccato.', 'No? A pity.'], origin:['Ah. Bene.', 'Ah. Good.'], from:['Di Roma.', 'From Rome.'],
    done:['Scusi… il telefono. Pronto? Sì, sì…', 'Excuse me… the phone. Hello? Yes, yes…'], met:['rinaldi'] },
};
function l13IntroTurn(R, add, out, n){
  const C = convo.l13, L = S.l13, I = L13_INTRO_LINES[C.who], say = l => add(l[0], l[1]);
  out.l13fb = l13FormalTip(R);
  if (R.greet && !C.greeted){ C.greeted = true; if (!R.name && !R.margaret) add('Buonasera!', 'Good evening!'); }
  if (R.askHow) add('Bene, grazie!', 'Fine, thanks!');
  if (R.answerHow) add('Bene!', 'Good!');
  /* your name */
  if (R.name && !C.gotName){
    C.gotName = true; C.told = true; say(I.name);
    I.met.forEach(id => { S.met[id] = S.known[id] = true; }); convo.known = true; save(); renderHUD();
    if (C.who === 'bassi') enqueue(() => { if (convo && convo.l13 === C) $('#dlgWho').innerHTML = '<b>Lina e Ernesto</b> <span class="where">· the table by the window</span>'; });
    if (I.ernesto) out.l13extra.push({ who:'ernesto', it:I.ernesto[0], en:I.ernesto[1] });
  } else if ((R.elei || R.askName) && !C.told){ C.told = true; say(I.name); I.met.forEach(id => { S.met[id] = S.known[id] = true; }); convo.known = true; save(); renderHUD(); }
  if (R.from && !C.askedFrom){ C.askedFrom = true; say(I.from); }
  if (R.origin && !C.originDone){ C.originDone = true; say(I.origin); }
  /* Margaret: who she is (Lei è / Questa è / Le presento + her name, or her name alone) */
  if (R.margaret && !C.gotWho){
    C.gotWho = true; say(I.who); C.asking = C.who === 'rinaldi' ? 'speak' : 'from';
    if (!R.introWho) out.l13fb = out.l13fb || 'Good! A whole sentence is even nicer: <i>she is…</i>, or <i>may I introduce…</i> (Lesson 5).';
  } else if (R.introWho && !R.margaret && !C.gotWho){ add('Sì…? Chi?', 'Yes…? Who?'); out.l13fb = 'Say her name too.'; }
  /* where she is from / does she speak Italian (answered for her; also before they ask) */
  const answered = R.mgEnglish || R.mgLondon || R.mgNoItalian || (C.who === 'rinaldi' && R.no && C.asking === 'speak');
  if (answered && !C.fromDone && (C.gotWho || R.margaret)){
    C.fromDone = true;
    if (R.mgLondon) say(I.london); else if (R.mgEnglish) say(I.english);
    if (R.mgNoItalian) say(I.noItalian); else if (R.no && I.no && !R.mgEnglish && !R.mgLondon) say(I.no);
  } else if (answered && !C.gotWho && !C.fromDone){ add('Chi? La signora?', 'Who? The lady?'); C.asking = 'who'; }
  if (R.nice && C.gotName) add('Piacere mio!', 'The pleasure is mine!');
  const need = C.agenda.filter(a => (a === 'name' && !C.gotName) || (a === 'who' && !C.gotWho) || ((a === 'from' || a === 'speak') && !C.fromDone));
  if (!need.length){
    say(I.done); L.met[C.who] = true; save(); renderHUD(); out.l13met = C.who; out.end = true; return;
  }
  if ((R.bye || R.thanks) && !R.name && !R.margaret) add('Ma… aspetti!', 'But… wait!');
  /* the next thing they want to know (asked again if the turn didn't answer it) */
  const q = need[0];
  if (q === 'name'){ add(C.told ? 'E Lei?' : 'Lei come si chiama?', C.told ? 'And you?' : "What's your name?"); C.asking = 'name'; }
  else if (q === 'who' && (C.asking === 'who' || R.name || !out.l13extra.length)){ if (!R.margaret) add('E la signora, chi è?', 'And the lady, who is she?'); C.asking = 'who'; }
  else if (q === 'from' || q === 'speak'){
    if (!R.margaret){ if (q === 'speak') add('Parla italiano, la signora?', 'Does the lady speak Italian?'); else add('Di dov\'è, la signora?', 'Where is the lady from?'); }
    C.asking = q; out.l13marg = L13_MARG_LINES.intro[C.who];
  }
  if (q === 'who' && C.asking !== 'who') C.asking = 'who';
  out.l13hint = l13IntroHint(C, q);
}
function l13IntroHint(C, q){
  if (q === 'name') return { h:'They asked your name.', strong:'They asked your name. Key words: <b>mi chiamo</b>.', step:`intro:${C.who}:name` };
  if (q === 'who') return { h:'They want to know who the lady with you is. Introduce Margaret (Lesson 5: introducing someone).', strong:'Introduce Margaret. Key words: <b>lei è</b> (or <b>le presento</b>) and her name.', step:`intro:${C.who}:who` };
  if (q === 'speak') return { h:'He asked something about Margaret, and she can\'t answer. Answer for her: think of what she told you about her Italian.', strong:'Answer for Margaret. Key words: <b>non parla italiano</b>.', step:`intro:${C.who}:speak` };
  return { h:'They asked Margaret something, and she can\'t answer. Answer for her: where is she from? (She told you.)', strong:'Answer for Margaret. Key words: <b>è inglese</b>, <b>di Londra</b>.', step:`intro:${C.who}:from` };
}

/* ---------- telling your day: Lina and Ernesto ----------
   The stages (l13Stage, from S.l13): 'tell' (what did you do today? one thing or more) → 'dopo' (one thing only: Ernesto's "E dopo?";
   skipped when the first answer joined two) → 'yes' (Lina asks about a quest you did: "Ha visto il tramonto sul ponte?" → Sì, ho…;
   skipped when there is none to ask) → 'ma' (about one you didn't, or the Scrovegni Chapel: No, ma ho…) → 'anche' (Lina mentions the
   basilica; Margaret: "Tell them I saw the church too!" → Anche Margaret ha visto la chiesa / la basilica) → 'why' (Ernesto's "E perché
   Venezia?" → Perché …) → 'back' (Margaret: "Ask them why…"; E Lei, perché Venezia? or goodbye). Every clause is avere + participle +
   thing (+ a place or a with whom); e / poi / ma / prima / dopo join clauses; "Prima di + a verb" goes before a clause. */
function l13Stage(){
  const L = S.l13; if (!L) return 'tell';
  if (L.why === 'done') return 'back';
  if (L.why === 'asked') return 'why';
  if (L.anche === 'asked') return 'anche';
  if (L.ma === 'asked') return 'ma';
  if (L.yes === 'asked') return 'yes';
  if (L.dopo === 'asked') return 'dopo';
  return 'tell';
}
/* a question Lina can ask: an item's q (or the chapel) */
const l13Q = key => key === 'chapel' ? L13_CHAPEL : key && l13AnyItem(key) ? l13AnyItem(key).q : null;
const l13Pick = list => list.length ? list[Math.floor(Math.random() * list.length)] : null;
/* the yes question: a quest you did (not told yet, if possible), in the designer's order; with few done, any quest */
function l13PickYes(){
  const L = S.l13, items = l13DayItems(), told = new Set(L.told.bassi);
  if (l13Free()) return l13Pick(L13_ASK_ORDER.filter(k => !told.has(k)));
  const mine = L13_ASK_ORDER.filter(k => items.some(d => d.key === k && d.quest));
  return mine.find(k => !told.has(k)) || null;
}
/* the no question: a quest you didn't do (with few done, or none left: the Scrovegni Chapel) */
function l13PickNo(){
  if (l13Free()) return 'chapel';
  const items = l13DayItems();
  return l13Pick(L13_ASK_ORDER.filter(k => !items.some(d => d.key === k))) || 'chapel';
}
const L13_AUX_EN = { ho:'<i>I</i>', hai:'<i>you</i> (to a friend)', ha:'<i>he / she</i>, or polite <i>you</i>', abbiamo:'<i>we</i>' };
/* the player's sentence this turn, as shown (for the completion screen's "Your day, in Italian") */
const l13TurnText = () => convo && convo.lastUsed ? formatSentence(convo.lastUsed.flatMap(t => t.tokens || [t])) : '';
/* each clause of the turn: { fb (feedback on the first wrong one), right, newOnes, food, items:[the things that were right] }; the replies are added.
   o.clauses: only these; o.q: the thing just asked about (it counts even when it isn't one of your quests: "Sì, ho assaggiato il gelato");
   o.bareOk(c): a thing alone that answers the question ("Sì, un gelato!"). A clause with non ("Non ho visto il tramonto") tells nothing. */
function l13Clauses(R, it, o = {}){
  const C = convo.l13, L = S.l13, told = L.told.bassi;
  let fb = null, right = 0, newOnes = 0, food = false;
  const items = [], fresh = [];
  const ok = (item, c, sentence) => {
    right++; items.push(item);
    if (sentence) C.said.push(sentence);
    if (told.includes(item.key)){ it(`Sì, sì: ${item.label}!`, `Yes, yes: ${item.en}!`); if (c && (c.locs || []).length && item.replyLoc) it(item.replyLoc.it, item.replyLoc.en); return; }
    told.push(item.key); newOnes++; if (item.food) food = true;
    if (sentence && !L.said.includes(sentence)){ L.said.push(sentence); fresh.push(sentence); }
    it(item.reply.it, item.reply.en);
    if (c && (c.locs || []).length && item.replyLoc) it(item.replyLoc.it, item.replyLoc.en);
  };
  (o.clauses || R.clauses).forEach(c => {
    if (fb) return;
    if (c.subj === 'margaret') return;                       // (Margaret's clause: l13AncheTurn)
    const item = c.obj ? l13Item(c.obj) || (o.q && c.obj === o.q ? l13AnyItem(c.obj) : null) : null, pp = c.pp, lab = item ? item.label : c.obj && l13AnyItem(c.obj) ? l13AnyItem(c.obj).label : c.obj;
    if (c.neg){ if (!o.quietNeg) it('Ah, no?', 'Oh, no?'); return; }
    /* a thing alone: the answer to "Ha assaggiato il gelato?" ("Sì, un gelato!"), or a sentence still to finish */
    if (!c.aux && !pp && c.obj){
      if (item && o.bareOk && o.bareOk(c)) return ok(item, c, null);
      it(`${cap(lab)}…? E…?`, `${cap(item ? item.en : lab)}…? And…?`); fb = 'What did you do? A whole sentence: avere, a participle, then the thing.'; L.mistakes.pp++; C.fail = 'pp'; return;
    }
    if (!c.aux && pp){ it(`${cap(pp)}…?`, `${cap(pp)}…?`); fb = `The past needs two words: <i>avere</i>, then the participle (<b>${pp}</b>).`; L.mistakes.aux++; C.fail = 'aux'; return; }
    if (c.aux && c.aux !== 'ho'){
      if (c.aux === 'hai') it('Io? No, no… Lei!', 'Me? No, no… you!');
      else if (c.aux === 'ha') it('Chi? Io? Ernesto?', 'Who? Me? Ernesto?');
      else it('Abbiamo? Lei e chi?', 'We? You and who?');
      fb = `<b>${c.aux}</b> is ${L13_AUX_EN[c.aux]}. About yourself: the <i>io</i> form of avere.`; L.mistakes[c.aux === 'abbiamo' ? 'alone' : 'aux']++; C.fail = 'who'; return;
    }
    if (c.aux && !pp && c.obj){ it(`Ha ${lab}? In tasca? Ah ah!`, `You have ${item ? item.en : lab}? In your pocket? Ha ha!`); fb = '<b>Ho</b> alone is <i>I have</i>. For what you <i>did</i>: avere + a participle.'; L.mistakes.pp++; C.fail = 'pp'; return; }
    if (c.aux && !pp){ it('Ho…? Ho cosa?', 'I have…? Have what?'); fb = 'Add a participle (<i>Participi</i>): what did you do?'; L.mistakes.pp++; C.fail = 'pp'; return; }
    if (!c.obj){ it(`${cap(pp)}? Cosa?`, `${cap(pp)}? What?`); fb = `<b>${pp}</b>: yes, but what? Add a thing from <i>Oggi a Padova</i>.`; C.fail = 'obj'; return; }
    if (!item){ it('Eh?', 'Huh?'); fb = c.obj === 'chiesa' || c.obj === 'basilica' ? 'That one is Margaret\'s: who saw it?' : 'Use the things under <i>Oggi a Padova</i>: what you really did today.'; C.fail = 'obj'; return; }
    if (!item.pp.includes(pp)){
      it(`Ha ${pp} ${item.label}?! Ah ah ah!`, `You ${L13_PP_OF[pp].pen.split(',')[0]} ${item.en}?! Ha ha ha!`);
      fb = `<b>${pp}</b> = ${L13_PP_OF[pp].pen}. Which participle goes with <i>${esc(item.label)}</i>?`; L.mistakes.match++; C.fail = 'match'; return;
    }
    const badLoc = (c.locs || []).find(k => !(item.locs || []).includes(k));
    if (badLoc){ it(`${cap(item.label)} ${L13_LOC[badLoc][0]}? Mmm…`, `${cap(item.en)} ${L13_LOC[badLoc][1]}? Hmm…`); fb = `<i>${esc(L13_LOC[badLoc][0])}</i> doesn't go with <i>${esc(item.label)}</i>. Where (or with whom) was it?`; C.fail = 'loc'; return; }
    /* right */
    ok(item, c, l13Sentence(c));
  });
  return { fb, right, newOnes, food, items, fresh };
}
/* the whole turn, as said, replaces its clauses in S.l13.said ("Prima ho visto la basilica, poi ho mangiato un gelato.") */
function l13SaidWhole(res){
  const L = S.l13, full = l13TurnText();
  if (!full) return;
  L.said = L.said.filter(x => !res.fresh.includes(x));
  if (!L.said.includes(full)) L.said.push(full);
}
function l13DayTurn(R, add, out, n){
  const C = convo.l13, L = S.l13, told = L.told.bassi, it = (i, e) => add(i, e), E = (i, e) => out.l13extra.push({ who:'ernesto', it:i, en:e });
  const stage = l13Stage(), ma = R.words.includes('ma'), seq = R.words.some(w => ['e', 'poi', 'prima', 'dopo', 'quindi'].includes(w)) || !!R.before;
  C.fail = null;
  if (R.greet) it('Buonasera!', 'Good evening!');
  if (R.repeat && !R.clauses.length && !R.why.length){
    if (stage === 'why') add('Certo! E perché Venezia, {Me}? Perché?', 'Of course! And why Venice, {Me}? Why?');
    else if (stage === 'anche'){ add('Ah ah! Chiedo alla signora: cosa vuole dire?', 'Ha ha! I\'m asking the lady: what does she want to say?'); out.l13extra.push({ who:'margaret', it:L13_MARG_LINES.again }); }
    else if (stage === 'back') add('Volentieri! Che bella serata!', 'Gladly! What a lovely evening!');
    else l13Again(stage, it, E, true);
    out.l13hint = stage === 'why' || stage === 'back' ? l13WhyHint() : l13DayHint(C); return;
  }
  if (stage === 'why' || stage === 'back') return l13WhyTurn(R, add, out, stage);
  if (stage === 'anche' && l13AncheTurn(R, add, out)) return;
  if (R.askDay || (R.elei && !R.clauses.length)){
    it('Noi? Abbiamo visto la Cappella degli Scrovegni, e abbiamo mangiato benissimo!', 'Us? We saw the Scrovegni Chapel, and we ate very well!');
    E('E io ho dormito un po\' in albergo! Ah ah!', 'And I slept a bit at the hotel! Ha ha!');
    L.asked = true; save();
    if (!R.clauses.length){ l13Again(stage, it, E); out.l13hint = l13DayHint(C); return; }
  }
  if (R.beforeBare){ it('Prima di…? Prima di cosa?', 'Before…? Before what?'); out.l13fb = '<i>Prima di</i> needs a verb after it: before <i>doing</i> what? (<i>Prima di…</i>)'; C.fail = 'before'; C.fails++; out.l13hint = l13DayHint(C); return; }
  /* Lina's (or Ernesto's) question about a quest: every answer closes it */
  if (stage === 'yes' || stage === 'ma') return l13AnswerTurn(R, add, out, stage);
  /* each clause: avere + participle + what */
  const res = l13Clauses(R, it);
  save();
  if (res.fb){ out.l13fb = res.fb; C.fails++; out.l13hint = l13DayHint(C); return; }
  if (!R.clauses.filter(c => c.subj !== 'margaret').length){
    if (R.chebello) it('Sì, vero?', 'Yes, isn\'t it?');
    else if (R.thanks || R.bye || R.night) it('Ma… aspetti! Mi racconti!', 'But… wait! Tell me about it!');
    else if (R.biz || R.other.length || R.words.length || R.why.length || R.when.length || R.margaret || R.infAlone) it('Eh?', 'Huh?');
    l13Again(stage, it, E);
    out.l13hint = l13DayHint(C); return;
  }
  /* the turn told something: "Prima di …" and the joined story get their reply */
  if (R.before && res.right && L13_BEFORE_REPLY[R.before]) E(L13_BEFORE_REPLY[R.before][0], L13_BEFORE_REPLY[R.before][1]);
  const joined = res.newOnes >= 2 && seq;
  if (joined) it('Che giornata!', 'What a day!');
  if (res.right && (seq || R.yes || R.no)) l13SaidWhole(res);
  out.l13told = res.newOnes;
  /* the stage moves on */
  if (stage === 'tell' || stage === 'dopo'){
    if (!res.newOnes){ l13Again(stage, it, E); out.l13hint = l13DayHint(C); return; }
    if (stage === 'tell' && res.newOnes < 2){ L.dopo = 'asked'; save(); E(res.food ? 'Buono! E dopo? Cosa ha fatto dopo?' : 'E dopo? Cosa ha fatto dopo?', res.food ? 'Delicious! And after that? What did you do after that?' : 'And after that? What did you do after that?'); out.l13hint = l13DayHint(C); return; }
    if (stage === 'dopo' && R.words.includes('dopo')) E('Ah, dopo! Bene, bene.', 'Ah, after that! Good, good.');
    L.dopo = 'done'; save();
    return l13Advance(it, E, out);
  }
  /* anche (a clause of your own instead of Margaret's) */
  it('Che bello! … E la signora? Cosa dice?', 'How lovely! … And the lady? What is she saying?');
  out.l13extra.push({ who:'margaret', it:L13_MARG_LINES.again });
  out.l13hint = l13DayHint(C);
}
/* asked again, by stage. Lina's quest questions are never asked twice: only when you ask her to say it again (again = true) */
function l13Again(stage, it, E, again){
  const L = S.l13;
  if (stage === 'tell') it(l13Told('bassi') ? 'Allora? Cosa ha fatto oggi?' : 'Allora? Cosa ha fatto oggi a Padova?', 'So? What did you do today?');
  else if (stage === 'dopo') E('E dopo? Cosa ha fatto dopo?', 'And after that? What did you do after that?');
  else if (stage === 'yes' || stage === 'ma'){ const q = l13Q(stage === 'yes' ? L.qYes : L.qNo); if (again) it(q.it, q.en); else it('Allora… e Lei?', 'So… and you?'); }
}
/* the thing Lina (or Ernesto) is asking about now (its tile and participles are in the bank, done or not), or null */
function l13AskedItem(){
  const L = S.l13, st = l13Stage(), q = st === 'yes' ? L.qYes : st === 'ma' ? L.qNo : null;
  return q && q !== 'chapel' ? l13AnyItem(q) : null;
}
/* the conversation moves on: Margaret chimes in once three things are told (or after the no question, whatever was said), and
   the questions not asked yet come next: Lina's about a quest you did, then one about a quest you didn't, then "E perché Venezia?".
   say: who asks (Lina, by default; after Margaret's line, Lina again, after it) */
function l13Advance(it, E, out){
  const L = S.l13; out.l13moved = true;
  if (!L.anche && L.told.bassi.length >= 3) return l13ToAnche(it, E, out);
  if (L.yes !== 'done') return l13AskYes(it, E, out);
  if (L.ma !== 'done') return l13AskNo(it, E, out);
  if (!L.anche) return l13ToAnche(it, E, out);
  L.why = 'asked'; save(); out.l13rebank = true;
  E('E perché Venezia, {Me}?', 'And why Venice, {Me}?');
  out.l13hint = l13WhyHint();
}
/* "Ha visto il tramonto sul ponte?": a quest you did (none to ask: on to the next) */
function l13AskYes(it, E, out){
  const L = S.l13, q = l13PickYes();
  if (!q){ L.yes = 'done'; save(); return l13Advance(it, E, out); }
  L.yes = 'asked'; L.qYes = q; save(); out.l13rebank = true;
  it(l13Q(q).it, l13Q(q).en);
  out.l13hint = l13DayHint(convo.l13);
}
/* "Ha assaggiato il gelato?" (a quest you didn't do) or "Ha visto la Cappella degli Scrovegni?" */
function l13AskNo(it, E, out){
  const L = S.l13, q = l13PickNo();
  L.ma = 'asked'; L.qNo = q; save(); out.l13rebank = true;
  if (q === 'chapel') it(L13_CHAPEL.it, L13_CHAPEL.en); else E(l13Q(q).it, l13Q(q).en);
  out.l13hint = l13DayHint(convo.l13);
}
/* the basilica: Lina mentions it, and Margaret wants to chip in (once) */
function l13ToAnche(it, E, out){
  const L = S.l13, saw = L.told.bassi.includes('basilica');
  L.anche = 'asked'; save(); out.l13rebank = true;
  const lina = (i, e) => out.l13extra.push({ who:'lina', it:i, en:e });
  if (saw) lina('Anche noi abbiamo visto la basilica del Santo: bellissima! E la Cappella degli Scrovegni…', 'We saw the basilica of Saint Anthony too: beautiful! And the Scrovegni Chapel…');
  else lina('Noi abbiamo visto la Cappella degli Scrovegni… e la basilica del Santo: bellissima!', 'We saw the Scrovegni Chapel… and the basilica of Saint Anthony: beautiful!');
  out.l13extra.push({ who:'margaret', it:saw ? L13_MARG_LINES.churchToo : L13_MARG_LINES.church });
  out.l13hint = l13DayHint(convo.l13);
}
/* Lina's (or Ernesto's) question about a quest: "Ha assaggiato il gelato?" (stage 'yes': one you did; 'ma': one you didn't, or the
   Scrovegni Chapel). Every natural answer closes it and the conversation moves on (l13Advance: the same question never comes back):
   Sì · Sì, ho assaggiato il gelato · Sì, un gelato · No · No, non ho assaggiato il gelato · No, ma ho … · Ma ho … · another thing you
   did. Mistakes in the rest of the sentence get their feedback, but don't hold the answer up. */
function l13AnswerTurn(R, add, out, stage){
  const C = convo.l13, L = S.l13, it = (i, e) => add(i, e), E = (i, e) => out.l13extra.push({ who:'ernesto', it:i, en:e });
  const q = stage === 'yes' ? L.qYes : L.qNo, item = q === 'chapel' ? null : l13AnyItem(q);
  const ma = R.words.includes('ma'), seq = R.words.some(w => ['e', 'poi', 'prima', 'dopo', 'quindi'].includes(w));
  const own = R.clauses.filter(c => c.subj !== 'margaret');
  const isQ = c => !!item && c.obj === q;
  const negQ = own.some(c => c.neg && isQ(c)), posQ = own.some(c => !c.neg && isQ(c));
  const rest = own.filter(c => !isQ(c)), told = rest.filter(c => !c.neg);
  const ans = negQ || (R.no && !posQ) ? 'no' : posQ || R.yes ? 'yes' : ma && told.length ? 'no' : told.length ? 'other' : null;
  if (!ans){
    if (R.chebello) it('Sì, vero?', "Yes, isn't it?");
    else if (R.thanks || R.bye || R.night) it('Ma… aspetti! Allora?', 'But… wait! So?');
    else if (!R.greet) it('Eh? … Allora?', 'Huh? … So?');
    else it('Allora…?', 'So…?');
    C.fail = 'none'; out.l13hint = l13DayHint(C); return;
  }
  /* the answer first */
  if (ans === 'no') it(stage === 'ma' ? 'Ah, no? Peccato! La prossima volta!' : 'Ah, no? Peccato!', stage === 'ma' ? 'Oh, no? What a shame! Next time!' : 'Oh, no? What a shame!');
  else if (ans === 'yes' && !posQ){
    if (!item) it('Sì? Bellissima, vero? Gli affreschi di Giotto!', "Yes? Beautiful, isn't it? Giotto's frescoes!");
    else { it(`${stage === 'ma' && !l13Item(q) ? 'Sì? Davvero? ' : 'Sì? '}${item.reply.it}`, `${stage === 'ma' && !l13Item(q) ? 'Yes? Really? ' : 'Yes? '}${item.reply.en}`);
      if (!L.told.bassi.includes(q)){ L.told.bassi.push(q); out.l13told = 1; } }
  }
  /* then the rest of the sentence (a clause about the thing asked, what you did instead) */
  const res = l13Clauses(R, it, { clauses:own.filter(c => !(c.neg && isQ(c))), q, bareOk:isQ, quietNeg:ans === 'no' });
  if (ans === 'other' && !res.right){ save(); out.l13fb = res.fb; C.fails++; out.l13hint = l13DayHint(C); return; }      // (a thing you did, but not said right yet)
  if (res.fb){ out.l13fb = res.fb; C.fails++; }
  else if (ans === 'no' && told.length && !ma && R.no) out.l13fb = 'Good answer! Next time, join the two halves with the word for <i>but</i>: it\'s in <i>Parole</i>.';
  else if (ans === 'no' && !told.length && stage === 'ma') out.l13fb = 'Fine! You can also tell them what you did instead: join it on with the word for <i>but</i> (in <i>Parole</i>).';
  else if (ans === 'yes' && !posQ && !told.length && item && stage === 'yes') out.l13fb = 'Good! Next time you can say it in a whole sentence too: avere, a participle, then the thing.';
  if (res.right && (ma || R.no || R.yes || seq || negQ)) l13SaidWhole(res);
  if (res.newOnes >= 2 && seq) it('Che giornata!', 'What a day!');
  out.l13told = (out.l13told || 0) + res.newOnes;
  if (stage === 'yes') L.yes = 'done'; else L.ma = 'done';
  C.fail = null; save();
  return l13Advance(it, E, out);
}
/* Margaret's "Tell them I saw the church too!": Anche Margaret ha visto la chiesa (or la basilica). Returns true when the turn was about it */
function l13AncheTurn(R, add, out){
  const C = convo.l13, L = S.l13, E = (i, e) => out.l13extra.push({ who:'ernesto', it:i, en:e });
  const c = R.clauses.find(x => x.subj === 'margaret') || R.clauses.find(x => x.obj === 'chiesa' || (x.obj === 'basilica' && x.aux !== 'ho'));
  const church = x => x.obj === 'chiesa' || x.obj === 'basilica';
  if (!c){
    if (R.margaret && !R.clauses.length){ add('Margaret…? Sì?', 'Margaret…? Yes?'); C.fail = 'anche:verb'; out.l13hint = l13DayHint(C); return true; }
    const own = R.clauses.find(x => church(x) && x.aux === 'ho');
    if (own){ add('Anche Lei? Che bello!', 'You too? How lovely!'); out.l13fb = '<b>Ho</b> is <i>I</i>: that\'s you. Margaret wants to say that <i>she</i> saw it.'; C.fail = 'anche:who'; C.fails++; out.l13hint = l13DayHint(C); return true; }
    return false;
  }
  if (!c.pp && !c.aux){ add('Margaret… la chiesa? Sì?', 'Margaret… the church? Yes?'); out.l13fb = 'Margaret <i>saw</i> it: the past, avere + a participle.'; C.fail = 'anche:verb'; C.fails++; out.l13hint = l13DayHint(C); return true; }
  if (c.aux === 'ho'){ add('Margaret… ho…? Lei o la signora?', 'Margaret… I…? You or the lady?'); out.l13fb = '<b>ho</b> is <i>I</i>. Margaret is <i>she</i>: the form for he / she.'; C.fail = 'anche:who'; C.fails++; out.l13hint = l13DayHint(C); return true; }
  if (c.aux && c.aux !== 'ha'){ add(c.aux === 'abbiamo' ? 'Abbiamo? Lei e la signora?' : 'Hai…? Chi?', c.aux === 'abbiamo' ? 'We? You and the lady?' : 'You (friend)…? Who?'); out.l13fb = `<b>${c.aux}</b> is ${L13_AUX_EN[c.aux]}. Margaret is <i>she</i>.`; C.fail = 'anche:who'; C.fails++; out.l13hint = l13DayHint(C); return true; }
  if (!c.aux || !c.pp){ add('Margaret…?', 'Margaret…?'); out.l13fb = 'The past needs two words: <i>avere</i> (for her), then the participle.'; C.fail = 'anche:verb'; C.fails++; out.l13hint = l13DayHint(C); return true; }
  if (!church(c)){ add(c.obj ? 'Ah sì? Anche la signora…' : 'Ha visto… cosa?', c.obj ? 'Oh really? The lady too…' : 'Saw… what?');
    out.l13fb = c.obj ? 'Margaret wants to say she saw the <i>church</i>.' : 'What did she see? The church.'; C.fail = 'anche:what'; C.fails++; out.l13hint = l13DayHint(C); return true; }
  if (c.pp !== 'visto'){ add(`Ha ${c.pp} la chiesa?! Ah ah ah!`, `She ${L13_PP_OF[c.pp].pen.split(',')[0]} the church?! Ha ha ha!`); out.l13fb = `<b>${c.pp}</b> = ${L13_PP_OF[c.pp].pen}. Margaret <i>saw</i> the church.`; C.fail = 'anche:verb'; C.fails++; out.l13hint = l13DayHint(C); return true; }
  if (c.subj !== 'margaret'){ add('Chi? Io? Sì, sì, bellissima!', 'Who? Me? Yes, yes, beautiful!'); out.l13fb = 'Say who saw it: Margaret.'; C.fail = 'anche:who'; C.fails++; out.l13hint = l13DayHint(C); return true; }
  /* right */
  L.anche = 'done'; save();
  { const full = l13TurnText(); if (full && !L.said.includes(full)) L.said.push(full); }
  add('Anche la signora! Brava, signora! Bellissima, vero?', "The lady too! Well done, madam! Beautiful, isn't it?");
  out.l13extra.push({ who:'margaret', it:L13_MARG_LINES.done });
  if (!c.anche) out.l13fb = 'Right! Margaret said <i>too</i>: the word for it goes before her name (in <i>Margaret</i>).';
  out.l13rebank = true;
  l13Advance((i, e) => out.l13extra.push({ who:'lina', it:i, en:e }), E, out);
  return true;
}
/* Ernesto's "E perché Venezia?" (stage 'why'), then the optional question back (stage 'back') */
function l13Anniversary(add, E, out){
  add("Per il nostro anniversario: cinquant'anni!", 'For our anniversary: fifty years!');
  E("Cinquant'anni fa, il viaggio di nozze… a Venezia!", 'Fifty years ago, our honeymoon… in Venice!');
  out.l13extra.push({ who:'margaret', it:L13_MARG_LINES.anniv });
}
function l13WhyTurn(R, add, out, stage){
  const C = convo.l13, L = S.l13, E = (i, e) => out.l13extra.push({ who:'ernesto', it:i, en:e }), why = R.why.find(w => L13_WHY_REPLY[w]), perche = R.words.includes('perché');
  if (stage === 'why'){
    if (why){
      const r = L13_WHY_REPLY[why];
      add(r.lina[0], r.lina[1]);
      L.why = 'done'; L.reason = why; out.l13dayDone = 'bassi';
      { const full = l13TurnText(); if (full && !L.said.includes(full)) L.said.push(full); }
      if (!perche) out.l13fb = 'Right! You can also start the answer with the word for <i>because</i> (in <i>Parole</i>).';
      if (R.askWhy){ l13Anniversary(add, E, out); L.askedBack = true; save(); return l13BassiBye(add, out, R, true); }
      E(r.ernesto[0], r.ernesto[1]);
      if (!L.margBack){ L.margBack = true; out.l13extra.push({ who:'margaret', it:L13_MARG_LINES.why }); }
      out.l13hint = { h:'That\'s all they wanted to know. Margaret would love to know why <i>they</i> are going to Venice: you can ask them back, if you like, or say goodbye.', step:'day:bassi:back' };
      save(); return;
    }
    if (R.askWhy){ l13Anniversary(add, E, out); L.askedBack = true; save(); E('E Lei? Perché Venezia?', 'And you? Why Venice?'); C.fail = 'why'; out.l13hint = l13WhyHint(); return; }
    /* (Lina speaks first in her conversation: an empty turn would show "…") */
    if (perche) add('Perché…?', 'Because…?');
    else if (R.clauses.length || R.biz) add('Sì, sì! Ma… perché Venezia?', 'Yes, yes! But… why Venice?');
    else if (R.bye || R.night || R.thanks) add('Ma… aspetti! Perché Venezia?', 'But… wait! Why Venice?');
    else if (R.greet) add('E perché Venezia?', 'And why Venice?');
    else add('Eh? … Perché Venezia?', 'Huh? … Why Venice?');
    C.fail = 'why'; out.l13hint = l13WhyHint(); return;
  }
  /* back: the reason is given; ask them back, or goodbye */
  if (R.askWhy){ if (L.askedBack) add("Eh, cinquant'anni!", 'Ah, fifty years!'); else l13Anniversary(add, E, out); L.askedBack = true; save(); return l13BassiBye(add, out, R, true); }
  if (R.chebello) add('Grazie!', 'Thank you!');
  else if (why) add('Sì, sì: Venezia!', 'Yes, yes: Venice!');
  else if (R.clauses.length) add('Che giornata!', 'What a day!');
  l13BassiBye(add, out, R);
}
function l13BassiBye(add, out, R, after){
  if (!after) add(R.night ? 'Buonanotte, {Me}! A domani!' : 'Che bella serata! A domani, {Me}!', R.night ? 'Good night, {Me}! See you tomorrow!' : 'What a lovely evening! See you tomorrow, {Me}!');
  out.l13extra.push({ who:'ernesto', it:'E domani, Venezia!', en:'And tomorrow, Venice!' });
  out.end = true; save();
}
function l13WhyHint(){
  const h = 'Ernesto asked you something about Venice. Give him a reason: start with the word for <i>because</i> (in <i>Parole</i>), then pick one under <i>Venezia</i>.';
  return { h, strong:`${h} Key word: <b>perché</b>.`, step:'day:bassi:why' };
}
function l13DayHint(C){
  const L = S.l13, st = l13Stage(), f = C.fail;
  if (st === 'why') return l13WhyHint();
  if (st === 'anche'){
    const h = f === 'anche:who' ? 'It\'s Margaret who saw it, not you: her name, and avere for <i>she</i>.'
      : f === 'anche:verb' ? 'Say that Margaret <i>saw</i> the church: avere (for <i>she</i>) and a participle.'
      : 'Margaret wants them to know she saw the church as well. Say it for her: the word for <i>too</i>, her name, then what she did (in the past). The tiles are under <i>Margaret</i>.';
    return { h, strong:`${h} Key words: <b>anche</b>, <b>ha visto</b>.`, step:'day:bassi:anche' };
  }
  if (['aux', 'who', 'pp', 'obj', 'match', 'loc', 'before'].includes(f)){
    const h = f === 'who' ? 'Tell them what <i>you</i> did: the <i>io</i> form of avere.' : f === 'match' ? 'Check the participle: does it go with that thing?'
      : f === 'loc' ? 'Check the place (<i>Dove · con chi</i>): where was it?' : f === 'before' ? 'After <i>Prima di</i>, a verb from <i>Prima di…</i>; then what you did.'
      : 'A whole sentence: avere, a participle, and what (<i>Oggi a Padova</i>).';
    const strong = f === 'who' ? `${h} Key word: <b>ho</b>.` : f === 'match' ? `${h} The participles are explained in the handbook: <b>visto</b> = seen, <b>mangiato</b> = eaten…` : `${h} Key words: <b>ho</b> + a participle (<b>visto</b>, <b>preso</b>…).`;
    return { h, strong, step:`day:bassi:${st}` };
  }
  if (st === 'ma'){
    const h = 'They asked if you did something today. Answer them: yes or no… and if not, you can tell them what you did instead. The word for <i>but</i> is in <i>Parole</i>.';
    return { h, strong:`${h} Key words: <b>no</b>, <b>ma</b> (or <b>non</b> + what they asked).`, step:'day:bassi:ma' };
  }
  if (st === 'yes'){
    const h = 'Lina asked about something from your day. Answer her: yes or no. You can say it in a whole sentence too, with avere and a participle.';
    return { h, strong:`${h} Key words: <b>sì</b>, <b>ho</b> + a participle.`, step:'day:bassi:yes' };
  }
  if (st === 'dopo'){
    const h = 'Ernesto wants to know what you did <i>after that</i>. Tell him one more thing; you can start with the word for <i>after</i> (in <i>Parole</i>).';
    return { h, strong:`${h} Key words: <b>dopo</b>, <b>ho</b>…`, step:'day:bassi:dopo' };
  }
  const h = 'Tell them something you did today: avere, a participle, and what. <i>Oggi a Padova</i> has the things you really did; <i>Parole</i> joins two (first… then…).';
  return { h, strong:`${h} Key words: <b>ho</b> + a participle (<b>visto</b>, <b>preso</b>…), <b>prima</b>, <b>poi</b>.`, step:'day:bassi:tell' };
}
/* bedtime: Nino, when do we get to Venice? (quando + arriviamo, a Venezia optional). His answer is a listening line, then a pick */
function l13WhenTurn(R, add, out){
  const C = convo.l13, L = S.l13, q = R.words.includes('quando'), arr = R.when.includes('arriviamo'), ven = R.when.includes('venezia');
  C.fail = null;
  if (R.greet) add('Buonasera! Anzi… buonanotte, ah ah!', 'Good evening! Or rather… good night, ha ha!');
  if (q && arr){
    add(L13_ARRIVE.it, L13_ARRIVE.en, { listen:true });
    L.askedWhen = true; L.arrive = L13_ARRIVE.time; save();
    out.l13when = true; return;
  }
  if (q) { add(ven ? 'Quando… a Venezia? Scusi, non capisco.' : 'Quando… cosa?', ven ? "When… to Venice? Sorry, I don't understand." : 'When… what?'); C.fail = 'verb'; }
  else if (arr || ven){ add('Sì, sì: domani, Venezia!', 'Yes, yes: tomorrow, Venice!'); C.fail = 'when'; }
  else if (R.night) add('Buonanotte! … Ma… ha una domanda?', 'Good night! … But… do you have a question?');
  else if (R.thanks) add('Prego! Mi dica!', "You're welcome! What can I do for you?");
  else if (R.yes || R.no) add('Sì? Mi dica!', 'Yes? What can I do for you?');
  else if (!R.greet) add('Scusi? Mi dica!', 'Sorry? What can I do for you?');
  else add('Mi dica!', 'What can I do for you?');
  out.l13hint = l13WhenHint(C);
}
function l13WhenHint(C){
  const h = C.fail === 'when' ? 'You want to know the time. Ask him <i>when</i>: the question word is in <i>Parole</i>.'
    : C.fail === 'verb' ? 'Ask when <i>we</i> arrive: the verb is under <i>Il viaggio</i>.'
    : 'You\'d like to know when the train gets to Venice tomorrow. Ask Nino: the question word is in <i>Parole</i>, the rest under <i>Il viaggio</i>.';
  return { h, strong:`${h} Key words: <b>quando</b>, <b>arriviamo</b>.`, step:'when:ask' };
}
const L13_WHEN_OPTS = ['Tomorrow morning, at 6:30', 'Tomorrow morning, at 7:30', 'Tomorrow morning, at 7:15'];
function l13WhenAsk(){
  enqueue(() => { if (convo){ builder.hidden = true; hintEl.hidden = true; } });
  sysLine('When do you get to Venice? What did Nino say?');
  l13WhenPick(0);
}
function l13WhenPick(miss){
  showChoices(L13_WHEN_OPTS.map(t => ({ label:t, fn:() => {
    choices.hidden = true;
    if (t.endsWith(L13_ARRIVE.time)){
      revealListen({ all:true });
      S.l13.heardWhen = true; save();
      sysLine(`✓ Venice tomorrow at <b>${L13_ARRIVE.time}</b>. Time for bed!`);
      enqueue(() => { if (convo){ convo.done = true; hintEl.hidden = true; } });
      showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
      return;
    }
    sysLine(`<b>${t}</b>? Hmm… really?`);
    npcLine(L13_ARRIVE.it, L13_ARRIVE.en, { listen:true, rate:0.7 });
    if (miss >= 1) revealListen({ all:true });
    showHint(miss >= 1 ? 'Read his answer above: <b>sette</b> is seven, <b>e mezza</b> is half past.' : 'He said it again, slowly. Listen for the hour, and for what comes after it.');
    l13WhenPick(miss + 1);
  } })));
}

/* ---------- after their lines: Ernesto's and Margaret's lines, feedback, hints, the end ---------- */
function l13After(n, out){
  if (!out.l13 || !convo || !convo.l13) return false;
  const C = convo.l13, st = convo.st, L = S.l13;
  (out.l13extra || []).forEach(x => x.who === 'margaret' ? l13MargLine(x.it) : npcLine(fill(x.it), fill(x.en), { speaker:NPC[x.who], forceKnown:!!S.known[x.who], rate:x.rate }));
  if (out.l13marg) l13MargLine(out.l13marg);
  if (out.l13when){ l13WhenAsk(); return true; }
  if (C.kind === 'day') enqueue(() => renderHUD());
  if (out.l13rebank) enqueue(() => { if (convo && convo.l13 === C) renderBank(); });
  if (C.kind === 'seat' && out.l13done){
    if (out.l13fb) showHint(out.l13fb, 'Consiglio'); else enqueue(() => { hintEl.hidden = true; });
    enqueue(() => { if (convo) convo.done = true; builder.hidden = true; });
    showChoices([{ label:'Follow Nino', primary:true, fn:closeDialog }]);
    return true;
  }
  if (out.end){
    if (out.l13met) sysLine(`✓ You introduced yourself and Margaret to <b>${{ bassi:'Lina and Ernesto', ferri:'la signora Ferri', rinaldi:'il signor Rinaldi' }[out.l13met]}</b> <span class="l9-tick">${l13MetCount()}/3</span>`);
    if (out.l13dayDone) sysLine('✓ You told <b>Lina and Ernesto</b> about your day.');
    if (out.l13fb) showHint(out.l13fb, 'Consiglio');
    else enqueue(() => { hintEl.hidden = true; });
    enqueue(() => { if (convo){ convo.done = true; builder.hidden = true; } });
    showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
    return true;
  }
  if (out.l13dayDone) sysLine('✓ You told <b>Lina and Ernesto</b> about your day.');
  if (C.kind === 'day' && out.l13told) sysLine(`✓ <span class="l9-tick">${L.told.bassi.length}</span> ${L.told.bassi.length === 1 ? 'thing' : 'things'} from your day`);
  const H = out.l13hint;
  /* (feedback, then the hint: the whole hint when the conversation has just moved on to a new question) */
  if (out.l13fb && H && out.l13moved){ showHint(out.l13fb + ' ' + hintAfter(stepTries(st, H.step), H.h, H.strong), 'Consiglio'); return true; }
  if (out.l13fb){ const tries = H ? stepTries(st, H.step) : 0; showHint(out.l13fb + (H ? ' ' + hintAfter(tries, '', H.strong && tries >= HINT_STRONG_AT ? H.strong.replace(H.h, '').trim() : '') : ''), 'Consiglio'); return true; }
  if (H){ showHint(hintAfter(stepTries(st, H.step), H.h, H.strong)); return true; }
  enqueue(() => { hintEl.hidden = true; });
  return true;
}
/* the hint shown by contextHint (after a sentence that didn't parse, or in general) */
function l13Hint(n, st){
  if (!l13On() || !l13Cast(n) || !convo || !convo.l13) return null;
  const C = convo.l13;
  if (C.kind === 'seat') return { h:'Nino wants your name, for the booking. It\'s evening, and he is a stranger at work.', strong:'Nino wants your name. Key words: <b>mi chiamo</b>.', step:'seat:name' };
  if (C.kind === 'intro'){
    if (!C.greeted && !C.gotName) return { h:'Greet them: it\'s the evening, and they are strangers.', strong:'Greet them. Key word: <b>buonasera</b>.', step:`intro:${C.who}:greet` };
    return l13IntroHint(C, !C.gotName ? 'name' : !C.gotWho ? 'who' : C.who === 'rinaldi' ? 'speak' : 'from');
  }
  if (C.kind === 'day') return l13DayHint(C);
  if (C.kind === 'when') return l13WhenHint(C);
  return null;
}

/* ---------- closing a conversation: the evening moves on ---------- */
function l13OnClose(closedId, closedDone){
  if (!l13On()) return false;
  const L = S.l13, t = S.tut;
  L13C.open = null;
  if (t === 'l13-dinner' && closedId === 'nino' && L.phase === 'seat' && closedDone){ setTimeout(l13Seat, 300); return true; }
  if (t === 'l13-dinner' && closedId === 'margaret' && L.phase === 'meet' && L.met.margaret){ setTimeout(l13ToOrder, 500); return true; }
  if (t === 'l13-dinner' && L.phase === 'order' && closedId === 'nino' && L.ordered.me){ setTimeout(l13Served, 400); return true; }
  if (t === 'l13-dinner' && L.phase === 'intro' && l13MetCount() >= 3){
    L.phase = 'bassi'; setTut('l13-day'); save();
    setTimeout(() => { if (l13On() && S.tut === 'l13-day' && !dialogOpen) worldSay(NPC.lina, 'Scusi! {Me}! Venga, venga!'.replace('{Me}', S.playerName), { ms:2200 }); toast('<i>“Excuse me! Come, come!”</i> Lina and Ernesto are waving at you.'); }, 900);
    return true;
  }
  if (t === 'l13-day' && closedId === 'lina' && L.phase === 'bassi' && l13BassiDone()){ L.phase = 'ferri'; save(); renderHUD(); setTimeout(() => { if (!dialogOpen) l13AfterDay(); }, 1400); return true; }
  if (t === 'l13-day' && closedId === 'ferri' && L.phase === 'ferri' && L.ferri === 'talk' && (S.l6.steps.l13_ferri || 0) >= TYPED_SCRIPTS.l13_ferri.steps.length){ setTimeout(l13FerriDone, 500); return true; }
  if (t === 'l13-day'){ setTimeout(() => { if (!dialogOpen) l13AfterDay(); }, 900); return true; }
  return false;
}

/* ---------- the order: Margaret's menu, typed (translating for her) ---------- */
const L13_DISHES = ['lasagna', 'spaghetti', 'risotto', 'pollo', 'pesce', 'parmigiana', 'insalata', 'tiramisu', 'gelato'];
const l13Dish = ints => { for (const i of ints){ const m = /^(?:food|l13:dish):(.+)$/.exec(i); if (m && L13_DISHES.includes(m[1])) return m[1]; } return null; };
const L13_DISH_IT = { lasagna:'la lasagna', spaghetti:'gli spaghetti', risotto:'il risotto ai funghi', pollo:'il pollo arrosto', pesce:'il pesce del giorno', parmigiana:'la parmigiana', insalata:"l'insalata", tiramisu:'il tiramisù', gelato:'il gelato' };
const L13_DISH_EN = { lasagna:'the lasagna', spaghetti:'the spaghetti', risotto:'the mushroom risotto', pollo:'the roast chicken', pesce:'the fish of the day', parmigiana:'the parmigiana', insalata:'the salad', tiramisu:'the tiramisù', gelato:'the ice cream' };
const L13_MENU = { it:'Ecco il menù! Stasera abbiamo il risotto ai funghi, il pesce del giorno, il pollo arrosto… e per dolce, il tiramisù o il gelato.',
  en:'Here is the menu! Tonight we have mushroom risotto, the fish of the day, roast chicken… and for dessert, tiramisù or ice cream.' };
/* the menu card Nino hands you (in the conversation) */
function l13MenuCard(){
  const row = (it, p) => `<div class="l13-mrow"><span>${esc(it)}</span><span>${p}</span></div>`;
  return `<div class="l13-menu"><div class="l13-mt">Laguna Express · <i>Il menù della cena</i></div>
    <div class="l13-mc">Primi</div>${row('Risotto ai funghi', '11')}
    <div class="l13-mc">Secondi</div>${row('Pesce del giorno', '16')}${row('Pollo arrosto', '14')}
    <div class="l13-mc">Dolci</div>${row('Tiramisù', '6')}${row('Gelato', '5')}</div>`;
}
const l13W = (words, re) => re.test(words.join(' '));
Object.assign(TYPED_SCRIPTS, {
  l13_order:{
    npc:'nino', tut:'l13-dinner', get scene(){ return S.l13 && S.l13.phase === 'order' ? 'treno' : '-'; }, modelAfter:2, companion:'margaret',
    opening:L13_MENU, reopening:{ it:'Allora? Cosa prendete?', en:'So? What will you have?' },
    companionIntro:"Oh dear, it's all Italian to me. What's he saying?",
    steps:[
      { choice:{ prompt:"“Il pesce del giorno”: what's that?", line:L13_MENU, options:[
          { label:'The fish of the day.', correct:true, reply:'Fish of the day! Hmm, maybe not, at this hour.' },
          { label:'A fish soup.' }, { label:'The pasta of the day.' } ] } },
      { choice:{ prompt:'And “il risotto ai funghi”? I do love a risotto.', line:L13_MENU, options:[
          { label:'Risotto with mushrooms.', correct:true, reply:'Mushrooms! Perfect, that one for me.' },
          { label:'Risotto with fish.' }, { label:'Risotto with cheese.' } ] } },
      { lead:'Would you order the mushroom risotto for me, dear?',
        en:'For her, the mushroom risotto.', model:'Per lei, il risotto ai funghi.',
        check(ints){
          if (has(ints, 'subj:him')) return 'Margaret is a woman: <b>per lei</b>, not per lui.';
          if (has(ints, 'subj:me') && !has(ints, 'l13:forher')) return '<i>Per me</i> is <i>for me</i>: this dish is Margaret\'s.';
          if (has(ints, 'want:me') && !has(ints, 'l13:forher', 'l13:her')) return '<b>Vorrei</b> is <i>I</i> would like. It\'s Margaret who wants it.';
          if (!has(ints, 'l13:forher', 'want:him')) return 'Say who it is for: <i>for her</i>. Lesson 4 had <i>for me</i> and <i>for him</i>; the dictionary has the rest.';
          const d = l13Dish(ints);
          if (!d) return 'Which dish? Margaret wants the mushroom risotto: it\'s on the menu.';
          if (d !== 'risotto') return `That's ${L13_DISH_EN[d]}. Margaret wants the mushroom risotto.`;
          return true; },
        reply(){ S.l13.ordered.her = 'risotto'; save(); return [{ it:'Il risotto ai funghi per la signora. Perfetto! E per Lei?', en:'The mushroom risotto for the lady. Perfect! And for you?' }]; },
        aside:'Clever you! Now order yourself something nice.' },
      { en:'And for you: anything you like on the menu.', model:'Per me, il pollo arrosto.',
        check(ints){
          if (has(ints, 'l13:forher') || has(ints, 'subj:him')) return 'That\'s for Margaret (or a man). This time it\'s for <i>you</i>.';
          if (has(ints, 'want:him') && !has(ints, 'subj:me')) return '<b>Vorrebbe</b> is <i>he / she</i> would like. This time it\'s you.';
          if (!l13Dish(ints)) return 'Pick a dish from the menu: Nino just read it out. The dictionary has Lesson 4\'s menu.';
          return true; },
        reply(ints){ const d = l13Dish(ints); S.l13.ordered.me = d; save();
          return [{ it:`${cap(L13_DISH_IT[d])} per Lei. Benissimo! E da bere… acqua per tutti? Va bene! Arrivo subito.`, en:`${cap(L13_DISH_EN[d])} for you. Very good! And to drink… water for everyone? All right! Coming right up.` }]; },
        aside:"You're a marvel. Thank you!" },
    ],
    done(){ S.l13.ordered.me = S.l13.ordered.me || 'pollo'; save(); },
  },
  /* la signora Ferri and Margaret: her Italian into English (choices), Margaret's English into Italian (typed). The dog is cute, his
     name, her children love dogs (the clue: ferri-vogliono), Biscuit loves children too */
  l13_ferri:{
    npc:'ferri', tut:'l13-day', get scene(){ return S.l13 && S.l13.phase === 'ferri' && S.l13.ferri === 'talk' ? 'treno' : '-'; }, modelAfter:2, companion:'margaret',
    opening:{ it:L13_FERRI.open.it, en:'' }, reopening:{ it:'Allora? Come si chiama il cane?', en:"So? What's the dog's name?" },
    companionIntro:"She's looking at Biscuit and smiling. What is she saying, dear?",
    steps:[
      { choice:{ line:L13_FERRI.open, options:[
          { label:'She says Biscuit is cute, and asks his name.', correct:true, reply:'Oh, bless her! He is a charmer, I know.' },
          { label:'She asks if he bites.', reply:'Bites? Biscuit? Is that really what she said? She is smiling…' },
          { label:'She says dogs are not allowed in here.' } ] } },
      { lead:'Tell her his name is Biscuit.',
        en:'His name is Biscuit.', model:'Si chiama Biscuit.',
        check(ints, words){
          if (l13W(words, /\bmi chiamo\b|\bchiamo\b/)) return '<i>Mi chiamo</i> is <i>my</i> name. This is the dog\'s name: <i>his</i> name is…';
          if (!l13W(words, /\bbiscuit\b/)) return 'Say his name too: Biscuit.';
          if (!l13W(words, /\bsi chiama\b/)) return 'His name is…: the same words as in her question, without the question word.';
          return true; },
        reply(){ return [{ it:L13_FERRI.kids.it, en:L13_FERRI.kids.en, noEn:true }]; },
        after(){ l13Clue('ferriDog'); enqueue(() => { if (convo) worldSay('biscuit', 'Bau!', { ms:1200, silent:true }); }); return []; } },
      { choice:{ prompt:'She said something about children. What was it?', line:L13_FERRI.kids, options:[
          { label:'Her children love dogs: they always want one.', correct:true, reply:'Oh, how sweet. Poor things, stuck on a train all night.' },
          { label:'Her children are afraid of dogs.' }, { label:'Her children have a dog at home.' } ] } },
      { lead:'Tell her Biscuit loves children too!',
        en:'Biscuit loves children too!', model:'Anche Biscuit ama i bambini!',
        check(ints, words){
          if (!l13W(words, /\bbiscuit\b/)) return 'Who loves children? Say his name.';
          if (l13W(words, /\bamano\b/)) return '<b>amano</b> is <i>they</i> love. Biscuit is one dog: <i>he</i> loves.';
          if (!l13W(words, /\bama\b/)) return 'The verb: <i>loves</i>. She said it about her children (they love); for one dog it is the form for he / she.';
          if (!l13W(words, /\bbambini\b/)) return 'Who does he love? Children: the word she used for hers.';
          if (!l13W(words, /\banche\b/)) return 'Margaret said <i>too</i>: the word for it goes first.';
          return true; },
        reply(){ return [{ it:L13_FERRI.end.it, en:L13_FERRI.end.en }]; },
        aside:"There. Two dog lovers. And she's exhausted, poor dear. Let's leave her in peace." },
    ],
    done(){ save(); },
  },
});
