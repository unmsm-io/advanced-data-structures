import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../../vendor/anatomy/kit/lathe.mjs";
import { kitScript } from "../../vendor/anatomy/scripts/inline-kit.mjs";
import { lessonPage, pseudoHtml } from "../../lib/lesson.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "dist", "02-cuckoo");
const WIDTH = 640, HEIGHT = 350;

// Model: two tables of M slots, MAXK evictions before a rehash.
const M = 8, MAXK = 8, PITCH = 20;
const X0 = -((M - 1) * PITCH) / 2 + 12;
const ROW_Y = [-26, 18];
const CUP_R = 6.6, CUP_Z = 8, CUP_H = 4, BALL_R = 5.2;
const BALL_Z = CUP_Z + CUP_H + BALL_R - 1.6;
const PLATE = { x: -120, y: -58, w: 252, d: 128, r: 8 };
const PLATE_H = 10, FOOT_H = 5;
const HOPPER = [-104, -26], HOPPER_TOP = 58;
const DIAL = [104, 50], DIAL_R = 13, DIAL_Z = 0, DIAL_H = 7, DIAL_TOP = DIAL_Z + DIAL_H;
const KNOBS = [[-96, 50], [-70, 50]];

const slot = (t, j) => [X0 + j * PITCH, ROW_Y[t]];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [HOPPER[0], HOPPER[1], HOPPER_TOP + 8], [PLATE.x + PLATE.w, ROW_Y[0], 50]],
  WIDTH, HEIGHT, { pad: 28, azimuth: 40 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // label plate with three rule lines (stand-in for printed text)
  const label = { x: -40, y: 44, w: 44, d: 16, r: 1.5 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  for (const [i, w] of [[0, 30], [1, 22], [2, 26]]) out.push(L(k.lineOnTop([label.x + 5, label.y + 4.5 + i * 3.6], [label.x + 5 + w, label.y + 4.5 + i * 3.6], 0.8, P), { tone: "faint", free: true }));
  out.push(D(k.corners(label, 2).map(([x, y]) => at([x, y, 0.8])), { size: 0.4 }));
  return out.join("");
}

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

// Seed knobs: turning them changes h1 and h2; a rehash turns both.
function knob(i) {
  const [x, y] = KNOBS[i], out = [];
  out.push(S(k.cylinder(x, y, 9, 0, 1.4, P, 32), { tone: "lo" }));
  const t = k.radialTicks(x, y, 8.4, 12, 3, 1.4, [0.8, 1.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 6, 1.4, 6, P, 32, 0.4), { tone: "mid" }));
  out.push(L(k.knurl(x, y, 6, 1.8, 7, 36, P), { tone: "lo" }));
  out.push(`<path data-knob="${i}" class="iso-line" data-tone="hi" d="${knobLine(x, y, 0)}" style="stroke-width:1"/>`);
  out.push(D([at([x, y, 7.4])], { size: 0.5, tone: "hi" }));
  return out.join("");
}
const knobLine = (x, y, a) => k.lineOnTop([x, y], [x + Math.cos(a) * 5, y + Math.sin(a) * 5], 7.4, P);

