/* Lesson 8 · Mi piace! Lesson data: tiles, colours, the handbook chapter.
   Design: docs/lessons/08-mi-piace.md. Data only (runs before the engine). */

/* "Colori": colours ending in -o change with the noun (rosso/rossa); the others never change */
const L8_COLOURS = [
  { key:'rosso',   label:'rosso',   words:'rosso',   en:'red (masculine: il mazzo rosso)' },
  { key:'rossa',   label:'rossa',   words:'rossa',   en:'red (feminine: la maglietta rossa)' },
  { key:'bianco',  label:'bianco',  words:'bianco',  en:'white (masculine)' },
  { key:'bianca',  label:'bianca',  words:'bianca',  en:'white (feminine)' },
  { key:'nero',    label:'nero',    words:'nero',    en:'black (masculine)' },
  { key:'nera',    label:'nera',    words:'nera',    en:'black (feminine)' },
  { key:'giallo',  label:'giallo',  words:'giallo',  en:'yellow (masculine)' },
  { key:'gialla',  label:'gialla',  words:'gialla',  en:'yellow (feminine)' },
  { key:'verde',   label:'verde',   words:'verde',   en:'green (never changes)' },
  { key:'blu',     label:'blu',     words:'blu',     en:'blue (never changes)' },
];
/* "Comprare": liking, sizes, taking it, paying, the change (cerco is Lesson 6's: what a shopper answers to "Cosa cerca?") */
const L8_BUY = [
  { key:'cerco',         label:'Cerco …',          words:'cerco',          en:"I'm looking for … (Lesson 6)" },
  { key:'ha',            label:'Ha …?',            words:'ha',             en:'do you have …? (polite)' },
  { key:'avete',         label:'Avete …?',         words:'avete',          en:'do you have …? (asking the whole stall)' },
  { key:'una maglietta', label:'una maglietta',    words:'una maglietta',  en:'a T-shirt' },
  { key:'mi piace',      label:'Mi piace.',        words:'mi piace',       en:'I like it.' },
  { key:'non mi piace',  label:'Non mi piace.',    words:'non mi piace',   en:"I don't like it." },
  { key:'le piace',      label:'Le piace?',        words:'le piace',       en:'do you like it? (polite)' },
  { key:'ti piace',      label:'Ti piace?',        words:'ti piace',       en:'do you like it? (friend)' },
  { key:'troppo',        label:'troppo',           words:'troppo',         en:'too (troppo piccola: too small)' },
  { key:'piccola',       label:'piccola',          words:'piccola',        en:'small (feminine)' },
  { key:'grande',        label:'grande',           words:'grande',         en:'big, large (never changes)' },
  { key:'una taglia più grande', label:'una taglia più grande', words:'una taglia più grande', en:'a bigger size' },
  { key:'è per il mio amico', label:'È per il mio amico.', words:'è per il mio amico', en:"It's for my friend." },
  { key:'la prendo',     label:'La prendo.',       words:'la prendo',      en:"I'll take it. (la maglietta)" },
  { key:'lo prendo',     label:'Lo prendo.',       words:'lo prendo',      en:"I'll take it. (il mazzo)" },
  { key:'ecco',          label:'Ecco',             words:'ecco',           en:'here is / here you are' },
  { key:'euro',          label:'euro',             words:'euro',           en:'euro, euros (never changes)' },
  { key:'il resto',      label:'il resto',         words:'il resto',       en:'the change' },
  { key:'non è giusto',  label:'non è giusto',     words:'non è giusto',   en:"isn't right" },
  { key:'mancano',       label:'mancano',          words:'mancano',        en:'… are missing (mancano due euro)' },
];
/* at the flower stall */
const L8_FLOWERS = [
  { key:'le rose rosse', label:'le rose rosse',    words:'le rose rosse',  en:'the red roses' },
  { key:'il mazzo',      label:'il mazzo',         words:'il mazzo',       en:'the bunch (masculine: lo prendo)' },
];
const L8_PLEASE = { key:'per favore', label:'per favore', words:'per favore', en:'please' };
/* Lesson 6's polite address, for greeting a vendor: Buongiorno, signora! */
const L8_ADDRESS = [
  { key:'signora', label:'signora', words:'signora', en:'madam (polite)' },
  { key:'signore', label:'signore', words:'signore', en:'sir (polite)' },
];
/* before the practice (the barrier): what a shopper already has from Lesson 6 (and blu), beside Lesson 7's market pack */
const L8_SHOP = () => [...L8_BUY.filter(t => ['cerco', 'ha', 'una maglietta'].includes(t.key)), L8_COLOURS.find(t => t.key === 'blu')];

/* colours: masculine / feminine forms (x: never changes) */
const L8_COLOUR = {
  rosso:{ m:'rosso', f:'rossa', en:'red' }, bianco:{ m:'bianco', f:'bianca', en:'white' }, nero:{ m:'nero', f:'nera', en:'black' },
  giallo:{ m:'giallo', f:'gialla', en:'yellow' }, verde:{ x:'verde', en:'green' }, blu:{ x:'blu', en:'blue' }, arancione:{ x:'arancione', en:'orange' },
};

