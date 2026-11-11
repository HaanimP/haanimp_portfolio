const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const hasG = !!(window.gsap && window.ScrollTrigger) && !reduce;
if (hasG) gsap.registerPlugin(ScrollTrigger);

// ---------- Header ----------
(() => {
  const top = document.getElementById('top'), sheet = document.getElementById('sheet'), btn = document.getElementById('menuBtn');
  const set = o => { sheet.classList.toggle('on', o); btn.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); document.body.style.overflow = o ? 'hidden' : ''; if (o) { try { document.getElementById('menuTime').textContent = 'Cape Town · ' + new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' }).format(new Date()); } catch (e) {} } };
  btn.addEventListener('click', () => set(!sheet.classList.contains('on')));
  sheet.querySelectorAll('.links a').forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('on')) { set(false); btn.focus(); } });
  addEventListener('resize', () => { if (innerWidth > 900 && sheet.classList.contains('on')) set(false); });
  // mark the section you're in
  const links = [...sheet.querySelectorAll('.links a')];
  const mark = () => { let cur = 'home'; ['about', 'work', 'journey', 'words', 'contact'].forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * .4) cur = id; }); links.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + cur))); };
  addEventListener('scroll', mark, { passive: true }); mark();
  const prog = () => { const h = document.documentElement.scrollHeight - innerHeight; btn.style.setProperty('--p', h > 0 ? (scrollY / h).toFixed(4) : 0); };
  addEventListener('scroll', prog, { passive: true }); prog();
  const stack = sheet.querySelector('.arch3d .stack');
  sheet.addEventListener('pointermove', e => { stack.style.setProperty('--mx', (e.clientX / innerWidth - .5).toFixed(3)); stack.style.setProperty('--my', (e.clientY / innerHeight - .5).toFixed(3)); });
  const hero = document.getElementById('home');
  const upd = () => { const st = window.__heroST, end = st && st.end > 0 ? st.end : hero.offsetHeight * .6; top.classList.toggle('solid', scrollY > end - 80); };
  addEventListener('scroll', upd, { passive: true }); upd();
  const tick = () => { try { document.getElementById('clock').textContent = 'Cape Town ' + new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' }).format(new Date()); } catch (e) {} };
  tick(); setInterval(tick, 15000);
})();

