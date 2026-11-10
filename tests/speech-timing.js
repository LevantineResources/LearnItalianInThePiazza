const path = require('path'), fs = require('fs');
const GAME = 'file://' + path.resolve(__dirname, '../dist/index.html');
const SHOTS = path.resolve(__dirname, 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  // fake voice: every utterance "speaks" for 1500 ms, one after another
  await p.addInitScript(() => {
    const q = []; let cur = null;
    const synth = { speaking:false, pending:false, onvoiceschanged:null,
      getVoices(){ return [{ lang:'it-IT', name:'Fake' }]; },
      cancel(){ q.length = 0; if (cur) clearTimeout(cur); cur = null; this.speaking = false; this.pending = false; },
      speak(u){ q.push(u); this.pending = q.length > 1; if (!cur) this._next(); },
      _next(){ const u = q.shift(); if (!u){ this.speaking = false; this.pending = false; cur = null; return; }
        this.speaking = true; window.__spoken = (window.__spoken || []).concat([[Math.round(performance.now()), u.text]]);
        cur = setTimeout(() => { cur = null; this._next(); }, 1500); },
    };
    Object.defineProperty(window, 'speechSynthesis', { value:synth });
    window.SpeechSynthesisUtterance = function(t){ this.text = t; };
    window.__lines = [];
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.classList && n.classList.contains('line')) window.__lines.push([Math.round(performance.now()), n.innerText.replace(/\s+/g, ' ').replace(/ EN$/, '').trim()]); })))
      .observe(document, { childList:true, subtree:true });
  });
  await p.goto(GAME);
  await p.fill('#nameInput', 'Sam'); await p.click('#btnJump3'); await p.waitForTimeout(600);
  await p.keyboard.press('p'); await p.click('#reply1'); await p.click('.phone-top [data-close]');
  const clickWorld = async (x, y) => { const r = await p.$eval('#cv', c => { const b = c.getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height }; }); await p.mouse.click(r.l + x / 960 * r.w, r.t + y / 600 * r.h); };
  await clickWorld(200, 470); await p.waitForSelector('#choices:not([hidden]) .btn.english', { timeout: 15000 });
  await p.click('#choices .btn.english'); await p.waitForSelector('#choices button.primary', { timeout: 15000 });
  await p.click('#choices button.primary'); await p.waitForSelector('#modal:not([hidden])');
  await p.click('[data-tab=practice]');
  const tiles = async (words) => { for (const w of words) await p.click(`#pxBank .tile:not(.used) >> text="${w}"`); };
  for (const step of [['o',0],['o',1],['t',['scusa',"dov'è",'via dei Mille']],['o',1],['o',0],['t',['può','ripetere','per favore']]]){
    if (step[0] === 'o') await p.click(`[data-opt="${step[1]}"]`); else { await tiles(step[1]); await p.click('#pxCheck'); }
    await p.click('#pxNext');
  }
  await p.click('#pxGo');
  await p.evaluate(() => { window.__lines = []; });
  await clickWorld(200, 470); await p.waitForSelector('#dialog:not([hidden])');
  await p.waitForTimeout(2500);
  for (const w of ['Scusa', "Dov'è", 'via dei Mille']) await p.click(`#bank .tile >> text="${w}"`);
  await p.click('#btnSay');
  await p.waitForTimeout(16000);
  const lines = await p.evaluate(() => window.__lines);
  let prev = null;
  for (const [t, txt] of lines){ console.log(`  ${String(t).padStart(6)}ms ${prev ? '(+' + (t - prev) + ')' : ''}  ${txt.slice(0, 70)}`); prev = t; }
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
