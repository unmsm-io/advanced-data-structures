// Week 03: counting Bloom filter. A board of 16 pins; each key drops k = 3 darts and the pins rise by one.
import { bench, ruler, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const M = 16, KH = 3, PITCH = 12, X0 = -((M - 1) * PITCH) / 2, BOARD_Z = 8, PIN_STEP = 4;
const PLATE = { x: -120, y: -48, w: 240, d: 100, r: 8 };
const BOARD = { x: X0 - 10, y: -10, w: (M - 1) * PITCH + 20, d: 20, r: 2 };
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [X0, 0, 60], [-X0, 0, 60]], 640, 330, { pad: 28, azimuth: 36 });

function board() {
  const out = [];
  for (const px of [BOARD.x + 12, BOARD.x + BOARD.w - 12]) out.push(S(k.slabOf({ x: px - 7, y: -7, w: 14, d: 14, r: 1.5 }, 0, 3, P, 3, 0.4), { tone: "lo" }));
  out.push(S(k.slabOf(BOARD, 3, BOARD_Z - 3, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(BOARD, 5.5, P, 4), { tone: "faint" }) }));
  for (let i = 0; i < M; i++) { out.push(L(k.ring(X0 + i * PITCH, 0, 3.6, BOARD_Z, P, 20), { tone: "lo" })); }
  out.push(D([k.iso([BOARD.x + 4, 0, BOARD_Z], P), k.iso([BOARD.x + BOARD.w - 4, 0, BOARD_Z], P)], { size: 0.5 }));
  return out.join("") + ruler(P, X0 - 6, -X0 + 6, 14, { step: PITCH / 2, every: 2 });
}
// Gantry the darts fall from: two posts and a beam behind the board.
function gantry() {
  const out = [];
  for (const x of [BOARD.x - 6, BOARD.x + BOARD.w + 2]) {
    out.push(S(k.slabOf({ x: x - 4, y: -26, w: 8, d: 8, r: 1.2 }, 0, 3, P, 3), { tone: "lo" }));
    out.push(S(k.cylinder(x, -22, 2.6, 3, 52, P, 20), { tone: "mid", crease: "none" }));
  }
  out.push(S(k.slabOf({ x: BOARD.x - 8, y: -25, w: BOARD.w + 14, d: 6, r: 1.5 }, 55, 5, P, 3, 0.5), { tone: "mid" }));
  out.push(D(Array.from({ length: M }, (_, i) => k.iso([X0 + i * PITCH, -22, 60], P)), { size: 0.45 }));
  return out.join("");
}
const svg = k.figureSvg({ width: 640, height: 330, label: "Counting Bloom filter machine", body: [
  bench(P, PLATE, { label: { x: 60, y: 30, w: 40, d: 14, r: 1.5 } }), gantry(), board(), layers("pins"), layers("air"),
] });