// ---------- Hero: a particle field that takes shape ----------
const Hero = (() => {
  const hero = document.getElementById('home'), cv = document.getElementById('hero3d');
  const phases = [...hero.querySelectorAll('.phase')], stepBtns = [...document.querySelectorAll('#steps button')];
  let target = 0, morph = 0;
  const setPhaseUI = m => { const k = Math.min(3, Math.round(m)); phases.forEach((p, i) => p.classList.toggle('on', i === k)); stepBtns.forEach((b, i) => { b.classList.toggle('on', i === k); b.style.setProperty('--f', (clamp(m - i + 1) * 100).toFixed(0) + '%'); }); };
  setPhaseUI(0);
  const api = { set: v => { target = v; if (!api.live) { morph = v; setPhaseUI(v); } }, live: false };
  if (!window.THREE) { document.documentElement.classList.add('no3d'); return api; }
  let R;
  try { R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { R = null; }
  if (!R || !R.getContext()) { document.documentElement.classList.add('no3d'); return api; }
  api.live = true;
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, .1, 100); cam.position.set(0, 0, 14);
  const group = new THREE.Group(); scene.add(group);
  const phone = () => innerWidth / innerHeight < .9;
  const N = innerWidth < 700 ? 5200 : 9000;

  // shapes
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const sphere = () => { const a = new Float32Array(N * 3), ga = Math.PI * (3 - Math.sqrt(5)); for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i; const inner = rnd() < .22, R0 = inner ? 2.4 * Math.cbrt(rnd()) : 2.4 + (rnd() - .5) * .12; a[i * 3] = Math.cos(th) * r * R0; a[i * 3 + 1] = y * R0; a[i * 3 + 2] = Math.sin(th) * r * R0; } return a; };
  const glyph = (text, font, h) => {
    const c = document.createElement('canvas'); c.width = 1200; c.height = 600; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 600, 320);
    const d = g.getImageData(0, 0, 1200, 600).data, pts = [];
    for (let y = 0; y < 600; y += 2) for (let x = 0; x < 1200; x += 2) if (d[(y * 1200 + x) * 4 + 3] > 140) pts.push(x, y);
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9; for (let i = 0; i < pts.length; i += 2) { minX = Math.min(minX, pts[i]); maxX = Math.max(maxX, pts[i]); minY = Math.min(minY, pts[i + 1]); maxY = Math.max(maxY, pts[i + 1]); }
    const sc = h / (maxY - minY), cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, a = new Float32Array(N * 3), M = pts.length / 2;
    for (let i = 0; i < N; i++) { const k = Math.floor(rnd() * M) * 2; a[i * 3] = (pts[k] - cx + (rnd() - .5) * 2) * sc; a[i * 3 + 1] = -(pts[k + 1] - cy + (rnd() - .5) * 2) * sc; a[i * 3 + 2] = (rnd() - .5) * .5; }
    return a;
  };
  // arch frame around her portrait
  const AR = { ri: 1.5, ro: 1.92, base: -2.75, hs: 3.0 };
  const arch = () => { const a = new Float32Array(N * 3); const { ri, ro, base, hs } = AR;
    for (let i = 0; i < N; i++) { let x, y; const band = rnd() < .86;
      if (band) { const r = ri + (ro - ri) * Math.pow(rnd(), .8); const L1 = hs, L2 = Math.PI * r, tot = 2 * L1 + L2, u = rnd() * tot;
        if (u < L1) { x = -r; y = base + u; } else if (u < L1 + L2) { const t = (u - L1) / r; x = -Math.cos(t) * r; y = base + hs + Math.sin(t) * r; } else { x = r; y = base + (u - L1 - L2); } }
      else { const t = rnd() * Math.PI * 2, r = ro + .2 + rnd() * 1.6; x = Math.cos(t) * r * .9; y = base + hs * .6 + Math.sin(t) * r; }
      a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = (rnd() - .5) * (band ? .35 : 1.4); }
    return a; };

  const geo = new THREE.BufferGeometry();
  const seed = new Float32Array(N), tint = new Float32Array(N); for (let i = 0; i < N; i++) { seed[i] = rnd(); tint[i] = rnd(); }
  const p0 = sphere(); geo.setAttribute('position', new THREE.BufferAttribute(p0, 3)); geo.setAttribute('p0', new THREE.BufferAttribute(p0, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1)); geo.setAttribute('tint', new THREE.BufferAttribute(tint, 1));
  const buildGlyphs = () => {
    geo.setAttribute('p1', new THREE.BufferAttribute(glyph('</>', '300 400px Newsreader, Georgia, serif', 2.4), 3));
    geo.setAttribute('p2', new THREE.BufferAttribute(glyph('AI', 'italic 300 460px Newsreader, Georgia, serif', 3.1), 3));
  };
  geo.setAttribute('p3', new THREE.BufferAttribute(arch(), 3));
  buildGlyphs();
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);
  const U = { morph: { value: 0 }, time: { value: 0 }, intro: { value: reduce ? 0 : 1 }, mouse: { value: new THREE.Vector3(99, 99, 0) }, pr: { value: R.getPixelRatio() }, scale: { value: 1 }, scroll: { value: 0 }, vel: { value: 0 } };
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: U,
    vertexShader: `
      attribute vec3 p0, p1, p2, p3; attribute float seed, tint;
      uniform float morph, time, intro, pr, scale, scroll, vel; uniform vec3 mouse;
      varying float vT, vA;
      vec3 shp(float k){ if (k < .5) return p0; if (k < 1.5) return p1; if (k < 2.5) return p2; return p3; }
      void main(){
        float m3 = min(morph, 3.0); float k = floor(clamp(m3, 0.0, 2.999)); float f = clamp(m3 - k, 0.0, 1.0);
        float g = smoothstep(0.0, 1.0, clamp((f - seed * .35) / .65, 0.0, 1.0));
        vec3 a = shp(k), b = shp(k + 1.0);
        vec3 p = mix(a, b, g);
        vec3 dir = normalize(vec3(sin(seed * 91.0), cos(seed * 57.0), sin(seed * 33.0)) + 1e-4);
        p += dir * sin(g * 3.14159) * (.7 + seed * .9);
        float rest = 1.0 - sin(g * 3.14159);
        p += vec3(sin(time * .6 + seed * 40.0), cos(time * .5 + seed * 30.0), sin(time * .4 + seed * 20.0)) * .035 * rest;
        if (morph < .5) { float a2 = time * .12; p.xz = mat2(cos(a2), -sin(a2), sin(a2), cos(a2)) * p.xz; }
        float fk = smoothstep(0.0, 1.0, clamp((morph - 3.0 - seed * .3) / .7, 0.0, 1.0));
        vec3 fp = vec3((fract(seed * 137.1) - .5) * 46.0, (fract(seed * 71.7) - .5) * 40.0, -fract(seed * 31.3) * 34.0 + 5.0);
        float depth = (fp.z + 29.0) / 34.0;
        fp.y = mod(fp.y + scroll * (.35 + depth * 1.7) + 20.0, 40.0) - 20.0;
        fp.x += sin(time * .15 + seed * 20.0) * .5; fp.y += cos(time * .12 + seed * 17.0) * .4;
        p = mix(p, fp, fk);
        p.z += sin(fk * 3.14159) * 10.0 * (.3 + seed);
        vec2 d = p.xy - mouse.xy; float dd = dot(d, d); p.xy += normalize(d + 1e-4) * exp(-dd * 1.6) * (.7 + fk * .8);
        p = mix(p, dir * (6.0 + seed * 10.0), intro * (.6 + seed * .4));
        p *= scale;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = pr * (1.2 + seed * 2.2) * (14.0 / -mv.z);
        vT = tint; vA = (.45 + .55 * (.5 + .5 * sin(time * 1.4 + seed * 60.0))) * (1.0 - intro * .6) * mix(1.0, .5, fk);
        gl_PointSize *= 1.0 + fk * min(abs(vel) * .02, 1.2) * seed;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `varying float vT, vA;
      void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard;
        vec3 gold = vec3(.92, .78, .42), ivory = vec3(.95, .93, .89), sand = vec3(.86, .8, .66);
        vec3 c = vT < .55 ? gold : (vT < .85 ? sand : ivory);
        gl_FragColor = vec4(c, smoothstep(.5, .05, d) * vA * .85); }` });
  const pts = new THREE.Points(geo, mat); group.add(pts);
  if (document.fonts && document.fonts.load) Promise.race([Promise.all([document.fonts.load('300 100px Newsreader'), document.fonts.load('italic 300 100px Newsreader')]), new Promise(r => setTimeout(r, 1500))]).then(() => { if (document.fonts.check && document.fonts.check('300 100px Newsreader')) buildGlyphs(); });

  // her, inside the arch
  const archShape = r => { const s = new THREE.Shape(); const { base, hs } = AR; s.moveTo(-r, base); s.lineTo(-r, base + hs); s.absarc(0, base + hs, r, Math.PI, 0, true); s.lineTo(r, base); s.lineTo(-r, base); return s; };
  const fillTex = (() => { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#F6E3A0'); gr.addColorStop(.6, '#E2BC63'); gr.addColorStop(1, '#B8893A'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); return new THREE.CanvasTexture(c); })();
  const fg = new THREE.ShapeGeometry(archShape(AR.ri), 48);
  { const pos = fg.attributes.position, uv = fg.attributes.uv, top = AR.base + AR.hs + AR.ri; for (let i = 0; i < pos.count; i++) uv.setXY(i, .5, (pos.getY(i) - AR.base) / (top - AR.base)); }
  const fillMat = new THREE.MeshBasicMaterial({ map: fillTex, transparent: true, opacity: 0, depthWrite: false });
  const fill = new THREE.Mesh(fg, fillMat); fill.position.z = -.25; group.add(fill);
  const pTex = new THREE.Texture(), img = new Image(); let ready = false;
  img.onload = () => { pTex.image = img; pTex.needsUpdate = true; ready = true; }; img.src = window.PORTRAIT_SRC || 'assets/haanim-portrait.webp';
  const meMat = new THREE.MeshBasicMaterial({ map: pTex, transparent: true, opacity: 0, depthWrite: false });
  const ph = AR.hs + AR.ri + .05, pw = ph * 562 / 840;
  const me = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), meMat); me.position.set(0, AR.base + ph / 2, -.1); group.add(me);
  // clip her to the arch with a stencil-free trick: draw the arch outline darker band over edges via the particles; keep her inside by scaling
  me.scale.setScalar(.98);

  let W = 1, H = 1;
  const heroPos = new THREE.Vector3(); let heroScale = 1;
  const layout = () => { W = innerWidth; H = innerHeight; R.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix();
    const vh = 2 * 14 * Math.tan(THREE.MathUtils.degToRad(17.5)), vw = vh * cam.aspect;
    if (phone()) { const s = Math.min(1, vw / 5.6, vh / (innerHeight < 720 ? 12.5 : 10.5)); heroScale = s * .92; heroPos.set(0, -vh * (innerHeight < 720 ? .1 : .15), 0); }
    else { const s = Math.min(1.05, vh / 7.6); heroScale = s; heroPos.set(Math.min(vw * .24, 4.6), -.1, 0); }
  };
  layout(); addEventListener('resize', layout);

  // pointer: stir the particles, tilt the field
  const mouse = new THREE.Vector2(9, 9); let tx = 0, ty = 0, cx = 0, cy = 0;
  const ray = new THREE.Vector3(), hit = new THREE.Vector3();
  addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mouse.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); tx = mouse.x; ty = mouse.y; }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.set(9, 9); tx = ty = 0; });
  stepBtns.forEach(b => b.addEventListener('click', () => { const st = window.__heroST; const i = +b.dataset.i; if (st) { const y = st.start + (st.end - st.start) * (i / 4.25 + (i ? .01 : 0)); window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' }); } else api.set(i); }));

  if (!reduce && window.gsap) gsap.to(U.intro, { value: 0, duration: 2.6, ease: 'expo.out', delay: .2 }); else U.intro.value = 0;
  const ui = hero.querySelector('.hero-ui');
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(frame); });
  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    morph += (target - morph) * (reduce ? 1 : .07);
    U.morph.value = morph; U.time.value = t;
    setPhaseUI(morph);
    const k4 = clamp(morph - 3), showMe = clamp((morph - 2.45) / .5) * (1 - clamp((morph - 3) / .45));
    meMat.opacity = ready ? showMe : 0; fillMat.opacity = showMe * .95;
    me.position.z = -.1 + k4 * 7; fill.position.z = -.25 + k4 * 6;
    group.position.set(heroPos.x * (1 - k4), heroPos.y * (1 - k4), 0); group.scale.setScalar(heroScale + (1 - heroScale) * k4);
    U.scroll.value = scrollY * .006; U.vel.value = window.__vel || 0;
    ui.style.opacity = (1 - clamp((morph - 3.15) / .5)).toFixed(3);
    if (mouse.x < 5) { ray.set(mouse.x, mouse.y, .5).unproject(cam).sub(cam.position).normalize(); const d = -cam.position.z / ray.z; hit.copy(cam.position).addScaledVector(ray, d); group.worldToLocal(hit); U.mouse.value.set(hit.x, hit.y, 0); } else U.mouse.value.set(99, 99, 0);
    cx += (tx - cx) * .05; cy += (ty - cy) * .05;
    group.rotation.y = cx * (.28 * (1 - showMe * .6) * (1 - k4) + .1 * k4); group.rotation.x = -cy * (.16 * (1 - showMe * .6) * (1 - k4) + .06 * k4);
    R.render(scene, cam);
    if (!document.hidden) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return api;
})();

// ---------- Toolkit sphere ----------
(() => {
  const el = document.getElementById('sphere'); if (!el || reduce) return;
  el.classList.add('live');
  const tags = [...el.querySelectorAll('span')], n = tags.length, ga = Math.PI * (3 - Math.sqrt(5));
  const base = tags.map((t, i) => { const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i; return [Math.cos(th) * r, y, Math.sin(th) * r]; });
  let ax = -.3, ay = 0, vx = 0, vy = .004, drag = false, lx = 0, ly = 0, mx = 0, my = 0, visible = false;
  el.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId); el.classList.add('grab'); });
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; if (!drag) return; vy = (e.clientX - lx) * .0016; vx = (e.clientY - ly) * .0016; lx = e.clientX; ly = e.clientY; });
  const up = () => { drag = false; el.classList.remove('grab'); }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('pointerleave', () => { mx = my = 0; });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) requestAnimationFrame(f); }).observe(el);
  function f() {
    if (!drag) { vy += ((.0035 + mx * .02 + clamp((window.__vel || 0) * .0009, -.05, .05)) - vy) * .06; vx += ((my * .012) - vx) * .03; }
    ay += vy; ax += vx; ax = clamp(ax, -1.2, 1.2);
    const R = el.clientWidth * .4, ca = Math.cos(ay), sa = Math.sin(ay), cb = Math.cos(ax), sb = Math.sin(ax);
    tags.forEach((t, i) => { let [x, y, z] = base[i]; let x1 = x * ca + z * sa, z1 = -x * sa + z * ca; let y1 = y * cb - z1 * sb, z2 = y * sb + z1 * cb; const k = (z2 + 1) / 2;
      t.style.transform = `translate(-50%, -50%) translate3d(${(x1 * R).toFixed(1)}px, ${(y1 * R).toFixed(1)}px, ${(z2 * R).toFixed(1)}px)`; t.style.opacity = (.15 + .85 * k * k).toFixed(3); t.style.zIndex = Math.round(k * 100); });
    if (visible) requestAnimationFrame(f);
  }
})();

// ---------- Project previews: one illustrated scene per project ----------
const ART = (() => {
  const S = (bg1, bg2, body) => `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="g${bg1.slice(1)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g${bg1.slice(1)})"/>${body}</svg>`;
  const serif = 'font-family="Newsreader, Georgia, serif"', sans = 'font-family="Geist, Helvetica, sans-serif"', mono = 'font-family="Geist Mono, monospace"';
  const browser = (x, y, w, h, fill = '#FBF7EE', bar = '#E9E1D1') => `<g filter="url(#sh)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}"/><path d="M${x} ${y + 10}a10 10 0 0 1 10-10h${w - 20}a10 10 0 0 1 10 10v8H${x}z" fill="${bar}"/><circle cx="${x + 12}" cy="${y + 9}" r="2.6" fill="#D9776A"/><circle cx="${x + 21}" cy="${y + 9}" r="2.6" fill="#E2B04A"/><circle cx="${x + 30}" cy="${y + 9}" r="2.6" fill="#8BA585"/></g>`;
  const phone = (x, y, w, h, fill) => `<g filter="url(#sh)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#17130F"/><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="14" fill="${fill}"/><rect x="${x + w / 2 - 14}" y="${y + 9}" width="28" height="5" rx="2.5" fill="#17130F"/></g>`;
  const shadow = '<defs><filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#000" flood-opacity=".35"/></filter></defs>';
  const lines = (x, y, n, w, gap = 10, c = '#DDD3C1') => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * gap}" width="${i === n - 1 ? w * .6 : w}" height="4" rx="2" fill="${c}"/>`).join('');
  const A = {};

  // Governance-Bound AI: a paper whose figure is an AI → human review → approved flow
  A.paper = S('#3A3122', '#16130D', shadow + `
    <g transform="rotate(-4 200 160)"><rect x="104" y="34" width="192" height="250" rx="4" fill="#FBF6EA" filter="url(#sh)"/>
      <text x="120" y="62" ${mono} font-size="7" fill="#9C7424" letter-spacing="1">PREPRINT · 2026</text>
      <text x="120" y="84" ${serif} font-size="17" fill="#1D1A16">Governance-Bound AI</text>
      ${lines(120, 96, 3, 160, 9)}
      <g transform="translate(120 136)"><rect width="44" height="30" rx="6" fill="#1D1A16"/><text x="22" y="19" ${mono} font-size="9" fill="#EBC86A" text-anchor="middle">AI</text>
        <path d="M48 15h18" stroke="#9C7424" stroke-width="1.5" marker-end="url(#ar)"/><circle cx="88" cy="9" r="6" fill="#C99D3E"/><path d="M78 30a10 9 0 0 1 20 0z" fill="#C99D3E"/>
        <path d="M106 15h16" stroke="#9C7424" stroke-width="1.5"/><circle cx="138" cy="15" r="13" fill="#E9F0E3" stroke="#6E8C6A" stroke-width="1.5"/><path d="M132 15l4 4 8-8" stroke="#4F6A4C" stroke-width="2" fill="none" stroke-linecap="round"/></g>
      <text x="120" y="186" ${mono} font-size="6.5" fill="#6B6358">FIG 1 · HUMAN-SUPERVISED REVIEW</text>
      ${lines(120, 198, 6, 160, 10)}</g>
    <g class="fl"><path d="M318 64l26 10v20c0 18-12 28-26 34-14-6-26-16-26-34V74z" fill="#EBC86A" filter="url(#sh)"/><path d="M308 96l7 7 13-14" stroke="#1D1A16" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    <defs><marker id="ar" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L6 3 0 6z" fill="#9C7424"/></marker></defs>`);

  // DiaConnect: glucose tracking + an AI assistant that flags hidden sugar
  A.dia = S('#C47A7E', '#5E2A33', shadow + `
    ${phone(140, 22, 124, 262, '#FFF7F2')}
    <text x="156" y="58" ${sans} font-size="9" font-weight="600" fill="#5E2A33">DiaConnect</text>
    <text x="156" y="78" ${serif} font-size="20" fill="#1D1A16">6.4</text><text x="186" y="78" ${mono} font-size="7" fill="#9E5A62">mmol/L</text>
    <rect x="152" y="88" width="100" height="56" rx="8" fill="#FBE9E4"/><rect x="152" y="104" width="100" height="18" fill="#E8F1E4"/>
    <polyline points="156,126 168,118 180,121 192,108 204,112 216,99 228,106 240,101 248,104" fill="none" stroke="#B5655A" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="216" cy="99" r="3" fill="#B5655A"/>
    <rect x="152" y="154" width="100" height="40" rx="10" fill="#5E2A33"/><text x="160" y="170" ${mono} font-size="6.5" fill="#F6CFC8">AI ASSISTANT</text><text x="160" y="184" ${sans} font-size="8" fill="#fff">Hidden sugar found: 12 g</text>
    <rect x="152" y="202" width="46" height="34" rx="8" fill="#FBE9E4"/><rect x="206" y="202" width="46" height="34" rx="8" fill="#FBE9E4"/>
    <text x="158" y="216" ${mono} font-size="6" fill="#9E5A62">CARBS</text><text x="158" y="229" ${serif} font-size="11" fill="#1D1A16">42 g</text>
    <text x="212" y="216" ${mono} font-size="6" fill="#9E5A62">INSULIN</text><text x="212" y="229" ${serif} font-size="11" fill="#1D1A16">4 u</text>
    <g class="fl"><rect x="62" y="70" width="58" height="58" rx="10" fill="#FFFDF8" filter="url(#sh)"/><path d="M76 86l15-8 15 8v18l-15 8-15-8z" fill="#fff" stroke="#E2CFC6" stroke-width="1.5"/><path d="M76 86l15 8 15-8M91 94v18" stroke="#E2CFC6" stroke-width="1.5" fill="none"/><text x="91" y="124" ${mono} font-size="6" fill="#9E5A62" text-anchor="middle">SUGAR</text></g>
    <g class="fl d2"><rect x="282" y="168" width="74" height="40" rx="12" fill="#EBC86A" filter="url(#sh)"/><text x="319" y="185" ${mono} font-size="6" fill="#5B3B22" text-anchor="middle">BEST OVERALL</text><text x="319" y="198" ${serif} font-size="11" fill="#1D1A16" text-anchor="middle">2025</text></g>`);

  // The Three Stars: the agency site — warm white, bold editorial type, coral accent
  A.t3s = S('#F2EDE4', '#E5DCCD', shadow + `
    ${browser(34, 26, 332, 250, '#FAF7F2', '#EAE3D8')}
    <text x="54" y="70" ${sans} font-size="9" font-weight="800" fill="#141210" letter-spacing=".5">THE THREE STARS</text>
    <circle cx="160" cy="67" r="3" fill="#F2543D"/><circle cx="169" cy="67" r="3" fill="#F2543D"/><circle cx="178" cy="67" r="3" fill="#F2543D"/>
    <text x="54" y="122" ${sans} font-size="34" font-weight="900" fill="#141210" letter-spacing="-1.5">WE BUILD</text>
    <text x="54" y="160" ${sans} font-size="34" font-weight="900" fill="#F2543D" letter-spacing="-1.5">BOLD BRANDS.</text>
    ${lines(56, 180, 2, 150, 10, '#CFC6B8')}
    <rect x="54" y="208" width="84" height="26" rx="13" fill="#141210"/><text x="96" y="225" ${sans} font-size="9" fill="#FAF7F2" text-anchor="middle">Start a project</text>
    <g class="fl"><circle cx="312" cy="222" r="34" fill="#F2543D"/><text x="312" y="218" ${sans} font-size="9" font-weight="800" fill="#FAF7F2" text-anchor="middle">CAPE</text><text x="312" y="231" ${sans} font-size="9" font-weight="800" fill="#FAF7F2" text-anchor="middle">TOWN</text></g>`);

  // Women with Vision: a non-profit — vision, community, donations
  A.wwv = S('#A9BFA3', '#4F6A4C', shadow + `
    ${browser(34, 26, 332, 250, '#FBFAF4', '#E4E9DD')}
    <text x="54" y="66" ${serif} font-size="12" fill="#2F4430">Women with Vision</text>
    <rect x="54" y="80" width="172" height="120" rx="10" fill="#E4ECDD"/>
    <path d="M78 140c22-30 102-30 124 0-22 30-102 30-124 0z" fill="#FBFAF4" stroke="#4F6A4C" stroke-width="2"/><circle cx="140" cy="140" r="18" fill="#6E8C6A"/><circle cx="140" cy="140" r="8" fill="#2F4430"/><circle cx="145" cy="135" r="3" fill="#FBFAF4"/>
    <text x="54" y="222" ${serif} font-size="15" fill="#1D2A1E">Empowering women,</text><text x="54" y="240" ${serif} font-size="15" font-style="italic" fill="#4F6A4C">changing lives.</text>
    <rect x="242" y="80" width="104" height="120" rx="10" fill="#FBFAF4" stroke="#DDE5D6"/>
    <text x="254" y="100" ${mono} font-size="6.5" fill="#6E8C6A">RAISED</text><text x="254" y="122" ${serif} font-size="18" fill="#1D2A1E">R 48 200</text>
    <rect x="254" y="132" width="80" height="6" rx="3" fill="#E4ECDD"/><rect x="254" y="132" width="56" height="6" rx="3" fill="#6E8C6A"/>
    <g class="fl"><rect x="254" y="156" width="80" height="28" rx="14" fill="#2F4430"/><text x="300" y="174" ${sans} font-size="9" fill="#fff" text-anchor="middle">Donate</text><path d="M266 166c0-3 4-4 5-1 1-3 5-2 5 1 0 3-5 6-5 6s-5-3-5-6z" fill="#E8A79D"/></g>`);

  // Drive Sure: a vehicle marketplace — listings, search, a car
  A.drive = S('#B9AE9F', '#2A2622', shadow + `
    ${browser(34, 26, 332, 250, '#F7F5F1', '#E3DED6')}
    <text x="54" y="66" ${sans} font-size="11" font-weight="700" fill="#1F1C19">Drive<tspan fill="#C99D3E">Sure</tspan></text>
    <rect x="54" y="78" width="292" height="26" rx="13" fill="#fff" stroke="#E0DAD0"/><circle cx="70" cy="91" r="5" fill="none" stroke="#8F857A" stroke-width="1.5"/><text x="82" y="94" ${sans} font-size="8" fill="#8F857A">Search make, model…</text>
    ${[0, 1, 2].map(i => `<g transform="translate(${54 + i * 99} 116)"><rect width="92" height="142" rx="8" fill="#fff" stroke="#E7E1D7"/><rect x="6" y="6" width="80" height="58" rx="6" fill="${['#E9E2D6', '#E2E6EA', '#EDE3DF'][i]}"/>
      <path d="M16 48c4-10 10-14 22-15l10-8h20c6 0 10 5 12 11 4 1 6 4 6 8v4H16z" fill="${['#3A332C', '#5B6670', '#9C3B3B'][i]}"/><circle cx="30" cy="52" r="6" fill="#1F1C19"/><circle cx="72" cy="52" r="6" fill="#1F1C19"/><circle cx="30" cy="52" r="2.4" fill="#ccc"/><circle cx="72" cy="52" r="2.4" fill="#ccc"/>
      ${lines(8, 76, 2, 60, 10, '#E2DBD0')}<text x="8" y="120" ${serif} font-size="12" fill="#1F1C19">R ${['189', '245', '132'][i]} 000</text></g>`).join('')}
    <g class="fl"><rect x="292" y="34" width="70" height="26" rx="13" fill="#C99D3E" filter="url(#sh)"/><text x="327" y="51" ${sans} font-size="8.5" fill="#1F1C19" text-anchor="middle">Sell my car</text></g>`);

  // Pinterest-style app: a masonry board of saved pins on a phone
  A.pins = S('#D9928A', '#7A2E2E', shadow + `
    ${phone(132, 18, 136, 270, '#FFFBF7')}
    <rect x="144" y="40" width="112" height="16" rx="8" fill="#F3E9E3"/><text x="154" y="51" ${sans} font-size="7" fill="#9C8378">Search ideas</text>
    ${[[144, 62, 52, 70, '#E8B4A6'], [144, 136, 52, 52, '#C9D5C2'], [144, 192, 52, 80, '#EBD3A0'], [202, 62, 54, 48, '#B9C6D3'], [202, 114, 54, 84, '#E2A79C'], [202, 202, 54, 70, '#D7C8E0']].map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${c}"/>`).join('')}
    <circle cx="170" cy="92" r="10" fill="#FFF3E8" opacity=".8"/><path d="M215 160l10-12 10 12z" fill="#FFF3E8" opacity=".8"/><circle cx="229" cy="140" r="5" fill="#FFF3E8" opacity=".8"/>
    <g class="fl"><rect x="276" y="70" width="70" height="30" rx="15" fill="#B3282D" filter="url(#sh)"/><text x="311" y="89" ${sans} font-size="10" font-weight="600" fill="#fff" text-anchor="middle">Save</text></g>
    <g class="fl d2"><rect x="50" y="170" width="74" height="54" rx="10" fill="#FFFBF7" filter="url(#sh)"/><text x="60" y="188" ${mono} font-size="6" fill="#9C3B3B">BOARD</text><text x="60" y="204" ${serif} font-size="11" fill="#1D1A16">Dream home</text><text x="60" y="216" ${sans} font-size="6.5" fill="#9C8378">24 pins</text></g>`);

  // Sugar Bakez: a small bakery — cake, cupcakes, an order button
  A.bake = S('#F2C9BE', '#B5655A', shadow + `
    ${browser(34, 26, 332, 250, '#FFF8F4', '#F3DED6')}
    <text x="54" y="70" ${serif} font-size="16" font-style="italic" fill="#8E3E3A">Sugar Bakez</text>
    <text x="54" y="112" ${serif} font-size="24" fill="#3A1F1C">Baked fresh,</text><text x="54" y="140" ${serif} font-size="24" font-style="italic" fill="#B5655A">made with love.</text>
    <rect x="54" y="160" width="88" height="28" rx="14" fill="#8E3E3A"/><text x="98" y="178" ${sans} font-size="9" fill="#fff" text-anchor="middle">Order now</text>
    <g class="fl"><ellipse cx="282" cy="236" rx="66" ry="10" fill="#E9CFC5"/><rect x="230" y="186" width="104" height="46" rx="6" fill="#F6E1C8"/><path d="M230 196c10 8 16-6 26 2s16-6 26 2 16-6 26 2 16-6 26 2v-12h-104z" fill="#F7A9A0"/><rect x="230" y="150" width="104" height="40" rx="6" fill="#FBEBDD"/><path d="M230 160c10 8 16-6 26 2s16-6 26 2 16-6 26 2 16-6 26 2v-10h-104z" fill="#fff"/>
      <rect x="279" y="124" width="6" height="26" rx="2" fill="#EBC86A"/><path d="M282 112c5 6 5 10 0 12-5-2-5-6 0-12z" fill="#F2A23C"/><circle cx="250" cy="174" r="5" fill="#C0392B"/><circle cx="314" cy="174" r="5" fill="#C0392B"/></g>`);

  // Path Align: a personality and career-path quiz — question card, a path to a goal
  A.path = S('#D6C7A6', '#5E4B2E', shadow + `
    ${browser(34, 26, 332, 250, '#FBF8F1', '#EAE2D2')}
    <text x="54" y="66" ${sans} font-size="10" font-weight="600" fill="#3A2E1C">Path Align</text><text x="292" y="66" ${mono} font-size="7" fill="#9C7424">Q 4 / 12</text>
    <rect x="54" y="74" width="292" height="4" rx="2" fill="#EDE5D4"/><rect x="54" y="74" width="98" height="4" rx="2" fill="#C99D3E"/>
    <text x="54" y="104" ${serif} font-size="15" fill="#1D1A16">I feel most energised when I…</text>
    ${['work with people', 'solve puzzles', 'create something new'].map((t, i) => `<rect x="54" y="${116 + i * 34}" width="170" height="26" rx="8" fill="${i === 1 ? '#3A2E1C' : '#fff'}" stroke="#E5DCC9"/><circle cx="68" cy="${129 + i * 34}" r="5" fill="none" stroke="${i === 1 ? '#EBC86A' : '#C9BFAE'}" stroke-width="1.5"/>${i === 1 ? `<circle cx="68" cy="${129 + 34}" r="2.4" fill="#EBC86A"/>` : ''}<text x="80" y="${132 + i * 34}" ${sans} font-size="8.5" fill="${i === 1 ? '#FBF8F1' : '#3A2E1C'}">${t}</text>`).join('')}
    <g class="fl"><path d="M248 240c20 0 14-34 40-34s14-40 44-40" fill="none" stroke="#C99D3E" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/><circle cx="248" cy="240" r="6" fill="#3A2E1C"/><path d="M332 166v-34" stroke="#3A2E1C" stroke-width="2"/><path d="M333 132h20l-6 7 6 7h-20z" fill="#C99D3E"/></g>`);

  // EdVance: an AI-in-education deck on Azure — a cap over a small neural network
  A.edv = S('#8FA3B4', '#2E4356', shadow + `
    <rect x="44" y="40" width="312" height="196" rx="10" fill="#F7F9FB" filter="url(#sh)"/>
    <text x="66" y="78" ${mono} font-size="7" fill="#3F5568" letter-spacing="1">AZURE AI · EDUCATION</text>
    <text x="66" y="110" ${serif} font-size="30" fill="#14202B">EdVance</text>
    ${lines(66, 126, 3, 120, 11, '#D8E0E7')}
    <g class="fl" transform="translate(250 140)">${[[-46, -40], [-46, 0], [-46, 40], [0, -22], [0, 22], [46, 0]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#3F5568"/>`).join('')}
      <path d="M-46-40L0-22M-46 0L0-22M-46 0L0 22M-46 40L0 22M-46-40L0 22M0-22L46 0M0 22L46 0" stroke="#7C8FA0" stroke-width="1.2"/>
      <path d="M46-26l-30-12 30-12 30 12z" fill="#14202B"/><path d="M28-34v10c0 4 36 4 36 0v-10" fill="#14202B"/><path d="M76-38v14" stroke="#EBC86A" stroke-width="2"/><circle cx="76" cy="-22" r="3" fill="#EBC86A"/></g>`);

  // Hamilton Naki: a tribute deck — a heart and an ECG line (heart-transplant research)
  A.naki = S('#B88E6C', '#4A2E18', shadow + `
    <rect x="44" y="40" width="312" height="196" rx="10" fill="#FBF6EE" filter="url(#sh)"/>
    <text x="66" y="78" ${mono} font-size="7" fill="#8A5A3B" letter-spacing="1">A TRIBUTE</text>
    <text x="66" y="108" ${serif} font-size="26" fill="#2A1A0E">Hamilton Naki</text>
    ${lines(66, 124, 3, 130, 11, '#E6D9C6')}
    <polyline points="66,196 120,196 130,180 140,214 152,166 162,196 334,196" fill="none" stroke="#B5655A" stroke-width="2.2" stroke-linejoin="round"/>
    <g class="fl"><path d="M290 106c0-14 18-18 24-6 6-12 24-8 24 6 0 18-24 32-24 32s-24-14-24-32z" fill="#C0392B"/><path d="M302 102c2-6 8-8 12-4" stroke="#F5B7A8" stroke-width="2" fill="none" stroke-linecap="round"/></g>`);

  // The Future of Work: people and AI side by side
  A.fow = S('#C9B27E', '#5E4A1E', shadow + `
    <rect x="44" y="40" width="312" height="196" rx="10" fill="#FBF7EC" filter="url(#sh)"/>
    <text x="66" y="78" ${mono} font-size="7" fill="#8A6A1E" letter-spacing="1">2025 AND BEYOND</text>
    <text x="66" y="106" ${serif} font-size="22" fill="#2A2210">The Future</text><text x="66" y="128" ${serif} font-size="22" font-style="italic" fill="#9C7424">of Work</text>
    ${lines(66, 144, 3, 110, 11, '#E8DEC6')}
    <g class="fl"><rect x="222" y="120" width="108" height="66" rx="6" fill="#2A2210"/><rect x="228" y="126" width="96" height="54" rx="3" fill="#FBF7EC"/><path d="M212 186h128l-8 10H220z" fill="#5E4A1E"/>
      <circle cx="252" cy="148" r="9" fill="#C99D3E"/><path d="M240 172a12 10 0 0 1 24 0z" fill="#C99D3E"/>
      <rect x="282" y="138" width="26" height="22" rx="5" fill="#2A2210"/><circle cx="290" cy="149" r="2.5" fill="#EBC86A"/><circle cx="300" cy="149" r="2.5" fill="#EBC86A"/><path d="M295 138v-6" stroke="#2A2210" stroke-width="2"/><circle cx="295" cy="131" r="2.5" fill="#2A2210"/>
      <path d="M266 152h12" stroke="#9C7424" stroke-width="1.5" stroke-dasharray="2 3"/></g>`);

  // Power Track: energy monitoring — a bolt, a gauge and a usage chart
  A.power = S('#E2BC63', '#6E4A0E', shadow + `
    <rect x="44" y="40" width="312" height="196" rx="10" fill="#FFFBF0" filter="url(#sh)"/>
    <text x="66" y="78" ${mono} font-size="7" fill="#8A6414" letter-spacing="1">ENERGY</text>
    <text x="66" y="108" ${serif} font-size="26" fill="#2A1E06">Power Track</text>
    ${[38, 58, 30, 70, 46, 82, 54].map((h, i) => `<rect x="${68 + i * 20}" y="${214 - h}" width="12" height="${h}" rx="3" fill="${i === 5 ? '#C99D3E' : '#EBDDB6'}"/>`).join('')}
    <g class="fl"><path d="M262 196a44 44 0 0 1 88 0" fill="none" stroke="#EBDDB6" stroke-width="10" stroke-linecap="round"/><path d="M262 196a44 44 0 0 1 66-38" fill="none" stroke="#C99D3E" stroke-width="10" stroke-linecap="round"/><path d="M306 196l20-26" stroke="#2A1E06" stroke-width="3" stroke-linecap="round"/><circle cx="306" cy="196" r="5" fill="#2A1E06"/>
      <path d="M312 70l-22 34h16l-8 26 26-38h-17z" fill="#2A1E06"/></g>`);

  // Intern Profiles: a deck of people cards
  A.interns = S('#B7A99C', '#4A3D32', shadow + `
    <rect x="44" y="40" width="312" height="196" rx="10" fill="#FAF7F2" filter="url(#sh)"/>
    <text x="66" y="76" ${mono} font-size="7" fill="#6E5A4A" letter-spacing="1">MEET THE TEAM</text>
    <text x="66" y="102" ${serif} font-size="22" fill="#2A2018">Intern Profiles</text>
    <g class="fl">${[0, 1, 2].map(i => `<g transform="translate(${70 + i * 92} 118)"><rect width="80" height="100" rx="8" fill="#fff" stroke="#E7DFD4"/><circle cx="40" cy="30" r="15" fill="${['#C99D3E', '#8BA585', '#C27A72'][i]}"/><path d="M22 60a18 14 0 0 1 36 0z" fill="${['#C99D3E', '#8BA585', '#C27A72'][i]}" opacity=".7"/>${lines(14, 70, 2, 52, 9, '#E4DBCF')}</g>`).join('')}</g>`);

  // Drupal: a content-management deck — page-builder blocks
  A.cms = S('#A1AFA3', '#33413A', shadow + `
    <rect x="44" y="40" width="312" height="196" rx="10" fill="#F7F9F7" filter="url(#sh)"/>
    <text x="66" y="76" ${mono} font-size="7" fill="#3E4B40" letter-spacing="1">CONTENT MANAGEMENT</text>
    <text x="66" y="104" ${serif} font-size="26" fill="#1C2620">Drupal</text>
    ${lines(66, 120, 3, 110, 11, '#DCE3DD')}
    <g class="fl">${[[214, 70, 120, 34, '#3E4B40'], [214, 110, 56, 50, '#8D9A8E'], [276, 110, 58, 50, '#C9D3CA'], [214, 166, 120, 40, '#E2E8E3']].map(([x, y, w, h, c], i) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${c}"/><g fill="${i ? '#3E4B40' : '#C9D3CA'}" opacity=".6">${[0, 1, 2].map(k => `<circle cx="${x + 8}" cy="${y + 10 + k * 5}" r="1.2"/><circle cx="${x + 12}" cy="${y + 10 + k * 5}" r="1.2"/>`).join('')}</g>`).join('')}
      <text x="226" y="92" ${mono} font-size="9" fill="#EBC86A">&lt;/&gt; header</text></g>`);

  return A;
})();

// ---------- Work ring (scroll turns it) ----------
const Ring = (() => {
  const ITEMS = [
    ['writing', 'Governance-Bound AI', 'Preprint · Research Square 2026', 'My first paper: a human-supervised AI for medicines reliance review.', 'https://doi.org/10.21203/rs.3.rs-10090979/v1', 'paper', '#E9DCC0', '#C99D3E'],
    ['project', 'DiaConnect', 'Health AI · Best Overall 2025', 'Diabetes tracking with an AI assistant and hidden-sugar detection.', 'https://github.com/HaanimP/DiaConnectFinal.git', 'dia', '#B76A6E', '#E0A39C'],
    ['project', 'The Three Stars', 'Agency · Co-founder', 'The Cape Town digital agency I co-founded.', 'https://t3s-ten.vercel.app/', 't3s', '#D8B055', '#1F1B14'],
    ['project', 'Women with Vision', 'Non-profit · Website', 'A non-profit\'s home on the web, with donations.', 'https://womenwithvision.netlify.app/home', 'wwv', '#8BA585', '#4F6A4C'],
    ['project', 'Drive Sure', 'Web app · Marketplace', 'A marketplace web app.', 'https://drive-sure-lyart.vercel.app/', 'drive', '#9E8F7B', '#2A2622'],
    ['project', 'Pinterest App', 'Mobile · C#', 'A Pinterest-style mobile app.', 'https://github.com/HaanimP/Pinterest-App-Assignment.git', 'pins', '#C27A72', '#9C3B3B'],
    ['project', 'Sugar Bakez', 'Small business · Website', 'A website for a small bakery.', 'https://sugarbakez.netlify.app/', 'bake', '#E3B5A4', '#B5655A'],
    ['project', 'Path Align', 'Education · Web app', 'An education web platform.', 'https://personatest.lcstudio-incubate.co.za/', 'path', '#C8B48E', '#6E5A3A'],
    ['slides', 'EdVance', 'Presentation · Azure AI', 'A presentation on EdVance and Azure AI.', 'https://www.canva.com/design/DAGgAngASrE/5y5qGX709No7l07z7lEhbw/view', 'edv', '#7C8FA0', '#3F5568'],
    ['slides', 'Hamilton Naki', 'Presentation', 'A presentation on Hamilton Naki.', 'https://www.canva.com/design/DAGhUu6uC4Q/h6CnfVWGW5uX0YSy6_KaFw/view', 'naki', '#A98463', '#5B3B22'],
    ['slides', 'The Future of Work', 'Presentation', 'A presentation on the future of work.', 'https://www.canva.com/design/DAGhCOQ_nO0/2QmZqIVg4avjXP07BERAAg/view', 'fow', '#B9A06E', '#6A5428'],
    ['slides', 'Power Track', 'Presentation · Energy', 'A presentation on Power Track.', 'https://www.canva.com/design/DAGPyv-jw5w/2mlLOLek20Yq6UkLWdDijg/view', 'power', '#D2A54B', '#7A5414'],
    ['slides', 'Intern Profiles', 'Presentation', 'A presentation of intern profiles.', 'https://www.canva.com/design/DAGP9qSbvXk/scjmbZdE2ytNvz4CtfFdDg/view', 'interns', '#A7988B', '#544539'],
    ['slides', 'Drupal', 'Presentation · CMS', 'A presentation on Drupal.', 'https://www.canva.com/design/DAGMVXxqV10/cTtxqBV297KnAFiyzTEihQ/view', 'cms', '#8D9A8E', '#3E4B40']
  ];
  const F = [['all', 'All'], ['project', 'Projects'], ['writing', 'Writing'], ['slides', 'Presentations']];
  const fb = document.getElementById('filters'), ring = document.getElementById('ring3d'), stage = document.getElementById('stage'), count = document.getElementById('count');
  fb.innerHTML = F.map(([k, l]) => `<button type="button" data-k="${k}" aria-pressed="${k === 'all'}">${l}<span>${k === 'all' ? ITEMS.length : ITEMS.filter(x => x[0] === k).length}</span></button>`).join('');
  const mock = k => ART[k] || '';
  let list = ITEMS, pos = 0, step = 0, radius = 0, cw = 300, st = null, tilt = 0;
  const n = () => list.length;
  const geometry = () => { cw = innerWidth < 600 ? Math.min(250, stage.clientWidth * .66) : Math.min(310, Math.max(230, stage.clientWidth * .24)); cw = Math.min(cw, (stage.clientHeight - 24) / 1.42); ring.style.setProperty('--cw', cw + 'px'); ring.classList.toggle('compact', cw < 230); const k = Math.max(n(), 6); step = 360 / k; radius = Math.round((cw / 2 + 18) / Math.tan(Math.PI / k)); };
  const place = () => ring.querySelectorAll('.wcard').forEach((c, i) => { c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`; });
  const render = (extra = 0) => {
    ring.style.transform = `translateZ(${-radius}px) rotateX(${tilt.toFixed(2)}deg) rotateY(${(-pos * step + extra).toFixed(2)}deg)`;
    const N = n(), idx = ((Math.round(pos) % N) + N) % N;
    ring.querySelectorAll('.wcard').forEach((c, i) => { const d = Math.min(Math.abs(i - idx), N - Math.abs(i - idx)); c.classList.toggle('front', d === 0); c.classList.toggle('dim', d >= 1); c.tabIndex = d === 0 ? 0 : -1; });
    count.innerHTML = `<b>${String(idx + 1).padStart(2, '0')}</b> / ${String(N).padStart(2, '0')}`;
  };
  const goTo = i => {
    if (st) { i = clamp(i, 0, n() - 1); const y = st.start + (st.end - st.start) * (n() > 1 ? i / (n() - 1) : 0) + 1; window.__lenis ? window.__lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: 'smooth' }); }
    else { pos = i; render(); }
  };
  const build = () => {
    ring.innerHTML = list.map(([k, t, tag, d, u, m, a1, a2]) => `<a class="wcard" href="${u}" target="_blank" rel="noopener" style="--a1:${a1};--a2:${a2}"><span class="shot">${mock(m)}</span><span class="info"><span class="mono">${tag}</span><h3>${t}</h3><p>${d}</p><span class="go">Open ↗</span></span></a>`).join('');
    pos = 0; geometry(); place(); render();
  };
  fb.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; fb.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); list = b.dataset.k === 'all' ? ITEMS : ITEMS.filter(x => x[0] === b.dataset.k); build(); if (st) { ScrollTrigger.refresh(); goTo(0); } });
  document.getElementById('prev').addEventListener('click', () => goTo(Math.round(pos) - 1));
  document.getElementById('next').addEventListener('click', () => goTo(Math.round(pos) + 1));
  let sx = 0, dx = 0, down = false, moved = false;
  stage.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; dx = 0; });
  addEventListener('pointermove', e => { if (!down) return; dx = e.clientX - sx; if (Math.abs(dx) > 6) { moved = true; stage.classList.add('dragging'); render(dx * .18); } });
  addEventListener('pointerup', () => { if (!down) return; down = false; stage.classList.remove('dragging'); if (moved) { const i = Math.round(pos - dx * .18 / step); render(); goTo(i); } });
  ring.addEventListener('click', e => { const c = e.target.closest('.wcard'); if (!c) return; if (moved) { e.preventDefault(); return; } if (!c.classList.contains('front')) { e.preventDefault(); const i = [...ring.children].indexOf(c); if (st) goTo(i); else { const N = n(); let d = ((i - Math.round(pos)) % N + N) % N; if (d > N / 2) d -= N; goTo(Math.round(pos) + d); } } });
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') goTo(Math.round(pos) - 1); if (e.key === 'ArrowRight') goTo(Math.round(pos) + 1); });
  addEventListener('resize', () => { geometry(); place(); render(); });
  build();
  return { attach(t) { st = t; stage.classList.add('scrolly'); }, progress(p, vel) { pos = p * (n() - 1); tilt = clamp((vel || 0) * -.004, -8, 8); render(); }, len: n };
})();

