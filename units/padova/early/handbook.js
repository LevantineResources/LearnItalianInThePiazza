/* Padova's Lessons 1–6 in the handbook, Studio and the grammar drill (engine/ui/handbook.js, study.js, grammar.js ask):
   the chapters' own sections (the bar's price list, Lesson 3's directions table, Lesson 4's menu and verb table), finishing
   their practice (they have no hooks), Lesson 6's lost handbook (a loose page), their Studio word lists, the done states. */

Object.assign(DONE_TUTS, { 1:'done', 2:'l2-done', 3:'l3-done', 4:'l4-done', 5:'l5-done', 6:'l6-done' });
Object.assign(UNIT, {
  practiceSlots:[1, 2, 3, 4, 5, 6],
  practiceDone:n => ({ 1:S.practiceDone, 2:S.practiceDone2, 3:S.practiceDone3, 4:S.practiceDone4, 5:S.practiceDone5, 6:S.practiceDone6 })[n],
  loosePage:() => S.handbookLost ? 6 : null,               // Lesson 6: the handbook is gone, its loose page is left
  handbookOpened(){
    if (S.tut === 'walk' || S.tut === 'handbook') setTut('practice');
    if (S.tut === 'l2-handbook') setTut('l2-practice');
    if (S.tut === 'l3-handbook') setTut('l3-practice');
    if (S.tut === 'l4-handbook') setTut('l4-practice');
    if (S.tut === 'l5-handbook') setTut('l5-practice');
  },
  chapterSections:L => `${L.menu ? '<h3>The price list</h3><p class="note">Learn each word with its article. Tap a speaker to hear it.</p>' + renderMenu() : ''}
    ${L.menu4 ? '<h3>Il menù</h3><p class="note">Today\'s menu at Caffè Aurora. V = vegetarian.</p>' + renderMenu4() : ''}
    ${L.conj ? '<h3>Verbs: who is doing it?</h3><p class="note">Each verb changes its ending for each person.</p>' + renderConj()
      + (grammarUnlocked() ? '<div class="callout conj-drill"><p><b>Drill them.</b> Studio\'s <i>Verbi</i> tab: type the right form of every verb you have learned.</p><button class="btn primary" data-gr-open>Drill the verbs</button></div>' : '') : ''}
    ${L.directionsTable ? '<h3>Understanding directions</h3><p class="note">You will mostly <i>hear</i> these. Learn to recognise both columns.</p>' + renderDirTable() : ''}`,
  practiceFinished(n){
    if (![1, 2, 3, 4, 5, 6].includes(n)) return false;
    if (n === 1){
      const first = !S.practiceDone;
      S.practiceDone = true; S.vocab = true;
      if (first){ setTut('meet'); toast(`<b>${VOCAB1.length} words</b> added to your dictionary`); }
    } else if (n === 2){
      const first = !S.practiceDone2;
      S.practiceDone2 = true; S.vocab2 = true;
      if (first){ if (['l2-bar','l2-handbook','l2-practice'].includes(S.tut)) setTut('l2-order'); toast(`<b>${VOCAB2.length} bar words</b> added to your dictionary`); }
    } else if (n === 6){
      const first = !S.practiceDone6;
      S.practiceDone6 = true; S.vocab6 = true;
      if (first){ if (S.tut === 'l6-page') setTut('l6-chiara'); toast('The page\'s words are in your <b>dictionary</b>. Use its search box while you type.'); }
    } else if (n === 5){
      const first = !S.practiceDone5;
      S.practiceDone5 = true; S.vocab5 = true;
      if (first){ if (['l5-meet','l5-handbook','l5-practice'].includes(S.tut)) setTut('l5-introduce'); toast('New tiles: <b>introducing people</b>, plus a <b>Mark</b> name tile.'); }
    } else if (n === 4){
      const first = !S.practiceDone4;
      S.practiceDone4 = true; S.vocab4 = true;
      if (first){ if (['l4-start','l4-handbook','l4-practice'].includes(S.tut)) setTut('l4-order'); toast('New tiles for ordering for two: <b>who</b>, <b>verbs</b>, the <b>menu</b>. Your direction phrases are put away for now.'); }
    } else {
      const first = !S.practiceDone3;
      S.practiceDone3 = true; S.vocab3 = true;
      if (first){ if (['l3-ask','l3-handbook','l3-practice'].includes(S.tut)) setTut('l3-directions'); toast('New tiles: <b>phrases for asking the way</b>. Your bar words are put away until you are back at the counter.'); }
    }
    return true;
  },
  grammarFrom:4,
  grammarLockedNote:() => { const L = LESSONS[3]; return `<p>In <b>Lezione 4 · ${esc(L.title)}</b> you order for Mark, and the verbs start to change for who is doing it:
            <i>vorrei</i> → <i>vorrebbe</i>, <i>posso</i> → <i>può</i>. Finish it, and every verb you have learned is here to drill.</p>`; },
});

