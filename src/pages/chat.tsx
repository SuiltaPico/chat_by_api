import markdown_it_katex from "@vscode/markdown-it-katex";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import _ from "lodash";
import MarkdownIt from "markdown-it";
import markdown_it_highlightjs from "markdown-it-highlightjs";
import { Configuration, OpenAIApi } from "openai-edge";
import {
  QBtn,
  QIcon,
  QInput,
  QPage,
  QPopupProxy,
  QSpace,
  useQuasar,
} from "quasar";
import { computed, defineComponent, ref, toRef, watch } from "vue";
import { useRouter } from "vue-router";
import {
  Maybe,
  any,
  c,
  non_empty_else,
  promise_with_ref,
  refvmodel,
  scroll_if_close_to,
  scroll_to,
} from "../common/utils";
import { ChatBodyInput } from "../components/ChatBodyInput";
import ErrorContainer from "../components/ErrorContainer";
import { Messages_to_OpenAI_Messages } from "../impl/ChatRecord";
import {
  Message,
  Role,
  ServerMessage,
  UserMessage,
} from "../interface/ChatRecord";
import use_main_store from "../store/main_store";
import copy from "copy-text-to-clipboard";

import { not_undefined_or } from "../common/jsx_utils";

const md = new MarkdownIt({
  html: false,
});
md.use(markdown_it_highlightjs, {});
md.use(markdown_it_katex, {
  displayMode: "html",
  throwOnError: false,
});

function openai_steam_error_to_error(data: string) {
  console.log(data);
  try {
    const data_json = JSON.parse(data);
    if (typeof data_json === "object") {
      if (
        data_json.error !== undefined &&
        typeof data_json.error === "object"
      ) {
        return {
          err_type: "api",
          ...data_json.error,
        };
      } else {
        return {
          err_type: "others_api",
          content: data_json,
        };
      }
    } else if (typeof data_json === "string") {
      return {
        err_type: "others_string",
        content: data_json,
      };
    }
  } catch {}
  return {
    err_type: "others_string",
    content: data,
  };
}

async function generate_next(index: number) {
  const ms = use_main_store();
  const { chat_body_input, curry_chat } = ms;

  const msg = ms.curry_chat.messages[index] as ServerMessage;
  // 锁定chatid，不被变化影响
  const chat_id = ms.curry_chat.id!;
  const apply_update_chat_record_messages = _.throttle(async () => {
    await ms.update_chat_record_messages(chat_id);
  }, 100);

  if (ms.settings.apikeys.keys.length === 0) {
    msg.error = {
      err_type: "no_api_key",
    };

    await apply_update_chat_record_messages();
    return;
  }

  const cfg = new Configuration({
    apiKey: ms.settings.apikeys.keys[0].key,
    basePath: non_empty_else(ms.settings.open_ai.api_base_path, undefined),
    baseOptions: {
      params: {
        "api-version": non_empty_else(
          ms.settings.open_ai.api_version,
          undefined
        ),
      },
    },
  });
  const openai = new OpenAIApi(cfg);

  curry_chat.status = "connecting";

  let res = {
    body: null as ReadableStream<Uint8Array> | null,
  };

  console.log(Messages_to_OpenAI_Messages(curry_chat.messages, true));

  try {
    res = await openai.createChatCompletion({
      model: chat_body_input.model,
      messages: Messages_to_OpenAI_Messages(curry_chat.messages, true),
      stream: true,
      temperature: ms.chat_body_input.temperature,
      presence_penalty: ms.chat_body_input.presence_penalty,
      frequency_penalty: ms.chat_body_input.frequency_penalty,
      max_tokens: ms.chat_body_input.auto_max_tokens
        ? undefined
        : ms.chat_body_input.max_tokens,
    });
  } catch (e) {
    msg.error = {
      err_type: "connection_error",
      content: String(e),
    };

    curry_chat.status = "";

    await apply_update_chat_record_messages();
    return;
  }

  curry_chat.status = "generating";

  const body = res.body;

  if (body === null) {
    return;
  }

  const decoder = new TextDecoder();
  const reader = body.getReader();

  let message_result = ref("");
  watch(message_result, async () => {
    ms.curry_chat.messages[index].content = message_result.value;
    await apply_update_chat_record_messages();
  });

  async function readStream() {
    while (true) {
      let done, value, res;

      try {
        res = await reader.read();
      } catch {
        msg.error = {
          err_type: "connection_abort",
        };
        await apply_update_chat_record_messages();
        curry_chat.status = "";
        return;
      }
      done = res.done;
      value = res.value;

      // console.log(done, value);
      if (done) break;
      const raw_result = decoder.decode(value);
      const msg_clip = _.chain(raw_result)
        .split("\n\n")
        .filter((it) => it.length > 0)
        .map((it) => {
          try {
            if (it === "data: [DONE]") {
              return {};
            }
            return JSON.parse(it.slice(6));
          } catch {
            return openai_steam_error_to_error(it);
          }
        })
        .reduce((acc, it) => {
          if (it.err_type) {
            msg.error = it;
            apply_update_chat_record_messages();
          }
          try {
            const delta = it.choices[0].delta;
            if (delta.content) {
              acc += delta.content;
            }
          } catch {}
          return acc;
        }, "")
        .value();

      scroll_if_close_to(document.getElementById("app")!, 32);
      message_result.value += msg_clip;
    }
  }

  await readStream();

  curry_chat.status = "";
}

