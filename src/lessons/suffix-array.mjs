// Week 06: suffix arrays. One card per suffix in a rack; Build sorts the cards, Search clamps them by binary search.
import { bench, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const ROWZ = 9, MAXN = 10, CH = 4.6, XL = -50, W = 100, DD = 22, Z0 = 4;
const PLATE = { x: -96, y: -40, w: 192, d: 84, r: 8 };
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [XL - 6, 0, Z0 + MAXN * ROWZ + 6], [XL + W + 8, 0, Z0 + MAXN * ROWZ + 6]], 640, 380, { pad: 18, azimuth: 66 });

// Chest carcass: plinth, two side panels, a back, a top, and a rail for the clamps.
function chest() {
  const H = MAXN * ROWZ + 2, out = [];
  out.push(S(k.slabOf({ x: XL - 6, y: -DD / 2 - 2, w: W + 12, d: DD + 4, r: 1.5 }, 0, Z0, P, 4, 0.5), { tone: "lo" }));
  out.push(S(k.slabOf({ x: XL - 4, y: -DD / 2 - 2, w: W + 8, d: 2, r: 0.4 }, Z0, H, P, 2), { tone: "lo", crease: "none" }));
  out.push(S(k.slabOf({ x: XL - 6, y: -DD / 2 - 2, w: 3, d: DD + 4, r: 0.6 }, Z0, H, P, 3), { tone: "mid" }));
  return out.join("");
}
function chestFront() {
  const H = MAXN * ROWZ + 2, out = [];
  out.push(S(k.slabOf({ x: XL + W + 3, y: -DD / 2 - 2, w: 3, d: DD + 4, r: 0.6 }, Z0, H, P, 3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: XL - 6, y: -DD / 2 - 2, w: W + 12, d: DD + 4, r: 1.5 }, Z0 + H, 3, P, 4, 0.5), { tone: "mid" }));
  const rail = k.sideTicks ? "" : "";
  out.push(S(k.slabOf({ x: XL + W + 6, y: DD / 2 - 4, w: 3, d: 3, r: 0.6 }, Z0, H, P, 2), { tone: "lo", crease: "none" }));
  out.push(D([0, 1].map((t) => k.iso([XL + W + 4.5, DD / 2 + 1, Z0 + 4 + t * (H - 8)], P)), { size: 0.45 }));
  return out.join("") + rail;
}
const svg = k.figureSvg({ width: 640, height: 380, label: "Suffix array chest of drawers", body: [bench(P, PLATE, { label: { x: 50, y: 24, w: 36, d: 12, r: 1.5 } }), chest(), layers("cards"), chestFront(), layers("clamps")] });

