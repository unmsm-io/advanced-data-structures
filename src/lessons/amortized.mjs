// Week 01: amortized analysis. A binary counter of flip blocks; every 1 carries a coin (the potential).
import { bench, dial, ruler, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const B = 8, PITCH = 22, X0 = 78, BASEZ = 6;
const PLATE = { x: -110, y: -50, w: 220, d: 104, r: 8 };
const X = (i) => X0 - i * PITCH;
const DIAL = [-82, 30], BIN = { x: 40, y: 22, w: 46, d: 22, r: 2 };
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [X0, 0, 40], [X(B - 1), 0, 40]], 640, 330, { pad: 30, azimuth: 38 });

function rail() {
  const r = { x: X(B - 1) - 12, y: -12, w: (B - 1) * PITCH + 24, d: 24, r: 2 };
  const out = [S(k.slabOf(r, 0, BASEZ, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(r, 3, P, 4), { tone: "faint" }) })];
  for (let i = 0; i < B; i++) {
    out.push(L(k.planOutline({ x: X(i) - 8.5, y: -9.5, w: 17, d: 19, r: 1.5 }, BASEZ, P, 3), { tone: "faint" }));
    out.push(D([k.iso([X(i), 9.6, BASEZ], P)], { size: 0.45 }));
  }
  out.push(D([k.iso([r.x + 4, 0, BASEZ], P), k.iso([r.x + r.w - 4, 0, BASEZ], P)], { size: 0.5 }));
  return out.join("") + ruler(P, X(B - 1) - 8, X0 + 8, 16, { step: PITCH / 2, every: 2 });
}
function bin() {
  const out = [S(k.slabOf(BIN, 0, 6, P, 4, 0.5), { tone: "mid" }), S(k.slabOf(k.insetPlan(BIN, 2.4), 5.4, 0.6, P, 3), { tone: "lo", crease: "none" })];
  out.push(D(k.corners(BIN, 2.2).map(([x, y]) => k.iso([x, y, 6], P)), { size: 0.4 }));
  return out.join("");
}
const svg = k.figureSvg({ width: 640, height: 330, label: "Binary counter machine", body: [
  bench(P, PLATE, { label: { x: -60, y: 30, w: 40, d: 14, r: 1.5 } }), rail(), layers("bits"), bin(), layers("bank"), dial(P, DIAL, { r: 12, ticks: 16, every: 2 }),
  `<path data-part="needle" class="iso-line" data-tone="lit" data-free="" style="stroke-width:1.1"/>`, layers("air"),
] });

const code = String.raw`
const bitsL=layer("bits"),bankL=layer("bank"),airL=layer("air"),needle=$('[data-part="needle"]',svg);
const X=i=>X0-i*PITCH;let A=Array(B).fill(0),H=Array(B).fill(2),n=0,cost=0,last=0,bank=0,needleAt=0;
const g=Array.from({length:B},(_,i)=>{const e=art("",bitsL);e.pos=[X(i),0,0];return e});sortBy(bitsL);
function drawBit(i,on){const h=H[i];g[i].innerHTML=solidSvg(slabOf({x:X(i)-7,y:-8,w:14,d:16,r:1.5},BASEZ,h,P,4,.5),{tone:"hi",lit:on})+(A[i]&&h>12?solidSvg(cylinder(X(i),0,4.6,BASEZ+h,1.6,P,24),{tone:"mid"})+lineSvg(ring(X(i),0,3,BASEZ+h+1.6,P,18),{tone:"lo"}):"")}
function drawBank(){bankL.innerHTML="";for(let c=0;c<Math.min(bank,14);c++){const e=art(solidSvg(cylinder(BIN.x+9+(c%4)*9.5,BIN.y+11,4.2,6+Math.floor(c/4)*1.8,1.6,P,22),{tone:"mid"}),bankL);e.pos=[0,0,c]}}
function needleD(v){const [x,y]=DIAL,a=Math.PI*.75+Math.min(v,8)/8*Math.PI*1.5;return seg([x-Math.cos(a)*2.4,y-Math.sin(a)*2.4,7.2],[x+Math.cos(a)*8.6,y+Math.sin(a)*8.6,7.2])}
(function loop(){needleAt+=(last-needleAt)*.12;needle.setAttribute("d",needleD(needleAt));requestAnimationFrame(loop)})();
function render(){const phi=A.reduce((s,b)=>s+b,0);tables(cells("A",U.bits,[...A].reverse(),j=>A[B-1-j]===1,j=>B-1-j)+'<div class="mono">'+fmt(U.ineq,{c:cost,n:2*n})+'</div>');stats([["n",n],[U.cost,cost],["2n",2*n],["Φ",phi]])}
function flip(i,to){return animate(260,e=>{H[i]=to?2+14*e:16-14*e;drawBit(i,true)}).then(()=>drawBit(i,false))}
function coin(from,to){const c=art(solidSvg(cylinder(0,0,4.6,0,1.6,P,24),{tone:"hi",lit:true}),airL);place(c,from);return tween(c,to,420,14).then(()=>c.remove())}
async function increment(fast){
 hl(0);let i=0,steps=0;await wait(fast?0:120);
 while(i<B&&A[i]===1){hl(1);hl(2);steps++;const z=BASEZ+18;A[i]=0;
  const co=coin([X(i),0,z],[BIN.x+23,BIN.y+11,8]);await flip(i,0);if(!fast)await co;
  say(fmt(U.carry,{i}));i++;hl(3);if(!fast)await wait(80)}
 if(i<B){hl(4);steps++;A[i]=1;bank+=0;await flip(i,1)}else{A=Array(B).fill(0)}
 n++;cost+=steps;last=steps;drawBank();render();
 log(fmt(steps>1?U.logCarry:U.logOne,{n,s:steps,p:A.reduce((s,b)=>s+b,0)}));say(fmt(U.saySteps,{n,s:steps}));
}
function reset(){A=Array(B).fill(0);H=Array(B).fill(2);n=0;cost=0;last=0;bank=0;for(let i=0;i<B;i++)drawBit(i,false);drawBank();render();say(U.empty);log(U.intro)}
bind({inc:()=>increment(false),ten:async()=>{for(let r=0;r<10;r++)await increment(true)},reset});
for(let i=0;i<B;i++)drawBit(i,false);render();say(U.empty);log(U.intro);
startTour(async()=>{if(n>=60)reset();await increment(false)});
`;

