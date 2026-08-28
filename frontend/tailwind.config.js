/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213D",
        paper: "#F7F5F2",
        brass: "#C9A227",
        rose: "#B5495B",
        sage: "#5B8266",
        mist: "#E7E3DB",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,33,61,0.06), 0 8px 24px rgba(20,33,61,0.06)",
      },
    },
  },
  plugins: [],
};
