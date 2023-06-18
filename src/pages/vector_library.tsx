import { defineComponent } from "vue";
import use_main_store from "../store/main_store";
import { tpl } from "../common/jsx_utils";
import { QPage } from "quasar";
import { c } from "../common/utils";

export default defineComponent({
  setup(props) {
    const ms = use_main_store();
    return () => {
      return tpl(
        <QPage {...c`default-bg flex flex-col`}>
        </QPage>
      );
    };
  },
});