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
          yellow: '#FFC600',
          yellowHover: '#E6B200',
          blue: '#072AC8',
          blueHover: '#05209E',
          accent: '#FFC600',
          hover: '#E6B200',
          dark: '#172033',
        },
        surface: {
          main: '#F5F7FC',
          secondary: '#FFFFFF',
          card: '#FFFFFF',
          cardAlt: '#F8FAFF',
          yellowSoft: '#FFF6D8',
          yellowCard: '#FFF9E8',
          blueSoft: '#EAF0FF',
          blueCard: '#EEF2FF',
          border: '#E2E8F0',
          borderStrong: '#CBD5E1',
          borderBlue: '#C7D5FF',
          borderYellow: '#F2D56B',
        },
        text: {
          primary: '#172033',
          secondary: '#64748B',
          muted: '#94A3B8',
          onBlue: '#FFFFFF',
          onYellow: '#172033',
        },
        status: {
          live: '#DC2626',
          success: '#16A34A',
          warning: '#D97706',
          error: '#DC2626',
          info: '#2563EB',
          neutral: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
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


