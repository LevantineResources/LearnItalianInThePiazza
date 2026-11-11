#!/usr/bin/env node
/*
 * Builds one game per unit: dist/<unit>/index.html, one self-contained file (HTML + CSS + JS) that runs offline and is
 * what gets published. A unit is a folder in units/ (units/padova: Unit 1, units/venezia: Unit 2) built on the shared
 * engine in engine/.
 *
 * The JS files are concatenated inside a single (() => { 'use strict'; ... })() wrapper. They are plain scripts, not
 * modules: everything shares one scope, so a function in one file can call a function in another. Order matters only
 * for top-level const/let that are *used at load time* (e.g. NPCS must exist before a unit's npcs.js pushes into it).
 *
 * The order is a fixed list of PHASES. In each phase the engine's files (ENGINE below) come first, then the unit's
 * (units/<id>/unit.json lists its files per phase, paths relative to the unit's folder). Special entries in a unit's
 * lists:
 *   "@lessons-content"  every lessons/NN-name/content.js, by folder name
 *   "@lessons-logic"    every other .js file in the lesson folders (by folder, then file name)
 *   "@quests"           every .js file in quests/NN-name/ (by folder, then file name)
 *   "@art"              `const ART = {…}`, generated from the unit's art manifest (unit.json "art")
 *   "@shared/<file>"    a file of units/shared/ (content more than one unit uses: shared/cast.js, the recurring people's looks)
 * Lesson and quest folders are picked up automatically. Any other new file must be listed (engine files here, unit files
 * in unit.json): the build fails if a .js file in engine/ or in the unit's folder is not in the bundle.
 *
 * unit.json: { id, title, logo, world, phases:{ content, engine, logic, world, render }, intro, styles?, art?, generate? }
 *   title, logo, world  the page's <title>, the header's logo, the canvas's label ("The piazza"): engine/index.html's
 *            <!-- @title -->, <!-- @logo -->, <!-- @world -->
 *   intro    the unit's intro poster (HTML: the title, the name form #nameForm / #nameInput, #continueRow / #btnContinue, its
 *            skip links in #jumpRow), put in engine/index.html's <!-- @intro -->
 *   styles   the unit's own CSS, appended to engine/styles.css
 *   art      a folder with manifest.json (made by scripts/prepare-art.py): its data is embedded as ART (no fetch():
 *            file:// pages can't fetch) and the files the game uses are copied to dist/<unit>/art/ (only changed
 *            files); the game loads them by relative URL ('art/…'). Images are never inlined.
 *   generate generators run before the bundle is made (scripts/unit1-words.js: Venezia's Unit 1 words, from Padova)
 *
 * Usage: node scripts/build.js [padova|venezia|all] [--watch]      (no unit: padova)
 * dist/index.html (+ dist/art/) is also written, a copy of the Padova build: the published artifact and the docs use it.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENGINE_DIR = path.join(ROOT, 'engine');
const UNITS_DIR = path.join(ROOT, 'units');
const UNITS = fs.readdirSync(UNITS_DIR).filter(d => fs.existsSync(path.join(UNITS_DIR, d, 'unit.json'))).sort((a, b) => a === 'padova' ? -1 : b === 'padova' ? 1 : a.localeCompare(b));
const PRIMARY = 'padova';          // dist/index.html is a copy of this unit's build

const PHASES = ['registry', 'content', 'engine', 'logic', 'world', 'render', 'boot'];
/* the engine's files, by phase (paths in engine/) */
const ENGINE = {
  // the registries every unit fills: LESSONS, LESSON_HOOKS, QUESTS, UNIT …
  registry: ['core/registry.js'],
  // (the unit's data: its content, lessons' chapters, cast)
  content: [],
  engine: [
    'core/state.js', 'core/quests.js', 'core/text.js', 'core/parser.js', 'core/speech.js',
    'ui/hud.js',
    'conversation/dialog.js', 'conversation/brain.js', 'conversation/turns.js', 'conversation/transcript.js', 'conversation/bank.js', 'conversation/typing.js',
    'world/doors.js',
    'ui/handbook.js', 'ui/phone.js', 'ui/numbers.js', 'ui/notepad.js', 'ui/notebook.js', 'ui/vocab.js', 'ui/study.js', 'ui/grammar.js', 'ui/quests.js',
    'world/travel.js', 'world/fasttravel.js', 'world/dictmap.js', 'ui/tracemap.js', 'ui/compass.js', 'ui/cards.js',
    'core/tree.js', 'ui/tree.js',      // the skill tree (Unit 2 on): data and states, the handbook's Albero
  ],
  // (the unit's lessons: flow, engines; then its quests)
  logic: [],
  world: ['ui/menu.js', 'ui/intro.js', 'ui/keyboard.js', 'world/scenes.js', 'world/tilemap.js', 'world/update.js', 'world/cutscene.js', 'world/routeguard.js', 'world/crowd.js', 'world/lanecrowd.js', 'world/walkers.js', 'world/daytime.js', 'world/shops.js'],
  render: ['render/helpers.js', 'render/tilecache.js', 'render/atlas.js', 'render/shops.js', 'render/night.js', 'render/sprites.js', 'render/loop.js'],
  boot: ['boot.js'],
};

