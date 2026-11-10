/* Quest 12 · Musica in piazza (night). Design: docs/lessons/12-la-citta.md, the quests; system: engine/quests.js.
   The piazza at night: two buskers by the fountain (a guitarist and a singer, chitarrista and cantante: ambient, animated),
   two couples dancing round the fountain (drawn here: SCENE_EXTRAS), and two strangers listening, Marta and Luca (Lei).
   Each conversation has the same arc: introductions (Buonasera! Mi chiamo {Me}. E Lei? → the brain's own introductions),
   the music (Le piace questa musica?), the invitation (Le va di ballare? / Vuole ballare?). Whoever you ask first says no,
   and that no teaches the music words: "Mi piace la musica, ma non mi piace ballare la musica lenta. Preferisco la musica
   veloce!" When you leave them, the buskers switch to something faster (the singer calls it out; the strumming, the notes and
   the dancers speed up). The other one then says "Sì, volentieri!" → a short dance round the fountain (a cutscene) → done.
   Italian: la musica, lento / lenta, veloce, ballare, Le piace questa musica?, Le va di ballare?, Vuole ballare?, volentieri,
   Buonasera, E Lei?; heard (glossed): la chitarra, la canzone, cantare, suonare, preferisco (Lesson 11), non mi piace + a verb.
   Saved on the quest's record: who:{ marta:{ asked, music, said:'no' | 'yes' } , luca:{…} }, first (who said no), fast (the
   music is fast now), danced. */
const M12 = { id:'musica', FOUNTAIN:{ x:470, y:340 }, R:120 };
const m12Rec = () => { const r = questRec(M12.id); if (!r.who) r.who = { marta:{}, luca:{} }; return r; };
const m12Stranger = n => !!n && (n.id === 'marta' || n.id === 'luca');
const m12Busy = n => m12Stranger(n) && questState(M12.id) === 'active';
const m12Other = id => id === 'marta' ? 'luca' : 'marta';
/* the tempo of the buskers' music: the strumming, the notes, the dancers (render/sprites.js asks it for the guitar and the mic) */
function musicTempo(){ const r = questPeek('musica'); return r && r.fast ? 2.3 : 1; }
const m12Tile = (key, label, en, words) => ({ key, label, words:words || key, en });
const M12_TILES = [
  m12Tile('buonasera', 'Buonasera', 'good evening (polite)'), m12Tile('e lei', 'E Lei?', 'and you? (polite)', 'e Lei'),
  m12Tile('le piace questa musica', 'Le piace questa musica?', 'do you like this music? (polite)'),
  m12Tile('le va di ballare', 'Le va di ballare?', 'would you like to dance? (polite)'), m12Tile('vuole ballare', 'Vuole ballare?', 'do you want to dance? (polite)'),
  m12Tile('sì mi piace', 'Sì, mi piace!', 'yes, I like it!'), m12Tile('la musica è veloce', 'La musica è veloce!', 'the music is fast!'), m12Tile('va bene', 'Va bene.', 'OK, all right'),
];
QWORDS.add('le va'); QWORDS.add('vuole'); QWORDS.add('e lei'); CLAUSE.add('vuole'); CLAUSE.add('le va'); CLAUSE.add('le piace'); CLAUSE.add('e lei'); JOIN.add('sì mi');

