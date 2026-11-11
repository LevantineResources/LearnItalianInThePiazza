/* Lesson 11 · Al museo. Lucia's conversations (formal, Lei, until the end): the barrier between the two statues, her
   homework questions at a work (tasks.js checks the answers), the game's start, and the ending at Canaletto (Lei va a
   Venezia? … Possiamo darci del tu?). Her opening line is the question of the moment (L11C.open, read by her
   revisitOpening getter); a whole sentence is read at its first intent (react) from the words said, and afterTurn shows
   the feedback and the hints. Hints say what Lucia wants, in English, never the Italian to say; from the third failed
   attempt at a question they name the key words. */

const L11C = { open:null, ctx:null };                 // the next opening line; the task a closed picture asks about
const l11Lucia = n => !!n && n.id === 'lucia' && S.lesson === 11 && !!S.l11;
const l11Rec = T => S.l11.tasks[T.id] || (S.l11.tasks[T.id] = { q:0, done:false, notes:[], at:null });
const l11Done = T => !!(S.l11 && S.l11.tasks[T.id] && S.l11.tasks[T.id].done);
const l11RoomCount = room => L11_TASKS.filter(T => T.room === room && l11Done(T)).length;
const l11StatueCount = () => l11RoomCount(0);
const l11RoomsDone = () => L11_ROOMS.reduce((a, r) => a + Math.min(2, l11RoomCount(r)), 0);
/* can this task be done now? (statues first; two per room) */
function l11TaskOpen(T){
  if (!T || l11Done(T)) return false;
  if (T.room === 0) return S.tut === 'l11-statues' && l11StatueCount() < 2;
  return S.tut === 'l11-rooms' && l11RoomCount(T.room) < 2;
}
const l11Words = () => (convo.lastUsed || []).flatMap(t => t.tokens || [t]).map(t => t.w);
/* the plaques of a task's works, as a line under Lucia's question (the dates and sizes the answers are checked against) */
function l11Plaques(T, at){
  if (T.works.length < 2 && !['biggest'].includes(T.q[0].k)) return null;
  const one = (id, lbl) => { const w = L11_W(id); return `<span class="l11-plaque"><b>${esc(w.title_it)}</b>${lbl ? ` <span class="l11-here">${lbl}</span>` : ''}<br>${esc(w.artist)}, ${esc(w.date)} · ${esc(galSize(w))}</span>`; };
  if (T.works.length < 2) return `<span class="l11-plaques">${one(T.works[0], '')}</span>`;
  const K = l11Kind(at), other = T.works.find(w => w !== at);
  return `<span class="l11-plaques">${one(at, K.this + ' · here')}${one(other, K.that + ' · there')}</span>`;
}

