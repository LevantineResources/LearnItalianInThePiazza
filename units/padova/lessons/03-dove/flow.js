/* Lesson 3. Lesson flow: start, opening beats, completion screen, and the skip used by the intro shortcuts. */

function startLesson3(){
  if (modalOpen) closeModal();
  S.lesson = 3; S.phoneUnread = true; setTut('l3-text'); lastGuide = '';
  toast('<b>Lezione 3 · Dov\'è?</b> has started');
  setTimeout(() => toast('Your phone buzzes. A message from <b>Mark</b>, your friend from home.'), 900);
}

/* Lesson 3 opening beat: you can't ask the way in Italian yet. Until the Lesson 3 practice is done (l3-ask, l3-handbook,
   l3-practice) the English question is the only way to ask Chiara the way, so it stays on offer for the whole conversation:
   after her opening line, and again after every tile turn (a "come stai?" exchange first must not make it disappear). */
const L3_ASK_EN = ['l3-ask', 'l3-handbook', 'l3-practice'];
function l3AskInEnglish(n){ return !!n && n.id === 'chiara' && L3_ASK_EN.includes(S.tut); }
function l3OfferEnglishAsk(){ showChoices([{ label:'“Excuse me, where is Via dei Mille?”', cls:'english', fn:chiaraConfused }]); }
function chiaraConfused(){
  builder.hidden = true; choices.hidden = true; hintEl.hidden = true;
  meLine('Excuse me, where is Via dei Mille?', { english:true });
  convoBusy = true;
  setTimeout(() => {
    npcLine('Eh? Via… dei Mille? Scusa, non capisco…', "Huh? Via… dei Mille? Sorry, I don't understand…");
    setTimeout(() => {
      convoBusy = false;
      if (S.tut === 'l3-ask'){
        sysLine('Chiara caught the street name and nothing else, and you would never understand her answer anyway. Learn to ask the way in Italian: open your handbook to <b>Lezione 3 · Dov\'è?</b>');
        setTut('l3-handbook');
      } else sysLine('You still need the words. Finish <b>Lezione 3</b> in your handbook first.');
      showChoices([
        { label:'Leave', fn:closeDialog },
        { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(3); } },
      ]);
    }, 900);
  }, 650);
}

function openComplete3(){
  openModal('');
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione 3 completata!</em></h2><p class="sub">Dov'è? · Asking the way</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>You can stop someone politely, ask where a place is, understand <b>destra</b>, <b>sinistra</b> and <b>sempre dritto</b> in both the friendly and the polite form, follow directions on a map and in the street, and ask people to repeat.</p>
      <h3>Your numbers</h3>${statsBlock([2, 'neighbourhoods explored'])}
      <div class="next"><p class="kicker">Next lesson</p><p><b>Lezione 4 · A pranzo.</b> Lunch with Mark at Caffè Aurora. He speaks no Italian, so you order for both of you.</p></div>
      <div class="cta"><button class="btn" data-close>Keep exploring</button><button class="btn primary" id="goL4">Start Lezione 4</button></div>
    </div>`;
  $('#goL4').onclick = startLesson4;
}
function skipL3(){
  Object.assign(S, { lesson:3, vocab3:true, practiceDone3:true, phoneReplied:true, l3routeOK:true, tut:'l3-done', scene:'sanlorenzo',
    l3notes:CHIARA_ROUTE.map(l => ({ ...l })) });
  S.visited.sanlorenzo = true;
  ['rosa','mark'].forEach(id => { S.met[id] = true; S.known[id] = true; });
  PX[3].i = LESSONS[2].exercises.length;
}
