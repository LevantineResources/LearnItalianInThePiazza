/* Doors: E at a door, or a tap on it (world/update.js). A lesson's door(d) hook first, then the shops' doors, then the
   unit's (UNIT.enterDoor(d) → true when handled), else the door's message. */

function enterDoor(d){
  if (askHooks('door', d)) return;                 // a lesson can take over any door (Lesson 10: the museum doors)
  if (shopDoor(d)) return;                          // the shops: their door out, their shelves, their doors from outside (world/shops.js)
  if (unitHook('enterDoor', d)) return;                 // the unit's own doors (Padova: units/padova/world/doors.js)
  toast(d.msg);
}
