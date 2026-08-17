/* BestCheckout 运维台：BestShopio SaaS 的平台控制面。
   商家在 BestCheckout 中经营漏斗、页面、支付和增长；这里仅处理连接、
   运行门禁、回写、事件、协同和可追溯的安全动作。 */
(function () {
  'use strict';

  var D = window.DATA;
  var C = D.platformCenter;
  var O = D.bestcheckoutControl;
  var words = {
    'Shopify Integration Adapter': 'Shopify 接入服务', 'Products · orders · customers': '商品、订单与客户',
    '5 / 5 healthy': '5 / 5 正常', '1 delivery retry pending': '1 个事件等待重试', 'Delivery paused': '事件投递已暂停',
    'BestCheckout Hosted Checkout': 'BestCheckout 托管结账', 'Shopify native only': '仅 Shopify 原生结账',
    'Shopify native 15%': 'Shopify 原生对照组 15%', 'Shopify native 20%': 'Shopify 原生对照组 20%',
    'Shopify native 10%': 'Shopify 原生对照组 10%', 'Fallback before payment': '付款前安全回退',
    'No active deployment': '无可用部署快照', 'Shopify order #7821': 'Shopify 订单 #7821',
    'Shopify order #7718': 'Shopify 订单 #7718', 'Shopify order #3184': 'Shopify 订单 #3184',
    'Webhook wh_9012': '事件 wh_9012', 'Variant 4812': '商品变体 4812', 'Shopify access': 'Shopify 授权',
    'products/update': '商品更新事件', 'Catalog mapping': '商品目录映射', Authorization: '授权状态',
    'Retry budget reached after repeated 429 responses. Payload is retained for idempotent replay.': '多次触发限流后已达到重试上限；原始事件已保留，可按幂等规则重放。',
    'A published offer references a replaced Shopify variant. Merchant configuration remains unchanged until revalidated.': '已发布优惠引用了被替换的 Shopify 变体；在完成复核前，不会修改商家的经营配置。',
    'Authorization was revoked. New checkout traffic remains on Shopify native control.': '授权已撤销。新的结账流量保持在 Shopify 原生对照路径。',
    'Shopify accepted the key; projection acknowledgement timed out.': 'Shopify 已接收幂等键，但订单投影确认超时。',
    'Final order snapshot projected successfully.': '最终订单快照已成功投影。',
    'Offer acceptance and order update reconciled.': '优惠接受记录与订单更新已完成核对。',
    'Identity · connection · orders · analytics ready': '身份、连接、订单与分析数据已就绪',
    'Connection and assets retained; catalog mapping needs review': '连接与资产已保留，商品映射仍需复核',
    'Identity · connection · pages · payments references ready': '身份、连接、页面与支付引用已就绪',
    'Shopify reconnection required': '需要重新授权 Shopify', 'Variant mapping review': '商品变体映射复核',
    'Checkout domain article needs refresh': '结账域名文章需要更新', 'Jul 29, 10:03': '7月29日 10:03',
    'Jul 29, 09:48': '7月29日 09:48', 'Jul 29, 09:57': '7月29日 09:57', 'Jul 29, 09:31': '7月29日 09:31',
    'Merchant success': '商家成功', 'Commerce ops': '交易运营', Content: '内容运营'
  };

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function text(v) { return words[String(v)] || String(v == null ? '' : v).replace(/(\d+) min ago/g, '$1 分钟前').replace(/^(\d+) min$/g, '$1 分钟'); }
  function pc() { return window.PC; }
  function ico(name, size) { return pc().ico(pc().P[name], size || 16); }
  function toast(message) { pc().toast(message); }
  function route(hash) { location.hash = hash; }
  function getStore(id) { return C.stores.filter(function (s) { return s.id === id; })[0]; }
  function storeName(id) { var s = getStore(id); return s ? s.name : '平台内容'; }
  function find(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function status(value) {
    var v = String(value || '');
    var tone = /Healthy|Connected|Passed|Ready|Completed|Verified|Eligible|Active|Preserved/.test(v) ? 'green' :
      /Blocked|High|Reauthorization|Paused|Action required/.test(v) ? 'red' :
      /Review|Retryable|Merchant action|Waiting|In progress|Resolve|Open|Queued/.test(v) ? 'orange' : 'gray';
    var labels = { High: '高优先级', Medium: '中优先级', Low: '低优先级', Healthy: '正常', Connected: '已连接', Passed: '已通过', Ready: '已就绪', Completed: '已完成', Verified: '已验证', Eligible: '可升级', Active: '已生效', Preserved: '已保留', Blocked: '已阻止', 'Reauthorization needed': '需要重新授权', Paused: '已暂停', 'Action required': '需要处理', Review: '待复核', Retryable: '可重试', 'Merchant action': '需商户操作', 'Waiting for merchant': '等待商户', 'In progress': '处理中', 'Resolve first': '先解决问题', Open: '待处理', Queued: '已入队' };
    return '<span class="bcn-status bcn-status-' + tone + '"><span></span>' + esc(labels[v] || v) + '</span>';
  }
  function actionLabel(value) {
    var labels = { 'No action required': '无需操作', 'Review event delivery': '查看事件投递', 'Create merchant reconnection task': '创建商户重连任务', 'Merchant task created': '已创建商户任务', 'Queue replay': '创建重放任务', 'Open Store': '查看店铺', 'Create reconnection task': '创建重连任务', 'Queue idempotent retry': '创建幂等重试', 'View Store': '查看店铺', 'Send guided reconnection task': '记录商户重连指引', 'Coordinate replacement mapping': '记录映射协同', 'Open Content Center': '打开内容中心', 'Merchant-led upgrade conversation': '发起商户升级沟通', 'Finish catalog remediation': '完成目录修复' };
    return labels[value] || value;
  }
  function storeLink(id) { return '<a class="bcn-store-link" href="#/stores/' + esc(id) + '">' + esc(storeName(id)) + '</a>'; }
  function audit(action, scope, result) {
    C.audit.unshift({ at: 'Jul 29, 11:08', actor: 'ops.amy', action: action, scope: scope, result: result });
  }
  function demoNotice() {
    return '<div class="bcn-demo-notice">' + ico('info', 16) + '<span><strong>原型模式</strong>：这里创建诊断、协同、重试或审核任务；不会展示密钥，也不会直接改动真实 Shopify 授权、支付配置或付款中的结账流量。</span></div>';
  }
  function tabs(active) {
    var list = [
      ['overview', '运维总览'], ['connections', '接入健康'], ['routing', '发布与路由'],
      ['writebacks', '订单回写'], ['events', '事件与同步'], ['support', '支持与升级']
    ];
    return '<nav class="tabs bcn-tabs">' + list.map(function (x) {
      return '<a class="tab' + (x[0] === active ? ' active' : '') + '" href="#/bestcheckout/' + x[0] + '">' + x[1] + '</a>';
    }).join('') + '</nav>';
  }
  function title(title, sub, action) {
    return '<div class="pc-head"><div><div class="page-title">' + esc(title) + '</div><div class="pc-sub">' + esc(sub) + '</div></div><div class="pc-acts">' + (action || '') + '</div></div>';
  }
  function metric(label, value, detail, alert) {
    return '<div class="panel bcn-metric' + (alert ? ' bcn-metric-alert' : '') + '"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong><small>' + esc(detail) + '</small></div>';
  }
  function operationQueue() {
    var items = [];
    O.events.filter(function (x) { return x.status !== 'Completed'; }).forEach(function (x) {
      items.push({ priority: x.status === 'Merchant action' ? 'High' : 'Medium', storeId: x.storeId, title: x.subject, detail: x.detail, action: x.action, type: 'event', id: x.id });
    });
    O.writebacks.filter(function (x) { return x.state === 'Retryable'; }).forEach(function (x) {
      items.push({ priority: 'High', storeId: x.storeId, title: x.reference + ' 等待回写确认', detail: x.detail, action: 'Queue idempotent retry', type: 'writeback', id: x.id });
    });
    return items.slice(0, 4);
  }
  function queueRows(items) {
    return items.map(function (x) {
      return '<div class="bcn-queue-row"><div class="bcn-queue-priority">' + status(x.priority) + '</div><div class="bcn-queue-main"><strong>' + esc(text(x.title)) + '</strong><span>' + storeLink(x.storeId) + ' · ' + esc(text(x.detail)) + '</span></div><button class="btn btn-default" data-queue-type="' + esc(x.type) + '" data-queue="' + esc(x.id) + '">' + esc(actionLabel(x.action)) + '</button></div>';
    }).join('');
  }
  function overview() {
    var reviewConnections = O.connections.filter(function (x) { return x.sync !== 'Healthy'; }).length;
    var live = O.routes.filter(function (x) { return x.surface !== 'Shopify native only'; }).length;
    var replay = O.writebacks.filter(function (x) { return x.state === 'Retryable' || x.state === 'Queued'; }).length;
    var items = operationQueue();
    return title('BestCheckout 运维', '平台侧控制面：保证连接、发布门禁、订单回写与安全回退可观测；商家经营能力仍留在独立 BestCheckout 后台。', '<a class="btn btn-default" href="#/stores">店铺目录</a>') +
      demoNotice() +
      '<section class="bcn-metrics">' +
        metric('运行中的 BestCheckout 店铺', String(live), '由同一店铺主记录承载') +
        metric('需要关注的接入信号', String(reviewConnections), '授权、同步或 Webhook 信号') +
        metric('待回写队列', String(replay), '保留原始幂等键，不重复创建订单', replay > 0) +
        metric('安全回退保护', '100%', '异常在付款前保留 Shopify 原生路径') +
      '</section>' +
      '<section class="bcn-overview-grid"><div class="panel"><div class="bcn-panel-head"><div><div class="blk-title">优先运营队列</div><div class="blk-sub">从信号到任务：运营人员只能创建协调、重试或审核，不直接改商户正在运行的结账配置。</div></div><a class="btn btn-default" href="#/bestcheckout/events">查看事件</a></div><div class="bcn-queue">' + (items.length ? queueRows(items) : '<div class="bcn-empty-row">当前没有需要处理的运行事项。</div>') + '</div></div>' +
      '<aside class="panel card-pad bcn-boundary"><div class="blk-title">运维台的边界</div><div class="bcn-boundary-list"><div><strong>店铺是主记录</strong><span>Shopify 连接、域名、权益和 BestCheckout 运行状态都关联同一店铺。</span></div><div><strong>发布使用冻结快照</strong><span>这里只显示部署版本与门禁结果，不能从中台编辑漏斗或页面草稿。</span></div><div><strong>安全回退优先</strong><span>信号异常时，先保护付款前链路并保留 Shopify 原生控制组。</span></div></div></aside></section>' +
      '<section class="panel bcn-flow-card"><div class="bcn-panel-head"><div><div class="blk-title">平台处置路径</div><div class="blk-sub">将“看见异常”变成可审计、可协同、不会破坏交易连续性的行动。</div></div></div><div class="bcn-flow"><div><span>1</span><strong>检测</strong><small>连接、事件、发布、回写</small></div><i>→</i><div><span>2</span><strong>分流</strong><small>自动重试 / 商户任务 / 人工审核</small></div><i>→</i><div><span>3</span><strong>保护</strong><small>付款前安全回退与原生控制组</small></div><i>→</i><div><span>4</span><strong>记录</strong><small>审计、状态和下一步</small></div></div></section>';
  }
  function mobileCard(titleHtml, sub, fields, action) {
    return '<article class="bcn-mobile-card"><div class="bcn-mobile-head"><div><strong>' + titleHtml + '</strong><span>' + esc(text(sub)) + '</span></div></div><div class="bcn-mobile-facts">' + fields.map(function (f) { return '<div><span>' + esc(f[0]) + '</span><strong>' + f[1] + '</strong></div>'; }).join('') + '</div>' + (action ? '<div class="bcn-mobile-actions">' + action + '</div>' : '') + '</article>';
  }
  function mobileConnections() {
    return '<div class="bcn-mobile-list">' + O.connections.map(function (x) {
      return mobileCard(storeLink(x.storeId), text(x.adapter), [['授权', status(x.authorization)], ['同步', status(x.sync)], ['事件投递', esc(text(x.webhook))]], '<button class="btn btn-default" data-connection="' + esc(x.id) + '">' + esc(actionLabel(x.next)) + '</button>');
    }).join('') + '</div>';
  }
  function mobileRoutes() {
    return '<div class="bcn-mobile-list">' + O.routes.map(function (x) {
      return mobileCard(storeLink(x.storeId), text(x.surface), [['原生对照', esc(text(x.control))], ['发布门禁', status(x.gate)], ['安全路径', status(x.safety)]], '<button class="btn btn-default" data-route-gate="' + esc(x.id) + '">查看门禁</button>');
    }).join('') + '</div>';
  }
  function mobileWritebacks() {
    return '<div class="bcn-mobile-list">' + O.writebacks.map(function (x) {
      var action = x.state === 'Retryable' ? '<button class="btn btn-primary" data-writeback="' + esc(x.id) + '">创建幂等重试</button>' : '<button class="btn btn-default" data-store-open="' + esc(x.storeId) + '">查看店铺</button>';
      return mobileCard(esc(x.reference), text(x.target), [['店铺', storeLink(x.storeId)], ['幂等键', status(x.idempotency)], ['状态', status(x.state)], ['诊断', esc(text(x.detail))]], action);
    }).join('') + '</div>';
  }
  function mobileEvents() {
    return '<div class="bcn-mobile-list">' + O.events.map(function (x) {
      return mobileCard(storeLink(x.storeId), text(x.kind) + ' · ' + text(x.subject), [['状态', status(x.status)], ['尝试次数', esc(x.attempts)], ['诊断', esc(text(x.detail))]], '<button class="btn btn-default" data-event="' + esc(x.id) + '">' + esc(actionLabel(x.action)) + '</button>');
    }).join('') + '</div>';
  }
  function mobileSupport() {
    var cases = '<div class="bcn-mobile-list">' + O.support.map(function (x) { return mobileCard(esc(text(x.subject)), x.storeId ? storeName(x.storeId) : '内容中心', [['优先级', status(x.priority)], ['负责人', esc(text(x.owner))], ['状态', status(x.state)]], '<button class="btn btn-default" data-support="' + esc(x.id) + '">' + esc(actionLabel(x.next)) + '</button>'); }).join('') + '</div>';
    var upgrades = '<div class="bcn-mobile-list">' + O.upgrades.map(function (x) { return mobileCard(storeLink(x.storeId), '升级连续性检查', [['准备度', status(x.readiness)], ['检查结果', esc(text(x.continuity))], ['建议下一步', esc(actionLabel(x.next))]], '<button class="btn btn-default" data-upgrade-store="' + esc(x.storeId) + '">查看店铺</button>'); }).join('') + '</div>';
    return { cases: cases, upgrades: upgrades };
  }
  function connections() {
    var rows = O.connections.map(function (x) {
      return '<tr><td>' + storeLink(x.storeId) + '</td><td><div class="bcn-main-cell"><strong>' + esc(text(x.adapter)) + '</strong><span>' + esc(text(x.scopes)) + '</span></div></td><td>' + status(x.authorization) + '</td><td>' + status(x.sync) + '</td><td><span class="bcn-note">' + esc(text(x.webhook)) + '<br>检测于 ' + esc(text(x.checked)) + '</span></td><td><button class="btn btn-default" data-connection="' + esc(x.id) + '">' + esc(actionLabel(x.next)) + '</button></td></tr>';
    }).join('');
    return title('接入健康', '管理 Shopify Custom App 的授权与 Integration Adapter 的连接信号。Scopes、API 和 Webhook 属于平台连接；BestCheckout 主 UI 仍在 Shopify Admin 之外。') +
      demoNotice() + '<div class="panel bcn-table-wrap"><table class="tbl"><thead><tr><th>店铺</th><th>连接</th><th>授权</th><th>数据同步</th><th>事件投递</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' + mobileConnections() +
      '<div class="bcn-inline-note">凭证只以引用与状态呈现；不显示 provider secret、access token 或 webhook 签名。</div>';
  }
  function routing() {
    var rows = O.routes.map(function (x) {
      return '<tr><td>' + storeLink(x.storeId) + '</td><td><div class="bcn-main-cell"><strong>' + esc(text(x.surface)) + '</strong><span>' + esc(text(x.snapshot)) + '</span></div></td><td>' + esc(text(x.control)) + '</td><td>' + status(x.gate) + '</td><td>' + status(x.safety) + '</td><td><span class="bcn-note">' + esc(text(x.updated)) + '</span></td><td><button class="btn btn-default" data-route-gate="' + esc(x.id) + '">查看门禁</button></td></tr>';
    }).join('');
    return title('发布与路由', '显示已部署版本的运行门禁和安全路径。发布资产是冻结快照；中台不能改写商家的 Funnel、页面或支付路由。') +
      demoNotice() + '<div class="panel bcn-table-wrap"><table class="tbl"><thead><tr><th>店铺</th><th>运行面与部署快照</th><th>原生控制组</th><th>发布门禁</th><th>安全路径</th><th>最近评估</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' + mobileRoutes() +
      '<div class="bcn-inline-note">当授权撤销、Host 不安全或发布门禁失败时，平台只会创建安全处置审核；不对付款中的会话做强制切换。</div>';
  }
  function writebacks() {
    var rows = O.writebacks.map(function (x) {
      return '<tr><td><div class="bcn-main-cell"><strong>' + esc(x.reference) + '</strong><span>' + esc(text(x.target)) + '</span></div></td><td>' + storeLink(x.storeId) + '</td><td>' + status(x.idempotency) + '</td><td>' + status(x.state) + '</td><td><span class="bcn-note">' + esc(text(x.age)) + '<br>' + esc(text(x.detail)) + '</span></td><td>' + (x.state === 'Retryable' ? '<button class="btn btn-primary" data-writeback="' + esc(x.id) + '">创建幂等重试</button>' : '<button class="btn btn-default" data-store-open="' + esc(x.storeId) + '">查看店铺</button>') + '</td></tr>';
    }).join('');
    return title('订单回写', '追踪 BestCheckout 成功支付后向 Shopify 的订单投影。重试始终使用原幂等键，避免重复创建或重复收费。') +
      demoNotice() + '<div class="panel bcn-table-wrap"><table class="tbl"><thead><tr><th>BestCheckout 订单</th><th>店铺</th><th>幂等键</th><th>状态</th><th>诊断</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' + mobileWritebacks() +
      '<div class="bcn-inline-note">回写失败不改变原支付交易；由平台保存结果、投影状态和重试任务，商家端只获得清晰的处理进度。</div>';
  }
  function events() {
    var rows = O.events.map(function (x) {
      return '<tr><td>' + storeLink(x.storeId) + '</td><td><div class="bcn-main-cell"><strong>' + esc(text(x.kind)) + '</strong><span>' + esc(text(x.subject)) + '</span></div></td><td>' + status(x.status) + '</td><td>' + esc(x.attempts) + '</td><td><span class="bcn-note">' + esc(text(x.age)) + '<br>' + esc(text(x.detail)) + '</span></td><td><button class="btn btn-default" data-event="' + esc(x.id) + '">' + esc(actionLabel(x.action)) + '</button></td></tr>';
    }).join('');
    return title('事件与同步', '集中处理 Adapter 的异步信号、目录映射和 Webhook 交付。商户的 Offer 规则不会在未完成校验前被平台自动改写。') +
      demoNotice() + '<div class="panel bcn-table-wrap"><table class="tbl"><thead><tr><th>店铺</th><th>事件 / 资源</th><th>状态</th><th>尝试次数</th><th>诊断</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' + mobileEvents();
  }
  function support() {
    var mobile = mobileSupport();
    var caseRows = O.support.map(function (x) {
      var link = x.storeId ? storeLink(x.storeId) : '<a class="bcn-store-link" href="#/content">内容中心</a>';
      return '<tr><td>' + status(x.priority) + '</td><td><div class="bcn-main-cell"><strong>' + esc(text(x.subject)) + '</strong><span>' + link + '</span></div></td><td>' + esc(text(x.owner)) + '</td><td>' + status(x.state) + '</td><td><button class="btn btn-default" data-support="' + esc(x.id) + '">' + esc(actionLabel(x.next)) + '</button></td></tr>';
    }).join('');
    var upgradeRows = O.upgrades.map(function (x) {
      return '<tr><td>' + storeLink(x.storeId) + '</td><td>' + status(x.readiness) + '</td><td><span class="bcn-note">' + esc(text(x.continuity)) + '</span></td><td>' + esc(actionLabel(x.next)) + '</td><td><button class="btn btn-default" data-upgrade-store="' + esc(x.storeId) + '">查看店铺</button></td></tr>';
    }).join('');
    return title('支持与升级', '将需要商户参与的事项转成清晰任务，并在合适时评估升级到完整 BestShopio 的连续性。不会新建平行账户或店铺。') +
      '<section class="bcn-split-stack"><div class="panel"><div class="bcn-panel-head"><div><div class="blk-title">商户协同任务</div><div class="blk-sub">商户只收到需要其完成的步骤；内部诊断和敏感实现细节不外露。</div></div></div><div class="bcn-table-wrap"><table class="tbl"><thead><tr><th>优先级</th><th>事项</th><th>负责人</th><th>状态</th><th></th></tr></thead><tbody>' + caseRows + '</tbody></table></div>' + mobile.cases + '</div>' +
      '<div class="panel"><div class="bcn-panel-head"><div><div class="blk-title">BestShopio 升级准备度</div><div class="blk-sub">升级沿用相同的平台账号、组织、店铺、连接、资产引用与历史数据，不需要重新开户。</div></div><a class="btn btn-default" href="#/plans">套餐与权益</a></div><div class="bcn-table-wrap"><table class="tbl"><thead><tr><th>店铺</th><th>准备度</th><th>连续性检查</th><th>建议下一步</th><th></th></tr></thead><tbody>' + upgradeRows + '</tbody></table></div>' + mobile.upgrades + '</div></section>';
  }
  function modal(titleText, body, primary, onConfirm) {
    pc().modal('<div class="modal-head">' + esc(titleText) + '</div><div class="modal-body"><p class="bcn-modal-copy">' + body + '</p></div><div class="modal-foot"><button class="btn btn-default" data-mx>取消</button><button class="btn btn-primary" id="bcnConfirm">' + esc(primary) + '</button></div>', function (m) {
      m.querySelector('#bcnConfirm').onclick = function () { onConfirm(); m.remove(); };
    });
  }
  function connectionAction(id, rerender) {
    var item = find(O.connections, id); if (!item) return;
    if (item.authorization === 'Reauthorization needed') {
      modal('创建商户重新授权任务', '这会创建一个面向商户的引导任务，并记录当前安全回退状态。不会在中台展示或重置授权凭证。', '创建任务', function () {
        item.next = 'Merchant task created'; audit('创建 Shopify 重新授权任务', storeName(item.storeId), 'Waiting for merchant'); toast('已创建商户重新授权任务。'); rerender();
      });
    } else {
      audit('复核 Shopify 连接状态', storeName(item.storeId), 'Checked'); toast('原型连接状态已复核。'); rerender();
    }
  }
  function routeGate(id, rerender) {
    var item = find(O.routes, id); if (!item) return;
    var warning = item.gate === 'Blocked' ? '<div class="bcn-modal-warning">当前没有可恢复的 BestCheckout 部署；Shopify 原生结账保持可用。</div>' : '';
    pc().modal('<div class="modal-head">发布门禁 · ' + esc(storeName(item.storeId)) + '</div><div class="modal-body"><div class="bcn-gate-grid"><div><span>部署快照</span><strong>' + esc(item.snapshot) + '</strong></div><div><span>运行面</span><strong>' + esc(item.surface) + '</strong></div><div><span>发布门禁</span>' + status(item.gate) + '</div><div><span>安全路径</span>' + status(item.safety) + '</div></div>' + warning + '<p class="bcn-modal-copy">门禁审查只生成审核记录。若需要安全处置，会在付款前创建回退审核，不直接切换正在进行的结账会话。</p></div><div class="modal-foot"><button class="btn btn-default" data-mx>关闭</button><button class="btn btn-primary" id="bcnReviewGate">记录审查</button></div>', function (m) {
      m.querySelector('#bcnReviewGate').onclick = function () { audit('审查发布门禁', storeName(item.storeId), item.gate === 'Blocked' ? 'Safety review required' : 'Gate reviewed'); m.remove(); toast('发布门禁审查已记录。'); rerender(); };
    });
  }
  function retryWriteback(id, rerender) {
    var item = find(O.writebacks, id); if (!item) return;
    modal('创建订单回写重试', '将以原始幂等键创建一次受控重试请求。不会重新收费，也不会创建第二笔 Shopify 订单。', '创建重试', function () {
      item.state = 'Queued'; item.age = '刚刚'; audit('创建订单回写重试', storeName(item.storeId), 'Queued with original idempotency key'); toast('已创建幂等回写重试。'); rerender();
    });
  }
  function eventAction(id, rerender) {
    var item = find(O.events, id); if (!item) return;
    if (item.action === 'Open Store') { route('#/stores/' + item.storeId); return; }
    if (item.action === 'Create reconnection task') { route('#/bestcheckout/connections'); return; }
    modal('创建事件重放', '会按事件的去重标识创建队列任务，保留原始 payload 供 Adapter 在安全条件下重放。', '创建重放任务', function () {
      item.status = 'Queued'; item.action = 'View Store'; audit('创建 Shopify 事件重放', storeName(item.storeId), 'Queued'); toast('事件重放任务已创建。'); rerender();
    });
  }
  function supportAction(id, rerender) {
    var item = find(O.support, id); if (!item) return;
    if (!item.storeId) { route('#/content'); return; }
    modal('记录商户协同', '此操作会记录面向商户的下一步，不会把内部日志、密钥或平台实现细节发送给商户。', '记录协同', function () {
      item.state = 'Waiting for merchant'; audit('记录商户协同任务', storeName(item.storeId), 'Waiting for merchant'); toast('商户协同任务已记录。'); rerender();
    });
  }
  function bind(root, section) {
    function rerender() { window.__viewBestCheckout(root, section); }
    root.querySelectorAll('[data-store-open], [data-upgrade-store]').forEach(function (b) { b.onclick = function () {
      route('#/stores/' + (b.getAttribute('data-store-open') || b.getAttribute('data-upgrade-store')));
    }; });
    root.querySelectorAll('[data-connection]').forEach(function (b) { b.onclick = function () { connectionAction(b.getAttribute('data-connection'), rerender); }; });
    root.querySelectorAll('[data-route-gate]').forEach(function (b) { b.onclick = function () { routeGate(b.getAttribute('data-route-gate'), rerender); }; });
    root.querySelectorAll('[data-writeback]').forEach(function (b) { b.onclick = function () { retryWriteback(b.getAttribute('data-writeback'), rerender); }; });
    root.querySelectorAll('[data-event]').forEach(function (b) { b.onclick = function () { eventAction(b.getAttribute('data-event'), rerender); }; });
    root.querySelectorAll('[data-support]').forEach(function (b) { b.onclick = function () { supportAction(b.getAttribute('data-support'), rerender); }; });
    root.querySelectorAll('[data-queue]').forEach(function (b) { b.onclick = function () {
      var type = b.getAttribute('data-queue'), kind = b.getAttribute('data-queue-type');
      if (kind === 'writeback') retryWriteback(type, rerender); else eventAction(type, rerender);
    }; });
  }
  window.__viewBestCheckout = function (root, requested) {
    var section = ['overview', 'connections', 'routing', 'writebacks', 'events', 'support'].indexOf(requested) >= 0 ? requested : 'overview';
    var body = section === 'connections' ? connections() : section === 'routing' ? routing() : section === 'writebacks' ? writebacks() : section === 'events' ? events() : section === 'support' ? support() : overview();
    root.innerHTML = '<div class="view-wrap bcn-view">' + (section === 'overview' ? '' : '<div class="bcn-route-head"><a href="#/bestcheckout">BestCheckout 运维</a><span>/</span><strong>' + ({ connections: '接入健康', routing: '发布与路由', writebacks: '订单回写', events: '事件与同步', support: '支持与升级' })[section] + '</strong></div>') + tabs(section) + body + '</div>';
    bind(root, section);
    if (window.I18N) window.I18N.apply(root);
  };
})();
