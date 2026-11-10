/* Typed conversations (first used in Lesson 6): no tiles, the player types Italian.
   A script is a list of steps; each step shows an English sentence to translate, checks the
   parsed intents, and plays the NPC's reply. Any lesson can add scripts:

     Object.assign(TYPED_SCRIPTS, { key:{ npc?, tut, scene?, modelAfter, companion?, companionIntro?,
       opening:{it,en}, reopening?:{it,en}, steps:[{ en, model, check(ints, words) -> true | hintHTML, reply(ints) -> [{it,en} | {sys}],
       mark?, after?(), lead?, wait?(next) }], done() } });

   openConvo() starts a script when its npc (default: the key) is talked to while S.tut === tut.
   reopening: what the NPC says when a half-finished script is opened again (default "Sì? Mi dica.").
   Reply lines can be listening lines ({ it, en, listen:true, rate? }, see npcLine), have their own rate,
   or hide their English ({ it, en, noEn:true }: the line a comprehension choice asks about).
   Step extras (Lesson 8 on; a companion script, companion:true):
     lead     the companion's line (string or function) shown before the step: Mark says it in English, then
              the typer shows `en` to translate
     wait(next)  called after the reply instead of moving on; call next() to go to the next step (e.g. once the
              notepad, askNumber, has the right number)
   A CHOICE step tells the companion, in English, what someone said (no typing):
     { lead?, choice:{ prompt, options:[{ label, correct?, reply? }], line?, wrong?, onPick?(option) } }
     prompt   the companion's question ("What's she saying?")      options  English answers, shown as buttons
     reply    the companion's answer to that option                wrong    the default answer to a wrong pick ("Hmm, really?")
     line     { it, en } or () => {it,en}: the line being asked about (default: the NPC's last line). A wrong pick
              replays it slowly, then the options come back.     onPick   called with each option picked (stats) */
const TYPED_SCRIPTS = {};
const L6_SCRIPTS = TYPED_SCRIPTS;   // old name, kept as an alias
const has = (ints, ...ids) => ids.some(id => ints.includes(id));
const findScript = id => { for (const [k, v] of Object.entries(TYPED_SCRIPTS)) if ((v.npc || k) === id && v.tut === S.tut && (!v.scene || v.scene === S.scene)) return k; return null; };
const ITEMS_OF = ints => ints.filter(i => i.startsWith('item:')).map(i => i.slice(5));

/* ---------- reading typed Italian ----------
   accents and apostrophes are optional, small typos are fixed and shown back,
   short words and grammar pairs (mi/ti, sai/sa, questo/questa…) are never guessed */
const keyOf = w => w.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/'/g, '').toLowerCase();
function lev(a, b, max){
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length:b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++){
    const cur = [i]; let best = i;
    for (let j = 1; j <= b.length; j++){ cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); best = Math.min(best, cur[j]); }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}
