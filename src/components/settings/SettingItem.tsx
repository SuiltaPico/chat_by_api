import { defineComponent } from "vue";
import { call_or_comment } from "../../common/jsx_utils";
import { title } from "process";

export const SettingItemSection = defineComponent({
  setup(_, ctx) {
    return () => (
      <div class="section">{call_or_comment(ctx.slots.default)}</div>
    );
  },
});

export const Title = defineComponent({
  setup(_, ctx) {
    return () => <div class="title">{call_or_comment(ctx.slots.default)}</div>;
  },
});

export const SettingItem = defineComponent({
  setup: (_, ctx) => {
    return () => (
      <div class="settings_item">
        <Title>{call_or_comment(ctx.slots.title)}</Title>
        {call_or_comment(ctx.slots.default)}
      </div>
    );
  },
});

export function generate_SettingItem(title: string) {
  return defineComponent({
    setup(_, ctx) {
      return () => (
        <SettingItem>
          {{
            title: title,
            default: ctx.slots.default,
          }}
        </SettingItem>
      );
    },
  });
}
