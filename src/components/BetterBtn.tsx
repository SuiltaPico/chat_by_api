import { QBtn, QIcon } from "quasar";
import { defineComponent } from "vue";
import { Maybe, any, c } from "../common/utils";
import { insert_slot, not_undefined_or } from "../common/jsx_utils";

export default defineComponent<
  {},
  {},
  {},
  {},
  {},
  {},
  {},
  {
    click: (e: Event) => void;
  }
>({
  emits: ["click"],
  setup(__, ctx) {
    return () => {
      return (
        <QBtn
          {...any({
            class:
              "px-[0.8rem] pr-[1rem] py-[0.5rem] bg-_primary" +
              (ctx.attrs.class ?? ""),
          })}
          {...ctx.attrs}
          unelevated
          no-caps
          onClick={(e) => {
            ctx.emit("click", e);
          }}
        >
          <div class="frow gap-2 items-center justify-center">
            {insert_slot(ctx.slots)}
          </div>
        </QBtn>
      );
    };
  },
});
