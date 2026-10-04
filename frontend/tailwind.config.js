module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ledger: {
          canvas: '#f5eddf',
          sidebar: '#f2e8d8',
          surface: '#fffaf1',
          ink: '#30261f',
          muted: '#786b5e',
          line: '#d9cbb8',
          red: '#df4a3f',
          green: '#4b8064',
          amber: '#a77738',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        tactile: '3px 3px 0 rgba(43,33,24,.72)',
      },
    },
  },
};
