import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";
import ChatRecord, {
  ChatRecordForStorage,
  ChatRecordMeta,
  Message,
} from "../interface/ChatRecord";
import Settings, { APIKeysSetting, SettingItem } from "../interface/Settings";
import _ from "lodash";

PouchDB.plugin(PouchDBFind);

export const dbs = {
  chat_records: new PouchDB<ChatRecordForStorage>("chat_records", {
    revs_limit: 0,
  }),
  settings: new PouchDB<SettingItem>("settings", {
    revs_limit: 0,
  }),
};

export const chat_records_default_value = [] satisfies ChatRecordMeta[];

export async function get_chat_records_meta(page: number, page_size: number) {
  const db = dbs.chat_records;

  // 创建 last_modified 字段的索引
  await db.createIndex({
    index: { fields: ["last_modified"], ddoc: "last_modified_index" },
  });

  // 使用索引查询 ChatRecordMeta 序列
  const result = await db.find({
    selector: {},
    use_index: "last_modified_index",
    fields: [
      "name",
      "created",
      "last_modified",
      "_id",
      "_rev",
    ] satisfies (keyof PouchDB.Core.ExistingDocument<ChatRecord>)[],
    skip: page * page_size,
    limit: page_size,
    sort: [{ last_modified: "desc" }],
  });

  return _.chain(result.docs)
    .map((v) => ({ ...v, id: v._id }))
    .value();
}

export async function new_chat_record(name: string, created: number) {
  const db = dbs.chat_records;

  const result = await db.post({
    name,
    created,
    messages: [],
    last_modified: created,
  });

  return result.id;
}

export async function get_chat_record_messages(id: string) {
  const db = dbs.chat_records;

  return (await db.get(id)).messages;
}

export async function update_chat_record_messages(
  id: string,
  messages: readonly Message[]
) {
  const db = dbs.chat_records;

  const latest = await db.get(id);

  await db.put({
    ...latest,
    messages: messages as Message[],
    last_modified: Date.now(),
  });
}

export async function delete_chat_record(id: string) {
  const db = dbs.chat_records;
  await db.remove(await db.get(id));
}

export const settings_default_value = {
  apikeys: {
    keys: [],
  },
  open_ai: {
    api_type: "",
    api_base_path: "",
    api_version: "",
  },
} as Settings;

const settings_init = (async () => {
  const db = dbs.settings;
  await Promise.all(
    _.chain(settings_default_value)
      .toPairs()
      .map(async ([key, value]) => {
        await db.get(key).catch((e) => {
          if (e.reason == "missing") {
            db.put({
              ...value,
              _id: key,
            });
          }
        }); // 检查文档是否已存在
      })
      .value()
  );
})();

export async function get_settings() {
  const db = dbs.settings;

  await settings_init;

  // 定位记录
  const result = await db.allDocs({
    include_docs: true,
  });

  return _.chain(result.rows)
    .map((row) => row.doc)
    .compact()
    .keyBy("_id")
    .value() as any as Settings;
}

export async function get_rev(id: keyof Settings) {
  return (await dbs.settings.get(id))._rev;
}

export class DBAPIKEYDuplicateError extends Error {
  map: { [x: string]: number[] };
  constructor(duplicate_index_map: { [x: string]: number[] }) {
    super("");
    this.map = duplicate_index_map;
  }
}

export async function set_settings<const T extends keyof Settings>(
  id: T,
  value: Settings[T]
) {
  console.log("set_settings", value);

  if (id === "apikeys") {
    const duplicate_index_map = _.chain((value as APIKeysSetting).keys)
      .cloneDeep()
      .map((v, i) => {
        return { ...v, index: i };
      })
      .groupBy("name")
      .pickBy((v) => v.length > 1)
      .mapValues((duplicate_array) => duplicate_array.map((v) => v.index))
      .value();
    if (_.size(duplicate_index_map) > 0) {
      throw new DBAPIKEYDuplicateError(duplicate_index_map);
    }
  }
  await dbs.settings.put({
    _id: id,
    ...(value as SettingItem),
    _rev: await get_rev(id),
  });
}
