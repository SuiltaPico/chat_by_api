/** 负责提供与数据库的 API 的模块。是应用和数据库交互的中间层。 */

import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";
import { chat_records_db, create_chat_records_db_api } from "./chat_records";
import { create_documents_db_api, documents_db } from "./document";
import { create_settings_db_api, settings_db } from "./settings";
import {
  create_document_collections_db_api,
  document_collections_db,
} from "./document_collections";

PouchDB.plugin(PouchDBFind);

export const dbs = {
  chat_records: chat_records_db,
  settings: settings_db,
  documents: documents_db,
  document_collections: document_collections_db,
};

export const db_apis = {
  chat_records: create_chat_records_db_api(dbs.chat_records),
  settings: create_settings_db_api(dbs.settings),
  documents: create_documents_db_api(dbs.documents),
  document_collections: create_document_collections_db_api(
    dbs.document_collections
  ),
};

export async function init_db() {
  await Promise.allSettled(Object.values(db_apis).map((it) => it.api_init()));
  await compact_dbs();
}

/** 压缩数据库，清理多余的缓存。 */
async function compact_dbs() {
  await Promise.all(Object.values(dbs).map((db) => db.compact()));
}
