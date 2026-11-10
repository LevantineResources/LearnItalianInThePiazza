/* Lesson 15 · Venezia: the content (docs/lessons/15-venezia.md). The tiles, the lines the people say, Margaret's lines, the hints,
   and the handbook chapter: the vaporetto's words, the unit in one page, the water buses; its Vocabolario (≤ 50), practice (12)
   and verbs. The flow is flow.js; the conversations convos.js; the unit-completion screen, free play and replays unit.js.

   Tiles. Every tile of ours is read by its key (convos.js reads the whole turn from the tiles used), and goes to the parser as one
   token of its own ('@15:<key>'), so no other lesson's reading of the same words (Lesson 2's un caffè, Lesson 3's dov'è) answers
   before ours; a tile with raw:true goes as its plain words instead (Scusi, Arrivederci, per favore, Grazie mille: the brain's own
   intents, which reach our react hook). q: a question (a "?" at its sentence's end), ex: an exclamation, cl: it starts a sentence. */
const L15_N = 15;
const l15T = (key, label, en, o = {}) => ({ key:'v:' + key, label, words:o.words || label.replace(/[?!.…]/g, '').replace(/\s+/g, ' ').trim(), en, ...o });
const L15_TILES = {
  /* manners (Lei: everyone here is a stranger) */
  cortesia:[
    l15T('scusi', 'Scusi', 'excuse me (polite)', { raw:true }),
    l15T('per favore', 'per favore', 'please', { raw:true }),
    l15T('grazie mille', 'Grazie mille', 'thank you very much', { raw:true }),
    l15T('arrivederci', 'Arrivederci', 'goodbye (polite)', { raw:true }),
  ],
  /* the information desk, properly (after the handbook): Scusi, dov'è la fermata del vaporetto per San Marco? */
  strada:[
    l15T("dov'è", "Dov'è", 'where is…?', { q:true, cl:true }),
    l15T('la fermata', 'la fermata', 'the stop'),
    l15T('del vaporetto', 'del vaporetto', 'of the vaporetto (the water bus)'),
    l15T('il vaporetto', 'il vaporetto', 'the vaporetto (the water bus)'),
    l15T('per san marco', 'per San Marco', 'to San Marco'),
    l15T('a destra', 'A destra?', 'to the right?', { q:true, cl:true }),
    l15T('a sinistra', 'A sinistra?', 'to the left?', { q:true, cl:true }),
    l15T('può ripetere', 'Può ripetere?', 'can you say that again? (polite)', { q:true, cl:true }),
    l15T('è lontano', 'È lontano?', 'is it far?', { q:true, cl:true }),
  ],
  /* the ACTV booth */
  biglietti:[
    l15T('un biglietto', 'un biglietto', 'a ticket'),
    l15T('due', 'due', 'two'),
    l15T('biglietto', 'biglietto', 'ticket (one)'),
    l15T('biglietti', 'biglietti', 'tickets (more than one)'),
    l15T('per san marco', 'per San Marco', 'to San Marco'),
    l15T('a che ora parte', 'A che ora parte', 'what time does … leave?', { q:true, cl:true }),
    l15T('il prossimo vaporetto', 'il prossimo vaporetto', 'the next vaporetto'),
    l15T('il vaporetto', 'il vaporetto', 'the vaporetto (the water bus)'),
    l15T("quant'è", "Quant'è?", 'how much is it?', { raw:true }),
    l15T('quanto costa', 'Quanto costa?', 'how much does it cost?', { q:true, cl:true }),
  ],
  cane:[
    l15T('e il cane', 'E il cane?', 'and the dog?', { q:true, cl:true }),
    l15T('il cane paga', 'Il cane paga?', 'does the dog pay?', { q:true, cl:true }),
  ],
  /* the station bar: for both of you (per me / per lei), what's in the cornetti */
  bar:[
    l15T('vorrei', 'Vorrei', 'I would like', { raw:true }),
    l15T('per me', 'per me', 'for me'),
    l15T('per lei', 'per lei', 'for her'),
    l15T('un caffè', 'un caffè', 'an espresso'),
    l15T('un cappuccino', 'un cappuccino', 'a cappuccino'),
    l15T('un tè', 'un tè', 'a tea'),
    l15T('un cornetto', 'un cornetto', 'a croissant'),
    l15T('due cornetti', 'due cornetti', 'two croissants'),
    l15T('vuoto', 'vuoto', 'plain (nothing inside: one)'),
    l15T('vuoti', 'vuoti', 'plain (more than one)'),
    l15T('alla crema', 'alla crema', 'with custard'),
    l15T('alla marmellata', 'alla marmellata', 'with jam'),
    l15T('al cioccolato', 'al cioccolato', 'with chocolate'),
    l15T('anche', 'anche', 'too, also'),
    l15T('lo stesso', 'lo stesso', 'the same'),
    l15T('che cornetti avete', 'Che cornetti avete?', 'what kind of croissants do you have?', { q:true, cl:true }),
    l15T("quant'è", "Quant'è?", 'how much is it?', { raw:true }),
  ],
  /* il signor Bepi: who you are, the train, Padova, Venice or Padova, Margaret's news, the compliment */
  noi:[
    l15T('sì certo', 'Sì, certo!', 'yes, of course!', { ex:true, cl:true }),
    l15T('lei è margaret', 'Lei è Margaret', 'this is Margaret (she is Margaret)', { cl:true, keep:true }),
    l15T('è inglese', 'è inglese', 'she is English', { cl:true }),
    l15T('non parla italiano', 'non parla italiano', "she doesn't speak Italian", { cl:true }),
  ],
  viaggio:[
    l15T('abbiamo preso', 'Abbiamo preso', 'we took', { cl:true }),
    l15T('il treno di notte', 'il treno di notte', 'the night train'),
    l15T('da padova', 'da Padova', 'from Padova'),
    l15T('mi è piaciuto molto', 'Mi è piaciuto molto!', 'I liked it a lot!', { ex:true, cl:true }),
    l15T('molto', 'molto', 'a lot, very'),
  ],
  confronto:[
    l15T('venezia', 'Venezia', 'Venice', { keep:true, cl:true }),
    l15T('padova', 'Padova', 'Padua', { keep:true }),
    l15T('è', 'è', 'is'),
    l15T('più', 'più', 'more'),
    l15T('bella', 'bella', 'beautiful (a feminine thing)'),
    l15T('bello', 'bello', 'beautiful (a masculine thing)'),
    l15T('tranquilla', 'tranquilla', 'quiet, peaceful (a feminine thing)'),
    l15T('grande', 'grande', 'big'),
    l15T('di padova', 'di Padova', 'than Padova'),
    l15T('di venezia', 'di Venezia', 'than Venezia'),
  ],
  biscuit:[
    l15T('biscuit', 'Biscuit', 'Biscuit (Margaret\'s dog)', { keep:true, cl:true }),
    l15T('ha trovato', 'ha trovato', 'has found'),
    l15T('una famiglia', 'una famiglia', 'a family'),
    l15T('sul treno', 'sul treno', 'on the train'),
  ],
  saluti:[
    l15T('sto imparando', 'Sto imparando.', "I'm learning.", { cl:true }),
  ],
};
/* the half-English try at the information desk (the barrier, like Lesson 7's "Quant'è… the blue shirt?"): one tile, three tokens */
const L15_BOAT_TILE = () => ({ key:'v:boat', label:"Dov'è… the boat… per San Marco?", gloss:"Where is… (Italian) the boat (English) … to San Marco? (Italian)", cls:'mixed',
  tokens:[{ w:'@15:dov\'è', label:"Dov'è…" }, { w:'@15:boat', label:'the boat…' }, { w:'@15:per_san_marco', label:'per San Marco' }] });
