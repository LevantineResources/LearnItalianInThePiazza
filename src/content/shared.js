/* Shared content: set phrases (one-tile phrases used across lessons) and the NPC "huh?" replies. */

/* After Lesson 1, the everyday social words collapse into SET PHRASES: one tile each.
   The tile bank then shows only set phrases + the pack for the current situation. */
const SET_PHRASES = [
  { key:'ciao',            label:'Ciao',             words:'ciao',            en:'hi / bye' },
  { key:'buongiorno',      label:'Buongiorno',       words:'buongiorno',      en:'good morning (polite)' },
  { key:'come stai',       label:'Come stai?',       words:'come stai',       en:'how are you? (friend)' },
  { key:'come sta',        label:'Come sta?',        words:'come sta',        en:'how are you? (polite)', from:2 },
  { key:'sto bene grazie', label:'Sto bene, grazie', words:'sto bene grazie', en:"I'm fine, thanks" },
  { key:'e tu',            label:'E tu?',            words:'e tu',            en:'and you?' },
  { key:'mi chiamo',       label:'Mi chiamo {Me}',   words:'mi chiamo {Me}',  en:'my name is {Me}' },
  { key:'come ti chiami',  label:'Come ti chiami?',  words:'come ti chiami',  en:"what's your name?" },
  { key:'piacere',         label:'Piacere',          words:'piacere',         en:'nice to meet you' },
  { key:'grazie',          label:'Grazie',           words:'grazie',          en:'thank you' },
  /* the little words (Lesson 2, the handbook's "Little words"): from then on in every tile bank's Frasi fatte, whatever the
     lesson or quest (conversation/bank.js: a lesson's own tile with the same words wins, and the copy here is left out) */
  { key:'e lei',           label:'E Lei?',           words:'e Lei',           en:'and you? (polite)', from:2 },
  { key:'sì',              label:'Sì',               words:'sì',              en:'yes', from:2 },
  { key:'no',              label:'No',               words:'no',              en:'no', from:2 },
  { key:'e',               label:'e',                words:'e',               en:'and', from:2 },
  { key:'poi',             label:'poi',              words:'poi',             en:'then', from:2 },
  { key:'ma',              label:'ma',               words:'ma',              en:'but', from:2 },
  { key:'quindi',          label:'quindi',           words:'quindi',          en:'so', from:2 },
  { key:'ancora una volta', label:'Ancora una volta, per favore', words:'ancora una volta per favore', en:'again, please (say it again)', from:2 },
];
/* the little words' set phrases (the keys above with from:2): tests and Studio */
const LITTLE_WORDS = ['e lei', 'sì', 'no', 'e', 'poi', 'ma', 'quindi', 'ancora una volta'];


const FAILS = [
  { it:'Eh? Non capisco.', en:"Huh? I don't understand." },
  { it:'Come?', en:'Pardon?' },
  { it:'Scusi?', en:'Sorry?' },
];
