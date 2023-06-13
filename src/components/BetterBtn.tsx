import { QBtn } from "quasar";
import { defineComponent } from "vue";
import { insert_slot } from "../common/jsx_utils";
import { any, as_props } from "../common/utils";

type BetterBtnProps = {
  color?: string;
};

export default defineComponent<
  BetterBtnProps,
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
  props: as_props<BetterBtnProps>()(["color"]),
  emits: ["click"],
  setup(props, ctx) {
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
          color={props.color}
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