/* ---------- the dictionary (engine/ui/handbook.js dictSections) ----------
   Lesson 1 alone until it is done (or "empty" before its practice); then the set phrases, the numbers, Lessons 7+ (newest
   first), the quests' schede, then Lessons 6 … 1. */
UNIT.dictSections = P => {
  const ent = (w, en, key) => ({ w, en, key });
  const L1 = note => ({ title:'Lezione 1 · Primi incontri', blocks:[{ note, entries:VOCAB1.map(v => ent(v.w, v.en, v.w)) }] });
  const out = [];
  if (!S.vocab) out.push({ title:'Words', empty:'Your dictionary is empty. Words are added when you finish the practice in your handbook.' });
  else if (!L1done()) out.push(L1(null));
  else {
    out.push(P.setPhrases, P.nums, ...P.lessons, ...P.quests);
    if (S.vocab6) out.push({ title:'Lezione 6 · La pagina', blocks:[{ note:'The words from the loose page.', entries:L6_TILES.map(t => ent(t.label, t.en, t.key)) }] });
    if (S.vocab5) out.push({ title:'Lezione 5 · Ti presento…', blocks:[{ note:'In your tile bank whenever Mark is with you, and outside the bar and restaurant.', entries:L5_TILES.map(t => ent(t.label, t.en, t.key)) }] });
    if (S.vocab4) out.push({ title:'Lezione 4 · A pranzo', blocks:[{ note:'In your tile bank when you talk to a waiter.', entries:L4_ALL.map(t => ent(t.label, t.en, t.key)) }] });
    if (S.vocab3) out.push({ title:'Lezione 3 · Asking the way', blocks:[{ note:'In your tile bank when you talk to people outside the bar.', entries:DIR_TILES.map(t => ent(fill(t.label), t.en, t.key)) }] });
    if (S.vocab2) out.push({ title:'Lezione 2 · Al bar', blocks:[{ note:'In your tile bank when you talk to a barista.', entries:VOCAB2.map(v => ent(v.w, v.en, v.w)) }] });
    out.push(L1('These words now live inside your set phrases.'));
  }
  if (!L1done()) out.push(P.nums);
  return out.filter(Boolean);
};
UNIT.dictUsed = () => !!S.vocab;
/* the save at the end of Unit 1 (every lesson and quest done, their words checked): Venezia's build asks for the dictionary
   it shows (engine/ui/handbook.js __unitExport, scripts/unit1-words.js) */
UNIT.finishedState = () => {
  const N = LESSONS.length, o = { lesson:N, tut:(hookFor(N) || {}).doneTut || DONE_TUTS[N] || 'done', vocab:true, practiceDone:true,
    numbers:{ introDone:true, mastered:true, best:20 }, quests:{} };
  for (let n = 2; n <= N; n++){ o['vocab' + n] = true; o['practiceDone' + n] = true; o['vocabCheck' + n] = true; }
  QUESTS.forEach(q => { o.quests[q.id] = { started:true, done:true, words:true, practice:true }; });
  return o;
};
/* the vocab audit (engine/ui/vocab.js): what Lessons 1–6 teach without a Vocabolario */
UNIT.knownWords = () => [...[...VOCAB1, ...VOCAB2].map(v => v.w), ...[...DIR_TILES, ...L4_ALL, ...L5_TILES, ...L6_TILES].map(vcTileText)];                          // (the note about the green counters, once there are words)

function renderMenu(){
  const row = i => `<div class="li"><span class="nm">${esc(i.w)}</span><span class="art">${i.art}</span><span class="leader"></span><span class="price">${euroIt(i.price)}</span>
      <button class="play" data-say="${i.art} ${esc(i.w)}" aria-label="Play: ${i.art} ${esc(i.w)}">${SPK}</button><span class="desc">${esc(i.desc)}</span></div>`;
  return `<div class="listino"><p class="listino-title">Bar Centrale · <i>Listino prezzi</i></p>
    <p class="listino-sec">Da bere · to drink</p>${ITEMS.filter(i => i.kind === 'coffee' || i.kind === 'drink').map(row).join('')}
    <p class="listino-sec">Da mangiare · to eat</p>${ITEMS.filter(i => i.kind === 'pastry' || i.kind === 'food').map(row).join('')}</div>`;
}
/* Lesson 3's directions table (also a Studio word list, ui/study.js): [arrow, English, to a friend (tu), polite (Lei)],
   then the words around them [Italian, English] */
