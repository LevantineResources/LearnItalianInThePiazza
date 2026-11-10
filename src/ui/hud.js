/* Header, objectives, quest markers (OBJ_NPC), the guide banner text per tutorial state. */

/* ---------- HUD, guide, toasts ---------- */
function toast(html){
  const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = html;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 4200);
}
function setTut(t){ S.tut = t; save(); renderHUD(); }
/* who gets the quest marker in each tutorial state (lesson hooks add theirs via markers:{}) */
const OBJ_NPC = { 'l6-bring':'mark', 'l6-start':'mark', 'l6-order':'enzo', 'l6-chiara':'chiara', 'l6-rosa':'rosa', 'l6-lucia':'lucia', 'l6-man':'bruno', 'l5-meet':'marco', 'l5-introduce':'marco', 'l5-statue':'lucia', 'l4-start':'davide', 'l4-order':'davide', 'l2-bar':'enzo', 'l2-order':'enzo', 'l2-translate':'enzo', 'l2-emma':'emma', 'l3-ask':'chiara', 'l3-directions':'chiara', 'l3-stranger':'rosa' };
const LESSON_LABEL = { 1:'Lezione 1 · Primi incontri', 2:'Lezione 2 · Al bar', 3:"Lezione 3 · Dov'è?", 4:'Lezione 4 · A pranzo', 5:'Lezione 5 · Ti presento…', 6:'Lezione 6 · Il libro perduto' };
function renderHUD(){
  questHooksBust();
  const o = $('#objective');
  const n = metCount();
  const txt = {
    walk:'Say hello to someone', handbook:'Open your handbook', practice:'Finish the Lesson 1 practice',
    meet:`Learn 3 names · ${n}/3`, done:'Lezione 1 completata',
    'l2-bar':'Talk to the barista', 'l2-handbook':'Open your handbook', 'l2-practice':'Finish the Lesson 2 practice',
    'l2-order':'Order a coffee and a pastry', 'l2-emma':'Someone is waving at you', 'l2-translate':'Order for Emma',
    'l2-done':'Lezione 2 completata',
    'l3-text':'Check your phone', 'l3-ask':'Find Via dei Mille 12', 'l3-handbook':'Open your handbook', 'l3-practice':'Finish the Lesson 3 practice',
    'l3-directions':'Ask Chiara the way', 'l3-mark':'Mark the route on your map', 'l3-stranger':'Ask someone the way',
    'l3-find':'Find Caffè Aurora, no. 12', 'l3-done':'Lezione 3 completata',
    'l4-start':'Order lunch with Mark', 'l4-handbook':'Open your handbook', 'l4-practice':'Finish the Lesson 4 practice',
    'l4-order':'Order for Mark and for you', 'l4-done':'Lezione 4 completata',
    'l5-text':'Check your phone', 'l5-meet':'Meet Mark at the fountain', 'l5-handbook':'Open your handbook', 'l5-practice':'Finish the Lesson 5 practice',
    'l5-introduce':'Introduce Mark to Paolo', 'l5-tour':S.l5routeOK ? 'Walk to Piazza del Santo' : 'Trace the route to the statue',
    'l5-statue':'Introduce yourselves, then ask about the statue', 'l5-done':'Lezione 5 completata',
    'l6-start':'Talk to Mark', 'l6-order':'Order for Mark (typing!)', 'l6-page':'Read the loose page', 'l6-chiara':'Ask Chiara about your book',
    'l6-rosa':'Ask Rosa in San Lorenzo', 'l6-lucia':'Ask Lucia in Piazza del Santo', 'l6-man':'Talk to the man on the bench', 'l6-bring':'Introduce Mark to Bruno', 'l6-done':'Lezione 6 completata',
  }[S.tut] || hookText('objective') || '';
  /* (the text in a span of its own, so a long objective is cut short with … rather than pushing the tools onto a second row;
     an empty objective keeps its place but isn't drawn) */
  const ot = o.firstElementChild && o.firstElementChild.classList.contains('obj-t') ? o.firstElementChild : (o.textContent = '', o.appendChild(Object.assign(document.createElement('span'), { className:'obj-t' })));
  ot.textContent = txt; o.title = txt; o.classList.toggle('obj-empty', !txt); o.classList.toggle('done', ['done','l2-done','l3-done','l4-done','l5-done','l6-done'].includes(S.tut) || hooks().some(h => h.doneTut === S.tut));
  $('#lessonLabel').textContent = LESSON_LABEL[S.lesson] || (LESSONS[S.lesson - 1] ? `Lezione ${S.lesson} · ${LESSONS[S.lesson - 1].title}` : '');
  $('#dictCount').textContent = vocabCount();
  $('#btnBook').classList.toggle('pulse', ['handbook','practice','l2-handbook','l2-practice','l3-handbook','l3-practice','l4-handbook','l4-practice','l5-handbook','l5-practice','l6-page'].includes(S.tut) || hooks().some(h => (h.bookPulse || []).includes(S.tut)));
  const l3 = S.lesson >= 3;
  $('#btnPhone').hidden = !l3; $('#btnMap').hidden = !l3;
  $('#btnNum').hidden = !numbersUnlocked();
  $('#btnStudy').hidden = !studyUnlocked();
  $('#btnNum').classList.toggle('pulse', hooks().some(h => (h.numbersPulse || []).includes(S.tut)));
  $('#phoneDot').hidden = !S.phoneUnread;
  $('#btnPhone').classList.toggle('pulse', S.phoneUnread);
  $('#btnMap').classList.toggle('pulse', S.tut === 'l3-mark' || S.tut === 'l5-tour' || hooks().some(h => (h.mapPulse || []).includes(S.tut)));
  renderSoundBtn();
  placeEmma(); placeMark(); placeCrowd(); placeByHours(); askHooks('place');
  renderListButton(); renderNotebookButton(); renderQuestHUD();
}
/* objective / guide text from a lesson hook: a string, or a function of (near) */
function hookText(kind, near){
  for (const h of hooks()){ const t = h[kind] && h[kind][S.tut]; if (t !== undefined) return typeof t === 'function' ? t(near) : t; }
  return null;
}
let lastGuide = '';
function guideHTML(){
  const near = nearestNpc(); const n = metCount();
  { const h = hookText('guide', near); if (h !== null) return h; }
  switch (S.tut){
    case 'walk': return near ? 'Press <kbd>E</kbd> or <kbd>Space</kbd>, or tap them, to start a conversation.'
      : 'Welcome to the piazza! Walk with the arrow keys or <kbd>WASD</kbd>, or tap where you want to go. Go and say hello to someone.';
    case 'handbook': return 'Nobody here speaks English. Open your <b>Learn Italian Handbook</b> with <kbd>H</kbd> or the Handbook button at the top.';
    case 'practice': return 'Read Lesson 1 in your handbook, then finish the <b>Practice</b> tab. That fills your dictionary with words you can use.';
    case 'meet':
      if (n === 0 && near) return `Press <kbd>E</kbd> to talk. Tap words to build a sentence, then press <b>Dillo!</b> (Say it). You can chain phrases: <i>Ciao! Mi chiamo ${esc(S.playerName)}. Come ti chiami?</i>`;
      return `Introduce yourself to 3 people and learn their names. <b>${n} of 3</b> so far.`;
    case 'done': return 'Lezione 1 completata! Giulia, Paolo and Chiara remember you now. <button class="gbtn" data-action="l2">Start Lezione 2 · Al bar</button>';
    case 'l2-bar': return near === NPC.enzo
      ? 'Press <kbd>E</kbd> to talk. He is older and you have never met, so <b>Buongiorno</b> is the polite greeting.'
      : 'Your stomach is rumbling. Walk up to the counter at <b>Bar Centrale</b> and introduce yourself to the barista.';
    case 'l2-handbook': return 'You froze when the barista asked what you wanted. Open your handbook (<kbd>H</kbd>) and read <b>Lezione 2 · Al bar</b>.';
    case 'l2-practice': return 'Read Lezione 2, then finish its <b>Practice</b> tab to add the bar words to your dictionary.';
    case 'l2-order': return 'Go back to the counter and order <b>a coffee and a pastry</b>. Check the price list in your handbook if you need it.';
    case 'l2-emma': return 'Someone by the café tables is waving at you. Go and see what she wants.';
    case 'l2-translate': return 'Emma wants <b>a fresh orange juice and a croissant</b>, and wants to know the price. Order for her at the counter.';
    case 'l2-done': return 'Lezione 2 completata! Enzo will happily serve you anytime. <button class="gbtn" data-action="l3">Start Lezione 3 · Dov\'è?</button>';
    case 'l3-text': return 'Your phone just buzzed. Read the message with <kbd>P</kbd> or the Phone button.';
    case 'l3-ask': return 'Mark is waiting at <b>Via dei Mille 12</b>, but that street isn\'t on your map (<kbd>M</kbd>). Ask a friend: <b>Chiara</b> is at the newsstand.';
    case 'l3-handbook': return 'Chiara didn\'t understand you. Open the handbook (<kbd>H</kbd>) and read <b>Lezione 3 · Dov\'è?</b>';
    case 'l3-practice': return 'Read Lezione 3, then finish its <b>Practice</b> tab. Your tiles will switch to phrases for asking the way.';
    case 'l3-directions': return 'Ask Chiara the way: <i>Scusa, dov\'è via dei Mille?</i> Listen carefully, and ask her to repeat if you need to.';
    case 'l3-mark': return 'Open your map (<kbd>M</kbd>) and trace the route Chiara described, starting from the piazza.';
    case 'l3-stranger': return 'You\'re in San Lorenzo, but where is Via dei Mille? Introduce yourself to the lady with the dog and ask her. She\'s a stranger, so be polite: <b>Buongiorno</b>, <b>Scusi</b>.';
    case 'l3-find': return 'Follow her directions to <b>Caffè Aurora, Via dei Mille 12</b>. Press <kbd>E</kbd> at a door to go in.';
    case 'l3-done': return 'Lezione 3 completata! Mark is hungry. <button class="gbtn" data-action="l4">Start Lezione 4 · A pranzo</button>';
    case 'l4-start': return 'You and Mark have a table at Caffè Aurora. The waiter is coming over: talk to him (<kbd>E</kbd>).';
    case 'l4-handbook': return 'Mark can\'t order in English, and you can\'t talk about him in Italian yet. Open the handbook (<kbd>H</kbd>): <b>Lezione 4 · A pranzo</b>.';
    case 'l4-practice': return 'Read Lezione 4, then finish its <b>Practice</b> tab. You\'ll get tiles for ordering for two.';
    case 'l4-order': return 'Talk to Davide. Mark tells you in English what he wants: say it in Italian <i>for him</i>. Careful: <b>vorrei</b> is you, <b>vorrebbe</b> is him.';
    case 'l4-done': return 'Lezione 4 completata! Buon appetito. <button class="gbtn" data-action="l5">Start Lezione 5 · Ti presento…</button>';
    case 'l5-text': return 'The next morning your phone buzzes. Read the message (<kbd>P</kbd>).';
    case 'l5-meet': return 'Mark is at the fountain, trying to talk to Paolo. Go and help: ask Paolo where the statue is.';
    case 'l5-handbook': return 'Mark wants to be introduced. Open the handbook (<kbd>H</kbd>): <b>Lezione 5 · Ti presento…</b>';
    case 'l5-practice': return 'Read Lezione 5, then finish its <b>Practice</b> tab.';
    case 'l5-introduce': return 'Introduce Mark to Paolo: <i>Paolo, questo è il mio amico Mark.</i> or <i>Ti presento Mark.</i>';
    case 'l5-tour': {
      const k = Object.keys(S.l5intros).length;
      return S.l5routeOK ? 'Route marked. Open the map (<kbd>M</kbd>) and walk to <b>Piazza del Santo</b>. Mark will follow you.'
        : `Mark is following you. Introduce him to anyone you like (<b>${k}</b> so far), then open the map (<kbd>M</kbd>) and trace Paolo's route to the statue.`;
    }
    case 'l5-statue': return 'Someone is sketching the statue. Introduce yourself <i>and</i> Mark, then ask if this really is the Gattamelata. She is a stranger: be polite.';
    case 'l5-done': return 'Lezione 5 completata! Mark is still following you around. <button class="gbtn" data-action="l6">Start Lezione 6 · Il libro perduto</button>';
    case 'l6-start': return 'Back in the piazza that afternoon. Mark has spotted Emma at Bar Centrale. Talk to Mark.';
    case 'l6-order': return 'Your handbook is gone! Order Mark a cappuccino and a pastry at the counter. No tiles today: you type. Your dictionary still works.';
    case 'l6-page': return 'Read the loose page (<kbd>H</kbd>) and do its practice.';
    case 'l6-chiara': return 'Ask Chiara at the newsstand if she knows where your book is.';
    case 'l6-rosa': return 'Chiara thinks Rosa might know. Rosa is in San Lorenzo: open the map (<kbd>M</kbd>).';
    case 'l6-lucia': return 'Rosa saw a girl with a blue book near the Gattamelata. Go to Piazza del Santo (<kbd>M</kbd>) and ask Lucia.';
    case 'l6-man': return 'The gentleman on the bench has a blue book. Start politely, <i>how are you?</i>, then get your book back.';
    case 'l6-bring': return S.scene === 'piazza' ? 'Introduce Mark to Bruno, in Italian. Bruno is a stranger, so be polite.' : 'Bruno is following you. Take him to Mark at Bar Centrale: open the map (<kbd>M</kbd>).';
    case 'l6-done': return 'Lezione 6 completata! Your handbook is back, and Bruno is off to find Mark at Bar Centrale.' + (hookFor(7) ? ' <button class="gbtn" data-action="l7">Start Lezione 7 · ' + esc(LESSONS[6].title) + '</button>' : '');
  }
  return '';
}
function renderGuide(){
  const g = $('#guide');
  const cut = cutsceneOn();                       // a cutscene shows its own line, or none (world/cutscene.js)
  g.hidden = frozen() || (cut && !cutsceneGuide());
  let h = cut ? cutsceneGuide() || '' : guideHTML();
  { const l = !frozen() && !cut && nearLandmark(); if (l && l.work && mispyActive()) h += `<span class="gnear"><span class="gkey">Press <kbd>E</kbd> (or click it) to choose ${l.lookAt}.</span><span class="gtap">Tap ${l.lookAt} to choose it.</span></span>`;
    else if (l){ const what = l.lookAt || 'the statue'; h += `<span class="gnear"><span class="gkey">Press <kbd>E</kbd> (or click it) to look at ${what}.</span><span class="gtap">Tap ${what} to look at it.</span></span>`; } }
  if (h !== lastGuide){
    lastGuide = h; $('#guideText').innerHTML = h;
    g.classList.remove('flash'); void g.offsetWidth; g.classList.add('flash');
  }
  guideDock(g);
}
/* in a shop (world/shops.js) the top of the room is its sign, its posters and its price board: the guide moves to the
   bottom left corner of the canvas there (beside the door, over the floor), narrower; elsewhere it stays at the top, unless
   it would cover what the scene needs in view: a scene's guideKeep:[{ x, y, w, h }] (world rects: the covered market's shop
   signs and Marisa's counter; the bridge's deck) moves it down too whenever the banner at the top would overlap one */
