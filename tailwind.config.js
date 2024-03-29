/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in-left": {
          from: { opacity: 0, transform: "translateX(10px)" },
          to: { opacity: 1, transform: "none" },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        ripple: {
          "0%": {
            transform: "scale(0)",
          },
          "100%": {
            transform: "scale(4)",
            opacity: 0,
          },
        },
      },
      animation: {
        "fade-in-left":
          "fade-in-left 600ms var(--animation-delay, 0ms) cubic-bezier(.21,1.02,.73,1) forwards",
        "fade-out": "fade-out 1s ease-in-out",
        ripple: "ripple 1.5s infinite",
      },
      boxShadow: {
        card: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
      },
    },
  },
  plugins: [],
};
