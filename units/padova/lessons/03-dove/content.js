/* Lesson 3. Lesson data: vocabulary, tiles, routes, and the handbook chapter (LESSONS.push). */

/* Lesson 3 pack: phrase tiles for asking the way. place:true tiles are destinations. */
const DIR_TILES = [
  { key:'scusa',           label:'Scusa',            words:'scusa',            en:'excuse me (to a friend)' },
  { key:'scusi',           label:'Scusi',            words:'scusi',            en:'excuse me (polite)' },
  { key:"dov'è",           label:"Dov'è",            words:"dov'è",            en:'where is' },
  { key:'via dei mille',   label:'via dei Mille',    words:'via dei Mille',    en:'Via dei Mille (the street)', place:true },
  { key:'il caffè aurora', label:'il Caffè Aurora',  words:'il Caffè Aurora',  en:'Caffè Aurora (the café)', place:true },
  { key:'la banca',        label:'la banca',         words:'la banca',         en:'the bank', place:true },
  { key:'la farmacia',     label:'la farmacia',      words:'la farmacia',      en:'the pharmacy', place:true },
  { key:'la chiesa',       label:'la chiesa',        words:'la chiesa',        en:'the church', place:true },
  { key:'è lontano',       label:'È lontano?',       words:'è lontano',        en:'is it far?' },
  { key:'puoi ripetere',   label:'Puoi ripetere?',   words:'puoi ripetere',    en:'can you repeat? (friend)' },
  { key:'può ripetere',    label:'Può ripetere?',    words:'può ripetere',     en:'can you repeat? (polite)' },
  { key:'per favore',      label:'per favore',       words:'per favore',       en:'please' },
  { key:'a destra',        label:'a destra?',        words:'a destra',         en:'(to the) right?' },
  { key:'a sinistra',      label:'a sinistra?',      words:'a sinistra',       en:'(to the) left?' },
  { key:'dritto',          label:'dritto?',          words:'dritto',           en:'straight on?' },
  { key:'grazie mille',    label:'Grazie mille',     words:'grazie mille',     en:'thanks a lot' },
];

/* Directions each NPC knows. lines are said one bubble at a time. */
const CHIARA_ROUTE = [
  { it:'Vai sempre dritto.', en:'Keep going straight.' },
  { it:'Alla seconda strada, gira a destra.', en:'At the second street, turn right.' },
  { it:'Poi, alla farmacia, gira a sinistra.', en:'Then, at the pharmacy, turn left.' },
  { it:'San Lorenzo è lì, vicino alla chiesa.', en:"San Lorenzo is there, near the church." },
];
const CHIARA_CONFIRM = {
  right:{ it:'Sì, a destra alla seconda strada. Poi a sinistra alla farmacia.', en:'Yes, right at the second street. Then left at the pharmacy.' },
  left:{ it:'A sinistra alla farmacia, sì. Ma prima a destra, alla seconda strada!', en:'Left at the pharmacy, yes. But first right, at the second street!' },
  straight:{ it:'Sì, sempre dritto. Poi a destra alla seconda strada.', en:'Yes, straight on. Then right at the second street.' },
};
const CHIARA_FAR = { it:'No, non è lontano. Dieci minuti a piedi.', en:"No, it's not far. Ten minutes on foot." };
const ROSA_ROUTE = [
  { it:'Vada dritto in via Garibaldi.', en:'Go straight along Via Garibaldi.' },
  { it:'Dopo la banca, giri a sinistra: è via dei Mille.', en:"After the bank, turn left: that's Via dei Mille." },
  { it:'Il numero 12 è lì, a destra. È il Caffè Aurora!', en:"Number 12 is there, on the right. It's Caffè Aurora!" },
];
const ROSA_CONFIRM = {
  right:{ it:'Sì, il numero 12 è a destra.', en:'Yes, number 12 is on the right.' },
  left:{ it:'Sì, a sinistra dopo la banca.', en:'Yes, left after the bank.' },
  straight:{ it:'Sì, sempre dritto in via Garibaldi.', en:'Yes, straight along Via Garibaldi.' },
};
const ROSA_FAR = { it:'No, no! Due minuti a piedi.', en:'No, no! Two minutes on foot.' };


