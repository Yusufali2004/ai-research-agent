import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  drift: number;
}

/**
 * StarfieldCanvas
 * Renders a subtle animated star field on a full-screen canvas.
 * Sits behind all UI at z-index 0.
 */
export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef  = useRef<Star[]>([]);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;

    const init = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

      starsRef.current = Array.from({ length: 130 }, () => ({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     0.4 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.006 + Math.random() * 0.006,
        drift: (Math.random() - 0.5) * 0.08,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach(s => {
        s.phase += s.speed;
        s.x     += s.drift;

        if (s.x < 0)            s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;

        const alpha = ((Math.sin(s.phase) + 1) / 2) * 0.55;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 190, 255, ${alpha})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    init();
    draw();

    const onResize = () => init();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
