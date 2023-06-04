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

export function create_UserMessage(
  chat_record: ChatRecordMeta,
  role: Role,
  content: string
) {
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
  return {
    api__: "v2",
    record_id: 1,
    message_type: "server",
    role,
    created: Date.now(),
    last_modified: Date.now(),
    request_config,
    content,
  };
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
