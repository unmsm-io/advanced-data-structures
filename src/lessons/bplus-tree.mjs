// Week 13: B+ tree of order 4. Trays on stepped shelves: leaves in front, linked by a rail; splits copy a key up.
import { bench, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const MAXK = 3, SLOT = 15, STEP = [[40, 0], [10, 18], [-20, 36], [-50, 54]];
const PLATE = { x: -128, y: -70, w: 256, d: 130, r: 8 };
function shelves() {
  const out = [];
  STEP.slice(1).forEach(([y, z], i) => out.push(S(k.slabOf({ x: -120, y: y - 10, w: 240, d: 30, r: 2 }, 0, z, P, 4, 0.6), { tone: i % 2 ? "lo" : "mid" })));
  out.push(S(k.slabOf({ x: -118, y: STEP[0][0] + 9, w: 236, d: 4, r: 1 }, 0, 2, P, 3), { tone: "lo", crease: "none" }));
  return out.reverse().join("");
}
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [-120, -60, 64], [120, -60, 64]], 660, 360, { pad: 22, azimuth: 62, elevation: 32 });
const svg = k.figureSvg({ width: 660, height: 360, label: "B+ tree shelves", body: [bench(P, PLATE), shelves(), layers("trays"), layers("air")] });

const code = String.raw`
const traysL=layer("trays"),airL=layer("air");
let root,ios=0,splits=0,keys=[];
const leaf=()=>({leaf:true,keys:[],next:null}),inner=()=>({leaf:false,keys:[],kids:[]});
function layout(){const levels=[];(function w(n,d){(levels[d]=levels[d]||[]).push(n);if(!n.leaf)n.kids.forEach(c=>w(c,d+1))})(root,0);
 const H=levels.length;levels.forEach((lv,d)=>{const lvl=H-1-d,gap=6,tw=MAXK*SLOT+4,total=lv.length*tw+(lv.length-1)*gap;lv.forEach((n,i)=>{n.x=-total/2+i*(tw+gap);n.y=STEP[lvl][0];n.z=STEP[lvl][1];n.lvl=lvl})});return levels}
function trayArt(n,on){const w=MAXK*SLOT+4,pl={x:n.x,y:n.y-8,w,d:16,r:1.4};let s=solidSvg(slabOf(pl,n.z,3,P,3,.4),{tone:n.leaf?"mid":"lo",lit:on});
 for(let i=0;i<MAXK;i++){const cx=n.x+2+i*SLOT+SLOT/2;s+=lineSvg(planOutline({x:cx-6.4,y:n.y-6,w:12.8,d:12,r:1},n.z+3,P,2),{tone:"faint"});
  if(n.keys[i]!==undefined)s+=solidSvg(slabOf({x:cx-6,y:n.y-5.6,w:12,d:11.2,r:1},n.z+3,3,P,2,.3),{tone:"hi",lit:on})+faceTextSvg(topMatrix([cx,n.y+1.8],n.z+6,P,"x"),String(n.keys[i]),{size:7,tone:"lo",anchor:"middle"})}
 return s}
function draw(on=[]){traysL.innerHTML="";const lv=layout();
 for(const level of lv)for(const n of level){if(n.leaf&&n.next){const a=[n.x+MAXK*SLOT+4,n.y+5,n.z+1.5],b=[n.next.x,n.next.y+5,n.z+1.5];traysL.insertAdjacentHTML("beforeend",lineSvg(seg(a,b),{tone:"mid"}))}
  if(!n.leaf)n.kids.forEach((c,i)=>{const a=[n.x+2+Math.min(i,MAXK)*SLOT,n.y+6,n.z],b=[c.x+(MAXK*SLOT+4)/2,c.y-6,c.z+3];traysL.insertAdjacentHTML("beforeend",lineSvg(seg(a,b),{tone:on.includes(c)?"lit":"lo"}))});
  const g=art(trayArt(n,on.includes(n)),traysL);g.pos=[n.x,n.y,n.z]}}
function findLeaf(k){let n=root;const path=[n];while(!n.leaf){let i=0;while(i<n.keys.length&&k>=n.keys[i])i++;n=n.kids[i];path.push(n)}return path}
async function insert(k){if(keys.includes(k)){say(fmt(U.dup,{k}));return}hl(0);const path=findLeaf(k);ios=path.length;
 for(let i=0;i<path.length;i++){draw(path.slice(0,i+1));await wait(260)}
 const lf=path[path.length-1];hl(1);lf.keys.push(k);lf.keys.sort((a,b)=>a-b);keys.push(k);draw([lf]);await wait(300);
 let n=lf,up=null,made=0;
 for(let d=path.length-1;d>=0;d--){n=path[d];if(n.keys.length<=MAXK)break;hl(2);made++;splits++;
  const mid=Math.ceil(n.keys.length/2),right=n.leaf?leaf():inner();let sep;
  if(n.leaf){right.keys=n.keys.splice(mid);sep=right.keys[0];right.next=n.next;n.next=right}else{sep=n.keys[mid-1+ (n.keys.length%2?0:0)];const m=Math.floor(n.keys.length/2);sep=n.keys[m];right.keys=n.keys.splice(m+1);n.keys.pop();right.kids=n.kids.splice(m+1)}
  hl(3);if(d===0){const r=inner();r.keys=[sep];r.kids=[n,right];root=r;hl(4)}else{const p=path[d-1],i=p.kids.indexOf(n);p.keys.splice(i,0,sep);p.kids.splice(i+1,0,right)}
  draw([n,right]);await wait(420)}
 draw();render();say(made?fmt(U.splitSay,{k,s:made}):fmt(U.insSay,{k}));log(made?fmt(U.splitLog,{k,s:made,h:layout().length}):fmt(U.insLog,{k,io:ios}))}
async function rangeScan(a,b){hl(6);const path=findLeaf(a);for(let i=0;i<path.length;i++){draw(path.slice(0,i+1));await wait(220)}
 let n=path[path.length-1],out=[],hops=0,lit=[n];while(n){hl(7);draw([...path,...lit]);await wait(300);for(const k of n.keys)if(k>=a&&k<=b)out.push(k);if(n.keys.length&&n.keys[n.keys.length-1]>b)break;n=n.next;if(n){hops++;lit.push(n)}}
 say(fmt(U.rangeSay,{a,b,n:out.length}));log(fmt(U.rangeLog,{a,b,r:out.join(", ")||"∅",d:path.length,h:hops}));setTimeout(()=>draw(),2000*slow)}
function render(){const lv=layout();tables('<div class="mono">'+U.sorted+": "+[...keys].sort((a,b)=>a-b).join(" ")+"</div>");stats([["n",keys.length],[U.height,lv.length],[U.nodes,lv.flat().length],[U.splitsN,splits]])}
function reset(){root=leaf();keys=[];splits=0;draw();render();say(U.empty);log(U.intro)}
const rnd=()=>{let x;do x=1+Math.floor(Math.random()*98);while(keys.includes(x));return x};
const nums=()=>(input()||"").split(/[^0-9]+/).filter(Boolean).map(Number);
bind({insert:()=>insert(rnd()),add:()=>{const [v]=nums();if(v)return insert(v)},range:()=>{const [a,b]=nums();if(b)return rangeScan(Math.min(a,b),Math.max(a,b))},scan:()=>{const a=Math.floor(Math.random()*60);return rangeScan(a,a+30)},reset});
reset();
startTour(async()=>{if(keys.length>=16){const a=Math.floor(Math.random()*50);await rangeScan(a,a+35);await wait(800);reset();return}keys.length>6&&Math.random()<.2?await rangeScan(20,55):await insert(rnd())});
`;

