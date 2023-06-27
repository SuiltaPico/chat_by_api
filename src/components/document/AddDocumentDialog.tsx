import { defineComponent, ref, shallowRef } from "vue";
import {
  any,
  as_emits,
  as_props,
  c,
  call,
  refvmodel_type,
} from "../../common/utils";
import use_main_store from "../../store/memory/main_store";
import { Document } from "../../interface/Document";
import { QBtn, QDialog, QFile, QIcon, QInput } from "quasar";
import BetterBtn from "../common/BetterBtn";
import { EditorLite } from "../common/EditorLite";
import { tpl } from "../../common/jsx_utils";

type AddDocumentDialogProps = {
  modelValue: boolean;
};

type AddDocumentDialogEmits = {
  "update:modelValue": (
    new_value: AddDocumentDialogProps["modelValue"]
  ) => void;
  submit: (documents: Document[]) => void;
};

export const AddDocumentDialog = defineComponent<
  AddDocumentDialogProps,
  {},
  {},
  {},
  {},
  {},
  {},
  AddDocumentDialogEmits
>({
  props: as_props<AddDocumentDialogProps>()(["modelValue"]),
  emits: as_emits<AddDocumentDialogEmits>()(["update:modelValue", "submit"]),
  setup(props, ctx) {
    const ms = use_main_store();
    const stages = {
      "select mode": SelectModeStage,
    };
    const stage = shallowRef(stages["select mode"]);

    return () => {
      const CurrStage = stage.value;
      return (
        <QDialog
          {...c`add_d_dialog`}
          modelValue={props.modelValue}
          onUpdate:modelValue={(value) => {
            ctx.emit("update:modelValue", value);
          }}
        >
          <CurrStage></CurrStage>
        </QDialog>
      );
    };
  },
});

export const SelectModeStage = defineComponent({
  setup(props, ctx) {
    return () => {
      return <div class="wraper"></div>;
    };
  },
});

export const ImportText = defineComponent({
  setup(props, ctx) {
    const ms = use_main_store();
    const file = ref();

    return () => {
      return (
        <div class="select_mode_item select_text_mode">
          <div class="title">
            <QIcon name="mdi-text"></QIcon>
            <div>导入文本</div>
          </div>
          <EditorLite
            modelValue={""}
            dark
            filled
            autogrow
            {...any({ placeholder: "在此处输入文本" })}
          ></EditorLite>
          <section class="fcol gap-4">
            <div class="title">
              <QIcon name="mdi-file"></QIcon>
              <div>从文件导入</div>
            </div>
            <div class="frow gap-4">
              <QFile
                {...c`grow`}
                dark
                filled
                label="选择文件，或拖拽文件至此处"
              >
                {{
                  prepend: () => <QIcon name="mdi-file-document"></QIcon>,
                }}
              </QFile>
              <QInput dark filled {...any({ placeholder: "此处可粘贴文件" })}>
                {{
                  prepend: () => (
                    <QIcon name="mdi-clipboard-file-outline"></QIcon>
                  ),
                }}
              </QInput>
            </div>
          </section>
          <section class="fcol gap-4">
            <div class="title">
              <QIcon name="mdi-web"></QIcon>
              <div>从网络上加载文件</div>
            </div>
            <div class="frow items-center gap-4">
              <QInput
                {...c`grow`}
                dark
                filled
                {...any({ placeholder: "在此处输入文件网址" })}
                hint={call(() => {
                  if (ms.client_info.framework === "browser") {
                    return "受同源策略的影响，没有允许跨域访问的文件将无法加载。客户端没有这个限制。";
                  }
                })}
              ></QInput>
              <BetterBtn class="bg-_primary bg-opacity-90">
                <QIcon name="mdi-file-download"></QIcon>
                <div>加载</div>
              </BetterBtn>
            </div>
          </section>
          <div>
            <div class="frow items-center gap-3 grow"></div>
          </div>
        </div>
      );
    };
  },
});

export const ImportImage = defineComponent({
  setup(props, ctx) {
    const file = ref();

    return () => {
      return (
        <div class="select_mode_item select_image_mode">
          <div class="title">
            <QIcon name="mdi-image"></QIcon>
            <div>以图片创建</div>
          </div>
          <QInput
            modelValue={""}
            dark
            filled
            {...any({
              placeholder: "在此处粘贴图片",
              onpaste: async (e: ClipboardEvent) => {
                console.log(e.clipboardData?.getData("text"));
                console.log(e.clipboardData?.files);
              },
            })}
          ></QInput>
          <div>
            <BetterBtn>上传文件</BetterBtn>
          </div>
          <div>预览</div>
        </div>
      );
    };
  },
});
