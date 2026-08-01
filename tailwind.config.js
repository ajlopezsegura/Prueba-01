/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:             '#252D3A',  // Azul Carbón TVBS
        'bg-card':      '#364556',  // Azul Medianoche TVBS
        'bg-deep':      '#1A2130',
        text:           '#F4F1EA',  // Blanco Marfil
        'text-muted':   'rgba(244,241,234,0.80)',
        bone:           '#E5E2DA',  // Hueso Neutro TVBS
        accent:         '#B89848',  // Oro Absoluto TVBS
        'accent-light': '#CEB060',
        signature:      '#7A2318',  // Rojo Signature TVBS
        // Aliases used in components
        cream:          '#252D3A',
        sand:           '#364556',
        gold:           '#B89848',
        'gold-light':   '#CEB060',
        ink:            '#F4F1EA',
      },
      fontFamily: {
        sans:  ['Montserrat', 'system-ui', 'sans-serif'],
        serif: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxury: '0.18em',
        wide:   '0.10em',
        title:  '0.04em',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.43, 0.13, 0.23, 0.96)',
      },
      transitionDuration: {
        800:  '800ms',
        1200: '1200ms',
      },
    },
  },
  plugins: [],
}