/* ---------- opening a conversation with Lucia (the talk hook) ---------- */
function l11LuciaTalk(npc){
  const L = S.l11, t = S.tut;
  convo.known = true; convo.l11 = { kind:null, fails:0 };
  $('#dlgWho').innerHTML = `<b>Lucia</b> <span class="where">· ${esc(npc.place)}</span>`;
  const it = (i, e) => npcLine(fill(i), fill(e)), sys = h => sysLine(h);
  const cut = () => { convo.mode = 'cutscene'; };
  const leave = (extra = []) => showChoices([...extra, { label:'Leave', primary:!extra.length, fn:closeDialog }]);
  if (l11Walking === 'lucia'){ cut(); it('Venga, venga! Di qua!', 'Come on, come on! This way!'); leave(); return true; }
  if (t === 'l11-lucia'){
    convo.l11 = { kind:'barrier', greeted:false, asked:false, fails:0 };
    L11C.open = L.met ? { it:'Allora? Questa o quella?', en:'So? This one or that one?' } : { it:'Ma… Lei è {Me}? Il Gattamelata! Si ricorda?', en:'But… is that you, {Me}? The Gattamelata! Do you remember?' };
    if (L.met){ convo.l11.greeted = true; convo.l11.asked = true; }
    return false;
  }
  if (['l11-handbook', 'l11-vocab', 'l11-practice'].includes(t)){
    cut(); it('Allora? Quale è più bella? E quale è più vecchia?', 'So? Which one is more beautiful? And which one is older?');
    sys('You still can\'t compare anything in Italian. Read <b>Lezione 11 · Al museo</b> in your handbook, learn its words and do the practice.');
    leave([{ label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(11); } }]);
    return true;
  }
  if (t === 'l11-statues' && !L.follow){
    cut(); it('Ah, eccoLa! Allora: il mio compito. Prima due statue, poi i quadri.', 'Ah, there you are! So: my homework. First two statues, then the paintings.');
    it('Andiamo? Io vengo con Lei.', "Shall we go? I'll come with you.");
    showChoices([{ label:'Sì!', primary:true, fn:() => {
      choices.hidden = true; meLine('Sì!'); S.sentences++;
      L.follow = true; trail.length = 0; save(); renderHUD();
      enqueue(() => setTimeout(closeDialog, 500));
    } }]);
    return true;
  }
  if (t === 'l11-statues' || t === 'l11-rooms'){
    const ctx = L11C.ctx || l11CtxHere(); L11C.ctx = null;
    if (ctx && l11TaskOpen(ctx.task)){
      const T = ctx.task, rec = l11Rec(T), q = T.q[rec.q];
      convo.l11 = { kind:'task', task:T, at:ctx.at, fails:0 };
      L11C.open = { it:q.it, en:q.en };
      const pl = l11Plaques(T, ctx.at);
      if (pl) setTimeout(() => { if (convo && convo.l11 && convo.l11.task === T) sysLine(pl); }, 320);
      return false;
    }
    cut();
    if (ctx && ctx.task && !l11Done(ctx.task) && ctx.task.room === 0 && t === 'l11-rooms') it('Le statue sono fatte! Adesso i quadri.', 'The statues are done! Now the paintings.');
    else if (ctx && ctx.task && !l11Done(ctx.task) && ctx.task.room !== 0 && t === 'l11-statues') it('Bello! Ma prima le statue, per il compito.', 'Lovely! But the statues first, for my homework.');
    else if (ctx && ctx.task && !l11Done(ctx.task)) it('Questa sala è fatta! Andiamo nella prossima?', 'This room is done! Shall we go to the next one?');
    else if (ctx && ctx.task && l11Done(ctx.task)) it('Questo è fatto! Grazie.', "This one's done! Thank you.");
    else it('Allora… e adesso?', 'So… what now?');
    sys(t === 'l11-statues' ? 'Lucia needs <b>two statues</b>. Stand at one in the atrium and look at it (<kbd>E</kbd>): she will ask you about it.'
      : 'Lucia\'s sheet: <b>two works in every room</b>. Stand at one on her sheet and look at it (<kbd>E</kbd>): she will ask you about it.');
    leave(t === 'l11-rooms' ? [{ label:'Lucia’s sheet', fn:() => { closeDialog(); openChecklist(l11SheetSpec()); } }] : []);
    return true;
  }
  if (t === 'l11-vedo'){
    cut();
    if (mispyActive()){ it('Trova! Vedo, vedo…', 'Find it! I spy…'); leave(); return true; }
    if (!L.vedo.started){
      it('Il compito è finito! Grazie mille, {Me}!', 'My homework is finished! Thank you so much, {Me}!');
      it('Adesso giochiamo! Vedo, vedo… nel museo. Io dico un quadro, Lei lo trova.', "Now let's play! I spy… in the museum. I describe a painting, you find it.");
    } else it(`Continuiamo? ${L.vedo.found} su cinque!`, `Shall we carry on? ${L.vedo.found} out of five!`);
    showChoices([{ label:'Sì!', primary:true, fn:() => {
      choices.hidden = true; meLine('Sì!'); S.sentences++;
      enqueue(() => setTimeout(() => { closeDialog(); l11PlayVedo(); }, 500));
    } }, { label:'Not yet', fn:closeDialog }]);
    return true;
  }
  if (t === 'l11-venezia'){
    convo.l11 = { kind:'venezia', phase:L.tu ? 'bye' : L.venezia ? 'tu' : 'va', fails:0 };
    L11C.open = convo.l11.phase === 'va' ? { it:'Questo è il mio quadro preferito. Venezia… è bellissima! Lei va a Venezia?', en:"This is my favourite painting. Venice… it's so beautiful! Are you going to Venice?" }
      : convo.l11.phase === 'tu' ? { it:'Senta… possiamo darci del tu?', en:'Listen… shall we use “tu” with each other?' } : { it:'Allora… ciao?', en:'So… bye?' };
    return false;
  }
  if (t === 'l11-done'){ cut(); it('Ciao, {Me}! Buon viaggio!', 'Bye, {Me}! Have a good trip!'); leave(); return true; }
  return false;
}
/* the work the player stands at, and its task */
function l11CtxHere(){
  if (S.scene !== 'galleria') return null;
  const d = nearestDoor(); if (!d || !d.work || doorDist(d, player.x, player.y) >= doorReach(d)) return null;
  const task = l11TaskOf(d.work);
  return task ? { task, at:d.work } : null;
}

