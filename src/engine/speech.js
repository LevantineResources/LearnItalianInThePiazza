/* Text-to-speech (it-IT) and the speechBusy() gate the display queue waits on. */

/* ---------- speech ---------- */
let itVoice = null;
const hasTTS = 'speechSynthesis' in window;
function pickVoice(){ try { const vs = speechSynthesis.getVoices(); itVoice = vs.find(v => /^it([-_]|$)/i.test(v.lang)) || null; } catch(e){} }
if (hasTTS){ pickVoice(); try { speechSynthesis.onvoiceschanged = pickVoice; } catch(e){} }
/* how long an utterance should take, as a safety net when a browser never clears speechSynthesis.speaking */
let speakDeadline = 0;
function speechBusy(){
  if (!hasTTS || !S.sound) return false;
  let busy = false;
  try { busy = speechSynthesis.speaking || speechSynthesis.pending; } catch(e){}
  return busy && performance.now() < speakDeadline;
}
function speak(text, pitch = 1, queue = false, rate = 0.88){
  if (!S.sound || !hasTTS) return;
  const clean = sayIt(text).replace(/…/g, '').trim();      // (written prices are spoken in words: engine/text.js)
  if (!clean) return;
  const est = 900 + clean.length * 80 / (rate / 0.88);
  speakDeadline = (queue ? Math.max(speakDeadline, performance.now()) : performance.now()) + est;
  try {
    if (!queue) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'it-IT'; if (itVoice) u.voice = itVoice; u.rate = rate; u.pitch = pitch;
    if (SCENES[S.scene] && SCENES[S.scene].hush) u.volume = 0.55;      // (a hushed place: the basilica speaks softly, world/basilica.js)
    speechSynthesis.speak(u);
  } catch(e){}
}
const SPK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>';
function renderSoundBtn(){
  const b = $('#btnSound');
  b.setAttribute('aria-pressed', S.sound ? 'true' : 'false');
  b.innerHTML = S.sound
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg><span class="lbl">Voice on</span>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg><span class="lbl">Voice off</span>';
}
