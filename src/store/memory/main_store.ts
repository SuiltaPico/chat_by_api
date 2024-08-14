import { defineStore } from "pinia";
import { QInput } from "quasar";
import { reactive, ref } from "vue";
import { load_models } from "../../common/api_meta";
import { ChatBodyInputMode } from "../../components/framework/ChatBodyInput/ChatBodyInput";
import ChatRecord, {
  ChatRecordMeta,
  OpenAIRequestConfig,
  RoleWithoutUnknown,
} from "../../interface/ChatRecord";
import { Document, DocumentForStorage } from "../../interface/Document";
import Settings from "../../interface/Settings";
import { ChatRecordOperatingMode } from "../../pages/chat";
import { db_apis, init_db } from "../db";
import { chat_records_default_value } from "../db/chat_records";
import { document_default_value } from "../db/document";
import { settings_default_value } from "../db/settings";
import { run_and_pp, run_and_pps } from "../../common/utils";
import { document_collection_default_value } from "../db/document_collections";
import { UAParser } from "ua-parser-js";
import { GenerateStatus } from "../../common/generate";

type LeftBarSize = "just-icon" | "grow" | "hidden";

/** 应用用于渲染的临时储存。不保证与数据库实时同步。
 *
 * 提供的数据库 API 会尝试缓存与数据库的一致性。
 */
const use_main_store = defineStore("main", () => {
  const ua_parse_result = UAParser(navigator.userAgent);

  const client_info = reactive({
    framework: "browser",
    engine: ua_parse_result.engine,
    secure_context: window.isSecureContext,
  });

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

  async function push_to_db_task_queue<T>(p: () => Promise<T>) {
    const thenp = db_task_queue.then(p).catch((e: any) => {
      console.error(e);
      // throw e;
    });
    db_task_queue = thenp;
    return await thenp;
  }

  push_to_db_task_queue(async () => {
    await init_db();
    await sync_from_db();
    const models_src = settings.settings.custom_model.models;
    const models = []
    if (models_src) {
      models.push(...models_src.split(/ +/))
    }
    load_models(models);
  });

  const is_initializing = ref(true);

  const chat_body_input = reactive({
    mode: "generate" as ChatBodyInputMode,
    promot: "",
    model: "gpt-4o-mini",
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

  const chat_records_sync_metas = async () => {
    chat_records.metas = await chat_records.get_metas(0, 1024);
  };

  const chat_records_sync_message = async () => {
    if (curr_chat.chat_record === undefined) return;
    curr_chat.chat_record = await chat_records.get(curr_chat.chat_record.id);
  };

  const chat_records = reactive({
    app_meta: {} as Record<
      string,
      { status: GenerateStatus; stop: () => void }
    >,
    get_app_meta: (id: string) => {
      if (chat_records.app_meta[id] === undefined) {
        chat_records.app_meta[id] = {
          status: "finished",
          stop: () => {},
        };
      }
      return chat_records.app_meta[id];
    },
    metas: chat_records_default_value as ChatRecordMeta[],
    get_metas: db_apis.chat_records.get_metas,
    create: run_and_pp(db_apis.chat_records.create, chat_records_sync_metas),
    delete: run_and_pp(db_apis.chat_records.delete, chat_records_sync_metas),
    modify: run_and_pps(db_apis.chat_records.modify, [
      chat_records_sync_metas,
      chat_records_sync_message,
    ]),
    get: db_apis.chat_records.get,
    sync_metas: chat_records_sync_metas,
    sync_message: chat_records_sync_message,
  });

  async function documents_sync_metas() {
    documents.metas = await documents.get_metas(0, 1024);
  }

  async function document_collections_sync_data() {
    documents.collection.data = await documents.collection.get_batch(0, 1024);
  }

  const documents = reactive({
    metas: document_default_value,
    get_meta: db_apis.documents.get_meta,
    get_metas: db_apis.documents.get_metas,
    create: run_and_pp(db_apis.documents.create, documents_sync_metas),
    delete: run_and_pp(db_apis.documents.delete, documents_sync_metas),
    modify: run_and_pp(db_apis.documents.modify, documents_sync_metas),
    get_vectors: db_apis.documents.get_vectors,
    sync_metas: documents_sync_metas,
    collection: {
      data: document_collection_default_value,
      create: run_and_pp(
        db_apis.document_collections.create,
        document_collections_sync_data
      ),
      delete: run_and_pp(
        db_apis.document_collections.delete,
        document_collections_sync_data
      ),
      modify: run_and_pp(
        db_apis.document_collections.modify,
        document_collections_sync_data
      ),
      get: db_apis.document_collections.get,
      get_batch: db_apis.document_collections.get_batch,
      sync_data: document_collections_sync_data,
    },
  });

  const settings = reactive({
    settings: settings_default_value as Settings,
    async set_setting<T extends keyof Settings>(id: T, value: Settings[T]) {
      if (id === "apikeys") {
        const models_src = settings.settings.custom_model.models;
        const models = []
        if (models_src) {
          models.push(...models_src.split(/ +/))
        }
        load_models(models);
      }
      await db_apis.settings.set_setting(id, value);
      await settings.sync();
    },
    get_settings: db_apis.settings.get_settings,
    async sync() {
      settings.settings = await settings.get_settings();
    },
    get_enabled_apikey() {
      return settings.settings.apikeys.keys[0];
    },
    is_no_apikeys() {
      return settings.settings.apikeys.keys.length === 0;
    },
  });

  /** 用于渲染的当前对话状态。 */
  const curr_chat = reactive({
    /** 用于渲染的对话记录。
     *
     * 注意：仅用于渲染，并非最新的文档。写入数据库钱不能使用该项作为最新的文档。应该打包成一个任务，并使用 `get_chat_record` 获取最新数据。在 */
    chat_record: undefined as ChatRecord | undefined,
    status: "finished" as GenerateStatus,
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
    await documents.sync_metas();
    await documents.collection.sync_data();

    await settings.sync();

    is_initializing.value = false;
  }

  return {
    client_info,
    left_bar,
    chat_records,
    settings,
    documents,
    is_initializing,
    curry_chat: curr_chat,
    chat_body_input,
    push_to_db_task_queue,
    sync_db: sync_from_db,
  };
});

export default use_main_store;
