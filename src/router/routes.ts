import { RouteRecordRaw } from "vue-router";
import use_main_store from "../store/main_store.ts";
import index_page from "../pages/new_chat.tsx";
import chat_page from "../pages/chat.tsx";
import settings_page from "../pages/settings.tsx";

const routes: RouteRecordRaw[] = [
  {
    name: "new_chat",
    path: "/chat/new_chat",
    alias: "/",
    component: () => Promise.resolve(index_page),
  },
  {
    name: "chat",
    path: "/chat/:chatid?",
    component: () => Promise.resolve(chat_page),
    // 当 chatid 为空时，跳转到首页
    beforeEnter: (to, from, next) => {
      const ms = use_main_store();
      // [impl: use_raw_render]
      ms.curry_chat.clear_cache();

      if (!to.params.chatid) {
        next("/");
      } else {
        next();
      }
    },
    props: true,
  },
  {
    name: "document_manager",
    path: "/document_manager",
    component: () => import("../pages/document_manager.tsx"),
  },
  {
    name: "settings",
    path: "/settings",
    component: () => Promise.resolve(settings_page),
  },
];

export default routes;
