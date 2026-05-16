function updateDoors(dt){
  doors.forEach(d=>{
    d.t+=dt;
    if(d.t>=P.DCYCLE/2){ 
      d.t=0; 
      d.open=!d.open; 
      SFX.door(); 
      SFX_PARTICLES.doorOpen(d.x*TS+TS/2, d.y*TS+TS/2);
    }
  });
}
