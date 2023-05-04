/** 为 tailwind css intellisense 准备的 cjs 版配置 */

// tailwind css intellisense 插件仅支持 cjs 模块，所以在这里手动将 ts 转 js
const fs = require("fs")
const ts = require("typescript")

/** 从字符串导入模块 */
function require_from_string(src, filename) {
  const Module = module.constructor;
  const m = new Module();
  m._compile(src, filename);
  return m.exports;
}

// 转换配置尽量与 tsconfig.json 保持一致
const ts_config_path = "./tsconfig.json"
/** @type {import("typescript").TranspileOptions} */
const ts_config = ts.parseConfigFileTextToJson(ts_config_path, fs.readFileSync(ts_config_path, 'utf8')).config
// 转换为 cjs 模块
ts_config.compilerOptions.module = "CommonJS"

const ts_src = {
  colors: "./src/styles/color.ts"
}

/** @type {Map<keyof typeof ts_src, any>} */
const module_map = new Map()

// 从 `ts_src` 中生成并导入 cjs 模块
for (const [name, path] of Object.entries(ts_src)) {
  const src = fs.readFileSync(path, 'utf8')
  const js_src = ts.transpileModule(src, ts_config).outputText
  module_map.set(name, require_from_string(js_src, path))
}

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{html,vue,tsx}"],
  theme: {
    extend: {
      colors: module_map.get("colors").default.main
    },
  },
  plugins: [],
};
