/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#001519",
          secondary: "#182226",
        },
        // primary: "#4483cc",
        // primary: "#5ca0df",
        // primary: "#74b0e4",
        primary: {
          DEFAULT: "#74b0e4",
          50: "#e4f1fa",
          100: "#bedcf4",
          200: "#98c7ed",
          300: "#74b0e4",
          400: "#5ca0df",
          500: "#4b91d9",
          600: "#4483cc",
          700: "#3c72ba",
          800: "#3562a7",
          900: "#294587",
        },
        // secondary: "#cc8d44",
        secondary: "#ddb26c",
        text: {
          DEFAULT: "#dddfdf",
          50: "#f8fafa",
          100: "#f3f5f5",
          200: "#ebeded",
          300: "#dddfdf",
          400: "#babcbc",
          500: "#9b9d9d",
          600: "#727474",
          700: "#5e6060",
          800: "#3f4141",
          900: "#1f2020",
          primary: "#dddfdf",
          secondary: "#9b9d9d",
        },
      },
    },
  },
  corePlugins: {
    // aspectRatio: false,
  },
  plugins: [
    // require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
  ],
};
