/* Lesson 13 · Il treno della notte. Lesson data: the tiles (the dinner's introductions: you and Margaret; the past with avere:
   ho / hai / ha / abbiamo + a participle; prima / dopo / anche; the things you did today, from Lesson 12's quests), Lina's
   questions about those quests, the la signora Ferri translation's words, and the handbook chapter (the passato prossimo with
   avere). Design: docs/lessons/13-il-treno-della-notte.md. Data only (runs before the engine). */

const l13Tile = (key, label, en, words) => ({ key, label, words:words || label.replace(/[?!.…]/g, '').toLowerCase(), en });

/* ---------- at dinner: introductions (Lessons 1–5 review, the polite forms), and introducing Margaret ---------- */
const L13_INTRO = [
  l13Tile('soc:buonasera', 'Buonasera', 'good evening (polite)', 'buonasera'),
  l13Tile('soc:elei', 'E Lei?', 'and you? (polite)', 'e lei'),
  l13Tile('soc:didove', "Di dov'è?", 'where are you from? (polite)', "di dov'è"),
  l13Tile('soc:inglese', 'Sono inglese.', "I'm English", 'sono inglese'),
  l13Tile('soc:arrivederci', 'Arrivederci', 'goodbye (polite)', 'arrivederci'),
];
/* Margaret: "Lei è Margaret. È inglese, di Londra. Non parla italiano." (Lesson 5's Le presento / Questa è / È inglese / Non
   parla italiano, and two of ours) */
