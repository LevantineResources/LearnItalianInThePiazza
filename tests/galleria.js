/* The museum interior (scene 'galleria', world/galleria.js, render/galleria.js): the museum doors lead inside once Lesson 10
   is complete (Lesson 10's own door behaviour before that), the camera follows the player in this bigger scene (and only
   here), every work (22 paintings, 5 statues, from assets/art/manifest.json) is placed, reachable on foot, and opens its
   picture with E (and with a tap), with the right title and the full image loaded; the nearest wins, a person in range wins
   over a work; plinths and benches block the way; every statue is roped off: stepping inside a rope (or E inside it) gets
   the custodian's "Troppo vicino!" and a nudge back out; the exit leads back to the square. From Lesson 11 on: visitors,
   crowd blockers in front of a painting in every room (Permesso clears them, with the camera), ambient visitors. */
const { play } = require('./lib/harness');
const MAN = require('../assets/art/manifest.json');

play(async t => {
  const p = t.page, dbg = () => p.evaluate(() => __dbg()), gal = async () => (await dbg()).galleria;
  const waitFor = (fn, arg, ms = 8000) => p.waitForFunction(fn, arg, { timeout:ms, polling:100 }).then(() => true).catch(() => false);
  const place = (x, y) => p.evaluate(([x, y]) => __debug.place(x, y), [x, y]);
  const toastHas = re => p.$$eval('.toast', ts => ts.map(x => x.innerText).join(' | ')).then(s => re.test(s));
  const press = async k => { await p.keyboard.press(k); await p.waitForTimeout(250); };

  await t.jump(10);
  // during Lesson 10 the doors are still Lesson 10's (no ticket yet: the neutral "timed ticket" text)
  await p.evaluate(() => { __debug.set({ tut:'l10-crowd' }); __debug.travel('museo', { x:400, y:206 }); }); await p.waitForTimeout(2600);
  let d = await dbg();
  t.check('museum square: no camera offset', d.scene === 'museo' && d.galleria.cam.join() === '0,0' && d.galleria.size.join() === '960,600');
  await press('e'); await p.waitForTimeout(400);
  t.check('during Lesson 10 the doors stay shut', (await dbg()).scene === 'museo' && await toastHas(/timed ticket/));

  // Lesson 10 complete: the doors lead inside, into Lesson 11 (its opening cutscene, skipped here: Esc); the rest of this
  // test looks at the galleria with Lesson 10's state (no visitors yet)
  await p.evaluate(() => { __debug.set({ tut:'l10-done' }); __debug.place(400, 206); }); await p.waitForTimeout(300);
  await press('e'); await p.waitForTimeout(2800);
  d = await dbg();
  t.check('the museum doors lead into the galleria (and Lesson 11)', d.scene === 'galleria' && d.lesson === 11);
  await waitFor(() => __dbg().cut.on); await press('Escape'); await waitFor(() => !__dbg().cut.on);
  await p.evaluate(() => { __debug.set({ lesson:10, tut:'l10-done', l11:null }); __debug.crowdReset(); __debug.place(912, 1062); }); await p.waitForTimeout(400);
  d = await dbg();
  t.check('the scene is 1824 × 1132, the camera follows (spawn at the bottom)', d.galleria.size.join() === '1824,1132' && d.galleria.cam[1] === 1132 - 600 && d.galleria.cam[0] === 912 - 480);
  t.check('all 27 thumbnails load', await waitFor(() => __dbg().galleria.thumbs === 27));
  const works = d.galleria.works;
  t.check('no visitors before Lesson 11 (only the custodian)', !Object.keys(d.galleria.visitors).length && !!d.galleria.custodian);
  t.check('every work of the manifest is placed', works.length === 27 && MAN.works.length === 27 && MAN.works.every(w => works.some(x => x.id === w.id && x.room === w.room && x.kind === w.kind)));
  const rooms = [1, 2, 3, 4, 5].map(n => works.filter(w => w.room === n).length).join();
  console.log('   works per room 1–5:', rooms, ' statues:', works.filter(w => w.kind === 'statue').length);
  t.check('paintings hang in their rooms (4, 4, 5, 4, 5), 5 statues in the atrium', rooms === '4,4,5,4,5' && works.filter(w => w.room === 0 && w.kind === 'statue').length === 5);
  const overlaps = works.filter(a => a.kind === 'painting').some(a => works.some(b => b !== a && b.kind === 'painting' && a.rect.x < b.rect.x + b.rect.w && b.rect.x < a.rect.x + a.rect.w && a.rect.y < b.rect.y + b.rect.h && b.rect.y < a.rect.y + a.rect.h));
  t.check('no two paintings overlap', !overlaps);
  const s5 = works.filter(w => w.room === 5).sort((a, b) => a.rect.x - b.rect.x).map(w => w.id), at = s5.indexOf('raffaello-atene');
  console.log('   Sala 5, west to east:', s5.join(', '));
  t.check('Sala 5: La scuola di Atene in the middle, two Raphaels on either side', at === 2 && s5.length === 5);
  await t.shot('galleria-entrance');

  // every work: reachable on foot from the entrance; beside it, E opens it (right title, full image), E closes it
  let ok = 0; const bad = [];
  for (const w of works){
    await place(1062 - 150, 1062);
    const reach = await p.evaluate(s => __debug.reach(s.x, s.y), w.spot);
    await place(w.spot.x, w.spot.y); await p.waitForTimeout(80);
    const near = (await gal()).near;
    await press('e');
    const opened = await waitFor(id => __dbg().galleria.open === id && __dbg().galleria.img && __dbg().galleria.img.w > 0, w.id, 6000);
    const g = await gal(), m = MAN.works.find(x => x.id === w.id);
    const good = reach && near === w.id && opened && g.title === m.title_it && g.en === m.title_en && g.img.src === 'art/' + m.file;
    if (good) ok++; else bad.push(`${w.id}: reach ${reach} near ${near} open ${opened} title ${g.title}`);
    await press('e');
    if ((await gal()).open) bad.push(w.id + ': E did not close it');
  }
  bad.forEach(b => console.log('   ✗ ' + b));
  t.check(`all 27 works reachable, nearest, open with E (title, image) and close with E (${ok}/27)`, ok === 27 && !bad.length);

  // the camera only shows what's near; in Sala 5 it is at the top
  const atene = works.find(w => w.id === 'raffaello-atene');
  await place(atene.spot.x, atene.spot.y); await p.waitForTimeout(150);
  t.check('in Sala 5 the camera is at the top', (await gal()).cam[1] === 0);

  // a tap on a painting across the room walks there and opens it; × closes
  const prim = works.find(w => w.id === 'botticelli-primavera');
  await place(330, 660); await p.waitForTimeout(150);
  let cam = (await gal()).cam;
  await t.clickWorld(prim.rect.x + prim.rect.w / 2 - cam[0], prim.rect.y + prim.rect.h / 2 - cam[1]);
  t.check('a tap on La Primavera walks there and opens it', await waitFor(() => __dbg().galleria.open === 'botticelli-primavera', null, 8000));
  await p.click('#sheet .aw-x'); await p.waitForTimeout(250);
  t.check('× closes it', !(await gal()).open);
  // a tap on a statue
  const pieta = works.find(w => w.id === 'michelangelo-pieta'), perseo = works.find(w => w.id === 'cellini-perseo');
  await place(912, 1000); await p.waitForTimeout(150); cam = (await gal()).cam;
  await t.clickWorld(pieta.rect.x + pieta.rect.w / 2 - cam[0], pieta.rect.y + pieta.rect.h / 2 - cam[1]);
  t.check('a tap on the Pietà walks there and opens it', await waitFor(() => __dbg().galleria.open === 'michelangelo-pieta', null, 8000));
  await t.shot('galleria-pieta');
  await press('Escape');
  t.check('Esc closes it', !(await gal()).open);

  // the ropes: stepping inside one gets the custodian's "Troppo vicino!" and a nudge back out; the plinth itself blocks
  const said = async () => (await dbg()).crowd.said.map(x => x.join(':')).join(' | ');
  await place(pieta.block.x + pieta.block.w / 2, pieta.block.y + pieta.block.h + 30); await p.waitForTimeout(100);
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(500); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(150);
  d = await dbg();
  t.check('stepping inside the Pietà\'s rope: the custodian calls "Troppo vicino!"', d.galleria.rope.count === 1 && d.galleria.rope.last === 'michelangelo-pieta' && /guardia:Troppo vicino!/.test(await said()));
  await t.shot('galleria-troppo-vicino');
  t.check('… and the player is walked back out', await waitFor(() => !__dbg().cut.on && !__dbg().galleria.rope.in, null, 4000) && (await dbg()).me[1] >= pieta.block.y + pieta.block.h);
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(150); await p.keyboard.up('ArrowUp');
  t.check('the controls come back after the nudge', (await dbg()).me[1] < pieta.block.y + pieta.block.h + 22 - 4);
  await p.waitForTimeout(1500);
  // E inside a rope: too close, not the picture
  await place(perseo.block.x + 8, perseo.block.y + perseo.block.h / 2); await p.waitForTimeout(60);
  d = await dbg();
  t.check('standing inside Perseo\'s rope: too close again (rope 2)', d.galleria.rope.count === 2 && d.galleria.rope.last === 'cellini-perseo' && !d.galleria.open);
  await p.waitForTimeout(1600);
  t.check('every statue is roped', works.filter(w => w.kind === 'statue').every(w => w.block && w.block.w > w.plinth.w + 40));
  // a lesson can take the custodian's line over (onTooClose)
  await p.evaluate(() => __debug.hook({ onTooClose(id){ window.__tc = id; return true; } }));
  await place(perseo.block.x + perseo.block.w - 8, perseo.block.y + perseo.block.h / 2); await p.waitForTimeout(150);
  t.check('a lesson\'s onTooClose hook takes over (no bubble, no nudge)', await p.evaluate(() => window.__tc) === 'cellini-perseo' && !(await dbg()).cut.on);
  await p.evaluate(() => __debug.hook(null)); await place(perseo.spot.x, perseo.spot.y); await p.waitForTimeout(1500);
  // the plinth blocks (from inside the rope too)
  t.check('no way onto a plinth', !(await p.evaluate(b => __debug.reach(b.x + b.w / 2, b.y + b.h / 2), works.find(w => w.id === 'cellini-perseo').plinth)));
  t.check('tap-to-walk never routes through a rope', !(await p.evaluate(b => __debug.reach(b.x + b.w / 2, b.y + b.h - 18), perseo.block)));

  // walking through a doorway in a north wall (Sala 1 → Sala 2, under the lintel)
  await place(76, 900); await p.keyboard.down('ArrowUp'); await p.waitForTimeout(1300); await p.keyboard.up('ArrowUp');
  d = await dbg();
  t.check('through the doorway from Sala 1 into Sala 2', d.me[1] < 700);

  // a person in range wins over a work (the guard, Lesson 11, moved beside La Primavera for the test)
  await p.evaluate(s => { __debug.npc('guardia', { x:s.x + 40, y:s.y + 10 }); }, prim.spot);
  await place(prim.spot.x, prim.spot.y); await p.waitForTimeout(200);
  t.check('the guard (in range) wins over the painting', (await gal()).near === null);
  await press('e');
  t.check('E talks to the guard', await waitFor(() => !document.querySelector('#dialog').hidden, null, 4000));
  await t.leave();
  await p.evaluate(() => __debug.npc('guardia', { x:716, y:800 }));

  // out through the entrance, and back in
  await place(912, 1080); await p.waitForTimeout(150);
  t.check('the exit is near the entrance', (await gal()).door === 'uscita');
  await press('e'); await p.waitForTimeout(2800);
  d = await dbg();
  t.check('the exit leads back to the museum square', d.scene === 'museo' && d.galleria.cam.join() === '0,0' && Math.abs(d.me[0] - 400) < 4);
  await p.evaluate(() => __debug.set({ lesson:11 }));                         // (in Lesson 10's done state the doors would start Lesson 11)
  await place(400, 206); await press('e'); await p.waitForTimeout(2800);
  t.check('and the doors lead back in', (await dbg()).scene === 'galleria');


  // ---- Lesson 11 on: the visitors ----
  await p.evaluate(() => { __debug.set({ lesson:11 }); __debug.crowdReset(); }); await p.waitForTimeout(400);
  d = await dbg();
  const V = d.galleria.visitors, ids = Object.keys(V);
  console.log('   visitors:', ids.map(id => `${id}${V[id].blocks ? '⛔' + V[id].blocks : V[id].seated ? '(bench)' : V[id].ambient ? '(wanders)' : ''}`).join(', '));
  t.check(`from Lesson 11: 12–16 visitors in the galleria (${ids.length})`, ids.length >= 12 && ids.length <= 16);
  const blockedRooms = [...new Set(Object.keys(d.galleria.blocked).map(id => works.find(w => w.id === id).room))].sort().join();
  t.check('a crowd blocker in front of a painting in every room (1–5)', blockedRooms === '1,2,3,4,5');
  t.check('the ⛔ works of the doc are blocked', ['uccello-san-romano', 'botticelli-primavera', 'caravaggio-giuditta', 'balla-cane', 'raffaello-atene'].every(id => d.galleria.blocked[id]));
  t.check('some visitors sit or wander', ids.some(id => V[id].seated) && ids.filter(id => V[id].ambient && !V[id].seated).length >= 2);
  // screenshots of every room with its visitors
  for (const [name, x, y] of [['galleria-sala1', 380, 980], ['galleria-sala2', 330, 600], ['galleria-sala3', 1500, 560], ['galleria-sala4', 1480, 980], ['galleria-sala5', 700, 300], ['galleria-atrium', 912, 900]]){
    await place(x, y); await p.waitForTimeout(250); await p.locator('#cv').screenshot({ path:require('path').join(require('./lib/harness').SHOTS, name + '.png') });
  }
  const paths = await p.evaluate(() => __galWanderCheck());
  t.check('the wanderers\' loops never cross a wall, a plinth, a bench or a rope', paths.length > 0 && paths.every(x => !x.bad.length));
  paths.filter(x => x.bad.length).forEach(x => console.log('   ✗ ' + x.id + ' ' + JSON.stringify(x.bad.slice(0, 3))));
  // the wanderers move (slowly) and never block for long
  const w0 = ids.filter(id => V[id].ambient && !V[id].seated).map(id => V[id].at.join());
  await p.waitForTimeout(2500);
  const V2 = (await dbg()).galleria.visitors;
  t.check('the wanderers walk', ids.filter(id => V[id].ambient && !V[id].seated).some((id, k) => V2[id].at.join() !== w0[k]));
  // La Primavera, blocked by a couple: E in front opens the Permesso pick, not the picture
  await place(prim.spot.x + 20, prim.spot.y + 6); await p.waitForTimeout(200);
  await press('e');
  d = await dbg();
  t.check('E at La Primavera: the Permesso pick (a couple is in front of it)', !!d.crowd.pick && ['visitatore', 'visitatrice'].includes(d.crowd.pick.npc) && !d.galleria.open);
  const pick = await p.evaluate(() => { const e = document.querySelector('#crowdPick').getBoundingClientRect(), c = document.querySelector('#cv').getBoundingClientRect(); return { l:e.left, t:e.top, r:e.right, b:e.bottom, cl:c.left, ct:c.top, cr:c.right, cb:c.bottom }; });
  t.check('the pick is on screen, over the player (camera)', pick.l >= pick.cl && pick.r <= pick.cr && pick.t >= pick.ct && pick.b <= pick.cb);
  await t.shot('galleria-permesso');
  await press('2');
  t.check('Scusi: they turn round, stay put (and a hint)', await waitFor(() => /Sì\?/.test(__dbg().crowd.said.map(x => x[1]).join()), null, 3000) && !(await dbg()).galleria.visitors.visitatore.moved);
  await p.waitForTimeout(1200);
  await press('e'); await press('1');
  t.check('Permesso: the couple both step aside (one word moves the group)', await waitFor(() => { const v = __dbg().galleria.visitors; return v.visitatore.moved && v.visitatrice.moved && !v.visitatore.walking && !v.visitatrice.walking; }, null, 8000));
  t.check('"Permesso!" over the player, "Prego!" over them', /player:Permesso!/.test(await said()) && /visitat(ore|rice):Prego!/.test(await said()));
  await place(prim.spot.x, prim.spot.y); await p.waitForTimeout(200);
  await press('e');
  t.check('now E opens La Primavera', await waitFor(() => __dbg().galleria.open === 'botticelli-primavera', null, 3000));
  await press('Escape');
  // Sala 5, at the top of the scene: a tap on the fresco walks there and opens the pick; Permesso clears the school group
  const atn = works.find(w => w.id === 'raffaello-atene');
  await place(1250, 300); await p.waitForTimeout(300); cam = (await gal()).cam;
  await t.clickWorld(atn.rect.x + atn.rect.w / 2 - cam[0], atn.rect.y + atn.rect.h / 2 - cam[1]);
  t.check('a tap on La scuola di Atene: the Permesso pick (a school group at the rope)', await waitFor(() => !!__dbg().crowd.pick, null, 8000) && ['guida', 'ragazzo', 'ragazza'].includes((await dbg()).crowd.pick.npc));
  await p.click('#crowdPick [data-pick=permesso]');
  t.check('Permesso: the whole group steps aside', await waitFor(() => ['guida', 'ragazzo', 'ragazza'].every(id => __dbg().galleria.visitors[id].moved && !__dbg().galleria.visitors[id].walking), null, 9000));
  d = await dbg();
  t.check('they end up off the rope, out of the way', ['guida', 'ragazzo', 'ragazza'].every(id => d.galleria.visitors[id].at[1] > 236 || d.galleria.visitors[id].at[0] > 1040));
  cam = (await gal()).cam;
  await t.clickWorld(atn.rect.x + atn.rect.w / 2 - cam[0], atn.rect.y + atn.rect.h / 2 - cam[1]);
  t.check('and the tap now opens the fresco', await waitFor(() => __dbg().galleria.open === 'raffaello-atene', null, 6000));
  await press('Escape');
  // an ambient visitor: a line in a bubble, no conversation
  await place(346, 680); await p.waitForTimeout(250);
  await press('e');
  t.check('the old man on the bench: "Bellissimo, vero?" (a bubble, no dialog)', /anziano:Bellissimo, vero\?/.test(await said()) && await p.$eval('#dialog', e => e.hidden));
  // the overview (for review screenshots) switches on and off
  await p.evaluate(() => __debug.overview(true)); await p.waitForTimeout(200);
  const ov = await p.evaluate(() => { const c = document.querySelector('#cv'); return [c.width, __dbg().galleria.cam.join()]; });
  await p.evaluate(() => __debug.overview(false)); await p.waitForTimeout(200);
  const back = await p.evaluate(() => document.querySelector('#cv').style.position === '' && document.querySelector('#cv').parentNode.id === 'stage');
  console.log('   overview:', JSON.stringify(ov), back);
  t.check('overview on and off', ov[1] === '0,0' && ov[0] > 1800 && back);

  // other scenes are unaffected
  await p.evaluate(() => __debug.travel('piazza')); await p.waitForTimeout(2600);
  d = await dbg();
  t.check('the piazza: 960 × 600, no camera offset', d.scene === 'piazza' && d.galleria.size.join() === '960,600' && d.galleria.cam.join() === '0,0');
});
