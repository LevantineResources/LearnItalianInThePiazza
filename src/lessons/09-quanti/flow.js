/* Lesson 9 · Due magliette, tre rose. Lesson flow: start (the shopping list), tutorial transitions, the list (the
   notepad's checklist mode), Mark's exit (sceneOf), completion screen and skip. The stalls are in stalls.js, Sofia and
   the dictated route in sofia.js. Design: docs/lessons/09-quanti.md.

   Saved state: S.l9 = { list:{ good:qty }, totals:{ stall:€ }, order:{ stall:{ good:qty } }, said:{ stall:true } (the
   total was said), noted:{ stall:€ } (written in the notepad), paid:{ stall:true }, colour (Teresa: 'rosse'…), checked,
   listSeen, barrier, mistakes:{ plural, agree, number, article }, sofia:{ phase:'intro'|'origin'|'dir'|'far'|'bye' },
   sofiaPos, route:[{ op }] (the dictated steps, world/map.js), bad (impossible
   steps), undos, done }. The list and the totals are random per playthrough. Tests read it through __dbg().l9. */

/* Mark's story is over: from Lesson 9 on he is nowhere (no explanation). */
const l9Pick = a => a[Math.floor(Math.random() * a.length)];
function freshL9(){
  const list = {}, totals = {}, order = {}, used = new Set();
  L9_LIST.forEach(s => s.items.forEach(([k, q]) => { list[k] = l9Pick(q); }));
  while (list.arancia === list.pomodoro) list.pomodoro = l9Pick(L9_LIST[3].items[1][1]);
  L9_LIST.forEach(s => {
    let t; do { t = s.total[0] + Math.floor(Math.random() * (s.total[1] - s.total[0] + 1)); } while (used.has(t));
    used.add(t); totals[s.stall] = t; order[s.stall] = {};
  });
  return { list, totals, order, said:{}, noted:{}, paid:{}, colour:null, checked:{}, listSeen:false, barrier:false,
    mistakes:{ plural:0, agree:0, number:0, article:0 }, sofia:{ phase:'intro' }, sofiaPos:null, route:[], bad:0, undos:0, done:false };
}
const l9PaidCount = () => S.l9 ? L9_STALL_IDS.filter(id => S.l9.paid[id]).length : 0;
const l9Def = id => L9_LIST.find(s => s.stall === id);
/* "due magliette", "una sciarpa", "un'arancia", "un melone" (+ the colour at Teresa's) */
function l9Say(k, q, colour){
  const G = L9_GOODS[k];
  const noun = q === 1 ? (G.one.endsWith("'") ? G.one + G.sg : `${G.one} ${G.sg}`) : `${numIt(q)} ${G.pl}`;
  return colour ? `${noun} ${colour}` : noun;
}
const l9En = (k, q) => `${q} ${q === 1 ? L9_GOODS[k].en[0] : L9_GOODS[k].en[1]}`;
/* what is still to buy, in English: "2 ties, 1 scarf" */
const l9LeftEn = () => L9_LIST.filter(s => !S.l9.paid[s.stall]).map(s => `<b>${s.items.map(([k]) => l9En(k, S.l9.list[k])).join(', ')}</b> (${NPC[s.stall].name})`);

/* the shopping list, in English (the player makes the plurals), as the notepad's checklist. cur: the stall you are at */
function l9ListSpec(cur){
  const L = S.l9, items = [];
  L9_LIST.forEach(s => {
    const paid = !!L.paid[s.stall], O = L.order[s.stall] || {};
    items.push({ head:true, label:s.at, value:L.noted[s.stall] !== undefined ? `€ ${L.noted[s.stall]}` : null, done:paid, cur:cur === s.stall });
    s.items.forEach(([k]) => {
      const want = L.list[k], got = O[k], warn = !paid && got !== undefined && got !== want;
      const colour = k === 'maglietta' && L.colour ? L9_COLOUR_EN[L.colour] : null;
      items.push({ label:l9En(k, want) + (s.note && !colour ? `, ${s.note}` : colour ? `, ${colour}` : ''), done:paid, ok:!paid && got === want, warn,
        note:warn ? `you got ${got}!` : '', cur:cur === s.stall });
    });
  });
  const left = 4 - l9PaidCount();
  return { title:'Shopping list', button:'List', items,
    foot:left ? `${left} ${left === 1 ? 'stall' : 'stalls'} to go. In Italian, the plural is up to you!` : 'Everything bought. Bravo!' };
}
const L9_COLOUR_EN = { rosse:'red', bianche:'white', gialle:'yellow', verdi:'green', blu:'blue', rosa:'pink', nere:'black' };

