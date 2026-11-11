/* Quest 11 · Il tramonto sul ponte (night). Design: docs/lessons/12-la-citta.md, the quests; system: engine/quests.js.
   The same bridge as quest 8 (Ponte Molino, world/ponte.js), in the evening: the sky orange, the river reflecting it (the
   bridge's sky is 'sunset' while this task can be played: ponteSky()). Two students lean on the parapet watching it, Sara
   and Tommaso (tu: they are young and use it first; Tommaso is ambient, E on him talks to Sara). If you did quest 8 this
   afternoon, they saw you: "Ehi! Ancora tu! Il fotografo!" (known words, not taught). "Look at the sunset, isn't it lovely?":
   Sara says it, "Guarda il tramonto! Non è bello?", and you answer it (Sì! Che bel tramonto! / È bellissimo!), or say it
   yourself ("Guarda il tramonto! Non è bello?" → "Sì, bellissimo!") → "Aspetta… guarda! Si accendono le luci!": the sky turns
   to night and the lamps come on one by one (the bridge's fade) → say something about the lights (Guarda le luci! / Le luci
   sono bellissime!) → Sara shivers: say what the evening is like, "Fa un po' freddo." / "C'è un po' di vento." → "Andiamo a
   prendere qualcosa di caldo. Ciao, e buona serata!" and the stamp. Replies follow what you say: the cold said at sunset
   (they agree, and it counts), the sunset after dark is over ("È finito!"), the lights before they are on, "Non ancora…",
   "le luci è bellissimo" (the plural: sono bellissime).
   Italian: il tramonto, Guarda!, Non è bello?, Che bel tramonto!, Che bello!, le luci, bellissimo / bellissime, Fa un po'
   freddo, C'è un po' di vento. Heard (known): Ancora tu!, stasera, Buona serata!
   Saved on the quest's record: remembered (they knew you from this afternoon), lit (the lights are on: night on the bridge),
   sunset, lights, cool (what you have said about each). Tests: __dbg().tramonto. */
const M11 = { id:'tramonto' };
const m11Rec = () => questRec(M11.id);
const m11Sara = n => !!n && n.id === 'sara';
const m11Busy = n => m11Sara(n) && questState(M11.id) === 'active';
const m11Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
const M11_TILES = [
  m11Tile('guarda', 'Guarda!', 'look! (to a friend)'), m11Tile('il tramonto', 'il tramonto', 'the sunset'), m11Tile('le luci', 'le luci', 'the lights'),
  m11Tile('non è bello', 'Non è bello?', "isn't it lovely?"), m11Tile('che bel tramonto', 'Che bel tramonto!', 'what a lovely sunset!'), m11Tile('che bello', 'Che bello!', 'how lovely!'),
  m11Tile('è bellissimo', 'è bellissimo', 'is really beautiful (one, masculine)'), m11Tile('sono bellissime', 'sono bellissime', 'are really beautiful (feminine plural)'),
  m11Tile("fa un po' freddo", "Fa un po' freddo.", "it's a little cold"), m11Tile("c'è un po' di vento", "C'è un po' di vento.", "it's a little windy"),
];
EXCL.add('che bello'); EXCL.add('che bel'); EXCL.add('guarda'); CLAUSE.add('guarda'); CLAUSE.add('che bello'); CLAUSE.add('che bel'); NOTQ.add('vento');
/* "Non è bello?" is one tile and one parser word (no-break spaces): Lesson 9's NOTQ 'non è' (Non è lontano.) would make it a statement */
const M11_ISNT = 'non\u00a0è\u00a0bello';
QWORDS.add(M11_ISNT); CLAUSE.add(M11_ISNT);
const m11BankTile = t => t.key === 'non è bello' ? { key:t.key, label:t.label, gloss:t.en, tokens:[{ w:M11_ISNT, label:'non è bello' }] } : phraseTile(t);

