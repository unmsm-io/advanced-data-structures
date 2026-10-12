// Week 10: centered interval tree. Bars hang in lanes; posts mark node centers; a probe stabs a point.
import { bench, ruler, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const NI = 10, SX = 1.8, XA = -90, LANE = 7.5, YL = -30;
const PLATE = { x: -108, y: -58, w: 216, d: 116, r: 8 };
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [XA, -50, 40], [XA + 100 * SX, -50, 40]], 640, 340, { pad: 22, azimuth: 64 });
const svg = k.figureSvg({ width: 640, height: 340, label: "Interval tree machine", body: [
  bench(P, PLATE), ruler(P, XA, XA + 100 * SX, YL + NI * LANE + 4, { step: 5 * SX, every: 2 }),
  S(k.slabOf({ x: XA - 4, y: -56, w: 100 * SX + 8, d: 8, r: 1.5 }, 0, 3, P, 3, 0.4), { tone: "mid" }),
  layers("posts"), layers("bars"), layers("probe"),
] });

const code = String.raw`
const postsL=layer("posts"),barsL=layer("bars"),probeL=layer("probe");
const X=v=>XA+v*SX;let I=[],root=null,bars=[],posts=[],q=50;
function build(list,d=0){if(!list.length)return null;const pts=list.flatMap(([a,b])=>[a,b]).sort((a,b)=>a-b),c=pts[pts.length>>1];
 const here=list.filter(([a,b])=>a<=c&&c<=b),n={c,d,here:here.map(iv=>I.indexOf(iv)),L:build(list.filter(([a,b])=>b<c),d+1),R:build(list.filter(([a,b])=>a>c),d+1)};return n}
const all=()=>{const out=[];(function w(n){if(!n)return;out.push(n);w(n.L);w(n.R)})(root);return out};
function drawPosts(on=[]){postsL.innerHTML="";for(const n of all()){const h=34-n.d*8,e=art(solidSvg(cylinder(X(n.c),-52,2.2,3,h,P,18),{tone:"mid",crease:"none",lit:on.includes(n)})+solidSvg(cylinder(X(n.c),-52,3.4,3+h,1.8,P,20),{tone:on.includes(n)?"hi":"mid",lit:on.includes(n)}),postsL);e.pos=[X(n.c),-52,0]}sortBy(postsL)}
function drawBar(i,state){const [a,b]=I[i],y=YL+i*LANE;bars[i].innerHTML=solidSvg(slabOf({x:X(a),y:y-2.4,w:(b-a)*SX,d:4.8,r:1.2},4,3,P,3,.3),{tone:state==="hit"?"hi":state==="dim"?"lo":"mid",lit:state==="hit"||state==="check"})+solidSvg(cylinder(X(a)+1.5,y,.9,0,4,P,10),{tone:"lo",crease:"none"})+solidSvg(cylinder(X(b)-1.5,y,.9,0,4,P,10),{tone:"lo",crease:"none"})}
function drawProbe(v){probeL.innerHTML=solidSvg(slabOf({x:X(v)-1,y:YL-6,w:2,d:NI*LANE+6,r:.6},9,1.6,P,2),{tone:"hi",lit:true})+solidSvg(cylinder(X(v),YL-8,3,0,11,P,18),{tone:"hi",lit:true})}
function render(hits=[]){tables('<div class="mono" style="line-height:1.8">'+I.map(([a,b],i)=>(hits.includes(i)?'<b style="display:inline;font:inherit;color:var(--acc)">':"")+"#"+i+" ["+a+", "+b+"]"+(hits.includes(i)?"</b>":"")).join("  ")+"</div>");stats([["n",NI],[U.nodes,all().length],["q",q],[U.hits,hits.length]])}
async function stab(v){q=Math.max(0,Math.min(100,Math.round(v)));hl(0);const from=probeL.pos?.[0]??q;await animate(500,e=>drawProbe(from+(q-from)*e));probeL.pos=[q,0,0];
 I.forEach((_,i)=>drawBar(i,"dim"));const path=[],hits=[];let n=root,checks=0;
 while(n){path.push(n);drawPosts(path);hl(1);await wait(300);
  const order=n.here.slice().sort((a,b)=>q<n.c?I[a][0]-I[b][0]:I[b][1]-I[a][1]);
  for(const i of order){checks++;drawBar(i,"check");await wait(160);const ok=q<n.c?I[i][0]<=q:I[i][1]>=q;if(ok){hits.push(i);drawBar(i,"hit")}else{drawBar(i,"dim");break}}
  hl(q<n.c?2:q>n.c?3:4);n=q<n.c?n.L:q>n.c?n.R:null}
 hl(5);say(fmt(U.say,{q,n:hits.length}));log(fmt(U.log,{q,h:hits.map(i=>"["+I[i].join(", ")+"]").join(" ")||"∅",d:path.length,c:checks}));render(hits);
 setTimeout(()=>{I.forEach((_,i)=>drawBar(i,hits.includes(i)?"hit":"idle"));drawPosts()},1800*slow)}
function reset(){I=Array.from({length:NI},()=>{const a=Math.floor(Math.random()*80),b=a+6+Math.floor(Math.random()*30);return [a,Math.min(100,b)]});root=build(I);barsL.innerHTML="";bars=I.map((_,i)=>{const e=art("",barsL);e.pos=[0,YL+i*LANE,0];return e});I.forEach((_,i)=>drawBar(i,"idle"));sortBy(barsL);drawPosts();drawProbe(q);render();say(U.empty);log(U.intro)}
bind({stab:()=>stab(Math.random()*100),go:()=>{const v=+input();if(!isNaN(v))return stab(v)},left:()=>stab(q-7),right:()=>stab(q+7),reset});
reset();
let n=0;startTour(async()=>{if(++n%6===0)reset();await stab(Math.random()*100)});
`;

