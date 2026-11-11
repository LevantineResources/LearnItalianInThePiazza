/* Lesson 4. Lesson data: vocabulary, tiles, routes, and the handbook chapter (LESSONS.push). */

/* ---------- Lesson 4: lunch at Caffè Aurora ---------- */
/* cue: the English a word card shows (Studio) when en is the Italian word itself (CLAUDE.md: an English prompt never contains the Italian) */
const DISHES = [
  { key:'lasagna',    label:'la lasagna',                 course:'Primi',    price:1200, tags:['carne'], en:'the lasagna', cue:'baked layers of pasta with meat sauce',             desc:'Layers of pasta with meat ragù and béchamel.' },
  { key:'spaghetti',  label:'gli spaghetti al pomodoro',  course:'Primi',    price:900,  tags:['veg'],   en:'the spaghetti with tomato sauce', cue:'long, thin pasta with tomato sauce', desc:'Tomato, basil and olive oil.' },
  { key:'risotto',    label:'il risotto ai funghi',       course:'Primi',    price:1100, tags:['veg'],   en:'mushroom risotto', cue:'creamy rice with mushrooms',        desc:'Creamy rice with porcini mushrooms and parmigiano.' },
  { key:'pollo',      label:'il pollo arrosto',           course:'Secondi',  price:1400, tags:['carne'], en:'the roast chicken',       desc:'With rosemary and garlic.' },
  { key:'pesce',      label:'il pesce del giorno',        course:'Secondi',  price:1600, tags:['pesce'], en:'the fish of the day',     desc:'Whatever came in this morning.' },
  { key:'parmigiana', label:'la parmigiana di melanzane', course:'Secondi',  price:1200, tags:['veg'],   en:'the aubergine parmigiana', cue:'aubergine baked with tomato and cheese', desc:'Fried aubergine baked with tomato and cheese.' },
  { key:'insalata',   label:"l'insalata mista",           course:'Contorni', price:500,  tags:['veg'],   en:'a mixed salad',           desc:'A side dish, served on its own plate.' },
  { key:'tiramisu',   label:'il tiramisù',                course:'Dolci',    price:600,  tags:['veg'],   en:'tiramisù', cue:'the coffee-soaked cream dessert',                desc:'Coffee-soaked biscuits and mascarpone.' },
];
const PIZZA = { key:'pizza', label:'la pizza', en:'pizza', cue:'a flat, round bread baked with tomato and cheese' };
const DRINKS4 = [
  { key:'naturale',  label:"un'acqua naturale",          price:250, en:'a still water' },
  { key:'frizzante', label:"un'acqua frizzante",         price:250, en:'a sparkling water' },
  { key:'vino',      label:'un bicchiere di vino rosso', price:500, en:'a glass of red wine' },
];
const INGR = [
  { key:'carne', label:'la carne', en:'meat' }, { key:'pesce_i', label:'il pesce', en:'fish' }, { key:'formaggio', label:'il formaggio', en:'cheese' },
];
const FOOD = Object.fromEntries([...DISHES, PIZZA, ...DRINKS4, ...INGR].map(x => [x.key, x]));
const isDrink = k => DRINKS4.some(d => d.key === k);
const isIngr = k => INGR.some(d => d.key === k);
const COPERTO = 200;
const L4_WHO = [
  { key:'per me', label:'Per me', words:'per me', en:'for me' }, { key:'per lui', label:'Per lui', words:'per lui', en:'for him' },
  { key:'io', label:'Io', words:'io', en:'I' }, { key:'lui', label:'Lui', words:'lui', en:'he' },
];
const L4_VERBS = [
  { key:'vorrei', label:'vorrei', words:'vorrei', en:'I would like' }, { key:'vorrebbe', label:'vorrebbe', words:'vorrebbe', en:'he / she would like' },
  { key:'posso', label:'posso', words:'posso', en:'I can' }, { key:'può', label:'può', words:'può', en:'he / she can' },
  { key:'mangio', label:'mangio', words:'mangio', en:'I eat' }, { key:'mangia', label:'mangia', words:'mangia', en:'he / she eats' },
  { key:'mangiare', label:'mangiare', words:'mangiare', en:'to eat' }, { key:'non', label:'non', words:'non', en:'not' },
  { key:'è', label:'è', words:'è', en:'he / she is' }, { key:'vegetariano', label:'vegetariano', words:'vegetariano', en:'vegetarian' },
];
const L4_ASK = [
  { key:'scusi', label:'Scusi', words:'scusi', en:'excuse me (polite)' }, { key:'avete', label:'Avete', words:'avete', en:'do you (all) have' }, { key:"c'è", label:"C'è", words:"c'è", en:'is there' },
  { key:'il conto', label:'Il conto', words:'il conto', en:'the bill' }, { key:'per favore', label:'per favore', words:'per favore', en:'please' },
  { key:'e', label:'e', words:'e', en:'and' }, { key:'sì', label:'sì', words:'sì', en:'yes' }, { key:'no', label:'no', words:'no', en:'no' },
];
const asTile = x => ({ key:x.label.toLowerCase(), label:x.label, words:x.label, en:x.en, place:true });
const L4_MENU = [...DISHES, PIZZA].map(asTile), L4_DRINKS = DRINKS4.map(asTile), L4_INGR = INGR.map(asTile);
const L4_ALL = [...L4_WHO, ...L4_VERBS, ...L4_ASK, ...L4_MENU, ...L4_DRINKS, ...L4_INGR];
const freshL4 = () => ({ askedPizza:false, p1:false, himVeg:false, p2:false, him:{}, me:{}, drinkAsked:false, p3:false, served:false, billAsked:false, p4:false, p5:false, done:false });


