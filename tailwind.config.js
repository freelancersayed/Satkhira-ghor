/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Specific Brand Theme Colors
        brandGreen: '#0F3D2E',   // রিচ ফরেস্ট / এমারেল্ড সবুজ (Deep Forest Green)
        brandHoney: '#D97706',   // মধুর সোনালী / অ্যাম্বার রঙ (Honey Gold / Amber CTA)
        brandMustard: '#C25E2E', // সরিষা বা কাঁকড়ার টেক্সচার রঙ
        brandOrganic: '#FDFBF7', // অফ-হোয়াইট ব্যাকগ্রাউন্ড (Warm Creamy Off-white)

        // Brand Design Tokens
        brand: {
          primary: '#0F3D2E',
          primaryDark: '#0A2B20',
          primaryLight: '#164E3B',
          accent: '#D97706',
          accentHover: '#B45309',
          accentLight: '#F59E0B',
          bg: '#FDFBF7',
          card: '#FFFFFF',
          text: '#111827',
        },

        // Extended Palette Scales
        forest: {
          DEFAULT: '#0F3D2E',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#164E3B',
          900: '#0F3D2E',
          950: '#0A2B20',
        },
        honey: {
          DEFAULT: '#D97706',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        ochre: {
          DEFAULT: '#C25E2E',
          50: '#FDF4EF',
          100: '#FAE5DA',
          200: '#F4CAB5',
          300: '#EDA686',
          400: '#E65F2B',
          500: '#C25E2E',
          600: '#A03B13',
          700: '#782A0B',
          800: '#501B05',
          900: '#280D02',
        },
        cream: {
          DEFAULT: '#FDFBF7',
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#F9FAFB',
          300: '#F3EFE6',
          400: '#E8E1D2',
        },
      },
      fontFamily: {
        bangla: ['SolaimanLipi', 'var(--font-hind-siliguri)', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'organic': '0 10px 30px -10px rgba(15, 61, 46, 0.12)',
        'organic-hover': '0 20px 35px -12px rgba(15, 61, 46, 0.22)',
        'honey-glow': '0 0 25px rgba(217, 119, 6, 0.35)',
        'cta': '0 4px 14px 0 rgba(217, 119, 6, 0.39)',
        'cta-hover': '0 6px 20px rgba(217, 119, 6, 0.45)',
      },
    },
  },
  plugins: [],
};
