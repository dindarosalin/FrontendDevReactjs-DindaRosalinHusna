/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-blue": "var(--primary-blue)",
        "darker-blue": "var(--darker-blue)",
        "gray-bg": "var(--gray-bg)",
        "gray-bold": "var(--gray-bold)",
        "red": "var(--red)",
        "green": "var(--green)"
      },
    },
  },
  plugins: [],
}