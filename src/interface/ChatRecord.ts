import { CreateChatCompletionRequest } from "openai";

/** 聊天记录元信息 */
export interface ChatRecordMeta {
  id: string;
  name: string;
  created: number;
  last_modified: number;
  latest_record_id?: number;
  record_count?: number;
  api__?: string;
}

type ChatRecordToV2<T extends Omit<ChatRecordMeta, "id">> = Omit<
  T,
  "latest_record_id" | "record_count"
> & {
  api__: "v2";
  latest_record_id: number;
  record_count: number;
};

export type ChatRecordMetaV2 = ChatRecordToV2<ChatRecordMeta>;

/** 聊天记录 */
export default interface ChatRecord extends ChatRecordMeta {
  messages: Message[];
}

export type ChatRecordV2 = ChatRecordToV2<ChatRecord>;

export type ChatRecordForStorage = Omit<ChatRecord, "id">;
export type ChatRecordForStorageV2 = ChatRecordToV2<ChatRecordForStorage>;

export type Message = UserMessage | ServerMessage;
type MessageToV2<T extends Message> = Omit<T, "record_id" | "last_modified"> & {
  record_id: number;
  last_modified: number;
  api__: "v2";
};
export type MessageV2 = ServerMessageV2 | UserMessageV2;

export type Role = "user" | "assistant" | "system" | "unknown";
export type RoleWithoutUnknown = Exclude<Role, "unknown">;

export interface UserMessage {
  api__?: string;
  record_id?: number;
  message_type: "user";
  role: Role;
  created: number;
  last_modified?: number;
  content: string;
}

export type UserMessageV2 = MessageToV2<UserMessage>;

interface _RequestConfig {
  api_source?: string;
  model: string;
}

export interface OpenAIRequestConfig
  extends _RequestConfig,
    Omit<CreateChatCompletionRequest, "messages"> {
  api_source?: "openai";
}

export type RequestConfig = OpenAIRequestConfig;

export interface ServerMessage {
  api__?: string;
  record_id?: number;
  message_type: "server";
  role: Role;
  created: number;
  last_modified?: number;
  request_config: OpenAIRequestConfig;
  response_meta?: ResponseMeta;
  content: string;
  error?: ServerMessagesError;
}

export type ServerMessageV2 = MessageToV2<ServerMessage>;

export type ServerMessagesError =
  | ServerMessagesAPIError
  | ServerMessagesOtherAPIError
  | ServerMessagesOtherStringError
  | ServerMessagesNoAPIKEYError
  | ServerMessagesConnectionError
  | ServerMessagesConnectionAbortError;

export interface ServerMessagesAPIError {
  err_type: "api";
  code?: string;
  message?: string;
  param?: any;
  type?: string;
}

export interface ServerMessagesOtherAPIError {
  err_type: "others_api";
  content: any;
}

export interface ServerMessagesOtherStringError {
  err_type: "others_string";
  content: string;
}

export interface ServerMessagesNoAPIKEYError {
  err_type: "no_api_key";
}

export interface ServerMessagesConnectionError {
  err_type: "connection_error";
  content: string;
}

export interface ServerMessagesConnectionAbortError {
  err_type: "connection_abort";
}

export interface ResponseMeta {
  id: string;
  object: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
