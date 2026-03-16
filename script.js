// Three.js Hero Animation
let scene, camera, renderer, object;

function init() {
  const canvas = document.querySelector('#hero-canvas');
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 16.5;

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1);
  mainLight.position.set(5, 5, 5);
  scene.add(mainLight);

  const accentLight = new THREE.PointLight(0xff6a3d, 1);
  accentLight.position.set(-5, -5, -5);
  scene.add(accentLight);

  // Create Abstract Neural Network / Object
  const geometry = new THREE.IcosahedronGeometry(1.8, 1);
  const material = new THREE.MeshPhongMaterial({
    color: 0xff6a3d, // Orange wireframe
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });
  
  object = new THREE.Group();
  
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.44, 2),
    new THREE.MeshPhongMaterial({
      color: 0xff6a3d, // Orange core
      transparent: true,
      opacity: 0.15,
      flatShading: true
    })
  );
  object.add(core);

  const wireframe = new THREE.Mesh(geometry, material);
  object.add(wireframe);

  // Add dots at vertices
  const pointsGeometry = new THREE.IcosahedronGeometry(1.8, 1);
  const pointsMaterial = new THREE.PointsMaterial({
    color: 0xff6a3d, // Orange points
    size: 0.06
  });
  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  object.add(points);

  scene.add(object);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  
  object.rotation.y += 0.002;
  object.rotation.x += 0.001;
  
  renderer.render(scene, camera);
}

// Mouse tracking
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX - window.innerWidth / 2) / 100;
  mouseY = (e.clientY - window.innerHeight / 2) / 100;
});

function updateObjectRotation() {
  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;
  
  if (object) {
    object.rotation.y = targetX * 0.5;
    object.rotation.x = targetY * 0.5;
  }
  
  requestAnimationFrame(updateObjectRotation);
}

// FAQ Accordion
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.querySelector('h4').addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });
}

// GSAP Animations
function initAnimations() {
  // Hero stagger
  gsap.from('.hero-title', {
    y: 100,
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out'
  });
  
  gsap.from('.subtext, .hero .btn', {
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out',
    delay: 0.5
  });

  // Pillars stagger
  gsap.from('.pillar-card', {
    scrollTrigger: {
      trigger: '#what-we-build',
      start: 'top 80%'
    },
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out'
  });

  // Flow diagram stagger
  gsap.from('.flow-step, .flow-arrow', {
    scrollTrigger: {
      trigger: '#flow',
      start: 'top 80%'
    },
    x: -20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power2.out'
  });

  // Project cards stagger
  gsap.from('.project-card', {
    scrollTrigger: {
      trigger: '#systems',
      start: 'top 80%'
    },
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out'
  });

  // Process cards stagger
  gsap.from('.process-card', {
    scrollTrigger: {
      trigger: '#process',
      start: 'top 80%'
    },
    y: 50,
    opacity: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power3.out'
  });
}

// Initialize
window.addEventListener('load', () => {
  init();
  updateObjectRotation();
  initFAQ();
  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);
  initAnimations();
});

// Handle resize
window.addEventListener('resize', () => {
  const canvas = document.querySelector('#hero-canvas');
  if(!canvas) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
});

// --- Mini Game Logic ---
let gameActive = false;
let gameData = null;
let gameListenersAdded = false;
let gameLoopId = null;

