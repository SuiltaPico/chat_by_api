import { QIcon, QSpace } from "quasar";
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import { c } from "../../common/utils";
import use_main_store from "../../store/memory/main_store";
import { SeparatorLB } from "./SeparatorLB";

export const DocumentlibraryLB = defineComponent({
  setup(props, ctx) {
    const router = useRouter();
    const ms = use_main_store();
    return () => {
      const route = useRoute();
      // const records = ms.ve.meta;
      return (
        <div {...ctx.attrs} class="chat_record_detail">
          <div class="top_btn_group">
            <div
              class={[
                "item",
                "new_chat",
                { active: "document_manager" == route.name },
              ]}
              onClick={() => {
                router.push({ name: "document_manager" });
              }}
            >
              <QIcon name="mdi-cogs" size="1rem"></QIcon>
              <div>文档管理</div>
            </div>
          </div>
          <SeparatorLB />
          <div {...c`container`}>
            {/* {records.map((it, index) => (
              <Item
                class={{ active: it.id == route.params.chatid }}
                key={it.id}
                record={it}
                index={index}
                onClick={() => {
                  router.push(`/chat/${it.id}`);
                }}
              ></Item>
            ))} */}
          </div>
          <QSpace />
        </div>
      );
    };
  },
});
