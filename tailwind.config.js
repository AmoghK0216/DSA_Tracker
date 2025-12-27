/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-bg-primary': 'var(--bg-primary)',
        'app-bg-secondary': 'var(--bg-secondary)',
        'app-bg-tertiary': 'var(--bg-tertiary)',
        'app-card': 'var(--bg-card)',
        'app-card-hover': 'var(--bg-card-hover)',
        'app-input': 'var(--bg-input)',
        'app-input-dark': 'var(--bg-input-dark)',
        'app-accent': 'var(--accent-primary)',
        'app-accent-hover': 'var(--accent-primary-hover)',
        'app-accent-light': 'var(--accent-secondary)',
        'app-text': 'var(--text-primary)',
        'app-text-secondary': 'var(--text-secondary)',
        'app-text-muted': 'var(--text-muted)',
        'app-text-dim': 'var(--text-dim)',
        'app-border': 'var(--border-primary)',
        'app-border-secondary': 'var(--border-secondary)',
        'app-border-accent': 'var(--border-accent)',
        'app-border-success': 'var(--border-success)',
      },
    },
  },
  plugins: [],
}
