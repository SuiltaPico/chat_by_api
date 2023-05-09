import {
  QBtn,
  QDrawer,
  QHeader,
  QInnerLoading,
  QLayout,
  QPageContainer,
} from "quasar";
import { defineComponent, ref } from "vue";

import { RouterView } from "vue-router";

import { ChatRecordSelection } from "./components/ChatRecordSelection";
import use_main_store from "./store/main_store";
import { c, refvmodel } from "./common/utils";

export default defineComponent({
  setup() {
    const main_store = use_main_store();
    const show_left_bar = ref(false);

    return () => (
      <QLayout view="hHh LpR fFf">
        <QHeader {...c`app-header h-[3rem] lg:hidden`}>
          <QBtn
            {...c`w-[3rem] h-[3rem] text-zinc-300 `}
            flat
            size="0.8rem"
            icon="mdi-menu"
            onClick={() => (show_left_bar.value = true)}
          ></QBtn>
        </QHeader>
        <QDrawer
          showIfAbove
          {...refvmodel(show_left_bar)}
          side="left"
          breakpoint={1024}
        >
          <ChatRecordSelection
            class="min-w-[260px] bg-zinc-900 flex flex-col"
            records={main_store.chat_records_meta}
          />
        </QDrawer>
        <QPageContainer>
          <RouterView />
        </QPageContainer>
        <QInnerLoading
          showing={main_store.is_loading}
          label="正在初始化……"
        ></QInnerLoading>
      </QLayout>
    );
  },
});
