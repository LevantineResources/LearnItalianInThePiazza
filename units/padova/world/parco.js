/* The park (scene 'parco', Lesson 12 on): the Giardini dell'Arena, the green square on the city map between the station
   and the museum. Seen from above: lawns, gravel paths from the gate (bottom) to a round plaza with a flowerbed, the big
   tree on the left (an old plane tree: a sprite, its canopy drawn over whoever walks behind it), the gardener's shed at the
   top right (his ladder against its wall), flowerbeds, benches, a pond with ducks at the bottom right, lamps. In the
   afternoon: children playing with a ball, a man feeding the ducks, a dog walker, the gardener at work, and Pietro under
   the big tree (quest 6, L'aquilone: his kite is stuck in it). At night: the lamps, the dog walker, the pond in the moonlight.
   Drawing: render/parco.js. The ladder and the kite are the quest's (src/quests/06-aquilone: PARCO.ladder, PARCO.kite).
   Tests: __dbg().parco = { ladder, kite, climbing }. */
const PARCO = {
  tree:{ x:170, y:330, canopy:{ x:170, y:200, r:108 } },          // the big tree: the trunk's foot, the canopy's centre
  kiteAt:{ x:142, y:132 },                                          // where the kite is caught, high in the canopy
  shed:{ x:790, y:64, w:140, h:92 },                                // the gardener's shed: roof y 64…122, its front wall to y 156
  pond:{ x:770, y:462, rx:122, ry:72 },
  plaza:{ x:480, y:330, r:82 }, bed:{ x:480, y:330, r:34 },
  beds:[{ x:392, y:412, w:44, h:124 }, { x:524, y:412, w:44, h:124 }, { x:640, y:182, w:96, h:36 }],
  benches:[{ x:572, y:270, w:84, h:18 }, { x:302, y:378, w:84, h:18 }, { x:600, y:536, w:84, h:18 }],
  lamps:[[430, 270], [536, 392], [282, 296], [668, 300], [612, 470], [866, 300], [120, 420]],
  trees:[[60, 548, 34], [902, 556, 30], [902, 236, 30], [44, 70, 30], [640, 80, 26], [330, 560, 26]],
  ladder:'shed',                                                    // where the ladder is: 'shed' | 'carried' | 'tree' (the quest moves it)
  ladderShed:{ x:772, y:152 }, ladderTree:{ x:196, y:338 },         // its foot: against the shed's wall, against the trunk
  kite:'tree',                                                      // 'tree' | 'gone' (fetched) | 'flying' (Pietro has it back)
  climbing:false,
};
SCENES.parco = {
  minY:44, spawn:{ x:480, y:520 },
  C:[ { x:PARCO.tree.x, y:PARCO.tree.y - 6, r:22 }, { x:PARCO.bed.x, y:PARCO.bed.y, r:PARCO.bed.r + 4 },
      ...PARCO.lamps.map(([x, y]) => ({ x, y, r:7 })), ...PARCO.trees.map(([x, y, r]) => ({ x, y, r:r * 0.6 })),
      /* the pond: an ellipse of circles */
      ...[-0.72, -0.36, 0, 0.36, 0.72].map(k => ({ x:PARCO.pond.x + k * PARCO.pond.rx, y:PARCO.pond.y, r:PARCO.pond.ry * Math.sqrt(1 - k * k) * 0.98 + 2 })) ],
  R:[ { x:0, y:0, w:W, h:30 }, { x:0, y:0, w:24, h:H }, { x:W - 24, y:0, w:24, h:H },
      { x:0, y:H - 16, w:430, h:16 }, { x:530, y:H - 16, w:430, h:16 },
      { x:PARCO.shed.x, y:PARCO.shed.y, w:PARCO.shed.w, h:PARCO.shed.h }, ...PARCO.beds, ...PARCO.benches ],
  doors:[
    /* the gardener's ladder against the big tree (quest 6: E → climb up and fetch the kite) */
    { id:'parco-scala', x:196, y:356, label:'Sali', when:() => PARCO.ladder === 'tree' && typeof questAt === 'function' && questAt('aquilone', 'sali'), hit:{ x:166, y:176, w:52, h:180 }, msg:'' },
    { id:'parco-targa', x:480, y:578, label:'Leggi', hit:{ x:440, y:566, w:80, h:30 },
      msg:'<b>Giardini dell\'Arena.</b> The public gardens round the old Roman arena: lawns, an old plane tree, a pond. Open from dawn to midnight.' },
  ],
};
function parcoDbg(){ return { ladder:PARCO.ladder, kite:PARCO.kite, climbing:PARCO.climbing }; }
