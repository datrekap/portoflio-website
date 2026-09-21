/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        content: "var(--page-max-width)",
      },
      fontWeight: {
        semibold: "500",
      },
      fontFamily: {
        sans: [
          "Montserrat",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "Major Mono Display",
          "ui-monospace",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
