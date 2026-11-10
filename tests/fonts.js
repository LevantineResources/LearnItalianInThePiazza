/* One readable font (the designer, 7 Nov 2026: "be sure that the font is always the same. Some fonts are difficult to read when
   there's thin lines"). Everything a player reads to answer, in the word check (flashcards, then the quiz), the handbook's practice,
   Studio's word sessions (cards, quiz, typed items), Verbi and Vedo, vedo, is in the dialogs' sans (var(--body): Titillium Web),
   upright, at weight 400 or more; never the display serif (Bodoni, with its hairlines). Lessons 7, 11, 13, 15, and Studio from the
   Lesson 15 skip. Screenshots: review/fix-l15/ (a flashcard, a quiz item). */
const { play } = require('./lib/harness');
const path = require('path'), fs = require('fs');
const REVIEW = path.resolve(__dirname, '..', 'review', 'fix-l15');
fs.mkdirSync(REVIEW, { recursive:true });

play(async t => {
  const p = t.page;
  const shot = async name => { await p.waitForTimeout(350); await p.screenshot({ path:path.join(REVIEW, name + '.jpg'), type:'jpeg', quality:78 }); console.log('   shot', name); };
  /* the computed font of every element matching the selectors (first few each) */
  const fonts = sels => p.evaluate(sels => sels.flatMap(sel => [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length).slice(0, 4).map(e => {
    const c = getComputedStyle(e); return { sel, text:(e.value || e.textContent || '').trim().slice(0, 22), fam:c.fontFamily, w:+c.fontWeight, st:c.fontStyle };
  })), sels);
  const SANS = /^"?Titillium Web"?,/;
  const bad = [];
  const expect = async (where, sels, need = sels) => {
    const f = await fonts(sels);
    const wrong = f.filter(x => !SANS.test(x.fam) || x.w < 400 || x.st !== 'normal');
    wrong.forEach(x => bad.push(`${where}: ${x.sel} "${x.text}" → ${x.fam.split(',')[0]} ${x.w} ${x.st}`));
    const missing = need.filter(s => !f.some(x => x.sel === s));
    console.log(`   ${where}: ${f.length} elements checked${missing.length ? ', not on screen: ' + missing.join(' ') : ''}${wrong.length ? ', WRONG: ' + wrong.length : ''}`);
    return { f, missing, wrong };
  };
  const vc = a => p.evaluate(a => { const b = document.querySelector(`[data-vc="${a}"]`); if (b) b.click(); return !!b; }, a);
  const words = () => p.evaluate(() => __dbg().words);

  /* ---------- the word check and the practice of Lessons 7, 11, 13, 15 ---------- */
  for (const n of [7, 11, 13, 15]){
    await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
    await t.jump(n); await p.waitForTimeout(600);
    await p.evaluate(n => __debug.handbook(n), n); await p.waitForTimeout(500);
    await p.click('.tabs [data-tab=words]'); await p.waitForTimeout(300);
    const r1 = await expect(`L${n} flashcard`, ['.vc-front .vc-it', '.vc-back .vc-en', '.vc-back .vc-group', '.vc-count b', '.vc-note']);
    if (n === 7){ await shot('05-flashcard-front'); await vc('flip'); await p.waitForTimeout(700); await shot('06-flashcard-back'); }
    t.check(`Lesson ${n}: the flashcard's Italian is on screen`, !r1.missing.includes('.vc-front .vc-it'));
    await p.evaluate(() => { let g = 0; while (__dbg().words.phase === 'cards' && g++ < 200) document.querySelector('[data-vc=next]').click(); });
    await p.waitForTimeout(300);
    /* answer right through the quiz, checking both kinds of item (Italian → English, English → Italian) */
    const seen = new Set(); let g = 0;
    while ((await words()).phase === 'quiz' && g++ < 120){
      const s = await words();
      if (s.status !== 'answer'){ await vc('next'); continue; }
      if (!seen.has(s.cur.dir)){
        seen.add(s.cur.dir);
        const r = await expect(`L${n} quiz (${s.cur.dir} → ?)`, s.cur.dir === 'it' ? ['.vc-pit', '.vc-opt', '.vc-opt span', '.vc-ask'] : ['.vc-pen', '.vc-opt', '.vc-opt.it span', '.vc-ask'],
          s.cur.dir === 'it' ? ['.vc-opt'] : ['.vc-pen', '.vc-opt.it span']);
        t.check(`Lesson ${n}: the quiz (${s.cur.dir === 'it' ? 'Italian → English' : 'English → Italian'}) is on screen`, !r.missing.length);
        if (n === 11 && s.cur.dir === 'en') await shot('07-quiz-english-to-italian');
        if (n === 11 && s.cur.dir === 'it') await shot('08-quiz-italian-to-english');
      }
      await p.click(`[data-vq="${s.cur.answer}"]`); await p.waitForTimeout(60);
    }
    await expect(`L${n} the word check passed`, ['.vc-pill b', '.vc-status']);
    await p.click('.tabs [data-tab=practice]'); await p.waitForTimeout(400);
    const pr = await expect(`L${n} practice`, ['.ex-q', '.opt', '.tile'], ['.ex-q']);
    t.check(`Lesson ${n}: the practice question is on screen`, !pr.missing.length);
    await p.click('.tabs [data-tab=lesson]'); await p.waitForTimeout(300);
    await expect(`L${n} Vocabolario`, ['.vit', '.ven']);
  }

  /* ---------- Studio (from Lesson 15: Lessons 1–14 completed) ---------- */
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  await t.jump(15); await p.waitForTimeout(600);
  await p.keyboard.press('Escape'); await p.keyboard.press('t'); await p.waitForTimeout(400);
  const sl = await expect('Studio list', ['.st-t b', '.st-n', '.st-go p b']);
  t.check('Studio: the lessons are listed', !sl.missing.includes('.st-t b'));
  await p.click('[data-st=start]'); await p.waitForTimeout(400);
  await expect('Studio card', ['.vc-front .vc-it', '.vc-front .vc-en', '.vc-back .vc-en', '.vc-back .vc-it'], ['.vc-front .vc-it']);
  await vc('skip'); await p.waitForTimeout(300);
  const kinds = new Set(); let g = 0;
  const st = () => p.evaluate(() => __dbg().study.session);
  while ((await st()).phase === 'quiz' && g++ < 80 && kinds.size < 3){
    const s = await st();
    if (s.status !== 'answer'){ await vc('next'); continue; }
    if (!kinds.has(s.cur.dir)){
      kinds.add(s.cur.dir);
      await expect(`Studio quiz (${s.cur.dir})`, ['.vc-pit', '.vc-pen', '.vc-opt', '.vc-opt.it span', '.vc-type input', '.vc-ask']);
      if (s.cur.dir === 'type') await shot('09-studio-typed');
    }
    if (s.cur.dir === 'type'){ await p.fill('.vc-type input', s.cur.it); await p.press('.vc-type input', 'Enter'); }
    else await p.click(`[data-vq="${s.cur.answer}"]`);
    await p.waitForTimeout(80);
  }
  t.check('Studio: the three kinds of quiz item were checked', kinds.size === 3 || console.log('   kinds', [...kinds]));

  /* Verbi */
  await p.keyboard.press('Escape'); await p.waitForTimeout(200); await p.keyboard.press('t'); await p.waitForTimeout(400);
  await p.click('[data-st-tab=verbs]'); await p.waitForTimeout(300);
  await expect('Verbi list', ['.gr-inf', '.gr-forms', '.gr-en']);
  await p.click('[data-gr=start]'); await p.waitForTimeout(400);
  const gv = await expect('Verbi drill', ['.gr-stage .gr-verbline b', '.gr-stage .gr-verbline', '.vc-pen', '.gr-clue', '.gr-ex', '.vc-type input', '.gr-who'], ['.vc-pen']);
  t.check('Verbi: the prompt is on screen', !gv.missing.length);
  await shot('10-verbi-drill');

  /* Vedo, vedo */
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
  await p.click('[data-gr=back]'); await p.waitForTimeout(300);
  await p.click('[data-st-tab=ispy]'); await p.waitForTimeout(300);
  await expect('Vedo, vedo (Studio)', ['.isp-st-txt h3', '.isp-big', '.isp-st-chk']);
  await p.click('[data-isp-st=play]'); await p.waitForTimeout(1500);
  await expect('Vedo, vedo (a round)', ['.isp-bruno .it', '.isp-fb', '.tile', '.isp-preview']);

  t.check('one readable font: every answer, card, prompt and input in the sans, upright, weight ≥ 400 (' + bad.slice(0, 12).join('; ') + ')', !bad.length);
}, { fakeSpeech:true });
