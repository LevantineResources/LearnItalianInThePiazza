/* formatSentence (engine/parser.js): how a chain of tiles or typed words is shown in the transcript.
   Runs token sequences through __debug.fmt (a capitalised word is a name, as in typed sentences) and checks
   the punctuation, including the CLAUSE/QWORDS/JOIN words Lessons 7 and 8 add. */
const { play } = require('./lib/harness');

const CASES = [
  /* an excuse word after a complete clause starts a new sentence */
  ['sto bene grazie scusi', 'Sto bene, grazie. Scusi.'],
  ['sto bene grazie scusi il resto non è giusto mancano due euro', 'Sto bene, grazie. Scusi, il resto non è giusto. Mancano due euro.'],
  ["sto bene grazie scusi dov'è il mercato", "Sto bene, grazie. Scusi, dov'è il mercato?"],
  ['grazie scusi', 'Grazie! Scusi.'],
  /* goodbyes */
  ['grazie arrivederci', 'Grazie, arrivederci!'],
  ['grazie mille arrivederci', 'Grazie mille, arrivederci!'],
  ['grazie mille Bruno arrivederci', 'Grazie mille, Bruno! Arrivederci!'],
  ['sto bene grazie arrivederci', 'Sto bene, grazie. Arrivederci!'],
  ['arrivederci', 'Arrivederci!'],
  /* greetings and how-are-you */
  ['buongiorno come sta', 'Buongiorno! Come sta?'],
  ['buongiorno come sta sto bene grazie', 'Buongiorno! Come sta? Sto bene, grazie.'],
  ['buongiorno signore come sta', 'Buongiorno, signore! Come sta?'],
  ['buongiorno Lucia come sta', 'Buongiorno, Lucia! Come sta?'],
  ['ciao come stai', 'Ciao! Come stai?'],
  ['sto bene grazie e tu', 'Sto bene, grazie. E tu?'],
  ['grande per favore', 'Grande, per favore.'],
  ['per lui un cappuccino e un cornetto per favore', 'Per lui, un cappuccino e un cornetto, per favore.'],
  /* Lessons 3–6 */
  ["sai dov'è", "Sai dov'è?"],
  ["scusi dov'è la farmacia", "Scusi, dov'è la farmacia?"],
  ['scusi può ripetere', 'Scusi, può ripetere?'],
  ['buongiorno Lucia ha il mio libro', 'Buongiorno, Lucia! Ha il mio libro?'],
  ['mi chiamo Sam', 'Mi chiamo Sam.'],
  /* Lesson 7 */
  ['sto bene grazie quanto costa', 'Sto bene, grazie. Quanto costa?'],
  ['sto bene grazie quanto costa questa', 'Sto bene, grazie. Quanto costa questa?'],
  ['quanto costa il mazzo', 'Quanto costa il mazzo?'],
  /* Lesson 8 */
  ['le piace questa maglietta', 'Le piace questa maglietta?'],
  ['le piace davvero', 'Le piace davvero?'],
  ['è per Emma a Emma piace il rosso', 'È per Emma. A Emma piace il rosso.'],
  ['è troppo piccola ha una taglia più grande', 'È troppo piccola. Ha una taglia più grande?'],
  ['sto bene grazie ha una maglietta rossa', 'Sto bene, grazie. Ha una maglietta rossa?'],
  ['lo prendo ecco venti euro', 'Lo prendo. Ecco venti euro.'],
  ['scusi il resto non è giusto mancano due euro', 'Scusi, il resto non è giusto. Mancano due euro.'],
  /* Lesson 9: directions are statements (NOTQ), No, scusi */
  ['no scusi', 'No, scusi.'],
  ['no scusi due cravatte', 'No, scusi, due cravatte.'],
  ['vada sempre dritto', 'Vada sempre dritto.'],
  ['giri a sinistra poi vada sempre dritto', 'Giri a sinistra. Poi vada sempre dritto.'],
  ['non è lontano', 'Non è lontano.'],
];

play(async t => {
  const got = await t.page.evaluate(cs => cs.map(([w]) => __debug.fmt(w)), CASES);
  CASES.forEach(([w, want], i) => {
    const ok = got[i] === want;
    console.log(`   ${ok ? 'ok ' : 'XX '} ${w}  →  ${got[i]}${ok ? '' : `   (want: ${want})`}`);
    t.check(`format "${want}"`, ok);
  });
});
