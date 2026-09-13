import * as THREE from 'https://unpkg.com/three@0.184.0/build/three.module.js';

class ServiceObject extends HTMLElement {
  static get observedAttributes() { return ['kind', 'accent']; }
  connectedCallback() {
    if (this._started) return; this._started = true;
    if (!document.getElementById('service-object-css')) { const st = document.createElement('style'); st.id = 'service-object-css'; st.textContent = 'service-object{display:block}'; document.head.appendChild(st); }
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
    this.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.4, 8.5);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 6, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 1.2); rim.position.set(-5, -2, -4); scene.add(rim);
    this._glow = new THREE.PointLight(0xff4d00, 20, 12); scene.add(this._glow);
    this._scene = scene; this._renderer = renderer; this._camera = camera;
    this._chrome = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, metalness: 0.85, roughness: 0.25 });
    this._dark = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.5 });
    this._accent = new THREE.MeshStandardMaterial({ color: 0xff4d00, emissive: 0xff4d00, emissiveIntensity: 0.5, metalness: 0.2, roughness: 0.35 });
    this._root = new THREE.Group(); scene.add(this._root);
    this._build();
    const target = { x: 0, y: 0 };
    this._onMove = (e) => { const r = this.getBoundingClientRect(); target.x = ((e.clientX - r.left) / r.width - 0.5) * 2; target.y = ((e.clientY - r.top) / r.height - 0.5) * 2; };
    window.addEventListener('pointermove', this._onMove, { passive: true });
    const resize = () => { const w = this.clientWidth, h = this.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    this._ro = new ResizeObserver(resize); this._ro.observe(this); resize();
    const clock = new THREE.Clock();
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      if (this._tick) this._tick(t);
      this._root.rotation.y += (target.x * 0.45 + t * 0.15 - this._root.rotation.y) * 0.05;
      this._root.rotation.x += (target.y * 0.3 - this._root.rotation.x) * 0.05;
      this._root.position.y = Math.sin(t * 0.8) * 0.08;
      renderer.render(scene, camera);
    };
    loop();
  }
  attributeChangedCallback(n) { if (this._root) { if (n === 'kind') this._build(); if (n === 'accent') this._setAccent(); } }
  _setAccent() {
    const raw = this.getAttribute('accent'); const c = new THREE.Color(raw && !raw.includes('{{') ? raw : '#FF4D00');
    this._accent.color.copy(c); this._accent.emissive.copy(c); this._glow.color.copy(c);
  }
  _build() {
    const root = this._root; while (root.children.length) root.remove(root.children[0]);
    root.rotation.set(0, 0, 0);
    this._setAccent();
    const { _chrome: chrome, _dark: dark, _accent: accent } = this;
    const kind = this.getAttribute('kind') || 'software';
    this._tick = null;
    if (kind === 'software') {
      // node canvas: nodes connected by tubes
      const pts = [[-1.8, 0.6, 0], [-0.4, 1.4, 0.4], [0.9, 0.3, -0.3], [1.9, 1.1, 0.5], [-0.9, -0.9, -0.4], [0.7, -1.3, 0.3], [2.1, -0.5, -0.5]].map(p => new THREE.Vector3(...p));
      const edges = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 2], [5, 6], [2, 6]];
      pts.forEach((p, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(i === 2 ? 0.34 : 0.22, 32, 32), i === 2 ? accent : chrome); m.position.copy(p); root.add(m); });
      edges.forEach(([a, b]) => { const c = new THREE.CatmullRomCurve3([pts[a], pts[b]]); root.add(new THREE.Mesh(new THREE.TubeGeometry(c, 8, 0.035, 12, false), dark)); });
    } else if (kind === 'systems') {
      // stacked architecture layers inside a wire cube
      const cube = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.4, 3.4, 3.4)), new THREE.LineBasicMaterial({ color: 0x555555 }));
      root.add(cube);
      const layers = [];
      for (let i = 0; i < 4; i++) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 2.4), i === 1 ? accent : (i % 2 ? dark : chrome));
        m.position.y = -1.2 + i * 0.8; root.add(m); layers.push(m);
      }
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3, 16), chrome); root.add(post);
      root.rotation.x = 0.35;
      this._tick = (t) => layers.forEach((l, i) => { l.position.y = -1.2 + i * 0.8 + Math.sin(t * 1.4 + i * 0.7) * 0.08; });
    } else if (kind === 'campaigns') {
      // prize wheel: segmented disc with pegs
      const seg = 8; const disc = new THREE.Group();
      for (let i = 0; i < seg; i++) {
        const g = new THREE.CylinderGeometry(1.9, 1.9, 0.25, 24, 1, false, (i / seg) * Math.PI * 2, Math.PI * 2 / seg);
        disc.add(new THREE.Mesh(g, i % 2 ? dark : (i % 4 === 0 ? accent : chrome)));
      }
      for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2 + Math.PI / seg; const p = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), chrome); p.position.set(Math.cos(a) * 1.75, 0.2, Math.sin(a) * 1.75); disc.add(p); }
      disc.add(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32), chrome));
      const hub = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), accent); hub.position.set(0, 0.3, -2.1); hub.rotation.x = Math.PI / 2; root.add(hub);
      disc.rotation.x = Math.PI / 2; root.add(disc);
      this._tick = (t) => { disc.rotation.y = t * 0.9; };
    } else {
      // AI agent: core with orbiting satellites
      root.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), accent));
      root.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 1), new THREE.MeshStandardMaterial({ color: 0xf2f2f2, metalness: 0.85, roughness: 0.25, wireframe: true })));
      const sats = [];
      for (let i = 0; i < 3; i++) {
        const g = new THREE.Group(); g.rotation.set(i * 1.1, i * 0.7, i * 0.4);
        g.add(new THREE.Mesh(new THREE.TorusGeometry(2.1 + i * 0.25, 0.02, 12, 120), dark));
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), chrome); s.position.x = 2.1 + i * 0.25; g.add(s);
        root.add(g); sats.push({ g, s, r: 2.1 + i * 0.25, sp: 0.6 + i * 0.25 });
      }
      this._tick = (t) => sats.forEach(({ s, r, sp }, i) => { s.position.set(Math.cos(t * sp + i) * r, Math.sin(t * sp + i) * r, 0); });
    }
  }
  disconnectedCallback() { cancelAnimationFrame(this._raf); window.removeEventListener('pointermove', this._onMove); this._ro && this._ro.disconnect(); this._renderer && this._renderer.dispose(); this._started = false; this.innerHTML = ''; }
}
customElements.define('service-object', ServiceObject);
