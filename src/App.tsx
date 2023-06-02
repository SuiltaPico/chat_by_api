import {
  QBtn,
  QCheckbox,
  QDrawer,
  QHeader,
  QInnerLoading,
  QLayout,
  QPageContainer,
  QTooltip,
} from "quasar";
import { defineComponent, ref } from "vue";

import { RouterView, useRouter } from "vue-router";

import { LeftBar } from "./components/LeftBar";
import use_main_store from "./store/main_store";
import { Maybe, c, refvmodel } from "./common/utils";

export default defineComponent({
  setup() {
    const ms = use_main_store();
    const router = useRouter();
    const show_left_bar = ref(false);
    const select_all = ref(false);

    return () => {
      const route = router.currentRoute.value;
      if (route.query.openai_key) {
        const openai_key = route.query.openai_key;
        const apikeys = ms.settings.apikeys.keys;
        const same = apikeys.find((it) => it.name === "from_query");
        if (!same) {
          apikeys.push({
            name: "from_query",
            key: openai_key.toString(),
            source: "OpenAI",
          });
          ms.set_settings("apikeys", ms.settings.apikeys).then(() => {
            router.replace({
              name: "new_chat",
            });
          });
        } else {
          router.replace({
            name: "new_chat",
          });
        }
      }

      return (
        <QLayout view="lHh LpR fFf">
          <QHeader {...c`app-header`}>
            <QBtn
              {...c`menu_switch`}
              flat
              icon="mdi-menu"
              onClick={() => (show_left_bar.value = true)}
            ></QBtn>
            <div id="app_header_slot"></div>
          </QHeader>
          <QDrawer
            {...c`left_drawer`}
            showIfAbove
            {...refvmodel(show_left_bar)}
            side="left"
            breakpoint={1040}
            width={ms.left_bar_width}
          >
            <LeftBar class="bg-zinc-900" />
          </QDrawer>
          <QPageContainer>
            <RouterView />
          </QPageContainer>
          <QInnerLoading
            showing={ms.is_loading}
            label="正在初始化……"
          ></QInnerLoading>
        </QLayout>
      );
    };
  },
});
