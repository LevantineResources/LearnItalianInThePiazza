/* The city map: grid, landmarks, route tracing, travel buttons. */

/* City map: a grid of streets around the piazza. The player traces a route on it. */
const MAPX = [60, 180, 300, 420, 540, 660], MAPY = [40, 130, 220, 310, 400];
const BRIDGES = [1, 3];   // rows where a bridge crosses the river between columns 4 and 5
const LANDMARKS = [
  { t:'farmacia', x:448, y:248 }, { t:'farmacia', x:152, y:248 },
  { t:'chiesa', x:478, y:85 }, { t:'chiesa', x:118, y:85 },
  { t:'banca', x:262, y:344 }, { t:'basilica', x:700, y:82 }, { t:'chiesa', x:700, y:262 }, { t:'ospedale', x:508, y:352 }, { t:'stazione', x:80, y:470 },
  { t:'mercato', x:100, y:166 },
  /* the Museo d'Arte (a fictional gallery of Italian masterpieces), between the station and the centre, beside the park (the spot
     stands in the Giardini dell'Arena, just south of the station). From Lesson 10 on (from:10): Lesson 9's dictated map
     stops at landmarks and only knows the earlier ones. At node [1,4]. */
  { t:'musei', x:166, y:440, from:10 },
  /* the gelateria, just off Piazza Centrale (Lesson 12 on: the shop template, world/shops.js), in the block above the piazza */
  { t:'gelateria', x:372, y:350, from:12 },
  /* the bridge (Ponte Molino: the upper bridge, nearest San Lorenzo and the centre) and the park (the Giardini dell'Arena, the
     green square by the station and the museum): Lesson 12's quests (world/ponte.js, world/parco.js) */
  { t:'ponte', x:607, y:130, from:12 },
  { t:'giardini', x:118, y:352, from:12 },
  /* the covered market under the Palazzo della Ragione ("Sotto il Salone"), beside the market (world/salone.js) */
  { t:'salone', x:240, y:176, from:12 },
];
/* the landmarks on the map now (a landmark with from:N appears from Lesson N on) */
const mapLandmarks = () => LANDMARKS.filter(l => !l.from || S.lesson >= l.from);
const LM_STYLE = { basilica:['#a0522d','✝','Basilica'], farmacia:['#2e8b57','+','Farmacia'], chiesa:['#6b5a7a','†','Chiesa'], banca:['#1c3d8f','€','Banca'], ospedale:['#c23b2a','H','Ospedale'], stazione:['#333','FS','Stazione'],
  mercato:['#e07a2f', '', 'Mercato', (x, y) => `<path d="M${x - 8} ${y - 5}h16v5h-16z" fill="#fff"/>${[0, 1, 2, 3].map(k => `<path d="M${x - 8 + k * 4} ${y}h4v2a2 2 0 0 1 -4 0z" fill="${k % 2 ? '#fff' : '#c23b2a'}"/><rect x="${x - 8 + k * 4}" y="${y - 5}" width="2" height="5" fill="#c23b2a"/>`).join('')}<rect x="${x - 7}" y="${y + 3}" width="1.6" height="6" fill="#fff"/><rect x="${x + 5.4}" y="${y + 3}" width="1.6" height="6" fill="#fff"/>`],
  gelateria:['#b55470', '', 'Gelateria', (x, y) => `<path d="M${x - 5} ${y - 1}L${x + 5} ${y - 1}L${x} ${y + 9}Z" fill="#f3d39a"/><circle cx="${x - 2.5}" cy="${y - 3}" r="4" fill="#fff"/><circle cx="${x + 2.5}" cy="${y - 4}" r="4" fill="#f7c6d0"/>`],
  ponte:['#3d77a3', '', 'Ponte', (x, y) => `<path d="M${x - 9} ${y + 4}V${y - 1}H${x + 9}V${y + 4}" fill="none" stroke="#fff" stroke-width="2"/><path d="M${x - 9} ${y + 4}a4.5 4 0 0 1 9 0a4.5 4 0 0 1 9 0" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M${x - 9} ${y - 3}H${x + 9}" stroke="#fff" stroke-width="1.4"/>`],
  giardini:['#3f7a3a', '', 'Giardini', (x, y) => `<rect x="${x - 1.4}" y="${y + 1}" width="2.8" height="7" fill="#fff"/><circle cx="${x}" cy="${y - 3}" r="6.5" fill="#fff"/><circle cx="${x - 3}" cy="${y - 4}" r="2" fill="#3f7a3a" opacity=".35"/>`],
  salone:['#b8862a', '', 'Salone', (x, y) => `<rect x="${x - 8}" y="${y - 6}" width="16" height="12" fill="#fff"/>${[-5, 0, 5].map(dx => `<path d="M${x + dx - 2} ${y + 6}v-5a2 2 0 0 1 4 0v5z" fill="#b8862a"/>`).join('')}<path d="M${x - 9} ${y - 6}L${x} ${y - 10}L${x + 9} ${y - 6}Z" fill="#fff"/>`],
  musei:['#7a3a6e', '', 'Museo', (x, y) => `<path d="M${x - 8} ${y - 3}L${x} ${y - 8}L${x + 8} ${y - 3}Z" fill="#fff"/>${[-6, -2, 2, 6].map(dx => `<rect x="${x + dx - 1}" y="${y - 2}" width="2" height="8" fill="#fff"/>`).join('')}<rect x="${x - 8}" y="${y + 6}" width="16" height="2" fill="#fff"/>`] };
