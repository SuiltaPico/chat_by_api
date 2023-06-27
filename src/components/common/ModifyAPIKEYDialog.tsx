import { QBtn, QDialog, QIcon, QInput, QSelect, QSpace } from "quasar";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { defineComponent, ref } from "vue";
import { not_undefined_or, tpl, vif_fn } from "../../common/jsx_utils";
import { passwd_attr, passwd_slot } from "../../common/quasar_utils";
import {
  any,
  as_props,
  batch_set_ref,
  c,
  carr,
  cl,
  generate_random_name,
  refvmodel,
} from "../../common/utils";
import { generate_apikey_id } from "../../implement/Settings";
import { APIKey, APIKeySource } from "../../interface/Settings";
import use_main_store from "../../store/memory/main_store";
import BetterBtn from "./BetterBtn";
import ErrorContainer from "./ErrorContainer";

export type DialogMode = "add" | "modify";
export interface DialogExpose {
  set_apikey(apikey: APIKey): void;
}

type DialogProps = {
  modelValue: boolean;
  error_info: string;
  mode: DialogMode;
};
export const ModifyAPIKEYDialog = defineComponent<
  DialogProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    "update:modelValue": (value: boolean) => void;
    "update:error_info": (value: string) => void;
    submit: (apikey: APIKey | undefined, close_dialog: () => void) => void;
  }
>({
  props: as_props<DialogProps>()(["modelValue", "error_info", "mode"]),
  emits: ["update:modelValue", "update:error_info", "submit"],
  setup(props, ctx) {
    const ms = use_main_store();
    const new_key_type = ref<APIKeySource>("OpenAI");
    const new_key_type_option: APIKeySource[] = ["OpenAI", "Custom"];

    const layout_props = {
      dark: true,
      filled: true,
      dense: false,
      color: "secondary",
    } as const;

    const mode = props.mode;

    const name = ref<string>(generate_random_name());
    const key = ref<string>("");

    const base = ref<string>("");
    const param = ref<string>("");

    const showing = ref(true);

    const adding = ref(false);
    const key_input = ref<QInput>();

    const complex_layout = ref(mode !== "add");

    ctx.expose({
      set_apikey(apikey: APIKey) {
        complex_layout.value = true;
        name.value = apikey.name;
        key.value = apikey.key;
        new_key_type.value = apikey.source;
        if (apikey.source === "Custom") {
          base.value = apikey.base;
          param.value = apikey.param;
        }
      },
    } satisfies DialogExpose);

    function handle_submit() {
      let result: APIKey | undefined;
      if (new_key_type.value === "OpenAI") {
        result = {
          id: generate_apikey_id(),
          source: new_key_type.value,
          name: name.value,
          key: key.value,
        };
      } else if (new_key_type.value === "Custom") {
        result = {
          id: generate_apikey_id(),
          source: new_key_type.value,
          name: name.value,
          key: key.value,
          base: base.value,
          param: param.value,
        };
      }
      try {
        ctx.emit("submit", result, () => {
          ctx.emit("update:modelValue", false);
        });
        batch_set_ref("", name, key, base, param);
      } catch (e) {
        ctx.emit("update:error_info", String(e));
      }
    }

    function handle_open_complex_layout() {
      complex_layout.value = true;
      new_key_type.value = "Custom";
      key_input.value?.focus();
    }

    function handle_close_complex_layout() {
      complex_layout.value = false;
      new_key_type.value = "OpenAI";
    }

    return () => {
      return (
        <QDialog
          modelValue={props.modelValue}
          onUpdate:modelValue={(it) => ctx.emit("update:modelValue", it)}
        >
          <div class="fcol text-zinc-100 bg-zinc-900 p-10 px-10 gap-6 rounded-xl">
            <div class="frow gap-2 items-center">
              <QBtn
                {...cl(complex_layout.value && mode === "add" ? "" : "hidden")}
                icon="mdi-arrow-left"
                flat
                padding="0.5rem"
                onClick={handle_close_complex_layout}
              ></QBtn>
              {vif_fn(mode === "add", () => (
                <div class="text-xl font-bold">添加新的 API-KEY</div>
              ))}
              {vif_fn(mode === "modify", () => (
                <div class="text-xl font-bold">更改 API-KEY</div>
              ))}
            </div>
            <ErrorContainer
              class={["darker", props.error_info.length === 0 ? "hidden" : ""]}
              content={props.error_info}
            >
              <div class="frow">
                <QSpace></QSpace>
                <BetterBtn
                  onClick={() => {
                    ctx.emit("update:error_info", "");
                  }}
                >
                  我已知晓
                </BetterBtn>
              </div>
            </ErrorContainer>
            <div class="frow flex-wrap gap-4 items-center">
              <div
                class={[
                  "frow w-full gap-4",
                  complex_layout.value ? "" : "hidden",
                ]}
              >
                <QSelect
                  {...c`grow`}
                  label="类型"
                  {...refvmodel(new_key_type)}
                  options={new_key_type_option}
                  {...layout_props}
                ></QSelect>
              </div>
              <QInput
                {...c`grow`}
                {...refvmodel(name)}
                label="名称（可选）"
                {...layout_props}
              >
                {{
                  append: () => (
                    <QIcon
                      name="mdi-refresh"
                      {...any({
                        class: "cursor-pointer",
                        onClick() {
                          name.value = generate_random_name();
                        },
                      })}
                    ></QIcon>
                  ),
                }}
              </QInput>
              <QInput
                {...c`grow md:min-w-[26rem] w-[100%]`}
                {...refvmodel(key)}
                {...passwd_attr(showing)}
                label="API-KEY（必填）"
                {...layout_props}
                autofocus
                ref={key_input}
              >
                {{
                  ...passwd_slot(showing, {
                    size: "1.4rem",
                  }),
                }}
              </QInput>
              <div
                class={[
                  "frow items-center",
                  complex_layout.value ? "hidden" : "",
                ]}
              >
                <div
                  class="text-xs text-zinc-400 underline cursor-pointer select-none"
                  onClick={handle_open_complex_layout}
                >
                  不是 OpenAI 的 API-KEY?
                </div>
              </div>
              {not_undefined_or(() => {
                if (new_key_type.value === "Custom") {
                  return tpl(
                    <QInput
                      {...c`grow`}
                      {...refvmodel(base)}
                      label="Base URL（必填）"
                      {...layout_props}
                      hint="例如：https://api.xxxxx.com/v1"
                    ></QInput>,
                    <QInput
                      {...c`grow`}
                      {...refvmodel(param)}
                      label="查询参数（可选）"
                      {...layout_props}
                      hint="例如：foo=bar&x=123"
                    ></QInput>
                  );
                }
              })}
            </div>
            <div class="frow gap-2">
              <QSpace></QSpace>
              <QBtn
                color="primary"
                flat
                onClick={() => ctx.emit("update:modelValue", false)}
              >
                取消
              </QBtn>
              <QBtn
                color="primary"
                unelevated
                loading={adding.value}
                disable={key.value.length === 0}
                onClick={handle_submit}
              >
                {mode === "add" ? "添加" : "更改"}
              </QBtn>
            </div>
          </div>
        </QDialog>
      );
    };
  },
});
