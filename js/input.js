window.addEventListener("keydown",e=>{
  keys[e.code]=true;

  const moveKeys=["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","KeyW","KeyA","KeyS","KeyD"];
  if(moveKeys.includes(e.code)) SFX.keyPress();

  if(e.code==="KeyH"){
    helpOpen=!helpOpen;
    if(helpOpen) helpScrollY=0;
    SFX.helpToggle();
    return;
  }

  if(helpOpen){
    if(e.code==="ArrowUp")   { helpScrollY=Math.max(0,helpScrollY-30); e.preventDefault(); }
    if(e.code==="ArrowDown") { helpScrollY+=30; e.preventDefault(); }
    return;
  }

  if(e.code==="KeyE"){
    if(helpOpen) return;
    if(!edMode){ enterEditor(); SFX.editorEnter(); }
    else { exitEditor(); SFX.editorExit(); }
    return;
  }

  if(e.code==="Space"){
    e.preventDefault();
    if(!edMode && player.carryMat){
      const tx=player.prevGx, ty=player.prevGy;
      const t=tiles[ty][tx];
      if(t!=="wa"&&t!=="to"&&t!=="t�"&&t!=="pu"){
        let m=mats.find(m2=>!m2.active);
        if(!m){ m={x:0,y:0,active:false}; mats.push(m); }
        m.x=tx; m.y=ty; m.active=true;
        tiles[ty][tx]="ma";
        player.carryMat=false;
        SFX.matDrop();
      }
    }
  }

  if(e.code==="KeyR" && (gameState==="gameover"||gameState==="levelwin")){
    loadLevel(LEVEL_DATA);
    initTuningPanel();
    SFX.restart();
  }
});

window.addEventListener("keyup",e=>{ keys[e.code]=false; });

canvas.addEventListener("mousemove",e=>{
  if(!edMode) return;
  const [gx,gy]=screenToGrid(e.clientX,e.clientY);
  edHX=gx; edHY=gy;
  if(edDrag){
    if(mazeSliderDragging) editorSliderMove(e.clientX);
    else editorPaintGrid(e.clientX,e.clientY);
  }
});

canvas.addEventListener("mousedown",e=>{
  if(!edMode) return;
  if(e.button===1){
    e.preventDefault();
    if(e.clientX<canvas.width-TB_W){
      const [gx,gy]=screenToGrid(e.clientX,e.clientY);
      if(gx>=0&&gy>=0&&gx<W&&gy<H) editorFloodFill(gx,gy);
    }
    return;
  }
  edDrag=true;
  if(e.clientX>=canvas.width-TB_W){
    editorToolbarClick(e.clientX,e.clientY);
  } else {
    mazeSliderDragging=false;
    editorPaintGrid(e.clientX,e.clientY);
  }
});

canvas.addEventListener("mouseup",()=>{ edDrag=false; mazeSliderDragging=false; });
canvas.addEventListener("auxclick",e=>{ if(e.button===1) e.preventDefault(); });
canvas.addEventListener("mouseleave",()=>{ edDrag=false; mazeSliderDragging=false; });
window.addEventListener("mouseup",()=>{ edDrag=false; mazeSliderDragging=false; });

canvas.addEventListener("wheel",e=>{
  if(helpOpen){ helpScrollY=Math.max(0,helpScrollY+e.deltaY*0.5); e.preventDefault(); return; }
  if(mazeDropdownOpen && e.clientX>=canvas.width-TB_W){
    mazeDropdownScroll=Math.max(0,Math.min(
      MAZE_ALGOS.length-mazeDropdownVisibleCount,
      mazeDropdownScroll+(e.deltaY>0?1:-1)
    ));
    e.preventDefault();
  }
},{passive:false});

