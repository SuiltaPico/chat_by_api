import markdown_it_katex from "@vscode/markdown-it-katex";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import _ from "lodash";
import MarkdownIt from "markdown-it";
import markdown_it_highlightjs from "markdown-it-highlightjs";
import { Configuration, OpenAIApi } from "openai-edge";
import { QBtn, QIcon, QPage, useQuasar } from "quasar";
import { computed, defineComponent, ref, toRef, watch } from "vue";
import { useRouter } from "vue-router";
import { c, promise_with_ref } from "../common/utils";
import { ChatBodyInput } from "../components/ChatBodyInput";
import ErrorContainer from "../components/ErrorContainer";
import { Messages_to_OpenAI_Messages } from "../impl/ChatRecord";
import { Message, ServerMessage, UserMessage } from "../interface/ChatRecord";
import use_main_store from "../store/main_store";
import copy from "copy-text-to-clipboard";

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
  const main_store = use_main_store();
  const { chat_body_input, curry_chat } = main_store;

  const msg = main_store.curry_chat.messages[index] as ServerMessage;
  const apply_update_chat_record_messages = _.throttle(async () => {
    await main_store.update_chat_record_messages(main_store.curry_chat.id!);
  }, 100);

  if (main_store.settings.apikeys.keys.length === 0) {
    msg.error = {
      err_type: "no_api_key",
    };

    await apply_update_chat_record_messages();
    return;
  }

  const cfg = new Configuration({
    apiKey: main_store.settings.apikeys.keys[0].key,
  });
  const openai = new OpenAIApi(cfg);

  curry_chat.status = "connecting";

  let res = {
    body: null as ReadableStream<Uint8Array> | null,
  };

  try {
    res = await openai.createChatCompletion({
      model: chat_body_input.model,
      messages: Messages_to_OpenAI_Messages(curry_chat.messages, true),
      stream: true,
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
    main_store.curry_chat.messages[index].content = message_result.value;
    await apply_update_chat_record_messages();
  });

  async function readStream() {
    while (true) {
      const { done, value } = await reader.read();
      console.log(done, value);
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

      if (
        window.scrollY + window.innerHeight + 5 >
        document.getElementById("app")!.clientHeight
      ) {
        window.location.href = "#ChatBodyBottom";
      }
      message_result.value += msg_clip;
    }
  }

  await readStream();

  curry_chat.status = "";
}

export const Avatar = defineComponent({
  props: ["role"],
  setup(props: { role: string }, ctx) {
    return () => {
      const { role } = props;
      const { attrs } = ctx;
      if (role === "user") {
        return (
          <QIcon
            {...c`text-zinc-100 bg-primary p-[0.4rem] rounded`}
            {...attrs}
            name="mdi-account"
            size="1.2rem"
          ></QIcon>
        );
      } else if (role === "assistant") {
        return (
          <div
            {...c`text-zinc-100 bg-primary p-[0.4rem] rounded h-fit`}
            {...attrs}
          >
            <img
              src="/ChatGPT.svg"
              alt=""
              class="min-w-[20px] min-h-[20px] max-w-[20px]"
            />
          </div>
        );
      } else if (role === "system") {
        return (
          <QIcon
            {...c`text-zinc-100 bg-primary p-[0.4rem] rounded`}
            {...attrs}
            name="mdi-laptop"
            size="1.2rem"
          ></QIcon>
        );
      } else {
        return (
          <QIcon
            {...c`text-zinc-100 bg-primary p-[0.4rem] rounded`}
            {...attrs}
            name="mdi-help-box-outline"
            size="1.2rem"
          ></QIcon>
        );
      }
    };
  },
});

