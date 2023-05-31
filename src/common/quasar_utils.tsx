import { QIcon, QVueGlobals, useQuasar } from "quasar";
import { Ref } from "vue";
import { any } from "./utils";
import copy from "copy-text-to-clipboard";

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

export async function copy_with_notify(qs: QVueGlobals, content: string) {
  const result = navigator.clipboard.writeText(content);

  const notify = (msg: string) =>
    qs.notify({
      position: "top",
      message: msg,
      color: "primary",
      timeout: 200,
      type: "info",
    });

  try {
    await result;
    notify("复制成功");
  } catch {
    notify("复制失败");
  }
}