/* The handbook chapter */
LESSONS.push({
  n:8, title:'Mi piace!', sub:'Buying, and what you think',
  dlgNote:'A shopper at a clothes stall in the market.',
  dialogue:[
    ['Tu', 'Buongiorno! Come sta?', 'Good morning! How are you?'],
    ['Signora', 'Bene, grazie. Cosa cerca?', 'Fine, thanks. What are you looking for?'],
    ['Tu', 'Ha questa maglietta in verde?', 'Do you have this T-shirt in green?'],
    ['Signora', 'No, mi dispiace, è finita. Le piace la nera?', "No, I'm sorry, it's sold out. Do you like the black one?"],
    ['Tu', 'Sì, mi piace! Posso provarla?', 'Yes, I like it! Can I try it on?'],
    ['Signora', 'Certo. … Le sta bene!', 'Of course. … It suits you!'],
    ['Tu', 'La prendo. Quanto costa?', "I'll take it. How much is it?"],
    ['Signora', 'Sono dodici euro.', "It's twelve euros."],
    ['Tu', 'Ecco venti euro.', "Here's twenty euros."],
    ['Signora', 'Ecco il resto: otto euro.', "Here's your change: eight euros."],
  ],
  pitches:{ Tu:1.1, Signora:1.15 },
  phrasesTitle:'What you say',
  phrases:[
    ['Mi piace. / Non mi piace.', "I like it. / I don't like it.", 'Literally: it pleases me / it doesn\'t please me.'],
    ['Le piace? / Ti piace?', 'Do you like it?', 'Le to a stranger or a shopkeeper, ti to a friend.'],
    ['Ha una maglietta rossa?', 'Do you have a red T-shirt?', 'Avete …? asks the whole stall: also fine.'],
    ['È troppo piccola / grande.', "It's too small / too big.", 'Troppo = too. Piccola, because la maglietta is feminine.'],
    ['Ha una taglia più grande?', 'Do you have a bigger size?', 'Più grande = bigger. La taglia = the size.'],
    ['La prendo. / Lo prendo.', "I'll take it.", 'La for la maglietta, lo for il mazzo.'],
    ['Ecco venti euro.', "Here's twenty euros.", 'Ecco = here is, here you are.'],
    ['Il resto non è giusto. Mancano due euro.', "The change isn't right. Two euros are missing.", 'Start with Scusi. Mancano = are missing.'],
  ],
  phrases2Title:"What you'll hear",
  phrases2:[
    ['È finita.', "It's sold out.", 'Literally: it is finished. Finito for a masculine thing.'],
    ['Che taglia porta?', 'What size do you wear?', 'Answer with the size: grande, piccola, extra large…'],
    ['Le sta bene / benissimo.', 'It suits you / it really suits you.', 'Literally: it stays well on you.'],
    ['Ecco il resto.', "Here's your change.", 'Count it before you go!'],
    ['Un bel mazzo?', 'A nice bunch?', 'A flower seller offering a whole bouquet.'],
  ],
  extraTitle:'Colours', extraNote:'Colours ending in -o change like the noun: la maglietta rossa, il mazzo rosso. The others never change.',
  extra:[['rosso / rossa', 'red'], ['bianco / bianca', 'white'], ['nero / nera', 'black'], ['giallo / gialla', 'yellow'],
    ['verde', 'green'], ['blu', 'blue'], ['rosa', 'pink'], ['arancione', 'orange']],
  /* Vocabolario (ui/vocab.js): every word of the Colori / Comprare / Fiori tiles and of Mark's typed sentences
     (scripts.js). Lesson 7's words and the numbers 0–20 are known already. Learned with the word check before the practice. */
  vocab:[
    { group:'Colours', note:'Colours ending in -o have two forms: il mazzo rosso, la maglietta rossa.', words:[
      { it:'rosso / rossa', en:'red', note:'Il rosso = red, the colour: a Emma piace il rosso.' },
      { it:'bianco / bianca', en:'white', note:'La bianca = the white one (la maglietta).' },
      { it:'nero / nera', en:'black' },
      { it:'giallo / gialla', en:'yellow' },
      { it:'verde', en:'green', note:'Never changes: il mazzo verde, la maglietta verde.' },
      { it:'blu', en:'blue', note:'Never changes. You met it in Lesson 6: un libro blu.' },
    ] },
    { group:'Sizes', words:[
      { it:'la taglia', g:'f', en:'the size', note:'Che taglia porta? = What size do you wear?' },
      { it:'piccolo / piccola', en:'small', note:'La maglietta è piccola: feminine.' },
      { it:'grande', en:'big, large', note:'Never changes: grande for both.' },
      { it:'troppo', en:'too (too much)', note:'È troppo piccola = it is too small.' },
      { it:'più grande', en:'bigger', note:'Una taglia più grande = a bigger size.' },
      { it:'extra large', en:'the biggest size (XL)', note:'Sizes are often said in English: la extra large.' },
    ] },
    { group:'Liking', note:'Piacere works backwards: the thing pleases you.', words:[
      { it:'Mi piace.', en:'I like it.' },
      { it:'Non mi piace.', en:"I don't like it." },
      { it:'Le piace?', en:'Do you like it? (polite, Lei)', note:'To a shopkeeper or a stranger.' },
      { it:'Ti piace?', en:'Do you like it? (to a friend)' },
      { it:'A Emma piace …', say:'A Emma piace il rosso.', en:'Emma likes …', note:'A Emma piace il rosso = red pleases Emma.' },
      { it:'davvero', en:'really', note:'Le piace davvero? = Do you really like it?' },
    ] },
    { group:'Buying', words:[
      { it:'Ha …?', say:'Ha una maglietta rossa?', en:'Do you have …? (polite, one person)', note:'Review from Lesson 6: ha una maglietta rossa?' },
      { it:'Avete …?', say:'Avete le rose rosse?', en:'Do you have …? (the whole stall)', note:'Review from Lesson 4.' },
      { it:'È per …', say:'È per il mio amico.', en:"It's for …", note:'È per il mio amico. È per Emma.' },
      { it:'La prendo.', en:"I'll take it. (la maglietta)", note:'La for a feminine thing.' },
      { it:'Lo prendo.', en:"I'll take it. (il mazzo)", note:'Lo for a masculine thing.' },
      { it:'Ecco …', say:'Ecco venti euro.', en:'Here is … / here you are', note:'Ecco venti euro.' },
      { it:'il resto', g:'m', en:'the change (money back)', note:'Ecco il resto = here is your change.' },
      { it:'non è giusto', en:"it isn't right", note:'Il resto non è giusto.' },
      { it:'mancano …', say:'Mancano due euro.', en:'… are missing', note:'Mancano due euro. One thing: manca.' },
    ] },
    { group:'Flowers', words:[
      { it:'le rose', g:'f pl', en:'the roses', also:['rosse'], note:'One rose: la rosa. Red roses: le rose rosse (plural: rosse).' },
      { it:'il mazzo', g:'m', en:'the bunch', note:'Il mazzo di rose. Masculine, so: lo prendo.' },
    ] },
  ],
  how:`<p><b>Piacere</b> works backwards: the thing you like is the subject, and it pleases you. <b>Mi piace il rosso</b> = red pleases me: I like red.</p>
    <p>Asking: <b>Le piace?</b> (polite, Lei) · <b>Ti piace?</b> (a friend). Someone else: <b>A Emma piace il rosso</b> = red pleases Emma.</p>
    <p>Colours ending in <b>-o</b> change like the noun: <i>la maglietta <b>rossa</b></i>, <i>il mazzo <b>rosso</b></i>. <i>Verde, blu, rosa, arancione</i> never change.</p>
    <p><b>La prendo</b> / <b>lo prendo</b> (I'll take it): the little word matches the thing. <i>La</i> maglietta → <b>la</b> prendo; <i>il</i> mazzo → <b>lo</b> prendo.</p>`,
  culture:`<p>At clothes stalls, trying on is often done behind a curtain, or over your clothes. Gentle haggling is sometimes fine there, but never at food stalls.</p>
    <p><b>Always count your change.</b> If it's wrong, saying so politely is completely normal: <i>Scusi, il resto non è giusto.</i></p>`,
  exercises:[
    { type:'mc', q:'La maglietta è ___.', opts:['rosso', 'rossa'], a:1, why:'Maglietta is feminine: la maglietta rossa.', nudge:'The colour ends like the noun: la maglietta…' },
    { type:'mc', q:'You ask Teresa, the vendor, if she likes it.', opts:['Ti piace?', 'Le piace?'], a:1, why:'Teresa is a stranger: Le piace?', nudge:'Strangers and shopkeepers get Lei.' },
    { type:'mc', q:'Your friend Chiara shows you her new scarf. You like it!', opts:['Mi piace!', 'Le piace!'], a:0, why:'Mi piace = I like it.', nudge:'You are talking about yourself: mi.' },
    { type:'mc', q:'Il mazzo di rose? “I\'ll take it.”', opts:['La prendo.', 'Lo prendo.'], a:1, why:'Il mazzo is masculine: lo prendo.', nudge:'Il mazzo: masculine.' },
    { type:'order', q:"It's too small.", tiles:['piccola', 'è', 'troppo'], answer:'è troppo piccola', why:'È troppo piccola.', nudge:'Start with è (it is).' },
    { type:'mc', q:'It costs 12 euros. You pay with 20. The change is…', opts:['otto euro', 'sei euro', 'dodici euro'], a:0, why:'20 − 12 = 8: otto euro.', nudge:'Twenty minus twelve.' },
    { type:'order', q:'Emma likes red.', tiles:['piace', 'il rosso', 'a Emma'], answer:'a Emma piace il rosso', why:'Red pleases Emma: a Emma piace il rosso.', nudge:'Piacere works backwards: start with a Emma.' },
  ],
  doneTitle:'Ready to shop.', doneGo:'Back to Teresa',
});
