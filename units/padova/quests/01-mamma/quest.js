/* Quest 1 · Dov'è la mamma? (any time). Design: docs/lessons/12-la-citta.md, the quests (the short trail: Lesson 14's is
   the big one); system: engine/quests.js.
   A little girl, Giorgia, is alone in the piazza: "Mi aiuti? Dov'è la mia mamma?" (tu). You ask what her mum looks like,
   "Com'è la tua mamma?" → "Ha i capelli rossi e una borsa gialla. Le piacciono tanto i fiori!"; she comes with you (she
   follows you, like Lucia in the museum). Flowers: Gino's stall at the market. "Ha visto una signora con i capelli rossi?"
   (Lei; Ha visto una signora…? is a set phrase) → "Sì! … È andata a prendere un caffè, al Bar Centrale." (è andata: the past,
   heard and glossed). At Bar Centrale's tables her mum, Laura: Giorgia runs to her (a cutscene), and Laura thanks you (Lei).
   At night: Bar Centrale is shut and the market closed, but Gino is still packing up his stall, and Laura has gone for an
   ice cream: "È andata a prendere un gelato, alla gelateria." (the shop template's gelateria). If night falls while you are
   on your way to the bar, she has moved on to the gelateria (the hint says so).
   Italian: Com'è…?, la mamma, i capelli, la borsa, gli occhiali, alto / alta, basso / bassa, Ha visto una signora…?, Vieni con
   me!, Prego!; colours (review, with agreement: i capelli rossi, una borsa gialla); heard: È andata a….
   Saved on the quest's record: described, follows (Giorgia comes with you), went ('bar' | 'gelateria': what Gino said),
   reunited, stay (the scene where they are after the reunion, until you leave it), mistakes:{ agree, wrong, formal }. */
const M1 = { id:'mamma', BAR:{ x:879, y:262, face:{ x:1, y:0 } }, GEL:{ x:174, y:380, face:{ x:1, y:0 } } };
const m1Rec = () => { const r = questRec(M1.id); if (!r.mistakes) r.mistakes = { agree:0, wrong:0, formal:0 }; return r; };
/* where Laura is now: Bar Centrale's tables by day, the gelateria at night */
const m1MumScene = () => daytime() === 'night' ? 'gelateria' : 'piazza';
const m1MumSpot = () => m1MumScene() === 'gelateria' ? M1.GEL : M1.BAR;
const m1Follows = () => { const r = questPeek(M1.id); return !!r && r.started && !r.done && !!r.follows && !r.reunited; };
const m1Girl = n => !!n && n.id === 'bambina' && questState(M1.id) === 'active';
const m1Gino = n => !!n && n.id === 'gino' && questAt(M1.id, 'gino');
const m1Mum = n => !!n && n.id === 'mamma' && questState(M1.id) === 'active';
const m1Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
const M1_GIRL = [m1Tile("com'è la tua mamma", "Com'è la tua mamma?", "what's your mum like?"), m1Tile('vieni con me', 'Vieni con me!', 'come with me! (to a friend, a child)'), m1Tile("dov'è la tua mamma", "Dov'è la tua mamma?", "where's your mum?")];
const M1_DESC = [
  m1Tile('ha visto una signora', 'Ha visto una signora…?', 'have you seen a lady…? (polite)'), m1Tile('con', 'con', 'with'),
  m1Tile('i capelli', 'i capelli', 'hair (the hairs: plural)'), m1Tile('rossi', 'rossi', 'red (hair: plural)'), m1Tile('neri', 'neri', 'black (plural)'), m1Tile('biondi', 'biondi', 'blond (plural)'),
  m1Tile('una borsa', 'una borsa', 'a bag'), m1Tile('gialla', 'gialla', 'yellow (feminine)'), m1Tile('rossa', 'rossa', 'red (feminine)'), m1Tile('nera', 'nera', 'black (feminine)'),
  m1Tile('gli occhiali', 'gli occhiali', 'glasses'), m1Tile('alta', 'alta', 'tall (feminine)'), m1Tile('bassa', 'bassa', 'short (feminine)'),
];
const M1_THANKS = [m1Tile('prego', 'Prego!', "you're welcome")];
const M1_HAIR = { rossi:'red', neri:'black', biondi:'blond' }, M1_BAG = { gialla:'yellow', rossa:'red', nera:'black' };
QWORDS.add('visto'); QWORDS.add("com'è"); JOIN.add('ha visto'); CLAUSE.add('vieni'); CLAUSE.add("com'è");

