import { QPage } from "quasar";
import { defineComponent } from "vue";
import { c } from "../common/utils";
import { APIKEYManager } from "../components/settings/APIKEYManager/APIKEYManager";
import { About } from "../components/settings/About";
import { HotKeysManager } from "../components/settings/HotKeysManager";
import { Data } from "../components/settings/Data";
import { Behaviors } from "../components/settings/Behaviors";

export default defineComponent({
  setup() {
    return () => {
      return (
        <QPage {...c`frow default-bg text-zinc-200 justify-center p-4`}>
          <div class="fcol default-bg record-fit-width pt-8 gap-12">
            <HotKeysManager></HotKeysManager>
            <Behaviors></Behaviors>
            <APIKEYManager></APIKEYManager>
            <Data></Data>
            <About></About>
          </div>
        </QPage>
      );
    };
  },
});
