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
import { defineComponent, onMounted, ref } from "vue";

import { RouterView, useRouter } from "vue-router";

import { LeftBar } from "./components/leftbar/LeftBar";
import use_main_store from "./store/memory/main_store";
import { Maybe, c, refvmodel, refvmodel_type } from "./common/utils";
import { vif } from "./common/jsx_utils";
import { ChatRecordOperatingMode } from "./pages/chat";
import { nanoid } from "nanoid";
import { RiskWarningDialog } from "./components/framework/RiskWarningDialog";

export default defineComponent({
  setup() {
    const ms = use_main_store();
    // @ts-ignore
    window.ms = ms;
    const router = useRouter();
    const show_left_bar = ref(false);
    const select_all = ref(false);

    const show_risk_warning_dialog = ref(false);

    onMounted(() => {
      if (ms.client_info.engine.name === "Gecko") {
        console.log(navigator.userAgent);
        show_risk_warning_dialog.value = true;
      }
    });

    return () => {
      const route = router.currentRoute.value;
      const settings = ms.settings.settings;
      if (route.query.openai_key) {
        const openai_key = route.query.openai_key;
        const apikeys = settings.apikeys.keys;
        const same = apikeys.find((it) => it.name === "from_query");
        if (!same) {
          ms.push_to_db_task_queue(async () => {
            apikeys.push({
              id: Date.now() + nanoid(),
              name: "from_query",
              key: openai_key.toString(),
              source: "OpenAI",
            });
            await ms.settings
              .set_setting("apikeys", settings.apikeys)
              .then(() => {
                router.replace({
                  name: "new_chat",
                });
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
            {vif(
              ms.curry_chat.operating_mode === ChatRecordOperatingMode.default,
              <QBtn
                {...c`menu_switch`}
                flat
                icon="mdi-menu"
                onClick={() => (show_left_bar.value = true)}
              ></QBtn>
            )}
            <div id="app_header_slot"></div>
          </QHeader>
          <QDrawer
            {...c`left_drawer`}
            showIfAbove
            {...refvmodel(show_left_bar)}
            side="left"
            breakpoint={1040}
            width={ms.left_bar.width}
          >
            <LeftBar class="bg-zinc-900" />
          </QDrawer>
          <QPageContainer>
            <RouterView />
            <RiskWarningDialog
              {...refvmodel_type(show_risk_warning_dialog, "modelValue")}
            ></RiskWarningDialog>
          </QPageContainer>
          <QInnerLoading
            showing={ms.is_initializing}
            label="正在初始化……"
          ></QInnerLoading>
        </QLayout>
      );
    };
  },
});
