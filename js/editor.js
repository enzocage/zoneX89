const ED_TOOLS=['wa','fo','ai','pu','to','tü','ma','I','R','r'];
const ED_COLS ={wa:'#1e1e1e',fo:'#0e1c2a',ai:'#080d12',pu:'#aaff00',to:'#3377ee','tü':'#8822dd',ma:'#bb9955',I:'#00ffcc',R:'#ff2233',r:'#ff7700'};
const TB_W=170;
const MAZE_ALGOS = Object.keys(MAZE_ALGORITHMS);
let mazeDropdownOpen = false;
let mazeSelectedAlgo = 'Backtracking';
let mazeDensity = 1;
let mazeDropdownScroll = 0;
let mazeSliderDragging = false;
let mazeDropdownVisibleCount = 6;

function enterEditor(){
  edMode=true;
  edDrag=false;
  edTiles=tiles.map(r=>[...r]);
  enemies.forEach(e=>{ edTiles[e.gy][e.gx]=e.type==='fast'?'R':'r'; });
  edTiles[player.sy][player.sx]='I';
}

function exitEditor(){
  edMode=false;
  const newE=[], newP=[], newB=[], newD=[], newM=[];
  let newStart={x:player.sx,y:player.sy};

  const baseTiles=edTiles.map((row,y)=>row.map((t,x)=>{
    if(t==='R'){ newE.push({type:'fast',x,y}); return 'fo'; }
    if(t==='r'){ newE.push({type:'slow',x,y}); return 'fo'; }
    if(t==='I'){ newStart={x,y}; return 'fo'; }
    if(t==='pu'){ newP.push({x,y}); return 'fo'; }
    if(t==='to'){ newB.push({x,y}); return 'fo'; }
    if(t==='tü'){ newD.push({x,y}); return 'fo'; }
    if(t==='ma'){ newM.push({x,y}); return 'fo'; }
    return t;
  }));

  tiles=baseTiles;
  fogMap=tiles.map(r=>r.map(t=>t==='fo'));

  enemies=newE.map((e,i)=>{
    const spd=e.type==='fast'?P.EFAST:P.ESLOW;
    const dir=DIRS4[Math.floor(Math.random()*4)];
    return {id:i, ox:e.x, oy:e.y,
            gx:e.x, gy:e.y, px:e.x*TS, py:e.y*TS, tx:e.x, ty:e.y,
            dx:dir[0], dy:dir[1], moving:false, speed:spd, type:e.type};
  });
  plutoniums=newP.map((p,i)=>({id:i,x:p.x,y:p.y,ox:p.x,oy:p.y,collected:false,carried:false}));
  totalPu=plutoniums.length; puDelivered=0;
  barrels=newB.map(b=>({x:b.x,y:b.y,flash:0}));
  doors=newD.map(d=>({x:d.x,y:d.y,open:false,t:0}));
  mats=newM.map(m=>({x:m.x,y:m.y,active:true}));

  plutoniums.forEach(p=>tiles[p.y][p.x]='pu');
  barrels.forEach(b=>tiles[b.y][b.x]='to');
  doors.forEach(d=>tiles[d.y][d.x]='tü');
  mats.forEach(m=>tiles[m.y][m.x]='ma');

  player.sx=newStart.x; player.sy=newStart.y;
  player.gx=newStart.x; player.gy=newStart.y;
  player.px=newStart.x*TS; player.py=newStart.y*TS;
  player.tx=newStart.x; player.ty=newStart.y; player.moving=false;
  player.carryPus=[]; player.carryMat=false; player.puTimer=0;
  lives=P.LIVES; score=0; invTimer=0; gameState='playing';
}

function editorGridParams(){
  const marg=48;
  const gw=canvas.width-TB_W-marg*2;
  const gh=canvas.height-marg*2;
  const scale=Math.min(gw/(W*TS), gh/(H*TS));
  return {marg, scale, ox:marg, oy:marg};
}

function screenToGrid(sx,sy){
  const {marg,scale,ox,oy}=editorGridParams();
  return [Math.floor((sx-ox)/(scale*TS)), Math.floor((sy-oy)/(scale*TS))];
}

