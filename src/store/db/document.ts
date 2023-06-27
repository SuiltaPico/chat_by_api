import { chain, omit } from "lodash";
import { with_id } from "../../implement/utils";
import {
  DocumentMeta,
  Document,
  VectorSource,
  Vector,
  DocumentForStorage,
  DocumentMetaForStorage,
} from "../../interface/Document";
import { combine_to_document } from "../../implement/Document";
import { create_db, create_index_manager } from "./utils";

export const documents_db = create_db<DocumentMetaForStorage>("documents");

export const documents_last_modified_index = create_index_manager(
  "last_modified_index",
  ["last_modified"],
  documents_db
);

export const document_default_value = [] as DocumentMeta[];

export function create_documents_db_api(
  db: PouchDB.Database<DocumentMetaForStorage>
) {
  const db_api = {
    async api_init() {
      await documents_last_modified_index.rebuild();
    },

    async get_meta(id: string) {
      const raw_doc = await db.get(id, {
        attachments: false,
      });

      return {
        ...raw_doc,
        id: raw_doc._id,
      } satisfies DocumentMeta;
    },

    async get_metas(page: number, page_size: number) {
      const result = await documents_last_modified_index.find({
        skip: page * page_size,
        limit: page_size,
        sort: [{ last_modified: "desc" }],
      });

      return result.docs.map((d) => with_id(d, d._id)) satisfies DocumentMeta[];
    },

    async create(doc: DocumentForStorage) {
      const _attachments: PouchDB.Core.Attachments = {};

      doc.vectors.forEach((it) => {
        _attachments[get_vector_attachment_name_db(it.source)] = {
          content_type: "application/octet-stream",
          data: new Blob([it.vector]),
        };
      });

      const doc_meta_fs: DocumentMetaForStorage = {
        ...doc,
        vectors: doc.vectors.map((it) => omit(it, "vector")),
      };

      const result = await db.post({ ...doc_meta_fs, _attachments });
      return result.id;
    },

    async delete(id: string) {
      return (await db.remove(await db.get(id))).ok;
    },

    async modify(
      id: string,
      modifier: (document: Document) => Promise<void | Document>
    ) {
      const doc = combine_to_document(
        await db_api.get_meta(id),
        with_id(await db_api.get_vectors(id), id)
      );
      const modified_doc = (await modifier(doc)) ?? doc;
      await db.put(modified_doc);
    },

    async get_vectors(id: string) {
      const raw_doc = await db.get(id, {
        attachments: true,
        binary: true,
      });

      let vectors: Vector[] = [];
      if (raw_doc._attachments !== undefined) {
        vectors = (
          await Promise.all(
            raw_doc.vectors.map(async (it) => {
              const attachment =
                raw_doc._attachments![get_vector_attachment_name_db(it.source)];
              if (attachment === undefined) return;

              return {
                ...it,
                vector: new Float32Array(
                  await (
                    attachment as {
                      data: Blob;
                    }
                  ).data.arrayBuffer()
                ),
              };
            })
          )
        ).filter((it) => it !== undefined) as Vector[];
      }

      return vectors;
    },
  };

  return db_api;
}

export function get_vector_attachment_name_db(vector_source: VectorSource) {
  if (vector_source.type === "EmbeddedAPI") {
    return `EmbeddedAPI_${vector_source.api_id}_vector.bin`;
  }
  throw new Error(
    "[Internal Error] The new VectorSource type was used but not updated in the get_vector_attachment_name function."
  );
}
