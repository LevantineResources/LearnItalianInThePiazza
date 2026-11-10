/* The tile bank (set phrases + context pack) and closeDialog(), which runs tutorial transitions. */

/* ---------- the tile bank: set phrases + the pack for this situation ---------- */
function phraseTile(p){
  const me = S.playerName;
  const words = fill(p.words).split(' ');
  return { key:p.key, label:fill(p.label), gloss:fill(p.en), place:p.place,
    tokens:words.map(w => ({ w:w.toLowerCase(), label:w === me ? w : (/^[A-Z]/.test(w) && w !== words[0] ? w : w.toLowerCase()), name:w === me })) };
}
/* place tiles from lesson hooks: placeTiles() returns [{ key, label, words, en, place:'mercato' }] (place = a PLACES key) */
const hookPlaceTiles = () => { const seen = new Set(); return hooks().flatMap(h => h.placeTiles ? h.placeTiles() || [] : []).filter(t => !seen.has(t.key) && seen.add(t.key)); };
const setPhrases = () => SET_PHRASES.filter(p => !p.from || (p.from === 2 && S.vocab2)).map(phraseTile);
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
  if (bagItems().length && L1done() && n && !n.english && !gs.some(g => g.bag)){
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
  if (!L1done()){
    groups.push({ label:'', tiles:VOCAB1.map(v => ({ w:v.w, label:v.w, gloss:v.en })) });
    groups.push({ label:'', tiles:[{ w:S.playerName.toLowerCase(), label:S.playerName, name:true, gloss:'your name' }, ...names] });
    return groups;
  }
  groups.push({ label:'Frasi fatte', set:true, tiles:setPhrases() });
  { const g = askHooks('bank', n, groups, names); if (g) return g; }
  if (n && n.waiter && S.vocab4){
    groups.push({ label:'Who', tiles:L4_WHO.map(phraseTile) });
    groups.push({ label:'Verbs', tiles:L4_VERBS.map(phraseTile) });
    groups.push({ label:'Asking', tiles:L4_ASK.map(phraseTile) });
    groups.push({ label:'Menu', tiles:L4_MENU.map(phraseTile) });
    groups.push({ label:'Drinks', tiles:L4_DRINKS.map(phraseTile) });
    groups.push({ label:'Ingredients', tiles:L4_INGR.map(phraseTile) });
    return groups;
  }
  if (n && n.barista && S.vocab2){ groups.push({ label:'Al bar', tiles:VOCAB2.map(v => ({ w:v.w, label:v.w, gloss:v.en })) }); if (S.vocab5) groups.push({ label:'Introducing', tiles:L5_TILES.map(phraseTile) }); }
  else if (S.vocab3){
    if (S.vocab5) groups.push({ label:'Introducing', tiles:L5_TILES.map(phraseTile) });
    groups.push({ label:'Asking the way', tiles:DIR_TILES.filter(t => !t.place).map(phraseTile) });
    groups.push({ label:'Places', tiles:[...(S.lesson >= 5 ? [STATUE_TILE] : []), ...DIR_TILES.filter(t => t.place), ...hookPlaceTiles()].map(phraseTile) });
  }
  if (S.vocab5) names.unshift({ w:'mark', label:'Mark', name:true, gloss:'your friend from home' });
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
  unmountDictMap(); setDialogList(null);                    // (the dictated map and the list beside the bank, Lesson 9 on)
  { const cam = $('#dlgCam'); if (cam) cam.remove(); }      // (the camera beside the transcript: quests/08-foto)
  dlg.hidden = true; dialogOpen = false; convoBusy = false;
  if (convo && S.met[convo.npc.id]) S.known[convo.npc.id] = true;
  if (convo) convo.npc.face = { ...convo.npc.baseFace };
  const wasCutscene = convo && convo.mode === 'cutscene';
  const closedId = convo && convo.npc.id, closedDone = convo && convo.done;
  convo = null;
  save(); renderHUD();
  if (askHooks('onClose', closedId, closedDone, wasCutscene)) return;
  if (S.tut === 'meet' && L1_PEOPLE.every(n => S.known[n.id])){ setTut('done'); setTimeout(openComplete1, 350); }
  else if (S.tut === 'l2-order' && S.l2own){ setTut('l2-emma'); toast('Someone by the café tables is waving at you.'); }
  else if (S.tut === 'l2-translate' && S.l2EmmaDone){ setTut('l2-done'); setTimeout(openComplete2, 350); }
  else if (wasCutscene && S.tut === 'l3-done'){ setTimeout(openComplete3, 350); }
  else if (S.tut === 'l4-order' && S.l4.done){ setTut('l4-done'); setTimeout(openComplete4, 350); }
  else if (S.tut === 'l5-statue' && S.l5statue && closedId === 'lucia' && closedDone){ setTut('l5-done'); setTimeout(openComplete5, 350); }
  else if (S.tut === 'l6-order' && S.l6.orderDone){ if (S.practiceDone6) setTut('l6-chiara'); else { setTut('l6-page'); setTimeout(() => { toast('While Enzo makes the cappuccino, you unfold the loose page…'); openHandbook(6); }, 500); } }
  else if (S.tut === 'l6-chiara' && closedId === 'chiara' && closedDone) setTut('l6-rosa');
  else if (S.tut === 'l6-rosa' && closedId === 'rosa' && closedDone) setTut('l6-lucia');
  else if (S.tut === 'l6-lucia' && closedId === 'lucia' && closedDone) setTut('l6-man');
  else if (S.tut === 'l6-man' && closedId === 'bruno' && closedDone){ setTut('l6-bring'); toast('Bruno is following you. Take him to <b>Mark</b> at Bar Centrale.'); }
  else if (S.tut === 'l6-bring' && closedId === 'bruno' && closedDone){ setTut('l6-done'); setTimeout(openComplete6, 350); }
}
