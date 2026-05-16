function loop(ts){
  const dt=Math.min((ts-lastTS)/1000,0.05);
  lastTS=ts;

  if(!edMode && gameState==='playing' && !helpOpen){
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
requestAnimationFrame(ts=>{ lastTS=ts; requestAnimationFrame(loop); });
