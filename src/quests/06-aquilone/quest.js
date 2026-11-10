/* Quest 6 · L'aquilone (afternoon). Design: docs/lessons/12-la-citta.md, the quests; system: engine/quests.js.
   In the Giardini dell'Arena (scene 'parco', world/parco.js) a boy, Pietro (tu), stares up at the big tree: his kite is
   stuck high in it. The gardener (Lei) is by his shed: ask him for help and a ladder, "Ci può aiutare? Ha una scala?", and
   say where the kite is, "È in alto, sull'albero." (any order: he asks what's wrong, or why you want a ladder). Then a
   short cutscene: he fetches the ladder from his shed and leans it against the big tree ("Ecco la scala!"). Climb it (E at
   the ladder: Sali) and fetch the kite (a cutscene; the kite goes in your bag), and give it back to Pietro: "Ecco
   l'aquilone!" (the bag's Nella borsa tiles) → "Grazie! Grazie mille!" (tu) → the stamp; Pietro flies it over the lawn.
   Italian: aiutare, Ci può aiutare?, la scala, Ha una scala?, in alto, l'albero / sull'albero, il giardiniere, l'aquilone.
   Saved on the quest's record: help, where, ladder (what the gardener has heard), go (he's fetching it), ladderUp (against
   the tree), got (the kite is in your bag), stay (the scene where the ladder stays after the task, until you leave).
   The scene's ladder and kite follow the record (PARCO.ladder, PARCO.kite: m6Sync). Tests: __dbg().aquilone. */
const M6 = { id:'aquilone', GARD:{ x:300, y:396, face:{ x:-1, y:-0.4 } }, PIETRO:{ x:264, y:412, face:{ x:-0.6, y:-1 } }, carry:false };
const m6Rec = () => { const r = questRec(M6.id); if (!r.mistakes) r.mistakes = { formal:0 }; return r; };
const m6Gard = n => !!n && n.id === 'giardiniere' && questAt(M6.id, 'aiuto');
const m6Pietro = n => !!n && n.id === 'pietro' && questState(M6.id) === 'active';
const m6Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
const M6_TILES = [
  m6Tile('ci può aiutare', 'Ci può aiutare?', 'can you help us? (polite)'), m6Tile('ha una scala', 'Ha una scala?', 'do you have a ladder? (polite)'),
  m6Tile("l'aquilone", "l'aquilone", 'the kite'), m6Tile('è in alto', 'è in alto', 'is high up'), m6Tile("sull'albero", "sull'albero", 'in the tree (up the tree)'),
];
QWORDS.add('ci può'); JOIN.add('ci può'); CLAUSE.add('ha una');

