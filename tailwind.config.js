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
        'primary': '#CFE3F7',
        'secondary': '#0D47A1',
        'success': '#2ecc71',
        'error': '#e74c3c',
        'warning': '#f1c40f',
        'light-gray': '#F2F2F2',
        'light-blue': '#E9F2FB',
        'light-red': '#E05A5A',
        'blue-100': '#4A7EBB',
        'blue-50': '#1F3B63',
        'button-primary': '#A8C9EA',
        'hover-btn-primary': '#2C6CB0',
        'blue-check': '#82C9FE'
      },
      fontFamily: {
        // Mapeamos tu fuente base
        'sans': ['Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
