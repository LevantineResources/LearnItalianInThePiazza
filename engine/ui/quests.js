/* The quests' UI (Lesson 12 on; the system is engine/quests.js, design docs/features/quests-and-night.md):
   - the phone's tabs: Messaggi (ui/phone.js), Compiti (the task list), Borsa (the bag), Passaporto (the stamps)
   - the scheda: a quest's mini chapter (phrases, how, culture, its Vocabolario with the word check, a short practice),
     openScheda(id, tab?), a modal of its own ('sheet scheda'); it reuses ui/vocab.js (renderVocabSection, the word-check
     session VC['q:<id>']) and the handbook's practice (renderPractice with the pseudo chapter chapterOf('q:<id>'))
   - the "!" spots on the city map (mapSpots(), mapSpotsSvg(): world/map.js draws them): open quests travel to their place
     when clicked, closed ones are grey with their note (chiuso · apre stasera)
   - the header: the game clock (#gameClock, while a lesson's gameClock() hook gives a time) and the bag (#btnBag)
   - the bag's tile group in conversations ("Nella borsa": Ecco + the items), added to every tile bank by bankGroups()
   For tests: __dbg().quests (engine/quests.js), schedaDbg() inside it, __debug.scheda(id, tab). */

/* ---------- the scheda as a chapter (for ui/vocab.js and the handbook's practice) ---------- */
function chapterOf(n){
  if (!isQuestKey(n)) return LESSONS[n - 1];
  const q = questOfKey(n); if (!q || !q.scheda) return null;
  const s = q.scheda;
  return { n, quest:q.id, title:q.title_it, sub:q.title_en, phrasesTitle:s.phrasesTitle || 'What you say', phrases:s.phrases || [], how:s.how || '', culture:s.culture || '',
    vocab:s.vocab, exercises:s.exercises || [], doneTitle:'Scheda done!', doneGo:'Back to the task' };
}

