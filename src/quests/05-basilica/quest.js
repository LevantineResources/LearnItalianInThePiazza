/* Quest 5 · In basilica (afternoon). Design: docs/lessons/12-la-citta.md, the quests; system: engine/quests.js; the place:
   world/basilica.js (inside the Basilica di Sant'Antonio, in from Piazza del Santo; dim, quiet, speech softer).
   The volunteer's rules are real Italian to understand and answer: dovere / potere + a verb. As you come in, she stops you (a
   cutscene): "Scusi! Un momento!" → "Shh… Deve fare silenzio, qui." "E deve coprire le spalle." (your shoulders are bare: a
   summer afternoon). Answer her politely, "Mi scusi!" (or "Va bene.") → "Non fa niente. Ecco: Le presto uno scialle." (she
   lends you a shawl: you wear it in here). Then the candles: ask "Posso prendere una candela?" (her, or the sacristan) → "Sì,
   certo! Può prendere una candela: sono là, vicino alla cappella del Santo." → light one at the stand (E: a coin in the
   offerings box; before you have asked, the stand only says to ask). And ask the sacristan, by the sacristy, when mass is:
   "Scusi, a che ora è la messa?" → "La messa è alle sei e mezza." (a listening line) → you note the time (a choice of four)
   → "Grazie, arrivederci." → "Prego. Arrivederci." The candle and the mass in either order; the stamp once both are done.
   The replies follow what you say: a greeting gets a "Shh!", thanks before the shawl ("Prego… ma deve coprire le spalle!"), a
   candle or the mass asked before the shawl ("…ma prima, le spalle!"), "Può prendere…?" for yourself (posso: I can), ciao
   or scusa to a stranger, a time noted wrong ("Hmm… davvero?": said again slowly).
   Italian: Deve fare silenzio, Deve coprire le spalle (deve + a verb: you must), le spalle, Mi scusi!, Posso prendere …? / Può
   prendere … (potere + a verb), la candela, lo scialle, la messa, A che ora è la messa?, il sacrestano. Review: Va bene (Lesson
   12), the time (Lesson 10), prestare (quest 7).
   Saved on the quest's record: stopped (the volunteer has stopped you), covered (the shawl), may (you asked about a candle and
   may take one), candle (lit), heard (the time said), time (noted right), mistakes:{ formal, time, may }. Tests:
   __dbg().basilica (world/basilica.js) + __dbg().messa. */
const M5 = { id:'basilica', TIME:'18:30', OPTS:['16:30', '17:30', '18:00', '18:30'], STOP:{ x:480, y:478 }, ASIDE:{ x:560, y:506, face:{ x:-1, y:-0.3 } }, SHAWL:'#7a5a9a' };
const m5Rec = () => { const r = questRec(M5.id); if (!r.mistakes) r.mistakes = { formal:0, time:0, may:0 }; return r; };
const m5Vol = n => !!n && n.id === 'volontaria' && questState(M5.id) === 'active';
const m5Sac = n => !!n && n.id === 'sacrestano' && questState(M5.id) === 'active';
const m5Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
const M5_TILES = [
  m5Tile('mi scusi', 'Mi scusi!', "I'm sorry! (polite)"), m5Tile('va bene', 'Va bene.', 'OK, all right'),
  m5Tile('posso prendere', 'Posso prendere', 'can I take'), m5Tile('una candela', 'una candela', 'a candle'),
  m5Tile('a che ora è la messa', 'A che ora è la messa?', 'what time is mass?'),
];
QWORDS.add('a che ora è'); QWORDS.add('posso prendere'); CLAUSE.add('mi scusi'); CLAUSE.add('posso prendere'); JOIN.add('mi scusi'); EXCL.add('mi scusi');