/* ---------- the tile bank ---------- */
function l11Bank(npc, groups, names){
  if (!l11Lucia(npc) || !convo || !convo.l11) return null;
  const k = convo.l11.kind;
  if (k === 'barrier' && !S.vocab11){
    groups.push({ label:'Words you have', tiles:[l11Tile('questa', 'questa', 'this one (a feminine thing)'), l11Tile('bella', 'bella', 'beautiful (feminine)'), l11Tile('è', 'è', 'is'),
      ...L11_POLITE.filter(t => t.key !== 'sì certo')].map(phraseTile) });
    if (names.length) groups.push({ label:'Names', tiles:names });
    return groups;
  }
  if (k === 'venezia'){
    groups.push({ label:'Rispondere', tiles:L11_POLITE.map(phraseTile) });
    if (names.length) groups.push({ label:'Names', tiles:names });
    return groups;
  }
  groups.push({ label:'Confrontare', tiles:L11_CMP.map(phraseTile) });
  groups.push({ label:'Descrivere', tiles:L11_ADJ.map(phraseTile) });
  groups.push({ label:'Sembra…', tiles:L11_FEEL.map(phraseTile) });
  groups.push({ label:'Mi piace', tiles:L11_LIKE.map(phraseTile) });
  groups.push({ label:'Nei quadri', tiles:L11_SEE.map(phraseTile) });
  groups.push({ label:'Numeri', tiles:Array.from({ length:L11_NUMS }, (_, i) => ({ w:numIt(i + 1), label:numIt(i + 1), gloss:String(i + 1) })) });
  groups.push({ label:'Polite', tiles:L11_POLITE.filter(t => t.key !== 'sì certo').map(phraseTile) });
  if (names.length) groups.push({ label:'Names', tiles:names });
  return groups;
}
/* the parser only has to accept the words (l11Read reads them): every tile's words, the units, and the hard-mode words */
function l11Phrases(npc){
  if (!npc || npc.id !== 'lucia') return [];
  const P = [], seen = new Set(), put = s => { if (!seen.has(s)){ seen.add(s); P.push(['l11w', s]); } };
  [...L11_CMP, ...L11_ADJ, ...L11_FEEL, ...L11_LIKE, ...L11_SEE, ...L11_POLITE].forEach(t => { put(t.words); t.words.split(' ').forEach(put); });
  L11_UNITS.forEach(([u]) => put(u));
  Object.keys(L11_NOUNS).forEach(put); Object.keys(L11_ADJ_WORD).forEach(put);
  L11_NUMW.slice(1).forEach(put);
  ['molto', 'tanti', 'tante', 'secondo', 'me', 'preferisci', 'certo', 'salve', 'lucia'].forEach(put);
  return P;
}

