#!/usr/bin/env node
/* The top-level names (function, const, let, class) of a built game, to check that a refactor kept them all:
     node scripts/bundle-names.js old.html new.html     → the names the old bundle has and the new one lacks (exit 1 if any)
     node scripts/bundle-names.js game.html             → every name
   A name counts as top level when its declaration starts a line (the bundle's files are concatenated unindented). */
const fs = require('fs');
function names(file){
  const html = fs.readFileSync(file, 'utf8');
  const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
  const out = new Set();
  for (const line of js.split('\n')){
    let m = /^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/.exec(line); if (m){ out.add(m[1]); continue; }
    m = /^class\s+([A-Za-z_$][\w$]*)/.exec(line); if (m){ out.add(m[1]); continue; }
    m = /^(?:const|let|var)\s+(.*)$/.exec(line); if (!m) continue;
    // the names declared on this line: the first, and every ", name =" at bracket depth 0
    let s = m[1], depth = 0, cur = '', parts = [];
    for (const ch of s){ if ('([{'.includes(ch)) depth++; else if (')]}'.includes(ch)) depth--; if (ch === ',' && depth === 0){ parts.push(cur); cur = ''; } else cur += ch; }
    parts.push(cur);
    for (const p of parts){ const k = /^\s*([A-Za-z_$][\w$]*)\s*(=|;|$)/.exec(p); if (k) out.add(k[1]); }
  }
  return out;
}
const [a, b] = process.argv.slice(2);
if (!b){ console.log([...names(a)].sort().join('\n')); process.exit(0); }
const A = names(a), B = names(b), missing = [...A].filter(n => !B.has(n)).sort(), added = [...B].filter(n => !A.has(n)).sort();
console.log(`${A.size} names in ${a}, ${B.size} in ${b}`);
console.log(`missing in the new bundle (${missing.length}): ${missing.join(' ') || '-'}`);
console.log(`new (${added.length}): ${added.join(' ') || '-'}`);
process.exit(missing.length ? 1 : 0);
