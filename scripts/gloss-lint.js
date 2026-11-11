#!/usr/bin/env node
/*
 * The gloss lint: a word card's English prompt never contains its Italian (engine/ui/vocab.js glossLint; CLAUDE.md, "Teaching and
 * writing conventions"). Run by every build (scripts/build.js: a hit fails it), by the vocab tests in the browser
 * (tests/<unit>/vocab-gloss.js), or on its own: `node scripts/gloss-lint.js [unit …]` (default: every unit).
 *
 * How: as scripts/unit1-words.js does for Padova, the unit's bundle (exactly what `build <unit>` concatenates) is evaluated in a Node
 * `vm` context with inert stand-ins for the browser (only the scripts' top level runs: the lessons, quests and the tree register their
 * words), then window.__glossLint() lists every card whose English has the Italian in it (GLOSS_OK, the reviewed exceptions, aside).
 */
const vm = require('vm');
const { sandbox } = require('./unit1-words.js');

/* the hits of a unit's bundle (js: the bundle's JS, as scripts/build.js makes it; default: bundled now) */
function lint(unit, js){
  if (js === undefined) js = require('./build.js').bundle(unit).js;
  const win = sandbox();
  vm.runInContext(`(() => {\n'use strict';\n${js}\n})();`, vm.createContext(win), { filename:unit + '-bundle.js' });
  if (typeof win.__glossLint !== 'function') throw new Error(`${unit}'s bundle has no window.__glossLint (engine/ui/vocab.js)`);
  return win.__glossLint();
}
const report = (unit, hits) => hits.map(h => `${unit} · ${h.where}: ${h.it} = "${h.en}" (${h.hits.join(', ')})`);

module.exports = { lint, report };
if (require.main === module){
  const { UNITS } = require('./build.js');
  const units = process.argv.slice(2).length ? process.argv.slice(2) : UNITS;
  let n = 0;
  for (const u of units){ const h = lint(u); n += h.length; report(u, h).forEach(l => console.log(l)); console.log(`${u}: ${h.length ? h.length + ' prompt(s) give the Italian away' : 'no English prompt contains its Italian'}`); }
  process.exit(n ? 1 : 0);
}
