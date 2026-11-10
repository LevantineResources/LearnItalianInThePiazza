/* Lesson 15 · Venezia, walked by the keyboard only (arrow keys and E; no __debug.place, no teleports of the player), the way the
   designer plays it (docs/playtest-notes.md, 7 Nov evening: stuck under the departures board; the information desk not answering E;
   Margaret's following). The lesson's states are set with __debug.l15At where the conversations themselves are not the point
   (tests/l15-venezia.js plays those); every move after that is a key held down.
   - Santa Lucia: Margaret on the platform (E), then down the platform into the hall, under the departures board, back and forth
     (Margaret walking back onto the player used to put Biscuit at the player's feet: an obstacle, so the player could not move at all);
     E under the board reads it; round the column, the tables, the benches; the information desk: walk up, face it, E → the clerk
     (Margaret and Biscuit never take the E); the bar: E → the barista; the glass doors (E) → the fondamenta.
   - Margaret walks behind at a steady distance, never onto the player; through every door she (and Biscuit) arrive beside the player,
     outside any wall or desk; Biscuit never blocks the player and is never the one E talks to while someone else is in reach.
   - Ferrovia: the steps, the fondamenta, the ACTV booth (E → the seller), the bench (E), Bepi beside the bench (E → Bepi), the tour
     group at the gate (Permesso by walking into them), the deckhand between the readers (E → his line), the two readers (E, E) → the
     voyage. At every stop the player can move away in at least two directions.
   Screenshots: review/fix-l15/*.jpg */
