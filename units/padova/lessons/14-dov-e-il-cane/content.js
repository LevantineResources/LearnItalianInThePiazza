/* Lesson 14 · Dov'è il cane? Lesson data: the handbook chapter (the past with essere), the Vocabolario, the practice,
   the verbs for Studio's grammar drill (the avere past of Lesson 13 and the essere past of Lesson 14), the tile bank and
   its parser phrases, the NPC lines of every step of the trail, Margaret's typed translations, the clues for the
   detective notebook (ui/notebook.js). Design: docs/lessons/14-dov-e-il-cane.md ("As built (content)" says how to wire
   it). Data only (runs before the engine): the helpers that read a sentence and pick a reply are in trail.js.

   Everything is on one object, L14:
     L14.tiles        tile groups for the questioning scenes: { domande, risposte, porta, cortesia, bambini } (tile format)
     L14.bankTiles    every tile, flat (the vocab audit, the dictionary)
     L14.phrases      [intent, 'words in order'] for the parser (the base hook's phrases(), below)
     L14.cast         who is who: id, name, formal (Lei / tu), pitch, role
     L14.scripts      the NPC lines per step (S.tut) and person: openings, replies keyed by what the player asked
     L14.margaret     Margaret's English lines per step (companion lines)
     L14.typed        Margaret's typed translations, in the TYPED_SCRIPTS format (not registered: see the doc)
     L14.clues        the notebook's clues (who said what, where the dog went, the time), L14.ieriSera (Lesson 13's dinner)
     L14.hints        the English hints per step (never the Italian answer)
     L14.chapter      the handbook chapter (pushed into LESSONS below)

   Registration (no flow yet): the chapter is pushed into LESSONS, with a stand-in chapter 13 while Lesson 13 is not built
   (LESSONS is read by position: LESSONS[n - 1]); the stand-in has `placeholder:true` and disappears by itself once
   src/lessons/13-…/content.js pushes the real one. LESSON_HOOKS[14] gets a minimal base hook (vocab, bankTiles, phrases,
   doneTut, notebook) with no start(): no skip link, no "Start Lezione 14" button. The flow agent adds to it with
   Object.assign(LESSON_HOOKS[14], { … }). */

const L14_N = 14;
const l14Tile = (key, label, en, words) => ({ key, label, words:words || key, en });

/* ---------- who is who (the ids are suggestions for content/npcs.js: the train agent decides) ---------- */
const L14_CAST = {
  margaret:{ id:'margaret', name:'Margaret', english:true, role:"Biscuit's owner (English only)" },
  biscuit:{ id:'biscuit', name:'Biscuit', dog:true, role:"Margaret's small dog (a he)" },
  rinaldi:{ id:'rinaldi', name:'il signor Rinaldi', formal:true, pitch:0.82, role:'a businessman, always on the phone' },
  ferri:{ id:'ferri', name:'la signora Ferri', formal:true, pitch:1.12, role:'the mother of Luca and Sofia' },
  ernesto:{ id:'ernesto', name:'Ernesto Bassi', formal:true, pitch:0.74, role:'room 14, married to Lina for fifty years' },
  lina:{ id:'lina', name:'Lina Bassi', formal:true, pitch:1.22, role:'room 14, married to Ernesto for fifty years' },
  gianni:{ id:'gianni', name:'Gianni', formal:true, pitch:0.7, role:'the train driver (il macchinista)' },
  brigante:{ id:'brigante', name:'Brigante', dog:true, role:"Gianni's secret dog" },
  nino:{ id:'nino', name:'Nino', formal:true, pitch:0.95, role:'the chef (il cuoco)' },
  luca:{ id:'luca', name:'Luca', formal:false, pitch:1.45, role:'a boy, about eight (tu)' },
  sofia:{ id:'sofia', name:'Sofia', formal:false, pitch:1.55, role:'a girl, about ten (tu)' },
};

/* ---------- the tile bank ---------- */
const L14_TILES = {
  /* asking about the dog (Lei: everyone on the trail is a stranger, except the children). The main question is built from
     three tiles: Sa …? (Lezione 6) + Dov'è andato? + il cane → "Sa dov'è andato il cane?" */
  domande:[
    l14Tile('mi scusi', 'Mi scusi', 'excuse me (polite)'),
    l14Tile('sa', 'Sa …?', 'do you know …? (polite)'),
    l14Tile("dov'è andato", "Dov'è andato?", 'where did he (it) go?'),
    l14Tile("dov'è andata", "Dov'è andata?", 'where did she go?'),
    l14Tile('il cane', 'il cane', 'the dog'),
    l14Tile('ha visto', 'Ha visto', 'have you seen…? (polite)'),
    l14Tile('un cane', 'un cane', 'a dog'),
    l14Tile('un cane piccolo', 'un cane piccolo', 'a small dog'),
    l14Tile('cerco', 'Cerco', "I'm looking for"),
    l14Tile('è sicuro', 'È sicuro?', 'are you sure? (polite, to a man)'),
    l14Tile('è sicura', 'È sicura?', 'are you sure? (polite, to a woman)'),
    l14Tile('a che ora', 'A che ora?', 'at what time?'),
    l14Tile('ha sentito', 'Ha sentito', 'did you hear…? (polite)'),
    l14Tile('dove', 'Dove?', 'where?'),
    l14Tile('si ricorda', 'Si ricorda?', 'do you remember? (polite)'),
    l14Tile('stamattina', 'stamattina', 'this morning'),
    l14Tile('ieri sera', 'ieri sera', 'last night (yesterday evening)'),
  ],
  /* telling: the two dogs, the promise. The first three are the mystery's discoveries: shown (and listed in the dictionary)
     only once the player has seen the second dog (spoiler:true, l14Discovered() in trail.js) */
  risposte:[
    { ...l14Tile('ci sono due cani', 'Ci sono due cani!', 'there are two dogs!'), spoiler:true },
    { ...l14Tile('il cane del macchinista', 'il cane del macchinista', "the driver's dog"), spoiler:true },
    l14Tile('e', 'e', 'and'),
    { ...l14Tile('il cane della signora', 'il cane della signora', "the lady's dog"), spoiler:true },
    l14Tile('non lo dico a nessuno', 'Non lo dico a nessuno.', "I won't tell anyone."),
    l14Tile('forse', 'Forse', 'maybe'),
    l14Tile('non lo so', 'Non lo so.', "I don't know."),
  ],
  /* at a compartment door: knocking, asking to come in, answering "Chi è?" */
  porta:[
    l14Tile('scusi il disturbo', 'Scusi il disturbo', 'sorry to bother you (polite)'),
    l14Tile('permesso', 'Permesso?', 'may I come in? (at a door)'),
    l14Tile('siamo', 'Siamo', 'we are'),
    l14Tile('sono', 'Sono', 'I am'),
    l14Tile('io', 'io', 'I, me'),
    l14Tile('e', 'e', 'and'),
    l14Tile('con', 'con', 'with'),
    l14Tile('margaret', 'Margaret', 'Margaret (her name)', 'Margaret'),
  ],
  /* polite odds and ends (set phrases come from the bank itself: Ciao, Buongiorno, Grazie…) */
  cortesia:[
    l14Tile('sì', 'Sì', 'yes'), l14Tile('no', 'No', 'no'),
    l14Tile('per favore', 'per favore', 'please'),
    l14Tile('grazie mille', 'Grazie mille!', 'thank you very much!'),
    l14Tile('arrivederci', 'Arrivederci', 'goodbye (polite)'),
  ],
  /* the children (tu) */
  bambini:[
    { ...l14Tile('è il cane della signora', 'È il cane della signora!', "it's the lady's dog!"), spoiler:true },
    l14Tile('ti piace', 'Ti piace?', 'do you like him? (to a friend, a child)'),
  ],
};
const L14_BANK = Object.values(L14_TILES).flat().filter((t, i, a) => a.findIndex(x => x.key === t.key) === i);

/* ---------- the parser: the tiles' words → intents (and the typed models' words) ----------
   Intents of the trail (l14Read in trail.js turns a sentence's intents into a question):
     l14:seen        ha visto                    l14:heard      ha sentito           l14:when     a che ora (Lesson 10's ask_when, for the same words, counts too)
     l14:went:m      dov'è andato (dove è andato)            l14:went:f   dov'è andata  (the agreement: Biscuit is a he)
     l14:where       dove                        l14:remember   si ricorda           l14:dog / l14:dog_small
     l14:her_dog     il cane della signora       l14:driver_dog il cane del macchinista
     l14:two_dogs    ci sono due cani            l14:promise    non lo dico a nessuno
     l14:permesso    permesso                    l14:disturb    scusi il disturbo    l14:maybe    forse
     l14:morning     stamattina                  l14:lastnight  ieri sera            l14:excuse   mi scusi
     l14:is_her_dog  è il cane della signora     l14:thanks     grazie mille
   The typed translations: l14:open_door (può aprire la porta), l14:not_my_dog (non è il mio cane / non è il suo cane),
     l14:name_is (si chiama), l14:biscuit (biscuit), l14:a_biscuit (un biscotto), l14:for (per), here_is / l14:ecco (ecco),
     like:ti (ti piace: Lesson 8's intent). */
