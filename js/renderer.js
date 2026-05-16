function render(){
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  if(edMode){ renderEditor(); return; }

  ctx.save();
  ctx.translate(-camX,-camY);
  ctx.scale(P.ZOOM,P.ZOOM);

  const x0=Math.max(0,Math.floor(camX/P.ZOOM/TS)-1);
  const y0=Math.max(0,Math.floor(camY/P.ZOOM/TS)-1);
  const x1=Math.min(W-1,Math.ceil((camX/P.ZOOM+canvas.width/P.ZOOM)/TS)+1);
  const y1=Math.min(H-1,Math.ceil((camY/P.ZOOM+canvas.height/P.ZOOM)/TS)+1);

  for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) drawTile(x,y);

  for(const e of enemies){
    if(e.px/TS<x0-1||e.px/TS>x1+1||e.py/TS<y0-1||e.py/TS>y1+1) continue;
    drawEnemy(e);
  }

  drawPlayer();

  ctx.restore();

  drawHUD();

  if(gameState==='gameover') drawGameOver();
  if(gameState==='levelwin') drawLevelWin();
  if(helpOpen) drawHelp();
}

function drawTile(x,y){
  const px=x*TS, py=y*TS;
  const t=tiles[y][x];
  const door=doors.find(d=>d.x===x&&d.y===y);
  const barrel=barrels.find(b=>b.x===x&&b.y===y);

  let col=COLORS[t]||'#080d12';
  let label=TILE_LABELS[t]||'';

  if(door){
    col=door.open?'#4a1188':'#8822dd';
    label=door.open?'  ':'tü';
  }
  if(barrel&&barrel.flash>0){
    const f=barrel.flash/0.6;
    col=`hsl(200,${60+f*40}%,${30+f*50}%)`;
  }

  ctx.fillStyle=col;
  ctx.fillRect(px,py,TS,TS);

  ctx.strokeStyle='rgba(0,0,0,0.4)';
  ctx.lineWidth=0.4;
  ctx.strokeRect(px,py,TS,TS);

  if(fogMap[y][x]){
    ctx.fillStyle='rgba(14,28,42,0.9)';
    ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle='rgba(40,80,120,0.18)';
    ctx.fillText && null;
  }

  if(label){
    let lc;
    if(fogMap[y][x])       lc='rgba(60,110,160,0.35)';
    else if(t==='pu')      lc='rgba(0,40,0,0.88)';
    else if(t==='to')      lc='rgba(220,240,255,0.75)';
    else if(t==='tü')      lc='rgba(230,180,255,0.7)';
    else if(t==='ma')      lc='rgba(60,30,0,0.8)';
    else                   lc='rgba(255,255,255,0.22)';
    ctx.fillStyle=lc;
    ctx.font=`${Math.floor(TS*0.37)}px 'Courier New',monospace`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(label,px+TS/2,py+TS/2);
  }

  if(t==='pu'&&!fogMap[y][x]){
    const pulse=Math.sin(Date.now()*0.005)*0.5+0.5;
    ctx.save();
    ctx.shadowColor='#aaff00'; ctx.shadowBlur=6+pulse*10;
    ctx.fillStyle=`rgba(170,255,0,${0.25+pulse*0.2})`;
    const pad=6; roundRect(px+pad,py+pad,TS-pad*2,TS-pad*2,3);
    ctx.fill(); ctx.restore();
  }
}

function drawEnemy(e){
  const pad=4;
  const color = e.type==='fast'?'#ff2233':'#ff7700';
  const glow  = e.type==='fast'?'#ff0020':'#ff6600';

  ctx.save();
  if(e.type==='fast'){
    const p=Math.sin(Date.now()*0.009)*0.5+0.5;
    ctx.shadowColor=glow; ctx.shadowBlur=3+p*8;
  } else {
    ctx.shadowColor=glow; ctx.shadowBlur=3;
  }
  ctx.fillStyle=color;
  ctx.beginPath(); roundRect(e.px+pad,e.py+pad,TS-pad*2,TS-pad*2,4); ctx.fill();
  ctx.restore();

  ctx.fillStyle='rgba(0,0,0,0.55)';
  ctx.font=`bold ${Math.floor(TS*0.37)}px 'Courier New',monospace`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(e.type==='fast'?'R':'r',e.px+TS/2,e.py+TS/2);
}

