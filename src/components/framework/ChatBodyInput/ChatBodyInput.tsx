import { defineComponent, toRef } from "vue";
import { HotKeys, key_event_match_HotKey } from "../../../common/key_event";
import { as_props, refvmodel } from "../../../common/utils";
import use_main_store from "../../../store/memory/main_store";
import { Inputer } from "./Editor";
import { Toolbar } from "./Toolbar/Toolbar";

export type ChatBodyInputMode = "generate" | "add";

type ChatBodyInputProps = {
  submit_btn_loading?: boolean;
  submit_hot_keys: HotKeys;
};

export const ChatBodyInput = defineComponent<
  ChatBodyInputProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    submit: () => void;
  }
>({
  props: as_props<ChatBodyInputProps>()([
    "submit_btn_loading",
    "submit_hot_keys",
  ]),
  emits: ["submit"],
  setup(props, { attrs, emit }) {
    const ms = use_main_store();
    const promot = toRef(ms.chat_body_input, "promot");
    const mode = toRef(ms.chat_body_input, "mode");
    const submit_hot_keys = props.submit_hot_keys;

    function handle_keydown(e: KeyboardEvent) {
      if (e.repeat) return;
      const match = key_event_match_HotKey(e, submit_hot_keys);
      if (match) {
        emit("submit");
      }
    }

    return () => {
      return (
        <div
          class="chat_body_input_container"
          {...attrs}
          onKeydown={handle_keydown}
        >
          <Inputer
            {...props}
            {...refvmodel(promot, "promot")}
            mode={mode.value}
            onSubmit={() => emit("submit")}
          ></Inputer>
          <Toolbar></Toolbar>
        </div>
      );
    };
  },
});