const L14_PHRASES = [
  ['l14:excuse', 'mi scusi'], ['look', 'cerco'], ['l14:dog', 'un cane'], ['l14:dog_small', 'un cane piccolo'], ['l14:the_dog', 'il cane'],
  ['l14:sure:m', 'è sicuro'], ['l14:sure:f', 'è sicura'], ['l14:sure:m', 'sicuro'], ['l14:sure:f', 'sicura'],
  /* behind a door: "Chi è?" → Siamo io e Margaret (also: Sono io, Sono Sam con Margaret; Sono io e Margaret gets a tip) */
  ['l14:siamo', 'siamo'], ['l14:sono', 'sono'], ['l14:margaret', 'margaret'], ['l14:con', 'con'],
  ['l14:seen', 'ha visto'], ['l14:heard', 'ha sentito'], ['l14:seen_tu', 'hai visto'],
  ['l14:went:m', "dov'è andato"], ['l14:went:f', "dov'è andata"], ['l14:went:m', 'dove è andato'], ['l14:went:f', 'dove è andata'],
  ['l14:went:pl', "dov'è andati"], ['l14:when', 'a che ora'], ['l14:where', 'dove'], ['l14:remember', 'si ricorda'],
  ['l14:morning', 'stamattina'], ['l14:lastnight', 'ieri sera'],
  ['l14:two_dogs', 'ci sono due cani'], ['l14:driver_dog', 'il cane del macchinista'], ['l14:her_dog', 'il cane della signora'],
  ['l14:is_her_dog', 'è il cane della signora'], ['l14:promise', 'non lo dico a nessuno'], ['l14:maybe', 'forse'],
  ['dontknow', 'non lo so'], ['l14:permesso', 'permesso'], ['l14:disturb', 'scusi il disturbo'],
  ['please', 'per favore'], ['l14:thanks', 'grazie mille'], ['bye', 'arrivederci'], ['like:ti', 'ti piace'],
  /* Margaret's typed lines */
  ['l14:open_door', 'può aprire la porta'], ['l14:open_door', 'apra la porta'], ['l14:not_my_dog', 'non è il mio cane'],
  ['l14:not_my_dog', 'non è il suo cane'], ['l14:not_my_dog', 'questo non è il mio cane'], ['l14:name_is', 'si chiama'],
  ['l14:biscuit', 'biscuit'], ['l14:a_biscuit', 'un biscotto'], ['l14:for', 'per'], ['l14:ecco', 'ecco'],
];

/* ---------- the times and the directions (the mystery's clues) ---------- */
const L14_TIMES = {
  ernesto:{ h:6, m:0, it:'alle sei', en:'at six' },
  lina:{ h:6, m:45, it:'alle sette meno un quarto', en:'at a quarter to seven' },
  rinaldi:{ h:7, m:0, it:'alle sette', en:'at seven' },
  ferri:{ h:7, m:0, it:'alle sette', en:'at seven' },
  brigante:{ h:6, m:45, it:'alle sette meno un quarto', en:'at a quarter to seven' },
};
const L14_WHERE = {
  ristorante:{ it:'verso il vagone ristorante', en:'towards the dining car' },
  testa:{ it:'verso la testa del treno', en:'towards the front of the train' },
  accanto:{ it:'nella camera accanto', en:'in the room next door' },
  cucina:{ it:'alla cucina', en:'at the kitchen hatch' },
};

/* ---------- the NPC lines, per step (S.tut) and person ----------
   A line is { it, en } (every Italian line has its English), plus listen:true (a listening line: the notebook then asks
   what was heard), rate, sys (a narration line in English instead), noEn. A reply list is said in order.
   Per person: opening (first time), revisit (later), and `on`: replies keyed by what the player asked (l14Read in
   trail.js: seen, went (m / f: the agreement), when, heard, remember, where, two, promise, greet, permesso, thanks, bye,
   tu (the player used tu with an adult), other (anything else: they still answer)). `clue` names the notebook clue a reply
   gives (L14.clues); `ask` what the notebook asks then: 'time' (A che ora?) or 'where' (verso…?). */
