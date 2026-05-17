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

const entityCanvasCache = new Map();

function makeEntityCanvas(lbl, size){
  const key = `${lbl}_${size}`;
  if(entityCanvasCache.has(key)) return entityCanvasCache.get(key);

  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const x = c.getContext('2d');

  if(lbl === 'pl'){
    const pad = Math.max(2, Math.floor(size * 0.1));
    x.save();
    x.shadowColor='#00ffcc'; x.shadowBlur=size*0.2;
    const grad = x.createLinearGradient(0,0,size,size);
    grad.addColorStop(0,'#00ffdd'); grad.addColorStop(1,'#00ccaa');
    x.fillStyle=grad;
    const bx=pad,by=pad,bw=size-pad*2,bh=size-pad*2,r=Math.max(2,Math.floor(size*0.15));
    x.beginPath();
    x.moveTo(bx+r,by);x.lineTo(bx+bw-r,by);x.quadraticCurveTo(bx+bw,by,bx+bw,by+r);
    x.lineTo(bx+bw,by+bh-r);x.quadraticCurveTo(bx+bw,by+bh,bx+bw-r,by+bh);
    x.lineTo(bx+r,by+bh);x.quadraticCurveTo(bx,by+bh,bx,by+bh-r);
    x.lineTo(bx,by+r);x.quadraticCurveTo(bx,by,bx+r,by);x.closePath();
    x.fill();
    x.fillStyle='rgba(255,255,255,0.5)';
    x.beginPath();
    x.arc(bx+bw/2-size*0.12,by+bh/2-size*0.05,size*0.1,0,Math.PI*2);
    x.arc(bx+bw/2+size*0.12,by+bh/2-size*0.05,size*0.1,0,Math.PI*2);
    x.fill();
    x.restore();
    entityCanvasCache.set(key, c);
    return c;
  }

  if(lbl === 'R' || lbl === 'r'){
    const type = lbl==='R' ? 'fast' : 'slow';
    const color = type==='fast'?'#ff2233':'#ff7700';
    const glow  = type==='fast'?'#ff0020':'#ff6600';
    const pad = Math.max(2, Math.floor(size * 0.1));
    x.save();
    x.shadowColor=glow; x.shadowBlur=size*0.2;
    x.fillStyle=color;
    const bx=pad,by=pad,bw=size-pad*2,bh=size-pad*2;
    x.beginPath();
    if(type==='fast'){
      x.moveTo(bx+bw/2,by+2);x.lineTo(bx+bw-2,by+bh/2);
      x.lineTo(bx+bw/2,by+bh-2);x.lineTo(bx+2,by+bh/2);x.closePath();
    } else {
      const r=Math.max(2,Math.floor(size*0.15));
      x.moveTo(bx+r,by);x.lineTo(bx+bw-r,by);x.quadraticCurveTo(bx+bw,by,bx+bw,by+r);
      x.lineTo(bx+bw,by+bh-r);x.quadraticCurveTo(bx+bw,by+bh,bx+bw-r,by+bh);
      x.lineTo(bx+r,by+bh);x.quadraticCurveTo(bx,by+bh,bx,by+bh-r);
      x.lineTo(bx,by+r);x.quadraticCurveTo(bx,by,bx+r,by);x.closePath();
    }
    x.fill();
    x.fillStyle='rgba(255,255,255,0.4)';
    const eyeR=Math.max(1.5,size*0.1);
    const eyeO=size*0.15;
    x.beginPath();
    x.arc(bx+bw/2-eyeO,by+bh/2-size*0.05,eyeR,0,Math.PI*2);
    x.arc(bx+bw/2+eyeO,by+bh/2-size*0.05,eyeR,0,Math.PI*2);
    x.fill();
    x.restore();
    entityCanvasCache.set(key, c);
    return c;
  }

  const tileC = createTileTexture(lbl, 0);
  x.drawImage(tileC, 0, 0, size, size);
  entityCanvasCache.set(key, c);
  return c;
}
