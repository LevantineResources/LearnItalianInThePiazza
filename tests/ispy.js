/* Vedo, vedo (ui/ispy.js): the I spy game, played through its debug entry point (__debug.ispy) with the options
   Lesson 10 will use, and its round generator checked over many seeds.
   - 10 finds, clicking the targets read from __dbg().ispy (one deliberate miss → Ritenta; on a later round two misses →
     Bruno's clue, a third → the sparkle), the clock moving 6 minutes per find from 15:00 to 16:00
   - the three "Che ore sono?" questions at 15:15, 15:30, 15:45 (one wrong answer with feedback on the player's own words,
     one in the 24-hour form), the bonus round "Tocca a te!" once, onDone and onClose
   - Studio: no "Vedo, vedo" tab until Lesson 10 is complete (forced here), then a game in Studio mode
   - the generator: every tier, both layouts, many seeds: the description picks out exactly its target(s), they are on screen,
     visible and clickable, the Italian agrees, and every word is in ISPY_VOCAB or taught before
   Screenshots (tests/shots/ispy-*.png) at 1280×800 and 390×844. */
const { play } = require('./lib/harness');

/* an independent check of Bruno's Italian (not using the game's own tables) */
const GENDER = { uomo:'m', donna:'f', bambino:'m', bambina:'f', gatto:'m', cane:'m', piccione:'m', bicicletta:'f', palloncino:'m', ombrello:'m',
  cappello:'m', borsa:'f', maglietta:'f', tavolo:'m', sedia:'f', fontana:'f', albero:'m', museo:'m' };
const PLURAL = { uomini:'uomo', donne:'donna', bambini:'bambino', bambine:'bambina', gatti:'gatto', cani:'cane', piccioni:'piccione', biciclette:'bicicletta' };
const COLOURS = { rosso:['rosso', 'rossa'], bianco:['bianco', 'bianca'], nero:['nero', 'nera'], giallo:['giallo', 'gialla'], verde:['verde', 'verde'], blu:['blu', 'blu'], rosa:['rosa', 'rosa'] };
const COLW = {}; Object.entries(COLOURS).forEach(([c, [m, f]]) => { COLW[m] = COLW[m] || []; COLW[m].push('m'); COLW[f] = COLW[f] || []; COLW[f].push('f'); });
const ART = { m:'un', f:'una' };
const DEF = { fontana:'la fontana', albero:"l'albero", tavolo:'il tavolo', sedia:'la sedia', bicicletta:'la bicicletta', museo:'il museo' };
const ADEF = { fontana:'alla fontana', albero:"all'albero", tavolo:'al tavolo', sedia:'alla sedia', bicicletta:'alla bicicletta', museo:'al museo' };
function grammarProblems(line){
  const m = line.match(/^Vedo, vedo… (.+)!$/); if (!m) return ['shape: ' + line];
  let s = m[1]; const P = [];
  /* where */
  const where = s.match(/ (sotto|sopra|dietro|vicino|davanti|accanto) (.+)$/);
  if (where){
    s = s.slice(0, where.index);
    const [, prep, rest] = where;
    const withA = ['vicino', 'davanti', 'accanto'].includes(prep);
    const ok = Object.keys(DEF).some(k => withA ? rest === ADEF[k] || rest === 'a ' + ART[GENDER[k]] + ' ' + k : rest === DEF[k] || rest === ART[GENDER[k]] + ' ' + k);
    if (!ok) P.push(`where: "${prep} ${rest}"`);
  }
  /* con … */
  const con = s.match(/ con (.+)$/);
  if (con){
    s = s.slice(0, con.index);
    const w = con[1].split(' ');
    if (/^(due|tre|quattro)$/.test(w[0])){ if (!PLURAL[w[1]] || w.length !== 2) P.push('con + number: ' + con[1]); }
    else {
      const g = GENDER[w[1]]; if (!g) P.push('con: noun ' + w[1]);
      if (w[0] !== ART[g]) P.push(`con: article ${w[0]} ${w[1]}`);
      if (w[2] && !(COLW[w[2]] || []).includes(g)) P.push(`con: colour ${w[1]} ${w[2]}`);
      if (w.length > 3) P.push('con: extra ' + con[1]);
    }
  }
  const w = s.split(' ');
  if (/^(due|tre|quattro)$/.test(w[0])){ if (!PLURAL[w[1]]) P.push('plural: ' + s); if (w.length > 2) P.push('plural extra: ' + s); }
  else {
    const g = GENDER[w[1]]; if (!g) P.push('noun: ' + w[1]);
    if (w[0] !== ART[g]) P.push(`article: ${w[0]} ${w[1]}`);
    if (w[2] && !(COLW[w[2]] || []).includes(g)) P.push(`colour: ${w[1]} ${w[2]}`);
    if (w.length > 3) P.push('extra: ' + s);
  }
  return P;
}

