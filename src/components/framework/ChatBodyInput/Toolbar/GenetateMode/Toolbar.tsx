import { QBtn, QSelect } from "quasar";
import { defineComponent, toRef } from "vue";
import { openai_models } from "../../../../../common/api_meta";
import { tpl } from "../../../../../common/jsx_utils";
import { c } from "../../../../../common/utils";
import use_main_store from "../../../../../store/memory/main_store";
import { ToolbarState } from "../../ToolbarState";
import { Popup } from "./Popup";

export const GenetateModeToolbar = defineComponent({
  setup() {
    const ms = use_main_store();

    const model = toRef(ms.chat_body_input, "model");
    const models = openai_models;

    return () => {
      return tpl(
        <ToolbarState></ToolbarState>,
        <QSelect
          {...c`min-w-[140px] bg-zinc-800 _hidden sm:flex`}
          modelValue={model.value}
          onUpdate:modelValue={(m) => {
            if (typeof m != "string") {
              model.value = m.value;
            } else {
              model.value = m;
            }
          }}
          label="模型"
          color="secondary"
          dense
          options={models.value.chat_completions}
          dark
          filled
        ></QSelect>,
        <QBtn {...c`w-[2.5rem] h-[2.5rem]`} icon="mdi-tune" unelevated>
          <Popup></Popup>
        </QBtn>
      );
    };
  },
});