LESSON_HOOKS[9] = {
  n:9,
  vocab:[...Object.values(L9_NOUN_TILES).flat(), ...L9_COLOUR_TILES, ...L9_DIR],
  vocabNote:'In your tile bank at the market stalls (Plurali, Colori) and with Sofia (Indicazioni).',
  bankTiles:[...L9_BUY, ...L9_POLITE, ...L9_SOFIA_TILES],     // also in this lesson's banks: checked by the vocab audit
  doneTut:'l9-done',
  bookPulse:['l9-handbook', 'l9-vocab', 'l9-practice'],

  objective:{
    'l9-start':'Check your shopping list',
    'l9-barrier':"Buy the T-shirts at Teresa's",
    'l9-handbook':'Open your handbook',
    'l9-vocab':'Learn the Lesson 9 words',
    'l9-practice':'Finish the Lesson 9 practice',
    'l9-shopping':() => `Buy everything on your list · ${l9PaidCount()}/4`,
    'l9-sofia':'Someone wants to talk to you',
    'l9-directions':'Tell Sofia how to get to San Lorenzo',
    'l9-done':'Lezione 9 completata',
  },
  guide:{
    'l9-start':'Your shopping list for today. Read it, then press <b>OK</b>.',
    'l9-barrier':near => near === NPC.teresa ? 'Press <kbd>E</kbd> to talk to Teresa.'
      : `Your list starts with <b>${S.l9 ? l9En('maglietta', S.l9.list.maglietta) : 'T-shirts'}</b>. Teresa's stall is top left (the T-shirts). Your list is always one tap away: the <b>List</b> button, or <kbd>L</kbd>.`,
    'l9-handbook':() => {
      if (modalOpen && sheet.classList.contains('book') && hbLesson === 9) setTut(vocabCheckDone(9) ? 'l9-practice' : 'l9-vocab');
      return 'She heard <i>two</i> and <i>one shirt</i> at the same time. Check the handbook (<kbd>H</kbd>): <b>Lezione 9 · Due magliette, tre rose</b>.';
    },
    'l9-vocab':'Read Lezione 9 (the plurals table!). Then learn its words: open the <b>Words</b> tab, flip through the flashcards and pass the quiz. The <b>Practice</b> opens after that.',
    'l9-practice':'Words learned! Now finish the <b>Practice</b> tab of Lezione 9.',
    'l9-shopping':() => {
      const left = S.l9 ? l9LeftEn() : [];
      return 'Buy everything on your list, stall by stall, in any order: greet, then ask for what you need. More than one? Watch the endings!'
        + (left.length ? ` Still to buy: ${listJoin(left, 'and')}.` : '');
    },
    'l9-sofia':near => near === NPC.sofia ? 'Press <kbd>E</kbd> to talk to her.' : 'A woman with a backpack is looking for someone to ask. Talk to her (<kbd>E</kbd>).',
    'l9-directions':near => near === NPC.sofia ? 'Press <kbd>E</kbd> to talk to Sofia.' : "Tell <b>Sofia</b> the way to San Lorenzo. Say one step at a time; watch your route on the map. Talk to her (<kbd>E</kbd>).",
    'l9-done':() => 'Lezione 9 completata! Everything on your list, and Sofia is on her way to San Lorenzo.'
      + (hookFor(10) && hookFor(10).start && LESSONS[9] ? ` <button class="gbtn" data-action="l10">Start Lezione 10 · ${esc(LESSONS[9].title)}</button>` : ''),
  },
  markers:{ 'l9-barrier':'teresa', get 'l9-shopping'(){ return S.l9 ? L9_STALL_IDS.find(id => !S.l9.paid[id]) || null : null; },
    'l9-sofia':'sofia', 'l9-directions':'sofia' },

  start(){
    if (modalOpen) closeModal();
    S.lesson = 9; S.l5follow = false; S.brunoFollow = false; S.l9 = freshL9();
    setTut('l9-start'); lastGuide = '';
    travelTo('mercato', { x:480, y:540 }, 'Il giorno dopo', 'The next morning, Piazza delle Erbe');
    setTimeout(() => {
      if (S.lesson !== 9 || S.tut !== 'l9-start' || dialogOpen || traveling) return;
      if (modalOpen) closeModal();
      S.l9.listSeen = true; save(); openChecklist(l9ListSpec());
      toast('<b>Lezione 9 · Due magliette, tre rose</b> has started');
    }, 2500);
  },
  /* the end of Lesson 9: everything bought, Sofia sent the right way */
  skip(){
    const l9 = freshL9();
    L9_LIST.forEach(s => { s.items.forEach(([k]) => { l9.order[s.stall][k] = l9.list[k]; }); l9.said[s.stall] = l9.paid[s.stall] = true; l9.noted[s.stall] = l9.totals[s.stall]; l9.checked[s.stall] = true; });
    Object.assign(l9, { listSeen:true, barrier:true, sofia:{ phase:'bye' }, sofiaPos:{ x:480, y:470 }, done:true,
      route:[{ op:{ k:'turn', dir:'L' } }, { op:{ k:'straightUntil' } }] });
    Object.assign(S, { lesson:9, vocab9:true, practiceDone9:true, tut:'l9-done', scene:'mercato', l5follow:false, brunoFollow:false, l9 });
    S.met.sofia = S.known.sofia = true;
    (PX[9] = freshPX()).i = LESSONS[8].exercises.length;
  },
  restore(){
    if (S.lesson < 9) return;
    if (!S.l9 || typeof S.l9 !== 'object') S.l9 = freshL9();
    const f = freshL9();
    Object.keys(f).forEach(k => { if (S.l9[k] === undefined || S.l9[k] === null && !['colour', 'sofiaPos'].includes(k)) S.l9[k] = f[k]; });
    L9_STALL_IDS.forEach(id => { if (!S.l9.order[id]) S.l9.order[id] = {}; });
    if (S.lesson === 9 && ['l9-sofia', 'l9-directions', 'l9-done'].includes(S.tut) && !S.l9.sofiaPos) S.l9.sofiaPos = { x:480, y:470 };
    /* saves from before the word check: the practice is locked until the words are learned */
    if (S.tut === 'l9-practice' && !vocabCheckDone(9)) S.tut = 'l9-vocab';
  },

  /* Mark has gone (from Lesson 9 on, everywhere); Sofia is at the market only once she comes to find you */
  sceneOf(n){
    if (n.id === 'mark' && S.lesson >= 9) return 'away';
    if (n.id === 'sofia' && S.lesson === 9) return S.l9 && ['l9-sofia', 'l9-directions', 'l9-done'].includes(S.tut) ? 'mercato' : 'away';
    return null;
  },
  place(){
    if (S.lesson !== 9 || !S.l9) return;
    const so = NPC.sofia;
    if (!l9SofiaWalking && S.l9.sofiaPos){ so.x = S.l9.sofiaPos.x; so.y = S.l9.sofiaPos.y; }
    /* the list has been read (its sheet closed): off to Teresa */
    if (S.tut === 'l9-start' && S.l9.listSeen && !modalOpen) setTut('l9-barrier');
  },
  checklist(){ return S.lesson === 9 && S.l9 && S.l9.listSeen ? l9ListSpec() : null; },

  talk(npc){
    if (S.lesson !== 9 || !S.l9) return false;
    if (npc.id === 'sofia') return l9SofiaTalk(npc);
    if (L9_STALL_IDS.includes(npc.id)){
      if (S.tut === 'l9-barrier' && S.vocab9){ S.l9.barrier = true; setTut('l9-shopping'); }   // practised before the barrier
      setDialogList(l9ListSpec(npc.id));
    }
    return false;
  },

  /* the word check (ui/vocab.js) is passed: on to the practice */
  onVocab(){
    if (['l9-start', 'l9-barrier', 'l9-handbook', 'l9-vocab'].includes(S.tut) && S.l9 && S.l9.barrier) setTut('l9-practice');
  },
  onPractice(){
    toast('New tiles: <b>Plurali</b>. Back to the stalls!');
    if (['l9-start', 'l9-barrier', 'l9-handbook', 'l9-vocab', 'l9-practice'].includes(S.tut) && S.l9 && S.l9.barrier) setTut('l9-shopping');
  },

  onClose(closedId){
    if (S.lesson !== 9 || !S.l9) return false;
    if (S.tut === 'l9-shopping' && l9PaidCount() === 4){
      setTut('l9-sofia');
      toast('Everything on your list! Time to go…');
      setTimeout(l9SofiaArrives, 700);
      return true;
    }
    if (closedId === 'sofia' && S.tut === 'l9-directions' && S.l9.done){ setTut('l9-done'); setTimeout(openComplete9, 350); return true; }
    return false;
  },
};