/* The handbook chapter: dialogue, phrases, explanations, culture note, exercises. */
LESSONS.push({
    n:3, title:"Dov'è?", sub:'Asking the way',
    dlgNote:'A tourist stops an older lady in the street. She uses the polite form, so her verbs end differently from Chiara\'s.',
    dialogue:[
      ['Tu',"Scusi, dov'è la stazione?",'Excuse me, where is the station?'],
      ['Signora','La stazione? Non è lontano.',"The station? It's not far."],
      ['Signora','Vada sempre dritto. Alla prima strada, giri a destra.','Keep going straight. At the first street, turn right.'],
      ['Tu','Può ripetere, per favore?','Can you repeat that, please?'],
      ['Signora','Sempre dritto, poi la prima a destra. La stazione è lì, vicino alla banca.','Straight on, then the first on the right. The station is there, near the bank.'],
      ['Tu','A destra?','To the right?'],
      ['Signora','Sì, a destra.','Yes, to the right.'],
      ['Tu','Grazie mille!','Thanks a lot!'],
      ['Signora','Prego!',"You're welcome!"],
    ],
    pitches:{ Tu:1.1, Signora:1.0 },
    directionsTable:true,
    phrasesTitle:'What you say',
    phrases:[
      ['Scusa! / Scusi!','Excuse me!','Scusa to a friend, Scusi to a stranger.'],
      ["Dov'è …?",'Where is …?','Dove + è, joined with an apostrophe.'],
      ['È lontano?','Is it far?','Listen for “non è lontano”: it\'s not far.'],
      ['Puoi ripetere?','Can you repeat?','To a friend.'],
      ['Può ripetere?','Can you repeat?','Polite. Add “per favore”.'],
      ['A destra? A sinistra?','Right? Left?','Repeat a direction back to check it.'],
      ['Grazie mille!','Thanks a lot!','Literally: a thousand thanks.'],
    ],
    how:`<p>Directions are commands. Friends get <b>vai</b> and <b>gira</b>. Strangers get the polite <b>vada</b> and <b>giri</b>. You only need to <i>understand</i> both for now.</p>
      <p><b>A destra</b> is right, <b>a sinistra</b> is left, <b>dritto</b> is straight on. <b>Sempre dritto</b> means keep going straight.</p>
      <p>Count the streets: <b>la prima</b> (first), <b>la seconda</b> (second), <b>la terza</b> (third). <b>Alla seconda strada</b> = at the second street.</p>
      <p><b>Alla</b> is <i>a + la</i>: <b>alla farmacia</b> (at the pharmacy), <b>vicino alla chiesa</b> (near the church).</p>
      <p>Ask about any place by joining <b>Dov'è</b> with it: <b>Scusi, dov'è la farmacia?</b></p>`,
    culture:`<p>Italians often give directions by landmarks: the church, the bank, the pharmacy (look for the <b>green cross</b>), rather than street names.</p>
      <p>Addresses put the street first and the number after: <b>Via dei Mille 12</b>. Odd numbers are usually on one side of the street and even numbers on the other.</p>
      <p>Many streets are named after the Risorgimento: <i>Via Garibaldi</i>, and <i>Via dei Mille</i> after Garibaldi's “Thousand” volunteers of 1860. You'll find them in almost every town.</p>
      <p>Don't be shy about asking. People are usually glad to help, and some will walk you halfway there.</p>`,
    exercises:[
      { type:'mc', q:'Chiara says “Gira a sinistra.” What do you do?', opts:['← Turn left','→ Turn right','↑ Go straight'], a:0,
        why:'Sinistra is left. Gira a sinistra = turn left.', nudge:'Destra is right, sinistra is left.' },
      { type:'mc', q:'“Alla seconda strada, gira a destra.” Where do you turn?', opts:['At the first street, right','At the second street, right','At the second street, left'], a:1,
        why:'Seconda = second, destra = right.', nudge:'Prima = first, seconda = second.' },
      { type:'order', q:'Ask your friend Chiara where Via dei Mille is.', en:'Excuse me, where is Via dei Mille?', tiles:['via dei Mille',"dov'è",'scusa'], answer:"scusa dov'è via dei mille",
        why:"Scusa, dov'è via dei Mille?", nudge:"Get her attention first, then “dov'è”, then the place." },
      { type:'mc', q:'You need to stop an older stranger in the street. Which word gets her attention politely?', opts:['Scusa','Scusi','Ciao'], a:1,
        why:'Scusi is the polite form, for strangers and older people. Scusa is for friends.', nudge:'Think of Come sta? versus Come stai?.' },
      { type:'mc', q:'A stranger says “Vada sempre dritto.” Why “vada” and not “vai”?', opts:['She is being polite to a stranger','It means “turn”','It is the past tense'], a:0,
        why:'Vada is the polite (Lei) form of vai. Same meaning: go.', nudge:'Chiara is a friend and says “vai”. Who uses the other form?' },
      { type:'order', q:"You didn't catch that. Ask her to repeat, politely.", en:'Can you repeat, please?', tiles:['per favore','ripetere','può'], answer:'può ripetere per favore',
        why:'Può ripetere, per favore?', nudge:'Start with “può” (can you, polite).' },
    ],
    doneTitle:'Pronto! Ready to ask the way.', doneGo:'Go find Chiara',
  });


/* Chiara's route on the city map (grid nodes). */
const ROUTE = [[2,4],[2,3],[2,2],[3,2],[3,1]];      // Chiara's directions; [3,0] is also accepted as the end
