import { createApp } from "vue";
import { Quasar, Notify } from "quasar";
import quasarLang from "quasar/lang/zh-CN";
import quasarIconSet from "quasar/icon-set/mdi-v6";

import dayjs from "dayjs";
import isLeapYear from "dayjs/plugin/isLeapYear";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";
import "dayjs/locale/zh-cn";

dayjs.extend(isLeapYear);
dayjs.extend(relativeTime)
dayjs.extend(calendar)
dayjs.locale("zh-cn");


// Import icon libraries
import "@quasar/extras/mdi-v6/mdi-v6.css";

// A few examples for animations from Animate.css:
// import @quasar/extras/animate/fadeIn.css
// import @quasar/extras/animate/fadeOut.css

import "quasar/src/css/index.sass";

import { createPinia } from "pinia";

import { plugin as Slicksort } from 'vue-slicksort';

import "./styles/style.css";
// import "./styles/chat.css";
// import "./styles/LeftBar.css";
// import "./styles/documents.css";
// import "./styles/settings.css";

import router from "./router/router";

import App from "./App";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Quasar, {
  // directives: {},
  plugins: { Notify }, // import Quasar plugins and add here
  lang: quasarLang,
  iconSet: quasarIconSet,
  config: {
    notify: {
      /* look at QuasarConfOptions from the API card */
    },
  },
});

app.use(Slicksort);

app.mount("#app");
