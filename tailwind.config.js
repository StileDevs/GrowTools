/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {}
  },
  daisyui: {
    themes: ["light", "dark"]
  },
  // eslint-disable-next-line no-undef
  plugins: [require("daisyui")]
};
