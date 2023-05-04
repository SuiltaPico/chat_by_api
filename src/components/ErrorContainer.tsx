import { defineComponent } from "vue";
import hj from "highlight.js";

export default defineComponent({
  name: "ErrorContainer",
  props: ["title", "content", "raw"],
  setup(props: { title: string; content: string; raw: string }) {
    return () => {
      return (
        <div class="error_container gap-2">
          <div class="text-base font-bold">{props.title || "发生错误"}</div>
          <div>{props.content}</div>
          <details>
            <div
              class="bg-zinc-900 p-4"
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
        </div>
      );
    };
  },
});
