/* The covered market (scene 'salone', Lesson 12 on): "Sotto il Salone", the long arcaded hall of food shops under the
   Palazzo della Ragione, entered from Piazza delle Erbe (the market scene's door 'ragione', at the top). Seen from above:
   the hall's central aisle runs left to right between two rows of shops set in the arches, square pillars between them,
   lamps hanging along the aisle; the way out (to the piazza) at the bottom in the middle. North row: the bakery (PANE),
   Marisa's deli counter (SALUMERIA · da Marisa: cheese, prosciutto and salami in a glass case, hams hanging behind her),
   the cheese shop (FORMAGGI: wheels of Grana and Asiago). South row: fresh pasta (PASTA FRESCA), wine and oil (VINI · OLIO).
   Open in the afternoon (the market's hours) and at any time in free play; at night the iron gates are shut.
   People: Marisa (formal; quest 4, Il mercato coperto), the baker, the cheesemonger, the pasta maker (ambient), two shoppers
   strolling the aisle. Drawing: render/salone.js. Tests: __dbg().salone = { open, taste (Marisa's tasting plate), sold }. */
const SALONE = {
  aisle:[214, 392],                                       // the walkable aisle between the rows (y)
  north:[                                                  // the shops in the north arches: x, w; the counter's front at y 204
    { id:'pane', x:24, w:280, sign:'PANE · FORNO', col:'#b5652f', ink:'#fff6e6' },
    { id:'salumeria', x:340, w:280, sign:'SALUMERIA', sub:'da Marisa', col:'#7a2e2a', ink:'#fff6e6' },
    { id:'formaggi', x:656, w:280, sign:'FORMAGGI', col:'#d9a520', ink:'#3a2410' },
  ],
  south:[                                                  // the shops in the south arches; the counter's front at y 404
    { id:'pasta', x:24, w:330, sign:'PASTA FRESCA', col:'#2e6a4e', ink:'#fff6e6' },
    { id:'vini', x:606, w:330, sign:'VINI · OLIO', col:'#5a2a4a', ink:'#fff6e6' },
  ],
  pillarsN:[4, 320, 638, 956], pillarsS:[4, 374, 586, 956],
  gate:{ x:390, w:180 },                                   // the arch out to Piazza delle Erbe (bottom)
  lamps:[[120, 300], [330, 300], [630, 300], [840, 300]],
  taste:false,                                             // Marisa's tasting plate on the counter (quest 4)
};
const saloneOpen = () => daytime() !== 'night' || (typeof questFree === 'function' && questFree());
SCENES.salone = {
  minY:SALONE.aisle[0], spawn:{ x:480, y:548 },
  guideKeep:[{ x:340, y:0, w:280, h:236 }],          // (the guide never covers Marisa's sign and counter: ui/hud.js guideDock)
  C:[],
  R:[ { x:0, y:0, w:W, h:SALONE.aisle[0] - 10 },
      { x:0, y:SALONE.aisle[1] + 6, w:SALONE.gate.x, h:H }, { x:SALONE.gate.x + SALONE.gate.w, y:SALONE.aisle[1] + 6, w:W, h:H } ],
  doors:[
    { id:'salone-esci', x:480, y:584, label:'Esci', msg:'' },
    { id:'salone-targa', x:860, y:244, label:'Leggi', hit:{ x:820, y:214, w:80, h:26 },
      msg:'<b>Sotto il Salone.</b> Under the great hall of the Palazzo della Ragione, Padua\'s food shops have stood in the same arches since the Middle Ages: bread, cheese, salumi, fresh pasta.' },
  ],
};
/* the doors: in from Piazza delle Erbe (the market's door 'ragione'), out again */
function saloneDoor(d){
  if (d.id === 'salone-esci'){ travelTo('mercato', { x:480, y:204 }, 'Mercato', 'Piazza delle Erbe'); return true; }
  if (d.id === 'ragione' && S.scene === 'mercato' && (townOpen() || (S.lesson >= 12 && lessonCompleted(12)))){
    if (!saloneOpen()){ toast('<b>Sotto il Salone</b>: chiuso. The iron gates are shut for the night.'); return true; }
    travelTo('salone', null, 'Sotto il Salone', 'Il mercato coperto'); return true;
  }
  return false;
}
function saloneDbg(){ return { open:saloneOpen(), taste:SALONE.taste }; }
