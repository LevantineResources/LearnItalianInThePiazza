/* Quest 8 · Una foto sul ponte (afternoon). Design: docs/lessons/12-la-citta.md, the quests; system: engine/quests.js.
   On Ponte Molino (scene 'ponte', world/ponte.js) a couple on holiday, Anna and Giulio (Lei: strangers), keep trying to take a
   selfie with the bridge behind them. Anna starts the small talk: "Buongiorno! Che bella giornata, eh?" Talk about the weather
   (c'è il sole, fa caldo, che bella giornata) and the bridge (il ponte è bellissimo / antico); she prompts the bridge after the
   weather, and then sighs: "Ma… con il telefono, il ponte non entra nella foto!" You offer: "Vi faccio una foto?" (shall I
   take a photo of you? vi = you two, faccio = I make) → "Sì! Grazie! Ci fa una foto? Che gentile! Ecco il telefono." (their
   phone) and the camera view opens beside the conversation: drag the frame (or the arrow buttons / keys) until both of them
   are in it, and take the picture. Photos are better with smiles: "Sorridete!" (voi: to two people) makes them smile; a picture
   without it comes out serious, and Anna asks for another. The offer can come before the small talk too; the stamp once you
   have talked about the weather and the bridge and the photo is taken ("Arrivederci, e buona giornata!"). Their replies follow
   what you say: "Fa freddo!" in the sunshine makes them laugh (and doesn't count); at night (free play) "C'è il sole" does.
   Italian: Che bella giornata!, c'è il sole, fa caldo / fa freddo, il ponte, bellissimo, antico, Vi faccio una foto?, Ci fa una
   foto? (heard), il telefono (heard), Sorridete!. Giulio is ambient: E on him talks to Anna while the task is on.
   Saved on the quest's record: weather, view (what you have said), handed (the phone is yours), smile (they are smiling for
   the next shot), shots, shot (the good one), laughed. The camera view: M8CAM (the frame), m8CamMount() / m8CamUnmount();
   tests: __dbg().foto = { cam:{ on, x, y, both, smile }, … the record }, __debug.fotoFrame(x, y) (puts the frame there). */
const M8 = { id:'foto', PIC:{ w:400, h:300 }, FRAME:{ w:172, h:150 },
  /* the couple in the picture (the camera's view): where their heads and shoulders are, for "both in the frame" */
  WHO:{ anna:{ x0:200, x1:252, y0:92, y1:200 }, giulio:{ x0:256, x1:312, y0:84, y1:200 } } };
const M8CAM = { x:22, y:70, drag:null };
const m8Rec = () => { const r = questRec(M8.id); if (!r.shots) r.shots = 0; return r; };
const m8Anna = n => !!n && n.id === 'anna';
const m8Busy = n => m8Anna(n) && questState(M8.id) === 'active';
const m8Day = () => ponteSky() === 'day';
const m8Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
const M8_CHAT = [
  m8Tile('che bella giornata', 'Che bella giornata!', 'what a lovely day!'), m8Tile("c'è il sole", "C'è il sole.", "it's sunny"),
  m8Tile('fa caldo', 'Fa caldo.', "it's hot"), m8Tile('fa freddo', 'Fa freddo.', "it's cold"),
  m8Tile('il ponte', 'il ponte', 'the bridge'), m8Tile('è bellissimo', 'è bellissimo', 'is really beautiful (masculine)'), m8Tile('è antico', 'è antico', 'is ancient, old (masculine)'),
];
const M8_PHOTO = [m8Tile('vi faccio una foto', 'Vi faccio una foto?', 'shall I take a photo of you? (two or more)'), m8Tile('sorridete', 'Sorridete!', 'smile! (to two or more people)')];
NOTQ.add('sole'); EXCL.add('sorridete'); EXCL.add('che bella'); CLAUSE.add('sorridete'); CLAUSE.add('fa'); CLAUSE.add('che bella'); CLAUSE.add('vi faccio'); QWORDS.add('vi faccio');
const m8Chatted = r => !!(r.weather && r.view);

