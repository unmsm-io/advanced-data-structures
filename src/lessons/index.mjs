// Syllabus: 16 weeks, 4 units. `lesson` is the module for weeks that have a machine.
import cuckoo from "./cuckoo.mjs";
import amortized from "./amortized.mjs";
import bloom from "./bloom.mjs";
import unionFind from "./union-find.mjs";
import trie from "./trie.mjs";
import suffixArray from "./suffix-array.mjs";
import invertedIndex from "./inverted-index.mjs";
import segmentTree from "./segment-tree.mjs";
import intervalTree from "./interval-tree.mjs";
import kdTree from "./kd-tree.mjs";
import quadtree from "./quadtree.mjs";
import bplus from "./bplus-tree.mjs";

const t = (en, es) => ({ en, es });
export const UNITS = [
  { n: "I", title: t("Advanced hashing and probabilistic structures", "Hashing avanzado y estructuras probabilísticas"), weeks: [
    { w: 1, topic: t("Amortized complexity, RAM and Word-RAM models", "Complejidad amortizada, modelos RAM y Word-RAM"), lesson: amortized },
    { w: 2, topic: t("Universal, perfect and cuckoo hashing", "Hashing universal, perfecto y cuckoo"), lesson: cuckoo },
    { w: 3, topic: t("Bloom, counting Bloom, HyperLogLog, LSH", "Bloom, counting Bloom, HyperLogLog, LSH"), lesson: bloom },
    { w: 4, topic: t("Union-Find, binomial and Fibonacci heaps", "Union-Find, heaps binomiales y de Fibonacci"), lesson: unionFind },
  ] },
  { n: "II", title: t("Structures for text and indexing", "Estructuras para texto e indexación"), weeks: [
    { w: 5, topic: t("Trie, Patricia, Radix", "Trie, Patricia, Radix"), lesson: trie },
    { w: 6, topic: t("Suffix tree, suffix array, pattern matching", "Suffix tree, suffix array, pattern matching"), lesson: suffixArray },
    { w: 7, topic: t("Inverted index, posting lists, compression", "Índice invertido, posting lists, compresión"), lesson: invertedIndex },
    { w: 8, topic: t("Midterm exam", "Examen parcial") },
  ] },
  { n: "III", title: t("Spatial structures and computational geometry", "Estructuras espaciales y geometría computacional"), weeks: [
    { w: 9, topic: t("Segment trees, range queries, lazy propagation", "Segment trees, range queries, lazy propagation"), lesson: segmentTree },
    { w: 10, topic: t("Interval trees, range trees", "Interval trees, range trees"), lesson: intervalTree },
    { w: 11, topic: t("KD-trees, nearest neighbor search", "KD-trees, búsqueda del vecino más cercano"), lesson: kdTree },
    { w: 12, topic: t("Quadtrees, R-trees, R*-trees", "Quadtrees, R-trees, R*-trees"), lesson: quadtree },
  ] },
  { n: "IV", title: t("External memory, persistence and distributed systems", "Memoria externa, persistencia y sistemas distribuidos"), weeks: [
    { w: 13, topic: t("I/O model, B-trees, B+ trees, LSM", "Modelo I/O, B-trees, B+ trees, LSM"), lesson: bplus },
    { w: 14, topic: t("Partial, full and confluent persistence", "Persistencia parcial, total y confluente") },
    { w: 15, topic: t("DHT, consistent hashing, skip graphs", "DHT, consistent hashing, skip graphs") },
    { w: 16, topic: t("Final project and exam", "Proyecto final y examen") },
  ] },
];
export const WEEKS = UNITS.flatMap((u) => u.weeks.map((w) => ({ ...w, unit: u.n })));
export const LESSONS = WEEKS.filter((w) => w.lesson);
