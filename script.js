/* ═══════════════════════════════════════
   LAB X CO — MAIN SCRIPT
   ═══════════════════════════════════════ */

/* ──────────────────────────────────────
   1. HERO PARTICLE CANVAS (Three.js)
────────────────────────────────────── */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene    = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Camera
  const aspect = canvas.clientWidth / canvas.clientHeight || 1;
  const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
  camera.position.z = 5;

  // Resize handler
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Particle geometry
  const count   = 1800;
  const geo     = new THREE.BufferGeometry();
  const pos     = new Float32Array(count * 3);
  const speeds  = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    speeds[i]      = 0.002 + Math.random() * 0.004;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0xFF3B00,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // Floating wireframe geometry
  const torusGeo = new THREE.TorusGeometry(2.2, 0.006, 8, 80);
  const torusMat = new THREE.MeshBasicMaterial({ color: 0xFF3B00, wireframe: true, opacity: 0.08, transparent: true });
  const torus    = new THREE.Mesh(torusGeo, torusMat);
  scene.add(torus);

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 1.5;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 1.5;
  });

  // Animate
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;

    particles.rotation.y = t * 0.06 + mouseX * 0.12;
    particles.rotation.x = mouseY * 0.08;
    torus.rotation.x     = t * 0.15;
    torus.rotation.y     = t * 0.09;

    // Float each particle
    const positions = geo.attributes.position;
    for (let i = 0; i < count; i++) {
      positions.array[i * 3 + 1] += speeds[i];
      if (positions.array[i * 3 + 1] > 6) positions.array[i * 3 + 1] = -6;
    }
    positions.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();
})();

/* ──────────────────────────────────────
   2. SCROLL-TRIGGERED ANIMATIONS
────────────────────────────────────── */
(function initScrollAnimations() {
  // Framework steps: reveal on scroll
  const steps = document.querySelectorAll('.framework-step');
  if (!steps.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  steps.forEach(step => io.observe(step));

  // Generic fade-up for system items
  const systemItems = document.querySelectorAll('.system-item');
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io2.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  systemItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(40px)';
    item.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    io2.observe(item);
  });

  // Pillar cards fade-up
  const pillars = document.querySelectorAll('.pillar-card');
  const io3 = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io3.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  pillars.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
    io3.observe(card);
  });
})();

/* ──────────────────────────────────────
   3. NAVBAR — scroll shrink + mobile
────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.style.padding = '0.85rem 0';
      navbar.style.background = 'rgba(10,10,10,0.96)';
    } else {
      navbar.style.padding = '1.25rem 0';
      navbar.style.background = 'rgba(10,10,10,0.85)';
    }
  }, { passive: true });

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.style.display === 'flex';
      navLinks.style.display     = isOpen ? '' : 'flex';
      navLinks.style.position    = 'fixed';
      navLinks.style.flexDirection = 'column';
      navLinks.style.top         = '70px';
      navLinks.style.left        = '0';
      navLinks.style.right       = '0';
      navLinks.style.padding     = '2rem';
      navLinks.style.background  = 'rgba(10,10,10,0.98)';
      navLinks.style.borderTop   = '1px solid rgba(255,255,255,0.08)';
      navLinks.style.gap         = '1.5rem';
      if (isOpen) navLinks.removeAttribute('style');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.removeAttribute('style'));
    });
  }
})();

/* ──────────────────────────────────────
   4. WHATSAPP CHAT TYPEWRITER EFFECT
────────────────────────────────────── */
(function initWaAnimation() {
  const messages = document.querySelectorAll('.wa-msg');
  if (!messages.length) return;

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      messages.forEach((msg, i) => {
        msg.style.opacity = '0';
        msg.style.transform = 'translateY(12px)';
        msg.style.transition = `opacity 0.4s ease ${i * 0.4}s, transform 0.4s ease ${i * 0.4}s`;
        setTimeout(() => {
          msg.style.opacity = '1';
          msg.style.transform = 'translateY(0)';
        }, 100);
      });
      io.disconnect();
    }
  }, { threshold: 0.3 });

  const phone = document.querySelector('.wa-phone');
  if (phone) io.observe(phone);
})();