// ---------- Research stack tilt ----------
(() => {
  const s = document.getElementById('pstack'); if (!s || !fine || reduce) return;
  const host = s.parentElement;
  host.addEventListener('pointermove', e => { const r = s.getBoundingClientRect(), x = clamp((e.clientX - r.left) / r.width, -.5, 1.5) - .5, y = clamp((e.clientY - r.top) / r.height, -.5, 1.5) - .5; s.style.setProperty('--tx', (x * 26).toFixed(1) + 'deg'); s.style.setProperty('--ty', (-y * 20).toFixed(1) + 'deg'); s.classList.add('tilting'); });
  host.addEventListener('pointerleave', () => { s.style.setProperty('--tx', '0deg'); s.style.setProperty('--ty', '0deg'); s.classList.remove('tilting'); });
})();

// ---------- Journey ----------
(() => {
  const E = [
    ['Aug 2026', 'Now', 'AI Engineer Intern', 'UWC <span class="amp">&amp;</span> NetCampus', 'Hands-on applied AI with NetCampus\'s AI engineering programme: building, deploying and evaluating AI on Azure, with real-time projects for clients.', [], 1],
    ['Dec 2025', 'Now', 'Software Development Intern', 'School of Pharmacy, UWC · Gates Foundation', 'Workflow logic and stakeholder communication for RAiA, and co-author of its first paper.', [], 1],
    ['Nov 2024', 'May 2025', 'Web Designer <span class="amp">&amp;</span> Team Lead', 'The Three Stars · co-founder', 'Client sites, the team\'s delivery rhythm, and the agency\'s brand.', []],
    ['Oct 2024', 'Nov 2024', 'Assistant Lecturer', 'LC Studio', 'Student check-ins, learner progress and software fundamentals.', []],
    ['Apr 2024', 'Nov 2024', 'Software Engineer Intern', 'LC Studio', 'Linux, Python and C++, Scrum collaboration and prototypes.', []]
  ];
  const S = [
    ['Mar 2025', 'Nov 2025', 'Software Development', 'UWC Future Innovation Lab, powered by Samsung', 'Full-stack and mobile development, from first principles to a final project.', ['Summa Cum Laude', 'Top Student', 'Best Overall Technical Project']],
    ['Sep 2023', 'Mar 2024', 'Certificate of Excellence, Web Development', 'Life Choices Academy', 'HTML, CSS, JavaScript and modern frameworks.', []],
    ['2018', '2022', 'National Senior Certificate', 'South Peninsula High School', 'The foundation for studies in technology.', []]
  ];
  const card = ([a, b, t, o, d, aw, now]) => `<article class="jcard"><span class="when"><span>${a} – ${b}</span>${now ? '<b>Current</b>' : ''}</span><h4>${t}</h4><span class="org">${o}</span><p>${d}</p>${aw.length ? `<span class="award">${aw.map(x => `<span>${x}</span>`).join('')}</span>` : ''}</article>`;
  document.getElementById('exp').innerHTML = E.map(card).join('');
  document.getElementById('edu').innerHTML = S.map(card).join('');
})();

