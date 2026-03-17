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
