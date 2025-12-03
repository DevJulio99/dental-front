/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Dental Profesional - Azul Médico Suave
        // Inspirado en sistemas médicos profesionales
        'primary': {
          DEFAULT: '#4A90E2', // Azul médico suave y profesional
          50: '#E8F2F9',
          100: '#D1E5F3',
          200: '#A3CBE7',
          300: '#75B1DB',
          400: '#5FA0D6',
          500: '#4A90E2', // Color principal - azul médico suave
          600: '#3A7BC8',
          700: '#2E639F',
          800: '#234B76',
          900: '#1A364D',
        },
        // Teal suave como alternativa (como en BrightSmile)
        'teal': {
          DEFAULT: '#14B8A6',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        'secondary': {
          DEFAULT: '#2E639F',
          700: '#2E639F',
          800: '#234B76',
          900: '#1A364D',
        },
      },
      fontFamily: {
        'sans': ['Lato', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'large': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