const L14_SCRIPTS = {
  /* 1 · the sleeper car: Margaret knocks (English only: companion lines, L14.margaret.start) */
  'l14-start':{},

  /* 2 · the barrier: the dining car, before the handbook. The player can ask if he has seen a dog (Lesson 13), not where it
     went. Rinaldi answers fast; Margaret wants to know where Biscuit went; the player has no way to ask. */
  'l14-barrier':{
    rinaldi:{
      opening:{ it:'Sì? Un momento… Pronto? Sì, sì… Mi dica.', en:'Yes? One moment… Hello? Yes, yes… Go ahead.' },
      on:{
        seen:[{ it:'Un cane? Sì, ieri sera, qui. Un cane piccolo. Ma stamattina? Boh. È andato via.', en:'A dog? Yes, last night, here. A small dog. But this morning? Who knows. It went off.', listen:true, rate:1.1 }],
        other:[{ it:'Come? Scusi, sono al telefono…', en:"Sorry? Excuse me, I'm on the phone…" }],
      },
    },
    sys:{ html:"<i>È andato via…</i> He said something about where it went, and you can't ask him more. You can ask what someone <i>saw</i> (Lezione 13: the past with <i>avere</i>), but going is not like seeing: you don't know how to say <b>where did it go?</b> Open your handbook: <b>Lezione 14</b>, the past with <i>essere</i>." },
  },

  /* 3 · the dining car: Rinaldi (distracted) and la signora Ferri (tired, polite). Both saw nothing; pressed (È sicuro? /
     È sicura?), both send you to the couple in room 14. */
  'l14-dining':{
    rinaldi:{
      opening:{ it:'Sì? Un momento… Pronto? Sì, sì… Mi dica.', en:'Yes? One moment… Hello? Yes, yes… Go ahead.' },
      revisit:{ it:'Ancora Lei? Sono al telefono…', en:"You again? I'm on the phone…" },
      on:{
        greet:[{ it:'Buongiorno, buongiorno.', en:'Good morning, good morning.' }],
        seen:[{ it:'Un cane? Mah… non ho visto niente.', en:"A dog? Well… I didn't see anything." }], clue:'rinaldi-niente',
        went:{
          m:[{ it:"Dov'è andato? Non lo so! Non ho visto niente.", en:"Where did it go? I don't know! I didn't see anything." }],
          f:[{ it:"Dov'è andata? Chi, la signora? Ah, il cane… Non lo so, non ho visto niente.", en:"Where did she go? Who, the lady? Ah, the dog… I don't know, I didn't see anything." }],
        },
        /* È sicuro? before he has said anything about a dog; with the wrong ending (sicura, to a man) */
        sure:[{ it:'Sicuro? Di cosa?', en:'Sure? Of what?' }],
        sureWrong:[{ it:'Sicura? Io? Ah… sicuro, sicuro.', en:'Sure (as a woman)? Me? Ah… sure, sure.' }],
        when:[{ it:'A che ora? Io sono arrivato qui alle sette. Prima… non lo so.', en:"What time? I got here at seven. Before that… I don't know.", listen:true }], whenClue:'rinaldi-arrivato',
        heard:[{ it:'Sentito? Io sento solo il telefono!', en:'Heard? All I hear is the phone!' }],
        tu:[{ it:'(He raises an eyebrow at the tu, then goes back to his phone.)', sys:true }],
        thanks:[{ it:'Prego, prego.', en:"You're welcome." }],
        bye:[{ it:'Arrivederci… Pronto? Sì, sono qui!', en:"Goodbye… Hello? Yes, I'm here!" }],
        other:[{ it:'Come? Scusi, sono al telefono…', en:"Sorry? Excuse me, I'm on the phone…" }],
      },
      /* pressed (È sicuro?, after he saw nothing): he points to room 14 */
      point:[{ it:'Sì, sicuro! Non ho visto niente. Chieda alla coppia della camera 14. Forse sanno dov\'è il cane.', en:"Yes, I'm sure! I didn't see anything. Ask the couple in room 14. Maybe they know where the dog is." }], pointClue:'camera14',
      pointAgain:[{ it:'Sicuro, sicuro! Chieda alla coppia della camera 14.', en:"Sure, sure! Ask the couple in room 14." }],
    },
    ferri:{
      opening:{ it:"Buongiorno… Mi scusi, sono un po' stanca. I bambini sono ancora in camera. Finalmente un po' di pace!", en:"Good morning… Excuse me, I'm a little tired. The children are still in the room. A bit of peace at last!" },
      revisit:{ it:'Sì? Mi dica.', en:'Yes? Go ahead.' },
      on:{
        greet:[{ it:'Buongiorno! Ha dormito bene?', en:'Good morning! Did you sleep well?' }],
        seen:[{ it:'Un cane? No, mi dispiace. Non ho visto nessun cane.', en:"A dog? No, I'm sorry. I didn't see any dog." }], clue:'ferri-niente',
        went:{
          m:[{ it:'Non lo so, mi dispiace. Io sono qui con il mio caffè.', en:"I don't know, I'm sorry. I'm here with my coffee." }],
          f:[{ it:'Andata? Chi? Ah, il cane… Non lo so, mi dispiace.', en:"Gone (she)? Who? Ah, the dog… I don't know, I'm sorry." }],
        },
        sure:[{ it:'Sicura? Di cosa, scusi?', en:'Sure? Of what, sorry?' }],
        sureWrong:[{ it:'Sicuro? Io? Ah, sì… sono sicura.', en:"Sure (as a man)? Me? Ah, yes… I'm sure." }],
        when:[{ it:'Io? Sono arrivata alle sette. E non ho visto un cane.', en:"Me? I got here at seven. And I didn't see a dog.", listen:true }], whenClue:'ferri-arrivata',
        heard:[{ it:'Sentito? No… ho dormito, finalmente!', en:'Heard? No… I slept, at last!' }],
        tu:[{ it:'(She smiles politely: you are strangers. Lei, please.)', sys:true }],
        thanks:[{ it:'Si figuri!', en:"Don't mention it!" }],
        bye:[{ it:'Arrivederci! E buona fortuna!', en:'Goodbye! And good luck!' }],
        other:[{ it:'Scusi, non ho capito.', en:"Sorry, I didn't understand." }],
      },
      point:[{ it:'Sì, sono sicura. Non ho visto niente, mi dispiace. Ma chieda alla coppia della camera 14: forse sanno dov\'è il cane!', en:"Yes, I'm sure. I didn't see anything, I'm sorry. But ask the couple in room 14: maybe they know where the dog is!" }], pointClue:'camera14',
      pointAgain:[{ it:'Sì, sicura. Chieda alla coppia della camera 14!', en:"Yes, sure. Ask the couple in room 14!" }],
    },
  },

  /* 4 · room 14: knock. Ernesto and Lina, chatty, contradicting each other. Two times, two directions. */
  'l14-couple':{
    door:{ knock:'Toc toc!', answer:{ it:'Chi è?', en:'Who is it?', who:'lina' }, open:{ it:'Avanti, avanti! Buongiorno!', en:'Come in, come in! Good morning!', who:'ernesto' },
      /* who it is (Siamo io e Margaret; Sono io…): they remember you from dinner */
      openWho:{ it:'Ah, Lei! E la signora inglese! Avanti, avanti! Buongiorno!', en:'Ah, it\'s you! And the English lady! Come in, come in! Good morning!', who:'ernesto' },
      /* what the player says through the door (permesso / scusi il disturbo / mi scusi); anything else: */
      unclear:{ it:'Chi è? Non ho capito!', en:"Who is it? I didn't catch that!", who:'lina' } },
    ernesto:{
      opening:{ it:'Buongiorno! Che bella mattina, eh? Siamo svegli dalle cinque, noi!', en:"Good morning! What a lovely morning, eh? We've been up since five, us!" },
      revisit:{ it:'Ancora Lei! Venga, venga!', en:'You again! Come in, come in!' },
      on:{
        greet:[{ it:'Buongiorno a Lei!', en:'Good morning to you!' }],
        seen:[{ it:'Sì! Ho visto un cane, stamattina! È andato verso il vagone ristorante.', en:'Yes! I saw a dog this morning! It went towards the dining car.' }], clue:'ernesto-visto', ask:'where',
        went:{
          m:[{ it:'Verso il vagone ristorante! Sono sicuro.', en:"Towards the dining car! I'm sure." }],
          f:[{ it:'Andata? È un cane, mica una signora! È andato verso il vagone ristorante.', en:"Gone (she)? It's a dog, not a lady! It went towards the dining car." }],
        },
        sure:[{ it:'Sicurissimo! Verso il vagone ristorante.', en:'Absolutely sure! Towards the dining car.' }],
        when:[{ it:'A che ora? Alle sei. Sono uscito dalla camera alle sei in punto.', en:'What time? At six. I went out of the room at six on the dot.', listen:true }], whenClue:'ernesto-visto',
        heard:[{ it:'Sentito? Ah… sì. Ho sentito anche un cane stanotte… ma non mi ricordo dove.', en:"Heard? Ah… yes. I also heard a dog last night… but I don't remember where." }], heardClue:'ernesto-sentito',
        remember:[{ it:'Mi ricordo? No… non mi ricordo. Che testa!', en:"Do I remember? No… I don't remember. What a head!" }],
        tu:[{ it:'Tu? Ah, che bello, come i giovani! Ma io sono vecchio: Lei, per favore!', en:"Tu? Ah, how nice, like young people! But I'm old: Lei, please!" }],
        thanks:[{ it:'Prego! È un piacere.', en:"You're welcome! It's a pleasure." }],
        bye:[{ it:'Arrivederci! E buona fortuna con il cane!', en:'Goodbye! And good luck with the dog!' }],
        other:[{ it:'Come? Parli più forte, sono un po’ sordo!', en:"Sorry? Speak up, I'm a little deaf!" }],
      },
      /* after the sighting: the other thing he heard (his memory, step 7). Said once, unprompted, if not asked. */
      aside:[{ it:'E… ho sentito anche un cane stanotte… ma non mi ricordo dove.', en:"And… I also heard a dog last night… but I don't remember where." }], asideClue:'ernesto-sentito',
    },
    lina:{
      opening:{ it:'Buongiorno! Entri, entri! Ernesto, chiudi la finestra!', en:'Good morning! Come in, come in! Ernesto, close the window!' },
      revisit:{ it:'Ah, Lei! Allora, il cane?', en:'Ah, you! So, the dog?' },
      on:{
        greet:[{ it:'Buongiorno, buongiorno!', en:'Good morning, good morning!' }],
        seen:[{ it:'No, no, Ernesto! È andato verso la testa del treno!', en:'No, no, Ernesto! It went towards the front of the train!' }], clue:'lina-visto', ask:'where',
        went:{
          m:[{ it:'Verso la testa del treno! Lui non si ricorda mai niente.', en:'Towards the front of the train! He never remembers anything.' }],
          f:[{ it:'Andata? Ma è un cane! È andato verso la testa del treno.', en:"Gone (she)? But it's a dog! It went towards the front of the train." }],
        },
        sure:[{ it:'Sicura! Io mi ricordo tutto.', en:'Sure! I remember everything.' }],
        when:[{ it:'Io? Alle sette meno un quarto. Sono uscita a prendere un caffè, ed eccolo!', en:'Me? At a quarter to seven. I went out to get a coffee, and there it was!', listen:true }], whenClue:'lina-visto',
        heard:[{ it:'Io? Io dormo come un sasso.', en:'Me? I sleep like a log.' }],
        remember:[{ it:'Io mi ricordo tutto! È lui che non si ricorda.', en:"I remember everything! He's the one who doesn't remember." }],
        tu:[{ it:'Tu? Che simpatico! Ma diamoci del Lei, eh?', en:"Tu? How sweet! But let's keep to Lei, eh?" }],
        thanks:[{ it:'Prego, caro!', en:"You're welcome, dear!" }],
        bye:[{ it:'Arrivederci! Ci faccia sapere!', en:'Goodbye! Let us know!' }],
        other:[{ it:'Come dice?', en:'What did you say?' }],
      },
    },
    /* the two of them, after both sightings: the bickering (fun, and it shows the times don't contradict) */
    bicker:[
      { who:'ernesto', it:'Ma no, cara! Verso il vagone ristorante!', en:'No, dear! Towards the dining car!' },
      { who:'lina', it:"Cinquant'anni di matrimonio, e lui non mi ascolta mai!", en:"Fifty years of marriage, and he never listens to me!" },
    ],
    /* "A che ora?" with no name: he answers first, she adds hers */
    whenBoth:[
      { who:'ernesto', it:'Alle sei! Sono uscito dalla camera alle sei in punto.', en:'At six! I went out of the room at six on the dot.', listen:true, clue:'ernesto-visto' },
      { who:'lina', it:'E io alle sette meno un quarto! Sono uscita a prendere un caffè.', en:'And me at a quarter to seven! I went out to get a coffee.', listen:true, clue:'lina-visto' },
    ],
  },

  /* 5a · the dining car: Nino, warm and fast (after the Bassis: Margaret's idea, "the chef feeds everyone"). He saw a dog go to
     the front this morning, into the driver's cab: he thinks it is the lady's. (It is Brigante, back at 6:45.) */
  'l14-nino':{
    nino:{
      opening:{ it:'Buongiorno! Ha dormito bene? Un caffè? Un cornetto?', en:'Good morning! Did you sleep well? A coffee? A croissant?' },
      revisit:{ it:'Eccomi! Mi dica!', en:'Here I am! Go ahead!' },
      on:{
        greet:[{ it:'Buongiorno, buongiorno!', en:'Good morning, good morning!' }],
        seen:[{ it:'Un cane? Sì, sì! Stamattina. C\'è un cane davanti, con il macchinista!', en:"A dog? Yes, yes! This morning. There's a dog up at the front, with the driver!" }], clue:'nino-davanti',
        went:{
          m:[{ it:'Il cane? Davanti! C\'è un cane davanti, con il macchinista!', en:"The dog? Up at the front! There's a dog up at the front, with the driver!" }],
          f:[{ it:'Andata? Chi? Ah, il cane! È andato davanti, con il macchinista!', en:'Gone (she)? Who? Ah, the dog! He went up to the front, with the driver!' }],
        },
        sure:[{ it:'Sicuro! Davanti, con il macchinista. L\'ho visto io!', en:'Sure! At the front, with the driver. I saw it myself!' }],
        when:[{ it:'A che ora? Alle sette meno un quarto, più o meno. Con i cornetti!', en:'What time? At a quarter to seven, more or less. With the croissants!', listen:true }], whenClue:'nino-davanti',
        tu:[{ it:'Tu? Ma sì, va bene! Siamo tutti amici in cucina!', en:"Tu? Sure, fine! We're all friends in the kitchen!" }],
        thanks:[{ it:'Prego! E un caffè, dopo!', en:"You're welcome! And a coffee, after!" }],
        bye:[{ it:'Arrivederci! Buona giornata!', en:'Goodbye! Have a good day!' }],
        other:[{ it:'Come? Ah, un caffè?', en:'Sorry? Ah, a coffee?' }],
      },
    },
  },

  /* 5b · the front car: the driver's door. Barking. "Scusi il disturbo, permesso?" → "No, no! Esco io!" A cutscene: Gianni steps
     out and pulls the door to, and a big dark dog slips past him (Brigante, not Biscuit). Margaret (typed): "Non è il mio cane!" The
     secret, the promise; he sends you back to the chef. */
  'l14-front':{
    door:{ knock:'Toc toc!', bark:'Bau! Bau!', answer:{ it:'Chi è? Sono occupato!', en:"Who is it? I'm busy!", who:'gianni' },
      /* asked about a dog through the door: he denies it, and a bark gives him away */
      deny:{ it:'Un cane? Qui? No, no… nessun cane!', en:'A dog? Here? No, no… no dog!', who:'gianni' },
      deny2:{ it:'Bau!', en:'Woof!', who:'brigante', sys:'(Behind the door, very clearly: a bark.)' },
      /* "Siamo io e Margaret": he doesn't know you */
      who:{ it:'Chi? Non vi conosco! Sono occupato, io!', en:"Who? I don't know you! I'm busy, me!", who:'gianni' },
      /* only "Scusi il disturbo" (no permesso): he waits */
      sorry:{ it:'Sì, sì, va bene… Cosa vuole?', en:'Yes, yes, all right… What do you want?', who:'gianni' },
      unclear:{ it:'Come? Sono occupato!', en:"Sorry? I'm busy!", who:'gianni' },
      /* Permesso? (asking to come in): he won't let anyone in */
      out:{ it:'No, no! Esco io!', en:"No, no! I'll come out!", who:'gianni' },
      /* the cutscene: he steps out, pulls the door to… and a dog slips past him */
      fluster:{ it:'Ehm… niente, niente! Niente!', en:'Er… nothing, nothing! Nothing!', who:'gianni' },
      call:{ it:'Brigante! Vieni qui!', en:'Brigante! Come here!', who:'gianni' } },
    gianni:{
      opening:{ it:'Sì? Cosa c’è?', en:"Yes? What is it?" },
      on:{
        greet:[{ it:'Buongiorno.', en:'Good morning.' }],
        seen:[{ it:'Un cane? Io? No… cioè… sì.', en:'A dog? Me? No… I mean… yes.' }],
        whose:[{ it:'È Brigante, il mio cane. Viene sempre con me, nei viaggi lunghi.', en:"It's Brigante, my dog. He always comes with me on long journeys." }], whoseClue:'gianni-brigante',
        plead:[{ it:'Per favore, non lo dica a nessuno! Sul treno non è permesso…', en:"Please don't tell anyone! It's not allowed on the train…" }],
        promise:[{ it:'Grazie! Grazie mille! Lei è una brava persona.', en:"Thank you! Thank you so much! You're a good person." }],
        when:[{ it:'Brigante? È uscito un momento stamattina… ed è tornato alle sette meno un quarto.', en:'Brigante? He went out for a moment this morning… and came back at a quarter to seven.', listen:true }], whenClue:'gianni-tornato',
        /* after the promise: where to look next (back to the chef) */
        tip:[{ it:'Il cane della signora? Io non so niente… Chieda al cuoco!', en:"The lady's dog? I don't know anything… Ask the chef!" }],
        notPromised:[{ it:'Per favore… non lo dica a nessuno!', en:"Please… don't tell anyone!" }],
        tu:[{ it:'Tu? Va bene, va bene… ma non lo dica a nessuno, eh!', en:"Tu? All right, all right… but don't tell anyone, eh!" }],
        thanks:[{ it:'Grazie a Lei.', en:'Thank you.' }],
        bye:[{ it:'Arrivederci. E… zitto, eh!', en:'Goodbye. And… not a word, eh!' }],
        other:[{ it:'Non ho tempo! Guido un treno, io!', en:"I don't have time! I'm driving a train, me!" }],
      },
    },
  },

  /* 6 · back to Nino: the player tells him there are two dogs (Nino knows the driver's: he saw it go to the front, so the secret
     stays kept). Then he remembers the lady's little dog: "Ha guardato la cena, voleva un osso!" */
  'l14-chef':{
    nino:{
      opening:{ it:'Ancora Lei! Allora, il cane? Davanti, no?', en:'You again! So, the dog? At the front, wasn\'t it?' },
      revisit:{ it:'Eccomi! Mi dica!', en:'Here I am! Go ahead!' },
      on:{
        greet:[{ it:'Buongiorno, buongiorno!', en:'Good morning, good morning!' }],
        seen:[{ it:'Il cane? Davanti, con il macchinista! No?', en:'The dog? At the front, with the driver! Isn\'t it?' }],
        went:{
          m:[{ it:'Davanti, con il macchinista! No?', en:'At the front, with the driver! Isn\'t it?' }],
          f:[{ it:'Andata? Chi? Il cane? Davanti, no?', en:'Gone (she)? Who? The dog? At the front, isn\'t it?' }],
        },
        sure:[{ it:'Sicuro? Io? Il cane davanti… sì!', en:'Sure? Me? The dog at the front… yes!' }],
        two:[{ it:'Due cani?! Ah… allora il cane piccolo… il cane della signora! Sì! Ieri sera ha guardato la cena, voleva un osso!', en:"Two dogs?! Ah… so the little dog… the lady's dog! Yes! Last night he watched the dinner, he wanted a bone!" },
          { it:'Gli ho dato un pezzetto di pollo. Solo una volta! Ma stamattina? Non lo so, mi dispiace.', en:"I gave him a little piece of chicken. Just once! But this morning? I don't know, I'm sorry." }],
        driver:[{ it:'Shh! Il cane del macchinista… lo so, lo so. Zitto, eh! Ma è un altro cane, vero?', en:"Shh! The driver's dog… I know, I know. Not a word, eh! But it's another dog, right?" }],
        her:[{ it:'Il cane della signora inglese? Il cane piccolo? Sì! Ieri sera ha guardato la cena, voleva un osso!', en:"The English lady's dog? The little dog? Yes! Last night he watched the dinner, he wanted a bone!" },
          { it:'Gli ho dato un pezzetto di pollo. Solo una volta! Ma stamattina? Non lo so, mi dispiace.', en:"I gave him a little piece of chicken. Just once! But this morning? I don't know, I'm sorry." }], herClue:'nino-osso',
        when:[{ it:'Ieri sera, alle dieci, più o meno. Stamattina, no.', en:'Last night, at ten, more or less. This morning, no.', listen:true }],
        tu:[{ it:'Tu? Ma sì, va bene! Siamo tutti amici in cucina!', en:"Tu? Sure, fine! We're all friends in the kitchen!" }],
        thanks:[{ it:'Prego! E un caffè, dopo!', en:"You're welcome! And a coffee, after!" }],
        bye:[{ it:'Arrivederci! Buona giornata!', en:'Goodbye! Have a good day!' }],
        other:[{ it:'Come? Ah, un caffè?', en:'Sorry? Ah, a coffee?' }],
      },
    },
  },

  /* 7 · the corridor: Ernesto catches up. "Ah! Mi sono ricordato!" The barking came from the room next to theirs. */
  'l14-memory':{
    ernesto:{
      opening:{ it:'Aspetti! Aspetti! Ah! Mi sono ricordato!', en:"Wait! Wait! Ah! I've remembered!" },
      memory:[{ it:'Stanotte il cane ha abbaiato… nella camera accanto! Accanto alla nostra!', en:'Last night the dog barked… in the room next door! Next to ours!' }], memoryClue:'ernesto-ricordato', ask:'where',
      on:{
        remember:[{ it:'Sì! Adesso mi ricordo: nella camera accanto!', en:'Yes! Now I remember: in the room next door!' }],
        where:[{ it:'Nella camera accanto! Accanto alla camera 14.', en:'In the room next door! Next to room 14.' }],
        heard:[{ it:'Sì, sì: ha abbaiato stanotte, nella camera accanto!', en:'Yes, yes: it barked last night, in the room next door!' }],
        when:[{ it:'Stanotte… alle due? Alle tre? Non mi ricordo. Ma la camera, sì!', en:"Last night… at two? At three? I don't remember. But the room, yes!" }],
        thanks:[{ it:'Prego! Che testa, eh?', en:"You're welcome! What a head, eh?" }],
        bye:[{ it:'Arrivederci! Vada, vada!', en:'Goodbye! Go, go!' }],
        other:[{ it:'La camera accanto! Vada a vedere!', en:'The room next door! Go and see!' }],
      },
    },
    lina:{ aside:[{ it:'La camera accanto? Ma lì… ci sono due bambini.', en:'The room next door? But in there… there are two children.' }] },
  },

  /* 8 · the children's room: knock, barking, giggling. La signora Ferri opens. "Abbiamo sempre voluto un cane!" */
  'l14-reveal':{
    door:{ knock:'Toc toc!', bark:'Bau! Bau!', giggle:'Ih ih ih! Shh! Zitto!', answer:{ it:'Un momento!', en:'One moment!', who:'ferri' } },
    ferri:{
      opening:{ it:'Sì? Oh… buongiorno. Mi dica.', en:'Yes? Oh… good morning. Go ahead.' },
      on:{
        seen:[{ it:'Un cane? Qui? Ma no, i bambini dormono…', en:'A dog? Here? No, the children are asleep…' }],
        her:[{ it:'Il cane della signora? Qui? Ma no…', en:"The lady's dog? Here? Of course not…" }],
        other:[{ it:'Come? Scusi, i bambini dormono…', en:'Sorry? Excuse me, the children are asleep…' }],
      },
      found:[{ it:'Luca! Sofia! Ma cosa avete fatto?!', en:'Luca! Sofia! What have you done?!' }],
      sorry:[{ it:'Mi dispiace tanto! Che vergogna!', en:"I'm so sorry! How embarrassing!" }],
    },
    sofia:{
      found:[{ it:'Mamma, scusa! Ieri sera è entrato in camera, da solo!', en:'Mum, sorry! Last night he came into the room, all by himself!' }],
      name:[{ it:"Si chiama Biscotto. L'abbiamo chiamato noi!", en:'His name is Biscotto. We named him ourselves!' }],
    },
    luca:{
      found:[{ it:'Abbiamo sempre voluto un cane!', en:"We've always wanted a dog!" }], foundClue:'bambini',
    },
  },

  /* 9 · the reunion: the player translates for Margaret (typed, L14.typed.margaret_reunion); then Venezia Santa Lucia */
  'l14-done':{
    sofia:{
      name:[{ it:'Biscuit? Come biscotto! Che bello!', en:'Biscuit? Like biscotto! How lovely!' }],
      bye:[{ it:'Grazie! Ciao, Biscuit! Ciao!', en:'Thank you! Bye, Biscuit! Bye!' }],
    },
    luca:{
      like:[{ it:'Sì! Tantissimo!', en:'Yes! So much!' }],
      biscuit:[{ it:'Un biscotto per Biscuit! Ecco, Biscuit!', en:'A biscuit for Biscuit! Here, Biscuit!' }],
    },
    ferri:{
      bye:[{ it:'Arrivederci, e grazie di tutto! Buona giornata a Venezia!', en:'Goodbye, and thank you for everything! Have a good day in Venice!' }],
    },
    announce:{ it:'Stazione di Venezia Santa Lucia. Il treno è arrivato.', en:'Venezia Santa Lucia station. The train has arrived.' },
  },
};

