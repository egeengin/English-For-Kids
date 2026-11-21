/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lego: {
          red: '#E52521',
          redDark: '#A8110D',
          blue: '#0055BF',
          blueDark: '#003680',
          yellow: '#FFD700',
          yellowDark: '#C79A00',
          green: '#237841',
          greenDark: '#134D27',
          orange: '#FF7F00',
          orangeDark: '#B85500',
          purple: '#8A2BE2',
          purpleDark: '#5E189E',
          gray: '#E0E0E0',
          darkGray: '#4A4A4A',
          black: '#1A1A1A',
        }
      },
      fontFamily: {
        display: ['"Fredoka"', 'system-ui', 'sans-serif'],
        sans: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.05)',
        'lego-stud': 'inset 0 2px 3px rgba(255,255,255,0.6), inset 0 -2px 3px rgba(0,0,0,0.3)',
        'lego-stud-subtle': 'inset 0 1px 2px rgba(255,255,255,0.7), inset 0 -1px 2px rgba(0,0,0,0.2)',
        'lego-btn': '0 6px 0 rgba(0,0,0,0.25)',
        'lego-btn-active': '0 2px 0 rgba(0,0,0,0.25)',
        'lego-card': '0 8px 0 rgba(0,0,0,0.18), 0 15px 25px rgba(0,0,0,0.1)',
        'lego-card-sm': '0 4px 0 rgba(0,0,0,0.18), 0 8px 12px rgba(0,0,0,0.08)',
      },
      borderWidth: {
        '3': '3px',
        '6': '6px',
      },
      borderRadius: {
        'xs': '2px',
      },
      scale: {
        '115': '1.15',
      },
      spacing: {
        '0.2': '0.05rem',
        '18': '4.5rem',
        '22': '5.5rem',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        scaleUp: 'scaleUp 0.25s ease-out forwards',
      }
    },
  },
  plugins: [],
}
