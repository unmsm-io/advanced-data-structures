// Week 02: cuckoo hashing. Two shelves of cups (T1, T2), a feed hopper, a kick counter and two seed knobs.
import * as G from "../../vendor/anatomy/kit/lathe.mjs";
import { bench, dial, knob, k, S, L, D, layers } from "../lib/parts.mjs";
import { controlsHtml, labHtml, liveScript, section } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const M = 8, MAXK = 8, PITCH = 20;
const X0 = -((M - 1) * PITCH) / 2 + 12;
const ROW_Y = [-26, 18];
const CUP_R = 6.6, CUP_Z = 8, CUP_H = 4, BALL_R = 5.2;
const BALL_Z = CUP_Z + CUP_H + BALL_R - 1.6;
const PLATE = { x: -120, y: -58, w: 252, d: 128, r: 8 };
const HOPPER = [-104, -26], HOPPER_TOP = 58;
const DIAL = [104, 50], DIAL_R = 13, DIAL_TOP = 7;
const KNOBS = [[-96, 50], [-70, 50]];
const slot = (t, j) => [X0 + j * PITCH, ROW_Y[t]];
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [HOPPER[0], HOPPER[1], HOPPER_TOP + 8], [PLATE.x + PLATE.w, ROW_Y[0], 50]], 640, 350, { pad: 28, azimuth: 40 });
const at = (p) => k.iso(p, P);

// One table: a bar on two pedestals, an index ruler in front, a row of cups.
function table(t) {
  const out = [];
  const y = ROW_Y[t];
  const bar = { x: X0 - 14, y: y - 9, w: (M - 1) * PITCH + 28, d: 18, r: 2 };
  for (const px of [bar.x + 10, bar.x + bar.w - 10]) out.push(S(k.slabOf({ x: px - 6, y: y - 6, w: 12, d: 12, r: 1.5 }, 0, 3, P, 3, 0.4), { tone: "lo" }));
  out.push(S(k.slabOf(bar, 3, CUP_Z - 3, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(bar, 5.4, P, 4), { tone: "faint" }) }));
  out.push(L(k.lineOnTop([bar.x, y - 6], [bar.x + bar.w, y - 6], CUP_Z, P), { tone: "faint" }));
  out.push(D([at([bar.x + 4, y, CUP_Z]), at([bar.x + bar.w - 4, y, CUP_Z])], { size: 0.5 }));
  out.push(L([bar.x + 4, bar.x + bar.w - 4].map((x) => k.ring(x, y, 1.8, CUP_Z, P, 14)).join(""), { tone: "lo" }));
  // ruler strip on the floor in front of the bar, one major tick per slot
  const strip = { x: bar.x + 6, y: y + 10.5, w: bar.w - 12, d: 5, r: 0.8 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(X0 - 10, X0 + (M - 1) * PITCH + 10, 5, 4, strip.y + 0.6, 0.6, [1.6, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  for (let j = 0; j < M; j++) {
    const [x] = slot(t, j);
    out.push(`<g data-cup="${t}-${j}">${S(k.cylinder(x, y, CUP_R, CUP_Z, CUP_H, P, 32, 0.5), { tone: "hi", crease: "lo" })}</g>`);
    out.push(L(k.ring(x, y, CUP_R - 1.8, CUP_Z + CUP_H, P, 28), { tone: "lo" }));
    out.push(L(k.ring(x, y, CUP_R - 3.4, CUP_Z + CUP_H, P, 24), { tone: "faint" }));
  }
  return out.join("");
}

// Feed hopper: post, funnel, chute lip. New keys enter here.
function hopper() {
  const [x, y] = HOPPER, out = [];
  out.push(S(k.slabOf({ x: x - 9, y: y - 9, w: 18, d: 18, r: 2 }, 0, 4, P, 4, 0.5), { tone: "mid" }));
  out.push(D(k.corners({ x: x - 9, y: y - 9, w: 18, d: 18 }, 3).map(([a, b]) => at([a, b, 4])), { size: 0.45 }));
  out.push(S(k.cylinder(x, y, 3, 4, HOPPER_TOP - 14, P, 24), { tone: "mid", crease: "none" }));
  out.push(L([20, 32].map((z) => k.sideArc(x, y, 3, z, P, 14)).join(""), { tone: "faint" }));
  out.push(S(k.cylinder(x, y, 5, HOPPER_TOP - 14, 4, P, 28), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 9, HOPPER_TOP - 10, 10, P, 36, 0.6), { tone: "mid" }));
  out.push(L(k.knurl(x, y, 9, HOPPER_TOP - 10, HOPPER_TOP - 6, 40, P), { tone: "lo" }));
  out.push(L(k.ring(x, y, 7, HOPPER_TOP, P, 32), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 4.6, HOPPER_TOP - 0.6, 0.6, P, 24), { tone: "lo", crease: "none" }));
  return out.join("");
}

