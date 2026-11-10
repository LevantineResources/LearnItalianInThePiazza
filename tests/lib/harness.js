/* Shared helpers for playthrough tests. A test is a plain script:

     const { play } = require('./lib/harness');
     play(async t => {
       await t.jump(7);                       // intro skip link to Lesson 7 (or t.newGame() for Lesson 1)
       await t.talkTo(792, 238);              // world coordinates (960 x 600 canvas)
       await t.say(['Ciao', 'Giulia']);       // tap tiles by label, press Dillo
       await t.type('buongiorno signore');    // typed conversations
       t.check('Giulia answered', (await t.lines()).some(l => l.includes('Sono le due')));
     });

   It prints a transcript, and ends with "errors: none" when no page error happened, which
   tests/run.js requires. Use t.check(label, bool) for assertions: a false one prints
   "<label> complete: false" and fails the run.

   Options (second argument): file (the built game), viewport ({ width, height }), and
   fakeSpeech: true to replace speechSynthesis with a fake Italian voice, so speech timing works
   in headless Chromium. Each utterance then "speaks" for 300 ms + 40 ms per character, one after
   another; window.__spoken lists [ms, text, rate] for every utterance, and setting
   window.__noItalianVoice = true makes getVoices() return no voices.
   autoCutscene (default true): cutscene lines wait for the reader in the game (world/cutscene.js: the "▸ Continua"
   prompt); the harness turns on __debug.autoCutscene, so they go on by themselves after a short reading delay. Pass
   autoCutscene:false to test the real behaviour (tests/cutscene-read.js), or set __debug.autoCutscene in the page. */
const FAKE_SPEECH = () => {
  const q = []; let cur = null;
  const synth = { speaking:false, pending:false, onvoiceschanged:null,
    getVoices(){ return window.__noItalianVoice ? [] : [{ lang:'it-IT', name:'Fake' }]; },
    cancel(){ q.length = 0; if (cur) clearTimeout(cur); cur = null; this.speaking = false; this.pending = false; },
    speak(u){ q.push(u); this.pending = q.length > 1; if (!cur) this._next(); },
    _next(){ const u = q.shift(); if (!u){ this.speaking = false; this.pending = false; cur = null; return; }
      this.speaking = true; window.__spoken = (window.__spoken || []).concat([[Math.round(performance.now()), u.text, u.rate]]);
      cur = setTimeout(() => { cur = null; this._next(); }, 300 + 40 * String(u.text).length); },
  };
  Object.defineProperty(window, 'speechSynthesis', { value:synth });
  window.SpeechSynthesisUtterance = function(t){ this.text = t; };
};
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const SHOTS = path.resolve(__dirname, '..', 'shots');

