import { Teleport, defineComponent, ref } from "vue";
import use_main_store from "../store/memory/main_store";
import { tpl } from "../common/jsx_utils";
import { QIcon, QPage } from "quasar";
import { c, generate_random_name, refvmodel_type } from "../common/utils";
import { DocumentItem } from "../components/document/DocumentItem";
import BetterBtn from "../components/common/BetterBtn";
import { TopBar } from "../components/document/TopBar";
import { AddDocumentDialog } from "../components/document/AddDocumentDialog";

export default defineComponent({
  setup(props) {
    const ms = use_main_store();

    const show_add_document_dialog = ref(false);

    return () => {
      return tpl(
        <QPage {...c`default-bg fcol text-zinc-200 items-center page_dm`}>
          <div class="record-fit-width">
            <section class="fcol gap-6">
              <div class="text-lg">文档</div>
              <AddDocumentDialog
                {...refvmodel_type(show_add_document_dialog, "modelValue")}
              ></AddDocumentDialog>
              <div class="frow items-center gap-2">
                <BetterBtn
                  onClick={() => {
                    show_add_document_dialog.value = true;
                  }}
                >
                  <QIcon name="mdi-plus" size="1rem"></QIcon>
                  <div>添加新的文档</div>
                </BetterBtn>
                <BetterBtn
                  onClick={() =>
                    ms.push_to_db_task_queue(async () => {
                      await ms.documents.create({
                        type: "text",
                        name: generate_random_name(),
                        last_modified: Date.now(),
                        created: Date.now(),
                        content: generate_random_name(),
                        source: {
                          type: "Text",
                          row: 0,
                          col: 0,
                        },
                        links: [],
                        vectors: [],
                      });
                    })
                  }
                >
                  （内部测试）添加一个文档
                </BetterBtn>
              </div>
              <div class="frow gap-3 flex-wrap">
                {ms.documents.metas.map((it) => (
                  <DocumentItem document_meta={it} key={it.id}></DocumentItem>
                ))}
              </div>
            </section>
            <section>
              <div>文档集合</div>
            </section>
          </div>
          <Teleport to="#app_header_slot">
            <TopBar></TopBar>
          </Teleport>
        </QPage>
      );
    };
  },
});
