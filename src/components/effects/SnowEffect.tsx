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
  swayAmplitude: number;
  opacity: number;
  layer: 'bg' | 'mid' | 'fg';
}

export function SnowEffect() {
  const { storefrontConfig } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [localEnabled, setLocalEnabled] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Sync state from storefrontConfig and storage
  useEffect(() => {
    const isStoreEnabled = Boolean(storefrontConfig?.snowEffectEnabled);
    setLocalEnabled(isStoreEnabled);

    // Cross-tab and local storage backup sync
    const checkStorage = () => {
      try {
        const raw = localStorage.getItem('supersnake_storefront_config');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed?.snowEffectEnabled === 'boolean') {
            setLocalEnabled(parsed.snowEffectEnabled);
          }
        }
      } catch (e) {}
    };

    window.addEventListener('storage', checkStorage);
    window.addEventListener('supersnake_storefront_change', checkStorage);
    return () => {
      window.removeEventListener('storage', checkStorage);
      window.removeEventListener('supersnake_storefront_change', checkStorage);
    };
  }, [storefrontConfig?.snowEffectEnabled]);

  const isSnowActive = (localEnabled || Boolean(storefrontConfig?.snowEffectEnabled)) && !prefersReducedMotion;

  useEffect(() => {
    if (!isSnowActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Retina / High-DPI device pixel ratio setup for ultra-crisp rendering
    const setupCanvasSize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setupCanvasSize();

    // Particle budgeting: ~76 on desktop, ~38 on mobile for luxury presence + locked 60fps
    const isMobile = width < 768;
    const count = isMobile ? 38 : 76;

    const flakes: Snowflake[] = Array.from({ length: count }, (_, i) => {
      const isForeground = i % 8 === 0;
      const isMidground = i % 3 === 0;

      if (isForeground) {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 3.2 + Math.random() * 1.4, // 3.2px - 4.6px hero soft flakes
          speed: 0.95 + Math.random() * 0.65,
          angle: Math.random() * Math.PI * 2,
          swaySpeed: 0.012 + Math.random() * 0.012,
          swayAmplitude: 0.8 + Math.random() * 0.6,
          opacity: 0.85 + Math.random() * 0.12,
          layer: 'fg',
        };
      } else if (isMidground) {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 2.2 + Math.random() * 1.0, // 2.2px - 3.2px midground drifting flakes
          speed: 0.65 + Math.random() * 0.45,
          angle: Math.random() * Math.PI * 2,
          swaySpeed: 0.01 + Math.random() * 0.01,
          swayAmplitude: 0.5 + Math.random() * 0.4,
          opacity: 0.68 + Math.random() * 0.22,
          layer: 'mid',
        };
      } else {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 1.3 + Math.random() * 0.8, // 1.3px - 2.1px background crystalline frost
          speed: 0.35 + Math.random() * 0.35,
          angle: Math.random() * Math.PI * 2,
          swaySpeed: 0.008 + Math.random() * 0.008,
          swayAmplitude: 0.3 + Math.random() * 0.3,
          opacity: 0.45 + Math.random() * 0.25,
          layer: 'bg',
        };
      }
    });

    const handleResize = () => {
      setupCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    let isTabVisible = !document.hidden;
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = () => {
      if (isTabVisible) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < flakes.length; i++) {
          const flake = flakes[i];

          // Graceful editorial descent with subtle sinusoidal horizontal sway
          flake.y += flake.speed;
          flake.angle += flake.swaySpeed;
          flake.x += Math.sin(flake.angle) * flake.swayAmplitude;

          // Wrap boundaries smoothly
          if (flake.y > height + 10) {
            flake.y = -10;
            flake.x = Math.random() * width;
          }
          if (flake.x > width + 10) {
            flake.x = -10;
          } else if (flake.x < -10) {
            flake.x = width + 10;
          }

          // Crystalline flake rendering with dual contrast:
          // Subtle soft dark halo so flakes pop against white/bright hero imagery,
          // plus pure white core with luminous bloom so they shine against black atelier backdrops.
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);

          // Subtle shadow contrast for light backdrops (e.g. white T-shirt)
          ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1;

          // Flake fill
          ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
          ctx.fill();

          // Foreground luminous glow pass
          if (flake.layer === 'fg') {
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 5;
            ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.6})`;
            ctx.fill();
          }
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
  }, [isSnowActive]);

  if (!isSnowActive) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45] w-full h-full animate-in fade-in duration-700"
      aria-hidden="true"
    />
  );
}
