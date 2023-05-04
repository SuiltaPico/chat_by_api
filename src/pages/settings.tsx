import { QBtn, QIcon, QInput, QPage, QSelect } from "quasar";
import { defineComponent, ref } from "vue";
import { batch_set_ref, c, promise_with_ref, refvmodel } from "../common/utils";
import use_main_store from "../store/main_store";
import { APIKeySource } from "../interface/Settings";
import { passwd_attr, passwd_slot } from "../common/quasar_utils";
import _ from "lodash";
import { watch } from "fs";
import { DBAPIKEYDuplicateError } from "../store/db_api";

export const APIKEY_Manager = defineComponent({
  setup() {
    const main_store = use_main_store();

    const err = ref("");

    const new_key_type = ref<APIKeySource>("OpenAI");
    const new_key_type_option: APIKeySource[] = ["OpenAI"];

    const new_key_name = ref<string>("");
    const new_key_key = ref<string>("");

    const new_key_showing = ref(false);

    const new_key_adding = ref(false);
    const frozen_key_editing = ref(false);

    const all_key_showing = ref(false);

    async function apply_key_editing() {
      _.debounce(async () => {
        await promise_with_ref(
          async () => {
            await main_store.set_settings("apikeys");
          },
          frozen_key_editing,
          (e) => {
            if (e instanceof DBAPIKEYDuplicateError) {
              err.value = "[更改失败]：API-KEY 名称重复，第";
              console.log(e.map);
              err.value += _.chain(e.map)
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
      }, 200)();
    }

    return () => {
      const settings = main_store.settings;
      console.log(settings);
      return (
        <div class="fcol gap-6">
          <div class="text-xl font-bold">API-KEY 管理</div>
          {err.value ? <div class="error_container">{err.value}</div> : ""}
          <div class="fcol gap-2">
            <div>添加新的 API-KEY</div>
            <div class="frow gap-4 items-center">
              <QSelect
                {...refvmodel(new_key_type)}
                options={new_key_type_option}
                dark
                filled
                dense
                color="secondary"
              ></QSelect>
              <QInput
                {...refvmodel(new_key_name)}
                label="名称（可选）"
                dark
                filled
                dense
                color="secondary"
              />
              <QInput
                {...c`grow`}
                {...refvmodel(new_key_key)}
                {...passwd_attr(new_key_showing)}
                label="API-KEY"
                dark
                filled
                dense
                color="secondary"
              >
                {{
                  ...passwd_slot(new_key_showing, {
                    size: "1.4rem",
                  }),
                }}
              </QInput>
              <QBtn
                color="primary"
                unelevated
                loading={new_key_adding.value}
                onClick={() => {
                  promise_with_ref(async () => {
                    main_store.settings.apikeys.keys.push({
                      source: new_key_type.value,
                      name: new_key_name.value,
                      key: new_key_key.value,
                    });
                    batch_set_ref("", new_key_name, new_key_key);
                    await main_store.set_settings("apikeys");
                  }, new_key_adding);
                }}
              >
                添加
              </QBtn>
            </div>
          </div>
          <div class="fcol gap-2">
            <div>缓存的 API-KEY</div>
            {settings.apikeys.keys.map((it, i, keys) => (
              <div class="frow gap-4 items-center">
                <div>{i + 1}.</div>
                <QSelect
                  modelValue={it.source}
                  onUpdate:modelValue={(v) => {
                    it.source = v;
                    apply_key_editing();
                  }}
                  options={new_key_type_option}
                  dark
                  filled
                  readonly={frozen_key_editing.value}
                  color="secondary"
                  dense
                ></QSelect>
                <QInput
                  modelValue={it.name}
                  onUpdate:modelValue={(v) => {
                    it.name = String(v);
                    apply_key_editing();
                  }}
                  dark
                  filled
                  color="secondary"
                  dense
                />
                <QInput
                  {...c`grow`}
                  {...passwd_attr(all_key_showing)}
                  modelValue={it.key}
                  onUpdate:modelValue={(v) => {
                    it.key = String(v);
                    apply_key_editing();
                  }}
                  dark
                  filled
                  color="secondary"
                  dense
                >
                  {{
                    ...passwd_slot(all_key_showing, {
                      size: "1.4rem",
                    }),
                  }}
                </QInput>
                <QBtn
                  color="negative"
                  unelevated
                  onClick={() => {
                    keys.splice(i, 1);
                    apply_key_editing();
                  }}
                >
                  删除
                </QBtn>
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
      <div class="fcol gap-6">
        <div class="text-xl font-bold">关于</div>
        <div class="fcol gap-2">
          <div class="frow gap-2">
            <div class="text-md font-bold">版本</div>
            <div>0.0.1</div>
          </div>
          <div class="frow gap-2">
            <div>目前还有好多问题啊，凑合着用吧。</div>
          </div>
        </div>
      </div>
    );
  },
});

export default defineComponent({
  setup() {
    return () => {
      return (
        <QPage {...c`frow default-bg text-zinc-200 justify-center`}>
          <div class="fcol default-bg xl:w-[60%] pt-8 gap-12">
            <APIKEY_Manager></APIKEY_Manager>
            <About></About>
          </div>
        </QPage>
      );
    };
  },
});