const TEXT = {
  en: {
    title: "Amortized analysis", accent: "analysis", machine: "A binary counter that pays with coins",
    lede: "One increment can flip every bit, yet <strong>n increments cost at most 2n</strong>. The trick is to prepay: every bit that turns on keeps a coin to pay for turning off later.",
    refs: "CLRS, ch. 16", hint: "Space increments · S slows", keyA: "The bit that flips and the cost needle", keyB: "8 flip blocks; a coin sits on every 1",
    controls: [{ act: "inc", label: "Increment", primary: true }, { act: "ten", label: "+10" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>Increment</b>(A):", "  while A[i] = 1:", "    A[i] ← 0  <i>// paid by its coin</i>", "    i ← i + 1", "  A[i] ← 1  <i>// pay 1, store 1 coin</i>"],
    ui: { bits: "bits, high → low", cost: "real cost", ineq: "Σ cost = {c} ≤ 2n = {n}", carry: "carry out of bit {i}", logCarry: "Increment #{n}: {s} flips. The carries were paid by stored coins; Φ = {p}.", logOne: "Increment #{n}: 1 flip. Charged 2: one pays the flip, one stays on the new 1.", saySteps: "#{n} · {s} flip(s)", empty: "counter at 0", intro: "Each increment is charged 2 coins. Watch the real cost stay under 2n." },
    theory: [
      ["The question", `<p>A binary counter of $k$ bits. In the worst case one increment flips all $k$ bits, so a naive bound for $n$ increments is $O(nk)$. The real total is much smaller.</p>`],
      ["Aggregate method", `<p>Bit $i$ flips every $2^i$ increments, so over $n$ increments the total number of flips is</p>$$\\sum_{i=0}^{k-1} \\left\\lfloor \\frac{n}{2^i} \\right\\rfloor < n \\sum_{i=0}^{\\infty} \\frac{1}{2^i} = 2n$$<p>Amortized cost per increment: $O(1)$.</p>`],
      ["Accounting method", `<p>Charge every increment $\\hat c = 2$. One coin pays for setting a bit to 1, the other <strong>stays on that bit</strong>. Every reset $1 \\to 0$ is paid by the coin already sitting there. The coins never go negative, so the real cost is at most $2n$. That is exactly what the machine shows.</p>`],
      ["Potential method", `<p>Let $\\Phi(D_i) = b_i$, the number of 1s after the $i$-th increment. If increment $i$ resets $t_i$ bits, its real cost is $c_i = t_i + 1$ and</p>$$\\hat c_i = c_i + \\Phi(D_i) - \\Phi(D_{i-1}) \\le (t_i + 1) + (1 - t_i) = 2$$<p>The coins on the blocks <strong>are</strong> the potential.</p>`],
      ["Machine models", `<p>The <strong>RAM</strong> model charges one unit per operation on words of unbounded size. The <strong>Word-RAM</strong> fixes the word at $w \\ge \\log n$ bits, which is the model where hashing and bit tricks of weeks 02 to 04 are analysed.</p>`],
      ["To discuss", `<ol class="q"><li>Add a <em>Decrement</em>. Why does the $2n$ bound break when increments and decrements alternate?</li><li>Find a potential function for a dynamic array that doubles when full.</li><li>Amortized is not average: what is the difference with expected cost?</li></ol>`],
    ],
  },
  es: {
    title: "Análisis amortizado", accent: "amortizado", machine: "Un contador binario que paga con monedas",
    lede: "Un incremento puede voltear todos los bits, y aun así <strong>n incrementos cuestan a lo más 2n</strong>. El truco es pagar por adelantado: cada bit que se enciende guarda una moneda para apagarse después.",
    refs: "CLRS, cap. 16", hint: "Espacio incrementa · S lento", keyA: "El bit que voltea y la aguja de costo", keyB: "8 bloques; cada 1 guarda una moneda",
    controls: [{ act: "inc", label: "Incrementar", primary: true }, { act: "ten", label: "+10" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>Incrementar</b>(A):", "  mientras A[i] = 1:", "    A[i] ← 0  <i>// lo paga su moneda</i>", "    i ← i + 1", "  A[i] ← 1  <i>// paga 1, guarda 1</i>"],
    ui: { bits: "bits, alto → bajo", cost: "costo real", ineq: "Σ costo = {c} ≤ 2n = {n}", carry: "acarreo desde el bit {i}", logCarry: "Incremento #{n}: {s} volteos. Los acarreos los pagaron monedas guardadas; Φ = {p}.", logOne: "Incremento #{n}: 1 volteo. Se cobran 2: uno paga el volteo, otro queda sobre el nuevo 1.", saySteps: "#{n} · {s} volteo(s)", empty: "contador en 0", intro: "Cada incremento se cobra 2 monedas. Mira cómo el costo real se queda bajo 2n." },
    theory: [
      ["La pregunta", `<p>Un contador binario de $k$ bits. En el peor caso un incremento voltea los $k$ bits, así que una cota ingenua para $n$ incrementos es $O(nk)$. El total real es mucho menor.</p>`],
      ["Método agregado", `<p>El bit $i$ voltea cada $2^i$ incrementos, entonces en $n$ incrementos el total de volteos es</p>$$\\sum_{i=0}^{k-1} \\left\\lfloor \\frac{n}{2^i} \\right\\rfloor < n \\sum_{i=0}^{\\infty} \\frac{1}{2^i} = 2n$$<p>Costo amortizado por incremento: $O(1)$.</p>`],
      ["Método contable", `<p>Cobramos a cada incremento $\\hat c = 2$. Una moneda paga poner un bit en 1, la otra <strong>se queda sobre ese bit</strong>. Cada reinicio $1 \\to 0$ lo paga la moneda que ya estaba ahí. Las monedas nunca quedan en negativo, así que el costo real es a lo más $2n$. Eso es exactamente lo que muestra la máquina.</p>`],
      ["Método del potencial", `<p>Sea $\\Phi(D_i) = b_i$, la cantidad de 1s tras el $i$-ésimo incremento. Si el incremento $i$ reinicia $t_i$ bits, su costo real es $c_i = t_i + 1$ y</p>$$\\hat c_i = c_i + \\Phi(D_i) - \\Phi(D_{i-1}) \\le (t_i + 1) + (1 - t_i) = 2$$<p>Las monedas sobre los bloques <strong>son</strong> el potencial.</p>`],
      ["Modelos de cómputo", `<p>El modelo <strong>RAM</strong> cobra una unidad por operación sobre palabras de tamaño ilimitado. La <strong>Word-RAM</strong> fija la palabra en $w \\ge \\log n$ bits, que es el modelo donde se analizan el hashing y los trucos de bits de las semanas 02 a 04.</p>`],
      ["Para discutir", `<ol class="q"><li>Agrega un <em>Decrementar</em>. ¿Por qué se rompe la cota $2n$ si se alternan incrementos y decrementos?</li><li>Encuentra una función potencial para un arreglo dinámico que se duplica al llenarse.</li><li>Amortizado no es promedio: ¿cuál es la diferencia con costo esperado?</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "amortized-analysis", fig: "Fig 1", P, svg, consts: { B, PITCH, X0, BASEZ, DIAL, BIN }, code, TEXT, stateLabel: "ĉ = 2" }, UI);