export const Avatar = defineComponent({
  props: ["role"],
  emits: ["update:role"],
  setup(props: { role: Role }, ctx) {
    const part_eq = function <T>(a: T) {
      return _.partial(_.eq, a);
    };
    const next = _.cond<Role, Role>([
      [part_eq("user"), _.constant("assistant")],
      [part_eq("assistant"), _.constant("system")],
      [part_eq("system"), _.constant("user")],
      [_.stubTrue, _.constant("user")],
    ]);
    const emit_attr = any({
      onClick: () => {
        ctx.emit("update:role", next(props.role));
      },
    });
    return () => {
      const { role } = props;
      const { attrs } = ctx;
      if (role === "user") {
        return (
          <QIcon
            {...c`Avatar`}
            {...attrs}
            {...emit_attr}
            name="mdi-account"
            size="1.25rem"
          ></QIcon>
        );
      } else if (role === "assistant") {
        return (
          <div {...c`Avatar h-fit`} {...attrs} {...emit_attr}>
            <img
              src="/ChatGPT.svg"
              alt=""
              class="min-w-[1.25rem] min-h-[1.25rem] max-w-[1.25rem]"
            />
          </div>
        );
      } else if (role === "system") {
        return (
          <QIcon
            {...c`Avatar Avatar_system`}
            {...attrs}
            {...emit_attr}
            name="mdi-laptop"
            size="1.25rem"
          ></QIcon>
        );
      } else {
        return (
          <QIcon
            {...c`Avatar`}
            {...attrs}
            {...emit_attr}
            name="mdi-help-box-outline"
            size="1.25rem"
          ></QIcon>
        );
      }
    };
  },
});

export const ChatItemUserMessage = defineComponent<
  {
    message: UserMessage;
    chatid: string;
  },
  {},
  {},
  {},
  {},
  {},
  {},
  {
    delete: () => void;
  }
>({
  props: any(["message", "chatid"]),
  emits: ["delete"],
  setup(props, ctx) {
    const ms = use_main_store();
    return () => {
      const { message, chatid } = props;
      return (
        <div class={["ChatItem-wraper"]}>
          <Avatar
            class="mt-[2px]"
            role={message.role}
            onUpdate:role={(role) => {
              message.role = role;
              ms.update_chat_record_messages(chatid);
            }}
          ></Avatar>
          <div class="ChatItem-content">{message.content}</div>
          <QSpace></QSpace>
          <div class="frow flex-nowrap gap self-top h-fit min-w-[5rem] max-w-[5rem] gap-1">
            <QBtn
              {...c`text-xs text-zinc-300 p-2`}
              icon="mdi-import"
              flat
              onClick={() => {
                ms.chat_body_input.promot = message.content;
                ms.chat_body_input.inputter?.focus();
                ms.update_chat_record_messages(chatid);
              }}
            ></QBtn>
            <QBtn
              {...c`text-xs text-zinc-300 p-2`}
              icon="mdi-dots-horizontal"
              flat
            >
              <ChatItemMorePop
                onDelete={() => ctx.emit("delete")}
              ></ChatItemMorePop>
            </QBtn>
          </div>
        </div>
      );
    };
  },
});

