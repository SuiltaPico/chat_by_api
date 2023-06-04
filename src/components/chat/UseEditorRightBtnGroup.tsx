import { defineComponent } from "vue";
import { vif } from "../../common/jsx_utils";
import { QBtn } from "quasar";
import { EditorCompoAPI } from "../Editor";
import { Message } from "../../interface/ChatRecord";
import use_main_store from "../../store/main_store";
import { c } from "../../common/utils";

export const UseEditorRightBtnGroup = (
  use_editor: boolean,
  content_editor: EditorCompoAPI | undefined,
  message: Message,
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
        flat
        icon="mdi-check"
        onClick={async () => {
          const new_content = content_editor?.get_value() ?? "";
          message.content = new_content;
          message.last_modified = Date.now();
          await ms.update_chat_record();
          await ms.sync_curr_chat_record_messages();
          ctx.emit("update:use_editor", false);
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
