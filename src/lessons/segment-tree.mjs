// Week 09: segment tree with lazy propagation. Each node is a bar as wide as its segment; leaves are columns.
import { bench, ruler, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const N = 8, PITCH = 22, X0 = -((N - 1) * PITCH) / 2, LY = [-42, -20, 2, 26], BAR_H = 5;
const PLATE = { x: -112, y: -58, w: 224, d: 112, r: 8 };
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [X0, 26, 40], [-X0, 26, 40]], 640, 350, { pad: 22, azimuth: 62 });
const svg = k.figureSvg({ width: 640, height: 350, label: "Segment tree machine", body: [
  bench(P, PLATE, { label: { x: 60, y: 44, w: 40, d: 10, r: 1.5 } }), ruler(P, X0 - 10, -X0 + 10, 38, { step: PITCH / 2, every: 2 }), layers("nodes"), layers("air"),
] });

const code = String.raw`
const nodesL=layer("nodes"),airL=layer("air");
let A=[],tree=[],lazy=[],G={};
const xs=(l,r)=>X0+((l+r)/2)*PITCH;
function buildT(i,l,r){lazy[i]=0;if(l===r){tree[i]=A[l];return}const m=(l+r)>>1;buildT(2*i,l,m);buildT(2*i+1,m+1,r);tree[i]=tree[2*i]+tree[2*i+1]}
function nodes(){const out=[];(function w(i,l,r,d){out.push({i,l,r,d});if(l<r){const m=(l+r)>>1;w(2*i,l,m,d+1);w(2*i+1,m+1,r,d+1)}})(1,0,N-1,0);return out}
function drawNode(n,on=false,dim=false){let g=G[n.i];if(!g){g=art("",nodesL);G[n.i]=g}const y=LY[n.d],x=xs(n.l,n.r),leaf=n.l===n.r;
 const w=leaf?12:(n.r-n.l+1)*PITCH-6,h=leaf?4+tree[n.i]*2.2:BAR_H,pl={x:x-w/2,y:y-5,w,d:10,r:1.4};g.pos=[x,y,0];
 let s=solidSvg(slabOf(pl,0,h,P,3,.4),{tone:dim?"lo":leaf?"hi":"mid",lit:on})+faceTextSvg(topMatrix([x,y+2],h,P,"x"),String(tree[n.i]),{size:5.4,tone:leaf?"lo":"hi",anchor:"middle"});
 if(lazy[n.i])s+=solidSvg(cylinder(x+w/2-4,y-1,2.6,h,1.6,P,16),{tone:"hi",lit:true})+faceTextSvg(topMatrix([x+w/2-4,y+.6],h+1.6,P,"x"),"+"+lazy[n.i],{size:3.2,tone:"lo",anchor:"middle"});
 g.innerHTML=s}
function drawAll(on=[],dim=false){nodes().forEach(n=>drawNode(n,on.includes(n.i),dim&&!on.includes(n.i)));sortBy(nodesL)}
function push(i,l,r){if(!lazy[i]||l===r)return;const m=(l+r)>>1;for(const [c,cl,cr] of [[2*i,l,m],[2*i+1,m+1,r]]){tree[c]+=lazy[i]*(cr-cl+1);lazy[c]+=lazy[i]}lazy[i]=0}
function leafVals(){const v=[];(function w(i,l,r){if(l===r){v.push(tree[i]);return}push(i,l,r);const m=(l+r)>>1;w(2*i,l,m);w(2*i+1,m+1,r)})(1,0,N-1);return v}
async function query(ql,qr){hl(0);const used=[],visited=[];
 (function q(i,l,r){if(qr<l||r<ql)return;visited.push(i);if(ql<=l&&r<=qr){used.push(i);return}push(i,l,r);const m=(l+r)>>1;q(2*i,l,m);q(2*i+1,m+1,r)})(1,0,N-1);
 for(let s=1;s<=visited.length;s++){hl(visited[s-1]&&used.includes(visited[s-1])?1:2);drawAll(visited.slice(0,s),true);await wait(220)}
 const sum=used.reduce((a,i)=>a+tree[i],0);hl(1);drawAll(used,true);say(fmt(U.qsay,{l:ql,r:qr,s:sum}));log(fmt(U.qlog,{l:ql,r:qr,k:used.length,v:visited.length,s:sum}));render();setTimeout(()=>drawAll(),2200*slow);return sum}
async function update(ql,qr,v){hl(4);const touched=[];
 (function u(i,l,r){if(qr<l||r<ql)return;touched.push(i);if(ql<=l&&r<=qr){tree[i]+=v*(r-l+1);lazy[i]+=l<r?v:0;return}push(i,l,r);const m=(l+r)>>1;u(2*i,l,m);u(2*i+1,m+1,r);tree[i]=tree[2*i]+tree[2*i+1]})(1,0,N-1);
 hl(5);drawAll(touched,true);await wait(500);hl(6);drawAll(touched,false);say(fmt(U.usay,{l:ql,r:qr,v}));log(fmt(U.ulog,{l:ql,r:qr,v,k:touched.length}));render()}
function render(){const v=leafVals();drawAll();tables(cells("A","",v)+'<div class="mono">'+U.lazyLabel+": "+(Object.keys(lazy).filter(i=>lazy[i]).map(i=>"#"+i+" +"+lazy[i]).join(", ")||"·")+"</div>");stats([["n",N],[U.total,tree[1]],[U.pending,lazy.filter(Boolean).length],[U.height,Math.log2(N)]])}
function reset(){A=Array.from({length:N},()=>1+Math.floor(Math.random()*6));G={};nodesL.innerHTML="";buildT(1,0,N-1);render();say(U.empty);log(U.intro)}
const rr=()=>{let l=Math.floor(Math.random()*N),r=Math.floor(Math.random()*N);return l<=r?[l,r]:[r,l]};
const parse=()=>(input()||"").split(/[^0-9-]+/).filter(Boolean).map(Number);
bind({query:()=>query(...rr()),q:()=>{const [l,r]=parse();if(r!==undefined)return query(Math.max(0,l),Math.min(N-1,r))},u:()=>{const [l,r,v=1]=parse();if(r!==undefined)return update(Math.max(0,l),Math.min(N-1,r),v)},add:()=>{const [l,r]=rr();return update(l,r,1)},reset});
reset();
let st=0;startTour(async()=>{const s=st++%3;if(s===2){const [l,r]=rr();await update(l,r,1)}else await query(...rr());if(tree[1]>60)reset()});
`;

