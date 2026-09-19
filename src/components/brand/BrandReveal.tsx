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

    // Check if already shown in this session
    const hasSeenIntro = sessionStorage.getItem('supersnake_intro_viewed');
    if (hasSeenIntro) {
      setIsVisible(false);
      return;
    }

    // Short atmospheric reveal (1.6s total)
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('supersnake_intro_viewed', 'true');
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black pointer-events-auto cursor-pointer"
          onClick={() => setIsVisible(false)}
        >
          {/* Subtle venom green light gradient in background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.25, 0.15], scale: [0.8, 1.2, 1] }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            className="absolute w-72 h-72 rounded-full bg-snake-green/20 blur-[100px] pointer-events-none"
          />

          {/* Logo container with emerging animation */}
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <Image
                src="/supersnake logonobg.png"
                alt="SUPERSNAKE"
                width={48}
                height={85}
                priority
                className="object-contain"
              />
            </motion.div>

            {/* Subtle Brand Name */}
            <motion.div
              initial={{ opacity: 0, letterSpacing: '0.4em' }}
              animate={{ opacity: 1, letterSpacing: '0.3em' }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-xs font-medium tracking-mega text-neutral-300"
            >
              SUPERSNAKE
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
