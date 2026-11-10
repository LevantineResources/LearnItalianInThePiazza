/* Lesson 15 · the other conversations, played as a learner would (docs/playtest-notes.md, 8 Nov): mistakes, partial answers, Sì / No,
   "Ancora una volta, per favore", things said in another order. None may loop, ask again after a right answer, or judge the wrong thing;
   the staff have role labels (never "???"). (The station bar: tests/l15-bar.js.)
   - The information desk (l15-ask): your name first, without a greeting (Margaret still asks about the boat); a bare "Grazie" doesn't
     end the conversation; "Come sta?"; "Ancora una volta"; the half-English tile.
   - The desk again (l15-directions): "La fermata del vaporetto per San Marco?" without "Dov'è" (the way at once); "A sinistra?";
     "Ancora una volta"; Margaret's pick (a wrong one first); "Grazie" (the goodbye).
   - The ACTV booth (l15-ticket): the dog first; "Buongiorno, un biglietto…" (one reply) → "Uno? E la signora?" → "Sì" (two tickets);
     the price on the notepad; "A che ora parte?" → the time; the goodbye.
   - Il signor Bepi (l15-bepi): a greeting alone at the start and mid-conversation; Margaret first, then your name; the train: "No" →
     "Da dove, allora?" → "Da Padova"; "Molto!"; the Padova questions; "Sì, è più bella" (no city named); "Ancora una volta"; Margaret's
     news; "Grazie mille, sto imparando"; the goodbye.
   Every hint is logged: none gives a model sentence. */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const until = async (fn, ms = 10000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } return false; };
  const settle = async (quiet = 900, max = 25000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#choices').hidden ? 0 : 20000) + (document.querySelector('#npad') ? 50000 : 0) + (document.querySelector('#l15Time') ? 90000 : 0), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const norm = s => s.toLowerCase().replace(/[.,!?:;…]/g, ' ').replace(/\s+/g, ' ').trim();
  const toTiles = async sentence => {
    const labels = await p.$$eval('#bank .tile', ts => [...new Set(ts.map(x => x.textContent.trim()))]);
    const W = norm(sentence).split(' '), out = [];
    for (let i = 0; i < W.length;){
      let best = null;
      for (const l of labels){ const lw = norm(l).split(' '); if (lw.length > (best ? best.n : 0) && lw.every((w, j) => W[i + j] === w)) best = { l, n:lw.length }; }
      if (!best){ console.log(`   no tile for "${W[i]}" in "${sentence}"`); return null; }
      out.push(best.l); i += best.n;
    }
    return out;
  };
  let mark = 0;
  const newLines = async () => {
    const L = await p.$$eval('#transcript .line', ls => ls.map(l => ({ who:l.classList.contains('companion') ? 'mg' : l.classList.contains('npc') ? 'npc' : l.classList.contains('me') ? 'me' : 'sys',
      plate:(l.querySelector('.nameplate') || {}).textContent || '', text:(l.querySelector('.bubble .it') || l).textContent.replace(/\s+/g, ' ').trim() })));
    const r = L.slice(mark); mark = L.length; return r;
  };
  const sayIt = async sentence => {
    await p.waitForSelector('#builder:not([hidden])', { timeout:12000 });
    const ts = await toTiles(sentence); if (!ts){ t.check(`tiles for "${sentence}"`, false); return []; }
    for (const w of ts) await p.click(`#bank .tile >> text="${w}"`);
    await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump();
    return newLines();
  };
  const npcSaid = (L, s) => L.some(l => l.who === 'npc' && l.text.includes(s));
  const mgSaid = (L, s) => L.some(l => l.who === 'mg' && l.text.includes(s));
  const npcN = L => L.filter(l => l.who === 'npc').length;
  const unknownPlates = () => p.$$eval('#transcript .nameplate.unknown', x => x.length);
  const open = async (at, o, x, y, face = { x:0, y:-1 }) => {
    if (await p.isVisible('#dialog')) await t.leave();
    await p.evaluate(([at, o]) => __debug.l15At(at, o), [at, o]); await p.waitForTimeout(2800);
    await p.evaluate(([x, y, f]) => __debug.place(x, y, f), [x, y, face]); await p.waitForTimeout(300);
    await p.keyboard.press('e'); await p.waitForSelector('#dialog:not([hidden])', { timeout:25000 }); await p.waitForTimeout(600); await settle(); await t.dump();
    mark = 0; return newLines();
  };
  const pick = async (right, wrong) => {
    await p.waitForSelector('#choices:not([hidden]) button.english', { timeout:12000 });
    if (wrong){ await p.click(`#choices button.english >> text=/^${wrong}/`); await p.waitForTimeout(500); await settle(); await t.dump(); }
    await p.click(`#choices button.english >> text=/^${right}/`); await p.waitForTimeout(800); await settle(); await t.dump();
    return newLines();
  };
  const ended = async () => p.evaluate(() => !!(window.__dbg && document.querySelector('#builder').hidden && !document.querySelector('#choices').hidden && [...document.querySelectorAll('#choices button')].some(b => b.textContent.trim() === 'Leave')));
  await p.evaluate(() => { window.__hintLog = []; });
  await t.jump(15, 'Alex');

  /* ---------- the information desk: the barrier ---------- */
  let L = await open('l15-ask', {}, 144, 350);
  t.check('the desk: "Informazioni" (not "???")', L.some(l => l.plate === 'Informazioni') && !(await unknownPlates()));
  L = await sayIt('Mi chiamo Alex');
  t.check('your name first, no greeting → "Piacere, Alex!…"; Margaret still asks about the boat; the half-English tile appears',
    npcSaid(L, 'Piacere, Alex!') && mgSaid(L, 'Ask him how we get to San Marco') && (await p.$$eval('#bank .tile', ts => ts.some(x => x.textContent.includes('the boat')))));
  L = await sayIt('Grazie');
  t.check('a bare "Grazie" → "Prego!", and the conversation goes on', npcSaid(L, 'Prego!') && !(await ended()) && !mgSaid(L, "haven't asked"));
  L = await sayIt('Come sta?');
  t.check('"Come sta?" → "Bene, grazie! Mi dica."', npcSaid(L, 'Bene, grazie!'));
  L = await sayIt('Ancora una volta, per favore');
  t.check('"Ancora una volta, per favore" → "Sì, certo!" and his line again', npcSaid(L, 'Sì, certo!') && npcSaid(L, 'Bene, grazie!'));
  L = await sayIt("Scusi, dov'è… the boat… per San Marco?");
  t.check('the half-English tile → "La barca? Ah, il vaporetto!"; the handbook', npcSaid(L, 'La barca? Ah, il vaporetto!') && (await dbg()).l15.barrier);

  /* ---------- the desk again: the way ---------- */
  L = await open('l15-directions', {}, 144, 350);
  L = await sayIt('Buongiorno! La fermata del vaporetto per San Marco?');
  t.check('"La fermata del vaporetto per San Marco?" (no Dov\'è) → the way at once, the greeting in the first line', npcSaid(L, 'Buongiorno! Il vaporetto per San Marco? Allora: esca dalla stazione') && npcSaid(L, 'giri a destra'));
  await p.waitForSelector('#choices:not([hidden]) button.english', { timeout:12000 });
  /* Margaret's pick comes at once; a wrong one first, then the right one */
  L = await pick('Out of the station, down the steps, then right', 'Back to the platform');
  t.check('Margaret\'s pick (wrong, then right): l15-ticket', (await dbg()).tut === 'l15-ticket');
  L = await sayIt('A sinistra?');
  t.check('"A sinistra?" → "No, no: a destra!"', npcSaid(L, 'No, no: a destra!'));
  L = await sayIt('Ancora una volta, per favore');
  t.check('"Ancora una volta" → his last line again (and no new pick)', npcSaid(L, 'Sì, certo!') && npcSaid(L, 'a destra') && !(await p.isVisible('#choices button.english')));
  L = await sayIt('Grazie');
  t.check('"Grazie" (the way known) → the goodbye: buon viaggio; done', npcSaid(L, 'buon viaggio') && await ended());

  /* ---------- the ACTV booth: another order ---------- */
  L = await open('l15-ticket', {}, 870, 330);
  t.check('the booth: "Biglietteria ACTV" (not "???")', L.some(l => l.plate === 'Biglietteria ACTV') && !(await unknownPlates()));
  L = await sayIt('Il cane paga?');
  t.check('the dog first → "No, il cane non paga…"; Margaret\'s pick', npcSaid(L, 'il cane non paga'));
  L = await pick('Biscuit travels free');
  t.check('… "like a king"; the dog done, nothing else yet', mgSaid(L, 'like a king') && (await dbg()).l15.dogOK && !(await dbg()).l15.tickets);
  L = await sayIt('Buongiorno! Un biglietto per San Marco, per favore.');
  t.check('"Buongiorno! Un biglietto…" → one reply: "Buongiorno! Un biglietto? Uno? E la signora?"', npcN(L) === 1 && npcSaid(L, 'Buongiorno! Un biglietto? Uno? E la signora?'));
  L = await sayIt('Sì');
  const padOpen = await until(async () => (await dbg()).pad.open, 8000);
  t.check('"Sì" (yes, for her too) → two tickets and the price (heard): the notepad', npcSaid(L, 'Due biglietti') && padOpen);
  await p.fill('#npadInput', '19'); await p.click('#npadOK'); await p.waitForTimeout(800); await settle(); await t.dump(); await newLines();
  t.check('€ 19: paid', (await dbg()).l15.paid);
  L = await sayIt('A che ora parte?');
  t.check('"A che ora parte?" → the time (heard), the time notepad', await until(async () => (await dbg()).l15.timePad.open, 8000));
  await p.fill('#l15H', '9'); await p.fill('#l15M', '10'); await p.click('[data-l15t="write"]'); await p.waitForTimeout(800); await settle(); await t.dump();
  L = await newLines();
  let d = await dbg();
  t.check('9:10: all three done → Margaret: breakfast (l15-breakfast); no nudge for what was already done', d.l15.timeNoted && d.tut === 'l15-breakfast' && mgSaid(L, 'Time for breakfast') && !mgSaid(L, 'Ask if he needs a ticket'));
  L = await sayIt('Arrivederci');
  t.check('"Arrivederci" → "Arrivederci! Buon viaggio!"; done', npcSaid(L, 'Buon viaggio!') && await ended());

  /* ---------- il signor Bepi ---------- */
  await t.leave();
  await p.evaluate(() => __debug.l15At('l15-bepi', { bepi:{ stage:'pet' }, bepiCome:false, bepiDone:false, bepiGone:false }));
  await until(async () => (await dbg()).scene === 'ferrovia', 8000); await p.waitForTimeout(2800);
  await p.evaluate(() => __debug.place(498, 330, { x:0, y:1 })); await p.waitForTimeout(200); await p.keyboard.press('e');
  await p.waitForSelector('#dialog:not([hidden])', { timeout:25000 }); await p.waitForTimeout(600); await settle(); await t.dump(); mark = 0; await newLines();
  L = await sayIt('Buongiorno');
  t.check('a greeting (he asked "Posso?") → "Buongiorno! Che bel cagnolino… Posso?"', npcSaid(L, 'Posso?'));
  L = await sayIt('Sì');
  t.check('"Sì" → he greets Biscuit, his name, "E Lei?"', npcSaid(L, 'mi chiamano Bepi') && (await dbg()).l15.bepi.stage === 'intro');
  L = await sayIt('Lei è Margaret');
  t.check('Margaret first → "Piacere, signora! E Lei, come si chiama?"', npcSaid(L, 'E Lei, come si chiama?'));
  L = await sayIt('Buongiorno');
  t.check('a greeting alone, mid-conversation → "Buongiorno!" and his question again (not "sono un po\' sordo")', npcSaid(L, 'Buongiorno!') && npcSaid(L, 'E Lei, come si chiama?') && !npcSaid(L, 'sordo'));
  L = await sayIt('Mi chiamo Alex');
  t.check('your name → both introduced; "Avete preso il treno da Padova?"', npcSaid(L, 'Piacere, Alex!') && npcSaid(L, 'Avete preso il treno da Padova?'));
  L = await sayIt('No');
  t.check('"No" → "No? Da dove, allora?"', npcSaid(L, 'Da dove, allora?'));
  L = await sayIt('Da Padova');
  t.check('"Da Padova" → "Il treno di notte? Che avventura!" and "E vi è piaciuto?"', npcSaid(L, 'Che avventura!') && npcSaid(L, 'vi è piaciuto?') && (await dbg()).l15.bepi.stage === 'liked');
  L = await sayIt('Molto!');
  d = await dbg();
  t.check('"Molto!" → "Bene, bene!" and his first Padova question (not "Sì? Molto?")', npcSaid(L, 'Bene, bene!') && !npcSaid(L, 'Sì? Molto?') && d.l15.bepi.stage === 'day1');
  L = await sayIt('Sì');
  t.check('"Sì" → his reply, the second question', (await dbg()).l15.bepi.stage === 'day2');
  const Y = d.l15.day.yes;
  L = await sayIt('No');
  t.check('a bare "No" → "E cosa ha fatto, allora?"', npcSaid(L, 'cosa ha fatto, allora?'));
  await sayIt(`Ho ${Y.pp} ${Y.label}`);
  t.check('"Ho … " → the comparison: "È più bella di Padova?"', (await dbg()).l15.bepi.stage === 'compare');
  L = await sayIt('Sì, è più bella');
  t.check('"Sì, è più bella" (no city named: Venice) → "sono veneziano"; Margaret\'s news', npcSaid(L, 'sono veneziano') && !npcSaid(L, 'chi?') && (await dbg()).l15.bepi.stage === 'family' && mgSaid(L, 'Biscuit found a family'));
  L = await sayIt('Ancora una volta, per favore');
  t.check('"Ancora una volta" → his last line again; still the same stage', npcSaid(L, 'Sì, certo!') && (await dbg()).l15.bepi.stage === 'family');
  L = await sayIt('Biscuit ha trovato una famiglia sul treno');
  t.check('Margaret\'s news → "Che storia!" and the compliment', npcSaid(L, 'Che storia!') && npcSaid(L, "parla bene l'italiano"));
  L = await sayIt('Grazie mille, sto imparando');
  t.check('"Grazie mille, sto imparando." → "Prego! … Piano piano"; the horn', npcSaid(L, 'Piano piano') && (await dbg()).l15.bepi.stage === 'bye');
  L = await sayIt('Arrivederci');
  t.check('"Arrivederci" → his goodbye; done', npcSaid(L, 'Arrivederci! E ciao, Biscuit!') && await ended());
  await t.leave();

  const log = await p.evaluate(() => window.__hintLog || []);
  const MODELS = ["dov'è la fermata del vaporetto", 'due biglietti per san marco', 'a che ora parte il prossimo', 'il cane paga', 'mi è piaciuto molto', 'sto imparando.', 'abbiamo preso il treno', 'biscuit ha trovato', 'più bella di padova'];
  const bad = log.filter(x => MODELS.some(m => x.toLowerCase().includes(m)));
  console.log(`   ${log.length} hints shown`);
  if (bad.length) console.log('   BAD HINTS: ' + JSON.stringify(bad));
  t.check('no hint gives a model sentence', !bad.length);
}, { fakeSpeech:true });
