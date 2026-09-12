/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        haven: {
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c', // Primary accent
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
          },
          amber: {
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
          },
          navy: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#09101d',
          },
          surface: {
            DEFAULT: '#FFFFFF',
            subtle: '#F8FAFC',
            card: '#FFFFFF',
            border: '#E2E8F0',
            borderLight: '#F1F5F9'
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'haven-xs': '0 1px 2px rgba(15, 23, 42, 0.04)',
        'haven-sm': '0 2px 4px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
        'haven-md': '0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'haven-lg': '0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
        'haven-orange': '0 4px 20px -2px rgba(234, 88, 12, 0.22)',
        'haven-orange-lg': '0 10px 25px -3px rgba(234, 88, 12, 0.3)',
      }
    },
  },
  plugins: [],
}
