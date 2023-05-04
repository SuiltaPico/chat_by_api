export default interface Settings {
  apikeys: APIKeys;
}


export interface SettingItem {
}

export type APIKeySource = "OpenAI";

interface APIKey {
  source: APIKeySource;
  name: string;
  key: string;
}

interface APIKeys extends SettingItem {
  keys: APIKey[];
}
