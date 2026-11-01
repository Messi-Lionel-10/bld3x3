const FACE = {
  U: { n:[0,1,0],  c:[1,0,0],  d:[0,0,1] },
  F: { n:[0,0,1],  c:[1,0,0],  d:[0,-1,0] },
  R: { n:[1,0,0],  c:[0,0,-1], d:[0,-1,0] },
  B: { n:[0,0,-1], c:[-1,0,0], d:[0,-1,0] },
  L: { n:[-1,0,0], c:[0,0,1],  d:[0,-1,0] },
  D: { n:[0,-1,0], c:[1,0,0],  d:[0,0,-1] },
};
const FACE_ORDER = ["U","L","F","R","B","D"];
const FACE_COLORS = {
  U: "#f5f6f1", L: "#f29a36", F: "#20b65a",
  R: "#e83b3b", B: "#2475ce", D: "#f2df27"
};
const NET_ORIGIN = { U:[3,0], L:[0,3], F:[3,3], R:[6,3], B:[9,3], D:[3,6] };

// Letter locations copied from the user's supplied J Perm-style scheme.
const EDGE_LOCS = {
  A:["U",0,1], B:["U",1,2], C:["U",2,1], D:["U",1,0],
  E:["L",0,1], F:["L",1,2], G:["L",2,1], H:["L",1,0],
  I:["F",0,1], J:["F",1,2], K:["F",2,1], L:["F",1,0],
  M:["R",0,1], N:["R",1,2], O:["R",2,1], P:["R",1,0],
  Q:["B",0,1], R:["B",1,2], S:["B",2,1], T:["B",1,0],
  U:["D",0,1], V:["D",1,2], W:["D",2,1], X:["D",1,0],
};
const CORNER_LOCS = {
  A:["U",0,0], B:["U",0,2], C:["U",2,2], D:["U",2,0],
  E:["L",0,0], F:["L",0,2], G:["L",2,2], H:["L",2,0],
  I:["F",0,0], J:["F",0,2], K:["F",2,2], L:["F",2,0],
  M:["R",0,0], N:["R",0,2], O:["R",2,2], P:["R",2,0],
  Q:["B",0,0], R:["B",0,2], S:["B",2,2], T:["B",2,0],
  U:["D",0,0], V:["D",0,2], W:["D",2,2], X:["D",2,0],
};

// J Perm Old Pochmann setup targets. Buffers are B/M for edges and A/E/R for corners;
// the chosen corner buffer sticker is E (LBU), matching J Perm's method.
const EDGE_SETUPS = {
  A:"Lw2 D' L2", B:"", C:"Lw2 D L2", D:"", E:"L Dw' L", F:"Dw' L",
  G:"L' Dw' L", H:"Dw L'", I:"Lw D' L2", J:"Dw2 L", K:"Lw D L2",
  L:"L'", M:"", N:"Dw L", O:"D2 L' Dw' L", P:"Dw' L'", Q:"Lw' D L2",
  R:"L", S:"Lw' D' L2", T:"Dw2 L'", U:"D' L2", V:"D2 L2", W:"D L2", X:"L2"
};
const CORNER_SETUPS = {
  A:"", B:"R2", C:"F2 D", D:"F2", E:"", F:"F' D", G:"F'", H:"D' R",
  I:"F R'", J:"R'", K:"F' R'", L:"F2 R'", M:"F", N:"R' F", O:"R2 F",
  P:"R F", Q:"R D'", R:"", S:"D F'", T:"R", U:"D", V:"", W:"D'", X:"D2"
};

