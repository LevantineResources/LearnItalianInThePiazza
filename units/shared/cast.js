/* People who appear in more than one unit: how they look and sound, nothing else (no places, no lesson logic). A unit's
   content/npcs.js spreads them into its own entries: NPCS.push({ id:'margaret', ...CAST.margaret, scene, x, y, … }). Margaret,
   Biscuit and Bepi meet the player in Padova's Lessons 13–15 and are back in Venezia (docs/unit-2-venezia.md). A unit lists this
   file in its unit.json as "@shared/cast.js". */
const CAST = {
  /* an English lady travelling with her little dog: English only (a lesson's talk hook has her conversation) */
  margaret:{ name:'Margaret', english:true, pron:['She','her'], body:'#5a4a6a', hair:'#cfcfd4', skin:'#f0d0b8', longHair:true, brim:'#35577a', bag:'#7a2a3a', pitch:1.1 },
  /* her little dog (render/sprites.js drawDog) */
  biscuit:{ name:'Biscuit', animal:'dog', ambient:true, pron:['He','his'], size:0.82, coat:'#e3c08a', ears:'#a8743c', collar:'#c23b2a', body:'#e3c08a', hair:'#a8743c', skin:'#e3c08a', pitch:1.6,
    says:{ it:'Bau!', en:'Woof!' } },
  /* Lina Bassi, Ernesto's wife (married fifty years): Padova's night train (Lessons 13–14), Venezia's Lesson 3 (she grew up in Castello) */
  lina:{ name:'Lina', pron:['She','her'], body:'#8a4a7a', hair:'#dadada', skin:'#efc6a4', longHair:true, bag:'#c9a54a', pitch:1.05 },
  /* il signor Bepi, an old Venetian gentleman */
  bepi:{ name:'Bepi', pron:['He', 'his'], body:'#4f5a48', hair:'#d8d8d8', skin:'#e8c3a0', flatcap:'#5a4a3a', scarf:'#8a2a2a', stick:true, pitch:0.7 },
};
