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
  standard.allowanceCents = 2500000;
  folastVip.allowanceCents = null;
  var defaultBookId = 'standard';
  var accounts = [
    account('shop_lavender', 'Lavender Labs', 'Lavender Labs Inc.', 'avery@lavenderlabs.com', 'Active', 'standard', 'Visa', '4242', 124000000, 4580, 620, 48620000, 2190, 210, [], false),
    account('shop_folast', 'Folast Studio', 'Folast Studio LLC', 'mia@folast-studio.com', 'Active', 'folast-vip', 'Visa', '1881', 90000000, 3100, 410, 240000000, 7000, 1400, [
      { label: 'Launch credit', reason: 'One-time launch credit', amountCents: -50000 }
    ], true),
    account('shop_heyjune', 'Hey June', 'Hey June Co.', 'june@heyjune.co', 'Active', 'standard', 'Mastercard', '5510', 33800000, 2100, 900, 4200000, 180, 22, [], false),
    account('shop_coral', 'Coral Goods', 'Coral Goods Ltd.', 'lena@coral-goods.demo', 'Active', 'standard', 'Visa', '2204', 0, 0, 0, 0, 0, 0, [], false),
    account('shop_river', 'River Remedy', 'River Remedy Ltd.', 'riley@riverremedy.com', 'Suspended', 'standard', 'Visa', '7731', 0, 0, 0, 0, 0, 0, [], false),
    account('shop_pine', 'Pine & Wick', 'Pine & Wick LLC', 'billing@pine-wick.demo', 'Suspended', 'standard', 'Visa', '6620', 8600000, 380, 20, 0, 0, 0, [], false),
    account('shop_quill', 'Quill Press', 'Quill Press Co.', 'ops@quill-press.demo', 'Suspended', 'standard', 'Visa', '8891', 12400000, 560, 40, 6200000, 210, 18, [], false),
    account('shop_moss', 'Moss Lane', 'Moss Lane Ltd.', 'hello@moss-lane.demo', 'Suspended', 'standard', '', '', 5400000, 240, 30, 0, 0, 0, [], false),
    account('shop_marlow', 'Marlow Supply', 'Marlow Supply LLC', 'owen@marlowsupply.com', 'Active', 'standard', 'Visa', '4412', 8600000, 410, 18, 0, 0, 0, [], false),
    account('shop_sable', 'Sable Home', 'Sable Home LLC', 'billing@sable-home.demo', 'Active', 'standard', 'Visa', '9031', 0, 0, 0, 4000000, 120, 0, [], false),
    account('shop_northline', 'Northline Goods', 'Northline Goods LLC', 'ops@northlinegoods.co', 'Active', 'standard', 'Visa', '5454', 18000000, 920, 70, 9200000, 410, 28, [], false),
    account('shop_linden', 'Linden Goods', 'Linden Goods LLC', 'billing@lindengoods.co', 'Active', 'standard', 'Visa', '4141', 9600000, 480, 30, 5400000, 240, 16, [], false)
  ];
  settle(findAccount('shop_lavender'), { allowance: 2500000, used: true, card: true, sepDays: 30, octDays: 31, sepStatus: 'Paid', sepPaid: 'Oct 2, 2026' });
  settle(findAccount('shop_folast'), { allowance: null, used: false, card: true, sepDays: 0, octDays: 0 });
  settle(findAccount('shop_heyjune'), { allowance: 2500000, used: true, card: false, sepDays: 30, octDays: 7, sepStatus: 'Past due', sepPaid: '', fallback: true, fallbackOn: 'Oct 8, 2026' });
  settle(findAccount('shop_coral'), { allowance: 1000000, used: false, card: false, sepDays: 0, octDays: 0, custom: true });
  settle(findAccount('shop_river'), { allowance: 2500000, used: false, card: true, sepDays: 0, octDays: 0 });
  settle(findAccount('shop_pine'), { allowance: 2500000, used: true, card: true, sepDays: 30, octDays: 0, sepStatus: 'Paid', sepPaid: 'Oct 2, 2026' });
  settle(findAccount('shop_quill'), { allowance: 2500000, used: true, card: true, sepDays: 30, octDays: 0, sepStatus: 'Paid', sepPaid: 'Oct 2, 2026' });
  settle(findAccount('shop_moss'), { allowance: 2500000, used: true, card: false, sepDays: 30, octDays: 0, sepStatus: 'Past due', sepPaid: '', fallback: true, fallbackOn: 'Oct 8, 2026' });
  settle(findAccount('shop_marlow'), { allowance: 2500000, used: true, card: false, sepDays: 30, octDays: 0, sepStatus: 'Past due', sepPaid: '' });
  settle(findAccount('shop_sable'), { allowance: 2500000, used: true, card: true, sepDays: 0, octDays: 21 });
  settle(findAccount('shop_northline'), { allowance: 2500000, used: true, card: true, sepDays: 30, octDays: 31, sepStatus: 'Paid', sepPaid: 'Oct 2, 2026' });
  settle(findAccount('shop_linden'), { allowance: 2500000, used: true, card: true, sepDays: 30, octDays: 31, sepStatus: 'Paid', sepPaid: 'Oct 2, 2026' });
  var sable = findAccount('shop_sable');
  sable.october.overflowCents = 1500000;
  var sableInvoice = makeInvoice(sable.store, storeShopId(sable.storeId), '2026-10', '2026.10', bookById('standard'), 1500000, sable.october.approvals, 0, [], 'Past due', '', 21, 31);
  sableInvoice.allowanceCents = 2500000;
  sableInvoice.coveredCents = 2500000;
  sable.invoices.push(sableInvoice);
  sable.billingStatus = 'Past due';
  var folastInvoice = issuedInvoice(findAccount('shop_folast'), '2026-10', '2026.10', 'Paid', 2000000, 0, null, [
    { kind: 'License', label: 'Monthly license', detail: '31 of 31 days', amountCents: 7500 },
    { kind: 'Commission', label: 'Volume commission', detail: '0.4% · $20,000.00', amountCents: 8000 },
    { kind: 'Adjustment', label: 'Credit', detail: 'VIP partner credit', amountCents: -15500 }
  ]);
  folastInvoice.paidAt = 'Oct 27, 2026';
  var lavenderOctober = issuedInvoice(findAccount('shop_lavender'), '2026-10', '2026.10', 'Charge failed', 1000000, 0, 2500000, [
    { kind: 'License', label: 'Monthly license', detail: '31 of 31 days', amountCents: 15000 },
    { kind: 'Commission', label: 'Volume commission', detail: '0.5% · $10,000.00', amountCents: 5000 },
    { kind: 'Adjustment', label: 'Added charge', detail: 'Manual surcharge', amountCents: 3000 },
    { kind: 'Adjustment', label: 'Credit', detail: 'Courtesy credit', amountCents: -5000 }
  ]);
  var northline = findAccount('shop_northline');
  northline.failures = ['Oct 27, 2026'];
  var northlineOctober = issuedInvoice(northline, '2026-10', '2026.10', 'Charge failed', 4000000, 2500000, 2500000, [
    { kind: 'License', label: 'Monthly license', detail: '31 of 31 days', amountCents: 15000 },
    { kind: 'Commission', label: 'Volume commission', detail: '0.5% · $40,000.00', amountCents: 20000 }
  ]);
  refreshStatus(northline);
  var quill = findAccount('shop_quill');
  quill.failures = ['Oct 27, 2026'];
  var quillOctober = issuedInvoice(quill, '2026-10', '2026.10', 'Charge failed', 6200000, 0, 2500000, [
    { kind: 'License', label: 'Monthly license', detail: '27 of 31 days', amountCents: 13065 },
    { kind: 'Commission', label: 'Volume commission', detail: '0.5% · $62,000.00', amountCents: 31000 }
  ]);
  refreshStatus(quill);
  var hey = findAccount('shop_heyjune');
  var auditLog = [
    { at: '2026-10-12 15:40', actor: 'ops.amy', action: 'Updated price book', storeId: '', bookId: 'standard', detail: '' },
    { at: '2026-10-01 09:10', actor: 'ops.amy', action: 'Assigned price book', storeId: 'shop_folast', detail: 'Folast VIP <span>from October 2026</span>' },
    { at: '2026-09-20 14:22', actor: 'ops.amy', action: 'Updated price book', storeId: '', bookId: 'folast-vip', detail: '' },
    { at: '2026-09-03 10:05', actor: 'ops.amy', action: 'Created price book', storeId: '', bookId: 'folast-vip', detail: '' },
    { at: '2026-09-02 11:06', actor: 'ops.amy', action: 'Updated price book', storeId: '', bookId: 'standard', detail: '' },
    { at: '2026-08-04 09:18', actor: 'ops.amy', action: 'Created price book', storeId: '', bookId: 'standard', detail: '' }
  ];
  function logLine(at, actor, action, storeId, invoiceId, detail) {
    auditLog.push({ at: at, actor: actor, action: action, storeId: storeId || '', bookId: '', invoiceId: invoiceId || '', detail: detail || '' });
  }
  function moneyLog(cents) {
    return '<span class="i18n-skip">' + esc(money(cents)) + '</span>';
  }
  var lavenderSeptember = findAccount('shop_lavender').invoices.filter(function (item) { return item.monthKey === '2026-09'; })[0];
  var heyInvoice = hey.invoices[0];
  var marlowInvoice = findAccount('shop_marlow').invoices[0];
  var pineInvoice = findAccount('shop_pine').invoices[0];
  var quillSeptember = findAccount('shop_quill').invoices.filter(function (item) { return item.monthKey === '2026-09'; })[0];
  var mossInvoice = findAccount('shop_moss').invoices[0];
  var lindenInvoice = findAccount('shop_linden').invoices[0];
  function invoiceMoneyLog(invoice, cents) {
    return '<span class="i18n-skip">' + esc(invoice.number + ' · ' + money(cents)) + '</span>';
  }
  var lavender = findAccount('shop_lavender');
  lavender.failures = ['Oct 27, 2026'];
  refreshStatus(lavender);
  lavenderSeptember.lines.push(
    { kind: 'Adjustment', label: 'Added charge', detail: 'Manual surcharge', amountCents: 3000 },
    { kind: 'Adjustment', label: 'Credit', detail: 'Courtesy credit', amountCents: -3000 }
  );
  lavenderSeptember.totalCents = sum(lavenderSeptember.lines);
  logLine('2026-10-28 16:05', 'ops.amy', 'Added credit', 'shop_lavender', lavenderOctober.id, invoiceMoneyLog(lavenderOctober, -5000) + ' <span>Courtesy credit</span>');
  logLine('2026-10-28 14:10', 'ops.amy', 'Added charge', 'shop_lavender', lavenderOctober.id, invoiceMoneyLog(lavenderOctober, 3000) + ' <span>Manual surcharge</span>');
  logLine('2026-10-27 09:06', 'BestCheckout', 'Emailed the owner', 'shop_lavender', lavenderOctober.id, 'Card declined');
  logLine('2026-10-27 09:04', 'BestCheckout', 'Issued invoice', 'shop_lavender', lavenderOctober.id, invoiceMoneyLog(lavenderOctober, 20000));
  logLine('2026-10-08 10:20', 'ops.amy', 'Assigned price book', 'shop_lavender', '', 'Standard <span>from October 2026</span>');
  logLine('2026-10-02 08:14', 'BestCheckout', 'Recorded payment', 'shop_lavender', lavenderSeptember.id, invoiceMoneyLog(lavenderSeptember, lavenderSeptember.totalCents));
  logLine('2026-10-01 16:20', 'ops.amy', 'Added credit', 'shop_lavender', lavenderSeptember.id, invoiceMoneyLog(lavenderSeptember, -3000) + ' <span>Courtesy credit</span>');
  logLine('2026-10-01 16:05', 'ops.amy', 'Added charge', 'shop_lavender', lavenderSeptember.id, invoiceMoneyLog(lavenderSeptember, 3000) + ' <span>Manual surcharge</span>');
  logLine('2026-10-01 11:20', 'BestCheckout', 'Emailed the owner', 'shop_lavender', lavenderSeptember.id, 'Card declined');
  logLine('2026-10-01 10:40', 'Avery Wells', 'Bound card', 'shop_lavender', '', '<span class="i18n-skip">Visa ···· 4242</span>');
  logLine('2026-10-01 00:12', 'BestCheckout', 'Emailed the owner', 'shop_lavender', lavenderSeptember.id, 'No card on file');
  logLine('2026-10-01 00:05', 'BestCheckout', 'Issued invoice', 'shop_lavender', lavenderSeptember.id, invoiceMoneyLog(lavenderSeptember, 511000));
  logLine('2026-09-18 15:00', 'ops.amy', 'Set free allowance', 'shop_lavender', '', '<span class="i18n-skip">$25,000</span>');
  logLine('2026-08-04 09:30', 'ops.amy', 'Associated price book', 'shop_lavender', '', 'Standard');
  logLine('2026-10-01 00:12', 'BestCheckout', 'Emailed the owner', 'shop_heyjune', heyInvoice.id, 'No card on file');
  logLine('2026-10-01 00:05', 'BestCheckout', 'Issued invoice', 'shop_heyjune', heyInvoice.id, moneyLog(heyInvoice.totalCents));
  logLine('2026-10-01 00:05', 'BestCheckout', 'Issued invoice', 'shop_marlow', marlowInvoice.id, moneyLog(marlowInvoice.totalCents));
  logLine('2026-10-11 09:00', 'BestCheckout', 'Issued invoice', 'shop_sable', sableInvoice.id, moneyLog(sableInvoice.totalCents));
  logLine('2026-10-27 11:21', 'BestCheckout', 'Marked as paid', 'shop_folast', folastInvoice.id, invoiceMoneyLog(folastInvoice, 0));
  logLine('2026-10-27 11:20', 'ops.amy', 'Added credit', 'shop_folast', folastInvoice.id, moneyLog(-15500) + ' <span>VIP partner credit</span>');
  logLine('2026-10-27 09:02', 'BestCheckout', 'Issued invoice', 'shop_folast', folastInvoice.id, moneyLog(15500));
  logLine('2026-10-27 09:10', 'BestCheckout', 'Emailed the owner', 'shop_northline', northlineOctober.id, 'Card declined');
  logLine('2026-10-27 09:08', 'BestCheckout', 'Issued invoice', 'shop_northline', northlineOctober.id, invoiceMoneyLog(northlineOctober, 35000));
  logLine('2026-10-02 08:22', 'BestCheckout', 'Recorded payment', 'shop_linden', lindenInvoice.id, invoiceMoneyLog(lindenInvoice, lindenInvoice.totalCents));
  logLine('2026-10-01 00:05', 'BestCheckout', 'Issued invoice', 'shop_linden', lindenInvoice.id, moneyLog(lindenInvoice.totalCents));
  logLine('2026-10-02 08:20', 'BestCheckout', 'Recorded payment', 'shop_pine', pineInvoice.id, invoiceMoneyLog(pineInvoice, pineInvoice.totalCents));
  logLine('2026-10-01 00:05', 'BestCheckout', 'Issued invoice', 'shop_pine', pineInvoice.id, moneyLog(pineInvoice.totalCents));
  logLine('2026-10-27 09:16', 'BestCheckout', 'Emailed the owner', 'shop_quill', quillOctober.id, 'Card declined');
  logLine('2026-10-27 09:14', 'BestCheckout', 'Issued invoice', 'shop_quill', quillOctober.id, invoiceMoneyLog(quillOctober, 44065));
  logLine('2026-10-02 08:18', 'BestCheckout', 'Recorded payment', 'shop_quill', quillSeptember.id, invoiceMoneyLog(quillSeptember, quillSeptember.totalCents));
  logLine('2026-10-01 00:05', 'BestCheckout', 'Issued invoice', 'shop_quill', quillSeptember.id, moneyLog(quillSeptember.totalCents));
  logLine('2026-10-01 00:12', 'BestCheckout', 'Emailed the owner', 'shop_moss', mossInvoice.id, 'No card on file');
  logLine('2026-10-01 00:05', 'BestCheckout', 'Issued invoice', 'shop_moss', mossInvoice.id, moneyLog(mossInvoice.totalCents));
  var billPage = { no: 1, size: 20, filter: '' };
  var invoicePage = { storeId: '', no: 1, size: 20 };
  var activityPage = { key: '', no: 1, size: 20 };
  var invoiceBackTo = '#/billing/invoices';
  function rememberInvoiceBack(href) { invoiceBackTo = href || '#/billing/invoices'; }

  function book(id, name, kind, fee, tiers, declineOn, threshold, feeThousandths, pool) {
    return {
      id: id, name: name, kind: kind, status: 'Live', monthlyFeeCents: fee, pool: pool, scheduled: null,
      tiers: tiers.map(function (tier) { return { upToCents: tier[0], ppm: tier[1] }; }),
      decline: { enabled: declineOn, thresholdPercent: threshold, feeThousandths: feeThousandths },
      allowanceCents: 2500000
    };
  }
  function account(storeId, store, organization, email, lifecycle, priceBookId, brand, last4, sepVolume, sepApprovals, sepDeclines, octVolume, octApprovals, octDeclines, sepAdjustments, septemberOnStandard) {
    var septemberBook = septemberOnStandard ? standard : bookById(priceBookId);
    return {
      storeId: storeId, store: store, organization: organization, email: email, lifecycle: lifecycle,
      priceBookId: priceBookId, nextBookId: '', brand: brand, last4: last4,
      billingStatus: 'Current',
      allowanceCents: 2500000,
      allowanceUsed: true,
      cardOnFile: true,
      checkoutFallback: false,
      fallbackOn: '',
      septemberBookId: septemberBook.id,
      september: { volumeCents: sepVolume, approvals: sepApprovals, declines: sepDeclines, adjustments: sepAdjustments || [], billableDays: sepVolume ? 30 : 0, daysInMonth: 30 },
      october: { volumeCents: octVolume, approvals: octApprovals, declines: octDeclines, adjustments: [], billableDays: lifecycle === 'Active' ? 31 : 0, daysInMonth: 31, overflowCents: octVolume },
      failures: [],
      invoices: []
    };
  }
  function settle(account, spec) {
    account.allowanceCents = spec.allowance;
    account.allowanceUsed = !!spec.used;
    account.allowanceCustom = !!spec.custom;
    account.cardOnFile = spec.card !== false;
    if (!account.cardOnFile) { account.brand = ''; account.last4 = ''; }
    account.checkoutFallback = !!spec.fallback;
    account.fallbackOn = spec.fallbackOn || '';
    account.october.billableDays = spec.octDays || 0;
    account.october.overflowCents = account.allowanceCents == null || !account.allowanceUsed ? 0 : account.october.volumeCents;
    account.september.billableDays = spec.sepDays || 0;
    account.invoices = [];
    if (spec.sepDays) {
      var book = bookById(account.septemberBookId);
      var overflow = account.allowanceCents == null ? 0 : account.september.volumeCents;
      var invoice = makeInvoice(account.store, storeShopId(account.storeId), '2026-09', '2026.09', book, overflow, account.september.approvals, account.september.declines, account.september.adjustments, spec.sepStatus || 'Paid', spec.sepPaid || 'Oct 2, 2026', spec.sepDays, 30);
      invoice.allowanceCents = account.allowanceCents;
      invoice.coveredCents = 0;
      account.invoices.push(invoice);
    }
    refreshStatus(account);
  }
  function bookById(id) { return books.filter(function (item) { return item.id === id; })[0] || standard; }
  function defaultBook() { return books.filter(function (item) { return item.id === defaultBookId; })[0] || standard; }
  function bookForStore(store) {
    var account = findAccount(store.id);
    return account ? bookById(account.priceBookId) : defaultBook();
  }
  function findAccount(storeId) { return accounts.filter(function (item) { return item.storeId === storeId; })[0] || null; }
  function platformStores() { return ((window.DATA && window.DATA.platformCenter) || {}).stores || []; }
  function platformStore(id) { return platformStores().filter(function (item) { return item.id === id; })[0] || null; }
  function storeShopId(storeId) {
    var store = platformStore(storeId);
    return store && store.shopId ? store.shopId : '';
  }

  function money(cents) {
    var sign = cents < 0 ? '-' : '';
    var abs = Math.abs(Number(cents) || 0);
    return sign + '$' + (abs / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function allowanceCell(cents) {
    if (cents == null) return 'Unlimited';
    return '<span class="i18n-skip">' + esc(allowanceLabel(cents)) + '</span>';
  }
  function allowanceLabel(cents) {
    if (cents == null) return 'Unlimited';
    return moneyWhole(cents);
  }
  function effectiveAllowance(account) {
    if (!account) return null;
    if (account.allowanceCustom) return account.allowanceCents;
    return bookById(account.priceBookId).allowanceCents;
  }
  function allowanceText(account) {
    return allowanceLabel(effectiveAllowance(account));
  }
  function remainingAllowanceCents(account) {
    var allowance = effectiveAllowance(account);
    if (allowance == null) return null;
    var captured = (account.september.volumeCents || 0) + (account.october.volumeCents || 0);
    return Math.max(0, allowance - captured);
  }
  function applyAllowance(account, cents, custom) {
    account.allowanceCents = cents;
    if (custom != null) account.allowanceCustom = custom;
    var captured = (account.september.volumeCents || 0) + (account.october.volumeCents || 0);
    account.allowanceUsed = cents != null && captured > cents;
    account.october.overflowCents = !account.allowanceUsed || cents == null ? 0 : account.october.volumeCents;
    if (account.lifecycle === 'Active' && !account.checkoutFallback) {
      account.october.billableDays = account.allowanceUsed ? 31 : 0;
    }
    refreshStatus(account);
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
  function rateForVolume(volumeCents, tiers) {
    var list = tiers || [];
    var matched = null;
    for (var i = 0; i < list.length; i++) {
      matched = list[i];
      if (list[i].upToCents == null || volumeCents <= list[i].upToCents) break;
    }
    return matched;
  }
  function rateVolume(volumeCents, tiers) {
    var volume = Math.max(0, volumeCents || 0);
    if (!volume) return [];
    var tier = rateForVolume(volume, tiers);
    if (!tier) return [];
    return [{ volumeCents: volume, ppm: tier.ppm, feeCents: Math.round(volume * tier.ppm / 1000000) }];
  }
  function declineFee(approvals, declines, rule) {
    var attempts = (approvals || 0) + (declines || 0);
    var rate = attempts ? declines / attempts : 0;
    if (!rule || !rule.enabled || !attempts) return { attempts: attempts, rate: rate, excess: 0, feeCents: 0 };
    var allowed = Math.floor(attempts * rule.thresholdPercent / 100);
    var excess = Math.max(0, declines - allowed);
    return { attempts: attempts, rate: rate, excess: excess, feeCents: Math.round(excess * rule.feeThousandths / 10) };
  }
  function licenseCents(monthlyFeeCents, billableDays, daysInMonth) {
    if (!billableDays || !daysInMonth) return 0;
    return Math.round(monthlyFeeCents * billableDays / daysInMonth);
  }
  function chargeLines(priceBook, volumeCents, approvals, declines, adjustments, billableDays, daysInMonth) {
    var lines = [];
    var license = licenseCents(priceBook.monthlyFeeCents, billableDays, daysInMonth);
    if (license) lines.push({ kind: 'License', label: 'Monthly license', detail: billableDays + ' of ' + daysInMonth + ' days', amountCents: license });
    if (volumeCents > 0) {
      rateVolume(volumeCents, priceBook.tiers).forEach(function (band) {
        if (!band.volumeCents) return;
        lines.push({ kind: 'Commission', label: 'Volume commission', detail: rateLabel(band.ppm) + ' · ' + money(band.volumeCents), amountCents: band.feeCents });
      });
    }
    var decline = { attempts: 0, rate: 0, excess: 0, feeCents: 0 };
    (adjustments || []).forEach(function (item) {
      lines.push({ kind: 'Adjustment', label: item.label, detail: item.reason, amountCents: item.amountCents });
    });
    return { lines: lines, decline: decline, totalCents: sum(lines) };
  }
  function issuedInvoice(account, monthKey, month, status, volumeCents, coveredCents, allowanceCents, lines) {
    var shopId = storeShopId(account.storeId);
    var invoice = {
      id: 'inv-' + monthKey + '-' + shopId,
      number: monthKey.replace('-', '') + '-' + shopId,
      store: account.store,
      month: month,
      monthKey: monthKey,
      status: status,
      paidAt: '',
      volumeCents: volumeCents,
      coveredCents: coveredCents,
      allowanceCents: allowanceCents,
      approvals: 0,
      declines: 0,
      lines: lines,
      totalCents: sum(lines)
    };
    account.invoices.push(invoice);
    return invoice;
  }
  function makeInvoice(store, shopId, monthKey, month, priceBook, volumeCents, approvals, declines, adjustments, status, paidAt, billableDays, daysInMonth) {
    var code = shopId || 'store';
    var charge = chargeLines(priceBook, volumeCents, approvals, declines, adjustments, billableDays, daysInMonth);
    return {
      id: 'inv-' + monthKey + '-' + code,
      number: monthKey.replace('-', '') + '-' + code,
      store: store,
      month: month,
      monthKey: monthKey,
      status: status,
      paidAt: paidAt || '',
      volumeCents: volumeCents,
      coveredCents: 0,
      allowanceCents: priceBook ? priceBook.allowanceCents : null,
      approvals: approvals,
      declines: declines,
      lines: charge.lines,
      totalCents: charge.totalCents
    };
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
  function remember(action, storeId, detail, bookId, invoiceId) {
    auditLog.unshift({ at: '2026-10-28 19:40', actor: 'ops.amy', action: action, storeId: storeId || '', bookId: bookId || '', invoiceId: invoiceId || '', detail: detail || '' });
  }
  function timelinePhrase(action) {
    if (action === 'Created price book') return 'created this price book';
    if (action === 'Updated price book') return 'updated this price book';
    return action;
  }
  function priceBookTimeline(bookId) {
    var rows = auditLog.filter(function (item) { return item.bookId === bookId; });
    var body = rows.length ? rows.map(function (item) {
      return '<li><span class="bill-timeline-dot"></span><span class="bill-timeline-text"><span class="i18n-skip">' + esc(item.actor) + '</span> <span>' + esc(timelinePhrase(item.action)) + '</span></span><time class="i18n-skip">' + esc(item.at) + '</time></li>';
    }).join('') : '<li class="bill-timeline-empty">No records in this view.</li>';
    return '<section class="ops-form-card bill-timeline"><div class="ops-panel-title">Activity</div><ol class="bill-timeline-list">' + body + '</ol></section>';
  }
  function activityList(rows) {
    return rows.slice().sort(function (a, b) { return a.at < b.at ? 1 : (a.at > b.at ? -1 : 0); });
  }
  function activityRowHtml(item) {
    var mail = item.action === 'Emailed the owner'
      ? ' <a class="ops-preview-email" href="' + esc(billingEmailHref(item.storeId, /Card declined/.test(item.detail || '') ? 'failed' : 'nocard', item.invoiceId)) + '" target="_blank" rel="noopener">Preview email</a>'
      : '';
    return '<tr><td class="i18n-skip">' + esc(item.at) + '</td><td class="i18n-skip">' + esc(item.actor) + '</td><td>' + esc(item.action) + '</td><td class="bill-activity-detail">' + item.detail + mail + '</td></tr>';
  }
  function activitySection() {
    return '<section class="ops-panel" style="margin-top:16px"><div class="ops-panel-head"><div><div class="ops-panel-title">Activity</div></div></div><div class="ops-table-wrap"><table class="ops-table bill-activity-table"><thead><tr><th>Time</th><th>Operator</th><th>Action</th><th>Note</th></tr></thead><tbody id="billActivityRows"></tbody></table></div><div class="ops-table-foot" id="billActivityFoot"><span class="ops-table-total" id="billActivityTotal">Total 0 records</span><div class="pg" id="billActivityPagination"></div></div></section>';
  }
  function storeActivityRows(storeId) {
    return activityList(auditLog.filter(function (item) { return item.storeId === storeId; })).map(activityRowHtml);
  }
  function invoiceActivityRows(invoiceId) {
    return activityList(auditLog.filter(function (item) { return item.invoiceId === invoiceId; })).map(activityRowHtml);
  }
  function activityTable() {
    return activitySection();
  }
  function invoiceActivity() {
    return activitySection();
  }
  function refreshStatus(account) {
    var overdue = account.invoices.some(function (invoice) { return invoice.status === 'Past due'; });
    var failed = account.invoices.some(function (invoice) { return invoice.status === 'Charge failed'; });
    if (!overdue) account.checkoutFallback = false;
    if (overdue || account.checkoutFallback) { account.billingStatus = 'Past due'; return; }
    if (failed) { account.billingStatus = 'Charge failed'; return; }
    account.billingStatus = account.allowanceCents == null || !account.allowanceUsed ? 'Not billed' : 'Current';
  }

  function ui() { return (window.SAAS_OPS && window.SAAS_OPS.contentApi) || null; }
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function billStatus(value) {
    var tone = { Paid: 'ok', Current: 'ok', Live: 'ok', 'Not billed': 'muted', Unpaid: 'warn', 'Charge failed': 'danger', 'Past due': 'danger', Suspended: 'danger', 'Not started': 'muted', Draft: 'warn', Custom: 'warn' }[value] || 'ok';
    return '<span class="ops-status ' + tone + '"><i></i>' + esc(value) + '</span>';
  }
  function listCard(filters, table) {
    return '<div class="ops-table-card"><div class="ops-filter-bar">' + filters + '</div><div class="ops-table-wrap">' + table + '</div><div class="ops-table-foot"><span class="ops-table-total">Total 0 records</span><div class="pg" id="billPagination"></div></div></div>';
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
  function storePreviewLink(store) {
    var host = storeDomain(store);
    if (!host) return '';
    var url = /^https?:\/\//i.test(host) ? host : 'https://' + host;
    return '<a class="ops-store-preview" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" title="Open store" aria-label="Open store"><span>' + esc(host) + '</span>' + ui().icon('external', 12) + '</a>';
  }
  function billingStoreCell(store) {
    var shopId = store.shopId || '';
    var shopIdHtml = shopId
      ? '<span class="ops-store-id" data-copy-shopid="' + esc(shopId) + '" title="Copy Shop ID" role="button"><span class="ops-store-id-text"><span>Shop ID</span>: <span class="i18n-skip">' + esc(shopId) + '</span></span><button type="button" class="ops-store-id-copy" data-copy-shopid="' + esc(shopId) + '" title="Copy Shop ID" aria-label="Copy Shop ID">' + ui().icon('copy', 12) + '</button></span>'
      : '';
    return '<div class="ops-store-cell"><a class="ops-row-link bill-store-name" href="#/stores/' + esc(store.id) + '"><strong>' + esc(store.name) + '</strong></a>' + storePreviewLink(store) + shopIdHtml + '</div>';
  }
  function copyShopId(value) {
    var face = ui();
    var text = String(value || '');
    if (!text || !face) return;
    function done() { face.toast('Shop ID copied'); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        var input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        try { document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(input);
        done();
      });
      return;
    }
    done();
  }
  function nameCell(href, title, meta, tag) {
    var tagHtml = tag ? '<span class="bill-default-tag">' + esc(tag) + '</span>' : '';
    return '<div class="ops-store-cell"><a class="ops-row-link' + (tag ? ' bill-name-line' : '') + '" href="' + esc(href) + '"><strong>' + esc(title) + '</strong>' + tagHtml + '</a>' + (meta ? '<span class="ops-meta">' + esc(meta) + '</span>' : '') + '</div>';
  }
  function searchFieldLabel(field) {
    if (field === 'shopId') return 'Shop ID';
    if (field === 'domain') return 'Domain';
    if (field === 'store') return 'Store';
    if (field === 'number') return 'Invoice';
    return 'Store name';
  }
  function searchTag(label, value) {
    return '<span class="field-pill" data-clear-bill="keyword"><span class="muted">' + esc(label) + '</span>: <span class="i18n-skip">' + esc(value) + '</span> <span class="x">&times;</span></span>';
  }
  function filterTag(kind, label, values) {
    var valueHtml = values.map(function (value) { return '<span>' + esc(value) + '</span>'; }).join(', ');
    return '<span class="field-pill" data-clear-bill="' + kind + '"><span class="muted">' + esc(label) + '</span>: ' + valueHtml + ' <span class="x">&times;</span></span>';
  }
  function optionLabel(options, value) {
    return ((options.filter(function (opt) { return opt.value === value; })[0] || {}).label || value);
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
    var width = Math.ceil(Math.max(maxText + pad + pad + gap + 14, maxText + 12 + 20 + 15 + 8));
    filter.style.width = width + 'px';
    popover.style.boxSizing = 'border-box';
    popover.style.width = width + 'px';
    popover.style.minWidth = width + 'px';
    popover.style.maxWidth = width + 'px';
  }
  function multiCheckHtml(id, empty, options) {
    var face = ui();
    var sizer = [empty].concat(options.map(function (opt) { return opt.label; })).map(function (text) {
      return '<span>' + esc(text) + '</span>';
    }).join('');
    return '<div class="ops-multi-filter" id="' + id + 'Filter">' +
      '<span class="ops-multi-sizer" aria-hidden="true">' + sizer + '</span>' +
      '<button type="button" class="filter-select ops-multi-trigger" id="' + id + 'Button"><span id="' + id + 'Label">' + esc(empty) + '</span>' + (face ? face.icon('down', 14) : '') + '</button>' +
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
      var text = !selected.length ? empty : (selected.length === 1 ? optionLabel(options, selected[0]) : selected.length + ' selected');
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
          var at = selected.indexOf(value);
          if (at >= 0) selected.splice(at, 1);
        }
        onChange();
        paint();
      };
    });
    shared.painters.push(paint);
    return paint;
  }
  function bindFilterDismiss(scope, shared) {
    scope.addEventListener('click', function (event) {
      if (shared.open && !event.target.closest('.ops-multi-filter')) {
        shared.open = '';
        shared.paintAll();
      }
    });
  }
  function resetBillPage() {
    billPage.no = 1;
    billPage.filter = '';
  }
  function billPagerHtml(total) {
    var pageSize = billPage.size;
    var pages = Math.max(1, Math.ceil((total || 0) / pageSize));
    if (billPage.no > pages) billPage.no = pages;
    if (billPage.no < 1) billPage.no = 1;
    var pageNo = billPage.no;
    var html = '<span class="pg-item' + (pageNo <= 1 ? ' disabled' : '') + '"' + (pageNo <= 1 ? '' : ' data-bill-page="' + (pageNo - 1) + '"') + '>‹</span>';
    for (var p = 1; p <= pages; p++) html += '<span class="pg-item' + (p === pageNo ? ' active' : '') + '" data-bill-page="' + p + '">' + p + '</span>';
    html += '<span class="pg-item' + (pageNo >= pages ? ' disabled' : '') + '"' + (pageNo >= pages ? '' : ' data-bill-page="' + (pageNo + 1) + '"') + '>›</span>';
    html += '<select class="pg-size" id="billPageSize" aria-label="Page size"><option value="10"' + (pageSize === 10 ? ' selected' : '') + '>10 / page</option><option value="20"' + (pageSize === 20 ? ' selected' : '') + '>20 / page</option><option value="50"' + (pageSize === 50 ? ' selected' : '') + '>50 / page</option><option value="100"' + (pageSize === 100 ? ' selected' : '') + '>100 / page</option></select>';
    return html;
  }
  function paintList(scope, rowList, colspan, filterKey) {
    if (filterKey !== billPage.filter) {
      billPage.no = 1;
      billPage.filter = filterKey;
    }
    var total = rowList.length;
    var start = (billPage.no - 1) * billPage.size;
    var slice = rowList.slice(start, start + billPage.size);
    var body = scope.querySelector('tbody');
    body.innerHTML = slice.length ? slice.join('') : '<tr class="ops-empty-row"><td class="ops-table-empty" colspan="' + colspan + '">No records in this view.</td></tr>';
    scope.querySelector('.ops-table-total').textContent = 'Total ' + total + ' records';
    var pager = scope.querySelector('#billPagination');
    if (pager) pager.innerHTML = billPagerHtml(total);
    if (window.I18N && window.I18N.apply) {
      window.I18N.apply(body);
      window.I18N.apply(scope.querySelector('.ops-table-foot'));
    }
  }
  function bindBillRows(scope) {
    var body = scope.querySelector('tbody');
    if (!body || body.getAttribute('data-row-bound')) return;
    body.setAttribute('data-row-bound', '1');
    body.addEventListener('click', function (event) {
      var copyBtn = event.target.closest('[data-copy-shopid]');
      if (copyBtn) {
        event.preventDefault();
        event.stopPropagation();
        copyShopId(copyBtn.getAttribute('data-copy-shopid'));
        return;
      }
      if (event.target.closest('a,button,select,input,label')) return;
      var row = event.target.closest('tr[data-href]');
      if (!row) return;
      location.hash = row.getAttribute('data-href');
    });
  }
  function invoicePagerHtml(total) {
    var pageSize = invoicePage.size;
    var pages = Math.max(1, Math.ceil((total || 0) / pageSize));
    if (invoicePage.no > pages) invoicePage.no = pages;
    if (invoicePage.no < 1) invoicePage.no = 1;
    var pageNo = invoicePage.no;
    var html = '<span class="pg-item' + (pageNo <= 1 ? ' disabled' : '') + '"' + (pageNo <= 1 ? '' : ' data-invoice-page="' + (pageNo - 1) + '"') + '>‹</span>';
    for (var p = 1; p <= pages; p++) html += '<span class="pg-item' + (p === pageNo ? ' active' : '') + '" data-invoice-page="' + p + '">' + p + '</span>';
    html += '<span class="pg-item' + (pageNo >= pages ? ' disabled' : '') + '"' + (pageNo >= pages ? '' : ' data-invoice-page="' + (pageNo + 1) + '"') + '>›</span>';
    html += '<select class="pg-size" id="billInvoicePageSize" aria-label="Page size"><option value="10"' + (pageSize === 10 ? ' selected' : '') + '>10 / page</option><option value="20"' + (pageSize === 20 ? ' selected' : '') + '>20 / page</option><option value="50"' + (pageSize === 50 ? ' selected' : '') + '>50 / page</option><option value="100"' + (pageSize === 100 ? ' selected' : '') + '>100 / page</option></select>';
    return html;
  }
  function paintInvoices(scope, rowList) {
    var total = rowList.length;
    var pages = Math.max(1, Math.ceil(total / invoicePage.size));
    if (invoicePage.no > pages) invoicePage.no = pages;
    if (invoicePage.no < 1) invoicePage.no = 1;
    var start = (invoicePage.no - 1) * invoicePage.size;
    var slice = rowList.slice(start, start + invoicePage.size);
    var body = scope.querySelector('#billInvoiceRows');
    body.innerHTML = slice.length ? slice.join('') : '<tr class="ops-empty-row"><td class="ops-table-empty" colspan="4">No records in this view.</td></tr>';
    scope.querySelector('#billInvoiceTotal').textContent = 'Total ' + total + ' records';
    scope.querySelector('#billInvoicePagination').innerHTML = invoicePagerHtml(total);
    if (window.I18N && window.I18N.apply) {
      window.I18N.apply(body);
      window.I18N.apply(scope.querySelector('#billInvoiceFoot'));
    }
  }
  function activityPagerHtml(total) {
    var pageSize = activityPage.size;
    var pages = Math.max(1, Math.ceil((total || 0) / pageSize));
    if (activityPage.no > pages) activityPage.no = pages;
    if (activityPage.no < 1) activityPage.no = 1;
    var pageNo = activityPage.no;
    var html = '<span class="pg-item' + (pageNo <= 1 ? ' disabled' : '') + '"' + (pageNo <= 1 ? '' : ' data-activity-page="' + (pageNo - 1) + '"') + '>‹</span>';
    for (var p = 1; p <= pages; p++) html += '<span class="pg-item' + (p === pageNo ? ' active' : '') + '" data-activity-page="' + p + '">' + p + '</span>';
    html += '<span class="pg-item' + (pageNo >= pages ? ' disabled' : '') + '"' + (pageNo >= pages ? '' : ' data-activity-page="' + (pageNo + 1) + '"') + '>›</span>';
    html += '<select class="pg-size" id="billActivityPageSize" aria-label="Page size"><option value="10"' + (pageSize === 10 ? ' selected' : '') + '>10 / page</option><option value="20"' + (pageSize === 20 ? ' selected' : '') + '>20 / page</option><option value="50"' + (pageSize === 50 ? ' selected' : '') + '>50 / page</option><option value="100"' + (pageSize === 100 ? ' selected' : '') + '>100 / page</option></select>';
    return html;
  }
  function paintActivity(scope, rowList) {
    var total = rowList.length;
    var pages = Math.max(1, Math.ceil(total / activityPage.size));
    if (activityPage.no > pages) activityPage.no = pages;
    if (activityPage.no < 1) activityPage.no = 1;
    var start = (activityPage.no - 1) * activityPage.size;
    var slice = rowList.slice(start, start + activityPage.size);
    var body = scope.querySelector('#billActivityRows');
    body.innerHTML = slice.length ? slice.join('') : '<tr class="ops-empty-row"><td class="ops-table-empty" colspan="4">No records in this view.</td></tr>';
    scope.querySelector('#billActivityTotal').textContent = 'Total ' + total + ' records';
    scope.querySelector('#billActivityPagination').innerHTML = activityPagerHtml(total);
    if (window.I18N && window.I18N.apply) {
      window.I18N.apply(body);
      window.I18N.apply(scope.querySelector('#billActivityFoot'));
    }
  }
  function bindActivityPager(scope, rowList, key) {
    if (activityPage.key !== key) {
      activityPage.key = key;
      activityPage.no = 1;
    }
    var pager = scope.querySelector('#billActivityPagination');
    function draw() { paintActivity(scope, rowList); }
    pager.addEventListener('click', function (event) {
      var next = event.target.getAttribute('data-activity-page');
      if (!next) return;
      activityPage.no = Number(next) || 1;
      draw();
    });
    pager.addEventListener('change', function (event) {
      if (!event.target || event.target.id !== 'billActivityPageSize') return;
      activityPage.size = Number(event.target.value) || 20;
      activityPage.no = 1;
      draw();
    });
    draw();
  }
  function bindBillPager(scope, draw) {
    bindBillRows(scope);
    var box = scope.querySelector('#billPagination');
    if (!box || box.getAttribute('data-bound')) return;
    box.setAttribute('data-bound', '1');
    box.addEventListener('click', function (event) {
      var next = event.target.getAttribute('data-bill-page');
      if (!next) return;
      billPage.no = Number(next) || 1;
      draw();
    });
    box.addEventListener('change', function (event) {
      if (!event.target || event.target.id !== 'billPageSize') return;
      billPage.size = Number(event.target.value) || 20;
      billPage.no = 1;
      draw();
    });
  }
  function kpi(label, value, detail) {
    return '<div class="ops-kpi"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong>' + (detail ? '<small>' + esc(detail) + '</small>' : '') + '</div>';
  }
  function invKpiSvg(d) {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }
  var INV_KPI_ICO = {
    total: invKpiSvg('<path d="M6 2h9l5 5v15H6z"/><path d="M15 2v5h5"/><path d="M8 13h8M8 17h6"/>'),
    volume: invKpiSvg('<path d="M4 19V10M10 19V5M16 19v-7M20 19H3"/>'),
    free: invKpiSvg('<rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M12 8v13M3 12h18"/><path d="M12 8c0-2.2-1.3-4-3.2-4S6 6.2 6 8M12 8c0-2.2 1.3-4 3.2-4S18 6.2 18 8"/>'),
    remain: invKpiSvg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>'),
    bill: invKpiSvg('<circle cx="12" cy="12" r="9"/><path d="M16 10s-1.2-1.5-4-1.5S8 10.7 8 11.9c0 3.1 8 1.6 8 4.6 0 1.3-1.4 2.5-4 2.5S8 16.6 8 16.6"/><path d="M12 6.5v1.5M12 16v1.5"/>'),
    license: invKpiSvg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>'),
    commission: invKpiSvg('<circle cx="8" cy="8" r="2.2"/><circle cx="16" cy="16" r="2.2"/><path d="m7 17 10-10"/>'),
    adjust: invKpiSvg('<path d="M5 8h6M8 5v6M14 15h6M14 8h6"/>'),
    received: invKpiSvg('<circle cx="12" cy="12" r="9"/><path d="m8.2 12.2 2.7 2.7 5-5.2"/>'),
    out: invKpiSvg('<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>')
  };
  function invoiceKpi(label, value, detail, tone) {
    return '<div class="ops-kpi bill-inv-kpi is-' + tone + '"><div class="bill-inv-kpi-top"><span class="bill-inv-kpi-ico" aria-hidden="true">' + (INV_KPI_ICO[tone] || '') + '</span><span>' + esc(label) + '</span></div><strong>' + esc(value) + '</strong>' + (detail ? '<small>' + esc(detail) + '</small>' : '') + '</div>';
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
  function render(root, parts) {
    var face = ui();
    if (!face) { root.innerHTML = '<div class="ops-page"><h1 class="ops-title">Billing</h1></div>'; return; }
    parts = parts || [];
    if (parts[0] === 'prices' && parts[1] === 'new') editBook(root, null);
    else if (parts[0] === 'prices' && parts[1]) editBook(root, parts[1]);
    else if (parts[0] === 'prices') bookList(root);
    else if (parts[0] === 'invoices' && parts[1]) invoiceDetail(root, parts[1]);
    else if (parts[0] === 'invoices') invoiceList(root);
    else if (parts[0] === 'revenue') revenue(root);
    else if (parts[0] === 'stores' && parts[1]) storeBilling(root, parts[1]);
    else storeList(root);
  }

  function storeList(root) {
    resetBillPage();
    var face = ui();
    var stores = platformStores().filter(function (store) { return store.type === 'bestcheckout'; });
    var lifecycleOptions = [
      { value: 'Active', label: 'Enabled' },
      { value: 'Provisioning', label: 'Opening' },
      { value: 'Suspended', label: 'Disabled' }
    ];
    var billingOptions = [
      { value: 'Not billed', label: 'Not billed' },
      { value: 'Current', label: 'Current' },
      { value: 'Charge failed', label: 'Charge failed' },
      { value: 'Past due', label: 'Past due' },
      { value: 'Not started', label: 'Not started' }
    ];
    var bookFilterOptions = books.map(function (item) { return { value: item.id, label: item.name }; });
    var filters = searchBox('billStoreField', '<option value="name">Store name</option><option value="domain">Domain</option><option value="shopId">Shop ID</option>', 'billStoreSearch') +
      multiCheckHtml('billStoreLifecycle', 'All store statuses', lifecycleOptions) +
      multiCheckHtml('billStoreStatus', 'All billing statuses', billingOptions) +
      multiCheckHtml('billStoreBook', 'All price books', bookFilterOptions) +
      '<div class="ops-filter-tags" id="billStoreTags"></div>';
    var table = '<table class="ops-table bill-store-table"><thead><tr><th>Store</th><th>Store status</th><th>Status detail</th><th>Billing status</th><th>Price book</th><th>Free allowance</th><th class="ops-col-act">Action</th></tr></thead><tbody></tbody></table>';
    face.render(root, face.page('BestCheckout billing', '', '', listCard(filters, table)), function (scope) {
      var selectedLifecycle = [];
      var selectedBilling = [];
      var selectedBooks = [];
      var multiState = { open: '', painters: [], paintAll: function () { multiState.painters.forEach(function (paint) { paint(); }); } };
      function billingState(store) {
        var account = findAccount(store.id);
        return account ? account.billingStatus : 'Not started';
      }
      function draw() {
        var field = (scope.querySelector('#billStoreField') || {}).value || 'name';
        var raw = (scope.querySelector('#billStoreSearch').value || '').trim();
        var query = raw.toLowerCase();
        var list = stores.filter(function (store) {
          var book = bookForStore(store);
          if (selectedLifecycle.length && selectedLifecycle.indexOf(store.lifecycle) < 0) return false;
          if (selectedBooks.length && selectedBooks.indexOf(book.id) < 0) return false;
          if (selectedBilling.length && selectedBilling.indexOf(billingState(store)) < 0) return false;
          if (!query) return true;
          if (field === 'domain') return storeDomain(store).toLowerCase().indexOf(query) >= 0;
          if (field === 'shopId') return String(store.shopId || '').toLowerCase().indexOf(query) >= 0;
          return String(store.name || '').toLowerCase().indexOf(query) >= 0;
        });
        var rows = list.map(function (store) {
          var account = findAccount(store.id);
          var book = bookForStore(store);
          return '<tr data-href="#/billing/stores/' + esc(store.id) + '"><td>' + billingStoreCell(store) + '</td>' +
            '<td>' + storeLifecycleCell(store) + '</td>' +
            '<td>' + storeStatusDetailCell(store) + '</td>' +
            '<td>' + billStatus(billingState(store)) + '</td>' +
            '<td><div class="ops-store-cell"><a class="ops-link" href="#/billing/prices/' + esc(book.id) + '">' + esc(book.name) + '</a>' + (account ? '' : '<span class="bill-default-tag">Default</span>') + '</div></td>' +
            '<td>' + allowanceCell(account ? effectiveAllowance(account) : defaultBook().allowanceCents) + '</td>' +
            '<td class="ops-col-act">' + viewAct('#/billing/stores/' + store.id) + '</td></tr>';
        });
        paintList(scope, rows, 7, field + '|' + query + '|' + selectedLifecycle.join(',') + '|' + selectedBooks.join(',') + '|' + selectedBilling.join(','));
        var tags = [];
        if (raw) tags.push(searchTag(searchFieldLabel(field), raw));
        if (selectedLifecycle.length) tags.push(filterTag('lifecycle', 'Store status', selectedLifecycle.map(function (value) { return optionLabel(lifecycleOptions, value); })));
        if (selectedBilling.length) tags.push(filterTag('billing', 'Billing status', selectedBilling.map(function (value) { return optionLabel(billingOptions, value); })));
        if (selectedBooks.length) tags.push(filterTag('book', 'Price book', selectedBooks.map(function (value) { return optionLabel(bookFilterOptions, value); })));
        var tagBox = scope.querySelector('#billStoreTags');
        tagBox.innerHTML = tags.join('');
        if (window.I18N && window.I18N.apply) window.I18N.apply(tagBox);
      }
      bindBillPager(scope, draw);
      scope.querySelector('#billStoreSearch').oninput = draw;
      scope.querySelector('#billStoreField').onchange = draw;
      bindMultiCheck(scope, 'billStoreLifecycle', 'All store statuses', lifecycleOptions, selectedLifecycle, draw, multiState);
      bindMultiCheck(scope, 'billStoreStatus', 'All billing statuses', billingOptions, selectedBilling, draw, multiState);
      bindMultiCheck(scope, 'billStoreBook', 'All price books', bookFilterOptions, selectedBooks, draw, multiState);
      scope.querySelector('#billStoreTags').onclick = function (event) {
        var pill = event.target.closest('[data-clear-bill]');
        if (!pill) return;
        var kind = pill.getAttribute('data-clear-bill');
        if (kind === 'keyword') scope.querySelector('#billStoreSearch').value = '';
        if (kind === 'lifecycle') selectedLifecycle.splice(0, selectedLifecycle.length);
        if (kind === 'billing') selectedBilling.splice(0, selectedBilling.length);
        if (kind === 'book') selectedBooks.splice(0, selectedBooks.length);
        multiState.paintAll();
        draw();
      };
      bindFilterDismiss(scope, multiState);
      draw();
      setTimeout(function () { multiState.paintAll(); }, 0);
    });
  }

  function storeLifecycleCell(store) {
    var label = ({ Active: 'Enabled', Provisioning: 'Opening', Suspended: 'Disabled' })[store.lifecycle] || store.lifecycle || '—';
    var tone = label === 'Disabled' ? 'danger' : (label === 'Opening' ? 'warn' : 'ok');
    return '<span class="ops-status ' + tone + '"><i></i>' + esc(label) + '</span>';
  }
  function storeStatusDetail(store) {
    if (store.holdReason) return store.holdReason;
    var code = store.installStatus || (store.type === 'bestcheckout' ? 'preparing' : '');
    return ({
      preparing: 'Preparing install link',
      ready: 'Ready to install',
      expired: 'Install link expired',
      failed: 'Install failed',
      connected: 'Connected',
      reauth: 'Reauthorization needed'
    })[code] || code || '';
  }
  function storeStatusDetailCell(store) {
    var label = storeStatusDetail(store);
    var face = ui();
    if (!label) return '<span class="ops-meta">—</span>';
    if (face && face.status) return face.status(label);
    return '<span class="ops-status muted"><i></i>' + esc(label) + '</span>';
  }
  function bandRangeLabel(previousCents, upToCents) {
    var low = previousCents > 0 ? '<span class="i18n-skip">' + esc(moneyWhole(previousCents)) + '</span> &lt; ' : '';
    var high = upToCents != null ? ' ≤ <span class="i18n-skip">' + esc(moneyWhole(upToCents)) + '</span>' : '';
    return low + '<span>Volume</span>' + high;
  }
  function rateLines(item) {
    var previous = 0;
    var lines = (item.tiers || []).map(function (tier) {
      var label = bandRangeLabel(previous, tier.upToCents) + ' <span class="i18n-skip">· ' + esc(rateLabel(tier.ppm)) + '</span>';
      if (tier.upToCents != null) previous = tier.upToCents;
      return '<div class="bill-rates-line">' + label + '</div>';
    }).join('');
    return lines ? '<div class="bill-rates-stack">' + lines + '</div>' : '—';
  }
  function bookList(root) {
    resetBillPage();
    var face = ui();
    var filters = searchBox('billBookField', '<option value="name">Price book</option>', 'billBookSearch') +
      '<div class="ops-filter-tags" id="billBookTags"></div>';
    var table = '<table class="ops-table bill-book-table"><thead><tr><th>Price book</th><th>Monthly license</th><th>Free capture allowance</th><th>Processing commission</th><th>Assigned stores</th><th class="ops-col-act">Action</th></tr></thead><tbody></tbody></table>';
    face.render(root, face.page('Price books', '', '<a class="btn btn-primary" href="#/billing/prices/new">Add price book</a>', listCard(filters, table)), function (scope) {
      function draw() {
        var raw = (scope.querySelector('#billBookSearch').value || '').trim();
        var query = raw.toLowerCase();
        var list = books.filter(function (item) {
          if (!query) return true;
          return item.name.toLowerCase().indexOf(query) >= 0;
        });
        var rows = list.map(function (item) {
          var count = accounts.filter(function (account) { return account.priceBookId === item.id; }).length;
          return '<tr class="bill-book-row" data-href="#/billing/prices/' + esc(item.id) + '"><td>' + nameCell('#/billing/prices/' + item.id, item.name, '', item.id === defaultBookId ? 'Default' : '') + '</td><td class="i18n-skip">' + esc(money(item.monthlyFeeCents)) + '</td><td>' + allowanceCell(item.allowanceCents) + '</td><td class="bill-rates">' + rateLines(item) + '</td><td>' + count + '</td><td class="ops-col-act">' + viewAct('#/billing/prices/' + item.id) + '</td></tr>';
        });
        paintList(scope, rows, 6, query);
        var tags = scope.querySelector('#billBookTags');
        tags.innerHTML = raw ? searchTag('Price book', raw) : '';
        if (window.I18N && window.I18N.apply) window.I18N.apply(tags);
      }
      bindBillPager(scope, draw);
      scope.querySelector('#billBookSearch').oninput = draw;
      scope.querySelector('#billBookTags').onclick = function (event) {
        if (!event.target.closest('[data-clear-bill]')) return;
        scope.querySelector('#billBookSearch').value = '';
        draw();
      };
      draw();
    });
  }

  function bookReturnHref() {
    var prev = window.SAAS_NAV && window.SAAS_NAV.previous ? window.SAAS_NAV.previous() : '';
    if (!prev || prev === location.hash || prev === '#/billing/prices/new') return '#/billing/prices';
    return prev;
  }
  function editBook(root, id) {
    var face = ui();
    var creating = !id;
    var item = creating ? null : bookById(id);
    if (!creating && !books.some(function (entry) { return entry.id === id; })) { bookList(root); return; }
    var source = item || standard;
    var rates = source;
    var backHref = bookReturnHref();
    var allowanceCents = rates.allowanceCents !== undefined ? rates.allowanceCents : source.allowanceCents;
    var allowanceUnlimited = allowanceCents == null;
    var isDefault = !creating && source.id === defaultBookId;
    var body =
      '<form class="ops-editor bill-book-form' + (creating ? ' bill-book-create' : '') + '" id="billBookForm">' +
        '<div class="bill-editor-main">' +
          '<section class="ops-form-card"><div class="ops-panel-title">Price book</div>' +
            labeled('Price book name', '<input class="input" id="billName" value="' + esc(creating ? '' : source.name) + '" placeholder="For example: Folast VIP">', 'billName') +
            '<label class="bill-check"><input type="checkbox" id="billDefault"' + (isDefault ? ' checked disabled' : '') + '> This is the default price book</label>' +
            '<div class="ops-panel-sub">New BestCheckout stores use the default price book.</div>' +
          '</section>' +
          '<section class="ops-form-card"><div class="ops-panel-title">Monthly license</div><div class="ops-panel-sub">Charged for each month the store is Active, including a month with no captured payments.</div>' +
            labeled('Monthly license (USD)', '<input class="input" id="billFee" value="' + esc(creating ? '' : (rates.monthlyFeeCents / 100).toFixed(2)) + '" placeholder="150.00">', 'billFee') +
          '</section>' +
          '<section class="ops-form-card"><div class="ops-panel-title">Free capture allowance</div><div class="ops-panel-sub">Volume up to this amount is not billed. Stores use the price book amount, unless that store has its own.</div>' +
            '<label class="bill-check"><input type="checkbox" id="billAllowanceUnlimited"' + (allowanceUnlimited ? ' checked' : '') + '> Unlimited</label>' +
            labeled('Free capture allowance (USD)', '<input class="input" id="billAllowance" value="' + esc(allowanceUnlimited ? '' : (allowanceCents / 100).toFixed(2)) + '" placeholder="25000">', 'billAllowance') +
          '</section>' +
          '<section class="ops-form-card"><div class="ops-panel-title">Processing commission</div><div class="ops-panel-sub">The month\'s volume picks one rate. That rate applies to the whole volume outside the free capture allowance.</div>' +
            bandTable() +
          '</section>' +
          (creating ? '' : priceBookTimeline(source.id)) +
          '<div class="ops-form-actions bill-create-actions"><button type="submit" class="btn btn-primary">' + (creating ? 'Save price book' : 'Update') + '</button></div>' +
        '</div>' +
      '</form>';
    var unsaved = creating || !window.UI || !window.UI.unsavedBar ? '' : window.UI.unsavedBar({ show: false, saveLabel: 'Save' });
    face.render(root, unsaved + face.page(creating ? 'New price book' : source.name, '', '', body, '', backHref), function (scope) {
      var page = scope.querySelector('.ops-page');
      if (page) page.classList.add('ops-page-editor');
      if (page && creating) page.classList.add('bill-create-page');
      var form = scope.querySelector('#billBookForm');
      var unlimitedBox = scope.querySelector('#billAllowanceUnlimited');
      var allowanceInput = scope.querySelector('#billAllowance');
      function syncAllowance() {
        var hide = unlimitedBox.checked;
        allowanceInput.disabled = hide;
        if (allowanceInput.parentElement) allowanceInput.parentElement.hidden = hide;
      }
      unlimitedBox.onchange = syncAllowance;
      syncAllowance();
      var bandState = bandsFromTiers(rates.tiers);
      if (creating) {
        bandState.capped.forEach(function (band) { band.cap = ''; band.rate = ''; });
        bandState.openRate = '';
      }
      function paintBands() {
        var canRemove = bandState.capped.length > 1;
        var rows = bandState.capped.map(function (band, index) {
          var low = index === 0 ? '' : '<span class="i18n-skip bill-band-low">—</span> &lt; ';
          var remove = canRemove ? '<button type="button" class="bill-band-remove" data-remove="' + index + '">Remove</button>' : '';
          return '<tr><td><div class="bill-band-grid"><span class="bill-band-label">' + low + '<span>Volume</span> ≤</span><input class="input bill-cap" value="' + esc(band.cap) + '" placeholder="1000000"><div class="bill-error"></div></div></td><td><div class="bill-rate-line"><input class="input bill-rate" value="' + esc(band.rate) + '" placeholder="0.5">' + remove + '</div><div class="bill-error"></div></td></tr>';
        }).join('');
        rows += '<tr data-open="1"><td><div class="bill-band-range"><span class="i18n-skip bill-band-low">—</span> &lt; <span>Volume</span></div></td><td><div class="bill-rate-line"><input class="input bill-rate" value="' + esc(bandState.openRate) + '" placeholder="0.5"></div><div class="bill-error"></div></td></tr>';
        scope.querySelector('#billBandTable tbody').innerHTML = rows;
        syncBandHints();
        if (origin) syncDirty();
      }
      function captureBands() {
        var caps = scope.querySelectorAll('.bill-cap');
        var rateNodes = scope.querySelectorAll('.bill-rate');
        return {
          capped: Array.prototype.map.call(caps, function (node, index) {
            return { cap: node.value, rate: rateNodes[index] ? rateNodes[index].value : '' };
          }),
          openRate: rateNodes.length ? rateNodes[rateNodes.length - 1].value : ''
        };
      }
      function syncBandHints() {
        var caps = Array.prototype.map.call(scope.querySelectorAll('.bill-cap'), function (node) {
          return String(node.value).trim() ? centsOf(node.value) : null;
        });
        scope.querySelectorAll('#billBandTable tbody tr').forEach(function (row, index) {
          var low = row.querySelector('.bill-band-low');
          if (!low) return;
          var previous = caps[index - 1];
          low.textContent = previous > 0 ? moneyWhole(previous) : '—';
        });
      }
      var bandTableNode = scope.querySelector('#billBandTable');
      bandTableNode.addEventListener('input', function (event) {
        if (event.target.classList.contains('bill-cap')) syncBandHints();
      });
      bandTableNode.addEventListener('click', function (event) {
        var button = event.target.closest('[data-remove]');
        if (!button) return;
        bandState = captureBands();
        var index = Number(button.getAttribute('data-remove'));
        if (bandState.capped.length < 2 || !isFinite(index)) return;
        bandState.capped.splice(index, 1);
        paintBands();
      });
      scope.querySelector('#billAddBand').addEventListener('click', function () {
        bandState = captureBands();
        bandState.capped.push({ cap: '', rate: '' });
        paintBands();
        var caps = scope.querySelectorAll('.bill-cap');
        if (caps.length) caps[caps.length - 1].focus();
      });
      var origin = '';
      function formSnapshot() {
        return JSON.stringify({
          name: scope.querySelector('#billName').value,
          isDefault: scope.querySelector('#billDefault').checked,
          fee: scope.querySelector('#billFee').value,
          unlimited: unlimitedBox.checked,
          allowance: allowanceInput.value,
          caps: Array.prototype.map.call(scope.querySelectorAll('.bill-cap'), function (node) { return node.value; }),
          rates: Array.prototype.map.call(scope.querySelectorAll('.bill-rate'), function (node) { return node.value; })
        });
      }
      function syncDirty() {
        if (creating || !window.UI || !window.UI.setUnsavedBar) return;
        window.UI.setUnsavedBar(scope, formSnapshot() !== origin);
      }
      paintBands();
      if (!creating) {
        origin = formSnapshot();
        var discard = scope.querySelector('[data-act="discard"]');
        var saveBar = scope.querySelector('[data-act="save-bar"]');
        if (discard) discard.addEventListener('click', function () { editBook(root, id); });
        if (saveBar) saveBar.addEventListener('click', function () { form.requestSubmit(); });
      }
      form.addEventListener('change', syncDirty);
      form.addEventListener('input', function (event) {
        var field = event.target;
        if (!field.classList || !field.classList.contains('input')) return;
        field.classList.remove('has-error');
        var next = field.nextElementSibling;
        if (next && next.classList.contains('bill-error')) next.textContent = '';
        var cell = field.closest('td');
        if (cell) {
          var bandErr = cell.querySelector('.bill-error');
          if (bandErr) bandErr.textContent = '';
        }
        syncDirty();
      });
      form.onsubmit = function (event) {
        event.preventDefault();
        var draft = readBook(scope, creating ? '' : source.name);
        if (!draft) return;
        var makeDefault = scope.querySelector('#billDefault').checked;
        if (creating) {
          var created = book('book-' + Date.now(), draft.name, 'Price book', draft.monthlyFeeCents, [], false, 0, 0, draft.pool);
          created.tiers = draft.tiers;
          created.allowanceCents = draft.allowanceCents;
          books.push(created);
          if (makeDefault) defaultBookId = created.id;
          remember('Created price book', '', esc(draft.name), created.id);
          face.toast('Price book saved.');
          location.hash = '#/billing/prices/' + created.id;
          return;
        }
        source.name = draft.name;
        source.pool = draft.pool;
        source.monthlyFeeCents = draft.monthlyFeeCents;
        source.tiers = draft.tiers;
        source.allowanceCents = draft.allowanceCents;
        source.scheduled = null;
        accounts.forEach(function (account) {
          if (account.priceBookId === source.id && !account.allowanceCustom) applyAllowance(account, draft.allowanceCents);
        });
        if (makeDefault) defaultBookId = source.id;
        remember('Updated price book', '', '', source.id);
        face.toast('Price book saved.');
        editBook(root, source.id);
      };
    });
  }
  function bandsFromTiers(tiers) {
    var list = tiers && tiers.length ? tiers : [];
    var capped = [];
    var openRate = '';
    list.forEach(function (tier) {
      if (tier.upToCents == null) openRate = rateInput(tier.ppm);
      else capped.push({ cap: String(tier.upToCents / 100), rate: rateInput(tier.ppm) });
    });
    if (!capped.length) capped.push({ cap: '', rate: '' });
    return { capped: capped, openRate: openRate };
  }
  function bandTable() {
    return '<table class="bill-band-table" id="billBandTable"><thead><tr><th>Volume</th><th>Rate (%)</th></tr></thead><tbody></tbody></table>' +
      '<button type="button" class="btn btn-default bill-band-add" id="billAddBand">Add band</button>';
  }
  function labeled(label, control, id) {
    return '<div><label class="fld-label" for="' + id + '">' + label + '</label>' + control + '<div class="bill-error" id="' + id + 'Err"></div></div>';
  }
  function readBook(scope, fallbackName) {
    scope.querySelectorAll('.bill-error').forEach(function (node) { node.textContent = ''; });
    scope.querySelectorAll('.has-error').forEach(function (node) { node.classList.remove('has-error'); });
    var name = input(scope, '#billName') || fallbackName;
    var feeRaw = input(scope, '#billFee');
    var fee = feeRaw === '' ? null : centsOf(feeRaw);
    var capNodes = scope.querySelectorAll('.bill-cap');
    var rateNodes = scope.querySelectorAll('.bill-rate');
    var caps = Array.prototype.map.call(capNodes, function (node) {
      return String(node.value).trim() ? centsOf(node.value) : null;
    });
    var rates = Array.prototype.map.call(rateNodes, function (node) {
      return String(node.value).trim() ? ppmOf(node.value) : null;
    });
    var unlimited = scope.querySelector('#billAllowanceUnlimited').checked;
    var allowanceRaw = input(scope, '#billAllowance');
    var allowance = unlimited ? null : (allowanceRaw === '' ? null : centsOf(allowanceRaw));
    var reasonField = scope.querySelector('#billReason');
    var reason = reasonField ? input(scope, '#billReason') : '';
    var ok = true;
    if (!input(scope, '#billName')) { err(scope, 'billName', 'Enter a price book name.'); ok = false; }
    if (fee == null) { err(scope, 'billFee', 'Enter a monthly license of 0 or more.'); ok = false; }
    if (!unlimited && allowance == null) { err(scope, 'billAllowance', 'Enter an allowance of 0 or more, or choose unlimited.'); ok = false; }
    caps.forEach(function (cap, index) {
      if (cap == null || cap <= 0) { capNodes[index].closest('td').querySelector('.bill-error').textContent = 'Enter a volume threshold.'; capNodes[index].classList.add('has-error'); ok = false; }
    });
    rates.forEach(function (rate, index) {
      if (rate == null) { rateNodes[index].closest('td').querySelector('.bill-error').textContent = 'Enter a rate of 0 or more.'; rateNodes[index].classList.add('has-error'); ok = false; }
    });
    caps.forEach(function (cap, index) {
      if (!(index > 0 && cap != null && cap > 0 && caps[index - 1] != null && caps[index - 1] > 0 && cap <= caps[index - 1])) return;
      var error = capNodes[index].closest('td').querySelector('.bill-error');
      if (error && !error.textContent) error.textContent = 'Each volume threshold must be higher than the one before it.';
      capNodes[index].classList.add('has-error');
      ok = false;
    });
    if (reasonField && !reason) { err(scope, 'billReason', 'Enter a reason.'); ok = false; }
    if (!ok) return null;
    return {
      name: name,
      monthlyFeeCents: fee,
      tiers: caps.map(function (cap, index) { return { upToCents: cap, ppm: rates[index] }; }).concat([{ upToCents: null, ppm: rates[rates.length - 1] }]),
      pool: false,
      allowanceCents: allowance,
      reason: reason
    };
  }
  function input(scope, sel) { return String((scope.querySelector(sel) || {}).value || '').trim(); }
  function err(scope, id, message) {
    var node = scope.querySelector('#' + id + 'Err');
    if (node) node.textContent = message;
    var field = scope.querySelector('#' + id);
    if (field) field.classList.add('has-error');
  }
  function centsOf(text) { var n = Number(String(text).replace(/[$,\s]/g, '')); return isFinite(n) && n >= 0 ? Math.round(n * 100) : null; }
  function ppmOf(text) { var n = Number(String(text).replace(/[%\s,]/g, '')); return isFinite(n) && n >= 0 ? Math.round(n * 10000) : null; }
  function thousandthsOf(text) { var n = Number(String(text).replace(/[$,\s]/g, '')); return isFinite(n) && n >= 0 ? Math.round(n * 1000) : null; }

  function tierTable(priceBook) {
    var previous = 0;
    var rows = priceBook.tiers.map(function (tier) {
      var label = bandRangeLabel(previous, tier.upToCents);
      if (tier.upToCents != null) previous = tier.upToCents;
      return '<tr><td>' + label + '</td><td class="i18n-skip">' + esc(rateLabel(tier.ppm)) + '</td></tr>';
    }).join('');
    return '<table class="ops-table"><thead><tr><th>Volume</th><th>Rate</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function storeBilling(root, storeId) {
    rememberInvoiceBack('#/billing/stores/' + storeId);
    var face = ui();
    var store = platformStore(storeId);
    var account = findAccount(storeId);
    if (!store || store.type !== 'bestcheckout') {
      face.render(root, face.page('BestCheckout billing', '', '', '<div class="ops-empty"><strong>This store is not on BestCheckout billing.</strong></div>', '', '#/billing'));
      return;
    }
    if (!account) {
      var empty = '<div class="ops-empty ops-empty-panel"><strong>Billing has not started</strong><p><span>This store is still opening.</span> <span>It uses the default price book, including that price book’s free allowance, until someone assigns another.</span></p></div>';
      face.render(root, face.page(store.name, 'No invoice is issued before the store is Active.', '', empty, '', '#/billing'));
      return;
    }
    var priceBook = bookById(account.priceBookId);
    var remaining = remainingAllowanceCents(account);
    var warning = account.checkoutFallback
      ? '<div class="ops-note ops-warning">New checkouts use Shopify Checkout. The September invoice was unpaid for 7 days. Paying it turns interception back on.</div>'
      : (account.billingStatus === 'Past due' ? '<div class="ops-note ops-warning">The September invoice is unpaid. New checkouts fall back to Shopify Checkout after 7 days.</div>'
        : ((account.failures || []).length ? '<div class="ops-note ops-warning">The card on file was declined when the invoice was issued. The owner was emailed on Oct 27.</div>' : ''));
    var next = account.nextBookId ? '<div class="ops-note">November 2026 will use ' + esc(bookById(account.nextBookId).name) + '. October stays on ' + esc(priceBook.name) + '.</div>' : '';
    var kpis = account.lifecycle === 'Active'
      ? '<div class="ops-kpi-grid ops-kpi-grid-3">' +
        invoiceKpi('Free allowance', allowanceText(account), '', 'free') +
        invoiceKpi('Remaining free allowance', allowanceLabel(remaining), remaining == null ? '' : 'The allowance carries across months.', 'remain') +
        invoiceKpi('October volume', money(account.october.volumeCents), '', 'volume') +
        '</div>'
      : '';
    if (invoicePage.storeId !== account.storeId) {
      invoicePage.storeId = account.storeId;
      invoicePage.no = 1;
    }
    var invoiceRows = account.invoices.slice().sort(function (a, b) { return String(b.month).localeCompare(String(a.month)); }).map(function (invoice) {
      return '<tr><td><a class="ops-link" href="#/billing/invoices/' + esc(invoice.id) + '">' + esc(invoice.number) + '</a></td><td class="i18n-skip">' + esc(invoice.month) + '</td><td class="i18n-skip">' + esc(money(invoice.totalCents)) + '</td><td>' + billStatus(invoice.status) + '</td></tr>';
    });
    var body = '<div class="bill-store-detail">' + warning + next + kpis +
      '<section class="ops-panel"><div class="ops-panel-head"><div><div class="ops-panel-title">Price book</div></div><a class="ops-link" href="#/billing/prices/' + esc(priceBook.id) + '">' + esc(priceBook.name) + '</a></div><div class="ops-table-wrap">' + tierTable(priceBook) + '</div></section>' +
      '<section class="ops-panel" style="margin-top:16px"><div class="ops-panel-head"><div><div class="ops-panel-title">Invoices</div></div></div><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Invoice</th><th>Month</th><th>Total</th><th>Status</th></tr></thead><tbody id="billInvoiceRows"></tbody></table></div><div class="ops-table-foot" id="billInvoiceFoot"><span class="ops-table-total" id="billInvoiceTotal">Total 0 records</span><div class="pg" id="billInvoicePagination"></div></div></section>' +
      activityTable(account.storeId) + '</div>';
    face.render(root, face.page(account.store, storeDomain(store), '<button class="btn btn-default" id="billAllowance">Free allowance</button><button class="btn btn-default" id="billAssign">Change price book</button>', body, '', '#/billing'), function (scope) {
      var titleBlock = scope.querySelector('.ops-page-title-block');
      var sub = titleBlock && titleBlock.querySelector('.ops-sub');
      var preview = storePreviewLink(store);
      if (sub && preview) sub.innerHTML = preview;
      if (titleBlock) {
        var pay = document.createElement('div');
        pay.className = 'bill-pay-line';
        pay.innerHTML = '<span class="bill-pay-label">Payment method</span>' +
          (account.cardOnFile ? '<strong class="i18n-skip">' + esc(account.brand + ' ···· ' + account.last4) + '</strong>' : '<strong>No card on file</strong>') +
          billStatus(account.billingStatus);
        titleBlock.appendChild(pay);
      }
      scope.querySelector('#billAllowance').onclick = function () { openAllowance(account); };
      scope.querySelector('#billAssign').onclick = function () { openAssign(account); };
      var pager = scope.querySelector('#billInvoicePagination');
      function drawInvoices() { paintInvoices(scope, invoiceRows); }
      pager.addEventListener('click', function (event) {
        var next = event.target.getAttribute('data-invoice-page');
        if (!next) return;
        invoicePage.no = Number(next) || 1;
        drawInvoices();
      });
      pager.addEventListener('change', function (event) {
        if (!event.target || event.target.id !== 'billInvoicePageSize') return;
        invoicePage.size = Number(event.target.value) || 20;
        invoicePage.no = 1;
        drawInvoices();
      });
      drawInvoices();
      bindActivityPager(scope, storeActivityRows(account.storeId), 'store:' + account.storeId);
    });
  }
  function openAllowance(account) {
    var face = ui();
    var bookAllowance = bookById(account.priceBookId).allowanceCents;
    var mode = account.allowanceCustom ? (account.allowanceCents == null ? 'unlimited' : 'custom') : 'pricebook';
    var amount = account.allowanceCustom && account.allowanceCents != null ? String(account.allowanceCents / 100) : '';
    function option(value, label) {
      return '<option value="' + value + '"' + (value === mode ? ' selected' : '') + '>' + label + '</option>';
    }
    face.modalFields('Free capture allowance', [
      { label: 'Allowance', html: '<select class="input" id="billAllowancePick">' + option('pricebook', 'Use the price book') + option('unlimited', 'Unlimited') + option('custom', 'Custom amount') + '</select>' },
      { label: 'Free capture allowance (USD)', html: '<input class="input" id="billAllowanceAmount" value="' + esc(amount) + '" placeholder="25000"><div class="bill-error" id="billAllowanceAmountErr"></div>' }
    ], 'Save allowance', function (layer) {
      var pick = layer.querySelector('#billAllowancePick').value;
      var cents = bookAllowance;
      var amountNode = layer.querySelector('#billAllowanceAmount');
      var amountError = layer.querySelector('#billAllowanceAmountErr');
      if (amountNode) amountNode.classList.remove('has-error');
      if (amountError) amountError.textContent = '';
      if (pick === 'unlimited') cents = null;
      if (pick === 'custom') {
        var raw = amountNode.value.trim();
        cents = raw === '' ? null : centsOf(raw);
        if (cents == null) {
          amountNode.classList.add('has-error');
          amountError.textContent = 'Enter an allowance of 0 or more, or choose unlimited.';
          return;
        }
      }
      applyAllowance(account, cents, pick !== 'pricebook');
      remember('Set free allowance', account.storeId, pick === 'pricebook' ? 'Price book' : (cents == null ? 'Unlimited' : '<span class="i18n-skip">' + esc(allowanceLabel(cents)) + '</span>'));
      layer.remove();
      face.toast('Free allowance saved.');
      render(document.getElementById('root'), ['stores', account.storeId]);
    });
    var pick = document.querySelector('#billAllowancePick');
    var amountInput = document.querySelector('#billAllowanceAmount');
    function clearAllowanceError() {
      if (!amountInput) return;
      amountInput.classList.remove('has-error');
      var error = document.querySelector('#billAllowanceAmountErr');
      if (error) error.textContent = '';
    }
    function syncAllowanceMode() {
      if (!pick || !amountInput) return;
      var show = pick.value === 'custom';
      amountInput.hidden = !show;
      var label = amountInput.previousElementSibling;
      if (label && label.classList.contains('fld-label')) label.hidden = !show;
      var error = document.querySelector('#billAllowanceAmountErr');
      if (error) error.hidden = !show;
      if (!show) clearAllowanceError();
    }
    if (pick) pick.addEventListener('change', syncAllowanceMode);
    if (amountInput) amountInput.addEventListener('input', clearAllowanceError);
    syncAllowanceMode();
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
      remember('Assigned price book', account.storeId, esc(bookById(bookId).name) + ' <span>' + (when === 'current' ? 'from October 2026' : 'from November 2026') + '</span>');
      layer.remove();
      face.toast('Price book assigned. Issued invoices stay unchanged.');
      location.hash = '#/billing/stores/' + account.storeId;
      render(document.getElementById('root'), ['stores', account.storeId]);
    });
  }
  function openAdjustment(account, invoice, root, id) {
    var face = ui();
    if (!invoice || invoice.status === 'Paid') return;
    face.modalFields('Adjust this invoice', [
      { label: 'Amount (USD)', html: '<input class="input" id="billAdjAmount" placeholder="-500">' },
      { label: 'Reason', html: '<input class="input" id="billAdjReason" placeholder="Why this amount is credited or charged">' }
    ], 'Add adjustment', function (layer) {
      var amount = Number(String((layer.querySelector('#billAdjAmount') || {}).value || '').replace(/[$,\s]/g, ''));
      var reason = String((layer.querySelector('#billAdjReason') || {}).value || '').trim();
      if (!isFinite(amount) || amount === 0) { face.toast('Enter an amount other than 0.'); return; }
      if (!reason) { face.toast('Enter a reason.'); return; }
      var cents = Math.round(amount * 100);
      invoice.lines.push({ kind: 'Adjustment', label: cents < 0 ? 'Credit' : 'Added charge', detail: reason, amountCents: cents });
      invoice.totalCents = sum(invoice.lines);
      remember(cents < 0 ? 'Added credit' : 'Added charge', account.storeId, '<span class="i18n-skip">' + esc(invoice.number + ' · ' + money(cents) + ' · ' + reason) + '</span>', '', invoice.id);
      if (invoice.totalCents <= 0) {
        invoice.status = 'Paid';
        invoice.paidAt = invoice.paidAt || 'Oct 28, 2026';
        refreshStatus(account);
        auditLog.unshift({ at: '2026-10-28 19:40', actor: 'BestCheckout', action: 'Marked as paid', storeId: account.storeId, bookId: '', invoiceId: invoice.id, detail: invoiceMoneyLog(invoice, invoice.totalCents) });
      }
      layer.remove();
      face.toast('Adjustment added to this invoice.');
      invoiceDetail(root, id);
    });
  }

  function invoiceMath(invoice) {
    function amount(kind) {
      return (invoice.lines || []).filter(function (line) { return line.kind === kind; }).reduce(function (total, line) { return total + line.amountCents; }, 0);
    }
    var license = (invoice.lines || []).filter(function (line) { return line.kind === 'License'; })[0];
    return {
      licenseCents: license ? license.amountCents : 0,
      licenseDetail: license ? license.detail : '',
      commissionCents: amount('Commission'),
      declineCents: amount('Decline'),
      adjustmentCents: amount('Adjustment')
    };
  }
  function invoiceVolumeCell(invoice) {
    var gross = (invoice.coveredCents || 0) + (invoice.volumeCents || 0);
    return '<div class="i18n-skip">' + esc(money(gross)) + '</div>';
  }
  function invoiceLicenseCell(invoice) {
    var math = invoiceMath(invoice);
    if (!math.licenseCents) return '—';
    var days = math.licenseDetail ? '<div class="ops-meta i18n-skip">' + esc(math.licenseDetail) + '</div>' : '';
    return '<div class="i18n-skip">' + esc(money(math.licenseCents)) + '</div>' + days;
  }
  function invoiceCommissionCell(invoice) {
    var math = invoiceMath(invoice);
    if (!math.commissionCents) return '—';
    return '<div class="i18n-skip">' + esc(money(math.commissionCents)) + '</div>';
  }
  function invoiceTotalCell(invoice) {
    return '<div class="i18n-skip">' + esc(money(invoice.totalCents)) + '</div>';
  }
  function invoiceList(root) {
    rememberInvoiceBack('#/billing/invoices');
    resetBillPage();
    var face = ui();
    var seenMonths = {};
    var monthOptions = [];
    allInvoices().forEach(function (invoice) {
      if (!invoice.monthKey || seenMonths[invoice.monthKey]) return;
      seenMonths[invoice.monthKey] = true;
      monthOptions.push({ value: invoice.monthKey, label: invoice.month });
    });
    monthOptions.sort(function (a, b) { return a.value < b.value ? 1 : (a.value > b.value ? -1 : 0); });
    var invoiceStatusOptions = [
      { value: 'Unpaid', label: 'Unpaid' },
      { value: 'Charge failed', label: 'Charge failed' },
      { value: 'Past due', label: 'Past due' },
      { value: 'Paid', label: 'Paid' }
    ];
    var filters = searchBox('billInvoiceField', '<option value="number">Invoice</option><option value="store">Store</option><option value="domain">Domain</option><option value="shopId">Shop ID</option>', 'billInvoiceSearch') +
      multiCheckHtml('billInvoiceMonth', 'All months', monthOptions) +
      multiCheckHtml('billInvoiceStatus', 'All statuses', invoiceStatusOptions) +
      '<div class="ops-filter-tags" id="billInvoiceTags"></div>';
    var table = '<table class="ops-table bill-invoice-table"><thead><tr><th>Invoice</th><th>Store</th><th>Month</th><th>Volume</th><th>Volume commission</th><th>Monthly license</th><th>Total</th><th>Status</th><th class="ops-col-act">Action</th></tr></thead><tbody></tbody></table>';
    face.render(root, face.page('Invoices', '', '', listCard(filters, table)), function (scope) {
      var selectedMonths = [];
      var selectedStatuses = [];
      var multiState = { open: '', painters: [], paintAll: function () { multiState.painters.forEach(function (paint) { paint(); }); } };
      function draw() {
        var raw = (scope.querySelector('#billInvoiceSearch').value || '').trim();
        var query = raw.toLowerCase();
        var field = scope.querySelector('#billInvoiceField').value;
        var list = allInvoices().filter(function (invoice) {
          if (selectedMonths.length && selectedMonths.indexOf(invoice.monthKey) < 0) return false;
          if (selectedStatuses.length && selectedStatuses.indexOf(invoice.status) < 0) return false;
          if (!query) return true;
          var owner = accounts.filter(function (account) { return account.store === invoice.store; })[0];
          var platform = owner ? platformStore(owner.storeId) : null;
          var hay = invoice.number;
          if (field === 'store') hay = invoice.store;
          else if (field === 'domain') hay = platform ? storeDomain(platform) : '';
          else if (field === 'shopId') hay = platform ? (platform.shopId || '') : '';
          return String(hay || '').toLowerCase().indexOf(query) >= 0;
        });
        var rows = list.map(function (invoice) {
          var owner = accounts.filter(function (account) { return account.store === invoice.store; })[0];
          var platform = owner ? platformStore(owner.storeId) : null;
          var storeCell = platform ? billingStoreCell(platform) : esc(invoice.store);
          return '<tr class="bill-invoice-row" data-href="#/billing/invoices/' + esc(invoice.id) + '"><td>' + nameCell('#/billing/invoices/' + invoice.id, invoice.number, '') + '</td><td>' + storeCell + '</td><td class="i18n-skip">' + esc(invoice.month) + '</td><td class="bill-math">' + invoiceVolumeCell(invoice) + '</td><td class="bill-math">' + invoiceCommissionCell(invoice) + '</td><td>' + invoiceLicenseCell(invoice) + '</td><td class="bill-math">' + invoiceTotalCell(invoice) + '</td><td>' + billStatus(invoice.status) + '</td><td class="ops-col-act">' + viewAct('#/billing/invoices/' + invoice.id) + '</td></tr>';
        });
        paintList(scope, rows, 9, query + '|' + field + '|' + selectedMonths.join(',') + '|' + selectedStatuses.join(','));
        var tags = [];
        if (raw) tags.push(searchTag(searchFieldLabel(field), raw));
        if (selectedMonths.length) tags.push(filterTag('month', 'Month', selectedMonths.map(function (value) { return optionLabel(monthOptions, value); })));
        if (selectedStatuses.length) tags.push(filterTag('status', 'Status', selectedStatuses.map(function (value) { return optionLabel(invoiceStatusOptions, value); })));
        var tagBox = scope.querySelector('#billInvoiceTags');
        tagBox.innerHTML = tags.join('');
        if (window.I18N && window.I18N.apply) window.I18N.apply(tagBox);
      }
      bindBillPager(scope, draw);
      scope.querySelector('#billInvoiceSearch').oninput = draw;
      scope.querySelector('#billInvoiceField').onchange = draw;
      bindMultiCheck(scope, 'billInvoiceMonth', 'All months', monthOptions, selectedMonths, draw, multiState);
      bindMultiCheck(scope, 'billInvoiceStatus', 'All statuses', invoiceStatusOptions, selectedStatuses, draw, multiState);
      scope.querySelector('#billInvoiceTags').onclick = function (event) {
        var pill = event.target.closest('[data-clear-bill]');
        if (!pill) return;
        var kind = pill.getAttribute('data-clear-bill');
        if (kind === 'keyword') scope.querySelector('#billInvoiceSearch').value = '';
        if (kind === 'month') selectedMonths.splice(0, selectedMonths.length);
        if (kind === 'status') selectedStatuses.splice(0, selectedStatuses.length);
        multiState.paintAll();
        draw();
      };
      bindFilterDismiss(scope, multiState);
      draw();
      setTimeout(function () { multiState.paintAll(); }, 0);
    });
  }
  function invoiceDetail(root, id) {
    var face = ui();
    var found = findInvoice(id);
    if (!found) {
      face.render(root, face.page('Invoice', '', '', '<div class="ops-empty"><strong>Invoice not found</strong></div>', '', invoiceBackTo), function (scope) {
        var page = scope.querySelector('.ops-page');
        if (page) page.classList.add('bill-invoice-page');
      });
      return;
    }
    var invoice = found.invoice;
    var account = found.account;
    var actions = '';
    if (invoice.status !== 'Paid') actions += '<button class="btn btn-default" id="billAdjust">Add adjustment</button>';
    if (invoice.status !== 'Paid' && invoice.totalCents > 0) actions += '<button class="btn btn-primary" id="billRecordPay">Record payment</button>';
    var covered = invoice.coveredCents || 0;
    var billable = invoice.volumeCents || 0;
    var body = '<div class="ops-kpi-grid ops-kpi-grid-4">' +
      invoiceKpi('Total', money(invoice.totalCents), invoice.month, 'total') +
      invoiceKpi('Volume', money(covered + billable), '', 'volume') +
      invoiceKpi('Volume inside allowance', money(covered), covered ? '' : (invoice.allowanceCents == null ? 'Unlimited' : 'Free allowance already used'), 'free') +
      invoiceKpi('Billable volume', money(billable), '', 'bill') +
      '</div>' +
      '<section class="ops-panel"><div class="ops-table-wrap"><table class="ops-table"><thead><tr><th>Description</th><th>Kind</th><th>Amount</th></tr></thead><tbody>' + lineRows(invoice.lines) + '</tbody></table></div></section>' +
      invoiceActivity(invoice.id);
    face.render(root, face.page(invoice.number, invoice.store + ' · ' + invoice.month, actions, body, '', invoiceBackTo), function (scope) {
      var page = scope.querySelector('.ops-page');
      if (page) page.classList.add('bill-invoice-page');
      var title = scope.querySelector('.ops-title');
      if (title) title.insertAdjacentHTML('afterend', billStatus(invoice.status));
      var pay = scope.querySelector('#billRecordPay');
      var adjust = scope.querySelector('#billAdjust');
      if (adjust) adjust.onclick = function () { openAdjustment(account, invoice, root, id); };
      bindActivityPager(scope, invoiceActivityRows(invoice.id), 'invoice:' + invoice.id);
      if (pay) pay.onclick = function () {
        face.confirmDialog('Record payment', 'Record a payment for this invoice? BestCheckout starts intercepting new checkouts again.', 'Record payment', function () {
          invoice.status = 'Paid';
          invoice.paidAt = 'Oct 22, 2026';
          account.failures = [];
          refreshStatus(account);
          remember('Recorded payment', account.storeId, '<span class="i18n-skip">' + esc(invoice.number + ' · ' + money(invoice.totalCents)) + '</span>', '', invoice.id);
          face.toast('Payment recorded.');
          invoiceDetail(root, id);
        });
      };
    });
  }

  function revenue(root) {
    rememberInvoiceBack('#/billing/revenue');
    resetBillPage();
    var face = ui();
    var seenMonths = {};
    var monthOptions = [];
    allInvoices().forEach(function (invoice) {
      if (!invoice.monthKey || seenMonths[invoice.monthKey]) return;
      seenMonths[invoice.monthKey] = true;
      monthOptions.push({ value: invoice.monthKey, label: invoice.monthKey });
    });
    monthOptions.sort(function (a, b) { return a.value < b.value ? 1 : (a.value > b.value ? -1 : 0); });
    var month = revenue.month || '2026-09';
    if (!monthOptions.some(function (opt) { return opt.value === month; })) month = (monthOptions[0] && monthOptions[0].value) || '2026-09';
    var rowList = [];
    var license = 0, commission = 0, adjustment = 0, received = 0, outstanding = 0;
    accounts.forEach(function (account) {
      var invoice = account.invoices.filter(function (item) { return item.monthKey === month; })[0];
      if (!invoice) return;
      var total = invoice.totalCents;
      var status = invoice.status;
      if (status === 'Paid') received += total;
      if (status === 'Past due' || status === 'Unpaid' || status === 'Charge failed') outstanding += total;
      var rowLicense = 0, rowCommission = 0;
      invoice.lines.forEach(function (line) {
        if (line.kind === 'License') { rowLicense += line.amountCents; license += line.amountCents; }
        if (line.kind === 'Commission') { rowCommission += line.amountCents; commission += line.amountCents; }
        if (line.kind === 'Adjustment') adjustment += line.amountCents;
      });
      var href = '#/billing/invoices/' + invoice.id;
      var platform = platformStore(account.storeId);
      var storeCell = platform ? billingStoreCell(platform) : nameCell(href, account.store, '');
      function moneyCell(cents) { return '<td class="i18n-skip">' + esc(money(cents)) + '</td>'; }
      rowList.push('<tr data-href="' + esc(href) + '"><td>' + storeCell + '</td>' + moneyCell(rowLicense) + moneyCell(rowCommission) + moneyCell(total) + '<td>' + billStatus(status) + '</td><td class="ops-col-act">' + viewAct(href) + '</td></tr>');
    });
    var total = license + commission + adjustment;
    var monthSelect = monthOptions.map(function (opt) {
      return '<option class="i18n-skip" value="' + esc(opt.value) + '">' + esc(opt.label) + '</option>';
    }).join('');
    var filters = '<div class="bill-revenue-filters"><span class="bill-revenue-filter-label">Month</span><select class="filter-select" data-ui-fit data-ui-match-width id="billRevenueMonth">' + monthSelect + '</select></div>';
    var summary = '<div class="ops-kpi-grid ops-kpi-grid-6 bill-revenue-kpis">' +
      invoiceKpi('License', money(license), '', 'license') +
      invoiceKpi('Commission', money(commission), '', 'commission') +
      invoiceKpi('Adjustments', money(adjustment), '', 'adjust') +
      invoiceKpi('Total', money(total), '', 'total') +
      invoiceKpi('Amount received', money(received), '', 'received') +
      invoiceKpi('Amount outstanding', money(outstanding), '', 'out') +
      '</div>';
    var table = '<table class="ops-table bill-revenue-table"><thead><tr><th>Store</th><th>License</th><th>Commission</th><th>Total</th><th>Status</th><th class="ops-col-act">Action</th></tr></thead><tbody></tbody></table>';
    var body = filters + summary + '<div class="ops-table-card"><div class="ops-table-wrap">' + table + '</div><div class="ops-table-foot"><span class="ops-table-total">Total 0 records</span><div class="pg" id="billPagination"></div></div></div>';
    face.render(root, face.page('Revenue', '', '', body), function (scope) {
      function draw() { paintList(scope, rowList, 6, 'revenue-' + month); }
      bindBillPager(scope, draw);
      draw();
      var select = scope.querySelector('#billRevenueMonth');
      select.value = month;
      select.onchange = function () { revenue.month = select.value; revenue(root); };
    });
  }

  function billingEmailHref(storeId, kind, invoiceId) {
    var href = location.pathname + location.search + '#/billing-email-preview?store=' + encodeURIComponent(storeId || '') + '&kind=' + encodeURIComponent(kind || 'nocard');
    if (invoiceId) href += '&invoice=' + encodeURIComponent(invoiceId);
    return href;
  }
  function merchantAdminOrigin() {
    return (location.hostname === '127.0.0.1' || location.hostname === 'localhost')
      ? 'http://127.0.0.1:4200'
      : 'https://zjc66666-pm.github.io/BestCheckout';
  }
  function merchantBillingHref(account, invoice, failed) {
    var hash = failed && invoice
      ? '#/settings/billing/invoices/' + encodeURIComponent(invoice.id)
      : '#/settings/billing';
    return merchantAdminOrigin() + '/app/?store=' + encodeURIComponent(account.store) + hash;
  }
  function billingEmailPreview(root, query) {
    var account = findAccount((query && query.store) || '');
    var invoice = account && query && query.invoice
      ? account.invoices.filter(function (item) { return item.id === query.invoice; })[0]
      : null;
    if (!invoice) invoice = account && account.invoices.filter(function (item) { return item.status !== 'Paid'; })[0];
    if (!account || !invoice) {
      root.innerHTML = '<div class="verification-email-page"><main class="verification-email-wrap"><p class="verification-email-context">Invoice email not found.</p></main></div>';
      return;
    }
    var kind = (query && query.kind) || '';
    var failed = kind === 'failed' || (!kind && account.failures && account.failures.length);
    var subject = failed ? 'We could not charge your BestCheckout invoice' : 'Add a card for your BestCheckout invoice';
    var context = failed
      ? 'Prototype-only · email sent because the card on file was declined.'
      : 'Prototype-only · email sent to the store owner on Oct 1 because no card was on file.';
    var reason = failed
      ? 'The card on file was declined, so it was not charged. Invoice <span class="i18n-skip">' + esc(invoice.number) + '.</span>'
      : 'No card was on file, so it was not charged. Invoice <span class="i18n-skip">' + esc(invoice.number) + '.</span>';
    var next = failed
      ? 'Pay within 7 days. After that, new checkouts use Shopify Checkout until this invoice is paid.'
      : 'Add a card and pay within 7 days. After that, new checkouts use Shopify Checkout until this invoice is paid.';
    var cta = failed ? 'Pay this invoice' : 'Add a card and pay';
    root.innerHTML =
      '<div class="verification-email-page">' +
        '<main class="verification-email-wrap">' +
          '<p class="verification-email-context">' + context + '</p>' +
          '<section class="verification-email-inbox" aria-label="Email metadata">' +
            '<p><span>From</span><b>BestCheckout</b> <small>&lt;no-reply@bestcheckout.com&gt;</small></p>' +
            '<p><span>To</span><b class="i18n-skip">' + esc(account.email) + '</b></p>' +
            '<p><span>Subject</span><b>' + esc(subject) + '</b></p>' +
          '</section>' +
          '<section class="verification-email-stage">' +
            '<article class="verification-email-card">' +
              '<div class="verification-email-bar"></div>' +
              '<header><div class="verification-email-brand"><img src="assets/bestcheckout-brand-mark.svg?v=20260908-bcmark1" alt="" aria-hidden="true"/><strong>BestCheckout</strong></div></header>' +
              '<main>' +
                '<h1>' + esc(subject) + '</h1>' +
                '<p class="verification-email-lead">The ' + esc(invoice.month) + ' invoice for ' + esc(account.store) + ' is ' + esc(money(invoice.totalCents)) + '.</p>' +
                '<p class="verification-email-lead">' + reason + '</p>' +
                '<p class="verification-email-lead">' + next + '</p>' +
                '<div class="connect-form-actions verification-email-install-actions"><a class="portal-submit" href="' + esc(merchantBillingHref(account, invoice, failed)) + '" target="_blank" rel="noopener">' + esc(cta) + '</a></div>' +
                '<p class="verification-email-note">Paying this invoice turns BestCheckout checkout back on.</p>' +
              '</main>' +
              '<footer><p>This is an automated message from BestCheckout — please don’t reply.</p><small>© 2026 BestCheckout</small></footer>' +
            '</article>' +
          '</section>' +
        '</main>' +
      '</div>';
    document.title = (window.I18N && window.I18N.t) ? window.I18N.t(subject) : subject;
    if (window.I18N && window.I18N.apply) window.I18N.apply(root);
  }
  window.SAAS_BILLING = { render: render, emailPreview: billingEmailPreview };

  if (window.I18N && window.I18N.extend) window.I18N.extend({
    'BestCheckout billing': 'BestCheckout 收费',
    'Monthly license, volume commission, and decline fees for BestCheckout stores.': 'BestCheckout 店铺的月费、成交佣金和拒付费。',
    'Starter, Growth, and Commerce Pro still control seats, flows, and domains. They do not set these fees.': '入门版、成长版和企业版仍然只管席位、购买流程和域名，不决定这些费用。',
    'Price book': '价目表',
    'October volume': '10 月成交额',
    'September invoice': '9 月账单',
    'Billing status': '收费状态',
    'Price books': '价目表',
    'Default for new stores': '新店默认',
    'Default': '默认',
    'Set as default': '设为默认',
    'This is the default price book': '默认价目表',
    'This price book is already the default. To change it, open another price book and check this box.': '这张已经是默认价目表。要更换，打开另一张价目表并勾选此项。',
    'Check this to make it the default. New stores will use it. Stores that already have a price book stay on it.': '勾选后，新开的店铺使用这张价目表。已经指定过价目表的店铺保持不变。',
    'New stores will use this price book. Stores that already have a price book stay on it.': '新开的店铺使用这张价目表。已经指定过价目表的店铺保持不变。',
    'New stores use this price book. Stores that already have a price book stay on it.': '新开的店铺使用这张价目表。已经指定过价目表的店铺保持不变。',
    'Default price book saved.': '默认价目表已保存。',
    'New BestCheckout stores use this price book.': '新开的 BestCheckout 店铺使用这张价目表。',
    'New BestCheckout stores use the default price book.': '新开的 BestCheckout 店铺默认使用“默认价目表”',
    'Only assigned stores use these rates.': '只有已指定的店铺使用这些费率。',
    'This store uses the default price book until someone assigns another.': '在单独指定之前，这家店使用默认价目表。',
    'Standard pricing and VIP pricing use the same fields.': '标准价和 VIP 价使用同一套字段。',
    'New price book': '新建价目表',
    'Add price book': '添加价目表',
    'New stores use the default price book. A store can switch price books.': '新开的店铺使用默认价目表。店铺支持切换价目表。',
    'A store can be moved onto this price book.': '店铺可以改用这张价目表。',
    'A named set of rates.': '一组费率。',
    'Created price book': '已新建价目表',
    'created this price book': '新建了这张价目表',
    'updated this price book': '更新了这张价目表',
    'Kind': '类型',
    'Monthly license': '月费',
    'Decline fee': '拒付费',
    'declined payments above': '笔拒付，超过',
    'Assigned stores': '使用店铺',
    'State': '状态',
    'Standard': '标准价',
    'VIP': '单独定价',
    'Past due': '逾期',
    'Charge failed': '扣款失败',
    'Issued invoice': '开出账单',
    'Emailed the owner': '邮件通知店主',
    'VIP partner credit': 'VIP 合作抵扣',
    'Courtesy credit': '合作优惠抵扣',
    'Manual surcharge': '手工补收',
    'Card declined': '银行卡扣款失败',
    'The card on file was declined when the invoice was issued. The owner was emailed on Oct 27.': '开账时银行卡扣款失败，已在 10 月 27 日邮件通知店主。',
    'We could not charge your BestCheckout invoice': '这张 BestCheckout 账单扣款失败',
    'Prototype-only · email sent because the card on file was declined.': '仅原型 · 开账时银行卡扣款失败，发给店主的邮件。',
    'The card on file was declined, so it was not charged. Invoice': '银行卡扣款失败，所以没有扣到款。账单',
    'Pay within 7 days. After that, new checkouts use Shopify Checkout until this invoice is paid.': '请在 7 天内付款。逾期后，新的结账会回到 Shopify Checkout，付清后恢复。',
    'Pay this invoice': '支付这张账单',
    'Not billed': '未计费',
    'Free allowance': '免费额度',
    'Remaining free allowance': '剩余免费额度',
    'The allowance carries across months.': '额度跨月累计，不按月重置。',
    'Unlimited': '不限额',
    'Used up. License starts the day after.': '额度已用完。月费从次日开始。',
    'Inside this amount, nothing is billed.': '这个金额以内不计费。',
    'Volume outside the allowance': '额度以外的成交额',
    'Summary lines, issued on November 1': '汇总行，11 月 1 日开账',
    'No card on file': '未绑定银行卡',
    'Bound card': '绑定银行卡',
    'Captured payments': '扣款成功的金额',
    'New checkouts use Shopify Checkout. The September invoice was unpaid for 7 days. Paying it turns interception back on.': '新的结账已回到 Shopify Checkout。9 月账单超过 7 天未付。付清后恢复拦截。',
    'The September invoice is unpaid. New checkouts fall back to Shopify Checkout after 7 days.': '9 月账单未支付。超过 7 天，新的结账回到 Shopify Checkout。',
    'Set a free capture allowance after the store is Active. This store is still': '店铺启用后再设置免费收单额度。这家店目前仍是',
    'Free capture allowance': '免费收单额度',
    'Free capture allowance (USD)': '免费收单额度（美元）',
    'Volume up to this amount is not billed. Stores use the price book amount, unless that store has its own.': '成交额不超过免费收单金额，不收费。店铺默认使用关联价目表的免费收单额度；支持为店铺设置专门的免费收单额度，设置后以店铺设置的免费收单额度为准。',
    'Stores on this price book start here': '使用这张价目表的店铺默认从这里开始',
    'Enter an allowance of 0 or more, or choose unlimited.': '填写 0 或以上的额度，或选择不限额。',
    'From the price book.': '来自价目表。',
    'Set on this store.': '这家店单独设置。',
    'Allowance': '额度',
    'Use the price book': '使用价目表额度',
    'Custom amount': '填写金额',
    'The price book allowance is': '价目表上的免费额度是',
    'This store is still opening.': '这家店目前仍是开通中。',
    'Rates come from the default price book.': '费率使用默认价目表。',
    'The starting free allowance is': '初始免费额度为',
    'It uses the default price book, including that price book’s free allowance, until someone assigns another.': '在单独指定之前，这家店使用默认价目表，免费额度也用价目表上的。',
    'Save allowance': '保存额度',
    'Free allowance saved.': '免费额度已保存。',
    'Record a payment for this invoice? BestCheckout starts intercepting new checkouts again.': '记下这笔收款？BestCheckout 会重新拦截新的结账。',
    'No card was on file when the invoice was issued. The owner was emailed on Oct 1.': '开账时没有银行卡，已在 10 月 1 日邮件通知店主。',
    'Add a card for your BestCheckout invoice': '请为这张 BestCheckout 账单绑定银行卡',
    'Prototype-only · email sent to the store owner on Oct 1 because no card was on file.': '仅原型 · 开账时没有银行卡，于 10 月 1 日发给店主的邮件。',
    'No card was on file, so it was not charged. Invoice': '开账时没有银行卡，所以没有扣款。账单',
    'Add a card and pay within 7 days. After that, new checkouts use Shopify Checkout until this invoice is paid.': '请在 7 天内绑定银行卡并付款。逾期后，新的结账会回到 Shopify Checkout，付清后恢复。',
    'Add a card and pay': '绑定银行卡并付款',
    'Paying this invoice turns BestCheckout checkout back on.': '付清这张账单后，BestCheckout 会重新拦截结账。',
    'Invoice email not found.': '没有找到这封账单邮件。',
    'Current': '正常',
    'Suspended': '已停用',
    'Not started': '未开始',
    'Store billing': '店铺收费',
    'Invoices': '账单',
    'Revenue': '收入',
    'Price book not found': '没有找到价目表',
    'A new version is scheduled for November 2026. October estimates still use the rates below.': '新版本计划于 2026 年 11 月生效。10 月预估仍使用下面的费率。',
    'Review the scheduled version': '查看已排期的版本',
    'A new version is scheduled for November 2026. These fields show that version. October estimates still use the current rates.': '已排期 2026 年 11 月生效的新版本。下面这些字段是那个版本。10 月预计仍用当前费率。',
    'Charged for an active store': '店铺在该月为启用状态即收取',
    'Not charged': '不收取',
    'Pooling on': '已开启',
    'Pooling off': '未开启',
    'Active stores in the organization are added together': '组织内启用中的店铺合并计算',
    'Each store is rated alone': '每家店单独计算',
    'Volume pooling': '用量合并',
    'Standard pricing is half of CheckoutChamp: a $150 monthly license, marginal rates of 0.5%, 0.4%, 0.325%, and 0.25%, and $0.025 per declined payment above a 20% decline rate.': '标准价是 CheckoutChamp 的一半：月费 $150，超额累进费率 0.5%、0.4%、0.325%、0.25%，拒付率超过 20% 后每笔拒付 $0.025。',
    'Rates': '费率',
    'Up to': '不超过',
    'Above': '超过',
    'Each rate applies only to the volume inside that band.': '每一档费率只用于该档内的成交额。',
    'Each rate applies only to the volume inside that band. Issued invoices keep the rates they were issued with.': '每一档费率只用于该档内的成交额。已开出的账单保持开出时的费率。',
    'Volume': '成交额',
    'Volume inside allowance': '额度内成交额',
    'Billable volume': '计费成交额',
    'Free allowance already used': '免费额度已用完',
    'Billable': '计费',
    'Adjustment': '调账',
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
    'A named set of rates. Only assigned stores use this price book.': '一组费率。只有绑定的店铺使用这张价目表。',
    'For example: Folast VIP': '例如：Folast VIP',
    'Charged for each month the store is Active, including a month with no captured payments.': '店铺在该月为启用状态就收取，当月没有成交也收取。',
    'Processing commission': '成交佣金',
    'Band': '档位',
    'First band': '第一档',
    'Second band': '第二档',
    'Third band': '第三档',
    'Above the last band': '超过最后一档',
    'No upper limit': '没有上限',
    'Charged only on gateway declines above the threshold.': '只对超过门槛的网关拒付收取。',
    'Effective date': '生效设置',
    'Up to (USD)': '不超过（美元）',
    'Up to and including (USD)': '不超过，含本数（美元）',
    'The amount you enter is included in that band. Above it, the whole month uses the next rate.': '填写的金额算在这一档里。超过这个金额，整月按下一档费率计。',
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
    'Estimated commission': '预计佣金',
    'Decline rate': '拒付率',
    'Under the threshold': '未超过门槛',
    'Issued on November 1': '11 月 1 日开账单',
    'This store is rated on its own volume.': '这家店按自己的成交额计费。',
    'This store is rated on its own volume. The month uses one rate.': '这家店按自己的成交额计费。当月只套一档费率。',
    'The month\'s volume picks one rate. That rate applies to the whole volume outside the free capture allowance.': '当月成交额落在哪一档，免费收单额度以外的成交额整段按这一档费率计。',
    ', up to': '，不超过',
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
    'Note': '备注',
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
    'Activity': '操作日志',
    'Time': '时间',
    'Operator': '操作人',
    'Set free allowance': '设置免费额度',
    'Assigned price book': '更换价目表',
    'Associated price book': '关联价目表',
    'Added credit': '添加抵扣',
    'Marked as paid': '记为已付款',
    'Recorded payment': '登记收款',
    'Updated price book': '更新价目表',
    'from October 2026': '从 2026 年 10 月起',
    'from November 2026': '从 2026 年 11 月起',
    'Effective October 2026': '2026 年 10 月生效',
    'Effective November 2026': '2026 年 11 月生效',
    'Add adjustment': '添加调账',
    'Amount (USD)': '金额（美元）',
    'Why this amount is credited or charged': '为什么抵扣或补收这笔金额',
    'Enter an amount other than 0.': '请输入不是 0 的金额。',
    'Adjust this invoice': '调整这张账单',
    'Adjustment added to this invoice.': '调账已加到这张账单。',
    'Credit': '抵扣',
    'Added charge': '补收',
    'Volume commission': '成交佣金',
    'Launch credit': '开通抵扣',
    'One-time launch credit': '一次性开通抵扣',
    'All statuses': '全部状态',
    'All months': '全部月份',
    'All price books': '全部价目表',
    'All billing statuses': '全部收费状态',
    'All kinds': '全部类型',
    'No records in this view.': '这个视图里没有记录。',
    'No invoices in this view.': '这个视图里没有账单。',
    'One invoice covers one store and one calendar month.': '一张账单对应一家店的一个自然月。',
    'Invoice not found': '没有找到账单',
    'Record payment': '登记收款',
    'Record a payment for this invoice? The account returns to current. Checkout was not turned off.': '登记这张账单已收款？账户会恢复正常。结账没有被关掉。',
    'Payment recorded.': '已登记收款。',
    'License': '月费',
    'Commission': '佣金',
    'Decline': '拒付费',
    'Decline fees': '拒付费',
    'Adjustments': '调账',
    'Estimate': '预估',
    'Not invoiced yet': '尚未出账',
    'Outstanding': '未收',
    'Amount received': '已到账金额',
    'Amount outstanding': '未到账金额',
    'Issued September invoices.': '已开出的 9 月账单。',
    'October is still open. These amounts change if a VIP rate or an adjustment changes.': '10 月尚未结束。VIP 费率或调账变化后，这些金额会跟着变。',
    'October 2026 estimate': '2026 年 10 月预估',
    'The next rate, 0.4%, starts after $1,000,000.': '下一档 0.4% 从 $1,000,000 之后开始。',
    'The next rate, 0.25%, starts after $3,000,000.': '下一档 0.25% 从 $3,000,000 之后开始。',
    'This month is in the top rate.': '本月已经用到最高档费率。',
    'Add band': '增加档位'
  });
  if (window.I18N && window.I18N.addRules) {
    window.I18N.addRules([{
      re: /^The (.+) invoice for (.+) is (.+)\.$/,
      zh: function (match) { return match[2] + ' 的 ' + match[1] + ' 账单金额为 ' + match[3] + '。'; }
    }]);
  }
  if (window.I18N && window.I18N.addRules) {
    window.I18N.addRules([{
      re: /^Band (\d+)$/,
      zh: function (match) {
        var n = Number(match[1]);
        var digit = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        var word = String(n);
        if (n > 0 && n < 10) word = digit[n];
        else if (n === 10) word = '十';
        else if (n < 20) word = '十' + digit[n - 10];
        else if (n < 100) word = digit[Math.floor(n / 10)] + '十' + (n % 10 ? digit[n % 10] : '');
        return '第' + word + '档';
      }
    }]);
  }
  if ((location.hash || '').indexOf('#/billing-email-preview') === 0 && window.SAAS_BILLING) {
    var previewApp = document.getElementById('app');
    var previewQuery = {};
    var previewRaw = location.hash.replace(/^#\/?/, '');
    var previewQi = previewRaw.indexOf('?');
    if (previewQi >= 0) {
      previewRaw.slice(previewQi + 1).split('&').forEach(function (pair) {
        if (!pair) return;
        var eq = pair.indexOf('=');
        var key = decodeURIComponent((eq >= 0 ? pair.slice(0, eq) : pair).replace(/\+/g, ' '));
        var val = decodeURIComponent((eq >= 0 ? pair.slice(eq + 1) : '').replace(/\+/g, ' '));
        if (key) previewQuery[key] = val;
      });
    }
    if (previewApp && !previewApp.querySelector('.verification-email-page')) {
      document.body.classList.add('is-email-preview');
      previewApp.className = '';
      billingEmailPreview(previewApp, previewQuery);
    }
  }
})();
