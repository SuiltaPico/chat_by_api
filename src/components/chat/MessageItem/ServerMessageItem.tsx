import { cloneDeep, defer } from "lodash";
import { QBtn, QSpace, useQuasar } from "quasar";
import { defineComponent, onMounted, ref } from "vue";
import {
  generate_next,
  openai_chat_completion,
} from "../../../common/generate";
import { vif } from "../../../common/jsx_utils";
import { create_md } from "../../../common/md_render";
import { copy_with_notify } from "../../../common/quasar_utils";
import {
  as_props,
  c,
  parse_param_to_Record,
  refvmodel_type,
} from "../../../common/utils";
import {
  Messages_to_OpenAI_Messages,
  after_modify_Message,
  create_UserMessageV2,
  write_Message_to_ChatRecord,
} from "../../../implement/ChatRecord";
import ChatRecord, {
  Message,
  ServerMessage,
  ServerMessagesError,
} from "../../../interface/ChatRecord";
import {
  ChatItem_Avatar,
  ChatItem_select_box,
  ChatRecordOperatingMode,
} from "../../../pages/chat";
import use_main_store from "../../../store/memory/main_store";
import { Editor, EditorCompoAPI } from "../../common/Editor";
import { MorePopup, MorePopupBtn } from "../MorePopup";
import { UseEditorRightBtnGroup } from "../UseEditorRightBtnGroup";
import { ServerMessageErrorHandler } from "./ServerMessageErrorHandler";
import { EditorLite } from "../../common/EditorLite";

const md = create_md();

// TODO:合并 regenerate 和 generate_next
async function regenerate(id: string, raw_messages: Message[], index: number) {
  /** 切除且克隆后的信息。 */
  const messages = cloneDeep(raw_messages.slice(0, index + 1));
  await generate_next(id, messages, index);
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

    async function do_regenerate(crid: string) {
      await ms.push_to_db_task_queue(async () => {
        await ms.chat_records.modify(crid, async (curr_cr) => {
          props.message.content = "";
          props.message.error = undefined;
          props.message.request_config =
            ms.chat_body_input.generate_OpenAIRequestConfig();
          write_Message_to_ChatRecord(curr_cr, props.message, props.index);
          after_modify_Message(curr_cr, props.message);
        });
      });
      await regenerate(
        ms.curry_chat.chat_record!.id,
        ms.curry_chat.chat_record!.messages,
        props.index
      );
    }

    function handle_open_editor(close_popup: () => void) {
      ctx.emit("update:use_editor", true);
      close_popup();

      defer(() => {
        content_editor.value?.force_set_value(props.message.content);
      });
    }

    function handle_copy() {
      copy_with_notify(qs, props.message.content);
    }

    function handle_copy_text_directly() {
      more_popup_showing.value = false;

      const s = getSelection();

      if (!mdblock.value) return;

      s?.selectAllChildren(mdblock.value);

      if (s) {
        copy_with_notify(qs, s.toString());
        s.empty();
      }
    }

    async function handle_regenerate() {
      more_popup_showing.value = false;
      await do_regenerate(ms.curry_chat.chat_record!.id);
    }

    async function handle_continue_to_generate() {
      more_popup_showing.value = false;
      const messages = cloneDeep(
        ms.curry_chat.chat_record!.messages.slice(0, props.index + 1)
      );
      messages.push({
        message_type: "user",
        role: "system",
        created: 0,
        last_modified: 0,
        content: ms.settings.settings.behaviors.continue_to_generate_prompt,
      });
      await generate_next(ms.curry_chat.chat_record!.id, messages, props.index);
    }

    return () => {
      const { message, index, use_editor } = props;
      const rendered_content = ms.curry_chat.use_markdown_render
        ? md.render(message.content)
        : md.render_as_fence(message.content);
      // const use_raw_render = toRef(ms.curry_chat.use_raw_render, index, true);

      const curry_chat = ms.curry_chat;

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
            {ChatItem_Avatar(message, index)}
            {vif(
              use_editor,
              <EditorLite
                class="editor"
                init_language="markdown"
                ref={content_editor}
              ></EditorLite>
            )}
            {vif(
              !use_editor,
              <div class="content_container">
                <div class="mdblock" ref={mdblock}>
                  {rendered_content}
                </div>
                <ServerMessageErrorHandler
                  message={message}
                  onRegenerate={handle_regenerate}
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
                    onClick={handle_copy}
                  ></QBtn>
                  <QBtn icon="mdi-dots-horizontal" flat>
                    <MorePopup
                      {...refvmodel_type(more_popup_showing, "show")}
                      message={message}
                      onDelete={() => ctx.emit("delete")}
                      onEdit={handle_open_editor}
                    >
                      <MorePopupBtn
                        class="text-_secondary"
                        label="继续生成"
                        icon="mdi-fast-forward"
                        onClick={handle_continue_to_generate}
                      ></MorePopupBtn>
                      <MorePopupBtn
                        label="重新生成"
                        icon="mdi-refresh"
                        onClick={handle_regenerate}
                      ></MorePopupBtn>
                      <MorePopupBtn
                        label="直接复制文本"
                        icon="mdi-raw-off"
                        onClick={handle_copy_text_directly}
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
