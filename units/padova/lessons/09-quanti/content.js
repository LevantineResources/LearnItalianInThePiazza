/* Lesson 9 · Due magliette, tre rose. Lesson data: the goods (singular and plural), the shopping list, the tiles, the
   directions for Sofia, the handbook chapter. Design: docs/lessons/09-quanti.md. Data only (runs before the engine). */

/* The goods on the shopping list (and a plant, which Gino has run out of). sg / pl: the forms; g: gender; one: the
   indefinite article; the / thePl: the definite articles; en: [one, many]; rule: which plural pattern (hints). */
const L9_GOODS = {
  maglietta:{ sg:'maglietta', pl:'magliette', g:'f', one:'una', the:'la', thePl:'le', en:['T-shirt', 'T-shirts'], stall:'teresa', rule:'a' },
  cravatta:{ sg:'cravatta', pl:'cravatte', g:'f', one:'una', the:'la', thePl:'le', en:['tie', 'ties'], stall:'franco', rule:'a' },
  sciarpa:{ sg:'sciarpa', pl:'sciarpe', g:'f', one:'una', the:'la', thePl:'le', en:['scarf', 'scarves'], stall:'franco', rule:'a' },
  rosa:{ sg:'rosa', pl:'rose', g:'f', one:'una', the:'la', thePl:'le', en:['rose', 'roses'], stall:'gino', rule:'a' },
  girasole:{ sg:'girasole', pl:'girasoli', g:'m', one:'un', the:'il', thePl:'i', en:['sunflower', 'sunflowers'], stall:'gino', rule:'e' },
  pianta:{ sg:'pianta', pl:'piante', g:'f', one:'una', the:'la', thePl:'le', en:['plant', 'plants'], stall:'gino', rule:'a', off:true },
  arancia:{ sg:'arancia', pl:'arance', g:'f', one:"un'", the:"l'", thePl:'le', en:['orange', 'oranges'], stall:'pina', rule:'cia' },
  pomodoro:{ sg:'pomodoro', pl:'pomodori', g:'m', one:'un', the:'il', thePl:'i', en:['tomato', 'tomatoes'], stall:'pina', rule:'o' },
  melone:{ sg:'melone', pl:'meloni', g:'m', one:'un', the:'il', thePl:'i', en:['melon', 'melons'], stall:'pina', rule:'e' },
};
/* the plural patterns, for the hints that point at the ending */
const L9_RULES = {
  a:{ end:'-a', pl:'-e', ex:'maglietta → magliette' }, o:{ end:'-o', pl:'-i', ex:'pomodoro → pomodori' },
  e:{ end:'-e', pl:'-i', ex:'girasole → girasoli' }, cia:{ end:'-cia', pl:'-ce', ex:'arancia → arance' },
};
/* The shopping list, stall by stall: [good, the quantities it can have]. The numbers vary a little between playthroughs
   (the flowers always add up to an odd number: see the culture note). The vendor in `check` asks "Quante …? / Quanti …?". */
const L9_LIST = [
  { stall:'teresa', at:"At Teresa's", items:[['maglietta', [2, 3]]], total:[10, 18], note:'any colour' },
  { stall:'franco', at:"At Franco's", items:[['cravatta', [2, 3]], ['sciarpa', [1]]], total:[11, 19] },
  { stall:'gino', at:"At Gino's", items:[['rosa', [3, 5]], ['girasole', [2, 4]]], total:[9, 17], check:'rosa' },
  { stall:'pina', at:"At Pina's", items:[['arancia', [4, 5, 6]], ['pomodoro', [4, 5, 6]], ['melone', [1]]], total:[6, 14], check:'pomodoro' },
];
const L9_STALL_IDS = L9_LIST.map(s => s.stall);
const L9_SELLS = { teresa:{ it:'magliette', en:'T-shirts' }, franco:{ it:'cravatte e sciarpe', en:'ties and scarves' },
  gino:{ it:'fiori', en:'flowers' }, pina:{ it:'frutta e verdura', en:'fruit and vegetables' } };

