import { defineComponent } from "vue";
import { as_emits, as_props, c } from "../../common/utils";
import use_main_store from "../../store/memory/main_store";
import { QBtn, QDialog, QIcon, QSpace } from "quasar";
import BetterBtn from "../common/BetterBtn";

type RiskWarningDialogProps = {
  modelValue: boolean;
};

type RiskWarningDialogEmits = {
  "update:modelValue": (
    new_value: RiskWarningDialogProps["modelValue"]
  ) => void;
};

export const RiskWarningDialog = defineComponent<
  RiskWarningDialogProps,
  {},
  {},
  {},
  {},
  {},
  {},
  RiskWarningDialogEmits
>({
  setup(props, ctx) {
    return () => {
      return (
        <QDialog
          modelValue={props.modelValue}
          onUpdate:modelValue={(value) => ctx.emit("update:modelValue", value)}
          autoClose={false}
          persistent
        >
          <div class="fcol bg-zinc-900 text-zinc-200 p-10 gap-4">
            <div class="frow items-center gap-2">
              <QIcon name="mdi-alert" size="1.5rem"></QIcon>
              <div class="text-xl text-zinc-100">
                使用 Gecko 内核浏览器的风险警告
              </div>
            </div>
            <p>
              根据用户的反馈，火狐浏览器（或 Gecko
              内核的浏览器）有小概率会出现数据库无法访问的问题，尤其是在创建、删除数据库时刷新页面的时候。在应用的表现为一直卡在加载页面、发送消息后无响应、无法发送消息等情况。经过调查，可能是火狐的
              <a
                class="text-_primary underline underline-offset-4"
                href="https://bugzilla.mozilla.org/show_bug.cgi?id=751802"
              >
                这个问题
              </a>
              所导致的。
            </p>
            <p>
              因此，为了你的数据稳定，请
              <strong class="text-zinc-100">暂时不要使用这个</strong>
              访问该网站。
            </p>
            <p>
              我们推荐你切换最新版的 Chromium 内核的浏览器，例如谷歌浏览器{" "}
              <QIcon name="mdi-google-chrome" size="1.5rem"></QIcon> 或新版 Edge{" "}
              <QIcon name="mdi-microsoft-edge" size="1.5rem"></QIcon>{" "}
              来访问这个网站。继续使用火狐访问这个网站会使得你的个人数据
              <strong class="text-zinc-100">
                很容易丢失或损坏，甚至无法恢复
              </strong>
              。
            </p>
            <div class="frow gap-3 flex-wrap items-center justify-end">
              <BetterBtn
                class="bg-transparent text-_negative"
                onClick={() => {
                  ctx.emit("update:modelValue", false);
                }}
              >
                <QIcon name="mdi-alert" size="1.2rem"></QIcon>
                <div>接受风险并继续</div>
              </BetterBtn>
              <BetterBtn
                class="bg-_primary"
                onClick={() => {
                  history.back();
                }}
              >
                <QIcon name="mdi-exit-run" size="1.2rem"></QIcon>
                <div>退出并切换浏览器访问</div>
              </BetterBtn>
            </div>
          </div>
        </QDialog>
      );
    };
  },
});
