import { DocumentMeta } from "../../interface/Document";
import { dbs } from "./db_api";

export const document_default_value = [] satisfies DocumentMeta[];

export async function init_document_db() {
  const db = dbs.document;
}
