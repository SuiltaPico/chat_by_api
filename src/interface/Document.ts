export interface TextDocumentSource {
  type: "Text";
  row: number;
  col: number;
  resource_id?: string;
}

export interface ImageOCRDocumentSource {
  type: "ImageOCR";
  x: number;
  y: number;
  width: number;
  height: number;
  resource_id?: string;
}

export type DocumentSource = TextDocumentSource | ImageOCRDocumentSource;

export interface EmbeddedAPIVectorSource {
  type: "EmbeddedAPI";
  api_id: string;
}

/** 向量的来源的信息。 */
export type VectorSource = EmbeddedAPIVectorSource;

/** 向量元信息。 */
export interface VectorMeta {
  /** 向量来源。 */
  source: VectorSource;
  /** 向量长度。 */
  length: string;
  /** 是否为文档最新内容生成的向量。 */
  is_latest: boolean;
  /** 向量的创建时间。 */
  created: number;
}

/** 向量，包含向量数据和元信息。 */
export type Vector = VectorMeta & {
  vector: Float32Array;
};

export interface DocumentLink {
  document_id: string;
  /** 关联率。0~1 */
  relevance_rate: number;
  created: number;
  last_modified: number;
}

interface BaseDocumentMeta<T> {
  type: string;
  id: string;
  name: string;
  content: T;
  created: number;
  last_modified: number;
  source: DocumentSource;
  links: DocumentLink[];
  vectors: VectorMeta[];
}

export interface TextDocumentMeta extends BaseDocumentMeta<string> {
  type: "text";
}

/** 文档元信息。 */
export type DocumentMeta = TextDocumentMeta;

/** 没有 `id` 的文档元信息。 */
export type DocumentMetaForStorage = Omit<DocumentMeta, "id">;

/** 文档。包含向量数据。
 *
 * 文档主要的属性是内容和向量集。`vectors` 是一些文档内容通过嵌入模型生成的向量。 */
export type Document = Omit<DocumentMeta, "vectors"> & {
  vectors: Vector[];
};

export type DocumentForStorage = Omit<Document, "id">;

/** 文档集合。 */
export interface DocumentCollection {
  id: string;
  name: string;
  description?: string;
  documents_id: string[];
  created: number;
  last_modified: number;
}
