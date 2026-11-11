/* The skill tree (Unit 2 on: docs/unit-2-venezia.md, "The skill tree"; CLAUDE.md, "The skill tree"). Generic: a unit registers its
   districts' trees as data, TREE.push(district); the engine works out each node's state, keeps what is done in the save, opens the
   next district at the gate, and shows the tree in the handbook (ui/tree.js: the Albero page, the map's pins, fast travel).

   A district: { id (1, 2…, in the order they open), title (Italian: 'San Marco e Castello'), sub? (English), theme?, next? (the next
     district's name, for the gate's line), nodes:[node…] }.
   A node: { id (unique in the unit), title (Italian), en (a short English line), parent (an id; null for a core node, the district's
     main lesson), depth (1–4: a core node is 1, its first branch nodes 2…), words? ([{ it, en, g?, note?, say? }], the Vocabolario's
     word format) or count? (a number, when the list is not written yet), person:{ name, npc? (an NPC id) }, place:{ name, … (the
     rest is the unit's: UNIT.treePlace(node) turns it into a point) }, where? (English: what to do there), lesson? (n: the node IS
     main lesson n; its words are then the chapter's Vocabolario once it has one) | quest? (a quest id: done when the quest is),
     continues? (a node of an earlier district: part 2 opens only once part 1 is done), soon? (true or html: "Coming soon", its task
     is not written yet), placeholder? (true: a stand-in for the designer's later content) }.
   The rules (treeLint(), tests/venezia/tree.js): unique ids; a strict chain (every parent exists, in the same district, one level up);
   depth ≤ TREE_MAX_DEPTH; continues names a node of an earlier district; sibling branches share no words.

   State: locked, open or done (treeState(id)). Done is kept in the save (S.tree.done = { id:time }; lazy, not in FRESH()), or comes
   from the node's lesson (lessonCompleted) or quest (done). Open: its parent is done (a core node: its district is open, and its lesson
   has begun, S.lesson ≥ lesson), and the node it continues is done. Otherwise locked (treeLockedBy(node) says why).
   The gate: every node of levels 1 and 2 of a district done → the next district opens (treeGateOpen(district), treeGate(district)).
   treeDone(id) marks a node done (a lesson calls it when it completes: Venezia's Lesson 3, node v3), then asks UNIT.onTreeDone(node,
   opened) and every hook's onTreeDone(node, opened) (opened: the nodes it opened). */
const TREE_MAX_DEPTH = 4, TREE_GATE_DEPTH = 2;
const TREE = [];
const TREE_NODE = {};             // every node by id (filled as districts are pushed)
/* a district pushed is adopted: its nodes indexed, and a fast-travel place for each (a done node joins fast travel: ui/tree.js) */
TREE.push = function(...ds){ ds.forEach(treeAdopt); return Array.prototype.push.apply(this, ds); };
function treeAdopt(D){
  (D.nodes || (D.nodes = [])).forEach(n => { n.district = D.id; if (n.parent === undefined) n.parent = null; TREE_NODE[n.id] = n; treeDest(n); });
}
const treeNode = id => TREE_NODE[id] || null;
const treeDistrict = id => TREE.find(D => D.id === id) || null;
const treeNodes = () => TREE.flatMap(D => D.nodes);
const treeChildren = id => treeNodes().filter(n => n.parent === id);
/* the save: S.tree = { done:{ id:time }, seen:{ id:cards seen }, unseen (something opened since the Albero was last looked at), point } */
const treePeek = () => S.tree && typeof S.tree === 'object' ? S.tree : null;
function treeRec(){ const R = treePeek() || (S.tree = {}); R.done = R.done || {}; R.seen = R.seen || {}; return R; }

/* ---------- states ---------- */
const treeIsDone = n => !!n && (!!((treePeek() || {}).done || {})[n.id] || (!!n.lesson && lessonCompleted(n.lesson)) || (!!n.quest && !!(questPeek(n.quest) || {}).done));
/* why a node is locked, or null: { kind:'parent', node } · { kind:'continues', node } · { kind:'district', district (the one before) } · { kind:'lesson', n } */
function treeLockedBy(n){
  if (n.parent){ const p = treeNode(n.parent); if (!treeIsDone(p)) return { kind:'parent', node:p }; }
  else if (!treeDistrictOpen(n.district)){ const i = TREE.findIndex(D => D.id === n.district); return { kind:'district', district:TREE[i - 1] || null }; }
  if (n.continues){ const c = treeNode(n.continues); if (!treeIsDone(c)) return { kind:'continues', node:c }; }
  if (n.lesson && S.lesson < n.lesson) return { kind:'lesson', n:n.lesson };
  return null;
}
function treeState(id){ const n = typeof id === 'string' ? treeNode(id) : id; if (!n) return null; return treeIsDone(n) ? 'done' : treeLockedBy(n) ? 'locked' : 'open'; }
const treeOpenIds = () => treeNodes().filter(n => treeState(n) === 'open').map(n => n.id);
/* a district is open when it is the first, or the one before it has met its gate */
function treeDistrictOpen(id){ const i = TREE.findIndex(D => D.id === id); return i === 0 || (i > 0 && treeGateOpen(TREE[i - 1].id)); }
/* the gate: levels 1 and 2 of a district → { done, total, open, ids } */
function treeGate(id){
  const D = treeDistrict(id); if (!D) return null;
  const ns = D.nodes.filter(n => n.depth <= TREE_GATE_DEPTH), done = ns.filter(treeIsDone).length;
  return { done, total:ns.length, open:ns.length > 0 && done === ns.length, ids:ns.map(n => n.id) };
}
const treeGateOpen = id => { const g = treeGate(id); return !!g && g.open; };

