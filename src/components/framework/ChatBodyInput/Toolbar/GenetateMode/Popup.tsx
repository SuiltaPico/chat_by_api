import { QInput, QPopupProxy, QSelect, QSlider, QToggle } from "quasar";
import { defineComponent, toRef } from "vue";
import { openai_models } from "../../../../../common/api_meta";
import { c, refvmodel } from "../../../../../common/utils";
import use_main_store from "../../../../../store/memory/main_store";

export const Popup = defineComponent({
  setup() {
    const ms = use_main_store();

    const models = openai_models;
    const model = toRef(ms.chat_body_input, "model");
    const temperature = toRef(ms.chat_body_input, "temperature");
    const presence_penalty = toRef(ms.chat_body_input, "presence_penalty");
    const frequency_penalty = toRef(ms.chat_body_input, "frequency_penalty");
    const auto_max_tokens = toRef(ms.chat_body_input, "auto_max_tokens");
    const max_tokens = toRef(ms.chat_body_input, "max_tokens");

    const slider_list = [
      {
        ref: temperature,
        name: "温度",
        min: 0,
        max: 2,
      },
      {
        ref: presence_penalty,
        name: "存在惩罚",
        min: -2,
        max: 2,
      },
      {
        ref: frequency_penalty,
        name: "重复惩罚",
        min: -2,
        max: 2,
      },
    ];

    return () => {
      return (
        <QPopupProxy
          {...c`min-w-[14rem] p-5 bg-zinc-800 text-zinc-200 gap-6 fcol quick shadow-2xl border border-zinc-600`}
          breakpoint={0}
        >
          <QSelect
            {...c`min-w-[140px] bg-zinc-800 _hidden max-sm:flex`}
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
            options={models.value.chat_completions}
            dark
            filled
          ></QSelect>
          {slider_list.map((s) => (
            <div class="fcol text-sm min-w-[6rem] px-1">
              <div>
                {s.name}：{s.ref.value}
              </div>
              <QSlider
                {...refvmodel(s.ref)}
                min={s.min}
                max={s.max}
                step={0.01}
                dark
                dense
              ></QSlider>
            </div>
          ))}
          <div class="fcol text-sm min-w-[6rem] gap-4 p-1">
            <div>最大 token 数</div>
            <QToggle
              {...refvmodel(auto_max_tokens)}
              label="自动"
              dense
            ></QToggle>
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
      );
    };
  },
});