const unitDir = id => path.join(UNITS_DIR, id);
function unitConfig(id){
  const f = path.join(unitDir(id), 'unit.json');
  if (!fs.existsSync(f)) throw new Error(`No such unit: ${id} (units/${id}/unit.json)`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

/* the art manifest, as a generated source file (const ART = { rooms, note, works }) */
function artManifest(dir){
  const rel = path.relative(ROOT, dir).split(path.sep).join('/');
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  return { rel:`(generated from ${rel}/manifest.json)`, code:`/* generated by scripts/build.js from ${rel}/manifest.json: the museum's works */\nconst ART = ${JSON.stringify(m)};` };
}
/* copy the art the game uses to <outDir>/art/ (only files that changed) */
function copyArt(outDir, artDir){
  const m = JSON.parse(fs.readFileSync(path.join(artDir, 'manifest.json'), 'utf8'));
  const dest = path.join(outDir, 'art'); fs.mkdirSync(dest, { recursive: true });
  const files = ['manifest.json', ...m.works.flatMap(w => [w.file, w.thumb])];
  let copied = 0;
  for (const f of files){
    const a = path.join(artDir, f), b = path.join(dest, f), sa = fs.statSync(a);
    if (fs.existsSync(b)){ const sb = fs.statSync(b); if (sb.size === sa.size && sb.mtimeMs >= sa.mtimeMs) continue; }
    fs.copyFileSync(a, b); copied++;
  }
  return { files: files.length, copied };
}

/* NN-name folders of a unit (lessons/ or quests/), plus extra folders passed to build() (used by tests) */
function numbered(id, kind, extra = []){
  const dir = path.join(unitDir(id), kind);
  const own = fs.existsSync(dir) ? fs.readdirSync(dir).filter(d => /^\d\d-/.test(d) && fs.statSync(path.join(dir, d)).isDirectory())
    .map(d => ({ name: d, abs: path.join(dir, d), rel: `units/${id}/${kind}/${d}` })) : [];
  return [...own, ...extra.map(e => ({ name: e.name, abs: path.resolve(e.dir), rel: `units/${id}/${kind}/${e.name}` }))]
    .sort((a, b) => a.name.localeCompare(b.name));
}
const jsIn = f => fs.readdirSync(f.abs).filter(x => x.endsWith('.js')).sort();

/* the bundle's files in order: [{ rel, abs } | { rel, code }]. opts.extraLessons / opts.extraQuests: [{ name:'99-x', dir }] */
function order(id = PRIMARY, opts = {}){
  const cfg = unitConfig(id), phases = cfg.phases || {};
  for (const p of Object.keys(phases)) if (!PHASES.includes(p) || p === 'registry' || p === 'boot') throw new Error(`units/${id}/unit.json: no phase "${p}" for a unit (${PHASES.slice(1, -1).join(', ')})`);
  const eng = rel => ({ rel: `engine/${rel}`, abs: path.join(ENGINE_DIR, rel) });
  const own = rel => {
    if (rel === '@lessons-content') return numbered(id, 'lessons', opts.extraLessons).filter(f => fs.existsSync(path.join(f.abs, 'content.js')))
      .map(f => ({ rel: `${f.rel}/content.js`, abs: path.join(f.abs, 'content.js') }));
    if (rel === '@lessons-logic') return numbered(id, 'lessons', opts.extraLessons).flatMap(f => jsIn(f).filter(x => x !== 'content.js').map(x => ({ rel: `${f.rel}/${x}`, abs: path.join(f.abs, x) })));
    if (rel === '@quests') return numbered(id, 'quests', opts.extraQuests).flatMap(f => jsIn(f).map(x => ({ rel: `${f.rel}/${x}`, abs: path.join(f.abs, x) })));
    if (rel === '@art') return [artManifest(path.join(ROOT, cfg.art))];
    if (rel.startsWith('@shared/')) return [{ rel: `units/shared/${rel.slice(8)}`, abs: path.join(UNITS_DIR, 'shared', rel.slice(8)) }];
    if (rel.startsWith('@')) throw new Error(`units/${id}/unit.json: unknown entry ${rel}`);
    return [{ rel: `units/${id}/${rel}`, abs: path.join(unitDir(id), rel) }];
  };
  return PHASES.flatMap(p => [...ENGINE[p].map(eng), ...(phases[p] || []).flatMap(own)]);
}

/* the bundle's JS (without the wrapper) and its file list; checks that nothing is left out */
function bundle(id = PRIMARY, opts = {}){
  const files = order(id, opts);
  const seen = new Set(files.map(f => f.rel));
  // every .js in engine/ and in the unit's folder must be in the bundle, so nothing is silently left out
  const all = [];
  const walk = d => { for (const f of fs.readdirSync(d)){ const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.js')) all.push(path.relative(ROOT, p).split(path.sep).join('/')); } };
  walk(ENGINE_DIR); walk(unitDir(id));
  const stray = all.filter(f => !seen.has(f));
  if (stray.length) throw new Error(`Not in the build (add engine files to scripts/build.js, unit files to units/${id}/unit.json): ` + stray.join(', '));
  const js = files.map(f => {
    if (f.code) return `/* ===== ${f.rel} ===== */\n${f.code}\n`;
    if (!fs.existsSync(f.abs)) throw new Error('Missing source file: ' + f.rel);
    return `/* ===== ${f.rel} ===== */\n` + fs.readFileSync(f.abs, 'utf8').replace(/\s+$/, '') + '\n';
  }).join('\n');
  return { js, files };
}

/* opts.unit (default padova); opts.out: output path (default dist/<unit>/index.html); opts.extraLessons / extraQuests:
   [{ name:'99-x', dir }] (tests build docs/example-lesson in) */
function build(opts = {}){
  const id = opts.unit || PRIMARY, cfg = unitConfig(id);
  /* the engine names no unit's content (scripts/check-engine.js): a slip fails the build */
  const hits = require('./check-engine.js').check();
  if (hits.length) throw new Error(`engine/ names a unit's content (move it to the unit, behind a registry or a unit hook; node scripts/check-engine.js lists them):\n  ` + hits.slice(0, 8).map(h => `${h.file}:${h.line}  ${h.found.join(' ')}`).join('\n  ') + (hits.length > 8 ? `\n  … ${hits.length - 8} more` : ''));
  for (const g of cfg.generate || []) require(path.join(__dirname, g + '.js')).generate({ quiet:opts.quiet });
  const { js, files } = bundle(id, opts);
  const read = rel => fs.readFileSync(path.join(unitDir(id), rel), 'utf8').replace(/\s+$/, '');
  const css = fs.readFileSync(path.join(ENGINE_DIR, 'styles.css'), 'utf8').replace(/\s+$/, '') + (cfg.styles ? '\n\n' + read(cfg.styles) : '');
  const tpl = fs.readFileSync(path.join(ENGINE_DIR, 'index.html'), 'utf8');
  if (!tpl.includes('<!-- @styles -->') || !tpl.includes('<!-- @script -->')) throw new Error('engine/index.html needs <!-- @styles --> and <!-- @script --> placeholders');
  let html = tpl;
  for (const [k, v] of [['title', cfg.title], ['logo', cfg.logo || cfg.title], ['world', cfg.world || 'The town'], ['intro', cfg.intro ? read(cfg.intro) : '']])
    if (html.includes(`<!-- @${k} -->`)) html = html.replace(`<!-- @${k} -->`, () => v);
  html = html
    .replace('<!-- @styles -->', () => css)
    .replace('<!-- @script -->', () => `(() => {\n'use strict';\n\n${js}\n})();`);

  // catch syntax errors at build time rather than in the browser
  try { new Function(`(() => {\n'use strict';\n\n${js}\n})`); }
  catch (e) { throw new Error(`JavaScript syntax error in the ${id} bundle: ` + e.message); }
  /* no word card's English prompt contains its Italian (scripts/gloss-lint.js, engine ui/vocab.js glossLint): a hit fails the build */
  { const G = require('./gloss-lint.js'), gh = G.lint(id, js);
    if (gh.length) throw new Error(`a word card's English gives its Italian away (rewrite the gloss, move the example to the word's note, or quiz:false; node scripts/gloss-lint.js lists them):\n  ` + G.report(id, gh).slice(0, 12).join('\n  ') + (gh.length > 12 ? `\n  … ${gh.length - 12} more` : '')); }

  const out = opts.out || path.join(ROOT, 'dist', id, 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  const art = cfg.art ? copyArt(path.dirname(out), path.join(ROOT, cfg.art)) : null;
  if (!opts.out && id === PRIMARY){ fs.writeFileSync(path.join(ROOT, 'dist', 'index.html'), html); if (cfg.art) copyArt(path.join(ROOT, 'dist'), path.join(ROOT, cfg.art)); }
  return { unit: id, files: files.length, bytes: html.length, art, out };
}

module.exports = { build, bundle, order, copyArt, UNITS, PRIMARY, ROOT };   // (before the CLI below: scripts/unit1-words.js requires this file back)

if (require.main === module){
  const args = process.argv.slice(2), watch = args.includes('--watch');
  const named = args.filter(a => !a.startsWith('--'));
  const units = !named.length ? [PRIMARY] : named.includes('all') ? UNITS : named;
  for (const u of units) if (!UNITS.includes(u)){ console.error(`BUILD FAILED: no unit "${u}" (units: ${UNITS.join(', ')}, or all)`); process.exit(1); }
  const run = () => {
    let ok = true;
    for (const u of units){
      try {
        const r = build({ unit:u });
        console.log(`built ${path.relative(ROOT, r.out)}${u === PRIMARY ? ' (+ dist/index.html)' : ''}  (${r.files} files, ${(r.bytes / 1024).toFixed(0)} KB)` + (r.art ? ` + art/ (${r.art.files} files, ${r.art.copied} copied)` : ''));
      } catch (e) { ok = false; console.error(`BUILD FAILED (${u}): ` + e.message); }
    }
    if (!ok && !watch) process.exit(1);
  };
  run();
  if (watch){
    let t = null;
    const again = () => { clearTimeout(t); t = setTimeout(run, 150); };
    for (const d of [ENGINE_DIR, UNITS_DIR, path.join(ROOT, 'assets')]) if (fs.existsSync(d)) fs.watch(d, { recursive: true }, (ev, f) => { if (f && /generated[\/\\]/.test(f)) return; again(); });
    console.log(`watching engine/, units/ and assets/ (building ${units.join(', ')}) ...`);
  }
}
