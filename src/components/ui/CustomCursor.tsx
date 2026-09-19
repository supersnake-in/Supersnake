'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'view'>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on non-touch devices with fine pointer
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const onMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest('[data-cursor="view"]')) {
        setCursorType('view');
      } else if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('select')
      ) {
        setCursorType('pointer');
      } else {
        setCursorType('default');
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
      {/* Small Precision Dot */}
      <motion.div
        className="fixed top-0 left-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-snake-green pointer-events-none"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          opacity: cursorType === 'view' ? 0 : 1,
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 450, mass: 0.1 }}
      />

      {/* Dynamic Cursor Ring / View Capsule */}
      <motion.div
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center font-mono text-[9px] tracking-widest font-semibold uppercase transition-colors duration-200 ${
          cursorType === 'view'
            ? 'h-10 w-16 rounded-full bg-snake-green text-black shadow-[0_0_20px_rgba(4,252,33,0.5)]'
            : cursorType === 'pointer'
            ? 'h-8 w-8 rounded-full border border-snake-green/70 bg-snake-green/10'
            : 'h-6 w-6 rounded-full border border-white/20'
        }`}
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          scale: cursorType === 'pointer' ? 1.25 : 1,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 250, mass: 0.2 }}
      >
        {cursorType === 'view' && 'VIEW'}
      </motion.div>
    </div>
  );
}
