// Shared lesson shell: hero, lab (figure + side panels), theory, theme and KaTeX.
import * as k from "../vendor/anatomy/kit/iso-kit.mjs";

export const CSS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css"><style>
body.iso{--acc:#b23a2a;--ink:var(--anatomy-text);--rule:color-mix(in srgb,var(--anatomy-text) 14%,transparent);--soft:color-mix(in srgb,var(--anatomy-text) 5%,transparent);font-family:Inter,system-ui,sans-serif}
body.iso[data-theme="dark"]{--acc:#e8735f}
.iso-page{width:min(1240px,100% - 32px)!important;margin:0 auto 120px!important}
.lz{font-family:Inter,system-ui,sans-serif}
.hero{padding:56px 0 24px;display:grid;grid-template-columns:1fr auto;gap:32px;align-items:end;border-bottom:1px solid var(--rule)}
.kicker{font:600 11px Inter;letter-spacing:.14em;text-transform:uppercase;color:var(--acc);margin-bottom:18px;display:flex;gap:10px;align-items:center}
.kicker a{color:inherit;text-decoration:none}.kicker a:hover{text-decoration:underline}.kicker:before{content:"";width:22px;height:1px;background:currentColor}
.hero h1{font:400 64px/0.95 "Instrument Serif",serif;letter-spacing:-.02em;margin:0}
.hero h1 span{color:var(--acc)}
.lede{font:400 17px/1.55 Inter;opacity:.8;margin:12px 0 0;max-width:58ch}
.lede strong{opacity:1;font-weight:600}
.meta{display:grid;gap:6px;font:12px/1.4 "JetBrains Mono",monospace;opacity:.65;text-align:right}
.lab{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(320px,1fr);gap:28px;padding:24px 0 36px;align-items:start}
.lab .iso-figure{margin:0}
.side{display:grid;gap:14px;position:sticky;top:20px}
.panel{border:1px solid var(--rule);border-radius:10px;overflow:hidden;background:var(--anatomy-page)}
.panel>h3{margin:0;padding:10px 14px;font:600 11px Inter;letter-spacing:.1em;text-transform:uppercase;opacity:.6;border-bottom:1px solid var(--rule);display:flex;justify-content:space-between}
.ck-code{font:12.5px/1.95 "JetBrains Mono",monospace;padding:8px 0;white-space:pre}
.ck-code div{padding:0 14px 0 10px;border-left:3px solid transparent;transition:background .25s,border-color .25s}
.ck-code .ln{display:inline-block;width:20px;opacity:.35}
.ck-code div[data-on]{background:color-mix(in srgb,var(--acc) 12%,transparent);border-left-color:var(--acc)}
.ck-code div[data-on] .ln{opacity:1;color:var(--acc)}
.ck-code i{opacity:.45;font-style:normal}
.ck-log{font:500 14px/1.5 Inter;padding:12px 14px;min-height:64px;border-bottom:1px solid var(--rule)}
.ck-stats{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--rule)}
.ck-stats div{padding:10px 14px;border-right:1px solid var(--rule)}.ck-stats div:last-child{border:0}
.ck-stats span{display:block;font:600 11px Inter;letter-spacing:.04em;opacity:.5}
.ck-stats b{font:400 26px/1.1 "Instrument Serif",serif}
.ck-tables{display:grid;gap:12px;padding:12px 14px}
.ck-tables b{display:block;font:600 12px Inter;margin-bottom:6px}.ck-tables b em{font-style:normal;font-weight:400;opacity:.55;margin-left:6px}
.ck-tables span{display:grid;grid-template-columns:repeat(8,1fr);gap:4px}
.ck-tables i{font:600 13px "JetBrains Mono",monospace;font-style:normal;text-align:center;padding:4px 0 5px;border-radius:6px;background:var(--soft);border:1px solid var(--rule)}
.ck-tables i small{display:block;font:500 9px Inter;opacity:.45}
.ck-tables i.e{color:transparent}.ck-tables i.e small{color:var(--ink)}
.ck-controls{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.ck-pair{display:flex}.ck-pair>*{border-radius:0!important;margin-left:-1px}.ck-pair>:first-child{border-radius:8px 0 0 8px!important;margin:0}.ck-pair>:last-child{border-radius:0 8px 8px 0!important}
.ck-controls button,.ck-controls input{font:500 13px Inter;height:38px;padding:0 14px;border-radius:8px;border:1px solid var(--rule);background:var(--anatomy-page);color:inherit;cursor:pointer}
.ck-controls button:hover{background:var(--soft)}
.ck-controls button.pri{background:var(--acc);color:#fff;border-color:transparent;font-weight:600}
.ck-controls button.ghost{border-color:transparent;opacity:.6}
.ck-controls input{width:84px;cursor:text}
kbd{font:500 10px "JetBrains Mono",monospace;padding:1px 5px;border-radius:4px;border:1px solid currentColor;opacity:.6;margin-left:6px}
.theory{display:grid;grid-template-columns:200px minmax(0,1fr);gap:0 48px;border-top:1px solid var(--rule);padding-top:8px}
.theory section{display:contents}
.theory h2{grid-column:1;font:400 30px/1.1 "Instrument Serif",serif;margin:36px 0 0}
.theory h2 small{display:block;font:600 11px Inter;letter-spacing:.12em;color:var(--acc);margin-bottom:6px}
.theory .body{grid-column:2;padding:36px 0 28px;border-bottom:1px solid var(--rule);max-width:72ch}
.theory p,.theory li{font-size:16px;line-height:1.7;margin:0 0 12px}
.theory strong{font-weight:600}
.katex-display{margin:18px 0;padding:16px;background:var(--soft);border-radius:10px;overflow-x:auto}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
.cards div{border:1px solid var(--rule);border-radius:10px;padding:14px}
.cards span{display:block;font:600 11px Inter;letter-spacing:.06em;text-transform:uppercase;opacity:.55;margin-bottom:8px}
.cards b{font-weight:400;font-size:20px}
.cards p{font-size:13px!important;opacity:.7;margin:6px 0 0!important}
.theme{display:inline-flex;justify-self:end;border:1px solid var(--rule);border-radius:8px;padding:2px;margin-bottom:10px}.theme button{font:500 12px Inter;border:0;background:transparent;color:inherit;padding:5px 10px;border-radius:6px;cursor:pointer;opacity:.6}.theme button[aria-pressed="true"]{background:var(--soft);opacity:1}
ol.q{padding-left:20px}ol.q li::marker{color:var(--acc);font-weight:700}
.ref{font-size:13px;opacity:.55}
@media (max-width:900px){.hero{grid-template-columns:1fr;padding-top:48px}.meta{text-align:left}.hero h1{font-size:52px}.lab{grid-template-columns:1fr}.side{position:static}.theory{grid-template-columns:1fr}.theory h2,.theory .body{grid-column:1}.cards{grid-template-columns:1fr}.ck-stats{grid-template-columns:repeat(2,1fr)}}
</style>`;

export const THEME_BOOT = `<script>(function(){var q=matchMedia("(prefers-color-scheme: dark)");function pref(){try{return localStorage.getItem("ck-theme")||"system"}catch(e){return "system"}}function apply(){var p=pref(),t=p==="system"?(q.matches?"dark":"light"):p;document.body.dataset.theme=t;document.documentElement.style.colorScheme=t;document.querySelectorAll("[data-theme-set]").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.themeSet===p)})}apply();q.addEventListener("change",apply);document.addEventListener("click",function(e){var b=e.target.closest("[data-theme-set]");if(!b)return;try{localStorage.setItem("ck-theme",b.dataset.themeSet)}catch(x){}apply()});document.addEventListener("DOMContentLoaded",apply)})();</script>`;

const KATEX = `<script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js"></script><script defer src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]})"></script>`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function pseudoHtml(lines) {
  return lines.map((l, i) => `<div data-line="${i}"><span class="ln">${i + 1}</span>${l}</div>`).join("");
}

export function lessonPage({ unit, week, title, accent, lede, refs, figure, controls, pseudo, stateLabel, theory, script }) {
  const h1 = accent ? title.replace(accent, `<span>${accent}</span>`) : title;
  const hero = `<div class="lz"><header class="hero"><div><div class="kicker"><a href="../">Estructura de Datos Avanzadas</a> · Unidad ${unit} · Semana ${String(week).padStart(2, "0")}</div><h1>${h1}</h1><p class="lede">${lede}</p></div><div class="meta"><div class="theme" role="group" aria-label="Tema"><button data-theme-set="system">Sistema</button><button data-theme-set="light">Claro</button><button data-theme-set="dark">Oscuro</button></div><span>UNMSM · FISI</span><span>2026-II</span>${refs ? `<span>${refs}</span>` : ""}</div></header></div>`;
  const side = `<aside class="side"><div class="panel"><h3><span>Pseudocódigo</span><span>línea activa</span></h3><div class="ck-code">${pseudo}</div></div><div class="panel"><h3><span>Estado</span><span>${stateLabel ?? ""}</span></h3><div class="ck-log" data-log aria-live="polite"></div><div class="ck-stats" data-stats></div><div class="ck-tables" data-tables></div></div></aside>`;
  const body = THEME_BOOT + CSS + hero + `<div class="lz lab"><div>${figure}${controls}</div>${side}</div><div class="lz theory">${theory}</div>` + KATEX;
  return k.pageHtml({ title: esc(title), theme: "dark", body, script }).replace('lang="en"', 'lang="es"');
}

export function section(n, title, html) {
  return `<section><h2><small>${String(n).padStart(2, "0")}</small>${title}</h2><div class="body">${html}</div></section>`;
}
