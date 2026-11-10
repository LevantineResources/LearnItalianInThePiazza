/* Quests, the bag, the passport, the time of day (Lesson 12 on). Design: docs/features/quests-and-night.md.
   The UI (the phone's Compiti / Borsa / Passaporto tabs, the scheda, the "!" spots on the map) is ui/quests.js; the
   lighting and opening hours are world/daytime.js and render/night.js.

   A QUEST is one file (or a few) in src/quests/NN-name/, picked up by the build like a lesson folder:
     QUESTS.push({
       id:'caffe', n:7,                          id (unique, used in S.quests and as 'q:caffe' for its scheda); n: the order
       title_it:'Il caffè è finito!', title_en:'The bar is out of coffee',
       window:'any' | 'afternoon' | 'night',     when it can be started and played (free play after the unit: any time)
       unlock:() => townOpen(),                   when it appears at all (default townOpen(): Lesson 12's explore state on)
       place:{ scene:'piazza', x:845, y:200, map:[300, 466]?, label?:'Bar Centrale' },
                                                  where its "!" spot on the city map travels to (map: the spot's position on the
                                                  map, default the scene's; label: the place's name for the task list)
       giver:'enzo',                              who gives it (a quest marker over their head until it is started)
       steps:[{ id:'ask', en:'Ask Davide at Caffè Aurora to lend a packet', who:'davide', where:'Caffè Aurora, San Lorenzo' }, …],
                                                  the task list shows the current step; who: the marker moves to them
       items:{ caffe:{ label_it:'il caffè', label_en:'the coffee (a packet from Davide)', for:'enzo' } },
                                                  the things it puts in the bag (bagAdd(q.items.caffe) / bagAdd('caffe', q))
       scheda:{ phrases, phrasesTitle?, how, culture, vocab, exercises, tiles?, bankTiles? },
                                                  the mini chapter (ui/quests.js): opened when the quest starts; its word check and
                                                  practice; tiles / bankTiles: the tiles its conversations use (checked by the
                                                  vocab audit against the scheda's vocab and every lesson's)
       stamp:{ icon:'☕', color:'#7a3a2a', label?:'Bar Centrale' },   its stamp in the passport
       onDone?(), onScheda?()                     after it is finished (put people back) / after its scheda is done
       hooks:{ talk, bank, phrases, react, hint, afterTurn, onClose, place, sceneOf, … },
                                                  the same keys as LESSON_HOOKS (CLAUDE.md): while the quest is open (startable)
                                                  or under way, they are part of hooks(), after the lessons' hooks. Guard them
                                                  with the NPC and the step: other quests and lessons share the conversations.
     });
   State: S.quests = { [id]:{ started, step, done, at:{ daytime, clock, lesson }, words, practice } } (lazy, not in FRESH()).
   questState(q): 'locked' (unlock() false) | 'closed' (wrong time of day, or a lesson's questGate says so) | 'open'
     (startable) | 'active' (started) | 'done'.  questStart(id), questStep(id, stepId), questDone(id), questCurStep(id).
   Lessons steer the town with these LESSON_HOOKS keys (asked of LESSON_HOOKS only, never of quests):
     townOpen() → true      the quests are unlocked (Lesson 12: from l12-explore on)
     questGate(q) → null | { closed:'chiuso · è tardi' }   close a quest for now (Lesson 12 after 23:00)
     questFree() → true     free play: every quest open at any time (after the unit)
     onQuestDone(q, rec)    a quest was finished (Lesson 12 counts them and moves the clock on)
     gameClock() → { h, m } | null   the time in the header (Lesson 12)
     stamps() → [{ id, title_it, title_en, icon, color, when }]   extra stamps for the passport
     mapSpots() → [{ id, x, y, label, note?, closed?, go:{ scene, spawn, title, sub } }]   extra "!" spots on the map
   THE BAG: S.bag = [{ id, label_it, label_en, for? }] (lazy). bagAdd(item), bagHas(id), bagRemove(id), bagItems().
     In a tile-bank conversation the bag is a tile group, "Nella borsa": Ecco + the items (ui/quests.js); "ecco il caffè"
     parses as give:caffe (the quest's react hook takes it; otherwise the person says it isn't for them).
   THE PASSPORT: passportStamps(): a stamp per quest done (the time of day and the clock when it was done), plus stamps().
   THE TIME OF DAY: daytime() = S.daytime || 'afternoon' ('afternoon' | 'night'; 'morning' for scripted scenes). */