QUESTS.push({
  id:M6.id, n:6, title_it:"L'aquilone", title_en:'The kite in the tree',
  window:'afternoon',
  place:{ scene:'parco', x:300, y:440, label:"Giardini dell'Arena" },
  giver:'pietro',
  steps:[
    { id:'aiuto', en:'Ask the gardener for help, and for a ladder: the kite is high up in the big tree', who:'giardiniere', where:"Giardini dell'Arena, by the shed" },
    { id:'sali', en:'Climb the ladder and fetch the kite', who:null, where:"Giardini dell'Arena, the big tree" },
    { id:'pietro', en:'Give Pietro his kite', who:'pietro', where:"Giardini dell'Arena" },
  ],
  items:{ aquilone:{ label_it:"l'aquilone", label_en:"Pietro's kite", for:'pietro', icon:'◆' } },
  stamp:{ icon:'◆', color:'#c2461f', label:"Giardini dell'Arena" },
  scheda:{
    phrases:[
      ['Ci può aiutare?', 'Can you help us?', 'Ci = us (Pietro and you). Può: polite, to a stranger at work.'],
      ['Ha una scala?', 'Have you got a ladder?', 'Ha …? Have you got …? (polite). To a friend: hai …?'],
      ["L'aquilone è in alto, sull'albero.", 'The kite is high up, in the tree.', "Sull'albero = su + l'albero."],
      ["Ecco l'aquilone!", "Here's your kite!", 'Ecco + what you hand over (the Nella borsa tiles).'],
    ],
    how:`<p><b>Ci può …?</b> Can you … us? (polite, <i>Lei</i>) + a verb: <i>Ci può <b>aiutare</b>?</i> (Can you help us?). To a friend: <i>ci puoi aiutare?</i></p>
      <p><b>Ha …?</b> Have you got …? (polite): <i>Ha una scala?</i> To a friend: <i>hai una scala?</i></p>
      <p>Where it is: <b>in alto</b> (high up), <b>sull'albero</b> (in the tree, on the tree): <i>su</i> + <i>l'albero</i> = <i>sull'albero</i>, as <i>su</i> + <i>il</i> = <i>sul</i>.</p>`,
    culture:`<p>Italian public gardens have their <i>giardiniere</i>, who looks after the lawns, the flowerbeds and the old trees, and knows every child who plays there. On windy afternoons the sky over the parks fills with <i>aquiloni</i>.</p>`,
    vocab:[
      { group:'Aiuto!', words:[
        { it:'aiutare', en:'to help' },
        { it:'Ci può aiutare?', en:'Can you help us? (polite)', also:['ci', 'può'] },
        { it:'la scala', g:'f', en:'the ladder', note:'Also: the stairs.', also:['scala'] },
        { it:'Ha una scala?', en:'Have you got a ladder? (polite)', also:['ha', 'una'] },
        { it:'il giardiniere', g:'m', en:'the gardener', also:['giardiniere'] },
      ] },
      { group:"Sull'albero", words:[
        { it:"l'aquilone", g:'m', en:'the kite', also:['aquilone'] },
        { it:"l'albero", g:'m', en:'the tree', also:['albero'] },
        { it:"sull'albero", en:'in the tree, up the tree', note:"Su + l'albero.", also:["sull'albero"] },
        { it:'in alto', en:'high up', also:['in', 'alto'] },
      ] },
    ],
    exercises:[
      { type:'mc', q:'You ask the gardener, politely, to help you and the boy:', opts:['Ci puoi aiutare?', 'Ci può aiutare?', 'Mi aiuti?'], a:1, why:'A stranger at work: Lei, può. Ci: us.', nudge:'Polite: Lei.' },
      { type:'mc', q:'The kite is stuck high up in a tree: “È in alto, ___ albero.”', opts:['sul', "sull'", 'sulla'], a:1, why:"L'albero starts with a vowel: sull'albero.", nudge:"Albero: l'albero." },
      { type:'mc', q:'“Ha una scala?” — what are you asking for?', opts:['a ladder', 'a key', 'a kite'], a:0, why:'La scala: the ladder (also the stairs).', nudge:'To climb up.', noSpeak:true },
      { type:'mc', q:'You give Pietro his kite: “___ l\'aquilone!”', opts:['Ecco', 'Prego', 'Ciao'], a:0, why:'Ecco: here it is, here you are.', nudge:'Handing something over.' },
    ],
    tiles:M6_TILES,
  },
  hooks:{
    place(){ m6Place(); },
    talk(npc){
      if (npc.id === 'pietro' && questState(M6.id) === 'open') return m6Start(npc);
      if (m6Gard(npc) || m6Pietro(npc)){ convo.m6 = true; convo.known = npc.id === 'pietro' || !!S.known.giardiniere; if (npc.id === 'pietro'){ S.met.pietro = true; convo.known = true; } }
      return false;
    },
    bank(npc, groups, names){
      if (!m6Gard(npc) && !m6Pietro(npc)) return null;
      if (npc.id === 'giardiniere'){
        if (schedaDone(M6.id)) groups.push({ label:'Aiuto!', tiles:M6_TILES.map(phraseTile) });
        groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
      } else groups.push({ label:'Polite', tiles:L10_POLITE.filter(t => !['scusi', 'può ripetere', 'arrivederci'].includes(t.key)).map(phraseTile) });
      if (names.length) groups.push({ label:'Names', tiles:names });
      return groups;
    },
    phrases(npc){
      if (!m6Gard(npc)) return [];
      return [['m6:help', 'ci può aiutare'], ['m6:help', 'può aiutare'], ['m6:help:tu', 'ci puoi aiutare'], ['m6:ladder', 'ha una scala'], ['m6:ladder:tu', 'hai una scala'],
        ['m6:scala', 'una scala'], ['m6:scala', 'la scala'], ['m6:kite', "l'aquilone"], ['m6:high', 'è in alto'], ['m6:high', 'in alto'], ['m6:tree', "sull'albero"], ['ok10', 'va bene']];
    },
    react(id, n, st, add, out, ints){ return m6React(id, n, st, add, out, ints || [id]); },
    hint(n, st){ return m6Hint(n, st); },
    afterTurn(n, out, res, words){ return m6After(n, out, words); },
    onClose(closedId){
      const r = questPeek(M6.id);
      if (closedId === 'giardiniere' && r && r.go && !r.ladderUp && !cutsceneOn()){ setTimeout(m6Ladder, 300); return true; }
      if (closedId === 'pietro' && r && r.given && !r.done){ questDone(M6.id); return true; }
      return false;
    },
    door(d){ if (d.id !== 'parco-scala') return false; m6Climb(); return true; },
    cutsceneResume({ id }){
      if (id === 'm6-scala'){ const r = m6Rec(); r.ladderUp = true; if (questAt(M6.id, 'aiuto')) questStep(M6.id, 'sali'); save(); return true; }
      if (id === 'm6-sali'){ PARCO.climbing = false; return true; }
      return false;
    },
  },
  onDone(){ const r = m6Rec(); r.stay = S.scene === 'parco' ? 'parco' : null; save(); },
});
/* openings by step */
{
  const keep = (o, k) => { const d = Object.getOwnPropertyDescriptor(o, k); return () => d.get ? d.get() : d.value; };
  const p = NPC.pietro, pOp = keep(p, 'opening'), pRe = keep(p, 'revisitOpening');
  const boy = () => { const r = questPeek(M6.id); if (!r || !r.started) return null;
    if (r.done) return { it:'Guarda come vola!', en:'Look how it flies!' };
    if (r.got) return { it:'Il mio aquilone! Ce l\'hai?', en:'My kite! Have you got it?' };
    if (r.ladderUp) return { it:'La scala! Dai, sali!', en:'The ladder! Go on, climb up!' };
    return { it:'Il giardiniere è là, vicino alla sua casetta!', en:'The gardener is over there, by his shed!' }; };
  Object.defineProperty(p, 'opening', { configurable:true, enumerable:true, get:() => boy() || pOp() });
  Object.defineProperty(p, 'revisitOpening', { configurable:true, enumerable:true, get:() => boy() || pRe() });
  const g = NPC.giardiniere, gOp = keep(g, 'opening'), gRe = keep(g, 'revisitOpening');
  const gard = () => { const r = questPeek(M6.id); if (!r || !r.started) return null;
    if (r.done) return { it:'Buongiorno! Tutto a posto, eh?', en:'Good afternoon! All sorted, then?' };
    if (r.ladderUp) return { it:'Ecco la scala. Piano, eh!', en:'There\'s the ladder. Carefully, now!' };
    return { it:'Buongiorno! Mi dica.', en:'Good afternoon! How can I help?' }; };
  Object.defineProperty(g, 'opening', { configurable:true, enumerable:true, get:() => gard() || gOp() });
  Object.defineProperty(g, 'revisitOpening', { configurable:true, enumerable:true, get:() => gard() || gRe() });
}
/* the start: Pietro, under the tree (scripted; the scheda opens after) */
function m6Start(npc){
  convo.known = true; S.met.pietro = true;
  $('#dlgWho').innerHTML = `<b>Pietro</b> <span class="where">· Giardini dell'Arena</span>`;
  builder.hidden = true;
  npcLine('Il mio aquilone! È lassù, sull\'albero!', "My kite! It's up there, in the tree!");
  npcLine('Non ci arrivo… Mi chiamo Pietro.', "I can't reach it… My name's Pietro.", { queue:true });
  sysLine('A boy\'s kite is stuck high up in the big tree. Someone with a ladder could help… The gardener is by his shed. The task\'s <b>scheda</b> has the words to ask him.');
  questStart(M6.id); m6Rec(); save();
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  return true;
}
/* the ladder and the kite follow the record; the gardener and Pietro stand by the tree once the ladder is up */
function m6Sync(){
  if (typeof PARCO === 'undefined') return;
  const r = questPeek(M6.id) || {};
  const atTree = !!r.ladderUp && (!r.done || r.stay === 'parco');
  PARCO.ladder = M6.carry ? 'carried' : atTree ? 'tree' : 'shed';
  PARCO.kite = r.done ? 'flying' : r.got ? 'gone' : 'tree';
  return atTree;
}
function m6Place(){
  const atTree = m6Sync(); if (atTree === undefined) return;
  const r = questPeek(M6.id) || {}, g = NPC.giardiniere, p = NPC.pietro;
  if (!g.home) g.home = { x:g.x, y:g.y, face:{ ...g.baseFace } };
  if (!p.home) p.home = { x:p.x, y:p.y, face:{ ...p.baseFace } };
  if (!g.cutWalk){ const s = atTree ? M6.GARD : g.home; if (!M6.carry){ g.x = s.x; g.y = s.y; g.baseFace = { ...(s.face) }; } }
  if (!p.cutWalk){ const s = r.ladderUp && !r.done || (r.done && r.stay === 'parco') ? M6.PIETRO : p.home; p.x = s.x; p.y = s.y; p.baseFace = { ...s.face }; }
  if (r.done && r.stay && S.scene !== r.stay && !traveling){ r.stay = null; save(); }
}
setInterval(() => { if (questPeek(M6.id)) m6Place(); }, 300);
function m6React(id, n, st, add, out, ints){
  if (m6Pietro(n)) return m6PietroReact(id, n, st, add, out, ints);
  if (!m6Gard(n)) return false;
  if (id === 'greet'){ if (!st.m6greet){ st.m6greet = true; add('Buongiorno! Mi dica.', 'Good afternoon! How can I help?'); } return true; }
  if (!/^m6:/.test(id) && id !== 'ok10') return false;
  if (out.m6) return true;
  out.m6 = true; out.asked = true;
  if (!schedaDone(M6.id)){ add('Prego?', 'Pardon?'); out.m6fb = 'scheda'; return true; }
  const r = m6Rec(), has = k => ints.includes(k), fb = h => { if (!out.m6fb) out.m6fb = h; };
  if (has('m6:help:tu') || has('m6:ladder:tu')){ r.mistakes.formal++; fb('He understood, but he\'s a stranger at work: <b>Lei</b> (<b>può</b>, <b>ha</b>), not tu.'); }
  const help = has('m6:help') || has('m6:help:tu'), ladder = has('m6:ladder') || has('m6:ladder:tu') || has('m6:scala');
  const where = has('m6:tree') || has('m6:high'), kite = has('m6:kite');
  if (help) r.help = true;
  if (where) r.where = true;
  if (ladder) r.ladder = true;
  save();
  if (r.where && r.ladder){
    add(where && !ladder ? 'Ah, sull\'albero grande! Allora sì, ci vuole la scala.' : ladder && !where ? 'Ah, per l\'aquilone! Sì, certo.' : 'Una scala, per l\'aquilone sull\'albero? Certo!', where && !ladder ? 'Ah, in the big tree! Then yes, we need the ladder.' : ladder && !where ? 'Ah, for the kite! Yes, of course.' : 'A ladder, for the kite in the tree? Of course!');
    add('Va bene, prendo la scala. Andiamo!', "All right, I'll get the ladder. Let's go!");
    r.go = true; save(); out.m6go = true; out.end = true; return true;
  }
  if (ladder){ add('Una scala? Sì, nella casetta. Ma… perché?', 'A ladder? Yes, in the shed. But… why?'); fb('He asked why. Tell him where the kite is.'); return true; }
  if (where){ add(kite || r.help ? 'L\'aquilone di Pietro? Sull\'albero grande? Eh… è molto in alto. Come facciamo?' : 'Che cosa è in alto?', kite || r.help ? "Pietro's kite? In the big tree? Ah… it's very high up. How do we do it?" : 'What is high up?');
    fb(kite || r.help ? 'He knows where it is. What do you need to reach it? Ask him if he has one.' : 'Say <i>what</i> is up in the tree.'); return true; }
  if (help){ add('Certo! Che cosa c\'è?', 'Of course! What\'s the matter?'); st.lastQ = 'what'; fb('He asked what\'s wrong. Tell him where the kite is.'); return true; }
  if (kite){ add('L\'aquilone? Dove?', 'The kite? Where?'); fb('Tell him where it is.'); return true; }
  add('Mi dica.', 'How can I help?'); fb('Ask the gardener for help.'); return true;
}
function m6PietroReact(id, n, st, add, out, ints){
  if (id === 'give:aquilone' && bagHas('aquilone')){
    if (out.m6) return true; out.m6 = true; out.asked = true;
    add('Il mio aquilone! Grazie! Grazie mille!', 'My kite! Thank you! Thank you so much!');
    add('Sei un mito! Ciao!', "You're a legend! Bye!");
    const r = m6Rec(); r.given = true; bagRemove('aquilone'); save(); out.m6given = true; out.end = true; return true;
  }
  return false;
}
function m6After(n, out, words){
  if (m6Pietro(n)){
    if (out.m6given){ convo.keepHint = true; showHint('Pietro has his kite back! Done: a stamp in your passport.', 'Fatto!'); enqueue(() => { if (convo) endConvo(); }); return true; }
    return false;
  }
  if (!out.m6) return false;
  if (out.m6fb === 'scheda'){ showHint('First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).'); return true; }
  if (out.m6go){ convo.keepHint = true; showHint((out.m6fb ? out.m6fb + ' ' : '') + 'He\'s fetching his ladder! Say goodbye, and watch.', 'Fatto!'); enqueue(() => { if (convo) endConvo(); }); return true; }
  const formal = !convo.tips.formal && words && ['ciao', 'scusa', 'stai'].some(w => words.includes(w));
  if (formal){ convo.tips.formal = true; showHint('The gardener is a stranger at work: the polite forms (<b>buongiorno</b>, <b>scusi</b>, <b>Lei</b>).', 'Consiglio'); return true; }
  if (out.m6fb){ showHint(hintAfter(stepTries(convo.st, m6Step()), out.m6fb, m6Strong()), 'Consiglio'); return true; }
  showHint(contextHint(false));
  return true;
}
const m6Step = () => { const r = m6Rec(); return !r.help && !r.where && !r.ladder ? 'm6-help' : !r.where ? 'm6-where' : 'm6-ladder'; };
const m6Strong = () => { const r = m6Rec();
  return !r.help && !r.where && !r.ladder ? 'Ask for help, politely: <b>aiutare</b>, with <b>ci può</b> …' : !r.where ? 'Where: <b>in alto</b>, <b>sull\'albero</b>.' : 'Ask if he has one: <b>ha</b> … <b>una scala</b>.'; };
