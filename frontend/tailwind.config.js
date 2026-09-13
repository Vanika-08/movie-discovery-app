/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Cinematic dark palette
        ink: '#0a0a0f',        // page background (near-black)
        panel: '#14151f',      // cards / surfaces
        panel2: '#1d1f2e',     // raised surfaces / inputs
        edge: '#2a2d3f',       // borders
        brand: {
          400: '#fbbf24',      // amber accent (light)
          500: '#f59e0b',      // amber accent (primary)
          600: '#d97706',      // amber accent (hover)
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 4px 16px rgba(0, 0, 0, 0.35)',
        glow: '0 8px 30px rgba(245, 158, 11, 0.15)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};