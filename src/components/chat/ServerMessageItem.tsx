import { cloneDeep, defer } from "lodash";
import { QBtn, QSpace, useQuasar } from "quasar";
import { defineComponent, onMounted, ref } from "vue";
import { openai_chat_completion } from "../../common/generate";
import { vif } from "../../common/jsx_utils";
import { create_md } from "../../common/md_render";
import { copy_with_notify } from "../../common/quasar_utils";
import {
  as_props,
  c,
  parse_param_to_Record,
  refvmodel_type,
} from "../../common/utils";
import {
  Messages_to_OpenAI_Messages,
  after_modify_Message,
  write_Message_to_ChatRecord,
} from "../../impl/ChatRecord";
import ChatRecord, {
  Message,
  ServerMessage,
  ServerMessagesError,
} from "../../interface/ChatRecord";
import {
  ChatItem_Avatar,
  ChatItem_select_box,
  ChatRecordOperatingMode,
} from "../../pages/chat";
import use_main_store from "../../store/main_store";
import { Editor, EditorCompoAPI } from "../Editor";
import { MorePopup, MorePopupBtn } from "./MorePopup";
import { UseEditorRightBtnGroup } from "./UseEditorRightBtnGroup";
import { ServerMessageErrorHandler } from "./ServerMessageErrorHandler";
import { Editor2 } from "../Editor2";

const md = create_md();

// TODO:合并 regenerate 和 generate_next
async function regenerate(
  chat_id: string,
  _messages: Message[],
  index: number
) {
  const ms = use_main_store();
  /** 切除且克隆后的信息。 */
  const messages = cloneDeep(_messages.slice(0, index + 1));
  const msg = messages[index] as ServerMessage;

  /** 更新 `_messages[index]` 的消息。 */
  const apply_update_chat_record_messages = async () => {
    await ms.push_to_db_task_queue(async () => {
      await ms.chat_records.modify(chat_id, async (curr_cr) => {
        write_Message_to_ChatRecord(curr_cr, msg, index);
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

  const first_apikey = settings.apikeys.keys[0];
  let additional_option = {};
  if (first_apikey.source === "Custom") {
    additional_option = {
      api_base_path: first_apikey.base,
      params: parse_param_to_Record(first_apikey.param),
    };
  }

  try {
    await openai_chat_completion({
      api_key: first_apikey.key,
      params: {},
      ...additional_option,
      messages: Messages_to_OpenAI_Messages(messages),
      async on_status_changed(status) {
        ms.curry_chat.status = status;
      },
      async on_update(clip) {
        msg.content += clip;
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

export type ServerMessageItemProps = {
  message: ServerMessage;
  index: number;
  use_editor: boolean;
  chat_record: ChatRecord;
};

export const ServerMessageItem = defineComponent<
  ServerMessageItemProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    delete: () => void;
    "update:use_editor": (value: boolean) => void;
  }
>({
  props: as_props<ServerMessageItemProps>()(["message", "index", "use_editor"]),
  emits: ["delete", "update:use_editor"],
  setup(props, ctx) {
    const ms = use_main_store();
    const qs = useQuasar();
    const mdblock = ref<HTMLDivElement>();
    const content_editor = ref<EditorCompoAPI>();

    const more_popup_showing = ref(false);

    onMounted(() => {
      content_editor.value?.force_set_value(props.message.content);
    });

    return () => {
      const { message, index, use_editor } = props;
      const rendered_content = ms.curry_chat.use_markdown_render
        ? md.render(message.content)
        : md.render_as_fence(message.content);
      // const use_raw_render = toRef(ms.curry_chat.use_raw_render, index, true);

      const curry_chat = ms.curry_chat;

      async function do_regenerate(crid: string) {
        await ms.push_to_db_task_queue(async () => {
          ms.chat_records.modify(crid, async (curr_cr) => {
            message.content = "";
            message.error = undefined;
            message.request_config =
              ms.chat_body_input.generate_OpenAIRequestConfig();
            write_Message_to_ChatRecord(curr_cr, message, index);
            after_modify_Message(curr_cr, message);
          });
        });
        await regenerate(
          ms.curry_chat.chat_record!.id,
          ms.curry_chat.chat_record!.messages,
          index
        );
      }

      return (
        <div class="chat_item">
          <div class="chat_item_main">
            {ChatItem_select_box(props.index)}
            {vif(
              ms.curry_chat.operating_mode === ChatRecordOperatingMode.select,
              <QBtn
                unelevated
                {...c`drag_handler cursor-move self-start py-[0.4rem] px-[0.6rem] text-[0.9rem]`}
                icon="mdi-drag"
                ripple={false}
              ></QBtn>
            )}
            {ChatItem_Avatar(message)}
            {vif(
              use_editor,
              <Editor2
                class="editor"
                init_language="markdown"
                ref={content_editor}
              ></Editor2>
            )}
            {vif(
              !use_editor,
              <div class="content">
                <div class="mdblock" ref={mdblock}>
                  {rendered_content}
                </div>
                <ServerMessageErrorHandler
                  message={message}
                  onRegenerate={() => do_regenerate(curry_chat.chat_record!.id)}
                ></ServerMessageErrorHandler>
              </div>
            )}

            {vif(
              curry_chat.operating_mode === ChatRecordOperatingMode.default,
              <QSpace></QSpace>
            )}

            <div class="right_btn_group">
              {vif(
                curry_chat.operating_mode === ChatRecordOperatingMode.default &&
                  !use_editor,
                <div class="default">
                  <QBtn
                    icon="mdi-content-copy"
                    flat
                    onClick={() => {
                      copy_with_notify(qs, message.content);
                    }}
                  ></QBtn>
                  <QBtn icon="mdi-dots-horizontal" flat>
                    <MorePopup
                      {...refvmodel_type(more_popup_showing, "show")}
                      message={message}
                      onDelete={() => ctx.emit("delete")}
                      onEdit={(close_popup) => {
                        ctx.emit("update:use_editor", true);
                        close_popup();

                        defer(() => {
                          content_editor.value?.force_set_value(
                            message.content
                          );
                        });
                      }}
                    >
                      <MorePopupBtn
                        class="text-secondary"
                        label="重新生成"
                        icon="mdi-refresh"
                        onClick={() => {
                          more_popup_showing.value = false;
                          do_regenerate(curry_chat.chat_record!.id);
                        }}
                      ></MorePopupBtn>
                      <MorePopupBtn
                        label="直接复制文本"
                        icon="mdi-raw-off"
                        onClick={() => {
                          more_popup_showing.value = false;

                          const s = getSelection();

                          if (!mdblock.value) {
                            return;
                          }

                          s?.selectAllChildren(mdblock.value);

                          if (s) {
                            copy_with_notify(qs, s.toString());
                            s.empty();
                          }
                        }}
                      ></MorePopupBtn>
                    </MorePopup>
                  </QBtn>
                </div>
              )}
              {UseEditorRightBtnGroup(
                use_editor,
                content_editor.value,
                message,
                index,
                ctx
              )}
            </div>
            <div class="max-md:min-w-full h-0 max-md:block order-2"></div>
          </div>
        </div>
      );
    };
  },
});
