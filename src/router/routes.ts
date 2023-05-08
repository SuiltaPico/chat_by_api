import { RouteRecordRaw } from "vue-router";
import use_main_store from "../store/main_store.ts";

const routes: RouteRecordRaw[] = [
  {
    name: "index",
    path: "/",
    component: () => import("../pages/index.tsx"),
  },
  {
    name: "chat",
    path: "/chat/:chatid?",
    component: () => import("../pages/chat.tsx"),
    // 当 chatid 为空时，跳转到首页
    beforeEnter: (to, from, next) => {
      const ms = use_main_store();
      // [impl: use_raw_render]
      ms.curry_chat.use_raw_render = {};
      ms.curry_chat.id = undefined;
      ms.curry_chat.messages = [];

      if (!to.params.chatid) {
        next("/");
      } else {
        next();
      }
    },
    props: true,
  },
  {
    name: "settings",
    path: "/settings",
    component: () => import("../pages/settings.tsx"),
  },
];

export default routes;
