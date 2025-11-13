/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Mapeamos tus colores de _variables.scss
        'primary': '#3498db',
        'secondary': '#2c3e50',
        'success': '#2ecc71',
        'error': '#e74c3c',
        'warning': '#f1c40f',
      },
      fontFamily: {
        // Mapeamos tu fuente base
        'sans': ['Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

