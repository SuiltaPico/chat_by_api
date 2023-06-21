import { Component, computed, defineComponent, ref, toRef } from "vue";
import {
  Nil,
  arr_or_pack_to_arr,
  as_props,
  c,
  cl,
  refvmodel_type,
} from "../../common/utils";
import { ChatLB, ChatLBStared } from "./ChatLB";
import { RouteRecordName, useRoute, useRouter } from "vue-router";
import { includes, keyBy } from "lodash";
import use_main_store from "../../store/main_store";
import { QTab, QTabs } from "quasar";
import { DocumentlibraryLB } from "./DocumentLibraryLB";

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
  hidden?: true;
}

export interface Item {
  icon: string;
  name: string;
  label: string;
  hide_details: boolean;
  route_name: string[];
  component: () => Component;
  to_route?: string;
  hidden: boolean;
}

function build_RawItem(ri: RawItem): Item {
  const route_name = arr_or_pack_to_arr(ri.route_name);
  return {
    ...ri,
    route_name,
    to_route: ri.to_route === true ? route_name[0] : ri.to_route,
    component: ri.component ?? (() => NoContent),
    hide_details: !!ri.hide_details,
    hidden: !!ri.hidden,
  };
}

export const raw_items = [
  {
    icon: "mdi-forum",
    name: "chat",
    label: "对话",
    route_name: ["chat", "new_chat"],
    component: () => ChatLB,
  },
  {
    icon: "",
    name: "chat_marked",
    label: "",
    route_name: [],
    hidden: true,
    component: () => ChatLBStared,
  },
  // {
  //   icon: "mdi-file-document-edit",
  //   name: "text_continuation",
  //   label: "文本续写",
  //   route_name: "text_continuation",
  // },
  // {
  //   icon: "mdi-application-braces-outline",
  //   name: "template",
  //   label: "模板",
  //   route_name: "template",
  // },
  // {
  //   icon: "mdi-text-box-multiple-outline",
  //   name: "vector_library",
  //   label: "文档库",
  //   route_name: "document_manager",
  //   component: () => DocumentlibraryLB,
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
export const items_map = keyBy(items, "name");

export function get_item_name_from_route_name(route_name: string) {
  return items.find((it) => it.route_name.includes(route_name))?.name;
}

function route_name_to_item_name(name: RouteRecordName | Nil) {
  for (const it of items) {
    if (includes(it.route_name, name)) {
      return it.name;
    }
  }
}

export type LeftBarDetailsProps = {
  item?: Item;
};

export const LeftBarDetails = defineComponent<LeftBarDetailsProps>({
  props: as_props<LeftBarDetailsProps>()(["item"]),
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
        ms.left_bar.change_width("just-icon");
      } else {
        ms.left_bar.change_width("grow");
      }
      return (
        <div class={["details_container", item?.hide_details ? "hide" : ""]}>
          <compo></compo>
        </div>
      );
    };
  },
});

export const LeftBar = defineComponent({
  setup(props, ctx) {
    const ms = use_main_store();
    const { attrs } = ctx;
    const router = useRouter();
    const selected_name = toRef(ms.left_bar, "selected_name");
    // watch(selected_name, ()=>{
    //   console.log(items.find((it) => it.name == selected_name.value)?.name);
    // })
    return () => {
      const route = useRoute();
      return (
        <div {...attrs} class="left_bar">
          <QTabs
            {...c`selection_container`}
            {...refvmodel_type(selected_name, "modelValue")}
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
            {items
              .filter((it) => !it.hidden)
              .map((it) => (
                <QTab
                  {...cl([
                    `selection_item`,
                    it.route_name.find((it) => it === route.name)
                      ? "text-_secondary"
                      : "",
                  ])}
                  name={it.name}
                  icon={it.icon}
                  ripple={false}
                ></QTab>
              ))}
          </QTabs>
          <LeftBarDetails
            item={items_map[selected_name.value]}
          ></LeftBarDetails>
        </div>
      );
    };
  },
});
