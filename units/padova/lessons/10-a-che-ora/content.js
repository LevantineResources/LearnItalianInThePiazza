/* Lesson 10 · A che ora? Lesson data: the museum as a place, Paolo's directions and route, the ticket booth's tiles,
   the handbook chapter (its Vocabolario is completed in flow.js with Vedo, vedo's words, ISPY_VOCAB, which is defined
   later in the build, in ui/ispy.js). Design: docs/lessons/10-a-che-ora.md. Data only (runs before the engine). */

/* the museum is a place the parser knows: "dov'è il museo?" → where:museo */
PLACES.museo = ['il museo', 'The museum'];
const L10_PLACE_TILE = { key:'il museo', label:'il museo', words:'il museo', en:'the museum', place:'museo' };

/* Paolo → the museum (tu imperatives). On the city map: north to the bank, left, then left again at the first street:
   [2,4] (the piazza) → [2,3] (the bank) → [1,3] → [1,4] (the Museo, between the park and the station). */
const L10_ROUTE = [[2, 4], [2, 3], [1, 3], [1, 4]];
const L10_PAOLO_DIR = {
  intro:{ it:"Il Museo d'Arte? È vicino alla stazione. Non è lontano!", en:"The Museo d'Arte? It's near the station. It's not far!" },
  lines:[
    { it:'Vai dritto fino alla banca.', en:'Go straight on as far as the bank.' },
    { it:'Alla banca gira a sinistra.', en:'At the bank, turn left.' },
    { it:'Poi alla prima strada gira ancora a sinistra.', en:'Then at the first street, turn left again.' },
    { it:'Il museo è lì, vicino alla stazione.', en:"The museum is there, near the station." },
  ],
  confirm:{
    left:{ it:'Sì, a sinistra alla banca. E poi ancora a sinistra.', en:'Yes, left at the bank. And then left again.' },
    right:{ it:'No, no: a sinistra! Due volte a sinistra.', en:'No, no: left! Left twice.' },
    straight:{ it:'Sì, dritto fino alla banca.', en:'Yes, straight on as far as the bank.' },
  },
  far:{ it:'No, no. Dieci minuti a piedi.', en:'No, no. Ten minutes on foot.' },
  route:true,
};

/* ---------- the ticket booth's tiles ---------- */
const l10Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
/* "L'ora": telling the time (the hours are in the Numeri group) */
const L10_TIME_TILES = [
  l10Tile('sono le', 'Sono le', "it's … o'clock (sono le tre)"),
  l10Tile("è l'una", "È l'una", "it's one o'clock"),
  l10Tile('alle', 'alle', 'at (a time): alle quattro'),
  l10Tile("all'una", "all'una", "at one o'clock"),
  l10Tile('per le', 'per le', 'for (a time): per le quattro'),
  l10Tile('e', 'e', 'and, past (the hour): e dieci'),
  l10Tile('meno', 'meno', 'to (the hour): meno dieci'),
  l10Tile('un quarto', 'un quarto', 'a quarter'),
  l10Tile('mezza', 'mezza', 'half (past)'),
  l10Tile('che ore sono', 'Che ore sono?', 'what time is it?'),
  l10Tile('a che ora', 'A che ora?', 'at what time?'),
];
/* "Al museo": buying the ticket */
const L10_BUY = [
  l10Tile('vorrei', 'Vorrei', "I'd like"),
  l10Tile('un biglietto', 'un biglietto', 'a ticket'),
  l10Tile('per favore', 'per favore', 'please'),
  l10Tile('ecco', 'Ecco', 'here is / here you are'),
  l10Tile('euro', 'euro', 'euro, euros (never changes)'),
];
/* the hours and the money: 1–24 (21–24 are new) */
const L10_NUM_NEW = [[21, 'ventuno'], [22, 'ventidue'], [23, 'ventitré'], [24, 'ventiquattro']].map(([n, w]) => ({ key:'n' + n, label:w, words:w, en:String(n) }));
const L10_POLITE = [
  l10Tile('scusi', 'Scusi', 'excuse me (polite)'),
  l10Tile('può ripetere', 'Può ripetere?', 'can you repeat? (polite)'),
  l10Tile('non ho capito', 'Non ho capito.', "I didn't understand."),
  l10Tile('sì', 'Sì', 'yes'),
  l10Tile('no', 'No', 'no'),
  l10Tile('grazie mille', 'Grazie mille', 'thanks a lot'),
  l10Tile('arrivederci', 'Arrivederci', 'goodbye (polite)'),
];