function renderEditor(){
  ctx.fillStyle='#0a0a0f';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const {marg,scale,ox,oy}=editorGridParams();

  ctx.save();
  ctx.translate(ox,oy);
  ctx.scale(scale,scale);

  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const t=edTiles[y][x];
    ctx.fillStyle=ED_COLS[t]||'#080d12';
    ctx.fillRect(x*TS,y*TS,TS,TS);
    ctx.strokeStyle='rgba(255,255,255,0.05)';
    ctx.lineWidth=0.5;
    ctx.strokeRect(x*TS,y*TS,TS,TS);
  }

  if(edHX>=0&&edHY>=0&&edHX<W&&edHY<H){
    ctx.strokeStyle='rgba(0,255,200,0.8)';
    ctx.lineWidth=1.5/scale;
    ctx.strokeRect(edHX*TS,edHY*TS,TS,TS);
  }

  ctx.restore();

  const tbX=canvas.width-TB_W;
  ctx.fillStyle='#0d0d18';
  ctx.fillRect(tbX,0,TB_W,canvas.height);
  ctx.strokeStyle='rgba(0,255,200,0.15)';
  ctx.lineWidth=1;
  ctx.strokeRect(tbX,0,TB_W,canvas.height);

  ctx.fillStyle='#00ffcc';
  ctx.font='bold 12px "Courier New",monospace';
  ctx.textAlign='center';
  ctx.fillText('── EDITOR ──',tbX+TB_W/2,22);

  ED_TOOLS.forEach((t,i)=>{
    const bx=tbX+10, by=34+i*40;
    ctx.fillStyle=edTool===t?'#1a2a1a':'#111118';
    ctx.fillRect(bx,by,TB_W-20,34);
    ctx.strokeStyle=edTool===t?'#00ffcc':'rgba(255,255,255,0.1)';
    ctx.lineWidth=edTool===t?1.5:0.5;
    ctx.strokeRect(bx,by,TB_W-20,34);
    ctx.fillStyle=ED_COLS[t]||'#fff';
    ctx.fillRect(bx+4,by+5,24,24);
    ctx.fillStyle='#ccc';
    ctx.font='12px "Courier New",monospace';
    ctx.textAlign='left';
    ctx.fillText(t,bx+34,by+21);
    if(edTool===t){ ctx.fillStyle='#00ffcc'; ctx.fillText('◀',tbX+TB_W-22,by+21); }
  });

  const btnY=34+ED_TOOLS.length*40+16;
  edBtn('💾 Speichern',tbX+10,btnY,TB_W-20,30);
  edBtn('📂 Laden',tbX+10,btnY+36,TB_W-20,30);
  edBtn('▶  Spielen',tbX+10,btnY+72,TB_W-20,30);
  edBtn('🗑  Leeren',tbX+10,btnY+108,TB_W-20,30);
  // ── Maze Sektion ──
  const mzY = btnY+144;
  // Dropdown-Toggle-Button mit aktuellem Algo-Namen
  const algoShort = mazeSelectedAlgo.length > 14 ? mazeSelectedAlgo.slice(0,13)+'…' : mazeSelectedAlgo;
  ctx.fillStyle='#1a1a2a'; ctx.fillRect(tbX+10,mzY,TB_W-20,28);
  ctx.strokeStyle=mazeDropdownOpen?'#00ffcc':'rgba(0,200,160,0.3)'; ctx.lineWidth=0.8;
  ctx.strokeRect(tbX+10,mzY,TB_W-20,28);
  ctx.fillStyle='#99bbaa'; ctx.font='11px "Courier New",monospace'; ctx.textAlign='left';
  ctx.fillText('🌀 '+algoShort,tbX+14,mzY+18);
  ctx.fillStyle=mazeDropdownOpen?'#00ffcc':'#556655'; ctx.textAlign='right';
  ctx.fillText('▼',tbX+TB_W-14,mzY+18);

  // Dichte-Slider
  const slY = mzY+36;
  ctx.fillStyle='#667766'; ctx.font='10px "Courier New",monospace'; ctx.textAlign='left';
  ctx.fillText('Offen:Wand',tbX+12,slY+10);
  ctx.fillStyle='#00ffcc'; ctx.textAlign='right';
  ctx.fillText(mazeDensity+':1',tbX+TB_W-12,slY+10);
  const slTrackX=tbX+12, slTrackY=slY+16, slTrackW=TB_W-24, slTrackH=10;
  ctx.fillStyle='#1a1a2a'; ctx.fillRect(slTrackX,slTrackY,slTrackW,slTrackH);
  ctx.strokeStyle='rgba(0,200,160,0.3)'; ctx.lineWidth=0.8;
  ctx.strokeRect(slTrackX,slTrackY,slTrackW,slTrackH);
  const slFill=((mazeDensity-1)/9)*slTrackW;
  ctx.fillStyle='rgba(0,200,130,0.25)'; ctx.fillRect(slTrackX,slTrackY,slFill,slTrackH);
  const knobX=slTrackX+slFill;
  ctx.fillStyle='#00ffcc'; ctx.beginPath(); ctx.arc(knobX,slTrackY+slTrackH/2,5,0,Math.PI*2); ctx.fill();

  // Dropdown-Liste
  if(mazeDropdownOpen){
    const itemH=22, ddX=tbX+10, ddW=TB_W-20;
    const maxVis=Math.max(4,Math.min(MAZE_ALGOS.length,Math.floor((canvas.height-mzY-70)/itemH)));
    mazeDropdownVisibleCount=maxVis;
    mazeDropdownScroll=Math.max(0,Math.min(mazeDropdownScroll,MAZE_ALGOS.length-maxVis));
    const ddY=mzY+70, ddH=maxVis*itemH+4;
    ctx.fillStyle='#0d0d18'; ctx.fillRect(ddX,ddY,ddW,ddH);
    ctx.strokeStyle='rgba(0,200,160,0.4)'; ctx.lineWidth=1;
    ctx.strokeRect(ddX,ddY,ddW,ddH);
    for(let vi=0;vi<maxVis;vi++){
      const ai=vi+mazeDropdownScroll;
      if(ai>=MAZE_ALGOS.length) break;
      const algo=MAZE_ALGOS[ai];
      const iy=ddY+2+vi*itemH;
      ctx.fillStyle=mazeSelectedAlgo===algo?'#1a3a3a':'#111118';
      ctx.fillRect(ddX+2,iy,ddW-4,itemH-2);
      ctx.fillStyle=mazeSelectedAlgo===algo?'#00ffcc':'#aabbaa';
      ctx.font='10px "Courier New",monospace'; ctx.textAlign='center';
      ctx.fillText(algo,tbX+TB_W/2,iy+14);
    }
    // Scroll-Indikatoren
    if(mazeDropdownScroll>0){
      ctx.fillStyle='rgba(0,255,200,0.6)'; ctx.font='9px monospace'; ctx.textAlign='center';
      ctx.fillText('▲',tbX+TB_W/2,ddY+8);
    }
    if(mazeDropdownScroll+maxVis<MAZE_ALGOS.length){
      ctx.fillStyle='rgba(0,255,200,0.6)'; ctx.font='9px monospace'; ctx.textAlign='center';
      ctx.fillText('▼',tbX+TB_W/2,ddY+ddH-2);
    }
  }

  ctx.fillStyle='rgba(255,255,255,0.2)';
  ctx.font='10px monospace';
  ctx.textAlign='left';
  ctx.fillText('E: Editor beenden',tbX+10,canvas.height-10);
}

