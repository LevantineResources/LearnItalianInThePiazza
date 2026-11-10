/* The little words (Lesson 2) and the set phrases that stay (conversation/bank.js, content/shared.js): e, poi, ma, quindi,
   Ancora una volta, per favore, Sì, No, E Lei? are taught in Lesson 2's chapter (the dialogue, Little words, How it works, the
   practice), are in the dictionary and in Studio, and from then on are in the Frasi fatte of every tile bank (Lesson 3's
   piazza, a Lesson 7 stall, a Lesson 12 quest), once each (a lesson's own tile with the same words wins). Ancora una volta,
   per favore makes the NPC say their last line again (Enzo's price, Chiara's opening, a vendor, a quest's person). */
const path = require('path'), fs = require('fs');
const { play } = require('./lib/harness');
const REVIEW = path.resolve(__dirname, '../review/fix-general');
const LITTLE = ['e', 'poi', 'ma', 'quindi', 'Ancora una volta, per favore', 'Sì', 'No', 'E Lei?'];

play(async t => {
  const p = t.page, dbg = () => p.evaluate(() => __dbg());
  fs.mkdirSync(REVIEW, { recursive:true });
  const until = async (fn, ms = 12000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(100); } return false; };
  /* the bank: { group label: [tile labels] } */
  const bank = () => p.evaluate(() => { const out = {}; let g = '?'; document.querySelectorAll('#bank > *').forEach(el => { if (el.classList.contains('bank-label')) g = el.textContent; else (out[g] = out[g] || []).push(el.textContent); }); return out; });
  const all = b => Object.values(b).flat();
  const lastNpc = () => p.$$eval('.line.npc .it', ls => ls.map(l => l.textContent));
  const talk = async id => {
    const n = (await dbg()).npcs[id]; await p.evaluate(([x, y]) => __debug.place(x, y), [n[0], n[1] + 30]); await p.waitForTimeout(250);
    await p.keyboard.press('e'); await p.waitForSelector('#dialog:not([hidden])', { timeout:8000 }); await p.waitForTimeout(1500); await t.dump();
  };
  /* say tiles, then wait until the conversation is quiet (the fake voice speaks every line) */
  const say = async labels => {
    await t.say(labels, 600);
    let n = -1, same = 0;
    for (let i = 0; i < 100 && same < 14; i++){ await p.waitForTimeout(150); const k = (await t.lines()).length + (await p.evaluate(() => speechSynthesis.speaking ? 1000 : 0)); same = k === n ? same + 1 : 0; n = k; }
    await t.dump();
  };
  const fresh = async n => { await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500); await t.jump(n); };
  const again = async () => {
    const before = await lastNpc(), prev = before[before.length - 1];
    await say(['Ancora una volta, per favore']);
    const after = await lastNpc();
    console.log(`   (last line: “${prev}”)`);
    return after.length > before.length && after.slice(before.length).some(l => l === prev || l.endsWith(prev));
  };

  /* ---------- Lesson 2: the chapter teaches them ---------- */
  await t.jump(2);
  await p.evaluate(() => __debug.set({ vocab2:false }));
  await p.click('#btnBook'); await p.waitForTimeout(400);
  await p.evaluate(() => { const b = [...document.querySelectorAll('.sheet [data-ch]')].find(x => x.dataset.ch === '2'); if (b) b.click(); }); await p.waitForTimeout(300);
  const ch = await p.evaluate(() => document.querySelector('.sheet').innerText);
  t.check('Lesson 2: the dialogue asks Ancora una volta, per favore, then Quindi…', /Ancora una volta, per favore\./.test(ch) && /Quindi 2,50 euro/.test(ch));
  t.check('… Little words: e, poi, ma, quindi, Sì / No, E Lei? (and How it works says they stay in Frasi fatte)', /Little words/.test(ch) && ['poi', 'ma', 'quindi', 'E Lei?'].every(w => ch.includes(w)) && /Frasi fatte/.test(ch));
  await p.evaluate(() => { const h = document.querySelector('#hb-phrases2'); if (h) h.scrollIntoView({ block:'start' }); }); await p.waitForTimeout(300);
  await p.screenshot({ path:path.join(REVIEW, 'lesson2-handbook-little-words.png') });
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);

  /* before the Lesson 2 practice: not yet in the bank */
  await p.evaluate(() => __debug.set({ vocab2:false, practiceDone2:false }));
  await talk('giulia');
  let b = await bank();
  t.check('before Lesson 2\'s practice: Frasi fatte without the little words', !!b['Frasi fatte'] && !all(b).some(l => ['poi', 'quindi', 'Ancora una volta, per favore'].includes(l)));
  await t.leave();

  /* Enzo, after the practice: the price, then Ancora una volta, per favore → the price again */
  await p.evaluate(() => __debug.set({ vocab2:true, practiceDone2:true, tut:'l2-order' }));
  await talk('enzo');
  b = await bank();
  console.log('   Enzo\'s bank:', JSON.stringify(b));
  t.check('Enzo\'s bank: every little word once (his Al bar group has e, sì, no: no doubles)', LITTLE.every(w => all(b).filter(l => l.toLowerCase() === w.toLowerCase()).length === 1));
  await say(['vorrei', 'un', 'caffè', 'e', 'un', 'cornetto', 'per', 'favore']);
  await say(['no', 'Grazie']);
  await say(["quant'è"]);
  t.check('Enzo says the price', (await lastNpc()).some(l => /Sono 2,50 euro/.test(l)));
  t.check('… and the hint points at the little words (no Italian answer)', /little words/.test(await p.textContent('#hint')) && !/Ancora/.test(await p.textContent('#hint')));
  t.check('Ancora una volta, per favore: Enzo says the price again', await again());
  const tx = await t.lines();
  t.check('… "Sì, certo!" first, the player line shown as a sentence', tx.some(l => /Ancora una volta, per favore\./.test(l)) && tx.some(l => /Sì, certo!/.test(l)));
  await p.screenshot({ path:path.join(REVIEW, 'lesson2-ancora-una-volta.png') });
  t.check('a second time: the price again (not "Sì, certo! Sì, certo!")', await again() && !(await lastNpc()).some(l => /Sì, certo! Sì, certo/.test(l)));
  await say(['vorrei', 'un', 'caffè', 'poi', 'un', 'cornetto']);
  t.check('poi glues an order like e: Enzo takes both', (await lastNpc()).some(l => /caffè/.test(l) && /cornetto/.test(l)));
  await t.leave();

  /* the dictionary and Studio */
  await p.keyboard.press('v'); await p.waitForTimeout(400);
  const dict = await p.textContent('.sheet');
  t.check('the dictionary: Frasi fatte with the little words', /Frasi fatte/.test(dict) && ['Ancora una volta, per favore', 'quindi', 'poi', 'E Lei?'].every(w => dict.includes(w)));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  t.check('Studio\'s Lesson 2 list has the little words', await p.evaluate(() => ['poi', 'ma', 'quindi', 'Ancora una volta, per favore', 'E Lei?'].every(w => __studyList(2).some(x => x.it === w))));

  /* ---------- Lesson 3: Chiara's opening again ---------- */
  await fresh(3);
  await talk('chiara');
  b = await bank();
  t.check('Lesson 3 (Chiara): the little words in Frasi fatte', LITTLE.every(w => all(b).filter(l => l === w).length === 1) && ['poi', 'quindi', 'Ancora una volta, per favore'].every(w => b['Frasi fatte'].includes(w)));
  t.check('Ancora una volta, per favore: Chiara says her opening again', await again());
  await say(['Sto bene, grazie', 'E tu?']);
  await say(['Mi chiamo Sam', 'quindi', 'Ciao']);
  t.check('quindi is understood (no "stopped making sense")', !(await t.lines()).some(l => /stopped making sense/.test(l)) && !/stopped making sense/.test(await p.textContent('#hint')));
  await t.leave();

  /* ---------- Lesson 7: a stall (its Polite group has Sì: once) ---------- */
  await p.evaluate(() => { __debug.set({ lesson:7, tut:'l7-shop', vocab7:true, practiceDone7:true, vocabCheck7:true }); __debug.travel('mercato'); }); await p.waitForTimeout(2700);
  await talk('gino');
  b = await bank();
  console.log('   Gino\'s bank:', Object.keys(b).join(', '));
  t.check('Lesson 7 (Gino\'s stall): every little word once, Frasi fatte first', LITTLE.every(w => all(b).filter(l => l === w).length === 1) && Object.keys(b)[0] === 'Frasi fatte');
  await p.screenshot({ path:path.join(REVIEW, 'set-phrases-bank-lesson7.png') });
  t.check('Ancora una volta, per favore: Gino says his last line again', await again());
  await t.leave();

  /* ---------- Lesson 12: a quest (Il messaggio: Paolo in San Lorenzo) ---------- */
  await fresh(12);
  await p.evaluate(() => __debug.l12Explore()); await p.waitForTimeout(400);
  await p.evaluate(() => { __debug.questStart('messaggio'); __debug.schedaDone('messaggio'); });   // (Paolo has given you his message for Chiara)
  console.log('   Il messaggio:', JSON.stringify((await dbg()).quests.quests.messaggio));
  await p.evaluate(() => __debug.travel('piazza')); await until(async () => (await dbg()).scene === 'piazza'); await p.waitForTimeout(2000);
  await talk('chiara');
  b = await bank();
  console.log('   Chiara\'s bank (Il messaggio):', JSON.stringify(b));
  t.check('a quest\'s bank (Il messaggio, the relay to Chiara): its own groups, and every little word once', !!b['Il messaggio'] && LITTLE.every(w => all(b).filter(l => l === w).length === 1));
  await p.screenshot({ path:path.join(REVIEW, 'set-phrases-bank-quest.png') });
  t.check('Ancora una volta, per favore: Chiara says her last line again', await again());
  await t.leave();

  /* the station clerk (Lesson 12): Sì / No are there (the designer's missing Sì at Ancora uno stuzzichino?) */
  await p.evaluate(() => __debug.travel('stazione')); await until(async () => (await dbg()).scene === 'stazione'); await p.waitForTimeout(2000);
  if ((await dbg()).npcs.bigliettaio){
    await talk('bigliettaio');
    b = await bank();
    t.check('the station clerk\'s bank: Sì and No, once each', ['Sì', 'No'].every(w => all(b).filter(l => l === w).length === 1));
    await t.leave();
  }
}, { fakeSpeech:true });
