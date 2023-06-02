import { defineComponent } from "vue";
import hj from "highlight.js";
import { QBtn, QIcon, QSpace } from "quasar";
import { as_props } from "../common/utils";
import BetterBtn from "./BetterBtn";
import { insert_slot, not_undefined_or } from "../common/jsx_utils";

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
    // regenerate: () => void;
  }
>({
  name: "ErrorContainer",
  props: as_props<ErrorContainerProps>()(["title", "content", "raw"]),
  // emits: ["regenerate"],
  setup(props, ctx) {
    return () => {
      return (
        <div class="error_container gap-2">
          <div class="text-base font-bold">{props.title || "发生错误"}</div>
          <div>
            {props.content} {insert_slot(ctx.slots)}
          </div>
          {not_undefined_or(() => {
            if (props.raw != undefined)
              return (
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
              );
          })}
        </div>
      );
    };
  },
});
