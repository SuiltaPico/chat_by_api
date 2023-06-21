import { defineComponent } from "vue";
import { call_or_comment } from "../../common/jsx_utils";

export const SettingItemSection = defineComponent({
  setup(_, ctx) {
    console.log(ctx.slots.default);

    return () => (
      <div class="section">{call_or_comment(ctx.slots.default)}</div>
    );
  },
});

export const Title = defineComponent({
  setup(_, ctx) {
    console.log(ctx.slots.default);
    return () => <div class="title">{call_or_comment(ctx.slots.default)}</div>;
  },
});

export const SettingItem = defineComponent({
  setup: (_, ctx) => {
    console.log(ctx.slots.title);
    console.log(ctx.slots.default);
    return () => (
      <div class="settings_item">
        <Title>{call_or_comment(ctx.slots.title)}</Title>
        {call_or_comment(ctx.slots.default)}
      </div>
    );
  },
});
