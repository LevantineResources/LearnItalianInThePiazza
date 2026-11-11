/* People, pigeons, name pills, quest markers, dogs, and draw() (the frame: the scene's background, the depth-sorted pass,
   the night, the marks and prompts; a unit draws its own scenes' art through SCENE_ART or its draw hooks). */

function drawPerson(p, t){
  if (unitHook('drawPerson', p, t)) return;        // (a unit that draws its people its own way: Unit 2's upright people)
  if (p.animal){ drawDog(p, t); return; }          // a dog (below)
  const ang = Math.atan2(p.face.y, p.face.x);
  if (p.dog){
    const dx = p.x + 22, dy = p.y + 16;
    ctx.strokeStyle = '#7a3a2a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.x + 6, p.y + 10); ctx.quadraticCurveTo(p.x + 18, p.y + 22, dx - 6, dy); ctx.stroke();
    ctx.fillStyle = 'rgba(30,20,10,.2)'; ell(ctx, dx + 2, dy + 3, 10, 6); ctx.fill();
    ctx.fillStyle = '#8a5a33'; ell(ctx, dx, dy, 9, 5); ctx.fill();
    ctx.fillStyle = '#6e4626'; circ(ctx, dx + 8, dy - 1, 4.5); ctx.fill();
    ctx.fillStyle = '#4a2f1e'; ell(ctx, dx + 7, dy - 5, 2, 3); ctx.fill(); ell(ctx, dx + 7, dy + 3, 2, 3); ctx.fill();
    ctx.strokeStyle = '#8a5a33'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx - 9, dy); ctx.lineTo(dx - 13, dy - 3 + (RM ? 0 : Math.sin(t * 9) * 2)); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(30,20,10,.24)'; ell(ctx, p.x + 3, p.y + 5, 18, 12); ctx.fill();
  if (p.suitcase){   // a wheeled suitcase standing beside them, its handle up (travellers at Venezia Santa Lucia, Lesson 15)
    const sx = p.x + (p.suitcaseSide || 1) * 17, sy = p.y + 6;
    ctx.fillStyle = 'rgba(30,20,10,.25)'; rr(ctx, sx - 5, sy - 6, 13, 18, 2); ctx.fill();
    ctx.fillStyle = p.suitcase; rr(ctx, sx - 7, sy - 9, 13, 18, 3); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(sx - 4, sy - 7, 2, 14); ctx.fillStyle = '#2b2b2b'; ctx.fillRect(sx - 3, sy - 14, 6, 5);
  }
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang + (p.moving && !RM ? Math.sin(p.walk) * 0.12 : 0));
  if (p.kid) ctx.scale(0.76, 0.76);                // a child (the school group, Lesson 10)
  if (p.flag){   // a guide's little flag on a stick, held up in front (the teacher, Lesson 10)
    ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(5, 15); ctx.lineTo(16, 22); ctx.stroke();
    ctx.fillStyle = p.flag; ctx.beginPath(); ctx.moveTo(16, 22); ctx.lineTo(9, 32); ctx.lineTo(19, 30); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 0.8; ctx.stroke();
  }
  if (p.bag){ ctx.fillStyle = p.bag; rr(ctx, -6, -21, 12, 7, 2); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; ctx.stroke(); }   // a handbag on the shoulder
  if (p.backpack){   // a hiker's backpack, on the back (Sofia, Lesson 9)
    ctx.fillStyle = p.backpack; rr(ctx, -19, -10, 13, 20, 4); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.18)'; rr(ctx, -19, -4, 5, 8, 2); ctx.fill();
    ctx.strokeStyle = '#3b2a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-7, -8); ctx.lineTo(2, -10); ctx.moveTo(-7, 8); ctx.lineTo(2, 10); ctx.stroke();
  }
  if (p.seated){   // sitting (the custodian on his chair, a visitor on a bench): knees in front
    ctx.fillStyle = shade(p.body, -0.25); ell(ctx, 10, -5, 7, 4); ctx.fill(); ell(ctx, 10, 5, 7, 4); ctx.fill();
  }
  if (p.stick){ ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(6, 13); ctx.lineTo(22, 18); ctx.stroke(); ctx.fillStyle = '#5a3a22'; circ(ctx, 6, 13, 2); ctx.fill(); }   // a walking stick
  if (p.shopping){ ctx.fillStyle = p.shopping; rr(ctx, -4, 12, 12, 9, 2); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#5f8a3a'; ctx.fillRect(-1, 11, 4, 3); }   // a shopping bag (il signor Bepi)
  if (p.isPlayer){ ctx.fillStyle = '#f4b928'; rr(ctx, -16, -9, 10, 18, 4); ctx.fill(); ctx.strokeStyle = '#0f2260'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.fillStyle = p.body; ell(ctx, 0, 0, 9, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.stroke();
  if (p.apron){ ctx.fillStyle = p.apron; ell(ctx, 5, 0, 4, 9); ctx.fill(); }
  if (p.scarf){ ctx.fillStyle = p.scarf; ell(ctx, 2, 0, 5, 10); ctx.fill(); ctx.fillRect(4, 3, 9, 3.5); }   // a scarf round the neck, its end hanging in front
  if (p.carryDog && NPC[p.carryDog]){   // a small dog held in the arms (carryDog: the dog's id; Padova: Margaret with Biscuit on the vaporetto, Lesson 15)
    const b = NPC[p.carryDog]; ctx.fillStyle = b.coat || '#e3c08a'; ell(ctx, 10, 0, 6, 8); ctx.fill(); circ(ctx, 15, -3, 4.2); ctx.fill();
    ctx.fillStyle = b.ears || '#a8743c'; ell(ctx, 14, -7, 1.8, 2.6); ctx.fill(); ctx.fillStyle = '#1b1210'; circ(ctx, 19, -3, 1.2); ctx.fill();
  }
  if (p.shawl){   // a shawl round the shoulders (lent at the basilica's door, quest 5): a band over the shoulders, a fringe
    ctx.fillStyle = p.shawl; ell(ctx, -1, 0, 6.5, 16.5); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(-1, 0, 4, 13, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = p.shawl; for (let k = -2; k <= 2; k++) ctx.fillRect(4.5, k * 4 - 1, 2.5, 1.6);
  }
  if (p.pyjamas){   // striped pyjamas (the Ferri children at night, Lesson 13)
    ctx.save(); ell(ctx, 0, 0, 9, 16); ctx.clip(); ctx.strokeStyle = p.pyjamas; ctx.lineWidth = 1.6;
    for (let k = -14; k <= 14; k += 4.5){ ctx.beginPath(); ctx.moveTo(-10, k); ctx.lineTo(10, k); ctx.stroke(); } ctx.restore();
  }
  if (p.parcel){   // a little parcel wrapped in paper and string, held in front (Gianni's leftovers, Lesson 13)
    ctx.fillStyle = '#d9b98a'; rr(ctx, 9, -6, 9, 12, 2); ctx.fill(); ctx.strokeStyle = '#8a5a33'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(13.5, -6); ctx.lineTo(13.5, 6); ctx.moveTo(9, 0); ctx.lineTo(18, 0); ctx.stroke();
  }
  if (p.book && (unitHook('showBook', p) ?? true)){   // (a book in hand; the unit may say when: Padova, only Lesson 6's lost handbook)
  ctx.fillStyle = '#1c3d8f'; ctx.fillRect(9, -8, 9, 16); ctx.fillStyle = '#f4b928'; ctx.fillRect(9, -8, 2, 16); }
  if (p.stain){   // a coffee stain down the front of the shirt (Mark, Lesson 7)
    ctx.fillStyle = 'rgba(96,58,30,.92)'; ell(ctx, 5, 10.8, 4.4, 3.6, 0.5); ctx.fill(); ell(ctx, 1.5, 12.8, 2.2, 1.8); ctx.fill();
    ell(ctx, 5.5, -11, 3, 2.4, -0.4); ctx.fill(); circ(ctx, 8, 7.4, 1.1); ctx.fill(); circ(ctx, 7.6, -7.8, 0.9); ctx.fill();
    ctx.fillStyle = 'rgba(60,34,16,.6)'; ell(ctx, 5.4, 10.4, 2, 1.5, 0.5); ctx.fill();
  }
  if (p.camera){   // a camera held up in front, on a strap (tourists, Lesson 10)
    ctx.strokeStyle = 'rgba(30,30,30,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4, -12); ctx.lineTo(11, -5); ctx.moveTo(4, 12); ctx.lineTo(11, 5); ctx.stroke();
    ctx.fillStyle = p.camera; rr(ctx, 10, -7, 7, 14, 2); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.stroke();
    ctx.fillStyle = '#1b1b1b'; circ(ctx, 18.5, 0, 3); ctx.fill(); ctx.fillStyle = '#7fa8c9'; circ(ctx, 18.5, 0, 1.4); ctx.fill();
  }
  if (p.selfie){   // a phone held up in front, for a selfie (Lesson 12's couple on the bridge)
    ctx.fillStyle = p.selfie; rr(ctx, 11, -5, 5, 10, 1.4); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = '#9cc4e4'; ctx.fillRect(12, -4, 3, 8);
  }
  if (p.sketch){   // a sketchbook held open in front, a pencil (a student drawing, Lesson 11)
    ctx.fillStyle = '#fffdf8'; ctx.fillRect(9, -9, 9, 18); ctx.strokeStyle = '#8a8070'; ctx.lineWidth = 0.8; ctx.strokeRect(9, -9, 9, 18);
    ctx.strokeStyle = 'rgba(60,50,40,.6)'; ctx.beginPath(); ctx.moveTo(11, -5); ctx.quadraticCurveTo(14, -1, 12, 3); ctx.moveTo(15, -6); ctx.lineTo(16, 5); ctx.stroke();
    ctx.strokeStyle = '#d9a03a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(7, 12); ctx.lineTo(15, 6); ctx.stroke();
  }
  if (p.notepad){ ctx.fillStyle = '#fffdf8'; ctx.fillRect(9, 6, 7, 9); ctx.strokeStyle = '#9a948a'; ctx.lineWidth = 0.8; ctx.strokeRect(9, 6, 7, 9); }
  const reading = p.newspaper && !S.met[p.id] && !(convo && convo.npc === p);
  if (reading){
    ctx.fillStyle = '#f7f3ea'; ctx.fillRect(9, -11, 7, 22);
    ctx.fillStyle = '#9a948a'; for (let k = -8; k < 10; k += 4) ctx.fillRect(10, k, 5, 1);
  }
  ctx.fillStyle = p.skin; circ(ctx, reading ? 9 : 3, 15, 3.6); ctx.fill(); circ(ctx, reading ? 9 : 3, -15, 3.6); ctx.fill();
  if (p.longHair){ ctx.fillStyle = p.hair; circ(ctx, -10, 0, 5); ctx.fill(); }
  ctx.fillStyle = p.hair; circ(ctx, 0, 0, 9.5); ctx.fill();
  ctx.save(); circ(ctx, 0, 0, 9.5); ctx.clip(); ctx.fillStyle = p.skin; circ(ctx, 6, 0, 8); ctx.fill(); ctx.restore();
  if (p.dog){ ctx.fillStyle = p.hair; circ(ctx, -6, 0, 4.5); ctx.fill(); }
  if (p.phone){   // a phone held to the ear (il signor Rinaldi, Lesson 13)
    ctx.fillStyle = '#1b1b1b'; rr(ctx, 0, 8, 6, 10, 1.5); ctx.fill(); ctx.fillStyle = '#7fb0e0'; ctx.fillRect(1, 10, 4, 5);
  }
  if (p.audio){   // an audio guide held to the ear (Lesson 11)
    ctx.fillStyle = p.audio; rr(ctx, 1, 8, 5, 9, 1.5); ctx.fill(); ctx.fillStyle = '#7fa8c9'; ctx.fillRect(2, 10, 3, 3);
  }
  if (p.flatcap){   // a flat cap, its short peak in front (il signor Bepi, Lesson 15)
    ctx.fillStyle = 'rgba(0,0,0,.14)'; circ(ctx, 1, 1, 10.5); ctx.fill();
    ctx.fillStyle = p.flatcap; ell(ctx, 1, 0, 10.5, 9.5); ctx.fill(); ell(ctx, 8, 0, 4, 7.5); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(6, -8); ctx.lineTo(6, 8); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; for (let k = -6; k <= 6; k += 3){ ctx.beginPath(); ctx.moveTo(-8, k); ctx.lineTo(5, k); ctx.stroke(); }
  }
  if (p.cap){   // a peaked cap (the school group's)
    ctx.fillStyle = p.cap; circ(ctx, -1, 0, 9); ctx.fill(); ell(ctx, 8, 0, 4.5, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; circ(ctx, -1, 0, 9); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; circ(ctx, -3, -2, 3); ctx.fill();
  }
  if (p.flowers){   // a bunch of flowers held in front (Giorgia's mum, Lesson 12)
    ctx.fillStyle = '#4f7a3a'; ctx.fillRect(8, 3, 9, 2.2);
    [['#e0405a', 18, 1], ['#f4b928', 19, 5], ['#e0405a', 21, 3], ['#f7c6d0', 17, 6]].forEach(([c, x, y]) => { ctx.fillStyle = c; circ(ctx, x, y, 2.6); ctx.fill(); });
  }
  if (p.guitar){   // a busker's guitar across the body, the strumming hand (faster when the music is: musicTempo(), quests/12-musica)
    const tp = unitHook('musicTempo') || 1, sw = RM ? 0 : Math.sin(t * 6 * tp) * 2.2;
    ctx.fillStyle = '#a0612a'; ell(ctx, 7, 7, 7, 5.5, 0.5); ctx.fill(); ell(ctx, 3, 1, 5, 4, 0.5); ctx.fill();
    ctx.fillStyle = '#2b1d14'; circ(ctx, 5, 4, 1.8); ctx.fill();
    ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(1, -2); ctx.lineTo(-6, -14); ctx.stroke();
    ctx.fillStyle = p.skin; circ(ctx, 9 + sw, 6 - sw * 0.5, 3.4); ctx.fill();
  }
  if (p.mic){   // a singer: a microphone held up, swaying with the music
    const tp = unitHook('musicTempo') || 1, sw = RM ? 0 : Math.sin(t * 4 * tp) * 1.5;
    ctx.fillStyle = '#2b2b2b'; ctx.fillRect(10 + sw, -3, 7, 2.4); ctx.fillStyle = '#9aa0aa'; circ(ctx, 18 + sw, -2, 2.6); ctx.fill();
  }
  if (p.toque){   // a chef's tall white hat, seen from above (Nino, Lesson 13)
    ctx.fillStyle = 'rgba(0,0,0,.14)'; circ(ctx, 1, 1, 11.5); ctx.fill();
    ctx.fillStyle = '#fffdf8'; circ(ctx, 0, 0, 11); ctx.fill(); ctx.strokeStyle = '#d8d2c4'; ctx.lineWidth = 1.2;
    [[-4, -3], [3, -4], [4, 3], [-3, 4]].forEach(([x, y]) => { circ(ctx, x, y, 4); ctx.stroke(); });
  }
  if (p.brim){   // a felt hat with a brim (Margaret, Lesson 13)
    ctx.fillStyle = 'rgba(0,0,0,.15)'; circ(ctx, 1, 1, 13); ctx.fill();
    ctx.fillStyle = p.brim; circ(ctx, 0, 0, 12.5); ctx.fill(); ctx.fillStyle = shade(p.brim, 0.18); circ(ctx, 0, 0, 7.5); ctx.fill();
    ctx.strokeStyle = '#c9a54a'; ctx.lineWidth = 1.6; circ(ctx, 0, 0, 8); ctx.stroke();
  }
  if (p.hat){
    ctx.fillStyle = 'rgba(0,0,0,.15)'; circ(ctx, 1, 1, 14); ctx.fill();
    ctx.fillStyle = '#e3c47a'; circ(ctx, 0, 0, 13.5); ctx.fill();
    ctx.strokeStyle = '#c23b2a'; ctx.lineWidth = 2.2; circ(ctx, 0, 0, 8.5); ctx.stroke();
    ctx.fillStyle = '#ecd394'; circ(ctx, 0, 0, 7); ctx.fill();
  }
  ctx.restore();
}

function drawPigeon(p, t){
  const flying = p.fly > 0;
  if (flying){ ctx.fillStyle = 'rgba(30,20,10,.15)'; ell(ctx, p.x, p.y + 4, 6, 3.5, p.dir); ctx.fill(); }
  ctx.save(); ctx.translate(p.x, p.y - (flying ? 12 : 0)); ctx.rotate(p.dir);
  if (flying){
    const f = RM ? 1 : Math.sin(t * 28 + p.ph) * 0.5 + 0.8;
    ctx.fillStyle = '#a7abb6'; ell(ctx, -1, -7 * f, 4, 7 * f); ctx.fill(); ell(ctx, -1, 7 * f, 4, 7 * f); ctx.fill();
  }
  ctx.fillStyle = '#6e727e'; ell(ctx, -7, 0, 3.5, 2.6); ctx.fill();
  ctx.fillStyle = '#8b8f9b'; ell(ctx, 0, 0, 7, 4.5); ctx.fill();
  ctx.fillStyle = '#6f9b8a'; circ(ctx, 4, 0, 2); ctx.fill();
  ctx.fillStyle = '#5d6170'; circ(ctx, 6.2, 0, 2.7); ctx.fill();
  ctx.fillStyle = '#d8a24a'; circ(ctx, 8.8, 0, 0.9); ctx.fill();
  ctx.restore();
}

function pill(x, y, text, bgc, fg){
  ctx.font = '700 13px "Titillium Web", sans-serif';
  const w = ctx.measureText(text).width + 18, h = 22;
  ctx.fillStyle = 'rgba(0,0,0,.2)'; rr(ctx, x - w / 2 + 1.5, y - h + 2, w, h, 7); ctx.fill();
  ctx.fillStyle = bgc; rr(ctx, x - w / 2, y - h, w, h, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 5, y - 0.5); ctx.lineTo(x + 5, y - 0.5); ctx.lineTo(x, y + 5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y - h / 2 + 1);
}
function bubbleMark(x, y, ch, fill_, stroke){
  ctx.fillStyle = fill_; circ(ctx, x, y, 10); ctx.fill();
  ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = stroke; ctx.font = '800 15px "Bodoni Moda", Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(ch, x, y + 1);
}

/* does this person get a name pill or a quest / "?" mark over their head (the loop below)? World bubbles go above it */
function personHasPill(n){
  if (!n || n === player || n.isPlayer || !activeNpcs().includes(n)) return false;
  const goal = OBJ_NPC[S.tut] || (hooks().find(h => h.markers && h.markers[S.tut]) || {}).markers?.[S.tut];
  const isGoal = n.id === goal || questMarkerIds().has(n.id);
  return !((n.crowd || n.ambient) && !isGoal);
}
function draw(t){
  updateCam();
  const vw = cam.overview ? sceneW() : viewW(), vh = cam.overview ? sceneH() : viewH(), z = camZoom() * RES;
  ctx.setTransform(z, 0, 0, z, -cam.x * z, -cam.y * z);      // world coordinates from here on (cam and its zoom: world/scenes.js)
  const inShop = !!shopOf();                       // a shop interior (world/shops.js, render/shops.js)
  const art = SCENE_ART[S.scene];                  // a scene with art of its own (render/helpers.js SCENE_ART)
  if (art && art.sway) ctx.translate(0, art.sway(t));   // (a scene that rocks)
  if (art) art.back(t);
  else if (!unitHook('drawBack', t, vw, vh) && inShop) ctx.drawImage(shopBg(S.scene), 0, 0, W, H);   // the unit's pre-rendered backgrounds (Padova: render/backgrounds.js)
  if (flock()) flock().filter(p => p.fly <= 0).forEach(p => drawPigeon(p, t));
  unitHook('drawProps', t, { art, inShop });      // (Padova: things on the ground under the people)
  if (target && goalPt && !frozen()){
    ctx.strokeStyle = 'rgba(244,185,40,.9)'; ctx.lineWidth = 2;
    circ(ctx, goalPt.x, goalPt.y, 7 + (RM ? 0 : Math.sin(t * 6) * 2)); ctx.stroke();
  }
  const ents = [...activeNpcs(), player].map(p => ({ y:p.y, draw:() => drawPerson(p, t) }));
  unitHook('sceneEnts', t, ents);                  // the unit's own things in the depth-sorted pass (Padova: the bar's counter, the station)
  if (inShop) shopEnts().forEach(e => ents.push(e));
  if (art && art.ents) art.ents(t).forEach(e => ents.push(e));
  SCENE_EXTRAS.forEach(x => { if (x.scene === S.scene && (!x.when || x.when())) (x.ents(t) || []).forEach(e => ents.push(e)); });   // (core/quests.js: a quest's own things in a scene)
  unitHook('sceneEntsLate', t, ents);              // (Padova: the diners, the market's counters, the statues, the museum)
  ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
  if (flock()) flock().filter(p => p.fly > 0).forEach(p => drawPigeon(p, t));
  routeGuardDraw(t);                               // a lesson's route corridor: the arrow back to it (world/routeguard.js)
  drawNight();                                     // the night lighting pass (Lesson 12 on: render/night.js)
  SCENE_EXTRAS.forEach(x => { if (x.after && x.scene === S.scene && (!x.when || x.when())) x.after(t); });   // (lights that shine through the night)
  const bob = RM ? 0 : Math.sin(t * 3) * 2;
  const goal = OBJ_NPC[S.tut] || (hooks().find(h => h.markers && h.markers[S.tut]) || {}).markers?.[S.tut];
  const qm = questMarkerIds();                     // quest givers and the people the current steps need (engine/quests.js)
  const lift = scene().personLift || 0;            // (people drawn upright: their heads are higher, world/tilemap.js)
  for (const n of activeNpcs()){
    const isGoal = n.id === goal || qm.has(n.id);
    if ((n.crowd || n.ambient) && !isGoal) continue;   // the crowd, museum visitors: no names, no question marks
    if (S.known[n.id]) pill(n.x, n.y - 24 - lift, isGoal ? `${n.name}  !` : n.name, isGoal ? '#f4b928' : '#1c3d8f', isGoal ? '#0f2260' : '#f4b928');
    else if (isGoal) bubbleMark(n.x, n.y - 36 - lift + bob, '!', '#f4b928', '#0f2260');
    else bubbleMark(n.x, n.y - 36 - lift + bob, '?', '#fffdf8', '#1c3d8f');
  }
  if (!frozen() && cutscenePrompt()){
    const n = nearLandmark() ? null : nearestNpc();
    if (n){ const o = n.promptOffset || { x:0, y:50 }; pill(n.x + o.x, n.y + o.y, n.crowd ? 'E' : 'Parla  ·  E', '#f4b928', '#0f2260'); }
    else { const d = nearestDoor(); if (d){ const p = d.pill || (d.area ? doorSpot(d, player.x, player.y) : { x:d.x, y:d.y - 18 }); pill(p.x, d.area && !d.pill ? p.y - 22 : p.y, (d.label || unitHook('doorLabel', d) || (d.look ? 'Guarda' : 'Entra')) + '  ·  E', '#f4b928', '#0f2260'); } }
  }
  drawWorldBubbles();
  zoneDraw();                                      // a loading zone's dip of the light and the place's name (world/tilemap.js)
}

/* ---------- a dog, from above (n.animal === 'dog') ----------
   n.size (1 = small), n.coat, n.ears, n.patch (a darker patch on the back), n.chest, n.collar; n.sit: sitting */
function drawDog(p, t){
  const s = p.size || 1, ang = Math.atan2((p.face || { y:1 }).y, (p.face || { x:0 }).x), sit = p.sit && !p.moving;
  const coat = p.coat || '#d9b27a', ears = p.ears || '#9a6a3a', wag = RM ? 0 : Math.sin(t * (p.moving ? 14 : sit ? 7 : 9)) * (sit ? 0.6 : 0.9);
  ctx.fillStyle = 'rgba(30,20,10,.25)'; ell(ctx, p.x + 2, p.y + 4, 13 * s, 8 * s); ctx.fill();
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang); ctx.scale(s, s);
  /* the tail */
  ctx.strokeStyle = coat; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sit ? -7 : -10, 0); ctx.quadraticCurveTo(sit ? -12 : -16, wag * 5, sit ? -13 : -19, wag * 8); ctx.stroke(); ctx.lineCap = 'butt';
  /* the legs, trotting */
  if (p.moving){ const ph = Math.sin((p.walk || 0) * 1.2) * 3; ctx.fillStyle = shade(coat, -0.2); [[6, -5, ph], [6, 5, -ph], [-6, -5, -ph], [-6, 5, ph]].forEach(([x, y, d]) => { ell(ctx, x + d, y * 1.1, 2.6, 1.8); ctx.fill(); }); }
  /* the body (shorter and rounder, sitting) */
  ctx.fillStyle = coat; if (sit){ ell(ctx, -2, 0, 8, 7.5); ctx.fill(); ctx.fillStyle = shade(coat, -0.12); ell(ctx, -5, -5, 3.5, 3); ctx.fill(); ell(ctx, -5, 5, 3.5, 3); ctx.fill(); } else { ell(ctx, 0, 0, 11, 6.5); ctx.fill(); }
  if (p.patch){ ctx.fillStyle = p.patch; ell(ctx, sit ? -3 : -2, 0, sit ? 5 : 6, 4); ctx.fill(); }
  if (p.chest){ ctx.fillStyle = p.chest; ell(ctx, sit ? 4 : 7, 0, 3, 3.5); ctx.fill(); }
  /* the head: ears, the snout, the nose */
  const hx = sit ? 7 : 10;
  ctx.fillStyle = coat; circ(ctx, hx, 0, 5.6); ctx.fill();
  if (p.collar){ ctx.strokeStyle = p.collar; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, 0, 5.4, Math.PI * 0.6, Math.PI * 1.4); ctx.stroke(); ctx.fillStyle = '#f4c430'; circ(ctx, hx - 5.2, 0, 1.4); ctx.fill(); }
  ctx.fillStyle = ears; ell(ctx, hx - 1.5, -5, 2.6, 3.8, -0.4); ctx.fill(); ell(ctx, hx - 1.5, 5, 2.6, 3.8, 0.4); ctx.fill();
  ctx.fillStyle = shade(coat, 0.18); ell(ctx, hx + 5, 0, 3.2, 2.6); ctx.fill();
  ctx.fillStyle = '#1b1210'; circ(ctx, hx + 7.6, 0, 1.4); ctx.fill(); circ(ctx, hx + 2, -2.4, 0.9); ctx.fill(); circ(ctx, hx + 2, 2.4, 0.9); ctx.fill();
  ctx.restore();
}
