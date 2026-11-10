/* Lesson 5. Lesson data: vocabulary, tiles, routes, and the handbook chapter (LESSONS.push). */

/* Lesson 5 pack: introducing people */
const L5_TILES = [
  { key:'ti presento', label:'Ti presento', words:'ti presento', en:'let me introduce (to a friend)' },
  { key:'le presento', label:'Le presento', words:'le presento', en:'may I introduce (polite)' },
  { key:'questo è', label:'Questo è', words:'questo è', en:'this is (a man, a masculine word)' },
  { key:'questa è', label:'Questa è', words:'questa è', en:'this is (a woman, a feminine word)' },
  { key:'il mio amico', label:'il mio amico', words:'il mio amico', en:'my friend (a man)' },
  { key:'la mia amica', label:'la mia amica', words:'la mia amica', en:'my friend (a woman)' },
  { key:'lui è', label:'Lui è', words:'lui è', en:'he is' },
  { key:'è inglese', label:'È inglese', words:'è inglese', en:"he's English" },
  { key:'non parla italiano', label:'Non parla italiano', words:'non parla italiano', en:"he doesn't speak Italian" },
  { key:'siamo amici', label:'Siamo amici', words:'siamo amici', en:"we're friends" },
];
const STATUE_TILE = { key:'la statua di gattamelata', label:'la statua di Gattamelata', words:'la statua di Gattamelata', en:'the Gattamelata statue', place:true };
const PAOLO_ROUTE = [
  { it:'Allora: vai dritto fino alla banca.', en:'So: go straight as far as the bank.' },
  { it:'Alla banca, gira a destra.', en:'At the bank, turn right.' },
  { it:'Vai sempre dritto e attraversa il ponte.', en:'Keep going straight and cross the bridge.' },
  { it:'Dopo il ponte, gira a sinistra.', en:'After the bridge, turn left.' },
  { it:'Piazza del Santo è in fondo alla strada.', en:'Piazza del Santo is at the end of the street.' },
];


