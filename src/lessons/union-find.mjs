// Week 04: disjoint sets. Ten posts; a wire runs from each post to its parent. Post height = rank.
import { bench, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const N = 10, BASE_H = 14, RANK_H = 9;
const SPOTS = Array.from({ length: N }, (_, i) => [-80 + (i % 5) * 40, i < 5 ? -22 : 22]);
const PLATE = { x: -112, y: -50, w: 224, d: 100, r: 8 };
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [-80, -22, 70], [80, 22, 70]], 640, 340, { pad: 28, azimuth: 40 });

function sockets() {
  const out = [];
  for (const [x, y] of [...SPOTS].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))) {
    out.push(S(k.cylinder(x, y, 9, 0, 2.4, P, 32, 0.4), { tone: "mid" }));
    out.push(L(k.ring(x, y, 6.6, 2.4, P, 28), { tone: "lo" }));
    out.push(D([0, 1, 2, 3].map((q) => k.iso([x + Math.cos(q * Math.PI / 2 + 0.785) * 7.8, y + Math.sin(q * Math.PI / 2 + 0.785) * 7.8, 2.4], P)), { size: 0.4 }));
  }
  return out.join("");
}
const svg = k.figureSvg({ width: 640, height: 340, label: "Union-Find machine", body: [
  bench(P, PLATE, { label: { x: 50, y: 36, w: 40, d: 10, r: 1.5 } }), sockets(), layers("posts"), layers("wires"),
] });

const code = String.raw`
const postsL=layer("posts"),wiresL=layer("wires");
let parent=[],rank=[],H=[],finds=0,steps=0;
const posts=SPOTS.map(([x,y],i)=>{const e=art("",postsL);e.pos=[x,y,0];return e});sortBy(postsL);
const wires=SPOTS.map(()=>{const p=document.createElementNS(NS,"path");p.setAttribute("class","iso-line");p.setAttribute("data-tone","mid");p.style.strokeWidth="1.2";p.style.fill="none";wiresL.appendChild(p);return p});
const top=i=>[SPOTS[i][0],SPOTS[i][1],2.4+H[i]+2.4];
function drawPost(i,on){const [x,y]=SPOTS[i],h=H[i],root=parent[i]===i;posts[i].innerHTML=solidSvg(cylinder(x,y,2.6,2.4,h,P,20),{tone:"mid",crease:"none"})+solidSvg(cylinder(x,y,root?5:3.6,2.4+h,2.4,P,24,.4),{tone:root?"hi":"mid",lit:on})+lineSvg(ring(x,y,root?3:2,4.8+h,P,16),{tone:"lo"})}
function curve(a,b,lift){const pts=[];for(let s=0;s<=16;s++){const u=s/16;pts.push([a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u+lift*4*u*(1-u)])}return poly(pts)}
function drawWire(i,target=parent[i],mix=1,on=false){const w=wires[i];if(target===i&&mix===1){w.setAttribute("d","");return}const a=top(i),b=top(target);w.setAttribute("d",curve(a,b,10+Math.hypot(a[0]-b[0],a[1]-b[1])*.18));w.setAttribute("data-tone",on?"lit":"mid")}
function drawAll(){for(let i=0;i<N;i++){drawPost(i,false);drawWire(i)}}
function render(path=[]){const roots=new Set(Array.from({length:N},(_,i)=>root(i)));tables(cells("parent","",parent,j=>path.includes(j))+cells("rank","",rank));stats([[U.sets,roots.size],[U.maxRank,Math.max(...rank)],["finds",finds],[U.avg,finds?(steps/finds).toFixed(2):"0"]])}
function root(i){while(parent[i]!==i)i=parent[i];return i}
async function find(x,compress=true){hl(0);const path=[x];let r=x;while(parent[r]!==r){hl(1);r=parent[r];path.push(r)}
 for(let s=0;s<path.length;s++){drawPost(path[s],true);if(s<path.length-1)drawWire(path[s],parent[path[s]],1,true);await wait(260)}
 finds++;steps+=path.length-1;say(fmt(U.findSay,{x,r,n:path.length-1}));
 if(compress&&path.length>2){hl(2);log(fmt(U.compressLog,{p:path.join(" → "),r}));
  await Promise.all(path.slice(0,-2).map(v=>{const from=top(parent[v]),to=top(r);return animate(520,e=>{const b=[from[0]+(to[0]-from[0])*e,from[1]+(to[1]-from[1])*e,from[2]+(to[2]-from[2])*e];wires[v].setAttribute("d",curve(top(v),b,10+Math.hypot(top(v)[0]-b[0],top(v)[1]-b[1])*.18))}).then(()=>{parent[v]=r})}))}
 else log(fmt(U.findLog,{p:path.join(" → "),r}));
 hl(3);drawAll();render(path);return r}
async function union(a,b){log(fmt(U.unionLog,{a,b}));let ra=await find(a),rb=await find(b);hl(4);
 if(ra===rb){say(fmt(U.same,{a,b}));return}
 if(rank[ra]<rank[rb])[ra,rb]=[rb,ra];hl(5);parent[rb]=ra;
 if(rank[ra]===rank[rb]){hl(6);rank[ra]++;const from=H[ra];await animate(360,e=>{H[ra]=from+RANK_H*e;drawPost(ra,true);for(let i=0;i<N;i++)drawWire(i)})}
 drawAll();flash(posts[ra]);render([ra,rb]);say(fmt(U.unionSay,{a:rb,b:ra}));}
function reset(){parent=Array.from({length:N},(_,i)=>i);rank=Array(N).fill(0);H=Array(N).fill(BASE_H);finds=0;steps=0;drawAll();render();say(U.empty);log(U.intro)}
const rnd=()=>Math.floor(Math.random()*N);
const two=()=>{const v=(input()||"").split(/[ ,]+/).map(Number).filter(n=>n>=0&&n<N);return v};
bind({union:()=>{let a=rnd(),b=rnd();while(b===a)b=rnd();return union(a,b)},uni:()=>{const [a,b]=two();if(b!==undefined)return union(a,b)},fnd:()=>{const [a]=two();if(a!==undefined)return find(a)},reset});
reset();
startTour(async()=>{const roots=new Set(Array.from({length:N},(_,i)=>root(i)));if(roots.size===1){await find(rnd());await wait(800);reset();return}Math.random()<.7?await union(rnd(),rnd()):await find(rnd())});
`;