const code = String.raw`
const cardsL=layer("cards"),clampsL=layer("clamps");
let T="",SA=[],LCP=[],cards=[];
const Z=r=>Z0+(MAXN-1-r)*ROWZ+.5;
function cardArt(s,i,on,dim){const pl={x:XL,y:-DD/2,w:W,d:DD,r:.8};const h=ROWZ-1;
 return solidSvg(slabOf(pl,0,h,P,2,.3),{tone:dim?"lo":"hi",lit:on})+lineSvg(seg([XL+W/2-8,DD/2,h*.35],[XL+W/2+8,DD/2,h*.35]),{tone:"lo"})
 +faceTextSvg(sideMatrix([XL+4,DD/2],h-1.4,P,"left"),s,{size:5.6,tone:"lo"})+faceTextSvg(sideMatrix([XL+W-4,DD/2],h-1.4,P,"left"),String(i),{size:4,tone:"mid",anchor:"end"})}
function drawCard(c,on=false,dim=false){c.g.innerHTML=cardArt(T.slice(c.i),c.i,on,dim)}
const sortZ=()=>[...cardsL.children].sort((a,b)=>a.pos[2]-b.pos[2]||a.pos[1]-b.pos[1]).forEach(c=>cardsL.appendChild(c));
function clamp(row,name){let g=clampsL.querySelector('[data-c="'+name+'"]');if(row===null){g&&g.remove();return}if(!g){g=art("",clampsL);g.setAttribute("data-c",name)}
 g.innerHTML=solidSvg(slabOf({x:XL+W+5,y:DD/2-5,w:5,d:5,r:.8},0,2.2,P,2),{tone:name==="mid"?"hi":"mid",lit:name==="mid"});place(g,[0,0,Z(row)+(name==="hi"?0:ROWZ-3)])}
function render(){tables(cells("SA",U.sa,SA)+cells("LCP","",LCP)+'<div class="mono">T = '+T+"</div>");stats([["n",T.length],[U.distinct,new Set(T).size],[U.maxLcp,Math.max(0,...LCP.map(Number).filter(n=>!isNaN(n)))],["log₂ n",Math.ceil(Math.log2(Math.max(2,T.length)))]])}
function load(text){T=(text||U.text).toLowerCase().replace(/[^a-z$]/g,"").slice(0,MAXN-1);if(!T.endsWith("$"))T+="$";cardsL.innerHTML="";clampsL.innerHTML="";
 cards=[...T].map((_,i)=>{const c={i,g:art("",cardsL)};place(c.g,[0,0,Z(i)]);drawCard(c);return c});sortZ();SA=[...T].map((_,i)=>i);LCP=SA.map(()=>"·");render();say(fmt(U.loaded,{t:T}));log(U.intro)}
const lcp=(a,b)=>{let n=0;while(T[a+n]&&T[a+n]===T[b+n])n++;return n};
const sorted=()=>SA.every((s,r)=>r===0||T.slice(SA[r-1])<T.slice(s));
async function build(){hl(0);say(U.sorting);const order=[...T].map((_,i)=>i).sort((a,b)=>T.slice(a)<T.slice(b)?-1:1);hl(1);
 const moving=cards.filter(c=>order.indexOf(c.i)!==SA.indexOf(c.i));
 await Promise.all(moving.map(c=>tween(c.g,[0,DD+6,c.g.pos[2]],300)));sortZ();
 await Promise.all(moving.map(c=>tween(c.g,[0,DD+6,Z(order.indexOf(c.i))],520)));
 await Promise.all(moving.map(c=>tween(c.g,[0,0,Z(order.indexOf(c.i))],300)));sortZ();
 SA=order;hl(2);LCP=SA.map((s,r)=>r?lcp(SA[r-1],s):0);render();say(U.sorted);log(fmt(U.sortedLog,{sa:SA.join(" ")}))}
async function search(p){p=(p||"").toLowerCase();if(!p)return;if(!sorted()){await build();await wait(300)}
 const n=T.length;let lo=0,hi=n;hl(4);clamp(0,"lo");clamp(n-1,"hi");const pre=r=>T.slice(SA[r],SA[r]+p.length);let probes=0;
 while(lo<hi){hl(5);const mid=(lo+hi)>>1;probes++;const c=cards.find(c=>c.i===SA[mid]);clamp(mid,"mid");drawCard(c,true);await tween(c.g,[0,8,Z(mid)],220);await wait(260);await tween(c.g,[0,0,Z(mid)],200);drawCard(c);
  if(pre(mid)<p)lo=mid+1;else hi=mid;if(lo<n)clamp(lo,"lo")}
 const first=lo;hi=n;while(lo<hi){const mid=(lo+hi)>>1;probes++;if(pre(mid)<=p)lo=mid+1;else hi=mid}
 clamp(null,"mid");if(first<n)clamp(first,"lo");clamp(Math.max(first,lo-1)<n?Math.max(first,lo-1):n-1,"hi");hl(6);
 const occ=SA.slice(first,lo);cards.forEach(c=>drawCard(c,occ.includes(c.i),!occ.includes(c.i)));
 say(occ.length?fmt(U.found,{p,n:occ.length}):fmt(U.none,{p}));log(occ.length?fmt(U.foundLog,{p,pos:occ.sort((a,b)=>a-b).join(", "),k:probes}):fmt(U.noneLog,{p,k:probes}));
 setTimeout(()=>{cards.forEach(c=>drawCard(c));clampsL.innerHTML=""},2600*slow)}
bind({build,load:()=>{load(input())},find:()=>search(input()),probe:()=>search(U.patterns.split(" ")[Math.floor(Math.random()*3)]),reset:()=>load(U.text)});
load(U.text);
let st=0;startTour(async()=>{const s=st++%4;if(s===0){load(U.text);await wait(600);await build()}else await search(U.patterns.split(" ")[s-1])});
`;

