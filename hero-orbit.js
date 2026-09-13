import * as THREE from 'https://unpkg.com/three@0.184.0/build/three.module.js';

class HeroOrbit extends HTMLElement {
  connectedCallback() {
    if (this._started) return; this._started = true;
    if (!document.getElementById('hero-orbit-css')) { const st = document.createElement('style'); st.id = 'hero-orbit-css'; st.textContent = 'hero-orbit{display:block}'; document.head.appendChild(st); }
    const raw = this.getAttribute('accent');
    const accent = raw && !raw.includes('{{') ? raw : '#FF4D00';
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
    this.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.6, 9);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 6, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.2); rim.position.set(-5, -2, -4); scene.add(rim);
    const glow = new THREE.PointLight(new THREE.Color(accent), 30, 12); glow.position.set(0, 0, 0); scene.add(glow);

    const root = new THREE.Group(); scene.add(root);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, metalness: 0.85, roughness: 0.25 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.5 });
    const coreMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(accent), emissive: new THREE.Color(accent), emissiveIntensity: 0.55, metalness: 0.2, roughness: 0.35 });

    const core = new THREE.Mesh(new THREE.SphereGeometry(0.55, 64, 64), coreMat); root.add(core);
    let logoImg = null;
    const makeMaps = () => {
      const draw = (bg, fg) => {
        const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
        const ctx = c.getContext('2d');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 75px Archivo, system-ui, sans-serif';
        if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '-2px';
        ctx.fillText('LABX CO', 512, 512);
        const tex = new THREE.CanvasTexture(c); tex.anisotropy = 8;
        if (fg === '#ffffff' && logoImg) { ctx.clearRect(0, 0, c.width, c.height); ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height); const w = 300, hh = w * logoImg.height / logoImg.width; const pad = 26; ctx.fillStyle = '#0B0B0B'; ctx.beginPath(); ctx.roundRect(512 - w / 2 - pad, 512 - hh / 2 - pad, w + pad * 2, hh + pad * 2, 18); ctx.fill(); ctx.drawImage(logoImg, 512 - w / 2, 512 - hh / 2, w, hh); tex.needsUpdate = true; }
        return tex;
      };
      const map = draw(accent, '#ffffff'); map.colorSpace = THREE.SRGBColorSpace;
      const bump = draw('#808080', '#ffffff');
      coreMat.color.set(0xffffff); coreMat.map = map; coreMat.emissiveMap = map; coreMat.emissiveIntensity = 0.35;
      coreMat.bumpMap = bump; coreMat.bumpScale = 0.012; coreMat.needsUpdate = true;
    };
    makeMaps();
    const li = new Image(); li.onload = () => { logoImg = li; makeMaps(); }; li.src = new URL('./assets/labx-logo.png', import.meta.url).href;
    const rings = [];
    const specs = [
      { r: 1.5, tube: 0.045, tilt: [0.4, 0, 0.2], speed: [0.35, 0.5, 0], mat: ringMat, nodes: 1 },
      { r: 2.1, tube: 0.035, tilt: [1.2, 0.3, 0], speed: [0, 0.28, 0.42], mat: darkMat, nodes: 2 },
      { r: 2.7, tube: 0.05, tilt: [0.9, 1.1, 0.5], speed: [0.22, 0, 0.3], mat: ringMat, nodes: 3 },
    ];
    specs.forEach((s, i) => {
      const g = new THREE.Group(); g.rotation.set(...s.tilt);
      g.add(new THREE.Mesh(new THREE.TorusGeometry(s.r, s.tube, 24, 160), s.mat));
      for (let n = 0; n < s.nodes; n++) {
        const a = (n / s.nodes) * Math.PI * 2;
        const node = new THREE.Mesh(new THREE.SphereGeometry(i === 1 ? 0.13 : 0.1, 24, 24), n === 0 ? coreMat : ringMat);
        node.position.set(Math.cos(a) * s.r, Math.sin(a) * s.r, 0); g.add(node);
      }
      root.add(g); rings.push({ g, speed: s.speed });
    });

    const target = { x: 0, y: 0 };
    const onMove = (e) => {
      const r = this.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const resize = () => {
      const w = this.clientWidth, h = this.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.position.z = 9 * Math.min(1.6, Math.max(1, 0.8 / camera.aspect)); camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(this); resize();

    const clock = new THREE.Clock();
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      rings.forEach(({ g, speed }, i) => { g.rotation.x += speed[0] * 0.01; g.rotation.y += speed[1] * 0.01; g.rotation.z += speed[2] * 0.01; });
      core.scale.setScalar(1 + Math.sin(t * 1.6) * 0.04);
      root.rotation.y += (target.x * 0.5 - root.rotation.y) * 0.04;
      root.rotation.x += (target.y * 0.35 - root.rotation.x) * 0.04;
      root.position.y = Math.sin(t * 0.8) * 0.08;
      renderer.render(scene, camera);
    };
    loop();
    this._cleanup = () => { cancelAnimationFrame(this._raf); window.removeEventListener('pointermove', onMove); renderer.dispose(); };
  }
  disconnectedCallback() { this._cleanup && this._cleanup(); this._started = false; this.innerHTML = ''; }
}
customElements.define('hero-orbit', HeroOrbit);