/* a quest's own things drawn in a scene, in the depth-sorted pass (render/sprites.js): SCENE_EXTRAS.push({ scene:'piazza',
   when?:() => bool, ents:t => [{ y, draw }], after?:t => {} }) (Musica in piazza: the dancers round the fountain; after: drawn
   after the night's lighting pass, e.g. strings of lights) */
const SCENE_EXTRAS = [];
function questById(id){ return QUESTS.find(q => q.id === id) || null; }
const questKey = id => 'q:' + id;
const isQuestKey = n => typeof n === 'string' && n.startsWith('q:');
const questOfKey = n => isQuestKey(n) ? questById(n.slice(2)) : null;
function questRec(id){
  if (!S.quests || typeof S.quests !== 'object' || Array.isArray(S.quests)) S.quests = {};
  return S.quests[id] || (S.quests[id] = { started:false, step:null, done:false, at:null, words:false, practice:false });
}
const questPeek = id => (S.quests && S.quests[id]) || null;
function daytime(){ return S.daytime || 'afternoon'; }
/* asked of the lessons only (quest code must never call askHooks here: hooks() asks questState) */
function lessonAsk(name, ...args){
  for (const h of Object.values(LESSON_HOOKS)){ if (typeof h[name] !== 'function') continue; const r = h[name](...args); if (r !== undefined && r !== null && r !== false) return r; }
  return null;
}
function townOpen(){ return !!lessonAsk('townOpen'); }
const questFree = () => !!lessonAsk('questFree');
function questState(q){
  if (typeof q === 'string') q = questById(q);
  if (!q) return 'locked';
  const r = questPeek(q.id);
  if (r && r.done) return 'done';
  if (!(q.unlock ? q.unlock() : townOpen())) return 'locked';
  if (lessonAsk('questGate', q)) return 'closed';
  if (!questFree() && q.window !== 'any' && q.window !== daytime()) return 'closed';
  return r && r.started ? 'active' : 'open';
}
/* why a quest is closed now (the "!" spot's grey label, the task list) */
function questClosedNote(q){
  const g = lessonAsk('questGate', q); if (g && g.closed) return g.closed;
  if (q.window === 'night') return 'chiuso · apre stasera';
  if (q.window === 'afternoon') return 'chiuso · apre domani';
  return 'chiuso';
}
/* the quests' hooks that are live now: those of open and active quests (registry.js puts them into hooks()) */
var QSYS_HOOK = null, QH_TICK = 0, QH_CACHE = null;
/* hooks() is asked many times a frame (every NPC's scene): the list is worked out once a frame, and again after any save()
   (questHooksBust). Before Lesson 12, with no quest touched, there are none (only the bag's giving hook). */
