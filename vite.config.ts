import { resolve } from "path";

import { defineConfig } from "vite";

import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";

import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import tailwindcss_nesting from "tailwindcss/nesting";


/** --- [START] polyfill for node.js lib --- */
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import nodePolyfills from "rollup-plugin-polyfill-node";
import cjs from "@rollup/plugin-commonjs";

const polyfill_rollup_options_plugins = [
  // Enable rollup polyfills plugin
  // used during production bundling
  nodePolyfills({
    include: ["node_modules/**/*.js", "../../node_modules/**/*.js"],
  }),
  cjs(),
];

const polyfill_alias = {
  process: "rollup-plugin-node-polyfills/polyfills/process-es6",
  buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6",
  events: "rollup-plugin-node-polyfills/polyfills/events",
  util: "rollup-plugin-node-polyfills/polyfills/util",
  sys: "util",
  stream: "rollup-plugin-node-polyfills/polyfills/stream",
  _stream_duplex:
    "rollup-plugin-node-polyfills/polyfills/readable-stream/duplex",
  _stream_passthrough:
    "rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough",
  _stream_readable:
    "rollup-plugin-node-polyfills/polyfills/readable-stream/readable",
  _stream_writable:
    "rollup-plugin-node-polyfills/polyfills/readable-stream/writable",
  _stream_transform:
    "rollup-plugin-node-polyfills/polyfills/readable-stream/transform",
};

const polyfill_esbuild_options_define = {
  // Node.js global to browser globalThis
  global: "globalThis",
};

// Enable esbuild polyfill plugins
const polyfill_esbuild_options_plugins = [
  NodeGlobalsPolyfillPlugin({
    process: true,
  }),
  NodeModulesPolyfillPlugin(),
];

/** --- [END] polyfill for node.js lib --- */

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
      mergeProps: true,
    }),
    quasar({
      sassVariables: "src/styles/quasar-variables.sass",
    }),
    crossOriginIsolation(),
  ],
  server: {
    hmr: true
  },
  build: {
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        ...polyfill_rollup_options_plugins,
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      ...polyfill_alias,
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss_nesting, tailwindcss, autoprefixer],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        ...polyfill_esbuild_options_define,
      },
      plugins: [
        ...polyfill_esbuild_options_plugins,
      ],
    },
  },
});
