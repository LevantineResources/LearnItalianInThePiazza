/* Quest 3 · Il messaggio (any time). Design: docs/lessons/12-la-citta.md, the quests; system: engine/quests.js.
   A chain between friends, like a game of telephone. Paolo, in San Lorenzo, is running late: "Sono in ritardo! Arrivo
   alle otto." Chiara is waiting at the newsstand in the piazza. You pass it on: "Paolo dice che è in ritardo. Arriva alle
   otto." Chiara answers ("Va bene: aspetto al bar.") and you take it back: "Chiara dice che aspetta al bar."
   The grammar point: dice che (he / she says that), and the person shift: what someone said in the io form becomes
   lui / lei when you pass it on (sono → è, arrivo → arriva, aspetto → aspetta). Tile-bank steps (the scheda's tiles).

   A template for the quests to come: data (QUESTS.push), the scheda, the hooks (sceneOf / place to put the giver where
   the quest is, openings by step as getters, talk for the scripted start, bank / phrases / react / hint / afterTurn for
   the conversations, guarded by the NPC and the step), the steps moved on with questStep() and finished with questDone().
   Saved state: S.quests.messaggio (engine/quests.js) plus { got:{ late, arr }, mistakes } on the same record. */

const M3 = { id:'messaggio', SL:{ x:250, y:262, face:{ x:-1, y:0.2 } } };
/* Paolo waits in San Lorenzo during Lesson 12, and once the quest is under way. In free play in a later lesson he stays
   where that lesson has him (the piazza, by default): the quest's place follows him. */
const m3Away = () => S.lesson === 12 || questState(M3.id) === 'active';
const m3Rec = () => { const r = questRec(M3.id); if (!r.got) r.got = { late:false, arr:false }; if (!r.mistakes) r.mistakes = { person:0, who:0, time:0 }; return r; };
/* the relay steps: Chiara hears the message, Paolo hears the answer */
const m3Relay = n => !!n && ((n.id === 'chiara' && questAt(M3.id, 'chiara')) || (n.id === 'marco' && questAt(M3.id, 'back')));
const m3Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
const M3_TILES = [
  m3Tile('paolo', 'Paolo', 'Paolo'), m3Tile('chiara', 'Chiara', 'Chiara'), m3Tile('dice che', 'dice che', 'he / she says that'),
  m3Tile('sono', 'sono', 'I am'), m3Tile('è', 'è', 'he / she is'), m3Tile('in ritardo', 'in ritardo', 'late'),
  m3Tile('arrivo', 'arrivo', 'I arrive'), m3Tile('arriva', 'arriva', 'he / she arrives'),
  m3Tile('aspetto', 'aspetto', 'I wait'), m3Tile('aspetta', 'aspetta', 'he / she waits'), m3Tile('al bar', 'al bar', 'at the bar'),
  m3Tile('alle', 'alle', 'at (a time)'), m3Tile('sette', 'sette', '7'), m3Tile('otto', 'otto', '8'), m3Tile('nove', 'nove', '9'),
];

