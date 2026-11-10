/* Lesson 11 · Al museo. Lesson flow: start, the opening cutscene at the Pietà (controls frozen, a scripted walk, only E),
   the custodian's "Troppo vicino!" and the rules box, Lucia (where she stands, following you, walking to Sala 5 and to
   Canaletto), the tutorial states, Lucia's homework sheet (the notepad checklist), Vedo, vedo… nel museo, the completion
   screen and skip. Lucia's conversations are in lucia.js, the tasks and the answer checking in tasks.js.
   Design: docs/lessons/11-al-museo.md.

   Saved state: S.l11 = { met (Lucia's greeting done), barrier, follow (Lucia follows you), tasks:{ id:{ q (questions
   answered), done, notes (your accepted sentences), at (the work you stood at) } }, permesso / scusi / prego (crowd picks),
   tooClose (the custodian's "Troppo vicino!" after the opening), mistakes:{ agree, fact }, vedo:{ seed, found, misses,
   started, done, result }, venezia ('si' | 'no' | 'nonloso'), tu (darsi del tu: Lucia uses tu from now on, in every later
   lesson), bye }. Tests read it through __dbg().l11. */

const freshL11 = () => ({ met:false, barrier:false, follow:false, tasks:{}, permesso:0, scusi:0, prego:0, tooClose:0, mistakes:{ agree:0, fact:0 },
  vedo:{ seed:Math.floor(Math.random() * 1e9), found:0, misses:0, started:false, done:false, result:null }, venezia:null, tu:false, bye:false });
const L11_PIETA = 'michelangelo-pieta', L11_CANAL = 'canaletto-canal-grande';
/* where Lucia is: between Apollo e Dafne and Amore e Psiche (sketching), on the bench in Sala 5 (at its east end, so she
   is never in the way of La scuola di Atene), beside Canaletto */
const L11_SPOT = { start:{ x:912, y:648, face:{ x:0, y:-1 } }, bench:{ x:982, y:289, face:{ x:0, y:-1 }, seated:true }, canal:{ x:1706, y:510, face:{ x:0.6, y:-0.8 } } };
const L11_CHAIR = { x:716, y:800 };
/* "C'è un cane." answers a question: it is not one (formatSentence: c'è is a question word) */
NOTQ.add("c'è un"); NOTQ.add("c'è una");
let l11Walking = null, l11CutOn = false, l11Viewing = null;

/* ---------- Lucia, the custodian and the rules: the Lesson 11 bits of shared characters ---------- */
{
  const lu = NPC.lucia, keep = k => { const d = Object.getOwnPropertyDescriptor(lu, k); return () => d.get ? d.get() : d.value; };
  const was = { formal:keep('formal'), greet:keep('greet'), revisitOpening:keep('revisitOpening'), opening:keep('opening'), place:keep('place') };
  const tu = () => !!(S.l11 && S.l11.tu);
  const def = (k, get) => Object.defineProperty(lu, k, { configurable:true, enumerable:true, get });
  /* darsi del tu (the end of Lesson 11): from then on Lucia is tu, in every later lesson */
  def('formal', () => tu() ? false : was.formal());
  def('greet', () => tu() ? { it:'Ciao', en:'Hi' } : was.greet());
  def('revisitOpening', () => S.lesson === 11 && S.l11 && L11C.open ? L11C.open : tu() ? { it:'Ciao, {Me}! Come stai?', en:'Hi, {Me}! How are you?', asks:'how' } : was.revisitOpening());
  def('opening', () => S.lesson === 11 && S.l11 && L11C.open ? L11C.open : was.opening());
  def('place', () => S.lesson === 11 && S.l11 ? "Museo d'Arte · I Capolavori" : was.place());
}
/* the rules box: the first box of the chapter, where the handbook opens after the custodian */
LESSONS.find(L => L.n === 11).boxes = [{ id:'regole', title:'Al museo: le regole', html:`<p>What the custodian shouted, and the signs by the statues:</p>
  <div class="phrases">${[['Troppo vicino!', 'Too close!', 'Troppo = too (much), vicino = near.'], ['Non si tocca!', 'No touching!', 'Literally “one does not touch”.'],
    ['È vietato fare foto con il flash.', 'Flash photography is forbidden.', 'È vietato = it is forbidden.'], ['Si guarda, non si tocca!', 'You look, you don’t touch!', 'Every Italian child hears this in a museum.']]
    .map(([it, en, note]) => `<div class="phrase"><div class="it"><span>${esc(it)}</span><button class="play" data-say="${esc(it)}" aria-label="Play: ${esc(it)}">${SPK}</button></div><div class="en">${esc(en)}</div><div class="note">${esc(note)}</div></div>`).join('')}</div>` }];

