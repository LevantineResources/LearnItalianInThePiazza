/* The station (scene 'stazione', Lesson 12 on): a terminus seen from above. The concourse at the bottom (you come in
   from the street at the bottom edge), the ticket office (Biglietteria) against the west wall with the clerk behind its
   glass, the departures board (Partenze) standing in the middle, and four tracks running north from their buffers with
   two island platforms: binari 1–2 and binari 3–4. A green validating machine (convalida) stands at the head of each
   platform. The background and the trains are drawn in render/stazione.js.
   - The board: stazioneBoard() → rows [{ time, dest, bin, note? }] (a lesson's board() hook, else a default
     afternoon); E or a tap opens openBoard(), the board close up.
   - The trains: STAZ_TRAIN = { on (a train stands on binario 3), kind:'day' | 'night', y (its offset: < 0 = pulling out) };
     trainDepart() runs the departure (a promise; done at once when a cutscene is skipped). A lesson decides when a train
     is there (stazioneTrain() hook → { kind } | null).
   - Doors: 'tabellone' (the board), 'convalida1' / 'convalida3' (the machines: a lesson's door hook takes them, else a
     toast), 'treno' (the open door of the train on binario 3: a lesson's door hook).
   - The map: DEST 'stazione' (world/map.js, unlocked by a lesson's dests.stazione()), the landmark 'stazione' (FS).
   Tests: __dbg().stazione = { board:[rows], train:{ on, kind, y, departing }, near (the door E would use) }. */
const STAZ = {
  tracks:[{ n:1, x:120 }, { n:2, x:316 }, { n:3, x:520 }, { n:4, x:716 }],   // each 56 wide, from y 0 to the buffers (y 286)
  trackW:56, buffer:286, top:300,                                          // the concourse starts at y 300
  platforms:[{ x:176, w:140, bins:[1, 2] }, { x:576, w:140, bins:[3, 4] }],
  office:{ x:18, y:330, w:178, h:78 },                                     // the Biglietteria; its glass front faces south (y 408)
  board:{ x:384, y:304, w:132, h:54 },
  machines:[{ id:'convalida1', x:252, y:288 }, { id:'convalida3', x:652, y:288 }],
  door:{ x:584, y:226 },                                                   // the train's open door on binario 3 (from platform 3–4)
};
const STAZ_TRAIN = { y:0, departing:false };
SCENES.stazione = {
  minY:12, spawn:{ x:480, y:560 },
  C:[ ...STAZ.machines.map(m => ({ x:m.x, y:m.y, r:8 })), { x:120, y:520, r:18 }, { x:840, y:520, r:18 } ],
  R:[ { x:0, y:0, w:176, h:300 }, { x:316, y:0, w:260, h:300 }, { x:716, y:0, w:244, h:300 }, STAZ.office, STAZ.board,
      { x:200, y:150, w:20, h:40 }, { x:672, y:150, w:20, h:40 }, { x:860, y:330, w:100, h:40 } ],
  doors:[
    { id:'tabellone', x:450, y:STAZ.board.y + STAZ.board.h, area:STAZ.board, look:true, lookAt:'the departures board', hit:{ x:STAZ.board.x, y:STAZ.board.y - 30, w:STAZ.board.w, h:STAZ.board.h + 30 }, msg:'' },
    ...STAZ.machines.map(m => ({ id:m.id, x:m.x, y:m.y + 16, label:'Convalida', hit:{ x:m.x - 12, y:m.y - 16, w:24, h:30 }, msg:'' })),
    { id:'treno', x:STAZ.door.x + 12, y:STAZ.door.y, label:'Sali', when:() => stationTrainOn(), hit:{ x:STAZ.door.x - 14, y:STAZ.door.y - 22, w:28, h:44 }, msg:'' },
  ],
};
/* the board: a lesson's board() hook, else an ordinary afternoon */
const STAZ_DEFAULT_BOARD = [
  { time:'15:10', dest:'Verona Porta Nuova', bin:1 }, { time:'15:42', dest:'Bologna Centrale', bin:2 }, { time:'16:05', dest:'Milano Centrale', bin:4 },
  { time:'16:30', dest:'Treviso Centrale', bin:1 }, { time:'17:12', dest:'Vicenza', bin:2 },
];
const stazioneBoard = () => askHooks('board') || STAZ_DEFAULT_BOARD;
const stazioneTrain = () => askHooks('stazioneTrain') || null;
const stationTrainOn = () => !!stazioneTrain() || STAZ_TRAIN.departing;
/* the train on binario 3 pulls out, north, faster and faster (a promise; ends at once in a skipped cutscene) */
function trainDepart(){
  STAZ_TRAIN.kind = (stazioneTrain() || { kind:'day' }).kind; STAZ_TRAIN.departing = true; STAZ_TRAIN.y = 0;
  const t0 = performance.now();
  return new Promise(res => {
    const step = () => {
      const t = (performance.now() - t0) / 1000;
      STAZ_TRAIN.y = -(14 * t * t + 6 * t);
      if (STAZ_TRAIN.y < -760 || RM || (cutsceneOn() && CUT.skip) || S.scene !== 'stazione'){ STAZ_TRAIN.departing = false; STAZ_TRAIN.y = -9999; res(); return; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}
function openBoard(){
  if (frozen()) return;
  const rows = stazioneBoard();
  openModal('board');
  sheet.innerHTML = `<button class="x gm-x" data-close aria-label="Close">×</button>
    <div class="fsboard"><div class="fs-head"><span class="fs-title">Partenze</span><span class="fs-sub">Departures</span><span class="fs-clock">${gameClock() ? clockText(gameClock()) : ''}</span></div>
      <table><thead><tr><th>Ora</th><th>Destinazione</th><th>Binario</th><th></th></tr></thead>
      <tbody>${rows.map(r => `<tr class="${r.cls || ''}"><td class="fs-t">${esc(r.time)}</td><td>${esc(r.dest)}</td><td class="fs-b">${r.bin}</td><td class="fs-n">${esc(r.note || '')}</td></tr>`).join('')}</tbody></table></div>
    <div class="gm-foot"><p><b>Partenze</b> = departures · <b>Ora</b> = time · <b>Binario</b> = platform. Times use the 24-hour clock.</p><button class="btn primary" data-close>Close</button></div>`;
  setTimeout(() => { const b = sheet.querySelector('.gm-foot [data-close]'); if (b) b.focus({ preventScroll:true }); }, 30);
}
const boardOpen = () => modalOpen && sheet.classList.contains('board');
function stazioneDbg(){
  const t = stazioneTrain();
  return { board:stazioneBoard().map(r => `${r.time} ${r.dest} ${r.bin}${r.note ? ' ' + r.note : ''}`), train:{ on:!!t, kind:t ? t.kind : null, y:Math.round(STAZ_TRAIN.y), departing:STAZ_TRAIN.departing },
    open:boardOpen(), near:S.scene === 'stazione' && !frozen() ? (nearestDoor() || {}).id || null : null };
}