const code = String.raw`
const pinsL=layer("pins"),airL=layer("air"),X=i=>X0+i*PITCH;
let C=Array(M).fill(0),H=Array(M).fill(0),keys=new Set();
const pins=Array.from({length:M},(_,i)=>{const e=art("",pinsL);e.pos=[X(i),0,0];return e});sortBy(pinsL);
function drawPin(i,on){const h=1.2+H[i]*PIN_STEP;pins[i].innerHTML=solidSvg(cylinder(X(i),0,3,BOARD_Z,h,P,22,.3),{tone:C[i]?"hi":"lo",lit:on})+(C[i]?lineSvg(ring(X(i),0,1.6,BOARD_Z+h,P,14),{tone:"lo"}):"")}
function hash(s,seed){let x=2166136261^seed;for(const ch of s){x^=ch.charCodeAt(0);x=Math.imul(x,16777619)>>>0}x^=x>>>15;x=Math.imul(x,0x2c1b3c6d)>>>0;return ((x^(x>>>12))>>>0)%M}
const hs=s=>{const out=[];for(let j=0;out.length<KH&&j<20;j++){const v=hash(s,j*0x9e3779b1>>>0);if(!out.includes(v))out.push(v)}return out};
const fp=()=>Math.pow(1-Math.exp(-KH*keys.size/M),KH);
function render(on=[]){tables(cells(U.counters,"m = "+M,C,j=>on.includes(j))+'<div class="mono">'+U.setLabel+" {"+[...keys].join(", ")+"}</div>");stats([["n",keys.size],[U.bitsOn,C.filter(c=>c).length+"/"+M],["k",KH],[U.fp,(fp()*100).toFixed(1)+"%"]])}
async function darts(idx){await Promise.all(idx.map((i,n)=>{const d=art(solidSvg(cylinder(0,0,1.4,0,7,P,14),{tone:"hi",lit:true}),airL);place(d,[X(i),-22,52]);return wait(n*90).then(()=>tween(d,[X(i),0,BOARD_Z+1.2+H[i]*PIN_STEP],420,6)).then(()=>{d.remove()})}))}
function grow(i,to){const from=H[i];return animate(240,e=>{H[i]=from+(to-from)*e;drawPin(i,true)}).then(()=>drawPin(i,false))}
async function add(w){if(!w)return;hl(0);const idx=hs(w);log(fmt(U.addLog,{w,h:idx.join(", ")}));await darts(idx);hl(1);idx.forEach(i=>C[i]++);await Promise.all(idx.map(i=>grow(i,C[i])));keys.add(w);render(idx);say(fmt(U.added,{w}))}
async function query(w){if(!w)return;hl(3);const idx=hs(w);await darts(idx);idx.forEach(i=>{drawPin(i,true);setTimeout(()=>drawPin(i,false),600*slow)});
 const all=idx.every(i=>C[i]>0),truth=keys.has(w);hl(all?4:3);render(idx);
 say(all?(truth?fmt(U.maybeTrue,{w}):fmt(U.falsePos,{w})):fmt(U.no,{w}));log(all?(truth?fmt(U.maybeLog,{w,h:idx.join(", ")}):fmt(U.fpLog,{w,h:idx.join(", ")})):fmt(U.noLog,{w,i:idx.find(i=>!C[i])}))}
async function remove(w){if(!w)return;if(!keys.has(w)){say(fmt(U.notIn,{w}));return}hl(6);const idx=hs(w);idx.forEach(i=>C[i]--);await Promise.all(idx.map(i=>grow(i,C[i])));keys.delete(w);render(idx);say(fmt(U.removed,{w}));log(U.removeLog)}
function reset(){C=Array(M).fill(0);H=Array(M).fill(0);keys.clear();for(let i=0;i<M;i++)drawPin(i,false);render();say(U.empty);log(U.intro)}
const WORDS=U.words.split(" ");const pick=()=>{const free=WORDS.filter(w=>!keys.has(w));return free[Math.floor(Math.random()*free.length)]||WORDS[0]};
bind({insert:()=>add(pick()),add:()=>add(input()),find:()=>query(input()),del:()=>remove(input()),probe:()=>query(WORDS[Math.floor(Math.random()*WORDS.length)]),reset});
for(let i=0;i<M;i++)drawPin(i,false);render();say(U.empty);log(U.intro);
let turn=0;startTour(async()=>{if(keys.size>=7)reset();turn++%3===2?await query(WORDS[Math.floor(Math.random()*WORDS.length)]):await add(pick())});
`;

