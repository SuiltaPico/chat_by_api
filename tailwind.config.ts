import colors from "./src/styles/color";

export default {
  content: ["./src/**/*.{html,vue}"],
  theme: {
    extend: {
      colors: colors,
    },
  },
  plugins: [],
};