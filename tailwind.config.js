/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe7ff',
          500: '#3d63dd',
          600: '#2f4fc0',
          700: '#25409b',
        },
      },
    },
  },
  plugins: [],
};
