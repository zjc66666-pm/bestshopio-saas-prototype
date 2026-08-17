/* BestShopio SaaS operations console.
   This module is deliberately an internal control plane: lifecycle, content,
   domain, entitlement, governance and staff administration only. */
(function () {
  'use strict';

  var D = window.DATA;
  var C = D.platformCenter;
  var now = '7月29日 10:58';
  var labelMap = {
    Active: '已启用', Provisioning: '开通中', Suspended: '已停用', Completed: '已完成',
    Healthy: '正常', Review: '待复核', Pending: '待验证', Live: '生效', Draft: '草稿',
    Published: '已发布', 'In review': '待审核', 'In progress': '处理中',
    'Not connected': '未连接', 'Action required': '需处理', Failed: '失败',
    'No action required': '无需处理', Enabled: '已启用', Pilot: '小范围试用',
    High: '高', Medium: '中', Low: '低', Open: '待处理', Retryable: '可重试',
    'Waiting for merchant': '等待商家', 'Waiting for DNS': '等待域名验证',
    'BestCheckout merchants': 'BestCheckout 商家', 'Merchants and staff': '商家与平台员工',
    'Affected merchants': '受影响商家', 'Public help center': '公开帮助中心',
    'In-app notice': '站内公告', 'Credential reference only': '仅显示凭证引用',
    'All BestCheckout stores': '全部 BestCheckout 店铺', 'BestCheckout Help Center': 'BestCheckout 帮助中心',
    'Selected pilot stores': '指定试点店铺', 'Access granted': '已授予访问权限', 'No access': '未授予访问权限',
    'All stores': '全部店铺', checkout: '结账域名', storefront: '商城域名',
    bestcheckout: 'BestCheckout 接入店铺', bestshopio: 'BestShopio 原生店铺',
    'en-US': '英语（美国）', 'zh-CN': '中文（简体）',
    'Catalog, customers, orders, webhooks': '商品、客户、订单与事件同步',
    'Cards, wallets, payment webhooks': '银行卡、钱包与支付事件',
    'Cards, Apple Pay, payment webhooks': '银行卡、Apple Pay 与支付事件',
    'Authorization and webhooks': '授权与事件投递',
    'Purchase flows': '购买流程', 'Feature Flag': '功能配置', Starter: '入门版', Growth: '成长版', 'Commerce Pro': '企业版',
    'Checkout safety preflight': '结账安全预检', 'Help Center search feedback': '帮助中心搜索反馈',
    'Controlled BestShopio upgrade': 'BestShopio 受控升级',
    'Replayed a Shopify webhook': '创建 Shopify 事件重试', 'Queued for acknowledgement': '等待确认',
    'Updated checkout safety preflight': '更新结账安全预检', 'Published help article': '发布帮助文章',
    'Connect your Shopify store': '连接 Shopify 店铺', 'Set up payment services': '配置支付服务',
    'Set your checkout domain': '设置结账域名', 'Publish, pause and preview': '发布、暂停与预览',
    'Shopify authorization recovery notice': 'Shopify 授权恢复通知', 'Getting started': '快速开始',
    'Purchase flows': '购买流程', 'Service updates': '服务公告',
    'Shopify authorization was revoked': 'Shopify 授权已撤销',
    'One paid order awaits idempotent replay': '一笔已付款订单等待安全重试',
    'Offer references a replaced Shopify variant': '优惠引用的 Shopify 变体已被替换',
    'Storefront DNS verification is pending': '商城域名验证等待完成',
    'One published help article needs review': '一篇已发布帮助文章需要复核',
    'Shopify reconnection required': '需要重新授权 Shopify',
    'Variant mapping review': '商品变体映射复核',
    'Checkout domain article needs refresh': '结账域名文章需要更新',
    'Checkout is safely on Shopify native control. Ask the merchant to reconnect.': '结账已安全回退至 Shopify 原生路径，请引导商家重新授权。',
    'The Shopify acknowledgement timed out. The original idempotency key is preserved.': 'Shopify 确认超时，原始幂等键已保留。',
    'Map a live replacement variant and revalidate the offer rule.': '映射可用的替代变体，并重新校验优惠规则。',
    'The host has not been verified, so the storefront cannot be published.': '域名尚未验证，商城暂不能发布。',
    'The checkout-domain guide references an older DNS screenshot.': '结账域名指引引用了旧版 DNS 截图。',
    Connection: '服务连接', 'Order writeback': '订单回写', 'Catalog sync': '商品同步', Domain: '域名',
    'Commerce ops': '交易运营', 'Merchant success': '商家成功', Provisioning: '开通运营', Content: '内容运营', Ops: '平台运营',
    'Mia / Content': '内容运营', 'Avery / Product': '产品运营', 'ops.amy': '安然（平台运营）', 'mia.content': '米娅（内容运营）',
    Blocked: '已阻止', Passed: '已通过', Ready: '已就绪', Preserved: '已保留', Verified: '已验证'
  };
  var actionMap = {
    'Stage reconnection request': '创建重新授权任务', 'Replay writeback': '创建回写重试',
    'Map replacement': '处理商品映射', 'Check DNS': '检查域名验证', 'Open article': '处理内容',
    'No action required': '查看详情'
  };
  var navNameMap = {
    Orders: '订单', Products: '商品', Collections: '商品系列', Reviews: '评价', Customers: '客户',
    Discounts: '折扣', Content: '内容', Blog: '博客', Page: '页面', Menu: '菜单',
    'Online store': '在线商城', Settings: '设置', 'Basic settings': '基础设置', Payments: '支付',
    Currency: '货币', Checkout: '结账', Metafields: '自定义字段', 'Ship locations': '发货地点',
    'Shipping rates': '运费', Role: '角色', Staff: '员工', Meta: 'Meta', Google: 'Google', BestCheckout: 'BestCheckout'
  };
  var categoryNameMap = {
    Apparel: '服装', Leggings: '打底裤', Tops: '上装', Outerwear: '外套', Beauty: '美妆',
    Skincare: '护肤', Makeup: '彩妆', 'Home & Living': '家居生活', Kitchen: '厨房用品',
    Decor: '家居装饰', Electronics: '电子产品', Accessories: '配饰'
  };

  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function zh(v) { return labelMap[String(v)] || String(v == null ? '' : v); }
  function fmt(v) {
    return zh(v).replace(/Jul\s+(\d+),\s*(\d\d:\d\d)/g, '7月$1日 $2').replace(/Jun\s+(\d+),\s*(\d\d:\d\d)/g, '6月$1日 $2').replace(/Jul\s+(\d+)/g, '7月$1日').replace(/Jun\s+(\d+)/g, '6月$1日').replace(/\bToday\b/g, '今天').replace(/\bmin ago\b/g, '分钟前');
  }
  function actionZh(v) { return actionMap[String(v)] || zh(v); }
  function pc() { return window.PC; }
  function route(hash) { location.hash = hash; }
  function toast(message) { pc().toast(message); }
  function find(list, id) { return (list || []).filter(function (x) { return String(x.id) === String(id); })[0]; }
  function store(id) { return find(C.stores, id); }
  function org(id) { return find(C.organizations, id); }
  function byStore(list, id) { return (list || []).filter(function (x) { return x.storeId === id; }); }
  function tone(value) {
    var v = String(value || '');
    if (/已启用|已完成|正常|已验证|生效|已发布|通过|成功|健康|Eligible/.test(v)) return 'green';
    if (/高|失败|需处理|已停用|阻止|错误|失效|撤销|Resolve first/.test(v)) return 'red';
    if (/中|待|开通中|处理中|试用|重试|审核|等待|Review|Pilot/.test(v)) return 'orange';
    return 'gray';
  }
  function pill(value) { var text = zh(value); return '<span class="pcx-pill pcx-pill-' + tone(text) + '"><span></span>' + esc(text) + '</span>'; }
  function routeButton(hash, text, primary) { return '<button class="btn ' + (primary ? 'btn-primary' : 'btn-default') + '" data-route="' + esc(hash) + '">' + esc(text) + '</button>'; }
  function facts(items) { return '<div class="pcx-facts">' + items.map(function (x) { return '<div><span>' + esc(x[0]) + '</span>' + (x[1] && x[1].indexOf && x[1].indexOf('pcx-pill') >= 0 ? x[1] : '<strong>' + esc(fmt(x[1])) + '</strong>') + '</div>'; }).join('') + '</div>'; }
  function audit(action, scope, result) { C.audit.unshift({ at: now, actor: '运营人员', action: action, scope: scope, result: result || '已记录' }); }
  function empty(title, text, back) { return '<div class="view-wrap"><div class="pcx-empty"><div class="page-title">' + esc(title) + '</div><p>' + esc(text) + '</p>' + (back ? routeButton(back, '返回上一页', true) : '') + '</div></div>'; }
  function bindRoutes(root) { root.querySelectorAll('[data-route]').forEach(function (b) { b.onclick = function () { route(b.getAttribute('data-route')); }; }); }
  function bindCards(root) { bindRoutes(root); }
  function back(hash, text) { return '<button class="pcx-back" data-route="' + esc(hash) + '">‹ ' + esc(text || '返回列表') + '</button>'; }
  function page(title, subtitle, actions, body) {
    return '<div class="view-wrap"><div class="pc-head"><div><div class="page-title">' + esc(title) + '</div>' + (subtitle ? '<div class="pc-sub">' + esc(subtitle) + '</div>' : '') + '</div>' + (actions ? '<div class="pc-acts">' + actions + '</div>' : '') + '</div>' + body + '</div>';
  }
  function listRow(title, detail, right, routeTo) {
    return '<div class="pcx-list-row' + (routeTo ? ' is-link' : '') + '"' + (routeTo ? ' data-route="' + esc(routeTo) + '"' : '') + '><div><strong>' + esc(fmt(title)) + '</strong><span>' + esc(fmt(detail)) + '</span></div>' + (right || '') + '</div>';
  }
  function entityCard(title, meta, chips, state, hash) {
    return '<button class="pcx-entity-card" data-route="' + esc(hash) + '"><div class="pcx-entity-head"><div><strong>' + esc(fmt(title)) + '</strong><span>' + esc(fmt(meta)) + '</span></div>' + pill(state) + '</div>' + (chips ? '<div class="pcx-chip-row">' + chips.map(function (x) { return '<span class="pcx-chip">' + esc(fmt(x)) + '</span>'; }).join('') + '</div>' : '') + '<span class="pcx-card-link">查看详情 ›</span></button>';
  }
  function modalConfirm(title, body, confirmText, onConfirm) {
    return pc().modal('<div class="modal-head">' + esc(title) + '</div><div class="modal-body">' + body + '</div><div class="modal-foot"><button class="btn btn-default" data-mx>取消</button><button class="btn btn-primary" id="pcxConfirm">' + esc(confirmText) + '</button></div>', function (m) { m.querySelector('#pcxConfirm').onclick = function () { onConfirm(m); }; });
  }

  function seedData() {
    C.content.articles.forEach(function (a) {
      if (!a.body) a.body = '本文用于说明“' + a.title + '”的操作目的、前置条件、操作步骤与常见问题。发布后会在对应内容渠道中被检索和阅读。';
      if (!a.seoTitle) a.seoTitle = a.title;
      if (!a.seoDescription) a.seoDescription = 'BestCheckout 帮助与平台公告内容。';
      if (!a.versions) a.versions = [{ version: 'v1', at: a.updatedAt, actor: a.owner, note: '初始内容版本' }];
    });
    if (!C.content.feedbackItems) C.content.feedbackItems = [
      { term: '自定义结账域名', count: 9, source: '帮助中心搜索', suggestion: '完善域名验证图文说明', state: '待处理' },
      { term: '重新授权 Shopify', count: 6, source: '帮助中心搜索', suggestion: '关联重新授权步骤文章', state: '处理中' },
      { term: '订单没有同步', count: 3, source: '商家反馈', suggestion: '增加回写重试说明', state: '待处理' }
    ];
    if (!C.staff) C.staff = D.accounts.map(function (a, i) {
      var presets = [
        ['刘然', '平台管理员', '全部模块'], ['王安', '运营主管', '店铺、连接与域名'], ['李珊', '数据管理员', '数据质量与归因'],
        ['陈墨', '内容运营', '帮助与公告'], ['金敏', '商家成功', '店铺协同'], ['周晓', '实习生', '仅查看工作台']
      ][i];
      return { id: 'staff_' + (i + 1), name: presets[0], email: a.account, role: presets[1], scope: presets[2], status: a.status === 'Access granted' ? '已启用' : '未启用', lastActive: i < 4 ? '今天 10:' + (24 - i * 3) : '7月28日' };
    });
  }
  seedData();

  function taskStats() {
    var open = C.actionItems.filter(function (x) { return x.state !== '已解决'; });
    return [
      ['待处理事项', open.length, '跨店铺、内容、连接与域名'],
      ['高优先级', open.filter(function (x) { return x.severity === 'High'; }).length, '优先处理，不直接改动交易中会话'],
      ['等待外部操作', open.filter(function (x) { return /merchant|DNS/i.test(x.state); }).length, '等待商家或域名所有者完成操作'],
      ['店铺运行正常', C.stores.filter(function (x) { return x.connection === 'Healthy' && x.domainHealth === 'Healthy'; }).length + ' / ' + C.stores.length, '连接与域名均正常']
    ];
  }
  function stats(items) { return '<div class="pcx-kpis">' + items.map(function (x, i) { return '<section class="panel pcx-kpi' + (i === 1 ? ' pcx-kpi-alert' : '') + '"><span>' + esc(x[0]) + '</span><strong>' + esc(x[1]) + '</strong><small>' + esc(x[2]) + '</small></section>'; }).join('') + '</div>'; }
  function taskCard(item) {
    return '<button class="pcx-task-card" data-route="#/tasks/' + esc(item.id) + '"><div class="pcx-task-top">' + pill(item.severity) + pill(item.state) + '</div><strong>' + esc(fmt(item.title)) + '</strong><span>' + esc(fmt(item.detail)) + '</span><div class="pcx-task-foot"><em>' + esc(zh(item.domain)) + ' · ' + esc(item.store) + '</em><b>' + esc(actionZh(item.action)) + ' ›</b></div></button>';
  }
  window.__viewActionCenter = function (root) {
    root.innerHTML = page('运营工作台', '按优先级处理平台待办；所有操作会留下记录，并且不会在这里直接编辑商家的结账页面或支付配置。', routeButton('#/stores', '查看店铺') + routeButton('#/bestcheckout', '查看 BestCheckout 服务'),
      stats(taskStats()) +
      '<div class="pcx-work-grid"><section class="panel"><div class="pcx-panel-head"><div><div class="blk-title">待处理事项</div><div class="blk-sub">从风险信号到负责人、处理步骤和记录，均可追溯。</div></div>' + routeButton('#/tasks', '查看全部') + '</div><div class="pcx-task-grid">' + C.actionItems.map(taskCard).join('') + '</div></section>' +
      '<aside class="pcx-side-stack"><section class="panel card-pad"><div class="blk-title">今天需要关注</div><div class="pcx-list">' +
      listRow('连接授权', '1 个店铺等待商家完成重新授权', pill('等待商家'), '#/integrations') +
      listRow('订单回写', '1 个已付款订单可安全创建重试任务', pill('可重试'), '#/bestcheckout/writebacks') +
      listRow('内容维护', '1 篇已发布帮助文章需要复核', pill('待处理'), '#/content/feedback') +
      '</div></section><section class="panel card-pad"><div class="blk-title">平台操作边界</div><div class="pcx-rule-list"><div><strong>店铺是统一主记录</strong><span>组织、套餐、域名、连接与服务状态都关联同一店铺。</span></div><div><strong>不展示敏感凭证</strong><span>只展示连接状态和凭证引用，密钥与签名不出现在中台。</span></div><div><strong>先保护交易连续性</strong><span>BestCheckout 异常只创建协同或审核任务，付款前保留安全回退。</span></div></div></section></aside></div>');
    bindCards(root);
  };

  function taskDetail(item) {
    var s = item.storeId ? store(item.storeId) : null;
    return '<div class="view-wrap">' + back('#/action-center', '返回运营工作台') +
      '<div class="pc-head"><div><div class="page-title">' + esc(fmt(item.title)) + '</div><div class="pc-sub">' + esc(fmt(item.detail)) + '</div></div><div class="pc-acts">' + routeButton(item.storeId ? '#/stores/' + item.storeId : '#/content', item.storeId ? '查看关联店铺' : '查看内容') + '<button class="btn btn-primary" id="handleTask">记录处理</button></div></div>' +
      '<div class="pcx-detail-grid"><section class="panel card-pad"><div class="blk-title">事项信息</div>' + facts([
        ['优先级', pill(item.severity)], ['处理状态', pill(item.state)], ['所属领域', zh(item.domain)], ['负责人', item.owner], ['关联对象', s ? s.name : item.store], ['建议操作', actionZh(item.action)]
      ]) + '<div class="pcx-process"><div><b>1</b><span>发现信号</span><small>平台监控或内容反馈产生事项</small></div><div><b>2</b><span>判断影响</span><small>确认影响范围与安全边界</small></div><div><b>3</b><span>创建协同</span><small>由相应负责人或商家完成下一步</small></div><div><b>4</b><span>记录结果</span><small>将操作写入审计记录</small></div></div></section>' +
      '<aside class="pcx-side-stack"><section class="panel card-pad"><div class="blk-title">处理说明</div><p class="pcx-copy">此操作在原型中只更新处理状态并记录审计。涉及 Shopify 授权、DNS、支付或付款中会话时，实际系统必须由对应服务按受控流程执行。</p></section><section class="panel card-pad"><div class="blk-title">最近记录</div><div class="pcx-list">' + C.audit.slice(0, 3).map(function (x) { return listRow(x.action, x.at + ' · ' + x.actor, pill(x.result)); }).join('') + '</div></section></aside></div></div>';
  }
  function completeTask(item, root) {
    if (item.action === 'Open article') { route('#/content/articles/help_domain'); return; }
    if (item.action === 'Check DNS') { var h = C.hosts.filter(function (x) { return x.storeId === item.storeId; })[0]; route(h ? '#/domains/' + h.id : '#/domains'); return; }
    modalConfirm('记录处理', '<p class="pcx-modal-copy">确认创建“' + esc(actionZh(item.action)) + '”处理记录？原型只变更事项状态与审计记录，不会直接操作外部系统。</p><label class="fld-label">处理说明</label><textarea class="input" id="taskNote" rows="3" placeholder="补充本次处理说明"></textarea>', '确认并记录', function (m) {
      item.state = item.action === 'Stage reconnection request' ? 'Waiting for merchant' : 'In progress';
      audit(actionZh(item.action), item.store, '已创建处理记录');
      m.remove(); toast('处理记录已保存。'); window.__viewTask(root, item.id);
    });
  }
  window.__viewTask = function (root, id) {
    if (!id) { route('#/action-center'); return; }
    var item = find(C.actionItems, id);
    if (!item) { root.innerHTML = empty('未找到事项', '该待办不存在或已从原型数据中移除。', '#/action-center'); bindRoutes(root); return; }
    root.innerHTML = taskDetail(item);
    root.querySelector('#handleTask').onclick = function () { completeTask(item, root); };
    bindRoutes(root);
  };

  function storeCards(list) { return '<div class="pcx-entity-grid">' + list.map(function (s) { return entityCard(s.name, s.organization + ' · ' + s.owner, [zh(s.type), s.plan, zh(s.connection), zh(s.domainHealth)], s.lifecycle, '#/stores/' + s.id); }).join('') + '</div>'; }
  function createStore(root) {
    modalConfirm('新建 BestShopio 店铺', '<label class="fld-label">店铺名称</label><input class="input" id="newStoreName" placeholder="例如：Northstar Goods"><label class="fld-label">商家组织</label><input class="input" id="newStoreOrg" placeholder="例如：Northstar Goods Inc."><label class="fld-label">主要联系人</label><input class="input" id="newStoreOwner" placeholder="例如：李晨"><p class="fld-hint">创建后生成一个店铺主记录，并进入开通流程；域名、套餐、员工和服务连接将在店铺详情中继续维护。</p>', '创建并开始开通', function (m) {
      var name = m.querySelector('#newStoreName').value.trim(), company = m.querySelector('#newStoreOrg').value.trim(), owner = m.querySelector('#newStoreOwner').value.trim();
      if (!name || !company || !owner) { toast('请填写店铺名称、商家组织和主要联系人。'); return; }
      var id = 'store_' + Date.now();
      C.stores.unshift({ id: id, name: name, organizationId: '', organization: company, owner: owner, type: 'bestshopio', lifecycle: 'Provisioning', plan: 'Commerce Pro', region: '中国', createdAt: '7月29日', provisioning: 'In progress', connection: 'Not connected', domainHealth: 'Pending', product: 'BestShopio', nextAction: '完成开通检查', shopify: '--' });
      audit('创建店铺开通记录', name, '开通中'); m.remove(); toast('店铺已创建，并进入开通流程。'); route('#/stores/' + id);
    });
  }
  function storeDetail(s) {
    var organization = org(s.organizationId);
    var connections = byStore(C.integrations, s.id), hosts = byStore(C.hosts, s.id), tasks = byStore(C.actionItems, s.id);
    return '<div class="view-wrap">' + back('#/stores', '返回店铺管理') +
      '<div class="pc-head"><div><div class="page-title">' + esc(s.name) + '</div><div class="pc-sub">店铺是平台唯一主记录。组织、套餐、连接、域名和服务状态在此聚合；商家经营配置仍在各自商家后台维护。</div></div><div class="pc-acts">' + (s.type === 'bestcheckout' ? '<button class="btn btn-primary" id="upgradeStore">升级为完整 BestShopio</button>' : '') + '</div></div>' +
      '<div class="pcx-detail-grid"><section class="panel card-pad"><div class="blk-title">基础资料</div>' + facts([
        ['店铺类型', pill(s.type)], ['生命周期', pill(s.lifecycle)], ['商家组织', organization ? organization.name : s.organization], ['主要联系人', s.owner], ['创建时间', s.createdAt], ['区域', s.region]
      ]) + '</section><section class="panel card-pad"><div class="blk-title">产品与开通</div>' + facts([
        ['当前套餐', s.plan], ['已启用产品', s.product], ['开通状态', pill(s.provisioning)], ['下一步', zh(s.nextAction)]
      ]) + '<div class="pcx-inline-actions">' + routeButton('#/plans/' + (s.plan === 'Starter' ? 'plan_starter' : s.plan === 'Growth' ? 'plan_growth' : 'plan_commerce'), '查看套餐') + '</div></section></div>' +
      '<div class="pcx-detail-grid"><section class="panel card-pad"><div class="pcx-panel-head"><div><div class="blk-title">服务连接</div><div class="blk-sub">仅展示授权和健康状态，不展示密钥。</div></div>' + routeButton('#/integrations', '全部连接') + '</div><div class="pcx-list">' + (connections.length ? connections.map(function (x) { return listRow(x.provider + ' · ' + x.connection, zh(x.capability), pill(x.status), '#/integrations/' + x.id); }).join('') : '<div class="pcx-muted">暂无服务连接。</div>') + '</div></section><section class="panel card-pad"><div class="pcx-panel-head"><div><div class="blk-title">域名</div><div class="blk-sub">域名、DNS 和 SSL 只由中台统一维护。</div></div>' + routeButton('#/domains', '全部域名') + '</div><div class="pcx-list">' + (hosts.length ? hosts.map(function (x) { return listRow(x.host, zh(x.usage) + ' · ' + x.target, pill(x.status), '#/domains/' + x.id); }).join('') : '<div class="pcx-muted">暂无域名记录。</div>') + '</div></section></div>' +
      '<section class="panel"><div class="pcx-panel-head"><div><div class="blk-title">关联待办与变更记录</div><div class="blk-sub">这里记录平台处置，不替代商家后台的经营操作。</div></div></div><div class="pcx-list pcn-list-pad">' + (tasks.length ? tasks.map(function (x) { return listRow(x.title, zh(x.state) + ' · ' + x.owner, pill(x.severity), '#/tasks/' + x.id); }).join('') : '<div class="pcx-muted">当前没有待处理事项。</div>') + '</div></section></div>';
  }
  function upgradeStore(s, root) {
    modalConfirm('升级为完整 BestShopio', '<p class="pcx-modal-copy">升级只扩展同一店铺的产品能力，不会新建账户或平行店铺。组织、连接、商品映射、结账资产、订单与转化历史保持连续。</p><div class="pcx-confirm-list"><span>✓ 保留当前店铺主记录</span><span>✓ 套餐调整为 Commerce Pro</span><span>✓ 原型不会改动真实店铺或支付配置</span></div>', '确认升级', function (m) {
      s.type = 'bestshopio'; s.plan = 'Commerce Pro'; s.product = 'BestShopio + BestCheckout'; s.lifecycle = 'Active';
      audit('升级店铺产品能力', s.name, '已记录'); m.remove(); toast('店铺已按同一主记录完成升级。'); window.__viewStores(root, s.id);
    });
  }
  window.__viewStores = function (root, id) {
    var s = id && store(id);
    if (id && !s) { root.innerHTML = empty('未找到店铺', '该店铺不存在或已被移除。', '#/stores'); bindRoutes(root); return; }
    if (s) { root.innerHTML = storeDetail(s); if (root.querySelector('#upgradeStore')) root.querySelector('#upgradeStore').onclick = function () { upgradeStore(s, root); }; bindRoutes(root); return; }
    root.innerHTML = page('店铺管理', '管理全部店铺的生命周期、套餐、连接与域名。BestCheckout 接入店铺与 BestShopio 原生店铺使用同一店铺主记录。', '<button class="btn btn-primary" id="createStore">新建店铺</button>',
      '<div class="pcx-filter-bar"><span class="pc-search"><input class="filter-input" id="storeSearch" placeholder="搜索店铺、组织或联系人"></span><select class="filter-select" id="storeType"><option value="all">全部店铺类型</option><option value="bestcheckout">BestCheckout 接入店铺</option><option value="bestshopio">BestShopio 原生店铺</option></select><select class="filter-select" id="storeState"><option value="all">全部状态</option><option value="Active">已启用</option><option value="Provisioning">开通中</option><option value="Suspended">已停用</option></select><span class="pc-eff" id="storeCount"></span></div><div id="storeCards"></div>');
    function paint() {
      var search = root.querySelector('#storeSearch').value.toLowerCase(), type = root.querySelector('#storeType').value, state = root.querySelector('#storeState').value;
      var list = C.stores.filter(function (x) { return (type === 'all' || x.type === type) && (state === 'all' || x.lifecycle === state) && (!search || (x.name + x.organization + x.owner + x.id).toLowerCase().indexOf(search) >= 0); });
      root.querySelector('#storeCards').innerHTML = list.length ? storeCards(list) : '<div class="pcx-empty"><div class="blk-title">没有符合条件的店铺</div><p>调整筛选条件或重新搜索。</p></div>';
      root.querySelector('#storeCount').textContent = '共 ' + list.length + ' 家店铺'; bindCards(root);
    }
    root.querySelector('#storeSearch').oninput = paint; root.querySelector('#storeType').onchange = paint; root.querySelector('#storeState').onchange = paint; root.querySelector('#createStore').onclick = function () { createStore(root); }; paint();
  };

  function members(o) {
    return [
      { name: o.primary, role: '组织负责人', scope: '全部关联店铺', status: '已启用' },
      { name: '运营协作者', role: '运营成员', scope: '由组织管理员分配', status: '已启用' },
      { name: '财务协作者', role: '财务成员', scope: '订单与结算相关信息', status: '已启用' }
    ];
  }
  function orgDetail(o) {
    var stores = C.stores.filter(function (x) { return x.organizationId === o.id || x.organization === o.name; });
    return '<div class="view-wrap">' + back('#/organizations', '返回商家管理') +
      '<div class="pc-head"><div><div class="page-title">' + esc(o.name) + '</div><div class="pc-sub">商家组织、成员和店铺归属在此维护；平台员工权限在“平台员工”中单独管理，二者不会互相继承。</div></div></div>' +
      '<div class="pcx-detail-grid"><section class="panel card-pad"><div class="blk-title">组织资料</div>' + facts([['主要联系人', o.primary], ['邮箱', o.email], ['套餐', o.plan], ['状态', pill(o.status)], ['关联店铺', stores.length + ' 家'], ['组织编号', o.id]]) + '</section><section class="panel card-pad"><div class="blk-title">账号与数据连续性</div><p class="pcx-copy">BestCheckout 升级为 BestShopio 时，保留同一组织、同一店铺和既有资产，不需要商家重新开户。</p><div class="pcx-inline-actions">' + routeButton('#/plans', '查看套餐规则') + '</div></section></div>' +
      '<div class="pcx-detail-grid"><section class="panel card-pad"><div class="blk-title">成员</div><div class="pcx-list">' + members(o).map(function (m) { return listRow(m.name, m.role + ' · ' + m.scope, pill(m.status)); }).join('') + '</div></section><section class="panel card-pad"><div class="blk-title">关联店铺</div><div class="pcx-list">' + (stores.length ? stores.map(function (s) { return listRow(s.name, zh(s.type) + ' · ' + s.plan, pill(s.lifecycle), '#/stores/' + s.id); }).join('') : '<div class="pcx-muted">暂无关联店铺。</div>') + '</div></section></div></div>';
  }
  window.__viewOrganizations = function (root, id) {
    var o = id && org(id);
    if (id && !o) { root.innerHTML = empty('未找到商家组织', '该组织不存在或已被移除。', '#/organizations'); bindRoutes(root); return; }
    if (o) { root.innerHTML = orgDetail(o); bindRoutes(root); return; }
    root.innerHTML = page('商家管理', '管理商家组织、成员和关联店铺。商家身份与平台内部员工身份彼此独立。', '', '<div class="pcx-entity-grid">' + C.organizations.map(function (x) { return entityCard(x.name, x.primary + ' · ' + x.email, [x.stores + ' 家店铺', x.plan], x.status, '#/organizations/' + x.id); }).join('') + '</div>');
    bindCards(root);
  };

  function spaceName(space) { return zh(space); }
  function articleById(id) { return find(C.content.articles, id); }
  function articleCards(list) {
    return '<div class="pcx-entity-grid">' + list.map(function (a) { return entityCard(a.title, spaceName(a.space) + ' · ' + fmt(a.collection), [zh(a.audience), zh(a.locale), '/' + a.slug], a.status, '#/content/articles/' + a.id); }).join('') + '</div>';
  }
  function contentTabs(active) {
    return '<nav class="tabs pnx-tabs"><a class="tab' + (active === 'articles' ? ' active' : '') + '" href="#/content">文章</a><a class="tab' + (active === 'spaces' ? ' active' : '') + '" href="#/content/spaces">内容频道</a><a class="tab' + (active === 'feedback' ? ' active' : '') + '" href="#/content/feedback">搜索与反馈</a></nav>';
  }
  function saveArticle(article, root, intent) {
    var title = root.querySelector('#articleTitle').value.trim(), slug = root.querySelector('#articleSlug').value.trim().replace(/^\/+/, ''), space = root.querySelector('#articleSpace').value;
    if (!title || !slug) { toast('请填写文章标题和发布路径。'); return; }
    article.title = title; article.slug = slug; article.space = space; article.collection = root.querySelector('#articleCollection').value.trim() || '未分类'; article.audience = root.querySelector('#articleAudience').value; article.locale = root.querySelector('#articleLocale').value; article.body = root.querySelector('#articleBody').value.trim(); article.seoTitle = root.querySelector('#seoTitle').value.trim(); article.seoDescription = root.querySelector('#seoDescription').value.trim();
    article.status = intent === 'publish' ? 'Published' : intent === 'review' ? 'In review' : 'Draft'; article.updatedAt = now; article.owner = '内容运营'; article.versions.unshift({ version: 'v' + (article.versions.length + 1), at: now, actor: '内容运营', note: intent === 'publish' ? '发布内容' : intent === 'review' ? '提交审核' : '保存草稿' });
    if (!C.content.articles.some(function (x) { return x.id === article.id; })) C.content.articles.unshift(article);
    audit(intent === 'publish' ? '发布内容' : intent === 'review' ? '提交内容审核' : '保存内容草稿', article.title, zh(article.status)); toast(intent === 'publish' ? '内容已发布。' : intent === 'review' ? '内容已提交审核。' : '草稿已保存。'); route('#/content/articles/' + article.id);
  }
  function contentEditor(article) {
    var isNew = !article;
    article = article || { id: 'article_' + Date.now(), space: 'BestCheckout Help Center', collection: '', title: '', slug: '', audience: 'BestCheckout merchants', locale: 'en-US', status: 'Draft', body: '', seoTitle: '', seoDescription: '', owner: '内容运营', versions: [] };
    return '<div class="view-wrap">' + back(isNew ? '#/content' : '#/content/articles/' + article.id, isNew ? '返回文章列表' : '返回文章详情') +
      '<div class="pc-head"><div><div class="page-title">' + (isNew ? '新建内容' : '编辑内容') + '</div><div class="pc-sub">编辑完成后可保存草稿、提交审核或发布。平台帮助与公告内容不与商家博客、页面或菜单混用。</div></div><div class="pc-acts"><button class="btn btn-default" id="previewArticle">预览</button><button class="btn btn-default" id="saveDraft">保存草稿</button><button class="btn btn-default" id="sendReview">提交审核</button><button class="btn btn-primary" id="publishArticle">发布</button></div></div>' +
      '<div class="pcx-editor-grid"><section class="panel card-pad"><label class="fld-label required">文章标题</label><input class="input" id="articleTitle" value="' + esc(article.title) + '" placeholder="输入文章标题"><label class="fld-label required">内容频道</label><select class="input" id="articleSpace">' + C.content.spaces.map(function (x) { return '<option' + (x.name === article.space ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select><label class="fld-label">文章分类</label><input class="input" id="articleCollection" value="' + esc(article.collection) + '" placeholder="例如：快速开始"><label class="fld-label required">发布路径</label><div class="pcx-slug"><span>/</span><input class="input" id="articleSlug" value="' + esc(article.slug) + '" placeholder="例如：connect-shopify"></div><label class="fld-label">正文</label><textarea class="input pcn-editor" id="articleBody" rows="16" placeholder="填写正文内容、步骤和注意事项">' + esc(article.body) + '</textarea></section>' +
      '<aside class="pcx-side-stack"><section class="panel card-pad"><div class="blk-title">发布设置</div><label class="fld-label">受众</label><select class="input" id="articleAudience"><option value="BestCheckout merchants"' + (article.audience === 'BestCheckout merchants' ? ' selected' : '') + '>BestCheckout 商家</option><option value="Merchants and staff"' + (article.audience === 'Merchants and staff' ? ' selected' : '') + '>商家与平台员工</option><option value="Affected merchants"' + (article.audience === 'Affected merchants' ? ' selected' : '') + '>受影响商家</option></select><label class="fld-label">内容语言</label><select class="input" id="articleLocale"><option value="en-US"' + (article.locale === 'en-US' ? ' selected' : '') + '>英语（美国）</option><option value="zh-CN"' + (article.locale === 'zh-CN' ? ' selected' : '') + '>中文（简体）</option></select><div class="pcx-note">内容维护界面仅供内部人员使用；文章可以按实际受众发布为不同语言。</div></section><section class="panel card-pad"><div class="blk-title">搜索摘要</div><label class="fld-label">搜索标题</label><input class="input" id="seoTitle" value="' + esc(article.seoTitle) + '"><label class="fld-label">搜索描述</label><textarea class="input" id="seoDescription" rows="5">' + esc(article.seoDescription) + '</textarea></section><section class="panel card-pad"><div class="blk-title">版本记录</div><div class="pcx-list">' + (article.versions.length ? article.versions.slice(0, 3).map(function (v) { return listRow(v.version, v.at + ' · ' + v.note, ''); }).join('') : '<div class="pcx-muted">首次保存后生成版本记录。</div>') + '</div></section></aside></div></div>';
  }
  function articleDetail(article) {
    return '<div class="view-wrap">' + back('#/content', '返回文章列表') + '<div class="pc-head"><div><div class="page-title">' + esc(article.title) + '</div><div class="pc-sub">' + esc(spaceName(article.space)) + ' · /' + esc(article.slug) + '</div></div><div class="pc-acts">' + routeButton('#/content/articles/' + article.id + '/edit', '编辑内容', true) + '<button class="btn btn-default" id="previewArticle">预览</button></div></div>' +
      '<div class="pcx-detail-grid"><section class="panel card-pad"><div class="pcx-article-head">' + pill(article.status) + '<span>最后更新：' + esc(fmt(article.updatedAt)) + ' · ' + esc(article.owner) + '</span></div><article class="pcx-article-body">' + esc(article.body).replace(/\n/g, '<br>') + '</article><section class="pcx-seo"><strong>搜索摘要</strong><span>' + esc(article.seoTitle) + '</span><small>' + esc(article.seoDescription) + '</small></section></section><aside class="pcx-side-stack"><section class="panel card-pad"><div class="blk-title">发布信息</div>' + facts([['内容频道', spaceName(article.space)], ['文章分类', fmt(article.collection)], ['受众', zh(article.audience)], ['内容语言', zh(article.locale)], ['当前状态', pill(article.status)], ['发布路径', '/' + article.slug]]) + '</section><section class="panel card-pad"><div class="blk-title">版本历史</div><div class="pcx-list">' + article.versions.map(function (v) { return listRow(v.version, v.at + ' · ' + v.actor, '<span class="pcx-subtle">' + esc(v.note) + '</span>'); }).join('') + '</div></section></aside></div></div>';
  }
  function previewArticle(article) { modalConfirm('内容预览', '<div class="pcx-preview"><span class="pcx-subtle">/' + esc(article.slug || 'preview') + '</span><h2>' + esc(article.title || '未命名文章') + '</h2><p>' + esc(article.body || '请先填写文章正文。').replace(/\n/g, '<br>') + '</p></div>', '关闭', function (m) { m.remove(); }); }
  function spaceDetail(space) {
    var articles = C.content.articles.filter(function (a) { return a.space === space.name; });
    return '<div class="view-wrap">' + back('#/content/spaces', '返回内容频道') + '<div class="pc-head"><div><div class="page-title">' + esc(spaceName(space.name)) + '</div><div class="pc-sub">配置内容频道的受众、发布方式和默认语言。文章仍在文章详情与编辑页中维护。</div></div><div class="pc-acts"><button class="btn btn-primary" id="editSpace">编辑频道</button></div></div><div class="pcx-detail-grid"><section class="panel card-pad"><div class="blk-title">频道配置</div>' + facts([['发布方式', zh(space.channel)], ['默认受众', zh(space.audience)], ['默认语言', zh(space.locale)], ['频道状态', pill(space.status)], ['文章数量', articles.length + ' 篇'], ['频道编号', space.id]]) + '</section><section class="panel card-pad"><div class="blk-title">发布边界</div><div class="pcx-rule-list"><div><strong>帮助中心</strong><span>可被商家搜索和阅读，适合操作指引与常见问题。</span></div><div><strong>平台公告</strong><span>按发布受众投放站内公告，不能替代商家店铺内容。</span></div><div><strong>版本可追溯</strong><span>频道下文章的草稿、审核和发布均保留版本记录。</span></div></div></section></div><section class="panel card-pad"><div class="blk-title">本频道文章</div><div class="pcx-list">' + (articles.length ? articles.map(function (a) { return listRow(a.title, fmt(a.collection) + ' · ' + zh(a.status), pill(a.status), '#/content/articles/' + a.id); }).join('') : '<div class="pcx-muted">该频道暂未创建文章。</div>') + '</div></section></div>';
  }
  function editSpace(space, root) { var dialog = modalConfirm('编辑内容频道', '<label class="fld-label">发布方式</label><select class="input" id="spaceChannel"><option value="Public help center">公开帮助中心</option><option value="In-app notice">站内公告</option></select><label class="fld-label">默认受众</label><select class="input" id="spaceAudience"><option value="BestCheckout merchants">BestCheckout 商家</option><option value="Merchants and staff">商家与平台员工</option><option value="Affected merchants">受影响商家</option></select><label class="fld-label">默认语言</label><select class="input" id="spaceLocale"><option value="en-US">英语（美国）</option><option value="zh-CN">中文（简体）</option></select><label class="fld-label">频道状态</label><select class="input" id="spaceStatus"><option value="Live">已启用</option><option value="Suspended">已停用</option></select>', '保存频道配置', function (m) { space.channel = m.querySelector('#spaceChannel').value; space.audience = m.querySelector('#spaceAudience').value; space.locale = m.querySelector('#spaceLocale').value; space.status = m.querySelector('#spaceStatus').value; audit('更新内容频道', spaceName(space.name), zh(space.status)); m.remove(); toast('内容频道配置已保存。'); window.__viewContent(root, ['spaces', space.id]); }); dialog.querySelector('#spaceChannel').value = space.channel; dialog.querySelector('#spaceAudience').value = space.audience; dialog.querySelector('#spaceLocale').value = space.locale; dialog.querySelector('#spaceStatus').value = space.status; }
  window.__viewContent = function (root, parts) {
    parts = parts || []; var section = parts[0] || 'articles';
    if (section === 'new') { root.innerHTML = contentEditor(null); root.querySelector('#previewArticle').onclick = function () { previewArticle({ title: root.querySelector('#articleTitle').value, slug: root.querySelector('#articleSlug').value, body: root.querySelector('#articleBody').value }); }; ['saveDraft', 'sendReview', 'publishArticle'].forEach(function (id) { root.querySelector('#' + id).onclick = function () { saveArticle({ id: 'article_' + Date.now(), versions: [] }, root, id === 'saveDraft' ? 'draft' : id === 'sendReview' ? 'review' : 'publish'); }; }); bindRoutes(root); return; }
    if (section === 'spaces' && parts[1]) { var space = find(C.content.spaces, parts[1]); if (!space) { root.innerHTML = empty('未找到内容频道', '该内容频道不存在或已被移除。', '#/content/spaces'); bindRoutes(root); return; } root.innerHTML = spaceDetail(space); root.querySelector('#editSpace').onclick = function () { editSpace(space, root); }; bindRoutes(root); return; }
    if (section === 'articles' && parts[1]) { var article = articleById(parts[1]); if (!article) { root.innerHTML = empty('未找到文章', '该文章不存在或已被移除。', '#/content'); bindRoutes(root); return; } if (parts[2] === 'edit') { root.innerHTML = contentEditor(article); root.querySelector('#previewArticle').onclick = function () { previewArticle({ title: root.querySelector('#articleTitle').value, slug: root.querySelector('#articleSlug').value, body: root.querySelector('#articleBody').value }); }; ['saveDraft', 'sendReview', 'publishArticle'].forEach(function (id) { root.querySelector('#' + id).onclick = function () { saveArticle(article, root, id === 'saveDraft' ? 'draft' : id === 'sendReview' ? 'review' : 'publish'); }; }); bindRoutes(root); return; } root.innerHTML = articleDetail(article); root.querySelector('#previewArticle').onclick = function () { previewArticle(article); }; bindRoutes(root); return; }
    if (section === 'spaces') {
      root.innerHTML = page('帮助与公告', '统一维护 BestCheckout 帮助中心、平台公告和产品内帮助；不管理商家店铺的博客、页面或菜单。', routeButton('#/content/new', '新建内容', true), contentTabs('spaces') + '<div class="pcx-entity-grid">' + C.content.spaces.map(function (s) { return entityCard(spaceName(s.name), zh(s.channel), [zh(s.audience), zh(s.locale)], s.status, '#/content/spaces/' + s.id); }).join('') + '</div>'); bindCards(root); return;
    }
    if (section === 'feedback') {
      root.innerHTML = page('帮助与公告', '统一维护 BestCheckout 帮助中心、平台公告和产品内帮助；不管理商家店铺的博客、页面或菜单。', routeButton('#/content/new', '新建内容', true), contentTabs('feedback') + stats([['无结果搜索', C.content.feedback.noResultSearches, '近 30 天优先补齐答案'], ['有帮助反馈', C.content.feedback.helpfulRate, '来自帮助中心阅读反馈'], ['待复核文章', C.content.feedback.staleArticles, '可能包含过期说明或截图'], ['内容频道', C.content.spaces.length, '按受众与渠道分开发布']]) + '<section class="panel card-pad"><div class="blk-title">待处理搜索与反馈</div><div class="pcx-list">' + C.content.feedbackItems.map(function (x) { return listRow(x.term, x.source + ' · ' + x.count + ' 次 · 建议：' + x.suggestion, pill(x.state), '#/content/new'); }).join('') + '</div></section>'); bindCards(root); return;
    }
    root.innerHTML = page('帮助与公告', '统一维护 BestCheckout 帮助中心、平台公告和产品内帮助；不管理商家店铺的博客、页面或菜单。', routeButton('#/content/new', '新建内容', true), contentTabs('articles') + '<div class="pcx-filter-bar"><span class="pc-search"><input class="filter-input" id="articleSearch" placeholder="搜索标题、分类或发布路径"></span><select class="filter-select" id="articleState"><option value="all">全部状态</option><option value="Draft">草稿</option><option value="In review">待审核</option><option value="Published">已发布</option></select><span class="pc-eff" id="articleCount"></span></div><div id="articleCards"></div>');
    function paint() { var q = root.querySelector('#articleSearch').value.toLowerCase(), state = root.querySelector('#articleState').value; var list = C.content.articles.filter(function (a) { return (state === 'all' || a.status === state) && (!q || (a.title + a.collection + a.slug + a.space).toLowerCase().indexOf(q) >= 0); }); root.querySelector('#articleCards').innerHTML = list.length ? articleCards(list) : '<div class="pcx-empty"><div class="blk-title">没有符合条件的文章</div><p>调整搜索或筛选条件。</p></div>'; root.querySelector('#articleCount').textContent = '共 ' + list.length + ' 篇文章'; bindCards(root); }
    root.querySelector('#articleSearch').oninput = paint; root.querySelector('#articleState').onchange = paint; paint();
  };

  function hostDetail(h) {
    var s = store(h.storeId);
    return '<div class="view-wrap">' + back('#/domains', '返回域名管理') + '<div class="pc-head"><div><div class="page-title">' + esc(h.host) + '</div><div class="pc-sub">该域名用于' + esc(zh(h.usage)) + '。每个域名只能绑定一个用途，结账域名不会渲染商城页面。</div></div><div class="pc-acts"><button class="btn btn-primary" id="checkHost">检查域名状态</button></div></div><div class="pcx-detail-grid"><section class="panel card-pad"><div class="blk-title">域名状态</div>' + facts([['关联店铺', s ? s.name : h.store], ['域名用途', pill(h.usage)], ['解析状态', pill(h.dns)], ['SSL 状态', pill(h.ssl)], ['运行状态', pill(h.status)], ['最近更新', h.updatedAt]]) + '</section><section class="panel card-pad"><div class="blk-title">配置说明</div>' + facts([['目标地址', h.target], ['建议记录', 'CNAME 指向 ' + h.target], ['切换原则', '先验证，后发布'], ['安全边界', h.usage === 'checkout' ? '只提供结账服务' : '只提供商城页面']]) + '<div class="pcx-inline-actions">' + (s ? routeButton('#/stores/' + s.id, '查看关联店铺') : '') + '</div></section></div><section class="panel card-pad"><div class="blk-title">变更记录</div><div class="pcx-list">' + listRow('创建绑定任务', h.updatedAt + ' · 平台开通流程', pill(h.status)) + listRow('验证与证书检查', h.dns === 'Pending' ? '等待域名所有者配置解析记录' : '解析与证书状态正常', pill(h.dns)) + '</div></section></div>';
  }
  function addHost(root) {
    modalConfirm('绑定域名', '<label class="fld-label">域名</label><input class="input" id="hostName" placeholder="例如：checkout.example.com"><label class="fld-label">关联店铺</label><select class="input" id="hostStore">' + C.stores.map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(s.name) + '</option>'; }).join('') + '</select><label class="fld-label">域名用途</label><select class="input" id="hostUsage"><option value="checkout">结账域名</option><option value="storefront">商城域名</option></select><p class="fld-hint">创建后进入域名验证流程。一个域名不能同时被绑定到商城和结账两种用途。</p>', '创建验证任务', function (m) {
      var host = m.querySelector('#hostName').value.trim().toLowerCase(), storeId = m.querySelector('#hostStore').value, usage = m.querySelector('#hostUsage').value, s = store(storeId);
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) { toast('请输入有效的域名。'); return; }
      if (C.hosts.some(function (x) { return x.host === host; })) { toast('该域名已绑定，不能重复创建。'); return; }
      var id = 'host_' + Date.now(); C.hosts.unshift({ id: id, host: host, storeId: storeId, store: s.name, usage: usage, target: usage === 'checkout' ? 'edge.bestcheckout.app' : 'stores.bestshopio.com', dns: 'Pending', ssl: 'Pending', status: 'Provisioning', updatedAt: '刚刚' }); audit('创建域名验证任务', host, '开通中'); m.remove(); toast('域名验证任务已创建。'); route('#/domains/' + id);
    });
  }
  function checkHost(h, root) { h.dns = 'Verified'; h.ssl = 'Active'; h.status = 'Live'; h.updatedAt = '刚刚'; audit('检查域名与证书状态', h.host, '正常'); toast('域名与证书检查已完成。'); window.__viewDomains(root, h.id); }
  window.__viewDomains = function (root, id) {
    var h = id && find(C.hosts, id);
    if (id && !h) { root.innerHTML = empty('未找到域名', '该域名不存在或已被移除。', '#/domains'); bindRoutes(root); return; }
    if (h) { root.innerHTML = hostDetail(h); root.querySelector('#checkHost').onclick = function () { checkHost(h, root); }; bindRoutes(root); return; }
    root.innerHTML = page('域名管理', '统一管理域名绑定、DNS 验证、SSL 状态和路由用途。BestCheckout 商家后台只接收任务进度，不直接管理底层 DNS 或证书。', '<button class="btn btn-primary" id="addHost">绑定域名</button>', '<div class="pcx-entity-grid">' + C.hosts.map(function (x) { return entityCard(x.host, (store(x.storeId) || {}).name || x.store, [zh(x.usage), 'DNS：' + zh(x.dns), 'SSL：' + zh(x.ssl)], x.status, '#/domains/' + x.id); }).join('') + '</div><section class="panel card-pad pcn-space-top"><div class="blk-title">域名路由规则</div><div class="pcx-rule-list"><div><strong>一域名一用途</strong><span>每个域名仅有一个用途：商城或结账。</span></div><div><strong>结账域名隔离</strong><span>结账域名只承载结账，不展示首页、商品列表或商品详情。</span></div><div><strong>验证后发布</strong><span>必须先完成 DNS 与 SSL 检查，再进入可用状态。</span></div></div></section>');
    root.querySelector('#addHost').onclick = function () { addHost(root); }; bindCards(root);
  };

  function integrationDetail(x) {
    var s = store(x.storeId), related = C.bestcheckoutControl && C.bestcheckoutControl.connections ? C.bestcheckoutControl.connections.filter(function (c) { return c.storeId === x.storeId; })[0] : null;
    return '<div class="view-wrap">' + back('#/integrations', '返回服务连接') + '<div class="pc-head"><div><div class="page-title">' + esc(x.provider + ' · ' + x.connection) + '</div><div class="pc-sub">中台统一维护授权、同步与事件健康。凭证只显示引用与状态，不展示密钥、令牌或事件签名。</div></div><div class="pc-acts"><button class="btn btn-primary" id="checkIntegration">重新检查</button></div></div><div class="pcx-detail-grid"><section class="panel card-pad"><div class="blk-title">连接状态</div>' + facts([['服务提供方', x.provider], ['关联店铺', s ? s.name : '--'], ['当前状态', pill(x.status)], ['最近检测', x.checked], ['凭证信息', zh(x.secret)], ['支持能力', zh(x.capability)]]) + '</section><section class="panel card-pad"><div class="blk-title">处理建议</div><p class="pcx-copy">连接异常时，平台会创建重新授权、重试或人工审核任务。不会在中台直接替商家变更其 Shopify 授权或支付配置。</p><div class="pcx-inline-actions">' + (s ? routeButton('#/stores/' + s.id, '查看关联店铺') : '') + (related ? routeButton('#/bestcheckout/connections', '查看服务监控') : '') + '</div></section></div><section class="panel card-pad"><div class="blk-title">检查记录</div><div class="pcx-list">' + listRow('最近健康检查', x.checked + ' · ' + zh(x.status), pill(x.status)) + listRow('授权范围', zh(x.capability), pill('已启用')) + '</div></section></div>';
  }
  function checkIntegration(x, root) { x.checked = '刚刚'; if (x.status === 'Review') x.status = 'Healthy'; audit('检查服务连接', x.connection, zh(x.status)); toast('服务连接检查已完成。'); window.__viewIntegrations(root, x.id); }
  window.__viewIntegrations = function (root, id) {
    var x = id && find(C.integrations, id);
    if (id && !x) { root.innerHTML = empty('未找到服务连接', '该服务连接不存在或已被移除。', '#/integrations'); bindRoutes(root); return; }
    if (x) { root.innerHTML = integrationDetail(x); root.querySelector('#checkIntegration').onclick = function () { checkIntegration(x, root); }; bindRoutes(root); return; }
    root.innerHTML = page('服务连接', '查看并维护外部平台、支付服务与事件同步的连接状态。敏感凭证不在此显示。', routeButton('#/bestcheckout', '查看 BestCheckout 服务'), '<div class="pcx-entity-grid">' + C.integrations.map(function (i) { return entityCard(i.provider + ' · ' + i.connection, (store(i.storeId) || {}).name || '未关联店铺', [zh(i.capability), zh(i.secret)], i.status, '#/integrations/' + i.id); }).join('') + '</div>'); bindCards(root);
  };

  function planDetail(p) {
    var assigned = C.stores.filter(function (s) { return s.plan === p.name; });
    return '<div class="view-wrap">' + back('#/plans', '返回套餐管理') + '<div class="pc-head"><div><div class="page-title">' + esc(fmt(p.name)) + '</div><div class="pc-sub">套餐权益决定店铺可使用的产品能力；升级在同一店铺主记录上生效，不复制资产或另建账户。</div></div><div class="pc-acts"><button class="btn btn-primary" id="editPlan">编辑权益</button></div></div><div class="pcx-detail-grid"><section class="panel card-pad"><div class="blk-title">套餐权益</div>' + facts([['适用产品', p.products], ['员工席位', p.seats + ' 个'], ['购买流程', p.flows], ['可绑定域名', p.domains + ' 个'], ['数据保留期', p.analytics], ['状态', pill(p.status)]]) + '</section><section class="panel card-pad"><div class="blk-title">使用原则</div><p class="pcx-copy">BestCheckout 仍保持独立商家体验。套餐控制可用能力，但不会把完整 BestShopio 商家菜单暴露给 BestCheckout 商家。</p></section></div><section class="panel card-pad"><div class="blk-title">当前使用该套餐的店铺</div><div class="pcx-list">' + (assigned.length ? assigned.map(function (s) { return listRow(s.name, zh(s.type) + ' · ' + zh(s.lifecycle), pill(s.connection), '#/stores/' + s.id); }).join('') : '<div class="pcx-muted">当前没有店铺使用该套餐。</div>') + '</div></section></div>';
  }
  function editPlan(p, root) { modalConfirm('编辑套餐权益', '<label class="fld-label">员工席位</label><input class="input" id="planSeats" value="' + esc(p.seats) + '"><label class="fld-label">可绑定域名数量</label><input class="input" id="planDomains" value="' + esc(p.domains) + '"><label class="fld-label">数据保留期</label><input class="input" id="planAnalytics" value="' + esc(p.analytics) + '"><p class="fld-hint">原型修改仅更新套餐配置与审计记录，不会影响真实商家。</p>', '保存权益', function (m) { p.seats = m.querySelector('#planSeats').value.trim() || p.seats; p.domains = m.querySelector('#planDomains').value.trim() || p.domains; p.analytics = m.querySelector('#planAnalytics').value.trim() || p.analytics; audit('更新套餐权益', p.name, '已保存'); m.remove(); toast('套餐权益已保存。'); window.__viewPlans(root, p.id); }); }
  window.__viewPlans = function (root, id) {
    var p = id && find(C.plans, id);
    if (id && !p) { root.innerHTML = empty('未找到套餐', '该套餐不存在或已被移除。', '#/plans'); bindRoutes(root); return; }
    if (p) { root.innerHTML = planDetail(p); root.querySelector('#editPlan').onclick = function () { editPlan(p, root); }; bindRoutes(root); return; }
    root.innerHTML = page('套餐管理', '管理平台产品权益、席位、域名数量与数据保留期。', '', '<div class="pcx-entity-grid">' + C.plans.map(function (x) { return entityCard(x.name, x.products, [x.seats + ' 个席位', x.domains + ' 个域名', x.analytics + ' 数据保留'], x.status, '#/plans/' + x.id); }).join('') + '</div>'); bindCards(root);
  };

  function flagDetail(f) {
    return '<div class="view-wrap">' + back('#/governance', '返回发布控制') + '<div class="pc-head"><div><div class="page-title">' + esc(fmt(f.name)) + '</div><div class="pc-sub">功能配置通过范围、状态和变更记录受控发布。高风险能力必须先在小范围验证，再扩大生效范围。</div></div><div class="pc-acts"><button class="btn btn-primary" id="editFlag">调整发布范围</button></div></div><div class="pcx-detail-grid"><section class="panel card-pad"><div class="blk-title">发布配置</div>' + facts([['当前状态', pill(f.status)], ['生效范围', zh(f.scope)], ['最近更新人', f.changedBy], ['最近更新时间', f.updatedAt], ['发布方式', f.status === 'Pilot' ? '小范围验证' : '正常生效'], ['回退要求', '保留安全回退与审计记录']]) + '</section><section class="panel card-pad"><div class="blk-title">发布检查</div><div class="pcx-rule-list"><div><strong>范围明确</strong><span>只对符合套餐和风险条件的店铺生效。</span></div><div><strong>操作可追溯</strong><span>更新人、时间、范围和结果必须记入审计记录。</span></div><div><strong>故障可回退</strong><span>异常时创建审核和协同任务，避免直接影响进行中的交易。</span></div></div></section></div><section class="panel card-pad"><div class="blk-title">相关审计记录</div><div class="pcx-list">' + C.audit.slice(0, 5).map(function (x) { return listRow(x.action, x.at + ' · ' + x.scope, pill(x.result)); }).join('') + '</div></section></div>';
  }
  function editFlag(f, root) { modalConfirm('调整发布范围', '<label class="fld-label">生效范围</label><input class="input" id="flagScope" value="' + esc(zh(f.scope)) + '"><label class="fld-label">发布状态</label><select class="input" id="flagStatus"><option value="Enabled"' + (f.status === 'Enabled' ? ' selected' : '') + '>已启用</option><option value="Pilot"' + (f.status === 'Pilot' ? ' selected' : '') + '>小范围试用</option><option value="Suspended"' + (f.status === 'Suspended' ? ' selected' : '') + '>已停用</option></select><p class="fld-hint">此操作只更新原型中的发布配置与审计记录。</p>', '保存发布配置', function (m) { f.scope = m.querySelector('#flagScope').value.trim() || f.scope; f.status = m.querySelector('#flagStatus').value; f.changedBy = '运营人员'; f.updatedAt = now; audit('调整发布范围', f.name, zh(f.status)); m.remove(); toast('发布配置已保存。'); window.__viewGovernance(root, f.id); }); }
  window.__viewGovernance = function (root, id) {
    var f = id && find(C.flags, id);
    if (id && !f) { root.innerHTML = empty('未找到发布配置', '该发布配置不存在或已被移除。', '#/governance'); bindRoutes(root); return; }
    if (f) { root.innerHTML = flagDetail(f); root.querySelector('#editFlag').onclick = function () { editFlag(f, root); }; bindRoutes(root); return; }
    root.innerHTML = page('发布控制', '维护功能发布范围、灰度状态和审计记录。导航、员工和商品分类在各自入口独立管理。', routeButton('#/menu', '导航与权限') + routeButton('#/account', '平台员工') + routeButton('#/category', '商品分类'), '<div class="pcx-entity-grid">' + C.flags.map(function (x) { return entityCard(x.name, zh(x.scope), [x.changedBy, x.updatedAt], x.status, '#/governance/' + x.id); }).join('') + '</div><section class="panel card-pad pcn-space-top"><div class="blk-title">最近变更记录</div><div class="pcx-list">' + C.audit.slice(0, 8).map(function (x) { return listRow(x.action, x.at + ' · ' + x.actor + ' · ' + x.scope, pill(x.result)); }).join('') + '</div></section>'); bindCards(root);
  };

  function staffDetail(staff) { return '<div class="view-wrap">' + back('#/account', '返回平台员工') + '<div class="pc-head"><div><div class="page-title">' + esc(staff.name) + '</div><div class="pc-sub">平台员工只能访问被授予的后台功能。商家组织成员不从这里管理，也不会继承平台权限。</div></div><div class="pc-acts"><button class="btn btn-primary" id="editStaff">调整权限</button></div></div><div class="pcx-detail-grid"><section class="panel card-pad"><div class="blk-title">员工资料</div>' + facts([['姓名', staff.name], ['工作邮箱', staff.email], ['平台角色', staff.role], ['权限范围', staff.scope], ['账号状态', pill(staff.status)], ['最近活动', staff.lastActive]]) + '</section><section class="panel card-pad"><div class="blk-title">访问说明</div><p class="pcx-copy">员工权限按职责范围最小化授予。高风险发布、权限调整和域名变更将保留审计记录。</p><div class="pcx-rule-list"><div><strong>平台身份独立</strong><span>不会自动获得商家组织或店铺成员权限。</span></div><div><strong>可随时收回</strong><span>停用后不再可进入中台，历史记录仍保留。</span></div></div></section></div></div>'; }
  function editStaff(staff, root) { modalConfirm('调整员工权限', '<label class="fld-label">平台角色</label><select class="input" id="staffRole"><option>平台管理员</option><option>运营主管</option><option>数据管理员</option><option>内容运营</option><option>商家成功</option><option>仅查看工作台</option></select><label class="fld-label">权限范围</label><input class="input" id="staffScope" value="' + esc(staff.scope) + '"><label class="fld-label">账号状态</label><select class="input" id="staffState"><option value="已启用">已启用</option><option value="未启用">未启用</option></select>', '保存权限', function (m) { staff.role = m.querySelector('#staffRole').value; staff.scope = m.querySelector('#staffScope').value.trim() || staff.scope; staff.status = m.querySelector('#staffState').value; audit('调整平台员工权限', staff.name, staff.status); m.remove(); toast('员工权限已保存。'); window.__viewStaff(root, staff.id); }); }
  window.__viewStaff = function (root, id) {
    var staff = id && find(C.staff, id);
    if (id && !staff) { root.innerHTML = empty('未找到平台员工', '该员工不存在或已被移除。', '#/account'); bindRoutes(root); return; }
    if (staff) { root.innerHTML = staffDetail(staff); root.querySelector('#editStaff').onclick = function () { editStaff(staff, root); }; bindRoutes(root); return; }
    root.innerHTML = page('平台员工', '维护内部员工的中台角色、权限范围和账号状态。这里不管理商家组织成员。', '', '<div class="pcx-entity-grid">' + C.staff.map(function (x) { return entityCard(x.name, x.role + ' · ' + x.email, [x.scope, x.lastActive], x.status, '#/account/' + x.id); }).join('') + '</div>'); bindCards(root);
  };

  function navRecord(id) { var hit; (function walk(items) { (items || []).forEach(function (x) { if (String(x.id) === String(id)) hit = x; walk(x.children); }); })(D.menuTree); return hit; }
  function navList(items, level) { return (items || []).map(function (x) { var name = navNameMap[x.title] || x.title; var enabled = x.platformEnabled !== false ? '已启用' : '已停用'; return '<div class="pcx-nav-row"><div class="pcx-nav-name" style="padding-left:' + (level * 18) + 'px"><strong>' + esc(name) + '</strong><span>' + esc(x.route) + '</span></div><div class="pcx-nav-perm">' + ((x.permissions || []).length ? (x.permissions || []).length + ' 项权限' : '未单独配置权限') + '</div>' + pill(enabled) + '<button class="btn btn-default" data-route="#/menu/' + x.id + '">配置</button></div>' + navList(x.children, level + 1); }).join(''); }
  function navDetail(item) { return '<div class="view-wrap">' + back('#/menu', '返回导航与权限') + '<div class="pc-head"><div><div class="page-title">' + esc(navNameMap[item.title] || item.title) + '</div><div class="pc-sub">维护商家后台菜单的可见性与权限点。中台导航和商家后台导航是独立配置，不会相互覆盖。</div></div><div class="pc-acts"><button class="btn btn-primary" id="toggleNav">' + (item.platformEnabled === false ? '启用菜单' : '停用菜单') + '</button></div></div><div class="pcx-detail-grid"><section class="panel card-pad"><div class="blk-title">菜单配置</div>' + facts([['菜单名称', navNameMap[item.title] || item.title], ['路由地址', item.route], ['导航分组', item.navGroup === 'channel' ? '渠道' : item.navGroup === 'app' ? '应用' : '主导航'], ['当前状态', pill(item.platformEnabled === false ? '已停用' : '已启用')], ['排序值', String(item.sort)], ['子菜单数量', String((item.children || []).length)]]) + '</section><section class="panel card-pad"><div class="blk-title">权限点</div><div class="pcx-list">' + ((item.permissions || []).length ? item.permissions.map(function (p) { return listRow(p.title, p.route, pill('已启用')); }).join('') : '<div class="pcx-muted">该菜单暂未单独配置权限点。</div>') + '</div></section></div></div>'; }
  window.__viewNavigation = function (root, id) {
    var item = id && navRecord(id);
    if (id && !item) { root.innerHTML = empty('未找到菜单', '该菜单不存在或已被移除。', '#/menu'); bindRoutes(root); return; }
    if (item) { root.innerHTML = navDetail(item); root.querySelector('#toggleNav').onclick = function () { item.platformEnabled = item.platformEnabled === false; audit(item.platformEnabled ? '启用菜单' : '停用菜单', navNameMap[item.title] || item.title, '已记录'); toast(item.platformEnabled ? '菜单已启用。' : '菜单已停用。'); window.__viewNavigation(root, item.id); }; bindRoutes(root); return; }
    root.innerHTML = page('导航与权限', '维护商家后台菜单、路由和权限点。平台中台的内部导航与商家后台菜单分开管理。', '', '<section class="panel"><div class="pcx-panel-head"><div><div class="blk-title">商家后台菜单结构</div><div class="blk-sub">点击菜单可以查看路由、权限点和启停状态。</div></div></div><div class="pcx-nav-list">' + navList(D.menuTree, 0) + '</div></section>'); bindCards(root);
  };

  function findCategory(id, items) { var hit; (items || D.categories).forEach(function (x) { if (String(x.id) === String(id)) hit = x; if (!hit && x.children) hit = findCategory(id, x.children); }); return hit; }
  function categoryTree(items, level) { return (items || []).map(function (x) { return '<div class="pcx-category-row"><div style="padding-left:' + (level * 20) + 'px"><strong>' + esc(categoryNameMap[x.name] || x.name) + '</strong><span>' + esc(x.platformId) + '</span></div><span class="pcx-subtle">' + (level + 1) + ' 级</span><button class="btn btn-default" data-route="#/category/' + x.id + '">查看</button></div>' + categoryTree(x.children, level + 1); }).join(''); }
  function categoryDetail(c) { return '<div class="view-wrap">' + back('#/category', '返回商品分类') + '<div class="pc-head"><div><div class="page-title">' + esc(categoryNameMap[c.name] || c.name) + '</div><div class="pc-sub">平台商品分类用于统一分类标准；商家可以引用分类，但不会在此编辑商品本身。</div></div><div class="pc-acts"><button class="btn btn-primary" id="editCategory">编辑分类</button></div></div><div class="pcx-detail-grid"><section class="panel card-pad"><div class="blk-title">分类资料</div>' + facts([['分类名称', categoryNameMap[c.name] || c.name], ['平台分类编号', c.platformId], ['层级', c.level + ' 级'], ['子分类数量', (c.children || []).length + ' 个'], ['状态', pill('已启用')], ['使用范围', '全部店铺']]) + '</section><section class="panel card-pad"><div class="blk-title">子分类</div><div class="pcx-list">' + ((c.children || []).length ? c.children.map(function (x) { return listRow(categoryNameMap[x.name] || x.name, x.platformId, '', '#/category/' + x.id); }).join('') : '<div class="pcx-muted">当前没有子分类。</div>') + '</div></section></div></div>'; }
  function editCategory(c, root) { modalConfirm('编辑商品分类', '<label class="fld-label">分类名称</label><input class="input" id="categoryName" value="' + esc(categoryNameMap[c.name] || c.name) + '"><label class="fld-label">平台分类编号</label><input class="input" id="categoryCode" value="' + esc(c.platformId) + '">', '保存分类', function (m) { c.name = m.querySelector('#categoryName').value.trim() || c.name; c.platformId = m.querySelector('#categoryCode').value.trim() || c.platformId; audit('更新商品分类', c.name, '已保存'); m.remove(); toast('商品分类已保存。'); window.__viewCategories(root, c.id); }); }
  window.__viewCategories = function (root, id) {
    var c = id && findCategory(id);
    if (id && !c) { root.innerHTML = empty('未找到商品分类', '该分类不存在或已被移除。', '#/category'); bindRoutes(root); return; }
    if (c) { root.innerHTML = categoryDetail(c); root.querySelector('#editCategory').onclick = function () { editCategory(c, root); }; bindRoutes(root); return; }
    root.innerHTML = page('商品分类', '维护全平台商品分类标准，供店铺商品管理与数据分析统一引用。', '', '<section class="panel"><div class="pcx-panel-head"><div><div class="blk-title">分类树</div><div class="blk-sub">点击分类可维护分类名称、编号和子分类结构。</div></div></div><div class="pcx-category-list">' + categoryTree(D.categories, 0) + '</div></section>'); bindCards(root);
  };
})();
