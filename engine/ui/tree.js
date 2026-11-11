/* The skill tree in the handbook: the Albero page (core/tree.js has the data, the states and the gate). Generic: no unit's content.
   - The handbook's tabs row gets an "Albero" tab after the chapter's own (hbTreeButton(), when the unit has a tree and
     UNIT.treeShown() is not false); hbTab 'albero' shows the page (renderTree()): the gate's line (Per il prossimo sestiere: 1/3), the
     district's tree drawn top-down (the core node at the top, its branches below, with connectors; on a narrow screen an indented
     list), each node a card: its level, its state, its title and line, its word count and strength meter, and where its person is.
   - Tapping a node opens its panel over the page: open → where to go, and Sulla mappa (the unit's map, the pin picked out: UNIT.openMap
     ({ focus:'tree-<id>' })); done → its words as flashcards (Lo so! / Non ancora count in the weak-word record, S.study, and so in the
     meter); locked → what opens it (the parent, with a button to it; the lesson; the district before).
   - handbookPointTo('albero', { line }): the Albero tab highlighted with a short line under it (a lesson's handbook chapter ends
     with it: Venezia's Lesson 3), until the player opens it; kept in the save (S.tree.point).
   - The map: treePins() → [{ id:'tree-<id>', node, label, x, y }], the open nodes at UNIT.treePlace(node) → { x, y, scene, name }.
   - Fast travel: each node is a DEST (key 'tree-<id>'), offered once the node is done.
   Tests: __dbg().tree; __debug.treeDone(id, { strict? }) (the node and the path above it; strict: the engine's treeDone only), __debug.treeReset(), __debug.treePoint(line?),
   __debug.treeOpen(id?) (the handbook at the Albero, a node's panel open), __debug.treeAddDistrict(d) (tests: a district of test data);
   window.__treeData(), window.__treeLint(). */
const TREEUI = { district:null, sel:null, cards:null };
const treeShown = () => TREE.length > 0 && unitHook('treeShown') !== false;
/* the district the page shows: the one picked, else the latest open one */
const treeCurDistrict = () => { const D = treeDistrict(TREEUI.district); if (D && treeDistrictOpen(D.id)) return D; return [...TREE].reverse().find(x => treeDistrictOpen(x.id)) || TREE[0] || null; };
const TREE_ICON = '<svg class="al-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22v-7m0 0-4-3m4 3 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.5" r="5.5" fill="currentColor" opacity=".9"/><circle cx="6.5" cy="12" r="3" fill="currentColor" opacity=".7"/><circle cx="17.5" cy="11" r="3.2" fill="currentColor" opacity=".7"/></svg>';
const TREE_PIN = '<svg class="al-pin" viewBox="0 0 16 20" aria-hidden="true"><path d="M8 19C3 12 2 10 2 7.5a6 6 0 0 1 12 0C14 10 13 12 8 19z" fill="currentColor"/><circle cx="8" cy="7.5" r="2.3" fill="#fffdf8"/></svg>';
const TREE_LOCK = '<svg class="al-lock" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="8" rx="1.5" fill="currentColor"/><path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0V7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
const TREE_STATE_IT = { done:'Fatto', open:'Aperto', locked:'Chiuso' };

/* ---------- the handbook's button, and pointing to it ---------- */
function hbTreeButton(){
  if (!treeShown() || loosePage()) return '';
  const R = treePeek() || {}, P = R.point && R.point.what === 'albero' ? R.point : null, D = treeCurDistrict(), g = D ? treeGate(D.id) : null;
  return `<button data-albero role="tab" class="hb-al-btn${P ? ' hb-point' : ''}${R.unseen ? ' has-new' : ''}" aria-selected="${hbTab === 'albero'}" aria-pressed="${hbTab === 'albero'}" title="The Albero: tasks that branch off the lessons">${TREE_ICON}Albero${g ? ` <span class="hb-al-n">${g.done}/${g.total}</span>` : ''}${P ? `<span class="hb-point-line" role="status">${P.line}</span>` : ''}</button>`;
}
/* highlight a tab of the handbook's tabs row with a short line ('albero': the skill tree), until the player opens it */
function handbookPointTo(what, o = {}){
  if (what !== 'albero' || !treeShown()) return false;
  treeRec().point = { what, line:o.line || 'New: <b>the Albero</b>, your skill tree. Tap it!' }; save();
  const b = modalOpen && sheet.classList.contains('book') ? sheet.querySelector('[data-albero]') : null;
  if (b){ b.outerHTML = hbTreeButton(); hbAfterRender(); }
  else if (!o.quiet) toast(`${treeRec().point.line} <span class="hb-small">(the handbook, <kbd>H</kbd>)</span>`);
  return true;
}
/* the handbook at the Albero (a node's panel open) */
function openAlbero(id){ if (modalOpen && !sheet.classList.contains('book')) closeModal(); TREEUI.sel = id && treeNode(id) ? id : null; TREEUI.cards = null; if (id && treeNode(id)) TREEUI.district = treeNode(id).district; openHandbook(null, { tab:'albero' }); }

