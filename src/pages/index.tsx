import { defineComponent, ref } from "vue";
import type { RenderFunction, SetupContext } from "vue";
import { Configuration, OpenAIApi } from "openai";
import _ from "lodash";
import { QBtn, QIcon, QPage, QSpace } from "quasar";

import type ChatRecord from "../interface/ChatRecord";
import type { Message } from "../interface/ChatRecord";
import { define_component_with_prop } from "../common/define_component";
import { any, fix_compo_batch, c } from "../common/utils";

import use_main_store from "../store/main_store";
import { ChatBodyInput } from "../components/ChatBodyInput";
import { useRouter } from "vue-router";
import { app_body_width } from "../common/display";

// const res = await openai.createChatCompletion({
//   model: "gpt-3.5-turbo",
//   messages: [{ role: "system", content: "1+3=?" }],
// });

// console.log(res)

export const IndexBody = defineComponent({
  props: ["messages"],
  setup(props: { messages: Message[] }, ctx) {
    const main_store = use_main_store();
    const router = useRouter();

    return () => (
      <div class="flex flex-col relative grow">
        <IndexBodyMain />
        <ChatBodyInput
          class={"fixed bottom-[2rem] self-center" + app_body_width}
          onSubmit={async () => {
            const promot = main_store.chat_body_input.promot;

            console.log("submit");
            const chatid = await main_store.new_chat_record(
              promot.slice(0, 10) + (promot.length > 10 ? "…" : ""),
              Date.now()
            );

            await main_store.update_chat_record_messages(chatid, [
              {
                message_type: "user",
                role: "user",
                created: Date.now(),
                content: promot,
              },
              {
                message_type: "server",
                role: "assistant",
                created: Date.now(),
                request_config: {
                  model: main_store.chat_body_input.model,
                },
                content: "",
              },
            ]);

            main_store.chat_body_input.require_next = true;

            router.push({
              name: "chat",
              params: {
                chatid,
              },
            });
          }}
        />
      </div>
    );
  },
});

// export const ChatBodyHeader = define_component_with_prop(
//   [],
//   (props: {}, ctx) => {
//     return () => <div></div>;
//   }
// );

export const IndexBodyMain = define_component_with_prop(
  [],
  (props: {}, ctx) => {
    return () => <div class="grow"></div>;
  }
);

export default defineComponent({
  props: [],
  setup(props: {}, ctx) {
    const main_store = use_main_store();
    const focus_chat_id = ref(0);

    return () => (
      <QPage {...c`default-bg flex flex-row h-full`}>
        <IndexBody></IndexBody>
      </QPage>
    );
  },
});