const TEXT = {
  en: {
    title: "Union-Find", accent: "Find", machine: "Posts wired to their parents",
    lede: "Keep a partition of elements under <strong>union</strong> and <strong>find</strong>. Two small rules, union by rank and path compression, make each operation cost <strong>α(n)</strong>: at most 4 for any n you will ever meet.",
    refs: "Tarjan, 1975 · CLRS ch. 19", hint: "Space unites two sets · S slows", keyA: "The find path and its wires", keyB: "10 posts; height = rank, wide cap = root",
    controls: [{ act: "union", label: "Random union", primary: true }, { pair: [["uni", "Union a b"], ["fnd", "Find a"]], placeholder: "3 7" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>Find</b>(x): r ← x", "  while parent[r] ≠ r: r ← parent[r]", "  for v on the path: parent[v] ← r  <i>// compress</i>", "  return r", "<b>Union</b>(a, b): ra ← Find(a), rb ← Find(b)", "  if rank[ra] &lt; rank[rb]: swap; parent[rb] ← ra", "  if ranks were equal: rank[ra] ← rank[ra] + 1"],
    ui: { sets: "sets", maxRank: "max rank", avg: "avg path", findSay: "find({x}) = {r} · {n} hop(s)", findLog: "Find walks {p}; {r} is the root.", compressLog: "Find walks {p}. Path compression: every post on the path now points straight to {r}.", unionLog: "Union({a}, {b}): first find both roots.", same: "{a} and {b} are already in the same set", unionSay: "root {a} hangs under {b}", empty: "10 singletons", intro: "Each post starts as its own set. Union hangs the shorter tree under the taller one." },
    theory: [
      ["The structure", `<p>Each set is a rooted tree stored in an array <code>parent</code>; the root names the set. <strong>Find</strong> climbs to the root, <strong>Union</strong> links two roots.</p>`],
      ["Two heuristics", `<p><strong>Union by rank</strong> hangs the lower-rank root under the higher one, so a tree of rank $r$ has at least $2^r$ nodes and height $O(\\log n)$. <strong>Path compression</strong> repoints every node on a find path to the root.</p>`],
      ["Inverse Ackermann", `<p>With both heuristics, $m$ operations on $n$ elements cost</p>$$O\\big(m \\, \\alpha(n)\\big)$$<p>where $\\alpha$ is the inverse Ackermann function: $\\alpha(n) \\le 4$ for $n < 2^{2^{2^{65536}}}$. Tarjan proved the bound is tight.</p>`],
      ["Binomial heaps", `<p>A forest of binomial trees $B_k$ (with $2^k$ nodes), at most one per order, like the bits of $n$. Merging two heaps is binary addition with carries, so <em>insert</em> and <em>union</em> cost $O(\\log n)$, and insert is $O(1)$ amortized, the same counter as week 01.</p>`],
      ["Fibonacci heaps", `<p>Be lazy: insert and union just append trees; work happens in <em>extract-min</em>, which consolidates. <em>decrease-key</em> cuts the node and marks its parent (cascading cuts), costing $O(1)$ amortized. That is what makes Dijkstra $O(E + V \\log V)$.</p>`],
      ["To discuss", `<ol class="q"><li>Turn off path compression mentally: what is the worst tree height after $n-1$ unions by rank?</li><li>Kruskal's MST uses union-find. Where exactly?</li><li>Why does a Fibonacci heap need the marks?</li></ol>`],
    ],
  },
  es: {
    title: "Union-Find", accent: "Find", machine: "Postes cableados a su padre",
    lede: "Mantener una partición de elementos bajo <strong>unión</strong> y <strong>búsqueda</strong>. Dos reglas pequeñas, unión por rango y compresión de caminos, hacen que cada operación cueste <strong>α(n)</strong>: a lo más 4 para cualquier n que vayas a ver.",
    refs: "Tarjan, 1975 · CLRS cap. 19", hint: "Espacio une dos conjuntos · S lento", keyA: "El camino de find y sus cables", keyB: "10 postes; altura = rango, tapa ancha = raíz",
    controls: [{ act: "union", label: "Unión al azar", primary: true }, { pair: [["uni", "Unir a b"], ["fnd", "Find a"]], placeholder: "3 7" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>Find</b>(x): r ← x", "  mientras parent[r] ≠ r: r ← parent[r]", "  para v en el camino: parent[v] ← r  <i>// comprimir</i>", "  devolver r", "<b>Union</b>(a, b): ra ← Find(a), rb ← Find(b)", "  si rank[ra] &lt; rank[rb]: swap; parent[rb] ← ra", "  si los rangos eran iguales: rank[ra] ← rank[ra] + 1"],
    ui: { sets: "conjuntos", maxRank: "rango máx", avg: "camino prom", findSay: "find({x}) = {r} · {n} salto(s)", findLog: "Find recorre {p}; {r} es la raíz.", compressLog: "Find recorre {p}. Compresión de caminos: cada poste del camino ahora apunta directo a {r}.", unionLog: "Union({a}, {b}): primero se buscan ambas raíces.", same: "{a} y {b} ya están en el mismo conjunto", unionSay: "la raíz {a} cuelga de {b}", empty: "10 conjuntos unitarios", intro: "Cada poste empieza como su propio conjunto. La unión cuelga el árbol más bajo del más alto." },
    theory: [
      ["La estructura", `<p>Cada conjunto es un árbol con raíz guardado en un arreglo <code>parent</code>; la raíz nombra al conjunto. <strong>Find</strong> sube hasta la raíz, <strong>Union</strong> enlaza dos raíces.</p>`],
      ["Dos heurísticas", `<p><strong>Unión por rango</strong> cuelga la raíz de menor rango bajo la de mayor, así un árbol de rango $r$ tiene al menos $2^r$ nodos y altura $O(\\log n)$. <strong>Compresión de caminos</strong> hace que cada nodo del camino de un find apunte a la raíz.</p>`],
      ["Inversa de Ackermann", `<p>Con ambas heurísticas, $m$ operaciones sobre $n$ elementos cuestan</p>$$O\\big(m \\, \\alpha(n)\\big)$$<p>donde $\\alpha$ es la inversa de la función de Ackermann: $\\alpha(n) \\le 4$ para $n < 2^{2^{2^{65536}}}$. Tarjan probó que la cota es ajustada.</p>`],
      ["Heaps binomiales", `<p>Un bosque de árboles binomiales $B_k$ (con $2^k$ nodos), a lo más uno por orden, como los bits de $n$. Mezclar dos heaps es sumar en binario con acarreos, así que <em>insertar</em> y <em>unir</em> cuestan $O(\\log n)$, e insertar es $O(1)$ amortizado: el mismo contador de la semana 01.</p>`],
      ["Heaps de Fibonacci", `<p>Ser perezoso: insertar y unir solo agregan árboles; el trabajo ocurre en <em>extract-min</em>, que consolida. <em>decrease-key</em> corta el nodo y marca a su padre (cortes en cascada), con costo $O(1)$ amortizado. Eso hace a Dijkstra $O(E + V \\log V)$.</p>`],
      ["Para discutir", `<ol class="q"><li>Apaga mentalmente la compresión: ¿cuál es la peor altura tras $n-1$ uniones por rango?</li><li>El MST de Kruskal usa union-find. ¿Dónde exactamente?</li><li>¿Por qué un heap de Fibonacci necesita las marcas?</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "union-find", fig: "Fig 4", P, svg, consts: { N, BASE_H, RANK_H, SPOTS }, code, TEXT, stateLabel: "α(n) ≤ 4" }, UI);
