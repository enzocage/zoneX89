let AC = null;
function ac(){ if(!AC) AC=new(window.AudioContext||window.webkitAudioContext)(); return AC; }
function tone(freq,dur,type='sine',vol=0.25,bend=0){
  const a=ac(),o=a.createOscillator(),g=a.createGain();
  o.connect(g); g.connect(a.destination);
  o.type=type; o.frequency.setValueAtTime(freq,a.currentTime);
  if(bend) o.frequency.exponentialRampToValueAtTime(bend,a.currentTime+dur);
  g.gain.setValueAtTime(vol,a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
  o.start(); o.stop(a.currentTime+dur);
}
function noise(dur=0.08,vol=0.12){
  const a=ac(),b=a.createBuffer(1,a.sampleRate*dur,a.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  const s=a.createBufferSource(),g=a.createGain();
  s.buffer=b; s.connect(g); g.connect(a.destination);
  g.gain.setValueAtTime(vol,a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
  s.start();
}
const SFX = {
  fogStep:   ()=>noise(0.06,0.1),
  puPickup: (n=1)=>{
    if(n===1){
      tone(350,0.08,'sine',0.2,700); setTimeout(()=>tone(700,0.12,'sine',0.2,1100),90);
    } else {
      tone(500,0.06,'sine',0.18,950); setTimeout(()=>tone(950,0.10,'sine',0.18,1400),70);
      setTimeout(()=>tone(1200,0.08,'triangle',0.12),140);
    }
  },
  puDeliver: ()=>{ [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,0.25,'triangle',0.3),i*70)); },
  lifeLost:  ()=>{ tone(120,0.5,'sawtooth',0.5); setTimeout(()=>tone(60,0.6,'sawtooth',0.35),150); },
  respawn:   ()=>{
    [220,330,440].forEach((f,i)=>setTimeout(()=>tone(f,0.12,'sine',0.15),i*55));
  },
  shield:    ()=>tone(1400,0.1,'triangle',0.08),
  lifeWarn:  ()=>{
    tone(80,0.08,'sine',0.25); setTimeout(()=>tone(70,0.12,'sine',0.2),120);
  },
  door: ()=>{
    const a=ac(), now=a.currentTime;
    const buf=a.createBuffer(1,Math.floor(a.sampleRate*0.11),a.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length*0.7);
    const src=a.createBufferSource(); src.buffer=buf;
    const filt=a.createBiquadFilter(); filt.type='lowpass'; filt.frequency.value=160; filt.Q.value=0.6;
    const g=a.createGain();
    src.connect(filt); filt.connect(g); g.connect(a.destination);
    g.gain.setValueAtTime(0.16,now);
    g.gain.exponentialRampToValueAtTime(0.001,now+0.11);
    src.start(now);
  },
  matDrop:   ()=>tone(90,0.18,'sine',0.3),
  matPick:   ()=>tone(420,0.07,'triangle',0.2),
  gameOver:  ()=>{ [440,392,349,330,294,262,220].forEach((f,i)=>setTimeout(()=>tone(f,0.3,'triangle',0.25),i*140)); },
  levelWin:  ()=>{ [523,659,784,523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,0.18,'sine',0.3),i*90)); },
  enemyClose:(dist)=>{
    const vol=(4-Math.min(dist,3))/4*0.07;
    tone(55,0.25,'sine',vol); tone(80,0.2,'sine',vol*0.5);
  },
  clockTick: (urgency, alt)=>{
    const a=ac(), now=a.currentTime;
    const pitch = alt ? 420 : 270;
    const vol   = 0.10 + urgency*0.22;
    const dur   = 0.022 + urgency*0.008;
    const o=a.createOscillator(), g=a.createGain();
    o.type='triangle'; o.frequency.value=pitch;
    o.connect(g); g.connect(a.destination);
    g.gain.setValueAtTime(vol,now);
    g.gain.exponentialRampToValueAtTime(0.001,now+dur);
    o.start(now); o.stop(now+dur+0.01);
    if(urgency>0.45){
      const nb=a.createBuffer(1,Math.floor(a.sampleRate*0.009),a.sampleRate);
      const nd=nb.getChannelData(0);
      for(let i=0;i<nd.length;i++) nd[i]=(Math.random()*2-1)*(1-i/nd.length);
      const ns=a.createBufferSource(); ns.buffer=nb;
      const ng=a.createGain(); ng.gain.value=(urgency-0.45)*0.45;
      ns.connect(ng); ng.connect(a.destination); ns.start(now);
    }
    if(urgency>0.75){
      const o2=a.createOscillator(), g2=a.createGain();
      o2.type='sine'; o2.frequency.value=alt?110:80;
      o2.connect(g2); g2.connect(a.destination);
      g2.gain.setValueAtTime((urgency-0.75)*0.18,now);
      g2.gain.exponentialRampToValueAtTime(0.001,now+0.06);
      o2.start(now); o2.stop(now+0.07);
    }
  },
};