/* ---------- a turn (the react hook: the whole sentence at its first intent) ---------- */
function l11React(id, n, st, add, out){
  if (!l11Lucia(n) || !convo || !convo.l11 || !['barrier', 'task', 'venezia'].includes(convo.l11.kind)) return false;
  if (out.l11) return true;
  out.l11 = true; out.asked = true;
  const R = l11Read(l11Words()), k = convo.l11.kind;
  if (k === 'barrier') l11BarrierTurn(R, add, out);
  else if (k === 'task') l11TaskTurn(R, add, out);
  else l11VeneziaTurn(R, add, out);
  return true;
}
const l11Biz = R => !l11Social(R);
function l11BarrierTurn(R, add, out){
  const s = convo.l11, L = S.l11;
  if ((R.bye || R.thanks) && !l11Biz(R) && !R.greet){ add('Arrivederci! Ah… no, aspetti! Il mio compito!', "Goodbye! Ah… no, wait! My homework!"); s.asked = s.greeted; out.l11hint = { h:'Lucia has a question for you. Answer it with the words you have.' }; return; }
  if (!s.greeted){
    if (R.greet || R.yes || R.name || R.ask_how || R.answer_how || R.address){
      s.greeted = true; L.met = true; save();
      if (R.greet === 'ciao') out.l11formal = true;
      if (R.ask_how) add('Bene, grazie!', 'Fine, thanks!');
      add('Sì, sono Lucia! Che bella sorpresa!', "Yes, it's Lucia! What a lovely surprise!");
      add("Ho un compito per la scuola d'arte: le statue e i quadri del museo.", "I have homework for art school: the museum's statues and paintings.");
      add('Secondo Lei, quale è più bella? Questa o quella? E quale è più vecchia?', 'What do you think: which one is more beautiful? This one or that one? And which one is older?');
      s.asked = true; out.l11greeted = true;
      return;
    }
    add('Mmm? Sono Lucia! Il Gattamelata… si ricorda?', "Hmm? It's Lucia! The Gattamelata… remember?");
    out.l11hint = { h:'She recognised you! Greet her first. She uses <i>Lei</i> with you, so politely.' };
    return;
  }
  if (!l11Biz(R) && !R.dunno){
    if (R.greet) add('Buongiorno!', 'Good morning!');
    add('Allora? Questa o quella?', 'So? This one or that one?');
    out.l11hint = { h:'She asked you something about the two statues. Try to answer with the words you have.' };
    return;
  }
  add('Ah ah! Mmm… non capisco. Questa o quella? Più bella? Più vecchia?', "Ha ha! Hmm… I don't understand. This one or that one? More beautiful? Older?", { rate:1 });
  out.l11barrier = true;
}
function l11TaskTurn(R, add, out){
  const C = convo.l11, T = C.task, rec = l11Rec(T), q = T.q[rec.q], L = S.l11;
  const biz = l11Biz(R) || R.dunno;
  if ((R.thanks || R.bye) && !biz){ add('Prego! A dopo!', "You're welcome! See you in a bit!"); out.end = true; return; }
  if (R.repeat && !l11Biz(R)){ add('Sì, certo!', 'Yes, of course!'); add(q.it, q.en, { rate:0.7 }); out.l11q = q; return; }
  if (R.dunno && !l11Biz(R)){
    const nudge = { cmp:[`Non lo sa? ${L11_ATTR_LOOK[q.attr] || 'Guardi bene!'}`, `You don't know? ${L11_ATTR_LOOK_EN[q.attr] || 'Look closely!'}`], count:['Non lo sa? Conti!', "You don't know? Count them!"] }[q.k]
      || ['Non lo sa? Guardi bene… secondo Lei?', "You don't know? Look closely… what do you think?"];
    add(nudge[0], nudge[1]); out.l11hint = { h:l11QHint(q, T, C.at), q }; return;
  }
  if (!biz){
    if (R.greet) add('Buongiorno! Allora…', 'Good morning! So…');
    add(q.it.replace(/^[^?]*?…\s*/, ''), q.en.replace(/^[^?]*?…\s*/, ''));
    out.l11hint = { h:l11QHint(q, T, C.at), q }; return;
  }
  const r = l11Check(T, q, C.at, R);
  r.say.forEach(([i, e]) => add(i, e));
  if (!r.ok){
    if (r.mistake) L.mistakes[r.mistake] = (L.mistakes[r.mistake] || 0) + 1;
    out.l11fb = r.fb; out.l11hint = { h:r.hint || (r.fb ? '' : l11QHint(q, T, C.at)), q };
    C.fails++; save(); return;
  }
  rec.notes.push(r.note); rec.q++;
  if (r.fb) out.l11fb = r.fb;
  if (rec.q < T.q.length){ const nq = T.q[rec.q]; add(nq.it, nq.en); out.l11next = true; }
  else { rec.done = true; rec.at = C.at; out.l11done = T; add('Perfetto! Lo scrivo.', "Perfect! I'll write it down."); }
  save();
}
/* what Lucia wants, in English (never the Italian to say) */
function l11QHint(q, T, at){
  const K = l11Kind(at || T.works[0]);
  if (q.k === 'cmp') return `Lucia wants to know which one is ${({ vecchio:'older', moderno:'more modern', piccolo:'smaller', grande:'bigger', alto:'taller', scuro:'darker' })[q.adj]}: ${q.attr === 'tone' ? 'look at both' : `check the ${L11_ATTR_EN[q.attr]}s on the plaques (above)`}. Then compare <i>this one</i> (the ${K.noun} you are at) with <i>that one</i>.`;
  if (q.k === 'prefer') return 'She wants to know which one you prefer. Any answer is fine: it\'s your opinion.';
  if (q.k === 'feel') return `She wants to know how ${q.who ? (q.who === "l'uomo" ? 'the man' : q.who) : 'he'} seems to you. Look at the face; the adjective agrees with the person.`;
  if (q.k === 'like') return 'She asks what you like about it. Your opinion: one thing, or more than one?';
  if (q.k === 'count') return `Count them! Then tell her how many there are.`;
  if (q.k === 'see') return 'She asks what you see in the painting: name the people in it.';
  if (q.k === 'animal') return 'Which animal is in it? Look closely (press <kbd>E</kbd> on the painting).';
  if (q.k === 'biggest') return 'Is it the biggest in the museum? Check the size on the plaque, then answer.';
  return 'Answer Lucia\'s question.';
}
/* from the third failed attempt at a question: the key words, never the whole sentence */
function l11QStrong(q, T, at){
  const K = l11Kind(at || T.works[0]);
  return { cmp:`Key words: <b>${K.this}</b> / <b>${K.that}</b>, <b>più</b> … <b>di</b>.`, prefer:'Key word: <b>preferisco</b>.', feel:'Key word: <b>sembra</b> + how he / she seems.',
    like:'Key words: <b>mi piace</b> (one thing), <b>mi piacciono</b> (more than one).', count:"Key words: <b>ci sono</b> + the number.", see:'Key word: <b>vedo</b> + who is in it.',
    animal:"Key word: <b>c'è</b> + the animal.", biggest:'Key words: <b>sì</b> / <b>no</b>; the biggest: <b>il più</b> …' }[q.k] || '';
}
function l11VeneziaTurn(R, add, out){
  const s = convo.l11, L = S.l11;
  if (s.phase === 'va'){
    if (R.yes || R.no || R.dunno){
      L.venezia = R.yes ? 'si' : R.no ? 'no' : 'nonloso';
      if (R.yes) add('Che bello! Venezia è bellissima: i canali, le gondole…', 'How lovely! Venice is so beautiful: the canals, the gondolas…');
      else if (R.no) add('No? Peccato! Deve andare: è bellissima.', 'No? What a shame! You must go: it\'s so beautiful.');
      else add('Non lo sa? Deve andare! È bellissima.', "You don't know? You must go! It's so beautiful.");
      add('Senta… possiamo darci del tu?', 'Listen… shall we use “tu” with each other?');
      s.phase = 'tu'; save(); out.l11q = 'tu'; return;
    }
    if (R.greet) add('Ciao… cioè, buongiorno!', 'Hi… I mean, good morning!');
    add('Mmm? Lei va a Venezia? Sì o no?', 'Hmm? Are you going to Venice? Yes or no?');
    out.l11hint = { h:'She asked you a yes / no question. Any answer is fine: yes, no, or you don\'t know.' }; return;
  }
  if (s.phase === 'tu'){
    if (R.yes){
      L.tu = true; s.phase = 'bye'; save();
      add('Che bello! Allora… da adesso, tu! Ciao, {Me}!', "Lovely! So… from now on, tu! Hi, {Me}!");
      out.l11tu = true; return;
    }
    if (R.no){ add('No? Ah… va bene. Peccato!', 'No? Oh… all right. Shame!'); add('Sicuro? Siamo amici, no? Possiamo darci del tu?', "Are you sure? We're friends, aren't we? Shall we use tu?"); out.l11hint = { h:'It\'s a friendly offer, from someone who likes you. Accept it!' }; return; }
    add('Possiamo darci del tu?', 'Shall we use “tu” with each other?');
    out.l11hint = { h:'She asked you something: <i>darci del tu</i>. Not sure? Look it up in the handbook (<i>What you\'ll hear</i>). Then answer her.' }; return;
  }
  /* bye: now on tu */
  if (R.greet === 'ciao' || (R.greet === 'ciao' && R.thanks)){ L.bye = true; save(); add('Ciao, {Me}! Buon viaggio!', 'Bye, {Me}! Have a good trip!'); out.end = true; return; }
  if (R.bye || R.greet === 'buongiorno'){ add(`${R.bye ? 'Arrivederci' : 'Buongiorno'}? Ma no! Adesso siamo amici!`, `${R.bye ? 'Arrivederci' : 'Buongiorno'}? Oh no! We're friends now!`);
    out.l11hint = { h:`You're on <i>tu</i> now: no more <i>${R.bye ? 'arrivederci' : 'buongiorno'}</i>. Say goodbye the friendly way.` }; return; }
  if (R.thanks){ add('Grazie a te!', 'Thank you!'); out.l11hint = { h:'Say goodbye to Lucia, the friendly way: you\'re on <i>tu</i> now.' }; return; }
  add('Allora… ciao?', 'So… bye?');
  out.l11hint = { h:'Say goodbye to Lucia, the friendly way: you\'re on <i>tu</i> now.' };
}