QUESTS.push({
  id:M5.id, n:5, title_it:'In basilica', title_en:'Inside the basilica',
  window:'afternoon',
  place:{ scene:'basilica', x:480, y:556, map:[660, 112], label:'Basilica di Sant\'Antonio, Piazza del Santo' },
  giver:'volontaria',
  steps:[
    { id:'porta', en:'The volunteer at the door has stopped you: understand her rules, and answer her politely', who:'volontaria', where:'Basilica del Santo, the door' },
    { id:'dentro', en:'Ask if you may take a candle, and light it (by the saint\'s chapel); ask the sacristan what time mass is', who:'sacrestano', where:'Basilica del Santo' },
  ],
  stamp:{ icon:'✝', color:'#6b5a7a', label:'Basilica del Santo' },
  scheda:{
    phrases:[
      ['Deve fare silenzio.', 'You need to be quiet. (polite)', 'What you hear at the door of a church. Deve + a verb: you must, you need to.'],
      ['Deve coprire le spalle.', 'You need to cover your shoulders.', 'In churches: no bare shoulders.'],
      ['Mi scusi! — Va bene.', "I'm sorry! — All right.", 'The polite apology, to a stranger (to a friend: scusa!). Or simply: OK.'],
      ['Posso prendere una candela?', 'Can I take a candle?', 'Posso + a verb: can I …? May I …?'],
      ['Sì, certo! Può prendere una candela.', 'Yes, of course! You can take a candle.', 'Può + a verb: you (polite) can.'],
      ['Scusi, a che ora è la messa? — Alle sei e mezza.', 'Excuse me, what time is mass? — At half past six.', 'A che ora …? (Lesson 10). Alle sei e mezza = 18:30.'],
    ],
    how:`<p><b>Deve</b> + a verb = you must, you need to (polite, <i>Lei</i>): <i>Deve fare silenzio</i>, <i>Deve coprire le spalle</i>. <b>Può</b> + a verb = you can: <i>Può prendere una candela</i>. For yourself, <b>Posso</b> …? = can I …? <i>Posso prendere una candela?</i> The second verb stays as the dictionary has it: <i>fare, coprire, prendere</i>.</p>
      <p><b>Mi scusi!</b> = I'm sorry (polite, <i>Lei</i>); <b>Scusi!</b> = excuse me, to get attention. To a friend: <i>scusa!</i></p>
      <p><b>A che ora è …?</b> (Lesson 10) asks for a time: <i>A che ora è la messa?</i> The answer: <b>alle</b> + the hour: <i>alle sei e mezza</i>, <i>alle diciotto e trenta</i>.</p>`,
    culture:`<p>Churches in Italy are places of prayer first: speak softly, no hats, and cover your shoulders and knees. At big churches a volunteer at the door will lend you a shawl. A small coin in the box (<i>Offerte</i>, offerings), and you can light a candle for someone.</p>`,
    vocab:[
      { group:'In basilica', words:[
        { it:'Deve fare silenzio.', en:'You need to be quiet. (polite)', note:'Silenzio: silence. Shh!', also:['deve', 'fare', 'silenzio'] },
        { it:'Deve coprire le spalle.', en:'You need to cover your shoulders. (polite)', also:['coprire'] },
        { it:'le spalle', g:'f pl', en:'the shoulders', note:'One: la spalla.', also:['spalle'] },
        { it:'Mi scusi!', en:"I'm sorry! (polite)", also:['mi', 'scusi'] },
        { it:'lo scialle', g:'m', en:'the shawl', note:'Le presto uno scialle: I\'ll lend you a shawl.', also:['scialle'] },
      ] },
      { group:'Le candele, la messa', words:[
        { it:'Posso prendere …?', say:'Posso prendere una candela?', en:'Can I take …? May I take …?', also:['posso', 'prendere'] },
        { it:'Può prendere …', say:'Può prendere una candela.', en:'You (polite) can take …', also:['può'] },
        { it:'la candela', g:'f', en:'the candle', also:['candela', 'candele'] },
        { it:'la messa', g:'f', en:'mass (the church service)', also:['messa'] },
        { it:'A che ora è la messa?', en:'What time is mass?', also:['ora'] },
        { it:'il sacrestano', g:'m', en:'the sacristan', quiz:false, also:['sacrestano'] },
      ] },
    ],
    exercises:[
      { type:'mc', q:'At the door: “Deve fare silenzio.” She means…', opts:['you need to be quiet', 'you need to pay', 'you can take a photo'], a:0, why:'Deve + a verb: you must. Fare silenzio: to be quiet.', nudge:'Silenzio sounds like…', noSpeak:true },
      { type:'mc', q:'“Deve coprire le spalle.” You apologise, politely:', opts:['Mi scusi!', 'Scusa!', 'Prego!'], a:0, why:'To a stranger: Mi scusi! (Scusa is for a friend.)', nudge:'A stranger: the polite form.' },
      { type:'mc', q:'You would like to light a candle. You ask:', opts:['Posso prendere una candela?', 'Può prendere una candela?', 'Deve prendere una candela?'], a:0, why:'Posso = can I. Può = you (polite) can; deve = you must.', nudge:'Can I…? is about you: io.' },
      { type:'mc', q:'“La messa è alle sei e mezza.” Mass is at…', opts:['16:30', '18:30', '19:30'], a:1, why:'Sei e mezza in the afternoon or evening: 18:30.', nudge:'Sei = six; e mezza = and a half.', noSpeak:true },
    ],
    tiles:M5_TILES,
  },
  hooks:{
    talk(npc){
      if (npc.id === 'volontaria' && questState(M5.id) === 'open') return m5Start(npc);
      if (m5Vol(npc) || m5Sac(npc)){ convo.m5 = true; convo.known = true; S.known[npc.id] = true; $('#dlgWho').innerHTML = `<b>${esc(npc.name)}</b> <span class="where">· Basilica del Santo</span>`; }
      return false;
    },
    bank(npc, groups){
      if (!m5Vol(npc) && !m5Sac(npc)) return null;
      if (schedaDone(M5.id)) groups.push({ label:'In basilica', tiles:M5_TILES.map(phraseTile) });
      groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
      return groups;
    },
    phrases(npc){
      if (!m5Vol(npc) && !m5Sac(npc)) return [];
      return [['m5:sorry', 'mi scusi'], ['m5:sorry:tu', 'scusa'], ['m5:sorry:tu', 'scusami'], ['m5:mass', 'a che ora è la messa'], ['m5:mass', 'la messa'],
        ['m5:may', 'posso prendere una candela'], ['m5:may', 'posso prendere la candela'], ['m5:take', 'posso prendere'],
        ['m5:may:lei', 'può prendere una candela'], ['m5:may:lei', 'può prendere'], ['m5:candle', 'una candela'], ['m5:candle', 'la candela'],
        ['ok10', 'va bene'], ['greet', 'buonasera']];
    },
    react(id, n, st, add, out, ints){ return m5React(id, n, st, add, out, ints || [id]); },
    hint(n, st){ return m5Hint(n, st); },
    afterTurn(n, out, res, words){ return m5After(n, out, words); },
    onClose(closedId){
      const r = questPeek(M5.id);
      if (closedId === 'sacrestano' && r && r.time && r.candle && !r.done){ questDone(M5.id); return true; }
      return false;
    },
    door(d){ if (d.id !== 'candele' || S.scene !== 'basilica') return false; return m5Candle(); },
    cutsceneResume({ id }){ if (id === 'm5-stop'){ m5Rec().stopped = true; save(); return true; } if (id === 'm5-candela'){ m5Lit(); return true; } return false; },
  },
});
/* the openings by step: the volunteer (who has stopped you, then lets you through) and the sacristan (softly) */
{
  const v = NPC.volontaria, s = NPC.sacrestano;
  const vol = () => { const r = questPeek(M5.id);
    if (r && r.covered) return r.may ? { it:'Prego. Silenzio, eh!', en:'Please. Quietly, mind!' } : { it:'Prego, entri. Silenzio, eh!', en:'Please, go in. Quietly, mind!' };
    if (r && r.started) return { it:'Scusi… deve coprire le spalle!', en:'Excuse me… you need to cover your shoulders!' };
    return { it:'Buongiorno.', en:'Good afternoon.' }; };
  ['opening', 'revisitOpening'].forEach(k => Object.defineProperty(v, k, { configurable:true, enumerable:true, get:vol }));
  const sac = () => { const r = questPeek(M5.id); return r && r.time ? { it:'Sì? Mi dica.', en:'Yes? How can I help?' } : { it:'Buongiorno. Mi dica.', en:'Good afternoon. How can I help?' }; };
  ['opening', 'revisitOpening'].forEach(k => Object.defineProperty(s, k, { configurable:true, enumerable:true, get:sac }));
}
/* who stands where: the volunteer in the gap of the inner porch until you are covered, then beside her table; the shawl */
function m5Place(){
  const r = questPeek(M5.id) || {}, v = NPC.volontaria, qs = questState(M5.id);
  /* (only while the task is open or under way does she stand in the way: never a trap in a later lesson) */
  const block = (qs === 'open' || qs === 'active') && !r.covered;
  if (!v.cutWalk){ const s = block ? { ...M5.STOP, face:{ x:0, y:1 } } : M5.ASIDE; v.x = s.x; v.y = s.y; v.baseFace = { ...s.face }; }
  const wear = S.scene === 'basilica' && !!r.covered;
  if (wear) player.shawl = M5.SHAWL; else delete player.shawl;
  if (typeof BASILICA !== 'undefined') BASILICA.lit = r.candle ? 1 : 0;
  /* you come in and the task is open: she stops you (once per visit) */
  if (S.scene === 'basilica' && !traveling && questState(M5.id) === 'open' && !M5.stopping && !dialogOpen && !modalOpen && !cutsceneOn()){ M5.stopping = true; setTimeout(m5Stop, 500); }
  if (S.scene !== 'basilica') M5.stopping = false;
}
setInterval(m5Place, 300);
function m5Stop(){
  if (S.scene !== 'basilica' || questState(M5.id) !== 'open') return;
  cutscene([
    { say:'Scusi! Un momento!', who:'volontaria', ms:1500 },
    { walk:'player', to:{ x:480, y:520 }, speed:110, face:{ x:0, y:-1 } },
  ], { id:'m5-stop', guide:'' }).then(res => {
    if (res.replaced) return;
    setTimeout(() => { if (!dialogOpen && S.scene === 'basilica') openConvo(NPC.volontaria); }, 250);
  });
}
function m5Start(npc){
  convo.known = true;
  $('#dlgWho').innerHTML = `<b>Volontaria</b> <span class="where">· Basilica del Santo, the door</span>`;
  builder.hidden = true;
  npcLine('Shh… Deve fare silenzio, qui.', 'Shh… You need to be quiet in here.');
  npcLine('E deve coprire le spalle.', 'And you need to cover your shoulders.', { queue:true });
  sysLine('A volunteer at the door, speaking softly, with two rules for you. She points at your bare shoulders… What do you say to her? The task\'s <b>scheda</b> has the words.');
  questStart(M5.id); m5Rec().stopped = true; save();
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  return true;
}
function m5Read(ints){
  const R = { sorry:false, tu:false, mass:false, may:false, mayLei:false, take:false, candle:false, greet:false, thanks:false, bye:false, repeat:false, excuse:false, yes:false, ok:false, no:false, other:[] };
  ints.forEach(id => {
    if (id === 'm5:sorry') R.sorry = true;
    else if (id === 'm5:sorry:tu'){ R.sorry = true; R.tu = true; }
    else if (id === 'm5:mass') R.mass = true;
    else if (id === 'm5:may') R.may = true;
    else if (id === 'm5:may:lei') R.mayLei = true;
    else if (id === 'm5:take') R.take = true;
    else if (id === 'm5:candle') R.candle = true;
    else if (id === 'ok10'){ R.ok = true; R.yes = true; }
    else if (id === 'greet') R.greet = true;
    else if (id === 'thanks') R.thanks = true;
    else if (id === 'bye') R.bye = true;
    else if (id === 'repeat') R.repeat = true;
    else if (id === 'excuse') R.excuse = true;
    else if (id === 'yes') R.yes = true;
    else if (id === 'no' || id === 'nothing') R.no = true;
    else if (!['please', 'and', 'address', 'sir', 'madam'].includes(id)) R.other.push(id);
  });
  return R;
}
function m5React(id, n, st, add, out, ints){
  if (!m5Vol(n) && !m5Sac(n)) return false;
  if (out.m5) return true;
  out.m5 = true; out.asked = true;
  if (!schedaDone(M5.id)){ add(n.id === 'volontaria' ? 'Le spalle, per favore…' : 'Prego?', n.id === 'volontaria' ? 'Your shoulders, please…' : 'Pardon?'); out.m5fb = 'scheda'; return true; }
  const R = m5Read(ints), r = m5Rec(), fb = h => { if (!out.m5fb) out.m5fb = h; };
  const word = questUsedWords();
  if (word.includes('ciao') || R.tu){ r.mistakes.formal++; out.m5formal = R.tu ? 'tu' : 'ciao'; }
  if (n.id === 'volontaria') return m5VolReact(R, r, st, add, out, fb);
  return m5SacReact(R, r, st, add, out, fb);
}
/* a candle: "posso prendere una candela?" (or just "una candela?") asks; "può prendere…" is "you can": feedback, and she answers anyway */
const m5Asks = R => R.may || R.mayLei || R.candle;
function m5VolReact(R, r, st, add, out, fb){
  if (!r.covered){
    if (R.sorry || R.ok || (R.excuse && !R.mass && !m5Asks(R)) || (R.yes && !R.no)){
      add(R.sorry || R.excuse ? 'Non fa niente. Ecco: Le presto uno scialle.' : 'Grazie. Ecco: Le presto uno scialle.', R.sorry || R.excuse ? "Never mind. Here: I'll lend you a shawl." : "Thank you. Here: I'll lend you a shawl.");
      r.covered = true; questStep(M5.id, 'dentro'); out.m5covered = true;
      if (m5Asks(R)) m5MayLine(R, r, add, out, fb);
      else add('Prego, entri. E… silenzio, eh!', 'Please, go in. And… quietly, mind!');
      save(); return true;
    }
    if (m5Asks(R)){ add('Una candela? Sì, può prendere una candela… ma prima deve coprire le spalle!', 'A candle? Yes, you can take a candle… but first you need to cover your shoulders!'); r.may = true; save(); fb('She is still pointing at your bare shoulders. Answer her first, politely.'); return true; }
    if (R.mass){ add('La messa? Chieda al sacrestano, dentro. Ma prima deve coprire le spalle!', 'Mass? Ask the sacristan, inside. But first you need to cover your shoulders!'); fb('First things first: she is still pointing at your shoulders. Answer her, politely.'); return true; }
    if (R.thanks){ add('Prego… ma deve coprire le spalle!', "You're welcome… but you need to cover your shoulders!"); fb('She hasn\'t helped yet: your shoulders are still bare. Apologise first.'); return true; }
    if (R.no){ add('No? Mi dispiace, ma qui deve coprire le spalle.', "No? I'm sorry, but in here you need to cover your shoulders."); fb('Those are the rules in here. Say sorry, or say all right.'); return true; }
    if (R.greet || out.m5formal === 'ciao'){ add('Shh! Deve fare silenzio, qui… E deve coprire le spalle.', 'Shh! You need to be quiet in here… And you need to cover your shoulders.'); fb('She is telling you off, kindly: too loud, and bare shoulders. Apologise, politely.'); return true; }
    if (R.bye){ add('Arrivederci.', 'Goodbye.'); out.end = true; return true; }
    add('Le spalle, per favore. Deve coprire le spalle.', 'Your shoulders, please. You need to cover your shoulders.'); fb('She is pointing at your bare shoulders. Apologise, politely.');
    return true;
  }
  if (m5Asks(R) || R.take){ m5MayLine(R, r, add, out, fb); save(); return true; }
  if (R.mass){ add('La messa? Chieda al sacrestano: è là, vicino alla sacrestia.', 'Mass? Ask the sacristan: he is over there, by the sacristy.'); fb('The sacristan is on the right, by the sacristy door.'); return true; }
  if (R.thanks){ add('Prego.', "You're welcome."); if (r.may) out.end = true; return true; }
  if (R.bye){ add('Arrivederci.', 'Goodbye.'); out.end = true; return true; }
  if (R.sorry || R.ok){ add('Prego, prego. Silenzio, eh!', 'Not at all. Quietly, mind!'); if (!r.may) fb('You are covered now. The candles, by the chapel: ask her if you may take one.'); return true; }
  add('Shh… Deve fare silenzio, eh!', 'Shh… You need to be quiet, mind!'); if (!r.may) fb('You are covered now. The candles, by the chapel: ask her if you may take one.'); return true;
}
/* the candle, asked: yes, you can (either of them says it) */
function m5MayLine(R, r, add, out, fb){
  if (R.take && !R.may && !R.candle){ add('Prendere… che cosa?', 'Take… what?'); fb('Say what you would like to take.'); return; }
  if (R.mayLei && !R.may){ r.mistakes.may++; add('Io? No, no… Lei! Sì: può prendere una candela.', 'Me? No, no… you! Yes: you can take a candle.'); fb('<b>Può</b> is “you (polite) can”. Asking for yourself: <b>posso</b>.'); }
  else add('Sì, certo! Può prendere una candela: sono là, vicino alla cappella del Santo.', "Yes, of course! You can take a candle: they're over there, by the saint's chapel.");
  r.may = true; out.m5may = true;
}
function m5SacReact(R, r, st, add, out, fb){
  const said = () => { add('La messa è alle sei e mezza.', 'Mass is at half past six.', { listen:true }); r.heard = true; save(); out.m5heard = true; };
  if (R.repeat && r.heard && !r.time){ add('Alle sei e mezza.', 'At half past six.', { listen:true, rate:0.7 }); out.m5heard = true; return true; }
  if (R.mass){ if (R.greet) add('Buongiorno.', 'Good afternoon.'); if (m5Asks(R)) m5MayLine(R, r, add, out, fb); said(); return true; }
  if (m5Asks(R) || R.take){ m5MayLine(R, r, add, out, fb); save(); if (!r.time && !out.m5fb) fb('He answered your question. Now ask him what you came to ask about mass.'); return true; }
  if (R.bye){ add('Prego. Arrivederci.', "You're welcome. Goodbye."); out.end = true; return true; }
  if (R.thanks){ add('Prego.', "You're welcome."); if (r.time) fb('Say goodbye: he is a stranger, at work.'); return true; }
  if (R.greet || R.excuse || R.sorry){ add(R.greet ? 'Buongiorno. Mi dica.' : 'Sì? Mi dica.', R.greet ? 'Good afternoon. How can I help?' : 'Yes? How can I help?'); if (!r.time) fb('Ask him what time mass is.'); return true; }
  add('Mi dica.', 'How can I help?'); if (!r.time) fb('Ask him what time mass is.');
  return true;
}
function m5After(n, out, words){
  if (!out.m5) return false;
  const r = m5Rec();
  if (out.m5fb === 'scheda'){ showHint('First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).'); return true; }
  const formal = out.m5formal ? (out.m5formal === 'tu' ? 'A stranger at work gets the polite apology: <b>mi scusi</b>, not scusa. ' : 'Ciao is for friends: to a stranger, <b>buongiorno</b> and <b>arrivederci</b>. ') : '';
  if (out.m5covered){
    enqueue(() => { m5Place(); renderHUD(); });
    sysLine('You put the shawl round your shoulders. She steps aside.');
    showHint(formal + (out.m5fb && out.m5fb !== 'scheda' ? out.m5fb + ' ' : '') + (r.may ? 'Now light your candle (the stand by the saint\'s chapel, on the left), and find the sacristan (on the right).'
      : 'Covered! By the saint\'s chapel, on the left, people are lighting candles: ask her if you may take one.'), 'Fatto!');
    return true;
  }
  if (out.m5heard){ m5AskTime(n); return true; }
  if (out.m5may && !out.m5fb){ showHint(formal + 'Now light your candle: the stand by the saint\'s chapel, on the left.' + (r.time ? '' : ' And the sacristan (on the right) knows when mass is.'), 'Fatto!'); return true; }
  if (out.end) return false;
  if (formal && !convo.tips.formal){ convo.tips.formal = true; showHint(formal + (out.m5fb || ''), 'Consiglio'); return true; }
  if (out.m5fb){ showHint(hintAfter(stepTries(convo.st, m5Step(n)), out.m5fb, m5Strong(n)), 'Consiglio'); return true; }
  showHint(contextHint(false));
  return true;
}
/* the time you heard: a choice of four (your notepad); a wrong one: he says it again, slowly (the second time, his answer shows) */
function m5AskTime(n){
  enqueue(() => { if (convo) builder.hidden = true; });
  sysLine('Your notepad: <b>la messa</b> · what time did he say?');
  showHint('Listen to his answer (press <b>🔊 Ascolta di nuovo</b> to hear it again), then pick the time he said.');
  m5Choices(m5Rec());
}
function m5Choices(r){
  showChoices(M5.OPTS.map(t => ({ label:t, fn:() => {
    choices.hidden = true;
    if (t === M5.TIME){
      revealListen({ all:true });
      r.time = true; save();
      sysLine(`Your notepad: <b>la messa · ${M5.TIME}</b>`);
      enqueue(() => { if (convo){ builder.hidden = false; renderBank(); renderSentence(); } });
      showHint(r.candle ? 'Noted! Thank him and say goodbye.' : 'Noted! Thank him and say goodbye; then light a candle (the stand by the saint\'s chapel).', 'Fatto!');
      return;
    }
    r.mistakes.time++; save();
    sysLine(`<b>${t}</b>? Hmm… really?`);
    npcLine('Alle sei e mezza.', 'At half past six.', { listen:true, rate:0.7 });
    if (r.mistakes.time >= 2) revealListen({ all:true });
    showHint(r.mistakes.time >= 2 ? 'Read his answer above: <b>sei</b> is six (in the evening, 18), <b>e mezza</b> is half past.' : 'He said it again, slowly. Listen for the hour, and for what comes after it.');
    m5Choices(r);
  } })));
}
const m5Step = n => { const r = m5Rec(); return n.id === 'volontaria' ? (r.covered ? 'm5-may' : 'm5-sorry') : r.time ? 'm5-bye' : 'm5-mass'; };
const m5Strong = n => { const r = m5Rec(); return n.id === 'volontaria' ? (r.covered ? 'Ask for yourself: <b>posso</b> … <b>una candela</b>.' : 'Apologise, politely: <b>mi scusi</b>.') : r.time ? 'The polite goodbye: <b>arrivederci</b>.' : 'Ask: <b>a che ora</b> … <b>la messa</b>.'; };
function m5Hint(n, st){
  if (!m5Vol(n) && !m5Sac(n)) return null;
  if (!schedaDone(M5.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
  const r = m5Rec();
  if (n.id === 'volontaria'){
    if (!r.covered) return { h:'She stopped you at the door with two rules: quiet, and your bare shoulders. Answer her politely.', strong:m5Strong(n), step:'m5-sorry' };
    if (!r.may) return { h:'You are covered. By the saint\'s chapel people are lighting candles: ask her if you may take one.', strong:m5Strong(n), step:'m5-may' };
    return { h:r.time && r.candle ? 'All done here.' : 'Inside now: your candle (the stand by the chapel, on the left) and the sacristan (on the right).', step:'m5-in' };
  }
  if (!r.time) return { h:'Ask the sacristan what time mass is.', strong:m5Strong(n), step:'m5-mass' };
  return { h:'Thank him and say goodbye.', strong:m5Strong(n), step:'m5-bye' };
}
/* the candle: walk to the stand, a coin in the offerings box, light one */
function m5Lit(){ const r = m5Rec(); r.candle = true; save(); BASILICA.lit = 1; renderHUD(); }
function m5Candle(){
  const r = questPeek(M5.id);
  if (questState(M5.id) !== 'active' || !r || !r.covered){ toast('<b>Le candele.</b> Rows of little candles, lit for someone. A box beside them says <i>Offerte</i> (offerings).'); return true; }
  if (!r.may){ toast('<b>Le candele.</b> Rows of little candles, and a box that says <i>Offerte</i> (offerings). Can you take one? Ask first: the volunteer by the door, or the sacristan.'); return true; }
  if (r.candle){ toast('Your candle is burning, with the others.'); return true; }
  const Cd = BASILICA.candles;
  cutscene([
    { guide:'You drop a coin in the box (<i>un\'offerta</i>)… and light a candle.' },
    { walk:'player', to:{ x:Cd.x + Cd.w / 2, y:Cd.y + Cd.h + 20 }, speed:110, find:true, face:{ x:0, y:-1 } },
    { wait:RM ? 200 : 900 },
    { run:m5Lit },
    { wait:RM ? 200 : 1400 },
  ], { id:'m5-candela', guide:'', onSkip:m5Lit }).then(res => {
    if (res.replaced) return;
    m5Lit();
    const q = questPeek(M5.id);
    if (q.time && !q.done){ questDone(M5.id); return; }
    toast('Your candle is lit. Now the sacristan: what time is mass?');
  });
  return true;
}
function messaDbg(){ const r = questPeek(M5.id) || {}; return { stopped:!!r.stopped, covered:!!r.covered, may:!!r.may, candle:!!r.candle, heard:!!r.heard, time:!!r.time, wrong:(r.mistakes || {}).time || 0 }; }
