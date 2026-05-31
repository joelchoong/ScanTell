// Design System - Color Constants
// Change these values to update the accent colors throughout the app

export const colors = {
  // Primary accent color (gold/yellow)
  primary: {
    base: '#F5B301',
    light: '#FAD381',
    dark: '#D49800',
    solid: '#FCE3B4',
    gradient: 'linear-gradient(180deg, #FAD381 0%, #FCE3B4 100%)',
    gradientTransparent: '#f0f0f3',
    sCurvePattern: '/wave-pattern.svg',
    rgba: {
      25: 'rgba(245,179,1,0.25)',
      15: 'rgba(245,179,1,0.15)',
      8: 'rgba(245,179,1,0.08)',
    },
  },

  // Background colors
  background: {
    base: '#f0f0f3',
    dark: '#1a1917',
  },

  // Text colors
  text: {
    primary: '#121417',
    secondary: '#5a5a6a',
    white: '#ffffff',
  },

  // Neumorphism shadows
  shadows: {
    raised: '5px 5px 12px #c8c8d0, -5px -5px 12px #ffffff',
    raisedSm: '3px 3px 8px #c8c8d0, -3px -3px 8px #ffffff',
    inset: 'inset 3px 3px 8px #c8c8d0, inset -3px -3px 8px #ffffff',
    insetSm: 'inset 2px 2px 5px #c8c8d0, inset -2px -2px 5px #ffffff',
    gold: '3px 3px 8px rgba(197,142,0,0.4), -2px -2px 6px rgba(255,220,100,0.25)',
  },
};

// Typography Scale
// Use these consistently across all components
export const typography = {
  // Hero title — large card headlines
  heroTitle: 'text-2xl font-bold leading-snug tracking-wide',       // 24px
  // Section headers — "Recent Scans", "Simulate what happens"
  sectionHeader: 'text-base font-semibold',                          // 16px
  // Card body / list item primary label
  bodyPrimary: 'text-sm font-medium',                                // 14px
  // Card body / list item secondary / descriptions
  bodySecondary: 'text-sm font-normal',                              // 14px
  // Button label
  button: 'text-sm font-semibold',                                   // 14px
  // Meta / timestamps / tags / captions
  caption: 'text-xs font-normal',                                    // 12px
  // Uppercase label tags (e.g. PREDICTION, OPPORTUNITY)
  label: 'text-[11px] font-bold tracking-widest uppercase',          // 11px
};

// CSS utility classes for common design patterns
export const designClasses = {
  softuiCard: 'softui-card',
  softuiBg: 'softui-bg',
  softuiInput: 'softui-input',
  softuiBtn: 'softui-btn',
};
