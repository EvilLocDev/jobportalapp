module.exports = {
  content: [
    "./components/**/*.{js,jsx,ts,tsx}",
    "./App.js",
    "./index.js",
    "./styles/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}