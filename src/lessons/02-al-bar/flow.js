/* Lesson 2. Lesson flow: start, opening beats, completion screen, and the skip used by the intro shortcuts. */

function startLesson2(){
  if (modalOpen) closeModal();
  S.lesson = 2; setTut('l2-bar'); lastGuide = '';
  toast('<b>Lezione 2 · Al bar</b> has started');
  setTimeout(() => toast('Tidier tiles: your Lesson 1 words are now <b>set phrases</b> (<i>Frasi fatte</i>), like <i>Come ti chiami?</i>'), 900);
}
/* Lesson 2 opening beat: the barista asks for your order before you know how. */
function checkBarFail(){
  if (!convo || !convo.npc.barista || S.vocab2 || convo.st.lastQ !== 'order' || convo.failShown) return;
  convo.failShown = true;
  convoBusy = true;
  setTimeout(() => {
    builder.hidden = true; hintEl.hidden = true; convoBusy = false;
    if (S.tut === 'l2-bar') sysLine('Enzo asked <i>“Cosa prende?”</i> He is waiting for your order, but you don\'t know how to order in Italian yet.');
    else sysLine('You still don\'t know how to order. Finish <b>Lezione 2</b> in your handbook first.');
    showChoices([{ label:'“Um… coffee? Espresso? Please?”', cls:'english', fn:() => {
      choices.hidden = true;
      meLine('Um… coffee? Espresso? Please?', { english:true });
      setTimeout(() => {
        npcLine('Eh? … Va bene. Il prossimo!', "Huh? … All right. Next!");
        setTimeout(() => {
          sysLine('Enzo shrugged and turned to the next customer. Time to study: open your handbook to <b>Lezione 2 · Al bar</b>.');
          if (S.tut === 'l2-bar') setTut('l2-handbook');
          showChoices([
            { label:'Leave', fn:closeDialog },
            { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(2); } },
          ]);
        }, 900);
      }, 700);
    }}]);
  }, 700);
}

/* ---------- Emma, the English-speaking tourist ---------- */
function emmaTalk(){
  const say = (t, d = 0) => setTimeout(() => npcLine(t, null, { english:true }), d);
  const leave = { label:'Leave', primary:true, fn:closeDialog };
  switch (S.tut){
    case 'l2-emma':
      say('Excuse me! Do you speak English? I just saw you order at the bar.');
      say("I'm Emma. I've been standing here for ten minutes trying to work up the courage. Could you order for me? I'd love a fresh orange juice and a croissant. And can you find out how much it is?", 700);
      setTimeout(() => {
        S.met.emma = true; save();
        showChoices([
          { label:'“Sorry, not right now.”', cls:'english', fn:() => { choices.hidden = true; meLine('Sorry, not right now.', { english:true }); say("No worries, I'll be right here!", 500); setTimeout(() => showChoices([leave]), 900); } },
          { label:'“Sure, follow me to the counter!”', primary:true, cls:'english', fn:() => {
            choices.hidden = true; meLine('Sure, follow me to the counter!', { english:true });
            say("Thank you so much! A fresh orange juice and a croissant. I'll be right behind you.", 500);
            setTimeout(() => { setTut('l2-translate'); showChoices([leave]); }, 1000);
          }},
        ]);
      }, 1300);
      break;
    case 'l2-translate':
      say("I'm right behind you! Talk to the barista. A fresh orange juice and a croissant, please.");
      setTimeout(() => showChoices([leave]), 500); break;
    default:
      if (S.l5follow){
        say("Oh! Is this your friend? Hi! Finally, another English speaker!");
        setTimeout(() => npcLine('Hi! I’m Mark. Do you also just point at things and hope for the best?', null, { english:true, speaker:NPC.mark, companion:true }), 700);
        say("Every single day.", 1500);
        S.l5intros.emma = true; save();
        setTimeout(() => showChoices([leave]), 1800); break;
      }
      if (S.l2EmmaDone){ say(S.lesson >= 3 ? "Still here! I might never leave this café. Good luck finding your friend!" : "Thanks again! This croissant is amazing. Grazie mille, as they say!"); }
      else say("Hi! Sorry, I don't speak Italian either. I'm still working up the courage to order.");
      setTimeout(() => showChoices([leave]), 500);
  }
}

const missingWish = () => EMMA_WISH.filter(w => !convo.st.order.includes(w));
const wishModel = () => 'Vorrei una spremuta e un cornetto, per favore.';
function openComplete2(){
  openModal('');
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione 2 completata!</em></h2><p class="sub">Al bar · At the café bar</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>You can order drinks and pastries with <b>vorrei</b> and the right article, answer <i>Altro?</i>, ask <b>Quant'è?</b> and understand the price. You even translated for someone else.</p>
      <h3>Your numbers</h3>${statsBlock([Object.values(S.convos).reduce((a, b) => a + b, 0), 'conversations finished'])}
      <div class="next"><p class="kicker">Next lesson</p><p><b>Lezione 3 · Dov'è?</b> Your friend Mark lands in town and wants to meet at a café across town. You'll have to ask the way.</p></div>
      <div class="cta"><button class="btn" data-close>Keep exploring</button><button class="btn primary" id="goL3">Start Lezione 3</button></div>
    </div>`;
  $('#goL3').onclick = startLesson3;
}
function skipL2(){
  Object.assign(S, { lesson:2, vocab2:true, practiceDone2:true, l2own:true, l2EmmaDone:true, tut:'l2-done' });
  ['enzo','emma'].forEach(id => { S.met[id] = true; S.known[id] = true; });
  PX[2].i = LESSONS[1].exercises.length;
}
