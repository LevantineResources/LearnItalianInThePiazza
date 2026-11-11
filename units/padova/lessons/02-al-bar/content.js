/* Lesson 2. Lesson data: vocabulary, tiles, routes, and the handbook chapter (LESSONS.push). */

/* The bar's menu. art = the article that goes with the word. Prices in cents. */
ITEMS.push(
  { w:'caffè',       art:'un',  price:120, kind:'coffee', en:'an espresso',          short:'espresso',            desc:'Just say “un caffè”. In Italy a coffee is always an espresso.' },
  { w:'cappuccino',  art:'un',  price:160, kind:'coffee', en:'a cappuccino',         cue:'a frothy, milky coffee (breakfast)', short:'cappuccino',          desc:'Espresso with foamed milk. A breakfast drink.' },
  { w:'tè',          art:'un',  price:150, kind:'drink',  en:'a tea',                short:'tea',                 desc:'Hot tea, with lemon or milk on the side.' },
  { w:'spremuta',    art:'una', price:300, kind:'drink',  en:'a fresh orange juice', short:'fresh orange juice',  desc:'Oranges squeezed while you wait.' },
  { w:'cornetto',    art:'un',  price:130, kind:'pastry', en:'a croissant',          short:'croissant',           desc:'The Italian croissant, plain or filled with cream or jam. Called a brioche in the north.' },
  { w:'bombolone',   art:'un',  price:150, kind:'pastry', en:'a custard doughnut',   short:'custard doughnut',    desc:'A soft doughnut filled with custard and rolled in sugar.' },
  { w:'sfogliatella',art:'una', price:200, kind:'pastry', en:'a sfogliatella',       cue:'a crispy, shell-shaped pastry', short:'shell-shaped pastry', desc:'A crispy, shell-shaped pastry filled with ricotta, from Naples.' },
  { w:'tramezzino',  art:'un',  price:350, kind:'food',   en:'a sandwich',           short:'sandwich',            desc:'A soft, crustless triangle sandwich.' },
);
ITEMS.forEach(i => { ITEM[i.w] = i; });

const VOCAB2 = [
  { w:'vorrei',  en:'I would like' },
  { w:'un',      en:'a (masculine words)' },
  { w:'una',     en:'a (feminine words)' },
  ...ITEMS.map(i => ({ w:i.w, en:i.short + (i.art === 'una' ? ' (una)' : ' (un)') })),
  { w:'e',       en:'and' },
  { w:'per',     en:'for (per favore = please)' },
  { w:'favore',  en:'favour (per favore = please)' },
  { w:'sì',      en:'yes' },
  { w:'no',      en:'no' },
  { w:"quant'è", en:'how much is it?' },
];

const EMMA_WISH = ['spremuta', 'cornetto'];

