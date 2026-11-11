/* The shop interior template (Lesson 12 on: the pharmacy, the gelateria; reusable for any small shop). A shop is a small
   interior scene seen from above, like Caffè Aurora: a back wall with the shop's sign, fixtures (shelves, a glass display
   case) with their stock, a counter or a case with the shopkeeper behind it, a few props, and the door at the bottom with
   the shop window either side (the street outside: dark at night). Drawing: render/shops.js.

   shopScene(cfg) registers SCENES[cfg.id] (lit at night: INTERIOR) and returns cfg. cfg = {
     id:'farmacia', name:'Farmacia', sign:'FARMACIA', sub:'Via Garibaldi',           the scene key, the title on travel, the wall sign
     colors:{ wall, trim, floor:[a, b], shelf, shelfDark, counter, counterTop, accent, sign, signInk },
     icon:'cross' | 'cone' | null,                                                      a mark beside the sign
     keeper:'farmacista',                                                               the shopkeeper (an NPC in this scene; content/npcs.js)
     counter:{ x, y, w, h, kind:'banco' | 'vetrina', till?:true },                     walk-blocking; the keeper stands behind it
     behind:{ x, y, w, h },                                                             the floor behind the counter (blocked for the player)
     fixtures:[{ id, kind:'shelf' | 'case', x, y, w, h, face:'S' | 'E' | 'W',           where the player stands to look (south, east…)
                 name_it:'lo scaffale', name_en:'the shelf',                            the close-up's title
                 rows:{ sopra:[item], mezzo:[item], sotto:[item] }  (a shelf: on top, on the shelves, in the baskets under it)
                 tubs:[item]  (a case: the trays behind the glass) }],
       item = { id, label:'CREMA SOLARE' (on the packet), it:'la crema solare', en:'sun cream', color, shape:'tube' | 'box' |
                'bottle' | 'jar' | 'pack' | 'brush' | 'tub' }
     props:[{ kind:'plant' | 'table' | 'poster' | 'board' | 'cones' | 'scale' | 'rug', x, y, … }],   decoration (tables block walking)
     exit:{ scene, spawn, title, sub },                                                 where the door leads
     entry?:{ scene:'sanlorenzo', door:'farmacia' },                                    a door outside that leads in
     open?:() => bool,                                                                  open now? (closed: a toast at the door)
     closedNote?:'…'                                                                    the toast when closed
   }
   A fixture is a look landmark (E or a tap, prompt Guarda): openFixture(shopId, fixtureId) shows it close up (an SVG, front
   view: on top of the shelf, the shelves, the baskets under it; or the trays in a case), every item with its Italian label.
   Clicking an item asks the hooks: shopTake(shopId, fixture, item) → { ok, msg } (a quest takes it: into the bag) or
   null (the default: "You look at it, and put it back."). An item whose id is in the bag is gone from the shelf.
   Doors: 'shopexit:<id>' (Esci), 'fx:<id>:<fixture>' (the fixtures); world/doors.js asks shopDoor(d) first.
   Tests: __dbg().shop = { id, open (the close-up), fixture, items:[ids shown], msg, near (the fixture E would open) }. */