function questHooksBust(){ QH_TICK++; }
function questHooks(){
  if (QH_CACHE && QH_CACHE.tick === QH_TICK && QH_CACHE.S === S) return QH_CACHE.list;
  const list = questHooks0();
  QH_CACHE = { tick:QH_TICK, S, list };
  return list;
}
function questHooks0(){
  const out = [];
  if (S.lesson < 12 && !S.quests) return QSYS_HOOK ? [QSYS_HOOK] : out;
  for (const q of QUESTS) if (q.hooks){ const s = questState(q); if (s === 'open' || s === 'active'){ q.hooks.quest = q.id; out.push(q.hooks); } }
  if (QSYS_HOOK) out.push(QSYS_HOOK);
  return out;
}
const questCurStep = id => { const q = questById(id), r = questPeek(id); return q && r && r.started && !r.done ? q.steps.find(s => s.id === r.step) || null : null; };
const questAt = (id, stepId) => { const r = questPeek(id); return !!r && r.started && !r.done && r.step === stepId; };
function questStart(id, o = {}){
  const q = questById(id), r = questRec(id);
  if (!q || r.started) return false;
  r.started = true; r.step = q.steps[0].id; save(); renderHUD();
  toast(`New task: <b>${esc(q.title_it)}</b>. It's in your phone: <b>Compiti</b>.`);
  if (o.scheda !== false) questSchedaSoon(id);
  return true;
}
function questStep(id, stepId){ const r = questRec(id); if (r.done) return; r.step = stepId; save(); renderHUD(); }
function questDone(id){
  const q = questById(id), r = questRec(id);
  if (!q || r.done) return false;
  r.started = true; r.done = true; r.step = null;
  const dt = daytime();
  Object.keys(q.items || {}).forEach(bagRemove);
  if (q.onDone) try { q.onDone(); } catch(e){ console.error(e); }
  lessonAsk('onQuestDone', q, r);                       // (Lesson 12 moves the clock on: the stamp shows the new time)
  const c = gameClock();
  r.at = { daytime:dt, clock:c ? clockText(c) : null, lesson:S.lesson };
  save();
  toast(`<b>${esc(q.title_it)}</b>: done! A new stamp in your <b>passport</b>.`);
  renderHUD();
  return true;
}
const questScheda = id => { const q = questById(id); return q && q.scheda ? q.scheda : null; };
/* the quest's scheda is done: its word check and its practice */
const schedaDone = id => { const r = questPeek(id); return !questScheda(id) || !!(r && r.words && r.practice); };
/* the scheda opens as soon as nothing else is open (the conversation that started the quest has closed) */
let QSCHEDA_PENDING = null;
function questSchedaSoon(id){ QSCHEDA_PENDING = id; }
setInterval(() => {
  if (!QSCHEDA_PENDING || introOpen || dialogOpen || modalOpen || traveling || cutsceneOn()) return;
  const id = QSCHEDA_PENDING; QSCHEDA_PENDING = null;
  if (questScheda(id)) openScheda(id);
}, 300);

/* ---------- the bag ---------- */
const bagItems = () => (Array.isArray(S.bag) ? S.bag : []);
const bagHas = id => bagItems().some(b => b.id === id);
const bagGet = id => bagItems().find(b => b.id === id) || null;
/* bagAdd({ id, label_it, label_en, for?, note? }) or bagAdd('caffe', quest) (the quest's items entry) */
function bagAdd(item, q){
  if (typeof item === 'string'){ const d = q && q.items && q.items[item]; if (!d) return false; item = { id:item, ...d, quest:q.id }; }
  if (!Array.isArray(S.bag)) S.bag = [];
  if (bagHas(item.id)) return false;
  S.bag.push({ ...item }); save(); renderHUD();
  return true;
}
function bagRemove(id){ if (!Array.isArray(S.bag)) return; const i = S.bag.findIndex(b => b.id === id); if (i >= 0){ S.bag.splice(i, 1); save(); renderHUD(); } }
function bagSet(id, o){ const b = bagGet(id); if (b){ Object.assign(b, o); save(); } }

/* ---------- the clock and the passport ---------- */
function gameClock(){ const c = lessonAsk('gameClock'); return c && typeof c === 'object' ? c : null; }
const clockText = c => `${String(c.h).padStart(2, '0')}:${String(c.m).padStart(2, '0')}`;
const DAYTIME_IT = { morning:'mattina', afternoon:'pomeriggio', night:'sera' };
function passportStamps(){
  const out = [];
  QUESTS.slice().sort((a, b) => (a.n || 0) - (b.n || 0)).forEach(q => {
    const r = questPeek(q.id); if (!r || !r.done) return;
    const st = q.stamp || {};
    out.push({ id:q.id, title_it:q.title_it, title_en:q.title_en, icon:st.icon || '★', color:st.color || '#1c3d8f', place:st.label || (q.place && q.place.label) || '',
      when:[r.at && r.at.clock, r.at && DAYTIME_IT[r.at.daytime]].filter(Boolean).join(' · ') });
  });
  for (const h of Object.values(LESSON_HOOKS)) if (typeof h.stamps === 'function') (h.stamps() || []).forEach(s => out.push(s));
  /* in the order they were earned: by the time on the stamp (HH:MM at the start of when); stamps without one (free play)
     keep their order, after the others */
  const t = s => { const m = /^(\d\d):(\d\d)/.exec(s.when || ''); return m ? +m[1] * 60 + +m[2] : Infinity; };
  return out.map((s, i) => [s, i]).sort((a, b) => (t(a[0]) - t(b[0])) || (a[1] - b[1])).map(x => x[0]);
}

