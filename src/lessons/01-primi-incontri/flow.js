/* Lesson 1. Lesson flow: start, opening beats, completion screen, and the skip used by the intro shortcuts. */

function openComplete1(){
  openModal('');
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione 1 completata!</em></h2><p class="sub">Primi incontri · First meetings</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>You can greet people, ask how they are and introduce yourself in Italian. Your new friends will use your name, and their names now float above them in the piazza.</p>
      <h3>People you know</h3>
      <div class="dict people">${L1_PEOPLE.map(n => `<div class="entry"><div><div class="w">${esc(n.name)}</div><div class="g">${esc(n.where)}</div></div></div>`).join('')}</div>
      <h3>Your numbers</h3>${statsBlock([metCount(), 'names learned'])}
      <div class="next"><p class="kicker">Next lesson</p><p><b>Lezione 2 · Al bar.</b> Order a coffee and a pastry at Bar Centrale, and learn when not to say <i>ciao</i>.</p></div>
      <div class="cta"><button class="btn" data-close>Keep exploring</button><button class="btn primary" id="goL2">Start Lezione 2</button></div>
    </div>`;
  $('#goL2').onclick = startLesson2;
}
function skipL1(){
  Object.assign(S, { vocab:true, practiceDone:true, handbookOpened:true, tut:'done' });
  L1_PEOPLE.forEach(n => { S.met[n.id] = true; S.known[n.id] = true; });
  PX[1].i = LESSONS[0].exercises.length;
}
