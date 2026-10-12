// Week 15: consistent hashing. A turntable ring: servers are posts on the rim, each owns the arc before it.
import { bench, k, S, L, D, layers } from "../lib/parts.mjs";
import { makeLesson } from "../lib/shell.mjs";
import { UI } from "../i18n/ui.mjs";

const R0 = 44, R1 = 62, TZ = 8;
const PLATE = { x: -86, y: -86, w: 172, d: 172, r: 8 };
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [0, -70, 30]], 640, 380, { pad: 20, azimuth: 45, elevation: 34 });
function table() {
  const out = [S(k.cylinder(0, 0, R1 + 6, 0, 4, P, 96, 0.6), { tone: "lo" }), S(k.cylinder(0, 0, R1 + 3, 4, TZ - 4, P, 96, 0.6), { tone: "mid" })];
  const t = k.radialTicks(0, 0, R1 + 2.4, 72, 6, TZ, [1.2, 2.6], P);
  out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }), L(k.ring(0, 0, R0 - 3, TZ, P, 72), { tone: "lo" }));
  out.push(S(k.cylinder(0, 0, 10, TZ, 3, P, 40, 0.5), { tone: "mid" }), L(k.knurl(0, 0, 10, TZ + 0.4, TZ + 3, 40, P), { tone: "lo" }), D([k.iso([0, 0, TZ + 3], P)], { size: 0.6, tone: "hi" }));
  return out.join("");
}
const svg = k.figureSvg({ width: 640, height: 380, label: "Consistent hashing ring", body: [bench(P, PLATE), table(), layers("arcs"), layers("keys"), layers("posts")] });

