import { pullAt } from "lodash";
import {
  QBtn,
  QCheckbox,
  QIcon,
  QPopupProxy,
  QSpace,
  QToggle,
  QTooltip,
} from "quasar";
import { computed, defineComponent, ref, toRef } from "vue";
import { not_undefined_or, tpl, vif_fn } from "../../common/jsx_utils";
import { c, refvmodel_type, scroll_to } from "../../common/utils";
import { ChatRecordOperatingMode } from "../../pages/chat";
import use_main_store from "../../store/memory/main_store";
import BetterBtn from "../common/BetterBtn";

export const TopBar = defineComponent({
  setup(props, ctx) {
    const ms = use_main_store();
    const use_markdown_render = toRef(ms.curry_chat, "use_markdown_render");
    const operating_mode = toRef(ms.curry_chat, "operating_mode");
    const change_operating_mode = ms.curry_chat.change_operating_mode;
    const show_delete_popup = ref(false);
    const is_full_selected = computed(() => {
      const curry_chat = ms.curry_chat;
      const selected = curry_chat.select_mode.selected;
      const keys = Object.keys(selected);
      if (keys.length === 0) {
        return false;
      }
      if (keys.length === curry_chat.chat_record?.messages.length) {
        return true;
      }
    });

    function handle_open_select_mode() {
      change_operating_mode(ChatRecordOperatingMode.select);
    }

    function handle_close_select_mode() {
      change_operating_mode(ChatRecordOperatingMode.default);
    }

    function handle_switch_all_selector() {
      const curry_chat = ms.curry_chat;
      if (curry_chat.chat_record === undefined) return;

      if (is_full_selected.value === true) {
        curry_chat.select_mode.selected = [];
      } else {
        const selected = curry_chat.select_mode.selected;
        const len = curry_chat.chat_record.messages.length;
        for (let index = 0; index < len; index++) {
          selected[index] = true;
        }
      }
    }

    async function handle_delete_selected_chat_records() {
      const curry_chat = ms.curry_chat;

      if (curry_chat.chat_record === undefined) return;
      const crid = curry_chat.chat_record.id;
      await ms.push_to_db_task_queue(async () => {
        const selected = curry_chat.select_mode.selected;
        await ms.chat_records.modify(crid, async (curr_cr) => {
          const selected_indexes: number[] = [];
          for (const [index, value] of Object.entries(selected)) {
            if (!value) return;
            selected_indexes.push(parseInt(index));
          }
          pullAt(curr_cr.messages, selected_indexes);
        });
        curry_chat.clear_select_mode_cache();
      });

      show_delete_popup.value = false;
      change_operating_mode(ChatRecordOperatingMode.default);
    }

    return () => {
      const om = operating_mode.value;
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
                    onClick={handle_open_select_mode}
                  >
                    <QTooltip>选择模式</QTooltip>
                  </QBtn>
                );
              }
              if (om === ChatRecordOperatingMode.select) {
                return tpl(
                  <QBtn
                    icon="mdi-arrow-left"
                    flat
                    onClick={handle_close_select_mode}
                  >
                    <QTooltip>关闭选择模式</QTooltip>
                  </QBtn>,
                  <QCheckbox
                    {...c`px-1 pr-2`}
                    color="info"
                    modelValue={is_full_selected.value}
                    dark
                    onUpdate:modelValue={handle_switch_all_selector}
                  >
                    全选
                  </QCheckbox>,
                  <QSpace></QSpace>,
                  <QBtn {...c`text-_negative ml-1`} icon="mdi-delete" flat>
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
                            onClick={handle_delete_selected_chat_records}
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
                  </QBtn>
                );
              }
            })}
          </div>
          <QSpace></QSpace>
          <div class="right_btn_gruop">
            {vif_fn(om === ChatRecordOperatingMode.default, () =>
              tpl(
                <QToggle {...refvmodel_type(use_markdown_render, "modelValue")}>
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
              )
            )}
          </div>
        </div>
      );
    };
  },
});
