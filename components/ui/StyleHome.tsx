"use client";
import { useEffect, useRef } from "react";

interface StyleHomeProps {
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  luminance: number;
  RADIUS: number;
  LUMINANCE_MIN: number;
  LUMINANCE_MAX: number;
}

export default function StyleHome({ className = "" }: StyleHomeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const stateRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    accelerationEnabled: false,
    width: 0,
    height: 0,
    countX: 0,
    countY: 0,
  });

  const PARTICLE_INTERVAL = 60;
  const FRICTION = 0.98;
  const ACCELARATION_COEFFICIENT = 0.05;
  const MIN_SCALE = 0.7;
  const PARTICLE_RADIUS = 15;
  const LUMINANCE_MIN = 5;
  const LUMINANCE_MAX = 50;

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const state = stateRef.current;
    let accelTimeoutId: NodeJS.Timeout | null = null;

    const setup = () => {
      state.x = 0;
      state.y = 0;
      state.vx = 0;
      state.vy = 0;
      state.ax = 0;
      state.ay = 0;
      state.accelerationEnabled = false;
      state.width = container.clientWidth;
      state.height = container.clientHeight;
      state.countX = Math.floor(state.width / PARTICLE_INTERVAL) + 3;
      state.countY = Math.floor(state.height / PARTICLE_INTERVAL) + 3;

      canvas.width = state.width;
      canvas.height = state.height;

      // Create particles
      particlesRef.current = [];
      for (let i = 0; i < state.countX; i++) {
        for (let j = 0; j < state.countY; j++) {
          particlesRef.current.push({
            x: PARTICLE_INTERVAL * (i - 1),
            y: PARTICLE_INTERVAL * (j - 1),
            luminance: LUMINANCE_MIN,
            RADIUS: PARTICLE_RADIUS,
            LUMINANCE_MIN: LUMINANCE_MIN,
            LUMINANCE_MAX: LUMINANCE_MAX,
          });
        }
      }
    };

    const enableAccel = (event: MouseEvent) => {
      if (accelTimeoutId) {
        clearTimeout(accelTimeoutId);
        accelTimeoutId = null;
      }

      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Solo procesar si el mouse está dentro del área del contenedor
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        return;
      }

      if (!state.accelerationEnabled) {
        state.x = x;
        state.y = y;
        state.ax = 0;
        state.ay = 0;
        state.accelerationEnabled = true;
        return;
      }

      state.ax = (state.x - x) * ACCELARATION_COEFFICIENT;
      state.ay = (state.y - y) * ACCELARATION_COEFFICIENT;
      state.x = x;
      state.y = y;

      accelTimeoutId = setTimeout(() => {
        state.ax = 0;
        state.ay = 0;
        state.accelerationEnabled = false;
      }, 30);
    };

    const disableAccel = () => {
      if (accelTimeoutId) {
        clearTimeout(accelTimeoutId);
        accelTimeoutId = null;
      }
      state.x = 0;
      state.y = 0;
      state.ax = 0;
      state.ay = 0;
      state.accelerationEnabled = false;
    };

    const handleMouseLeaveWindow = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Desactivar si el mouse sale del área del contenedor
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        disableAccel();
      }
    };

    const renderParticle = (
      ctx: CanvasRenderingContext2D,
      particle: Particle,
      x: number,
      y: number,
      vx: number,
      vy: number,
      theta: number,
      scale: number,
    ) => {
      const dx = particle.x - x;
      const dy = particle.y - y;

      if (
        dx * dx + dy * dy <= PARTICLE_INTERVAL * PARTICLE_INTERVAL &&
        x > 0 &&
        y > 0
      ) {
        particle.luminance = particle.LUMINANCE_MAX;
      }

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(theta);
      ctx.scale(2 - scale, scale);

      if (particle.luminance > particle.LUMINANCE_MIN) {
        ctx.shadowColor = `hsl(210, 60%, ${particle.luminance}%)`;
        ctx.shadowBlur = 50;
      }
      ctx.fillStyle = `hsl(210, 60%, ${particle.luminance}%)`;
      ctx.beginPath();
      ctx.arc(0, 0, particle.RADIUS, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.restore();

      particle.x += vx;
      particle.y += vy;

      if (particle.luminance > particle.LUMINANCE_MIN) {
        particle.luminance--;
      }

      // Wrap around edges
      if (particle.x < -particle.RADIUS * 2 && vx < 0) {
        particle.luminance = particle.LUMINANCE_MIN;
        particle.x += state.countX * PARTICLE_INTERVAL;
      } else if (particle.x > state.width + particle.RADIUS * 2 && vx > 0) {
        particle.luminance = particle.LUMINANCE_MIN;
        particle.x -= state.countX * PARTICLE_INTERVAL;
      }
      if (particle.y < -particle.RADIUS * 2 && vy < 0) {
        particle.luminance = particle.LUMINANCE_MIN;
        particle.y += state.countY * PARTICLE_INTERVAL;
      } else if (particle.y > state.height + particle.RADIUS * 2 && vy > 0) {
        particle.luminance = particle.LUMINANCE_MIN;
        particle.y -= state.countY * PARTICLE_INTERVAL;
      }
    };

    const render = () => {
      if (!context) return;

      context.fillStyle = "hsla(207, 90%, 35%, 0.5)";
      context.fillRect(0, 0, state.width, state.height);

      const theta = Math.atan2(state.vy, state.vx);
      const scale = Math.max(
        MIN_SCALE,
        1 - Math.sqrt(state.vx * state.vx + state.vy * state.vy) / 30,
      );

      context.save();
      context.globalCompositeOperation = "lighter";

      for (const particle of particlesRef.current) {
        renderParticle(
          context,
          particle,
          state.x,
          state.y,
          state.vx,
          state.vy,
          theta,
          scale,
        );
      }

      context.restore();

      state.vx += state.ax;
      state.vy += state.ay;
      state.vx *= FRICTION;
      state.vy *= FRICTION;

      animationRef.current = requestAnimationFrame(render);
    };

    setup();

    // Event listeners
    const handleResize = () => {
      setup();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", enableAccel);
    window.addEventListener("mousemove", handleMouseLeaveWindow);

    render();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", enableAccel);
      window.removeEventListener("mousemove", handleMouseLeaveWindow);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (accelTimeoutId) {
        clearTimeout(accelTimeoutId);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
