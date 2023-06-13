import _, { chain } from "lodash";
import {
  CRFS_to_ChatRecord,
  create_ChatRecordForStorageV2,
  delete_ChatRecord,
  after_modify_ChatRecord,
} from "../../impl/ChatRecord";
import ChatRecord, {
  ChatRecordForStorage,
  ChatRecordMeta,
} from "../../interface/ChatRecord";
import { dbs } from "./db_api";

function CRFS_to_ChatRecord_db(
  cr: ChatRecordForStorage & PouchDB.Core.IdMeta & PouchDB.Core.GetMeta
) {
  return CRFS_to_ChatRecord(cr, cr._id);
}

export const chat_records_default_value = [] satisfies ChatRecordMeta[];

export async function init_chat_record_db() {
  const db = dbs.chat_records;
}

export async function get_chat_records_meta_db(
  page: number,
  page_size: number
) {
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
      "api__",
      "name",
      "created",
      "last_modified",
      "record_count",
      "_id",
      "_rev",
    ] satisfies (keyof PouchDB.Core.ExistingDocument<ChatRecord>)[],
    skip: page * page_size,
    limit: page_size,
    sort: [{ last_modified: "desc" }],
  });

  return chain(result.docs)
    .map((d) => CRFS_to_ChatRecord_db(d))
    .value();
}

export async function create_chat_record_db(name: string) {
  const db = dbs.chat_records;

  const result = await db.post(create_ChatRecordForStorageV2(name));

  return result.id;
}

export async function delete_chat_record_db(id: string) {
  const db = dbs.chat_records;

  const cr = CRFS_to_ChatRecord_db(await db.get(id));

  delete_ChatRecord(cr);

  await db.remove(await db.get(id));
}

export async function modify_chat_record_db(
  id: string,
  modifier: (chat_record: ChatRecord) => Promise<void | ChatRecord>
) {
  const db = dbs.chat_records;

  const cr = CRFS_to_ChatRecord_db(await db.get(id));
  const modified_cr = (await modifier(cr)) ?? cr;
  cr.record_count = cr.messages.length;
  after_modify_ChatRecord(modified_cr);
  await db.put(modified_cr);
}

export async function get_chat_record_db(id: string): Promise<ChatRecord> {
  const db = dbs.chat_records;

  // console.log("[db]get_chat_record", id);

  return CRFS_to_ChatRecord_db(await db.get(id));
}