/* ---------- Margaret (English), per step. Lines the companion says; `choice` lines are CHOICE prompts. ---------- */
const L14_MARGARET = {
  'l14-start':[
    "Oh, thank goodness you're awake! Biscuit is gone! My little dog!",
    "He was right by my feet in the dining car last night. And this morning… nothing. His blanket's empty.",
    "You speak Italian. Please, will you help me ask around?",
  ],
  'l14-start-choices':[{ label:"Of course. Let's go and ask.", primary:true }, { label:"Don't worry, we'll find him.", primary:true }],
  'l14-start-after':"Bless you. Let's start in the dining car: that's the last place I saw him.",
  'l14-barrier':["Ask him where Biscuit went!", "Oh dear. Is it in that little book of yours?"],
  'l14-dining':["Anything? Nobody saw him? But somebody must have!", "Room 14? The sweet old couple! Let's knock."],
  /* after "non ho visto niente": she presses (English: the idea, never the Italian) */
  'l14-dining-press':{ rinaldi:"Nothing? Is he quite sure? Ask him, dear!", ferri:"Nothing at all? Is she sure? Ask her!" },
  'l14-couple':["Six o'clock towards the dining car… and a quarter to seven towards the front? Could Biscuit have gone both ways?",
    "The chef feeds everyone — let's ask him! He's been up since dawn."],
  'l14-nino':["Up at the front, with the driver? That's where Lina saw him going! Come on, dear!"],
  'l14-front':["Listen! A dog! Biscuit? Ask if we can come in!", "That's not my dog! Tell him!",
    "A secret dog! Well, his secret's safe with me too. But then where is my Biscuit?", "Back to the chef, then. He did see a dog at the front… just not mine!"],
  'l14-chef':["Tell the chef what we found out!"],
  'l14-memory':["Next door to them? Who's in that room?"],
  'l14-reveal':["Biscuit! Oh, you naughty boy!"],
  'l14-done':["Look at them. They adore him.", "Thank you. I'd never have found him without you."],
};

