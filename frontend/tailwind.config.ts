import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sn: {
          green: '#00853F',
          yellow: '#FDEF42',
          'yellow-dark': '#C7A500',
          red: '#E31B23',
        },
        dark: {
          bg: '#0B141A',
          surface: '#1F2C34',
          input: '#233039',
          border: '#2A3942',
        },
        light: {
          bg: '#FFFFFF',
          surface: '#F0F2F5',
          border: '#E9EDEF',
        },
        bubble: {
          'out-dark': '#005C4B',
          'out-light': '#D9FDD3',
          'in-dark': '#1F2C34',
          'in-light': '#FFFFFF',
        },
        text: {
          primary: {
            dark: '#E9EDEF',
            light: '#111B21',
          },
          secondary: {
            dark: '#8696A0',
            light: '#667781',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