/* ---------- the sheet (the notepad checklist) ---------- */
function l11SheetSpec(){
  const items = [], room = l11RoomHere();
  items.push({ head:true, label:'Atrio · le statue', value:`${Math.min(2, l11StatueCount())}/2`, cur:room === 0 });
  L11_TASKS.filter(T => T.room === 0 && (l11Done(T) || l11StatueCount() < 2)).forEach(T => items.push({ label:T.en, done:l11Done(T), cur:room === 0, ok:!l11Done(T) && l11Rec(T).q > 0}));
  L11_ROOMS.forEach(r => {
    const n = Math.min(2, l11RoomCount(r));
    items.push({ head:true, label:ART.rooms[String(r)], value:`${n}/2`, cur:room === r });
    L11_TASKS.filter(T => T.room === r && (l11Done(T) || n < 2)).forEach(T => items.push({ label:T.en, done:l11Done(T), ok:!l11Done(T) && l11Rec(T).q > 0, cur:room === r }));
  });
  const left = 10 - l11RoomsDone();
  return { title:"Lucia's homework", paperTitle:'Scuola d’arte · compito', sub:'Two statues, then two works in every room', button:'Sheet', items,
    foot:left ? `${left} to go. Stand at a work and look at it (<kbd>E</kbd>): Lucia asks you about it.` : 'All done. Bravo!' };
}
/* the room the player is in (0: the atrium; null: elsewhere) */
function l11RoomHere(){
  if (S.scene !== 'galleria') return null;
  for (const n of [5, 2, 3, 1, 4, 0]){ const R = GAL.rooms[n]; if (player.x >= R.x - 8 && player.x <= R.x + R.w + 8 && player.y >= R.y - 8 && player.y <= R.y + R.h + 8) return n; }
  return null;
}

