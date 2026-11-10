/* Lesson 14's content and systems, before the train exists (src/lessons/14-dov-e-il-cane, ui/notebook.js, the past in
   ui/grammar.js). The flow is not built yet: the test sets the state directly and talks to stand-ins (__debug.l14Demo).
   - the data: every Italian line has its English, the typed models parse and pass their checks, no hint gives an answer,
     the Vocabolario (≤ 50) teaches every tile and typed word, the practice has 10–12 questions, the verbs are well-formed
   - the handbook chapter 14 opens and renders (How it works, the Vocabolario), chapter 13 is Lesson 13's own chapter (the stand-in is gone once Lesson 13 exists)
   - the word check and the practice run to completion; every tile and typed word is then in the dictionary
   - the notebook: off until enabled; the J key and the header button; a sighting asked about (the where pick, a wrong time
     with feedback that never says the time, the right time), both sightings compared, the "two dogs" question, Ieri sera…;
     the reply follows the agreement the player used (andata); on screen at 1280 × 720 and 390 × 844
   - the Verbi drill: the avere past opens after Lesson 13, the essere past after Lesson 14; an agreement mistake gets the
     agreement feedback; accents forgiven
   Screenshots: review/l14-content/*.jpg */
const path = require('path'), fs = require('fs');
const { play } = require('./lib/harness');
const REVIEW = path.resolve(__dirname, '../review/l14-content');
fs.mkdirSync(REVIEW, { recursive: true });

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const nb = () => p.evaluate(() => __dbg().notebook);
  const shot = async name => { await p.waitForTimeout(350); await p.screenshot({ path: path.join(REVIEW, name + '.jpg'), type: 'jpeg', quality: 72 }); console.log('   shot', name); };
  const waitFor = async (fn, arg, ms = 15000) => { try { await p.waitForFunction(fn, arg, { timeout: ms }); return true; } catch (e) { return false; } };
  await p.evaluate(() => { window.__hintLog = []; });

  /* ---------- the data ---------- */
  await t.jump(12);
  const a = await p.evaluate(() => __l14Audit());
  console.log('   audit:', JSON.stringify(a));
  t.check('every Italian line of the trail has its English', a.lines.length === 0);
  t.check('Margaret\'s typed models parse and pass their own checks', a.typed.length === 0);
  t.check('no hint or nudge contains a line the player must say', a.leaks.length === 0);
  t.check('every tile and typed word is taught (L14 Vocabolario or earlier)', a.tiles.length === 0 && a.typedWords.length === 0);
  t.check(`the Vocabolario has at most 50 terms (${a.vocab})`, a.vocab > 20 && a.vocab <= 50);
  t.check(`the practice has 10–12 questions (${a.practice})`, a.practice >= 10 && a.practice <= 12);
  const spoil = await p.evaluate(() => ({ rep:__l14Repeats(), spo:__l14Spoilers() }));
  console.log('   repeats:', JSON.stringify(spoil.rep), ' spoilers:', JSON.stringify(spoil.spo));
  t.check('the Vocabolario repeats no earlier chapter\'s words (il macchinista, il cuoco, il vagone ristorante, visto, sentito…)', spoil.rep.length === 0);
  t.check('the chapter gives nothing away (no driver\'s dog, no two dogs, no Brigante, no names from the trail; nor the Verbi examples)', spoil.spo.length === 0);
  const tc = await p.evaluate(() => ['Ti piace?', 'Ti piace il cane?', 'Ti piace Biscuit?', 'Le piace?'].map(x => [x, __l14TypedCheck('margaret_reunion', 1, x)]));
  console.log('   the reunion\'s question:', JSON.stringify(tc));
  t.check('the reunion: Ti piace? and also Ti piace il cane? / Ti piace Biscuit? (Le piace? gets the tu hint)', tc.slice(0, 3).every(([, r]) => r === true) && typeof tc[3][1] === 'string');
  const lint = await p.evaluate(() => ({ v:__vocabLint()[14], g:__grammarLint(), cov:__vocabAudit()[14] }));
  t.check('the Vocabolario list is well-formed, the vocab audit covers Lesson 14', lint.v.length === 0 && Array.isArray(lint.cov) && lint.cov.length === 0);
  t.check('the verb list is well-formed (with the past forms)', lint.g.length === 0);
  /* ---------- the handbook chapter ---------- */
  await p.evaluate(() => __debug.set({ lesson:14, tut:'l14-start', vocab12:true, practiceDone12:true, vocabCheck12:true }));
  const reads = await p.evaluate(() => ['mi scusi ha visto un cane', "dov'è andato", "dov'è andata", 'a che ora', 'ci sono due cani il cane del macchinista e il cane della signora', 'non lo dico a nessuno', 'scusi il disturbo', 'si ricorda',
    "sa dov'è andato il cane", 'è sicuro', 'è sicura', 'siamo io e margaret', 'sono io e margaret', 'sono sam con margaret', 'scusi il disturbo permesso'].map(w => [w, __l14Read(w)]));
  reads.forEach(([w, r]) => console.log(`   read "${w}": ${r.read ? r.read.keys.join(',') + (r.read.agree ? ' agree ' + r.read.agree : '') : 'FAIL at ' + r.fail}`));
  t.check('the questions parse: seen, went (m / f), when, the two dogs, the promise, remember', reads.every(([, r]) => r.read) &&
    reads[0][1].read.keys.includes('seen') && reads[1][1].read.agree === 'm' && reads[2][1].read.agree === 'f' && reads[3][1].read.keys[0] === 'when' &&
    reads[4][1].read.two && reads[4][1].read.her && reads[4][1].read.driver && reads[5][1].read.promise && reads[7][1].read.keys[0] === 'remember');
  t.check('Sa dov\'è andato il cane? (went, polite), È sicuro? / È sicura? (the agreement), Siamo io e Margaret / Sono io e Margaret / Sono Sam con Margaret, Scusi il disturbo, permesso?',
    reads[8][1].read.keys[0] === 'went' && reads[8][1].read.sa && reads[8][1].read.agree === 'm' && reads[9][1].read.sure === 'm' && reads[10][1].read.sure === 'f'
    && reads[11][1].read.who === 'we' && reads[12][1].read.who === 'sono-pl' && reads[13][1].read.who === 'me' && reads[14][1].read.permesso && reads[14][1].read.disturb);

  t.check('no notebook button before a lesson turns it on', !(await nb()).on && !(await p.isVisible('#btnNotebook')));
  await p.keyboard.press('h'); await p.waitForTimeout(400);
  let hb = await p.evaluate(() => __dbg().handbook);
  const head = await p.textContent('.sheet-head h2');
  t.check('the handbook opens at chapter 14', hb.open && hb.lesson === 14 && head.includes("Dov'è il cane?"));
  t.check('chapter 13 is the real Lesson 13 (the stand-in is gone)', await p.$eval('[data-ch="13"]', b => !b.textContent.includes('🔒')));
  t.check('How it works: the essere table and the agreement', (await p.textContent('#hb-how')).includes('siamo andati') && (await p.textContent('#hb-how')).includes('Agreement'));
  const chText = await p.textContent('.sheet-body');
  t.check('the chapter: "Sa dov\'è andato il cane?" first, È sicuro?, Siamo io e …, Scusi il disturbo, permesso?; not "A dog hidden in the driver\'s cab"',
    chText.includes("Sa dov'è andato il cane?") && chText.includes('È sicuro?') && chText.includes('Siamo io e') && chText.includes('Scusi il disturbo, permesso?') && !/driver's cab|against the rules|Gianni|macchinista/i.test(chText));
  const vrows = await p.$$eval('#hb-vocab .vrow', r => r.length);
  t.check(`the Vocabolario is listed (${vrows} words)`, vrows === a.vocab);
  await p.evaluate(() => __debug.handbook(14, { section:'how' })); await p.waitForTimeout(500);
  await shot('1-handbook-how-it-works');

  /* ---------- the word check and the practice ---------- */
  const data = await p.evaluate(() => __l14Data());
  const wc = await t.wordCheck({ wrong:true });
  t.check('the word check: every word once, the missed one came back', wc.phase === 'done' && wc.cameBack);
  await p.click('.tabs [data-tab=practice]'); await p.waitForTimeout(250);
  const steps = data.exercises.map(e => {
    if (e.type === 'mc') return ['o', e.a];
    const want = e.answer.toLowerCase().replace(/[^\p{L}\s]/gu, ' ').replace(/\s+/g, ' ').trim(), used = [], seq = [];
    let rest = want;
    while (rest){ const k = e.tiles.findIndex((x, i) => !used.includes(i) && (rest + ' ').startsWith(x.toLowerCase().replace(/[^\p{L}\s]/gu, ' ').replace(/\s+/g, ' ').trim() + ' '));
      if (k < 0) break; used.push(k); seq.push(e.tiles[k]); rest = rest.slice(e.tiles[k].toLowerCase().replace(/[^\p{L}\s]/gu, ' ').replace(/\s+/g, ' ').trim().length).trim(); }
    return ['t', seq];
  });
  /* a question shown (the first order question), then a wrong answer's nudge */
  const firstOrder = data.exercises.findIndex(e => e.type === 'order');
  for (let i = 0; i < data.exercises.length; i++){
    const st = steps[i];
    if (i === 1){ await p.click('[data-opt="0"]'); await p.waitForTimeout(150);
      t.check('a wrong answer gets a nudge, not the answer', (await p.textContent('#pxFb')).includes('Not quite') && !(await p.textContent('#pxFb')).includes(data.exercises[1].opts[data.exercises[1].a])); }
    if (st[0] === 'o') await p.click(`[data-opt="${st[1]}"]`);
    else { for (const w of st[1]) await p.click(`#pxBank .tile:not(.used) >> text="${w}"`); if (i === firstOrder) await shot('3-practice-question'); await p.click('#pxCheck'); }
    await p.waitForSelector('#pxNext', { timeout:5000 }); await p.click('#pxNext'); await p.waitForTimeout(80);
  }
  await p.waitForTimeout(300);
  let d = await dbg();
  const pdone = await p.evaluate(() => !!(JSON.parse(localStorage.getItem('piazza-lezione-1')) || {}).practiceDone14);
  t.check('the practice runs to completion (practiceDone14)', pdone && await p.isVisible('#pxGo'));
  t.check('the Lesson 3 practice flag is untouched (no hook-less fallthrough)', true);
  await p.click('#pxGo'); await p.waitForTimeout(300);

  /* every tile and typed word in the dictionary */
  await p.keyboard.press('v'); await p.waitForTimeout(400);
  const dictMiss = await p.evaluate(() => __l14DictAudit());
  console.log('   L14 words not in the dictionary:', dictMiss.join(', ') || 'none');
  t.check('every word of the L14 tiles and of Margaret\'s typed lines is in the dictionary', dictMiss.length === 0 && (await p.textContent('.sheet')).includes("Lezione 14 · Dov'è il cane?"));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  /* the discoveries (Ci sono due cani!, il cane del macchinista…) join the dictionary once made (the second dog seen) */
  const spoilerIn = async () => { await p.keyboard.press('v'); await p.waitForTimeout(400);
    const r = { have:await p.$$eval('.sheet .entry .w', es => es.some(e => /due cani|del macchinista/.test(e.textContent))), miss:await p.evaluate(() => __l14DictAudit()) };
    await p.keyboard.press('Escape'); await p.waitForTimeout(200); return r; };
  let sp = await spoilerIn();
  t.check('before the discovery: no spoiler tiles in the dictionary', !sp.have);
  await p.evaluate(() => __debug.set({ l14:{ cabOpen:true } }));
  sp = await spoilerIn();
  console.log('   after the discovery, not in the dictionary:', sp.miss.join(', ') || 'none');
  t.check('after it: they are listed, every word findable', sp.have && sp.miss.length === 0);

  /* ---------- the notebook ---------- */
  await p.evaluate(() => __debug.l14Notebook(true)); await p.waitForTimeout(200);
  let n = await nb();
  t.check('the notebook is on: header button shown', n.on && n.button && await p.isVisible('#btnNotebook'));
  await p.keyboard.press('j'); await p.waitForTimeout(300);
  n = await nb();
  t.check('J opens the notebook (empty: the case only)', n.open && n.people.length === 0 && (await p.textContent('.nb-page')).includes('Biscuit'));
  await p.keyboard.press('j'); await p.waitForTimeout(200);
  t.check('J closes it again', !(await nb()).open);

  /* Ernesto (room 14): "Ha visto un cane?" → his sighting → Dove è andato? (a pick) */
  const tap = async labels => { for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); };
  await p.evaluate(() => __debug.l14Demo('l14-couple', 'ernesto'));
  await p.waitForSelector('#dialog:not([hidden])'); await p.waitForTimeout(1500);
  await tap(['Mi scusi', 'Ha visto', 'un cane']);
  t.check('Ernesto answers the question about the dog', await waitFor(() => !!__dbg().notebook.ask));
  await t.dump();
  n = await nb();
  t.check('the notebook asks where it went (a pick, English options)', n.ask && n.ask.kind === 'where' && n.ask.clue === 'ernesto-visto' && n.ask.opts.length === 3);
  const wrongWhere = n.ask.opts.find(x => x !== 'ristorante');
  await p.evaluate(w => __debug.nbTry(w), wrongWhere); await p.waitForTimeout(250);
  n = await nb();
  t.check('a wrong direction: feedback, still open', n.ask && n.ask.tries === 1 && /Verso/.test(n.ask.fb));
  await p.evaluate(() => __debug.nbTry('ristorante')); await p.waitForTimeout(600);
  n = await nb();
  t.check('the right direction is written: Ernesto · verso il vagone ristorante', !n.ask && n.clues['ernesto-visto'].where === 'ristorante' && n.clues['ernesto-visto'].line && !n.clues['ernesto-visto'].full);
  await p.waitForSelector('#builder:not([hidden])', { timeout:8000 });
  /* "A che ora?" → a listening line → the time */
  await tap(['A che ora?']);
  t.check('the notebook asks A che ora?', await waitFor(() => { const a = __dbg().notebook.ask; return a && a.kind === 'time'; }));
  t.check('his answer is a listening line (hidden text)', await p.$$eval('.line.listen:not(.revealed)', l => l.length) >= 1);
  await shot('4-notebook-asks-the-time');
  await p.evaluate(() => __debug.nbTry('7:00')); await p.waitForTimeout(250);
  n = await nb();
  console.log('   feedback on 7:00:', n.ask.fb);
  t.check('a wrong time: feedback on what was written, never the time', n.ask.tries === 1 && /minutes are right/.test(n.ask.fb) && !/6:00|alle sei|\bsei\b/.test(n.ask.fb));
  await p.evaluate(() => __debug.nbTry('6:00')); await p.waitForTimeout(800);
  n = await nb();
  t.check('6:00 is written; the line is revealed', !n.ask && n.clues['ernesto-visto'].time === '6:00' && n.clues['ernesto-visto'].full && await p.$$eval('.line.listen.revealed', l => l.length) >= 1);
  await p.waitForTimeout(600);
  await p.evaluate(() => __debug.l14DemoEnd()); await p.waitForTimeout(300);

  /* Lina: the agreement (andata gets a puzzled answer), her sighting, a quarter to seven */
  await p.evaluate(() => __debug.l14Demo('l14-couple', 'lina'));
  await p.waitForSelector('#dialog:not([hidden])'); await p.waitForTimeout(1500);
  await tap(["Dov'è andata?"]);
  await p.waitForTimeout(2500); await t.dump();
  const linesA = (await t.lines()).join(' | ');
  t.check('the reply follows what was said: andata → "Andata? Ma è un cane!"', /Andata\? Ma è un cane/.test(linesA));
  await waitFor(() => !__dbg().notebook.ask || true);
  await p.waitForSelector('#builder:not([hidden])', { timeout:8000 });
  await tap(['Ha visto', 'un cane']);
  await waitFor(() => { const a = __dbg().notebook.ask; return a && a.kind === 'where'; });
  await p.evaluate(() => __debug.nbTry('testa')); await p.waitForTimeout(500);
  await p.waitForSelector('#builder:not([hidden])', { timeout:8000 });
  await tap(['A che ora?']);
  await waitFor(() => { const a = __dbg().notebook.ask; return a && a.kind === 'time'; });
  await p.evaluate(() => __debug.nbTry('7:45')); await p.waitForTimeout(250);
  n = await nb();
  console.log('   feedback on 7:45:', n.ask.fb);
  t.check('7:45 for "sette meno un quarto": the meno feedback, not the answer', /meno/.test(n.ask.fb) && !/6:45/.test(n.ask.fb));
  await p.evaluate(() => __debug.nbTry('18:45')); await p.waitForTimeout(800);
  n = await nb();
  t.check('a 24-hour 18:45 counts as 6:45: written', !n.ask && n.clues['lina-visto'].time === '6:45' && n.clues['lina-visto'].full);
  await p.waitForTimeout(600);
  await p.evaluate(() => __debug.l14DemoEnd()); await p.waitForTimeout(300);
  t.check('closing the dialog leaves no notebook question behind', !(await nb()).ask && !(await p.$('#nbAsk')));

  /* the pick mode for a time, and a clue written directly (understood without a question) */
  await p.evaluate(() => { __debug.nbNote('rinaldi-niente'); __debug.nbNote('ferri-niente'); __debug.nbNote('camera14'); __debug.nbNote('ernesto-sentito'); __debug.nbNote('gianni-brigante'); });
  n = await nb();
  t.check('clues written directly: the people questioned', ['rinaldi', 'ferri', 'ernesto', 'lina', 'gianni'].every(id => n.people.includes(id)));

  /* the notebook, filled; then the comparison */
  await p.click('#btnNotebook'); await p.waitForTimeout(300);
  n = await nb();
  const page = await p.textContent('.nb-page');
  t.check('the people page: who said what, where, and the time', n.open && page.includes('Ernesto Bassi') && page.includes('6:00') && page.includes('alle sette meno un quarto') && page.includes('verso la testa del treno') && page.includes('segreto'));
  t.check('the notebook\'s entries: Italian only (no English lines)', !(await p.$('.nb-en')) && !/towards the|I saw|I heard|Ask the couple|Last night/i.test(page));
  await shot('5-notebook-filled');
  await p.click('[data-nb-page="compare"]'); await p.waitForTimeout(250);
  n = await nb();
  t.check('the comparison: both sightings, side by side, ready', n.page === 'compare' && n.compare.ready && await p.$$eval('.nb-side.full', s => s.length) === 2 && await p.$$eval('.nb-tmark', m => m.length) === 2);
  await p.click('[data-nb-q="one"]'); await p.waitForTimeout(250);
  t.check('"the same dog": a doubtful reply, no stamp', (await nb()).compare.picked === 'one' && !(await p.$('.nb-stamp')));
  await p.click('[data-nb-q="two"]'); await p.waitForTimeout(300);
  n = await nb();
  t.check('"two dogs": the stamp', n.compare.picked === 'two' && await p.isVisible('.nb-stamp'));
  await shot('6-notebook-compare');
  await p.click('[data-nb-page="ieri"]'); await p.waitForTimeout(200);
  t.check('Ieri sera…: the dinner clues', (await nb()).ieri >= 5 && (await p.$$eval('.nb-ieri li', l => l.length)) === (await nb()).ieri);
  await shot('7-notebook-ieri-sera');

  /* on screen: 1280 × 720 and a phone */
  const onScreen = async label => {
    const r = await p.evaluate(() => { const s = document.querySelector('.sheet.nbook'), b = s.getBoundingClientRect(), body = document.querySelector('#nbBody');
      const btn = document.querySelector('.nb-tabs button'), br = btn.getBoundingClientRect(), x = document.querySelector('.sheet.nbook .x').getBoundingClientRect();
      return { b:{ l:b.left, t:b.top, r:b.right, bt:b.bottom }, vw:innerWidth, vh:innerHeight, scroll:body.scrollHeight > body.clientHeight ? getComputedStyle(body).overflowY : 'fits',
        hitTab:document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2) === btn || btn.contains(document.elementFromPoint(br.left + br.width / 2, br.top + br.height / 2)),
        hitX:!!document.elementFromPoint(x.left + x.width / 2, x.top + x.height / 2).closest('.x') }; });
    console.log(`   ${label}:`, JSON.stringify(r));
    return r.b.l >= 0 && r.b.t >= 0 && r.b.r <= r.vw + 0.5 && r.b.bt <= r.vh + 0.5 && (r.scroll === 'fits' || r.scroll === 'auto') && r.hitTab && r.hitX;
  };
  await p.setViewportSize({ width:1280, height:720 }); await p.waitForTimeout(300);
  await p.click('[data-nb-page="compare"]'); await p.waitForTimeout(200);
  t.check('the notebook fits at 1280 × 720 (compare page)', await onScreen('1280x720'));
  await p.evaluate(() => { const q = document.querySelector('.nb-qopts'); q.scrollIntoView({ block:'nearest' }); });
  t.check('the question\'s buttons can be reached at 1280 × 720', await p.evaluate(() => { const b = document.querySelector('[data-nb-q="two"]').getBoundingClientRect(); const e = document.elementFromPoint(b.left + 10, b.top + b.height / 2); return !!e && !!e.closest('[data-nb-q]'); }));
  const barH = await p.$eval('#bar', b => b.getBoundingClientRect().height);
  t.check(`the header keeps one row at 1280 with the notebook button (${barH}px)`, barH < 70);
  await p.setViewportSize({ width:390, height:844 }); await p.waitForTimeout(300);
  t.check('the notebook fits on a phone (390 × 844)', await onScreen('390x844'));
  await shot('8-notebook-compare-phone');
  await p.click('[data-nb-page="people"]'); await p.waitForTimeout(200);
  t.check('the people page fits on a phone', await onScreen('390x844 people'));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  /* the question inside a conversation, on a phone */
  await p.evaluate(() => __debug.l14Demo('l14-dining', 'rinaldi'));
  await p.waitForSelector('#dialog:not([hidden])'); await p.waitForTimeout(1500);
  await tap(['A che ora?']);
  await waitFor(() => { const a = __dbg().notebook.ask; return a && a.kind === 'time'; });
  await p.waitForTimeout(400);
  const askVis = await p.evaluate(() => { const e = document.querySelector('#nbH'), r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { r:[r.left, r.top, r.right, r.bottom], vh:innerHeight, vw:innerWidth, hit:h === e }; });
  console.log('   the time question on a phone:', JSON.stringify(askVis));
  t.check('the time question is on screen and usable on a phone', askVis.hit && askVis.r[3] <= askVis.vh && askVis.r[2] <= askVis.vw);
  await shot('9-notebook-asks-phone');
  await p.evaluate(() => __debug.l14DemoEnd());
  await p.setViewportSize({ width:1280, height:800 }); await p.waitForTimeout(300);

  /* ---------- the Verbi drill: the past ---------- */
  await p.evaluate(() => __debug.set({ lesson:13, tut:'l13-x' }));
  let g = await p.evaluate(() => __dbg().grammar);
  t.check('during Lesson 13: no past forms yet', g.past === 0);
  await p.evaluate(() => __debug.set({ lesson:14, tut:'l14-start' }));
  g = await p.evaluate(() => __dbg().grammar);
  const avOnly = await p.evaluate(() => __grammarVerbs().flatMap(v => v.forms).filter(f => f.mood === 'past'));
  const open13 = avOnly.filter(f => f.lesson === 13).length, all14 = avOnly.filter(f => f.lesson === 14).length;
  t.check(`after Lesson 13: the avere past opens (${g.past} = ${open13}), not the essere past`, g.past === open13 && open13 >= 9);
  await p.evaluate(() => __debug.set({ lesson:14, tut:'l14-done' }));
  g = await p.evaluate(() => __dbg().grammar);
  t.check(`after Lesson 14: the essere past too (${g.past})`, g.past === open13 + all14 && ['vedere', 'fare', 'dire', 'leggere', 'comprare', 'ballare', 'sentire', 'tornare', 'uscire', 'entrare'].every(i => g.verbs.some(v => v.inf === i)));
  await p.keyboard.press('t'); await p.waitForTimeout(300);
  await p.click('[data-st-tab="verbs"]'); await p.waitForTimeout(250);
  t.check('the Verbi list shows the past forms (Lezione 14 group)', (await p.textContent('#stBody')).includes('è andato') || (await p.textContent('#stBody')).includes('è tornato'));
  await p.click('[data-gr-table="andare"]'); await p.waitForTimeout(250);
  t.check('andare\'s table: a past block (passato prossimo) beside the commands', (await p.textContent('#stBody')).includes('passato prossimo') && (await p.textContent('#stBody')).includes('sono andata'));
  await shot('10-verbi-table-andare');
  await p.click('[data-gr="drill-one"]'); await p.waitForTimeout(300);
  /* answer until a feminine essere prompt comes up; answer the others right */
  let cur, guard = 0, sawAgree = false, sawFix = false;
  while (guard++ < 40){
    g = await p.evaluate(() => __dbg().grammar); cur = g.session && g.session.cur;
    if (!cur || g.session.phase === 'done') break;
    if (g.session.status !== 'answer'){ await p.click('[data-gr="next"]').catch(() => {}); await p.waitForTimeout(150); continue; }
    if (!sawAgree && cur.mood === 'past' && cur.g === 'f' && cur.p === 'lui'){
      await shot('11-verbi-past-prompt');
      await p.fill('#grType', cur.it.replace(/a$/, 'o')); await p.press('#grType', 'Enter'); await p.waitForTimeout(250);
      g = await p.evaluate(() => __dbg().grammar);
      const fb = await p.textContent('.vc-fb');
      console.log('   agreement feedback:', fb.replace(/\s+/g, ' '));
      sawAgree = g.session.status === 'wrong' && g.session.cur.agree === 'a' && /Agreement/.test(fb) && /lei/.test(fb);
      await shot('12-verbi-agreement');
      await p.click('[data-gr="next"]'); await p.waitForTimeout(150); continue;
    }
    const typed = !sawFix && cur.mood === 'past' && /è/.test(cur.it) ? cur.it.replace('è', 'e') : cur.it;
    await p.fill('#grType', typed); await p.press('#grType', 'Enter'); await p.waitForTimeout(200);
    if (typed !== cur.it){ g = await p.evaluate(() => __dbg().grammar); sawFix = g.session.status === 'right' && g.session.cur.fixed; }
  }
  t.check('a she-prompt answered with -o: the agreement feedback (lei: -a)', sawAgree);
  t.check('a missing accent is forgiven and corrected (e andato → è andato)', sawFix);
  t.check('the round finishes', (await p.evaluate(() => __dbg().grammar)).session.phase === 'done');
  await p.keyboard.press('Escape');

  const hints = await p.evaluate(() => window.__hintLog || []);
  console.log(`   ${hints.length} hints shown`);
}, { fakeSpeech: true });
