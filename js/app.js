/* Platform Center - shell + router + simple views (Menu / Account / Category).
   Twin of the store admin: same chrome (.shell-root / .app-header / .app-body /
   .app-sidebar / .nav-item / #root), same theme.css component classes.
   Attribution lives in attribution.js. */
(function () {
  var D = window.DATA;

  // ---------- icons ----------
  function navico(p) { return '<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  function ico(p, sz) { sz = sz || 16; return '<svg viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  var P = {
    menu: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    account: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    category: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
    attribution: '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    right: '<path d="m9 18 6-6-6-6"/>', down: '<path d="m6 9 6 6 6-6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
  };

  // ---------- nav ----------
  var NAV = [
    { id: 'menu', label: 'Menu', icon: P.menu },
    { id: 'account', label: 'Account', icon: P.account },
    { id: 'category', label: 'Category', icon: P.category },
    { id: 'attribution', label: 'Attribution', icon: P.attribution },
  ];

  // ---------- shared helpers (exposed for attribution.js) ----------
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'pc-toast';
    t.innerHTML = '<span class="pc-toast-ico">' + ico(P.check, 15) + '</span><span>' + msg + '</span>';
    document.body.appendChild(t);
    if (window.I18N) window.I18N.apply(t);
    setTimeout(function () { t.classList.add('pc-toast-out'); }, 2200);
    setTimeout(function () { t.remove(); }, 2560);
  }
  function modal(html, onMount) {
    var b = document.createElement('div'); b.className = 'modal-backdrop';
    b.innerHTML = '<div class="modal"><button class="modal-x" data-mx aria-label="Close">' + ico(P.close, 18) + '</button>' + html + '</div>';
    b.addEventListener('mousedown', function (e) { if (e.target === b) b.remove(); });
    b.querySelectorAll('[data-mx]').forEach(function (mx) { mx.onclick = function () { b.remove(); }; });
    document.body.appendChild(b); if (onMount) onMount(b); if (window.I18N) window.I18N.apply(b); return b;
  }
  function drawer(html, onMount) {
    var b = document.createElement('div'); b.className = 'drawer-backdrop';
    b.innerHTML = '<div class="drawer">' + html + '</div>';
    b.addEventListener('mousedown', function (e) { if (e.target === b) b.remove(); });
    document.body.appendChild(b);
    b.querySelectorAll('[data-x]').forEach(function (x) { x.onclick = function () { b.remove(); }; });
    if (onMount) onMount(b); if (window.I18N) window.I18N.apply(b); return b;
  }
  window.PC = { ico: ico, toast: toast, modal: modal, drawer: drawer, P: P };

  // ---------- views ----------
  var root;
  var menuOpen = { 2: true, 3: true, 2008: true };
  var menuContext = 'main';
  var catOpen = { 1: true, 2: true, 3: true };

  function pillType() {} // (attribution-only)

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function titleCase(v) {
    return String(v || '').replace(/_/g, ' ').replace(/\b\w/g, function (m) { return m.toUpperCase(); });
  }

  function slug(v) {
    return String(v || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function groupPill(group) {
    var g = group || 'main';
    var labels = { main: 'Main', channel: 'Channel', app: 'App', settings_context: 'Settings menu' };
    var klass = g === 'settings_context' ? 'settings' : g;
    return '<span class="pill pill-' + esc(klass) + '">' + esc(labels[g] || titleCase(g)) + '</span>';
  }

  function currentMenuTree() {
    return menuContext === 'settings' ? D.settingsMenuTree : D.menuTree;
  }

  function currentGroupOptions() {
    return menuContext === 'settings'
      ? [{ value: 'settings_context', label: 'Settings menu' }]
      : D.menuSchema.navGroups;
  }

  function flattenMenus(nodes, parent, out) {
    out = out || [];
    (nodes || []).forEach(function (m) {
      out.push({ item: m, parent: parent || null });
      flattenMenus(m.children || [], m, out);
    });
    return out;
  }

  function findMenu(id) {
    var hit = null;
    flattenMenus(currentMenuTree()).some(function (row) { if (row.item.id === id) { hit = row; return true; } return false; });
    return hit;
  }

  function nextIds() {
    var menu = 1, perm = 1;
    flattenMenus(currentMenuTree()).forEach(function (row) {
      menu = Math.max(menu, Number(row.item.id || 0) + 1);
      (row.item.permissions || []).forEach(function (p) { perm = Math.max(perm, Number(p.id || 0) + 1); });
    });
    return { menu: menu, perm: perm };
  }

  function removeMenu(id) {
    function rm(list) {
      var idx = list.findIndex(function (m) { return m.id === id; });
      if (idx >= 0) return list.splice(idx, 1)[0];
      for (var i = 0; i < list.length; i++) {
        var got = rm(list[i].children || []);
        if (got) return got;
      }
      return null;
    }
    return rm(currentMenuTree());
  }

  function removePermission(id) {
    var removed = null;
    flattenMenus(currentMenuTree()).some(function (row) {
      var list = row.item.permissions || [];
      var idx = list.findIndex(function (p) { return p.id === id; });
      if (idx >= 0) { removed = list.splice(idx, 1)[0]; return true; }
      return false;
    });
    return removed;
  }

  function parentOptions(excludeId) {
    return currentMenuTree().filter(function (m) { return m.id !== excludeId; }).map(function (m) {
      return '<option value="' + esc(m.id) + '">' + esc(m.title) + '</option>';
    }).join('');
  }

  function optionList(list, selected) {
    return list.map(function (o) {
      var value = typeof o === 'string' ? o : o.value;
      var label = typeof o === 'string' ? titleCase(o) : o.label;
      return '<option value="' + esc(value) + '"' + (value === selected ? ' selected' : '') + '>' + esc(label) + '</option>';
    }).join('');
  }

  function insertMenu(record, pid) {
    if (pid) {
      var parent = findMenu(Number(pid));
      if (parent) {
        parent.item.children = parent.item.children || [];
        parent.item.children.push(record);
        menuOpen[parent.item.id] = true;
        return;
      }
    }
    currentMenuTree().push(record);
  }

  function flattenActiveMenus(nodes, group) {
    var out = [];
    (nodes || []).forEach(function (m) {
      if ((m.navGroup || 'main') === group && m.type !== 'group_title') out.push(m);
      (m.children || []).forEach(function (c) {
        if ((c.navGroup || m.navGroup || 'main') === group && c.type !== 'group_title') out.push(c);
      });
    });
    return out.sort(function (a, b) { return (b.sort || 0) - (a.sort || 0); });
  }

  function sidebarPreview() {
    function item(m, active) {
      return '<div class="preview-item' + (active ? ' active' : '') + '"><span class="preview-icon"></span><span>' + esc(m.title) + '</span></div>';
    }
    if (menuContext === 'settings') {
      var settingsContext = (D.settingsMenuTree || []).slice().sort(function (a, b) { return (b.sort || 0) - (a.sort || 0); });
      return '<aside class="menu-preview"><div class="preview-shell settings-preview">' +
        '<div class="preview-head"><div class="preview-title">Settings menu</div></div>' +
        '<div class="preview-nav compact">' + settingsContext.map(function (m, i) { return item(m, i === 0); }).join('') + '</div></div></aside>';
    }
    var main = flattenActiveMenus(D.menuTree, 'main').filter(function (m) { return m.type === 'menu'; });
    var channel = flattenActiveMenus(D.menuTree, 'channel');
    var app = flattenActiveMenus(D.menuTree, 'app');
    var settings = [{ title: 'Settings', route: '/admin/settings/base' }];
    return '<aside class="menu-preview"><div class="preview-shell">' +
      '<div class="preview-head"><div class="preview-title">Store admin sidebar</div></div>' +
      '<div class="preview-nav compact">' +
      main.map(function (m, i) { return item(m, i === 0); }).join('') +
      '<div class="preview-label">Channels</div>' + channel.map(function (m) { return item(m); }).join('') +
      (app.length ? '<div class="preview-label">Apps</div>' + app.map(function (m) { return item(m); }).join('') : '') +
      '<div class="preview-spacer"></div>' + settings.map(function (m) { return item(m); }).join('') +
      '</div></div></aside>';
  }

  function field(label, html, hint) {
    return '<label class="fld-label">' + label + '</label>' + html + (hint ? '<p class="fld-hint">' + hint + '</p>' : '');
  }

  function bindCount(scope, inputId, countId) {
    var input = scope.querySelector(inputId);
    var count = scope.querySelector(countId);
    if (!input || !count) return;
    function paint() { count.textContent = String(input.value.length) + ' / 100'; }
    input.addEventListener('input', paint);
    paint();
  }

  function menuDialog(mode, record, presetParentId) {
    var isEdit = mode === 'edit';
    var isSettingsContext = menuContext === 'settings';
    var current = record || {};
    var found = current.id ? findMenu(current.id) : null;
    var level = found && found.parent ? 'level_2' : (current.type === 'submenu' ? 'level_2' : 'level_1');
    var parentId = presetParentId || (found && found.parent ? found.parent.id : '');
    var ids = nextIds();
    var dialogTitle = isSettingsContext ? (isEdit ? 'Edit settings menu' : 'Add settings menu') : (isEdit ? 'Edit menu' : 'Add menu');
    var groupField = isSettingsContext ? '' : '<div>' + field('Group', '<select class="input" id="mGroup">' + optionList(currentGroupOptions(), current.navGroup || 'main') + '</select>') + '</div>';
    var form = '<div class="modal-head">' + dialogTitle + '</div>' +
      '<div class="modal-body menu-modal-body">' +
        '<div class="menu-type-inline" style="margin-bottom:12px"><span class="menu-type-inline-label">Menu type</span>' +
          '<label><input type="radio" name="menuLevel" value="level_1"' + (level === 'level_1' ? ' checked' : '') + (isEdit ? ' disabled' : '') + '> Level 1 Menu</label>' +
          '<label><input type="radio" name="menuLevel" value="level_2"' + (level === 'level_2' ? ' checked' : '') + (isEdit ? ' disabled' : '') + '> Level 2 Menu</label></div>' +
        '<div id="parentWrap"' + (level === 'level_2' ? '' : ' style="display:none"') + '><label class="fld-label required">Menu category</label><select class="input" id="mParent"><option value="">Select a menu category</option>' + parentOptions(current.id) + '</select></div>' +
        '<label class="fld-label required">Menu title</label>' +
        '<div class="count-input"><input class="input" id="mTitle" maxlength="100" placeholder="Please enter menu title" value="' + esc(current.title || '') + '"><span id="mTitleCount">0 / 100</span></div>' +
        '<label class="fld-label' + (level === 'level_1' ? ' required' : '') + '" id="mIconLabel">Icon</label>' +
        '<div class="image-upload"><input type="hidden" id="mIcon" value="' + esc(current.icon || '') + '"><input type="file" id="mIconFile" accept=".png,.jpg,.jpeg,.gif,.webp" hidden><button type="button" class="upload-card" id="mIconPick">' + (current.icon ? '<img src="' + esc(current.icon) + '" alt=""><span class="upload-remove" id="mIconRemove">' + ico(P.close, 12) + '</span>' : '<span class="upload-plus">' + ico(P.plus, 20) + '</span>') + '</button></div>' +
        '<label class="fld-label required">Route</label>' +
        '<div class="count-input"><input class="input" id="mRoute" maxlength="100" placeholder="Please enter route" value="' + esc(current.route || '') + '"><span id="mRouteCount">0 / 100</span></div>' +
        '<div class="two-col" style="gap:12px;grid-template-columns:' + (isSettingsContext ? '1fr' : '1fr 1fr') + '">' +
          '<div>' + field('Sort', '<input class="input" id="mSort" type="number" min="1" max="9999" placeholder="Higher sort show first" value="' + esc(current.sort || '') + '">') + '</div>' +
          groupField +
        '</div>' +
      '</div>' +
      '<div class="modal-foot"><button class="btn btn-default" data-mx>Cancel</button><button class="btn btn-primary" id="saveMenu">' + (isEdit ? 'Update' : 'Add') + '</button></div>';

    modal(form, function (b) {
      var parentSelect = b.querySelector('#mParent');
      if (parentSelect && parentId) parentSelect.value = String(parentId);
      bindCount(b, '#mTitle', '#mTitleCount');
      bindCount(b, '#mRoute', '#mRouteCount');
      var iconInput = b.querySelector('#mIcon');
      var iconFile = b.querySelector('#mIconFile');
      var iconPick = b.querySelector('#mIconPick');
      function paintIcon(value) {
        iconPick.innerHTML = value ? '<img src="' + esc(value) + '" alt=""><span class="upload-remove" id="mIconRemove">' + ico(P.close, 12) + '</span>' : '<span class="upload-plus">' + ico(P.plus, 20) + '</span>';
      }
      iconPick.onclick = function (ev) {
        if (ev.target.closest && ev.target.closest('#mIconRemove')) { iconInput.value = ''; paintIcon(''); return; }
        iconFile.click();
      };
      iconFile.onchange = function () {
        var file = iconFile.files && iconFile.files[0];
        if (!file) return;
        var url = URL.createObjectURL(file);
        iconInput.value = url;
        paintIcon(url);
      };
      b.querySelectorAll('input[name="menuLevel"]').forEach(function (r) {
        r.onchange = function () {
          var isLevel2 = r.value === 'level_2';
          b.querySelector('#parentWrap').style.display = isLevel2 ? '' : 'none';
          b.querySelector('#mIconLabel').classList.toggle('required', !isLevel2);
        };
      });
      b.querySelector('#saveMenu').onclick = function () {
        var selectedLevel = (b.querySelector('input[name="menuLevel"]:checked') || {}).value || level;
        var title = b.querySelector('#mTitle').value.trim();
        var icon = b.querySelector('#mIcon').value.trim();
        var route = b.querySelector('#mRoute').value.trim();
        var pid = selectedLevel === 'level_2' ? Number((b.querySelector('#mParent') || {}).value || 0) : 0;
        if (!title || (!isEdit && selectedLevel === 'level_1' && !icon) || !route || (selectedLevel === 'level_2' && !pid)) { toast('Please complete required fields'); return; }
        var payload = {
          id: isEdit ? current.id : ids.menu,
          title: title,
          icon: icon,
          route: route,
          sort: Number(b.querySelector('#mSort').value || 0),
          type: selectedLevel === 'level_2' ? 'submenu' : 'menu',
          navGroup: isSettingsContext ? 'settings_context' : b.querySelector('#mGroup').value,
          children: current.children || [],
          permissions: current.permissions || []
        };
        if (isEdit) removeMenu(current.id);
        insertMenu(payload, pid);
        b.remove();
        toast(isSettingsContext ? (isEdit ? 'Settings menu updated' : 'Settings menu added') : (isEdit ? 'Menu updated' : 'Menu added'));
        viewMenu();
      };
    });
  }

  function permissionDialog(mode, permission, menuId) {
    var isEdit = mode === 'edit';
    var ids = nextIds();
    var options = flattenMenus(currentMenuTree()).map(function (row) {
      return '<option value="' + row.item.id + '">' + esc(row.item.title) + '</option>';
    }).join('');
    modal('<div class="modal-head">' + (isEdit ? 'Edit permission' : 'Add permission') + '</div>' +
      '<div class="modal-body perm-modal-body">' +
        '<label class="fld-label required">Menu category</label>' +
        '<select class="input" id="pMenu"><option value="">Select a menu category</option>' + options + '</select>' +
        '<label class="fld-label required">Permission title</label>' +
        '<div class="count-input"><input class="input" id="pTitle" maxlength="100" placeholder="Please enter permission title" value="' + esc(permission ? permission.title : '') + '"><span id="pTitleCount">0 / 100</span></div>' +
        '<label class="fld-label required">Route</label>' +
        '<div class="count-input"><input class="input" id="pRoute" maxlength="100" placeholder="Please enter route" value="' + esc(permission ? permission.route : '') + '"><span id="pRouteCount">0 / 100</span></div>' +
      '</div>' +
      '<div class="modal-foot"><button class="btn btn-default" data-mx>Cancel</button><button class="btn btn-primary" id="savePerm">' + (isEdit ? 'Update' : 'Add') + '</button></div>', function (b) {
        b.querySelector('#pMenu').value = String(menuId || (permission && permission.menu_id) || '');
        bindCount(b, '#pTitle', '#pTitleCount');
        bindCount(b, '#pRoute', '#pRouteCount');
        b.querySelector('#savePerm').onclick = function () {
          var targetMenuId = Number(b.querySelector('#pMenu').value || 0);
          var title = b.querySelector('#pTitle').value.trim();
          var route = b.querySelector('#pRoute').value.trim();
          if (!targetMenuId || !title || !route) { toast('Please complete required fields'); return; }
          if (isEdit) removePermission(permission.id);
          var target = findMenu(targetMenuId);
          if (!target) { toast('Menu not found'); return; }
          target.item.permissions = target.item.permissions || [];
          target.item.permissions.push({ id: isEdit ? permission.id : ids.perm, menu_id: targetMenuId, title: title, route: route });
          menuOpen[targetMenuId] = true;
          b.remove();
          toast(isEdit ? 'Permission updated' : 'Permission added');
          viewMenu();
        };
      });
  }

  function confirmDelete(kind, label, onConfirm) {
    modal('<div class="modal-head">Delete ' + kind + '</div>' +
      '<div class="modal-body"><p style="font-size:13.5px;color:var(--ink-body);line-height:1.55;margin:0">Delete <b>' + esc(label) + '</b>? This only updates the prototype mock data.</p></div>' +
      '<div class="modal-foot"><button class="btn btn-default" data-mx>Cancel</button><button class="btn btn-danger" id="confirmDelete">Delete</button></div>', function (b) {
        b.querySelector('#confirmDelete').onclick = function () { onConfirm(); b.remove(); viewMenu(); toast(kind === 'menu' ? 'Menu deleted' : 'Permission deleted'); };
      });
  }

  function findPermission(id) {
    var hit = null;
    flattenMenus(currentMenuTree()).some(function (row) {
      return (row.item.permissions || []).some(function (p) { if (p.id === id) { hit = { permission: p, menu: row.item }; return true; } return false; });
    });
    return hit;
  }

  function viewMenu() {
    var rows = [];
    function push(m, lvl) {
      var kids = (m.children && m.children.length) || (m.permissions && m.permissions.length);
      var open = menuOpen[m.id];
      rows.push('<tr><td><span class="tree" style="padding-left:' + (lvl - 1) * 20 + 'px">' +
        (kids ? '<button class="tree-tg" data-exp="' + m.id + '">' + ico(open ? P.down : P.right, 16) + '</button>' : '<span class="tree-sp"></span>') +
        (lvl === 1 ? '<span class="tree-ico">' + ico(P.menu, 16) + '</span>' : '') +
        '<span>' + esc(m.title) + '</span></span></td>' +
        '<td>' + groupPill(m.navGroup || 'main') + '</td>' +
        '<td class="menu-code">' + esc(m.route || '--') + '</td>' +
        '<td class="num">' + esc(m.sort) + '</td>' +
        '<td><span class="row-acts"><button class="row-ic" data-act="add-perm" data-id="' + m.id + '" title="Add permission">' + ico(P.plus, 16) + '</button>' +
        '<button class="row-ic" data-act="edit-menu" data-id="' + m.id + '" title="Edit menu">' + ico(P.edit, 16) + '</button>' +
        '<button class="row-ic danger" data-act="delete-menu" data-id="' + m.id + '" title="Delete menu">' + ico(P.trash, 16) + '</button></span></td></tr>');
      if (open) {
        (m.children || []).forEach(function (c) { push(c, lvl + 1); });
        (m.permissions || []).forEach(function (p) {
          rows.push('<tr><td><span class="tree" style="padding-left:' + (lvl * 20 + 8) + 'px">' +
            '<span class="tree-sp"></span><span class="perm-tag">permission</span><span>' + esc(p.title) + '</span></span></td>' +
            '<td></td><td class="menu-code">' + esc(p.route) + '</td><td></td>' +
            '<td><span class="row-acts"><button class="row-ic" data-act="edit-perm" data-id="' + p.id + '" title="Edit permission">' + ico(P.edit, 16) + '</button>' +
            '<button class="row-ic danger" data-act="delete-perm" data-id="' + p.id + '" title="Delete permission">' + ico(P.trash, 16) + '</button></span></td></tr>');
        });
      }
    }
    currentMenuTree().forEach(function (m) { push(m, 1); });
    root.innerHTML =
      '<div class="view-wrap"><div class="pc-head"><div>' +
        '<div class="page-title">Menu</div></div>' +
        '<div class="pc-acts"><button class="btn btn-default" id="topAddPerm">Add permission</button><button class="btn btn-primary" id="topAddMenu">' + ico(P.plus, 16) + (menuContext === 'settings' ? 'Add settings menu' : 'Add menu') + '</button></div></div>' +
      '<div class="tabs" id="menuContextTabs" style="padding:0 8px;margin:0 0 10px"><div class="tab' + (menuContext === 'main' ? ' active' : '') + '" data-context="main">Main sidebar</div><div class="tab' + (menuContext === 'settings' ? ' active' : '') + '" data-context="settings">Settings menu</div></div>' +
      '<div class="pc-filters"><select class="filter-select"><option>Menu title</option><option>Route</option><option>Group</option></select>' +
        '<span class="pc-search">' + ico(P.search, 16) + '<input class="filter-input" placeholder="Search"></span></div>' +
      '<div class="menu-layout"><div class="panel menu-table-wrap"><table class="tbl">' +
        '<thead><tr><th>Menu title</th><th>Group</th><th>Route</th><th class="num">Sort</th><th style="width:120px">Actions</th></tr></thead>' +
        '<tbody>' + rows.join('') + '</tbody></table></div>' + sidebarPreview() + '</div></div>';
    root.querySelectorAll('[data-context]').forEach(function (b) { b.onclick = function () { menuContext = b.getAttribute('data-context'); viewMenu(); }; });
    root.querySelectorAll('[data-exp]').forEach(function (b) { b.onclick = function () { var id = +b.getAttribute('data-exp'); menuOpen[id] = !menuOpen[id]; viewMenu(); }; });
    root.querySelector('#topAddMenu').onclick = function () { menuDialog('add'); };
    root.querySelector('#topAddPerm').onclick = function () { permissionDialog('add'); };
    root.querySelectorAll('[data-act]').forEach(function (b) {
      b.onclick = function () {
        var act = b.getAttribute('data-act');
        var id = Number(b.getAttribute('data-id'));
        if (act === 'add-perm') permissionDialog('add', null, id);
        if (act === 'edit-menu') { var row = findMenu(id); if (row) menuDialog('edit', row.item); }
        if (act === 'delete-menu') { var rm = findMenu(id); if (rm) confirmDelete('menu', rm.item.title, function () { removeMenu(id); }); }
        if (act === 'edit-perm') { var fp = findPermission(id); if (fp) permissionDialog('edit', fp.permission, fp.menu.id); }
        if (act === 'delete-perm') { var dp = findPermission(id); if (dp) confirmDelete('permission', dp.permission.title, function () { removePermission(id); }); }
      };
    });
    if (window.I18N) window.I18N.apply(root);
  }

  function viewAccount() {
    var rows = D.accounts.map(function (a) {
      var pill = a.status === 'Access granted' ? 'pill-green' : 'pill-gray';
      return '<tr><td>' + a.account + '</td><td class="muted">' + a.storeText + '</td>' +
        '<td><span class="pill ' + pill + '"><span class="dot"></span>' + a.status + '</span></td></tr>';
    }).join('');
    root.innerHTML =
      '<div class="view-wrap"><div class="pc-head"><div>' +
        '<div class="page-title">Account</div>' +
        '<div class="pc-sub">Platform staff accounts and which stores each can access.</div></div></div>' +
      '<div class="pc-filters">' +
        '<select class="filter-select"><option>Account</option><option>Store</option></select>' +
        '<span class="pc-search">' + ico(P.search, 16) + '<input class="filter-input" placeholder="Search account or store"></span>' +
        '<select class="filter-select"><option>All status</option><option>Access granted</option><option>No access</option></select></div>' +
      '<div class="panel" style="overflow:hidden"><table class="tbl">' +
        '<thead><tr><th style="width:24%">Account</th><th style="width:46%">Store</th><th>Status</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div></div>';
    if (window.I18N) window.I18N.apply(root);
  }

  function viewCategory() {
    var rows = [];
    function push(c, lvl) {
      var kids = c.children && c.children.length;
      var open = catOpen[c.id];
      rows.push('<tr><td><span class="tree" style="padding-left:' + (lvl - 1) * 16 + 'px">' +
        (kids ? '<button class="tree-tg" data-cat="' + c.id + '">' + ico(open ? P.down : P.right, 16) + '</button>' : '<span class="tree-sp"></span>') +
        '<span>' + c.name + '</span></span></td>' +
        '<td class="muted" style="font-family:ui-monospace,Menlo,Consolas,monospace">' + c.platformId + '</td>' +
        '<td><span class="row-acts"><button class="row-ic" title="Edit">' + ico(P.edit, 16) + '</button>' +
        '<button class="row-ic danger" title="Delete">' + ico(P.trash, 16) + '</button></span></td></tr>');
      if (open && kids) c.children.forEach(function (k) { push(k, lvl + 1); });
    }
    D.categories.forEach(function (c) { push(c, 1); });
    root.innerHTML =
      '<div class="view-wrap"><div class="pc-head"><div>' +
        '<div class="page-title">Category</div>' +
        '<div class="pc-sub">Platform-wide product category standard. Pushed to all stores.</div></div>' +
        '<button class="btn btn-primary">' + ico(P.plus, 16) + 'Add category</button></div>' +
      '<div class="pc-filters"><span class="pc-search">' + ico(P.search, 16) + '<input class="filter-input" placeholder="Search category"></span></div>' +
      '<div class="panel" style="overflow:hidden"><table class="tbl">' +
        '<thead><tr><th style="width:60%">Category name</th><th>Platform ID</th><th style="width:100px">Actions</th></tr></thead>' +
        '<tbody>' + rows.join('') + '</tbody></table></div></div>';
    root.querySelectorAll('[data-cat]').forEach(function (b) { b.onclick = function () { var id = +b.getAttribute('data-cat'); catOpen[id] = !catOpen[id]; viewCategory(); }; });
    root.querySelectorAll('.row-ic').forEach(function (b) { b.onclick = function () { toast('Demo action stubbed'); }; });
    if (window.I18N) window.I18N.apply(root);
  }

  // ---------- sidebar + header chrome (mirrors store admin shell.js) ----------
  var navEl;
  function renderSidebar(active) {
    navEl.innerHTML = NAV.map(function (n) {
      return '<a class="nav-item' + (n.id === active ? ' active' : '') + '" href="#/' + n.id + '">' + navico(n.icon) + '<span>' + n.label + '</span></a>';
    }).join('');
    if (window.I18N) window.I18N.apply(navEl);
  }
  function userMenuHtml() {
    return '<div class="hdr-menu-head">' + ico(P.user, 16) + '<span>ryan@bestvoy.com</span></div>' +
      '<div class="hdr-menu-divider"></div>' +
      '<button class="hdr-menu-item">' + ico(P.lock, 16) + 'Change password</button>' +
      '<a class="hdr-menu-item" href="signin.html">' + ico(P.out, 16) + 'Sign out</a>';
  }

  function dispatch() {
    var id = (location.hash || '').replace(/^#\/?/, '').split('/')[0] || 'menu';
    renderSidebar(id);
    if (id === 'account') viewAccount();
    else if (id === 'category') viewCategory();
    else if (id === 'attribution') window.__viewAttribution(root);
    else viewMenu();
    root.scrollTop = 0;
  }

  function build() {
    var app = document.getElementById('app');
    app.classList.add('shell-root');
    app.innerHTML =
      '<header class="app-header">' +
        '<button class="sidebar-toggle" aria-label="Menu">' + ico(P.menu, 20) + '</button>' +
        '<a class="hdr-logo" href="#/menu"><span class="brand-mark">B</span>' +
        '<span class="hdr-logo-name">Platform Center</span></a>' +
        '<div class="hdr-right"><div class="hdr-menu-wrap">' +
          '<button class="hdr-user" id="hdr-user" aria-label="Account">' + ico(P.user, 18) + '</button></div></div>' +
      '</header>' +
      '<div class="app-body">' +
        '<aside class="app-sidebar scroll-thin"><nav class="nav-scroll scroll-thin"></nav></aside>' +
        '<div class="content-col flex-1 flex flex-col min-w-0">' +
          '<main id="view" class="shell-view flex-1 overflow-auto scroll-thin"><div id="root"></div></main></div>' +
      '</div>';
    navEl = app.querySelector('.nav-scroll');
    root = document.getElementById('root');

    var ub = app.querySelector('#hdr-user');
    ub.onclick = function (e) {
      e.stopPropagation();
      var wrap = ub.parentNode, exist = wrap.querySelector('.hdr-menu');
      document.querySelectorAll('.hdr-menu').forEach(function (m) { m.remove(); });
      if (exist) return;
      var pop = document.createElement('div'); pop.className = 'hdr-menu'; pop.innerHTML = userMenuHtml();
      wrap.appendChild(pop);
      if (window.I18N) window.I18N.apply(pop);
      setTimeout(function () { document.addEventListener('mousedown', function h(ev) { if (!ev.target.closest('.hdr-menu-wrap')) { pop.remove(); document.removeEventListener('mousedown', h); } }); }, 0);
    };
    var bd = document.createElement('div'); bd.className = 'sidebar-backdrop'; document.body.appendChild(bd);
    var aside = app.querySelector('.app-sidebar'), tg = app.querySelector('.sidebar-toggle');
    tg.onclick = function () { aside.classList.toggle('open'); bd.classList.toggle('show'); };
    bd.onclick = function () { aside.classList.remove('open'); bd.classList.remove('show'); };
    app.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a[href^="#/"]')) { aside.classList.remove('open'); bd.classList.remove('show'); } });

    if (!location.hash) location.replace('#/menu');
    window.addEventListener('hashchange', dispatch);
    dispatch();
    if (window.I18N) window.I18N.apply(app);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
