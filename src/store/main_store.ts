import { defineStore } from "pinia";
import { QInput } from "quasar";
import { reactive, ref } from "vue";
import { ChatBodyInputMode } from "../components/ChatBodyInput";
import ChatRecord, {
  ChatRecordMeta,
  OpenAIRequestConfig,
  RoleWithoutUnknown,
} from "../interface/ChatRecord";
import Settings from "../interface/Settings";
import { ChatRecordOperatingMode } from "../pages/chat";
import {
  chat_records_default_value,
  create_chat_record_db,
  delete_chat_record_db,
  get_chat_record_db,
  get_chat_records_meta_db,
  get_settings_db,
  init_db,
  modify_chat_record_db,
  set_setting_db,
  settings_default_value,
} from "./db/db_api";
import {
  create_document_db,
  delete_document_db,
  document_default_value,
  get_document_db,
  get_document_meta_db,
  get_documents_meta_db,
  modify_document_db,
} from "./db/document";
import { Document, DocumentForStorage } from "../interface/Document";
import { get_item_name_from_route_name } from "../components/leftbar/LeftBar";
import { defer } from "lodash";
import { useRoute } from "vue-router";
import { load_models } from "../common/api_meta";

type LeftBarSize = "just-icon" | "grow" | "hidden";

/** 应用用于渲染的临时储存。不保证与数据库实时同步。
 *
 * 提供的数据库 API 会尝试缓存与数据库的一致性。
 */
const use_main_store = defineStore("main", () => {
  const left_bar = reactive({
    selected_name: "chat",
    width: ref(340),
    change_width(size: LeftBarSize) {
      const map = {
        "just-icon": 56,
        grow: 340,
        hidden: 0,
      };
      left_bar.width = map[size];
    },
  });

  let db_task_queue: Promise<any> = Promise.resolve();

  push_to_db_task_queue(async () => {
    await init_db();
    await sync_from_db();
    load_models();
  });

  async function push_to_db_task_queue<T>(p: () => Promise<T>) {
    const thenp = db_task_queue.then(p).catch((e: any) => {
      console.error(e);
    });
    db_task_queue = thenp;
    return await thenp;
  }

  const is_initializing = ref(true);

  const chat_body_input = reactive({
    mode: "generate" as ChatBodyInputMode,
    promot: "",
    model: "gpt-3.5-turbo",
    brief_mode: false,
    require_next: false,
    /** 在使用 `ChatBodyInput` 组件发送消息后，对 `promot` 的清理和请求生成的控制。 */
    sended(new_chat?: boolean) {
      chat_body_input.promot = "";
      if (new_chat) {
        chat_body_input.require_next = true;
      }
    },
    inputter: undefined as undefined | QInput,
    role: "user" as RoleWithoutUnknown,
    temperature: 0.5,
    presence_penalty: 0,
    frequency_penalty: 0,
    auto_max_tokens: true,
    max_tokens: 2000,
    generate_OpenAIRequestConfig(): OpenAIRequestConfig {
      return {
        model: chat_body_input.model,
        temperature: chat_body_input.temperature,
        presence_penalty: chat_body_input.presence_penalty,
        frequency_penalty: chat_body_input.frequency_penalty,
        max_tokens: chat_body_input.auto_max_tokens
          ? undefined
          : chat_body_input.max_tokens,
      };
    },
  });

  const chat_records = reactive({
    metas: chat_records_default_value as ChatRecordMeta[],
    get_metas: get_chat_records_meta_db,
    async create(name: string) {
      const crid = await create_chat_record_db(name);
      await chat_records.sync_metas();
      return crid;
    },
    async delete(id: string) {
      await delete_chat_record_db(id);
      await chat_records.sync_metas();
    },
    async modify(
      id: string,
      modifier: (chat_record: ChatRecord) => Promise<void | ChatRecord>
    ) {
      await modify_chat_record_db(id, modifier);
      await chat_records.sync_metas();
      await chat_records.sync_message();
    },
    get: get_chat_record_db,
    async sync_metas() {
      chat_records.metas = await chat_records.get_metas(0, 1024);
    },
    async sync_message() {
      if (curr_chat.chat_record === undefined) return;
      curr_chat.chat_record = await chat_records.get(curr_chat.chat_record.id);
    },
  });

  const documents = reactive({
    metas: document_default_value,
    get_meta: get_document_meta_db,
    get_metas: get_documents_meta_db,
    async create(dfs: DocumentForStorage) {
      const id = await create_document_db(dfs);
      await documents.sync_metas();
      return id;
    },
    async delete(id: string) {
      await delete_document_db(id);
      await documents.sync_metas();
    },
    async modify(
      id: string,
      modifier: (document: Document) => Promise<void | Document>
    ) {
      await modify_document_db(id, modifier);
      await documents.sync_metas();
    },
    get: get_document_db,
    async sync_metas() {
      documents.metas = await documents.get_metas(0, 1024);
    },
  });

  const settings = reactive({
    settings: settings_default_value as Settings,
    async set_setting<T extends keyof Settings>(id: T, value: Settings[T]) {
      if (id === "apikeys") {
        load_models();
      }
      await set_setting_db(id, value);
      await settings.sync();
    },
    get_settings: get_settings_db,
    async sync() {
      settings.settings = await settings.get_settings();
    },
    get_enabled_apikey() {
      return settings.settings.apikeys.keys[0];
    },
  });

  /** 用于渲染的当前对话状态。 */
  const curr_chat = reactive({
    /** 用于渲染的对话记录。
     *
     * 注意：仅用于渲染，并非最新的文档。写入数据库钱不能使用该项作为最新的文档。应该打包成一个任务，并使用 `get_chat_record` 获取最新数据。在 */
    chat_record: undefined as ChatRecord | undefined,
    status: "",
    use_markdown_render: true,
    /** 操作模式。本来应该储存在组件中，但 props 的传递链维护起来比较麻烦。 */
    operating_mode: ChatRecordOperatingMode.default,
    select_mode: {
      selected: {} as Record<number, boolean>,
    },
    clear_select_mode_cache() {
      curr_chat.select_mode = {
        selected: {},
      };
    },
    change_operating_mode(target_mode: ChatRecordOperatingMode) {
      const curr_mode = curr_chat.operating_mode;
      if (curr_mode === ChatRecordOperatingMode.select) {
        curr_chat.clear_select_mode_cache();
      }
      curr_chat.operating_mode = target_mode;
    },
    clear_cache() {
      curr_chat.chat_record = undefined;
      curr_chat.operating_mode = ChatRecordOperatingMode.default;
      curr_chat.clear_select_mode_cache();
    },
    async load_chat_record(id: string) {
      curr_chat.chat_record = await chat_records.get(id);
    },
  });

  /** 从所有数据库中同步数据到 `main_store` 内。 */
  async function sync_from_db() {
    console.log("[sync_from_db]", curr_chat.chat_record?.id);

    await chat_records.sync_metas();
    await chat_records.sync_message();

    await settings.sync();

    is_initializing.value = false;
  }

  return {
    left_bar,
    chat_records,
    settings,
    is_initializing,
    curry_chat: curr_chat,
    chat_body_input,
    push_to_db_task_queue,
    sync_db: sync_from_db,
  };
});

export default use_main_store;
