import { APIKey } from "../../interface/Settings";
import { non_empty_else } from "../utils";
import { Configuration } from "./openai_api";

export function create_config_from_apikey(apikey: APIKey) {
  let base = "https://api.openai.com/v1";
  if (apikey.source === "Custom") {
    base = non_empty_else(apikey.base, "https://api.openai.com/v1");
  }
  return new Configuration({
    apiKey: apikey.key,
    basePath: base,
    baseOptions: {},
  });
}
