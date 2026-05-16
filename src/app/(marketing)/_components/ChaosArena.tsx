'use client';
import { useEffect, useRef } from 'react';

interface IconState {
  el: HTMLElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotV: number;
}

export default function ChaosArena() {
  const arenaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const arena = arenaRef.current;
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

    const elements = Array.from(arena.querySelectorAll<HTMLElement>('.chaos-icon'));

    const icons: IconState[] = elements.map((el) => {
      const x = Math.random() * (arenaRect.width - ICON_SIZE);
      const y = Math.random() * (arenaRect.height - ICON_SIZE);
      const angle = Math.random() * Math.PI * 2;
      const speed = SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN);
      el.style.transform = `translate(${x}px, ${y}px) rotate(0deg)`;
      return {
        el, x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 1.5,
      };
    });

    const updateArenaRect = () => { arenaRect = arena.getBoundingClientRect(); };
    window.addEventListener('resize', updateArenaRect, { passive: true });

    const onMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    document.addEventListener('mousemove', onMouseMove, { passive: true });

    let rafId: number;
    let lastTime = 0;

    const tick = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTime) / 16.67, 2.5);
      lastTime = timestamp;

      const cw = arenaRect.width;
      const ch = arenaRect.height;
      const localMx = mouseX - arenaRect.left;
      const localMy = mouseY - arenaRect.top;

      icons.forEach((icon) => {
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

        icon.vx *= Math.pow(DAMPING, dt);
        icon.vy *= Math.pow(DAMPING, dt);

        const speed = Math.sqrt(icon.vx * icon.vx + icon.vy * icon.vy);
        if (speed > SPEED_MAX) {
          icon.vx = (icon.vx / speed) * SPEED_MAX;
          icon.vy = (icon.vy / speed) * SPEED_MAX;
        }
        if (speed < SPEED_MIN * 0.5) {
          const a = Math.random() * Math.PI * 2;
          icon.vx += Math.cos(a) * SPEED_MIN * 0.4;
          icon.vy += Math.sin(a) * SPEED_MIN * 0.4;
        }

        icon.x += icon.vx * dt;
        icon.y += icon.vy * dt;
        icon.rot += icon.rotV * dt;

        if (icon.x < 0) { icon.x = 0; icon.vx = Math.abs(icon.vx) * (0.7 + Math.random() * 0.3); }
        if (icon.x > cw - ICON_SIZE) { icon.x = cw - ICON_SIZE; icon.vx = -Math.abs(icon.vx) * (0.7 + Math.random() * 0.3); }
        if (icon.y < 0) { icon.y = 0; icon.vy = Math.abs(icon.vy) * (0.7 + Math.random() * 0.3); }
        if (icon.y > ch - ICON_SIZE) { icon.y = ch - ICON_SIZE; icon.vy = -Math.abs(icon.vy) * (0.7 + Math.random() * 0.3); }

        icon.el.style.transform = `translate(${icon.x}px, ${icon.y}px) rotate(${icon.rot}deg)`;
      });

      rafId = requestAnimationFrame(tick);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        lastTime = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateArenaRect);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const iconBase = 'chaos-icon absolute left-0 top-0 w-11 h-11 rounded-[10px] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.4)] will-change-transform select-none';

  return (
    <div ref={arenaRef} className="relative h-[220px] overflow-hidden rounded-lg bg-[#0a0a0b]">
      {/* Notion */}
      <div className={iconBase} style={{ background: '#ffffff' }}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#f3f3f3" stroke="#e0e0e0" strokeWidth="1" />
          <path d="M7 7l3 10 2-5 2 5 3-10" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* GitHub */}
      <div className={iconBase} style={{ background: '#24292e' }}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
      </div>
      {/* Slack */}
      <div className={iconBase} style={{ background: '#4a154b' }}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#ecb22e" strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="9" x2="19" y2="9" /><line x1="5" y1="15" x2="19" y2="15" />
          <line x1="9" y1="4" x2="7" y2="20" /><line x1="17" y1="4" x2="15" y2="20" />
        </svg>
      </div>
      {/* VS Code */}
      <div className={iconBase} style={{ background: '#1e1e1e' }}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#007acc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
      </div>
      {/* Browser */}
      <div className={iconBase} style={{ background: '#1a73e8' }}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <rect x="2" y="5" width="20" height="16" rx="2" />
          <path d="M2 10h20" /><path d="M6 5V3" /><path d="M10 5V3" />
        </svg>
      </div>
      {/* Terminal */}
      <div className={iconBase} style={{ background: '#0d1117' }}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      </div>
      {/* Text File */}
      <div className={iconBase} style={{ background: '#f8fafc' }}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.8" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      </div>
      {/* Bookmark */}
      <div className={iconBase} style={{ background: '#f97316' }}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      </div>
    </div>
  );
}
