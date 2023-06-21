import { QBtn, QIcon, QPopupProxy, QSpace } from "quasar";
import { defineComponent, ref } from "vue";
import { calendar } from "../../common/date";
import {
  insert_slot,
  not_undefined_or,
  tpl,
  vif,
} from "../../common/jsx_utils";
import { Maybe, as_props, c, refvmodel_type } from "../../common/utils";
import { Message } from "../../interface/ChatRecord";
import BetterBtn from "../common/BetterBtn";
import { isNil } from "lodash";
import { DeletePopup } from "./DeletePopup";

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
    edit: (close_popup: () => void) => void;
  }
>({
  props: as_props<MorePopupProps>()(["message", "show"]),
  emits: ["update:show", "delete", "edit"],
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

          <MorePopupBtn
            class="text-info"
            label="编辑"
            icon="mdi-pencil"
            onClick={() => {
              ctx.emit("edit", () => ctx.emit("update:show", false));
            }}
          ></MorePopupBtn>
          <MorePopupBtn class="text-_negative" label="删除" icon="mdi-delete">
            <DeletePopup
              {...refvmodel_type(show_delete_popup, "modelValue")}
              onConfirm={() => ctx.emit("delete")}
            >
              你确定要<b>删除</b>这项对话记录吗？
            </DeletePopup>
          </MorePopupBtn>
          <MorePopupBtn icon="mdi-information-outline" label="信息">
            <QPopupProxy
              {...c`fcol bg-zinc-800 text-zinc-200 p-5 gap-2 border border-zinc-500`}
              breakpoint={0}
            >
              {not_undefined_or(() => {
                if (message_type === "user") {
                  return <div class="font-bold">用户创建的信息</div>;
                }
                if (message_type === "server") {
                  return <div class="font-bold">服务器创建的信息</div>;
                }
              })}
              <div class="w-full">创建时间：{calendar(message.created)}</div>
              {vif(
                message.api__ === "v2",
                tpl(
                  <div class=" text-zinc-200 w-full">
                    最后更改时间：{calendar(message.last_modified!)}
                  </div>
                )
              )}
              {not_undefined_or(() => {
                if (message.message_type === "server") {
                  return tpl(
                    <div class=" text-zinc-200 w-full">
                      模型：{message.request_config.model}
                    </div>,
                    vif(
                      !isNil(message.request_config.temperature),
                      <div class=" text-zinc-200 w-full">
                        温度：{message.request_config.temperature}
                      </div>
                    ),
                    vif(
                      !isNil(message.request_config.frequency_penalty),
                      <div class=" text-zinc-200 w-full">
                        频率惩罚：{message.request_config.frequency_penalty}
                      </div>
                    ),
                    vif(
                      !isNil(message.request_config.frequency_penalty),
                      <div class=" text-zinc-200 w-full">
                        存在惩罚：{message.request_config.presence_penalty}
                      </div>
                    )
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
