// vite.config.ts
import { resolve } from "path";
import { defineConfig } from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/vite@4.3.9_kmj7c632ajcgpo2cz4t7uksaei/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/@vitejs+plugin-vue@4.2.3_vite@4.3.9+vue@3.3.4/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/@vitejs+plugin-vue-jsx@3.0.1_vite@4.3.9+vue@3.3.4/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import { quasar, transformAssetUrls } from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/@quasar+vite-plugin@1.3.3_noe4vwvkg2edwzncqlakn4u6ma/node_modules/@quasar/vite-plugin/dist/index.js";
import crossOriginIsolation from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/vite-plugin-cross-origin-isolation@0.1.6/node_modules/vite-plugin-cross-origin-isolation/src/vite-plugins-cross-origin-isolation.mjs";
import json5_plugin from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/vite-plugin-json5@1.0.5_vite@4.3.9/node_modules/vite-plugin-json5/dist/index.js";
import autoprefixer from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/autoprefixer@10.4.14_postcss@8.4.24/node_modules/autoprefixer/lib/autoprefixer.js";
import tailwindcss from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/tailwindcss@3.3.2/node_modules/tailwindcss/lib/index.js";
import tailwindcss_nesting from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/tailwindcss@3.3.2/node_modules/tailwindcss/nesting/index.js";
import { NodeGlobalsPolyfillPlugin } from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/@esbuild-plugins+node-globals-polyfill@0.2.3/node_modules/@esbuild-plugins/node-globals-polyfill/dist/index.js";
import { NodeModulesPolyfillPlugin } from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/@esbuild-plugins+node-modules-polyfill@0.2.2/node_modules/@esbuild-plugins/node-modules-polyfill/dist/index.js";
import nodePolyfills from "file:///D:/repos/x/ChatWithKey/node_modules/.pnpm/rollup-plugin-polyfill-node@0.12.0/node_modules/rollup-plugin-polyfill-node/dist/index.js";
var __vite_injected_original_dirname = "D:\\repos\\x\\ChatWithKey";
var polyfill_rollup_options_plugins = [
  // Enable rollup polyfills plugin
  // used during production bundling
  nodePolyfills({
    include: [
      "node_modules/pouchdb/*.js",
      "../../node_modules/pouchdb/*.js",
      "node_modules/pouchdb-find/*.js",
      "../../node_modules/pouchdb-find/*.js"
    ]
  })
  // cjs(),
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
    crossOriginIsolation(),
    json5_plugin()
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
      plugins: [...polyfill_esbuild_options_plugins]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxyZXBvc1xcXFx4XFxcXENoYXRXaXRoS2V5XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxyZXBvc1xcXFx4XFxcXENoYXRXaXRoS2V5XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9yZXBvcy94L0NoYXRXaXRoS2V5L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XHJcblxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5cclxuaW1wb3J0IHZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XHJcbmltcG9ydCB2dWVKc3ggZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIjtcclxuaW1wb3J0IHsgcXVhc2FyLCB0cmFuc2Zvcm1Bc3NldFVybHMgfSBmcm9tIFwiQHF1YXNhci92aXRlLXBsdWdpblwiO1xyXG5pbXBvcnQgY3Jvc3NPcmlnaW5Jc29sYXRpb24gZnJvbSBcInZpdGUtcGx1Z2luLWNyb3NzLW9yaWdpbi1pc29sYXRpb25cIjtcclxuaW1wb3J0IGpzb241X3BsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1qc29uNSdcclxuXHJcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSBcImF1dG9wcmVmaXhlclwiO1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSBcInRhaWx3aW5kY3NzXCI7XHJcbmltcG9ydCB0YWlsd2luZGNzc19uZXN0aW5nIGZyb20gXCJ0YWlsd2luZGNzcy9uZXN0aW5nXCI7XHJcblxyXG4vKiogLS0tIFtTVEFSVF0gcG9seWZpbGwgZm9yIG5vZGUuanMgbGliIC0tLSAqL1xyXG5pbXBvcnQgeyBOb2RlR2xvYmFsc1BvbHlmaWxsUGx1Z2luIH0gZnJvbSBcIkBlc2J1aWxkLXBsdWdpbnMvbm9kZS1nbG9iYWxzLXBvbHlmaWxsXCI7XHJcbmltcG9ydCB7IE5vZGVNb2R1bGVzUG9seWZpbGxQbHVnaW4gfSBmcm9tIFwiQGVzYnVpbGQtcGx1Z2lucy9ub2RlLW1vZHVsZXMtcG9seWZpbGxcIjtcclxuaW1wb3J0IG5vZGVQb2x5ZmlsbHMgZnJvbSBcInJvbGx1cC1wbHVnaW4tcG9seWZpbGwtbm9kZVwiO1xyXG5pbXBvcnQgY2pzIGZyb20gXCJAcm9sbHVwL3BsdWdpbi1jb21tb25qc1wiO1xyXG5cclxuY29uc3QgcG9seWZpbGxfcm9sbHVwX29wdGlvbnNfcGx1Z2lucyA9IFtcclxuICAvLyBFbmFibGUgcm9sbHVwIHBvbHlmaWxscyBwbHVnaW5cclxuICAvLyB1c2VkIGR1cmluZyBwcm9kdWN0aW9uIGJ1bmRsaW5nXHJcbiAgbm9kZVBvbHlmaWxscyh7XHJcbiAgICBpbmNsdWRlOiBbXHJcbiAgICAgIFwibm9kZV9tb2R1bGVzL3BvdWNoZGIvKi5qc1wiLFxyXG4gICAgICBcIi4uLy4uL25vZGVfbW9kdWxlcy9wb3VjaGRiLyouanNcIixcclxuICAgICAgXCJub2RlX21vZHVsZXMvcG91Y2hkYi1maW5kLyouanNcIixcclxuICAgICAgXCIuLi8uLi9ub2RlX21vZHVsZXMvcG91Y2hkYi1maW5kLyouanNcIixcclxuICAgIF0sXHJcbiAgfSksXHJcbiAgLy8gY2pzKCksXHJcbl07XHJcblxyXG5jb25zdCBwb2x5ZmlsbF9hbGlhcyA9IHtcclxuICBwcm9jZXNzOiBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3Byb2Nlc3MtZXM2XCIsXHJcbiAgYnVmZmVyOiBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL2J1ZmZlci1lczZcIixcclxuICBldmVudHM6IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvZXZlbnRzXCIsXHJcbiAgdXRpbDogXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy91dGlsXCIsXHJcbiAgc3lzOiBcInV0aWxcIixcclxuICBzdHJlYW06IFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvc3RyZWFtXCIsXHJcbiAgX3N0cmVhbV9kdXBsZXg6XHJcbiAgICBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMvcG9seWZpbGxzL3JlYWRhYmxlLXN0cmVhbS9kdXBsZXhcIixcclxuICBfc3RyZWFtX3Bhc3N0aHJvdWdoOlxyXG4gICAgXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9yZWFkYWJsZS1zdHJlYW0vcGFzc3Rocm91Z2hcIixcclxuICBfc3RyZWFtX3JlYWRhYmxlOlxyXG4gICAgXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9yZWFkYWJsZS1zdHJlYW0vcmVhZGFibGVcIixcclxuICBfc3RyZWFtX3dyaXRhYmxlOlxyXG4gICAgXCJyb2xsdXAtcGx1Z2luLW5vZGUtcG9seWZpbGxzL3BvbHlmaWxscy9yZWFkYWJsZS1zdHJlYW0vd3JpdGFibGVcIixcclxuICBfc3RyZWFtX3RyYW5zZm9ybTpcclxuICAgIFwicm9sbHVwLXBsdWdpbi1ub2RlLXBvbHlmaWxscy9wb2x5ZmlsbHMvcmVhZGFibGUtc3RyZWFtL3RyYW5zZm9ybVwiLFxyXG59O1xyXG5cclxuY29uc3QgcG9seWZpbGxfZXNidWlsZF9vcHRpb25zX2RlZmluZSA9IHtcclxuICAvLyBOb2RlLmpzIGdsb2JhbCB0byBicm93c2VyIGdsb2JhbFRoaXNcclxuICBnbG9iYWw6IFwiZ2xvYmFsVGhpc1wiLFxyXG59O1xyXG5cclxuLy8gRW5hYmxlIGVzYnVpbGQgcG9seWZpbGwgcGx1Z2luc1xyXG5jb25zdCBwb2x5ZmlsbF9lc2J1aWxkX29wdGlvbnNfcGx1Z2lucyA9IFtcclxuICBOb2RlR2xvYmFsc1BvbHlmaWxsUGx1Z2luKHtcclxuICAgIHByb2Nlc3M6IHRydWUsXHJcbiAgfSksXHJcbiAgTm9kZU1vZHVsZXNQb2x5ZmlsbFBsdWdpbigpLFxyXG5dO1xyXG5cclxuLyoqIC0tLSBbRU5EXSBwb2x5ZmlsbCBmb3Igbm9kZS5qcyBsaWIgLS0tICovXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSh7IHRlbXBsYXRlOiB7IHRyYW5zZm9ybUFzc2V0VXJscyB9IH0pLFxyXG4gICAgdnVlSnN4KHtcclxuICAgICAgLy8gb3B0aW9ucyBhcmUgcGFzc2VkIG9uIHRvIEB2dWUvYmFiZWwtcGx1Z2luLWpzeFxyXG4gICAgICBtZXJnZVByb3BzOiB0cnVlLFxyXG4gICAgfSksXHJcbiAgICBxdWFzYXIoe1xyXG4gICAgICBzYXNzVmFyaWFibGVzOiBcInNyYy9zdHlsZXMvcXVhc2FyLXZhcmlhYmxlcy5zYXNzXCIsXHJcbiAgICB9KSxcclxuICAgIGNyb3NzT3JpZ2luSXNvbGF0aW9uKCksXHJcbiAgICBqc29uNV9wbHVnaW4oKVxyXG4gIF0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBobXI6IHRydWUsXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgLy8gRW5hYmxlIHJvbGx1cCBwb2x5ZmlsbHMgcGx1Z2luXHJcbiAgICAgICAgLi4ucG9seWZpbGxfcm9sbHVwX29wdGlvbnNfcGx1Z2lucyxcclxuICAgICAgXSxcclxuICAgIH0sXHJcbiAgfSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpLFxyXG4gICAgICAuLi5wb2x5ZmlsbF9hbGlhcyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBjc3M6IHtcclxuICAgIHBvc3Rjc3M6IHtcclxuICAgICAgcGx1Z2luczogW3RhaWx3aW5kY3NzX25lc3RpbmcsIHRhaWx3aW5kY3NzLCBhdXRvcHJlZml4ZXJdLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcclxuICAgICAgZGVmaW5lOiB7XHJcbiAgICAgICAgLi4ucG9seWZpbGxfZXNidWlsZF9vcHRpb25zX2RlZmluZSxcclxuICAgICAgfSxcclxuICAgICAgcGx1Z2luczogWy4uLnBvbHlmaWxsX2VzYnVpbGRfb3B0aW9uc19wbHVnaW5zXSxcclxuICAgIH0sXHJcbiAgfSxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFAsU0FBUyxlQUFlO0FBRXBSLFNBQVMsb0JBQW9CO0FBRTdCLE9BQU8sU0FBUztBQUNoQixPQUFPLFlBQVk7QUFDbkIsU0FBUyxRQUFRLDBCQUEwQjtBQUMzQyxPQUFPLDBCQUEwQjtBQUNqQyxPQUFPLGtCQUFrQjtBQUV6QixPQUFPLGtCQUFrQjtBQUN6QixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLHlCQUF5QjtBQUdoQyxTQUFTLGlDQUFpQztBQUMxQyxTQUFTLGlDQUFpQztBQUMxQyxPQUFPLG1CQUFtQjtBQWpCMUIsSUFBTSxtQ0FBbUM7QUFvQnpDLElBQU0sa0NBQWtDO0FBQUE7QUFBQTtBQUFBLEVBR3RDLGNBQWM7QUFBQSxJQUNaLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0YsQ0FBQztBQUFBO0FBRUg7QUFFQSxJQUFNLGlCQUFpQjtBQUFBLEVBQ3JCLFNBQVM7QUFBQSxFQUNULFFBQVE7QUFBQSxFQUNSLFFBQVE7QUFBQSxFQUNSLE1BQU07QUFBQSxFQUNOLEtBQUs7QUFBQSxFQUNMLFFBQVE7QUFBQSxFQUNSLGdCQUNFO0FBQUEsRUFDRixxQkFDRTtBQUFBLEVBQ0Ysa0JBQ0U7QUFBQSxFQUNGLGtCQUNFO0FBQUEsRUFDRixtQkFDRTtBQUNKO0FBRUEsSUFBTSxrQ0FBa0M7QUFBQTtBQUFBLEVBRXRDLFFBQVE7QUFDVjtBQUdBLElBQU0sbUNBQW1DO0FBQUEsRUFDdkMsMEJBQTBCO0FBQUEsSUFDeEIsU0FBUztBQUFBLEVBQ1gsQ0FBQztBQUFBLEVBQ0QsMEJBQTBCO0FBQzVCO0FBS0EsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSSxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxDQUFDO0FBQUEsSUFDeEMsT0FBTztBQUFBO0FBQUEsTUFFTCxZQUFZO0FBQUEsSUFDZCxDQUFDO0FBQUEsSUFDRCxPQUFPO0FBQUEsTUFDTCxlQUFlO0FBQUEsSUFDakIsQ0FBQztBQUFBLElBQ0QscUJBQXFCO0FBQUEsSUFDckIsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLEtBQUs7QUFBQSxFQUNQO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixTQUFTO0FBQUE7QUFBQSxRQUVQLEdBQUc7QUFBQSxNQUNMO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsTUFDN0IsR0FBRztBQUFBLElBQ0w7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxTQUFTO0FBQUEsTUFDUCxTQUFTLENBQUMscUJBQXFCLGFBQWEsWUFBWTtBQUFBLElBQzFEO0FBQUEsRUFDRjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osZ0JBQWdCO0FBQUEsTUFDZCxRQUFRO0FBQUEsUUFDTixHQUFHO0FBQUEsTUFDTDtBQUFBLE1BQ0EsU0FBUyxDQUFDLEdBQUcsZ0NBQWdDO0FBQUEsSUFDL0M7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
