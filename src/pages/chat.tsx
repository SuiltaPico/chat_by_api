import markdown_it_katex from "@vscode/markdown-it-katex";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import _ from "lodash";
import MarkdownIt from "markdown-it";
import markdown_it_highlightjs from "markdown-it-highlightjs";
// import { Configuration } from "openai";
import { OpenAIApi, Configuration } from "openai-edge";
import { QBtn, QIcon, QPage } from "quasar";
import { computed, defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { app_body_width, app_body_width_loose } from "../common/display";
import { c, promise_with_ref } from "../common/utils";
import { ChatBodyInput } from "../components/ChatBodyInput";
import ErrorContainer from "../components/ErrorContainer";
import { Messages_to_OpenAI_Messages } from "../impl/ChatRecord";
import { Message, ServerMessage } from "../interface/ChatRecord";
import use_main_store from "../store/main_store";

const md = new MarkdownIt({
  html: false,
});
md.use(markdown_it_highlightjs, {});
md.use(markdown_it_katex, {
  displayMode: "html",
  throwOnError: false,
});

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

  const res = await openai.createChatCompletion({
    model: chat_body_input.model,
    messages: Messages_to_OpenAI_Messages(curry_chat.messages, true),
    stream: true,
  });

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
      const message_clip = _.chain(raw_result)
        .split("\n\n")
        .filter((it) => it.length > 0)
        .map((it) => {
          try {
            return JSON.parse(it.slice(6));
          } catch {
            try {
              return JSON.parse(it);
            } catch {
              return it;
            }
          }
        })
        .reduce((acc, it) => {
          if (it === "data: [DONE]") {
            return acc;
          }
          try {
            const delta = it.choices[0].delta;
            if (delta.content) {
              acc += delta.content;
            }
          } catch {
            console.log("error", it);

            if (typeof it === "object") {
              if (it.error != undefined) {
                msg.error = {
                  err_type: "api",
                  ...it.error,
                };
              } else {
                msg.error = {
                  err_type: "others_api",
                  content: it,
                };
              }
            } else if (typeof it === "string") {
              msg.error = {
                err_type: "others_string",
                content: it,
              };
            }
            apply_update_chat_record_messages();
          }
          return acc;
        }, "")
        .value();

      if (
        window.scrollY + window.innerHeight + 5 >
        document.getElementById("app")!.clientHeight
      ) {
        window.location.href = "#ChatBodyBottom";
      }
      message_result.value += message_clip;
    }
  }

  await readStream();

  curry_chat.status = "";
}

export const ChatItem = defineComponent({
  props: ["message", "index"],
  setup(props: { message: Message; index: number }) {
    const router = useRouter();
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
                <div class={["frow gap-4 flex-nowrap", app_body_width_loose]}>
                  <QIcon
                    {...c`text-zinc-100 bg-primary p-[0.4rem] rounded`}
                    name="mdi-account"
                    size="1.2rem"
                  ></QIcon>
                  <div class="pt-[0.15rem] whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              );
            } else if (message.message_type === "server") {
              return (
                <div class={["frow gap-4 flex-nowrap", app_body_width_loose]}>
                  <div
                    {...c`text-zinc-100 bg-primary p-[0.4rem] rounded h-fit`}
                  >
                    <img
                      src="/ChatGPT.svg"
                      alt=""
                      class="min-w-[20px] max-w-[20px]"
                    />
                  </div>
                  <div class="pt-[0.15rem] whitespace-pre-wrap w-full">
                    <div
                      class="mdblock"
                      v-html={md.render(message.content)}
                      // v-html={message.content}
                    ></div>
                    {(() => {
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
                            return (
                              <ErrorContainer
                                raw={JSON.stringify(err)}
                              ></ErrorContainer>
                            );
                          }
                        } else if (err.err_type === "no_api_key") {
                          return (
                            <ErrorContainer
                              title="无 API-KEY"
                              content="请前往 “设置 -> API-KEY 管理” 添加你的 API-KEY。"
                            >
                              <QBtn
                                color="primary"
                                onClick={() => {
                                  router.push({ name: "settings" });
                                }}
                              >
                                立即前往
                              </QBtn>
                            </ErrorContainer>
                          );
                        }
                        return (
                          <ErrorContainer
                            raw={JSON.stringify(err)}
                          ></ErrorContainer>
                        );
                      }
                    })()}
                  </div>
                </div>
              );
            }
            return <div></div>;
          })()}
        </div>
      );
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
          <div class={["fcol w-full items-center"]}>
            {messages.value.map((msg, index) => (
              <ChatItem message={msg} index={index}></ChatItem>
            ))}
            <div id="ChatBodyBottom" class="h-[12rem]"></div>
          </div>
          <ChatBodyInput
            class={"fixed bottom-[2rem] self-center" + app_body_width}
            submit_btn_loading={loading_messages.value}
            onSubmit={async () => {
              const { promot } = main_store.chat_body_input;
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