export const ChatItemServerMessageErrorHandler = defineComponent({
  props: ["message"],
  setup(props: { message: ServerMessage }) {
    const router = useRouter();
    return () => {
      const { message } = props;
      const err = message.error;
      const err_str = JSON.stringify(err);
      if (err === undefined) return;

      if (err.err_type === "api") {
        if (err.code === "model_not_found") {
          return (
            <ErrorContainer
              content={`你的 API-KEY 无法使用当前模型 “${message.request_config.model}”，请尝试切换其它模型。`}
              raw={err_str}
            ></ErrorContainer>
          );
        } else if (err.type === "server_error") {
          const model_overloaded_reg =
            /That model is currently overloaded with other requests\. You can retry your request,[^ ]* or contact us through our help center at help\.openai\.com if the error persists\./gm;
          const model_overloaded_result = Maybe.of(err.message).map((s) =>
            model_overloaded_reg.exec(s)
          ).value;

          if (model_overloaded_result) {
            return (
              <ErrorContainer
                title="模型过载"
                content={`当前模型因其他请求而过载。您可以重试您的请求，或者如果错误仍然存​​在，请通过我们的帮助中心 help.openai.com 与我们联系。`}
                raw={err_str}
              ></ErrorContainer>
            );
          }

          return (
            <ErrorContainer
              title="服务器错误"
              content={`服务器发生错误，请查看 “详细信息”。`}
              raw={err_str}
            ></ErrorContainer>
          );
        } else if (err.type === "requests") {
          const rate_limit_reg =
            /Rate limit reached for (?<model_name>[^\s]+) in organization (?<organization_name>[^\s]+) on requests per min\. Limit: (?<limit>[^\.]+)\. Please try again in (?<retry_wait>[^\.]+)\. Contact us through our help center at help\.openai\.com if you continue to have issues\. Please add a payment method to your account to increase your rate limit\. Visit https:\/\/platform\.openai\.com\/account\/billing to add a payment method\./gm;

          const rate_limit_groups = Maybe.of(err.message)
            .map((s) => rate_limit_reg.exec(s))
            .map((arr) => arr.groups).value;

          if (rate_limit_groups) {
            const group_getter = _.bind(_.get, {}, rate_limit_groups, _, _);
            return (
              <ErrorContainer
                title="请求速率达到上限"
                content={`组织 ${group_getter(
                  "organization_name",
                  "未知组织"
                )} 中每分钟请求达到 ${group_getter(
                  "model_name",
                  "未知模型"
                )} 的速率限制。限制：${group_getter(
                  "limit",
                  "未知模型"
                )}。请在 ${group_getter(
                  "retry_wait",
                  "片刻"
                )} 后重试。如果您仍然遇到问题，请通过我们的帮助中心 help.openai.com 联系我们。请向您的帐户添加付款方式以提高您的费率限制。访问 https://platform.openai.com/account/billing 添加支付方式。`}
                raw={err_str}
              ></ErrorContainer>
            );
          }

          return (
            <ErrorContainer
              title="服务器拒绝了请求"
              raw={err_str}
            ></ErrorContainer>
          );
        } else {
          return <ErrorContainer title="错误" raw={err_str}></ErrorContainer>;
        }
      } else if (err.err_type === "no_api_key") {
        return (
          <ErrorContainer
            title="无 API-KEY"
            content="请前往 “设置 -> API-KEY 管理” 添加你的 API-KEY。"
          >
            <QBtn
              color="primary"
              unelevated
              onClick={() => {
                router.push({ name: "settings" });
              }}
            >
              立即前往
            </QBtn>
          </ErrorContainer>
        );
      } else if (err.err_type === "connection_error") {
        return (
          <ErrorContainer
            title="连接出错"
            content="请检查你的网络连接。如果网络连接正常，请检查你所处区域的网络是否能流畅访问 chat.openai.com。"
            raw={err.content}
          ></ErrorContainer>
        );
      } else if (err.err_type === "connection_abort") {
        return (
          <ErrorContainer
            title="连接中断"
            content="与服务器的连接中断了，需要重新生成。"
          ></ErrorContainer>
        );
      }
      return (
        <ErrorContainer
          title="请求失败"
          raw={JSON.stringify(err)}
        ></ErrorContainer>
      );
    };
  },
});

