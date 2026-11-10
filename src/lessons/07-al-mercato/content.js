/* Lesson 7 · Al mercato. Lesson data: tiles, the market stalls, Bruno's directions, the handbook chapter.
   Design: docs/lessons/07-al-mercato.md. Data only (runs before the engine). */

/* The "Al mercato" pack, in the tile bank at the market stalls once the practice is done */
const L7_TILES = [
  { key:'quanto costa',      label:'Quanto costa?',     words:'quanto costa',      en:'how much is it?' },
  { key:'questo',            label:'questo',            words:'questo',            en:'this one (masculine: il mazzo, il melone)' },
  { key:'questa',            label:'questa',            words:'questa',            en:'this one (feminine: la maglietta, la cravatta)' },
  { key:'la maglietta',      label:'la maglietta',      words:'la maglietta',      en:'the T-shirt' },
  { key:'la cravatta',       label:'la cravatta',       words:'la cravatta',       en:'the tie' },
  { key:'il mazzo di fiori', label:'il mazzo di fiori', words:'il mazzo di fiori', en:'the bunch of flowers' },
  { key:'il melone',         label:'il melone',         words:'il melone',         en:'the melon' },
  { key:'non ho capito',     label:'Non ho capito.',    words:'non ho capito',     en:"I didn't understand." },
];
/* polite review tiles shown beside the pack at the stalls (already known from Lessons 3 and 6) */
const L7_POLITE = [
  { key:'scusi',          label:'Scusi',          words:'scusi',          en:'excuse me (polite)' },
  { key:'può ripetere',   label:'Può ripetere?',  words:'può ripetere',   en:'can you repeat? (polite)' },
  { key:'sì',             label:'Sì',             words:'sì',             en:'yes' },
  { key:'grazie mille',   label:'Grazie mille',   words:'grazie mille',   en:'thanks a lot' },
  { key:'arrivederci',    label:'Arrivederci',    words:'arrivederci',    en:'goodbye (polite)' },
];
const L7_PLACE_TILE = { key:'il mercato', label:'il mercato', words:'il mercato', en:'the market', place:'mercato' };

/* The stalls. item = the key in S.l7.prices; g = gender (for questo/questa); range = whole euros.
   The three required prices are all different (picked in startLesson7). */
const L7_STALLS = {
  teresa:{ item:'maglietta', label:'la maglietta', g:'f', range:[11, 19], req:true, short:'shirt', en:'the T-shirt',
    sells:{ it:'magliette', en:'T-shirts' }, ask:{ it:'La maglietta blu?', en:'The blue T-shirt?' }, verb:'sono',
    point:'That blue one! How much?', after:{ it:'Le piace? È bella, eh!', en:"Do you like it? It's nice, eh!" } },
  franco:{ item:'cravatta', label:'la cravatta', g:'f', range:[6, 14], req:true, short:'tie', en:'the tie',
    sells:{ it:'cravatte e sciarpe', en:'ties and scarves' }, ask:{ it:'La cravatta?', en:'The tie?' }, verb:'costa',
    point:"And a tie. That dark red one. Ask him how much.", after:{ it:'Prego!', en:"You're welcome!" } },
  gino:{ item:'fiori', label:'il mazzo di fiori', g:'m', range:[4, 12], req:true, short:'flowers', en:'the bunch of flowers',
    sells:{ it:'fiori', en:'flowers' }, ask:{ it:'Il mazzo di fiori?', en:'The bunch of flowers?' }, verb:'sono',
    point:'Flowers for tonight! That little bunch. How much?', after:{ it:'Le piace? Sono freschi, di stamattina!', en:"Do you like it? They're fresh, from this morning!" } },
  pina:{ item:'melone', label:'il melone', g:'m', range:[1, 5], req:false, short:'melon', en:'the melon',
    sells:{ it:'frutta e verdura', en:'fruit and vegetables' }, ask:{ it:'Il melone?', en:'The melon?' }, verb:'sono',
    point:"Ooh, melons. Not on the list, but I'm curious. How much?", after:{ it:'Prego! È dolcissimo.', en:"You're welcome! It's very sweet." } },
};
const L7_REQUIRED = ['teresa', 'franco', 'gino'];