/* an LM_STYLE entry is [colour, glyph, label] or [colour, '', label, (x, y) => svg icon] */

/* ---------- city map with route tracing ----------
   Lessons 3 and 5 are built in (keys l3, l5). From Lesson 7 on, a lesson supplies its own route with the
   hook mapRoute = { key, route, accept?, who?, notes?, dest?, active?, wrong?, tracing, ok, onOK } (see CLAUDE.md).
   The hooked route of the highest lesson whose active() is true (default: S.lesson >= n) is the current one. */
let MAP = { key:null, path:[[2,4]], status:null };
const nodeEq = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
function hookRoute(key){
  const hs = hooks().filter(h => h.mapRoute).sort((a, b) => b.n - a.n);
  if (key) return (hs.find(h => h.mapRoute.key === key) || {}).mapRoute || null;
  const h = hs.find(h => h.mapRoute.active ? h.mapRoute.active() : S.lesson >= h.n);
  return h ? h.mapRoute : null;
}
const mapKey = () => { const r = hookRoute(); return r ? r.key : S.lesson >= 5 ? 'l5' : 'l3'; };
const ROUTES = { l3:ROUTE, l5:ROUTE5 };
const routeOf = k => { const r = hookRoute(k); return r ? r.route : ROUTES[k]; };
const routeStart = () => [...routeOf(mapKey())[0]];
const routeOK = k => { const r = hookRoute(k); if (r) return !!r.ok(); return k === 'l5' ? S.l5routeOK : S.l3routeOK; };
const tracing = () => {
  const r = hookRoute(); if (r) return !!r.tracing() && !r.ok();
  return (S.tut === 'l3-mark' && mapKey() === 'l3' && !S.l3routeOK) || (S.tut === 'l5-tour' && !S.l5routeOK);
};
function nextNodes(){
  const lastN = MAP.path[MAP.path.length - 1], prev = MAP.path[MAP.path.length - 2];
  return [[1,0],[-1,0],[0,1],[0,-1]].map(([dx, dy]) => [lastN[0] + dx, lastN[1] + dy, dx])
    .filter(([c, r, dx]) => c >= 0 && c < MAPX.length && r >= 0 && r < MAPY.length && !nodeEq([c, r], prev)
      && !(dx && Math.min(c, lastN[0]) === 4 && !BRIDGES.includes(r)))
    .map(([c, r]) => [c, r]);
}
function onMapNode(nd){
  if (!tracing()) return;
  const prev = MAP.path[MAP.path.length - 2];
  if (nodeEq(nd, prev)) MAP.path.pop();
  else if (nextNodes().some(x => nodeEq(x, nd))) MAP.path.push(nd);
  else return;
  MAP.status = null; renderMap();
}
function checkHookRoute(h){
  const p = MAP.path, R = h.route, who = h.who || 'they';
  for (let i = 1; i < R.length; i++){
    if (!p[i]) return { ok:false, msg:h.notThere || `You're not there yet. Keep following the directions.` };
    if (!nodeEq(p[i], R[i])) return { ok:false, msg:(h.wrong && h.wrong(i, p[i], p)) || `That's not the way ${who} described. Read the directions again, one street at a time.` };
  }
  if (p.length === R.length || (p.length === R.length + 1 && (h.accept || []).some(nd => nodeEq(nd, p[R.length])))) return { ok:true };
  return { ok:false, msg:'You went too far. Stop where the directions end.' };
}
function checkRoute(){
  const p = MAP.path, key = MAP.key, R = ROUTES[key];
  { const h = hookRoute(key); if (h) return checkHookRoute(h); }
  for (let i = 1; i < R.length; i++){
    if (!p[i]) return { ok:false, msg: key === 'l5' ? 'Not there yet. Piazza del Santo is <b>in fondo alla strada</b>: at the very end of the street.' : "You're not there yet. Keep following Chiara's directions." };
    if (!nodeEq(p[i], R[i])){
      const at = p[i];
      if (key === 'l5'){
        if (i === 1) return { ok:false, msg:'He started with <b>Vai dritto fino alla banca</b>: go straight first.' };
        if (i === 2) return { ok:false, msg: nodeEq(at, [2,2]) ? '<b>Fino alla banca</b> means only as far as the bank. Turn there.' : '<b>Alla banca, gira a destra</b>: right, not left.' };
        if (i === 3 || i === 4) return { ok:false, msg:'<b>Vai sempre dritto e attraversa il ponte</b>: keep going straight all the way over the bridge.' };
        if (i === 5) return { ok:false, msg:'<b>Dopo il ponte, gira a sinistra</b>: left, not right.' };
        return { ok:false, msg:'<b>In fondo alla strada</b>: keep going to the very end of the street.' };
      }
      if (i === 1) return { ok:false, msg:'She started with <b>Vai sempre dritto</b>: keep going straight first.' };
      if (i === 2) return { ok:false, msg:'<b>Alla seconda strada</b> means at the <i>second</i> street. You turned at the first one.' };
      if (i === 3) return { ok:false, msg: nodeEq(at, [1,2]) ? '<b>Gira a destra</b>: turn right, not left.' : 'You went past it. <b>Alla seconda strada, gira a destra</b>: turn right at the second street.' };
      if (i === 4) return { ok:false, msg: nodeEq(at, [3,3]) ? '<b>Alla farmacia, gira a sinistra</b>: left at the pharmacy, not right.' : '<b>Alla farmacia, gira a sinistra</b>: turn left at the pharmacy, don\'t carry straight on.' };
    }
  }
  if (p.length === R.length || (key === 'l3' && p.length === R.length + 1 && nodeEq(p[R.length], [3,0]))) return { ok:true };
  return { ok:false, msg:'You went too far. Stop where the directions end.' };
}
function openMap(){
  if (introOpen || S.lesson < 3) return;
  const key = mapKey();
  if (MAP.key !== key) MAP = { key, path:[routeStart()], status:null };
  if (routeOK(key)) MAP.path = routeOf(key).map(x => [...x]);
  openModal('wide'); renderMap();
}
/* ---------- fast travel ----------
   The places you can go to straight from the map (the designer: "once the player has been given directions to a place, it
   appears on the map as a button that takes the player straight there"). A DEST is a place: { scene, label, sub, ok (the
   lesson's unlock: the route you were told and traced on the map, or the town opened), now? (open at this time of day),
   spawn? (the entrance; default the scene's spawn), face? (facing in; default north),
   learnt? (the backfill for a save already past the lesson that taught the way) }. Once open, a place is remembered in the
   save, S.fast = { scene:true } (lazy, not in FRESH()), so it stays on the list. Its button is in the "Go straight there" list
   beside the map ([data-go], the old "Walk to" buttons), the only way to fast travel: the map itself has no buttons for it (the
   designer: too crowded with the quest spots), it scrolls inside its panel when long. Fast travel is off (fastOff()) while
   a cutscene plays, on the night train, or when a lesson's fastTravel() hook returns false or a reason (a follower who must
   walk with you, a crowd scene, a step the story needs walked). */