const L13_L5 = k => { const t = L5_TILES.find(x => x.key === k); return { ...t, key:'mg:' + k }; };
const L13_MARG = [
  l13Tile('mg:lei è', 'Lei è', 'she is', 'lei è'),
  L13_L5('questa è'), L13_L5('le presento'), L13_L5('è inglese'),
  l13Tile('mg:londra', 'di Londra', 'from London', 'di Londra'),
  L13_L5('non parla italiano'),
];
/* ---------- the past with avere ---------- */
const L13_AUX = [
  l13Tile('aux:ho', 'Ho', 'I have (+ a participle: I did …)', 'ho'),
  l13Tile('aux:hai', 'Hai', 'you have (to a friend)', 'hai'),
  l13Tile('aux:ha', 'Ha', 'he / she has, you have (polite)', 'ha'),
  l13Tile('aux:abbiamo', 'Abbiamo', 'we have', 'abbiamo'),
];
/* the participles: [participle, infinitive, English] */
const L13_PP = [
  ['visto', 'vedere', 'seen'], ['preso', 'prendere', 'taken, had'], ['fatto', 'fare', 'done, made'], ['acceso', 'accendere', 'lit'],
  ['mangiato', 'mangiare', 'eaten'], ['assaggiato', 'assaggiare', 'tasted, tried'], ['comprato', 'comprare', 'bought'],
  ['aiutato', 'aiutare', 'helped'], ['portato', 'portare', 'brought, carried'], ['ballato', 'ballare', 'danced'],
  ['bevuto', 'bere', 'drunk'], ['sentito', 'sentire', 'heard'],
].map(([w, inf, en]) => ({ ...l13Tile('pp:' + w, w, `${en} (${inf})`, w), inf, pen:en }));
const L13_PP_OF = Object.fromEntries(L13_PP.map(t => [t.key.slice(3), t]));
const L13_WORDS = [
  l13Tile('w:oggi', 'oggi', 'today', 'oggi'),
  l13Tile('w:e', 'e', 'and', 'e'),
  l13Tile('w:poi', 'poi', 'then, after that', 'poi'),
  l13Tile('w:prima', 'prima', 'first, before', 'prima'),
  l13Tile('w:dopo', 'dopo', 'after, afterwards', 'dopo'),
  l13Tile('w:ma', 'ma', 'but', 'ma'),
  l13Tile('w:perché', 'perché', 'why? / because', 'perché'),
  l13Tile('w:quando', 'quando', 'when?', 'quando'),
];
/* "No, non ho assaggiato il gelato." (Lesson 4's non, for Lina's questions) */
const L13_NON = l13Tile('w:non', 'non', 'not', 'non');
/* "Prima di …": before doing something (prima di + the infinitive) */
const L13_BEFORE = [
  l13Tile('w:primadi', 'prima di', 'before (doing)', 'prima di'),
  l13Tile('inf:partire', 'partire', 'leaving (to leave)', 'partire'),
  l13Tile('inf:treno', 'prendere il treno', 'taking the train', 'prendere il treno'),
  l13Tile('inf:ballare', 'ballare', 'dancing (to dance)', 'ballare'),
];
/* what Lina and Ernesto add to a sentence that starts with "Prima di …" */
const L13_BEFORE_REPLY = {
  partire:['Prima di partire: giusto!', 'Before leaving: quite right!'],
  treno:['Prima del treno: brava, brava!', 'Before the train: well done!'],
  ballare:['Prima di ballare! Per avere energia, eh?', 'Before dancing! For energy, eh?'],
};
/* Margaret's interjection: "Anche Margaret ha visto la chiesa / la basilica." */
const L13_ANCHE = [
  l13Tile('w:anche', 'Anche', 'too, also', 'anche'),
  l13Tile('obj:chiesa', 'la chiesa', 'the church', 'la chiesa'),
];
/* Ernesto's "E perché Venezia?": a reason (after perché), and the question back */
const L13_WHY = [
  l13Tile('why:bella', 'è bellissima', "it's so beautiful (Venice)", 'è bellissima'),
  l13Tile('why:arte', "mi piace l'arte", 'I like art', "mi piace l'arte"),
  l13Tile('why:mare', "c'è il mare", "there's the sea", "c'è il mare"),
  l13Tile('ask:perche', 'E Lei, perché Venezia?', 'and you, why Venice? (polite)', 'e Lei perché Venezia'),
];
/* what Lina and Ernesto say to each reason: [Lina], [Ernesto] */
const L13_WHY_REPLY = {
  bella:{ lina:['Eh sì, è bellissima! I canali, le gondole…', "Oh yes, it's so beautiful! The canals, the gondolas…"],
    ernesto:['E il caffè in Piazza San Marco: carissimo! Ah ah!', "And coffee in St Mark's Square: so expensive! Ha ha!"] },
  arte:{ lina:["L'arte! Come Ernesto: lui adora Tiziano.", 'Art! Like Ernesto: he adores Titian.'],
    ernesto:['Sì! Deve vedere i Frari: Tiziano, bellissimo!', 'Yes! You must see the Frari: Titian, wonderful!'] },
  mare:{ lina:['Il mare, sì! E domani mattina, dal treno: la laguna!', 'The sea, yes! And tomorrow morning, from the train: the lagoon!'],
    ernesto:["Il mare all'alba… che bello!", 'The sea at dawn… how lovely!'] },
};
/* bedtime: asking Nino when the train gets to Venice */
const L13_WHEN = [
  l13Tile('when:arriviamo', 'arriviamo', 'we arrive (arrivare)', 'arriviamo'),
  l13Tile('when:venezia', 'a Venezia', 'in / to Venice', 'a Venezia'),
];
/* Nino's answer (a listening line): the time Lesson 14's morning fits (the dogs at 6:00 and 6:45, breakfast at 7:00, Venice after the dog is found) */
const L13_ARRIVE = { it:'Domani mattina, alle sette e mezza. Buonanotte!', en:'Tomorrow morning, at half past seven. Good night!', time:'7:30' };
const L13_ASK = [
  l13Tile('ask:cosa', 'Cosa ha fatto oggi?', 'what did you do today? (polite)', 'cosa ha fatto oggi'),
  l13Tile('soc:elei', 'E Lei?', 'and you? (polite)', 'e lei'),
  l13Tile('soc:chebello', 'Che bello!', 'how lovely!', 'che bello'),
  l13Tile('soc:si', 'Sì', 'yes', 'sì'),
  l13Tile('soc:buonanotte', 'Buonanotte', 'good night', 'buonanotte'),
];

/* ---------- your day in Padua: what you can say, from the quests you did in Lesson 12 ----------
   Keyed by the quest's number in the design's list (docs/lessons/12-la-citta.md). Each gives one or two things: { key, label (the
   tile), en, pp:[participles that make sense with it], locs?:[L13_LOC keys that can follow it: "al mercato", "sul ponte"…], said
   (built: "Ho comprato il formaggio al mercato."), reply:{ it, en } (what the Bassis say), replyLoc?:{ it, en } (said as well when a
   place or a "with whom" came with it), q?:{ it, en } (Lina's question about it: "Ha visto il tramonto sul ponte?"), food? }.
   With few quests done (fewer than 3: the skip, or a quick Lesson 12) every quest's things are in the bank, and Lina asks about
   any of them. L13_DAY_ANY: Lesson 12's own story (the ticket, the train), for everyone. */
