export const LANGS = ["en", "es"];
export const UI = {
  en: {
    course: "Advanced Data Structures", courseAccent: "Data Structures", school: "UNMSM · FISI · 2026-II",
    lede: "Every week of the syllabus as a machine you can touch: watch the mechanism move, follow the pseudocode line that runs, keep the theory beside it.",
    ready: "{done} of {total} machines ready", unit: "Unit", week: "Week", open: "Open →", soon: "Coming soon",
    pseudocode: "Pseudocode", activeLine: "active line", state: "State", space: "Space", slowOff: "Slow: off", slowOn: "Slow: on",
    themeSystem: "System", themeLight: "Light", themeDark: "Dark", credits: "Figures built with Anatomy (MIT)",
    prev: "Previous", next: "Next", back: "All weeks", reset: "Reset",
  },
  es: {
    course: "Estructura de Datos Avanzadas", courseAccent: "Avanzadas", school: "UNMSM · FISI · 2026-II",
    lede: "Cada semana del sílabo como una máquina que se puede tocar: el mecanismo se ve moverse, el pseudocódigo marca la línea que corre y la teoría queda al lado.",
    ready: "{done} de {total} máquinas listas", unit: "Unidad", week: "Semana", open: "Abrir →", soon: "Próximamente",
    pseudocode: "Pseudocódigo", activeLine: "línea activa", state: "Estado", space: "Espacio", slowOff: "Lento: no", slowOn: "Lento: sí",
    themeSystem: "Sistema", themeLight: "Claro", themeDark: "Oscuro", credits: "Figuras hechas con Anatomy (MIT)",
    prev: "Anterior", next: "Siguiente", back: "Todas las semanas", reset: "Reiniciar",
  },
};
export const fmt = (s, v = {}) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
