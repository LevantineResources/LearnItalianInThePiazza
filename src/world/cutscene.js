/* Cutscenes (reusable; Lesson 11's opening at the Pietà, the custodian's nudge back behind a rope). See CLAUDE.md
   ("Cutscenes").

   cutscene(steps, opts) runs the steps in order and returns a promise of { skipped, timedOut, replaced }. While it runs
   the player's controls are frozen: no walking (keys or taps), no hotkeys (H, V, M…), no E prompt; Esc skips it.
   steps (each one waits until it is finished, unless it has async:true):
     { walk:'player' | npcId | npc, to:{x,y} | path:[{x,y} | [x,y], …], speed:110, find:false, face?:{x,y} }
                                  a scripted walk (straight lines; find:true routes round obstacles with findPath).
                                  Collisions are ignored: it is scripted. An NPC that walks has n.cutWalk set meanwhile.
     { say:'Troppo vicino!', who:'player' | npcId, ms?, silent? }   a speech bubble (worldSay) and the voice; waits for it
     { guide:'html' | null }      the guide banner's line during the cutscene (opts.guide is the default)
     { wait:ms }
     { face:npcId | 'player', to:'player' | npcId | {x,y} }
     { allowKeys:['e'], until, work?, guide?, onSkip? }   only these keys work (DIRS keys allow walking; 'e' also allows a
                                  tap on what E would open) until `until` holds: a function, or 'workOpened' (a picture
                                  opened: openWork; `work` = that id), 'workClosed', 'modalClosed', 'dialogClosed'
     { until }                    wait for the same conditions, no keys
     { run:fn }                   call fn(); a returned promise is waited for
   opts: { id (saved in S.cut while it runs, for a reload), guide, quiet (no guide, no "Esc · skip" chip, not saved:
          the rope's nudge), timeout:120000 (then it is skipped), onSkip() (after a skip: put things where they belong) }
   Skipping (Esc, the timeout): every remaining step finishes at once (walks arrive, waits and voices are cut short; an
   allowKeys step calls its onSkip), so the game can never be left stuck.
   A reload during a cutscene: S.cut = { id, step } is left in the save; restore clears it, gives the player control and
   asks the lessons' cutsceneResume({ id, step }) hook to start it again (or not).
   Also: cutsceneOn(), cutsceneSkip(), cutsceneEnd() (stop at once, no onSkip), cutsceneEvent(name, arg).
   Lines wait for the reader (the designer: cutscene text went by too fast). A `say` step, once its voice and its minimum time
   are over, keeps its bubble and shows a small "▸ Continua" prompt on the stage until the player presses it, Space, Enter or E
   (or taps the stage); so does the first `wait` step after a new guide line (and the end of the cutscene, if a guide line is
   still unread). Pure movement (walks, faces, runs) keeps its automatic timing; a step the player drives (allowKeys / until)
   counts as read. `{ say, auto:true }` and quiet cutscenes never wait. __debug.autoCutscene (tests/lib/harness.js turns it
   on by default) continues by itself after CUT_AUTO_MS; Esc still skips everything. */
const CUT = { on:false, tok:0, id:null, step:-1, kind:null, keys:new Set(), guide:null, skip:false, quiet:false, events:[], walks:[], t0:0, resumed:null, last:null,
  unread:false, reading:false, readT0:0, reads:0 };
const CUT_AUTO_MS = 250;
window.__debug.autoCutscene = !!window.__autoCutscene;      // (set before the game loads by tests/lib/harness.js)
/* waits for the reader: the "▸ Continua" prompt until it is pressed (cutsceneContinue), or at once when skipping; nothing
   to read under a conversation or a modal, so it goes on by itself then */