// ---------- Beyond the code: fly through what I stand for ----------
const Tunnel = (() => {
  const sec = document.getElementById('beyond'), tun = document.getElementById('tunnel'), q = document.getElementById('advq');
  const walk = n => [...n.childNodes].forEach(c => { if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) { f.append(w); return; } const s = document.createElement('span'); s.className = 'w'; s.textContent = w; f.append(s); }); c.replaceWith(f); } else walk(c); });
  walk(q); const ws = [...q.querySelectorAll('.w')];
  const lis = [...tun.querySelectorAll('li')], N = lis.length, SP = 210;
  const light = p => { const k = Math.round(clamp(p) * ws.length); ws.forEach((w, i) => w.classList.toggle('lit', i < k)); };
  if (!hasG) { ws.forEach(w => w.classList.add('lit')); return { on: false }; }
  sec.classList.add('tun');
  const place = p => {
    const W = tun.clientWidth, H = tun.clientHeight, small = W < 700;
    const RX = small ? W * .62 : W * .4, RY = small ? H * .36 : H * .36;
    const travel = p * (N * SP + 900);
    lis.forEach((li, i) => {
      const a = i * 2.39996 + p * 1.6, r = .78 + (i % 3) * .14;
      const z = -i * SP - 300 + travel;
      let o = clamp((z + 2100) / 1000); if (z > 120) o *= clamp(1 - (z - 120) / 340);
      li.style.transform = `translate(-50%, -50%) translate3d(${(Math.cos(a) * RX * r).toFixed(1)}px, ${(Math.sin(a) * RY * r).toFixed(1)}px, ${Math.min(z, 520).toFixed(1)}px)`;
      li.style.opacity = o.toFixed(3); li.style.visibility = o < .01 ? 'hidden' : 'visible';
    });
    light(p * 3);
  };
  place(0);
  return { on: true, place, count: N };
})();

