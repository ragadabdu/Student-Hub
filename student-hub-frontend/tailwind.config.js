/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',   
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1a1a2e',
          light: '#2a2a4a',
        },
        primary: {
          DEFAULT: '#6366f1',
          light: '#818cf8',
          dark: '#4f46e5',
        },
        surface: '#ffffff',
        background: '#f8fafc',
        text: '#1e293b',
        'text-secondary': '#64748b',
        border: '#e2e8f0',
      },

      animation: {
        'in': 'fade-in 0.2s ease-out',
        'in-reverse': 'fade-in 0.2s ease-out reverse',
        'zoom-in-95': 'zoom-in-95 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in-95': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};