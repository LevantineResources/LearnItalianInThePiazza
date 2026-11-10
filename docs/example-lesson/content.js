/* EXAMPLE LESSON. Not part of the game: tests/hooks.js and tests/numbers-drill.js build it in after the
   real lessons (folder name '99-example', so it sorts last) to check that the lesson hooks work. It takes the
   next free lesson number, EX_N. Copy this folder to src/lessons/NN-name/ to start a real lesson, then replace
   EX_N with your lesson number, and every lex / LEX_ / openCompleteEx with lN / LN_ / openCompleteN.

   content.js holds data only: tiles, routes, the handbook chapter. It runs before the engine
   loads, so it must not call engine functions at the top level. */

/* this lesson's number: the next one after the real lessons (a real lesson writes its number here) */
const EX_N = LESSONS.length + 1;

/* The tile pack for this lesson. key = what the parser matches, label = what the tile shows,
   words = the words the tile puts into the sentence, en = the gloss in the dictionary. */
const LEX_TILES = [
  { key:'che ore sono', label:'Che ore sono?', words:'che ore sono', en:'What time is it?' },
  { key:'sono le due', label:'Sono le due.', words:'sono le due', en:"It's two o'clock." },
  { key:'è l\'una', label:"È l'una.", words:"è l'una", en:"It's one o'clock." },
];

/* The handbook chapter. Every field below is used by ui/handbook.js. */
LESSONS.push({
  n:EX_N, title:"Che ore sono?", sub:'Telling the time',
  dlgNote:'Giulia is checking whether she is late for her shift.',
  dialogue:[
    ['Tu', 'Scusa, che ore sono?', 'Excuse me, what time is it?'],
    ['Giulia', 'Sono le due.', "It's two o'clock."],
    ['Tu', 'Grazie!', 'Thanks!'],
  ],
  pitches:{ Tu:1.1, Giulia:1.25 },
  phrasesTitle:'What you say',
  phrases:[
    ['Che ore sono?', 'What time is it?', 'Literally: what hours are they?'],
    ['Sono le due.', "It's two o'clock.", 'Plural: le due, le tre, le quattro…'],
    ["È l'una.", "It's one o'clock.", 'One o\'clock is singular: è, not sono.'],
  ],
  /* Vocabolario (required from Lesson 7 on; ui/vocab.js): every word of this lesson's tiles and typed model answers,
     grouped, Italian with its article and gender (g:'m' / 'f'), adjectives with both forms ('rosso / rossa').
     It is listed at the end of the chapter, and the practice stays locked until its word check (flashcards, then a
     quiz) is passed. tests/vocab-coverage.js fails if a tile or model answer uses a word no Vocabolario teaches. */
  vocab:[
    { group:"Telling the time", words:[
      { it:'Che ore sono?', en:'What time is it?', note:'Literally: what hours are they?' },
      { it:'Sono le due.', en:"It's two o'clock.", note:'Plural: le due, le tre, le quattro…' },
      { it:"È l'una.", en:"It's one o'clock.", note:'One o\'clock is singular.' },
    ] },
  ],
  /* Verbs (optional; ui/grammar.js): the verb forms this lesson teaches, for Studio's grammar drill. Forms take this
     lesson's number; a verb that is already listed (content/verbs.js, or an earlier chapter) gets the new forms added.
     p: 'io' | 'tu' | 'Lei' | 'lui' | 'noi' | 'voi' | 'loro'; en starts with the person ('they …', 'you (polite) …'). */
  verbs:[
    { inf:'essere', en:'to be', irr:true, forms:[{ p:'loro', it:'sono', en:'they are', ex:'Sono le due.' }] },
  ],
  how:`<p>Hours are feminine and plural (<i>le ore</i>), so: <b>sono le due</b>, <b>sono le tre</b>. The exception is one o'clock: <b>è l'una</b>.</p>`,
  culture:`<p>Shops often close from about <b>13:00 to 16:00</b>. Ask the time before you go shopping after lunch!</p>`,
  exercises:[
    { type:'mc', q:'How do you ask what time it is?', opts:['Che ore sono?', 'Come stai?', "Dov'è?"], a:0,
      why:'Che ore sono? = What time is it?', nudge:'Ore means hours.' },
    { type:'mc', q:"Say it's one o'clock.", opts:['Sono le una.', "È l'una."], a:1,
      why:"One o'clock is singular: è l'una.", nudge:'One is singular.' },
  ],
  doneTitle:'Ready to ask the time.', doneGo:'Go and ask Giulia',
});
