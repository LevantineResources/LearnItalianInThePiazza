/* The coverage guarantee for the Vocabolario (ui/vocab.js): no lesson may make the player use a word it never taught.
   For every lesson from 7 on (and the example lesson, built in as '99-example'), window.__vocabAudit() lists each word of
   the lesson's tiles (hook `vocab` + `bankTiles`) and of its typed scripts' model answers that is taught neither by its own
   Vocabolario nor by an earlier lesson (Lessons 1–6 word lists and tiles, set phrases, earlier Vocabolari, numbers 0–20
   once a numbers group has taught them, names, a short list of function words). A hooked lesson without a Vocabolario
   fails too. window.__vocabLint() checks the lists: unique Italian / English per lesson (they are quiz answers), and a
   gender (g) for every noun with an article. To fix a failure, add the word to that lesson's `vocab` in its content.js.
   The cap: a lesson's Vocabolario has at most 50 terms (numbers groups not counted): essentials only, the words the player
   must say or understand to answer; everything else gets an English gloss where it is met (CLAUDE.md). */
const path = require('path');
const { build } = require('../scripts/build.js');
const { play } = require('./lib/harness');
const out = path.resolve(__dirname, '../dist/vocab-test.html');
build({ out, extraLessons: [{ name: '99-example', dir: path.resolve(__dirname, '../docs/example-lesson') }] });

play(async t => {
  const p = t.page;
  const r = await p.evaluate(() => ({ audit:__vocabAudit(), lint:__vocabLint(), size:Object.fromEntries(Object.keys(__vocabAudit()).filter(k => /^\d+$/.test(k)).map(k => [k, __studyList(+k).length])) }));
  const lessons = Object.keys(r.audit).filter(k => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
  const quests = Object.keys(r.audit).filter(k => k.startsWith('q:'));
  console.log('   lessons audited:', lessons.join(', '));
  t.check('Lessons 7 and 8 and the example are audited', [7, 8].every(n => lessons.includes(n)) && lessons.length >= 3);
  for (const n of lessons){
    const miss = r.audit[n], lint = r.lint[n] || [];
    console.log(`   Lezione ${n}: missing ${miss.length ? miss.join(', ') : 'none'}; list problems ${lint.length ? lint.join(' | ') : 'none'}`);
    t.check(`Lezione ${n} vocabulary coverage`, miss.length === 0);
    t.check(`Lezione ${n} Vocabolario list is well-formed`, lint.length === 0);
    console.log(`   Lezione ${n}: ${r.size[n]} Vocabolario terms`);
    t.check(`Lezione ${n} Vocabolario within the cap of 50 terms`, r.size[n] <= 50);
  }
  /* the quests (Lesson 12 on): their tiles against their scheda's Vocabolario and every lesson's */
  console.log('   quests audited:', quests.join(', '));
  t.check('the quests are audited (Il messaggio, Il caffè è finito!)', quests.includes('q:messaggio') && quests.includes('q:caffe'));
  for (const k of quests){
    const miss = r.audit[k], lint = r.lint[k] || [];
    console.log(`   ${k}: missing ${miss.length ? miss.join(', ') : 'none'}; list problems ${lint.length ? lint.join(' | ') : 'none'}`);
    t.check(`${k} vocabulary coverage`, miss.length === 0);
    t.check(`${k} scheda list is well-formed`, lint.length === 0);
  }
}, { file: out });
