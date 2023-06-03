export default [
  {
    version: "2.4.0",
    content: `
### Added
* 新增多选模式。
    * 新增删除功能。
### Changed
* 针对小屏幕宽度情况优化了对话记录删除前确认浮窗的操作。
`,
  },
  {
    version: "2.4.0-alpha",
    content: `
### Added
* 新增对话记录删除前确认浮窗。
### Changed
* 优化了对话记录的 Markdown 代码块行内渲染结果。
### Fixed
* 修复了移动端下查看对话记录信息时出现的渲染异常问题。
`,
  },
  {
    version: "2.3.0",
    content: `
### Added
* 新增其它网站的 API-KEY 的支持。
### Changed
* 针对宽度小于 \`480px\` 的设备进行进一步的界面优化。
* 优化了 API-KEY 设置的交互体验。
* OpenAI 相关的设置已取消，需要重新在 API-KEY 上设置。
### Fixed
* 修复了重新生成时，旧的错误仍然滞留的问题。
`,
  },
  {
    version: "2.2.0",
    content: `
### Added
* 可以通过 url \`open_ai\` query 写入 OpenAI key。
* 新增配额不足和 API-KEY 无效的报错信息。
`,
  },
  {
    version: "2.1.0",
    content: `
### Added
* 新增发送消息的快捷键支持。
* 新增页面主题色元信息。
* 新增页面描述元信息。
### Changed
* 针对宽度小于 \`480px\` 的设备进行界面优化。
### Fixed
* 修复了打开了已删除的对话链接没有跳转到新对话页面的问题。
`,
  },
  {
    version: "2.0.3",
    content: `
### Fixed
* 修复了类型错误，无法编译的问题。
`,
  },
  {
    version: "2.0.2",
    content: `
### Fixed
* 修复了重新生成时出现的内容覆写的问题。
* 修复了对话中错误出现时，错误会写入到别的对话的问题。
`,
  },
  {
    version: "2.0.1",
    content: `
### Changed
* 所有错误容器都会附加一个重新生成的按钮。
### Added
* 新增滚到页面最下方的按钮。
* 新增后台生成支持。
* 新增重新生成生成支持。
### Fixed
* 修复了在宽度为 1024 左右的时候出现的输入框宽度溢出问题。
* 修复了生成时如果切换页面会出现内容错乱的问题。
* 修复了报错时间距错误的问题。
`,
  },
  {
    version: "2.0.0-alpha",
    content: `
### Changed
* 更新日志采用 [Keep a Changelog v1.1.0](https://keepachangelog.com/en/1.1.0/)
* 版本号采用 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。
* 界面小范围重构。
### Added
* 更好的代码块支持
### Fixed
* 修复了 Markdown 渲染的 token 遗漏的问题。
### Tips
因为是加急更新，很多新增功能无法使用。
`,
  },
  {
    version: "1.0.1",
    content: `
* 代码块界面改善。
* 有序和无序列表显示改善。
* 修复了 \`.mdblock\` 出现异常滚动条的问题。
`,
  },
  {
    version: "1.0.0",
    content: `
* 优化了模型选项的表现。
* 优化了数据库的写入模式。
* 极大地优化了储存模式，放弃了以往的所有修订版本。
* 修复了有序和无序列表的显示问题。
* 为代码块添加了行号和复制按钮
`,
  },
  {
    version: "0.3.1",
    content: `
* 将模型选项移动到了选项面板下。修复了移动端下输入框排版移除的问题。
* 更新了项目信息和 \`README.md\`
* 增加了源码的链接
`,
  },
  {
    version: "0.3.0",
    content: `
* 增加了温度、存在惩罚、重复惩罚、最大 token 数的设置。
* 增加了对话记录的添加功能。
* 优化了对话记录项标题的渲染。
`,
  },
  {
    version: "0.2.3",
    content: `
* 加速了主页面的加载速度。
`,
  },
  {
    version: "0.2.2",
    content: `
* 增加设置页面的移动端适配。
* 修复了移动端下按钮行为异常的问题。
* 修复了移动端下点击对话中“更多”按钮时出现的异常界面。
* 点击“导入到文本框”按钮会自动聚焦输入框。
`,
  },
  {
    version: "0.2.1",
    content: `
* 增加了更好的模型过载的错误提示。
* 增加了移动端适配（标题栏、对话输入和展示）
`,
  },
  {
    version: "0.2.0",
    content: `
* 增加了删除功能。
* 加速了聊天页面加载速度（取而代之的是更慢的网站启动速度）。
`,
  },
  {
    version: "0.1.4",
    content: `
* 点击聊天窗口的头像可以切换身份。
`,
  },
  {
    version: "0.1.3",
    content: `
* 修复了切换页面渲染滞留。
* 更更人性化的聊天窗口滚动。
* 修复了文本生成时不能在编辑器编辑的 bug。
* 修复了首次对话的时候输入框不会清空的 bug。
* 增加了更多错误情况的描述文本。
* 更函数式编程了（？）
* 修复了 \`<li>\` 使用 \`display: flex;\` 导致的错误排版。
`,
  },
  {
    version: "0.1.2",
    content: `
* 更人性化的聊天窗口滚动
* 更人性化的复制提醒
`,
  },
  {
    version: "0.1.1",
    content: `
* 增加了设置的 OpenAI 的 baseurl、api_version 选项。
* 修复了排版错误。
* 增加了生成时连接中断的报错提示。
        `,
  },
  {
    version: "0.1.0",
    content: `
* 小重构了chat页面，修复了“错误提示”错误的问题。
* 添加了服务端消息的复制和用户消息的引入到输入框。
* 添加了 LICENSE，随便选了个 AGPL v3。
* 添加了预导入 ChatGPT 图标的，不然每次打开 chat 页面，ChatGPT 图标都要卡一下。
* 瞎折腾一下午我也不记得加了些什么了，，
        `,
  },
  {
    version: "0.0.0",
    content: `忘记干了什么了，反正是踩了很多 vue-tsx 的坑。`,
  },
] satisfies {
  version: string;
  content: string;
}[];
