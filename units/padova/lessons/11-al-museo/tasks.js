/* Lesson 11 · Al museo. Lucia's homework: the tasks (statues and rooms), and the reader that turns what the player said
   into a comparison, an emotion, a liking, a count… (word by word: the parser only has to accept the words, so other
   lessons' phrase ids never get in the way). The answers are checked here: objective ones against the works' data (the
   art manifest: dates, sizes, heights; the tags: people, animals, who is in it), opinions accepted with a reaction from
   Lucia. Design: docs/lessons/11-al-museo.md ("The tasks").

   A task is one bullet of the doc: one work, or a pair (then the player stands at either: "questo" is the one they are
   at, "quello" the other). q: its questions, asked in order:
     cmp     a comparison: attr 'year' | 'size' | 'height' | 'tone', adj (the question's adjective, masculine)
     prefer  which one do you prefer (opinion)
     feel    how someone seems: who, g (their gender), ok (true), maybe (arguable: accepted, Lucia half agrees),
             opinion:true (any adjective), yesno:true (a yes / no question), lucia (her own view, after an opinion)
     like    what do you like about it (opinion; mi piace / mi piacciono must agree)
     count   how many: noun 'cavallo' | 'persona', range [lo, hi]
     see     what do you see (the people in it: the work's tags)
     animal  which animal (want)
     biggest is it the biggest in the museum (yes) */

const L11_TASKS = [
  /* the statues (atrium, 2 of these) */
  { id:'s-apollo', room:0, works:['bernini-apollo', 'canova-psiche'], en:'Apollo e Dafne, Amore e Psiche: which is older? Which do you prefer?', q:[
    { k:'cmp', attr:'year', adj:'vecchio', it:'Allora: questa o quella? Quale è più vecchia?', en:'So: this one or that one? Which one is older?' },
    { k:'prefer', it:'E Lei? Quale preferisce?', en:'And you? Which one do you prefer?' } ] },
  { id:'s-pieta', room:0, works:['michelangelo-pieta'], en:'La Pietà: how does Mary seem? What do you like about it?', q:[
    { k:'feel', who:'Maria', g:'f', ok:['triste'], maybe:['calmo'], it:'La Pietà… Secondo Lei, Maria sembra felice, triste o arrabbiata?', en:'The Pietà… What do you think: does Mary seem happy, sad or angry?' },
    { k:'like', white:true, it:'Cosa Le piace di questa statua?', en:'What do you like about this statue?' } ] },
  { id:'s-perseo', room:0, works:['cellini-perseo', 'boccioni-forme'], en:'Perseo, Forme uniche: which is taller?', q:[
    { k:'cmp', attr:'height', adj:'alto', it:'Perseo e Boccioni… Quale è più alta? Questa o quella?', en:'Perseus and Boccioni… Which one is taller? This one or that one?' } ] },
  /* Sala 1 */
  { id:'r1-battaglia', room:1, works:['uccello-san-romano'], en:'La battaglia di San Romano: how many horses?', q:[
    { k:'count', noun:'cavallo', range:[4, 20], it:'Che battaglia! Quanti cavalli ci sono?', en:'What a battle! How many horses are there?' } ] },
  { id:'r1-orazione', room:1, works:['mantegna-orazione'], en:"Orazione nell'orto: how does Jesus seem?", q:[
    { k:'feel', who:'Gesù', g:'m', ok:['triste', 'spaventato'], maybe:['calmo'], it:'Secondo Lei, Gesù sembra felice, spaventato o triste?', en:'What do you think: does Jesus seem happy, frightened or sad?' } ] },
  { id:'r1-annunciazione', room:1, works:['martini-annunciazione', 'masaccio-tributo'], en:"L'Annunciazione, Il pagamento del tributo: which is older?", q:[
    { k:'cmp', attr:'year', adj:'vecchio', it:'Questo o quello? Quale è più vecchio?', en:'This one or that one? Which one is older?' } ] },
  /* Sala 2 */
  { id:'r2-primavera', room:2, works:['botticelli-primavera'], en:'La Primavera: how many people?', q:[
    { k:'count', noun:'persona', range:[8, 9], it:'La Primavera! Quante persone ci sono?', en:'The Primavera! How many people are there?' } ] },
  { id:'r2-dama', room:2, works:['leonardo-dama', 'tiziano-bacco'], en:"La dama con l'ermellino, Bacco e Arianna: which is smaller?", q:[
    { k:'cmp', attr:'size', adj:'piccolo', it:'Leonardo e Tiziano… Quale è più piccolo?', en:'Leonardo and Titian… Which one is smaller?' } ] },
  { id:'r2-tempesta', room:2, works:['giorgione-tempesta'], en:'La tempesta: what do you see? What do you like about it?', q:[
    { k:'see', it:'La tempesta… Cosa vede?', en:'The Tempest… What do you see?' },
    { k:'like', it:'Cosa Le piace di questo quadro?', en:'What do you like about this painting?' } ] },
  /* Sala 3 (Canaletto is kept for the ending) */
  { id:'r3-giuditta', room:3, works:['caravaggio-giuditta'], en:'Giuditta e Oloferne: how do Judith and Holofernes seem?', q:[
    { k:'feel', who:'Giuditta', g:'f', ok:['arrabbiato'], maybe:['calmo'], it:'Secondo Lei, Giuditta sembra felice, arrabbiata o spaventata?', en:'What do you think: does Judith seem happy, angry or frightened?' },
    { k:'feel', who:'Oloferne', g:'m', ok:['spaventato'], maybe:['sorpreso'], it:'E Oloferne?', en:'And Holofernes?' } ] },
  { id:'r3-matteo', room:3, works:['caravaggio-matteo', 'reni-atalanta'], en:'La vocazione di San Matteo, Atalanta e Ippomene: which is darker?', q:[
    { k:'cmp', attr:'tone', adj:'scuro', it:'Caravaggio e Reni… È più chiaro o più scuro di quello?', en:'Caravaggio and Reni… Is it lighter or darker than that one?' } ] },
  { id:'r3-mangiafagioli', room:3, works:['carracci-mangiafagioli'], en:'Il mangiafagioli: does the man seem happy?', q:[
    { k:'feel', who:"l'uomo", g:'m', opinion:true, yesno:true, lucia:'sorpreso', it:"Ah ah! Secondo Lei, l'uomo sembra felice?", en:'Ha ha! What do you think: does the man seem happy?' } ] },
  /* Sala 4 */
  { id:'r4-cane', room:4, works:['balla-cane'], en:'Dinamismo di un cane al guinzaglio: which animal?', q:[
    { k:'animal', want:'cane', it:"Balla… Che animale c'è?", en:'Balla… Which animal is there?' } ] },
  { id:'r4-citta', room:4, works:['boccioni-citta', 'dechirico-canto'], en:"La città che sale, Il canto d'amore: which is more modern?", q:[
    { k:'cmp', attr:'year', adj:'moderno', it:'Boccioni e de Chirico… Quale è più moderno?', en:'Boccioni and de Chirico… Which one is more modern?' } ] },
  { id:'r4-soutine', room:4, works:['modigliani-soutine'], en:'Ritratto di Chaim Soutine: happy or sad?', q:[
    { k:'feel', who:null, g:'m', opinion:true, it:'Modigliani… Secondo Lei, sembra felice o triste?', en:'Modigliani… What do you think: does he seem happy or sad?' } ] },
  /* Sala 5 */
  { id:'r5-atene', room:5, works:['raffaello-atene'], en:'La scuola di Atene: the biggest in the museum?', q:[
    { k:'biggest', it:'La scuola di Atene! È il più grande del museo?', en:'The School of Athens! Is it the biggest in the museum?' } ] },
  { id:'r5-giorgio', room:5, works:['raffaello-san-giorgio', 'raffaello-san-michele'], en:'San Giorgio, San Michele: which is bigger?', q:[
    { k:'cmp', attr:'size', adj:'grande', it:'Due santi, due draghi! Quale è più grande?', en:'Two saints, two dragons! Which one is bigger?' } ] },
  { id:'r5-autoritratto', room:5, works:['raffaello-autoritratto'], en:'Autoritratto: does Raphael seem young or old?', q:[
    { k:'feel', who:null, g:'m', ok:['giovane'], it:'Raffaello… Sembra giovane o vecchio?', en:'Raphael… Does he seem young or old?' } ] },
];
const L11_TASK = Object.fromEntries(L11_TASKS.map(t => [t.id, t]));
const L11_ROOMS = [1, 2, 3, 4, 5];
const l11TaskOf = workId => L11_TASKS.find(t => t.works.includes(workId)) || null;