/* ---------- Margaret's typed translations (the TYPED_SCRIPTS format, conversation/typing.js) ----------
   Registered by flow.js (Object.assign(TYPED_SCRIPTS, …), with a scene getter so each opens only at its moment). The npc ids
   are the train's: gianni, and sofiaferri (Lesson 9's Sofia is `sofia`); the companion is Margaret (companion:'margaret').
   check(ints) gets the intents of L14_PHRASES; it returns true or a hint that never contains the model sentence. */
const L14_TYPED = {
  /* 5 · outside the driver's cab, after the dog slipped past Gianni: Margaret, and the dog that isn't hers */
  margaret_door:{
    npc:'gianni', tut:'l14-front', modelAfter:2, companion:'margaret',
    opening:{ it:'Ehm… niente, niente!', en:'Er… nothing, nothing!' },
    reopening:{ it:'Sì? Ehm…', en:'Yes? Er…' },
    companionIntro:"Biscuit?! No… no, that's not Biscuit.",
    steps:[
      { lead:"That's not my dog! Tell him!", en:"That's not my dog!", model:'Non è il mio cane!',
        check(ints){
          if (!has(ints, 'l14:not_my_dog')) return 'Say it isn\'t her dog. Speak as Margaret: <i>my</i> dog (Lezione 6: <i>il mio libro</i>).';
          return true; },
        reply(){ return [{ it:'No, no… È Brigante, il mio cane. Viene sempre con me, nei viaggi lunghi.', en:"No, no… It's Brigante, my dog. He always comes with me on long journeys." },
          { it:'Per favore, non lo dica a nessuno! Sul treno non è permesso…', en:"Please don't tell anyone! It's not allowed on the train…", noEn:true }]; } },
      { choice:{ prompt:"What's he saying? He looks terrified.", line:{ it:'Per favore, non lo dica a nessuno! Sul treno non è permesso…', en:"Please don't tell anyone! It's not allowed on the train…" },
          options:[
            { label:"He's begging us not to tell anyone: dogs aren't allowed.", correct:true },
            { label:'He wants us to leave the train.' },
            { label:'He says the dog is ours now.' },
          ] } },
    ],
  },
  /* 9 · the reunion: Margaret to the children (tu) */
  margaret_reunion:{
    npc:'sofiaferri', tut:'l14-done', modelAfter:2, companion:'margaret',
    opening:{ it:'Ciao! Lui è Biscotto!', en:"Hi! This is Biscotto!" },
    reopening:{ it:'Ciao!', en:'Hi!' },
    companionIntro:"Oh, they're darlings. Tell them a few things for me?",
    steps:[
      { lead:"Tell them his name is Biscuit.", en:'His name is Biscuit.', model:'Si chiama Biscuit.',
        check(ints){
          if (!has(ints, 'l14:name_is')) return 'Say what he is <i>called</i>: like <i>mi chiamo</i>, but for him.';
          if (!has(ints, 'l14:biscuit')) return 'And his name: Biscuit.';
          return true; },
        reply(){ return [{ it:'Biscuit? Come biscotto! Che bello!', en:'Biscuit? Like biscotto! How lovely!' }]; } },
      { lead:"Ask the girl if she likes him.", en:'Do you like him?', model:'Ti piace?',
        check(ints){
          if (has(ints, 'like:le')) return 'She\'s a child: <i>tu</i>, not Lei.';
          if (!has(ints, 'like:ti')) return 'Ask if <i>she</i> likes him. She\'s a child: tu (Lezione 8).';
          return true; },
        reply(){ return [{ it:'Sì! Tantissimo! Abbiamo sempre voluto un cane!', en:"Yes! So much! We've always wanted a dog!", noEn:true }]; } },
      { choice:{ prompt:'What did she say?', line:{ it:'Sì! Tantissimo! Abbiamo sempre voluto un cane!', en:"Yes! So much! We've always wanted a dog!" },
          options:[
            { label:"She likes him very much: they've always wanted a dog.", correct:true },
            { label:'She wants to keep him.' },
            { label:'They found him in the corridor.' },
          ] } },
      { lead:"Bless them. Here: give them this, for him. Tell them: here's a biscuit for Biscuit!", en:"Here's a biscuit for Biscuit!", model:'Ecco un biscotto per Biscuit!',
        check(ints){
          if (!has(ints, 'l14:ecco', 'here_is')) return 'Start with <i>here is</i>, as when you hand something over.';
          if (!has(ints, 'l14:a_biscuit')) return 'A biscuit: look it up in the dictionary (it\'s nearly his name).';
          if (!has(ints, 'l14:for') || !has(ints, 'l14:biscuit')) return 'Then: <i>for</i> Biscuit.';
          return true; },
        reply(){ return [{ it:'Un biscotto per Biscuit! Ecco, Biscuit! Ciao, Biscuit!', en:'A biscuit for Biscuit! Here, Biscuit! Bye, Biscuit!' }]; } },
    ],
  },
};

/* ---------- the notebook's clues: who said what, where the dog went, the time ----------
   { who, it, en, where?:L14_WHERE key, time?:L14_TIMES key, when?:'stamattina' | 'ieri sera' | 'stanotte', secret? }
   A clue is written in the notebook when the player has understood it (nbNote / nbAskTime / nbAskWhere, ui/notebook.js). */
const L14_CLUES = {
  'rinaldi-niente':{ who:'rinaldi', it:'Non ho visto niente… forse.', en:"I didn't see anything… maybe." },
  'rinaldi-arrivato':{ who:'rinaldi', it:'Sono arrivato alle sette.', en:'I got here at seven.', time:'rinaldi' },
  'ferri-niente':{ who:'ferri', it:'Non ho visto nessun cane.', en:"I didn't see any dog." },
  'ferri-arrivata':{ who:'ferri', it:'Sono arrivata alle sette.', en:'I got here at seven.', time:'ferri' },
  'camera14':{ who:'ferri', it:"Chieda alla coppia della camera 14: forse sanno dov'è il cane.", en:'Ask the couple in room 14: maybe they know where the dog is.', also:'rinaldi' },
  'ernesto-visto':{ who:'ernesto', it:'Ho visto un cane. È andato verso il vagone ristorante.', en:'I saw a dog. It went towards the dining car.', where:'ristorante', time:'ernesto', when:'stamattina' },
  'lina-visto':{ who:'lina', it:'È andato verso la testa del treno!', en:'It went towards the front of the train!', where:'testa', time:'lina', when:'stamattina' },
  'ernesto-sentito':{ who:'ernesto', it:'Ho sentito un cane stanotte… ma non mi ricordo dove.', en:"I heard a dog last night… but I don't remember where.", when:'stanotte' },
  'nino-davanti':{ who:'nino', it:"C'è un cane davanti, con il macchinista!", en:"There's a dog up at the front, with the driver!", where:'testa', time:'brigante', when:'stamattina' },
  'gianni-brigante':{ who:'gianni', it:'È Brigante, il mio cane.', en:"It's Brigante, my dog.", secret:true },
  'gianni-tornato':{ who:'gianni', it:'Brigante è tornato alle sette meno un quarto.', en:'Brigante came back at a quarter to seven.', time:'brigante', where:'testa', secret:true },
  'nino-osso':{ who:'nino', it:'Ieri sera ha guardato la cena, voleva un osso!', en:'Last night he watched the dinner, he wanted a bone!', where:'cucina', when:'ieri sera' },
  'ernesto-ricordato':{ who:'ernesto', it:'Ha abbaiato nella camera accanto!', en:'It barked in the room next door!', where:'accanto', when:'stanotte' },
  'bambini':{ who:'luca', it:'Abbiamo sempre voluto un cane!', en:"We've always wanted a dog!" },
};
/* Ieri sera…: what the player may remember from Lesson 13's dinner (the train agent plants these; `seen` decides). */
const L14_IERI_SERA = [
  { id:'ferri-vogliono', who:'ferri', it:'«I bambini vogliono sempre un cane!»', en:'"The children always want a dog!"' },
  { id:'bambini-guardano', who:'luca', it:'Luca e Sofia, in pigiama, hanno guardato Biscuit.', en:'Luca and Sofia, in their pyjamas, stared at Biscuit.' },
  { id:'gianni-avanzi', who:'gianni', it:'Gianni è uscito con un pacchetto di avanzi.', en:'Gianni left with a little parcel of leftovers.' },
  { id:'biscuit-cucina', who:'biscuit', it:'Biscuit è andato alla cucina: voleva da mangiare.', en:'Biscuit went to the kitchen hatch: he wanted something to eat.' },
  { id:'nino-pollo', who:'nino', it:'Nino gli ha dato un pezzetto di pollo: «Solo questa volta!»', en:'Nino gave him a piece of chicken: "Just this once!"' },
  { id:'bassi-letto', who:'ernesto', it:'Ernesto e Lina sono andati a letto presto.', en:'Ernesto and Lina went to bed early.' },
];

