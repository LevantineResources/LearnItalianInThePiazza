/* Lesson 4. Lesson flow: start, opening beats, completion screen, and the skip used by the intro shortcuts. */

function startLesson4(){
  if (modalOpen) closeModal();
  S.lesson = 4; S.met.mark = true; S.known.mark = true; S.tut = 'l4-start'; S.l4 = freshL4(); save(); lastGuide = '';
  travelTo('aurora', SCENES.aurora.spawn, 'Caffè Aurora', 'A pranzo con Mark · Lunch with Mark');
  setTimeout(() => toast('<b>Lezione 4 · A pranzo</b> has started'), 1800);
}
function openComplete4(){
  openModal('');
  const L = S.l4;
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione 4 completata!</em></h2><p class="sub">A pranzo · Lunch, and ordering for a friend</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>You switched between <b>io</b> and <b>lui</b> (vorrei / vorrebbe, posso / può, mangio / mangia), asked <b>Avete …?</b>, explained what Mark can't eat, ordered for two, and understood the bill, coperto and all.</p>
      <h3>Lunch</h3>
      <div class="dict people">
        <div class="entry"><div><div class="w">Mark</div><div class="g">${esc(FOOD[L.him.dish || 'risotto'].label)} · ${esc(FOOD[L.him.drink || 'frizzante'].label)}</div></div></div>
        <div class="entry"><div><div class="w">${esc(S.playerName)}</div><div class="g">${esc(L.me.dish ? FOOD[L.me.dish].label : '')}${L.me.drink ? ' · ' + esc(FOOD[L.me.drink].label) : ''}</div></div></div>
      </div>
      <h3>Your numbers</h3>${statsBlock([billTotal() ? euroIt(billTotal()) : '—', 'lunch bill (Mark paid)'])}
      <div class="next"><p class="kicker">Next lesson</p><p><b>Lezione 5 · Ti presento…</b> Mark wants to see a Donatello. You'll ask the way and finally introduce him to people.</p></div>
      <div class="cta"><button class="btn" data-close>Keep exploring</button><button class="btn primary" id="goL5">Start Lezione 5</button></div>
    </div>`;
  $('#goL5').onclick = startLesson5;
}
function skipL4(){
  Object.assign(S, { lesson:4, vocab4:true, practiceDone4:true, tut:'l4-done', scene:'aurora' });
  S.l4 = Object.assign(freshL4(), { askedPizza:true, p1:true, himVeg:true, p2:true, him:{ dish:'risotto', drink:'frizzante' }, me:{ dish:'lasagna' }, drinkAsked:true, p3:true, served:true, billAsked:true, p4:true, p5:true, done:true });
  ['davide','mark'].forEach(id => { S.met[id] = true; S.known[id] = true; });
  PX[4].i = LESSONS[3].exercises.length;
}