LESSON_HOOKS[11] = {
  n:11,
  vocab:[...L11_CMP, ...L11_ADJ, ...L11_FEEL, ...L11_LIKE, ...L11_SEE],
  vocabNote:'In your tile bank with Lucia (Confrontare, Descrivere, Sembra…, Mi piace, Nei quadri).',
  bankTiles:[...L11_POLITE],
  doneTut:'l11-done',
  bookPulse:['l11-handbook', 'l11-vocab', 'l11-practice'],

  objective:{
    'l11-pieta':'', 'l11-custode':'', 'l11-rules':'',
    'l11-lucia':'Talk to the woman with the sketchbook',
    'l11-handbook':'Open your handbook',
    'l11-vocab':'Learn the Lesson 11 words',
    'l11-practice':'Finish the Lesson 11 practice',
    'l11-statues':() => `Help Lucia with the statues · ${S.l11 ? Math.min(2, l11StatueCount()) : 0}/2`,
    'l11-rooms':() => `Lucia's sheet · ${S.l11 ? l11RoomsDone() : 0}/10`,
    'l11-vedo':'Find the works Lucia describes',
    'l11-venezia':'',
    'l11-done':'Lezione 11 completata',
  },
  guide:{
    'l11-lucia':near => near === NPC.lucia ? 'Press <kbd>E</kbd> to talk to her. You have met before: she uses <i>Lei</i> with you.'
      : 'Someone with a sketchbook is waving at you, between the two statues at the top of the atrium. It\'s <b>Lucia</b>, the art student from the Gattamelata!',
    'l11-handbook':() => {
      if (modalOpen && sheet.classList.contains('book') && hbLesson === 11) setTut(vocabCheckDone(11) ? 'l11-practice' : 'l11-vocab');
      return 'This one or that one? Older, more beautiful? You can\'t compare anything yet. Open the handbook (<kbd>H</kbd>): <b>Lezione 11 · Al museo</b>.';
    },
    'l11-vocab':'Read Lezione 11 (comparing, agreement, <i>sembra</i>). Then learn its words: open the <b>Words</b> tab, flip through the flashcards and pass the quiz. The <b>Practice</b> opens after that.',
    'l11-practice':'Words learned! Now finish the <b>Practice</b> tab of Lezione 11.',
    'l11-statues':near => !S.l11 || !S.l11.follow ? (near === NPC.lucia ? 'Press <kbd>E</kbd> to talk to Lucia.' : 'Back to <b>Lucia</b>, between the two statues at the top of the atrium. Her homework is waiting.')
      : `Lucia needs <b>two statues</b> (${Math.min(2, l11StatueCount())}/2). Stand at a statue and look at it (<kbd>E</kbd>): she'll ask you about it. Not too close to the ropes!`,
    'l11-rooms':() => `Lucia's sheet: <b>two works in every room</b> (${l11RoomsDone()}/10). Stand at one and look at it (<kbd>E</kbd>): she'll ask you about it. The sheet: <kbd>L</kbd>. Someone in the way? You know the word.`,
    'l11-vedo':near => mispyActive() ? null : near === NPC.lucia ? 'Press <kbd>E</kbd> to talk to Lucia.'
      : (S.l11 && S.l11.vedo.started ? 'Lucia is on the bench in <b>Sala 5</b>. Talk to her to carry on with the game.' : 'Homework done! Lucia has gone to sit on the bench in <b>Sala 5 · Raffaello</b> (at the top). She has a game for you.'),
    'l11-venezia':near => near === NPC.lucia ? 'Press <kbd>E</kbd> to talk to Lucia.' : 'Lucia is waiting for you in <b>Sala 3 · Il Barocco</b>, by a small view of Venice: her favourite painting.',
    'l11-done':() => 'Lezione 11 completata! Lucia is <i>tu</i> now, and Venice is calling.'
      + (hookFor(12) && hookFor(12).start && LESSONS[11] ? ` <button class="gbtn" data-action="l12">Start Lezione 12 · ${esc(LESSONS[11].title)}</button>` : ''),
  },
  markers:{ 'l11-lucia':'lucia', get 'l11-statues'(){ return S.l11 && !S.l11.follow ? 'lucia' : null; }, get 'l11-vedo'(){ return mispyActive() ? null : 'lucia'; }, 'l11-venezia':'lucia' },

  start(){
    if (modalOpen) closeModal();
    if (cutsceneOn()) cutsceneEnd();
    S.lesson = 11; S.l5follow = false; S.brunoFollow = false; S.l11 = freshL11();
    setTut('l11-pieta'); lastGuide = ''; l11CutOn = false;
    travelTo('galleria', GAL.spawn, "Museo d'Arte", 'I Capolavori');
    setTimeout(() => toast('<b>Lezione 11 · Al museo</b> has started'), 1800);
  },
  /* the end of Lesson 11: the homework done (two statues, two works a room), the game played, darsi del tu */
  skip(){
    const l11 = freshL11(), pick = { 0:['s-apollo', 's-pieta'], 1:['r1-battaglia', 'r1-annunciazione'], 2:['r2-primavera', 'r2-dama'], 3:['r3-giuditta', 'r3-matteo'], 4:['r4-cane', 'r4-citta'], 5:['r5-atene', 'r5-giorgio'] };
    Object.values(pick).flat().forEach(id => { l11.tasks[id] = { q:L11_TASK[id].q.length, done:true, notes:[], at:L11_TASK[id].works[0] }; });
    Object.assign(l11, { met:true, barrier:true, follow:false, venezia:'si', tu:true, bye:true, permesso:3 });
    Object.assign(l11.vedo, { started:true, done:true, found:5, result:{ rounds:5, misses:0, picks:[] } });
    Object.assign(S, { lesson:11, vocab11:true, practiceDone11:true, vocabCheck11:true, tut:'l11-done', scene:'galleria', l5follow:false, brunoFollow:false, l11 });
    S.met.lucia = S.known.lucia = true; S.met.guardia = S.known.guardia = true;
    (PX[11] = freshPX()).i = LESSONS[10].exercises.length;
  },
  restore(){
    if (S.lesson < 11) return;
    if (!S.l11 || typeof S.l11 !== 'object') S.l11 = freshL11();
    const f = freshL11();
    Object.keys(f).forEach(k => { if (S.l11[k] === undefined || (S.l11[k] === null && !['venezia'].includes(k))) S.l11[k] = f[k]; });
    ['tasks', 'mistakes', 'vedo'].forEach(k => { if (!S.l11[k] || typeof S.l11[k] !== 'object') S.l11[k] = f[k]; });
    if (S.lesson !== 11) return;
    if (S.tut === 'l11-practice' && !vocabCheckDone(11)) S.tut = 'l11-vocab';
    /* saved during the opening (after the Pietà): the custodian has had his say; Lucia is next */
    if (['l11-custode', 'l11-rules'].includes(S.tut)){ S.tut = 'l11-lucia'; S.met.guardia = S.known.guardia = true; }
    if (S.tut === 'l11-pieta' && S.scene === 'galleria'){ player.x = S.px = GAL.spawn.x; player.y = S.py = GAL.spawn.y; }
  },

  /* Lucia is in the museum (following you, or at her spot) */
  sceneOf(n){
    if (n.id === 'lucia' && S.lesson === 11 && S.l11) return S.l11.follow ? S.scene : 'galleria';
    return null;
  },
  follower(){ return S.lesson === 11 && S.l11 && S.l11.follow ? NPC.lucia : null; },
  /* the map's fast travel (world/map.js): not while Lucia is showing you round (she must walk with you, in the museum) */
  fastTravel(){ if (S.lesson === 11 && S.l11 && S.l11.follow) return 'Lucia is showing you round the museum: stay with her.'; },
  place(){
    if (S.lesson !== 11 || !S.l11) return;
    l11PlaceLucia();
    const g = NPC.guardia; if (g && !g.cutWalk && !l11CutOn){ g.x = L11_CHAIR.x; g.y = L11_CHAIR.y; g.seated = true; g.baseFace = { x:1, y:0 }; }
  },
  checklist(){ return S.lesson === 11 && S.l11 && S.tut === 'l11-rooms' ? l11SheetSpec() : null; },

  /* the word check (ui/vocab.js) is passed: on to the practice */
  onVocab(){
    if (['l11-lucia', 'l11-handbook', 'l11-vocab'].includes(S.tut) && S.l11 && S.l11.barrier) setTut('l11-practice');
  },
  onPractice(){
    toast('New tiles: <b>Confrontare</b>, <b>Descrivere</b>, <b>Sembra…</b>, <b>Mi piace</b>, <b>Nei quadri</b>. Back to Lucia!');
    if (['l11-lucia', 'l11-handbook', 'l11-vocab', 'l11-practice'].includes(S.tut) && S.l11 && S.l11.barrier) setTut('l11-statues');
  },

  /* the museum doors at the end of Lesson 10 lead into Lesson 11 */
  door(d){
    if (d.id === 'museo' && S.lesson === 10 && S.tut === 'l10-done'){ this.start(); return true; }
    return false;
  },
  talk(npc){ return l11Lucia(npc) ? l11LuciaTalk(npc) : false; },
  bank(npc, groups, names){ return l11Bank(npc, groups, names); },
  phrases(npc){ return S.lesson >= 11 ? l11Phrases(npc) : []; },
  react(id, n, st, add, out, ints){ return l11React(id, n, st, add, out, ints); },
  hint(n, st){ return l11Hint(n, st); },
  afterTurn(n, out){ return l11After(n, out); },
  onClose(closedId, closedDone){ return l11OnClose(closedId, closedDone); },

  /* the crowd in the galleria: Permesso as in Lesson 10 */
  onCrowd(n, choice){ if (S.lesson === 11 && S.l11 && choice){ S.l11[choice] = (S.l11[choice] || 0) + 1; save(); } return false; },
  crowdHint(n, kind){
    if (S.lesson !== 11 || !S.l11) return null;
    if (kind === 'scusi') return '<i>Scusi</i> only makes them turn round. To get past, use the word Bruno taught you on the square.';
    return null;
  },
  onTooClose(){ if (S.lesson === 11 && S.l11){ S.l11.tooClose++; save(); } return false; },
  cutsceneResume(c){ if (c.id === 'l11-pieta' && S.lesson === 11 && S.l11){ l11CutOn = false; return true; } return false; },
  /* __dbg().l11: S.l11 plus what is going on now */
  dbgLesson(n){
    if (n !== 11 || !S.l11) return null;
    const C = convo && convo.npc && convo.npc.id === 'lucia' && convo.l11 ? convo.l11 : null;
    return { convo:C ? { kind:C.kind, task:C.task ? C.task.id : null, at:C.at || null, q:C.task ? l11Rec(C.task).q : null, phase:C.phase || null } : null,
      walking:l11Walking, room:l11RoomHere(), statues:l11StatueCount(), rooms:l11RoomsDone(), open:L11_TASKS.filter(l11TaskOpen).map(T => T.id),
      lucia:[Math.round(NPC.lucia.x), Math.round(NPC.lucia.y)], seated:!!NPC.lucia.seated, following:followerNpc() === NPC.lucia, formal:!!NPC.lucia.formal, guardiaKnown:!!S.known.guardia };
  },
};

