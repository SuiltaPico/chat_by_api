import {
  QDrawer,
  QInnerLoading,
  QLayout,
  QPageContainer
} from "quasar";
import { defineComponent } from "vue";

import { RouterView } from "vue-router";

import { ChatRecordSelection } from "./components/ChatRecordSelection";
import use_main_store from "./store/main_store";

export default defineComponent({
  setup() {
    const main_store = use_main_store();

    return () => (
      <QLayout view="hHh LpR fFf">
        <QDrawer modelValue={true} side="left">
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