/* ──────────────────────────────────────
   5. RETRO SPACESHIP GAME
────────────────────────────────────── */
(function initGame() {
  const canvas   = document.getElementById('gameCanvas');
  const startBtn = document.getElementById('startGameBtn');
  if (!canvas || !startBtn) return;

  const ctx = canvas.getContext('2d');

  // ── DOM refs ──
  const scoreEl          = document.getElementById('gameScore');
  const livesEl          = document.getElementById('gameLives');
  const startOverlay     = document.getElementById('gameStartOverlay');
  const gameOverOverlay  = document.getElementById('gameOverOverlay');
  const leadOverlay      = document.getElementById('leadCaptureOverlay');
  const finalScoreEl     = document.getElementById('finalScore');
  const winScoreEl       = document.getElementById('winScore');
  const retryBtn         = document.getElementById('retryBtn');
  const claimBtn         = document.getElementById('claimBtn');
  const playAgainBtn     = document.getElementById('playAgainBtn');
  const leadEmail        = document.getElementById('leadEmail');
  const leadError        = document.getElementById('leadError');
  const leadFormArea     = document.getElementById('leadFormArea');
  const leadSuccess      = document.getElementById('leadSuccess');

  // ── State ──
  let W, H, dpr;
  let ship, bullets, enemies, particles, stars;
  let score, lives, running, animId;
  let shootTimer, enemyTimer;
  let keys = {};
  let touchX = null;

  // ── Resize canvas to match CSS size ──
  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    if (ship) ship.x = Math.min(Math.max(ship.x, ship.w / 2), W - ship.w / 2);
  }
  window.addEventListener('resize', () => { resize(); });

  // ── Init game state ──
  function initState() {
    resize();
    score    = 0;
    lives    = 3;
    bullets  = [];
    enemies  = [];
    particles = [];
    shootTimer = 0;
    enemyTimer = 0;
    ship = { x: W / 2, y: H - 60, w: 14, h: 18, speed: 5 };

    // Starfield
    stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      s: Math.random() * 0.6 + 0.2,
    }));

    updateHUD();
  }

  function updateHUD() {
    scoreEl.textContent = score;
    livesEl.textContent = '♥ '.repeat(lives).trim();
  }

  // ── Drawing helpers ──
  function drawStars() {
    stars.forEach(s => {
      s.y += s.s;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      ctx.fillStyle = `rgba(255,255,255,${0.2 + s.r * 0.25})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawShip(x, y) {
    // Glow under engine
    const grd = ctx.createRadialGradient(x, y + 18, 0, x, y + 18, 28);
    grd.addColorStop(0, 'rgba(255,59,0,0.45)');
    grd.addColorStop(1, 'rgba(255,59,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y + 20, 28, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#EFEFEF';
    ctx.beginPath();
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x - 14, y + 18);
    ctx.lineTo(x - 5,  y + 10);
    ctx.lineTo(x + 5,  y + 10);
    ctx.lineTo(x + 14, y + 18);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#FF3B00';
    ctx.beginPath();
    ctx.ellipse(x, y - 4, 6, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = '#BBBBBB';
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 4);
    ctx.lineTo(x - 22, y + 18);
    ctx.lineTo(x - 10, y + 14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 4);
    ctx.lineTo(x + 22, y + 18);
    ctx.lineTo(x + 10, y + 14);
    ctx.closePath();
    ctx.fill();

    // Engine flame — flicker
    const flameH = 8 + Math.random() * 8;
    const flameGrd = ctx.createLinearGradient(x, y + 18, x, y + 18 + flameH);
    flameGrd.addColorStop(0, 'rgba(255,180,0,0.95)');
    flameGrd.addColorStop(1, 'rgba(255,59,0,0)');
    ctx.fillStyle = flameGrd;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 18);
    ctx.lineTo(x + 5, y + 18);
    ctx.lineTo(x, y + 18 + flameH);
    ctx.closePath();
    ctx.fill();
  }

  function drawBullet(b) {
    const grd = ctx.createLinearGradient(b.x, b.y, b.x, b.y - 16);
    grd.addColorStop(0, '#FF3B00');
    grd.addColorStop(1, 'rgba(255,180,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.roundRect(b.x - 2, b.y - 16, 4, 16, 2);
    ctx.fill();
  }

  function drawEnemy(e) {
    // UFO-style enemy with accent flash
    ctx.save();
    ctx.translate(e.x, e.y);

    // Flash red when close to bottom
    const flash = e.y > H * 0.7 && Math.sin(Date.now() / 80) > 0;
    const col   = flash ? '#FF0000' : '#FF8C00';

    // Body dome
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(0, -6, 14, 10, 0, Math.PI, 0);
    ctx.fill();

    // Saucer disk
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bottom glow
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(0, 4, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lights
    [-12, -6, 0, 6, 12].forEach(lx => {
      ctx.fillStyle = Math.sin(Date.now() / 200 + lx) > 0 ? '#fff' : '#888';
      ctx.beginPath();
      ctx.arc(lx, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawParticle(p) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle   = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ── Spawn helpers ──
  function spawnBullet() {
    bullets.push({ x: ship.x, y: ship.y - 18, speed: 9 });
  }

  function spawnEnemy() {
    const x  = 20 + Math.random() * (W - 40);
    const vx = (Math.random() - 0.5) * 2.2; // lateral drift
    const vy = 1.4 + Math.random() * 1.4 + score * 0.06; // speed up with score
    enemies.push({ x, y: -20, vx, vy, r: 18 });
  }

  function spawnExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1.5 + Math.random() * 2.5,
        life: 1,
        color,
      });
    }
  }

  // ── Main loop ──
  let lastTime = 0;
  function loop(ts) {
    if (!running) return;
    const dt = Math.min(ts - lastTime, 50);
    lastTime = ts;

    // Clear
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, W, H);

    // Stars
    drawStars();

    // ── Ship movement ──
    const isMobile = touchX !== null;
    if (isMobile) {
      ship.x += (touchX - ship.x) * 0.15;
    } else {
      if (keys['ArrowLeft']  || keys['a']) ship.x -= ship.speed;
      if (keys['ArrowRight'] || keys['d']) ship.x += ship.speed;
    }
    ship.x = Math.max(ship.w / 2, Math.min(W - ship.w / 2, ship.x));

    // ── Auto-shoot ──
    shootTimer -= dt;
    if (shootTimer <= 0) { spawnBullet(); shootTimer = 380; }

    // ── Enemy spawn ──
    enemyTimer -= dt;
    const spawnRate = Math.max(900 - score * 30, 350);
    if (enemyTimer <= 0) { spawnEnemy(); enemyTimer = spawnRate; }

    // ── Update bullets ──
    bullets = bullets.filter(b => b.y > -10);
    bullets.forEach(b => { b.y -= b.speed; });

    // ── Update enemies ──
    enemies = enemies.filter(e => {
      e.x += e.vx;
      e.y += e.vy;
      // Bounce on side walls
      if (e.x < e.r || e.x > W - e.r) e.vx *= -1;

      // Off screen bottom → just remove, no life penalty
      if (e.y > H + e.r) return false;
      return true;
    });

    // ── Bullet × Enemy collision ──
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const b = bullets[bi];
        const dx = b.x - e.x, dy = b.y - e.y;
        if (dx * dx + dy * dy < (e.r + 4) ** 2) {
          spawnExplosion(e.x, e.y, '#FF8C00');
          enemies.splice(ei, 1);
          bullets.splice(bi, 1);
          score++;
          updateHUD();
          break;
        }
      }
    }

    // ── Enemy × Ship collision (circle-circle, tight radii) ──
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const e = enemies[ei];
      const dx = e.x - ship.x;
      const dy = e.y - ship.y;
      if (dx * dx + dy * dy < (12 + 12) ** 2) {
        spawnExplosion(e.x, e.y, '#FF0000');
        spawnExplosion(ship.x, ship.y, '#FF3B00');
        enemies.splice(ei, 1);
        lives--;
        updateHUD();
        if (lives <= 0) { endGame(); return; }
      }
    }

    // ── Draw bullets ──
    bullets.forEach(drawBullet);

    // ── Draw enemies ──
    enemies.forEach(drawEnemy);

    // ── Draw particles ──
    particles = particles.filter(p => p.life > 0.02);
    particles.forEach(p => {
      p.x    += p.vx;
      p.y    += p.vy;
      p.vy   += 0.05;
      p.life -= 0.035;
      drawParticle(p);
    });

    // ── Draw ship on top ──
    drawShip(ship.x, ship.y);

    animId = requestAnimationFrame(loop);
  }

  // ── Start / Stop ──
  function startGame() {
    initState();
    startOverlay.style.display    = 'none';
    gameOverOverlay.style.display = 'none';
    leadOverlay.style.display     = 'none';
    running = true;
    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(animId);
    if (score >= 10) {
      winScoreEl.textContent     = score;
      leadFormArea.style.display = 'block';
      leadSuccess.style.display  = 'none';
      leadEmail.value            = '';
      leadError.style.display    = 'none';
      leadOverlay.style.display  = 'flex';
    } else {
      finalScoreEl.textContent      = score;
      gameOverOverlay.style.display = 'flex';
    }
  }

  // ── Controls ──
  window.addEventListener('keydown', e => { keys[e.key] = true; e.preventDefault && ['ArrowLeft','ArrowRight'].includes(e.key) && e.preventDefault(); });
  window.addEventListener('keyup',   e => { keys[e.key] = false; });

  // Touch: track finger X relative to canvas
  canvas.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    e.preventDefault();
  }, { passive: false });
  canvas.addEventListener('touchend', () => { touchX = null; });

  // ── Buttons ──
  startBtn.addEventListener('click', startGame);
  retryBtn.addEventListener('click', () => {
    gameOverOverlay.style.display = 'none';
    startGame();
  });
  playAgainBtn.addEventListener('click', () => {
    leadOverlay.style.display = 'none';
    startGame();
  });
  claimBtn.addEventListener('click', () => {
    const email = leadEmail.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      leadError.style.display = 'block';
      return;
    }
    leadError.style.display    = 'none';
    leadFormArea.style.display = 'none';
    leadSuccess.style.display  = 'block';
    // Optionally send to backend / log
    console.log('Lead captured:', email, '| Score:', score);
  });

  // ── ctx.roundRect polyfill for older browsers ──
  if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) {
      this.beginPath();
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
    };
  }

  // Initial resize
  resize();
})();