function drawPlayer(){
  if(invTimer>0&&Math.floor(invTimer*12)%2===0) return;
  const pad=3;
  const p=Math.sin(player.pulse*5)*0.5+0.5;

  ctx.save();
  ctx.shadowColor='#00ffcc'; ctx.shadowBlur=8+p*14;
  ctx.fillStyle='#00ffcc';
  ctx.beginPath(); roundRect(player.px+pad,player.py+pad,TS-pad*2,TS-pad*2,5); ctx.fill();
  ctx.restore();

  ctx.fillStyle='rgba(0,20,16,0.6)';
  ctx.font=`bold ${Math.floor(TS*0.37)}px 'Courier New',monospace`;
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('pl',player.px+TS/2,player.py+TS/2);

  const n=player.carryPus.length;
  if(n>0){
    ctx.save();
    ctx.shadowColor='#aaff00'; ctx.shadowBlur=6;
    ctx.fillStyle='#aaff00';
    for(let i=0;i<n;i++){
      ctx.beginPath();
      ctx.arc(player.px+TS-5-i*9, player.py+5, 3.5, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }
  if(player.carryMat){
    ctx.fillStyle='#bb9955';
    ctx.beginPath(); ctx.arc(player.px+6,player.py+5,3.5,0,Math.PI*2); ctx.fill();
  }
}

function roundRect(x,y,w,h,r){
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

function drawHelp(){
  ctx.save();
  const CW=canvas.width, CH=canvas.height;
  ctx.fillStyle='rgba(2,5,14,0.95)';
  ctx.fillRect(0,0,CW,CH);

  const mx=Math.max(30,Math.min(80,(CW-700)/2));
  const px=mx, py=28, pw=CW-mx*2, ph=CH-56;

  ctx.strokeStyle='rgba(0,255,200,0.28)';
  ctx.lineWidth=1;
  ctx.strokeRect(px,py,pw,ph);

  ctx.fillStyle='rgba(2,5,14,0.98)';
  ctx.fillRect(px+1,py+1,pw-2,52);
  ctx.fillStyle='#00ffcc';
  ctx.font='bold 22px "Courier New",monospace';
  ctx.textAlign='center';
  ctx.fillText('ZONE X — HILFE',CW/2,py+26);
  ctx.fillStyle='rgba(255,255,255,0.28)';
  ctx.font='12px "Courier New",monospace';
  ctx.fillText('[H] schließen  ·  ↑↓ / Mausrad scrollen',CW/2,py+46);

  ctx.strokeStyle='rgba(0,255,200,0.15)';
  ctx.lineWidth=0.8;
  ctx.beginPath(); ctx.moveTo(px+10,py+52); ctx.lineTo(px+pw-10,py+52); ctx.stroke();

  const contentTop=py+54, contentH=ph-54;
  ctx.save();
  ctx.beginPath(); ctx.rect(px+1,contentTop,pw-2,contentH); ctx.clip();

  let cy=contentTop+18-helpScrollY;
  const lx=px+20, rw=pw-40;
  const TS2=28;

  let totalContentH=0;

  HELP_CONTENT.forEach(item=>{
    if(item.t==='gap'){ cy+=20; totalContentH+=20; return; }

    if(item.t==='head'){
      cy+=8;
      ctx.fillStyle='#00ffcc'; ctx.font='bold 16px "Courier New",monospace';
      ctx.textAlign='left';
      ctx.fillText('── '+item.text+' ──', lx, cy);
      cy+=26; totalContentH+=34; return;
    }

    if(item.t==='ctrl'){
      ctx.fillStyle='rgba(0,255,200,0.7)'; ctx.font='bold 13px "Courier New",monospace';
      ctx.textAlign='left';
      const kw=148;
      ctx.fillText(item.key, lx+4, cy);
      ctx.fillStyle='rgba(210,225,235,0.8)'; ctx.font='13px "Courier New",monospace';
      ctx.fillText(item.desc, lx+kw, cy);
      cy+=22; totalContentH+=22; return;
    }

    if(item.t==='tile'){
      const tx=lx, ty2=cy-TS2+5;
      ctx.fillStyle=item.col;
      ctx.fillRect(tx,ty2,TS2,TS2);
      ctx.strokeStyle='rgba(0,0,0,0.5)'; ctx.lineWidth=0.5;
      ctx.strokeRect(tx,ty2,TS2,TS2);
      const labelCol = item.col==='#aaff00'?'rgba(0,40,0,0.9)':
                       item.col==='#00ffcc'?'rgba(0,30,20,0.7)':
                       'rgba(255,255,255,0.65)';
      ctx.fillStyle=labelCol; ctx.font=`bold 10px 'Courier New',monospace`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(item.lbl, tx+TS2/2, ty2+TS2/2);
      ctx.textBaseline='alphabetic';
      ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font='bold 13px "Courier New",monospace';
      ctx.textAlign='left';
      ctx.fillText(item.name, lx+TS2+10, cy);
      ctx.fillStyle='rgba(160,185,205,0.75)'; ctx.font='12px "Courier New",monospace';
      const descX=lx+TS2+10+Math.max(80,ctx.measureText(item.name).width+10);
      ctx.fillText(item.desc, descX, cy);
      cy+=28; totalContentH+=28; return;
    }

    if(item.t==='rule'){
      ctx.fillStyle='rgba(0,255,200,0.45)'; ctx.font='12px "Courier New",monospace';
      ctx.textAlign='left';
      ctx.fillText('▸', lx+4, cy);
      ctx.fillStyle='rgba(185,205,220,0.8)'; ctx.font='12px "Courier New",monospace';
      ctx.fillText(item.text, lx+20, cy);
      cy+=20; totalContentH+=20; return;
    }
  });

  const maxScroll=Math.max(0,totalContentH-(contentH-20));
  helpScrollY=Math.max(0,Math.min(helpScrollY,maxScroll));

  ctx.restore();

  if(totalContentH>contentH){
    const trackH=contentH-8;
    const thumbH=Math.max(30,trackH*(contentH/totalContentH));
    const thumbY=contentTop+4+(trackH-thumbH)*(helpScrollY/Math.max(1,totalContentH-contentH));
    ctx.fillStyle='rgba(0,255,200,0.12)';
    ctx.fillRect(px+pw-10,contentTop+4,6,trackH);
    ctx.fillStyle='rgba(0,255,200,0.45)';
    ctx.fillRect(px+pw-10,thumbY,6,thumbH);
  }
  ctx.restore();
}

function drawHUD(){
  ctx.save();
  ctx.font='bold 22px sans-serif';
  for(let i=0;i<P.LIVES;i++){
    ctx.fillStyle=i<lives?'#ff3355':'#2a0a10';
    ctx.fillText('♥',14+i*28,36);
  }
  ctx.font='13px "Courier New",monospace';
  ctx.fillStyle='#aaff00';
  ctx.fillText(`SCORE: ${score}`,14,58);
  ctx.fillStyle='#4488ff';
  ctx.fillText(`PU: ${puDelivered}/${totalPu}`,14,75);

  if(player.carryPus.length>0){
    const n=player.carryPus.length;
    const t=player.puTimer, pct=t/P.PTIMER;
    const blink=t<5&&Math.floor(Date.now()/200)%2===0;
    ctx.fillStyle=blink?'#ff0000':t<8?'#ff6600':'#aaff00';
    ctx.font='bold 15px "Courier New",monospace';
    ctx.fillText(`⚛${n>1?'×'+n+' ':' '}${t.toFixed(1)}s`,14,96);
    const bw=140;
    ctx.fillStyle='#0a1a0a'; ctx.fillRect(14,103,bw,7);
    ctx.fillStyle=pct>0.5?'#00ee66':pct>0.25?'#ffaa00':'#ff2200';
    ctx.fillRect(14,103,bw*pct,7);
  }

  if(player.carryMat){
    ctx.fillStyle='#bb9955';
    ctx.font='bold 13px "Courier New",monospace';
    const y=player.carryPus.length>0?120:96;
    ctx.fillText('■ MAT',14,y);
  }

  if(invTimer>0){
    ctx.fillStyle=`rgba(0,255,200,${0.4+Math.sin(Date.now()*0.02)*0.3})`;
    ctx.font='11px monospace';
    const iy=(player.carryPus.length>0?(player.carryMat?137:120):player.carryMat?113:98);
    ctx.fillText('★ SCHUTZ',14,iy);
  }

  ctx.fillStyle='rgba(255,255,255,0.22)';
  ctx.font='11px "Courier New",monospace';
  ctx.textAlign='left';
  ctx.fillText('WASD/↑↓←→  ·  SPACE: Mat ablegen  ·  E: Editor  ·  H: Hilfe',14,canvas.height-10);

  ctx.restore();
}

function overlay(title,sub,col){
  ctx.fillStyle='rgba(0,0,0,0.78)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle=col;
  ctx.font='bold 48px "Courier New",monospace';
  ctx.textAlign='center';
  ctx.fillText(title,canvas.width/2,canvas.height/2-30);
  ctx.fillStyle='#888';
  ctx.font='18px "Courier New",monospace';
  ctx.fillText(sub,canvas.width/2,canvas.height/2+20);
  ctx.fillStyle='#555';
  ctx.font='14px "Courier New",monospace';
  ctx.fillText('[R] Neustart',canvas.width/2,canvas.height/2+55);
}

function drawGameOver(){ overlay('GAME OVER','Score: '+score,'#ff2244'); }
function drawLevelWin(){ overlay('LEVEL COMPLETE!','Score: '+score+' — Alle '+totalPu+' Plutonium abgeliefert','#aaff00'); }
