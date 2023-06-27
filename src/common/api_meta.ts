import { fetch } from "pouchdb";
import { reactive, ref } from "vue";
import { create_config_from_apikey } from "./openai/openai_utils";
import use_main_store from "../store/memory/main_store";
import { OpenAIApi } from "./openai/openai_api";
import { cloneDeep } from "lodash";

export const api_base_url = {
  OpenAI: "https://api.openai.com/v1",
  API2D: "https://oa.api2d.net/v1",
};

export const default_openai_models = {
  chat_completions: [
    "gpt-4",
    "gpt-4-32k",
    "gpt-3.5-turbo",
    "gpt-3.5-turbo-16k",
  ],
  completions: [
    "text-davinci-003",
    "text-davinci-002",
    "text-curie-001",
    "text-babbage-001",
    "text-ada-001",
  ],
  edits: ["text-davinci-edit-001", "code-davinci-edit-001"],
  audio_transcriptions: ["whisper-1"],
  audio_translations: ["whisper-1"],
  fine_tunes: ["davinci", "curie", "babbage", "ada"],
  embeddings: ["text-embedding-ada-002", "text-search-ada-doc-001"],
  moderations: ["text-moderation-stable", "text-moderation-latest"],
};

export const openai_models = ref(cloneDeep(default_openai_models));

export async function load_models() {
  const ms = use_main_store();
  const apikey = ms.settings.get_enabled_apikey();
  if (apikey === undefined) return;

  const cfg = create_config_from_apikey(apikey);
  const openai = new OpenAIApi(cfg);

  try {
    const models = (await (await openai.get_models({})).json()).data as {
      id: string;
    }[];

    openai_models.value.chat_completions = models
      .filter((it) => it.id.includes("gpt"))
      .map((it) => it.id);
  } catch (e) {
    console.log(e);
    openai_models.value = cloneDeep(default_openai_models);
  }
}