// ---------- Kind words ----------
(() => {
  const sec = document.getElementById('words'), row = document.getElementById('kwRow'), cards = [...row.querySelectorAll('.kwc')], dots = document.getElementById('kwDots');
  cards.forEach(c => { const q = c.querySelector('blockquote'); let i = 0; q.innerHTML = q.textContent.split(/(\s+)/).map(w => /^\s+$/.test(w) || !w ? w : `<span class="w" style="--i:${i++}">${w}</span>`).join(''); });
  if (reduce || !('IntersectionObserver' in window)) sec.classList.add('seen');
  else new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { sec.classList.add('seen'); o.disconnect(); } }), { threshold: .25 }).observe(row);
  dots.innerHTML = cards.map((_, i) => `<button type="button" aria-label="Show testimonial ${i + 1}"></button>`).join('');
  const db = [...dots.children];
  db.forEach((b, i) => b.addEventListener('click', () => { const c = cards[i]; row.scrollTo({ left: c.offsetLeft - (row.clientWidth - c.clientWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); }));
  // phones and tablets: a coverflow you swipe through
  const flow = () => {
    if (innerWidth >= 1000) { cards.forEach(c => { c.style.transform = ''; c.style.opacity = ''; }); return; }
    const mid = row.scrollLeft + row.clientWidth / 2; let best = 0, bd = 1e9;
    cards.forEach((c, i) => { const d = (c.offsetLeft + c.clientWidth / 2 - mid) / c.clientWidth, a = Math.min(Math.abs(d), 1.4);
      if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; }
      if (!reduce) { c.style.transform = `rotateY(${(-d * 32).toFixed(2)}deg) translateZ(${(-a * 110).toFixed(1)}px) scale(${(1 - a * .06).toFixed(3)})`; c.style.opacity = (1 - a * .45).toFixed(3); } });
    db.forEach((b, i) => b.classList.toggle('on', i === best));
  };
  let raf = 0; row.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(flow); }, { passive: true });
  addEventListener('resize', flow); flow();
  // desktop: the card under the pointer turns to face you
  if (fine && !reduce) cards.forEach(c => c.addEventListener('pointermove', e => { if (innerWidth < 1000) return; const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `translateZ(70px) translateY(-10px) rotateY(${(x * 10).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg)`; }));
  cards.forEach(c => c.addEventListener('pointerleave', () => { if (innerWidth >= 1000) c.style.transform = ''; }));
})();