QUESTS.push({
  id:M8.id, n:8, title_it:'Una foto sul ponte', title_en:'A photo on the bridge',
  window:'afternoon',
  place:{ scene:'ponte', x:400, y:470, map:[560, 112], label:'Ponte Molino' },
  giver:'anna',
  steps:[
    { id:'chat', en:'Chat with Anna and Giulio: the weather, and the bridge', who:'anna', where:'Ponte Molino' },
    { id:'photo', en:'Offer to take their photo: both of them in the picture, and smiling', who:'anna', where:'Ponte Molino' },
  ],
  stamp:{ icon:'◉', color:'#2f6f9a', label:'Ponte Molino' },
  scheda:{
    phrases:[
      ['Che bella giornata!', 'What a lovely day!', 'Che + an adjective + a noun: what a … !'],
      ["C'è il sole. Fa caldo.", "It's sunny. It's hot.", "The weather: c'è (there is) il sole; fa (it makes) caldo / freddo."],
      ['Il ponte è bellissimo! È antico.', "The bridge is beautiful! It's ancient.", 'Bello → bellissimo: really beautiful. Antico: very old.'],
      ['Vi faccio una foto?', 'Shall I take a photo of you?', 'Vi = (for) you, two or more; faccio = I make, I do (fare). In Italian you make a photo.'],
      ['Sì, grazie! Ci fa una foto? Ecco il telefono.', 'Yes, thanks! Will you take one of us? Here\'s the phone.', 'Ci = (for) us. Fa: you (polite) make.'],
      ['Sorridete!', 'Smile!', 'To two or more people: voi. To one friend: sorridi!'],
    ],
    how:`<p><b>Vi faccio una foto?</b> = shall I take a photo of you? <i>Faccio</i> = I do, I make (<i>fare</i>): in Italian you <i>make</i> a photo. <i>Vi</i> = for you, two or more people. Their answer: <b>Ci fa una foto?</b> (<i>ci</i> = for us; <i>fa</i> = you, polite).</p>
      <p><b>The weather</b> uses <b>fa</b> (it makes): <i>fa caldo</i> (it's hot), <i>fa freddo</i> (it's cold); and <b>c'è</b> (there is): <i>c'è il sole</i> (it's sunny).</p>
      <p>Adjectives agree: <i>il ponte è bellissim<b>o</b></i>, <i>il ponte è antic<b>o</b></i>; <i>la giornata è bellissim<b>a</b></i>. <b>-issimo</b> makes it stronger: <i>bello → bellissimo</i>.</p>
      <p><b>Sorridete!</b> is an order to two or more people (<i>voi</i>): the <i>-ete</i> ending.</p>`,
    culture:`<p>Italians talk about the weather with strangers as happily as the English do. And on a bridge with a view, offering to take a couple's photo is an everyday kindness: they hand you their phone, you say <i>Sorridete!</i> and count <i>uno, due, tre…</i></p>`,
    vocab:[
      { group:'Il tempo, il ponte', note:'The weather: fa caldo, fa freddo; c\'è il sole.', words:[
        { it:'Che bella giornata!', en:'What a lovely day!', also:['che', 'bella', 'giornata'] },
        { it:"C'è il sole.", en:"It's sunny.", also:["c'è", 'sole'] },
        { it:'Fa caldo. / Fa freddo.', en:"It's hot. / It's cold.", also:['fa', 'caldo', 'freddo'] },
        { it:'il ponte', g:'m', en:'the bridge', also:['ponte'] },
        { it:'bellissimo / bellissima', en:'really beautiful', also:['bellissimo', 'bellissima'] },
        { it:'antico / antica', en:'ancient, very old', note:'Il ponte è antico: è romano!', also:['antico', 'antica'] },
      ] },
      { group:'La foto', words:[
        { it:'Vi faccio una foto?', en:'Shall I take a photo of you? (two or more)', also:['vi', 'faccio', 'foto', 'una'] },
        { it:'Ci fa una foto?', en:'Will you take a photo of us? (polite)', also:['ci'] },
        { it:'il telefono', g:'m', en:'the phone', note:'Ecco il telefono: here\'s the phone.', also:['telefono'] },
        { it:'Sorridete!', en:'Smile! (to two or more people)', also:['sorridete'] },
      ] },
    ],
    exercises:[
      { type:'mc', q:'Their selfie won\'t fit the bridge. You offer:', opts:['Vi faccio una foto?', 'Mi fa una foto?', 'Ci fa una foto?'], a:0, why:'Vi faccio: I make (take) … for you two. Mi fa / Ci fa…? asks them to take one of you.', nudge:'Faccio = I make. Vi = for you two.' },
      { type:'mc', q:'You tell them both to smile:', opts:['Sorridi!', 'Sorridete!', 'Sorrida!'], a:1, why:'Two people: voi, sorridete.', nudge:'They are two.' },
      { type:'mc', q:'The sun is out and it\'s 30 degrees. You say:', opts:['Fa freddo!', 'Fa caldo!', 'Che freddo!'], a:1, why:'Fa caldo: it\'s hot.', nudge:'Thirty degrees!' },
      { type:'mc', q:'Il ponte è ___: è romano!', opts:['antica', 'antico', 'antichi'], a:1, why:'Il ponte is masculine, one: antico.', nudge:'Il ponte: masculine.' },
    ],
    tiles:[...M8_CHAT, ...M8_PHOTO],
  },
  hooks:{
    /* Giulio lets Anna do the talking */
    visitorTalk(npc){ return npc.id === 'giulio' && ['open', 'active'].includes(questState(M8.id)); },
    redirect(npc){ return npc.id === 'giulio' && ['open', 'active'].includes(questState(M8.id)) ? NPC.anna : null; },
    talk(npc){
      if (!m8Anna(npc)) return false;
      if (questState(M8.id) === 'open') return m8Start(npc);
      if (m8Busy(npc)){ convo.m8 = true; convo.known = !!S.known.anna; const r = m8Rec(); if (r.handed && !r.shot) enqueue(() => { if (convo && convo.m8) m8CamMount(); }); }
      return false;
    },
    bank(npc, groups, names){
      if (!m8Busy(npc)) return null;
      if (schedaDone(M8.id)){ groups.push({ label:'Il tempo, il ponte', tiles:M8_CHAT.map(phraseTile) }); groups.push({ label:'La foto', tiles:M8_PHOTO.map(phraseTile) }); }
      groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
      if (names.length) groups.push({ label:'Names', tiles:names });
      return groups;
    },
    phrases(npc){
      if (!m8Busy(npc)) return [];
      return [['m8:offer', 'vi faccio una foto'], ['m8:offer', 'una foto'], ['m8:offer:me', 'mi fa una foto'], ['m8:offer:me', 'ci fa una foto'], ['m8:yes', 'sì certo'], ['m8:yes', 'certo'],
        ['m8:smile', 'sorridete'], ['m8:sun', "c'è il sole"], ['m8:hot', 'fa caldo'], ['m8:cold', 'fa freddo'],
        ['m8:lovely', 'che bella giornata'], ['m8:river', 'il fiume'], ['m8:bridge', 'il ponte'], ['m8:beautiful', 'è bellissimo'], ['m8:old', 'è antico'], ['m8:old', 'antico'], ['ok10', 'va bene']];
    },
    react(id, n, st, add, out, ints){ return m8React(id, n, st, add, out, ints || [id]); },
    hint(n, st){ return m8Hint(n, st); },
    afterTurn(n, out, res, words){ return m8After(n, out, words); },
  },
});
/* the couple's phone: in Anna's hand (held up for a selfie), or in yours while you take the photo */
Object.defineProperty(NPC.anna, 'camera', { configurable:true, enumerable:true, get(){ return null; } });
Object.defineProperty(NPC.anna, 'selfie', { configurable:true, enumerable:true, get(){ const r = questPeek(M8.id); return r && r.handed && !r.shot ? null : '#2b2b2b'; } });
/* Anna's openings by step (a getter: it holds after the task too) */
{
  const a = NPC.anna, keep = k => { const d = Object.getOwnPropertyDescriptor(a, k); return () => d.get ? d.get() : d.value; };
  const op = keep('opening'), re = keep('revisitOpening');
  const step = () => {
    const r = questPeek(M8.id); if (!r || !r.started) return null;
    if (r.done) return { it:'Ah, Lei! Grazie ancora per la foto!', en:'Ah, it\'s you! Thanks again for the photo!' };
    if (!r.handed) return r.weather ? (r.view ? { it:'Uffa… con il telefono, il ponte non entra nella foto!', en:'Oh dear… with the phone, the bridge won\'t fit in the photo!' } : { it:'E il ponte… bello, no?', en:'And the bridge… lovely, isn\'t it?' })
      : { it:'Buongiorno! Che bella giornata, eh?', en:'Good afternoon! What a lovely day, isn\'t it?' };
    if (!r.shot) return { it:'Siamo pronti!', en:'We\'re ready!' };
    return { it:'Che bella foto!', en:'What a lovely photo!' };
  };
  Object.defineProperty(a, 'opening', { configurable:true, enumerable:true, get:() => step() || op() });
  Object.defineProperty(a, 'revisitOpening', { configurable:true, enumerable:true, get:() => step() || re() });
}
/* the start: Anna and Giulio are trying for a selfie; she starts the small talk (scripted; the scheda opens after) */
function m8Start(npc){
  convo.known = !!S.known.anna;
  builder.hidden = true;
  npcLine('Buongiorno! Che bella giornata, eh?', 'Good afternoon! What a lovely day, isn\'t it?');
  sysLine('A couple on holiday, holding a phone up at arm\'s length for a selfie with the bridge behind them… it never fits. Chat with them (the weather, the bridge), and offer to take their photo. The task\'s <b>scheda</b> has the words.');
  questStart(M8.id); m8Rec(); save();
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  return true;
}
function m8React(id, n, st, add, out, ints){
  if (!m8Busy(n)) return false;
  const r = m8Rec();
  if (id === 'greet'){ if (!st.m8greet){ st.m8greet = true; add(m8Day() ? 'Buongiorno!' : 'Buonasera!', m8Day() ? 'Good afternoon!' : 'Good evening!'); } return true; }
  if ((id === 'bye' || id === 'thanks') && !out.m8 && !ints.some(i => /^m8:/.test(i))){
    out.m8 = true; out.asked = true;
    if (r.shot){ add(m8Chatted(r) ? 'Arrivederci! E grazie ancora per la foto!' : 'Prego! Ma… resti un momento! Che bella giornata, eh?', m8Chatted(r) ? 'Goodbye! And thanks again for the photo!' : "You're welcome! But… stay a moment! What a lovely day, isn't it?");
      if (m8Chatted(r)){ out.m8bye = true; out.end = true; } else out.m8fb = 'Stay a little: finish the small talk (the weather, the bridge).'; return true; }
    if (id === 'bye'){ add('Arrivederci!', 'Goodbye!'); out.end = true; return true; }
    add('Prego!', "You're welcome!"); return true;
  }
  if (!/^m8:/.test(id) && !['yes', 'ok10', 'no'].includes(id)) return false;
  if (out.m8) return true;
  out.m8 = true; out.asked = true;
  if (!schedaDone(M8.id)){ add('Prego?', 'Pardon?'); out.m8fb = 'scheda'; return true; }
  const has = k => ints.includes(k), fb = h => { if (!out.m8fb) out.m8fb = h; };
  const day = m8Day(), was = { weather:!!r.weather, view:!!r.view }, f0 = out.frags.length, mine = () => out.frags.length > f0;
  /* you offer to take their photo: their phone */
  if (has('m8:offer') && !r.handed){
    add('Sì! Grazie! Ci fa una foto? Che gentile!', 'Yes! Thank you! Will you take one of us? How kind!');
    add('Ecco il telefono.', "Here's the phone.");
    r.handed = true; out.m8cam = true; if (questAt(M8.id, 'chat')) questStep(M8.id, 'photo');
    if (has('m8:smile')){ r.smile = true; out.m8smile = true; }
  } else if (has('m8:offer')){ add(r.shot ? 'Un\'altra? No, no: è perfetta!' : 'Sì, sì! Il telefono è Suo… siamo pronti!', r.shot ? 'Another one? No, no: it\'s perfect!' : 'Yes, yes! You have the phone… we\'re ready!'); }
  if (has('m8:offer:me') && !r.handed){ add('Una foto di Lei? Ahah… no, no: una foto di noi due!', 'A photo of you? Haha… no, no: a photo of the two of us!'); fb('You asked them to take a photo of you. Offer to take one of <i>them</i>: faccio, I make.'); }
  /* smile! */
  if (has('m8:smile') && !out.m8cam){
    if (!r.handed){ add('Ahah, sì! Ma… chi fa la foto?', 'Haha, yes! But… who takes the photo?'); fb('They need someone to take the photo first. Offer to take it.'); }
    else if (r.shot){ add('Ahah! Ancora? La foto è già perfetta!', 'Haha! Again? The photo is already perfect!'); }
    else { add('Ahah! Sì!', 'Haha! Yes!'); r.smile = true; out.m8smile = true; }
  }
  if (has('m8:yes') && !has('m8:offer') && !mine()){ add(r.handed && !r.shot ? 'Grazie! Siamo pronti.' : 'Sì?', r.handed && !r.shot ? "Thank you! We're ready." : 'Yes?'); }
  /* the weather */
  if (has('m8:sun')){
    if (day){ add('Sì, c\'è il sole! Finalmente!', 'Yes, it\'s sunny! At last!'); r.weather = true; }
    else { add('Il sole? Ahah! Ma è sera!', 'The sun? Haha! But it\'s evening!'); out.m8laugh = true; fb('Look at the sky: it\'s evening. Say something about the weather as it is now.'); }
  }
  if (has('m8:hot')){
    if (day){ add('Sì, fa caldo! Ma qui sul ponte c\'è un po\' d\'aria.', 'Yes, it\'s hot! But up here on the bridge there\'s a bit of a breeze.'); r.weather = true; }
    else { add('Caldo? Mah… stasera no!', 'Hot? Hmm… not this evening!'); out.m8laugh = true; fb('It\'s evening: is it really hot?'); }
  }
  if (has('m8:cold')){
    if (day){ add('Freddo?! Ahah! Ma no, c\'è il sole: fa caldo!', 'Cold?! Haha! No, it\'s sunny: it\'s hot!'); out.m8laugh = true; r.laughed = (r.laughed || 0) + 1; fb('They laughed: in this sunshine? Say what the weather is really like.'); }
    else { add('Sì, un po\'! Brr.', 'Yes, a bit! Brr.'); r.weather = true; }
  }
  if (has('m8:lovely')){
    if (day){ add('Sì! Una giornata bellissima.', 'Yes! A really beautiful day.'); r.weather = true; }
    else { add('Giornata? È sera! Ma sì, che bella serata.', 'Day? It\'s evening! But yes, what a lovely evening.'); r.weather = true; }
  }
  /* the bridge (the river is a fine view too) */
  const what = has('m8:bridge') ? 'bridge' : has('m8:river') ? 'river' : null;
  if (what && (has('m8:beautiful') || has('m8:old'))){
    if (what === 'river') add('Sì, bellissimo! E guardi il campanile, laggiù!', 'Yes, really beautiful! And look at the bell tower, over there!');
    else if (has('m8:old')) add('Sì! È antichissimo: è romano!', 'Yes! It\'s really ancient: it\'s Roman!');
    else add('Sì, bellissimo! Ed è antico: è romano!', 'Yes, really beautiful! And it\'s ancient: it\'s Roman!');
    r.view = true;
  } else if (what){ add(what === 'river' ? 'Il fiume? Sì… è bello, eh?' : 'Il ponte? Sì… è bello, eh?', what === 'river' ? 'The river? Yes… it\'s lovely, isn\'t it?' : 'The bridge? Yes… it\'s lovely, isn\'t it?'); r.view = true; }
  else if (has('m8:beautiful') || has('m8:old')){ add(has('m8:old') ? 'Antico… che cosa?' : 'Bellissimo… che cosa?', has('m8:old') ? 'Ancient… what is?' : 'Really beautiful… what is?'); fb('Say <i>what</i> is beautiful: what are you all standing on?'); }
  /* Anna leads the small talk on: the bridge after the weather; then the selfie that won't work */
  if (!out.m8laugh && !out.m8cam){
    if (r.weather && !r.view && !was.weather && !out.m8fb) add('E il ponte… bello, no?', 'And the bridge… lovely, isn\'t it?');
    else if (r.view && !r.weather && !was.view && !out.m8fb) add('E che bella giornata, eh?', 'And what a lovely day, isn\'t it?');
  }
  if (m8Chatted(r) && !(was.weather && was.view) && questAt(M8.id, 'chat')) questStep(M8.id, 'photo');
  if (m8Chatted(r) && !(was.weather && was.view) && !r.handed && !out.m8cam){ add('Uffa… ma con il telefono, il ponte non entra nella foto!', 'Oh dear… but with the phone, the bridge won\'t fit in the photo!'); worldSayLater('giulio', 'Mmm…'); out.m8selfie = true; }
  save();
  /* the photo taken and the chat done: they say goodbye */
  if (r.shot && m8Chatted(r) && !out.m8laugh){ add('Bene! Grazie ancora per la foto. Arrivederci, e buona giornata!', 'Right! Thanks again for the photo. Goodbye, and have a nice day!'); out.m8done = true; out.end = true; }
  if (!mine()) add(has('no') && !r.handed ? 'No? Va bene…' : 'Sì?', has('no') && !r.handed ? 'No? All right…' : 'Yes?');
  return true;
}
const worldSayLater = (id, line) => enqueue(() => worldSay(id, line, { ms:1400 }));
function m8After(n, out, words){
  if (!out.m8) return false;
  const r = m8Rec();
  if (out.m8fb === 'scheda'){ showHint('First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).'); return true; }
  if (out.m8laugh) enqueue(() => worldSay('giulio', 'Ahah!', { ms:1400 }));
  if (out.m8smile) enqueue(() => { worldSay('giulio', 'Ahah!', { ms:1200 }); m8CamRender(); });
  if (out.m8done || out.m8bye){
    enqueue(() => { if (!questPeek(M8.id).done) questDone(M8.id); });
    convo.keepHint = true; showHint('A chat about the weather and the bridge, and their photo: done! A stamp in your passport.', 'Fatto!');
    enqueue(() => { if (convo) endConvo(); }); return true;
  }
  if (out.m8cam){ enqueue(() => m8CamMount()); showHint('Their phone is in your hands: drag the frame until they are <b>both</b> in the picture, then take it. Photos are better with smiles…', 'Fatto!'); return true; }
  const formal = !convo.tips.formal && words && ['ciao', 'scusa', 'stai', 'puoi'].some(w => words.includes(w));
  if (formal){ convo.tips.formal = true; showHint('Anna and Giulio are strangers: the polite forms (<b>buongiorno</b>, <b>scusi</b>, <b>Lei</b>).', 'Consiglio'); return true; }
  if (out.m8fb){ showHint(hintAfter(stepTries(convo.st, m8Step()), out.m8fb, m8Strong()), 'Consiglio'); return true; }
  if (out.m8smile && !r.shot){ showHint('They\'re smiling! Now take the photo: both of them in the frame.', 'Fatto!'); return true; }
  showHint(m8Hint(n, convo.st).h, 'Fatto!');
  return true;
}
const m8Step = () => { const r = m8Rec(); return !r.weather ? 'm8-weather' : !r.view ? 'm8-view' : !r.handed ? 'm8-offer' : !r.shot ? 'm8-shot' : 'm8-bye'; };
const m8Strong = () => { const r = m8Rec();
  return !r.handed && m8Chatted(r) ? 'Offer: <b>faccio</b> (I make) … <b>una foto</b>, for the two of them.' : !r.weather ? 'The weather: <b>fa</b> … or <b>c\'è</b> …' : !r.view ? 'The bridge: <b>il ponte</b> … and an adjective (beautiful? ancient?).'
    : !r.handed ? 'Offer: <b>faccio</b> (I make) … <b>una foto</b>, for the two of them.' : !r.shot ? 'To two people, the order ends in <b>-ete</b> (voi): <b>sorrid</b>…' : 'The polite goodbye: <b>arrivederci</b>.'; };
