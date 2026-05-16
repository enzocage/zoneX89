const TS = 32;
const COLORS = {
  wa: '#1e1e1e', fo: '#0e1c2a', ai: '#080d12',
  pu: '#aaff00', to: '#3377ee', tü: '#8822dd',
  ma: '#bb9955', pl: '#00ffcc',
};
const TILE_LABELS = { wa:'wa', fo:'fo', ai:'', pu:'pu', to:'to', tü:'tü', ma:'ma' };
const DIRS4 = [[1,0],[-1,0],[0,1],[0,-1]];

const PARAM_CONFIG = [
  { key:'SPEED',   label:'SPEED',     step:10,  min:50,   max:500, fmt:v=>v+' px/s',  pKey:'SPEED'  },
  { key:'EFAST',   label:'ENEMY_F',   step:10,  min:20,   max:300, fmt:v=>v+' px/s',  pKey:'EFAST'  },
  { key:'ESLOW',   label:'ENEMY_S',   step:5,   min:10,   max:150, fmt:v=>v+' px/s',  pKey:'ESLOW'  },
  { key:'PTIMER',  label:'PU_TIMER',  step:5,   min:5,    max:120, fmt:v=>v+'s',       pKey:'PTIMER' },
  { key:'DCYCLE',  label:'DOOR',      step:0.5, min:0.5,  max:6,   fmt:v=>v.toFixed(1)+'s', pKey:'DCYCLE' },
  { key:'LIVES',   label:'LIVES',     step:1,   min:1,    max:9,   fmt:v=>v,           pKey:'LIVES'  },
  { key:'FOG_PCT', label:'FOG% → ZOOM', step:5, min:0,    max:100, fmt:v=>v+'%',       pKey:'FOG_PCT', special:true },
];

function fogPctToZoom(pct){
  const fitZoom = (W&&H) ? Math.min(canvas.width/(W*TS), canvas.height/(H*TS)) : 0.9;
  const maxZoom = 8;
  return fitZoom + (pct/100)*(maxZoom-fitZoom);
}

function computeLiveFogPct(){
  if(!fogMap||!fogMap.length) return 0;
  let total=0,fogged=0;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    if(tiles[y][x]==='wa') continue;
    total++;
    if(fogMap[y][x]) fogged++;
  }
  return total>0?Math.round(fogged/total*100):0;
}