const DIR_TABLE = [
  ['↑', 'Go straight', 'Vai dritto', 'Vada dritto'],
  ['⇈', 'Keep going straight', 'Vai sempre dritto', 'Vada sempre dritto'],
  ['→', 'Turn right', 'Gira a destra', 'Giri a destra'],
  ['←', 'Turn left', 'Gira a sinistra', 'Giri a sinistra'],
];
const DIR_WORDS = [
  ['a destra','on / to the right'], ['a sinistra','on / to the left'], ['qui','here'], ['lì','there'],
  ['qui vicino','near here, around here'], ['vicino a …','near …'], ['dopo …','after …'], ['poi','then'],
  ['alla prima / seconda strada','at the first / second street'], ['non è lontano',"it's not far"],
  ['il quartiere','the neighbourhood'], ['non lo so',"I don't know"],
];
function renderDirTable(){
  const R = DIR_TABLE, P = DIR_WORDS;
  return `<table class="dirtable"><thead><tr><th></th><th></th><th>to a friend (tu)</th><th>polite (Lei)</th></tr></thead><tbody>
    ${R.map(r => `<tr><td class="arrow">${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b> <button class="play" data-say="${r[2]}" aria-label="Play ${r[2]}">${SPK}</button></td><td><b>${r[3]}</b> <button class="play" data-say="${r[3]}" aria-label="Play ${r[3]}">${SPK}</button></td></tr>`).join('')}
    </tbody></table>
    <div class="wordgrid">${P.map(p => `<div><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join('')}</div>`;
}
function renderMenu4(){
  const chip = t => t === 'veg' ? '<span class="art" style="background:#7fc89a">V</span>' : t === 'carne' ? '<span class="art" style="background:#f0a48f">carne</span>' : '<span class="art" style="background:#9cc3e6">pesce</span>';
  const row = d => `<div class="li"><span class="nm">${esc(d.label)}</span>${d.tags ? chip(d.tags[0]) : '<span></span>'}<span class="leader"></span><span class="price">${euroIt(d.price)}</span>
      <button class="play" data-say="${esc(d.label)}" aria-label="Play: ${esc(d.label)}">${SPK}</button><span class="desc">${esc(d.desc || d.en)}</span></div>`;
  const sec = c => `<p class="listino-sec">${c}</p>${DISHES.filter(d => d.course === c).map(row).join('')}`;
  return `<div class="listino"><p class="listino-title">Caffè Aurora · <i>Menù del giorno</i></p>
    ${['Primi','Secondi','Contorni','Dolci'].map(sec).join('')}
    <p class="listino-sec">Da bere</p>${DRINKS4.map(d => row({ ...d, desc:d.en })).join('')}
    <p class="listino-sec">Note</p>
    <div class="li"><span class="nm">Coperto</span><span></span><span class="leader"></span><span class="price">${euroIt(COPERTO)}</span><span></span><span class="desc">per person: bread and the table</span></div>
    <div class="li"><span class="nm">La pizza</span><span></span><span class="leader"></span><span class="price">solo la sera</span><span></span><span class="desc">evenings only, when the wood oven is lit</span></div></div>`;
}
function renderConj(){
  const P = ['io','tu','lui / lei / Lei','noi','voi','loro'];
  const V = [['mangiare','to eat',['mangio','mangi','mangia','mangiamo','mangiate','mangiano']],
             ['prendere','to have, take',['prendo','prendi','prende','prendiamo','prendete','prendono']],
             ['avere','to have',['ho','hai','ha','abbiamo','avete','hanno']],
             ['essere','to be',['sono','sei','è','siamo','siete','sono']],
             ['potere','can',['posso','puoi','può','possiamo','potete','possono']],
             ['volere','would like',['vorrei','vorresti','vorrebbe','vorremmo','vorreste','vorrebbero']]];
  return `<div class="conjwrap"><table class="conj"><thead><tr><th></th>${V.map(v => `<th>${v[0]}<span>${v[1]}</span></th>`).join('')}</tr></thead><tbody>
    ${P.map((p, i) => `<tr class="${[0, 2, 4].includes(i) ? 'hot' : ''}"><td class="who">${p}</td>${V.map(v => `<td>${v[2][i]}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div>
    <p class="note">Highlighted: the rows you need today. <b>io</b> is you, <b>lui</b> is Mark, <b>voi</b> is how you ask the restaurant. Mangiare and prendere are regular: learn their endings and you can conjugate thousands of verbs. Volere is shown in its polite “would like” form.</p>`;
}
const L3_CHECKS = ['a destra', 'a sinistra', 'dritto'];
/* Lessons 1–6's Studio lists (engine/ui/study.js STUDY_SOURCES), from the data their tiles and handbook pages use; a card's English is the
   data's `cue` where its `en` is the Italian word itself (un cappuccino = a cappuccino: the gloss lint, ui/vocab.js glossLint) */
Object.assign(STUDY_SOURCES, {
  1:() => [
    { group:'Hello and goodbye', words:['ciao', 'buongiorno'].map(setPhrase) },
    { group:'How are you?', words:['come stai', 'sto bene grazie', 'e tu', 'grazie'].map(setPhrase) },
    { group:'Names', words:['mi chiamo', 'come ti chiami', 'piacere'].map(setPhrase) },
    { group:'Word by word', note:'The words inside the phrases.', words:VOCAB1.map(v => ({ it:v.w, en:v.en, key:v.w })) },
  ],
  2:() => [
    { group:'Ordering', words:[
      { it:'Vorrei …', en:'I would like …', key:'vorrei', say:'Vorrei un caffè.' },
      { it:'per favore', en:'please', key:'per favore' },
      { it:'Sì', en:'yes', key:'sì' }, { it:'No', en:'no', key:'no', quiz:false },   // (no card: its English is the word itself)
      { it:"Quant'è?", en:'How much is it? (the bill)', key:"quant'è" },
      { it:'un', en:'a (masculine words)', key:'un' }, { it:'una', en:'a (feminine words)', key:'una' },
    ] },
    { group:'Polite', words:[setPhrase('come sta'), setPhrase('e lei')] },
    { group:'Little words', note:'Always in your Frasi fatte from Lesson 2 on.', words:['e', 'poi', 'ma', 'quindi', 'ancora una volta'].map(setPhrase) },
    { group:'Da bere · to drink', words:ITEMS.filter(i => i.kind === 'coffee' || i.kind === 'drink').map(i => nounWord(`${i.art} ${i.w}`, i.cue || i.en, { note:i.desc })) },
    { group:'Da mangiare · to eat', words:ITEMS.filter(i => i.kind === 'pastry' || i.kind === 'food').map(i => nounWord(`${i.art} ${i.w}`, i.cue || i.en, { note:i.desc })) },
  ],
  3:() => [
    { group:'Asking the way', words:DIR_TILES.filter(t => !t.place && !L3_CHECKS.includes(t.key)).map(t => tileWord(t, t.key === "dov'è" ? { it:"Dov'è …?", en:'where is …?', say:"Dov'è la banca?" } : {})) },
    { group:'Checking a direction', words:DIR_TILES.filter(t => L3_CHECKS.includes(t.key)).map(t => tileWord(t)) },
    { group:'Places', words:DIR_TILES.filter(t => t.place && /^(il|la) /.test(t.key) && !/aurora/.test(t.key)).map(t => tileWord(t, { g:studyGender(t.label) })) },
    { group:'Understanding directions', note:'You will mostly hear these: tu to a friend, Lei to a stranger.', words:DIR_TABLE.flatMap(([, en, tu, lei]) => [
      { it:tu, en:`${en.toLowerCase()} (to a friend)` }, { it:lei, en:`${en.toLowerCase()} (polite)` }]) },
    { group:'Direction words', words:DIR_WORDS.map(([it, en]) => /^il /.test(it) ? nounWord(it, en) : { it, en }) },
  ],
  4:() => [
    { group:'Who', words:L4_WHO.map(t => tileWord(t)) },
    { group:'Verbs', note:'I: vorrei, posso, mangio. He / she: vorrebbe, può, mangia.', words:L4_VERBS.map(t => tileWord(t)) },
    { group:'Asking', words:L4_ASK.map(t => tileWord(t, t.key === 'il conto' ? { g:'m' } : t.key === 'no' ? { quiz:false } : {})) },
    { group:'Il menù', words:[...DISHES, PIZZA].map(d => nounWord(d.label, d.cue || d.en, d.desc ? { note:d.desc } : {})) },
    { group:'Da bere', words:DRINKS4.map(d => nounWord(d.label, d.en)) },
    { group:'Ingredients', words:INGR.map(d => nounWord(d.label, d.en)) },
  ],
  5:() => [
    { group:'Introducing', words:L5_TILES.slice(0, 4).map(t => tileWord(t)) },
    { group:'Talking about a friend', words:L5_TILES.slice(4).map(t => tileWord(t, { g:studyGender(t.label) })) },
  ],
  6:() => [
    { group:'Looking for something', words:L6_TILES.filter(t => !['signore', 'signora', 'arrivederci'].includes(t.key)).map(t => tileWord(t, { g:studyGender(t.label) })) },
    { group:'Polite', words:L6_TILES.filter(t => ['signore', 'signora', 'arrivederci'].includes(t.key)).map(t => tileWord(t)) },
  ],
});
