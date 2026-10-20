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
        brandGreen: '#1b4332',   // গাঢ় জঙ্গল সবুজ (Forest Green)
        brandHoney: '#ffb703',   // মধুর সোনালী রঙ (Honey Gold)
        brandMustard: '#e65f2b', // সরিষা বা কাঁকড়ার টেক্সচার রঙ
        brandOrganic: '#faf9f6', // অফ-হোয়াইট ব্যাকগ্রাউন্ড (Creamy Off-white)

        // Extended Palette Scales
        forest: {
          DEFAULT: '#1b4332',
          50: '#F0F7F4',
          100: '#DCEEE6',
          200: '#BCDEC9',
          300: '#8BC4A4',
          400: '#52A379',
          500: '#2D815C',
          600: '#1b4332',
          700: '#153D31',
          800: '#102E25',
          900: '#0A1E18',
        },
        honey: {
          DEFAULT: '#ffb703',
          50: '#FFFBEA',
          100: '#FFF3C4',
          200: '#FFE588',
          300: '#FFD74C',
          400: '#FFC51A',
          500: '#ffb703',
          600: '#D99800',
          700: '#A67200',
          800: '#734E00',
          900: '#4D3400',
        },
        ochre: {
          DEFAULT: '#e65f2b',
          50: '#FDF4EF',
          100: '#FAE5DA',
          200: '#F4CAB5',
          300: '#EDA686',
          400: '#E65F2B',
          500: '#C84C1C',
          600: '#A03B13',
          700: '#782A0B',
          800: '#501B05',
          900: '#280D02',
        },
        cream: {
          DEFAULT: '#faf9f6',
          50: '#FCFBF9',
          100: '#faf9f6',
          200: '#F3EFE6',
          300: '#E8E1D2',
          400: '#D7CCB5',
        },
      },
      fontFamily: {
        bangla: ['SolaimanLipi', 'var(--font-hind-siliguri)', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'organic': '0 10px 30px -10px rgba(27, 67, 50, 0.12)',
        'organic-hover': '0 20px 35px -12px rgba(27, 67, 50, 0.22)',
        'honey-glow': '0 0 25px rgba(255, 183, 3, 0.35)',
      },
    },
  },
  plugins: [],
};
