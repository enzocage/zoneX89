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
      const url=makeEntityCanvas(item.lbl,22).toDataURL();
      html+=`<div class="sc-tile-row"><img class="sc-tile-img" src="${url}"><span class="sc-tile-name">${item.name}</span><span class="sc-tile-desc">${item.desc}</span></div>`;
    }
    else if(item.t==='rule') html+=`<div class="sc-rule"><span class="sc-bullet">▸</span><span>${item.text}</span></div>`;
  });
  helpBody.innerHTML=html;

  const select=document.getElementById('level-select');

  // Primary: embedded manifest (works on file:// and http://)
  let levels = typeof LEVEL_MANIFEST !== 'undefined' ? LEVEL_MANIFEST : [];

  // Supplement: try fetching manifest.json for any dynamically added levels
  try{
    const mr=await fetch('levels/manifest.json');
    if(mr.ok){
      const m=await mr.json();
      if(Array.isArray(m)&&m.length) levels=m;
    }
  }catch(e){}

  if(!levels.length) levels=[{name:'Level 1',file:null}];

  levels.forEach((lvl,i)=>{
    const opt=document.createElement('option');
    opt.value=i; opt.textContent=lvl.name;
    select.appendChild(opt);
  });

  const infoPanel=document.getElementById('start-info');
  function showInfo(){ infoPanel.classList.add('visible'); }
  function hideInfo(){ infoPanel.classList.remove('visible'); }
  document.getElementById('start-help-btn').addEventListener('click',showInfo);
  document.getElementById('start-info-close').addEventListener('click',hideInfo);
  document.addEventListener('keydown',e=>{
    if(startScreenOpen && e.code==='KeyH'){
      infoPanel.classList.toggle('visible');
      e.stopPropagation();
    }
  });

  document.getElementById('start-btn').addEventListener('click',async ()=>{
    const idx=parseInt(select.value)||0;
    const lvl=levels[idx];
    // Use embedded data first (works on file://), then try fetch, then fall back
    if(lvl&&lvl.data){
      loadLevel(lvl.data);
    } else if(lvl&&lvl.file){
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

