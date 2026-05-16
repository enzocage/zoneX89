function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]; } return a; }

function updateEnemies(dt){
  for(const e of enemies){
    if(!e.moving){
      let moved=false;
      if(enemyCanWalk(e.gx+e.dx,e.gy+e.dy,e.id)){
        e.tx=e.gx+e.dx; e.ty=e.gy+e.dy; e.moving=true; moved=true;
      }
      if(!moved){
        const dirs=shuffle([...DIRS4]);
        const fwd=[e.dx,e.dy], rev=[-e.dx,-e.dy];
        dirs.sort((a,b)=>{
          const ar=(a[0]===rev[0]&&a[1]===rev[1])?1:0;
          const br=(b[0]===rev[0]&&b[1]===rev[1])?1:0;
          return ar-br;
        });
        for(const [dx,dy] of dirs){
          if(enemyCanWalk(e.gx+dx,e.gy+dy,e.id)){
            e.dx=dx; e.dy=dy; e.tx=e.gx+dx; e.ty=e.gy+dy; e.moving=true; moved=true; break;
          }
        }
      }
    }

    if(e.moving){
      const tx=e.tx*TS, ty=e.ty*TS;
      const dx=tx-e.px, dy=ty-e.py;
      const dist=Math.sqrt(dx*dx+dy*dy);
      const step=e.speed*dt;
      if(dist<=step){
        e.px=tx; e.py=ty; e.gx=e.tx; e.gy=e.ty; e.moving=false;
        if(playerEnemyOverlap(e.px,e.py)) loseLife();
      } else {
        e.px+=dx/dist*step; e.py+=dy/dist*step;
        if(invTimer<=0 && playerEnemyOverlap(e.px,e.py)) loseLife();
      }
    }
  }
}