const code = String.raw`
const arcsL=layer("arcs"),keysL=layer("keys"),postsL=layer("posts");
const NAMES="ABCDEFGH".split("");let servers=[],keys=[],vnodes=false,owner=new Map(),moved=new Set();
function h(s){let x=2166136261;for(const c of s){x^=c.charCodeAt(0);x=Math.imul(x,16777619)>>>0}x^=x>>>13;x=Math.imul(x,0x5bd1e995)>>>0;return ((x^(x>>>15))>>>0)/4294967296}
const pts=()=>servers.flatMap(s=>(vnodes?[0,1,2]:[0]).map(r=>({s,a:h(s+"#"+r)}))).sort((a,b)=>a.a-b.a);
const ownerOf=a=>{const p=pts();if(!p.length)return null;return (p.find(q=>q.a>=a)||p[0]).s};
const ang=a=>a*Math.PI*2-Math.PI/2,at=(a,r,z)=>[Math.cos(ang(a))*r,Math.sin(ang(a))*r,z];
function sector(a0,a1,z,hgt){if(a1<=a0)a1+=1;const n=Math.max(3,Math.ceil((a1-a0)*72)),ring=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;ring.push([Math.cos(ang(a))*R1,Math.sin(ang(a))*R1])}for(let i=n;i>=0;i--){const a=a0+(a1-a0)*i/n;ring.push([Math.cos(ang(a))*R0,Math.sin(ang(a))*R0])}return extrude(ring,z,hgt,P)}
function draw(lit=new Set()){arcsL.innerHTML="";keysL.innerHTML="";postsL.innerHTML="";const p=pts();
 p.forEach((q,i)=>{const prev=p[(i-1+p.length)%p.length];let a0=p.length===1?q.a:prev.a,a1=q.a;if(a1<=a0)a1+=1;const idx=servers.indexOf(q.s),pts2=[];const n=Math.max(4,Math.ceil((a1-a0)*96));for(let j=0;j<=n;j++)pts2.push(at(a0+(a1-a0)*j/n+.004,(R0+R1)/2,TZ+.3));
  arcsL.insertAdjacentHTML("beforeend",'<path class="iso-line" data-tone="'+(lit.has(q.s)?"lit":idx%2?"lo":"mid")+'" style="stroke-width:'+(idx%2?7:9)+';stroke-linecap:butt;opacity:.9" d="'+poly(pts2)+'"/>')});
 for(const kk of keys){const [x,y]=at(kk.a,(R0+R1)/2,0);const g=art(solidSvg(cylinder(x,y,2.4,TZ+3,3,P,16),{tone:"hi",lit:moved.has(kk.k)}),keysL);g.pos=[x,y,0]}sortBy(keysL);
 for(const q of p){const [x,y]=at(q.a,R1+1,0);const g=art(solidSvg(cylinder(x,y,3.2,TZ,vnodes?12:18,P,20),{tone:"hi",lit:lit.has(q.s)})+solidSvg(cylinder(x,y,4.6,TZ+(vnodes?12:18),2,P,22),{tone:"mid"})+faceTextSvg(topMatrix([x,y+1.6],TZ+(vnodes?14:20),P,"x"),q.s,{size:4.4,tone:"hi",anchor:"middle"}),postsL);g.pos=[x,y,0]}sortBy(postsL)}
function assign(){const before=new Map(owner);owner=new Map(keys.map(kk=>[kk.k,ownerOf(kk.a)]));moved=new Set(keys.filter(kk=>before.has(kk.k)&&before.get(kk.k)!==owner.get(kk.k)).map(kk=>kk.k));return moved.size}
function render(){const load=servers.map(s=>keys.filter(kk=>owner.get(kk.k)===s).length);tables(cells(U.servers,"",load,()=>false,j=>servers[j]||"")+'<div class="mono">'+U.loadLabel+"</div>");
 const avg=keys.length/Math.max(1,servers.length);stats([[U.servers,servers.length],[U.keysN,keys.length],[U.moved,moved.size],[U.imbalance,servers.length?(Math.max(...load)/Math.max(1e-9,avg)).toFixed(2)+"×":"–"]])}
async function spin(){await animate(600,e=>{postsL.style.transform=arcsL.style.transform="";})}
async function addServer(){const s=NAMES.find(n=>!servers.includes(n));if(!s){say(U.max);return}hl(0);servers.push(s);const n=assign();hl(1);draw(new Set([s]));render();
 say(fmt(U.addSay,{s,n}));log(fmt(U.addLog,{s,n,t:keys.length,f:(keys.length/servers.length).toFixed(1)}));await wait(1400);moved.clear();draw()}
async function removeServer(){if(servers.length<=1)return;hl(3);const s=servers[Math.floor(Math.random()*servers.length)];servers=servers.filter(x=>x!==s);const n=assign();draw();render();say(fmt(U.rmSay,{s,n}));log(fmt(U.rmLog,{s,n}));await wait(1400);moved.clear();draw()}
async function addKeys(n=6){hl(5);for(let i=0;i<n;i++){const kname="k"+(keys.length+1);keys.push({k:kname,a:h("key:"+kname+":"+Math.random())})}assign();moved.clear();draw();render();say(fmt(U.keysSay,{n:keys.length}));log(U.keysLog)}
function toggle(){vnodes=!vnodes;const n=assign();draw();render();say(vnodes?U.vOn:U.vOff);log(fmt(U.vLog,{n}));setTimeout(()=>{moved.clear();draw()},1400*slow)}
function reset(){servers=["A","B","C"];keys=[];owner=new Map();moved=new Set();vnodes=false;for(let i=0;i<18;i++)keys.push({k:"k"+(i+1),a:h("key:"+i)});assign();moved.clear();draw();render();say(U.empty);log(U.intro)}
bind({add:addServer,rm:removeServer,keys:()=>addKeys(6),vn:async()=>toggle(),reset});
reset();
let st=0;startTour(async()=>{const s=st++%6;if(s===0||s===2)await addServer();else if(s===1||s===4)await removeServer();else if(s===3)toggle();else{reset()}});
`;

