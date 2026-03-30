/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#1a0b2e',
          800: '#2d1b4e',
          700: '#432c7a',
          500: '#7e57c2',
        }
      },
      backgroundImage: {
        'mystic': "radial-gradient(circle at center, #2d1b4e 0%, #0a0514 100%)",
      }
    },
  },
  plugins: [],
}
