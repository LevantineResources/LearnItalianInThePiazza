/* The grammar drill (ui/grammar.js): Studio's "Verbi" tab. Built with docs/example-lesson after the real lessons, so a
   later chapter's `verbs` field is merged in too.
   Locked until Lesson 4 is completed; unlocked after the skip to Lesson 5 with the verbs of Lessons 1–4 only; a round with
   right answers, a deliberate wrong one (another form of the verb) that comes back, an accent-less answer accepted and
   corrected (può), a subject pronoun accepted, the results screen, the conjugation table (a form of a later lesson
   locked), the record, the handbook's "Drill the verbs" button, screenshots at 1280 × 800 and 390 × 844. */
const path = require('path');
const { build } = require('../scripts/build.js');
const { play } = require('./lib/harness');
const out = path.resolve(__dirname, '../dist/grammar-test.html');
build({ out, extraLessons: [{ name: '99-example', dir: path.resolve(__dirname, '../docs/example-lesson') }] });

play(async t => {
  const p = t.page;
  const gr = () => p.evaluate(() => __dbg().grammar);
  const shot = async name => { await p.waitForTimeout(400); await t.shot(name); };

  /* ---- the data ---- */
  await t.newGame();
  const lint = await p.evaluate(() => __grammarLint());
  console.log('   lint:', lint.length ? lint.join(' | ') : 'none');
  t.check('the verb list is well-formed (persons named in the English, no duplicates)', lint.length === 0);
  const all = await p.evaluate(() => __grammarVerbs());
  all.forEach(v => console.log(`   ${v.inf} (${v.en}${v.irr ? ', irregular' : ''}): ` + v.forms.map(f => `${f.it} [${f.p}, L${f.lesson}${f.mood !== 'present' ? ', ' + f.mood : ''}]`).join(' · ')));
  const ess = all.find(v => v.inf === 'essere');
  t.check('a later chapter\'s verbs are merged in (the example lesson adds loro sono to essere)', ess.forms.some(f => f.p === 'loro' && f.it === 'sono' && f.lesson >= 10));
  t.check('irregulars are marked', ['essere', 'avere', 'potere', 'volere'].every(i => all.find(v => v.inf === i).irr) && !all.find(v => v.inf === 'mangiare').irr);

  /* ---- locked before Lesson 4 is done ---- */
  await p.evaluate(() => __debug.set({ tut:'done' }));                  // Lesson 1 done: Studio opens, the drill does not
  await p.keyboard.press('t'); await p.waitForTimeout(300);
  await p.click('[data-st-tab="verbs"]'); await p.waitForTimeout(200);
  let d = await gr();
  t.check('locked in Lesson 1: the Verbi tab shows "Unlocks after Lezione 4"', d.open && !d.unlocked && d.verbs.length === 0 && (await p.textContent('.gr-lock h3')).includes('Unlocks after Lezione 4'));
  t.check('the tab is marked locked', (await p.textContent('[data-st-tab="verbs"]')).includes('🔒'));
  await shot('grammar-1-locked');
  await p.click('[data-st-tab="words"]'); await p.waitForTimeout(150);
  t.check('back on the words tab', await p.isVisible('.st-lessons'));
  await p.keyboard.press('Escape');
  await p.evaluate(() => __debug.set({ lesson:4, tut:'l4-order' }));
  t.check('still locked during Lesson 4', !(await gr()).unlocked);

  /* ---- unlocked after Lesson 4 (the skip to Lesson 5) ---- */
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  await t.jump(5);
  d = await gr();
  console.log('   open verbs:', d.verbs.map(v => `${v.inf} ${v.forms}/${v.total}`).join(', '));
  t.check('unlocked in Lesson 5', d.unlocked);
  t.check('only Lessons 1–4 verbs: avere without hai, no cercare or piacere', d.verbs.some(v => v.inf === 'avere' && v.forms === 4 && v.total === 5) && !d.verbs.some(v => ['cercare', 'piacere', 'parlare'].includes(v.inf)));
  t.check('every open verb is selected by default', d.sel.length === d.verbs.length);
  await p.keyboard.press('t'); await p.waitForTimeout(300);
  await p.click('[data-st-tab="verbs"]'); await p.waitForTimeout(200);
  t.check('the Verbi tab lists the verbs grouped by lesson', await p.$$eval('.gr-verb', b => b.length) === d.verbs.length && await p.$$eval('.gr-group', g => g.length) === 4);
  await shot('grammar-2-list');
  /* pick by lesson: switch Lesson 3's verbs off, then all on again */
  await p.click('[data-gr-group="3"]'); await p.waitForTimeout(100);
  d = await gr();
  t.check('a lesson group can be switched off', !d.sel.includes('andare') && d.sel.includes('avere'));
  await p.click('[data-gr="all"]'); await p.waitForTimeout(100);
  t.check('select all', (await gr()).sel.length === d.verbs.length);
  await p.click('[data-gr-round="12"]');

  /* ---- a round ---- */
  await p.click('[data-gr="start"]'); await p.waitForTimeout(300);
  d = await gr();
  t.check('a round of 12 typed prompts', d.view === 'drill' && d.session.total === 12 && d.session.cur && await p.isVisible('#grType'));
  t.check('the typing box has focus', await p.evaluate(() => document.activeElement && document.activeElement.id === 'grType'));
  console.log('   first prompt:', JSON.stringify(d.session.cur));
  await shot('grammar-3-prompt');
  /* a deliberate wrong answer: another form of the same verb if there is one */
  const cur = d.session.cur, v = all.find(x => x.inf === cur.inf);
  const other = v.forms.find(f => f.lesson <= 4 && f.it !== cur.it);
  await p.fill('#grType', other ? other.it : 'sbagliato'); await p.press('#grType', 'Enter'); await p.waitForTimeout(250);
  d = await gr();
  t.check('a wrong answer: shown wrong, it comes back', d.session.status === 'wrong' && d.session.missed.includes(cur.id) && await p.isVisible('.vc-comeback'));
  if (other) t.check('the feedback says which form was typed instead', d.session.cur.other !== null && (await p.textContent('.vc-fb')).includes(other.en));
  t.check('the right form is shown', (await p.textContent('.gr-stage .vc-pit')).trim() === cur.it);
  await shot('grammar-4-wrong');
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  t.check('Enter moves on', (await gr()).session.status === 'answer');
  const r = await p.evaluate(wrongId => {
    const s = () => __dbg().grammar.session, click = sel => { const b = document.querySelector(sel); if (b) b.click(); };
    let g = 0, cameBack = false, n = 0;
    while (s() && s().phase === 'drill' && g++ < 100){
      const x = s();
      if (x.status !== 'answer'){ click('[data-gr="next"]'); continue; }
      if (x.cur.id === wrongId && x.cur.again) cameBack = true;
      document.querySelector('#grType').value = x.cur.it; click('[data-gr="check"]'); n++;
      if (s().status !== 'right') return { bad:x.cur };
    }
    return { cameBack, n, phase:s().phase, right:s().right, total:s().total };
  }, cur.id);
  console.log('   round:', JSON.stringify(r));
  t.check('the missed prompt came back, and every prompt was right in the end', !r.bad && r.cameBack && r.phase === 'done' && r.right === r.total);
  t.check('the results screen: right first time, the missed form', (await p.textContent('.vc-status')).includes('11 / 12') && (await p.textContent('.vc-pills')).includes(cur.it));
  await shot('grammar-5-done');
  d = await gr();
  t.check('the record counts the miss and the right answer', d.record.rec[cur.key] && d.record.rec[cur.key].wrong === 1 && d.record.rec[cur.key].right === 1 && d.record.rounds === 1);

  /* ---- the table ---- */
  await p.click('[data-gr="back"]'); await p.waitForTimeout(200);
  await p.click('[data-gr-table="avere"]'); await p.waitForTimeout(250);
  d = await gr();
  t.check('the table view of avere', d.view === 'table' && d.table === 'avere' && await p.$$eval('.gr-table tr', r => r.length) === 5);
  t.check('a form of a later lesson is locked (hai, Lezione 6)', (await p.textContent('.gr-form.locked')).includes('Lezione 6'));
  t.check('the open forms are listed with their lesson', (await p.$$eval('.gr-form:not(.locked) .gr-fit b', b => b.map(x => x.textContent))).join() === 'ho,ha,ha,avete');
  await shot('grammar-6-table');

  /* ---- an accent-less answer, accepted and corrected: drill potere from its table ---- */
  await p.click('[data-gr="back"]'); await p.waitForTimeout(150);
  await p.click('[data-gr-table="potere"]'); await p.waitForTimeout(200);
  await p.click('[data-gr="drill-one"]'); await p.waitForTimeout(250);
  d = await gr();
  t.check('a round of potere only (its 5 forms)', d.session.total === 5 && d.session.cur.inf === 'potere');
  const acc = await p.evaluate(() => {
    const s = () => __dbg().grammar.session, click = sel => { const b = document.querySelector(sel); if (b) b.click(); };
    let g = 0;
    while (s().phase === 'drill' && g++ < 20){
      const x = s();
      if (x.status !== 'answer'){ click('[data-gr="next"]'); continue; }
      if (x.cur.it === 'può'){ document.querySelector('#grType').value = 'puo'; click('[data-gr="check"]'); return s(); }
      /* "io posso" (a subject pronoun in front), if it comes first */
      if (x.cur.p === 'io'){ document.querySelector('#grType').value = 'io ' + x.cur.it; click('[data-gr="check"]'); window.__pr = s(); window.__prNote = !!document.querySelector('.gr-pron'); continue; }
      document.querySelector('#grType').value = x.cur.it; click('[data-gr="check"]');
    }
    return null;
  });
  t.check('"puo" for può: right, with the correction shown', acc && acc.status === 'right' && acc.cur.fixed && (await p.textContent('.vc-fix')).includes('puo → può'));
  await shot('grammar-7-accent-fixed');
  t.check('a fixed answer waits for Next', (await gr()).session.status === 'right');
  await p.click('[data-gr="next"]'); await p.waitForTimeout(150);
  /* a subject pronoun in front: accepted, and the note says Italians leave it out */
  const pr = await p.evaluate(() => {
    const s = () => __dbg().grammar.session, click = sel => { const b = document.querySelector(sel); if (b) b.click(); };
    let g = 0;
    while (!window.__pr && s().phase === 'drill' && g++ < 20){
      const x = s();
      if (x.status !== 'answer'){ click('[data-gr="next"]'); continue; }
      if (x.cur.p === 'io'){ document.querySelector('#grType').value = 'io ' + x.cur.it; click('[data-gr="check"]'); window.__pr = s(); window.__prNote = !!document.querySelector('.gr-pron'); break; }
      document.querySelector('#grType').value = x.cur.it; click('[data-gr="check"]');
    }
    return { s:window.__pr, note:window.__prNote };
  });
  console.log('   pronoun:', JSON.stringify(pr.s && pr.s.cur));
  t.check('"io posso" is accepted, with a note on the pronoun', pr.s && pr.s.status === 'right' && pr.s.cur.pron && pr.s.cur.it === 'posso' && pr.note);
  const m = await p.evaluate(() => [['Lui vorrebbe', 'vorrebbe', 'lui'], ['e', 'è', 'lui'], ['vorrei', 'vorrebbe', 'lui'], ['mangi', 'mangia', 'lui'], ['le piace', 'Le piace', 'Lei'],
    ['Mi chiamo', 'mi chiamo', 'io'], ['gira', 'giri', 'Lei'], ['tu vai', 'vai', 'tu']].map(([raw, it, pp]) => [raw, it, __debug.grammarMatch(raw, it, pp, raw === 'tu vai' ? 'imperative' : 'present')]));
  m.forEach(([raw, it, x]) => console.log(`   "${raw}" for "${it}": ${x.ok ? 'right' : 'wrong'}${x.fixed ? ', corrected' : ''}${x.pron ? ', pronoun' : ''}`));
  t.check('the checker forgives accents and case, never a wrong ending', m.map(([, , x]) => x.ok).join() === 'true,true,false,false,true,true,false,false');

  /* ---- the weak form comes first next time; the handbook's button ---- */
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  await p.keyboard.press('h'); await p.waitForTimeout(250);
  await p.click('[data-ch="4"]'); await p.waitForTimeout(200);
  t.check('Lesson 4\'s verb table has a "Drill the verbs" button', await p.isVisible('[data-gr-open]'));
  await p.click('[data-gr-open]'); await p.waitForTimeout(250);
  d = await gr();
  t.check('it opens Studio on the Verbi tab', d.open && d.view === 'list');
  t.check('the list notes the missed form', await p.isVisible('.gr-weaknote'));
  t.check('progress is unchanged', await p.evaluate(() => __dbg().lesson === 5));
  console.log('   saved:', await p.evaluate(() => JSON.stringify({ ...JSON.parse(localStorage.getItem('piazza-lezione-1')).grammar, rec:0 })));
  t.check('the record is saved', await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('piazza-lezione-1')); return !!(s.grammar && s.grammar.rounds >= 1 && s.grammar.rec); }));

  /* ---- Lesson 9 skip: Lessons 1–8 open, piacere and cercare join ---- */
  await p.keyboard.press('Escape');
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  await t.jump(9);
  d = await gr();
  t.check('in Lesson 9 the verbs of Lessons 1–8 are open', ['cercare', 'piacere', 'mancare', 'sapere'].every(i => d.verbs.some(v => v.inf === i)) && d.verbs.find(v => v.inf === 'prendere').forms === 7);

  /* ---- phone size ---- */
  await p.setViewportSize({ width:390, height:844 }); await p.waitForTimeout(300);
  await p.click('#btnStudy'); await p.waitForTimeout(300);
  await p.click('[data-st-tab="verbs"]'); await p.waitForTimeout(200);
  await shot('grammar-m1-list');
  await p.click('[data-gr="start"]'); await p.waitForTimeout(300);
  await p.fill('#grType', 'sono');
  await shot('grammar-m2-prompt');
  await p.press('#grType', 'Enter'); await p.waitForTimeout(250);
  await shot('grammar-m3-feedback');
  await p.click('[data-gr="back"]'); await p.waitForTimeout(200);
  await p.click('[data-gr-table="prendere"]'); await p.waitForTimeout(250);
  await shot('grammar-m4-table');
  await p.setViewportSize({ width:1280, height:800 }); await p.waitForTimeout(300);
  await p.click('[data-gr="back"]'); await p.waitForTimeout(200);
  await p.click('[data-gr-table="volere"]'); await p.waitForTimeout(250);
  await shot('grammar-8-table-volere');
}, { file: out, fakeSpeech:true });
