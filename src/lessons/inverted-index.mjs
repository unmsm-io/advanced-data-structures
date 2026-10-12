// Week 07: inverted index. One rail per term, one peg slot per document; AND sweeps a merge carriage.
import { bench, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const NT = 8, ND = 8, RY = 11, DX = 16, X0 = -40, Y0 = -38;
const PLATE = { x: -108, y: -54, w: 216, d: 110, r: 8 };
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [X0, Y0, 24]], 640, 340, { pad: 24, azimuth: 52 });
const rx = (d) => X0 + d * DX, ry = (t) => Y0 + t * RY;

function rails() {
  const out = [];
  for (let t = 0; t < NT; t++) {
    const r = { x: rx(0) - 10, y: ry(t) - 2.5, w: (ND - 1) * DX + 20, d: 5, r: 1 };
    out.push(S(k.slabOf(r, 0, 3, P, 3, 0.4), { tone: "mid" }));
    for (let d = 0; d < ND; d++) out.push(L(k.ring(rx(d), ry(t), 1.4, 3, P, 12), { tone: "lo" }));
    out.push(S(k.slabOf({ x: rx(0) - 56, y: ry(t) - 3.5, w: 40, d: 7, r: 1 }, 0, 2, P, 3), { tone: "lo", crease: "none" }));
  }
  const strip = { x: rx(0) - 8, y: ry(NT - 1) + 6, w: (ND - 1) * DX + 16, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(D(Array.from({ length: ND }, (_, d) => k.iso([rx(d), strip.y + 3, 0.8], P)), { size: 0.5 }));
  return out.join("");
}
const svg = k.figureSvg({ width: 640, height: 340, label: "Inverted index rails", body: [bench(P, PLATE), rails(), layers("labels"), layers("pegs"), layers("air")] });

const code = String.raw`
const labelsL=layer("labels"),pegsL=layer("pegs"),airL=layer("air");
const DOCS=U.docs.split("|").map(s=>s.trim());const tok=s=>s.toLowerCase().split(/[^a-záéíóúñ]+/).filter(w=>w.length>2);
const TERMS=U.terms.split(" ");let post=TERMS.map(()=>[]),indexed=0,pegs={};
TERMS.forEach((w,t)=>labelsL.insertAdjacentHTML("beforeend",faceTextSvg(topMatrix([rx(0)-52,ry(t)+1.6],2,P,"x"),w,{size:4.6,tone:"hi"})));
for(let d=0;d<ND;d++)labelsL.insertAdjacentHTML("beforeend",faceTextSvg(topMatrix([rx(d),ry(NT-1)+10.4],.8,P,"x"),String(d+1),{size:4,tone:"mid",anchor:"middle"}));
function peg(t,d,on){const key=t+"-"+d;let g=pegs[key];if(!g){g=art("",pegsL);g.pos=[rx(d),ry(t),0];pegs[key]=g}g.innerHTML=solidSvg(cylinder(rx(d),ry(t),2,3,6,P,16),{tone:"hi",lit:on})}
function render(hit=[]){tables('<div class="mono" style="line-height:1.8">'+TERMS.map((w,t)=>"<b style=\"display:inline;font:inherit;color:var(--acc)\">"+w+"</b> → "+(post[t].map(d=>d+1).join(", ")||"·")+"  <span style=\"opacity:.5\">Δ "+post[t].map((d,i)=>i?d-post[t][i-1]:d+1).join(",")+"</span>").join("<br>")+"</div>");
 stats([[U.docsN,indexed+"/"+ND],[U.termsN,post.filter(p=>p.length).length],[U.postings,post.reduce((s,p)=>s+p.length,0)],[U.hits,hit.length]])}
async function indexNext(){if(indexed>=ND){reset();return}hl(0);const d=indexed,words=new Set(tok(DOCS[d]));log(fmt(U.indexLog,{d:d+1,t:DOCS[d]}));
 const ts=TERMS.map((w,t)=>words.has(w)?t:-1).filter(t=>t>=0);hl(1);
 for(const t of ts){const g=art(solidSvg(cylinder(0,0,2,0,6,P,16),{tone:"hi",lit:true}),airL);place(g,[rx(d),ry(t),40]);await tween(g,[rx(d),ry(t),3],280);g.remove();post[t].push(d);peg(t,d,false);sortBy(pegsL)}
 indexed++;hl(2);render();say(fmt(U.indexed,{d:d+1,n:ts.length}))}
async function query(q,op){const ws=tok(q).filter(w=>TERMS.includes(w));if(ws.length<1){say(U.unknown);return}const lists=ws.map(w=>post[TERMS.indexOf(w)]);
 hl(op==="and"?4:6);ws.forEach(w=>post[TERMS.indexOf(w)].forEach(d=>peg(TERMS.indexOf(w),d,true)));
 const car=art("",airL);const drawCar=x=>{car.innerHTML=solidSvg(slabOf({x:x-3,y:ry(0)-6,w:6,d:(NT-1)*RY+12,r:1},9,2,P,2),{tone:"hi",lit:true})};car.pos=[0,0,99];
 let res=[];if(op==="and"){const idx=lists.map(()=>0);let steps=0;
  while(idx.every((i,j)=>i<lists[j].length)){steps++;const cur=idx.map((i,j)=>lists[j][i]),mx=Math.max(...cur);drawCar(rx(mx));await wait(380);
   if(cur.every(c=>c===mx)){res.push(mx);idx.forEach((_,j)=>idx[j]++)}else idx.forEach((i,j)=>{if(lists[j][i]<mx)idx[j]++})}
  log(fmt(U.andLog,{q:ws.join(" AND "),r:res.map(d=>d+1).join(", ")||"∅",s:steps}))}
 else{res=[...new Set(lists.flat())].sort((a,b)=>a-b);for(const d of res){drawCar(rx(d));await wait(200)}log(fmt(U.orLog,{q:ws.join(" OR "),r:res.map(d=>d+1).join(", ")}))}
 car.remove();say(fmt(U.result,{n:res.length}));render(res);
 setTimeout(()=>{Object.keys(pegs).forEach(k=>{const [t,d]=k.split("-").map(Number);peg(t,d,ws.includes(TERMS[t])&&res.includes(d))})},10);
 setTimeout(()=>Object.keys(pegs).forEach(k=>{const [t,d]=k.split("-").map(Number);peg(t,d,false)}),2600*slow)}
function reset(){post=TERMS.map(()=>[]);indexed=0;pegsL.innerHTML="";pegs={};render();say(U.empty);log(U.intro)}
const QS=U.queries.split("|");
bind({insert:indexNext,and:()=>query(input(),"and"),or:()=>query(input(),"or"),probe:()=>query(QS[Math.floor(Math.random()*QS.length)],"and"),reset});
reset();
startTour(async()=>{if(indexed<ND)await indexNext();else{await query(QS[Math.floor(Math.random()*QS.length)],Math.random()<.7?"and":"or");if(Math.random()<.3){await wait(1500);reset()}}});
`;

const TEXT = {
  en: {
    title: "Inverted index", accent: "index", machine: "A rail of pegs for every word",
    lede: "Turn documents inside out: for every term, keep the sorted list of documents that contain it. A query becomes a <strong>merge of posting lists</strong>, not a scan of the corpus.",
    refs: "Zobel &amp; Moffat, 2006", hint: "Space indexes the next document · S slows", keyA: "Pegs being indexed and the merge carriage", keyB: "One rail per term, one slot per document",
    controls: [{ act: "insert", label: "Index next document", primary: true }, { pair: [["and", "AND"], ["or", "OR"]], placeholder: "tree search" }, { act: "probe", label: "Random query" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>Index</b>(d): for each term w in d:", "  append d to postings[w]  <i>// ids arrive sorted</i>", "  store gaps d − previous", "", "<b>And</b>(a, b): i, j ← 0", "  while both remain: equal → output; else advance the smaller", "<b>Or</b>(a, b): merge, skip duplicates"],
    ui: { docs: "binary search tree | hash table search | tree index for search | heap and queue | search engine index | hash index | queue tree | engine heap", terms: "binary search tree hash table index heap queue", queries: "search tree|hash index|search index|tree heap|engine index", gaps: "gaps", docsN: "docs", termsN: "terms", postings: "postings", hits: "hits", indexLog: "Doc {d}: “{t}”", indexed: "doc {d}: {n} term(s)", andLog: "{q} → docs {r}. The carriage walked both lists once: {s} steps, O(|a| + |b|).", orLog: "{q} → docs {r}.", result: "{n} document(s)", unknown: "no indexed term in the query", empty: "empty index", intro: "Index the documents one by one, then run an AND query: the carriage merges the rails." },
    theory: [
      ["The structure", `<p>A <strong>dictionary</strong> of terms, each pointing to a <strong>posting list</strong>: the sorted ids of the documents that contain the term (optionally with frequencies and positions).</p>`],
      ["Boolean queries", `<p>$a \\land b$ is the intersection of two sorted lists, computed by a linear merge in $O(|L_a| + |L_b|)$. Start with the shortest lists; with <em>skip pointers</em> every $\\sqrt{|L|}$ entries, or galloping search, the merge jumps over long runs.</p>`],
      ["Compression", `<p>Store gaps $d_i - d_{i-1}$ instead of ids: frequent terms get small gaps. Encode them with variable-byte, Elias $\\gamma$ ($2\\lfloor \\log_2 g \\rfloor + 1$ bits) or PForDelta for SIMD decoding. Indexes shrink to 10% to 25% of the text.</p>`],
      ["Ranking", `<p>A search engine scores documents with $\\text{tf-idf}$ or BM25:</p>$$\\text{idf}(w) = \\log \\frac{N}{n_w}$$<p>and keeps the top $k$ with a heap while traversing the postings.</p>`],
      ["To discuss", `<ol class="q"><li>For “a AND b AND c”, in which order should you merge, and why?</li><li>Write the gaps of the list $[3, 7, 8, 20]$ and their $\\gamma$ codes.</li><li>How do phrase queries (“hash table”) need positions in the postings?</li></ol>`],
    ],
  },
  es: {
    title: "Índice invertido", accent: "invertido", machine: "Un riel de clavijas por cada palabra",
    lede: "Dar vuelta los documentos: por cada término se guarda la lista ordenada de documentos que lo contienen. Una consulta se vuelve una <strong>mezcla de posting lists</strong>, no un recorrido del corpus.",
    refs: "Zobel &amp; Moffat, 2006", hint: "Espacio indexa el siguiente documento · S lento", keyA: "Clavijas que se indexan y el carro de mezcla", keyB: "Un riel por término, un hueco por documento",
    controls: [{ act: "insert", label: "Indexar documento", primary: true }, { pair: [["and", "AND"], ["or", "OR"]], placeholder: "arbol busqueda" }, { act: "probe", label: "Consulta al azar" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>Indexar</b>(d): para cada término w en d:", "  agregar d a postings[w]  <i>// los ids llegan ordenados</i>", "  guardar gaps d − anterior", "", "<b>And</b>(a, b): i, j ← 0", "  mientras queden ambos: iguales → salida; si no, avanzar el menor", "<b>Or</b>(a, b): mezclar, saltar duplicados"],
    ui: { docs: "arbol binario de busqueda | tabla hash busqueda | indice arbol para busqueda | heap y cola | motor de busqueda indice | hash indice | cola arbol | motor heap", terms: "binario busqueda arbol hash tabla indice heap cola", queries: "busqueda arbol|hash indice|busqueda indice|arbol heap|motor indice", gaps: "gaps", docsN: "docs", termsN: "términos", postings: "postings", hits: "aciertos", indexLog: "Doc {d}: “{t}”", indexed: "doc {d}: {n} término(s)", andLog: "{q} → docs {r}. El carro recorrió ambas listas una vez: {s} pasos, O(|a| + |b|).", orLog: "{q} → docs {r}.", result: "{n} documento(s)", unknown: "ningún término indexado en la consulta", empty: "índice vacío", intro: "Indexa los documentos uno por uno y luego corre una consulta AND: el carro mezcla los rieles." },
    theory: [
      ["La estructura", `<p>Un <strong>diccionario</strong> de términos, cada uno apuntando a una <strong>posting list</strong>: los ids ordenados de los documentos que lo contienen (opcionalmente con frecuencias y posiciones).</p>`],
      ["Consultas booleanas", `<p>$a \\land b$ es la intersección de dos listas ordenadas, calculada con una mezcla lineal en $O(|L_a| + |L_b|)$. Se empieza por las listas más cortas; con <em>skip pointers</em> cada $\\sqrt{|L|}$ entradas, o búsqueda galopante, la mezcla salta tramos largos.</p>`],
      ["Compresión", `<p>Se guardan gaps $d_i - d_{i-1}$ en vez de ids: los términos frecuentes tienen gaps pequeños. Se codifican con variable-byte, Elias $\\gamma$ ($2\\lfloor \\log_2 g \\rfloor + 1$ bits) o PForDelta para decodificar con SIMD. Los índices quedan en 10% a 25% del texto.</p>`],
      ["Ranking", `<p>Un motor de búsqueda puntúa documentos con $\\text{tf-idf}$ o BM25:</p>$$\\text{idf}(w) = \\log \\frac{N}{n_w}$$<p>y guarda los mejores $k$ con un heap mientras recorre las postings.</p>`],
      ["Para discutir", `<ol class="q"><li>Para “a AND b AND c”, ¿en qué orden conviene mezclar y por qué?</li><li>Escribe los gaps de la lista $[3, 7, 8, 20]$ y sus códigos $\\gamma$.</li><li>¿Por qué las consultas de frase (“tabla hash”) necesitan posiciones en las postings?</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "inverted-index", fig: "Fig 7", P, svg, consts: { NT, ND, RY, DX, X0, Y0 }, code: "const rx=d=>X0+d*DX,ry=t=>Y0+t*RY;" + code, TEXT }, UI);