QUESTS.push({
  id:M3.id, n:3, title_it:'Il messaggio', title_en:'Pass on a message',
  window:'any',
  get place(){ return m3Away() ? { scene:'sanlorenzo', x:200, y:262, label:'San Lorenzo' } : { scene:'piazza', x:560, y:500, label:'Piazza Centrale' }; },
  giver:'marco',
  steps:[
    { id:'chiara', en:'Tell Chiara Paolo\'s message: “Sono in ritardo! Arrivo alle otto.”', who:'chiara', where:'Piazza Centrale, the newsstand' },
    { id:'back', en:'Take Chiara\'s answer back to Paolo: “Va bene! Aspetto al bar.”', who:'marco', where:'San Lorenzo' },
  ],
  stamp:{ icon:'✉', color:'#7a3a6e', label:'San Lorenzo' },
  scheda:{
    phrases:[
      ['Paolo dice che …', 'Paolo says that …', 'Dice che: he / she says that. Then what they said, about them.'],
      ['Sono in ritardo!', "I'm late!", 'Paolo, about himself: io.'],
      ['Arrivo alle otto.', "I'll be there at eight.", 'Arrivo: I arrive. Italians use the present for the near future.'],
      ['Aspetto al bar.', "I'll wait at the bar.", 'Aspettare: to wait.'],
    ],
    how:`<p>When you pass on someone's words you talk <b>about</b> them, so their <b>io</b> becomes <b>lui / lei</b>:</p>
      <table class="dirtable"><thead><tr><th>Paolo says (io)</th><th>you pass it on (lui)</th></tr></thead><tbody>
        <tr><td><i>Sono</i> in ritardo.</td><td>Paolo dice che <b>è</b> in ritardo.</td></tr>
        <tr><td><i>Arrivo</i> alle otto.</td><td>Paolo dice che <b>arriva</b> alle otto.</td></tr>
        <tr><td><i>Aspetto</i> al bar.</td><td>Chiara dice che <b>aspetta</b> al bar.</td></tr></tbody></table>
      <p>The ending tells who: <b>-o</b> is <i>I</i>, <b>-a</b> (or <b>è</b>) is <i>he / she</i>. You may hear <b>ha detto che…</b>: he / she <i>said</i> that (the past, on the train).</p>`,
    culture:`<p>Il <b>quarto d'ora accademico</b>: in Italy fifteen minutes late is hardly late at all among friends. An hour late, though, deserves a message!</p>`,
    vocab:[
      { group:'Passing it on', words:[
        { it:'il messaggio', g:'m', en:'the message' },
        { it:'dice che …', say:'Paolo dice che è in ritardo.', en:'he / she says that …', also:['dice', 'che'] },
        { it:'Ha detto che …', en:'he / she said that … (you will hear it)', also:['detto'], quiz:false },
        { it:'Lo dici a …?', say:'Lo dici a Chiara?', en:'Will you tell …? (to a friend)', also:['lo', 'dici'], quiz:false },
      ] },
      { group:'Io → lui / lei', words:[
        { it:'Sono in ritardo!', en:"I'm late!" },
        { it:'in ritardo', en:'late' },
        { it:'arrivo', en:'I arrive, I get there' },
        { it:'arriva', en:'he / she arrives' },
        { it:'aspetto', en:'I wait' },
        { it:'aspetta', en:'he / she waits' },
        { it:'al bar', en:'at the café', also:['al'] },
      ] },
    ],
    exercises:[
      { type:'mc', q:'Paolo: “Arrivo alle otto.” You tell Chiara: “Paolo dice che ___ alle otto.”', opts:['arrivo', 'arriva', 'arrivi'], a:1, why:'Paolo is he: arriva.', nudge:'You are talking about Paolo, not as him.' },
      { type:'mc', q:'Chiara: “Sono al bar.” You tell Paolo: “Chiara dice che ___ al bar.”', opts:['sono', 'è', 'sei'], a:1, why:'Chiara is she: è.', nudge:'Sono is I am.' },
      { type:'mc', q:'“Dice che” means…', opts:['he / she says that', 'he / she said that', 'he / she asks if'], a:0, why:'Dice che: says that. (Said that: ha detto che.)', nudge:'Present, not past.', noSpeak:true },
      { type:'mc', q:'Mark, in English: “I\'m late!” You tell Bruno…', opts:['Mark dice che sono in ritardo.', 'Mark dice che è in ritardo.', 'Mark dice che sei in ritardo.'], a:1, why:'It is Mark who is late: è.', nudge:'Sono would mean that you are late.' },
    ],
    tiles:M3_TILES,
  },
  hooks:{
    /* Paolo is in San Lorenzo (late for Chiara) until the message has gone round */
    sceneOf(n){ return n.id === 'marco' && m3Away() ? 'sanlorenzo' : null; },
    place(){ const p = NPC.marco; if (S.scene === 'sanlorenzo' && !p.cutWalk){ p.x = M3.SL.x; p.y = M3.SL.y; p.baseFace = { ...M3.SL.face }; } },
    talk(npc){
      if (npc.id === 'marco' && questState(M3.id) === 'open') return m3Start(npc);
      if (m3Relay(npc)){ convo.m3 = true; convo.known = true; }
      return false;
    },
    bank(npc, groups, names){
      if (!m3Relay(npc) || !schedaDone(M3.id)) return null;
      groups.push({ label:'Il messaggio', tiles:M3_TILES.map(t => ({ ...phraseTile(t), name:['paolo', 'chiara'].includes(t.key) })) });
      if (S.vocab3) groups.push({ label:'Polite', tiles:DIR_TILES.filter(t => ['grazie mille', 'puoi ripetere'].includes(t.key)).map(phraseTile) });
      if (names.length) groups.push({ label:'Names', tiles:names });
      return groups;
    },
    phrases(npc){
      if (!m3Relay(npc)) return [];
      return [['m3:says:marco', 'paolo dice che'], ['m3:says:chiara', 'chiara dice che'], ['m3:says:lui', 'lui dice che'], ['m3:says:lei', 'lei dice che'], ['m3:says:?', 'dice che'],
        ['m3:who:marco', 'paolo'], ['m3:who:chiara', 'chiara'], ['m3:be:io', 'sono'], ['m3:be:tu', 'sei'], ['m3:late', 'in ritardo'],
        ['m3:arr:io', 'arrivo'], ['m3:arr:lui', 'arriva'], ['m3:arr:tu', 'arrivi'], ['m3:wait:io', 'aspetto'], ['m3:wait:lui', 'aspetta'], ['m3:wait:tu', 'aspetti'], ['m3:bar', 'al bar'],
        ['t10:at', 'alle'], ...[7, 8, 9].map(k => ['num:' + k, numIt(k)])];
    },
    react(id, n, st, add, out, ints){ return m3React(id, n, st, add, out, ints || [id]); },
    hint(n, st){ return m3Hint(n, st); },
    afterTurn(n, out){ return m3After(n, out); },
  },
  onDone(){ const p = NPC.marco; p.x = p.home.x; p.y = p.home.y; p.baseFace = { ...p.home.face }; },
});
/* the openings by step: Chiara waiting, Paolo waiting for her answer */
{
  const ch = NPC.chiara, pa = NPC.marco, keep = (o, k) => { const d = Object.getOwnPropertyDescriptor(o, k); return () => d.get ? d.get() : d.value; };
  const chOp = keep(ch, 'opening'), chRe = keep(ch, 'revisitOpening'), paOp = keep(pa, 'opening'), paRe = keep(pa, 'revisitOpening');
  const chWait = () => questAt(M3.id, 'chiara') ? { it:'Ciao, {Me}! Aspetto Paolo… ma dov\'è?', en:"Hi, {Me}! I'm waiting for Paolo… but where is he?" } : null;
  const paWait = () => questAt(M3.id, 'back') ? { it:'Allora, {Me}? Cosa dice Chiara?', en:'So, {Me}? What does Chiara say?' } : null;
  Object.defineProperty(ch, 'opening', { configurable:true, enumerable:true, get:() => chWait() || chOp() });
  Object.defineProperty(ch, 'revisitOpening', { configurable:true, enumerable:true, get:() => chWait() || chRe() });
  Object.defineProperty(pa, 'opening', { configurable:true, enumerable:true, get:() => paWait() || paOp() });
  Object.defineProperty(pa, 'revisitOpening', { configurable:true, enumerable:true, get:() => paWait() || paRe() });
}

