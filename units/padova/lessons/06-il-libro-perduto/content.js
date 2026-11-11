/* Lesson 6. Lesson data: vocabulary, tiles, routes, and the handbook chapter (LESSONS.push). */

/* Lesson 6: the loose page */
const L6_TILES = [
  { key:'cerco', label:'cerco', en:"I'm looking for" }, { key:'il mio libro', label:'il mio libro', en:'my book' },
  { key:'hai', label:'hai …?', en:'do you have …? (friend)' }, { key:'ha', label:'ha …?', en:'do you have …? (polite)' },
  { key:'non ho', label:'non ho', en:"I don't have" }, { key:'sai', label:"sai dov'è …?", en:'do you know where … is? (friend)' },
  { key:'sa', label:"sa dov'è …?", en:'do you know where … is? (polite)' }, { key:'non lo so', label:'non lo so', en:"I don't know" },
  { key:'blu', label:'blu', en:'blue' }, { key:'signore', label:'signore', en:'sir' }, { key:'signora', label:'signora', en:'madam, Mrs' },
  { key:'arrivederci', label:'arrivederci', en:'goodbye (polite)' },
];


/* The handbook chapter: dialogue, phrases, explanations, culture note, exercises. */
LESSONS.push({
    n:6, title:'La pagina', sub:'The one page that fell out of your handbook', page:true,
    dlgNote:'The page starts in the middle of a conversation. Someone has lost a book.',
    dialogue:[
      ['Tu','Scusi, signore. Cerco il mio libro.',"Excuse me, sir. I'm looking for my book."],
      ['Signore',"Il Suo libro? Com'è?","Your book? What's it like?"],
      ['Tu',"È un libro blu. Sa dov'è?","It's a blue book. Do you know where it is?"],
      ['Signore','No, non lo so. Mi dispiace.',"No, I don't know. I'm sorry."],
      ['Tu','Ha un libro blu?','Do you have a blue book?'],
      ['Signore','No, non ho un libro blu.',"No, I don't have a blue book."],
      ['Tu','Grazie. Arrivederci!','Thanks. Goodbye!'],
    ],
    pitches:{ Tu:1.1, Signore:0.8 },
    phrasesTitle:'What you say',
    phrases:[
      ['Cerco …',"I'm looking for …",'No word for “for”: cerco il mio libro.'],
      ['Hai …? / Ha …?','Do you have …?','Hai to a friend, ha to a stranger.'],
      ['Non ho …',"I don't have …",'Non goes right before the verb.'],
      ["Sai dov'è …? / Sa dov'è …?",'Do you know where … is?','Sai to a friend, sa to a stranger.'],
      ['Non lo so.',"I don't know.",'Literally: I don\'t know it.'],
      ['il mio libro','my book','Libro is masculine: questo è il mio libro.'],
      ['È blu.',"It's blue.",'Blu never changes: un libro blu, una borsa blu.'],
      ['Arrivederci!','Goodbye!','The polite goodbye. Ciao is for friends.'],
    ],
    phrases2Title:"What you'll hear",
    phrases2:[
      ["Com'è?","What's it like?",'Answer with è …'],
      ['Mi dispiace.',"I'm sorry.",''],
      ['In bocca al lupo!','Good luck!','Literally “into the wolf\'s mouth”. Answer: Crepi!'],
      ['Buona fortuna!','Good luck!',''],
      ['Davvero?','Really?',''],
    ],
    how:`<p><b>Hai</b> and <b>ha</b> are from <i>avere</i> (to have), in the table from Lezione 4: <b>tu hai</b>, <b>Lei ha</b>. <b>Non ho</b> = I don't have.</p>
      <p><b>Sai</b> and <b>sa</b> are from <i>sapere</i>, to know a fact: <b>Sai dov'è?</b> To know a person or a place, Italian uses a different verb, <i>conoscere</i>: <i>Conosci Paolo?</i></p>
      <p><b>Cerco</b> means “I'm looking for”. There is no separate word for “for”: <b>Cerco il mio libro.</b></p>
      <p>Nobody gives you tiles today. Type what you would say. No accents on your keyboard? Type <i>e</i> for <i>è</i> and <i>dove</i> for <i>dov'è</i>: the game fixes them and shows you the right spelling.</p>`,
    culture:`<p>Lost something? Ask at the bar, the newsstand and the shops. In a small neighbourhood, somebody always saw something.</p>
      <p>When someone wishes you luck with <b>In bocca al lupo!</b>, don't say grazie. Say <b>Crepi!</b> (“may it die”, meaning the wolf).</p>
      <p>Strangers get <b>Lei</b> forms and <b>arrivederci</b>. Friends get <b>tu</b> forms and <b>ciao</b>.</p>`,
    exercises:[
      { type:'mc', q:"How do you say “I'm looking for my book”?", opts:['Cerco il mio libro.','Ho il mio libro.','Sai il mio libro.'], a:0,
        why:'Cerco = I am looking for.', nudge:'Ho means “I have”.' },
      { type:'mc', q:'Ask Rosa, politely, if she knows where it is.', opts:["Sai dov'è?","Sa dov'è?"], a:1,
        why:'Sa is the polite (Lei) form. Sai is for friends.', nudge:'Rosa is not a close friend.' },
      { type:'mc', q:'Ask Chiara, a friend, if she has your book.', opts:['Ha il mio libro?','Hai il mio libro?'], a:1,
        why:'Hai is the tu form, for friends.', nudge:'Chiara is a friend: tu.' },
      { type:'order', q:"Say you don't know.", en:"I don't know.", tiles:['so','non','lo'], answer:'non lo so',
        why:'Non lo so.', nudge:'Start with non.' },
      { type:'mc', q:'Libro is masculine. Which one is right?', opts:['Questo è il mio libro.','Questa è il mio libro.','Questa è la mia libro.'], a:0,
        why:'Masculine: questo, il, mio.', nudge:'Everything must be masculine.' },
    ],
    doneTitle:'Ready to find your book.', doneGo:'Go and ask Chiara',
  });
