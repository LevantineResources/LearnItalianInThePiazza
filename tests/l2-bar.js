const path = require('path'), fs = require('fs');
const GAME = 'file://' + path.resolve(__dirname, '../dist/index.html');
const SHOTS = path.resolve(__dirname, 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  /* record what the voice is asked to say (prices are shown in digits but spoken in words) */
  await p.addInitScript(() => { window.__said = []; try { const o = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = u => { window.__said.push(u.text); try { o(u); } catch(e){} }; } catch(e){} });
  await p.goto(GAME);
  await p.fill('#nameInput', 'Sam'); await p.click('#nameForm button[type=submit]');
  const clickWorld = async (x, y) => { const r = await p.$eval('#cv', c => { const b = c.getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height }; }); await p.mouse.click(r.l + x / 960 * r.w, r.t + y / 600 * r.h); };
  const talkTo = async (x, y) => { await clickWorld(x, y); await p.waitForSelector('#dialog:not([hidden])', { timeout: 25000 }); await p.waitForTimeout(700); };
  const tiles = async (sel, words) => { for (const w of words) await p.click(`${sel} .tile:not(.used) >> text="${w}"`); };
  const last = async (n = 2) => (await p.$$eval('.line', ls => ls.map(l => l.innerText.replace(/\s+/g, ' ').replace(/ EN$/,'').trim()))).slice(-n);
  const say = async (s) => { for (const w of (Array.isArray(s) ? s : s.split(' '))) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(1300);
    const hint = await p.$eval('#hint', h => h.hidden ? '' : h.innerText.replace(/\s+/g,' '));
    console.log('   ' + (await last(3)).join('  →  ') + (hint ? '   [' + hint + ']' : '')); };
  const check = (label, ok) => console.log(`   ${label} complete: ${!!ok}`);
  const NUMWORDS = /\b(uno?|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|venti|trenta|quaranta|cinquanta|sessanta|settanta|ottanta|novanta)\b/i;
  const leave = async () => { await p.click('#choices button.primary'); await p.waitForTimeout(500); };
  // ---- Lesson 1 quickly
  await talkTo(760, 290); await p.click('#choices button'); await p.waitForSelector('#choices button.primary'); await p.click('#choices button.primary');
  await p.click('[data-tab=practice]');
  await p.click('[data-opt="1"]'); await p.click('#pxNext');
  await tiles('#pxBank', ['mi', 'chiamo', 'Sam']); await p.click('#pxCheck'); await p.click('#pxNext');
  await p.click('[data-opt="1"]'); await p.click('#pxNext');
  await tiles('#pxBank', ['sto', 'bene', 'grazie', 'e', 'tu']); await p.click('#pxCheck'); await p.click('#pxNext');
  await p.click('[data-opt="1"]'); await p.click('#pxNext'); await p.click('#pxGo');
  console.log('GIULIA'); await talkTo(760, 290); await say('ciao mi chiamo Sam come ti chiami'); await say('sto bene grazie e tu'); await say('ciao'); await leave();
  console.log('MARCO'); await talkTo(590, 432); await say('buongiorno mi chiamo Sam'); await say('sto bene'); await say('ciao'); await leave();
  console.log('CHIARA'); await talkTo(200, 470); await say('ciao mi chiamo Sam come ti chiami'); await say('come stai'); await say('sto bene'); await say('ciao'); await leave();
  await p.waitForTimeout(600);
  console.log('L1 complete modal:', await p.isVisible('#goL2'));
  await p.click('#goL2'); await p.waitForTimeout(400);
  console.log('objective:', await p.textContent('#objective'), '| lesson:', await p.textContent('#lessonLabel'));
  await p.screenshot({ path: SHOTS + '/20-l2-start.png' });
  // ---- Lesson 2: fail out
  console.log('ENZO (fail)'); await talkTo(845, 144);
  await say(['Ciao','Mi chiamo Sam']);
  await p.waitForSelector('#choices:not([hidden]) button', { timeout: 4000 });
  console.log('   ' + (await last(2)).join(' | '));
  await p.click('#choices button'); await p.waitForSelector('#choices button.primary', { timeout: 5000 });
  console.log('   ' + (await last(3)).join(' | '));
  await p.screenshot({ path: SHOTS + '/21-bar-fail.png' });
  await p.click('#choices button.primary'); await p.waitForSelector('#modal:not([hidden])');
  await p.waitForTimeout(200);
  await p.$eval('.sheet-body', el => el.scrollTop = 700);
  await p.screenshot({ path: SHOTS + '/22-handbook-l2.png' });
  console.log('objective:', await p.textContent('#objective'));
  { const hb = await p.textContent('.sheet-body');
    check('L2 handbook dialogue price in digits', hb.includes('Sono 2,50 euro.') && !hb.includes('due euro e cinquanta')); }
  /* prices before Lesson 7: written in digits (Italian comma), spoken in words */
  { const pr = await p.evaluate(() => [100, 300, 250, 3150, 120].map(c => __debug.price(c)));
    console.log('   prices:', pr.map(x => `${x.shown} / ${x.said}`).join(' · '));
    check('price formats', pr[0].shown === 'È 1 euro.' && pr[0].said === 'È un euro.' && pr[1].shown === 'Sono 3 euro.' && pr[1].said === 'Sono tre euro.'
      && pr[2].shown === 'Sono 2,50 euro.' && pr[2].said === 'Sono due euro e cinquanta.' && pr[3].shown === 'Sono 31,50 euro.'
      && pr[3].said === 'Sono trentuno euro e cinquanta.' && pr[4].said === 'Sono un euro e venti.'); }
  await p.click('[data-tab=practice]');
  await p.click('[data-opt="1"]'); await p.click('#pxNext');
  await tiles('#pxBank', ['vorrei', 'un', 'caffè', 'per', 'favore']); await p.click('#pxCheck'); await p.click('#pxNext');
  await p.click('[data-opt="0"]'); await p.click('#pxNext');
  await p.click('[data-opt="1"]'); await p.click('#pxNext');
  await tiles('#pxBank', ['no', 'grazie', "quant'è"]); await p.click('#pxCheck'); await p.click('#pxNext');
  await p.click('[data-opt="2"]'); await p.click('#pxNext');
  await tiles('#pxBank', ['ancora', 'una', 'volta', 'per', 'favore']); await p.click('#pxCheck'); await p.click('#pxNext');   // (the little words)
  await p.click('[data-opt="1"]'); await p.click('#pxNext'); await p.click('#pxGo');
  console.log('objective:', await p.textContent('#objective'), '| dict:', await p.textContent('#dictCount'));
  // ---- own order
  console.log('ENZO (order)'); await talkTo(845, 144);
  console.log('   ' + (await last(1)).join(''));
  await say('una caffè');
  await say('vorrei un caffè');
  await say(['sì','un','cornetto','per','favore']);
  await say(['no','Grazie']);
  await say("quant'è");
  { const l = (await last(1))[0];
    check('Enzo says the price in digits', l.includes('Sono 2,50 euro.') && !NUMWORDS.test(l.replace(/^\S+/, '')));
    const said = await p.evaluate(() => window.__said || []);
    if (said.length) check('the voice says the price in words', said.some(s => s.includes('Sono due euro e cinquanta')) && !said.some(s => /\d/.test(s)));
    else console.log('   (no speech synthesis in this browser: spoken text not checked)'); }
  await say(['Grazie']);
  await leave();
  console.log('objective:', await p.textContent('#objective'));
  // ---- Emma
  console.log('EMMA'); await talkTo(655, 250);
  await p.waitForSelector('#choices button.primary', { timeout: 5000 });
  console.log('   ' + (await last(2)).join(' | '));
  await p.click('#choices button.primary'); await p.waitForTimeout(1400); await leave();
  console.log('objective:', await p.textContent('#objective'));
  // ---- translate
  console.log('ENZO (for Emma)'); await talkTo(845, 144); await p.waitForTimeout(600);
  console.log('   ' + (await last(2)).join(' | '));
  await say('vorrei una sfogliatella');
  await say('vorrei una spremuta per favore');
  await p.waitForSelector('#choices:not([hidden]) .btn.english', { timeout: 4000 });
  await p.screenshot({ path: SHOTS + '/23-translate.png' });
  await p.click('#choices .btn.english >> nth=0'); await p.waitForTimeout(300);
  await p.click('#choices .btn.english >> nth=1'); await p.waitForTimeout(900);
  console.log('   ' + (await last(4)).join(' | '));
  await say(['sì','un','cornetto','per','favore']);
  await p.waitForTimeout(600); console.log('   ' + (await last(1)).join(''));
  await say(['no','Grazie']);
  await p.waitForTimeout(600); console.log('   ' + (await last(1)).join(''));
  await say("quant'è");
  await p.waitForSelector('#choices:not([hidden]) .btn.english', { timeout: 4000 });
  { const opts = await p.$$eval('#choices .btn', bs => bs.map(b => b.textContent)); console.log('   options:', opts);
    const l = (await last(3)).find(x => x.includes('euro')) || '';
    check("Emma's price in digits", l.includes('Sono 4,30 euro.') && !NUMWORDS.test(l.replace(/^\S+/, '')) && opts.includes('€4.30')); }
  await p.click('#choices .btn.english >> nth=1'); await p.waitForTimeout(1200);
  console.log('   ' + (await last(2)).join(' | '));
  await say(['Grazie']);
  await leave(); await p.waitForTimeout(600);
  console.log('L2 complete modal:', await p.isVisible('#modal'), '| objective:', await p.textContent('#objective'));
  await p.screenshot({ path: SHOTS + '/24-complete2.png' });
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
