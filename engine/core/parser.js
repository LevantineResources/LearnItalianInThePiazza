/* The phrase parser: phraseTable -> parse -> intents, and formatSentence for display. */

/* ---------- the phrase parser ----------
   Every tile, word or set phrase, is flattened to words first. The parser then
   matches known phrases (longest first) and turns the sentence into intents. */
function phraseTable(npc){
  const me = S.playerName.toLowerCase();
  const P = [
    ['ask_name','come ti chiami'], ['ask_how','come stai'], ['ask_how','come sta'], ['give_name','mi chiamo ' + me],
    ['answer_how','sto bene grazie'], ['answer_how','sto bene'], ['answer_how','bene grazie'], ['answer_how','bene'],
    ['ask_back','e tu'], ['greet','ciao'], ['greet','buongiorno'], ['nice','piacere'], ['thanks','grazie'], ['thanks','grazie mille'],
    ['name_only', me],
    ['want:me','vorrei'], ['please','per favore'], ['yes','sì'], ['no','no'], ['how_much',"quant'è"], ['and','e'],
    ['excuse','scusa'], ['excuse','scusi'], ['where',"dov'è"], ['far','è lontano'], ['repeat','puoi ripetere'], ['repeat','può ripetere'],
    ['confirm:right','a destra'], ['confirm:left','a sinistra'], ['confirm:straight','dritto'], ['confirm:straight','sempre dritto'],
    ['subj:me','per me'], ['subj:him','per lui'], ['pron:me','io'], ['pron:him','lui'],
    ['want:him','vorrebbe'], ['can:me','posso'], ['can:him','può'], ['eat:me','mangio'], ['eat:him','mangia'], ['eat','mangiare'],
    ['not','non'], ['is:him','è'], ['veg','vegetariano'], ['have','avete'], ['have',"c'è"], ['bill','il conto'],
    ...(unitHook('basePhrases', npc, 'menu') || []),         // (the unit's menu: Padova's Lesson 4, food:<key>)
    ['look','cerco'], ['book','il mio libro'], ['book','il libro'], ['book','un libro'], ['book','libro'], ['blue','blu'],
    ['know:tu','sai'], ['know:lei','sa'], ['have:tu','hai'], ['have:lei','ha'], ['donthave','non ho'], ['dontknow','non lo so'],
    ['sir','signore'], ['madam','signora'], ['bye','arrivederci'],
    ['intro:ti','ti presento'], ['intro:le','le presento'], ['this:m','questo è'], ['this:f','questa è'],
    ['myfriend:m','il mio amico'], ['myfriend:f','la mia amica'], ['heis','lui è'], ['english','è inglese'],
    ['noitalian','non parla italiano'], ['friends','siamo amici'],
    ...(unitHook('basePhrases', npc, 'names') || []),        // (the unit's places and the friend's name: Padova's place:gattamelata, name:mark…)
  ];
  hooks().forEach(h => { if (h.phrases) P.push(...h.phrases(npc)); });
  /* the little words (Lesson 2, set phrases from then on): connectors glue a sentence like e; "Ancora una volta, per favore"
     asks to hear the last line again, like Può ripetere?. A lesson's own reading of the same words (Lesson 9's poi) wins. */
  { const have = new Set(P.map(([, w]) => w));
    [['and', 'poi'], ['and', 'ma'], ['and', 'quindi'], ['repeat', 'ancora una volta per favore'], ['repeat', 'ancora una volta'], ['ask_back', 'e lei']]
      .forEach(e => { if (!have.has(e[1])) P.push(e); }); }
  /* hook place tiles become place:<key> like the unit's places, so "dov'è il mercato" asks for where:mercato */
  hookPlaceTiles().forEach(t => { const k = placeKeyOf(t); if (k) P.push(['place:' + k, t.words.toLowerCase()]); });
  ITEMS.forEach(i => {
    P.push(['item:' + i.w, `${i.art} ${i.w}`]);
    P.push(['badart:' + i.w, `${i.art === 'un' ? 'una' : 'un'} ${i.w}`]);
    P.push(['bare:' + i.w, i.w]);
  });
  NPCS.forEach(n => { if (S.met[n.id] && !n.english) P.push([n === npc ? 'address' : 'other_name', n.name.toLowerCase()]); });
  return P.map(([id, str]) => ({ id, w:str.split(' ') })).sort((a, b) => b.w.length - a.w.length);
}
/* a place tile's PLACES key: its place field when that is a key, else the PLACES entry with the same words */
function placeKeyOf(t){
  if (typeof t.place === 'string' && PLACES[t.place]) return t.place;
  const w = t.words.toLowerCase();
  return Object.keys(PLACES).find(k => PLACES[k][0].toLowerCase() === w) || null;
}
function parse(words, npc){
  const table = phraseTable(npc), out = [];
  let i = 0;
  while (i < words.length){
    const hit = table.find(p => p.w.every((w, k) => words[i + k] === w));
    if (!hit) return { ok:false, at:i };
    if (hit.id === 'other_name') return { ok:false, at:i, wrongName:true };
    if (hit.id.startsWith('badart:') || hit.id.startsWith('bare:')) return { ok:false, at:i, article:hit.id.split(':')[1], bare:hit.id.startsWith('bare:') };
    out.push(hit.id); i += hit.w.length;
  }
  return { ok:true, intents:out };
}

