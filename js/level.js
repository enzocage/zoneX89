function loadLevel(data){
  P = {
    SPEED:    data.params.PLAYER_SPEED || 160,
    EFAST:    data.params.ENEMY_SPEED_FAST || 110,
    EMED:     data.params.ENEMY_SPEED_MED || 66,
    ESLOW:    data.params.ENEMY_SPEED_SLOW || 42,
    PTIMER:   data.params.PLUTONIUM_TIMER || 35,
    DCYCLE:   data.params.DOOR_CYCLE_TIME || 2,
    LIVES:    data.params.PLAYER_LIVES || 3,
    ZOOM:     data.params.ZOOM || 5,
    INVTIME:  data.params.INVINCIBLE_TIME || 2,
    NAME:     data.meta.name || 'ZONE X',
  };
  P.FOG_PCT = 20;
  P.ZOOM    = fogPctToZoom(20);
  W = data.meta.width; H = data.meta.height;

  tiles = data.tiles.map(r=>[...r]);
  fogMap = tiles.map(r=>r.map(t=>t==='fo'));

  plutoniums = data.plutonium.map((p,i)=>({id:i,x:p.x,y:p.y,ox:p.x,oy:p.y,collected:false,carried:false}));
  plutoniums.forEach(p=>{ if(!p.collected) tiles[p.y][p.x]='pu'; });

  barrels = data.barrels.map(b=>({x:b.x,y:b.y,flash:0}));
  barrels.forEach(b=>{ tiles[b.y][b.x]='to'; });

  doors = data.doors.map(d=>({x:d.x,y:d.y,open:false,t:0}));
  doors.forEach(d=>{ tiles[d.y][d.x]='tü'; });

  mats = data.mats.map(m=>({x:m.x,y:m.y,active:true}));
  mats.forEach(m=>{ if(m.active) tiles[m.y][m.x]='ma'; });

  enemies = data.enemies.map((e,i)=>{
    const spd = e.type==='fast'?P.EFAST:e.type==='med'?P.EMED:P.ESLOW;
    const dir = DIRS4[Math.floor(Math.random()*4)];
    return {id:i, ox:e.x, oy:e.y,
            gx:e.x, gy:e.y, px:e.x*TS, py:e.y*TS, tx:e.x, ty:e.y,
            dx:dir[0], dy:dir[1], moving:false, speed:spd, type:e.type};
  });

  const ps = data.playerStart;
  player = {
    gx:ps.x, gy:ps.y, px:ps.x*TS, py:ps.y*TS,
    tx:ps.x, ty:ps.y, moving:false,
    sx:ps.x, sy:ps.y,
    carryMat:false, carryPus:[],
    puTimer:0, tickAcc:0, tickAlt:false, pulse:0,
    warnAcc:0,
    prevGx:ps.x, prevGy:ps.y,
  };

  lives = P.LIVES;
  score = 0;
  invTimer = 0;
  puDelivered = 0;
  totalPu = plutoniums.length;
  gameState = 'playing';
  camX = ps.x*TS*P.ZOOM - canvas.width/2;
  camY = ps.y*TS*P.ZOOM - canvas.height/2;
}

function playerCanWalk(x,y){
  if(x<0||y<0||x>=W||y>=H) return false;
  const t=tiles[y][x];
  if(t==='wa') return false;
  return true;
}

function enemyCanWalk(x,y,eid){
  if(x<0||y<0||x>=W||y>=H) return false;
  if(tiles[y][x]==='wa') return false;
  if(fogMap[y][x]) return false;
  if(tiles[y][x]==='tü') return false;
  if(tiles[y][x]==='pu') return false;
  if(tiles[y][x]==='to') return false;
  if(tiles[y][x]==='ma') return false;
  if(enemies.some(e=>e.id!==eid&&e.gx===x&&e.gy===y)) return false;
  return true;
}

function restoreTile(x,y){
  tiles[y][x] = fogMap[y][x] ? 'fo' : 'ai';
}
