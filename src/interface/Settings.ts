export default interface Settings {
  apikeys: APIKeysSetting;
  open_ai: OpenAISetting;
}

// 增加的时候注意添加 db_api 
export type SettingItem = APIKeysSetting | OpenAISetting;

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
