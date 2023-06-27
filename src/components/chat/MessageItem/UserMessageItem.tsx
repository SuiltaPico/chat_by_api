import { defineComponent, ref } from "vue";
import ChatRecord, { UserMessage } from "../../../interface/ChatRecord";
import { as_props, c, cl, refvmodel_type } from "../../../common/utils";
import use_main_store from "../../../store/memory/main_store";
import { QBtn, QIcon, QSpace, useQuasar } from "quasar";
import {
  ChatItem_Avatar,
  ChatItem_select_box,
  ChatRecordOperatingMode,
} from "../../../pages/chat";
import { copy_with_notify } from "../../../common/quasar_utils";
import { MorePopup, MorePopupBtn } from "../MorePopup";
import { tpl, vif, vif_fn } from "../../../common/jsx_utils";
import { Editor, EditorCompoAPI } from "../../common/Editor";
import { UseEditorRightBtnGroup } from "../UseEditorRightBtnGroup";
import { cloneDeep, defer } from "lodash";
import { EditorLite } from "../../common/EditorLite";
import BetterBtn from "../../common/BetterBtn";
import { create_ServerMessage } from "../../../implement/ChatRecord";
import { generate_next } from "../../../common/generate";

export type UserMessageItemProps = {
  message: UserMessage;
  index: number;
  use_editor: boolean;
  chat_record: ChatRecord;
};

export const UserMessageItem = defineComponent<
  UserMessageItemProps,
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
  props: as_props<UserMessageItemProps>()([
    "message",
    "index",
    "use_editor",
    "chat_record",
  ]),
  emits: ["delete", "update:use_editor"],
  setup(props, ctx) {
    const ms = use_main_store();
    const qs = useQuasar();

    const more_popup_showing = ref(false);
    const content_editor = ref<EditorCompoAPI>();

    const send_curr_message_btn_loading = ref(false);

    async function handle_send_curr_message() {
      send_curr_message_btn_loading.value = true;
      const cr_id = ms.curry_chat.chat_record!.id;
      await ms.push_to_db_task_queue(async () => {
        await ms.chat_records.modify(cr_id, async (curr_cr) => {
          curr_cr.messages.push(
            create_ServerMessage(
              curr_cr,
              "assistant",
              "",
              ms.chat_body_input.generate_OpenAIRequestConfig()
            )
          );
        });
      });
      send_curr_message_btn_loading.value = false;
      await generate_next(
        cr_id,
        ms.curry_chat.chat_record!.messages,
        props.index + 1
      );
    }

    return () => {
      const { message, index, use_editor } = props;
      const curry_chat = ms.curry_chat;
      return (
        <div class="chat_item user">
          <div class="chat_item_main">
            {ChatItem_select_box(props.index)}
            {vif(
              ms.curry_chat.operating_mode === ChatRecordOperatingMode.select,
              <QBtn
                unelevated
                {...c`drag_handler self-start py-[0.4rem] px-[0.6rem] text-[0.9rem]`}
                icon="mdi-drag"
                ripple={false}
              ></QBtn>
            )}
            {ChatItem_Avatar(message, index, "mt-[2px]")}
            {vif(
              use_editor,
              <EditorLite
                class="editor"
                init_language="markdown"
                ref={content_editor}
              ></EditorLite>
            )}
            {vif_fn(!use_editor, () => (
              <div class="content_container">
                <div class="content">{message.content}</div>
                {vif_fn(
                  index === ms.curry_chat.chat_record!.messages.length - 1,
                  () => (
                    <div class="fcol gap-4 mt-2">
                      <div class="w-full h-[1px] bg-zinc-300" />
                      <div class="frow gap-2">
                        <BetterBtn onClick={handle_send_curr_message}>
                          <QIcon name="mdi-send" size="1rem"></QIcon>
                          <div>发送当前信息</div>
                        </BetterBtn>
                      </div>
                    </div>
                  )
                )}
              </div>
            ))}
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
                    {...c`text-xs text-zinc-300 p-2`}
                    icon="mdi-import"
                    flat
                    onClick={async () => {
                      ms.chat_body_input.promot = message.content;
                      ms.chat_body_input.inputter?.focus();
                    }}
                  ></QBtn>
                  <QBtn
                    {...c`text-xs text-zinc-300 p-2`}
                    icon="mdi-dots-horizontal"
                    flat
                  >
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
                          content_editor.value?.focus();
                        });
                      }}
                    >
                      <MorePopupBtn
                        icon="mdi-content-copy"
                        label="复制"
                        onClick={() => {
                          copy_with_notify(qs, message.content);
                          more_popup_showing.value = false;
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
