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
        // Specific Brand Theme Colors (Matching Satkhira Ghor Logo: Leaf Green & Honeycomb Gold)
        brandGreen: '#016831',   // রিচ অর্গানিক গ্রিন (Satkhira Leaf Green from logo)
        brandHoney: '#FAB116',   // মধুর সোনালী / অ্যাম্বার রঙ (Honey Gold from logo)
        brandMustard: '#E08E00', // মধুর ঘন রঙ
        brandOrganic: '#FAF9F5', // অফ-হোয়াইট ব্যাকগ্রাউন্ড (Warm Clean Backdrop)

        // Brand Design Tokens
        brand: {
          primary: '#016831',
          primaryDark: '#014D24',
          primaryLight: '#02833E',
          accent: '#FAB116',
          accentHover: '#E08E00',
          accentLight: '#FEF3C7',
          bg: '#FAF9F5',
          card: '#FFFFFF',
          text: '#111827',
        },

        // Extended Palette Scales
        forest: {
          DEFAULT: '#016831',
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#02833E',
          600: '#016831',
          700: '#015629',
          800: '#014D24',
          900: '#013C1C',
          950: '#002913',
        },
        honey: {
          DEFAULT: '#FAB116',
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#FAB116',
          600: '#E08E00',
          700: '#B86D00',
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
