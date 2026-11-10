/* travelTo() between scenes, and the stats block on lesson-complete screens. */

/* ---------- moving between scenes ---------- */
/* o.face: which way the player faces on arrival (fast travel: facing into the place) */
function travelTo(scene, spawn, title, sub, o = {}){
  if (modalOpen) closeModal();
  traveling = true;
  const f = $('#fade');
  $('#fadeTitle').textContent = title || (scene === 'sanlorenzo' ? 'San Lorenzo' : 'Piazza Centrale');
  $('#fadeSub').textContent = sub || (scene === 'sanlorenzo' ? 'Sempre dritto… seconda a destra… a sinistra alla farmacia…' : 'Back the way you came…');
  f.classList.add('on');
  setTimeout(() => {
    S.scene = scene;
    const sp = spawn || SCENES[scene].spawn; player.x = sp.x; player.y = sp.y;
    if (o.face) player.face = { ...o.face };
    target = null; route = []; goalPt = null;
    if (scene === 'sanlorenzo' && !S.visited.sanlorenzo){ S.visited.sanlorenzo = true; if (S.tut === 'l3-mark') S.tut = 'l3-stranger'; }
    if (scene === 'santo'){ S.visited.santo = true; if (S.tut === 'l5-tour') S.tut = 'l5-statue'; }
    save(); renderHUD(); lastGuide = '';
    followerArrive();
    setTimeout(() => { f.classList.remove('on'); traveling = false; }, 700);
  }, RM ? 300 : 1500);
}

/* after a scene change: the follower arrives beside the player (behind them, or to one side: never inside a wall, a desk or
   someone), and a dog at someone's heels arrives with them (Biscuit with Margaret, Lesson 15) */
function followerArrive(){
  const m = followerNpc(); trail.length = 0;
  const f = player.face || { x:0, y:1 }, fl = Math.hypot(f.x, f.y) || 1, fx = f.x / fl, fy = f.y / fl;
  const spot = (who, from, cands, r) => {
    const others = activeNpcs().filter(n => n !== who && !n.animal && n !== m);
    for (const [cx, cy] of cands){
      const x = from.x + cx, y = from.y + cy;
      if (!blocked(x, y, r, true) && Math.hypot(x - player.x, y - player.y) >= 26 && others.every(n => Math.hypot(n.x - x, n.y - y) > 30)) return { x, y };
    }
    return null;
  };
  if (m && activeNpcs().includes(m)){
    const D = 36, s = spot(m, player, [[-34, 8], [-fx * D, -fy * D], [-fx * D - fy * 24, -fy * D + fx * 24], [-fx * D + fy * 24, -fy * D - fx * 24], [-fy * D, fx * D], [fy * D, -fx * D], [34, 8], [-fx * 56, -fy * 56], [0, 40], [0, -40]], 12);
    if (s){ m.x = s.x; m.y = s.y; } else { m.x = player.x - 34; m.y = Math.min(player.y + 8, sceneH() - 24); }
  }
  for (const n of activeNpcs()){
    if (!n.animal || !n.follows || n.cutWalk) continue;
    const L = n.follows === 'player' ? player : NPC[n.follows];
    if (!L || !(L === player || activeNpcs().includes(L))) continue;
    const s = spot(n, L, [[16, 14], [-16, 14], [18, -10], [-18, -10], [0, 22], [24, 0], [-24, 0]], 8) || { x:L.x + 14, y:L.y + 12 };
    n.x = s.x; n.y = s.y; n.moving = false;
  }
}

function statsBlock(extra){
  return `<div class="stats">
    <div><b>${vocabCount()}</b><span>words and phrases in your dictionary</span></div>
    <div><b>${S.sentences}</b><span>sentences said in Italian</span></div>
    <div><b>${extra[0]}</b><span>${extra[1]}</span></div></div>`;
}
