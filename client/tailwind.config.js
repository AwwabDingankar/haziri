/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5048e5",
          50:  "#f0effd",
          100: "#e1dffb",
          200: "#c3bff7",
          300: "#a59ef3",
          400: "#877eef",
          500: "#5048e5",
          600: "#3d37cc",
          700: "#2e29a3",
          800: "#1f1c7a",
          900: "#111051",
        },
        "background-light": "#f6f6f8",
        "background-dark": "#121121",
      },
      fontFamily: {
        display: ["Lexend", "sans-serif"],
      },
    },
  },
  plugins: [],
}
