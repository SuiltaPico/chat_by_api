import _, { bind, get } from "lodash";
import { QBtn, QIcon } from "quasar";
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import {
  Maybe,
  as_props
} from "../../../common/utils";
import {
  ServerMessage
} from "../../../interface/ChatRecord";
import BetterBtn from "../../common/BetterBtn";
import ErrorContainer from "../../common/ErrorContainer";

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
        <div>
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
        </div>
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