QUESTS.push({
  id:M11.id, n:11, title_it:'Il tramonto sul ponte', title_en:'Sunset on the bridge',
  window:'night',
  place:{ scene:'ponte', x:600, y:480, map:[652, 236], label:'Ponte Molino' },
  giver:'sara',
  steps:[
    { id:'tramonto', en:'Watch the sunset with Sara and Tommaso: say what you think of it', who:'sara', where:'Ponte Molino, at sunset' },
    { id:'luci', en:'The lights are on: talk about them, and about the evening air', who:'sara', where:'Ponte Molino, in the evening' },
  ],
  stamp:{ icon:'☾', color:'#7a3a6e', label:'Ponte Molino' },
  scheda:{
    phrases:[
      ['Guarda il tramonto! Non è bello?', "Look at the sunset! Isn't it lovely?", 'Guarda: look! (to a friend). Non è …? asks “isn\'t it …?”.'],
      ['Sì! Che bel tramonto!', 'Yes! What a lovely sunset!', 'Bello → bel before a masculine noun: che bel tramonto. Or just: che bello!'],
      ['Il tramonto è bellissimo.', 'The sunset is really beautiful.', 'Il tramonto: masculine, one: bellissimo.'],
      ['Guarda le luci! Sono bellissime!', 'Look at the lights! They\'re really beautiful!', 'Le luci: feminine, plural: sono bellissime.'],
      ["Fa un po' freddo. · C'è un po' di vento.", "It's a little cold. · It's a little windy.", "Un po' = a little. Fa freddo (it's cold); c'è vento (there's wind)."],
    ],
    how:`<p><b>Guarda il tramonto! Non è bello?</b> Guarda (look!) is for a friend; to a stranger, <i>guardi!</i> <b>Non è …?</b> = isn't it …? The answer: <i>Sì! Che bel tramonto!</i> (<b>bello</b> becomes <b>bel</b> before a masculine noun: <i>un bel tramonto</i>).</p>
      <p><b>Bellissimo</b> agrees like any adjective: <i>il tramonto è bellissim<b>o</b></i>, <i>le luci sono bellissim<b>e</b></i> (plural: <b>sono</b>).</p>
      <p><b>Un po'</b> = a little: <i>fa un po' freddo</i> (it's a little cold), <i>c'è un po' di vento</i> (there's a little wind: it's a little windy).</p>`,
    culture:`<p>At sunset Italians come out for the <i>passeggiata</i>: a slow walk, often over a bridge or along the river, to see and be seen. Young people say <b>tu</b> to each other at once.</p>`,
    vocab:[
      { group:'Il tramonto', words:[
        { it:'il tramonto', g:'m', en:'the sunset', also:['tramonto'] },
        { it:'Guarda!', en:'Look! (to a friend)', also:['guarda'] },
        { it:'Non è bello?', en:"Isn't it lovely?", also:['non', 'bello'] },
        { it:'Che bel tramonto!', en:'What a lovely sunset!', note:'Bello → bel before a masculine noun.', also:['che', 'bel'] },
        { it:'Che bello!', en:'How lovely!' },
      ] },
      { group:'La sera', words:[
        { it:'le luci', g:'f pl', en:'the lights', note:'One light: la luce.', also:['luci'] },
        { it:'bellissimo / bellissime', en:'really beautiful', note:'Bellissimo (il tramonto), bellissime (le luci).', also:['bellissimo', 'bellissime', 'bellissima'] },
        { it:"Fa un po' freddo.", en:"It's a little cold.", also:['fa', "po'", 'un', 'freddo'] },
        { it:"C'è un po' di vento.", en:"It's a little windy.", note:'Il vento: the wind.', also:["c'è", 'vento'] },
      ] },
    ],
    exercises:[
      { type:'mc', q:'Sara: “Guarda il tramonto! Non è bello?” You agree:', opts:['Sì! Che bel tramonto!', 'Sì! Fa caldo!', 'No, grazie.'], a:0, why:'Non è bello? isn\'t it lovely? Yes: che bel tramonto!', nudge:'Look at the sky.' },
      { type:'mc', q:'Le luci sul fiume ___!', opts:['è bellissimo', 'sono bellissime', 'sono bellissimi'], a:1, why:'Le luci: feminine plural, so sono bellissime.', nudge:'Luci: plural, feminine.' },
      { type:'mc', q:'The sun has gone down and you shiver a little. You say:', opts:['Fa caldo.', "Fa un po' freddo.", "C'è il sole."], a:1, why:"Un po' freddo: a little cold.", nudge:'A little cold.' },
      { type:'mc', q:"“C'è un po' di vento.” It's…", opts:['a little windy', 'a little sunny', 'a little late'], a:0, why:'Il vento: the wind.', nudge:'Vento: wind.', noSpeak:true },
    ],
    tiles:M11_TILES,
  },
  hooks:{
    visitorTalk(npc){ return npc.id === 'tommaso' && ['open', 'active'].includes(questState(M11.id)); },
    redirect(npc){ return npc.id === 'tommaso' && ['open', 'active'].includes(questState(M11.id)) ? NPC.sara : null; },
    talk(npc){
      if (!m11Sara(npc)) return false;
      if (questState(M11.id) === 'open') return m11Start(npc);
      if (m11Busy(npc)){ convo.m11 = true; convo.known = !!S.known.sara; }
      return false;
    },
    bank(npc, groups, names){
      if (!m11Busy(npc)) return null;
      if (schedaDone(M11.id)) groups.push({ label:'Il tramonto, la sera', tiles:M11_TILES.map(m11BankTile) });
      groups.push({ label:'Polite', tiles:L10_POLITE.filter(t => !['scusi', 'arrivederci'].includes(t.key)).map(phraseTile) });
      if (names.length) groups.push({ label:'Names', tiles:names });
      return groups;
    },
    phrases(npc){
      if (!m11Busy(npc)) return [];
      return [['m11:lovely', 'che bello'], ['m11:lovely', 'che bel tramonto'], ['m11:isnt', 'non è bello'], ['m11:isnt', M11_ISNT], ['m11:look', 'guarda'], ['m11:sunset', 'il tramonto'], ['m11:lights', 'le luci'],
        ['m11:isb', 'è bellissimo'], ['m11:areb', 'sono bellissime'], ['m11:cold', "fa un po' freddo"], ['m11:cold', 'fa freddo'], ['m11:wind', "c'è un po' di vento"], ['m11:wind', "c'è vento"],
        ['m11:hot', 'fa caldo'], ['m11:bye', 'buona serata'], ['m11:bye', 'buonasera']];
    },
    react(id, n, st, add, out, ints){ return m11React(id, n, st, add, out, ints || [id]); },
    hint(n, st){ return m11Hint(n, st); },
    afterTurn(n, out, res, words){ return m11After(n, out, words); },
    cutsceneResume({ id }){ if (id !== 'm11-luci') return false; const r = m11Rec(); r.lit = true; if (questAt(M11.id, 'tramonto')) questStep(M11.id, 'luci'); save(); return true; },
  },
});
/* Sara's openings by step */
{
  const s = NPC.sara, keep = k => { const d = Object.getOwnPropertyDescriptor(s, k); return () => d.get ? d.get() : d.value; };
  const op = keep('opening'), re = keep('revisitOpening');
  const step = () => {
    const r = questPeek(M11.id); if (!r || !r.started) return null;
    if (r.done) return r.remembered ? { it:'Ciao, fotografo!', en:'Hi, photographer!' } : { it:'Ciao! Buona serata!', en:'Hi! Have a nice evening!' };
    if (!r.lit) return { it:'Guarda il tramonto! Non è bello?', en:"Look at the sunset! Isn't it lovely?" };
    return r.lights ? { it:'Brr…', en:'Brr…' } : { it:'Adesso è sera… Guarda!', en:"Now it's evening… Look!" };
  };
  Object.defineProperty(s, 'opening', { configurable:true, enumerable:true, get:() => step() || op() });
  Object.defineProperty(s, 'revisitOpening', { configurable:true, enumerable:true, get:() => step() || re() });
}
/* the start: they turn round; if you took Anna and Giulio's photo this afternoon, they saw you */
function m11Start(npc){
  const r = m11Rec(), foto = questPeek('foto');
  convo.known = !!S.known.sara;
  builder.hidden = true;
  if (foto && foto.done){
    r.remembered = true;
    npcLine('Ehi! Ancora tu! Il fotografo!', 'Hey! You again! The photographer!');
    npcLine('Ti abbiamo visto oggi pomeriggio, qui sul ponte, con il telefono di due turisti!', 'We saw you here on the bridge this afternoon, with two tourists\' phone!', { queue:true });
    npcLine('Guarda il tramonto! Non è bello?', "Look at the sunset! Isn't it lovely?", { queue:true });
  } else npcLine('Ciao! Guarda il tramonto! Non è bello?', "Hi! Look at the sunset! Isn't it lovely?");
  sysLine('Two students watching the sunset, happy to chat with anyone… What do you say to a view like this? And later, about the evening air? The task\'s <b>scheda</b> has the words.');
  if (daytime() !== 'night') PONTE.evening = true;                // (free play: the sunset comes for the task)
  questStart(M11.id); save();
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  return true;
}
function m11React(id, n, st, add, out, ints){
  if (!m11Busy(n)) return false;
  if (id === 'greet'){ if (!st.m11greet){ st.m11greet = true; add('Ciao!', 'Hi!'); } return true; }
  if (!/^m11:/.test(id) && !['bye', 'thanks', 'yes', 'no'].includes(id)) return false;
  if (out.m11) return true;
  out.m11 = true; out.asked = true;
  if (!schedaDone(M11.id)){ add('Eh?', 'Huh?'); out.m11fb = 'scheda'; return true; }
  const r = m11Rec(), has = k => ints.includes(k), fb = h => { if (!out.m11fb) out.m11fb = h; };
  const f0 = out.frags.length, mine = () => out.frags.length > f0;
  const lightsTalk = has('m11:lights');
  const nice = has('m11:lovely') || has('m11:isnt') || has('m11:isb') || has('m11:look') || has('yes');
  const sunsetTalk = !lightsTalk && (has('m11:sunset') || nice);
  const air = has('m11:cold') || has('m11:wind');
  const bye = has('m11:bye') || ints.includes('bye');
  if (!r.lit){
    /* the sunset: you answer her (sì, che bel tramonto!) or ask her (guarda il tramonto! non è bello?) */
    if (sunsetTalk){
      if (has('m11:areb') && has('m11:sunset')){ add('Sì, è bellissimo!', 'Yes, it\'s really beautiful!'); fb('<b>Il tramonto</b> is one, and masculine: <b>è bellissimo</b>.'); }
      else if (has('m11:isnt') || (has('m11:look') && !has('yes'))) add('Sì, bellissimo! Il tramonto da qui è il più bello della città.', 'Yes, really beautiful! The sunset from here is the best in town.');
      else if (has('m11:isb') || has('m11:sunset')) add('Vero? Il tramonto da qui è il più bello della città.', 'Isn\'t it? The sunset from here is the best in town.');
      else if (has('m11:lovely')) add('Sì, che bello! Ogni sera è diverso.', 'Yes, how lovely! Every evening it\'s different.');
      else add('Eh sì… Ogni sera è diverso.', 'Oh yes… Every evening it\'s different.');
      if (air){ add('E sì, fa un po\' freddo… ma guarda!', 'And yes, it\'s a little cold… but look!'); r.cool = true; }
      add('Aspetta… guarda! Si accendono le luci!', 'Wait… look! The lights are coming on!');
      r.sunset = true; out.m11lights = true;
    } else if (lightsTalk){ add('Le luci? Non ancora… aspetta!', 'The lights? Not yet… wait!'); fb('The lamps aren\'t on yet. Talk about what you can see now: the sky, the sun going down.'); }
    if (!out.m11lights && air){ add(has('m11:wind') ? 'Sì, un po\' di vento… Ma guarda il tramonto! Non è bello?' : 'Sì, un po\'. Ma guarda il tramonto! Non è bello?', has('m11:wind') ? 'Yes, a little wind… But look at the sunset! Isn\'t it lovely?' : 'Yes, a little. But look at the sunset! Isn\'t it lovely?'); r.cool = true; fb('She asked you about the sunset. Answer her.'); }
    if (has('m11:hot') && !mine()){ add('Caldo? Mah… adesso no!', 'Hot? Hmm… not now!'); out.m11laugh = true; fb('The sun is going down. Look at the sky: answer her about the sunset.'); }
    if (has('no') && !mine()){ add('No?! Ma guarda che colori!', 'No?! But look at those colours!'); fb('Really? Look at that sky. What do you think of it?'); }
    if (bye && !out.m11lights){ add('Ciao! Ma… resta un po\'! Guarda il cielo!', 'Bye! But… stay a little! Look at the sky!'); fb('Stay a little: talk about the sunset with them.'); }
    if (id === 'thanks' && !mine()) add('Prego!', 'You\'re welcome!');
    save();
    if (!mine()) add('Mmm?', 'Hmm?');
    return true;
  }
  /* after dark: the lights, the evening air */
  if (lightsTalk){
    if (has('m11:isb')){ add('Sì, sono bellissime! Le luci sul fiume…', 'Yes, they\'re really beautiful! The lights on the river…'); fb('<b>Le luci</b> are plural, and feminine: <b>sono bellissime</b>.'); }
    else add('Sì! Le luci sul fiume… che belle!', 'Yes! The lights on the river… how lovely!');
    r.lights = true;
  } else if (has('m11:sunset')){ add('Il tramonto? È finito! Adesso è sera.', 'The sunset? It\'s over! Now it\'s evening.'); fb('The sun has set. What can you see now, along the river and on the bridge?'); }
  else if (nice && !air){ add('Sì… che bello!', 'Yes… how lovely!'); if (!r.lights) fb('Lovely, yes: but what? Say what has just come on.'); }
  if (has('m11:hot')){ add('Caldo?! Ahah! No, no: fa un po\' freddo!', 'Hot?! Haha! No, no: it\'s a little cold!'); out.m11laugh = true; fb('They laughed! It\'s evening now: what is the air like?'); }
  if (air){ r.cool = true;
    if (has('m11:cold')) add(r.lights ? 'Sì, c\'è un po\' di vento sul fiume.' : 'Sì, fa un po\' freddo… ma guarda le luci!', r.lights ? 'Yes, there\'s a little wind on the river.' : 'Yes, it\'s a little cold… but look at the lights!');
    else add(r.lights ? 'Sì, e fa un po\' freddo!' : 'Sì, un po\' di vento… ma guarda le luci!', r.lights ? 'Yes, and it\'s a little cold!' : 'Yes, a little wind… but look at the lights!'); }
  if (has('no') && !mine()){ add('No? Ma guarda le luci!', 'No? But look at the lights!'); fb('Look along the river: what has just come on?'); }
  save();
  if (r.lights && r.cool){
    add(r.remembered ? 'Andiamo a prendere qualcosa di caldo. Buona serata, fotografo!' : 'Andiamo a prendere qualcosa di caldo. Ciao, e buona serata!',
      r.remembered ? "Let's go and get something hot. Have a nice evening, photographer!" : "Let's go and get something hot. Bye, and have a nice evening!");
    out.m11done = true; out.end = true; return true;
  }
  if (r.lights && !out.m11laugh && !r.cool){ add('Brr…', 'Brr…'); out.m11shiver = true; }
  if (bye && !mine()){ add('Ciao! Ma… resta un po\'!', 'Bye! But… stay a little!'); fb(r.lights ? 'Stay a little: Sara is shivering. Say what the evening air is like.' : 'Stay a little: talk about the lights.'); }
  if (!mine()) add('Mmm?', 'Hmm?');
  return true;
}
function m11After(n, out, words){
  if (!out.m11) return false;
  const r = m11Rec();
  if (out.m11fb === 'scheda'){ showHint('First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).'); return true; }
  if (out.m11laugh) enqueue(() => worldSay('tommaso', 'Ahah!', { ms:1400 }));
  if (out.m11shiver) enqueue(() => worldSay('sara', 'Brr…', { ms:1600 }));
  if (out.m11done){
    enqueue(() => { if (!questPeek(M11.id).done) questDone(M11.id); });
    convo.keepHint = true; showHint('The sunset, the lights, the evening air: done! A stamp in your passport.', 'Fatto!');
    enqueue(() => { if (convo) endConvo(); }); return true;
  }
  if (out.m11lights){
    convo.keepHint = true;
    showHint((out.m11fb && out.m11fb !== 'scheda' ? out.m11fb + ' ' : '') + 'Look: the sun is going down…', 'Fatto!');
    enqueue(() => setTimeout(() => { if (convo && convo.npc === NPC.sara) closeDialog(); m11Lights(); }, 1300));
    return true;
  }
  const formal = !convo.tips.formal && words && ['buongiorno', 'scusi', 'arrivederci', 'sta'].some(w => words.includes(w));
  if (formal){ convo.tips.formal = true; showHint('Sara and Tommaso are young and said <b>tu</b> to you: <b>ciao</b>, not the polite forms.', 'Consiglio'); return true; }
  if (out.m11fb){ showHint(hintAfter(stepTries(convo.st, m11Step()), out.m11fb, m11Strong()), 'Consiglio'); return true; }
  if (out.m11shiver){ showHint('Sara is shivering. Say what the evening air is like.', 'Fatto!'); return true; }
  showHint(contextHint(false));
  return true;
}
/* the lights come on: the dialog steps aside, the sky turns to night, the lamps light up one by one; then Sara again */
function m11Lights(){
  const r = m11Rec();
  const lit = () => { r.lit = true; if (questAt(M11.id, 'tramonto')) questStep(M11.id, 'luci'); save(); };
  cutscene([
    { guide:'The sun slips behind the hills… and the lights come on, one by one.' },
    { run:() => { PONTE.fadeMs = RM ? 300 : 7000; lit(); } },
    { wait:RM ? 300 : 3600 },
    { say:'Guarda!', who:'tommaso', ms:1300 },
    { wait:RM ? 200 : 3200 },
  ], { id:'m11-luci', guide:'', onSkip:lit }).then(res => {
    if (res.replaced) return;
    lit(); renderHUD();
    setTimeout(() => { if (!dialogOpen && sceneOf(NPC.sara) === S.scene && npcAround(NPC.sara)) openConvo(NPC.sara); }, 300);
  });
}
const m11Step = () => { const r = m11Rec(); return !r.lit ? 'm11-sunset' : !r.lights ? 'm11-lights' : 'm11-cool'; };
const m11Strong = () => { const r = m11Rec(); return !r.lit ? 'Agree with her: <b>sì</b>… and how lovely it is: <b>che bel</b> …' : !r.lights ? 'The lights: <b>le luci</b>… they are plural: <b>sono</b> …' : 'The air: <b>un po\'</b> … (cold? windy?)'; };
function m11Hint(n, st){
  if (!m11Busy(n)) return null;
  if (!schedaDone(M11.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
  const r = m11Rec();
  if (!r.lit) return { h:'They are watching the sun go down, and Sara asked you something about it. Answer her.', strong:m11Strong(), step:'m11-sunset' };
  if (!r.lights) return { h:'The lamps have come on, along the river and on the bridge. Say something about them.', strong:m11Strong(), step:'m11-lights' };
  return { h:'Sara is shivering a little. Say what the evening air is like.', strong:m11Strong(), step:'m11-cool' };
}
function tramontoDbg(){ const r = questPeek(M11.id) || {}; return { sky:ponteSky(), lit:!!r.lit, remembered:!!r.remembered, sunset:!!r.sunset, lights:!!r.lights, cool:!!r.cool }; }