/* the start: Paolo, in a hurry (scripted lines; then the scheda opens) */
function m3Start(npc){
  convo.known = true;
  $('#dlgWho').innerHTML = `<b>Paolo</b> <span class="where">· San Lorenzo</span>`;
  builder.hidden = true;
  if (S.scene === 'piazza') npcLine(fill('{Me}! Ciao! Devo andare… Chiara mi aspetta all\'edicola, ma non ho tempo!'), fill("{Me}! Hi! I have to go… Chiara's waiting for me at the newsstand, but I haven't got time!"));
  else npcLine(fill('{Me}! Ciao! Vai in piazza? Chiara mi aspetta là, all\'edicola…'), fill("{Me}! Hi! Are you going to the piazza? Chiara's waiting for me there, at the newsstand…"));
  npcLine('Un messaggio per Chiara, per favore: sono in ritardo! Arrivo alle otto.', "A message for Chiara, please: I'm late! I'll be there at eight.", { queue:true });
  npcLine('Grazie! Ciao, ciao!', 'Thanks! Bye!', { queue:true });
  sysLine('Paolo\'s message for Chiara: <b>“Sono in ritardo! Arrivo alle otto.”</b> It\'s in your phone (<b>Compiti</b>). Chiara is at the newsstand in the piazza.');
  enqueue(() => { questStart(M3.id); m3Rec(); save(); });
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  return true;
}

