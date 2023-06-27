import { computed, defineComponent, ref, toRef } from "vue";
import { ChatBodyInputMode } from "./ChatBodyInput";
import { as_props, c } from "../../../common/utils";
import { useWindowSize } from "@vueuse/core";
import { QBtn, QIcon, QInput } from "quasar";
import { not_undefined_or, vif_fn } from "../../../common/jsx_utils";
import use_main_store from "../../../store/memory/main_store";
import BetterBtn from "../../common/BetterBtn";

type InputerProps = {
  submit_btn_loading?: boolean;
  promot: string;
  mode: ChatBodyInputMode;
};
export const Inputer = defineComponent<
  InputerProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    submit: () => void;
    "update:promot": (value: string) => void;
  }
>({
  props: as_props<InputerProps>()(["submit_btn_loading", "promot", "mode"]),
  emits: ["submit", "update:promot"],
  setup(props, { emit }) {
    const ms = use_main_store();

    const window_width = useWindowSize().width;

    const inputter = ref<QInput>();
    const component_color = computed(() => {
      if (props.mode === "generate") {
        return "primary";
      } else {
        return "accent";
      }
    });
    const submit_props = computed(() => {
      if (props.mode === "generate") {
        return {
          icon: "mdi-send",
          color: component_color.value,
        };
      } else {
        return {
          icon: "mdi-plus",
          size: "1rem",
          color: component_color.value,
        };
      }
    });
    return () => {
      const promot = toRef(props, "promot");
      return (
        <div class="inputer_container">
          <QInput
            {...c`inputer`}
            modelValue={promot.value}
            onUpdate:modelValue={(value) => {
              emit("update:promot", String(value));
            }}
            type="textarea"
            color={component_color.value}
            dark
            filled
            placeholder="在这里输入消息。"
            autogrow
            autofocus
            dense={window_width.value <= 480}
            ref={inputter}
          ></QInput>
          {not_undefined_or(() => {
            const cr = ms.curry_chat.chat_record;
            if (cr === undefined) return;

            const app_meta = ms.chat_records.get_app_meta(cr.id);
            if (app_meta.status === "finished")
              return (
                <BetterBtn
                  class="w-[3.4rem] h-[2.9rem] bg-_primary text-white"
                  onClick={() => {
                    emit("submit");
                  }}
                >
                  <QIcon name="mdi-send"></QIcon>
                </BetterBtn>
              );
            return (
              <BetterBtn
                class="bg-_negative2 text-white"
                onClick={() => {
                  const cr = ms.curry_chat.chat_record;
                  if (cr === undefined) return;

                  const app_meta = ms.chat_records.get_app_meta(cr.id);
                  app_meta.status = "finished";
                  app_meta.stop();
                }}
              >
                <QIcon name="mdi-stop" size="1.65rem"></QIcon>
              </BetterBtn>
            );
          })}
        </div>
      );
    };
  },
});