function buildLexicon(npc){
  const lex = new Map();
  phraseTable(npc).forEach(p => p.w.forEach(w => { const k = keyOf(w); if (!lex.has(k)) lex.set(k, new Set()); lex.get(k).add(w); }));
  return lex;
}
function readTyped(text, npc){
  let s = text.toLowerCase().replace(/[’‘`´]/g, "'").replace(/[.!?;:]+/g, ' | ').replace(/[^a-zàáèéìíòóùú'|\s]/g, ' ');
  s = s.replace(/\bdove\s+[eè]'?(?=\s|$)/g, "dov'e").replace(/\bdov\s+[eè]'?(?=\s|$)/g, "dov'e")
       .replace(/\bquanto?\s+[eè]'?(?=\s|$)/g, "quant'e").replace(/\bc\s+[eè]'?(?=\s|$)/g, "c'e");
  const starts = new Set(); let rawAll = s.split(/\s+/).filter(Boolean).map(t => t.replace(/^'+|'+$/g, '')).filter(Boolean);
  const raw = []; rawAll.forEach(t => { if (t === '|'){ starts.add(raw.length); return; } raw.push(t); }); starts.add(0);
  if (!raw.length) return { ok:false, msg:'Type a sentence in Italian.' };
  const lex = buildLexicon(npc), keys = [...lex.keys()];
  const proper = new Set([...NPCS.map(n => n.name.toLowerCase()), S.playerName.toLowerCase(), 'mille', 'aurora', 'gattamelata', 'mark']);
  const options = [], fixes = [];
  for (let ti = 0; ti < raw.length; ti++){
    const tok = raw[ti], k = keyOf(tok);
    if (lex.has(k)){
      let opts = [...lex.get(k)].map(w => ({ w, typed:tok }));
      if (k === 'e') opts.sort((a, b) => (a.w === 'è') === starts.has(ti) ? -1 : 1);
      options.push(opts); continue;
    }
    if (k.length <= 3) return { ok:false, unknown:tok, msg:`“${esc(tok)}” isn't in your dictionary.` };
    const thr = k.length <= 6 ? 1 : 2;
    let best = thr + 2, hits = [];
    for (const kk of keys){ const d = lev(k, kk, thr + 1); if (d < best){ best = d; hits = [kk]; } else if (d === best) hits.push(kk); }
    if (best <= thr && hits.length === 1 && lex.get(hits[0]).size === 1){ options.push([{ w:[...lex.get(hits[0])][0], typed:tok }]); continue; }
    const sugg = best <= thr + 1 ? hits.flatMap(h => [...lex.get(h)]).slice(0, 3) : [];
    return { ok:false, unknown:tok, msg:`“${esc(tok)}” isn't in your dictionary.` + (sugg.length ? ` Did you mean ${sugg.map(w => `<b>${esc(w)}</b>`).join(' or ')}?` : ' Use the dictionary to look words up.') };
  }
  // try every reading of ambiguous words (e / è …) until one parses
  let combos = [[]];
  for (const opt of options){ const next = []; for (const c of combos) for (const o of opt) next.push(c.concat([o])); combos = next.slice(0, 64); }
  let chosen = combos[0], res = null;
  for (const c of combos){ const r = parse(c.map(o => o.w), npc); if (r.ok){ chosen = c; res = r; break; } }
  if (!res) res = parse(chosen.map(o => o.w), npc);
  chosen.forEach(o => { if (o.typed !== o.w) fixes.push(`${o.typed} → ${o.w}`); });
  const tokens = chosen.map((o, i) => { const pr = proper.has(o.w) && !(o.w === 'mille' && (!chosen[i - 1] || chosen[i - 1].w !== 'dei')); return { w:o.w, label:pr ? cap(o.w) : o.w, name:pr && o.w !== 'mille' }; });
  return { ok:res.ok, res, words:chosen.map(o => o.w), tokens, display:formatSentence(tokens), fixes };
}

/* ---------- the typing conversation ---------- */
const typer = $('#typer'), typerInput = $('#typerInput');
function openTyping(){
  const n = convo.npc, key = convo.scriptKey, sc = TYPED_SCRIPTS[key];
  convo.mode = 'typing'; convo.script = sc; convo.step = S.l6.steps[key] || 0; convo.misses = 0; convo.modelShown = false;
  builder.hidden = true;
  const resumed = convo.step > 0;
  const op = resumed ? (sc.reopening || { it:'Sì? Mi dica.', en:'Yes? Go ahead.' }) : sc.opening;
  npcLine(fill(op.it), fill(op.en));
  if (n.id === 'enzo' && !resumed) companionLine('A cappuccino and a pastry for me, please! Any pastry. Surprise me.');
  if (sc.companionIntro && !resumed) companionLine(sc.companionIntro);
  convo.leadShown = false; convo.ctx = !resumed;      // ctx: the line a choice step asks about has just been said
  enqueue(showTypeStep);
}
function showTypeStep(){
  if (!convo || convo.mode !== 'typing') return;
  const step = convo.script.steps[convo.step];
  if (step.lead && !convo.leadShown){
    convo.leadShown = true;
    companionLine(fill(typeof step.lead === 'function' ? step.lead() : step.lead));
    enqueue(showTypeStep); return;
  }
  if (step.choice){ showTypeChoice(step.choice); return; }
  $('#typerEn').textContent = fill(step.en);
  typer.hidden = false; typerInput.value = ''; convo.misses = 0; convo.modelShown = false;
  setTimeout(() => typerInput.focus({ preventScroll:true }), 50);
  scrollTr();
}
function submitTyped(){
  if (!convo || convo.mode !== 'typing' || convoBusy || typer.hidden) return;
  if (displayBusy()){
    if (!convo.pendingSubmit){ convo.pendingSubmit = true; enqueue(() => { if (convo){ convo.pendingSubmit = false; submitTyped(); } }); }
    return;
  }
  const text = typerInput.value.trim();
  if (!text){ typerInput.classList.remove('shake'); void typerInput.offsetWidth; typerInput.classList.add('shake'); return; }
  const n = convo.npc, sc = convo.script, step = sc.steps[convo.step];
  const t = readTyped(text, n);
  typerInput.value = '';
  convoBusy = true;
  const shown = t.display || text;
  enqueue(() => { if (!dialogOpen) return; _meLine(shown, { miss:!t.ok }); if (t.ok) speak(shown, 1); });
  const fixNote = t.fixes && t.fixes.length ? `<span class="fixes">Fixed: ${t.fixes.map(f => esc(f)).join(', ')}</span> ` : '';
  const model = () => { convo.modelShown = true; S.l6.models++; save(); return ` Try: <b>${esc(fill(step.model))}</b>`; };
  const miss = (why) => {
    convo.misses++;
    setTimeout(() => {
      convoBusy = false;
      npcLine(FAILS[(convo.misses - 1) % FAILS.length].it, null);
      showHint(fixNote + why + (convo.misses >= sc.modelAfter ? model() : ''));
    }, 700);
  };
  if (!t.ok){
    let why = t.msg;
    if (!why && t.res){
      if (t.res.wrongName) why = "That's someone else's name.";
      else if (t.res.article){ const i = ITEM[t.res.article]; why = t.res.bare ? `Put an article before <b>${esc(i.w)}</b>: <b>${i.art} ${esc(i.w)}</b>.` : `<b>${esc(i.w)}</b> takes <b>${i.art}</b>: <b>${i.art} ${esc(i.w)}</b>.`; }
      else why = `The sentence stopped making sense at “${esc(t.words.slice(Math.max(0, t.res.at)).join(' '))}”.`;
    }
    return miss(why);
  }
  const ok = step.check(t.res.intents, t.words);
  if (ok !== true) return miss(ok);
  S.sentences++; S.l6.lines++; if (!convo.misses) S.l6.clean++; save();
  const lines = step.reply(t.res.intents).map(l => l.sys ? l : ({ it:fill(l.it), en:l.noEn ? '' : fill(l.en), reveal:l.reveal, listen:l.listen, rate:l.rate }));
  setTimeout(() => {
    playLines(lines, { hideEn:false }, () => {
      convoBusy = false;
      if (step.mark) companionLine(step.mark);
      if (step.after) step.after().forEach(l => npcLine(fill(l.it), fill(l.en)));
      if (fixNote) showHint(fixNote + 'Spelling and accents are fixed for you, but try to notice them.', 'Corretto'); else hintEl.hidden = true;
      if (step.wait){ typer.hidden = true; step.wait(advanceTypeStep); }
      else advanceTypeStep();
    });
  }, 800);
}
/* the step is done: save the progress, then the next step (or the end of the script) */
function advanceTypeStep(){
  if (!convo || convo.mode !== 'typing') return;
  const sc = convo.script;
  convo.step++; convo.leadShown = false; convo.ctx = true;
  S.l6.steps[convo.scriptKey] = convo.step; save();
  if (convo.step >= sc.steps.length){ typer.hidden = true; sc.done(); enqueue(() => endConvo()); }
  else enqueue(showTypeStep);
}
/* a CHOICE step: the companion asks what was said, the player picks an English answer */
const choiceLine = ch => { const l = typeof ch.line === 'function' ? ch.line() : ch.line; return l || (convo && convo.lastNpcText) || null; };
function showTypeChoice(ch){
  typer.hidden = true;
  if (!convo.ctx){ const l = choiceLine(ch); if (l) npcLine(fill(l.it), null); }   // reopened: say the line again
  convo.ctx = true;
  if (ch.prompt) companionLine(fill(ch.prompt));
  showChoices(ch.options.map(o => ({ label:o.label, cls:'english', fn:() => pickTypeChoice(ch, o) })));
}
function pickTypeChoice(ch, o){
  if (!convo || convo.mode !== 'typing' || convoBusy) return;
  choices.hidden = true;
  enqueue(() => { hintEl.hidden = true; });
  meLine(o.label, { english:true });
  if (ch.onPick) ch.onPick(o);
  if (o.correct){
    if (o.reply) companionLine(fill(o.reply));
    enqueue(advanceTypeStep);
    return;
  }
  companionLine(fill(o.reply || ch.wrong || 'Hmm, really?'));
  const l = choiceLine(ch);
  if (l) npcLine(fill(l.it), null, { rate:0.7 });                    // the line again, slowly
  showChoices(ch.options.map(x => ({ label:x.label, cls:'english', fn:() => pickTypeChoice(ch, x) })));
}
$('#btnType').onclick = submitTyped;
typerInput.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); submitTyped(); } if (e.key === 'Escape') closeDialog(); });
$('#btnTypeDict').onclick = () => { openDict(); setTimeout(() => $('#dictSearch')?.focus(), 60); };
