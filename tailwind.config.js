/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // para Angular
    "./node_modules/flowbite/**/*.js", // para Flowbite
  ],
   theme: {
    extend: {
      colors: {
        azul: '#485CC7',
        cyan: '#00B8DE',
        negro: '#6B6B6B',
        negroclaro: '#BABABA',   
      },
      fontFamily: {
        montalban: ['Montalban','sans-serif'],
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
}