/* ---------- handbook pictures (HTML/SVG inside the chapter's How it works) ---------- */
/* a clock face: the minutes after the hour (e …) on the right, before the next hour (meno …) on the left */
const L10_CLOCK_SVG = (() => {
  const cx = 230, cy = 150, R = 92;
  const pt = (k, r) => [cx + Math.sin(k / 12 * 2 * Math.PI) * r, cy - Math.cos(k / 12 * 2 * Math.PI) * r].map(v => v.toFixed(1));
  const lab = { 0:'le tre', 1:'e cinque', 2:'e dieci', 3:'e un quarto', 4:'e venti', 6:'e mezza', 8:'meno venti', 9:'meno un quarto', 10:'meno dieci', 11:'meno cinque' };
  const ticks = Array.from({ length:12 }, (_, k) => { const [x1, y1] = pt(k, R - 4), [x2, y2] = pt(k, R - (k % 3 ? 11 : 16)); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2b2b2b" stroke-width="${k % 3 ? 2 : 3.5}" stroke-linecap="round"/>`; }).join('');
  const labels = Object.entries(lab).map(([k, t]) => {
    const [x, y] = pt(+k, R + 22), anchor = +k === 0 || +k === 6 ? 'middle' : +k < 6 ? 'start' : 'end';
    return `<text x="${x}" y="${(+y + 4).toFixed(1)}" text-anchor="${anchor}" font-family="Titillium Web, sans-serif" font-size="13" font-weight="700" fill="${+k === 0 ? '#0f2260' : +k < 6 || +k === 6 ? '#1c3d8f' : '#c23b2a'}">${t}</text>`;
  }).join('');
  return `<svg viewBox="0 0 460 300" width="460" style="max-width:100%;display:block;margin:8px auto" role="img" aria-label="A clock face: e cinque, e dieci, e un quarto, e venti, e mezza on the right; meno venti, meno un quarto, meno dieci, meno cinque on the left">
    <path d="M${cx} ${cy}L${cx} ${cy - R}A${R} ${R} 0 0 1 ${cx} ${cy + R}Z" fill="rgba(28,61,143,.08)"/>
    <path d="M${cx} ${cy}L${cx} ${cy + R}A${R} ${R} 0 0 1 ${cx} ${cy - R}Z" fill="rgba(194,59,42,.08)"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#1f3f7a" stroke-width="4"/>${ticks}
    <line x1="${cx}" y1="${cy}" x2="${cx + 46}" y2="${cy}" stroke="#1b1b1b" stroke-width="6" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - 72}" stroke="#1b1b1b" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="5" fill="#c9a03a"/>${labels}
    <text x="${cx + 40}" y="${cy + 40}" text-anchor="middle" font-family="Bodoni Moda, Georgia, serif" font-style="italic" font-size="15" fill="#1c3d8f">e …</text>
    <text x="${cx - 40}" y="${cy + 40}" text-anchor="middle" font-family="Bodoni Moda, Georgia, serif" font-style="italic" font-size="15" fill="#c23b2a">meno …</text>
  </svg>`;
})();
/* six little pictures: where is the ball? (a table and a red ball) */
const L10_PREP_PICS = (() => {
  const table = '<rect x="22" y="40" width="56" height="7" rx="2" fill="#8a5a34"/><rect x="27" y="47" width="5" height="30" fill="#6b4426"/><rect x="68" y="47" width="5" height="30" fill="#6b4426"/>';
  const ball = (x, y, r = 8, op = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#cf3b2c" opacity="${op}"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.28}" fill="#fff" opacity="${0.6 * op}"/>`;
  const P = [
    ['sotto', 'under', table + ball(50, 70)],
    ['sopra', 'on, on top of', table + ball(50, 31)],
    ['vicino a', 'near', table + ball(90, 70)],
    ['accanto a', 'next to', table + ball(84, 70, 8) + '<line x1="76" y1="78" x2="92" y2="78" stroke="#bbb" stroke-width="1"/>'],
    ['davanti a', 'in front of', table + ball(50, 78, 12)],
    ['dietro', 'behind', ball(50, 36, 7) + table],
  ];
  return `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:8px 0">${P.map(([it, en, g]) =>
    `<figure style="margin:0;width:104px;text-align:center"><svg viewBox="0 0 100 90" width="100" height="90" role="img" aria-label="${it}: ${en}" style="background:#fffdf8;border:1.5px solid rgba(28,61,143,.2);border-radius:10px"><line x1="6" y1="78" x2="94" y2="78" stroke="#d9cdb4" stroke-width="2"/>${g}</svg>
      <figcaption style="font-size:13px;line-height:1.2"><b>${it}</b><br><span style="color:var(--muted)">${en}</span></figcaption></figure>`).join('')}</div>`;
})();

/* The handbook chapter */
LESSONS.push({
  n:10, title:'A che ora?', sub:'Telling the time',
  dlgNote:'At a museum ticket desk.',
  dialogue:[
    ['Tu', 'Buongiorno! Un biglietto, per favore.', 'Good afternoon! A ticket, please.'],
    ['Cassiera', 'A che ora?', 'At what time?'],
    ['Tu', 'Che ore sono adesso?', 'What time is it now?'],
    ['Cassiera', 'Sono le tre e dieci.', "It's ten past three."],
    ['Tu', 'Alle tre e mezza, per favore.', 'At half past three, please.'],
    ['Cassiera', 'Mi dispiace, è pieno. Alle quattro?', "I'm sorry, it's full. At four?"],
    ['Tu', 'Va bene, alle quattro.', 'All right, at four.'],
    ['Cassiera', "Sono quattordici euro. Ingresso tra un'ora.", "That's fourteen euros. Entry in an hour."],
  ],
  pitches:{ Tu:1.1, Cassiera:1.05 },
  phrasesTitle:'What you say',
  phrases:[
    ['Che ore sono?', 'What time is it?', 'Literally “what hours are they?”: plural, like the answer.'],
    ["Sono le tre. / È l'una.", "It's three o'clock. / It's one o'clock.", "Sono le + the hour. One o'clock is singular: è l'una."],
    ['Sono le tre e un quarto. / Sono le tre e mezza.', "It's a quarter past three. / It's half past three.", 'After the hour: e + the minutes.'],
    ['Sono le quattro meno un quarto.', "It's a quarter to four.", 'Before the hour: the next hour, meno + the minutes.'],
    ['A che ora …? Alle quattro.', 'At what time …? At four.', "At a time: alle (all'una for one o'clock)."],
    ['Un biglietto per le quattro, per favore.', 'A ticket for four o’clock, please.', 'For a time: per le quattro.'],
    ["tra un'ora", 'in an hour', "Ingresso tra un'ora: entry in an hour."],
    ['Permesso!', 'Excuse me, may I get past?', 'To get through a crowd. Scusi only gets someone’s attention.'],
  ],
  phrases2Title:"What you'll hear",
  phrases2:[
    ['È pieno.', "It's full.", 'No more tickets for that time.'],
    ['Il prossimo ingresso è alle …', 'The next entry is at …', 'Listen for the hour.'],
    ['Vedo, vedo…', 'I spy… (I see, I see…)', 'The game: Bruno says what he sees, you find it.'],
    ['Giusto! / Sbagliato! / Ritenta!', 'Right! / Wrong! / Try again!', 'What Bruno says when you click.'],
  ],
  extraTitle:'Numbers 21–24, and the minutes',
  extraNote:'For the 24-hour clock: venti + the number. Ventuno drops the i of venti. The minutes come after e (past) or meno (to).',
  extra:[['ventuno', '21'], ['ventidue', '22'], ['ventitré', '23'], ['ventiquattro', '24'],
    ['e cinque', 'five past'], ['e dieci', 'ten past'], ['e un quarto', 'a quarter past'], ['e venti', 'twenty past'], ['e mezza', 'half past'],
    ['meno venti', 'twenty to'], ['meno un quarto', 'a quarter to'], ['meno dieci', 'ten to'], ['meno cinque', 'five to']],
  how:`<p>Hours are feminine plural, like <i>le ore</i>: <b>sono le tre</b>. One o’clock, midday and midnight are singular:
      <b>è l'una</b>, <b>è mezzogiorno</b>, <b>è mezzanotte</b>.</p>
    ${L10_CLOCK_SVG}
    <p>Minutes after the hour: <b>e</b> (<i>sono le tre <b>e</b> dieci</i>). Before the next hour: <b>meno</b>, “minus” (<i>sono le quattro <b>meno</b> dieci</i> = 3:50).
      A quarter: <b>un quarto</b>. Half past: <b>mezza</b>.</p>
    <p><b>At</b> a time: <b>alle</b> (a + le): <i>alle quattro</i>, and <b>all'una</b> for one o’clock. <i>Per le quattro</i> = for four o’clock.</p>
    <p>Timetables and tickets use the <b>24-hour clock</b>: <i>16:00</i> is read <b>le sedici</b>. 21–24 are <i>venti</i> + the number:
      <i>ventuno, ventidue, ventitré, ventiquattro</i> (ventuno and ventotto drop the i).</p>
    <p><b>Vedo</b> = I see, <b>vedi</b> = you see (to a friend), <b>vede</b> = he / she sees, you see (polite).
      One irregular plural: <i>l'uomo → gli uomini</i>.</p>
    <p>Where is it? Six little words:</p>
    ${L10_PREP_PICS}
    <p class="note">With <i>a</i>, the article joins on: <i>vicino a + la fontana = vicino <b>alla</b> fontana</i>, <i>a + il = al</i>. Bruno may also say <i>sul tavolo</i> (<i>su + il</i>): that comes later.</p>`,
  culture:`<p>Big exhibitions and famous works in Italy are often seen with a <b>timed ticket</b> (<i>biglietto a orario</i>): to see
      Leonardo's <i>Last Supper</i> in Milan you book a 15-minute slot weeks ahead. Booking a time is normal.</p>
    <p><b>Permesso?</b> is also what you say when you step into someone's home: “may I come in?”</p>`,
  exercises:[
    { type:'mc', q:'🕞 The clock says 3:30. Che ore sono?', opts:['Sono le tre e un quarto.', 'Sono le tre e mezza.', 'Sono le mezza e tre.'], a:1, why:'Half past three: sono le tre e mezza.', nudge:'Half past is mezza; the hour comes first.' },
    { type:'order', q:'Che ore sono? (4:45)', tiles:['meno', 'cinque', 'un quarto', 'sono le'], answer:'sono le cinque meno un quarto', why:'4:45 is a quarter to five: sono le cinque meno un quarto.', nudge:'A quarter to: the next hour, then meno un quarto.' },
    { type:'mc', q:'A ticket for four o’clock, please: “Un biglietto ___ quattro, per favore.”', opts:['sono le', 'per le', 'è l’'], a:1, why:'For a time: per le quattro. (Sono le quattro says what time it is now.)', nudge:'You are not saying what time it is now.' },
    { type:'mc', q:'“At what time?” “___ quattro.”', opts:['Le', 'Sono le', 'Alle'], a:2, why:'At a time: alle (a + le). Alle quattro.', nudge:'At a time: a + le.' },
    { type:'mc', q:'A crowd is in your way. To get past, you say…', opts:['Scusi!', 'Permesso!', 'Prego!'], a:1, why:'Permesso: may I get past? Scusi gets someone’s attention; prego is what they say back.', nudge:'Scusi only makes them turn round.' },
    { type:'mc', q:'The ball is on the floor, under the table: la palla è ___ il tavolo.', opts:['sopra', 'dietro', 'sotto'], a:2, why:'Under: sotto. (Sopra = on top of, dietro = behind.)', nudge:'Look at the six pictures in How it works.', noSpeak:true },
    { type:'mc', q:'Bruno: “Vedo, vedo… un gatto! E tu, ___ il gatto?”', opts:['vedo', 'vedi', 'vede'], a:1, why:'Tu: vedi. (Io vedo, Lei vede.)', nudge:'He is asking you, a friend: tu.' },
  ],
  /* Vocabolario: the time words of the booth, the museum, Paolo's new word. Vedo, vedo's words (ISPY_VOCAB: the game,
     people, animals, things, prepositions and the time tiles) are added in flow.js. */
  vocab:[
    { group:'Telling the time', note:'Hours are feminine plural: sono le tre (le ore). One o’clock, midday and midnight are singular.', words:[
      { it:'È mezzogiorno.', en:"It's midday." },
      { it:'È mezzanotte.', en:"It's midnight." },
      { it:'A che ora?', en:'At what time?' },
      { it:'alle …', say:'alle quattro', en:'at (a time)', also:["all'una"], note:"Alle quattro; one o'clock: all'una." },
      { it:'per le …', say:'per le quattro', en:'for (a time)', note:'Un biglietto per le quattro.' },
      { it:"tra un'ora", en:'in an hour' },
      { it:'adesso', en:'now', note:'Che ore sono adesso?' },
    ] },
    { group:'At the museum', words:[
      { it:'il biglietto', g:'m', en:'the ticket', note:'Un biglietto, per favore.' },
      { it:"l'ingresso", g:'m', en:'the entry, the entrance', also:['ingresso'] },
      { it:'il prossimo ingresso', g:'m', en:'the next entry', also:['prossimo'] },
      { it:'È pieno.', en:"It's full.", also:['pieno'] },
      { it:'Permesso!', en:'Excuse me, may I get past?', note:'Scusi gets attention; permesso gets you through.' },
    ] },
    { group:'Paolo’s directions', words:[
      { it:'ancora', en:'again', note:'Gira ancora a sinistra: turn left again.' },
    ] },
    { group:'Seeing', words:[
      { it:'vede', en:'he / she sees, you (polite) see', note:'Bruno vede un gatto. Lei vede il museo?' },
    ] },
  ],
  verbs:[
    { inf:'vedere', en:'to see', forms:[
      { p:'io', it:'vedo', en:'I see', ex:'Vedo, vedo… un gatto!' },
      { p:'tu', it:'vedi', en:'you (friend) see', ex:'Vedi il cane?' },
      { p:'Lei', it:'vede', en:'you (polite) see', ex:'Lei vede la fontana?' },
      { p:'lui', it:'vede', en:'he / she sees', ex:'Bruno vede un piccione.' },
    ] },
    { inf:'essere', en:'to be', irr:true, forms:[
      { p:'loro', it:'sono', en:'they are (the hours: sono le tre)', ex:'Sono le tre.' },
    ] },
  ],
  doneTitle:'Ready for the ticket booth.', doneGo:'Back to the museum',
});
