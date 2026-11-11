/* Padova's scenes in the frame (engine/render/sprites.js draw() asks): the pre-rendered backgrounds of the piazza, Caffè
   Aurora, Piazza del Santo, the market, the museum square, the galleria, the station and San Lorenzo (render/backgrounds.js
   and the scenes' own render files), what lies on the ground, and the things in the depth-sorted pass. */
Object.assign(UNIT, {
  buildBackgrounds(){ buildBg(); buildBgSL(); buildBgAU(); buildBgSanto(); buildBgMercato(); buildBgMuseo(); },
  drawBack(t, vw, vh){
    const inPiazza = S.scene === 'piazza', inAU = S.scene === 'aurora', inSanto = S.scene === 'santo', inMercato = S.scene === 'mercato', inMuseo = S.scene === 'museo', inGal = S.scene === 'galleria', inStaz = S.scene === 'stazione';
    if (inStaz && !bgStazione) buildBgStazione();
    const inShop = !!shopOf();
    const base = inPiazza ? bg : inAU ? bgAU : inSanto ? bgSanto : inMercato ? bgMercato : inMuseo ? bgMuseo : inGal ? galleriaBg() : inStaz ? bgStazione : inShop ? shopBg(S.scene) : bgSL;
    if (base && inGal){ const k = base.width / sceneW(); ctx.drawImage(base, cam.x * k, cam.y * k, vw * k, vh * k, cam.x, cam.y, vw, vh); }
    else if (base) ctx.drawImage(base, 0, 0, W, H);
    if (inGal) drawGalleriaWorks(t);
    if (inPiazza) drawFountain(t);
    return true;
  },
  drawProps(t, { art, inShop }){
    const inPiazza = S.scene === 'piazza', inAU = S.scene === 'aurora', inSanto = S.scene === 'santo', inMercato = S.scene === 'mercato', inMuseo = S.scene === 'museo', inGal = S.scene === 'galleria', inStaz = S.scene === 'stazione';
    if (inAU) drawOurTable();
    else if (inSanto || inMercato || inMuseo || inPiazza || inGal || inStaz || inShop || art){}
    else if (S.tut === 'l3-find' || S.tut === 'l3-done' || S.lesson >= 4){
      ctx.save(); ctx.translate(740, 126); ctx.fillStyle = '#e07a2f'; rr(ctx, -54, -10, 108, 20, 4); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '700 11px "Bodoni Moda", Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Caffè Aurora', 0, 1); ctx.restore();
    }
  },
  sceneEnts(t, ents){
    if (S.scene === 'piazza') ents.push({ y:178, draw:barClosed() ? drawBarShutter : drawCounter });   // (at night: the shutter, render/night.js)
    if (S.scene === 'stazione') stazioneEnts().forEach(e => ents.push(e));
  },
  sceneEntsLate(t, ents){
    const inAU = S.scene === 'aurora', inSanto = S.scene === 'santo', inMercato = S.scene === 'mercato', inMuseo = S.scene === 'museo', inGal = S.scene === 'galleria';
    if (inAU) DINERS.forEach(d => ents.push({ y:d.y, draw:() => drawPerson(d, t) }));
    if (inMercato) MERCATO_FRONT.forEach(f => ents.push({ y:f.y, draw:() => ctx.drawImage(f.c, 0, f.top, W, f.h) }));
    if (inMercato) ents.push({ y:MERCATO_PROPS_Y, draw:drawMercatoProps });
    if (inSanto && GM_SPRITE) ents.push({ y:GM_SPRITE.y, draw:drawStatueSprite });
    if (inGal) galleriaEnts(t).forEach(e => ents.push(e));
    if (inMuseo){ if (TOWER_SPRITE) ents.push({ y:TOWER_SPRITE.y, draw:drawTowerSprite }); MUSEO_FRONT.forEach(f => ents.push({ y:f.y, draw:() => ctx.drawImage(f.c, 0, f.top, W, f.h) })); }
  },
  doorLabel:d => d.work && mispyActive() ? 'È questo?' : undefined,      // E on a work while Vedo, vedo… nel museo runs (ui/museum-ispy.js)
  landmarkGuide:l => l.work && mispyActive() ? `<span class="gnear"><span class="gkey">Press <kbd>E</kbd> (or click it) to choose ${l.lookAt}.</span><span class="gtap">Tap ${l.lookAt} to choose it.</span></span>` : undefined,
});
UNIT.musicTempo = () => musicTempo();          // buskers sway faster when the music does (quests/12-musica)