const SHOPS = {};
const SHOP_WALL = 84;                                     // the back wall's face, seen from above (y 0 … 84)
function shopScene(cfg){
  SHOPS[cfg.id] = cfg;
  INTERIOR[cfg.id] = true;
  const C = [], R = [];
  (cfg.fixtures || []).forEach(f => R.push({ x:f.x, y:f.y, w:f.w, h:f.h }));
  if (cfg.counter) R.push({ x:cfg.counter.x, y:cfg.counter.y, w:cfg.counter.w, h:cfg.counter.h });
  if (cfg.behind) R.push({ ...cfg.behind });
  (cfg.props || []).forEach(p => { if (p.kind === 'table') C.push({ x:p.x, y:p.y, r:22 }); if (p.kind === 'plant') C.push({ x:p.x, y:p.y, r:16 }); if (p.kind === 'scale') C.push({ x:p.x, y:p.y, r:14 }); });
  R.push({ x:0, y:572, w:440, h:28 }, { x:520, y:572, w:440, h:28 });   // the front wall either side of the door
  if (cfg.room){ if (cfg.room.x0 > 0) R.push({ x:0, y:0, w:cfg.room.x0, h:H }); if (cfg.room.x1 < W) R.push({ x:cfg.room.x1, y:0, w:W - cfg.room.x1, h:H }); }
  SCENES[cfg.id] = {
    minY:SHOP_WALL + 10, spawn:{ x:480, y:548 }, C, R, shop:cfg.id,
    doors:[
      { id:'shopexit:' + cfg.id, x:480, y:572, label:'Esci', msg:'' },
      ...(cfg.fixtures || []).map(f => {
        const spot = f.face === 'E' ? { x:f.x + f.w + 22, y:f.y + f.h / 2 } : f.face === 'W' ? { x:f.x - 22, y:f.y + f.h / 2 } : { x:f.x + f.w / 2, y:f.y + f.h + 22 };
        return { id:`fx:${cfg.id}:${f.id}`, x:spot.x, y:spot.y, area:{ x:f.x, y:f.y, w:f.w, h:f.h }, look:true, lookAt:f.name_en || 'the shelf', label:'Guarda',
          hit:{ x:f.x - 4, y:f.y - 10, w:f.w + 8, h:f.h + 14 }, fixture:f.id, shop:cfg.id, msg:'' };
      }),
    ],
  };
  return cfg;
}
const shopOf = (sc = S.scene) => SHOPS[sc] || null;
const shopOpenNow = cfg => !cfg.open || !!cfg.open();
/* a shop's door from outside (an existing door, e.g. the pharmacy's in San Lorenzo) */
function shopEnter(cfg){
  if (!shopOpenNow(cfg)){ toast(cfg.closedNote || `<b>${esc(cfg.name)}</b>: chiuso.`); return; }
  travelTo(cfg.id, null, cfg.name, cfg.sub || '');
}
/* world/doors.js asks this first: the shops' own doors (out, the fixtures) and their doors from outside */
function shopDoor(d){
  if (d.id.startsWith('shopexit:')){ const c = SHOPS[d.id.slice(9)]; if (c){ const e = c.exit; travelTo(e.scene, e.spawn || null, e.title, e.sub || ''); return true; } }
  if (d.fixture && d.shop){ openFixture(d.shop, d.fixture); return true; }
  for (const c of Object.values(SHOPS)) if (c.entry && c.entry.scene === S.scene && c.entry.door === d.id && (!c.entry.when || c.entry.when())){ shopEnter(c); return true; }
  return false;
}

