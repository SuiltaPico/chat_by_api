import colors from "./src/styles/color";
import { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,vue,tsx}"],
  theme: {
    extend: {
      colors: colors,
    },
  },
  plugins: [],
} satisfies Config;