const TEXT = {
  en: {
    title: "Suffix arrays", accent: "arrays", machine: "A chest with one drawer per suffix",
    lede: "Sort every suffix of a text once. Then any pattern is found by <strong>binary search</strong>: its occurrences sit in one contiguous block of drawers.",
    refs: "Manber &amp; Myers, 1993", hint: "Space sorts the drawers · S slows", keyA: "The drawer being compared", keyB: "One drawer per suffix; its start index on the right",
    controls: [{ act: "build", label: "Sort suffixes", primary: true }, { pair: [["load", "Load text"], ["find", "Search"]], placeholder: "ana" }, { act: "probe", label: "Random pattern" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>Build</b>(T): suffixes T[i..] for i = 0..n−1", "  sort them  <i>// O(n log n), or O(n) with SA-IS</i>", "  LCP[r] ← lcp(SA[r−1], SA[r])", "", "<b>Search</b>(p): lo ← 0, hi ← n", "  while lo &lt; hi: mid ← ⌊(lo+hi)/2⌋; compare p with T[SA[mid]..]", "  occurrences = SA[first..last]"],
    ui: { text: "banana", patterns: "ana na ban", sa: "suffix starts", distinct: "alphabet", maxLcp: "max LCP", loaded: "T = {t}", sorting: "sorting suffixes", sorted: "rack sorted", sortedLog: "SA = [{sa}]. Suffixes now sit in lexicographic order; LCP holds the shared prefix with the card above.", found: "“{p}”: {n} occurrence(s)", none: "“{p}”: no occurrence", foundLog: "“{p}” occurs at positions {pos}. Two binary searches, {k} comparisons, O(|p| log n).", noneLog: "“{p}” does not occur: the clamps closed on an empty block after {k} comparisons.", empty: "", intro: "Sort the rack, then search a pattern: the clamps narrow the block of matching suffixes." },
    theory: [
      ["Suffix array", `<p>For a text $T$ of length $n$ (ending in a unique $\\$$), the suffix array $SA$ lists the starting positions of all suffixes in lexicographic order. It uses $n$ integers, against about $20n$ bytes for a suffix tree.</p>`],
      ["Pattern matching", `<p>All occurrences of $p$ are prefixes of a contiguous range of suffixes. Two binary searches find that range in</p>$$O(|p| \\log n)$$<p>comparisons; with the LCP array it drops to $O(|p| + \\log n)$.</p>`],
      ["LCP array", `<p>$LCP[r]$ is the length of the longest common prefix of the suffixes at ranks $r-1$ and $r$. Kasai's algorithm builds it in $O(n)$. The maximum LCP is the longest repeated substring.</p>`],
      ["Suffix trees", `<p>The compacted trie of all suffixes: $n$ leaves, at most $n-1$ internal nodes, built in $O(n)$ by Ukkonen. A DFS of the suffix tree visiting children in order yields exactly the suffix array, and its internal nodes are the LCP intervals.</p>`],
      ["To discuss", `<ol class="q"><li>Load “mississippi” and find the longest repeated substring from the LCP row.</li><li>Why does the text need a unique terminator $\\$$?</li><li>How would you count distinct substrings using SA and LCP?</li></ol>`],
    ],
  },
  es: {
    title: "Suffix arrays", accent: "arrays", machine: "Una cómoda con un cajón por sufijo",
    lede: "Ordenar una vez todos los sufijos de un texto. Luego cualquier patrón se encuentra por <strong>búsqueda binaria</strong>: sus apariciones están en un bloque contiguo de cajones.",
    refs: "Manber &amp; Myers, 1993", hint: "Espacio ordena · S lento", keyA: "El cajón que se compara", keyB: "Un cajón por sufijo; su índice a la derecha",
    controls: [{ act: "build", label: "Ordenar sufijos", primary: true }, { pair: [["load", "Cargar texto"], ["find", "Buscar"]], placeholder: "ana" }, { act: "probe", label: "Patrón al azar" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>Construir</b>(T): sufijos T[i..] para i = 0..n−1", "  ordenarlos  <i>// O(n log n), u O(n) con SA-IS</i>", "  LCP[r] ← lcp(SA[r−1], SA[r])", "", "<b>Buscar</b>(p): lo ← 0, hi ← n", "  mientras lo &lt; hi: mid ← ⌊(lo+hi)/2⌋; comparar p con T[SA[mid]..]", "  apariciones = SA[primero..último]"],
    ui: { text: "banana", patterns: "ana na ban", sa: "inicio de sufijos", distinct: "alfabeto", maxLcp: "LCP máx", loaded: "T = {t}", sorting: "ordenando sufijos", sorted: "estante ordenado", sortedLog: "SA = [{sa}]. Los sufijos quedan en orden lexicográfico; LCP guarda el prefijo común con la tarjeta de arriba.", found: "“{p}”: {n} aparición(es)", none: "“{p}”: no aparece", foundLog: "“{p}” aparece en las posiciones {pos}. Dos búsquedas binarias, {k} comparaciones, O(|p| log n).", noneLog: "“{p}” no aparece: las prensas se cerraron sobre un bloque vacío tras {k} comparaciones.", empty: "", intro: "Ordena el estante y busca un patrón: las prensas encierran el bloque de sufijos que coinciden." },
    theory: [
      ["Suffix array", `<p>Para un texto $T$ de longitud $n$ (que termina en un $\\$$ único), el suffix array $SA$ lista las posiciones de inicio de todos los sufijos en orden lexicográfico. Usa $n$ enteros, contra unos $20n$ bytes de un suffix tree.</p>`],
      ["Búsqueda de patrones", `<p>Todas las apariciones de $p$ son prefijos de un rango contiguo de sufijos. Dos búsquedas binarias encuentran ese rango en</p>$$O(|p| \\log n)$$<p>comparaciones; con el arreglo LCP baja a $O(|p| + \\log n)$.</p>`],
      ["Arreglo LCP", `<p>$LCP[r]$ es la longitud del prefijo común más largo entre los sufijos de rango $r-1$ y $r$. El algoritmo de Kasai lo construye en $O(n)$. El LCP máximo es la subcadena repetida más larga.</p>`],
      ["Suffix trees", `<p>El trie compactado de todos los sufijos: $n$ hojas, a lo más $n-1$ nodos internos, construido en $O(n)$ por Ukkonen. Un DFS del suffix tree que visita los hijos en orden produce exactamente el suffix array, y sus nodos internos son los intervalos LCP.</p>`],
      ["Para discutir", `<ol class="q"><li>Carga “mississippi” y encuentra la subcadena repetida más larga en la fila LCP.</li><li>¿Por qué el texto necesita un terminador único $\\$$?</li><li>¿Cómo contarías subcadenas distintas usando SA y LCP?</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "suffix-arrays", fig: "Fig 6", P, svg, consts: { ROWZ, MAXN, CH, XL, W, DD, Z0 }, code, TEXT }, UI);
