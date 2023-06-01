import { HotKeys } from "../common/key_event";

export default interface Settings {
  apikeys: APIKeysSetting;
  open_ai: OpenAISetting;
  hot_keys: HotKeySetting;
}

// 注意，增加新类型的时候注意去 db_api.ts 更新 api
export type SettingItem = APIKeysSetting | OpenAISetting | HotKeySetting;

export interface HotKeySetting {
  submit_keys: HotKeys;
}

export type APIKeySource = "OpenAI";

interface APIKey {
  source: APIKeySource;
  name: string;
  key: string;
}

export interface APIKeysSetting {
  keys: APIKey[];
}

export interface OpenAISetting {
  api_type: string;
  api_base_path: string;
  api_version: string;
}
