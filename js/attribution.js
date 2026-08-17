/* Attribution rules — V1.140 platform definitions read by the data warehouse.
   Rules live on one page; source-domain management has its own detail page. */
(function () {
  var D = window.DATA, A = D.attribution;
  var ico, toast, modal, P, root;
  var domFilter = 'all', domQuery = '', domQueryApplied = '';
  var guideCollapsed = false;
  var domainDictionaryGuideCollapsed = false;
  var domainDrafts = [];
  var deletedDomainKeys = {};
  var nextDomainDraftId = 1;
  var ATTRIBUTION_GUIDE_COLLAPSE_KEY = 'bestshopio:attribution-guide-collapsed';
  var DOMAIN_DICTIONARY_GUIDE_COLLAPSE_KEY = 'bestshopio:domain-dictionary-guide-collapsed';
  var pillCls = { social: 'pill-blue', search: 'pill-green', email: 'pill-orange', ai: 'pill-purple', exclude: 'pill-gray' };
  var typeNames = { social: 'Social', search: 'Search', email: 'Email', ai: 'AI', exclude: 'Exclude' };
  function typePill(t) { return '<span class="pill ' + (pillCls[t] || 'pill-gray') + '"><span class="dot"></span>' + (typeNames[t] || t) + '</span>'; }
  function optList(opts, cur) { return opts.map(function (o) {
    var value = typeof o === 'string' ? o : o.value;
    var label = typeof o === 'string' ? o : o.label;
    return '<option value="' + esc(value) + '"' + (value === cur ? ' selected' : '') + '>' + esc(label) + '</option>';
  }).join(''); }
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]; }); }

  function saveCorrection() { toast('Saved. Changes apply to new attribution records.'); }

  function domainRecordKey(d) { return d._draftId || (d.domain + '|' + d.match + '|' + d.channel + '|' + d.type); }

  function allActiveDomains() {
    return domainDrafts.concat(A.domains.filter(function (d) { return !deletedDomainKeys[domainRecordKey(d)]; }));
  }

  function normalizeDomainInput(value, match) {
    var domain = String(value || '').trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, '').replace(/[/?#].*$/, '').replace(/:\d+$/, '').replace(/\.$/, '');
    if (match === 'prefix_wildcard' && domain.slice(-2) !== '.*') domain = domain.replace(/\.[^.]+$/, '') + '.*';
    return domain;
  }

  function validDomainPattern(domain, match) {
    if (match === 'prefix_wildcard') return /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.\*$/.test(domain);
    return /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain);
  }

  function sameDomainRule(entry, current, domain, match) {
    return entry !== current && String(entry.domain || '').toLowerCase() === domain && entry.match === match;
  }

  function readGuideCollapsedPreference(storageKey) {
    try { return window.localStorage.getItem(storageKey) === '1'; } catch (err) { return false; }
  }

  function storeGuideCollapsedPreference(storageKey) {
    try { window.localStorage.setItem(storageKey, '1'); } catch (err) { /* Keep the guide usable when storage is unavailable. */ }
  }

  // ----- Domain Add / Edit (shared). Exclude entries do not need a channel. -----
  function domainModal(d) {
    var isEdit = !!d;
    d = d || { domain: '', match: 'registered_domain', channel: '', type: 'social', note: '' };
    modal('<div class="modal-head">' + (isEdit ? 'Edit source domain' : 'Add source domain') + '</div>' +
      '<div class="modal-body">' +
        '<label class="fld-label" style="margin-top:0">Source domain</label><input class="input" id="dm-d" placeholder="e.g. reddit.com" value="' + esc(d.domain) + '">' +
        '<label class="fld-label">Match method</label><select class="input" id="dm-m">' + optList([
          { value: 'registered_domain', label: 'Registered domain' },
          { value: 'exact_host', label: 'Exact host' },
          { value: 'prefix_wildcard', label: 'Prefix wildcard' }
        ], d.match) + '</select>' +
        '<label class="fld-label">Channel type</label><select class="input" id="dm-t">' + optList([
          { value: 'social', label: 'Social' },
          { value: 'search', label: 'Search' },
          { value: 'email', label: 'Email' },
          { value: 'ai', label: 'AI' },
          { value: 'exclude', label: 'Exclude' }
        ], d.type) + '</select>' +
        '<div id="dm-cw"' + (d.type === 'exclude' ? ' style="display:none"' : '') + '><label class="fld-label">Source channel</label><input class="input" id="dm-c" placeholder="e.g. Reddit" value="' + esc(d.channel || '') + '"></div>' +
        '<p class="fld-hint" id="dm-exclude-hint"' + (d.type === 'exclude' ? '' : ' style="display:none"') + '>Exclude ignores this technical referrer so it cannot create a false Others result.</p>' +
        '<label class="fld-label">Note</label><input class="input" id="dm-n" placeholder="Optional" value="' + esc(d.note || '') + '">' +
      '</div>' +
      '<div class="modal-foot"><button class="btn btn-default" data-mx>Cancel</button><button class="btn btn-primary" data-save>' + (isEdit ? 'Save' : 'Add') + '</button></div>', function (b) {
      var t = b.querySelector('#dm-t'), cw = b.querySelector('#dm-cw'), hint = b.querySelector('#dm-exclude-hint');
      t.addEventListener('change', function () {
        var excluded = t.value === 'exclude';
        cw.style.display = excluded ? 'none' : '';
        hint.style.display = excluded ? '' : 'none';
      });
      b.querySelector('[data-save]').onclick = function () {
        var domainInput = b.querySelector('#dm-d');
        var channelInput = b.querySelector('#dm-c');
        var nextMatch = b.querySelector('#dm-m').value;
        var nextDomain = normalizeDomainInput(domainInput.value, nextMatch);
        var nextChannel = String(channelInput.value || '').trim();
        if (!nextDomain) { toast('Enter a source domain.'); domainInput.focus(); return; }
        if (!validDomainPattern(nextDomain, nextMatch)) { toast('Enter a valid domain for the selected match method.'); domainInput.focus(); return; }
        if (t.value !== 'exclude' && !nextChannel) { toast('Enter a channel name.'); channelInput.focus(); return; }
        if (allActiveDomains().some(function (entry) { return sameDomainRule(entry, d, nextDomain, nextMatch); })) { toast('This domain and match method already exist.'); domainInput.focus(); return; }
        var values = {
          domain: nextDomain,
          match: nextMatch,
          channel: t.value === 'exclude' ? '' : nextChannel,
          type: t.value,
          note: String(b.querySelector('#dm-n').value || '').trim(),
          updatedAt: 'Just now'
        };
        if (isEdit) {
          d.domain = values.domain; d.match = values.match; d.channel = values.channel; d.type = values.type; d.note = values.note; d.updatedAt = values.updatedAt;
        } else {
          values._draftId = 'draft-' + nextDomainDraftId++;
          domainDrafts.unshift(values);
        }
        b.remove(); saveCorrection(); paint();
      };
    });
  }
  function deleteDomainModal(d) {
    modal('<div class="modal-head">Delete domain</div>' +
      '<div class="modal-body"><p style="font-size:13.5px;color:var(--ink-body);line-height:1.55;margin:0">Remove <b>' + esc(d.domain) + '</b> from the dictionary? This affects new attribution records only. Existing attribution records and historical orders stay unchanged.</p></div>' +
      '<div class="modal-foot"><button class="btn btn-default" data-mx>Cancel</button><button class="btn btn-danger" data-del>Delete</button></div>', function (b) {
      b.querySelector('[data-del]').onclick = function () {
        var draftIndex = domainDrafts.indexOf(d);
        if (draftIndex !== -1) domainDrafts.splice(draftIndex, 1);
        else {
          deletedDomainKeys[domainRecordKey(d)] = true;
        }
        b.remove(); saveCorrection(); paint();
      };
    });
  }

  function domainDictionaryContent() {
    var keyword = String(domQueryApplied || '').trim().toLowerCase();
    var allDomains = allActiveDomains();
    var list = allDomains.filter(function (d) {
      return (domFilter === 'all' || d.type === domFilter) &&
        (!keyword || [d.domain, d.channel, d.note].some(function (value) { return String(value || '').toLowerCase().indexOf(keyword) !== -1; }));
    });
    var rows = list.map(function (d) {
      var channel = d.type === 'exclude' ? '<span class="muted">Ignored</span>' : '<strong class="attribution-channel-name">' + esc(d.channel || '--') + '</strong>';
      return '<tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace">' + esc(d.domain) + '</td>' +
        '<td class="muted">' + esc(d.match) + '</td>' +
        '<td>' + channel + '</td>' +
        '<td>' + typePill(d.type) + '</td>' +
        '<td class="muted">' + esc(d.note || '--') + '</td><td class="muted">' + esc(d.updatedAt) + '</td>' +
        '<td><span class="row-acts"><button class="row-ic" data-edom="' + esc(domainRecordKey(d)) + '" title="Edit">' + ico(P.edit, 16) + '</button>' +
        '<button class="row-ic danger" data-ddom="' + esc(domainRecordKey(d)) + '" title="Delete">' + ico(P.trash, 16) + '</button></span></td></tr>';
    }).join('');
    if (!rows) rows = '<tr><td colspan="7" class="muted" style="padding:32px;text-align:center">No matching domains</td></tr>';
    var filterTags = [];
    if (domFilter !== 'all') {
      filterTags.push('<span class="field-pill"><span class="muted">Channel type:</span> ' + esc(typeNames[domFilter] || domFilter) + '<button type="button" class="attribution-filter-clear" data-clear-domain-filter="type" aria-label="Clear type filter">&times;</button></span>');
    }
    if (keyword) {
      filterTags.push('<span class="field-pill"><span class="muted">Search:</span> ' + esc(domQueryApplied) + '<button type="button" class="attribution-filter-clear" data-clear-domain-filter="query" aria-label="Clear domain search">&times;</button></span>');
    }
    return '<div class="pc-filters attribution-dictionary-filters">' +
        '<select class="filter-select attribution-domain-type-filter" id="domType">' +
            ['all', 'social', 'search', 'email', 'ai', 'exclude'].map(function (k) {
              var n = k === 'all' ? allDomains.length : allDomains.filter(function (d) { return d.type === k; }).length;
              return '<option value="' + k + '"' + (domFilter === k ? ' selected' : '') + '>' + (k === 'all' ? 'All channel types' : typeNames[k]) + ' (' + n + ')</option>';
            }).join('') +
          '</select><span class="pc-search attribution-domain-search">' + ico(P.search, 16) + '<input class="filter-input" id="domSearch" placeholder="Search domain or channel"></span>' +
        '<span class="pc-spacer"></span>' +
        '<button class="btn btn-primary" id="addDom">' + ico(P.plus, 16) + 'Add source domain</button>' +
        (filterTags.length ? '<div class="attribution-domain-filter-tags">' + filterTags.join('') + '</div>' : '') + '</div>' +
      '<div class="panel attribution-dictionary-table-wrap"><div class="attribution-dictionary-scroll-hint">Swipe horizontally to see channel type and actions</div><table class="tbl attribution-dictionary-table">' +
        '<thead><tr><th>Source domain</th><th>Match method</th><th>Source channel</th><th>Channel type</th><th>Note</th><th>Updated</th><th style="width:80px">Actions</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>';
  }

  function sourceOutcome(label, result, description) {
    return '<div class="attribution-source-outcome"><div><strong>' + label + '</strong><span>' + description + '</span></div><b>' + result + '</b></div>';
  }

  function logicCard(number, title, description, content) {
    return '<section class="panel card-pad attribution-logic-card"><div class="attribution-logic-card-head"><span>' + number + '</span><div><h2>' + title + '</h2><p>' + description + '</p></div></div>' + content + '</section>';
  }

  function sourceIdentificationContent() {
    return '<div class="attribution-source-list">' +
        sourceOutcome('Known source domain', 'Named channel / type', 'The dictionary maps facebook.com to Facebook / Social, google.* to Google / Search, and so on.') +
        sourceOutcome('Other external domain', 'Others', 'An external referrer that is not in the dictionary is classified as Others.') +
        sourceOutcome('No source domain', 'Direct', 'Opening the store without a referrer is Direct.') +
      '</div>' +
      '<div class="attribution-logic-note"><strong>Internal and technical sources do not create a new attribution ID</strong><span>The current store domain is identified automatically. Shared payment, hosted checkout, and OAuth sources marked Exclude keep the attribution ID already stored in the Cookie.</span></div>' +
      '<a class="btn btn-default attribution-logic-action" href="#/attribution/domain-dictionary">Manage domain dictionary</a>';
  }

  function utmContent() {
    return '<div class="attribution-utm-fields">' + A.utmFields.map(function (field) {
        return '<code>' + esc(field) + '</code>';
      }).join('') + '</div>' +
      '<div class="attribution-logic-note attribution-logic-note-blue"><strong>Keep the values exactly as received</strong><span>UTM values are used in merchant-side UTM reports. They do not rename or override the channel identified from the source domain.</span></div>' +
      '<p class="attribution-logic-footnote">A visit can still be identified as Facebook, Google, Others, or Direct when no UTM is present.</p>';
  }

  function orderAttributionContent() {
    return '<div class="attribution-model-summary"><span>Attribution model</span><strong>Last non-direct click · 30 days</strong><p>A later non-direct source replaces the previous attribution ID. A later Direct visit keeps the most recent non-direct source and does not extend its 30-day window. If no valid non-direct source remains, the order is Direct.</p></div>' +
      '<div class="attribution-id-flow">' +
        '<div><span>1</span><p>BestShopio returns attribution_id after identifying the landing-page source.</p></div>' +
        '<div><span>2</span><p>The Storefront frontend writes attribution_id into the Cookie.</p></div>' +
        '<div><span>3</span><p>When the customer places an order, the frontend reads attribution_id from the Cookie and sends it with the order request.</p></div>' +
      '</div>' +
      '<p class="attribution-logic-footnote">The Cookie stores only attribution_id. Channel, channel type, UTM values, landing page, and referrer stay in the backend attribution record.</p>';
  }

  function dictionaryMethodRow(title, example, effect) {
    return '<div class="domain-guide-method"><div><strong>' + title + '</strong></div><code>' + example + '</code><p>' + effect + '</p></div>';
  }

  function matchPriorityText() {
    var names = { exact_host: 'Exact host', registered_domain: 'Registered domain', prefix_wildcard: 'Prefix wildcard' };
    return A.domainMatchPriority.map(function (key) { return names[key] || key; }).join(' &rarr; ');
  }

  function domainDictionaryGuide() {
    var guideDetails = '<div id="domainDictionaryGuideDetails" class="attribution-guide-details">' +
      '<div class="attribution-guide-head">' +
        '<div><h2>What the domain dictionary does</h2><p>It turns the source domain sent by the browser into a clear channel and channel type.</p></div>' +
        '<div class="attribution-guide-summary"><strong>One domain &rarr; one channel</strong><span>For example, m.facebook.com matches facebook.com and becomes Facebook / Social. UTM values are stored separately.</span></div>' +
      '</div>' +
      '<div class="attribution-guide-flow-title">How a dictionary entry works</div>' +
      '<div class="attribution-guide-flow">' +
        guideStep(1, 'Receive a referrer host', 'For example m.facebook.com, checkout.stripe.com, or google.co.uk.') +
        guideStep(2, 'Match a dictionary entry', 'The selected match method decides whether the root domain, one exact host, or a country-domain pattern matches.') +
        guideStep(3, 'Apply channel and type', 'A normal entry returns a named channel and channel type. Exclude ignores a technical referrer.') +
      '</div>' +
      '<div class="domain-guide-concepts">' +
        '<article class="domain-guide-concept"><h3>Channel: the source name</h3><p>Use the name an operator expects to see, such as Facebook, Google, TikTok, ChatGPT, or Gmail.</p></article>' +
        '<article class="domain-guide-concept"><h3>Channel type: the source category</h3><p>Group the channel as Social, Search, Email, or AI. Use Exclude for a technical hop instead of a customer acquisition source.</p></article>' +
        '<article class="domain-guide-concept"><h3>Exclude: prevent false Others results</h3><p>Use Exclude only for shared technical sources such as payment hops, hosted checkout, or OAuth returns. Current store domains are identified automatically per store and should not be added to the global dictionary.</p></article>' +
      '</div>' +
      '<div class="domain-guide-section"><div class="domain-guide-section-head"><h3>How to choose a match method</h3><p>Choose the narrowest method that covers the source you need.</p></div>' +
        '<div class="domain-guide-methods"><div class="domain-guide-method domain-guide-method-header"><span>Match method</span><span>Example pattern</span><span>What it matches</span></div>' +
          dictionaryMethodRow('Registered domain', 'facebook.com', 'Matches the root domain and its subdomains. facebook.com covers m.facebook.com and l.facebook.com.') +
          dictionaryMethodRow('Exact host', 'checkout.stripe.com', 'Matches only this hostname. Use it when other hosts under the same domain should not be affected.') +
          dictionaryMethodRow('Prefix wildcard', 'google.*', 'Matches country or regional top-level-domain variants, such as google.com, google.co.uk, and google.de.') +
        '</div><div class="attribution-guide-note domain-guide-priority"><div><b>When rules overlap</b><span>Match priority: ' + matchPriorityText() + '. For example, gemini.google.com is matched before google.*.</span></div></div></div>' +
      '<div class="domain-guide-section"><div class="domain-guide-section-head"><h3>Before you add an entry</h3><p>Add an entry only when no existing dictionary entry already covers the source.</p></div>' +
        '<ol class="domain-guide-add-list">' +
          '<li><span>1</span><p>Enter the root domain, exact host, or wildcard pattern that the referrer actually sends.</p></li>' +
          '<li><span>2</span><p>Choose the narrowest match method that solves the case.</p></li>' +
          '<li><span>3</span><p>Enter the channel name operators should see, such as Facebook or Google.</p></li>' +
          '<li><span>4</span><p>Choose Social, Search, Email, or AI. Choose Exclude only for a technical hop.</p></li>' +
        '</ol></div>' +
      '<div class="domain-guide-section domain-guide-examples-section"><div class="domain-guide-section-head"><h3>Examples</h3><p>Read the referrer, the matching entry, and the final effect from left to right.</p></div>' +
        '<div class="attribution-guide-examples">' +
          guideExample('Example 1: Facebook traffic', ['m.facebook.com', 'facebook.com', 'Facebook / Social'], 'Result: Facebook / Social', 'The registered-domain entry covers m.facebook.com and identifies the visit as the Facebook channel within Social.') +
          guideExample('Example 2: hosted checkout return', ['checkout.stripe.com', 'Exact host', 'Exclude'], 'Result: ignored', 'The exact-host entry ignores this technical return. It does not create a new Others result or overwrite the previous real source.') +
          guideExample('Example 3: Google regional search', ['google.co.uk', 'google.*', 'Google / Search'], 'Result: Google / Search', 'The prefix wildcard matches regional Google domains and identifies the visit as Google within Search.') +
        '</div></div>' +
    '</div>';
    return '<section class="panel card-pad attribution-guide domain-dictionary-guide' + (domainDictionaryGuideCollapsed ? ' is-collapsed' : '') + '">' +
      '<div class="attribution-guide-topline">' +
        (domainDictionaryGuideCollapsed ? '<div class="attribution-guide-collapsed-copy"><strong>Domain dictionary guide</strong><span>A quick guide to matching referrer domains and adding entries.</span></div>' : '<div class="attribution-guide-kicker">Domain dictionary guide</div>') +
        guideToggle('toggleDomainDictionaryGuide', domainDictionaryGuideCollapsed) +
      '</div>' +
      (domainDictionaryGuideCollapsed ? '' : guideDetails) +
    '</section>';
  }

  function domainDictionaryPage() {
    return '<div class="view-wrap attribution-dictionary-page">' +
      '<div class="attribution-dictionary-detail-head"><button type="button" class="back-btn" id="backToAttribution" title="Back to attribution" aria-label="Back to attribution">' + ico(P.arrowLeft, 18) + '</button><div><h1 class="page-title">Domain dictionary</h1><p class="pc-sub">Manage how a browser referrer becomes a named channel and channel type.</p></div></div>' +
      domainDictionaryGuide() +
      domainDictionaryContent() +
    '</div>';
  }

  function guideStep(number, title, description) {
    return '<article class="attribution-guide-step">' +
      '<span class="attribution-guide-step-number">' + number + '</span>' +
      '<div><h3>' + title + '</h3><p>' + description + '</p></div>' +
    '</article>';
  }

  function guideExample(title, journey, outcome, description) {
    return '<article class="attribution-guide-example">' +
      '<h3>' + title + '</h3>' +
      '<div class="attribution-example-journey">' + journey.map(function (item, index) {
        return '<span class="attribution-example-chip">' + item + '</span>' + (index < journey.length - 1 ? '<span class="attribution-example-arrow">&rarr;</span>' : '');
      }).join('') + '</div>' +
      '<div class="attribution-example-outcome">' + outcome + '</div>' +
      '<p>' + description + '</p>' +
    '</article>';
  }

  function guideToggle(id, isCollapsed) {
    var label = isCollapsed ? 'Expand guide' : 'Collapse guide';
    return '<button type="button" class="attribution-guide-toggle" id="' + id + '" aria-expanded="' + (!isCollapsed) + '"><span>' + label + '</span><span class="attribution-guide-toggle-caret" aria-hidden="true">' + (isCollapsed ? '&#9662;' : '&#9652;') + '</span></button>';
  }

  function attributionGuide() {
    var guideDetails = '<div id="attributionGuideDetails" class="attribution-guide-details">' +
      '<div class="attribution-guide-head">' +
        '<div><h2>What attribution tells you</h2><p>Attribution assigns every order to one channel, so you can compare which traffic actually brings orders.</p></div>' +
        '<div class="attribution-guide-summary"><strong>Source &ne; UTM &ne; order credit</strong><span>The source identifies where the visit came from, UTM preserves the ad label, and the last non-direct visit in 30 days receives the order.</span></div>' +
      '</div>' +
      '<div class="attribution-guide-flow-title">The complete attribution flow</div>' +
      '<div class="attribution-guide-flow">' +
        guideStep(1, 'Identify the visit source', 'Use the source domain to return a named channel and type. Unknown external domains are Others; no referrer is Direct.') +
        guideStep(2, 'Keep the UTM values', 'Store utm_id, utm_source, utm_medium, utm_campaign, utm_content, and utm_term exactly as received. They do not override the source channel.') +
        guideStep(3, 'Keep the attribution ID until order creation', 'BestShopio returns attribution_id. The frontend writes it into a Cookie, then reads and sends it with the order request.') +
      '</div>' +
      '<div class="attribution-guide-note"><div><b>What the Cookie stores</b><span>Only attribution_id. It does not store the channel, UTM values, or the full URL.</span></div><div><b>What happens at order creation</b><span>The frontend explicitly sends attribution_id with the order request; the backend then copies the matching attribution snapshot into the order.</span></div></div>' +
      '<div class="attribution-guide-examples-head"><div><h3>Examples</h3><p>Follow the visit path, then read the result at the end.</p></div></div>' +
      '<div class="attribution-guide-examples">' +
        guideExample('Example 1: source and UTM stay separate', ['m.facebook.com', 'utm_campaign=spring_sale', 'Create attribution_id'], 'Cookie: attribution_id only', 'The source domain identifies Facebook / Social. The UTM campaign is saved in the backend attribution record, while the frontend Cookie keeps only its ID.') +
        guideExample('Example 2: Direct does not replace a known source', ['Facebook / Social', 'Direct visit', 'Keep Cookie ID'], 'Current attribution: Facebook / Social', 'A Direct visit within 30 days keeps the existing Facebook attribution_id. It does not create a Direct result or restart the 30-day window.') +
        guideExample('Example 3: the order carries the ID', ['Read Cookie', 'Send order + attribution_id', 'Create order'], 'Order channel: matched snapshot', 'The backend uses attribution_id to read the attribution record and writes the channel, channel type, UTM values, and source fields into the order.') +
      '</div>' +
    '</div>';
    return '<section class="panel card-pad attribution-guide' + (guideCollapsed ? ' is-collapsed' : '') + '">' +
      '<div class="attribution-guide-topline">' +
        (guideCollapsed ? '<div class="attribution-guide-collapsed-copy"><strong>Attribution guide</strong><span>A quick guide to the attribution logic and examples.</span></div>' : '<div class="attribution-guide-kicker">How attribution works</div>') +
        guideToggle('toggleAttributionGuide', guideCollapsed) +
      '</div>' +
      (guideCollapsed ? '' : guideDetails) +
    '</section>';
  }

  function attributionPage() {
    return attributionGuide() +
      '<div class="attribution-logic-grid">' +
        logicCard(1, 'Identify the visit source', 'Use the browser referrer to understand where this visit came from.', sourceIdentificationContent()) +
        logicCard(2, 'Keep UTM campaign tags', 'Store campaign tags as raw dimensions for separate UTM reporting.', utmContent()) +
        logicCard(3, 'Attribute the order', 'Give the order to the most recent non-direct source from the last 30 days.', orderAttributionContent()) +
      '</div>';
  }

  function bind() {
    var guideToggleButton = root.querySelector('#toggleAttributionGuide');
    if (guideToggleButton) guideToggleButton.onclick = function () {
      if (guideCollapsed) guideCollapsed = false;
      else { guideCollapsed = true; storeGuideCollapsedPreference(ATTRIBUTION_GUIDE_COLLAPSE_KEY); }
      paint();
    };
    var domainGuideToggleButton = root.querySelector('#toggleDomainDictionaryGuide');
    if (domainGuideToggleButton) domainGuideToggleButton.onclick = function () {
      if (domainDictionaryGuideCollapsed) domainDictionaryGuideCollapsed = false;
      else { domainDictionaryGuideCollapsed = true; storeGuideCollapsedPreference(DOMAIN_DICTIONARY_GUIDE_COLLAPSE_KEY); }
      paint();
    };
    var dt = root.querySelector('#domType'); if (dt) dt.onchange = function () { domFilter = dt.value; paint(); };
    var ds = root.querySelector('#domSearch');
    if (ds) {
      ds.value = domQuery;
      ds.oninput = function () { domQuery = ds.value; };
      var commitDomainSearch = function () {
        var next = String(domQuery || '').trim();
        if (domQueryApplied !== next) { domQueryApplied = next; paint(); }
      };
      ds.onkeydown = function (event) { if (event.key === 'Enter') ds.blur(); };
      ds.onblur = function () {
        window.setTimeout(function () {
          var typeSelect = root.querySelector('#domType');
          if (!typeSelect || document.activeElement !== typeSelect) commitDomainSearch();
        }, 0);
      };
    }
    root.querySelectorAll('[data-clear-domain-filter]').forEach(function (button) { button.onclick = function () {
      var field = button.getAttribute('data-clear-domain-filter');
      if (field === 'type') domFilter = 'all';
      if (field === 'query') { domQuery = ''; domQueryApplied = ''; }
      paint();
    }; });
    var backToAttribution = root.querySelector('#backToAttribution');
    if (backToAttribution) backToAttribution.onclick = function () { location.hash = '#/attribution'; };
    var add = root.querySelector('#addDom'); if (add) add.onclick = function () { domainModal(null); };
    root.querySelectorAll('[data-edom]').forEach(function (b) { b.onclick = function () { var dm = domainDrafts.concat(A.domains).filter(function (x) { return !deletedDomainKeys[domainRecordKey(x)] && domainRecordKey(x) === b.getAttribute('data-edom'); })[0]; domainModal(dm); }; });
    root.querySelectorAll('[data-ddom]').forEach(function (b) { b.onclick = function () { var dm = domainDrafts.concat(A.domains).filter(function (x) { return !deletedDomainKeys[domainRecordKey(x)] && domainRecordKey(x) === b.getAttribute('data-ddom'); })[0]; deleteDomainModal(dm); }; });
    var pub = root.querySelector('#publish'); if (pub) pub.onclick = function () { toast('Published v13 — the data warehouse reads the new rule set on its next ETL run.'); };
  }

  function paint() {
    if (currentView === 'domain-dictionary') {
      root.innerHTML = domainDictionaryPage();
    } else {
      var body = attributionPage();
      root.innerHTML =
        '<div class="view-wrap"><div class="pc-head"><div>' +
          '<div class="page-title">Attribution</div>' +
          '<div class="pc-sub">Identify the visit source, keep its UTM campaign tags, then use last non-direct click within 30 days to attribute the order.</div></div></div>' +
          body + '</div>';
    }
    bind();
    if (window.I18N && window.I18N.apply) window.I18N.apply(root);
  }

  var currentView = 'rules';
  window.__viewAttribution = function (rootEl, parts) {
    root = rootEl;
    ico = window.PC.ico; toast = window.PC.toast; modal = window.PC.modal; P = window.PC.P;
    currentView = parts && parts[0] === 'domain-dictionary' ? 'domain-dictionary' : 'rules';
    guideCollapsed = readGuideCollapsedPreference(ATTRIBUTION_GUIDE_COLLAPSE_KEY);
    domainDictionaryGuideCollapsed = readGuideCollapsedPreference(DOMAIN_DICTIONARY_GUIDE_COLLAPSE_KEY);
    paint();
  };
})();
