export const EASINGS = {
  cinematic: [0.16, 1, 0.3, 1] as [number, number, number, number],
  silk: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
  physical: [0.22, 1, 0.36, 1] as [number, number, number, number],
  subtle: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const MOTION_VARIANTS = {
  fadeReveal: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: EASINGS.cinematic,
      },
    },
  },
  
  fadeUpDelayed: (delay: number = 0) => ({
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        delay,
        ease: EASINGS.cinematic,
      },
    },
  }),

  textRevealMask: {
    hidden: { y: '100%' },
    visible: (custom: number = 0) => ({
      y: 0,
      transition: {
        duration: 1.1,
        delay: custom * 0.1,
        ease: EASINGS.cinematic,
      },
    }),
  },

  imageScaleSubtle: {
    hidden: { scale: 1.08, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.4,
        ease: EASINGS.cinematic,
      },
    },
  },

  staggerContainer: (staggerChildren: number = 0.1, delayChildren: number = 0) => ({
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  }),

  clipRevealVertical: {
    hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
    visible: {
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: {
        duration: 1.2,
        ease: EASINGS.cinematic,
      },
    },
  },

  slideDrawer: {
    hidden: { x: '100%' },
    visible: {
      x: 0,
      transition: {
        duration: 0.5,
        ease: EASINGS.cinematic,
      },
    },
    exit: {
      x: '100%',
      transition: {
        duration: 0.4,
        ease: EASINGS.physical,
      },
    },
  },

  modalBackdrop: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.35, ease: EASINGS.subtle },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.25, ease: EASINGS.subtle },
    },
  },
};
