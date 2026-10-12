// Week 12: point quadtree with capacity 2. A full cell raises a cross of walls and splits into four.
import { bench, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const SZ = 1.5, TZ = 6, CAP = 2;
const TABLE = { x: -75, y: -75, w: 150, d: 150, r: 3 };
const PLATE = { x: -92, y: -92, w: 184, d: 184, r: 8 };
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [0, 0, 30]], 640, 380, { pad: 20, azimuth: 45, elevation: 34 });
const svg = k.figureSvg({ width: 640, height: 380, label: "Quadtree table", body: [
  bench(P, PLATE), S(k.slabOf(TABLE, 0, TZ, P, 4, 0.6), { tone: "mid" }), L(k.planOutline(k.insetPlan(TABLE, 3), TZ, P), { tone: "faint" }),
  layers("frame"), layers("walls"), layers("pins"),
] });

const code = String.raw`
const frameL=layer("frame"),wallsL=layer("walls"),pinsL=layer("pins");
const W=v=>-75+v*SZ;let root,pts=[];
const mk=(x,y,s,d)=>({x,y,s,d,pts:[],kids:null,h:8});
function draw(on=new Set(),hits=new Set()){wallsL.innerHTML="";pinsL.innerHTML="";
 (function w(n){if(!n.kids)return;const cx=n.x+n.s/2,cy=n.y+n.s/2;const h=Math.max(3,10-n.d*2)*(n.h/8);
  for(const pl of [{x:W(cx)-.6,y:W(n.y),w:1.2,d:n.s*SZ,r:.3},{x:W(n.x),y:W(cy)-.6,w:n.s*SZ,d:1.2,r:.3}]){const e=art(solidSvg(slabOf(pl,TZ,h,P,2),{tone:n.d%2?"lo":"mid",lit:on.has(n)}),wallsL);e.pos=[pl.x+pl.w/2,pl.y+pl.d/2,0]}
  n.kids.forEach(w)})(root);
 for(const p of pts){const e=art(solidSvg(cylinder(W(p[0]),W(p[1]),2.2,TZ,10,P,16),{tone:"hi",lit:hits.has(p)})+solidSvg(cylinder(W(p[0]),W(p[1]),3.2,TZ+10,2,P,18),{tone:"hi",lit:hits.has(p)}),pinsL);e.pos=[W(p[0]),W(p[1]),0]}
 sortBy(wallsL);sortBy(pinsL)}
function leafOf(p){let n=root,path=[n];while(n.kids){n=n.kids[(p[0]>=n.x+n.s/2?1:0)+(p[1]>=n.y+n.s/2?2:0)];path.push(n)}return path}
async function add(p){p=p.map(v=>Math.max(1,Math.min(99,Math.round(v))));hl(0);const path=leafOf(p);let n=path[path.length-1];
 for(let i=0;i<path.length;i++){draw(new Set(path.slice(0,i+1)));await wait(140)}
 n.pts.push(p);pts.push(p);hl(1);let splits=0;
 while(n.pts.length>CAP&&n.s>6){hl(2);splits++;const h=n.s/2;n.kids=[mk(n.x,n.y,h,n.d+1),mk(n.x+h,n.y,h,n.d+1),mk(n.x,n.y+h,h,n.d+1),mk(n.x+h,n.y+h,h,n.d+1)];
  for(const q of n.pts)n.kids[(q[0]>=n.x+h?1:0)+(q[1]>=n.y+h?2:0)].pts.push(q);n.pts=[];n.h=0;const m=n;await animate(360,e=>{m.h=8*e;draw(new Set([m]))});
  n=n.kids.find(c=>c.pts.length>CAP)||n;if(!n.pts||n.pts.length<=CAP)break}
 draw();render();say(fmt(U.added,{x:p[0],y:p[1],s:splits}));log(fmt(splits?U.splitLog:U.addLog,{x:p[0],y:p[1],d:path.length-1,s:splits}))}
async function range(){hl(4);const x0=Math.random()*60,y0=Math.random()*60,s=25+Math.random()*25,box=[x0,y0,x0+s,y0+s];
 frameL.innerHTML=lineSvg(poly([[W(box[0]),W(box[1]),TZ+.4],[W(box[2]),W(box[1]),TZ+.4],[W(box[2]),W(box[3]),TZ+.4],[W(box[0]),W(box[3]),TZ+.4],[W(box[0]),W(box[1]),TZ+.4]]),{tone:"lit"});
 const vis=new Set(),hits=new Set();let pruned=0;
 (function w(n){if(n.x>box[2]||n.x+n.s<box[0]||n.y>box[3]||n.y+n.s<box[1]){pruned++;return}vis.add(n);n.pts.forEach(p=>{if(p[0]>=box[0]&&p[0]<=box[2]&&p[1]>=box[1]&&p[1]<=box[3])hits.add(p)});n.kids&&n.kids.forEach(w)})(root);
 hl(5);draw(vis);await wait(700);hl(6);draw(new Set(),hits);say(fmt(U.rangeSay,{n:hits.size}));log(fmt(U.rangeLog,{n:hits.size,v:vis.size,p:pruned}));render();
 setTimeout(()=>{frameL.innerHTML="";draw()},2400*slow)}
function render(){let leaves=0,depth=0;(function w(n){depth=Math.max(depth,n.d);if(!n.kids){leaves++;return}n.kids.forEach(w)})(root);tables('<div class="mono" style="line-height:1.8">'+pts.map(p=>"("+p.join(", ")+")").join("  ")+"</div>");stats([["n",pts.length],[U.leaves,leaves],[U.depth,depth],[U.cap,CAP]])}
function reset(){root=mk(0,0,100,0);pts=[];frameL.innerHTML="";draw();render();say(U.empty);log(U.intro)}
const rnd=()=>{const c=Math.random()<.6?[25,70]:[50+Math.random()*40,20+Math.random()*30];return [c[0]+(Math.random()-.5)*30,c[1]+(Math.random()-.5)*30]};
bind({add:()=>add(rnd()),put:()=>{const [x,y]=(input()||"").split(/[^0-9.]+/).filter(Boolean).map(Number);if(y!==undefined)return add([x,y])},range,reset});
reset();
startTour(async()=>{if(pts.length>=18){await range();await wait(800);reset();return}pts.length>=6&&Math.random()<.3?await range():await add(rnd())});
`;

