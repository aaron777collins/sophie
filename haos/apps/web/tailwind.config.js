/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Discord-style color scheme
        primary: {
          50: '#f0f3ff',
          100: '#e0e6ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#5865f2', // Discord blurple
          600: '#4c51bf',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0f0f0f', // Almost black for Discord-style dark theme
        },
        discord: {
          dark: '#2b2d31', // Discord dark background
          darker: '#1e1f22', // Discord darker background
          light: '#313338', // Discord light dark background
          accent: '#5865f2', // Discord accent
          green: '#23a559', // Discord green (online)
          red: '#f23f42', // Discord red (offline/error)
          yellow: '#f0b132', // Discord yellow (away)
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}