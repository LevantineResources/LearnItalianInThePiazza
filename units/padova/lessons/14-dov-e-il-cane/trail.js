/* Lesson 14 · the trail's helpers (runs after the engine): read what the player said, pick the NPC's reply from
   L14.scripts, play lines in a conversation, and the notebook's spec. No flow here: the flow agent calls these from
   its hooks (talk / react / afterTurn). See docs/lessons/14-dov-e-il-cane.md, "As built (content)".

   l14Read(ints, words?)          → { keys:[what the player asked, in order], agree:'m' | 'f' | 'pl' | null, tu, polite, greet,
                                     her, driver, two, promise, door } from the parser's intents (L14.phrases)
   l14Reply(step, who, read, st?) → { lines:[{ it, en, listen?, rate?, sys? }], clues:[ids to write when understood],
                                     asks:[{ kind:'time' | 'where', clue }], keys:[the script keys used], other:bool }
                                     The reply follows what was said: each asked thing in order; the agreement (andata
                                     for Biscuit gets a puzzled answer); tu to an adult gets the person's own remark;
                                     anything else gets their `other` line. st (per person, optional) remembers what was
                                     answered already (st.said) so a repeated question gets the same short answer.
   l14Play(lines, speakers?)      plays reply lines in the open conversation (npcLine / sysLine; speakers: { who:npc })
   l14AskAfter(reply, o?)         after the lines: the notebook's questions (nbAskTime / nbAskWhere) for the reply's asks,
                                  one after the other; o.onDone() when all are answered. Clues without a question are
                                  written at once (nbNote).
   l14NotebookSpec()              the notebook spec for Lesson 14 (ui/notebook.js), "Ieri sera…" filtered by S.l13.seen */

QWORDS.add('ricorda'); QWORDS.add('sentito'); QWORDS.add('può aprire'); JOIN.add('ha sentito'); JOIN.add('mi scusi'); JOIN.add('scusi il disturbo');   // (no vocative comma: Scusi il disturbo; a three-word entry, so Scusi, il resto… keeps it)
CLAUSE.add('ci sono due'); CLAUSE.add('non lo dico'); CLAUSE.add('a che');
/* È sicuro? / È sicura? (its own question, after another one); Scusi il disturbo, permesso? */
QWORDS.add('sicuro'); QWORDS.add('sicura'); CLAUSE.add('è sicuro'); CLAUSE.add('è sicura'); QWORDS.add('permesso'); COMMA_BEFORE.add('disturbo permesso');

/* the mystery's discoveries (the spoiler tiles: whose dogs, how many) are shown and listed once the player has seen the second
   dog slip out of the driver's cab (S.l14.cabOpen), or after the lesson */
function l14Discovered(){ return S.lesson > 14 || (S.lesson === 14 && !!S.l14 && (!!S.l14.cabOpen || S.tut === 'l14-done')); }

/* the speaking voice: a whole sentence → what it asks */
function l14Read(ints, words = []){
  /* tu: "hai visto", "sai", or "come stai" (the words: come sta / come stai are both ask_how) */
  const r = { keys:[], agree:null, sure:null, tu:(has(ints, 'l14:seen_tu') && !has(ints, 'l14:seen')) || has(ints, 'know:tu') || words.includes('stai'), greet:has(ints, 'greet'),
    polite:has(ints, 'excuse', 'l14:excuse', 'l14:disturb', 'l14:permesso', 'permesso', 'please'), sa:has(ints, 'know:lei', 'know:tu'),
    her:has(ints, 'l14:her_dog', 'l14:is_her_dog'), driver:has(ints, 'l14:driver_dog'), two:has(ints, 'l14:two_dogs'),
    promise:has(ints, 'l14:promise'), door:has(ints, 'l14:permesso', 'permesso', 'l14:disturb', 'l14:excuse', 'excuse'),
    permesso:has(ints, 'l14:permesso', 'permesso'), disturb:has(ints, 'l14:disturb'), who:null };
  const add = k => { if (!r.keys.includes(k)) r.keys.push(k); };
  ints.forEach(i => {
    if (i === 'l14:seen' || i === 'l14:seen_tu') add('seen');
    else if (i.startsWith('l14:went:')){ add('went'); r.agree = i.slice(9); }
    else if (i.startsWith('l14:sure:')){ add('sure'); r.sure = i.slice(9); }
    else if (i === 'l14:when' || i === 'ask_when') add('when');            // (ask_when: Lesson 10's phrase for the same words)
    else if (i === 'l14:heard') add('heard');
    else if (i === 'l14:remember') add('remember');
    else if (i === 'l14:where') add('where');
    else if (i === 'l14:two_dogs') add('two');
    else if (i === 'l14:driver_dog') add('driver');
    else if (i === 'l14:her_dog' || i === 'l14:is_her_dog') add('her');
    else if (i === 'l14:promise') add('promise');
    else if (i === 'look'){ /* "Cerco un cane": the same as asking if they've seen one */ add('seen'); }
    else if (i === 'l14:thanks' || i === 'thanks') add('thanks');
    else if (i === 'bye') add('bye');
    else if (i === 'greet') add('greet');
    else if (i === 'like:ti') add('like');
  });
  /* "Chi è?" behind a door: who you are. 'we' Siamo io e Margaret (Siamo Sam e Margaret); 'sono-pl' Sono io e Margaret (understood:
     a tip, two people take siamo); 'me' Sono io, Sono Sam, Sono io con Margaret, Mi chiamo Sam */
  const me = has(ints, 'pron:me', 'name_only'), mg = has(ints, 'l14:margaret');
  if (has(ints, 'l14:siamo') && (mg || me)) r.who = 'we';
  else if (has(ints, 'l14:sono') && me && mg && has(ints, 'and')) r.who = 'sono-pl';
  else if ((has(ints, 'l14:sono') && me) || has(ints, 'give_name')) r.who = 'me';
  if (r.who) add('who');
  return r;
}

