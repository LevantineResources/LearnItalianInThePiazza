/* Lesson 9 · Sofia, and the dictated route. When the shopping is done, Sofia (a visitor from Milan, with a backpack)
   walks up to you at the market, introduces herself (Lei: buongiorno, mi chiamo…) and asks the way to San Lorenzo.
   The city map opens inside the conversation (world/map.js, the dictated map): every sentence you say moves her figure
   along the streets. Impossible steps (the river, the map's edge) are drawn red and taken back; "No, scusi" or the
   Cancella button undo the last step. Any route that reaches San Lorenzo is right: then "San Lorenzo è lì." */

let l9SofiaWalking = false;
const l9Sofia = () => S.l9.sofia || (S.l9.sofia = { phase:'intro' });

/* her opening depends on how far you got (a getter: the conversation can be left and picked up again) */
{
  const op = () => {
    const ph = S.lesson === 9 && S.l9 && S.l9.sofia ? S.l9.sofia.phase : 'intro';
    if (ph === 'origin') return { it:'Allora… Lei è di Padova?', en:'So… are you from Padua?' };
    if (ph === 'dir') return { it:'Allora, San Lorenzo? Come si arriva?', en:'So, San Lorenzo? How do I get there?' };
    if (ph === 'far') return { it:'Perfetto! È lontano?', en:'Perfect! Is it far?' };
    return { it:'Scusi! Buongiorno. Mi chiamo Sofia, sono di Milano.', en:"Excuse me! Good morning. My name is Sofia, I'm from Milan." };
  };
  ['opening', 'revisitOpening'].forEach(k => Object.defineProperty(NPC.sofia, k, { configurable:true, enumerable:true, get:op }));
}

