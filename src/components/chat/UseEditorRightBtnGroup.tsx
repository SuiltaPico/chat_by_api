import { QBtn } from "quasar";
import { vif } from "../../common/jsx_utils";
import { c } from "../../common/utils";
import { after_modify_Message, write_Message_to_ChatRecord } from "../../implement/ChatRecord";
import { Message } from "../../interface/ChatRecord";
import use_main_store from "../../store/main_store";
import { EditorCompoAPI } from "../common/Editor";

export const UseEditorRightBtnGroup = (
  use_editor: boolean,
  content_editor: EditorCompoAPI | undefined,
  message: Message,
  index: number,
  ctx: {
    emit: (event: "update:use_editor", value: boolean) => void;
  }
) => {
  const ms = use_main_store();
  return vif(
    use_editor,
    <div class="editor">
      <QBtn
        {...c`check`}
        unelevated
        icon="mdi-check"
        onClick={async () => {
          const crid = ms.curry_chat.chat_record!.id;
          await ms.push_to_db_task_queue(async () => {
            await ms.chat_records.modify(crid, async (curr_cr) => {
              const new_content = content_editor?.get_value() ?? "";
              message.content = new_content;
              write_Message_to_ChatRecord(curr_cr, message, index)
              after_modify_Message(curr_cr, message);
            });

            ctx.emit("update:use_editor", false);
          });
        }}
      ></QBtn>
      <QBtn
        {...c`cancel`}
        flat
        icon="mdi-close"
        onClick={() => ctx.emit("update:use_editor", false)}
      ></QBtn>
    </div>
  );
};