const TOWN = () => townOpen() || (S.lesson >= 12 && lessonCompleted(12));
const DESTS = [
  { scene:'piazza', label:'Piazza Centrale', ok:() => true, spawn:null, sub:'Back the way you came…' },
  { scene:'sanlorenzo', label:'San Lorenzo', ok:() => S.l3routeOK, spawn:null, face:{ x:1, y:0 }, sub:'Sempre dritto… seconda a destra… a sinistra alla farmacia…',
    learnt:() => S.lesson > 3 },
  { scene:'aurora', label:'Caffè Aurora', ok:() => S.lesson >= 4, spawn:null, sub:'Via dei Mille 12' },
  { scene:'santo', label:'Piazza del Santo', ok:() => S.l5routeOK, spawn:null, sub:'Dritto fino alla banca… a destra… attraversa il ponte… a sinistra…',
    learnt:() => S.lesson > 5 },
  { scene:'mercato', label:'Mercato', ok:() => false, spawn:null, sub:'Piazza delle Erbe', learnt:() => S.lesson > 7 },   // unlocked by a lesson hook: dests.mercato()
  { scene:'museo', label:'Museo d\'Arte', ok:() => false, spawn:null, sub:'I Capolavori', learnt:() => S.lesson > 10 },   // unlocked by a lesson hook: dests.museo()
  { scene:'stazione', label:'Stazione', ok:() => false, spawn:null, sub:'Partenze · Arrivi', learnt:() => S.lesson > 12 },   // unlocked by a lesson hook: dests.stazione() (Lesson 12)
  /* the town (Lesson 12's quest spots: the quests tell you where), once the town is open or after Lesson 12; the covered
     market by day, the gelateria in the evening */
  { scene:'farmacia', label:'Farmacia', ok:TOWN, spawn:null, sub:'Via Garibaldi, San Lorenzo' },
  { scene:'ponte', label:'Ponte Molino', ok:TOWN, spawn:null, face:{ x:1, y:0 }, sub:'Sul fiume' },
  { scene:'parco', label:"Giardini dell'Arena", ok:TOWN, spawn:null, sub:'Il parco' },
  { scene:'salone', label:'Sotto il Salone', ok:TOWN, now:() => saloneOpen(), spawn:null, sub:'Il mercato coperto' },
  { scene:'gelateria', label:'Gelateria', ok:TOWN, now:() => shopOpenNow(GELATERIA), spawn:null, sub:'Vicolo del Duomo' },
];
/* a DEST is open when its own ok() says so, or when any lesson hook's dests[scene]() does (and it is open at this hour) */
const destOpen = d => (d.ok() || hooks().some(h => h.dests && typeof h.dests[d.scene] === 'function' && h.dests[d.scene]())) && (!d.now || d.now());
/* the places learnt: open ones are remembered, older saves are filled in (learnt), then S.fast says */
function fastKnown(){
  const F = S.fast || (S.fast = {});
  let changed = false;
  DESTS.forEach(d => { if (!F[d.scene] && (d.ok() || hooks().some(h => h.dests && typeof h.dests[d.scene] === 'function' && h.dests[d.scene]()) || (d.learnt && d.learnt()))){ F[d.scene] = true; changed = true; } });
  if (changed) save();
  return F;
}
/* why fast travel is off now (a string), or null */
function fastOff(){
  if (cutscenePlaying()) return 'Not during a scene: watch what happens first.';
  if (S.scene === 'treno' || /^cabina/.test(S.scene)) return "You're on the night train.";
  for (const h of hooks()) if (typeof h.fastTravel === 'function'){ const v = h.fastTravel(); if (v === false) return 'Not now: finish what you are doing here first.'; if (typeof v === 'string') return v; }
  return null;
}
/* the places to offer now: learnt (remembered: a later lesson's state can't take one back), open at this hour, not where you are */
const fastDests = () => { if (fastOff()) return []; const F = fastKnown(); return DESTS.filter(d => d.scene !== S.scene && F[d.scene] && (!d.now || d.now())); };
function fastGo(scene){
  const d = DESTS.find(x => x.scene === scene); if (!d || fastOff()) return;
  travelTo(d.scene, d.spawn || null, d.label, d.sub, { face:d.face || { x:0, y:-1 } });
}
Object.assign(window.__debug, { playerFace:() => ({ ...(player.face || { x:0, y:-1 }) }) });
window.__fast = () => ({ known:Object.keys(fastKnown()).filter(k => S.fast[k]), offer:fastDests().map(d => d.scene), off:fastOff() });
/* the city map's streets, river, park, piazza and landmarks (SVG markup, 720 × 520). o.hoods: draw the neighbourhood
   names (default: the ones you have visited; true: always) */
