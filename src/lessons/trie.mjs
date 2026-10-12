// Week 05: tries. Blocks grow left to right, one per character; Patricia mode merges single-child chains.
import { bench, ruler, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const PLATE = { x: -128, y: -58, w: 256, d: 116, r: 8 };
const DX = 27, LANE = 17, X0 = -108;
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [X0, 0, 30]], 660, 360, { pad: 20, azimuth: 64 });
const svg = k.figureSvg({ width: 660, height: 360, label: "Trie machine", body: [
  bench(P, PLATE, { label: { x: 70, y: 40, w: 44, d: 12, r: 1.5 } }), ruler(P, X0, X0 + DX * 8, -54, { step: DX / 2, every: 2 }), layers("edges"), layers("nodes"), layers("air"),
] });

const code = String.raw`
const edgesL=layer("edges"),nodesL=layer("nodes"),airL=layer("air");
let root={c:"",kids:{},end:false},words=[],patricia=false,lastPath=[];
const WORDS=U.words.split(" ");
function build(){// view tree: trie nodes or compressed edges
 const view=n=>({label:n.c,end:n.end,ref:n,kids:Object.keys(n.kids).sort().map(c=>view(n.kids[c]))});
 const squash=v=>{v.kids=v.kids.map(squash);if(v.label!==""&&v.kids.length===1&&!v.end){const c=v.kids[0];return {label:v.label+c.label,end:c.end,ref:c.ref,refs:[v.ref,...(c.refs||[c.ref])],kids:c.kids}}return v};
 let t=view(root);if(patricia)t.kids=t.kids.map(squash);
 let lane=0;const place=(v,d)=>{v.d=d;if(!v.kids.length){v.lane=lane++;return}v.kids.forEach(c=>place(c,d+1));v.lane=(v.kids[0].lane+v.kids[v.kids.length-1].lane)/2};place(t,0);
 const span=Math.max(1,lane-1);const out=[];(function walk(v,p){v.x=X0+v.d*DX;v.y=(v.lane-span/2)*LANE;out.push(v);if(p)v.parent=p;v.kids.forEach(c=>walk(c,v))})(t,null);return out}
function nodeArt(v,on){const w=v.label.length>1?Math.min(DX-4,8+v.label.length*4.2):14,pl={x:v.x-w/2,y:v.y-5.5,w,d:11,r:1.4},h=v.d===0?10:6;
 let s=solidSvg(slabOf(pl,0,h,P,3,.4),{tone:v.d===0?"lo":"mid",lit:on});
 if(v.label)s+=faceTextSvg(topMatrix([v.x,v.y+1.6],h,P,"x"),v.label,{size:7,tone:"hi",anchor:"middle"});
 if(v.end)s+=solidSvg(cylinder(v.x+w/2-2.4,v.y-2.6,1.8,h,1.2,P,14),{tone:"mid"});
 return s}
function draw(on=[]){const nodes=build();nodesL.innerHTML="";edgesL.innerHTML="";
 for(const v of nodes){if(v.parent){const p=v.parent,mx=(p.x+v.x)/2;edgesL.insertAdjacentHTML("beforeend",lineSvg(poly([[p.x+5,p.y,.2],[mx,p.y,.2],[mx,v.y,.2],[v.x-5,v.y,.2]]),{tone:on.includes(v.ref)?"lit":"mid"}))}
  const g=art(nodeArt(v,on.includes(v.ref)||(v.refs||[]).some(r=>on.includes(r))),nodesL);g.pos=[v.x,v.y,0]}
 sortBy(nodesL);return nodes}
function count(){let n=0;(function w(x){n++;Object.values(x.kids).forEach(w)})(root);return n}
function render(){const nodes=build();tables('<div class="mono">'+U.wordsLabel+": "+words.join(", ")+"</div>");stats([[U.words2,words.length],[U.nodes,patricia?nodes.length:count()],[U.chars,words.join("").length],[U.mode,patricia?"Patricia":"Trie"]])}
async function token(path){const nodes=build();const tk=art(solidSvg(cylinder(0,0,2.6,0,2.4,P,18),{tone:"hi",lit:true}),airL);
 for(let i=0;i<path.length;i++){const v=nodes.find(n=>n.ref===path[i]||(n.refs||[]).includes(path[i]));if(!v)continue;const to=[v.x,v.y,12];if(!tk.pos)place(tk,to);else await tween(tk,to,220,4);draw(path.slice(0,i+1))}
 tk.remove()}
async function insert(w){w=(w||"").toLowerCase().replace(/[^a-zñ]/g,"").slice(0,8);if(!w)return;hl(0);
 if(words.includes(w)){say(fmt(U.already,{w}));return}
 let n=root;const path=[root];let made=0;
 for(const c of w){hl(1);if(!n.kids[c]){hl(2);n.kids[c]={c,kids:{},end:false};made++}n=n.kids[c];path.push(n)}
 hl(3);n.end=true;words.push(w);await token(path);render();say(fmt(U.inserted,{w,n:made}));log(fmt(U.insertLog,{w,n:made,s:w.length-made}));setTimeout(()=>draw(),700*slow)}
async function search(w){w=(w||"").toLowerCase();if(!w)return;hl(5);let n=root;const path=[root];
 for(const c of w){hl(6);if(!n.kids[c]){await token(path);say(fmt(U.miss,{w,c}));log(fmt(U.missLog,{w,c,d:path.length-1}));draw();return}n=n.kids[c];path.push(n)}
 await token(path);hl(7);say(n.end?fmt(U.hit,{w}):fmt(U.prefix,{w}));log(n.end?fmt(U.hitLog,{w,d:w.length}):fmt(U.prefixLog,{w,k:words.filter(x=>x.startsWith(w)).join(", ")}));setTimeout(()=>draw(),900*slow)}
function reset(){root={c:"",kids:{},end:false};words=[];draw();render();say(U.empty);log(U.intro)}
bind({insert:()=>insert(WORDS.find(w=>!words.includes(w))||WORDS[0]),add:()=>insert(input()),find:()=>search(input()),mode:()=>{patricia=!patricia;draw();render();say(patricia?U.patOn:U.patOff);log(patricia?U.patLog:U.trieLog)},reset});
reset();
let step=0;startTour(async()=>{if(words.length>=WORDS.length){patricia=!patricia;draw();render();await wait(1600);reset();return}step++%4===3?await search(WORDS[Math.floor(Math.random()*words.length)].slice(0,3)):await insert(WORDS[words.length])});
`;

