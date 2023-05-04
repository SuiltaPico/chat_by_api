import { QIcon } from "quasar";
import { Ref } from "vue";
import { any } from "./utils";

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
