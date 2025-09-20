/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/devlink/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['var(--font-montserrat)', 'sans-serif'],
        'sans': ['var(--font-montserrat)', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        'mono': ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
}