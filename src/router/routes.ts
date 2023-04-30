import { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    name: "index",
    path: "/",
    component: () => import("../pages/index.vue"),
  },
];

export default routes;