function cutRead(tok){
  CUT.unread = false;
  if (CUT.quiet || CUT.skip || tok !== CUT.tok) return Promise.resolve();
  CUT.reading = true; CUT.readT0 = performance.now(); cutReadUI();
  const auto = () => window.__debug.autoCutscene && performance.now() - CUT.readT0 >= CUT_AUTO_MS;
  return cutWaitFor(() => !CUT.reading || auto() || dialogOpen || modalOpen, tok).then(() => { CUT.reading = false; CUT.reads++; cutReadUI(); });
}
function cutsceneContinue(){ if (!CUT.reading) return false; CUT.reading = false; cutReadUI(); return true; }
const cutsceneReading = () => CUT.on && CUT.reading;
function cutReadUI(){
  let el = $('#cutRead');
  if (!el){
    el = document.createElement('button'); el.id = 'cutRead'; el.type = 'button';
    el.innerHTML = '<span class="cr-arrow" aria-hidden="true">▸</span> Continua <kbd>Space</kbd>';
    el.setAttribute('aria-label', 'Continue (Space, Enter or E)');
    el.onclick = e => { e.stopPropagation(); cutsceneContinue(); };
    $('#stage').appendChild(el);
  }
  el.hidden = !(CUT.on && CUT.reading);
}
const cutsceneOn = () => CUT.on;
/* a cutscene playing something (a walk, a line, a pause, a turn), not waiting for the player or running a step of the game's
   (Lesson 12's opens the map, a run step, and waits for it to close, an until step: the map's fast travel works then) */
const cutscenePlaying = () => CUT.on && ['walk', 'say', 'wait', 'face'].includes(CUT.kind);
const cutsceneGuide = () => CUT.on && !CUT.quiet ? CUT.guide : null;
/* may the player walk? (no cutscene, or one that allows the arrow keys) */
const cutsceneControls = () => !CUT.on || [...CUT.keys].some(k => DIRS[k]);
/* the E prompt over a person or a work: not during a cutscene, unless E is one of its keys */
const cutscenePrompt = () => !CUT.on || CUT.keys.has('e');
function cutsceneEvent(name, arg){ if (CUT.on) CUT.events.push({ name, arg, t:performance.now() }); }

function cutscene(steps, opts = {}){
  if (CUT.on) cutsceneEnd(true);
  const tok = ++CUT.tok;
  Object.assign(CUT, { on:true, id:opts.id || null, step:-1, kind:null, keys:new Set(), guide:opts.quiet ? null : opts.guide || null, skip:false, quiet:!!opts.quiet,
    events:[], walks:[], t0:performance.now(), opts, timedOut:false, replaced:false, unread:!opts.quiet && !!opts.guide, reading:false });
  keys.clear(); target = null; route = []; goalPt = null; pendingTalk = null; pendingDoor = null;
  cutChip();
  const timer = setTimeout(() => { if (tok === CUT.tok && CUT.on){ CUT.timedOut = true; cutsceneSkip(); } }, opts.timeout || 120000);
  return (async () => {
    for (let i = 0; i < steps.length; i++){
      if (tok !== CUT.tok) break;
      CUT.step = i; CUT.keys = new Set(); CUT.kind = Object.keys(steps[i]).find(k => ['walk', 'say', 'guide', 'wait', 'face', 'allowKeys', 'until', 'run'].includes(k)) || null;
      if (CUT.id && !CUT.quiet){ S.cut = { id:CUT.id, step:i }; save(); }
      try { await cutStep(steps[i], tok); } catch(e){ console.error(e); }
    }
    if (tok === CUT.tok && CUT.unread) await cutRead(tok);        // (a guide line still unread at the end)
    clearTimeout(timer);
    const res = { skipped:tok === CUT.tok && CUT.skip, timedOut:tok === CUT.tok && CUT.timedOut, replaced:tok !== CUT.tok };
    if (tok === CUT.tok){
      if (CUT.skip && opts.onSkip) try { opts.onSkip(); } catch(e){ console.error(e); }
      cutFinish();
    }
    CUT.last = { id:opts.id || null, ...res };
    return res;
  })();
}
function cutFinish(){
  CUT.walks.forEach(w => { if (w.who !== player) w.who.cutWalk = false; w.who.moving = false; });
  if (S.cut){ delete S.cut; }
  Object.assign(CUT, { on:false, step:-1, kind:null, keys:new Set(), guide:null, walks:[], quiet:false, unread:false, reading:false });
  player.moving = false; keys.clear(); save(); cutChip(); cutReadUI(); renderHUD(); lastGuide = '';
}
/* Esc (or the timeout): finish every remaining step at once */
function cutsceneSkip(){
  if (!CUT.on || CUT.skip) return;
  CUT.skip = true;
  CUT.walks.forEach(w => cutArrive(w));
  if (hasTTS) try { speechSynthesis.cancel(); } catch(e){}
}
/* stop now (no onSkip): the next cutscene replaces this one, or a lesson ends it */
function cutsceneEnd(replaced){ if (!CUT.on) return; CUT.tok++; CUT.replaced = !!replaced; cutFinish(); }

