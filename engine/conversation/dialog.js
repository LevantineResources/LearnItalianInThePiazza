/* Opening a conversation and routing it to the right engine (tiles, typed, companion). */

/* =========================================================
   CONVERSATION
   ========================================================= */
const dlg = $('#dialog'), tr = $('#transcript'), hintEl = $('#hint'), builder = $('#builder'), choices = $('#choices');

function openConvo(npc){
  if (frozen()) return;
  if (npc.crowd){ crowdTouch(npc); return; }       // the crowd: the Permesso pick, not a conversation (world/crowd.js)
  if (npc.ambient && !askHooks('visitorTalk', npc)){ ambientSay(npc); return; }   // an ambient person (a museum visitor): a line in a bubble (world/crowd.js)
  npc = unitHook('redirectTo', npc) || npc;          // (the unit's: Padova's Lessons 5–6 send you from Mark to Paolo, to Bruno)
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
  const mode = npc.english ? 'english' : unitHook('barrier', npc) ? 'barrier' : 'talk';     // (barrier: no words yet, Padova's Lesson 1)
  const revisit = !!S.met[npc.id] && !npc.sign;      // (reading a vendor's sign is not an introduction)
  convo = { npc, known, mode, fails:0, words:[], done:false, tips:{},
    companion: unitHook('companion', npc) || null,
    st:{ revisit, npcGreeted:revisit || !npc.startsQuiet, playerToldHow:false, playerGaveName:revisit,
         npcToldName:revisit, npcSaidPiacere:revisit, lastQ:null, wrapping:false, order:[], served:false, lastDir:null, pendingWhere:null } };
  $('#dlgWho').innerHTML = `<b>${known ? esc(npc.name) : 'Someone'}</b> <span class="where">· ${esc(unitHook('placeLabel', npc) || npc.place)}</span>`;
  tr.innerHTML = ''; hintEl.hidden = true; dlg.hidden = false;
  builder.hidden = true; choices.hidden = true;
  if (askHooks('talk', npc)) return;
  if (mode === 'english'){ unitHook('englishTalk', npc); return; }          // someone who speaks English (Padova: Mark, Emma)
  { const key = findScript(npc.id); if (key){ convo.scriptKey = key; if (TYPED_SCRIPTS[key].companion) convo.companion = typeof TYPED_SCRIPTS[key].companion === 'string' ? NPC[TYPED_SCRIPTS[key].companion] : UNIT.friend && NPC[UNIT.friend.id]; openTyping(); return; } }   // (companion: an NPC id, or true: the unit's friend)
  if (unitHook('convoStart', npc, mode)) return;   // the unit's own conversations (Padova: the Lesson 4 waiter, the Lesson 1 barrier)
  if (!convo.companion && !npc.english){ const c = unitHook('convoCompanion', npc); if (c) convo.companion = c; }   // (Padova: Mark, Lesson 5)
  convo.words = []; renderBank(); renderSentence();
  if (unitHook('convoBank', npc)) return;          // (Padova: Paolo meets Mark, Lesson 5)
  builder.hidden = false;
  convoBusy = true;
  const op = revisit ? npc.revisitOpening : npc.opening;
  if (op.asks) convo.st.lastQ = op.asks;
  setTimeout(() => {
    convoBusy = false;
    npcLine(fill(op.it), convo.companion && convo.companion.translateFor ? null : fill(op.en));    // (translating for a companion: no English)
    unitHook('convoOpened', npc);                   // (Padova: the companion's first words, Lessons 2–5)
  }, 250);
}
