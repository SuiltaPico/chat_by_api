import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import _, {
  bind,
  cloneDeep,
  cond,
  constant,
  eq,
  get,
  partial,
  stubTrue,
  throttle,
} from "lodash";
import {
  QBtn,
  QIcon,
  QPage,
  QPopupProxy,
  QSpace,
  QToggle,
  QTooltip,
  useQuasar,
} from "quasar";
import { Teleport, computed, defineComponent, ref, toRef, watch } from "vue";
import { useRouter } from "vue-router";
import {
  Maybe,
  any,
  as_props,
  c,
  parse_param_to_Record,
  promise_with_ref,
  refvmodel,
  refvmodel_type,
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
  ServerMessagesError,
  UserMessage,
} from "../interface/ChatRecord";
import use_main_store from "../store/main_store";

import { insert_slot, not_undefined_or, tpl } from "../common/jsx_utils";
import { create_md } from "../common/md_render";

import { calendar } from "../common/date";
import { openai_chat_completion } from "../common/generate";
import { copy_with_notify } from "../common/quasar_utils";
import BetterBtn from "../components/BetterBtn";

const md = create_md();

async function regenerate(index: number) {
  const ms = use_main_store();
  const { chat_body_input, curry_chat } = ms;
  const messages = cloneDeep(curry_chat.messages.slice(0, index + 1));
  const msg = messages[index] as ServerMessage;

  const chat_id = ms.curry_chat.id!;

  const apply_update_chat_record_messages = throttle(async () => {
    const curr_messages = await ms.get_chat_record_messages(chat_id);
    const curr_message = curr_messages[index] as ServerMessage;
    curr_message.content = msg.content;
    curr_message.error = msg.error;
    await ms.update_chat_record_messages(chat_id, curr_messages);
    await ms.sync_curr_chat_record_messages();
  }, 100);

  const settings = ms.settings;
  const stop_next_ref = ref(async () => {});

  if (ms.settings.apikeys.keys.length === 0) {
    msg.error = {
      err_type: "no_api_key",
    };
    await apply_update_chat_record_messages();
    return;
  }

  const first_apikey = settings.apikeys.keys[0];
  let additional_option = {};
  if (first_apikey.source === "Custom") {
    additional_option = {
      api_base_path: first_apikey.base,
      params: parse_param_to_Record(first_apikey.param),
    };
  }

  try {
    await openai_chat_completion({
      api_key: first_apikey.key,
      params: {},
      ...additional_option,
      messages: Messages_to_OpenAI_Messages(messages),
      async on_status_changed(status) {
        ms.curry_chat.status = status;
      },
      async on_update(clip) {
        msg.content += clip;
        await apply_update_chat_record_messages();
      },
      stop_next_ref,
      open_ai_request_config: ms.get_chat_body_input_OpenAIRequestConfig(),
    });
  } catch (e) {
    msg.error = e as ServerMessagesError;
    await apply_update_chat_record_messages();
    return;
  }
}

async function generate_next(index: number) {
  const ms = use_main_store();
  const { chat_body_input, curry_chat } = ms;
  const messages = cloneDeep(curry_chat.messages);
  const msg = messages[index] as ServerMessage;

  const chat_id = ms.curry_chat.id!;
  const apply_update_chat_record_messages = throttle(async () => {
    await ms.update_chat_record_messages(chat_id, messages);
    await ms.sync_curr_chat_record_messages();
  }, 100);

  const settings = ms.settings;
  const stop_next_ref = ref(async () => {});

  if (ms.settings.apikeys.keys.length === 0) {
    msg.error = {
      err_type: "no_api_key",
    };
    await apply_update_chat_record_messages();
    return;
  }

  const first_apikeys = settings.apikeys.keys[0];
  let additional_option = {};
  if (first_apikeys.source === "Custom") {
    additional_option = {
      api_base_path: first_apikeys.base,
      params: parse_param_to_Record(first_apikeys.param),
    };
  }

  try {
    await openai_chat_completion({
      api_key: first_apikeys.key,
      params: {},
      ...additional_option,
      messages: Messages_to_OpenAI_Messages(messages),
      async on_status_changed(status) {
        ms.curry_chat.status = status;
      },
      async on_update(clip) {
        messages[index].content += clip;
        await apply_update_chat_record_messages();
      },
      stop_next_ref,
      open_ai_request_config: ms.get_chat_body_input_OpenAIRequestConfig(),
    });
  } catch (e) {
    msg.error = e as ServerMessagesError;
    await apply_update_chat_record_messages();
    return;
  }
}

