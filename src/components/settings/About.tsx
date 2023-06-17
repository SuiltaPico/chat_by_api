import { QBtn } from "quasar";
import { defineComponent } from "vue";
import update_log from "../../common/update_log";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
  html: false,
});

export const About = defineComponent({
  setup() {
    return () => (
      <div class="fcol gap-5">
        <div class="text-xl font-bold">关于</div>
        <div class="fcol gap-2">
          <div class="frow gap-2">
            <div class="text-md font-bold">版本</div>
            <div>{update_log[0].version}</div>
          </div>
          <details open>
            <summary>源代码</summary>
            <div class="fcol gap-4 m-2">
              <div>
                <QBtn
                  icon="mdi-github"
                  size="1rem"
                  flat
                  href="https://github.com/SuiltaPico/chat_by_api"
                ></QBtn>
              </div>
            </div>
          </details>
          <details open>
            <summary>这个网站安全吗？</summary>
            <div class="fcol gap-4 m-2">
              <div>
                <b>是的</b>。这个网站其实就是一个本地的
                APP，你的个人信息只会储存在你的浏览器缓存里。网站的源码会一直保证开放，如果你认为存疑，请亲自检查和构建。
              </div>
            </div>
          </details>
          <details open>
            <summary>注意事项</summary>
            <ol class="m-2">
              <li>
                因为这个应用依赖浏览器缓存进行数据存储，所以清理浏览器缓存之前，请记得备份数据。
              </li>
            </ol>
          </details>
          <details class="frow gap-2">
            <summary>更新日志</summary>
            <div class="p-4">
              {update_log.map((it) => (
                <div>
                  <div class="font-bold">{it.version}</div>
                  <div class="p-2" v-html={md.render(it.content)}></div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    );
  },
});