// ---------- Contact ----------
(() => {
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => { const t = b.textContent; const done = m => { b.textContent = m; setTimeout(() => b.textContent = t, 1800); }; try { navigator.clipboard.writeText(b.dataset.copy).then(() => done('Copied'), () => done('Copy didn\'t work')); } catch (x) { done('Copy didn\'t work'); } }));
  document.querySelectorAll('.ct-list li').forEach(li => li.addEventListener('pointermove', e => { const r = li.getBoundingClientRect(); li.style.setProperty('--gx', (e.clientX - r.left) + 'px'); li.style.setProperty('--gy', (e.clientY - r.top) + 'px'); }));
  const t = () => { try { document.getElementById('ctTime2').textContent = new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' }).format(new Date()) + ' SAST'; } catch (e) {} };
  t(); setInterval(t, 15000);
})();

// ---------- Why glow ----------
document.querySelectorAll('.why article').forEach(a => a.addEventListener('pointermove', e => { const r = a.getBoundingClientRect(); a.style.setProperty('--gx', (e.clientX - r.left) + 'px'); a.style.setProperty('--gy', (e.clientY - r.top) + 'px'); }));

// ---------- Tilt ----------
(() => {
  if (!fine || reduce) return;
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.setProperty('--tx', (x * 10).toFixed(2) + 'deg'); el.style.setProperty('--ty', (-y * 8).toFixed(2) + 'deg'); el.style.setProperty('--gx', ((x + .5) * 100).toFixed(1) + '%'); el.style.setProperty('--gy', ((y + .5) * 100).toFixed(1) + '%'); el.classList.add('tilting'); });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--tx', '0deg'); el.style.setProperty('--ty', '0deg'); el.classList.remove('tilting'); });
  });
})();

