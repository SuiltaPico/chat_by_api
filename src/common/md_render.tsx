import MarkdownIt from "markdown-it";
// import markdown_it_highlightjs from "markdown-it-highlightjs";
import hljs from "highlight.js";
import markdown_it_katex from "@vscode/markdown-it-katex";
import { isNil, range } from "lodash";
import {
  VNode,
  VNodeArrayChildren,
  createCommentVNode,
  createTextVNode,
  createVNode,
} from "vue";
import Token from "markdown-it/lib/token";
import { QBtn, useQuasar } from "quasar";
import { c, call } from "./utils";
import copy from "copy-text-to-clipboard";
import { copy_with_notify } from "./quasar_utils";

export function htmlToVNodes(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const result = [];
  const children = template.content.children;
  for (let index = 0; index < children.length; index++) {
    const child = children[index];
    result.push(nodeToVNode(child));
  }
  return result;
}

function nodeToVNode(node: Element | null): VNode {
  if (isNil(node)) return createCommentVNode();

  if (node.nodeType === Node.TEXT_NODE)
    return createTextVNode(node.textContent ?? "");

  const attrs: { [key: string]: string } = {};
  for (let index = 0; index < node.attributes.length; index++) {
    const attr = node.attributes[index];
    attrs[attr.name] = attr.value;
  }
  const children = [];
  for (let index = 0; index < node.childNodes.length; index++) {
    const child = node.childNodes[index];
    children.push(nodeToVNode(child as Element));
  }

  return createVNode(node.tagName.toLowerCase(), attrs, children);
}

export function highlight(src: string, lang: string) {
  let code,
    render_lang = "",
    /** 语言是否为自动推导的 */
    maybe_lang = false;
  try {
    // 判断语言是否已知
    const hl_lang = hljs.getLanguage(lang);
    if (hl_lang === undefined) throw 0;

    const result = hljs.highlight(src, {
      language: lang,
      ignoreIllegals: true,
    });

    render_lang = result.language ?? "";
    code = result.value;
  } catch {
    maybe_lang = true;

    const result = hljs.highlightAuto(src);

    render_lang = result.language ?? "";
    code = result.value;
  }
  const line_count = [...src.matchAll(/\n|(\r\n)|\r/g)].length;
  const auto_detection_slot = call(() => {
    if (render_lang === "" || maybe_lang === false) {
      return "";
    }
    return "?";
  });
  return `<pre class="hljs"><div class="header">${render_lang}${auto_detection_slot}</div><div class="container"><div class="hl_line_number">${range(
    line_count
  )
    .map((n) => `<div>${n}</div>`)
    .join("")}</div><code>${code}</code></div></pre>`;
}

function fence_token_to_VNode(t: Token, md: MarkdownIt) {
  const fence_node = htmlToVNodes(md.renderer.render([t], md.options, {}))[0];

  const qs = useQuasar();

  (fence_node.children as VNodeArrayChildren).push(
    <div class="btn_group">
      <QBtn
        {...c`text-zinc-500 hover:text-zinc-400`}
        // icon="mdi-content-copy"
        label="复制"
        size="0.8rem"
        padding="0.4rem 0.8rem"
        unelevated
        onClick={() => copy_with_notify(qs, t.content)}
      ></QBtn>
      {/* <QBtn
        {...c`text-zinc-500 hover:text-zinc-400`}
        icon="mdi-fullscreen"
        size="0.9rem"
        padding="0.6rem 0.7rem"
        unelevated
      ></QBtn> */}
    </div>
  );

  return fence_node;
}

export const create_md = () => {
  const md = new MarkdownIt({
    html: false,
    highlight,
  });
  md.renderer.render;
  md.use(markdown_it_katex, {
    displayMode: "html",
    throwOnError: false,
  });
  return {
    md,
    render(src: string) {
      const result: VNode[] = [];
      let cache: Token[] = [];
      const tokens = md.parse(src, {});

      tokens.forEach((t) => {
        if (t.type !== "fence") {
          cache.push(t);
          return;
        }
        result.push(...htmlToVNodes(md.renderer.render(cache, md.options, {})));
        cache = [];

        result.push(fence_token_to_VNode(t, md));
      });

      if (cache.length > 0) {
        result.push(...htmlToVNodes(md.renderer.render(cache, md.options, {})));
      }

      return result;
    },
    render_as_fence(src: string) {
      const token = md.parse("```markdown\n\n````", {})[0];
      token.content = `${src}\n`;
      return fence_token_to_VNode(token, md);
    },
  };
};