QUESTS.push({
  id:M12.id, n:12, title_it:'Musica in piazza', title_en:'Music and dancing in the piazza',
  window:'night',
  place:{ scene:'piazza', x:560, y:500, label:'Piazza Centrale' },
  giver:'marta',
  steps:[
    { id:'first', en:'Ask someone to dance: introduce yourself, talk about the music, then invite them (Lei)', who:'marta', where:'Piazza Centrale, by the fountain' },
    { id:'second', en:'The music is faster now: ask the other one to dance', get who(){ const r = questPeek(M12.id); return r && r.dancing ? null : r && r.first ? m12Other(r.first) : 'luca'; }, where:'Piazza Centrale, by the fountain' },
  ],
  stamp:{ icon:'♫', color:'#7a3a6e', label:'Piazza Centrale' },
  scheda:{
    phrases:[
      ['Buonasera! Mi chiamo {Me}. E Lei?', 'Good evening! My name is {Me}. And you?', 'Strangers: Lei. Buonasera from the late afternoon on.'],
      ['Le piace questa musica?', 'Do you like this music?', 'Le piace: polite (Lesson 8). To a friend: ti piace?'],
      ['Le va di ballare?', 'Would you like to dance?', 'Literally: does it go to you to dance? Very common.'],
      ['Vuole ballare?', 'Do you want to dance?', 'Volere + a verb: vuole ballare.'],
      ['Sì, volentieri!', 'Yes, gladly!', 'The happy answer.'],
    ],
    phrases2Title:'You may hear',
    how:`<p><b>Mi piace</b> + a verb: <i>mi piace ballare</i> (I like dancing), <i>non mi piace ballare</i> (I don't like dancing). The verb stays as it is (ballare, cantare).</p>
      <p>Music is <b>lenta</b> (slow) or <b>veloce</b> (fast): <i>la musica lenta</i>, <i>la musica veloce</i>. You may hear <i>la chitarra</i> (the guitar), <i>la canzone</i> (the song), <i>cantare</i> (to sing), <i>suonare</i> (to play an instrument), and <i>preferisco…</i> (I prefer, Lesson 11).</p>
      <p>To a stranger, always <b>Lei</b>: <i>Le piace?</i> <i>Le va?</i> <i>Vuole?</i> A polite no: <i>No, grazie…</i></p>`,
    culture:`<p>Summer evenings in Italian piazzas are full of music: <i>buskers</i> (gli artisti di strada), a concert, sometimes a whole town dancing <i>il liscio</i>. Asking a stranger to dance is fine; a polite no is fine too.</p>`,
    vocab:[
      { group:'La musica', words:[
        { it:'la musica', g:'f', en:'the music', also:['musica'] },
        { it:'lento / lenta', en:'slow', also:['lenta', 'lento'] },
        { it:'veloce', en:'fast' },
        { it:'ballare', en:'to dance' },
        { it:'volentieri', en:'gladly, with pleasure' },
      ] },
      { group:'Asking', words:[
        { it:'Buonasera!', en:'Good evening!', also:['buonasera'] },
        { it:'E Lei?', en:'And you? (polite)', also:['lei'] },
        { it:'Le piace questa musica?', en:'Do you like this music? (polite)', also:['questa', 'piace'] },
        { it:'Le va di ballare?', en:'Would you like to dance? (polite)', also:['va'] },
        { it:'Vuole ballare?', en:'Do you want to dance? (polite)', also:['vuole'] },
      ] },
    ],
    exercises:[
      { type:'mc', q:'You ask a stranger whether she likes the music:', opts:['Ti piace questa musica?', 'Le piace questa musica?', 'Mi piace questa musica.'], a:1, why:'A stranger: Lei, so le piace.', nudge:'Polite: Lei.' },
      { type:'mc', q:'“Mi piace la musica, ma non mi piace ballare la musica lenta.” She…', opts:["doesn't like dancing to slow music", "doesn't like music", 'likes slow music best'], a:0, why:'Non mi piace ballare la musica lenta: she doesn\'t like dancing to slow music.', nudge:'Lenta: slow.', noSpeak:true },
      { type:'mc', q:'“Le va di ballare?” The happy answer:', opts:['Sì, volentieri!', 'No, grazie.', 'Preferisco la musica lenta.'], a:0, why:'Volentieri: gladly.', nudge:'Gladly!' },
      { type:'mc', q:'The opposite of lenta:', opts:['alta', 'veloce', 'bella'], a:1, why:'Lenta (slow) ↔ veloce (fast).', nudge:'Think of a fast song.' },
    ],
    tiles:M12_TILES,
  },
  hooks:{
    talk(npc){
      if (!m12Stranger(npc)) return false;
      if (questState(M12.id) === 'open') return m12Start(npc);
      if (m12Busy(npc)){ convo.m12 = true; convo.known = !!S.known[npc.id]; }
      return false;
    },
    bank(npc, groups, names){
      if (!m12Busy(npc)) return null;
      if (schedaDone(M12.id)) groups.push({ label:'La musica', tiles:M12_TILES.map(phraseTile) });
      groups.push({ label:'Polite', tiles:L10_POLITE.map(phraseTile) });
      if (names.length) groups.push({ label:'Names', tiles:names });
      return groups;
    },
    phrases(npc){
      if (!m12Busy(npc)) return [];
      return [['greet', 'buonasera'], ['ask_back', 'e lei'], ['m12:music', 'le piace questa musica'], ['m12:music', 'le piace la musica'], ['m12:music:tu', 'ti piace questa musica'],
        ['m12:dance', 'le va di ballare'], ['m12:dance', 'vuole ballare'], ['m12:dance:tu', 'ti va di ballare'], ['m12:dance:tu', 'vuoi ballare'],
        ['m12:like', 'sì mi piace'], ['m12:like', 'mi piace'], ['m12:dislike', 'non mi piace'], ['m12:fast', 'la musica è veloce'], ['ok10', 'va bene']];
    },
    react(id, n, st, add, out, ints){ return m12React(id, n, st, add, out, ints || [id]); },
    hint(n, st){ return m12Hint(n, st); },
    afterTurn(n, out, res, words){ return m12After(n, out, words); },
    onClose(closedId){
      const r = questPeek(M12.id); if (!r || !m12Stranger(NPC[closedId] || null)) return false;
      if (r.first === closedId && !r.fast){ m12Faster(); return true; }
      if (r.danceNow){ r.danceNow = false; save(); setTimeout(() => m12Dance(closedId), 350); return true; }
      return false;
    },
  },
});
/* their openings: a revisit greets you by name */
function m12Start(npc){
  convo.known = !!S.known[npc.id];
  builder.hidden = true;
  npcLine('Buonasera!', 'Good evening!');
  sysLine('Music by the fountain, couples dancing… You would love to join in. But how do you ask someone to dance, and what do you say about the music? The task\'s <b>scheda</b> has the words.');
  questStart(M12.id); m12Rec(); save();
  showChoices([{ label:'Leave', primary:true, fn:closeDialog }]);
  return true;
}
function m12React(id, n, st, add, out, ints){
  if (!m12Busy(n)) return false;
  /* a greeting: "Buonasera!" back, once; the introductions that follow are the brain's own (Piacere… Mi chiamo…) */
  if (id === 'greet'){ if (!st.m12greet){ st.m12greet = true; add('Buonasera!', 'Good evening!'); } return true; }
  /* goodbye: politely (the brain's own goodbye is for friends) */
  if ((id === 'bye' || id === 'thanks') && (st.m12no || st.wrapping || out.m12)){ if (!out.m12bye){ out.m12bye = true; add(id === 'bye' ? 'Arrivederci! Buona serata!' : 'Prego! Buona serata!', id === 'bye' ? 'Goodbye! Have a nice evening!' : "You're welcome! Have a nice evening!"); out.end = true; } return true; }
  if (!/^m12:/.test(id) && !(id === 'ok10' && st.m12no)) return false;
  if (out.m12) return true;
  out.m12 = true; out.asked = true;
  if (!schedaDone(M12.id)){ add('Prego?', 'Pardon?'); out.m12fb = 'scheda'; return true; }
  const r = m12Rec(), me = r.who[n.id], fb = h => { if (!out.m12fb) out.m12fb = h; };
  const has = k => ints.includes(k);
  const tu = has('m12:music:tu') || has('m12:dance:tu');
  if (tu) fb(`${n.pron[0]} understood, but ${n.pron[0] === 'She' ? 'she' : 'he'}'s a stranger: <b>Lei</b> (<b>le</b> piace, <b>le</b> va, <b>vuole</b>).`);
  if (has('m12:music') || has('m12:music:tu')){
    me.music = true;
    if (r.fast) add('Sì! Adesso è veloce: mi piace tanto! La cantante è bravissima.', "Yes! It's fast now: I love it! The singer is really good.");
    else add('Sì, mi piace molto! La chitarra è bellissima. E a Lei?', 'Yes, I like it a lot! The guitar is beautiful. And you?');
    st.m12q = r.fast ? null : 'like';
  }
  if (has('m12:like')){ add(st.m12q === 'like' || me.music ? 'Che bello!' : 'Che cosa?', st.m12q === 'like' || me.music ? 'How lovely!' : 'What?'); st.m12q = null; }
  if (has('m12:dislike')){ add('No? Peccato!', "No? What a pity!"); st.m12q = null; }
  if (has('m12:fast')) add(r.fast ? 'Sì! Veloce!' : 'Veloce? No, è lenta!', r.fast ? 'Yes! Fast!' : "Fast? No, it's slow!");
  if (has('m12:dance') || has('m12:dance:tu')){
    me.asked = true;
    if (!st.playerGaveName && !S.met[n.id]){ add('Ballare? Ma… non La conosco! Come si chiama?', "Dance? But… I don't know you! What's your name?"); st.lastQ = 'name'; fb('A stranger: introduce yourself first.'); }
    else if (!r.first || r.first === n.id && !r.fast){
      r.first = n.id; me.said = 'no';
      add('No, grazie… Mi piace la musica, ma non mi piace ballare la musica lenta.', "No, thank you… I like the music, but I don't like dancing to slow music.");
      add('Preferisco la musica veloce!', 'I prefer fast music!');
      st.m12no = true; out.m12no = true;
    } else if (r.first === n.id){ const she = n.pron[0] === 'She', other = NPC[m12Other(n.id)], oShe = other.pron[0] === 'She';
      add(`Adesso è veloce, sì… ma sono un po' ${she ? 'stanca' : 'stanco'}. Perché non chiede a ${oShe ? 'lei' : 'lui'}?`, `It's fast now, yes… but I'm a bit tired. Why don't you ask ${oShe ? 'her' : 'him'}?`);
      fb(`Ask ${oShe ? 'the woman near the fountain' : 'the man near the bar'}: the other one listening to the music.`); }
    else if (!r.fast){ add('Adesso? Con questa musica lenta? Mmm… no, grazie.', 'Now? To this slow music? Hmm… no, thank you.'); fb('The music is slow. Wait for something faster.'); }
    else { me.said = 'yes'; add('Sì, volentieri!', 'Yes, gladly!'); r.danceNow = true; out.m12yes = true; }
  }
  if (id === 'ok10' && st.m12no){ add('Grazie! Buona serata!', 'Thank you! Have a nice evening!'); out.end = true; }
  if (!out.frags.length) add('Sì?', 'Yes?');
  save();
  return true;
}
function m12After(n, out, words){
  if (!out.m12) return false;
  if (out.m12fb === 'scheda'){ showHint('First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).'); return true; }
  if (out.m12yes){ convo.keepHint = true; showHint('Volentieri! Off to the fountain…', 'Fatto!'); enqueue(() => { if (convo) endConvo(); }); return true; }
  if (out.m12no){ convo.st.wrapping = true; showHint('A no, but a friendly one. Why? Listen again (the 🔊 under her line), then say goodbye. Maybe the music will change…', 'Fatto!'); return true; }
  if (out.end) return false;
  const formal = !convo.tips.formal && words && ['ciao', 'stai', 'scusa'].some(w => words.includes(w));
  if (formal){ convo.tips.formal = true; showHint(`${n.name} is a stranger: the polite forms (<b>buonasera</b>, <b>scusi</b>, <b>Lei</b>).`, 'Consiglio'); return true; }
  if (out.m12fb){ showHint(hintAfter(stepTries(convo.st, 'm12-' + n.id), out.m12fb, m12Strong(n, convo.st)), 'Consiglio'); return true; }
  showHint(contextHint(false));
  return true;
}
const m12Strong = (n, st) => {
  const r = m12Rec(), me = r.who[n.id];
  if (!st.playerGaveName && !S.met[n.id]) return 'Introduce yourself: <b>Buonasera</b>… <b>Mi chiamo</b> … <b>E Lei?</b>';
  if (!me.music) return 'Ask about the music: <b>Le piace</b> … ?';
  return 'Invite them: <b>Le va di ballare?</b> or <b>Vuole</b> …?';
};
function m12Hint(n, st){
  if (!m12Busy(n)) return null;
  if (!schedaDone(M12.id)) return { h:'First the words: the task\'s <b>scheda</b> (your phone → <b>Compiti</b> → <b>Scheda</b>).', step:'scheda' };
  const r = m12Rec(), me = r.who[n.id];
  if (r.first === n.id && r.fast) return { h:`${n.name} has said no once. Ask the other one listening to the music.`, step:'m12-other' };
  if (r.first === n.id) return { h:'A friendly no. Say goodbye; maybe the music will change.', step:'m12-bye' };
  if (st.lastQ === 'name' || st.lastQ === 'how') return null;
  if (!st.playerGaveName && !S.met[n.id]) return { h:'A stranger at night: greet them politely and introduce yourself, then ask their name.', strong:m12Strong(n, st), step:'m12-intro' };
  if (st.m12q === 'like') return { h:`${n.pron[0]} asked whether you like it too.`, step:'m12-like' };
  if (!me.music) return { h:'Now the music: ask whether they like it.', strong:m12Strong(n, st), step:'m12-music' };
  return { h:'Now invite them to dance. Politely: Lei.', strong:m12Strong(n, st), step:'m12-dance' };
}
/* the first no: the buskers change to something fast */
function m12Faster(){
  const r = m12Rec();
  cutscene([
    { wait:500 },
    { say:'Adesso una canzone veloce!', who:'cantante', ms:2200 },
    { run:() => { r.fast = true; questStep(M12.id, 'second'); save(); } },
    { guide:'The guitarist speeds up. The couples by the fountain start to spin…' },
    { wait:2200 },
  ], { id:'m12-faster', guide:'The singer turns to the crowd…' }).then(() => {
    r.fast = true; if (questAt(M12.id, 'first')) questStep(M12.id, 'second'); save();
    toast(`Fast music now! Maybe <b>${esc(S.known[m12Other(r.first)] ? NPC[m12Other(r.first)].name : 'the other one listening')}</b> would like to dance.`);
  });
}
/* the dance: round the fountain together, the other couples spinning */
function m12Dance(partnerId){
  const r = m12Rec(), p = NPC[partnerId], F = M12.FOUNTAIN, R = M12.R;
  const ring = (a0, turns, rad, n) => Array.from({ length:n + 1 }, (_, i) => { const a = a0 + i / n * turns * Math.PI * 2; return { x:F.x + Math.cos(a) * rad, y:F.y + Math.sin(a) * rad }; });
  const a0 = Math.PI / 2, home = { x:p.x, y:p.y, face:{ ...p.baseFace } };
  r.dancing = true; save();
  const back = { x:F.x + Math.cos(a0) * (R + 34), y:F.y + Math.sin(a0) * (R + 34) };
  cutscene([
    { guide:`${esc(p.name)} takes your hand…` },
    { walk:'player', to:{ x:F.x, y:F.y + R + 18 }, speed:150, async:true },
    { walk:partnerId, to:{ x:F.x + 22, y:F.y + R + 10 }, speed:150 },
    { wait:300 },
    { say:'Andiamo!', who:partnerId, ms:1100 },
    { guide:'Round the fountain, with the music…' },
    { walk:partnerId, path:ring(a0 - 0.18, 1.25, R - 8, 40), speed:115, async:true },
    { walk:'player', path:ring(a0, 1.25, R + 8, 40), speed:120 },
    { say:'Che bello!', who:'player', ms:1200 },
    { walk:partnerId, path:ring(a0 + Math.PI * 0.5 - 0.18, 0.75, R - 8, 24), speed:120, async:true },
    { walk:'player', path:ring(a0 + Math.PI * 0.5, 0.75, R + 8, 24), speed:125 },
    { face:partnerId, to:'player' }, { face:'player', to:partnerId },
    { say:fill('Grazie, {Me}! Lei balla benissimo!'), who:partnerId, ms:2200 },
    { walk:partnerId, to:{ x:home.x, y:home.y }, speed:120, async:true },
    { walk:'player', to:back, speed:120 },
  ], { id:'m12-dance', guide:'', onSkip:() => { p.x = home.x; p.y = home.y; player.x = back.x; player.y = back.y; } }).then(() => {
    p.x = home.x; p.y = home.y; p.baseFace = { ...home.face }; r.danced = true; r.dancing = false; save();
    questDone(M12.id); renderHUD();
  });
}

