import { RouteRecordRaw } from "vue-router";

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
      if (!to.params.chatid) {
        next("/");
      } else {
        next();
      }
    },
    props: true
  },
  {
    name: "settings",
    path: "/settings",
    component: () => import("../pages/settings.tsx"),
  },
];

export default routes;
