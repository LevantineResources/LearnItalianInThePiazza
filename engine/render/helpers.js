/* Canvas drawing helpers. */

/* =========================================================
   DRAWING
   ========================================================= */
function rng(seed){ return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function rr(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function circ(g, x, y, r){ g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); }
function ell(g, x, y, rx, ry, rot = 0){ g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function cobbles(g, r, x0, y0, x1, y1, hue, sat, lig){
  for (let y = y0, row = 0; y < y1; y += 13, row++){
    const off = row % 2 ? 9 : 0;
    for (let x = x0 - 18 + off; x < x1; x += 18){
      const l = r(); g.fillStyle = `hsl(${hue + l * 10}, ${sat + l * 12}%, ${lig + l * 9}%)`;
      rr(g, x + 1, y + 1, 16, 11, 3); g.fill();
    }
  }
}
function roofs(g, x0, y0, w, h, col, r){
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  g.fillStyle = col; g.fillRect(x0, y0, w, h);
  g.strokeStyle = 'rgba(70,22,10,.38)'; g.lineWidth = 1.3;
  for (let y = y0 + 4, row = 0; y < y0 + h; y += 9, row++){
    const off = row % 2 ? 6 : 0;
    for (let x = x0 - 12 + off; x < x0 + w + 12; x += 12){ g.beginPath(); g.arc(x + 6, y, 6, 0, Math.PI); g.stroke(); }
  }
  g.restore();
  g.strokeStyle = 'rgba(40,12,6,.5)'; g.lineWidth = 3; g.strokeRect(x0 + 1.5, y0 + 1.5, w - 3, h - 3);
}
/* scenes with art of their own (render/ponte.js, render/parco.js): SCENE_ART[scene] = { back(t) (the background, drawn
   instead of a pre-rendered canvas), ents?(t) → [{ y, draw }] (the depth-sorted pass), night?() (its own lighting pass,
   instead of the generic one: render/night.js), probe?() → a canvas (the scene's background as lit now: __nightProbe) } */
const SCENE_ART = {};
/* a colour '#rrggbb' darker (k < 0, towards black) or lighter (k > 0, towards white) */
function shade(hex, k){
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k));
  return `rgb(${c.join(',')})`;
}
