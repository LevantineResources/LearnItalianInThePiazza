/* Padova's fields in the tests' snapshot (window.__dbg(), engine/core/state.js dbgField) and its __debug helpers. The
   order is the snapshot's order before the split (UNIT.dbgOrder), so tests that print it see what they always saw. */

UNIT.dbgOrder = ['follow', 'lost', 'bruno', 'numbers', 'drill', 'l7', 'l8', 'pad', 'words', 'l9', 'l10', 'l11', 'dict', 'list', 'statue', 'crowd', 'clock',
  'grammar', 'ispy', 'galleria', 'cut', 'mispy', 'handbook', 'quests', 'night', 'stazione', 'shop', 'ponte', 'parco', 'foto', 'tramonto', 'aquilone',
  'salone', 'mercato', 'basilica', 'messa', 'aperitivo', 'notebook', 'l12', 'treno', 'fast', 'l13', 'l14', 'venezia', 'l15', 'unit'];
{
  const copy = k => () => S[k] ? JSON.parse(JSON.stringify(S[k])) : null;
  const lesson = n => () => S['l' + n] ? Object.assign(JSON.parse(JSON.stringify(S['l' + n])), askHooks('dbgLesson', n) || {}) : null;
  [['follow', () => S.brunoFollow], ['lost', () => S.handbookLost], ['bruno', () => [Math.round(NPC.bruno.x), Math.round(NPC.bruno.y)]],
   ['l7', copy('l7')], ['l8', copy('l8')], ['l9', copy('l9')], ['l10', copy('l10')], ['l11', lesson(11)],
   ['statue', () => statueDbg()], ['clock', () => clockDbg()], ['ispy', () => ispyDbg()],
   ['galleria', () => galleriaDbg()], ['mispy', () => mispyDbg()], ['stazione', () => stazioneDbg()], ['ponte', () => ponteDbg()], ['parco', () => parcoDbg()],
   ['foto', () => fotoDbg()], ['tramonto', () => tramontoDbg()], ['aquilone', () => aquiloneDbg()], ['salone', () => saloneDbg()], ['mercato', () => mercatoDbg()],
   ['basilica', () => basilicaDbg()], ['messa', () => messaDbg()], ['aperitivo', () => aperitivoDbg()],
   ['l12', lesson(12)], ['treno', () => trenoDbg()], ['l13', lesson(13)], ['l14', lesson(14)], ['venezia', () => veneziaDbg()], ['l15', lesson(15)],
   ['unit', () => typeof unitDbg === 'function' ? unitDbg() : null]].forEach(([k, fn]) => dbgField(k, fn));
}
Object.assign(window.__debug, {
  clock(h, m){ setClock(h, m); },                                      // the museum square's clock tower (world/museo.js)
  overview(on){ galleriaOverview(on); },                               // the museum interior: show the whole scene (world/galleria.js)
});
