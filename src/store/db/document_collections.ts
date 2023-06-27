import { with_id } from "../../implement/utils";
import { DocumentCollection } from "../../interface/Document";
import { DBAPI, create_db, create_index_manager } from "./utils";

export const document_collections_db = create_db<DocumentCollection>(
  "document_collections"
);

export const documents_collections_last_modified_index = create_index_manager(
  "last_modified_index",
  ["last_modified"],
  document_collections_db
);

export const document_collection_default_value =
  [] as DocumentCollection[];

export function create_document_collections_db_api(
  db: PouchDB.Database<DocumentCollection>
) {
  const db_api = {
    async api_init() {
      await documents_collections_last_modified_index.rebuild();
    },

    async create(dc: DocumentCollection) {
      await db.post(dc);
    },

    async modify(
      id: string,
      modifier: (
        documents_collection: DocumentCollection
      ) => Promise<void | DocumentCollection>
    ) {
      const dc = await db.get(id);
      const modified_dc = (await modifier(dc)) ?? dc;
      await db.put(modified_dc);
    },

    async delete(id: string) {
      return (await db.remove(await db.get(id))).ok;
    },

    async get(id: string) {
      return await db.get(id);
    },

    async get_batch(page: number, page_size: number) {
      const result = await documents_collections_last_modified_index.find({
        skip: page * page_size,
        limit: page_size,
        sort: [{ last_modified: "desc" }],
      });

      return result.docs.map((dc) => with_id(dc, dc._id));
    },
  } satisfies DBAPI;

  return db_api;
}
