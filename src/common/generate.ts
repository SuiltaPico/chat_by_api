import { chain } from "lodash";
import { ChatCompletionRequestMessage } from "openai";
import { Ref, ref, toRef } from "vue";
import {
  Message,
  OpenAIRequestConfig,
  ServerMessage,
  ServerMessagesError,
} from "../interface/ChatRecord";
import { Configuration, OpenAIApi } from "./openai/openai_api";
import {
  non_empty_else,
  parse_param_to_Record,
  scroll_if_close_to,
} from "./utils";
import use_main_store from "../store/memory/main_store";
import {
  Messages_to_OpenAI_Messages,
  write_Message_to_ChatRecord,
} from "../implement/ChatRecord";

/** 根据 `messages` 生成下一个消息，位于 `messages[index]` 的消息视为服务器写入的去向。`messages[index]` 消息会写入 id 为 `chat_record_id` 的对话记录 。 */
export async function generate_next(
  chat_record_id: string,
  messages: Message[],
  index: number
) {
  const ms = use_main_store();

  const msg = messages[index] as ServerMessage;

  console.log(msg.content);

  const apply_update_chat_record_messages = async () => {
    await ms.push_to_db_task_queue(async () => {
      await ms.chat_records.modify(chat_record_id, async (curr_cr) => {
        write_Message_to_ChatRecord(curr_cr, msg, index);
      });
    });
  };

  const settings = ms.settings.settings;

  if (ms.settings.is_no_apikeys()) {
    msg.error = {
      err_type: "no_api_key",
    };
    await apply_update_chat_record_messages();
    return;
  }

  const first_apikey = settings.apikeys.keys[0];
  let additional_option = {};
  if (first_apikey.source === "Custom") {
    additional_option = {
      api_base_path: first_apikey.base,
      params: parse_param_to_Record(first_apikey.param),
    };
  }

  const stop_ref = toRef(ms.chat_records.get_app_meta(chat_record_id), "stop");

  try {
    await openai_chat_completion({
      api_key: first_apikey.key,
      params: {},
      ...additional_option,
      messages: Messages_to_OpenAI_Messages(messages),
      async on_status_changed(status) {
        ms.chat_records.get_app_meta(chat_record_id).status = status;
      },
      async on_update(clip) {
        msg.content += clip;
        await apply_update_chat_record_messages();
      },
      stop_next_ref: stop_ref,
      open_ai_request_config: ms.chat_body_input.generate_OpenAIRequestConfig(),
    });
  } catch (e) {
    msg.error = e as ServerMessagesError;
    await apply_update_chat_record_messages();
    return;
  }
}

export type GenerateStatus = "init" | "connecting" | "generating" | "finished";

export async function openai_chat_completion(config: {
  api_key: string;
  api_base_path?: string;
  params: Record<string, string>;
  messages: ChatCompletionRequestMessage[];
  on_status_changed: (state: GenerateStatus) => Promise<void>;
  on_update: (content_clip: string) => Promise<void>;
  stop_next_ref: Ref<() => void>;
  open_ai_request_config: Exclude<OpenAIRequestConfig, "api_source">;
}) {
  const {
    api_key,
    api_base_path,
    params,
    messages,
    on_status_changed,
    on_update,
    stop_next_ref,
    open_ai_request_config: {
      model,
      temperature,
      presence_penalty,
      frequency_penalty,
      max_tokens,
    },
  } = config;
  let stop_next = false;

  stop_next_ref.value = () => {
    stop_next = true;
  };

  await on_status_changed("init");

  const cfg = new Configuration({
    apiKey: api_key,
    basePath: non_empty_else(api_base_path ?? "", "https://api.openai.com/v1"),
    baseOptions: {},
  });

  const openai = new OpenAIApi(cfg);

  if (stop_next) return;

  await on_status_changed("connecting");

  let res = {
    body: null as ReadableStream<Uint8Array> | null,
  };

  try {
    res = await openai.createChatCompletion({
      params,
      request: {
        stream: true,
        model,
        messages: messages,
        temperature,
        presence_penalty,
        frequency_penalty,
        max_tokens,
      },
    });
  } catch (e) {
    throw {
      err_type: "connection_error",
      content: String(e),
    };
  }

  if (stop_next) return;

  await on_status_changed("generating");

  const body = res.body;

  if (body === null) return;

  const decoder = new TextDecoder();
  const reader = body.getReader();

  let buffer = "";

  async function readStream() {
    while (true) {
      if (stop_next) return;

      let done, value, res;

      try {
        res = await reader.read();
      } catch {
        throw {
          err_type: "connection_abort",
        };
      }
      done = res.done;
      value = res.value;

      if (done) break;
      const raw_result = decoder.decode(value);
      buffer += raw_result;
      console.log(raw_result);

      const splited = buffer.split("\n\n");

      let result_buf = "";
      let remained = undefined;
      let is_stop = false;
      for (let index = 0; index < splited.length; index++) {
        const maybe_json = splited[index].trimStart();
        if (maybe_json === "") {
          continue;
        } else if (maybe_json === "data: [DONE]") {
          is_stop = true;
          continue;
        } else if (maybe_json.match(/^data:\s*/)) {
          try {
            const result = JSON.parse(maybe_json.slice(6).trim()).choices[0]
              .delta;
            result_buf += result.content ?? "";
          } catch (e) {
            if (index == splited.length - 1) {
              remained = maybe_json;
            }
          }

          if (stop_next) return;
        } else {
          // @ts-ignore
          window.e = maybe_json;
          console.log(maybe_json);

          return openai_steam_error_to_error(maybe_json);
        }
      }

      if (remained !== undefined) {
        buffer = remained;
      } else {
        buffer = "";
      }

      scroll_if_close_to(document.getElementById("app")!, 32);
      console.log(result_buf);
      await on_update(result_buf);
    }
  }

  await readStream();

  if (stop_next) return;

  await on_status_changed("finished");
}

function openai_steam_error_to_error(data: string) {
  console.log("openai_steam_error", data);
  try {
    const data_json = JSON.parse(data);
    if (typeof data_json === "object") {
      if (
        data_json.error !== undefined &&
        typeof data_json.error === "object"
      ) {
        return {
          err_type: "api",
          ...data_json.error,
        };
      } else {
        return {
          err_type: "others_api",
          content: data_json,
        };
      }
    } else if (typeof data_json === "string") {
      return {
        err_type: "others_string",
        content: data_json,
      };
    }
  } catch {}
  return {
    err_type: "others_string",
    content: data,
  };
}