/* Bruno → the market (Lei imperatives). Route on the city map, starting north from the piazza. */
const L7_ROUTE = [[2,4],[2,3],[1,3],[1,2],[0,2],[0,1]];
const L7_BRUNO_DIR = {
  intro:{ it:'Il mercato? È in Piazza delle Erbe. Non è lontano!', en:"The market? It's in Piazza delle Erbe. It's not far!" },
  lines:[
    { it:'Vada sempre dritto, e alla prima strada giri a sinistra.', en:'Keep going straight, and take the first street on the left.' },
    { it:'Poi giri a destra, fino alla farmacia.', en:'Then turn right, as far as the pharmacy.' },
    { it:'Alla farmacia giri a sinistra, e poi subito a destra.', en:'At the pharmacy turn left, then right straight away.' },
    { it:'Il mercato è lì, vicino alla chiesa.', en:'The market is there, near the church.' },
  ],
  confirm:{
    left:{ it:'Sì, a sinistra alla prima strada. Poi a destra.', en:'Yes, left at the first street. Then right.' },
    right:{ it:'A destra dopo la prima strada, sì, fino alla farmacia.', en:'Right after the first street, yes, as far as the pharmacy.' },
    straight:{ it:'Sì, sempre dritto fino alla prima strada.', en:'Yes, straight on as far as the first street.' },
  },
  far:{ it:'No, no. Cinque minuti a piedi.', en:'No, no. Five minutes on foot.' },
  route:true,
};

