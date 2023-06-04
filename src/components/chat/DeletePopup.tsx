import { QIcon, QPopupProxy, QSpace } from "quasar";
import { defineComponent } from "vue";
import { c, refvmodel_type } from "../../common/utils";
import BetterBtn from "../BetterBtn";
import { insert_slot } from "../../common/jsx_utils";

type DeletePopupProps = {
  modelValue: boolean;
};

export const DeletePopup = defineComponent<
  DeletePopupProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    "update:modelValue": (show: boolean) => void;
    confirm: () => void;
  }
>({
  setup(props, ctx) {
    return () => {
      return (
        <QPopupProxy
          {...c`bg-zinc-800 text-zinc-200 border border-zinc-500`}
          modelValue={props.modelValue}
          onUpdate:modelValue={(value) => ctx.emit("update:modelValue", value)}
          breakpoint={0}
        >
          <div class="fcol gap-4 p-4">
            <div>{insert_slot(ctx.slots, "default")}</div>
            <div class="frow gap-2 items-center justify-start">
              <QSpace {...c`md:hidden`}></QSpace>
              <BetterBtn
                {...c`bg-_negative2`}
                onClick={() => ctx.emit("confirm")}
              >
                <QIcon name="mdi-check" size="1.2rem"></QIcon>
                <div>确认</div>
              </BetterBtn>
              <BetterBtn
                {...c`bg-transparent text-_secondary`}
                onClick={() => ctx.emit("update:modelValue", false)}
              >
                <QIcon name="mdi-close" size="1.2rem"></QIcon>
                <div>取消</div>
              </BetterBtn>
            </div>
          </div>
        </QPopupProxy>
      );
    };
  },
});
