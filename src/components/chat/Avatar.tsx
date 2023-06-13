import { cond, constant, eq, partial, stubTrue } from "lodash";
import { QIcon } from "quasar";
import { defineComponent } from "vue";
import { any, c, cl } from "../../common/utils";
import { Role } from "../../interface/ChatRecord";

export const Avatar = defineComponent({
  props: ["role"],
  emits: ["update:role"],
  setup(props: { role: Role }, ctx) {
    const part_eq = function <T>(a: T) {
      return partial(eq, a);
    };
    const next = cond<Role, Role>([
      [part_eq("user"), constant("assistant")],
      [part_eq("assistant"), constant("system")],
      [part_eq("system"), constant("user")],
      [stubTrue, constant("user")],
    ]);
    const emit_attr = any({
      onClick: () => {
        ctx.emit("update:role", next(props.role));
      },
    });

    return () => {
      const { role } = props;
      const { attrs } = ctx;
      function gen_icon(icon: string, _class?: string) {
        return (
          <QIcon
            {...cl(["Avatar", _class ?? ""])}
            {...attrs}
            {...emit_attr}
            name={icon}
            size="1.25rem"
          ></QIcon>
        );
      }
      if (role === "user") {
        return gen_icon("mdi-account");
      } else if (role === "assistant") {
        return (
          <div {...c`Avatar h-fit`} {...attrs} {...emit_attr}>
            <img
              src="/ChatGPT.svg"
              alt=""
              class="min-w-[1.25rem] min-h-[1.25rem] max-w-[1.25rem]"
            />
          </div>
        );
      } else if (role === "system") {
        return gen_icon("mdi-laptop", "Avatar_system");
      } else {
        return gen_icon("mdi-help-box-outline");
      }
    };
  },
});
