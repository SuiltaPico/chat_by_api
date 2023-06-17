import { defineComponent, ref } from "vue";
import use_main_store from "../../store/main_store";
import { HotKeys } from "../../common/key_event";
import { QSelect } from "quasar";

export const HotKeysManager = defineComponent({
  setup() {
    const ms = use_main_store();

    function HotKeys_to_submit_keys_selection(hot_keys: HotKeys) {
      const first_hot_key = hot_keys.value[0].keys;
      // const list = [
      //   st(set("Enter"), "Enter"),
      //   st(set("Ctrl", "Enter"), "Ctrl + Enter"),
      //   st(set("Shift", "Enter"), "Shift + Enter"),
      //   st(set("Alt", "Enter"), "Alt + Enter"),
      // ];
      return first_hot_key.join(" + ");
    }

    const submit_keys_loading = ref(false);

    const submit_keys_selected = ref();
    const submit_keys_options = [
      "Enter",
      "Ctrl + Enter",
      "Shift + Enter",
      "Alt + Enter",
    ];

    return () => {
      const settings = ms.settings.settings;

      const hotkeys = settings.hot_keys;
      submit_keys_selected.value = HotKeys_to_submit_keys_selection(
        hotkeys.submit_keys
      );
      return (
        <div class="fcol gap-5">
          <div class="text-xl font-bold">快捷键</div>
          <ul>
            <li class="gap-2 items-center marker:text-zinc-400">
              <div class="frow gap-2 items-center">
                <div>发送消息:</div>
                <QSelect
                  modelValue={submit_keys_selected.value}
                  onUpdate:modelValue={async (new_keys) => {
                    submit_keys_loading.value = true;
                    settings.hot_keys.submit_keys.value[0].keys =
                      new_keys.split(" + ");
                    await ms.push_to_db_task_queue(
                      async () =>
                        await ms.settings.set_setting(
                          "hot_keys",
                          settings.hot_keys
                        )
                    );
                    submit_keys_loading.value = false;
                  }}
                  options={submit_keys_options}
                  loading={submit_keys_loading.value}
                  color="secondary"
                  dark
                  filled
                  dense
                ></QSelect>
              </div>
            </li>
          </ul>
        </div>
      );
    };
  },
});
