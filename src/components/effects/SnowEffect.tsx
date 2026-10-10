'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  angle: number;
  swaySpeed: number;
  opacity: number;
}

export function SnowEffect() {
  const { storefrontConfig } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!storefrontConfig?.snowEffectEnabled || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle count: 38 on desktop, 18 on mobile for optimal 60fps performance
    const isMobile = width < 768;
    const particleCount = isMobile ? 18 : 38;

    const flakes: Snowflake[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.75 + Math.random() * 1.35, // 0.75px to 2.1px delicate frost crystals
      speed: 0.35 + Math.random() * 0.75, // Slow graceful editorial drift
      angle: Math.random() * Math.PI * 2,
      swaySpeed: 0.008 + Math.random() * 0.015,
      opacity: 0.18 + Math.random() * 0.32, // Soft 18% - 50% opacity
    }));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let isVisible = !document.hidden;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < flakes.length; i++) {
          const flake = flakes[i];

          // Movement
          flake.y += flake.speed;
          flake.angle += flake.swaySpeed;
          flake.x += Math.sin(flake.angle) * 0.45;

          // Wrap boundaries
          if (flake.y > height + 5) {
            flake.y = -5;
            flake.x = Math.random() * width;
          }
          if (flake.x > width + 5) {
            flake.x = -5;
          } else if (flake.x < -5) {
            flake.x = width + 5;
          }

          // Draw fine frost particle
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
          if (flake.radius > 1.4) {
            ctx.shadowBlur = 2;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [storefrontConfig?.snowEffectEnabled, prefersReducedMotion]);

  if (!storefrontConfig?.snowEffectEnabled || prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 w-full h-full transition-opacity duration-1000"
      aria-hidden="true"
    />
  );
}
