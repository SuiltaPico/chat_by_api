import { defineComponent } from "vue";
import { as_emits, as_props } from "../common/utils";
import use_main_store from "../store/memory/main_store";

type CompoProps = {
  modelValue: string;
};

type CompoEmits = {
  "update:modelValue": (new_value: CompoProps["modelValue"]) => void;
};

export const Compo = defineComponent<
  CompoProps,
  {},
  {},
  {},
  {},
  {},
  {},
  CompoEmits
>({
  props: as_props<CompoProps>()(["modelValue"]),
  emits: as_emits<CompoEmits>()(["update:modelValue"]),
  setup(props, ctx) {
    const ms = use_main_store();

    return () => {
      return <div></div>;
    };
  },
});
