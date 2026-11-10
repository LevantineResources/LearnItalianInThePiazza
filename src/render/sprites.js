/* Bar counter, fountain, people, pigeons, name pills, quest markers, and draw(). */

/* the bar counter is drawn in the depth-sorted pass so Enzo stands behind it */
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

function drawPerson(p, t){
  if (p.animal){ drawDog(p, t); return; }          // a dog (the night train's Biscuit and Brigante: render/treno.js)
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
    ctx.fillStyle = galShade(p.body, -0.25); ell(ctx, 10, -5, 7, 4); ctx.fill(); ell(ctx, 10, 5, 7, 4); ctx.fill();
  }
  if (p.stick){ ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(6, 13); ctx.lineTo(22, 18); ctx.stroke(); ctx.fillStyle = '#5a3a22'; circ(ctx, 6, 13, 2); ctx.fill(); }   // a walking stick
  if (p.shopping){ ctx.fillStyle = p.shopping; rr(ctx, -4, 12, 12, 9, 2); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#5f8a3a'; ctx.fillRect(-1, 11, 4, 3); }   // a shopping bag (il signor Bepi)
  if (p.isPlayer){ ctx.fillStyle = '#f4b928'; rr(ctx, -16, -9, 10, 18, 4); ctx.fill(); ctx.strokeStyle = '#0f2260'; ctx.lineWidth = 1.5; ctx.stroke(); }
  ctx.fillStyle = p.body; ell(ctx, 0, 0, 9, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.stroke();
  if (p.apron){ ctx.fillStyle = p.apron; ell(ctx, 5, 0, 4, 9); ctx.fill(); }
  if (p.scarf){ ctx.fillStyle = p.scarf; ell(ctx, 2, 0, 5, 10); ctx.fill(); ctx.fillRect(4, 3, 9, 3.5); }   // a scarf round the neck, its end hanging in front
  if (p.carryDog && NPC.biscuit){   // a small dog held in the arms (Margaret with Biscuit on the vaporetto, Lesson 15)
    const b = NPC.biscuit; ctx.fillStyle = b.coat || '#e3c08a'; ell(ctx, 10, 0, 6, 8); ctx.fill(); circ(ctx, 15, -3, 4.2); ctx.fill();
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
  if (p.book && S.handbookLost && S.lesson >= 6){ ctx.fillStyle = '#1c3d8f'; ctx.fillRect(9, -8, 9, 16); ctx.fillStyle = '#f4b928'; ctx.fillRect(9, -8, 2, 16); }
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
    const tp = musicTempo(), sw = RM ? 0 : Math.sin(t * 6 * tp) * 2.2;
    ctx.fillStyle = '#a0612a'; ell(ctx, 7, 7, 7, 5.5, 0.5); ctx.fill(); ell(ctx, 3, 1, 5, 4, 0.5); ctx.fill();
    ctx.fillStyle = '#2b1d14'; circ(ctx, 5, 4, 1.8); ctx.fill();
    ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(1, -2); ctx.lineTo(-6, -14); ctx.stroke();
    ctx.fillStyle = p.skin; circ(ctx, 9 + sw, 6 - sw * 0.5, 3.4); ctx.fill();
  }
  if (p.mic){   // a singer: a microphone held up, swaying with the music
    const tp = musicTempo(), sw = RM ? 0 : Math.sin(t * 4 * tp) * 1.5;
    ctx.fillStyle = '#2b2b2b'; ctx.fillRect(10 + sw, -3, 7, 2.4); ctx.fillStyle = '#9aa0aa'; circ(ctx, 18 + sw, -2, 2.6); ctx.fill();
  }
  if (p.toque){   // a chef's tall white hat, seen from above (Nino, Lesson 13)
    ctx.fillStyle = 'rgba(0,0,0,.14)'; circ(ctx, 1, 1, 11.5); ctx.fill();
    ctx.fillStyle = '#fffdf8'; circ(ctx, 0, 0, 11); ctx.fill(); ctx.strokeStyle = '#d8d2c4'; ctx.lineWidth = 1.2;
    [[-4, -3], [3, -4], [4, 3], [-3, 4]].forEach(([x, y]) => { circ(ctx, x, y, 4); ctx.stroke(); });
  }
  if (p.brim){   // a felt hat with a brim (Margaret, Lesson 13)
    ctx.fillStyle = 'rgba(0,0,0,.15)'; circ(ctx, 1, 1, 13); ctx.fill();
    ctx.fillStyle = p.brim; circ(ctx, 0, 0, 12.5); ctx.fill(); ctx.fillStyle = galShade(p.brim, 0.18); circ(ctx, 0, 0, 7.5); ctx.fill();
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
  const vw = cam.overview ? sceneW() : W, vh = cam.overview ? sceneH() : H;
  ctx.setTransform(DPR, 0, 0, DPR, -cam.x * DPR, -cam.y * DPR);      // world coordinates from here on (cam: world/scenes.js)
  const inPiazza = S.scene === 'piazza', inAU = S.scene === 'aurora', inSanto = S.scene === 'santo', inMercato = S.scene === 'mercato', inMuseo = S.scene === 'museo', inGal = S.scene === 'galleria', inStaz = S.scene === 'stazione';
  if (inStaz && !bgStazione) buildBgStazione();
  const inShop = !!shopOf();                       // a shop interior (world/shops.js, render/shops.js)
  const base = inPiazza ? bg : inAU ? bgAU : inSanto ? bgSanto : inMercato ? bgMercato : inMuseo ? bgMuseo : inGal ? galleriaBg() : inStaz ? bgStazione : inShop ? shopBg(S.scene) : bgSL;
  const art = SCENE_ART[S.scene];                  // a scene with art of its own: the bridge, the park (render/ponte.js, render/parco.js)
  if (art && art.sway) ctx.translate(0, art.sway(t));   // (a scene that rocks: the night train, render/treno.js)
  if (art) art.back(t);
  else if (base && inGal){ const k = base.width / sceneW(); ctx.drawImage(base, cam.x * k, cam.y * k, vw * k, vh * k, cam.x, cam.y, vw, vh); }
  else if (base) ctx.drawImage(base, 0, 0, W, H);
  if (inGal) drawGalleriaWorks(t);
  if (inPiazza) drawFountain(t);
  if (flock()) flock().filter(p => p.fly <= 0).forEach(p => drawPigeon(p, t));
  if (inAU) drawOurTable();
  else if (inSanto || inMercato || inMuseo || inPiazza || inGal || inStaz || inShop || art){}
  else if (S.tut === 'l3-find' || S.tut === 'l3-done' || S.lesson >= 4){
    ctx.save(); ctx.translate(740, 126); ctx.fillStyle = '#e07a2f'; rr(ctx, -54, -10, 108, 20, 4); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '700 11px "Bodoni Moda", Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Caffè Aurora', 0, 1); ctx.restore();
  }
  if (target && goalPt && !frozen()){
    ctx.strokeStyle = 'rgba(244,185,40,.9)'; ctx.lineWidth = 2;
    circ(ctx, goalPt.x, goalPt.y, 7 + (RM ? 0 : Math.sin(t * 6) * 2)); ctx.stroke();
  }
  const ents = [...activeNpcs(), player].map(p => ({ y:p.y, draw:() => drawPerson(p, t) }));
  if (inPiazza) ents.push({ y:178, draw:barClosed() ? drawBarShutter : drawCounter });   // (at night: the shutter, render/night.js)
  if (inStaz) stazioneEnts().forEach(e => ents.push(e));
  if (inShop) shopEnts().forEach(e => ents.push(e));
  if (art && art.ents) art.ents(t).forEach(e => ents.push(e));
  SCENE_EXTRAS.forEach(x => { if (x.scene === S.scene && (!x.when || x.when())) (x.ents(t) || []).forEach(e => ents.push(e)); });   // (engine/quests.js: a quest's own things in a scene)
  if (inAU) DINERS.forEach(d => ents.push({ y:d.y, draw:() => drawPerson(d, t) }));
  if (inMercato) MERCATO_FRONT.forEach(f => ents.push({ y:f.y, draw:() => ctx.drawImage(f.c, 0, f.top, W, f.h) }));
  if (inMercato) ents.push({ y:MERCATO_PROPS_Y, draw:drawMercatoProps });
  if (inSanto && GM_SPRITE) ents.push({ y:GM_SPRITE.y, draw:drawStatueSprite });
  if (inGal) galleriaEnts(t).forEach(e => ents.push(e));
  if (inMuseo){ if (TOWER_SPRITE) ents.push({ y:TOWER_SPRITE.y, draw:drawTowerSprite }); MUSEO_FRONT.forEach(f => ents.push({ y:f.y, draw:() => ctx.drawImage(f.c, 0, f.top, W, f.h) })); }
  ents.sort((a, b) => a.y - b.y).forEach(e => e.draw());
  if (flock()) flock().filter(p => p.fly > 0).forEach(p => drawPigeon(p, t));
  drawNight();                                     // the night lighting pass (Lesson 12 on: render/night.js)
  SCENE_EXTRAS.forEach(x => { if (x.after && x.scene === S.scene && (!x.when || x.when())) x.after(t); });   // (lights that shine through the night)
  const bob = RM ? 0 : Math.sin(t * 3) * 2;
  const goal = OBJ_NPC[S.tut] || (hooks().find(h => h.markers && h.markers[S.tut]) || {}).markers?.[S.tut];
  const qm = questMarkerIds();                     // quest givers and the people the current steps need (engine/quests.js)
  for (const n of activeNpcs()){
    const isGoal = n.id === goal || qm.has(n.id);
    if ((n.crowd || n.ambient) && !isGoal) continue;   // the crowd, museum visitors: no names, no question marks
    if (S.known[n.id]) pill(n.x, n.y - 24, isGoal ? `${n.name}  !` : n.name, isGoal ? '#f4b928' : '#1c3d8f', isGoal ? '#0f2260' : '#f4b928');
    else if (isGoal) bubbleMark(n.x, n.y - 36 + bob, '!', '#f4b928', '#0f2260');
    else bubbleMark(n.x, n.y - 36 + bob, '?', '#fffdf8', '#1c3d8f');
  }
  if (!frozen() && cutscenePrompt()){
    const n = nearLandmark() ? null : nearestNpc();
    if (n){ const o = n.promptOffset || { x:0, y:50 }; pill(n.x + o.x, n.y + o.y, n.crowd ? 'E' : 'Parla  ·  E', '#f4b928', '#0f2260'); }
    else { const d = nearestDoor(); if (d){ const p = d.pill || (d.area ? doorSpot(d, player.x, player.y) : { x:d.x, y:d.y - 18 }); pill(p.x, d.area && !d.pill ? p.y - 22 : p.y, (d.label || (d.work && mispyActive() ? 'È questo?' : d.look ? 'Guarda' : 'Entra')) + '  ·  E', '#f4b928', '#0f2260'); } }
  }
  drawWorldBubbles();
}
