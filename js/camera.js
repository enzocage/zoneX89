function updateCamera(dt){
  const tcx=player.px*P.ZOOM-canvas.width/2+TS*P.ZOOM/2;
  const tcy=player.py*P.ZOOM-canvas.height/2+TS*P.ZOOM/2;
  const t=1-Math.pow(0.01,dt*8);
  camX+=(tcx-camX)*t; camY+=(tcy-camY)*t;
}
