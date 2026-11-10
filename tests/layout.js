/* The conversation dialog at real desktop / laptop window sizes: everything the player must use is on screen and
   clickable. Regression test for the Lesson 9 notepad that sat below the dialog's visible area (the list beside the tile
   bank ignored `hidden`, and the dialog clipped whatever didn't fit), and for Lesson 7's new opening (Mark's question tile).

   The heaviest dialog states are set up with the skip links and __debug, then played with tiles; in each state the window
   is resized through SIZES and every required control is checked:
     - fully inside the window and inside every clipping box around it (the dialog, the foot, the transcript), after the
       game's own auto-scroll (the foot scrolls itself to the control the player needs now: notepad, choices, typer, Dillo);
     - clickable: document.elementFromPoint at its centre is the control (or inside it);
     - nothing was scrolled that a player can't scroll (the page, #stage, #dialog: Playwright's own click would do that,
       which is how the old tests passed).
   A control marked `reach` may be scrolled to with the mouse wheel inside the dialog (a real player can); the others must
   be there without any scrolling. Then the state's main action is done with real mouse clicks and the keyboard.
   States: Lesson 9 at Teresa's (hint + tiles + the list beside them), Lesson 9's last vendor (Pina: the total in the
   notepad, three earlier totals above it), Lesson 9's dictated map (Sofia), Lesson 7's opening (an old save from before
   Mark's question, reopened: the special tile), Lesson 8's typed scene (typer + the model after two misses, then a CHOICE),
   Lesson 10's ticket (the change notepad); and the city map's fast-travel list (it scrolls inside its panel; 1280×720, 1366×768,
   1280×650 and a phone). Screenshots: tests/shots/layout-*.png at 1280×720 and 1366×768. */
const { play } = require('./lib/harness');

