import { defineComponent } from "vue";
import { DocumentMeta } from "../../interface/Document";
import { as_emits, as_props } from "../../common/utils";
import use_main_store from "../../store/memory/main_store";
import { QItem } from "quasar";

type DocumentItemProps = {
  document_meta: DocumentMeta;
};

type DocumentItemEmits = {
  // "update:modelValue": (new_value: CompoProps["modelValue"]) => void;
};

export const DocumentItem = defineComponent<
  DocumentItemProps,
  {},
  {},
  {},
  {},
  {},
  {},
  DocumentItemEmits
>({
  props: as_props<DocumentItemProps>()(["document_meta"]),
  emits: as_emits<DocumentItemEmits>()([]),
  setup(props, ctx) {
    const ms = use_main_store();

    return () => {
      return (
        <div class="fcol bg-zinc-600 p-4 rounded">
          <div class="text-zinc-100">{props.document_meta.name}</div>
          <div>内容：{props.document_meta.name}</div>
        </div>
      );
    };
  },
});
