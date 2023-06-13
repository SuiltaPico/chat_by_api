import _, { bind, cloneDeep, defer, get } from "lodash";
import { QBtn, QIcon, QSpace, useQuasar } from "quasar";
import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { openai_chat_completion } from "../../common/generate";
import { vif } from "../../common/jsx_utils";
import { create_md } from "../../common/md_render";
import { copy_with_notify } from "../../common/quasar_utils";
import {
  Maybe,
  as_props,
  parse_param_to_Record,
  refvmodel_type,
} from "../../common/utils";
import {
  Messages_to_OpenAI_Messages,
  after_modify_Message,
  write_Message_to_ChatRecord,
} from "../../impl/ChatRecord";
import ChatRecord, {
  Message,
  ServerMessage,
  ServerMessagesError,
} from "../../interface/ChatRecord";
import {
  ChatItem_Avatar,
  ChatItem_select_box,
  ChatRecordOperatingMode,
} from "../../pages/chat";
import use_main_store from "../../store/main_store";
import BetterBtn from "../BetterBtn";
import { Editor, EditorCompoAPI } from "../Editor";
import ErrorContainer from "../ErrorContainer";
import { MorePopup, MorePopupBtn } from "./MorePopup";
import { UseEditorRightBtnGroup } from "./UseEditorRightBtnGroup";

const md = create_md();

// TODO:合并 regenerate 和 generate_next
async function regenerate(
  chat_id: string,
  _messages: Message[],
  index: number
) {
  const ms = use_main_store();
  /** 切除且克隆后的信息。 */
  const messages = cloneDeep(_messages.slice(0, index + 1));
  const msg = messages[index] as ServerMessage;

  /** 更新 `_messages[index]` 的消息。 */
  const apply_update_chat_record_messages = async () => {
    await ms.push_to_db_task_queue(async () => {
      await ms.chat_records.modify(chat_id, async (curr_cr) => {
        write_Message_to_ChatRecord(curr_cr, msg, index);
      });
    });
  };

  const settings = ms.settings.settings;
  const stop_next_ref = ref(async () => {});

  if (settings.apikeys.keys.length === 0) {
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
      open_ai_request_config: ms.chat_body_input.generate_OpenAIRequestConfig(),
    });
  } catch (e) {
    msg.error = e as ServerMessagesError;
    await apply_update_chat_record_messages();
    return;
  }
}

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
            <div>
              <QBtn
                color="primary"
                unelevated
                onClick={() => {
                  router.push({ name: "settings" });
                }}
              >
                立即前往
              </QBtn>
            </div>
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

export type ServerMessageItemProps = {
  message: ServerMessage;
  index: number;
  use_editor: boolean;
  chat_record: ChatRecord;
};

export const ServerMessageItem = defineComponent<
  ServerMessageItemProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    delete: () => void;
    "update:use_editor": (value: boolean) => void;
  }
>({
  props: as_props<ServerMessageItemProps>()(["message", "index", "use_editor"]),
  emits: ["delete", "update:use_editor"],
  setup(props, ctx) {
    const ms = use_main_store();
    const qs = useQuasar();
    const mdblock = ref<HTMLDivElement>();
    const content_editor = ref<EditorCompoAPI>();

    const more_popup_showing = ref(false);

    onMounted(() => {
      content_editor.value?.force_set_value(props.message.content);
    });

    return () => {
      const { message, index, use_editor, chat_record } = props;
      const rendered_content = ms.curry_chat.use_markdown_render
        ? md.render(message.content)
        : md.render_as_fence(message.content);
      // const use_raw_render = toRef(ms.curry_chat.use_raw_render, index, true);

      const curry_chat = ms.curry_chat;
      const edit_mode = curry_chat.select_mode;

      async function do_regenerate(crid: string) {
        await ms.push_to_db_task_queue(async () => {
          ms.chat_records.modify(crid, async (curr_cr) => {
            message.content = "";
            message.error = undefined;
            message.request_config =
              ms.chat_body_input.generate_OpenAIRequestConfig();
            after_modify_Message(curr_cr, message);
          });
        });
        await regenerate(
          ms.curry_chat.chat_record!.id,
          ms.curry_chat.chat_record!.messages,
          index
        );
      }

      return (
        <div class="chat_item">
          <div class="chat_item_main">
            {ChatItem_select_box(props.index)}
            {ChatItem_Avatar(message)}
            {vif(
              use_editor,
              <Editor
                class="editor"
                init_language="markdown"
                ref={content_editor}
              ></Editor>
            )}
            {vif(
              !use_editor,
              <div class="content">
                <div class="mdblock" ref={mdblock}>
                  {rendered_content}
                </div>
                <ServerMessageErrorHandler
                  message={message}
                  onRegenerate={() => do_regenerate(curry_chat.chat_record!.id)}
                ></ServerMessageErrorHandler>
              </div>
            )}

            {vif(
              curry_chat.operating_mode === ChatRecordOperatingMode.default,
              <QSpace></QSpace>
            )}

            <div class="right_btn_group">
              {vif(
                curry_chat.operating_mode === ChatRecordOperatingMode.default &&
                  !use_editor,
                <div class="default">
                  <QBtn
                    icon="mdi-content-copy"
                    flat
                    onClick={() => {
                      copy_with_notify(qs, message.content);
                    }}
                  ></QBtn>
                  <QBtn icon="mdi-dots-horizontal" flat>
                    <MorePopup
                      {...refvmodel_type(more_popup_showing, "show")}
                      message={message}
                      onDelete={() => ctx.emit("delete")}
                      onEdit={(close_popup) => {
                        ctx.emit("update:use_editor", true);
                        close_popup();

                        defer(() => {
                          content_editor.value?.force_set_value(
                            message.content
                          );
                        });
                      }}
                    >
                      <MorePopupBtn
                        class="text-secondary"
                        label="重新生成"
                        icon="mdi-refresh"
                        onClick={() => {
                          more_popup_showing.value = false;
                          do_regenerate(curry_chat.chat_record!.id);
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
                </div>
              )}
              {UseEditorRightBtnGroup(
                use_editor,
                content_editor.value,
                message,
                ctx
              )}
            </div>
            <div class="max-md:min-w-full h-0 max-md:block order-2"></div>
          </div>
        </div>
      );
    };
  },
});
