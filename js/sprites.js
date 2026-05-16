const tileCache = new Map();
const TILE_SIZE = 32;

function getTileKey(type, variant = 0){
  return `${type}_${variant}`;
}

function createTileTexture(type, variant = 0){
  const c = document.createElement('canvas');
  c.width = TILE_SIZE;
  c.height = TILE_SIZE;
  const ctx = c.getContext('2d');
  
  const baseColor = COLORS[type] || '#080d12';
  
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(0, TILE_SIZE - 2, TILE_SIZE, 2);
  ctx.fillRect(TILE_SIZE - 2, 0, 2, TILE_SIZE);
  
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(0, 0, TILE_SIZE, 1);
  ctx.fillRect(0, 0, 1, TILE_SIZE);
  
  if(type === 'wa'){
    ctx.fillStyle = 'rgba(30,35,40,0.5)';
    for(let i = 0; i < 8; i++){
      const rx = Math.random() * TILE_SIZE;
      const ry = Math.random() * TILE_SIZE;
      const rw = 2 + Math.random() * 4;
      const rh = 1 + Math.random() * 2;
      ctx.fillRect(rx, ry, rw, rh);
    }
    
    ctx.strokeStyle = 'rgba(50,60,70,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
  }
  
  if(type === 'ai' || type === 'fo'){
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    for(let i = 0; i < 20; i++){
      const px = Math.random() * TILE_SIZE;
      const py = Math.random() * TILE_SIZE;
      ctx.fillRect(px, py, 1, 1);
    }
    
    if(variant % 3 === 0){
      ctx.fillStyle = 'rgba(40,50,60,0.3)';
      ctx.fillRect(8, 8, 4, TILE_SIZE - 16);
      ctx.fillRect(TILE_SIZE - 12, 8, 4, TILE_SIZE - 16);
    } else if(variant % 3 === 1){
      ctx.fillStyle = 'rgba(40,50,60,0.3)';
      ctx.fillRect(8, 8, TILE_SIZE - 16, 4);
      ctx.fillRect(8, TILE_SIZE - 12, TILE_SIZE - 16, 4);
    }
  }
  
  if(type === 'pu'){
    const gradient = ctx.createRadialGradient(
      TILE_SIZE/2, TILE_SIZE/2, 2,
      TILE_SIZE/2, TILE_SIZE/2, TILE_SIZE/2
    );
    gradient.addColorStop(0, 'rgba(170,255,0,0.4)');
    gradient.addColorStop(1, 'rgba(170,255,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  }
  
  if(type === 'to'){
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(TILE_SIZE/2, TILE_SIZE/2, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(100,150,255,0.4)';
    ctx.beginPath();
    ctx.arc(TILE_SIZE/2, TILE_SIZE/2, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  
  if(type === 'tü'){
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(6, 2, TILE_SIZE - 12, TILE_SIZE - 4);
    
    ctx.fillStyle = 'rgba(150,100,255,0.3)';
    for(let i = 0; i < 3; i++){
      ctx.fillRect(8, 6 + i * 8, TILE_SIZE - 16, 4);
    }
    
    ctx.fillStyle = 'rgba(200,150,255,0.6)';
    ctx.beginPath();
    ctx.arc(TILE_SIZE - 10, TILE_SIZE/2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  if(type === 'ma'){
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
    
    ctx.fillStyle = 'rgba(200,180,100,0.5)';
    ctx.beginPath();
    ctx.moveTo(TILE_SIZE/2, 6);
    ctx.lineTo(TILE_SIZE - 6, TILE_SIZE/2);
    ctx.lineTo(TILE_SIZE/2, TILE_SIZE - 6);
    ctx.lineTo(6, TILE_SIZE/2);
    ctx.closePath();
    ctx.fill();
  }
  
  return c;
}

function getTileTexture(type, variant = 0){
  const key = getTileKey(type, variant);
  if(!tileCache.has(key)){
    tileCache.set(key, createTileTexture(type, variant));
  }
  return tileCache.get(key);
}

function clearTileCache(){
  tileCache.clear();
}

function renderTile(ctx, x, y, type, variant = 0){
  const texture = getTileTexture(type, variant);
  const px = x * TS;
  const py = y * TS;
  ctx.drawImage(texture, px, py);
}