/* ---------- the close-up of a fixture ---------- */
const SHOPFX = { shop:null, fx:null, msg:'', kind:'' };
const fixtureOpen = () => modalOpen && sheet.classList.contains('shopfx');
const shopFixture = (shopId, fxId) => ((SHOPS[shopId] || {}).fixtures || []).find(f => f.id === fxId) || null;
/* the items still there (an item you are carrying is in your bag, not on the shelf) */
const fxItems = list => (list || []).filter(it => !bagHas(it.bag || it.id));
function openFixture(shopId, fxId, keepMsg){
  const c = SHOPS[shopId], f = shopFixture(shopId, fxId); if (!c || !f) return;
  if (!keepMsg){ SHOPFX.msg = ''; SHOPFX.kind = ''; }
  SHOPFX.shop = shopId; SHOPFX.fx = fxId;
  if (!fixtureOpen()) openModal('shopfx');
  sheet.innerHTML = `<button class="x gm-x" data-close aria-label="Close">×</button>
    <figure class="fx-fig">${fixtureSVG(c, f)}<figcaption><b>${esc(f.name_it || 'Lo scaffale')}</b> <span>· ${esc(c.name)}</span></figcaption></figure>
    <div class="gm-foot"><p class="fx-msg ${SHOPFX.kind}">${SHOPFX.msg || (f.kind === 'case' ? 'The flavours behind the glass.' : 'Tap something to take it.')}</p>
      <button class="btn primary" data-close>Close</button></div>`;
  sheet.querySelectorAll('[data-fxitem]').forEach(el => el.addEventListener('click', () => fixtureTake(el.dataset.fxitem)));
  setTimeout(() => { const b = sheet.querySelector('.gm-foot [data-close]'); if (b && fixtureOpen()) b.focus({ preventScroll:true }); }, 30);
}
function fixtureTake(itemId){
  const c = SHOPS[SHOPFX.shop], f = shopFixture(SHOPFX.shop, SHOPFX.fx); if (!c || !f) return;
  const all = f.kind === 'case' ? f.tubs : [...(f.rows.sopra || []), ...(f.rows.mezzo || []), ...(f.rows.sotto || [])];
  const it = all.find(x => x.id === itemId); if (!it) return;
  const r = askHooks('shopTake', c.id, f, it);
  if (r && r.ok){ SHOPFX.msg = r.msg || `<b>${esc(it.it)}</b>: in your bag.`; SHOPFX.kind = 'good'; }
  else if (r){ SHOPFX.msg = r.msg; SHOPFX.kind = r.kind || ''; }
  else { SHOPFX.msg = f.kind === 'case' ? `<b>${esc(it.label)}</b>. Mmm… You ask for it at the counter.` : `You look at it… and put it back.`; SHOPFX.kind = ''; }
  openFixture(c.id, f.id, true);
  renderHUD();
}
/* the fixture, front view (SVG, 640 × 360): a shelf unit on legs (things on top, two shelves, baskets under it), or a glass case */
function fixtureSVG(c, f){
  const K = c.colors || {}, VW = 640, VH = 400;
  const itemSVG = (it, x, base, w) => {
    const col = it.color || '#c23b2a', lab = esc(it.label);
    const fs = lab.length > 11 ? 8.5 : 10;
    let s = '', h = 0;
    if (it.shape === 'tube'){ h = 34; s = `<rect x="${x + 4}" y="${base - h}" width="${w - 8}" height="${h}" rx="6" fill="#fffdf8" stroke="${col}" stroke-width="2"/><rect x="${x + w - 12}" y="${base - h + 8}" width="10" height="${h - 16}" rx="2" fill="${col}"/><rect x="${x + 4}" y="${base - h}" width="${w - 8}" height="9" rx="4" fill="${col}"/>`; }
    else if (it.shape === 'bottle'){ h = 62; s = `<rect x="${x + w / 2 - 6}" y="${base - h}" width="12" height="10" rx="2" fill="#4a4e56"/><rect x="${x + 8}" y="${base - h + 9}" width="${w - 16}" height="${h - 9}" rx="9" fill="${col}"/><rect x="${x + 11}" y="${base - h + 26}" width="${w - 22}" height="22" rx="3" fill="#fffdf8"/>`; }
    else if (it.shape === 'jar'){ h = 38; s = `<rect x="${x + 8}" y="${base - h}" width="${w - 16}" height="8" rx="2" fill="#4a4e56"/><rect x="${x + 6}" y="${base - h + 7}" width="${w - 12}" height="${h - 7}" rx="6" fill="${col}"/><rect x="${x + 9}" y="${base - h + 14}" width="${w - 18}" height="18" rx="2" fill="#fffdf8"/>`; }
    else if (it.shape === 'brush'){ h = 54; s = `<rect x="${x + 10}" y="${base - h}" width="${w - 20}" height="${h}" rx="4" fill="rgba(200,228,238,.7)" stroke="#8fb3c2"/><rect x="${x + w / 2 - 3}" y="${base - h + 6}" width="6" height="${h - 12}" rx="3" fill="${col}"/><rect x="${x + w / 2 - 5}" y="${base - h + 6}" width="10" height="10" rx="2" fill="#fffdf8" stroke="${col}"/>`; }
    else if (it.shape === 'basket'){ h = 40; s = `<rect x="${x + 2}" y="${base - h}" width="${w - 4}" height="${h}" rx="4" fill="#d9d4cc" stroke="#8a8f99" stroke-width="2"/>${[0, 1, 2].map(k => `<rect x="${x + 8 + k * (w - 16) / 3}" y="${base - h - 8}" width="${(w - 16) / 3 - 3}" height="22" rx="2" fill="${col}" stroke="rgba(0,0,0,.25)"/>`).join('')}`; }
    else if (it.shape === 'pack'){ h = 30; s = `<rect x="${x + 3}" y="${base - h}" width="${w - 6}" height="${h}" rx="3" fill="${col}"/><rect x="${x + 7}" y="${base - h + 6}" width="${w - 14}" height="14" rx="2" fill="#fffdf8"/>`; }
    else { h = 46; s = `<rect x="${x + 5}" y="${base - h}" width="${w - 10}" height="${h}" rx="3" fill="${col}"/><rect x="${x + 5}" y="${base - h}" width="${w - 10}" height="10" fill="rgba(255,255,255,.35)"/><rect x="${x + 9}" y="${base - h + 16}" width="${w - 18}" height="18" rx="2" fill="#fffdf8"/>`; }
    const ty = it.shape === 'pack' ? base - h + 13 : it.shape === 'tube' ? base - h / 2 + 4 : it.shape === 'basket' ? base - 12 : it.shape === 'brush' ? base - 6 : base - h + (it.shape === 'bottle' ? 37 : it.shape === 'jar' ? 23 : 25);
    const lbl = `<text x="${x + w / 2}" y="${ty}" text-anchor="middle" font-family="Titillium Web, sans-serif" font-weight="800" font-size="${fs}" fill="${it.ink || '#1f2836'}"${it.shape === 'brush' ? ' stroke="#fffdf8" stroke-width="3" paint-order="stroke"' : ''}>${lab}</text>`;
    return `<g class="fx-item" data-fxitem="${esc(it.id)}" role="button" aria-label="${lab}" tabindex="0">${s}${lbl}<rect x="${x}" y="${base - h - 10}" width="${w}" height="${h + 12}" fill="transparent"/></g>`;
  };
  const row = (list, base, x0, x1) => { const L = fxItems(list); if (!L.length) return ''; const w = Math.min(96, (x1 - x0) / L.length); const pad = (x1 - x0 - w * L.length) / 2; return L.map((it, i) => itemSVG(it, x0 + pad + i * w, base, w)).join(''); };
  if (f.kind === 'case'){
    const T = fxItems(f.tubs), tw = Math.min(92, 560 / Math.max(1, f.tubs.length));
    const x0 = (VW - tw * f.tubs.length) / 2;
    return `<svg class="fx-svg" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${esc(f.name_en || 'the display case')}">
      <rect width="${VW}" height="${VH}" fill="${K.wall || '#f3e6cf'}"/><rect y="${VH - 70}" width="${VW}" height="70" fill="${K.floor ? K.floor[0] : '#e8dcc4'}"/>
      <rect x="30" y="120" width="${VW - 60}" height="200" rx="10" fill="${K.counter || '#c9ccd2'}"/>
      <path d="M30 130 L60 70 H${VW - 60} L${VW - 30} 130 Z" fill="rgba(200,228,238,.55)" stroke="#8fb3c2" stroke-width="2"/>
      <rect x="44" y="130" width="${VW - 88}" height="110" rx="4" fill="#eef3f5"/>
      ${f.tubs.map((it, i) => { const x = x0 + i * tw, here = T.includes(it); return `<g class="fx-item" data-fxitem="${esc(it.id)}" role="button" aria-label="${esc(it.label)}">
        <rect x="${x + 4}" y="150" width="${tw - 8}" height="64" rx="4" fill="#c9ccd2"/>
        ${here ? `<path d="M${x + 8} 176 q${(tw - 16) / 4} -22 ${(tw - 16) / 2} -6 q${(tw - 16) / 4} -18 ${(tw - 16) / 2} 4 v32 h-${tw - 16} z" fill="${it.color}"/>${it.bits ? `<g fill="${it.bits}">${[0, 1, 2, 3, 4].map(k => `<circle cx="${x + 14 + k * (tw - 24) / 4}" cy="${186 + (k % 2) * 8}" r="2.2"/>`).join('')}</g>` : ''}` : ''}
        <rect x="${x + 6}" y="222" width="${tw - 12}" height="16" rx="2" fill="#fffdf8" stroke="rgba(0,0,0,.2)"/>
        <text x="${x + tw / 2}" y="234" text-anchor="middle" font-family="Titillium Web, sans-serif" font-weight="800" font-size="${it.label.length > 10 ? 8 : 9.5}" fill="#1f2836">${esc(it.label)}</text></g>`; }).join('')}
      <rect x="30" y="250" width="${VW - 60}" height="10" fill="rgba(0,0,0,.12)"/>
      <text x="${VW / 2}" y="296" text-anchor="middle" font-family="Bodoni Moda, Georgia, serif" font-style="italic" font-weight="700" font-size="22" fill="${K.signInk || '#fffdf8'}">${esc(c.sign || c.name)}</text></svg>`;
  }
  /* a shelf unit: the top board at y 88 (things on top), shelves at 182 and 290, legs, the floor at 372 with the baskets
     under the bottom board */
  const x0 = 60, x1 = VW - 60, R = f.rows || {}, sh = K.shelf || '#b08a5a', dk = K.shelfDark || '#8a6a4a';
  return `<svg class="fx-svg" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${esc(f.name_en || 'the shelf')}">
    <rect width="${VW}" height="${VH}" fill="${K.wall || '#eef0ea'}"/><rect y="372" width="${VW}" height="28" fill="${K.floor ? K.floor[1] : '#e6e2d6'}"/>
    <rect x="${x0 - 8}" y="96" width="${x1 - x0 + 16}" height="200" rx="3" fill="${dk}"/>
    <rect x="${x0}" y="104" width="${x1 - x0}" height="186" fill="${K.shelfBack || '#f6f1e6'}"/>
    <rect x="${x0 - 12}" y="88" width="${x1 - x0 + 24}" height="10" rx="2" fill="${sh}"/>
    <rect x="${x0}" y="182" width="${x1 - x0}" height="8" fill="${sh}"/>
    <rect x="${x0 - 8}" y="290" width="${x1 - x0 + 16}" height="10" rx="2" fill="${sh}"/>
    <rect x="${x0 - 6}" y="300" width="10" height="72" fill="${dk}"/><rect x="${x1 - 4}" y="300" width="10" height="72" fill="${dk}"/>
    <ellipse cx="${VW / 2}" cy="372" rx="${(x1 - x0) / 2}" ry="5" fill="rgba(0,0,0,.10)"/>
    ${row(R.sopra, 88, x0, x1)}${row(R.mezzo, 182, x0 + 8, x1 - 8)}${row(R.mezzo2, 290, x0 + 8, x1 - 8)}${row(R.sotto, 370, x0 + 14, x1 - 14)}
  </svg>`;
}
function shopDbg(){
  const c = shopOf(), f = SHOPFX.shop ? shopFixture(SHOPFX.shop, SHOPFX.fx) : null;
  const nd = c && !frozen() ? nearLandmark() : null;
  const items = f ? (f.kind === 'case' ? fxItems(f.tubs) : fxItems([...(f.rows.sopra || []), ...(f.rows.mezzo || []), ...(f.rows.mezzo2 || []), ...(f.rows.sotto || [])])).map(i => i.id) : [];
  return { id:c ? c.id : null, open:fixtureOpen(), fixture:fixtureOpen() ? SHOPFX.fx : null, items:fixtureOpen() ? items : [], msg:fixtureOpen() ? SHOPFX.msg.replace(/<[^>]+>/g, '') : '',
    near:nd && nd.fixture ? nd.fixture : null, night:c ? daytime() === 'night' : false };
}
Object.assign(window.__debug, { fixture(shop, fx){ openFixture(shop, fx); } });

/* an item on a fixture: FX_ITEM(id, label (on the packet), it, en, color, shape, { ink?, bits? }) */
const FX_ITEM = (id, label, it, en, color, shape, o) => ({ id, label, it, en, color, shape, ...(o || {}) });