/* the bar's counter (Bar Centrale, the piazza) and the fountain */
function drawCounter(){
  const x = 770, y = 156, w = 140, h = 24;
  ctx.fillStyle = 'rgba(30,20,10,.25)'; rr(ctx, x + 3, y + 5, w, h, 4); ctx.fill();
  ctx.fillStyle = '#1c3d8f'; rr(ctx, x, y, w, h, 4); ctx.fill();
  ctx.fillStyle = '#f1ece2'; rr(ctx, x, y, w, h - 7, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(150,140,125,.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 20, y + 4); ctx.quadraticCurveTo(x + 50, y + 12, x + 80, y + 5); ctx.moveTo(x + 90, y + 13); ctx.quadraticCurveTo(x + 110, y + 4, x + 135, y + 10); ctx.stroke();
  ctx.fillStyle = 'rgba(200,228,238,.9)'; rr(ctx, x + 6, y + 2, 54, 13, 3); ctx.fill();
  ctx.strokeStyle = '#8fb3c2'; ctx.stroke();
  [[14, '#d9a24a', 'c'], [24, '#d9a24a', 'c'], [35, '#e7bf73', 'b'], [45, '#c7843a', 's'], [53, '#c7843a', 's']].forEach(([dx, col, k]) => {
    ctx.fillStyle = col;
    if (k === 'c'){ ctx.beginPath(); ctx.arc(x + dx, y + 9, 4, Math.PI * 0.1, Math.PI * 0.9 + Math.PI); ctx.fill(); }
    else if (k === 'b'){ circ(ctx, x + dx, y + 8.5, 4); ctx.fill(); ctx.fillStyle = '#fff'; circ(ctx, x + dx - 1, y + 7.5, 1); ctx.fill(); }
    else { ell(ctx, x + dx, y + 8.5, 3.5, 4.5); ctx.fill(); ctx.strokeStyle = '#9b5f22'; ctx.beginPath(); ctx.moveTo(x + dx - 2, y + 6); ctx.lineTo(x + dx + 2, y + 6); ctx.moveTo(x + dx - 2.5, y + 9); ctx.lineTo(x + dx + 2.5, y + 9); ctx.stroke(); }
  });
  ctx.fillStyle = '#2b2b2b'; rr(ctx, x + 66, y + 2, 18, 12, 2); ctx.fill();
  ctx.fillStyle = '#7fd18b'; ctx.fillRect(x + 69, y + 4, 12, 3);
  ctx.fillStyle = '#c9ccd2'; rr(ctx, x + 96, y - 5, 38, 19, 3); ctx.fill();
  ctx.fillStyle = '#c23b2a'; rr(ctx, x + 98, y - 3, 34, 5, 2); ctx.fill();
  ctx.fillStyle = '#fff'; circ(ctx, x + 106, y + 9, 3); ctx.fill(); circ(ctx, x + 123, y + 9, 3); ctx.fill();
}

function drawFountain(t){
  const { x, y } = FOUNTAIN;
  ctx.fillStyle = 'rgba(30,20,10,.18)'; circ(ctx, x + 4, y + 6, 84); ctx.fill();
  ctx.fillStyle = '#e7e0d0'; circ(ctx, x, y, 82); ctx.fill();
  ctx.strokeStyle = '#a99f8a'; ctx.lineWidth = 2; ctx.stroke();
  const gr = ctx.createRadialGradient(x, y, 10, x, y, 70);
  gr.addColorStop(0, '#7db7d9'); gr.addColorStop(1, '#3d77a3');
  ctx.fillStyle = gr; circ(ctx, x, y, 69); ctx.fill();
  ctx.strokeStyle = '#c9c0ac'; ctx.lineWidth = 2; ctx.stroke();
  [[-30, 22], [18, 40], [40, -20], [-44, -10], [8, -48], [-12, 46]].forEach(([dx, dy]) => {
    ctx.fillStyle = '#d9b44a'; circ(ctx, x + dx, y + dy, 1.8); ctx.fill();
  });
  for (let k = 0; k < 3; k++){
    const ph = RM ? (k + 1) / 4 : ((t * 0.35 + k / 3) % 1);
    ctx.strokeStyle = `rgba(255,255,255,${(1 - ph) * 0.5})`; ctx.lineWidth = 1.5;
    circ(ctx, x, y, 20 + ph * 47); ctx.stroke();
  }
  ctx.fillStyle = '#e7e0d0'; circ(ctx, x, y, 18); ctx.fill(); ctx.strokeStyle = '#a99f8a'; ctx.stroke();
  ctx.fillStyle = '#cfc6b2'; circ(ctx, x, y, 10); ctx.fill();
  ctx.fillStyle = '#a8d7ef'; circ(ctx, x, y, 5); ctx.fill();
}

/* the night lighting pass's lights in Padova's scenes (engine/render/night.js) */
Object.assign(NIGHT_LIGHTS, {
  piazza:{
    lamps:[[250, 200], [690, 200], [250, 470], [690, 470], [60, 290], [900, 420], [470, 560], [360, 236, 70]],   // (the last: over the buskers, quests/12-musica)
    wins:[18, 78, 140, 200, 262, 318, 384, 440, 500, 552, 616, 664].map(x => [x, 98, 12, 10]),
    glows:[[470, 340, 120, 'rgba(140,195,255,.28)'], [470, 340, 175, 'rgba(255,190,110,.16)']],
  },
  sanlorenzo:{
    lamps:[[360, 320], [640, 330], [60, 330], [880, 345], [540, 560], [240, 190]],
    wins:[[686, 96, 108, 70], [404, 70, 30, 14], [826, 262, 118, 22], [200, 380, 120, 12], [500, 236, 116, 20]],
    glows:[[818, 272, 40, 'rgba(80,230,140,.35)'], [170, 62, 40, 'rgba(255,200,120,.3)'], [658, 126, 50, 'rgba(255,190,110,.35)']],
  },
  santo:{
    lamps:[[150, 250], [810, 250], [150, 470], [810, 470], [480, 560]],
    wins:[[440, 150, 80, 22]],
    glows:[[480, 190, 90, 'rgba(255,200,130,.3)']],
  },
  mercato:{ lamps:[[480, 300], [480, 500], [160, 520], [800, 530], [480, 170]], wins:[], glows:[] },
  museo:{
    lamps:[[262, 200], [262, 470], [818, 200], [818, 470], [540, 560]],
    wins:Array.from({ length:13 }, (_, k) => 252 + k * 46).filter(x => !(x > 340 && x < 470) && !(x > 526 && x < 704)).map(x => [x + 1, 110, 17, 26]).concat([[366, 112, 68, 38]]),
    glows:[[112, 113, 34, 'rgba(255,240,190,.35)']],
  },
  /* the bridge draws its own lighting pass (render/ponte.js: SCENE_ART.ponte.night, the lamps coming on one by one); this entry
     lists its lamps for __dbg().night */
  ponte:{ lamps:PONTE.lamps.map(([x, y]) => [x, y - 85, 90]), wins:[], glows:[] },
  /* the park (world/parco.js): its lamps, the pond in the moonlight */
  parco:{
    lamps:PARCO.lamps.map(([x, y]) => [x, y - 60, 46]),
    wins:[[890, 130, 22, 14]],
    glows:[[770, 462, 130, 'rgba(150,190,255,.20)'], [860, 140, 50, 'rgba(255,200,120,.25)'], ...PARCO.lamps.map(([x, y]) => [x, y - 6, 92, 'rgba(255,186,96,.26)'])],
  },
  /* the station (world/stazione.js): platform lamps, the board, the ticket office, the concourse lights */
  stazione:{
    lamps:[[246, 60], [246, 200], [646, 60], [646, 200], [250, 520], [480, 450], [710, 520]],
    wins:[],
    glows:[[450, 330, 110, 'rgba(255,230,120,.18)'], [96, 420, 100, 'rgba(255,210,140,.3)'], [910, 350, 60, 'rgba(255,190,120,.25)'], [646, 290, 30, 'rgba(90,230,130,.4)'], [246, 290, 30, 'rgba(90,230,130,.4)']],
  },
});
/* the pre-rendered backgrounds, for __nightProbe() */
UNIT.sceneBase = sc => ({ piazza:bg, sanlorenzo:bgSL, aurora:bgAU, santo:bgSanto, mercato:bgMercato, museo:bgMuseo, stazione:bgStazione })[sc];

/* ---------- Bar Centrale at night: closed, the shutter down ---------- */
const barClosed = () => daytime() === 'night';
UNIT.nightDbg = () => ({ barClosed:barClosed() });     // (__dbg().night.barClosed)
function drawBarShutter(){
  const x = 704, y = 128, w = 232, h = 54;
  ctx.fillStyle = 'rgba(30,20,10,.3)'; ctx.fillRect(x + 3, y + 4, w, h);
  ctx.fillStyle = '#8d9096'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(40,44,52,.45)'; ctx.lineWidth = 1;
  for (let yy = y + 4; yy < y + h; yy += 5){ ctx.beginPath(); ctx.moveTo(x, yy + 0.5); ctx.lineTo(x + w, yy + 0.5); ctx.stroke(); }
  ctx.fillStyle = '#5c6068'; ctx.fillRect(x, y + h - 5, w, 5);
  ctx.fillStyle = '#fffdf8'; rr(ctx, x + w / 2 - 40, y + 16, 80, 20, 3); ctx.fill(); ctx.strokeStyle = '#c23b2a'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#c23b2a'; ctx.font = '800 12px "Titillium Web", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CHIUSO', x + w / 2, y + 27);
  /* the chairs, stacked on the tables */
  TABLES.forEach(([tx, ty]) => { ctx.fillStyle = '#1c3d8f'; rr(ctx, tx - 7, ty - 9, 14, 6, 2); ctx.fill(); rr(ctx, tx - 7, ty + 3, 14, 6, 2); ctx.fill(); });
}
