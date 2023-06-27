import {
  QBtn
} from "quasar";
import { defineComponent } from "vue";
import { not_undefined_or } from "../../../../common/jsx_utils";
import {
  c
} from "../../../../common/utils";
import use_main_store from "../../../../store/memory/main_store";
import { ChatBodyInputMode } from "../ChatBodyInput";
import { AddModeToolbar } from "../Toolbar/AddMode/Toolbar";
import { GenetateModeToolbar } from "../Toolbar/GenetateMode/Toolbar";

export const Toolbar = defineComponent({
  setup() {
    const ms = use_main_store();
    const next = (mode: ChatBodyInputMode) =>
      ((
        {
          generate: "add",
          add: "generate",
        } as const satisfies Record<ChatBodyInputMode, ChatBodyInputMode>
      )[mode]);

    return () => {
      return (
        <div class="frow rounded-full flex-wrap items-center text-zinc-400 gap-3">
          <QBtn
            {...c`w-[2.5rem] h-[2.5rem] text-zinc-300`}
            icon="mdi-swap-horizontal"
            unelevated
            flat
            onClick={() => {
              ms.chat_body_input.mode = next(ms.chat_body_input.mode);
            }}
          ></QBtn>

          {not_undefined_or(() => {
            if (ms.chat_body_input.mode === "generate") {
              return <GenetateModeToolbar></GenetateModeToolbar>;
            } else if (ms.chat_body_input.mode === "add") {
              return <AddModeToolbar></AddModeToolbar>;
            }
          })}
        </div>
      );
    };
  },
});