function cityMapBase(o = {}){
  const hood = k => o.hoods === true || (o.hoods !== false && S.visited[k]);
  return `<rect width="720" height="520" fill="#e3d2b0"/>
    <rect x="68" y="318" width="104" height="74" rx="6" fill="#bcd3a0"/>
    ${[[88,338],[120,360],[150,335],[100,375],[140,380]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#8fb36c"/>`).join('')}
    <line x1="0" y1="492" x2="230" y2="492" stroke="#6b6b6b" stroke-width="3" stroke-dasharray="2 6"/>
    <path d="M590 0 C 610 120, 580 260, 602 380 S 596 470, 606 520 L 630 520 C 620 470, 626 380, 604 260 S 636 120, 614 0 Z" fill="#8fbfd9"/>
    <text x="640" y="${o.riverY || 470}" class="mlm" fill="#3d77a3" transform="rotate(-80 640 ${o.riverY || 470})">fiume</text>
    ${MAPY.map(y => `<line x1="18" y1="${y}" x2="572" y2="${y}" stroke="#fbf6ea" stroke-width="16" stroke-linecap="round"/><line x1="642" y1="${y}" x2="702" y2="${y}" stroke="#fbf6ea" stroke-width="16" stroke-linecap="round"/>`).join('')}
    ${BRIDGES.map(r => `<rect x="566" y="${MAPY[r] - 10}" width="82" height="20" rx="3" fill="#fbf6ea" stroke="#9c8f7a" stroke-width="2"/>`).join('')}
    ${MAPX.map(x => `<line x1="${x}" y1="14" x2="${x}" y2="426" stroke="#fbf6ea" stroke-width="16" stroke-linecap="round"/>`).join('')}
    <line x1="300" y1="400" x2="300" y2="446" stroke="#fbf6ea" stroke-width="16"/>
    <rect x="232" y="440" width="136" height="60" rx="8" fill="#efe5d1" stroke="#b9a77f" stroke-width="2"/>
    <circle cx="300" cy="466" r="13" fill="#7db7d9" stroke="#fff" stroke-width="3"/>
    <text x="300" y="512" text-anchor="middle" class="mlabel">Piazza Centrale</text>
    ${mapLandmarks().map(l => { const [c, g, label, icon] = LM_STYLE[l.t]; return `<g><circle cx="${l.x}" cy="${l.y}" r="13" fill="${c}" stroke="#fff" stroke-width="2"/>${icon ? icon(l.x, l.y) : `<text x="${l.x}" y="${l.y + 5}" text-anchor="middle" class="mglyph">${g}</text>`}<text x="${l.x}" y="${l.y + 27}" text-anchor="middle" class="mlm">${label}</text></g>`; }).join('')}
    ${hood('sanlorenzo') ? '<text x="490" y="30" text-anchor="middle" class="mhood">San Lorenzo</text>' : ''}
    ${hood('santo') ? '<text x="672" y="20" text-anchor="middle" class="mhood" style="font-size:14px">P. del Santo</text>' : ''}`;
}
function renderMap(){
  const tr_ = tracing();
  const nx = tr_ ? nextNodes() : [];
  const P = MAP.path, key = MAP.key || mapKey();
  const pt = ([c, r]) => `${MAPX[c]},${MAPY[r]}`;
  let svg = `<svg class="mapsvg" viewBox="0 0 720 520" role="img" aria-label="Map of the streets around Piazza Centrale">${cityMapBase()}`;
  if (P.length > 1 || routeOK(key)){
    const pts = P.map(pt).join(' ');
    svg += `<polyline points="${pts}" fill="none" stroke="#0f2260" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"/>
      <polyline points="${pts}" fill="none" stroke="#f4b928" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  for (let r = 0; r < MAPY.length; r++) for (let c = 0; c < MAPX.length; c++){
    const isNext = nx.some(x => nodeEq(x, [c, r]));
    const isUndo = tr_ && P.length > 1 && nodeEq([c, r], P[P.length - 2]);
    svg += `<circle data-node="${c},${r}" cx="${MAPX[c]}" cy="${MAPY[r]}" r="${isNext ? 11 : 5}" class="node${isNext ? ' next' : ''}${isUndo ? ' undo' : ''}"/>`;
  }
  const end = P[P.length - 1];
  if (tr_ || routeOK(key)) svg += `<circle cx="${MAPX[end[0]]}" cy="${MAPY[end[1]]}" r="7" fill="#0f2260" pointer-events="none"/>`;
  const here = { piazza:[300, 466], sanlorenzo:[470, 112], aurora:[470, 112], santo:[690, 40], mercato:[60, 130], museo:[180, 400], galleria:[180, 400], stazione:[80, 466], farmacia:[448, 236], gelateria:[372, 338], ponte:[607, 128], parco:[118, 344], salone:[240, 160], basilica:[700, 70] }[S.scene] || [300, 466];
  /* the "!" spots (Lesson 12 on: quests and lesson spots, ui/quests.js): not while a route is being traced */
  if (!tr_) svg += mapSpotsSvg(here);
  /* fast travel: the places you know the way to, in the list beside the map (not while a route is being traced) */
  const fast = tr_ ? [] : fastDests();
  svg += `<g pointer-events="none"><path d="M${here[0]} ${here[1] - 4} l-9 -16 a10 10 0 1 1 18 0 z" fill="#c23b2a" stroke="#fff" stroke-width="2"/><text x="${here[0]}" y="${here[1] - 38}" text-anchor="middle" class="mhere">Tu sei qui</text></g></svg>`;

  const hr = hookRoute(key);
  const notesSrc = hr ? (hr.notes ? hr.notes() : null) : key === 'l5' ? S.l5notes : S.l3notes, who = hr ? (hr.who || 'they') : key === 'l5' ? 'Paolo' : 'Chiara';
  const notes = notesSrc ? `<div class="notes"><h4>${who}'s directions</h4><ol>${notesSrc.map(l => `<li>${esc(l.it)}<span class="en" hidden>${esc(l.en)}</span></li>`).join('')}</ol>
      <button class="btn small-btn" data-toggle-en>Peek at the English</button></div>` : '<div class="notes"><h4>No directions yet</h4><p class="note">Your destination isn\'t on this tourist map. Someone will have to tell you the way.</p></div>';
  let status = '';
  if (MAP.status) status = `<div class="mapstatus ${MAP.status.ok ? 'good' : 'bad'}">${MAP.status.ok ? `<b>Perfetto!</b> That is exactly the way ${who} described.` : MAP.status.msg}</div>`;
  else if (tr_) status = '<div class="mapstatus info">Start at the piazza. Tap a highlighted crossing to walk to it, tap the previous one to step back.' + (key === 'l5' ? ' You can only cross the river on a bridge.' : '') + '</div>';
  let tools = '';
  if (tr_) tools = `<div class="maptools"><button class="btn" id="mUndo" ${P.length < 2 ? 'disabled' : ''}>Undo</button><button class="btn" id="mClear">Clear</button><button class="btn primary" id="mCheck" ${P.length < 2 ? 'disabled' : ''}>Check route</button></div>`;
  else {
    /* the places you can go straight to: the list is the only fast travel (no buttons on the map: the quest spots are there) */
    const primary = d => (d.scene === 'santo' && S.tut === 'l5-tour') || (d.scene === 'sanlorenzo' && S.tut === 'l3-mark') || !!(hr && hr.dest === d.scene && hr.ok());
    const off = fastOff();
    if (fast.length) tools = `<div class="maptools fastlist"><p class="fl-head">Go straight there</p><div class="fl-items">${fast.map(d => `<button class="btn${primary(d) ? ' primary' : ''}" data-go="${d.scene}">Walk to ${d.label}</button>`).join('')}</div></div>`;
    else if (off && S.fast && Object.keys(S.fast).length > 1) tools = `<div class="maptools fastlist"><p class="fl-head">No fast travel now</p><p class="note">${esc(off)}</p></div>`;
  }
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Mappa</p><h2>Around <em>Piazza Centrale</em></h2><p class="sub">A tourist map: landmarks, no street names.</p></div>
      <button class="x" data-close aria-label="Close map">×</button></div>
    <div class="sheet-body"><div class="mapwrap"><div>${svg}</div><div>${notes}${status}${tools}</div></div></div>`;
  const b = id => $('#' + id);
  if (b('mUndo')) b('mUndo').onclick = () => { if (MAP.path.length > 1){ MAP.path.pop(); MAP.status = null; renderMap(); } };
  if (b('mClear')) b('mClear').onclick = () => { MAP.path = [routeStart()]; MAP.status = null; renderMap(); };
  if (b('mCheck')) b('mCheck').onclick = () => {
    MAP.status = checkRoute();
    if (MAP.status.ok){ if (hr) hr.onOK(); else if (MAP.key === 'l5') S.l5routeOK = true; else S.l3routeOK = true; save(); renderHUD(); toast('Route marked. Time to walk!'); }
    renderMap();
  };
  sheet.querySelectorAll('[data-go]').forEach(btn => btn.onclick = () => fastGo(btn.dataset.go));
}

/* =========================================================
   THE DICTATED MAP (shared; first used in Lesson 9, reusable for any street grid, e.g. Venice)
   The player gives someone directions and a cursor (a node + a heading) walks them on the map, inside the
   conversation: the route grows sentence by sentence. The lesson turns direction intents into mapStep() calls.

   mapDictStart(cfg)   cfg = { start:[c,r], heading:'N'|'E'|'S'|'W', area:[[c,r],…], areaLabel?, grid?, steps? }
                       grid: default cityGrid() (the city map). A grid is { cols, rows, px([c,r]) → [x,y], step:[dx,dy],
                       blocked(a, b) → null | 'edge' | 'river' | any reason, landmarks:[{ t, nodes }], base() → svg, view, label }.
                       steps: earlier steps to replay (mapDictState().steps, e.g. from a save).
   mapStep(op)         op = { k:'straight' }                   to the next crossroads
                            { k:'straightUntil' }              on until the edge, the river or a landmark you weren't already at
                            { k:'turn', dir:'L'|'R', move? }   turn, then (unless move:false) on to the next crossroads
                            { k:'nth', n, dir?, move? }        n crossroads on, then turn (and on to the next one)
                            { k:'until', lm:'farmacia' }       on until that landmark
                       → { ok, op, path:[[c,r],…] (start included), reason?, stop?, arrived }. A step that can't be done
                       (ok:false; reason 'edge', 'river', 'nolandmark') leaves the cursor where it was; the attempt is
                       drawn red (MAPD.bad) until the next step or undo.
   mapUndo()           takes the last step back (→ the step, or null)     mapArrived()  the cursor is in the area
   mapHintStep()       the first op of a shortest way from the cursor to the area (for "try this" hints)
   mapDictState()      { node, heading, steps:[{ op }] }: save it, pass steps back to mapDictStart to restore
   mountDictMap(o)     shows the map inside the open conversation (#dlgMap, #dialog.with-map: beside the transcript on
                       wide screens, above it on phones). o = { title, undo?:fn } (undo adds a "Cancella" button).
   mapDictNote(html, kind)  the status line under the title (kind: 'good' | 'bad' | ''); renderDictMap() redraws.
   unmountDictMap()    closeDialog calls it.    mapDictDbg() → __dbg().dict */
const HEADINGS = { N:[0, -1], E:[1, 0], S:[0, 1], W:[-1, 0] };
const TURN = { L:{ N:'W', W:'S', S:'E', E:'N' }, R:{ N:'E', E:'S', S:'W', W:'N' } };
const HEAD_ANGLE = { N:-90, E:0, S:90, W:180 };
/* a landmark is "at" the corners of its block that are within 80 px of it (a church fills its block) */
function cityLmNodes(l){
  const lo = (A, v) => { let k = 0; A.forEach((a, i) => { if (a <= v) k = i; }); return k; };
  const c0 = lo(MAPX, l.x), r0 = lo(MAPY, l.y), out = [];
  [c0, c0 + 1].forEach(c => [r0, r0 + 1].forEach(r => {
    if (c < MAPX.length && r < MAPY.length && Math.hypot(MAPX[c] - l.x, MAPY[r] - l.y) <= 80) out.push([c, r]);
  }));
  return out;
}
function cityGrid(){
  return {
    cols:MAPX.length, rows:MAPY.length, step:[120, 90], px:([c, r]) => [MAPX[c], MAPY[r]],
    blocked(a, b){
      if (b[0] < 0 || b[1] < 0 || b[0] >= MAPX.length || b[1] >= MAPY.length) return 'edge';
      if (a[1] === b[1] && Math.min(a[0], b[0]) === 4 && !BRIDGES.includes(a[1])) return 'river';
      return null;
    },
    landmarks:mapLandmarks().map((l, i) => ({ t:l.t, i, nodes:cityLmNodes(l) })),
    base:() => cityMapBase({ hoods:true, riverY:388 }),
    view:'0 0 720 440', label:'Map of the streets around Piazza Centrale',
  };
}
let MAPD = null;
function mapDictStart(cfg){
  MAPD = { G:cfg.grid || cityGrid(), start:[...cfg.start], heading0:cfg.heading, node:[...cfg.start], heading:cfg.heading,
    area:cfg.area.map(n => [...n]), areaLabel:cfg.areaLabel || '', steps:[], bad:null, ui:null, note:null };
  (cfg.steps || []).forEach(s => mapStep(s.op));
  MAPD.bad = null;
  return MAPD;
}
const mapDictState = () => MAPD ? { node:[...MAPD.node], heading:MAPD.heading, steps:MAPD.steps.map(s => ({ op:{ ...s.op } })) } : null;
const mapArrived = (D = MAPD) => !!D && D.area.some(n => nodeEq(n, D.node));
/* the landmarks at a node (of one type, or any) */
const mapLmAt = (node, t) => MAPD.G.landmarks.filter(l => (!t || l.t === t) && l.nodes.some(n => nodeEq(n, node)));
function mapStep(op){
  const D = MAPD, G = D.G;
  let node = D.node, h = D.heading, stop = null;
  const path = [node];
  const fail = reason => { D.bad = { path:path.slice(), h, reason }; return { ok:false, op, path, reason, arrived:mapArrived() }; };
  /* one crossroads on: null when done, else the reason it can't be */
  const step = () => { const [dx, dy] = HEADINGS[h], nb = [node[0] + dx, node[1] + dy], why = G.blocked(node, nb); if (why) return why; node = nb; path.push(nb); return null; };
  let why;
  if (op.k === 'straight'){ if ((why = step())) return fail(why); }
  else if (op.k === 'straightUntil'){
    const seen = new Set(mapLmAt(node));                     // landmarks you were already standing at don't stop you
    if ((why = step())) return fail(why);
    for (;;){
      const lm = mapLmAt(node).find(l => !seen.has(l));
      if (lm){ stop = 'landmark:' + lm.t; break; }
      const [dx, dy] = HEADINGS[h], w = G.blocked(node, [node[0] + dx, node[1] + dy]);
      if (w){ stop = w; break; }
      step();
    }
  }
  else if (op.k === 'turn'){ h = TURN[op.dir][h]; if (op.move !== false && (why = step())) return fail(why); }
  else if (op.k === 'nth'){
    for (let i = 0; i < op.n; i++) if ((why = step())) return fail(why);
    if (op.dir){ h = TURN[op.dir][h]; if (op.move !== false && (why = step())) return fail(why); }
  }
  else if (op.k === 'until'){
    if ((why = step())) return fail(why);
    while (!mapLmAt(node, op.lm).length) if (step()) return fail('nolandmark');
    stop = 'landmark:' + op.lm;
  }
  else return fail('unknown');
  D.steps.push({ op:{ ...op }, path, from:D.heading, heading:h });
  D.node = node; D.heading = h; D.bad = null;
  return { ok:true, op, path, stop, arrived:mapArrived() };
}
function mapUndo(){
  const D = MAPD; if (!D) return null;
  D.bad = null;
  const s = D.steps.pop(); if (!s) return null;
  D.node = s.path[0]; D.heading = s.from;
  return s;
}
/* breadth-first over (node, heading): straight on, or turn left / right and go one crossroads */
function mapHintStep(){
  const D = MAPD; if (!D || mapArrived()) return null;
  const key = (n, h) => n.join(',') + h, seen = new Set([key(D.node, D.heading)]);
  let q = [{ n:D.node, h:D.heading, first:null }];
  while (q.length){
    const nq = [];
    for (const s of q) for (const op of [{ k:'straight' }, { k:'turn', dir:'L' }, { k:'turn', dir:'R' }]){
      const h = op.k === 'turn' ? TURN[op.dir][s.h] : s.h, [dx, dy] = HEADINGS[h], nb = [s.n[0] + dx, s.n[1] + dy];
      if (D.G.blocked(s.n, nb) || seen.has(key(nb, h))) continue;
      const first = s.first || op;
      if (D.area.some(a => nodeEq(a, nb))) return first;
      seen.add(key(nb, h)); nq.push({ n:nb, h, first });
    }
    q = nq;
  }
  return null;
}
function mapDictSvg(){
  const D = MAPD; if (!D) return '';
  const G = D.G, P = n => G.px(n), pts = A => A.map(n => P(n).join(',')).join(' ');
  let s = `<svg class="mapsvg dictsvg" viewBox="${G.view}" role="img" aria-label="${esc(G.label)}: the route so far">${G.base()}`;
  const xs = D.area.map(n => P(n)[0]), ys = D.area.map(n => P(n)[1]);
  const ax = Math.min(...xs) - 32, ay = Math.max(2, Math.min(...ys) - 32);
  s += `<rect class="dm-area${mapArrived() ? ' on' : ''}" x="${ax}" y="${ay}" width="${Math.max(...xs) + 32 - ax}" height="${Math.max(...ys) + 32 - ay}" rx="22"/>`;
  for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++){ const [x, y] = P([c, r]); s += `<circle cx="${x}" cy="${y}" r="3.5" class="dm-dot"/>`; }
  const full = [D.start, ...D.steps.flatMap(st => st.path.slice(1))];
  if (full.length > 1) s += `<polyline points="${pts(full)}" class="dm-route-o"/><polyline points="${pts(full)}" class="dm-route"/>`;
  if (D.bad){
    const B = D.bad.path.map(P), [lx, ly] = B[B.length - 1], [dx, dy] = HEADINGS[D.bad.h];
    const ex = lx + dx * G.step[0] * 0.55, ey = ly + dy * G.step[1] * 0.55;
    s += `<polyline points="${B.map(p => p.join(',')).join(' ')} ${ex},${ey}" class="dm-bad"/>
      <g class="dm-x" transform="translate(${ex} ${ey})"><circle r="11"/><path d="M-5 -5L5 5M5 -5L-5 5"/></g>`;
  }
  const [sx, sy] = P(D.start);
  s += `<g class="dm-start"><circle cx="${sx}" cy="${sy}" r="8"/></g>`;
  D.steps.forEach((st, i) => {
    if (i === D.steps.length - 1) return;                   // the cursor stands on the last one
    const [x, y] = P(st.path[st.path.length - 1]);
    s += `<g class="dm-num" transform="translate(${x + 13} ${y - 13})"><circle r="9"/><text y="4" text-anchor="middle">${i + 1}</text></g>`;
  });
  const [cx, cy] = P(D.node);
  s += `<g class="dm-cursor" transform="translate(${cx} ${cy}) rotate(${HEAD_ANGLE[D.heading]})">
      <circle r="21" class="dm-halo"/><path d="M17 -8 L30 0 L17 8 Z" class="dm-arrow"/>
      <rect x="-15" y="-8" width="9" height="16" rx="3.5" class="dm-pack"/><ellipse rx="7.5" ry="12.5" class="dm-body"/><circle cx="1" r="6.8" class="dm-head"/></g>`;
  return s + '</svg>';
}
function mountDictMap(o = {}){
  if (!MAPD || !dialogOpen) return;
  MAPD.ui = o;
  let el = $('#dlgMap');
  if (!el){ el = document.createElement('div'); el.id = 'dlgMap'; el.className = 'dlgmap'; dlg.insertBefore(el, tr); }
  dlg.classList.add('with-map');
  renderDictMap(); scrollTr();
}
function unmountDictMap(){ const el = $('#dlgMap'); if (el) el.remove(); dlg.classList.remove('with-map'); if (MAPD) MAPD.ui = null; }
function mapDictNote(html, kind){ if (!MAPD) return; MAPD.note = html ? { html, kind:kind || '' } : null; renderDictMap(); }
function renderDictMap(){
  const el = $('#dlgMap'); if (!el || !MAPD) return;
  const o = MAPD.ui || {}, n = MAPD.note;
  el.innerHTML = `<div class="dm-top"><p class="dm-title">${o.title || 'Your directions'}</p>
      ${o.undo ? `<button class="tile dm-undo" id="dmUndo" ${MAPD.steps.length || MAPD.bad ? '' : 'disabled'} title="Take the last step back">↶ Cancella</button>` : ''}</div>
    <div class="dm-svg">${mapDictSvg()}</div>
    <p class="dm-status ${n ? n.kind : ''}">${n ? n.html : ''}</p>`;
  const u = el.querySelector('#dmUndo'); if (u) u.onclick = () => { if (!convoBusy) o.undo(); };
}
function mapDictDbg(){
  const D = MAPD; if (!D) return { on:false };
  return { on:true, mounted:!!$('#dlgMap'), node:[...D.node], heading:D.heading, steps:D.steps.length, bad:D.bad ? D.bad.reason : null, arrived:mapArrived(),
    path:[D.start, ...D.steps.flatMap(st => st.path.slice(1))].map(n => n.join(',')) };
}
