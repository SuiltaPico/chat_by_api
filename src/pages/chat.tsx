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
  toRef,
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
  get_Message_index_in_ChatRecord,
  write_Message_to_ChatRecord
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
    ms.push_to_db_task_queue(async () => {
      await ms.chat_records.modify(chat_id, async (cr) => {
        write_Message_to_ChatRecord(cr, msg, index);
        return cr;
      });
    });
  };

  const settings = ms.settings.settings;
  const stop_next_ref = ref(async () => {});

  if (settings.apikeys.keys.length === 0) {
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

/** @assert ms.curry_chat.chat_record!  */
export function ChatItem_Avatar(message: Message, _class?: string) {
  const ms = use_main_store();
  return (
    <Avatar
      class={_class}
      role={message.role}
      onUpdate:role={async (role) => {
        const crid = ms.curry_chat.chat_record!.id;
        ms.push_to_db_task_queue(() => {
          return ms.chat_records.modify(crid, async (cr) => {
            message.role = role;
            return cr;
          });
        });
      }}
    ></Avatar>
  );
}

export function ChatItem_select_box(index: number) {
  const ms = use_main_store();
  const curry_chat = ms.curry_chat;
  const edit_mode = curry_chat.select_mode;
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
    const crid = computed(() => route.value.params.chatid as string);
    const loading_messages = ref(false);
    const chat_record = toRef(ms.curry_chat, "chat_record");
    const messages = computed(() => chat_record.value?.messages);

    const chat_id_unwatcher = watch(
      crid,
      () => {
        promise_with_ref(async () => {
          if (route.value.name !== "chat") return;

          await ms.curry_chat.load_chat_record(crid.value);
          await ms.chat_records.sync_message();

          // 处理有 `crid` 但是对话不存在（已删除）的情况。
          if (
            crid.value !== undefined &&
            ms.curry_chat.chat_record === undefined
          ) {
            router.push({
              name: "new_chat",
            });
          }

          // 如果是请求生成
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
              return messages.value.map((message, index) => (
                <ChatItem
                  message={message}
                  index={index}
                  chat_record={chat_record.value!}
                  onDelete={() => {
                    if (chat_record.value === undefined) return;
                    const cr = chat_record.value;
                    ms.push_to_db_task_queue(() =>
                      ms.chat_records.modify(cr.id, async (new_cr) => {
                        new_cr.messages.splice(
                          get_Message_index_in_ChatRecord(
                            new_cr,
                            message,
                            index
                          ),
                          1
                        );
                      })
                    );
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
            submit_hot_keys={ms.settings.settings.hot_keys.submit_keys}
            onSubmit={async () => {
              const { promot } = ms.chat_body_input;
              if (promot.length === 0) return;
              if (ms.curry_chat.chat_record === undefined) return;

              const mode = ms.chat_body_input.mode;
              const crid = ms.curry_chat.chat_record.id;

              await ms.push_to_db_task_queue(async () => {
                if (ms.curry_chat.chat_record === undefined) return;

                await ms.chat_records.modify(crid, async (curr_cr) => {
                  const messages = curr_cr.messages;

                  if (mode === "generate") {
                    const generate_mode_messages = [
                      create_UserMessage(curr_cr, "user", promot),
                      create_ServerMessage(
                        curr_cr,
                        "assistant",
                        "",
                        ms.chat_body_input.generate_OpenAIRequestConfig()
                      ),
                    ] as const;
                    messages.push(...generate_mode_messages);
                    ms.chat_body_input.sended();
                    scroll_to(document.getElementById("app")!);
                  } else if (mode === "add") {
                    const mode_messages = [
                      create_UserMessage(
                        curr_cr,
                        ms.chat_body_input.role,
                        promot
                      ),
                    ];
                    messages.push(...mode_messages);
                    ms.chat_body_input.sended();
                    scroll_to(document.getElementById("app")!);
                  }
                });
              });

              if (mode === "generate") {
                await generate_next(
                  crid,
                  ms.curry_chat.chat_record.messages,
                  ms.curry_chat.chat_record.messages.length - 1
                );
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