const TEXT = {
  en: {
    title: "B+ trees", accent: "B+", machine: "Trays on stepped shelves, leaves on a rail",
    lede: "Built for disks: each node fills a block, so a lookup reads <strong>O(log<sub>B</sub> n)</strong> blocks. Keys live in the leaves, which are chained for fast <strong>range scans</strong>; a full node splits and pushes a separator up.",
    refs: "Bayer &amp; McCreight, 1972 · Comer, 1979", hint: "Space inserts a key · S slows", keyA: "The search path and the split trays", keyB: "Order 4: at most 3 keys per tray",
    controls: [{ act: "insert", label: "Insert random key", primary: true }, { pair: [["add", "Insert"], ["range", "Range a b"]], placeholder: "20 60" }, { act: "scan", label: "Random range scan" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>Insert</b>(k): descend to the leaf  <i>// one I/O per level</i>", "  put k in sorted position", "  while node has B keys: split in two", "    leaf: copy first key of the right half up · inner: move the middle key up", "  if the root split: new root, height + 1", "", "<b>Range</b>(a, b): descend to the leaf of a", "  walk the leaf chain until a key &gt; b"],
    ui: { height: "height", nodes: "nodes", splitsN: "splits", sorted: "keys", dup: "{k} is already stored", insSay: "{k} inserted", insLog: "Insert {k}: {io} node read(s), one per level, and the leaf had room.", splitSay: "{k} inserted · {s} split(s)", splitLog: "Insert {k} overflowed: {s} split(s) pushed separators up. Height is now {h}; all leaves stay at the same depth.", rangeSay: "[{a}, {b}]: {n} key(s)", rangeLog: "Range [{a}, {b}] → {r}. {d} reads to reach the first leaf, then {h} hop(s) along the leaf chain.", empty: "empty tree", intro: "Every node holds up to 3 keys. Insert until a leaf overflows and watch the split travel up." },
    theory: [
      ["The I/O model", `<p>Memory is fast, disk is slow and moves data in blocks of $B$ items. Cost is the number of block transfers. A binary search tree costs $O(\\log_2 n)$ I/Os; a tree with fan-out $B$ costs</p>$$O(\\log_B n)$$<p>With $B = 256$, a billion keys fit in 4 levels.</p>`],
      ["B-trees and (a, b)-trees", `<p>Every node except the root has between $a$ and $b$ children with $2 \\le a$ and $b \\ge 2a - 1$. Inserts split full nodes, deletes merge or borrow, and all leaves stay at the same depth. A B-tree of order $m$ is an $(\\lceil m/2 \\rceil, m)$-tree.</p>`],
      ["B+ trees", `<p>Internal nodes keep only separators, so they fit more pointers; all records live in the leaves, which form a linked list. A range query of $k$ results costs $O(\\log_B n + k/B)$ I/Os. Every relational database index is a B+ tree.</p>`],
      ["LSM trees", `<p>For write-heavy workloads, buffer inserts in memory (a memtable), flush sorted runs to disk and <strong>compact</strong> them in the background. Writes become sequential; reads check several runs, helped by Bloom filters (week 03). RocksDB, Cassandra and LevelDB work this way.</p>`],
      ["To discuss", `<ol class="q"><li>With blocks of 4 KB and 16-byte entries, what is $B$? How many levels for $10^9$ keys?</li><li>Why do B+ tree leaves need the next pointer?</li><li>When would you choose an LSM tree over a B+ tree?</li></ol>`],
    ],
  },
  es: {
    title: "B+ trees", accent: "B+", machine: "Bandejas en repisas escalonadas, hojas en un riel",
    lede: "Hecho para discos: cada nodo llena un bloque, así que una búsqueda lee <strong>O(log<sub>B</sub> n)</strong> bloques. Las llaves viven en las hojas, encadenadas para <strong>recorridos por rango</strong> rápidos; un nodo lleno se parte y sube un separador.",
    refs: "Bayer &amp; McCreight, 1972 · Comer, 1979", hint: "Espacio inserta una llave · S lento", keyA: "El camino de búsqueda y las bandejas que se parten", keyB: "Orden 4: a lo más 3 llaves por bandeja",
    controls: [{ act: "insert", label: "Insertar llave", primary: true }, { pair: [["add", "Insertar"], ["range", "Rango a b"]], placeholder: "20 60" }, { act: "scan", label: "Rango al azar" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>Insertar</b>(k): bajar a la hoja  <i>// un I/O por nivel</i>", "  poner k en su posición ordenada", "  mientras el nodo tenga B llaves: partir en dos", "    hoja: copiar arriba la 1.ª llave de la mitad der · interno: subir la del medio", "  si la raíz se partió: raíz nueva, altura + 1", "", "<b>Rango</b>(a, b): bajar a la hoja de a", "  recorrer la cadena de hojas hasta una llave &gt; b"],
    ui: { height: "altura", nodes: "nodos", splitsN: "splits", sorted: "llaves", dup: "{k} ya está guardada", insSay: "{k} insertada", insLog: "Insertar {k}: {io} lectura(s) de nodo, una por nivel, y la hoja tenía espacio.", splitSay: "{k} insertada · {s} split(s)", splitLog: "Insertar {k} desbordó: {s} split(s) subieron separadores. La altura ahora es {h}; todas las hojas siguen a la misma profundidad.", rangeSay: "[{a}, {b}]: {n} llave(s)", rangeLog: "Rango [{a}, {b}] → {r}. {d} lecturas para llegar a la primera hoja y {h} salto(s) por la cadena de hojas.", empty: "árbol vacío", intro: "Cada nodo guarda hasta 3 llaves. Inserta hasta que una hoja desborde y mira cómo el split sube." },
    theory: [
      ["El modelo I/O", `<p>La memoria es rápida, el disco es lento y mueve datos en bloques de $B$ elementos. El costo es la cantidad de transferencias de bloques. Un BST cuesta $O(\\log_2 n)$ I/Os; un árbol con grado $B$ cuesta</p>$$O(\\log_B n)$$<p>Con $B = 256$, mil millones de llaves caben en 4 niveles.</p>`],
      ["B-trees y (a, b)-trees", `<p>Todo nodo salvo la raíz tiene entre $a$ y $b$ hijos con $2 \\le a$ y $b \\ge 2a - 1$. Insertar parte nodos llenos, borrar fusiona o presta, y todas las hojas quedan a la misma profundidad. Un B-tree de orden $m$ es un $(\\lceil m/2 \\rceil, m)$-tree.</p>`],
      ["B+ trees", `<p>Los nodos internos guardan solo separadores, así caben más punteros; todos los registros viven en las hojas, que forman una lista enlazada. Una consulta de rango con $k$ resultados cuesta $O(\\log_B n + k/B)$ I/Os. Todo índice de base de datos relacional es un B+ tree.</p>`],
      ["LSM trees", `<p>Para cargas con muchas escrituras: se acumulan inserciones en memoria (memtable), se vuelcan corridas ordenadas a disco y se <strong>compactan</strong> en segundo plano. Las escrituras se vuelven secuenciales; las lecturas revisan varias corridas, ayudadas por filtros de Bloom (semana 03). RocksDB, Cassandra y LevelDB funcionan así.</p>`],
      ["Para discutir", `<ol class="q"><li>Con bloques de 4 KB y entradas de 16 bytes, ¿cuánto vale $B$? ¿Cuántos niveles para $10^9$ llaves?</li><li>¿Por qué las hojas de un B+ tree necesitan el puntero al siguiente?</li><li>¿Cuándo elegirías un LSM tree sobre un B+ tree?</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "b-plus-trees", fig: "Fig 13", P, svg, consts: { MAXK, SLOT, STEP }, code, TEXT, stateLabel: "B = 4" }, UI);