/* ---------- hints per step: English, what the situation needs, never the Italian answer ---------- */
const L14_HINTS = {
  'l14-dining':{ seen:"Ask if they know where the dog went. They're strangers: polite forms.",
    sure:{ rinaldi:"He says he saw nothing. Ask if he's sure.", ferri:"She says she saw nothing. Ask if she's sure." },
    when:'Ask what time.', next:'Two people have pointed you to the same room. Go and knock.' },
  'l14-couple':{ door:'They asked who it is. Tell them it\'s you, with Margaret: two of you. (Or apologise for disturbing them.)', seen:'Ask if they know where the dog went.',
    when:'They disagree about where it went. Ask each of them what time it was.', notebook:'Write down what you heard: the notebook asks for the time.',
    next:'Two sightings, two times, two directions. Margaret has an idea: the chef.' },
  'l14-nino':{ seen:'Ask Nino if he knows where the dog went.', next:'A dog at the front, with the driver… The driver\'s cab is at the very end of the train.' },
  'l14-front':{ door:'You are disturbing him while he drives. Apologise, and ask if you may come in.', promise:'He is begging you to keep his secret. Promise him.', next:'He told you who to ask next.' },
  'l14-chef':{ seen:'Ask Nino about the dog.', two:'Nino thinks there is only one dog. Tell him what you found out at the cab.',
    whose:'Tell him whose dog you are looking for: the lady\'s.' },
  'l14-memory':{ memory:'Ernesto has remembered something. Ask him where.', next:'The room next to room 14. Knock.' },
  'l14-reveal':{ door:'Knock and apologise for the disturbance.' },
  /* the agreement: feedback on the player's own word (allowed), not the answer */
  agree:{ f:'Biscuit is a he: with essere the ending agrees: <b>-o</b> for him.', pl:'One dog: the ending is singular.',
    sure:{ rinaldi:'Il signor Rinaldi is a man: <b>-o</b>.', ferri:'La signora Ferri is a woman: <b>-a</b>.' },
    siamo:'They understood! A small tip: two people (you and Margaret) take <b>siamo</b>, we are. <i>Sono io</i> is just you.' },
  formal:'Everyone on the train is a stranger, except the children: <b>Lei</b>.',
};

