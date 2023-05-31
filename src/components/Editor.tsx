import monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { as_props } from "../common/utils";
import { defineComponent, onMounted, ref } from "vue";

/** @ts-ignore */
self.MonacoEnvironment = {
  getWorker: async function (_: string, label: string) {
    if (label === "json") {
      return new (
        await import("monaco-editor/esm/vs/language/json/json.worker?worker")
      ).default();
    }
    return new editorWorker();
  },
};

// monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

export interface EditorCompoAPI {
  change_value(value: string): false | undefined;
  force_set_value(value: string): false | undefined;
  change_lang(value: string): false | undefined;
  set_readonly(readonly: boolean): false | undefined;
}

interface EditorProps {
  init_theme?: string;
  init_language?: string;
  init_readonly?: boolean;
}

export default defineComponent<
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
    let editor_container_ref = ref<HTMLDivElement>();
    let editor: undefined | monaco.editor.IStandaloneCodeEditor;

    onMounted(() => {
      editor = monaco.editor.create(editor_container_ref.value!, {
        language: props.init_language ?? "",
        theme: props.init_theme ?? "vs-dark",
        automaticLayout: true,
        readOnly: props.init_readonly ?? false,
      });
      editor.onDidChangeModelContent(() => {
        ctx.emit("update:content", editor!.getModel()!.getValue());
      });
    });

    defineExpose({
      change_value(value) {
        const model = editor?.getModel();
        if (!model) return false;

        model.applyEdits([
          {
            range: model.getFullModelRange(),
            text: value,
          },
        ]);
      },
      force_set_value(value) {
        const model = editor?.getModel();
        if (!model) return false;

        model.setValue(value);
      },
      change_lang(language) {
        const model = editor?.getModel();
        if (!model) return false;

        monaco.editor.setModelLanguage(model, language);
      },
      set_readonly(readonly) {
        if (!editor) return false;

        editor.updateOptions({
          readOnly: readonly,
        });
      },
    } as EditorCompoAPI);
    return () => (
      <div
        {...ctx.attrs}
        ref="editor_container_ref"
        onClick={(e) => ctx.emit("update:click", e)}
      ></div>
    );
  },
});
