// Builds every lesson, then the course index.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import * as k from "./vendor/anatomy/kit/iso-kit.mjs";
import { CSS, THEME_BOOT } from "./lib/lesson.mjs";
import { UNITS } from "./lib/syllabus.mjs";

for (const unit of UNITS) for (const week of unit.weeks) {
  if (week.slug) execFileSync(process.execPath, [`lessons/${week.slug}/build.mjs`], { stdio: "inherit" });
}

const pad = (n) => String(n).padStart(2, "0");
const row = (w) => {
  const live = w.slug && existsSync(`dist/${w.slug}/index.html`);
  const inner = `<span class="wk">${pad(w.w)}</span><span class="tp"><b>${w.topic}</b>${w.machine ? `<em>${w.machine}</em>` : ""}</span><span class="st">${live ? "Abrir →" : w.machine ? "Próximamente" : ""}</span>`;
  return live ? `<a class="row live" href="${w.slug}/">${inner}</a>` : `<div class="row">${inner}</div>`;
};
const done = UNITS.flatMap((u) => u.weeks).filter((w) => w.slug).length;
const total = UNITS.flatMap((u) => u.weeks).filter((w) => w.machine).length;
const body = THEME_BOOT + CSS + `<style>
.units{display:grid;gap:36px;padding:36px 0}
.unit h2{font:400 30px/1.1 "Instrument Serif",serif;margin:0 0 12px}.unit h2 small{display:block;font:600 11px Inter;letter-spacing:.12em;color:var(--acc);margin-bottom:6px}
.row{display:grid;grid-template-columns:48px 1fr auto;gap:16px;align-items:center;padding:14px 16px;border-top:1px solid var(--rule);color:inherit;text-decoration:none}
.row:last-child{border-bottom:1px solid var(--rule)}
.row .wk{font:600 13px "JetBrains Mono",monospace;opacity:.5}
.row b{display:block;font:500 15px Inter}.row em{display:block;font-style:normal;font-size:13px;opacity:.55;margin-top:2px}
.row .st{font:500 12px Inter;opacity:.45}
.row.live{background:color-mix(in srgb,var(--acc) 7%,transparent)}.row.live .st{color:var(--acc);opacity:1;font-weight:600}.row.live:hover{background:color-mix(in srgb,var(--acc) 13%,transparent)}
</style><div class="lz"><header class="hero"><div><div class="kicker">UNMSM · FISI · 2026-II</div><h1>Estructura de Datos <span>Avanzadas</span></h1><p class="lede">Cada semana del sílabo como una máquina que se puede tocar: el mecanismo se ve moverse, el pseudocódigo marca la línea que corre y la teoría queda al lado. ${done} de ${total} máquinas listas.</p></div><div class="meta"><div class="theme" role="group" aria-label="Tema"><button data-theme-set="system">Sistema</button><button data-theme-set="light">Claro</button><button data-theme-set="dark">Oscuro</button></div><span>Figuras con Anatomy (MIT)</span></div></header>
<div class="units">${UNITS.map((u) => `<section class="unit"><h2><small>UNIDAD ${u.n}</small>${u.title}</h2>${u.weeks.map(row).join("")}</section>`).join("")}</div></div>`;
mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", k.pageHtml({ title: "Estructura de Datos Avanzadas", theme: "dark", body }).replace('lang="en"', 'lang="es"'));
console.log("wrote dist/index.html");
