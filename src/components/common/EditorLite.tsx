import { defineComponent, ref } from "vue";
import { as_props } from "../../common/utils";
import { EditorCompoAPI, EditorProps } from "./Editor";

export const EditorLite = defineComponent<
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
    const editor_container_ref = ref<HTMLTextAreaElement>();
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
        const model = editor_container_ref.value;
        if (!model) return false;

        model.readOnly = readonly;
      },
      get_value() {
        const model = editor_container_ref.value;
        if (!model) return false;
        return content.value;
      },
      focus() {
        const model = editor_container_ref.value;
        if (!model) return false;
        return model.focus();
      },
    } as EditorCompoAPI);
    return () => (
      <textarea
        class="bg-zinc-800 whitespace-pre-wrap overflow-y-scroll p-2 resize-none _editor_area focus:outline-none"
        {...ctx.attrs}
        ref={editor_container_ref}
        value={content.value}
        onInput={(e) => {
          if (!e || !e.target) return;
          content.value = (e.target as any).value;
          ctx.emit("update:content", (e.target as any).value);
        }}
      ></textarea>
    );
  },
});
