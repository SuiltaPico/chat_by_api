import { defineComponent } from "vue";
import { SettingItemSection, generate_SettingItem } from "./SettingItem";
import { QInput } from "quasar";
import use_main_store from "../../store/memory/main_store";
import { throttle } from "lodash";
import { c } from "../../common/utils";

export const Behaviors = defineComponent({
  setup() {
    const ms = use_main_store();
    const SettingItem = generate_SettingItem("行为设置");
    return () => {
      return (
        <SettingItem>
          <SettingItemSection class="frow items-center">
            <div>“继续生成”的提示文本</div>
            <QInput
              {...c`min-w-[200px] w-[40vw]`}
              color="secondary"
              modelValue={
                ms.settings.settings.behaviors.continue_to_generate_prompt
              }
              onUpdate:modelValue={throttle(async (value) => {
                await ms.push_to_db_task_queue(async () => {
                  ms.settings.settings.behaviors.continue_to_generate_prompt =
                    value;
                  ms.settings.set_setting(
                    "behaviors",
                    ms.settings.settings.behaviors
                  );
                });
              }, 200)}
              filled
              dark
            ></QInput>
          </SettingItemSection>
        </SettingItem>
      );
    };
  },
});
