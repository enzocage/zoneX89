let scanlineCanvas, scanlineCtx;
let vignetteCanvas, vignetteCtx;
let chromaticOffset = 0;
let shakeIntensity = 0;
let shakeDuration = 0;

function initPostProcessing(){
  scanlineCanvas = document.createElement('canvas');
  scanlineCanvas.width = canvas.width;
  scanlineCanvas.height = canvas.height;
  scanlineCtx = scanlineCanvas.getContext('2d');
  
  vignetteCanvas = document.createElement('canvas');
  vignetteCanvas.width = canvas.width;
  vignetteCanvas.height = canvas.height;
  vignetteCtx = vignetteCanvas.getContext('2d');
  
  createScanlines();
  createVignette();
}

function createScanlines(){
  scanlineCtx.fillStyle = 'rgba(0,0,0,0)';
  scanlineCtx.fillRect(0, 0, scanlineCanvas.width, scanlineCanvas.height);
  
  scanlineCtx.fillStyle = 'rgba(0,0,0,0.06)';
  for(let y = 0; y < scanlineCanvas.height; y += 3){
    scanlineCtx.fillRect(0, y, scanlineCanvas.width, 1);
  }
  
  scanlineCtx.fillStyle = 'rgba(0,255,100,0.02)';
  for(let y = 0; y < scanlineCanvas.height; y += 4){
    scanlineCtx.fillRect(0, y, scanlineCanvas.width, 0.5);
  }
}

function createVignette(){
  vignetteCtx.fillStyle = 'rgba(0,0,0,0)';
  vignetteCtx.fillRect(0, 0, vignetteCanvas.width, vignetteCanvas.height);
  
  const gradient = vignetteCtx.createRadialGradient(
    vignetteCanvas.width/2, vignetteCanvas.height/2, vignetteCanvas.height * 0.3,
    vignetteCanvas.width/2, vignetteCanvas.height/2, vignetteCanvas.height * 0.8
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.5, 'rgba(0,0,0,0.1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
  
  vignetteCtx.fillStyle = gradient;
  vignetteCtx.fillRect(0, 0, vignetteCanvas.width, vignetteCanvas.height);
}

function resizePostProcessing(){
  if(scanlineCanvas){
    scanlineCanvas.width = canvas.width;
    scanlineCanvas.height = canvas.height;
    createScanlines();
  }
  if(vignetteCanvas){
    vignetteCanvas.width = canvas.width;
    vignetteCanvas.height = canvas.height;
    createVignette();
  }
}

function addShake(intensity, duration){
  shakeIntensity = intensity;
  shakeDuration = duration;
}

function updatePostProcessing(dt){
  if(shakeDuration > 0){
    shakeDuration -= dt;
    if(shakeDuration <= 0){
      shakeIntensity = 0;
      shakeDuration = 0;
    }
  }
  
  chromaticOffset = Math.sin(Date.now() * 0.01) * 0.5;
}

function getShakeOffset(){
  if(shakeIntensity <= 0) return { x: 0, y: 0 };
  const progress = 1 - (shakeDuration / (shakeIntensity / 5));
  const intensity = shakeIntensity * progress;
  return {
    x: (Math.random() - 0.5) * intensity,
    y: (Math.random() - 0.5) * intensity
  };
}

function applyChromaticAberration(){
  if(Math.abs(chromaticOffset) < 0.3) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  
  ctx.globalAlpha = 0.3;
  ctx.drawImage(canvas, -chromaticOffset, 0);
  
  ctx.globalAlpha = 0.3;
  ctx.drawImage(canvas, chromaticOffset, 0);
  
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

function renderPostProcessing(){
  ctx.save();
  
  const shake = getShakeOffset();
  if(shake.x !== 0 || shake.y !== 0){
    ctx.translate(shake.x, shake.y);
  }
  
  if(vignetteCanvas){
    ctx.globalAlpha = 0.7;
    ctx.drawImage(vignetteCanvas, 0, 0);
    ctx.globalAlpha = 1;
  }
  
  if(scanlineCanvas){
    ctx.globalAlpha = 0.5;
    ctx.drawImage(scanlineCanvas, 0, 0);
    ctx.globalAlpha = 1;
  }
  
  ctx.restore();
}

function renderLightOverlay(lightCanvas){
  if(!lightCanvas) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.5;
  ctx.drawImage(lightCanvas, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
