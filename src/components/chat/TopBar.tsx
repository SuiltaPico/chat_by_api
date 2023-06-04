import { computed, defineComponent, ref, toRef } from "vue";
import { UserMessage } from "../../interface/ChatRecord";
import {
  as_props,
  c,
  cl,
  refvmodel,
  refvmodel_type,
  scroll_to,
} from "../../common/utils";
import use_main_store from "../../store/main_store";
import {
  QBtn,
  QCheckbox,
  QIcon,
  QPopupProxy,
  QSpace,
  QToggle,
  QTooltip,
  useQuasar,
} from "quasar";
import {
  ChatItem_Avatar,
  ChatItem_select_box,
  ChatRecordOperatingMode,
} from "../../pages/chat";
import { copy_with_notify } from "../../common/quasar_utils";
import { MorePopup, MorePopupBtn } from "./MorePopup";
import { not_undefined_or, tpl } from "../../common/jsx_utils";
import BetterBtn from "../BetterBtn";
import { fill, pullAt } from "lodash";

export const TopBar = defineComponent({
  setup(props, ctx) {
    const ms = use_main_store();
    const use_markdown_render = toRef(ms, "use_markdown_render");
    const operating_mode = toRef(ms.curry_chat, "operating_mode");
    const change_operating_mode = ms.curry_chat.change_operating_mode;
    const show_delete_popup = ref(false);
    return () => {
      const om = operating_mode.value;
      const is_full_selected = computed(() => {
        const selected = ms.curry_chat.edit_mode.selected;
        const keys = Object.keys(selected);
        if (keys.length === 0) {
          return false;
        }
        if (keys.length === ms.curry_chat.chat_record?.messages.length) {
          return true;
        }
      });
      return (
        <div class="chat_top_bar">
          <div class="left_btn_group">
            {not_undefined_or(() => {
              if (om === ChatRecordOperatingMode.default) {
                return tpl(
                  <QBtn
                    key="top_bar_enter_select_mode"
                    icon="mdi-select-multiple"
                    flat
                    onClick={() =>
                      change_operating_mode(ChatRecordOperatingMode.select)
                    }
                  >
                    <QTooltip>选择模式</QTooltip>
                  </QBtn>
                );
              }
              if (om === ChatRecordOperatingMode.select) {
                return tpl(
                  <QCheckbox
                    {...c`px-1 pr-2`}
                    color="info"
                    modelValue={is_full_selected.value}
                    onUpdate:modelValue={() => {
                      if (ms.curry_chat.chat_record === undefined) return;

                      if (is_full_selected.value === true) {
                        ms.curry_chat.edit_mode.selected = [];
                      } else {
                        const selected = ms.curry_chat.edit_mode.selected;
                        const len = ms.curry_chat.chat_record?.messages.length;
                        for (let index = 0; index < len; index++) {
                          selected[index] = true;
                        }
                      }
                    }}
                  >
                    全选
                  </QCheckbox>,
                  <QBtn icon="mdi-delete" flat>
                    <QTooltip>删除</QTooltip>
                    <QPopupProxy
                      {...c`bg-zinc-800 text-zinc-200 border border-zinc-500`}
                      {...refvmodel_type(show_delete_popup, "modelValue")}
                      breakpoint={0}
                    >
                      <div class="fcol gap-4 p-4">
                        <div>
                          你确定要<b>删除</b>这些对话记录吗？
                        </div>
                        <div class="frow gap-2 items-center justify-start">
                          <QSpace {...c`md:hidden`}></QSpace>
                          <BetterBtn
                            {...c`bg-_negative2`}
                            onClick={async () => {
                              if (ms.curry_chat.chat_record === undefined) {
                                return;
                              }
                              const selected = ms.curry_chat.edit_mode.selected;
                              const selected_indexes: number[] = [];
                              for (const [index, value] of Object.entries(
                                selected
                              )) {
                                if (!value) return;
                                selected_indexes.push(parseInt(index));
                              }
                              pullAt(
                                ms.curry_chat.chat_record.messages,
                                selected_indexes
                              );
                              ms.curry_chat.clear_edit_mode_cache();
                              await ms.update_chat_record();
                              show_delete_popup.value = false;
                              change_operating_mode(
                                ChatRecordOperatingMode.default
                              );
                            }}
                          >
                            <QIcon name="mdi-check" size="1.2rem"></QIcon>
                            <div>确认</div>
                          </BetterBtn>
                          <BetterBtn
                            {...c`bg-transparent text-_secondary`}
                            onClick={() => (show_delete_popup.value = false)}
                          >
                            <QIcon name="mdi-close" size="1.2rem"></QIcon>
                            <div>取消</div>
                          </BetterBtn>
                        </div>
                      </div>
                    </QPopupProxy>
                  </QBtn>,
                  <QBtn
                    {...c`text-_negative`}
                    icon="mdi-close"
                    flat
                    onClick={() =>
                      change_operating_mode(ChatRecordOperatingMode.default)
                    }
                  >
                    <QTooltip>关闭选择模式</QTooltip>
                  </QBtn>,
                  <QSpace></QSpace>
                );
              }
            })}
          </div>

          <QSpace></QSpace>
          <div class="right_btn_gruop">
            {not_undefined_or(() => {
              if (om === ChatRecordOperatingMode.default) {
                return tpl(
                  <QToggle
                    {...refvmodel_type(use_markdown_render, "modelValue")}
                  >
                    <QIcon name="mdi-language-markdown" size="1.6rem"></QIcon>
                  </QToggle>,
                  <QBtn
                    icon="mdi-chevron-triple-down"
                    flat
                    size="0.75rem"
                    onClick={() => scroll_to(document.getElementById("app")!)}
                  >
                    <QTooltip>滚动到页面最下方</QTooltip>
                  </QBtn>
                );
              }
            })}
          </div>
        </div>
      );
    };
  },
});
