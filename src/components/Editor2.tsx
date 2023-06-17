import { defineComponent, onMounted, ref } from "vue";
import { as_props, c } from "../common/utils";
import { tpl } from "../common/jsx_utils";
import { QEditor } from "quasar";
import { EditorCompoAPI } from "./Editor";

interface EditorProps {
  init_theme?: string;
  init_language?: string;
  init_readonly?: boolean;
}

export const Editor2 = defineComponent<
  EditorProps,
  {},
  {},
  {},
  {},
  {},
  {},
  {
    "update:content": (value: string) => void;
    "update:click": (value: MouseEvent) => void;
  }
>({
  props: as_props<EditorProps>()([
    "init_language",
    "init_readonly",
    "init_theme",
  ]),
  emits: ["update:content", "update:click"],
  setup(props, ctx) {
    const editor_container_ref = ref<QEditor>();
    const content = ref("");

    ctx.expose({
      change_value(value) {
        const model = editor_container_ref.value;
        if (!model) return false;

        content.value = value;
      },
      force_set_value(value) {
        const model = editor_container_ref.value;
        if (!model) return false;

        content.value = value;
      },
      async change_lang(language) {
        const model = editor_container_ref.value;
        if (!model) return false;
      },
      set_readonly(readonly) {
        return false;
      },
      get_value() {
        const model = editor_container_ref.value;
        if (!model) return false;
        return content.value;
      },
    } as EditorCompoAPI);
    return () => (
      <QEditor
        {...c`whitespace-pre-wrap overflow-y-scroll`}
        {...ctx.attrs}
        ref={editor_container_ref}
        definitions={{}}
        toolbar={[]}
        modelValue={content.value}
        onUpdate:modelValue={(it) => {
          content.value = it;
          ctx.emit("update:content", it);
        }}
        dark
      ></QEditor>
    );
  },
});
