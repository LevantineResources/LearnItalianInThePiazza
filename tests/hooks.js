/* Builds the game with docs/example-lesson after the real lessons (folder '99-example', lesson number
   EX_N = the next free one) and plays it through, to check that a lesson can plug in through LESSON_HOOKS alone (objective, guide, markers, talk, bank,
   phrases, react, onPractice, onClose, skip links, dictionary, placeTiles, mapRoute, dests). */
const path = require('path');
const { build } = require('../scripts/build.js');
const { play } = require('./lib/harness');
const out = path.resolve(__dirname, '../dist/hooks-test.html');
build({ out, extraLessons: [{ name: '99-example', dir: path.resolve(__dirname, '../docs/example-lesson') }] });

play(async t => {
  const p = t.page;
  /* the example lesson's skip link is the last one */
  const ex = await p.$$eval('[data-jump]', bs => +bs[bs.length - 1].dataset.jump);
  console.log('   example lesson number:', ex);
  t.check('example is the last lesson', ex >= 8 && await p.isVisible('[data-jump="7"]'));
  await t.jump(ex);
  t.check('L7 label', (await p.textContent('#lessonLabel')).includes('Lezione ' + ex));
  t.check('L7 objective', (await t.objective()) === 'Say hello to Giulia');
  t.check('L7 guide', (await p.textContent('#guideText')).includes('Giulia'));
  console.log('GIULIA (barrier)'); await t.talkTo(760, 290); await t.choose(); await t.leave();
  t.check('L7 barrier → handbook', (await t.objective()) === 'Open your handbook');
  await p.keyboard.press('h'); await p.waitForTimeout(400);
  t.check('L7 handbook chapter', (await p.textContent('.sheet')).includes('Che ore sono?') && (await p.textContent('.sheet h2')).includes('Lezione ' + ex));
  /* the Vocabolario (ui/vocab.js): listed in the chapter, and the practice is locked until the word check is passed */
  t.check('L7 Vocabolario in the chapter', (await p.textContent('#hbBody')).includes('Vocabolario') && await p.isVisible('.vocab .vrow'));
  await p.click('.tabs [data-tab=practice]'); await p.waitForTimeout(200);
  t.check('L7 practice locked: words first', await p.isVisible('.vc-lock') && (await p.textContent('.tabs')).includes('🔒'));
  const wc = await t.wordCheck({ wrong:true });
  t.check('L7 word check passed, the missed word came back', wc.phase === 'done' && wc.cameBack && wc.items === wc.total + 1);
  t.check('L7 onVocab hook → practice', (await t.objective()) === `Finish the Lesson ${ex} practice`);
  await t.practice([['o', 0], ['o', 1]]);
  t.check('L7 practice → ask', (await t.objective()) === 'Ask Giulia the time');
  console.log('GIULIA (ask)'); await t.talkTo(760, 290);
  console.log('   bank:', (await p.$$eval('#bank .bank-label', ls => ls.map(l => l.textContent))).join(', '));
  await t.say(['Che ore sono?'], 2600);
  t.check('L7 Giulia answered', (await t.lines()).some(l => l.includes('Sono le due')));
  await t.leave(); await p.waitForTimeout(600);
  t.check('L7 complete modal', await p.isVisible('#modal') && (await p.textContent('.sheet h2')).includes('Lezione ' + ex));
  await t.shot('70-hooks-complete');
  await p.click('.sheet [data-close]'); await p.keyboard.press('v'); await p.waitForTimeout(300);
  t.check('L7 dictionary', (await p.textContent('.sheet')).includes('Lezione ' + ex + ' · Che ore sono?'));
  await p.click('.sheet [data-close]'); await p.waitForTimeout(300);

  // placeTiles: "il mercato" in the Places group, and dov'è + it parses to where:mercato
  console.log('PAOLO (placeTiles)'); await t.talkTo(590, 432);
  const places = await p.$$eval('#bank .tile.place', ts => ts.map(x => x.textContent));
  t.check('L7 place tile in bank', places.includes('il mercato'));
  await t.say(['Scusi', "Dov'è", 'il mercato']);
  t.check('L7 place tile parsed', (await t.lines()).some(l => l.includes('Il mercato? Mmm')));
  await t.leave();

  // mapRoute + dests: trace Giulia's route, then the Mercato destination unlocks
  await p.keyboard.press('m'); await p.waitForSelector('.mapsvg'); await p.waitForTimeout(300);
  t.check('L7 map has no market button yet', !(await p.$('[data-go="mercato"]')) && !!(await p.$('#mCheck')));
  t.check('L7 hook notes', (await p.textContent('.notes')).includes('Vai dritto'));
  const node = async (c, r) => { await p.click(`[data-node="${c},${r}"]`); await p.waitForTimeout(120); };
  await node(2, 3); await node(3, 3); await p.click('#mCheck');
  const bad = await p.textContent('.mapstatus'); console.log('   map check 1:', bad);
  t.check('L7 hook wrong() hint', bad.includes('turn left'));
  await p.click('#mClear'); await node(2, 3); await node(1, 3); await node(0, 3); await p.click('#mCheck');
  const good = await p.textContent('.mapstatus'); console.log('   map check 2:', good);
  t.check('L7 hook route ok', good.includes('Perfetto') && good.includes('Giulia'));
  t.check('L7 mercato unlocked', await p.isVisible('[data-go="mercato"].primary'));
  await p.click('[data-go="mercato"]'); await p.waitForTimeout(2600);
  const d = await p.evaluate(() => __dbg());
  t.check('L7 walked to the market', d.scene === 'mercato' && ['teresa', 'franco', 'gino', 'pina'].every(id => d.npcs[id]));
  await t.shot('71-hooks-market');
}, { file: out });
