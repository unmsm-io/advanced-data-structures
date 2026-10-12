# Estructura de Datos Avanzadas, UNMSM 2026-II

Cada semana del sílabo como una máquina interactiva: figura, pseudocódigo en vivo y teoría.

```bash
bun run build   # escribe dist/
```

- `lib/syllabus.mjs`: las 16 semanas y su máquina; `slug` marca las que ya existen.
- `lib/lesson.mjs`: el layout de lección (hero, laboratorio, teoría, tema, KaTeX).
- `lessons/NN-slug/build.mjs`: una figura y su lección. Agregar una es crear la carpeta y poner `slug` en el sílabo.
- `vendor/anatomy/`: kit de [Anatomy](https://skills.wheresryan.sh/anatomy) (MIT, Ryan @wheresryan22), vendorizado.