const L13_LOC = {
  mamma:['a trovare la mamma', 'to find her mum'], farmacia:['in farmacia', "at the chemist's"], chiara:['a Chiara', 'to Chiara'],
  mercato:['al mercato', 'at the market'], basilica:['in basilica', 'in the basilica'], aquilone:["con l'aquilone", 'with the kite'],
  ponte:['sul ponte', 'on the bridge'], rosa:['con Rosa', 'with Rosa'],
};
const L13_DAY = {
  1:[ { key:'bambina', label:'una bambina', en:'a little girl', pp:['aiutato'], locs:['mamma'],
        reply:{ it:'Una bambina? Che gentile, {Me}!', en:'A little girl? How kind of you, {Me}!' },
        replyLoc:{ it:'E ha trovato la mamma? Che bella storia!', en:'And you found her mum? What a lovely story!' } } ],
  2:[ { key:'qualcosa', label:'qualcosa', en:'something', pp:['comprato', 'preso'], locs:['farmacia'],
        reply:{ it:'Qualcosa? Cosa? Ah ah, un mistero!', en:'Something? What? Ha ha, a mystery!' },
        replyLoc:{ it:'In farmacia? Niente di grave, spero!', en:"At the chemist's? Nothing serious, I hope!" } } ],
  3:[ { key:'messaggio', label:'un messaggio', en:'a message', pp:['portato'], locs:['chiara'],
        reply:{ it:'Un messaggio? Come un postino! Ah ah!', en:'A message? Like a postman! Ha ha!' },
        replyLoc:{ it:'A Chiara? Ha già tanti amici a Padova!', en:'To Chiara? You already have lots of friends in Padua!' } } ],
  4:[ { key:'formaggio', label:'il formaggio', en:'the cheese', pp:['comprato', 'assaggiato', 'mangiato', 'preso'], locs:['mercato'], food:true,
        q:{ it:"Ha comprato il formaggio al mercato? Noi sì: l'Asiago!", en:'Did you buy cheese at the market? We did: Asiago!' },
        reply:{ it:'Il formaggio! Buonissimo, vero?', en:"Cheese! Delicious, isn't it?" },
        replyLoc:{ it:'Al mercato coperto, sotto il Salone? Che bello!', en:'At the covered market, under the Salone? How lovely!' } } ],
  5:[ { key:'basilica', label:'la basilica', en:'the basilica', pp:['visto'],
        q:{ it:'Ha visto la basilica del Santo?', en:"Did you see Saint Anthony's basilica?" },
        reply:{ it:'La basilica del Santo! Bellissima, vero?', en:"Saint Anthony's basilica! Beautiful, isn't it?" } },
      { key:'candela', label:'una candela', en:'a candle', pp:['acceso'], locs:['basilica'],
        q:{ it:'Ha acceso una candela per il Santo?', en:'Did you light a candle for the Saint?' },
        reply:{ it:'Una candela? Che bello. Anch\'io, sempre!', en:'A candle? How lovely. Me too, always!' } } ],
  6:[ { key:'bambino', label:'un bambino', en:'a little boy', pp:['aiutato'], locs:['aquilone'],
        reply:{ it:'Un bambino? Che gentile!', en:'A little boy? How kind!' },
        replyLoc:{ it:"Con l'aquilone? Sull'albero? Ah ah, che giornata!", en:'With his kite? Up the tree? Ha ha, what a day!' } } ],
  7:[ { key:'caffe', label:'il caffè', en:'the coffee', pp:['preso', 'portato', 'bevuto', 'comprato'], food:true,
        q:{ it:'Ha preso un caffè in piazza? Al Bar Centrale?', en:'Did you have a coffee in the square? At Bar Centrale?' },
        reply:{ it:'Il caffè! Senza caffè, niente Italia!', en:'Coffee! No coffee, no Italy!' } } ],
  8:[ { key:'foto', label:'una foto', en:'a photo', pp:['fatto'], locs:['ponte'],
        q:{ it:'Ha fatto delle foto?', en:'Did you take any photos?' },
        reply:{ it:'Una foto? Che bello! Noi non abbiamo fatto foto.', en:"A photo? How lovely! We didn't take any photos." },
        replyLoc:{ it:'Sul ponte, sul fiume: che bella vista!', en:'On the bridge, over the river: what a lovely view!' } } ],
  9:[ { key:'gelato', label:'un gelato', en:'an ice cream', pp:['mangiato', 'assaggiato', 'preso', 'comprato'], food:true,
        q:{ it:'Ha assaggiato il gelato? A Padova è buonissimo!', en:'Did you try the ice cream? In Padua it is delicious!' },
        reply:{ it:'Un gelato! Io adoro il pistacchio!', en:'An ice cream! I love pistachio!' } } ],
  10:[ { key:'aperitivo', label:'un aperitivo', en:'an aperitif (a drink before dinner)', pp:['preso', 'bevuto'], locs:['rosa'], food:true,
        q:{ it:'Ha preso un aperitivo? Uno spritz, come i veneti?', en:'Did you have an aperitif? A spritz, like the people of the Veneto?' },
        reply:{ it:'Un aperitivo! Salute! Anche noi, ieri sera.', en:'An aperitif! Cheers! Us too, yesterday evening.' },
        replyLoc:{ it:'Con Rosa? Un\'amica di Padova! Che bello!', en:'With Rosa? A friend from Padua! How lovely!' } },
    ],
  11:[ { key:'tramonto', label:'il tramonto', en:'the sunset', pp:['visto'], locs:['ponte'],
        q:{ it:'Ha visto il tramonto sul ponte?', en:'Did you see the sunset from the bridge?' },
        reply:{ it:'Il tramonto! Che romantico!', en:'The sunset! How romantic!' },
        replyLoc:{ it:'Sul ponte, sul fiume: bellissimo!', en:'From the bridge, over the river: wonderful!' } } ],
  12:[ { key:'piazza', label:'in piazza', en:'in the square', pp:['ballato'],
        q:{ it:'Ha sentito la musica in piazza, stasera?', en:'Did you hear the music in the square this evening?' },
        reply:{ it:'Ha ballato in piazza? Che bello! Anche noi, cinquant\'anni fa!', en:'You danced in the square? How lovely! So did we, fifty years ago!' } } ],
};
const L13_DAY_ANY = [
  { key:'biglietto', label:'il biglietto', en:'the ticket', pp:['comprato', 'preso'], reply:{ it:'Il biglietto per Venezia, certo! Per questo treno!', en:'The ticket to Venice, of course! For this train!' } },
  { key:'treno', label:'il treno', en:'the train', pp:['preso'], reply:{ it:'Eh sì, il treno: siamo qui! Ah ah!', en:"Oh yes, the train: here we are! Ha ha!" } },
];
/* the order Lina picks her question from (the quests' own things; the designer's list first) */
const L13_ASK_ORDER = ['tramonto', 'basilica', 'gelato', 'foto', 'formaggio', 'aperitivo', 'piazza', 'caffe', 'candela'];
/* the "No, ma …" question when the player did every quest Lina could ask about (or did few: any day): the Scrovegni Chapel */
const L13_CHAPEL = { it:'Ha visto la Cappella degli Scrovegni? Noi sì: bellissima!', en:'Did you see the Scrovegni Chapel? We did: beautiful!' };
const l13AllItems = () => [...Object.entries(L13_DAY).flatMap(([n, ds]) => ds.map(d => ({ ...d, quest:+n }))), ...L13_DAY_ANY.map(d => ({ ...d, quest:0 }))];
const l13ObjTile = d => l13Tile('obj:' + d.key, d.label, d.en, d.label.toLowerCase());
const l13LocTile = k => l13Tile('loc:' + k, L13_LOC[k][0], L13_LOC[k][1], L13_LOC[k][0].toLowerCase());