function edBtn(label,x,y,w,h){
  ctx.fillStyle='#1a1a2a'; ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='rgba(0,200,160,0.3)'; ctx.lineWidth=0.8; ctx.strokeRect(x,y,w,h);
  ctx.fillStyle='#99bbaa'; ctx.font='12px "Courier New",monospace';
  ctx.textAlign='center'; ctx.fillText(label,x+w/2,y+h/2+4);
}

function editorToolbarClick(sx, sy){
  const ry=sy-34;
  const ti=Math.floor(ry/40);
  if(ti>=0&&ti<ED_TOOLS.length){ edTool=ED_TOOLS[ti]; mazeDropdownOpen=false; return; }
  const btnY=34+ED_TOOLS.length*40+16;
  if(sy>=btnY&&sy<btnY+30)          { edSave(); mazeDropdownOpen=false; }
  else if(sy>=btnY+36&&sy<btnY+66)  { edLoad(); mazeDropdownOpen=false; }
  else if(sy>=btnY+72&&sy<btnY+102) { exitEditor(); mazeDropdownOpen=false; }
  else if(sy>=btnY+108&&sy<btnY+138){ edClear(); mazeDropdownOpen=false; }
  else if(sy>=btnY+144&&sy<btnY+172){
    // Maze-Dropdown-Button
    mazeDropdownOpen=!mazeDropdownOpen;
    return;
  } else if(sy>=btnY+180&&sy<btnY+207){
    // Slider (Label + Track)
    mazeSliderDragging=true;
    editorSliderMove(sx);
  } else if(mazeDropdownOpen&&sy>=btnY+214){
    // Dropdown-Einträge
    const itemH=22;
    const ddY=btnY+214;
    const vi=Math.floor((sy-ddY)/itemH);
    const ai=vi+mazeDropdownScroll;
    if(vi>=0&&vi<mazeDropdownVisibleCount&&ai>=0&&ai<MAZE_ALGOS.length){
      mazeSelectedAlgo=MAZE_ALGOS[ai];
      mazeDropdownOpen=false;
      generateAndPlaceMaze(mazeSelectedAlgo);
    }
  }
}

