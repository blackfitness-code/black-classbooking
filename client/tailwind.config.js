/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF8C61',     // สีส้มสดใส
        secondary: '#1A1A1A',   // สีดำ
        accent: '#FF8C61',      // สีส้มอ่อน
        dark: '#000000'         // สีดำเข้ม
      },
      fontFamily: {
        'sans': ['Kanit', 'Noto Sans Thai', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      screens: {
        'xs': '375px',
        'safe': { 'raw': '(display-mode: standalone)' },
      }
    },
  },
  plugins: [],
}