/* Padova's doors (engine/world/doors.js asks UNIT.enterDoor(d): true when handled): the covered market, the basilica, the night
   train, the Gattamelata, the clock tower, the station, the museum and its works, San Lorenzo's doors (Lesson 3's arrival at
   Caffè Aurora). */
UNIT.enterDoor = d => {
  if (saloneDoor(d) || basilicaDoor(d)) return true;     // the covered market and the basilica: in and out (world/salone.js, world/basilica.js)
  if (trenoDoor(d)) return true;                         // the night train: compartment doors (knock), the cab, the bunk (world/treno.js)
  if (d.id === 'gattamelata'){ openStatue(); return true; }
  if (d.id === 'orologio'){ openClockFace(); return true; }
  if (d.id === 'tabellone'){ openBoard(); return true; }                                   // the station (world/stazione.js)
  if (/^convalida/.test(d.id)){ toast('<b>La convalida.</b> The green machine stamps the date and time on a train ticket. You have nothing to stamp yet.'); return true; }
  if (d.id === 'treno'){ toast('The train doors. Not yet: you have no ticket for this one.'); return true; }
  if (d.work){ galWorkDoor(d); return true; }                        // a painting or a statue in the museum (world/galleria.js: visitors, ropes, Vedo vedo)
  if (d.id === 'museo' && lessonCompleted(10)){ enterGalleria(); return true; }
  if (d.id === 'uscita'){ travelTo('museo', { x:MUSEO.doors.x, y:MUSEO.doors.y + 46 }, "Museo d'Arte", 'Back out on the square'); return true; }
  if (d.id === 'exit'){ travelTo('sanlorenzo', { x:640, y:126 }, 'San Lorenzo', 'Via dei Mille'); return true; }
  if (d.id === 'aurora'){
    if (S.tut === 'l3-find'){ arrival(); return true; }
    if (S.lesson >= 4){ travelTo('aurora', SCENES.aurora.spawn, 'Caffè Aurora', 'Via dei Mille 12'); return true; }
    if (S.tut === 'l3-done'){ startLesson4(); return true; }
    toast('A door with a <b>12</b> on it, but no sign you can read from here. Is this even Via dei Mille? Ask someone first.'); return true;
  }
};
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

/* travelTo() without a title (engine/world/travel.js), and the arrival beats of Lessons 3 and 5 */
Object.assign(UNIT, {
  travelTitle:scene => scene === 'sanlorenzo' ? 'San Lorenzo' : 'Piazza Centrale',
  travelSub:scene => scene === 'sanlorenzo' ? 'Sempre dritto… seconda a destra… a sinistra alla farmacia…' : 'Back the way you came…',
  arrive(scene){
    if (scene === 'sanlorenzo' && !S.visited.sanlorenzo){ S.visited.sanlorenzo = true; if (S.tut === 'l3-mark') S.tut = 'l3-stranger'; }
    if (scene === 'santo'){ S.visited.santo = true; if (S.tut === 'l5-tour') S.tut = 'l5-statue'; }
  },
});