/* the reply: every asked thing in order, from the person's script */
function l14Reply(step, who, read, st = {}){
  const S14 = L14_SCRIPTS[step] || {}, P = S14[who] || {}, on = P.on || {};
  const out = { lines:[], clues:[], asks:[], keys:[], other:false };
  st.said = st.said || {};
  const push = (k, list) => { if (!list || !list.length) return false; out.lines.push(...list); out.keys.push(k); st.said[k] = (st.said[k] || 0) + 1; return true; };
  if (read.tu && on.tu) push('tu', on.tu);
  const asked = read.keys.filter(k => k !== 'greet' || read.keys.length === 1);
  /* the chef: the two dogs, explained in one or two sentences */
  if (who === 'nino' && (read.two || read.her || read.driver)){
    if (read.driver) push('driver', on.driver);
    if (read.her){ push('her', on.her); if (P.on.herClue) out.clues.push(P.on.herClue); }
    if (read.two && !read.her && !read.driver){ push('two', on.two); if (P.on.herClue && on.two) out.clues.push(P.on.herClue); }
    asked.filter(k => !['two', 'her', 'driver', 'seen'].includes(k)).forEach(k => push(k, on[k]));
  } else {
    asked.forEach(k => {
      if (k === 'went'){
        const g = read.agree === 'f' ? 'f' : 'm';
        if (on.went) push('went', on.went[g]);
        if (on.went && P.on.clue && g === 'm' && step === 'l14-couple') out.asks.push({ kind:'where', clue:P.on.clue });
        return;
      }
      if (k === 'promise' && who === 'gianni'){ push('promise', on.promise); push('tip', on.tip); return; }
      if (!push(k, on[k])) return;
      if (k === 'seen' && on.clue){ out.clues.push(on.clue); if (P.on.ask === 'where') out.asks.push({ kind:'where', clue:on.clue }); }
      if (k === 'when' && on.whenClue){ const c = L14_CLUES[on.whenClue]; if (c && c.time) out.asks.push({ kind:'time', clue:on.whenClue }); else out.clues.push(on.whenClue); }
      if (k === 'heard' && on.heardClue) out.clues.push(on.heardClue);
      if (k === 'whose' && on.whoseClue) out.clues.push(on.whoseClue);
    });
  }
  if (!out.lines.length){
    if (read.greet && on.greet) push('greet', on.greet);
    else { push('other', on.other); out.other = true; }
  }
  /* dedupe the notebook's questions (one per clue and kind) */
  out.asks = out.asks.filter((a, i) => out.asks.findIndex(b => b.kind === a.kind && b.clue === a.clue) === i);
  return out;
}

/* play reply lines in the open conversation; speakers maps a line's `who` to an NPC (two people in one conversation) */
function l14Play(lines, speakers = {}){
  lines.forEach(l => {
    if (l.sys) { sysLine(esc(l.sys === true ? l.it : l.sys)); if (l.sys === true) return; }
    const sp = l.who && speakers[l.who];
    npcLine(l.it, l.noEn ? null : l.en, { listen:!!l.listen, rate:l.rate, speaker:sp || undefined, forceKnown:!!(sp && S.known[sp.id]) });
    if (convo) convo.lastNpcText = { it:l.it, en:l.en, listen:!!l.listen };
  });
}
/* the notebook's questions after a reply, one after another */
function l14AskAfter(reply, o = {}){
  reply.clues.forEach(id => { if (!reply.asks.some(a => a.clue === id)) enqueue(() => nbNote(id)); });
  const asks = reply.asks.slice();
  const next = () => {
    const a = asks.shift();
    if (!a){ if (o.onDone) o.onDone(); return; }
    const line = [...reply.lines].reverse().find(l => !l.sys && (a.kind === 'time' ? l.listen : true)) || null;
    const who = L14_CAST[L14_CLUES[a.clue].who] || {};
    const ask = { clue:a.clue, line:line ? { it:line.it, rate:line.rate, pitch:who.pitch } : null, mode:o.mode, onDone:() => next() };
    if (a.kind === 'time') nbAskTime(ask); else nbAskWhere(ask);
  };
  if (asks.length) next(); else if (o.onDone) enqueue(o.onDone);
}

/* the notebook's spec: Lesson 13's dinner clues the player saw (S.l13.seen, set by Lesson 13's flow; all of them without it) */
function l14NotebookSpec(){
  const seen = S.l13 && Array.isArray(S.l13.seen) ? new Set(S.l13.seen) : null;
  return { ...L14_NOTEBOOK, ieriSera:L14_IERI_SERA.map(x => ({ ...x, seen:seen ? seen.has(x.id) : true })) };
}
