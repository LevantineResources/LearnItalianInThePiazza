/* Lesson 14 · test helpers, and a reference wiring of the trail's data into a tile-bank conversation (for tests and for
   the flow agent to copy). Nothing here runs in the game unless a test calls it.

   __debug.l14Notebook(on = true)     S.lesson = 14, S.l14.notebook = on: the notebook's base hook switches on
   __debug.l14Demo(step, who)         opens a tile-bank conversation with a stand-in for `who` (not in NPCS: no world sprite),
                                      wired like the flow would: the bank shows L14's tiles, the brain's react hook answers
                                      with l14Reply(step, who, l14Read(ints)), afterTurn runs l14AskAfter (the notebook asks
                                      A che ora? / Dove?). Returns false if a conversation is open.
   __debug.l14DemoEnd()               closes it and removes the demo hook
   __l14Read(words)                   l14Read of a sentence typed as tile words ("ha visto un cane")
   __l14Audit()                       the content checks: { lines (Italian without English), typed (model answers that
                                      don't parse or fail their own check), leaks (hints containing a model sentence),
                                      tiles (tile words the Vocabolario and earlier lessons don't teach), typedWords (the
                                      same for the typed models), vocab (count), practice (count) }
   __l14DictAudit()                   with the dictionary open: the words of L14's tiles (those listed now: the spoiler tiles once
                                      discovered) and typed models it has no entry for */

const L14_DEMO = { npc:null, step:null, who:null };
function l14DemoNpc(who){
  const c = L14_CAST[who] || { name:who }, P = (L14_SCRIPTS[L14_DEMO.step] || {})[who] || {};
  const op = P.opening || { it:'Sì? Mi dica.', en:'Yes? Go ahead.' };
  return { id:'l14demo:' + who, l14who:who, name:c.name, pitch:c.pitch || 1, formal:c.formal !== false, place:'Sul treno', where:'on the train',
    x:player.x, y:player.y - 40, baseFace:{ x:0, y:1 }, face:{ x:0, y:1 }, startsQuiet:false,
    opening:op, revisitOpening:P.revisit || op, greet:{ it:'Buongiorno', en:'Good morning' }, answerHow:{ it:'Bene, grazie.', en:'Fine, thanks.' },
    pron:['They', 'them'], unknown:op.it, agenda:[], revisitAgenda:[] };
}
const L14_DEMO_HOOK = {
  n:0,
  bank(npc, groups){
    if (!npc || !npc.l14who) return;
    const kids = !L14_CAST[npc.l14who] || L14_CAST[npc.l14who].formal === false;
    groups.push({ label:'Il cane', tiles:L14_TILES.domande.map(phraseTile) });
    groups.push({ label:'Due cani', tiles:L14_TILES.risposte.map(phraseTile) });
    groups.push({ label:'Alla porta', tiles:L14_TILES.porta.map(phraseTile) });
    groups.push({ label:'Cortesia', tiles:L14_TILES.cortesia.map(phraseTile) });
    if (kids) groups.push({ label:'I bambini', tiles:L14_TILES.bambini.map(phraseTile) });
    return groups;
  },
  phrases(npc){ return npc && npc.l14who && S.lesson !== 14 ? L14_PHRASES : []; },
  react(id, npc, st, add, out, ints, k){
    if (!npc || !npc.l14who) return;
    if (k === 0){
      const rep = l14Reply(L14_DEMO.step, npc.l14who, l14Read(ints), st.l14 || (st.l14 = {}));
      rep.lines.filter(l => !l.sys).forEach(l => add(l.it, l.noEn ? null : l.en, l.listen ? { listen:true, rate:l.rate } : undefined));
      out.asked = true;                                   // (no small-talk agenda: the trail's reply is the answer)
      out.l14 = rep; out.l14sys = rep.lines.filter(l => l.sys).map(l => l.sys === true ? l.it : l.sys);
    }
    return true;
  },
  afterTurn(npc, out){
    if (!npc || !npc.l14who || !out.l14) return;
    out.l14sys.forEach(s => sysLine(esc(s)));
    l14AskAfter(out.l14);
    return true;
  },
  hint(npc){
    if (!npc || !npc.l14who) return;
    const h = L14_HINTS[L14_DEMO.step] || {};
    return { h:h.seen || h.door || h.memory || 'Ask about the dog.', step:'l14demo' };
  },
};
Object.assign(window.__debug, {
  l14Notebook(on = true){ S.lesson = 14; S.l14 = S.l14 || {}; S.l14.notebook = !!on; save(); renderHUD(); },
  l14Demo(step, who){
    if (dialogOpen) return false;
    L14_DEMO.step = step; L14_DEMO.who = who;
    LESSON_HOOKS.l14demo = L14_DEMO_HOOK;
    const n = L14_DEMO.npc = l14DemoNpc(who);
    S.met[n.id] = S.known[n.id] = true;
    openConvo(n);
    return true;
  },
  l14DemoEnd(){ if (dialogOpen) closeDialog(); delete LESSON_HOOKS.l14demo; L14_DEMO.npc = null; renderHUD(); },
});
window.__l14Read = words => { LESSON_HOOKS.l14audit = { n:0, phrases:() => L14_PHRASES };
  try { const r = parse(String(words).toLowerCase().split(' '), { id:'l14demo' }); return r.ok ? { ints:r.intents, read:l14Read(r.intents) } : { fail:r.at }; } finally { delete LESSON_HOOKS.l14audit; } };

