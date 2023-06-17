import _ from "lodash";
import { QBtn, QIcon, QInput, QSelect } from "quasar";
import { defineComponent, ref } from "vue";
import { passwd_attr, passwd_slot } from "../../common/quasar_utils";
import { c, cl, promise_with_ref, refvmodel_type } from "../../common/utils";
import BetterBtn from "../../components/BetterBtn";
import {
  DialogExpose,
  ModifyAPIKEYDialog,
} from "../../components/ModifyAPIKEYDialog";
import { APIKey, APIKeySource } from "../../interface/Settings";
import { DBAPIKEYDuplicateError } from "../../store/db/db_api";
import use_main_store from "../../store/main_store";

export const APIKEYManager = defineComponent({
  setup() {
    const ms = use_main_store();

    const add_new_dialog_error_info = ref("");
    const modify_dialog_error_info = ref("");
    const new_key_type_option: APIKeySource[] = ["OpenAI", "Custom"];

    const layout_props = {
      dark: true,
      filled: true,
      dense: true,
      color: "secondary",
    } as const;

    function existed_model<T extends keyof APIKey>(it: APIKey, attr: T) {
      return {
        modelValue: it[attr],
        "onUpdate:modelValue": (v: APIKey[T]) => {
          it[attr] = v;
          apply_apikey_editing();
        },
      };
    }

    const frozen_key_editing = ref(false);
    const all_key_showing = ref(false);

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
        <div class="fcol gap-5">
          <div class="text-xl font-bold">API-KEY 管理</div>
          <div class="fcol gap-2">
            <div>
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
            </div>
            <div></div>
          </div>
          <div class="fcol gap-4">
            <div>缓存的 API-KEY（目前仅支持使用第一个）</div>
            {settings.apikeys.keys.map((it, i, keys) => (
              <div class="frow flex-wrap gap-3 items-center pl-4">
                <div>{i + 1}.</div>
                <QSelect
                  label="来源"
                  {...existed_model(it, "source")}
                  {...layout_props}
                  options={new_key_type_option}
                  readonly
                ></QSelect>
                <QInput
                  label="名称"
                  {...c`max-w-[20%] shrink`}
                  {...existed_model(it, "name")}
                  onUpdate:modelValue={(v) => {
                    it.name = String(v);
                    apply_apikey_editing();
                  }}
                  {...layout_props}
                  readonly
                />
                <QInput
                  readonly
                  {...c`shrink`}
                  {...passwd_attr(all_key_showing)}
                  {...existed_model(it, "key")}
                  {...layout_props}
                >
                  {{
                    ...passwd_slot(all_key_showing, {
                      size: "1.4rem",
                    }),
                  }}
                </QInput>
                <QBtn
                  {...cl([
                    "text-_primary bg-zinc-600 text-[0.75rem]",
                    i === 0 ? "hidden" : "",
                  ])}
                  icon="mdi-arrow-collapse-up"
                  unelevated
                  padding="0.5rem 0.5rem"
                  onClick={async () => {
                    const last = settings.apikeys.keys[0];
                    settings.apikeys.keys[0] = it;
                    settings.apikeys.keys[i] = last;
                    await ms.push_to_db_task_queue(
                      async () =>
                        await ms.settings.set_setting(
                          "apikeys",
                          settings.apikeys
                        )
                    );
                  }}
                ></QBtn>
                <BetterBtn
                  class="min-w-[5.3rem] bg-_primary"
                  onClick={() => {
                    modify_index.value = i;
                    modify_dialog_showing.value = true;
                    modify_dialog.value?.set_apikey(it);
                  }}
                >
                  <div class="frow gap-2 items-center justify-center">
                    <QIcon name="mdi-pencil" size="1.2rem"></QIcon>
                    <div>编辑</div>
                  </div>
                </BetterBtn>
                <BetterBtn
                  class="min-w-[5.3rem] bg-_negative2"
                  onClick={async () => {
                    keys.splice(i, 1);
                    await apply_apikey_editing();
                  }}
                >
                  <div class="frow gap-2 items-center justify-center">
                    <QIcon name="mdi-delete" size="1.2rem"></QIcon>
                    <div>删除</div>
                  </div>
                </BetterBtn>
              </div>
            ))}
          </div>
        </div>
      );
    };
  },
});
