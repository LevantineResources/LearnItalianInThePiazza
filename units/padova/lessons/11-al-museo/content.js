/* Lesson 11 · Al museo. Lesson data: Lucia's tiles (comparing, describing, how people seem, liking, what is in the
   pictures), the handbook chapter (its rules box is added in flow.js, where the speaker icon exists), the Vocabolario and
   the verbs. Design: docs/lessons/11-al-museo.md. Data only (runs before the engine). */

const l11Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
/* comparing: questo / quello on their own, so no article is needed */
const L11_CMP = [
  l11Tile('questo', 'Questo', 'this one (masculine: il quadro)'), l11Tile('questa', 'Questa', 'this one (feminine: la statua)'),
  l11Tile('quello', 'quello', 'that one (masculine)'), l11Tile('quella', 'quella', 'that one (feminine)'),
  l11Tile('è', 'è', 'is'), l11Tile('più', 'più', 'more …er'), l11Tile('meno', 'meno', 'less'), l11Tile('di', 'di', 'than (più … di)'),
  l11Tile('il più', 'il più', 'the most …, the …est'),
];
/* describing: both forms of every adjective that changes (the agreement is up to you) */
const L11_ADJ = [
  ['vecchio', 'old'], ['vecchia', 'old (feminine)'], ['moderno', 'modern'], ['moderna', 'modern (feminine)'], ['grande', 'big (never changes)'],
  ['piccolo', 'small'], ['piccola', 'small (feminine)'], ['alto', 'tall'], ['alta', 'tall (feminine)'], ['scuro', 'dark'], ['scura', 'dark (feminine)'],
  ['chiaro', 'light, bright'], ['chiara', 'light (feminine)'], ['bello', 'beautiful'], ['bella', 'beautiful (feminine)'], ['giovane', 'young (never changes)'],
  ['strano', 'strange'], ['strana', 'strange (feminine)'],
].map(([w, en]) => l11Tile(w, w, en));
/* how people seem */
const L11_FEEL = [
  l11Tile('sembra', 'Sembra', 'he / she seems'), l11Tile('secondo me', 'Secondo me', 'in my opinion'),
  ...[['felice', 'happy (never changes)'], ['triste', 'sad (never changes)'], ['arrabbiato', 'angry'], ['arrabbiata', 'angry (feminine)'],
    ['spaventato', 'frightened'], ['spaventata', 'frightened (feminine)'], ['calmo', 'calm'], ['calma', 'calm (feminine)'],
    ['sorpreso', 'surprised'], ['sorpresa', 'surprised (feminine)']].map(([w, en]) => l11Tile(w, w, en)),
];
/* liking and preferring */
const L11_LIKE = [
  l11Tile('mi piace', 'Mi piace', 'I like (one thing)'), l11Tile('mi piacciono', 'Mi piacciono', 'I like (more than one thing)'),
  l11Tile('preferisco', 'Preferisco', 'I prefer'), l11Tile('preferisce', 'preferisce', 'he / she prefers, you (polite) prefer'),
  l11Tile('il viso', 'il viso', 'the face'), l11Tile('i colori', 'i colori', 'the colours'),
];
/* what is in the pictures */
const L11_SEE = [
  l11Tile("c'è", "C'è", 'there is'), l11Tile('ci sono', 'Ci sono', 'there are'), l11Tile('vedo', 'Vedo', 'I see'),
  l11Tile('un uomo', 'un uomo', 'a man'), l11Tile('una donna', 'una donna', 'a woman'), l11Tile('un bambino', 'un bambino', 'a child'),
  l11Tile('un cavallo', 'un cavallo', 'a horse'), l11Tile('cavalli', 'cavalli', 'horses'), l11Tile('un cane', 'un cane', 'a dog'),
  l11Tile('un angelo', 'un angelo', 'an angel'), l11Tile('una persona', 'una persona', 'a person'), l11Tile('persone', 'persone', 'people'),
];
const L11_POLITE = [
  l11Tile('sì', 'Sì', 'yes'), l11Tile('no', 'No', 'no'), l11Tile('sì certo', 'Sì, certo!', 'yes, of course!'), l11Tile('non lo so', 'Non lo so', "I don't know"),
  l11Tile('arrivederci', 'Arrivederci', 'goodbye (polite)'),
];
/* the numbers Lucia's questions need (Quanti cavalli? Quante persone?) */
const L11_NUMS = 12;