// Kick counter: a dial gauge, the needle counts evictions in this chain; MAXK is the last major tick.
function dial() {
  const [x, y] = DIAL, out = [];
  out.push(S(k.slabOf({ x: x - 17, y: y - 17, w: 34, d: 34, r: 3 }, 0, 2, P, 4, 0.4), { tone: "lo" }));
  out.push(D(k.corners({ x: x - 17, y: y - 17, w: 34, d: 34 }, 3).map(([a, b]) => at([a, b, 2])), { size: 0.45 }));
  out.push(S(k.cylinder(x, y, DIAL_R, 2, DIAL_H - 2, P, 56, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, DIAL_R, DIAL_TOP - 2.4, DIAL_TOP, 64, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, DIAL_R - 1.8, DIAL_TOP, P, 48), { tone: "lo" }));
  const span = Math.PI * 1.5, from = Math.PI * 0.75;
  const t = k.radialTicks(x, y, DIAL_R - 2.6, MAXK * 2, 2, DIAL_TOP, [1, 2.2], P, from, span);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
  out.push(L(k.ring(x, y, 1.4, DIAL_TOP, P, 14), { tone: "mid" }));
  return out.join("");
}
const needleD = (kicks) => {
  const [x, y] = DIAL, a = Math.PI * 0.75 + (Math.min(kicks, MAXK) / MAXK) * Math.PI * 1.5;
  return k.lineOnTop([x - Math.cos(a) * 2.4, y - Math.sin(a) * 2.4], [x + Math.cos(a) * (DIAL_R - 3.4), y + Math.sin(a) * (DIAL_R - 3.4)], DIAL_TOP + 0.2, P);
};

// Ball art built once at the origin, moved with translateAlong.
const ballArt = S(G.sphereOf([0, 0, 0], BALL_R, P, { steps: 40 }), { tone: "hi" });
const balls = Array.from({ length: 2 * M + 1 }, (_, i) => `<g data-ball="${i}" style="display:none">${ballArt}</g>`).join("");

const svg = k.figureSvg({
  width: WIDTH, height: HEIGHT,
  label: "Una máquina de cuckoo hashing: una base con dos repisas de ocho tazas, una por tabla. Cada bola es una llave con dos tazas posibles, una por repisa. Al insertar, la bola cae a su taza en la repisa trasera; si está ocupada, el ocupante salta a su otra taza en la repisa delantera, y así sigue la cadena. Un contador de desalojos y dos perillas de semilla completan la máquina.",
  body: [
    plate(), hopper(), table(0), `<g data-layer="0"></g>`, table(1), `<g data-layer="1"></g>`,
    knob(0), knob(1), dial(),
    `<path data-part="needle" class="iso-line" data-tone="lit" data-free="" d="${needleD(0)}" style="stroke-width:1.1"/>`,
    `<g data-layer="air"></g>`, `<g data-pool hidden>${balls}</g>`,
  ],
});