play(async t => {
  const p = t.page;
  const dbg = async () => (await p.evaluate(() => __dbg())).ispy;
  const until = async (fn, label, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms){ if (await fn()) return true; await p.waitForTimeout(80); } console.log('   timed out waiting for ' + label); return false; };
  const shot = async name => { await p.waitForTimeout(250); await t.shot(name); };

  await t.jump(9);
  await p.evaluate(() => { const T = document.getElementById('toasts'); if (T) T.innerHTML = ''; });
  let D = await dbg();
  t.check('not open, not unlocked before Lesson 10', !D.open && !D.unlocked);

  /* ---- the generator over many seeds ---- */
  const gen = await p.evaluate(() => {
    const out = { rounds:0, missing:[], bad:[], lines:[], preps:{}, tiers:{ 1:new Set(), 2:new Set(), 3:new Set(), 4:new Set() } };
    for (const layout of ['wide', 'tall']) for (let tier = 1; tier <= 4; tier++) for (let seed = 1; seed <= 45; seed++){
      const r = __ispyGen(seed * 7919, seed % 10, tier, layout);
      if (!r){ out.missing.push(`${layout} t${tier} s${seed}`); continue; }
      out.rounds++; out.lines.push(r.line); out.lines.push(r.clue); out.tiers[tier].add(r.desc.kind);
      if (r.desc.rel) out.preps[r.desc.rel.prep] = (out.preps[r.desc.rel.prep] || 0) + 1;
      const tag = `${layout} t${tier} s${seed}: ${r.line}`;
      const ids = r.matches.map(m => m.id).sort().join(), again = r.again.slice().sort().join();
      if (ids !== again) out.bad.push(tag + ' (matches again: ' + again + ')');
      const n = r.desc.n || 1;
      if (tier === 1 && r.desc.kind !== 'piccione' && r.matches.length !== 1) out.bad.push(tag + ' (not unique)');
      if (tier > 1 && n === 1 && r.matches.length !== 1) out.bad.push(tag + ' (not unique)');
      if (n > 1 && r.matches.length !== n) out.bad.push(tag + ' (count)');
      if (tier === 2 && r.same < 2) out.bad.push(tag + ' (no other of its kind)');
      r.matches.forEach(m => { if (!m.inside) out.bad.push(tag + ' (off screen)'); if (m.vis < 0.4) out.bad.push(tag + ' (hidden ' + m.vis + ')'); });
      if (!r.hitCentre) out.bad.push(tag + ' (centre click misses)');
      if (tier === 4 && !r.desc.rel) out.bad.push(tag + ' (no preposition)');
      if (tier === 3 && !(r.desc.n > 1 || r.desc.seat)) out.bad.push(tag + ' (no number)');
      if (tier === 2 && !(r.desc.col || (r.desc.with && r.desc.with.col))) out.bad.push(tag + ' (no colour)');
    }
    out.tiers = Object.fromEntries(Object.entries(out.tiers).map(([k, v]) => [k, [...v]]));
    out.audit = __ispyAudit(out.lines);
    return out;
  });
  const gp = gen.lines.filter(l => l.startsWith('Vedo')).flatMap(l => grammarProblems(l).map(x => `${l} → ${x}`));
  console.log(`   generator: ${gen.rounds} rounds; kinds by tier ${JSON.stringify(gen.tiers)}; prepositions ${JSON.stringify(gen.preps)}`);
  console.log('   e.g. ' + [...new Set(gen.lines)].filter((l, i) => i % 23 === 0).slice(0, 14).join(' | '));
  if (gen.missing.length) console.log('   no round: ' + gen.missing.join(', '));
  if (gen.bad.length) console.log('   bad: ' + gen.bad.slice(0, 12).join('\n        '));
  if (gp.length) console.log('   grammar: ' + gp.slice(0, 12).join('\n        '));
  if (gen.audit.length) console.log('   words not taught: ' + gen.audit.join(', '));
  t.check('generator: a round for every seed, tier and layout', gen.missing.length === 0 && gen.rounds === 360);
  t.check('generator: every target unique, on screen, visible and clickable', gen.bad.length === 0);
  t.check('generator: the Italian agrees (articles, colours, plurals, prepositions)', gp.length === 0);
  t.check('generator: all six prepositions come up', ['sotto', 'sopra', 'vicino', 'davanti', 'dietro', 'accanto'].every(x => gen.preps[x] > 0));
  t.check('generator: uomini and the tables come up in tier 3', gen.lines.some(l => /uomini/.test(l)) && gen.lines.some(l => /un tavolo con/.test(l)));
  t.check('every word Bruno says or a tile shows is taught (ISPY_VOCAB or before)', gen.audit.length === 0);
  const same = await p.evaluate(() => JSON.stringify(__ispyGen(4242, 3, 2, 'wide')) === JSON.stringify(__ispyGen(4242, 3, 2, 'wide')) && __ispyGen(4242, 3, 2, 'wide').line !== undefined);
  t.check('generator: the same seed gives the same round', same);

  /* ---- time parsing ---- */
  const times = await p.evaluate(() => {
    const T = (s, at) => { const keys = s.toLowerCase().replace("è l'una", "è_l'una").replace('sono le', 'sono_le').replace('un quarto', 'un_quarto').split(' ').map(w => w.replace('_', ' '))
      .map(w => ({ uno:1, due:2, tre:3, quattro:4, cinque:5, dieci:10, quindici:15, sedici:16, venti:20, ventiquattro:24, dodici:12 })[w] ? 'n' + ({ uno:1, due:2, tre:3, quattro:4, cinque:5, dieci:10, quindici:15, sedici:16, venti:20, ventiquattro:24, dodici:12 })[w] : w);
      return window.__ispyTime.right(keys, at); };
    return [T('sono le tre e mezza', 930), T('sono le quindici e trenta', 930), T('sono le quattro meno un quarto', 945), T('sono le quindici e quarantacinque', 945),
      !T('sono le tre e un quarto', 930), T("è l'una", 780), T('sono le dodici', 0), !T('sono le quindici', 180), T('sono le tre e dieci', 912), T('sono le tre e un quarto', 912),
      !T('sono le tre meno un quarto', 945), T('sono le sedici', 960), T('sono le ventiquattro', 0)];
  });
  console.log('   time checks: ' + times.join(' '));
  t.check('time: 12- and 24-hour forms, meno, a clock between marks', times.every(Boolean));

  /* ---- the game, as Lesson 10 will drive it ---- */
  await p.evaluate(() => {
    window.__ispyLog = [];
    __debug.ispy({ finds:10, start:{ h:15, m:0 }, step:6, timeAsks:['15:15', '15:30', '15:45'], bonus:true, seed:1234,
      onFind:k => __ispyLog.push(['find', k]), onClock:c => __ispyLog.push(['clock', c.h * 60 + c.m]), onTimeAnswer:a => __ispyLog.push(['time', a]),
      onDone:r => __ispyLog.push(['done', r]), onClose:s => __ispyLog.push(['close', s]),
      endLine:{ it:'Sono le quattro! Andiamo!', en:"It's four o'clock! Let's go!" }, doneLabel:'Andiamo!' });
  });
  await until(async () => (await dbg()).line, 'the first line');
  D = await dbg();
  t.check('the game opens: a modal with the scene and Bruno\'s line', D.open && D.phase === 'find' && /^Vedo, vedo… /.test(D.line) && await p.isVisible('#ispCv'));
  t.check('Bruno\'s line is spoken; its English is hidden', (await p.evaluate(() => (window.__spoken || []).map(s => s[1]))).some(s => s.startsWith('Vedo, vedo')) && await p.isHidden('#ispEn'));
  t.check('the clock starts at 15:00', D.clock.h === 15 && D.clock.m === 0);
  await shot('ispy-scene');

  const answers = { '15:15':[['sono le', 'n3', 'e', 'mezza'], ['sono le', 'n3', 'e', 'un quarto']], '15:30':[['sono le', 'n15', 'e', 'trenta']], '15:45':[['sono le', 'n4', 'meno', 'un quarto']] };
  let sawRitenta = false, sawClue = false, sawSpark = false, wrongFb = '', timeShots = 0, tierShots = {}, timesAsked = [];
  for (let guard = 0; guard < 60; guard++){
    await until(async () => { const d = await dbg(); return ['find', 'time', 'bonus-offer'].includes(d.phase); }, 'a round', 30000);
    D = await dbg();
    if (D.phase === 'bonus-offer') break;
    if (D.phase === 'time'){
      const at = `${D.time.at.h}:${String(D.time.at.m).padStart(2, '0')}`; timesAsked.push(at);
      await until(async () => (await dbg()).line === 'Che ore sono?', 'Che ore sono?');
      if (!timeShots++) await shot('ispy-time');
      for (const keys of answers[at] || [['sono le', 'n3']]){
        for (const k of keys) await p.click(`[data-isp-t="${k}"]`);
        await p.click('[data-isp="tsay"]'); await p.waitForTimeout(300);
        const d = await dbg();
        console.log(`   ${at} Che ore sono? → ${keys.join(' ')} → ${d.time && d.time.fb ? 'wrong: ' + d.time.fb : 'right'}`);
        if (d.time && d.time.fb){ wrongFb = d.time.fb; await shot('ispy-time-wrong');
          t.check('a wrong time: Bruno says Ritenta', /Ritenta/.test(d.react));
          await p.click('[data-isp="tclear"]'); }
      }
      await until(async () => (await dbg()).phase !== 'time', 'the time question to close');
      continue;
    }
    const k = D.found;
    console.log(`   ${k + 1}. [tier ${D.tier}] ${D.line}  (target ${D.target.kind} at ${D.target.x},${D.target.y})`);
    if (D.tier === 2 && !tierShots[2]){ tierShots[2] = 1; await shot('ispy-tier2'); }
    if (D.tier === 4 && D.desc.rel && !tierShots[4]){ tierShots[4] = 1; await shot('ispy-tier4'); }
    if (k === 0){
      await p.mouse.click(D.missAt.x, D.missAt.y); await p.waitForTimeout(250);
      const d = await dbg();
      sawRitenta = /Ritenta/.test(d.react) && d.miss === 1 && d.phase === 'find' && d.found === 0;
      await shot('ispy-miss');
    }
    if (k === 3){
      for (let i = 0; i < 3; i++){ D = await dbg(); await p.mouse.click(D.missAt.x, D.missAt.y); await p.waitForTimeout(250);
        const d = await dbg();
        if (i === 1){ sawClue = d.react.includes(d.clue) && /^(È|Sono) /.test(d.clue); console.log('   two misses → ' + d.react); }
        if (i === 2){ sawSpark = d.sparkle; await p.waitForTimeout(300); await shot('ispy-sparkle'); }
      }
    }
    D = await dbg();
    await p.mouse.click(D.target.page.x + 3, D.target.page.y + 2);    // near the middle of it
    await until(async () => (await dbg()).found === k + 1, 'the find to count', 5000);
  }
  D = await dbg();
  const log = await p.evaluate(() => window.__ispyLog);
  t.check('one deliberate miss → No, sbagliato! Ritenta!', sawRitenta);
  t.check('two misses → Bruno adds a clue in Italian', sawClue);
  t.check('three misses → the target sparkles', sawSpark);
  t.check('10 finds → the bonus offer', D.found === 10 && D.phase === 'bonus-offer');
  t.check('onFind called for every find', log.filter(x => x[0] === 'find').map(x => x[1]).join() === '1,2,3,4,5,6,7,8,9,10');
  console.log('   clock: ' + log.filter(x => x[0] === 'clock').map(x => x[1]).join(' '));
  t.check('the clock: 15:00 → 16:00, 6 minutes a find, stopping at the quarters', D.clock.h === 16 && D.clock.m === 0 && JSON.stringify(log.filter(x => x[0] === 'clock').map(x => x[1])) === JSON.stringify([900, 906, 912, 915, 918, 924, 930, 936, 942, 945, 948, 954, 960]));
  t.check('three time questions at 15:15, 15:30, 15:45', timesAsked.join() === '15:15,15:30,15:45');
  const ta = log.filter(x => x[0] === 'time').map(x => x[1]);
  console.log('   time answers: ' + ta.map(a => `${a.said} ${a.ok ? '✓' : '✗'}`).join(' · '));
  t.check('onTimeAnswer: one wrong, then right; the 24-hour form accepted', ta.length === 4 && !ta[0].ok && ta[1].ok && ta[2].ok && ta[2].said === 'Sono le quindici e trenta.' && ta[3].ok);
  console.log('   wrong-answer feedback: ' + wrongFb);
  t.check('wrong-time feedback is about the player\'s words, without the Italian answer', /mezza is half past/.test(wrongFb) && !/quarto|Sono le tre e/i.test(wrongFb));
  t.check('the end line is said', /Andiamo/.test((await p.evaluate(() => (window.__spoken || []).map(s => s[1]))).join('|')));
  await shot('ispy-bonus-offer');

  /* ---- Tocca a te! ---- */
  await p.click('[data-isp="bonus"]');
  await until(async () => (await dbg()).phase === 'bonus', 'the bonus round');
  const say = async words => { for (const w of words) await p.click(`[data-isp-b="${w}"]`); await p.click('[data-isp="bsay"]'); await p.waitForTimeout(300); return dbg(); };
  let B = (await say(['vedo', 'un', 'donna'])).bonus;
  console.log('   Vedo un donna → ' + B.fb);
  t.check('bonus: un donna → feedback on the article (donna is feminine)', /donna is feminine/.test(B.fb) && B.result === 'bad');
  await p.click('[data-isp="bclear"]');
  B = (await say(['vedo', 'un', 'gatto', 'sotto', 'la', 'fontana'])).bonus;
  D = await dbg();
  console.log(`   ${B.said} → ${D.react}`);
  t.check('bonus: something not in the square → Non lo vedo!', B.result === 'none' && /Non lo vedo/.test(D.react));
  B = (await say(['vedo', 'la', 'fontana'])).bonus;
  D = await dbg();
  console.log(`   ${B.said} → ${D.react}`);
  t.check('bonus: la fontana → Bruno finds it and highlights it (Eccola!)', B.result === 'found' && /Eccola/.test(D.react) && B.highlight && B.highlight.length === 1);
  /* something real from the scene: a description the generator would use */
  const desc = D.desc;
  const words = ['vedo', ...(await p.evaluate(d => { const N = { uomo:['un', 'uomo'], donna:['una', 'donna'], bambino:['un', 'bambino'], bambina:['una', 'bambina'], gatto:['un', 'gatto'], cane:['un', 'cane'], piccione:['un', 'piccione'], bicicletta:['una', 'bicicletta'], borsa:['una', 'borsa'], cappello:['un', 'cappello'] }[d.kind] || ['un', d.kind];
    const out = [...N]; if (d.rel){ const def = { fontana:['la', 'fontana'], albero:["l'", 'albero'], tavolo:['il', 'tavolo'], sedia:['la', 'sedia'], bicicletta:['la', 'bicicletta'] }[d.rel.anchor];
      out.push({ sotto:'sotto', sopra:'sopra', vicino:'vicino a', davanti:'davanti a', dietro:'dietro', accanto:'accanto a' }[d.rel.prep], ...(d.rel.def ? def : [{ m:'un', f:'una' }[{ fontana:'f', albero:'m', tavolo:'m', sedia:'f', bicicletta:'f' }[d.rel.anchor]], d.rel.anchor])); }
    return out; }, desc))];
  B = (await say(words)).bonus; D = await dbg();
  console.log(`   ${B.said} → ${D.react}`);
  t.check('bonus: a description with a preposition → found and highlighted', B.result === 'found' && /Ecco/.test(D.react));
  await shot('ispy-bonus');
  await p.click('[data-isp="bdone"]'); await p.waitForTimeout(300);
  D = await dbg();
  const done = (await p.evaluate(() => window.__ispyLog)).filter(x => x[0] === 'done');
  console.log('   onDone: ' + JSON.stringify(done[0] && done[0][1]));
  t.check('onDone fires once, with the finds, the time answers and the bonus', done.length === 1 && done[0][1].finds === 10 && done[0][1].time.asked === 3 && done[0][1].time.right === 3 && done[0][1].bonus.played && done[0][1].bonus.found >= 2);
  t.check('the last screen: Bravo, the Andiamo button', D.phase === 'done' && (await p.textContent('#ispPanel')).includes('Andiamo!'));
  await shot('ispy-done');
  await p.click('[data-isp="close"]'); await p.waitForTimeout(300);
  const closed = (await p.evaluate(() => window.__ispyLog)).filter(x => x[0] === 'close');
  t.check('closing calls onClose (done: true) and closes the modal', closed.length === 1 && closed[0][1].done && await p.isHidden('#modal'));

  /* ---- Studio ---- */
  await p.click('#btnStudy'); await p.waitForTimeout(300);
  t.check('Studio: no Vedo, vedo tab before Lesson 10 is complete', !(await p.$('[data-st-tab="ispy"]')));
  await p.keyboard.press('Escape');
  await p.evaluate(() => __debug.ispyUnlock()); await p.click('#btnStudy'); await p.waitForTimeout(300);
  await p.click('[data-st-tab="ispy"]'); await p.waitForTimeout(300);
  t.check('Studio: the Vedo, vedo tab once Lesson 10 is complete', await p.isVisible('[data-isp-st="play"]'));
  await shot('ispy-studio');
  await p.click('[data-isp-st-n="5"]'); await p.click('[data-isp-st="play"]');
  await until(async () => (await dbg()).line, 'the Studio game');
  D = await dbg();
  t.check('Studio: a game of 5, random seed, back button', D.open && D.mode === 'studio' && D.finds === 5 && await p.isVisible('[data-isp="studio"]'));
  await p.click('[data-isp="studio"]'); await p.waitForTimeout(300);
  t.check('Studio: back to the Studio tab', await p.isVisible('[data-isp-st="play"]'));
  await p.keyboard.press('Escape');

  /* ---- the phone: 390 × 844 ---- */
  const m = await p.context().browser().newPage({ viewport:{ width:390, height:844 } });
  m.on('pageerror', e => { console.log('pageerror (phone): ' + e.message); });
  await m.goto(p.url());
  await m.fill('#nameInput', 'Sam'); await m.click('[data-jump="9"]'); await m.waitForTimeout(2500);
  await m.evaluate(() => { document.getElementById('toasts').innerHTML = ''; __debug.set({ sound:false }); });
  const mshot = async n => { await m.waitForTimeout(400); await m.screenshot({ path:require('path').join(require('./lib/harness').SHOTS, n + '.png') }); };
  const mdbg = async () => (await m.evaluate(() => __dbg())).ispy;
  await m.evaluate(() => __debug.ispy({ finds:3, tiers:[2, 4, 1], seed:77, timeAsks:[1], step:15, bonus:true }));
  await m.waitForTimeout(600);
  let MD = await mdbg();
  t.check('phone: the tall layout', MD.layout === 'tall' && MD.rad >= 30);
  await mshot('ispy-m-tier2');
  await m.mouse.click(MD.target.page.x, MD.target.page.y);
  for (let i = 0; i < 60 && (await mdbg()).phase !== 'time'; i++) await m.waitForTimeout(150);
  MD = await mdbg();
  t.check('phone: a time question (the view crops to the clock)', MD.phase === 'time' && await m.$eval('#ispView', v => v.classList.contains('crop')));
  await mshot('ispy-m-time');
  for (const k of ['sono le', 'n3', 'e', 'un quarto']) await m.click(`[data-isp-t="${k}"]`);
  await m.click('[data-isp="tsay"]');
  for (let i = 0; i < 40 && (await mdbg()).phase !== 'find'; i++) await m.waitForTimeout(150);
  MD = await mdbg();
  t.check('phone: a tier-4 round', MD.tier === 4 && !!MD.desc.rel);
  await mshot('ispy-m-tier4');
  const top = () => m.evaluate(() => document.querySelector('#ispMain').scrollTo(0, 0));
  for (let r = 0; r < 2; r++){ await top(); await m.waitForTimeout(100); MD = await mdbg(); const f = MD.found; await m.mouse.click(MD.target.page.x, MD.target.page.y); for (let i = 0; i < 40 && (await mdbg()).found === f; i++) await m.waitForTimeout(150); for (let i = 0; i < 40 && !['find', 'bonus-offer'].includes((await mdbg()).phase); i++) await m.waitForTimeout(150); }
  t.check('phone: all found → the bonus offer', (await mdbg()).phase === 'bonus-offer');
  await m.click('[data-isp="bonus"]'); await m.waitForTimeout(500);
  for (const w of ['vedo', 'la', 'fontana']) await m.click(`[data-isp-b="${w}"]`);
  await m.click('[data-isp="bsay"]'); await m.waitForTimeout(500);
  MD = await mdbg();
  t.check('phone: the bonus round finds the fountain', MD.bonus && MD.bonus.result === 'found');
  await m.evaluate(() => document.querySelector('#ispMain').scrollTo(0, 260));
  await mshot('ispy-m-bonus');
  await m.close();
}, { fakeSpeech:true });
