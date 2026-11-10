/* Studio (ui/study.js): study a completed lesson's words on their own, with no effect on progress.
   From the Lesson 8 skip (Lessons 1–7 completed): the Studio screen (T key), Lesson 2 (built from its data) with a
   deliberate miss that comes back, the weak words, the handbook's Studia button on Lesson 7, typed items (enabled for
   Lesson 7 with __debug.studyTypeFrom), the typed-answer checker, a tile-bank miss counted in the record, and screenshots
   at 1280 × 800 and 390 × 844. */
const { play } = require('./lib/harness');

play(async t => {
  const p = t.page;
  const st = () => p.evaluate(() => __dbg().study);
  const shot = async name => { await p.waitForTimeout(450); await t.shot(name); };

  /* before any lesson is finished: no Studio */
  await t.newGame();
  let d = await st();
  t.check('Studio is locked in Lesson 1', !d.unlocked && await p.isHidden('#btnStudy'));
  await p.evaluate(() => __debug.set({ tut:'done' }));
  t.check('finishing Lesson 1 unlocks Studio', (await st()).completed.join() === '1' && await p.isVisible('#btnStudy'));

  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  await t.jump(8);
  const before = await p.evaluate(() => ({ lesson:__dbg().lesson, tut:__dbg().tut, dict:document.querySelector('#dictCount').textContent }));
  d = await st();
  console.log('   completed:', d.completed.join(', '), '·', d.lessons.map(l => `L${l.n} ${l.words}`).join(', '));
  t.check('Lessons 1–7 are completed in Lesson 8, Lesson 8 is not', d.completed.join() === '1,2,3,4,5,6,7');
  t.check('every lesson has a study list', d.lessons.every(l => l.words >= 8));
  const lint = await p.evaluate(() => __studyLint());
  t.check('study lists have unique Italian and English', Object.values(lint).every(x => !x.length));
  const l2 = await p.evaluate(() => __studyList(2)), l4 = await p.evaluate(() => __studyList(4));
  t.check('Lesson 2 list: nouns with their article and gender', l2.some(w => w.it === 'un caffè' && w.g === 'm') && l2.some(w => w.it === 'una spremuta' && w.g === 'f'));
  t.check('Lesson 4 list: the menu, and no word Lesson 2 already has', l4.some(w => w.it === 'gli spaghetti al pomodoro' && w.g === 'm pl') && !l4.some(w => w.key === 'vorrei'));
  t.check('Lesson 1 list: set phrases with the player name', (await p.evaluate(() => __studyList(1))).some(w => w.it === 'Mi chiamo Sam'));

  /* ---- the Studio screen (T) ---- */
  await p.keyboard.press('t'); await p.waitForTimeout(300);
  d = await st();
  t.check('T opens Studio', d.open && d.view === 'list');
  t.check('Studio lists the completed lessons with word counts', await p.$$eval('.st-lesson', b => b.length) === 7 && (await p.textContent('.st-lesson[data-st-pick="2"] .st-c')).includes('21'));   // (16 + the little words: E Lei?, poi, ma, quindi, Ancora una volta)
  await shot('study-1-list');

  /* ---- Lesson 2: flashcards (both sides), then the quiz with a deliberate miss ---- */
  await p.click('.st-lesson[data-st-pick="7"]');                       // (the latest lesson starts selected)
  await p.click('.st-lesson[data-st-pick="2"]');
  t.check('one lesson selected', (await st()).sel.join() === '2');
  await p.click('[data-st=start]'); await p.waitForTimeout(300);
  d = await st();
  t.check('Lesson 2 session: its 21 words, flashcards first, Italian first', d.session && d.session.total === 21 && d.session.phase === 'cards' && d.session.first === 'it');
  t.check('the first card shows the Italian and speaks it', await p.isVisible('.vc-front .vc-it') && (await p.evaluate(() => (window.__spoken || []).slice(-1)[0][1])).length > 0);
  await shot('study-2-card');
  await p.click('[data-vc="first-en"]'); await p.waitForTimeout(200);
  t.check('English first: the front is English', (await st()).session.first === 'en' && await p.isVisible('.vc-front.en-first .vc-en'));
  await p.click('[data-vc=next]'); await p.waitForTimeout(650);
  t.check('turned over: the Italian with its gender badge, spoken', (await st()).session.flipped && await p.isVisible('.vc-back.it-back .vc-it'));
  await shot('study-3-card-en-first');
  await p.click('[data-vc="first-it"]');
  const cards = await p.evaluate(() => { let g = 0; while (__dbg().study.session.phase === 'cards' && g++ < 100) document.querySelector('[data-vc=next]').click(); return __dbg().study.session; });
  t.check('all the cards, then the quiz', cards.phase === 'quiz');

  /* answer everything; miss the first item on purpose; screenshot the miss */
  const first = await st();
  const wrongKey = first.session.cur.key, wrongId = first.session.cur.id;
  await p.click(`[data-vq="${(first.session.cur.answer + 1) % first.session.cur.opts.length}"]`); await p.waitForTimeout(250);
  d = await st();
  t.check('a miss: wrong, and it comes back', d.session.status === 'wrong' && d.session.missed.includes(wrongId) && await p.isVisible('.vc-comeback'));
  await shot('study-4-quiz-miss');
  const q = await p.evaluate(wrongId => {
    const s = () => __dbg().study.session, click = sel => { const b = document.querySelector(sel); if (b) b.click(); };
    let g = 0, cameBack = false, dirs = {};
    while (s().phase === 'quiz' && g++ < 200){
      const x = s();
      if (x.status !== 'answer'){ click('[data-vc=next]'); continue; }
      dirs[x.cur.dir] = (dirs[x.cur.dir] || 0) + 1;
      if (x.cur.id === wrongId && x.cur.again) cameBack = true;
      click(`[data-vq="${x.cur.answer}"]`);
    }
    return { cameBack, dirs, phase:s().phase, right:s().right, total:s().total };
  }, wrongId);
  console.log('   quiz:', JSON.stringify(q));
  t.check('the missed word came back and the quiz finished', q.cameBack && q.phase === 'done' && q.right === q.total);
  t.check('both multiple-choice directions were asked', q.dirs.it > 0 && q.dirs.en > 0 && !q.dirs.type);
  await shot('study-5-done');
  d = await st();
  const rec = d.record[wrongKey];
  console.log('   record for', wrongKey, JSON.stringify(rec));
  t.check('the record counts the miss and the right answer', rec && rec.wrong === 1 && rec.right === 1);
  t.check('the missed word is a weak word', d.weak.includes(wrongKey));
  t.check('the done screen shows the missed word', (await p.textContent('.vc-pills')).length > 0);

  /* ---- My weak words ---- */
  await p.click('[data-st=back]'); await p.waitForTimeout(250);
  t.check('back in Studio: the weak words card lists it', !(await p.$('.st-weak.empty')) && (await p.textContent('.st-weaklist')).length > 0);
  await shot('study-6-weak');
  await p.click('[data-st=weak]'); await p.waitForTimeout(250);
  d = await st();
  t.check('My weak words: a session of the weak words', d.session && d.session.weak && d.session.words.includes(wrongKey) && d.session.total === d.weak.length);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);

  /* ---- the handbook: Studia on completed chapters only ---- */
  await p.keyboard.press('h'); await p.waitForTimeout(300);
  t.check('Lesson 8 (not completed) has no Studia button', !(await p.$('.tab-study')));
  await p.click('[data-ch="7"]'); await p.waitForTimeout(200);
  t.check('Lesson 7 (completed) has a Studia button', await p.isVisible('.tab-study') && (await p.textContent('.tab-study')).includes('16'));
  await shot('study-7-handbook-studia');

  /* ---- Lesson 7 from the handbook, with typed items (Lesson 9+ style, enabled for 7 by the test flag) ---- */
  await p.evaluate(() => __debug.studyTypeFrom(7));
  await p.click('.tab-study'); await p.waitForTimeout(300);
  d = await st();
  t.check('Studia opens Lesson 7 in Studio', d.open && d.session && d.session.lessons.join() === '7' && d.session.total === 16);
  t.check('the back button returns to the handbook', (await p.textContent('.st-back')).includes('Handbook'));
  await p.click('[data-vc=skip]'); await p.waitForTimeout(200);
  t.check('Skip to the quiz', (await st()).session.phase === 'quiz');
  /* a typed item: wait for one, type it without accents / punctuation, screenshot */
  const tq = await p.evaluate(() => {
    const s = () => __dbg().study.session, click = sel => { const b = document.querySelector(sel); if (b) b.click(); };
    let g = 0;
    while (s().phase === 'quiz' && g++ < 60){
      const x = s();
      if (x.status !== 'answer'){ click('[data-vc=next]'); continue; }
      if (x.cur.dir === 'type') return x.cur;
      click(`[data-vq="${x.cur.answer}"]`);
    }
    return null;
  });
  t.check('a typed item came up', !!tq);
  if (tq){
    await p.waitForTimeout(100);
    t.check('the typing box has focus', await p.evaluate(() => document.activeElement && document.activeElement.id === 'vcType'));
    await p.fill('#vcType', 'qwerty'); await p.press('#vcType', 'Enter'); await p.waitForTimeout(250);
    d = await st();
    t.check('a wrong typed answer: shown wrong, comes back', d.session.status === 'wrong' && d.session.missed.includes(tq.id));
    await shot('study-8-typed-wrong');
    await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  }
  const typed = await p.evaluate(() => {
    const s = () => __dbg().study.session, click = sel => { const b = document.querySelector(sel); if (b) b.click(); };
    /* no accents or punctuation, and a typo inside the longest word (not its ending) */
    const bare = it => { const w = it.split(' / ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[?.!,]/g, '').toLowerCase().split(' ');
      const k = w.reduce((a, x, i) => x.length > w[a].length ? i : a, 0); if (w[k].length >= 5) w[k] = w[k].slice(0, 2) + w[k].slice(3); return w.join(' '); };
    let g = 0, types = 0, fixed = 0, cameBack = false, shotAt = null;
    while (s().phase === 'quiz' && g++ < 200){
      const x = s();
      if (x.status !== 'answer'){ click('[data-vc=next]'); continue; }
      if (x.cur.dir === 'type'){
        types++; if (x.cur.again) cameBack = true;
        document.querySelector('#vcType').value = bare(x.cur.it); click('[data-vc=check]');
        const y = s(); if (y.status !== 'right') return { bad:x.cur.it, status:y.status };
        if (y.cur.fixed){ fixed++; if (!shotAt) { shotAt = x.cur.it; return { pause:true, types, fixed, cameBack, shotAt }; } }
        continue;
      }
      click(`[data-vq="${x.cur.answer}"]`);
    }
    return { types, fixed, cameBack, phase:s().phase };
  });
  console.log('   typed:', JSON.stringify(typed));
  if (typed.pause){
    await shot('study-9-typed-fixed');
    t.check('an accent-free answer is right, with the correction shown', await p.isVisible('.vc-fix'));
    const rest = await p.evaluate(() => {
      const s = () => __dbg().study.session, click = sel => { const b = document.querySelector(sel); if (b) b.click(); };
      /* no accents or punctuation, and a typo inside the longest word (not its ending) */
      const bare = it => { const w = it.split(' / ')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[?.!,]/g, '').toLowerCase().split(' ');
        const k = w.reduce((a, x, i) => x.length > w[a].length ? i : a, 0); if (w[k].length >= 5) w[k] = w[k].slice(0, 2) + w[k].slice(3); return w.join(' '); };
      let g = 0, types = 0, cameBack = false;
      while (s().phase === 'quiz' && g++ < 200){
        const x = s();
        if (x.status !== 'answer'){ click('[data-vc=next]'); continue; }
        if (x.cur.dir === 'type'){ types++; if (x.cur.again) cameBack = true; document.querySelector('#vcType').value = bare(x.cur.it); click('[data-vc=check]'); if (s().status !== 'right') return { bad:x.cur.it }; continue; }
        click(`[data-vq="${x.cur.answer}"]`);
      }
      return { types, cameBack, phase:s().phase };
    });
    console.log('   rest:', JSON.stringify(rest));
    typed.phase = rest.phase; typed.cameBack = typed.cameBack || rest.cameBack; typed.types += rest.types || 0; if (rest.bad) typed.bad = rest.bad;
  }
  t.check('typed items accept answers without accents, with a small typo', !typed.bad);
  t.check('the missed typed word came back typed, and the quiz finished', typed.cameBack && typed.phase === 'done');
  /* the checker itself */
  const m = await p.evaluate(() => [
    ['la maglieta', 'la maglietta'], ['La Maglietta!', 'la maglietta'], ['il maglietta', 'la maglietta'], ['puo ripetere', 'Può ripetere?'],
    ['questo', 'questa'], ['rossa', 'rosso / rossa'], ['rosse', 'rosso / rossa'], ['perche', 'perché'], ['quanto costa', 'Quanto costa?'], ['quanto cosa', 'Quanto costa?'],
  ].map(([raw, it]) => [raw, it, __debug.typedMatch(raw, it)]));
  m.forEach(([raw, it, r]) => console.log(`   "${raw}" for "${it}": ${r.ok ? 'right' : 'wrong'}${r.fixed ? ', corrected' : ''}`));
  const want = [[true, true], [true, false], [false], [true, true], [false], [true, false], [false], [true, true], [true, false], [true, true]];
  t.check('the typed-answer checker forgives accents and small typos, not endings or articles', m.every(([, , r], k) => r.ok === want[k][0] && (!r.ok || r.fixed === want[k][1])));
  await p.click('[data-st=handbook]'); await p.waitForTimeout(250);
  t.check('back to the handbook at Lesson 7', await p.evaluate(() => __dbg().words.n === 7 && document.querySelector('.sheet.book') !== null));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);

  /* ---- a tile-bank turn that goes wrong counts the word as wrong ---- */
  await p.evaluate(() => __debug.travel('piazza')); await p.waitForTimeout(2500);
  await t.talkTo(845, 144);
  await t.say(['Buongiorno']);
  await t.say(['una', 'caffè']);
  await t.say(['Questa è', 'Mark']);
  d = await st();
  console.log('   record:', JSON.stringify(d.record));
  t.check('a wrong article in a conversation counts against "un caffè"', d.record['un caffè'] && d.record['un caffè'].wrong >= 1 && d.weak.includes('un caffè'));
  t.check('"questa è" for Mark counts against "questa è"', d.record['questa è'] && d.record['questa è'].wrong === 1);
  await t.leave();

  /* ---- no effect on progress ---- */
  const after = await p.evaluate(() => ({ lesson:__dbg().lesson, tut:__dbg().tut, dict:document.querySelector('#dictCount').textContent }));
  t.check('progress is unchanged', after.lesson === before.lesson && after.tut === before.tut && after.dict === before.dict);
  t.check('the record is saved', await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('piazza-lezione-1')); return !!(s.study && s.study['un caffè']); }));

  /* ---- phone size ---- */
  await p.setViewportSize({ width:390, height:844 }); await p.waitForTimeout(300);
  await shot('study-m0-header');
  await p.click('#btnStudy'); await p.waitForTimeout(300);
  await shot('study-m1-list');
  await p.click('[data-st=weak]'); await p.waitForTimeout(300);
  await shot('study-m2-card');
  await p.click('[data-vc=next]'); await p.waitForTimeout(650);
  await shot('study-m3-card-back');
  await p.click('[data-vc=skip]'); await p.waitForTimeout(300);
  await shot('study-m4-quiz');
  await p.click('[data-st=back]'); await p.waitForTimeout(200);
  for (const n of [2, 7]) if ((await st()).sel.includes(n) !== (n === 7)) await p.click(`.st-lesson[data-st-pick="${n}"]`);
  await p.click('[data-st=start]'); await p.waitForTimeout(200);
  await p.click('[data-vc=skip]');
  const got = await p.evaluate(() => {
    const s = () => __dbg().study.session, click = sel => { const b = document.querySelector(sel); if (b) b.click(); };
    let g = 0;
    while (s().phase === 'quiz' && g++ < 60){ const x = s(); if (x.status !== 'answer'){ click('[data-vc=next]'); continue; } if (x.cur.dir === 'type') return true; click(`[data-vq="${x.cur.answer}"]`); }
    return false;
  });
  if (got){ await p.fill('#vcType', 'la magliet'); await shot('study-m5-typed'); }
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  await p.keyboard.press('h'); await p.waitForTimeout(200); await p.click('[data-ch="7"]'); await p.waitForTimeout(200);
  await shot('study-m6-handbook');
}, { fakeSpeech:true });