export const ChatItemServerMessage = defineComponent<
  {
    message: ServerMessage;
    chatid: string;
    index: number;
  },
  {},
  {},
  {},
  {},
  {},
  {},
  {
    delete: () => void;
  }
>({
  props: any(["message", "index", "chatid"]),
  setup(props, ctx) {
    const ms = use_main_store();
    const qs = useQuasar();

    return () => {
      const { message, index, chatid } = props;
      // const use_raw_render = toRef(ms.curry_chat.use_raw_render, index, true);
      return (
        <div class={["ChatItem-wraper"]}>
          <Avatar
            role={message.role}
            onUpdate:role={(role) => {
              message.role = role;
              ms.update_chat_record_messages(chatid);
            }}
          ></Avatar>
          <div class="ChatItem-content">
            <div class="mdblock" v-html={md.render(message.content)}></div>
            <ChatItemServerMessageErrorHandler
              message={message}
            ></ChatItemServerMessageErrorHandler>
          </div>
          <QSpace></QSpace>
          <div class="fcol flex-nowrap self-top h-fit min-w-[5rem] max-w-[5rem] gap-4 my-[-0.25rem]">
            <div class="frow items-center gap-1">
              <QBtn
                {...c`text-xs text-zinc-300 p-2`}
                icon="mdi-content-copy"
                flat
                onClick={() => {
                  const result = copy(message.content);
                  const notify = (msg: string) =>
                    qs.notify({
                      position: "top",
                      message: msg,
                      color: "primary",
                      timeout: 200,
                      type: "info",
                    });

                  if (result) {
                    notify("复制成功");
                  } else {
                    notify("复制失败");
                  }
                }}
              ></QBtn>
              <QBtn
                {...c`text-xs text-zinc-300 p-2`}
                icon="mdi-dots-horizontal"
                flat
              >
                <ChatItemMorePop
                  onDelete={() => ctx.emit("delete")}
                ></ChatItemMorePop>
              </QBtn>
              {/* <QToggle
                {...c`h-fit p-0 text-sm`}
                {...refvmodel(use_raw_render)}
                label="MD"
                color="secondary"
                size="xs"
              ></QToggle> */}
            </div>
          </div>
        </div>
      );
    };
  },
});

export const ChatItemMorePop = defineComponent<
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {
    delete: () => void;
  }
>({
  setup(_, ctx) {
    return () => (
      <QPopupProxy
        {...c`bg-zinc-800 text-white select-none quick`}
        breakpoint={0}
      >
        <QBtn
          unelevated
          onClick={() => {
            ctx.emit("delete");
          }}
        >
          <div class="frow gap-3 items-center text-base pr-1 w-[8rem]">
            <QIcon {...c`text-sm`} name="mdi-delete" size="1.2rem"></QIcon>
            <div>删除</div>
          </div>
        </QBtn>
        {{
          ...Maybe.of(ctx.slots.default)
            .map((slot) => slot())
            .unwrap_or(<div></div>),
        }}
      </QPopupProxy>
    );
  },
});

const ChatItem_gen_color = (index: number) => ({
  "bg-zinc-600": index % 2 == 0,
  "bg-[rgb(105,105,114)]": index % 2 == 1,
});

export const ChatItem = defineComponent<
  {
    message: Message;
    index: number;
    chatid: string;
  },
  {},
  {},
  {},
  {},
  {},
  {},
  {
    delete: () => void;
  }
>({
  props: any(["message", "index", "chatid"]),
  emits: ["delete"],
  setup(props, ctx) {
    return () => {
      const { message, index, chatid } = props;
      return (
        <div
          class={[
            "fcol w-full items-center max-md:py-4 py-5",
            ChatItem_gen_color(index),
          ]}
        >
          {not_undefined_or(() => {
            if (message.message_type === "user") {
              return (
                <ChatItemUserMessage
                  message={message}
                  chatid={chatid}
                  onDelete={() => {
                    ctx.emit("delete");
                  }}
                ></ChatItemUserMessage>
              );
            } else if (message.message_type === "server") {
              return (
                <ChatItemServerMessage
                  message={message}
                  chatid={chatid}
                  index={index}
                  onDelete={() => {
                    ctx.emit("delete");
                  }}
                ></ChatItemServerMessage>
              );
            }
          })}
        </div>
      );
    };
  },
});

export const ChatBodyTopBar = defineComponent({
  setup() {
    return () => {
      return <div></div>;
    };
  },
});