/* ---------- the page ---------- */
function renderTree(){
  const R = treePeek();
  if (R && (R.unseen || R.point)){ delete R.unseen; delete R.point; save(); }
  const D = treeCurDistrict(); if (!D){ hbTab = 'lesson'; renderHandbook(); return; }
  TREEUI.district = D.id;
  const g = treeGate(D.id), roots = D.nodes.filter(n => !n.parent);
  const chips = TREE.length > 1 ? `<div class="al-districts" role="group" aria-label="Districts">${TREE.map((x, i) => { const on = treeDistrictOpen(x.id);
    return `<button data-al-district="${x.id}" aria-pressed="${x.id === D.id}" ${on ? '' : 'disabled title="Opens at the gate of the district before"'}>${i + 1} · ${esc(x.title)}${on ? '' : ' ' + TREE_LOCK}</button>`; }).join('')}</div>` : '';
  const pips = g.ids.map(id => `<i class="${treeIsDone(treeNode(id)) ? 'on' : ''}" title="${esc(treeNode(id).title)}"></i>`).join('');
  const nextName = D.next ? `<i>${esc(D.next)}</i>` : 'the next district';
  sheet.innerHTML = `
    ${hbHead({ title:`L'albero · <em>${esc(D.title)}</em>`, tabs:hbTabs() })}
    <div class="sheet-body al-body" id="hbBody">
      <p class="hb-about">${esc(D.sub || 'The Albero: tasks that branch off the lessons')}</p>
      ${chips}
      <div class="al-gate${g.open ? ' met' : ''}">
        <div class="al-gate-row"><b class="al-gate-t">Per il prossimo sestiere: ${g.done}/${g.total}</b><span class="al-pips" aria-hidden="true">${pips}</span></div>
        <p class="note">${g.open ? `<b>Gate met!</b> ${nextName} can open. The deeper nodes here stay open for you.`
          : `Finish levels 1 and 2 (the lesson at the top and the nodes right under it) to open ${nextName}. The deeper nodes stay open after that.`}</p>
      </div>
      <p class="note al-how">Each node is a task: a person in a place, and up to 20 new words. A node opens when the one above it is done. Tap one.</p>
      <div class="al-wrap"><ul class="albero">${roots.map(treeLi).join('')}</ul></div>
      <p class="al-key note"><span class="tk done"></span> Fatto · done <span class="tk open"></span> Aperto · open <span class="tk locked"></span> Chiuso · locked</p>
    </div>
    <div class="al-panel-wrap" id="treePanelWrap" ${TREEUI.sel ? '' : 'hidden'}><div class="al-backdrop" data-al-close></div><section class="al-panel" id="treePanel" role="dialog" aria-label="Node"></section></div>`;
  treeGateLine();
  if (TREEUI.sel) renderTreePanel();
  hbAfterRender();
}
/* the gate drawn across the tree, under level 2 (the wide layout only) */
function treeGateLine(){
  const wrap = sheet.querySelector('.al-wrap'); if (!wrap || (window.matchMedia && matchMedia('(max-width:640px)').matches)) return;
  const gate = [...wrap.querySelectorAll('.tn.gate')], deeper = [...wrap.querySelectorAll('.tn:not(.gate)')];
  if (!gate.length || !deeper.length) return;
  const top = wrap.getBoundingClientRect().top - wrap.scrollTop, a = Math.max(...gate.map(b => b.getBoundingClientRect().bottom)), b = Math.min(...deeper.map(x => x.getBoundingClientRect().top));
  if (b <= a) return;
  const D = treeCurDistrict(), g = D ? treeGate(D.id) : null, el = document.createElement('div');
  el.className = 'al-gate-line' + (g && g.open ? ' met' : ''); el.style.top = Math.round(a + 21 - top) + 'px';
  el.innerHTML = `<span>${g && g.open ? '✓ ' : '↑ '}Per il prossimo sestiere · ${g ? g.done + '/' + g.total : ''}</span>`;
  wrap.appendChild(el);
  /* the label in the widest gap between the connectors that cross the line (the level-2 cards' middles) */
  const wl = wrap.getBoundingClientRect().left - wrap.scrollLeft;
  const lv2 = [...wrap.querySelectorAll('li.lv-2 > .tn')].map(x => x.getBoundingClientRect().left + x.offsetWidth / 2 - wl).sort((p, q) => p - q), edges = [0, ...lv2, wrap.scrollWidth];
  let best = [0, 0]; for (let i = 1; i < edges.length; i++) if (edges[i] - edges[i - 1] > best[1] - best[0]) best = [edges[i - 1], edges[i]];
  const sp = el.firstChild; sp.style.left = Math.round((best[0] + best[1]) / 2 - sp.offsetWidth / 2) + 'px';
}
function treeLi(n){
  const kids = treeChildren(n.id), st = treeState(n);
  return `<li class="tl-${st} lv-${n.depth}">${treeCard(n)}${kids.length ? `<ul>${kids.map(treeLi).join('')}</ul>` : ''}</li>`;
}
function treeMeter(n, cls = ''){
  const s = treeStrength(n); if (!s) return '';
  const pct = Math.round(s.v * 100), tip = s.from === 'practice' ? `Strength ${pct}%: from your quizzes and flashcards` : `${s.seen}/${s.total} words seen`;
  return `<span class="tn-meter ${s.from} ${cls}" title="${tip}" aria-label="${tip}"><i style="width:${pct}%"></i></span>`;
}
const treeWordsLabel = n => { const k = treeWordCount(n); return n.soon && !k ? 'Coming soon' : k ? `${k} parole` : 'Coming soon'; };
function treeCard(n){
  const st = treeState(n), sel = TREEUI.sel === n.id;
  const lv = n.lesson ? `Lezione ${n.lesson}` : `Livello ${n.depth}`;
  return `<button class="tn tn-${st}${sel ? ' sel' : ''}${n.depth <= TREE_GATE_DEPTH ? ' gate' : ''}" data-al-node="${esc(n.id)}" aria-label="${esc(n.title)}: ${TREE_STATE_IT[st]}">
      <span class="tn-top"><span class="tn-lv">${lv}</span><span class="tn-st">${st === 'done' ? '✓ ' : st === 'locked' ? TREE_LOCK : ''}${TREE_STATE_IT[st]}</span></span>
      <span class="tn-t">${esc(n.title)}</span>
      <span class="tn-en">${esc(n.en)}</span>
      <span class="tn-meta"><span class="tn-w">${treeWordsLabel(n)}</span>${treeMeter(n)}</span>
      <span class="tn-who">${TREE_PIN}<span>${esc(n.person.name)} · ${esc(n.place.name)}</span></span>
    </button>`;
}

/* ---------- a node's panel ---------- */
function renderTreePanel(){
  const el = $('#treePanel'), wrap = $('#treePanelWrap'), n = treeNode(TREEUI.sel);
  if (!el || !wrap) return;
  sheet.querySelectorAll('.tn.sel').forEach(b => b.classList.remove('sel'));
  if (!n){ wrap.hidden = true; return; }
  const b = sheet.querySelector(`[data-al-node="${CSS.escape(n.id)}"]`); if (b) b.classList.add('sel');
  wrap.hidden = false;
  const st = treeState(n), k = treeWordCount(n), s = treeStrength(n);
  const head = `<button class="x tp-x" data-al-close aria-label="Close">×</button>
    <p class="kicker">${n.lesson ? `Lezione ${n.lesson} · ` : ''}Livello ${n.depth} · ${TREE_STATE_IT[st]}${n.placeholder ? ' · placeholder' : ''}</p>
    <h3 class="tp-t">${esc(n.title)}</h3><p class="sub">${esc(n.en)}</p>`;
  const who = `<p class="tp-who">${TREE_PIN}<span><b>${esc(n.person.name)}</b> · ${esc(n.place.name)}</span></p>`;
  const fromLesson = n.lesson && LESSONS[n.lesson - 1] && hasVocabCheck(n.lesson);
  const words = `<p class="tp-words">${k ? `<b>${k}</b> ${fromLesson ? 'words in its Vocabolario' : 'new words'}` : 'Its words: coming soon'}${s ? ` · ${s.from === 'practice' ? `strength <b>${Math.round(s.v * 100)}%</b>` : `<b>${s.seen}/${s.total}</b> seen`} ${treeMeter(n, 'big')}` : ''}</p>`;
  let body = '';
  if (st === 'open'){
    body = `<h4>Dove andare · where to go</h4>${who}
      ${n.where ? `<p>${n.where}</p>` : ''}
      ${n.soon ? `<p class="tp-soon"><b>Coming soon.</b> ${n.soon === true ? 'This task is still being written: its person is not there yet.' : n.soon}</p>` : ''}
      ${words}
      <div class="cta"><button class="btn primary" data-al-map="${esc(n.id)}">${TREE_PIN}Show it on the map</button><button class="btn" data-al-close>Back to the Albero</button></div>`;
    TREEUI.panel = { id:n.id, state:st, kind:'where' };
  } else if (st === 'locked'){
    const why = treeLockedBy(n);
    const line = why.kind === 'parent' ? `Opens when you finish <b><i>${esc(why.node.title)}</i></b>, the node above it (Livello ${why.node.depth}).`
      : why.kind === 'continues' ? `Part 2: opens once you have done <b><i>${esc(why.node.title)}</i></b>${treeDistrict(why.node.district) ? ` (${esc(treeDistrict(why.node.district).title)})` : ''}.`
      : why.kind === 'lesson' ? `Opens with <b>Lezione ${why.n}${LESSONS[why.n - 1] ? ` · <i>${esc(LESSONS[why.n - 1].title)}</i>` : ''}</b>${why.n > 1 ? `, after Lezione ${why.n - 1}` : ''}.`
      : `Opens at the gate of ${why.district ? `<b>${esc(why.district.title)}</b>` : 'the district before'}: levels 1 and 2 done there.`;
    const go = why.node ? `<button class="btn primary" data-al-go="${esc(why.node.id)}">Go to <i>${esc(why.node.title)}</i></button>` : '';
    body = `<h4>${TREE_LOCK} Chiuso · locked</h4><p class="tp-why">${line}</p>${who}${words}<div class="cta">${go}<button class="btn" data-al-close>Back to the Albero</button></div>`;
    TREEUI.panel = { id:n.id, state:st, kind:'locked', by:why.node ? why.node.id : why.kind };
  } else {
    body = `${words}${treeCardsHTML(n)}${who}`;
    TREEUI.panel = { id:n.id, state:st, kind:'cards' };
  }
  el.innerHTML = head + body;
  el.className = 'al-panel tp-' + st;
}

/* ---------- a done node's words as flashcards: turn over, then Lo so! / Non ancora (the weak-word record, S.study) ---------- */
function treeCardsHTML(n){
  const W = treeWords(n);
  if (!W.length) return `<p class="tp-soon">Its words are coming soon.</p>`;
  const C = TREEUI.cards && TREEUI.cards.id === n.id ? TREEUI.cards : (TREEUI.cards = { id:n.id, i:0, flipped:false, knew:0, done:false });
  if (C.done) return `<div class="tp-cards tp-end"><p class="tp-end-t"><b>${W.length} cards.</b> You knew ${C.knew}. ${C.knew === W.length ? 'Perfetto!' : 'The others count as weak words in Studio for now.'}</p>
      <div class="cta"><button class="btn primary" data-al-card="again">Again</button></div></div>`;
  const w = W[C.i];
  const front = `<span class="tp-it">${esc(w.it)}${vcBadge(w.g)}</span>`;
  const back = `<span class="tp-it small">${esc(w.it)}</span><span class="tp-en">${esc(w.en)}</span>${w.note ? `<span class="tp-note">${esc(w.note)}</span>` : ''}`;
  return `<div class="tp-cards">
      <p class="tp-count"><b>${C.i + 1}</b> / ${W.length} · flashcards</p>
      <div class="tp-card${C.flipped ? ' flipped' : ''}" data-al-card="flip" role="button" tabindex="0" aria-label="Turn the card over">${C.flipped ? back : front}
        <button class="play" data-say="${esc(vcSay(w))}" aria-label="Play: ${esc(w.it)}">${SPK}</button></div>
      <div class="cta">${C.flipped ? `<button class="btn" data-al-card="no">Non ancora · not yet</button><button class="btn primary" data-al-card="yes">Lo so! · I knew it</button>`
        : `<button class="btn" data-al-card="prev" ${C.i ? '' : 'disabled'}>← Back</button><button class="btn primary" data-al-card="flip">Turn over</button>`}</div>
    </div>`;
}
function treeCardAct(a){
  const n = treeNode(TREEUI.sel), C = TREEUI.cards; if (!n || !C) return;
  const W = treeWords(n), w = W[C.i];
  if (a === 'flip'){ C.flipped = !C.flipped; const R = treeRec(); R.seen[n.id] = Math.max(R.seen[n.id] || 0, C.i + 1); save(); if (!C.flipped) speak(vcSay(w)); }
  else if (a === 'prev'){ if (C.i) { C.i--; C.flipped = false; } }
  else if (a === 'yes' || a === 'no'){
    studyRecord(w, a === 'yes'); if (a === 'yes') C.knew++;
    save();
    if (C.i >= W.length - 1) C.done = true; else { C.i++; C.flipped = false; speak(vcSay(W[C.i])); }
  }
  else if (a === 'again') TREEUI.cards = { id:n.id, i:0, flipped:false, knew:0, done:false };
  renderTreePanel();
  /* the meter on the card behind */
  const b = sheet.querySelector(`[data-al-node="${CSS.escape(n.id)}"]`); if (b){ const m = b.querySelector('.tn-meter'), nm = treeMeter(n); if (m && nm) m.outerHTML = nm; }
}
/* the open Albero page, drawn again (a node done while it is open) */
function treeRefresh(){ if (modalOpen && sheet.classList.contains('book') && hbTab === 'albero') renderTree(); }

/* ---------- the map: pins for the open nodes; "show it on the map" ---------- */
function treePlaceOf(n){ try { return unitHook('treePlace', n) || null; } catch(e){ return null; } }
function treePins(){
  if (!treeShown()) return [];
  return treeNodes().filter(n => treeState(n) === 'open').map(n => { const p = treePlaceOf(n); return p ? { id:'tree-' + n.id, node:n.id, label:n.title, x:p.x, y:p.y, labelAt:p.labelAt } : null; }).filter(Boolean);
}
function treeShowOnMap(id){
  const n = treeNode(id); if (!n) return;
  closeModal();
  if (!introOpen) unitHook('openMap', { focus:'tree-' + id });
}
/* fast travel: a node's place, offered once it is done (engine world/fasttravel.js) */
function treeDest(n){
  if (DESTS.some(d => d.key === 'tree-' + n.id)) return;
  DESTS.push({ key:'tree-' + n.id, get label(){ return `${n.title} (${n.place.name})`; }, sub:'Albero · ' + n.en, face:{ x:0, y:-1 },
    get scene(){ const p = treePlaceOf(n); return p ? p.scene : S.scene; }, get spawn(){ const p = treePlaceOf(n); return p ? { x:p.x, y:p.y } : null; },
    ok:() => treeState(n) === 'done',
    here:() => { const p = treePlaceOf(n); return !p || (p.scene === S.scene && Math.hypot(player.x - p.x, player.y - p.y) < 240); } });
}

/* ---------- input ---------- */
sheet.addEventListener('click', e => {
  if (!modalOpen) return;
  const back = e.target.closest('[data-al-back]'); if (back){ e.stopPropagation(); openAlbero(back.dataset.alBack || null); return; }
  if (!sheet.classList.contains('book')) return;
  if (e.target.closest('[data-albero]')){ e.stopPropagation(); hbTab = 'albero'; TREEUI.sel = null; TREEUI.cards = null; renderHandbook(); return; }
  if (hbTab !== 'albero') return;
  if (e.target.closest('[data-say]')) return;                       // a play button (ui/handbook.js speaks it)
  const dist = e.target.closest('[data-al-district]'); if (dist && !dist.disabled){ TREEUI.district = +dist.dataset.alDistrict; TREEUI.sel = null; renderTree(); return; }
  const card = e.target.closest('[data-al-card]'); if (card && !card.disabled){ treeCardAct(card.dataset.alCard); return; }
  const node = e.target.closest('[data-al-node]'); if (node){ TREEUI.sel = node.dataset.alNode; TREEUI.cards = null; renderTreePanel(); return; }
  const go = e.target.closest('[data-al-go]'); if (go){ TREEUI.sel = go.dataset.alGo; TREEUI.cards = null; renderTreePanel(); return; }
  const map = e.target.closest('[data-al-map]'); if (map){ treeShowOnMap(map.dataset.alMap); return; }
  if (e.target.closest('[data-al-close]')){ TREEUI.sel = null; TREEUI.cards = null; renderTreePanel(); return; }
});
/* Space / Enter turn a flashcard over (when no button has the focus) */
document.addEventListener('keydown', e => {
  if (!modalOpen || hbTab !== 'albero' || !sheet.classList.contains('book') || !TREEUI.cards || TREEUI.cards.done || TREEUI.cards.id !== TREEUI.sel) return;
  if (e.target.closest && e.target.closest('#sheet button, #sheet input')) return;
  if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); treeCardAct('flip'); }
});

/* ---------- tests ---------- */
function treeDbg(){
  const nodes = {};
  treeNodes().forEach(n => { const s = treeStrength(n); nodes[n.id] = { state:treeState(n), depth:n.depth, parent:n.parent, district:n.district, words:treeWordCount(n),
    strength:s ? { v:Math.round(s.v * 100) / 100, from:s.from, seen:s.seen } : null, soon:!!n.soon, placeholder:!!n.placeholder }; });
  const R = treePeek() || {}, open = modalOpen && sheet.classList.contains('book') && hbTab === 'albero';
  return { shown:treeShown(), districts:TREE.map(D => ({ id:D.id, title:D.title, open:treeDistrictOpen(D.id), gate:treeGate(D.id) })), nodes,
    gate:Object.fromEntries(TREE.map(D => [D.id, treeGateOpen(D.id)])),
    save:{ done:Object.keys(R.done || {}), seen:{ ...(R.seen || {}) }, unseen:!!R.unseen, point:R.point ? R.point.what : null },
    page:{ open, district:open ? TREEUI.district : null, sel:open ? TREEUI.sel : null, panel:open && TREEUI.sel && TREEUI.panel && TREEUI.panel.id === TREEUI.sel ? { ...TREEUI.panel } : null,
      cards:open && TREEUI.cards ? { ...TREEUI.cards } : null, point:!!sheet.querySelector('.hb-al-btn.hb-point') },
    pins:(() => { try { return treePins().map(p => ({ id:p.id, label:p.label, x:Math.round(p.x), y:Math.round(p.y) })); } catch(e){ return []; } })() };
}
dbgField('tree', treeDbg);
window.__treeData = () => TREE.map(D => ({ id:D.id, title:D.title, next:D.next || null, nodes:D.nodes.map(n => ({ id:n.id, title:n.title, en:n.en, parent:n.parent, depth:n.depth,
  district:n.district, lesson:n.lesson || null, quest:n.quest || null, continues:n.continues || null, person:n.person, place:n.place, soon:!!n.soon, placeholder:!!n.placeholder,
  words:treeWords(n).map(w => w.it), keys:treeWords(n).map(w => studyKey(w.it)), count:treeWordCount(n) })) }));
window.__treeLint = () => treeLint();
Object.assign(window.__debug, {
  /* a node done, and every node above it (its parents, and what it continues), so the tree stays a strict chain;
     { strict:true }: only the engine's treeDone(id), as a lesson calls it (false for a locked node) */
  treeDone(id, o = {}){
    if (o.strict) return treeDone(id);
    const path = [], add = x => { const n = treeNode(x); if (!n || path.includes(n)) return; if (n.parent) add(n.parent); if (n.continues) add(n.continues); path.push(n); };
    add(id); if (!path.length) return false;
    path.forEach(n => treeDone(n.id, { quiet:n.id !== id, force:true }));
    return true;
  },
  treeReset(){ delete S.tree; TREEUI.sel = null; TREEUI.cards = null; save(); renderHUD(); treeRefresh(); },
  treePoint(line){ if (!modalOpen) openHandbook(); return handbookPointTo('albero', line ? { line } : {}); },
  treeOpen(id){ openAlbero(id || null); return !!(modalOpen && hbTab === 'albero'); },
  treeAddDistrict(d){ TREE.push(d); return treeLint(); },
});
