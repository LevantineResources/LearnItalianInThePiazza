/* Lesson 5. Lesson flow: start, opening beats, completion screen, and the skip used by the intro shortcuts. */

function startLesson5(){
  if (modalOpen) closeModal();
  S.lesson = 5; S.tut = 'l5-text'; S.phoneUnread = true; S.l5follow = false; save(); lastGuide = '';
  travelTo('piazza', { x:480, y:520 }, 'Il giorno dopo', 'The next morning');
  setTimeout(() => { toast('<b>Lezione 5 · Ti presento…</b> has started'); }, 1800);
  setTimeout(() => toast('Your phone buzzes. A message from <b>Mark</b>.'), 2700);
}
/* Lesson 5 opening beat: Mark is failing to talk to Paolo */
function paoloMeetsMark(){
  builder.hidden = true; convoBusy = true;
  sysLine('Mark is at the fountain, waving his arms at Paolo.');
  companionLine("…a statue! By Donatello? A man on a horse? Gatta… mela… something?");
  npcLine('Eh? Donatello… sì… ma… scusa, non capisco l\'inglese.', "Huh? Donatello… yes… but… sorry, I don't understand English.");
  companionLine("Oh, there you are! Can you ask him where the Gattamelata statue is? It's supposed to be amazing.");
  enqueue(() => { convoBusy = false; builder.hidden = false; _showHint(contextHint(false)); });
}
function markKnowEachOther(){
  builder.hidden = true; hintEl.hidden = true;
  setTimeout(() => {
    companionLine('Wait… “Paolo”? You two know each other?');
    showChoices([{ label:'“Yes! That\'s Paolo. We met on my first day here.”', primary:true, cls:'english', fn:() => {
      choices.hidden = true; meLine("Yes! That's Paolo. We met on my first day here.", { english:true });
      companionLine("Well then introduce me! Don't just leave me standing here like a tourist.");
      sysLine("You have never introduced anyone in Italian. Open your handbook: <b>Lezione 5 · Ti presento…</b>");
      enqueue(() => { if (S.tut === 'l5-meet') setTut('l5-handbook'); });
      showChoices([{ label:'Leave', fn:closeDialog }, { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(5); } }]);
    }}]);
  }, 400);
}

function openComplete5(){
  openModal('');
  const names = Object.keys(S.l5intros).map(id => NPC[id] ? NPC[id].name : id);
  sheet.innerHTML = `
    <div class="sheet-head"><div><p class="kicker">Lesson complete</p><h2><em>Lezione 5 completata!</em></h2><p class="sub">Ti presento… · Introducing people</p></div>
      <button class="x" data-close aria-label="Close">×</button></div>
    <div class="sheet-body">
      <p>You introduced Mark with <b>ti presento</b> and <b>le presento</b>, told people about him with <b>è inglese</b> and <b>non parla italiano</b>, followed longer directions over the river, and checked a famous statue with <b>Questa è …?</b></p>
      <h3>Mark met</h3>
      <div class="dict people">${names.map(nm => `<div class="entry"><div><div class="w">${esc(nm)}</div></div></div>`).join('') || '<div class="empty">Nobody yet!</div>'}</div>
      <h3>Your numbers</h3>${statsBlock([names.length, 'people you introduced Mark to'])}
      <div class="next"><p class="kicker">Next lesson</p><p><b>Lezione 6 · Il libro perduto.</b> A review of everything, with the tiles taken away.</p></div>
      <div class="cta"><button class="btn" data-close>Keep exploring</button><button class="btn primary" id="goL6">Start Lezione 6</button></div>
    </div>`;
  $('#goL6').onclick = startLesson6;
}
function skipL5(){
  Object.assign(S, { lesson:5, vocab5:true, practiceDone5:true, phoneReplied5:true, l5routeOK:true, l5statue:true, l5follow:true, tut:'l5-done', scene:'santo', l5intros:{ marco:true } });
  S.visited.santo = true;
  ['lucia','marco'].forEach(id => { S.met[id] = true; S.known[id] = true; });
  PX[5].i = LESSONS[4].exercises.length;
}
