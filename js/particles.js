const particles = [];
const MAX_PARTICLES = 500;

const PARTICLE_TYPES = {
  spark: { color: '#ffff00', size: 2, decay: 0.02, gravity: 0 },
  smoke: { color: 'rgba(100,100,120,0.6)', size: 4, decay: 0.015, gravity: -0.5 },
  glow: { color: '#aaff00', size: 3, decay: 0.025, gravity: 0 },
  debris: { color: '#888866', size: 2.5, decay: 0.02, gravity: 2 },
  ember: { color: '#ff6600', size: 2, decay: 0.03, gravity: -0.3 },
  dust: { color: 'rgba(200,200,180,0.4)', size: 1.5, decay: 0.01, gravity: 0 },
  spark_blue: { color: '#00aaff', size: 2, decay: 0.025, gravity: 0 },
  spark_green: { color: '#00ff88', size: 2, decay: 0.025, gravity: 0 },
};

function createParticle(x, y, type, vx, vy, life = 1){
  if(particles.length >= MAX_PARTICLES) return;
  
  const template = PARTICLE_TYPES[type] || PARTICLE_TYPES.spark;
  particles.push({
    x, y,
    vx: vx || (Math.random() - 0.5) * 50,
    vy: vy || (Math.random() - 0.5) * 50,
    life,
    maxLife: life,
    type,
    color: template.color,
    size: template.size,
    decay: template.decay,
    gravity: template.gravity
  });
}

function emitParticles(x, y, type, count, spread = 360, speedMin = 30, speedMax = 80){
  for(let i = 0; i < count; i++){
    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    createParticle(x, y, type, vx, vy, 0.5 + Math.random() * 0.5);
  }
}

function updateParticles(dt){
  for(let i = particles.length - 1; i >= 0; i--){
    const p = particles[i];
    p.life -= p.decay;
    
    if(p.life <= 0){
      particles.splice(i, 1);
      continue;
    }
    
    p.vx += p.gravity * dt * 10;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}

function renderParticles(){
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  
  for(const p of particles){
    const screenX = p.x * P.ZOOM - camX;
    const screenY = p.y * P.ZOOM - camY;
    const alpha = p.life;
    const size = p.size * (0.5 + alpha * 0.5);
    
    ctx.fillStyle = p.color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
    ctx.beginPath();
    ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

function clearParticles(){
  particles.length = 0;
}

const SFX_PARTICLES = {
  footstep: (x, y) => {
    if(Math.random() > 0.3) return;
    emitParticles(x, y, 'dust', 2, 180, 20, 40);
  },
  
  puPickup: (x, y) => {
    emitParticles(x, y, 'glow', 12, 360, 40, 100);
    emitParticles(x, y, 'spark_green', 6, 360, 60, 120);
  },
  
  puDeliver: (x, y) => {
    emitParticles(x, y, 'spark_blue', 20, 360, 50, 150);
    emitParticles(x, y, 'glow', 15, 360, 30, 80);
  },
  
  enemyHit: (x, y, type) => {
    const color = type === 'fast' ? 'spark_green' : 'ember';
    emitParticles(x, y, color, 10, 360, 60, 120);
    emitParticles(x, y, 'smoke', 5, 360, 30, 60);
  },
  
  lifeLost: (x, y) => {
    emitParticles(x, y, 'ember', 15, 360, 40, 100);
    emitParticles(x, y, 'smoke', 10, 360, 20, 50);
  },
  
  respawn: (x, y) => {
    emitParticles(x, y, 'glow', 20, 360, 30, 80);
    emitParticles(x, y, 'spark_blue', 12, 360, 50, 100);
  },
  
  matPickup: (x, y) => {
    emitParticles(x, y, 'debris', 6, 180, 30, 60);
    emitParticles(x, y, 'dust', 4, 360, 20, 40);
  },
  
  barrelFlash: (x, y) => {
    emitParticles(x, y, 'spark_blue', 8, 360, 50, 100);
    emitParticles(x, y, 'glow', 5, 360, 20, 50);
  },
  
  levelWin: (x, y) => {
    for(let i = 0; i < 5; i++){
      setTimeout(() => {
        emitParticles(x, y, 'glow', 10, 360, 40, 120);
        emitParticles(x, y, 'spark', 8, 360, 60, 140);
      }, i * 100);
    }
  }
};
