// Lesson shell: hero, lab (figure + side panels), theory sections.
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";
import KIT from "../../vendor/anatomy/kit/iso-kit.mjs?raw";
import RUNTIME from "./runtime.js?raw";

const kitScript = () => KIT.replace(/^export /gm, "");
export const pad2 = (n) => String(n).padStart(2, "0");
export const pseudoHtml = (lines) => lines.map((l, i) => `<div data-line="${i}"><span class="ln">${i + 1}</span>${l}</div>`).join("");
export const section = (n, title, html) => `<section><h2><small>${pad2(n)}</small>${title}</h2><div class="body">${html}</div></section>`;

export function controlsHtml(u, buttons) {
  const b = (act, label, cls = "") => `<button${cls ? ` class="${cls}"` : ""} data-act="${act}">${label}</button>`;
  const parts = buttons.map((x) => {
    if (x.pair) return `<div class="ck-pair"><input data-key type="${x.type ?? "text"}" placeholder="${x.placeholder}">${x.pair.map(([a, l]) => b(a, l)).join("")}</div>`;
    return b(x.act, x.primary ? `${x.label} <kbd>${u.space}</kbd>` : x.label, x.primary ? "pri" : x.ghost ? "ghost" : "");
  });
  parts.push(`<button data-act="slow">${u.slowOff} <kbd>S</kbd></button>`);
  return `<div class="ck-controls">${parts.join("")}</div>`;
}

export function labHtml({ u, fig, title, hint, readout, keys, svg, controls, pseudo, stateLabel }) {
  const figure = k.plateHtml({ fig, title, hint, readout, keys, caption: "", body: `<div class="iso-stage" tabindex="0" role="img" aria-label="${title}">${svg}</div>` });
  const side = `<aside class="side"><div class="panel"><h3><span>${u.pseudocode}</span><span>${u.activeLine}</span></h3><div class="ck-code">${pseudoHtml(pseudo)}</div></div><div class="panel"><h3><span>${u.state}</span><span>${stateLabel ?? ""}</span></h3><div class="ck-log" data-log aria-live="polite"></div><div class="ck-stats" data-stats></div><div class="ck-tables" data-tables></div></div></aside>`;
  return `<div class="lz lab"><div>${figure}${controls}</div>${side}</div>`;
}

export function liveScript({ P, u, consts = {}, code }) {
  const head = `const P=${JSON.stringify(P)};const U=${JSON.stringify(u)};` + Object.entries(consts).map(([n, v]) => `const ${n}=${JSON.stringify(v)};`).join("");
  return (kitScript() + head + RUNTIME + code).replace(/<\/(script)/gi, "<\\/$1");
}