/* ---------- the scheda modal ---------- */
const SCH = { id:null, tab:'scheda' };
const schedaOpen = () => modalOpen && sheet.classList.contains('scheda');
function openScheda(id, tab){
  const q = questById(id); if (!q || !q.scheda || introOpen) return;
  SCH.id = id; SCH.tab = tab || 'scheda';
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  openModal('scheda');
  renderScheda();
}
function renderScheda(){
  if (!schedaOpen()) return;
  const q = questById(SCH.id), L = chapterOf(questKey(q.id)), r = questRec(q.id), key = L.n;
  const words = vocabWords(key).length, locked = !vocabCheckDone(key), pDone = practiceDone(key);
  if (SCH.tab === 'practice' && locked) SCH.tab = 'words';
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Scheda · ${esc(q.title_en)}</p><h2><em>${esc(q.title_it)}</em></h2>
      <p class="sub">A task card: a few phrases, the words, a short practice.${schedaDone(q.id) ? ' <b class="sch-ok">✓ Done</b>' : ''}</p></div>
      <button class="x" data-close aria-label="Close the scheda">×</button></div>
    <div class="tabs" role="tablist">
      <button role="tab" data-sch-tab="scheda" aria-selected="${SCH.tab === 'scheda'}">Scheda</button>
      <button role="tab" data-sch-tab="words" aria-selected="${SCH.tab === 'words'}" class="${locked && SCH.tab !== 'words' ? 'pulse' : ''}">Words${locked ? ' · ' + words : ' ✓'}</button>
      <button role="tab" data-sch-tab="practice" aria-selected="${SCH.tab === 'practice'}" class="${!locked && !pDone && SCH.tab !== 'practice' ? 'pulse' : ''}">Practice${locked ? ' 🔒' : pDone ? ' ✓' : ' · ' + L.exercises.length}</button>
    </div>
    <div class="sheet-body" id="schBody"></div>`;
  const body = $('#schBody');
  sheet.classList.remove('vc-mode');
  if (SCH.tab === 'words'){
    const s = vcState(key);
    if (!s.body){ s.body = () => $('#schBody'); s.pool = () => vcShuffle(LESSONS.flatMap(Lx => vocabWords(Lx.n))); }
    if (document.activeElement && sheet.contains(document.activeElement)) document.activeElement.blur();
    sheet.classList.add('vc-mode');
    vcRender(body, s);
  } else if (SCH.tab === 'practice') renderPractice(body, L);
  else {
    const card = ([it, en, note]) => `<div class="phrase"><div class="it"><span>${esc(it)}</span><button class="play" data-say="${esc(it)}" aria-label="Play: ${esc(it)}">${SPK}</button></div>
      <div class="en">${esc(en)}</div>${note ? `<div class="note">${esc(note)}</div>` : ''}</div>`;
    const step = questCurStep(q.id);
    body.innerHTML = `${step ? `<div class="callout sch-now"><p><b>Now:</b> ${esc(step.en)}${step.where ? ` <span class="sch-where">· ${esc(step.where)}</span>` : ''}</p></div>` : ''}
      <h3 id="hb-phrases">${esc(L.phrasesTitle)}</h3><div class="phrases">${L.phrases.map(card).join('')}</div>
      <section id="hb-how"><h3>How it works</h3><div class="callout">${L.how}</div></section>
      <section id="hb-culture"><h3>Culture</h3><div class="callout culture">${L.culture}</div></section>
      <section id="hb-vocab">${renderVocabSection(L)}</section>
      <div class="cta">${locked ? `<button class="btn primary" data-sch-tab="words">Learn the words · ${words}</button>`
        : pDone ? '<button class="btn primary" data-close>Back to the task</button>' : `<button class="btn primary" data-sch-tab="practice">Start the practice · ${L.exercises.length} questions</button>`}</div>`;
  }
}
/* the handbook's modal click handler asks this first (ui/handbook.js): the scheda's own tabs and buttons */
function schedaClick(e){
  if (!schedaOpen()) return false;
  const t = e.target.closest('[data-sch-tab], [data-tab]');
  if (!t) return false;
  SCH.tab = t.dataset.schTab || (t.dataset.tab === 'lesson' ? 'scheda' : t.dataset.tab);
  clearTimeout(vcTimer); renderScheda();
  return true;
}
/* the word check of a scheda was passed / its practice finished (ui/vocab.js, ui/handbook.js) */
function schedaWordsPassed(id){
  const r = questRec(id), first = !r.words;
  r.words = true; save();
  if (first) toast(`<b>${vocabWords(questKey(id)).length} words learned!</b> Now the practice.`);
  renderHUD();
}
function schedaPracticeDone(id){
  const r = questRec(id), first = !r.practice;
  r.practice = true; save();
  if (first){ toast(`Scheda done: <b>${esc(questById(id).title_it)}</b>. Its words are in your tile bank and your dictionary.`); const q = questById(id); if (q.onScheda) q.onScheda(); }
  renderHUD();
}
function schedaDbg(){
  const key = SCH.id ? questKey(SCH.id) : null, s = key ? VC[key] : null;
  return { open:schedaOpen(), id:SCH.id, tab:SCH.tab, words:s ? { ...vcDbg(s), open:schedaOpen() && SCH.tab === 'words', total:vocabWords(key).length, passed:vocabCheckDone(key) } : null,
    practice:key ? { done:practiceDone(key), i:(PX[key] || {}).i || 0, total:chapterOf(key).exercises.length } : null };
}

/* ---------- the phone's tabs ---------- */
const PHONE_TABS = [['msg', 'Messaggi'], ['tasks', 'Compiti'], ['bag', 'Borsa'], ['pass', 'Passaporto']];
const phoneTabsOn = () => S.lesson >= 12 || bagItems().length > 0 || QUESTS.some(q => questState(q) !== 'locked');
let PHONE_TAB = 'msg';
function phoneTabBar(){
  if (!phoneTabsOn()) return '';
  const n = { tasks:QUESTS.filter(q => ['open', 'active'].includes(questState(q))).length, bag:bagItems().length, pass:passportStamps().length };
  return `<nav class="ph-tabs" role="tablist">${PHONE_TABS.map(([k, label]) => `<button role="tab" data-ph-tab="${k}" aria-selected="${PHONE_TAB === k}">${label}${n[k] ? `<b>${n[k]}</b>` : ''}</button>`).join('')}</nav>`;
}
const phoneTop = (title, sub, ico) => `<div class="phone-top"><span class="avatar">${ico}</span><div><b>${title}</b><small>${sub}</small></div><button class="x" data-close aria-label="Close phone">×</button></div>`;
/* where a quest is: its place's label, else the name of its scene (SCENE_NAMES: a unit's, { scene:'Name' }) */
const SCENE_NAMES = {};
const questWhere = q => (q.place && q.place.label) || (SCENE_NAMES[q.place && q.place.scene] || '');
function renderPhoneTasks(){
  const by = s => QUESTS.filter(q => questState(q) === s).sort((a, b) => (a.n || 0) - (b.n || 0));
  const extra = lessonAsk('taskList') || [];
  const row = (q, s) => {
    const step = questCurStep(q.id), r = questPeek(q.id) || {};
    const btns = [];
    if (q.scheda && s !== 'locked') btns.push(`<button class="ph-mini${q.scheda && !schedaDone(q.id) && s === 'active' ? ' hot' : ''}" data-ph-scheda="${q.id}">Scheda${schedaDone(q.id) ? ' ✓' : ''}</button>`);
    if (s === 'open' || s === 'active') btns.push(`<button class="ph-mini go" data-ph-go="${q.id}">Vai →</button>`);
    return `<li class="ph-task ${s}"><span class="ph-ico" style="--ink:${(q.stamp || {}).color || '#1c3d8f'}">${s === 'done' ? (q.stamp || {}).icon || '✓' : s === 'closed' ? '·' : '!'}</span>
      <div class="ph-txt"><b>${esc(q.title_it)}</b><i>${esc(q.title_en)}</i>
        <span class="ph-step">${s === 'active' && step ? esc(step.en) : s === 'open' ? `${esc(questWhere(q))}${q.window !== 'any' ? ` · ${q.window === 'night' ? 'stasera' : 'pomeriggio'}` : ''}` : s === 'closed' ? esc(questClosedNote(q)) : s === 'done' ? `Fatto${r.at && r.at.clock ? ' · ' + r.at.clock : ''}` : ''}</span></div>
      <div class="ph-btns">${btns.join('')}</div></li>`;
  };
  const sec = (title, list, s) => list.length ? `<h4 class="ph-sec">${title}</h4><ul class="ph-list">${list.map(q => row(q, s)).join('')}</ul>` : '';
  const lessonRows = extra.length ? `<ul class="ph-list">${extra.map(x => `<li class="ph-task ph-lrow${x.done ? ' done' : ''}"><span class="ph-ico" style="--ink:#c23b2a">${x.icon || '★'}</span><div class="ph-txt"><b>${esc(x.title)}</b><span class="ph-step">${x.sub || ''}</span></div></li>`).join('')}</ul>` : '';
  const body = lessonRows + sec('Adesso · under way', by('active'), 'active') + sec('Da fare · open now', by('open'), 'open') + sec('Chiusi · closed for now', by('closed'), 'closed') + sec('Fatti · done', by('done'), 'done');
  return `<div class="ph-body">${body || '<p class="ph-empty">No tasks yet.</p>'}<p class="ph-note">The <b>!</b> spots on your map (<kbd>M</kbd>) take you to them.</p></div>`;
}
const BAG_ICONS = { biglietto:'🎫', caffe:'☕' };
function renderPhoneBag(){
  const B = bagItems();
  return `<div class="ph-body">${B.length ? `<ul class="ph-list bag">${B.map(b => `<li class="ph-item"><span class="ph-bagico" aria-hidden="true">${b.icon || BAG_ICONS[b.id] || '◆'}</span>
      <div class="ph-txt"><b>${esc(b.label_it)}</b><i>${esc(b.label_en)}</i>${b.note ? `<span class="ph-step">${esc(b.note)}</span>` : ''}${b.for && NPC[b.for] ? `<span class="ph-step">for ${esc(NPC[b.for].name)}</span>` : ''}</div></li>`).join('')}</ul>`
      : '<p class="ph-empty">Your bag is empty.</p>'}<p class="ph-note">To give something to someone, talk to them: the <b>Nella borsa</b> tiles. <i>Ecco …!</i></p></div>`;
}
function stampSVG(s, i){
  const rot = [-8, 6, -3, 9, -11, 4, -6, 10][i % 8], ink = s.color || '#1c3d8f';
  return `<svg class="stamp" viewBox="0 0 140 120" style="transform:rotate(${rot}deg)" role="img" aria-label="${esc(s.title_it)}">
    <g fill="none" stroke="${ink}" opacity=".88"><rect x="6" y="6" width="128" height="108" rx="16" stroke-width="3.2"/><rect x="12" y="12" width="116" height="96" rx="12" stroke-width="1.3" stroke-dasharray="4 3"/></g>
    <text x="70" y="52" text-anchor="middle" font-size="30">${s.icon}</text>
    <text x="70" y="78" text-anchor="middle" fill="${ink}" font-family="Titillium Web, sans-serif" font-weight="700" font-size="${s.title_it.length > 18 ? 9.5 : 11}" letter-spacing=".04em">${esc(s.title_it.toUpperCase())}</text>
    <text x="70" y="96" text-anchor="middle" fill="${ink}" font-family="Titillium Web, sans-serif" font-size="9.5" opacity=".85">${esc(s.when || '')}</text></svg>`;
}
function passportHTML(o = {}){
  const P = passportStamps(), slots = Math.max(o.slots || 6, P.length + (P.length % 2));
  return `<div class="passport${o.big ? ' big' : ''}"><div class="pp-head"><span class="pp-emb" aria-hidden="true">✦</span><div><b>PASSAPORTO</b><i>${esc(S.playerName || '')} · ${P.length} ${P.length === 1 ? 'timbro' : 'timbri'}</i></div></div>
    <div class="pp-grid">${Array.from({ length:slots }, (_, i) => P[i] ? `<div class="pp-slot on" title="${esc(P[i].title_en)}">${stampSVG(P[i], i)}</div>` : '<div class="pp-slot"></div>').join('')}</div></div>`;
}
function renderPhonePassport(){
  return `<div class="ph-body">${passportHTML()}<p class="ph-note">A stamp for every task you finish, with the time you did it.</p></div>`;
}
/* the phone with its tabs (ui/phone.js draws Messaggi) */
function phoneTabHTML(tab){
  if (tab === 'tasks') return phoneTop('Compiti', 'Things to do in town', '!') + renderPhoneTasks();
  if (tab === 'bag') return phoneTop('La borsa', 'What you are carrying', '◆') + renderPhoneBag();
  return phoneTop('Passaporto', 'Your stamps', '✦') + renderPhonePassport();
}

/* ---------- the "!" spots on the city map ---------- */
/* where a scene is on the unit's map, [x, y] (a unit's: Object.assign(SCENE_MAP, { scene:[x, y] })) */
const SCENE_MAP = {};
function mapSpots(){
  if (!unitHook('mapShown')) return [];
  const out = [], used = {};
  QUESTS.slice().sort((a, b) => (a.n || 0) - (b.n || 0)).forEach(q => {
    const s = questState(q); if (s === 'locked' || s === 'done') return;
    const P = q.place || {}, base = P.map || SCENE_MAP[P.scene] || [300, 466], k = base.join(',');
    const off = used[k] = (used[k] || 0) + 1;
    /* quests at the same place stand side by side, 32 apart (their labels are laid out by mapSpotsSvg) */
    out.push({ id:'q:' + q.id, quest:q.id, x:base[0] + (off - 1) * 32, y:base[1] - 26, label:q.title_it, closed:s === 'closed', note:s === 'closed' ? questClosedNote(q) : '',
      go:{ scene:P.scene, spawn:P.x != null ? { x:P.x, y:P.y } : null, title:q.title_it, sub:questWhere(q) } });
  });
  for (const h of Object.values(LESSON_HOOKS)) if (typeof h.mapSpots === 'function') (h.mapSpots() || []).forEach(s => out.push(s));
  return out;
}
/* the map's labels never overlap: each spot's label (and a closed spot's note) takes the first place round its dot that is clear
   of everything already on the map (the dots, the landmarks and their names, the "Tu sei qui" pin and its label, the labels
   placed before it), else the place it overlaps least; labels stay inside the map. here = [x, y] of the pin (world/map.js). */
const MAP_TXT = { c:null };
function mapTextW(text, font){
  if (!MAP_TXT.c) MAP_TXT.c = document.createElement('canvas').getContext('2d');
  const body = (getComputedStyle(document.documentElement).getPropertyValue('--body') || 'sans-serif').trim();
  MAP_TXT.c.font = `${font} ${body}`;
  return MAP_TXT.c.measureText(text).width;
}
function mapLabelLayout(spots, here){
  const MW = 720, MH = 520, boxes = [];
  const box = (x, y, w, h) => ({ x, y, w, h });
  const over = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  /* what is there already */
  if (here){ boxes.push(box(here[0] - 11, here[1] - 26, 22, 26)); const w = mapTextW('Tu sei qui', '700 11px'); boxes.push(box(here[0] - w / 2 - 2, here[1] - 48, w + 4, 13)); }
  (unitHook('mapLandmarks') || []).forEach(l => { boxes.push(box(l.x - 13, l.y - 13, 26, 26)); const w = mapTextW(l.label, '600 11px'); boxes.push(box(l.x - w / 2, l.y + 18, w, 12)); });   // (the unit's map: its landmarks, { x, y, label })
  spots.forEach(s => boxes.push(box(s.x - 15, s.y - 15, 30, 30)));
  /* a text's box for an anchor and a baseline; the candidates round a dot (label: above first, stacked higher, the sides,
     below; note: below first) */
  const tb = (x, base, w, anchor) => { const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2; return box(x0 - 2, base - 9, w + 4, 12); };
  const clampX = b => { const d = b.x < 2 ? 2 - b.x : b.x + b.w > MW - 2 ? MW - 2 - (b.x + b.w) : 0; return d; };
  const place = (cands, w) => {
    let best = null, bs = Infinity;
    cands.forEach(([x, base, anchor], i) => {
      let b = tb(x, base, w, anchor); const dx = clampX(b); b = { ...b, x:b.x + dx };
      const outY = b.y < 0 || b.y + b.h > MH ? 1e6 : 0;
      const sc = boxes.reduce((t, o) => t + over(b, o), 0) * 10 + outY + i;      // (the earlier candidates win a tie)
      if (sc < bs){ bs = sc; best = { b, x:x + dx, base, anchor }; }
    });
    boxes.push(best.b);
    return best;
  };
  return spots.map(s => {
    const lw = mapTextW(s.label, '700 10.5px'), L = place([[s.x, s.y - 18, 'middle'], [s.x, s.y - 31, 'middle'], [s.x, s.y - 44, 'middle'], [s.x + 18, s.y - 6, 'start'], [s.x - 18, s.y - 6, 'end'],
      [s.x + 18, s.y + 8, 'start'], [s.x - 18, s.y + 8, 'end'], [s.x, s.y + 27, 'middle'], [s.x, s.y - 57, 'middle'], [s.x, s.y + 40, 'middle']], lw);
    let N = null;
    if (s.closed && s.note){ const nw = mapTextW(s.note, 'italic 600 10px');
      N = place([[s.x, s.y + 27, 'middle'], [s.x, s.y + 40, 'middle'], [s.x + 18, s.y + 8, 'start'], [s.x - 18, s.y + 8, 'end'], [s.x + 18, s.y + 21, 'start'], [s.x - 18, s.y + 21, 'end'],
        [L.x, L.base - 13, L.anchor], [L.x, L.base + 13, L.anchor], [s.x, s.y + 53, 'middle']], nw); }
    /* the spot's dot, its label and its note are all clickable (each its own box: none covers another spot's dot) */
    return { L, N, hit:[L.b, ...(N ? [N.b] : [])] };
  });
}
function mapSpotsSvg(here){
  const spots = mapSpots(), lay = mapLabelLayout(spots, here);
  return spots.map((s, i) => { const { L, N, hit:h } = lay[i]; return `<g class="qspot${s.closed ? ' closed' : ''}${s.lesson ? ' lesson' : ''}" data-qspot="${esc(s.id)}" role="button" aria-label="${esc(s.label)}${s.closed ? ': ' + esc(s.note) : ''}">
      ${h.map(r => `<rect class="qs-hit" x="${r.x.toFixed(1)}" y="${r.y.toFixed(1)}" width="${r.w.toFixed(1)}" height="${r.h.toFixed(1)}" fill="transparent"/>`).join('')}
      <circle cx="${s.x}" cy="${s.y}" r="15" class="qs-halo"/><circle cx="${s.x}" cy="${s.y}" r="11" class="qs-dot"/>
      <text x="${s.x}" y="${s.y + 5}" text-anchor="middle" class="qs-mark">!</text>
      <text x="${L.x.toFixed(1)}" y="${L.base}" text-anchor="${L.anchor}" class="qs-lbl">${esc(s.label)}</text>
      ${N ? `<text x="${N.x.toFixed(1)}" y="${N.base}" text-anchor="${N.anchor}" class="qs-note">${esc(s.note)}</text>` : ''}</g>`; }).join('');
}
function goSpot(id){
  const s = mapSpots().find(x => x.id === id); if (!s) return;
  if (s.closed){ toast(`<b>${esc(s.label)}</b>: ${esc(s.note)}.`); return; }
  const g = s.go; if (!g || !SCENES[g.scene]) return;
  travelTo(g.scene, g.spawn || null, g.title || s.label, g.sub || '');
}

/* ---------- the header: the clock and the bag ---------- */
function renderQuestHUD(){
  const c = gameClock(), el = $('#gameClock');
  if (el){
    el.hidden = !c;
    if (c){ const night = daytime() === 'night'; el.innerHTML = `<span class="gc-ico" aria-hidden="true">${night ? '☾' : '☀'}</span><b>${clockText(c)}</b><span class="gc-dt">${DAYTIME_IT[daytime()] || ''}</span>`; el.classList.toggle('night', night); el.title = `The time: ${clockText(c)}`; }
  }
  const b = $('#btnBag');
  if (b){ const n = bagItems().length; b.hidden = !n; const cnt = $('#bagCount'); if (cnt) cnt.textContent = n; }
}

/* ---------- input: the scheda's tabs, the phone's tabs and buttons, the map's spots ---------- */
sheet.addEventListener('click', e => {
  const sp = e.target.closest('[data-qspot]'); if (sp){ goSpot(sp.dataset.qspot); return; }
  const pt = e.target.closest('[data-ph-tab]'); if (pt){ openPhone(pt.dataset.phTab); return; }
  const ps = e.target.closest('[data-ph-scheda]'); if (ps){ openScheda(ps.dataset.phScheda); return; }
  const pg = e.target.closest('[data-ph-go]'); if (pg){ goSpot('q:' + pg.dataset.phGo); return; }
});
$('#btnBag').onclick = () => openPhone('bag');
Object.assign(window.__debug, { scheda(id, tab){ openScheda(id, tab); }, spot(id){ goSpot(id); } });