const TEXT = {
  en: {
    title: "Interval trees", accent: "trees", machine: "Bars on a rail and a probe that stabs them",
    lede: "Which intervals contain the point q? A centered interval tree answers a <strong>stabbing query</strong> in <strong>O(log n + k)</strong>, visiting one root-to-leaf path and scanning sorted lists that stop at the first miss.",
    refs: "Edelsbrunner, 1980 · de Berg et al., ch. 10", hint: "Space stabs a random point · S slows", keyA: "The probe, the visited centers and the hits", keyB: "Posts mark node centers; taller = closer to the root",
    controls: [{ act: "stab", label: "Random stab", primary: true }, { pair: [["go", "Stab at q"]], placeholder: "42", type: "number" }, { act: "left", label: "◀" }, { act: "right", label: "▶" }, { act: "reset", label: "New intervals", ghost: true }],
    pseudo: ["<b>Stab</b>(n, q): if n = nil: return", "  scan n.intervals by left end (q &lt; c) or right end (q &gt; c), stop at first miss", "  if q &lt; n.center: Stab(n.left, q)", "  if q &gt; n.center: Stab(n.right, q)", "  if q = n.center: report all of n", "  <i>// O(log n + k)</i>"],
    ui: { nodes: "nodes", hits: "hits", say: "q = {q}: {n} interval(s)", log: "q = {q} → {h}. Path of {d} node(s), {c} interval checks.", empty: "10 random intervals", intro: "Each node keeps the intervals that cross its center. Stab a point and follow the probe down one path." },
    theory: [
      ["Centered interval tree", `<p>Pick the median endpoint $c$. Intervals entirely left of $c$ go to the left subtree, entirely right to the right subtree; those that contain $c$ stay at the node, in two lists sorted by left and by right endpoint. Depth is $O(\\log n)$, space $O(n)$.</p>`],
      ["Stabbing query", `<p>For $q < c$, every interval at the node ends after $c > q$, so it contains $q$ iff its left end is $\\le q$: scan by left end and stop at the first miss. Symmetric for $q > c$. Total</p>$$O(\\log n + k)$$<p>for $k$ reported intervals.</p>`],
      ["Range trees", `<p>For points in $\\mathbb{R}^d$ and orthogonal range queries, a range tree is a balanced BST on $x$ where each node stores a BST on $y$ of its subtree. Query $O(\\log^d n + k)$, space $O(n \\log^{d-1} n)$; fractional cascading removes one $\\log$.</p>`],
      ["GIS", `<p>Time windows of bookings, genome annotations and map segments are all interval or rectangle queries: “which roads cross this meridian?” is a stabbing query.</p>`],
      ["To discuss", `<ol class="q"><li>Why can the scan stop at the first interval that misses $q$?</li><li>What is the worst case if you skip the sorted lists and scan every interval at the node?</li><li>How would you insert a new interval without rebuilding?</li></ol>`],
    ],
  },
  es: {
    title: "Interval trees", accent: "trees", machine: "Barras en un riel y un palpador que las atraviesa",
    lede: "¿Qué intervalos contienen el punto q? Un interval tree centrado responde una <strong>consulta de apuñalamiento</strong> en <strong>O(log n + k)</strong>, visitando un solo camino raíz-hoja y recorriendo listas ordenadas que paran en el primer fallo.",
    refs: "Edelsbrunner, 1980 · de Berg et al., cap. 10", hint: "Espacio apuñala un punto · S lento", keyA: "El palpador, los centros visitados y los aciertos", keyB: "Los postes marcan centros; más alto = más cerca de la raíz",
    controls: [{ act: "stab", label: "Punto al azar", primary: true }, { pair: [["go", "Apuñalar q"]], placeholder: "42", type: "number" }, { act: "left", label: "◀" }, { act: "right", label: "▶" }, { act: "reset", label: "Nuevos intervalos", ghost: true }],
    pseudo: ["<b>Stab</b>(n, q): si n = nil: volver", "  recorrer n.intervalos por extremo izq (q &lt; c) o der (q &gt; c), parar en el primer fallo", "  si q &lt; n.centro: Stab(n.izq, q)", "  si q &gt; n.centro: Stab(n.der, q)", "  si q = n.centro: reportar todo n", "  <i>// O(log n + k)</i>"],
    ui: { nodes: "nodos", hits: "aciertos", say: "q = {q}: {n} intervalo(s)", log: "q = {q} → {h}. Camino de {d} nodo(s), {c} chequeos de intervalos.", empty: "10 intervalos al azar", intro: "Cada nodo guarda los intervalos que cruzan su centro. Apuñala un punto y sigue al palpador por un solo camino." },
    theory: [
      ["Interval tree centrado", `<p>Se elige el extremo mediano $c$. Los intervalos totalmente a la izquierda de $c$ van al subárbol izquierdo, los de la derecha al derecho; los que contienen $c$ se quedan en el nodo, en dos listas ordenadas por extremo izquierdo y derecho. Profundidad $O(\\log n)$, espacio $O(n)$.</p>`],
      ["Consulta de apuñalamiento", `<p>Si $q < c$, todo intervalo del nodo termina después de $c > q$, así que contiene a $q$ si y solo si su extremo izquierdo es $\\le q$: se recorre por extremo izquierdo y se para en el primer fallo. Simétrico para $q > c$. En total</p>$$O(\\log n + k)$$<p>para $k$ intervalos reportados.</p>`],
      ["Range trees", `<p>Para puntos en $\\mathbb{R}^d$ y consultas ortogonales, un range tree es un BST balanceado en $x$ donde cada nodo guarda un BST en $y$ de su subárbol. Consulta $O(\\log^d n + k)$, espacio $O(n \\log^{d-1} n)$; fractional cascading quita un $\\log$.</p>`],
      ["GIS", `<p>Ventanas de reservas, anotaciones del genoma y segmentos de mapas son consultas de intervalos o rectángulos: “¿qué calles cruzan este meridiano?” es una consulta de apuñalamiento.</p>`],
      ["Para discutir", `<ol class="q"><li>¿Por qué el recorrido puede parar en el primer intervalo que no contiene a $q$?</li><li>¿Cuál es el peor caso si no usas las listas ordenadas y revisas todo el nodo?</li><li>¿Cómo insertarías un intervalo nuevo sin reconstruir?</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "interval-trees", fig: "Fig 10", P, svg, consts: { NI, SX, XA, LANE, YL }, code, TEXT, stateLabel: "O(log n + k)" }, UI);