const GREET = new Set(['ciao','buongiorno','piacere']);
const EXCUSE = new Set(['scusa','scusi']);
/* words that always start a new sentence in formatSentence; lessons add their own (Lesson 7: 'quanto').
   CLAUSE and QWORDS also take two-word entries ('la prendo', 'le piace'): they match a word and the next one.
   JOIN: two-word pairs that are never split into two sentences ('resto non': il resto non è giusto); a three-word entry after a
   greeting or an excuse word keeps it in its sentence, with no vocative comma ('scusi il disturbo', Lesson 14). */
const CLAUSE = new Set();
const JOIN = new Set();
/* NOTQ: a clause with one of these words (or two-word pairs) is never a question, even with a QWORD in it (Lesson 9:
   'giri', 'vada', 'non è': Giri a destra. Vada sempre dritto. Non è lontano.) */
const NOTQ = new Set();
/* EXCL: a clause that starts with one of these words (or two-word pairs) ends with "!" (Lesson 12's quests: Sorridete!
   Che bello! Guarda!) */
const EXCL = new Set();
/* COMMA_BEFORE: inside a sentence, a comma goes before this word, or between this two-word pair (Lesson 13: 'ma': Ho visto
   il museo, ma ho preso il treno; 'lei perché': E Lei, perché Venezia?) */
