import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['"Cairo"', '"Tajawal"', 'sans-serif']
      },
      colors: {
        primary: {
          DEFAULT: '#7b3a72',
          dark: '#5e2a56',
          light: '#a07098',
          soft: '#f3e8f3'
        },
        accent: {
          DEFAULT: '#c084b0',
          dark: '#a06090'
        },
        plum: '#642f5e'
      }
    }
  },
  plugins: []
};
export default config;