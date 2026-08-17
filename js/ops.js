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
    if (/failed|suspend|action required|blocked|reauthorization|retryable|merchant action|not connected|not verified|disabled/.test(text)) return 'danger';
    if (/review|pending|progress|waiting|pilot|queued|draft|open/.test(text)) return 'warn';
    if (/paused|not configured|archived|hidden/.test(text)) return 'muted';
    return 'ok';
  }
  function status(value) {
    return '<span class="ops-status ' + statusTone(value) + '"><i></i>' + esc(value || '—') + '</span>';
  }
  function linkCell(title, meta, href) {
    return '<a class="ops-row-link" href="' + esc(href) + '"><strong>' + esc(title) + '</strong>' + (meta ? '<span>' + esc(meta) + '</span>' : '') + '</a>';
  }
  function page(title, sub, actions, body, crumb) {
    var pageClass = title === 'Help Center' ? ' ops-page-help-center' : title === 'Stores' ? ' ops-page-stores' : '';
    return '<section class="ops-page' + pageClass + '">' +
      (crumb ? '<div class="ops-breadcrumb">' + crumb + '</div>' : '') +
      '<header class="ops-page-head"><div><h1 class="ops-title page-title">' + esc(title) + '</h1>' +
      (sub ? '<div class="ops-sub">' + esc(sub) + '</div>' : '') + '</div>' +
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
    return '<div class="ops-kpi' + (tone ? ' ' + tone : '') + '"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong><small>' + esc(detail) + '</small></div>';
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
  function listEmpty(message) {
    return '<tr><td colspan="8"><div class="ops-empty"><strong>No matching records</strong><p>' + esc(message) + '</p></div></td></tr>';
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
  function storeRows(list) {
    if (!list.length) return listEmpty('Try a different store name, product or lifecycle filter.');
    return list.map(function (item) {
      var health = item.connection === 'Healthy' && item.domainHealth === 'Healthy' ? 'Healthy' : item.connection === 'Action required' ? 'Action required' : 'Review';
      return '<tr><td style="width:25%">' + linkCell(item.name, item.organization + ' · ' + item.region, '#/stores/' + item.id) + '</td><td class="hide-md">' + esc(item.product) + '</td><td class="hide-sm">' + esc(item.plan) + '</td><td>' + status(item.lifecycle) + '</td><td class="hide-sm">' + status(health) + '</td><td class="hide-xs"><span class="ops-meta">' + esc(item.nextAction) + '</span></td><td><a class="ops-link" href="#/stores/' + esc(item.id) + '">View</a></td></tr>';
    }).join('');
  }
  function createStore(root) {
    modalFields('Create store record', [
      { label: 'Store name', html: '<input class="input" id="newStoreName" placeholder="Enter store name">' },
      { label: 'Merchant organization', html: '<select class="input" id="newStoreOrg">' + (C.organizations || []).map(function (x) { return '<option value="' + esc(x.id) + '">' + esc(x.name) + '</option>'; }).join('') + '</select>' },
      { label: 'Product', html: '<select class="input" id="newStoreProduct"><option value="BestShopio">BestShopio</option><option value="BestCheckout">BestCheckout</option></select>' },
      { label: 'Plan', html: '<select class="input" id="newStorePlan">' + (C.plans || []).map(function (x) { return '<option value="' + esc(x.name) + '">' + esc(x.name) + '</option>'; }).join('') + '</select>' }
    ], 'Create record', function (layer) {
      var name = layer.querySelector('#newStoreName').value.trim();
      if (!name) { toast('Enter a store name.'); return; }
      var org = findOrganization(layer.querySelector('#newStoreOrg').value);
      var product = layer.querySelector('#newStoreProduct').value;
      var record = { id: 'store_' + Date.now(), name: name, organizationId: org.id, organization: org.name, owner: org.primary, type: product === 'BestCheckout' ? 'bestcheckout' : 'bestshopio', lifecycle: 'Provisioning', plan: layer.querySelector('#newStorePlan').value, region: 'US', createdAt: 'Jul 29, 2026', provisioning: 'In progress', connection: 'Not connected', domainHealth: 'Pending', product: product, nextAction: 'Finish provisioning', shopify: '--' };
      C.stores.push(record); org.stores += 1; audit('Created store record', name, 'Provisioning'); layer.remove(); toast('Store record created.'); route('#/stores/' + record.id);
    });
  }
  function editStore(record, root) {
    modalFields('Edit store record', [
      { label: 'Plan', html: '<select class="input" id="storePlan">' + (C.plans || []).map(function (x) { return '<option value="' + esc(x.name) + '"' + (x.name === record.plan ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select>' },
      { label: 'Lifecycle', html: '<select class="input" id="storeLifecycle"><option value="Active"' + (record.lifecycle === 'Active' ? ' selected' : '') + '>Active</option><option value="Provisioning"' + (record.lifecycle === 'Provisioning' ? ' selected' : '') + '>Provisioning</option><option value="Suspended"' + (record.lifecycle === 'Suspended' ? ' selected' : '') + '>Suspended</option></select>' },
      { label: 'Region', html: '<select class="input" id="storeRegion"><option value="US"' + (record.region === 'US' ? ' selected' : '') + '>US</option><option value="DE"' + (record.region === 'DE' ? ' selected' : '') + '>DE</option><option value="UK"' + (record.region === 'UK' ? ' selected' : '') + '>UK</option></select>' }
    ], 'Save changes', function (layer) {
      record.plan = layer.querySelector('#storePlan').value; record.lifecycle = layer.querySelector('#storeLifecycle').value; record.region = layer.querySelector('#storeRegion').value;
      audit('Updated store record', record.name, 'Saved'); layer.remove(); toast('Store record updated.'); stores(root, [record.id]);
    });
  }
  function storeDetail(root, id) {
    var record = findStore(id);
    if (!record) { stores(root, []); return; }
    var hosts = (C.hosts || []).filter(function (x) { return x.storeId === record.id; });
    var services = (C.integrations || []).filter(function (x) { return x.storeId === record.id; });
    var body = '<div class="ops-info-grid">' + fact('Merchant organization', '<a class="ops-link" href="#/organizations/' + esc(record.organizationId) + '">' + esc(record.organization) + '</a>') + fact('Product', esc(record.product)) + fact('Plan', esc(record.plan)) + fact('Lifecycle', status(record.lifecycle)) + fact('Provisioning', status(record.provisioning)) + fact('Service health', status(record.connection === 'Healthy' ? 'Healthy' : record.connection)) + '</div>' +
      '<div class="ops-layout"><div class="ops-stack"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Store lifecycle</div><div class="ops-panel-sub">One store record persists through provisioning, active operation and upgrades.</div></div></div><div class="ops-panel-body"><div class="ops-health-row"><div><strong>Created</strong><span>' + esc(record.createdAt) + ' · ' + esc(record.region) + '</span></div></div><div class="ops-health-row"><div><strong>Next operational action</strong><span>' + esc(record.nextAction) + '</span></div>' + status(record.connection === 'Healthy' ? 'No action required' : record.connection) + '</div><div class="ops-note">BestCheckout keeps its independent merchant experience. This page only coordinates the shared store record, provisioning, hosts and service health.</div></div></section>' +
      '<section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Published hosts</div></div><a class="ops-link" href="#/domains">All domains</a></div><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Host</th><th>Usage</th><th>Status</th></tr></thead><tbody>' + (hosts.length ? hosts.map(function (host) { return '<tr><td>' + linkCell(host.host, host.target, '#/domains/' + host.id) + '</td><td>' + esc(host.usage === 'checkout' ? 'Checkout' : 'Storefront') + '</td><td>' + status(host.status) + '</td></tr>'; }).join('') : '<tr><td colspan="3"><span class="ops-meta">No host is attached to this store yet.</span></td></tr>') + '</tbody></table></div></section></div>' +
      '<aside class="ops-stack"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Service connections</div></div></div><div class="ops-panel-body">' + (services.length ? services.map(function (service) { return '<div class="ops-health-row"><div><strong>' + esc(service.provider) + '</strong><span>' + esc(service.capability) + '</span></div>' + status(service.status) + '</div>'; }).join('') : '<div class="ops-empty"><strong>No connection record</strong><p>Connect services from the operations workspace.</p></div>') + '</div></section><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Store identity</div></div></div><div class="ops-panel-body"><div class="ops-health-row"><div><strong>Primary merchant contact</strong><span>' + esc(record.owner) + '</span></div></div><div class="ops-health-row"><div><strong>Source connection</strong><span>' + esc(record.shopify) + '</span></div></div></div></section></aside></div>';
    render(root, page(record.name, 'Shared store record and platform service status.', '<button class="btn btn-primary" id="editStore">Edit store</button>', body, back('#/stores', 'Stores')),
      function (scope) { scope.querySelector('#editStore').onclick = function () { editStore(record, root); }; });
  }
  function stores(root, parts) {
    var id = cleanPart(parts && parts[0]);
    if (id) { storeDetail(root, id); return; }
    var body = '<div class="ops-toolbar"><span class="ops-search">' + icon('search', 16) + '<input id="storeSearch" placeholder="Search store, merchant or domain"></span><select class="ops-select" id="storeProduct"><option value="">All products</option><option value="BestShopio">BestShopio</option><option value="BestCheckout">BestCheckout</option></select><select class="ops-select" id="storeLifecycle"><option value="">All lifecycle states</option><option value="Active">Active</option><option value="Provisioning">Provisioning</option><option value="Suspended">Suspended</option></select></div><div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th style="width:25%">Store</th><th class="hide-md" style="width:13%">Product</th><th class="hide-sm" style="width:12%">Plan</th><th style="width:14%">Lifecycle</th><th class="hide-sm" style="width:14%">Health</th><th class="hide-xs">Next action</th><th style="width:56px"></th></tr></thead><tbody id="storeRows"></tbody></table></div></div>';
    render(root, page('Stores', 'Manage the shared store record, lifecycle, plan and service health. Merchant-facing configurations remain in their own backends.', '<button class="btn btn-primary" id="createStore">Create store</button>', body), function (scope) {
      function draw() {
        var query = (scope.querySelector('#storeSearch').value || '').toLowerCase();
        var product = scope.querySelector('#storeProduct').value; var lifecycle = scope.querySelector('#storeLifecycle').value;
        var list = (C.stores || []).filter(function (item) { return (!query || (item.name + ' ' + item.organization + ' ' + item.shopify).toLowerCase().indexOf(query) >= 0) && (!product || item.product === product) && (!lifecycle || item.lifecycle === lifecycle); });
        scope.querySelector('#storeRows').innerHTML = storeRows(list);
      }
      bindSearch(scope, '#storeSearch', ['#storeProduct', '#storeLifecycle'], draw); draw();
      scope.querySelector('#createStore').onclick = function () { createStore(root); };
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
      '<div class="ops-layout"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Associated stores</div><div class="ops-panel-sub">A merchant organization can own one or more shared store records.</div></div><a class="ops-link" href="#/stores">All stores</a></div><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Store</th><th>Product</th><th>Lifecycle</th><th></th></tr></thead><tbody>' + storesForOrg.map(function (store) { return '<tr><td>' + linkCell(store.name, store.region, '#/stores/' + store.id) + '</td><td>' + esc(store.product) + '</td><td>' + status(store.lifecycle) + '</td><td><a class="ops-link" href="#/stores/' + store.id + '">Open</a></td></tr>'; }).join('') + '</tbody></table></div></section><aside class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Access boundary</div></div></div><div class="ops-panel-body"><p class="pcx-copy">Merchant members are managed with the organization and its stores. Platform staff accounts are managed separately in Account and never inherit merchant access automatically.</p><a class="btn btn-default" href="#/account">Open Account</a></div></aside></div>';
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
    var items = [['overview', 'Overview'], ['connections', 'Store connections'], ['routing', 'Routing and safety'], ['writebacks', 'Order writeback'], ['events', 'Events'], ['support', 'Merchant support']];
    return '<nav class="ops-tabs">' + items.map(function (item) { return '<a class="ops-tab' + (active === item[0] ? ' active' : '') + '" href="#/bestcheckout' + (item[0] === 'overview' ? '' : '/' + item[0]) + '">' + item[1] + '</a>'; }).join('') + '</nav>';
  }
  function bcAction(root, title, copy, action, scope, section) {
    confirmDialog(title, copy, action, function () { audit(action, scope, 'Queued safely'); toast(action + ' recorded.'); bestcheckout(root, [section]); });
  }
  function bcOverview(root) {
    var connections = B.connections || []; var routes = B.routes || []; var writebacks = B.writebacks || []; var events = B.events || [];
    var attention = [];
    connections.filter(function (x) { return x.sync !== 'Healthy'; }).forEach(function (x) { attention.push({ id: x.id, type: 'connection', title: x.next, store: bcStoreName(x.storeId), detail: x.authorization + ' · ' + x.sync, state: x.sync }); });
    writebacks.filter(function (x) { return x.state !== 'Completed'; }).forEach(function (x) { attention.push({ id: x.id, type: 'writeback', title: 'Order writeback needs review', store: bcStoreName(x.storeId), detail: x.reference + ' · ' + x.detail, state: x.state }); });
    events.filter(function (x) { return x.status !== 'Completed'; }).forEach(function (x) { attention.push({ id: x.id, type: 'event', title: x.subject, store: bcStoreName(x.storeId), detail: x.detail, state: x.status }); });
    var queue = attention.slice(0, 5).map(function (item) { return '<button class="ops-attention-item" data-bc-type="' + esc(item.type) + '" data-bc-id="' + esc(item.id) + '"><i class="ops-severity high"></i><div class="ops-attention-copy"><strong>' + esc(item.title) + '</strong><span>' + esc(item.store) + ' · ' + esc(item.detail) + '</span></div>' + status(item.state) + '</button>'; }).join('');
    var body = bcTabs('overview') + '<div class="ops-note ops-warning"><strong>Platform boundary:</strong> This workspace monitors Shopify connections, deployment safety and order reconciliation. Merchant funnel drafts, page design and payment credentials stay in BestCheckout.</div><div class="ops-kpi-grid">' + kpi('Connected stores', connections.filter(function (x) { return x.authorization === 'Connected'; }).length, 'Shopify authorization is healthy', '') + kpi('Routes needing review', routes.filter(function (x) { return x.gate !== 'Passed'; }).length, 'Safety gate or fallback state', 'warn') + kpi('Retryable writebacks', writebacks.filter(function (x) { return x.state === 'Retryable'; }).length, 'Idempotent replay only', 'warn') + kpi('Open service events', events.filter(function (x) { return x.status !== 'Completed'; }).length, 'No raw payloads exposed', 'warn') + '</div><div class="ops-layout"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Priority operational queue</div><div class="ops-panel-sub">Actions create safe, auditable follow-up work; they do not alter live checkout sessions.</div></div><a class="ops-link" href="#/bestcheckout/events">View events</a></div><div class="ops-attention">' + queue + '</div></section><aside class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Control plane</div></div></div><div class="ops-panel-body"><div class="ops-health-row"><div><strong>Merchant experience</strong><span>Independent BestCheckout backend</span></div>' + status('Protected') + '</div><div class="ops-health-row"><div><strong>Shared platform record</strong><span>Identity, store and operational state</span></div>' + status('Healthy') + '</div><div class="ops-health-row"><div><strong>Safety fallback</strong><span>Shopify native control remains available</span></div>' + status('Ready') + '</div></div></aside></div>';
    render(root, page('BestCheckout operations', 'Platform control plane for BestCheckout service health, routing safety and reconciliation.', '', body), function (scope) {
      scope.querySelectorAll('[data-bc-id]').forEach(function (button) { button.onclick = function () { var type = button.getAttribute('data-bc-type'); var id = button.getAttribute('data-bc-id'); if (type === 'connection') route('#/bestcheckout/connections'); else if (type === 'writeback') route('#/bestcheckout/writebacks'); else route('#/bestcheckout/events'); }; });
    });
  }
  function bcConnections(root) {
    var rows = (B.connections || []).map(function (item) { return '<tr><td>' + linkCell(bcStoreName(item.storeId), item.adapter, '#/stores/' + item.storeId) + '</td><td>' + status(item.authorization) + '</td><td class="hide-md">' + esc(item.scopes) + '</td><td>' + status(item.sync) + '</td><td class="hide-sm"><span class="ops-meta">' + esc(item.webhook) + '<br>' + esc(item.checked) + '</span></td><td><button class="btn btn-default" data-connection="' + esc(item.id) + '">' + esc(item.sync === 'Healthy' ? 'Record review' : 'Create recovery task') + '</button></td></tr>'; }).join('');
    var body = bcTabs('connections') + '<div class="ops-table-card"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Store</th><th>Authorization</th><th class="hide-md">Scopes</th><th>Sync</th><th class="hide-sm">Webhook health</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
    render(root, page('BestCheckout operations', 'Review Shopify integration health and create merchant-safe recovery work.', '', body), function (scope) { scope.querySelectorAll('[data-connection]').forEach(function (button) { button.onclick = function () { var item = (B.connections || []).filter(function (x) { return x.id === button.getAttribute('data-connection'); })[0]; bcAction(root, item.sync === 'Healthy' ? 'Record connection review' : 'Create merchant recovery task', item.sync === 'Healthy' ? 'This records a connection-health review.' : 'This creates a guided merchant reconnection task. It does not show or reset authorization credentials.', item.sync === 'Healthy' ? 'Record review' : 'Create task', bcStoreName(item.storeId), 'connections'); }; }); });
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
    if (section === 'connections') bcConnections(root); else if (section === 'routing') bcRouting(root); else if (section === 'writebacks') bcWritebacks(root); else if (section === 'events') bcEvents(root); else if (section === 'support') bcSupport(root); else bcOverview(root);
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
