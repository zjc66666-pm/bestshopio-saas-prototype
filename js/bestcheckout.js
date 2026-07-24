/* BestCheckout operations: platform-owned service health and reconciliation console. */
(function () {
  var O = window.DATA.bestcheckoutOps;
  var PC;
  var P;
  var ico;
  var tab = 'overview';
  var storeFilter = 'all';
  var currentRoot;

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function store(id) { return O.stores.filter(function (s) { return s.id === id; })[0]; }
  function actionable(issue) { return ['Action required', 'Retryable', 'Merchant action'].indexOf(issue.state) >= 0; }
  function openIssue(issue) { return issue.state !== 'Resolved'; }
  function pill(status) {
    var map = {
      'Healthy': 'green', 'Connected': 'green', 'Completed': 'green', 'Replayed': 'green', 'Resolved': 'green', 'Verified': 'green', 'Configured': 'green', 'Enabled': 'green',
      'Review': 'orange', 'Retryable': 'orange', 'Replay queued': 'orange', 'Reconnection requested': 'orange', 'Not verified': 'orange', 'Pending': 'orange', 'Paused': 'gray', 'Disabled': 'gray', 'Not configured': 'gray',
      'Action required': 'red', 'Merchant action': 'red', 'Reauthorization needed': 'red', 'Not detected': 'red', 'Not connected': 'red', 'Failed': 'red',
      'Pending': 'orange'
    };
    return '<span class="pill pill-' + (map[status] || 'gray') + '"><span class="dot"></span>' + esc(status) + '</span>';
  }
  function syncStoreHealth(s) {
    var issues = O.syncIssues.filter(function (x) { return x.storeId === s.id && openIssue(x); });
    var retryWritebacks = O.writebacks.filter(function (x) { return x.storeId === s.id && ['Retryable', 'Replay queued'].indexOf(x.state) >= 0; });
    var runtime = O.runtime.filter(function (x) { return x.storeId === s.id; })[0];
    if (s.install === 'Reauthorization needed' || s.install === 'Reconnection requested') {
      s.data = 'Paused'; s.writeback = 'Paused'; s.health = 'Action required'; return;
    }
    if (runtime && runtime.status === 'Pending') {
      s.data = issues.length ? 'Review' : 'Healthy'; s.writeback = retryWritebacks.length ? 'Review' : 'Healthy';
      s.health = 'Review'; s.next = 'Prototype runtime request awaiting live acknowledgement'; return;
    }
    s.data = issues.length ? 'Review' : 'Healthy';
    s.writeback = retryWritebacks.length ? 'Review' : 'Healthy';
    if (runtime && runtime.surface === 'Shopify native only' && runtime.policy === 'Forced native fallback before payment') {
      s.health = 'Review'; s.next = 'Native fallback active — investigate before recovery'; return;
    }
    s.health = (issues.length || retryWritebacks.length) ? 'Review' : 'Healthy';
    s.next = issues.length ? issues.length + ' operational issue' + (issues.length > 1 ? 's' : '') + ' to resolve' :
      (retryWritebacks.length ? 'Replay ' + retryWritebacks.length + ' order writeback' : 'No action required');
  }
  function allHealth() { O.stores.forEach(syncStoreHealth); }
  function readinessMeta(label, value) {
    return '<span><em>' + esc(label) + '</em><b>' + esc(value) + '</b></span>';
  }
  function readinessRow(s, key, label) {
    var item = s.readiness[key];
    var meta = [];
    var action = 'Re-check';
    if (key === 'authorization') {
      meta = [readinessMeta('Granted scopes', item.scopes)];
    } else if (key === 'sync') {
      meta = [readinessMeta('Webhook delivery', item.detail)];
    } else if (key === 'domain') {
      meta = [readinessMeta('DNS host', item.host), readinessMeta('CNAME target', item.target), readinessMeta('SSL', item.ssl)];
      action = 'Re-check DNS';
    } else if (key === 'paymentConfig') {
      meta = [readinessMeta('Payment methods', item.methods), readinessMeta('Payment webhooks', item.detail)];
      action = 'Re-check payment';
    } else if (key === 'embed') {
      meta = [readinessMeta('Injection paths', item.detail)];
      action = item.status === 'Not detected' ? 'Restore App Embed' : 'Re-check App Embed';
    }
    return '<article class="bco-readiness-row">' +
      '<div class="bco-readiness-head"><div><strong>' + esc(label) + '</strong><span>' + esc(item.value) + '</span></div>' + pill(item.status) + '</div>' +
      '<div class="bco-readiness-meta">' + meta.join('') + '</div>' +
      '<div class="bco-readiness-foot"><span>Last checked: <b>' + esc(item.checked) + '</b></span>' +
        '<button class="btn btn-default" data-readiness-check="' + esc(key) + '">' + action + '</button></div>' +
      '</article>';
  }
  function readinessPanel(s) {
    var checks = s.readiness;
    var attention = Object.keys(checks).filter(function (key) {
      return ['Healthy', 'Connected', 'Verified', 'Configured', 'Enabled'].indexOf(checks[key].status) < 0;
    }).length;
    return '<div class="bco-detail-block"><div class="bco-readiness-title"><div><div class="bco-detail-title">Installation readiness</div><div class="bco-detail-note">The same installation prerequisites shown to the merchant, checked from the operations side. Credentials are never displayed here.</div></div>' +
      pill(attention ? 'Review' : 'Healthy') + '</div>' +
      '<div class="bco-readiness-list">' +
        readinessRow(s, 'authorization', 'Shopify authorization') +
        readinessRow(s, 'sync', 'Data sync & webhooks') +
        readinessRow(s, 'domain', 'Checkout domain & DNS') +
        readinessRow(s, 'paymentConfig', 'Payment configuration') +
        readinessRow(s, 'embed', 'App Embed injection') +
      '</div>' +
      '<div class="bco-drawer-actions"><button class="btn btn-primary" data-readiness-check="all">Run full check</button></div></div>';
  }
  function checkReadiness(s, key) {
    var keys = key === 'all' ? ['authorization', 'sync', 'domain', 'paymentConfig', 'embed'] : [key];
    keys.forEach(function (name) { s.readiness[name].checked = 'demo just now'; });
    if (key === 'embed' && s.readiness.embed.status === 'Not detected') {
      s.readiness.embed.detail = 'App Embed is still missing from the live theme';
    }
    paint();
    PC.toast(key === 'all' ? 'Prototype checks refreshed. No live Shopify data was queried.' : 'Prototype check refreshed. No live Shopify data was queried.');
  }
  function restoreEmbed(s) {
    if (s.install !== 'Connected') {
      PC.toast('Reconnect Shopify before restoring App Embed.');
      return;
    }
    s.readiness.embed.status = 'Pending';
    s.readiness.embed.detail = 'Prototype restore request queued — awaiting a live theme check';
    s.readiness.embed.checked = 'demo just now';
    paint();
    PC.toast('Prototype only: App Embed restore request queued. No live theme was changed.');
  }
  function openDrawer(s) {
    var issues = O.syncIssues.filter(function (x) { return x.storeId === s.id; });
    var orders = O.writebacks.filter(function (x) { return x.storeId === s.id; });
    var run = O.runtime.filter(function (x) { return x.storeId === s.id; })[0];
    PC.drawer(
      '<div class="drawer-head"><div><div>' + esc(s.store) + '</div><div class="bco-drawer-sub">' + esc(s.domain) + '</div></div><button class="drawer-x" data-x aria-label="Close">' + ico(P.close, 18) + '</button></div>' +
      '<div class="drawer-body bco-drawer-body">' +
        '<div class="bco-drawer-grid">' +
          '<div><span>Shopify app</span>' + pill(s.install) + '</div><div><span>Product data</span>' + pill(s.data) + '</div>' +
          '<div><span>Order writeback</span>' + pill(s.writeback) + '</div><div><span>Last successful sync</span><strong>' + esc(s.lastSuccess) + '</strong></div>' +
          '<div><span>Last sync attempt</span><strong>' + esc(s.lastAttempt) + '</strong></div>' +
        '</div>' +
        readinessPanel(s) +
        '<div class="bco-detail-block"><div class="bco-detail-title">Checkout runtime</div>' +
          '<div class="bco-runtime-detail"><span>' + esc(run.surface) + '</span><span>' + esc(run.policy) + '</span></div>' +
          '<div class="bco-detail-note">The native Shopify path remains available before payment for service continuity.</div>' +
          '<div class="bco-drawer-actions">' + runtimeAction(run) + '</div></div>' +
        '<div class="bco-detail-block"><div class="bco-detail-title">Operational issues</div>' +
          (issues.length ? issues.map(function (x) { return '<div class="bco-mini-row"><div><strong>' + esc(x.kind) + '</strong><span>' + esc(x.subject) + '</span></div><div class="bco-mini-actions">' + pill(x.state) + (actionable(x) ? '<button class="btn btn-default" data-drawer-issue="' + x.id + '">' + esc(x.action) + '</button>' : '<span class="bco-await">' + esc(x.action) + '</span>') + '</div></div>'; }).join('') : '<div class="muted">No active issues.</div>') +
        '</div>' +
        '<div class="bco-detail-block"><div class="bco-detail-title">Recent order writeback</div>' +
          orders.map(function (x) { return '<div class="bco-mini-row"><div><strong>' + esc(x.order) + ' → ' + esc(x.shopifyOrder) + '</strong><span>' + esc(x.detail) + '</span></div><div class="bco-mini-actions">' + pill(x.state) + (x.state === 'Retryable' ? '<button class="btn btn-default" data-drawer-writeback="' + x.id + '">Replay writeback</button>' : '') + '</div></div>'; }).join('') +
        '</div>' +
      '</div>', function (drawer) {
        drawer.querySelectorAll('[data-x]').forEach(function (b) { b.onclick = function () { drawer.remove(); }; });
        drawer.querySelectorAll('[data-readiness-check]').forEach(function (b) { b.onclick = function () {
          var key = b.getAttribute('data-readiness-check');
          if (key === 'embed' && s.readiness.embed.status === 'Not detected') restoreEmbed(s, drawer);
          else checkReadiness(s, key, drawer);
        }; });
        drawer.querySelectorAll('[data-drawer-issue]').forEach(function (b) { b.onclick = function () { drawer.remove(); resolveIssue(b.getAttribute('data-drawer-issue')); }; });
        drawer.querySelectorAll('[data-drawer-writeback]').forEach(function (b) { b.onclick = function () { drawer.remove(); retryWriteback(b.getAttribute('data-drawer-writeback')); }; });
      });
  }
  function detailFact(label, value) {
    return '<div class="bco-detail-fact"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
  }
  function detailStatus(label, status) {
    return '<div class="bco-detail-fact"><span>' + esc(label) + '</span>' + pill(status) + '</div>';
  }
  function backIcon() { return ico('<path d="m15 18-6-6 6-6"/><path d="M9 12h11"/>', 17); }
  function openStorePage(id, sourceTab) {
    var from = sourceTab || tab || 'stores';
    var query = '?from=' + encodeURIComponent(from);
    if (from === 'connections' && storeFilter !== 'all') query += '&filter=' + encodeURIComponent(storeFilter);
    location.hash = '#/bestcheckout/stores/' + id + query;
  }
  function demoNotice() {
    return '<div class="bco-demo-notice"><strong>Prototype data</strong><span>Operations and statuses are simulated. No live Shopify, payment, DNS or store data is changed.</span></div>';
  }
  function storeDetail(s) {
    var B = s.bestshopio;
    var issues = O.syncIssues.filter(function (x) { return x.storeId === s.id; });
    var orders = O.writebacks.filter(function (x) { return x.storeId === s.id; });
    var run = O.runtime.filter(function (x) { return x.storeId === s.id; })[0];
    return '<div class="view-wrap bco-view bco-store-detail">' + demoNotice() + '<div class="bco-detail-page-head">' +
      '<div class="bco-detail-page-title"><button class="back-btn" data-store-back title="Back to stores">' + backIcon() + '</button><div><div class="bco-title-line"><span class="page-title">' + esc(B.storeName) + '</span>' + pill(B.storeStatus) + '</div><div class="pc-sub"><span>BestShopio shop ID</span> <b class="bco-mono">' + esc(s.shopId) + '</b> · <span>Associated Shopify store</span>: ' + esc(s.store) + '</div></div></div>' +
      '<div class="pc-acts"><button class="btn btn-primary" data-readiness-check="all">Run full check</button></div></div>' +
      '<div class="bco-detail-summary">' +
        detailStatus('Store runtime', B.storeStatus) + detailStatus('Provisioning', B.provisionStatus) +
        detailFact('Default domain', B.defaultDomain) + detailFact('Region', B.region) +
      '</div>' +
      '<div class="bco-detail-page-grid"><div class="bco-detail-main">' +
        '<section class="panel card-pad"><div class="blk-title">Store identity</div><div class="bco-detail-note">The BestShopio store is the control-plane record. Shopify and BestCheckout are associated capabilities.</div><div class="bco-fact-grid">' +
          detailFact('BestShopio shop ID', s.shopId) + detailFact('Merchant', B.merchant) + detailFact('Merchant ID', B.merchantId) + detailFact('Routing version', B.routingVersion) + detailFact('Store created', B.createdAt) + detailFact('Region', B.region) +
        '</div></section>' +
        '<section class="panel card-pad"><div class="blk-title">Provisioning & domains</div><div class="bco-fact-grid">' +
          detailStatus('Provisioning task', B.provisionStatus) + detailFact('Task last updated', B.taskUpdated) + detailFact('System domain', B.defaultDomain) + detailFact('Custom storefront domain', B.customDomain) + detailStatus('Store SSL', B.ssl) + detailStatus('Store runtime', B.storeStatus) +
        '</div></section>' +
        '<section class="panel card-pad"><div class="bco-linked-shopify"><div><div class="blk-title">Associated Shopify store</div><div class="bco-detail-note">' + esc(s.store) + ' · ' + esc(s.domain) + '</div></div>' + pill(s.install) + '</div>' + readinessPanel(s) + '</section>' +
      '</div><aside class="bco-detail-side">' +
        '<section class="panel card-pad"><div class="blk-title">Checkout runtime</div><div class="bco-runtime-detail"><span>' + esc(run.surface) + '</span><span>' + esc(run.policy) + '</span></div><div class="bco-detail-note">The native Shopify path remains available before payment for service continuity.</div><div class="bco-drawer-actions">' + runtimeAction(run) + '</div></section>' +
        '<section class="panel card-pad"><div class="blk-title">Operational issues</div>' +
          (issues.length ? issues.map(function (x) { return '<div class="bco-mini-row"><div><strong>' + esc(x.kind) + '</strong><span>' + esc(x.subject) + '</span></div><div class="bco-mini-actions">' + pill(x.state) + (actionable(x) ? '<button class="btn btn-default" data-issue="' + x.id + '">' + esc(x.action) + '</button>' : '<span class="bco-await">' + esc(x.action) + '</span>') + '</div></div>'; }).join('') : '<div class="muted">No active issues.</div>') +
        '</section>' +
        '<section class="panel card-pad"><div class="blk-title">Recent order writeback</div>' +
          orders.map(function (x) { return '<div class="bco-mini-row"><div><strong>' + esc(x.order) + ' → ' + esc(x.shopifyOrder) + '</strong><span>' + esc(x.detail) + '</span></div><div class="bco-mini-actions">' + pill(x.state) + (x.state === 'Retryable' ? '<button class="btn btn-default" data-writeback="' + x.id + '">Replay writeback</button>' : '') + '</div></div>'; }).join('') +
        '</section>' +
      '</aside></div></div>';
  }
  function mapReplacement(issue) {
    PC.modal('<div class="modal-head"><div class="modal-title">Map replacement variant</div><div class="modal-sub">Update the offer rule to a live Shopify variant. The merchant-facing funnel remains unchanged.</div></div>' +
      '<div class="modal-body"><label class="fld-label">Replacement Shopify variant</label><select class="input" id="bcoReplacement"><option>4819 / Sage linen dress · Small</option><option>4820 / Sage linen dress · Medium</option></select></div>' +
      '<div class="modal-foot"><button class="btn btn-default" data-mx>Cancel</button><button class="btn btn-primary" data-confirm>Confirm mapping</button></div>', function (m) {
      m.querySelector('[data-mx]').onclick = function () { m.remove(); };
      m.querySelector('[data-confirm]').onclick = function () { issue.state = 'Review'; issue.action = 'Prototype mapping recorded — awaiting verification'; allHealth(); m.remove(); paint(); PC.toast('Prototype only: replacement mapping recorded. Live offer rules were not changed.'); };
    });
  }
  function replayIssue(issue) {
    issue.state = 'Replay queued'; issue.action = 'Prototype replay queued — awaiting Shopify acknowledgement'; issue.retries += 1; allHealth(); paint();
    PC.toast('Prototype only: webhook replay queued. No Shopify event was sent.');
  }
  function requestReconnection(issue) {
    var s = store(issue.storeId); issue.state = 'Reconnection requested'; issue.action = 'Prototype request staged'; s.install = 'Reconnection requested'; s.next = 'Prototype reconnection request staged'; allHealth(); paint();
    PC.toast('Prototype only: reconnection request staged. No merchant notification was sent.');
  }
  function resolveIssue(id) {
    var issue = O.syncIssues.filter(function (x) { return x.id === id; })[0];
    if (!issue) return;
    if (issue.kind === 'Variant mapping') mapReplacement(issue);
    else if (issue.kind === 'Authorization') requestReconnection(issue);
    else replayIssue(issue);
  }
  function retryWriteback(id) {
    var job = O.writebacks.filter(function (x) { return x.id === id; })[0];
    if (!job) return;
    job.state = 'Replay queued'; job.age = 'demo just now'; job.detail = 'Prototype replay queued — awaiting Shopify idempotency confirmation.'; allHealth(); paint();
    PC.toast('Prototype only: writeback replay queued. No Shopify order was changed.');
  }
  function retryStoreSync(id) {
    var s = store(id); if (!s) return;
    if (s.install !== 'Connected') { PC.toast('Data refresh is blocked until the merchant reconnects Shopify.'); return; }
    s.lastAttempt = 'demo just now · refresh queued'; PC.toast('Prototype only: data refresh queued for ' + s.store + '. No live Shopify data was requested.'); paint();
  }
  function runtimeAction(run) {
    var s = store(run.storeId);
    if (run.status === 'Pending') return '<span class="bco-await">Prototype change pending live acknowledgement</span>';
    if (run.surface === 'Shopify native only') {
      return s.install === 'Connected'
        ? '<button class="btn btn-default" data-runtime-restore="' + run.storeId + '">Resume BestCheckout</button>'
        : '<span class="bco-await">Reauthorization required before recovery</span>';
    }
    return '<button class="btn btn-danger" data-runtime-fallback="' + run.storeId + '">Switch to Shopify native</button>';
  }
  function changeRuntime(storeId, nextMode) {
    var run = O.runtime.filter(function (x) { return x.storeId === storeId; })[0];
    var s = store(storeId); if (!run || !s) return;
    var isFallback = nextMode === 'fallback';
    if (!isFallback && s.install !== 'Connected') { PC.toast('BestCheckout cannot resume until Shopify is reauthorized.'); return; }
    var title = isFallback ? 'Switch checkout traffic to Shopify native?' : 'Resume BestCheckout traffic?';
    var copy = isFallback
      ? 'Prototype only: this queues a simulated request to stop BestCheckout traffic before payment for ' + s.store + '. No live checkout traffic will change.'
      : 'Prototype only: this queues a simulated request to resume BestCheckout for ' + s.store + '. No live checkout traffic will change.';
    PC.modal('<div class="modal-head"><div class="modal-title">' + title + '</div><div class="modal-sub">' + copy + '</div></div>' +
      '<div class="modal-foot"><button class="btn btn-default" data-runtime-cancel>Cancel</button><button class="btn ' + (isFallback ? 'btn-danger' : 'btn-primary') + '" data-runtime-confirm>' + (isFallback ? 'Switch now' : 'Resume') + '</button></div>', function (m) {
      m.querySelector('[data-runtime-cancel]').onclick = function () { m.remove(); };
      m.querySelector('[data-runtime-confirm]').onclick = function () {
        if (isFallback) {
          run.requestedSurface = 'Shopify native only'; run.requestedPolicy = 'Forced native fallback before payment'; run.status = 'Pending';
          s.next = 'Prototype fallback request awaiting live acknowledgement';
        } else {
          run.requestedSurface = 'Hosted Checkout'; run.requestedPolicy = 'Shopify native control 15%'; run.status = 'Pending';
          s.next = 'Prototype recovery request awaiting live acknowledgement';
        }
        m.remove(); allHealth(); paint();
        PC.toast(isFallback ? 'Prototype only: native fallback request queued. No live traffic changed.' : 'Prototype only: BestCheckout recovery request queued. No live traffic changed.');
      };
    });
  }
  function tabs() {
    var items = [
      ['overview', 'Overview'], ['stores', 'BestShopio stores'], ['connections', 'Shopify connections & sync'], ['writeback', 'Order writeback'], ['runtime', 'Runtime safety']
    ];
    return '<div class="tabs bco-tabs">' + items.map(function (x) { return '<button class="tab' + (tab === x[0] ? ' active' : '') + '" data-bco-tab="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
  }
  function overview() {
    var activeIssues = O.syncIssues.filter(openIssue);
    var retryWrites = O.writebacks.filter(function (x) { return x.state === 'Retryable'; });
    return '<div class="bco-kpis">' +
      '<div class="panel bco-kpi"><span>Connected stores</span><strong>' + O.stores.filter(function (x) { return x.install === 'Connected'; }).length + '</strong><small>of ' + O.stores.length + ' in this control plane</small></div>' +
      '<div class="panel bco-kpi"><span>Healthy data feeds</span><strong>' + O.stores.filter(function (x) { return x.data === 'Healthy'; }).length + '</strong><small>latest successful Shopify refresh</small></div>' +
      '<div class="panel bco-kpi bco-kpi-alert"><span>Needs attention</span><strong>' + activeIssues.length + '</strong><small>sync and authorization exceptions</small></div>' +
      '<div class="panel bco-kpi"><span>Writeback queue</span><strong>' + retryWrites.length + '</strong><small>order projection awaiting replay</small></div>' +
    '</div>' +
    '<div class="bco-two-col"><div class="panel"><div class="bco-panel-head"><div><div class="blk-title">Operational queue</div><div class="blk-sub">Issues are handled here; merchants only see whether their data is ready.</div></div><button class="btn btn-default" data-goto="connections">View all</button></div>' +
      '<div class="bco-queue">' + activeIssues.map(function (x) { var s = store(x.storeId); return '<div class="bco-queue-row"><div class="bco-queue-main"><div><strong>' + esc(s.store) + '</strong> <span class="muted">· ' + esc(x.kind) + '</span></div><span>' + esc(x.detail) + '</span></div><div class="bco-queue-actions">' + pill(x.state) + (actionable(x) ? '<button class="btn btn-default" data-issue="' + x.id + '">' + esc(x.action) + '</button>' : '<span class="bco-await">' + esc(x.action) + '</span>') + '</div></div>'; }).join('') + '</div></div>' +
      '<div class="panel card-pad"><div class="blk-title">Safety posture</div><div class="bco-safety-list"><div><span>Pre-payment fallback</span><strong>Shopify native remains available</strong></div><div><span>Native control groups</span><strong>10–20% on active hosted checkouts</strong></div><div><span>Authorization loss</span><strong>Automatically routes to Shopify native</strong></div></div><button class="btn btn-default" data-goto="runtime">Review runtime safety</button></div></div>';
  }
  function storeAction(s) {
    if (s.install !== 'Connected') {
      var authorization = O.syncIssues.filter(function (x) { return x.storeId === s.id && x.kind === 'Authorization'; })[0];
      return authorization && actionable(authorization)
        ? '<button class="btn btn-primary" data-issue="' + authorization.id + '">Request reconnection</button><button class="btn btn-default" data-store="' + s.id + '">Details</button>'
        : '<span class="bco-await">Awaiting merchant reconnection</span><button class="btn btn-default" data-store="' + s.id + '">Details</button>';
    }
    return '<button class="btn btn-default" data-retry-store="' + s.id + '">Refresh data</button><button class="btn btn-default" data-store="' + s.id + '">Details</button>';
  }
  function mobileConnections(list) {
    return '<div class="bco-mobile-list">' + list.map(function (s) { var B = s.bestshopio; return '<article class="bco-mobile-card"><div class="bco-mobile-head"><div class="bco-store"><strong>' + esc(B.storeName) + '</strong><span class="bco-mono">' + esc(s.shopId) + '</span></div>' + pill(s.health) + '</div><div class="bco-mobile-grid"><div><span>Associated Shopify store</span><strong>' + esc(s.store) + ' · ' + esc(s.domain) + '</strong></div><div><span>Shopify app</span>' + pill(s.install) + '</div><div><span>Product data</span>' + pill(s.data) + '</div><div><span>Last success</span><strong>' + esc(s.lastSuccess) + '</strong></div><div><span>Last attempt</span><strong>' + esc(s.lastAttempt) + '</strong></div><div><span>Checkout</span><strong>' + esc(s.funnels) + ' · ' + esc(s.payment) + '</strong></div><div><span>Order writeback</span>' + pill(s.writeback) + '</div></div><div class="bco-mobile-next"><span>Next action</span><strong>' + esc(s.next) + '</strong></div><div class="bco-mobile-actions">' + storeAction(s) + '</div></article>'; }).join('') + '</div>';
  }
  function mobileWritebacks() {
    return '<div class="bco-mobile-list">' + O.writebacks.map(function (x) { var s = store(x.storeId); return '<article class="bco-mobile-card"><div class="bco-mobile-head"><div><strong class="bco-mono">' + esc(x.order) + '</strong><span class="bco-mobile-sub">' + esc(s.store) + ' · ' + esc(x.shopifyOrder) + '</span></div>' + pill(x.state) + '</div><div class="bco-mobile-next"><span>Detail</span><strong>' + esc(x.detail) + '</strong></div><div class="bco-mobile-actions">' + (x.state === 'Retryable' ? '<button class="btn btn-primary" data-writeback="' + x.id + '">Replay writeback</button>' : '<button class="btn btn-default" data-store="' + x.storeId + '">Details</button>') + '</div></article>'; }).join('') + '</div>';
  }
  function mobileRuntime() {
    return '<div class="bco-mobile-list">' + O.runtime.map(function (x) { var s = store(x.storeId); var B = s.bestshopio; return '<article class="bco-mobile-card"><div class="bco-mobile-head"><div class="bco-store"><strong>' + esc(B.storeName) + '</strong><span class="bco-mono">' + esc(s.shopId) + '</span></div>' + pill(x.status) + '</div><div class="bco-mobile-grid"><div><span>Associated Shopify store</span><strong>' + esc(s.store) + '</strong></div><div><span>Checkout surface</span><strong>' + esc(x.surface) + '</strong></div><div><span>Traffic policy</span><strong>' + esc(x.policy) + '</strong></div></div><div class="bco-mobile-next"><span>Active funnel</span><strong>' + esc(x.funnel) + '</strong></div><div class="bco-mobile-actions">' + runtimeAction(x) + '<button class="btn btn-default" data-store="' + x.storeId + '">Open BestShopio store</button></div></article>'; }).join('') + '</div>';
  }
  function mobileBestshopStores() {
    return '<div class="bco-mobile-list">' + O.stores.map(function (s) { var B = s.bestshopio; return '<article class="bco-mobile-card"><div class="bco-mobile-head"><div class="bco-store"><strong>' + esc(B.storeName) + '</strong><span class="bco-mono">' + esc(s.shopId) + '</span></div>' + pill(B.storeStatus) + '</div><div class="bco-mobile-grid"><div><span>Provisioning</span>' + pill(B.provisionStatus) + '</div><div><span>Region</span><strong>' + esc(B.region) + '</strong></div><div><span>Default domain</span><strong>' + esc(B.defaultDomain) + '</strong></div><div><span>Associated Shopify store</span><strong>' + esc(s.store) + '</strong></div></div><div class="bco-mobile-next"><span>BestCheckout</span>' + pill(s.health) + '</div><div class="bco-mobile-actions"><button class="btn btn-primary" data-store="' + s.id + '">View store</button></div></article>'; }).join('') + '</div>';
  }
  function bestshopStores() {
    return '<div class="info-banner">' + ico(P.info, 16) + '<span>BestShopio stores are the control-plane source of truth. Each BestCheckout Shopify connection is associated with one BestShopio shop ID.</span></div>' +
      '<div class="pc-filters"><span class="pc-eff">' + O.stores.length + ' BestShopio stores · self-service provisioning, domains and connected BestCheckout status</span></div>' +
      '<div class="panel bco-table-wrap"><table class="tbl"><thead><tr><th>BestShopio store</th><th>Provisioning</th><th>Default domain</th><th>Associated Shopify store</th><th>BestCheckout</th><th>Next action</th><th></th></tr></thead><tbody>' +
        O.stores.map(function (s) { var B = s.bestshopio; return '<tr><td><div class="bco-store"><strong>' + esc(B.storeName) + '</strong><span class="bco-mono">' + esc(s.shopId) + '</span></div></td><td>' + pill(B.provisionStatus) + '</td><td class="bco-next">' + esc(B.defaultDomain) + '</td><td><div class="bco-store"><strong>' + esc(s.store) + '</strong><span>' + esc(s.domain) + '</span></div></td><td>' + pill(s.health) + '</td><td class="bco-next">' + esc(s.next) + '</td><td><button class="btn btn-default" data-store="' + s.id + '">View store</button></td></tr>'; }).join('') +
      '</tbody></table></div>' + mobileBestshopStores();
  }
  function connections() {
    var list = O.stores.filter(function (s) {
      if (storeFilter === 'attention') return s.health !== 'Healthy';
      if (storeFilter === 'healthy') return s.health === 'Healthy';
      if (storeFilter === 'paused') return s.data === 'Paused';
      return true;
    });
    return '<div class="info-banner">' + ico(P.info, 16) + '<span>This is the operations-only source of truth for Shopify connection, product refresh and exception recovery. Merchant settings only state whether their data is ready to use.</span></div>' +
      '<div class="pc-filters"><select class="filter-select" id="bcoStoreFilter"><option value="all">All stores (' + O.stores.length + ')</option><option value="attention">Needs attention (' + O.stores.filter(function (s) { return s.health !== 'Healthy'; }).length + ')</option><option value="healthy">Healthy (' + O.stores.filter(function (s) { return s.health === 'Healthy'; }).length + ')</option><option value="paused">Paused (' + O.stores.filter(function (s) { return s.data === 'Paused'; }).length + ')</option></select><span class="pc-spacer"></span><span class="pc-eff">Shopify connection status is checked continuously.</span></div>' +
      '<div class="panel bco-table-wrap"><table class="tbl"><thead><tr><th>BestShopio store</th><th>Shopify app</th><th>Product data</th><th>Last success</th><th>Last attempt</th><th>Checkout</th><th>Order writeback</th><th>Next action</th><th></th></tr></thead><tbody>' +
      list.map(function (s) { var B = s.bestshopio; return '<tr><td><div class="bco-store"><strong>' + esc(B.storeName) + '</strong><span class="bco-mono">' + esc(s.shopId) + '</span><span>Associated Shopify: ' + esc(s.store) + ' · ' + esc(s.domain) + '</span></div></td><td>' + pill(s.install) + '</td><td>' + pill(s.data) + '</td><td class="muted">' + esc(s.lastSuccess) + '</td><td class="muted">' + esc(s.lastAttempt) + '</td><td>' + esc(s.funnels) + ' · ' + esc(s.payment) + '</td><td>' + pill(s.writeback) + '</td><td class="bco-next">' + esc(s.next) + '</td><td><span class="row-acts">' + storeAction(s) + '</span></td></tr>'; }).join('') +
      '</tbody></table></div>' + mobileConnections(list);
  }
  function writeback() {
    return '<div class="info-banner">' + ico(P.info, 16) + '<span>Order writeback uses idempotent replay. Replaying a job does not create a duplicate Shopify order.</span></div>' +
      '<div class="panel bco-table-wrap"><table class="tbl"><thead><tr><th>BestCheckout order</th><th>Shopify order</th><th>Store</th><th>Status</th><th>Age</th><th>Detail</th><th></th></tr></thead><tbody>' +
      O.writebacks.map(function (x) { var s = store(x.storeId); return '<tr><td class="bco-mono">' + esc(x.order) + '</td><td>' + esc(x.shopifyOrder) + '</td><td>' + esc(s.store) + '</td><td>' + pill(x.state) + '</td><td class="muted">' + esc(x.age) + '</td><td class="bco-next">' + esc(x.detail) + '</td><td>' + (x.state === 'Retryable' ? '<button class="btn btn-primary" data-writeback="' + x.id + '">Replay writeback</button>' : '<button class="btn btn-default" data-store="' + x.storeId + '">Details</button>') + '</td></tr>'; }).join('') +
      '</tbody></table></div>' + mobileWritebacks();
  }
  function runtime() {
    return '<div class="info-banner">' + ico(P.info, 16) + '<span>BestCheckout must never remove the merchant’s native Shopify checkout control. These policies keep a control group and provide a safe path before payment when service signals degrade.</span></div>' +
      '<div class="panel bco-table-wrap"><table class="tbl"><thead><tr><th>BestShopio store</th><th>Checkout surface</th><th>Traffic policy</th><th>Active funnel</th><th>Status</th><th></th></tr></thead><tbody>' +
      O.runtime.map(function (x) { var s = store(x.storeId); var B = s.bestshopio; return '<tr><td><div class="bco-store"><strong>' + esc(B.storeName) + '</strong><span class="bco-mono">' + esc(s.shopId) + '</span><span>Associated Shopify: ' + esc(s.store) + '</span></div></td><td>' + esc(x.surface) + '</td><td>' + esc(x.policy) + '</td><td>' + esc(x.funnel) + '</td><td>' + pill(x.status) + '</td><td><span class="row-acts">' + runtimeAction(x) + '<button class="btn btn-default" data-store="' + x.storeId + '">Open BestShopio store</button></span></td></tr>'; }).join('') +
      '</tbody></table></div>' + mobileRuntime() +
      '<div class="panel card-pad bco-runtime-note"><div><div class="blk-title">Operational rule</div><div class="blk-sub">If Shopify authorization is revoked or the hosted route becomes unsafe, stop BestCheckout traffic before payment and keep the merchant’s native checkout available.</div></div><button class="btn btn-default" data-store="shop_river">Review active fallback</button></div>';
  }
  function body() {
    if (tab === 'stores') return bestshopStores();
    if (tab === 'connections') return connections();
    if (tab === 'writeback') return writeback();
    if (tab === 'runtime') return runtime();
    return overview();
  }
  function routePath() { return (location.hash || '').replace(/^#\/?/, ''); }
  function routeParts() { return routePath().split('?')[0].split('/'); }
  function routeParam(name) {
    var match = routePath().match(new RegExp('[?&]' + name + '=([^&]+)'));
    return match ? decodeURIComponent(match[1]) : '';
  }
  function detailStoreFromRoute() {
    var parts = routeParts();
    return parts[0] === 'bestcheckout' && parts[1] === 'stores' && parts[2] ? store(parts[2]) : null;
  }
  function isStoreListRoute() {
    var parts = routeParts();
    return parts[0] === 'bestcheckout' && parts[1] === 'stores' && !parts[2];
  }
  function isStoreDetailRoute() {
    var parts = routeParts();
    return parts[0] === 'bestcheckout' && parts[1] === 'stores' && !!parts[2];
  }
  function unknownStorePage() {
    return '<div class="view-wrap bco-view bco-store-detail">' + demoNotice() + '<div class="bco-empty-store"><div class="page-title">BestShopio store not found</div><div class="pc-sub">This shop ID is unavailable or no longer exists in the prototype data.</div><button class="btn btn-primary" data-store-missing-back>Back to BestShopio stores</button></div></div>';
  }
  function switchTab(next) {
    tab = next;
    var nextHash = next === 'stores' ? '#/bestcheckout/stores' : (next === 'overview' ? '#/bestcheckout' : '#/bestcheckout/section/' + encodeURIComponent(next));
    if (location.hash === nextHash) paint();
    else location.hash = nextHash;
  }
  function bind(root) {
    root.querySelectorAll('[data-bco-tab]').forEach(function (b) { b.onclick = function () { switchTab(b.getAttribute('data-bco-tab')); }; });
    root.querySelectorAll('[data-goto]').forEach(function (b) { b.onclick = function () { switchTab(b.getAttribute('data-goto')); }; });
    var filter = root.querySelector('#bcoStoreFilter'); if (filter) { filter.value = storeFilter; filter.onchange = function () { storeFilter = filter.value; paint(root); }; }
    root.querySelectorAll('[data-issue]').forEach(function (b) { b.onclick = function () { resolveIssue(b.getAttribute('data-issue')); }; });
    root.querySelectorAll('[data-store]').forEach(function (b) { b.onclick = function () { openStorePage(b.getAttribute('data-store')); }; });
    root.querySelectorAll('[data-store-back]').forEach(function (b) { b.onclick = function () { var from = routeParam('from'); var filterValue = routeParam('filter'); location.hash = from === 'stores' || !from ? '#/bestcheckout/stores' : '#/bestcheckout/section/' + encodeURIComponent(from) + (filterValue ? '?filter=' + encodeURIComponent(filterValue) : ''); }; });
    root.querySelectorAll('[data-store-missing-back]').forEach(function (b) { b.onclick = function () { location.hash = '#/bestcheckout/stores'; }; });
    root.querySelectorAll('[data-retry-store]').forEach(function (b) { b.onclick = function () { retryStoreSync(b.getAttribute('data-retry-store')); }; });
    root.querySelectorAll('[data-writeback]').forEach(function (b) { b.onclick = function () { retryWriteback(b.getAttribute('data-writeback')); }; });
    root.querySelectorAll('[data-runtime-fallback]').forEach(function (b) { b.onclick = function () { changeRuntime(b.getAttribute('data-runtime-fallback'), 'fallback'); }; });
    root.querySelectorAll('[data-runtime-restore]').forEach(function (b) { b.onclick = function () { changeRuntime(b.getAttribute('data-runtime-restore'), 'restore'); }; });
    root.querySelectorAll('[data-readiness-check]').forEach(function (b) { b.onclick = function () {
      var s = detailStoreFromRoute(); if (!s) return;
      var key = b.getAttribute('data-readiness-check');
      if (key === 'embed' && s.readiness.embed.status === 'Not detected') restoreEmbed(s);
      else checkReadiness(s, key);
    }; });
    var activeTab = root.querySelector('.bco-tabs .tab.active');
    if (activeTab && activeTab.scrollIntoView) activeTab.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function paint(root) {
    currentRoot = root || currentRoot;
    root = currentRoot;
    allHealth();
    var detailStore = detailStoreFromRoute();
    if (detailStore) root.innerHTML = storeDetail(detailStore);
    else if (isStoreDetailRoute()) root.innerHTML = unknownStorePage();
    else {
      var parts = routeParts();
      if (isStoreListRoute()) tab = 'stores';
      else if (parts[1] === 'section' && ['overview', 'connections', 'writeback', 'runtime'].indexOf(parts[2]) >= 0) tab = parts[2];
      if (routeParam('filter')) storeFilter = routeParam('filter');
      root.innerHTML = '<div class="view-wrap bco-view">' + demoNotice() + '<div class="pc-head"><div><div class="page-title">BestCheckout operations</div><div class="pc-sub">Platform control plane for BestShopio stores, Shopify connection, data reconciliation, order writeback and checkout safety. Keep implementation details out of the merchant app.</div></div><div class="pc-acts"><span class="pc-eff">Last status evaluation: demo just now</span></div></div>' + tabs() + body() + '</div>';
    }
    bind(root); if (window.I18N) window.I18N.apply(root);
  }
  window.__viewBestCheckout = function (root) {
    PC = window.PC;
    P = PC.P;
    ico = PC.ico;
    currentRoot = root;
    paint(root);
  };
})();
