/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0B0B0B',
        'dark-card': '#1A1A1A',
        'dark-border': '#2A2A2A',
        'navy': '#001F5C',
        'navy-light': '#1E3A8A',
        'orange': '#FF8C00',
        'orange-light': '#FFB84D',
        'orange-dark': '#E67E00',
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
        'gradient-orange': 'linear-gradient(135deg, #FF8C00 0%, #FFB84D 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0B0B0B 0%, #1A1A1A 100%)',
      },
    },
  },
  plugins: [],
};
