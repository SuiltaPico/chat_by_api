import { defineStore } from "pinia";
import { Component, reactive, ref, watch } from "vue";
import ChatRecord, {
  ChatRecordMeta,
  Message,
  Role,
  RoleWithoutUnknown,
} from "../interface/ChatRecord";
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
  compact_dbs,
} from "./db_api";
import { ChatBodyInputMode } from "../components/ChatBodyInput";
import { QInput } from "quasar";
import { ChatRecordOperatingMode } from "../pages/chat";

type LeftBarSize = "just-icon" | "grow" | "hidden";

const use_main_store = defineStore("main", () => {
  const left_bar_width = ref(340);
  function change_left_bar_width(size: LeftBarSize) {
    const map = {
      "just-icon": 56,
      grow: 340,
      hidden: 0,
    };
    left_bar_width.value = map[size];
  }

  const use_markdown_render = ref(true);

  const db_task: Promise<any> = Promise.resolve()
    .then(async () => {
      await sync_db();
      await compact_dbs();
    })
    .catch((e) => {
      throw e;
    });

  async function wait_db_task<T>(p: Promise<T>) {
    const result = await db_task
      .then(() => p)
      .catch((e) => {
        throw e;
      });
    return result;
  }

  async function wait_db_task_fn<T>(p: () => Promise<T>) {
    const result = await db_task.then(p).catch((e) => {
      throw e;
    });
    return result;
  }

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
    inputter: undefined as undefined | QInput,
    role: "user" as RoleWithoutUnknown,
    temperature: 0.5,
    presence_penalty: 0,
    frequency_penalty: 0,
    auto_max_tokens: true,
    max_tokens: 2000,
  });

  function get_chat_body_input_OpenAIRequestConfig() {
    const {
      model,
      temperature,
      presence_penalty,
      frequency_penalty,
      auto_max_tokens,
      max_tokens,
    } = chat_body_input.value;
    return {
      model,
      temperature: temperature,
      presence_penalty: presence_penalty,
      frequency_penalty: frequency_penalty,
      max_tokens: auto_max_tokens ? undefined : max_tokens,
    };
  }

  const chat_records_meta = ref<ChatRecordMeta[]>(chat_records_default_value);
  const settings = ref<Settings>(settings_default_value);

  async function _set_settings<T extends keyof Settings>(
    id: T,
    value: Settings[T] = settings.value[id]
  ) {
    await wait_db_task_fn(() => set_settings(id, value));
  }

  async function _new_chat_record(name: string, created: number) {
    return await wait_db_task_fn(async () => {
      const id = await new_chat_record(name, created);
      await sync_db();
      return id;
    });
  }

  async function _get_chat_record_messages(id: string) {
    return await wait_db_task_fn(() => get_chat_record_messages(id));
  }

  async function _update_chat_record_messages(
    id: string,
    message?: readonly Message[]
  ) {
    console.log("id", id);

    if (message === undefined) {
      message = curry_chat.messages;
    }

    await wait_db_task_fn(() => update_chat_record_messages(id, message!));
  }

  async function _delete_chat_record(id: string) {
    await wait_db_task_fn(async () => {
      await delete_chat_record(id);
      curry_chat.id = undefined;
      await sync_db();
    });
  }

  const curry_chat = reactive({
    id: undefined as undefined | string,
    messages: [] as Message[],
    status: "",
    /** 状态：使用原始渲染。
     * [req: use_raw_render]：当页面变动时清空。 */
    use_raw_render: {} as Record<number, boolean>,
    /** 操作模式。本来应该储存在组件中，但 props 的传递链维护起来比较麻烦。 */
    operating_mode: ChatRecordOperatingMode.default,
    edit_mode: {
      selected: {} as Record<number, boolean>,
    },
    clear_edit_mode_cache() {
      curry_chat.edit_mode = {
        selected: {},
      };
    },
    change_operating_mode(target_mode: ChatRecordOperatingMode) {
      const curr_mode = curry_chat.operating_mode;
      if (curr_mode === ChatRecordOperatingMode.edit) {
        curry_chat.clear_edit_mode_cache();
      }
      curry_chat.operating_mode = target_mode;
    },
    clear_cache() {
      curry_chat.use_raw_render = {};
      curry_chat.id = undefined;
      curry_chat.messages = [];
      curry_chat.operating_mode = ChatRecordOperatingMode.default;
      curry_chat.clear_edit_mode_cache();
    },
  });

  /** 不应该直接运行，应该使用 `wait_db_task_fn` 加入事务队列中。  */
  async function sync_db() {
    console.log("sync");
    console.log("curry_chat.id", curry_chat.id);

    chat_records_meta.value = await get_chat_records_meta(0, 20);
    settings.value = await get_settings();
    if (curry_chat.id) {
      await sync_curr_chat_record_messages();
    }

    console.log("[sync_db]", settings.value);

    is_loading.value = false;
  }

  /** 不应该直接运行，应该使用 `wait_db_task_fn` 加入事务队列中。  */
  async function sync_curr_chat_record_messages() {
    if (!curry_chat.id) return;

    try {
      curry_chat.messages = await get_chat_record_messages(curry_chat.id);
    } catch {
      console.log("sync faild");
      curry_chat.id = undefined;
    }
  }

  return {
    use_markdown_render,
    left_bar_width,
    change_left_bar_width,
    chat_records_meta,
    settings,
    new_chat_record: _new_chat_record,
    get_chat_record_messages: _get_chat_record_messages,
    update_chat_record_messages: _update_chat_record_messages,
    delete_chat_record: _delete_chat_record,
    set_settings: _set_settings,
    is_loading,
    curry_chat,
    chat_body_input,
    get_chat_body_input_OpenAIRequestConfig,
    sync_db,
    sync_curr_chat_record_messages: () =>
      wait_db_task_fn(() => sync_curr_chat_record_messages()),
  };
});

export default use_main_store;