/* ---------- the scene: the buskers' notes, the dancers round the fountain (night, or whenever the buskers play) ---------- */
const M12_DANCERS = [
  { a:0.4, body:['#c23b2a', '#1c3d8f'], hair:['#3a2318', '#2a1a12'], skin:['#e6b48f', '#c98d62'], long:[true, false] },
  { a:3.5, body:['#f4b928', '#2e6a4e'], hair:['#9a4a26', '#161616'], skin:['#f0c9a8', '#d9a37e'], long:[true, false] },
];
const m12Playing = () => S.lesson >= 12 && sceneOf(NPC.chitarrista) === 'piazza' && npcAround(NPC.chitarrista);
let M12_T = null;
SCENE_EXTRAS.push({ scene:'piazza', when:m12Playing, ents(t){
  const tp = musicTempo(), F = M12.FOUNTAIN, dt = M12_T === null ? 0 : Math.min(0.05, t - M12_T); M12_T = t;
  if (RM) return [];
  /* the buskers sway */
  [NPC.chitarrista, NPC.cantante].forEach(b => { b.moving = true; b.walk = (b.walk || 0) + dt * 3 * tp; });
  const out = [];
  M12_DANCERS.forEach((d, k) => {
    d.a += dt * (tp > 1 ? 0.42 : 0.16); d.spin = (d.spin || 0) + dt * (tp > 1 ? 4.2 : 1.4);
    const cx = F.x + Math.cos(d.a) * 106, cy = F.y + Math.sin(d.a) * 106;
    [0, 1].forEach(i => {
      const s = d.spin + i * Math.PI, x = cx + Math.cos(s) * 11, y = cy + Math.sin(s) * 8;
      const P = { x, y, face:{ x:-Math.cos(s), y:-Math.sin(s) }, body:d.body[i], hair:d.hair[i], skin:d.skin[i], longHair:d.long[i], moving:true, walk:t * 9 * tp };
      out.push({ y, draw:() => drawPerson(P, t) });
    });
  });
  return out;
}, after(t){
  /* strings of little lights across the piazza (le lucine), and the notes, bright in the dark */
  const night = daytime() === 'night';
  if (night) [[[150, 196], [470, 236], [790, 196]], [[150, 486], [470, 446], [790, 486]]].forEach(L => {
    ctx.strokeStyle = 'rgba(40,30,20,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); ctx.quadraticCurveTo(L[1][0], L[1][1] + 30, L[2][0], L[2][1]); ctx.stroke();
    for (let k = 0; k <= 16; k++){ const u = k / 16, x = (1 - u) * (1 - u) * L[0][0] + 2 * u * (1 - u) * L[1][0] + u * u * L[2][0], y = (1 - u) * (1 - u) * L[0][1] + 2 * u * (1 - u) * (L[1][1] + 30) + u * u * L[2][1];
      const tw = RM ? 1 : 0.75 + 0.25 * Math.sin(t * 3 + k * 1.7);
      ctx.fillStyle = `rgba(255,${200 + (k % 3) * 20},120,${0.25 * tw})`; circ(ctx, x, y + 2, 7); ctx.fill();
      ctx.fillStyle = ['#ffd27a', '#ff9e7a', '#fff1b0'][k % 3]; circ(ctx, x, y + 2, 2.4); ctx.fill(); }
  });
  if (RM) return;
  const g = NPC.chitarrista, tp = musicTempo();
  for (let i = 0; i < 4; i++){
    const ph = (t * 0.45 * tp + i / 4) % 1, x = g.x + 26 + Math.sin(ph * 6 + i) * 10, y = g.y - 20 - ph * 60;
    ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.95; ctx.fillStyle = night ? '#fff3c4' : '#7a3a6e'; ctx.font = '700 17px "Bodoni Moda", Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(i % 2 ? '♫' : '♪', x, y);
  }
  ctx.globalAlpha = 1;
} });
