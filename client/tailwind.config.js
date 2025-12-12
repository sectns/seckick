/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        body: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfdf4',
          100: '#d1f9e2',
          200: '#a5f0c4',
          300: '#75e5a4',
          400: '#3fd67e',
          500: '#16c46a',
          600: '#0fa552',
          700: '#0d8343',
          800: '#0c6837',
          900: '#0b5330',
        },
        ink: '#0c1b16',
      },
      boxShadow: {
        'soft-xl': '0 15px 60px rgba(0,0,0,0.16)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
}