/* ---------- she walks up to you (from the market's exit) ---------- */
function l9SofiaSpot(){
  const tries = [[0, 54], [-54, 30], [54, 30], [-62, 0], [62, 0], [-44, -40], [44, -40], [0, -54]];
  for (const [dx, dy] of tries){
    const x = player.x + dx, y = player.y + dy;
    if (!blocked(x, y, 16, true) && activeNpcs().every(n => n.id === 'sofia' || Math.hypot(n.x - x, n.y - y) > 44)) return { x, y };
  }
  return { x:480, y:470 };
}
function l9SofiaArrives(){
  const so = NPC.sofia;
  if (S.lesson !== 9 || S.tut !== 'l9-sofia' || S.scene !== 'mercato' || S.l9.sofiaPos){ if (!S.l9.sofiaPos){ S.l9.sofiaPos = { x:480, y:470 }; save(); renderHUD(); } return; }
  const spot = l9SofiaSpot();
  so.x = 480; so.y = 582; l9SofiaWalking = true;
  const pts = findPath(480, 560, spot.x, spot.y) || [];
  pts.unshift({ x:480, y:560 }); if (!pts.length || Math.hypot(pts[pts.length - 1].x - spot.x, pts[pts.length - 1].y - spot.y) > 4) pts.push(spot);
  renderHUD();
  let last = performance.now();
  const done = () => {
    l9SofiaWalking = false; so.moving = false;
    S.l9.sofiaPos = { x:Math.round(so.x), y:Math.round(so.y) }; save();
    const d = Math.hypot(player.x - so.x, player.y - so.y) || 1;
    so.baseFace = { x:(player.x - so.x) / d, y:(player.y - so.y) / d };
    renderHUD();
    if (S.tut === 'l9-sofia' && !frozen() && S.scene === 'mercato' && d < 170) openConvo(so);
  };
  const tick = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (S.lesson !== 9 || S.tut !== 'l9-sofia' || S.scene !== 'mercato'){ done(); return; }
    if (!frozen() && pts.length){
      const tg = pts[0], dx = tg.x - so.x, dy = tg.y - so.y, d = Math.hypot(dx, dy), sp = 125 * dt;
      if (d <= sp){ so.x = tg.x; so.y = tg.y; pts.shift(); }
      else { so.x += dx / d * sp; so.y += dy / d * sp; so.baseFace = { x:dx / d, y:dy / d }; }
      so.moving = true; so.walk = (so.walk || 0) + dt * 10;
    } else so.moving = false;
    if (!pts.length){ done(); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- the conversation ---------- */
function l9SofiaTalk(npc){
  const so = l9Sofia();
  if (S.tut === 'l9-done' || so.phase === 'bye'){
    convo.mode = 'cutscene'; convo.known = true;
    npcLine(fill('Grazie ancora, {Me}! Vado a San Lorenzo. Arrivederci!'), fill("Thanks again, {Me}! I'm off to San Lorenzo. Goodbye!"));
    showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
    return true;
  }
  if (!S.met.sofia){ S.met.sofia = S.known.sofia = true; save(); renderHUD(); }
  convo.known = true;
  $('#dlgWho').innerHTML = `<b>Sofia</b> <span class="where">· ${esc(npc.where)}</span>`;
  if (so.phase === 'dir' || so.phase === 'far') l9MountMap();
  if (so.phase === 'intro') setTimeout(() => { if (convo && convo.npc === npc) showHint('A stranger, so be polite (Lei). Greet her and introduce yourself.'); }, 300);
  return false;
}
function l9SofiaBank(groups){
  const ph = l9Sofia().phase;
  if (ph === 'dir' || ph === 'far') groups.unshift({ label:'Indicazioni', tiles:L9_DIR.map(phraseTile) });
  groups.push({ label:'Polite', tiles:[...L9_SOFIA_TILES, ...L7_POLITE.filter(t => t.key !== 'sì')].map(phraseTile) });
  return groups;
}
function l9MountMap(){
  mapDictStart({ ...L9_MAP, areaLabel:'San Lorenzo', steps:S.l9.route });
  mountDictMap({ title:'Your directions for Sofia', undo:l9Cancel });
  mapDictNote(S.l9.route.length ? `${S.l9.route.length} ${S.l9.route.length === 1 ? 'step' : 'steps'} so far.` : 'Sofia starts at the market (the little figure). San Lorenzo is in the red circle.');
}
function l9SyncRoute(){ S.l9.route = mapDictState().steps; save(); }
/* the Cancella button: take the last step back (Sofia doesn't hear it) */
function l9Cancel(){
  if (!convo || convo.npc !== NPC.sofia) return;
  const u = mapUndo();
  if (u){ S.l9.undos++; l9SyncRoute(); }
  mapDictNote(u ? `↶ Taken back: <i>${esc(l9OpIt(u.op))}</i>` : 'Nothing to take back: Sofia is still at the market.');
}

/* ---------- directions: intents → map steps ---------- */
const L9_LM = { farmacia:['alla farmacia', 'la farmacia', 'pharmacy'], chiesa:['alla chiesa', 'la chiesa', 'church'], banca:['alla banca', 'la banca', 'bank'],
  ospedale:["all'ospedale", "l'ospedale", 'hospital'], basilica:['alla basilica', 'la basilica', 'basilica'], mercato:['al mercato', 'il mercato', 'market'], stazione:['alla stazione', 'la stazione', 'station'] };
const L9_NTH = ['', 'prima', 'seconda', 'terza'], L9_NTH_EN = ['', 'first', 'second', 'third'];
/* the clauses of a sentence (split at poi / e, or when a new instruction can't belong to the current one) → ops */
function l9Ops(ints){
  const R = { ops:[], tu:false, there:false, notfar:false, undo:false, yes:false, no:false, dontknow:false, far:false };
  const clauses = []; let c = null;
  const cur = () => c || (c = {});
  const flush = () => { if (c) clauses.push(c); c = null; };
  for (const id of ints){
    let m;
    if (id === 'd9:then' || id === 'and'){ flush(); continue; }
    if ((m = id.match(/^d9:(straight|always)(:tu)?$/)) || id === 'confirm:straight'){
      if (m && m[2]) R.tu = true;
      if (c && (c.move || c.lm)) flush();
      cur().move = m ? m[1] : 'straight'; continue;
    }
    const t = id.match(/^d9:turn:(L|R)(:tu)?$/), cf = id.match(/^confirm:(right|left)$/);
    if (t || cf){
      if (t && t[2]) R.tu = true;
      if (c && (c.turn || c.move || c.lm)) flush();
      cur().turn = t ? t[1] : cf[1] === 'right' ? 'R' : 'L'; continue;
    }
    if ((m = id.match(/^d9:nth:(\d)$/))){
      if (c && (c.nth || c.lm || c.turn)) flush();
      if (c && c.move) delete c.move;                     // "vada dritto e alla prima strada…": the street is where it ends
      cur().nth = +m[1]; continue;
    }
    if ((m = id.match(/^d9:(?:until|at):(\w+)$/))){ if (c && c.lm) flush(); cur().lm = m[1]; continue; }
    if (id === 'd9:there') R.there = true; else if (id === 'd9:notfar') R.notfar = true; else if (id === 'd9:undo') R.undo = true;
    else if (id === 'yes') R.yes = true; else if (id === 'no') R.no = true; else if (id === 'dontknow') R.dontknow = true; else if (id === 'far') R.far = true;
  }
  flush();
  clauses.forEach(c => {
    const later = c.lm ? { k:'until', lm:c.lm } : c.move === 'always' ? { k:'straightUntil' } : null;
    if (c.turn){
      R.ops.push(c.nth ? { k:'nth', n:c.nth, dir:c.turn, move:!later } : { k:'turn', dir:c.turn, move:!later });
      if (later) R.ops.push(later); else if (c.move === 'straight') R.ops.push({ k:'straight' });
    } else if (c.nth){ R.ops.push({ k:'nth', n:c.nth }); if (later) R.ops.push(later); }
    else if (later) R.ops.push(later);
    else if (c.move === 'straight') R.ops.push({ k:'straight' });
  });
  /* "Vada sempre dritto e alla prima strada giri a sinistra": going straight is how you get to that street */
  R.ops = R.ops.filter((op, i, A) => !((op.k === 'straight' || op.k === 'straightUntil') && A[i + 1] && A[i + 1].k === 'nth'));
  return R;
}
/* a step, as you would say it (the completion screen, the map's status line) */
function l9OpIt(op){
  const dir = op.dir === 'R' ? 'a destra' : 'a sinistra';
  if (op.k === 'straight') return 'Vada dritto.';
  if (op.k === 'straightUntil') return 'Vada sempre dritto.';
  if (op.k === 'turn') return `Giri ${dir}.`;
  if (op.k === 'nth') return op.dir ? `Alla ${L9_NTH[op.n]} strada giri ${dir}.` : `Vada dritto fino alla ${L9_NTH[op.n]} strada.`;
  if (op.k === 'until') return `Vada dritto fino ${L9_LM[op.lm][0]}.`;
  return '';
}
/* a step in English, for the hint after three impossible steps (the Italian is the player's job) */
function l9OpEn(op){
  const dir = op.dir === 'R' ? 'right' : 'left';
  if (op.k === 'straight') return 'go straight on to the next crossroads';
  if (op.k === 'straightUntil') return 'keep going straight on';
  if (op.k === 'turn') return `turn ${dir}`;
  if (op.k === 'nth') return op.dir ? `take the ${L9_NTH_EN[op.n]} street on the ${dir}` : `go on to the ${L9_NTH_EN[op.n]} street`;
  if (op.k === 'until') return `go as far as the ${L9_LM[op.lm][2]}`;
  return '';
}
/* what Sofia says back for a step she understood (so you hear that she got it) */
function l9OpEcho(op, r){
  const dir = op.dir === 'R' ? ['a destra', 'right'] : ['a sinistra', 'left'];
  if (op.k === 'straight') return ['dritto', 'straight on'];
  if (op.k === 'straightUntil'){
    const st = r.stop || '';
    if (st.startsWith('landmark:')){ const lm = L9_LM[st.slice(9)]; return [`sempre dritto, fino ${lm[0]}`, `straight on, as far as the ${lm[2]}`]; }
    return st === 'river' ? ['sempre dritto, fino al fiume', 'straight on, as far as the river'] : ['sempre dritto, fino in fondo', 'straight on, to the end'];
  }
  if (op.k === 'turn') return [dir[0], dir[1]];
  if (op.k === 'nth') return op.dir ? [`alla ${L9_NTH[op.n]} strada ${dir[0]}`, `${dir[1]} at the ${L9_NTH_EN[op.n]} street`] : [`fino alla ${L9_NTH[op.n]} strada`, `to the ${L9_NTH_EN[op.n]} street`];
  if (op.k === 'until') return [`fino ${L9_LM[op.lm][0]}`, `as far as the ${L9_LM[op.lm][2]}`];
  return ['', ''];
}
const L9_FAIL = {
  river:{ it:"Lì c'è il fiume!", en:"There's the river there!", hint:'Look at the red line on the map: that way is blocked. The river can only be crossed on a bridge. Try another way.' },
  edge:{ it:"Lì non c'è una strada!", en:"There's no street there!", hint:"That's the edge of the map: no street that way. Look where the figure is facing, and try another way." },
};

function l9SofiaReact(id, n, st, add, out, ints){
  if (out.l9s) return true;                              // the whole sentence is handled once
  out.l9s = true; out.asked = true;
  const so = l9Sofia(), L = S.l9, has = x => ints.includes(x);
  const say = (it, en) => add(it, en, { rate:0.8 });
  const hint = (h, label) => { if (!out.l9hint) out.l9hint = { h, label:label || 'Suggerimento' }; };
  if (so.phase === 'intro'){
    /* she answers what you said: a greeting, Come sta?, Piacere, your name (Lei: she is a stranger) */
    const pre = [has('greet') ? ['Buongiorno! ', 'Good morning! '] : null, has('ask_how') ? ['Bene, grazie! ', 'Fine, thanks! '] : null].filter(Boolean);
    const p0 = pre.map(x => x[0]).join(''), p1 = pre.map(x => x[1]).join('');
    if (has('give_name')){
      so.phase = 'origin'; save();
      say(`${p0}Piacere, {Me}! Lei è di Padova?`, `${p1}Nice to meet you, {Me}! Are you from Padua?`);
      hint('Answer her question: a simple yes or no is enough.');
    } else if (has('ask_name')){ say(`${p0}Sofia! Mi chiamo Sofia. E Lei, come si chiama?`, `${p1}Sofia! My name is Sofia. And you, what's your name?`); hint('Answer her question.'); }
    else if (has('nice')){ say(`${p0}Piacere! E Lei, come si chiama?`, `${p1}Nice to meet you! And you, what's your name?`); hint('Answer her question.'); }
    else if (pre.length){ say(`${p0}E Lei, come si chiama?`, `${p1}And you, what's your name?`); hint('Answer her question.'); }
    else if (has('thanks') || has('bye')){ say('Ah… scusi, un momento! Mi chiamo Sofia. E Lei?', "Oh… excuse me, just a moment! My name is Sofia. And you?"); hint('She wants to talk to you. Greet her and introduce yourself.'); }
    else { say('Scusi? … Mi chiamo Sofia. E Lei?', 'Sorry? … My name is Sofia. And you?'); hint('Greet her and introduce yourself, politely.'); }
    return true;
  }
  if (so.phase === 'origin'){
    so.phase = 'dir'; save();
    const a = has('yes') || has('origin') && !has('no') ? ['Ah, di Padova! Che bello! ', 'Ah, from Padua! How lovely! ']
      : has('no') ? ['Ah, no? Anche Lei in visita, allora! ', "Oh, no? You're visiting too, then! "]
      : has('ask_how') ? ['Bene, grazie! ', 'Fine, thanks! '] : ['Ah! ', 'Ah! '];
    say(`${a[0]}Senta… sa come si arriva a San Lorenzo? Il quartiere, sa?`, `${a[1]}Listen… do you know how to get to San Lorenzo? The neighbourhood, you know?`);
    out.l9mapOpen = true;
    return true;
  }
  if (so.phase === 'far' || so.phase === 'bye'){
    so.phase = 'bye'; L.done = true; save();
    const a = has('d9:notfar') || has('no') ? ['Ah, bene! ', 'Oh, good! '] : has('far') || has('yes') ? ['Ah, va bene, cammino! ', "Oh, all right, I'll walk! "] : ['', ''];
    say(`${a[0]}Grazie mille! Lei è molto gentile. Arrivederci!`, `${a[1]}Thank you so much! You're very kind. Goodbye!`);
    out.end = true;
    return true;
  }
  /* the directions */
  const D = l9Ops(ints), text = convo.lastUsed ? formatSentence(convo.lastUsed.flatMap(t => t.tokens || [t])) : '';
  const it = [], en = [];
  let undone = null, fail = null, last = null;
  const echo = [];
  if (D.undo){
    undone = mapUndo();
    if (undone){ L.undos++; it.push('Ah, no? Va bene: torno indietro.'); en.push("Oh, no? All right: I'll go back."); }
    else if (!D.ops.length){ it.push('Indietro? Ma sono ancora al mercato!'); en.push("Back? But I'm still at the market!"); }
  }
  for (const op of D.ops){
    const r = mapStep(op);
    if (!r.ok){ fail = r; break; }
    last = r; echo.push(l9OpEcho(op, r));
  }
  if (echo.length){ it.push(cap(echo.map(e => e[0]).join(', poi ')) + '… va bene!'); en.push(cap(echo.map(e => e[1]).join(', then ')) + '… all right!'); }
  if (fail){
    L.bad++;
    if (fail.reason === 'nolandmark'){ const lm = L9_LM[fail.op.lm]; it.push(`Ma… di lì non vedo ${lm[1]}!`); en.push(`But… I can't see the ${lm[2]} that way!`); }
    else { const F = L9_FAIL[fail.reason] || L9_FAIL.edge; it.push(F.it); en.push(F.en); }
  }
  l9SyncRoute();
  /* the map shows it at once: the route grows as you speak */
  const steps = MAPD.steps.length;
  if (fail) mapDictNote(`✗ <i>${esc(text)}</i> ${fail.reason === 'river' ? 'The river!' : fail.reason === 'nolandmark' ? `No ${L9_LM[fail.op.lm][2]} that way.` : 'No street there.'} Taken back.`, 'bad');
  else if (echo.length) mapDictNote(mapArrived() ? `<b>${steps}</b> <i>${esc(text)}</i> San Lorenzo!` : `<b>${steps}</b> <i>${esc(text)}</i>`, mapArrived() ? 'good' : '');
  else if (undone) mapDictNote(`↶ Taken back: <i>${esc(l9OpIt(undone.op))}</i>`);
  else renderDictMap();
  if (D.tu) hint('Sofia is a stranger: <b>Vada</b>, <b>Giri</b> (Lei), not vai, gira. She understood you anyway.', 'Consiglio');
  if (fail){
    if (L.bad >= 3){ const nx = mapHintStep(); hint(`${fail.reason === 'river' ? 'The river again! ' : ''}Try this next step: <b>${nx ? l9OpEn(nx) : 'turn around'}</b>.`); }
    else if (fail.reason === 'nolandmark') hint(`There is no ${L9_LM[fail.op.lm][2]} along that street. Look at the map: where is the next one?`);
    else hint(L9_FAIL[fail.reason] ? L9_FAIL[fail.reason].hint : L9_FAIL.edge.hint);
  }
  if (D.there && !fail){
    if (mapArrived()){ so.phase = 'far'; save(); it.push('Perfetto! È lontano?'); en.push('Perfect! Is it far?'); hint('Answer her question. Your route on the map shows the answer.'); }
    else { it.push('Lì? Ma… non è San Lorenzo, no?'); en.push("There? But… that isn't San Lorenzo, is it?"); hint('Her figure isn\'t in San Lorenzo yet (the red circle on the map). Keep giving her directions.'); }
  } else if (last && last.arrived && !fail) hint('Sofia is in San Lorenzo now! Tell her that is the place.', 'Fatto!');
  if (!it.length){
    /* no step: answer what was said, then ask again */
    if (D.notfar){ it.push('Bene! Ma… come si arriva?'); en.push("Good! But… how do I get there?"); }
    else if (D.yes){ it.push('Perfetto! Mi dica.'); en.push('Perfect! Tell me.'); }
    else if (D.dontknow || D.no){ it.push('No? Ma… Lei ha una mappa!'); en.push("No? But… you've got a map!"); }
    else if (has('ask_how')){ it.push('Bene, grazie! Allora… come si arriva a San Lorenzo?'); en.push('Fine, thanks! So… how do I get to San Lorenzo?'); }
    else if (has('thanks') || has('bye')){ it.push('Ma… e San Lorenzo? Come si arriva?'); en.push('But… what about San Lorenzo? How do I get there?'); }
    else if (has('greet')){ it.push('Buongiorno! Allora… come si arriva a San Lorenzo?'); en.push('Good morning! So… how do I get to San Lorenzo?'); }
    else { it.push('Scusi? Come si arriva a San Lorenzo?'); en.push('Sorry? How do I get to San Lorenzo?'); }
    hint('Give her one step: look at the figure on the map and where it is facing. Your <b>Indicazioni</b> tiles have the directions.');
  }
  say(it.join(' '), en.join(' '));
  return true;
}

function l9SofiaAfter(n, out, res, words){
  if (out.l9mapOpen){
    enqueue(() => { if (!convo || convo.npc !== n) return; if (S.tut === 'l9-sofia') setTut('l9-directions'); l9MountMap(); renderBank(); });
    showHint('Tell her the way, <b>one step at a time</b>, and watch your route on the map. She starts at the market, facing the way you came in.', 'Indicazioni');
    return true;
  }
  if (out.end) return false;                             // "Grazie mille! Lei è molto gentile." → Leave
  if (out.l9hint){ showHint(out.l9hint.h, out.l9hint.label); return true; }
  if (words.includes('ciao') || words.includes('stai') || words.includes('scusa')){
    showHint('Sofia is a stranger: <b>Buongiorno</b>, <b>Come sta?</b>, <b>Scusi</b> (Lei).', 'Consiglio'); return true;
  }
  enqueue(() => { hintEl.hidden = true; });              // no stale hint ("Try this next step…") once the route has moved on
  return true;
}
/* the generic hint (after a sentence that made no sense): English; after three misses in a row only the key word(s) */
function l9SofiaHint(n, st){
  const ph = l9Sofia().phase;
  if (ph === 'intro') return { h:'Greet her and introduce yourself, politely (Lei).', m:l9Key('mi chiamo') };
  if (ph === 'origin') return { h:'Answer her question: yes or no is enough.', m:l9Key('sì / no') };
  if (ph === 'far' || ph === 'bye') return { h:'Answer her question: look at your route on the map.', m:l9Key('lontano') };
  if (mapArrived()) return { h:'Her figure is in San Lorenzo. Tell her that is the place.', m:l9Key('lì') };
  const nx = mapHintStep();
  return { h:'Give Sofia one step at a time, and watch the figure on the map.', m:l9Key(nx ? (nx.k === 'turn' ? (nx.dir === 'R' ? 'destra' : 'sinistra') : 'dritto') : 'dritto') };
}