/* ---------- facts from the manifest ---------- */
const L11_W = id => ART.works.find(w => w.id === id);
const l11Year = w => +String(w.date).match(/\d{3,4}/)[0];
const l11Dims = w => { const m = String(w.size_cm).match(/[\d.]+/g).map(Number); return { h:m[0], w:m[1] || m[0] }; };
/* Caravaggio's Calling of St Matthew is darker than Reni's Atalanta (both are dark on the tags' scale) */
const L11_TONE = { 'caravaggio-matteo':2, 'reni-atalanta':1 };
/* a work's value on an attribute: higher = more of it */
function l11Val(id, attr){
  const w = L11_W(id), d = l11Dims(w);
  if (attr === 'year') return l11Year(w);
  if (attr === 'size') return d.h * d.w;
  if (attr === 'height') return d.h;
  if (attr === 'tone') return L11_TONE[id] || 0;
  return 0;
}
/* the adjectives a comparison on an attribute can use, with the direction (+1: more of the attribute) */
const L11_ATTR_ADJ = { year:{ vecchio:-1, moderno:1 }, size:{ grande:1, piccolo:-1 }, height:{ alto:1, grande:1, piccolo:-1 }, tone:{ scuro:1, chiaro:-1 } };
const L11_ATTR_EN = { year:'date', size:'size', height:'height', tone:'colours' };
const L11_ATTR_LOOK = { year:'Guardi la data!', size:'Guardi le misure!', height:"Guardi l'altezza!", tone:'Guardi bene i colori!' };
const L11_ATTR_LOOK_EN = { year:'Look at the date!', size:'Look at the size!', height:'Look at the height!', tone:'Look closely at the colours!' };
const l11Kind = id => L11_W(id).kind === 'statue' ? { g:'f', noun:'statua', this:'questa', that:'quella' } : { g:'m', noun:'quadro', this:'questo', that:'quello' };

