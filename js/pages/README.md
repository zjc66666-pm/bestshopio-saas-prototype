# 页面源码组织与前端交接

`index.html` 只承担静态原型的应用壳：基础资源、`#app` 容器和脚本加载顺序。它不是所有业务页面的实现文件。

全站 Hash 路由、当前原型来源和预期 Next.js 页面入口统一维护在 [route-manifest.js](route-manifest.js)。前端可以先按其中的 `nextRoute` 和 `targetModule` 建立 Pages Router 文件，再将对应的原型页面逐块替换为 React 组件。

## 页面模块约定

```text
js/pages/<domain>/
├── index.js                 # 当前域的路由分发
├── <page>.js                # 一个列表、详情或编辑页面
├── logic/                   # 纯业务规则、校验、格式化
├── components/              # 仅该域复用的复杂控件
├── mock-data.js             # 后续 API 的替换点
└── styles.css               # 仅该域的页面样式
```

对应的 Next.js 交接目标为：

```text
pages/<route>.tsx                    # 仅路由、SSR、重定向
src/pages/<module>/index.tsx         # 页面壳与区块组合
src/pages/<module>/view/             # 页面主区块
src/pages/<module>/components/       # 页面私有组件
src/pages/<module>/logic/mock-data.ts
src/pages/<module>/styles.module.less
```

## 当前状态

- `content/` 已按文章列表、文章详情/编辑、栏目列表/编辑、内容空间列表/编辑、内容模型和 Markdown 渲染拆开；它是后续模块的样板。
- 运营、账号、菜单、类目、归因和 BestCheckout 运维仍有历史实现位于 `js/ops.js`、`js/app.js` 或 `js/attribution.js`。`route-manifest.js` 已明确每一项应拆出的目标模块，避免前端需要反向猜测路由归属。
- 新增页面时，先新增页面模块和 manifest 条目；不要把新业务 UI 回填到 `index.html` 或继续膨胀共享壳。

## 静态原型与正式前端的边界

- 静态原型保留单入口，确保 GitHub Pages、本地预览和 `#/...` 链接稳定可用。
- 正式前端不复用 Hash 路由；按 `nextRoute` 落到 Next.js Pages Router。
- 原型数据目前仍在 `js/data.js`。接入真实接口时，先在 `src/server/<domain>/` 声明类型化服务，再由 SSR 或页面 store 调用，避免在 UI 中直写请求。
