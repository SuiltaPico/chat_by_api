import { QBtn, QCheckbox, QIcon, QSpace, QSpinnerComment } from "quasar";
import { defineComponent, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { vif } from "../../common/jsx_utils";
import { c, refvmodel_type } from "../../common/utils";
import ChatRecord from "../../interface/ChatRecord";
import router from "../../router/router";
import use_main_store from "../../store/main_store";
import { DeletePopup } from "../chat/DeletePopup";
import { SeparatorLB } from "./SeparatorLB";

export const Item = defineComponent({
  props: ["record", "index"],
  emits: ["click"],
  setup(props: { record: ChatRecord; index: number }, ctx) {
    const ms = use_main_store();
    const delete_popup_show = ref(false);
    return () => {
      const { record, index } = props;
      return (
        <div class="item" onClick={() => ctx.emit("click")}>
          <div class="frow gap-1 items-center">
            {vif(
              record.status === undefined,
              <QIcon
                {...c`pt-[0.1rem]`}
                name="mdi-message-outline"
                size="1rem"
              ></QIcon>
            )}
            {vif(
              record.status === "generating",
              <QSpinnerComment
                {...c`pt-[0.1rem]`}
                name="mdi-message-outline"
                size="1rem"
              ></QSpinnerComment>
            )}
          </div>
          <div class="text">{record.name}</div>
          <QSpace />
          <div class="btn_group">
            <QCheckbox
              {...c`mark`}
              color="white"
              modelValue={record.marked === true ? true : false}
              onUpdate:modelValue={async (it: boolean) => {
                await ms.push_to_db_task_queue(async () => {
                  await ms.chat_records.modify(record.id, async (curr_cr) => {
                    console.log(it);
                    curr_cr.marked = it;
                  });
                });
              }}
              checked-icon="mdi-star"
              unchecked-icon="mdi-star-outline"
              indeterminate-icon="mdi-star-outline"
              size="2.7rem"
              dense
            ></QCheckbox>
            <QIcon name="mdi-trash-can" size="1.3rem">
              <DeletePopup
                {...refvmodel_type(delete_popup_show, "modelValue")}
                onConfirm={async () => {
                  await ms.chat_records.delete(record.id);
                  router.push({ name: "new_chat" });
                }}
              >
                是否确定删除此对话记录？
              </DeletePopup>
            </QIcon>
          </div>
        </div>
      );
    };
  },
});

export const ChatLBStared = defineComponent({
  setup(props, ctx) {
    const ms = use_main_store();
    const records = ms.chat_records.metas;
    return () => {
      const route = useRoute();
      return (
        <div {...ctx.attrs} class="chat_record_detail">
          <div class="frow gap-2 items-center py-1">
            <QBtn
              {...c`min-h-[2.5rem]`}
              icon="mdi-arrow-left"
              unelevated
              onClick={() => {
                ms.left_bar.selected_name = "chat";
              }}
            ></QBtn>
            <QIcon name="mdi-star-check" size="1.2rem"></QIcon>
            <div>已收藏的对话记录</div>
          </div>
          <SeparatorLB />
          <div {...c`container`}>
            {records
              .filter((it) => it.marked === true)
              .map((it, index) => (
                <Item
                  class={{ active: it.id == route.params.chatid }}
                  key={it.id}
                  record={it}
                  index={index}
                  onClick={() => {
                    router.push(`/chat/${it.id}`);
                  }}
                ></Item>
              ))}
          </div>
        </div>
      );
    };
  },
});

export const ChatLB = defineComponent({
  setup(props, ctx) {
    const { attrs } = ctx;
    const router = useRouter();
    const ms = use_main_store();
    return () => {
      // 受制于响应式系统，必须写在里面
      const route = useRoute();
      const records = ms.chat_records.metas;
      return (
        <div {...attrs} class="chat_record_detail">
          <div class="top_btn_group">
            <div class=" text-zinc-300 rounded">
              {/* <QBtn {...c`search`} icon="mdi-magnify" flat></QBtn> */}
              <QBtn
                {...c`search`}
                icon="mdi-star-box-multiple-outline"
                flat
                onClick={() => {
                  ms.left_bar.selected_name = "chat_marked";
                }}
              ></QBtn>
            </div>
            <div
              class={["item", "new_chat", { active: "new_chat" == route.name }]}
              onClick={() => {
                router.push({ name: "new_chat" });
              }}
            >
              <QIcon name="mdi-plus" size="1rem"></QIcon>
              <div>新会话</div>
            </div>
          </div>
          <SeparatorLB />
          <div {...c`container`}>
            {records.map((it, index) => (
              <Item
                class={{ active: it.id == route.params.chatid }}
                key={it.id}
                record={it}
                index={index}
                onClick={() => {
                  router.push(`/chat/${it.id}`);
                }}
              ></Item>
            ))}
          </div>
          <QSpace />
        </div>
      );
    };
  },
});
