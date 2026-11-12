/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          accent: '#B8F34A',
          hover: '#A5E035',
          dark: '#090909',
        },
        surface: {
          main: '#090909',
          card: '#141414',
          secondary: '#202020',
          border: '#303030',
        },
        text: {
          primary: '#F4F7F2',
          secondary: '#9AA69B',
          muted: '#6E7A6F',
        },
        status: {
          live: '#FF414D',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        'xl': '12px',
        'lg': '8px',
        'md': '6px',
      },
    },
  },
  plugins: [],
}

