/* BestShopio SaaS Platform Center — operations workspace.
   This module deliberately uses the same working rhythm as the Merchant and
   BestCheckout backends: operational lists lead to a detail page, and changes
   are made through an explicit form or recorded action. It owns platform-only
   administration; it never exposes merchant drafts, payment credentials or
   Shopify webhook payloads. */
(function () {
  'use strict';

  var D = window.DATA || {};
  var C = D.platformCenter || {};
  var B = D.bestcheckoutControl || {};

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function pc() { return window.PC || {}; }
  function icon(name, size) {
    var core = pc();
    return core.ico && core.P && core.P[name] ? core.ico(core.P[name], size || 16) : '';
  }
  function toast(message) { if (pc().toast) pc().toast(message); }
  function tx(text) { return window.I18N && window.I18N.t ? window.I18N.t(text) : text; }
  function copyText(value, okMessage) {
    var text = String(value || '');
    if (!text) return;
    function done() { toast(tx(okMessage || 'Copied')); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        var input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        try { document.execCommand('copy'); done(); } catch (err) {}
        document.body.removeChild(input);
      });
      return;
    }
    done();
  }
  function apply(root) { if (window.I18N && window.I18N.apply) window.I18N.apply(root); }
  function route(hash) { location.hash = hash; }
  function cleanPart(part) { return String(part || '').split('?')[0]; }
  function now() { return 'Jul 31, 2026 · 10:42'; }
  function audit(action, scope, result) {
    C.audit = C.audit || [];
    C.audit.unshift({ at: now(), actor: 'ops.amy', action: action, scope: scope, result: result || 'Recorded' });
  }
  function statusTone(value) {
    var text = String(value || '').toLowerCase();
    if (/preparing install link|正在准备安装链接/.test(text)) return 'action';
    if (/domain not connected|payment not connected|域名未连接|支付未连接/.test(text)) return 'warn';
    if (/failed|suspend|action required|needs attention|blocked|reauthorization|retryable|merchant action|not connected|not verified|disabled|expired|install failed/.test(text)) return 'danger';
    if (/review|pending|provision|progress|waiting|sending to shopify|pilot|queued|draft|open|ready to install|setup incomplete|not completed|开通|opening|未完成/.test(text)) return 'warn';
    if (/paused|not configured|archived|hidden|none/.test(text)) return 'muted';
    return 'ok';
  }
  function status(value) {
    return '<span class="ops-status ' + statusTone(value) + '"><i></i>' + esc(value || '—') + '</span>';
  }
  function flowStatus(value) {
    var state = String(value || '');
    if (state === 'Review') state = 'Paused';
    var tone = state === 'Live' ? 'ok' : (state === 'Paused' ? 'warn' : 'muted');
    return '<span class="ops-status ' + tone + '"><i></i>' + esc(state || '—') + '</span>';
  }
  function flowRows(list) {
    if (!list.length) return listEmpty('No purchase flows in this view.', 7);
    return list.map(function (flow) {
      return '<tr><td>' + esc(flow.name) + '</td><td>' + esc(flow.priority != null ? String(flow.priority) : '—') + '</td><td>' + esc(flow.funnelType || '—') + '</td><td>' + esc(flow.traffic || '—') + '</td><td>' + esc(flow.conversion || '—') + '</td><td>' + esc(flow.aov || '—') + '</td><td>' + flowStatus(flow.state) + '</td></tr>';
    }).join('');
  }
  function pagerHtml(pageNo, pageSize, total, pageAttr, sizeId) {
    var pages = Math.max(1, Math.ceil((total || 0) / pageSize));
    if (pageNo > pages) pageNo = pages;
    var html = '<span class="pg-item' + (pageNo <= 1 ? ' disabled' : '') + '"' + (pageNo <= 1 ? '' : ' data-' + pageAttr + '="' + (pageNo - 1) + '"') + '>‹</span>';
    for (var p = 1; p <= pages; p++) html += '<span class="pg-item' + (p === pageNo ? ' active' : '') + '" data-' + pageAttr + '="' + p + '">' + p + '</span>';
    html += '<span class="pg-item' + (pageNo >= pages ? ' disabled' : '') + '"' + (pageNo >= pages ? '' : ' data-' + pageAttr + '="' + (pageNo + 1) + '"') + '>›</span>';
    html += '<select class="pg-size" id="' + sizeId + '" aria-label="Page size"><option value="10"' + (pageSize === 10 ? ' selected' : '') + '>10 / page</option><option value="20"' + (pageSize === 20 ? ' selected' : '') + '>20 / page</option><option value="50"' + (pageSize === 50 ? ' selected' : '') + '>50 / page</option><option value="100"' + (pageSize === 100 ? ' selected' : '') + '>100 / page</option></select>';
    return { html: html, page: pageNo };
  }
  function statusPlain(value) {
    return '<span class="ops-status-plain">' + esc(value || '—') + '</span>';
  }
  function linkCell(title, meta, href) {
    return '<a class="ops-row-link" href="' + esc(href) + '"><strong>' + esc(title) + '</strong>' + (meta ? '<span>' + esc(meta) + '</span>' : '') + '</a>';
  }
  function page(title, sub, actions, body, crumb, backTo) {
    var pageClass = title === 'Help Center' ? ' ops-page-help-center' : (title === 'Stores' ? ' ops-page-stores' : (backTo === '#/stores' ? ' ops-page-store-detail' : ''));
    var titleBlock = '<div class="ops-page-title-block"><h1 class="ops-title page-title">' + esc(title) + '</h1>' +
      (sub ? '<div class="ops-sub">' + esc(sub) + '</div>' : '') + '</div>';
    var titleRow = backTo
      ? '<div class="ops-page-title-row"><a class="back-btn" href="' + esc(backTo) + '" title="Back" aria-label="Back">' + icon('arrowLeft', 18) + '</a>' + titleBlock + '</div>'
      : titleBlock;
    return '<section class="ops-page' + pageClass + '">' +
      (!backTo && crumb ? '<div class="ops-breadcrumb">' + crumb + '</div>' : '') +
      '<header class="ops-page-head"><div>' + titleRow + '</div>' +
      (actions ? '<div class="ops-head-actions">' + actions + '</div>' : '') + '</header>' + body + '</section>';
  }
  function render(root, html, bind) {
    root.innerHTML = html;
    if (bind) bind(root);
    apply(root);
  }
  function back(to, text) { return '<a href="' + esc(to) + '">' + esc(text) + '</a><span>/</span>'; }
  function fact(label, value) { return '<div class="ops-fact"><span>' + esc(label) + '</span><strong>' + value + '</strong></div>'; }
  function kpi(label, value, detail, tone) {
    return kpiHtml(label, value, detail ? esc(detail) : '', tone);
  }
  function kpiHtml(label, value, detailHtml, tone) {
    return '<div class="ops-kpi' + (tone ? ' ' + tone : '') + '"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong>' + (detailHtml ? '<small>' + detailHtml + '</small>' : '') + '</div>';
  }
  function catalogKpi(labelEn, labelZh, value, detailHtml) {
    var label = (window.I18N && window.I18N.lang === 'zh') ? labelZh : labelEn;
    return '<div class="ops-kpi"><span class="i18n-skip">' + esc(label) + '</span><strong>' + esc(value) + '</strong>' + (detailHtml ? '<small>' + detailHtml + '</small>' : '') + '</div>';
  }
  function kpiCountNote(count, label, tone) {
    var cls = tone === 'danger' ? 'ops-count-alert' : '';
    return '<span class="i18n-skip' + (cls ? ' ' + cls : '') + '">' + esc(count) + '</span> <span' + (cls ? ' class="' + cls + '"' : '') + '>' + esc(label) + '</span>';
  }
  function unsyncedCount(total, synced) {
    var gap = Number(total) - Number(synced);
    return isFinite(gap) && gap > 0 ? gap : 0;
  }
  function orderSyncNote(usage) {
    var note = kpiCountNote(usage.ordersSynced, 'already synced');
    var gap = unsyncedCount(usage.ordersTotal, usage.ordersSynced);
    if (gap) note += '<span> · </span>' + kpiCountNote(gap, 'not synced', 'danger');
    return note;
  }
  function contractNote(usage) {
    var active = Number(usage.contractsActive != null ? usage.contractsActive : usage.contracts) || 0;
    var due = Number(usage.contractsPastDue || 0);
    var cancelled = Number(usage.contractsCancelled || 0);
    function part(count, label, tone) {
      var cls = tone === 'danger' ? ' ops-count-alert' : '';
      return '<span' + (cls ? ' class="' + cls.trim() + '"' : '') + '>' + esc(count + ' ' + label) + '</span>';
    }
    return part(active, 'Active') + '<span> · </span>' + part(due, 'Past due', due ? 'danger' : '') + '<span> · </span>' + part(cancelled, 'Cancelled');
  }
  function confirmDialog(title, copy, primary, onConfirm, tone) {
    if (!pc().modal) return;
    var cls = tone === 'danger' ? ' btn-danger' : ' btn-primary';
    pc().modal('<div class="modal-head">' + esc(title) + '</div><div class="modal-body"><p class="pcx-modal-copy">' + copy + '</p></div><div class="modal-foot"><button class="btn btn-default" data-mx>Cancel</button><button class="btn' + cls + '" id="opsConfirm">' + esc(primary) + '</button></div>', function (layer) {
      layer.querySelector('#opsConfirm').onclick = function () { onConfirm(); layer.remove(); };
    });
  }
  function bindSearch(root, inputId, selectIds, draw) {
    var input = root.querySelector(inputId);
    if (input) input.oninput = draw;
    (selectIds || []).forEach(function (id) { var el = root.querySelector(id); if (el) el.onchange = draw; });
  }
  function listEmpty(message, cols) {
    return '<tr class="ops-empty-row"><td class="muted ops-table-empty" colspan="' + (cols || 6) + '">' + esc(message) + '</td></tr>';
  }
  function fitMultiFilter(filter) {
    if (!filter) return;
    var button = filter.querySelector('.ops-multi-trigger');
    var popover = filter.querySelector('.ops-multi-popover');
    if (!button || !popover) return;
    var cs = window.getComputedStyle(button);
    var probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font:' + cs.font;
    document.body.appendChild(probe);
    var maxText = 0;
    filter.querySelectorAll('.ops-multi-sizer span, .ops-multi-trigger span, .ops-multi-popover label span').forEach(function (el) {
      probe.textContent = el.textContent || '';
      if (probe.offsetWidth > maxText) maxText = probe.offsetWidth;
    });
    document.body.removeChild(probe);
    var pad = parseFloat(cs.paddingLeft) || 10;
    var gap = parseFloat(cs.columnGap || cs.gap) || 8;
    var icon = 14;
    var triggerNeed = maxText + pad + pad + gap + icon;
    var popNeed = maxText + 12 + 20 + 15 + 8;
    var width = Math.ceil(Math.max(triggerNeed, popNeed));
    filter.style.width = width + 'px';
    popover.style.boxSizing = 'border-box';
    popover.style.width = width + 'px';
    popover.style.minWidth = width + 'px';
    popover.style.maxWidth = width + 'px';
  }
  function multiCheckHtml(id, empty, options) {
    var sizer = [empty].concat(options.map(function (opt) { return opt.label; })).map(function (text) {
      return '<span>' + esc(text) + '</span>';
    }).join('');
    return '<div class="ops-multi-filter" id="' + id + 'Filter">' +
      '<span class="ops-multi-sizer" aria-hidden="true">' + sizer + '</span>' +
      '<button type="button" class="filter-select ops-multi-trigger" id="' + id + 'Button"><span id="' + id + 'Label">' + esc(empty) + '</span>' + icon('down', 14) + '</button>' +
      '<div class="ops-multi-popover" id="' + id + 'Popover">' + options.map(function (opt) {
        return '<label><input type="checkbox" value="' + esc(opt.value) + '"><span>' + esc(opt.label) + '</span></label>';
      }).join('') + '</div></div>';
  }
  function bindMultiCheck(scope, id, empty, options, selected, onChange, shared) {
    var filter = scope.querySelector('#' + id + 'Filter');
    var button = scope.querySelector('#' + id + 'Button');
    var popover = scope.querySelector('#' + id + 'Popover');
    var label = scope.querySelector('#' + id + 'Label');
    var sizer = filter ? filter.querySelector('.ops-multi-sizer') : null;
    function paint() {
      if (!label || !button || !popover) return;
      var text = !selected.length ? empty : (selected.length === 1 ? ((options.filter(function (opt) { return opt.value === selected[0]; })[0] || {}).label || selected[0]) : selected.length + ' selected');
      label.textContent = text;
      popover.querySelectorAll('input').forEach(function (input) {
        input.checked = selected.indexOf(input.value) >= 0;
      });
      var isOpen = shared.open === id;
      popover.classList.toggle('show', isOpen);
      button.classList.toggle('active', isOpen || selected.length > 0);
      if (window.I18N && window.I18N.apply) {
        window.I18N.apply(button);
        window.I18N.apply(popover);
        if (sizer) window.I18N.apply(sizer);
      }
      fitMultiFilter(filter);
    }
    button.onclick = function (event) {
      event.stopPropagation();
      shared.open = shared.open === id ? '' : id;
      if (shared.paintAll) shared.paintAll();
    };
    popover.querySelectorAll('input').forEach(function (input) {
      input.onchange = function () {
        var value = input.value;
        if (input.checked) {
          if (selected.indexOf(value) < 0) selected.push(value);
        } else {
          selected.splice(selected.indexOf(value), 1);
        }
        onChange();
        paint();
      };
    });
    shared.painters.push(paint);
    return paint;
  }
  function modalFields(title, fields, primary, onSave) {
    var body = fields.map(function (field) {
      return '<label class="fld-label">' + esc(field.label) + '</label>' + field.html;
    }).join('');
    if (!pc().modal) return;
    pc().modal('<div class="modal-head">' + esc(title) + '</div><div class="modal-body">' + body + '</div><div class="modal-foot"><button type="button" class="btn btn-default" data-mx>Cancel</button><button type="button" class="btn btn-primary" id="opsSave">' + esc(primary) + '</button></div>', function (layer) {
      apply(layer);
      layer.querySelector('#opsSave').onclick = function () { onSave(layer); };
    });
  }
  function findStore(id) { return (C.stores || []).filter(function (x) { return x.id === id; })[0]; }
  function findOrganization(id) { return (C.organizations || []).filter(function (x) { return x.id === id; })[0]; }
  function findArticle(id) { return ((C.content || {}).articles || []).filter(function (x) { return x.id === id; })[0]; }
  function findCollection(id) { return ((C.content || {}).collections || []).filter(function (x) { return x.id === id; })[0]; }
  function findHost(id) { return (C.hosts || []).filter(function (x) { return x.id === id; })[0]; }
  function findIntegration(id) { return (C.integrations || []).filter(function (x) { return x.id === id; })[0]; }
  function findPlan(id) { return (C.plans || []).filter(function (x) { return x.id === id; })[0]; }
  function findFlag(id) { return (C.flags || []).filter(function (x) { return x.id === id; })[0]; }
  function findTask(id) { return (C.actionItems || []).filter(function (x) { return x.id === id; })[0]; }

  /* ---------- Operations overview and task queue ---------- */
  function home(root) {
    var stores = C.stores || [];
    var tasks = C.actionItems || [];
    var hosts = C.hosts || [];
    var articles = (C.content || {}).articles || [];
    var attention = tasks.filter(function (x) { return x.state !== 'Resolved'; });
    var active = stores.filter(function (x) { return x.lifecycle === 'Active'; }).length;
    var liveHosts = hosts.filter(function (x) { return x.status === 'Live'; }).length;
    var published = articles.filter(function (x) { return x.status === 'Published'; }).length;
    var queue = attention.slice(0, 5).map(function (item) {
      var level = String(item.severity || '').toLowerCase();
      return '<button class="ops-attention-item" data-task="' + esc(item.id) + '"><i class="ops-severity ' + esc(level) + '"></i><div class="ops-attention-copy"><strong>' + esc(item.title) + '</strong><span>' + esc(item.store) + ' · ' + esc(item.detail) + '</span></div>' + status(item.state) + '</button>';
    }).join('');
    var health = [
      ['Store provisioning', active + ' active stores · 1 provisioning', 'Healthy'],
      ['Service connections', '3 healthy · 1 needs merchant action', 'Review'],
      ['Domains and SSL', liveHosts + ' live hosts · 1 verification pending', 'Review'],
      ['Help Center', published + ' published articles · 1 in review', 'Healthy']
    ].map(function (row) { return '<div class="ops-health-row"><div><strong>' + row[0] + '</strong><span>' + row[1] + '</span></div>' + status(row[2]) + '</div>'; }).join('');
    var recent = (C.audit || []).slice(0, 4).map(function (item) {
      return '<div class="ops-timeline-row"><div><strong>' + esc(item.action) + '</strong><span>' + esc(item.scope) + ' · ' + esc(item.actor) + '</span></div><span class="ops-meta">' + esc(item.at) + '</span></div>';
    }).join('');
    var body = '<div class="ops-kpi-grid">' +
      kpi('Active stores', active, 'Across BestShopio and BestCheckout', '') +
      kpi('Items requiring attention', attention.length, 'Needs a recorded next step', attention.length ? 'warn' : '') +
      kpi('Live domains', liveHosts, 'DNS and SSL verified', '') +
      kpi('Published help articles', published, 'BestCheckout merchant content', '') + '</div>' +
      '<div class="ops-layout"><div class="ops-stack"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Items requiring attention</div><div class="ops-panel-sub">Prioritized operational work across stores and platform services.</div></div><a class="ops-link" href="#/stores">View stores</a></div><div class="ops-attention">' + queue + '</div></section>' +
      '<section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Recent changes</div><div class="ops-panel-sub">Recorded platform actions and releases.</div></div><a class="ops-link" href="#/governance">Release management</a></div><div class="ops-panel-body">' + recent + '</div></section></div>' +
      '<aside class="ops-stack"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Platform health</div><div class="ops-panel-sub">A concise service view; use each module for diagnosis.</div></div></div><div class="ops-panel-body">' + health + '</div></section>' +
      '<section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Quick access</div></div></div><div class="ops-panel-body"><div class="ops-action-list"><a class="btn btn-default" href="#/content">Manage Help Center</a><a class="btn btn-default" href="#/bestcheckout">BestCheckout operations</a><a class="btn btn-default" href="#/domains">Review domains</a></div></div></section></aside></div>';
    render(root, page('Operations overview', 'Run the shared platform safely: stores, merchant organizations, content, domains, service connections and governed releases.', '<a class="btn btn-primary" href="#/stores">Manage stores</a>', body));
    root.querySelectorAll('[data-task]').forEach(function (button) { button.onclick = function () { route('#/tasks/' + button.getAttribute('data-task')); }; });
  }

  function task(root, id) {
    var item = findTask(id);
    if (!item) { home(root); return; }
    var storeLink = item.storeId ? '<a class="ops-link" href="#/stores/' + esc(item.storeId) + '">' + esc(item.store) + '</a>' : esc(item.store);
    var body = '<div class="ops-info-grid">' + fact('Priority', status(item.severity)) + fact('Area', esc(item.domain)) + fact('Owner', esc(item.owner)) + fact('Current state', status(item.state)) + fact('Related store', storeLink) + fact('Recommended action', esc(item.action)) + '</div>' +
      '<div class="ops-layout"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">What needs attention</div></div></div><div class="ops-panel-body"><p class="pcx-copy">' + esc(item.detail) + '</p><div class="ops-note">Use the linked store or operational module to investigate. This task records the decision and next step; it does not change merchant-facing checkout configuration.</div></div></section><aside class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Decision record</div></div></div><div class="ops-panel-body"><div class="ops-health-row"><div><strong>Opened</strong><span>Jul 29, 2026 · platform monitoring</span></div></div><div class="ops-health-row"><div><strong>Next step</strong><span>' + esc(item.action) + '</span></div></div><div class="ops-inline-actions"><button class="btn btn-primary" id="taskReview">Mark as reviewed</button><a class="btn btn-default" href="#/action-center">Back to overview</a></div></div></aside></div>';
    render(root, page(item.title, 'A platform work item with a clear owner, safe next action and audit trail.', item.storeId ? '<a class="btn btn-default" href="#/stores/' + esc(item.storeId) + '">Open store</a>' : '', body, back('#/action-center', 'Overview')),
      function (scope) {
        scope.querySelector('#taskReview').onclick = function () {
          confirmDialog('Mark task as reviewed', 'This records that the operating team reviewed the task. It does not automatically make a service change.', 'Record review', function () {
            item.state = 'In review'; audit('Reviewed operational task', item.title, 'In review'); toast('Review recorded.'); task(root, item.id);
          });
        };
      });
  }

  /* ---------- Stores and merchant organizations ---------- */
  function installLabel(code) {
    return ({
      preparing: 'Preparing install link',
      ready: 'Ready to install',
      expired: 'Install link expired',
      failed: 'Install failed',
      connected: 'Connected',
      reauth: 'Reauthorization needed'
    })[code] || code || '—';
  }
  function findInstall(storeId) {
    return (B.installs || []).filter(function (item) { return item.storeId === storeId; })[0] || null;
  }
  function installCode(item) {
    return item.installStatus || '';
  }
  function isShopifyConnected(item) {
    var code = installCode(item);
    return code === 'connected' || code === 'reauth';
  }
  function storeInstall(item) {
    if (item.type !== 'bestcheckout' && !installCode(item)) return '';
    return installLabel(installCode(item) || 'preparing');
  }
  function storeSetup(item) {
    var connected = item.type !== 'bestcheckout' || isShopifyConnected(item);
    var domain = item.domainSetup || (item.domainHealth === 'Healthy' ? 'Verified' : 'Pending');
    var payment = item.paymentSetup || 'Not connected';
    var checks = [
      { key: 'domain', short: 'Domain check', name: 'Domain verification', status: domain, ok: domain === 'Verified' },
      { key: 'payment', short: 'Payment check', name: 'Payment configuration', status: payment, ok: payment === 'Configured' }
    ];
    if (!connected) return { label: '', available: false, checks: checks, missing: checks };
    var missing = checks.filter(function (check) { return !check.ok; });
    var label = !missing.length ? 'Ready' : (missing.length === 1 ? (missing[0].key === 'domain' ? 'Domain pending' : 'Payment pending') : 'Setup incomplete');
    return { label: label, available: true, checks: checks, missing: missing };
  }
  function setupCheckLabel(check) {
    var name = check.key === 'payment' ? 'Payment' : 'Domain';
    return name + (check.ok ? ' connected' : ' not connected');
  }
  function storeSetupTags(setup) {
    return '<div class="ops-setup-tags">' + setup.checks.map(function (check) {
      return status(setupCheckLabel(check));
    }).join('') + '</div>';
  }
  function uniqueNames(list) {
    var seen = {};
    return (list || []).filter(function (name) {
      var key = String(name || '').toLowerCase();
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }
  function storeConnectedDomains(item) {
    var setup = storeSetup(item);
    var domainCheck = setup.checks.filter(function (check) { return check.key === 'domain'; })[0];
    if (!domainCheck || !domainCheck.ok) return [];
    var usage = item.type === 'bestcheckout' ? 'checkout' : 'storefront';
    var hosts = (C.hosts || []).filter(function (host) {
      return host.storeId === item.id && host.usage === usage && (host.dns === 'Verified' || host.status === 'Live');
    }).map(function (host) { return host.host; });
    if (item.type !== 'bestcheckout') {
      var defaultHost = String(storeDefaultHost(item) || '').toLowerCase();
      hosts = hosts.filter(function (host) {
        return String(host).toLowerCase() !== defaultHost && !/\.stores\.bestshopio\.com$/i.test(host);
      });
      var primary = storePrimaryHost(item);
      if (primary) {
        hosts = [primary].concat(hosts.filter(function (host) {
          return String(host).toLowerCase() !== String(primary).toLowerCase();
        }));
      }
      return uniqueNames(hosts);
    }
    if (hosts.length) return uniqueNames(hosts);
    if (item.primaryDomain) return [item.primaryDomain];
    var ops = ((D.bestcheckoutOps && D.bestcheckoutOps.stores) || []).filter(function (row) { return row.id === item.id; })[0];
    var readyHost = ops && ops.readiness && ops.readiness.domain;
    if (readyHost && readyHost.status === 'Verified' && readyHost.value) return [readyHost.value];
    return [];
  }
  function storePayments(item) {
    var pay = item.payments || {};
    return {
      configured: uniqueNames(pay.configured || []),
      active: uniqueNames(pay.active || [])
    };
  }
  function storePaymentText(values) {
    return values.length ? values.map(function (name) { return '<span class="i18n-skip">' + esc(name) + '</span>'; }).join('<span class="ops-hero-sep"> · </span>') : '<span>—</span>';
  }
  function storeOverviewHosts(values, item) {
    return values.map(function (host) {
      return item ? storePreviewLink(item, host) : '<span class="i18n-skip">' + esc(host) + '</span>';
    }).join('<span class="ops-hero-sep"> · </span>');
  }
  function statusOrDash(value) {
    return value ? status(value) : '<span class="ops-meta">—</span>';
  }
  function storeUsage(item) {
    return (C.storeOps && C.storeOps[item.id]) || null;
  }
  function bcSyncItems(status, note) {
    return [
      { name: 'Products, variants & inventory', status: status, note: note },
      { name: 'Collections', status: status, note: note },
      { name: 'Customers', status: status, note: note },
      { name: 'Discounts', status: status, note: note },
      { name: 'Shipping rates', status: status, note: note },
      { name: 'Store settings', status: status, note: note },
      { name: 'Subscriptions', status: status, note: note },
      { name: 'Order writeback', status: status, note: note }
    ];
  }
  function emptyBsUsage() {
    return {
      kind: 'bestshopio',
      products: 0, productsLive: 0,
      collections: 0, collectionsPublished: 0,
      customers: 0,
      discounts: 0, discountsActive: 0,
      reviews: 0, reviewsPending: 0,
      ordersTotal: 0, orders7d: 0,
      gmv: '$0', aov: '$0'
    };
  }
  function emptyBcUsage(connected) {
    var status = connected ? 'Pending' : 'Waiting';
    var note = connected ? 'No data yet' : 'Starts after the store is connected';
    return {
      kind: 'bestcheckout',
      flowsTotal: 0, flowsActive: 0, pagesTotal: 0, pagesActive: 0,
      bundlesTotal: 0, bundlesActive: 0, subsTotal: 0, subsSynced: 0, subsCreated: 0,
      contracts: 0, contractsActive: 0, contractsPastDue: 0, contractsCancelled: 0,
      ordersTotal: 0, ordersSynced: 0, gmv: '$0', aov: '$0',
      flows: [],
      syncStatus: status,
      syncNote: 'Shopify catalog pull and order writeback',
      syncChecked: '',
      syncItems: bcSyncItems(status, note)
    };
  }
  function detailUsage(record) {
    return storeUsage(record) || (record.type === 'bestcheckout' ? emptyBcUsage(isShopifyConnected(record)) : emptyBsUsage());
  }
  function opsStamp(ms) {
    var d = new Date(isFinite(ms) ? ms : opsNow());
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var hh = d.getHours();
    var mm = d.getMinutes();
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' ' + (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
  }
  function expireStamp(fromMs) {
    return opsStamp((isFinite(fromMs) ? fromMs : opsNow()) + 7 * 24 * 3600000);
  }
  function shopHandleFromRecord(record) {
    var shop = String((record && record.shopify) || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.myshopify\.com$/i, '');
    if (!shop || shop === '--') return '';
    return shop;
  }
  function generateAuthorizeLink(record, clientId) {
    var shop = shopHandleFromRecord(record) || 'your-store';
    var state = 'bc_' + shop + '_' + Date.now().toString(36);
    return 'https://' + shop + '.myshopify.com/admin/oauth/authorize?client_id=' + encodeURIComponent(clientId) +
      '&scope=read_products&redirect_uri=' + encodeURIComponent('https://api.stores.bestfulfill.tech/sso/sso/bestcheckout/shopify/callback') +
      '&state=' + encodeURIComponent(state);
  }
  function savedClientId(record, install) {
    var item = install || findInstall(record && record.id);
    return String((item && item.clientId) || (record && record.clientId) || '').trim();
  }
  function savedClientSecret(record, install) {
    var item = install || findInstall(record && record.id);
    return String((item && item.clientSecret) || (record && record.clientSecret) || '').trim();
  }
  function hasAppCredentials(record, install) {
    var item = install || findInstall(record && record.id);
    return Boolean(savedClientId(record, item) && (savedClientSecret(record, item) || (item && item.clientSecretSaved) || (record && record.clientSecretSaved)));
  }
  function storeInstallLink(record, install) {
    if (install && install.installLink) return install.installLink;
    if (record && record.installLink) return record.installLink;
    var clientId = savedClientId(record, install);
    return clientId ? generateAuthorizeLink(record, clientId) : '';
  }
  function installLinkAction(code, record, install) {
    if (code === 'preparing' && !hasAppCredentials(record, install)) return 'Enter app credentials';
    if (code === 'preparing') return 'Send install link';
    if (code === 'expired' || code === 'failed') return 'Resend install link';
    return '';
  }
  function ensureInstall(record) {
    var item = findInstall(record.id);
    if (item) return item;
    item = {
      id: 'bc_install_' + String(record.id || '').replace(/^shop_/, ''),
      storeId: record.id,
      shop: record.shopify || '',
      status: installCode(record) || 'preparing',
      submittedAt: record.createdAt || '',
      linkSentAt: '',
      expiresAt: '',
      owner: 'Commerce ops',
      next: record.nextAction || '',
      installLink: record.installLink || '',
      clientId: record.clientId || '',
      clientSecret: record.clientSecret || '',
      clientSecretSaved: Boolean(record.clientSecretSaved || record.clientSecret)
    };
    B.installs = B.installs || [];
    B.installs.push(item);
    return item;
  }
  function validateClientId(value) {
    if (!String(value || '').trim()) return 'Enter the Client ID.';
    return '';
  }
  function validateClientSecret(value, required) {
    if (!required) return '';
    if (!String(value || '').trim()) return 'Enter the Client Secret.';
    return '';
  }
  function applyGeneratedInstallLink(record, clientId, secretSaved, rerender, toastCopy, clientSecret) {
    var item = ensureInstall(record);
    var sentAt = opsStamp(opsNow());
    var link = generateAuthorizeLink(record, clientId);
    var secret = String(clientSecret || item.clientSecret || record.clientSecret || '').trim();
    item.clientId = clientId;
    item.clientSecret = secret;
    item.clientSecretSaved = secretSaved || Boolean(secret);
    item.installLink = link;
    item.status = 'ready';
    item.linkSentAt = sentAt;
    item.expiresAt = expireStamp(opsNow());
    item.next = 'Waiting for merchant to install';
    syncInstallToStore(item);
    record.clientId = clientId;
    record.clientSecret = secret;
    record.clientSecretSaved = secretSaved || Boolean(secret);
    record.installLink = link;
    record.onboarding = record.onboarding || {};
    if (!record.onboarding.createdAt) record.onboarding.createdAt = record.createdAt || sentAt;
    record.onboarding.linkSentAt = sentAt;
    audit('Sent install link', record.name, 'Ready to install');
    toast(toastCopy || 'Install link emailed to the store.');
    if (rerender) rerender();
  }
  function installEmailKind(code) {
    return (code === 'expired' || code === 'failed') ? 'renew' : 'first';
  }
  function installEmailPreviewHref(record, kind, link) {
    var query = 'store=' + encodeURIComponent(record.id) + '&kind=' + encodeURIComponent(kind || 'first');
    if (link) query += '&link=' + encodeURIComponent(link);
    return location.pathname + location.search + '#/install-email-preview?' + query;
  }
  function shopifyDomain(record) {
    var shop = String((record && record.shopify) || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (shop && shop !== '--') return shop;
    return 'your-store.myshopify.com';
  }
  function installEmailPreview(root, query) {
    var params = query || {};
    var record = findStore(params.store) || {};
    var install = findInstall(record.id);
    var kind = params.kind === 'renew' ? 'renew' : 'first';
    var link = String(params.link || storeInstallLink(record, install) || (savedClientId(record, install) ? generateAuthorizeLink(record, savedClientId(record, install)) : '') || 'https://');
    var email = storeEmail(record) || 'store@example.com';
    var domain = shopifyDomain(record);
    var isRenew = kind === 'renew';
    var subject = isRenew ? ('Your new BestCheckout install link for ' + domain) : ('Install BestCheckout on ' + domain);
    var title = isRenew ? 'Your previous install link has expired' : 'Install BestCheckout on your Shopify store';
    var lead = isRenew
      ? 'This install link is valid for 7 days. The previous link for <b class="i18n-skip">' + esc(domain) + '</b> can no longer be used. This is the new install link. Open it with the <b>store owner</b> account for this shop.'
      : 'Your install link for <b class="i18n-skip">' + esc(domain) + '</b> is ready. Open it with the <b>store owner</b> account for this shop.';
    var expiry = 'This install link expires in 7 days. Please install it as soon as possible.';
    var note = isRenew
      ? 'Do not use the old email or the expired link. Do not open this while signed into a different Shopify store.'
      : 'Do not open this while signed into a different Shopify store.';
    var context = isRenew
      ? 'Prototype-only · replacement install email after the previous link expired.'
      : 'Prototype-only · install email sent after BestCheckout prepares the Custom App.';
    var arrow = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>';
    root.innerHTML =
      '<div class="verification-email-page">' +
        '<main class="verification-email-wrap">' +
          '<p class="verification-email-context">' + esc(context) + '</p>' +
          '<section class="verification-email-inbox" aria-label="Email metadata">' +
            '<p><span>From</span><b>BestCheckout</b> <small>&lt;no-reply@bestcheckout.com&gt;</small></p>' +
            '<p><span>To</span><b class="i18n-skip">' + esc(email) + '</b></p>' +
            '<p><span>Subject</span><b>' + esc(subject) + '</b></p>' +
          '</section>' +
          '<section class="verification-email-stage">' +
            '<article class="verification-email-card">' +
              '<div class="verification-email-bar"></div>' +
              '<header><div class="verification-email-brand"><img src="assets/bestcheckout-brand-mark.svg?v=20260908-bcmark1" alt="" aria-hidden="true"/><strong>BestCheckout</strong></div></header>' +
              '<main>' +
                '<h1>' + esc(title) + '</h1>' +
                '<p class="verification-email-lead">' + lead + '</p>' +
                '<p class="verification-email-lead">' + esc(expiry) + '</p>' +
                '<div class="connect-form-actions verification-email-install-actions">' +
                  '<a class="portal-submit" href="' + esc(link) + '" target="_blank" rel="noopener">Install <span class="i18n-skip">' + esc(domain) + '</span> ' + arrow + '</a>' +
                '</div>' +
                '<p class="verification-email-note">' + esc(note) + '</p>' +
              '</main>' +
              '<footer><p>This is an automated message from BestCheckout — please don’t reply.</p><small>© 2026 BestCheckout</small></footer>' +
            '</article>' +
          '</section>' +
        '</main>' +
      '</div>';
    document.title = subject;
    apply(root);
  }
  function openInstallLinkModal(record, rerender, mode) {
    if (!pc().modal) return;
    var item = findInstall(record.id);
    var code = installCode(record) || (item && item.status) || 'preparing';
    var kind = installEmailKind(code);
    var currentLink = storeInstallLink(record, item);
    var clientId = savedClientId(record, item);
    var replaceMode = mode === 'replace' || !hasAppCredentials(record, item);
    var previewLink = currentLink || (clientId ? generateAuthorizeLink(record, clientId) : '');

    function credentialFields(idValue, secretValue) {
      return '<label class="fld-label required">Client ID</label>' +
        '<input class="input" id="opsClientId" value="' + esc(idValue || '') + '" placeholder="Please enter Client ID" autocomplete="off" spellcheck="false">' +
        '<div class="sh-fld-error" id="opsClientIdError" hidden></div>' +
        '<label class="fld-label required" style="margin-top:12px">Client Secret</label>' +
        '<input class="input" id="opsClientSecret" type="text" value="' + esc(secretValue || '') + '" placeholder="Please enter Client Secret" autocomplete="off" spellcheck="false">' +
        '<div class="sh-fld-error" id="opsClientSecretError" hidden></div>';
    }

    if (replaceMode) {
      var hasSaved = hasAppCredentials(record, item);
      var savedSecret = savedClientSecret(record, item);
      var enterCopy = 'Enter this store\'s Custom App Client ID and Secret. We\'ll generate an install link and email it to the store owner. The link is valid for 7 days. You can review the credentials on this store anytime.';
      var replaceCopy = 'Only replace credentials if this store has a new Custom App. Saving overwrites the current Client ID and Secret, generates a new install link, emails the store owner, and the previous link stops working. The new link is valid for 7 days. If this store is already connected, the merchant must install and authorize again.';
      pc().modal(
        '<div class="modal-head">' + esc(hasSaved ? 'Replace app credentials' : 'Enter app credentials') + '</div>' +
        '<div class="modal-body">' +
          credentialFields(hasSaved ? clientId : '', hasSaved ? savedSecret : '') +
          (hasSaved
            ? '<div class="ops-note ops-warning" style="margin-top:12px">' + replaceCopy + '</div>'
            : '<p class="pcx-modal-copy" style="margin-top:10px">' + enterCopy + '</p>') +
          '<a class="ops-preview-email" id="opsPreviewEmail" href="' + esc(installEmailPreviewHref(record, kind, previewLink)) + '" target="_blank" rel="noopener">Preview email</a>' +
        '</div>' +
        '<div class="modal-foot"><button type="button" class="btn btn-default" data-mx>Cancel</button><button type="button" class="btn btn-primary" id="opsSave">' + esc(hasSaved ? 'Save and send new link' : 'Send email') + '</button></div>',
        function (layer) {
          var idInput = layer.querySelector('#opsClientId');
          var secretInput = layer.querySelector('#opsClientSecret');
          var idError = layer.querySelector('#opsClientIdError');
          var secretError = layer.querySelector('#opsClientSecretError');
          var preview = layer.querySelector('#opsPreviewEmail');
          function clearError(input, error) {
            input.classList.remove('has-error');
            error.hidden = true;
            error.textContent = '';
          }
          function showError(input, error, message) {
            error.hidden = false;
            error.textContent = message;
            apply(error);
            input.classList.add('has-error');
            input.focus();
          }
          idInput.oninput = function () {
            clearError(idInput, idError);
            clearError(secretInput, secretError);
            preview.href = installEmailPreviewHref(record, kind, idInput.value.trim() ? generateAuthorizeLink(record, idInput.value.trim()) : previewLink);
          };
          secretInput.oninput = function () {
            clearError(idInput, idError);
            clearError(secretInput, secretError);
          };
          layer.querySelector('#opsSave').onclick = function () {
            var nextId = idInput.value.trim();
            var nextSecret = secretInput.value.trim();
            var idMessage = validateClientId(nextId);
            if (idMessage) { showError(idInput, idError, idMessage); return; }
            var secretMessage = validateClientSecret(nextSecret, true);
            if (secretMessage) { showError(secretInput, secretError, secretMessage); return; }
            if (hasSaved && nextId === clientId && nextSecret === savedSecret) {
              showError(idInput, idError, 'Credentials are unchanged. Use Resend install link if you only need a new link.');
              return;
            }
            applyGeneratedInstallLink(record, nextId, true, function () {
              layer.remove();
              rerender();
            }, hasSaved ? 'New app credentials saved. Install link emailed to the store.' : '', nextSecret);
          };
        }
      );
      return;
    }

    pc().modal(
      '<div class="modal-head">Resend install link</div>' +
      '<div class="modal-body">' +
        '<p class="pcx-modal-copy">We\'ll generate a new install link with the saved app credentials and email it to the store owner. The new link is valid for 7 days.</p>' +
        '<a class="ops-preview-email" id="opsPreviewEmail" href="' + esc(installEmailPreviewHref(record, 'renew', previewLink)) + '" target="_blank" rel="noopener">Preview email</a>' +
      '</div>' +
      '<div class="modal-foot"><button type="button" class="btn btn-default" data-mx>Cancel</button><button type="button" class="btn btn-primary" id="opsSave">Resend email</button></div>',
      function (layer) {
        layer.querySelector('#opsSave').onclick = function () {
          applyGeneratedInstallLink(record, clientId, true, function () {
            layer.remove();
            rerender();
          }, 'New install link emailed to the store.');
        };
      }
    );
  }
  function installLinkFact(record, install) {
    var link = storeInstallLink(record, install);
    var code = installCode(record) || (install && install.status) || '';
    var action = installLinkAction(code, record, install);
    var value = link
      ? '<span class="ops-install-link i18n-skip">' + esc(link) + '</span><button type="button" class="ops-install-copy" data-copy-install-link="' + esc(link) + '" title="Copy installation link" aria-label="Copy installation link">' + icon('copy', 12) + '</button>'
      : '<span>—</span>';
    var button = action
      ? '<button type="button" class="btn ' + (code === 'preparing' && !hasAppCredentials(record, install) ? 'btn-primary' : 'btn-default') + ' ops-install-link-btn" data-install-link="' + esc(record.id) + '">' + esc(action) + '</button>'
      : '';
    var replace = hasAppCredentials(record, install)
      ? '<button type="button" class="ops-preview-email ops-install-link-btn" data-replace-credentials="' + esc(record.id) + '">Replace app credentials</button>'
      : '';
    var actions = (button || replace) ? '<div class="ops-install-actions">' + button + replace + '</div>' : '';
    return '<div class="ops-install-fact"><span>Installation link</span><strong class="ops-install-value">' + value + '</strong>' + actions + '</div>';
  }
  function credentialFacts(record, install) {
    var id = savedClientId(record, install);
    var secret = savedClientSecret(record, install);
    return '<div class="ops-credential-fact"><span>Client ID</span><strong class="i18n-skip">' + (id ? esc(id) : '—') + '</strong></div>' +
      '<div class="ops-credential-fact"><span>Client Secret</span><strong class="i18n-skip">' + (secret ? esc(secret) : '—') + '</strong></div>';
  }
  function installView(record, install) {
    var board = record.onboarding || {};
    return {
      id: (install && install.id) || '',
      status: (install && install.status) || installCode(record) || 'preparing',
      submittedAt: (install && install.submittedAt) || record.createdAt || '—',
      linkSentAt: (install && install.linkSentAt) || board.linkSentAt || '',
      expiresAt: (install && install.expiresAt) || ''
    };
  }
  function storeHandle(name) {
    return String(name || 'store').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'store';
  }
  function storeDefaultHost(item) {
    return item.defaultDomain || (storeHandle(item.name) + '.stores.bestshopio.com');
  }
  function isStorefrontConnected(host) {
    return host && host.usage === 'storefront' && host.dns !== 'Pending' && (host.status === 'Live' || host.dns === 'Verified');
  }
  function storePrimaryHost(item) {
    var found = (C.hosts || []).filter(function (host) {
      return host.storeId === item.id && isStorefrontConnected(host) && !/\.stores\.bestshopio\.com$/i.test(host.host);
    })[0];
    if (found) return found.host;
    if (item.primaryDomain && item.domainSetup === 'Verified') return item.primaryDomain;
    return '';
  }
  function storeSource(item) {
    if (item.type === 'bestcheckout') return (item.shopify && item.shopify !== '--') ? item.shopify : 'Shopify';
    return storePrimaryHost(item) || storeDefaultHost(item);
  }
  function hostPreviewUrl(host) {
    if (!host || host === 'Shopify' || host === 'BestShopio' || host === '--') return '';
    return /^https?:\/\//i.test(host) ? host : 'https://' + host;
  }
  function storePreviewUrl(item) {
    return hostPreviewUrl(storeSource(item));
  }
  function storePreviewLink(item, label) {
    var host = label || storeSource(item);
    var url = hostPreviewUrl(host);
    if (!url) return host ? '<span>' + esc(host) + '</span>' : '';
    return '<a class="ops-store-preview" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" title="Open store" aria-label="Open store"><span>' + esc(host) + '</span>' + icon('external', 12) + '</a>';
  }
  function storeShopId(item) {
    return item.shopId || '';
  }
  function storeEmail(item) {
    var org = findOrganization(item.organizationId);
    return (org && org.email) || item.email || '';
  }
  function storeNameCell(item) {
    var shopId = storeShopId(item);
    return '<div class="ops-store-cell"><a class="ops-row-link" href="#/stores/' + esc(item.id) + '"><strong>' + esc(item.name) + '</strong></a>' + storePreviewLink(item) + (shopId ? '<span class="ops-store-id" data-copy-shopid="' + esc(shopId) + '" title="Copy Shop ID" role="button"><span class="ops-store-id-text"><span>Shop ID</span>: <span class="i18n-skip">' + esc(shopId) + '</span></span><button type="button" class="ops-store-id-copy" data-copy-shopid="' + esc(shopId) + '" title="Copy Shop ID" aria-label="Copy Shop ID">' + icon('copy', 12) + '</button></span>' : '') + '</div>';
  }
  function storeStatusLabel(code) {
    return ({ Active: 'Enabled', Provisioning: 'Opening', Suspended: 'Disabled' })[code] || code || '—';
  }
  function onboardAt(record, key, install) {
    var board = record.onboarding || {};
    if (key === 'linkSentAt') return board.linkSentAt || (install && install.linkSentAt) || '';
    return board[key] || '';
  }
  function parseOpsDate(value) {
    var ms = Date.parse(value);
    return isFinite(ms) ? ms : 0;
  }
  function opsNow() {
    return Date.parse('Sep 8, 2026 14:30');
  }
  function formatOpsDate(value) {
    if (!value) return '—';
    return String(value).replace(/\s+\d{1,2}:\d{2}$/, '').trim();
  }
  function spanHours(fromValue, toValue) {
    var from = parseOpsDate(fromValue);
    var to = toValue ? parseOpsDate(toValue) : opsNow();
    if (!from || !to) return 0;
    return Math.round((to - from) / 3600000);
  }
  function spanLabel(fromValue, toValue) {
    var hours = Math.abs(spanHours(fromValue, toValue));
    if (hours <= 0) return 'Same day';
    if (hours < 24) return hours === 1 ? '1 hour' : (hours + ' hours');
    var days = Math.round(hours / 24);
    if (days === 1) return '1 day';
    return days + ' days';
  }
  function lastDatedStep(steps, beforeIndex) {
    for (var i = beforeIndex; i >= 0; i--) {
      if (steps[i] && steps[i].at) return steps[i];
    }
    return null;
  }
  function isDomainSkipped(steps, step) {
    if (step.key !== 'domain' || step.at) return false;
    var payment = steps.filter(function (item) { return item.key === 'payment'; })[0];
    var order = steps.filter(function (item) { return item.key === 'order'; })[0];
    return !!(payment && payment.at && order && order.at);
  }
  function openLabel(fromValue) {
    var hours = Math.max(0, spanHours(fromValue));
    if (hours < 24) return hours === 1 ? '1 hour' : (hours + ' hours');
    var days = Math.round(hours / 24);
    if (days === 1) return '1 day';
    return days + ' days';
  }
  function waitingLabel(fromValue) {
    var hours = Math.max(0, spanHours(fromValue));
    if (hours < 24) return hours === 1 ? 'Waiting 1 hour' : ('Waiting ' + hours + ' hours');
    var days = Math.round(hours / 24);
    return days === 1 ? 'Waiting 1 day' : ('Waiting ' + days + ' days');
  }
  function bindPair(payment, domain) {
    var payAt = parseOpsDate(payment.at);
    var domainAt = parseOpsDate(domain.at);
    if (domainAt && (!payAt || domainAt < payAt)) return [domain, payment];
    return [payment, domain];
  }
  function onboardSteps(record, install) {
    var createdStep = { key: 'created', label: 'Store created', at: onboardAt(record, 'createdAt') || record.createdAt || '' };
    var payment = { key: 'payment', label: 'Payment bound', at: onboardAt(record, 'paymentBoundAt') };
    var domain = { key: 'domain', label: record.type === 'bestcheckout' ? 'Checkout domain bound' : 'Storefront domain bound', at: onboardAt(record, 'domainBoundAt') };
    var binds = bindPair(payment, domain);
    var order = { key: 'order', label: 'First order received', at: onboardAt(record, 'firstOrderAt') };
    if (record.type !== 'bestcheckout') return [createdStep].concat(binds, [order]);
    return [
      createdStep,
      { key: 'link', label: 'Install link sent', at: onboardAt(record, 'linkSentAt', install) },
      { key: 'installed', label: 'Installation complete', at: onboardAt(record, 'installedAt') }
    ].concat(binds, [order]);
  }
  function onboardState(record, install) {
    var steps = onboardSteps(record, install);
    var current = -1;
    steps.forEach(function (step, index) {
      if (step.at) step.tone = 'done';
      else if (isDomainSkipped(steps, step)) step.tone = 'skipped';
      else if (current < 0) { step.tone = 'current'; current = index; }
      else step.tone = 'wait';
    });
    var firstAt = steps[0] && steps[0].at;
    var last = steps[steps.length - 1];
    var summary = '';
    if (last && last.at && firstAt) {
      summary = '<div class="ops-onboard-summary"><span>Store created → first order</span><strong>' + esc(spanLabel(firstAt, last.at)) + '</strong></div>';
    } else if (firstAt) {
      summary = '<div class="ops-onboard-summary"><span>Open for</span><strong>' + esc(openLabel(firstAt)) + '</strong></div>';
    }
    return { steps: steps, summary: summary };
  }
  function onboardPanel(record, install) {
    var state = onboardState(record, install);
    var steps = state.steps;
    var track = steps.map(function (step, index) {
      var next = steps[index + 1];
      var dateText = step.tone === 'skipped' ? 'Default domain' : formatOpsDate(step.at);
      var dateHtml = step.tone === 'skipped'
        ? '<span>' + esc(dateText) + '</span>'
        : '<span class="i18n-skip">' + esc(dateText) + '</span>';
      var node = '<div class="ops-onboard-step is-' + step.tone + '"><strong>' + esc(step.label) + '</strong><i></i>' + dateHtml + '</div>';
      if (!next) return node;
      var gapCls = 'ops-onboard-gap';
      var gapText = '';
      if (step.at && next.at) {
        gapCls += ' is-done';
        gapText = spanLabel(step.at, next.at);
      } else if (next.tone === 'skipped' && step.at) {
        gapCls += ' is-skip';
      } else if (step.tone === 'skipped' && next.at) {
        var prev = lastDatedStep(steps, index - 1);
        gapCls += ' is-done';
        if (prev) gapText = spanLabel(prev.at, next.at);
      } else if (step.at && !next.at) {
        gapCls += ' is-wait';
        gapText = waitingLabel(step.at);
      } else {
        gapCls += ' is-empty';
      }
      return node + '<div class="' + gapCls + '"><span>' + (gapText ? esc(gapText) : '') + '</span><b></b></div>';
    }).join('');
    return '<section class="ops-panel ops-onboard"><div class="ops-panel-head"><div class="ops-onboard-head"><div class="ops-onboard-title-row"><div class="ops-panel-title">Onboarding</div>' + state.summary + '</div><div class="ops-panel-sub">Where setup is stuck, and how long each step took.</div></div></div><div class="ops-panel-body ops-onboard-body"><div class="ops-onboard-scroll"><div class="ops-onboard-track">' + track + '</div></div></div></section>';
  }
  function storeRows(list) {
    if (!list.length) return listEmpty('No stores match these filters.');
    return list.map(function (item) {
      var setup = storeSetup(item);
      return '<tr data-store="' + esc(item.id) + '"><td>' + storeNameCell(item) + '</td><td class="hide-md">' + esc(item.product) + '</td><td>' + status(storeStatusLabel(item.lifecycle)) + '</td><td class="hide-sm">' + statusOrDash(storeInstall(item)) + '</td><td class="hide-xs">' + storeSetupTags(setup) + '</td><td><a class="ops-act" href="#/stores/' + esc(item.id) + '" title="View" aria-label="View">' + icon('eye', 16) + '</a></td></tr>';
    }).join('');
  }
  function storeDetail(root, id) {
    var record = findStore(id);
    if (!record) { stores(root, []); return; }
    var install = findInstall(record.id);
    var isBc = record.type === 'bestcheckout';
    var usage = detailUsage(record);
    var connectedDomains = storeConnectedDomains(record);
    var payments = storePayments(record);
    var email = storeEmail(record);
    var setupFacts =
      '<div><span>Email</span><strong>' + (email ? '<span class="i18n-skip">' + esc(email) + '</span>' : '<span>—</span>') + '</strong></div>' +
      '<div><span>Connected domain</span><strong>' + (connectedDomains.length ? storeOverviewHosts(connectedDomains, isBc ? null : record) : '<span>—</span>') + '</strong></div>' +
      '<div><span>Configured payment providers</span><strong>' + storePaymentText(payments.configured) + '</strong></div>' +
      '<div><span>Active payment providers</span><strong>' + storePaymentText(payments.active) + '</strong></div>' +
      (isBc ? credentialFacts(record, install) + installLinkFact(record, install) : '<div class="ops-created-fact"><span>Created at</span><strong>' + esc(record.createdAt || '—') + '</strong></div>');
    var hero = '<section class="ops-panel ops-store-hero"><div class="ops-panel-head"><div><div class="ops-panel-title">Overview</div></div><div class="ops-store-hero-status">' + status(storeStatusLabel(record.lifecycle)) + (storeInstall(record) ? status(storeInstall(record)) : '') + storeSetupTags(storeSetup(record)) + '</div></div><div class="ops-store-hero-main"><div class="ops-store-hero-meta">' +
      '<div><span>Store name</span><strong>' + esc(record.name) + '</strong></div>' +
      '<div><span>Store type</span><strong>' + esc(record.product) + '</strong></div>' +
      '<div><span>Shop ID</span><strong>' + esc(storeShopId(record) || '—') + '</strong></div>' +
      '<div><span>' + (isBc ? 'Shopify domain' : 'Store domain') + '</span><strong>' + storePreviewLink(record, isBc ? (record.shopify || '—') : storeDefaultHost(record)) + '</strong></div>' +
      '</div></div>' +
      (setupFacts ? '<div class="ops-store-hero-setup">' + setupFacts + '</div>' : '') +
      '</section>';
    var kpis;
    var purchaseFlows = [];
    var usagePanel = '';
    var syncPanel = '';
    if (isBc) {
      kpis = '<div class="ops-kpi-grid ops-kpi-grid-4">' +
        kpiHtml('Flows', usage ? usage.flowsTotal : '—', usage ? kpiCountNote(usage.flowsActive, 'in use') : '') +
        kpiHtml('Pages', usage ? usage.pagesTotal : '—', usage ? kpiCountNote(usage.pagesActive, 'in use') : '') +
        kpiHtml('Bundles', usage ? usage.bundlesTotal : '—', usage ? kpiCountNote(usage.bundlesActive, 'in use') : '') +
        kpiHtml('Subscriptions', usage ? usage.subsTotal : '—', usage ? kpiCountNote(usage.subsSynced, 'already synced') + '<span> · </span>' + kpiCountNote(usage.subsCreated, 'created here') : '') +
        kpiHtml('Contracts', usage ? usage.contracts : '—', usage ? contractNote(usage) : '') +
        kpiHtml('Orders', usage ? usage.ordersTotal : '—', usage ? orderSyncNote(usage) : '') +
        kpi('GMV', usage ? usage.gmv : '—') +
        kpi('AOV', usage ? usage.aov : '—') +
        '</div>';
      purchaseFlows = ((usage && usage.flows) || []).slice().sort(function (a, b) { return Number(b.priority || 0) - Number(a.priority || 0); });
      usagePanel = '<section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Purchase flows</div></div></div><div class="ops-panel-body ops-flow-body"><table class="ops-flow-table"><thead><tr><th>Purchase flow name</th><th>Priority</th><th>Funnel type</th><th>Traffic</th><th>Conversion</th><th>AOV</th><th>Status</th></tr></thead><tbody id="storeFlowRows"></tbody></table></div><div class="ops-table-foot"><span class="ops-table-total" id="storeFlowTotal"></span><div class="pg" id="storeFlowPagination"></div></div></section>';
      var syncItems = (usage && usage.syncItems && usage.syncItems.length) ? usage.syncItems : emptyBcUsage(isShopifyConnected(record)).syncItems;
      var syncSub = 'Shopify catalog pull and order writeback.';
      var syncBody = syncItems.length
        ? syncItems.map(function (item) {
            var syncName = item.name === 'Collections'
              ? (window.I18N && window.I18N.lang === 'zh' ? '商品系列' : 'Collections')
              : item.name;
            return '<div class="ops-health-row"><div><strong' + (item.name === 'Collections' ? ' class="i18n-skip"' : '') + '>' + esc(syncName) + '</strong><span>' + esc(item.note) + '</span></div>' + status(item.status) + '</div>';
          }).join('')
        : '<div class="ops-empty ops-empty-compact"><strong>Waiting for connection</strong><p>Product, collection, customer, discount, shipping, store setting, subscription and writeback sync appear after the store is connected.</p></div>';
      syncPanel = '<section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Data sync</div><div class="ops-panel-sub">' + esc(syncSub) + (usage && usage.syncChecked ? '<span> · </span><span>' + esc(usage.syncChecked) + '</span>' : '') + '</div></div>' + (usage ? status(usage.syncStatus) : '') + '</div><div class="ops-panel-body">' + syncBody + '</div></section>';
    } else {
      var catalog = usage || emptyBsUsage();
      kpis = '<div class="ops-kpi-grid ops-kpi-grid-4">' +
        catalogKpi('Products', '商品', catalog.products, kpiCountNote(catalog.productsLive || 0, 'on the storefront')) +
        catalogKpi('Collections', '商品系列', catalog.collections, kpiCountNote(catalog.collectionsPublished || 0, 'visible in the catalog')) +
        catalogKpi('Customers', '客户', catalog.customers, '') +
        catalogKpi('Discounts', '促销', catalog.discounts, kpiCountNote(catalog.discountsActive || 0, 'in effect')) +
        catalogKpi('Reviews', '评价', catalog.reviews, kpiCountNote(catalog.reviewsPending || 0, 'awaiting reply')) +
        catalogKpi('Orders', '订单', catalog.ordersTotal, kpiCountNote(catalog.orders7d || 0, 'in the last 7 days')) +
        kpi('GMV', catalog.gmv) +
        kpi('AOV', catalog.aov) +
        '</div>';
    }
    var timeline = onboardPanel(record, install);
    var extra = usagePanel + syncPanel;
    var body = '<div class="ops-store-detail">' + hero + timeline + kpis + (extra ? '<div class="ops-layout ops-layout-single"><div class="ops-stack">' + extra + '</div></div>' : '') + '</div>';
    render(root, page(record.name, '', '', body, '', '#/stores'),
      function (scope) {
        var installLinkBtn = scope.querySelector('[data-install-link]');
        if (installLinkBtn) {
          installLinkBtn.onclick = function (event) {
            event.stopPropagation();
            openInstallLinkModal(record, function () { stores(root, [record.id]); });
          };
        }
        var replaceCredBtn = scope.querySelector('[data-replace-credentials]');
        if (replaceCredBtn) {
          replaceCredBtn.onclick = function (event) {
            event.stopPropagation();
            openInstallLinkModal(record, function () { stores(root, [record.id]); }, 'replace');
          };
        }
        var copyInstallBtn = scope.querySelector('[data-copy-install-link]');
        if (copyInstallBtn) {
          copyInstallBtn.onclick = function (event) {
            event.stopPropagation();
            copyText(copyInstallBtn.getAttribute('data-copy-install-link'), 'Installation link copied');
          };
        }
        var flowRowsEl = scope.querySelector('#storeFlowRows');
        if (flowRowsEl) {
          var flowPage = 1;
          var flowPageSize = 10;
          function drawFlows() {
            var pager = pagerHtml(flowPage, flowPageSize, purchaseFlows.length, 'flow-page', 'storeFlowPageSize');
            flowPage = pager.page;
            var start = (flowPage - 1) * flowPageSize;
            flowRowsEl.innerHTML = flowRows(purchaseFlows.slice(start, start + flowPageSize));
            scope.querySelector('#storeFlowTotal').textContent = 'Total ' + purchaseFlows.length + ' purchase flows';
            scope.querySelector('#storeFlowPagination').innerHTML = pager.html;
            var sizeEl = scope.querySelector('#storeFlowPageSize');
            if (sizeEl) sizeEl.onchange = function () { flowPageSize = Number(sizeEl.value) || 10; flowPage = 1; drawFlows(); };
            if (window.I18N && window.I18N.apply) {
              window.I18N.apply(flowRowsEl);
              window.I18N.apply(scope.querySelector('.ops-table-foot'));
            }
          }
          scope.querySelector('#storeFlowPagination').onclick = function (event) {
            var item = event.target.closest('[data-flow-page]');
            if (!item) return;
            flowPage = Number(item.getAttribute('data-flow-page')) || 1;
            drawFlows();
          };
          drawFlows();
        }
      });
  }
  function stores(root, parts) {
    var id = cleanPart(parts && parts[0]);
    if (id) { storeDetail(root, id); return; }
    var typeOptions = [{ value: 'BestShopio', label: 'BestShopio' }, { value: 'BestCheckout', label: 'BestCheckout' }];
    var statusOptions = [{ value: 'Active', label: 'Enabled' }, { value: 'Provisioning', label: 'Opening' }, { value: 'Suspended', label: 'Disabled' }];
    var installOptions = [
      { value: 'preparing', label: 'Preparing install link' },
      { value: 'ready', label: 'Ready to install' },
      { value: 'expired', label: 'Install link expired' },
      { value: 'failed', label: 'Install failed' },
      { value: 'reauth', label: 'Reauthorization needed' },
      { value: 'connected', label: 'Connected' }
    ];
    var setupOptions = [
      { value: 'domain-ok', label: 'Domain connected' },
      { value: 'domain', label: 'Domain not connected' },
      { value: 'payment-ok', label: 'Payment connected' },
      { value: 'payment', label: 'Payment not connected' }
    ];
    var body = '<div class="ops-table-card"><div class="ops-filter-bar">' +
      '<div class="ops-kw"><select class="filter-select" id="storeSearchField" data-ui-fit data-ui-match-width style="border-top-right-radius:0;border-bottom-right-radius:0"><option value="name">Store name</option><option value="domain">Domain</option><option value="shopId">Shop ID</option></select>' +
      '<span class="ops-search"><input id="storeSearch" placeholder="Search">' + icon('search', 16) + '</span></div>' +
      multiCheckHtml('storeProduct', 'All store types', typeOptions) +
      multiCheckHtml('storeLifecycle', 'All store statuses', statusOptions) +
      multiCheckHtml('storeInstall', 'All install statuses', installOptions) +
      multiCheckHtml('storeSetup', 'All setup statuses', setupOptions) +
      '<div class="ops-filter-tags" id="storeFilterTags"></div></div><div class="ops-table-wrap"><table class="ops-table ops-table-stores"><thead><tr><th>Store</th><th class="hide-md">Store type</th><th>Store status</th><th class="hide-sm">Install</th><th class="hide-xs">Setup</th><th>Action</th></tr></thead><tbody id="storeRows"></tbody></table></div>' +
      '<div class="ops-table-foot"><span class="ops-table-total" id="storeTotal">Total 0 records</span><div class="pg" id="storePagination"></div></div></div>';
    render(root, page('Stores', '', '', body), function (scope) {
      var pageNo = 1;
      var pageSize = 20;
      var lastFilter = '';
      var selectedTypes = [];
      var selectedStatuses = [];
      var selectedInstalls = [];
      var selectedSetup = [];
      var multiState = { open: '', painters: [], paintAll: function () { multiState.painters.forEach(function (paint) { paint(); }); } };
      function optionLabel(options, value) {
        return ((options.filter(function (opt) { return opt.value === value; })[0] || {}).label || value);
      }
      function filterTag(kind, label, values) {
        var valueHtml = values.map(function (value) { return '<span>' + esc(value) + '</span>'; }).join(', ');
        return '<span class="field-pill" data-clear-store="' + kind + '"><span class="muted">' + esc(label) + '</span>: ' + valueHtml + ' <span class="x">&times;</span></span>';
      }
      function paintStoreTags() {
        var tagsEl = scope.querySelector('#storeFilterTags');
        if (!tagsEl) return;
        var query = ((scope.querySelector('#storeSearch') || {}).value || '').trim();
        var tags = [];
        var field = (scope.querySelector('#storeSearchField') || {}).value || 'name';
        var fieldLabel = field === 'shopId' ? 'Shop ID' : (field === 'domain' ? 'Domain' : 'Store name');
        if (query) tags.push(filterTag('keyword', fieldLabel, [query]));
        if (selectedTypes.length) tags.push(filterTag('type', 'Store type', selectedTypes.map(function (value) { return optionLabel(typeOptions, value); })));
        if (selectedStatuses.length) tags.push(filterTag('status', 'Store status', selectedStatuses.map(function (value) { return optionLabel(statusOptions, value); })));
        if (selectedInstalls.length) tags.push(filterTag('install', 'Install', selectedInstalls.map(function (value) { return optionLabel(installOptions, value); })));
        if (selectedSetup.length) tags.push(filterTag('setup', 'Setup', selectedSetup.map(function (value) { return optionLabel(setupOptions, value); })));
        tagsEl.innerHTML = tags.join('');
        if (window.I18N && window.I18N.apply) window.I18N.apply(tagsEl);
      }
      function storeMatchesSearch(item, query, field) {
        if (!query) return true;
        if (field === 'shopId') return storeShopId(item).toLowerCase().indexOf(query) >= 0;
        if (field === 'domain') return storeSource(item).toLowerCase().indexOf(query) >= 0;
        return String(item.name || '').toLowerCase().indexOf(query) >= 0;
      }
      function storeMatchesInstall(item) {
        if (!selectedInstalls.length) return true;
        var code = storeInstall(item) ? installCode(item) || 'preparing' : '';
        return selectedInstalls.indexOf(code) >= 0;
      }
      function storeMatchesSetup(item) {
        if (!selectedSetup.length) return true;
        var setup = storeSetup(item);
        return selectedSetup.some(function (key) {
          var wantOk = /-ok$/.test(key);
          var checkKey = key.replace(/-ok$/, '');
          return setup.checks.some(function (check) { return check.key === checkKey && !!check.ok === wantOk; });
        });
      }
      function pagerHtml(total) {
        var pages = Math.max(1, Math.ceil(total / pageSize));
        if (pageNo > pages) pageNo = pages;
        var html = '<span class="pg-item' + (pageNo <= 1 ? ' disabled' : '') + '"' + (pageNo <= 1 ? '' : ' data-store-page="' + (pageNo - 1) + '"') + '>‹</span>';
        for (var p = 1; p <= pages; p++) html += '<span class="pg-item' + (p === pageNo ? ' active' : '') + '" data-store-page="' + p + '">' + p + '</span>';
        html += '<span class="pg-item' + (pageNo >= pages ? ' disabled' : '') + '"' + (pageNo >= pages ? '' : ' data-store-page="' + (pageNo + 1) + '"') + '>›</span>';
        html += '<select class="pg-size" id="storePageSize" aria-label="Page size"><option value="10"' + (pageSize === 10 ? ' selected' : '') + '>10 / page</option><option value="20"' + (pageSize === 20 ? ' selected' : '') + '>20 / page</option><option value="50"' + (pageSize === 50 ? ' selected' : '') + '>50 / page</option><option value="100"' + (pageSize === 100 ? ' selected' : '') + '>100 / page</option></select>';
        return html;
      }
      function draw() {
        var field = (scope.querySelector('#storeSearchField') || {}).value || 'name';
        var query = (scope.querySelector('#storeSearch').value || '').toLowerCase();
        var filterKey = field + '|' + query + '|' + selectedTypes.slice().sort().join(',') + '|' + selectedStatuses.slice().sort().join(',') + '|' + selectedInstalls.slice().sort().join(',') + '|' + selectedSetup.slice().sort().join(',');
        if (filterKey !== lastFilter) { pageNo = 1; lastFilter = filterKey; }
        var list = (C.stores || []).filter(function (item) {
          return storeMatchesSearch(item, query, field) &&
            (!selectedTypes.length || selectedTypes.indexOf(item.product) >= 0) &&
            (!selectedStatuses.length || selectedStatuses.indexOf(item.lifecycle) >= 0) &&
            storeMatchesInstall(item) &&
            storeMatchesSetup(item);
        });
        var total = list.length;
        var start = (pageNo - 1) * pageSize;
        scope.querySelector('#storeRows').innerHTML = storeRows(list.slice(start, start + pageSize));
        scope.querySelector('#storeTotal').textContent = 'Total ' + total + ' records';
        scope.querySelector('#storePagination').innerHTML = pagerHtml(total);
        paintStoreTags();
        if (window.I18N && window.I18N.apply) window.I18N.apply(scope.querySelector('.ops-table-foot'));
      }
      bindSearch(scope, '#storeSearch', ['#storeSearchField'], draw);
      bindMultiCheck(scope, 'storeProduct', 'All store types', typeOptions, selectedTypes, draw, multiState);
      bindMultiCheck(scope, 'storeLifecycle', 'All store statuses', statusOptions, selectedStatuses, draw, multiState);
      bindMultiCheck(scope, 'storeInstall', 'All install statuses', installOptions, selectedInstalls, draw, multiState);
      bindMultiCheck(scope, 'storeSetup', 'All setup statuses', setupOptions, selectedSetup, draw, multiState);
      scope.querySelector('#storeFilterTags').onclick = function (event) {
        var pill = event.target.closest('[data-clear-store]');
        if (!pill) return;
        var kind = pill.getAttribute('data-clear-store');
        if (kind === 'keyword') scope.querySelector('#storeSearch').value = '';
        if (kind === 'type') selectedTypes.splice(0, selectedTypes.length);
        if (kind === 'status') selectedStatuses.splice(0, selectedStatuses.length);
        if (kind === 'install') selectedInstalls.splice(0, selectedInstalls.length);
        if (kind === 'setup') selectedSetup.splice(0, selectedSetup.length);
        multiState.paintAll();
        draw();
      };
      scope.addEventListener('click', function (event) {
        if (multiState.open && !event.target.closest('.ops-multi-filter')) {
          multiState.open = '';
          multiState.paintAll();
        }
      });
      scope.querySelector('#storeRows').onclick = function (event) {
        var copyBtn = event.target.closest('[data-copy-shopid]');
        if (copyBtn) {
          event.preventDefault();
          event.stopPropagation();
          copyText(copyBtn.getAttribute('data-copy-shopid'), 'Shop ID copied');
          return;
        }
        if (event.target.closest('.ops-store-preview')) return;
        if (event.target.closest('a,button')) return;
        var row = event.target.closest('tr[data-store]');
        if (row) route('#/stores/' + row.getAttribute('data-store'));
      };
      scope.querySelector('#storePagination').onclick = function (event) {
        var next = event.target.getAttribute('data-store-page');
        if (!next) return;
        pageNo = Number(next) || 1;
        draw();
      };
      scope.querySelector('#storePagination').onchange = function (event) {
        if (!event.target || event.target.id !== 'storePageSize') return;
        pageSize = Number(event.target.value) || 20;
        pageNo = 1;
        draw();
      };
      draw();
      setTimeout(function () { multiState.paintAll(); }, 0);
    });
  }

  function organizationRows(list) {
    if (!list.length) return listEmpty('Try another merchant name, contact or lifecycle filter.');
    return list.map(function (item) {
      return '<tr><td style="width:30%">' + linkCell(item.name, item.primary + ' · ' + item.email, '#/organizations/' + item.id) + '</td><td>' + esc(item.stores) + '</td><td class="hide-sm">' + esc(item.plan) + '</td><td>' + status(item.status) + '</td><td><a class="ops-link" href="#/organizations/' + esc(item.id) + '">View</a></td></tr>';
    }).join('');
  }
  function editOrganization(record, root) {
    modalFields('Edit merchant organization', [
      { label: 'Primary contact', html: '<input class="input" id="orgContact" value="' + esc(record.primary) + '">' },
      { label: 'Contact email', html: '<input class="input" id="orgEmail" value="' + esc(record.email) + '">' },
      { label: 'Status', html: '<select class="input" id="orgStatus"><option value="Active"' + (record.status === 'Active' ? ' selected' : '') + '>Active</option><option value="Provisioning"' + (record.status === 'Provisioning' ? ' selected' : '') + '>Provisioning</option><option value="Suspended"' + (record.status === 'Suspended' ? ' selected' : '') + '>Suspended</option></select>' }
    ], 'Save changes', function (layer) {
      record.primary = layer.querySelector('#orgContact').value.trim() || record.primary; record.email = layer.querySelector('#orgEmail').value.trim() || record.email; record.status = layer.querySelector('#orgStatus').value;
      audit('Updated merchant organization', record.name, 'Saved'); layer.remove(); toast('Merchant organization updated.'); organizations(root, [record.id]);
    });
  }
  function organizationDetail(root, id) {
    var record = findOrganization(id);
    if (!record) { organizations(root, []); return; }
    var storesForOrg = (C.stores || []).filter(function (x) { return x.organizationId === record.id; });
    var body = '<div class="ops-info-grid">' + fact('Primary contact', esc(record.primary)) + fact('Contact email', esc(record.email)) + fact('Organization status', status(record.status)) + fact('Store count', esc(record.stores)) + fact('Primary plan', esc(record.plan)) + fact('Identity boundary', 'Merchant organization') + '</div>' +
      '<div class="ops-layout"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Associated stores</div><div class="ops-panel-sub">A merchant organization can own one or more shared store records.</div></div><a class="ops-link" href="#/stores">All stores</a></div><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Store</th><th>Store type</th><th>Store status</th><th></th></tr></thead><tbody>' + storesForOrg.map(function (store) { return '<tr><td>' + linkCell(store.name, store.region, '#/stores/' + store.id) + '</td><td>' + esc(store.product) + '</td><td>' + status(storeStatusLabel(store.lifecycle)) + '</td><td><a class="ops-link" href="#/stores/' + store.id + '">Open</a></td></tr>'; }).join('') + '</tbody></table></div></section><aside class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Access boundary</div></div></div><div class="ops-panel-body"><p class="pcx-copy">Merchant members are managed with the organization and its stores. Platform staff accounts are managed separately in Account and never inherit merchant access automatically.</p><a class="btn btn-default" href="#/account">Open Account</a></div></aside></div>';
    render(root, page(record.name, 'Merchant organization, contact and associated store records.', '<button class="btn btn-primary" id="editOrganization">Edit organization</button>', body, back('#/organizations', 'Merchants')),
      function (scope) { scope.querySelector('#editOrganization').onclick = function () { editOrganization(record, root); }; });
  }
  function organizations(root, parts) {
    var id = cleanPart(parts && parts[0]);
    if (id) { organizationDetail(root, id); return; }
    var body = '<div class="ops-toolbar"><span class="ops-search">' + icon('search', 16) + '<input id="orgSearch" placeholder="Search merchant or contact"></span><select class="ops-select" id="orgStatus"><option value="">All statuses</option><option value="Active">Active</option><option value="Provisioning">Provisioning</option><option value="Suspended">Suspended</option></select></div><div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th style="width:35%">Merchant organization</th><th style="width:12%">Stores</th><th class="hide-sm" style="width:18%">Plan</th><th style="width:18%">Status</th><th></th></tr></thead><tbody id="orgRows"></tbody></table></div></div>';
    render(root, page('Merchants', 'Manage merchant organizations, primary contacts and their associated store records.', '', body), function (scope) {
      function draw() {
        var query = (scope.querySelector('#orgSearch').value || '').toLowerCase(); var state = scope.querySelector('#orgStatus').value;
        var list = (C.organizations || []).filter(function (item) { return (!query || (item.name + ' ' + item.primary + ' ' + item.email).toLowerCase().indexOf(query) >= 0) && (!state || item.status === state); });
        scope.querySelector('#orgRows').innerHTML = organizationRows(list);
      }
      bindSearch(scope, '#orgSearch', ['#orgStatus'], draw); draw();
    });
  }

  /* ---------- Legacy Help Center fallback (deprecated) ---------- */
  /*
   * The maintained content implementation lives in js/pages/content/.
   * This fallback only protects a partially cached static load; new Help
   * Center features must never be added below this marker.
   */
  function helpContent() { return C.content || (C.content = {}); }
  function contentCollections() { var content = helpContent(); return content.collections || (content.collections = []); }
  function collectionForArticle(article) {
    var direct = article && article.collectionId ? findCollection(article.collectionId) : null;
    if (direct) return direct;
    return contentCollections().filter(function (item) {
      return article && item.space === article.space && item.name === article.collection;
    })[0];
  }
  function collectionName(article) {
    var collection = collectionForArticle(article);
    return collection ? collection.name : (article.collection || '—');
  }
  function articlesInCollection(collection) {
    return (helpContent().articles || []).filter(function (article) {
      var assigned = collectionForArticle(article);
      return assigned && assigned.id === collection.id;
    });
  }
  function collectionDepth(collection) {
    var depth = 0, parentId = collection.parentId, guard = 0;
    while (parentId && guard < 8) {
      var parent = findCollection(parentId);
      if (!parent) break;
      depth += 1; parentId = parent.parentId; guard += 1;
    }
    return depth;
  }
  function orderedCollections(space) {
    return contentCollections().filter(function (item) { return !space || item.space === space; }).slice().sort(function (a, b) {
      if (a.space !== b.space) return a.space.localeCompare(b.space);
      if (a.parentId !== b.parentId) return String(a.parentId || '').localeCompare(String(b.parentId || ''));
      if (+a.order !== +b.order) return (+b.order || 0) - (+a.order || 0);
      return a.name.localeCompare(b.name);
    });
  }
  function collectionTree(space) {
    var items = orderedCollections(space), output = [], used = {};
    function append(parentId) {
      items.filter(function (item) { return String(item.parentId || '') === String(parentId || ''); }).forEach(function (item) {
        if (used[item.id]) return;
        used[item.id] = true; output.push({ item: item, depth: collectionDepth(item) }); append(item.id);
      });
    }
    append('');
    items.forEach(function (item) { if (!used[item.id]) { used[item.id] = true; output.push({ item: item, depth: collectionDepth(item) }); } });
    return output;
  }
  function nextCollectionOrder(space) {
    var maximum = 0;
    orderedCollections(space).forEach(function (item) { maximum = Math.max(maximum, +item.order || 0); });
    return maximum + 10;
  }
  function isCollectionDescendant(collection, ancestorId) {
    var parentId = collection && collection.parentId, guard = 0;
    while (parentId && guard < 8) {
      if (parentId === ancestorId) return true;
      var parent = findCollection(parentId);
      if (!parent) return false;
      parentId = parent.parentId; guard += 1;
    }
    return false;
  }
  function contentTabs(active) {
    return '<nav class="tabs ops-content-tabs" aria-label="Help Center sections">' +
      '<a class="tab' + (active === 'articles' ? ' active' : '') + '" href="#/content">Articles</a>' +
      '<a class="tab' + (active === 'collections' ? ' active' : '') + '" href="#/content/collections">Collections</a></nav>';
  }
  function contentLinkCell(title, meta, href) {
    return '<a class="ops-row-link" href="' + esc(href) + '"><strong class="i18n-skip">' + esc(title) + '</strong>' + (meta ? '<span>' + meta + '</span>' : '') + '</a>';
  }
  function articleCollectionOptions(space, selectedId, selectedName) {
    var options = orderedCollections(space), selected = selectedId || '';
    if (!options.length) return '<option value="">No collection available</option>';
    return options.map(function (collection) {
      var isSelected = collection.id === selected || (!selected && collection.name === selectedName);
      return '<option class="i18n-skip" value="' + esc(collection.id) + '"' + (isSelected ? ' selected' : '') + '>' + esc(collection.name) + '</option>';
    }).join('');
  }
  function parentCollectionOptions(space, selectedId, selfId) {
    return '<option value="">No parent (top level)</option>' + orderedCollections(space).filter(function (collection) { return collection.id !== selfId && !isCollectionDescendant(collection, selfId); }).map(function (collection) {
      return '<option class="i18n-skip" value="' + esc(collection.id) + '"' + (collection.id === selectedId ? ' selected' : '') + '>' + esc(Array(collectionDepth(collection) + 1).join('— ') + collection.name) + '</option>';
    }).join('');
  }
  function articleText(article) {
    if (article && Object.prototype.hasOwnProperty.call(article, 'body')) return String(article.body || '');
    return '## Before you start\n\nThis guide helps ' + article.audience.toLowerCase() + ' complete the required setup safely.\n\n## Complete the setup\n\nUse the steps in the relevant backend, then return here if you need more help.';
  }
  function outlineFromText(body) {
    var used = {}, entries = [];
    String(body || '').split(/\r?\n/).forEach(function (line) {
      var match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line.trim());
      if (!match) return;
      var title = match[2].replace(/[`*_]/g, '').trim();
      var base = title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
      used[base] = (used[base] || 0) + 1;
      entries.push({ level: match[1].length, title: title, id: 'outline-' + base + (used[base] > 1 ? '-' + used[base] : '') });
    });
    return entries;
  }
  function renderArticleMarkup(body) {
    var outline = outlineFromText(body), heading = 0, paragraph = [], list = [], html = '';
    function flushParagraph() { if (paragraph.length) { html += '<p>' + paragraph.join(' ') + '</p>'; paragraph = []; } }
    function flushList() { if (list.length) { html += '<ul>' + list.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul>'; list = []; } }
    String(body || '').split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim(), headingMatch = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
      if (headingMatch) {
        flushParagraph(); flushList();
        var entry = outline[heading++] || { level: headingMatch[1].length, title: headingMatch[2], id: 'outline-section-' + heading };
        html += '<h' + entry.level + ' data-heading-id="' + esc(entry.id) + '">' + esc(entry.title) + '</h' + entry.level + '>';
      } else if (/^[-*]\s+/.test(line)) {
        flushParagraph(); list.push(esc(line.replace(/^[-*]\s+/, '')));
      } else if (!line) {
        flushParagraph(); flushList();
      } else {
        flushList(); paragraph.push(esc(line));
      }
    });
    flushParagraph(); flushList();
    return html || '<p class="ops-meta">This article has no body content yet.</p>';
  }
  function outlineMarkup(outline, interactive) {
    if (!outline.length) return '<div class="ops-outline-empty">Use H2 (##) and H3 (###) headings in the article body to build this outline automatically.</div>';
    return '<div class="ops-outline-list">' + outline.map(function (entry) {
      var cls = 'ops-outline-item level-' + entry.level;
      return interactive ? '<button type="button" class="' + cls + ' i18n-skip" data-outline-target="' + esc(entry.id) + '">' + esc(entry.title) + '</button>' : '<span class="' + cls + ' i18n-skip">' + esc(entry.title) + '</span>';
    }).join('') + '</div>';
  }
  function bindOutlineLinks(scope) {
    scope.querySelectorAll('[data-outline-target]').forEach(function (button) {
      button.onclick = function () {
        var target = scope.querySelector('[data-heading-id="' + button.getAttribute('data-outline-target') + '"]');
        if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    });
  }
  function contentRows(list) {
    if (!list.length) return listEmpty('Try another title, collection or publishing state.');
    return list.map(function (article) {
      return '<tr><td style="width:32%">' + contentLinkCell(article.title, '<span class="i18n-skip">' + esc(collectionName(article)) + '</span> · <span class="i18n-skip">' + esc(article.locale) + '</span>', '#/content/' + article.id) + '</td><td class="hide-md">' + esc(article.audience) + '</td><td>' + status(article.status) + '</td><td class="hide-sm"><span class="ops-meta">' + esc(article.updatedAt) + '<br>' + esc(article.owner) + '</span></td><td><a class="ops-link" href="#/content/' + article.id + '">View article</a></td></tr>';
    }).join('');
  }
  function contentList(root) {
    var content = helpContent(), articles = content.articles || [], feedback = content.feedback || {};
    var body = '<div class="ops-kpi-grid"><div class="ops-kpi"><span>Published articles</span><strong>' + articles.filter(function (x) { return x.status === 'Published'; }).length + '</strong><small>Visible in the merchant Help Center</small></div><div class="ops-kpi"><span>In review</span><strong>' + articles.filter(function (x) { return x.status === 'In review'; }).length + '</strong><small>Requires a content decision</small></div><div class="ops-kpi"><span>Helpful rate</span><strong>' + esc(feedback.helpfulRate || '—') + '</strong><small>Recent merchant feedback</small></div><div class="ops-kpi warn"><span>Stale content</span><strong>' + esc(feedback.staleArticles || 0) + '</strong><small>Needs an owner review</small></div></div>' +
      contentTabs('articles') +
      '<div class="ops-toolbar"><span class="ops-search">' + icon('search', 16) + '<input id="articleSearch" placeholder="Search article title"></span><select class="ops-select" id="articleSpace"><option value="">All spaces</option>' + (content.spaces || []).map(function (space) { return '<option class="i18n-skip" value="' + esc(space.name) + '">' + esc(space.name) + '</option>'; }).join('') + '</select><select class="ops-select" id="articleCollectionFilter"><option value="">All collections</option>' + orderedCollections().map(function (collection) { return '<option class="i18n-skip" value="' + esc(collection.id) + '">' + esc(collection.name) + '</option>'; }).join('') + '</select><select class="ops-select" id="articleStatus"><option value="">All states</option><option value="Published">Published</option><option value="In review">In review</option><option value="Draft">Draft</option></select></div>' +
      '<div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th style="width:34%">Article</th><th class="hide-md">Audience</th><th style="width:16%">Status</th><th class="hide-sm" style="width:20%">Updated</th><th></th></tr></thead><tbody id="articleRows"></tbody></table></div></div>' +
      '<div class="ops-note">Help Center content is managed here as a platform content module. BestCheckout merchant users read the published result; they do not see internal operations notes.</div>';
    render(root, page('Help Center', 'Maintain merchant help articles and in-product notices with a clear draft, review and publish workflow.', '<a class="btn btn-default" href="#/content/collections">Manage collections</a><a class="btn btn-primary" href="#/content/new">New article</a>', body), function (scope) {
      function draw() {
        var query = (scope.querySelector('#articleSearch').value || '').toLowerCase(), space = scope.querySelector('#articleSpace').value, state = scope.querySelector('#articleStatus').value, collectionId = scope.querySelector('#articleCollectionFilter').value;
        var list = articles.filter(function (item) {
          var collection = collectionForArticle(item);
          return (!query || (item.title + ' ' + collectionName(item)).toLowerCase().indexOf(query) >= 0) && (!space || item.space === space) && (!collectionId || (collection && collection.id === collectionId)) && (!state || item.status === state);
        });
        var rows = scope.querySelector('#articleRows'); rows.innerHTML = contentRows(list); apply(rows);
      }
      bindSearch(scope, '#articleSearch', ['#articleSpace', '#articleCollectionFilter', '#articleStatus'], draw); draw();
    });
  }
  function collectionRows(entries) {
    if (!entries.length) return listEmpty('Create a collection or change the filters.');
    return entries.map(function (entry) {
      var collection = entry.item, count = articlesInCollection(collection).length, visibility = collection.status === 'Visible' ? 'Hide' : 'Show';
      return '<tr><td style="width:34%">' + contentLinkCell((entry.depth ? '↳ ' : '') + collection.name, '<span class="i18n-skip">' + esc(collection.space) + '</span> · <span>' + count + ' articles</span>', '#/content/collections/' + collection.id + '/edit') + '</td><td class="hide-md"><span class="ops-meta i18n-skip">' + esc(collection.description || '—') + '</span></td><td>' + status(collection.status) + '</td><td class="hide-sm"><span class="ops-meta">' + esc(collection.order) + '</span></td><td><span class="ops-row-actions"><a class="ops-link" href="#/content/collections/' + esc(collection.id) + '/edit">Edit</a><button type="button" class="ops-text-btn" data-collection-toggle="' + esc(collection.id) + '">' + visibility + '</button><button type="button" class="ops-text-btn" data-collection-move="' + esc(collection.id) + '" data-direction="1" title="Move up" aria-label="Move up">↑</button><button type="button" class="ops-text-btn" data-collection-move="' + esc(collection.id) + '" data-direction="-1" title="Move down" aria-label="Move down">↓</button></span></td></tr>';
    }).join('');
  }
  function collectionList(root) {
    var content = helpContent(), all = contentCollections();
    var body = '<div class="ops-kpi-grid"><div class="ops-kpi"><span>Visible collections</span><strong>' + all.filter(function (x) { return x.status === 'Visible'; }).length + '</strong><small>Shown in Help Center navigation</small></div><div class="ops-kpi"><span>Assigned articles</span><strong>' + (content.articles || []).filter(function (article) { return !!collectionForArticle(article); }).length + '</strong><small>Articles with a maintained location</small></div><div class="ops-kpi"><span>Unassigned articles</span><strong>' + (content.articles || []).filter(function (article) { return !collectionForArticle(article); }).length + '</strong><small>Fix before publishing</small></div></div>' +
      contentTabs('collections') +
      '<div class="ops-toolbar"><select class="ops-select" id="collectionSpace"><option value="">All spaces</option>' + (content.spaces || []).map(function (space) { return '<option value="' + esc(space.name) + '">' + esc(space.name) + '</option>'; }).join('') + '</select><select class="ops-select" id="collectionStatus"><option value="">All visibility</option><option value="Visible">Visible</option><option value="Hidden">Hidden</option></select></div>' +
      '<div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th style="width:34%">Collection</th><th class="hide-md">Purpose</th><th style="width:15%">Visibility</th><th class="hide-sm" style="width:11%">Order</th><th></th></tr></thead><tbody id="collectionRows"></tbody></table></div></div>' +
      '<div class="ops-note">Collections build the left Help Center navigation. Change visibility or order here; the article body controls the separate “On this page” outline automatically.</div>';
    render(root, page('Help Center', 'Maintain the Help Center navigation, article locations and display order.', '<a class="btn btn-primary" href="#/content/collections/new">New collection</a>', body), function (scope) {
      function move(collection, direction) {
        var siblings = orderedCollections(collection.space).filter(function (item) { return String(item.parentId || '') === String(collection.parentId || ''); });
        var index = siblings.map(function (item) { return item.id; }).indexOf(collection.id), target = siblings[index - direction];
        if (!target) return;
        var currentOrder = collection.order; collection.order = target.order; target.order = currentOrder;
        audit('Reordered Help Center collection', collection.name, 'Saved'); draw();
      }
      function wireActions() {
        scope.querySelectorAll('[data-collection-toggle]').forEach(function (button) {
          button.onclick = function () {
            var collection = findCollection(button.getAttribute('data-collection-toggle')), next = collection && collection.status === 'Visible' ? 'Hidden' : 'Visible';
            if (!collection) return;
            confirmDialog(next === 'Hidden' ? 'Hide collection' : 'Show collection', next === 'Hidden' ? 'Hidden collections no longer appear in Help Center navigation. Their articles remain intact.' : 'This collection will appear in Help Center navigation after its published articles are available.', next, function () {
              collection.status = next; audit(next === 'Hidden' ? 'Hid Help Center collection' : 'Showed Help Center collection', collection.name, next); toast(next === 'Hidden' ? 'Collection hidden.' : 'Collection visible.'); draw();
            });
          };
        });
        scope.querySelectorAll('[data-collection-move]').forEach(function (button) {
          button.onclick = function () { var collection = findCollection(button.getAttribute('data-collection-move')); if (collection) move(collection, +button.getAttribute('data-direction')); };
        });
      }
      function draw() {
        var space = scope.querySelector('#collectionSpace').value, visibility = scope.querySelector('#collectionStatus').value;
        var entries = collectionTree(space).filter(function (entry) { return !visibility || entry.item.status === visibility; });
        var rows = scope.querySelector('#collectionRows'); rows.innerHTML = collectionRows(entries); apply(rows); wireActions();
      }
      bindSearch(scope, null, ['#collectionSpace', '#collectionStatus'], draw); draw();
    });
  }
  function collectionEditor(root, collection, isNew) {
    var item = collection || { id: 'collection_' + Date.now(), space: 'BestCheckout Help Center', name: '', parentId: '', order: nextCollectionOrder('BestCheckout Help Center'), status: 'Visible', description: '' };
    var form = '<div class="ops-editor"><section class="ops-form-card"><div class="ops-panel-title">Collection</div><label class="fld-label">Collection name</label><input class="input" id="collectionName" value="' + esc(item.name) + '" placeholder="Enter collection name"><label class="fld-label">Purpose</label><textarea class="ops-short-textarea" id="collectionDescription" placeholder="Explain what merchants will find here">' + esc(item.description || '') + '</textarea><div class="ops-form-actions"><a class="btn btn-default" href="#/content/collections">Cancel</a><button class="btn btn-primary" id="saveCollection">Save collection</button></div></section><aside class="ops-form-card"><div class="ops-panel-title">Navigation settings</div><label class="fld-label">Content space</label><select class="input" id="collectionSpaceField">' + (helpContent().spaces || []).map(function (space) { return '<option class="i18n-skip" value="' + esc(space.name) + '"' + (space.name === item.space ? ' selected' : '') + '>' + esc(space.name) + '</option>'; }).join('') + '</select><label class="fld-label">Parent collection</label><select class="input" id="collectionParent">' + parentCollectionOptions(item.space, item.parentId, item.id) + '</select><label class="fld-label">Display order</label><input class="input" id="collectionOrder" type="number" min="0" value="' + esc(item.order) + '"><label class="fld-label">Visibility</label><select class="input" id="collectionVisibility"><option value="Visible"' + (item.status === 'Visible' ? ' selected' : '') + '>Visible</option><option value="Hidden"' + (item.status === 'Hidden' ? ' selected' : '') + '>Hidden</option></select><div class="ops-note">The navigation uses this hierarchy and order. Articles inherit their location from the selected collection.</div></aside></div>';
    render(root, page(isNew ? 'New collection' : 'Edit collection', 'Manage a Help Center navigation location without editing the published article itself.', '', form, back('#/content/collections', 'Collections')), function (scope) {
      var spaceField = scope.querySelector('#collectionSpaceField'), parentField = scope.querySelector('#collectionParent');
      spaceField.onchange = function () { parentField.innerHTML = parentCollectionOptions(spaceField.value, '', item.id); apply(parentField); };
      scope.querySelector('#saveCollection').onclick = function () {
        var name = scope.querySelector('#collectionName').value.trim(), space = spaceField.value, parentId = parentField.value;
        if (!name) { toast('Enter a collection name.'); return; }
        var duplicate = contentCollections().filter(function (entry) { return entry.id !== item.id && entry.space === space && entry.name.toLowerCase() === name.toLowerCase(); })[0];
        if (duplicate) { toast('A collection with this name already exists in this content space.'); return; }
        var parent = parentId ? findCollection(parentId) : null;
        item.space = space; item.name = name; item.parentId = parent && parent.space === space ? parent.id : ''; item.order = Math.max(0, +scope.querySelector('#collectionOrder').value || 0); item.status = scope.querySelector('#collectionVisibility').value; item.description = scope.querySelector('#collectionDescription').value.trim();
        articlesInCollection(item).forEach(function (article) { article.space = item.space; article.collection = item.name; article.collectionId = item.id; });
        if (isNew) contentCollections().push(item);
        audit(isNew ? 'Created Help Center collection' : 'Updated Help Center collection', item.name, item.status); toast(isNew ? 'Collection created.' : 'Collection saved.'); route('#/content/collections');
      };
    });
  }
  function articleDetail(root, article) {
    var collection = collectionForArticle(article), outline = outlineFromText(articleText(article));
    var collectionFact = collection ? '<a class="ops-link i18n-skip" href="#/content/collections/' + esc(collection.id) + '/edit">' + esc(collection.name) + '</a>' : '<span class="i18n-skip">' + esc(collectionName(article)) + '</span>';
    var body = '<div class="ops-info-grid">' + fact('Publishing state', status(article.status)) + fact('Audience', esc(article.audience)) + fact('Collection', collectionFact) + fact('Locale', esc(article.locale)) + fact('Owner', esc(article.owner)) + fact('Last updated', esc(article.updatedAt)) + '</div>' +
      '<div class="ops-article-layout"><article class="ops-panel ops-article"><div class="ops-panel-head"><div><div class="ops-panel-title">Article content</div><div class="ops-panel-sub">/' + esc(article.slug) + '</div></div><a class="ops-link" href="#/content/' + article.id + '/edit">Edit</a></div><div class="ops-panel-body"><div class="ops-article-body i18n-skip">' + renderArticleMarkup(articleText(article)) + '</div></div></article><aside class="ops-outline-card"><div class="ops-panel-title">On this page</div><div class="ops-panel-sub">Generated from article headings</div>' + outlineMarkup(outline, true) + '</aside></div>' +
      '<div class="ops-note">The published article uses the Help Center layout and selected locale. “On this page” is generated from H2 and H3 headings, so it cannot drift from the article body.</div>';
    var actions = '<a class="btn btn-default" href="#/content/' + esc(article.id) + '/edit">Edit article</a>' + (article.status !== 'Published' ? '<button class="btn btn-primary" id="publishArticle">Publish</button>' : '');
    render(root, page(article.title, 'Help Center article details and publishing controls.', actions, body, back('#/content', 'Help Center')), function (scope) {
      bindOutlineLinks(scope);
      var publish = scope.querySelector('#publishArticle');
      if (publish) publish.onclick = function () {
        confirmDialog('Publish article', 'Publishing makes this article available to the selected Help Center audience. The action is recorded in the platform audit trail.', 'Publish', function () {
          article.status = 'Published'; article.updatedAt = 'Jul 31, 2026'; audit('Published help article', article.title, 'Published'); toast('Article published.'); articleDetail(root, article);
        });
      };
    });
  }
  function articleEditor(root, article, isNew) {
    var firstCollection = orderedCollections('BestCheckout Help Center')[0];
    var item = article || { id: 'help_' + Date.now(), space: 'BestCheckout Help Center', collectionId: firstCollection ? firstCollection.id : '', collection: firstCollection ? firstCollection.name : '', title: '', slug: '', audience: 'BestCheckout merchants', locale: 'en-US', status: 'Draft', updatedAt: 'Jul 31, 2026', owner: 'Ops / Content', body: '' };
    var selectedCollection = collectionForArticle(item), selectedCollectionId = selectedCollection ? selectedCollection.id : item.collectionId;
    var form = '<div class="ops-editor"><section class="ops-form-card"><div class="ops-panel-title">Article</div><label class="fld-label">Title</label><input class="input" id="articleTitle" value="' + esc(item.title) + '" placeholder="Enter article title"><label class="fld-label">URL slug</label><input class="input" id="articleSlug" value="' + esc(item.slug) + '" placeholder="article-slug"><label class="fld-label">Article content</label><div class="ops-field-hint">Use ## for a main section and ### for a nested section. The Help Center outline is generated from these headings.</div><textarea id="articleBody" placeholder="## Before you start&#10;&#10;Write the merchant-facing article">' + esc(articleText(item)) + '</textarea><div class="ops-form-actions"><a class="btn btn-default" href="#/content' + (isNew ? '' : '/' + esc(item.id)) + '">Cancel</a><button class="btn btn-default" id="saveDraft">Save draft</button><button class="btn btn-primary" id="savePublish">Save and publish</button></div></section><aside class="ops-editor-side"><section class="ops-form-card ops-outline-card"><div class="ops-panel-title">On this page</div><div class="ops-panel-sub">Generated from article headings</div><div id="articleOutline">' + outlineMarkup(outlineFromText(articleText(item)), false) + '</div></section><section class="ops-form-card"><div class="ops-panel-title">Publishing settings</div><label class="fld-label">Content space</label><select class="input" id="articleSpace">' + (helpContent().spaces || []).map(function (space) { return '<option class="i18n-skip" value="' + esc(space.name) + '"' + (space.name === item.space ? ' selected' : '') + '>' + esc(space.name) + '</option>'; }).join('') + '</select><label class="fld-label">Collection</label><select class="input" id="articleCollection">' + articleCollectionOptions(item.space, selectedCollectionId, item.collection) + '</select><label class="fld-label">Audience</label><input class="input" id="articleAudience" value="' + esc(item.audience) + '"><label class="fld-label">Locale</label><select class="input" id="articleLocale"><option value="en-US"' + (item.locale === 'en-US' ? ' selected' : '') + '>en-US</option><option value="zh-CN"' + (item.locale === 'zh-CN' ? ' selected' : '') + '>zh-CN</option></select><div class="ops-note">Save as draft for review, or publish when the content and destination are ready.</div></section></aside></div>';
    render(root, page(isNew ? 'New article' : 'Edit article', 'Write merchant-facing Help Center content. Internal operational instructions do not belong in the published article.', '', form, back(isNew ? '#/content' : '#/content/' + item.id, 'Help Center')), function (scope) {
      var bodyField = scope.querySelector('#articleBody'), spaceField = scope.querySelector('#articleSpace'), collectionField = scope.querySelector('#articleCollection');
      function updateOutline() { scope.querySelector('#articleOutline').innerHTML = outlineMarkup(outlineFromText(bodyField.value), false); apply(scope.querySelector('#articleOutline')); }
      bodyField.oninput = updateOutline;
      spaceField.onchange = function () { collectionField.innerHTML = articleCollectionOptions(spaceField.value, '', ''); apply(collectionField); };
      function save(publish) {
        var title = scope.querySelector('#articleTitle').value.trim(), collection = findCollection(collectionField.value);
        if (!title) { toast('Enter an article title.'); return; }
        if (!collection) { toast('Select a collection.'); return; }
        item.title = title; item.slug = scope.querySelector('#articleSlug').value.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); item.body = bodyField.value.trim(); item.space = spaceField.value; item.collectionId = collection.id; item.collection = collection.name; item.audience = scope.querySelector('#articleAudience').value.trim() || 'BestCheckout merchants'; item.locale = scope.querySelector('#articleLocale').value; item.status = publish ? 'Published' : 'Draft'; item.updatedAt = 'Jul 31, 2026';
        if (isNew) { (helpContent().articles || (helpContent().articles = [])).unshift(item); }
        audit(publish ? 'Published help article' : 'Saved help article draft', item.title, item.status); toast(publish ? 'Article published.' : 'Draft saved.'); route('#/content/' + item.id);
      }
      scope.querySelector('#saveDraft').onclick = function () { save(false); }; scope.querySelector('#savePublish').onclick = function () { save(true); };
    });
  }
  function content(root, parts) {
    /* The active Help Center implementation is split by screen under
       js/pages/content/. Keep this fallback for a partially cached static
       load, but never make the shared operations file the source of truth. */
    if (window.SAAS_CONTENT && typeof window.SAAS_CONTENT.render === 'function') {
      window.SAAS_CONTENT.render(root, parts);
      return;
    }
    var id = cleanPart(parts && parts[0]), mode = cleanPart(parts && parts[1]);
    if (!id) { contentList(root); return; }
    if (id === 'collections') {
      var collectionId = cleanPart(parts && parts[1]), collectionMode = cleanPart(parts && parts[2]);
      if (!collectionId) { collectionList(root); return; }
      if (collectionId === 'new') { collectionEditor(root, null, true); return; }
      var collection = findCollection(collectionId);
      if (!collection) { collectionList(root); return; }
      if (collectionMode === 'edit') { collectionEditor(root, collection, false); return; }
      collectionList(root); return;
    }
    if (id === 'new') { articleEditor(root, null, true); return; }
    var article = findArticle(id); if (!article) { contentList(root); return; }
    if (mode === 'edit') articleEditor(root, article, false); else articleDetail(root, article);
  }

  /* ---------- Domains, SSL and service connections ---------- */
  function hostRows(list) {
    if (!list.length) return listEmpty('Try another host, usage or verification state.');
    return list.map(function (host) {
      return '<tr><td style="width:28%">' + linkCell(host.host, host.store, '#/domains/' + host.id) + '</td><td>' + esc(host.usage === 'checkout' ? 'Checkout' : 'Storefront') + '</td><td class="hide-md"><span class="ops-meta">' + esc(host.target) + '</span></td><td class="hide-sm">' + status(host.dns) + '</td><td>' + status(host.ssl) + '</td><td><a class="ops-link" href="#/domains/' + host.id + '">View</a></td></tr>';
    }).join('');
  }
  function addHost(root) {
    modalFields('Add host record', [
      { label: 'Host', html: '<input class="input" id="hostName" placeholder="checkout.example.com">' },
      { label: 'Store', html: '<select class="input" id="hostStore">' + (C.stores || []).map(function (store) { return '<option value="' + esc(store.id) + '">' + esc(store.name) + '</option>'; }).join('') + '</select>' },
      { label: 'Host usage', html: '<select class="input" id="hostUsage"><option value="storefront">Storefront</option><option value="checkout">Checkout</option></select>' }
    ], 'Add host', function (layer) {
      var name = layer.querySelector('#hostName').value.trim(); if (!name) { toast('Enter a host.'); return; }
      var store = findStore(layer.querySelector('#hostStore').value); var usage = layer.querySelector('#hostUsage').value;
      var record = { id: 'host_' + Date.now(), host: name, storeId: store.id, store: store.name, usage: usage, target: usage === 'checkout' ? 'edge.bestcheckout.app' : 'stores.bestshopio.com', dns: 'Pending', ssl: 'Pending', status: 'Provisioning', updatedAt: 'Just now' };
      C.hosts.push(record); audit('Added domain host', name, 'Provisioning'); layer.remove(); toast('Host record added.'); route('#/domains/' + record.id);
    });
  }
  function domainDetail(root, id) {
    var host = findHost(id); if (!host) { domains(root, []); return; }
    var store = findStore(host.storeId);
    var body = '<div class="ops-info-grid">' + fact('Store', store ? '<a class="ops-link" href="#/stores/' + esc(store.id) + '">' + esc(store.name) + '</a>' : esc(host.store)) + fact('Host usage', esc(host.usage === 'checkout' ? 'Checkout' : 'Storefront')) + fact('Routing target', '<span class="ops-meta">' + esc(host.target) + '</span>') + fact('DNS verification', status(host.dns)) + fact('SSL certificate', status(host.ssl)) + fact('Publishing state', status(host.status)) + '</div>' +
      '<div class="ops-layout"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Host routing</div><div class="ops-panel-sub">BestShopio Domains is the single authority for host, DNS, SSL and routing state.</div></div></div><div class="ops-panel-body"><div class="ops-health-row"><div><strong>Current target</strong><span>' + esc(host.target) + '</span></div></div><div class="ops-health-row"><div><strong>Last checked</strong><span>' + esc(host.updatedAt) + '</span></div></div><div class="ops-note">A published host has one usage only. Checkout hosts route to checkout; they never render Storefront pages.</div></div></section><aside class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Safe next step</div></div></div><div class="ops-panel-body"><p class="pcx-copy">Verify DNS and SSL before publishing. Changes are logged and do not expose certificate or provider credentials in this console.</p><button class="btn btn-primary" id="checkHost">Record verification check</button></div></aside></div>';
    render(root, page(host.host, 'DNS, SSL and domain routing record.', '', body, back('#/domains', 'Domains')), function (scope) {
      scope.querySelector('#checkHost').onclick = function () { confirmDialog('Record verification check', 'This records a verification check for the host. It does not make a DNS or certificate change.', 'Record check', function () { audit('Checked domain host', host.host, host.dns + ' · ' + host.ssl); toast('Verification check recorded.'); domainDetail(root, host.id); }); };
    });
  }
  function domains(root, parts) {
    var id = cleanPart(parts && parts[0]); if (id) { domainDetail(root, id); return; }
    var body = '<div class="ops-toolbar"><span class="ops-search">' + icon('search', 16) + '<input id="hostSearch" placeholder="Search host or store"></span><select class="ops-select" id="hostUsage"><option value="">All host usage</option><option value="storefront">Storefront</option><option value="checkout">Checkout</option></select><select class="ops-select" id="hostState"><option value="">All DNS states</option><option value="Verified">Verified</option><option value="Pending">Pending</option></select></div><div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th style="width:28%">Host</th><th style="width:13%">Usage</th><th class="hide-md">Routing target</th><th class="hide-sm" style="width:13%">DNS</th><th style="width:13%">SSL</th><th></th></tr></thead><tbody id="hostRows"></tbody></table></div></div>';
    render(root, page('Domains', 'Manage every published host, DNS verification, SSL and routing target from one platform source of truth.', '<button class="btn btn-primary" id="addHost">Add host</button>', body), function (scope) {
      function draw() { var query = (scope.querySelector('#hostSearch').value || '').toLowerCase(); var usage = scope.querySelector('#hostUsage').value; var state = scope.querySelector('#hostState').value; var list = (C.hosts || []).filter(function (host) { return (!query || (host.host + ' ' + host.store).toLowerCase().indexOf(query) >= 0) && (!usage || host.usage === usage) && (!state || host.dns === state); }); scope.querySelector('#hostRows').innerHTML = hostRows(list); }
      bindSearch(scope, '#hostSearch', ['#hostUsage', '#hostState'], draw); draw(); scope.querySelector('#addHost').onclick = function () { addHost(root); };
    });
  }

  function integrationRows(list) {
    if (!list.length) return listEmpty('Try another provider, store or health state.');
    return list.map(function (item) { return '<tr><td style="width:18%">' + linkCell(item.provider, item.connection, '#/integrations/' + item.id) + '</td><td class="hide-md" style="width:29%">' + esc(item.capability) + '</td><td class="hide-sm">' + (item.storeId ? '<a class="ops-link" href="#/stores/' + esc(item.storeId) + '">Open store</a>' : 'Platform') + '</td><td>' + status(item.status) + '</td><td class="hide-xs"><span class="ops-meta">' + esc(item.checked) + '</span></td><td><a class="ops-link" href="#/integrations/' + item.id + '">View</a></td></tr>'; }).join('');
  }
  function integrationDetail(root, id) {
    var item = findIntegration(id); if (!item) { integrations(root, []); return; }
    var body = '<div class="ops-info-grid">' + fact('Provider', esc(item.provider)) + fact('Connection', esc(item.connection)) + fact('Service health', status(item.status)) + fact('Capabilities', esc(item.capability)) + fact('Last checked', esc(item.checked)) + fact('Credential handling', 'Reference only') + '</div><div class="ops-layout"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Connection boundary</div></div></div><div class="ops-panel-body"><p class="pcx-copy">The console displays connection health and safe follow-up actions only. Credentials, OAuth tokens, webhook signatures and provider payloads stay outside the user interface.</p><div class="ops-note">For a merchant-owned connection, use the linked store to coordinate a merchant-facing recovery task rather than editing credentials here.</div></div></section><aside class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Review</div></div></div><div class="ops-panel-body"><p class="pcx-copy">Latest check: ' + esc(item.checked) + '</p><button class="btn btn-primary" id="reviewIntegration">Record review</button></div></aside></div>';
    render(root, page(item.provider + ' · ' + item.connection, 'Service connection health and platform-safe review.', item.storeId ? '<a class="btn btn-default" href="#/stores/' + esc(item.storeId) + '">Open store</a>' : '', body, back('#/integrations', 'Service connections')), function (scope) { scope.querySelector('#reviewIntegration').onclick = function () { confirmDialog('Record connection review', 'This records a service-health review without touching provider credentials.', 'Record review', function () { audit('Reviewed service connection', item.provider + ' · ' + item.connection, item.status); toast('Connection review recorded.'); integrationDetail(root, item.id); }); }; });
  }
  function integrations(root, parts) {
    var id = cleanPart(parts && parts[0]); if (id) { integrationDetail(root, id); return; }
    var body = '<div class="ops-toolbar"><span class="ops-search">' + icon('search', 16) + '<input id="integrationSearch" placeholder="Search provider or connection"></span><select class="ops-select" id="integrationStatus"><option value="">All health states</option><option value="Healthy">Healthy</option><option value="Review">Review</option><option value="Action required">Action required</option></select></div><div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th style="width:20%">Provider</th><th class="hide-md">Capabilities</th><th class="hide-sm" style="width:14%">Store</th><th style="width:16%">Health</th><th class="hide-xs" style="width:16%">Last checked</th><th></th></tr></thead><tbody id="integrationRows"></tbody></table></div></div>';
    render(root, page('Service connections', 'Monitor platform integrations and coordinate safe recovery without exposing provider credentials or raw events.', '', body), function (scope) { function draw() { var query = (scope.querySelector('#integrationSearch').value || '').toLowerCase(); var state = scope.querySelector('#integrationStatus').value; var list = (C.integrations || []).filter(function (item) { return (!query || (item.provider + ' ' + item.connection).toLowerCase().indexOf(query) >= 0) && (!state || item.status === state); }); scope.querySelector('#integrationRows').innerHTML = integrationRows(list); } bindSearch(scope, '#integrationSearch', ['#integrationStatus'], draw); draw(); });
  }

  /* ---------- Plans and governed releases ---------- */
  function planDetail(root, id) {
    var item = findPlan(id); if (!item) { plans(root, []); return; }
    var storeCount = (C.stores || []).filter(function (store) { return store.plan === item.name; }).length;
    var body = '<div class="ops-info-grid">' + fact('Products', esc(item.products)) + fact('Staff seats', esc(item.seats)) + fact('Purchase flows', esc(item.flows)) + fact('Domain allowance', esc(item.domains)) + fact('Data retention', esc(item.analytics)) + fact('Plan state', status(item.status)) + '</div><div class="ops-layout"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Entitlements</div><div class="ops-panel-sub">These limits control platform availability; they do not add unrelated BestShopio menus to BestCheckout merchant users.</div></div></div><div class="ops-panel-body"><div class="ops-health-row"><div><strong>Assigned stores</strong><span>' + storeCount + ' store records currently use this plan.</span></div></div><div class="ops-note">A controlled upgrade preserves identity, store links, payment references and historical data. Product navigation remains appropriate to the merchant experience.</div></div></section><aside class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Change history</div></div></div><div class="ops-panel-body"><div class="ops-timeline-row"><div><strong>Current entitlement</strong><span>Last reviewed Jul 2026</span></div></div></div></aside></div>';
    render(root, page(item.name + ' plan', 'Platform entitlement and availability settings.', '<button class="btn btn-primary" id="editPlan">Edit plan</button>', body, back('#/plans', 'Plans')), function (scope) { scope.querySelector('#editPlan').onclick = function () { modalFields('Edit plan entitlement', [{ label: 'Staff seats', html: '<input class="input" id="planSeats" value="' + esc(item.seats) + '">' }, { label: 'Domain allowance', html: '<input class="input" id="planDomains" value="' + esc(item.domains) + '">' }, { label: 'Data retention', html: '<input class="input" id="planAnalytics" value="' + esc(item.analytics) + '">' }], 'Save changes', function (layer) { item.seats = layer.querySelector('#planSeats').value.trim() || item.seats; item.domains = layer.querySelector('#planDomains').value.trim() || item.domains; item.analytics = layer.querySelector('#planAnalytics').value.trim() || item.analytics; audit('Updated plan entitlement', item.name, 'Saved'); layer.remove(); toast('Plan updated.'); planDetail(root, item.id); }); }; });
  }
  function plans(root, parts) {
    var id = cleanPart(parts && parts[0]); if (id) { planDetail(root, id); return; }
    var body = '<div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th style="width:24%">Plan</th><th>Products</th><th class="hide-sm">Seats</th><th class="hide-md">Domains</th><th>State</th><th></th></tr></thead><tbody>' + (C.plans || []).map(function (item) { return '<tr><td>' + linkCell(item.name, item.analytics + ' data retention', '#/plans/' + item.id) + '</td><td>' + esc(item.products) + '</td><td class="hide-sm">' + esc(item.seats) + '</td><td class="hide-md">' + esc(item.domains) + '</td><td>' + status(item.status) + '</td><td><a class="ops-link" href="#/plans/' + item.id + '">View</a></td></tr>'; }).join('') + '</tbody></table></div></div>';
    render(root, page('Plans', 'Manage product entitlements, seats, domains and retention policies.', '', body));
  }
  function flagDetail(root, id) {
    var item = findFlag(id); if (!item) { governance(root, []); return; }
    var body = '<div class="ops-info-grid">' + fact('Release state', status(item.status)) + fact('Scope', esc(item.scope)) + fact('Changed by', esc(item.changedBy)) + fact('Last updated', esc(item.updatedAt)) + fact('Risk approach', item.status === 'Pilot' ? 'Limited validation' : 'Controlled release') + fact('Audit trail', 'Required') + '</div><div class="ops-layout"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Release controls</div></div></div><div class="ops-panel-body"><p class="pcx-copy">Scope, release state and operational outcome are recorded together. High-impact changes start in a limited scope and retain a safe fallback.</p><div class="ops-note">The release control does not alter a live merchant checkout session. Any operational response is queued and audited.</div></div></section><aside class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Related changes</div></div></div><div class="ops-panel-body">' + (C.audit || []).slice(0, 4).map(function (auditItem) { return '<div class="ops-timeline-row"><div><strong>' + esc(auditItem.action) + '</strong><span>' + esc(auditItem.at) + '</span></div></div>'; }).join('') + '</div></aside></div>';
    render(root, page(item.name, 'Release scope, state and governed change record.', '<button class="btn btn-primary" id="editFlag">Adjust release</button>', body, back('#/governance', 'Release management')), function (scope) { scope.querySelector('#editFlag').onclick = function () { modalFields('Adjust release control', [{ label: 'Scope', html: '<input class="input" id="flagScope" value="' + esc(item.scope) + '">' }, { label: 'Release state', html: '<select class="input" id="flagStatus"><option value="Enabled"' + (item.status === 'Enabled' ? ' selected' : '') + '>Enabled</option><option value="Pilot"' + (item.status === 'Pilot' ? ' selected' : '') + '>Pilot</option><option value="Suspended"' + (item.status === 'Suspended' ? ' selected' : '') + '>Suspended</option></select>' }], 'Save change', function (layer) { item.scope = layer.querySelector('#flagScope').value.trim() || item.scope; item.status = layer.querySelector('#flagStatus').value; item.changedBy = 'ops.amy'; item.updatedAt = now(); audit('Updated release control', item.name, item.status); layer.remove(); toast('Release control updated.'); flagDetail(root, item.id); }); }; });
  }
  function governance(root, parts) {
    var id = cleanPart(parts && parts[0]); if (id) { flagDetail(root, id); return; }
    var body = '<div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th style="width:30%">Release control</th><th>Scope</th><th class="hide-sm">Changed by</th><th>State</th><th></th></tr></thead><tbody>' + (C.flags || []).map(function (item) { return '<tr><td>' + linkCell(item.name, item.updatedAt, '#/governance/' + item.id) + '</td><td>' + esc(item.scope) + '</td><td class="hide-sm">' + esc(item.changedBy) + '</td><td>' + status(item.status) + '</td><td><a class="ops-link" href="#/governance/' + item.id + '">View</a></td></tr>'; }).join('') + '</tbody></table></div></div><section class="ops-panel" style="margin-top:16px"><div class="ops-panel-head"><div><div class="ops-panel-title">Recent audit trail</div></div></div><div class="ops-panel-body">' + (C.audit || []).slice(0, 6).map(function (item) { return '<div class="ops-timeline-row"><div><strong>' + esc(item.action) + '</strong><span>' + esc(item.scope) + ' · ' + esc(item.actor) + '</span></div><span class="ops-meta">' + esc(item.at) + '</span></div>'; }).join('') + '</div></section>';
    render(root, page('Release management', 'Manage scope, pilot state and audited platform releases. Menu, Account and Category remain in their dedicated system settings entries.', '', body));
  }

  /* ---------- BestCheckout operations: platform control plane only ---------- */
  function bcStoreName(id) { var record = findStore(id); return record ? record.name : 'Platform content'; }
  function bcTabs(active) {
    var items = [['overview', 'Overview'], ['installs', 'Install links'], ['connections', 'Store connections'], ['routing', 'Routing and safety'], ['writebacks', 'Order writeback'], ['events', 'Events'], ['support', 'Merchant support']];
    return '<nav class="ops-tabs">' + items.map(function (item) { return '<a class="ops-tab' + (active === item[0] ? ' active' : '') + '" href="#/bestcheckout' + (item[0] === 'overview' ? '' : '/' + item[0]) + '">' + item[1] + '</a>'; }).join('') + '</nav>';
  }
  function installActionLabel(code, item) {
    var store = item ? findStore(item.storeId) : null;
    if (code === 'preparing' && !hasAppCredentials(store, item)) return 'Enter app credentials';
    return ({
      preparing: 'Send install link',
      ready: 'Record merchant install',
      expired: 'Resend install link',
      failed: 'Resend install link'
    })[code] || 'Review install state';
  }
  function syncInstallToStore(item) {
    var store = findStore(item.storeId);
    var connection = (B.connections || []).filter(function (x) { return x.storeId === item.storeId; })[0];
    if (store) {
      store.installStatus = item.status;
      store.nextAction = item.next;
      if (item.status === 'connected') {
        store.lifecycle = 'Active';
        store.provisioning = 'Completed';
        store.connection = 'Healthy';
        store.domainSetup = store.domainSetup || 'Pending';
        store.paymentSetup = store.paymentSetup || 'Not connected';
      } else if (item.status === 'expired' || item.status === 'failed') {
        store.connection = 'Not connected';
      }
    }
    if (connection) {
      connection.installStatus = item.status;
      connection.next = item.next;
      connection.authorization = item.status === 'connected' ? 'Connected' : (item.status === 'reauth' ? 'Reauthorization needed' : 'Not connected');
      if (item.status === 'connected') { connection.sync = 'Healthy'; connection.webhook = '5 / 5 healthy'; }
    }
  }
  function runInstallAction(id, rerender) {
    var item = (B.installs || []).filter(function (x) { return x.id === id; })[0];
    if (!item) return;
    var store = findStore(item.storeId);
    if ((item.status === 'preparing' || item.status === 'expired' || item.status === 'failed') && store) {
      openInstallLinkModal(store, rerender);
      return;
    }
    var title = installActionLabel(item.status, item);
    confirmDialog(title, 'This records that the merchant completed Install and BestCheckout received the callback. It does not show tokens or Partner Dashboard details.', title, function () {
      item.status = 'connected';
      item.next = 'No action required';
      syncInstallToStore(item);
      audit(title, bcStoreName(item.storeId), installLabel(item.status));
      toast(title + ' recorded.');
      rerender();
    });
  }
  function bcAction(root, title, copy, action, scope, section) {
    confirmDialog(title, copy, action, function () { audit(action, scope, 'Queued safely'); toast(action + ' recorded.'); bestcheckout(root, [section]); });
  }
  function bcOverview(root) {
    var connections = B.connections || []; var routes = B.routes || []; var writebacks = B.writebacks || []; var events = B.events || []; var installs = B.installs || [];
    var openInstalls = installs.filter(function (x) { return x.status !== 'connected'; });
    var attention = [];
    openInstalls.forEach(function (x) { attention.push({ id: x.id, type: 'install', title: x.next, store: bcStoreName(x.storeId), detail: x.shop + ' · ' + installLabel(x.status), state: installLabel(x.status) }); });
    connections.filter(function (x) { return x.installStatus === 'connected' && x.sync !== 'Healthy'; }).forEach(function (x) { attention.push({ id: x.id, type: 'connection', title: x.next, store: bcStoreName(x.storeId), detail: x.authorization + ' · ' + x.sync, state: x.sync }); });
    writebacks.filter(function (x) { return x.state !== 'Completed'; }).forEach(function (x) { attention.push({ id: x.id, type: 'writeback', title: 'Order writeback needs review', store: bcStoreName(x.storeId), detail: x.reference + ' · ' + x.detail, state: x.state }); });
    events.filter(function (x) { return x.status !== 'Completed'; }).forEach(function (x) { attention.push({ id: x.id, type: 'event', title: x.subject, store: bcStoreName(x.storeId), detail: x.detail, state: x.status }); });
    var queue = attention.slice(0, 6).map(function (item) { return '<button class="ops-attention-item" data-bc-type="' + esc(item.type) + '" data-bc-id="' + esc(item.id) + '"><i class="ops-severity high"></i><div class="ops-attention-copy"><strong>' + esc(item.title) + '</strong><span>' + esc(item.store) + ' · ' + esc(item.detail) + '</span></div>' + status(item.state) + '</button>'; }).join('');
    var body = bcTabs('overview') + '<div class="ops-note ops-warning"><strong>Platform boundary:</strong> This workspace prepares Custom App install links, then monitors Shopify connections, deployment safety and order reconciliation. Merchant funnel drafts, page design and payment credentials stay in BestCheckout.</div><div class="ops-kpi-grid">' + kpi('Connected stores', connections.filter(function (x) { return x.authorization === 'Connected'; }).length, 'Shopify authorization is healthy', '') + kpi('Install links in progress', openInstalls.length, 'Preparing, ready, expired or failed', openInstalls.length ? 'warn' : '') + kpi('Retryable writebacks', writebacks.filter(function (x) { return x.state === 'Retryable'; }).length, 'Idempotent replay only', 'warn') + kpi('Open service events', events.filter(function (x) { return x.status !== 'Completed'; }).length, 'No raw payloads exposed', 'warn') + '</div><div class="ops-layout"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Priority operational queue</div><div class="ops-panel-sub">Actions create safe, auditable follow-up work; they do not alter live checkout sessions.</div></div><a class="ops-link" href="#/bestcheckout/installs">View install links</a></div><div class="ops-attention">' + queue + '</div></section><aside class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Control plane</div></div></div><div class="ops-panel-body"><div class="ops-health-row"><div><strong>Merchant experience</strong><span>Independent BestCheckout backend</span></div>' + status('Protected') + '</div><div class="ops-health-row"><div><strong>Shared platform record</strong><span>Identity, store and operational state</span></div>' + status('Healthy') + '</div><div class="ops-health-row"><div><strong>Safety fallback</strong><span>Shopify native control remains available</span></div>' + status('Ready') + '</div></div></aside></div>';
    render(root, page('BestCheckout operations', 'Platform control plane for BestCheckout service health, routing safety and reconciliation.', '', body), function (scope) {
      scope.querySelectorAll('[data-bc-id]').forEach(function (button) { button.onclick = function () { var type = button.getAttribute('data-bc-type'); if (type === 'install') route('#/bestcheckout/installs'); else if (type === 'connection') route('#/bestcheckout/connections'); else if (type === 'writeback') route('#/bestcheckout/writebacks'); else route('#/bestcheckout/events'); }; });
    });
  }
  function bcInstalls(root) {
    var rows = (B.installs || []).map(function (item) {
      return '<tr><td>' + linkCell(bcStoreName(item.storeId), item.shop, '#/stores/' + item.storeId) + '</td><td>' + status(installLabel(item.status)) + '</td><td class="hide-md">' + esc(item.submittedAt || '—') + '</td><td class="hide-sm">' + esc(item.linkSentAt || 'Not sent') + '</td><td class="hide-xs">' + esc(item.expiresAt || 'After send') + '</td><td><span class="ops-meta">' + esc(item.next) + '</span></td><td>' + (item.status === 'connected' ? '<span class="ops-meta">No action</span>' : '<button class="btn btn-primary" data-install="' + esc(item.id) + '">' + esc(installActionLabel(item.status, item)) + '</button>') + '</td></tr>';
    }).join('');
    var body = bcTabs('installs') +
      '<div class="ops-note">Operators enter Client ID and Secret. The console generates the install link and emails it to the store owner. Links are valid for 7 days. Resend uses the saved credentials; replace them only for a new app.</div>' +
      '<div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Store</th><th>Install state</th><th class="hide-md">Submitted</th><th class="hide-sm">Link sent</th><th class="hide-xs">Expires</th><th>Next action</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
    render(root, page('BestCheckout operations', 'Operate the Custom App install-link state machine. Tokens and Partner Dashboard details stay off this page.', '', body), function (scope) {
      scope.querySelectorAll('[data-install]').forEach(function (button) {
        button.onclick = function () { runInstallAction(button.getAttribute('data-install'), function () { bestcheckout(root, ['installs']); }); };
      });
    });
  }
  function bcConnections(root) {
    var rows = (B.connections || []).map(function (item) { return '<tr><td>' + linkCell(bcStoreName(item.storeId), item.adapter, '#/stores/' + item.storeId) + '</td><td>' + status(installLabel(item.installStatus || (item.authorization === 'Connected' ? 'connected' : 'preparing'))) + '</td><td>' + status(item.authorization) + '</td><td class="hide-md">' + esc(item.scopes) + '</td><td>' + status(item.sync) + '</td><td class="hide-sm"><span class="ops-meta">' + esc(item.webhook) + '<br>' + esc(item.checked) + '</span></td><td><button class="btn btn-default" data-connection="' + esc(item.id) + '">' + esc(item.sync === 'Healthy' ? 'Record review' : (item.installStatus && item.installStatus !== 'connected' && item.installStatus !== 'reauth' ? 'Open install queue' : 'Create recovery task')) + '</button></td></tr>'; }).join('');
    var body = bcTabs('connections') + '<div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Store</th><th>Install state</th><th>Authorization</th><th class="hide-md">Scopes</th><th>Sync</th><th class="hide-sm">Webhook health</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
    render(root, page('BestCheckout operations', 'Review Shopify integration health and create merchant-safe recovery work.', '', body), function (scope) { scope.querySelectorAll('[data-connection]').forEach(function (button) { button.onclick = function () { var item = (B.connections || []).filter(function (x) { return x.id === button.getAttribute('data-connection'); })[0]; if (item.installStatus && item.installStatus !== 'connected' && item.installStatus !== 'reauth') { route('#/bestcheckout/installs'); return; } bcAction(root, item.sync === 'Healthy' ? 'Record connection review' : 'Create merchant recovery task', item.sync === 'Healthy' ? 'This records a connection-health review.' : 'This creates a guided merchant reconnection task. It does not show or reset authorization credentials.', item.sync === 'Healthy' ? 'Record review' : 'Create task', bcStoreName(item.storeId), 'connections'); }; }); });
  }
  function bcRouting(root) {
    var rows = (B.routes || []).map(function (item) { return '<tr><td>' + linkCell(bcStoreName(item.storeId), item.snapshot, '#/stores/' + item.storeId) + '</td><td>' + esc(item.surface) + '</td><td class="hide-md">' + esc(item.control) + '</td><td>' + status(item.gate) + '</td><td class="hide-sm">' + status(item.safety) + '</td><td><button class="btn btn-default" data-routegate="' + esc(item.id) + '">Review gate</button></td></tr>'; }).join('');
    var body = bcTabs('routing') + '<div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Store</th><th>Running surface</th><th class="hide-md">Control allocation</th><th>Gate</th><th class="hide-sm">Fallback</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div><div class="ops-note">Deployment snapshots are immutable runtime inputs. A review records a decision; it does not replace an active merchant checkout flow.</div>';
    render(root, page('BestCheckout operations', 'Review deployment gate and safety fallback for each published checkout route.', '', body), function (scope) { scope.querySelectorAll('[data-routegate]').forEach(function (button) { button.onclick = function () { var item = (B.routes || []).filter(function (x) { return x.id === button.getAttribute('data-routegate'); })[0]; bcAction(root, 'Review deployment gate', 'The review records the gate and fallback status. It does not edit a merchant funnel or change live traffic immediately.', 'Record gate review', bcStoreName(item.storeId), 'routing'); }; }); });
  }
  function bcWritebacks(root) {
    var rows = (B.writebacks || []).map(function (item) { return '<tr><td>' + linkCell(item.reference, bcStoreName(item.storeId), '#/stores/' + item.storeId) + '</td><td class="hide-md">' + esc(item.target) + '</td><td>' + status(item.idempotency) + '</td><td>' + status(item.state) + '</td><td class="hide-sm"><span class="ops-meta">' + esc(item.age) + '<br>' + esc(item.detail) + '</span></td><td>' + (item.state === 'Retryable' ? '<button class="btn btn-primary" data-writeback="' + esc(item.id) + '">Queue retry</button>' : '<span class="ops-meta">No action</span>') + '</td></tr>'; }).join('');
    var body = bcTabs('writebacks') + '<div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>BestCheckout order</th><th class="hide-md">Shopify target</th><th>Idempotency</th><th>State</th><th class="hide-sm">Details</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
    render(root, page('BestCheckout operations', 'Observe controlled Shopify order writeback and queue idempotent retries when needed.', '', body), function (scope) { scope.querySelectorAll('[data-writeback]').forEach(function (button) { button.onclick = function () { var item = (B.writebacks || []).filter(function (x) { return x.id === button.getAttribute('data-writeback'); })[0]; bcAction(root, 'Queue idempotent writeback retry', 'A retry is queued using the original idempotency key. It will not recharge the buyer or create a duplicate Shopify order.', 'Queue retry', item.reference, 'writebacks'); }; }); });
  }
  function bcEvents(root) {
    var rows = (B.events || []).map(function (item) { return '<tr><td>' + linkCell(item.subject, bcStoreName(item.storeId) + ' · ' + item.kind, '#/stores/' + item.storeId) + '</td><td>' + status(item.status) + '</td><td class="hide-md">' + esc(item.attempts) + '</td><td class="hide-sm"><span class="ops-meta">' + esc(item.age) + '<br>' + esc(item.detail) + '</span></td><td><button class="btn btn-default" data-event="' + esc(item.id) + '">' + esc(item.action) + '</button></td></tr>'; }).join('');
    var body = bcTabs('events') + '<div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Event</th><th>State</th><th class="hide-md">Attempts</th><th class="hide-sm">Details</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div><div class="ops-note">Raw Shopify payloads and webhook signatures are intentionally not rendered in the SaaS console.</div>';
    render(root, page('BestCheckout operations', 'Review delivery and catalog events, then create deduplicated replay or remediation work.', '', body), function (scope) { scope.querySelectorAll('[data-event]').forEach(function (button) { button.onclick = function () { var item = (B.events || []).filter(function (x) { return x.id === button.getAttribute('data-event'); })[0]; var action = item.action === 'Queue replay' ? 'Queue replay' : 'Create follow-up'; bcAction(root, action, 'The action creates an auditable, deduplicated operational task. Merchant configuration stays unchanged until the safe workflow completes.', action, item.subject, 'events'); }; }); });
  }
  function bcSupport(root) {
    var cases = B.support || []; var upgrades = B.upgrades || [];
    var caseRows = cases.map(function (item) { return '<tr><td>' + linkCell(item.subject, item.storeId ? bcStoreName(item.storeId) : 'Help Center', item.storeId ? '#/stores/' + item.storeId : '#/content') + '</td><td>' + esc(item.owner) + '</td><td>' + status(item.priority) + '</td><td>' + status(item.state) + '</td><td><button class="btn btn-default" data-support="' + esc(item.id) + '">' + esc(item.next) + '</button></td></tr>'; }).join('');
    var upgradeRows = upgrades.map(function (item) { return '<tr><td>' + linkCell(bcStoreName(item.storeId), item.continuity, '#/stores/' + item.storeId) + '</td><td>' + status(item.readiness) + '</td><td class="hide-sm">' + esc(item.next) + '</td><td><a class="ops-link" href="#/stores/' + item.storeId + '">Open store</a></td></tr>'; }).join('');
    var body = bcTabs('support') + '<div class="ops-layout"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Merchant support coordination</div><div class="ops-panel-sub">Record next steps without exposing internal logs or secrets to merchants.</div></div></div><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Case</th><th>Owner</th><th>Priority</th><th>State</th><th></th></tr></thead><tbody>' + caseRows + '</tbody></table></div></section><aside class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Upgrade continuity</div><div class="ops-panel-sub">BestCheckout merchants can move to BestShopio without rebuilding platform records.</div></div></div><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Store</th><th>Readiness</th><th class="hide-sm">Next step</th><th></th></tr></thead><tbody>' + upgradeRows + '</tbody></table></div></aside></div>';
    render(root, page('BestCheckout operations', 'Coordinate merchant recovery and controlled upgrade readiness from the platform side.', '', body), function (scope) { scope.querySelectorAll('[data-support]').forEach(function (button) { button.onclick = function () { var item = cases.filter(function (x) { return x.id === button.getAttribute('data-support'); })[0]; bcAction(root, 'Record merchant coordination', 'This records the merchant-facing next step. It does not transmit internal logs, provider tokens or operational implementation details.', 'Record coordination', item.subject, 'support'); }; }); });
  }
  function bestcheckout(root, parts) {
    var section = cleanPart(parts && parts[0]) || 'overview';
    if (section === 'installs') bcInstalls(root); else if (section === 'connections') bcConnections(root); else if (section === 'routing') bcRouting(root); else if (section === 'writebacks') bcWritebacks(root); else if (section === 'events') bcEvents(root); else if (section === 'support') bcSupport(root); else bcOverview(root);
  }

  window.SAAS_OPS = {
    home: home,
    task: task,
    stores: stores,
    organizations: organizations,
    content: content,
    domains: domains,
    integrations: integrations,
    plans: plans,
    governance: governance,
    bestcheckout: bestcheckout,
    installEmailPreview: installEmailPreview,
    contentApi: {
      esc: esc,
      icon: icon,
      toast: toast,
      apply: apply,
      route: route,
      cleanPart: cleanPart,
      audit: audit,
      status: status,
      page: page,
      render: render,
      back: back,
      fact: fact,
      confirmDialog: confirmDialog,
      listEmpty: listEmpty,
      modalFields: modalFields,
      content: helpContent,
      findArticle: findArticle,
      findCollection: findCollection
    }
  };
})();