const TEXT = {
  en: {
    title: "Bloom filters", accent: "filters", machine: "A pin board hit by three darts",
    lede: "A set that answers <strong>“definitely not”</strong> or <strong>“probably yes”</strong> in a few bits per key. It never forgets a member; it sometimes claims a stranger.",
    refs: "Bloom, 1970 · Fan et al., 2000", hint: "Space inserts · S slows", keyA: "The darts and the pins they hit", keyB: "16 pins, height = counter",
    controls: [{ act: "insert", label: "Insert random word", primary: true }, { pair: [["add", "Insert"], ["find", "Query"], ["del", "Delete"]], placeholder: "word" }, { act: "probe", label: "Random query" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>Insert</b>(x): for j in 1..k:", "  C[h<sub>j</sub>(x)] ← C[h<sub>j</sub>(x)] + 1", "", "<b>Query</b>(x): if some C[h<sub>j</sub>(x)] = 0: no", "  else: probably yes", "", "<b>Delete</b>(x): C[h<sub>j</sub>(x)] − 1 for all j"],
    ui: { counters: "C", setLabel: "set", bitsOn: "pins up", fp: "false pos.", addLog: "Insert “{w}”: the darts hit {h}.", added: "“{w}” inserted", maybeTrue: "“{w}”: probably yes (true member)", falsePos: "“{w}”: probably yes, but it is a FALSE POSITIVE", no: "“{w}”: definitely not", maybeLog: "Pins {h} are all up and “{w}” really is in the set.", fpLog: "Pins {h} are all up, yet “{w}” was never inserted: other keys raised them. That is a false positive.", noLog: "Pin {i} is down, so “{w}” was never inserted. No false negatives.", notIn: "“{w}” is not in the set", removed: "“{w}” deleted", removeLog: "Counting Bloom: counters go down by one. A plain bit Bloom filter cannot delete.", empty: "empty filter", intro: "Each key drops k = 3 darts. Query a word you never inserted and watch for false positives.", words: "lima cusco puno tacna ica piura tumbes junin pasco ancash loreto ucayali madre callao" },
    theory: [
      ["The idea", `<p>An array of $m$ bits and $k$ hash functions. To insert $x$, set the bits $h_1(x), \\dots, h_k(x)$. To query, check them: if one is $0$, $x$ is definitely absent; if all are $1$, $x$ is <strong>probably</strong> present.</p>`],
      ["False positive rate", `<p>After $n$ insertions a given bit is still $0$ with probability $\\left(1 - \\tfrac1m\\right)^{kn} \\approx e^{-kn/m}$, so</p>$$\\Pr[\\text{false positive}] \\approx \\left(1 - e^{-kn/m}\\right)^k$$<p>which is minimised at $k = \\tfrac{m}{n}\\ln 2$, giving about $0.6185^{m/n}$. With 10 bits per key that is under 1%.</p>`],
      ["Counting Bloom", `<p>Replace each bit by a small counter (4 bits is enough in practice). Insert increments, delete decrements, query checks for non-zero. The machine's pin heights are those counters.</p>`],
      ["HyperLogLog", `<p>Counts <strong>distinct</strong> elements in $O(\\log \\log n)$ bits per register. Hash every element, look at the position $\\rho$ of the first 1 bit; across $m$ registers keep the maximum $\\rho$. The estimate is</p>$$E = \\alpha_m \\, m^2 \\left(\\sum_{j=1}^{m} 2^{-M_j}\\right)^{-1}$$<p>with standard error $1.04/\\sqrt m$.</p>`],
      ["Locality-sensitive hashing", `<p>Here we want collisions: similar items should land in the same bucket. MinHash estimates Jaccard similarity, $\\Pr[h(A)=h(B)] = J(A,B)$; banding $b$ rows of $r$ hashes turns it into an S-shaped filter for near-duplicate search.</p>`],
      ["To discuss", `<ol class="q"><li>Insert 7 words and query 10 you never inserted. How many false positives, against the formula?</li><li>Why can a plain Bloom filter never return a false negative?</li><li>What breaks if you delete a key that was never inserted in a counting Bloom filter?</li></ol>`],
    ],
  },
  es: {
    title: "Filtros de Bloom", accent: "Bloom", machine: "Un tablero de pines golpeado por tres dardos",
    lede: "Un conjunto que responde <strong>“seguro que no”</strong> o <strong>“probablemente sí”</strong> con pocos bits por llave. Nunca olvida a un miembro; a veces reclama a un extraño.",
    refs: "Bloom, 1970 · Fan et al., 2000", hint: "Espacio inserta · S lento", keyA: "Los dardos y los pines que golpean", keyB: "16 pines, altura = contador",
    controls: [{ act: "insert", label: "Insertar palabra", primary: true }, { pair: [["add", "Insertar"], ["find", "Consultar"], ["del", "Borrar"]], placeholder: "palabra" }, { act: "probe", label: "Consulta al azar" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>Insertar</b>(x): para j en 1..k:", "  C[h<sub>j</sub>(x)] ← C[h<sub>j</sub>(x)] + 1", "", "<b>Consultar</b>(x): si algún C[h<sub>j</sub>(x)] = 0: no", "  si no: probablemente sí", "", "<b>Borrar</b>(x): C[h<sub>j</sub>(x)] − 1 para todo j"],
    ui: { counters: "C", setLabel: "conjunto", bitsOn: "pines arriba", fp: "falso pos.", addLog: "Insertar “{w}”: los dardos caen en {h}.", added: "“{w}” insertada", maybeTrue: "“{w}”: probablemente sí (miembro real)", falsePos: "“{w}”: probablemente sí, pero es un FALSO POSITIVO", no: "“{w}”: seguro que no", maybeLog: "Los pines {h} están arriba y “{w}” sí está en el conjunto.", fpLog: "Los pines {h} están arriba, pero “{w}” nunca se insertó: otras llaves los levantaron. Eso es un falso positivo.", noLog: "El pin {i} está abajo, así que “{w}” nunca se insertó. No hay falsos negativos.", notIn: "“{w}” no está en el conjunto", removed: "“{w}” borrada", removeLog: "Counting Bloom: los contadores bajan en uno. Un Bloom de bits simple no puede borrar.", empty: "filtro vacío", intro: "Cada llave deja caer k = 3 dardos. Consulta una palabra que nunca insertaste y busca falsos positivos.", words: "lima cusco puno tacna ica piura tumbes junin pasco ancash loreto ucayali madre callao" },
    theory: [
      ["La idea", `<p>Un arreglo de $m$ bits y $k$ funciones hash. Para insertar $x$, se encienden los bits $h_1(x), \\dots, h_k(x)$. Para consultar se revisan: si alguno es $0$, $x$ seguro no está; si todos son $1$, $x$ <strong>probablemente</strong> está.</p>`],
      ["Tasa de falsos positivos", `<p>Tras $n$ inserciones un bit dado sigue en $0$ con probabilidad $\\left(1 - \\tfrac1m\\right)^{kn} \\approx e^{-kn/m}$, entonces</p>$$\\Pr[\\text{falso positivo}] \\approx \\left(1 - e^{-kn/m}\\right)^k$$<p>que se minimiza en $k = \\tfrac{m}{n}\\ln 2$, dando cerca de $0.6185^{m/n}$. Con 10 bits por llave queda bajo 1%.</p>`],
      ["Counting Bloom", `<p>Se cambia cada bit por un contador pequeño (4 bits bastan en la práctica). Insertar incrementa, borrar decrementa, consultar revisa que no sea cero. Las alturas de los pines de la máquina son esos contadores.</p>`],
      ["HyperLogLog", `<p>Cuenta elementos <strong>distintos</strong> con $O(\\log \\log n)$ bits por registro. Se hashea cada elemento y se mira la posición $\\rho$ del primer bit 1; en $m$ registros se guarda el máximo $\\rho$. El estimador es</p>$$E = \\alpha_m \\, m^2 \\left(\\sum_{j=1}^{m} 2^{-M_j}\\right)^{-1}$$<p>con error estándar $1.04/\\sqrt m$.</p>`],
      ["Locality-sensitive hashing", `<p>Aquí queremos colisiones: elementos parecidos deben caer en el mismo balde. MinHash estima la similitud de Jaccard, $\\Pr[h(A)=h(B)] = J(A,B)$; agrupar $b$ bandas de $r$ hashes lo vuelve un filtro en forma de S para buscar casi duplicados.</p>`],
      ["Para discutir", `<ol class="q"><li>Inserta 7 palabras y consulta 10 que nunca insertaste. ¿Cuántos falsos positivos, contra la fórmula?</li><li>¿Por qué un Bloom simple nunca da un falso negativo?</li><li>¿Qué se rompe si borras una llave que nunca se insertó en un counting Bloom?</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "bloom-filters", fig: "Fig 3", P, svg, consts: { M, KH, PITCH, X0, BOARD_Z, PIN_STEP }, code, TEXT, stateLabel: "k = 3 · m = 16" }, UI);
