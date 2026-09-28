/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        transit: {
          dark: '#0B1120',
          darker: '#060A12',
          surface: '#1E293B',
          surfaceHover: '#334155',
          border: '#334155',
          primary: '#3B82F6',
          primaryHover: '#2563EB',
          accent: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          bus: '#3B82F6',
          minibus: '#06B6D4',
          auto: '#F59E0B',
          electric: '#10B981',
          shuttle: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(59, 130, 246, 0.5)',
        'glow-accent': '0 0 20px -5px rgba(16, 185, 129, 0.5)',
      }
    },
  },
  plugins: [],
}