/* colours: every form (x: never changes). Only Teresa's tiles have colours. */
const L9_COLOUR = {
  rosso:{ m:'rosso', f:'rossa', mp:'rossi', fp:'rosse', en:'red' }, bianco:{ m:'bianco', f:'bianca', mp:'bianchi', fp:'bianche', en:'white' },
  nero:{ m:'nero', f:'nera', mp:'neri', fp:'nere', en:'black' }, giallo:{ m:'giallo', f:'gialla', mp:'gialli', fp:'gialle', en:'yellow' },
  verde:{ m:'verde', f:'verde', mp:'verdi', fp:'verdi', en:'green' }, blu:{ x:'blu', en:'blue' }, rosa:{ x:'rosa', en:'pink' },
};

/* ---------- tiles ---------- */
const l9Tile = (w, en) => ({ key:w, label:w, words:w, en });
/* "Plurali": each stall's goods, both forms (the player picks the ending) */
const L9_NOUN_TILES = Object.fromEntries(Object.entries(L9_GOODS).map(([k, g]) =>
  [k, [l9Tile(g.sg, `${g.en[0]} (one: ${g.one}${g.one.endsWith("'") ? '' : ' '}${g.sg})`), l9Tile(g.pl, `${g.en[1]} (two or more: ${g.thePl} ${g.pl})`)]]));
/* "Comprare": asking for things, paying */
const L9_BUY = [
  { key:'vorrei', label:'Vorrei', words:'vorrei', en:"I'd like" },
  { key:'ha', label:'Ha …?', words:'ha', en:'do you have …? (polite)' },
  { key:'un', label:'un', words:'un', en:'a, one (masculine: un melone)' },
  { key:'una', label:'una', words:'una', en:'a, one (feminine: una sciarpa)' },
  { key:'e', label:'e', words:'e', en:'and' },
  { key:'per favore', label:'per favore', words:'per favore', en:'please' },
  { key:'quanto costa', label:'Quanto costa?', words:'quanto costa', en:'how much is it?' },
  { key:'ecco', label:'Ecco', words:'ecco', en:'here is / here you are' },
  { key:'euro', label:'euro', words:'euro', en:'euro, euros (never changes)' },
];
const L9_NO = { key:'no', label:'No', words:'no', en:'no' };
const L9_NOSCUSI = { key:'no scusi', label:'No, scusi', words:'no scusi', en:'no, sorry (polite: correcting someone)' };
const L9_POLITE = [...L7_POLITE.filter(t => t.key !== 'scusi'), L9_NO, L9_NOSCUSI, { key:'non ho capito', label:'Non ho capito.', words:'non ho capito', en:"I didn't understand." }];
/* colours at Teresa's: both singular and plural, so the colour has to agree */
const L9_COLOUR_TILES = [
  l9Tile('rossa', 'red (one feminine thing)'), l9Tile('rosse', 'red (feminine plural: magliette rosse)'),
  l9Tile('bianca', 'white (one feminine thing)'), l9Tile('bianche', 'white (feminine plural)'),
  l9Tile('gialla', 'yellow (one feminine thing)'), l9Tile('gialle', 'yellow (feminine plural)'),
  l9Tile('verde', 'green (one thing)'), l9Tile('verdi', 'green (plural)'), l9Tile('blu', 'blue (never changes)'), l9Tile('rosa', 'pink (never changes)'),
];
/* "Indicazioni": giving Sofia directions, Lei forms (Lesson 3's table, which you had only heard so far) */
const L9_DIR = [
  { key:'vada dritto', label:'Vada dritto', words:'vada dritto', en:'go straight on (to the next crossroads)' },
  { key:'vada sempre dritto', label:'Vada sempre dritto', words:'vada sempre dritto', en:'keep going straight on' },
  { key:'giri a destra', label:'Giri a destra', words:'giri a destra', en:'turn right' },
  { key:'giri a sinistra', label:'Giri a sinistra', words:'giri a sinistra', en:'turn left' },
  { key:'alla prima strada', label:'alla prima strada', words:'alla prima strada', en:'at the first street' },
  { key:'alla seconda strada', label:'alla seconda strada', words:'alla seconda strada', en:'at the second street' },
  { key:'fino alla farmacia', label:'fino alla farmacia', words:'fino alla farmacia', en:'as far as the pharmacy' },
  { key:'fino alla chiesa', label:'fino alla chiesa', words:'fino alla chiesa', en:'as far as the church' },
  { key:'fino alla banca', label:'fino alla banca', words:'fino alla banca', en:'as far as the bank' },
  { key:'poi', label:'poi', words:'poi', en:'then' },
  { key:'san lorenzo è lì', label:'San Lorenzo è lì.', words:'San Lorenzo è lì', en:'San Lorenzo is there.' },
  { key:'non è lontano', label:'Non è lontano.', words:'non è lontano', en:"It's not far." },
  L9_NOSCUSI,
];
const L9_SOFIA_TILES = [{ key:'sì', label:'Sì', words:'sì', en:'yes' }, L9_NO];

