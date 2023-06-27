import { QIcon, QSpinner, QSpinnerComment } from "quasar";
import { defineComponent } from "vue";
import { not_undefined_or, tpl } from "../../../common/jsx_utils";
import use_main_store from "../../../store/memory/main_store";

export const ToolbarState = defineComponent({
  setup() {
    const ms = use_main_store();
    return () => {
      return (
        <div class="frow items-center flex-wrap">
          <div>状态：</div>
          <div class="frow w-fit p-1.5 rounded-full items-center gap-2 text-[0.8rem] min-w-max">
            {not_undefined_or(() => {
              if (ms.curry_chat.chat_record === undefined) return;
              const { status } = ms.chat_records.get_app_meta(
                ms.curry_chat.chat_record.id
              );
              if (status === "finished") {
                return tpl(
                  <QIcon name="mdi-check" size="1rem" color="primary"></QIcon>,
                  <div>等待生成</div>
                );
              } else if (status === "init") {
                return tpl(
                  <QSpinner size="1rem" color="primary"></QSpinner>,
                  <div>正在初始化……</div>
                );
              } else if (status === "connecting") {
                return tpl(
                  <QSpinner size="1rem" color="primary"></QSpinner>,
                  <div>正在连接服务器……</div>
                );
              } else if (status === "generating") {
                return tpl(
                  <QSpinnerComment
                    size="1rem"
                    color="primary"
                  ></QSpinnerComment>,
                  <div>正在生成……</div>
                );
              }
            })}
          </div>
        </div>
      );
    };
  },
});