/* ---------- the reader ---------- */
const L11_ADJ_FORMS = { vecchio:['vecchio', 'vecchia'], moderno:['moderno', 'moderna'], grande:['grande', 'grande'], piccolo:['piccolo', 'piccola'],
  alto:['alto', 'alta'], scuro:['scuro', 'scura'], chiaro:['chiaro', 'chiara'], bello:['bello', 'bella'], giovane:['giovane', 'giovane'], strano:['strano', 'strana'],
  felice:['felice', 'felice'], triste:['triste', 'triste'], arrabbiato:['arrabbiato', 'arrabbiata'], spaventato:['spaventato', 'spaventata'],
  calmo:['calmo', 'calma'], sorpreso:['sorpreso', 'sorpresa'] };
const L11_ADJ_WORD = {};
Object.entries(L11_ADJ_FORMS).forEach(([b, [m, f]]) => { L11_ADJ_WORD[m] = { base:b, g:m === f ? 'x' : 'm', word:m }; if (f !== m) L11_ADJ_WORD[f] = { base:b, g:'f', word:f }; });
/* adjective → its feminine / masculine form (the corrected word for feedback) */
const l11Form = (base, g) => L11_ADJ_FORMS[base][g === 'f' ? 1 : 0];
const L11_ADJ_EN = { vecchio:'old', moderno:'modern', grande:'big', piccolo:'small', alto:'tall', scuro:'dark', chiaro:'light', bello:'beautiful', giovane:'young',
  strano:'strange', felice:'happy', triste:'sad', arrabbiato:'angry', spaventato:'frightened', calmo:'calm', sorpreso:'surprised' };
const L11_NUMW = ['zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici',
  'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove', 'venti'];
/* nouns: [key, singular?, gender] */
const L11_NOUNS = { 'un uomo':['uomo', 1, 'm'], 'una donna':['donna', 1, 'f'], 'un bambino':['bambino', 1, 'm'], 'un cavallo':['cavallo', 1, 'm'], cavalli:['cavallo', 0, 'm'],
  'un cane':['cane', 1, 'm'], 'un angelo':['angelo', 1, 'm'], 'una persona':['persona', 1, 'f'], persone:['persona', 0, 'f'], 'il viso':['viso', 1, 'm'], 'i colori':['colore', 0, 'm'],
  'uomini':['uomo', 0, 'm'], 'donne':['donna', 0, 'f'], 'bambini':['bambino', 0, 'm'], 'cani':['cane', 0, 'm'], 'angeli':['angelo', 0, 'm'] };
