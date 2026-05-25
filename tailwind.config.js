/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': 'rgb(var(--color-bg) / <alpha-value>)',
        'dark-card': 'rgb(var(--color-card) / <alpha-value>)',
        'dark-border': 'rgb(var(--color-border) / <alpha-value>)',
        'navy': 'rgb(var(--color-navy) / <alpha-value>)',
        'navy-light': 'rgb(var(--color-navy-light) / <alpha-value>)',
        'orange': 'rgb(var(--color-orange) / <alpha-value>)',
        'orange-light': 'rgb(var(--color-orange-light) / <alpha-value>)',
        'orange-dark': 'rgb(var(--color-orange-dark) / <alpha-value>)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.2' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 140, 0, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 140, 0, 0.6)' },
        },
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(135deg, rgb(var(--color-orange)) 0%, rgb(var(--color-orange-light)) 100%)',
        'gradient-dark': 'linear-gradient(135deg, rgb(var(--color-bg)) 0%, rgb(var(--color-card)) 100%)',
      },
    },
  },
  plugins: [],
};