QUESTS.push({
  id:M1.id, n:1, title_it:"Dov'è la mamma?", title_en:'Find a little girl\'s mum',
  window:'any',
  place:{ scene:'piazza', x:640, y:470, label:'Piazza Centrale' },
  giver:'bambina',
  steps:[
    { id:'describe', en:'Ask Giorgia what her mum looks like', who:'bambina', where:'Piazza Centrale' },
    { id:'gino', en:'Find someone who has seen Giorgia\'s mum (red hair, a yellow bag; she loves flowers)', who:'gino', where:'Giorgia comes with you' },
    { id:'mamma', get en(){ return m1MumScene() === 'gelateria' ? 'Take Giorgia to her mum: the gelateria' : 'Take Giorgia to her mum: Bar Centrale'; }, who:'mamma',
      get where(){ return m1MumScene() === 'gelateria' ? 'Gelateria, Piazza Centrale' : 'Bar Centrale, Piazza Centrale'; } },
  ],
  stamp:{ icon:'♥', color:'#c2461f', label:'Piazza Centrale' },
  scheda:{
    phrases:[
      ["Com'è la tua mamma?", "What's your mum like?", "Com'è…? asks what someone or something is like. La tua: to a child, tu."],
      ['Ha i capelli rossi e una borsa gialla.', 'She has red hair and a yellow bag.', 'Hair is plural in Italian: i capelli rossi.'],
      ['Ha visto una signora con i capelli rossi?', 'Have you seen a lady with red hair?', 'Ha visto…? (polite): learn it as a block.'],
      ['È andata a prendere un caffè.', 'She went to get a coffee.', 'You will hear it: the past. È andata: she went.'],
      ['Vieni con me!', 'Come with me!', 'To a friend or a child.'],
    ],
    how:`<p>Describing someone: <b>ha</b> (she has) + what she has: <i>ha <b>i capelli rossi</b></i>, <i>ha <b>una borsa gialla</b></i>, <i>ha <b>gli occhiali</b></i>. Or <b>è</b> + what she is: <i>è <b>alta</b></i>, <i>è <b>bassa</b></i>.</p>
      <p>The colour agrees: <b>i capelli</b> are plural, so ross<b>i</b>, ner<b>i</b>, biond<b>i</b>; <b>la borsa</b> is feminine, so giall<b>a</b>, ross<b>a</b>.</p>
      <p>Asking: <b>Ha visto una signora…?</b> then <b>con</b> + what she has: <i>con i capelli rossi</i>, <i>con una borsa gialla</i>.</p>
      <p>You will hear <b>è andata a…</b>: <i>she went to…</i> (the past, coming soon).</p>`,
    culture:`<p>In Italy children are everyone's business: a lost child in a piazza is quickly surrounded by helpful grown-ups. To a child you always say <b>tu</b>; to her mum, <b>Lei</b>.</p>`,
    vocab:[
      { group:'Describing', words:[
        { it:'la mamma', g:'f', en:'mum', also:['mamma'] },
        { it:"Com'è…?", say:"Com'è la tua mamma?", en:"What is … like?", also:["com'è", 'tua'] },
        { it:'i capelli', g:'m pl', en:'the hair', note:'Plural, so the colour is too: i capelli rossi, neri, biondi (blond).', also:['capelli', 'rossi', 'neri', 'biondi'] },
        { it:'la borsa', g:'f', en:'the bag', also:['borsa'] },
        { it:'gli occhiali', g:'m pl', en:'the glasses', also:['occhiali'] },
        { it:'alto / alta', en:'tall', also:['alta', 'alto'] },
        { it:'basso / bassa', en:'short (not tall)', also:['bassa', 'basso'] },
      ] },
      { group:'Asking and helping', words:[
        { it:'Ha visto una signora…?', say:'Ha visto una signora con i capelli rossi?', en:'Have you seen a lady…? (polite)', also:['visto', 'signora'] },
        { it:'Vieni con me!', en:'Come with me! (to a friend)', also:['vieni'] },
        { it:'Prego!', en:"You're welcome!", also:['prego'] },
      ] },
    ],
    exercises:[
      { type:'mc', q:'Giorgia: “Ha i capelli ___.”', opts:['rossa', 'rossi', 'rosso'], a:1, why:'I capelli: masculine plural, so rossi.', nudge:'Capelli is plural.' },
      { type:'mc', q:'Gino is a stranger at work. You ask him:', opts:['Hai visto una signora con una borsa gialla?', 'Ha visto una signora con una borsa gialla?', 'Com\'è la tua mamma?'], a:1, why:'Lei: ha visto.', nudge:'Polite: Lei.' },
      { type:'mc', q:'“È andata a prendere un caffè.” Where is she?', opts:['She went to get a coffee', 'She is making a coffee', 'She wants a coffee'], a:0, why:'È andata: she went (the past).', nudge:'Andata: gone.', noSpeak:true },
      { type:'mc', q:'You ask the little girl what her mum is like:', opts:["Com'è la Sua mamma?", "Com'è la tua mamma?", "Dov'è la tua mamma?"], a:1, why:'A child: tu, la tua. And com\'è asks what she is like.', nudge:"Dov'è asks where." },
    ],
    tiles:[...M1_GIRL, ...M1_DESC, ...M1_THANKS],
  },
  hooks:{
    /* Giorgia comes with you from her description to the reunion; Laura is nowhere until Gino has seen her */
    follower(){ return m1Follows() ? NPC.bambina : null; },
    place(){ m1Place(); },
    dests:{ mercato:() => questAt(M1.id, 'gino') },
    talk(npc){
      if (npc.id === 'bambina' && questState(M1.id) === 'open') return m1Start(npc);
      if (m1Girl(npc) || m1Gino(npc) || m1Mum(npc)){ convo.m1 = true; convo.known = npc.id !== 'gino' || !!S.known.gino; if (npc.id === 'bambina'){ S.met.bambina = true; convo.known = true; } }
      return false;
    },
    bank(npc, groups, names){
      if (!m1Girl(npc) && !m1Gino(npc) && !m1Mum(npc)) return null;
      if (!schedaDone(M1.id)){ groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) }); return groups; }
      if (npc.id === 'bambina') groups.push({ label:'La mamma', tiles:M1_GIRL.map(phraseTile) });
      if (npc.id === 'gino') groups.push({ label:'Ha visto…?', tiles:M1_DESC.map(phraseTile) });
      if (npc.id === 'mamma') groups.push({ label:'Prego', tiles:M1_THANKS.map(phraseTile) });
      groups.push({ label:'Polite', tiles:L10_POLITE.filter(t => npc.id !== 'bambina' || !['scusi', 'può ripetere', 'arrivederci'].includes(t.key)).map(phraseTile) });
      if (names.length) groups.push({ label:'Names', tiles:names });
      return groups;
    },
    phrases(npc){
      if (!m1Girl(npc) && !m1Gino(npc) && !m1Mum(npc)) return [];
      const P = [['m1:what', "com'è la tua mamma"], ['m1:what', "com'è la mamma"], ['m1:what:lei', "com'è la sua mamma"], ['m1:where', "dov'è la tua mamma"], ['m1:come', 'vieni con me'], ['m1:prego', 'prego'],
        ['m1:seen', 'ha visto una signora'], ['m1:seen:tu', 'hai visto una signora'], ['m1:with', 'con'], ['m1:glasses', 'gli occhiali'], ['m1:tall', 'alta'], ['m1:short', 'bassa'], ['m1:tallbad', 'alto'], ['m1:shortbad', 'basso'],
        ['m1:hair:?', 'i capelli'], ['m1:bag:?', 'una borsa']];
      const all = ['rossi', 'neri', 'biondi', 'gialla', 'rossa', 'nera', 'giallo', 'rosso', 'nero', 'gialli', 'rosse', 'nere', 'gialle'];
      const base = w => ({ rossi:'rossi', rossa:'rossi', rosso:'rossi', rosse:'rossi', neri:'neri', nera:'neri', nero:'neri', nere:'neri', biondi:'biondi', gialla:'gialli', giallo:'gialli', gialli:'gialli', gialle:'gialli' })[w];
      const fem = { rossi:'rossa', neri:'nera', gialli:'gialla', biondi:'bionda' };
      all.forEach(c => {
        P.push(['m1:hair:' + base(c) + (/i$/.test(c) ? '' : ':bad:' + c), 'i capelli ' + c]);
        const f = fem[base(c)];
        P.push(['m1:bag:' + f + (c === f ? '' : ':bad:' + c), 'una borsa ' + c]);
        P.push(['m1:col:' + c, c]);
      });
      return P;
    },
    react(id, n, st, add, out, ints){ return m1React(id, n, st, add, out, ints || [id]); },
    hint(n, st){ return m1Hint(n, st); },
    afterTurn(n, out, res, words){ return m1After(n, out, words); },
    onClose(closedId){
      const r = questPeek(M1.id);
      if (closedId === 'mamma' && r && r.thanked && !r.done){ questDone(M1.id); return true; }
      return false;
    },
  },
  onDone(){ const r = m1Rec(); if (!r.stay) r.stay = S.scene; save(); },
});
/* where Giorgia and Laura are (getters on scene, so it holds when the quest's hooks are not live: after it is done): Giorgia in
   the piazza, or wherever you are while she comes with you; Laura nowhere until Gino has seen her; after the reunion both
   where it happened, until you leave */