const TEXT = {
  en: {
    title: "Tries", accent: "Tries", machine: "A letter sorter that branches on each character",
    lede: "Store strings by their characters, one level per position. Lookup costs <strong>O(|w|)</strong>, independent of how many words there are, and every prefix is a node.",
    refs: "Fredkin, 1960 · Morrison, 1968", hint: "Space inserts · S slows", keyA: "The token walking the path", keyB: "One block per character; a coin marks a word end",
    controls: [{ act: "insert", label: "Insert next word", primary: true }, { pair: [["add", "Insert"], ["find", "Search"]], placeholder: "word" }, { act: "mode", label: "Trie ↔ Patricia" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>Insert</b>(w): n ← root", "  for c in w:", "    if c ∉ n.kids: n.kids[c] ← new node", "  n ← n.kids[c];  n.end ← true", "", "<b>Search</b>(w): n ← root", "  for c in w: if c ∉ n.kids: no; n ← n.kids[c]", "  return n.end"],
    ui: { words: "car cart care cat do dog dot dove sun", wordsLabel: "words", words2: "words", nodes: "nodes", chars: "chars", mode: "mode", already: "“{w}” is already stored", inserted: "“{w}”: {n} new node(s)", insertLog: "Insert “{w}”: shared {s} prefix node(s), created {n}.", miss: "“{w}”: no edge “{c}”", missLog: "Search “{w}” stops at depth {d}: there is no child “{c}”. Not stored.", hit: "“{w}” found", hitLog: "“{w}” found after {d} steps, one per character.", prefix: "“{w}” is only a prefix", prefixLog: "“{w}” is a prefix of: {k}. The node exists but is not a word end.", patOn: "Patricia view", patOff: "plain trie", patLog: "Patricia (radix) trie: every chain of single-child nodes is merged into one edge labelled with a string. Same words, fewer nodes.", trieLog: "Plain trie: one node per character.", empty: "empty trie", intro: "Words that share a prefix share the path. Try Patricia view after a few inserts." },
    theory: [
      ["The idea", `<p>A <strong>trie</strong> is a tree whose edges are labelled by characters; the path from the root to a node spells a prefix. Words that share a prefix share the path.</p>`],
      ["Cost", `<p>Insert, search and delete of a word $w$ cost $O(|w|)$ steps, plus the cost of choosing a child (array of size $\\sigma$ or hash map). Space is $O(N)$ nodes for total length $N$, up to $O(N\\sigma)$ pointers with arrays.</p>`],
      ["Patricia and radix tries", `<p>Merge every chain of single-child nodes into one edge labelled with a substring. With $n$ words the tree has at most $2n - 1$ nodes, independent of their length. Storing the edge as (offset, length) into the original strings keeps it compact.</p>`],
      ["Prefix queries", `<p>All words with prefix $p$ live in the subtree under the node for $p$: autocompletion costs $O(|p| + \\text{output})$. That is why IP routing tables use radix tries for longest-prefix match.</p>`],
      ["To discuss", `<ol class="q"><li>Insert “car”, “cart”, “care”. How many nodes in the trie, how many in the Patricia view?</li><li>How would you delete a word without leaving dead branches?</li><li>Trie vs hash table for a dictionary: what does each make cheap?</li></ol>`],
    ],
  },
  es: {
    title: "Tries", accent: "Tries", machine: "Un clasificador que se ramifica por cada carácter",
    lede: "Guardar cadenas por sus caracteres, un nivel por posición. Buscar cuesta <strong>O(|w|)</strong>, sin importar cuántas palabras haya, y cada prefijo es un nodo.",
    refs: "Fredkin, 1960 · Morrison, 1968", hint: "Espacio inserta · S lento", keyA: "La ficha que recorre el camino", keyB: "Un bloque por carácter; una moneda marca fin de palabra",
    controls: [{ act: "insert", label: "Insertar siguiente", primary: true }, { pair: [["add", "Insertar"], ["find", "Buscar"]], placeholder: "palabra" }, { act: "mode", label: "Trie ↔ Patricia" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>Insertar</b>(w): n ← raíz", "  para c en w:", "    si c ∉ n.hijos: n.hijos[c] ← nodo nuevo", "  n ← n.hijos[c];  n.fin ← verdadero", "", "<b>Buscar</b>(w): n ← raíz", "  para c en w: si c ∉ n.hijos: no; n ← n.hijos[c]", "  devolver n.fin"],
    ui: { words: "casa cama carro cara gato gana gas sol", wordsLabel: "palabras", words2: "palabras", nodes: "nodos", chars: "letras", mode: "modo", already: "“{w}” ya está guardada", inserted: "“{w}”: {n} nodo(s) nuevo(s)", insertLog: "Insertar “{w}”: comparte {s} nodo(s) de prefijo, crea {n}.", miss: "“{w}”: no hay arista “{c}”", missLog: "Buscar “{w}” se detiene en profundidad {d}: no hay hijo “{c}”. No está guardada.", hit: "“{w}” encontrada", hitLog: "“{w}” encontrada en {d} pasos, uno por carácter.", prefix: "“{w}” es solo un prefijo", prefixLog: "“{w}” es prefijo de: {k}. El nodo existe pero no es fin de palabra.", patOn: "vista Patricia", patOff: "trie simple", patLog: "Trie Patricia (radix): cada cadena de nodos con un solo hijo se fusiona en una arista con etiqueta de texto. Mismas palabras, menos nodos.", trieLog: "Trie simple: un nodo por carácter.", empty: "trie vacío", intro: "Palabras con prefijo común comparten camino. Prueba la vista Patricia tras unas inserciones." },
    theory: [
      ["La idea", `<p>Un <strong>trie</strong> es un árbol cuyas aristas tienen caracteres; el camino de la raíz a un nodo deletrea un prefijo. Las palabras con prefijo común comparten el camino.</p>`],
      ["Costo", `<p>Insertar, buscar y borrar una palabra $w$ cuesta $O(|w|)$ pasos, más el costo de elegir un hijo (arreglo de tamaño $\\sigma$ o mapa hash). El espacio es $O(N)$ nodos para longitud total $N$, hasta $O(N\\sigma)$ punteros con arreglos.</p>`],
      ["Tries Patricia y radix", `<p>Se fusiona cada cadena de nodos con un solo hijo en una arista con una subcadena. Con $n$ palabras el árbol tiene a lo más $2n - 1$ nodos, sin importar su longitud. Guardar la arista como (offset, longitud) sobre las cadenas originales lo mantiene compacto.</p>`],
      ["Consultas por prefijo", `<p>Todas las palabras con prefijo $p$ viven en el subárbol bajo el nodo de $p$: autocompletar cuesta $O(|p| + \\text{salida})$. Por eso las tablas de ruteo IP usan tries radix para el prefijo más largo.</p>`],
      ["Para discutir", `<ol class="q"><li>Inserta “casa”, “cama”, “cara”. ¿Cuántos nodos en el trie y cuántos en la vista Patricia?</li><li>¿Cómo borrarías una palabra sin dejar ramas muertas?</li><li>Trie contra tabla hash para un diccionario: ¿qué abarata cada uno?</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "tries", fig: "Fig 5", P, svg, consts: { DX, LANE, X0 }, code, TEXT }, UI);
