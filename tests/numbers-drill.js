/* The numbers drill (ui/numbers.js) and listening lines (npcLine(..., { listen:true }), revealListen()).
   This builds docs/example-lesson in after the real lessons (folder '99-example', lesson EX_N), plus a small
   test-only file that adds the numbersUnlocked / onNumbersMastered hooks and makes Giulia's answer a
   listening line. Jumping to it runs Lesson 7's skip (numbers mastered, S.vocab7), so the test clears
   those first to start the drill from scratch. Speech is faked (harness fakeSpeech) so the listening rounds run at a known pace.
   Run with --viewport=390x844 (or NUMBERS_MOBILE=1) for the narrow screenshots. */
const path = require('path'), fs = require('fs'), os = require('os');
const { build } = require('../scripts/build.js');
const { play } = require('./lib/harness');

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'piazza-numbers-'));
for (const f of ['content.js', 'flow.js']) fs.copyFileSync(path.resolve(__dirname, '../docs/example-lesson', f), path.join(fixture, f));
fs.writeFileSync(path.join(fixture, 'zz-numbers-test.js'), `
LESSON_HOOKS[EX_N].numbersUnlocked = () => !!S.lex;
LESSON_HOOKS[EX_N].onNumbersMastered = () => { window.__mastered7 = (window.__mastered7 || 0) + 1; };
{ const react = LESSON_HOOKS[EX_N].react;
  LESSON_HOOKS[EX_N].react = (id, npc, st, add, out) => {
    if (id !== 'ask_time') return react(id, npc, st, add, out);
    add('Ah, sì!', 'Ah, yes!'); add('Sono le due.', "It's two o'clock.", { listen:true });
    if (S.lex) S.lex.asked = true; st.wrapping = true; return true;
  }; }
window.__test = { revealListen };
`);
const out = path.resolve(__dirname, '../dist/numbers-test.html');
build({ out, extraLessons: [{ name: '99-example', dir: fixture }] });

const NUM = ['zero','uno','due','tre','quattro','cinque','sei','sette','otto','nove','dieci','undici','dodici','tredici',
  'quattordici','quindici','sedici','diciassette','diciotto','diciannove','venti'];
const mobile = !!process.env.NUMBERS_MOBILE;
const tag = mobile ? '-mobile' : '';

