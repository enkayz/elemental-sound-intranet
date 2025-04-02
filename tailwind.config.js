/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1A365D",     // Deep blue
        secondary: "#2A9D8F",   // Teal green
        accent: "#F4A261",      // Amber
        light: "#E9ECEF",       // Light gray
        dark: "#343A40",        // Dark gray
        success: "#28A745",     // Green
        warning: "#FFC107",     // Yellow
        danger: "#DC3545",      // Red
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 