Object.defineProperty(NPC.bambina, 'scene', { configurable:true, enumerable:true, get(){
  const r = questPeek(M1.id);
  if (r && r.reunited) return r.done ? (r.stay && r.stay === S.scene ? S.scene : 'away') : r.stay || 'away';
  return m1Follows() ? S.scene : 'piazza';
} });
Object.defineProperty(NPC.mamma, 'scene', { configurable:true, enumerable:true, get(){
  const r = questPeek(M1.id);
  if (r && r.reunited) return r.done ? (r.stay && r.stay === S.scene ? S.scene : 'away') : r.stay || 'away';
  return questAt(M1.id, 'mamma') ? m1MumScene() : 'away';
} });
/* Gino, at night: still packing up his stall while Giorgia's trail needs him (the market is otherwise closed) */
NPC.gino.hours = { get night(){ return questAt(M1.id, 'gino') ? undefined : false; } };
/* openings by step */
{
  const keep = (o, k) => { const d = Object.getOwnPropertyDescriptor(o, k); return () => d.get ? d.get() : d.value; };
  const g = NPC.bambina, gOp = keep(g, 'opening'), gRe = keep(g, 'revisitOpening');
  const girl = () => {
    const r = questPeek(M1.id);
    if (!r || !r.started || r.done) return null;
    if (r.reunited) return { it:'Grazie, {Me}! Ciao!', en:'Thank you, {Me}! Bye!' };
    if (r.follows) return { it:'La mamma… dov\'è? Andiamo!', en:"Mummy… where is she? Let's go!" };
    return { it:'Ciao… Dov\'è la mia mamma?', en:"Hi… Where's my mummy?" };
  };
  Object.defineProperty(g, 'opening', { configurable:true, enumerable:true, get:() => girl() || gOp() });
  Object.defineProperty(g, 'revisitOpening', { configurable:true, enumerable:true, get:() => girl() || gRe() });
  const gi = NPC.gino, giOp = keep(gi, 'opening'), giRe = keep(gi, 'revisitOpening');
  const gino = () => questAt(M1.id, 'gino') ? (daytime() === 'night' ? { it:'Buonasera! Eh, sto chiudendo… Oh, e questa bambina?', en:"Good evening! Ah, I'm closing up… Oh, and who's this little girl?" }
    : { it:'Buongiorno! Oh, e questa bambina?', en:"Good afternoon! Oh, and who's this little girl?" }) : null;
  Object.defineProperty(gi, 'opening', { configurable:true, enumerable:true, get:() => gino() || giOp() });
  Object.defineProperty(gi, 'revisitOpening', { configurable:true, enumerable:true, get:() => gino() || giRe() });
  const m = NPC.mamma;
  const mum = () => { const r = questPeek(M1.id) || {}; return r.reunited && !r.done ? { it:'Grazie! Grazie mille! Lei è molto gentile.', en:'Thank you! Thank you so much! You are very kind.' }
    : daytime() === 'night' ? { it:'Buonasera!', en:'Good evening!' } : { it:'Buongiorno!', en:'Good afternoon!' }; };
  ['opening', 'revisitOpening'].forEach(k => Object.defineProperty(m, k, { configurable:true, enumerable:true, get:mum }));
}

