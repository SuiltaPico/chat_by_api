// import { editor as monaco_editor } from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { defineComponent, onMounted, ref } from "vue";
import { as_props } from "../../common/utils";
import { QInnerLoading } from "quasar";
import { tpl } from "../../common/jsx_utils";

/** @ts-ignore */
self.MonacoEnvironment = {
  getWorker: async function (_: string, label: string) {
    return new editorWorker();
  },
};

const monaco_promise = import("monaco-editor");

// monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

export interface EditorCompoAPI {
  change_value(value: string): false | undefined;
  get_value(): string;
  force_set_value(value: string): false | undefined;
  change_lang(value: string): Promise<false | undefined>;
  set_readonly(readonly: boolean): false | undefined;
}

interface EditorProps {
  init_theme?: string;
  init_language?: string;
  init_readonly?: boolean;
}

export const Editor = defineComponent<
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
    let editor:
      | undefined
      | import("monaco-editor").editor.IStandaloneCodeEditor;

    onMounted(async () => {
      const monaco = await monaco_promise;
      editor = monaco.editor.create(editor_container_ref.value!, {
        language: props.init_language ?? "",
        theme: props.init_theme ?? "vs-dark",
        // automaticLayout: true,
        readOnly: props.init_readonly ?? false,
        wordWrap: "wordWrapColumn",
      });
      editor.onDidChangeModelContent(() => {
        ctx.emit("update:content", editor!.getModel()!.getValue());
      });

      window.addEventListener("resize", () => editor?.layout());
    });

    ctx.expose({
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
      async change_lang(language) {
        const model = editor?.getModel();
        if (!model) return false;

        const monaco = await monaco_promise;

        monaco.editor.setModelLanguage(model, language);
      },
      set_readonly(readonly) {
        if (!editor) return false;

        editor.updateOptions({
          readOnly: readonly,
        });
      },
      get_value() {
        if (!editor) return "";
        return editor.getModel()!.getValue();
      },
    } as EditorCompoAPI);
    return () => tpl(
      <div
        {...ctx.attrs}
        ref={editor_container_ref}
        onClick={(e) => ctx.emit("update:click", e)}
      >
      </div>
    );
  },
});
