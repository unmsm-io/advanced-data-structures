// Week 11: KD-tree. Pins on a square table; every insert raises a wall that splits its cell, alternating x and y.
import { bench, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const SZ = 1.5, TZ = 6;
const TABLE = { x: -75, y: -75, w: 150, d: 150, r: 3 };
const PLATE = { x: -92, y: -92, w: 184, d: 184, r: 8 };
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [0, 0, 30]], 640, 380, { pad: 20, azimuth: 45, elevation: 34 });
const svg = k.figureSvg({ width: 640, height: 380, label: "KD-tree table", body: [
  bench(P, PLATE), S(k.slabOf(TABLE, 0, TZ, P, 4, 0.6), { tone: "mid" }), L(k.planOutline(k.insetPlan(TABLE, 3), TZ, P), { tone: "faint" }),
  layers("ring"), layers("walls"), layers("air"),
] });

const code = String.raw`
const ringL=layer("ring"),wallsL=layer("walls"),airL=layer("air");
const W=v=>-75+v*SZ;let root=null,pts=[],items=[];
function cellWall(n){const [x0,y0,x1,y1]=n.box;return n.axis===0?{x:W(n.p[0])-.6,y:W(y0),w:1.2,d:(y1-y0)*SZ,r:.3}:{x:W(x0),y:W(n.p[1])-.6,w:(x1-x0)*SZ,d:1.2,r:.3}}
function wallArt(n,h,on){return solidSvg(slabOf(cellWall(n),TZ,h,P,2),{tone:n.axis?"lo":"mid",lit:on})}
function pinArt(n,on){const [x,y]=[W(n.p[0]),W(n.p[1])];return solidSvg(cylinder(x,y,2.4,TZ,12,P,16),{tone:"hi",lit:on})+solidSvg(cylinder(x,y,3.4,TZ+12,2,P,18),{tone:"hi",lit:on})}
function draw(on=[]){wallsL.innerHTML="";const all=[];(function w(n){if(!n)return;all.push(n);w(n.L);w(n.R)})(root);
 for(const n of all){const e=art(wallArt(n,n.h??8,on.includes(n))+pinArt(n,on.includes(n)),wallsL);const c=cellWall(n);e.pos=[c.x+c.w/2,c.y+c.d/2,0]}sortBy(wallsL)}
function insertP(p){hl(0);if(!root){root={p,axis:0,box:[0,0,100,100],h:0};return [root]}let n=root,path=[];
 while(true){path.push(n);hl(1);const ax=n.axis,side=p[ax]<n.p[ax]?"L":"R";if(!n[side]){const [x0,y0,x1,y1]=n.box;const box=ax===0?(side==="L"?[x0,y0,n.p[0],y1]:[n.p[0],y0,x1,y1]):(side==="L"?[x0,y0,x1,n.p[1]]:[x0,n.p[1],x1,y1]);hl(2);n[side]={p,axis:1-ax,box,h:0};path.push(n[side]);return path}n=n[side]}}
async function add(p){p=p.map(v=>Math.max(2,Math.min(98,Math.round(v))));const path=insertP(p);const nn=path[path.length-1];pts.push(p);
 for(let i=0;i<path.length-1;i++){draw(path.slice(0,i+1));await wait(200)}
 await animate(380,e=>{nn.h=8*e;draw([nn])});draw();render();say(fmt(U.added,{x:p[0],y:p[1],d:path.length-1,a:nn.axis?"y":"x"}));log(fmt(U.addLog,{x:p[0],y:p[1],d:path.length-1,a:nn.axis?"y":"x"}))}
const d2=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2;
function showRing(q,r){ringL.innerHTML=r?lineSvg(ring_(W(q[0]),W(q[1]),r*SZ),{tone:"lit"}):""}
const ring_=(x,y,r)=>{const pts=[];for(let s=0;s<=48;s++){const a=s/48*Math.PI*2;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r,TZ+.3])}return poly(pts)};
async function nearest(q){hl(4);q=q.map(v=>Math.round(v));const probe=art(solidSvg(cylinder(W(q[0]),W(q[1]),2,TZ,16,P,14),{tone:"hi",lit:true}),airL);probe.pos=[0,0,99];
 let best=null,bd=Infinity,visited=[],pruned=0;
 async function go(n){if(!n)return;visited.push(n);draw(visited);hl(5);const d=d2(q,n.p);if(d<bd){bd=d;best=n;showRing(q,Math.sqrt(bd))}await wait(260);
  const ax=n.axis,diff=q[ax]-n.p[ax],near=diff<0?n.L:n.R,far=diff<0?n.R:n.L;await go(near);
  hl(6);if(diff*diff<bd)await go(far);else if(far)pruned++}
 await go(root);hl(7);draw(best?[best]:[]);say(fmt(U.nnSay,{x:best.p[0],y:best.p[1],d:Math.sqrt(bd).toFixed(1)}));log(fmt(U.nnLog,{v:visited.length,n:pts.length,p:pruned}));render();
 setTimeout(()=>{probe.remove();showRing(q,0);draw()},2200*slow)}
function render(){tables('<div class="mono" style="line-height:1.8">'+pts.map(p=>"("+p.join(", ")+")").join("  ")+"</div>");let h=0;(function w(n,d){if(!n)return;h=Math.max(h,d);w(n.L,d+1);w(n.R,d+1)})(root,1);stats([["n",pts.length],[U.height,h],["log₂ n",pts.length?Math.log2(pts.length).toFixed(1):0],[U.dims,2]])}
function reset(){root=null;pts=[];wallsL.innerHTML="";ringL.innerHTML="";render();say(U.empty);log(U.intro)}
const rnd=()=>[5+Math.random()*90,5+Math.random()*90];
bind({add:()=>add(rnd()),nn:()=>pts.length&&nearest(rnd()),put:()=>{const [x,y]=(input()||"").split(/[^0-9.]+/).filter(Boolean).map(Number);if(y!==undefined)return add([x,y])},reset});
reset();
startTour(async()=>{if(pts.length>=14){await nearest(rnd());await wait(800);reset();return}pts.length>=5&&Math.random()<.35?await nearest(rnd()):await add(rnd())});
`;

