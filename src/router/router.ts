import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import { once } from "lodash";
import { get_item_name_from_route_name } from "../components/leftbar/LeftBar";
import use_main_store from "../store/memory/main_store";

const router = createRouter({
  routes,
  history: createWebHistory(),
});

// 控制左侧栏的焦点为当前所在路由对应的项目
router.beforeEach(
  once((to, from) => {
    const ms = use_main_store();

    ms.left_bar.selected_name =
      get_item_name_from_route_name(to.name as string) ?? "chat";
  })
);

export default router;