/* The handbook chapter: dialogue, phrases, explanations, culture note, exercises. */
LESSONS.push({
    n:4, title:'A pranzo', sub:'Lunch, and ordering for a friend',
    dlgNote:'Two friends order lunch. Only one of them speaks Italian, so she orders for both.',
    dialogue:[
      ['Cameriere','Buongiorno! Cosa prendete?','Good morning! What will you (both) have?'],
      ['Tu','Scusi, avete la lasagna?','Excuse me, do you have lasagna?'],
      ['Cameriere','Sì, certo.','Yes, of course.'],
      ['Tu','Per me, la lasagna. La mia amica è vegetariana: non può mangiare la carne.',"For me, the lasagna. My friend is vegetarian: she can't eat meat."],
      ['Cameriere','Allora per lei, gli spaghetti al pomodoro?','Then for her, the spaghetti with tomato sauce?'],
      ['Tu','No, lei vorrebbe il risotto ai funghi.','No, she would like the mushroom risotto.'],
      ['Cameriere','E da bere?','And to drink?'],
      ['Tu',"Per me, un bicchiere di vino rosso. Per lei, un'acqua naturale.",'For me, a glass of red wine. For her, a still water.'],
      ['Cameriere','Arrivo subito!','Coming right up!'],
      ['Tu','Il conto, per favore.','The bill, please.'],
    ],
    pitches:{ Cameriere:0.85, Tu:1.1 },
    menu4:true, conj:true,
    phrasesTitle:'What you say',
    phrases:[
      ['Avete …?','Do you have …?','You are asking the restaurant, so it is plural: voi.'],
      ["C'è …?",'Is there …?',"Also works: C'è la pizza?"],
      ['Per me … / Per lui …','For me … / For him …','The easiest way to order for two. For her: per lei.'],
      ['Lui vorrebbe …','He would like …','Vorrei is “I would like”.'],
      ['Lui non può mangiare …',"He can't eat …",'Non goes right before the verb.'],
      ['Lui è vegetariano.','He is vegetarian.','For a woman: lei è vegetariana.'],
      ['Il conto, per favore.','The bill, please.','The waiter won\'t bring it until you ask.'],
    ],
    phrases2Title:'What the waiter says',
    phrases2:[
      ['Cosa prendete?','What will you have?','Prendete is the voi form: he is asking both of you.'],
      ['Per chi?','For whom?','Answer per me or per lui.'],
      ['E da bere?','And to drink?','Bere = to drink.'],
      ["Mi dispiace, non c'è.","Sorry, there isn't any.",'Or: solo la sera, only in the evening.'],
      ['Arrivo subito!','Coming right up!','Literally: I arrive at once.'],
      ['Buon appetito!','Enjoy your meal!','Say it back, or just “grazie”.'],
      ['Ecco il conto.',"Here's the bill.",'Then the total, written in figures: Sono 31,50 euro (thirty-one euros fifty).'],
    ],
    how:`<p>Italian verbs change their ending to show <i>who</i> is doing it: <b>io mangio</b> (I eat), <b>lui mangia</b> (he eats). Because the ending already says who, Italians usually drop the pronoun: <b>Vorrebbe il risotto</b> = He'd like the risotto.</p>
      <p>Ordering for someone else means switching from <b>io</b> to <b>lui</b>: <b>vorrei → vorrebbe</b>, <b>posso → può</b>, <b>mangio → mangia</b>, <b>sono → è</b>.</p>
      <p>The polite <b>Lei</b> (you) uses the same form as lui and lei. That is why Enzo asked <i>Come sta?</i>, the same verb form as <i>lui sta</i>.</p>
      <p><b>Non</b> goes right before the verb: <b>Lui non può mangiare la carne.</b> <b>Non mangia la carne.</b></p>
      <p>Asking the restaurant? Use <b>voi</b>, the plural: <b>Avete …?</b> (do you have …?). The waiter uses it back to the two of you: <i>Cosa prendete?</i></p>
      <p>On a menu, dishes come with <b>il, la, gli, l'</b> (the): <i>il risotto, la lasagna, gli spaghetti, l'insalata</i>.</p>`,
    culture:`<p>A full Italian meal runs <b>antipasto</b> (starter), <b>primo</b> (pasta, risotto, soup), <b>secondo</b> (meat or fish), <b>contorno</b> (a side, ordered separately) and <b>dolce</b>, then a caffè. Nobody expects you to order everything: a primo on its own is a normal lunch.</p>
      <p>The bill often includes <b>coperto</b>: a small charge per person for the bread and the table. Tipping isn't expected; rounding up for good service is appreciated.</p>
      <p>Water comes <b>naturale</b> (still) or <b>frizzante</b> (sparkling), usually in a bottle for the table.</p>
      <p>Waiters won't bring the bill until you ask, because rushing you would be rude. Catch their eye and say <b>Il conto, per favore</b>.</p>
      <p>Many restaurants only fire up the pizza oven in the evening, so pizza at lunch is often off the menu.</p>`,
    exercises:[
      { type:'mc', q:'Mark wants the risotto. How do you say “He would like the risotto”?', opts:['Vorrei il risotto.','Lui vorrebbe il risotto.','Lui vorrei il risotto.'], a:1,
        why:'Vorrebbe is the “he / she” form. Vorrei is “I would like”.', nudge:'Lui needs the lui form of the verb.' },
      { type:'mc', q:'Complete: “Lui non ___ mangiare la carne.”', en:"He can't eat meat.", opts:['posso','può','puoi'], a:1,
        why:'Io posso, tu puoi, lui può.', nudge:'Posso is “I can”. Which one is “he can”?' },
      { type:'mc', q:'Mangiare is a regular -are verb. Io mangio, tu mangi, lui …', opts:['mangia','mangio','mangiamo'], a:0,
        why:'Regular -are endings: -o, -i, -a, -iamo, -ate, -ano. Lui mangia.', nudge:'Look at the verb table in the lesson.' },
      { type:'order', q:'Ask the waiter if they have tiramisù.', en:'Excuse me, do you have tiramisù?', tiles:['il tiramisù','avete','scusi'], answer:'scusi avete il tiramisù',
        why:'Scusi, avete il tiramisù?', nudge:'Scusi first, then avete (do you have).' },
      { type:'order', q:'Order a sparkling water for Mark.', en:'For him, a sparkling water, please.', tiles:['per favore',"un'acqua frizzante",'per lui'], answer:"per lui un'acqua frizzante per favore",
        why:"Per lui, un'acqua frizzante, per favore.", nudge:'Start with who it is for.' },
      { type:'mc', q:'The waiter asks “E da bere?”. What does he want to know?', opts:['What you would like to drink','If you want dessert','If you are ready to pay'], a:0, noSpeak:true,
        why:'Bere means “to drink”. E da bere? = And to drink?', nudge:'Bere means “to drink”.' },
      { type:'mc', q:'Your bill says “Coperto 2 × €2,00”. What is that?', opts:['A cover charge for bread and the table','A tip for the waiter','A fine for staying too long'], a:0, noSpeak:true,
        why:'Coperto is a per-person charge for bread and the table. Tipping is not expected.', nudge:'Check the culture note.' },
    ],
    doneTitle:'Buon appetito! Ready to order for two.', doneGo:'Back to the table',
  });
