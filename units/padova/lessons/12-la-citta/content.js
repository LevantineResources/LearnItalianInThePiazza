/* Lesson 12 · Un giorno in città. Lesson data: the station as a place, Chiara's directions and route, the ticket
   office's tiles, the handbook chapter (train travel: tickets, times, platforms; partire / arrivare). Design:
   docs/lessons/12-la-citta.md; the town's quests: docs/features/quests-and-night.md. Data only (runs before the engine). */

/* the station is a place the parser knows: "dov'è la stazione?" → where:stazione */
PLACES.stazione = ['la stazione', 'The station'];
const L12_PLACE_TILE = { key:'la stazione', label:'la stazione', words:'la stazione', en:'the station', place:'stazione' };

/* Chiara → the station (tu). On the city map: north to the bank, left, straight on to the end of the street, then left:
   [2,4] (the piazza) → [2,3] (the bank) → [1,3] → [0,3] → [0,4] (the station, beside the park). Not Paolo's way to the
   museum: he turned left again at the first street ([1,3] → [1,4]). */
const L12_ROUTE = [[2, 4], [2, 3], [1, 3], [0, 3], [0, 4]];
const L12_CHIARA_DIR = {
  intro:{ it:'La stazione? Vai a Venezia? Che bello! Non è lontano.', en:"The station? Are you going to Venice? How lovely! It's not far." },
  lines:[
    { it:'Vai dritto fino alla banca.', en:'Go straight on as far as the bank.' },
    { it:'Alla banca gira a sinistra e vai sempre dritto.', en:'At the bank, turn left and keep going straight on.' },
    { it:'In fondo alla strada gira a sinistra.', en:'At the end of the street, turn left.' },
    { it:'La stazione è lì, in fondo.', en:"The station is there, at the end." },
  ],
  confirm:{
    left:{ it:'Sì: a sinistra alla banca, e in fondo ancora a sinistra.', en:'Yes: left at the bank, and at the end left again.' },
    right:{ it:'No, no! A sinistra, due volte.', en:'No, no! Left, twice.' },
    straight:{ it:'Sì, dritto fino alla banca. Poi sempre dritto fino in fondo.', en:'Yes, straight on to the bank. Then straight on to the end.' },
  },
  far:{ it:'No! Quindici minuti a piedi.', en:'No! Fifteen minutes on foot.' },
  route:true,
};

/* ---------- the ticket office's tiles ---------- */
const l12Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
/* "In stazione": tickets, days, times, platforms */
const L12_TILES = [
  l12Tile('per venezia', 'per Venezia', 'to Venice'),
  l12Tile('andata', 'andata', 'one way (a single)'),
  l12Tile('andata e ritorno', 'andata e ritorno', 'return (there and back)'),
  l12Tile('per oggi', 'per oggi', 'for today'),
  l12Tile('per stasera', 'per stasera', 'for this evening'),
  l12Tile('per domani', 'per domani', 'for tomorrow'),
  l12Tile('allora', 'Allora…', 'so… / well then…'),
  l12Tile('a che ora parte', 'A che ora parte?', 'what time does it leave?'),
  l12Tile('il prossimo treno', 'il prossimo treno', 'the next train'),
  l12Tile('da che binario parte', 'Da che binario parte?', 'which platform does it leave from?'),
  l12Tile('va bene', 'Va bene.', 'OK, all right'),
];

