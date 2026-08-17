# BestShopio SaaS 中台 — 原型

SaaS 中台（Platform Center）的可点击原型。中台是所有店铺/站点共享基础数据（菜单、权限、商品分类、账号）的统一维护端 + 分发中枢。它与商家后台属于同一 BestShopio 平台中的两套独立使用界面和原型仓库。

## 产品边界

该中台面向 BestShopio 平台运营人员，而不是普通 BestShopio 或 BestCheckout 商家。它负责租户、店铺生命周期、Provisioning、平台权限、公共配置、Domain/SSL 状态和运营治理。

BestCheckout 可以复用底层店铺和平台服务，但其商家独立后台不应暴露本中台的内部运维概念。

- **在线预览**：https://zjc66666-pm.github.io/bestshopio-saas-prototype/
- **登录页**：[signin.html](signin.html)（演示用，提交直接进入中台）

## 说明

- 纯静态 HTML/JS 原型，无后端；数据来自 `js/data.js`。
- 复用商家后台同一套设计系统（`assets/theme.css`），保证两端视觉一致。
- 这是迁移后的独立正式原型目录；历史 `prototypes/platform/` 仍保留在 Workspace 中供协作核对。

## 页面源码与前端交接

原型保留一个 `index.html` 作为应用壳和 Hash 路由入口，但业务实现按页面模块收口，不把所有页面继续堆进入口文件。页面路由与 Next.js Pages Router 的映射见 [js/pages/README.md](js/pages/README.md)。

## 商家后台原型（另一套，独立链接）

https://zjc66666-pm.github.io/bestshopio-prototypes/

## GitHub

- 仓库：`zjc66666-pm/bestshopio-saas-prototype`
- 分支：`main`
- GitHub Pages：`https://zjc66666-pm.github.io/bestshopio-saas-prototype/`
