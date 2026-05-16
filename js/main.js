let _audioStarted=false;
function startAudio(){
  if(_audioStarted) return;
  _audioStarted=true;
  const a=ac();
  if(a.state==="suspended") a.resume();
  SFX.gameStart();
  document.removeEventListener("keydown",startAudio);
  document.removeEventListener("mousedown",startAudio);
}

function loop(ts){
  const dt=Math.min((ts-lastTS)/1000,0.05);
  lastTS=ts;

  if(!edMode && gameState==="playing" && !helpOpen){
    updatePlayer(dt);
    updateDoors(dt);
    updateBarrels(dt);
    updateEnemies(dt);
  }
  updateCamera(dt);
  render();
  updateTuningDisplay();

  requestAnimationFrame(loop);
}

loadLevel(LEVEL_DATA);
initTuningPanel();
initLighting();
initPostProcessing();
document.addEventListener("keydown",startAudio);
document.addEventListener("mousedown",startAudio);
requestAnimationFrame(ts=>{ lastTS=ts; requestAnimationFrame(loop); });