export const Avatar = defineComponent({
  props: ["role"],
  emits: ["update:role"],
  setup(props: { role: Role }, ctx) {
    const part_eq = function <T>(a: T) {
      return partial(eq, a);
    };
    const next = cond<Role, Role>([
      [part_eq("user"), constant("assistant")],
      [part_eq("assistant"), constant("system")],
      [part_eq("system"), constant("user")],
      [stubTrue, constant("user")],
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

export const UserMessageItem = defineComponent<
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
    const qs = useQuasar();

    const more_popup_showing = ref(false);

    return () => {
      const { message, chatid } = props;
      return (
        <div class="chat_item">
          <div class="chat_item_main">
            <Avatar
              class="mt-[2px]"
              role={message.role}
              onUpdate:role={async (role) => {
                message.role = role;
                await ms.update_chat_record_messages(chatid);
              }}
            ></Avatar>
            <div class="content">{message.content}</div>
            <QSpace></QSpace>
            <div class="frow flex-nowrap gap self-top h-fit min-w-[5rem] max-w-[5rem] gap-1 grow">
              <QBtn
                {...c`text-xs text-zinc-300 p-2`}
                icon="mdi-import"
                flat
                onClick={async () => {
                  ms.chat_body_input.promot = message.content;
                  ms.chat_body_input.inputter?.focus();
                  await ms.update_chat_record_messages(chatid);
                }}
              ></QBtn>
              <QBtn
                {...c`text-xs text-zinc-300 p-2`}
                icon="mdi-dots-horizontal"
                flat
              >
                <MorePopup
                  {...refvmodel(more_popup_showing, "show")}
                  message={message}
                  onDelete={() => ctx.emit("delete")}
                >
                  <MorePopupBtn
                    icon="mdi-content-copy"
                    label="复制"
                    onClick={() => {
                      copy_with_notify(qs, message.content);
                      more_popup_showing.value = false;
                    }}
                  ></MorePopupBtn>
                </MorePopup>
              </QBtn>
            </div>
            <div class="max-md:min-w-full h-0 max-md:block"></div>
          </div>
        </div>
      );
    };
  },
});

type ServerMessageErrorHandlerProps = { message: ServerMessage };

export const ServerMessageErrorHandler = defineComponent<
  ServerMessageErrorHandlerProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    regenerate: () => void;
  }
>({
  props: as_props<ServerMessageErrorHandlerProps>()(["message"]),
  emits: ["regenerate"],
  setup(props, ctx) {
    const router = useRouter();
    return () => {
      const { message } = props;
      const err = message.error;
      const err_str = JSON.stringify(err);
      if (err === undefined) return;

      const regenerate_btn = (
        <BetterBtn
          onClick={() => {
            console.log("regenerate");
            ctx.emit("regenerate");
          }}
        >
          <div class="frow items-center gap-2">
            <QIcon name="mdi-refresh" />
            <div>尝试重新生成</div>
          </div>
        </BetterBtn>
      );

      if (err.err_type === "api") {
        if (err.code === "model_not_found") {
          return (
            <ErrorContainer
              content={`你的 API-KEY 无法使用当前模型 “${message.request_config.model}”，请尝试切换其它模型。`}
              raw={err_str}
            >
              {regenerate_btn}
            </ErrorContainer>
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
              >
                {regenerate_btn}
              </ErrorContainer>
            );
          }

          return (
            <ErrorContainer
              title="服务器错误"
              content={`服务器发生错误，请查看 “详细信息”。`}
              raw={err_str}
            >
              {regenerate_btn}
            </ErrorContainer>
          );
        } else if (err.type === "requests") {
          const rate_limit_reg =
            /Rate limit reached for (?<model_name>[^\s]+) in organization (?<organization_name>[^\s]+) on requests per min\. Limit: (?<limit>[^\.]+)\. Please try again in (?<retry_wait>[^\.]+)\. Contact us through our help center at help\.openai\.com if you continue to have issues\. Please add a payment method to your account to increase your rate limit\. Visit https:\/\/platform\.openai\.com\/account\/billing to add a payment method\./gm;

          const rate_limit_groups = Maybe.of(err.message)
            .map((s) => rate_limit_reg.exec(s))
            .map((arr) => arr.groups).value;

          if (rate_limit_groups) {
            const group_getter = bind(get, {}, rate_limit_groups, _, _);
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
              >
                {regenerate_btn}
              </ErrorContainer>
            );
          }

          return (
            <ErrorContainer title="服务器拒绝了请求" raw={err_str}>
              {regenerate_btn}
            </ErrorContainer>
          );
        } else if (err.type === "insufficient_quota") {
          return (
            <ErrorContainer
              title="配额不足"
              content="您超过了当前配额，请检查您的 OpenAI 账号的计划和账单详细信息。"
              raw={err_str}
            >
              {regenerate_btn}
            </ErrorContainer>
          );
        } else if (err.type === "invalid_request_error") {
          return (
            <ErrorContainer
              title="API-KEY 无效"
              content="API-KEY 可能输入错误、过期或被账号主人删除。"
              raw={err_str}
            >
              {regenerate_btn}
            </ErrorContainer>
          );
        } else {
          return (
            <ErrorContainer title="错误" raw={err_str}>
              {regenerate_btn}
            </ErrorContainer>
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
              unelevated
              onClick={() => {
                router.push({ name: "settings" });
              }}
            >
              立即前往
            </QBtn>
            <div>{regenerate_btn}</div>
          </ErrorContainer>
        );
      } else if (err.err_type === "connection_error") {
        return (
          <ErrorContainer
            title="连接出错"
            content="请检查你的网络连接。如果网络连接正常，请检查你所处区域的网络是否能流畅访问 chat.openai.com。"
            raw={err.content}
          >
            {regenerate_btn}
          </ErrorContainer>
        );
      } else if (err.err_type === "connection_abort") {
        return (
          <ErrorContainer
            title="连接中断"
            content="与服务器的连接中断了，需要重新生成。"
          >
            {regenerate_btn}
          </ErrorContainer>
        );
      }
      return (
        <ErrorContainer title="请求失败" raw={JSON.stringify(err)}>
          {regenerate_btn}
        </ErrorContainer>
      );
    };
  },
});

