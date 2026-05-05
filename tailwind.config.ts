import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        black: {
          DEFAULT: '#000000',
          '12': 'rgba(0, 0, 0, 0.95)',
        },
        'near-white': '#f0f0f0',
        white: '#ffffff',
        orange: {
          '4': '#ff5900',
          '10': '#ff801f',
          '11': '#ffa057',
        },
        green: {
          '3': '#22ff99',
          '4': '#11ff99',
        },
        blue: {
          '4': '#0075ff',
          '5': '#0081fd',
          '10': '#3b9eff',
        },
        yellow: {
          '9': '#ffc53d',
        },
        red: {
          '5': '#ff2047',
        },
        silver: '#a1a4a5',
        'dark-gray': '#464a4d',
        'mid-gray': '#5c5c5c',
        'medium-gray': '#494949',
        'light-gray': '#f8f8f8',
        'border-gray': '#eaeaea',
        'edge-gray': '#ececec',
        'mist-gray': '#dedfdf',
        'soft-gray': '#e5e6e6',
        'frost-primary': '#fcfdff',
        frost: 'rgba(214, 235, 253, 0.19)',
        'frost-alt': 'rgba(217, 237, 254, 0.145)',
      },
      fontFamily: {
        'display-serif': ['Domaine Display', 'serif'],
        'display-sans': ['ABC Favorit', 'ui-sans-serif', 'system-ui'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        heading: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Commit Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas'],
      },
      borderRadius: {
        sharp: '4px',
        subtle: '6px',
        standard: '8px',
        comfortable: '10px',
        card: '12px',
        large: '16px',
        section: '24px',
        pill: '9999px',
      },
      boxShadow: {
        ring: 'rgba(176, 199, 217, 0.145) 0px 0px 0px 1px',
        subtle: 'rgba(0, 0, 0, 0.1) 0px 1px 3px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px',
        focus: 'rgb(0, 0, 0) 0px 0px 0px 8px',
      },
    },
  },
  plugins: [],
};

export default config;
