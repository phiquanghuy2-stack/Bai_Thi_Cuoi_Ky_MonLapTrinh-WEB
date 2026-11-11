/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        luxury: '0 20px 50px -12px rgba(15, 23, 42, 0.08)',
        'luxury-lg': '0 25px 60px -15px rgba(15, 23, 42, 0.14)',
        glow: '0 0 25px -5px rgba(79, 70, 229, 0.4)',
      },
    },
  },
  plugins: [],
};