const COMMA_BEFORE = new Set();
const QWORDS = new Set(['sai','sa','hai','ha','statua','come',"dov'è","quant'è",'lontano','ripetere','destra','sinistra','dritto','avete',"c'è"]);
function formatSentence(tokens){
  const clauses = []; let cur = [];
  tokens.forEach((t, i) => {
    const next = tokens[i+1];
    /* "grazie (mille)" + "arrivederci" stays one farewell: Grazie, arrivederci! */
    const thanksOnly = cur.length && cur.every(c => c.w === 'grazie' || c.w === 'mille');
    if (cur.length && t.w === 'per' && next && (next.w === 'me' || next.w === 'lui' || next.w === 'lei')){
      const carry = cur[cur.length - 1].w === 'e' ? cur.pop() : null;
      if (cur.length) clauses.push(cur);
      cur = carry ? [carry] : [];
    }
    if (cur.length === 2 && GREET.has(cur[0].w) && cur[1].name){ clauses.push(cur); cur = []; }
    /* an excuse word (scusi, scusa) or "sto bene" after a clause starts a new sentence: Sto bene, grazie. Scusi, … */
    const startsNew = cur.length && (['cerco','sai','sa','hai','ha','sto'].includes(t.w) || EXCUSE.has(t.w) || (t.w === 'arrivederci' && !thanksOnly) || ((t.w === 'ti' || t.w === 'le') && next && next.w === 'presento') || ((t.w === 'questo' || t.w === 'questa') && next && next.w === 'è') || t.w === 'siamo' ||
      (t.w === 'lui' && next && next.w === 'è') || t.w === 'avete' || t.w === "c'è" || (t.w === 'non' && !['io','lui'].includes(cur[cur.length - 1].w)) ||
      t.w === 'come' || t.w === 'vorrei' || t.w === "quant'è" || (t.w === "dov'è" && !['sai','sa'].includes(cur[cur.length - 1].w)) || t.w === 'puoi' || t.w === 'può' ||
      (t.w === 'è' && next && next.w === 'lontano') || CLAUSE.has(t.w) || (next && CLAUSE.has(t.w + ' ' + next.w)) || (t.w === 'e' && next && next.w === 'tu') ||
      (t.w === 'mi' && next && next.w === 'chiamo') || (t.w === 'grazie' && next && next.w === 'mille') ||
      (t.w === 'a' && next && (next.w === 'destra' || next.w === 'sinistra') && cur[cur.length - 1].w !== 'gira'));
    if (startsNew && !JOIN.has(cur[cur.length - 1].w + ' ' + t.w)){ clauses.push(cur); cur = []; }
    cur.push(t);
    if ((GREET.has(t.w) || EXCUSE.has(t.w)) && cur.length === 1 && next && !next.name && next.w !== 'signore' && next.w !== 'signora' && next.w !== 'mille' && !(t.w === 'grazie') && !(tokens[i+2] && JOIN.has(t.w + ' ' + next.w + ' ' + tokens[i+2].w))){ clauses.push(cur); cur = []; }
    else if (EXCUSE.has(cur[0] && cur[0].w) && cur.length === 2 && (t.w === 'signore' || t.w === 'signora') && next){ clauses.push(cur); cur = []; }
    else if (t.name && cur.length === 1 && next){ clauses.push(cur); cur = []; }
  });
  if (cur.length) clauses.push(cur);
  const out = clauses.map(c => {
    let s = '';
    c.forEach((t, i) => {
      if (i){
        const a = c[i-1];
        const comma = ((GREET.has(a.w) || EXCUSE.has(a.w)) && (t.w === 'signore' || t.w === 'signora')) || ((a.w === 'me' || a.w === 'lui' || a.w === 'lei') && c[i-2] && c[i-2].w === 'per' && i < c.length) || (a.w === 'bene' && t.w === 'grazie') || ((GREET.has(a.w) || a.w === 'grazie' || a.w === 'mille') && (t.name || t.w === 'arrivederci')) || (i === 1 && (a.w === 'sì' || a.w === 'no')) || (t.w === 'per' && c[i+1] && c[i+1].w === 'favore') || COMMA_BEFORE.has(t.w) || COMMA_BEFORE.has(a.w + ' ' + t.w);
        s += comma ? ', ' : ' ';
      }
      s += t.label;
    });
    s = cap(s);
    const first = c[0].w;
    const q = !c.some((t, i) => NOTQ.has(t.w) || (c[i + 1] && NOTQ.has(t.w + ' ' + c[i + 1].w))) && c.some((t, i) => QWORDS.has(t.w) || (c[i + 1] && QWORDS.has(t.w + ' ' + c[i + 1].w))) || (c.length === 2 && first === 'e' && c[1].w === 'tu');
    return { text:s, end:(q ? '?' : (GREET.has(first) || first === 'grazie' || first === 'arrivederci' || EXCL.has(first) || (c[1] && EXCL.has(first + ' ' + c[1].w))) ? '!' : '.'),
             vocative:c.length === 1 && (c[0].name || EXCUSE.has(first)), excuse:EXCUSE.has(first) && c.length === 1,
             inter:c.length === 1 && (first === 'no' || first === 'sì') };
  });
  return out.map((c, i) => {
    const next = out[i + 1];
    const prev = out[i - 1], low = t => t.charAt(0).toLowerCase() + t.slice(1);
    if (c.vocative && next) return (prev && prev.inter && c.excuse ? low(c.text) : c.text) + ',';   // (No,) scusi, …
    if (c.inter && next && next.excuse) return c.text + ',';
    const text = prev && (prev.vocative || prev.inter && c.excuse) ? low(c.text) : c.text;   // (No,) scusi.
    return text + c.end;
  }).join(' ').replace(/^(.)/, m => m.toUpperCase());
}
