let tunVisible = true;

function initTuningPanel(){
  const panel=document.getElementById('tuning');
  while(panel.children.length>1) panel.removeChild(panel.lastChild);

  PARAM_CONFIG.forEach(cfg=>{
    const row=document.createElement('div');
    row.className='tun-row'+(cfg.special?' tun-fog-pct':'');
    row.dataset.key=cfg.key;

    const lbl=document.createElement('span');
    lbl.className='tun-label'; lbl.textContent=cfg.label;

    const bm=document.createElement('button');
    bm.className='btn-m'; bm.textContent='−';
    bm.addEventListener('click',()=>changeTuning(cfg,-1));

    const val=document.createElement('span');
    val.className='tun-val'; val.id='tv-'+cfg.key;
    val.textContent=cfg.fmt(P[cfg.key]||0);

    const bp=document.createElement('button');
    bp.className='btn-p'; bp.textContent='+';
    bp.addEventListener('click',()=>changeTuning(cfg,+1));

    row.append(lbl,bm,val,bp);
    panel.appendChild(row);
  });

  const sep=document.createElement('div'); sep.className='tun-sep'; panel.appendChild(sep);

  const zRow=document.createElement('div'); zRow.className='zoom-derived';
  zRow.innerHTML='ZOOM (auto) <span id="tv-ZOOM">–</span>';
  panel.appendChild(zRow);

  const fRow=document.createElement('div'); fRow.className='tun-info';
  fRow.innerHTML='fog live <span id="tv-LIVE">–</span>';
  panel.appendChild(fRow);

  const btn=document.getElementById('tun-toggle');
  btn.onclick=()=>{
    tunVisible=!tunVisible;
    panel.classList.toggle('hidden',!tunVisible);
    btn.classList.toggle('panel-open',tunVisible);
    btn.style.opacity=tunVisible?'1':'0.5';
    btn.title=tunVisible?'Tuning ausblenden':'Tuning einblenden';
  };
  panel.classList.toggle('hidden',!tunVisible);
  btn.classList.toggle('panel-open',tunVisible);
}

function changeTuning(cfg, dir){
  let v = P[cfg.key];
  v = Math.round((v + cfg.step*dir)*100)/100;
  v = Math.max(cfg.min, Math.min(cfg.max, v));
  P[cfg.key] = v;
  if(cfg.key==='FOG_PCT') P.ZOOM = fogPctToZoom(v);
  if(cfg.key==='LIVES') lives=Math.min(lives,v);
}

function updateTuningDisplay(){
  const panel=document.getElementById('tuning');
  const btn=document.getElementById('tun-toggle');
  if(edMode){
    panel.classList.add('hidden');
    if(btn) btn.classList.add('hidden');
    return;
  }
  if(btn) btn.classList.remove('hidden');
  panel.classList.toggle('hidden',!tunVisible);
  if(!tunVisible) return;

  PARAM_CONFIG.forEach(cfg=>{
    const el=document.getElementById('tv-'+cfg.key);
    if(el) el.textContent=cfg.fmt(P[cfg.key]);
  });
  const zEl=document.getElementById('tv-ZOOM');
  if(zEl) zEl.textContent=P.ZOOM.toFixed(2)+'×';
  const lEl=document.getElementById('tv-LIVE');
  if(lEl) lEl.textContent=computeLiveFogPct()+'%';
}
