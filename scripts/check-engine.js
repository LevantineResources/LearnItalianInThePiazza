#!/usr/bin/env node
/* The engine has no unit content: engine/ must not name Padova's people, scenes, lessons or art (they belong in
   units/padova, which registers them: CLAUDE.md, "Units"). Run by scripts/build.js before every build, so a build fails
   on a slip; also `node scripts/check-engine.js` (prints every hit).
   What counts (comments are left out: a comment may say where an idea came from):
   - Padova's NPC ids (read from units/padova/content/npcs.js) as a string ('enzo') or a property of NPC (NPC.enzo);
   - Padova's scene keys (SCENE_IDS below) as a string, or the distinctive ones as a word anywhere;
   - Padova's own fields of the save (UNIT.fresh() in units/padova/unit.js: S.vocab2, S.handbookLost…);
   - Lesson and lesson-state names: tutorial states 'l12-…', S.l7 / S.l5follow, L4_MENU-style tables, VOCAB1, DIR_TILES,
     skipL3(), startLesson2(), openComplete5(), and the other words in WORDS.
   - any top-level name (function, const, let) that only a Padova file declares (galleriaUpdate, NIGHT_LIGHTS' scenes…):
     the engine would call into Unit 1's code, and Venezia's build would fail when it runs.
   A unit may name engine things, never the other way round. */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ENGINE = path.join(ROOT, 'engine');

/* Padova's scenes (world/scenes.js and the files that register their own) */
const SCENE_IDS = ['piazza', 'sanlorenzo', 'aurora', 'santo', 'mercato', 'museo', 'galleria', 'stazione', 'ponte', 'parco', 'salone', 'basilica',
  'treno', 'santalucia', 'ferrovia', 'vaporetto', 'farmacia', 'gelateria', 'cabina11', 'cabina12', 'cabina13', 'cabina14', 'cabina15', 'cabina16', 'cabina17', 'cabina18'];
/* words that only Padova's content uses, matched as whole words in code (case-sensitive) */
const WORDS = ['galleria', 'Galleria', 'treno', 'Treno', 'TRENO', 'stazione', 'Stazione', 'gattamelata', 'Gattamelata', 'GATTA', 'MUSEO', 'PONTE', 'PARCO',
  'SALONE', 'BASILICA', 'GAL', 'VEN', 'STALLS', 'FARMACIA', 'GELATERIA', 'sanlorenzo', 'santalucia', 'mercato', 'Mercato', 'museo', 'Museo',
  'enzo', 'Enzo', 'margaret', 'Margaret', 'biscuit', 'Biscuit', 'bepi', 'Bepi', 'mark', 'Mark', 'emma', 'Emma', 'bruno', 'Bruno', 'lucia', 'Lucia',
  'Paolo', 'paolo', 'giulia', 'Giulia', 'chiara', 'Chiara', 'davide', 'Davide', 'rosa', 'Rosa', 'VOCAB1', 'VOCAB2', 'DIR_TILES', 'DIR_TABLE', 'DIR_WORDS',
  'STATUE_TILE', 'ROUTE', 'ROUTE5', 'PAOLO_ROUTE', 'L1_PEOPLE', 'ISPY_VOCAB', 'MISPY_VOCAB', 'Padova', 'padova'];
