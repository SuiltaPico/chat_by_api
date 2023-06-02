import { Configuration, OpenAIApi } from "./openai_api";
import { Messages_to_OpenAI_Messages } from "../impl/ChatRecord";
import { non_empty_else, scroll_if_close_to } from "./utils";
import { ServerMessage } from "../interface/ChatRecord";
import { Ref, ref, watch } from "vue";
import { ChatCompletionRequestMessage } from "openai";
import { OpenAIRequestConfig } from "../interface/ChatRecord";
import { chain } from "lodash";

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

  // 锁定chatid，不被变化影响

  const cfg = new Configuration({
    apiKey: api_key,
    basePath: non_empty_else(api_base_path ?? "", "api.openai.com/v1"),
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

      // console.log(done, value);
      if (done) break;
      const raw_result = decoder.decode(value);
      const msg_clip = chain(raw_result)
        .split("\n\n")
        .filter((it) => it.length > 0)
        .map((it) => {
          try {
            if (it === "data: [DONE]") {
              return {};
            }
            return JSON.parse(it.slice(6));
          } catch {
            return openai_steam_error_to_error(it);
          }
        })
        .reduce((acc, it) => {
          if (it.err_type) {
            throw it;
          }
          try {
            const delta = it.choices[0].delta;
            if (delta.content) {
              acc += delta.content;
            }
          } catch {}
          return acc;
        }, "")
        .value();

      if (stop_next) return;

      scroll_if_close_to(document.getElementById("app")!, 32);
      await on_update(msg_clip);
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