function editorSliderMove(sx){
  const tbX=canvas.width-TB_W;
  const slTrackX=tbX+12, slTrackW=TB_W-24;
  const t=Math.max(0,Math.min(1,(sx-slTrackX)/slTrackW));
  mazeDensity=Math.max(1,Math.min(10,Math.round(1+t*9)));
}

function editorPaintGrid(sx,sy){
  if(sx>=canvas.width-TB_W) return;
  const [gx,gy]=screenToGrid(sx,sy);
  if(gx>=0&&gy>=0&&gx<W&&gy<H) edTiles[gy][gx]=edTool;
}

function edSave(){
  const saveE=[], saveP=[], saveB=[], saveD=[], saveM=[];
  let saveStart={x:player.sx,y:player.sy};
  const baseTiles=edTiles.map((row,y)=>row.map((t,x)=>{
    if(t==='R'){ saveE.push({x,y,type:'fast'}); return 'fo'; }
    if(t==='r'){ saveE.push({x,y,type:'slow'}); return 'fo'; }
    if(t==='I'){ saveStart={x,y}; return 'fo'; }
    if(t==='pu'){ saveP.push({x,y}); return 'fo'; }
    if(t==='to'){ saveB.push({x,y}); return 'fo'; }
    if(t==='tü'){ saveD.push({x,y}); return 'fo'; }
    if(t==='ma'){ saveM.push({x,y}); return 'fo'; }
    return t;
  }));
  const out={
    meta:{name:P.NAME,width:W,height:H},
    params:{PLAYER_SPEED:P.SPEED,ENEMY_SPEED_FAST:P.EFAST,ENEMY_SPEED_MED:P.EMED,
            ENEMY_SPEED_SLOW:P.ESLOW,PLUTONIUM_TIMER:P.PTIMER,DOOR_CYCLE_TIME:P.DCYCLE,
            PLAYER_LIVES:P.LIVES,ZOOM:P.ZOOM,INVINCIBLE_TIME:P.INVTIME},
    tiles:baseTiles,
    enemies:saveE,
    plutonium:saveP,
    barrels:saveB,
    doors:saveD,
    mats:saveM,
    playerStart:saveStart
  };
  const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='level.json'; a.click();
}

function edLoad(){
  document.getElementById('file-input').click();
}

function edClear(){
  edTiles=Array.from({length:H},()=>Array(W).fill('ai'));
  for(let x=0;x<W;x++){ edTiles[0][x]='wa'; edTiles[H-1][x]='wa'; }
  for(let y=0;y<H;y++){ edTiles[y][0]='wa'; edTiles[y][W-1]='wa'; }
  for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++){ edTiles[y][x]='fo'; }
}

document.getElementById('file-input').addEventListener('change',ev=>{
  const f=ev.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=e2=>{
    try{ loadLevel(JSON.parse(e2.target.result)); initTuningPanel(); enterEditor(); }
    catch(err){ alert('JSON-Fehler: '+err.message); }
  };
  r.readAsText(f); ev.target.value='';
});

function generateAndPlaceMaze(algorithm){
  const mazeGrid=generateMaze(W,H,algorithm,mazeDensity);
  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      if(mazeGrid[y][x]===1){
        edTiles[y][x]='wa';
      }else if(mazeGrid[y][x]===0){
        if(edTiles[y][x]!=='I'&&edTiles[y][x]!=='R'&&edTiles[y][x]!=='r'&&edTiles[y][x]!=='pu'&&edTiles[y][x]!=='to'&&edTiles[y][x]!=='tü'&&edTiles[y][x]!=='ma'){
          edTiles[y][x]='fo';
        }
      }
    }
  }
}
