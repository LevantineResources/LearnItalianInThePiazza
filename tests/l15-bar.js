/* Lesson 15 · the station bar (l15-breakfast), the designer's transcript and its variants (docs/playtest-notes.md, 8 Nov).
   The transcript (tests/data/l15-bar-transcript.txt: the designer's real run, the player Alex) is replayed through the real tile UI: each
   of Alex's Italian lines becomes the bank's tiles (a greedy match on their labels), his English line is Margaret's pick. At every step
   the right outcome is checked: the barista says back what she understood and asks; Sì confirms it, No + things corrects only that part;
   Margaret judges only her own order ("No, dear: jam!" / "Perfect, dear!"), never the player's; the two orders are kept apart and
   combined; a greeting with a question is one reply; the staff have a role label, never "???".
   Then the variants: both orders in one sentence; drink and cornetto in separate turns (Sì to "E un cornetto?", a No); "Per me lo
   stesso"; a wrong drink for Margaret corrected alone, then "Anche per me"; nobody named ("Per chi?"), "Ancora una volta, per favore";
   the player's order first (Margaret says nothing about it). Every hint is logged: none gives the Italian answer.
   Screenshots: review/fix-l15b/*.jpg */
const { play } = require('./lib/harness');
const path = require('path'), fs = require('fs');
const REVIEW = path.resolve(__dirname, '..', 'review', 'fix-l15b');
fs.mkdirSync(REVIEW, { recursive:true });
const TRANSCRIPT = fs.readFileSync(path.join(__dirname, 'data', 'l15-bar-transcript.txt'), 'utf8').split('\n').map(l => l.trim()).filter(Boolean);
const ALEX = TRANSCRIPT.filter(l => /^ALEX:/.test(l)).map(l => l.replace(/^ALEX:\s*/, ''));

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const settle = async (quiet = 900, max = 25000) => {
    const t0 = Date.now(); let lastN = -1, calm = 0;
    while (Date.now() - t0 < max){
      const s = await p.evaluate(() => ({ n:document.querySelectorAll('.line').length + (document.querySelector('#hint').hidden ? 0 : 1000) + (document.querySelector('#choices').hidden ? 0 : 20000) + (document.querySelector('#npad') ? 50000 : 0), sp:speechSynthesis.speaking }));
      if (s.n === lastN && !s.sp) calm += 100; else calm = 0;
      lastN = s.n; if (calm >= quiet) return; await p.waitForTimeout(100);
    }
  };
  const norm = s => s.toLowerCase().replace(/[.,!?:;…]/g, ' ').replace(/\s+/g, ' ').trim();
  /* a sentence → the bank's tiles: the longest label that matches at each point */
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
  /* the lines since the last turn: { who:'npc' | 'mg' | 'me' | 'sys', plate, text } */
  const newLines = async () => {
    const L = await p.$$eval('#transcript .line', ls => ls.map(l => ({ who:l.classList.contains('companion') ? 'mg' : l.classList.contains('npc') ? 'npc' : l.classList.contains('me') ? 'me' : 'sys',
      plate:(l.querySelector('.nameplate') || {}).textContent || '', text:(l.querySelector('.bubble .it') || l).textContent.replace(/\s+/g, ' ').trim() })));
    const r = L.slice(mark); mark = L.length; return r;
  };
  const say = async labels => {
    await p.waitForSelector('#builder:not([hidden])', { timeout:12000 });
    for (const w of labels) await p.click(`#bank .tile >> text="${w}"`);
    await p.click('#btnSay'); await p.waitForTimeout(400); await settle(); await t.dump();
    return newLines();
  };
  const sayIt = async sentence => { const ts = await toTiles(sentence); if (!ts){ t.check(`tiles for "${sentence}"`, false); return []; } return say(ts); };
  const npcSaid = (L, s) => L.some(l => l.who === 'npc' && l.text.includes(s));
  const mgSaid = (L, s) => L.some(l => l.who === 'mg' && l.text.includes(s));
  const mgObjects = L => L.some(l => l.who === 'mg' && /No, (no, )?dear|And my|Two cornetti/.test(l.text));
  const bar = async () => (await dbg()).l15.bar;
  const shot = async name => { await p.waitForTimeout(250); await p.screenshot({ path:path.join(REVIEW, name + '.jpg'), type:'jpeg', quality:76 }); console.log('   shot', name); };
  const unknownPlates = () => p.$$eval('#transcript .nameplate.unknown', x => x.length);
  const open = async (at, o, x = 800, y = 304) => {
    if (await p.isVisible('#dialog')) await t.leave();
    await p.evaluate(([at, o]) => __debug.l15At(at, o), [at, o]); await p.waitForTimeout(2800);
    await p.evaluate(([x, y]) => __debug.place(x, y, { x:0, y:-1 }), [x, y]); await p.waitForTimeout(300);
    await p.keyboard.press('e'); await p.waitForSelector('#dialog:not([hidden])', { timeout:12000 }); await p.waitForTimeout(600); await settle(); await t.dump();
    mark = 0; return newLines();
  };
  await p.evaluate(() => { window.__hintLog = []; });

  await t.jump(15, 'Alex');
  t.check('the transcript has the designer\'s lines (Alex\'s ten)', ALEX.length === 10);

  /* ---------- the designer's transcript, replayed ---------- */
  let L = await open('l15-breakfast', { mgPick:'marmellata' });
  const who = await p.textContent('#dlgWho');
  t.check('the bar: "Buongiorno! Cosa prende?", said by "La barista" (not "???"); Margaret: ask what cornetti', npcSaid(L, 'Cosa prende?') && L.find(l => l.who === 'npc').plate === 'La barista'
    && /La barista/.test(who) && !(await unknownPlates()) && mgSaid(L, 'what sort of cornetti'));
  /* 1 · Buongiorno! Che cornetti avete? → one reply */
  L = await sayIt(ALEX[0]);
  const np = L.filter(l => l.who === 'npc');
  t.check('"Buongiorno! Che cornetti avete?" → one natural reply: "Buongiorno! Abbiamo cornetti vuoti, alla crema, alla marmellata e al cioccolato."',
    np.length === 1 && np[0].text === 'Buongiorno! Abbiamo cornetti vuoti, alla crema, alla marmellata e al cioccolato.');
  /* 2 · Margaret: "What kinds have they got?" → Alex: "Plain ones, custard ones, …" */
  await p.waitForSelector('#choices:not([hidden]) button.english', { timeout:12000 });
  await p.click(`#choices button.english >> text="${ALEX[1]}"`); await p.waitForTimeout(800); await settle(); await t.dump();
  L = await newLines();
  t.check('Margaret\'s pick (Alex\'s answer) → "Jam for me, please… a little black coffee"', mgSaid(L, 'Jam for me') && (await dbg()).l15.kindsOK);
  /* 3 · Per lei un caffè e un cornetto alla crema. → her own order, wrong: Margaret objects */
  L = await sayIt(ALEX[2]);
  t.check('"Per lei un caffè e un cornetto alla crema." → "Allora: per la signora un caffè e un cornetto alla crema?"; Margaret: "No, dear: jam, I said!" (her own order)',
    npcSaid(L, 'Allora: per la signora un caffè e un cornetto alla crema?') && mgSaid(L, 'No, dear: jam, I said!'));
  /* 4 · Sì. → taken as "yes, that's it" (not "Sì?"); Margaret insists */
  L = await sayIt(ALEX[3]);
  let B = await bar();
  t.check('"Sì." → the barista takes it ("Va bene!", not "Sì?"); Margaret insists: jam; her order is not done', npcSaid(L, 'Va bene!') && !npcSaid(L, 'Sì?') && mgSaid(L, 'jam') && !B.mg.ok);
  let h = await p.$eval('#hint', x => x.hidden ? '' : x.textContent);
  t.check('the hint: Margaret wanted something else; correct it (no Italian sentence)', /Margaret/.test(h) && !/marmellata/i.test(h));
  /* 5 · No, per lei un caffè e un cornetto alla marmellata. → corrected; Margaret: Perfect */
  L = await sayIt(ALEX[4]);
  B = await bar();
  t.check('"No, per lei … alla marmellata." → "Allora: per la signora un caffè e un cornetto alla marmellata?"; Margaret: "Perfect, dear!"',
    npcSaid(L, 'Allora: per la signora un caffè e un cornetto alla marmellata?') && mgSaid(L, 'Perfect, dear!') && !mgObjects(L) && B.mg.p.f === 'marmellata' && B.mg.d === 'caffè');
  /* 6 · E per me. Vorrei un cappuccino e un cornetto vuoto. → the player's own order; Margaret's stays */
  L = await sayIt(ALEX[5]);
  B = await bar();
  t.check('"E per me. Vorrei un cappuccino e un cornetto vuoto." → "Allora: per Lei un cappuccino e un cornetto vuoto?"; Margaret says nothing about it; her order taken as right',
    npcSaid(L, 'Allora: per Lei un cappuccino e un cornetto vuoto?') && !L.some(l => l.who === 'mg') && B.mg.ok && B.mg.p.f === 'marmellata' && B.me.d === 'cappuccino' && B.me.p.f === 'vuoto' && !B.me.ok);
  /* 7 · No, un cappuccino e un cornetto vuoto per me. → the same again: she asks again; Margaret silent */
  L = await sayIt(ALEX[6]);
  B = await bar();
  t.check('"No, un cappuccino e un cornetto vuoto per me." → she says it back again; no objection from Margaret; Margaret\'s order kept',
    npcSaid(L, 'per Lei un cappuccino e un cornetto vuoto?') && !mgObjects(L) && B.mg.ok && !B.me.ok);
  /* 8 · No, per lei un caffè e un cornetto alla marmellata. → already right: kept; back to the player's */
  L = await sayIt(ALEX[7]);
  B = await bar();
  t.check('"No, per lei … alla marmellata." (already right) → "Sì, sì: per la signora …" and "E per Lei un cappuccino e un cornetto vuoto, giusto?"',
    npcSaid(L, 'Sì, sì: per la signora un caffè e un cornetto alla marmellata.') && npcSaid(L, 'E per Lei un cappuccino e un cornetto vuoto, giusto?') && !mgObjects(L) && B.mg.ok);
  /* 9 · Sì. → both confirmed: the order */
  L = await sayIt(ALEX[8]);
  let d = await dbg();
  t.check('"Sì." → both confirmed: "Perfetto! Allora: per la signora …, e per Lei …. Ecco!"; € 7; Margaret: how much?',
    npcSaid(L, 'Perfetto! Allora: per la signora un caffè e un cornetto alla marmellata, e per Lei un cappuccino e un cornetto vuoto. Ecco!') && d.l15.ordered && d.l15.order.total === 7 && mgSaid(L, 'How much is it'));
  await shot('bar-01-transcript-order');
  /* 10 · Vorrei un cappuccino. → it's all coming (nothing wiped) */
  L = await sayIt(ALEX[9]);
  d = await dbg();
  t.check('"Vorrei un cappuccino." after the order → "arriva tutto"; the order unchanged', npcSaid(L, 'arriva tutto') && d.l15.order.total === 7 && !mgObjects(L));
  /* the price, the goodbye */
  L = await say(["Quant'è?"]);
  await p.waitForSelector('#npad', { timeout:12000 });
  await p.fill('#npadInput', '7'); await p.click('#npadOK'); await p.waitForTimeout(800); await settle(); await t.dump();
  L = await say(['Grazie', 'Arrivederci']);
  d = await dbg();
  t.check('€ 7 on the notepad: paid; Grazie, Arrivederci → the formal goodbye; done', d.l15.barPaid && d.l15.barDone && npcSaid(L, 'Buona giornata!'));
  t.check('every line of hers has the label "La barista"', !(await unknownPlates()) && (await p.$$eval('#transcript .line.npc:not(.companion) .nameplate', x => x.every(e => e.textContent === 'La barista'))));
  await shot('bar-02-transcript-paid');
  await t.leave();
  t.check('closing it: l15-bepi', (await dbg()).tut === 'l15-bepi');

  /* ---------- variant 1 · both orders in one sentence ---------- */
  L = await open('l15-breakfast', { mgPick:'cioccolato', kindsOK:true });
  L = await sayIt('Buongiorno! Un caffè e un cornetto al cioccolato per lei, e un cappuccino e un cornetto vuoto per me, per favore.');
  t.check('both in one sentence → one question for both; Margaret: "Perfect, dear!"', npcSaid(L, 'Buongiorno! Allora: per la signora un caffè e un cornetto al cioccolato, e per Lei un cappuccino e un cornetto vuoto?') && mgSaid(L, 'Perfect, dear!'));
  L = await sayIt('Sì, grazie.');
  d = await dbg();
  t.check('Sì → the order (€ 7)', d.l15.ordered && d.l15.order.total === 7 && npcSaid(L, 'Ecco!'));

  /* ---------- variant 2 · separate turns; Sì to "E un cornetto?"; a No ---------- */
  L = await open('l15-breakfast', { mgPick:'crema', kindsOK:true });
  L = await sayIt('Per lei un caffè');
  t.check('"Per lei un caffè" → "Per la signora un caffè. E un cornetto?"; Margaret: nothing (nothing wrong yet)', npcSaid(L, 'Per la signora un caffè. E un cornetto?') && !L.some(l => l.who === 'mg'));
  L = await sayIt('Sì');
  t.check('Sì → "Che cornetto? Vuoto, alla crema, alla marmellata o al cioccolato?"', npcSaid(L, 'Che cornetto? Vuoto, alla crema, alla marmellata o al cioccolato?'));
  L = await sayIt('Alla crema, per favore');
  t.check('"Alla crema" → "Allora: per la signora un caffè e un cornetto alla crema?"; Perfect', npcSaid(L, 'Allora: per la signora un caffè e un cornetto alla crema?') && mgSaid(L, 'Perfect, dear!'));
  L = await sayIt('Sì');
  t.check('Sì → "Perfetto! E per Lei?"; Margaret: "And something for you, dear!"', npcSaid(L, 'Perfetto! E per Lei?') && mgSaid(L, 'And something for you'));
  L = await sayIt('Vorrei un cappuccino');
  t.check('"Vorrei un cappuccino" → the player\'s drink: "Per Lei un cappuccino. E un cornetto?"', npcSaid(L, 'Per Lei un cappuccino. E un cornetto?') && (await bar()).mg.ok && !mgObjects(L));
  L = await sayIt('No');
  t.check('No → "Niente cornetto?…"; Margaret: have one', npcSaid(L, 'Niente cornetto?') && mgSaid(L, 'do have a cornetto'));
  L = await sayIt('Un cornetto vuoto');
  t.check('"Un cornetto vuoto" → "Allora: per Lei un cappuccino e un cornetto vuoto?"', npcSaid(L, 'Allora: per Lei un cappuccino e un cornetto vuoto?') && !mgObjects(L));
  L = await sayIt('Sì');
  d = await dbg();
  t.check('Sì → the order (€ 7)', d.l15.ordered && d.l15.order.total === 7);

  /* ---------- variant 3 · Per me lo stesso ---------- */
  L = await open('l15-breakfast', { mgPick:'marmellata', kindsOK:true });
  L = await sayIt('Per lei un caffè e un cornetto alla marmellata');
  L = await sayIt('Sì');
  L = await sayIt('Per me lo stesso');
  t.check('"Per me lo stesso" → "Allora: per Lei un caffè e un cornetto alla marmellata?"', npcSaid(L, 'Allora: per Lei un caffè e un cornetto alla marmellata?') && !mgObjects(L));
  L = await sayIt('Sì');
  d = await dbg();
  t.check('Sì → the order (€ 6: two coffees, two jam cornetti)', d.l15.ordered && d.l15.order.total === 6);

  /* ---------- variant 4 · a wrong drink for Margaret, corrected alone; Anche per me ---------- */
  L = await open('l15-breakfast', { mgPick:'cioccolato', kindsOK:true });
  L = await sayIt('Per lei un cappuccino e un cornetto al cioccolato');
  t.check('a cappuccino for Margaret → "just a little black coffee"', mgSaid(L, 'just a little black coffee'));
  L = await sayIt('No, un caffè');
  B = await bar();
  t.check('"No, un caffè" → only the drink changes: "… un caffè e un cornetto al cioccolato?"; Perfect', npcSaid(L, 'Allora: per la signora un caffè e un cornetto al cioccolato?') && mgSaid(L, 'Perfect, dear!') && B.mg.p.f === 'cioccolato');
  L = await sayIt('Anche per me');
  B = await bar();
  t.check('"Anche per me" → Margaret\'s taken as right; "Allora: per Lei un caffè e un cornetto al cioccolato?"', npcSaid(L, 'Allora: per Lei un caffè e un cornetto al cioccolato?') && B.mg.ok);
  L = await sayIt('Sì');
  t.check('Sì → the order', (await dbg()).l15.ordered);

  /* ---------- variant 5 · nobody named; Ancora una volta; two plain cornetti for me ---------- */
  L = await open('l15-breakfast', { mgPick:'crema', kindsOK:true });
  L = await sayIt('Vorrei un caffè e un cornetto alla crema');
  t.check('nobody named, both open → "Un caffè e un cornetto alla crema… Per chi? Per Lei o per la signora?"', npcSaid(L, 'Un caffè e un cornetto alla crema… Per chi? Per Lei o per la signora?') && !L.some(l => l.who === 'mg'));
  L = await sayIt('Per lei');
  t.check('"Per lei" → hers: "Allora: per la signora un caffè e un cornetto alla crema?"; Perfect', npcSaid(L, 'Allora: per la signora un caffè e un cornetto alla crema?') && mgSaid(L, 'Perfect, dear!'));
  L = await sayIt('Ancora una volta, per favore');
  t.check('"Ancora una volta, per favore" → "Sì, certo!" and the same question again; nothing changes', npcSaid(L, 'Sì, certo!') && npcSaid(L, 'per la signora un caffè e un cornetto alla crema?') && !(await bar()).mg.ok);
  L = await sayIt('Sì');
  L = await sayIt('Un cappuccino e due cornetti vuoti per me');
  t.check('"Un cappuccino e due cornetti vuoti per me" → "Allora: per Lei un cappuccino e due cornetti vuoti?"', npcSaid(L, 'Allora: per Lei un cappuccino e due cornetti vuoti?') && !mgObjects(L));
  L = await sayIt('Sì');
  d = await dbg();
  t.check('Sì → the order (€ 9)', d.l15.ordered && d.l15.order.total === 9);

  /* ---------- variant 6 · the player's order first: Margaret says nothing about it ---------- */
  L = await open('l15-breakfast', { mgPick:'marmellata', kindsOK:true });
  L = await sayIt('Per me un cappuccino e un cornetto vuoto');
  t.check('the player\'s own order first → "Allora: per Lei un cappuccino e un cornetto vuoto?"; Margaret does not judge it', npcSaid(L, 'Allora: per Lei un cappuccino e un cornetto vuoto?') && !L.some(l => l.who === 'mg'));
  L = await sayIt('Sì');
  t.check('Sì → "Perfetto! E per la signora?"', npcSaid(L, 'Perfetto! E per la signora?') && !L.some(l => l.who === 'mg'));
  L = await sayIt('Un caffè e un cornetto alla crema');
  t.check('nobody named, only hers open → hers; the wrong filling: Margaret objects', npcSaid(L, 'Allora: per la signora un caffè e un cornetto alla crema?') && mgSaid(L, 'No, dear: jam, I said!'));
  L = await sayIt('No, alla marmellata');
  t.check('"No, alla marmellata" → only the filling: "… un caffè e un cornetto alla marmellata?"', npcSaid(L, 'Allora: per la signora un caffè e un cornetto alla marmellata?') && mgSaid(L, 'Perfect, dear!'));
  L = await sayIt('Sì');
  d = await dbg();
  t.check('Sì → the order (€ 7)', d.l15.ordered && d.l15.order.total === 7);
  await shot('bar-03-player-first');

  /* ---------- the staff's labels: the information desk, the ACTV booth ---------- */
  L = await open('l15-directions', {}, 144, 350);
  t.check('the information desk: "Informazioni", not "???"', L.some(l => l.who === 'npc' && l.plate === 'Informazioni') && !(await unknownPlates()) && /Informazioni/.test(await p.textContent('#dlgWho')));
  await shot('label-01-informazioni');
  L = await open('l15-ticket', {}, 870, 330);
  t.check('the ACTV booth: "Biglietteria ACTV", not "???"', L.some(l => l.who === 'npc' && l.plate === 'Biglietteria ACTV') && !(await unknownPlates()));
  L = await sayIt('Buongiorno! Due biglietti per San Marco, per favore.');
  t.check('… and its greeting with the request: one reply ("Buongiorno! Due biglietti per San Marco…")', npcSaid(L, 'Buongiorno! Due biglietti per San Marco, da settantacinque minuti. Ecco!') && !(await unknownPlates()));
  await shot('label-02-biglietteria-actv');
  await t.leave().catch(() => {});

  /* no hint gave the Italian answer */
  const log = await p.evaluate(() => window.__hintLog || []);
  const MODELS = ['un caffè e un cornetto', 'un cappuccino e un cornetto', 'per lei un caffè', 'per me un cappuccino', 'che cornetti avete', 'per me lo stesso', 'anche per me'];
  const bad = log.filter(x => MODELS.some(m => x.toLowerCase().includes(m)));
  console.log(`   ${log.length} hints shown`);
  if (bad.length) console.log('   BAD HINTS: ' + JSON.stringify(bad));
  t.check('no hint gives the Italian answer', !bad.length);
  const audit = await p.evaluate(() => __vocabAudit()[15]);
  t.check('the vocab audit: every word of the bar\'s tiles is taught (lo stesso, anche)', Array.isArray(audit) && !audit.length);
}, { fakeSpeech:true });
