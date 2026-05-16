function revealFogAround(){
  const x0=Math.max(0, Math.floor((player.px+3)/TS));
  const x1=Math.min(W-1, Math.floor((player.px+TS-4)/TS));
  const y0=Math.max(0, Math.floor((player.py+3)/TS));
  const y1=Math.min(H-1, Math.floor((player.py+TS-4)/TS));
  let revealed=false;
  for(let ty=y0;ty<=y1;ty++) for(let tx=x0;tx<=x1;tx++){
    if(fogMap[ty][tx]){
      fogMap[ty][tx]=false;
      if(tiles[ty][tx]==='fo') tiles[ty][tx]='ai';
      revealed=true;
    }
  }
  if(revealed) SFX.fogStep();
}

function updatePlayer(dt){
  player.pulse += dt;
  if(invTimer>0) invTimer=Math.max(0,invTimer-dt);

  if(!player.moving){
    let dx=0,dy=0;
    if(keys['ArrowLeft']||keys['KeyA'])dx=-1;
    else if(keys['ArrowRight']||keys['KeyD'])dx=1;
    else if(keys['ArrowUp']||keys['KeyW'])dy=-1;
    else if(keys['ArrowDown']||keys['KeyS'])dy=1;
    if(dx||dy){
      const nx=player.gx+dx, ny=player.gy+dy;
      if(playerCanWalk(nx,ny)){
        player.prevGx=player.gx; player.prevGy=player.gy;
        player.tx=nx; player.ty=ny; player.moving=true;
      }
    }
  }

  if(player.moving){
    const tx=player.tx*TS, ty=player.ty*TS;
    const dx=tx-player.px, dy=ty-player.py;
    const dist=Math.sqrt(dx*dx+dy*dy);
    const step=P.SPEED*dt;
    if(dist<=step){
      player.px=tx; player.py=ty;
      player.gx=player.tx; player.gy=player.ty;
      player.moving=false;
      revealFogAround();
      onLand();
    } else {
      player.px+=dx/dist*step; player.py+=dy/dist*step;
      revealFogAround();
      checkDoorsContinuous();
      if(invTimer<=0) checkPlayerEnemyCollision();
    }
  }

  if(player.carryPus.length>0){
    player.puTimer=Math.max(0,player.puTimer-dt);
    const prog=1-player.puTimer/P.PTIMER;
    player.tickAcc+=dt;
    const rate=1+prog*prog*7;
    if(player.tickAcc>=1/rate){
      player.tickAcc=0; player.tickAlt=!player.tickAlt;
      SFX.clockTick(prog, player.tickAlt);
    }
    if(player.puTimer<=0) onPuExpired();
  }

  player.warnAcc+=dt;
  if(player.warnAcc>=1.5){
    player.warnAcc=0;
    let minD=Infinity;
    for(const e of enemies){
      const d=Math.abs(e.gx-player.gx)+Math.abs(e.gy-player.gy);
      if(d<minD) minD=d;
    }
    if(minD<=3) SFX.enemyClose(minD);
  }
}

function onLand(){
  const x=player.gx, y=player.gy;

  const pu=plutoniums.find(p=>!p.collected&&!p.carried&&p.x===x&&p.y===y);
  if(pu){
    pu.carried=true; player.carryPus.push(pu);
    player.puTimer=P.PTIMER; player.tickAcc=0; player.tickAlt=false;
    restoreTile(x,y); SFX.puPickup(player.carryPus.length);
  }

  if(player.carryPus.length>0){
    const b=barrels.find(b=>b.x===x&&b.y===y);
    if(b) deliverPu(b);
  }

  if(!player.carryMat){
    const m=mats.find(m=>m.active&&m.x===x&&m.y===y);
    if(m){ m.active=false; player.carryMat=true; restoreTile(x,y); SFX.matPick(); }
  }

  checkPlayerEnemyCollision();
}

function deliverPu(barrel){
  const cnt=player.carryPus.length;
  player.carryPus.forEach(p=>{ p.collected=true; p.carried=false; });
  player.carryPus=[]; player.puTimer=0; player.tickAcc=0; player.tickAlt=false;
  score+=100*cnt; puDelivered+=cnt;
  barrel.flash=0.6; SFX.puDeliver();
  if(puDelivered>=totalPu){ gameState='levelwin'; SFX.levelWin(); }
}

function onPuExpired(){
  player.carryPus.forEach(p=>{ p.carried=false; p.x=p.ox; p.y=p.oy; tiles[p.oy][p.ox]='pu'; });
  player.carryPus=[]; player.puTimer=0; player.tickAcc=0; player.tickAlt=false;
  loseLife();
}

function loseLife(){
  if(invTimer>0) return;
  lives--; SFX.lifeLost();
  if(player.carryMat) player.carryMat=false;
  if(player.carryPus.length>0){
    const cnt=player.carryPus.length;
    player.carryPus.forEach(p=>{ p.collected=true; p.carried=false; });
    player.carryPus=[]; player.puTimer=0; player.tickAcc=0; player.tickAlt=false;
    puDelivered+=cnt;
    if(puDelivered>=totalPu && lives>0){ gameState='levelwin'; SFX.levelWin(); return; }
  }
  if(lives<=0){ gameState='gameover'; SFX.gameOver(); return; }
  if(lives===1) SFX.lifeWarn();
  enemies.forEach(e=>{
    e.gx=e.ox; e.gy=e.oy; e.px=e.ox*TS; e.py=e.oy*TS;
    e.tx=e.ox; e.ty=e.oy; e.moving=false;
    const dir=DIRS4[Math.floor(Math.random()*4)];
    e.dx=dir[0]; e.dy=dir[1];
  });
  player.gx=player.sx; player.gy=player.sy;
  player.px=player.sx*TS; player.py=player.sy*TS;
  player.tx=player.sx; player.ty=player.sy; player.moving=false;
  invTimer=P.INVTIME;
  setTimeout(SFX.respawn, 80);
  setTimeout(SFX.shield, 220);
}

function checkPlayerEnemyCollision(){
  if(invTimer>0) return;
  for(const e of enemies){
    if(playerEnemyOverlap(e.px,e.py)){ loseLife(); return; }
  }
}

function playerEnemyOverlap(ex,ey){
  return player.px+3  < ex+TS-4 &&
         player.px+TS-3 > ex+4  &&
         player.py+3  < ey+TS-4 &&
         player.py+TS-3 > ey+4;
}

function playerDoorOverlap(d){
  const dtx=d.x*TS, dty=d.y*TS;
  return player.px+3  < dtx+TS &&
         player.px+TS-3 > dtx  &&
         player.py+3  < dty+TS &&
         player.py+TS-3 > dty;
}

function checkDoorsContinuous(){
  if(invTimer>0) return;
  for(const d of doors){
    if(!d.open && playerDoorOverlap(d)){ loseLife(); return; }
  }
}