const live = `
const P=${JSON.stringify(P)};
const M=${M},MAXK=${MAXK},ROW_Y=${JSON.stringify(ROW_Y)},X0=${X0},PITCH=${PITCH},BALL_Z=${BALL_Z},HOPPER=${JSON.stringify(HOPPER)},HOPPER_TOP=${HOPPER_TOP},KNOBS=${JSON.stringify(KNOBS)};
const DIAL=${JSON.stringify(DIAL)},DIAL_R=${DIAL_R},DIAL_TOP=${DIAL_TOP};
const stage=document.querySelector(".iso-stage"),svg=stage.querySelector("svg");
const readout=document.querySelector("[data-readout]"),needle=svg.querySelector('[data-part="needle"]');
const layers=[0,1,"air"].map(n=>svg.querySelector('[data-layer="'+n+'"]'));
const pool=[...svg.querySelectorAll("[data-ball]")];
const still=matchMedia("(prefers-reduced-motion: reduce)");
const panel=document.querySelector("[data-tables]"),logEl=document.querySelector("[data-log]");
const slot=(t,j)=>[X0+j*PITCH,ROW_Y[t]];
const hl=n=>document.querySelectorAll("[data-line]").forEach(e=>e.toggleAttribute("data-on",+e.dataset.line===n));
let seeds=[0x9e37,0x7f4a],T=[Array(M).fill(null),Array(M).fill(null)],ballOf=new Map(),free=pool.slice();
let kicks=0,totalKicks=0,rehashes=0,busy=false,slow=1,touring=true,idle=0,knobA=[0,0];
function h(t,key){let x=Math.imul(key^seeds[t],0x45d9f3b)>>>0;x=Math.imul(x^(x>>>16),t?0x27d4eb2d:0x165667b1)>>>0;return ((x^(x>>>15))>>>0)%M}
const lineOnTopL=(a,b,z)=>{const p=iso([a[0],a[1],z],P),q=iso([b[0],b[1],z],P);return "M"+p[0].toFixed(1)+" "+p[1].toFixed(1)+"L"+q[0].toFixed(1)+" "+q[1].toFixed(1)};
function needleD(n){const [x,y]=DIAL,a=Math.PI*0.75+(Math.min(n,MAXK)/MAXK)*Math.PI*1.5;return lineOnTopL([x-Math.cos(a)*2.4,y-Math.sin(a)*2.4],[x+Math.cos(a)*(DIAL_R-3.4),y+Math.sin(a)*(DIAL_R-3.4)],DIAL_TOP+0.2)}
let needleAt=0,needleWant=0;
function knobDraw(){KNOBS.forEach(([x,y],i)=>svg.querySelector('[data-knob="'+i+'"]').setAttribute("d",lineOnTopL([x,y],[x+Math.cos(knobA[i])*5,y+Math.sin(knobA[i])*5],7.4)))}
const place=(g,p)=>{g.pos=p;g.setAttribute("transform",translateAlong(P,p))};
function sortLayer(n){const l=layers[n];[...l.children].sort((a,b)=>depthOf(a.pos,P)-depthOf(b.pos,P)).forEach(c=>l.appendChild(c))}
const wait=ms=>new Promise(r=>setTimeout(r,still.matches?0:ms*slow));
function tween(g,to,dur,arc){return new Promise(res=>{const from=g.pos.slice(),t0=performance.now();dur*=slow;
 if(still.matches){place(g,to);return res()}
 (function f(now){const u=Math.min(1,(now-t0)/dur),e=u<.5?2*u*u:1-(-2*u+2)**2/2;
  place(g,[from[0]+(to[0]-from[0])*e,from[1]+(to[1]-from[1])*e,from[2]+(to[2]-from[2])*e+arc*Math.sin(Math.PI*u)]);
  u<1?requestAnimationFrame(f):res()})(t0)})}
function cupFlash(t,j){const c=svg.querySelector('[data-cup="'+t+'-'+j+'"] .iso-solid');if(!c)return;c.setAttribute("data-lit","");setTimeout(()=>c.removeAttribute("data-lit"),420*slow)}
const lit=(g,on)=>{const s=g.querySelector(".iso-solid");on?s.setAttribute("data-lit",""):s.removeAttribute("data-lit")};
function settle(g,t,j){const [x,y]=slot(t,j);place(g,[x,y,BALL_Z]);layers[t].appendChild(g);sortLayer(t)}
function say(text){readout.textContent=text;stage.setAttribute("aria-valuetext",text)}
function render(){const n=T[0].concat(T[1]).filter(v=>v!==null).length;
 panel.innerHTML=[0,1].map(t=>'<div><b>T<sub>'+(t+1)+'</sub><em>'+(t?"repisa delantera · h₂":"repisa trasera · h₁")+'</em></b><span>'+T[t].map((v,j)=>'<i'+(v===null?' class="e"':'')+'><small>'+j+'</small>'+(v===null?'—':v)+'</i>').join("")+'</span></div>').join("")+
 '';document.querySelector("[data-stats]").innerHTML=[["α = n/2m",(n/(2*M)).toFixed(2)],["llaves",n],["desalojos",totalKicks],["rehash",rehashes]].map(([a,b])=>'<div><span>'+a+'</span><b>'+b+'</b></div>').join("")}
const has=key=>T[0][h(0,key)]===key||T[1][h(1,key)]===key;
const count=()=>T[0].concat(T[1]).filter(v=>v!==null).length;
async function insert(key){
hl(1); if(has(key)){say("la llave "+key+" ya está");return}
 if(count()>=2*M-1){say("tabla llena: reinicia");return}
 const g=free.pop();g.style.display="";g.key=key;ballOf.set(key,g);
 place(g,[HOPPER[0],HOPPER[1],HOPPER_TOP+6]);layers[2].appendChild(g);lit(g,true);
 let cur=key,curG=g,t=0;kicks=0;needleWant=0;const chain=[key];
 logEl.textContent="Insertar "+key+": h₁("+key+") = "+h(0,key)+", h₂("+key+") = "+h(1,key)+".";
 hl(2);await wait(260);
 while(true){hl(4);
  const j=h(t,cur),[x,y]=slot(t,j);
  layers[2].appendChild(curG);say((kicks?"desalojo "+kicks+" · ":"")+cur+" → T"+(t+1)+"["+j+"]");
  await tween(curG,[x,y,BALL_Z],kicks?560:700,kicks?26:12);
  const prev=T[t][j];T[t][j]=cur;settle(curG,t,j);lit(curG,false);
  if(prev===null){hl(4);cupFlash(t,j);render();say(kicks?key+" entró tras "+kicks+" desalojo"+(kicks>1?"s":""):key+" cayó directo en T1["+j+"]");
   logEl.textContent=chain.length>1?"Cadena: "+chain.join(" → ")+". Búsqueda sigue siendo O(1): dos tazas.":"Sin colisión.";return}
  hl(5);kicks++;totalKicks++;needleWant=kicks;chain.push(prev);
  const pg=ballOf.get(prev);lit(pg,true);cupFlash(t,j);
  logEl.textContent="T"+(t+1)+"["+j+"] ocupada: "+cur+" expulsa a "+prev+". Cadena: "+chain.join(" → ");
  if(kicks>=MAXK){await wait(300);await rehash(prev,pg);return}
  await tween(pg,[x,y,BALL_Z+14],260,0);
  hl(6);await wait(200);cur=prev;curG=pg;t^=1;
 }
}
async function rehash(homeless,hg){
 hl(7);rehashes++;say("ciclo probable: rehash");logEl.textContent=MAXK+" desalojos seguidos: se asume ciclo. Nuevas semillas, todas las llaves se reinsertan.";
 const keys=T[0].concat(T[1]).filter(v=>v!==null).concat([homeless]);
 for(const key of keys){const g=ballOf.get(key);layers[2].appendChild(g);g.pos&&place(g,[g.pos[0],g.pos[1],BALL_Z+18])}
 const a0=knobA.slice(),t0=performance.now();
 await new Promise(r=>{(function f(now){const u=Math.min(1,(now-t0)/(700*slow));knobA=[a0[0]+u*Math.PI*0.8,a0[1]-u*Math.PI*0.6];knobDraw();u<1&&!still.matches?requestAnimationFrame(f):r()})(t0)});
 seeds=[(Math.imul(seeds[0],2654435761)+rehashes*97)>>>0&0xffff,(Math.imul(seeds[1],40503)+rehashes*31)>>>0&0xffff];
 T=[Array(M).fill(null),Array(M).fill(null)];
 for(const key of keys){let cur=key,t=0,n=0;while(cur!==null&&n<50){const j=h(t,cur),p=T[t][j];T[t][j]=cur;cur=p;t^=1;n++}if(cur!==null)return rehash(cur,ballOf.get(cur))}
 for(const key of keys){const g=ballOf.get(key);lit(g,false)}
 await Promise.all(keys.map(key=>{const g=ballOf.get(key),t=T[0].includes(key)?0:1,j=T[t].indexOf(key),[x,y]=slot(t,j);return tween(g,[x,y,BALL_Z],650,18).then(()=>settle(g,t,j))}));
 needleWant=0;render();say("rehash "+rehashes+" listo · semillas nuevas");
}
function find(key){hl(0);const a=h(0,key),b=h(1,key);cupFlash(0,a);cupFlash(1,b);
 say("buscar "+key+": "+(has(key)?"encontrada":"no está"));logEl.textContent="Buscar "+key+": solo se miran T1["+a+"] y T2["+b+"]. Dos accesos en el peor caso.";}
function reset(){if(busy)return;for(const g of ballOf.values()){g.style.display="none";svg.querySelector("[data-pool]").appendChild(g)}
 ballOf.clear();free=pool.slice();T=[Array(M).fill(null),Array(M).fill(null)];seeds=[0x9e37,0x7f4a];totalKicks=0;rehashes=0;needleWant=0;knobA=[0,0];knobDraw();render();say("máquina vacía")}
async function run(fn){if(busy)return;busy=true;try{await fn()}finally{busy=false}}
const randomKey=()=>{let x;do x=10+Math.floor(Math.random()*90);while(has(x));return x};
const userInput=()=>{touring=false;clearTimeout(idle);idle=setTimeout(()=>{touring=!still.matches;tour()},12000)};
async function tour(){while(touring){if(count()>=2*M-3)reset();await run(()=>insert(randomKey()));await wait(900)}}
(function loop(){needleAt+= (needleWant-needleAt)*0.12;needle.setAttribute("d",needleD(needleAt));requestAnimationFrame(loop)})();
document.querySelector("[data-act=insert]").onclick=()=>{userInput();run(()=>insert(randomKey()))};
document.querySelector("[data-act=add]").onclick=()=>{userInput();const v=+document.querySelector("[data-key]").value;if(v>0)run(()=>insert(v))};
document.querySelector("[data-act=find]").onclick=()=>{userInput();const v=+document.querySelector("[data-key]").value;if(v>0)find(v)};
document.querySelector("[data-act=reset]").onclick=()=>{userInput();reset()};
document.querySelector("[data-act=slow]").onclick=e=>{slow=slow===1?3:1;e.target.textContent="Lento: "+(slow>1?"sí":"no")};
addEventListener("keydown",e=>{if(e.target.tagName==="INPUT")return;if(e.key===" "){e.preventDefault();document.querySelector("[data-act=insert]").click()}if(e.key==="s")document.querySelector("[data-act=slow]").click()});
render();if(still.matches)touring=false;else tour();
`;

