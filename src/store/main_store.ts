import { defineStore } from "pinia";
import { reactive, ref, watch } from "vue";
import ChatRecord, { ChatRecordMeta, Message } from "../interface/ChatRecord";
import Settings from "../interface/Settings";
import {
  get_chat_records_meta,
  get_settings,
  settings_default_value,
  chat_records_default_value,
  set_settings,
  new_chat_record,
  delete_chat_record,
  get_chat_record_messages,
  update_chat_record_messages,
} from "./db_api";
import { ChatBodyInputMode } from "../components/ChatBodyInput";
import { QInput } from "quasar";

const use_main_store = defineStore("main", () => {
  const is_loading = ref(true);

  const chat_body_input = ref({
    mode: "generate" as ChatBodyInputMode,
    promot: "",
    model: "gpt-3.5-turbo",
    brief_mode: false,
    require_next: false,
    sended: (new_chat?: boolean) => {
      const cbi = chat_body_input.value;
      cbi.promot = "";
      if (new_chat) {
        cbi.require_next = true;
      }
    },
    inputter: undefined as undefined | QInput
  });

  const chat_records_meta = ref<ChatRecordMeta[]>(chat_records_default_value);
  const settings = ref<Settings>(settings_default_value);

  async function _set_settings<T extends keyof Settings>(
    id: T,
    value: Settings[T] = settings.value[id]
  ) {
    await set_settings(id, value);
  }

  async function _new_chat_record(name: string, created: number) {
    const id = await new_chat_record(name, created);
    await sync_db();
    return id;
  }

  async function _get_chat_record_messages(id: string) {
    return await get_chat_record_messages(id);
  }

  async function _update_chat_record_messages(id: string, message?: Message[]) {
    if (message === undefined) {
      message = curry_chat.messages;
    }
    await update_chat_record_messages(id, message);
    // await sync_db();
  }

  async function _delete_chat_record(id: string) {
    await delete_chat_record(id);
    curry_chat.id = undefined;
    await sync_db();
  }

  const curry_chat = reactive({
    id: undefined as undefined | string,
    messages: [] as Message[],
    status: "",
    /** 状态：使用原始渲染。
     * [req: use_raw_render]：当页面变动时清空。 */
    use_raw_render: {} as Record<number, boolean>,
  });

  async function sync_db() {
    console.log("sync");
    console.log("curry_chat.id", curry_chat.id);

    chat_records_meta.value = await get_chat_records_meta(0, 20);
    settings.value = await get_settings();
    if (curry_chat.id) {
      try {
        curry_chat.messages = await get_chat_record_messages(curry_chat.id);
      } catch {
        console.log("sync faild");

        curry_chat.id = undefined;
      }
    }

    is_loading.value = false;
  }

  const init_state = (async () => {
    await sync_db();
  })();

  return {
    chat_records_meta,
    settings,
    new_chat_record: _new_chat_record,
    get_chat_record_messages: _get_chat_record_messages,
    update_chat_record_messages: _update_chat_record_messages,
    delete_chat_record: _delete_chat_record,
    set_settings: _set_settings,
    init_state,
    is_loading,
    curry_chat,
    chat_body_input,
    sync_db,
  };
});

export default use_main_store;