const TEXT = {
  en: {
    title: "Segment trees", accent: "trees", machine: "Bars as wide as the segments they sum",
    lede: "Answer <strong>range sums</strong> and apply <strong>range updates</strong> in O(log n). Every range splits into at most 2 log n bars; lazy tags let an update stop high and pay later.",
    refs: "Bentley, 1977", hint: "Space runs a random query · S slows", keyA: "Nodes visited by the operation and lazy tags", keyB: "Each bar spans its segment; leaves are the array",
    controls: [{ act: "query", label: "Random range sum", primary: true }, { pair: [["q", "Sum l r"], ["u", "Add l r v"]], placeholder: "2 5 3" }, { act: "add", label: "Random +1 range" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>Query</b>(i, l, r): if [l, r] ⊆ [ql, qr]: return tree[i]", "  if disjoint: return 0", "  Push(i); return Query(left) + Query(right)", "", "<b>Update</b>(i, l, r, v): if [l, r] ⊆ [ql, qr]:", "  tree[i] += v·(r − l + 1); lazy[i] += v; stop", "  Push(i); recurse; tree[i] ← sum of children"],
    ui: { lazyLabel: "lazy", total: "total", pending: "lazy tags", height: "height", qsay: "sum [{l}, {r}] = {s}", qlog: "Sum of [{l}, {r}] = {s}: {k} bar(s) cover the range exactly; {v} nodes visited. O(log n).", usay: "+{v} on [{l}, {r}]", ulog: "Add {v} to [{l}, {r}]: {k} nodes touched. Bars fully inside the range keep a lazy tag instead of updating every leaf.", empty: "random array", intro: "Each range is covered by a few wide bars. Run a query, then a range add, and watch the lazy tags." },
    theory: [
      ["The structure", `<p>A complete binary tree over the array: each node stores the sum of its segment $[l, r]$, its children split it at $m = \\lfloor (l+r)/2 \\rfloor$. Height $\\lceil \\log_2 n \\rceil$, at most $4n$ nodes in an array.</p>`],
      ["Range query", `<p>Any range $[q_l, q_r]$ decomposes into at most $2\\lceil \\log_2 n \\rceil$ canonical nodes, so</p>$$\\text{Query} = O(\\log n)$$<p>The same works for any associative operation: min, max, gcd, matrix product.</p>`],
      ["Lazy propagation", `<p>A range update would touch $O(n)$ leaves. Instead, stop at the canonical nodes, update their sum by $v \\cdot (r-l+1)$ and leave a tag $lazy[i] = v$. The tag is <strong>pushed</strong> to the children only when a later operation needs to go below. Updates and queries both stay $O(\\log n)$.</p>`],
      ["Time series", `<p>Segment trees answer “total sales between day $a$ and day $b$” or “max temperature in a window” while values keep changing, which prefix sums cannot do without $O(n)$ rebuilds.</p>`],
      ["To discuss", `<ol class="q"><li>Why does a query never visit more than 4 nodes per level?</li><li>Change the operation to min. What changes in Push for “add $v$ to a range”?</li><li>Compare with a Fenwick tree: what does each support?</li></ol>`],
    ],
  },
  es: {
    title: "Segment trees", accent: "trees", machine: "Barras tan anchas como el segmento que suman",
    lede: "Responder <strong>sumas por rango</strong> y aplicar <strong>actualizaciones por rango</strong> en O(log n). Todo rango se parte en a lo más 2 log n barras; las marcas lazy permiten que una actualización se detenga arriba y pague después.",
    refs: "Bentley, 1977", hint: "Espacio corre una consulta · S lento", keyA: "Nodos visitados y marcas lazy", keyB: "Cada barra cubre su segmento; las hojas son el arreglo",
    controls: [{ act: "query", label: "Suma de rango al azar", primary: true }, { pair: [["q", "Suma l r"], ["u", "Sumar l r v"]], placeholder: "2 5 3" }, { act: "add", label: "+1 a un rango" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>Consulta</b>(i, l, r): si [l, r] ⊆ [ql, qr]: devolver tree[i]", "  si son disjuntos: devolver 0", "  Push(i); devolver Consulta(izq) + Consulta(der)", "", "<b>Actualizar</b>(i, l, r, v): si [l, r] ⊆ [ql, qr]:", "  tree[i] += v·(r − l + 1); lazy[i] += v; parar", "  Push(i); recursión; tree[i] ← suma de hijos"],
    ui: { lazyLabel: "lazy", total: "total", pending: "marcas lazy", height: "altura", qsay: "suma [{l}, {r}] = {s}", qlog: "Suma de [{l}, {r}] = {s}: {k} barra(s) cubren el rango exacto; {v} nodos visitados. O(log n).", usay: "+{v} en [{l}, {r}]", ulog: "Sumar {v} a [{l}, {r}]: {k} nodos tocados. Las barras dentro del rango guardan una marca lazy en vez de actualizar cada hoja.", empty: "arreglo al azar", intro: "Cada rango lo cubren pocas barras anchas. Corre una consulta, luego una suma por rango, y mira las marcas lazy." },
    theory: [
      ["La estructura", `<p>Un árbol binario completo sobre el arreglo: cada nodo guarda la suma de su segmento $[l, r]$ y sus hijos lo parten en $m = \\lfloor (l+r)/2 \\rfloor$. Altura $\\lceil \\log_2 n \\rceil$, a lo más $4n$ nodos en un arreglo.</p>`],
      ["Consulta por rango", `<p>Cualquier rango $[q_l, q_r]$ se descompone en a lo más $2\\lceil \\log_2 n \\rceil$ nodos canónicos, así que</p>$$\\text{Consulta} = O(\\log n)$$<p>Funciona igual para cualquier operación asociativa: mín, máx, mcd, producto de matrices.</p>`],
      ["Propagación lazy", `<p>Una actualización por rango tocaría $O(n)$ hojas. En cambio, se detiene en los nodos canónicos, suma $v \\cdot (r-l+1)$ y deja una marca $lazy[i] = v$. La marca se <strong>empuja</strong> a los hijos solo cuando una operación posterior necesita bajar. Actualizar y consultar siguen en $O(\\log n)$.</p>`],
      ["Series de tiempo", `<p>Los segment trees responden “ventas totales entre el día $a$ y el día $b$” o “temperatura máxima en una ventana” mientras los valores cambian, cosa que las sumas prefijas no pueden sin reconstruir en $O(n)$.</p>`],
      ["Para discutir", `<ol class="q"><li>¿Por qué una consulta nunca visita más de 4 nodos por nivel?</li><li>Cambia la operación a mínimo. ¿Qué cambia en Push para “sumar $v$ a un rango”?</li><li>Compara con un Fenwick tree: ¿qué soporta cada uno?</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "segment-trees", fig: "Fig 9", P, svg, consts: { N, PITCH, X0, LY, BAR_H }, code, TEXT, stateLabel: "O(log n)" }, UI);
