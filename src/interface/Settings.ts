import { HotKeys } from "../common/key_event";

export default interface Settings {
  apikeys: APIKeysSetting;
  hot_keys: HotKeySetting;
}

// 注意，增加新类型的时候注意去 db_api.ts 更新 api
// export type SettingItem = APIKeysSetting | OpenAISetting | HotKeySetting;
export type SettingItem = APIKeysSetting | HotKeySetting;

export interface HotKeySetting {
  submit_keys: HotKeys;
}

export type APIKeySource = APIKey["source"];

interface BaseAPIKey {
  id: string;
  source: string;
  name: string;
  key: string;
}

export interface OpenAIAPIKey extends BaseAPIKey {
  source: "OpenAI";
}

export interface CustomAPIKey extends BaseAPIKey {
  source: "Custom";
  base: string;
  param: string;
}

export type APIKey = OpenAIAPIKey | CustomAPIKey;

export interface APIKeysSetting {
  keys: APIKey[];
}

// export interface OpenAISetting {
//   api_type: string;
//   api_base_path: string;
//   api_version: string;
// }