const TEXT = {
  en: {
    title: "Consistent hashing", accent: "Consistent", machine: "A turntable ring of servers and keys",
    lede: "Hash servers and keys onto the same circle; each key belongs to the next server clockwise. Adding or removing a server moves only <strong>about K/n keys</strong>, not almost all of them as with hash mod n.",
    refs: "Karger et al., 1997 · DeCandia et al. (Dynamo), 2007", hint: "Space adds a server · S slows", keyA: "The server that changed and the keys that moved", keyB: "Each server owns the arc that ends at its post",
    controls: [{ act: "add", label: "Add server", primary: true }, { act: "rm", label: "Remove server" }, { act: "keys", label: "+6 keys" }, { act: "vn", label: "Virtual nodes ×3" }, { act: "reset", label: "Reset", ghost: true }],
    pseudo: ["<b>AddServer</b>(s): place s at h(s) on the ring", "  only keys in (pred(s), s] move to s", "", "<b>RemoveServer</b>(s): its keys move to succ(s)", "", "<b>Owner</b>(k): first server clockwise from h(k)", "  <i>// binary search over sorted positions</i>"],
    ui: { servers: "servers", keysN: "keys", moved: "moved", imbalance: "max/avg", loadLabel: "keys per server", max: "8 servers max", addSay: "+{s}: {n} key(s) moved", addLog: "Server {s} joined: only {n} of {t} keys moved, all from its successor. Fair share is about {f}.", rmSay: "−{s}: {n} key(s) moved", rmLog: "Server {s} left: its {n} key(s) moved to the next server clockwise; nobody else noticed.", keysSay: "{n} keys", keysLog: "New keys land on the ring and go to the next server clockwise.", vOn: "virtual nodes on", vOff: "virtual nodes off", vLog: "Each server now sits at 3 points on the ring (or 1 again): {n} key(s) changed owner and the load evens out.", empty: "3 servers, 18 keys", intro: "Keys sit on the ring; each belongs to the next post clockwise. Add a server and count how few keys move." },
    theory: [
      ["The problem", `<p>With $\\text{server} = h(k) \\bmod n$, changing $n$ to $n+1$ remaps almost every key: about $\\frac{n}{n+1}$ of them. Caches go cold and data has to move.</p>`],
      ["The ring", `<p>Hash servers and keys into $[0, 1)$. A key belongs to the first server at or after its position. Adding a server takes keys only from its successor, so the expected number of moved keys is</p>$$\\frac{K}{n+1}$$<p>the minimum possible. Lookup is a binary search over the $n$ sorted positions: $O(\\log n)$.</p>`],
      ["Virtual nodes", `<p>With one point per server the arcs are uneven: the largest owns about $\\frac{\\ln n}{n}$ of the ring. Placing each server at $v = \\Theta(\\log n)$ points evens the load to $1 \\pm \\varepsilon$, and lets bigger machines take more points.</p>`],
      ["DHTs and skip graphs", `<p>Chord puts nodes on the ring and keeps <em>finger tables</em> to nodes at distance $2^i$, so lookups take $O(\\log n)$ hops without a central directory. Skip graphs generalise skip lists to a distributed setting with the same $O(\\log n)$ search.</p>`],
      ["To discuss", `<ol class="q"><li>With 3 servers and 18 keys, add a fourth. How many keys moved, against $18/4$?</li><li>Why do virtual nodes help when a server fails?</li><li>Where is this used? Dynamo, Cassandra, CDNs and load balancers.</li></ol>`],
    ],
  },
  es: {
    title: "Consistent hashing", accent: "Consistent", machine: "Un anillo giratorio de servidores y llaves",
    lede: "Se hashean servidores y llaves en el mismo círculo; cada llave pertenece al siguiente servidor en sentido horario. Agregar o quitar un servidor mueve solo <strong>unas K/n llaves</strong>, no casi todas como con hash mod n.",
    refs: "Karger et al., 1997 · DeCandia et al. (Dynamo), 2007", hint: "Espacio agrega un servidor · S lento", keyA: "El servidor que cambió y las llaves que se movieron", keyB: "Cada servidor es dueño del arco que termina en su poste",
    controls: [{ act: "add", label: "Agregar servidor", primary: true }, { act: "rm", label: "Quitar servidor" }, { act: "keys", label: "+6 llaves" }, { act: "vn", label: "Nodos virtuales ×3" }, { act: "reset", label: "Reiniciar", ghost: true }],
    pseudo: ["<b>AgregarServidor</b>(s): poner s en h(s) del anillo", "  solo las llaves en (pred(s), s] pasan a s", "", "<b>QuitarServidor</b>(s): sus llaves pasan a succ(s)", "", "<b>Dueño</b>(k): primer servidor en sentido horario desde h(k)", "  <i>// búsqueda binaria sobre posiciones ordenadas</i>"],
    ui: { servers: "servidores", keysN: "llaves", moved: "movidas", imbalance: "máx/prom", loadLabel: "llaves por servidor", max: "máximo 8 servidores", addSay: "+{s}: {n} llave(s) movidas", addLog: "Entró el servidor {s}: solo {n} de {t} llaves se movieron, todas desde su sucesor. La parte justa es cerca de {f}.", rmSay: "−{s}: {n} llave(s) movidas", rmLog: "Salió el servidor {s}: sus {n} llave(s) pasaron al siguiente en sentido horario; nadie más se enteró.", keysSay: "{n} llaves", keysLog: "Las llaves nuevas caen en el anillo y van al siguiente servidor en sentido horario.", vOn: "nodos virtuales activos", vOff: "sin nodos virtuales", vLog: "Cada servidor ahora está en 3 puntos del anillo (o de nuevo en 1): {n} llave(s) cambiaron de dueño y la carga se empareja.", empty: "3 servidores, 18 llaves", intro: "Las llaves están en el anillo; cada una pertenece al siguiente poste en sentido horario. Agrega un servidor y cuenta qué pocas se mueven." },
    theory: [
      ["El problema", `<p>Con $\\text{servidor} = h(k) \\bmod n$, pasar de $n$ a $n+1$ reasigna casi todas las llaves: cerca de $\\frac{n}{n+1}$. Los cachés se enfrían y hay que mover datos.</p>`],
      ["El anillo", `<p>Se hashean servidores y llaves en $[0, 1)$. Una llave pertenece al primer servidor en su posición o después. Agregar un servidor solo le quita llaves a su sucesor, así que el número esperado de llaves movidas es</p>$$\\frac{K}{n+1}$$<p>el mínimo posible. Buscar es una búsqueda binaria sobre las $n$ posiciones ordenadas: $O(\\log n)$.</p>`],
      ["Nodos virtuales", `<p>Con un punto por servidor los arcos son desiguales: el mayor se lleva cerca de $\\frac{\\ln n}{n}$ del anillo. Poner cada servidor en $v = \\Theta(\\log n)$ puntos empareja la carga a $1 \\pm \\varepsilon$ y permite que máquinas más grandes tomen más puntos.</p>`],
      ["DHTs y skip graphs", `<p>Chord pone los nodos en el anillo y guarda <em>finger tables</em> hacia nodos a distancia $2^i$, así las búsquedas toman $O(\\log n)$ saltos sin un directorio central. Los skip graphs generalizan las skip lists a un entorno distribuido con la misma búsqueda $O(\\log n)$.</p>`],
      ["Para discutir", `<ol class="q"><li>Con 3 servidores y 18 llaves, agrega un cuarto. ¿Cuántas llaves se movieron, contra $18/4$?</li><li>¿Por qué los nodos virtuales ayudan cuando un servidor falla?</li><li>¿Dónde se usa? Dynamo, Cassandra, CDNs y balanceadores de carga.</li></ol>`],
    ],
  },
};

export default makeLesson({ slug: "consistent-hashing", fig: "Fig 15", P, svg, consts: { R0, R1, TZ }, code, TEXT, stateLabel: "~K/n moved" }, UI);
