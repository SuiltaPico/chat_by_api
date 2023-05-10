import { QIcon } from "quasar";
import { Ref } from "vue";
import { any } from "./utils";

export interface QSelectOptionSlotParam<Option> {
  focused: boolean;
  html: false;
  index: number;
  itemProps: any;
  label: string;
  opt: Option;
  selected: boolean;
  setOptionIndex: (index: number) => any;
  toggleOption: (opt: any) => any;
}

export function passwd_attr(showing: Ref<boolean>) {
  return {
    type: showing.value ? "text" : "password",
  };
}

export function passwd_slot(showing: Ref<boolean>, attrs: any = {}) {
  return {
    append: () => (
      <QIcon
        name={showing.value ? "mdi-eye" : "mdi-eye-off"}
        {...any({
          class: "cursor-pointer",
          onClick() {
            showing.value = !showing.value;
          },
        })}
        {...attrs}
      ></QIcon>
    ),
  };
}
