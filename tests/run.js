#!/usr/bin/env node
/*
 * npm test: builds dist/index.html, then runs every playthrough in tests/ (files ending in .js
 * other than this one and helpers in tests/lib) in parallel.
 *
 * A playthrough passes when it
 *   - exits with code 0,
 *   - prints "errors: none" (no uncaught page errors), and
 *   - every "...complete...: <bool>" / "...modal...: <bool>" line it prints is true.
 *
 * Usage:
 *   npm test                      all playthroughs
 *   npm test -- l6 l5             only files whose name contains l6 or l5
 *   npm test -- --verbose         print each playthrough's full log
 * Logs are written to tests/logs/<name>.log either way; screenshots to tests/shots/.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { build } = require('../scripts/build.js');

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const filters = args.filter(a => !a.startsWith('--'));
const CONCURRENCY = Number(process.env.TEST_CONCURRENCY || 4);
const TIMEOUT = Number(process.env.TEST_TIMEOUT_MS || 900000);   // a whole lesson with a listening drill takes ~3–6 min (Lesson 8, under parallel load, ~8)

const dir = __dirname, logs = path.join(dir, 'logs');
fs.mkdirSync(logs, { recursive: true });

const r = build();
console.log(`built dist/index.html (${r.files} files)\n`);

const tests = fs.readdirSync(dir).filter(f => f.endsWith('.js') && f !== 'run.js')
  .filter(f => !filters.length || filters.some(q => f.includes(q))).sort();
if (!tests.length){ console.error('no matching tests'); process.exit(1); }

function verdict(code, out){
  const problems = [];
  if (code !== 0) problems.push(`exit code ${code}`);
  if (!/errors: none/.test(out)) problems.push('page errors (or the test did not finish)');
  for (const line of out.split('\n')) if (/(complete|modal)[^\n]*:\s*false\b/i.test(line)) problems.push('not completed: ' + line.trim().slice(0, 100));
  const fail = out.split('\n').find(l => /^FAIL /.test(l)); if (fail) problems.push(fail.slice(0, 160));
  return problems;
}

function runOne(f){
  return new Promise(resolve => {
    const t0 = Date.now(); let out = '';
    const child = spawn(process.execPath, [path.join(dir, f)], { cwd: dir });
    const timer = setTimeout(() => { out += '\nFAIL timed out\n'; child.kill('SIGKILL'); }, TIMEOUT);
    child.stdout.on('data', d => out += d); child.stderr.on('data', d => out += d);
    child.on('close', code => {
      clearTimeout(timer);
      fs.writeFileSync(path.join(logs, f.replace(/\.js$/, '.log')), out);
      const problems = verdict(code, out), secs = ((Date.now() - t0) / 1000).toFixed(0);
      console.log(`${problems.length ? '✗ FAIL' : '✓ pass'}  ${f.padEnd(24)} ${secs}s`);
      problems.forEach(p => console.log('         ' + p));
      if (verbose || problems.length && verbose) console.log(out);
      resolve(problems.length === 0);
    });
  });
}

(async () => {
  const queue = [...tests], results = [];
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) results.push(await runOne(queue.shift()));
  }));
  const failed = results.filter(x => !x).length;
  console.log(`\n${results.length - failed}/${results.length} passed` + (failed ? '  (logs in tests/logs/)' : ''));
  process.exit(failed ? 1 : 0);
})();