// export const ChatBodyAdd = defineComponent<{
//   index: number
// }>({
//   props: any(["index"]),
//   setup(props) {
//     const ms = use_main_store()
//     const promot = ref()
//     return () => {
//       return (
//         <div
//           class={["fcol w-full items-center py-4", ChatItem_gen_color(props.index)]}
//         >
//           <Avatar role={"system"}></Avatar>
//           <QInput
//               {...c`ChatBodyInput`}
//               {...refvmodel(promot)}
//               type="textarea"
//               color="secondary"
//               dark
//               filled
//               placeholder="在这里输入消息。"
//               autogrow
//             ></QInput>
//         </div>
//       );
//     };
//   },
// });

export const ChatBody = defineComponent({
  setup() {
    const ms = use_main_store();
    const router = useRouter();
    const route = computed(() => router.currentRoute.value);
    const chat_id = computed(() => route.value.params.chatid as string);
    const loading_messages = ref(false);
    const messages = computed(() => ms.curry_chat.messages);
    watch(
      chat_id,
      () => {
        promise_with_ref(async () => {
          ms.curry_chat.id = chat_id.value;
          await ms.sync_db();
          // 处理对话不存在的情况
          if (chat_id.value !== undefined && ms.curry_chat.id === undefined) {
            router.push({
              name: "index",
            });
          }
          if (ms.chat_body_input.require_next === true) {
            ms.chat_body_input.require_next = false;
            await generate_next(messages.value.length - 1);
          }
        }, loading_messages);
      },
      {
        immediate: true,
      }
    );
    return () => {
      const chatid = ms.curry_chat.id!;
      return (
        <div class="fcol relative grow text-zinc-100 h-min flex-nowrap">
          {/* <ChatBodyTopBar></ChatBodyTopBar> */}
          <div class={["fcol w-full"]}>
            {messages.value.map((msg, index) => (
              <ChatItem
                message={msg}
                index={index}
                chatid={chatid}
                onDelete={() => {
                  messages.value.splice(index, 1);
                  ms.update_chat_record_messages(chatid);
                }}
              ></ChatItem>
            ))}
            {/* <ChatBodyAdd index={messages.value.length}></ChatBodyAdd> */}
            <div id="ChatBodyBottom" class="min-h-[15rem]"></div>
          </div>
          <ChatBodyInput
            class={"fixed bottom-[2rem] self-center"}
            submit_btn_loading={loading_messages.value}
            onSubmit={async () => {
              const { promot } = ms.chat_body_input;
              if (promot.length === 0) return;

              const mode = ms.chat_body_input.mode;
              const messages = ms.curry_chat.messages;

              if (mode === "generate") {
                const generate_mode_messages = [
                  {
                    message_type: "user",
                    role: "user",
                    created: Date.now(),
                    content: promot,
                  },
                  {
                    message_type: "server",
                    role: "assistant",
                    created: Date.now(),
                    request_config: {
                      model: ms.chat_body_input.model,
                      temperature: ms.chat_body_input.temperature,
                      presence_penalty: ms.chat_body_input.presence_penalty,
                      frequency_penalty: ms.chat_body_input.frequency_penalty,
                      max_tokens: ms.chat_body_input.auto_max_tokens
                        ? undefined
                        : ms.chat_body_input.max_tokens,
                    },
                    content: "",
                  },
                ] as const;
                messages.push(...generate_mode_messages);
                ms.chat_body_input.sended();
                await ms.update_chat_record_messages(chatid);
                scroll_to(document.getElementById("app")!);
                await generate_next(messages.length - 1);
              } else if (mode === "add") {
                const mode_messages = [
                  {
                    message_type: "user",
                    role: ms.chat_body_input.role,
                    created: Date.now(),
                    content: promot,
                  },
                ] as const;
                messages.push(...mode_messages);
                ms.chat_body_input.sended();
                await ms.update_chat_record_messages(chatid);
                scroll_to(document.getElementById("app")!);
              }
            }}
          ></ChatBodyInput>
        </div>
      );
    };
  },
});

export default defineComponent({
  setup(props) {
    const main_store = use_main_store();
    return () => (
      <QPage {...c`default-bg flex flex-col`}>
        <ChatBody></ChatBody>
      </QPage>
    );
  },
});
