import { defineComponent } from "vue";

export const SeparatorLB = defineComponent({
  setup() {
    return () => <div class="border-t border-zinc-700"></div>;
  },
});