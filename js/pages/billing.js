/* BestCheckout platform billing. Price books, store assignment, invoices,
   adjustments, and revenue. Entitlement plans stay on the Plans page. */
(function () {
  'use strict';

  var standard = book('standard', 'Standard', 'Standard', 15000, [
    [100000000, 5000], [300000000, 4000], [500000000, 3250], [null, 2500]
  ], true, 20, 25, false);
  var folastVip = book('folast-vip', 'Folast VIP', 'VIP', 7500, [
    [100000000, 4000], [300000000, 3000], [500000000, 2500], [null, 2000]
  ], true, 25, 20, true);
  var books = [standard, folastVip];
  var accounts = [
    account('shop_lavender', 'Lavender Labs', 'Lavender Labs Inc.', 'avery@lavenderlabs.com', 'Active', 'standard', 'Visa', '4242', 124000000, 4580, 620, 48620000, 2190, 210, [], false),
    account('shop_folast', 'Folast Studio', 'Folast Studio LLC', 'mia@folast-studio.com', 'Active', 'folast-vip', 'Visa', '1881', 90000000, 3100, 410, 240000000, 7000, 1400, [
      { label: 'Launch credit', reason: 'One-time launch credit', amountCents: -50000 }
    ], true),
    account('shop_heyjune', 'Hey June', 'Hey June Co.', 'june@heyjune.co', 'Active', 'standard', 'Mastercard', '5510', 33800000, 2100, 900, 4200000, 180, 22, [], false),
    account('shop_coral', 'Coral Goods', 'Coral Goods Ltd.', 'lena@coral-goods.demo', 'Active', 'standard', 'Visa', '2204', 0, 0, 0, 0, 0, 0, [], false),
    account('shop_river', 'River Remedy', 'River Remedy Ltd.', 'riley@riverremedy.com', 'Suspended', 'standard', 'Visa', '7731', 0, 0, 0, 0, 0, 0, [], false)
  ];
  var hey = findAccount('shop_heyjune');
  hey.invoices[0].status = 'Past due';
  hey.invoices[0].paidAt = '';
  hey.billingStatus = 'Past due';
  hey.failures = ['Oct 3, 2026', 'Oct 6, 2026', 'Oct 9, 2026'];
  var auditLog = [
    { at: 'Oct 1, 2026 · 09:10', actor: 'ops.amy', action: 'Assigned Folast VIP', scope: 'Folast Studio', result: 'Effective October 2026' }
  ];
  var invoiceFilter = 'all';

  function book(id, name, kind, fee, tiers, declineOn, threshold, feeThousandths, pool) {
    return {
      id: id, name: name, kind: kind, status: 'Live', monthlyFeeCents: fee, pool: pool, scheduled: null,
      tiers: tiers.map(function (tier) { return { upToCents: tier[0], ppm: tier[1] }; }),
      decline: { enabled: declineOn, thresholdPercent: threshold, feeThousandths: feeThousandths }
    };
  }
  function account(storeId, store, organization, email, lifecycle, priceBookId, brand, last4, sepVolume, sepApprovals, sepDeclines, octVolume, octApprovals, octDeclines, sepAdjustments, septemberOnStandard) {
    var septemberBook = septemberOnStandard ? standard : bookById(priceBookId);
    return {
      storeId: storeId, store: store, organization: organization, email: email, lifecycle: lifecycle,
      priceBookId: priceBookId, nextBookId: '', brand: brand, last4: last4,
      billingStatus: lifecycle === 'Suspended' ? 'Suspended' : 'Current',
      october: { volumeCents: octVolume, approvals: octApprovals, declines: octDeclines, adjustments: [] },
      failures: [],
      invoices: [makeInvoice(store, '2026-09', 'September 2026', septemberBook, sepVolume, sepApprovals, sepDeclines, sepAdjustments, 'Paid', 'Oct 2, 2026')]
    };
  }
  function bookById(id) { return books.filter(function (item) { return item.id === id; })[0] || standard; }
  function findAccount(storeId) { return accounts.filter(function (item) { return item.storeId === storeId; })[0] || null; }
  function platformStores() { return ((window.DATA && window.DATA.platformCenter) || {}).stores || []; }
  function platformStore(id) { return platformStores().filter(function (item) { return item.id === id; })[0] || null; }

  function money(cents) {
    var sign = cents < 0 ? '-' : '';
    var abs = Math.abs(Number(cents) || 0);
    return sign + '$' + (abs / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function moneyWhole(cents) {
    return '$' + (Math.abs(Number(cents) || 0) / 100).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  function rateLabel(ppm) {
    return (Number(ppm) / 10000).toFixed(4).replace(/0+$/, '').replace(/\.$/, '') + '%';
  }
  function rateInput(ppm) {
    return (Number(ppm) / 10000).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  }
  function feeLabel(thousandths) {
    var text = (Number(thousandths) / 1000).toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
    var bits = text.split('.');
    if (bits.length === 1) text += '.00';
    else if (bits[1].length < 2) text += '0';
    return '$' + text;
  }
  function pct(rate) { return (rate * 100).toFixed(1) + '%'; }
  function sum(lines) { return lines.reduce(function (total, line) { return total + line.amountCents; }, 0); }
  function rateVolume(volumeCents, tiers) {
    var lines = [];
    var cursor = 0;
    var left = Math.max(0, volumeCents || 0);
    (tiers || []).forEach(function (tier) {
      if (left <= 0) return;
      var cap = tier.upToCents == null ? Infinity : tier.upToCents;
      var band = Math.min(left, cap - cursor);
      lines.push({ volumeCents: band, ppm: tier.ppm, feeCents: Math.round(band * tier.ppm / 1000000) });
      left -= band;
      cursor = cap;
    });
    return lines;
  }
  function declineFee(approvals, declines, rule) {
    var attempts = (approvals || 0) + (declines || 0);
    var rate = attempts ? declines / attempts : 0;
    if (!rule || !rule.enabled || !attempts) return { attempts: attempts, rate: rate, excess: 0, feeCents: 0 };
    var allowed = Math.floor(attempts * rule.thresholdPercent / 100);
    var excess = Math.max(0, declines - allowed);
    return { attempts: attempts, rate: rate, excess: excess, feeCents: Math.round(excess * rule.feeThousandths / 10) };
  }
  function chargeLines(priceBook, volumeCents, approvals, declines, adjustments) {
    var lines = [{ kind: 'License', label: 'Monthly license', amountCents: priceBook.monthlyFeeCents }];
    rateVolume(volumeCents, priceBook.tiers).forEach(function (band) {
      if (!band.volumeCents) return;
      lines.push({ kind: 'Commission', label: 'Volume commission', detail: rateLabel(band.ppm) + ' · ' + money(band.volumeCents), amountCents: band.feeCents });
    });
    var decline = declineFee(approvals, declines, priceBook.decline);
    if (decline.feeCents) {
      lines.push({ kind: 'Decline', label: 'Decline fee', excess: decline.excess, threshold: priceBook.decline.thresholdPercent, amountCents: decline.feeCents });
    }
    (adjustments || []).forEach(function (item) {
      lines.push({ kind: 'Adjustment', label: item.label, detail: item.reason, amountCents: item.amountCents });
    });
    return { lines: lines, decline: decline, totalCents: sum(lines) };
  }
  function makeInvoice(store, monthKey, month, priceBook, volumeCents, approvals, declines, adjustments, status, paidAt) {
    var handle = String(store || '').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
    var charge = chargeLines(priceBook, volumeCents, approvals, declines, adjustments);
    return {
      id: 'inv-' + monthKey + '-' + handle,
      number: 'INV-' + monthKey.replace('-', '') + '-' + handle,
      store: store,
      month: month,
      monthKey: monthKey,
      status: status,
      paidAt: paidAt || '',
      volumeCents: volumeCents,
      approvals: approvals,
      declines: declines,
      lines: charge.lines,
      totalCents: charge.totalCents
    };
  }
  function estimate(account) {
    if (!account || account.lifecycle !== 'Active') {
      return { lines: [], decline: { rate: 0, excess: 0, feeCents: 0 }, totalCents: 0, commissionCents: 0, suspended: true };
    }
    var charge = chargeLines(bookById(account.priceBookId), account.october.volumeCents, account.october.approvals, account.october.declines, account.october.adjustments);
    return {
      lines: charge.lines,
      decline: charge.decline,
      totalCents: charge.totalCents,
      commissionCents: charge.lines.filter(function (line) { return line.kind === 'Commission'; }).reduce(function (total, line) { return total + line.amountCents; }, 0),
      suspended: false
    };
  }
  function nextRate(volumeCents, tiers) {
    for (var i = 0; i < tiers.length; i++) {
      if (tiers[i].upToCents != null && volumeCents < tiers[i].upToCents && tiers[i + 1]) {
        return 'The next rate, ' + rateLabel(tiers[i + 1].ppm) + ', starts after ' + moneyWhole(tiers[i].upToCents) + '.';
      }
    }
    return 'This month is in the top rate.';
  }
  function allInvoices() {
    var list = [];
    accounts.forEach(function (account) { account.invoices.forEach(function (invoice) { list.push(invoice); }); });
    return list;
  }
  function findInvoice(id) {
    var found = null;
    accounts.forEach(function (account) {
      account.invoices.forEach(function (invoice) { if (invoice.id === id) found = { account: account, invoice: invoice }; });
    });
    return found;
  }
  function remember(action, scope, result) {
    auditLog.unshift({ at: 'Oct 22, 2026 · 10:40', actor: 'ops.amy', action: action, scope: scope, result: result });
  }
  function refreshStatus(account) {
    if (account.lifecycle === 'Suspended') { account.billingStatus = 'Suspended'; return; }
    account.billingStatus = account.invoices.some(function (invoice) { return invoice.status === 'Past due'; }) ? 'Past due' : 'Current';
  }

  function ui() { return (window.SAAS_OPS && window.SAAS_OPS.contentApi) || null; }
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function billStatus(value) {
    var tone = { Paid: 'ok', Current: 'ok', Live: 'ok', 'Past due': 'danger', Suspended: 'danger', Void: 'muted', 'Not started': 'muted', Draft: 'warn', Custom: 'warn' }[value] || 'ok';
    return '<span class="ops-status ' + tone + '"><i></i>' + esc(value) + '</span>';
  }
  function listCard(filters, table) {
    return '<div class="ops-table-card"><div class="ops-filter-bar">' + filters + '</div><div class="ops-table-wrap">' + table + '</div><div class="ops-table-foot"><span class="ops-table-total">Total 0 records</span></div></div>';
  }
  function searchBox(fieldId, fields, inputId) {
    var face = ui();
    return '<div class="ops-kw"><select class="filter-select" data-ui-fit data-ui-match-width id="' + fieldId + '">' + fields + '</select><span class="ops-search"><input id="' + inputId + '" placeholder="Search">' + face.icon('search', 16) + '</span></div>';
  }
  function viewAct(href) {
    return '<a class="ops-act" href="' + esc(href) + '" title="View" aria-label="View">' + ui().icon('eye', 16) + '</a>';
  }
  function storeDomain(store) {
    var host = store && store.shopify;
    if (!host || host === '--' || host === 'Shopify') return '';
    return host;
  }
  function nameCell(href, title, meta) {
    return '<div class="ops-store-cell"><a class="ops-row-link" href="' + esc(href) + '"><strong>' + esc(title) + '</strong></a>' + (meta ? '<span class="ops-meta">' + esc(meta) + '</span>' : '') + '</div>';
  }
  function paintList(scope, rowsHtml, count, colspan) {
    var body = scope.querySelector('tbody');
    body.innerHTML = rowsHtml || '<tr class="ops-empty-row"><td class="ops-table-empty" colspan="' + colspan + '">No records in this view.</td></tr>';
    scope.querySelector('.ops-table-total').textContent = 'Total ' + count + ' records';
    if (window.I18N && window.I18N.apply) {
      window.I18N.apply(body);
      window.I18N.apply(scope.querySelector('.ops-table-foot'));
    }
  }
  function kpi(label, value, detail) {
    return '<div class="ops-kpi"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong>' + (detail ? '<small>' + esc(detail) + '</small>' : '') + '</div>';
  }
  function lineRows(lines) {
    return lines.map(function (line) {
      var detail = '';
      if (line.kind === 'Decline') {
        detail = '<div class="ops-meta"><span class="i18n-skip">' + esc(String(line.excess)) + '</span> <span>declined payments above</span> <span class="i18n-skip">' + esc(String(line.threshold)) + '%</span></div>';
      } else if (line.detail && line.kind === 'Adjustment') {
        detail = '<div class="ops-meta">' + esc(line.detail) + '</div>';
      } else if (line.detail) {
        detail = '<div class="ops-meta i18n-skip">' + esc(line.detail) + '</div>';
      }
      return '<tr><td><div>' + esc(line.label) + '</div>' + detail + '</td><td>' + esc(line.kind) + '</td><td class="i18n-skip">' + esc(money(line.amountCents)) + '</td></tr>';
    }).join('');
  }
  function tierTable(priceBook) {
    var previous = 0;
    var rows = priceBook.tiers.map(function (tier, index) {
      var label = index === 0
        ? '<span>Monthly volume up to</span> <span class="i18n-skip">' + esc(moneyWhole(tier.upToCents)) + '</span>'
        : (tier.upToCents == null
          ? '<span>Volume above</span> <span class="i18n-skip">' + esc(moneyWhole(previous)) + '</span>'
          : '<span>Then up to</span> <span class="i18n-skip">' + esc(moneyWhole(tier.upToCents)) + '</span>');
      if (tier.upToCents != null) previous = tier.upToCents;
      return '<tr><td>' + label + '</td><td class="i18n-skip">' + esc(rateLabel(tier.ppm)) + '</td></tr>';
    }).join('');
    return '<table class="ops-table"><thead><tr><th>Volume</th><th>Rate</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function render(root, parts) {
    var face = ui();
    if (!face) { root.innerHTML = '<div class="ops-page"><h1 class="ops-title">Billing</h1></div>'; return; }
    parts = parts || [];
    if (parts[0] === 'prices' && parts[1] === 'new') editBook(root, null);
    else if (parts[0] === 'prices' && parts[2] === 'edit') editBook(root, parts[1]);
    else if (parts[0] === 'prices' && parts[1]) bookDetail(root, parts[1]);
    else if (parts[0] === 'prices') bookList(root);
    else if (parts[0] === 'invoices' && parts[1]) invoiceDetail(root, parts[1]);
    else if (parts[0] === 'invoices') invoiceList(root);
    else if (parts[0] === 'revenue') revenue(root);
    else if (parts[0] === 'stores' && parts[1]) storeBilling(root, parts[1]);
    else storeList(root);
  }

  function storeList(root) {
    var face = ui();
    var stores = platformStores().filter(function (store) { return store.type === 'bestcheckout'; });
    var bookOptions = books.map(function (item) { return '<option value="' + esc(item.id) + '">' + esc(item.name) + '</option>'; }).join('');
    var filters = searchBox('billStoreField', '<option value="name">Store name</option>', 'billStoreSearch') +
      '<select class="filter-select" data-ui-fit data-ui-match-width id="billStoreBook"><option value="all">All price books</option>' + bookOptions + '</select>' +
      '<select class="filter-select" data-ui-fit data-ui-match-width id="billStoreStatus"><option value="all">All billing statuses</option><option value="Current">Current</option><option value="Past due">Past due</option><option value="Suspended">Suspended</option><option value="Not started">Not started</option></select>';
    var table = '<table class="ops-table"><thead><tr><th>Store</th><th>Price book</th><th>October volume</th><th>Estimated October</th><th>September invoice</th><th>Billing status</th><th class="ops-col-act">Action</th></tr></thead><tbody></tbody></table>';
    face.render(root, face.page('Store billing', '', '', listCard(filters, table)), function (scope) {
      function billingState(store) {
        var account = findAccount(store.id);
        return account ? account.billingStatus : 'Not started';
      }
      function draw() {
        var query = (scope.querySelector('#billStoreSearch').value || '').trim().toLowerCase();
        var bookId = scope.querySelector('#billStoreBook').value;
        var status = scope.querySelector('#billStoreStatus').value;
        var list = stores.filter(function (store) {
          var account = findAccount(store.id);
          var book = account ? bookById(account.priceBookId) : null;
          if (bookId !== 'all' && (!book || book.id !== bookId)) return false;
          if (status !== 'all' && billingState(store) !== status) return false;
          if (!query) return true;
          return String(store.name || '').toLowerCase().indexOf(query) >= 0;
        });
        var rows = list.map(function (store) {
          var account = findAccount(store.id);
          var est = estimate(account);
          var latest = account && account.invoices[0];
          var book = account ? bookById(account.priceBookId) : null;
          var active = account && account.lifecycle === 'Active';
          return '<tr><td>' + nameCell('#/billing/stores/' + store.id, store.name, storeDomain(store)) + '</td>' +
            '<td>' + (book ? esc(book.name) : '—') + '</td>' +
            '<td class="i18n-skip">' + (active ? esc(money(account.october.volumeCents)) : '—') + '</td>' +
            '<td class="i18n-skip">' + (active ? esc(money(est.totalCents)) : '—') + '</td>' +
            '<td>' + (latest ? billStatus(latest.status) : billStatus('Not started')) + '</td>' +
            '<td>' + billStatus(billingState(store)) + '</td>' +
            '<td class="ops-col-act">' + viewAct('#/billing/stores/' + store.id) + '</td></tr>';
        }).join('');
        paintList(scope, rows, list.length, 7);
      }
      scope.querySelector('#billStoreSearch').oninput = draw;
      scope.querySelector('#billStoreBook').onchange = draw;
      scope.querySelector('#billStoreStatus').onchange = draw;
      draw();
    });
  }

  function rateSummary(item) {
    return (item.tiers || []).map(function (tier) { return rateLabel(tier.ppm); }).join(' / ');
  }
  function bookList(root) {
    var face = ui();
    var filters = searchBox('billBookField', '<option value="name">Price book</option>', 'billBookSearch') +
      '<select class="filter-select" data-ui-fit data-ui-match-width id="billBookKind"><option value="all">All kinds</option><option value="Standard">Standard</option><option value="VIP">VIP</option></select>';
    var table = '<table class="ops-table"><thead><tr><th>Price book</th><th>Kind</th><th>Monthly license</th><th>Decline fee</th><th>Rates</th><th>Assigned stores</th><th>State</th><th class="ops-col-act">Action</th></tr></thead><tbody></tbody></table>';
    face.render(root, face.page('Price books', '', '<a class="btn btn-primary" href="#/billing/prices/new">New VIP price book</a>', listCard(filters, table)), function (scope) {
      function draw() {
        var query = (scope.querySelector('#billBookSearch').value || '').trim().toLowerCase();
        var kind = scope.querySelector('#billBookKind').value;
        var list = books.filter(function (item) {
          if (kind !== 'all' && item.kind !== kind) return false;
          if (!query) return true;
          return item.name.toLowerCase().indexOf(query) >= 0;
        });
        var rows = list.map(function (item) {
          var count = accounts.filter(function (account) { return account.priceBookId === item.id; }).length;
          return '<tr><td>' + nameCell('#/billing/prices/' + item.id, item.name, '') + '</td><td>' + esc(item.kind) + '</td><td class="i18n-skip">' + esc(money(item.monthlyFeeCents)) + '</td><td class="i18n-skip">' + (item.decline.enabled ? esc(feeLabel(item.decline.feeThousandths)) : '—') + '</td><td class="i18n-skip">' + esc(rateSummary(item)) + '</td><td>' + count + '</td><td>' + billStatus(item.status) + '</td><td class="ops-col-act">' + viewAct('#/billing/prices/' + item.id) + '</td></tr>';
        }).join('');
        paintList(scope, rows, list.length, 8);
      }
      scope.querySelector('#billBookSearch').oninput = draw;
      scope.querySelector('#billBookKind').onchange = draw;
      draw();
    });
  }

  function bookDetail(root, id) {
    var face = ui();
    var item = bookById(id);
    if (!books.some(function (entry) { return entry.id === id; })) {
      face.render(root, face.page('Price book', '', '', '<div class="ops-empty"><strong>Price book not found</strong></div>', '', '#/billing/prices'));
      return;
    }
    var assigned = accounts.filter(function (account) { return account.priceBookId === item.id; });
    var storeRows = assigned.length ? assigned.map(function (account) {
      return '<tr><td><a class="ops-link" href="#/billing/stores/' + esc(account.storeId) + '">' + esc(account.store) + '</a></td><td>' + billStatus(account.billingStatus) + '</td></tr>';
    }).join('') : '<tr><td colspan="2" class="muted">No store is using this price book.</td></tr>';
    var scheduled = item.scheduled ? '<div class="ops-note ops-warning">A new version is scheduled for November 2026. October estimates still use the rates below. <a class="ops-link" href="#/billing/prices/' + esc(item.id) + '/edit">Review the scheduled version</a></div>' : '';
    var decline = item.decline.enabled
      ? feeLabel(item.decline.feeThousandths) + ' per declined payment above ' + item.decline.thresholdPercent + '%'
      : 'Off';
    var body = scheduled +
      '<div class="ops-kpi-grid ops-kpi-grid-3">' + kpi('Monthly license', money(item.monthlyFeeCents), 'Charged for an active store') + kpi('Decline fee', item.decline.enabled ? feeLabel(item.decline.feeThousandths) : 'Not charged', item.decline.enabled ? ('Above ' + item.decline.thresholdPercent + '%') : 'Not charged') + kpi('Assigned stores', String(assigned.length), '') + '</div>' +
      (item.id === 'standard' ? '<div class="ops-note">Standard pricing is half of CheckoutChamp: a $150 monthly license, marginal rates of 0.5%, 0.4%, 0.325%, and 0.25%, and $0.025 per declined payment above a 20% decline rate.</div>' : '') +
      '<div class="ops-layout" style="margin-top:16px"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Rates</div><div class="ops-panel-sub">Each rate applies only to the volume inside that band. Issued invoices keep the rates they were issued with.</div></div></div><div class="ops-panel-body">' + tierTable(item) + '<div class="ops-meta" style="margin-top:10px">' + esc(decline) + '</div></div></section>' +
      '<aside class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Stores</div></div></div><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Store</th><th>Billing status</th></tr></thead><tbody>' + storeRows + '</tbody></table></div></aside></div>';
    face.render(root, face.page(item.name, item.kind === 'Standard' ? 'Default price book for BestCheckout stores.' : 'VIP price book. Only assigned stores use these rates.', '<a class="btn btn-primary" href="#/billing/prices/' + esc(item.id) + '/edit">Edit rates</a>', body, '', '#/billing/prices'));
  }

  function editBook(root, id) {
    var face = ui();
    var creating = !id;
    var item = creating ? null : bookById(id);
    if (!creating && !books.some(function (entry) { return entry.id === id; })) { bookList(root); return; }
    var source = item || standard;
    var rates = item && item.scheduled ? item.scheduled : source;
    function tier(index, key) { return rates.tiers[index] ? rates.tiers[index][key] : ''; }
    var body = '<style>.bill-error{color:#b13b29;font-size:12.5px;margin-top:4px}.bill-error:empty{display:none}.bill-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}</style>' +
      '<form class="ops-panel" id="billBookForm"><div class="ops-panel-body bill-form">' +
      '<p class="ops-panel-sub">Issued invoices stay unchanged. Choose whether open October estimates use these rates now or from November.</p>' +
      labeled('Price book name', '<input class="input" id="billName" value="' + esc(creating ? '' : source.name) + '">', 'billName') +
      '<div class="bill-two">' + labeled('Monthly license (USD)', '<input class="input" id="billFee" value="' + esc((rates.monthlyFeeCents / 100).toFixed(2)) + '">', 'billFee') +
      labeled('Applies', '<select class="input" id="billWhen"><option value="next">November 2026</option><option value="current">October 2026</option></select>', 'billWhen') + '</div>' +
      '<div class="blk-title" style="margin-top:8px">Volume bands</div>' +
      bandRow(1, 'Up to (USD)', tier(0, 'upToCents'), tier(0, 'ppm')) +
      bandRow(2, 'Up to (USD)', tier(1, 'upToCents'), tier(1, 'ppm')) +
      bandRow(3, 'Up to (USD)', tier(2, 'upToCents'), tier(2, 'ppm')) +
      labeled('Rate above the last band (%)', '<input class="input" id="billRate4" value="' + esc(rateInput(tier(3, 'ppm'))) + '">', 'billRate4') +
      '<div class="bill-error" id="billBandErr"></div>' +
      '<label class="fld-label"><input type="checkbox" id="billDeclineOn"' + (rates.decline.enabled ? ' checked' : '') + '> Decline fee</label>' +
      '<div class="bill-two">' + labeled('Decline threshold (%)', '<input class="input" id="billThreshold" value="' + esc(String(rates.decline.thresholdPercent)) + '">', 'billThreshold') +
      labeled('Fee per declined payment (USD)', '<input class="input" id="billDeclineFee" value="' + esc((rates.decline.feeThousandths / 1000).toFixed(3)) + '">', 'billDeclineFee') + '</div>' +
      labeled('Reason', '<input class="input" id="billReason" placeholder="Why this price is changing">', 'billReason') +
      '<div class="ops-inline-actions" style="margin-top:16px"><button type="submit" class="btn btn-primary">Save price book</button><a class="btn btn-default" href="' + (creating ? '#/billing/prices' : '#/billing/prices/' + esc(source.id)) + '">Cancel</a></div>' +
      '</div></form>';
    face.render(root, face.page(creating ? 'New VIP price book' : 'Edit rates', creating ? 'VIP pricing uses the same fields as the standard price book.' : source.name, '', body, '', creating ? '#/billing/prices' : '#/billing/prices/' + source.id), function (scope) {
      var page = scope.querySelector('.ops-page');
      if (page) page.classList.add('ops-page-narrow');
      var form = scope.querySelector('#billBookForm');
      form.onsubmit = function (event) {
        event.preventDefault();
        var draft = readBook(scope, creating ? '' : source.name);
        if (!draft) return;
        var when = scope.querySelector('#billWhen').value;
        if (creating) {
          var created = book('vip-' + Date.now(), draft.name, 'VIP', draft.monthlyFeeCents, [], draft.decline.enabled, draft.decline.thresholdPercent, draft.decline.feeThousandths, draft.pool);
          created.tiers = draft.tiers;
          if (when === 'next') {
            created.monthlyFeeCents = standard.monthlyFeeCents;
            created.tiers = standard.tiers.map(function (tier) { return { upToCents: tier.upToCents, ppm: tier.ppm }; });
            created.decline = { enabled: standard.decline.enabled, thresholdPercent: standard.decline.thresholdPercent, feeThousandths: standard.decline.feeThousandths };
            created.scheduled = draft;
          }
          books.push(created);
          remember('Created VIP price book', draft.name, when === 'next' ? 'Effective November 2026' : 'Effective October 2026');
          face.toast('Price book saved.');
          location.hash = '#/billing/prices/' + created.id;
          return;
        }
        source.name = draft.name;
        source.pool = draft.pool;
        if (when === 'next') source.scheduled = draft;
        else {
          source.monthlyFeeCents = draft.monthlyFeeCents;
          source.tiers = draft.tiers;
          source.decline = draft.decline;
          source.scheduled = null;
        }
        remember('Updated price book', source.name, when === 'next' ? 'Effective November 2026' : 'Effective October 2026');
        face.toast(when === 'next' ? 'Scheduled for November. Issued invoices stay unchanged.' : 'October estimates use the new rates. Issued invoices stay unchanged.');
        location.hash = '#/billing/prices/' + source.id;
      };
    });
  }
  function bandRow(index, label, upToCents, ppm) {
    var dollars = upToCents ? String(upToCents / 100) : '';
    return '<div class="bill-two">' + labeled(label, '<input class="input" id="billCap' + index + '" value="' + esc(dollars) + '">', 'billCap' + index) +
      labeled('Rate (%)', '<input class="input" id="billRate' + index + '" value="' + esc(ppm === '' ? '' : rateInput(ppm)) + '">', 'billRate' + index) + '</div>';
  }
  function labeled(label, control, id) {
    return '<div><label class="fld-label" for="' + id + '">' + label + '</label>' + control + '<div class="bill-error" id="' + id + 'Err"></div></div>';
  }
  function readBook(scope, fallbackName) {
    scope.querySelectorAll('.bill-error').forEach(function (node) { node.textContent = ''; });
    var name = input(scope, '#billName') || fallbackName;
    var fee = centsOf(input(scope, '#billFee'));
    var caps = [1, 2, 3].map(function (index) { return centsOf(input(scope, '#billCap' + index)); });
    var rates = [1, 2, 3, 4].map(function (index) { return ppmOf(input(scope, '#billRate' + index)); });
    var threshold = Number(input(scope, '#billThreshold'));
    var declineFeeCents = thousandthsOf(input(scope, '#billDeclineFee'));
    var reason = input(scope, '#billReason');
    var ok = true;
    if (!input(scope, '#billName')) { err(scope, 'billName', 'Enter a price book name.'); ok = false; }
    if (fee == null) { err(scope, 'billFee', 'Enter a monthly license of 0 or more.'); ok = false; }
    caps.forEach(function (cap, index) { if (cap == null || cap <= 0) { err(scope, 'billCap' + (index + 1), 'Enter a volume threshold.'); ok = false; } });
    rates.forEach(function (rate, index) { if (rate == null) { err(scope, 'billRate' + (index + 1), 'Enter a rate of 0 or more.'); ok = false; } });
    if (!(caps[0] < caps[1] && caps[1] < caps[2])) { err(scope, 'billBand', 'Each volume threshold must be higher than the one before it.'); ok = false; }
    if (!isFinite(threshold) || threshold < 0 || threshold > 100) { err(scope, 'billThreshold', 'Enter a decline threshold from 0 to 100.'); ok = false; }
    if (declineFeeCents == null) { err(scope, 'billDeclineFee', 'Enter a decline fee of 0 or more.'); ok = false; }
    if (!reason) { err(scope, 'billReason', 'Enter a reason.'); ok = false; }
    if (!ok) return null;
    return {
      name: name,
      monthlyFeeCents: fee,
      tiers: [
        { upToCents: caps[0], ppm: rates[0] },
        { upToCents: caps[1], ppm: rates[1] },
        { upToCents: caps[2], ppm: rates[2] },
        { upToCents: null, ppm: rates[3] }
      ],
      decline: { enabled: scope.querySelector('#billDeclineOn').checked, thresholdPercent: threshold, feeThousandths: declineFeeCents },
      pool: false,
      reason: reason
    };
  }
  function input(scope, sel) { return String((scope.querySelector(sel) || {}).value || '').trim(); }
  function err(scope, id, message) { var node = scope.querySelector('#' + id + 'Err'); if (node) node.textContent = message; }
  function centsOf(text) { var n = Number(String(text).replace(/[$,\s]/g, '')); return isFinite(n) && n >= 0 ? Math.round(n * 100) : null; }
  function ppmOf(text) { var n = Number(String(text).replace(/[%\s,]/g, '')); return isFinite(n) && n >= 0 ? Math.round(n * 10000) : null; }
  function thousandthsOf(text) { var n = Number(String(text).replace(/[$,\s]/g, '')); return isFinite(n) && n >= 0 ? Math.round(n * 1000) : null; }

  function storeBilling(root, storeId) {
    var face = ui();
    var store = platformStore(storeId);
    var account = findAccount(storeId);
    if (!store || store.type !== 'bestcheckout') {
      face.render(root, face.page('Billing', '', '', '<div class="ops-empty"><strong>This store is not on BestCheckout billing.</strong></div>', '', '#/billing'));
      return;
    }
    if (!account) {
      var empty = '<div class="ops-empty"><strong>Billing has not started</strong><p>The monthly license starts when the store is Active. This store is still ' + esc(store.lifecycle) + '.</p></div>';
      face.render(root, face.page(store.name, 'No invoice is issued before the store is Active.', '', empty, '', '#/billing'));
      return;
    }
    var priceBook = bookById(account.priceBookId);
    var est = estimate(account);
    var warning = account.billingStatus === 'Past due' ? '<div class="ops-note ops-warning">The September invoice is past due. Checkout stays available until someone suspends the store.</div>' : '';
    var suspended = account.lifecycle !== 'Active' ? '<div class="ops-note">No October charge. The store is suspended.</div>' : '';
    var next = account.nextBookId ? '<div class="ops-note">November 2026 will use ' + esc(bookById(account.nextBookId).name) + '. October stays on ' + esc(priceBook.name) + '.</div>' : '';
    var kpis = account.lifecycle === 'Active'
      ? '<div class="ops-kpi-grid ops-kpi-grid-4">' + kpi('October volume', money(account.october.volumeCents), nextRate(account.october.volumeCents, priceBook.tiers)) + kpi('Estimated commission', money(est.commissionCents), '') + kpi('Decline rate', pct(est.decline.rate), est.decline.feeCents ? ('Decline fee ' + money(est.decline.feeCents)) : 'Under the threshold') + kpi('Estimated October', money(est.totalCents), 'Issued on November 1') + '</div>'
      : '';
    var invoiceRows = account.invoices.map(function (invoice) {
      return '<tr><td><a class="ops-link" href="#/billing/invoices/' + esc(invoice.id) + '">' + esc(invoice.number) + '</a></td><td>' + esc(invoice.month) + '</td><td class="i18n-skip">' + esc(money(invoice.totalCents)) + '</td><td>' + billStatus(invoice.status) + '</td></tr>';
    }).join('');
    var usage = sampleRows(account.store);
    var body = warning + suspended + next + kpis +
      '<div class="ops-layout"><section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">' + esc(priceBook.name) + '</div><div class="ops-panel-sub">This store is rated on its own volume.</div></div></div><div class="ops-panel-body">' + tierTable(priceBook) + '</div></section>' +
      '<aside class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Payment method</div></div></div><div class="ops-panel-body"><div class="ops-health-row"><div><strong class="i18n-skip">' + esc(account.brand + ' ···· ' + account.last4) + '</strong><span class="i18n-skip">' + esc(account.email) + '</span></div>' + billStatus(account.billingStatus) + '</div>' +
      (account.failures.length ? '<div class="ops-meta"><span>Card charges failed on</span> <span class="i18n-skip">' + esc(account.failures.join(', ')) + '</span>.</div>' : '') +
      '</div></aside></div>' +
      '<section class="ops-panel" style="margin-top:16px"><div class="ops-panel-head"><div><div class="ops-panel-title">October estimate</div></div></div><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Description</th><th>Kind</th><th>Amount</th></tr></thead><tbody>' + (est.lines.length ? lineRows(est.lines) : '<tr><td colspan="3" class="muted">No October charge.</td></tr>') + '</tbody></table></div></section>' +
      '<section class="ops-panel" style="margin-top:16px"><div class="ops-panel-head"><div><div class="ops-panel-title">Invoices</div></div></div><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Invoice</th><th>Month</th><th>Total</th><th>Status</th></tr></thead><tbody>' + invoiceRows + '</tbody></table></div></section>' +
      '<section class="ops-panel" style="margin-top:16px"><div class="ops-panel-head"><div><div class="ops-panel-title">Counted and excluded payments</div><div class="ops-panel-sub">Sample for this store. Captured payments count. Refunds stay in the volume. Abandoned checkouts do not.</div></div></div><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Checkout order</th><th>Result</th><th>Amount</th><th>In volume</th><th>Rule</th></tr></thead><tbody>' + usage + '</tbody></table></div></section>';
    face.render(root, face.page(account.store, storeDomain(store), '<button class="btn btn-default" id="billAssign">Change price book</button><button class="btn btn-primary" id="billAdjust">Add October adjustment</button>', body, '', '#/billing'), function (scope) {
      scope.querySelector('#billAssign').onclick = function () { openAssign(account); };
      scope.querySelector('#billAdjust').onclick = function () { openAdjustment(account); };
    });
  }
  function sampleRows(store) {
    if (store === 'Coral Goods' || store === 'River Remedy') return '<tr><td colspan="5" class="muted">No captured payments in October.</td></tr>';
    var rows = [
      ['#18420', 'Captured', '$128.00', 'Yes', 'Upsell included'],
      ['#18421', 'Captured', store === 'Folast Studio' ? '€96.00 → $104.16' : '£40.00 → $52.40', 'Yes', 'Exchange rate locked on the capture day'],
      ['#18422', 'Refunded', '$40.00', 'Yes', 'Refunds stay in the volume'],
      ['#18423', 'Declined', '—', 'No', 'Gateway decline'],
      ['#18424', 'Test', '$19.00', 'No', 'Test orders are excluded']
    ];
    return rows.map(function (row) {
      return '<tr><td class="i18n-skip">' + esc(row[0]) + '</td><td>' + esc(row[1]) + '</td><td class="i18n-skip">' + esc(row[2]) + '</td><td>' + esc(row[3]) + '</td><td>' + esc(row[4]) + '</td></tr>';
    }).join('');
  }
  function openAssign(account) {
    var face = ui();
    var options = books.map(function (item) {
      return '<option value="' + esc(item.id) + '"' + (item.id === account.priceBookId ? ' selected' : '') + '>' + esc(item.name) + '</option>';
    }).join('');
    face.modalFields('Change price book', [
      { label: 'Price book', html: '<select class="input" id="billAssignBook">' + options + '</select>' },
      { label: 'Applies', html: '<select class="input" id="billAssignWhen"><option value="next">November 2026</option><option value="current">October 2026</option></select>' },
      { label: 'Reason', html: '<input class="input" id="billAssignReason" placeholder="Why this store gets this price">' }
    ], 'Save assignment', function (layer) {
      var reason = String((layer.querySelector('#billAssignReason') || {}).value || '').trim();
      if (!reason) { face.toast('Enter a reason.'); return; }
      var bookId = layer.querySelector('#billAssignBook').value;
      var when = layer.querySelector('#billAssignWhen').value;
      if (when === 'current') { account.priceBookId = bookId; account.nextBookId = ''; }
      else account.nextBookId = bookId;
      remember('Assigned price book', account.store, bookById(bookId).name + (when === 'current' ? ' from October 2026' : ' from November 2026'));
      layer.remove();
      face.toast('Price book assigned. Issued invoices stay unchanged.');
      location.hash = '#/billing/stores/' + account.storeId;
      render(document.getElementById('root'), ['stores', account.storeId]);
    });
  }
  function openAdjustment(account) {
    var face = ui();
    face.modalFields('Add October adjustment', [
      { label: 'Amount (USD)', html: '<input class="input" id="billAdjAmount" placeholder="-500">' },
      { label: 'Reason', html: '<input class="input" id="billAdjReason" placeholder="Why this amount is credited or charged">' }
    ], 'Add adjustment', function (layer) {
      var amount = Number(String((layer.querySelector('#billAdjAmount') || {}).value || '').replace(/[$,\s]/g, ''));
      var reason = String((layer.querySelector('#billAdjReason') || {}).value || '').trim();
      if (!isFinite(amount) || amount === 0) { face.toast('Enter an amount other than 0.'); return; }
      if (!reason) { face.toast('Enter a reason.'); return; }
      account.october.adjustments.push({ label: amount < 0 ? 'Credit' : 'Added charge', reason: reason, amountCents: Math.round(amount * 100) });
      remember(amount < 0 ? 'Added credit' : 'Added charge', account.store, money(Math.round(amount * 100)));
      layer.remove();
      face.toast('Adjustment added to the October estimate.');
      render(document.getElementById('root'), ['stores', account.storeId]);
    });
  }

  function invoiceList(root) {
    var face = ui();
    var filters = searchBox('billInvoiceField', '<option value="number">Invoice</option><option value="store">Store</option>', 'billInvoiceSearch') +
      '<select class="filter-select" data-ui-fit data-ui-match-width id="billInvoiceFilter"><option value="all">All statuses</option><option value="Past due">Past due</option><option value="Paid">Paid</option><option value="Void">Void</option></select>';
    var table = '<table class="ops-table"><thead><tr><th>Invoice</th><th>Store</th><th>Month</th><th>Total</th><th>Status</th><th class="ops-col-act">Action</th></tr></thead><tbody></tbody></table>';
    face.render(root, face.page('Invoices', '', '', listCard(filters, table)), function (scope) {
      scope.querySelector('#billInvoiceFilter').value = invoiceFilter;
      function draw() {
        invoiceFilter = scope.querySelector('#billInvoiceFilter').value;
        var query = (scope.querySelector('#billInvoiceSearch').value || '').trim().toLowerCase();
        var field = scope.querySelector('#billInvoiceField').value;
        var list = allInvoices().filter(function (invoice) {
          if (invoiceFilter !== 'all' && invoice.status !== invoiceFilter) return false;
          if (!query) return true;
          var hay = field === 'store' ? invoice.store : invoice.number;
          return String(hay || '').toLowerCase().indexOf(query) >= 0;
        });
        var rows = list.map(function (invoice) {
          var owner = accounts.filter(function (account) { return account.store === invoice.store; })[0];
          var storeHref = owner ? '#/billing/stores/' + owner.storeId : '#/billing';
          return '<tr><td>' + nameCell('#/billing/invoices/' + invoice.id, invoice.number, '') + '</td><td>' + nameCell(storeHref, invoice.store, '') + '</td><td>' + esc(invoice.month) + '</td><td class="i18n-skip">' + esc(money(invoice.totalCents)) + '</td><td>' + billStatus(invoice.status) + '</td><td class="ops-col-act">' + viewAct('#/billing/invoices/' + invoice.id) + '</td></tr>';
        }).join('');
        paintList(scope, rows, list.length, 6);
      }
      scope.querySelector('#billInvoiceSearch').oninput = draw;
      scope.querySelector('#billInvoiceField').onchange = draw;
      scope.querySelector('#billInvoiceFilter').onchange = draw;
      draw();
    });
  }
  function invoiceDetail(root, id) {
    var face = ui();
    var found = findInvoice(id);
    if (!found) {
      face.render(root, face.page('Invoice', '', '', '<div class="ops-empty"><strong>Invoice not found</strong></div>', '', '#/billing/invoices'));
      return;
    }
    var invoice = found.invoice;
    var account = found.account;
    var actions = '';
    if (invoice.status === 'Past due') actions += '<button class="btn btn-primary" id="billRecordPay">Record payment</button>';
    if (invoice.status !== 'Paid' && invoice.status !== 'Void') actions += '<button class="btn btn-default" id="billVoid">Void invoice</button>';
    var body = '<div class="ops-kpi-grid ops-kpi-grid-3">' + kpi('Total', money(invoice.totalCents), invoice.month) + kpi('Volume', money(invoice.volumeCents), '') + '<div class="ops-kpi"><span>Status</span><strong>' + billStatus(invoice.status) + '</strong>' + (invoice.paidAt ? '<small class="i18n-skip">' + esc(invoice.paidAt) + '</small>' : '') + '</div>' + '</div>' +
      (account.failures.length && invoice.status === 'Past due' ? '<div class="ops-note ops-warning"><span>Card charges failed on</span> <span class="i18n-skip">' + esc(account.failures.join(', ')) + '</span>.</div>' : '') +
      '<section class="ops-panel"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Description</th><th>Kind</th><th>Amount</th></tr></thead><tbody>' + lineRows(invoice.lines) + '</tbody></table></div></section>' +
      '<div class="ops-note">Paid and voided invoices keep these lines. A later credit is added to the open month instead of rewriting this invoice.</div>';
    face.render(root, face.page(invoice.number, invoice.store + ' · ' + invoice.month, actions, body, '', '#/billing/invoices'), function (scope) {
      var pay = scope.querySelector('#billRecordPay');
      var voidBtn = scope.querySelector('#billVoid');
      if (pay) pay.onclick = function () {
        face.confirmDialog('Record payment', 'Record a payment for this invoice? The account returns to current. Checkout was not turned off.', 'Record payment', function () {
          invoice.status = 'Paid';
          invoice.paidAt = 'Oct 22, 2026';
          account.failures = [];
          refreshStatus(account);
          remember('Recorded payment', invoice.number, money(invoice.totalCents));
          face.toast('Payment recorded.');
          invoiceDetail(root, id);
        });
      };
      if (voidBtn) voidBtn.onclick = function () {
        face.confirmDialog('Void invoice', 'Void this invoice? The store will not be charged for it. The lines stay on the voided invoice.', 'Void invoice', function () {
          invoice.status = 'Void';
          refreshStatus(account);
          remember('Voided invoice', invoice.number, 'Not charged');
          face.toast('Invoice voided.');
          invoiceDetail(root, id);
        }, 'danger');
      };
    });
  }

  function revenue(root) {
    var face = ui();
    var month = revenue.month || '2026-09';
    var rows = '';
    var license = 0, commission = 0, decline = 0, adjustment = 0, outstanding = 0;
    accounts.forEach(function (account) {
      var lines, total, status;
      if (month === '2026-09') {
        var invoice = account.invoices.filter(function (item) { return item.monthKey === '2026-09'; })[0];
        if (!invoice) return;
        lines = invoice.lines;
        total = invoice.totalCents;
        status = invoice.status;
        if (status === 'Past due') outstanding += total;
      } else if (account.lifecycle !== 'Active') {
        return;
      } else {
        var est = estimate(account);
        lines = est.lines;
        total = est.totalCents;
        status = 'Estimate';
      }
      lines.forEach(function (line) {
        if (month === '2026-09' && status === 'Void') return;
        if (line.kind === 'License') license += line.amountCents;
        if (line.kind === 'Commission') commission += line.amountCents;
        if (line.kind === 'Decline') decline += line.amountCents;
        if (line.kind === 'Adjustment') adjustment += line.amountCents;
      });
      rows += '<tr><td>' + nameCell('#/billing/stores/' + account.storeId, account.store, storeDomain(platformStore(account.storeId))) + '</td><td class="i18n-skip">' + esc(money(total)) + '</td><td>' + (status === 'Estimate' ? 'Estimate' : billStatus(status)) + '</td><td class="ops-col-act">' + viewAct('#/billing/stores/' + account.storeId) + '</td></tr>';
    });
    var total = license + commission + decline + adjustment;
    var filters = '<select class="filter-select" data-ui-fit data-ui-match-width id="billRevenueMonth"><option value="2026-09">September 2026</option><option value="2026-10">October 2026 estimate</option></select>';
    var summary = '<div class="ops-kpi-grid ops-kpi-grid-5" style="padding:16px 16px 0">' + kpi('License', money(license), '') + kpi('Commission', money(commission), '') + kpi('Decline fees', money(decline), '') + kpi('Adjustments', money(adjustment), '') + kpi('Total', money(total), month === '2026-09' ? '' : 'Not invoiced yet') + '</div>' +
      (month === '2026-09' ? '<div class="ops-note" style="margin:12px 16px 0"><span>Outstanding</span> <span class="i18n-skip">' + esc(money(outstanding)) + '</span></div>' : '');
    var table = '<table class="ops-table"><thead><tr><th>Store</th><th>Amount</th><th>Status</th><th class="ops-col-act">Action</th></tr></thead><tbody>' + rows + '</tbody></table>';
    var body = '<div class="ops-table-card"><div class="ops-filter-bar">' + filters + '</div>' + summary + '<div class="ops-table-wrap">' + table + '</div><div class="ops-table-foot"><span class="ops-table-total">Total ' + (rows ? rows.split('<tr>').length - 1 : 0) + ' records</span></div></div>';
    face.render(root, face.page('Revenue', '', '', body), function (scope) {
      var select = scope.querySelector('#billRevenueMonth');
      select.value = month;
      select.onchange = function () { revenue.month = select.value; revenue(root); };
    });
  }

  window.SAAS_BILLING = { render: render };

  if (window.I18N && window.I18N.extend) window.I18N.extend({
    'Billing': '收费',
    'Monthly license, volume commission, and decline fees for BestCheckout stores.': 'BestCheckout 店铺的月费、成交佣金和拒付费。',
    'Starter, Growth, and Commerce Pro still control seats, flows, and domains. They do not set these fees.': '入门版、成长版和企业版仍然只管席位、购买流程和域名，不决定这些费用。',
    'Price book': '价目表',
    'October volume': '10 月成交额',
    'Estimated October': '10 月预计',
    'September invoice': '9 月账单',
    'Billing status': '收费状态',
    'Price books': '价目表',
    'Standard pricing and VIP pricing use the same fields.': '标准价和 VIP 价使用同一套字段。',
    'New VIP price book': '新建 VIP 价目表',
    'Kind': '类型',
    'Monthly license': '月费',
    'Decline fee': '拒付费',
    'declined payments above': '笔拒付，超过',
    'Assigned stores': '使用店铺',
    'State': '状态',
    'Standard': '标准价',
    'VIP': '单独定价',
    'Past due': '逾期',
    'Void': '已作废',
    'Current': '正常',
    'Suspended': '已停用',
    'Not started': '未开始',
    'Store billing': '店铺收费',
    'Invoices': '账单',
    'Revenue': '收入',
    'Price book not found': '没有找到价目表',
    'No store is using this price book.': '没有店铺在用这张价目表。',
    'A new version is scheduled for November 2026. October estimates still use the rates below.': '新版本计划于 2026 年 11 月生效。10 月预估仍使用下面的费率。',
    'Review the scheduled version': '查看已排期的版本',
    'Charged for an active store': '店铺在该月为启用状态即收取',
    'Not charged': '不收取',
    'Pooling on': '已开启',
    'Pooling off': '未开启',
    'Active stores in the organization are added together': '组织内启用中的店铺合并计算',
    'Each store is rated alone': '每家店单独计算',
    'Volume pooling': '用量合并',
    'Standard pricing is half of CheckoutChamp: a $150 monthly license, marginal rates of 0.5%, 0.4%, 0.325%, and 0.25%, and $0.025 per declined payment above a 20% decline rate.': '标准价是 CheckoutChamp 的一半：月费 $150，超额累进费率 0.5%、0.4%、0.325%、0.25%，拒付率超过 20% 后每笔拒付 $0.025。',
    'Rates': '费率',
    'Each rate applies only to the volume inside that band. Issued invoices keep the rates they were issued with.': '每一档费率只用于该档内的成交额。已开出的账单保持开出时的费率。',
    'Volume': '成交额',
    'Rate': '费率',
    'Monthly volume up to': '月成交额不超过',
    'Then up to': '然后不超过',
    'Volume above': '超过',
    'Default price book for BestCheckout stores.': 'BestCheckout 店铺的默认价目表。',
    'VIP price book. Only assigned stores use these rates.': 'VIP 价目表。只有绑定的店铺使用这些费率。',
    'Edit rates': '编辑费率',
    'Issued invoices stay unchanged. Choose whether open October estimates use these rates now or from November.': '已开出的账单不变。选择 10 月预估现在就用新费率，还是从 11 月开始。',
    'Price book name': '价目表名称',
    'Monthly license (USD)': '月费（美元）',
    'Applies': '生效时间',
    'November 2026': '2026 年 11 月',
    'October 2026': '2026 年 10 月',
    'Volume bands': '成交额分档',
    'Up to (USD)': '不超过（美元）',
    'Rate (%)': '费率（%）',
    'Rate above the last band (%)': '最后一档以上的费率（%）',
    'Decline threshold (%)': '拒付率门槛（%）',
    'Fee per declined payment (USD)': '每笔拒付费用（美元）',
    'Pool volume across Active stores in the organization': '把同一组织里启用中的店铺成交额加总后再分档',
    'Reason': '原因',
    'Why this price is changing': '为什么改这个价格',
    'Save price book': '保存价目表',
    'Cancel': '取消',
    'Enter a price book name.': '请输入价目表名称。',
    'Enter a monthly license of 0 or more.': '请输入大于或等于 0 的月费。',
    'Enter a volume threshold.': '请输入成交额门槛。',
    'Enter a rate of 0 or more.': '请输入大于或等于 0 的费率。',
    'Each volume threshold must be higher than the one before it.': '每一档门槛必须高于上一档。',
    'Enter a decline threshold from 0 to 100.': '请输入 0 到 100 之间的拒付率门槛。',
    'Enter a decline fee of 0 or more.': '请输入大于或等于 0 的拒付费。',
    'Enter a reason.': '请输入原因。',
    'Price book saved.': '价目表已保存。',
    'Scheduled for November. Issued invoices stay unchanged.': '已排到 11 月。已开出的账单不变。',
    'October estimates use the new rates. Issued invoices stay unchanged.': '10 月预估改用新费率。已开出的账单不变。',
    'This store is not on BestCheckout billing.': '这家店不走 BestCheckout 收费。',
    'Billing has not started': '尚未开始收费',
    'No invoice is issued before the store is Active.': '店铺变为启用前不出账单。',
    'The September invoice is past due. Checkout stays available until someone suspends the store.': '9 月账单已逾期。在有人停用店铺之前，结账保持可用。',
    'No October charge. The store is suspended.': '10 月不收费。店铺已停用。',
    'Estimated commission': '预计佣金',
    'Decline rate': '拒付率',
    'Under the threshold': '未超过门槛',
    'Issued on November 1': '11 月 1 日开账单',
    'This store is rated on its own volume.': '这家店按自己的成交额计费。',
    'Volume from Active stores in this organization is added together.': '这个组织里启用中的店铺成交额会加总。',
    'Payment method': '付款方式',
    'Card charges failed on': '扣款失败日期',
    'October estimate': '10 月预估',
    'Description': '项目',
    'Amount': '金额',
    'No October charge.': '10 月没有费用。',
    'Invoice': '账单',
    'Month': '月份',
    'Total': '合计',
    'Status': '状态',
    'September 2026': '2026 年 9 月',
    'Counted and excluded payments': '计入和排除的付款',
    'Sample for this store. Captured payments count. Refunds stay in the volume. Abandoned checkouts do not.': '这家店的样例。扣款成功会计入。退款仍留在成交额里。弃单不计入。',
    'Checkout order': '结账订单',
    'Result': '结果',
    'In volume': '计入成交额',
    'Rule': '规则',
    'Captured': '扣款成功',
    'Refunded': '已退款',
    'Declined': '拒付',
    'Test': '测试',
    'Yes': '是',
    'No': '否',
    'Upsell included': '含加购',
    'Exchange rate locked on the capture day': '汇率按扣款当日锁定',
    'Refunds stay in the volume': '退款不从成交额中扣除',
    'Gateway decline': '支付网关拒付',
    'Test orders are excluded': '测试订单排除',
    'No captured payments in October.': '10 月没有扣款成功的付款。',
    'Change price book': '更换价目表',
    'Add October adjustment': '添加 10 月调账',
    'Save assignment': '保存绑定',
    'Why this store gets this price': '为什么这家店用这个价格',
    'Price book assigned. Issued invoices stay unchanged.': '价目表已绑定。已开出的账单不变。',
    'Add adjustment': '添加调账',
    'Amount (USD)': '金额（美元）',
    'Why this amount is credited or charged': '为什么抵扣或补收这笔金额',
    'Enter an amount other than 0.': '请输入不是 0 的金额。',
    'Adjustment added to the October estimate.': '调账已加到 10 月预估。',
    'Credit': '抵扣',
    'Added charge': '补收',
    'Volume commission': '成交佣金',
    'Launch credit': '开通抵扣',
    'One-time launch credit': '一次性开通抵扣',
    'All statuses': '全部状态',
    'All price books': '全部价目表',
    'All billing statuses': '全部收费状态',
    'All kinds': '全部类型',
    'No records in this view.': '这个视图里没有记录。',
    'No invoices in this view.': '这个视图里没有账单。',
    'One invoice covers one store and one calendar month.': '一张账单对应一家店的一个自然月。',
    'Invoice not found': '没有找到账单',
    'Record payment': '登记收款',
    'Void invoice': '作废账单',
    'Record a payment for this invoice? The account returns to current. Checkout was not turned off.': '登记这张账单已收款？账户会恢复正常。结账没有被关掉。',
    'Void this invoice? The store will not be charged for it. The lines stay on the voided invoice.': '作废这张账单？不会向这家店收取。明细仍留在已作废的账单上。',
    'Payment recorded.': '已登记收款。',
    'Invoice voided.': '账单已作废。',
    'Paid and voided invoices keep these lines. A later credit is added to the open month instead of rewriting this invoice.': '已支付和已作废的账单保持这些明细。之后的抵扣加到未出账的月份，不改这张账单。',
    'License': '月费',
    'Commission': '佣金',
    'Decline': '拒付费',
    'Decline fees': '拒付费',
    'Adjustments': '调账',
    'Estimate': '预估',
    'Not invoiced yet': '尚未出账',
    'Outstanding': '未收',
    'Issued September invoices.': '已开出的 9 月账单。',
    'October is still open. These amounts change if a VIP rate or an adjustment changes.': '10 月尚未结束。VIP 费率或调账变化后，这些金额会跟着变。',
    'October 2026 estimate': '2026 年 10 月预估',
    'The next rate, 0.4%, starts after $1,000,000.': '下一档 0.4% 从 $1,000,000 之后开始。',
    'The next rate, 0.25%, starts after $3,000,000.': '下一档 0.25% 从 $3,000,000 之后开始。',
    'This month is in the top rate.': '本月已经用到最高档费率。'
  });
})();
