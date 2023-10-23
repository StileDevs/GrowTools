/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {}
  },

  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
    require("flowbite/plugin")
  ],
  darkMode: "class"
};
