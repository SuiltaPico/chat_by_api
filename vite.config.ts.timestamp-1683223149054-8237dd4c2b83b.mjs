// vite.config.ts
import { resolve } from "path";
import { defineConfig } from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/vite@4.3.3_ir5wd54q7wmqlql6kdtadsrxui/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/@vitejs+plugin-vue@4.2.1_vite@4.3.3+vue@3.2.47/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.0.1_vite@4.3.3+vue@3.2.47/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import { quasar, transformAssetUrls } from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/@quasar+vite-plugin@1.3.1_bh46wc2xnxktqchohuuq4n6zl4/node_modules/@quasar/vite-plugin/dist/index.js";
import crossOriginIsolation from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/vite-plugin-cross-origin-isolation@0.1.6/node_modules/vite-plugin-cross-origin-isolation/src/vite-plugins-cross-origin-isolation.mjs";
import autoprefixer from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/autoprefixer@10.4.14_postcss@8.4.23/node_modules/autoprefixer/lib/autoprefixer.js";
import tailwindcss from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/tailwindcss@3.3.2/node_modules/tailwindcss/lib/index.js";
import tailwindcss_nesting from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/tailwindcss@3.3.2/node_modules/tailwindcss/nesting/index.js";
import { NodeGlobalsPolyfillPlugin } from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/@esbuild-plugins+node-globals-polyfill@0.2.3/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
import { NodeModulesPolyfillPlugin } from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/@esbuild-plugins+node-modules-polyfill@0.2.2/node_modules/@esbuild-plugins/node-modules-polyfill/dist/index.js";
import nodePolyfills from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/rollup-plugin-polyfill-node@0.12.0/node_modules/rollup-plugin-polyfill-node/dist/index.js";
import cjs from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/@rollup+plugin-commonjs@24.1.0/node_modules/@rollup/plugin-commonjs/dist/es/index.js";
var __vite_injected_original_dirname = "D:\\repos\\x\\ChatWithKey";
var polyfill_rollup_options_plugins = [
  // Enable rollup polyfills plugin
  // used during production bundling
  nodePolyfills({
    include: ["node_modules/**/*.js", "../../node_modules/**/*.js"]
  }),
  cjs()
];
var polyfill_alias = {
  process: "rollup-plugin-node-polyfills/polyfills/process-es6",
  buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6",
  events: "rollup-plugin-node-polyfills/polyfills/events",
  util: "rollup-plugin-node-polyfills/polyfills/util",
  sys: "util",
  stream: "rollup-plugin-node-polyfills/polyfills/stream",
  _stream_duplex: "rollup-plugin-node-polyfills/polyfills/readable-stream/duplex",
  _stream_passthrough: "rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough",
  _stream_readable: "rollup-plugin-node-polyfills/polyfills/readable-stream/readable",
  _stream_writable: "rollup-plugin-node-polyfills/polyfills/readable-stream/writable",
  _stream_transform: "rollup-plugin-node-polyfills/polyfills/readable-stream/transform"
};
var polyfill_esbuild_options_define = {
  // Node.js global to browser globalThis
  global: "globalThis"
};
var polyfill_esbuild_options_plugins = [
  NodeGlobalsPolyfillPlugin({
    process: true
  }),
  NodeModulesPolyfillPlugin()
];
var vite_config_default = defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
      mergeProps: true
    }),
    quasar({
      sassVariables: "src/styles/quasar-variables.sass"
    }),
    crossOriginIsolation()
  ],
  server: {
    hmr: true
  },
  build: {
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        ...polyfill_rollup_options_plugins
      ]
    }
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src"),
      ...polyfill_alias
    }
  },
  css: {
    postcss: {
      plugins: [tailwindcss_nesting, tailwindcss, autoprefixer]
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        ...polyfill_esbuild_options_define
      },
      plugins: [
        ...polyfill_esbuild_options_plugins
      ]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxyZXBvc1xcXFx4XFxcXENoYXRXaXRoS2V5XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxyZXBvc1xcXFx4XFxcXENoYXRXaXRoS2V5XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9yZXBvcy94L0NoYXRXaXRoS2V5L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XHJcblxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5cclxuaW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XHJcbmltcG9ydCB2dWVKc3ggZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIjtcclxuaW1wb3J0IHsgcXVhc2FyLCB0cmFuc2Zvcm1Bc3NldFVybHMgfSBmcm9tIFwiQHF1YXNhci92aXRlLXBsdWdpblwiO1xyXG5pbXBvcnQgY3Jvc3NPcmlnaW5Jc29sYXRpb24gZnJvbSBcInZpdGUtcGx1Z2luLWNyb3NzLW9yaWdpbi1pc29sYXRpb25cIjtcclxuXHJcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSBcImF1dG9wcmVmaXhlclwiO1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSBcInRhaWx3aW5kY3NzXCI7XHJcbmltcG9ydCB0YWlsd2luZGNzc19uZXN0aW5nIGZyb20gXCJ0YWlsd2luZGNzcy9uZXN0aW5nXCI7XHJcblxyXG5cclxuLyoqIC0tLSBbU1RBUlRdIHBvbHlmaWxsIGZvciBub2RlLmpzIGxpYiAtLS0gKi9cclxuaW1wb3J0IHsgTm9kZUdsb2JhbHNQb2x5ZmlsbFBsdWdpbiB9IGZyb20gXCJAZXNidWlsZC1wbHVnaW5zL25vZGUtZ2xvYmFscy1wb2x5ZmlsbFwiO1xyXG5pbXBvcnQgeyBOb2RlTW9kdWxlc1BvbHlmaWxsUGx1Z2luIH0gZnJvbSBcIkBlc2J1aWxkLXBsdWdpbnMvbm9kZS1tb2R1bGVzLXBvbHlmaWxsXCI7XHJcbmltcG9ydCBub2RlUG9seWZpbGxzIGZyb20gXCJyb2xsdXAtcGx1Z2luLXBvbHlmaWxsLW5vZGVcIjtcclxuaW1wb3J0IGNqcyBmcm9tIFwiQHJvbGx1cC9wbHVnaW4tY29tbW9uanNcIjtcclxuXHJcbmNvbnN0IHBvbHlmaWxsX3JvbGx1cF9vcHRpb25zX3BsdWdpbnMgPSBbXHJcbiAgLy8gRW5hYmxlIHJvbGx1cCBwb2x5ZmlsbHMgcGx1Z2luXHJcbiAgLy8gdXNlZCBkdXJpbmcgcHJvZHVjdGlvbiBidW5kbGluZ1xyXG4gIG5vZGVQb2x5ZmlsbHMoe1xyXG4gICAgaW5jbHVkZTogW1wibm9kZV9tb2R1bGVzLyoqLyouanNcIiwgXCIuLi8uLi9ub2RlX21vZHVsZXMvKiovKi5qc1wiXSxcclxuICB9KSxcclxuICBjanMoKSxcclxuXTtcclxuXHJcbmNvbnN0IHBvbHlmaWxsX2FsaWFzID0ge1xyXG4gIHByb2Nlc3M6IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvcHJvY2Vzcy1lczZcIixcclxuICBidWZmZXI6IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvYnVmZmVyLWVzNlwiLFxyXG4gIGV2ZW50czogXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9ldmVudHNcIixcclxuICB1dGlsOiBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3V0aWxcIixcclxuICBzeXM6IFwidXRpbFwiLFxyXG4gIHN0cmVhbTogXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9zdHJlYW1cIixcclxuICBfc3RyZWFtX2R1cGxleDpcclxuICAgIFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvcmVhZGFibGUtc3RyZWFtL2R1cGxleFwiLFxyXG4gIF9zdHJlYW1fcGFzc3Rocm91Z2g6XHJcbiAgICBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3JlYWRhYmxlLXN0cmVhbS9wYXNzdGhyb3VnaFwiLFxyXG4gIF9zdHJlYW1fcmVhZGFibGU6XHJcbiAgICBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3JlYWRhYmxlLXN0cmVhbS9yZWFkYWJsZVwiLFxyXG4gIF9zdHJlYW1fd3JpdGFibGU6XHJcbiAgICBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3JlYWRhYmxlLXN0cmVhbS93cml0YWJsZVwiLFxyXG4gIF9zdHJlYW1fdHJhbnNmb3JtOlxyXG4gICAgXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9yZWFkYWJsZS1zdHJlYW0vdHJhbnNmb3JtXCIsXHJcbn07XHJcblxyXG5jb25zdCBwb2x5ZmlsbF9lc2J1aWxkX29wdGlvbnNfZGVmaW5lID0ge1xyXG4gIC8vIE5vZGUuanMgZ2xvYmFsIHRvIGJyb3dzZXIgZ2xvYmFsVGhpc1xyXG4gIGdsb2JhbDogXCJnbG9iYWxUaGlzXCIsXHJcbn07XHJcblxyXG4vLyBFbmFibGUgZXNidWlsZCBwb2x5ZmlsbCBwbHVnaW5zXHJcbmNvbnN0IHBvbHlmaWxsX2VzYnVpbGRfb3B0aW9uc19wbHVnaW5zID0gW1xyXG4gIE5vZGVHbG9iYWxzUG9seWZpbGxQbHVnaW4oe1xyXG4gICAgcHJvY2VzczogdHJ1ZSxcclxuICB9KSxcclxuICBOb2RlTW9kdWxlc1BvbHlmaWxsUGx1Z2luKCksXHJcbl07XHJcblxyXG4vKiogLS0tIFtFTkRdIHBvbHlmaWxsIGZvciBub2RlLmpzIGxpYiAtLS0gKi9cclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgdnVlKHsgdGVtcGxhdGU6IHsgdHJhbnNmb3JtQXNzZXRVcmxzIH0gfSksXHJcbiAgICB2dWVKc3goe1xyXG4gICAgICAvLyBvcHRpb25zIGFyZSBwYXNzZWQgb24gdG8gQHZ1ZS9iYWJlbC1wbHVnaW4tanN4XHJcbiAgICAgIG1lcmdlUHJvcHM6IHRydWUsXHJcbiAgICB9KSxcclxuICAgIHF1YXNhcih7XHJcbiAgICAgIHNhc3NWYXJpYWJsZXM6IFwic3JjL3N0eWxlcy9xdWFzYXItdmFyaWFibGVzLnNhc3NcIixcclxuICAgIH0pLFxyXG4gICAgY3Jvc3NPcmlnaW5Jc29sYXRpb24oKSxcclxuICBdLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG1yOiB0cnVlXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgLy8gRW5hYmxlIHJvbGx1cCBwb2x5ZmlsbHMgcGx1Z2luXHJcbiAgICAgICAgLi4ucG9seWZpbGxfcm9sbHVwX29wdGlvbnNfcGx1Z2lucyxcclxuICAgICAgXSxcclxuICAgIH0sXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpLFxyXG4gICAgICAuLi5wb2x5ZmlsbF9hbGlhcyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBjc3M6IHtcclxuICAgIHBvc3Rjc3M6IHtcclxuICAgICAgcGx1Z2luczogW3RhaWx3aW5kY3NzX25lc3RpbmcsIHRhaWx3aW5kY3NzLCBhdXRvcHJlZml4ZXJdLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcclxuICAgICAgZGVmaW5lOiB7XHJcbiAgICAgICAgLi4ucG9seWZpbGxfZXNidWlsZF9vcHRpb25zX2RlZmluZSxcclxuICAgICAgfSxcclxuICAgICAgcGx1Z2luczogW1xyXG4gICAgICAgIC4uLnBvbHlmaWxsX2VzYnVpbGRfb3B0aW9uc19wbHVnaW5zLFxyXG4gICAgICBdLFxyXG4gICAgfSxcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0UCxTQUFTLGVBQWU7QUFFcFIsU0FBUyxvQkFBb0I7QUFFN0IsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUNuQixTQUFTLFFBQVEsMEJBQTBCO0FBQzNDLE9BQU8sMEJBQTBCO0FBRWpDLE9BQU8sa0JBQWtCO0FBQ3pCLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8seUJBQXlCO0FBSWhDLFNBQVMsaUNBQWlDO0FBQzFDLFNBQVMsaUNBQWlDO0FBQzFDLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8sU0FBUztBQWxCaEIsSUFBTSxtQ0FBbUM7QUFvQnpDLElBQU0sa0NBQWtDO0FBQUE7QUFBQTtBQUFBLEVBR3RDLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyx3QkFBd0IsNEJBQTRCO0FBQUEsRUFDaEUsQ0FBQztBQUFBLEVBQ0QsSUFBSTtBQUNOO0FBRUEsSUFBTSxpQkFBaUI7QUFBQSxFQUNyQixTQUFTO0FBQUEsRUFDVCxRQUFRO0FBQUEsRUFDUixRQUFRO0FBQUEsRUFDUixNQUFNO0FBQUEsRUFDTixLQUFLO0FBQUEsRUFDTCxRQUFRO0FBQUEsRUFDUixnQkFDRTtBQUFBLEVBQ0YscUJBQ0U7QUFBQSxFQUNGLGtCQUNFO0FBQUEsRUFDRixrQkFDRTtBQUFBLEVBQ0YsbUJBQ0U7QUFDSjtBQUVBLElBQU0sa0NBQWtDO0FBQUE7QUFBQSxFQUV0QyxRQUFRO0FBQ1Y7QUFHQSxJQUFNLG1DQUFtQztBQUFBLEVBQ3ZDLDBCQUEwQjtBQUFBLElBQ3hCLFNBQVM7QUFBQSxFQUNYLENBQUM7QUFBQSxFQUNELDBCQUEwQjtBQUM1QjtBQUtBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUksRUFBRSxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQztBQUFBLElBQ3hDLE9BQU87QUFBQTtBQUFBLE1BRUwsWUFBWTtBQUFBLElBQ2QsQ0FBQztBQUFBLElBQ0QsT0FBTztBQUFBLE1BQ0wsZUFBZTtBQUFBLElBQ2pCLENBQUM7QUFBQSxJQUNELHFCQUFxQjtBQUFBLEVBQ3ZCO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixLQUFLO0FBQUEsRUFDUDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsU0FBUztBQUFBO0FBQUEsUUFFUCxHQUFHO0FBQUEsTUFDTDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQVcsS0FBSztBQUFBLE1BQzdCLEdBQUc7QUFBQSxJQUNMO0FBQUEsRUFDRjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gsU0FBUztBQUFBLE1BQ1AsU0FBUyxDQUFDLHFCQUFxQixhQUFhLFlBQVk7QUFBQSxJQUMxRDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLGdCQUFnQjtBQUFBLE1BQ2QsUUFBUTtBQUFBLFFBQ04sR0FBRztBQUFBLE1BQ0w7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLEdBQUc7QUFBQSxNQUNMO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
