import {
  Component,
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
} from "vue";
import {
  QAvatar,
  QBadge,
  QBtn,
  QIcon,
  QInput,
  QRouteTab,
  QSelect,
  QSeparator,
  QSpace,
  QTab,
  QTabs,
} from "quasar";
import type ChatRecord from "../interface/ChatRecord";
import {
  Nil,
  any,
  arr_or_pack_to_arr,
  c,
  cl,
  refvmodel,
} from "../common/utils";
import { useRoute, useRouter } from "vue-router";
import type { RouteRecordName } from "vue-router";
import use_main_store from "../store/main_store";
import router from "../router/router";
import { includes } from "lodash";

export const ChatBar = defineComponent({
  setup(props, ctx) {
    const { attrs } = ctx;
    const router = useRouter();
    const ms = use_main_store();
    return () => {
      // 受制于响应式系统，必须写在里面
      const route = useRoute();
      const records = ms.chat_records_meta;
      return (
        <div {...attrs} class="chat_record_detail">
          <div class="top_btn_group">
            {/* <div class=" text-zinc-300 rounded">
              <QBtn {...c`search`} icon="mdi-magnify" flat></QBtn>
              <QBtn {...c`checkbox`} icon="mdi-checkbox-marked" flat></QBtn>
              <QBtn {...c`sort`} icon="mdi-sort" flat></QBtn>
              <QBtn {...c`sort`} icon="mdi-history" flat></QBtn>
            </div> */}
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
          <ChatRecordSelectionSeparator />
          <div {...c`container`}>
            {records.map((it, index) => (
              <ChatRecordSelectionItem
                class={{ active: it.id == route.params.chatid }}
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
        <div class="item" onClick={() => ctx.emit("click")}>
          <div class="frow gap-1 items-center">
            <QIcon
              {...c`pt-[0.1rem]`}
              name="mdi-message-outline"
              size="1rem"
            ></QIcon>
          </div>
          <div class="text">{record.name}</div>
          <QSpace />
          <div class="btn_group">
            <QIcon
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

export const NoContent = defineComponent({
  setup() {
    return () => <div>无内容。</div>;
  },
});

export interface RawItem {
  icon: string;
  name: string;
  label: string;
  hide_details?: true;
  route_name: string | string[];
  component?: () => Component;
  to_route?: string | true;
}

export interface Item {
  icon: string;
  name: string;
  label: string;
  hide_details: boolean;
  route_name: string[];
  component: () => Component;
  to_route?: string;
}

function build_RawItem(ri: RawItem): Item {
  const route_name = arr_or_pack_to_arr(ri.route_name);
  return {
    ...ri,
    route_name,
    to_route: ri.to_route === true ? route_name[0] : ri.to_route,
    component: ri.component ?? (() => NoContent),
    hide_details: !!ri.hide_details,
  };
}

export const raw_items = [
  {
    icon: "mdi-forum",
    name: "chat",
    label: "对话",
    route_name: ["chat", "new_chat"],
    component: () => ChatBar,
  },
  // {
  //   icon: "mdi-file-document-edit",
  //   name: "text_continuation",
  //   label: "文本续写",
  //   route_name: "text_continuation",
  // },
  // {
  //   icon: "mdi-message-plus",
  //   name: "template",
  //   label: "模板",
  //   route_name: "template",
  // },
  // {
  //   icon: "mdi-server",
  //   name: "vector_library",
  //   label: "数据库",
  //   route_name: "vector_library",
  // },
  {
    icon: "mdi-cog",
    name: "settings",
    label: "设置",
    route_name: "settings",
    hide_details: true,
    to_route: true,
  },
] satisfies RawItem[];

const items = raw_items.map(build_RawItem);
function route_name_to_item_name(name: RouteRecordName | Nil) {
  for (const it of items) {
    if (includes(it.route_name, name)) {
      return it.name;
    }
  }
}

export const LeftBarDetails = defineComponent<{
  item?: Item;
}>({
  props: any(["item"]),
  setup(props) {
    const ms = use_main_store();
    return () => {
      const item = props.item;
      const gen_compo = computed(() => {
        const r = item?.component ?? (() => NoContent);
        return r;
      });
      const compo = gen_compo.value();

      if (item?.hide_details) {
        ms.change_left_bar_width("just-icon");
      } else {
        ms.change_left_bar_width("grow");
      }
      return (
        <div class={["details_container", item?.hide_details ? "hide" : ""]}>
          {/* <div class="title">
            <div>{props.item?.label}</div>
          </div> */}
          <compo></compo>
        </div>
      );
    };
  },
});

export const LeftBar = defineComponent({
  setup(props, ctx) {
    const { attrs } = ctx;
    const router = useRouter();
    const selected_name = ref("chat");
    // watch(selected_name, ()=>{
    //   console.log(items.find((it) => it.name == selected_name.value)?.name);
    // })
    return () => {
      return (
        <div {...attrs} class="left_bar">
          <QTabs
            {...c`selection_container`}
            {...refvmodel(selected_name)}
            onUpdate:modelValue={(name) => {
              selected_name.value = name;
              const item = items.find((it) => it.name == name);
              if (item?.to_route) {
                router.push({ name: item.to_route });
              }
            }}
            switch-indicator
            vertical
          >
            {items.map((it) => (
              <QTab
                {...c`selection_item`}
                name={it.name}
                icon={it.icon}
                ripple={false}
              ></QTab>
            ))}
          </QTabs>
          <LeftBarDetails
            item={items.find((it) => it.name == selected_name.value)}
          ></LeftBarDetails>
        </div>
      );
    };
  },
});
