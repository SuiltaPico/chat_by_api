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
import { c } from "./utils";
import copy from "copy-text-to-clipboard";
import { copy_with_notify } from "./quasar_utils";

function htmlToVNode(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return nodeToVNode(template.content.children[0] as Element | null);
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

export const create_md = () => {
  const md = new MarkdownIt({
    html: false,
    highlight(src, lang) {
      const code = hljs.highlight(src, {
        language: lang,
        ignoreIllegals: true,
      }).value;
      const line_count = [...src.matchAll(/\n|(\r\n)|\r/g)].length;
      return `<pre class="hljs"><div class="hl_line_number">${range(line_count)
        .map((n) => `<div>${n}</div>`)
        .join("")}</div><code>${code}</code></pre>`;
    },
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
        result.push(htmlToVNode(md.renderer.render(cache, md.options, {})));
        cache = [];

        const fence_node = htmlToVNode(md.renderer.render([t], md.options, {}));

        const qs = useQuasar();

        (fence_node.children as VNodeArrayChildren).push(
          <div class="absolute top-4 right-4">
            <QBtn
              {...c`text-zinc-500 hover:text-zinc-400`}
              icon="mdi-content-copy"
              size="0.8rem"
              padding="0.7rem 0.8rem"
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
        result.push(fence_node);
      });

      if (cache.length > 0) {
        result.push(htmlToVNode(md.renderer.render(cache, md.options, {})));
      }

      return result;
    },
  };
};
