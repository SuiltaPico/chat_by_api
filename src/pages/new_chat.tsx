import { QPage } from "quasar";
import { defineComponent, ref } from "vue";

import { define_component_with_prop } from "../common/define_component";
import { c } from "../common/utils";
import type { Message, MessageV2 } from "../interface/ChatRecord";

import { useRouter } from "vue-router";
import { ChatBodyInput } from "../components/ChatBodyInput";
import use_main_store from "../store/main_store";
import {
  create_ServerMessage,
  create_UserMessage,
  create_UserMessageV2,
} from "../impl/ChatRecord";

// const res = await openai.createChatCompletion({
//   model: "gpt-3.5-turbo",
//   messages: [{ role: "system", content: "1+3=?" }],
// });

// console.log(res)

export const IndexBody = defineComponent({
  props: ["messages"],
  setup(props: { messages: Message[] }, ctx) {
    const ms = use_main_store();
    const router = useRouter();

    return () => (
      <div class="flex flex-col relative grow">
        <IndexBodyMain />
        <ChatBodyInput
          class={"fixed bottom-[2rem] max-[480px]:bottom-[0rem] self-center"}
          submit_hot_keys={ms.settings.hot_keys.submit_keys}
          onSubmit={async () => {
            const mode = ms.chat_body_input.mode;
            const promot = ms.chat_body_input.promot;
            if (promot.length === 0) return;

            const chatid = await ms.new_chat_record(
              promot.slice(0, 50) + (promot.length > 50 ? "…" : "")
            );

            const chat_record = await ms.get_chat_record(chatid);

            if (mode === "generate") {
              const generate_mode_messages = [
                create_UserMessage(chat_record, "user", promot),
                create_ServerMessage(
                  chat_record,
                  "assistant",
                  "",
                  ms.chat_body_input.generate_OpenAIRequestConfig()
                ),
              ] satisfies Message[];

              chat_record.messages = generate_mode_messages;

              await ms.update_chat_record(chat_record);

              ms.chat_body_input.sended(true);

              router.push({
                name: "chat",
                params: {
                  chatid,
                },
              });
            } else if (mode === "add") {
              const add_mode_messages = [
                create_UserMessage(
                  chat_record,
                  ms.chat_body_input.role,
                  promot
                ),
              ] satisfies Message[];

              chat_record.messages = add_mode_messages;

              await ms.update_chat_record(chat_record);

              ms.chat_body_input.sended(false);

              router.push({
                name: "chat",
                params: {
                  chatid,
                },
              });
            }
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
