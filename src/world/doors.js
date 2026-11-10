/* Doors in San Lorenzo and arrival beats. */

/* ---------- doors (San Lorenzo) ---------- */
function enterDoor(d){
  if (askHooks('door', d)) return;                 // a lesson can take over any door (Lesson 10: the museum doors)
  if (shopDoor(d)) return;                          // the shops: their door out, their shelves, their doors from outside (world/shops.js)
  if (saloneDoor(d) || basilicaDoor(d)) return;     // the covered market and the basilica: in and out (world/salone.js, world/basilica.js)
  if (trenoDoor(d)) return;                         // the night train: compartment doors (knock), the cab, the bunk (world/treno.js)
  if (d.id === 'gattamelata') return openStatue();
  if (d.id === 'orologio') return openClockFace();
  if (d.id === 'tabellone') return openBoard();                                   // the station (world/stazione.js)
  if (/^convalida/.test(d.id)) return toast('<b>La convalida.</b> The green machine stamps the date and time on a train ticket. You have nothing to stamp yet.');
  if (d.id === 'treno') return toast('The train doors. Not yet: you have no ticket for this one.');
  if (d.work) return galWorkDoor(d);                        // a painting or a statue in the museum (world/galleria.js: visitors, ropes, Vedo vedo)
  if (d.id === 'museo' && lessonCompleted(10)) return enterGalleria();
  if (d.id === 'uscita') return travelTo('museo', { x:MUSEO.doors.x, y:MUSEO.doors.y + 46 }, "Museo d'Arte", 'Back out on the square');
  if (d.id === 'exit') return travelTo('sanlorenzo', { x:640, y:126 }, 'San Lorenzo', 'Via dei Mille');
  if (d.id === 'aurora'){
    if (S.tut === 'l3-find') return arrival();
    if (S.lesson >= 4) return travelTo('aurora', SCENES.aurora.spawn, 'Caffè Aurora', 'Via dei Mille 12');
    if (S.tut === 'l3-done') return startLesson4();
    return toast('A door with a <b>12</b> on it, but no sign you can read from here. Is this even Via dei Mille? Ask someone first.');
  }
  toast(d.msg);
}
function arrival(){
  dialogOpen = true; keys.clear(); target = null;
  convo = { npc:NPC.mark, known:true, mode:'cutscene', words:[], st:{} };
  $('#dlgWho').innerHTML = '<b>Mark</b> <span class="where">· Caffè Aurora, Via dei Mille 12</span>';
  tr.innerHTML = ''; hintEl.hidden = true; dlg.hidden = false; builder.hidden = true; choices.hidden = true;
  const say = t => npcLine(fill(t), null, { english:true });
  sysLine('You push open the door of number 12. Your friend Mark waves from a table by the window.');
  setTimeout(() => {
    say("{Me}! You made it! I was starting to think you'd got lost.");
    showChoices([{ label:'“Sorry! I had to ask for directions… in Italian.”', primary:true, cls:'english', fn:() => {
      choices.hidden = true; meLine('Sorry! I had to ask for directions… in Italian.', { english:true });
      setTimeout(() => { say("No way. Look at you! I can barely say “ciao”."); }, 600);
      setTimeout(() => {
        say("Anyway, I'm starving. They do lunch here. Let's eat!");
        showChoices([{ label:'“Let\'s eat!”', primary:true, cls:'english', fn:() => {
          choices.hidden = true; meLine("Let's eat!", { english:true });
          setTut('l3-done'); S.met.mark = true; S.known.mark = true; S.sentences++; save();
          setTimeout(() => showChoices([{ label:'Sit down with Mark', primary:true, fn:closeDialog }]), 500);
        }}]);
      }, 1600);
    }}]);
  }, 700);
}