play(async t => {
  const p = t.page;
  const dbg = () => p.evaluate(() => __dbg());
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(80); } console.log('   timed out waiting for ' + label); return false; };
  const sheetText = () => p.textContent('#sheet');

  t.check('Numeri button hidden before the lesson', await p.isHidden('#btnNum'));
  t.check('no numbers state yet (not in FRESH)', (await dbg()).numbers === null);
  const ex = await p.$$eval('[data-jump]', bs => +bs[bs.length - 1].dataset.jump);
  await t.jump(ex);
  /* Lesson 7's end state has the drill mastered and S.vocab7 set: clear both, to test the drill from scratch
     and the numbersUnlocked hook on its own */
  await p.evaluate(() => __debug.set({ numbers: undefined, vocab7: false })); await p.waitForTimeout(100);
  t.check('Numeri button shown by the numbersUnlocked hook', await p.isVisible('#btnNum'));
  t.check('numbers state cleared', (await dbg()).numbers === null);

  /* ---- listening line: Giulia's answer ---- */
  console.log('GIULIA (barrier)'); await t.talkTo(760, 290); await t.choose(); await t.leave();
  await p.keyboard.press('h'); await p.waitForTimeout(400);
  await t.practice([['o', 0], ['o', 1]]);
  console.log('GIULIA (listening line)'); await t.talkTo(760, 290);
  await t.say(['Che ore sono?'], 2600);
  let lines = await t.lines();
  t.check('listening line shown with a replay button', lines.some(l => l.includes('Ascolta di nuovo')));
  t.check('listening line text hidden', !lines.some(l => l.includes('Sono le due')) && lines.some(l => l.includes('Ah, sì!')));
  t.check('listening line gloss hidden', await p.$eval('.line.listen', el => !el.querySelector('[data-en]') || el.querySelector('[data-en]').hidden));
  t.check('listening line was spoken', (await p.evaluate(() => window.__spoken.map(s => s[1]))).includes('Sono le due.'));
  await t.shot('nd-listen-line' + tag);
  await p.click('.line.listen .listen-btn'); await p.waitForTimeout(200);
  const replay = await p.evaluate(() => window.__spoken[window.__spoken.length - 1]);
  console.log('   replay:', JSON.stringify(replay));
  t.check('replay speaks the line more slowly', replay[1] === 'Sono le due.' && replay[2] <= 0.7);
  await p.evaluate(() => __test.revealListen()); await p.waitForTimeout(2500);
  lines = await t.lines();
  t.check('revealListen shows the text', lines.some(l => l.includes('Sono le due')) && !lines.some(l => l.includes('Ascolta di nuovo')));
  t.check('revealListen enables the EN gloss', await p.$eval('.line.listen', el => !el.querySelector('[data-en]').hidden));
  await t.leave(); await p.waitForTimeout(600);
  if (await p.isVisible('#modal')) await p.click('.sheet [data-close]');

  /* ---- N opens the drill; keys don't leak into the world ---- */
  await p.keyboard.press('n'); await p.waitForTimeout(300);
  t.check('N opens the drill', await p.isVisible('#sheet.numbers'));
  t.check('drill starts with spelling', (await dbg()).drill.phase === 'intro');
  const me0 = (await dbg()).me;
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(300); await p.keyboard.up('ArrowUp');
  await p.keyboard.type('mhv'); await p.waitForTimeout(200);
  t.check('typing in the drill does not move the player or open other tools', JSON.stringify((await dbg()).me) === JSON.stringify(me0) && await p.isVisible('#sheet.numbers'));
  await p.fill('#ndInput', '');
  await t.shot('nd-intro' + tag);

  /* ---- spelling: 0 → 20 → 0, with one typo and one wrong word ---- */
  let sawFix = false, sawShown = false;
  for (let k = 0; k < 42; k++){
    const d = (await dbg()).drill; const n = d.spell;
    if (d.i !== k){ console.log('   spelling index mismatch', d.i, k); break; }
    if (k === 5){
      await p.fill('#ndInput', 'sei'); await p.press('#ndInput', 'Enter'); await p.waitForTimeout(150);
      const fb = await p.textContent('#ndFb'), tagw = await p.textContent('.nd-tag');
      console.log('   ✗ sei →', fb.trim());
      sawShown = fb.includes('5 is cinque') && tagw.includes('cinque') && (await dbg()).drill.i === 5;
      await t.shot('nd-intro-miss' + tag);
    }
    const word = k === 16 ? 'sedic' : NUM[n];
    await p.fill('#ndInput', word); await p.press('#ndInput', 'Enter');
    if (k === 16){
      await p.waitForTimeout(150);
      const fb = await p.textContent('#ndFb'); console.log('   ⌨ sedic →', fb.trim());
      sawFix = fb.includes('Fixed: sedic → sedici');
      await t.shot('nd-intro-fixed' + tag);
    }
  }
  t.check('a wrong word shows the answer, then typing it counts', sawShown);
  t.check('a one-letter typo is accepted and shown corrected', sawFix);
  let D = await dbg();
  t.check('spelling done → listening phase', D.numbers.introDone && D.drill.phase === 'listen');
  t.check('toast: numbers added to the dictionary', (await p.textContent('#toasts')).includes('Numbers 0–20'));
  t.check('spoken words', (await p.evaluate(() => window.__spoken.map(s => s[1]))).includes('diciannove'));
  await t.shot('nd-listen-ready' + tag);

  /* ---- listening rounds ---- */
  const startRound = async () => {
    await p.keyboard.press('Enter');
    await until(async () => (await dbg()).drill.status === 'answer', 'the round to play');
    return (await dbg()).drill.current;
  };
  let wrongDone = false, keypadDone = false, replayDone = false;
  for (let guard = 0; guard < 12; guard++){
    D = await dbg(); const n = D.drill.n;
    if (n > 5) break;
    if (n === 2 && !keypadDone){
      /* on-screen keypad */
      const cur = await startRound(); console.log(`   round ${n} (keypad): ${cur.join(' · ')}`);
      for (const x of cur){ for (const c of String(x)) await p.click(`[data-nd="d${c}"]`); await p.click('[data-nd="sep"]'); }
      await p.click('[data-nd="submit"]'); keypadDone = true;
    } else if (n === 3 && !wrongDone){
      const cur = await startRound(); console.log(`   round ${n} (wrong on purpose): ${cur.join(' · ')}`);
      const bad = cur.map(x => (x + 1) % 21);
      await p.keyboard.type(bad.join(' ')); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
      D = await dbg();
      const st = await p.textContent('#ndStage');
      t.check('wrong round reveals digits and words, n stays', D.drill.status === 'wrong' && D.drill.n === 3 && cur.every(x => st.includes(String(x)) && st.includes(NUM[x])));
      await t.shot('nd-listen-wrong' + tag);
      wrongDone = true; continue;
    } else {
      const cur = await startRound(); console.log(`   round ${n}: ${cur.join(' · ')}`);
      if (n === 4 && !replayDone){
        const before = await p.evaluate(() => window.__spoken.length);
        await p.keyboard.press('r');
        await until(async () => (await dbg()).drill.status === 'answer', 'the replay');
        const re = await p.evaluate(b => window.__spoken.slice(b), before);
        t.check('Ripeti replays the round, slower', re.length === cur.length && re.every(s => s[2] <= 0.7));
        replayDone = true;
        /* type part of it, backspace a digit, and screenshot the chips */
        await p.keyboard.type(cur.slice(0, 2).join(',') + ',9'); await p.keyboard.press('Backspace');
        await p.waitForTimeout(150);
        t.check('chips show the typed numbers', (await p.textContent('#ndAnswer')).replace(/\s/g, '') === cur.slice(0, 2).join('·') + '·');
        await t.shot('nd-listen-typing' + tag);
        await p.keyboard.type(cur.slice(2).join(' '));
      } else await p.keyboard.type(cur.join(' '));
      await p.keyboard.press('Enter');
    }
    await p.waitForTimeout(300);
    D = await dbg();
    t.check(`round of ${n} right → ${n + 1}`, D.drill.status === 'right' && D.drill.n === n + 1 && D.numbers.best === n);
    if (n === 4) await t.shot('nd-listen-right' + tag);
  }
  D = await dbg();
  t.check('5 numbers right → mastered', D.numbers.mastered && D.numbers.best === 5);
  t.check('onNumbersMastered hook called once', (await p.evaluate(() => window.__mastered7)) === 1);
  t.check('mastered toast', (await p.textContent('#toasts')).includes('mastered'));
  await t.shot('nd-mastered' + tag);
  /* the drill goes on after mastery; the hook is not called again */
  const cur6 = await startRound(); await p.keyboard.type(cur6.join(' ')); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  D = await dbg();
  t.check('drill continues after mastery', D.drill.n === 7 && D.numbers.best === 6 && (await p.evaluate(() => window.__mastered7)) === 1);

  /* ---- close, dictionary ---- */
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  t.check('Escape closes the drill', await p.isHidden('#modal'));
  await p.keyboard.press('v'); await p.waitForTimeout(300);
  const dict = await sheetText();
  t.check('dictionary has a Numeri 0–20 section', dict.includes('Numeri 0–20') && dict.includes('15 · quindici') && dict.includes('20 · venti'));
  await p.fill('#dictSearch', 'sedici'); await p.waitForTimeout(100);
  t.check('dictionary search finds a number', await p.isVisible('.dict.nums .entry:has-text("sedici")'));
  await p.fill('#dictSearch', ''); await p.evaluate(() => document.querySelector('.dict.nums').scrollIntoView());
  await t.shot('nd-dictionary' + tag);
  await p.click('.sheet [data-close]');

  /* ---- no Italian voice: the numbers are shown as words ---- */
  await p.evaluate(() => { window.__noItalianVoice = true; });
  await p.click('#btnNum'); await p.waitForTimeout(200);
  t.check('no voice: the drill says so', (await sheetText()).includes('no Italian voice'));
  const spokenBefore = await p.evaluate(() => window.__spoken.length);
  await p.keyboard.press('Enter');
  const first = (await dbg()).drill.current[0];
  t.check('no voice: the first number is shown as a word', await until(async () => (await p.textContent('.nd-word').catch(() => '')).trim() === NUM[first], 'the word'));
  await t.shot('nd-novoice' + tag);
  await until(async () => (await dbg()).drill.status === 'answer', 'the round to show', 30000);
  const curNV = (await dbg()).drill.current;
  t.check('no voice: nothing was spoken during the round', (await p.evaluate(b => window.__spoken.length - b, spokenBefore)) === 0);
  await p.keyboard.type(curNV.join(' ')); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  t.check('no voice: round still works', (await dbg()).drill.status === 'right');
  await p.evaluate(() => { window.__noItalianVoice = false; });
  await p.keyboard.press('Escape');

  /* ---- saved, and an old save without S.numbers still works ---- */
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('piazza-lezione-1')).numbers);
  t.check('numbers state saved', saved && saved.introDone && saved.mastered && saved.best === 7);
}, { file: out, fakeSpeech: true, viewport: mobile ? { width: 390, height: 844 } : undefined });
