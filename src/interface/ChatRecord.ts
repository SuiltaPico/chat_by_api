import { CreateChatCompletionRequest } from "openai";

/** 聊天记录元信息 */
export interface ChatRecordMeta {
  id: string;
  name: string;
  created: number;
  last_modified: number;
}

/** 聊天记录 */
export default interface ChatRecord extends ChatRecordMeta {
  messages: Message[];
}

export type ChatRecordForStorage = Omit<ChatRecord, "id">;

export type Message = UserMessage | ServerMessage;

export interface UserMessage {
  message_type: "user";
  role: string;
  created: number;
  content: string;
}

export interface ServerMessage {
  message_type: "server";
  role: string;
  created: number;
  request_config: Omit<CreateChatCompletionRequest, "messages">;
  response_meta?: ResponseMeta;
  content: string;
  error?:
    | ServerMessagesAPIError
    | ServerMessagesOtherAPIError
    | ServerMessagesOtherStringError
    | ServerMessagesNoAPIKEYError
    | ServerMessagesConnectionError
    | ServerMessagesConnectionAbortError;
}

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
