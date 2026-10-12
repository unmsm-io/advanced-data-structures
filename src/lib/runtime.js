// Client runtime shared by every lab. Expects P (projection) and U (ui strings) defined before it,
// and the Anatomy kit (iso, depthOf, translateAlong, solidSvg, ...) inlined as globals.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const stage = $(".iso-stage"), svg = $("svg", stage), readout = $("[data-readout]"), logEl = $("[data-log]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const NS = "http://www.w3.org/2000/svg";
let slow = 1, busy = false, touring = !still.matches, idleTimer = 0;
const fmt = (s, v = {}) => String(s).replace(/\{(\w+)\}/g, (_, k) => (v[k] ?? ""));
const wait = (ms) => new Promise((r) => setTimeout(r, still.matches ? 0 : ms * slow));
const hl = (n) => $$("[data-line]").forEach((e) => e.toggleAttribute("data-on", +e.dataset.line === n));
const say = (t) => { readout.textContent = t; stage.setAttribute("aria-valuetext", t); };
const log = (t) => { logEl.innerHTML = t; };
const stats = (rows) => { $("[data-stats]").innerHTML = rows.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join(""); };
const tables = (html) => { $("[data-tables]").innerHTML = html; };
const cells = (label, sub, values, mark = () => false) =>
  `<div><b>${label}<em>${sub}</em></b><span style="grid-template-columns:repeat(${values.length},1fr)">${values
    .map((v, j) => `<i class="${v === null || v === undefined ? "e" : ""}${mark(j) ? " on" : ""}"><small>${j}</small>${v ?? "—"}</i>`)
    .join("")}</span></div>`;
// SVG groups that hold dynamic kit art.
const layer = (name) => $(`[data-layer="${name}"]`, svg);
function art(html, parent) { const g = document.createElementNS(NS, "g"); g.innerHTML = html; if (parent) parent.appendChild(g); return g; }
const place = (g, p) => { g.pos = p; g.setAttribute("transform", translateAlong(P, p)); };
const sortBy = (l) => [...l.children].sort((a, b) => depthOf(a.pos || [0, 0, 0], P) - depthOf(b.pos || [0, 0, 0], P)).forEach((c) => l.appendChild(c));
const lit = (g, on) => $$(".iso-solid", g).forEach((s) => on ? s.setAttribute("data-lit", "") : s.removeAttribute("data-lit"));
const flash = (g, ms = 450) => { if (!g) return; lit(g, true); setTimeout(() => lit(g, false), ms * slow); };
const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);
function animate(dur, step) {
  return new Promise((res) => {
    if (still.matches) { step(1); return res(); }
    const t0 = performance.now(); dur *= slow;
    (function f(now) { const u = Math.min(1, (now - t0) / dur); step(ease(u), u); u < 1 ? requestAnimationFrame(f) : res(); })(t0);
  });
}
function tween(g, to, dur = 600, arc = 0) {
  const from = (g.pos || to).slice();
  return animate(dur, (e, u) => place(g, [0, 1, 2].map((i) => from[i] + (to[i] - from[i]) * e + (i === 2 ? arc * Math.sin(Math.PI * u) : 0))));
}
const seg = (a, b) => { const p = iso(a, P), q = iso(b, P); return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`; };
const poly = (pts) => pts.map((p, i) => { const q = iso(p, P); return (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); }).join("");
async function run(fn) { if (busy) return; busy = true; try { await fn(); } finally { busy = false; } }
const userInput = () => { touring = false; clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = !still.matches; tourLoop(); }, 14000); };
let tourStep = null;
async function tourLoop() { while (touring && tourStep) { await run(tourStep); await wait(1000); } }
const input = () => $("[data-key]")?.value.trim();
function bind(map) {
  for (const [act, fn] of Object.entries(map)) $$(`[data-act="${act}"]`).forEach((b) => b.addEventListener("click", () => { userInput(); run(fn); }));
  $$('[data-act="slow"]').forEach((b) => b.addEventListener("click", () => { slow = slow === 1 ? 3 : 1; b.firstChild.textContent = slow > 1 ? U.slowOn + " " : U.slowOff + " "; }));
  addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") { if (e.key === "Enter") $('[data-act="add"]')?.click(); return; }
    if (e.key === " ") { e.preventDefault(); $(".ck-controls .pri")?.click(); }
    if (e.key === "s") $('[data-act="slow"]')?.click();
  });
}
function startTour(step) { tourStep = step; if (touring) tourLoop(); }