function m6Hint(n, st){
  if (m6Pietro(n)){
    const r = m6Rec();
    if (!schedaDone(M6.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
    if (bagHas('aquilone')) return { h:'You have his kite: hand it over, the <b>Nella borsa</b> tiles.', strong:'Hand it over: <b>Ecco</b> … (the Nella borsa tiles).', step:'m6-give' };
    if (r.ladderUp) return { h:'The ladder is against the big tree: climb up (<kbd>E</kbd> at the ladder).', step:'m6-climb' };
    return { h:'The gardener (by his shed) might have something to reach the kite with. Ask him for help.', step:'m6-go' };
  }
  if (!m6Gard(n)) return null;
  if (!schedaDone(M6.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
  const r = m6Rec();
  if (!r.help && !r.where && !r.ladder) return { h:'Ask the gardener for help. He\'s a stranger at work: polite (Lei).', strong:m6Strong(), step:'m6-help' };
  if (!r.where) return { h:'Tell him where the kite is.', strong:m6Strong(), step:'m6-where' };
  return { h:'He knows where the kite is. What do you need to reach it? Ask him if he has one.', strong:m6Strong(), step:'m6-ladder' };
}
/* the gardener fetches his ladder from the shed and leans it against the big tree */
function m6Ladder(){
  const r = m6Rec(), g = NPC.giardiniere, P = PARCO;
  const done = () => { M6.carry = false; r.ladderUp = true; if (questAt(M6.id, 'aiuto')) questStep(M6.id, 'sali'); save(); m6Place(); };
  cutscene([
    { guide:'The gardener goes to fetch his ladder…' },
    { walk:'giardiniere', path:[[g.x, g.y], [744, 200], [770, 178]], speed:120, face:{ x:0, y:-1 } },
    { run:() => { M6.carry = true; PARCO.ladder = 'carried'; } },
    { wait:400 },
    { say:'Ecco la scala!', who:'giardiniere', ms:1500 },
    { walk:'player', to:{ x:262, y:372 }, speed:150, async:true, find:true },
    { walk:'giardiniere', path:[[740, 214], [640, 278], [520, 312], [380, 340], [M6.GARD.x, M6.GARD.y - 30]], speed:110 },
    { walk:'giardiniere', to:{ x:P.ladderTree.x + 6, y:P.ladderTree.y + 22 }, speed:90 },
    { run:() => { M6.carry = false; r.ladderUp = true; save(); m6Sync(); } },
    { wait:300 },
    { walk:'giardiniere', to:{ x:M6.GARD.x, y:M6.GARD.y }, speed:110 },
    { face:'giardiniere', to:'player' },
    { say:'Prego! Piano piano, eh!', who:'giardiniere', ms:1900 },
  ], { id:'m6-scala', guide:'', onSkip:done }).then(res => {
    if (res.replaced) return;
    done();
    toast('The ladder is against the big tree. Climb up: <b>E</b> at the ladder.');
  });
}
/* up the ladder, the kite, back down */
function m6Climb(){
  const r = m6Rec(), L = PARCO.ladderTree, K = PARCO.kiteAt, q = questById(M6.id);
  if (!questAt(M6.id, 'sali')){ toast('The gardener\'s ladder, against the big tree.'); return; }
  const top = { x:L.x - 16, y:L.y - 150 };
  const got = () => { r.got = true; bagAdd('aquilone', q); if (questAt(M6.id, 'sali')) questStep(M6.id, 'pietro'); save(); m6Sync(); };
  cutscene([
    { guide:'Up the ladder, carefully…' },
    { walk:'player', to:{ x:L.x, y:L.y + 16 }, speed:130, face:{ x:0, y:-1 } },
    { run:() => { PARCO.climbing = true; } },
    { walk:'player', path:[[L.x - 4, L.y - 30], [L.x - 9, L.y - 80], [top.x, top.y]], speed:55, face:{ x:-0.4, y:-1 } },
    { face:'player', to:{ x:K.x, y:K.y } },
    { wait:500 },
    { run:got },
    { say:'Preso!', who:'player', ms:1200 },
    { walk:'player', path:[[L.x - 9, L.y - 80], [L.x - 4, L.y - 30], [L.x, L.y + 16]], speed:70 },
    { run:() => { PARCO.climbing = false; } },
    { walk:'player', to:{ x:L.x + 24, y:L.y + 44 }, speed:110 },
    { face:'player', to:'pietro' },
  ], { id:'m6-sali', guide:'', onSkip:() => { if (!r.got) got(); PARCO.climbing = false; player.x = L.x + 24; player.y = L.y + 44; } }).then(res => {
    if (res.replaced) return;
    PARCO.climbing = false; if (!r.got) got();
    toast('<b>L\'aquilone</b> is in your bag. Give it back to Pietro!');
  });
}
/* the scene: the ladder carried over the gardener's shoulder, the player on the ladder (drawn over the tree), Pietro's kite
   flying once he has it back */
SCENE_EXTRAS.push({ scene:'parco', ents(t){
  const out = [], g = NPC.giardiniere;
  if (M6.carry && g) out.push({ y:g.y + 1, draw:() => { const f = g.face || { x:1, y:0 }; parcoLadder(g.x, g.y - 2, 92, Math.atan2(f.y, f.x), true); } });
  if (PARCO.climbing) out.push({ y:9999, draw:() => drawPerson(player, t) });
  /* the kite in the sky, on its string from Pietro's hand */
  const p = NPC.pietro;
  if (PARCO.kite === 'flying' && p && activeNpcs().includes(p)) out.push({ y:9998, draw:() => {
    const kx = p.x + 120 + (RM ? 0 : Math.sin(t * 0.7) * 30), ky = Math.max(60, p.y - 230 + (RM ? 0 : Math.cos(t * 0.9) * 18));
    ctx.strokeStyle = 'rgba(40,40,40,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x + 6, p.y - 4); ctx.quadraticCurveTo(p.x + 70, p.y - 40, kx, ky + 22); ctx.stroke();
    parcoKite(kx, ky, RM ? 0.3 : 0.3 + Math.sin(t * 1.3) * 0.12, t, false); } });
  return out;
} });
function aquiloneDbg(){ const r = questPeek(M6.id) || {}; return { help:!!r.help, where:!!r.where, ladder:!!r.ladder, go:!!r.go, ladderUp:!!r.ladderUp, got:!!r.got, given:!!r.given, scene:typeof PARCO !== 'undefined' ? parcoDbg() : null }; }
