/* Padova's shops (engine/world/shops.js: the shop template): the pharmacy in San Lorenzo, the gelateria off the piazza. */

/* ---------- the town's shops (Lesson 12 on) ---------- */
/* La farmacia, in San Lorenzo (the green cross on Via Garibaldi; on the map, the Farmacia by San Lorenzo). White metal
   shelves: two against the back wall (in fondo, a sinistra / a destra) and one along the left wall (a sinistra); the counter
   (il banco) on the right with the till and the pharmacist; the medicines on the wall behind her. Open at any time (a
   farmacia di turno). Quest 2, In farmacia (src/quests/02-farmacia). */
const FARMACIA = shopScene({
  id:'farmacia', name:'Farmacia', sign:'FARMACIA', sub:'Via Garibaldi, San Lorenzo', icon:'cross', seed:91,
  tile:30,
  colors:{ wall:'#eaf3ec', trim:'#2e6a4e', floor:['#f5f6f2', '#e8ece6'], shelf:'#dcdfe2', shelfDark:'#9aa0a8', shelfBack:'#f7f8f5', counter:'#2e8b57', counterTop:'#f6f8f5', sign:'#2e8b57', signInk:'#fff' },
  keeper:'farmacista',
  counter:{ x:800, y:232, w:24, h:196, kind:'banco', till:true },
  behind:{ x:824, y:150, w:136, h:330 },
  fixtures:[
    { id:'fondo-sx', kind:'shelf', x:150, y:84, w:240, h:46, face:'S', name_it:'Lo scaffale', name_en:'the shelf at the back, on the left', rows:{
      sopra:[FX_ITEM('shampoo', 'SHAMPOO', 'lo shampoo', 'shampoo', '#7fb3e0', 'bottle'), FX_ITEM('sapone', 'SAPONE', 'il sapone', 'soap', '#f4d03f', 'box')],
      mezzo:[FX_ITEM('spazzolino', 'SPAZZOLINO', 'lo spazzolino', 'a toothbrush', '#2e8b57', 'brush'), FX_ITEM('spazzolino2', 'SPAZZOLINO', 'lo spazzolino', 'a toothbrush', '#c23b2a', 'brush'), FX_ITEM('collutorio', 'COLLUTORIO', 'il collutorio', 'mouthwash', '#5fb8c9', 'bottle')],
      mezzo2:[FX_ITEM('cotone', 'COTONE', 'il cotone', 'cotton wool', '#f2f2f2', 'pack', { ink:'#5a6b8a' }), FX_ITEM('salviette', 'SALVIETTE', 'le salviette', 'wipes', '#9ed0a8', 'pack')],
      sotto:[FX_ITEM('dentifricio', 'DENTIFRICIO', 'il dentifricio', 'toothpaste', '#2f7fd0', 'basket')] } },
    { id:'fondo-dx', kind:'shelf', x:560, y:84, w:220, h:46, face:'S', name_it:'Lo scaffale', name_en:'the shelf at the back, on the right', rows:{
      sopra:[FX_ITEM('crema', 'CREMA SOLARE', 'la crema solare', 'sun cream', '#f4b928', 'tube', { ink:'#7a3a1a' }), FX_ITEM('doposole', 'DOPOSOLE', 'il doposole', 'after-sun', '#7fd1c9', 'bottle')],
      mezzo:[FX_ITEM('vitamine', 'VITAMINE', 'le vitamine', 'vitamins', '#e07a2f', 'jar'), FX_ITEM('tisana', 'TISANA', 'la tisana', 'herbal tea', '#9ed0a8', 'box')],
      mezzo2:[FX_ITEM('acqua', 'ACQUA', "l'acqua", 'water', '#cfe8f5', 'bottle', { ink:'#1f3f7a' }), FX_ITEM('caramelle', 'CARAMELLE', 'le caramelle', 'sweets', '#e58fa0', 'pack')],
      sotto:[FX_ITEM('ghiaccio', 'GHIACCIO', 'il ghiaccio', 'ice packs', '#cfe8f5', 'basket', { ink:'#1f3f7a' })] } },
    { id:'sx', kind:'shelf', x:0, y:200, w:46, h:240, face:'E', name_it:'Lo scaffale', name_en:'the shelf on the left', rows:{
      sopra:[FX_ITEM('cerotti', 'CEROTTI', 'i cerotti', 'plasters', '#e58fa0', 'pack'), FX_ITEM('bende', 'BENDE', 'le bende', 'bandages', '#f2f2f2', 'pack', { ink:'#5a6b8a' })],
      mezzo:[FX_ITEM('termometro', 'TERMOMETRO', 'il termometro', 'a thermometer', '#7fb3e0', 'box'), FX_ITEM('garze', 'GARZE', 'le garze', 'gauze', '#fffdf8', 'pack', { ink:'#5a6b8a' })],
      mezzo2:[FX_ITEM('repellente', 'ANTIZANZARE', "l'antizanzare", 'insect repellent', '#2e6a4e', 'bottle', { ink:'#fffdf8' })],
      sotto:[FX_ITEM('borsa', 'BORSA ACQUA', "la borsa dell'acqua calda", 'a hot-water bottle', '#c23b2a', 'basket')] } },
    { id:'centro', kind:'shelf', x:340, y:300, w:260, h:44, face:'S', name_it:'Lo scaffale', name_en:'the low shelf in the middle', rows:{
      sopra:[FX_ITEM('profumo', 'PROFUMO', 'il profumo', 'perfume', '#c9a2d9', 'bottle'), FX_ITEM('cremamani', 'CREMA MANI', 'la crema per le mani', 'hand cream', '#f7c6d0', 'tube', { ink:'#7a3a4a' })],
      mezzo:[FX_ITEM('rossetto', 'ROSSETTO', 'il rossetto', 'lipstick', '#c23b2a', 'box', { ink:'#fffdf8' }), FX_ITEM('pettine', 'PETTINE', 'il pettine', 'a comb', '#4a4e56', 'pack', { ink:'#fffdf8' }), FX_ITEM('balsamo', 'BALSAMO', 'il balsamo', 'conditioner', '#e3c47a', 'bottle')],
      mezzo2:[FX_ITEM('fazzoletti', 'FAZZOLETTI', 'i fazzoletti', 'tissues', '#7fb3e0', 'box')],
      sotto:[FX_ITEM('spugne', 'SPUGNE', 'le spugne', 'sponges', '#f4d03f', 'basket')] } },
  ],
  props:[
    { kind:'plant', x:440, y:116 }, { kind:'scale', x:516, y:118 },
    { kind:'poster', x:40, y:16, w:84, h:48, lines:['FARMACIA', 'DI TURNO', '24 ORE'], ink:'#2e6a4e' },
    { kind:'poster', x:836, y:16, w:84, h:48, lines:['ESTATE', 'PROTEGGI', 'LA PELLE'], ink:'#c2627a', color:'#fff6e0' },

    { kind:'wallshelf', x:916, y:150, w:44, h:330 },
    { kind:'plant', x:60, y:520 }, { kind:'plant', x:900, y:520 },
  ],
  exit:{ scene:'sanlorenzo', spawn:{ x:880, y:342 }, title:'San Lorenzo', sub:'Via Garibaldi' },
  entry:{ scene:'sanlorenzo', door:'farmacia', when:() => S.lesson >= 12 },
});
/* La gelateria, just off the piazza (Lesson 12 on; on the map, the cone beside Piazza Centrale). The glass case (la vetrina)
   with the trays of gelato, the gelataio behind it, the back counter (cones, cups, the machine), the price board, two tables.
   Open in the evening (and at any time in free play). Quest 9, La gelateria (src/quests/09-gelateria). */