/* The handbook chapter: dialogue, phrases, explanations, culture note, exercises. */
LESSONS.push({
    n:2, title:'Al bar', sub:'At the café bar',
    dlgNote:'A customer orders breakfast at the counter. In Italy a “bar” is a café: coffee, pastries and quick sandwiches.',
    dialogue:[
      ['Barista','Buongiorno!','Good morning!'],
      ['Tu','Buongiorno!','Good morning!'],
      ['Barista','Cosa prende?','What will you have?'],
      ['Tu','Vorrei un caffè e un cornetto, per favore.',"I'd like an espresso and a croissant, please."],
      ['Barista','Altro?','Anything else?'],
      ['Tu',"No, grazie. Quant'è?",'No, thanks. How much is it?'],
      ['Barista','Sono 2,50 euro.',"That's €2.50."],
      ['Tu','Ancora una volta, per favore.','Again, please.'],
      ['Barista','Sono 2,50 euro.',"That's €2.50."],
      ['Tu','Quindi 2,50 euro. Grazie!','So, €2.50. Thanks!'],
      ['Barista','Prego! Buona giornata!',"You're welcome! Have a nice day!"],
    ],
    pitches:{ Barista:0.72, Tu:1.1 },
    menu:true,
    phrasesTitle:'What the barista says',
    phrases:[
      ['Cosa prende?','What will you have?','Polite form. A friend would say “Cosa prendi?”'],
      ['Altro?','Anything else?','Answer “No, grazie” or order more.'],
      ['Ecco!','Here you go!','Said when handing something over.'],
      ['Sono … euro.',"That's … euros.",'The price, written in figures: Sono 2,50 euro.'],
      ['Prego!',"You're welcome!",'The answer to grazie.'],
      ['Buona giornata!','Have a nice day!','A friendly goodbye.'],
      ['Il prossimo!','Next!','He is moving on to the next customer.'],
      ['Come sta?','How are you?','Polite “you”, for people you don\'t know well.'],
    ],
    /* the little words: from now on they are set phrases (Frasi fatte) in every tile bank (content/shared.js) */
    phrases2Title:'Little words (always in your Frasi fatte from now on)',
    phrases2:[
      ['e','and','Un caffè e un cornetto.'],
      ['poi','then','Vorrei un caffè, poi un cornetto. (first one thing, then the next)'],
      ['ma','but','No, grazie, ma vorrei un tè. (No thanks, but I\'d like a tea.)'],
      ['quindi','so','Quindi 2,50 euro? (So, €2.50? Checking what you heard.)'],
      ['Ancora una volta, per favore.','Again, please.','Too fast? Anyone will say it again. (Lezione 3 adds Può ripetere?)'],
      ['Sì. / No.','Yes. / No.','Sì, grazie. No, grazie.'],
      ['E Lei?','And you? (polite)','The polite E tu?: Sto bene, grazie. E Lei?'],
    ],
    how:`<p><b>Vorrei</b> means “I would like”. It is the polite way to order: <b>Vorrei un caffè</b>. End with <b>per favore</b> (please).</p>
      <p>Every noun is masculine or feminine. Most words ending in <b>-o</b> are masculine and take <b>un</b>: <i>un cornetto</i>. Most words ending in <b>-a</b> are feminine and take <b>una</b>: <i>una spremuta</i>. Some words break the pattern, like <i>un caffè</i> and <i>un tè</i>, so learn each word with its article.</p>
      <p>Order several things with <b>e</b> (and): <b>Vorrei un tè e una sfogliatella, per favore.</b></p>
      <p>Four little words join what you know: <b>e</b> (and), <b>poi</b> (then), <b>ma</b> (but) and <b>quindi</b> (so). Didn't catch something?
      <b>Ancora una volta, per favore</b> (again, please) and the person says it again. From now on these, <b>Sì</b>, <b>No</b> and <b>E Lei?</b> are
      always in your tile bank, under <i>Frasi fatte</i>.</p>
      <p>With someone older, or someone you don't know, Italians use the polite “you”: <b>Lei</b>. You'll hear <i>Come sta?</i> instead of <i>Come stai?</i>, and <i>E Lei?</i> instead of <i>E tu?</i>.</p>`,
    culture:`<p>Most Italians drink their coffee standing at the counter (<b>al banco</b>) and are gone in a few minutes. Sitting at a table often costs more.</p>
      <p>A <b>caffè</b> is always an espresso. <b>Cappuccino</b> is a breakfast drink: after lunch, Italians switch to caffè.</p>
      <p>In busy city bars you often pay first at the till (<b>la cassa</b>) and show your receipt (<b>lo scontrino</b>) at the counter. Small bars like this one let you pay at the end.</p>
      <p>Prices are written with a comma: <b>€1,20</b> (or <b>1,20 euro</b>) is one euro twenty, said <i>un euro e venti</i>. You'll learn the numbers in Lesson 7; until then, the prices people tell you are written in figures.</p>`,
    exercises:[
      { type:'mc', q:'Which article goes with “sfogliatella”?', opts:['un','una'], a:1,
        why:'Sfogliatella ends in -a, so it is feminine: una sfogliatella.', nudge:'Look at the last letter. Words ending in -a are usually feminine.' },
      { type:'order', q:'Order an espresso, politely.', en:"I'd like an espresso, please.", tiles:['favore','caffè','vorrei','per','un'], answer:'vorrei un caffè per favore',
        why:'Vorrei un caffè, per favore.', nudge:'Start with “vorrei” (I would like) and end with “per favore”.' },
      { type:'mc', q:'The barista asks “Altro?”. What does he mean?', opts:['Anything else?','How much?','Here you go!'], a:0,
        why:'Altro? means “Anything else?”. Answer “No, grazie” if you are done.', nudge:'He asks this right after you order.' },
      { type:'mc', q:'It is four in the afternoon. What would an Italian order?', opts:['Un cappuccino','Un caffè'], a:1,
        why:'Cappuccino is a breakfast drink. After lunch, Italians order un caffè.', nudge:'Check the culture note about cappuccino.' },
      { type:'order', q:"You're done ordering. Say no thanks and ask the price.", en:'No, thanks. How much is it?', tiles:["quant'è",'grazie','no'], answer:"no grazie quant'è",
        why:"No, grazie. Quant'è?", nudge:'Start with “no”.' },
      { type:'mc', q:'Which one is the crispy, shell-shaped pastry?', opts:['Un cornetto','Un bombolone','Una sfogliatella'], a:2,
        why:'The sfogliatella comes from Naples. Its thin layers look like a shell.', nudge:'Check the price list in the lesson.' },
      { type:'order', q:'The barista said the price too fast. Ask him to say it again.', en:'Again, please.', tiles:['volta','per','ancora','favore','una'], answer:'ancora una volta per favore',
        why:'Ancora una volta, per favore: again, please. Literally “again one time, please”.', nudge:'Start with “ancora” (again).' },
      { type:'mc', q:'“Vorrei un caffè, ___ un cornetto.” (first the coffee, then the croissant)', opts:['ma','poi','quindi'], a:1,
        why:'Poi means “then”: first one thing, then the next.', nudge:'Ma is “but”, quindi is “so”.' },
    ],
    doneTitle:'Bravo! You can order now.', doneGo:'Go back to the bar',
  });