export const ChatItemUserMessage = defineComponent({
  props: ["message"],
  setup(props: { message: UserMessage }) {
    const ms = use_main_store();
    return () => {
      const { message } = props;
      return (
        <div class={["frow gap-4 flex-nowrap xl:w-[70%] xl:max-w-[900px]"]}>
          <Avatar class="mt-[2px]" role={message.role}></Avatar>
          <div class="whitespace-pre-wrap self-center grow">
            {message.content}
          </div>
          <div class="frow gap self-top h-fit min-w-[7rem] max-w-[7rem] gap-1">
            <QBtn
              {...c`text-xs text-zinc-300 p-2`}
              icon="mdi-import"
              flat
              onClick={() => {
                ms.chat_body_input.promot = message.content;
              }}
            ></QBtn>
            <QBtn
              {...c`text-xs text-zinc-300 p-2`}
              icon="mdi-dots-horizontal"
              flat
            ></QBtn>
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
      console.log(err);
      if (err !== undefined) {
        if (err.err_type === "api") {
          if (err.code === "model_not_found") {
            return (
              <ErrorContainer
                content={`你的 API-KEY 无法使用当前模型 “${message.request_config.model}”，请尝试切换其它模型。`}
                raw={JSON.stringify(err)}
              ></ErrorContainer>
            );
          } else {
            return <ErrorContainer raw={JSON.stringify(err)}></ErrorContainer>;
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
        }
        return <ErrorContainer raw={JSON.stringify(err)}></ErrorContainer>;
      }
    };
  },
});

export const ChatItemServerMessage = defineComponent({
  props: ["message", "index"],
  setup(props: { message: ServerMessage; index: number }) {
    const ms = use_main_store();
    const qs = useQuasar();

    return () => {
      const { message, index } = props;
      const use_raw_render = toRef(ms.curry_chat.use_raw_render, index, true);
      return (
        <div class={["frow gap-4 flex-nowrap xl:w-[70%] xl:max-w-[900px]"]}>
          <Avatar role={message.role}></Avatar>
          <div class="pt-[0.15rem] whitespace-pre-wrap grow shrink">
            <div
              class="mdblock"
              v-html={md.render(message.content)}
              // v-html={message.content}
            ></div>
            <ChatItemServerMessageErrorHandler
              message={message}
            ></ChatItemServerMessageErrorHandler>
          </div>
          <div class="fcol self-top h-fit min-w-[7rem] max-w-[7rem] gap-4 my-[-0.25rem]">
            <div class="frow items-center gap-1">
              <QBtn
                {...c`text-xs text-zinc-300 p-2`}
                icon="mdi-content-copy"
                flat
                onClick={() => {
                  console.log(qs);

                  const result = copy(message.content);
                  const notify = (msg: string) =>
                    qs.notify({
                      position: "top-right",
                      message: msg,
                      "color": "primary",
                      timeout: 200,
                      progress: true,
                      "type": "info"
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
              ></QBtn>
              {/* <QToggle
                {...c`h-fit p-0 text-sm`}
                {...refvmodel(use_raw_render)}
                label="MD"
                color="secondary"
                size="xs"
              ></QToggle> */}
            </div>
            {/* <div class="frow"></div> */}
          </div>
        </div>
      );
    };
  },
});

export const ChatItem = defineComponent({
  props: ["message", "index"],
  setup(props: { message: Message; index: number }) {
    return () => {
      const { message, index } = props;
      return (
        <div
          class={[
            "fcol w-full items-center py-5",
            {
              "bg-zinc-600": index % 2 == 0,
              "bg-[rgb(105,105,114)]": index % 2 == 1,
            },
          ]}
        >
          {(() => {
            if (message.message_type === "user") {
              return (
                <ChatItemUserMessage message={message}></ChatItemUserMessage>
              );
            } else if (message.message_type === "server") {
              return (
                <ChatItemServerMessage
                  message={message}
                ></ChatItemServerMessage>
              );
            }
            return <div></div>;
          })()}
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

export const ChatBody = defineComponent({
  setup() {
    const main_store = use_main_store();
    const router = useRouter();
    const route = computed(() => router.currentRoute.value);
    const chat_id = computed(() => route.value.params.chatid as string);
    const loading_messages = ref(false);
    const messages = computed(() => main_store.curry_chat.messages);
    watch(
      chat_id,
      () => {
        promise_with_ref(async () => {
          main_store.curry_chat.id = chat_id.value;
          await main_store.sync_db();
          // 处理对话不存在的情况
          if (
            chat_id.value !== undefined &&
            main_store.curry_chat.id === undefined
          ) {
            router.push({
              name: "index",
            });
          }
          if (main_store.chat_body_input.require_next === true) {
            await generate_next(messages.value.length - 1),
              (main_store.chat_body_input.require_next = false);
          }
        }, loading_messages);
      },
      {
        immediate: true,
      }
    );
    return () => {
      return (
        <div class="fcol relative grow items-center text-zinc-100">
          <ChatBodyTopBar></ChatBodyTopBar>
          <div class={["fcol w-full items-center"]}>
            {messages.value.map((msg, index) => (
              <ChatItem message={msg} index={index}></ChatItem>
            ))}
            <div id="ChatBodyBottom" class="min-h-[4rem]"></div>
          </div>
          <ChatBodyInput
            class={"fixed bottom-[2rem] self-center"}
            submit_btn_loading={loading_messages.value}
            onSubmit={async () => {
              const { promot } = main_store.chat_body_input;
              if (promot.length === 0) return;

              const chatid = main_store.curry_chat.id!;
              const messages = main_store.curry_chat.messages;
              messages.push({
                message_type: "user",
                role: "user",
                created: Date.now(),
                content: promot,
              });
              messages.push({
                message_type: "server",
                role: "assistant",
                created: Date.now(),
                request_config: {
                  model: main_store.chat_body_input.model,
                },
                content: "",
              });
              main_store.chat_body_input.promot = "";
              await main_store.update_chat_record_messages(chatid);
              window.location.href = "#ChatBodyBottom";
              await generate_next(messages.length - 1);
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
      <QPage {...c`default-bg flex flex-col h-full`}>
        <ChatBody></ChatBody>
      </QPage>
    );
  },
});
