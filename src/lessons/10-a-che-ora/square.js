/* Lesson 10 · A che ora? The museum square (scene 'museo', world/museo.js): Bruno on the bench, his permesso lesson and
   his demonstration on the teacher (crowdStepAside(…, { by:'bruno' })), the crowd while the lesson is on, Vedo, vedo
   (openISpy, ui/ispy.js) with the clock tower kept in step (the clock hook reads S.l10.clock), Andiamo! and the doors.
   Design: docs/lessons/10-a-che-ora.md. */

let l10Walking = null, l10Pending = null;            // l10Walking: the id of someone walking (place() leaves them be)
const L10_DOORS_SPOT = { x:326, y:212 };              // where Bruno waits for you by the museum doors

/* Bruno: on the bench (MUSEO.seat), or where he stopped (S.l10.brunoAt) */
function l10PlaceBruno(){
  const b = NPC.bruno;
  if (l10Walking === 'bruno') return;
  const at = S.l10.brunoAt || MUSEO.seat;
  b.x = at.x; b.y = at.y; b.baseFace = S.l10.brunoAt ? { x:0.6, y:-0.8 } : { x:0.4, y:-1 };
}
/* someone walks along pts (no pathfinding: short, clear stretches), then cb() */
function l10Walk(n, pts, cb){
  pts = pts.map(p => ({ x:p.x, y:p.y }));
  l10Walking = n.id;
  let last = performance.now();
  const end = () => { n.moving = false; l10Walking = null; if (cb) cb(); };
  const tick = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (S.scene !== 'museo' || S.lesson !== 10){ const p = pts[pts.length - 1]; if (p){ n.x = p.x; n.y = p.y; } end(); return; }
    if (!pts.length){ end(); return; }
    const t = pts[0], dx = t.x - n.x, dy = t.y - n.y, d = Math.hypot(dx, dy), sp = (RM ? 400 : 120) * dt;
    n.moving = true; n.walk = (n.walk || 0) + dt * 10;
    if (d <= sp){ n.x = t.x; n.y = t.y; pts.shift(); }
    else { n.x += dx / d * sp; n.y += dy / d * sp; n.face = { x:dx / d, y:dy / d }; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* arriving: Bruno waves from the bench */
function l10Arrive(){
  if (S.lesson !== 10 || S.tut !== 'l10-crowd' || S.scene !== 'museo' || !S.l10 || S.l10.taught) return;
  worldSay('bruno', `${S.playerName}! ${S.playerName}!`, { ms:2400 });
  toast('Someone on the bench is waving at you. It\'s <b>Bruno</b>!');
}

/* ---------- Bruno's conversations (English and Italian; he is learning English from your old handbook) ---------- */
function l10BrunoTalk(){
  const L = S.l10, it = (i, e) => npcLine(fill(i), fill(e)), en = t => npcLine(fill(t), null, { english:true });
  const leave = () => showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  convo.mode = 'cutscene'; convo.known = true;
  $('#dlgWho').innerHTML = '<b>Bruno</b> <span class="where">· a bench by the museum</span>';
  const t = S.tut;
  if (t === 'l10-crowd' && !L.taught){
    it('Buongiorno, {Me}! Il museo, eh?', 'Good afternoon, {Me}! The museum, eh?');
    en("Look at this crowd! You'll never get through like that.");
    en('Say “permesso”: it means “may I pass”. Not “scusi”: that only makes people turn round.');
    showChoices([{ label:'“Show me!”', primary:true, cls:'english', fn:() => {
      choices.hidden = true; meLine('Show me!', { english:true });
      L.taught = true; save();
      en('Watch me.');
      showChoices([{ label:'Watch Bruno', primary:true, fn:closeDialog }]);
    } }]);
    return true;
  }
  if (t === 'l10-crowd'){ en(L.demo ? 'Go on! Walk up to someone in your way, and say the word I taught you.' : 'Watch!'); leave(); return true; }
  if (t === 'l10-booth'){ en('You made it through! Now the ticket. The window is right there.'); leave(); return true; }
  if (['l10-handbook', 'l10-vocab', 'l10-practice'].includes(t)){ en("Times, eh? Have a look at your handbook. I'm not going anywhere."); leave(); return true; }
  if (t === 'l10-ticket'){ en("Go on, get your ticket! I'll wait here."); leave(); return true; }
  if (t === 'l10-wait' || t === 'l10-ispy'){
    if (t === 'l10-wait'){
      it('Allora? Il biglietto?', 'So? The ticket?');
      en(`${l10WaitEn()} to kill${l10Slot() > 960 ? '! That\'s a long wait' : ''}. Let's play “Vedo, vedo”!`);
      en('I spy, Italian style. I say what I see, you find it. Ready?');
    } else en(`Shall we carry on? ${L.found} found, ${10 - L.found} to go.`);
    showChoices([{ label:t === 'l10-wait' ? '“Let\'s play!”' : '“Let\'s carry on!”', primary:true, cls:'english', fn:() => {
      choices.hidden = true; meLine(t === 'l10-wait' ? "Let's play!" : "Let's carry on!", { english:true });
      enqueue(() => { l10Pending = 'ispy'; closeDialog(); });
    } }, { label:'Not yet', fn:closeDialog }]);
    return true;
  }
  if (t === 'l10-go'){ it(`${cap(l10NowIt(l10Slot()))}! Andiamo!`, `It's ${ispyTimeEn(l10Slot())}! Let's go!`); en('The doors! Show them your ticket.'); leave(); return true; }
  if (t === 'l10-done'){ it('Che bello, eh?', 'Lovely, eh?'); en('Leonardo! Caravaggio! I could stay here all day.'); leave(); return true; }
  it('Buongiorno, {Me}!', 'Good afternoon, {Me}!'); leave();
  return true;
}

/* the demonstration: Bruno walks over to the teacher and says it; she steps aside */
function l10BrunoDemo(){
  const L = S.l10, b = NPC.bruno, m = NPC.maestra;
  const done = () => { L.demo = true; save(); renderHUD(); };
  if (S.scene !== 'museo' || crowdMoved(m) || m.walkPath){ if (!crowdMoved(m)) crowdStepAside(m); done(); return; }
  const spot = { x:m.home.x - 62, y:m.home.y - 30 };
  l10Walk(b, [{ x:252, y:418 }, spot], () => {
    const d = Math.hypot(m.x - b.x, m.y - b.y) || 1; b.face = b.baseFace = { x:(m.x - b.x) / d, y:(m.y - b.y) / d };
    crowdStepAside(m, { by:'bruno' });
    setTimeout(() => { if (S.scene === 'museo') toast('Bruno: “See? Easy! Now you try. The ticket booth is behind them.”'); }, 2400);
    setTimeout(() => l10Walk(b, [{ x:252, y:418 }, { x:MUSEO.seat.x, y:MUSEO.seat.y }], done), 2900);
  });
}

/* ---------- the crowd (hooks: world/museo.js) ---------- */
const l10BayOpen = () => !!(S.crowd && S.crowd.turista4 && ['turista1', 'turista2', 'turista3'].some(id => S.crowd[id]));
function l10OnCrowd(n, choice){
  if (S.lesson !== 10 || !S.l10 || !choice) return false;
  S.l10[choice] = (S.l10[choice] || 0) + 1; save();
  return false;                                   // the default reaction (Permesso!, Sì?, ?) and its hints
}
function l10CrowdHint(n, kind){
  if (S.lesson !== 10 || !S.l10) return null;
  if (kind === null) return 'Visitors waiting for the museum, and nobody turns round. <b>Bruno</b> is waving at you from the bench.';
  if (kind === 'scusi') return '<i>Scusi</i> gets someone’s attention. To get past, use the word Bruno taught you.';
  if (kind === 'prego') return '<i>Prego</i> is what <i>they</i> say back.';
  return null;
}
function l10CrowdMoved(){
  if (S.lesson !== 10 || !S.l10 || S.tut !== 'l10-crowd' || !l10BayOpen()) return;
  setTut('l10-booth');
  toast('The way to the window is clear. Now: a ticket!');
}

/* ---------- Vedo, vedo ---------- */
function l10PlayISpy(){
  const L = S.l10, slot = l10Slot();
  if (S.tut === 'l10-wait') setTut('l10-ispy');
  openISpy({
    finds:10, start:{ h:15, m:0 }, step:(slot - L10_NOW) / 10, timeAsks:['15:15', '15:30', '15:45'], bonus:true, seed:L.seed, found:L.found,
    kicker:'Lezione 10 · Vedo, vedo', doneLabel:'Andiamo!',
    endLine:{ it:`${cap(l10NowIt(slot))}! Andiamo!`, en:`It's ${ispyTimeEn(slot)}! Let's go!` },
    onFind(k){ L.found = k; save(); renderHUD(); },
    onClock(c){ L.clock = { h:c.h, m:c.m }; save(); },
    onTimeAnswer(a){
      L.time.answers.push({ asked:l10HHMM(a.asked.h * 60 + a.asked.m), said:a.said, ok:a.ok, skipped:!!a.skipped });
      if (a.ok) L.time.right++; else if (!a.skipped) L.time.wrong++;
      save();
    },
    onDone(r){ L.ispyDone = true; L.result = JSON.parse(JSON.stringify(r)); L.clock = { h:Math.floor(slot / 60), m:slot % 60 }; save(); },
    onClose(){
      if (L.ispyDone){ setTimeout(l10Andiamo, 300); return; }
      renderHUD();
      toast('Bruno: “Come back to the bench when you want to carry on!”');
    },
  });
}
/* the game is over, the clock says the time on the ticket: to the doors */
function l10Andiamo(){
  if (S.lesson !== 10 || !S.l10 || S.tut === 'l10-done') return;
  setTut('l10-go');
  const b = NPC.bruno;
  worldSay('bruno', 'Andiamo!', { ms:2200 });
  if (S.scene === 'museo') l10Walk(b, [{ x:252, y:418 }, { x:326, y:300 }, L10_DOORS_SPOT], () => { S.l10.brunoAt = { ...L10_DOORS_SPOT }; save(); renderHUD(); });
  else S.l10.brunoAt = { ...L10_DOORS_SPOT };
  save();
}

/* ---------- the museum doors ---------- */
function l10Door(d){
  if (d.id !== 'museo' || S.lesson !== 10 || !S.l10) return false;
  if (S.tut === 'l10-go'){ l10GoIn(); return true; }
  if (S.tut === 'l10-done') return false;           // lesson over: the doors lead inside (world/doors.js → the galleria)
  if (S.l10.ticket){
    const c = museoClock();
    toast(`Your ticket says <b>${l10HHMM(l10Slot())}</b>, and the clock on the tower says ${c.h}:${String(c.m).padStart(2, '0')}. Bruno is waiting for you on the bench.`);
    return true;
  }
  return false;                                   // the neutral "timed ticket only" text
}
function l10GoIn(){
  S.l10.inside = true; save();
  worldSay('player', 'Ecco il biglietto!', { ms:1600 });
  setTimeout(() => {
    const f = $('#fade');
    $('#fadeTitle').textContent = "Museo d'Arte"; $('#fadeSub').textContent = 'I Capolavori · ' + l10HHMM(l10Slot());
    traveling = true; f.classList.add('on');
    setTimeout(() => {
      setTut('l10-done');
      f.classList.remove('on'); traveling = false;
      setTimeout(openComplete10, 500);
    }, RM ? 300 : 1600);
  }, 1300);
}

/* closeDialog: Bruno's demonstration, the game, the ticket bought */
function l10OnClose(closedId){
  if (S.lesson !== 10 || !S.l10) return false;
  const p = l10Pending; l10Pending = null;
  if (closedId === 'bruno' && S.l10.taught && !S.l10.demo && l10Walking !== 'bruno'){ setTimeout(l10BrunoDemo, 300); return true; }
  if (closedId === 'bruno' && p === 'ispy'){ setTimeout(l10PlayISpy, 200); return true; }
  if (closedId === 'cassiera' && S.l10.ticket && S.tut === 'l10-ticket'){
    setTut('l10-wait');
    toast(`Ticket in hand: entry at <b>${l10HHMM(l10Slot())}</b>. Bruno is on the bench.`);
    return true;
  }
  return false;
}