/* the start: Giorgia, alone (scripted lines; then the scheda opens) */
function m1Start(npc){
  convo.known = true; S.met.bambina = true;
  $('#dlgWho').innerHTML = `<b>Giorgia</b> <span class="where">· Piazza Centrale</span>`;
  builder.hidden = true;
  npcLine('Mi aiuti? Dov\'è la mia mamma? Non la trovo!', "Will you help me? Where's my mummy? I can't find her!");
  npcLine('Mi chiamo Giorgia…', 'My name is Giorgia…', { queue:true });
  sysLine('A little girl, alone, has lost her mum. What does her mum look like? The task\'s <b>scheda</b> has the words to ask, and to describe someone.');
  questStart(M1.id); m1Rec(); save();
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  return true;
}

/* where everyone stands: Laura at a table (Bar Centrale's, or the gelateria's); after the reunion Giorgia beside her */
function m1Place(){
  const r = questPeek(M1.id); if (!r || !r.started) return;
  const m = NPC.mamma, g = NPC.bambina, sp = m1MumSpot();
  if (!m.cutWalk && (questAt(M1.id, 'mamma') || r.reunited)){ if (!r.reunited || !r.at2){ m.x = sp.x; m.y = sp.y; m.baseFace = { ...sp.face }; } m.seated = true; }
  if (r.reunited && !g.cutWalk && r.at2){ g.x = r.at2.x; g.y = r.at2.y; g.baseFace = { x:-1, y:0 }; }
  /* after the reunion they stay where they are until you leave */
  if (r.done && r.stay && S.scene !== r.stay && !traveling){ r.stay = null; save(); }
}
/* every 300 ms: Giorgia sees her mum (you, with her, near Laura) → the reunion */
setInterval(() => {
  m1Place();
  const r = questPeek(M1.id);
  if (!r || !questAt(M1.id, 'mamma') || r.reunited || !r.follows || introOpen || dialogOpen || modalOpen || traveling || cutsceneOn() || pickOpen) return;
  const m = NPC.mamma; if (sceneOf(m) !== S.scene) return;
  if (Math.hypot(player.x - m.x, player.y - m.y) > 170) return;
  m1Reunion();
}, 300);
function m1Reunion(){
  const r = m1Rec(), m = NPC.mamma, g = NPC.bambina;
  const to = { x:m.x, y:m.y + 58 };                                   // (below her: their name pills don't cover each other)
  cutscene([
    { face:'bambina', to:'mamma' },
    { say:'Mamma!', who:'bambina', ms:1300 },
    { run:() => { r.reunited = true; r.follows = false; r.stay = S.scene; r.at2 = to; save(); } },
    { walk:'bambina', to, speed:170, face:{ x:-1, y:-0.6 } },
    { face:'mamma', to:'bambina' },
    { say:'Giorgia! Eccoti!', who:'mamma', ms:1500 },
    { wait:500 },
    { face:'mamma', to:'player' },
  ], { id:'m1-reunion', guide:'Giorgia has seen someone…', onSkip:() => { Object.assign(r, { reunited:true, follows:false, stay:S.scene, at2:to }); g.x = to.x; g.y = to.y; save(); } }).then(res => {
    if (res.replaced) return;
    renderHUD();
    setTimeout(() => { if (!dialogOpen && sceneOf(NPC.mamma) === S.scene) openConvo(NPC.mamma); }, 300);
  });
}