/* multi-word units first (longest first), then single words */
const L11_UNITS = [
  ['sto bene grazie', 'answer_how'], ['grazie mille', 'thanks'], ['non lo so', 'dunno'], ['secondo me', 'opinion'], ['mi piacciono', 'like:pl'], ['mi piace', 'like:sg'],
  ['ci sono', 'there:pl'], ["c'è", 'there:sg'], ['il più', 'sup'], ['come sta', 'ask_how'], ['come stai', 'ask_how:tu'], ['sto bene', 'answer_how'], ['sì certo', 'yes'],
  ['ancora una volta per favore', 'repeat'], ['ancora una volta', 'repeat'], ['può ripetere', 'repeat'], ['puoi ripetere', 'repeat'], ['non ho capito', 'repeat'], ['mi chiamo', 'myname'], ['e lei', 'ask_back'], ['e tu', 'ask_back'],
  ...Object.keys(L11_NOUNS).filter(k => k.includes(' ')).map(k => [k, 'noun:' + k]),
];
function l11Read(words){
  const R = { greet:null, thanks:false, bye:false, yes:false, no:false, dunno:false, repeat:false, ask_how:false, answer_how:false, name:false, other:[], toks:[] };
  const W = words.map(w => String(w).toLowerCase());
  for (let i = 0; i < W.length;){
    const u = L11_UNITS.find(([p]) => { const ps = p.split(' '); return ps.every((x, k) => W[i + k] === x); });
    if (u){ R.toks.push({ t:u[1], w:u[0] }); i += u[0].split(' ').length; if (u[1] === 'myname' && W[i]) { R.toks.push({ t:'nameword', w:W[i] }); i++; } continue; }
    const w = W[i++];
    if (['questo', 'questa', 'quello', 'quella'].includes(w)) R.toks.push({ t:'dem', near:w.startsWith('quest'), g:w.endsWith('a') ? 'f' : 'm', w });
    else if (w === 'è') R.toks.push({ t:'is', w });
    else if (w === 'più' || w === 'meno') R.toks.push({ t:'cmp', dir:w === 'più' ? 1 : -1, w });
    else if (w === 'di') R.toks.push({ t:'di', w });
    else if (L11_ADJ_WORD[w]) R.toks.push({ t:'adj', ...L11_ADJ_WORD[w] });
    else if (w === 'sembra') R.toks.push({ t:'seem', w });
    else if (w === 'vedo') R.toks.push({ t:'see', w });
    else if (w === 'preferisco' || w === 'preferisce' || w === 'preferisci') R.toks.push({ t:'prefer', me:w === 'preferisco', w });
    else if (L11_NOUNS[w]) R.toks.push({ t:'noun:' + w, w });
    else if (L11_NUMW.includes(w) && w !== 'zero') R.toks.push({ t:'num', n:L11_NUMW.indexOf(w), w });
    else if (w === 'tanti' || w === 'tante') R.toks.push({ t:'many', w });
    else if (w === 'molto') R.toks.push({ t:'molto', w });
    else if (['e', 'poi', 'ma', 'quindi'].includes(w)) R.toks.push({ t:'and', w });     // (the little words of Lesson 2: glue)
    else if (w === 'buongiorno' || w === 'ciao' || w === 'salve') R.toks.push({ t:'greet', w });
    else if (w === 'grazie') R.toks.push({ t:'thanks', w });
    else if (w === 'arrivederci') R.toks.push({ t:'bye', w });
    else if (w === 'sì' || w === 'certo') R.toks.push({ t:'yes', w });
    else if (w === 'no') R.toks.push({ t:'no', w });
    else if (w === 'piacere') R.toks.push({ t:'nice', w });
    else if (w === 'lucia') R.toks.push({ t:'address', w });
    else if (w === 'scusi' || w === 'scusa') R.toks.push({ t:'excuse', w });
    else R.toks.push({ t:'other', w });
  }
  const T = R.toks;
  T.forEach((x, k) => {
    if (x.t === 'greet') R.greet = x.w;
    else if (x.t === 'thanks') R.thanks = true;
    else if (x.t === 'bye') R.bye = true;
    else if (x.t === 'yes') R.yes = true;
    else if (x.t === 'no') R.no = true;
    else if (x.t === 'dunno') R.dunno = true;
    else if (x.t === 'repeat') R.repeat = true;
    else if (x.t === 'ask_how' || x.t === 'ask_how:tu'){ R.ask_how = true; if (x.t === 'ask_how:tu') R.tu = true; }
    else if (x.t === 'answer_how') R.answer_how = true;
    else if (x.t === 'myname') R.name = true;
    else if (x.t === 'other') R.other.push(x.w);
  });
  /* a comparison: [dem] [è] più|meno ADJ [di dem] */
  const ci = T.findIndex(x => x.t === 'cmp');
  if (ci >= 0){
    const adj = T[ci + 1] && T[ci + 1].t === 'adj' ? T[ci + 1] : null;
    const before = T.slice(0, ci).filter(x => x.t === 'dem').pop() || null;
    const di = T.findIndex((x, k) => k > ci && x.t === 'di'), than = di >= 0 && T[di + 1] && T[di + 1].t === 'dem' ? T[di + 1] : null;
    R.cmp = { dir:T[ci].dir, adj, subj:before, than, is:T.slice(0, ci).some(x => x.t === 'is'), di:di >= 0, sup:false };
  }
  /* the most: il più ADJ */
  const si = T.findIndex(x => x.t === 'sup');
  if (si >= 0) R.sup = { adj:T[si + 1] && T[si + 1].t === 'adj' ? T[si + 1] : null };
  /* sembra ADJ, è ADJ (no più), a bare adjective */
  const se = T.findIndex(x => x.t === 'seem');
  if (se >= 0) R.seem = { adj:T.slice(se + 1).find(x => x.t === 'adj') || null };
  const adjs = T.filter((x, k) => x.t === 'adj' && !(k > 0 && (T[k - 1].t === 'cmp' || T[k - 1].t === 'sup')));
  R.adjs = adjs;
  R.opinion = T.some(x => x.t === 'opinion');
  /* liking */
  const li = T.findIndex(x => x.t === 'like:sg' || x.t === 'like:pl');
  if (li >= 0){
    const rest = T.slice(li + 1), obj = rest.find(x => x.t.startsWith('noun:') || x.t === 'dem');
    R.like = { pl:T[li].t === 'like:pl', obj:obj ? (obj.t === 'dem' ? { dem:obj, pl:false, key:obj.w } : { key:L11_NOUNS[obj.t.slice(5)][0], pl:!L11_NOUNS[obj.t.slice(5)][1], w:obj.w }) : null,
      molto:rest.some(x => x.t === 'molto') };
  }
  /* preferring */
  const pi = T.findIndex(x => x.t === 'prefer');
  if (pi >= 0) R.prefer = { me:T[pi].me, w:T[pi].w, dem:T.slice(pi + 1).find(x => x.t === 'dem') || null };
  /* counting and seeing: c'è / ci sono / vedo + numbers and nouns */
  R.there = T.find(x => x.t === 'there:sg' || x.t === 'there:pl') || null;
  R.see = T.some(x => x.t === 'see');
  R.nouns = []; let num = null, many = false;
  T.forEach(x => {
    if (x.t === 'num'){ num = x.n; return; }
    if (x.t === 'many'){ many = true; return; }
    if (x.t.startsWith('noun:')){ const N = L11_NOUNS[x.t.slice(5)]; R.nouns.push({ key:N[0], one:!!N[1], g:N[2], w:x.w, n:N[1] ? 1 : num, many }); num = null; many = false; }
  });
  R.num = num; R.many = many || T.some(x => x.t === 'many');
  R.dems = T.filter(x => x.t === 'dem');
  R.is = T.some(x => x.t === 'is');
  return R;
}
/* nothing but small talk (greetings, how are you, names, thanks) */
const l11Social = R => !R.cmp && !R.sup && !R.seem && !R.adjs.length && !R.like && !R.prefer && !R.there && !R.see && !R.nouns.length && R.num === null && !R.dems.length
  && !R.yes && !R.no && !R.dunno && !R.many;

/* ---------- checking an answer ----------
   → { ok, say:[[it, en], …] (Lucia's reaction), fb (feedback html on the player's own words, 'Consiglio'), hint (English:
   what she wants), mistake: 'agree' | 'fact' | null, note (the sentence for the sheet) } */