/* the data, for tests (a JSON copy) */
window.__l14Data = () => JSON.parse(JSON.stringify({ exercises:L14_CHAPTER.exercises, vocab:L14_CHAPTER.vocab, tiles:L14_BANK, clues:L14_CLUES, times:L14_TIMES, cast:L14_CAST, steps:Object.keys(L14_SCRIPTS) }));

/* ---------- the content audit ---------- */
window.__l14Audit = () => {
  const out = { lines:[], typed:[], leaks:[], tiles:[], typedWords:[], vocab:vocabWords(14, true).length, practice:L14_CHAPTER.exercises.length };
  /* every Italian line has its English */
  const walk = (x, path) => {
    if (Array.isArray(x)) return x.forEach((y, i) => walk(y, path + '[' + i + ']'));
    if (!x || typeof x !== 'object') return;
    if (typeof x.it === 'string' && !x.sys && !x.en) out.lines.push(path + ': ' + x.it);
    Object.entries(x).forEach(([k, v]) => { if (v && typeof v === 'object') walk(v, path + '.' + k); });
  };
  walk(L14_SCRIPTS, 'scripts'); walk(L14_CLUES, 'clues'); walk(L14_IERI_SERA, 'ieriSera');
  /* the typed models: they parse, and their own check accepts them */
  const fake = { id:'l14demo', name:'Test' }, hook = LESSON_HOOKS.l14audit = { n:0, phrases:() => L14_PHRASES };
  const models = [];
  Object.entries(L14_TYPED).forEach(([key, sc]) => sc.steps.forEach((st, i) => {
    if (typeof st.model !== 'string') return;
    models.push(st.model);
    const t = readTyped(st.model, fake), ok = t.ok && t.res.ok ? st.check(t.res.intents, t.words) : 'no parse: ' + (t.msg || '');
    if (ok !== true) out.typed.push(`${key}[${i}] "${st.model}": ${String(ok).replace(/<[^>]+>/g, '')}`);
    /* the hints it can give (a check with nothing, and with each single intent): none may contain the model */
    const hints = new Set([st.check([], [])]); L14_PHRASES.forEach(([id]) => hints.add(st.check([id], [])));
    hints.forEach(h => { if (typeof h === 'string') models.forEach(m => { if (l14Plain(h).includes(l14Plain(m))) out.leaks.push(`${key}[${i}]: ${h}`); }); });
  }));
  /* the hints per step never contain a player's line (a multi-word tile, a typed model) */
  const said = [...models, ...L14_BANK.map(t => t.label)].map(l14Plain).filter(s => s.split(' ').length >= 2);
  const hintTexts = []; const grab = x => { if (typeof x === 'string') hintTexts.push(x); else if (x && typeof x === 'object') Object.values(x).forEach(grab); };
  grab(L14_HINTS); grab(L14_SCRIPTS['l14-barrier'].sys);
  L14_CHAPTER.exercises.forEach(e => hintTexts.push(e.nudge));
  hintTexts.forEach(h => said.forEach(s => { if (l14Plain(h.replace(/<[^>]+>/g, '')).includes(s)) out.leaks.push(`hint "${h}" contains "${s}"`); }));
  L14_CHAPTER.exercises.forEach(e => { const a = l14Plain(e.type === 'mc' ? e.opts[e.a] : e.answer); if (a.split(' ').length >= 2 && l14Plain(e.nudge).includes(a)) out.leaks.push(`nudge "${e.nudge}" gives the answer`); });
  /* the tiles and the typed models: every word taught (by L14's Vocabolario, an earlier lesson, a name, a function word) */
  const saved = {}; Object.keys(L14_TYPED).forEach(k => { saved[k] = TYPED_SCRIPTS[k]; TYPED_SCRIPTS[k] = { ...L14_TYPED[k], tut:'l14-audit' }; });
  try {
    const a = vocabAudit()[14] || ['(not audited)'];
    const names = new Set(Object.values(L14_CAST).flatMap(c => vcTokens(c.name)).map(w => w.toLowerCase()));
    out.tiles = a.filter(w => !names.has(w.toLowerCase()));
    const typedW = new Set(models.flatMap(vcTokens).map(w => w.toLowerCase()));
    out.typedWords = out.tiles.filter(w => typedW.has(w.toLowerCase()));
  } finally { Object.keys(saved).forEach(k => { if (saved[k]) TYPED_SCRIPTS[k] = saved[k]; else delete TYPED_SCRIPTS[k]; }); delete LESSON_HOOKS.l14audit; }
  return out;
};
const l14Plain = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
/* with the dictionary open: L14's tile and typed words it has no entry for (whole words, accents and apostrophes ignored) */
window.__l14DictAudit = () => {
  const have = new Set(), miss = new Set();
  document.querySelectorAll('.sheet .entry .w').forEach(e => vcTokens(e.textContent).forEach(w => have.add(keyOf(w))));
  const skip = new Set([...VOCAB_FUNCTION_WORDS, ...NPCS.map(n => n.name.toLowerCase()), ...Object.values(L14_CAST).flatMap(c => vcTokens(c.name.toLowerCase())), S.playerName.toLowerCase()].map(keyOf));
  const texts = [...LESSON_HOOKS[14].vocab.map(t => t.words), ...Object.values(L14_TYPED).flatMap(sc => sc.steps.filter(s => typeof s.model === 'string').map(s => s.model))];
  texts.forEach(t => vcTokens(t).forEach(w => { if (!skip.has(keyOf(w)) && !have.has(keyOf(w))) miss.add(w); }));
  return [...miss];
};