const ballArt = S(G.sphereOf([0, 0, 0], BALL_R, P, { steps: 40 }), { tone: "hi" });
const svg = k.figureSvg({
  width: 640, height: 350, label: "Cuckoo hashing machine",
  body: [
    bench(P, PLATE, { label: { x: -40, y: 44, w: 44, d: 16, r: 1.5 } }), hopper(), table(0), layers(0), table(1), layers(1),
    knob(P, KNOBS[0], 0), knob(P, KNOBS[1], 1), dial(P, DIAL, { r: DIAL_R, ticks: MAXK * 2 }),
    `<path data-part="needle" class="iso-line" data-tone="lit" data-free="" style="stroke-width:1.1"/>`,
    layers("air"), `<g data-pool hidden>${Array.from({ length: 2 * M + 1 }, (_, i) => `<g data-ball="${i}" style="display:none">${ballArt}</g>`).join("")}</g>`,
  ],
});

const code = String.raw`
const needle=$('[data-part="needle"]',svg),L3=[layer(0),layer(1),layer("air")],pool=$$("[data-ball]",svg);
const slot=(t,j)=>[X0+j*PITCH,ROW_Y[t]];
let seeds=[0x9e37,0x7f4a],T=[Array(M).fill(null),Array(M).fill(null)],ballOf=new Map(),free=pool.slice(),totalKicks=0,rehashes=0,knobA=[0,0],needleAt=0,needleWant=0;
function h(t,key){let x=Math.imul(key^seeds[t],0x45d9f3b)>>>0;x=Math.imul(x^(x>>>16),t?0x27d4eb2d:0x165667b1)>>>0;return ((x^(x>>>15))>>>0)%M}
function needleD(n){const [x,y]=DIAL,a=Math.PI*0.75+(Math.min(n,MAXK)/MAXK)*Math.PI*1.5;return seg([x-Math.cos(a)*2.4,y-Math.sin(a)*2.4,DIAL_TOP+.2],[x+Math.cos(a)*(DIAL_R-3.4),y+Math.sin(a)*(DIAL_R-3.4),DIAL_TOP+.2])}
function knobDraw(){KNOBS.forEach(([x,y],i)=>$('[data-knob="'+i+'"]',svg).setAttribute("d",seg([x,y,7.4],[x+Math.cos(knobA[i])*5,y+Math.sin(knobA[i])*5,7.4])))}
const cup=(t,j)=>$('[data-cup="'+t+'-'+j+'"]',svg);
function settle(g,t,j){const [x,y]=slot(t,j);place(g,[x,y,BALL_Z]);L3[t].appendChild(g);sortBy(L3[t])}
const count=()=>T[0].concat(T[1]).filter(v=>v!==null).length;
const has=key=>T[0][h(0,key)]===key||T[1][h(1,key)]===key;
function render(){const n=count();tables(cells("T<sub>1</sub>",U.t1,T[0])+cells("T<sub>2</sub>",U.t2,T[1]));stats([["α = n/2m",(n/(2*M)).toFixed(2)],[U.keys,n],[U.kicks,totalKicks],["rehash",rehashes]])}
async function insert(key){
 hl(1);if(has(key)){say(fmt(U.already,{k:key}));return}
 if(count()>=2*M-1){say(U.full);return}
 const g=free.pop();g.style.display="";ballOf.set(key,g);place(g,[HOPPER[0],HOPPER[1],HOPPER_TOP+6]);L3[2].appendChild(g);lit(g,true);
 let cur=key,curG=g,t=0,kicks=0;needleWant=0;const chain=[key];
 log(fmt(U.insertLog,{k:key,a:h(0,key),b:h(1,key)}));hl(2);await wait(260);
 while(true){hl(4);const j=h(t,cur),[x,y]=slot(t,j);L3[2].appendChild(curG);say((kicks?fmt(U.kickN,{n:kicks})+" · ":"")+cur+" → T"+(t+1)+"["+j+"]");
  await tween(curG,[x,y,BALL_Z],kicks?560:700,kicks?26:12);
  const prev=T[t][j];T[t][j]=cur;settle(curG,t,j);lit(curG,false);
  if(prev===null){flash(cup(t,j));render();say(kicks?fmt(U.landedAfter,{k:key,n:kicks}):fmt(U.landed,{k:key,t:t+1,j}));log(chain.length>1?fmt(U.chainDone,{c:chain.join(" → ")}):U.noCollision);return}
  hl(5);kicks++;totalKicks++;needleWant=kicks;chain.push(prev);const pg=ballOf.get(prev);lit(pg,true);flash(cup(t,j));
  log(fmt(U.evict,{t:t+1,j,a:cur,b:prev,c:chain.join(" → ")}));
  if(kicks>=MAXK){await wait(300);await rehash(prev);return}
  await tween(pg,[x,y,BALL_Z+14],260);hl(6);await wait(200);cur=prev;curG=pg;t^=1;
 }
}
async function rehash(homeless){
 hl(7);rehashes++;say(U.rehashing);log(fmt(U.rehashLog,{n:MAXK}));
 const keys=T[0].concat(T[1]).filter(v=>v!==null).concat([homeless]);
 for(const key of keys){const g=ballOf.get(key);L3[2].appendChild(g);place(g,[g.pos[0],g.pos[1],BALL_Z+18])}
 const a0=knobA.slice();await animate(700,e=>{knobA=[a0[0]+e*Math.PI*.8,a0[1]-e*Math.PI*.6];knobDraw()});
 seeds=[(Math.imul(seeds[0],2654435761)+rehashes*97)>>>0&0xffff,(Math.imul(seeds[1],40503)+rehashes*31)>>>0&0xffff];
 T=[Array(M).fill(null),Array(M).fill(null)];
 for(const key of keys){let cur=key,t=0,n=0;while(cur!==null&&n<50){const j=h(t,cur),p=T[t][j];T[t][j]=cur;cur=p;t^=1;n++}if(cur!==null)return rehash(cur)}
 keys.forEach(key=>lit(ballOf.get(key),false));
 await Promise.all(keys.map(key=>{const g=ballOf.get(key),t=T[0].includes(key)?0:1,j=T[t].indexOf(key),[x,y]=slot(t,j);return tween(g,[x,y,BALL_Z],650,18).then(()=>settle(g,t,j))}));
 needleWant=0;render();say(fmt(U.rehashDone,{n:rehashes}));
}
function find(key){hl(0);const a=h(0,key),b=h(1,key);flash(cup(0,a));flash(cup(1,b));say(fmt(U.findSay,{k:key,r:has(key)?U.found:U.missing}));log(fmt(U.findLog,{k:key,a,b}))}
function reset(){for(const g of ballOf.values()){g.style.display="none";$("[data-pool]",svg).appendChild(g)}ballOf.clear();free=pool.slice();T=[Array(M).fill(null),Array(M).fill(null)];seeds=[0x9e37,0x7f4a];totalKicks=0;rehashes=0;needleWant=0;knobA=[0,0];knobDraw();render();say(U.empty);log(U.intro)}
const rnd=()=>{let x;do x=10+Math.floor(Math.random()*90);while(has(x));return x};
(function loop(){needleAt+=(needleWant-needleAt)*.12;needle.setAttribute("d",needleD(needleAt));requestAnimationFrame(loop)})();
bind({insert:()=>insert(rnd()),add:()=>{const v=+input();if(v>0)return insert(v)},find:()=>{const v=+input();if(v>0)find(v)},reset});
render();log(U.intro);say(U.empty);
startTour(async()=>{if(count()>=2*M-3)reset();await insert(rnd())});
`;

