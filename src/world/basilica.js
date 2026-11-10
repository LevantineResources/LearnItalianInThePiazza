/* The basilica (scene 'basilica', Lesson 12 on): inside the Basilica di Sant'Antonio, "il Santo", entered from Piazza del
   Santo (its door 'basilica'). Seen from above, dim and quiet: the entrance (the doors at the bottom, a wooden inner porch,
   la bussola, with a gap in the middle where the volunteer stands), the nave with two blocks of pews and the central aisle,
   four great piers, the side aisles; on the left the chapel of the saint's tomb (la Cappella dell'Arca) behind its rail,
   with the stand of votive candles in front of it (door 'candele': Accendi, a coin in the box); at the top the high altar
   with its candles and the red sanctuary lamp; on the right the sacristy door, where the sacristan is. Light: its own pass
   at all times (render/basilica.js: dim, warm pools at the candles and the altar, coloured light from the high windows).
   Speech is softer in here (SCENES.basilica.hush: engine/speech.js). Open in the afternoon (and at any time in free play);
   at night the door says it is shut. Like the museum, a desktop scene (no portrait layout).
   People: the volunteer at the door (la volontaria, formal; quest 5, In basilica), the sacristan (il sacrestano, formal), two
   people praying in the pews and a visitor by the chapel (ambient). Tests: __dbg().basilica = { open, covered, candles, gap }. */
const BASILICA = {
  wall:470, gap:{ x:440, w:80 },                                 // the inner porch's wall (y) and the way through it
  pews:{ left:[250, 432], right:[528, 710], rows:[244, 278, 312, 346, 380, 414] },
  piers:[[160, 176], [160, 340], [800, 176], [800, 340]],
  chapel:{ x:0, y:150, w:118, h:230 }, rail:{ x:118, y:170, w:10, h:190 },
  candles:{ x:182, y:214, w:52, h:28 },                          // the stand of votive candles (in front of the chapel)
  altar:{ x:300, y:30, w:360, h:150 },                           // the sanctuary, raised (steps at its foot), walk-blocking
  sacristy:{ x:900, y:120 },
  lit:0,                                                         // candles the player has lit (quest 5)
};
const basilicaOpen = () => daytime() !== 'night' || (typeof questFree === 'function' && questFree());
SCENES.basilica = {
  minY:40, spawn:{ x:480, y:556 }, hush:true,
  guideKeep:[{ x:150, y:190, w:110, h:90 }, { x:800, y:150, w:120, h:100 }, { x:420, y:440, w:180, h:80 }],   // (the candles, the sacristan, the door: ui/hud.js guideDock)
  C:BASILICA.piers.map(([x, y]) => ({ x, y, r:24 })),
  R:[ BASILICA.altar, BASILICA.chapel, BASILICA.rail, BASILICA.candles,
      ...BASILICA.pews.rows.flatMap(y => [{ x:BASILICA.pews.left[0], y, w:BASILICA.pews.left[1] - BASILICA.pews.left[0], h:12 }, { x:BASILICA.pews.right[0], y, w:BASILICA.pews.right[1] - BASILICA.pews.right[0], h:12 }]),
      /* the inner porch: its wall either side of the gap, the vestibule's side walls */
      { x:0, y:BASILICA.wall, w:BASILICA.gap.x, h:16 }, { x:BASILICA.gap.x + BASILICA.gap.w, y:BASILICA.wall, w:W, h:16 },
      { x:0, y:BASILICA.wall, w:320, h:H }, { x:640, y:BASILICA.wall, w:W, h:H },
      { x:900, y:40, w:60, h:60 } ],
  doors:[
    { id:'basilica-esci', x:480, y:586, label:'Esci', msg:'' },
    { id:'candele', x:208, y:262, label:'Accendi', hit:{ x:176, y:196, w:64, h:50 }, msg:'' },
    { id:'arca', x:140, y:262, label:'Guarda', hit:{ x:0, y:150, w:128, h:230 },
      msg:'<b>La Cappella dell\'Arca.</b> The tomb of Saint Anthony. Pilgrims touch the marble and leave notes and photos of the people they pray for.' },
  ],
};
/* in from Piazza del Santo (its door 'basilica'), out again */
function basilicaDoor(d){
  if (d.id === 'basilica-esci'){ travelTo('santo', { x:480, y:236 }, 'Piazza del Santo', ''); return true; }
  if (d.id === 'candele' && S.scene === 'basilica'){
    toast('<b>Le candele.</b> Rows of little candles, lit for someone. A box beside them says <i>Offerte</i> (offerings).'); return true;
  }
  if (d.id === 'basilica' && S.scene === 'santo' && (townOpen() || (S.lesson >= 12 && lessonCompleted(12)))){
    if (!basilicaOpen()){ toast('<b>La Basilica del Santo</b>: chiusa. It opens again in the morning.'); return true; }
    travelTo('basilica', null, 'Basilica di Sant\'Antonio', 'Silenzio, per favore'); return true;
  }
  return false;
}
function basilicaDbg(){ return { open:basilicaOpen(), covered:!!player.shawl, candles:BASILICA.lit, gap:BASILICA.gap }; }
