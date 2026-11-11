/* Padova's scenes (engine/world/scenes.js SCENES): the piazza, San Lorenzo, Caffè Aurora, Piazza del Santo, the market, the
   museum square. The bigger scenes register themselves in their own files (world/galleria.js, stazione.js, ponte.js…). */

/* =========================================================
   WORLD: scenes, pigeons
   ========================================================= */
const FOUNTAIN = { x:470, y:340 };
const TABLES = [[722, 226], [905, 262], [830, 302]];
const COUNTER = { x:770, y:150, w:140, h:30 };
/* the market (Piazza delle Erbe): four stalls around a central walkway (x 400–560).
   Each stall: striped awning at the back, the vendor behind the counter, the player talks from the front.
   Vendor positions (content/npcs.js) sit at vx, row 0 → y 210, row 1 → y 378. */
const STALLS = [
  { id:'teresa', x:70,  row:0, vx:330, awn:['#1c3d8f', '#f5f1e8'] },
  { id:'gino',   x:560, row:0, vx:630, awn:['#c23b2a', '#f5f1e8'] },
  { id:'franco', x:70,  row:1, vx:330, awn:['#2e6a4e', '#f5f1e8'] },
  { id:'pina',   x:560, row:1, vx:630, awn:['#e07a2f', '#f6e3a0'] },
];
const STALL_W = 330;
/* per row: awning top, counter top, counter height, vendor y */
const STALL_ROW = [{ top:140, awn:146, ct:220, ch:24, vy:210 }, { top:312, awn:316, ct:388, ch:24, vy:378 }];
/* the Gattamelata's stepped plinth in Piazza del Santo (world/statue.js): blocks walking, and is where you look at it from */
const GATTA = { x:206, y:296, w:188, h:114 };
/* the museum square (scene 'museo', Lesson 10 on): the Museo d'Arte at the top with its doors, the ticket booth
   (Biglietteria) beside them between two long planters, so the booth's window is reached only through the bay between
   the planters (the crowd stands in it: world/museo.js), the clock tower on the left (an oblique sprite, like the
   Gattamelata), a bench, the Giardini dell'Arena behind a railing on the right. */