/* ---------- the handbook chapter ---------- */
const L14_CHAPTER = {
  n:14, title:"Dov'è il cane?", sub:'The past with essere: where did it go?',
  dlgNote:'On a train, in the morning. Your friend has gone off somewhere: you ask a lady (a stranger: Lei), then knock on a compartment door.',
  /* the dialogue models the trail's questions without giving away the mystery: a friend, not the dog; no names from the train */
  dialogue:[
    ['Tu', "Mi scusi, signora. Sa dov'è andato il mio amico?", 'Excuse me, madam. Do you know where my friend went?'],
    ['Signora', 'Il signore con il cappello? È andato verso il vagone ristorante.', 'The gentleman with the hat? He went towards the dining car.'],
    ['Tu', 'A che ora?', 'At what time?'],
    ['Signora', 'Alle otto meno un quarto.', 'At a quarter to eight.'],
    ['Tu', 'È sicura?', 'Are you sure?'],
    ['Signora', 'Sì, sono sicura. Ma chieda alla signora della camera 9: forse sa dov\'è.', "Yes, I'm sure. But ask the lady in room 9: maybe she knows where he is."],
    ['Voce', 'Toc toc… Chi è?', 'Knock knock… Who is it?'],
    ['Tu', 'Siamo io e Margaret. Scusi il disturbo, permesso?', "It's me and Margaret. Sorry to bother you, may we come in?"],
    ['Voce', 'Avanti, avanti!', 'Come in, come in!'],
  ],
  pitches:{ Tu:1.1, Signora:1.22, Voce:0.8 },
  phrasesTitle:'What you say',
  phrases:[
    ["Sa dov'è andato il cane?", 'Do you know where the dog went? (polite)', "Sa …? (Lezione 6: Sa dov'è?) + è andato, the past with essere. To a friend: Sai …?"],
    ["Dov'è andato?", 'Where did he (it) go?', 'Andare takes essere: è andato. For a woman: è andata.'],
    ['Ha visto un cane?', 'Have you seen a dog? (polite)', 'Ha + visto: the past with avere (Lezione 13).'],
    ['È sicuro? / È sicura?', 'Are you sure? (polite)', 'Sicuro to a man, sicura to a woman: it agrees, like an adjective.'],
    ['A che ora?', 'At what time?', 'The answer: alle sei, alle sette meno un quarto (Lezione 10).'],
    ['Si ricorda?', 'Do you remember? (polite)', 'Mi ricordo: I remember. Non mi ricordo: I don\'t remember.'],
    ['Scusi il disturbo, permesso?', 'Sorry to bother you, may I come in?', 'At a compartment door, after knocking.'],
    ['Chi è? · Siamo io e …', "Who is it? · It's me and …", 'Two people: siamo (we are). Alone: Sono io (it\'s me).'],
    ['Non lo dico a nessuno.', "I won't tell anyone.", 'A promise. Non … nessuno: not … anyone (nobody).'],
  ],
  phrases2Title:"What you'll hear",
  phrases2:[
    ['È andato verso…', 'It went towards…', 'Verso: towards. Verso la testa del treno: towards the front of the train.'],
    ['Non ho visto niente.', "I didn't see anything.", 'Non … niente: not … anything (nothing).'],
    ['Chieda a…', 'Ask … (polite)', 'Chieda alla signora: ask the lady.'],
    ['Forse sanno…', 'Maybe they know…', 'Sanno: they know (sa: he / she knows).'],
    ['Esco io!', "I'll come out!", 'Uscire: to go out. Esco: I go out.'],
    ['Per favore, non lo dica a nessuno!', "Please, don't tell anyone! (polite)", 'Dica: the polite command of dire (to say, to tell).'],
    ['Ah! Mi sono ricordato!', "Ah! I've remembered!", 'Ricordarsi takes essere too, like every verb with mi / si.'],
  ],
  extraTitle:'Avere or essere?',
  extraNote:'Movement and change (going, coming, going out, coming back, arriving, going in): essere, and the ending agrees. Almost everything else: avere, and the ending never changes.',
  extra:[['🚶 sono andato / andata', 'I went'], ['🔙 è tornato / tornata', 'he / she came back'], ['🚪 è uscito / uscita', 'he / she went out'],
    ['🚉 siamo arrivati / arrivate', 'we arrived'], ['➡️ è entrato / entrata', 'he / she went in'],
    ['👀 ho visto', 'I saw'], ['👂 ho sentito', 'I heard'], ['🍝 ha mangiato', 'he / she ate'], ['💬 ha detto', 'he / she said']],
  how:`<p><b>Movement takes <i>essere</i>.</b> In Lezione 13 the past was <b>avere</b> + the participle: <i>ho visto, ho mangiato</i>. Verbs of
      going and coming take <b>essere</b> instead: <b>andare</b> (to go), <b>tornare</b> (to come back), <b>uscire</b> (to go out),
      <b>arrivare</b> (to arrive), <b>entrare</b> (to go in).</p>
    <table class="dirtable"><thead><tr><th></th><th>a man, a male dog</th><th>a woman</th></tr></thead><tbody>
      <tr><td>io</td><td><b>sono andato</b></td><td><b>sono andata</b></td></tr>
      <tr><td>tu</td><td><b>sei andato</b></td><td><b>sei andata</b></td></tr>
      <tr><td>lui / lei · Lei</td><td><b>è andato</b></td><td><b>è andata</b></td></tr>
      <tr><td>noi</td><td><b>siamo andati</b></td><td><b>siamo andate</b> (only women)</td></tr></tbody></table>
    <p><b>Agreement.</b> With <i>essere</i> the participle agrees with who went, like an adjective (Lezione 11): <b>-o</b> (a man, a male dog),
      <b>-a</b> (a woman), <b>-i</b> (men, or a mixed group), <b>-e</b> (only women). <i>Biscuit è andat<b>o</b></i>, <i>Margaret è andat<b>a</b></i>,
      <i>Mark e Margaret sono andat<b>i</b></i>, <i>Lucia e Margaret sono andat<b>e</b></i>. One letter tells you who went: that is why it matters.
      <i>Sicuro</i> agrees the same way: <i>È sicur<b>o</b>?</i> to a man, <i>È sicur<b>a</b>?</i> to a woman.</p>
    <p><b>Avere or essere?</b> Going from one place to another: <b>essere</b> (<i>è uscito, è tornata, siamo arrivati</i>). Almost everything else:
      <b>avere</b> (<i>ho visto, ho sentito, ha mangiato, ha detto</i>). With <i>avere</i> the participle never changes: <i>Margaret ha visto, Mark ha visto</i>.</p>
    <p><b>Do you know…?</b> <b>Sa …?</b> (Lezione 6) goes in front of any question: <i>Sa dov'è il bagno?</i> (where it is), <i>Sa dov'è andato?</i> (where he went).</p>
    <p><b>Who is it?</b> Behind a door you hear <b>Chi è?</b> Alone: <b>Sono io</b> (it's me), or <i>Sono</i> + your name. Two of you: <b>Siamo io e …</b>
      (literally "we are me and …"): two people take <i>siamo</i>.</p>
    <p><b>Remembering.</b> <b>mi ricordo</b> (I remember), <b>non mi ricordo</b> (I don't remember), <b>Si ricorda?</b> (do you remember? polite).
      In the past it takes <i>essere</i>: <i>Ah! Mi sono ricordato!</i> (a man) / <i>ricordata</i> (a woman).</p>
    <p><b>When.</b> <b>ieri sera</b> (last night, yesterday evening), <b>stanotte</b> (in the night), <b>stamattina</b> (this morning); and the
      times (Lezione 10): <i>alle sei</i> (6:00), <i>alle sei e mezza</i> (6:30), <i>alle sette meno un quarto</i> (6:45: seven minus a quarter).</p>
    <p class="note"><b>Whose?</b> Italian has no 's: <i>la camera <b>del</b> signore</i> (the gentleman's room: di + il), <i>il biglietto <b>della</b> signora</i> (the lady's ticket: di + la).</p>`,
  culture:`<p><b>Dogs on Italian trains.</b> A small dog in a carrier usually travels free; a bigger dog needs its own ticket, a lead and a
      muzzle, and not every train takes one. In a sleeper, the whole compartment has to be booked.</p>
    <p><b>Venezia Santa Lucia.</b> The station at the end of the line opens straight onto the Grand Canal: no cars, no taxis on wheels. You walk
      down the steps, and the next stop is a boat, the <i>vaporetto</i>.</p>`,
  exercises:[
    { type:'mc', q:'Biscuit is a male dog. «Ieri sera Biscuit è ___ alla cucina.»', opts:['andato', 'andata', 'andati'], a:0,
      why:'Biscuit is a he: è andato (-o).', nudge:'With essere the ending agrees with who went. Biscuit is a he.' },
    { type:'mc', q:'Margaret talks about herself: «Sono ___ a prendere un caffè.»', opts:['uscito', 'uscita', 'usciti'], a:1,
      why:'A woman speaking about herself: sono uscita (-a).', nudge:'Who is speaking? A woman.' },
    { type:'mc', q:'«Ieri Margaret ___ visto la basilica.»', opts:['è', 'ha', 'sono'], a:1,
      why:'Vedere takes avere: ha visto. Seeing is not going anywhere.', nudge:'Is seeing a movement from one place to another?' },
    { type:'mc', q:'«Il cane ___ uscito dalla camera.»', opts:['ha', 'è', 'hanno'], a:1,
      why:'Uscire (to go out) is movement: essere. È uscito.', nudge:'Going out of a room: is that a movement?' },
    { type:'order', q:'Do you know where the dog went? (polite)', tiles:['Sa', "dov'è", 'andata', 'andato', 'il cane'], answer:"sa dov'è andato il cane",
      why:"Sa dov'è andato il cane? Sa: polite (Lei). Il cane is masculine: andato.", nudge:'Do you know…: the polite form first. Then the ending for a male dog.' },
    { type:'order', q:'We went to Venice. (you and Mark: two men)', tiles:['a Venezia', 'Siamo', 'andate', 'andati'], answer:'siamo andati a venezia',
      why:'Two men: -i. Siamo andati a Venezia.', nudge:'Men, or a mixed group: the masculine plural.' },
    { type:'mc', q:'She says she saw nothing. You ask la signora if she is sure:', opts:['È sicura?', 'È sicuro?', 'Sei sicura?'], a:0,
      why:'A woman, a stranger: È sicura? (-a, Lei).', nudge:'Who are you asking? A woman, and a stranger.' },
    { type:'mc', q:'Behind the door: «Chi è?» You are there with Margaret: «___ io e Margaret.»', opts:['Siamo', 'Sono', 'È'], a:0,
      why:'Two people: siamo (we are). Siamo io e Margaret.', nudge:'How many of you are at the door?' },
    { type:'mc', q:'You knock on a compartment door. You ask, politely, to come in:', opts:['Scusi il disturbo, permesso?', 'Non lo so.', 'Arrivederci!'], a:0,
      why:'Scusi il disturbo: sorry to bother you. Permesso?: may I come in?', nudge:'You are disturbing someone and want to come in.' },
    { type:'mc', q:'Whose? «La camera ___ signore e il biglietto ___ signora.»', opts:['del … della', 'della … del', 'di … di'], a:0,
      why:'di + il = del (il signore), di + la = della (la signora).', nudge:'Il signore, la signora: join di to each article.' },
    { type:'mc', q:'«Alle otto meno un quarto.» What time is it?', opts:['7:45', '8:15', '8:45'], a:0,
      why:'Le otto meno un quarto: eight minus a quarter, 7:45.', nudge:'Meno means minus.', noSpeak:true },
    { type:'mc', q:'A friend tells you a secret. You promise:', opts:['Non lo dico a nessuno.', 'Non lo so.', 'Non mi ricordo.'], a:0,
      why:"Non lo dico a nessuno: I won't tell anyone.", nudge:'You are promising to keep quiet: dire is to tell.' },
  ],
  /* Vocabolario (≤ 50): the essere past, asking and pressing, at the door, the train, when. Nothing that gives the mystery away
     (whose dogs, how many: the trail's discoveries), and no word an earlier chapter already teaches (il macchinista, il cuoco,
     il vagone ristorante, il cane, visto, sentito, davanti, permesso, accanto, stamattina, ieri sera, stanotte, sono io, siamo: Lezioni 5,
     10, 13); they stay in the tiles, and How it works / the phrases show them. __l14Repeats() checks. */
  vocab:[
    { group:'The past with essere', note:'-o a man (or a male dog), -a a woman, -i men or a mixed group, -e only women.', words:[
      { it:'sono andato / sono andata', en:'I went', note:'A man says andato, a woman andata.', also:['andato', 'andata', 'sono'] },
      { it:'sei andato / sei andata', en:'you (friend) went', also:['sei'] },
      { it:'è andato / è andata', en:'he / she went, you (polite) went', say:'È andato. È andata.' },
      { it:'siamo andati / siamo andate', en:'we went', also:['andati', 'andate'] },
      { it:'è tornato / è tornata', en:'he / she came back', also:['tornato', 'tornata', 'tornati'] },
      { it:'è uscito / è uscita', en:'he / she went out', also:['uscito', 'uscita', 'usciti', 'uscite'] },
      { it:'è arrivato / è arrivata', en:'he / she arrived', also:['arrivato', 'arrivata', 'arrivati'] },
      { it:'è entrato / è entrata', en:'he / she went in', also:['entrato', 'entrata'] },
    ] },
    { group:'Asking about the dog', words:[
      { it:"Sa dov'è andato …?", say:"Sa dov'è andato il cane?", en:'Do you know where … went? (polite)', note:"Sa …? (Lezione 6) + the past." },
      { it:"Dov'è andato?", en:'Where did he (it) go?', also:["dov'è andata"] },
      { it:'È sicuro? / È sicura?', say:'È sicuro? È sicura?', en:'Are you sure? (polite)', note:'Sicuro to a man, sicura to a woman.', also:['sicuro', 'sicura'] },
      { it:'Dove?', en:'Where?', also:['dove'] },
      { it:'Si ricorda?', en:'Do you remember? (polite)', also:['ricorda'] },
      { it:'mi ricordo / non mi ricordo', en:"I remember / I don't remember", also:['ricordo'] },
      { it:'Mi sono ricordato!', en:"I've remembered!", also:['ricordato', 'ricordata'] },
      { it:'niente', en:'nothing (not … anything)', note:'Non ho visto niente.' },
      { it:'forse', en:'maybe' },
      { it:'Chieda a …', say:'Chieda alla signora.', en:'Ask … (polite)', note:'Chieda alla coppia: ask the couple.', also:['chieda'] },
    ] },
    { group:'At the door', words:[
      { it:'bussare', en:'to knock', note:'Toc toc! Bussi alla porta: knock on the door.', also:['bussa', 'bussato'] },
      { it:'Chi è?', en:'Who is it?' },
      { it:'Scusi il disturbo, permesso?', en:'Sorry to bother you, may I come in?', note:'At a door, after knocking. (Permesso: Lezione 10.)', also:['disturbo'] },
      { it:'Avanti!', en:'Come in!' },
      { it:'Esco io!', en:"I'll come out!", note:'Uscire: to go out. Esco: I go out.', also:['esco'] },
    ] },
    { group:'On the train', words:[
      { it:'verso …', say:'verso la testa del treno', en:'towards …', also:['verso'] },
      { it:'la testa del treno', g:'f', en:'the front of the train', also:['testa'] },
      { it:'la camera', g:'f', en:'the room (on a train, in a hotel)', also:['camere'] },
      { it:'la coppia', g:'f', en:'the couple' },
      { it:'del / della', say:'il biglietto del signore, la camera della signora', en:"of the (whose: di + il, di + la)", note:"Italian has no 's: la camera della signora, the lady's room.", also:['del', 'della'] },
    ] },
    { group:'Dogs', words:[
      { it:'abbaiare', en:'to bark', note:'Ha abbaiato tutta la notte: it barked all night.', also:['abbaia', 'abbaiato'] },
      { it:"l'osso", g:'m', en:'the bone', also:['osso'] },
      { it:'il biscotto', g:'m', en:'the biscuit', note:'Biscuit, in Italian: Biscotto!', also:['biscotto'] },
    ] },
    { group:'Promises', words:[
      { it:'Non lo dico a nessuno.', en:"I won't tell anyone.", also:['dico', 'nessuno'] },
      { it:'Per favore, non lo dica a nessuno!', en:"Please don't tell anyone! (polite)", also:['dica'] },
    ] },
  ],
  /* Studio's Verbi: the past. Forms of Lesson 13 (avere) open when Lesson 13 is completed, Lesson 14's (essere) after this
     one. g:'m' / 'f' is who did it (the prompt says lui or lei; the agreement is checked). mood 'past' (ui/grammar.js). */
  verbs:[
    { inf:'mangiare', en:'to eat', forms:[
      { p:'io', it:'ho mangiato', en:'I ate (I have eaten)', lesson:13, mood:'past', ex:'Ho mangiato un gelato.' },
      { p:'noi', it:'abbiamo mangiato', en:'we ate', lesson:13, mood:'past', ex:'Ieri sera abbiamo mangiato nel vagone ristorante.' } ] },
    { inf:'vedere', en:'to see', irr:true, note:'Past: ho visto (an irregular participle).', forms:[
      { p:'io', it:'ho visto', en:'I saw (I have seen)', lesson:13, mood:'past', ex:'Ho visto il museo.' },
      { p:'Lei', it:'ha visto', en:'you (polite) saw', lesson:13, mood:'past', ex:'Ha visto un cane?' },
      { p:'lui', it:'ha visto', en:'he / she saw', lesson:13, mood:'past', ex:'Margaret ha visto la basilica.' } ] },
    { inf:'fare', en:'to do, to make', irr:true, note:'Past: ho fatto.', forms:[
      { p:'tu', it:'hai fatto', en:'you (friend) did', lesson:13, mood:'past', ex:'Cosa hai fatto oggi?' },
      { p:'Lei', it:'ha fatto', en:'you (polite) did', lesson:13, mood:'past', ex:'Cosa ha fatto oggi a Padova?' } ] },
    { inf:'prendere', en:'to take, to have (food, drink)', forms:[
      { p:'io', it:'ho preso', en:'I had, I took (in the past)', lesson:13, mood:'past', ex:'Ho preso un caffè.' } ] },
    { inf:'dire', en:'to say, to tell', irr:true, note:'Past: ho detto.', forms:[
      { p:'lui', it:'ha detto', en:'he / she said', lesson:13, mood:'past', ex:'Margaret ha detto: «Che bello!»' } ] },
    { inf:'leggere', en:'to read', irr:true, note:'Past: ho letto.', forms:[
      { p:'io', it:'ho letto', en:'I read (in the past)', lesson:13, mood:'past', ex:'Ho letto il menù.' } ] },
    { inf:'comprare', en:'to buy', forms:[
      { p:'io', it:'ho comprato', en:'I bought', lesson:13, mood:'past', ex:'Ho comprato un biglietto per Venezia.' } ] },
    { inf:'ballare', en:'to dance', forms:[
      { p:'io', it:'ho ballato', en:'I danced', lesson:13, mood:'past', ex:'Ho ballato in piazza!' } ] },
    { inf:'sentire', en:'to hear', forms:[
      { p:'io', it:'ho sentito', en:'I heard', lesson:13, mood:'past', ex:'Ho sentito la musica in piazza.' },
      { p:'Lei', it:'ha sentito', en:'you (polite) heard', lesson:13, mood:'past', ex:'Ha sentito la musica?' } ] },
    { inf:'andare', en:'to go', irr:true, forms:[
      { p:'io', g:'m', it:'sono andato', en:'I went (a man speaking)', mood:'past', ex:'Sono andato al vagone ristorante.' },
      { p:'io', g:'f', it:'sono andata', en:'I went (a woman speaking)', mood:'past', ex:'Sono andata al vagone ristorante.' },
      { p:'lui', g:'m', it:'è andato', en:'he went (it went: Biscuit)', mood:'past', ex:'Biscuit è andato alla cucina.' },
      { p:'lui', g:'f', it:'è andata', en:'she went', mood:'past', ex:'La signora è andata in camera.' },
      { p:'noi', g:'m', it:'siamo andati', en:'we went', mood:'past', ex:'Siamo andati a letto presto.' } ] },
    { inf:'tornare', en:'to come back', forms:[
      { p:'lui', g:'m', it:'è tornato', en:'he came back', mood:'past', ex:'Mark è tornato a Londra.' },
      { p:'lui', g:'f', it:'è tornata', en:'she came back', mood:'past', ex:'Margaret è tornata con il caffè.' } ] },
    { inf:'uscire', en:'to go out', irr:true, forms:[
      { p:'lui', g:'m', it:'è uscito', en:'he went out', mood:'past', ex:'Il signore è uscito alle sei.' },
      { p:'lui', g:'f', it:'è uscita', en:'she went out', mood:'past', ex:'La signora è uscita alle sette.' },
      { p:'io', g:'f', it:'sono uscita', en:'I went out (a woman speaking)', mood:'past', ex:'Sono uscita a prendere un caffè.' } ] },
    { inf:'arrivare', en:'to arrive', forms:[
      { p:'lui', g:'m', it:'è arrivato', en:'he arrived', mood:'past', ex:'Il treno è arrivato alle otto.' },
      { p:'lui', g:'f', it:'è arrivata', en:'she arrived', mood:'past', ex:'Margaret è arrivata alle sette.' },
      { p:'noi', g:'m', it:'siamo arrivati', en:'we arrived', mood:'past', ex:'Siamo arrivati a Venezia!' } ] },
    { inf:'entrare', en:'to go in, to come in', forms:[
      { p:'lui', g:'m', it:'è entrato', en:'he went in', mood:'past', ex:'Il cane è entrato in cucina.' },
      { p:'lui', g:'f', it:'è entrata', en:'she went in', mood:'past', ex:'La signora è entrata in camera.' } ] },
  ],
  doneTitle:'Ready to find Biscuit.', doneGo:'Back to the train',
};