function guideCovers(g, keep){
  const s = $('#stage').getBoundingClientRect(), c = cv.getBoundingClientRect(), k = c.width / W;
  const w = Math.min(640, s.width - 32), h = g.classList.contains('low') ? (g.topH || g.offsetHeight) : g.offsetHeight;
  if (!g.classList.contains('low')) g.topH = h;
  const top = { l:s.left + s.width / 2 - w / 2, r:s.left + s.width / 2 + w / 2, t:s.top + 12, b:s.top + 12 + h };
  return keep.some(o => { const l = c.left + (o.x - cam.x) * k, t = c.top + (o.y - cam.y) * k, r = l + o.w * k, b = t + o.h * k; return l < top.r && r > top.l && t < top.b && b > top.t; });
}
function guideDock(g){
  const sc = scene(), wide = cv.getBoundingClientRect().width >= 640;
  const low = !g.hidden && wide && ((typeof shopOf === 'function' && !!shopOf()) || (!!sc.guideKeep && guideCovers(g, sc.guideKeep)));
  g.classList.toggle('low', low);
  if (!low) return;
  const s = $('#stage').getBoundingClientRect(), c = cv.getBoundingClientRect();
  const l = Math.round(Math.max(8, c.left - s.left + 12)), b = Math.round(Math.max(8, s.bottom - c.bottom + 12)), w = Math.round(Math.min(430, c.width * 0.4));
  if (g.dockKey !== `${l},${b},${w}`){ g.dockKey = `${l},${b},${w}`; g.style.setProperty('--gl', l + 'px'); g.style.setProperty('--gb', b + 'px'); g.style.setProperty('--gw', w + 'px'); }
}
$('#guide').addEventListener('click', e => {
  if (e.target.closest('[data-action="l2"]')) startLesson2();
  if (e.target.closest('[data-action="l3"]')) startLesson3();
  if (e.target.closest('[data-action="l4"]')) startLesson4();
  if (e.target.closest('[data-action="l5"]')) startLesson5();
  if (e.target.closest('[data-action="l6"]')) startLesson6();
  const a = e.target.closest('[data-action^="l"]'); if (a){ const h = hookFor(+a.dataset.action.slice(1)); if (h && h.start) h.start(); }
});
