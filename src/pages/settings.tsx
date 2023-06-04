import {
  QBtn,
  QDialog,
  QIcon,
  QInput,
  QItem,
  QList,
  QPage,
  QSelect,
  QTable,
  QToggle,
} from "quasar";
import { computed, defineComponent, ref, watch } from "vue";
import {
  batch_set_ref,
  c,
  cl,
  promise_with_ref,
  refvmodel,
  refvmodel_type,
} from "../common/utils";
import use_main_store from "../store/main_store";
import { APIKey, APIKeySource } from "../interface/Settings";
import { HotKeys } from "../common/key_event";
import { passwd_attr, passwd_slot } from "../common/quasar_utils";
import _ from "lodash";
import { DBAPIKEYDuplicateError } from "../store/db_api";
import MarkdownIt from "markdown-it";
import update_log from "../common/update_log";
import { useRouter } from "vue-router";
import { not_undefined_or, tpl } from "../common/jsx_utils";
import {
  DialogExpose,
  DialogMode,
  ModifyAPIKEYDialog,
} from "../components/ModifyAPIKEYDialog";
import BetterBtn from "../components/BetterBtn";

const md = new MarkdownIt({
  html: false,
});

export const HotKeysManager = defineComponent({
  setup() {
    const ms = use_main_store();

    const set = (...ks: string[]) => new Set(ks);
    const st = (s: Set<string>, t: string) => ({
      s,
      t,
    });

    function HotKeys_to_submit_keys_selection(hot_keys: HotKeys) {
      const first_hot_key = hot_keys.value[0].keys;
      // const list = [
      //   st(set("Enter"), "Enter"),
      //   st(set("Ctrl", "Enter"), "Ctrl + Enter"),
      //   st(set("Shift", "Enter"), "Shift + Enter"),
      //   st(set("Alt", "Enter"), "Alt + Enter"),
      // ];
      return first_hot_key.join(" + ");
    }

    const submit_keys_loading = ref(false);

    const submit_keys_selected = ref();
    const submit_keys_options = [
      "Enter",
      "Ctrl + Enter",
      "Shift + Enter",
      "Alt + Enter",
    ];

    return () => {
      const hotkeys = ms.settings.hot_keys;
      submit_keys_selected.value = HotKeys_to_submit_keys_selection(
        hotkeys.submit_keys
      );
      return (
        <div class="fcol gap-5">
          <div class="text-xl font-bold">快捷键</div>
          <ul>
            <li class="gap-2 items-center marker:text-zinc-400">
              <div class="frow gap-2 items-center">
                <div>发送消息:</div>
                <QSelect
                  modelValue={submit_keys_selected.value}
                  onUpdate:modelValue={async (new_keys) => {
                    submit_keys_loading.value = true;
                    ms.settings.hot_keys.submit_keys.value[0].keys =
                      new_keys.split(" + ");
                    await ms.set_settings("hot_keys", ms.settings.hot_keys);
                    await ms.sync_db();
                    submit_keys_loading.value = false;
                  }}
                  options={submit_keys_options}
                  loading={submit_keys_loading.value}
                  color="secondary"
                  dark
                  filled
                  dense
                ></QSelect>
              </div>
            </li>
          </ul>
        </div>
      );
    };
  },
});

export const APIKEY_Manager = defineComponent({
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
            await ms.set_settings("apikeys");
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
      const settings = ms.settings;
      // TODO: 压缩这里的代码
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
                  ms.settings.apikeys.keys.push(apikey);
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
                  ms.settings.apikeys.keys[modify_index.value] = apikey;
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
          <div class="fcol gap-2">
            <div>缓存的 API-KEY（目前仅支持使用第一个）</div>
            {settings.apikeys.keys.map((it, i, keys) => (
              <div class="frow flex-wrap gap-4 items-center pl-4">
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
                  {...c`grow`}
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
                    await ms.set_settings("apikeys");
                  }}
                ></QBtn>
                <BetterBtn
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
                  class="bg-_negative2"
                  onClick={() => {
                    keys.splice(i, 1);
                    apply_apikey_editing();
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

export const About = defineComponent({
  setup() {
    return () => (
      <div class="fcol gap-5">
        <div class="text-xl font-bold">关于</div>
        <div class="fcol gap-2">
          <div class="frow gap-2">
            <div class="text-md font-bold">版本</div>
            <div>{update_log[0].version}</div>
          </div>
          <details open>
            <summary>源代码</summary>
            <div class="fcol gap-4 m-2">
              <div>
                <QBtn
                  icon="mdi-github"
                  size="1rem"
                  flat
                  href="https://github.com/SuiltaPico/chat_by_api"
                ></QBtn>
              </div>
            </div>
          </details>
          <details class="frow gap-2">
            <summary>更新日志</summary>
            <div class="p-4">
              {update_log.map((it) => (
                <div>
                  <div class="font-bold">{it.version}</div>
                  <div class="p-2" v-html={md.render(it.content)}></div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    );
  },
});

export default defineComponent({
  setup() {
    return () => {
      return (
        <QPage {...c`frow default-bg text-zinc-200 justify-center p-4`}>
          <div class="fcol default-bg record-fit-width pt-8 gap-12">
            <HotKeysManager></HotKeysManager>
            <APIKEY_Manager></APIKEY_Manager>
            <About></About>
          </div>
        </QPage>
      );
    };
  },
});
