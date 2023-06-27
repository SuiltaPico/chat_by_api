import { chain } from "lodash";
import { QItem, QSelect } from "quasar";
import { computed, defineComponent, toRef } from "vue";
import { QSelectOptionSlotParam } from "../../../../../common/quasar_utils";
import { ElementOfArray, cl, slot } from "../../../../../common/utils";
import { RoleWithoutUnknown } from "../../../../../interface/ChatRecord";
import use_main_store from "../../../../../store/memory/main_store";
import { Avatar } from "../../../../chat/MessageItem/Avatar";

export const AddModeToolbar = defineComponent({
  setup() {
    const ms = use_main_store();

    const _role = toRef(ms.chat_body_input, "role");

    const raw_roles = {
      user: {
        description: "用户，一般情况下与助理对话的对象。",
      },
      assistant: {
        description: "助理，即语言模型自己。",
      },
      system: {
        description: "系统，可以定义助理的行为。",
      },
    } as const satisfies Record<RoleWithoutUnknown, { description: string }>;

    const roles = chain(raw_roles)
      .map((value, key) => ({
        label: key as RoleWithoutUnknown,
        value: key as RoleWithoutUnknown,
        description: value.description,
      }))
      .value();

    const role = computed(() => roles.find((v) => v.value == _role.value));

    function em_text(em: boolean) {
      return em ? "text-primary" : "";
    }

    return () => {
      return (
        <QSelect
          modelValue={role.value}
          onUpdate:modelValue={(r) => {
            _role.value = r.value;
          }}
          label="身份"
          options={roles}
          color="secondary"
          dark
          dense
          filled
        >
          {{
            ...slot(
              "option",
              (item: QSelectOptionSlotParam<ElementOfArray<typeof roles>>) => {
                return (
                  <QItem
                    {...cl([
                      `frow items-center gap-3 text-sm p-4`,
                      em_text(item.selected),
                    ])}
                    focused={item.selected}
                    clickable
                    onClick={() => {
                      item.toggleOption(item.opt);
                    }}
                  >
                    <Avatar role={item.label}></Avatar>
                    <div class="fcol">
                      <div>{item.label}</div>
                      <div class={["text-zinc-400", em_text(item.selected)]}>
                        {item.opt.description}
                      </div>
                    </div>
                  </QItem>
                );
              }
            ),
          }}
        </QSelect>
      );
    };
  },
});