/* every tile of ours, once (the dictionary, the vocab audit) */
const L15_BANK = (() => { const seen = new Set(); return Object.values(L15_TILES).flat().filter(t => !seen.has(t.key) && seen.add(t.key)); })();
/* the token a tile goes to the parser as */
const l15W = t => t.raw ? null : '@15:' + t.key.slice(2).replace(/\s+/g, '_');

/* ---------- what people say ---------- */
const L15_LINES = {
  /* the information desk */
  desk:{
    opening:{ it:'Buongiorno! Mi dica.', en:'Good morning! How can I help?' },
    revisit:{ it:'Sì? Mi dica!', en:'Yes? How can I help?' },
    piacere:{ it:'Piacere, {Me}! Come posso aiutarLa?', en:'Nice to meet you, {Me}! How can I help you?' },
    how:{ it:'Bene, grazie! Mi dica.', en:'Fine, thanks! How can I help?' },
    /* the barrier: he catches "the boat" */
    boat:{ it:'La barca? Ah, il vaporetto! Il vaporetto per San Marco… alla fermata Ferrovia, qui davanti.', en:'The boat? Ah, the vaporetto! The vaporetto to San Marco… at the Ferrovia stop, right out in front.' },
    huh:{ it:'Mi scusi? Non capisco.', en:"Sorry? I don't understand." },
    /* properly, after the handbook */
    perDove:{ it:'Il vaporetto? Sì, ma per dove?', en:'The vaporetto? Yes, but to where?' },
    dir:[
      { it:'Il vaporetto per San Marco? Allora: esca dalla stazione e scenda i gradini.', en:'The vaporetto to San Marco? So: go out of the station and down the steps.' },
      { it:'Poi giri a destra: la fermata è lì, sul canale.', en:"Then turn right: the stop is there, on the canal." },
      { it:'Prenda la linea 1 o la linea 2.', en:'Take line 1 or line 2.' },
    ],
    right:{ it:'Sì, a destra. La fermata è lì, sul canale.', en:'Yes, to the right. The stop is there, on the canal.' },
    left:{ it:'No, no: a destra! A sinistra c\'è il ponte.', en:'No, no: to the right! On the left is the bridge.' },
    far:{ it:'No, è qui davanti! Due minuti a piedi.', en:"No, it's right out in front! Two minutes on foot." },
    bye:{ it:'Prego! Arrivederci, e buon viaggio!', en:"You're welcome! Goodbye, and have a good trip!" },
    thanks:{ it:'Prego!', en:"You're welcome!" },
    ciao:{ it:'Ciao… cioè, arrivederci!', en:'Bye… I mean, goodbye!' },
  },
  /* the ACTV booth */
  actv:{
    opening:{ it:'Buongiorno! Dica.', en:'Good morning! Go ahead.' },
    revisit:{ it:'Sì? Dica!', en:'Yes? Go ahead!' },
    one:{ it:'Un biglietto? Uno? E la signora?', en:'One ticket? Just one? And the lady?' },
    plural:{ it:'Due… biglietto?', en:'Two… ticket?' },
    howMany:{ it:'Biglietti? Quanti?', en:'Tickets? How many?' },
    two:{ it:'Due biglietti per San Marco, da settantacinque minuti. Ecco!', en:"Two tickets to San Marco, 75-minute ones. Here you are!" },
    twoNoPlace:{ it:'Due biglietti… per San Marco, vero? Da settantacinque minuti. Ecco!', en:"Two tickets… to San Marco, right? 75-minute ones. Here you are!" },
    price:{ it:'Sono diciannove euro.', en:"That's nineteen euros." },
    priceBefore:{ it:'Un biglietto costa nove euro e cinquanta: è lì, sul cartello. Quanti biglietti?', en:'A ticket costs nine euros fifty: it\'s there, on the sign. How many tickets?' },
    time:{ it:'Il prossimo parte alle nove e dieci, dalla fermata B.', en:'The next one leaves at ten past nine, from stop B.' },
    dog:{ it:'No, il cane non paga. Ma deve avere il guinzaglio e la museruola… o in braccio, se è piccolo!', en:"No, the dog doesn't pay. But it must have a lead and a muzzle… or be carried, if it's small!" },
    paid:{ it:'Grazie! Ecco il resto, e i biglietti.', en:'Thank you! Here is your change, and the tickets.' },
    thanks:{ it:'Prego!', en:"You're welcome!" },
    bye:{ it:'Arrivederci! Buon viaggio!', en:'Goodbye! Have a good trip!' },
    hello:{ it:'Buongiorno!', en:'Good morning!' },
    huh:{ it:'Prego? Biglietti?', en:'Sorry? Tickets?' },
  },
  /* the station bar */
  bar:{
    opening:{ it:'Buongiorno! Cosa prende?', en:'Good morning! What will you have?' },
    revisit:{ it:'Ancora qualcosa?', en:'Anything else?' },
    kinds:{ it:'Abbiamo cornetti vuoti, alla crema, alla marmellata e al cioccolato.', en:'We have plain croissants, custard ones, jam ones and chocolate ones.' },
    huh:{ it:'Prego? Cosa prende?', en:'Sorry? What will you have?' },
    more:{ it:'Sì… e per la signora?', en:'Yes… and for the lady?' },
    /* the order, taken for each of you (convos.js l15BarTurn): echoed back, then confirmed */
    which:{ it:'Che cornetto? Vuoto, alla crema, alla marmellata o al cioccolato?', en:'Which croissant? Plain, custard, jam or chocolate?' },
    whichAgain:{ it:'Sì… ma quale? Vuoto, alla crema, alla marmellata o al cioccolato?', en:'Yes… but which one? Plain, custard, jam or chocolate?' },
    drinkWhat:{ it:'Sì… e da bere? Un caffè, un cappuccino, un tè?', en:'Yes… and to drink? An espresso, a cappuccino, a tea?' },
    whose:{ it:'Per chi? Per Lei o per la signora?', en:'Who for? For you or for the lady?' },
    sameWhat:{ it:'Lo stesso… di cosa?', en:'The same… as what?' },
    ok:{ it:'Perfetto!', en:'Perfect!' },
    okWrong:{ it:'Va bene!', en:'All right!' },
    noCorn:{ it:'Niente cornetto? Sono appena fatti!', en:'No croissant? They are freshly made!' },
    noDrink:{ it:'Niente da bere?', en:'Nothing to drink?' },
    leaving:{ it:'Ma… non prende niente?', en:"But… aren't you having anything?" },
    already:{ it:'Sì, sì: arriva tutto!', en:"Yes, yes: it's all coming!" },
    hello:{ it:'Buongiorno!', en:'Good morning!' },
    thanks:{ it:'Grazie a Lei! Buona giornata!', en:'Thank you! Have a nice day!' },
    notYet:{ it:'Prima ordini, poi paga!', en:'Order first, then pay!' },
  },
  /* il signor Bepi (the stages: convos.js L15_BEPI) */
  bepi:{
    arrive:{ it:'Che bel cagnolino! Posso?', en:'What a lovely little dog! May I?' },
    yes:{ it:'Grazie! Ciao, bello… Io sono Giuseppe, ma qui tutti mi chiamano Bepi. E Lei?', en:'Thank you! Hello, handsome… I\'m Giuseppe, but here everyone calls me Bepi. And you?' },
    noPet:{ it:'Ah, scusi! Solo un saluto, allora. Io sono Giuseppe, ma tutti mi chiamano Bepi. E Lei?', en:"Oh, sorry! Just a hello, then. I'm Giuseppe, but everyone calls me Bepi. And you?" },
    nameOnly:{ it:'Piacere, {Me}! E la signora?', en:'Nice to meet you, {Me}! And the lady?' },
    margOnly:{ it:'Piacere, signora! E Lei, come si chiama?', en:'Nice to meet you, madam! And you, what is your name?' },
    both:{ it:'Piacere, {Me}! Piacere, signora Margaret! Benvenuta! E… ciao, bello! Ciao!', en:'Nice to meet you, {Me}! Nice to meet you, Margaret! Welcome! And… hello, handsome! Hello!' },
    english:{ it:'Inglese! Ah, Londra… Non parlo inglese, ma… benvenuta!', en:"English! Ah, London… I don't speak English, but… welcome!" },
    train:{ it:'Avete preso il treno da Padova?', en:'Did you take the train from Padova?' },
    trainYes:{ it:'Il treno di notte? Che avventura!', en:'The night train? What an adventure!' },
    trainYesBare:{ it:'Sì? Il treno di notte?', en:'Yes? The night train?' },
    trainNo:{ it:'No? Da dove, allora?', en:'No? From where, then?' },
    liked:{ it:'E vi è piaciuto?', en:'And did you like it?' },
    likedYes:{ it:'Bene, bene! E Padova…', en:'Good, good! And Padova…' },
    likedBare:{ it:'Sì? Molto?', en:'Yes? A lot?' },
    likedNo:{ it:'No? Peccato! Eh, il treno di notte… E Padova?', en:"No? Pity! Ah, the night train… And Padova?" },
    whatElse:{ it:'No? Peccato! E cosa ha fatto, allora?', en:'No? Pity! So what did you do, then?' },
    sayMore:{ it:'Ah sì? Cosa?', en:'Oh yes? What?' },
    compare:{ it:'E Venezia? È più bella di Padova?', en:'And Venice? Is it more beautiful than Padova?' },
    venBella:{ it:'Eh, lo so! Ma io sono di parte: sono veneziano!', en:"Ah, I know! But I'm biased: I'm Venetian!" },
    padTranq:{ it:'Ah, è vero! Qui… turisti, turisti, turisti! Ah ah!', en:"Ah, that's true! Here… tourists, tourists, tourists! Ha ha!" },
    padBella:{ it:'Padova più bella?! Ah ah! Coraggio! Ma il Santo è bellissimo, è vero.', en:"Padova more beautiful?! Ha ha! Brave! But the Santo is beautiful, that's true." },
    venGrande:{ it:'Più grande? No, no: Venezia è piccola! Ma è più bella, sì!', en:'Bigger? No, no: Venice is small! But more beautiful, yes!' },
    sameYes:{ it:'Sì? Eh, anche per me!', en:'Yes? Ah, for me too!' },
    sameNo:{ it:'No? Ah! Padova, allora?', en:'No? Ah! Padova, then?' },
    family:{ it:'Una famiglia? Sul treno? Che storia! Bravo, Biscuit!', en:'A family? On the train? What a story! Good boy, Biscuit!' },
    compliment:{ it:'Ma Lei parla bene l\'italiano!', en:'But you speak Italian well!' },
    learning:{ it:'Bravo! Piano piano, si impara tutto.', en:'Well done! Little by little, you learn everything.' },
    thanksOnly:{ it:'Prego! Ma… studia l\'italiano?', en:'You\'re welcome! But… are you studying Italian?' },
    horn:{ it:'Ecco il vaporetto! Buon viaggio, e benvenuti a Venezia!', en:'Here is the vaporetto! Have a good trip, and welcome to Venice!' },
    bye:{ it:'Arrivederci! E ciao, Biscuit!', en:'Goodbye! And bye, Biscuit!' },
    ciao:{ it:'Ciao, ciao! … Arrivederci!', en:'Bye, bye! … Goodbye!' },
    huh:{ it:'Come? Scusi, sono un po\' sordo…', en:"Sorry? Excuse me, I'm a little deaf…" },
  },
};
/* Margaret (English only: in a conversation, on the player's side) */
const L15_MARGARET = {
  start:["There we are: Venice! Oh, I could kiss the ground.", "Now, dear, my hotel is near San Marco too. Would you mind terribly if Biscuit and I tagged along? You speak Italian, and I… well, I speak English, loudly."],
  startChoices:[{ label:"Of course! Let's go together." }, { label:'Yes, come along: I\'ll do the talking.' }],
  startAfter:"Wonderful! Lead the way, dear. Biscuit, heel! … Well, nearly.",
  deskIn:"Ask him how we get to San Marco, dear. It's a boat, isn't it? Everything here is a boat.",
  deskAfter:'A vaporetto! Of course, the water bus. I knew it was something with a lot of vowels.',
  dirWhich:"Which way, dear? I didn't follow a word.",
  dirOK:'Out, down the steps, and right. Splendid! Off we go.',
  ticketIn:"Two tickets, dear: one for you and one for me. And ask when the next boat leaves, would you?",
  ticketTime:"When's the next boat? Ask him!",
  ticketDog:"And Biscuit? Ask if he needs a ticket too.",
  dogWhat:'What did he say? Does Biscuit need a ticket?',
  dogOK:'Then Biscuit rides in my arms, like a king.',
  tenPast:"Ten past nine? That's twenty minutes. Time for breakfast! There was a bar in the station.",
  barIn:"Ask her what sort of cornetti they have, dear. I'm terribly particular about my cornetto.",
  barWhat:'What kinds have they got?',
  barPick:{ crema:'Custard! Oh, custard, please. And just a little black coffee.', marmellata:'Jam for me, please. Apricot, I hope. And just a little black coffee.',
    cioccolato:'Chocolate! I shouldn\'t… but I will. And just a little black coffee.', vuoto:'A plain one for me, please: I\'m watching my figure. And just a little black coffee.' },
  barWrong:{ crema:'No, dear: custard, I said!', marmellata:'No, dear: jam, I said!', cioccolato:'No, dear: chocolate, I said!', vuoto:'No, dear: a plain one, I said!' },
  barCoffee:'And my little black coffee, dear?',
  barDrink:'No, dear: just a little black coffee, I said!',
  barTwo:'Two cornetti for me, dear? Just the one, please!',
  barTell:'Tell her, dear!',
  barPerfect:'Perfect, dear!',
  barMine:'And something for you, dear! You must eat.',
  barEat:'Oh, do have a cornetto, dear: you must eat!',
  barSip:'Oh, have a coffee, dear: we are in Italy!',
  barHow:'Lovely. How much is it, dear? Ask her.',
  barDone:'Delicious. Proper Italian coffee, standing up at the counter! Now, back to the boat.',
  bench:"Let's wait on the bench by the water, dear. My feet have done enough for one morning.",
  bepiFamily:'Tell him Biscuit found a family on the train!',
  bepiAfter:'What a charming man. Venice is full of them, I expect.',
  board:'The boat! Come on, dear: the tickets.',
  boardArms:'In you come, Biscuit. You ride in my arms, like a king.',
  rialto:'Look, dear! The Rialto!',
  thanks:"Thank you, dear. I'd never have managed without you. Same time tomorrow? Biscuit insists.",
};
/* hints: English, what is needed (never the Italian answer); `strong` names the key words, from the third failed try */
const L15_HINTS = {
  deskIntro:{ h:'He is a stranger: greet him politely. You can tell him your name too.', strong:'Greet him politely: <b>Buongiorno</b>.' },
  deskAsk:{ h:"You don't know the word for the boat. Try the tile that mixes Italian and English.", strong:'Use the tile <b>Dov\'è… the boat…</b>.' },
  dirAsk:{ h:'Ask him where the vaporetto stop is, for San Marco. He is a stranger: polite.', strong:'Ask him where the stop is. Key words: <b>dov\'è</b>, <b>la fermata</b>.' },
  dirWhere:{ h:'He wants to know where you are going.', strong:'Tell him where: <b>per San Marco</b>.' },
  dirBye:{ h:'You know the way. Thank him and say goodbye politely.', strong:'Key words: <b>grazie</b>, <b>arrivederci</b>.' },
  tickets:{ h:'Ask for tickets to San Marco: one for you and one for Margaret.', strong:'Two tickets. Key words: <b>due</b>, and the plural of <b>biglietto</b>.' },
  plural:'Two of them: <b>biglietto</b> is one ticket. Lezione 9: what happens to a word ending in -o when there are more?',
  time:{ h:'Ask what time the next vaporetto leaves.', strong:'Key words: <b>a che ora parte</b>, <b>il prossimo</b>.' },
  dog:{ h:'Ask about Biscuit: does the dog need a ticket?', strong:'Key words: <b>il cane</b>, <b>paga</b>.' },
  ticketBye:{ h:'You have everything. Thank him and say goodbye politely.', strong:'Key words: <b>grazie</b>, <b>arrivederci</b>.' },
  barKinds:{ h:'Margaret wants to know which cornetti they have. Ask the barista.', strong:'Key words: <b>che cornetti</b>, <b>avete</b>.' },
  barOrder:{ h:"Order for both of you: something for you, and what Margaret wants. Say who each thing is for (Lezione 4).", strong:'Order with <b>vorrei</b>; say who it is for: <b>per me</b>, <b>per lei</b>.' },
  barConfirm:{ h:'The barista is checking the order she heard. Is it right? Answer her.', strong:'Key words: <b>sì</b> (it is right), or <b>no</b> and what is wrong.' },
  barFix:{ h:"That isn't what Margaret asked for. Tell the barista it's wrong, and what Margaret really wants.", strong:'Start with <b>no</b>, then the right thing for her (<b>per lei</b> …).' },
  barWhose:{ h:'Two of you are ordering: say who that is for.', strong:'Key words: <b>per me</b> or <b>per lei</b>.' },
  barCorn:{ h:'A coffee and a cornetto each: the cornetto is still missing (and what is in it).', strong:'Key words: <b>un cornetto</b>, and what is in it (<b>vuoto</b>, <b>alla crema</b> …).' },
  barWhich:{ h:'Every cornetto has a filling, or none: say which one. (The barista listed them when you asked.)', strong:'Key words: <b>vuoto</b>, <b>alla crema</b>, <b>alla marmellata</b>, <b>al cioccolato</b>.' },
  barDrinkQ:{ h:'A coffee and a cornetto each: the drink is still missing.', strong:'Key words: <b>un caffè</b>, <b>un cappuccino</b>, <b>un tè</b>.' },
  barMg:{ h:'Margaret wants a little black coffee and her cornetto: order them for her (Lezione 4: who it is for).', strong:'Key words: <b>per lei</b>, <b>un caffè</b>, <b>un cornetto</b> …' },
  barMe:{ h:'Now order something for you: a drink and a cornetto.', strong:'Key words: <b>per me</b>, <b>vorrei</b>.' },
  barPay:{ h:'Ask how much it is.', strong:"Key word: <b>quant'è</b>." },
  barBye:{ h:'Thank her and say goodbye politely.', strong:'Key words: <b>grazie</b>, <b>arrivederci</b>.' },
  bepiPet:{ h:'He asks if he may stroke Biscuit. Answer him.', strong:'Say yes: <b>sì</b>, <b>certo</b>.' },
  bepiIntro:{ h:'Tell him who you are, and introduce Margaret: she is English and doesn\'t speak Italian (Lezioni 5 and 13).', strong:'Your name, then Margaret: <b>Lei è Margaret</b>, <b>è inglese</b>.' },
  bepiMarg:{ h:'Now introduce Margaret too.', strong:'Key words: <b>Lei è Margaret</b>.' },
  bepiName:{ h:'He asked your name.', strong:'Key words: <b>mi chiamo</b>.' },
  bepiTrain:{ h:'He asks about the train from Padova. Tell him which train you took (the past: Lezione 13).', strong:'Key words: <b>abbiamo preso</b>, <b>il treno di notte</b>.' },
  bepiLiked:{ h:'Did you like it? Tell him: there is a phrase in the handbook for “I liked it a lot”.', strong:'Key words: <b>mi è piaciuto</b>.' },
  bepiDay:{ h:'He asks about something in Padova. Answer yes or no; with a no, tell him something you did do (Lezione 13: <i>ho</i> + the past).', strong:'Answer <b>sì</b> or <b>no</b>; then <b>ma ho</b> + what you did.' },
  bepiDayMore:{ h:'Tell him something you did in Padova (the past: Lezione 13).', strong:'Key words: <b>ho</b> + what you did.' },
  bepiCompare:{ h:'Give your opinion: is Venice more beautiful than Padova, or is Padova quieter? (Lezione 11: comparing)', strong:'Key words: <b>più</b>, <b>bella</b> or <b>tranquilla</b>.' },
  bepiFamily:{ h:'Translate for Margaret: Biscuit found a family on the train.', strong:'Key words: <b>ha trovato</b>, <b>una famiglia</b>.' },
  bepiThanks:{ h:'He says you speak Italian well. Thank him, and tell him you are learning.', strong:'Key words: <b>grazie</b>, <b>sto imparando</b>.' },
  bepiBye:{ h:'The boat is here. Say goodbye to him: politely.', strong:'Key word: <b>arrivederci</b>.' },
  formal:'is a stranger: the polite forms (<i>Lei</i>).',
};