const REFERENCE_CASES = [
  {
    scramble:"B2 R2 B2 L U2 R' B2 R2 B2 R' U' B' F L' B D R B2 D B' D' U",
    edges:"QU SR NX IV PR DE", corners:"MW QX MD UI VP",
    edgeBuffer:"QUS", cornerBuffer:"", edgeCycles:["RNXIVPR"], cornerCycles:["MWQXM","DUI"], edgeOrient:["DE"], cornerOrient:["VP"]
  },
  {
    scramble:"U' L2 D' U R2 B' D' U' L2 B2 R' U' B' F' L U2 F R2 U'",
    edges:"KD IE XO WJ HL QN X", corners:"OU SC VN QI F",
    edgeBuffer:"K", cornerBuffer:"OUSCV", edgeCycles:["DIE","XOWJHLQNX"], cornerCycles:[], edgeOrient:[], cornerOrient:["NQ","IF"]
  }
];

const keyOf = (pos, normal) => `${pos.join(",")}|${normal.join(",")}`;
const add3 = (a,b) => a.map((v,i)=>v+b[i]);
const mul3 = (k,a) => a.map(v=>k*v);
function faceletKey(face,row,col) {
  const f = FACE[face];
  const pos = add3(f.n, add3(mul3(col-1,f.c), mul3(row-1,f.d)));
  return keyOf(pos,f.n);
}
function parseKey(key) {
  const [p,n] = key.split("|");
  return { pos:p.split(",").map(Number), normal:n.split(",").map(Number) };
}
function rotateVector(v, axis, q) {
  q = ((q % 4) + 4) % 4;
  if (q === 0) return [...v];
  if (q === 2) return v.map((x,i)=>i===axis?x:-x);
  const positive = q === 1;
  if (axis === 0) return positive ? [v[0],-v[2],v[1]] : [v[0],v[2],-v[1]];
  if (axis === 1) return positive ? [v[2],v[1],-v[0]] : [-v[2],v[1],v[0]];
  return positive ? [-v[1],v[0],v[2]] : [v[1],-v[0],v[2]];
}
function makeSolvedState() {
  const state = new Map();
  for (const face of Object.keys(FACE)) {
    for (let r=0;r<3;r++) for (let c=0;c<3;c++) {
      const k=faceletKey(face,r,c); state.set(k,k);
    }
  }
  return state;
}
function applyMove(state, token) {
  const face=token[0];
  if (!FACE[face]) throw new Error(`Unsupported scramble move: ${token}`);
  const suffix=token.slice(1);
  const turns=suffix==="2"?2:(suffix==="'"?3:1);
  const f=FACE[face];
  const axis=f.n.findIndex(v=>Math.abs(v)===1);
  const sign=f.n[axis];
  const q=(((-turns*sign)%4)+4)%4;
  const next=new Map();
  for (const [currentKey,homeKey] of state.entries()) {
    const {pos,normal}=parseKey(currentKey);
    if (pos[axis]===sign) {
      const newPos=rotateVector(pos,axis,q);
      const newNormal=rotateVector(normal,axis,q);
      next.set(keyOf(newPos,newNormal),homeKey);
    } else next.set(currentKey,homeKey);
  }
  if (next.size!==54) throw new Error("Cube-state transform produced an invalid facelet count.");
  return next;
}
function scrambleToState(scramble) {
  let state=makeSolvedState();
  const tokens=scramble.trim().split(/\s+/).filter(Boolean);
  for (const token of tokens) state=applyMove(state,token);
  return state;
}
function createLabelMaps(locations) {
  const letterToKey={}; const keyToLetter={}; const pieceOf={}; const groups=new Map();
  for (const [letter,loc] of Object.entries(locations)) {
    const key=faceletKey(...loc); letterToKey[letter]=key; keyToLetter[key]=letter;
    const {pos}=parseKey(key); const piece=pos.join(","); pieceOf[letter]=piece;
    if (!groups.has(piece)) groups.set(piece,[]);
    groups.get(piece).push(letter);
  }
  for (const letters of groups.values()) letters.sort();
  return {letterToKey,keyToLetter,pieceOf,groups};
}
const EDGE_MAPS=createLabelMaps(EDGE_LOCS);
const CORNER_MAPS=createLabelMaps(CORNER_LOCS);
function getStickerPermutation(state,maps) {
  const perm={};
  for (const [letter,key] of Object.entries(maps.letterToKey)) {
    const origin=state.get(key);
    const target=maps.keyToLetter[origin];
    if (!target) throw new Error(`Could not map sticker ${letter} to a lettering-scheme target.`);
    perm[letter]=target;
  }
  if (new Set(Object.values(perm)).size!==Object.keys(perm).length) {
    throw new Error("Sticker mapping is not a one-to-one permutation.");
  }
  for (const letters of maps.groups.values()) {
    const homePieces=new Set(letters.map(letter=>maps.pieceOf[perm[letter]]));
    if (homePieces.size!==1) throw new Error(`The cube state is inconsistent at piece ${letters.join("/")}.`);
  }
  return perm;
}
function setupCost(letter,setups) {
  const tokens=(setups[letter]||"").trim().split(/\s+/).filter(Boolean);
  return {
    htm:tokens.length,
    qtm:tokens.reduce((s,t)=>s+(t.endsWith("2")?2:1),0),
    wide:tokens.filter(t=>t.includes("w")).length
  };
}
function scoreSequence(sequence,setups) {
  return sequence.reduce((score,letter)=>{
    const cost=setupCost(letter,setups);
    return {htm:score.htm+cost.htm,qtm:score.qtm+cost.qtm,wide:score.wide+cost.wide};
  },{htm:0,qtm:0,wide:0});
}
function compareScore(a,b) {
  return a.htm-b.htm || a.qtm-b.qtm || a.wide-b.wide;
}
function traceBufferCycle(perm,maps,bufferLetter) {
  const bufferPiece=maps.pieceOf[bufferLetter];
  const sequence=[]; const visitedPieces=new Set([bufferPiece]);
  let current=bufferLetter;
  for (let guard=0;guard<40;guard++) {
    const next=perm[current];
    if (!next) throw new Error(`Broken edge/corner permutation at ${current}.`);
    if (maps.pieceOf[next]===bufferPiece) break;
    sequence.push(next); visitedPieces.add(maps.pieceOf[next]); current=next;
    if (guard===39) throw new Error("Buffer cycle did not close.");
  }
  return {sequence,visitedPieces};
}
function tracePieceCycle(perm,maps,start) {
  const sequence=[start]; const pieceSet=new Set([maps.pieceOf[start]]);
  let current=start;
  for (let guard=0;guard<40;guard++) {
    const next=perm[current];
    if (!next) throw new Error(`Broken cycle at ${current}.`);
    sequence.push(next);
    if (maps.pieceOf[next]===maps.pieceOf[start]) return {sequence,pieceSet};
    pieceSet.add(maps.pieceOf[next]); current=next;
  }
  throw new Error(`Cycle starting at ${start} did not close.`);
}
function getDisplacedPieces(perm,maps) {
  const displaced=new Set();
  for (const [piece,letters] of maps.groups.entries()) {
    const homePiece=maps.pieceOf[perm[letters[0]]];
    if (homePiece!==piece) displaced.add(piece);
  }
  return displaced;
}
function enumerateCycleOptions(perm,maps,pieceSet,setups) {
  const options=[];
  const labels=[...pieceSet].flatMap(piece=>maps.groups.get(piece)||[]);
  for (const letter of labels) {
    const traced=tracePieceCycle(perm,maps,letter);
    const score=scoreSequence(traced.sequence,setups);
    options.push({start:letter,sequence:traced.sequence,score,signature:traced.sequence.join("")});
  }
  options.sort((a,b)=>compareScore(a.score,b.score)||a.signature.localeCompare(b.signature));
  return options;
}
function findOrientationCorrections(perm,maps,setups,kind,bufferLetter) {
  const corrections=[];
  const bufferPiece=maps.pieceOf[bufferLetter];
  let implicitBufferOrientation=false;
  for (const [piece,letters] of maps.groups.entries()) {
    const homePiece=maps.pieceOf[perm[letters[0]]];
    if (homePiece!==piece) continue;
    const moved=letters.filter(l=>perm[l]!==l);
    if (!moved.length) continue;
    // The buffer itself cannot be targeted by an Old Pochmann setup. Its orientation
    // is handled implicitly by the other orientation corrections (legal cube states
    // constrain total edge flips and corner twists).
    if (piece===bufferPiece) { implicitBufferOrientation=true; continue; }
    const options=[];
    if (kind==="edge") {
      for (const l of moved) {
        const seq=[l,perm[l]];
        options.push({sequence:seq,score:scoreSequence(seq,setups),signature:seq.join("")});
      }
    } else {
      for (const l of moved) {
        const seq=[l,perm[l]];
        options.push({sequence:seq,score:scoreSequence(seq,setups),signature:seq.join("")});
      }
    }
    options.sort((a,b)=>compareScore(a.score,b.score)||a.signature.localeCompare(b.signature));
    corrections.push({piece,letters:[...letters],options,selected:0});
  }
  corrections.implicitBufferOrientation=implicitBufferOrientation;
  return corrections;
}
function computeMemoForKind(perm,maps,bufferLetter,setups,kind) {
  const {sequence:bufferSequence,visitedPieces}=traceBufferCycle(perm,maps,bufferLetter);
  const displaced=getDisplacedPieces(perm,maps);
  const remaining=new Set([...displaced].filter(p=>!visitedPieces.has(p)));
  const cycles=[];
  while (remaining.size) {
    // Discover one physical piece orbit, then expose every sticker as a valid cycle-break start.
    const seedPiece=[...remaining].sort((a,b)=>maps.groups.get(a)[0].localeCompare(maps.groups.get(b)[0]))[0];
    const seedLetter=maps.groups.get(seedPiece)[0];
    const traced=tracePieceCycle(perm,maps,seedLetter);
    const pieceSet=traced.pieceSet;
    const options=enumerateCycleOptions(perm,maps,pieceSet,setups);
    cycles.push({pieceSet,options,selected:0});
    for (const p of pieceSet) remaining.delete(p);
    for (const p of pieceSet) visitedPieces.add(p);
  }
  // Keep independent cycles in the order of their most efficient option's initial letter.
  cycles.sort((a,b)=>a.options[0].start.localeCompare(b.options[0].start));
  const orientation=findOrientationCorrections(perm,maps,setups,kind,bufferLetter);
  const solvedPieces=[...maps.groups.keys()].filter(p=>{
    const letters=maps.groups.get(p);
    return maps.pieceOf[perm[letters[0]]]===p && letters.every(l=>perm[l]===l);
  });
  const covered=new Set([...visitedPieces,...orientation.map(x=>x.piece),...solvedPieces]);
  const allPiecesCovered=covered.size===maps.groups.size;
  return {kind,bufferLetter,bufferSequence,cycles,orientation,implicitBufferOrientation:orientation.implicitBufferOrientation,solvedPieces,coveredPieces:covered.size,totalPieces:maps.groups.size,allPiecesCovered};
}
function formatPairs(sequence) {
  const pairs=[];
  for (let i=0;i<sequence.length;i+=2) pairs.push(sequence.slice(i,i+2).join(""));
  return pairs.join(" ");
}
function selectedSequence(result) {
  return [...result.bufferSequence,...result.cycles.flatMap(c=>c.options[c.selected].sequence),...result.orientation.map(o=>o.options[o.selected??0].sequence).flat()];
}
function renderNet(state) {
  const svg=document.getElementById("cubeNet");
  const size=32, gap=2, unit=size+gap, offsetX=43, offsetY=30;
  const labels={U:"UP",L:"LEFT",F:"FRONT",R:"RIGHT",B:"BACK",D:"DOWN"};
  let html=`<rect x="0" y="0" width="492" height="364" rx="12" fill="#0a1424" stroke="#233752"/>`;
  for (const face of FACE_ORDER) {
    const [gx,gy]=NET_ORIGIN[face];
    for (let r=0;r<3;r++) for (let c=0;c<3;c++) {
      const k=faceletKey(face,r,c); const home=parseKey(state.get(k));
      const homeFace=Object.entries(FACE).find(([name,f])=>f.n.join(",")===home.normal.join(","))?.[0] || face;
      const x=offsetX+gx*unit+c*unit, y=offsetY+gy*unit+r*unit;
      html+=`<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="2.5" fill="${FACE_COLORS[homeFace]}" stroke="#07101d" stroke-width="1.4"/>`;
    }
    const cx=offsetX+gx*unit+1.5*unit-gap/2;
    const ty=offsetY+gy*unit+3*unit+11;
    html+=`<text x="${cx}" y="${ty}" text-anchor="middle" font-size="8" font-weight="800" letter-spacing="1.3" fill="#647b99">${labels[face]}</text>`;
  }
  svg.innerHTML=html;
}
function renderOptions(container, result, type, onChange) {
  container.innerHTML="";
  if (result.bufferSequence.length) {
    const bufferCard=document.createElement("div"); bufferCard.className="cycle-card";
    bufferCard.innerHTML=`<div class="cycle-card-head"><div class="cycle-name">Buffer cycle</div><div class="cycle-note">fixed start · ${result.bufferSequence.length} target letters</div></div><div class="paired-letters">${formatPairs(result.bufferSequence)}</div>`;
    container.appendChild(bufferCard);
  } else {
    const note=document.createElement("div"); note.className="cycle-card";
    note.innerHTML=`<div class="cycle-name">Buffer already reached</div><div class="muted small">No targets are needed in the initial buffer cycle.</div>`;
    container.appendChild(note);
  }
  if (!result.cycles.length) {
    const empty=document.createElement("div"); empty.className="cycle-card";
    empty.innerHTML=`<div class="cycle-name">No additional permutation cycles</div><div class="muted small">All remaining pieces are solved or handled by orientation corrections.</div>`;
    container.appendChild(empty); return;
  }
  result.cycles.forEach((cycle,index)=>{
    const card=document.createElement("div"); card.className="cycle-card";
    const head=document.createElement("div"); head.className="cycle-card-head";
    const cycleNumber=index+(result.bufferSequence.length?2:1);
    const name=document.createElement("div"); name.className="cycle-name"; name.textContent=`Cycle ${cycleNumber} · ${cycle.pieceSet.size} pieces`;
    const note=document.createElement("div"); note.className="cycle-note"; note.textContent=`${cycle.options.length} start options · ranked by setup cost`;
    head.append(name,note);
    const strip=document.createElement("div"); strip.className="option-strip";
    cycle.options.forEach((option,optIndex)=>{
      const button=document.createElement("button"); button.type="button";
      button.className="option-chip"+(optIndex===cycle.selected?" selected":"");
      button.setAttribute("aria-pressed",optIndex===cycle.selected?"true":"false");
      button.innerHTML=`<span class="rank">${optIndex===0?"BEST SETUP":`OPTION ${optIndex+1}`}</span><span class="sequence">${formatPairs(option.sequence)}</span><span class="cost">${option.score.htm} setup moves · starts ${option.start}</span>`;
      button.addEventListener("click",()=>onChange(type,index,optIndex));
      strip.appendChild(button);
    });
    card.append(head,strip); container.appendChild(card);
  });
}
function renderOrientation(container,result,kind,onChange) {
  container.innerHTML="";
  const box=document.createElement("div"); box.className="orientation-box";
  const title=document.createElement("div"); title.className="orientation-title";
  title.textContent=kind==="edge"?"FLIPPED EDGES":"TWISTED CORNERS";
  box.appendChild(title);
  if (!result.orientation.length && !result.implicitBufferOrientation) {
    const p=document.createElement("div"); p.textContent="No flipped or twisted pieces detected."; box.appendChild(p);
  } else {
    result.orientation.forEach((item,index)=>{
      const group=document.createElement("div"); group.className="orientation-choice";
      const label=document.createElement("div"); label.className="cycle-card-head";
      const name=document.createElement("div"); name.className="cycle-name";
      name.textContent=`${kind==="edge"?"Flip":"Twist"} · ${item.letters.join(" / ")}`;
      label.appendChild(name); group.appendChild(label);
      const strip=document.createElement("div"); strip.className="option-strip";
      item.options.forEach((option,optIndex)=>{
        const button=document.createElement("button"); button.type="button";
        button.className="option-chip"+(optIndex===(item.selected??0)?" selected":"");
        button.setAttribute("aria-pressed",optIndex===(item.selected??0)?"true":"false");
        button.innerHTML=`<span class="rank">${optIndex===0?"BEST SETUP":`OPTION ${optIndex+1}`}</span><span class="sequence">${option.sequence.join("")}</span><span class="cost">${option.score.htm} setup moves</span>`;
        button.addEventListener("click",()=>onChange(kind+"Orientation",index,optIndex));
        strip.appendChild(button);
      });
      group.appendChild(strip); box.appendChild(group);
    });
    if (result.implicitBufferOrientation) {
      const p=document.createElement("div"); p.className="muted small";
      p.textContent="The buffer piece is also misoriented; its orientation is handled implicitly by the other flip/twist correction(s), because the buffer cannot be a direct target.";
      box.appendChild(p);
    }
  }
  container.appendChild(box);
}
function currentMemoText() {
  if (!currentResults) return "";
  const e=selectedSequence(currentResults.edges), c=selectedSequence(currentResults.corners);
  return `EDGES: ${formatPairs(e)}\nCORNERS: ${formatPairs(c)}\nPARITY: ${parityText(e,c)}`;
}
function parityText(edges,corners) {
  if ((edges.length%2)!==(corners.length%2)) return "CHECK ERROR";
  return edges.length%2?"YES":"NO";
}
function updatePairedSummary() {
  const edges=selectedSequence(currentResults.edges), corners=selectedSequence(currentResults.corners);
  document.getElementById("edgePaired").textContent=formatPairs(edges)||"—";
  document.getElementById("cornerPaired").textContent=formatPairs(corners)||"—";
  document.getElementById("letterCount").textContent=`${edges.length} edge letters · ${corners.length} corner letters`;
  const parity=parityText(edges,corners);
  const el=document.getElementById("parityValue"); el.textContent=parity; el.className="parity-value"+(parity==="YES"?" yes":"");
}
function updateVerification() {
  const e=currentResults.edges, c=currentResults.corners;
  const edgeLetters=selectedSequence(e), cornerLetters=selectedSequence(c);
  const parityOk=(edgeLetters.length%2)===(cornerLetters.length%2);
  const edgeCyclesClose=e.cycles.every(c=>c.options.every(o=>EDGE_MAPS.pieceOf[o.sequence[0]]===EDGE_MAPS.pieceOf[o.sequence[o.sequence.length-1]]));
  const cornerCyclesClose=c.cycles.every(c=>c.options.every(o=>CORNER_MAPS.pieceOf[o.sequence[0]]===CORNER_MAPS.pieceOf[o.sequence[o.sequence.length-1]]));
  const checks=[
    [e.allPiecesCovered && e.totalPieces===12,"All 12 edge pieces classified"],
    [c.allPiecesCovered && c.totalPieces===8,"All 8 corner pieces classified"],
    [edgeCyclesClose,"Every edge cycle alternative closes on its starting piece"],
    [cornerCyclesClose,"Every corner cycle alternative closes on its starting piece"],
    [edgeLetters.every(x=>Object.hasOwn(EDGE_LOCS,x)),"Every edge target uses the supplied lettering scheme"],
    [cornerLetters.every(x=>Object.hasOwn(CORNER_LOCS,x)),"Every corner target uses the supplied lettering scheme"],
    [parityOk,"Edge and corner memo parity agrees"],
    [edgeLetters.length>0 && cornerLetters.length>0,"Both memo sequences generated"]
  ];
  const okay=checks.every(([pass])=>pass);
  for (const [id,pass] of [["edgeCheck",e.allPiecesCovered],["cornerCheck",c.allPiecesCovered]]) {
    const el=document.getElementById(id); el.textContent=pass?"Piece coverage OK":"Coverage issue"; el.className="check-pill "+(pass?"good":"bad");
  }
  const box=document.getElementById("verificationBox");
  box.innerHTML=`<h3>${okay?"Internal verification passed":"Verification needs attention"}</h3><div class="verification-list">${checks.map(([pass,label])=>`<div class="verification-item ${pass?"":"fail"}"><span class="tick">${pass?"✓":"!"}</span>${label}</div>`).join("")}</div>`;
  return okay;
}
function rerenderMemo() {
  renderOptions(document.getElementById("edgeCycles"),currentResults.edges,"edge",handleOptionChange);
  renderOptions(document.getElementById("cornerCycles"),currentResults.corners,"corner",handleOptionChange);
  renderOrientation(document.getElementById("edgeOrientation"),currentResults.edges,"edge",handleOptionChange);
  renderOrientation(document.getElementById("cornerOrientation"),currentResults.corners,"corner",handleOptionChange);
  updatePairedSummary();
  updateVerification();
}
function handleOptionChange(kind,cycleIndex,optionIndex) {
  if (kind==="edgeOrientation" || kind==="cornerOrientation") {
    const result=kind==="edgeOrientation"?currentResults.edges:currentResults.corners;
    result.orientation[cycleIndex].selected=optionIndex;
  } else {
    const result=kind==="edge"?currentResults.edges:currentResults.corners;
    result.cycles[cycleIndex].selected=optionIndex;
  }
  rerenderMemo();
}
function computeBoth(scramble,drawNet=true) {
  const state=scrambleToState(scramble);
  if (drawNet) renderNet(state);
  const edgePerm=getStickerPermutation(state,EDGE_MAPS);
  const cornerPerm=getStickerPermutation(state,CORNER_MAPS);
  const edges=computeMemoForKind(edgePerm,EDGE_MAPS,"B",EDGE_SETUPS,"edge");
  const corners=computeMemoForKind(cornerPerm,CORNER_MAPS,"E",CORNER_SETUPS,"corner");
  return {edges,corners};
}

