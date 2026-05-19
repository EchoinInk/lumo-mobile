/**
 * Motion System
 * 
 * Neurodivergent-first animation system with subtle, predictable motion.
 * Prioritizes state clarity and orientation over delight.
 */

export const motion = {
  // Animation durations (calm, predictable timing)
  duration: {
    instant: 0,
    fast: 120,
    normal: 180,
    slow: 260,
    slower: 340,
  },

  // Easing curves (soft, natural transitions)
  easing: {
    // Linear for state changes (predictable)
    linear: 'linear',
    
    // Ease-out for entrance animations (gentle)
    easeOut: 'ease-out',
    easeOutQuart: [0.165, 0.84, 0.44, 1],
    
    // Ease-in for exit animations (natural)
    easeIn: 'ease-in',
    easeInQuart: [0.895, 0.03, 0.685, 0.22],
    
    // Ease-in-out for transitions (smooth)
    easeInOut: 'ease-in-out',
    easeInOutQuart: [0.77, 0, 0.175, 1],
    
    // Spring for touch feedback (responsive but gentle)
    spring: {
      stiffness: 300,
      damping: 25,
      mass: 0.5,
    },
  },

  // Reduced motion variants (minimal animation)
  reduced: {
    duration: {
      instant: 0,
      fast: 0,
      normal: 0,
      slow: 0,
      slower: 0,
    },
    
    // Only preserve essential motion for state clarity
    preserve: {
      focus: true,
      orientation: true,
      state: true,
      delight: false,
    },
  },

  // Scale values (gentle, subtle)
  scale: {
    press: 0.96,
    hover: 0.98,
    focus: 1,
    default: 1,
  },

  // Opacity values (clear state transitions)
  opacity: {
    press: 0.8,
    hover: 0.9,
    focus: 1,
    default: 1,
    disabled: 0.5,
  },

  // Transition priorities
  priority: {
    // P0: Essential for cognitive clarity
    essential: {
      focus: true,
      orientation: true,
      state: true,
    },
    
    // P1: Nice to have but optional
    optional: {
      delight: false,
      decorative: false,
    },
  },
} as const;

export type MotionDuration = keyof typeof motion.duration;
export type MotionEasing = keyof typeof motion.easing;