const TEXT = {
  en: {
    title: "KD-trees", accent: "KD", machine: "A table of pins split by alternating walls",
    lede: "Split space instead of values: each point cuts its cell in two, alternating x and y. Nearest-neighbour search follows one path down and <strong>prunes</strong> every cell farther than the best distance so far.",
    refs: "Bentley, 1975 · Friedman et al., 1977", hint: "Space adds a point · S slows", keyA: "Visited nodes, the probe and the best-distance ring", keyB: "Light walls split on x, dark walls on y",
    controls: [{ act: "add", label: "Add random point", primary: true }, { pair: [["put", "Add x y"]], placeholder: "30 70" }, { act: "nn", label: "Nearest neighbour" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>Insert</b>(p): n ← root", "  go left if p[axis] &lt; n.p[axis], else right", "  attach p with axis ← 1 − parent.axis", "", "<b>Nearest</b>(n, q): if n = nil: return", "  update best with n.p", "  visit near side; visit far side only if |q[axis] − n.p[axis]| &lt; best", "  <i>// O(log n) expected for random points</i>"],
    ui: { height: "height", dims: "k", added: "({x}, {y}) at depth {d}, splits on {a}", addLog: "Point ({x}, {y}) walks {d} level(s) and becomes a leaf; its wall splits its cell on {a}.", nnSay: "nearest ({x}, {y}) · d = {d}", nnLog: "Visited {v} of {n} nodes; {p} subtree(s) pruned because the wall was farther than the ring.", empty: "empty table", intro: "Each new point raises a wall in its cell. After a few points, run a nearest-neighbour search and watch the ring shrink." },
    theory: [
      ["The structure", `<p>A binary tree over points in $\\mathbb{R}^k$. A node at depth $d$ splits on coordinate $d \\bmod k$: points with a smaller coordinate go left. Built from the median at each level, the tree is balanced with height $\\lceil \\log_2 n \\rceil$ in $O(n \\log n)$.</p>`],
      ["Range search", `<p>An orthogonal range query visits $O(n^{1 - 1/k} + m)$ nodes for $m$ reported points: $O(\\sqrt n + m)$ in the plane.</p>`],
      ["Nearest neighbour", `<p>Descend toward $q$, keep the best distance $r$, and on the way back visit the far subtree only if the splitting line is closer than $r$:</p>$$|q_{a} - p_{a}| < r$$<p>For well-spread points this is $O(\\log n)$ expected; in high dimensions pruning fails (the curse of dimensionality) and approximate methods such as LSH (week 03) take over.</p>`],
      ["Machine learning", `<p>KD-trees speed up $k$-NN classification, DBSCAN and point cloud registration (ICP) for $k \\lesssim 20$. Libraries such as scikit-learn switch to ball trees or brute force beyond that.</p>`],
      ["To discuss", `<ol class="q"><li>Insert points in sorted order of $x$. What does the tree look like?</li><li>Why alternate axes instead of always splitting on the widest spread?</li><li>Estimate how many nodes NN visits in dimension 50.</li></ol>`],
    ],
  },
  es: {
    title: "KD-trees", accent: "KD", machine: "Una mesa de pines partida por paredes alternas",
    lede: "Partir el espacio en vez de los valores: cada punto corta su celda en dos, alternando x e y. La búsqueda del vecino más cercano baja por un camino y <strong>poda</strong> cada celda más lejana que la mejor distancia hasta ahora.",
    refs: "Bentley, 1975 · Friedman et al., 1977", hint: "Espacio agrega un punto · S lento", keyA: "Nodos visitados, el palpador y el anillo de mejor distancia", keyB: "Paredes claras parten en x, oscuras en y",
    controls: [{ act: "add", label: "Agregar punto", primary: true }, { pair: [["put", "Agregar x y"]], placeholder: "30 70" }, { act: "nn", label: "Vecino más cercano" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>Insertar</b>(p): n ← raíz", "  ir a la izq si p[eje] &lt; n.p[eje], si no a la der", "  colgar p con eje ← 1 − padre.eje", "", "<b>Cercano</b>(n, q): si n = nil: volver", "  actualizar mejor con n.p", "  visitar lado cercano; el lejano solo si |q[eje] − n.p[eje]| &lt; mejor", "  <i>// O(log n) esperado con puntos al azar</i>"],
    ui: { height: "altura", dims: "k", added: "({x}, {y}) a profundidad {d}, parte en {a}", addLog: "El punto ({x}, {y}) baja {d} nivel(es) y queda como hoja; su pared parte su celda en {a}.", nnSay: "más cercano ({x}, {y}) · d = {d}", nnLog: "Visitó {v} de {n} nodos; {p} subárbol(es) podados porque la pared estaba más lejos que el anillo.", empty: "mesa vacía", intro: "Cada punto nuevo levanta una pared en su celda. Tras unos puntos, busca el vecino más cercano y mira cómo se achica el anillo." },
    theory: [
      ["La estructura", `<p>Un árbol binario sobre puntos en $\\mathbb{R}^k$. Un nodo a profundidad $d$ parte por la coordenada $d \\bmod k$: los puntos con coordenada menor van a la izquierda. Construido con la mediana en cada nivel queda balanceado, con altura $\\lceil \\log_2 n \\rceil$, en $O(n \\log n)$.</p>`],
      ["Búsqueda por rango", `<p>Una consulta ortogonal visita $O(n^{1 - 1/k} + m)$ nodos para $m$ puntos reportados: $O(\\sqrt n + m)$ en el plano.</p>`],
      ["Vecino más cercano", `<p>Se baja hacia $q$, se guarda la mejor distancia $r$, y al volver se visita el subárbol lejano solo si la línea de corte está más cerca que $r$:</p>$$|q_{a} - p_{a}| < r$$<p>Con puntos bien repartidos es $O(\\log n)$ esperado; en dimensión alta la poda falla (la maldición de la dimensionalidad) y entran métodos aproximados como LSH (semana 03).</p>`],
      ["Machine learning", `<p>Los KD-trees aceleran clasificación $k$-NN, DBSCAN y registro de nubes de puntos (ICP) para $k \\lesssim 20$. Librerías como scikit-learn pasan a ball trees o fuerza bruta más allá.</p>`],
      ["Para discutir", `<ol class="q"><li>Inserta puntos ordenados por $x$. ¿Cómo queda el árbol?</li><li>¿Por qué alternar ejes en vez de partir siempre por la mayor dispersión?</li><li>Estima cuántos nodos visita NN en dimensión 50.</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "kd-trees", fig: "Fig 11", P, svg, consts: { SZ, TZ }, code, TEXT, stateLabel: "k = 2" }, UI);