/* The handbook chapter */
LESSONS.push({
  n:7, title:'Al mercato', sub:'Numbers, and how much things cost',
  dlgNote:'At a market stall. Prices are said, not written.',
  dialogue:[
    ['Tu', 'Buongiorno! Come sta?', 'Good morning! How are you?'],
    ['Signora', 'Bene, grazie. E Lei?', 'Fine, thanks. And you?'],
    ['Tu', 'Sto bene, grazie. Quanto costa questa?', "I'm fine, thanks. How much is this one?"],
    ['Signora', 'La maglietta? Sono tredici euro.', "The T-shirt? It's thirteen euros."],
    ['Tu', 'Può ripetere?', 'Can you repeat that?'],
    ['Signora', 'Tre-di-ci. Tredici euro.', 'Thir-teen. Thirteen euros.'],
    ['Tu', 'Grazie! Arrivederci!', 'Thanks! Goodbye!'],
  ],
  pitches:{ Tu:1.1, Signora:1.15 },
  phrasesTitle:'What you say',
  phrases:[
    ['Quanto costa?', 'How much is it?', 'Literally: how much does it cost?'],
    ['Quanto costa questo / questa?', 'How much is this one?', 'Questa for a feminine thing like la maglietta, questo for il melone.'],
    ['Può ripetere?', 'Can you repeat that?', 'Review: the polite Lei form. To a friend: puoi ripetere?'],
    ['Non ho capito.', "I didn't understand.", 'The vendor will say it again, more slowly.'],
    ['Grazie, arrivederci!', 'Thanks, goodbye!', 'Arrivederci is the polite goodbye for shopkeepers.'],
  ],
  phrases2Title:"What you'll hear",
  phrases2:[
    ['Sono … euro.', "It's … euros.", 'The usual way to say a price: sono quindici euro.'],
    ['Costa … euro.', 'It costs … euros.', 'Also common: costa dodici euro.'],
    ['È un euro.', "It's one euro.", 'One euro is singular: è, not sono.'],
    ['Cosa cerca?', 'What are you looking for?', 'What a vendor says when you stop at the stall. Cerca: the polite form of cerco (Lesson 6).'],
    ['Le piace?', 'Do you like it?', 'Polite Lei form. You will learn to answer in the next lesson.'],
    ['Prego!', "You're welcome! / Here you are!", 'The answer to grazie.'],
  ],
  extraTitle:'Numbers 0–20', extraNote:'Learn them in order, then practise hearing them in the numbers drill.',
  extra:[['0','zero'],['1','uno'],['2','due'],['3','tre'],['4','quattro'],['5','cinque'],['6','sei'],['7','sette'],['8','otto'],['9','nove'],['10','dieci'],
    ['11','undici'],['12','dodici'],['13','tredici'],['14','quattordici'],['15','quindici'],['16','sedici'],['17','diciassette'],['18','diciotto'],['19','diciannove'],['20','venti']],
  /* Vocabolario (ui/vocab.js): every word of the tiles at the stalls, the place tile and the Polite review group.
     Learned with the word check before the practice. The numbers are taught by the drill, after the practice. */
  vocab:[
    { group:'At the market', words:[
      { it:'il mercato', g:'m', en:'the market', note:"Scusi, dov'è il mercato?" },
      { it:'la maglietta', g:'f', en:'the T-shirt', note:'Plural: le magliette.' },
      { it:'la cravatta', g:'f', en:'the tie', note:'Plural: le cravatte.' },
      { it:'il mazzo di fiori', g:'m', en:'the bunch of flowers', note:'Il mazzo = the bunch; i fiori = the flowers.' },
      { it:'il melone', g:'m', en:'the melon' },
    ] },
    { group:'Asking the price', words:[
      { it:'Quanto costa?', en:'How much is it?', note:'Literally: how much does it cost?' },
      { it:'questo', en:'this one (a masculine thing)', note:'For il melone, il mazzo: quanto costa questo?' },
      { it:'questa', en:'this one (a feminine thing)', note:'For la maglietta, la cravatta: quanto costa questa?' },
      { it:'euro', en:'euro, euros', note:'Never changes: un euro, dieci euro.' },
      { it:'Sono … euro.', say:'Sono dieci euro.', en:"It's … euros.", note:"What you'll hear. One euro is singular: è un euro." },
      { it:'Non ho capito.', en:"I didn't understand.", note:'The vendor will say it again, more slowly.' },
    ] },
    { group:'Polite (review)', note:'From Lessons 2, 3 and 6. Vendors are strangers: Lei forms.', words:[
      { it:'Scusi', en:'excuse me (polite)', note:'To a friend: scusa.' },
      { it:'Può ripetere?', en:'Can you repeat that? (polite)', note:'To a friend: puoi ripetere?' },
      { it:'Sì', en:'yes' },
      { it:'Grazie mille', en:'thanks a lot' },
      { it:'Arrivederci', en:'goodbye (polite)', note:'Ciao is for friends.' },
    ] },
    { group:'Numbers 0–20', numbers:true,
      note:'<b>zero</b> to <b>venti</b>: the grid above. You learn them in the <b>numbers drill</b>, right after the practice: spell them, then hear them.' },
  ],
  numbersDrill:true,
  numbersDrillNote:'Spell 0–20 and back, then listen and type what you hear. Get five numbers in a row right and you are ready for the market.',
  how:`<p><b>11–16</b> end in <b>-dici</b>: <i>undici, dodici, tredici, quattordici, quindici, sedici</i>. <b>17–19</b> start with <b>dicia-</b>: <i>diciassette, diciotto, diciannove</i>.</p>
    <p>Careful: <b>sei</b> (6) vs <b>sedici</b> (16), <b>tre</b> (3) vs <b>tredici</b> (13).</p>
    <p><b>Euro</b> never changes: <i>un euro, due euro, quindici euro</i>. One euro is singular, <b>è un euro</b>; everything else is <b>sono … euro</b>.</p>`,
  culture:`<p>The market in Padua's <b>Piazza delle Erbe</b> runs every morning except Sunday. <b>Greet before you ask anything</b>: <i>Buongiorno! Come sta?</i> At fruit stalls, don't touch: the vendor picks for you. Cash is still king at many stalls.</p>`,
  exercises:[
    { type:'mc', q:'What is quindici?', opts:['5', '15', '50'], a:1, why:'Quindici = 15. 11–16 end in -dici.', nudge:'Numbers ending in -dici are between 11 and 16.' },
    { type:'mc', q:'Which is 16?', opts:['sei', 'sedici', 'sette'], a:1, why:'Sedici = 16. Sei is 6.', nudge:'16 is “six” + “-dici”.' },
    { type:'mc', q:'One euro.', opts:['Sono un euro.', 'È un euro.'], a:1, why:'One euro is singular: è un euro.', nudge:'Un euro is one thing: singular verb.' },
    { type:'order', q:'How much is it?', tiles:['costa', 'quanto'], answer:'quanto costa', why:'Quanto costa? = How much is it?', nudge:'The question word comes first.' },
    { type:'mc', q:'You walk up to a stall. What comes first?', opts:['Quanto costa?', 'Buongiorno! Come sta?'], a:1, why:'Greet first. Market vendors expect it before any business.', nudge:'Be polite before you talk money.' },
    { type:'mc', q:'What is diciotto?', opts:['8', '18', '80'], a:1, why:'Diciotto = 18. 17–19 start with dicia-.', nudge:'Dici- at the start means it is in the teens.' },
  ],
  doneTitle:'Ready to ask the price.', doneGo:'Open the numbers drill',
});
