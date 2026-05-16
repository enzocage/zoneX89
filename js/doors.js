function updateDoors(dt){
  doors.forEach(d=>{
    d.t+=dt;
    if(d.t>=P.DCYCLE/2){ d.t=0; d.open=!d.open; SFX.door(); }
  });
}
