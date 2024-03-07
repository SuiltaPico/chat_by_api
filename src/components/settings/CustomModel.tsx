import { defineComponent } from "vue";
import { SettingItemSection, generate_SettingItem } from "./SettingItem";
import { QInput } from "quasar";
import use_main_store from "../../store/memory/main_store";
import { throttle } from "lodash";
import { c } from "../../common/utils";
import { load_models } from "../../common/api_meta";

export const CustomModel = defineComponent({
  setup() {
    const ms = use_main_store();
    const SettingItem = generate_SettingItem("自定义模型");
    return () => {
      return (
        <SettingItem>
          <SettingItemSection class="frow items-center">
            <div>自定义模型（空格分隔）</div>
            <QInput
              {...c`min-w-[200px] w-[40vw]`}
              color="secondary"
              modelValue={ms.settings.settings.custom_model.models ?? ""}
              onUpdate:modelValue={throttle(async (value) => {
                await ms.push_to_db_task_queue(async () => {
                  ms.settings.settings.custom_model.models = value;
                  ms.settings.set_setting(
                    "custom_model",
                    ms.settings.settings.custom_model
                  );
                });
                const models_src = ms.settings.settings.custom_model.models;
                const models = []
                if (models_src) {
                  models.push(...models_src.split(/ +/))
                }
                load_models(models)
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