function m8Hint(n, st){
  if (!m8Busy(n)) return null;
  if (!schedaDone(M8.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
  const r = m8Rec();
  if (r.handed && !r.shot) return { h:r.smile ? 'They\'re smiling: frame them both and take the photo.' : 'Frame them both and take the photo. Photos are better with smiles: ask them, both of them, to smile.', strong:r.smile ? null : m8Strong(), step:'m8-shot' };
  if (!r.weather) return { h:'Small talk! Answer Anna: say something about the weather today.', strong:m8Strong(), step:'m8-weather' };
  if (!r.view) return { h:'Now say something about the bridge you are standing on.', strong:m8Strong(), step:'m8-view' };
  if (!r.handed) return { h:'They can\'t fit the bridge into their selfie. Offer to take the photo for them.', strong:m8Strong(), step:'m8-offer' };
  return { h:'Say goodbye.', step:'m8-bye' };
}

/* ---------- the camera view (beside the transcript, like Lesson 9's dictated map) ---------- */
const m8Both = () => { const f = { x0:M8CAM.x, y0:M8CAM.y, x1:M8CAM.x + M8.FRAME.w, y1:M8CAM.y + M8.FRAME.h };
  return Object.values(M8.WHO).every(b => b.x0 >= f.x0 && b.x1 <= f.x1 && b.y0 >= f.y0 && b.y1 <= f.y1); };
const m8In = k => { const b = M8.WHO[k], f = { x0:M8CAM.x, x1:M8CAM.x + M8.FRAME.w, y0:M8CAM.y, y1:M8CAM.y + M8.FRAME.h }; return b.x1 > f.x0 + 8 && b.x0 < f.x1 - 8 && b.y1 > f.y0 && b.y0 < f.y1; };
function m8CamMount(){
  if (!dialogOpen || !convo || convo.npc !== NPC.anna) return;
  let el = $('#dlgCam');
  if (!el){ el = document.createElement('div'); el.id = 'dlgCam'; el.className = 'dlgmap dlgcam'; dlg.insertBefore(el, tr); }
  dlg.classList.add('with-map');
  M8CAM.note = M8CAM.note || ''; M8CAM.kind = M8CAM.kind || '';
  m8CamRender(); scrollTr();
}
function m8CamUnmount(){ const el = $('#dlgCam'); if (el) el.remove(); if (!$('#dlgMap')) dlg.classList.remove('with-map'); }
function m8CamRender(){
  const el = $('#dlgCam'); if (!el) return;
  const r = m8Rec(), both = m8Both(), F = M8.FRAME, x = M8CAM.x, y = M8CAM.y, P = M8.PIC;
  const smile = !!r.smile || !!r.shot;
  el.innerHTML = `<div class="dm-top"><p class="dm-title">La foto <span class="cam-sub">· drag the frame</span></p></div>
    <div class="cam-view"><svg class="camsvg" viewBox="0 0 ${P.w} ${P.h}" role="img" aria-label="Their phone's camera: Anna and Giulio on the bridge">
      ${m8PhotoSVG({ smile })}
      <path d="M0 0H${P.w}V${P.h}H0Z M${x} ${y}V${y + F.h}H${x + F.w}V${y}Z" fill="rgba(10,14,30,.55)" fill-rule="evenodd" pointer-events="none"/>
      <g class="cam-frame${both ? ' ok' : ''}" data-cam-frame transform="translate(${x} ${y})">
        <rect width="${F.w}" height="${F.h}" fill="transparent"/>
        ${[1, 2].map(k => `<path d="M${F.w * k / 3} 0V${F.h}M0 ${F.h * k / 3}H${F.w}" class="cam-grid"/>`).join('')}
        <path d="M0 18V0H18 M${F.w - 18} 0H${F.w}V18 M${F.w} ${F.h - 18}V${F.h}H${F.w - 18} M18 ${F.h}H0V${F.h - 18}" class="cam-corners"/>
        ${both ? `<circle cx="${F.w / 2}" cy="${F.h / 2}" r="7" class="cam-focus"/>` : ''}
      </g>
      ${M8CAM.flash ? `<rect width="${P.w}" height="${P.h}" fill="#fff" class="cam-flash"/>` : ''}
    </svg></div>
    <div class="cam-tools">
      <div class="cam-pad">${[['←', -1, 0], ['↑', 0, -1], ['↓', 0, 1], ['→', 1, 0]].map(([l, dx, dy]) => `<button class="tile cam-nudge" data-cam-nudge="${dx},${dy}" aria-label="Move the frame ${l}">${l}</button>`).join('')}</div>
      <button class="btn primary cam-shoot" id="camShoot" ${r.shot ? 'disabled' : ''}><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 7h3l2-3h6l2 3h3v12H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.6" fill="none" stroke="currentColor" stroke-width="2"/></svg> Scatta</button>
    </div>
    <p class="dm-status ${M8CAM.kind || ''}" id="camNote">${M8CAM.note || (both ? 'Both of them in the frame.' : 'Move the frame until both of them are in it.')}</p>`;
  const svg = el.querySelector('.camsvg');
  svg.addEventListener('pointerdown', e => {
    if (m8Rec().shot) return;
    const p = m8SvgPt(svg, e); M8CAM.drag = { dx:p.x - M8CAM.x, dy:p.y - M8CAM.y, id:e.pointerId };
    if (!(p.x >= M8CAM.x && p.x <= M8CAM.x + F.w && p.y >= M8CAM.y && p.y <= M8CAM.y + F.h)) M8CAM.drag = { dx:F.w / 2, dy:F.h / 2, id:e.pointerId };
    svg.setPointerCapture && svg.setPointerCapture(e.pointerId); m8CamMove(p.x - M8CAM.drag.dx, p.y - M8CAM.drag.dy); e.preventDefault();
  });
  svg.addEventListener('pointermove', e => { if (!M8CAM.drag) return; const p = m8SvgPt(svg, e); m8CamMove(p.x - M8CAM.drag.dx, p.y - M8CAM.drag.dy, true); });
  const end = () => { if (M8CAM.drag){ M8CAM.drag = null; m8CamRender(); } };
  svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
  el.querySelectorAll('[data-cam-nudge]').forEach(b => b.onclick = () => { const [dx, dy] = b.dataset.camNudge.split(',').map(Number); m8CamMove(M8CAM.x + dx * 14, M8CAM.y + dy * 14); });
  const sh = el.querySelector('#camShoot'); if (sh) sh.onclick = m8Shoot;
}
const m8SvgPt = (svg, e) => { const b = svg.getBoundingClientRect(); return { x:(e.clientX - b.left) / b.width * M8.PIC.w, y:(e.clientY - b.top) / b.height * M8.PIC.h }; };
/* move the frame (kept inside the picture); while dragging only the frame moves (no re-render of the buttons) */
function m8CamMove(x, y, light){
  M8CAM.x = Math.round(Math.max(0, Math.min(M8.PIC.w - M8.FRAME.w, x))); M8CAM.y = Math.round(Math.max(0, Math.min(M8.PIC.h - M8.FRAME.h, y)));
  M8CAM.note = ''; M8CAM.kind = '';
  if (light){ const el = $('#dlgCam'); const fr = el && el.querySelector('[data-cam-frame]'), mask = el && el.querySelector('.camsvg > path');
    if (fr){ fr.setAttribute('transform', `translate(${M8CAM.x} ${M8CAM.y})`); fr.classList.toggle('ok', m8Both()); }
    if (mask) mask.setAttribute('d', `M0 0H${M8.PIC.w}V${M8.PIC.h}H0Z M${M8CAM.x} ${M8CAM.y}V${M8CAM.y + M8.FRAME.h}H${M8CAM.x + M8.FRAME.w}V${M8CAM.y}Z`);
    const n = el && el.querySelector('#camNote'); if (n){ n.className = 'dm-status'; n.textContent = m8Both() ? 'Both of them in the frame.' : 'Move the frame until both of them are in it.'; }
    return; }
  m8CamRender();
}
/* the arrow keys move the frame while the camera is open */
document.addEventListener('keydown', e => {
  if (!$('#dlgCam') || !dialogOpen || (e.target.matches && e.target.matches('input'))) return;
  const d = { arrowleft:[-1, 0], arrowright:[1, 0], arrowup:[0, -1], arrowdown:[0, 1] }[e.key.toLowerCase()];
  if (!d) return;
  e.preventDefault(); m8CamMove(M8CAM.x + d[0] * 10, M8CAM.y + d[1] * 10);
});
/* the shutter */
function m8Shoot(){
  const r = m8Rec(); if (r.shot || !convo || convoBusy) return;
  const out = !m8In('anna') ? 'anna' : !m8In('giulio') ? 'giulio' : null;
  if (!m8Both()){
    M8CAM.kind = 'bad';
    M8CAM.note = out ? 'Hmm… one of them isn\'t in the picture. Move the frame.' : 'Almost: someone is cut off at the edge. Move the frame a little.';
    m8CamRender(); return;
  }
  r.shots++; save();
  M8CAM.flash = true; m8CamRender(); setTimeout(() => { M8CAM.flash = false; m8CamRender(); }, 180);
  sysLine(`<span class="cam-photo">${m8PhotoSVG({ smile:!!r.smile, crop:{ x:M8CAM.x, y:M8CAM.y } })}</span>`);
  if (!r.smile){
    npcLine('Mmm… siamo un po\' seri, no? Un\'altra?', 'Hmm… we look a bit serious, don\'t we? Another one?');
    M8CAM.kind = 'bad'; M8CAM.note = 'Click! … They look rather serious.';
    enqueue(() => { m8CamRender(); showHint(hintAfter(stepTries(convo.st, 'm8-shot'), 'They look so serious! Say something to make them both smile, then take another.', m8Strong()), 'Consiglio'); });
    return;
  }
  r.shot = true; save();
  M8CAM.kind = 'good'; M8CAM.note = 'Click! A lovely photo.';
  npcLine('Che bella foto! Grazie mille!', 'What a lovely photo! Thank you so much!');
  if (m8Chatted(r)){
    npcLine('Arrivederci, e buona giornata!', 'Goodbye, and have a nice day!', { queue:true });
    enqueue(() => { setTimeout(() => { m8CamUnmount(); }, 900); if (!questPeek(M8.id).done) questDone(M8.id); convo.keepHint = true; showHint('A chat about the weather and the bridge, and their photo: done! A stamp in your passport.', 'Fatto!'); });
    enqueue(() => { if (convo) endConvo(); });
    return;
  }
  npcLine(r.weather ? 'E il ponte… bello, no?' : 'E che bella giornata, eh?', r.weather ? 'And the bridge… lovely, isn\'t it?' : 'And what a lovely day, isn\'t it?', { queue:true });
  enqueue(() => { setTimeout(() => { m8CamUnmount(); }, 900); showHint('A lovely photo! Now a little small talk: ' + (r.weather ? 'the bridge.' : r.view ? 'the weather.' : 'the weather, and the bridge.'), 'Fatto!'); });
}
/* the picture: the far bank, the bell tower, the river, the parapet, and the two of them in front of it (smiling or not).
   crop: only the frame (the photo in the transcript) */
function m8PhotoSVG(o = {}){
  const A = NPC.anna, G = NPC.giulio, P = M8.PIC, sm = !!o.smile;
  const face = (x, y, skin, hair, long, smile, hat) => `
    ${long ? `<path d="M${x - 17} ${y - 2}q-3 34 6 46h22q9 -12 6 -46z" fill="${hair}"/>` : ''}
    <ellipse cx="${x}" cy="${y}" rx="15" ry="18" fill="${skin}"/>
    <path d="M${x - 16} ${y - 4}q2 -20 16 -20q15 0 16 20q-6 -10 -16 -11q-10 1 -16 11z" fill="${hair}"/>
    <circle cx="${x - 5.5}" cy="${y + 1}" r="1.8" fill="#2a1a12"/><circle cx="${x + 5.5}" cy="${y + 1}" r="1.8" fill="#2a1a12"/>
    ${smile ? `<path d="M${x - 7} ${y + 8}q7 8 14 0" fill="#fff" stroke="#7a2a2a" stroke-width="1.6"/><circle cx="${x - 9}" cy="${y + 7}" r="2.6" fill="#e88a7a" opacity=".45"/><circle cx="${x + 9}" cy="${y + 7}" r="2.6" fill="#e88a7a" opacity=".45"/>`
      : `<path d="M${x - 5} ${y + 10}h10" stroke="#7a2a2a" stroke-width="1.6" stroke-linecap="round"/>`}`;
  const body = (x, y, col, w, skin) => `<rect x="${x - 5}" y="${y + 12}" width="10" height="14" fill="${skin}"/>
    <path d="M${x - w} ${P.h}V${y + 46}q0 -22 ${w * 0.55} -24h${w * 0.9}q${w * 0.55} 2 ${w * 0.55} 24V${P.h}z" fill="${col}"/>
    <path d="M${x - w + 4} ${y + 48}V${P.h}M${x + w - 4} ${y + 48}V${P.h}" stroke="rgba(0,0,0,.14)" stroke-width="3"/>
    <path d="M${x - 7} ${y + 22}l7 8l7 -8" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="2"/>`;
  const inner = `
    <defs><linearGradient id="cam-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d9fd6"/><stop offset="1" stop-color="#d8eaf0"/></linearGradient>
      <linearGradient id="cam-riv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc4dc"/><stop offset="1" stop-color="#2e6c96"/></linearGradient></defs>
    <rect width="${P.w}" height="${P.h}" fill="url(#cam-sky)"/>
    <ellipse cx="80" cy="44" rx="34" ry="8" fill="#fff" opacity=".8"/><ellipse cx="330" cy="30" rx="40" ry="9" fill="#fff" opacity=".75"/>
    <path d="M0 150q60 -26 130 -10t140 -6t130 4V170H0z" fill="#8fb0a8"/>
    ${[[0, 128, 46, '#e3b36a'], [44, 120, 40, '#d98f5c'], [82, 132, 34, '#e8c99a'], [150, 136, 30, '#c9764e'], [178, 130, 40, '#efd7a8'], [216, 138, 26, '#d9a36e'], [240, 126, 44, '#e6a487'], [282, 134, 36, '#cfa168'], [316, 124, 46, '#f0c58a'], [360, 132, 40, '#bf8a63']]
      .map(([x, y, w, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${176 - y}" fill="${c}"/><rect x="${x - 2}" y="${y - 4}" width="${w + 4}" height="5" fill="#b5532f"/>${[0, 1].map(k => `<rect x="${x + 6 + k * (w - 18)}" y="${y + 10}" width="6" height="9" fill="#2f3a46"/>`).join('')}`).join('')}
    <rect x="112" y="40" width="22" height="136" fill="#d9b48a"/><rect x="128" y="40" width="6" height="136" fill="#b8916a"/>
    <path d="M110 40L123 6L136 40z" fill="#8a5a3a"/><rect x="116" y="50" width="5" height="10" rx="2.5" fill="#3a2a26"/><rect x="125" y="50" width="5" height="10" rx="2.5" fill="#3a2a26"/>
    <rect y="174" width="${P.w}" height="34" fill="url(#cam-riv)"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(k => `<rect x="${k * 60 + 10}" y="${182 + (k % 3) * 7}" width="${18 + (k % 2) * 10}" height="1.6" fill="#fff" opacity=".45"/>`).join('')}
    <rect y="204" width="${P.w}" height="9" fill="#e2d6bd"/><rect y="211" width="${P.w}" height="3" fill="#c9bb9c"/>
    <rect y="214" width="${P.w}" height="40" fill="#9a8f7c"/>
    ${Array.from({ length:27 }, (_, k) => `<rect x="${k * 15 + 3}" y="214" width="9" height="40" rx="4" fill="#d8cbab"/>`).join('')}
    <rect y="252" width="${P.w}" height="8" fill="#d4c5a5"/><rect y="260" width="${P.w}" height="40" fill="#a2998b"/>
    <g>${body(228, 120, A.body, 26, A.skin)}${body(284, 112, G.body, 29, G.skin)}
      <path d="M262 160q-14 8 -26 6" stroke="${G.skin}" stroke-width="7" stroke-linecap="round" fill="none"/>
      ${face(228, 120, A.skin, A.hair, true, sm)}${face(284, 112, G.skin, G.hair, false, sm)}
      <rect x="206" y="184" width="14" height="11" rx="2" fill="${A.bag || '#c2461f'}"/><path d="M209 184q4 -28 15 -38" stroke="#5a2a1a" stroke-width="1.5" fill="none"/></g>`;
  if (!o.crop) return inner;
  const F = M8.FRAME;
  return `<svg class="cam-print" viewBox="${o.crop.x} ${o.crop.y} ${F.w} ${F.h}" role="img" aria-label="${sm ? 'The photo: Anna and Giulio, smiling, on the bridge' : 'The photo: Anna and Giulio, looking serious'}">${inner.replace(/id="cam-/g, 'id="camp-' + (m8Rec().shots) + '-').replace(/url\(#cam-/g, 'url(#camp-' + (m8Rec().shots) + '-')}</svg>`;
}
function fotoDbg(){ const r = questPeek(M8.id) || {}; return { cam:{ on:!!$('#dlgCam'), x:M8CAM.x, y:M8CAM.y, both:m8Both(), smile:!!r.smile }, handed:!!r.handed, shots:r.shots || 0, shot:!!r.shot, weather:!!r.weather, view:!!r.view, laughed:r.laughed || 0 }; }
Object.assign(window.__debug, { fotoFrame(x, y){ m8CamMove(x, y); return fotoDbg(); } });