/* The handbook chapter */
LESSONS.push({
  n:11, title:'Al museo', sub:'Describing, comparing, and how people seem',
  dlgNote:'Two friends in a museum, in front of two paintings. Friends: tu.',
  dialogue:[
    ['Giulia', 'Quale è più vecchio?', 'Which one is older?'],
    ['Marco', 'Questo è più vecchio di quello.', 'This one is older than that one.'],
    ['Giulia', 'Quante persone ci sono?', 'How many people are there?'],
    ['Marco', 'Ci sono tre persone.', 'There are three people.'],
    ['Giulia', 'Secondo te, lui sembra triste?', 'Do you think he looks sad?'],
    ['Marco', 'No, sembra arrabbiato!', 'No, he looks angry!'],
    ['Giulia', 'Cosa ti piace di questo quadro?', 'What do you like about this painting?'],
    ['Marco', 'Mi piacciono i colori.', 'I like the colours.'],
    ['Giulia', 'Quale preferisci?', 'Which one do you prefer?'],
    ['Marco', 'Preferisco questo.', 'I prefer this one.'],
  ],
  pitches:{ Giulia:1.15, Marco:0.85 },
  phrasesTitle:'What you say',
  phrases:[
    ['più … di / meno … di', 'more … than / less … than', 'Questo è più vecchio di quello. Quello è meno vecchio di questo.'],
    ['il più grande della sala', 'the biggest in the room', 'Il più … = the most …, the …est. È il più grande!'],
    ['questo / quello · questa / quella', 'this one / that one', 'On their own, with no noun: questo for il quadro, questa for la statua.'],
    ["c'è / ci sono", 'there is / there are', "C'è un cane. Ci sono tre persone."],
    ['È di Caravaggio.', "It's by Caravaggio.", 'Di + the artist: who made it.'],
    ['Sembra triste.', 'He / she seems sad.', 'Sembra + an adjective that agrees with the person.'],
    ['Secondo Lei… / Secondo te…', 'In your opinion… (polite / to a friend)', 'Secondo me: in my opinion.'],
    ['Mi piace / mi piacciono', 'I like (one thing / more than one)', 'Mi piace il viso. Mi piacciono i colori.'],
    ['Cosa Le piace di…?', 'What do you like about…? (polite)', 'Cosa ti piace di…? to a friend.'],
    ['Preferisco questo.', 'I prefer this one.', 'Quale preferisce? (polite) · Quale preferisci? (to a friend)'],
  ],
  phrases2Title:"What you'll hear",
  phrases2:[
    ['Troppo vicino!', 'Too close!', 'The custodian, when you step over a rope.'],
    ['Non si tocca!', 'No touching!', 'Literally “one does not touch”.'],
    ['Bellissimo, vero?', "Beautiful, isn't it?", 'Visitors chatting.'],
    ['Possiamo darci del tu?', 'Shall we use “tu”?', 'Someone you call Lei suggests being less formal.'],
  ],
  extraTitle:'How do they seem?',
  extraNote:'The -o / -a adjectives agree with the person: Giuditta sembra arrabbiata, Oloferne sembra spaventato. Felice and triste never change.',
  extra:[['😊 felice', 'happy'], ['😢 triste', 'sad'], ['😠 arrabbiato / arrabbiata', 'angry'], ['😨 spaventato / spaventata', 'frightened'],
    ['😮 sorpreso / sorpresa', 'surprised'], ['😌 calmo / calma', 'calm'], ['😩 stanco / stanca', 'tired']],
  how:`<p><b>Comparing.</b> <b>più</b> + adjective + <b>di</b>: <i>Questo è più vecchio <b>di</b> quello.</i> With <b>questo / quello</b> on their own
      you need no article. <b>meno … di</b> is the other way round: <i>Quello è meno vecchio di questo.</i>
      (With a name: <i>più vecchio della Primavera</i>: <i>di + la = della</i>, which comes later.)</p>
    <p><b>The most.</b> <b>il più</b> + adjective: <i>La scuola di Atene è il più grande!</i> (<i>il quadro più grande</i>).</p>
    <p><b>Agreement.</b> The adjective agrees with the thing: <i>questo quadro è più vecchio</i>, but <i>questa statua è più vecchi<b>a</b> di quella</i>.
      With <b>sembra</b> the adjective agrees with the person: <i>Giuditta sembra arrabbiat<b>a</b>, Oloferne sembra spaventat<b>o</b></i>.
      <i>Grande, giovane, felice, triste</i> end in -e: they never change.</p>
    <p><b>C'è / ci sono.</b> <i>C'è</i> + one thing, <i>ci sono</i> + more than one: <i>C'è un cane. Ci sono nove persone.</i></p>
    <p><b>Mi piace / mi piacciono.</b> <i>Mi piace</i> + one thing (<i>il viso</i>), <i>mi piacciono</i> + more than one (<i>i colori</i>).</p>
    <p><b>Preferire.</b> <b>preferisco</b> (I), <b>preferisci</b> (you, to a friend), <b>preferisce</b> (he, she; you, polite).</p>`,
  culture:`<p>In Italian museums you look but you never touch, and a custodian (<i>il custode</i>) in every room makes sure of it. Many
      museums forbid flash photography: <i>È vietato fare foto con il flash</i>.</p>
    <p><b>Darsi del tu.</b> When someone you have been calling <i>Lei</i> asks <i>Possiamo darci del tu?</i>, it is a small, friendly
      milestone: from now on you are <i>tu</i> to each other, <i>ciao</i> instead of <i>buongiorno</i>.</p>`,
  exercises:[
    { type:'mc', q:'🖼️ You are standing at a painting from 1333. The one beside it is from 1425. Which is true?', opts:['Questo è più vecchio di quello.', 'Questo è più moderno di quello.', 'Quello è più vecchio di questo.'], a:0,
      why:'1333 is older: questo (the one you are at) è più vecchio di quello.', nudge:'Which date is older, the one in front of you or the other one?' },
    { type:'mc', q:'A statue: «Questa statua è più ___ di quella.» (old)', opts:['vecchio', 'vecchia', 'vecchie'], a:1, why:'La statua is feminine, one statue: vecchia.', nudge:'Statua ends in -a: feminine.' },
    { type:'mc', q:'🐴🐴🐴 In the painting: «___ tre cavalli.»', opts:["C'è", 'Ci sono', 'Sono'], a:1, why:"More than one: ci sono. (C'è is for one thing.)", nudge:'Three horses: more than one.' },
    { type:'mc', q:'😠 Giuditta sembra…', opts:['felice', 'arrabbiata', 'arrabbiato'], a:1, why:'Angry, and Giuditta is a woman: arrabbiata.', nudge:'The adjective agrees with the person.' },
    { type:'mc', q:'You like the colours: «___ i colori.»', opts:['Mi piace', 'Mi piacciono', 'Preferisce'], a:1, why:'More than one thing (i colori): mi piacciono.', nudge:'I colori is plural.' },
    { type:'mc', q:'Lucia: «Quale preferisce?» You: «___ questa.»', opts:['Preferisce', 'Preferisco', 'Preferisci'], a:1, why:'About yourself: preferisco. (Preferisce is how she asks you, politely.)', nudge:'You are talking about yourself: io.' },
    { type:'order', q:'This one is bigger than that one.', tiles:['di', 'più', 'Questo', 'quello', 'è', 'grande'], answer:'questo è più grande di quello',
      why:'Questo è più grande di quello: più + adjective + di.', nudge:'Start with this one, then è più …, then di quello.' },
    { type:'mc', q:'By a statue, a little sign: «Non si tocca». It means…', opts:['No flash', 'No touching', 'Too close'], a:1, why:'Non si tocca: one does not touch.', nudge:'Toccare: to touch.', noSpeak:true },
    { type:'mc', q:'You ask a stranger (Lei) what they think: «___, quale è più bello?»', opts:['Secondo te', 'Secondo Lei', 'Secondo me'], a:1, why:'A stranger: Lei. Secondo te is for a friend; secondo me is your own opinion.', nudge:'A stranger: the polite form.' },
    { type:'mc', q:'📏 La scuola di Atene: 500 × 770 cm, the biggest painting in the museum. «È ___!»', opts:['il più grande', 'più grande', 'il più piccolo'], a:0, why:'The biggest: il più grande.', nudge:'The most …: il più.' },
    { type:'order', q:'Holofernes (a man) seems frightened.', tiles:['spaventato', 'Oloferne', 'sembra', 'spaventata'], answer:'Oloferne sembra spaventato',
      why:'Oloferne sembra spaventato: a man, so -o.', nudge:'Sembra + an adjective that agrees with him.' },
  ],
  /* Vocabolario: the doc's 42 terms, plus i colori (Mi piacciono i colori) and Sì, certo! (darsi del tu) */
  vocab:[
    { group:'At the museum', words:[
      { it:'il quadro', g:'m', en:'the painting', also:['quadri'] },
      { it:'la statua', g:'f', en:'the statue', also:['statue'] },
      { it:'la sala', g:'f', en:'the room (in a museum)', note:'Sala 1, Sala 2…' },
      { it:'il pittore', g:'m', en:'the painter' },
      { it:'il custode', g:'m', en:'the custodian' },
    ] },
    { group:'The rules', words:[
      { it:'Troppo vicino!', en:'Too close!' },
      { it:'Non si tocca!', en:'No touching!', note:'Si guarda, non si tocca: you look, you don’t touch.' },
      { it:'È vietato …', say:'È vietato fare foto con il flash.', en:"It's forbidden …", also:['vietato'] },
    ] },
    { group:'Comparing', note:'Più + adjective + di. With questo / quello on their own, no article.', words:[
      { it:'più … di', say:'più vecchio di quello', en:'more … than', also:['più'] },
      { it:'meno … di', say:'meno vecchio di questo', en:'less … than', also:['meno'] },
      { it:'il più …', g:'m', say:'il più grande', en:'the most …, the …est', note:'La più … for a feminine thing: la statua più alta.' },
      { it:'questo / questa', en:'this one', note:'Questo for il quadro, questa for la statua.' },
      { it:'quello / quella', en:'that one' },
      { it:"c'è / ci sono", en:'there is / there are', also:['ci', 'sono'] },
      { it:'è di …', say:'È di Caravaggio.', en:"it's by …" },
    ] },
    { group:'Describing', note:'-o for a masculine thing, -a for a feminine one. Grande and giovane never change.', words:[
      { it:'vecchio / vecchia', en:'old' }, { it:'moderno / moderna', en:'modern' }, { it:'grande', en:'big' },
      { it:'piccolo / piccola', en:'small' }, { it:'alto / alta', en:'tall' }, { it:'scuro / scura', en:'dark' },
      { it:'chiaro / chiara', en:'light, bright' }, { it:'bello / bella', en:'beautiful' }, { it:'giovane', en:'young' },
      { it:'strano / strana', en:'strange' },
    ] },
    { group:'How they seem', note:'Sembra + an adjective that agrees with the person.', words:[
      { it:'felice', en:'happy' }, { it:'triste', en:'sad' }, { it:'arrabbiato / arrabbiata', en:'angry' },
      { it:'spaventato / spaventata', en:'frightened' }, { it:'calmo / calma', en:'calm' }, { it:'sorpreso / sorpresa', en:'surprised' },
      { it:'sembra', en:'he / she seems, you (polite) seem', say:'Sembra triste.' },
      { it:'secondo Lei / te', en:'in your opinion (polite / to a friend)', also:['secondo'], say:'Secondo Lei, sembra triste?' },
    ] },
    { group:'Liking', words:[
      { it:'mi piacciono', en:'I like (more than one thing)', say:'Mi piacciono i colori.' },
      { it:'Cosa Le piace di …?', say:'Cosa Le piace di questo quadro?', en:'What do you like about …? (polite)' },
      { it:'preferisco', en:'I prefer' },
      { it:'preferisce', en:'he / she prefers, you (polite) prefer' },
    ] },
    { group:'In the pictures', words:[
      { it:'il cavallo', g:'m', en:'the horse', also:['cavalli'] },
      { it:'la persona / le persone', g:'f', en:'the person / the people', also:['persona', 'persone'] },
      { it:"l'angelo", g:'m', en:'the angel', also:['angelo', 'angeli'] },
      { it:'il viso', g:'m', en:'the face' },
      { it:'il colore / i colori', g:'m', en:'the colour / the colours', also:['colore', 'colori'] },
    ] },
    { group:'The game', words:[
      { it:'Trova!', en:'Find it!', note:'Vedo, vedo… nel museo: Lucia describes a work, you find it.' },
    ] },
    { group:'Friends', words:[
      { it:'Sì, certo!', en:'Yes, of course!', also:['certo'] },
    ] },
  ],
  verbs:[
    { inf:'sembrare', en:'to seem', forms:[
      { p:'lui', it:'sembra', en:'he / she seems', ex:'Giuditta sembra arrabbiata.' },
      { p:'Lei', it:'sembra', en:'you (polite) seem', ex:'Lei sembra felice!' },
      { p:'loro', it:'sembrano', en:'they seem', ex:'Sembrano felici.' },
    ] },
    { inf:'preferire', en:'to prefer', note:'An -isc- verb: prefer-isc-o.', forms:[
      { p:'io', it:'preferisco', en:'I prefer', ex:'Preferisco questa.' },
      { p:'tu', it:'preferisci', en:'you (friend) prefer', ex:'Quale preferisci?' },
      { p:'Lei', it:'preferisce', en:'you (polite) prefer', ex:'Quale preferisce?' },
      { p:'lui', it:'preferisce', en:'he / she prefers', ex:'Lucia preferisce Canaletto.' },
    ] },
    { inf:'piacere', en:'to like (to please)', forms:[
      { p:'io', it:'mi piacciono', en:'I like them (more than one thing)', ex:'Mi piacciono i colori.' },
    ] },
  ],
  doneTitle:'Ready for Lucia’s homework.', doneGo:'Back to Lucia',
});
