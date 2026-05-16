let AC=null,_M=null,_C=null,_R=null,_RS=null,_RF=null;

function ac(){
  if(!AC){
    AC=new(window.AudioContext||window.webkitAudioContext)();
    _C=AC.createDynamicsCompressor();
    _C.threshold.value=-24;_C.knee.value=30;_C.ratio.value=12;_C.attack.value=0.003;_C.release.value=0.25;
    _M=AC.createGain();_M.gain.value=0.7;

    _R=AC.createConvolver();
    const il=Math.floor(AC.sampleRate*1.5),ib=AC.createBuffer(2,il,AC.sampleRate);
    for(let ch=0;ch<2;ch++){
      const d=ib.getChannelData(ch);
      for(let i=0;i<il;i++){const t=i/AC.sampleRate;d[i]=(Math.random()*2-1)*Math.exp(-t*4)*(1+Math.sin(t*30)*0.15);}
    }
    _R.buffer=ib;_RS=AC.createGain();_RS.gain.value=0.22;
    _RF=AC.createBiquadFilter();_RF.type='highpass';_RF.frequency.value=180;
    _C.connect(_M);_M.connect(AC.destination);_R.connect(_RF);_RF.connect(_RS);_RS.connect(_M);
  }
  return AC;
}

function rev(node,amt=0.3){const g=AC.createGain();g.gain.value=amt;node.connect(g);g.connect(_R);}

