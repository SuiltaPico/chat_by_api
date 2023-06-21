import _ from "lodash";
import {
  QBtn,
  QIcon
} from "quasar";
import { defineComponent, ref } from "vue";
import { tpl } from "../../../common/jsx_utils";
import {
  c,
  promise_with_ref,
  refvmodel_type
} from "../../../common/utils";
import { DBAPIKEYDuplicateError } from "../../../store/db/db_api";
import use_main_store from "../../../store/main_store";
import {
  DialogExpose,
  ModifyAPIKEYDialog,
} from "../../common/ModifyAPIKEYDialog";
import { SettingItemSection as Section, SettingItem } from "../SettingItem";
import { APIKEYTable } from "./APIKEYTable";

export const APIKEYManager = defineComponent({
  setup() {
    const ms = use_main_store();

    const add_new_dialog_error_info = ref("");
    const modify_dialog_error_info = ref("");

    const frozen_key_editing = ref(false);

    const add_new_dialog_showing = ref(false);
    const modify_dialog = ref<DialogExpose>();
    const modify_dialog_showing = ref(false);
    const modify_index = ref(-1);

    async function apply_apikey_editing() {
      _.debounce(async () => {
        await promise_with_ref(
          async () => {
            const settings = ms.settings.settings;
            await ms.push_to_db_task_queue(
              async () =>
                await ms.settings.set_setting("apikeys", settings.apikeys)
            );
          },
          frozen_key_editing,
          (e) => {
            if (e instanceof DBAPIKEYDuplicateError) {
              add_new_dialog_error_info.value =
                "[更改失败]：API-KEY 名称重复，第";
              console.log(e.map);
              add_new_dialog_error_info.value += _.chain(e.map)
                .mapValues(
                  (it, name) =>
                    `${it
                      .map((i) => i + 1)
                      .join("，")} 处使用了相同的名称 ${name}。`
                )
                .values()
                .join("")
                .value();
            }
          }
        );
      }, 100)();
    }

    return () => {
      const settings = ms.settings.settings;

      return (
        <SettingItem class="api_key_manager_setting settings_item">
          {{
            title: () => "API-KEY 管理",
            default: () =>
              tpl(
                <Section>
                  <ModifyAPIKEYDialog
                    {...refvmodel_type(add_new_dialog_showing, "modelValue")}
                    {...refvmodel_type(add_new_dialog_error_info, "error_info")}
                    mode="add"
                    onSubmit={async (apikey, close_dialog) => {
                      if (apikey === undefined) {
                        add_new_dialog_error_info.value =
                          "系统内部错误，ModifyAPIKEYDialog 不支持现有的模式。请前往 github 发起 issue。";
                        return;
                      }
                      settings.apikeys.keys.push(apikey);
                      await apply_apikey_editing();
                      close_dialog();
                    }}
                  ></ModifyAPIKEYDialog>
                  <QBtn
                    {...c`px-[0.8rem] pr-[1rem] py-[0.5rem]`}
                    color="primary"
                    unelevated
                    no-caps
                    onClick={() => {
                      add_new_dialog_showing.value = true;
                    }}
                  >
                    <div class="frow gap-2 items-center justify-center">
                      <QIcon name="mdi-plus" size="1rem"></QIcon>
                      <div>添加新的 API-KEY</div>
                    </div>
                  </QBtn>
                </Section>,
                <Section>
                  <ModifyAPIKEYDialog
                    {...refvmodel_type(modify_dialog_showing, "modelValue")}
                    {...refvmodel_type(modify_dialog_error_info, "error_info")}
                    mode="modify"
                    onSubmit={async (apikey, close_dialog) => {
                      if (apikey === undefined) {
                        modify_dialog_error_info.value =
                          "系统内部错误，ModifyAPIKEYDialog 不支持现有的模式。请前往 github 发起 issue。";
                        return;
                      }
                      settings.apikeys.keys[modify_index.value] = apikey;
                      await apply_apikey_editing();
                      close_dialog();
                    }}
                    ref={modify_dialog}
                  ></ModifyAPIKEYDialog>
                  <APIKEYTable
                    onRemove_apikey={async (index) => {
                      settings.apikeys.keys.splice(index, 1);
                      await apply_apikey_editing();
                    }}
                    onShow_editor={(index) => {
                      modify_index.value = index;
                      modify_dialog_showing.value = true;
                      modify_dialog.value?.set_apikey(
                        settings.apikeys.keys[index]
                      );
                    }}
                    onTo_top={async (index) => {
                      await ms.push_to_db_task_queue(async () => {
                        const last = settings.apikeys.keys[0];
                        settings.apikeys.keys[0] = settings.apikeys.keys[index];
                        settings.apikeys.keys[index] = last;
                        await ms.settings.set_setting(
                          "apikeys",
                          settings.apikeys
                        );
                      });
                    }}
                  ></APIKEYTable>
                </Section>
              ),
          }}
        </SettingItem>
      );
    };
  },
});