/* ---------- completion ---------- */
function openComplete9(){
  openModal('');
  const L = S.l9;
  const row = (w, g) => `<div class="entry"><div><div class="w">${w}</div><div class="g">${g}</div></div></div>`;
  const shop = L9_LIST.map(s => {
    const things = s.items.map(([k]) => l9Say(k, L.list[k], k === 'maglietta' ? L.colour : null));
    return row(esc(cap(listJoin(things, 'e'))), `€${L.noted[s.stall]} at ${esc(NPC[s.stall].name)}'s`);
  }).join('');
  mapDictStart({ ...L9_MAP, steps:L.route });
  const fixes = L.mistakes.plural + L.mistakes.agree + L.mistakes.article;
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione 9 completata!</em></h2><p class="sub">Due magliette, tre rose · Plurals: more than one</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>You got stuck on <i>due maglietta</i>, learned the plurals (<b>-o → -i</b>, <b>-a → -e</b>, <b>-e → -i</b>, <b>-cia → -ce</b>), bought everything on your list, and then <b>gave directions</b> in Italian for the first time: <i>Vada dritto, giri a sinistra…</i></p>
      <h3>Your shopping</h3>
      <div class="dict people">${shop}</div>
      <h3>The way you gave Sofia</h3>
      <div class="l9-route"><div class="l9-route-map">${mapDictSvg()}</div>
        <ol class="l9-route-lines">${L.route.map(x => `<li>${esc(l9OpIt(x.op))}</li>`).join('')}<li><b>San Lorenzo è lì.</b></li></ol></div>
      <h3>Your numbers</h3>
      <div class="stats">
        <div><b>${fixes}</b><span>${fixes === 1 ? 'ending' : 'endings'} put right (singular, plural, colour)</span></div>
        <div><b>${L.route.length}</b><span>${L.route.length === 1 ? 'step' : 'steps'} on Sofia's route</span></div>
        <div><b>${L.bad}</b><span>${L.bad === 1 ? 'step' : 'steps'} into the river or off the map</span></div>
      </div>
      <div class="next"><p class="kicker">Next</p><p>Sofia is off to San Lorenzo with her backpack. Padua is not that big: you'll probably run into her again.</p></div>
      <div class="cta"><button class="btn${hookFor(10) && hookFor(10).start ? '' : ' primary'}" data-close>Keep exploring</button>${hookFor(10) && hookFor(10).start ? '<button class="btn primary" id="goL10">Start Lezione 10</button>' : ''}</div>
    </div>`;
  if (hookFor(10) && hookFor(10).start) $('#goL10').onclick = () => hookFor(10).start();
}