const controls = `<div class="ck-controls"><button class="pri" data-act="insert">Insertar al azar <kbd>Espacio</kbd></button><div class="ck-pair"><input data-key type="number" min="1" placeholder="llave"><button data-act="add">Insertar</button><button data-act="find">Buscar</button></div><button data-act="slow">Lento: no <kbd>S</kbd></button><button class="ghost" data-act="reset">Reiniciar</button></div>`;
const PSEUDO = [
  "<b>Buscar</b>(x): T₁[h₁(x)] = x  ∨  T₂[h₂(x)] = x",
  "<b>Insertar</b>(x): si Buscar(x), terminar",
  "t ← 1",
  "repetir MaxLoop veces:",
  "  si T<sub>t</sub>[h<sub>t</sub>(x)] vacía: colocar x, terminar",
  "  x ↔ T<sub>t</sub>[h<sub>t</sub>(x)]  <i>// desalojar</i>",
  "  t ← 3 − t  <i>// a su otra tabla</i>",
  "<b>Rehash</b>(); Insertar(x)",
];
const theory = `
<section><h2><small>01</small>La idea</h2><div class="body"><p>Usamos <strong>dos tablas</strong> $T_1, T_2$ de tamaño $m$ y <strong>dos funciones hash</strong> independientes. Cada llave $x$ tiene exactamente dos casas posibles:</p>
$$x \\in T_1[h_1(x)] \\quad\\lor\\quad x \\in T_2[h_2(x)]$$
<p>Esa es la invariante. Si se cumple siempre, buscar es mirar dos celdas y nada más.</p></div></section>
<section><h2><small>02</small>La máquina</h2><div class="body"><p>Cada <strong>repisa</strong> es una tabla, cada <strong>bola</strong> una llave. La <strong>aguja</strong> cuenta los desalojos de la inserción en curso; al llegar a MaxLoop $= ${MAXK}$ se asume un ciclo, giran las <strong>perillas de semilla</strong> (nuevas $h_1, h_2$) y todo se reinserta: el rehash.</p></div></section>
<section><h2><small>03</small>Complejidad</h2><div class="body"><div class="cards">
<div><span>Buscar · eliminar</span><b>$O(1)$</b><p>peor caso, 2 accesos</p></div>
<div><span>Insertar</span><b>$O(1)$</b><p>esperado amortizado, si $\\alpha &lt; \\tfrac12$</p></div>
<div><span>Espacio</span><b>$2m$</b><p>celdas, $\\alpha = n/2m$</p></div></div>
<p>Con funciones suficientemente aleatorias y $\\alpha \\le \\tfrac12 - \\varepsilon$, una inserción obliga a rehash con probabilidad</p>
$$\\Pr[\\text{rehash}] = O\\!\\left(\\frac{1}{m}\\right)$$
<p>y los desalojos esperados por inserción son constantes. Por eso basta MaxLoop $= O(\\log m)$: una cadena más larga casi siempre indica un <strong>ciclo</strong>.</p></div></section>
<section><h2><small>04</small>El grafo cuckoo</h2><div class="body"><p>Cada celda es un <strong>vértice</strong> y cada llave $x$ una <strong>arista</strong> entre $T_1[h_1(x)]$ y $T_2[h_2(x)]$: un grafo bipartito con $2m$ vértices y $n$ aristas.</p>
<p>Las llaves caben si y solo si <strong>cada componente conexa tiene a lo más un ciclo</strong>, es decir $|E| \\le |V|$ por componente. Una inserción que cierra un segundo ciclo no termina nunca: por eso existe MaxLoop.</p></div></section>
<section><h2><small>05</small>Para discutir</h2><div class="body"><ol class="q">
<li>Llena la máquina hasta $\\alpha \\approx 0.6$. ¿Qué pasa con las cadenas? ¿Por qué el límite es $\\tfrac12$?</li>
<li>Si $h_1 = h_2$, ¿qué se rompe? ¿Por qué deben ser <strong>independientes</strong>?</li>
<li>Contra <em>linear probing</em>: ¿quién gana en búsqueda, en inserción y en localidad de caché?</li>
<li>¿Dónde se usa? Tablas de ruteo en hardware y <em>cuckoo filters</em> (semana 03, junto a Bloom).</li></ol>
<p class="ref">Pagh, R. &amp; Rodler, F. F. (2004). Cuckoo hashing. <em>Journal of Algorithms</em>, 51(2), 122–144.</p></div></section>`;
const figure = k.plateHtml({
  fig: "Fig 2", title: "Cuckoo hashing",
  hint: "Espacio inserta · S lento",
  readout: "máquina vacía",
  keys: [
    { mark: "lit", label: "La llave en vuelo y la aguja" },
    { mark: "raised", label: "Dos repisas de 8 tazas: T₁ = h₁, T₂ = h₂" },
  ],
  caption: "",
  body: `<div class="iso-stage" tabindex="0" role="img" aria-label="Máquina de cuckoo hashing">${svg}</div>`,
});

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "index.html"), lessonPage({
  unit: "I", week: 2, title: "Cuckoo hashing", accent: "hashing",
  lede: "Una tabla hash donde <strong>buscar cuesta dos accesos en el peor caso</strong>. El precio se paga al insertar: como el cuco, la llave nueva expulsa a la que ocupa su nido.",
  refs: "Pagh &amp; Rodler, 2004",
  figure, controls, pseudo: pseudoHtml(PSEUDO), stateLabel: "MaxLoop = ${MAXK}", theory,
  script: kitScript() + live,
}));
console.log("wrote dist/02-cuckoo/index.html");
