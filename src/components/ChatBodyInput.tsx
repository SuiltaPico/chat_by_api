import {
  QBtn,
  QBtnGroup,
  QIcon,
  QInput,
  QItem,
  QPopupProxy,
  QSelect,
  QSlider,
  QSpinner,
  QSpinnerComment,
  QToggle,
} from "quasar";
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  resolveDirective,
  toRef,
  withDirectives,
} from "vue";
import use_main_store from "../store/main_store";
import { ElementOfArray, any, as_props, c, refvmodel } from "../common/utils";
import { models as openai_models } from "../common/from_openai";
import _ from "lodash";
import { not_undefined_or, tpl } from "../common/jsx_utils";
import { Role, RoleWithoutUnknown } from "../interface/ChatRecord";
import { QSelectOptionSlotParam } from "../common/quasar_utils";
import { Avatar } from "../pages/chat";

export type ChatBodyInputMode = "generate" | "add";

export const ChatBodyInputToolbarState = defineComponent({
  setup() {
    const ms = use_main_store();
    return () => {
      return (
        <div class="frow items-center flex-wrap">
          <div>状态：</div>
          <div class="frow w-fit p-1.5 rounded-full items-center gap-2 text-[0.8rem]">
            {not_undefined_or(() => {
              const { status } = ms.curry_chat;
              if (status === "") {
                return tpl(
                  <QIcon name="mdi-check" size="1rem" color="primary"></QIcon>,
                  <div>等待生成</div>
                );
              } else if (status === "connecting") {
                return tpl(
                  <QSpinner size="1rem" color="primary"></QSpinner>,
                  <div>正在连接服务器……</div>
                );
              } else if (status === "generating") {
                return tpl(
                  <QSpinnerComment
                    size="1rem"
                    color="primary"
                  ></QSpinnerComment>,
                  <div>正在生成……</div>
                );
              }
            })}
          </div>
        </div>
      );
    };
  },
});

export const ChatBodyInputToolbar = defineComponent({
  setup() {
    const ms = use_main_store();
    const models = openai_models.chat_completions;
    const model = toRef(ms.chat_body_input, "model");
    const _role = toRef(ms.chat_body_input, "role");
    const temperature = toRef(ms.chat_body_input, "temperature");
    const presence_penalty = toRef(ms.chat_body_input, "presence_penalty");
    const frequency_penalty = toRef(ms.chat_body_input, "frequency_penalty");
    const auto_max_tokens = toRef(ms.chat_body_input, "auto_max_tokens");
    const max_tokens = toRef(ms.chat_body_input, "max_tokens");

    const raw_roles = {
      user: {
        description: "用户，一般情况下与助理对话的对象。",
      },
      assistant: {
        description: "助理，即语言模型自己。",
      },
      system: {
        description: "系统，可以一定程度上控制助理的行为。",
      },
    } as const satisfies Record<RoleWithoutUnknown, { description: string }>;

    const roles = _.chain(raw_roles)
      .map((value, key) => ({
        label: key as RoleWithoutUnknown,
        value: key as RoleWithoutUnknown,
        description: value.description,
      }))
      .value();

    const role = computed(() => roles.find((v) => v.value == _role.value));

    return () => {
      return (
        <div class="frow rounded-full items-center text-zinc-400 gap-3">
          <QBtn
            {...c`w-[2.5rem] h-[2.5rem] text-zinc-300`}
            icon="mdi-swap-horizontal"
            unelevated
            flat
            onClick={() => {
              const next = (mode: ChatBodyInputMode) =>
                ((
                  {
                    generate: "add",
                    add: "generate",
                  } as const satisfies Record<
                    ChatBodyInputMode,
                    ChatBodyInputMode
                  >
                )[mode]);
              ms.chat_body_input.mode = next(ms.chat_body_input.mode);
            }}
          ></QBtn>

          {not_undefined_or(() => {
            if (ms.chat_body_input.mode === "generate") {
              return tpl(
                <ChatBodyInputToolbarState></ChatBodyInputToolbarState>,
                <QSelect
                  {...c`min-w-[140px] bg-zinc-800`}
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
                  options={models}
                  dark
                  dense
                  filled
                ></QSelect>,
                <QBtn {...c`w-[2.5rem] h-[2.5rem]`} icon="mdi-tune" unelevated>
                  <QPopupProxy
                    {...c`min-w-[14rem] p-5 bg-zinc-800 text-zinc-200 gap-6 fcol quick shadow-2xl border border-zinc-600`}
                    breakpoint={0}
                  >
                    <div class="fcol text-sm min-w-[6rem] px-1">
                      <div>温度：{temperature.value}</div>
                      <QSlider
                        {...refvmodel(temperature)}
                        min={0}
                        max={2}
                        step={0.01}
                        dark
                        dense
                      ></QSlider>
                    </div>
                    <div class="fcol text-sm min-w-[6rem] px-1">
                      <div>存在惩罚：{presence_penalty.value}</div>
                      <QSlider
                        {...refvmodel(presence_penalty)}
                        min={-2}
                        max={2}
                        step={0.01}
                        dark
                        dense
                      ></QSlider>
                    </div>
                    <div class="fcol text-sm min-w-[6rem] px-1">
                      <div>重复惩罚：{frequency_penalty.value}</div>
                      <QSlider
                        {...refvmodel(frequency_penalty)}
                        min={-2}
                        max={2}
                        step={0.01}
                        dark
                        dense
                      ></QSlider>
                    </div>
                    <div class="fcol text-sm min-w-[6rem] gap-4 p-1">
                      <div>最大 token 数</div>
                      <QToggle {...refvmodel(auto_max_tokens)} label="自动" dense></QToggle>
                      <QInput
                        modelValue={max_tokens.value}
                        onUpdate:modelValue={(value) => {
                          max_tokens.value = parseInt(String(value));
                        }}
                        disable={auto_max_tokens.value}
                        label="最大回传 token 数"
                        color="secondary"
                        dark
                        filled
                      ></QInput>
                    </div>
                  </QPopupProxy>
                </QBtn>
              );
            } else if (ms.chat_body_input.mode === "add") {
              return tpl(
                <QSelect
                  modelValue={role.value}
                  onUpdate:modelValue={(r) => {
                    _role.value = r.value;
                  }}
                  label="身份"
                  options={roles}
                  color="secondary"
                  dark
                  dense
                  filled
                >
                  {{
                    option: (
                      item: QSelectOptionSlotParam<ElementOfArray<typeof roles>>
                    ) => {
                      return (
                        <QItem
                          {...any({
                            class: [
                              `frow items-center gap-3 text-sm p-4`,
                              item.selected ? "text-primary" : "",
                            ],
                          })}
                          focused={item.selected}
                          clickable
                          onClick={() => {
                            item.toggleOption(item.opt);
                          }}
                        >
                          <Avatar role={item.label}></Avatar>
                          <div class="fcol">
                            <div>{item.label}</div>
                            <div
                              class={[
                                "text-zinc-400",
                                item.selected ? "text-primary" : "",
                              ]}
                            >
                              {item.opt.description}
                            </div>
                            {}
                          </div>
                        </QItem>
                      );
                    },
                  }}
                </QSelect>
              );
            }
          })}
        </div>
      );
    };
  },
});

