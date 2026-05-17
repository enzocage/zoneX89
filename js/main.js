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

  if(!edMode && gameState==="playing" && !helpOpen && !startScreenOpen){
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

async function buildStartScreen(){
  const helpBody=document.getElementById('start-help-body');
  let html='';
  HELP_CONTENT.forEach(item=>{
    if(item.t==='gap') html+='<div class="sc-gap"></div>';
    else if(item.t==='head') html+=`<div class="sc-head">── ${item.text} ──</div>`;
    else if(item.t==='ctrl') html+=`<div class="sc-ctrl"><span class="sc-key">${item.key}</span><span class="sc-desc">${item.desc}</span></div>`;
    else if(item.t==='tile'){
      const lc=item.col==='#aaff00'?'rgba(0,40,0,0.9)':item.col==='#00ffcc'?'rgba(0,30,20,0.7)':'rgba(255,255,255,0.65)';
      html+=`<div class="sc-tile-row"><span class="sc-tile-col" style="background:${item.col};color:${lc}">${item.lbl}</span><span class="sc-tile-name">${item.name}</span><span class="sc-tile-desc">${item.desc}</span></div>`;
    }
    else if(item.t==='rule') html+=`<div class="sc-rule"><span class="sc-bullet">▸</span><span>${item.text}</span></div>`;
  });
  helpBody.innerHTML=html;

  const select=document.getElementById('level-select');
  let levels=[{name:'Level 1',file:null}];
  try{
    const r=await fetch('levels/manifest.json');
    if(r.ok){ const m=await r.json(); if(m.length) levels=m; }
  }catch(e){}
  levels.forEach((lvl,i)=>{
    const opt=document.createElement('option');
    opt.value=i; opt.textContent=lvl.name;
    select.appendChild(opt);
  });

  document.getElementById('start-btn').addEventListener('click',async ()=>{
    const idx=parseInt(select.value)||0;
    const lvl=levels[idx];
    if(lvl&&lvl.file){
      try{
        const r=await fetch(lvl.file);
        const data=await r.json();
        loadLevel(data);
      }catch(e){ loadLevel(LEVEL_DATA); }
    } else {
      loadLevel(LEVEL_DATA);
    }
    startScreenOpen=false;
    document.getElementById('start-screen').style.display='none';
    startAudio();
    const music=document.getElementById('bg-music');
    music.src='https://nu.vgmtreasurechest.com/soundtracks/c64-remix-2018/deigeeid/01.%20Lightforce.mp3';
    music.volume=0.1;
    music.play().catch(()=>{});
    const slider=document.getElementById('vol-slider');
    if(slider) slider.value=10;
  });
}

loadLevel(LEVEL_DATA);
initTuningPanel();
initLighting();
initPostProcessing();
document.addEventListener("keydown",startAudio);
document.addEventListener("mousedown",startAudio);
requestAnimationFrame(ts=>{ lastTS=ts; requestAnimationFrame(loop); });
buildStartScreen();