export const ServerMessageItem = defineComponent<
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
    const mdblock = ref<HTMLDivElement>();

    const more_popup_showing = ref(false);

    return () => {
      const { message, index, chatid } = props;
      const rendered_content = ms.use_markdown_render
        ? md.render(message.content)
        : md.render_as_fence(message.content);
      // const use_raw_render = toRef(ms.curry_chat.use_raw_render, index, true);

      async function do_regenerate() {
        message.content = "";
        message.error = undefined;
        await ms.update_chat_record_messages(chatid);
        await regenerate(index);
        await ms.sync_curr_chat_record_messages();
      }

      return (
        <div class="chat_item">
          <div class="chat_item_main">
            <Avatar
              role={message.role}
              onUpdate:role={(role) => {
                message.role = role;
                ms.update_chat_record_messages(chatid);
              }}
            ></Avatar>
            <div class="content">
              <div class="mdblock" ref={mdblock}>
                {rendered_content}
              </div>
              <ServerMessageErrorHandler
                message={message}
                onRegenerate={do_regenerate}
              ></ServerMessageErrorHandler>
              {not_undefined_or(() => {
                if (!message.error) return;

                return <div class="mt-2"></div>;
              })}
            </div>
            <QSpace></QSpace>
            <div class="fcol flex-nowrap self-top h-fit min-w-[5rem] max-w-[5rem] gap-4 my-[-0.25rem]">
              <div class="frow items-center gap-1">
                <QBtn
                  {...c`text-xs text-zinc-300 p-2`}
                  icon="mdi-content-copy"
                  flat
                  onClick={() => {
                    copy_with_notify(qs, message.content);
                  }}
                ></QBtn>
                <QBtn
                  {...c`text-xs text-zinc-300 p-2`}
                  icon="mdi-dots-horizontal"
                  flat
                >
                  <MorePopup
                    {...refvmodel(more_popup_showing, "show")}
                    message={message}
                    onDelete={() => ctx.emit("delete")}
                  >
                    <MorePopupBtn
                      class="text-secondary"
                      label="重新生成"
                      icon="mdi-refresh"
                      onClick={() => {
                        more_popup_showing.value = false;
                        do_regenerate();
                      }}
                    ></MorePopupBtn>
                    <MorePopupBtn
                      label="直接复制文本"
                      icon="mdi-raw-off"
                      onClick={() => {
                        more_popup_showing.value = false;

                        const s = getSelection();

                        if (!mdblock.value) {
                          return;
                        }

                        s?.selectAllChildren(mdblock.value);

                        if (s) {
                          copy_with_notify(qs, s.toString());
                          s.empty();
                        }
                      }}
                    ></MorePopupBtn>
                  </MorePopup>
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
            <div class="max-md:min-w-full h-0 max-md:block"></div>
          </div>
        </div>
      );
    };
  },
});