/* what the player said */
function m1Read(ints){
  const R = { what:false, whatLei:false, where:false, come:false, prego:false, seen:false, seenTu:false, hair:[], bag:[], bad:[], glasses:false, tall:false, short:false, tallBad:false, cols:[],
    yes:false, no:false, thanks:false, bye:false, greet:false, social:false, other:[] };
  ints.forEach(id => {
    let m;
    if (id === 'm1:what') R.what = true;
    else if (id === 'm1:what:lei'){ R.what = true; R.whatLei = true; }
    else if (id === 'm1:where') R.where = true;
    else if (id === 'm1:come') R.come = true;
    else if (id === 'm1:prego') R.prego = true;
    else if (id === 'm1:seen') R.seen = true;
    else if (id === 'm1:seen:tu'){ R.seen = true; R.seenTu = true; }
    else if ((m = id.match(/^m1:hair:([a-z?]+)(?::bad:(\w+))?$/))){ if (m[1] !== '?') R.hair.push(m[1]); else R.hair.push('?'); if (m[2]) R.bad.push({ what:'capelli', said:m[2], right:m[1] }); }
    else if ((m = id.match(/^m1:bag:([a-z?]+)(?::bad:(\w+))?$/))){ R.bag.push(m[1]); if (m[2]) R.bad.push({ what:'borsa', said:m[2], right:m[1] }); }
    else if ((m = id.match(/^m1:col:(\w+)$/))) R.cols.push(m[1]);
    else if (id === 'm1:glasses') R.glasses = true;
    else if (id === 'm1:tall') R.tall = true;
    else if (id === 'm1:short') R.short = true;
    else if (id === 'm1:tallbad' || id === 'm1:shortbad'){ R.tallBad = true; if (id === 'm1:tallbad') R.tall = true; else R.short = true; }
    else if (id === 'm1:with') {}
    else if (id === 'yes' || id === 'ok10') R.yes = true;
    else if (id === 'no') R.no = true;
    else if (id === 'thanks') R.thanks = true;
    else if (id === 'bye') R.bye = true;
    else if (id === 'greet') R.greet = true;
    else if (['ask_how', 'answer_how', 'ask_name', 'give_name', 'ask_back', 'nice', 'address', 'name_only', 'excuse', 'please', 'and', 'madam', 'sir'].includes(id)) R.social = true;
    else R.other.push(id);
  });
  return R;
}
function m1React(id, n, st, add, out, ints){
  if (!m1Girl(n) && !m1Gino(n) && !m1Mum(n)) return false;
  if (!/^m1:/.test(id) && !(n.id === 'mamma' && ['thanks', 'bye', 'greet'].includes(id)) && !(n.id === 'bambina' && ['yes', 'greet'].includes(id))) return false;
  if (out.m1) return true;
  out.m1 = true; out.asked = true;
  if (!schedaDone(M1.id)){ add(n.id === 'bambina' ? 'Eh?' : 'Prego?', n.id === 'bambina' ? 'Huh?' : 'Pardon?'); out.m1fb = 'scheda'; return true; }
  const r = m1Rec(), R = m1Read(ints), fb = h => { if (!out.m1fb) out.m1fb = h; };
  if (n.id === 'bambina'){
    if (R.greet && !R.what && !R.come && !R.where && !R.yes){ add('Ciao…', 'Hi…'); return true; }
    if (R.what){
      add('La mia mamma? Ha i capelli rossi… e una borsa gialla. Le piacciono tanto i fiori!', 'My mummy? She has red hair… and a yellow bag. She loves flowers!');
      add('Mi aiuti a cercarla?', 'Will you help me look for her?');
      if (R.whatLei){ r.mistakes.formal++; fb('She understood, but she\'s a little girl: <b>tu</b>, so <b>la tua</b> mamma.'); }
      r.described = true; save(); st.m1q = 'help'; out.m1described = true; return true;
    }
    if (R.come || (R.yes && r.described)){
      if (!r.described){ add('Sì… ma dov\'è la mamma?', 'Yes… but where is mummy?'); fb('First find out what her mum looks like.'); return true; }
      add('Sì! Vengo con te!', "Yes! I'm coming with you!");
      r.follows = true; if (questAt(M1.id, 'describe')) questStep(M1.id, 'gino'); save(); out.m1follow = true; return true;
    }
    if (R.where){ add('Non lo so! Non la trovo!', "I don't know! I can't find her!"); fb('She doesn\'t know: that\'s the problem! Ask her what her mum looks like instead.'); return true; }
    add('Eh?', 'Huh?'); fb(r.described ? 'She asked you to help her look. Say yes!' : 'Ask her what her mum looks like.'); return true;
  }
  if (n.id === 'gino'){
    const desc = R.hair.length || R.bag.length || R.glasses || R.tall || R.short || R.cols.length;
    if (R.seenTu){ fb('Gino is a stranger at work: <b>ha visto</b>, not hai visto.'); r.mistakes.formal++; }
    R.bad.forEach(b => { r.mistakes.agree++; fb(b.what === 'capelli' ? `<b>I capelli</b> are plural: <b>${b.right}</b>, not ${b.said}.` : `<b>La borsa</b> is feminine: <b>${b.right}</b>, not ${b.said}.`); });
    if (R.tallBad) fb('<b>Una signora</b> is feminine: <b>alta</b> / <b>bassa</b>.');
    const wrongHair = R.hair.some(h => h !== 'rossi' && h !== '?'), wrongBag = R.bag.some(b => b !== 'gialla' && b !== '?');
    const right = R.hair.includes('rossi') || R.bag.includes('gialla');
    if (!desc && R.seen){ add('Una signora? Eh, tante signore! Com\'è?', 'A lady? Ah, lots of ladies! What does she look like?'); fb('Describe her: what Giorgia told you.'); return true; }
    if (!desc){ add('Prego?', 'Pardon?'); fb('Ask Gino if he has seen a lady like Giorgia\'s mum.'); return true; }
    if (wrongHair || wrongBag){
      r.mistakes.wrong++;
      const what = wrongHair ? `con i capelli ${R.hair.find(h => h !== 'rossi' && h !== '?')}` : `con una borsa ${R.bag.find(b => b !== 'gialla' && b !== '?')}`;
      add(`Una signora ${what}? No, mi dispiace.`, `A lady ${wrongHair ? 'with ' + M1_HAIR[R.hair.find(h => h !== 'rossi' && h !== '?')] + ' hair' : 'with a ' + M1_BAG[R.bag.find(b => b !== 'gialla' && b !== '?')] + ' bag'}? No, I'm sorry.`);
      fb('Is that what Giorgia said? Her description is in your phone (<b>Compiti</b>).'); return true;
    }
    if (!right){
      if (R.cols.length) { add('Rossi? Gialla? … Con che cosa?', 'Red? Yellow? … With what?'); fb('Say what is that colour: her hair, her bag.'); return true; }
      if (R.hair.includes('?') || R.bag.includes('?')){ add('I capelli… di che colore?', 'Her hair… what colour?'); fb('Add the colour.'); return true; }
      add(R.glasses ? 'Con gli occhiali? Mmm… tante signore hanno gli occhiali.' : 'Mmm… tante signore!', R.glasses ? 'With glasses? Hmm… lots of ladies wear glasses.' : 'Hmm… lots of ladies!');
      fb('That could be anyone. What did Giorgia say about her hair, or her bag?'); return true;
    }
    /* he has seen her: where she went (heard: the past) */
    const night = daytime() === 'night';
    add(`Sì, sì! Una signora ${R.hair.includes('rossi') ? 'con i capelli rossi' : 'con una borsa gialla'}… e tante rose!`, `Yes, yes! A lady ${R.hair.includes('rossi') ? 'with red hair' : 'with a yellow bag'}… and lots of roses!`);
    if (night) add('È andata a prendere un gelato, alla gelateria.', 'She went to get an ice cream, at the gelateria.');
    else add('È andata a prendere un caffè, al Bar Centrale.', 'She went to get a coffee, at Bar Centrale.');
    add('Ciao, piccola!', 'Bye, little one!');
    r.went = night ? 'gelateria' : 'bar'; questStep(M1.id, 'mamma'); save(); out.m1seen = true; return true;
  }
  /* Laura, after the reunion */
  if (R.prego || R.thanks || R.bye || R.greet){
    if (!r.reunited){ add(n.greet.it + '!', n.greet.en + '!'); return true; }
    add(R.bye && !R.prego ? 'Arrivederci! E grazie ancora!' : 'Arrivederci, e grazie ancora! Giorgia, saluta!', R.bye && !R.prego ? 'Goodbye! And thank you again!' : 'Goodbye, and thanks again! Giorgia, say goodbye!');
    r.thanked = true; save(); out.m1thanked = true; out.end = true; return true;
  }
  add('Grazie!', 'Thank you!'); fb('She is thanking you. Answer her, politely.'); return true;
}
function m1After(n, out, words){
  if (!out.m1) return false;
  if (out.m1fb === 'scheda'){ showHint('First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).'); return true; }
  const formal = n.id !== 'bambina' && !convo.tips.formal && words && ['ciao', 'scusa', 'stai'].some(w => words.includes(w));
  const informal = n.id === 'bambina' && !convo.tips.formal && words && ['buongiorno', 'scusi', 'arrivederci', 'sta'].some(w => words.includes(w));
  if (out.m1thanked){
    if (formal){ convo.tips.formal = true; enqueue(() => worldSay('bambina', 'Ciao!', { ms:1400 })); showHint('She didn\'t mind, but Laura is a stranger: <b>arrivederci</b>, not ciao. Done!', 'Fatto!'); }
    else { enqueue(() => worldSay('bambina', fill('Ciao, {Me}!'), { ms:1600 })); showHint('Giorgia and her mum, together again. Done! A stamp in your passport.', 'Fatto!'); }
    convo.keepHint = true; enqueue(() => { if (convo) endConvo(); }); return true;
  }
  if (out.end) return false;
  if (formal){ convo.tips.formal = true; showHint(`${n.id === 'gino' ? 'Gino' : 'Laura'} is a stranger: the polite forms (<b>buongiorno</b>, <b>scusi</b>, <b>Lei</b>).`, 'Consiglio'); return true; }
  if (informal){ convo.tips.formal = true; showHint('She\'s a little girl: <b>tu</b>, <b>ciao</b>, <b>scusa</b>.', 'Consiglio'); return true; }
  if (out.m1described && !out.m1fb){ showHint('Now you know what her mum looks like. She asked you something: will you help?', 'Fatto!'); return true; }
  if (out.m1follow){ convo.st.wrapping = true; showHint('Giorgia is coming with you. Her mum loves flowers… where in town are flowers sold? Say goodbye, then go.', 'Fatto!'); return true; }
  if (out.m1seen){ showHint((out.m1fb ? out.m1fb + ' ' : '') + 'Gino has seen her! Where did she go? Take Giorgia there.', 'Fatto!'); return true; }
  if (out.m1fb){ showHint(hintAfter(stepTries(convo.st, 'm1-' + n.id), out.m1fb, m1Strong(n)), 'Consiglio'); return true; }
  showHint(contextHint(false));
  return true;
}
const m1Strong = n => n.id === 'bambina' ? (m1Rec().described ? 'Say yes: <b>sì</b>, or <b>Vieni con me!</b>' : 'Ask her: <b>Com\'è</b> … ?')
  : n.id === 'gino' ? 'Ask: <b>Ha visto una signora</b> … <b>con</b> … (her hair, her bag)?' : 'Answer her thanks: <b>prego</b>.';
