window.addEventListener('keydown',e=>{
  keys[e.code]=true;

  if(e.code==='KeyH'){
    helpOpen=!helpOpen;
    if(helpOpen) helpScrollY=0;
    return;
  }

  if(helpOpen){
    if(e.code==='ArrowUp')   { helpScrollY=Math.max(0,helpScrollY-30); e.preventDefault(); }
    if(e.code==='ArrowDown') { helpScrollY+=30; e.preventDefault(); }
    return;
  }

  if(e.code==='KeyE'){
    if(!edMode) enterEditor(); else exitEditor();
    return;
  }

  if(e.code==='Space'){
    e.preventDefault();
    if(!edMode && player.carryMat){
      const tx=player.prevGx, ty=player.prevGy;
      const t=tiles[ty][tx];
      if(t!=='wa'&&t!=='to'&&t!=='tü'&&t!=='pu'){
        let m=mats.find(m2=>!m2.active);
        if(!m){ m={x:0,y:0,active:false}; mats.push(m); }
        m.x=tx; m.y=ty; m.active=true;
        tiles[ty][tx]='ma';
        player.carryMat=false;
        SFX.matDrop();
      }
    }
  }

  if(e.code==='KeyR' && (gameState==='gameover'||gameState==='levelwin')){
    loadLevel(LEVEL_DATA);
    initTuningPanel();
  }
});

window.addEventListener('keyup',e=>{ keys[e.code]=false; });

canvas.addEventListener('mousemove',e=>{
  if(!edMode) return;
  const [gx,gy]=screenToGrid(e.clientX,e.clientY);
  edHX=gx; edHY=gy;
  if(edDrag) editorPaintGrid(e.clientX,e.clientY);
});

canvas.addEventListener('mousedown',e=>{
  if(!edMode) return;
  edDrag=true;
  if(e.clientX>=canvas.width-TB_W){
    editorToolbarClick(e.clientY);
  } else {
    editorPaintGrid(e.clientX,e.clientY);
  }
});

canvas.addEventListener('mouseup',()=>{ edDrag=false; });
canvas.addEventListener('mouseleave',()=>{ edDrag=false; });
window.addEventListener('mouseup',()=>{ edDrag=false; });

canvas.addEventListener('wheel',e=>{
  if(helpOpen){ helpScrollY=Math.max(0,helpScrollY+e.deltaY*0.5); e.preventDefault(); }
},{passive:false});
