import { defineComponent } from "vue";
import hj from "highlight.js";
import { QBtn, QIcon, QSpace } from "quasar";
import { as_props } from "../common/utils";

type ErrorContainerProps = { title?: string; content?: string; raw?: string };

export default defineComponent<
  ErrorContainerProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    regenerate: () => void;
  }
>({
  name: "ErrorContainer",
  props: as_props<ErrorContainerProps>()(["title", "content", "raw"]),
  emits: ["regenerate"],
  setup(props, ctx) {
    return () => {
      return (
        <div class="error_container gap-2">
          <div class="text-base font-bold">{props.title || "发生错误"}</div>
          <div>
            {props.content} {ctx.slots.default ? ctx.slots.default() : ""}
          </div>
          {props.raw != undefined ? (
            <details class="cursor-pointer">
              <div
                class="bg-zinc-900 p-4 cursor-auto"
                v-html={
                  hj.highlight(
                    props.raw
                      .replaceAll(",", ",\n")
                      .replaceAll("{", "{\n")
                      .replaceAll("}", "\n}"),
                    {
                      language: "json",
                    }
                  ).value
                }
              ></div>
            </details>
          ) : (
            ""
          )}
          <div class="frow mt-1">
            <QBtn
              color="primary"
              padding="0.55rem 1rem"
              unelevated
              onClick={() => {
                ctx.emit("regenerate");
              }}
            >
              <div class="frow items-center gap-2">
                <QIcon name="mdi-refresh" />
                <div>尝试重新生成</div>
              </div>
            </QBtn>
          </div>
        </div>
      );
    };
  },
});
