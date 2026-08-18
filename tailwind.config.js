/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular'],
        medium: ['Inter_500Medium'],
        semibold: ['Inter_600SemiBold'],
        bold: ['Inter_700Bold'],
      },
      fontSize: {
        xs: ['14px', { lineHeight: '20px' }],
        sm: ['16px', { lineHeight: '22px' }],
        base: ['18px', { lineHeight: '26px' }],
        lg: ['20px', { lineHeight: '28px' }],
        xl: ['22px', { lineHeight: '30px' }],
        '2xl': ['26px', { lineHeight: '34px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
        '4xl': ['38px', { lineHeight: '48px' }],
      },
      colors: {
        // Neutral scale
        neutral: {
          0: '#FFFFFF',
          50: '#F5F5F7',
          100: '#EBEBED',
          200: '#D4D4D8',
          300: '#B9B9C4',
          400: '#9F9FAD',
          500: '#7B7B8E',
          600: '#6E6E80',
          700: '#4A4A5A',
          800: '#2E2E3A',
          900: '#0A0A0B',
        },
        // Dark mode surface scale
        dark: {
          0: '#0D0D0F',
          50: '#1A1A1F',
          100: '#242429',
          200: '#2E2E36',
          300: '#3A3A45',
          400: '#5A5A6B',
          500: '#8C8C9E',
        },
        // Accent — deep blue brand color. Token key stays "violet" (matches src/constants/colors.ts
        // palette.violet* and every existing `violet-*` className in the app) so the whole app's
        // primary color updates from this one place without touching 25+ screen files.
        violet: {
          100: '#DCE6FC',
          200: '#B3C9F7',
          400: '#4C7EE8',
          500: '#2358D6',
          600: '#1A44AC',
          700: '#132F7E',
        },
        // Success
        emerald: {
          100: '#D1FAE5',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#166534',
        },
        // Warning
        amber: {
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#92400E',
        },
        // Danger
        red: {
          100: '#FEE2E2',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#991B1B',
        },
        // Secondary accent — used for "info" surfaces (Badge info variant etc). Distinct from the
        // blue primary above so info states don't visually collide with the brand color.
        cyan: {
          100: '#CFFAFE',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
        },
        blue: {
          100: '#DBEAFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