/* The handbook chapter */
LESSONS.push({
  n:12, title:'Un giorno in città', sub:'Trains, tickets and times',
  dlgNote:'At the ticket office of a station.',
  dialogue:[
    ['Tu', 'Buongiorno! Un biglietto per Venezia, per favore.', 'Good afternoon! A ticket to Venice, please.'],
    ['Impiegato', 'Per oggi o per domani?', 'For today or for tomorrow?'],
    ['Tu', 'Per oggi. A che ora parte il prossimo treno?', 'For today. What time does the next train leave?'],
    ['Impiegato', 'Il prossimo treno parte alle 18:40.', 'The next train leaves at 18:40.'],
    ['Tu', 'Va bene. Da che binario parte?', 'All right. Which platform does it leave from?'],
    ['Impiegato', 'Dal binario due. Andata o andata e ritorno?', 'From platform two. One way or return?'],
    ['Tu', 'Andata, per favore.', 'One way, please.'],
    ['Impiegato', 'Sono dodici euro. Buon viaggio!', "That's twelve euros. Have a good trip!"],
  ],
  pitches:{ Tu:1.1, Impiegato:0.86 },
  phrasesTitle:'What you say',
  phrases:[
    ['Un biglietto per Venezia, per favore.', 'A ticket to Venice, please.', 'Per + the place you are going to.'],
    ['Andata. / Andata e ritorno.', 'One way. / Return.', 'Andata = the going; ritorno = the coming back.'],
    ['A che ora parte il prossimo treno?', 'What time does the next train leave?', 'Parte: it leaves (partire).'],
    ['Da che binario parte?', 'Which platform does it leave from?', 'Il binario = the platform (and the track).'],
    ['Per oggi. / Per stasera. / Per domani mattina.', 'For today. / For this evening. / For tomorrow morning.', 'Per + the day or the time of day.'],
    ['Allora… per stasera.', 'Well then… for this evening.', 'Allora: so, well then. Italians start a decision with it.'],
  ],
  phrases2Title:"What you'll hear",
  phrases2:[
    ['Il treno è appena partito.', 'The train has just left.', 'Appena = just. Partito: left (you will meet this past tense on the train).'],
    ['Il primo treno parte alle …', 'The first train leaves at …', 'Listen for the hour: on the board it is in digits.'],
    ['in partenza · in arrivo', 'departing · arriving', 'On the board, next to a train that is about to go or to come in.'],
    ['in ritardo', 'late (delayed)', 'Il treno è in ritardo: the train is late. On a board: RITARDO 10’.'],
    ['Il biglietto, prego.', 'Your ticket, please.', 'What the conductor (il capotreno) says on the train.'],
    ['Buon viaggio!', 'Have a good trip!', 'Said to anyone setting off.'],
  ],
  how:`<p><b>Partire</b> (to leave, to depart) and <b>arrivare</b> (to arrive): the train is <i>it</i>, so the lui / lei form.</p>
    <table class="dirtable"><thead><tr><th></th><th>partire · to leave</th><th>arrivare · to arrive</th></tr></thead><tbody>
      <tr><td>il treno (it)</td><td><b>parte</b></td><td><b>arriva</b></td></tr>
      <tr><td>i treni (they)</td><td><b>partono</b></td><td>arrivano</td></tr></tbody></table>
    <p><i>Il treno per Venezia <b>parte</b> alle 23:15. I treni per Milano <b>partono</b> dal binario 4. Il treno da Roma <b>arriva</b> alle 18:20.</i></p>
    <p><b>When:</b> <b>oggi</b> (today), <b>domani</b> (tomorrow), <b>stamattina</b> (this morning), <b>stasera</b> (this evening), <b>stanotte</b> (tonight, in the night).
      With a ticket: <b>per</b> + the day: <i>per oggi</i>, <i>per stasera</i>, <i>per domani mattina</i>.</p>
    <p><b>Per</b> does two jobs here: <b>per Venezia</b> (to Venice: where you are going) and <b>per stasera</b> (for this evening: when).</p>
    <p><b>The 24-hour clock</b> (Lesson 10): boards and tickets use it. <i>23:15</i> is <b>le ventitré e quindici</b>; people may also say <i>le undici e un quarto di sera</i>.</p>
    <p class="note"><b>Da</b> + <b>il</b> joins up: <b>dal</b> binario tre (from platform three), like <i>a + il = al</i>.</p>`,
  culture:`<p>On regional trains a paper ticket has no date or time on it until you <b>validate</b> it (<i>convalidare</i>): put it in the
      <b>green machine</b> (<i>la macchinetta</i>) at the head of the platform before you get on. It stamps the date and time. Forget, and
      the conductor (<i>il capotreno</i>) can fine you.</p>
    <p>The yellow board says <b>Partenze</b> (departures); the white one says <b>Arrivi</b> (arrivals). Look for your train's time and its
      <b>binario</b>, then check it again: platforms change!</p>`,
  exercises:[
    { type:'mc', q:'A ticket to Venice, please: “Un biglietto ___ Venezia, per favore.”', opts:['a', 'per', 'di'], a:1, why:'A ticket to a place: un biglietto per Venezia.', nudge:'Which little word says where the ticket takes you?' },
    { type:'mc', q:'You want to go to Venice and come back. You ask for…', opts:['andata', 'andata e ritorno', 'ritorno'], a:1, why:'There and back: andata e ritorno.', nudge:'You want both: the going and the coming back.' },
    { type:'mc', q:'🕚 The board says 23:15. A che ora parte?', opts:['Parte alle ventitré e quindici.', 'Parte alle tre e un quarto.', 'Sono le ventitré.'], a:0, why:'23:15: le ventitré e quindici (24-hour, as on the board).', nudge:'Read the hour on the 24-hour clock: 23.' },
    { type:'order', q:'What time does the next train leave?', tiles:['parte', 'il prossimo treno', 'A che ora'], answer:'A che ora parte il prossimo treno', why:'A che ora parte il prossimo treno?', nudge:'Start with “at what time”, then the verb.' },
    { type:'mc', q:'“Il treno è appena partito.” The clerk means…', opts:['The train has just left.', 'The train is about to leave.', 'The train is late.'], a:0, why:'Appena partito: just left. (About to leave: in partenza. Late: in ritardo.)', nudge:'Appena = just.', noSpeak:true },
    { type:'mc', q:'A big yellow board says PARTENZE. It lists…', opts:['departures', 'arrivals', 'platforms'], a:0, why:'Partenze: departures (partire = to leave). Arrivals: arrivi.', nudge:'Think of partire.', noSpeak:true },
    { type:'mc', q:'“I treni per Milano ___ dal binario 4.”', opts:['parte', 'partono', 'partire'], a:1, why:'More than one train: they leave, partono.', nudge:'I treni: more than one.' },
    { type:'mc', q:'“Il treno da Roma ___ alle 18:20.”', opts:['arriva', 'arrivano', 'arrivare'], a:0, why:'One train: it arrives, arriva.', nudge:'Il treno: just one.' },
    { type:'mc', q:'You want a ticket for this evening: “Un biglietto per ___.”', opts:['stamattina', 'stasera', 'domani'], a:1, why:'This evening: stasera (sta + sera).', nudge:'La sera is the evening.' },
    { type:'mc', q:'“Da che binario parte?” “___ binario tre.”', opts:['Al', 'Dal', 'Del'], a:1, why:'From platform three: da + il = dal.', nudge:'From: da, joined to il.' },
    { type:'mc', q:'Before you get on a regional train with a paper ticket, you…', opts:['stamp it in the green machine', 'show it at the ticket office again', 'write your name on it'], a:0, why:'Convalidare: the green machine stamps the date and time.', nudge:'Read the culture note.', noSpeak:true },
    { type:'mc', q:'The clerk talks too fast. You say…', opts:['Scusa, puoi ripetere?', 'Scusi, può ripetere?', 'Ciao, ripeti!'], a:1, why:'A stranger at work: Lei. Scusi, può ripetere?', nudge:'He is a stranger at work.' },
  ],
  /* Vocabolario (≤ 50): the station, tickets, when, the verbs, and what you hear */
  vocab:[
    { group:'At the station', words:[
      { it:'la stazione', g:'f', en:'the station' },
      { it:'il treno', g:'m', en:'the train', also:['treni'] },
      { it:'il binario', g:'m', en:'the platform (and its track)', also:['binari'] },
      { it:'il prossimo treno', g:'m', en:'the next train' },
      { it:'Partenze', en:'Departures (on the board)', also:['partenze'] },
      { it:'Arrivi', en:'Arrivals (on the board)', also:['arrivi'] },
      { it:'Venezia', en:'Venice' },
      { it:'la macchinetta', g:'f', en:'the (ticket) machine' },
      { it:'convalidare', en:'to validate (stamp) a ticket', also:['convalidato', 'convalida'] },
      { it:'il capotreno', g:'m', en:'the conductor' },
      { it:'la carrozza', g:'f', en:'the carriage, the coach' },
    ] },
    { group:'A ticket', words:[
      { it:'un biglietto per …', say:'Un biglietto per Venezia.', en:'a ticket to …' },
      { it:'andata', en:'one way (a single)' },
      { it:'andata e ritorno', en:'return (there and back)', also:['ritorno'] },
      { it:'per oggi', en:'for today' },
      { it:'per stasera', en:'for this evening' },
      { it:'per domani mattina', en:'for tomorrow morning' },
      { it:'Allora…', en:'So… / well then…' },
      { it:'Va bene.', en:'OK, all right.' },
      { it:'Buon viaggio!', en:'Have a good trip!' },
    ] },
    { group:'When', note:'Sta- = this: stamattina, stasera, stanotte.', words:[
      { it:'oggi', en:'today' },
      { it:'domani', en:'tomorrow' },
      { it:'stamattina', en:'this morning' },
      { it:'stasera', en:'this evening' },
      { it:'stanotte', en:'tonight (in the night)' },
      { it:'la mattina', g:'f', en:'the morning', also:['mattina'] },
      { it:'il pomeriggio', g:'m', en:'the afternoon' },
      { it:'la sera', g:'f', en:'the evening' },
    ] },
    { group:'Leaving and arriving', words:[
      { it:'A che ora parte?', en:'What time does it leave?' },
      { it:'Da che binario parte?', en:'Which platform does it leave from?' },
      { it:'parte', en:'it leaves', note:'Il treno parte alle 23:15.' },
      { it:'partono', en:'they leave', note:'I treni partono dal binario 4.' },
      { it:'arriva', en:'it arrives', note:'Il treno arriva alle 18:20.' },
      { it:'dal binario …', say:'dal binario tre', en:'from platform …', note:'da + il = dal.', also:['dal'] },
      { it:'Presto!', en:'Quick! Hurry!' },
      { it:'adesso', en:'now (right now)', quiz:false },
    ] },
    { group:'What you hear', words:[
      { it:'Il treno è appena partito.', en:'The train has just left.', also:['appena', 'partito'] },
      { it:'in partenza', en:'departing' },
      { it:'in arrivo', en:'arriving' },
      { it:'in ritardo', en:'late, delayed' },
      { it:'Il biglietto, prego.', en:'Your ticket, please.' },
    ] },
  ],
  verbs:[
    { inf:'partire', en:'to leave, to depart', forms:[
      { p:'lui', it:'parte', en:'it leaves (the train leaves)', ex:'Il treno parte alle 23:15.' },
      { p:'loro', it:'partono', en:'they leave', ex:'I treni per Milano partono dal binario 4.' },
    ] },
    { inf:'arrivare', en:'to arrive', forms:[
      { p:'lui', it:'arriva', en:'it arrives (the train arrives)', ex:'Il treno da Roma arriva alle 18:20.' },
    ] },
  ],
  doneTitle:'Ready for the ticket office.', doneGo:'Back to the station',
});