const GELATERIA = shopScene({
  id:'gelateria', name:'Gelateria', sign:'GELATERIA', sub:'Vicolo del Duomo, Piazza Centrale', icon:'cone', seed:57,
  room:{ x0:110, x1:850 }, tile:30,
  colors:{ wall:'#fbe7ee', trim:'#b55470', floor:['#fdf7ee', '#f8e8ec'], roof:'#a5462b', shelf:'#d9c4a0', shelfDark:'#9a7a50', counter:'#e6e2da', counterTop:'#fbfaf7', sign:'#b55470', signInk:'#fff', chair:'#b55470', table:'#fffdf8' },
  keeper:'gelataio',
  behind:{ x:296, y:120, w:368, h:88 },
  fixtures:[
    { id:'vetrina', kind:'case', x:300, y:208, w:360, h:26, face:'S', name_it:'La vetrina', name_en:'the display case', tubs:[
      FX_ITEM('pistacchio', 'PISTACCHIO', 'il pistacchio', 'pistachio', '#a8c97a', 'tub'), FX_ITEM('fragola', 'FRAGOLA', 'la fragola', 'strawberry', '#f08aa0', 'tub'),
      FX_ITEM('cioccolato', 'CIOCCOLATO', 'il cioccolato', 'chocolate', '#6b3e26', 'tub'), FX_ITEM('limone', 'LIMONE', 'il limone', 'lemon', '#f6e27a', 'tub'),
      FX_ITEM('nocciola', 'NOCCIOLA', 'la nocciola', 'hazelnut', '#c9a27a', 'tub'), FX_ITEM('stracciatella', 'STRACCIATELLA', 'la stracciatella', 'chocolate chip', '#f7f3ea', 'tub', { bits:'#3a2318' }),
      FX_ITEM('menta', 'MENTA', 'la menta', 'mint', '#bfe8cf', 'tub', { bits:'#3a2318' })] },
  ],
  props:[
    { kind:'counterback', x:300, y:86, w:360, h:34 },
    { kind:'board', x:676, y:8, w:156, h:66, lines:[['Listino'], ['Cono · 2 gusti', '€ 3'], ['Coppetta · 2 gusti', '€ 3'], ['Panna', '€ 1']] },
    { kind:'poster', x:136, y:14, w:120, h:50, lines:['GELATO', 'ARTIGIANALE', 'dal 1962'], ink:'#b55470', color:'#fffdf8', size:10 },
    { kind:'table', x:200, y:380, cup:true }, { kind:'table', x:760, y:380 }, { kind:'table', x:230, y:490 }, { kind:'table', x:740, y:490, cup:true },
    { kind:'plant', x:146, y:126 }, { kind:'plant', x:814, y:126 },
  ],
  exit:{ scene:'piazza', spawn:{ x:236, y:548 }, title:'Piazza Centrale', sub:'' },
  open:() => daytime() === 'night' || questFree(),
  closedNote:'<b>Gelateria</b>: chiuso. Apre stasera.',
});
