/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#5048e5',
          50:  '#eeecfd',
          100: '#d9d6fb',
          200: '#b3adf7',
          300: '#8d84f3',
          400: '#675bef',
          500: '#5048e5',
          600: '#4039c7',
          700: '#302ba9',
          800: '#201c8b',
          900: '#100e6d',
        },
      },
      borderRadius: {
        DEFAULT: '0.75rem',
      },
    },
  },
  plugins: [],
};
