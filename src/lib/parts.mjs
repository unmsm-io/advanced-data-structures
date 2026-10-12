// Shared bench parts drawn with the Anatomy kit (server side).
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";

export { k };
export const S = (paths, style) => k.solidSvg(paths, style);
export const L = (d, style) => k.lineSvg(d, style);
export const D = (points, style) => k.dotsSvg(points, style);
export const byDepth = (P, pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// Base plate on four feet, inset groove, corner screws and a label plate with rule lines.
export function bench(P, plate, { h = 10, foot = 5, label } = {}) {
  const at = (p) => k.iso(p, P);
  const out = [`<path class="iso-halo" d="${k.haloOf(plate, -h - foot, h, P)}"/>`];
  for (const [x, y] of byDepth(P, k.corners(plate, 20))) {
    out.push(S(k.cylinder(x, y, 7, -h - foot, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -h - foot + 1.6, foot - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(plate, -h, h, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(plate, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(plate, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  if (label) {
    out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
    [30, 22, 26].forEach((w, i) => out.push(L(k.lineOnTop([label.x + 5, label.y + 4.5 + i * 3.6], [label.x + 5 + Math.min(w, label.w - 10), label.y + 4.5 + i * 3.6], 0.8, P), { tone: "faint", free: true })));
    out.push(D(k.corners(label, 2).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  }
  return out.join("");
}

// Ruler strip lying on the floor along x with minor and major ticks.
export function ruler(P, x0, x1, y, { step = 5, every = 4, z = 0 } = {}) {
  const strip = { x: x0 - 4, y, w: x1 - x0 + 8, d: 5, r: 0.8 };
  const t = k.topTicks(x0, x1, step, every, y + 0.6, z + 0.6, [1.6, 3.4], P);
  return S(k.slabOf(strip, z, 0.6, P, 3), { tone: "lo", crease: "none" }) + L(t.minor, { tone: "lo" }) + L(t.major, { tone: "mid" });
}

// Dial gauge on a square pad; the needle is drawn live with needlePath.
export function dial(P, [x, y], { r = 13, h = 7, ticks = 16, every = 2 } = {}) {
  const at = (p) => k.iso(p, P), pad = { x: x - r - 4, y: y - r - 4, w: 2 * r + 8, d: 2 * r + 8, r: 3 };
  const out = [S(k.slabOf(pad, 0, 2, P, 4, 0.4), { tone: "lo" }), D(k.corners(pad, 3).map(([a, b]) => at([a, b, 2])), { size: 0.45 })];
  out.push(S(k.cylinder(x, y, r, 2, h - 2, P, 56, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, r, h - 2.4, h, 64, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, r - 1.8, h, P, 48), { tone: "lo" }));
  const t = k.radialTicks(x, y, r - 2.6, ticks, every, h, [1, 2.2], P, Math.PI * 0.75, Math.PI * 1.5);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }), L(k.ring(x, y, 1.4, h, P, 14), { tone: "mid" }));
  return out.join("");
}

// Knurled knob on a tick ring; data-knob path is the pointer drawn live.
export function knob(P, [x, y], id) {
  const out = [S(k.cylinder(x, y, 9, 0, 1.4, P, 32), { tone: "lo" })];
  const t = k.radialTicks(x, y, 8.4, 12, 3, 1.4, [0.8, 1.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 6, 1.4, 6, P, 32, 0.4), { tone: "mid" }), L(k.knurl(x, y, 6, 1.8, 7, 36, P), { tone: "lo" }));
  out.push(`<path data-knob="${id}" class="iso-line" data-tone="hi" d="${k.lineOnTop([x, y], [x + 5, y], 7.4, P)}" style="stroke-width:1"/>`);
  out.push(D([k.iso([x, y, 7.4], P)], { size: 0.5, tone: "hi" }));
  return out.join("");
}

export const layers = (...names) => names.map((n) => `<g data-layer="${n}"></g>`).join("");
