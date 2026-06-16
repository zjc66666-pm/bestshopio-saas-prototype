/* Attribution rules — V1.140 platform config read by the data warehouse.
   Tabs: Domain dictionary / Channel rules / Attribution model / Session.
   Versioned (effective_date). Correction edits (domain dictionary) auto-recompute
   the hot window; definition edits (model / window / session) prompt the
   recompute-history decision. Uses store-admin theme.css classes throughout. */
(function () {
  var D = window.DATA, A = D.attribution;
  var ico, toast, modal, drawer, P, root;
  var tab = 'domains', domFilter = 'all';
  var pendingModel = null; // staged radio choice for the unsaved bar (C32)

  var pillCls = { social: 'pill-blue', search: 'pill-green', email: 'pill-orange', exclude: 'pill-gray' };
  function typePill(t) { return '<span class="pill ' + (pillCls[t] || 'pill-gray') + '"><span class="dot"></span>' + t + '</span>'; }
  function optList(opts, cur) { return opts.map(function (o) { return '<option' + (o === cur ? ' selected' : '') + '>' + o + '</option>'; }).join(''); }

  function saveCorrection() { toast('Saved. Hot-window data will be recomputed on the next ETL run.'); }
  function saveDefinition(label) {
    modal('<div class="modal-head">Recompute history?</div>' +
      '<div class="modal-body"><p style="font-size:13.5px;color:var(--ink-body);line-height:1.55;margin:0 0 12px">You changed <b>' + label + '</b>. This is a definition change — it alters numbers that may already be reported.</p>' +
      '<div class="info-banner" style="margin:0">' + ico(P.info, 16) + '<span>Correction edits (domain dictionary) recompute the hot window automatically. Definition edits are your call.</span></div></div>' +
      '<div class="modal-foot"><button class="btn btn-default" data-new>Apply to new data only</button>' +
      '<button class="btn btn-primary" data-recompute>Recompute history + set effective date</button></div>', function (b) {
      b.querySelector('[data-new]').onclick = function () { b.remove(); toast('Saved. Effective from today; history unchanged.'); };
      b.querySelector('[data-recompute]').onclick = function () { b.remove(); toast('Saved. Backfill queued (simple mode: full recompute).'); };
    });
  }

  // ----- Domain Add / Edit (shared). Platform field shows only for Type=social (C20). -----
  function domainModal(d) {
    var isEdit = !!d;
    d = d || { domain: '', match: 'registered_domain', type: 'social', platform: '', note: '' };
    modal('<div class="modal-head">' + (isEdit ? 'Edit domain' : 'Add domain') + '</div>' +
      '<div class="modal-body">' +
        '<label class="fld-label" style="margin-top:0">Domain</label><input class="input" id="dm-d" placeholder="e.g. reddit.com" value="' + d.domain + '">' +
        '<label class="fld-label">Match</label><select class="input" id="dm-m">' + optList(['registered_domain', 'exact_host', 'prefix_wildcard'], d.match) + '</select>' +
        '<label class="fld-label">Type</label><select class="input" id="dm-t">' + optList(['social', 'search', 'email', 'exclude'], d.type) + '</select>' +
        '<div id="dm-pw"' + (d.type === 'social' ? '' : ' style="display:none"') + '><label class="fld-label">Platform <span class="muted">(social only)</span></label><input class="input" id="dm-p" placeholder="e.g. reddit" value="' + (d.platform || '') + '"></div>' +
      '</div>' +
      '<div class="modal-foot"><button class="btn btn-default" data-mx>Cancel</button><button class="btn btn-primary" data-save>' + (isEdit ? 'Save' : 'Add') + '</button></div>', function (b) {
      var t = b.querySelector('#dm-t'), pw = b.querySelector('#dm-pw');
      t.addEventListener('change', function () { pw.style.display = t.value === 'social' ? '' : 'none'; });
      b.querySelector('[data-save]').onclick = function () { b.remove(); saveCorrection(); };
    });
  }
  function deleteDomainModal(d) {
    modal('<div class="modal-head">Delete domain</div>' +
      '<div class="modal-body"><p style="font-size:13.5px;color:var(--ink-body);line-height:1.55;margin:0">Remove <b>' + d.domain + '</b> from the dictionary? This is a correction — the hot window is recomputed on the next ETL run; older history stays unchanged.</p></div>' +
      '<div class="modal-foot"><button class="btn btn-default" data-mx>Cancel</button><button class="btn btn-danger" data-del>Delete</button></div>', function (b) {
      b.querySelector('[data-del]').onclick = function () { b.remove(); saveCorrection(); };
    });
  }

  // ----- Channel rules editor (C28): open the editor first; Save then prompts the Recompute decision. -----
  function channelRulesModal() {
    var rows = A.channelRules.map(function (r) {
      return '<tr><td><input class="input" value="' + r.medium + '" style="height:32px"></td>' +
        '<td><select class="input" style="height:32px">' + optList(A.channelPriority, r.channel) + '</select></td></tr>';
    }).join('');
    modal('<div class="modal-head">Edit channel rules</div>' +
      '<div class="modal-body" style="max-height:60vh;overflow:auto">' +
        '<div class="blk-title" style="font-size:13px;margin-top:0">utm_medium &rarr; channel</div>' +
        '<table class="tbl" style="margin-bottom:16px"><thead><tr><th>Match</th><th style="width:150px">Channel</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<div class="blk-title" style="font-size:13px">Paid click IDs</div>' +
        '<div class="chip-row" style="margin-bottom:16px">' + A.clickIds.map(function (c) { return '<span class="chip" style="font-family:ui-monospace,Menlo,Consolas,monospace">' + c + '</span>'; }).join('') + '</div>' +
        '<div class="blk-title" style="font-size:13px">Channel priority</div>' +
        '<div class="prio-row">' + A.channelPriority.map(function (c, i) { return '<span class="prio">' + (i + 1) + '. ' + c + '</span>'; }).join('<span class="prio-arr">&rarr;</span>') + '</div>' +
      '</div>' +
      '<div class="modal-foot"><button class="btn btn-default" data-mx>Cancel</button><button class="btn btn-primary" data-save>Save</button></div>', function (b) {
      b.querySelector('[data-save]').onclick = function () { b.remove(); saveDefinition('channel rules'); };
    });
  }

  function tabDomains() {
    var list = A.domains.filter(function (d) { return domFilter === 'all' || d.type === domFilter; });
    var rows = list.map(function (d) {
      return '<tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace">' + d.domain + '</td>' +
        '<td class="muted" style="font-family:ui-monospace,Menlo,Consolas,monospace">' + d.match + '</td>' +
        '<td>' + typePill(d.type) + '</td>' +
        '<td>' + (d.platform ? '<span class="pill pill-blue"><span class="dot"></span>' + d.platform + '</span>' : '<span class="muted">--</span>') + '</td>' +
        '<td class="muted">' + (d.note || '--') + '</td><td class="muted">' + d.updatedAt + '</td>' +
        '<td><span class="row-acts"><button class="row-ic" data-edom="' + d.domain + '" title="Edit">' + ico(P.edit, 16) + '</button>' +
        '<button class="row-ic danger" data-ddom="' + d.domain + '" title="Delete">' + ico(P.trash, 16) + '</button></span></td></tr>';
    }).join('');
    return '<div class="info-banner">' + ico(P.info, 16) + '<span>Domain dictionary maps a referrer host to a channel. Edits here are <b>corrections</b> — the hot window is recomputed automatically; older history stays unchanged.</span></div>' +
      '<div class="pc-filters">' +
        '<select class="filter-select" id="domType">' +
          ['all', 'social', 'search', 'email', 'exclude'].map(function (k) {
            var n = k === 'all' ? A.domains.length : A.domains.filter(function (d) { return d.type === k; }).length;
            return '<option value="' + k + '"' + (domFilter === k ? ' selected' : '') + '>' + (k === 'all' ? 'All types' : k.charAt(0).toUpperCase() + k.slice(1)) + ' (' + n + ')</option>';
          }).join('') +
        '</select>' +
        '<span class="pc-search">' + ico(P.search, 16) + '<input class="filter-input" placeholder="Search domain"></span>' +
        '<span class="pc-spacer"></span>' +
        '<button class="btn btn-primary" id="addDom">' + ico(P.plus, 16) + 'Add domain</button></div>' +
      '<div class="panel" style="overflow:hidden"><table class="tbl">' +
        '<thead><tr><th>Domain</th><th>Match</th><th>Type</th><th>Platform</th><th>Note</th><th>Updated</th><th style="width:80px">Actions</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>';
  }

  function tabChannel() {
    var rules = A.channelRules.map(function (r) {
      return '<tr><td style="font-family:ui-monospace,Menlo,Consolas,monospace">' + r.medium + '</td><td><span class="pill pill-blue"><span class="dot"></span>' + r.channel + '</span></td></tr>';
    }).join('');
    return '<div class="info-banner">' + ico(P.info, 16) + '<span>Channel is decided per session, top-down first match. These are <b>definition</b> rules — changing them prompts a history-recompute decision.</span></div>' +
      '<div class="two-col">' +
        '<div class="panel card-pad"><div class="blk-title">utm_medium &rarr; channel</div>' +
          '<table class="tbl"><thead><tr><th>Match</th><th>Channel</th></tr></thead><tbody>' + rules + '</tbody></table></div>' +
        '<div class="col-stack">' +
          '<div class="panel card-pad"><div class="blk-title">Paid click IDs</div>' +
            '<p class="blk-sub">Any of these in the landing URL forces channel = Paid.</p>' +
            '<div class="chip-row">' + A.clickIds.map(function (c) { return '<span class="chip" style="font-family:ui-monospace,Menlo,Consolas,monospace">' + c + '</span>'; }).join('') + '</div></div>' +
          '<div class="panel card-pad"><div class="blk-title">Channel priority</div>' +
            '<p class="blk-sub">First match wins when multiple rules apply.</p>' +
            '<div class="prio-row">' + A.channelPriority.map(function (c, i) { return '<span class="prio">' + (i + 1) + '. ' + c + '</span>'; }).join('<span class="prio-arr">&rarr;</span>') + '</div></div>' +
          '<button class="btn btn-default" id="editChannel" style="align-self:flex-start">' + ico(P.edit, 16) + 'Edit channel rules</button>' +
        '</div></div>';
  }

  function tabModel() {
    function opt(val, title, sub) {
      var on = (pendingModel || A.model.current) === val;
      return '<label class="radio-card' + (on ? ' on' : '') + '"><input type="radio" name="model"' + (on ? ' checked' : '') + ' data-m="' + val + '">' +
        '<div><div class="rc-title">' + title + '</div><div class="rc-sub">' + sub + '</div></div></label>';
    }
    return '<div class="info-banner">' + ico(P.info, 16) + '<span>Order-attribution model and lookback windows. <b>Definition</b> rules — changing them prompts a history-recompute decision.</span></div>' +
      '<div class="panel card-pad form-block">' +
        '<div class="blk-title">Attribution model</div>' +
        opt('last_non_direct', 'Last non-direct touch', "Recommended. Direct visits don't steal credit; falls back to the most recent non-direct session in the window.") +
        opt('first_touch', 'First touch', 'Credit the first non-direct session in the window.') +
        opt('linear', 'Linear', 'Split credit evenly across all touches in the window.') +
        '<div class="divider" style="margin:18px 0"></div>' +
        '<div class="blk-title">Lookback windows</div>' +
        '<div class="win-row">' +
          '<div class="win-fld"><label class="fld-label" style="margin-top:0">Click-through window</label><div class="num-input"><input value="' + A.model.clickWindow + '"><span class="suffix">days</span></div></div>' +
          '<div class="win-fld"><label class="fld-label" style="margin-top:0">View-through window</label><div class="num-input"><input value="' + A.model.viewWindow + '"><span class="suffix">days</span></div></div>' +
        '</div>' +
        '<div class="form-foot"><button class="btn btn-primary" id="saveModel">Save model</button></div></div>';
  }

  function tabSession() {
    return '<div class="info-banner">' + ico(P.info, 16) + '<span>Session split thresholds used by the warehouse. <b>Definition</b> rules — changing them prompts a history-recompute decision.</span></div>' +
      '<div class="panel card-pad form-block"><div class="blk-title">Session split</div>' +
        '<div class="win-row">' +
          '<div class="win-fld"><label class="fld-label" style="margin-top:0">Inactivity timeout</label><div class="num-input"><input value="' + A.session.timeout + '"><span class="suffix">min</span></div>' +
            '<p class="fld-hint">New session after this gap between events (GA4 default 30).</p></div>' +
          '<div class="win-fld"><label class="fld-label" style="margin-top:0">Max session length</label><div class="num-input"><input value="' + A.session.maxLength + '"><span class="suffix">hours</span></div>' +
            '<p class="fld-hint">Hard cut to guard against bots / long-open tabs.</p></div>' +
        '</div>' +
        '<div class="form-foot"><button class="btn btn-primary" id="saveSession">Save session</button></div></div>';
  }

  function versionDrawer() {
    var rows = A.versions.map(function (v) {
      return '<div class="ver-item"><div class="ver-head"><span class="ver-num">v' + v.v + '</span>' +
        '<span class="pill ' + (v.kind === 'correction' ? 'pill-green' : 'pill-orange') + '"><span class="dot"></span>' + v.kind + '</span>' +
        '<span class="muted" style="font-size:12.5px">' + v.date + ' · ' + v.by + '</span></div>' +
        '<div class="ver-sum">' + v.summary + '</div>' +
        '<div class="ver-rc">' + ico(P.history, 13) + '<span>' + v.recompute + '</span></div></div>';
    }).join('');
    drawer('<div class="drawer-head"><span>Version history</span><span class="drawer-x" data-x>' + ico(P.close, 18) + '</span></div>' +
      '<div class="drawer-body">' + rows + '</div>');
  }

  function commitModel() {
    if (pendingModel) { A.model.current = pendingModel; pendingModel = null; }
    if (window.UI) UI.setUnsavedBar(document, false);
    saveDefinition('attribution model / window');
  }

  function bind() {
    root.querySelectorAll('[data-tab]').forEach(function (b) { b.onclick = function () { pendingModel = null; if (window.UI) UI.setUnsavedBar(document, false); tab = b.getAttribute('data-tab'); paint(); }; });
    var dt = root.querySelector('#domType'); if (dt) dt.onchange = function () { domFilter = dt.value; paint(); };
    var add = root.querySelector('#addDom'); if (add) add.onclick = function () { domainModal(null); };
    root.querySelectorAll('[data-edom]').forEach(function (b) { b.onclick = function () { var dm = A.domains.filter(function (x) { return x.domain === b.getAttribute('data-edom'); })[0]; domainModal(dm); }; });
    root.querySelectorAll('[data-ddom]').forEach(function (b) { b.onclick = function () { var dm = A.domains.filter(function (x) { return x.domain === b.getAttribute('data-ddom'); })[0]; deleteDomainModal(dm); }; });
    var ec = root.querySelector('#editChannel'); if (ec) ec.onclick = channelRulesModal;
    var sm = root.querySelector('#saveModel'); if (sm) sm.onclick = commitModel;
    var ss = root.querySelector('#saveSession'); if (ss) ss.onclick = function () { saveDefinition('session thresholds'); };
    root.querySelectorAll('[data-m]').forEach(function (r) {
      r.onchange = function () {
        pendingModel = r.getAttribute('data-m');
        root.querySelectorAll('.radio-card').forEach(function (c) { c.classList.remove('on'); });
        var card = r.closest('.radio-card'); if (card) card.classList.add('on');
        if (window.UI) UI.setUnsavedBar(document, true);
      };
    });
    var vh = root.querySelector('#verHist'); if (vh) vh.onclick = versionDrawer;
    var pub = root.querySelector('#publish'); if (pub) pub.onclick = function () { toast('Published v13 — the data warehouse reads the new rule set on its next ETL run.'); };
    root.querySelectorAll('[data-act="save-bar"]').forEach(function (b) { b.onclick = commitModel; });
    root.querySelectorAll('[data-act="discard"]').forEach(function (b) { b.onclick = function () { pendingModel = null; if (window.UI) UI.setUnsavedBar(document, false); paint(); }; });
  }

  function paint() {
    var body = tab === 'channel' ? tabChannel() : tab === 'model' ? tabModel() : tab === 'session' ? tabSession() : tabDomains();
    var cur = A.versions[0];
    var bar = (tab === 'model' && window.UI) ? UI.unsavedBar({ saveLabel: 'Save model' }) : '';
    root.innerHTML = bar +
      '<div class="view-wrap"><div class="pc-head"><div>' +
        '<div class="page-title">Attribution rules</div>' +
        '<div class="pc-sub">Platform-wide attribution config. Maintained here, read by the data warehouse — the data team executes, business owns the rules.</div></div>' +
        '<div class="pc-acts"><span class="ver">Version ' + cur.v + '</span><span class="pc-eff">effective ' + cur.date + '</span>' +
          '<button class="btn btn-default" id="verHist">' + ico(P.history, 16) + 'History</button>' +
          '<button class="btn btn-primary" id="publish">Publish</button></div></div>' +
      '<div class="tabs" style="margin-bottom:16px">' +
        '<div class="tab' + (tab === 'domains' ? ' active' : '') + '" data-tab="domains">Domain dictionary</div>' +
        '<div class="tab' + (tab === 'channel' ? ' active' : '') + '" data-tab="channel">Channel rules</div>' +
        '<div class="tab' + (tab === 'model' ? ' active' : '') + '" data-tab="model">Attribution model</div>' +
        '<div class="tab' + (tab === 'session' ? ' active' : '') + '" data-tab="session">Session</div></div>' +
      body + '</div>';
    bind();
  }

  window.__viewAttribution = function (rootEl) {
    root = rootEl;
    ico = window.PC.ico; toast = window.PC.toast; modal = window.PC.modal; drawer = window.PC.drawer; P = window.PC.P;
    paint();
  };
})();
