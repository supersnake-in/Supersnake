'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function BrandReveal() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(false);
      return;
    }

    // Auto-dismiss after snake slithers to center, SUPERSNAKE text reveals, and rests
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black pointer-events-auto cursor-pointer select-none overflow-hidden"
          onClick={() => setIsVisible(false)}
          aria-label="SuperSnake Intro Animation - Click to skip"
        >
          {/* Luminous emerald venom glow that expands at the center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{
              opacity: [0, 0, 0.35, 0.2],
              scale: [0.4, 0.4, 1.4, 1.1],
            }}
            transition={{
              duration: 2.2,
              times: [0, 0.55, 0.85, 1],
              ease: 'easeOut',
            }}
            className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-snake-green/25 blur-[100px] pointer-events-none"
          />

          {/* Sinuous Snake Motion: starts at the bottom of respective device (80vh) and slithers to center (0vh) */}
          <motion.div
            initial={{
              y: '80vh',
              x: 0,
              rotate: 0,
              opacity: 0,
            }}
            animate={{
              // Vertical ascent from bottom edge of screen to exact center
              y: ['80vh', '60vh', '40vh', '20vh', '0vh'],
              // Sinusoidal lateral slither
              x: [0, -22, 22, -16, 16, -10, 10, -4, 4, 0],
              // Directional rotational weaving
              rotate: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0],
              opacity: [0, 1, 1, 1, 1],
            }}
            transition={{
              y: {
                duration: 1.7,
                ease: [0.25, 0.1, 0.25, 1],
                times: [0, 0.3, 0.6, 0.85, 1],
              },
              x: {
                duration: 1.7,
                ease: 'easeInOut',
                times: [0, 0.12, 0.25, 0.38, 0.5, 0.63, 0.75, 0.88, 0.95, 1],
              },
              rotate: {
                duration: 1.7,
                ease: 'easeInOut',
                times: [0, 0.12, 0.25, 0.38, 0.5, 0.63, 0.75, 0.88, 0.95, 1],
              },
              opacity: {
                duration: 0.35,
                ease: 'easeOut',
              },
            }}
            className="relative flex flex-col items-center"
          >
            {/* Snake Crest with Luminous Sweep */}
            <div className="relative">
              <Image
                src="/supersnake logonobg.png"
                alt="SUPERSNAKE Logo"
                width={52}
                height={92}
                priority
                className="object-contain drop-shadow-[0_0_20px_rgba(4,252,33,0.5)]"
              />

              {/* Light pulse gliding through the crest upon arrival at center */}
              <motion.div
                initial={{ top: '-40%', opacity: 0 }}
                animate={{ top: '140%', opacity: [0, 1, 0] }}
                transition={{ duration: 0.9, delay: 1.7, ease: 'easeInOut' }}
                className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-snake-green/60 to-transparent blur-sm pointer-events-none"
              />
            </div>

            {/* Brand Text "SUPERSNAKE": only appears AFTER the snake reaches the center of the screen */}
            <motion.div
              initial={{
                opacity: 0,
                y: 16,
                filter: 'blur(8px)',
                letterSpacing: '0.45em',
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                letterSpacing: '0.28em',
              }}
              transition={{
                duration: 0.8,
                delay: 1.7, // Triggers immediately as the snake reaches the center!
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-6 font-sans font-bold text-xs sm:text-sm tracking-[0.28em] text-white select-none text-center"
            >
              SUPERSNAKE
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
