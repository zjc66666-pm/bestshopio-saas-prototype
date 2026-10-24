/* Page speed — operator view of real-visitor Core Web Vitals.
   Collection stays in the speed service. This console shows BestCheckout
   hosted checkout and the BestShopio storefront, cut by page type and store. */
(function () {
  'use strict';

  var query = { product: 'bestshopio', range: '30d', country: 'all', device: 'all', store: 'all', url: '', keyword: '', compare: 'previous', compareStart: '', compareEnd: '', openCompare: false };
  var pageOrder = { home: 1, collection: 2, product: 3, blog: 4, cart: 5, checkout: 6, upsell: 7, downsell: 8, thankyou: 9 };
  var bands = { LCP: [2500, 4000], INP: [200, 500], CLS: [0.1, 0.25], FCP: [1800, 3000], TTFB: [800, 1800] };
  var rank = { poor: 3, ni: 2, good: 1 };
  var rangeFactor = { '24h': 0.16, '7d': 1, '30d': 4.2, '90d': 11 };
  var metricOrder = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];

  function data() { return ((window.DATA || {}).platformCenter || {}).pageSpeed || { urls: [] }; }
  function pc() { return window.PC || {}; }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function icon(name, size) {
    var core = pc();
    return core.ico && core.P && core.P[name] ? core.ico(core.P[name], size || 16) : '';
  }
  function apply(root) { if (window.I18N && window.I18N.apply) window.I18N.apply(root); }
  function num(value) { return Math.round(value).toLocaleString('en-US'); }
  function productName(id) { return id === 'bestcheckout' ? 'BestCheckout' : 'BestShopio'; }
  function samplesOf(row) {
    var orderPage = row.pageId === 'checkout' || row.pageId === 'upsell' || row.pageId === 'downsell' || row.pageId === 'thankyou';
    // One of these URLs is one order. Reopening it stays within 10 visits, on every time range.
    if (orderPage) return Math.max(0, Math.min(10, Math.round(row.samples)));
    return Math.max(0, Math.round(row.samples * (rangeFactor[query.range] || 1)));
  }

  function rateOne(name, value) {
    var band = bands[name];
    if (!band || value == null || !isFinite(value)) return 'good';
    if (value <= band[0]) return 'good';
    if (value <= band[1]) return 'ni';
    return 'poor';
  }
  function worst(keys) {
    return keys.reduce(function (best, key) { return rank[key] > rank[best] ? key : best; }, 'good');
  }
  function formatMetric(name, value) {
    if (value == null || !isFinite(value)) return '—';
    if (name === 'CLS') return (Math.round(value * 100) / 100).toFixed(2);
    if (name === 'INP' || name === 'TTFB') return Math.round(value) + ' ms';
    return (value / 1000).toFixed(2) + ' s';
  }
  function ratingMeta(key) {
    return ({
      good: ['Good', 'ok'],
      ni: ['Needs improvement', 'warn'],
      poor: ['Poor', 'danger'],
      insufficient: ['Insufficient samples', 'muted']
    })[key] || ['Insufficient samples', 'muted'];
  }
  function pill(label, tone) {
    return '<span class="ops-status ' + tone + '"><i></i>' + esc(label) + '</span>';
  }
  function ratingPill(key) {
    var meta = ratingMeta(key);
    return pill(meta[0], meta[1]);
  }

  function filtered(opts) {
    opts = opts || {};
    return (data().urls || []).filter(function (row) {
      if (query.product !== 'all' && row.product !== query.product) return false;
      if (query.country !== 'all' && row.country !== query.country) return false;
      if (query.device !== 'all' && row.device !== query.device) return false;
      if (!opts.ignoreStore && query.store !== 'all' && row.storeId !== query.store) return false;
      return samplesOf(row) > 0;
    });
  }
  function summarize(list, name) {
    var field = name.toLowerCase();
    var total = 0;
    var acc = 0;
    list.forEach(function (row) {
      var count = samplesOf(row);
      if (!count || row[field] == null) return;
      total += count;
      acc += row[field] * count;
    });
    if (!total) return { samples: 0, insufficient: true };
    var value = acc / total;
    return { value: value, samples: total, rating: rateOne(name, value) };
  }
  function groupPages(list) {
    var groups = {};
    list.forEach(function (row) {
      var key = row.product + '/' + row.pageId;
      if (!groups[key]) groups[key] = { key: key, product: row.product, surface: row.surface, pageId: row.pageId, pageType: row.pageType, rows: [] };
      groups[key].rows.push(row);
    });
    return Object.keys(groups).map(function (key) { return groups[key]; }).sort(function (a, b) {
      return (pageOrder[a.pageId] || 99) - (pageOrder[b.pageId] || 99);
    });
  }
  function pageCatalog() {
    var seen = {};
    var pages = [];
    (data().urls || []).forEach(function (row) {
      if (row.product !== query.product || seen[row.pageId]) return;
      seen[row.pageId] = true;
      pages.push({ pageId: row.pageId, pageType: row.pageType, product: row.product });
    });
    pages.sort(function (a, b) { return (pageOrder[a.pageId] || 99) - (pageOrder[b.pageId] || 99); });
    return pages;
  }
  function metricCell(summary, name, rows) {
    if (!summary || summary.insufficient) return '<span class="ops-meta">—</span>';
    var previous = comparedValue(summary, rows, name);
    var delta = previous == null ? '' : '<span class="ops-speed-delta ' + deltaTone(summary.value, previous) + '" title="' + esc(compareName()) + '">' + esc(formatDelta(name, summary.value, previous)) + '</span>';
    return '<div class="ops-speed-metric"><span>' + esc(formatMetric(name, summary.value)) + '</span>' + delta + '</div>';
  }
  function empty(title, copy) {
    return '<div class="ops-empty"><strong>' + esc(title) + '</strong><p>' + esc(copy) + '</p></div>';
  }
  function note(copy) { return '<div class="ops-note">' + esc(copy) + '</div>'; }
  var metricGuideKey = 'bsio_speed_metric_guide_collapsed';
  var metricGuideCollapsed = false;
  try { metricGuideCollapsed = window.localStorage.getItem(metricGuideKey) === '1'; } catch (err) { metricGuideCollapsed = false; }
  function setMetricGuideCollapsed(value) {
    metricGuideCollapsed = !!value;
    try { window.localStorage.setItem(metricGuideKey, metricGuideCollapsed ? '1' : '0'); } catch (err) { /* Keep the guide usable when storage is unavailable. */ }
  }
  function metricGuideCard(name, title, copy) {
    return '<article class="attribution-guide-step"><div class="speed-metric-name"><span class="attribution-guide-step-number">' + esc(name) + '</span><h3>' + esc(title) + '</h3></div><p>' + esc(copy) + '</p></article>';
  }
  function metricGuide() {
    var details = '<div class="attribution-guide-details"><p class="speed-metric-lead">Average from real visitors. A higher number is worse. Experience uses the worst of LCP, INP and CLS.</p><div class="attribution-guide-flow">' +
      metricGuideCard('LCP', 'Largest content', 'Largest visible element. Good at 2.5 s or faster, needs improvement until 4 s.') +
      metricGuideCard('INP', 'Interaction response', 'Response after a tap or click. Good at 200 ms or faster, needs improvement until 500 ms.') +
      metricGuideCard('CLS', 'Visual stability', 'How far the page shifts. Not a time. Good at 0.10 or lower, needs improvement until 0.25.') +
      metricGuideCard('FCP', 'First content', 'First text or image. Good at 1.8 s or faster, needs improvement until 3 s.') +
      metricGuideCard('TTFB', 'Server response', 'First byte from the server. Good at 800 ms or faster, needs improvement until 1.8 s.') +
      '</div></div>';
    var toggle = '<button type="button" class="attribution-guide-toggle" id="spdMetricGuide" aria-expanded="' + (!metricGuideCollapsed) + '"><span>' + (metricGuideCollapsed ? 'Expand guide' : 'Collapse guide') + '</span><span class="attribution-guide-toggle-caret" aria-hidden="true">' + (metricGuideCollapsed ? '&#9662;' : '&#9652;') + '</span></button>';
    var top = metricGuideCollapsed
      ? '<div class="attribution-guide-collapsed-copy"><strong>Metric guide</strong><span>What LCP, INP, CLS, FCP and TTFB mean.</span></div>'
      : '<div class="attribution-guide-kicker">How to read page speed</div>';
    return '<section class="panel card-pad attribution-guide speed-metric-guide' + (metricGuideCollapsed ? ' is-collapsed' : '') + '"><div class="attribution-guide-topline">' + top + toggle + '</div>' + (metricGuideCollapsed ? '' : details) + '</section>';
  }
  function useProduct(id) {
    if (id !== 'bestshopio' && id !== 'bestcheckout') id = 'bestshopio';
    if (query.product === id) return;
    query.store = 'all';
    query.url = '';
    query.keyword = '';
    query.product = id;
  }
  function productTabs(section) {
    var items = [['bestshopio', 'BestShopio'], ['bestcheckout', 'BestCheckout']];
    return '<nav class="tabs">' + items.map(function (item) {
      var href = '#/speed/' + item[0] + (section ? '/' + section : '');
      return '<a class="tab' + (query.product === item[0] ? ' active' : '') + '" href="' + href + '">' + item[1] + '</a>';
    }).join('') + '</nav>';
  }
  function chrome(section) { return productTabs(section); }
  function select(id, options, value) {
    return '<select class="ops-select filter-select" id="' + id + '" data-ui-fit data-ui-match-width>' + options.map(function (option) {
      return '<option value="' + esc(option[0]) + '"' + (option[0] === value ? ' selected' : '') + '>' + esc(option[1]) + '</option>';
    }).join('') + '</select>';
  }
  function storeOptions(allProducts) {
    var seen = {};
    var options = [['all', 'All stores']];
    (data().urls || []).forEach(function (row) {
      if (!allProducts && row.product !== query.product) return;
      if (seen[row.storeId]) return;
      seen[row.storeId] = true;
      options.push([row.storeId, row.store]);
    });
    if (query.store !== 'all' && !seen[query.store]) query.store = 'all';
    return options;
  }
  function rangeOptions() {
    return [['24h', 'Last 24 hours'], ['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['90d', 'Last 90 days']];
  }
  function compareOptions() {
    return [['none', 'No comparison'], ['previous', 'Previous period'], ['custom', 'Custom']];
  }
  function pad2(value) { return value < 10 ? '0' + value : String(value); }
  function ymd(date) { return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()); }
  function rangeLength() {
    return { '24h': 1, '7d': 7, '30d': 30, '90d': 90 }[query.range] || 7;
  }
  function ensureCustomRange() {
    if (query.compareStart && query.compareEnd) return;
    var end = new Date(2026, 9, 21);
    var length = rangeLength();
    end.setDate(end.getDate() - length);
    var start = new Date(end);
    start.setDate(start.getDate() - (length - 1));
    query.compareStart = ymd(start);
    query.compareEnd = ymd(end);
  }
  function compareControl() {
    if (!query.compare || query.compare === 'year') query.compare = 'previous';
    var html = select('spdCompare', compareOptions(), query.compare);
    if (query.compare !== 'custom') return html;
    ensureCustomRange();
    return html + '<div class="ui-range ops-speed-compare-range" data-ui-range data-ph="Comparison date range">' +
      '<input type="hidden" id="spdCompareStart" data-range="start" value="' + esc(query.compareStart) + '"/>' +
      '<input type="hidden" id="spdCompareEnd" data-range="end" value="' + esc(query.compareEnd) + '"/>' +
      '</div>';
  }
  function filterBar(allProducts, opts) {
    opts = opts || {};
    return '<div class="ops-toolbar ops-speed-toolbar">' +
      select('spdRange', rangeOptions(), query.range) +
      compareControl() +
      select('spdCountry', [['all', 'All countries'], ['United States', 'United States'], ['United Kingdom', 'United Kingdom'], ['Germany', 'Germany'], ['Japan', 'Japan'], ['Australia', 'Australia']], query.country) +
      select('spdDevice', [['all', 'All devices'], ['Mobile', 'Mobile'], ['Desktop', 'Desktop'], ['Tablet', 'Tablet']], query.device) +
      (opts.hideStore ? '' : select('spdStore', storeOptions(allProducts), query.store)) +
      '</div>';
  }
  function bindFilters(scope, redraw) {
    var fields = { spdProduct: 'product', spdRange: 'range', spdCompare: 'compare', spdCountry: 'country', spdDevice: 'device', spdStore: 'store' };
    Object.keys(fields).forEach(function (id) {
      var el = scope.querySelector('#' + id);
      if (!el) return;
      el.value = query[fields[id]];
      el.onchange = function () {
        var previousCompare = query.compare;
        Object.keys(fields).forEach(function (key) {
          var node = scope.querySelector('#' + key);
          if (node) query[fields[key]] = node.value;
        });
        if (query.compare === 'custom' && previousCompare !== 'custom') {
          query.compareStart = '';
          query.compareEnd = '';
          query.openCompare = true;
        }
        redraw();
        if (!query.openCompare) return;
        query.openCompare = false;
        setTimeout(function () {
          var box = document.querySelector('.ops-speed-compare-range');
          if (box) box.click();
        }, 60);
      };
    });
    var compareEnd = scope.querySelector('#spdCompareEnd');
    if (compareEnd) compareEnd.onchange = function () {
      var compareStart = scope.querySelector('#spdCompareStart');
      query.compareStart = compareStart ? compareStart.value : '';
      query.compareEnd = compareEnd.value;
      redraw();
    };
  }
  function freshness() {
    var time = data().updatedAt || '';
    if (!time) return '';
    return '<div class="ops-speed-fresh"><button type="button" class="ops-speed-refresh" id="spdRefresh" aria-label="Refresh" title="Refresh">' + icon('refresh', 15) + '</button><span class="ops-meta">Updated ' + esc(time) + '</span></div>';
  }
  function bindRefresh(scope, redraw) {
    var button = scope.querySelector('#spdRefresh');
    if (!button) return;
    button.onclick = function () {
      if (button.disabled) return;
      button.disabled = true;
      button.classList.add('is-busy');
      setTimeout(redraw, 420);
    };
  }
  function shell(title, sub, actions, body, backHref, rawTitle) {
    var heading = rawTitle ? title : esc(title);
    var titleBlock = '<div class="ops-page-title-block"><h1 class="ops-title page-title' + (rawTitle ? ' ops-speed-identity' : '') + '">' + heading + '</h1>' + (sub ? '<div class="ops-sub">' + sub + '</div>' : '') + '</div>';
    var titleRow = backHref
      ? '<div class="ops-page-title-row"><a class="back-btn" href="' + esc(backHref) + '" title="Back" aria-label="Back">' + icon('arrowLeft', 18) + '</a>' + titleBlock + '</div>'
      : titleBlock;
    return '<section class="ops-page ops-page-speed"><header class="ops-page-head"><div>' + titleRow + '</div>' +
      (actions ? '<div class="ops-head-actions">' + actions + '</div>' : '') + '</header>' + body + '</section>';
  }
  function render(root, html, bind) {
    root.innerHTML = html;
    if (bind) bind(root);
    apply(root);
    // Fit the closed filters before the browser paints. Otherwise the native
    // select shows for one frame at the selected label's width, then snaps to
    // the longest option.
    if (window.UI && window.UI.scan) window.UI.scan(root);
  }
  function hashText(value) {
    var hash = 0;
    var text = String(value || '');
    for (var i = 0; i < text.length; i++) hash = (hash * 33 + text.charCodeAt(i)) >>> 0;
    return hash;
  }
  function protoEnd() { return new Date(2026, 9, 21, 15, 0, 0); }
  function parseYmd(value) {
    var parts = String(value || '').split('-');
    if (parts.length !== 3) return null;
    var date = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return isNaN(date.getTime()) ? null : date;
  }
  function addDays(date, days) {
    var next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    next.setDate(next.getDate() + days);
    return next;
  }
  function dayName(date) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate();
  }
  function currentPointCount() {
    return query.range === '24h' ? 12 : rangeLength();
  }
  function comparePointCount() {
    if (query.compare === 'none') return 0;
    if (query.compare === 'custom') {
      var start = parseYmd(query.compareStart);
      var end = parseYmd(query.compareEnd);
      if (start && end && end >= start) return Math.round((end - start) / 86400000) + 1;
    }
    return currentPointCount();
  }
  function seriesStart(count, hourly) {
    if (hourly) return new Date(protoEnd().getTime() - (count - 1) * 2 * 3600000);
    return addDays(protoEnd(), -(count - 1));
  }
  function seriesLabel(start, index, hourly) {
    if (!hourly) return dayName(addDays(start, index));
    var hour = new Date(start.getTime() + index * 2 * 3600000);
    return pad2(hour.getHours()) + ':00';
  }
  function shapeSeries(count, start, hourly, level, seed, name) {
    var labels = [];
    var values = [];
    for (var i = 0; i < count; i++) {
      var phase = i / Math.max(count - 1, 1);
      var wave = Math.sin((seed % 7) * 0.5 + phase * 2.6) * 0.05 + Math.sin(phase * 9) * 0.012;
      var noise = ((hashText(name + ':' + i + ':' + seed) % 100) - 50) / 20000;
      labels.push(seriesLabel(start, i, hourly));
      values.push(1 + wave + noise);
    }
    var last = values[values.length - 1] || 1;
    values = values.map(function (factor) { return level * factor / last; });
    return { labels: labels, values: values };
  }
  function compareName() {
    if (query.compare === 'custom') return (query.compareStart && query.compareEnd) ? (query.compareStart + ' → ' + query.compareEnd) : 'Custom comparison';
    return 'Previous period';
  }
  function compareRatio(rows, name) {
    if (query.compare === 'none') return null;
    var seed = hashText(query.compare + '|' + (query.compareStart || '') + '|' + (query.compareEnd || '') + '|' + name + '|' + rows.map(function (row) {
      return (row.pageId || '') + (row.storeId || '') + (row.url || '');
    }).join(','));
    var swing = query.compare === 'custom' ? 0.12 : 0.08;
    return 1 + (((seed % 200) - 100) / 100) * swing;
  }
  function comparedValue(summary, rows, name) {
    if (!summary || summary.insufficient || query.compare === 'none') return null;
    return summary.value * compareRatio(rows, name);
  }
  function deltaTone(current, previous) {
    var diff = current - previous;
    var scale = Math.max(Math.abs(previous), 1);
    if (Math.abs(diff) / scale < 0.005) return 'flat';
    return diff > 0 ? 'worse' : 'better';
  }
  function formatDelta(name, current, previous) {
    var diff = current - previous;
    var sign = diff > 0 ? '+' : (diff < 0 ? '−' : '');
    var abs = Math.abs(diff);
    if (name === 'CLS') return sign + abs.toFixed(2);
    if (name === 'INP' || name === 'TTFB') return sign + Math.round(abs) + ' ms';
    return sign + (abs / 1000).toFixed(2) + ' s';
  }
  function trendCaption() {
    if (query.compare === 'none') return 'Average across the selected range.';
    if (query.compare === 'custom') return 'Solid line is this period. Dashed line is the custom comparison.';
    return 'Solid line is this period. Dashed line is the previous period.';
  }
  function trendSeries(name, rows) {
    var summary = summarize(rows, name);
    var labels = [];
    var values = [];
    var compareValues = [];
    var previous = comparedValue(summary, rows, name);
    if (summary.insufficient) return { summary: summary, labels: labels, values: values, compareValues: compareValues, previous: null };
    var currentCount = currentPointCount();
    var otherCount = previous == null ? 0 : comparePointCount();
    var hourly = query.range === '24h' && otherCount <= currentCount;
    var seed = hashText((rows[0] && rows[0].product || query.product) + '|' + name + '|' + rows.map(function (row) { return row.pageId + row.url; }).join(','));
    var current = shapeSeries(currentCount, seriesStart(currentCount, query.range === '24h'), query.range === '24h', summary.value, seed, name);
    var compared = { labels: [], values: [] };
    if (otherCount) {
      var compareHourly = hourly;
      var compareStart = compareHourly
        ? new Date(seriesStart(currentCount, true).getTime() - currentCount * 2 * 3600000)
        : (query.compare === 'custom' && parseYmd(query.compareStart) ? parseYmd(query.compareStart) : addDays(seriesStart(currentCount, false), -otherCount));
      compared = shapeSeries(otherCount, compareStart, compareHourly, previous, seed + 17, 'c:' + name);
    }
    var axis = compared.labels.length > current.labels.length ? compared.labels : current.labels;
    return { summary: summary, labels: axis, values: current.values, compareValues: compared.values, currentLabels: current.labels, compareLabels: compared.labels, previous: previous };
  }
  function linePoints(values, min, max, width, height, pad) {
    return values.map(function (value, index) {
      var x = pad + (values.length === 1 ? 0 : index / (values.length - 1)) * (width - pad * 2);
      var y = pad + (1 - (value - min) / (max - min)) * (height - pad * 2);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
  }
  function chartBounds(values, compareValues) {
    var all = values.concat(compareValues || []).filter(function (value) { return isFinite(value); });
    if (!all.length) return null;
    var min = Math.min.apply(null, all);
    var max = Math.max.apply(null, all);
    if (max === min) {
      var bump = (min || 1) * 0.08;
      max = min + bump;
      min = Math.max(0, min - bump);
    }
    var span = max - min || 1;
    return { min: Math.max(0, min - span * 0.16), max: max + span * 0.14 };
  }
  function chartPoints(values, bounds, frame) {
    var innerW = frame.w - frame.l - frame.r;
    var innerH = frame.h - frame.t - frame.b;
    var span = bounds.max - bounds.min || 1;
    return values.map(function (value, index) {
      var x = frame.l + (values.length === 1 ? innerW / 2 : (index / (values.length - 1)) * innerW);
      var y = frame.t + (1 - (value - bounds.min) / span) * innerH;
      return { x: x, y: y };
    });
  }
  function curveCommands(points) {
    var d = '';
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[Math.max(i - 1, 0)];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[Math.min(i + 2, points.length - 1)];
      var c1x = p1.x + (p2.x - p0.x) / 6;
      var c1y = p1.y + (p2.y - p0.y) / 6;
      var c2x = p2.x - (p3.x - p1.x) / 6;
      var c2y = p2.y - (p3.y - p1.y) / 6;
      d += ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2.x.toFixed(1) + ' ' + p2.y.toFixed(1);
    }
    return d;
  }
  function linePath(points) {
    if (!points.length) return '';
    return 'M ' + points[0].x.toFixed(1) + ' ' + points[0].y.toFixed(1) + curveCommands(points);
  }
  function areaPath(points, frame) {
    if (!points.length) return '';
    var base = (frame.h - frame.b).toFixed(1);
    var last = points[points.length - 1];
    return 'M ' + points[0].x.toFixed(1) + ' ' + base + ' L ' + points[0].x.toFixed(1) + ' ' + points[0].y.toFixed(1) + curveCommands(points) + ' L ' + last.x.toFixed(1) + ' ' + base + ' Z';
  }
  function chartPointsAligned(values, bounds, frame, axisCount) {
    var innerW = frame.w - frame.l - frame.r;
    var innerH = frame.h - frame.t - frame.b;
    var span = bounds.max - bounds.min || 1;
    var slots = Math.max(axisCount, 1);
    return values.map(function (value, index) {
      var x = frame.l + (slots === 1 ? innerW / 2 : (index / (slots - 1)) * innerW);
      var y = frame.t + (1 - (value - bounds.min) / span) * innerH;
      return { x: x, y: y };
    });
  }
  function axisLabelIndexes(count) {
    var maxLabels = Math.max(3, Math.floor(300 / 52));
    var step = count <= maxLabels ? 1 : Math.ceil(count / maxLabels);
    var indexes = [];
    for (var i = 0; i < count; i += step) indexes.push(i);
    if (indexes[indexes.length - 1] !== count - 1) {
      if (count - 1 - indexes[indexes.length - 1] < step * 0.6) indexes.pop();
      indexes.push(count - 1);
    }
    return indexes;
  }
  function chartSvg(series, name, mode) {
    var values = series.values || [];
    if (!values.length) return '';
    var compare = series.compareValues || [];
    var bounds = chartBounds(values, compare);
    if (!bounds) return '';
    var spark = mode === 'spark';
    var frame = spark
      ? { w: 120, h: 40, l: 2, r: 2, t: 4, b: 4 }
      : { w: 640, h: 168, l: 2, r: 2, t: 10, b: 8 };
    var axisCount = Math.max(values.length, compare.length, (series.labels || []).length);
    var current = spark ? chartPoints(values, bounds, frame) : chartPointsAligned(values, bounds, frame, axisCount);
    var previous = compare.length ? (spark ? chartPoints(compare, bounds, frame) : chartPointsAligned(compare, bounds, frame, axisCount)) : [];
    var gid = 'spd' + (spark ? 'k' : 'a') + name;
    var html = '<svg class="' + (spark ? 'ops-speed-sparkline' : 'ops-speed-area') + '" viewBox="0 0 ' + frame.w + ' ' + frame.h + '" role="img" aria-hidden="true">';
    html += '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2f6fed" stop-opacity="0.28"/><stop offset="100%" stop-color="#2f6fed" stop-opacity="0.02"/></linearGradient></defs>';
    if (!spark) {
      [bounds.max, (bounds.max + bounds.min) / 2, bounds.min].forEach(function (tick) {
        var y = frame.t + (1 - (tick - bounds.min) / (bounds.max - bounds.min || 1)) * (frame.h - frame.t - frame.b);
        html += '<line class="ops-speed-grid" x1="' + frame.l + '" y1="' + y.toFixed(1) + '" x2="' + (frame.w - frame.r) + '" y2="' + y.toFixed(1) + '" />';
      });
    }
    if (previous.length) html += '<path class="ops-speed-line-compare" d="' + linePath(previous) + '" />';
    html += '<path class="ops-speed-fill" d="' + areaPath(current, frame) + '" fill="url(#' + gid + ')" />';
    html += '<path class="ops-speed-line" d="' + linePath(current) + '" />';
    html += '</svg>';
    if (spark) return html;
    var frameRatio = function (value) {
      var innerH = frame.h - frame.t - frame.b;
      var y = frame.t + (1 - (value - bounds.min) / (bounds.max - bounds.min || 1)) * innerH;
      return y / frame.h;
    };
    var tipPayload = encodeURIComponent(JSON.stringify({
      metric: name,
      count: axisCount,
      current: values.map(function (value, index) {
        return { time: (series.currentLabels || series.labels || [])[index] || '', value: value, y: frameRatio(value) };
      }),
      compare: compare.map(function (value, index) {
        return { time: (series.compareLabels || [])[index] || '', value: value, y: frameRatio(value) };
      }),
      compareName: compare.length ? compareName() : ''
    }));
    var yLabels = [bounds.max, (bounds.max + bounds.min) / 2, bounds.min].map(function (tick) {
      var y = frame.t + (1 - (tick - bounds.min) / (bounds.max - bounds.min || 1)) * (frame.h - frame.t - frame.b);
      return '<span class="ops-speed-ylabel" style="top:' + (y / frame.h * 100).toFixed(2) + '%">' + esc(formatMetric(name, tick)) + '</span>';
    }).join('');
    var xLabels = axisLabelIndexes(axisCount).map(function (index) {
      var left = axisCount === 1 ? 50 : (index / (axisCount - 1)) * 100;
      var shift = index === 0 ? '0' : (index === axisCount - 1 ? '-100%' : '-50%');
      return '<span class="ops-speed-xlabel" style="left:' + left.toFixed(2) + '%;transform:translateX(' + shift + ')">' + esc(series.labels[index] || '') + '</span>';
    }).join('');
    return '<div class="ops-speed-plot"><div class="ops-speed-ylabels">' + yLabels + '</div><div class="ops-speed-canvas" data-speed-tip="' + tipPayload + '">' + html + '<div class="ops-speed-guide" hidden></div><div class="ops-speed-point is-current" hidden></div><div class="ops-speed-point is-compare" hidden></div><div class="ops-speed-tip" hidden></div></div><div class="ops-speed-xlabels">' + xLabels + '</div></div>';
  }
  function tipText(text) {
    if (!window.I18N || window.I18N.lang !== 'zh' || !window.I18N.t) return text;
    return window.I18N.t(text);
  }
  function bindChartHover(scope) {
    scope.querySelectorAll('[data-speed-tip]').forEach(function (canvas) {
      var payload;
      try { payload = JSON.parse(decodeURIComponent(canvas.getAttribute('data-speed-tip') || '')); } catch (err) { return; }
      var guide = canvas.querySelector('.ops-speed-guide');
      var tip = canvas.querySelector('.ops-speed-tip');
      var currentDot = canvas.querySelector('.ops-speed-point.is-current');
      var compareDot = canvas.querySelector('.ops-speed-point.is-compare');
      var count = Math.max(payload.count || 0, (payload.current || []).length, (payload.compare || []).length);
      function hide() {
        guide.hidden = true;
        tip.hidden = true;
        currentDot.hidden = true;
        compareDot.hidden = true;
      }
      function placeDot(dot, point, left) {
        if (!point || !isFinite(point.value)) { dot.hidden = true; return; }
        dot.hidden = false;
        dot.style.left = left;
        dot.style.top = (point.y * 100).toFixed(2) + '%';
      }
      canvas.onmousemove = function (event) {
        if (!count) return hide();
        var rect = canvas.getBoundingClientRect();
        if (rect.width <= 0) return hide();
        var index = Math.round(((event.clientX - rect.left) / rect.width) * (count - 1));
        if (index < 0) index = 0;
        if (index > count - 1) index = count - 1;
        var current = (payload.current || [])[index];
        var compared = (payload.compare || [])[index];
        if ((!current || !isFinite(current.value)) && (!compared || !isFinite(compared.value))) return hide();
        var left = (count === 1 ? 50 : (index / (count - 1)) * 100).toFixed(2) + '%';
        guide.hidden = false;
        guide.style.left = left;
        placeDot(currentDot, current, left);
        placeDot(compareDot, compared, left);
        var rows = '';
        if (current && isFinite(current.value)) {
          rows += '<div class="ops-speed-tip-row"><i class="ops-speed-tip-swatch"></i><span>' + esc(tipText('This period')) + ' · ' + esc(current.time || '') + '</span><strong>' + esc(formatMetric(payload.metric, current.value)) + '</strong></div>';
        }
        if (compared && isFinite(compared.value)) {
          rows += '<div class="ops-speed-tip-row"><i class="ops-speed-tip-swatch compare"></i><span>' + esc(tipText(payload.compareName || 'Previous period')) + ' · ' + esc(compared.time || '') + '</span><strong>' + esc(formatMetric(payload.metric, compared.value)) + '</strong></div>';
        }
        tip.innerHTML = rows;
        tip.hidden = false;
        var px = count === 1 ? rect.width / 2 : (index / (count - 1)) * rect.width;
        var tipLeft = px + 14;
        if (tipLeft + tip.offsetWidth > rect.width - 4) tipLeft = Math.max(4, px - tip.offsetWidth - 14);
        tip.style.left = tipLeft + 'px';
        tip.style.top = '8px';
      };
      canvas.onmouseleave = hide;
    });
  }
  function metricDelta(summary, rows, name) {
    if (!summary || summary.insufficient || query.compare === 'none') return '';
    var previous = comparedValue(summary, rows, name);
    if (previous == null) return '';
    return '<span class="ops-speed-delta ' + deltaTone(summary.value, previous) + '">' + esc(formatDelta(name, summary.value, previous)) + '</span>';
  }
  function analyticsCharts(rows) {
    var legend = query.compare === 'none' ? '' : '<div class="ops-speed-legend"><span><i class="ops-speed-swatch"></i>This period</span><span><i class="ops-speed-swatch compare"></i>' + esc(compareName()) + '</span></div>';
    var cards = metricOrder.map(function (name) {
      var series = trendSeries(name, rows);
      var summary = series.summary;
      var tone = summary.insufficient ? '' : summary.rating;
      var plot = summary.insufficient ? '<div class="ops-speed-plot-empty">Insufficient samples</div>' : chartSvg(series, name, 'area');
      return '<article class="ops-speed-chart-card"><header><span>' + esc(name) + '</span><div class="ops-speed-chart-figure ' + tone + '"><strong>' + (summary.insufficient ? '—' : esc(formatMetric(name, summary.value))) + '</strong>' + metricDelta(summary, rows, name) + '</div></header>' + plot + '</article>';
    }).join('');
    return legend + '<div class="ops-speed-charts">' + cards + '</div>';
  }
  function metricCells(rows) {
    var total = rows.reduce(function (sum, row) { return sum + samplesOf(row); }, 0);
    var ratings = metricOrder.slice(0, 3).map(function (name) {
      return summarize(rows, name);
    }).filter(function (summary) { return summary && !summary.insufficient; }).map(function (summary) {
      return summary.rating;
    });
    var rating = ratings.length ? worst(ratings) : 'insufficient';
    return metricOrder.map(function (name) {
      return '<td class="' + metricColClass(name) + '">' + metricCell(summarize(rows, name), name, rows) + '</td>';
    }).join('') + '<td class="ops-speed-m ops-speed-m-n">' + num(total) + '</td><td class="ops-speed-m ops-speed-m-x">' + ratingPill(rating) + '</td>';
  }
  function metricColClass(name) {
    if (name === 'CLS') return 'ops-speed-m ops-speed-m-cls';
    return 'ops-speed-m';
  }
  function metricHead() {
    return '<th class="ops-speed-m">LCP</th><th class="ops-speed-m">INP</th><th class="ops-speed-m ops-speed-m-cls">CLS</th><th class="ops-speed-m">FCP</th><th class="ops-speed-m">TTFB</th><th class="ops-speed-m ops-speed-m-n">Samples</th><th class="ops-speed-m ops-speed-m-x">Experience</th>';
  }
  function groupStores(list) {
    var groups = {};
    list.forEach(function (row) {
      if (!groups[row.storeId]) groups[row.storeId] = { storeId: row.storeId, store: row.store, rows: [] };
      groups[row.storeId].rows.push(row);
    });
    return Object.keys(groups).map(function (key) { return groups[key]; }).sort(function (a, b) { return a.store.localeCompare(b.store); });
  }
  function groupUrls(list) {
    var groups = {};
    list.forEach(function (row) {
      var key = row.url || '';
      if (!groups[key]) groups[key] = { url: key, rows: [], sample: row };
      groups[key].rows.push(row);
    });
    return Object.keys(groups).map(function (key) { return groups[key]; }).sort(function (a, b) { return b.rows.length - a.rows.length; });
  }
  function urlKey(value) {
    return String(value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  }
  function urlHit(row, needle) {
    var hay = urlKey(row.url);
    var queryText = urlKey(needle);
    return !!queryText && hay.indexOf(queryText) !== -1;
  }

  function pageHit(group, needle) {
    var q = String(needle || '').trim().toLowerCase();
    if (!q) return true;
    var labels = {
      home: ['Home page', '首页'],
      collection: ['Collection page', '商品系列页'],
      product: ['Product page', '商品页'],
      blog: ['Blog page', '博客页'],
      cart: ['Cart page', '购物车页'],
      checkout: ['Checkout', '结账页'],
      upsell: ['Upsell', '加售页'],
      downsell: ['Downsell', '降售页'],
      thankyou: ['Thank-you page', '感谢页']
    }[group.pageId] || [group.pageType];
    return labels.some(function (label) { return String(label).toLowerCase().indexOf(q) !== -1; });
  }
  function segBtn(href, label, on) {
    return '<a class="ops-speed-seg-btn' + (on ? ' active' : '') + '" href="' + href + '">' + esc(label) + '</a>';
  }
  function seg(label, buttons) {
    return '<div class="ops-speed-seg"><span class="ops-speed-seg-label">' + esc(label) + '</span>' + buttons + '</div>';
  }
  function speedFilters(opts) {
    opts = opts || {};
    return '<div class="ops-speed-filter-row ops-speed-filter-selects">' +
      select('spdRange', rangeOptions(), query.range) +
      compareControl() +
      select('spdCountry', [['all', 'All countries'], ['United States', 'United States'], ['United Kingdom', 'United Kingdom'], ['Germany', 'Germany'], ['Japan', 'Japan'], ['Australia', 'Australia']], query.country) +
      select('spdDevice', [['all', 'All devices'], ['Mobile', 'Mobile'], ['Desktop', 'Desktop'], ['Tablet', 'Tablet']], query.device) +
      (opts.hideStore ? '' : select('spdStore', storeOptions(), query.store)) +
      '</div>';
  }
  function storeUrls(rows) {
    var seen = {};
    var urls = [];
    (rows || []).forEach(function (row) {
      if (!row.url || seen[row.url]) return;
      seen[row.url] = true;
      urls.push(row.url);
    });
    return urls;
  }
  function directUrlPage(pageId) {
    return pageId === 'home' || pageId === 'cart';
  }
  function storeCell(pageId, group) {
    if (!directUrlPage(pageId)) {
      return '<a class="ops-link" href="' + storeHref(pageId, group.storeId) + '">' + esc(group.store) + '</a>';
    }
    var name = '<a class="ops-link" href="#/stores/' + esc(group.storeId) + '">' + esc(group.store) + '</a>';
    var urls = storeUrls(group.rows).map(function (url) {
      return '<a class="ops-speed-store-url" href="' + resultHash(url) + '">' + esc(url) + '</a>';
    }).join('');
    return '<div class="ops-speed-store-cell">' + name + urls + '</div>';
  }
  function storeHref(pageId, storeId) {
    return '#/speed/' + query.product + '/pages/' + pageId + '/stores/' + storeId;
  }
  var storePager = { page: 1, size: 20, key: '' };
  var urlPager = { page: 1, size: 20, key: '' };
  var visitPager = { page: 1, size: 20, key: '' };
  var searchPager = { page: 1, size: 20, key: '' };
  function pageList(page, pages) {
    if (pages <= 7) {
      var all = [];
      for (var i = 1; i <= pages; i++) all.push(i);
      return all;
    }
    if (page <= 4) return [1, 2, 3, 4, 5, '...', pages];
    if (page >= pages - 3) return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [1, '...', page - 1, page, page + 1, '...', pages];
  }
  function listPager(pageNo, pageSize, total, attr, sizeId) {
    var pages = Math.max(1, Math.ceil((total || 0) / pageSize) || 1);
    if (pageNo > pages) pageNo = pages;
    if (pageNo < 1) pageNo = 1;
    var item = function (label, target, disabled, active) {
      return '<span class="pg-item' + (active ? ' active' : '') + (disabled ? ' disabled' : '') + '"' + (disabled ? '' : ' data-' + attr + '="' + target + '"') + '>' + label + '</span>';
    };
    var html = '<div class="pg">' + item('‹', pageNo - 1, pageNo <= 1, false);
    pageList(pageNo, pages).forEach(function (entry) {
      html += entry === '...' ? '<span class="pg-gap">…</span>' : item(String(entry), entry, false, entry === pageNo);
    });
    html += item('›', pageNo + 1, pageNo >= pages, false);
    html += '<select class="pg-size" id="' + sizeId + '" data-ui-fit aria-label="Page size">' + [20, 50, 100].map(function (size) {
      return '<option value="' + size + '"' + (size === pageSize ? ' selected' : '') + '>' + size + ' / page</option>';
    }).join('') + '</select></div>';
    return { html: html, page: pageNo };
  }
  function bindSpeedRows(scope) {
    scope.querySelectorAll('[data-speed-row]').forEach(function (row) {
      row.onclick = function (event) {
        if (event.target.closest('a')) return;
        location.hash = row.getAttribute('data-speed-row') || '';
      };
    });
  }
  function storeRowHref(pageId, group) {
    if (directUrlPage(pageId)) {
      var urls = storeUrls(group.rows);
      if (urls.length) return resultHash(urls[0]);
    }
    return storeHref(pageId, group.storeId);
  }
  function storePanel(rows, listKey) {
    if (storePager.key !== listKey) {
      storePager.page = 1;
      storePager.key = listKey;
    }
    var stores = groupStores(rows);
    var pager = listPager(storePager.page, storePager.size, stores.length, 'speed-page', 'spdStorePageSize');
    storePager.page = pager.page;
    var pageRows = stores.slice((pager.page - 1) * storePager.size, pager.page * storePager.size);
    var pageId = rows[0] ? rows[0].pageId : '';
    var table = pageRows.length ? pageRows.map(function (group) {
      return '<tr data-speed-row="' + esc(storeRowHref(pageId, group)) + '"><td>' + storeCell(pageId, group) + '</td>' + metricCells(group.rows) + '</tr>';
    }).join('') : '<tr class="ops-empty-row"><td class="muted ops-table-empty" colspan="8">No visitor samples match these filters.</td></tr>';
    return '<section class="ops-table-card ops-speed-stores"><div class="ops-speed-list-head"><div class="ops-panel-title">Stores for this page</div><div class="ops-panel-sub">One row per store for the current country, device and time range.</div></div><div class="ops-table-wrap"><table class="ops-table ops-table-speed"><thead><tr><th>Store</th>' + metricHead() + '</tr></thead><tbody>' + table + '</tbody></table></div><div class="ops-table-foot"><span class="ops-table-total">Total ' + stores.length + ' records</span>' + pager.html + '</div></section>';
  }
  function dashboard(root, pageId) {
    var catalog = pageCatalog();
    var groups = groupPages(filtered());
    var currentId = pageId;
    if (!catalog.some(function (page) { return page.pageId === currentId; })) currentId = catalog.length ? catalog[0].pageId : '';
    var current = null;
    groups.forEach(function (group) { if (group.pageId === currentId) current = group; });
    var products = [['bestshopio', 'BestShopio'], ['bestcheckout', 'BestCheckout']].map(function (item) {
      return segBtn('#/speed/' + item[0], item[1], query.product === item[0]);
    }).join('');
    var pages = catalog.map(function (page) {
      return segBtn('#/speed/' + query.product + '/pages/' + page.pageId, page.pageType, page.pageId === currentId);
    }).join('');
    var body = metricGuide() + '<div class="ops-speed-filters"><div class="ops-speed-filter-row">' + seg('Product', products) + '</div>' + (pages ? '<div class="ops-speed-filter-row">' + seg('Page', pages) + '</div>' : '') + speedFilters() + '</div>';
    var listKey = [query.product, currentId, query.range, query.compare, query.compareStart, query.compareEnd, query.country, query.device, query.store].join('|');
    body += current ? analyticsCharts(current.rows) + storePanel(current.rows, listKey) : empty('No visitor samples match these filters.', 'Widen the country, device or store filter.');
    render(root, shell('Page speed', 'Real visitor speed for BestCheckout hosted checkout and the BestShopio storefront.', freshness(), body), function (scope) {
      bindFilters(scope, function () { dashboard(root, currentId); });
      bindRefresh(scope, function () { dashboard(root, currentId); });
      bindChartHover(scope);
      var guide = scope.querySelector('#spdMetricGuide');
      if (guide) guide.onclick = function () { setMetricGuideCollapsed(!metricGuideCollapsed); dashboard(root, currentId); };
      scope.querySelectorAll('[data-speed-page]').forEach(function (node) {
        node.onclick = function () {
          storePager.page = Number(node.getAttribute('data-speed-page')) || 1;
          dashboard(root, currentId);
        };
      });
      bindSpeedRows(scope);
      var size = scope.querySelector('#spdStorePageSize');
      if (size) size.onchange = function () {
        storePager.size = Number(size.value) || 20;
        storePager.page = 1;
        dashboard(root, currentId);
      };
    });
  }

  function rowVisible(row, opts) {
    opts = opts || {};
    if (query.country !== 'all' && row.country !== query.country) return false;
    if (query.device !== 'all' && row.device !== query.device) return false;
    if (!opts.ignoreStore && query.store !== 'all' && row.storeId !== query.store) return false;
    return samplesOf(row) > 0;
  }
  function visibleRows(rows, opts) {
    return (rows || []).filter(function (row) { return rowVisible(row, opts); });
  }
  var urlHistoryKey = 'bsio_speed_url_history_v3';
  var urlHistorySeed = [
    'mira-botanics.com/products/botanic-serum',
    'silixwear.com/collections/new-arrivals',
    'checkout.folast-studio.com/checkout/184456',
    'norimarket.com/cart',
    'checkout.lavenderlabs.com/checkout/190412/upsell',
    'willowatelier.com/blogs/notes',
    'cedar-co.stores.bestshopio.com/',
    'mira-botanics.com/checkout/208510/downsell',
    'willowatelier.com/products/linen-shirt',
    'checkout.folast-studio.com/checkout/184810/thankyou'
  ];
  function readUrlHistory() {
    try {
      var raw = window.localStorage.getItem(urlHistoryKey);
      if (raw == null) {
        window.localStorage.setItem(urlHistoryKey, JSON.stringify(urlHistorySeed));
        return urlHistorySeed.slice();
      }
      var list = JSON.parse(raw);
      if (!Array.isArray(list)) return [];
      return list.filter(function (item) { return typeof item === 'string' && item.trim(); }).slice(0, 10);
    } catch (err) {
      return urlHistorySeed.slice();
    }
  }
  function writeUrlHistory(list) {
    try { window.localStorage.setItem(urlHistoryKey, JSON.stringify(list.slice(0, 10))); } catch (err) { /* Keep searching when storage is unavailable. */ }
  }
  function rememberUrl(value) {
    var text = String(value || '').trim();
    if (!text) return;
    var list = readUrlHistory().filter(function (item) { return item.toLowerCase() !== text.toLowerCase(); });
    list.unshift(text);
    writeUrlHistory(list);
  }
  function historyBlock(needle) {
    var q = String(needle || '').trim().toLowerCase();
    var items = readUrlHistory().filter(function (item) { return !q || item.toLowerCase().indexOf(q) !== -1; });
    if (!items.length) return '';
    var rows = items.map(function (item) {
      return '<div class="ops-url-history-row"><button class="ops-url-history-pick" type="button" data-history="' + esc(item) + '">' + esc(item) + '</button><button class="ops-url-history-remove" type="button" data-forget="' + esc(item) + '" aria-label="Remove">' + icon('close', 14) + '</button></div>';
    }).join('');
    return '<section class="ops-url-home-history"><div class="ops-url-home-history-head"><div class="ops-url-home-history-label">Recent searches</div><button class="ops-url-history-clear" id="spdUrlClear" type="button">Clear history</button></div><div class="ops-url-home-history-list">' + rows + '</div></section>';
  }
  function hashQuery() {
    var raw = location.hash || '';
    var qi = raw.indexOf('?');
    var out = {};
    if (qi < 0) return out;
    raw.slice(qi + 1).split('&').forEach(function (pair) {
      if (!pair) return;
      var eq = pair.indexOf('=');
      var key = decodeURIComponent((eq >= 0 ? pair.slice(0, eq) : pair).replace(/\+/g, ' '));
      var val = decodeURIComponent((eq >= 0 ? pair.slice(eq + 1) : '').replace(/\+/g, ' '));
      if (key) out[key] = val;
    });
    return out;
  }
  function resultHash(value) {
    return '#/speed/urls/result?q=' + encodeURIComponent(String(value || '').trim());
  }
  function goResult(root, value) {
    var text = String(value || '').trim();
    if (!text) return;
    rememberUrl(text);
    query.url = text;
    var next = resultHash(text);
    if ((location.hash || '') === next) urlResult(root);
    else location.hash = next;
  }
  function visitValue(base, salt, name) {
    if (base == null || !isFinite(base)) return null;
    var swing = name === 'CLS' ? 0.4 : 0.32;
    var ratio = ((hashText(salt) % 1000) / 999) * 2 - 1;
    var value = base * (1 + ratio * swing);
    if (name === 'CLS') return Math.max(0, Math.round(value * 100) / 100);
    return Math.max(name === 'LCP' || name === 'FCP' ? 100 : 1, value);
  }
  function visitStamp(index, total, salt) {
    var end = new Date(2026, 9, 21, 15, 4, 0);
    var span = query.range === '24h' ? 24 * 3600000 : rangeLength() * 24 * 3600000;
    var slot = total <= 1 ? 0 : (total - 1 - index) / total;
    var jitter = ((hashText(salt) % 1000) / 1000) * (span / Math.max(total, 1)) * 0.45;
    var at = new Date(end.getTime() - slot * span - jitter);
    return ymd(at) + ' ' + pad2(at.getHours()) + ':' + pad2(at.getMinutes());
  }
  function expandVisits(rows) {
    var visits = [];
    (rows || []).forEach(function (row) {
      var count = samplesOf(row);
      for (var i = 0; i < count; i++) {
        var salt = [i * 104729, row.device, row.country, row.url].join('/');
        var metrics = {};
        metricOrder.forEach(function (name) {
          metrics[name] = visitValue(row[name.toLowerCase()], salt + '/' + name, name);
        });
        visits.push({
          at: visitStamp(i, count, salt),
          country: row.country,
          device: row.device,
          metrics: metrics,
          rating: worst(metricOrder.slice(0, 3).map(function (name) { return rateOne(name, metrics[name]); }))
        });
      }
    });
    visits.sort(function (a, b) { return a.at < b.at ? 1 : a.at > b.at ? -1 : 0; });
    return visits;
  }
  function visitPanel(rows, listKey) {
    if (visitPager.key !== listKey) {
      visitPager.page = 1;
      visitPager.key = listKey;
    }
    var visits = expandVisits(rows);
    var pager = listPager(visitPager.page, visitPager.size, visits.length, 'speed-visit-page', 'spdVisitPageSize');
    visitPager.page = pager.page;
    var pageRows = visits.slice((pager.page - 1) * visitPager.size, pager.page * visitPager.size);
    var table = pageRows.length ? pageRows.map(function (visit) {
      var cells = metricOrder.map(function (name) {
        return '<td class="' + metricColClass(name) + '">' + esc(formatMetric(name, visit.metrics[name])) + '</td>';
      }).join('');
      return '<tr><td>' + esc(visit.at) + '</td><td>' + esc(visit.country) + '</td><td>' + esc(visit.device) + '</td>' + cells + '<td class="ops-speed-m ops-speed-m-x">' + ratingPill(visit.rating) + '</td></tr>';
    }).join('') : '<tr class="ops-empty-row"><td class="muted ops-table-empty" colspan="9">No visitor samples match these filters.</td></tr>';
    return '<section class="ops-table-card ops-speed-stores"><div class="ops-speed-list-head"><div class="ops-panel-title">Visits</div><div class="ops-panel-sub">One row per visit in the current country, device and time range.</div></div><div class="ops-table-wrap"><table class="ops-table ops-table-speed"><thead><tr><th>Visited at</th><th>Country</th><th>Device</th><th class="ops-speed-m">LCP</th><th class="ops-speed-m">INP</th><th class="ops-speed-m ops-speed-m-cls">CLS</th><th class="ops-speed-m">FCP</th><th class="ops-speed-m">TTFB</th><th class="ops-speed-m ops-speed-m-x">Experience</th></tr></thead><tbody>' + table + '</tbody></table></div><div class="ops-table-foot"><span class="ops-table-total">Total ' + visits.length + ' records</span>' + pager.html + '</div></section>';
  }
  function urlMatches(needle) {
    var groups = groupUrls(data().urls || []);
    var key = urlKey(needle);
    var exact = groups.filter(function (group) { return urlKey(group.url) === key; });
    if (exact.length) return exact;
    return groups.filter(function (group) { return urlHit(group.sample, needle); });
  }
  function searchPanel(listed, listKey) {
    if (searchPager.key !== listKey) {
      searchPager.page = 1;
      searchPager.key = listKey;
    }
    var pager = listPager(searchPager.page, searchPager.size, listed.length, 'speed-search-page', 'spdSearchPageSize');
    searchPager.page = pager.page;
    var pageRows = listed.slice((searchPager.page - 1) * searchPager.size, searchPager.page * searchPager.size);
    return '<section class="ops-table-card ops-speed-stores"><div class="ops-speed-list-head"><div class="ops-panel-title">Matching URLs</div><div class="ops-panel-sub">Open a URL to see its report.</div></div>' + urlTable(pageRows) + '<div class="ops-table-foot"><span class="ops-table-total">Total ' + listed.length + ' records</span>' + pager.html + '</div></section>';
  }
  function urlTable(matches) {
    return '<div class="ops-table-wrap"><table class="ops-table ops-table-speed ops-table-speed-search"><thead><tr><th class="ops-speed-url">URL</th><th class="ops-speed-product">Product</th><th class="ops-speed-page">Page</th><th class="ops-speed-store">Store</th>' + metricHead() + '</tr></thead><tbody>' + matches.map(function (group) {
      return '<tr><td class="ops-speed-url"><button class="ops-row-link ops-url-pick" type="button" data-url="' + esc(group.url) + '" title="' + esc(group.url) + '"><strong>' + esc(group.url) + '</strong></button></td><td class="ops-speed-product">' + esc(productName(group.sample.product)) + '</td><td class="ops-speed-page">' + esc(group.sample.pageType) + '</td><td class="ops-speed-store">' + esc(group.sample.store) + '</td>' + metricCells(group.rows) + '</tr>';
    }).join('') + '</tbody></table></div>';
  }
  function searchBox(value, home) {
    var clear = String(value || '').trim()
      ? '<button class="ops-url-search-clear" id="spdUrlReset" type="button" aria-label="Clear">' + icon('close', 18) + '</button>'
      : '';
    var go = home ? '<button class="ops-url-search-go" type="submit">Search</button>' : '';
    return '<form class="ops-url-search' + (home ? ' ops-url-search-home' : '') + '" id="spdUrlForm" role="search"><div class="ops-url-search-box"><span class="ops-url-search-ico">' + icon('search', 20) + '</span><input id="spdUrl" type="text" placeholder="Search a page URL" value="' + esc(value || '') + '" autocomplete="off" aria-label="URL">' + clear + go + '</div></form>';
  }
  function focusUrl(root, pos) {
    var next = root.querySelector('#spdUrl');
    if (!next) return;
    next.focus();
    if (pos == null) pos = next.value.length;
    try { next.setSelectionRange(pos, pos); } catch (err) { /* ignore */ }
  }
  var urlDraft = '';
  function urls(root) {
    var needle = String(urlDraft || '');
    var body = '<div class="ops-url-home"><h1 class="ops-url-home-mark">URL analysis</h1><p class="ops-url-home-sub">Enter a page address to see visitor speed. Search works for both BestShopio and BestCheckout.</p>' + searchBox(needle, true) + historyBlock(needle.trim()) + '</div>';
    render(root, '<section class="ops-page ops-page-speed ops-page-url-home">' + body + '</section>', function (scope) {
      var form = scope.querySelector('#spdUrlForm');
      var input = scope.querySelector('#spdUrl');
      if (form) form.onsubmit = function (event) {
        event.preventDefault();
        var text = input ? input.value : '';
        urlDraft = '';
        goResult(root, text);
      };
      if (input) input.oninput = function () {
        urlDraft = input.value;
        var pos = input.selectionStart;
        urls(root);
        focusUrl(root, pos);
      };
      var reset = scope.querySelector('#spdUrlReset');
      if (reset) reset.onclick = function () {
        urlDraft = '';
        urls(root);
        focusUrl(root, 0);
      };
      var clear = scope.querySelector('#spdUrlClear');
      if (clear) clear.onclick = function () {
        writeUrlHistory([]);
        urls(root);
        focusUrl(root);
      };
      scope.querySelectorAll('[data-history]').forEach(function (button) {
        button.onclick = function () {
          urlDraft = '';
          goResult(root, button.getAttribute('data-history') || '');
        };
      });
      scope.querySelectorAll('[data-forget]').forEach(function (button) {
        button.onclick = function () {
          var text = button.getAttribute('data-forget') || '';
          writeUrlHistory(readUrlHistory().filter(function (item) { return item !== text; }));
          urls(root);
          focusUrl(root);
        };
      });
    });
  }
  function urlReturnHref() {
    var prev = window.SAAS_NAV && window.SAAS_NAV.previous ? window.SAAS_NAV.previous() : '';
    if (!prev || prev === location.hash) return '#/speed/urls';
    return prev;
  }
  function urlResult(root) {
    var needle = String(hashQuery().q || '').trim();
    query.url = needle;
    if (!needle) { location.replace('#/speed/urls'); return; }
    var matches = urlMatches(needle);
    if (matches.length === 1) {
      var group = matches[0];
      var rows = visibleRows(group.rows, { ignoreStore: true });
      var stores = {};
      group.rows.forEach(function (row) { stores[row.store] = true; });
      var storeNames = Object.keys(stores);
      var listKey = [group.url, query.range, query.compare, query.compareStart, query.compareEnd, query.country, query.device, query.store].join('|');
      var report = rows.length
        ? analyticsCharts(rows) + visitPanel(rows, listKey)
        : empty('No visitor samples match these filters.', 'Widen the country or device filter.');
      render(root, shell(urlDetailTitle(storeNames, group), esc(storeTypeName(group.sample.storeId)), freshness(), filterBar(true, { hideStore: true }) + report, urlReturnHref(), true), function (scope) {
        bindFilters(scope, function () { urlResult(root); });
        bindRefresh(scope, function () { urlResult(root); });
        bindChartHover(scope);
        scope.querySelectorAll('[data-speed-visit-page]').forEach(function (node) {
          node.onclick = function () {
            visitPager.page = Number(node.getAttribute('data-speed-visit-page')) || 1;
            urlResult(root);
          };
        });
        var size = scope.querySelector('#spdVisitPageSize');
        if (size) size.onchange = function () {
          visitPager.size = Number(size.value) || 20;
          visitPager.page = 1;
          urlResult(root);
        };
      });
      return;
    }
    var listed = matches.map(function (group) {
      return { url: group.url, sample: group.sample, rows: visibleRows(group.rows) };
    }).filter(function (group) { return group.rows.length; });
    var listKey = [needle, query.range, query.compare, query.compareStart, query.compareEnd, query.country, query.device, query.store].join('|');
    var report = !matches.length
      ? empty('No URL matches.', 'Try a shorter path from the page.')
      : (!listed.length
        ? empty('No visitor samples match these filters.', 'Widen the country, device or store filter.')
        : searchPanel(listed, listKey));
    render(root, shell('Search results', esc(needle), freshness(), searchBox(needle) + filterBar(true) + report, '#/speed/urls'), function (scope) {
      bindFilters(scope, function () { urlResult(root); });
      bindRefresh(scope, function () { urlResult(root); });
      scope.querySelectorAll('[data-speed-search-page]').forEach(function (node) {
        node.onclick = function () {
          searchPager.page = Number(node.getAttribute('data-speed-search-page')) || 1;
          urlResult(root);
        };
      });
      var size = scope.querySelector('#spdSearchPageSize');
      if (size) size.onchange = function () {
        searchPager.size = Number(size.value) || 20;
        searchPager.page = 1;
        urlResult(root);
      };
      var form = scope.querySelector('#spdUrlForm');
      var input = scope.querySelector('#spdUrl');
      if (form) form.onsubmit = function (event) {
        event.preventDefault();
        goResult(root, input ? input.value : '');
      };
      var reset = scope.querySelector('#spdUrlReset');
      if (reset) reset.onclick = function () {
        if (input) { input.value = ''; input.focus(); }
        reset.remove();
      };
      scope.querySelectorAll('[data-url]').forEach(function (button) {
        button.onclick = function () { goResult(root, button.getAttribute('data-url') || ''); };
      });
    });
  }

  function sampleTotal(rows) {
    return rows.reduce(function (sum, row) { return sum + samplesOf(row); }, 0);
  }
  function storeRecord(pageId, storeId) {
    var found = null;
    (data().urls || []).some(function (row) {
      if (row.product === query.product && row.pageId === pageId && row.storeId === storeId) {
        found = row;
        return true;
      }
      return false;
    });
    return found;
  }
  function storeTypeName(storeId) {
    var stores = ((window.DATA || {}).platformCenter || {}).stores || [];
    var name = '';
    stores.some(function (store) {
      if (store.id !== storeId) return false;
      name = store.product || '';
      return true;
    });
    return name || productName(query.product);
  }
  function detailTitle(name, pageType, url) {
    var html = '<span>' + esc(name) + '</span><span class="ops-speed-dot"> · </span><span>' + esc(pageType) + '</span>';
    if (!url) return html;
    return html + '<span class="ops-speed-dot"> · </span><span class="ops-speed-title-url" title="' + esc(url) + '">' + esc(url) + '</span>';
  }
  function urlDetailTitle(storeNames, group) {
    var name = storeNames.length ? storeNames.join(', ') : group.sample.store;
    return detailTitle(name, group.sample.pageType, group.url);
  }
  function detailSub(record) {
    return esc(storeTypeName(record.storeId));
  }
  function urlPanel(groups, listKey) {
    if (urlPager.key !== listKey) {
      urlPager.page = 1;
      urlPager.key = listKey;
    }
    var pager = listPager(urlPager.page, urlPager.size, groups.length, 'speed-url-page', 'spdUrlPageSize');
    urlPager.page = pager.page;
    var pageRows = groups.slice((pager.page - 1) * urlPager.size, pager.page * urlPager.size);
    var table = pageRows.length ? pageRows.map(function (group) {
      var href = resultHash(group.url);
      return '<tr data-speed-row="' + esc(href) + '"><td><a class="ops-link" href="' + href + '">' + esc(group.url) + '</a></td>' + metricCells(group.rows) + '</tr>';
    }).join('') : '<tr class="ops-empty-row"><td class="muted ops-table-empty" colspan="8">No visitor samples match these filters.</td></tr>';
    return '<section class="ops-table-card ops-speed-stores"><div class="ops-speed-list-head"><div class="ops-panel-title">URLs with visits</div><div class="ops-panel-sub">One row per URL for the current country, device and time range.</div></div><div class="ops-table-wrap"><table class="ops-table ops-table-speed"><thead><tr><th>URL</th>' + metricHead() + '</tr></thead><tbody>' + table + '</tbody></table></div><div class="ops-table-foot"><span class="ops-table-total">Total ' + groups.length + ' records</span>' + pager.html + '</div></section>';
  }
  function storeDetail(root, pageId, storeId) {
    var record = storeRecord(pageId, storeId);
    if (!record) { dashboard(root, pageId); return; }
    var rows = filtered({ ignoreStore: true }).filter(function (row) { return row.pageId === pageId && row.storeId === storeId; });
    var groups = groupUrls(rows).sort(function (a, b) {
      return sampleTotal(b.rows) - sampleTotal(a.rows) || a.url.localeCompare(b.url);
    });
    var listKey = [query.product, pageId, storeId, query.range, query.compare, query.compareStart, query.compareEnd, query.country, query.device].join('|');
    var back = '#/speed/' + query.product + '/pages/' + pageId;
    var body = '<div class="ops-speed-filters">' + speedFilters({ hideStore: true }) + '</div>';
    if (!rows.length) body += empty('No visitor samples match these filters.', 'Widen the country or device filter.');
    else {
      body += '<section class="ops-speed-average"><div class="ops-speed-block-head"><div class="ops-panel-title">Average for this store</div><div class="ops-panel-sub">Sample-weighted average of the URLs with visits.</div></div>' + analyticsCharts(rows) + '</section>';
      body += urlPanel(groups, listKey);
    }
    render(root, shell(detailTitle(record.store, record.pageType), detailSub(record), freshness(), body, back, true), function (scope) {
      bindFilters(scope, function () { storeDetail(root, pageId, storeId); });
      bindRefresh(scope, function () { storeDetail(root, pageId, storeId); });
      bindChartHover(scope);
      bindSpeedRows(scope);
      scope.querySelectorAll('[data-speed-url-page]').forEach(function (node) {
        node.onclick = function () {
          urlPager.page = Number(node.getAttribute('data-speed-url-page')) || 1;
          storeDetail(root, pageId, storeId);
        };
      });
      var size = scope.querySelector('#spdUrlPageSize');
      if (size) size.onchange = function () {
        urlPager.size = Number(size.value) || 20;
        urlPager.page = 1;
        storeDetail(root, pageId, storeId);
      };
    });
  }

  function show(root, parts) {
    var known = { bestshopio: true, bestcheckout: true };
    var rest = parts || [];
    if (known[rest[0]]) {
      useProduct(rest[0]);
      rest = rest.slice(1);
    } else if (!known[query.product]) {
      useProduct('bestshopio');
    }
    if (rest[0] === 'urls' && rest[1] === 'result') { urlResult(root); return; }
    if (rest[0] === 'urls') { urlDraft = ''; urls(root); return; }
    if (rest[0] === 'pages' && rest[2] === 'stores' && rest[3]) {
      storeDetail(root, rest[1], rest[3]);
      return;
    }
    if (rest[0] === 'pages' && known[rest[1]] && rest[2]) {
      useProduct(rest[1]);
      dashboard(root, rest[2]);
      return;
    }
    if (rest[0] === 'pages' && rest[1]) { dashboard(root, rest[1]); return; }
    dashboard(root);
  }

  window.SAAS_SPEED = { render: show, query: query };
})();
