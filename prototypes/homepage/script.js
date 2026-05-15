document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  initNavbar();
  initHamburger();
  initChaos();
  initScrollAnimations();
  initPricingToggle();
});

/* ─── Navbar opacity on scroll ─── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─── Mobile hamburger ─── */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
}

/* ─── Chaos animation ─── */
function initChaos() {
  const arena = document.getElementById('chaos-arena');
  if (!arena) return;

  const ICON_SIZE = 44;
  const SPEED_MAX = 2.2;
  const SPEED_MIN = 0.4;
  const REPEL_RADIUS = 130;
  const REPEL_FORCE = 0.6;
  const DAMPING = 0.985;

  let mouseX = -1000;
  let mouseY = -1000;
  let arenaRect = arena.getBoundingClientRect();

  const elements = Array.from(arena.querySelectorAll('.chaos-icon'));

  const icons = elements.map((el) => {
    const x = Math.random() * (arenaRect.width - ICON_SIZE);
    const y = Math.random() * (arenaRect.height - ICON_SIZE);
    const angle = Math.random() * Math.PI * 2;
    const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
    return {
      el,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 1.5,
    };
  });

  function updateArenaRect() {
    arenaRect = arena.getBoundingClientRect();
  }

  window.addEventListener('resize', updateArenaRect, { passive: true });

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  let rafId;
  let lastTime = 0;

  function tick(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 16.67, 2.5); // cap at 2.5x to avoid jumps on tab focus
    lastTime = timestamp;

    const cw = arenaRect.width;
    const ch = arenaRect.height;
    const localMx = mouseX - arenaRect.left;
    const localMy = mouseY - arenaRect.top;

    icons.forEach((icon) => {
      // Mouse repulsion
      const cx = icon.x + ICON_SIZE / 2;
      const cy = icon.y + ICON_SIZE / 2;
      const dx = cx - localMx;
      const dy = cy - localMy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_RADIUS && dist > 0) {
        const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_FORCE;
        icon.vx += (dx / dist) * force * dt;
        icon.vy += (dy / dist) * force * dt;
      }

      // Damping
      icon.vx *= Math.pow(DAMPING, dt);
      icon.vy *= Math.pow(DAMPING, dt);

      // Clamp speed
      const speed = Math.sqrt(icon.vx * icon.vx + icon.vy * icon.vy);
      if (speed > SPEED_MAX) {
        icon.vx = (icon.vx / speed) * SPEED_MAX;
        icon.vy = (icon.vy / speed) * SPEED_MAX;
      }
      // Minimum speed nudge
      if (speed < SPEED_MIN * 0.5) {
        const a = Math.random() * Math.PI * 2;
        icon.vx += Math.cos(a) * SPEED_MIN * 0.4;
        icon.vy += Math.sin(a) * SPEED_MIN * 0.4;
      }

      // Move
      icon.x += icon.vx * dt;
      icon.y += icon.vy * dt;
      icon.rot += icon.rotV * dt;

      // Bounce off walls
      if (icon.x < 0) {
        icon.x = 0;
        icon.vx = Math.abs(icon.vx) * (0.7 + Math.random() * 0.3);
      }
      if (icon.x > cw - ICON_SIZE) {
        icon.x = cw - ICON_SIZE;
        icon.vx = -Math.abs(icon.vx) * (0.7 + Math.random() * 0.3);
      }
      if (icon.y < 0) {
        icon.y = 0;
        icon.vy = Math.abs(icon.vy) * (0.7 + Math.random() * 0.3);
      }
      if (icon.y > ch - ICON_SIZE) {
        icon.y = ch - ICON_SIZE;
        icon.vy = -Math.abs(icon.vy) * (0.7 + Math.random() * 0.3);
      }

      icon.el.style.transform = `translate(${icon.x}px, ${icon.y}px) rotate(${icon.rot}deg)`;
    });

    rafId = requestAnimationFrame(tick);
  }

  // Pause when tab hidden to save CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  });

  lastTime = performance.now();
  rafId = requestAnimationFrame(tick);
}

/* ─── Scroll fade-in ─── */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
}

/* ─── Pricing toggle ─── */
function initPricingToggle() {
  const toggle = document.getElementById('pricing-toggle');
  if (!toggle) return;

  const monthlyEls = document.querySelectorAll('.price-monthly');
  const yearlyEls = document.querySelectorAll('.price-yearly');

  toggle.addEventListener('change', () => {
    const isYearly = toggle.checked;
    monthlyEls.forEach((el) => (el.style.display = isYearly ? 'none' : ''));
    yearlyEls.forEach((el) => (el.style.display = isYearly ? '' : 'none'));

    document.getElementById('label-monthly').style.color = isYearly ? '' : 'var(--text)';
    document.getElementById('label-yearly').style.color = isYearly ? 'var(--text)' : '';
  });
}
