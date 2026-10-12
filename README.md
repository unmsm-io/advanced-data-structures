# Advanced Data Structures, UNMSM 2026-II

Every week of the syllabus as an interactive machine: the mechanism moves, the pseudocode line that runs lights up, and the theory sits beside it. English and Spanish.

```bash
bun install
bun run dev     # http://localhost:4321/en/
bun run build   # static site in dist/
```

- `src/lessons/index.mjs`: the 16 weeks and which ones have a machine.
- `src/lessons/<name>.mjs`: one machine: geometry (server), live code (client), and the lesson text in both languages.
- `src/lib/shell.mjs`, `src/lib/runtime.js`, `src/lib/parts.mjs`: the lab layout, the client runtime and shared bench parts.
- `vendor/anatomy/`: the [Anatomy](https://skills.wheresryan.sh/anatomy) kit (MIT, Ryan @wheresryan22), vendored.
