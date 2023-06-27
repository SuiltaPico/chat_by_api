import { isNil } from "lodash";
import { QIcon } from "quasar";
import { computed, defineComponent, ref, toRef, watch } from "vue";
import { not_undefined_or } from "../../common/jsx_utils";
import { as_props, c, refvmodel_type } from "../../common/utils";
import { get_Message_uuid } from "../../implement/ChatRecord";
import ChatRecord, { Message } from "../../interface/ChatRecord";
import { ChatRecordOperatingMode } from "../../pages/chat";
import use_main_store from "../../store/memory/main_store";
import BetterBtn from "../common/BetterBtn";
import { ServerMessageItem } from "./MessageItem/ServerMessageItem";
import { UserMessageItem } from "./MessageItem/UserMessageItem";

export type ChatItemProps = {
  message: Message;
  index: number;
  chat_record: ChatRecord;
};

function item_gen_color(index: number) {
  return {
    "bg-zinc-600": index % 2 == 0,
    "bg-[rgb(105,105,114)]": index % 2 == 1,
  };
}

export const ChatItem = defineComponent<
  ChatItemProps,
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
  props: as_props<ChatItemProps>()(["message", "index", "chat_record"]),
  emits: ["delete"],
  setup(props, ctx) {
    const ms = use_main_store();
    const chat_item_container = ref<HTMLDivElement>();
    const msg_item = ref<{ $el: HTMLDivElement }>();
    const need_thumbnail = computed(() => {
      if (isNil(msg_item.value)) return false;

      const el: HTMLDivElement = msg_item.value.$el;

      if (el.clientHeight > 200) {
        return true;
      }
      return false;
    });
    const no_thumbnail = ref(false);
    const operating_mode = toRef(ms.curry_chat, "operating_mode");
    const edit_mode_selected = toRef(ms.curry_chat.select_mode, "selected");

    const use_editor = ref(false);

    watch(operating_mode, () => {
      no_thumbnail.value = false;
    });

    return () => {
      const { message, index } = props;
      return (
        <div
          class={[
            "chat_item_container",
            item_gen_color(index),
            need_thumbnail.value &&
            operating_mode.value === ChatRecordOperatingMode.select
              ? !no_thumbnail.value
                ? "thumbnail"
                : "no_thumbnail"
              : "",
          ]}
          onClick={(e) => {
            if (e.target !== chat_item_container.value) {
              return;
            }

            if (operating_mode.value === ChatRecordOperatingMode.select) {
              edit_mode_selected.value[index] =
                !edit_mode_selected.value[index];
            }
          }}
          ref={chat_item_container}
          key={get_Message_uuid(ms.curry_chat.chat_record!, message, index)}
        >
          {not_undefined_or(() => {
            if (message.message_type === "user") {
              return (
                <UserMessageItem
                  message={message}
                  index={index}
                  {...refvmodel_type(use_editor, "use_editor")}
                  chat_record={props.chat_record}
                  onDelete={() => {
                    ctx.emit("delete");
                  }}
                  ref={msg_item}
                ></UserMessageItem>
              );
            } else if (message.message_type === "server") {
              return (
                <ServerMessageItem
                  message={message}
                  index={index}
                  {...refvmodel_type(use_editor, "use_editor")}
                  chat_record={props.chat_record}
                  onDelete={() => {
                    ctx.emit("delete");
                  }}
                  ref={msg_item}
                ></ServerMessageItem>
              );
            }
          })}
          <BetterBtn
            {...c`thumbnail_bottom`}
            flat
            ripple={false}
            onClick={() => {
              no_thumbnail.value = !no_thumbnail.value;
            }}
          >
            <QIcon
              {...c`wrap`}
              name="mdi-unfold-more-horizontal"
              size="1.2rem"
            ></QIcon>
            <div class="wrap">展开</div>
            <QIcon
              {...c`unwrap`}
              name="mdi-unfold-less-horizontal"
              size="1.2rem"
            ></QIcon>
            <div class="unwrap">收起</div>
          </BetterBtn>
        </div>
      );
    };
  },
});
