// Ultra-premium interactions: three.js hero, gsap scenes, tilt, magnetic buttons, responsive perf.

document.addEventListener('DOMContentLoaded', () => {
  // DOM refs
  const preloader = document.getElementById('preloader');
  const yearEl = document.getElementById('year');
  const themeToggle = document.getElementById('themeToggle');
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  const customCursor = document.querySelector('.custom-cursor');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalText = document.getElementById('modalText');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Remove preloader after minimal work
  setTimeout(() => preloader?.remove(), 700);

  // Adaptive performance: detect low-power device or mobile
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 1;
  const lowPerf = navigator.deviceMemory && navigator.deviceMemory <= 2;
  const reduceFX = isTouch || lowPerf || window.devicePixelRatio > 2 ? true : false;

  // ---------------- THREE.JS HERO (soft blobs + particles) ----------------
  (function initThree() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || !window.THREE) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !reduceFX, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 60);

    // lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const p1 = new THREE.PointLight(0xffe6b3, 0.9, 200);
    p1.position.set(60, 40, 40);
    const p2 = new THREE.PointLight(0xbfa2c6, 0.5, 200);
    p2.position.set(-40, -30, -20);
    scene.add(ambient, p1, p2);

    // stars (points)
    const starCount = reduceFX ? 120 : 360;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) positions[i] = (Math.random() - 0.5) * 800;
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMat = new THREE.PointsMaterial({ size: reduceFX ? 0.5 : 0.9, color: 0xffffff, transparent: true, opacity: 0.08 });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // soft blobs
    function createBlob(size, color, x, y, z) {
      const geo = new THREE.IcosahedronGeometry(size, 5);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.25,
        transparent: true,
        opacity: 0.98,
        emissive: color,
        emissiveIntensity: 0.02
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      return m;
    }
    const blob1 = createBlob(14, 0xb57ea4, 28, -6, -10);
    const blob2 = createBlob(10, 0xa1b0d6, -18, 8, -6);
    scene.add(blob1, blob2);

    // resize handling
    function onResize() {
      const w = canvas.clientWidth || innerWidth;
      const h = canvas.clientHeight || innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize, { passive: true });
    onResize();

    // subtle mouse parallax for camera
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * -2;
    }, { passive: true });

    // animate
    let t = 0;
    function animate() {
      t += 0.004;
      stars.rotation.y = t * 0.2;
      blob1.rotation.y = t * 0.6;
      blob1.position.y = Math.sin(t * 0.9) * 1.3;
      blob2.rotation.y = -t * 0.4;
      blob2.position.y = Math.cos(t * 0.7) * 1.1;

      // camera parallax
      camera.position.x += (mouseX * 6 - camera.position.x) * 0.06;
      camera.position.y += (mouseY * 4 - camera.position.y) * 0.06;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
  })();

  // ---------------- CUSTOM CURSOR (desktop) ----------------
  if (!isTouch) {
    document.addEventListener('mousemove', (e) => {
      if (customCursor) {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
      }
    }, { passive: true });

    // enlarge on interactive elements
    document.querySelectorAll('a, button, .btn, .project-card, .icon-btn').forEach(el => {
      el.addEventListener('mouseenter', () => customCursor && (customCursor.style.transform = 'translate(-50%,-50%) scale(1.8)'));
      el.addEventListener('mouseleave', () => customCursor && (customCursor.style.transform = 'translate(-50%,-50%) scale(1)'));
    });
  }

  // ---------------- MAGNETIC BUTTONS & TILT CARDS ----------------
  function magneticEffect(el) {
    if (isTouch) return;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      const tx = dx * 10;
      const ty = dy * 10;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  }
  document.querySelectorAll('.magnetic').forEach(magneticEffect);

  // tilt for project cards
  document.querySelectorAll('.project-card').forEach(card => {
    if (isTouch) return;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) / r.width;
      const dy = (e.clientY - (r.top + r.height/2)) / r.height;
      card.style.transform = `perspective(900px) rotateY(${dx * 10}deg) rotateX(${dy * -6}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });

  // ---------------- GSAP: Animated Entrance & ScrollTrigger ----------------
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-name', { y: 32, opacity: 0, duration: 1.1, ease: 'power3.out', delay: .2 });
    gsap.from('.hero-role', { y: 18, opacity: 0, duration: .9, ease: 'power3.out', delay: .35 });
    gsap.from('.hero-ctas .btn', { y: 12, opacity: 0, duration: .9, stagger: .12, delay: .55 });

    // reveal sections
    document.querySelectorAll('.section, .glass-panel, .project-card').forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 86%' },
        y: 28, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.06 * i
      });
    });

    // skill bars
    document.querySelectorAll('.bar').forEach(bar => {
      const fill = bar.querySelector('.fill');
      const val = Number(bar.dataset.value || 70);
      gsap.to(fill, {
        width: val + '%',
        scrollTrigger: { trigger: bar, start: 'top 92%' },
        duration: 1.8, ease: 'power3.out'
      });
    });

    // subtle parallax content movement
    gsap.to('#hero', {
      backgroundPosition: '50% 60%',
      ease: 'none',
      scrollTrigger: { trigger: '#hero', scrub: true, start: 'top top', end: 'bottom top' }
    });
  }

  // ---------------- THEME TOGGLE (persist) ----------------
  (function theme() {
    const body = document.body;
    const saved = localStorage.getItem('theme') || 'dark';
    if (saved === 'dark') body.classList.add('dark'); else body.classList.remove('dark');
    themeToggle?.addEventListener('click', () => {
      body.classList.toggle('dark');
      const isDark = body.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeToggle.querySelector('i')?.classList.toggle('fa-sun');
      themeToggle.querySelector('i')?.classList.toggle('fa-moon');
    });
  })();

  // ---------------- RESPONSIVE NAV TOGGLE ----------------
  menuToggle?.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', (!expanded).toString());
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('show');
  });

  // ---------------- MODAL for Projects ----------------
  document.querySelectorAll('.open-modal').forEach(btn => btn.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    const title = card?.querySelector('h3')?.textContent || 'Project';
    const desc = card?.querySelector('p')?.textContent || '';
    modalTitle.textContent = title;
    modalText.textContent = desc;
    modal.setAttribute('aria-hidden', 'false');
  }));
  modal.querySelector('.modal-close')?.addEventListener('click', () => modal.setAttribute('aria-hidden','true'));
  modal.addEventListener('click', (ev) => { if (ev.target === modal) modal.setAttribute('aria-hidden','true'); });

  // keyboard accessibility for project cards
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') card.querySelector('.open-modal')?.click(); });
  });

  // ---------------- CONTACT FORM (demo behavior) ----------------
  document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (window.gsap) gsap.fromTo('#contactForm', { scale: .98 }, { scale: 1, duration: .5, ease: 'elastic.out(1,0.6)' });
    alert('Thanks — message submitted (demo). Hook this form to your backend endpoint to receive real messages.');
    e.target.reset();
  });

  // ---------------- Accessibility: reduce motion if requested ----------------
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('*').forEach(el => el.style.transitionDuration = '0ms');
  }
});
