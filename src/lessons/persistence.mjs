// Week 14: persistent BST by path copying. Version v lives on sheet v; new nodes point down to shared old ones.
import { bench, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const MAXV = 7, VZ = 13, KX = 1.7, DY = 15;
const PLATE = { x: -100, y: -60, w: 200, d: 110, r: 8 };
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [-90, -50, MAXV * VZ + 6], [90, -50, MAXV * VZ + 6]], 640, 380, { pad: 20, azimuth: 30, elevation: 26 });
function posts() {
  const out = [];
  for (const [x, y] of [[-94, -54], [94, -54]]) out.push(S(k.slabOf({ x: x - 4, y: y - 4, w: 8, d: 8, r: 1.2 }, 0, 3, P, 3), { tone: "lo" }), S(k.cylinder(x, y, 2.2, 3, MAXV * VZ + 4, P, 18), { tone: "mid", crease: "none" }));
  out.push(k.radialTicks ? "" : "");
  for (let v = 0; v < MAXV; v++) out.push(D([k.iso([-94, -54, 8 + v * VZ], P), k.iso([94, -54, 8 + v * VZ], P)], { size: 0.5 }));
  return out.join("");
}
const svg = k.figureSvg({ width: 640, height: 380, label: "Persistent tree versions", body: [bench(P, PLATE), posts(), layers("sheets"), layers("wires"), layers("nodes")] });

const code = String.raw`
const sheetsL=layer("sheets"),wiresL=layer("wires"),nodesL=layer("nodes");
let roots=[],nodes=[],view=0;
const X=k=>-85+k*KX,Z=v=>8+v*VZ;
function mk(key,L,R,v,depth){const n={key,L,R,v,depth,id:nodes.length};nodes.push(n);return n}
function insertP(t,key,v,d=0){if(!t)return mk(key,null,null,v,d);if(key<t.key)return mk(t.key,insertP(t.L,key,v,d+1),t.R,v,d);if(key>t.key)return mk(t.key,t.L,insertP(t.R,key,v,d+1),v,d);return t}
function reach(r){const s=new Set();(function w(n){if(!n||s.has(n))return;s.add(n);w(n.L);w(n.R)})(r);return s}
const pos=n=>[X(n.key),-40+n.depth*DY,Z(n.v)+2];
function draw(fresh=new Set()){sheetsL.innerHTML="";wiresL.innerHTML="";nodesL.innerHTML="";const live=reach(roots[view]);
 roots.forEach((_,v)=>{let h='<g style="opacity:'+(v===view?.55:.22)+'">'+solidSvg(slabOf({x:-90,y:-52,w:180,d:96,r:2},Z(v)-1,1,P,3),{tone:v===view?"mid":"lo",flat:true})+"</g>"+faceTextSvg(topMatrix([-86,40],Z(v),P,"x"),"v"+v,{size:5,tone:v===view?"hi":"mid"});
  for(const n of nodes.filter(n=>n.v===v))for(const c of [n.L,n.R])if(c){const on=live.has(n)&&live.has(c);h+=lineSvg(seg(pos(n),pos(c)),{tone:fresh.has(n)?"lit":on?"mid":"faint"})}
  for(const n of nodes.filter(n=>n.v===v).sort((a,b)=>depthOf(pos(a),P)-depthOf(pos(b),P))){const [x,y,z]=pos(n),on=live.has(n);h+=solidSvg(cylinder(x,y,4.4,z-2,3,P,22,.3),{tone:on?"hi":"lo",lit:fresh.has(n)})+faceTextSvg(topMatrix([x,y+1.6],z+1,P,"x"),String(n.key),{size:4.4,tone:on?"lo":"mid",anchor:"middle"})}
  art(h,sheetsL)})}
function render(){const shared=nodes.length?((reach(roots[view]).size)-[...reach(roots[view])].filter(n=>n.v===view).length):0;
 tables(roots.map((r,v)=>'<div class="mono"'+(v===view?' style="color:var(--acc)"':"")+">v"+v+": "+inorder(r).join(" ")+"</div>").join(""));stats([[U.versions,roots.length],[U.nodesN,nodes.length],[U.naive,roots.reduce((s,r)=>s+reach(r).size,0)],[U.shared,shared]])}
const inorder=r=>{const o=[];(function w(n){if(!n)return;w(n.L);o.push(n.key);w(n.R)})(r);return o};
async function insert(key){if(roots.length>=MAXV){say(U.full);return}hl(0);const v=roots.length,prev=roots[v-1]??null;const before=nodes.length;
 const r=insertP(prev,key,v);roots.push(r);view=v;const fresh=new Set(nodes.slice(before));hl(1);
 for(let i=0;i<=fresh.size;i++){draw(new Set([...fresh].slice(0,i)));await wait(220)}hl(2);draw(fresh);render();
 say(fmt(U.insSay,{k:key,v,n:fresh.size}));log(fmt(U.insLog,{k:key,v,n:fresh.size,s:reach(r).size-fresh.size}));setTimeout(()=>draw(),1800*slow)}
async function show(v){if(v<0||v>=roots.length)return;hl(4);view=v;draw();render();say(fmt(U.viewSay,{v}));log(fmt(U.viewLog,{v,k:inorder(roots[v]).join(" ")||"∅"}))}
function reset(){roots=[null];nodes=[];view=0;draw();render();say(U.empty);log(U.intro)}
const rnd=()=>{const have=inorder(roots[roots.length-1]);let x;do x=5+Math.floor(Math.random()*95);while(have.includes(x));return x};
bind({insert:()=>insert(rnd()),add:()=>{const v=+input();if(v>0&&v<100)return insert(v)},older:()=>show(view-1),newer:()=>show(view+1),reset});
reset();
startTour(async()=>{if(roots.length>=MAXV){for(let v=roots.length-1;v>=0;v--){await show(v);await wait(500)}reset();return}await insert(roots.length===1?50:rnd())});
`;

