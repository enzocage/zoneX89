let lightCanvas, lightCtx;
let lightSources = [];

function initLighting(){
  lightCanvas = document.createElement('canvas');
  lightCanvas.width = canvas.width;
  lightCanvas.height = canvas.height;
  lightCtx = lightCanvas.getContext('2d');
}

function resizeLighting(){
  if(lightCanvas){
    lightCanvas.width = canvas.width;
    lightCanvas.height = canvas.height;
  }
}

function addLightSource(x, y, radius, color, intensity = 1){
  lightSources.push({ x, y, radius, color, intensity });
}

function clearLightSources(){
  lightSources = [];
}

function renderLighting(){
  if(!lightCtx) return;
  
  lightCtx.clearRect(0, 0, lightCanvas.width, lightCanvas.height);
  
  lightCtx.globalCompositeOperation = 'screen';
  
  for(const light of lightSources){
    const screenX = light.x * P.ZOOM - camX;
    const screenY = light.y * P.ZOOM - camY;
    
    const gradient = lightCtx.createRadialGradient(
      screenX, screenY, 0,
      screenX, screenY, light.radius * P.ZOOM
    );
    
    const alpha = light.intensity * 0.5;
    gradient.addColorStop(0, light.color.replace(')', `,${alpha})`).replace('rgb', 'rgba'));
    gradient.addColorStop(0.5, light.color.replace(')', `,${alpha*0.3})`).replace('rgb', 'rgba'));
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    lightCtx.fillStyle = gradient;
    lightCtx.beginPath();
    lightCtx.arc(screenX, screenY, light.radius * P.ZOOM, 0, Math.PI * 2);
    lightCtx.fill();
  }
  
  lightCtx.globalCompositeOperation = 'source-over';
  
  return lightCanvas;
}

function updateLightSources(){
  clearLightSources();
  
  addLightSource(player.px + TS/2, player.py + TS/2, 8, 'rgb(0,255,200)', 0.9);
  
  for(const pu of plutoniums){
    if(!pu.collected && !pu.carried){
      const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
      addLightSource(pu.x * TS + TS/2, pu.y * TS + TS/2, 5, 'rgb(170,255,0)', pulse);
    }
  }
  
  for(const b of barrels){
    if(b.flash > 0){
      addLightSource(b.x * TS + TS/2, b.y * TS + TS/2, 6, 'rgb(51,119,238)', b.flash);
    }
  }
  
  for(const e of enemies){
    const glow = e.type === 'fast' ? 'rgb(255,50,50)' : 'rgb(255,120,0)';
    addLightSource(e.px + TS/2, e.py + TS/2, 4, glow, 0.6);
  }
  
  for(const m of mats){
    if(m.active){
      addLightSource(m.x * TS + TS/2, m.y * TS + TS/2, 3, 'rgb(187,153,85)', 0.4);
    }
  }
}
