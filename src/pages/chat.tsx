import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import { cloneDeep } from "lodash";
import { QCheckbox, QPage } from "quasar";
import {
  Teleport,
  computed,
  defineComponent,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import {
  any,
  c,
  parse_param_to_Record,
  promise_with_ref,
  scroll_to,
} from "../common/utils";
import { ChatBodyInput } from "../components/ChatBodyInput";
import {
  Messages_to_OpenAI_Messages,
  create_ServerMessage,
  create_UserMessage,
} from "../impl/ChatRecord";
import {
  Message,
  ServerMessage,
  ServerMessagesError,
} from "../interface/ChatRecord";
import use_main_store from "../store/main_store";

import { not_undefined_or, tpl } from "../common/jsx_utils";

import { openai_chat_completion } from "../common/generate";
import { Avatar } from "../components/chat/Avatar";
import { ChatItem } from "../components/chat/ChatItem";
import { TopBar } from "../components/chat/TopBar";

async function generate_next(
  chat_id: string,
  _messages: Message[],
  index: number
) {
  const ms = use_main_store();
  const messages = cloneDeep(_messages);
  const msg = messages[index] as ServerMessage;

  const apply_update_chat_record_messages = async () => {
    const chat_record = await ms.get_chat_record(chat_id);
    const now = Date.now();
    chat_record.last_modified = now;
    chat_record.messages = messages;
    await ms.update_chat_record(chat_record);
    await ms.sync_curr_chat_record_messages();
  };

  const settings = ms.settings;
  const stop_next_ref = ref(async () => {});

  if (ms.settings.apikeys.keys.length === 0) {
    msg.error = {
      err_type: "no_api_key",
    };
    await apply_update_chat_record_messages();
    return;
  }

  const first_apikeys = settings.apikeys.keys[0];
  let additional_option = {};
  if (first_apikeys.source === "Custom") {
    additional_option = {
      api_base_path: first_apikeys.base,
      params: parse_param_to_Record(first_apikeys.param),
    };
  }

  try {
    await openai_chat_completion({
      api_key: first_apikeys.key,
      params: {},
      ...additional_option,
      messages: Messages_to_OpenAI_Messages(messages),
      async on_status_changed(status) {
        ms.curry_chat.status = status;
      },
      async on_update(clip) {
        messages[index].content += clip;
        await apply_update_chat_record_messages();
      },
      stop_next_ref,
      open_ai_request_config: ms.chat_body_input.generate_OpenAIRequestConfig(),
    });
  } catch (e) {
    msg.error = e as ServerMessagesError;
    await apply_update_chat_record_messages();
    return;
  }
}

export function ChatItem_Avatar(message: Message, _class?: string) {
  const ms = use_main_store();
  return (
    <Avatar
      class={_class}
      role={message.role}
      onUpdate:role={async (role) => {
        message.role = role;
        await ms.update_chat_record();
      }}
    ></Avatar>
  );
}

export function ChatItem_select_box(index: number) {
  const ms = use_main_store();
  const curry_chat = ms.curry_chat;
  const edit_mode = curry_chat.edit_mode;
  return not_undefined_or(() => {
    if (curry_chat.operating_mode === ChatRecordOperatingMode.select) {
      return tpl(
        <QCheckbox
          {...c`mt-2 self-start max-md:order-1`}
          color="info"
          dense
          modelValue={!!edit_mode.selected[index]}
          onUpdate:modelValue={(value) => {
            if (value === true || value === false) {
              edit_mode.selected[index] = value;
            }
          }}
        ></QCheckbox>
      );
    }
  });
}

export const ChatBody = defineComponent({
  setup() {
    const ms = use_main_store();
    const router = useRouter();
    const route = computed(() => router.currentRoute.value);
    const chat_id = computed(() => route.value.params.chatid as string);
    const loading_messages = ref(false);
    const messages = computed(() => ms.curry_chat.chat_record?.messages);

    const chat_id_unwatcher = watch(
      chat_id,
      () => {
        promise_with_ref(async () => {
          if (route.value.name !== "chat") return;
          await ms.curry_chat.load_chat_record(chat_id.value);
          // 处理对话不存在的情况
          if (
            chat_id.value !== undefined &&
            ms.curry_chat.chat_record === undefined
          ) {
            router.push({
              name: "new_chat",
            });
          }
          if (ms.chat_body_input.require_next === true) {
            ms.chat_body_input.require_next = false;
            if (messages.value === undefined) return;
            await generate_next(
              ms.curry_chat.chat_record!.id,
              ms.curry_chat.chat_record!.messages,
              ms.curry_chat.chat_record!.messages.length - 1
            );
          }
        }, loading_messages);
      },
      {
        immediate: true,
      }
    );

    onUnmounted(() => {
      chat_id_unwatcher();
    });
    return () => {
      return (
        <div class="chat_body">
          <div class={["chat_items_container"]}>
            {not_undefined_or(() => {
              if (messages.value === undefined) return;
              return messages.value.map((msg, index) => (
                <ChatItem
                  message={msg}
                  index={index}
                  onDelete={() => {
                    if (messages.value === undefined) return;
                    messages.value.splice(index, 1);
                    ms.update_chat_record();
                  }}
                ></ChatItem>
              ));
            })}
            <div id="ChatBodyBottom" class="chat_body_bottom"></div>
          </div>
          <ChatBodyInput
            class={[
              "fixed bottom-[2rem] max-[480px]:bottom-[0rem] self-center",
              ms.curry_chat.operating_mode !== ChatRecordOperatingMode.default
                ? "hidden"
                : "",
            ]}
            submit_btn_loading={loading_messages.value}
            submit_hot_keys={ms.settings.hot_keys.submit_keys}
            onSubmit={async () => {
              const { promot } = ms.chat_body_input;
              if (promot.length === 0) return;
              if (ms.curry_chat.chat_record === undefined) return;

              const mode = ms.chat_body_input.mode;
              const messages = ms.curry_chat.chat_record.messages;
              console.log(ms.curry_chat.chat_record.id);

              const chat_record = await ms.get_chat_record(
                ms.curry_chat.chat_record.id
              );

              if (mode === "generate") {
                const generate_mode_messages = [
                  create_UserMessage(chat_record, "user", promot),
                  create_ServerMessage(
                    chat_record,
                    "assistant",
                    "",
                    ms.chat_body_input.generate_OpenAIRequestConfig()
                  ),
                ] as const;
                messages.push(...generate_mode_messages);
                ms.chat_body_input.sended();
                await ms.update_chat_record(chat_record);
                scroll_to(document.getElementById("app")!);
                await generate_next(
                  ms.curry_chat.chat_record!.id,
                  ms.curry_chat.chat_record!.messages,
                  ms.curry_chat.chat_record!.messages.length - 1
                );
              } else if (mode === "add") {
                const mode_messages = [
                  create_UserMessage(
                    chat_record,
                    ms.chat_body_input.role,
                    promot
                  ),
                ];
                messages.push(...mode_messages);
                ms.chat_body_input.sended();
                await ms.update_chat_record(chat_record);
                scroll_to(document.getElementById("app")!);
              }
            }}
          ></ChatBodyInput>
        </div>
      );
    };
  },
});

export enum ChatRecordOperatingMode {
  default,
  select,
}

export default defineComponent({
  props: any(["chatid"]),
  setup(props) {
    const ms = use_main_store();
    return () => {
      return tpl(
        <Teleport to="#app_header_slot">
          <TopBar></TopBar>
        </Teleport>,
        <QPage {...c`default-bg flex flex-col`}>
          <ChatBody></ChatBody>
        </QPage>
      );
    };
  },
});