const TEXT = {
  en: {
    title: "Cuckoo hashing", accent: "hashing", machine: "Two shelves, a hopper and seed knobs",
    lede: "A hash table where <strong>lookup costs two probes in the worst case</strong>. Insertion pays the price: like the cuckoo, a new key kicks out whoever sits in its nest.",
    refs: "Pagh &amp; Rodler, 2004", hint: "Space inserts · S slows", keyA: "The key in flight and the needle", keyB: "Two shelves of 8 cups: T₁ = h₁, T₂ = h₂",
    controls: [{ act: "insert", label: "Insert random key", primary: true }, { pair: [["add", "Insert"], ["find", "Lookup"]], placeholder: "key", type: "number" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>Lookup</b>(x): T₁[h₁(x)] = x  ∨  T₂[h₂(x)] = x", "<b>Insert</b>(x): if Lookup(x), stop", "t ← 1", "repeat MaxLoop times:", "  if T<sub>t</sub>[h<sub>t</sub>(x)] empty: place x, stop", "  x ↔ T<sub>t</sub>[h<sub>t</sub>(x)]  <i>// evict</i>", "  t ← 3 − t  <i>// to its other table</i>", "<b>Rehash</b>(); Insert(x)"],
    ui: { t1: "back shelf · h₁", t2: "front shelf · h₂", keys: "keys", kicks: "evictions", already: "key {k} is already in", full: "table full: reset", insertLog: "Insert {k}: h₁({k}) = {a}, h₂({k}) = {b}.", kickN: "eviction {n}", landedAfter: "{k} settled after {n} eviction(s)", landed: "{k} landed straight in T{t}[{j}]", chainDone: "Chain: {c}. Lookup is still O(1): two cups.", noCollision: "No collision.", evict: "T{t}[{j}] taken: {a} kicks out {b}. Chain: {c}", rehashing: "likely cycle: rehash", rehashLog: "{n} evictions in a row: assume a cycle. New seeds, every key goes back in.", rehashDone: "rehash {n} done · new seeds", findSay: "lookup {k}: {r}", found: "found", missing: "not there", findLog: "Lookup {k}: only T₁[{a}] and T₂[{b}] are checked. Two probes, worst case.", empty: "empty machine", intro: "Every key has two homes: h₁ on the back shelf, h₂ on the front." },
    theory: [
      ["The idea", `<p>Use <strong>two tables</strong> $T_1, T_2$ of size $m$ and <strong>two independent hash functions</strong>. Every key $x$ has exactly two possible homes:</p>$$x \\in T_1[h_1(x)] \\quad\\lor\\quad x \\in T_2[h_2(x)]$$<p>That is the invariant. As long as it holds, lookup reads two cells and nothing else.</p>`],
      ["The machine", `<p>Each <strong>shelf</strong> is a table, each <strong>ball</strong> a key. The <strong>needle</strong> counts the evictions of the current insertion; at MaxLoop $= ${MAXK}$ the machine assumes a cycle, turns the <strong>seed knobs</strong> (new $h_1, h_2$) and reinserts everything: a rehash.</p>`],
      ["Complexity", `<div class="cards"><div><span>Lookup · delete</span><b>$O(1)$</b><p>worst case, 2 probes</p></div><div><span>Insert</span><b>$O(1)$</b><p>expected amortized, if $\\alpha &lt; \\tfrac12$</p></div><div><span>Space</span><b>$2m$</b><p>cells, $\\alpha = n/2m$</p></div></div><p>With sufficiently random functions and $\\alpha \\le \\tfrac12 - \\varepsilon$, an insertion forces a rehash with probability</p>$$\\Pr[\\text{rehash}] = O\\!\\left(\\frac{1}{m}\\right)$$<p>and the expected number of evictions per insertion is constant. That is why MaxLoop $= O(\\log m)$ is enough: a longer chain almost always means a <strong>cycle</strong>.</p>`],
      ["The cuckoo graph", `<p>Each cell is a <strong>vertex</strong> and each key $x$ an <strong>edge</strong> between $T_1[h_1(x)]$ and $T_2[h_2(x)]$: a bipartite graph with $2m$ vertices and $n$ edges.</p><p>The keys fit if and only if <strong>every connected component has at most one cycle</strong>, that is $|E| \\le |V|$ per component. An insertion that closes a second cycle never ends, which is why MaxLoop exists.</p>`],
      ["To discuss", `<ol class="q"><li>Fill the machine up to $\\alpha \\approx 0.6$. What happens to the chains? Why is the limit $\\tfrac12$?</li><li>If $h_1 = h_2$, what breaks? Why must they be <strong>independent</strong>?</li><li>Against <em>linear probing</em>: who wins on lookup, on insertion and on cache locality?</li><li>Where is it used? Hardware routing tables and <em>cuckoo filters</em> (week 03, next to Bloom).</li></ol><p class="ref">Pagh, R. &amp; Rodler, F. F. (2004). Cuckoo hashing. <em>Journal of Algorithms</em>, 51(2), 122–144.</p>`],
    ],
  },
  es: {
    title: "Cuckoo hashing", accent: "hashing", machine: "Dos repisas, tolva y perillas de semilla",
    lede: "Una tabla hash donde <strong>buscar cuesta dos accesos en el peor caso</strong>. El precio se paga al insertar: como el cuco, la llave nueva expulsa a la que ocupa su nido.",
    refs: "Pagh &amp; Rodler, 2004", hint: "Espacio inserta · S lento", keyA: "La llave en vuelo y la aguja", keyB: "Dos repisas de 8 tazas: T₁ = h₁, T₂ = h₂",
    controls: [{ act: "insert", label: "Insertar al azar", primary: true }, { pair: [["add", "Insertar"], ["find", "Buscar"]], placeholder: "llave", type: "number" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>Buscar</b>(x): T₁[h₁(x)] = x  ∨  T₂[h₂(x)] = x", "<b>Insertar</b>(x): si Buscar(x), terminar", "t ← 1", "repetir MaxLoop veces:", "  si T<sub>t</sub>[h<sub>t</sub>(x)] vacía: colocar x, terminar", "  x ↔ T<sub>t</sub>[h<sub>t</sub>(x)]  <i>// desalojar</i>", "  t ← 3 − t  <i>// a su otra tabla</i>", "<b>Rehash</b>(); Insertar(x)"],
    ui: { t1: "repisa trasera · h₁", t2: "repisa delantera · h₂", keys: "llaves", kicks: "desalojos", already: "la llave {k} ya está", full: "tabla llena: reinicia", insertLog: "Insertar {k}: h₁({k}) = {a}, h₂({k}) = {b}.", kickN: "desalojo {n}", landedAfter: "{k} entró tras {n} desalojo(s)", landed: "{k} cayó directo en T{t}[{j}]", chainDone: "Cadena: {c}. Buscar sigue siendo O(1): dos tazas.", noCollision: "Sin colisión.", evict: "T{t}[{j}] ocupada: {a} expulsa a {b}. Cadena: {c}", rehashing: "ciclo probable: rehash", rehashLog: "{n} desalojos seguidos: se asume ciclo. Nuevas semillas, todas las llaves se reinsertan.", rehashDone: "rehash {n} listo · semillas nuevas", findSay: "buscar {k}: {r}", found: "encontrada", missing: "no está", findLog: "Buscar {k}: solo se miran T₁[{a}] y T₂[{b}]. Dos accesos en el peor caso.", empty: "máquina vacía", intro: "Cada llave tiene dos casas: h₁ en la repisa trasera, h₂ en la delantera." },
    theory: [
      ["La idea", `<p>Usamos <strong>dos tablas</strong> $T_1, T_2$ de tamaño $m$ y <strong>dos funciones hash</strong> independientes. Cada llave $x$ tiene exactamente dos casas posibles:</p>$$x \\in T_1[h_1(x)] \\quad\\lor\\quad x \\in T_2[h_2(x)]$$<p>Esa es la invariante. Si se cumple siempre, buscar es mirar dos celdas y nada más.</p>`],
      ["La máquina", `<p>Cada <strong>repisa</strong> es una tabla, cada <strong>bola</strong> una llave. La <strong>aguja</strong> cuenta los desalojos de la inserción en curso; al llegar a MaxLoop $= ${MAXK}$ se asume un ciclo, giran las <strong>perillas de semilla</strong> (nuevas $h_1, h_2$) y todo se reinserta: el rehash.</p>`],
      ["Complejidad", `<div class="cards"><div><span>Buscar · eliminar</span><b>$O(1)$</b><p>peor caso, 2 accesos</p></div><div><span>Insertar</span><b>$O(1)$</b><p>esperado amortizado, si $\\alpha &lt; \\tfrac12$</p></div><div><span>Espacio</span><b>$2m$</b><p>celdas, $\\alpha = n/2m$</p></div></div><p>Con funciones suficientemente aleatorias y $\\alpha \\le \\tfrac12 - \\varepsilon$, una inserción obliga a rehash con probabilidad</p>$$\\Pr[\\text{rehash}] = O\\!\\left(\\frac{1}{m}\\right)$$<p>y los desalojos esperados por inserción son constantes. Por eso basta MaxLoop $= O(\\log m)$: una cadena más larga casi siempre indica un <strong>ciclo</strong>.</p>`],
      ["El grafo cuckoo", `<p>Cada celda es un <strong>vértice</strong> y cada llave $x$ una <strong>arista</strong> entre $T_1[h_1(x)]$ y $T_2[h_2(x)]$: un grafo bipartito con $2m$ vértices y $n$ aristas.</p><p>Las llaves caben si y solo si <strong>cada componente conexa tiene a lo más un ciclo</strong>, es decir $|E| \\le |V|$ por componente. Una inserción que cierra un segundo ciclo no termina nunca: por eso existe MaxLoop.</p>`],
      ["Para discutir", `<ol class="q"><li>Llena la máquina hasta $\\alpha \\approx 0.6$. ¿Qué pasa con las cadenas? ¿Por qué el límite es $\\tfrac12$?</li><li>Si $h_1 = h_2$, ¿qué se rompe? ¿Por qué deben ser <strong>independientes</strong>?</li><li>Contra <em>linear probing</em>: ¿quién gana en búsqueda, en inserción y en localidad de caché?</li><li>¿Dónde se usa? Tablas de ruteo en hardware y <em>cuckoo filters</em> (semana 03, junto a Bloom).</li></ol><p class="ref">Pagh, R. &amp; Rodler, F. F. (2004). Cuckoo hashing. <em>Journal of Algorithms</em>, 51(2), 122–144.</p>`],
    ],
  },
};

export default {
  slug: "cuckoo-hashing",
  machine: { en: TEXT.en.machine, es: TEXT.es.machine },
  render(lang) {
    const t = TEXT[lang], u = { ...UI[lang], ...t.ui };
    return {
      title: t.title, accent: t.accent, lede: t.lede, refs: t.refs,
      lab: labHtml({ u, fig: "Fig 2", title: t.title, hint: t.hint, readout: u.empty, keys: [{ mark: "lit", label: t.keyA }, { mark: "raised", label: t.keyB }], svg, controls: controlsHtml(u, t.controls), pseudo: t.pseudo, stateLabel: `MaxLoop = ${MAXK}` }),
      theory: t.theory.map(([h, b], i) => section(i + 1, h, b)).join(""),
      script: liveScript({ P, u, consts: { M, MAXK, ROW_Y, X0, PITCH, BALL_Z, HOPPER, HOPPER_TOP, KNOBS, DIAL, DIAL_R, DIAL_TOP }, code }),
    };
  },
};
