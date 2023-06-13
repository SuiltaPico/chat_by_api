import _ from "lodash";
import Settings, {
  APIKeysSetting,
  SettingItem,
} from "../../interface/Settings";
import { dbs } from "./db_api";

export const settings_default_value = {
  apikeys: {
    keys: [],
  },
  hot_keys: {
    submit_keys: {
      value: [{ keys: ["Ctrl", "Enter"] }],
    },
  },
} satisfies Settings;

export async function init_settings_db() {
  const db = dbs.settings;

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
}

export async function get_settings_db() {
  const db = dbs.settings;

  const result = await db.allDocs({
    include_docs: true,
  });

  return _.chain(result.rows)
    .map((row) => row.doc)
    .compact()
    .keyBy("_id")
    .value() as any as Settings;
}

async function get_settings_rev(id: keyof Settings) {
  const db = dbs.settings;

  return (await db.get(id))._rev;
}

export class DBAPIKEYDuplicateError extends Error {
  map: { [x: string]: number[] };
  constructor(duplicate_index_map: { [x: string]: number[] }) {
    super("APIKEYs Duplicated.");
    this.map = duplicate_index_map;
  }
}

export async function set_setting_db<const T extends keyof Settings>(
  id: T,
  value: Settings[T]
) {
  const db = dbs.settings;

  console.log(`[db:settings] set setting ${id}`, value);

  if (id === "apikeys") {
    const duplicate_index_map = _.chain((value as APIKeysSetting).keys)
      .cloneDeep()
      .map((v, i) => {
        return { ...v, index: i };
      })
      .groupBy("name")
      .pickBy((v) => v.length > 1)
      .mapValues((duplicate_array) => duplicate_array.map((v) => v.index))
      .value();
    if (_.size(duplicate_index_map) > 0) {
      throw new DBAPIKEYDuplicateError(duplicate_index_map);
    }
  }
  
  await dbs.settings.put({
    _id: id,
    ...(value as SettingItem),
    _rev: await get_settings_rev(id),
  });
}
