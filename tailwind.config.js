/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-italiana)', 'Georgia', 'serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-montserrat)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['var(--font-italiana)', 'Georgia', 'serif'],
      },
      colors: {
        // Layachi Bedding — Luxury Bedding Warm Palette
        'zak-black': {
          DEFAULT: '#0F0F0F',
          soft: '#1A1613',
          muted: '#2C2520',
        },
        'zak-charcoal': '#2C2520',
        'zak-white': {
          DEFAULT: '#FDFBF7',
          off: '#FAF7F0',
          warm: '#F5EFE0',
        },
        'zak-gray': {
          50:  '#FAF7F0',
          100: '#F5EFE0',
          200: '#E8DCC8',
          300: '#D4C9B4',
          400: '#A89A82',
          500: '#7A6F60',
          600: '#5C5245',
          700: '#403830',
          800: '#261F19',
          900: '#1A1613',
        },
        // Legacy names mapped to Layachi values
        'crema':  '#FAF7F0',
        'grigio': '#1A1613',
        'oro':    '#D4AF37',

        // Legacy Italian color aliases → mapped to Layachi Bedding palette
        // so that old class names (e.g. bg-italia-green) still compile
        'italia-green': {
          DEFAULT: '#0F0F0F',
          dark:    '#000000',
          light:   '#1A1613',
        },
        'italia-red': {
          DEFAULT: '#2C2520',
          dark:    '#1A1613',
          light:   '#403830',
        },
        'italia-white': '#FDFBF7',

        // Shopify Dawn-style utility tokens (warm-shifted)
        'shopify-black':  '#0F0F0F',
        'shopify-bg':     '#FAF7F0',
        'shopify-border': '#E2D9C8',
        'shopify-text':   '#7A6F60',

        // Semantic Aliases
        primary: {
          DEFAULT: '#0F0F0F',
          dark:    '#000000',
          light:   '#1A1613',
        },
        secondary: {
          DEFAULT: '#FAF7F0',
          dark:    '#F5EFE0',
        },
        accent: {
          DEFAULT: '#D4AF37',
          light:   '#E5C65C',
          dark:    '#B8952D',
        },
        gold: '#D4AF37',
      },
      boxShadow: {
        'zak-sm':     '0 2px 4px rgba(0, 0, 0, 0.08)',
        'zak-md':     '0 4px 12px rgba(0, 0, 0, 0.12)',
        'zak-lg':     '0 8px 24px rgba(0, 0, 0, 0.16)',
        'hover-lift': '0 12px 32px rgba(0, 0, 0, 0.14)',
        'elegant':    '0 4px 20px rgba(0, 0, 0, 0.08)',
        // Legacy aliases
        'italia-sm': '0 2px 4px rgba(0, 0, 0, 0.08)',
        'italia-md': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'italia-lg': '0 8px 24px rgba(0, 0, 0, 0.16)',
      },
      animation: {
        'fade-in':     'fadeIn 0.6s ease-out',
        'slide-up':    'slideUp 0.6s ease-out',
        'scale-in':    'scaleIn 0.3s ease-out',
        'scroll-reveal':'scrollReveal 0.8s ease-out forwards',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        flagWave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        scrollReveal: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