const cutWho = w => w === 'player' ? player : typeof w === 'string' ? NPC[w] : w;
/* the world bubble a say step put up (world/museo.js BUBBLES) */
const cutBubble = who => { const n = cutWho(who); return BUBBLES.slice().reverse().find(b => b.who === n) || null; };
const cutPt = p => Array.isArray(p) ? { x:p[0], y:p[1] } : { x:p.x, y:p.y };
/* resolves when cond() holds (checked every 50 ms), or at once when skipping */
function cutWaitFor(cond, tok){
  return new Promise(res => { const tick = () => { if (tok !== CUT.tok || CUT.skip || cond()) return res(); setTimeout(tick, 50); }; tick(); });
}
function cutUntil(u, step){
  if (typeof u === 'function') return u;
  const since = performance.now();
  const ev = name => () => CUT.events.some(e => e.name === name && e.t >= since && (!step.work || e.arg === step.work));
  if (u === 'workOpened') return () => ev('workOpened')() || (workOpen() && (!step.work || workShown === step.work));
  if (u === 'workClosed') return () => !workOpen();
  if (u === 'modalClosed') return () => !modalOpen;
  if (u === 'dialogClosed') return () => !dialogOpen;
  return () => true;
}
async function cutStep(st, tok){
  const fast = () => CUT.skip || tok !== CUT.tok;
  if (st.guide !== undefined && !CUT.quiet){ if (st.guide && st.guide !== CUT.guide) CUT.unread = true; CUT.guide = st.guide; }
  if (st.walk){
    const who = cutWho(st.walk); if (!who) return;
    let pts = st.path ? st.path.map(cutPt) : [cutPt(st.to)];
    if (st.find && st.to){ const f = who === player ? findPath(player.x, player.y, st.to.x, st.to.y) : null; if (f && f.length) pts = f.concat([cutPt(st.to)]); }
    const len = pts.reduce((a, p, i) => a + Math.hypot(p.x - (i ? pts[i - 1].x : who.x), p.y - (i ? pts[i - 1].y : who.y)), 0);
    const w = { who, pts, speed:st.speed || 110, face:st.face || null, t0:performance.now(), max:len / (st.speed || 110) * 1000 + 3000, done:false };
    if (who !== player) who.cutWalk = true;
    CUT.walks.push(w);
    if (fast()) cutArrive(w);
    if (!st.async) await cutWaitFor(() => w.done, tok);
    return;
  }
  if (st.say){
    const who = st.who || 'player';
    if (!fast()) worldSay(who, st.say, { ms:st.ms || Math.max(1600, 700 + st.say.length * 70), silent:st.silent });
    const t0 = performance.now(), min = st.ms || Math.max(900, 400 + st.say.length * 45);
    await cutWaitFor(() => performance.now() - t0 > min && !(S.sound && hasTTS && speechBusy()), tok);
    if (!st.auto && !CUT.quiet && !fast()){
      /* the bubble stays while the player reads it, and fades when they go on */
      const b = cutBubble(who); if (b) b.ms = Infinity;
      await cutRead(tok);
      if (b) b.ms = performance.now() - b.t0 + 250;
    }
    return;
  }
  if (st.wait){ const t0 = performance.now(); await cutWaitFor(() => performance.now() - t0 >= st.wait, tok); if (CUT.unread) await cutRead(tok); return; }
  if (st.face){
    const n = cutWho(st.face), t = st.to === 'player' ? player : typeof st.to === 'string' ? NPC[st.to] : st.to;
    if (n && t){ const dx = t.x - n.x, dy = t.y - n.y, d = Math.hypot(dx, dy) || 1; n.face = { x:dx / d, y:dy / d }; if (n !== player) n.baseFace = { ...n.face }; }
    return;
  }
  if (st.allowKeys || st.until){
    CUT.keys = new Set((st.allowKeys || []).map(k => k.toLowerCase())); CUT.unread = false;   // (the player drives this step: its line is read)
    const cond = cutUntil(st.until, st);
    await cutWaitFor(cond, tok);
    if (CUT.skip && tok === CUT.tok && st.onSkip) try { st.onSkip(); } catch(e){ console.error(e); }
    CUT.keys = new Set();
    return;
  }
  if (st.run && !fast()){ const r = st.run(); if (r && typeof r.then === 'function') await Promise.race([r, cutWaitFor(() => false, tok)]); }
}
function cutArrive(w){
  const p = w.pts[w.pts.length - 1]; if (!p){ w.done = true; return; }
  w.who.x = p.x; w.who.y = p.y; w.pts = []; w.done = true; w.who.moving = false;
  if (w.face){ w.who.face = { ...w.face }; if (w.who !== player) w.who.baseFace = { ...w.face }; }
  if (w.who !== player) w.who.cutWalk = false;
}
/* every frame (world/update.js): the scripted walks */
function cutsceneTick(dt){
  if (!CUT.on || !CUT.walks.length) return;
  for (const w of CUT.walks){
    if (w.done) continue;
    if (performance.now() - w.t0 > w.max){ cutArrive(w); continue; }     // stuck somehow: arrive
    const t = w.pts[0], dx = t.x - w.who.x, dy = t.y - w.who.y, d = Math.hypot(dx, dy), sp = w.speed * dt;
    w.who.moving = true; w.who.walk = (w.who.walk || 0) + dt * (w.who === player ? 11 : 9);
    if (d <= sp){ w.who.x = t.x; w.who.y = t.y; w.pts.shift(); if (!w.pts.length){ w.pts = [t]; cutArrive(w); } }
    else { w.who.x += dx / d * sp; w.who.y += dy / d * sp; w.who.face = { x:dx / d, y:dy / d }; }
  }
  CUT.walks = CUT.walks.filter(w => !w.done);
}
/* keys during a cutscene (ui/keyboard.js): true = swallowed. Esc skips; an allowed key goes on as usual. */
function cutsceneKey(k){
  if (k === 'escape'){ if (!CUT.quiet) cutsceneSkip(); return true; }
  if (CUT.reading && (k === ' ' || k === 'enter' || k === 'e')){ cutsceneContinue(); return true; }   // (the reader goes on)
  return !CUT.keys.has(k);
}
/* a tap during a cutscene (world/update.js): only when E is allowed, and only on what E would do right now */
function cutsceneTap(e){
  if (CUT.reading){ cutsceneContinue(); return; }                  // (a tap on the stage goes on, like the prompt)
  if (!CUT.keys.has('e')) return;
  const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W + cam.x, y = (e.clientY - r.top) / r.height * H + cam.y;
  const l = nearLandmark();
  if (l && (l.hit ? x >= l.hit.x - 10 && x <= l.hit.x + l.hit.w + 10 && y >= l.hit.y - 10 && y <= l.hit.y + l.hit.h + 10 : Math.hypot(l.x - x, l.y - y) < 60)){ enterDoor(l); return; }
  const n = nearestNpc(); if (n && Math.hypot(n.x - x, n.y - y) < 34){ openConvo(n); return; }
}
/* a small "Esc · skip" chip on the stage while a (non-quiet) cutscene runs */
function cutChip(){
  let el = $('#cutChip');
  if (!el){ el = document.createElement('div'); el.id = 'cutChip'; el.setAttribute('aria-hidden', 'true'); el.innerHTML = '<kbd>Esc</kbd> skip'; $('#stage').appendChild(el); }
  el.hidden = !(CUT.on && !CUT.quiet);
}
/* loading a save that was in a cutscene: control goes back to the player; a lesson may start it again */
function cutsceneRestore(){
  if (!S.cut) return;
  const c = S.cut; delete S.cut;
  CUT.resumed = { ...c, handled:false };
  setTimeout(() => { CUT.resumed.handled = !!askHooks('cutsceneResume', c); }, 0);
}
function cutsceneDbg(){
  return { on:CUT.on, id:CUT.id, step:CUT.step, kind:CUT.kind, keys:[...CUT.keys], guide:cutsceneGuide(), skip:CUT.skip, quiet:CUT.quiet,
    reading:CUT.on && CUT.reading, unread:CUT.unread, reads:CUT.reads, auto:!!window.__debug.autoCutscene, prompt:!!$('#cutRead') && !$('#cutRead').hidden,
    walking:CUT.walks.filter(w => !w.done).map(w => w.who === player ? 'player' : w.who.id), saved:S.cut ? { ...S.cut } : null, resumed:CUT.resumed, last:CUT.last };
}
/* for tests: __debug.cutscene(steps, opts) starts one; its result lands in window.__cutRes */
Object.assign(window.__debug, { cutscene(steps, opts){ window.__cutRes = null; cutscene(steps, opts).then(r => { window.__cutRes = r; }); } });