/* ---------- the handbook chapter ---------- */
const L15_UNIT_TABLE = [
  ['Saying hello, your name, how you are', 'Ciao / Buongiorno · Mi chiamo… · Come sta?', 1],
  ['Ordering at a bar; the little words', 'Vorrei un caffè… · Quant\'è? · e, poi, ma, quindi', 2],
  ['Asking the way; scusi / scusa', 'Scusi, dov\'è…? · a destra, a sinistra, dritto', 3],
  ['Ordering for two; per me / per lui', 'Vorrei / vorrebbe · Avete…? · il conto', 4],
  ['Introducing people', 'Le presento… · Questa è la mia amica · È inglese', 5],
  ['Looking for things; tu or Lei', 'Cerco… · Ha…? / Hai…? · Sa dov\'è…?', 6],
  ['Numbers and prices', 'Quanto costa? · uno… venti', 7],
  ['Likes, colours, sizes', 'Mi piace / Le piace · rosso / rossa · La prendo', 8],
  ['Plurals; how many', 'due biglietti, tre rose · Quanti? Quante?', 9],
  ['The time; Permesso!', 'A che ora? · alle nove e dieci · Permesso!', 10],
  ['Comparing and describing', 'più bello di… · Ci sono…', 11],
  ['Travel and the town', 'Un biglietto per… · stasera · the quests', 12],
  ['The past with avere', 'Ho visto, ho mangiato, ho preso…', 13],
  ['The past with essere', 'È andato / andata · Siamo arrivati', 14],
  ['Getting around Venice', 'Il prossimo vaporetto · Mi è piaciuto molto', 15],
];
const L15_CHAPTER = {
  n:15, title:'Venezia', sub:'The vaporetto, and the whole unit in one errand',
  dlgNote:'At the vaporetto stop outside a station, with a friend and her small dog. The man in the ticket booth is a stranger: Lei.',
  dialogue:[
    ['Tu', 'Buongiorno! Due biglietti per San Marco, per favore.', 'Good morning! Two tickets to San Marco, please.'],
    ['Bigliettaio', 'Ecco: due biglietti. Sono diciannove euro.', "Here you are: two tickets. That's nineteen euros."],
    ['Tu', 'A che ora parte il prossimo vaporetto?', 'What time does the next vaporetto leave?'],
    ['Bigliettaio', 'Il prossimo parte alle nove e mezza, dalla fermata C.', 'The next one leaves at half past nine, from stop C.'],
    ['Tu', 'E il cane? Il cane paga?', 'And the dog? Does the dog pay?'],
    ['Bigliettaio', 'No, il cane non paga. Ma deve avere il guinzaglio e la museruola… o in braccio, se è piccolo!', "No, the dog doesn't pay. But it must have a lead and a muzzle… or be carried, if it's small!"],
    ['Tu', 'Grazie mille! Arrivederci!', 'Thank you very much! Goodbye!'],
    ['Bigliettaio', 'Arrivederci, e buon viaggio!', 'Goodbye, and have a good trip!'],
  ],
  pitches:{ Tu:1.1, Bigliettaio:0.8 },
  phrasesTitle:'What you say',
  phrases:[
    ["Dov'è la fermata del vaporetto?", 'Where is the vaporetto stop?', "Dov'è…? (Lezione 3) + la fermata (the stop) + del vaporetto (of the water bus)."],
    ['Due biglietti per San Marco, per favore.', 'Two tickets to San Marco, please.', 'Plural: un biglietto → due biglietti (Lezione 9). Per + where you are going (Lezione 12).'],
    ['A che ora parte il prossimo vaporetto?', 'What time does the next vaporetto leave?', 'Parte: it leaves (partire). Il prossimo: the next one.'],
    ['Il cane paga?', 'Does the dog pay?', 'Paga: he / she / it pays (pagare). A question by intonation.'],
    ['Che cornetti avete?', 'What kind of croissants do you have?', 'Che + a noun: which, what kind of. Avete: you (the shop) have (Lezione 4).'],
    ['Mi è piaciuto molto!', 'I liked it a lot!', 'The past of mi piace (Lezione 8). Learn it as one phrase.'],
    ['Sto imparando.', "I'm learning.", 'What to say when someone praises your Italian.'],
  ],
  phrases2Title:"What you'll hear",
  phrases2:[
    ['Esca dalla stazione e scenda i gradini.', 'Go out of the station and down the steps. (polite)', 'Commands for Lei end in -a or -i: esca, scenda, giri, prenda (Lezione 9).'],
    ['Prenda la linea 1 o la linea 2.', 'Take line 1 or line 2. (polite)', 'La linea: the route (its number is on the boat).'],
    ['Il prossimo parte alle nove e dieci.', 'The next one leaves at ten past nine.', 'Alle + the time (Lezione 10).'],
    ['Convalidi il biglietto!', 'Validate your ticket! (polite)', 'Tap the ticket on the reader before you get on.'],
    ['Vi è piaciuto? · Le è piaciuto?', 'Did you (two) like it? · Did you like it? (polite)', 'Vi: you, more than one. Le: you, polite.'],
    ['Lei parla bene l\'italiano!', 'You speak Italian well!', 'Answer: Grazie! Sto imparando.'],
    ['Buon viaggio, e benvenuti a Venezia!', 'Have a good trip, and welcome to Venice!', 'Benvenuti: welcome, to more than one person (to one woman: benvenuta).'],
  ],
  extraTitle:'At the bar: what is in the cornetto?',
  extraNote:'Il cornetto (the Italian croissant) is plain or filled. Ask «Che cornetti avete?» and you will hear:',
  extra:[['🥐 vuoto', 'plain (literally "empty")'], ['🍮 alla crema', 'with custard'], ['🍑 alla marmellata', 'with jam'], ['🍫 al cioccolato', 'with chocolate'],
    ['☕ un caffè', 'an espresso'], ['🥛 un cappuccino', 'a cappuccino']],
  how:`<p><b>The next one.</b> <b>Il prossimo vaporetto</b>, <b>la prossima fermata</b> (the next stop), or on its own: <i>Il prossimo parte alle nove.</i>
      (the next one leaves at nine). <i>Prossimo</i> agrees like any adjective (Lezione 8): <i>il prossimo / la prossima</i>.</p>
    <p><b>Leaving and arriving.</b> <b>parte</b> (it leaves: <i>partire</i>) and <b>arriva</b> (it arrives: <i>arrivare</i>): <i>Il vaporetto parte alle nove e dieci
      e arriva a San Marco alle nove e quaranta.</i> In the past both take <i>essere</i>, like every verb of movement (Lezione 14): <i>è partito, è arrivato</i>.</p>
    <p><b>I liked it.</b> <i>Mi piace</i> (Lezione 8) works backwards: the thing you like is the subject. Its past uses <b>essere</b>, so: <b>Mi è piaciuto</b>
      (I liked it), <b>Le è piaciuto?</b> (did you like it? polite), <b>Vi è piaciuto?</b> (did you two like it?). Learn <b>Mi è piaciuto molto!</b> as one phrase.</p>
    <p><b>I'm learning.</b> <b>Sto imparando</b>: <i>sto</i> (as in <i>sto bene</i>) + <i>imparando</i>: what you are doing right now. Another set phrase.</p>
    <h4>The unit in one page</h4>
    <p>Everything you can do now, and the lesson it came from. Today's errand uses almost all of it.</p>
    <table class="dirtable l15-unit"><thead><tr><th>You can…</th><th>For example</th><th>Lezione</th></tr></thead><tbody>
      ${L15_UNIT_TABLE.map(([what, ex, n]) => `<tr><td>${what}</td><td><i>${ex}</i></td><td>${n}</td></tr>`).join('')}</tbody></table>`,
  culture:`<p><b>Venice's water buses.</b> In Venice the buses are boats: the <b>vaporetti</b> of ACTV. Each line has a number (the <b>linea 1</b> stops everywhere along
      the Grand Canal; the <b>linea 2</b> is quicker), and each stop is a floating pontoon (<b>il pontile</b>) with its name and a letter: <i>Ferrovia B</i>,
      <i>San Marco</i>. A single ticket lasts 75 minutes. Before you get on, <b>validate it</b>: tap it on the reader at the gate (<i>convalidare</i>).</p>
    <p><b>Dogs on board.</b> One dog per passenger travels free, on a lead and with a muzzle; a small dog can be carried in your arms or in a carrier. At
      the stops, let people off first, and say <i>Permesso!</i> when you need to get past.</p>`,
  /* 12 items across the whole unit: greetings, Lei/tu, directions, a price heard, a time heard, ordering, plurals, a comparative, avere past,
     essere past, a joining word, a translation */
  exercises:[
    { type:'mc', q:'Nine in the morning, at the ticket booth. You say:', opts:['Buongiorno!', 'Buonanotte!', 'Ciao, bello!'], a:0,
      why:'Buongiorno: good morning, to anyone, any time before the afternoon.', nudge:'It is the morning, and he is a stranger.' },
    { type:'mc', q:'Il signor Bepi, an older gentleman you have just met, has told you how he is. You ask him back:', opts:['E Lei?', 'E tu?', 'E voi?'], a:0,
      why:'A stranger: Lei. E Lei? (and you?)', nudge:'A stranger, older than you: the polite form.' },
    { type:'mc', q:'«Esca dalla stazione, poi giri a destra.» Where do you go?', opts:['Out of the station, then right', 'Into the station, then left', 'Out of the station, then straight on'], a:0,
      why:'Esca: go out (polite). Giri a destra: turn right.', nudge:'Destra or sinistra? (Lezione 3)', noSpeak:true },
    { type:'mc', q:'«Sono diciannove euro.» How much is it?', opts:['€ 19', '€ 9', '€ 90'], a:0,
      why:'Diciannove: 19 (dieci + nove).', nudge:'Dici- is ten and a bit (Lezione 7).', noSpeak:true },
    { type:'mc', q:'«Il vaporetto parte alle dieci meno un quarto.» When does it leave?', opts:['9:45', '10:15', '10:45'], a:0,
      why:'Le dieci meno un quarto: ten minus a quarter, 9:45.', nudge:'Meno means minus (Lezione 10).', noSpeak:true },
    { type:'order', q:'For you: a cappuccino and a croissant, please.', tiles:['Vorrei', 'un cappuccino', 'e', 'un cornetto', 'per favore', 'per lei'],
      answer:'vorrei un cappuccino e un cornetto per favore', why:'Vorrei un cappuccino e un cornetto, per favore.', nudge:'Vorrei, the two things joined by e, then please. (Is it for her?)' },
    { type:'mc', q:'You and Margaret: «Due ___ per San Marco, per favore.»', opts:['biglietti', 'biglietto', 'biglietta'], a:0,
      why:'Two: the plural. -o becomes -i: due biglietti.', nudge:'Lezione 9: a word ending in -o, when there are more than one.' },
    { type:'order', q:'Venice is more beautiful than Padua.', tiles:['Venezia', 'è', 'più', 'bella', 'bello', 'di', 'Padova'], answer:'venezia è più bella di padova',
      why:'Venezia è più bella di Padova. Venezia is feminine: bella.', nudge:'Più + the adjective + di (Lezione 11). Venezia is a she.' },
    { type:'mc', q:'«Ieri ___ visto il tramonto sul ponte.» (I)', opts:['ho', 'sono', 'è'], a:0,
      why:'Vedere takes avere: ho visto (Lezione 13).', nudge:'Seeing is not going anywhere: avere or essere?' },
    { type:'mc', q:'«Il vaporetto è ___ alle nove e dieci.»', opts:['partito', 'partita', 'partiti'], a:0,
      why:'Partire (to leave) is movement: essere, and the ending agrees with il vaporetto: partito.', nudge:'Essere: the ending agrees. Il vaporetto is masculine, and one (Lezione 14).' },
    { type:'mc', q:'«Non ho visto la basilica, ___ ho mangiato un gelato.»', opts:['ma', 'e', 'quindi'], a:0,
      why:'Ma: but. No basilica, but an ice cream.', nudge:'The two halves go against each other (Lezione 2: the little words).' },
    { type:'mc', q:'Margaret asks what «Il cane non paga» means. You tell her:', opts:['The dog travels free.', 'The dog has to pay.', "The dog can't come."], a:0,
      why:'Paga: pays. Non paga: does not pay.', nudge:'Non: not. Paga: pays.', noSpeak:true },
  ],
  /* Vocabolario (≤ 50): the boat, the tickets, the way, the dog, breakfast, Bepi. The unit's review is in the practice, not here. */
  vocab:[
    { group:'The vaporetto', words:[
      { it:'il vaporetto', g:'m', en:'the water bus (the vaporetto)', note:'Plural: i vaporetti.', also:['vaporetti'] },
      { it:'la fermata', g:'f', en:'the stop (of a bus, a boat)' },
      { it:'la linea', g:'f', en:'the line (the route and its number)', note:'Prenda la linea 1: take line 1.' },
      { it:'prossimo / prossima', en:'next (the next one)', say:'il prossimo vaporetto, la prossima fermata', also:['prossimo', 'prossima'] },
      { it:'parte', en:'it leaves (partire)', note:'Il vaporetto parte alle nove.', also:['partire', 'partito'] },
      { it:'arriva', en:'it arrives (arrivare)' },
      { it:'la barca', g:'f', en:'the boat' },
      { it:'il pontile', g:'m', en:'the floating stop (the pontoon)' },
      { it:'Convalidi il biglietto!', en:'Validate your ticket! (polite)', note:'Convalidare: tap the ticket on the reader.', also:['convalidi', 'convalidare', 'biglietto'] },
      { it:'San Marco', en:"San Marco (St Mark's: the square, the basilica)", also:['san', 'marco', 'padova', 'venezia'] },
    ] },
    { group:'Tickets', words:[
      { it:'Due biglietti per San Marco, per favore.', en:'Two tickets to San Marco, please.', note:'Un biglietto, due biglietti.', also:['biglietti', 'due'] },
      { it:'A che ora parte il prossimo vaporetto?', en:'What time does the next vaporetto leave?', also:['ora'] },
    ] },
    { group:'The way', words:[
      { it:'Esca dalla stazione', en:'Go out of the station (polite)', also:['esca', 'dalla', 'stazione'] },
      { it:'Scenda i gradini', en:'Go down the steps (polite)', also:['scenda'] },
      { it:'i gradini', g:'m pl', en:'the steps', also:['gradini', 'gradino'] },
      { it:'Prenda …', say:'Prenda la linea 1.', en:'Take … (polite)', also:['prenda'] },
      { it:'qui davanti', en:'right out in front (just here)', also:['qui', 'davanti'] },
      { it:'lì', en:'there' },
      { it:'il canale', g:'m', en:'the canal', note:'Il Canal Grande: the Grand Canal.', also:['canale', 'sul'] },
    ] },
    { group:'The dog', words:[
      { it:'Il cane paga?', en:'Does the dog pay?', also:['paga', 'pagare'] },
      { it:'il guinzaglio', g:'m', en:'the lead (the leash)' },
      { it:'la museruola', g:'f', en:'the muzzle' },
      { it:'in braccio', en:'in your arms (carried)', also:['braccio'] },
      { it:'se', en:'if', note:'… o in braccio, se è piccolo: or carried, if it is small.' },
    ] },
    { group:'Breakfast', words:[
      { it:'Che cornetti avete?', en:'What kind of croissants do you have?', also:['che', 'cornetti', 'avete'] },
      { it:'vuoto / vuota', en:'plain (literally: empty)', note:'Un cornetto vuoto: with nothing inside. Plural: vuoti.', also:['vuoto', 'vuota', 'vuoti'] },
      { it:'alla crema', en:'with custard (cream)', also:['crema', 'alla'] },
      { it:'alla marmellata', en:'with jam', also:['marmellata'] },
      { it:'al cioccolato', en:'with chocolate', also:['cioccolato', 'al'] },
      { it:'lo stesso', g:'m', en:'the same (the same thing)', note:'Per me lo stesso: the same for me. Anche per me: for me too.', also:['stesso'] },
    ] },
    { group:'Meeting il signor Bepi', words:[
      { it:'Che bel cagnolino!', en:'What a lovely little dog!', note:'Il cagnolino: a little dog (il cane + -olino).', also:['bel', 'cagnolino'] },
      { it:'Posso?', en:'May I?' },
      { it:'Certo!', en:'Of course!', also:['certo'] },
      { it:'Abbiamo preso il treno di notte.', en:'We took the night train.', note:'Abbiamo: we have (avere). Di notte: at night.', also:['abbiamo', 'notte', 'treno'] },
      { it:'Vi è piaciuto?', en:'Did you (two) like it?', also:['vi'] },
      { it:'Mi è piaciuto molto!', en:'I liked it a lot!', also:['piaciuto', 'molto'] },
      { it:'tranquillo / tranquilla', en:'quiet, peaceful', also:['tranquillo', 'tranquilla'] },
      { it:'ha trovato', en:'he / she has found', note:'Trovare: to find. Ho trovato: I found.', also:['trovato', 'trovare'] },
      { it:'la famiglia', g:'f', en:'the family', also:['famiglia'] },
      { it:"Lei parla bene l'italiano!", en:'You speak Italian well!', also:['parla', 'bene', 'italiano'] },
      { it:'Sto imparando.', en:"I'm learning.", also:['imparando', 'imparare'] },
      { it:'Benvenuti!', en:'Welcome! (to more than one)', note:'To one woman: benvenuta; to one man: benvenuto.', also:['benvenuti', 'benvenuta', 'benvenuto'] },
      { it:'Buon viaggio!', en:'Have a good trip!', also:['buon', 'viaggio'] },
    ] },
  ],
  verbs:[
    { inf:'partire', en:'to leave, to depart', forms:[
      { p:'lui', it:'parte', en:'it leaves (the boat, the train)', ex:'Il prossimo vaporetto parte alle nove.' } ] },
    { inf:'piacere', en:'to like (to please)', forms:[
      { p:'io', it:'mi è piaciuto', en:'I liked it (in the past)', mood:'past', ex:'Il treno? Mi è piaciuto molto!' } ] },
    { inf:'imparare', en:'to learn', forms:[
      { p:'io', it:'sto imparando', en:"I'm learning (right now)", ex:'Grazie! Sto imparando.' } ] },
    { inf:'convalidare', en:'to validate (a ticket)', forms:[
      { p:'Lei', it:'convalidi', en:'validate! (polite)', mood:'imperative', ex:'Convalidi il biglietto!' } ] },
  ],
  doneTitle:'Ready for the vaporetto.', doneGo:'Back to the station',
};
LESSONS.push(L15_CHAPTER);
