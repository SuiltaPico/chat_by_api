import { defineComponent } from "vue";
import { SettingItem, SettingItemSection } from "./SettingItem";
import BetterBtn from "../common/BetterBtn";
import { QIcon } from "quasar";

export const Data = defineComponent({
  setup() {
    return () => {
      return (
        <SettingItem>
          {{
            title: () => "数据管理",
            default: () => (
              <SettingItemSection>
                <BetterBtn class="bg-zinc-600 text-zinc-300">
                  <QIcon name="mdi-database-export"></QIcon>
                  <div>数据导出</div>
                </BetterBtn>
                <BetterBtn class="bg-zinc-600 text-zinc-300">
                  <QIcon name="mdi-database-import"></QIcon>
                  <div>数据导入</div>
                </BetterBtn>
              </SettingItemSection>
            ),
          }}
        </SettingItem>
      );
    };
  },
});