/* ---------- la signora Ferri and Margaret: the typed translation's words ---------- */
const L13_FERRI = {
  open:{ it:'Ah, eccovi! Signora, che bel cane! È carino! Come si chiama?', en:"Ah, there you are! Madam, what a lovely dog! He's cute! What's his name?" },
  kids:{ it:'Biscuit! Che nome simpatico! I miei bambini amano i cani. Vogliono sempre un cane!', en:'Biscuit! What a nice name! My children love dogs. They always want a dog!' },
  end:{ it:'Ah ah, che dolce! Ma adesso i bambini, finalmente, dormono… Io sono stanchissima!', en:"Ha ha, how sweet! But now the children are finally asleep… I'm exhausted!" },
};

/* the handbook chapter */
LESSONS.push({
  n:13, title:'Il treno della notte', sub:'What you did today: the past with avere',
  dlgNote:'At dinner on the night train, the dining car. Margaret, at your table, speaks only English.',
  dialogue:[
    ['Lina', 'Buonasera! E Lei, cosa ha fatto oggi a Padova?', 'Good evening! And you, what did you do in Padua today?'],
    ['Tu', 'Prima ho visto la basilica, poi ho mangiato un gelato.', 'First I saw the basilica, then I had an ice cream.'],
    ['Ernesto', 'E dopo? Ha visto il tramonto sul ponte?', 'And after that? Did you see the sunset from the bridge?'],
    ['Tu', 'No, ma ho fatto una foto sul ponte!', 'No, but I took a photo on the bridge!'],
    ['Lina', 'Che bello! Noi abbiamo visto la Cappella degli Scrovegni.', 'How lovely! We saw the Scrovegni Chapel.'],
    ['Tu', 'Anche Margaret ha visto la Cappella!', 'Margaret saw the chapel too!'],
    ['Ernesto', 'Anche la signora! E perché Venezia?', 'The lady too! And why Venice?'],
    ['Tu', 'Perché è bellissima! E Lei, perché Venezia?', "Because it's so beautiful! And you, why Venice?"],
    ['Lina', "Per il nostro anniversario: cinquant'anni! … Buonanotte!", 'For our anniversary: fifty years! … Good night!'],
  ],
  pitches:{ Lina:1.05, Tu:1.1, Ernesto:0.72 },
  phrasesTitle:'What you say',
  phrases:[
    ['Ho visto la basilica.', 'I saw the basilica. / I have seen the basilica.', 'Ho + visto (vedere). One Italian past for both English ones.'],
    ['Ho aiutato un bambino con l\'aquilone.', 'I helped a little boy with his kite.', '-are verbs: aiutare → aiutato.'],
    ['Ho acceso una candela.', 'I lit a candle.', 'accendere → acceso: irregular.'],
    ['Prima ho visto la basilica, poi ho mangiato un gelato.', 'First I saw the basilica, then I had an ice cream.', 'Prima … poi …: first … then …'],
    ['Prima di ballare, ho mangiato con un\'amica.', 'Before dancing, I ate with a friend.', 'Prima di + the verb as it is in the dictionary (ballare).'],
    ['Dopo, ho visto il tramonto.', 'After that, I saw the sunset.', 'Dopo = after, afterwards.'],
    ['Anche Margaret ha visto la chiesa.', 'Margaret saw the church too.', 'Anche (too, also) goes before the person. Margaret is she: ha.'],
    ['No, ma ho visto il museo.', 'No, but I saw the museum.', 'Ma (but, from Lesson 2) joins two halves of a sentence: now with the past.'],
    ['Perché è bellissima!', "Because it's so beautiful!", 'Perché = because… and also why? (E perché Venezia? And why Venice?)'],
    ['Quando arriviamo a Venezia?', 'When do we get to Venice?', 'Quando = when. Arriviamo = we arrive (arrivare: il treno arriva).'],
  ],
  phrases2Title:"What you'll hear",
  phrases2:[
    ['Ha visto il tramonto?', 'Did you see the sunset?', 'A question is the same sentence with a question in your voice.'],
    ['Ha assaggiato il gelato?', 'Did you try the ice cream?', 'Assaggiare = to taste, to try (food).'],
    ['E dopo?', 'And after that?', 'To keep your story going. (E poi? is the same.)'],
    ['Abbiamo visto la Cappella.', 'We saw the chapel.', 'Abbiamo = we have: abbiamo + the participle.'],
    ['È carino! Come si chiama?', "He's cute! What's his name?", 'Si chiama… = his / her name is… (Mi chiamo: my name is).'],
    ['I miei bambini amano i cani.', 'My children love dogs.', 'Amare (to love): lui ama, loro amano.'],
    ['Buonanotte!', 'Good night!', 'When you (or they) go to bed.'],
  ],
  how:`<p><b>Il passato prossimo</b>: what you did. Two words: the present of <b>avere</b> + the <b>past participle</b> of the verb.</p>
    <table class="dirtable"><thead><tr><th></th><th>avere</th><th>+ participle</th></tr></thead><tbody>
      <tr><td>io</td><td><b>ho</b></td><td>visto · I saw</td></tr>
      <tr><td>tu</td><td><b>hai</b></td><td>visto · you saw (a friend)</td></tr>
      <tr><td>Lei · lui · lei</td><td><b>ha</b></td><td>visto · you saw (polite) · he / she saw</td></tr>
      <tr><td>noi</td><td><b>abbiamo</b></td><td>visto · we saw</td></tr></tbody></table>
    <p><b>The participle:</b> change the ending of the infinitive.</p>
    <table class="dirtable"><thead><tr><th>-are → -ato</th><th>-ere → -uto</th><th>-ire → -ito</th></tr></thead><tbody>
      <tr><td>mangiare → <b>mangiato</b></td><td>(avere → <b>avuto</b>)</td><td>sentire → <b>sentito</b></td></tr>
      <tr><td>comprare → <b>comprato</b></td><td>bere → <b>bevuto</b> (from the old <i>bevere</i>)</td><td></td></tr>
      <tr><td>aiutare → <b>aiutato</b></td><td></td><td></td></tr></tbody></table>
    <p><b>Irregular</b> (learn them as words): vedere → <b>visto</b>, prendere → <b>preso</b>, fare → <b>fatto</b>, accendere → <b>acceso</b>, dire → <b>detto</b>, leggere → <b>letto</b>.</p>
    <p>The participle doesn't change with the person: <i>ho visto, ha visto, abbiamo visto</i>. Only <i>avere</i> changes.</p>
    <p><b>When:</b> <b>oggi</b> (today), <b>ieri</b> (yesterday), <b>stasera</b> (this evening). <i>Oggi ho visto la basilica.</i></p>
    <p><b>Prima, dopo: the order of your day.</b></p>
    <table class="dirtable"><tbody>
      <tr><td><b>prima</b> · first, before</td><td><i><b>Prima</b> ho visto la basilica, <b>poi</b> ho mangiato un gelato.</i></td></tr>
      <tr><td><b>prima di</b> + a verb · before (doing)</td><td><i><b>Prima di</b> ballare, ho mangiato con un'amica.</i> The verb stays as it is in the dictionary: <i>ballare, partire, prendere il treno</i>.</td></tr>
      <tr><td><b>dopo</b> · after, afterwards</td><td><i><b>Dopo</b>, ho visto il tramonto.</i> · <i><b>Dopo</b> cena…</i> (after dinner…)</td></tr></tbody></table>
    <p><b>Anche</b> · too, also. It goes before the person: <i><b>Anche</b> Margaret ha visto la chiesa.</i> (Margaret is <i>she</i>: <b>ha</b>.)</p>
    <p><b>Joining words.</b> A story is more than a list: join what you did with these little words. <i>E, poi, ma</i> you know from Lesson 2; <b>perché</b> and <b>quando</b> are new.</p>
    <table class="dirtable"><tbody>
      <tr><td><b>e</b> · and</td><td><i>Ho visto il museo <b>e</b> ho mangiato un gelato.</i></td></tr>
      <tr><td><b>poi</b> · then</td><td><i>Ho preso un caffè, <b>poi</b> ho visto la basilica.</i></td></tr>
      <tr><td><b>ma</b> · but</td><td><i>Non ho visto la Cappella, <b>ma</b> ho visto il museo.</i> · <i>No, <b>ma</b> ho fatto una foto!</i></td></tr>
      <tr><td><b>perché</b> · why? / because</td><td><i><b>Perché</b> Venezia? <b>Perché</b> c'è il mare!</i> One word for both: the question and the answer.</td></tr>
      <tr><td><b>quando</b> · when?</td><td><i><b>Quando</b> arriviamo a Venezia?</i> (arrivare: il treno <i>arriva</i>, noi <i>arriviamo</i>)</td></tr></tbody></table>
    <p>Each half after <i>e, poi, ma</i> keeps its own <i>ho</i>: <i>Ho visto il museo <b>e poi ho</b> preso il treno.</i></p>
    <p class="note">Not yet: <i>I went, I arrived</i> take <b>essere</b>, not avere (<i>sono andato</i>). That's another lesson.</p>`,
  culture:`<p>Italians dine late, and on a night train the dining car stays open long after the train has left: nobody is in a hurry. Strangers at the next table
      chat as if they had known you for years: <i>Di dov'è? Cosa ha fatto oggi?</i> is ordinary small talk, and telling them about
      your day is the polite answer.</p>
    <p>On a night train you sleep in a <b>cabina</b> (a compartment) on a <b>cuccetta</b> (a bunk). Say <b>Buonanotte!</b> to your
      neighbours in the corridor: you'll see them at breakfast.</p>`,
  /* (the rule items use verbs that are not on the cards or in How it works, so the review never gives the answer away) */
  exercises:[
    { type:'mc', q:'I helped a little boy: “___ aiutato un bambino.”', opts:['Ho', 'Ha', 'Abbiamo'], a:0, why:'Io → ho: ho aiutato.', nudge:'About yourself: the io form of avere.' },
    { type:'mc', q:'parlare (to talk) → ?', opts:['parlato', 'parluto', 'parlito'], a:0, why:'-are verbs: -ato. Ho parlato con Lina.', nudge:'Look at the ending of the infinitive: -are.' },
    { type:'mc', q:'dormire (to sleep) → ?', opts:['dormato', 'dormuto', 'dormito'], a:2, why:'-ire verbs: -ito. Ho dormito bene.', nudge:'Look at the ending of the infinitive: -ire.' },
    { type:'mc', q:'Lina: “Ha visto la Cappella degli Scrovegni?” You didn\'t, but you saw the basilica. You say: “No, ___ ho visto la basilica.”', opts:['ma', 'e', 'perché'], a:0, why:'Ma = but: No, ma ho visto la basilica. (E = and, perché = because.)', nudge:'Not and, not because: the other one.' },
    { type:'order', q:'First I saw the basilica, then I had an ice cream.', tiles:['poi', 'ho mangiato un gelato', 'Prima', 'ho visto la basilica'], answer:'Prima ho visto la basilica poi ho mangiato un gelato', why:'Prima … poi …: first … then …', nudge:'Start with the word for first.' },
    { type:'mc', q:'“Prima di ballare, ho mangiato con un\'amica.” What happened first?', opts:['I ate with a friend.', 'I danced.', 'I danced with a friend.'], a:0, why:'Prima di ballare = before dancing: first you ate, then you danced.', nudge:'Prima di … = before …', noSpeak:true },
    { type:'mc', q:'Ernesto: “E dopo?” He wants to know…', opts:['what you did after that', 'what you did before', 'why you did it'], a:0, why:'Dopo = after, afterwards. E dopo? = and after that?', nudge:'The opposite of prima.', noSpeak:true },
    { type:'order', q:'Margaret saw the church too.', tiles:['ha visto', 'Anche', 'la chiesa', 'Margaret'], answer:'Anche Margaret ha visto la chiesa', why:'Anche goes before the person; Margaret is she: ha visto.', nudge:'Start with the word for too.' },
    { type:'mc', q:'Margaret ate an ice cream: “Margaret ___ mangiato un gelato.”', opts:['ho', 'ha', 'abbiamo'], a:1, why:'Margaret = she: ha mangiato.', nudge:'Not I, not we: she.' },
    { type:'order', q:'Ernesto: “E perché Venezia?” Answer: Because it\'s so beautiful!', tiles:['bellissima', 'Perché', 'è'], answer:'Perché è bellissima', why:'Perché è bellissima! Perché is the question (why?) and the answer (because).', nudge:'Start with the word for because.' },
    { type:'mc', q:'Lina asks you: “Ha assaggiato il gelato?” She means…', opts:['Did you try the ice cream?', 'Did you buy an ice cream?', 'Do you like ice cream?'], a:0, why:'Ha assaggiato: the past of assaggiare (to taste, to try).', nudge:'Ha + a participle: something you did.', noSpeak:true },
    { type:'mc', q:'Which one is right?', opts:['Ho vedere il tramonto.', 'Ho visto il tramonto.', 'Visto ho il tramonto.'], a:1, why:'Ho + the participle (visto), in that order.', nudge:'Avere, then the participle.' },
  ],
  /* Vocabolario (≤ 50): the past with avere, prima / dopo / anche, dinner and the dog, the things of your day (listed, no cards:
     each quest's own scheda teaches them) */
  vocab:[
    { group:'The past with avere', note:'Avere (ho, hai, ha, abbiamo) + the participle.', words:[
      { it:'ho visto', en:'I saw, I have seen', also:['ho'] },
      { it:'ha visto', en:'you saw (polite); he / she saw', also:['ha'] },
      { it:'abbiamo visto', en:'we saw', also:['abbiamo'] },
      { it:'Cosa ha fatto oggi?', en:'What did you do today? (polite)', also:['cosa'] },
    ] },
    { group:'Participles', note:'-are → -ato, -ere → -uto, -ire → -ito; and some irregular ones.', words:[
      { it:'visto', en:'seen', note:'vedere: irregular.' },
      { it:'preso', en:'taken, had (a coffee, a train)', note:'prendere: irregular.' },
      { it:'fatto', en:'done, made', note:'fare: irregular. Ho fatto una foto: I took a photo.' },
      { it:'acceso', en:'lit (a candle)', note:'accendere: irregular.' },
      { it:'mangiato', en:'eaten', note:'mangiare.' },
      { it:'assaggiato', en:'tasted, tried (food)', note:'assaggiare.' },
      { it:'comprato', en:'bought', note:'comprare.' },
      { it:'aiutato', en:'helped', note:'aiutare.' },
      { it:'portato', en:'brought, carried', note:'portare.' },
      { it:'ballato', en:'danced', note:'ballare.' },
      { it:'bevuto', en:'drunk (a drink)', note:'bere.' },
      { it:'sentito', en:'heard', note:'sentire.' },
    ] },
    { group:'Before, after, too', words:[
      { it:'ieri', en:'yesterday', note:'Ieri sera: yesterday evening, last night. Oggi: today.' },
      { it:'prima', en:'first, before', note:'Prima ho visto la basilica, poi…' },
      { it:'prima di…', en:'before (doing something)', note:'Prima di ballare, ho mangiato. Prima di partire.', also:['partire', 'prendere', 'ballare'] },
      { it:'dopo', en:'after, afterwards', note:'Dopo, ho visto il tramonto. Dopo cena: after dinner.' },
      { it:'anche', en:'too, also', note:'Anche Margaret ha visto la chiesa.' },
    ] },
    { group:'Joining words', note:'E, poi, ma: you know them from Lesson 2 (listed, no cards). Perché and quando are new.', words:[
      { it:'e, poi, ma', en:'and, then, but', quiz:false, note:'Prima ho visto la basilica, poi… · No, ma ho visto il museo.', also:['e', 'poi', 'ma'] },
      { it:'perché', en:'why?, because', note:'E perché Venezia? Perché è bellissima! One word for both.' },
      { it:'quando', en:'when?', note:'Quando arriviamo a Venezia?' },
    ] },
    { group:'At dinner', note:'Strangers: the polite forms (Lei).', words:[
      { it:'Lei è…', en:'she is…', note:'Lei è Margaret. (Lei is also the polite you: Lei è inglese? Are you English?)', also:['lei'] },
      { it:'di Londra', en:'from London', also:['londra'] },
      { it:'Buonasera!', en:'Good evening!', also:['buonasera'] },
      { it:'Buonanotte!', en:'Good night!', also:['buonanotte'] },
      { it:'arriviamo', en:'we arrive', note:'Arrivare: il treno arriva (it arrives), arriviamo (we arrive).' },
      { it:'il macchinista', g:'m', en:'the train driver', note:'Gianni, at the counter, eating fast.', also:['macchinista'] },
    ] },
    { group:'The dog', words:[
      { it:'il cane', g:'m', en:'the dog', note:'I cani: the dogs.', also:['cani'] },
      { it:'È carino!', en:"He's cute! (a dog, a little boy)", also:['carino', 'carina'] },
      { it:'si chiama', en:'his / her name is', note:'Come si chiama? What is his (her, your) name?', also:['si', 'chiama'] },
      { it:'i bambini', g:'m pl', en:'the children', note:'Un bambino, una bambina; i bambini. I miei bambini: my children.', also:['bambino', 'bambina'] },
      { it:'ama, amano', en:'he / she loves, they love', note:'Amare: Biscuit ama i bambini. I bambini amano i cani.', also:['ama', 'amano'] },
    ] },
    { group:'Why Venice?', words:[
      { it:'È bellissima!', en:"It's so beautiful! (a feminine thing)", also:['è', 'bellissima', 'bellissimo'], note:'Venezia è bellissima. Il museo è bellissimo.' },
      { it:"l'arte", g:'f', en:'art', note:"Mi piace l'arte." },
      { it:'il mare', g:'m', en:'the sea', note:"Venezia: c'è il mare." },
    ] },
    { group:'Your day in Padua', note:'The things of the tasks you did in town (each task\'s scheda teaches them): in your tile bank at dinner.', words:[
      { it:'la basilica', g:'f', en:'the basilica', note:'La basilica del Santo: the big church of Saint Anthony.' },
      { it:'la mamma', g:'f', en:'mum', quiz:false, also:['trovare'] },
      { it:'qualcosa', en:'something', quiz:false },
      { it:'il messaggio', g:'m', en:'the message', quiz:false },
      { it:'la candela', g:'f', en:'the candle', quiz:false },
      { it:"l'aquilone", g:'m', en:'the kite', quiz:false },
      { it:'la foto', g:'f', en:'the photo', quiz:false },
      { it:'il gelato', g:'m', en:'the ice cream', quiz:false },
      { it:'il tramonto', g:'m', en:'the sunset', quiz:false },
      { it:"l'aperitivo", g:'m', en:'the aperitif (a drink before dinner)', quiz:false, also:['aperitivo'] },
      { it:'sul ponte', en:'on the bridge', quiz:false, also:['ponte'] },
      { it:'in piazza', en:'in the square', quiz:false, also:['piazza'] },
    ] },
  ],
  /* (no verbs list: the Verbi drill's passato prossimo entries for Lesson 13, mangiare … sentire with lesson:13, mood:'past', live with
     Lesson 14's content; abbiamo is taught here inside the past, abbiamo visto) */
  doneTitle:'Ready to tell your day.', doneGo:'Close the handbook',
});