const PATTERNS = [
  [/['"`]l\d+-[\w-]*['"`]/g, "a lesson's tutorial state"],
  [/\bS\.l\d+\w*/g, "a lesson's saved state"],
  [/\bS\.(vocab|practiceDone|vocabCheck)\d+\b/g, "a lesson's flags"],
  [/\bL\d+_[A-Z]\w*/g, "a lesson's table"],
  [/\b(skipL|startLesson|openComplete|freshL)\d+\b/g, "a lesson's function"],
  [/\b(l|L)\d+(Dbg|Data|At|Free|ToFreeState|Need|Notebook|Audit)\b/g, "a lesson's function"],
];

function stripComments(src){
  // drop /* */ and // comments; keep strings and template literals (with their \${…} parts, nested); skip regex literals
  // (a / where an expression starts). A small lexer with a stack: 'T' = in a template literal's text, a number = in the code
  // of a template's \${ … } (its open braces).
  let out = '', i = 0;
  const st = [];
  const top = () => st[st.length - 1];
  const prevSig = () => { const m = /(\S)\s*$/.exec(out); return m ? m[1] : ''; };
  const prevWord = () => { const m = /([A-Za-z_$][\w$]*)\s*$/.exec(out); return m ? m[1] : ''; };
  while (i < src.length){
    const c = src[i], n = src[i + 1];
    if (top() === 'T'){
      if (c === '\\'){ out += c + (n || ''); i += 2; continue; }
      if (c === '`'){ st.pop(); out += c; i++; continue; }
      if (c === '$' && n === '{'){ st.push(0); out += '${'; i += 2; continue; }
      out += c; i++; continue;
    }
    if (c === "'" || c === '"'){ let j = i + 1; while (j < src.length && src[j] !== c && src[j] !== '\n'){ if (src[j] === '\\') j++; j++; } out += src.slice(i, j + 1); i = j + 1; continue; }
    if (c === '`'){ st.push('T'); out += c; i++; continue; }
    if (typeof top() === 'number' && c === '{'){ st[st.length - 1]++; out += c; i++; continue; }
    if (typeof top() === 'number' && c === '}'){ if (top() === 0) st.pop(); else st[st.length - 1]--; out += c; i++; continue; }
    if (c === '/' && n === '*'){ const e = src.indexOf('*/', i + 2), end = e < 0 ? src.length : e + 2; out += src.slice(i, end).replace(/[^\n]/g, ' '); i = end; continue; }
    if (c === '/' && n === '/'){ const e = src.indexOf('\n', i), end = e < 0 ? src.length : e; out += ' '.repeat(end - i); i = end; continue; }
    if (c === '/' && ('(,=:[!&|?{};+-*%<>~^'.includes(prevSig()) || prevSig() === '' || ['return', 'typeof', 'case', 'in', 'of'].includes(prevWord()))){
      let j = i + 1, cls = false;
      while (j < src.length && src[j] !== '\n'){ const d = src[j]; if (d === '\\'){ j += 2; continue; } if (cls){ if (d === ']') cls = false; } else if (d === '[') cls = true; else if (d === '/') break; j++; }
      out += src.slice(i, j + 1).replace(/['"`]/g, ' '); i = j + 1; continue;
    }
    out += c; i++;
  }
  return out;
}
function stripHtmlComments(src){ return src.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ' ')); }

/* top-level declarations of the .js files under a folder (a declaration starts a line: the code base is unindented at the top) */
function declared(dir){
  const out = new Set();
  const walk = d => { for (const f of fs.readdirSync(d)){ const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.js')) for (const line of fs.readFileSync(p, 'utf8').split('\n')){
    let m = /^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/.exec(line) || /^class\s+([A-Za-z_$][\w$]*)/.exec(line); if (m){ out.add(m[1]); continue; }
    m = /^(?:const|let|var)\s+(.*)$/.exec(line); if (!m) continue;
    let depth = 0, cur = '', parts = [];
    for (const ch of m[1]){ if ('([{'.includes(ch)) depth++; else if (')]}'.includes(ch)) depth--; if (ch === ',' && depth === 0){ parts.push(cur); cur = ''; } else cur += ch; }
    parts.push(cur);
    for (const q of parts){ const k = /^\s*([A-Za-z_$][\w$]*)\s*(=|;|$)/.exec(q); if (k) out.add(k[1]); }
  } } };
  if (fs.existsSync(dir)) walk(dir);
  return out;
}
const stripStrings = code => code.replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g, "''").replace(/`(?:[^`\\]|\\.)*`/g, m => m.replace(/[^\n$]|\$(?!\{)/g, ' '));

/* NPC ids that are also ordinary words (the engine may say "signora"): not counted as names */
const ORDINARY = new Set(['signore', 'signora', 'turista', 'guida', 'ragazzo', 'ragazza', 'mamma', 'nonno', 'studente', 'maestra', 'maestro', 'passante',
  'bambina', 'bimbo', 'bimba', 'viaggiatore', 'viaggiatrice', 'visitatore', 'visitatrice', 'pittrice', 'pellegrina', 'nottambulo', 'fornaio', 'gelataio',
  'farmacista', 'marinaio', 'volontaria', 'sacrestano', 'giardiniere', 'formaggiaio', 'pastaia', 'cantante', 'chitarrista', 'anziano', 'audioguida']);

function check(){
  const mine = declared(ENGINE), unitOnly = [...declared(path.join(ROOT, 'units', 'padova'))].filter(n => !mine.has(n));
  const unitNames = unitOnly.length ? new RegExp(`(?<![\\w$.])(${unitOnly.map(n => n.replace(/\$/g, '\\$')).join('|')})(?![\\w$])`, 'g') : null;
  const npcFile = path.join(ROOT, 'units', 'padova', 'content', 'npcs.js');
  const ids = fs.existsSync(npcFile) ? [...new Set([...fs.readFileSync(npcFile, 'utf8').matchAll(/\bid:'(\w+)'/g)].map(m => m[1]))].filter(id => !ORDINARY.has(id)) : [];
  const quoted = new RegExp(`['"\`](${[...ids, ...SCENE_IDS].join('|')})['"\`]`, 'g');
  const npcProp = new RegExp(`\\bNPC\\.(${ids.join('|')})\\b`, 'g');
  /* Padova's own fields of the save (its UNIT.fresh() in units/padova/unit.js), as S.<field> (a few are the engine's too) */
  const unitJs = path.join(ROOT, 'units', 'padova', 'unit.js');
  const fresh = fs.existsSync(unitJs) ? (/fresh:\(\) => \(\{([\s\S]*?)\}\)/.exec(fs.readFileSync(unitJs, 'utf8')) || [, ''])[1] : '';
  const fields = [...new Set([...fresh.matchAll(/(?:^|[\s,{])([A-Za-z]\w*):/g)].map(m => m[1]))].filter(k => !['handbookOpened', 'phoneUnread', 'steps', 'lines', 'clean', 'models', 'order', 'orderDone'].includes(k));
  const saveFields = fields.length ? new RegExp(`\\bS\\.(${fields.join('|')})\\b`, 'g') : null;
  const words = new RegExp(`(?<![\\w-])(${WORDS.join('|')})(?![\\w-])`, 'g');   // (not inside a CSS class like qs-mark)
  const hits = [];
  const walk = d => { for (const f of fs.readdirSync(d)){ const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(js|html)$/.test(f)) scan(p); } };
  const scan = p => {
    const raw = fs.readFileSync(p, 'utf8'), code = p.endsWith('.html') ? stripHtmlComments(raw) : stripComments(raw);
    code.split('\n').forEach((line, i) => {
      const found = [];
      for (const m of line.matchAll(quoted)) found.push(m[0]);
      for (const m of line.matchAll(npcProp)) found.push(m[0]);
      for (const m of line.matchAll(words)) found.push(m[0]);
      for (const [re, what] of PATTERNS) for (const m of line.matchAll(re)) found.push(m[0]);
      if (saveFields) for (const m of line.matchAll(saveFields)) found.push(m[0]);
      if (unitNames && !p.endsWith('.html')) for (const m of stripStrings(line).matchAll(unitNames)) found.push(m[0] + '()');
      if (found.length) hits.push({ file:path.relative(ROOT, p), line:i + 1, found:[...new Set(found)] });
    });
  };
  walk(ENGINE);
  return hits;
}
module.exports = { check };
if (require.main === module){
  const hits = check();
  for (const h of hits) console.log(`${h.file}:${h.line}  ${h.found.join(' ')}`);
  console.log(hits.length ? `\n${hits.length} lines in engine/ name Padova's content` : 'engine/ names no unit content');
  process.exit(hits.length ? 1 : 0);
}