/* ---------- after her lines: feedback, hints, the sheet ---------- */
function l11After(n, out){
  if (!l11Lucia(n) || !convo.l11 || !out.l11) return false;
  const C = convo.l11, st = convo.st;
  if (out.end) return false;                                         // the brain's goodbye: endConvo
  if (out.l11barrier) return l11BarrierEnd();
  if (C.kind === 'barrier' && out.l11greeted){
    if (out.l11formal) showHint('Lucia uses <i>Lei</i> with you: <b>buongiorno</b>, not ciao.', 'Consiglio');
    else showHint(contextHint(false));
    return true;
  }
  if (out.l11done){
    const T = out.l11done, room = T.room, k = room === 0 ? l11StatueCount() : l11RoomsDone();
    sysLine(`Lucia's sheet: ✓ <b>${esc(T.en.split(':')[0])}</b> <span class="l9-tick">${room === 0 ? `${k}/2 statues` : `${k}/10`}</span>`);
    if (out.l11fb) showHint(out.l11fb, 'Consiglio'); else enqueue(() => { hintEl.hidden = true; });
    enqueue(() => { if (convo) convo.done = true; builder.hidden = true; renderHUD(); });
    showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
    return true;
  }
  if (out.l11next){ if (out.l11fb) showHint(out.l11fb, 'Consiglio'); else showHint('Written down! Now her next question.', 'Fatto!'); return true; }
  if (out.l11q === 'tu'){ enqueue(() => { hintEl.hidden = true; }); return true; }
  if (out.l11tu){ showHint('Darsi del tu! From now on, Lucia is <i>tu</i> for you, and you for her.', 'Fatto!'); return true; }
  const H = out.l11hint, q = H && H.q;
  if (out.l11fb){ showHint(out.l11fb + (H && H.h ? ' ' + H.h : ''), 'Consiglio'); return true; }
  if (H){
    if (q && C.kind === 'task'){ const tries = stepTries(st, `${C.task.id}:${l11Rec(C.task).q}`); showHint(hintAfter(tries, H.h, `${H.h} ${l11QStrong(q, C.task, C.at)}`)); }
    else showHint(H.h);
    return true;
  }
  showHint(contextHint(false));
  return true;
}
function l11BarrierEnd(){
  enqueue(() => { builder.hidden = true; hintEl.hidden = true; });
  sysLine('Lucia wants you to compare the two statues, and you have no words for it: no <i>more … than</i>, no <i>this one</i> or <i>that one</i>. Time for the handbook: <b>Lezione 11 · Al museo</b>.');
  enqueue(() => { S.l11.barrier = true; save(); if (S.tut === 'l11-lucia') setTut(S.vocab11 ? 'l11-statues' : 'l11-handbook'); });
  showChoices([{ label:'Leave', fn:closeDialog }, { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(11); } }]);
  return true;
}
/* the hint shown by contextHint (after a sentence that didn't parse, or in general) */
function l11Hint(n, st){
  if (!l11Lucia(n) || !convo || !convo.l11) return null;
  const C = convo.l11;
  if (C.kind === 'barrier') return C.asked ? { h:'She asked you something about the two statues. Try to answer with the words you have.', step:'try' }
    : { h:'She recognised you! Greet her: she uses <i>Lei</i> with you, so politely.', strong:'Greet her politely: <b>buongiorno</b>.', step:'greet' };
  if (C.kind === 'task'){ const rec = l11Rec(C.task), q = C.task.q[rec.q]; if (!q) return { h:'Done! Leave when you are ready.', step:'done' };
    return { h:l11QHint(q, C.task, C.at), strong:`${l11QHint(q, C.task, C.at)} ${l11QStrong(q, C.task, C.at)}`, step:`${C.task.id}:${rec.q}` }; }
  if (C.kind === 'venezia') return C.phase === 'va' ? { h:'She asked you a yes / no question. Any answer is fine.', step:'va' }
    : C.phase === 'tu' ? { h:'She asked you something: <i>darci del tu</i>. Not sure? The handbook has it (<i>What you\'ll hear</i>).', step:'tu' }
    : { h:'Say goodbye to Lucia, the friendly way: you\'re on <i>tu</i> now.', strong:'The friendly goodbye: <b>ciao</b>.', step:'bye' };
  return null;
}