/* ---------- Lucia's place ---------- */
function l11LuciaHome(){
  const t = S.tut;
  if (['l11-vedo'].includes(t)) return L11_SPOT.bench;
  if (['l11-venezia', 'l11-done'].includes(t)) return L11_SPOT.canal;
  return L11_SPOT.start;
}
function l11PlaceLucia(){
  const lu = NPC.lucia;
  if (l11Walking === 'lucia' || S.l11.follow) { lu.seated = false; return; }
  const h = l11LuciaHome();
  lu.x = h.x; lu.y = h.y; lu.baseFace = { ...h.face }; lu.seated = !!h.seated;
}
/* someone walks to (x, y) round the walls (findPath from where they are), then cb() */
function l11Walk(n, to, cb, speed = 125){
  const path = findPath(n.x, n.y, to.x, to.y) || [];
  const pts = path.concat([{ x:to.x, y:to.y }]);
  l11Walking = n.id; n.seated = false;
  let last = performance.now();
  const end = () => { n.moving = false; l11Walking = null; if (cb) cb(); renderHUD(); };
  const tick = now => {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = Math.max(last, now);    // (a frame's timestamp can be older than the walk's start)
    if (S.lesson !== 11 || S.scene !== 'galleria'){ n.x = to.x; n.y = to.y; end(); return; }
    if (!pts.length){ end(); return; }
    if (dialogOpen && convo && convo.npc === n){ n.moving = false; requestAnimationFrame(tick); return; }
    const t = pts[0], dx = t.x - n.x, dy = t.y - n.y, d = Math.hypot(dx, dy), sp = (RM ? 500 : speed) * dt;
    n.moving = true; n.walk = (n.walk || 0) + dt * 10;
    if (d <= sp){ n.x = t.x; n.y = t.y; pts.shift(); }
    else { n.x += dx / d * sp; n.y += dy / d * sp; n.face = { x:dx / d, y:dy / d }; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- the opening: the Pietà, the custodian, the rules ---------- */
function l11Opening(){
  if (l11CutOn || S.tut !== 'l11-pieta') return;
  l11CutOn = true;
  const g = NPC.guardia, p = GAL_WORK[L11_PIETA];
  const inRope = { x:912, y:p.block.y + p.block.h - 12 }, behind = { x:912, y:p.block.y + p.block.h + 34 };
  player.x = GAL.spawn.x; player.y = GAL.spawn.y; player.face = { x:0, y:-1 };
  const toLucia = () => { setTut('l11-lucia'); l11CutOn = false; S.met.guardia = S.known.guardia = true; save(); renderHUD();
    setTimeout(() => { if (S.tut === 'l11-lucia' && S.scene === 'galleria' && !dialogOpen) worldSay('lucia', fill('Ma… {Me}?'), { ms:2600 }); }, 900); };
  const sit = () => { g.x = L11_CHAIR.x; g.y = L11_CHAIR.y; g.seated = true; g.baseFace = { x:1, y:0 }; g.face = { x:1, y:0 }; };
  cutscene([
    { guide:'The <i>Pietà</i>. You can\'t take your eyes off it…' },
    { wait:700 },
    { walk:'player', path:[{ x:912, y:960 }, { x:912, y:behind.y + 20 }, inRope], speed:62, face:{ x:0, y:-1 } },
    { wait:400 },
    { guide:'Press <kbd>E</kbd>.', allowKeys:['e'], until:'workOpened', work:L11_PIETA },
    { guide:null, until:'workClosed' },
    { run:() => { setTut('l11-custode'); g.seated = false; } },
    { say:'Ehi! Troppo vicino! Troppo vicino!', who:'guardia', ms:2000 },
    { walk:'guardia', path:[{ x:790, y:800 }, { x:870, y:860 }], speed:150 },
    { face:'player', to:'guardia' },
    { say:'Non si tocca!', who:'guardia', ms:1500 },
    { walk:'player', to:behind, speed:90, async:true },
    { walk:'guardia', to:{ x:860, y:behind.y + 4 }, speed:90 },
    { wait:500 },
    { face:'guardia', to:'player' }, { face:'player', to:'guardia' },
    { run:() => { setTut('l11-rules'); S.met.guardia = S.known.guardia = true; save(); openHandbook(11, { section:'regole' }); } },
    { until:'modalClosed' },
    { say:'Grazie. Si guarda, non si tocca!', who:'guardia', ms:2200 },
    { walk:'guardia', path:[{ x:790, y:800 }, L11_CHAIR], speed:110, face:{ x:1, y:0 } },
    { run:sit },
  ], { id:'l11-pieta', guide:'', onSkip:() => { player.x = behind.x; player.y = behind.y; if (modalOpen) closeModal(); sit(); } }).then(r => {
    if (r.replaced){ l11CutOn = false; return; }
    sit(); toLucia();
  });
}

/* ---------- every 200 ms: the opening on arrival, a picture closed → Lucia's question ---------- */
function l11Tick(){
  if (S.lesson !== 11 || !S.l11 || introOpen) return;
  if (S.tut === 'l11-pieta' && S.scene === 'galleria' && !traveling && !cutsceneOn() && !l11CutOn){ l11Opening(); return; }
  if (S.scene !== 'galleria') return;
  if (workOpen()){ l11Viewing = workShown; return; }
  if (l11Viewing && !modalOpen){
    const id = l11Viewing; l11Viewing = null;
    const T = l11TaskOf(id), lu = NPC.lucia;
    if (!T || !S.l11.follow || !['l11-statues', 'l11-rooms'].includes(S.tut) || dialogOpen || cutsceneOn() || mispyActive() || traveling) return;
    if (!l11TaskOpen(T)) return;
    if (Math.hypot(lu.x - player.x, lu.y - player.y) > 220){ toast('Lucia is catching up with you…'); return; }
    L11C.ctx = { task:T, at:id };
    setTimeout(() => { if (!dialogOpen && !modalOpen && L11C.ctx) openConvo(lu); }, 250);
  }
}
setInterval(l11Tick, 200);
/* tests: the player at (x, y), and Lucia beside them when she is following (the trail starts again) */
Object.assign(window.__debug, { l11At(x, y){ __debug.place(x, y); if (S.l11 && S.l11.follow){ NPC.lucia.x = x - 24; NPC.lucia.y = y + 20; trail.length = 0; } } });

/* ---------- closing a conversation: the tutorial moves on ---------- */
function l11OnClose(closedId){
  if (S.lesson !== 11 || !S.l11) return false;
  L11C.open = null;
  if (closedId !== 'lucia') return false;
  if (S.tut === 'l11-statues' && l11StatueCount() >= 2){
    setTut('l11-rooms');
    toast("Two statues done! Lucia's homework sheet is in your notepad: <b>Sheet</b> (<kbd>L</kbd>).");
    setTimeout(() => { if (!dialogOpen && !modalOpen && S.tut === 'l11-rooms') openChecklist(l11SheetSpec()); }, 700);
    return true;
  }
  if (S.tut === 'l11-rooms' && l11RoomsDone() >= 10){
    setTut('l11-vedo');
    S.l11.follow = false; trail.length = 0; save();
    worldSay('lucia', 'Finito! Grazie!', { ms:2200 });
    toast('Lucia\'s homework is done! She is off to the bench in <b>Sala 5</b>: she has a game for you.');
    if (S.scene === 'galleria') setTimeout(() => l11Walk(NPC.lucia, L11_SPOT.bench, () => { NPC.lucia.seated = true; }), 900);
    return true;
  }
  if (S.tut === 'l11-venezia' && S.l11.bye){ setTut('l11-done'); setTimeout(openComplete11, 400); return true; }
  return false;
}

/* ---------- Vedo, vedo… nel museo ---------- */
function l11PlayVedo(){
  const V = S.l11.vedo, first = !V.started;
  V.started = true; save();
  openMuseumISpy({
    rounds:5, who:'lucia', seed:V.seed, found:V.found, exclude:[L11_CANAL],
    intro:first ? { it:'Adesso giochiamo! Vedo, vedo…', en:"Now let's play! I spy…" } : { it:'Continuiamo! Vedo, vedo…', en:"Let's carry on! I spy…" },
    onRound(k){ V.found = k; save(); renderHUD(); },
    onPick(id, ok){ if (!ok){ V.misses++; save(); } },
    onDone(r){ V.done = true; V.found = r.rounds; V.result = JSON.parse(JSON.stringify(r)); save(); },
    onClose(st){
      if (V.done){ setTimeout(l11ToVenezia, 300); return; }
      renderHUD(); toast('Lucia: “Continuiamo dopo!” Talk to her on the bench to carry on.');
    },
  });
}
/* the game is over: Lucia's favourite painting, Canaletto's Venice (Sala 3) */
function l11ToVenezia(){
  if (S.tut !== 'l11-vedo') return;
  setTut('l11-venezia');
  worldSay('lucia', 'Venga! Il mio quadro preferito!', { ms:2400 });
  toast('Lucia: “Come! My favourite painting!” She is off to <b>Sala 3</b>.');
  if (S.scene === 'galleria') l11Walk(NPC.lucia, L11_SPOT.canal, () => { NPC.lucia.baseFace = { ...L11_SPOT.canal.face }; });
}

/* ---------- completion ---------- */
function openComplete11(){
  openModal('');
  const L = S.l11, V = L.vedo, R = V.result || { rounds:V.found, misses:V.misses };
  const done = L11_TASKS.filter(l11Done);
  const sheetHTML = checklistHTML({ title:'Scuola d’arte · compito', sub:`Lucia, with ${S.playerName}`,
    items:[0, ...L11_ROOMS].flatMap(r => { const ts = done.filter(T => T.room === r); return ts.length ? [{ head:true, label:r ? ART.rooms[String(r)] : 'Atrio · le statue', value:`${ts.length}/2` },
      ...ts.map(T => ({ label:T.en, ok:true, note:(l11Rec(T).notes || []).join(' ') }))] : []; }), foot:'Tutto fatto! Grazie mille. — L.' });
  const mist = L.mistakes.agree + L.mistakes.fact;
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione 11 completata!</em></h2><p class="sub">Al museo · Describing, comparing, and how people seem</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>You got far too close to the <i>Pietà</i> (<b>Troppo vicino!</b>), met Lucia again, and did her art-school homework with her: comparing
        (<b>questo è più vecchio di quello</b>), counting (<b>ci sono nove persone</b>), how people seem (<b>Giuditta sembra arrabbiata</b>) and what you like
        (<b>mi piacciono i colori</b>). Then <b>Vedo, vedo… nel museo</b>, Canaletto's Venice, and <b>darsi del tu</b>: Lucia is a friend now.</p>
      <h3>Lucia's homework, filled in</h3>
      <div class="l11-done-sheet">${sheetHTML}</div>
      <h3>Your numbers</h3>
      <div class="stats">
        <div><b>${done.length}</b><span>works described for Lucia${mist ? ` (${mist} ${mist === 1 ? 'answer' : 'answers'} put right on the way)` : ''}</span></div>
        <div><b>${R.rounds || 5}/5</b><span>works found in Vedo, vedo${R.misses ? ` (${R.misses} wrong ${R.misses === 1 ? 'pick' : 'picks'})` : ''}</span></div>
        <div><b>${L.permesso}</b><span>visitors you got past with <i>Permesso!</i>${L.tooClose ? ` · ${L.tooClose} × <i>Troppo vicino!</i>` : ''}</span></div>
      </div>
      <div class="next"><p class="kicker">Next</p><p>${L.venezia === 'si' ? 'Venice! Lucia says you must see it.' : 'Venice… Lucia says you must see it.'} The station is not far, and the trains go every hour.</p></div>
      <div class="cta"><button class="btn${hookFor(12) && hookFor(12).start ? '' : ' primary'}" data-close>Keep exploring</button>${hookFor(12) && hookFor(12).start ? '<button class="btn primary" id="goL12">Start Lezione 12</button>' : ''}</div>
    </div>`;
  if (hookFor(12) && hookFor(12).start) $('#goL12').onclick = () => hookFor(12).start();
}
