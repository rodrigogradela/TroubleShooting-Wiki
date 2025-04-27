/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'bridgestone-gray': '#4A4A4A',  // Cinza escuro para fundo
        'bridgestone-black': '#1A1A1A', // Preto para texto/bordas
        'bridgestone-red': '#E30613',   // Vermelho do logo
        'bridgestone-white': '#FFFFFF', // Branco para contraste
      },
    },
  },
  plugins: [],
}