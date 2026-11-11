/* Sprite atlases (first built for Unit 2's crowds): a figure drawn once per look, facing and frame onto one offscreen canvas,
   then stamped with drawImage, so a crowd of hundreds costs a drawImage each.
     const A = spriteAtlas(draw, { w, h, ox, oy, facings, frames, scale })
       draw(g, look, facing, frame)   draws the figure into g with its feet at (0, 0) (g is already translated and scaled)
       w × h                          a frame's box in world px, its feet at (ox, oy) inside it
       facings, frames                the grid (e.g. 4 facings × 5 frames: four steps of a walk and standing still)
       scale                          how much finer than world px it is drawn (2: sharp at any zoom up to 2 × DPR)
       res                            or a function () → device px per world px (camZoom() × RES): the sheets follow it
     atlasDraw(A, g, look, facing, frame, x, y, alpha?)   draws a look's frame at (x, y) (the feet), baking the look's sheet
                                                           the first time it is used
     atlasWarm(A, looks)             bakes those looks' sheets now
   A.sheets: look key → canvas; A.baked, A.ms. Looks are keyed by look.key (or their index in a table). */
function spriteAtlas(draw, o = {}){
  return { draw, w:o.w || 40, h:o.h || 60, ox:o.ox === undefined ? 20 : o.ox, oy:o.oy === undefined ? 54 : o.oy, facings:o.facings || 4, frames:o.frames || 4,
    scale:o.scale || 2, res:o.res || null, sheets:new Map(), baked:0, ms:0 };
}
const atlasRes = A => A.res ? A.res() : A.scale * DPR;
function atlasSheet(A, look){
  const key = look.key, s = atlasRes(A); let c = A.sheets.get(key); if (c && c.res === s) return c;
  const t0 = performance.now();
  c = document.createElement('canvas'); c.res = s; c.width = Math.ceil(A.w * A.frames * s); c.height = Math.ceil(A.h * A.facings * s);
  const g = c.getContext('2d');
  for (let f = 0; f < A.facings; f++) for (let k = 0; k < A.frames; k++){
    g.save(); g.scale(s, s); g.translate(k * A.w + A.ox, f * A.h + A.oy);
    A.draw(g, look, f, k); g.restore();
  }
  A.sheets.set(key, c); A.baked++; A.ms += performance.now() - t0;
  return c;
}
function atlasDraw(A, g, look, facing, frame, x, y){
  const c = atlasSheet(A, look), s = c.res;
  g.drawImage(c, frame * A.w * s, facing * A.h * s, A.w * s, A.h * s, x - A.ox, y - A.oy, A.w, A.h);
}
function atlasWarm(A, looks){ looks.forEach(l => atlasSheet(A, l)); }
