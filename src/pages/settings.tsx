import { QBtn, QIcon, QInput, QPage, QSelect, QToggle } from "quasar";
import { defineComponent, ref } from "vue";
import { batch_set_ref, c, promise_with_ref, refvmodel } from "../common/utils";
import use_main_store from "../store/main_store";
import { APIKeySource } from "../interface/Settings";
import { passwd_attr, passwd_slot } from "../common/quasar_utils";
import _ from "lodash";
import { DBAPIKEYDuplicateError } from "../store/db_api";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
  html: false,
});

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
      }, 100)();
    }

    return () => {
      const settings = main_store.settings;
      console.log(settings);
      // TODO: 压缩这里的代码
      return (
        <div class="fcol gap-6">
          <div class="text-xl font-bold">API-KEY 管理</div>
          {err.value ? <div class="error_container">{err.value}</div> : ""}
          <div class="fcol gap-2">
            <div>添加新的 API-KEY</div>
            <div class="frow gap-4 items-center pl-4">
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
            <div>缓存的 API-KEY（目前仅支持使用第一个）</div>
            {settings.apikeys.keys.map((it, i, keys) => (
              <div class="frow gap-4 items-center pl-4">
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

export const OpenAI = defineComponent({
  setup() {
    const ms = use_main_store();
    async function apply_editing() {
      _.debounce(async () => {
        console.log(ms.settings);
        await ms.set_settings("open_ai");
      }, 100)();
    }

    return () => {
      const open_ai = ms.settings.open_ai;
      console.log(open_ai);

      return (
        <div class="fcol gap-6">
          <div class="text-xl font-bold">OpenAI</div>
          <div class="fcol gap-4">
            <div>第三方 API 设置</div>
            <div class="frow gap-4 pl-4">
              <QInput
                {...c`grow`}
                modelValue={open_ai.api_base_path}
                onUpdate:modelValue={(it) => {
                  open_ai.api_base_path = String(it);
                  apply_editing();
                }}
                label="base_path"
                filled
                dark
                color="secondary"
              ></QInput>
              <QInput
                {...c`grow`}
                modelValue={open_ai.api_version}
                onUpdate:modelValue={(it) => {
                  open_ai.api_version = String(it);
                  apply_editing();
                }}
                label="api_version"
                filled
                dark
                color="secondary"
              ></QInput>
            </div>
          </div>
        </div>
      );
    };
  },
});

export const About = defineComponent({
  setup() {
    const update_log = [
      {
        version: "0.1.3",
        content: `
* 修复了切换页面渲染滞留。
* 更更人性化的聊天窗口滚动。
* 修复了文本生成时不能在编辑器编辑的 bug。
* 修复了首次对话的时候输入框不会清空的 bug。
* 增加了更多错误情况的描述文本。
* 更函数式编程了（？）
* 修复了 \`<li>\` 使用 \`display: flex;\` 导致的错误排版。
`
      },
      {
        version: "0.1.2",
        content: `
* 更人性化的聊天窗口滚动
* 更人性化的复制提醒
`,
      },
      {
        version: "0.1.1",
        content: `
* 增加了设置的 OpenAI 的 baseurl、api_version 选项。
* 修复了排版错误。
* 增加了生成时连接中断的报错提示。
        `,
      },
      {
        version: "0.1.0",
        content: `
* 小重构了chat页面，修复了“错误提示”错误的问题。
* 添加了服务端消息的复制和用户消息的引入到输入框。
* 添加了 LICENSE，随便选了个 AGPL v3。
* 添加了预导入 ChatGPT 图标的，不然每次打开 chat 页面，ChatGPT 图标都要卡一下。
* 瞎折腾一下午我也不记得加了些什么了，，
        `,
      },
      {
        version: "0.0.0",
        content: `忘记干了什么了，反正是踩了很多vue-tsx的坑。`,
      },
    ];
    return () => (
      <div class="fcol gap-6">
        <div class="text-xl font-bold">关于</div>
        <div class="fcol gap-2">
          <div class="frow gap-2">
            <div class="text-md font-bold">版本</div>
            <div>{update_log[0].version}</div>
          </div>
          <details>
            <summary>版本描述</summary>
            <div class="fcol gap-4 m-2">
              <div>hoho。</div>
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
        <QPage {...c`frow default-bg text-zinc-200 justify-center`}>
          <div class="fcol default-bg xl:w-[60%] pt-8 gap-12">
            <APIKEY_Manager></APIKEY_Manager>
            <OpenAI></OpenAI>
            <About></About>
          </div>
        </QPage>
      );
    };
  },
});