/* the chapter's Vocabolario repeats nothing an earlier chapter teaches: the entries whose every word (but the function words) is
   already taught by Lessons 1–13 (their Vocabolario, their tiles, Lessons 1–6's lists). [] = none. */
window.__l14Repeats = () => {
  const known = new Set(), add = s => vcTokens(s).forEach(w => known.add(w));
  [...VOCAB1, ...VOCAB2].forEach(v => add(v.w));
  [...DIR_TILES, ...L4_ALL, ...L5_TILES, ...L6_TILES, ...SET_PHRASES].forEach(t => add(vcTileText(t)));
  LESSONS.filter(L => L.n < 14).forEach(L => { if (vocabOf(L.n)) vocabWords(L.n, true).forEach(w => { add(w.it); (w.also || []).forEach(add); }); vocabRequired(L.n).forEach(add); });
  const fw = new Set(VOCAB_FUNCTION_WORDS);
  return vocabWords(14, true).filter(w => { const t = vcTokens(w.it).filter(x => !fw.has(x)); return t.length && t.every(x => known.has(x)); }).map(w => w.it);
};
/* the mystery's spoilers: words of the trail's discoveries that must not appear in the handbook chapter (its dialogue, phrases,
   How it works, culture, practice, Vocabolario) or in the Verbi drill's examples */
const L14_SPOILERS = ['macchinista', 'due cani', 'brigante', 'gianni', 'nino', 'cuoco', 'camera accanto', 'sempre voluto', 'segreto', 'cabina di guida',
  'cane del', 'cane della', 'bambini sono', 'luca', 'sofia', 'ernesto', 'lina', 'rinaldi', 'ferri', 'against the rules'];
window.__l14Spoilers = () => {
  const C = L14_CHAPTER, texts = [C.dlgNote, ...C.dialogue.flat(), ...C.phrases.flat(), ...C.phrases2.flat(), C.extraNote, ...C.extra.flat(), C.how, C.culture,
    ...C.exercises.flatMap(e => [e.q, ...(e.opts || []), ...(e.tiles || []), e.answer || '', e.why, e.nudge]),
    ...vocabWords(14, true).flatMap(w => [w.it, w.en, w.note || '', w.say || '']), ...C.verbs.flatMap(v => v.forms.map(f => f.ex || ''))];
  const low = texts.map(t => String(t).replace(/<[^>]+>/g, '').toLowerCase());
  return L14_SPOILERS.flatMap(s => low.filter(t => t.includes(s)).map(t => `${s}: ${t.slice(0, 80)}`));
};
/* a typed step's own check on a sentence, as the typer reads it: true, or the hint it would show */
window.__l14TypedCheck = (key, i, text) => { LESSON_HOOKS.l14audit = { n:0, phrases:() => L14_PHRASES };
  try { const t = readTyped(text, { id:'l14demo', name:'Test' }); return t.ok && t.res.ok ? L14_TYPED[key].steps[i].check(t.res.intents, t.words) : 'no parse: ' + (t.msg || ''); }
  finally { delete LESSON_HOOKS.l14audit; } };