// ---------- Count-up ----------
(() => {
  if (reduce) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; io.unobserve(e.target); const el = e.target, to = +el.dataset.count, t0 = performance.now(); const f = n => { const p = Math.min(1, (n - t0) / 1300); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + '+'; if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }), { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
})();

// ---------- Motion ----------
(() => {
  const split = (h, cls = 'wi') => { const walk = n => [...n.childNodes].forEach(c => { if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) { f.append(w); return; } const m = document.createElement('span'), i = document.createElement('span'); m.className = 'wm'; i.className = cls; i.textContent = w; m.append(i); f.append(m); }); c.replaceWith(f); } else if (c.nodeType === 1) walk(c); }); walk(h); return h.querySelectorAll('.' + cls); };
  const heroWords = split(document.getElementById('heroTitle'));
  const hero = document.getElementById('home');
  if (!hasG) { document.body.classList.remove('intro'); return; }
  let vel = 0;
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: .085 }); window.__lenis = lenis;
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', e => { ScrollTrigger.update(); vel = e.velocity || 0; window.__vel = vel; });
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href'), el = document.querySelector(id); if (!el) return; e.preventDefault(); lenis.scrollTo(id === '#home' ? 0 : el, { offset: id === '#work' ? 0 : -70, duration: 1.8 }); }));
    const sheet = document.getElementById('sheet');
    new MutationObserver(() => sheet.classList.contains('on') ? lenis.stop() : lenis.start()).observe(sheet, { attributes: true, attributeFilter: ['class'] });
  } else addEventListener('scroll', () => { window.__vel = 0; }, { passive: true });
  const small = () => innerWidth < 900;
  document.body.classList.remove('intro');
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.hero .eyebrow', { y: 14, opacity: 0, duration: 1 }, .5)
    .from(heroWords, { yPercent: 115, rotationX: -80, transformPerspective: 600, transformOrigin: '50% 100%', duration: 1.4, stagger: .08 }, .6)
    .from('.hero .phase.on, .hero .ctas, .hero-foot', { y: 18, opacity: 0, duration: 1.1, stagger: .1, clearProps: 'transform,opacity' }, 1);

  // 1 · the hero field takes shape, then bursts out into the page
  window.__heroST = ScrollTrigger.create({ trigger: hero, start: 'top top', end: () => '+=' + (small() ? 330 : 420) + '%', pin: true, scrub: true, refreshPriority: 3, onUpdate: s => Hero.set(Math.min(4, s.progress * 4.25)) });

  // headings turn up towards you, word by word
  document.querySelectorAll('.h2').forEach(h => gsap.from(split(h), { yPercent: 110, rotationX: -85, transformPerspective: 500, transformOrigin: '50% 100%', duration: 1.3, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: h, start: 'top 88%' } }));

  // each section tips up out of the page as it arrives
  ['#about', '#kit', '#journey'].forEach(id => { const w = document.querySelector(id + ' > .wrap'); if (!w) return; gsap.fromTo(w, { rotationX: 16, y: 120, transformPerspective: 1800, transformOrigin: '50% 0%' }, { rotationX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: id, start: 'top bottom', end: 'top 25%', scrub: true } }); });

  // about: the statement folds up word by word as you read
  const big = document.querySelector('.about .big');
  if (big) { const ws = split(big, 'fw'); gsap.fromTo(ws, { opacity: .1, rotationX: 75, transformPerspective: 500, transformOrigin: '50% 100%' }, { opacity: 1, rotationX: 0, stagger: .1, ease: 'none', scrollTrigger: { trigger: big, start: 'top 85%', end: 'bottom 50%', scrub: true } }); }

  // three cards fan out of a stack
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1081px)', () => { gsap.fromTo('.why article', { rotationY: i => [38, 0, -38][i], rotationX: 18, z: -320, x: i => [260, 0, -260][i], opacity: .15, transformPerspective: 1300 }, { rotationY: 0, rotationX: 0, z: 0, x: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '#why', start: 'top 98%', end: 'top 40%', scrub: .6 } }); });
  mm.add('(max-width: 1080px)', () => { document.querySelectorAll('.why article').forEach(c => gsap.fromTo(c, { rotationX: -60, z: -200, opacity: 0, transformPerspective: 1100, transformOrigin: '50% 0%' }, { rotationX: 0, z: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: c, start: 'top 98%', end: 'top 65%', scrub: .5 } })); });

  gsap.from('.desk article', { x: 40, rotationY: -30, transformPerspective: 900, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.desk', start: 'top 85%' } });

  // 2 · the work ring turns as you scroll
  const work = document.getElementById('work');
  const wst = ScrollTrigger.create({ trigger: work, start: 'top top', end: () => '+=' + Math.max(140, Ring.len() * (small() ? 34 : 40)) + '%', pin: true, scrub: .4, refreshPriority: 2, snap: { snapTo: v => { const n = Ring.len() - 1; return n > 0 ? Math.round(v * n) / n : 0; }, duration: { min: .25, max: .6 }, delay: .12, ease: 'power2.inOut' }, onUpdate: s => Ring.progress(s.progress, vel) });
  Ring.attach(wst);
  gsap.from('.stage', { rotationX: 30, z: -300, opacity: 0, transformPerspective: 1400, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: work, start: 'top 70%' } });

  // research: the paper stack opens out
  const ps = document.getElementById('pstack');
  if (ps) { const sh = ps.querySelectorAll('.sheet3d'); const t2 = gsap.timeline({ scrollTrigger: { trigger: '.paper', start: 'top 90%', end: 'bottom 25%', scrub: .6 } });
    t2.fromTo(ps, { '--sy': '-45deg', '--sx': '25deg' }, { '--sy': '22deg', '--sx': '-6deg', ease: 'none' }, 0).fromTo(sh[0], { '--z': -20 }, { '--z': -170, ease: 'none' }, 0).fromTo(sh[1], { '--z': -10 }, { '--z': -60, ease: 'none' }, 0).fromTo(sh[2], { '--z': 0 }, { '--z': 110, ease: 'none' }, 0); }
  gsap.from('.paper', { y: 80, rotationX: 20, transformPerspective: 1600, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.paper', start: 'top 88%' } });

  // journey: cards fly in from depth, from either side
  document.querySelectorAll('.col-exp .jcard, .col-edu .jcard').forEach(c => { const left = !!c.closest('.col-exp');
    gsap.fromTo(c, { z: -700, rotationY: small() ? 0 : (left ? 35 : -35), rotationX: 20, opacity: 0, transformPerspective: 1400 }, { z: 0, rotationY: 0, rotationX: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: c, start: 'top 102%', end: 'top 62%', scrub: .5 } }); });

  // 3 · beyond the code: fly through what I stand for
  if (Tunnel.on) ScrollTrigger.create({ trigger: '#beyond', start: 'top top', end: () => '+=' + Tunnel.count * (small() ? 11 : 13) + '%', pin: true, scrub: .3, refreshPriority: 1, onUpdate: s => Tunnel.place(s.progress) });

  // kind words: the row of cards swings up into place
  gsap.from('.kw-row', { rotationX: 45, z: -400, y: 80, opacity: 0, transformPerspective: 1400, transformOrigin: '50% 100%', duration: 1.6, ease: 'expo.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '#words', start: 'top 75%' } });

  // contact: the card flips in, the form rises, the links lift into place
  gsap.from('.ct-list li', { y: 80, rotationX: -50, transformOrigin: '50% 0%', transformPerspective: 1100, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .1, clearProps: 'transform', scrollTrigger: { trigger: '.ct-list', start: 'top 88%' } });
  gsap.from('#contact .socials li', { y: 40, rotationY: 180, scale: .6, transformPerspective: 700, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '#contact .socials', start: 'top 92%' } });
  addEventListener('load', () => ScrollTrigger.refresh());
})();
