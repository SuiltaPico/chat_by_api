import { computed, defineComponent, ref } from "vue";
import type { RenderFunction, SetupContext } from "vue";
import { Configuration, OpenAIApi } from "openai";
import PouchDB from "pouchdb";
import _ from "lodash";
import {
  QBtn,
  QDrawer,
  QInnerLoading,
  QLayout,
  QPage,
  QPageContainer,
} from "quasar";

import type { Message } from "./interface/ChatRecord";
import { define_component_with_prop } from "./common/define_component";
import { any, fix_compo_batch } from "./common/utils";
import { RouterView } from "vue-router";

import use_main_store from "./store/main_store";
import { ChatRecordSelection } from "./components/ChatRecordSelection";

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
