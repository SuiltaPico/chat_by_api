import {
  QBtn,
  QIcon,
  QInput,
  QSelect,
  QSpinner,
  QSpinnerComment,
  QToggle,
} from "quasar";
import { defineComponent, toRef } from "vue";
import use_main_store from "../store/main_store";
import { c, refvmodel } from "../common/utils";
import {
  models as openai_models,
  brief_mode_models as openai_brief_mode_models,
} from "../common/from_openai";
import _ from "lodash";
import { app_body_width } from "../common/display";

export const ChatBodyInput = defineComponent({
  props: ["submit_btn_loading"],
  emits: ["submit"],
  setup(props: { submit_btn_loading?: boolean }, ctx) {
    const main_store = use_main_store();

    const models = openai_models.chat_completions;
    const brief_mode_models = openai_brief_mode_models.chat_completions;
    const brief_mode_models_option = _.chain(brief_mode_models)
      .mapValues((it, key) => ({
        label: key,
        value: it,
      }))
      .toArray()
      .value();

    const model = toRef(main_store.chat_body_input, "model");
    const brief_mode = toRef(main_store.chat_body_input, "brief_mode");
    const promot = toRef(main_store.chat_body_input, "promot");
    return () => {
      console.log("ChatBodyInput render");
      
      const { attrs, emit } = ctx;
      return (
        <div
          class={
            "fcol gap-3 bg-zinc-800 bg-opacity-[.85] p-4 rounded-lg drop-shadow-lg xl:w-[80%] xl:max-w-[800px]"
          }
          {...attrs}
        >
          <div class="frow gap-3 items-center">
            <QInput
              {...c`ChatBodyInput`}
              {...refvmodel(promot)}
              type="textarea"
              color="secondary"
              dark
              filled
              placeholder="在这里输入消息。"
              autogrow
            ></QInput>
            <QBtn
              {...c`w-[4rem] h-[3rem]`}
              icon="mdi-send"
              color="primary"
              loading={props.submit_btn_loading}
              unelevated
              dense
              onClick={() => {
                emit("submit");
              }}
            ></QBtn>
          </div>

          <div class="frow rounded-full items-center text-zinc-400 gap-4">
            <div class="frow items-center">
              <div>状态：</div>
              <div class="frow w-fit p-1.5 rounded-full items-center gap-2 text-[0.8rem]">
                {(() => {
                  const { status } = main_store.curry_chat;
                  if (status === "") {
                    return (
                      <>
                        <QIcon
                          name="mdi-check"
                          size="1rem"
                          color="primary"
                        ></QIcon>
                        <div>等待生成</div>
                      </>
                    );
                  } else if (status === "connecting") {
                    return (
                      <>
                        <QSpinner size="1rem" color="primary"></QSpinner>
                        <div>正在连接服务器……</div>
                      </>
                    );
                  } else if (status === "generating") {
                    return (
                      <>
                        <QSpinnerComment
                          size="1rem"
                          color="primary"
                        ></QSpinnerComment>
                        <div>正在生成……</div>
                      </>
                    );
                  }
                })()}
              </div>
            </div>
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
              options={brief_mode.value ? brief_mode_models_option : models}
              dark
              dense
              filled
            ></QSelect>
            {/* <QToggle
              {...c`select-none text-zinc-200`}
              {...refvmodel(brief_mode)}
              label={brief_mode.value ? "简略模式" : "详细模式"}
              color="primary"
              dense
            ></QToggle> */}
          </div>
        </div>
      );
    };
  },
});
