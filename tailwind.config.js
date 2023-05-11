/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in-left": {
          from: { opacity: 0, transform: "translateX(10px)" },
          to: { opacity: 1, transform: "none" },
        },
      },
      animation: {
        "fade-in-left":
          "fade-in-left 600ms var(--animation-delay, 0ms) cubic-bezier(.21,1.02,.73,1) forwards",
      },
    },
  },
  plugins: [],
};
