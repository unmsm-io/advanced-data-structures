// Sílabo ED Avanzados 2026-II. `slug` marks a week that has a built lesson.
export const UNITS = [
  { n: "I", title: "Hashing avanzado y estructuras probabilísticas", weeks: [
    { w: 1, topic: "Complejidad amortizada, modelos RAM y Word-RAM", machine: "Contador binario con alcancía de potencial" },
    { w: 2, topic: "Universal, perfect y cuckoo hashing", machine: "Dos repisas, tolva y perillas de semilla", slug: "02-cuckoo" },
    { w: 3, topic: "Bloom, counting Bloom, HyperLogLog, LSH", machine: "Tablero de k martillos sobre bits" },
    { w: 4, topic: "Union-Find, heaps binomiales y de Fibonacci", machine: "Ascensores que comprimen el camino" },
  ] },
  { n: "II", title: "Estructuras para texto e indexación", weeks: [
    { w: 5, topic: "Trie, Patricia, Radix", machine: "Clasificador postal por prefijo" },
    { w: 6, topic: "Suffix tree, suffix array, pattern matching", machine: "Rueda de sufijos con cursor binario" },
    { w: 7, topic: "Inverted index, posting lists, compresión", machine: "Fichero de tarjetas perforadas" },
    { w: 8, topic: "Examen parcial" },
  ] },
  { n: "III", title: "Estructuras espaciales y geometría computacional", weeks: [
    { w: 9, topic: "Segment trees, range queries, lazy propagation", machine: "Torre de esclusas" },
    { w: 10, topic: "Interval trees, range trees", machine: "Riel de reglas solapadas con palpador" },
    { w: 11, topic: "KD-trees, nearest neighbor", machine: "Mesa de guillotinas alternas" },
    { w: 12, topic: "Quadtrees, R-trees, R*-trees", machine: "Mapa de marcos que se parten" },
  ] },
  { n: "IV", title: "Memoria externa, persistencia y sistemas distribuidos", weeks: [
    { w: 13, topic: "Modelo I/O, B-trees, B+ trees, LSM", machine: "Archivador con prensa de compactación" },
    { w: 14, topic: "Persistencia parcial, total y confluente", machine: "Libro de copias con hojas de calco" },
    { w: 15, topic: "DHT, consistent hashing, skip graphs", machine: "Anillo giratorio de nodos" },
    { w: 16, topic: "Proyecto final y examen" },
  ] },
];
