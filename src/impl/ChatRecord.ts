import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from "openai";
import { Message } from "../interface/ChatRecord";
import _ from "lodash";

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
