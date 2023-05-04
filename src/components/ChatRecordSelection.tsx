import { defineComponent } from "vue";
import { QIcon, QSpace } from "quasar";
import type ChatRecord from "../interface/ChatRecord";
import { any, c } from "../common/utils";
import { useRoute, useRouter } from "vue-router";
import use_main_store from "../store/main_store";
import router from "../router/router";

export const ChatRecordSelection = defineComponent({
  props: ["records"],
  setup(props: { records: ChatRecord[] }, ctx) {
    const { attrs } = ctx;
    const router = useRouter();
    return () => {
      // 受制于响应式系统，必须写在里面
      const route = useRoute();
      return (
        <div {...attrs} {...c`flex flex-col flex-nowrap p-2 gap-2 h-full`}>
          <div
            class={[
              "ChatRecordSelectionItem",
              "ChatRecordSelectionNewChat",
              { Active: "index" == route.name },
            ]}
            onClick={() => {
              router.push({ name: "index" });
            }}
          >
            <QIcon name="mdi-plus" size="1rem"></QIcon>
            <div>新会话</div>
          </div>
          <ChatRecordSelectionSeparator />
          <div {...c`flex flex-col gap-1 flex-nowrap overflow-y-auto`}>
            {props.records.map((it, index) => (
              <ChatRecordSelectionItem
                class={{ Active: it.id == route.params.chatid }}
                key={it.id}
                record={it}
                index={index}
                onClick={() => {
                  router.push(`/chat/${it.id}`);
                }}
              ></ChatRecordSelectionItem>
            ))}
          </div>
          <QSpace />
          <ChatRecordSelectionSeparator />
          <div
            class={[
              "ChatRecordSelectionItem",
              "ChatRecordSelectionSettings",
              { Active: "settings" == route.name },
            ]}
            onClick={() => router.push({ name: "settings" })}
          >
            <QIcon name="mdi-cog" size="1.2rem"></QIcon>
            <div>设置</div>
          </div>
        </div>
      );
    };
  },
});

export const ChatRecordSelectionSeparator = defineComponent({
  setup() {
    return () => <div class="border-t border-zinc-700"></div>;
  },
});

export const ChatRecordSelectionItem = defineComponent({
  props: ["record", "index"],
  emits: ["click"],
  setup(props: { record: ChatRecord; index: number }, ctx) {
    const main_store = use_main_store();
    return () => {
      const { record, index } = props;
      return (
        <div class="ChatRecordSelectionItem" onClick={() => ctx.emit("click")}>
          <QIcon {...c`pt-[0.1rem]`} name="mdi-message-outline" size="1rem" />
          <div>{record.name}</div>
          <QSpace />
          <div class="ButtonGroup">
            <QIcon
              {...c`BtnIcon`}
              name="mdi-trash-can"
              size="1.3rem"
              {...any({
                onClick: async () => {
                  await main_store.delete_chat_record(record.id);
                  try {
                    const id = main_store.chat_records_meta[index].id;
                    router.push({ name: "chat", params: { chatid: id } });
                  } catch {
                    router.push({ name: "index" });
                  }
                },
              })}
            ></QIcon>
          </div>
        </div>
      );
    };
  },
});