const MUSEO = {
  doors:{ x:400, y:166 },
  booth:{ x:556, y:150, w:144, h:72 },               // walk-blocking; its glass window and counter are the front (y 206–222)
  planters:[{ x:500, y:150, w:36, h:154 }, { x:700, y:150, w:36, h:154 }],
  tower:{ x:60, y:150, w:104, h:84 },                 // the clock tower's footprint; ground line at y 234
  bench:{ x:150, y:440, w:96, h:20 }, seat:{ x:198, y:446 },   // Bruno sits on the seat (a lesson places him there)
  garden:{ x:840, y:150, w:120, h:450 },
  bikes:{ x:640, y:548, w:150, h:30 },
  trees:[[34, 330], [34, 520], [300, 574]],
};
const MARKET_PROPS = [[34, 470, 20], [926, 470, 20], [180, 520, 18], [800, 528, 18]];   // loose crates and a cart: [x, y, r]
Object.assign(SCENES, {
  piazza: {
    minY:160, spawn:{ x:480, y:520 },
    C:[ { x:470, y:340, r:84 }, ...TABLES.map(([x, y]) => ({ x, y, r:22 })),
        { x:40, y:168, r:20 }, { x:300, y:166, r:20 }, { x:640, y:166, r:20 }, { x:40, y:560, r:20 }, { x:930, y:560, r:20 }, { x:330, y:556, r:26 } ],
    R:[ { x:100, y:318, w:128, h:116 }, COUNTER ],
    doors:[],
  },
  santo: {
    minY:24, spawn:{ x:480, y:556 },
    C:[ { x:70, y:250, r:22 }, { x:890, y:250, r:22 }, { x:70, y:470, r:22 }, { x:890, y:470, r:22 } ],
    R:[ { x:200, y:0, w:560, h:172 }, GATTA, { x:600, y:420, w:70, h:14 }, { x:250, y:470, w:70, h:14 } ],
    doors:[
      { id:'gattamelata', x:300, y:GATTA.y + GATTA.h, area:GATTA, look:true, tapped:(x, y) => statueTapped(x, y), msg:'' },   // opens the picture (world/statue.js)
      { id:'basilica', x:480, y:190, msg:'<b>La Basilica del Santo.</b> People here just call it “il Santo”. Cool and quiet inside.' },
    ],
  },
  aurora: {
    minY:104, spawn:{ x:378, y:376 },
    C:[ { x:420, y:320, r:34 }, { x:190, y:230, r:34 }, { x:200, y:470, r:34 }, { x:680, y:470, r:34 }, { x:650, y:250, r:34 },
        { x:150, y:230, r:14 }, { x:230, y:230, r:14 }, { x:640, y:470, r:14 }, { x:40, y:130, r:20 }, { x:920, y:560, r:20 } ],
    R:[ { x:760, y:90, w:200, h:100 } ],
    doors:[ { id:'exit', x:480, y:576, msg:'' } ],
  },
  sanlorenzo: {
    minY:16, spawn:{ x:170, y:240 },
    C:[ { x:60, y:280, r:18 }, { x:330, y:200, r:16 } ],
    R:[ { x:0, y:0, w:340, h:168 }, { x:400, y:0, w:220, h:300 }, { x:680, y:0, w:280, h:300 }, { x:0, y:370, w:520, h:230 }, { x:580, y:370, w:380, h:230 }, { x:150, y:196, w:60, h:16 } ],
    doors:[
      { id:'aurora', x:658, y:126, msg:'' },
      { id:'barsport', x:378, y:100, msg:'<b>Bar Sport</b>, Via Verdi. A football match is on the TV. Not the café Marco meant.' },
      { id:'banca', x:560, y:318, msg:'<b>La banca.</b> A sign on the door says <i>Chiuso per pranzo</i>: closed for lunch.' },
      { id:'farmacia', x:880, y:318, msg:'<b>La farmacia.</b> The green cross means pharmacy all over Italy.' },
      { id:'panetteria', x:260, y:352, msg:'<b>La panetteria.</b> It smells of fresh bread. Maybe later!' },
      { id:'chiesa', x:170, y:184, msg:'<b>La chiesa di San Lorenzo.</b> Cool and quiet inside.' },
    ],
  },
  mercato: {
    minY:150, spawn:{ x:480, y:556 },
    C:MARKET_PROPS.map(([x, y, r]) => ({ x, y, r })),
    R:[ ...STALLS.map(s => { const R = STALL_ROW[s.row]; return { x:s.x, y:R.top, w:STALL_W, h:R.ct + R.ch - R.top }; }) ],
    doors:[
      { id:'ragione', x:480, y:164, msg:'<b>Il Palazzo della Ragione.</b> For eight hundred years Padua has held its markets on both sides of it: <i>le erbe</i> (herbs and vegetables) here, fruit in Piazza della Frutta.' },
    ],
  },
  museo: {
    minY:150, spawn:{ x:480, y:556 },
    C:MUSEO.trees.map(([x, y]) => ({ x, y, r:20 })),
    R:[ MUSEO.booth, ...MUSEO.planters, MUSEO.tower, MUSEO.bench, MUSEO.garden, MUSEO.bikes ],
    doors:[
      { id:'museo', x:MUSEO.doors.x, y:MUSEO.doors.y, msg:'<b>Museo d\'Arte · I Capolavori.</b> Entry with a timed ticket only. The ticket office, the <i>Biglietteria</i>, is beside the doors.' },
      { id:'orologio', x:112, y:MUSEO.tower.y + MUSEO.tower.h, area:MUSEO.tower, look:true, lookAt:'the clock', tapped:(x, y) => towerTapped(x, y), msg:'' },   // opens the clock face (world/museo.js)
    ],
  },
});

const pigeons = [], pigeonsMuseo = [];
(function initPigeons(){
  const r = rng(11);
  while (pigeons.length < 7){
    const p = { x:380 + r() * 200, y:455 + r() * 90, dir:r() * 6.28, t:r() * 2, fly:0, ph:r() * 6 };
    const d = Math.hypot(p.x - FOUNTAIN.x, p.y - FOUNTAIN.y);
    if (d > 92 && Math.hypot(p.x - 590, p.y - 432) > 24) pigeons.push(p);
  }
  while (pigeonsMuseo.length < 6) pigeonsMuseo.push({ x:290 + r() * 170, y:300 + r() * 120, dir:r() * 6.28, t:r() * 2, fly:0, ph:r() * 6 });
})();
Object.assign(FLOCKS, { piazza:pigeons, museo:pigeonsMuseo });

/* lit inside at night (engine/world/daytime.js) */
Object.assign(INTERIOR, { aurora:true, galleria:true, salone:true, basilica:true });

/* every frame (engine/world/update.js): the museum's wandering visitors and ropes (world/galleria.js); the night train's doors
   and sound (world/treno.js), the museum square's clock (world/museo.js) */
Object.assign(UNIT, { updateWorld(dt){ if (!frozen()) galleriaUpdate(dt); }, updateWorldLate(dt){ trenoUpdate(dt); clockTick(dt); } });

/* keys (engine/ui/keyboard.js): E also closes the Gattamelata's picture, the clock face and a work of art; R repeats Lucia's
   line in the museum's Vedo, vedo (ui/museum-ispy.js) */
Object.assign(UNIT, { eClosesModal:() => statueOpen() || clockOpen() || workOpen(), key:(k, e) => mispyKey(k, e) });
