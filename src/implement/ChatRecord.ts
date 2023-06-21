/** 接口的一些实用方法实现。 */

import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";
import ChatRecord, {
  ChatRecordForStorage,
  ChatRecordForStorageV2,
  ChatRecordMeta,
  ChatRecordMetaV2,
  Message,
  RequestConfig,
  Role,
  ServerMessage,
  ServerMessageV2,
  UserMessage,
  UserMessageV2,
} from "../interface/ChatRecord";
import _ from "lodash";

export function create_ChatRecordForStorageV2(
  name: string
): ChatRecordForStorageV2 {
  return {
    api__: "v2",
    name,
    created: Date.now(),
    last_modified: Date.now(),
    latest_record_id: -1,
    record_count: 0,
    messages: [],
  };
}

export function CRFS_to_ChatRecord<T extends ChatRecordForStorage>(
  cr: T,
  id: string
) {
  return { ...cr, id };
}

/** 更改 `chat_record`。
 * ### 副作用
 * * `chat_record` */
export function after_modify_ChatRecord(chat_record: ChatRecord) {
  chat_record.last_modified = Date.now();
}

export function delete_ChatRecord(chat_record: ChatRecord) {}

export function create_UserMessage(
  chat_record: ChatRecordMeta,
  role: Role,
  content: string
) {
  chat_record.last_modified = Date.now();
  if (chat_record.api__ === "v2") {
    return create_UserMessageV2(chat_record as ChatRecordMetaV2, role, content);
  }
  return create_UserMessageV1(role, content);
}

export function create_UserMessageV1(role: Role, content: string): UserMessage {
  return {
    message_type: "user",
    role,
    created: Date.now(),
    last_modified: Date.now(),
    content,
  };
}

export function create_UserMessageV2(
  chat_record: ChatRecordMetaV2,
  role: Role,
  content: string
): UserMessageV2 {
  chat_record.latest_record_id += 1;
  chat_record.record_count += 1;
  return {
    api__: "v2",
    record_id: chat_record.latest_record_id,
    message_type: "user",
    role,
    created: Date.now(),
    last_modified: Date.now(),
    content,
  };
}

export function create_ServerMessage(
  chat_record: ChatRecordMeta,
  role: Role,
  content: string,
  request_config: RequestConfig
): ServerMessage {
  chat_record.last_modified = Date.now();
  if (chat_record.api__ === "v2") {
    return create_ServerMessageV2(
      chat_record as ChatRecordMetaV2,
      role,
      content,
      request_config
    );
  }
  return create_ServerMessageV1(role, content, request_config);
}

export function create_ServerMessageV1(
  role: Role,
  content: string,
  request_config: RequestConfig
): ServerMessage {
  return {
    message_type: "server",
    role: "assistant",
    created: Date.now(),
    request_config,
    content,
  };
}

export function create_ServerMessageV2(
  chat_record: ChatRecordMetaV2,
  role: Role,
  content: string,
  request_config: RequestConfig
): ServerMessageV2 {
  chat_record.latest_record_id += 1;
  chat_record.record_count += 1;
  return {
    api__: "v2",
    record_id: chat_record.latest_record_id,
    message_type: "server",
    role,
    created: Date.now(),
    last_modified: Date.now(),
    request_config,
    content,
  };
}

export function delete_Message(chat_record: ChatRecord) {
  if (chat_record.api__ === "v2") {
    chat_record.record_count! -= 1;
  }
  chat_record.last_modified = Date.now();
}

export function after_modify_Message(
  chat_record: ChatRecord,
  message: Message
) {
  message.last_modified = Date.now();
  chat_record.last_modified = Date.now();
}

/** 获取 `message` 在 `chat_record.messages` 中最有可能的索引。 */
export function get_Message_index_in_ChatRecord(
  chat_record: ChatRecord,
  message: Message,
  index_in_cache: number
) {
  // console.log(chat_record.messages);

  // 数据可能编辑过，位置可能会发生变化，根据 `record_id` 来写入最稳妥。
  if (message.record_id != undefined) {
    const finded_index = chat_record.messages.findIndex(
      (m) => m.record_id === message.record_id
    );
    if (finded_index !== -1) {
      return finded_index;
    }
  }
  // 如果是早期版本的 `chat_record`，只能根据索引写入。
  return index_in_cache;
}

/** 在最小破坏程度的情况下，将 `message` 写入 `chat_record.messages` 的正确位置。 */
export function write_Message_to_ChatRecord(
  chat_record: ChatRecord,
  message: Message,
  index_in_cache: number
) {
  // console.log(
  //   index_in_cache,
  //   get_Message_index_in_ChatRecord(chat_record, message, index_in_cache)
  // );

  chat_record.messages[
    get_Message_index_in_ChatRecord(chat_record, message, index_in_cache)
  ] = message;
}

export function get_Message_uuid(
  chat_record: ChatRecord,
  message: Message,
  index: number
) {
  if (message.api__ === "v2") {
    return chat_record.id + "-" + message.record_id!;
  }
  return chat_record.id + "-" + index;
}

export function Messages_to_OpenAI_Messages(
  messages: Message[],
  hidden_latest_server_message: boolean = false
): ChatCompletionRequestMessage[] {
  messages = _.cloneDeep(messages);
  if (
    hidden_latest_server_message &&
    _.last(messages)?.message_type === "server"
  ) {
    messages.pop();
  }

  return messages.map((msg) => {
    if (msg.message_type === "user") {
      return {
        role: role_to_ChatCompletionRequestMessageRoleEnum(msg.role),
        content: msg.content,
      };
    } else {
      return {
        role: role_to_ChatCompletionRequestMessageRoleEnum(msg.role),
        content: msg.content,
      };
    }
  });
}

export function role_to_ChatCompletionRequestMessageRoleEnum(role: string) {
  switch (role) {
    case "user":
      return ChatCompletionRequestMessageRoleEnum.User;
    case "assistant":
      return ChatCompletionRequestMessageRoleEnum.Assistant;
    case "system":
      return ChatCompletionRequestMessageRoleEnum.System;
    default:
      return ChatCompletionRequestMessageRoleEnum.User;
  }
}