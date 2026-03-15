/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all JS, TS, JSX, and TSX files in the src folder
  ],
  theme: {
    extend: {
      // You can add your custom "Smart Talent" colors here
      colors: {
        brand: {
          primary: '#2563eb', // A professional blue
          dark: '#0f172a',    // A deep slate for sidebars
        }
      }
    },
  },
  plugins: [],
}