type ChatBodyInputerProps = {
  submit_btn_loading?: boolean;
  promot: string;
  mode: ChatBodyInputMode;
};
export const ChatBodyInputer = defineComponent<
  ChatBodyInputerProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    submit: () => void;
    "Update:promot": (value: string) => void;
  }
>({
  props: as_props<ChatBodyInputerProps>()([
    "submit_btn_loading",
    "promot",
    "mode",
  ]),
  emits: ["submit", "Update:promot"],
  setup(props, { emit }) {
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
        <div class="frow max-md:gap-2 gap-3 items-center">
          <QInput
            {...c`ChatBodyInput`}
            modelValue={promot.value}
            onUpdate:modelValue={(value) => {
              emit("Update:promot", String(value));
            }}
            type="textarea"
            color={component_color.value}
            dark
            filled
            placeholder="在这里输入消息。"
            autogrow
            ref={inputter}
          ></QInput>
          <QBtn
            {...c`w-[3.5rem] h-[3rem]`}
            {...submit_props.value}
            loading={props.submit_btn_loading}
            unelevated
            dense
            onClick={() => {
              emit("submit");
            }}
          ></QBtn>
        </div>
      );
    };
  },
});

export const ChatBodyInput = defineComponent({
  props: ["submit_btn_loading"],
  emits: ["submit"],
  setup(props: { submit_btn_loading?: boolean }, { attrs, emit }) {
    const ms = use_main_store();
    const promot = toRef(ms.chat_body_input, "promot");
    const mode = toRef(ms.chat_body_input, "mode");
    return () => {
      return (
        <div
          class={[
            "fcol frow max-md:gap-2 gap-3 bg-zinc-800 bg-opacity-[.85] p-3 rounded-lg drop-shadow-lg fit-width",
          ]}
          {...attrs}
        >
          <ChatBodyInputer
            {...props}
            {...refvmodel(promot, "promot")}
            mode={mode.value}
            onSubmit={() => emit("submit")}
          ></ChatBodyInputer>
          <ChatBodyInputToolbar></ChatBodyInputToolbar>
        </div>
      );
    };
  },
});
