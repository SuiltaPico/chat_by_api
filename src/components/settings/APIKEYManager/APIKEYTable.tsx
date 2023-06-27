import {
  QBadge,
  QBtn,
  QIcon,
  QTable,
  QTd,
  QTooltip,
  QTr
} from "quasar";
import { defineComponent } from "vue";
import {
  c,
  cl
} from "../../../common/utils";
import { APIKey } from "../../../interface/Settings";
import use_main_store from "../../../store/memory/main_store";
import BetterBtn from "../../common/BetterBtn";

export const APIKEYTable = defineComponent<
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {
    remove_apikey: (index: number) => void;
    show_editor: (index: number) => void;
    to_top: (index: number) => void;
  }
>({
  emits: ["remove_apikey", "show_editor", "to_top"],
  setup: (_, ctx) => {
    const ms = use_main_store();

    return () => {
      const settings = ms.settings.settings;
      return (
        <QTable
          {...c`!bg-zinc-800 !text-zinc-200`}
          title="API-KEY"
          dark
          columns={[
            {
              name: "name",
              align: "left",
              label: "名称",
              field: "name",
              required: true,
            },
            {
              name: "source",
              align: "left",
              label: "类型",
              field: "source",
            },
            {
              name: "operation",
              align: "left",
              label: "操作",
            },
          ]}
          rows={settings.apikeys.keys.map((it) => ({
            name: it.name,
            source: it.source,
            key: it.key,
          }))}
          row-key="name"
          separator="horizontal"
          flat
          bordered
          rows-per-page-options={[0]}
        >
          {{
            bottom() {},
            body(props: { row: APIKey; rowIndex: number }) {
              return (
                <QTr key={props.row.id}>
                  <QTd {...c`frow items-center gap-4 !py-3 !h-[66px]`} key="name">
                    <QBadge
                      {...cl(props.rowIndex == 0 ? "" : "bg-zinc-500")}
                      rounded
                    ></QBadge>
                    <div>{props.row.name}</div>
                    <QTooltip>
                      {props.rowIndex == 0 ? "正在使用" : "未启用"}
                    </QTooltip>
                  </QTd>
                  <QTd {...c`!max-h-[66px]`} key="source">{props.row.source}</QTd>
                  <QTd {...c`frow gap-x-3 !h-[66px] !py-3 items-center border-b`} key="operation">
                    <BetterBtn
                      class="min-w-[5.3rem] bg-_primary bg-opacity-90 text-zinc-200"
                      onClick={() => {
                        ctx.emit("show_editor", props.rowIndex);
                      }}
                    >
                      <div class="frow gap-2 items-center justify-center">
                        <QIcon name="mdi-pencil" size="1.2rem"></QIcon>
                        <div>编辑</div>
                      </div>
                    </BetterBtn>
                    <BetterBtn
                      class="min-w-[5.3rem] bg-_negative2 bg-opacity-90 text-zinc-200"
                      onClick={() => {
                        ctx.emit("remove_apikey", props.rowIndex);
                      }}
                    >
                      <div class="frow gap-2 items-center justify-center">
                        <QIcon name="mdi-delete" size="1.2rem"></QIcon>
                        <div>删除</div>
                      </div>
                    </BetterBtn>
                    <QBtn
                      {...cl([
                        "text-_secondary text-opacity-90 bg-zinc-600 text-[0.75rem]",
                        props.rowIndex === 0 ? "hidden" : "",
                      ])}
                      icon="mdi-arrow-collapse-up"
                      unelevated
                      padding="0.5rem 0.5rem"
                      onClick={async () => {
                        ctx.emit("to_top", props.rowIndex);
                      }}
                    ></QBtn>
                  </QTd>
                </QTr>
              );
            },
          }}
        </QTable>
      );
    };
  },
});
