import { defineComponent } from "vue";
import use_main_store from "../../store/memory/main_store";
import { QBtn } from "quasar";

export const TopBar = defineComponent<{}, {}, {}, {}, {}, {}, {}, {}>({
  setup(props, ctx) {
    const ms = use_main_store();

    return () => {
      return (
        <div class="frow">
          <QBtn icon="mdi-magnify" unelevated></QBtn>
        </div>
      );
    };
  },
});
