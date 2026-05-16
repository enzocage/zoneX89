function updateBarrels(dt){
  barrels.forEach(b=>{ if(b.flash>0) b.flash=Math.max(0,b.flash-dt); });
}
