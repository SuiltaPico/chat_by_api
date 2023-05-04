import colors from "./src/styles/color";

export default {
  content: ["./src/**/*.{html,vue,tsx}"],
  theme: {
    extend: {
      colors: colors,
    },
  },
  plugins: [],
};