/* ---------- words and strength ---------- */
/* a node's words: its lesson's Vocabolario (once the chapter has one), else its own list */
function treeWords(n){
  if (n.lesson && LESSONS[n.lesson - 1] && hasVocabCheck(n.lesson)) return vocabWords(n.lesson).map(w => ({ it:w.it, en:w.en, g:w.g, note:w.note, say:w.say }));
  return (n.words || []).map(w => ({ ...w }));
}
const treeWordCount = n => treeWords(n).length || n.count || 0;
/* the strength meter: from the quizzes, word checks and flashcards (the weak-word record, S.study: a word is full after three more
   right answers than wrong ones); with no record yet, the words seen (a done node's are all seen; else the flashcards turned).
   → { v (0–1), from:'practice' | 'seen', seen, total } or null (no words yet) */
function treeStrength(n){
  const W = treeWords(n); if (!W.length) return null;
  const R = S.study || {}, recs = W.map(w => R[studyKey(w.it)]);
  if (recs.some(Boolean)){
    const v = recs.reduce((a, r) => a + (r ? Math.max(0, Math.min(1, (r.right - r.wrong) / 3)) : 0), 0) / W.length;
    return { v, from:'practice', seen:recs.filter(Boolean).length, total:W.length };
  }
  const seen = treeIsDone(n) ? W.length : Math.min(W.length, ((treePeek() || {}).seen || {})[n.id] || 0);
  return { v:seen / W.length, from:'seen', seen, total:W.length };
}

/* ---------- done ---------- */
/* mark a node done (a lesson's or a quest's end). A locked node is not marked (false); o.quiet: no toast */
function treeDone(id, o = {}){
  const n = treeNode(id); if (!n) return false;
  if (treeState(n) === 'locked' && !o.force) return false;
  const before = new Set(treeOpenIds()), gateWas = treeGateOpen(n.district), R = treeRec();
  if (!R.done[id]) R.done[id] = Date.now();
  const opened = treeOpenIds().filter(x => !before.has(x)).map(treeNode);
  if (opened.length) R.unseen = true;
  save(); if (typeof fastKnown === 'function') fastKnown();
  if (!o.quiet){
    const gate = !gateWas && treeGateOpen(n.district), D = treeDistrict(n.district);
    toast(`<b>Albero · ${esc(n.title)}</b> done!` + (opened.length ? ` Now open: ${opened.map(x => `<i>${esc(x.title)}</i>`).join(' and ')}.` : '')
      + (gate && D ? ` <b>Per il prossimo sestiere: ${treeGate(D.id).total}/${treeGate(D.id).total}</b>${D.next ? `: ${esc(D.next)} opens` : ''}.` : ''));
  }
  unitHook('onTreeDone', n, opened);
  hooksEach('onTreeDone', n, opened);
  renderHUD();
  if (typeof treeRefresh === 'function') treeRefresh();
  return true;
}

/* ---------- the rules (tests; authors): [problems] ---------- */
function treeLint(){
  const P = [], ids = new Set(), all = treeNodes();
  all.forEach(n => {
    if (ids.has(n.id)) P.push(`${n.id}: the id is used twice`); ids.add(n.id);
    ['title', 'en'].forEach(f => { if (!n[f]) P.push(`${n.id}: no ${f}`); });
    if (!n.person || !n.person.name) P.push(`${n.id}: no person`);
    if (!n.place || !n.place.name) P.push(`${n.id}: no place`);
    if (!(n.depth >= 1 && n.depth <= TREE_MAX_DEPTH)) P.push(`${n.id}: depth ${n.depth} (1–${TREE_MAX_DEPTH})`);
    if (n.parent == null){ if (n.depth !== 1) P.push(`${n.id}: no parent but depth ${n.depth}`); }
    else {
      const p = treeNode(n.parent);
      if (!p) P.push(`${n.id}: its parent ${n.parent} does not exist`);
      else { if (p.district !== n.district) P.push(`${n.id}: its parent ${p.id} is in another district`); if (n.depth !== p.depth + 1) P.push(`${n.id}: depth ${n.depth}, its parent's is ${p.depth}`); }
    }
    if (n.lesson && n.depth !== 1) P.push(`${n.id}: a lesson node is a core node (depth 1)`);
    if (n.continues){ const c = treeNode(n.continues), i = TREE.findIndex(D => D.id === n.district);
      if (!c) P.push(`${n.id}: continues ${n.continues}, which does not exist`);
      else if (TREE.findIndex(D => D.id === c.district) >= i) P.push(`${n.id}: continues ${c.id}, which is not in an earlier district`); }
    const seen = new Set(); treeWords(n).forEach(w => { const k = studyKey(w.it); if (seen.has(k)) P.push(`${n.id}: the word ${w.it} twice`); seen.add(k); });
  });
  /* sibling branches share no words: each child's whole branch against its siblings' */
  const branch = n => [n, ...treeChildren(n.id).flatMap(branch)];
  const keys = n => new Set(branch(n).flatMap(x => treeWords(x).map(w => studyKey(w.it))));
  all.concat([{ id:null }]).forEach(par => {
    const kids = par.id === null ? [] : treeChildren(par.id);
    for (let a = 0; a < kids.length; a++) for (let b = a + 1; b < kids.length; b++){
      const A = keys(kids[a]), shared = [...keys(kids[b])].filter(k => A.has(k));
      if (shared.length) P.push(`${kids[a].id} and ${kids[b].id} (siblings) share words: ${shared.join(', ')}`);
    }
  });
  return P;
}