type MorePopupBtnProp = {
  icon: string;
  label: string;
};

export const MorePopupBtn = defineComponent<
  MorePopupBtnProp,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    click: () => void;
  }
>({
  props: as_props<MorePopupBtnProp>()(["icon", "label"]),
  emits: ["click"],
  setup(props, ctx) {
    return () => (
      <QBtn
        flat
        onClick={() => {
          ctx.emit("click");
        }}
      >
        <div class="main">
          <QIcon name={props.icon} size="1.2rem"></QIcon>
          <div>{props.label}</div>
        </div>
        {insert_slot(ctx.slots)}
      </QBtn>
    );
  },
});

type MorePopupProps = {
  show: boolean;
  message: Message;
};
export const MorePopup = defineComponent<
  MorePopupProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    "update:show": (show: boolean) => void;
    delete: () => void;
  }
>({
  props: as_props<MorePopupProps>()(["message", "show"]),
  emits: ["update:show", "delete"],
  setup(props, ctx) {
    const message_type = props.message.message_type;
    return () => {
      const message = props.message;
      const show_delete_popup = ref(false);
      return (
        <QPopupProxy
          {...c`more_popup`}
          modelValue={props.show}
          onUpdate:modelValue={(show) => {
            ctx.emit("update:show", show);
          }}
          breakpoint={0}
        >
          {Maybe.of(ctx.slots.default)
            .map((slot) => slot())
            .unwrap_or(<div></div>)}
          <MorePopupBtn class="text-_negative" label="删除" icon="mdi-delete">
            <QPopupProxy
              {...c`bg-zinc-800 text-zinc-200 border border-zinc-500`}
              {...refvmodel_type(show_delete_popup, "modelValue")}
              breakpoint={0}
            >
              <div class="fcol gap-4 p-4">
                <div>
                  你确定要<b>删除</b>这项对话记录吗？
                </div>
                <div class="frow gap-2 items-center justify-start">
                  <BetterBtn
                    {...c`bg-_negative2`}
                    onClick={() => ctx.emit("delete")}
                  >
                    <QIcon name="mdi-check" size="1.2rem"></QIcon>
                    <div>确认</div>
                  </BetterBtn>
                  <BetterBtn
                    {...c`bg-transparent text-_secondary`}
                    onClick={() => (show_delete_popup.value = false)}
                  >
                    <QIcon name="mdi-close" size="1.2rem"></QIcon>
                    <div>取消</div>
                  </BetterBtn>
                </div>
              </div>
            </QPopupProxy>
          </MorePopupBtn>
          <MorePopupBtn icon="mdi-information-outline" label="信息">
            <QPopupProxy
              {...c`fcol bg-zinc-800 text-zinc-200 p-5 gap-2 border border-zinc-500`}
              breakpoint={0}
            >
              {not_undefined_or(() => {
                if (message_type === "user") {
                  return <div class="text-md font-bold">用户创建的信息</div>;
                }
                if (message_type === "server") {
                  return <div class="text-lg font-bold">服务器创建的信息</div>;
                }
              })}
              <div class="w-full">创建时间：{calendar(message.created)}</div>
              {not_undefined_or(() => {
                if (message.message_type === "server") {
                  return (
                    <div class=" text-zinc-200 w-full">
                      模型：{message.request_config.model}
                    </div>
                  );
                }
              })}
            </QPopupProxy>
          </MorePopupBtn>
        </QPopupProxy>
      );
    };
  },
});

