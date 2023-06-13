/** 负责提供与数据库的 API 的模块。是应用和数据库交互的中间层。 */

import _ from "lodash";
import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";
import { ChatRecordForStorage } from "../../interface/ChatRecord";
import { SettingItem } from "../../interface/Settings";
import { init_settings_db } from "./settings";
import { init_chat_record_db } from "./chat_records";

export * from "./settings";
export * from "./chat_records";

PouchDB.plugin(PouchDBFind);

const db_init_param = {
  revs_limit: 1,
};

export const dbs = {
  chat_records: new PouchDB<ChatRecordForStorage>(
    "chat_records",
    db_init_param
  ),
  settings: new PouchDB<SettingItem>("settings", db_init_param),
};

/** 压缩数据库，清理多余的缓存。 */
export async function compact_dbs() {
  await Promise.all(Object.values(dbs).map((db) => db.compact()));
}

export async function init_db() {
  await init_chat_record_db();
  await init_settings_db();
}
