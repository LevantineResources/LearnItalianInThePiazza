/* Lesson 6. Lesson flow: start, opening beats, completion screen, and the skip used by the intro shortcuts. */

function startLesson6(){
  if (modalOpen) closeModal();
  S.lesson = 6; S.tut = 'l6-start'; S.l5follow = false; save(); lastGuide = '';
  travelTo('piazza', { x:700, y:400 }, 'Il pomeriggio', 'That afternoon');
  setTimeout(() => toast('<b>Lezione 6 · Il libro perduto</b> has started'), 1800);
}
/* Mark asks to borrow the handbook */
function markBorrows(){
  const say = (t, d = 0) => setTimeout(() => npcLine(fill(t), null, { english:true }), d);
  say("Emma's here! We're going to sit and have a coffee together.");
  say('Hey, can I borrow your handbook? I want to try ordering by myself for once.', 600);
  setTimeout(() => showChoices([{ label:'“Sure, here you go…”', primary:true, cls:'english', fn:() => {
    choices.hidden = true; meLine('Sure, here you go…', { english:true });
    sysLine('You reach into your bag… The handbook is gone! There is only one loose page, torn out, at the bottom of the bag.');
    npcLine("Uh oh. When did you last have it? … OK, plan B: could you order me a cappuccino and a pastry? Then we'll go and find your book.", null, { english:true });
    enqueue(() => { S.handbookLost = true; setTut('l6-order'); toast('Your handbook is missing! You still have <b>one loose page</b> and your <b>dictionary</b>.'); });
    showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  }}]), 1200);
}

function openComplete6(){
  openModal('');
  const L = S.l6, pct = L.lines ? Math.round(L.clean / L.lines * 100) : 0;
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione 6 completata!</em></h2><p class="sub">Il libro perduto · The lost handbook</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>No tiles, no handbook. You ordered for Mark, asked four different people about your book using <b>tu</b> and <b>Lei</b> correctly, chatted politely with a stranger, and got your handbook back by introducing him to the English teacher he had always wanted: Mark.</p>
      <h3>Your independence</h3>
      <div class="stats">
        <div><b>${pct}%</b><span>sentences right on the first try</span></div>
        <div><b>${L.lines}</b><span>sentences typed in Italian</span></div>
        <div><b>${L.models}</b><span>times you needed the answer shown</span></div>
      </div>
      <div class="next"><p class="kicker">Next</p><p>Your handbook is back and the tiles return. Bruno and Mark have started an Italian–English exchange at Bar Centrale.</p></div>
      <div class="cta"><button class="btn${hookFor(7) ? '' : ' primary'}" data-close>Keep exploring</button>${hookFor(7) ? '<button class="btn primary" id="goL7">Start Lezione 7</button>' : ''}</div>
    </div>`;
  if (hookFor(7)) $('#goL7').onclick = () => hookFor(7).start();
}

/* used by the skip-ahead buttons for Lesson 7+: the state at the end of Lesson 6 */
function skipL6(){
  Object.assign(S, { lesson:6, vocab6:true, practiceDone6:true, tut:'l6-done', scene:'piazza', l5follow:false, handbookLost:false, brunoFollow:false });
  S.l6 = Object.assign(FRESH().l6, { orderDone:true, order:['cappuccino','cornetto'], steps:Object.fromEntries(Object.entries(TYPED_SCRIPTS).map(([k, v]) => [k, v.steps.length])) });
  ['bruno','enzo','chiara','rosa','lucia','mark'].forEach(id => { S.met[id] = true; S.known[id] = true; });
  PX[6].i = LESSONS[5].exercises.length;
}