const item_gen_color = (index: number) => ({
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
            "frow w-full justify-center max-md:py-4 pt-4 py-5",
            item_gen_color(index),
          ]}
        >
          {not_undefined_or(() => {
            if (message.message_type === "user") {
              return (
                <UserMessageItem
                  message={message}
                  chatid={chatid}
                  onDelete={() => {
                    ctx.emit("delete");
                  }}
                ></UserMessageItem>
              );
            } else if (message.message_type === "server") {
              return (
                <ServerMessageItem
                  message={message}
                  chatid={chatid}
                  index={index}
                  onDelete={() => {
                    ctx.emit("delete");
                  }}
                ></ServerMessageItem>
              );
            }
          })}
        </div>
      );
    };
  },
});

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
              name: "new_chat",
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
        <div class="fcol relative grow text-zinc-100 h-min flex-nowrap w-full">
          {/* <ChatBodyTopBar></ChatBodyTopBar> */}
          <div class={["fcol w-full page_container"]}>
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
            <div id="ChatBodyBottom" class="min-h-[15rem]"></div>
          </div>
          <ChatBodyInput
            class={"fixed bottom-[2rem] max-[480px]:bottom-[0rem] self-center"}
            submit_btn_loading={loading_messages.value}
            submit_hot_keys={ms.settings.hot_keys.submit_keys}
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

type TopBarMode = "default" | "select";

export const TopBar = defineComponent({
  setup() {
    const ms = use_main_store();
    const use_markdown_render = toRef(ms, "use_markdown_render");
    const operating_mode = ref<TopBarMode>("default");
    return () => {
      return (
        <div class="chat_top_bar">
          {
            <QBtn
              icon="mdi-checkbox-multiple-outline"
              flat
              onClick={() => (operating_mode.value = "select")}
            >
              <QTooltip>多选</QTooltip>
            </QBtn>
            /* <QBtn icon="mdi-chat-plus" flat>
            <QTooltip>插入</QTooltip>
          </QBtn>
          <QBtn {...c`text-_negative`} icon="mdi-delete" flat>
            <QTooltip>删除</QTooltip>
          </QBtn> */
          }
          <QSpace></QSpace>
          <div class="right_btn_gruop">
            <QToggle {...refvmodel(use_markdown_render)}>
              <QIcon name="mdi-language-markdown" size="1.6rem"></QIcon>
            </QToggle>
            <QBtn
              icon="mdi-chevron-triple-down"
              flat
              size="0.75rem"
              onClick={() => scroll_to(document.getElementById("app")!)}
            >
              <QTooltip>滚动到页面最下方</QTooltip>
            </QBtn>
          </div>
        </div>
      );
    };
  },
});

export default defineComponent({
  props: any(["chatid"]),
  setup(props) {
    const ms = use_main_store();
    return () => {
      return tpl(
        <Teleport to="#app_header_slot">
          <TopBar></TopBar>
        </Teleport>,
        <QPage {...c`default-bg flex flex-col`}>
          <ChatBody></ChatBody>
        </QPage>
      );
    };
  },
});