/* what the player said: who says it, and the person of each verb */
function m3Read(ints){
  const R = { says:null, who:null, be:null, late:false, arr:null, at:null, wait:null, bar:false, other:[] };
  ints.forEach((id, k) => {
    let m;
    if ((m = id.match(/^m3:says:(.+)$/))) R.says = m[1];
    else if ((m = id.match(/^m3:who:(.+)$/))) R.who = m[1];
    else if ((m = id.match(/^m3:be:(.+)$/))) R.be = m[1];
    else if (id === 'is:him') R.be = 'lui';
    else if (id === 'm3:late') R.late = true;
    else if ((m = id.match(/^m3:arr:(.+)$/))) R.arr = m[1];
    else if ((m = id.match(/^m3:wait:(.+)$/))) R.wait = m[1];
    else if (id === 'm3:bar') R.bar = true;
    else if ((m = id.match(/^num:(\d+)$/)) && ints[k - 1] === 't10:at') R.at = +m[1];
    else if (id === 't10:at') {}
    else if (!['greet', 'ask_how', 'answer_how', 'ask_back', 'address', 'name_only', 'nice', 'excuse', 'please', 'and', 'thanks', 'bye', 'yes', 'no', 'repeat'].includes(id)) R.other.push(id);
  });
  /* "Paolo è in ritardo": the name before the verb also says who */
  if (!R.says && R.who) R.says = R.who + ':bare';
  return R;
}
function m3React(id, n, st, add, out, ints){
  if (!m3Relay(n) || !schedaDone(M3.id)) return false;
  out.asked = true;                                          // (no goodbye while the message is under way)
  if (!/^(m3:|is:him$|t10:at$|num:)/.test(id)) return false;
  if (out.m3) return true;
  out.m3 = true;
  const r = m3Rec(), R = m3Read(ints), toChiara = n.id === 'chiara', from = toChiara ? 'marco' : 'chiara';
  const fb = h => { out.m3fb = h; };
  const saysOK = R.says && (R.says.startsWith(from) || (toChiara ? R.says === 'lui' : R.says === 'lei'));
  /* about someone else (Chiara is not Paolo) */
  if (R.says && !saysOK && R.says !== '?'){
    const name = R.says.split(':')[0];
    add(name === n.id || name === (toChiara ? 'chiara' : 'marco') ? (toChiara ? 'Io? Io sono qui!' : 'Io? Io sono qui!') : 'Lui chi?', name === n.id ? "Me? I'm right here!" : 'Who do you mean?');
    r.mistakes.who++; save(); fb(toChiara ? 'The message is from Paolo: say whose words they are.' : 'The answer is Chiara\'s: say whose words they are.'); return true;
  }
  if (R.says === '?'){ add(toChiara ? 'Chi? Chi dice che…?' : 'Chi? Chiara?', toChiara ? 'Who? Who says that…?' : 'Who? Chiara?'); r.mistakes.who++; save(); fb('Say who it is from: a name before <i>dice che</i>.'); return true; }
  /* the io form: as if it were the player (or the listener) */
  const wrongPerson = (R.be && R.be !== 'lui') || (R.arr && R.arr !== 'lui') || (R.wait && R.wait !== 'lui');
  if (wrongPerson){
    r.mistakes.person++; save();
    const io = R.be === 'io' || R.arr === 'io' || R.wait === 'io';
    if (toChiara) add(io ? (R.be === 'io' ? 'Tu sei in ritardo? Ma tu sei qui!' : 'Arrivi tu alle otto? Ma sei qui!') : 'Io? No, io sono qui!', io ? "You're late? But you're here!" : "Me? No, I'm here!");
    else add(io ? 'Aspetti tu al bar? E Chiara?' : 'Io aspetto? No, no…', io ? "You're waiting at the bar? And Chiara?" : "I'm waiting? No, no…");
    const fix = [];
    if (R.be === 'io') fix.push('<b>sono</b> is <i>I am</i>: he / she → <b>è</b>');
    if (R.be === 'tu') fix.push('<b>sei</b> is <i>you are</i>: he / she → <b>è</b>');
    if (R.arr === 'io') fix.push('<b>arrivo</b> is <i>I arrive</i>: he / she → <b>arriva</b>');
    if (R.arr === 'tu') fix.push('<b>arrivi</b> is <i>you arrive</i>: he / she → <b>arriva</b>');
    if (R.wait === 'io') fix.push('<b>aspetto</b> is <i>I wait</i>: he / she → <b>aspetta</b>');
    if (R.wait === 'tu') fix.push('<b>aspetti</b> is <i>you wait</i>: he / she → <b>aspetta</b>');
    fb(`You are talking <i>about</i> ${toChiara ? 'Paolo' : 'Chiara'}, not as ${toChiara ? 'him' : 'her'}: ${fix.join('; ')}.`); out.m3person = true; return true;
  }
  if (toChiara){
    if (R.at !== null && R.at !== 8){ add(`Alle ${numIt(R.at)}? Sicuro?`, `At ${R.at}? Are you sure?`); r.mistakes.time++; save(); fb('Is that the time Paolo said? His message is in your phone (<b>Compiti</b>).'); return true; }
    if (R.late && (R.be === 'lui' || !R.be)) r.got.late = true;
    if (R.arr === 'lui' && R.at === 8) r.got.arr = true;
    if (R.arr === 'lui' && R.at === null){ add('Arriva… a che ora?', 'He gets here… at what time?'); save(); fb('And when does he get here? Paolo said a time.'); return true; }
    save();
    if (r.got.late && r.got.arr){
      add('Uffa, Paolo! Sempre in ritardo!', 'Oh, Paolo! Always late!');
      add('Va bene: aspetto al bar. Lo dici a Paolo?', "All right: I'll wait at the bar. Will you tell Paolo?");
      questStep(M3.id, 'back'); out.m3step = 'back'; return true;
    }
    if (r.got.late){ add('In ritardo? Uffa! E a che ora arriva?', 'Late? Oh no! And what time is he getting here?'); fb('Good! Now the second half of his message: when he gets here.'); return true; }
    if (r.got.arr){ add('Alle otto? Ma… è in ritardo?', 'At eight? But… is he late?'); fb('Good! And the first half of his message?'); return true; }
    add('Paolo? Cosa dice?', 'Paolo? What does he say?'); fb('Pass on what Paolo said: that he is late, and when he gets here.'); return true;
  }
  /* back to Paolo: Chiara waits at the bar */
  if (R.wait === 'lui' && R.bar){
    add('Ah, Chiara ha detto che aspetta al bar? Perfetto!', 'Ah, Chiara said she\'s waiting at the bar? Perfect!');
    add(fill('Grazie, {Me}! Sei un vero amico!'), fill("Thanks, {Me}! You're a real friend!"));
    out.m3step = 'done'; return true;
  }
  if (R.wait === 'lui'){ add('Aspetta… dove?', 'She is waiting… where?'); fb('Where is Chiara waiting? Her answer is in your phone (<b>Compiti</b>).'); return true; }
  if (R.bar){ add('Al bar? Chiara è al bar?', 'At the bar? Is Chiara at the bar?'); fb('Close! Say what she is doing there: she waits.'); return true; }
  add('Chiara? Cosa dice?', 'Chiara? What does she say?'); fb('Pass on Chiara\'s answer: where she will wait.'); return true;
}
function m3After(n, out){
  if (!m3Relay(n) && out.m3step !== 'done' && out.m3step !== 'back') return false;
  if (!schedaDone(M3.id) && m3Relay(n)){ showHint('First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>). Then you can pass the message on.'); return true; }
  if (out.m3step === 'back'){ convo.st.wrapping = true; showHint('Message delivered! Now take Chiara\'s answer back to Paolo in <b>San Lorenzo</b>. Say goodbye to her first.', 'Fatto!'); return true; }
  if (out.m3step === 'done'){ enqueue(() => { questDone(M3.id); }); convo.keepHint = true; showHint('Done! The message went round, and there\'s a stamp in your passport.', 'Fatto!'); enqueue(() => { if (convo) endConvo(); }); return true; }
  if (out.m3fb){ const st = convo.st; showHint(out.m3person ? out.m3fb : hintAfter(stepTries(st, 'm3-' + n.id), out.m3fb, m3Strong(n)), 'Consiglio'); return true; }
  if (out.m3){ showHint(contextHint(false)); return true; }
  return false;
}
/* the strong hint (third failed try): the key words, never the whole sentence */
const m3Strong = n => n.id === 'chiara' ? 'Start with <b>Paolo dice che</b> … then <b>è</b> … and <b>arriva</b> …' : 'Start with <b>Chiara dice che</b> … then <b>aspetta</b> …';
function m3Hint(n, st){
  if (!m3Relay(n)) return null;
  if (!schedaDone(M3.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
  if (n.id === 'chiara') return { h:'Pass on Paolo\'s message. You are talking <i>about</i> him now: his <i>I</i> becomes <i>he</i>.', strong:m3Strong(n), step:'m3-chiara' };
  return { h:'Take Chiara\'s answer back to Paolo. You are talking <i>about</i> her: her <i>I</i> becomes <i>she</i>.', strong:m3Strong(n), step:'m3-marco' };
}