function l11Check(task, q, at, R){
  const say = [], res = { ok:false, say, fb:null, hint:null, mistake:null };
  const K = l11Kind(at || task.works[0]);
  if (q.k === 'cmp') return l11CheckCmp(task, q, at, R, res, K);
  if (q.k === 'prefer'){
    const P = R.prefer || (R.like && R.like.obj && R.like.obj.dem ? { me:true, dem:R.like.obj.dem, w:'mi piace' } : null);
    const dem = P ? P.dem : R.dems.length === 1 && !R.cmp ? R.dems[0] : null;
    if (P && !P.me){ say.push([`${cap(P.w)}? Io?`, `${cap(P.w)}? Me?`]); res.fb = `<i>${P.w}</i> is someone else (or <i>you</i>, politely). About yourself: <b>preferisco</b>.`; res.mistake = 'agree'; return res; }
    if (!dem){ say.push(['Quale? Questa o quella?', 'Which one? This one or that one?']); res.hint = 'Say which one you prefer: the one in front of you, or the other one. Any answer is fine.'; return res; }
    if (dem.g !== K.g){ say.push([`${cap(dem.w)}? La statua?`, `${cap(dem.w)} (masculine)? The statue?`]); res.fb = `<i>statua</i> is feminine: <b>${dem.near ? K.this : K.that}</b>.`; res.mistake = 'agree'; return res; }
    const mine = dem.near ? at : task.works.find(w => w !== at);
    res.ok = true; res.note = `${P ? (P.me ? 'Preferisco' : 'Mi piace') : 'Preferisco'} ${dem.w}. (${L11_W(mine).title_it})`;
    say.push(mine === task.works[0] ? ['Anch\'io! Apollo e Dafne… che movimento!', 'Me too! Apollo and Daphne… such movement!'] : ['Ah, Canova! È bellissima, sì. Io preferisco Bernini, ma…', 'Ah, Canova! It\'s beautiful, yes. I prefer Bernini, but…']);
    return res;
  }
  if (q.k === 'feel') return l11CheckFeel(task, q, at, R, res);
  if (q.k === 'like'){
    const L = R.like;
    if (!L){
      if (R.prefer){ say.push(['Sì, ma… cosa Le piace?', 'Yes, but… what do you like?']); res.hint = 'She wants to know what you like about it: say what you like, one thing or more than one.'; return res; }
      say.push(['Mmm? Cosa Le piace?', 'Hmm? What do you like?']); res.hint = 'She asks what you like about it. Your opinion: any answer is fine.'; return res;
    }
    if (L.obj && !L.obj.dem && L.obj.pl !== L.pl){
      const ow = L.obj.w;
      say.push([`${L.pl ? 'Mi piacciono' : 'Mi piace'} ${ow}?`, `${L.pl ? 'I like (more than one)' : 'I like (one)'} ${ow}?`]);
      res.fb = L.obj.pl ? `<i>${ow}</i> is more than one thing: <b>mi piacciono</b>.` : `<i>${ow}</i> is one thing: <b>mi piace</b>.`; res.mistake = 'agree'; return res;
    }
    res.ok = true; res.note = `${L.pl ? 'Mi piacciono' : 'Mi piace'}${L.obj ? ' ' + (L.obj.w || L.obj.key) : ''}${L.molto ? ' molto' : ''}.`;
    if (q.white && L.obj && L.obj.key === 'colore') say.push(['Ah ah! I colori? Ma è bianca! … Va bene, va bene: il marmo bianco.', 'Ha ha! The colours? But it\'s white! … All right, all right: the white marble.']);
    else if (L.obj && L.obj.key === 'viso') say.push(['Il viso, sì! Anche a me.', 'The face, yes! Me too.']);
    else if (L.obj && L.obj.key === 'colore') say.push(['I colori, sì! Bellissimi.', 'The colours, yes! Beautiful.']);
    else say.push(['Anche a me! Molto.', 'Me too! Very much.']);
    return res;
  }
  if (q.k === 'count'){
    const want = q.noun, N = R.nouns.find(x => x.key === want), other = R.nouns.find(x => x.key !== want);
    const n = N ? N.n : R.num, many = R.many;
    const pl = want === 'cavallo' ? 'cavalli' : 'persone', plEn = want === 'cavallo' ? 'horses' : 'people';
    if (other && !N){ say.push([`${cap(other.w)}? Ma… ${want === 'cavallo' ? 'quanti cavalli' : 'quante persone'}?`, `${cap(other.w)}? But… how many ${plEn}?`]); res.hint = `She asked how many ${plEn} there are. Count them, then say it.`; return res; }
    if (R.there && R.there.t === 'there:sg' && ((n !== null && n > 1) || many || (N && !N.one))){ say.push([`C'è… ${n !== null && n > 1 ? numIt(n) + ' ' : ''}${pl}?`, `There is… ${n !== null && n > 1 ? n + ' ' : ''}${plEn}?`]); res.fb = "More than one: <i>c'è</i> is for one thing. The plural: <b>ci sono</b>."; res.mistake = 'agree'; return res; }
    if (N && N.one && n !== null && n > 1){ say.push([`${cap(numIt(n))}… ${N.w}?`, `${cap(NUM_EN[n] || String(n))}… ${N.w}?`]); res.fb = `More than one: the plural, <b>${pl}</b>.`; res.mistake = 'agree'; return res; }
    if (many && n === null){ res.ok = true; res.note = `Ci sono tanti ${pl}.`; say.push(want === 'cavallo' ? ['Sì, tanti!', 'Yes, lots!'] : ['Tante, sì! Nove… o otto?', 'Lots, yes! Nine… or eight?']); return res; }
    if (n === null){ say.push([want === 'cavallo' ? 'Sì… ma quanti?' : 'Sì… ma quante?', 'Yes… but how many?']); res.hint = `She wants the number. Count the ${plEn}!`; return res; }
    const [lo, hi] = q.range;
    if (n < lo){ say.push([`Solo ${n === 1 ? (want === 'cavallo' ? 'uno' : 'una') : numIt(n)}? Guardi bene: di più!`, `Only ${NUM_EN[n] || n}? Look closely: more!`]); res.hint = `Count again: all the ${plEn}, big and small.`; res.mistake = 'fact'; return res; }
    if (n > hi){ say.push([`${cap(numIt(n))}? No, di meno!`, `${cap(NUM_EN[n] || String(n))}? No, fewer!`]); res.hint = `Count again: fewer than ${n}.`; res.mistake = 'fact'; return res; }
    res.ok = true; res.note = `Ci sono ${numIt(n)} ${pl}.`;
    say.push(want === 'cavallo' ? ['Sì, tanti!', 'Yes, lots!'] : n === 9 ? ['Nove, sì! Con il piccolo angelo in alto.', 'Nine, yes! With the little angel up above.'] : ['Otto… o nove? Il piccolo angelo in alto… Sì, va bene!', 'Eight… or nine? The little angel up above… Yes, fine!']);
    return res;
  }
  if (q.k === 'see'){
    const w = L11_W(task.works[0]), who = (w.tags && w.tags.who) || [];
    const right = R.nouns.filter(x => who.includes(x.key)), wrong = R.nouns.filter(x => !who.includes(x.key));
    if (wrong.length){ const x = wrong[0]; say.push([`${cap(x.w)}? Dove? Io non lo vedo!`, `${cap(x.w)}? Where? I can't see it!`]); res.hint = 'Look again (press E on the painting): who is in it?'; res.mistake = 'fact'; return res; }
    if (!right.length){ say.push(['Sì… cosa vede?', 'Yes… what do you see?']); res.hint = 'She asks what you see in the painting. Name the people in it.'; return res; }
    res.ok = true; res.note = `${R.see ? 'Vedo' : R.there ? cap(R.there.w) : ''} ${listJoin(right.map(x => x.w), 'e')}.`.trim();
    say.push(['Sì! Un uomo, una donna, un bambino… e un fulmine! Che strano.', 'Yes! A man, a woman, a child… and a flash of lightning! How strange.']);
    return res;
  }
  if (q.k === 'animal'){
    const A = R.nouns.find(x => ['cane', 'cavallo', 'angelo'].includes(x.key));
    if (!A){ say.push(["Mmm? Che animale c'è?", 'Hmm? Which animal is there?']); res.hint = 'Which animal is in it? Look closely at the painting (press E).'; return res; }
    if (A.key !== q.want){ say.push([`${cap(A.w)}? No, guardi bene!`, `${cap(A.w)}? No, look closely!`]); res.hint = 'Look again: which animal is it?'; res.mistake = 'fact'; return res; }
    if (R.there && R.there.t === 'there:pl' && A.one){ say.push(['Ci sono… un cane?', 'There are… a dog?']); res.fb = "One dog: <b>c'è</b> (<i>ci sono</i> is for more than one)."; res.mistake = 'agree'; return res; }
    res.ok = true; res.note = `${R.there ? cap(R.there.w) + ' ' : ''}${A.w}.`;
    say.push(['Sì, un cane! Con tante zampe… corre!', 'Yes, a dog! With lots of legs… it\'s running!']);
    return res;
  }
  if (q.k === 'biggest'){
    const sup = R.sup && R.sup.adj;
    if (R.no || (sup && sup.base === 'piccolo')){ say.push(['No? Guardi le misure: cinque metri per sette e mezzo!', 'No? Look at the size: five metres by seven and a half!']); res.hint = 'Check the size on the plaque: is any other painting bigger?'; res.mistake = 'fact'; return res; }
    if (R.yes || (sup && sup.base === 'grande') || (R.cmp && R.cmp.adj && R.cmp.adj.base === 'grande' && R.cmp.dir > 0)){
      res.ok = true; res.note = sup ? `${R.yes ? 'Sì, ' : ''}${R.is ? 'è ' : ''}il più grande!` : R.cmp ? `${R.yes ? 'Sì, ' : ''}è più grande.` : 'Sì!';
      if (!sup && R.cmp) res.fb = 'The biggest of all: <b>il più</b> … (<i>più grande</i> alone is “bigger”). Lucia understood you anyway.';
      say.push(['Sì, è il più grande! È un affresco: è sul muro.', 'Yes, it\'s the biggest! It\'s a fresco: it\'s painted on the wall.']);
      return res;
    }
    say.push(['Mmm? È il più grande o no?', 'Hmm? Is it the biggest or not?']); res.hint = 'She asks whether it is the biggest in the museum. Check the size on the plaque, then answer.'; return res;
  }
  return res;
}
function l11CheckCmp(task, q, at, R, res, K){
  const say = res.say, other = task.works.find(w => w !== at), C = R.cmp, A = L11_ATTR_ADJ[q.attr];
  if (!C){
    if (R.dems.length && !R.adjs.length){ const d = R.dems[0]; say.push([`${cap(d.w)}… cosa?`, `${cap(d.w)}… what?`]); res.hint = `Say it as a whole comparison: this one is …er than that one.`; return res; }
    if (R.adjs.length){ const a = R.adjs[0]; say.push([`${cap(a.word)}… e allora? Più ${a.word} di…?`, `${cap(a.word)}… and so? More ${L11_ADJ_EN[a.base]} than…?`]); res.hint = 'Compare them: one is <i>more …</i> than the other.'; return res; }
    say.push([q.it.replace(/^.*?(Quale|È)/, '$1'), q.en.replace(/^.*?(Which|Is)/, '$1')]); res.hint = `Lucia wants a comparison. Check the ${L11_ATTR_EN[q.attr]} on the plaques (above).`; return res;
  }
  if (!C.adj){ say.push(['Più… cosa?', 'More… what?']); res.hint = 'After <i>più</i> comes how it is: an adjective.'; return res; }
  /* agreement: the demonstratives and the adjective agree with il quadro / la statua */
  const dems = [C.subj, C.than].filter(Boolean), badDem = dems.find(d => d.g !== K.g);
  if (badDem){ say.push([`${cap(badDem.w)}? ${K.g === 'f' ? 'La statua?' : 'Il quadro?'}`, `${cap(badDem.w)}? ${K.g === 'f' ? 'The statue?' : 'The painting?'}`]);
    res.fb = `<i>${K.noun}</i> is ${K.g === 'f' ? 'feminine' : 'masculine'}: <b>${badDem.near ? K.this : K.that}</b>.`; res.mistake = 'agree'; return res; }
  if (C.adj.g !== 'x' && C.adj.g !== K.g){ const fix = l11Form(C.adj.base, K.g);
    say.push([`Più ${C.adj.word}…? ${K.g === 'f' ? 'La statua?' : 'Il quadro?'}`, `More ${L11_ADJ_EN[C.adj.base]} (${C.adj.g === 'f' ? 'feminine' : 'masculine'})…? ${K.g === 'f' ? 'The statue?' : 'The painting?'}`]);
    res.fb = `<i>${K.noun}</i> is ${K.g === 'f' ? 'feminine' : 'masculine'}: <b>${fix}</b>.`; res.mistake = 'agree'; return res; }
  if (!(C.adj.base in A)){
    say.push([`Più ${C.adj.word}? Forse! Ma… ${q.it.match(/(Quale|È)[^?]*\?/)[0]}`, `More ${L11_ADJ_EN[C.adj.base]}? Maybe! But… ${q.en.match(/(Which|Is)[^?]*\?/)[0]}`]);
    res.hint = `That's an opinion. Lucia wants to know about the ${L11_ATTR_EN[q.attr]}: check the plaques.`; return res;
  }
  /* who is compared with whom: questo = the work you are at; with no subject, "è più …" is this one */
  const subjNear = C.subj ? C.subj.near : C.than ? !C.than.near : true;
  if (C.subj && C.than && C.subj.near === C.than.near){ say.push([`${cap(C.subj.w)}… di ${C.than.w}?`, `${cap(C.subj.w)}… than ${C.than.w}?`]); res.hint = 'Compare <i>this one</i> with <i>that one</i>: two different works.'; return res; }
  const S = subjNear ? at : other, O = subjNear ? other : at;
  const vs = l11Val(S, q.attr), vo = l11Val(O, q.attr), more = A[C.adj.base] * C.dir;     // more > 0: the subject should have more of the attribute
  const truth = more > 0 ? vs > vo : vs < vo;
  if (!truth){
    say.push([`Davvero? ${L11_ATTR_LOOK[q.attr]}`, `Really? ${L11_ATTR_LOOK_EN[q.attr]}`]);
    res.hint = q.attr === 'tone' ? 'Look again at both: which one has more shadow?' : `Check the ${L11_ATTR_EN[q.attr]}s on the two plaques (above): which is ${q.attr === 'year' ? 'earlier' : 'bigger'}?`;
    res.mistake = 'fact'; return res;
  }
  res.ok = true;
  const sw = C.subj ? cap(C.subj.w) + ' è' : 'È';
  res.note = `${sw} ${C.dir > 0 ? 'più' : 'meno'} ${C.adj.word}${C.than ? ' di ' + C.than.w : ''}.`;
  const winner = (A[q.adj] > 0 ? vs > vo : vs < vo) ? S : O, ww = L11_W(winner);
  const reacts = { year:[`Sì! ${q.adj === 'moderno' ? 'Più moderno' : K.g === 'f' ? 'Più vecchia' : 'Più vecchio'}: ${String(ww.date).replace('c. ', '')}.`, `Yes! ${q.adj === 'moderno' ? 'More modern' : 'Older'}: ${ww.date}.`],
    size:[q.adj === 'piccolo' ? 'Sì! Leonardo è piccolo piccolo: cinquantaquattro centimetri!' : 'Sì! San Michele è grande, San Giorgio è piccolissimo!', q.adj === 'piccolo' ? 'Yes! The Leonardo is tiny: fifty-four centimetres!' : 'Yes! St Michael is big, St George is tiny!'],
    height:['Sì! Perseo è alto più di tre metri!', 'Yes! Perseus is more than three metres tall!'],
    tone:['Sì! Caravaggio: la luce e il buio.', 'Yes! Caravaggio: light and darkness.'] };
  say.push(reacts[q.attr]);
  return res;
}
function l11CheckFeel(task, q, at, R, res){
  const say = res.say, adj = (R.seem && R.seem.adj) || R.adjs[0] || null, who = q.who || 'lui';
  if (!adj){
    if (q.yesno && (R.yes || R.no)){ res.ok = true; res.note = R.yes ? 'Sì.' : 'No.'; say.push([`${R.yes ? 'Sì? ' : 'No? '}Secondo me sembra ${q.lucia}!`, `${R.yes ? 'Yes? ' : 'No? '}I think he seems ${L11_ADJ_EN[q.lucia]}!`]); return res; }
    if (R.cmp){ say.push(['Più…? No, no: come sembra?', 'More…? No, no: how does he seem?']); res.hint = 'No comparison here: how does the person seem to you? Look at the face.'; return res; }
    say.push([q.yesno ? 'Mmm? Felice o no?' : 'Mmm? Come sembra?', q.yesno ? 'Hmm? Happy or not?' : 'Hmm? How does he seem?']);
    res.hint = `She wants to know how ${q.who || 'he'} seems to you. Look at the face.`; return res;
  }
  if (adj.g !== 'x' && adj.g !== q.g){
    const fix = l11Form(adj.base, q.g);
    say.push([`${cap(adj.word)}? ${q.who ? q.who.replace(/^l'/, "L'") : 'Lui'}?`, `${cap(adj.word)} (${adj.g === 'f' ? 'feminine' : 'masculine'})? ${q.who || 'Him'}?`]);
    res.fb = `${q.who ? `<i>${q.who}</i>` : 'He'} is ${q.g === 'f' ? 'a woman' : 'a man'}: <b>${fix}</b>.`; res.mistake = 'agree'; return res;
  }
  const base = adj.base, word = l11Form(base, q.g);
  res.note = `${R.opinion ? 'Secondo me, ' : ''}${R.seem ? 'sembra ' : ''}${adj.word}.`.replace(/^s/, 'S').replace(/^([a-z])/, m => m.toUpperCase());
  if (q.opinion){
    res.ok = true;
    if (q.lucia && base !== q.lucia) say.push([`${cap(word)}? Mmm… secondo me sembra ${q.lucia}!`, `${cap(L11_ADJ_EN[base])}? Hmm… I think he seems ${L11_ADJ_EN[q.lucia]}!`]);
    else if (q.lucia) say.push([`Sì, ${word}! Con la bocca aperta!`, `Yes, ${L11_ADJ_EN[base]}! With his mouth open!`]);
    else say.push([`${cap(word)}… sì, forse. Ha gli occhi un po' strani.`, `${cap(L11_ADJ_EN[base])}… yes, maybe. His eyes are a bit strange.`]);
    return res;
  }
  if ((q.ok || []).includes(base)){
    res.ok = true;
    const r = { 'Maria:triste':['Sì, triste. Ma anche calma, vero?', 'Yes, sad. But calm too, isn\'t she?'], 'Giuditta:arrabbiato':['Sì, arrabbiata! E anche un po\' strana…', 'Yes, angry! And a bit strange too…'],
      'Oloferne:spaventato':['Sì, spaventato! Povero Oloferne.', 'Yes, frightened! Poor Holofernes.'], 'Gesù:triste':['Sì, triste. E solo: gli altri dormono.', 'Yes, sad. And alone: the others are asleep.'],
      'Gesù:spaventato':['Sì, spaventato… e solo: gli altri dormono.', 'Yes, frightened… and alone: the others are asleep.'] }[`${q.who}:${base}`];
    say.push(r || [`Sì, ${word}!`, `Yes, ${L11_ADJ_EN[base]}!`]);
    if (q.who === null && base === 'giovane') say[0] = ['Sì, giovane! Ha ventitré anni.', 'Yes, young! He is twenty-three.'];
    return res;
  }
  if ((q.maybe || []).includes(base)){
    res.ok = true;
    say.push(q.who === 'Giuditta' ? ['Calma? Sì! È strano, vero?', 'Calm? Yes! It\'s strange, isn\'t it?'] : [`${cap(word)}? Sì, forse… anch'io lo vedo.`, `${cap(L11_ADJ_EN[base])}? Yes, maybe… I can see it too.`]);
    return res;
  }
  say.push([`${cap(word)}? Davvero? Guardi bene il viso!`, `${cap(L11_ADJ_EN[base])}? Really? Look closely at the face!`]);
  res.hint = `Look at ${q.who ? q.who.replace(/^l'uomo$/, 'the man') : 'him'} again: the face, the eyes. ${q.who === null && q.ok && q.ok.includes('giovane') ? 'Young or old?' : 'How does the person seem?'}`;
  res.mistake = 'fact';
  return res;
}

/* tests: what Lucia makes of a sentence, at a work: __l11Check('questa è più vecchia di quella', 's-apollo', 0, 'bernini-apollo') */
window.__l11Read = s => l11Read(String(s).toLowerCase().replace(/[.,!?]/g, ' ').split(/\s+/).filter(Boolean));
window.__l11Check = (s, taskId, qi = 0, at) => { const T = L11_TASK[taskId], r = l11Check(T, T.q[qi], at || T.works[0], window.__l11Read(s)); return { ok:r.ok, mistake:r.mistake, fb:r.fb, say:r.say.map(x => x[0]), note:r.note }; };