const { play } = require('./lib/harness');
const path = require('path'), fs = require('fs');
const REVIEW = path.resolve(__dirname, '..', 'review', 'fix-l15');
fs.mkdirSync(REVIEW, { recursive:true });

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const pos = async () => (await dbg()).me;
  const shot = async name => { await p.waitForTimeout(200); await p.screenshot({ path:path.join(REVIEW, name + '.jpg'), type:'jpeg', quality:74 }); console.log('   shot', name); };
  const until = async (fn, ms = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } return false; };
  const KX = { '-1':'ArrowLeft', '1':'ArrowRight' }, KY = { '-1':'ArrowUp', '1':'ArrowDown' };
  const held = new Set();
  const setKeys = async want => {
    for (const k of [...held]) if (!want.includes(k)){ await p.keyboard.up(k); held.delete(k); }
    for (const k of want) if (!held.has(k)){ await p.keyboard.down(k); held.add(k); }
  };
  /* walk to (x, y) by the arrow keys (both axes at once while needed); false if no progress for 1.2 s */
  const walkTo = async (x, y, tol = 7, label = '') => {
    let last = await pos(), still = 0;
    for (let i = 0; i < 400; i++){
      const [px, py] = await pos(), dx = x - px, dy = y - py;
      if (Math.abs(dx) <= tol && Math.abs(dy) <= tol){ await setKeys([]); return true; }
      const want = [];
      if (Math.abs(dx) > tol) want.push(KX[Math.sign(dx)]);
      if (Math.abs(dy) > tol) want.push(KY[Math.sign(dy)]);
      await setKeys(want); await p.waitForTimeout(30);
      const now = await pos();
      if (Math.hypot(now[0] - last[0], now[1] - last[1]) < 0.5) still += 30; else still = 0;
      last = now;
      if (still > 1200){ await setKeys([]); console.log(`   stuck walking to ${label || [x, y]} at ${now}`); return false; }
    }
    await setKeys([]); return false;
  };
  const route = async (pts, label) => { for (const [x, y] of pts) if (!await walkTo(x, y, 7, label)) return false; return true; };
  const tap = async (k, ms = 90) => { await p.keyboard.down(k); await p.waitForTimeout(ms); await p.keyboard.up(k); await p.waitForTimeout(120); };
  /* can the player move away from here? each direction held for a moment, then back */
  const canMove = async () => {
    const ok = [];
    for (const [k, back] of [['ArrowUp', 'ArrowDown'], ['ArrowDown', 'ArrowUp'], ['ArrowLeft', 'ArrowRight'], ['ArrowRight', 'ArrowLeft']]){
      const a = await pos(); await tap(k, 130); const b = await pos();
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 4){ ok.push(k.slice(5)); await walkTo(a[0], a[1], 4); }
    }
    return ok;
  };
  let trapped = [];
  const free = async where => { const m = await canMove(); if (m.length < 2) trapped.push(where + ' (' + (await pos()) + ': ' + m.join() + ')'); return m; };
  const face = async k => { await tap(k, 40); };
  /* walk into what is ahead (a counter) until it stops you */
  const push = async k => { await p.keyboard.down(k); let a = await pos(); for (let i = 0; i < 40; i++){ await p.waitForTimeout(60); const b = await pos(); if (b[0] === a[0] && b[1] === a[1]) break; a = b; } await p.keyboard.up(k); await p.waitForTimeout(150); };
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(300); };
  const who = () => p.evaluate(() => document.querySelector('#dialog:not([hidden]) #dlgWho')?.textContent.trim() || '');
  const leave = async () => { if (await p.isVisible('#dialog')) await p.click('#dlgClose'); await p.waitForTimeout(600); };
  const mgGap = d => Math.hypot(d.l15.margaret.at[0] - d.me[0], d.l15.margaret.at[1] - d.me[1]);
  const inWall = () => p.evaluate(() => __debug.walkCheck());
  /* Margaret's distance while walking a straight line: steady, never on the player */
  const sampleWalk = async (k, ms) => {
    const gaps = []; let moves = 0, stops = 0, wasMoving = null;
    await p.keyboard.down(k); const t0 = Date.now();
    while (Date.now() - t0 < ms){ await p.waitForTimeout(60); const d = await dbg(); gaps.push(mgGap(d)); const m = d.l15.margaret.moving; if (wasMoving === true && !m) stops++; if (m) moves++; wasMoving = m; }
    await p.keyboard.up(k); await p.waitForTimeout(150);
    return { gaps, stops, moves };
  };

  /* ---------- the platform: Margaret ---------- */
  await t.jump(15); await p.waitForTimeout(600);
  let d = await dbg();
  t.check('Lesson 15 starts on the platform (keyboard walk test)', d.scene === 'santalucia' && d.tut === 'l15-start');
  t.check('the spawn is free (no collider at the player, Margaret, Biscuit)', (await inWall()).length === 0);
  await free('the platform spawn');
  await route([[505, 96]]); await face('ArrowUp');
  d = await dbg(); console.log('   E target on the platform:', d.venezia.talk);
  await press('e');
  t.check('E beside Margaret talks to her (not Biscuit)', await until(() => p.isVisible('#dialog'), 4000) && /Margaret/.test(await who()));
  await p.waitForSelector('#choices:not([hidden]) button', { timeout:10000 }); await p.click('#choices button >> nth=0'); await p.waitForTimeout(900);
  await leave();
  d = await dbg();
  t.check('Margaret follows (l15-ask)', d.tut === 'l15-ask' && d.l15.following);

  /* ---------- down the platform: Margaret behind at a steady distance ---------- */
  await walkTo(470, 110, 3);
  const s1 = await sampleWalk('ArrowDown', 1500);
  const g1 = s1.gaps.slice(6);
  console.log('   Margaret behind (px):', g1.map(Math.round).join(' '), '· stops while walking:', s1.stops);
  t.check('walking down the platform, Margaret follows 34–70 px behind, steadily (never stopping and starting)', g1.length > 4 && g1.every(g => g > 34 && g < 70) && s1.stops === 0);

  /* ---------- the departures board: under it, back and forth (the designer got stuck here) ---------- */
  await route([[480, 250]], 'the board');
  await shot('01-hall-under-the-board');
  d = await dbg();
  t.check('under the departures board: E reads it (the board, not Margaret or Biscuit)', d.venezia.near === 'sl-tabellone' && !d.venezia.talk);
  await press('e'); await p.waitForTimeout(400);
  t.check('…the board toast', await p.evaluate(() => /Partenze/.test(document.querySelector('#toast')?.textContent || document.body.innerText)));
  for (const [x, y] of [[480, 330], [480, 240], [520, 300], [430, 250], [480, 360], [480, 270], [470, 252]]){
    const ok = await walkTo(x, y, 7, 'under the board');
    if (!ok) trapped.push('walking to ' + [x, y]);
    await p.waitForTimeout(500);
    await free('under the board, at ' + [x, y]);
  }
  d = await dbg();
  t.check('back and forth under the board: Margaret steps aside, never trapped (' + trapped.join('; ') + ')', !trapped.length);
  t.check('Margaret never ends up on the player', mgGap(d) > 24);
  await shot('02-hall-past-the-board');

  /* ---------- round every object in the hall ---------- */
  const hall = [[470, 380], [420, 380], [420, 478], [520, 478], [520, 380], [470, 380],     // round the column with the map
    [700, 370], [910, 370], [910, 560], [700, 560], [700, 370], [802, 370], [802, 458], [700, 458], [700, 560], [802, 556], [910, 458], [802, 458],   // round the bar's tables
    [802, 370], [640, 370], [600, 560], [250, 560], [250, 500], [100, 500], [60, 495], [60, 436], [100, 436], [230, 436], [230, 580], [60, 580],   // round the benches
    [60, 380], [262, 380], [262, 300], [262, 222], [340, 222], [340, 300]];          // the desk's ends, the barrier
  let ok = true;
  for (const [x, y] of hall){ if (!await walkTo(x, y, 3, 'the hall tour')) ok = false; await free('the hall, at ' + [x, y]); }
  t.check('a walk round the column, the tables, the benches and the desk: always reached, never trapped (' + trapped.join('; ') + ')', ok && !trapped.length);
  t.check('…and nobody (Margaret, Biscuit) is inside a wall, a desk or a table', (await inWall()).length === 0 || console.log('   in walls:', await inWall()));

  /* ---------- the information desk: walk up, face it, E ---------- */
  await route([[144, 400], [144, 360]], 'the desk');
  await push('ArrowUp'); await p.waitForTimeout(700);
  d = await dbg();
  console.log('   at the desk', d.me, 'E target:', d.venezia.talk, 'Margaret', d.l15.margaret.at, 'Biscuit', d.l15.biscuit.at);
  t.check('walked up to the desk (its front), E talks to the clerk', d.venezia.talk === 'infopoint');
  await shot('03a-at-the-info-desk');
  await press('e');
  t.check('…the information desk conversation opens (Impiegato)', await until(() => p.isVisible('#dialog'), 4000) && /Informazioni/.test(await who()));
  await p.waitForTimeout(1500); await shot('03-info-desk-conversation');
  await leave();
  /* from the desk's left and right thirds too */
  for (const x of [110, 180]){ await route([[x, 380], [x, 360]]); await push('ArrowUp'); d = await dbg(); console.log('   at', d.me, d.venezia.talk); t.check(`at the desk's front at x ${x}, E talks to the clerk`, d.venezia.talk === 'infopoint'); }
  /* tap-to-walk to the clerk (his approach point) still works */
  await route([[300, 420]]);
  await t.clickWorld(144, 280);
  t.check('a tap on the clerk walks to the desk and talks', await until(() => p.isVisible('#dialog'), 8000) && /Informazioni/.test(await who()));
  await leave();

  /* ---------- the state outside (the conversations are tests/l15-venezia.js), then the bar, the doors ---------- */
  await p.evaluate(() => __debug.l15At('l15-breakfast')); await p.waitForTimeout(2600);
  d = await dbg();
  t.check('l15-breakfast in the hall (by the bar); Margaret beside the player, not in a wall', d.scene === 'santalucia' && mgGap(d) < 70 && (await inWall()).length === 0);
  await route([[800, 330]]); await push('ArrowUp');
  d = await dbg();
  t.check('at the bar\'s counter, E talks to the barista', d.venezia.talk === 'baristaSL');
  await press('e');
  t.check('…the barista answers', await until(() => p.isVisible('#dialog'), 4000) && /Bar della stazione/.test(await who()));
  await leave();
  await route([[700, 520], [480, 560]], 'the doors');
  await walkTo(480, 574, 4);
  d = await dbg();
  t.check('at the glass doors E is the door (Margaret behind never takes it)', d.venezia.near === 'sl-out' && !d.venezia.talk);
  await press('e');
  t.check('through the doors: the fondamenta', await until(async () => (await dbg()).scene === 'ferrovia', 6000));
  await p.waitForTimeout(1900);
  d = await dbg();
  console.log('   arrived', d.me, 'Margaret', d.l15.margaret.at, 'Biscuit', d.l15.biscuit.at);
  t.check('Margaret arrives beside the player (and Biscuit beside her), outside the façade and the walls', mgGap(d) < 60 && mgGap(d) > 20
    && Math.hypot(d.l15.biscuit.at[0] - d.l15.margaret.at[0], d.l15.biscuit.at[1] - d.l15.margaret.at[1]) < 50 && (await inWall()).length === 0);
  await shot('04-margaret-through-the-door');
  await free('the fondamenta, on arrival');
  /* down the steps: she follows */
  const s2 = await sampleWalk('ArrowDown', 900);
  t.check('down the steps, Margaret follows (34–70 px behind)', s2.gaps.slice(6).every(g => g > 34 && g < 70));

  /* back in through the station's doors, and out again: she comes along both ways */
  await route([[480, 150]]); await push('ArrowUp');
  d = await dbg();
  t.check('at the station\'s doors (outside), E is the door', d.venezia.near === 'fer-in' && !d.venezia.talk);
  await press('e');
  t.check('back into the hall', await until(async () => (await dbg()).scene === 'santalucia', 6000));
  await p.waitForTimeout(1900);
  d = await dbg();
  t.check('Margaret (and Biscuit) arrive beside the player in the hall, not in a wall', mgGap(d) < 60 && mgGap(d) > 20 && (await inWall()).length === 0);
  await free('the hall, on arrival');
  await walkTo(480, 574, 4); await press('e');
  t.check('and out again', await until(async () => (await dbg()).scene === 'ferrovia', 6000));
  await p.waitForTimeout(1900);

  /* ---------- the booth, the bench, the pontoon ---------- */
  await route([[600, 320], [760, 320], [870, 320]], 'the booth');
  await push('ArrowUp');
  d = await dbg();
  t.check('at the ACTV booth\'s window, E talks to the seller', d.venezia.talk === 'actv');
  await press('e');
  t.check('…the ticket seller answers', await until(() => p.isVisible('#dialog'), 4000) && /ACTV/.test(await who()));
  await leave();
  await free('the booth');
  await route([[700, 340], [498, 340]], 'the bench'); await walkTo(498, 346, 3); await face('ArrowDown');
  d = await dbg();
  t.check('at the bench, E is the bench', d.venezia.near === 'fer-panchina' && !d.venezia.talk);
  await press('e'); await p.waitForTimeout(500);
  await free('the bench');
  await route([[600, 380], [780, 380]], 'the pontoon'); await free('the gate');
  for (const [x, y] of [[300, 300], [120, 330], [80, 380], [200, 380], [300, 240], [200, 200], [600, 200], [610, 270]]){ await walkTo(x, y, 8, 'the fondamenta tour'); await free('the fondamenta, at ' + [x, y]); }
  t.check('round the fondamenta, the steps, the bench, the booth: never trapped (' + trapped.join('; ') + ')', !trapped.length);

  /* ---------- Bepi beside the bench ---------- */
  await p.evaluate(() => __debug.l15At('l15-bepi', { bepiCome:true })); await p.waitForTimeout(2600);
  await route([[498, 330]]); await walkTo(498, 346, 3); await face('ArrowRight'); await p.waitForTimeout(400);
  d = await dbg();
  t.check('from the bench\'s seat, E talks to il signor Bepi (beside it)', d.venezia.talk === 'bepi');
  await press('e');
  t.check('…Bepi answers', await until(() => p.isVisible('#dialog'), 4000) && /fondamenta/.test(await who()));
  await leave();

  /* ---------- the gate: the tour group, the deckhand, the readers ---------- */
  await p.evaluate(() => __debug.l15At('l15-board')); await p.waitForTimeout(2600);
  await route([[680, 330]]);
  /* walk into the group: the Permesso pick */
  await p.keyboard.down('ArrowRight');
  const picked = await until(async () => !!(await dbg()).crowd.pick, 4000);
  await p.keyboard.up('ArrowRight');
  t.check('walking into the tour group opens the Permesso pick', picked);
  if (picked){ await p.click('#crowdPick [data-pick="permesso"]'); await p.waitForTimeout(4500); }
  await free('beside the tour group');
  await route([[780, 360], [780, 384]], 'the gate'); await walkTo(780, 382, 2); await face('ArrowDown'); await walkTo(780, 382, 2);
  d = await dbg(); console.log('   at the gate', d.me, 'door:', d.venezia.near, 'E:', d.venezia.talk, 'crowd:', JSON.stringify(d.crowd.people));
  t.check('in the middle of the gangway, E is the deckhand', d.venezia.talk === 'marinaio' && !d.venezia.near);
  await press('e'); await p.waitForTimeout(500);
  t.check('…his line in a bubble', (await dbg()).crowd.bubbles.some(b => /Convalidi/.test(b[1])));
  await walkTo(766, 382, 2); d = await dbg();
  t.check('beside the left reader, E is the reader (not the deckhand)', d.venezia.near === 'lettore1' && !d.venezia.talk);
  await press('e'); await p.waitForTimeout(500);
  await walkTo(794, 382, 2); d = await dbg();
  t.check('beside the right reader, E is the reader', d.venezia.near === 'lettore2' && !d.venezia.talk);
  await press('e');
  t.check('two tickets validated: the voyage starts', await until(async () => { const x = await dbg(); return x.l15.validated >= 2 && (x.cut.on || x.scene === 'vaporetto'); }, 5000));
  t.check('never trapped anywhere (' + trapped.join('; ') + ')', !trapped.length);
}, { fakeSpeech:true });