function m1Hint(n, st){
  if (!m1Girl(n) && !m1Gino(n) && !m1Mum(n)) return null;
  if (!schedaDone(M1.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
  const r = m1Rec();
  if (n.id === 'bambina'){
    if (m1Moved()) return { h:'Bar Centrale has shut for the night. Where else might her mum have gone this evening? Something sweet, perhaps…', step:'m1-moved' };
    if (r.follows && questAt(M1.id, 'mamma')) return { h:'Gino told you where her mum went. Take Giorgia there.', step:'m1-go2' };
    if (r.follows) return { h:'Giorgia is with you. Her mum loves flowers: where are flowers sold?', step:'m1-go' };
    if (r.described) return { h:'She asked you to help her look for her mum. Will you?', strong:m1Strong(n), step:'m1-help' };
    return { h:'Ask her what her mum looks like. She\'s a little girl: tu.', strong:m1Strong(n), step:'m1-girl' };
  }
  if (n.id === 'gino') return { h:'Ask Gino if he has seen a lady like Giorgia\'s mum, and describe her: red hair, a yellow bag. He\'s a stranger at work: polite.', strong:m1Strong(n), step:'m1-gino' };
  return { h:'She is thanking you. Answer her, politely, and say goodbye.', strong:m1Strong(n), step:'m1-mum' };
}
/* the hint after night has fallen on the way to the bar (Gino said Bar Centrale, but it has shut) */
function m1Moved(){ const r = questPeek(M1.id); return !!r && questAt(M1.id, 'mamma') && r.went === 'bar' && daytime() === 'night'; }
