/* Lesson 12's quests, batch 4, played for real as a player would: the covered market, the basilica, the aperitivo.
   - the map: all twelve quests have a "!" spot (the afternoon ones open, the night ones closed), and no label, note or the
     "Tu sei qui" pin overlaps another (by day in the piazza, at night on the bridge).
   - Il mercato coperto (afternoon): the map's "!" → Sotto il Salone → Marisa (the deli counter) → her scheda → "Buongiorno!
     Posso assaggiare?" (the greeting in the same turn) → "Qual è più dolce?" ("Il fresco è più dolce. Lo stagionato è più forte
     del fresco.") → "Preferisco il fresco forte" (the wrong word: "No, no: il fresco è dolce") → "lo stagionato" ("Le piace?")
     → "Sì" (the comparison again) → "Quanto costa un etto?" (the price per etto: nothing ordered) → "Vorrei due
     etti, per favore." ("Altro?") → "un etto di prosciutto" ("Crudo o cotto?") → "Qual è più salato?" → "crudo" → "No,
     grazie" (ask the price) → "Quanto costa?" → the price heard (a listening line) → the notepad (a wrong price first: she
     says it again) → the cheese in the bag → "Arrivederci!" → the stamp, 16:30.
   - In basilica (afternoon): the map's "!" → inside the basilica: the volunteer stops you (a cutscene): "Deve fare silenzio…
     deve coprire le spalle." → her scheda → "Buongiorno" ("Shh!") → "Posso prendere una candela?" before the shawl ("…ma prima
     deve coprire le spalle!") → "Mi scusi!" (the shawl: she steps aside) → the candle stand (lit at once: you asked) → the
     sacristan: "Posso prendere una candela?" → "Sì, certo! Può prendere…" → "Scusi, a che ora è la messa?" (a listening line)
     → the time noted (a wrong one first: said again slowly) → "Grazie mille, arrivederci" → the stamp, 18:00.
   - the third afternoon task → the dusk → night.
   - Aperitivo con Rosa (night): the map's "!" → Caffè Aurora at night (candles; Rosa seated at a table) → "Prendi un aperitivo
     con me?" (tu, no "diamoci del tu") → her scheda → "Ciao, Rosa!" (no answer yet: she asks again) → "Sì, grazie!" → "Vuoi
     qualcosa da bere?" → "Vorrei qualcosa da bere." → "Cosa ti piace bere?" → "Mi piace il vino." ("Ma qui, la sera… In
     Italia beviamo lo spritz la sera!") → Davide: "uno spritz" ("e per la signora Rosa?") → "Due spritz, per favore." → he goes
     to the bar (a cutscene) and, while you wait, Rosa: "Di dove sei?" → "Cin cin!" too early → "Sono di Londra." → "E tu?" →
     "Ah, ecco Davide!" (he brings the drinks: a cutscene) → "Facciamo un brindisi!" → "Salute!" → the train: "alle ventitré"
     (look at your ticket!) → "alle ventitré e quindici" → "Ancora uno stuzzichino?" → "No, grazie, basta così" (and "Sì,
     grazie!" to the same offer) → "Il conto, per favore!" ("Offro io!") → "Grazie, Rosa" → the stamp.
   - the phone's Compiti lists all twelve; the guide never covers Marisa's counter; no hint contains the Italian answer.
   Screenshots: tests/shots/b4-*.jpg and review/l12-polish/. */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const Q = async () => (await dbg()).quests;
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } console.log('   timed out waiting for ' + label); return false; };
  const has = async s => (await t.lines()).some(l => l.includes(s));
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(250); };
  const settle = async (quiet = 1000, max = 25000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#choices').hidden ? 0 : 20000), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const say = async labels => { for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump(); };
  const talk = async (x, y) => { await t.talkTo(x, y); await settle(); };
  const leave = async () => { await t.leave(); await p.waitForTimeout(300); };
  const hint = () => p.$eval('#hint', h => h.hidden ? '' : h.innerText);
  const arrive = async scene => { await until(async () => (await dbg()).scene === scene, scene); await until(async () => p.evaluate(() => !document.querySelector('#fade').classList.contains('on')), 'the fade', 8000); await p.waitForTimeout(500); };
  const noGuide = async on => p.evaluate(on => { let s = document.querySelector('#shotStyle'); if (!s){ s = document.createElement('style'); s.id = 'shotStyle'; document.head.appendChild(s); } s.textContent = on ? '#guide{visibility:hidden!important}' : ''; }, on);
  const shot = async name => { await p.screenshot({ path:require('path').join(require('./lib/harness').SHOTS, name + '.jpg'), type:'jpeg', quality:72 }); };
  const FIX = require('path').resolve(__dirname, '..', 'review', 'fix-l12-13'); require('fs').mkdirSync(FIX, { recursive:true });
  const fshot = async name => { await p.screenshot({ path:require('path').join(FIX, name + '.jpg'), type:'jpeg', quality:74 }); };
  /* every control on screen and clickable at 1280 × 720 (as tests/l12-citta.js) */
  const layout = async (label, sels) => {
    const bad = [];
    for (const sel of sels){
      const r = await p.evaluate(sel => {
        const e = sel.startsWith('tile:') ? [...document.querySelectorAll('#bank .tile')].find(x => x.textContent.trim() === sel.slice(5)) : document.querySelector(sel);
        if (!e) return 'missing'; e.scrollIntoView({ block:'nearest' });
        const b = e.getBoundingClientRect(), hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        return b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth && hit && (hit === e || e.contains(hit)) ? 'ok' : 'off';
      }, sel);
      if (r !== 'ok') bad.push(sel + ' ' + r);
    }
    const still = await p.evaluate(() => (document.scrollingElement.scrollTop || 0) + document.querySelector('#stage').scrollTop + document.querySelector('#dialog').scrollTop === 0);
    if (bad.length || !still) console.log('     ✗ ' + bad.join(' | ') + (still ? '' : ' (page scrolled)'));
    t.check(`layout @1280x720: ${label}, every control on screen and clickable`, !bad.length && still);
  };
  /* every label on the map clear of the others (the DOM's own boxes) */
  const mapClear = () => p.evaluate(() => {
    const els = [...document.querySelectorAll('.mapsvg .qs-lbl, .mapsvg .qs-note, .mapsvg .mhere')], B = els.map(e => ({ t:e.textContent, b:e.getBBox() }));
    const pin = document.querySelector('.mapsvg .mhere'); if (pin){ const g = pin.parentNode.querySelector('path').getBBox(); B.push({ t:'(the pin)', b:g }); }
    const bad = [];
    for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++){ const a = B[i].b, c = B[j].b;
      if (a.x < c.x + c.width - 0.5 && c.x < a.x + a.width - 0.5 && a.y < c.y + c.height - 0.5 && c.y < a.y + a.height - 0.5) bad.push(B[i].t + ' × ' + B[j].t); }
    const out = B.filter(x => x.b.x < 0 || x.b.x + x.b.width > 720).map(x => x.t + ' (off the map)');
    return { n:B.length, bad:bad.concat(out) };
  });
  /* a scheda: its word check (one miss, which comes back), then its practice */
  const scheda = async (id, answers) => {
    await until(async () => (await Q()).scheda.open && (await Q()).scheda.id === id, 'the scheda ' + id, 8000);
    await p.click('[data-sch-tab="words"]'); await p.waitForTimeout(200);
    const wc = await p.evaluate(() => { const w = () => __dbg().quests.scheda.words, click = s => { const b = document.querySelector(s); if (b) b.click(); };
      let g = 0, wrongId = null, cameBack = false; while (w().phase === 'cards' && g++ < 200) click('[data-vc=next]');
      while (w().phase === 'quiz' && g++ < 400){ const s = w(); if (s.status !== 'answer'){ click('[data-vc=next]'); continue; }
        if (!wrongId){ wrongId = s.cur.id; click(`[data-vq="${(s.cur.answer + 1) % s.cur.opts.length}"]`); } else { if (s.cur.id === wrongId && s.cur.again) cameBack = true; click(`[data-vq="${s.cur.answer}"]`); } }
      return { cameBack, passed:w().passed, total:w().total }; });
    await p.click('[data-sch-tab="practice"]'); await p.waitForTimeout(200);
    for (const k of answers){ await p.click(`[data-opt="${k}"]`); await p.click('#pxNext'); }
    await p.waitForTimeout(300); await press('Escape');
    const q = (await Q()).quests[id];
    console.log(`   scheda ${id}: ${wc.total} words, a miss came back: ${wc.cameBack}, practice: ${q.practice}`);
    return wc.passed && wc.cameBack && wc.total >= 5 && wc.total <= 10 && q.practice;
  };
  await p.evaluate(() => { window.__hintLog = []; });

  await t.jump(12);
  await p.evaluate(() => __debug.l12Explore()); await p.waitForTimeout(500);
  await until(async () => !(await dbg()).cut.on, 'no cutscene', 4000);

  /* ================= all twelve, on the map and in the phone ================= */
  let q = await Q();
  const ids = Object.keys(q.quests);
  const win = id => q.quests[id].window;
  t.check(`twelve quests (${ids.length}): 3 any time, 5 afternoon, 4 night; the market and the basilica afternoon, the aperitivo night`,
    ids.length === 12 && ids.filter(i => win(i) === 'any').length === 3 && ids.filter(i => win(i) === 'afternoon').length === 5 && ids.filter(i => win(i) === 'night').length === 4
    && win('mercato') === 'afternoon' && win('basilica') === 'afternoon' && win('aperitivo') === 'night');
  t.check('in the afternoon: the market and the basilica open, the aperitivo closed (apre stasera)', q.quests.mercato.state === 'open' && q.quests.basilica.state === 'open' && q.quests.aperitivo.state === 'closed');
  await press('m');
  const nSpots = (await p.$$('.qspot')).length, nClosed = (await p.$$('.qspot.closed')).length;
  let clear = await mapClear();
  if (clear.bad.length) console.log('     ✗ ' + clear.bad.join(' | '));
  t.check(`the map: a "!" for each of the 12 (${nSpots}, ${nClosed} closed for tonight); the Salone landmark; no label overlaps another or the pin (${clear.n} labels)`,
    nSpots === 12 && nClosed === 4 && /Salone/.test(await p.textContent('.mapsvg')) && !clear.bad.length);
  await shot('b4-00-map');
  await press('Escape');
  await press('p'); await p.click('[data-ph-tab="tasks"]'); await p.waitForTimeout(200);
  const tasks = await p.$$eval('.ph-task:not(.ph-lrow)', l => l.map(x => x.querySelector('b').textContent));
  t.check(`the phone's Compiti lists all twelve (${tasks.length}): Il mercato coperto, In basilica, Aperitivo con Rosa among them`, tasks.length === 12 && ['Il mercato coperto', 'In basilica', 'Aperitivo con Rosa'].every(x => tasks.includes(x)));
  await press('Escape');

  /* ================= Il mercato coperto ================= */
  await press('m'); await p.click('[data-qspot="q:mercato"] .qs-dot');
  await arrive('salone');
  let d = await dbg();
  t.check('the "!" → Sotto il Salone: Marisa at her counter (the marker), the baker, the cheesemonger, the pasta maker, shoppers', !!d.npcs.marisa && !!d.npcs.fornaio && !!d.npcs.formaggiaio && !!d.npcs.pastaia && !!d.npcs.cliente1 && d.quests.markers.includes('marisa'));
  /* the guide never covers Marisa's counter */
  const guideOff = await p.evaluate(() => { const g = document.querySelector('#guide'); if (g.hidden) return true; const b = g.getBoundingClientRect(), c = document.querySelector('#cv').getBoundingClientRect(), k = c.width / 960;
    const r = { l:c.left + 340 * k, t:c.top + 120 * k, r:c.left + 620 * k, b:c.top + 230 * k }; return b.right < r.l || b.left > r.r || b.bottom < r.t || b.top > r.b; });
  t.check('the guide is docked clear of Marisa\'s counter and the shop signs', guideOff && await p.evaluate(() => document.querySelector('#guide').classList.contains('low')));
  await shot('b4-01-market');
  await talk(480, 170);
  t.check('Marisa: Il nostro Asiago è buonissimo… (the task starts)', await has('Il nostro Asiago è buonissimo') && (await Q()).quests.mercato.state === 'active');
  await leave();
  t.check('Il mercato coperto: its scheda done', await scheda('mercato', [0, 0, 1, 0]));
  await talk(480, 170);
  await say(['Buongiorno', 'Posso assaggiare?']);
  t.check('Buongiorno! Posso assaggiare? (the greeting in the same turn) → Certo! Assaggi… Quale preferisce? (the tasting plate on the counter)', await has('Certo! Assaggi') && await has('Quale preferisce?') && (await dbg()).mercato.tasted && (await dbg()).mercato.salone.taste);
  await shot('b4-02-tasting');
  await layout('Marisa (her tiles)', ['#btnSay', '#hint', 'tile:Qual è più', 'tile:salato', 'tile:Mi piace', 'tile:Non mi piace', 'tile:troppo', 'tile:Quanto costa?', 'tile:cotto']);
  await say(['Qual è più', 'dolce']);
  t.check('Qual è più dolce? → Il fresco è più dolce. Lo stagionato è più forte del fresco. (the hint: now which one)', await has('Il fresco è più dolce. Lo stagionato è più forte del fresco.') && (await dbg()).mercato.asked.includes('dolce') && /Which one do you prefer/.test(await hint()));
  await say(['Preferisco', 'il fresco', 'forte']);
  t.check('Preferisco il fresco forte → Il fresco, forte? No, no: il fresco è dolce e morbido! (feedback, not the answer)', await has('Il fresco, forte? No, no: il fresco è dolce e morbido!') && !(await dbg()).mercato.pref && /strong/.test(await hint()));
  await say(['lo stagionato']);
  t.check('lo stagionato → Lo stagionato, eh? E… Le piace? (the hint: tell her what you think)', await has('Lo stagionato, eh? E… Le piace?') && /what you think/.test(await hint()));
  await say(['Sì']);
  t.check('Sì (the designer: it used to do nothing) → Sì? Bene! Lo stagionato! Ha ragione: è più forte del fresco. È il mio preferito. Allora, quanto ne vuole? (the step: buy)', await has('Sì? Bene!') && await has('è più forte del fresco. È il mio preferito.') && await has('quanto ne vuole?') && (await Q()).quests.mercato.step === 'compra' && (await dbg()).mercato.liked && (await dbg()).mercato.pref === 'stagionato');
  await shot('b4-02b-tasting-si'); await fshot('m4-01-si-accepted');
  await say(['Quanto costa?', 'un etto']);
  t.check('Quanto costa un etto? → Un etto di stagionato costa tre euro. (asked, not ordered)', await has('Un etto di stagionato costa tre euro.') && !(await dbg()).mercato.kg);
  await say(['Vorrei', 'due etti', 'per favore']);
  t.check('Vorrei due etti, per favore. → Due etti di stagionato… ecco qua. Altro?', await has('Due etti di stagionato') && await has('Altro?') && (await dbg()).mercato.kg === 2);
  await say(['un etto', 'di prosciutto']);
  t.check('un etto di prosciutto → Crudo o cotto? Il crudo è più salato.', await has('Crudo o cotto? Il crudo è più salato.'));
  await say(['Qual è più', 'dolce']);
  t.check('Qual è più dolce? (the ham) → Il cotto è più dolce. Il crudo è più salato. Allora? Crudo o cotto?', await has('Il cotto è più dolce. Il crudo è più salato.') && await has('Allora? Crudo o cotto?'));
  await shot('b4-p1-market-compare');
  await say(['crudo']);
  t.check('crudo → Un etto di crudo… ecco qua. Altro?', await has('Un etto di crudo') && (await dbg()).mercato.ham === 'crudo' && (await dbg()).mercato.pr === 1 && !(await dbg()).pad.open);
  await say(['No', 'Grazie']);
  t.check('No, grazie → Benissimo. (no price yet: the hint, ask her how much)', await has('Benissimo.') && !(await dbg()).pad.open && /how much/.test(await hint()));
  await say(['Quanto costa?']);
  await until(async () => (await dbg()).pad.open, 'the notepad', 8000);
  d = await dbg();
  t.check(`Quanto costa? → the price, heard (€ ${d.mercato.price}: a listening line), and your notepad`, d.mercato.price === 9 && d.pad.open && !!(await p.$('.line .listen, .line.listen, [data-listen]')));
  await p.fill('#npadInput', '8'); await p.press('#npadInput', 'Enter'); await settle();
  t.check('a wrong price (8): "is that what she said?", she says it again, slowly; the pad stays open', await has('is that what she said?') && (await dbg()).pad.open);
  await p.fill('#npadInput', '9'); await p.press('#npadInput', 'Enter'); await settle(); await t.dump();
  d = await dbg();
  t.check('9 → you pay; Grazie! Ecco il Suo formaggio; the cheese in your bag (Asiago stagionato, for the train; the prosciutto crudo)', d.mercato.paid && await has('Ecco il Suo formaggio') && d.quests.bag.some(b => b.id === 'formaggio' && /stagionato/.test(b.label_en) && /crudo/.test(b.note || '')));
  await say(['Arrivederci']);
  d = await dbg();
  t.check('Arrivederci → Arrivederci! Buona giornata! (a formal goodbye); the task done, a stamp, 16:30; the cheese stays in the bag', await has('Arrivederci! Buona giornata!') && d.quests.quests.mercato.done && d.quests.passport.includes('mercato') && d.quests.clock === '16:30' && d.quests.bag.some(b => b.id === 'formaggio'));
  await leave();
  t.check('Il mercato coperto complete: true', (await Q()).quests.mercato.done);

  /* ---------- Marisa's tasting again: what a learner would naturally answer to "Quale preferisce?" and "Le piace?" (the designer:
     Sì did nothing, Preferisco il fresco only made her ask again). Each answer gets a reply to what was said, and the tasting moves on
     as soon as there is a cheese you like; one you don't like gets the other one offered. ---------- */
  const tasting = async (label, turns, want) => {
    await p.evaluate(() => __debug.m4Tasting()); await p.waitForTimeout(200);
    await talk(480, 170);
    const n0 = (await t.lines()).length;
    for (const [tiles, reply] of turns){
      await say(tiles);
      const ok = await has(reply);
      if (!ok) console.log(`     ✗ ${tiles.join(' ')}: no "${reply}"`);
      if (!ok){ await leave(); return t.check(label, false); }
    }
    const m = (await dbg()).mercato, asked = (await t.lines()).slice(n0).filter(l => l.includes('Le piace?')).length;
    t.check(`${label} (${m.pref}, liked ${m.liked}, "Le piace?" ×${asked})`, m.liked === !!want && (!want || m.pref === want) && (!want || (await Q()).quests.mercato.step === 'compra') && (!want || await has('quanto ne vuole?')));
    if (want) await shotAfter(label);
    await leave();
  };
  let shotAfter = async () => {};
  shotAfter = async () => { await fshot('m4-02-preferisco-il-fresco'); shotAfter = async () => {}; };
  await tasting('Le piace? → Preferisco il fresco: she answers that (the fresh one) and moves on', [[['lo stagionato'], 'Le piace?'], [['Preferisco', 'il fresco'], 'Il fresco, eh? È più dolce, e morbido. Ottima scelta!']], 'fresco');
  await tasting('Le piace? → Sì, mi piace molto', [[['lo stagionato'], 'Le piace?'], [['Sì', 'Mi piace', 'molto'], 'Le piace molto? Che bello!']], 'stagionato');
  await tasting('Le piace? → È buono', [[['il fresco'], 'Il fresco, eh? E… Le piace?'], [['è', 'buono'], 'Buono? È buonissimo!']], 'fresco');
  await tasting('Le piace? → No: she offers the other one → Sì, è buonissimo', [[['lo stagionato'], 'Le piace?'], [['No'], 'Allora assaggi il fresco'], [['Sì', 'È buonissimo!'], 'Ottima scelta!']], 'fresco');
  await tasting('Le piace? → Non mi piace: the other one → Mi piace', [[['il fresco'], 'Le piace?'], [['Non mi piace'], 'Allora assaggi lo stagionato'], [['Mi piace'], 'È il mio preferito.']], 'stagionato');
  await tasting('È troppo forte (no cheese named: the aged one) → the fresh one → Non mi piace → both? one for the train → lo stagionato', [[['è', 'troppo', 'forte'], 'Troppo forte? Va bene…'], [['Non mi piace'], 'Non Le piace neanche il fresco?'],
    [['lo stagionato'], 'È il mio preferito.']], 'stagionato');
  await tasting('a comparison said: Il fresco è più dolce → Esatto! Allora preferisce il fresco? → Sì', [[['il fresco', 'è', 'più', 'dolce'], 'Esatto! Il fresco è più dolce.'], [['Sì'], 'Ottima scelta!']], 'fresco');
  await tasting('Lo stagionato è più forte → preferisce lo stagionato? → No: the fresh one', [[['lo stagionato', 'è', 'più', 'forte'], 'Allora preferisce lo stagionato?'], [['No'], 'Il fresco, eh?']], 'fresco');
  await tasting('Le piace? → Lo stagionato è più forte (about it): Esatto! and on', [[['lo stagionato'], 'Le piace?'], [['lo stagionato', 'è', 'più', 'forte'], 'Esatto! Lo stagionato è più forte.']], 'stagionato');
  await tasting('Mi piace il fresco (straight away)', [[['Mi piace', 'il fresco'], 'Ottima scelta!']], 'fresco');
  await tasting('a word that doesn\'t fit: Il fresco è più forte → No, no: il fresco è dolce (not chosen)', [[['il fresco', 'è', 'più', 'forte'], 'No, no: il fresco è dolce e morbido!']], null);
  /* after choosing: Sì and a change of mind before the weight; the weight is what the step needs */
  await tasting('chosen, then Sì (Bene! quanto ne vuole?) and Preferisco lo stagionato (Lo stagionato, allora!)', [[['Preferisco', 'il fresco'], 'Ottima scelta!'], [['Sì'], 'Bene! Allora… quanto ne vuole?'],
    [['Preferisco', 'lo stagionato'], 'Lo stagionato, allora! Va bene.']], 'stagionato');
  await p.evaluate(() => __debug.m4Tasting('restore')); await p.waitForTimeout(300);
  t.check('…and the task as it was: done, the cheese in the bag, 16:30', (await Q()).quests.mercato.done && (await Q()).bag.some(b => b.id === 'formaggio') && (await Q()).clock === '16:30');

  /* ================= In basilica ================= */
  await press('m'); await p.click('[data-qspot="q:basilica"] .qs-dot');
  await arrive('basilica');
  await until(async () => (await dbg()).cut.id === 'm5-stop' || await p.isVisible('#dialog'), 'the volunteer', 8000);
  await p.waitForTimeout(500); await shot('b4-04-custodian');
  await until(async () => p.isVisible('#dialog'), 'her conversation', 12000); await settle(); await t.dump();
  d = await dbg();
  t.check('inside the basilica: the volunteer stops you ("Scusi! Un momento!"): Deve fare silenzio, qui. E deve coprire le spalle. (the task starts)',
    d.crowd.said.some(x => x[0] === 'volontaria' && /Un momento/.test(x[1])) && await has('Deve fare silenzio, qui.') && await has('E deve coprire le spalle.') && d.quests.quests.basilica.state === 'active');
  await shot('b4-04b-custodian-dialog');
  await leave();
  t.check('In basilica: its scheda done', await scheda('basilica', [0, 0, 0, 1]));
  d = await dbg();
  t.check('she still stands in the way (the gap in the porch); the guide sends you to her', d.npcs.volontaria[0] === 480 && d.npcs.volontaria[1] === 478 && !(await p.evaluate(() => __debug.reach(480, 400))));
  await talk(480, 478);
  await say(['Buongiorno']);
  t.check('Buongiorno → Shh! Deve fare silenzio, qui… (the hint: apologise)', await has('Shh! Deve fare silenzio, qui') && /pologise/.test(await hint()));
  await layout('the volunteer (her tiles)', ['#btnSay', '#hint', 'tile:Posso prendere', 'tile:una candela', 'tile:Mi scusi!']);
  await say(['Posso prendere', 'una candela']);
  d = await dbg();
  t.check('Posso prendere una candela? before the shawl → Sì, può prendere una candela… ma prima deve coprire le spalle! (not covered yet)', await has('ma prima deve coprire le spalle!') && d.messa.may && !d.messa.covered && /shoulders/.test(await hint()));
  await shot('b4-p2-basilica-rules');
  await say(['Mi scusi!']);
  d = await dbg();
  t.check('Mi scusi! → Non fa niente. Ecco: Le presto uno scialle. The shawl on your shoulders; she steps aside; the way in is open; the hint: your candle',
    await has('Le presto uno scialle') && d.basilica.covered && d.npcs.volontaria[0] === 560 && await p.evaluate(() => __debug.reach(480, 400)) && d.quests.quests.basilica.step === 'dentro' && /candle/.test(await hint()));
  await leave();
  await t.clickWorld(208, 226);
  await until(async () => (await dbg()).cut.id === 'm5-candela', 'the candle', 10000);
  await until(async () => !(await dbg()).cut.on, 'the candle lit', 20000);
  d = await dbg();
  t.check('a tap on the candles: you walk there, a coin in the box, a candle lit', d.messa.candle && d.basilica.candles === 1);
  await noGuide(true); await shot('b4-03-basilica'); await noGuide(false);
  const lumB = await p.evaluate(() => __nightProbe());
  await talk(858, 206);
  await say(['Posso prendere', 'una candela']);
  t.check('the sacristan: Posso prendere una candela? → Sì, certo! Può prendere una candela… (he answers too; the hint: ask about mass)', await has('Può prendere una candela: sono là') && /mass/.test(await hint()));
  await say(['Scusi', 'A che ora è la messa?']);
  await until(async () => p.isVisible('#choices button'), 'the choices', 8000);
  t.check('Scusi, a che ora è la messa? → his answer is a listening line; your notepad: what time did he say?', (await dbg()).messa.heard && !!(await p.$('[data-listen]')) && await has('what time did he say?'));
  await p.click('#choices button >> text="18:00"'); await settle(); await t.dump();
  t.check('18:00 → Hmm… really? He says it again, slowly; the choices again', await has('really?') && await p.isVisible('#choices button'));
  await p.click('#choices button >> text="18:30"'); await settle(); await t.dump();
  t.check('18:30 → noted (la messa · 18:30); his line revealed: La messa è alle sei e mezza', (await dbg()).messa.time && await has('la messa · 18:30') && await has('La messa è alle sei e mezza'));
  await say(['Grazie mille', 'Arrivederci']);
  t.check('Grazie mille, arrivederci → Prego. Arrivederci.', await has('Prego. Arrivederci.'));
  await leave();
  d = await dbg();
  t.check(`the task done: a stamp, 18:00; the basilica dim (brightness ${lumB.toFixed(0)})`, d.quests.quests.basilica.done && d.quests.passport.includes('basilica') && d.quests.clock === '18:00' && lumB < 120);
  t.check('In basilica complete: true', d.quests.quests.basilica.done);

  /* ================= the third afternoon task → the dusk → night ================= */
  await p.evaluate(() => __debug.questDone('caffe'));
  await until(async () => (await dbg()).quests.daytime === 'night' && !(await dbg()).cut.on, 'the night', 40000);
  d = await dbg();
  t.check('three this afternoon → the dusk: night, 2 tonight', d.quests.daytime === 'night' && d.l12.need.night === 2 && d.tut === 'l12-night');
  /* the bridge at night: the photo's closed note keeps clear of the pin */
  await p.evaluate(() => __debug.travel('ponte')); await arrive('ponte');
  await press('m');
  clear = await mapClear();
  if (clear.bad.length) console.log('     ✗ ' + clear.bad.join(' | '));
  t.check(`the map on the bridge at night: no label touches another or the pin (${clear.n})`, !clear.bad.length);
  await press('Escape');

  /* ================= Aperitivo con Rosa ================= */
  await press('m');
  t.check('the map at night: the aperitivo open now; the market and the basilica done (no spot)', !!(await p.$('.qspot:not(.closed)[data-qspot="q:aperitivo"]')) && !(await p.$('[data-qspot="q:mercato"]')) && !(await p.$('[data-qspot="q:basilica"]')));
  await p.click('[data-qspot="q:aperitivo"] .qs-dot');
  await arrive('aurora');
  d = await dbg();
  t.check('the "!" → Caffè Aurora at night: Rosa at a table (seated, her marker), Davide', !!d.npcs.rosa && d.aperitivo.rosa.seated && d.npcs.rosa[0] === 690 && !!d.npcs.davide && d.quests.markers.includes('rosa'));
  await talk(690, 250);
  t.check('Rosa: Prendi un aperitivo con me? (tu; no "diamoci del tu"; the task starts)', await has('Prendi un aperitivo con me?') && !(await has('diamoci')) && (await Q()).quests.aperitivo.state === 'active' && !(await dbg()).aperitivo.rosa.formal);
  await leave();
  t.check('Aperitivo con Rosa: its scheda done', await scheda('aperitivo', [0, 0, 0, 0]));
  await talk(690, 250);
  await say(['Ciao', 'Rosa']);
  t.check('Ciao, Rosa! (no answer to her question) → Allora… prendi un aperitivo con me? (the hint: answer her)', await has('prendi un aperitivo con me?') && !(await dbg()).aperitivo.greeted && /Answer her/.test(await hint()));
  await layout("Rosa (her tiles: Sì and No in the bank)", ['#btnSay', '#hint', 'tile:Sì', 'tile:No', 'tile:Cosa ti piace bere?', 'tile:basta così']);
  await say(['Sì', 'Grazie']);
  t.check('Sì, grazie! → Che bello! Siediti, siediti! Vuoi qualcosa da bere?', await has('Siediti, siediti!') && await has('Vuoi qualcosa da bere?') && (await dbg()).aperitivo.greeted);
  await say(['Vorrei', 'qualcosa da bere']);
  t.check('Vorrei qualcosa da bere. → Bene! Cosa ti piace bere?', await has('Cosa ti piace bere?'));
  await say(['Mi piace', 'il vino']);
  t.check('Mi piace il vino. → Il vino? Buono! Ma qui, la sera… In Italia beviamo lo spritz la sera! Ordini tu? (the step: order)', await has('Il vino? Buono!') && await has('In Italia beviamo lo spritz la sera!') && await has('Ordini tu?') && (await Q()).quests.aperitivo.step === 'ordina' && (await dbg()).aperitivo.drink === 'vino');
  await shot('b4-p3-rosa-drinks');
  await leave();
  await talk(...(await dbg()).npcs.davide);
  await say(['uno spritz', 'per favore']);
  t.check('Davide: uno spritz → Uno spritz… e per la signora Rosa? (the hint: Rosa would like one too)', await has('e per la signora Rosa?') && /Rosa would like one/.test(await hint()));
  await say(['due spritz', 'per favore']);
  t.check('Due spritz, per favore. → Due spritz, subito! E vi porto anche gli stuzzichini.', await has('Due spritz, subito!') && await has('gli stuzzichini'));
  await leave();
  await until(async () => (await dbg()).cut.id === 'm10-bar', 'Davide going to the bar', 8000);
  await until(async () => p.isVisible('#dialog'), 'Rosa, while you wait', 30000); await settle(); await t.dump();
  d = await dbg();
  t.check('Davide goes to the bar; you sit at her table; while you wait, Rosa: Allora, Sam… di dove sei? (the step: the wait; no drinks yet)', d.aperitivo.waiting && !d.aperitivo.served && await has('di dove sei?') && d.quests.quests.aperitivo.step === 'attesa');
  await say(['Cin cin!']);
  t.check('Cin cin! too early → Aspetta! Gli spritz non ci sono ancora!', await has('Gli spritz non ci sono ancora!') && !(await dbg()).aperitivo.toast);
  await say(['Sono di', 'Londra']);
  t.check('Sono di Londra. → Di Londra! Che bello! (the hint: ask her back)', await has('Di Londra! Che bello!') && /same question/.test(await hint()));
  await say(['E tu?']);
  t.check('E tu? → Io? Sono di Padova! … Ah, ecco Davide!', await has('Sono di Padova') && await has('Ah, ecco Davide!'));
  await until(async () => (await dbg()).cut.id === 'm10-serve', 'Davide serving', 8000);
  await until(async () => p.isVisible('#dialog'), 'Rosa again', 30000); await settle(); await t.dump();
  d = await dbg();
  t.check('Davide brings the drinks ("Ecco: due spritz… e gli stuzzichini!"); Rosa: Ecco gli spritz! … Facciamo un brindisi!', d.aperitivo.served && d.crowd.said.some(x => x[0] === 'davide' && /due spritz/.test(x[1])) && await has('Facciamo un brindisi!') && d.quests.quests.aperitivo.step === 'brindisi');
  await say(['Salute!']);
  t.check('Salute! → Cin cin! Salute, Sam! … A che ora parte il treno?', await has('Cin cin! Salute') && await has('A che ora parte il treno?'));
  await noGuide(true); await shot('b4-05-aperitivo'); await noGuide(false);
  await say(['Il treno parte', 'alle', 'ventitré']);
  t.check('…alle ventitré → Sicuro? Guarda il biglietto! (the hint: your ticket, in the bag)', await has('Guarda il biglietto!') && /ticket/.test(await hint()));
  await say(['Il treno parte', 'alle', 'ventitré', 'e', 'quindici']);
  t.check('Il treno parte alle ventitré e quindici. → Allora c\'è tempo! … Ancora uno stuzzichino?', await has("Allora c'è tempo!") && await has('Ancora uno stuzzichino?'));
  await say(['No', 'Grazie', 'basta così']);
  t.check('No, grazie, basta così → Basta così? Va bene! (the hint: the bill)', await has('Basta così? Va bene!') && (await dbg()).aperitivo.nibble === 'no' && /bill/.test(await hint()));
  await shot('b4-p4-rosa-stuzzichino');
  /* the same offer once more, to answer it the other way: Sì, grazie! */
  await p.evaluate(() => __debug.aperitivoNibble());
  await say(['Sì', 'Grazie']);
  t.check('…and Sì, grazie! → Prego! Prendi, prendi: le olive sono buonissime.', await has('Prendi, prendi: le olive sono buonissime.') && (await dbg()).aperitivo.nibble === 'yes');
  await say(['Il conto', 'per favore']);
  t.check('Il conto, per favore! → No, no! Offro io!', await has('No, no! Offro io!'));
  await say(['Grazie', 'Rosa']);
  d = await dbg();
  t.check('Grazie, Rosa → Prego, Sam! Buon viaggio! Ciao! The task done, a stamp, 1/2 tonight', await has('Buon viaggio!') && d.quests.quests.aperitivo.done && d.quests.passport.includes('aperitivo') && d.l12.count.night === 1);
  await leave();
  await noGuide(true); await shot('b4-06-bar-night'); await noGuide(false);
  t.check('Aperitivo con Rosa complete: true', (await Q()).quests.aperitivo.done);
  d = await dbg();
  t.check('Rosa stays at her table till you leave; then she is back in San Lorenzo', !!d.npcs.rosa && await (async () => { await p.evaluate(() => __debug.travel('sanlorenzo')); await arrive('sanlorenzo'); return !!(await dbg()).npcs.rosa && !(await dbg()).aperitivo.rosa.seated; })());

  /* ================= no hint gave the answer ================= */
  const norm = x => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const forbidden = ['posso assaggiare', 'preferisco lo stagionato', 'e buonissimo', 'vorrei due etti', 'due etti per favore', 'no grazie', 'qual e piu dolce', 'quanto costa un etto', 'quanto costa',
    'mi scusi', 'a che ora e la messa', 'le spalle', 'grazie arrivederci', 'posso prendere una candela', 'va bene',
    'si grazie', 'vorrei qualcosa da bere', 'mi piace lo spritz', 'cosa ti piace bere', 'due spritz', 'cin cin', 'sono di londra', 'e tu di dove sei', 'il treno parte alle', 'ventitre e quindici',
    'basta cosi', 'il conto per favore', 'grazie rosa'].map(norm);
  const shown = await p.evaluate(() => window.__hintLog || []);
  const leaks = shown.filter(h => forbidden.some(m => norm(h).includes(m)));
  console.log(`   ${shown.length} hints shown; leaks: ${leaks.join(' | ') || 'none'}`);
  t.check('no hint contains the Italian answer', shown.length >= 8 && leaks.length === 0);
}, { fakeSpeech:true, viewport:{ width:1280, height:720 } });