/* the notebook (ui/notebook.js) for Lesson 14: its people, clues, the "Ieri sera…" page, the comparison page */
const L14_NOTEBOOK = {
  id:'l14', title:'Il taccuino', sub:"Dov'è Biscuit?", button:'Taccuino',
  case:{ it:'Il cane di Margaret: Biscuit. Piccolo. Ieri sera era nel vagone ristorante.', en:"Margaret's dog: Biscuit. Small. Last night he was in the dining car." },
  /* the people's cards: names and roles in Italian (the notebook's entries are Italian only) */
  people:[['rinaldi', 'al telefono'], ['ferri', 'la mamma di Luca e Sofia'], ['ernesto', 'camera 14'], ['lina', 'camera 14'], ['nino', 'il cuoco'],
    ['gianni', 'il macchinista'], ['luca', 'i bambini']].map(([id, role]) => ({ id, name:id === 'luca' ? 'Luca e Sofia' : L14_CAST[id].name, role })),
  clues:L14_CLUES, times:L14_TIMES, where:L14_WHERE, ieriSera:L14_IERI_SERA,
  /* the two sightings side by side. Nothing waits on the question (the trail goes on to the chef either way); "two dogs" is a
     hunch here, confirmed at the driver's cab */
  compare:{ a:'ernesto-visto', b:'lina-visto', title:'Due avvistamenti', sub:'Two sightings, side by side',
    q:{ it:'Lo stesso cane?', en:'The same dog?', options:[
      { id:'one', it:'Sì: è lo stesso cane.', en:"Yes: it's the same dog.",
        reply:{ it:'Possibile… Prima verso il vagone ristorante, alle sei. Poi verso la testa del treno, alle sette meno un quarto?', en:'Possible… First towards the dining car, at six. Then towards the front of the train, at a quarter to seven?' } },
      { id:'two', it:'Forse ci sono due cani!', en:'Maybe there are two dogs!', correct:true,
        reply:{ it:'Due cani…? Ma chi ha un altro cane, su questo treno?', en:'Two dogs…? But who has another dog on this train?' } },
    ] } },
};

const L14 = { n:L14_N, cast:L14_CAST, tiles:L14_TILES, bankTiles:L14_BANK, phrases:L14_PHRASES, times:L14_TIMES, where:L14_WHERE,
  scripts:L14_SCRIPTS, margaret:L14_MARGARET, typed:L14_TYPED, clues:L14_CLUES, ieriSera:L14_IERI_SERA, hints:L14_HINTS,
  chapter:L14_CHAPTER, handbook:L14_CHAPTER, vocab:L14_CHAPTER.vocab, practice:L14_CHAPTER.exercises, verbs:L14_CHAPTER.verbs,
  notebook:L14_NOTEBOOK };

/* ---------- registration ---------- */
/* LESSONS is read by position (LESSONS[n - 1]): until Lesson 13 exists, a stand-in chapter 13 keeps chapter 14 in its place.
   It is shown locked in the handbook and left out of Studio (placeholder:true); a real src/lessons/13-…/content.js runs
   before this file and makes it unnecessary. */
if (!LESSONS.some(L => L.n === 13) && LESSONS.length === 12) LESSONS.push({
  n:13, placeholder:true, title:'Il treno della notte', sub:'(coming soon)', dlgNote:'This chapter arrives with Lezione 13.',
  dialogue:[], pitches:{}, phrasesTitle:'What you say', phrases:[], how:'<p>Coming soon.</p>', culture:'<p>Coming soon.</p>',
  exercises:[{ type:'mc', q:'Coming soon.', opts:['OK'], a:0, why:'', nudge:'' }], doneTitle:'', doneGo:'Back',
});
if (LESSONS.length === 13) LESSONS.push(L14_CHAPTER);
/* the base hook: no start() (no skip link, no "Start Lezione 14" button until the flow exists). The flow agent extends it:
   Object.assign(LESSON_HOOKS[14], { start, skip, objective, guide, talk, bank, react, … }). */
LESSON_HOOKS[14] = LESSON_HOOKS[14] || { n:14 };
Object.assign(LESSON_HOOKS[14], {
  n:14, bankTiles:L14_BANK, doneTut:'l14-done',
  vocabNote:'The tiles for asking about Biscuit: on the train, in Lezione 14.',
  phrases(){ return S.lesson === 14 ? L14_PHRASES : []; },
  /* the detective notebook (ui/notebook.js): on while S.l14.notebook is set (the flow sets it, e.g. from l14-dining on) */
  notebook(){ return S.lesson === 14 && S.l14 && S.l14.notebook ? l14NotebookSpec() : null; },
});
/* the dictionary lists the lesson's tiles (hook vocab): the mystery's discoveries (spoiler tiles: whose dogs, how many) only once
   the player has seen the second dog (l14Discovered, trail.js). The vocab audit reads bankTiles (every tile). */
Object.defineProperty(LESSON_HOOKS[14], 'vocab', { configurable:true, enumerable:true,
  get(){ return L14_BANK.filter(t => !t.spoiler || l14Discovered()); } });
