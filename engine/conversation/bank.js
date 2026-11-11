/* The tile bank (set phrases + context pack) and closeDialog(), which runs tutorial transitions (the lessons' onClose
   hooks, then the unit's). */

/* ---------- the tile bank: set phrases + the pack for this situation ---------- */
function phraseTile(p){
  const me = S.playerName;
  const words = fill(p.words).split(' ');
  return { key:p.key, label:fill(p.label), gloss:fill(p.en), place:p.place,
    tokens:words.map(w => ({ w:w.toLowerCase(), label:w === me ? w : (/^[A-Z]/.test(w) && w !== words[0] ? w : w.toLowerCase()), name:w === me })) };
}
/* place tiles from lesson hooks: placeTiles() returns [{ key, label, words, en, place:'mercato' }] (place = a PLACES key) */
const hookPlaceTiles = () => { const seen = new Set(); return hooks().flatMap(h => h.placeTiles ? h.placeTiles() || [] : []).filter(t => !seen.has(t.key) && seen.add(t.key)); };
/* the set phrases shown now: those without from, and those the unit says are open (Padova: from:2, once Lesson 2 is practised) */
const setPhrases = () => SET_PHRASES.filter(p => !p.from || !!unitHook('setPhraseOpen', p)).map(phraseTile);
/* the words a tile says, for comparing tiles across groups */
const tileWords = t => (t.tokens ? t.tokens.map(x => x.w) : [t.w || '']).join(' ');
/* every tile bank, plus the bag (Lesson 12 on): "Nella borsa", Ecco + the items you carry (engine/quests.js). Last, unless
   something in the bag is for this person (an item's for / giveTo): then first, just before the set phrases, where it is seen
   without scrolling the bank */
function bankGroups(){
  const gs = bankGroups0(), n = convo && convo.npc;
  /* Frasi fatte (the set phrases) are in every bank from Lesson 2 on, the little words too (e, poi, ma, quindi, Sì, No, E Lei?,
     Ancora una volta, per favore: content/shared.js): a global rule, not a lesson's. A phrase another group of this bank already
     has (the lesson's own Sì, its E Lei?…) is left out here, so the lesson's tile (and its key) is the one used; a group can
     also hide set phrases on purpose with hide:[keys] (a lesson that makes a point of a missing word) */
  { const set = gs.find(g => g.set);
    if (set){
      const other = new Set(gs.filter(g => g !== set).flatMap(g => g.tiles.map(tileWords)));
      const hide = new Set(gs.flatMap(g => g.hide || []));
      set.tiles = set.tiles.filter(t => !other.has(tileWords(t)) && !hide.has(t.key));
    } }
  if (bagItems().length && unitHook('bankReady') !== false && n && !n.english && !gs.some(g => g.bag)){
    const ecco = { key:'ecco', label:'Ecco', words:'ecco', en:'here is / here you are' };
    /* (one Ecco tile only: when another group already has it, e.g. the station clerk's Comprare, the bag's group has just the items) */
    const hasEcco = gs.some(x => x.tiles.some(t => t.key === 'ecco' || (t.w || '') === 'ecco' || /^ecco$/i.test(t.label || '')));
    const g = { label:'Nella borsa', bag:true, tiles:[...(hasEcco ? [] : [phraseTile(ecco)]), ...bagItems().map(b => ({ ...phraseTile({ key:'bag:' + b.id, label:b.label_it, words:b.label_it, en:b.label_en }), cls:'bagtile' }))] };
    const forThem = bagItems().some(b => b.for === n.id || (b.giveTo || []).includes(n.id));
    /* (before the Frasi fatte: they are long now, with the little words, and the item is what this person is waiting for) */
    if (forThem){ const k = gs.findIndex(x => x.set); gs.splice(k < 0 ? 0 : k, 0, g); } else gs.push(g);
  }
  return gs;
}
function bankGroups0(){
  const n = convo && convo.npc;
  const groups = [];
  const names = [];
  NPCS.forEach(x => { if (S.met[x.id] && !x.english && activeNpcs().includes(x)) names.push({ w:x.name.toLowerCase(), label:x.name, name:true, gloss:x.where }); });
  { const g = unitHook('bankFirst', n, groups, names); if (g) return g; }   // (the unit's own first bank: Padova's Lesson 1, before the set phrases)
  groups.push({ label:'Frasi fatte', set:true, tiles:setPhrases() });
  { const g = askHooks('bank', n, groups, names); if (g) return g; }
  { const g = unitHook('bankMore', n, groups, names); if (g) return g; }       // (the unit's banks: Padova's Lessons 2–6; it may add to groups and names)
  if (names.length) groups.push({ label:'Names', tiles:names });
  return groups;
}
function renderBank(){
  const bank = $('#bank'); bank.innerHTML = '';
  bankGroups().forEach(g => {
    if (g.label){ const l = document.createElement('span'); l.className = 'bank-label'; l.textContent = g.label; bank.appendChild(l); }
    g.tiles.forEach(t => {
      const b = document.createElement('button');
      b.className = 'tile' + (t.name ? ' name' : '') + (t.tokens ? ' phrase' : '') + (t.place ? ' place' : '') + (t.cls ? ' ' + t.cls : '');
      b.textContent = t.label; b.title = t.gloss;
      b.onclick = () => { if (!convo || convoBusy) return; convo.words.push(t); renderSentence(); };
      bank.appendChild(b);
    });
  });
  /* a new conversation starts at the top of the bank (again once the dialog is shown: a hidden box keeps its old scroll) */
  if (bank.forConvo !== convo){ const c = bank.forConvo = convo; bank.scrollTop = 0; requestAnimationFrame(() => { if (bank.forConvo === c) bank.scrollTop = 0; }); }
}
function renderSentence(){
  const s = $('#sentence'); s.innerHTML = '';
  if (!convo) return;
  convo.words.forEach((t, i) => {
    const b = document.createElement('button');
    b.className = 'tile' + (t.name ? ' name' : '') + (t.tokens ? ' phrase' : '') + (t.place ? ' place' : '') + (t.cls ? ' ' + t.cls : ''); b.textContent = t.label; b.title = 'Remove';
    b.onclick = () => { convo.words.splice(i, 1); renderSentence(); };
    s.appendChild(b);
  });
}
$('#btnSay').onclick = submit;
$('#btnClear').onclick = () => { if (convo){ convo.words = []; renderSentence(); } };
$('#dlgClose').onclick = () => closeDialog();

function closeDialog(){
  if (!dialogOpen) return;
  clearDisplayQueue(); $('#btnSay').classList.remove('waiting'); closeNumberPad(); closeNotebookAsk(); typer.hidden = true;
  unmountDictMap(); unmountTraceMap(); closeCompass(); setDialogList(null);   // (the dictated map, a traced route, the compass, the list beside the bank)
  { const cam = $('#dlgCam'); if (cam) cam.remove(); }      // (the camera beside the transcript: quests/08-foto)
  dlg.hidden = true; dialogOpen = false; convoBusy = false;
  if (convo && S.met[convo.npc.id]) S.known[convo.npc.id] = true;
  if (convo) convo.npc.face = { ...convo.npc.baseFace };
  const wasCutscene = convo && convo.mode === 'cutscene';
  const closedId = convo && convo.npc.id, closedDone = convo && convo.done;
  convo = null;
  save(); renderHUD();
  if (askHooks('onClose', closedId, closedDone, wasCutscene)) return;
  unitHook('closed', closedId, closedDone, wasCutscene);    // (the unit's tutorial transitions: Padova's Lessons 1–6)
}
