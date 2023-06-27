import PouchDB from "pouchdb";

export interface DBAPI {
  api_init(): Promise<void>;
  [key: string]: (...args: any[]) => Promise<any>;
}

const db_init_param = {
  revs_limit: 1,
  auto_compaction: true,
} satisfies PouchDB.Configuration.DatabaseConfiguration;

export function create_db<T extends {}>(name: string) {
  return new PouchDB<T>(name, db_init_param);
}

export function create_index_manager<T extends {}>(
  index_name: string,
  index_fields: string[],
  db: PouchDB.Database<T>
) {
  return {
    async rebuild(indexes?: PouchDB.Find.Index[]) {
      if (indexes === undefined) {
        indexes = (await db.getIndexes()).indexes;
      }

      const index_meta = indexes.find(
        (it) => it.ddoc === `_design/${index_name}`
      );

      if (index_meta !== undefined) {
        await new Promise((res) => {
          db.deleteIndex(index_meta as PouchDB.Find.DeleteIndexOptions, () => {
            res(undefined);
          });
        });
      }
    },

    async find(request?: Omit<PouchDB.Find.FindRequest<T>, "selector">) {
      await db.createIndex({
        index: { fields: index_fields, ddoc: index_name },
      });

      // 使用索引查询 ChatRecordMeta 序列
      const result = await db.find({
        selector: {},
        use_index: index_name,
        ...request,
      });

      return result;
    },
  };
}