let currentScramble="";
let currentResults=null;
let scrambleGenerator=null;
let generating=false;
async function loadGenerator() {
  if (scrambleGenerator) return scrambleGenerator;
  const mod=await import("https://cdn.cubing.net/v0/js/cubing/scramble");
  scrambleGenerator=mod.randomScrambleForEvent;
  if (typeof scrambleGenerator!=="function") throw new Error("The scramble generator did not load correctly.");
  return scrambleGenerator;
}
async function generateNewScramble() {
  if (generating) return;
  generating=true;
  const newBtn=document.getElementById("newScrambleBtn");
  const status=document.getElementById("scrambleStatus");
  newBtn.disabled=true; document.getElementById("revealBtn").disabled=true;
  status.textContent="Generating a fresh random-state scramble…";
  document.getElementById("memoPanel").classList.add("hidden");
  try {
    const generator=await loadGenerator();
    const alg=await generator("333");
    const scramble=alg.toString().trim();
    if (!scramble) throw new Error("The scramble generator returned an empty sequence.");
    currentResults=computeBoth(scramble);
    currentScramble=scramble;
    document.getElementById("scrambleText").textContent=scramble;
    document.getElementById("copyScrambleBtn").disabled=false;
    document.getElementById("revealBtn").disabled=false;
    status.textContent="New scramble ready. The 2D net is generated from the same scramble state.";
  } catch (error) {
    status.textContent=`Could not generate a new scramble: ${error.message}. Check your connection and try again.`;
    if (!currentScramble) {
      document.getElementById("scrambleText").textContent="Scramble unavailable";
      document.getElementById("copyScrambleBtn").disabled=true;
    } else {
      document.getElementById("revealBtn").disabled=false;
      document.getElementById("copyScrambleBtn").disabled=false;
    }
    console.error(error);
  } finally {
    generating=false; newBtn.disabled=false;
  }
}
function showMemo() {
  if (!currentResults) return;
  document.getElementById("memoPanel").classList.remove("hidden");
  rerenderMemo();
  document.getElementById("memoPanel").scrollIntoView({behavior:"smooth",block:"start"});
}
function setIntegrityBadge(ok) {
  const el=document.getElementById("integrityBadge");
  el.className="integrity-badge "+(ok?"good":"bad");
  el.innerHTML=`<span class="status-dot"></span><span>${ok?"Reference checks passed":"Reference check failed"}</span>`;
}
function runReferenceTests() {
  const failures=[];
  const assemble=(result,cycleSignatures,orientationSignatures)=>{
    const cycles=cycleSignatures.map(signature=>{
      for (const cycle of result.cycles) {
        const option=cycle.options.find(o=>o.signature===signature);
        if (option) return option.sequence;
      }
      throw new Error(`Reference cycle ${signature} is missing.`);
    });
    const orientations=orientationSignatures.map(signature=>{
      for (const item of result.orientation) {
        const option=item.options.find(o=>o.signature===signature);
        if (option) return option.sequence;
      }
      throw new Error(`Reference orientation ${signature} is missing.`);
    });
    return [...result.bufferSequence,...cycles.flat(),...orientations.flat()];
  };
  for (let i=0;i<REFERENCE_CASES.length;i++) {
    const test=REFERENCE_CASES[i];
    try {
      const res=computeBoth(test.scramble,false);
      const edgeMemo=assemble(res.edges,test.edgeCycles,test.edgeOrient);
      const cornerMemo=assemble(res.corners,test.cornerCycles,test.cornerOrient);
      if (formatPairs(edgeMemo)!==test.edges) failures.push(`Example ${i+1} edge memo`);
      if (formatPairs(cornerMemo)!==test.corners) failures.push(`Example ${i+1} corner memo`);
      if (!res.edges.allPiecesCovered) failures.push(`Example ${i+1} edge coverage`);
      if (!res.corners.allPiecesCovered) failures.push(`Example ${i+1} corner coverage`);
      if ((edgeMemo.length%2)!==(cornerMemo.length%2)) failures.push(`Example ${i+1} parity`);
    } catch (error) {
      failures.push(`Example ${i+1}: ${error.message}`);
    }
  }
  setIntegrityBadge(failures.length===0);
  if (failures.length) console.error("Reference test failures:",failures);
  return failures;
}

// UI events
const copyText=async(text,statusEl,success)=>{
  try { await navigator.clipboard.writeText(text); statusEl.textContent=success; }
  catch { statusEl.textContent="Clipboard access is unavailable in this browser."; }
};
document.getElementById("newScrambleBtn").addEventListener("click",generateNewScramble);
document.getElementById("revealBtn").addEventListener("click",showMemo);
document.getElementById("copyScrambleBtn").addEventListener("click",()=>copyText(currentScramble,document.getElementById("scrambleStatus"),"Scramble copied."));
document.getElementById("copyMemoBtn").addEventListener("click",()=>copyText(currentMemoText(),document.getElementById("scrambleStatus"),"Paired memo copied."));
document.getElementById("hideMemoBtn").addEventListener("click",()=>document.getElementById("memoPanel").classList.add("hidden"));

try {
  const failures=runReferenceTests();
  if (failures.length===0) setIntegrityBadge(true);
} catch (error) {
  setIntegrityBadge(false); console.error("Reference tests could not run:",error);
}
generateNewScramble();
