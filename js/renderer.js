function render(){
  ctx.fillStyle='#000';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  if(edMode){ renderEditor(); return; }

  updateLightSources();
  updatePostProcessing(1/60);

  ctx.save();
  
  const shake = getShakeOffset();
  ctx.translate(-camX + shake.x, -camY + shake.y);
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

  const lightCanvas = renderLighting();
  renderLightOverlay(lightCanvas);

  renderPostProcessing();

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

  if(door){
    if(!door.open){ col='#8822dd'; }
  }
  if(barrel&&barrel.flash>0){
    const f=barrel.flash/0.6;
    col=`hsl(200,${60+f*40}%,${30+f*50}%)`;
  }

  ctx.fillStyle=col;
  ctx.fillRect(px,py,TS,TS);

  ctx.strokeStyle='rgba(0,0,0,0.5)';
  ctx.lineWidth=1;
  ctx.strokeRect(px+0.5,py+0.5,TS-1,TS-1);
  
  ctx.fillStyle='rgba(255,255,255,0.04)';
  ctx.fillRect(px,py,TS,1);
  ctx.fillRect(px,py,1,TS);
  
  ctx.fillStyle='rgba(0,0,0,0.12)';
  ctx.fillRect(px,py+TS-1,TS,1);
  ctx.fillRect(px+TS-1,py,1,TS);

  if(door && door.open){
    ctx.save();ctx.globalAlpha=0.2;
    ctx.fillStyle='#8822dd';
    ctx.fillRect(px,py,TS,TS);
    ctx.restore();
  }

  const hasEntity = t==='pu'||t==='to'||t==='ma'||t==='tü';
  if(fogMap[y][x] && !hasEntity){
    const fogGrad = ctx.createRadialGradient(px+TS/2,py+TS/2,TS*0.3,px+TS/2,py+TS/2,TS*0.7);
    fogGrad.addColorStop(0,'rgba(14,28,42,0.75)');
    fogGrad.addColorStop(1,'rgba(14,28,42,0.95)');
    ctx.fillStyle=fogGrad;
    ctx.fillRect(px,py,TS,TS);

    ctx.fillStyle='rgba(40,80,120,0.12)';
    for(let i=0;i<3;i++){
      const fx=px+8+i*12;
      const fy=py+8+(i%2)*6;
      ctx.fillRect(fx,fy,8,1);
    }
  }

  if(t==='wa'){
    ctx.fillStyle='rgba(255,255,255,0.07)';
    ctx.fillRect(px+2,py+TS/2-1,TS-4,1);
    ctx.fillRect(px+TS/2,py+2,1,TS/2-3);
    ctx.fillRect(px+TS/4,py+TS/2+1,1,TS/2-3);
    ctx.fillRect(px+3*TS/4,py+TS/2+1,1,TS/2-3);
  }

  if(t==='pu'){
    const pulse=Math.sin(Date.now()*0.005)*0.5+0.5;
    ctx.save();
    ctx.shadowColor='#aaff00'; ctx.shadowBlur=10+pulse*15;
    const grad=ctx.createRadialGradient(px+TS/2,py+TS/2,2,px+TS/2,py+TS/2,TS/2);
    grad.addColorStop(0,'rgba(170,255,0,0.9)');
    grad.addColorStop(0.5,'rgba(170,255,0,0.4)');
    grad.addColorStop(1,'rgba(170,255,0,0)');
    ctx.fillStyle=grad;
    ctx.fillRect(px,py,TS,TS);
    ctx.fillStyle=`rgba(170,255,0,${0.3+pulse*0.3})`;
    const pad=5; roundRect(px+pad,py+pad,TS-pad*2,TS-pad*2,4);
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.save();ctx.translate(px+TS/2,py+TS/2);
    ctx.fillStyle='rgba(0,50,0,0.9)';
    for(let i=0;i<3;i++){
      ctx.save();ctx.rotate(i*Math.PI*2/3+Math.PI/6);
      ctx.beginPath();ctx.moveTo(0,0);
      ctx.arc(0,0,9,-Math.PI/3+0.18,0-0.18);
      ctx.closePath();ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle='rgba(170,255,0,0.95)';
    ctx.beginPath();ctx.arc(0,0,2.5,0,Math.PI*2);ctx.fill();
    ctx.restore();
    ctx.restore();
  }
  
  if(t==='to'){
    ctx.save();
    const grad=ctx.createRadialGradient(px+TS/2,py+TS/2,4,px+TS/2,py+TS/2,TS/2);
    grad.addColorStop(0,'rgba(51,119,238,0.6)');
    grad.addColorStop(1,'rgba(51,119,238,0)');
    ctx.fillStyle=grad;
    ctx.fillRect(px,py,TS,TS);
    ctx.strokeStyle='rgba(180,220,255,0.75)';ctx.lineWidth=1.5;
    ctx.strokeRect(px+9,py+6,TS-18,TS-12);
    ctx.beginPath();
    ctx.moveTo(px+9,py+12);ctx.lineTo(px+TS-9,py+12);
    ctx.moveTo(px+9,py+TS-12);ctx.lineTo(px+TS-9,py+TS-12);
    ctx.stroke();
    ctx.fillStyle='rgba(150,210,255,0.55)';
    ctx.fillRect(px+TS/2-1,py+7,2,TS-14);
    ctx.restore();
  }
  
  if(t==='ma'){
    ctx.save();
    ctx.beginPath();ctx.rect(px+4,py+4,TS-8,TS-8);ctx.clip();
    ctx.strokeStyle='rgba(187,153,85,0.55)';ctx.lineWidth=1.5;
    for(let i=-TS;i<TS*2;i+=6){
      ctx.beginPath();
      ctx.moveTo(px+4+i,py+4);ctx.lineTo(px+4+i+TS,py+TS-4);
      ctx.stroke();
    }
    ctx.strokeStyle='rgba(187,153,85,0.2)';
    for(let i=-TS;i<TS*2;i+=6){
      ctx.beginPath();
      ctx.moveTo(px+TS-4-i,py+4);ctx.lineTo(px-4-i,py+TS-4);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  if(t==='tü'){
    ctx.save();
    ctx.globalAlpha=door&&door.open?0.22:0.8;
    ctx.fillStyle='#cc88ff';
    ctx.fillRect(px+5,py+4,TS-10,2);
    const barX=[px+7,px+TS/2-1,px+TS-11];
    barX.forEach(bx=>{
      ctx.fillRect(bx,py+6,2,TS-11);
      ctx.fillRect(bx-1,py+TS-6,4,1);
      ctx.fillRect(bx,py+TS-5,2,2);
    });
    ctx.restore();
  }
  
}


function drawEnemy(e){
  const pad=4;
  const color = e.type==='fast'?'#ff2233':'#ff7700';
  const glow  = e.type==='fast'?'#ff0020':'#ff6600';
  const pulse = e.type==='fast' ? Math.sin(Date.now()*0.009)*0.5+0.5 : 0.3;

  ctx.save();
  
  ctx.shadowColor=glow; ctx.shadowBlur=6+pulse*10;
  ctx.fillStyle=color;
  
  const x=e.px+pad, y=e.py+pad, w=TS-pad*2, h=TS-pad*2;
  const radius = e.type==='fast' ? 3 : 5;

  ctx.beginPath();
  roundRect(x,y,w,h,radius);
  ctx.fill();

  ctx.fillStyle='rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(x+w/2-4, y+h/2-2, 4, 0, Math.PI*2);
  ctx.arc(x+w/2+4, y+h/2-2, 4, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle='rgba(0,0,0,0.6)';
  ctx.beginPath();
  ctx.arc(x+w/2-4, y+h/2-2, 2, 0, Math.PI*2);
  ctx.arc(x+w/2+4, y+h/2-2, 2, 0, Math.PI*2);
  ctx.fill();

  if(e.type==='fast'){
    ctx.strokeStyle='rgba(20,0,0,0.9)';
    ctx.lineWidth=2;
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(x+w/2-8,y+h/2-7);ctx.lineTo(x+w/2-1,y+h/2-5);
    ctx.moveTo(x+w/2+1,y+h/2-5);ctx.lineTo(x+w/2+8,y+h/2-7);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPlayer(){
  if(invTimer>0&&Math.floor(invTimer*12)%2===0) return;
  const pad=3;
  const p=Math.sin(player.pulse*5)*0.5+0.5;

  ctx.save();
  
  if(invTimer>0){
    ctx.shadowColor='#00ffff'; ctx.shadowBlur=15+p*10;
    const shieldGrad=ctx.createRadialGradient(player.px+TS/2,player.py+TS/2,TS/3,player.px+TS/2,player.py+TS/2,TS);
    shieldGrad.addColorStop(0,'rgba(0,255,255,0.2)');
    shieldGrad.addColorStop(1,'rgba(0,255,255,0)');
    ctx.fillStyle=shieldGrad;
    ctx.beginPath();
    ctx.arc(player.px+TS/2,player.py+TS/2,TS,0,Math.PI*2);
    ctx.fill();
  } else {
    ctx.shadowColor='#00ffcc'; ctx.shadowBlur=10+p*12;
  }
  
  const grad=ctx.createLinearGradient(player.px,player.py,player.px+TS,player.py+TS);
  grad.addColorStop(0,'#00ffdd');
  grad.addColorStop(1,'#00ccaa');
  ctx.fillStyle=grad;
  
  const x=player.px+pad, y=player.py+pad, w=TS-pad*2, h=TS-pad*2;
  roundRect(x,y,w,h,6); ctx.fill();
  
  ctx.fillStyle='rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(x+w/2-4, y+h/2-3, 3, 0, Math.PI*2);
  ctx.arc(x+w/2+4, y+h/2-3, 3, 0, Math.PI*2);
  ctx.fill();
  
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.arc(x+w/2-4, y+h/2-3, 1.5, 0, Math.PI*2);
  ctx.arc(x+w/2+4, y+h/2-3, 1.5, 0, Math.PI*2);
  ctx.fill();
  
  ctx.fillStyle='rgba(0,255,200,0.4)';
  ctx.beginPath();
  ctx.arc(x+w/2, y+3, 2, 0, Math.PI*2);
  ctx.fill();
  
  ctx.restore();

  const n=player.carryPus.length;
  if(n>0){
    ctx.save();
    ctx.shadowColor='#aaff00'; ctx.shadowBlur=8;
    for(let i=0;i<n;i++){
      const orbit = Date.now()*0.005 + i * Math.PI;
      const ox = player.px+TS/2 + Math.cos(orbit) * (TS/2 - 6);
      const oy = player.py+TS/2 + Math.sin(orbit) * (TS/2 - 6);
      ctx.fillStyle='#aaff00';
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, Math.PI*2);
      ctx.fill();
      
      ctx.fillStyle='rgba(170,255,0,0.3)';
      ctx.beginPath();
      ctx.arc(ox, oy, 7, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }
  if(player.carryMat){
    ctx.save();
    ctx.shadowColor='#bb9955'; ctx.shadowBlur=6;
    ctx.fillStyle='#bb9955';
    ctx.beginPath(); ctx.arc(player.px+TS/2+8, player.py+TS/2-8, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(187,153,85,0.3)';
    ctx.beginPath(); ctx.arc(player.px+TS/2+8, player.py+TS/2-8, 8, 0, Math.PI*2); ctx.fill();
    ctx.restore();
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
      const tex=makeEntityCanvas(item.lbl,TS2);
      ctx.drawImage(tex,tx,ty2,TS2,TS2);
      ctx.strokeStyle='rgba(0,0,0,0.5)'; ctx.lineWidth=0.5;
      ctx.strokeRect(tx,ty2,TS2,TS2);
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
  
  ctx.shadowColor='#ff3355'; ctx.shadowBlur=4;
  ctx.font='bold 24px sans-serif';
  for(let i=0;i<P.LIVES;i++){
    const heartGrad = ctx.createLinearGradient(14+i*30,20,14+i*30,48);
    if(i<lives){
      heartGrad.addColorStop(0,'#ff5566');
      heartGrad.addColorStop(1,'#ff2233');
    } else {
      heartGrad.addColorStop(0,'#3a1a20');
      heartGrad.addColorStop(1,'#2a0a10');
    }
    ctx.fillStyle=heartGrad;
    ctx.fillText('♥',14+i*30,38);
  }
  ctx.shadowBlur=0;
  
  ctx.font='bold 14px "Courier New",monospace';
  ctx.fillStyle='#aaff00';
  ctx.shadowColor='#aaff00'; ctx.shadowBlur=3;
  ctx.fillText(`SCORE: ${score}`,14,62);
  ctx.shadowBlur=0;
  
  ctx.fillStyle='#4488ff';
  ctx.shadowColor='#4488ff'; ctx.shadowBlur=3;
  ctx.fillText(`PU: ${puDelivered}/${totalPu}`,14,82);
  ctx.shadowBlur=0;

  if(player.carryPus.length>0){
    const n=player.carryPus.length;
    const t=player.puTimer, pct=t/P.PTIMER;
    const blink=t<5&&Math.floor(Date.now()/150)%2===0;
    const timerCol=blink?'#ff0000':t<8?'#ff6600':'#aaff00';
    ctx.fillStyle=timerCol;
    ctx.shadowColor=timerCol; ctx.shadowBlur=4;
    ctx.font='bold 16px "Courier New",monospace';
    ctx.fillText(`⚛ ${n>1?'×'+n+' ':' '}${t.toFixed(1)}s`,14,106);
    ctx.shadowBlur=0;
    
    const bw=150;
    ctx.fillStyle='#0a1a0a';
    ctx.fillRect(14,113,bw,9);
    ctx.strokeStyle='rgba(0,255,100,0.3)';
    ctx.lineWidth=1;
    ctx.strokeRect(14,113,bw,9);
    
    const barGrad = ctx.createLinearGradient(14,113,14+bw*pct,113);
    if(pct>0.5){
      barGrad.addColorStop(0,'#00cc55');
      barGrad.addColorStop(1,'#00ee66');
    } else if(pct>0.25){
      barGrad.addColorStop(0,'#ff8800');
      barGrad.addColorStop(1,'#ffaa00');
    } else {
      barGrad.addColorStop(0,'#ff2200');
      barGrad.addColorStop(1,'#ff4400');
    }
    ctx.fillStyle=barGrad;
    ctx.fillRect(14,113,bw*pct,9);
    
    if(pct<0.3 && Math.floor(Date.now()/100)%2===0){
      ctx.fillStyle='rgba(255,50,0,0.2)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }
  }

  if(player.carryMat){
    ctx.fillStyle='#bb9955';
    ctx.shadowColor='#bb9955'; ctx.shadowBlur=4;
    ctx.font='bold 14px "Courier New",monospace';
    const y=player.carryPus.length>0?132:106;
    ctx.fillText('■ MATERIAL',14,y);
    ctx.shadowBlur=0;
  }

  if(invTimer>0){
    const shieldAlpha = 0.4+Math.sin(Date.now()*0.02)*0.3;
    ctx.fillStyle=`rgba(0,255,200,${shieldAlpha})`;
    ctx.shadowColor='#00ffcc'; ctx.shadowBlur=6;
    ctx.font='bold 12px "Courier New",monospace';
    const iy=(player.carryPus.length>0?(player.carryMat?149:132):player.carryMat?125:106);
    ctx.fillText('★ SCHUTZ',14,iy);
    ctx.shadowBlur=0;
  }

  ctx.fillStyle='rgba(255,255,255,0.3)';
  ctx.font='10px "Courier New",monospace';
  ctx.textAlign='left';
  ctx.fillText('WASD/↑↓←→  ·  SPACE: Mat ablegen  ·  E: Editor  ·  H: Hilfe',14,canvas.height-8);

  ctx.restore();
}

function overlay(title,sub,col){
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,0.85)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  
  const grad = ctx.createRadialGradient(canvas.width/2,canvas.height/2,50,canvas.width/2,canvas.height/2,300);
  grad.addColorStop(0,'rgba(0,0,0,0.6)');
  grad.addColorStop(1,'rgba(0,0,0,0.95)');
  ctx.fillStyle=grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  
  ctx.fillStyle=col;
  ctx.shadowColor=col; ctx.shadowBlur=20;
  ctx.font='bold 52px "Courier New",monospace';
  ctx.textAlign='center';
  ctx.fillText(title,canvas.width/2,canvas.height/2-20);
  ctx.shadowBlur=0;
  
  ctx.fillStyle='rgba(200,200,200,0.8)';
  ctx.font='20px "Courier New",monospace';
  ctx.fillText(sub,canvas.width/2,canvas.height/2+25);
  
  ctx.fillStyle='rgba(100,100,100,0.6)';
  ctx.font='15px "Courier New",monospace';
  ctx.fillText('[R] Startmenü',canvas.width/2,canvas.height/2+65);
  ctx.restore();
}

function drawGameOver(){ overlay('GAME OVER','Score: '+score,'#ff2244'); }
function drawLevelWin(){
  overlay('LEVEL COMPLETE!','Score: '+score+' — Alle '+totalPu+' Plutonium abgeliefert','#aaff00');
}
