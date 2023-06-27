import { Document, DocumentMeta, Vector } from "../interface/Document";

export function combine_to_document(
  document_meta: DocumentMeta,
  vectors: Vector[]
): Document {
  return {
    ...document_meta,
    vectors,
  };
}