const SIZES = [[1280, 800], [1280, 720], [1366, 768], [1440, 900], [1920, 1080], [1280, 650]];
const SHOT_AT = ['1280x720', '1366x768'];
const NUM = ['zero','uno','due','tre','quattro','cinque','sei','sette','otto','nove','dieci','undici','dodici','tredici',
  'quattordici','quindici','sedici','diciassette','diciotto','diciannove','venti'];

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const settle = async (quiet = 1000, max = 25000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#npad') ? 5000 : 0)
        + (document.querySelector('#choices').hidden ? 0 : 20000) + (document.querySelector('#typer').hidden ? 0 : 40000), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const say = async labels => { for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const talk = async id => { await p.setViewportSize({ width:1280, height:800 }); await p.waitForTimeout(200); await t.talkTo(...(await dbg()).npcs[id]); await settle(); await t.dump(); };
  const fresh = async n => {
    await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(400);
    await p.setViewportSize({ width:1280, height:800 });
    await t.jump(n); await p.waitForTimeout(600);
    await p.evaluate(() => { if (document.querySelector('#modal:not([hidden]) [data-close]')) document.querySelector('#modal [data-close]').click(); });
  };

  /* where an element is, and what a click at its centre would hit */
  const probe = sel => p.evaluate(sel => {
    const e = document.querySelector(sel); if (!e) return { missing:true };
    const b = e.getBoundingClientRect(); if (!b.width || !b.height) return { hidden:true };
    const inside = b.top >= -0.5 && b.left >= -0.5 && b.bottom <= innerHeight + 0.5 && b.right <= innerWidth + 0.5;
    let clip = null, scroller = null;
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement){
      const cs = getComputedStyle(a);
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const c = a.getBoundingClientRect();
      if (b.top < c.top - 1 || b.bottom > c.bottom + 1 || b.left < c.left - 1 || b.right > c.right + 1){
        clip = clip || (a.id || a.className);
        if (!scroller && /auto|scroll/.test(cs.overflowY) && a.scrollHeight > a.clientHeight) scroller = { sel:'#' + a.id, x:c.left + c.width / 2, y:c.top + Math.min(c.height / 2, 40), dir:b.top < c.top ? -1 : 1 };
      }
    }
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    const hitOk = !!hit && (hit === e || e.contains(hit));
    const r = [b.left, b.top, b.right, b.bottom].map(Math.round);
    return { ok:inside && !clip && hitOk, inside, clip, hitOk, hit:hit ? (hit.id || hit.className || hit.tagName) : null, r, scroller };
  }, sel);
  const unscrolled = () => p.evaluate(() => (document.scrollingElement.scrollTop || 0) + document.querySelector('#stage').scrollTop + document.querySelector('#dialog').scrollTop === 0);

  /* every control at every size; returns false if any failed */
  const checkAll = async (label, controls) => {
    let all = true;
    for (const [w, h] of SIZES){
      await p.setViewportSize({ width:w, height:h }); await p.waitForTimeout(450);
      await p.evaluate(() => { document.getElementById('toasts').innerHTML = ''; });   // (toasts fade on their own; a screenshot without them)
      const bad = [];
      for (const c of controls){
        let r = await probe(c.sel), wheels = 0;
        if (c.opt && (r.hidden || r.missing)) continue;                       // (only when it is there)
        if (!r.ok && c.reach){
          while (!r.ok && r.scroller && wheels < 12){ await p.mouse.move(r.scroller.x, r.scroller.y); await p.mouse.wheel(0, 90 * r.scroller.dir); await p.waitForTimeout(120); wheels++; r = await probe(c.sel); }
        }
        if (!r.ok) bad.push(`${c.name} ${JSON.stringify(r)}`);
        else if (wheels) console.log(`   ${label} @${w}x${h}: ${c.name} reached with ${wheels} wheel step(s)`);
      }
      const still = await unscrolled();
      const ok = !bad.length && still;
      t.check(`layout: ${label} @${w}x${h}, every control on screen and clickable`, ok);
      if (!ok) console.log('     ✗ ' + (still ? '' : 'page/stage/dialog scrolled; ') + bad.join(' | '));
      if (SHOT_AT.includes(`${w}x${h}`)) await t.shot(`layout-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${w}x${h}`);
      all = all && ok;
    }
    return all;
  };
  /* a real player's click: at the centre of the control, which must be on screen */
  const realClick = async sel => {
    const r = await probe(sel);
    if (!r.ok) console.log(`   ✗ ${sel} not clickable: ${JSON.stringify(r)}`);
    await p.mouse.click((r.r[0] + r.r[2]) / 2, (r.r[1] + r.r[3]) / 2);
    return r.ok;
  };
  /* the most recent listening line's replay button (a stable selector for the probe) */
  const tagListen = () => p.evaluate(() => { const b = [...document.querySelectorAll('#transcript .listen-btn')].pop(); document.querySelectorAll('[data-t-listen]').forEach(x => x.removeAttribute('data-t-listen')); if (b) b.setAttribute('data-t-listen', ''); return !!b; });

  /* ========== Lesson 9: the stalls ========== */
  console.log('LESSON 9');
  await fresh(9);
  const l9At = async paidIds => p.evaluate(ids => {
    const l9 = __dbg().l9, IT = { teresa:['maglietta'], franco:['cravatta', 'sciarpa'], gino:['rosa', 'girasole'], pina:['arancia', 'pomodoro', 'melone'] };
    ids.forEach(id => { IT[id].forEach(k => { l9.order[id][k] = l9.list[k]; }); l9.said[id] = l9.paid[id] = true; l9.noted[id] = l9.totals[id]; l9.checked[id] = true; });
    Object.assign(l9, { barrier:true, listSeen:true });
    __debug.set({ vocab9:true, practiceDone9:true, vocabCheck9:true, tut:'l9-shopping', l9 });
  }, paidIds);
  await l9At([]);
  let d = await dbg(); const L = d.l9.list;
  /* Teresa: the hint, the list beside the tiles */
  await talk('teresa');
  await say(['Buongiorno', 'Come sta?']); await say(['Sto bene, grazie']);
  await say(['Vorrei', NUM[L.maglietta], 'magliette', 'rossa']);                // (the agreement hint: two lines)
  t.check('L9 Teresa: hint, tiles and the list are up', await p.isVisible('#hint') && await p.isVisible('#dlgList') && await p.isVisible('#bank'));
  await checkAll('L9 tiles and list', [{ name:'hint', sel:'#hint' }, { name:'sentence', sel:'#sentence' }, { name:'tile bank', sel:'#bank' }, { name:'the list', sel:'#dlgList', reach:true },
    { name:'Clear', sel:'#btnClear' }, { name:'Dillo', sel:'#btnSay' }]);
  await t.leave();

  /* Pina, the last vendor: the total in the notepad, three totals above it */
  await l9At(['teresa', 'franco', 'gino']);
  d = await dbg();
  await talk('pina');
  await say(['Buongiorno', 'Come sta?']); await say(['Sto bene, grazie']);
  await say(['Vorrei', NUM[L.arancia], 'arance', 'e', NUM[L.pomodoro], 'pomodori', 'e', 'un', 'melone']);
  if (!(await dbg()).pad.open) await say(['Sì']);                                // (Pina checks: Quanti pomodori? Sei?)
  await until(async () => (await dbg()).pad.open, 'the notepad'); await settle();
  t.check('L9 Pina: the notepad is open, the tile bank and the list are hidden', (await dbg()).pad.label.includes('Pina') && await p.isHidden('#builder') && await p.isHidden('#dlgList'));
  await tagListen();
  await checkAll('L9 last vendor notepad', [{ name:'notepad input', sel:'#npadInput' }, { name:'Write it down', sel:'#npadOK' }, { name:'Ascolta di nuovo', sel:'[data-t-listen]' }]);
  /* write the total as a player: click the box, type, Enter */
  await p.setViewportSize({ width:1280, height:720 }); await p.waitForTimeout(300);
  const T9 = (await dbg()).l9.totals.pina;
  const c9 = await realClick('#npadInput');
  await p.keyboard.type(String(T9)); await p.keyboard.press('Enter'); await p.waitForTimeout(400); await settle(); await t.dump();
  t.check('L9 Pina: the total written with a real click and the keyboard', c9 && (await dbg()).l9.noted.pina === T9 && !(await dbg()).pad.open);
  await say(['Ecco', 'venti', 'euro']);
  t.check('L9 Pina: paid, the last stall', (await dbg()).l9.paid.pina);
  await t.leave();

  /* Sofia: the dictated map in the dialog, the tiles, Cancella */
  await p.evaluate(() => { const L = __dbg().l9; __debug.set({ tut:'l9-directions', l9:Object.assign(L, { sofia:{ phase:'dir' }, done:false, route:[] }) }); __debug.travel('mercato', { x:480, y:520 }); });
  await p.waitForTimeout(2600);
  await talk('sofia');
  await until(async () => (await dbg()).dict.mounted, 'the map');
  await say(['Vada dritto']);
  await say(['San Lorenzo è lì.']);                                             // (not there yet: Sofia isn't fooled, a hint)
  t.check('L9 Sofia: the map, a hint, the tiles', await p.isVisible('#dlgMap svg') && await p.isVisible('#bank'));
  await checkAll('L9 dictated map', [{ name:'map', sel:'#dlgMap svg' }, { name:'Cancella', sel:'#dmUndo' }, { name:'hint', sel:'#hint', reach:true, opt:true }, { name:'sentence', sel:'#sentence' },
    { name:'tile bank', sel:'#bank' }, { name:'Dillo', sel:'#btnSay' }]);
  await p.setViewportSize({ width:1280, height:720 }); await p.waitForTimeout(300);
  t.check('L9 Sofia: Cancella with a real click', await realClick('#dmUndo') && await until(async () => (await dbg()).dict.steps === 0, 'the step taken back', 3000));
  await t.leave();

  /* ========== Lesson 7: the opening, from an old save (before Mark's question existed) ========== */
  console.log('LESSON 7');
  await fresh(7);
  await p.evaluate(() => { const l7 = __dbg().l7; Object.assign(l7, { routeOK:true, told:true }); __debug.set({ l7, tut:'l7-route', l5follow:true }); __debug.travel('mercato', { x:480, y:540 }); });
  await p.waitForTimeout(3000);
  t.check('L7: at the market, l7-market', (await dbg()).tut === 'l7-market');
  /* an old save: no markAsked in S.l7 */
  await p.evaluate(() => { __debug.set({}); const k = 'piazza-lezione-1', s = JSON.parse(localStorage.getItem(k)); delete s.l7.markAsked; localStorage.setItem(k, JSON.stringify(s)); });
  await p.reload(); await p.waitForTimeout(500);
  await p.click('#btnContinue'); await p.waitForTimeout(1500);
  d = await dbg();
  t.check('L7: the old save loads at the market, mid-opening', d.scene === 'mercato' && d.tut === 'l7-market' && d.l7.markAsked === false);
  await talk('teresa');
  await say(['Buongiorno']);                                                    // (she asks: Come sta?)
  await say(['Sto bene, grazie']);
  t.check("L7: Mark's question → the tile", await p.isVisible('#bank .tile.mixed') && (await t.lines()).some(l => l.includes('Ask her how much the shirt is!')));
  await checkAll('L7 opening', [{ name:"Mark's question tile", sel:'#bank .tile.mixed' }, { name:'hint', sel:'#hint' }, { name:'sentence', sel:'#sentence' },
    { name:'Clear', sel:'#btnClear' }, { name:'Dillo', sel:'#btnSay' }]);
  await p.setViewportSize({ width:1280, height:720 }); await p.waitForTimeout(300);
  const c7 = await realClick('#bank .tile.mixed') && await realClick('#btnSay');
  await p.waitForTimeout(400); await settle(); await t.dump();
  t.check('L7: the tile and Dillo with real clicks → the price, too fast; Mark asks', c7 && (await t.lines()).some(l => l.includes('What did she say? How much?')) && (await dbg()).l7.barrier);
  await checkAll('L7 opening, the price', [{ name:'choice', sel:'#choices button' }, { name:'Ascolta di nuovo', sel:'#transcript .listen-btn' }]);
  await t.leave();

  /* ========== Lesson 8: a typed scene (the model after two misses), then a CHOICE ========== */
  console.log('LESSON 8');
  await fresh(8);
  await p.evaluate(() => {
    const l8 = Object.assign(__dbg().l8, { told:true, barrier:2, mentioned:true, red:true, gotShirt:true, fitDone:true, wearing:'red' });
    const l6 = JSON.parse(localStorage.getItem('piazza-lezione-1')).l6; l6.steps = Object.assign(l6.steps || {}, { lucia_opinion:2 });
    __debug.set({ vocab8:true, practiceDone8:true, vocabCheck8:true, tut:'l8-lucia', l5follow:true, l8, l6 });
  });
  await p.waitForTimeout(500);
  await talk('lucia');
  await until(() => p.isVisible('#typer'), 'the typer');
  for (const wrong of ['ti piace questa maglietta', 'mi piace questa maglietta']){
    await p.fill('#typerInput', wrong); await p.press('#typerInput', 'Enter'); await p.waitForTimeout(400); await settle(); await t.dump();
  }
  t.check('L8: typer + the model after two misses', await p.isVisible('#typer') && (await p.textContent('#hint')).includes('Try:'));
  await checkAll('L8 typer and model', [{ name:'the English to say', sel:'#typer .typer-target' }, { name:'typer input', sel:'#typerInput' }, { name:'Dillo', sel:'#btnType' },
    { name:'dictionary link', sel:'#btnTypeDict' }, { name:'hint with the model', sel:'#hint' }]);
  await p.setViewportSize({ width:1280, height:720 }); await p.waitForTimeout(300);
  const c8 = await realClick('#typerInput');
  await p.keyboard.type('Le piace questa maglietta?'); await p.keyboard.press('Enter'); await p.waitForTimeout(400); await settle(); await t.dump();
  await until(() => p.isVisible('#choices'), 'the choice');
  t.check('L8: typed with a real click → the CHOICE', c8 && await p.isVisible('#choices') && (await p.$$('#choices button')).length === 3);
  await checkAll('L8 choice', [1, 2, 3].map(i => ({ name:`option ${i}`, sel:`#choices button:nth-child(${i})` })));
  await p.setViewportSize({ width:1280, height:720 }); await p.waitForTimeout(300);
  t.check('L8: the right option with a real click', await realClick('#choices button:nth-child(2)') && await until(async () => (await t.lines()).some(l => l.includes('white is more elegant')), 'the pick', 5000));
  await t.leave();

  /* ========== Lesson 10: the ticket, the change notepad ========== */
  console.log('LESSON 10');
  await fresh(10);
  await p.evaluate(() => {
    const l10 = Object.assign(__dbg().l10, { routeOK:true, taught:true, demo:true, barrier:true });
    __debug.set({ l10, vocab10:true, practiceDone10:true, vocabCheck10:true, tut:'l10-ticket', crowd:{ maestra:{ x:536, y:404 }, turista2:{ x:770, y:346 }, turista4:{ x:572, y:242 } } });
    __debug.travel('museo', { x:628, y:262 });
  });
  await p.waitForTimeout(2600);
  await t.talkTo(628, 200); await settle();
  await say(['Buongiorno']);
  await say(['un biglietto', 'per le', 'quattro', 'per favore']);
  await until(async () => (await dbg()).pad.open, 'the price notepad'); await settle();
  await p.fill('#npadInput', '14'); await p.press('#npadInput', 'Enter'); await p.waitForTimeout(400); await settle();
  await say(['Ecco', 'venti', 'euro']);
  await until(async () => { const x = await dbg(); return x.pad.open && x.pad.label === 'il resto'; }, 'the change notepad'); await settle();
  await tagListen();
  await checkAll('L10 ticket change notepad', [{ name:'notepad input', sel:'#npadInput' }, { name:'Write it down', sel:'#npadOK' }, { name:'Ascolta di nuovo', sel:'[data-t-listen]' }]);
  await p.setViewportSize({ width:1280, height:720 }); await p.waitForTimeout(300);
  const c10 = await realClick('#npadInput');
  await p.keyboard.type('6'); await p.keyboard.press('Enter'); await p.waitForTimeout(400); await settle(); await t.dump();
  t.check('L10: the change written with a real click → the ticket', c10 && (await dbg()).l10.ticket);

  /* ========== the map's fast travel list (Lesson 12, the town open: the longest list) ========== */
  console.log('THE MAP');
  await fresh(12);
  await p.evaluate(() => __debug.l12Explore()); await p.waitForTimeout(500);
  const mapAt = async (w, h) => {
    if (await p.isVisible('#modal')) await p.keyboard.press('Escape');
    await p.setViewportSize({ width:w, height:h }); await p.waitForTimeout(300);
    await p.click('#btnMap'); await p.waitForSelector('.fl-items'); await p.waitForTimeout(300);
    return p.evaluate(() => { const L = [...document.querySelectorAll('.fl-items [data-go]')]; L[0].setAttribute('data-t-first', ''); L[L.length - 1].setAttribute('data-t-last', ''); return L.length; });
  };
  /* scroll (the mouse wheel, where a player would) until sel is on screen and clickable */
  const reach = async sel => { let r = await probe(sel), k = 0; while (!r.ok && r.scroller && k < 16){ await p.mouse.move(r.scroller.x, Math.min(r.scroller.y, (await p.evaluate(() => innerHeight)) - 10)); await p.mouse.wheel(0, 90 * r.scroller.dir); await p.waitForTimeout(120); k++; r = await probe(sel); } return { r, k }; };
  for (const [w, h] of [[1280, 720], [1366, 768], [1280, 650], [390, 844]]){
    const n = await mapAt(w, h);
    /* the list's head (a phone or a short window may scroll the sheet to it: the map is above or beside it), then the whole
       list on screen, its first button, and its last one after scrolling inside the list */
    const lst = await reach('.fl-items'), head = { r:await probe('.fastlist .fl-head'), k:lst.k }, list = lst.r, first = await probe('[data-t-first]');
    const last = await reach('[data-t-last]');
    const still = await p.evaluate(() => (document.scrollingElement.scrollTop || 0) + document.querySelector('#stage').scrollTop === 0);
    const noSheetScroll = h < 700 || w < 600 || head.k === 0;
    const ok = n >= 8 && head.r.ok && noSheetScroll && list.ok && first.ok && last.r.ok && still && (await p.$$('.mapsvg [data-go]')).length === 0;
    t.check(`layout: the map's Go straight there list (${n} places) @${w}x${h}: on screen${noSheetScroll && h >= 700 && w >= 600 ? ' without scrolling the sheet' : ''}, it scrolls inside its panel, the first and the last button clickable`, ok);
    if (!ok) console.log('     ✗ ' + JSON.stringify({ head, list, first, last, still }));
    if (['1280x720', '390x844'].includes(`${w}x${h}`)) await t.shot(`layout-map-fast-travel-${w}x${h}`);
  }
  await mapAt(1280, 720); await reach('[data-t-last]');
  const lastGo = await p.$eval('[data-t-last]', e => e.dataset.go);
  const cl = await realClick('[data-t-last]');
  t.check('the list\'s last button, clicked for real at 1280×720 (after scrolling the list): it travels', cl && await until(async () => (await dbg()).scene === lastGo, 'the place', 8000));
}, { fakeSpeech: true });
