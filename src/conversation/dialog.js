/* Opening a conversation and routing it to the right engine (tiles, typed, companion). */

/* =========================================================
   CONVERSATION
   ========================================================= */
const dlg = $('#dialog'), tr = $('#transcript'), hintEl = $('#hint'), builder = $('#builder'), choices = $('#choices');

function openConvo(npc){
  if (frozen()) return;
  if (npc.crowd){ crowdTouch(npc); return; }       // the crowd: the Permesso pick, not a conversation (world/museo.js)
  if (npc.ambient && !askHooks('visitorTalk', npc)){ galAmbientSay(npc); return; }   // a museum visitor: a line in a bubble (world/galleria.js)
  if (npc.id === 'mark' && ['l5-meet','l5-introduce'].includes(S.tut)) npc = NPC.marco;
  if (npc.id === 'mark' && S.tut === 'l6-bring' && S.scene === 'piazza') npc = NPC.bruno;
  { const r = askHooks('redirect', npc); if (r) npc = r; }
  dialogOpen = true; keys.clear(); target = null; pendingTalk = null; pendingDoor = null;
  const dx = player.x - npc.x, dy = player.y - npc.y, d = Math.hypot(dx, dy) || 1;
  npc.face = { x:dx/d, y:dy/d };
  /* a stall vendor's name is on the sign above the stall (npc.sign): you know it as soon as you talk to them */
  if (npc.sign && !S.known[npc.id]){
    S.met[npc.id] = S.known[npc.id] = true; save(); renderHUD();
    toast(`<b>${esc(npc.sign)}</b>, says the sign: this is <b>${esc(npc.name)}</b>.`);
  }
  const known = !!S.known[npc.id];
  const mode = npc.english ? 'english' : S.vocab ? 'talk' : 'barrier';
  const revisit = !!S.met[npc.id] && !npc.sign;      // (reading a vendor's sign is not an introduction)
  convo = { npc, known, mode, fails:0, words:[], done:false, tips:{},
    companion: npc.barista && S.tut === 'l2-translate' ? NPC.emma : null,
    st:{ revisit, npcGreeted:revisit || !npc.startsQuiet, playerToldHow:false, playerGaveName:revisit,
         npcToldName:revisit, npcSaidPiacere:revisit, lastQ:null, wrapping:false, order:[], served:false, lastDir:null, pendingWhere:null } };
  $('#dlgWho').innerHTML = `<b>${known ? esc(npc.name) : 'Someone'}</b> <span class="where">· ${esc(npc.id === 'bruno' && sceneOf(npc) === 'piazza' ? (S.lesson >= 9 ? 'Bar Centrale' : 'Bar Centrale, with Mark') : npc.place)}</span>`;
  tr.innerHTML = ''; hintEl.hidden = true; dlg.hidden = false;
  builder.hidden = true; choices.hidden = true;
  if (askHooks('talk', npc)) return;
  if (mode === 'english'){ if (npc.id === 'mark') markTalk(); else emmaTalk(); return; }
  { const key = findScript(npc.id); if (key){ convo.scriptKey = key; if (TYPED_SCRIPTS[key].companion) convo.companion = typeof TYPED_SCRIPTS[key].companion === 'string' ? NPC[TYPED_SCRIPTS[key].companion] : NPC.mark; openTyping(); return; } }   // (companion:'margaret': an NPC id, Lesson 13)
  if (npc.waiter){
    convo.companion = NPC.mark;
    if (!S.vocab4){ waiterFail(); return; }
    openRestaurant(); return;
  }
  if (mode === 'barrier'){
    npcLine(npc.unknown, null);
    showChoices([{ label:'“Hi! Sorry… do you speak English?”', cls:'english', fn:barrierReply }]);
    return;
  }
  if (!convo.companion && (S.l5follow || ['l5-meet','l5-introduce'].includes(S.tut)) && !npc.english) convo.companion = NPC.mark;
  convo.words = []; renderBank(); renderSentence();
  if (npc.id === 'marco' && S.tut === 'l5-meet'){ paoloMeetsMark(); return; }
  builder.hidden = false;
  convoBusy = true;
  const op = revisit ? npc.revisitOpening : npc.opening;
  if (op.asks) convo.st.lastQ = op.asks;
  setTimeout(() => {
    convoBusy = false;
    npcLine(fill(op.it), convo.companion === NPC.emma ? null : fill(op.en));
    if (convo.companion === NPC.emma) setTimeout(() => companionLine('A fresh orange juice and a croissant for me, please! And can you ask how much it is?'), 500);
    if (convo.companion === NPC.mark && npc.id === 'marco' && S.tut === 'l5-introduce') setTimeout(() => companionLine("Go on, introduce me! What's the word… presento?"), 500);
    if (convo.companion === NPC.mark && npc.id === 'lucia' && S.tut === 'l5-statue') setTimeout(() => companionLine("Is that it? Ask her! And introduce me while you're at it."), 500);
    checkBarFail();
    if (l3AskInEnglish(npc)) setTimeout(l3OfferEnglishAsk, 400);
  }, 250);
}

function barrierReply(){
  choices.hidden = true;
  meLine('Hi! Sorry… do you speak English?', { english:true });
  convoBusy = true;
  setTimeout(() => {
    npcLine('Mi dispiace, non parlo inglese.', null);
    setTimeout(() => {
      convoBusy = false;
      if (S.tut === 'practice'){
        sysLine('Still no English here. Finish the <b>Practice</b> tab in your handbook to unlock your dictionary.');
      } else {
        sysLine('They said <i>“Sorry, I don\'t speak English.”</i> Nobody in this piazza speaks English, so it\'s time to learn some Italian. Your <b>Learn Italian Handbook</b> has everything you need for a first conversation.');
        if (S.tut === 'walk') setTut('handbook');
      }
      showChoices([
        { label:'Leave', fn:closeDialog },
        { label:'Open handbook', primary:true, fn:() => { closeDialog(); openHandbook(1); } },
      ]);
    }, 900);
  }, 650);
}