function setupGameControls(canvas) {
  if (gameListenersAdded) return;
  gameListenersAdded = true;

  function resize() {
    if(canvas && canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('keydown', e => {
    if(gameData && gameData.keys.hasOwnProperty(e.key)) gameData.keys[e.key] = true;
  });
  window.addEventListener('keyup', e => {
    if(gameData && gameData.keys.hasOwnProperty(e.key)) gameData.keys[e.key] = false;
  });

  let isTouching = false;
  canvas.addEventListener('touchstart', e => {
    isTouching = true;
    if(gameData) updatePlayerPos(e.touches[0].clientX);
  });
  canvas.addEventListener('touchmove', e => {
    if(isTouching && gameData) {
      e.preventDefault();
      updatePlayerPos(e.touches[0].clientX);
    }
  }, {passive: false});
  canvas.addEventListener('touchend', () => { isTouching = false; });

  function updatePlayerPos(clientX) {
    if(!gameData) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    gameData.player.x = x;
    if(gameData.player.x < gameData.player.width/2) gameData.player.x = gameData.player.width/2;
    if(gameData.player.x > canvas.width - gameData.player.width/2) gameData.player.x = canvas.width - gameData.player.width/2;
  }
}

function initGame() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  if(!canvas || !ctx) return;
  
  setupGameControls(canvas);

  if (gameLoopId) cancelAnimationFrame(gameLoopId);

  gameData = {
    score: 0,
    keys: { ArrowLeft: false, ArrowRight: false, a: false, d: false },
    player: {
      x: canvas.width / 2,
      y: canvas.height - 60,
      width: 40,
      height: 40,
      speed: 6,
      cooldown: 0
    },
    projectiles: [],
    enemies: [],
    stars: []
  };

  for(let i=0; i<80; i++) {
    gameData.stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: Math.random() * 1 + 0.2
    });
  }

  gameActive = true;
  document.getElementById('gameScore').innerText = '0';

  function spawnEnemy() {
    if(Math.random() < 0.05) {
      gameData.enemies.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: -30,
        width: 30,
        height: 30,
        speed: Math.random() * 2.5 + 1.5,
        dx: (Math.random() - 0.5) * 4 // Horizontal drift
      });
    }
  }

  function drawShip(x, y) {
    ctx.fillStyle = '#FF6A3D'; 
    ctx.fillRect(x - 20, y + 10, 40, 10);
    ctx.fillRect(x - 10, y, 20, 20);
    ctx.fillRect(x - 4, y - 10, 8, 20);
    
    ctx.fillStyle = Math.random() > 0.5 ? '#FFB347' : '#FF6A3D';
    ctx.fillRect(x - 10, y + 20, 6, 10);
    ctx.fillRect(x + 4, y + 20, 6, 10);
  }

  function drawEnemy(x, y, w, h) {
    ctx.fillStyle = '#6B7280';
    ctx.fillRect(x - w/2, y - h/2, w, h);
    ctx.fillStyle = '#FF3366'; 
    ctx.fillRect(x - 4, y - 4, 8, 8);
  }

  function gameOver() {
    gameActive = false;
    if(gameData.score >= 10) {
      document.getElementById('leadCapturePopup').style.display = 'flex';
    } else {
      const overlay = document.getElementById('gameStartOverlay');
      document.getElementById('overlayTitle').innerText = 'GAME OVER';
      document.getElementById('overlayDesc').innerText = `Score: ${gameData.score}. Reach 10 to unlock consultation.`;
      document.getElementById('startGameBtn').innerText = 'Try Again';
      overlay.style.display = 'flex';
    }
  }

  function update() {
    if(!gameActive) return;

    if(gameData.keys.ArrowLeft || gameData.keys.a) gameData.player.x -= gameData.player.speed;
    if(gameData.keys.ArrowRight || gameData.keys.d) gameData.player.x += gameData.player.speed;
    
    if(gameData.player.x < gameData.player.width/2) gameData.player.x = gameData.player.width/2;
    if(gameData.player.x > canvas.width - gameData.player.width/2) gameData.player.x = canvas.width - gameData.player.width/2;
    gameData.player.y = canvas.height - 60; 

    gameData.player.cooldown--;
    if(gameData.player.cooldown <= 0) {
      gameData.projectiles.push({ x: gameData.player.x, y: gameData.player.y - 15, speed: 10, radius: 4 });
      gameData.player.cooldown = 12; 
    }

    gameData.stars.forEach(s => {
      s.y += s.speed;
      if(s.y > canvas.height) {
        s.y = 0;
        s.x = Math.random() * canvas.width;
      }
    });

    for(let i = gameData.projectiles.length - 1; i >= 0; i--) {
      let p = gameData.projectiles[i];
      p.y -= p.speed;
      if(p.y < 0) gameData.projectiles.splice(i, 1);
    }

    spawnEnemy();
    for(let i = gameData.enemies.length - 1; i >= 0; i--) {
      let e = gameData.enemies[i];
      e.y += e.speed;
      e.x += e.dx;
      
      // Bounce off walls
      if (e.x < e.width/2) { e.x = e.width/2; e.dx *= -1; }
      if (e.x > canvas.width - e.width/2) { e.x = canvas.width - e.width/2; e.dx *= -1; }

      if(e.y > canvas.height + e.height) {
        gameData.enemies.splice(i, 1);
        continue;
      }
      
      // Player Collision Detection (Game Over condition)
      if(e.x > gameData.player.x - gameData.player.width/2 - e.width/2 && e.x < gameData.player.x + gameData.player.width/2 + e.width/2 &&
         e.y > gameData.player.y - gameData.player.height/2 - e.height/2 && e.y < gameData.player.y + gameData.player.height/2 + e.height/2) {
           gameOver();
           return;
      }

      // Projectile Collision
      let hit = false;
      for(let j = gameData.projectiles.length - 1; j >= 0; j--) {
        let p = gameData.projectiles[j];
        if(p.x > e.x - e.width/2 && p.x < e.x + e.width/2 &&
           p.y > e.y - e.height/2 && p.y < e.y + e.height/2) {
             gameData.projectiles.splice(j, 1);
             hit = true;
             break; 
        }
      }
      if (hit) {
        gameData.enemies.splice(i, 1);
        gameData.score++;
        document.getElementById('gameScore').innerText = gameData.score;
      }
    }
  }

  function draw() {
    ctx.fillStyle = '#0a0b12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    gameData.stars.forEach(s => {
      ctx.globalAlpha = s.size / 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    if(!gameActive) return;

    drawShip(gameData.player.x, gameData.player.y);

    ctx.fillStyle = '#00ffcc';
    gameData.projectiles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ffcc';
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    gameData.enemies.forEach(e => {
      drawEnemy(e.x, e.y, e.width, e.height);
    });
  }

  function loop() {
    update();
    draw();
    if (gameActive) {
      gameLoopId = requestAnimationFrame(loop);
    }
  }

  loop();
}

// Setup Game Button Triggers
document.getElementById('startGameBtn')?.addEventListener('click', () => {
  document.getElementById('gameStartOverlay').style.display = 'none';
  initGame();
});

// Setup Lead Form Submission Mock
document.getElementById('submitLeadBtn')?.addEventListener('click', (e) => {
  e.preventDefault(); 
  const email = document.getElementById('leadEmail').value;
  if(email) {
    document.getElementById('leadForm').style.display = 'none';
    document.getElementById('popupTitle').style.display = 'none';
    document.getElementById('popupDesc').style.display = 'none';
    document.getElementById('leadSuccess').style.display = 'block';
  }
});
