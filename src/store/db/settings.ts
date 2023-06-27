import _ from "lodash";
import { generate_apikey_id } from "../../implement/Settings";
import Settings, {
  APIKeysSetting,
  SettingItem,
} from "../../interface/Settings";
import { DBAPI, create_db } from "./utils";

export const settings_db = create_db<SettingItem>("settings");

export const settings_default_value = {
  apikeys: {
    keys: [],
  },
  hot_keys: {
    submit_keys: {
      value: [{ keys: ["Ctrl", "Enter"] }],
    },
  },
  behaviors: {
    continue_to_generate_prompt: "请根据上下文，续写你之前生成的内容。",
  },
} satisfies Settings;

export function create_settings_db_api(db: PouchDB.Database<SettingItem>) {
  const db_api = {
    async api_init() {
      await Promise.all(
        _.chain(settings_default_value)
          .toPairs()
          .map(async ([key, value]) => {
            await db.get(key).catch(async (e) => {
              if (e.reason == "missing") {
                console.log("[db:setting] fix missing item: ", key);

                await db.put({
                  ...value,
                  _id: key,
                });
              }
            }); // 检查文档是否已存在
          })
          .value()
      );

      const apikeys: APIKeysSetting = await db.get("apikeys");

      // 修复旧版本中数据库没有储存 id 的情况。
      let has_null_id = false;
      apikeys.keys.forEach((it) => {
        if (it.id === undefined) {
          it.id = generate_apikey_id();
          has_null_id = true;
        }
      });
      if (has_null_id) {
        await db_api.set_setting("apikeys", apikeys);
      }
    },

    async get_settings() {
      const result = await db.allDocs({
        include_docs: true,
      });

      return _.chain(result.rows)
        .map((row) => row.doc)
        .compact()
        .keyBy("_id")
        .value() as any as Settings;
    },

    async set_setting<const T extends keyof Settings>(
      id: T,
      value: Settings[T]
    ) {
      // console.log(`[db:settings] set setting ${id}`, value);

      await db.put({
        _id: id,
        ...(value as SettingItem),
        _rev: (await db.get(id))._rev,
      });
    },
  } satisfies DBAPI;

  return db_api;
}
