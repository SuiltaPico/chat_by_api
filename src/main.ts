import { createApp } from "vue";
import { Quasar, Notify } from "quasar";
import quasarLang from "quasar/lang/zh-CN";
import quasarIconSet from "quasar/icon-set/mdi-v6";
import "./styles/color";

// Import icon libraries
import "@quasar/extras/mdi-v6/mdi-v6.css";

// A few examples for animations from Animate.css:
// import @quasar/extras/animate/fadeIn.css
// import @quasar/extras/animate/fadeOut.css

import "quasar/src/css/index.sass";

import { createPinia } from "pinia";

import "./styles/style.css";

import router from "./router/router";

import App from "./App";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(Quasar, {
  directives: {},
  plugins: { Notify }, // import Quasar plugins and add here
  lang: quasarLang,
  iconSet: quasarIconSet,
  config: {
    notify: {
      /* look at QuasarConfOptions from the API card */
    },
  },
});

app.mount("#app");