async function play(fn, opts = {}){
  const file = opts.file || path.resolve(__dirname, '../../dist/index.html');
  fs.mkdirSync(SHOTS, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: opts.viewport || { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  if (opts.fakeSpeech) await p.addInitScript(FAKE_SPEECH);
  if (opts.autoCutscene !== false) await p.addInitScript(() => { window.__autoCutscene = true; });
  await p.goto('file://' + file);
  let seen = 0;
  const t = {
    page: p,
    async newGame(name = 'Sam'){ await p.fill('#nameInput', name); await p.click('#nameForm button[type=submit]'); await p.waitForTimeout(600); },
    async jump(n, name = 'Sam'){ await p.fill('#nameInput', name); await p.click(n <= 6 ? `#btnJump${n}` : `[data-jump="${n}"]`); await p.waitForTimeout(2800); },
    async objective(){ const o = await p.textContent('#objective'); console.log('  [objective] ' + o); return o; },
    async clickWorld(x, y){ const r = await p.$eval('#cv', c => { const b = c.getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height }; }); await p.mouse.click(r.l + x / 960 * r.w, r.t + y / 600 * r.h); },
    async talkTo(x, y){ await t.clickWorld(x, y); await p.waitForSelector('#dialog:not([hidden])', { timeout: 12000 }); await p.waitForTimeout(1200); await t.dump(); },
    async lines(){ return p.$$eval('.line', ls => ls.map(l => l.innerText.replace(/\s+/g, ' ').replace(/ EN$/, '').trim())); },
    async dump(){ const L = await t.lines(); const hint = await p.$eval('#hint', h => h.hidden ? '' : h.innerText.replace(/\s+/g, ' ')); const s = L.slice(seen).join('  →  '); if (s || hint) console.log('   ' + s + (hint ? '   [' + hint + ']' : '')); seen = L.length; },
    async say(labels, wait = 1800){ for (const w of labels) await p.click(`#bank .tile >> text="${w}"`); await p.click('#btnSay'); await p.waitForTimeout(wait); await t.dump(); },
    async type(text, wait = 1800){ await p.waitForSelector('#typer:not([hidden])', { timeout: 8000 }); const en = await p.textContent('#typerEn'); await p.fill('#typerInput', text); await p.press('#typerInput', 'Enter'); await p.waitForTimeout(wait); console.log(`   ⌨ [${en}] "${text}"`); await t.dump(); },
    async choose(){ await p.waitForSelector('#choices:not([hidden]) button.primary', { timeout: 8000 }); await p.click('#choices button.primary'); await p.waitForTimeout(600); },
    async leave(){ if (await p.isVisible('#dialog')) await p.click('#dlgClose'); await p.waitForTimeout(500); seen = 0; },
    /* the word check of the open handbook chapter (ui/vocab.js): every flashcard, then the quiz, answered from
       __dbg().words. opts.wrong: answer the first quiz item wrong on purpose. Returns { wrongId, cameBack, items }:
       cameBack is true when that word was asked again later (and answered right). */
    async wordCheck(opts = {}){
      await p.click('.tabs [data-tab=words]'); await p.waitForTimeout(200);
      if ((await p.evaluate(() => __dbg().words)).phase === 'passed') return { passed:true };
      /* the real buttons, clicked inside the page (one round trip: a lesson has up to ~30 words) */
      const r = await p.evaluate(wrong => {
        const w = () => __dbg().words, click = sel => { const b = document.querySelector(sel); if (b) b.click(); return !!b; };
        let g = 0, wrongId = null, cameBack = false, items = 0;
        while (w().phase === 'cards' && g++ < 400) click('[data-vc=next]');
        while (w().phase === 'quiz' && g++ < 800){
          const s = w();
          if (s.status !== 'answer'){ click('[data-vc=next]'); continue; }
          const c = s.cur; items++;
          if (wrong && !wrongId){ wrongId = c.id; click(`[data-vq="${(c.answer + 1) % c.opts.length}"]`); }
          else { if (c.id === wrongId && c.again) cameBack = true; click(`[data-vq="${c.answer}"]`); }
        }
        return { wrongId, cameBack, items, total:w().total, phase:w().phase };
      }, !!opts.wrong);
      await p.waitForTimeout(300);
      console.log(`   word check: ${r.total} cards, ${r.items} quiz items, phase ${r.phase}` + (r.wrongId ? `, missed ${r.wrongId} on purpose, came back: ${r.cameBack}` : ''));
      return r;
    },
    /* answer a handbook practice: steps like ['o', 0] (option index) or ['t', ['tile', 'tile']].
       A chapter with a Vocabolario locks its practice until the word check is passed: that is done first. */
    async practice(steps){
      if (await p.$('.tabs [data-tab=words]') && !(await p.evaluate(() => __dbg().words.passed))) await t.wordCheck();
      await p.click('.tabs [data-tab=practice]');
      for (const st of steps){
        if (st[0] === 'o') await p.click(`[data-opt="${st[1]}"]`);
        else { for (const w of st[1]) await p.click(`#pxBank .tile:not(.used) >> text="${w}"`); await p.click('#pxCheck'); }
        await p.click('#pxNext');
      }
      await p.click('#pxGo'); await p.waitForTimeout(400);
    },
    async shot(name){ await p.screenshot({ path: path.join(SHOTS, name + '.png') }); },
    check(label, ok){ console.log(`${label} complete: ${!!ok}`); },
  };
  try { await fn(t); }
  catch (e) { console.log('FAIL ' + e.message.split('\n')[0]); errs.push(e.message.split('\n')[0]); }
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
  process.exit(errs.length ? 1 : 0);
}
module.exports = { play, SHOTS };
