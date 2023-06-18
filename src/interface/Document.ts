export interface TextDocumentSource {
  row: number;
  col: number;
}

export interface ImageOCRDocumentSource {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type DocumentSource = TextDocumentSource | ImageOCRDocumentSource;

export interface DocumentMeta {
  id: string;
  name: string;
  content: string;
  created: number;
  last_modified: number;
  from: DocumentSource;
}

export type Document = DocumentMeta & {
  vector: Float32Array[];
};

export type DocumentMetaForStorage = Omit<DocumentMeta, "id">;

export interface DocumentCollection {
  id: string;
  name: string;
  description?: string;
  documents: Document[];
  created: number;
  last_modified: number;
}
