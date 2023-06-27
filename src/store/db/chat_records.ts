import { chain } from "lodash";
import { dbs } from ".";
import {
  after_modify_ChatRecord,
  create_ChatRecordForStorageV2,
} from "../../implement/ChatRecord";
import { with_id } from "../../implement/utils";
import ChatRecord, {
  ChatRecordForStorage,
  ChatRecordMeta,
} from "../../interface/ChatRecord";
import { create_db, create_index_manager } from "./utils";

function CRFS_to_ChatRecord_db(
  cr: ChatRecordForStorage & PouchDB.Core.IdMeta & PouchDB.Core.GetMeta
) {
  return with_id(cr, cr._id);
}

export const chat_records_db = create_db<ChatRecordForStorage>("chat_records");

export const chat_records_last_modified_index = create_index_manager(
  "last_modified_index",
  ["last_modified"],
  chat_records_db
);

export const chat_records_default_value = [] satisfies ChatRecordMeta[];

export function create_chat_records_db_api(
  db: PouchDB.Database<ChatRecordForStorage>
) {
  const db_api = {
    async api_init() {
      await chat_records_last_modified_index.rebuild();
    },

    async get_metas(page: number, page_size: number) {
      const result = await chat_records_last_modified_index.find({
        fields: [
          "api__",
          "name",
          "created",
          "last_modified",
          "record_count",
          "marked",
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
    },

    async create(name: string) {
      const result = await db.post(create_ChatRecordForStorageV2(name));
      return result.id;
    },

    async delete(id: string) {
      return (await db.remove(await db.get(id))).ok;
    },

    async modify(
      id: string,
      modifier: (chat_record: ChatRecord) => Promise<void | ChatRecord>
    ) {
      const cr = CRFS_to_ChatRecord_db(await db.get(id));
      const modified_cr = (await modifier(cr)) ?? cr;
      cr.record_count = cr.messages.length;
      after_modify_ChatRecord(modified_cr);
      await db.put(modified_cr);
    },

    async get(id: string) {
      const db = dbs.chat_records;
      return CRFS_to_ChatRecord_db(await db.get(id));
    },
  };
  return db_api;
}