/* The handbook chapter: dialogue, phrases, explanations, culture note, exercises. */
LESSONS.push({
    n:5, title:'Ti presento…', sub:'Introducing people, and finding the art',
    dlgNote:'Anna introduces her English friend Tom to Luca, then to a stranger in a museum.',
    dialogue:[
      ['Anna','Ciao Luca! Ti presento il mio amico Tom.','Hi Luca! Let me introduce my friend Tom.'],
      ['Luca','Ciao Tom! Piacere!','Hi Tom! Nice to meet you!'],
      ['Anna','Tom è inglese. Non parla italiano.',"Tom is English. He doesn't speak Italian."],
      ['Luca','Nessun problema! Hello, Tom!','No problem! Hello, Tom!'],
      ['Anna','Buongiorno, signora. Le presento il mio amico Tom.','Good morning, madam. May I introduce my friend Tom.'],
      ['Signora','Piacere, Tom!','Nice to meet you, Tom!'],
      ['Anna','Scusi, questa è la Venere di Botticelli?',"Excuse me, is this Botticelli's Venus?"],
      ['Signora','Sì, è questa!','Yes, this is it!'],
    ],
    pitches:{ Anna:1.15, Luca:0.85, Signora:1.0 },
    phrasesTitle:'Introducing someone',
    phrases:[
      ['Ti presento …','Let me introduce … (to a friend)','Literally: I present to you …'],
      ['Le presento …','May I introduce … (polite)','For strangers and older people.'],
      ['Questo è il mio amico …','This is my friend … (a man)','Questo and amico for a man.'],
      ['Questa è la mia amica …','This is my friend … (a woman)','Questa and amica for a woman.'],
      ['Lui è …','He is …','Lei è … = she is …'],
      ['È inglese.',"He's English.",'Or: è americano, è australiano …'],
      ['Non parla italiano.',"He doesn't speak Italian.",'Parla: the lui form of parlare.'],
      ['Siamo amici.',"We're friends.",'Siamo: we are.'],
    ],
    phrases2Title:"What you'll hear",
    phrases2:[
      ['Vi conoscete?','Do you know each other?','Vi = you two.'],
      ['E il Suo amico?','And your friend? (polite)','To a friend: e il tuo amico?'],
      ['Benvenuto!','Welcome!','To a woman: benvenuta.'],
      ['Nessun problema!','No problem!',''],
      ['È questa!','This is it!','About something feminine, like la statua.'],
    ],
    extraTitle:'More directions', extraNote:"Paolo's directions are longer than Chiara's. These are the new words.",
    extra:[['fino a …','as far as …'],['attraversa il ponte','cross the bridge (to a friend)'],['attraversi','cross (polite)'],['il ponte','the bridge'],
           ['il fiume','the river'],['in fondo alla strada','at the end of the street'],['davanti a …','in front of …'],['la basilica','the basilica, a big church']],
    how:`<p><b>Questo</b> and <b>questa</b> both mean “this”. Use <b>questo</b> for a man or a masculine word, <b>questa</b> for a woman or a feminine word: <b>Questo è Mark.</b> <b>Questa è Chiara.</b> <b>Questa è la statua?</b></p>
      <p>Possessives come with the article: <b>il mio amico</b> (my friend, a man), <b>la mia amica</b> (my friend, a woman). Mio and mia match the friend, not you.</p>
      <p><b>Ti presento</b> means “I introduce to you” and is for friends. <b>Le presento</b> is the polite version, like <i>tu</i> and <i>Lei</i>.</p>
      <p>Talking <i>about</i> Mark uses the lui forms from Lezione 4: <b>è</b> (he is), <b>parla</b> (he speaks), <b>non parla italiano</b>.</p>
      <p>To check something, say it as a statement and raise your voice at the end: <b>Questa è la statua di Gattamelata?</b></p>`,
    culture:`<p>Italians introduce the people they are with. Leaving a friend standing there unintroduced feels rude. Expect a handshake and a <b>Piacere</b> on both sides.</p>
      <p>Address older strangers as <b>signora</b> (madam) or <b>signore</b> (sir): <i>Buongiorno, signora.</i></p>
      <p>Donatello's bronze <b>Gattamelata</b> (1453) was the first large equestrian statue cast in bronze since antiquity. It honours the mercenary captain Erasmo da Narni, nicknamed “Gattamelata”, often translated as “honeyed cat”. In real life it stands in Padua's Piazza del Santo, in front of the Basilica of Saint Anthony, which locals simply call <b>il Santo</b>.</p>`,
    exercises:[
      { type:'mc', q:'Introduce Mark to your friend Giulia.', opts:['Ti presento Mark.','Le presento Mark.','Mi chiamo Mark.'], a:0,
        why:'Giulia is a friend, so ti presento. Le presento is for strangers.', nudge:'Mi chiamo is about you. Which one is for a friend?' },
      { type:'mc', q:'Fill the gap: “___ è la mia amica Chiara.”', opts:['Questo','Questa'], a:1,
        why:'Chiara is a woman: questa è la mia amica.', nudge:'Look at amica.' },
      { type:'order', q:'Introduce Mark to Enzo, politely.', en:'May I introduce my friend Mark.', tiles:['Mark','Le presento','il mio amico'], answer:'le presento il mio amico mark',
        why:'Le presento il mio amico Mark.', nudge:'Start with the polite Le presento.' },
      { type:'mc', q:"Tell Paolo that Mark doesn't speak Italian.", opts:['Non parla italiano.','Non parlo italiano.','Non parli italiano.'], a:0,
        why:'Parla is the lui form. Parlo means “I speak”.', nudge:'You are talking about Mark: lui.' },
      { type:'mc', q:'Paolo says “Vai dritto fino alla banca.” What do you do?', opts:['Go straight as far as the bank','Turn at the first street','Go past the bank'], a:0, noSpeak:true,
        why:'Fino a = as far as.', nudge:'Fino a means “as far as”.' },
      { type:'mc', q:'“Attraversa il ponte” means…', opts:['Cross the bridge','Turn at the bridge','Wait at the bridge'], a:0, noSpeak:true,
        why:'Attraversare = to cross. Il ponte = the bridge.', nudge:'Check “More directions” in the lesson.' },
      { type:'order', q:'Ask a stranger if this is the statue of Gattamelata.', en:'Excuse me, is this the statue of Gattamelata?', tiles:['la statua di Gattamelata','questa è','scusi'], answer:'scusi questa è la statua di gattamelata',
        why:'Scusi, questa è la statua di Gattamelata?', nudge:'Scusi, then questa è, then the statue.' },
    ],
    doneTitle:'Perfetto! Time to introduce Mark.', doneGo:'Back to Paolo',
  });


/* Paolo's route on the city map (grid nodes). */
const ROUTE5 = [[2,4],[2,3],[3,3],[4,3],[5,3],[5,2],[5,1],[5,0]];   // Paolo's directions