/* ---------- giving things from the bag in a conversation (the system's own hook, after every quest's) ---------- */
QSYS_HOOK = {
  qsys:true,
  /* "ecco il caffè" → give:caffe; the item alone ("il caffè") → bag:caffe (only while it is in the bag) */
  phrases(){
    const P = [];
    bagItems().forEach(b => { const w = b.label_it.toLowerCase(); P.push(['give:' + b.id, 'ecco ' + w], ['bag:' + b.id, w]); });
    return P;
  },
  /* nobody took it: it is not for them */
  react(id, n, st, add, out){
    if (!id.startsWith('give:') && !id.startsWith('bag:')) return false;
    if (out.qsysGive) return true;
    out.qsysGive = true; out.asked = true;
    const b = bagGet(id.split(':')[1]);
    if (id.startsWith('bag:')){ add(`${cap(b ? b.label_it : '…')}? Sì?`, `${cap(b ? b.label_en : '…')}? Yes?`); out.qsysHint = 'bag'; return true; }
    add(n.formal ? 'Per me? No, grazie: non è per me.' : 'Per me? No, grazie: non è per me!', 'For me? No, thanks: it isn\'t for me.');
    out.qsysHint = 'give';
    return true;
  },
  afterTurn(n, out){
    if (!out.qsysHint || out.end) return false;
    showHint(out.qsysHint === 'bag' ? 'To hand something over, start with the word for <i>here you are</i>: the <b>Nella borsa</b> tiles.' : 'That isn\'t for them. Your phone\'s <b>Compiti</b> says who it is for.');
    return true;
  },
};

/* who gets a quest marker: the givers of open quests, and the person the current step of an active quest needs */
function questMarkerIds(){
  const out = new Set();
  if (S.lesson < 12 && !QUESTS.some(q => questPeek(q.id))) return out;
  QUESTS.forEach(q => { const s = questState(q);
    if (s === 'open' && q.giver) out.add(q.giver);
    if (s === 'active'){ const st = questCurStep(q.id); if (st && st.who) out.add(st.who); } });
  return out;
}
/* for tests: __dbg().quests */
function questDbg(){
  const c = gameClock();
  return { daytime:daytime(), clock:c ? clockText(c) : null, town:townOpen(), free:questFree(), bag:bagItems().map(b => ({ ...b })),
    quests:Object.fromEntries(QUESTS.map(q => { const r = questPeek(q.id) || {}; return [q.id, { state:questState(q), step:r.step || null, done:!!r.done, at:r.at || null, words:!!r.words, practice:!!r.practice, window:q.window }]; })),
    passport:passportStamps().map(s => s.id), spots:typeof mapSpots === 'function' ? mapSpots().map(s => ({ id:s.id, closed:!!s.closed, note:s.note || '' })) : [],
    markers:[...questMarkerIds()], scheda:typeof schedaDbg === 'function' ? schedaDbg() : null, hooks:questHooks().filter(h => h.quest).map(h => h.quest) };
}
/* for tests: finish a quest at once (__debug.questDone('caffe')), start one, set the time of day */
Object.assign(window.__debug, {
  questDone(id){ questRec(id); questDone(id); },
  questStart(id){ questStart(id, { scheda:false }); },
  schedaDone(id){ const r = questRec(id); r.words = r.practice = true; save(); renderHUD(); },   // (tests that play a quest's scheda for real don't use this)
  daytime(d){ S.daytime = d; save(); renderHUD(); },
  bag(item){ return item ? bagAdd(item) : bagItems(); },
});
