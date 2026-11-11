/* The cast. Each NPC is a small personality (agenda, greetings, directions, formality) read by conversation/brain.js. */

/* Each NPC is a small personality, not a script. The engine (respond) reacts to
   whatever known phrases the player strings together, then the NPC pursues its
   own agenda: 'how' = ask how you are, 'name' = ask your name,
   'tellName' = volunteer its own name once it knows yours, 'order' = take your order. */
NPCS.push(
  {
    id:'giulia', name:'Giulia', place:'Bar Centrale', where:'waitress at Bar Centrale', pron:['She','her'],
    x:760, y:290, baseFace:{x:0,y:1}, body:'#c23b2a', hair:'#3a2318', skin:'#e6b48f', apron:'#fffdf8', longHair:true, pitch:1.15,
    unknown:'Ciao! Come stai?',
    opening:{ it:'Ciao!', en:'Hi!' }, greet:{ it:'Ciao', en:'Hi' }, answerHow:{ it:'Bene, grazie!', en:'Fine, thanks!' },
    agenda:['how','name'],
    revisitOpening:{ it:'Ciao, {Me}!', en:'Hi, {Me}!' }, revisitAgenda:['how'],
    markHello:{ it:'Ciao Mark! Piacere! Vuoi un caffè?', en:'Hi Mark! Nice to meet you! Would you like a coffee?' },
  },
  {
    id:'marco', name:'Paolo', place:'the fountain', where:'by the fountain', pron:['He','his'],
    x:590, y:432, baseFace:{x:-0.79,y:-0.62}, body:'#d38d2a', hair:'#1e1a17', skin:'#c98d62', pitch:0.8,
    unknown:'Buongiorno! Come ti chiami?',
    opening:{ it:'Buongiorno!', en:'Good morning!' }, greet:{ it:'Buongiorno', en:'Good morning' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    agenda:['name','tellName','how'],
    revisitOpening:{ it:'Buongiorno, {Me}!', en:'Good morning, {Me}!' }, revisitAgenda:['how'],
    needDirIn:['l5-meet'], askModel:"Paolo, dov'è la statua di Gattamelata?",
    directions:{
      gattamelata:{ intro:{ it:'Il Gattamelata? È in Piazza del Santo, davanti alla basilica.', en:"The Gattamelata? It's in Piazza del Santo, in front of the basilica." }, lines:PAOLO_ROUTE, route:true,
        confirm:{ right:{ it:'Sì, a destra alla banca. Poi, dopo il ponte, a sinistra.', en:'Yes, right at the bank. Then, after the bridge, left.' },
                  left:{ it:'A sinistra dopo il ponte, sì. Ma prima a destra, alla banca!', en:'Left after the bridge, yes. But first right, at the bank!' },
                  straight:{ it:'Sì: dritto fino alla banca, e poi dritto fino al ponte.', en:'Yes: straight as far as the bank, then straight to the bridge.' } },
        far:{ it:"Un po'. Venti minuti a piedi.", en:'A bit. Twenty minutes on foot.' } },
    },
    dirBye:{ it:'Prego! Buona visita al Gattamelata!', en:"You're welcome! Enjoy the Gattamelata!" },
    markHello:{ it:'Ciao Mark! Piacere! Benvenuto!', en:'Hi Mark! Nice to meet you! Welcome!' },
    englishReply:{ it:"Ah, inglese! Hello! … È tutto l'inglese che so.", en:"Ah, English! Hello! … That's all the English I know." },
  },
  {
    id:'chiara', name:'Chiara', place:'the newsstand', where:'reading at the newsstand', pron:['She','her'],
    x:200, y:470, baseFace:{x:1,y:0}, body:'#7a3a6e', hair:'#9a4a26', skin:'#efc6a4', longHair:true, newspaper:true, pitch:1.25,
    unknown:'Mmm? Ciao!', startsQuiet:true,
    opening:{ it:'…', en:"(She is reading a newspaper and hasn't noticed you.)" },
    greet:{ it:'Oh! Ciao', en:'Oh! Hi' }, answerHow:{ it:'Bene, grazie!', en:'Fine, thanks!' },
    agenda:[],            // shy: she answers and returns questions, but you lead
    revisitOpening:{ it:'Ciao, {Me}! Come stai?', en:'Hi, {Me}! How are you?', asks:'how' }, revisitAgenda:[],
    needDirIn:['l3-directions'], askModel:"Scusa, dov'è via dei Mille?",
    markHello:{ it:'Oh! Ciao Mark! Piacere!', en:'Oh! Hi Mark! Nice to meet you!' },
    directions:{
      mille:{ intro:{ it:'Via dei Mille? È nel quartiere San Lorenzo. Non è lontano!', en:"Via dei Mille? It's in the San Lorenzo neighbourhood. It's not far!" }, lines:CHIARA_ROUTE, confirm:CHIARA_CONFIRM, far:CHIARA_FAR, route:true },
      aurora:{ intro:{ it:'Il Caffè Aurora? È in via dei Mille, nel quartiere San Lorenzo.', en:"Caffè Aurora? It's on Via dei Mille, in the San Lorenzo neighbourhood." }, lines:CHIARA_ROUTE, confirm:CHIARA_CONFIRM, far:CHIARA_FAR, route:true },
    },
    dirBye:{ it:'Prego! A dopo, {Me}!', en:"You're welcome! See you later, {Me}!" },
  },
  {
    id:'enzo', name:'Enzo', lesson:2, place:'the counter, Bar Centrale', where:'owner and barista at Bar Centrale', pron:['He','his'],
    x:845, y:144, approach:{ x:845, y:196 }, promptOffset:{ x:80, y:14 }, baseFace:{x:0,y:1},
    body:'#f2efe8', hair:'#a8a8a8', skin:'#d9a37e', apron:'#2b2b2b', pitch:0.7, formal:true, barista:true,
    opening:{ it:'Buongiorno!', en:'Good morning!' }, greet:{ it:'Buongiorno', en:'Good morning' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    agenda:['name','tellName','order'],
    revisitOpening:{ it:'Buongiorno, {Me}! Cosa prende?', en:'Good morning, {Me}! What will you have?', asks:'order' }, revisitAgenda:['order'],
    markHello:{ it:'Piacere, Mark! Benvenuto al Bar Centrale!', en:'Nice to meet you, Mark! Welcome to Bar Centrale!' },
  },
  {
    id:'emma', name:'Emma', lesson:2, english:true, translateFor:true, place:'by the café', where:'a tourist from Manchester', pron:['She','her'],
    x:655, y:250, baseFace:{x:0,y:1}, body:'#2f8f8a', hair:'#d9b26a', skin:'#f0c9a8', hat:true,
  },
  {
    id:'rosa', name:'Rosa', lesson:3, scene:'sanlorenzo', place:'Via Garibaldi, San Lorenzo', where:'walking her dog in San Lorenzo', pron:['She','her'],
    x:310, y:335, baseFace:{x:1,y:0}, body:'#5b6e9e', hair:'#d8d8d8', skin:'#e8c3a0', dog:true, pitch:1.05, formal:true, askNameFirst:true,
    opening:{ it:'Buongiorno!', en:'Good morning!' }, greet:{ it:'Buongiorno', en:'Good morning' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    agenda:['name','tellName'],
    revisitOpening:{ it:'Buongiorno, {Me}!', en:'Good morning, {Me}!' }, revisitAgenda:[],
    needDirIn:['l3-stranger'], askModel:"Scusi, dov'è via dei Mille?",
    markHello:{ it:'Piacere, Mark! Benvenuto a San Lorenzo!', en:'Nice to meet you, Mark! Welcome to San Lorenzo!' },
    directions:{
      mille:{ intro:{ it:'Via dei Mille? È qui vicino!', en:"Via dei Mille? It's near here!" }, lines:ROSA_ROUTE, confirm:ROSA_CONFIRM, far:ROSA_FAR, route:true },
      aurora:{ intro:{ it:'Il Caffè Aurora? È qui vicino, in via dei Mille!', en:"Caffè Aurora? It's near here, on Via dei Mille!" }, lines:ROSA_ROUTE, confirm:ROSA_CONFIRM, far:ROSA_FAR, route:true },
      banca:{ intro:{ it:'La banca? È lì, in via Garibaldi, a sinistra.', en:"The bank? It's there, on Via Garibaldi, on the left." }, lines:[], far:ROSA_FAR },
      farmacia:{ intro:{ it:'La farmacia? Vada dritto in via Garibaldi. È dopo via dei Mille, a sinistra.', en:"The pharmacy? Go straight along Via Garibaldi. It's after Via dei Mille, on the left." }, lines:[], far:ROSA_FAR },
      chiesa:{ intro:{ it:'La chiesa? È qui! La chiesa di San Lorenzo.', en:"The church? It's right here! The church of San Lorenzo." }, lines:[], far:ROSA_FAR },
    },
    dirBye:{ it:'Prego! Buona giornata!', en:"You're welcome! Have a nice day!" },
  },
);
NPCS.push(
  {
    id:'mark', name:'Mark', lesson:4, scene:'aurora', english:true, place:'your table', where:'your friend from home (English only!)', pron:['He','his'],
    x:462, y:280, baseFace:{x:-0.5,y:0.9}, body:'#4a6fa5', hair:'#c9a46a', skin:'#f0c9a8',
  },
  {
    id:'davide', name:'Davide', lesson:4, scene:'aurora', waiter:true, formal:true, place:'Caffè Aurora', where:'waiter at Caffè Aurora', pron:['He','his'],
    x:506, y:364, baseFace:{x:-1,y:0}, body:'#fffdf8', apron:'#2b2b2b', hair:'#2a1a12', skin:'#d9a37e', pitch:0.92, notepad:true,
    opening:{ it:'Buongiorno!', en:'Good morning!' }, greet:{ it:'Buongiorno', en:'Good morning' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    agenda:[], revisitOpening:{ it:'Sì?', en:'Yes?' }, revisitAgenda:[],
  },
);
NPCS.push({
  id:'lucia', name:'Lucia', lesson:5, scene:'santo', place:'Piazza del Santo', where:'art student, sketching the Gattamelata', pron:['She','her'],
  x:476, y:376, baseFace:{x:-1,y:-0.5}, body:'#8a4f6e', hair:'#2a1a12', skin:'#e8bfa0', longHair:true, notepad:true, pitch:1.2,
  formal:true, askNameFirst:true, needsMarkIntro:true, startsQuiet:true, needDirIn:['l5-statue'], askModel:'Scusi, questa è la statua di Gattamelata?',
  opening:{ it:'…', en:"(She is sketching the statue and hasn't noticed you.)" }, greet:{ it:'Oh! Buongiorno', en:'Oh! Good morning' },
  answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' }, agenda:['name','tellName','introMark'],
  revisitOpening:{ it:'Buongiorno, {Me}!', en:'Good morning, {Me}!' }, revisitAgenda:[],
  directions:{ gattamelata:{ intro:{ it:'Sì, è questa! È il Gattamelata di Donatello.', en:"Yes, this is it! It's Donatello's Gattamelata." },
    lines:[{ it:'È del 1453: il primo grande cavallo di bronzo dai tempi dei Romani.', en:"It's from 1453: the first big bronze horse since Roman times." }],
    far:{ it:'Lontano? È qui!', en:"Far? It's right here!" } } },
  dirBye:{ it:'Prego! Buona visita!', en:"You're welcome! Enjoy your visit!" },
  markHello:{ it:'Piacere, Mark! Benvenuto a Padova… o quasi!', en:'Nice to meet you, Mark! Welcome to Padua… almost!' },
});
NPCS.push({
  id:'bruno', name:'Bruno', lesson:6, place:'a bench, Piazza del Santo', where:'learning English from your handbook', pron:['He','his'],
  x:636, y:404, baseFace:{x:0,y:-1}, body:'#6b5a3a', hair:'#d0d0d0', skin:'#e0b090', book:true, pitch:0.75, formal:true, startsQuiet:true,
  opening:{ it:'…', en:'(He is reading.)' }, greet:{ it:'Oh! Buongiorno', en:'Oh! Good morning' }, answerHow:{ it:'Bene, grazie!', en:'Fine, thanks!' },
  agenda:['name','tellName'], revisitOpening:{ it:'Buongiorno, {Me}! Hello!', en:'Good morning, {Me}! (And “hello”, in English.)' }, revisitAgenda:['how'],
  markHello:{ it:'Mark! My friend! Piacere!', en:'Mark! “My friend”! Nice to meet you!' },
});
/* Lesson 7: the market vendors in Piazza delle Erbe (scene 'mercato'). Each stands behind a stall
   counter (STALLS in world/scenes.js) facing the aisle; the player talks from the front (approach).
   Older strangers: formal, Lei. Prices come from the Lesson 7 hooks, not from here.
   sign: the hand-painted name board on their awning (render/backgrounds.js). Talking to them counts as
   knowing their name (you read it on the sign: S.met/S.known), but it is not an introduction: they don't
   know yours, so they never get revisit openings (conversation/dialog.js). */
const marketVendor = (o, left) => Object.assign({
  lesson:7, scene:'mercato', formal:true, pron:['She','her'], baseFace:{x:0,y:1},
  approach:{ x:o.x, y:o.y + 50 }, promptOffset:{ x:left ? -96 : 96, y:14 },
  opening:{ it:'Buongiorno!', en:'Good morning!' }, greet:{ it:'Buongiorno', en:'Good morning' },
  answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },   // the brain adds "E Lei?" when you haven't said how you are
  agenda:['how'], revisitOpening:{ it:'Buongiorno, {Me}!', en:'Good morning, {Me}!' }, revisitAgenda:['how'],
}, o);
NPCS.push(
  marketVendor({ id:'teresa', name:'Teresa', sign:'Da Teresa', place:'T-shirt stall, Piazza delle Erbe', where:'sells T-shirts at the market',
    x:330, y:210, body:'#7a4b8c', apron:'#efe1c4', hair:'#bdb5ad', skin:'#e8c3a0', longHair:true, pitch:1.1 }, true),
  marketVendor({ id:'franco', name:'Franco', sign:'Franco', place:'tie and scarf stall, Piazza delle Erbe', where:'sells ties and scarves at the market', pron:['He','his'],
    x:330, y:378, body:'#3c4a5c', apron:'#8a2a3a', hair:'#6a6a6a', skin:'#d9a37e', pitch:0.85 }, true),
  marketVendor({ id:'gino', name:'Gino', sign:'Fiori di Gino', place:'flower stall, Piazza delle Erbe', where:'sells flowers at the market', pron:['He','his'],
    x:630, y:210, body:'#4f7a3a', apron:'#f2efe8', hair:'#8a8a8a', skin:'#c98d62', hat:true, pitch:0.78 }, false),
  marketVendor({ id:'pina', name:'Pina', sign:'Pina', place:'fruit and vegetable stall, Piazza delle Erbe', where:'sells fruit and vegetables at the market',
    x:630, y:378, body:'#b0563a', apron:'#2e6a4e', hair:'#3a2318', skin:'#d9a37e', longHair:true, pitch:1.2 }, false),
);
/* Lesson 9: Sofia, a visitor from Milan with a backpack. She walks up to you at the market exit and asks the way to
   San Lorenzo (lessons/09-quanti/sofia.js); she comes back in Lesson 11. A stranger: Lei. Her scene is 'away' (nowhere)
   unless a lesson's sceneOf hook puts her somewhere (Lesson 9: the market). Her openings are getters in sofia.js. */
NPCS.push({
  id:'sofia', name:'Sofia', lesson:9, scene:'away', formal:true, place:'Piazza delle Erbe', where:'a visitor from Milan', pron:['She','her'],
  x:480, y:470, baseFace:{x:0,y:-1}, body:'#2f7d6d', hair:'#6b3a1f', skin:'#e9c09c', longHair:true, backpack:'#e07a2f', pitch:1.12,
  opening:{ it:'Scusi! Buongiorno.', en:'Excuse me! Good morning.' }, greet:{ it:'Buongiorno', en:'Good morning' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
  agenda:[], revisitOpening:{ it:'Buongiorno!', en:'Good morning!' }, revisitAgenda:[],
});
/* Lesson 10: the museum square (scene 'museo', world/museo.js). The cashier stands behind the glass of the ticket booth
   (Biglietteria) and is talked to from the front; a stranger at work: formal, Lei. Her lines for the ticket come from the
   Lesson 10 hooks; this is the plain personality underneath. */
NPCS.push({
  id:'cassiera', name:'Cassiera', lesson:10, scene:'museo', formal:true, place:'Biglietteria, Museo d\'Arte', where:'the cashier at the museum ticket office', pron:['She','her'],
  x:628, y:200, baseFace:{x:0,y:1}, approach:{ x:628, y:248 }, promptOffset:{ x:104, y:14 },
  body:'#1f3550', hair:'#5a3a22', skin:'#e8c3a0', longHair:true, pitch:1.08,
  opening:{ it:'Buongiorno! Mi dica.', en:'Good morning! How can I help?' }, greet:{ it:'Buongiorno', en:'Good morning' },
  answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' }, agenda:['how'],
  revisitOpening:{ it:'Buongiorno! Mi dica.', en:'Good morning! How can I help?' }, revisitAgenda:[],
});
/* The museum interior (scene 'galleria', world/galleria.js): the custodian, il custode, sits on his chair against the
   atrium's west wall, by the Pietà, and calls "Troppo vicino!" when anyone steps inside a statue's rope (galTooClose).
   Formal, a minimal personality: Lesson 11 gives him his lines. He is there whenever the museum is open (after Lesson 10). */
NPCS.push({
  id:'guardia', name:'Custode', lesson:10, scene:'galleria', formal:true, place:"Museo d'Arte · I Capolavori", where:'the museum custodian', pron:['He','his'],
  x:716, y:800, baseFace:{x:1,y:0}, body:'#2b3646', hair:'#5a5a5a', skin:'#e2b48e', cap:'#1f2836', pitch:0.8, seated:true,
  opening:{ it:'Buongiorno.', en:'Good morning.' }, greet:{ it:'Buongiorno', en:'Good morning' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
  agenda:[], revisitOpening:{ it:'Buongiorno.', en:'Good morning.' }, revisitAgenda:[],
});
/* The crowd (crowd:true, world/museo.js): people who are in the way, not people to talk to. Bumping into one, pressing E
   or tapping them opens the Permesso / Scusi / Prego pick. aside: the waypoints of their short walk out of the way (the
   last one is where they then stay; a free spot near it if it is taken). They never get a name pill or a "?" mark.
   Here: tourists and a school group in the bay in front of the ticket booth (Lesson 10 on). Later scenes can reuse
   crowd:true with their own lesson and scene. */
const crowdPerson = o => Object.assign({ lesson:10, scene:'museo', crowd:true, formal:true, baseFace:{x:0,y:-1}, pron:['They','their'],
  place:'Museo d\'Arte', where:'a visitor waiting at the museum', opening:{ it:'Sì?', en:'Yes?' }, greet:{ it:'Buongiorno', en:'Good morning' },
  answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' }, agenda:[], revisitOpening:{ it:'Sì?', en:'Yes?' }, revisitAgenda:[] }, o);
NPCS.push(
  /* the mouth of the bay: three people side by side, a planter on either side of them */
  crowdPerson({ id:'turista1', name:'Turista', x:562, y:294, aside:[[540, 334], [486, 340]], body:'#c9b48a', hair:'#c9a46a', skin:'#f0c9a8', backpack:'#c23b2a', camera:'#2b2b2b', pitch:0.9, baseFace:{x:0.3,y:-1} }),
  crowdPerson({ id:'turista2', name:'Turista', x:618, y:300, aside:[[618, 344], [770, 346]], body:'#e58fa0', hair:'#3a2318', skin:'#d9a37e', hat:true, longHair:true, camera:'#c9ccd2', pitch:1.2 }),
  crowdPerson({ id:'turista3', name:'Turista', x:674, y:292, aside:[[704, 330], [790, 300]], body:'#2f4f6f', hair:'#d8d8d8', skin:'#e8c3a0', backpack:'#2e6a4e', pitch:0.8, baseFace:{x:-0.3,y:-1} }),
  /* at the window, in front of the cashier */
  crowdPerson({ id:'turista4', name:'Turista', x:628, y:250, aside:[[572, 242]], body:'#7a4b8c', hair:'#bdb5ad', skin:'#e6b48f', longHair:true, bag:'#8a5a33', pitch:1.1 }),
  /* a school group with its teacher, on the paving in front of the bay */
  crowdPerson({ id:'maestra', name:'Maestra', x:590, y:392, aside:[[536, 404]], body:'#2e8b57', hair:'#6b3a1f', skin:'#e9c09c', longHair:true, flag:'#f4b928', pitch:1.15, baseFace:{x:0,y:1} }),
  crowdPerson({ id:'alunno1', name:'Alunno', x:560, y:428, aside:[[506, 446]], body:'#1c3d8f', hair:'#2a1a12', skin:'#d9a37e', kid:true, cap:'#f4b928', pitch:1.5, baseFace:{x:0.5,y:-1} }),
  crowdPerson({ id:'alunno2', name:'Alunno', x:622, y:432, aside:[[680, 458]], body:'#c23b2a', hair:'#9a4a26', skin:'#f0c9a8', kid:true, cap:'#f4b928', backpack:'#1c3d8f', pitch:1.55, baseFace:{x:-0.5,y:-1} }),
  crowdPerson({ id:'alunna', name:'Alunna', x:590, y:462, aside:[[636, 492]], body:'#f4b928', hair:'#3a2318', skin:'#e6b48f', kid:true, longHair:true, cap:'#f4b928', pitch:1.6 }),
);
/* Lesson 11 on: visitors in the museum interior (scene 'galleria', world/galleria.js). Crowd blockers (crowd:true, the
   Lesson 10 Permesso pick) stand in front of a painting: blocks = the work they hide (E on it, or a tap, opens the pick
   until they have moved); group: one Permesso moves everyone in the group; aside = their walk out of the way (the last
   point is where they stay); asideFace = where they look then. Ambient visitors (ambient:true) never win over a work for
   E, get no marks, and say their line (says) in a bubble when spoken to; wander = a slow loop of waypoints [x, y, look?]
   (look: pause there, facing the wall); seated = on a bench. */
const galVisitor = o => crowdPerson(Object.assign({ lesson:11, scene:'galleria', place:"Museo d'Arte · I Capolavori", where:'a visitor in the museum', baseFace:{x:0,y:-1}, asideFace:{x:0,y:-1} }, o));
const GAL_LOOP = [[912, 960], [740, 940, 0], [640, 940], [560, 940, 1], [420, 960], [313, 900, 1], [250, 990], [90, 960], [76, 860], [76, 700], [200, 600], [338, 520, 1],
  [580, 540], [580, 380], [580, 300], [681, 240, 1], [760, 322], [1040, 322], [1124, 240, 1], [1244, 300], [1244, 400], [1244, 560], [1531, 520, 1], [1650, 600],
  [1748, 650], [1748, 760], [1748, 900], [1587, 920, 1], [1300, 960], [1180, 940], [1080, 940], [1000, 950]];
NPCS.push(
  /* Sala 1: a school group with its teacher, in front of La battaglia di San Romano */
  galVisitor({ id:'maestro', name:'Maestro', blocks:'uccello-san-romano', group:'s1', x:203, y:888, aside:[[203, 960], [120, 1000]], body:'#3c4a5c', hair:'#6a6a6a', skin:'#d9a37e', flag:'#2e8a4e', pitch:0.85 }),
  galVisitor({ id:'scolaro', name:'Scolaro', blocks:'uccello-san-romano', group:'s1', x:160, y:896, aside:[[160, 960], [70, 1030]], body:'#c23b2a', hair:'#2a1a12', skin:'#e6b48c', kid:true, cap:'#2e8a4e', pitch:1.5 }),
  galVisitor({ id:'scolara', name:'Scolara', blocks:'uccello-san-romano', group:'s1', x:246, y:896, aside:[[246, 960], [170, 1060]], body:'#f4b928', hair:'#7a4f2a', skin:'#f0c9a8', kid:true, longHair:true, cap:'#2e8a4e', pitch:1.6 }),
  /* Sala 2: a couple in front of La Primavera */
  galVisitor({ id:'visitatore', name:'Visitatore', blocks:'botticelli-primavera', group:'s2', x:108, y:500, aside:[[100, 580], [80, 640]], body:'#55624a', hair:'#3a2318', skin:'#c98d62', pitch:0.85 }),
  galVisitor({ id:'visitatrice', name:'Visitatrice', blocks:'botticelli-primavera', group:'s2', x:152, y:500, aside:[[160, 580], [140, 660]], body:'#b0563a', hair:'#161616', skin:'#c98d62', longHair:true, bag:'#2b2b2b', pitch:1.15 }),
  /* Sala 3: a tourist with an audio guide in front of Giuditta e Oloferne */
  galVisitor({ id:'audioguida', name:'Turista', blocks:'caravaggio-giuditta', x:1423, y:498, aside:[[1430, 580], [1400, 640]], body:'#e58fa0', hair:'#c9a46a', skin:'#f0c9a8', audio:'#2b2b2b', backpack:'#1c3d8f', pitch:1.1 }),
  /* Sala 4: a student sketching Dinamismo di un cane al guinzaglio */
  galVisitor({ id:'studente', name:'Studente', blocks:'balla-cane', x:1441, y:896, aside:[[1441, 950], [1370, 975]], body:'#2f4f6f', hair:'#2b1d14', skin:'#e8c3a0', sketch:true, pitch:0.95 }),
  /* Sala 5: another school group, at the rope in front of La scuola di Atene */
  galVisitor({ id:'guida', name:'Guida', blocks:'raffaello-atene', group:'s5', x:858, y:246, aside:[[1050, 250], [1060, 300]], body:'#7a3a6e', hair:'#bdb5ad', skin:'#e6b48c', longHair:true, flag:'#c23b2a', pitch:1.1 }),
  galVisitor({ id:'ragazzo', name:'Ragazzo', blocks:'raffaello-atene', group:'s5', x:912, y:250, aside:[[1010, 252], [1100, 318]], body:'#1c3d8f', hair:'#4e3220', skin:'#cf9668', kid:true, cap:'#c23b2a', pitch:1.45 }),
  galVisitor({ id:'ragazza', name:'Ragazza', blocks:'raffaello-atene', group:'s5', x:966, y:246, aside:[[1050, 246], [1130, 270]], body:'#3c9a50', hair:'#2b1d14', skin:'#e6b48c', kid:true, longHair:true, cap:'#c23b2a', pitch:1.55 }),
);
/* ambient visitors: they are not in the way (no Permesso pick); a word if you speak to them */
const galAmbient = o => Object.assign({ lesson:11, scene:'galleria', ambient:true, formal:true, pron:['They','their'], place:"Museo d'Arte · I Capolavori", where:'a visitor in the museum',
  baseFace:{x:0,y:-1}, opening:{ it:'Buongiorno.', en:'Good morning.' }, greet:{ it:'Buongiorno', en:'Good morning' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
  agenda:[], revisitOpening:{ it:'Buongiorno.', en:'Good morning.' }, revisitAgenda:[] }, o);
NPCS.push(
  /* an old man on the bench in Sala 2, with his walking stick */
  galAmbient({ id:'anziano', name:'Signore', x:346, y:631, seated:true, stick:true, body:'#6b5a44', hair:'#e2e2e2', skin:'#e8c3a0', pitch:0.7, says:{ it:'Bellissimo, vero?', en:"Beautiful, isn't it?" } }),
  /* a couple strolling round the museum, slowly, one behind the other */
  galAmbient({ id:'signora', name:'Signora', x:912, y:960, wander:{ path:GAL_LOOP, start:0, speed:38 }, body:'#2e6a4e', hair:'#d9d4cc', skin:'#efc6a4', longHair:true, bag:'#8a2a3a', pitch:1.1, says:{ it:'Che bello!', en:'How lovely!' } }),
  galAmbient({ id:'signore', name:'Signore', x:740, y:940, wander:{ path:GAL_LOOP, start:1, speed:38 }, body:'#8a8f99', hair:'#9a9a9a', skin:'#e6b48c', hat:true, pitch:0.8, says:{ it:'Buongiorno!', en:'Good morning!' } }),
  /* a tourist with a camera, going round the other way */
  galAmbient({ id:'turista', name:'Turista', x:1587, y:920, wander:{ path:GAL_LOOP.slice().reverse(), start:4, speed:46 }, body:'#e07a2f', hair:'#c9a15a', skin:'#f3cfae', camera:'#2b2b2b', backpack:'#2e6a4e', pitch:1.0, says:{ it:'Scusi, non parlo italiano!', en:"Sorry, I don't speak Italian!" } }),
);
NPCS.forEach(n => { NPC[n.id] = n; });
const L1_PEOPLE = NPCS.filter(n => !n.lesson);

/* Lesson 12: the station (scene 'stazione', world/stazione.js). The clerk behind the glass of the ticket office (formal; his
   lines for the ticket come from lessons/12-la-citta/station.js), the conductor beside the night train's door on platform
   3–4 (night only), two travellers in the concourse (ambient: a line in a bubble). */
NPCS.push(
  { id:'bigliettaio', name:'Bigliettaio', lesson:12, scene:'stazione', formal:true, place:'Biglietteria, Stazione', where:'the clerk at the station ticket office', pron:['He','his'],
    x:107, y:394, baseFace:{ x:0, y:1 }, approach:{ x:107, y:446 }, promptOffset:{ x:112, y:14 },
    body:'#2e4a6e', hair:'#3a2a1a', skin:'#d9a37e', pitch:0.86,
    opening:{ it:'Buongiorno! Mi dica.', en:'Good afternoon! How can I help?' }, greet:{ it:'Buongiorno', en:'Good afternoon' },
    answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' }, agenda:[], revisitOpening:{ it:'Buongiorno! Mi dica.', en:'Good afternoon! How can I help?' }, revisitAgenda:[] },
  { id:'capotreno', name:'Capotreno', lesson:12, scene:'stazione', formal:true, place:'Binario 3, Stazione', where:'the conductor of the night train', pron:['He','his'],
    x:630, y:150, baseFace:{ x:-0.5, y:1 }, body:'#1f3f7a', hair:'#6a6a6a', skin:'#e2b48e', cap:'#1f2836', pitch:0.78,
    opening:{ it:'Buonasera!', en:'Good evening!' }, greet:{ it:'Buonasera', en:'Good evening' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    agenda:[], revisitOpening:{ it:'Buonasera!', en:'Good evening!' }, revisitAgenda:[] },
  { id:'viaggiatore', name:'Viaggiatore', lesson:12, scene:'stazione', ambient:true, formal:true, place:'Stazione', where:'a traveller', pron:['He','his'],
    x:300, y:476, baseFace:{ x:0, y:-1 }, body:'#5a6b4a', hair:'#2a1a12', skin:'#c98d62', bag:'#7a3a2a', says:{ it:'Uffa, il mio treno è in ritardo!', en:'Oh no, my train is late!' } },
  { id:'viaggiatrice', name:'Viaggiatrice', lesson:12, scene:'stazione', ambient:true, formal:true, place:'Stazione', where:'a traveller', pron:['She','her'],
    x:720, y:440, baseFace:{ x:-1, y:-0.4 }, body:'#b0563a', hair:'#d8b26a', skin:'#f0c9a8', longHair:true, backpack:'#2f7d6d', says:{ it:'Venezia? Bellissima!', en:'Venice? Beautiful!' } },
);
['bigliettaio', 'capotreno', 'viaggiatore', 'viaggiatrice'].forEach(id => { NPC[id] = NPCS.find(n => n.id === id); });
/* Opening hours (Lesson 12 on: day and night, world/daytime.js). hours:{ afternoon?, night? }: false = not there at that
   time; { x, y, face } = stands there then. Bar Centrale shuts at night (Enzo gone, the shutter down: render/night.js),
   the market and the museum close, Giulia comes out into the piazza; the night train's conductor is there only at night. */
{
  const away = { night:false };
  ['enzo', 'bruno', 'emma', 'cassiera', 'teresa', 'franco', 'gino', 'pina', 'bigliettaio', 'viaggiatore', 'viaggiatrice'].forEach(id => { if (NPC[id]) NPC[id].hours = away; });
  NPCS.filter(n => n.crowd && n.scene === 'museo').forEach(n => { n.hours = away; });
  NPC.giulia.hours = { night:{ x:396, y:486, face:{ x:0.3, y:-1 } } };
  NPC.capotreno.hours = { afternoon:false, morning:false };
}
/* Lesson 12's quests, batch 2 (src/quests/01-mamma, 02-farmacia, 09-gelateria, 12-musica). The shopkeepers stand in their
   shops (world/shops.js); Giorgia, a little girl who has lost her mum, is in the piazza (tu); her mum, Laura, is nowhere
   until Gino has seen her (the quest's sceneOf puts her at Bar Centrale's tables, or in the gelateria at night); at night
   the buskers (a guitarist and a singer, ambient) play by the fountain, and two strangers stand and listen (Lei). */
NPCS.push(
  { id:'farmacista', name:'Farmacista', lesson:12, scene:'farmacia', formal:true, place:'Farmacia, San Lorenzo', where:'the pharmacist', pron:['She','her'],
    x:827, y:330, baseFace:{ x:-1, y:0 }, approach:{ x:784, y:330 }, promptOffset:{ x:-78, y:14 },
    body:'#f4f4f0', apron:'#2e8b57', hair:'#3a2318', skin:'#e8c3a0', longHair:true, pitch:1.12,
    opening:{ it:'Buongiorno! Mi dica.', en:'Good afternoon! How can I help?' }, greet:{ it:'Buongiorno', en:'Good afternoon' },
    answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' }, agenda:[], revisitOpening:{ it:'Buongiorno! Mi dica.', en:'Good afternoon! How can I help?' }, revisitAgenda:[] },
  { id:'gelataio', name:'Gelataio', lesson:12, scene:'gelateria', formal:true, place:'Gelateria, Piazza Centrale', where:'the man at the gelateria', pron:['He','his'],
    x:480, y:201, baseFace:{ x:0, y:1 }, approach:{ x:480, y:249 }, promptOffset:{ x:100, y:30 },
    body:'#fffdf8', apron:'#b55470', hair:'#2a1a12', skin:'#d9a37e', cap:'#fffdf8', pitch:0.9,
    opening:{ it:'Buonasera! Cono o coppetta?', en:'Good evening! A cone or a cup?' }, greet:{ it:'Buonasera', en:'Good evening' },
    answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' }, agenda:[], revisitOpening:{ it:'Buonasera! Cono o coppetta?', en:'Good evening! A cone or a cup?' }, revisitAgenda:[] },
  { id:'bambina', name:'Giorgia', lesson:12, place:'Piazza Centrale', where:'a little girl who has lost her mum', pron:['She','her'],
    x:648, y:526, baseFace:{ x:-0.4, y:-1 }, body:'#e58fa0', hair:'#a8441f', skin:'#f0c9a8', longHair:true, kid:true, pitch:1.6,
    opening:{ it:'Ciao…', en:'Hi…' }, greet:{ it:'Ciao', en:'Hi' }, answerHow:{ it:'Male…', en:'Not good…' }, agenda:[], revisitOpening:{ it:'Ciao, {Me}!', en:'Hi, {Me}!' }, revisitAgenda:[] },
  { id:'mamma', name:'Laura', lesson:12, scene:'away', formal:true, place:'Bar Centrale', where:"Giorgia's mum", pron:['She','her'],
    x:879, y:262, baseFace:{ x:1, y:0 }, body:'#2f6f9a', hair:'#c2461f', skin:'#f0c9a8', longHair:true, bag:'#f4d03f', flowers:true, pitch:1.15,
    opening:{ it:'Buongiorno!', en:'Good afternoon!' }, greet:{ it:'Buongiorno', en:'Good afternoon' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    agenda:[], revisitOpening:{ it:'Buongiorno!', en:'Good afternoon!' }, revisitAgenda:[] },
  { id:'chitarrista', name:'Chitarrista', lesson:12, ambient:true, formal:true, place:'Piazza Centrale', where:'a busker with a guitar', pron:['He','his'],
    x:330, y:214, baseFace:{ x:0.5, y:1 }, body:'#3c4a5c', hair:'#2b1d14', skin:'#d9a37e', guitar:true, pitch:0.85, says:{ it:'Grazie, grazie!', en:'Thank you, thank you!' } },
  { id:'cantante', name:'Cantante', lesson:12, ambient:true, formal:true, place:'Piazza Centrale', where:'a busker who sings', pron:['She','her'],
    x:384, y:200, baseFace:{ x:0, y:1 }, body:'#b03a5b', hair:'#161616', skin:'#c98d62', longHair:true, mic:true, pitch:1.2, says:{ it:'Questa canzone è per voi!', en:'This song is for you!' } },
  { id:'marta', name:'Marta', lesson:12, formal:true, place:'Piazza Centrale', where:'a woman listening to the music', pron:['She','her'],
    x:742, y:446, baseFace:{ x:-1, y:-0.4 }, body:'#2e6a4e', hair:'#5a3a22', skin:'#e8c3a0', longHair:true, bag:'#8a2a3a', pitch:1.1,
    opening:{ it:'Buonasera!', en:'Good evening!' }, greet:{ it:'Buonasera', en:'Good evening' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    agenda:[], revisitOpening:{ it:'Buonasera, {Me}!', en:'Good evening, {Me}!' }, revisitAgenda:[] },
  { id:'luca', name:'Luca', lesson:12, formal:true, place:'Piazza Centrale', where:'a man listening to the music', pron:['He','his'],
    x:700, y:300, baseFace:{ x:-1, y:0.2 }, body:'#7a4b8c', hair:'#2a1a12', skin:'#c98d62', pitch:0.85,
    opening:{ it:'Buonasera!', en:'Good evening!' }, greet:{ it:'Buonasera', en:'Good evening' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    agenda:[], revisitOpening:{ it:'Buonasera, {Me}!', en:'Good evening, {Me}!' }, revisitAgenda:[] },
);
['farmacista', 'gelataio', 'bambina', 'mamma', 'chitarrista', 'cantante', 'marta', 'luca'].forEach(id => { NPC[id] = NPCS.find(n => n.id === id); });
{
  /* the evening's people: out at night only (and at any time in free play after Lesson 12, so their tasks can be done) */
  const evening = () => ({ get afternoon(){ return typeof questFree === 'function' && questFree() ? undefined : false; } });
  ['gelataio', 'chitarrista', 'cantante', 'marta', 'luca'].forEach(id => { NPC[id].hours = evening(); });
}
/* Lesson 12's quests, batch 3 (src/quests/06-aquilone, 08-foto, 11-tramonto). The bridge (scene 'ponte', world/ponte.js): by
   day Anna and Giulio, a couple on holiday who would like their photo taken (Lei; Giulio lets Anna do the talking: he is
   ambient, and E on him talks to her while their task is on), a painter at her easel, two passers-by; in the evening Sara and
   Tommaso, two students watching the sunset (tu; Tommaso ambient, like Giulio), someone out for a stroll. The park (scene
   'parco', world/parco.js): Pietro, a boy whose kite is stuck in the big tree (tu), the gardener by his shed (Lei), two
   children with a ball, an old man feeding the ducks, a woman walking her dog (by day and at night). */
NPCS.push(
  { id:'anna', name:'Anna', lesson:12, scene:'ponte', formal:true, place:'Ponte Molino', where:'a woman on holiday, on the bridge', pron:['She','her'],
    x:420, y:394, baseFace:{ x:0.4, y:-1 }, body:'#2f7fd0', hair:'#6b4226', skin:'#f0c9a8', longHair:true, bag:'#c2461f', camera:'#2b2b2b', pitch:1.15,
    opening:{ it:'Buongiorno!', en:'Good afternoon!' }, greet:{ it:'Buongiorno', en:'Good afternoon' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    agenda:[], revisitOpening:{ it:'Buongiorno!', en:'Good afternoon!' }, revisitAgenda:[] },
  { id:'giulio', name:'Giulio', lesson:12, scene:'ponte', ambient:true, formal:true, place:'Ponte Molino', where:"Anna's husband", pron:['He','his'],
    x:458, y:396, baseFace:{ x:-0.3, y:-1 }, body:'#e6dcc4', hair:'#2a1a12', skin:'#e2b48e', pitch:0.85, says:{ it:'Che bel ponte!', en:'What a lovely bridge!' } },
  { id:'sara', name:'Sara', lesson:12, scene:'ponte', place:'Ponte Molino', where:'a student watching the sunset', pron:['She','her'],
    x:640, y:394, baseFace:{ x:0.2, y:-1 }, body:'#e07a2f', hair:'#2b1d14', skin:'#d9a37e', longHair:true, backpack:'#3a5a8a', pitch:1.2,
    opening:{ it:'Ciao!', en:'Hi!' }, greet:{ it:'Ciao', en:'Hi' }, answerHow:{ it:'Bene, grazie!', en:'Fine, thanks!' }, agenda:[], revisitOpening:{ it:'Ciao!', en:'Hi!' }, revisitAgenda:[] },
  { id:'tommaso', name:'Tommaso', lesson:12, scene:'ponte', ambient:true, place:'Ponte Molino', where:"Sara's boyfriend", pron:['He','his'],
    x:678, y:396, baseFace:{ x:-0.2, y:-1 }, body:'#2e6a4e', hair:'#7a4f2a', skin:'#f0c9a8', pitch:0.9, says:{ it:'Che bello, il tramonto!', en:'How lovely, the sunset!' } },
  { id:'pittrice', name:'Pittrice', lesson:12, scene:'ponte', ambient:true, formal:true, place:'Ponte Molino', where:'a painter at her easel', pron:['She','her'],
    x:884, y:430, baseFace:{ x:-0.5, y:-1 }, body:'#7a3a6e', hair:'#bdb5ad', skin:'#efc6a4', longHair:true, sketch:true, pitch:1.05, says:{ it:'Che luce, oggi!', en:'What light today!' } },
  { id:'passante', name:'Signora', lesson:12, scene:'ponte', ambient:true, formal:true, place:'Ponte Molino', where:'a passer-by', pron:['She','her'],
    x:180, y:500, baseFace:{ x:1, y:0 }, body:'#b0563a', hair:'#d8b26a', skin:'#f0c9a8', longHair:true, bag:'#2b2b2b', pitch:1.1,
    stroll:{ path:[[180, 500, 3], [900, 500, 2]], speed:40, back:true }, says:{ it:'Buongiorno!', en:'Good afternoon!' } },
  { id:'passante2', name:'Signore', lesson:12, scene:'ponte', ambient:true, formal:true, place:'Ponte Molino', where:'a passer-by', pron:['He','his'],
    x:900, y:524, baseFace:{ x:-1, y:0 }, body:'#3c4a5c', hair:'#9a9a9a', skin:'#e6b48c', newspaper:true, pitch:0.8,
    stroll:{ path:[[900, 524, 1], [70, 524, 4]], speed:52, back:true }, says:{ it:'Scusi, ho fretta!', en:"Sorry, I'm in a hurry!" } },
  { id:'nottambulo', name:'Signore', lesson:12, scene:'ponte', ambient:true, formal:true, place:'Ponte Molino', where:'someone out for an evening stroll', pron:['He','his'],
    x:80, y:500, baseFace:{ x:1, y:0 }, body:'#5a4a6a', hair:'#3a2a1a', skin:'#c98d62', pitch:0.85,
    stroll:{ path:[[80, 500, 2], [880, 500, 5, { x:0, y:-1 }]], speed:30, back:true }, says:{ it:'Buonasera!', en:'Good evening!' } },
  { id:'pietro', name:'Pietro', lesson:12, scene:'parco', place:"Giardini dell'Arena", where:'a boy whose kite is stuck in a tree', pron:['He','his'],
    x:236, y:376, baseFace:{ x:-0.5, y:-1 }, body:'#2f7fd0', hair:'#7a4f2a', skin:'#f0c9a8', kid:true, cap:'#d8342a', pitch:1.5,
    opening:{ it:'Ciao…', en:'Hi…' }, greet:{ it:'Ciao', en:'Hi' }, answerHow:{ it:'Male…', en:'Not good…' }, agenda:[], revisitOpening:{ it:'Ciao!', en:'Hi!' }, revisitAgenda:[] },
  { id:'giardiniere', name:'Giardiniere', lesson:12, scene:'parco', formal:true, place:"Giardini dell'Arena", where:'the gardener', pron:['He','his'],
    x:700, y:240, baseFace:{ x:-0.3, y:-1 }, body:'#5a7a4a', apron:'#3a5a2a', hair:'#9a9a9a', skin:'#d9a37e', hat:true, pitch:0.78,
    opening:{ it:'Buongiorno!', en:'Good afternoon!' }, greet:{ it:'Buongiorno', en:'Good afternoon' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    agenda:[], revisitOpening:{ it:'Buongiorno!', en:'Good afternoon!' }, revisitAgenda:[] },
  { id:'bimbo', name:'Bambino', lesson:12, scene:'parco', ambient:true, place:"Giardini dell'Arena", where:'a child playing', pron:['He','his'],
    x:150, y:478, baseFace:{ x:1, y:0.2 }, body:'#f4b928', hair:'#2a1a12', skin:'#c98d62', kid:true, pitch:1.6, says:{ it:'Passa la palla!', en:'Pass the ball!' } },
  { id:'bimba', name:'Bambina', lesson:12, scene:'parco', ambient:true, place:"Giardini dell'Arena", where:'a child playing', pron:['She','her'],
    x:292, y:506, baseFace:{ x:-1, y:-0.2 }, body:'#c46ad0', hair:'#d8b26a', skin:'#f3cfae', kid:true, longHair:true, pitch:1.7, says:{ it:'Prendi!', en:'Catch!' } },
  { id:'nonno', name:'Signore', lesson:12, scene:'parco', ambient:true, formal:true, place:"Giardini dell'Arena", where:'an old man feeding the ducks', pron:['He','his'],
    x:626, y:448, baseFace:{ x:1, y:0.1 }, body:'#6b5a44', hair:'#e2e2e2', skin:'#e8c3a0', stick:true, pitch:0.7, says:{ it:'Le anatre hanno fame!', en:'The ducks are hungry!' } },
  { id:'signoracane', name:'Signora', lesson:12, scene:'parco', ambient:true, formal:true, place:"Giardini dell'Arena", where:'a woman walking her dog', pron:['She','her'],
    x:60, y:338, baseFace:{ x:1, y:0 }, body:'#2e6a4e', hair:'#3a2318', skin:'#efc6a4', longHair:true, dog:true, pitch:1.1,
    stroll:{ path:[[60, 338, 2], [380, 340], [420, 292], [540, 290], [584, 326], [900, 330, 3]], speed:36, back:true }, says:{ it:'Buongiorno! Bravo, Fido!', en:'Good afternoon! Good boy, Fido!' } },
);
['anna', 'giulio', 'sara', 'tommaso', 'pittrice', 'passante', 'passante2', 'nottambulo', 'pietro', 'giardiniere', 'bimbo', 'bimba', 'nonno', 'signoracane'].forEach(id => { NPC[id] = NPCS.find(n => n.id === id); });
{
  /* out in their own time of day (and at any time in free play after Lesson 12, so their tasks can be done) */
  const free = () => typeof questFree === 'function' && questFree();
  const dayOnly = () => ({ get night(){ return free() ? undefined : false; } }), eveningOnly = () => ({ get afternoon(){ return free() ? undefined : false; } });
  ['anna', 'giulio', 'pietro', 'giardiniere'].forEach(id => { NPC[id].hours = dayOnly(); });
  ['sara', 'tommaso'].forEach(id => { NPC[id].hours = eveningOnly(); });
  ['pittrice', 'passante', 'passante2', 'bimbo', 'bimba', 'nonno'].forEach(id => { NPC[id].hours = { night:false }; });
  NPC.nottambulo.hours = { afternoon:false };
}
/* Lesson 12's quests, batch 4 (src/quests/04-mercato, 05-basilica, 10-aperitivo). The covered market under the Palazzo della
   Ragione (scene 'salone', world/salone.js): Marisa at her deli counter (Lei; the SALUMERIA sign: "da Marisa"), the baker,
   the cheesemonger, the pasta maker (ambient, behind their counters), two shoppers in the aisle. The basilica (scene
   'basilica', world/basilica.js): the volunteer at the door (Lei), the sacristan by the sacristy (Lei), two people praying in
   the pews, a visitor by the saint's chapel (ambient). Rosa (Lesson 3) and Davide (Lesson 4) are the aperitivo's: the quest
   puts Rosa at a table in Caffè Aurora in the evening. */
NPCS.push(
  { id:'marisa', name:'Marisa', lesson:12, scene:'salone', formal:true, sign:'Salumeria · da Marisa', place:'Sotto il Salone', where:'the woman at the deli counter', pron:['She','her'],
    x:480, y:170, baseFace:{ x:0, y:1 }, approach:{ x:480, y:222 }, promptOffset:{ x:96, y:44 },
    body:'#f4f0e8', apron:'#7a2e2a', hair:'#5a3a22', skin:'#e8c3a0', longHair:true, pitch:1.08,
    opening:{ it:'Buongiorno! Mi dica.', en:'Good afternoon! How can I help?' }, greet:{ it:'Buongiorno', en:'Good afternoon' },
    answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' }, agenda:[], revisitOpening:{ it:'Buongiorno! Mi dica.', en:'Good afternoon! How can I help?' }, revisitAgenda:[] },
  { id:'fornaio', name:'Fornaio', lesson:12, scene:'salone', ambient:true, formal:true, place:'Sotto il Salone', where:'the baker', pron:['He','his'],
    x:164, y:160, baseFace:{ x:0, y:1 }, body:'#fffdf8', apron:'#b5652f', hair:'#3a2a1a', skin:'#d9a37e', cap:'#fffdf8', pitch:0.82, says:{ it:'Pane fresco! Focaccia calda!', en:'Fresh bread! Warm focaccia!' } },
  { id:'formaggiaio', name:'Signore', lesson:12, scene:'salone', ambient:true, formal:true, place:'Sotto il Salone', where:'the cheesemonger', pron:['He','his'],
    x:796, y:160, baseFace:{ x:0, y:1 }, body:'#efe6d2', apron:'#d9a520', hair:'#d8d8d8', skin:'#e2b48e', pitch:0.72, says:{ it:'Grana, Asiago, Montasio… tutto buonissimo!', en:'Grana, Asiago, Montasio… all delicious!' } },
  { id:'pastaia', name:'Signora', lesson:12, scene:'salone', ambient:true, formal:true, place:'Sotto il Salone', where:'the pasta maker', pron:['She','her'],
    x:190, y:446, baseFace:{ x:0, y:-1 }, body:'#f4f0e8', apron:'#2e6a4e', hair:'#2a1a12', skin:'#c98d62', longHair:true, pitch:1.15, says:{ it:'Tortellini fatti a mano!', en:'Handmade tortellini!' } },
  { id:'cliente1', name:'Signora', lesson:12, scene:'salone', ambient:true, formal:true, place:'Sotto il Salone', where:'a shopper', pron:['She','her'],
    x:80, y:268, baseFace:{ x:1, y:0 }, body:'#5b6e9e', hair:'#d8b26a', skin:'#f0c9a8', longHair:true, bag:'#c2461f', pitch:1.1,
    stroll:{ path:[[80, 268, 2, { x:0, y:-1 }], [300, 262, 3, { x:0, y:-1 }], [880, 270, 2, { x:0, y:-1 }]], speed:34, back:true }, says:{ it:'Buongiorno!', en:'Good afternoon!' } },
  { id:'cliente2', name:'Signore', lesson:12, scene:'salone', ambient:true, formal:true, place:'Sotto il Salone', where:'a shopper', pron:['He','his'],
    x:880, y:352, baseFace:{ x:-1, y:0 }, body:'#6b5a44', hair:'#9a9a9a', skin:'#e6b48c', newspaper:true, pitch:0.8,
    stroll:{ path:[[880, 352, 3, { x:0, y:1 }], [640, 356], [200, 350, 3, { x:0, y:1 }]], speed:30, back:true }, says:{ it:'Che profumo, qui!', en:'What a smell in here!' } },
  { id:'volontaria', name:'Volontaria', lesson:12, scene:'basilica', formal:true, place:'Basilica del Santo', where:'a volunteer at the door', pron:['She','her'],
    x:560, y:506, baseFace:{ x:-1, y:-0.3 }, body:'#3a4a6a', hair:'#bdb5ad', skin:'#efc6a4', longHair:true, pitch:1.0,
    opening:{ it:'Buongiorno.', en:'Good afternoon.' }, greet:{ it:'Buongiorno', en:'Good afternoon' },
    answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' }, agenda:[], revisitOpening:{ it:'Buongiorno.', en:'Good afternoon.' }, revisitAgenda:[] },
  { id:'sacrestano', name:'Sacrestano', lesson:12, scene:'basilica', formal:true, place:'Basilica del Santo', where:'the sacristan', pron:['He','his'],
    x:858, y:206, baseFace:{ x:-1, y:0.2 }, body:'#2b2b30', hair:'#8a8a8a', skin:'#e2b48e', pitch:0.76,
    opening:{ it:'Buongiorno.', en:'Good afternoon.' }, greet:{ it:'Buongiorno', en:'Good afternoon' },
    answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' }, agenda:[], revisitOpening:{ it:'Buongiorno.', en:'Good afternoon.' }, revisitAgenda:[] },
  { id:'fedele1', name:'Signora', lesson:12, scene:'basilica', ambient:true, formal:true, place:'Basilica del Santo', where:'a woman praying', pron:['She','her'],
    x:330, y:296, baseFace:{ x:0, y:-1 }, body:'#2b2b2b', hair:'#d8d8d8', skin:'#e8c3a0', seated:true, pitch:1.0, says:{ it:'Shh…', en:'Shh…' } },
  { id:'fedele2', name:'Signore', lesson:12, scene:'basilica', ambient:true, formal:true, place:'Basilica del Santo', where:'a man praying', pron:['He','his'],
    x:620, y:364, baseFace:{ x:0, y:-1 }, body:'#4a5a6a', hair:'#3a2a1a', skin:'#c98d62', seated:true, pitch:0.85, says:{ it:'Shh… silenzio!', en:'Shh… quiet!' } },
  { id:'pellegrina', name:'Signora', lesson:12, scene:'basilica', ambient:true, formal:true, place:'Basilica del Santo', where:'a pilgrim at the tomb', pron:['She','her'],
    x:150, y:388, baseFace:{ x:-1, y:-0.6 }, body:'#8a4f6e', hair:'#3a2318', skin:'#efc6a4', longHair:true, flowers:true, pitch:1.1, says:{ it:'È bellissima, la basilica…', en:'It\'s so beautiful, the basilica…' } },
);
['marisa', 'fornaio', 'formaggiaio', 'pastaia', 'cliente1', 'cliente2', 'volontaria', 'sacrestano', 'fedele1', 'fedele2', 'pellegrina'].forEach(id => { NPC[id] = NPCS.find(n => n.id === id); });
{
  /* the market and the basilica: open in the afternoon (and at any time in free play) */
  const free = () => typeof questFree === 'function' && questFree();
  const dayOnly = () => ({ get night(){ return free() ? undefined : false; } });
  ['marisa', 'fornaio', 'formaggiaio', 'pastaia', 'cliente1', 'cliente2', 'volontaria', 'sacrestano', 'fedele1', 'fedele2', 'pellegrina'].forEach(id => { NPC[id].hours = dayOnly(); });
}
/* Lessons 13–14: the night train, Il Laguna Express (scene 'treno', world/treno.js; the compartments are scenes 'cabina11' …
   'cabina18'). Who sleeps where (the compartment numbers, Lesson 13's as-built notes): 11 Margaret (and Biscuit), 12 il signor
   Rinaldi, 13 empty, 14 Ernesto and Lina Bassi, 15 Luca and Sofia (the Ferri children), 16 la signora Ferri, 17 the player, 18
   empty. Margaret speaks only English (english:true: a lesson's talk hook has her conversation; translating, she is the
   companion). Biscuit, her small dog, and Brigante, the driver's (bigger, dark) dog, are dogs (animal:'dog', render/treno.js:
   drawDog): ambient (E: a bark), n.sit, n.follows (world/treno.js dogFollow). Brigante is nowhere ('away') until a lesson
   puts him somewhere (Lesson 14: in the cab). The children are in their compartment ('cabina15') unless a lesson moves them.
   Default places: the dinner (Lesson 13); lessons move everyone with their sceneOf / place hooks. All formal (Lei) but the
   children (tu). The children's ids are lucaferri / sofiaferri ('luca' is quest 12's Luca, 'sofia' Lesson 9's Sofia); l14who
   names them as Lesson 14's cast (L14_CAST.luca / .sofia). */
{
  const tr = o => Object.assign({ lesson:13, scene:'treno', formal:true, place:'Il Laguna Express', baseFace:{ x:0, y:1 }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    greet:{ it:'Buonasera', en:'Good evening' }, opening:{ it:'Buonasera!', en:'Good evening!' }, revisitOpening:{ it:'Buonasera!', en:'Good evening!' }, agenda:[], revisitAgenda:[] }, o);
  NPCS.push(
    tr({ id:'margaret', ...CAST.margaret, formal:false, where:'an English lady travelling with her little dog',      // (her looks: units/shared/cast.js)
      x:1176, y:212, baseFace:{ x:1, y:0 }, seated:true,
      opening:{ it:'Hello!', en:'Hello!' }, revisitOpening:{ it:'Hello again!', en:'Hello again!' } }),
    tr({ id:'biscuit', ...CAST.biscuit, formal:false, where:"Margaret's little dog",
      x:1202, y:254, baseFace:{ x:0.4, y:-1 }, sit:true }),
    tr({ id:'brigante', name:'Brigante', animal:'dog', ambient:true, formal:false, scene:'away', where:"the driver's dog", pron:['He','his'],
      x:2360, y:230, baseFace:{ x:-1, y:0 }, size:1.28, coat:'#3a2a22', ears:'#1e1410', chest:'#e8dccb', patch:'#2a1e18', collar:'#2f5a3a', body:'#3a2a22', hair:'#1e1410', skin:'#3a2a22', pitch:0.7,
      says:{ it:'Bau! Bau!', en:'Woof! Woof!' } }),
    tr({ id:'nino', name:'Nino', where:'the chef of the dining car', place:'Vagone ristorante', pron:['He','his'],
      x:1856, y:420, baseFace:{ x:-1, y:0 }, approach:{ x:1805, y:420 }, body:'#fffdf8', apron:'#e8e2d4', toque:true, hair:'#2a1a12', skin:'#d9a37e', pitch:0.95,
      opening:{ it:'Buonasera! Prego!', en:'Good evening! Come in!' }, revisitOpening:{ it:'Sì? Mi dica!', en:'Yes? What can I do for you?' } }),
    tr({ id:'ferri', name:'Signora Ferri', where:'a mother travelling with her two children', pron:['She','her'],
      x:1176, y:494, baseFace:{ x:1, y:0 }, seated:true, body:'#2f6f6a', hair:'#4a2a1a', skin:'#e8c3a0', longHair:true, bag:'#c2461f', pitch:1.12 }),
    tr({ id:'lucaferri', l14who:'luca', name:'Luca', formal:false, scene:'cabina15', ambient:true, where:"la signora Ferri's son", pron:['He','his'],
      x:380, y:330, baseFace:{ x:0, y:1 }, body:'#a8c8e8', pyjamas:'#5a86b8', hair:'#4a2a1a', skin:'#efc6a4', kid:true, pitch:1.55,
      greet:{ it:'Ciao', en:'Hi' }, opening:{ it:'Ciao!', en:'Hi!' }, revisitOpening:{ it:'Ciao!', en:'Hi!' }, says:{ it:'Ciao!', en:'Hi!' } }),
    tr({ id:'sofiaferri', l14who:'sofia', name:'Sofia', formal:false, scene:'cabina15', ambient:true, where:"la signora Ferri's daughter", pron:['She','her'],
      x:420, y:360, baseFace:{ x:0, y:1 }, body:'#f2c6d2', pyjamas:'#d0708a', hair:'#4a2a1a', skin:'#efc6a4', longHair:true, kid:true, pitch:1.65,
      greet:{ it:'Ciao', en:'Hi' }, opening:{ it:'Ciao!', en:'Hi!' }, revisitOpening:{ it:'Ciao!', en:'Hi!' }, says:{ it:'Ciao!', en:'Hi!' } }),
    tr({ id:'gianni', name:'Gianni', where:'the train driver (il macchinista)', pron:['He','his'],
      x:1796, y:470, baseFace:{ x:1, y:0 }, body:'#2c3a5c', hair:'#3a2a1a', skin:'#c98d62', cap:'#1f2836', pitch:0.74 }),
    tr({ id:'rinaldi', name:'Signor Rinaldi', where:'a businessman, always on the phone', pron:['He','his'],
      x:1336, y:494, baseFace:{ x:1, y:0 }, seated:true, body:'#2b2b30', hair:'#1e1a17', skin:'#e2b48e', phone:true, pitch:0.85 }),
    tr({ id:'ernesto', name:'Ernesto', where:'an elderly gentleman (room 14), married fifty years', pron:['He','his'],
      x:1336, y:212, baseFace:{ x:1, y:0 }, seated:true, body:'#6b5a44', hair:'#e6e6e6', skin:'#e8c3a0', pitch:0.72 }),
    tr({ id:'lina', ...CAST.lina, where:"Ernesto's wife (room 14)",                          // (her looks: units/shared/cast.js; Venezia's Lesson 3 too)
      x:1444, y:212, baseFace:{ x:-1, y:0 }, seated:true }),
  );
  ['margaret', 'biscuit', 'brigante', 'nino', 'ferri', 'lucaferri', 'sofiaferri', 'gianni', 'rinaldi', 'ernesto', 'lina'].forEach(id => { NPC[id] = NPCS.find(n => n.id === id); });
}
/* Lesson 15: Venice. Venezia Santa Lucia ('santalucia', world/venezia.js): the man at the information desk (infopoint) and the
   barista of the station bar (baristaSL), two travellers crossing the hall (ambient strollers); outside on the fondamenta
   ('ferrovia'): the ACTV ticket seller in his booth (actv), il signor Bepi (Giuseppe), an old Venetian on his way across town
   (flat cap, scarf, walking stick, shopping bag: he stops for Biscuit; a friendly face for Unit 2), travellers with suitcases (a
   Lesson 10 crowd, one group: one Permesso moves them all) and a tour group with its guide (from the breakfast on, at the gate),
   the deckhand on the pontoon (once the boat is in). All Lei. The staff (infopoint, baristaSL, actv) go by their job, as the
   Lesson 10 cashier and the Lesson 12 clerk do: their name is the role label the dialog shows (Lesson 15's talk hook: convo.known). Margaret and Biscuit (Lessons 13–14) follow the player: the lesson's
   sceneOf / follower hooks. */
{
  const v = o => Object.assign({ lesson:15, formal:true, baseFace:{ x:0, y:1 }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    greet:{ it:'Buongiorno', en:'Good morning' }, opening:{ it:'Buongiorno!', en:'Good morning!' }, revisitOpening:{ it:'Buongiorno!', en:'Good morning!' }, agenda:[], revisitAgenda:[] }, o);
  const crowd = o => v({ crowd:true, scene:'ferrovia', pron:['They', 'their'], name:'Viaggiatore', pitch:1, ...o });
  NPCS.push(
    v({ id:'infopoint', name:'Informazioni', scene:'santalucia', place:'Venezia Santa Lucia', where:'the man at the information desk', pron:['He', 'his'],
      x:144, y:298, approach:{ x:144, y:350 }, talkZone:{ x:52, y:334, w:184, h:36 }, body:'#1f3f7a', hair:'#3a2a1a', skin:'#e2b48e', cap:'#1f3f7a', pitch:0.86 }),
    v({ id:'baristaSL', name:'La barista', scene:'santalucia', place:'Bar della stazione', where:'the barista at the station bar', pron:['She', 'her'],
      x:800, y:256, approach:{ x:800, y:308 }, talkZone:{ x:690, y:292, w:226, h:36 }, body:'#2b2b30', hair:'#6b3a1f', skin:'#e9c09c', longHair:true, apron:'#fffdf8', pitch:1.14 }),
    v({ id:'slviaggiatore', name:'Viaggiatore', scene:'santalucia', ambient:true, where:'a traveller', pron:['He', 'his'], x:150, y:420, body:'#6b7a5a', hair:'#2a1a12', skin:'#d9a37e', suitcase:'#2e5a8a', pitch:0.9,
      stroll:{ path:[[120, 420, 1], [520, 520], [870, 560, 2]], speed:44, back:true }, says:{ it:'Scusi, ho fretta!', en:"Sorry, I'm in a hurry!" } }),
    v({ id:'slviaggiatrice', name:'Viaggiatrice', scene:'santalucia', ambient:true, where:'a traveller', pron:['She', 'her'], x:420, y:250, body:'#c46a8a', hair:'#c9a46a', skin:'#f0c9a8', longHair:true, suitcase:'#c23b2a', suitcaseSide:-1, pitch:1.2,
      stroll:{ path:[[420, 236, 2], [420, 380], [430, 470], [520, 540], [560, 560, 1]], speed:52, back:true }, says:{ it:'Che bella, Venezia!', en:'Venice, how lovely!' } }),
    v({ id:'actv', name:'Biglietteria ACTV', scene:'ferrovia', place:'Ferrovia, sul Canal Grande', where:'the ticket seller in the ACTV booth', pron:['He', 'his'],
      x:870, y:288, approach:{ x:870, y:318 }, talkZone:{ x:812, y:300, w:136, h:34 }, body:'#1f4e8a', hair:'#4a3a2a', skin:'#c98d62', pitch:0.8 }),
    v({ id:'bepi', ...CAST.bepi, scene:'ferrovia', place:'La fondamenta, Ferrovia', where:'il signor Bepi, an old Venetian gentleman',
      x:548, y:330, baseFace:{ x:-0.6, y:0.8 }, shopping:'#e8e2d4' }),
    v({ id:'marinaio', name:'Marinaio', scene:'ferrovia', ambient:true, place:'Il pontile, Ferrovia B', where:'the deckhand of the vaporetto', pron:['He', 'his'],
      x:780, y:436, baseFace:{ x:0, y:-1 }, yieldDoor:true, body:'#20304a', hair:'#3a2a1a', skin:'#d9a37e', cap:'#20304a', pitch:0.85, says:{ it:'Convalidi il biglietto, prego!', en:'Validate your ticket, please!' } }),
    /* the travellers with their suitcases, across the fondamenta (one group) */
    crowd({ id:'valigia1', x:700, y:250, group:'valigie', aside:[[716, 246]], asideFace:{ x:-1, y:0 }, body:'#c9b48a', hair:'#c9a46a', skin:'#f0c9a8', suitcase:'#c23b2a', backpack:'#2e5a8a', pitch:0.9 }),
    crowd({ id:'valigia2', x:708, y:288, group:'valigie', aside:[[740, 270], [750, 248]], asideFace:{ x:-1, y:0.3 }, name:'Viaggiatrice', body:'#2e6a8e', hair:'#2a1a12', skin:'#d9a37e', longHair:true, suitcase:'#2b2b2b', pitch:1.15 }),
    crowd({ id:'valigia3', x:700, y:326, group:'valigie', aside:[[740, 300], [786, 250]], asideFace:{ x:-1, y:0.3 }, body:'#8a4f2c', hair:'#1e1a17', skin:'#c98d62', suitcase:'#f4b928', camera:'#2b2b2b', pitch:0.85 }),
    crowd({ id:'valigia4', x:708, y:364, group:'valigie', aside:[[690, 330], [672, 246]], asideFace:{ x:0, y:1 }, name:'Viaggiatrice', body:'#e58fa0', hair:'#3a2318', skin:'#efc6a4', longHair:true, hat:true, suitcase:'#5a8a3a', pitch:1.2 }),
    /* the tour group at the gate, waiting for the boat (from the breakfast on: the lesson's sceneOf) */
    crowd({ id:'guidaven', x:770, y:368, group:'gita', aside:[[700, 352], [640, 330]], asideFace:{ x:1, y:0.2 }, name:'Guida', body:'#2e8b57', hair:'#6b3a1f', skin:'#e9c09c', longHair:true, flag:'#f4b928', pitch:1.15 }),
    crowd({ id:'gita1', x:800, y:360, group:'gita', aside:[[720, 330], [664, 312]], asideFace:{ x:1, y:0.3 }, name:'Turista', body:'#c9ccd2', hair:'#c9a46a', skin:'#f0c9a8', camera:'#2b2b2b', cap:'#f4b928', pitch:0.95 }),
    crowd({ id:'gita2', x:830, y:372, group:'gita', aside:[[760, 340], [620, 346]], asideFace:{ x:1, y:0 }, name:'Turista', body:'#7a5ad0', hair:'#3a2318', skin:'#e6b48f', longHair:true, cap:'#f4b928', pitch:1.25 }),
    crowd({ id:'gita3', x:742, y:356, group:'gita', aside:[[690, 304], [610, 300]], asideFace:{ x:1, y:0.4 }, name:'Turista', body:'#d38d2a', hair:'#1e1a17', skin:'#c98d62', cap:'#f4b928', suitcase:'#4a4a4a', pitch:0.9 }),
  );
  ['infopoint', 'baristaSL', 'slviaggiatore', 'slviaggiatrice', 'actv', 'bepi', 'marinaio', 'valigia1', 'valigia2', 'valigia3', 'valigia4', 'guidaven', 'gita1', 'gita2', 'gita3']
    .forEach(id => { const n = NPCS.find(x => x.id === id); NPC[id] = n; n.home = { x:n.x, y:n.y, face:{ ...n.baseFace } }; n.face = { ...n.baseFace }; });
}