const TEXT = {
  en: {
    title: "Persistent structures", accent: "Persistent", machine: "Stacked sheets, one tree version each",
    lede: "Never overwrite: an update copies only the <strong>path from the root</strong> to the change, and the new version shares everything else with the old one. Every past version stays readable at O(log n) extra space per update.",
    refs: "Driscoll, Sarnak, Sleator &amp; Tarjan, 1989", hint: "Space inserts into a new version · S slows", keyA: "Nodes copied by this update", keyB: "Sheet v holds the nodes created in version v",
    controls: [{ act: "insert", label: "Insert (new version)", primary: true }, { pair: [["add", "Insert"]], placeholder: "42", type: "number" }, { act: "older", label: "◀ older" }, { act: "newer", label: "newer ▶" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>Insert</b>(t, k, v): if t = nil: return new node(k) on sheet v", "  copy t to sheet v; recurse into the side of k", "  the copy points to the new child and to the old other child", "", "<b>Read</b>(v): walk from root[v]  <i>// old versions untouched</i>"],
    ui: { versions: "versions", nodesN: "nodes", naive: "full copies", shared: "shared", full: "7 versions max: reset", insSay: "v{v}: +{k}, {n} node(s) copied", insLog: "Version {v} inserts {k}: {n} node(s) copied along the search path, {s} shared with older versions.", viewSay: "viewing v{v}", viewLog: "v{v} = {k}. Reading an old version just starts at its root.", empty: "v0: empty", intro: "Each insert makes a new version on a new sheet. Compare “nodes” with “full copies”: that is what path copying saves." },
    theory: [
      ["Kinds of persistence", `<p><strong>Partial</strong>: every version can be read, only the latest updated. <strong>Full</strong>: any version can be updated, forming a version tree. <strong>Confluent</strong>: versions can be merged, forming a DAG (think git).</p>`],
      ["Path copying", `<p>A balanced BST update touches $O(\\log n)$ nodes on one root-to-leaf path. Copy exactly those, so after $m$ updates the space is</p>$$O(n + m \\log n)$$<p>instead of $O(nm)$ for full copies, and every version keeps $O(\\log n)$ access.</p>`],
      ["Fat nodes and node copying", `<p>Driscoll et al. reach $O(1)$ amortized extra space per update for pointer machines with bounded in-degree: each node keeps a few extra timestamped pointer slots and is copied only when they fill up.</p>`],
      ["Where it is used", `<p>Functional languages (immutable maps in Clojure, Haskell, Scala), undo histories, MVCC snapshots in databases, and geometric algorithms like planar point location via persistent search trees.</p>`],
      ["To discuss", `<ol class="q"><li>Insert 6 keys. How many nodes did path copying create, against 6 full copies?</li><li>What breaks if two versions write to a shared node in place?</li><li>How would you model git branches with full persistence?</li></ol>`],
    ],
  },
  es: {
    title: "Estructuras persistentes", accent: "persistentes", machine: "Láminas apiladas, una versión del árbol cada una",
    lede: "Nunca sobrescribir: una actualización copia solo el <strong>camino desde la raíz</strong> hasta el cambio, y la versión nueva comparte todo lo demás con la vieja. Cada versión pasada queda legible con O(log n) de espacio extra por actualización.",
    refs: "Driscoll, Sarnak, Sleator &amp; Tarjan, 1989", hint: "Espacio inserta en una versión nueva · S lento", keyA: "Nodos copiados en esta actualización", keyB: "La lámina v guarda los nodos creados en la versión v",
    controls: [{ act: "insert", label: "Insertar (versión nueva)", primary: true }, { pair: [["add", "Insertar"]], placeholder: "42", type: "number" }, { act: "older", label: "◀ anterior" }, { act: "newer", label: "siguiente ▶" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>Insertar</b>(t, k, v): si t = nil: devolver nodo(k) en la lámina v", "  copiar t a la lámina v; recursión hacia el lado de k", "  la copia apunta al hijo nuevo y al otro hijo viejo", "", "<b>Leer</b>(v): recorrer desde raíz[v]  <i>// las versiones viejas no se tocan</i>"],
    ui: { versions: "versiones", nodesN: "nodos", naive: "copias completas", shared: "compartidos", full: "máximo 7 versiones: reinicia", insSay: "v{v}: +{k}, {n} nodo(s) copiados", insLog: "La versión {v} inserta {k}: {n} nodo(s) copiados por el camino de búsqueda, {s} compartidos con versiones anteriores.", viewSay: "viendo v{v}", viewLog: "v{v} = {k}. Leer una versión vieja solo empieza en su raíz.", empty: "v0: vacío", intro: "Cada inserción crea una versión nueva en otra lámina. Compara “nodos” con “copias completas”: eso es lo que ahorra copiar caminos." },
    theory: [
      ["Tipos de persistencia", `<p><strong>Parcial</strong>: toda versión se puede leer, solo la última se actualiza. <strong>Total</strong>: cualquier versión se puede actualizar, formando un árbol de versiones. <strong>Confluente</strong>: las versiones se pueden mezclar, formando un DAG (piensa en git).</p>`],
      ["Copia de caminos", `<p>Una actualización en un BST balanceado toca $O(\\log n)$ nodos en un camino raíz-hoja. Se copian exactamente esos, así que tras $m$ actualizaciones el espacio es</p>$$O(n + m \\log n)$$<p>en vez de $O(nm)$ con copias completas, y cada versión mantiene acceso $O(\\log n)$.</p>`],
      ["Nodos gordos y copia de nodos", `<p>Driscoll et al. logran $O(1)$ amortizado de espacio extra por actualización en máquinas de punteros con grado de entrada acotado: cada nodo guarda algunos punteros extra con marca de tiempo y solo se copia cuando se llenan.</p>`],
      ["Dónde se usa", `<p>Lenguajes funcionales (mapas inmutables en Clojure, Haskell, Scala), historiales de deshacer, snapshots MVCC en bases de datos, y algoritmos geométricos como ubicación de puntos en el plano con árboles de búsqueda persistentes.</p>`],
      ["Para discutir", `<ol class="q"><li>Inserta 6 llaves. ¿Cuántos nodos creó la copia de caminos, contra 6 copias completas?</li><li>¿Qué se rompe si dos versiones escriben en un nodo compartido directamente?</li><li>¿Cómo modelarías las ramas de git con persistencia total?</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "persistence", fig: "Fig 14", P, svg, consts: { MAXV, VZ, KX, DY }, code, TEXT, stateLabel: "O(log n) / update" }, UI);
