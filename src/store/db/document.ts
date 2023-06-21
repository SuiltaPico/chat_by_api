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
import { dbs } from "./db_api";

export const document_default_value = [] as DocumentMeta[];

export async function init_document_db() {
  const db = dbs.document;

  const index_meta = (await db.getIndexes()).indexes.find(
    (it) => it.ddoc === "_design/last_modified_index"
  );

  if (index_meta !== undefined) {
    await new Promise((res) => {
      db.deleteIndex(index_meta as PouchDB.Find.DeleteIndexOptions, () => {
        res(undefined);
      });
    });
  }
}

export function get_vector_attachment_name_db(vector_source: VectorSource) {
  if (vector_source.type === "EmbeddedAPI") {
    return `EmbeddedAPI_${vector_source.api_id}_vector.bin`;
  }
  throw new Error(
    "[Internal Error] The new VectorSource type was used but not updated in the get_vector_attachment_name function."
  );
}

export async function create_document_db(doc: DocumentForStorage) {
  const db = dbs.document;

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
}

export async function delete_document_db(id: string) {
  const db = dbs.document;
  await db.remove(await db.get(id));
}

export async function modify_document_db(
  id: string,
  modifier: (document: Document) => Promise<void | Document>
) {
  const db = dbs.document;
  const doc = with_id(await get_document_db(id), id);
  const modified_doc = (await modifier(doc)) ?? doc;
  await db.put(modified_doc);
}

export async function get_document_meta_db(id: string) {
  const db = dbs.document;
  const raw_doc = await db.get(id, {
    attachments: false,
  });

  return {
    type: raw_doc.type,
    id: raw_doc._id,
    name: raw_doc.name,
    content: raw_doc.content,
    created: raw_doc.created,
    last_modified: raw_doc.last_modified,
    source: raw_doc.source,
    vectors: raw_doc.vectors,
  } satisfies DocumentMeta;
}

export async function get_documents_meta_db(page: number, page_size: number) {
  const db = dbs.document;

  // 创建 last_modified 字段的索引
  const index = await db.createIndex({
    index: { fields: ["last_modified"], ddoc: "last_modified_index" },
  });

  // 使用索引查询 ChatRecordMeta 序列
  const result = await db.find({
    selector: {},
    use_index: "last_modified_index",
    skip: page * page_size,
    limit: page_size,
    sort: [{ last_modified: "desc" }],
  });

  return chain(result.docs)
    .map((d) => with_id(d, d._id))
    .value() satisfies DocumentMeta[];
}

export async function get_document_db(id: string) {
  const db = dbs.document;
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

  return {
    type: raw_doc.type,
    id: raw_doc._id,
    name: raw_doc.name,
    content: raw_doc.content,
    created: raw_doc.created,
    last_modified: raw_doc.last_modified,
    source: raw_doc.source,
    vectors,
  } satisfies Document;
}