function tone(freq,dur,type='sine',vol=0.25,bend=0,reverbAmt=0){
  const a=ac(),o=a.createOscillator(),g=a.createGain(),p=a.createStereoPanner();
  p.pan.value=(Math.random()-0.5)*0.3;
  o.type=type;o.frequency.setValueAtTime(freq,a.currentTime);
  if(bend)o.frequency.exponentialRampToValueAtTime(bend,a.currentTime+dur);
  g.gain.setValueAtTime(vol,a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
  o.connect(p);p.connect(g);g.connect(_C);
  if(reverbAmt>0)rev(o,reverbAmt);
  o.start();o.stop(a.currentTime+dur+0.05);
}

function noise(dur=0.08,vol=0.12,lp=0,hp=0,reverbAmt=0){
  const a=ac(),b=a.createBuffer(1,a.sampleRate*dur,a.sampleRate);
  const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const s=a.createBufferSource(),g=a.createGain();s.buffer=b;
  let ln=s;
  if(lp>0){const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;s.connect(f);ln=f;}
  if(hp>0){const f=a.createBiquadFilter();f.type='highpass';f.frequency.value=hp;ln.connect(f);ln=f;}
  const p=a.createStereoPanner();p.pan.value=(Math.random()-0.5)*0.2;
  ln.connect(p);p.connect(g);g.connect(_C);
  g.gain.setValueAtTime(vol,a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
  if(reverbAmt>0)rev(s,reverbAmt);
  s.start();
}

function noiseSweep(dur=0.15,vol=0.08,fStart=3000,fEnd=200,reverbAmt=0){
  const a=ac(),b=a.createBuffer(1,a.sampleRate*dur,a.sampleRate);
  const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const s=a.createBufferSource(),g=a.createGain(),f=a.createBiquadFilter();
  s.buffer=b;f.type='lowpass';f.frequency.setValueAtTime(fStart,a.currentTime);
  f.frequency.exponentialRampToValueAtTime(fEnd,a.currentTime+dur);
  s.connect(f);f.connect(g);g.connect(_C);
  g.gain.setValueAtTime(vol,a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
  if(reverbAmt>0)rev(s,reverbAmt);
  s.start();
}

const SFX = {
  gameStart: ()=>{
    [523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,0.2,'triangle',0.12,0,0.25),i*60));
    setTimeout(()=>tone(1047,0.35,'sine',0.15,0,0.3),200);
  },

  keyPress: ()=>{
    const a=ac(),now=a.currentTime;
    const o=a.createOscillator(),g=a.createGain();
    o.type='sine';o.frequency.value=1200+Math.random()*400;
    g.gain.setValueAtTime(0.035,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.025);
    o.connect(g);g.connect(_C);o.start();o.stop(now+0.03);
  },

  helpToggle: ()=>noiseSweep(0.12,0.06,5000,300,0.15),

  editorEnter: ()=>{
    tone(440,0.08,'sine',0.12,880,0.2);
    setTimeout(()=>tone(880,0.1,'sine',0.1,1320,0.2),80);
    setTimeout(()=>tone(1320,0.15,'triangle',0.08,0,0.25),170);
  },

  editorExit: ()=>{
    tone(880,0.1,'triangle',0.08,440,0.15);
    setTimeout(()=>tone(440,0.12,'sine',0.1,220,0.15),100);
  },

  restart: ()=>{
    const a=ac(),now=a.currentTime;
    const o=a.createOscillator(),g=a.createGain();
    o.type='sine';o.frequency.setValueAtTime(600,now);
    o.frequency.exponentialRampToValueAtTime(200,now+0.3);
    g.gain.setValueAtTime(0.12,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.35);
    o.connect(g);g.connect(_C);rev(o,0.2);
    o.start();o.stop(now+0.4);
  },

  fogStep: ()=>noise(0.05,0.06,4000,700),

  puPickup: (n=1)=>{
    if(n===1){
      tone(350,0.06,'sine',0.15,700,0.1);
      setTimeout(()=>tone(700,0.1,'sine',0.18,1100,0.15),80);
      setTimeout(()=>tone(1100,0.08,'triangle',0.08,0,0.2),170);
    } else {
      tone(500,0.05,'sine',0.14,950,0.1);
      setTimeout(()=>tone(950,0.08,'sine',0.14,1400,0.15),60);
      setTimeout(()=>tone(1200,0.07,'triangle',0.1,0,0.2),120);
      setTimeout(()=>tone(1500,0.06,'sine',0.06,0,0.2),180);
    }
  },

  puDeliver: ()=>{
    [523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,0.2,'triangle',0.2,0,0.2),i*60));
    setTimeout(()=>tone(131,0.4,'sine',0.12,0,0.15),0);
  },

  lifeLost: ()=>{
    const a=ac(),now=a.currentTime;
    const o1=a.createOscillator(),o2=a.createOscillator(),g=a.createGain();
    o1.type='sawtooth';o1.frequency.setValueAtTime(120,now);
    o1.frequency.exponentialRampToValueAtTime(50,now+0.4);
    o2.type='sine';o2.frequency.value=40;
    g.gain.setValueAtTime(0.35,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.45);
    o1.connect(g);o2.connect(g);g.connect(_C);rev(g,0.15);
    o1.start(now);o1.stop(now+0.5);o2.start(now);o2.stop(now+0.45);
  },

  respawn: ()=>{
    [220,330,440,550].forEach((f,i)=>setTimeout(()=>tone(f,0.15,'triangle',0.12,0,0.25),i*50));
  },

  shield: ()=>{
    tone(1400,0.08,'triangle',0.07,0,0.2);
    noise(0.06,0.04,8000,2000,0.15);
    const a=ac(),now=a.currentTime;
    const o=a.createOscillator(),g=a.createGain();
    o.type='sine';o.frequency.value=1800;
    g.gain.setValueAtTime(0.05,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.12);
    o.connect(g);g.connect(_C);o.start();o.stop(now+0.15);
  },

  lifeWarn: ()=>{
    const a=ac(),now=a.currentTime;
    const o1=a.createOscillator(),o2=a.createOscillator(),g=a.createGain();
    o1.type='sine';o1.frequency.value=70;
    o2.type='sine';o2.frequency.value=55;
    g.gain.setValueAtTime(0.2,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.18);
    o1.connect(g);o2.connect(g);g.connect(_C);
    o1.start(now);o1.stop(now+0.2);o2.start(now);o2.stop(now+0.2);
  },

  door: ()=>{
    noiseSweep(0.08,0.1,4000,100);
    tone(80,0.1,'triangle',0.06,0);
  },

  matDrop: ()=>{
    tone(80,0.15,'sine',0.22,0);
    tone(55,0.2,'sine',0.12,0);
    noise(0.06,0.06,800,0);
  },

  matPick: ()=>{
    tone(420,0.04,'triangle',0.18,800);
    tone(800,0.06,'sine',0.08,0,0.1);
  },

  gameOver: ()=>{
    [440,392,349,330,294,262,220,196].forEach((f,i)=>setTimeout(()=>tone(f,0.35,'triangle',0.18,0,0.25),i*130));
    const a=ac(),now=a.currentTime;
    const o=a.createOscillator(),g=a.createGain();
    o.type='sine';o.frequency.value=55;
    g.gain.setValueAtTime(0.08,now);g.gain.exponentialRampToValueAtTime(0.001,now+2.5);
    o.connect(g);g.connect(_C);rev(g,0.3);
    o.start(now);o.stop(now+2.8);
  },

  levelWin: ()=>{
    [523,659,784,523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>tone(f,0.22,'sine',0.22,0,0.3),i*80));
    setTimeout(()=>tone(1568,0.45,'triangle',0.15,0,0.35),640);
  },

  enemyClose: (dist)=>{
    const vol=(4-Math.min(dist,3))/4*0.06;
    const a=ac(),now=a.currentTime;
    const o=a.createOscillator(),g=a.createGain();
    o.type='sawtooth';o.frequency.value=45;
    g.gain.setValueAtTime(vol,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.25);
    o.connect(g);g.connect(_C);o.start(now);o.stop(now+0.3);
    const o2=a.createOscillator(),g2=a.createGain();
    o2.type='sine';o2.frequency.value=80;
    g2.gain.setValueAtTime(vol*0.6,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.2);
    o2.connect(g2);g2.connect(_C);o2.start(now);o2.stop(now+0.25);
  },

  clockTick: (urgency,alt)=>{
    const a=ac(),now=a.currentTime;
    const pitch=alt?420:270;
    const baseVol=0.08+urgency*0.2;
    const dur=0.02+urgency*0.008;

    const o=a.createOscillator(),g=a.createGain();
    o.type='triangle';o.frequency.value=pitch;
    g.gain.setValueAtTime(baseVol,now);
    g.gain.exponentialRampToValueAtTime(0.001,now+dur);
    o.connect(g);g.connect(_C);
    o.start(now);o.stop(now+dur+0.01);

    if(urgency>0.3){
      const nB=a.createBuffer(1,Math.floor(a.sampleRate*0.008),a.sampleRate);
      const nD=nB.getChannelData(0);
      for(let i=0;i<nD.length;i++)nD[i]=(Math.random()*2-1)*(1-i/nD.length);
      const nS=a.createBufferSource();nS.buffer=nB;
      const nF=a.createBiquadFilter();nF.type='lowpass';nF.frequency.value=4000+urgency*3000;
      const nG=a.createGain();nG.gain.value=(urgency-0.3)*0.4;
      nS.connect(nF);nF.connect(nG);nG.connect(_C);nS.start(now);
    }

    if(urgency>0.7){
      const o2=a.createOscillator(),g2=a.createGain();
      o2.type='sine';o2.frequency.value=alt?110:80;
      g2.gain.setValueAtTime((urgency-0.7)*0.15,now);
      g2.gain.exponentialRampToValueAtTime(0.001,now+0.05);
      o2.connect(g2);g2.connect(_C);o2.start(now);o2.stop(now+0.06);
    }

    if(urgency>0.85){
      const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=200;
      const nB2=a.createBuffer(1,Math.floor(a.sampleRate*0.015),a.sampleRate);
      const nD2=nB2.getChannelData(0);
      for(let i=0;i<nD2.length;i++)nD2[i]=(Math.random()*2-1)*(1-i/nD2.length);
      const nS2=a.createBufferSource();nS2.buffer=nB2;
      const nG2=a.createGain();nG2.gain.value=(urgency-0.85)*0.6;
      nS2.connect(f);f.connect(nG2);nG2.connect(_C);nS2.start(now);
    }
  },
};