/* Sofia: the start of the dictated route (the market's map node, facing back out the way you came in: south), and
   San Lorenzo (the four crossroads around its church, where Lesson 3's route ended). */
const L9_MAP = { start:[0, 1], heading:'S', area:[[3, 0], [4, 0], [3, 1], [4, 1]] };

/* The handbook chapter */
LESSONS.push({
  n:9, title:'Due magliette, tre rose', sub:'Plurals: more than one',
  dlgNote:'A customer buying several things at a flower stall.',
  dialogue:[
    ['Tu', 'Buongiorno! Vorrei tre rose e due girasoli.', "Good morning! I'd like three roses and two sunflowers."],
    ['Fioraio', 'Tre rose… e due girasoli. Altro?', 'Three roses… and two sunflowers. Anything else?'],
    ['Tu', 'Sì, una pianta, per favore.', 'Yes, a plant, please.'],
    ['Fioraio', 'Ecco! Sono quindici euro.', "Here you are! That's fifteen euros."],
  ],
  pitches:{ Tu:1.1, Fioraio:0.8 },
  phrasesTitle:'What you say',
  phrases:[
    ['una maglietta → due magliette', 'one T-shirt → two T-shirts', 'Feminine -a becomes -e.'],
    ['un limone → due limoni', 'one lemon → two lemons', 'Words ending in -e become -i.'],
    ['un girasole → tre girasoli', 'one sunflower → three sunflowers', 'Girasole ends in -e: girasoli.'],
    ['una rosa → tre rose', 'one rose → three roses', 'Rosa, the flower, is a regular -a word: le rose.'],
    ['Quanti? / Quante?', 'How many?', 'Quanti for masculine things (quanti pomodori?), quante for feminine ones (quante rose?).'],
    ['Vorrei due …, per favore.', "I'd like two …, please.", 'After any number above one, the noun is plural: vorrei due magliette.'],
  ],
  phrases2Title:"What you'll hear",
  phrases2:[
    ['Quante rose?', 'How many roses?', 'Answer with the number: tre. Or: tre rose.'],
    ['Quanti? Sei?', 'How many? Six?', 'A vendor checking. Sì, sei. Or, if not: No, scusi, cinque.'],
    ['Altro?', 'Anything else?', 'Next thing on your list, or: No, grazie.'],
    ['Sa come si arriva a …?', 'Do you know how to get to …?', 'Someone asking you the way. Sa: polite, Lei.'],
    ['Lei è di …? / Sono di …', 'Are you from …? / I am from …', 'Sofia è di Milano.'],
  ],
  extraTitle:'Giving directions (Lei)',
  extraNote:'The polite forms from Lesson 3, which you have only heard so far. Now you say them: one step per sentence, or join two with poi.',
  extra:[['Vada dritto', 'go straight on'], ['Vada sempre dritto', 'keep going straight on'], ['Giri a destra', 'turn right'], ['Giri a sinistra', 'turn left'],
    ['alla prima strada', 'at the first street'], ['alla seconda strada', 'at the second street'], ['fino alla farmacia', 'as far as the pharmacy'], ['poi', 'then'],
    ['San Lorenzo è lì.', 'San Lorenzo is there.'], ['Non è lontano.', "It's not far."], ['No, scusi…', 'no, sorry… (taking it back)']],
  how:`<table class="dirtable pltable"><thead><tr><th>singular</th><th>plural</th><th>example</th></tr></thead><tbody>
      <tr><td><b>-o</b> <small>(m)</small></td><td><b>-i</b></td><td>il pomodor<b>o</b> → i pomodor<b>i</b></td></tr>
      <tr><td><b>-a</b> <small>(f)</small></td><td><b>-e</b></td><td>la magliett<b>a</b> → le magliett<b>e</b>, la ros<b>a</b> → le ros<b>e</b></td></tr>
      <tr><td><b>-e</b> <small>(m or f)</small></td><td><b>-i</b></td><td>il girasol<b>e</b> → i girasol<b>i</b>, il melon<b>e</b> → i melon<b>i</b></td></tr>
      <tr><td><b>-cia / -gia</b></td><td><b>-ce / -ge</b></td><td>l'aran<b>cia</b> → le aran<b>ce</b></td></tr>
      <tr><td>accented words</td><td>don't change</td><td>il caff<b>è</b> → i caff<b>è</b> <small>(from Lesson 2)</small></td></tr>
    </tbody></table>
    <p>The articles change too: <b>il → i</b>, <b>la → le</b>, <b>l' → gli</b> for masculine words (<i>l'amico → gli amici</i>) and <b>le</b> for feminine ones (<i>l'arancia → le arance</i>).</p>
    <p>After a number above one, always the plural: <i>due magliette, tre rose, cinque arance</i>. Ask with <b>quanti?</b> (masculine) or <b>quante?</b> (feminine).</p>
    <p>Adjectives agree too: <i>due magliette <b>rosse</b></i>, <i>due girasoli <b>gialli</b></i>.</p>
    <p><b>Careful:</b> <i>rosa</i> the flower is regular, <i>una rosa → tre rose</i>. But <i>rosa</i> the colour (pink) never changes: <i>due magliette <b>rosa</b></i>.</p>
    <p class="note">-cia → -ce when a consonant comes before it (aran<b>c</b>ia). After a vowel the i stays: la camicia → le camicie.</p>`,
  culture:`<p>At markets, people often buy flowers <b>by the stem</b> (<i>a stelo</i>): you say how many, and the florist makes the bunch.</p>
    <p>Giving an <b>odd number</b> of flowers is traditional: 3, 5, 7… Even numbers are for funerals in some regions. And <b>chrysanthemums</b> (<i>i crisantemi</i>) are for cemeteries: never a gift!</p>`,
  exercises:[
    { type:'mc', q:'Two T-shirts and six tomatoes.', opts:['due magliette, sei pomodori', 'due maglietti, sei pomodore', 'due maglietta, sei pomodoro'], a:0, why:'-a → -e (magliette), -o → -i (pomodori).', nudge:'Feminine -a becomes -e; masculine -o becomes -i.' },
    { type:'mc', q:'Il girasole → i ___', opts:['girasole', 'girasoli', 'girasola'], a:1, why:'Words ending in -e take -i in the plural: i girasoli.', nudge:'-e becomes -i.' },
    { type:'mc', q:"L'arancia → le ___", opts:['arancie', 'arance', 'arancia'], a:1, why:'-cia becomes -ce: le arance.', nudge:'The i goes: -cia → -ce.' },
    { type:'mc', q:'Due magliette ___ (red)', opts:['rossa', 'rosse'], a:1, why:'Magliette is feminine plural, so the colour is too: rosse.', nudge:'The colour ends like the noun: magliett-e…' },
    { type:'mc', q:'“How many roses?”', opts:['Quanti rose?', 'Quante rose?'], a:1, why:'Rose is feminine: quante rose? (Quanti pomodori? for masculine.)', nudge:'La rosa is feminine.' },
    { type:'order', q:"I'd like three roses.", tiles:['rose', 'vorrei', 'tre'], answer:'vorrei tre rose', why:'Vorrei tre rose.', nudge:'Start with vorrei, then the number.' },
    { type:'mc', q:'Spot the mistake: “Vorrei due cravatta.”', opts:['vorrei → vorrebbe', 'cravatta → cravatte', 'due → tre'], a:1, why:'Two of them: plural, due cravatte.', nudge:'Look at the noun after the number.' },
    { type:'mc', q:'You buy a bunch of flowers as a gift. Traditionally…', opts:['an odd number: five roses', 'an even number: six roses', 'chrysanthemums'], a:0, why:'Odd numbers for gifts. Even numbers are for funerals in some regions, and chrysanthemums for cemeteries.', nudge:'Read the culture note.' },
  ],
  /* Vocabolario (ui/vocab.js): every word of the Plurali / Indicazioni / colour tiles, and what you'll hear from the
     vendors and Sofia. Lessons 7–8 and the numbers are known already. Learned with the word check before the practice. */
  vocab:[
    { group:'Clothes', words:[
      { it:'la maglietta / le magliette', g:'f', en:'the T-shirt / the T-shirts', note:'-a → -e: due magliette.' },
      { it:'la cravatta / le cravatte', g:'f', en:'the tie / the ties', note:'-a → -e: tre cravatte.' },
      { it:'la sciarpa / le sciarpe', g:'f', en:'the scarf / the scarves', note:'One: una sciarpa.' },
    ] },
    { group:'Flowers', words:[
      { it:'la rosa / le rose', g:'f', en:'the rose / the roses', note:'Regular: tre rose. (Rosa, the colour pink, never changes.)' },
      { it:'il girasole / i girasoli', g:'m', en:'the sunflower / the sunflowers', note:'-e → -i: due girasoli.' },
      { it:'la pianta / le piante', g:'f', en:'the plant / the plants', note:'Una pianta, due piante.' },
    ] },
    { group:'Fruit and vegetables', words:[
      { it:"l'arancia / le arance", g:'f', also:['arancia'], en:'the orange / the oranges', note:"-cia → -ce: cinque arance. One: un'arancia." },
      { it:'il pomodoro / i pomodori', g:'m', en:'the tomato / the tomatoes', note:'-o → -i: sei pomodori.' },
      { it:'il melone / i meloni', g:'m', en:'the melon / the melons', note:'-e → -i. One: un melone.' },
    ] },
    { group:'Plural words', words:[
      { it:'i', en:'the (masculine plural)', note:'il pomodoro → i pomodori' },
      { it:'le', en:'the (feminine plural)', note:'la rosa → le rose' },
      { it:'Quanti?', en:'How many? (masculine)', note:'Quanti pomodori?' },
      { it:'Quante?', en:'How many? (feminine)', note:'Quante rose?' },
      { it:'due …', say:'due magliette', en:'two … (always plural)', note:'Due magliette, due girasoli.' },
      { it:'tre …', say:'tre rose', en:'three …', note:'Tre rose, tre pomodori.' },
    ] },
    { group:'Colours in the plural', note:'Colours agree with the noun, plural too. Verde: verdi. Blu and rosa never change.', words:[
      { it:'rossi / rosse', en:'red (plural)', note:'Due magliette rosse, due girasoli rossi.' },
      { it:'bianchi / bianche', en:'white (plural)', note:'Due magliette bianche.' },
      { it:'gialli / gialle', en:'yellow (plural)', note:'Due girasoli gialli.' },
      { it:'verdi', en:'green (plural)', note:'Una maglietta verde, due magliette verdi.' },
      { it:'rosa', en:'pink (never changes)', note:'Una maglietta rosa, due magliette rosa.' },
    ] },
    { group:'Giving directions (Lei)', note:'Polite commands, for a stranger. To a friend: vai, gira.', words:[
      { it:'Vada dritto.', en:'Go straight on.' },
      { it:'Vada sempre dritto.', en:'Keep going straight on.' },
      { it:'Giri a destra.', en:'Turn right.' },
      { it:'Giri a sinistra.', en:'Turn left.' },
      { it:'alla prima strada', en:'at the first street' },
      { it:'alla seconda strada', en:'at the second street' },
      /* three words, not "fino alla farmacia / chiesa / banca": in Studio's typed items " / " separates forms of one word */
      { it:'fino alla farmacia', en:'as far as the pharmacy', note:'Vada sempre dritto fino alla farmacia.' },
      { it:'fino alla chiesa', en:'as far as the church' },
      { it:'fino alla banca', en:'as far as the bank' },
      { it:'poi', en:'then', note:'Vada dritto, poi giri a destra.' },
      { it:'San Lorenzo è lì.', en:'San Lorenzo is there.' },
      { it:'Non è lontano.', en:"It's not far." },
      { it:'No, scusi…', say:'No, scusi.', en:'No, sorry… (correcting yourself)', note:'Also to correct a vendor: No, scusi, due cravatte.' },
    ] },
    { group:'Meeting Sofia (you’ll hear)', words:[
      { it:'Sono di …', say:'Sono di Milano.', en:"I'm from …", note:'Sofia: sono di Milano.' },
      { it:'Lei è di …?', say:'Lei è di Padova?', en:'Are you from …? (polite)' },
      { it:'Sa come si arriva a …?', say:'Sa come si arriva a San Lorenzo?', en:'Do you know how to get to …?' },
    ] },
  ],
  doneTitle:'Ready for the shopping list.', doneGo:'Back to the market',
});