const TEXT = {
  en: {
    title: "Quadtrees", accent: "Quad", machine: "A map table whose cells split in four",
    lede: "Divide the plane into four quadrants, then divide again only where points crowd. Dense regions get deep, empty ones stay one cell, and a <strong>range query</strong> skips whole quadrants that miss the window.",
    refs: "Finkel &amp; Bentley, 1974 · Guttman, 1984", hint: "Space adds a point · S slows", keyA: "Visited cells, the query window and hits", keyB: "A cell holds at most 2 points before it splits",
    controls: [{ act: "add", label: "Add random point", primary: true }, { pair: [["put", "Add x y"]], placeholder: "30 70" }, { act: "range", label: "Range query" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>Insert</b>(p): descend to the leaf cell containing p", "  add p to the cell", "  while |cell| &gt; capacity: split into 4, redistribute", "", "<b>Range</b>(n, box): if n ∩ box = ∅: prune", "  report points of n inside box", "  recurse into the 4 children"],
    ui: { leaves: "leaves", depth: "depth", cap: "capacity", added: "({x}, {y}) · {s} split(s)", addLog: "({x}, {y}) lands in a leaf at depth {d}.", splitLog: "({x}, {y}) overflowed its cell: {s} split(s) into four quadrants.", rangeSay: "{n} point(s) in the window", rangeLog: "Window query: {n} hit(s), {v} cells visited, {p} quadrant(s) pruned without looking inside.", empty: "empty map", intro: "Points cluster in two areas. Watch the quadtree go deep only where they crowd, then run a range query." },
    theory: [
      ["Point quadtree", `<p>Each node is a square; when it holds more than $c$ points it splits into four equal quadrants (NW, NE, SW, SE). The depth depends on how close the points are, not on $n$: two points at distance $\\delta$ in a box of side $s$ force depth $\\log_2(s / \\delta)$.</p>`],
      ["Queries", `<p>A range query descends only into quadrants that intersect the window. Nearest neighbour works like the KD-tree. In images and games the same idea gives region quadtrees, collision detection and level-of-detail terrain.</p>`],
      ["R-trees", `<p>For rectangles (roads, buildings), an R-tree is a B-tree whose nodes store <strong>minimum bounding rectangles</strong> of their children; entries may overlap. Insert chooses the child whose MBR grows least; overflow splits a node in two.</p>`],
      ["R*-trees", `<p>R* reduces overlap and area with a better split (minimise margin, then overlap) and <strong>forced reinsertion</strong> of 30% of the entries before splitting. PostGIS and SQLite use R-tree variants under their spatial indexes.</p>`],
      ["To discuss", `<ol class="q"><li>Insert two points extremely close together. What happens to the depth? How would you cap it?</li><li>Why can R-tree nodes overlap while quadtree cells cannot?</li><li>Which structure would you use for a map of Lima's bus stops, and why?</li></ol>`],
    ],
  },
  es: {
    title: "Quadtrees", accent: "Quad", machine: "Una mesa de mapa cuyas celdas se parten en cuatro",
    lede: "Dividir el plano en cuatro cuadrantes, y volver a dividir solo donde los puntos se amontonan. Las zonas densas se vuelven profundas, las vacías quedan en una celda, y una <strong>consulta por rango</strong> salta cuadrantes enteros que no tocan la ventana.",
    refs: "Finkel &amp; Bentley, 1974 · Guttman, 1984", hint: "Espacio agrega un punto · S lento", keyA: "Celdas visitadas, la ventana y los aciertos", keyB: "Una celda guarda a lo más 2 puntos antes de partirse",
    controls: [{ act: "add", label: "Agregar punto", primary: true }, { pair: [["put", "Agregar x y"]], placeholder: "30 70" }, { act: "range", label: "Consulta por rango" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>Insertar</b>(p): bajar a la celda hoja que contiene p", "  agregar p a la celda", "  mientras |celda| &gt; capacidad: partir en 4, redistribuir", "", "<b>Rango</b>(n, caja): si n ∩ caja = ∅: podar", "  reportar puntos de n dentro de la caja", "  recursión en los 4 hijos"],
    ui: { leaves: "hojas", depth: "profundidad", cap: "capacidad", added: "({x}, {y}) · {s} partición(es)", addLog: "({x}, {y}) cae en una hoja a profundidad {d}.", splitLog: "({x}, {y}) desbordó su celda: {s} partición(es) en cuatro cuadrantes.", rangeSay: "{n} punto(s) en la ventana", rangeLog: "Consulta de ventana: {n} acierto(s), {v} celdas visitadas, {p} cuadrante(s) podados sin mirar dentro.", empty: "mapa vacío", intro: "Los puntos se agrupan en dos zonas. Mira cómo el quadtree solo se profundiza donde se amontonan y luego corre una consulta por rango." },
    theory: [
      ["Quadtree de puntos", `<p>Cada nodo es un cuadrado; cuando guarda más de $c$ puntos se parte en cuatro cuadrantes iguales (NO, NE, SO, SE). La profundidad depende de qué tan cerca están los puntos, no de $n$: dos puntos a distancia $\\delta$ en una caja de lado $s$ fuerzan profundidad $\\log_2(s / \\delta)$.</p>`],
      ["Consultas", `<p>Una consulta por rango solo baja a los cuadrantes que intersecan la ventana. El vecino más cercano funciona como en el KD-tree. En imágenes y juegos la misma idea da quadtrees de regiones, detección de colisiones y terreno con nivel de detalle.</p>`],
      ["R-trees", `<p>Para rectángulos (calles, edificios), un R-tree es un B-tree cuyos nodos guardan <strong>rectángulos mínimos envolventes</strong> de sus hijos; las entradas pueden solaparse. Insertar elige el hijo cuyo MBR crece menos; el desborde parte un nodo en dos.</p>`],
      ["R*-trees", `<p>R* reduce solapamiento y área con un mejor split (minimizar margen y luego solapamiento) y <strong>reinserción forzada</strong> del 30% de las entradas antes de partir. PostGIS y SQLite usan variantes de R-tree en sus índices espaciales.</p>`],
      ["Para discutir", `<ol class="q"><li>Inserta dos puntos casi en el mismo lugar. ¿Qué pasa con la profundidad? ¿Cómo la limitarías?</li><li>¿Por qué los nodos de un R-tree pueden solaparse y las celdas de un quadtree no?</li><li>¿Qué estructura usarías para un mapa de paraderos de Lima y por qué?</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "quadtrees", fig: "Fig 12", P, svg, consts: { SZ, TZ, CAP }, code, TEXT, stateLabel: "c = 2" }, UI);
