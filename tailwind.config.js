const v = (n) => `rgb(var(--${n}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'] },
      colors: {
        bg: v('bg'), surface: v('surface'), surface2: v('surface2'), line: v('line'),
        ink: v('ink'), mute: v('mute'), accent: v('accent'), 'accent-ink': v('accent-ink'),
        ok: v('ok'), warn: v('warn'), bad: v('bad'),
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'none' } },
        pop: { from: { opacity: 0, transform: 'scale(.96)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { 'fade-in': 'fadeIn .25s ease-out', pop: 'pop .18s ease-out' },
    },
  },
  plugins: [],
};
