/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#F5F8FF",
          surface: "#FFFFFF",
          "surface-soft": "#E8F1FF",
          "pastel-blue": "#A9C9FF",
          primary: "#477DCC",
          "primary-hover": "#3665A8",
          text: "#172B4D",
          "text-muted": "#718096",
          border: "#DCE6F3",
          success: "#2F855A",
          error: "#D64545"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'studio': '12px',
        'studio-lg': '16px',
      }
    },
  },
  plugins: [],
}
