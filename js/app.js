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
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10Z"/><path d="M9 22v-8h6v8"/>',
    stores: '<path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16"/><path d="M15 9h5a2 2 0 0 1 2 2v10"/><path d="M8 7h3m-3 4h3m-3 4h3M3 21h18"/>',
    team: '<circle cx="9" cy="7" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 3.5a4 4 0 0 1 0 7.7M22 21a7 7 0 0 0-5-6.7"/>',
    file: '<path d="M6 2h8l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v5h5M8 13h8M8 17h6"/>',
    plug: '<path d="M12 2v6M8 5v3m8-3v3M7 9h10v2a5 5 0 0 1-10 0V9Zm5 7v6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    package: '<path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="m3 7 9 4 9-4M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
    shield: '<path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/>',
    menu: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    account: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    category: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
    attribution: '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    bestcheckout: '<path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"/><path d="M8 5V3m8 2V3M8 13h3m2 0h3M8 16h8"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    right: '<path d="m9 18 6-6-6-6"/>', down: '<path d="m6 9 6 6 6-6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  };

  // ---------- nav ----------
  var NAV = [
    { label: '', items: [
      { id: 'stores', label: 'Stores', icon: P.stores },
      { id: 'content', label: 'Help Center', icon: P.file },
      { id: 'category', label: 'Category', icon: P.category },
      { id: 'attribution', label: 'Attribution', icon: P.attribution },
      { id: 'menu', label: 'Menu', icon: P.menu },
      { id: 'account', label: 'Account', icon: P.account }
    ] }
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
  // Match the live Menu editor: its primary branches are expanded on first load
  // so operators can inspect child menus and permissions without extra clicks.
  var menuOpen = { 2: true, 3: true, 13: true };
  var catOpen = {};
  var menuQuery = { field: 'title', keyword: '' };
  // The live Account page keeps filter state and pagination together.  Keep the
  // same contract in the prototype so a new search always returns to page one.
  var accountQuery = { field: 'account', keyword: '', statuses: [], page: 1, limit: 20 };
  var categoryQuery = { field: 'name', keyword: '' };
  var accountStatusOpen = false;

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
    var labels = { main: 'Main', channel: 'Channel', app: 'App' };
    return '<span class="pill pill-' + esc(g) + '">' + esc(labels[g] || titleCase(g)) + '</span>';
  }

  function currentMenuTree() {
    return D.menuTree;
  }

  function currentGroupOptions() {
    return D.menuSchema.navGroups;
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

  function menuConflict(title, route, parentId, excludeId) {
    var normalizedTitle = String(title || '').trim().toLowerCase();
    var normalizedRoute = String(route || '').trim().toLowerCase();
    var titleExists = false;
    var routeExists = false;
    flattenMenus(currentMenuTree()).forEach(function (row) {
      var item = row.item;
      if (Number(item.id) === Number(excludeId)) return;
      var itemParentId = row.parent ? Number(row.parent.id) : 0;
      if (itemParentId === Number(parentId) && normalizedTitle && String(item.title || '').trim().toLowerCase() === normalizedTitle) titleExists = true;
      if (normalizedRoute && String(item.route || '').trim().toLowerCase() === normalizedRoute) routeExists = true;
    });
    return { titleExists: titleExists, routeExists: routeExists };
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
    var current = record || {};
    var found = current.id ? findMenu(current.id) : null;
    var level = found && found.parent ? 'level_2' : (current.type === 'submenu' ? 'level_2' : 'level_1');
    var parentId = presetParentId || (found && found.parent ? found.parent.id : '');
    var ids = nextIds();
    var dialogTitle = isEdit ? 'Edit menu' : 'Add menu';
    var groupField = '<div id="groupWrap"' + (level === 'level_2' ? ' style="display:none"' : '') + '>' + field('Group', '<select class="input" id="mGroup">' + optionList(currentGroupOptions(), current.navGroup || 'main') + '</select>') + '</div>';
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
        '<div class="two-col" id="menuMetaGrid" style="gap:12px;grid-template-columns:' + (level === 'level_2' ? '1fr' : '1fr 1fr') + '">' +
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
          b.querySelector('#groupWrap').style.display = isLevel2 ? 'none' : '';
          b.querySelector('#menuMetaGrid').style.gridTemplateColumns = isLevel2 ? '1fr' : '1fr 1fr';
        };
      });
      b.querySelector('#saveMenu').onclick = function () {
        var selectedLevel = (b.querySelector('input[name="menuLevel"]:checked') || {}).value || level;
        var title = b.querySelector('#mTitle').value.trim();
        var icon = b.querySelector('#mIcon').value.trim();
        var route = b.querySelector('#mRoute').value.trim();
        var pid = selectedLevel === 'level_2' ? Number((b.querySelector('#mParent') || {}).value || 0) : 0;
        var parent = selectedLevel === 'level_2' ? findMenu(pid) : null;
        if (!title || (!isEdit && selectedLevel === 'level_1' && !icon) || !route || (selectedLevel === 'level_2' && (!pid || !parent))) { toast('Please complete required fields'); return; }
        var conflict = menuConflict(title, route, pid, isEdit ? current.id : 0);
        if (conflict.titleExists) { toast('Menu title already exists at this level'); return; }
        if (conflict.routeExists) { toast('Route already exists'); return; }
        var payload = {
          id: isEdit ? current.id : ids.menu,
          title: title,
          icon: icon,
          route: route,
          sort: Number(b.querySelector('#mSort').value || 0),
          type: selectedLevel === 'level_2' ? 'submenu' : 'menu',
          children: current.children || [],
          permissions: current.permissions || []
        };
        if (selectedLevel !== 'level_2') payload.navGroup = b.querySelector('#mGroup').value;
        if (isEdit) removeMenu(current.id);
        insertMenu(payload, pid);
        b.remove();
        toast(isEdit ? 'Menu updated' : 'Menu added');
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
          var target = findMenu(targetMenuId);
          if (!target) { toast('Menu not found'); return; }
          var duplicate = (target.item.permissions || []).some(function (item) {
            if (isEdit && Number(item.id) === Number(permission.id)) return false;
            return String(item.title || '').trim().toLowerCase() === title.toLowerCase() || String(item.route || '').trim().toLowerCase() === route.toLowerCase();
          });
          if (duplicate) { toast('Permission title or route already exists'); return; }
          if (isEdit) removePermission(permission.id);
          target.item.permissions = target.item.permissions || [];
          target.item.permissions.push({ id: isEdit ? permission.id : ids.perm, menu_id: targetMenuId, title: title, route: route });
          menuOpen[targetMenuId] = true;
          b.remove();
          toast(isEdit ? 'Permission updated' : 'Permission added');
          viewMenu();
        };
      });
  }

  function confirmDelete(kind, onConfirm, refresh) {
    modal('<div class="modal-head modal-confirm-head"><span class="modal-confirm-icon">' + ico(P.info, 18) + '</span><span>Confirm to delete?</span></div>' +
      '<div class="modal-body modal-confirm-copy"><p>Once deleted, the data cannot be retrieved.</p><p>Please confirm before proceeding!</p></div>' +
      '<div class="modal-foot"><button class="btn btn-default" data-mx>Cancel</button><button class="btn btn-danger" id="confirmDelete">Confirm</button></div>', function (b) {
        b.querySelector('#confirmDelete').onclick = function () {
          onConfirm();
          b.remove();
          (refresh || viewMenu)();
          toast(kind === 'menu' ? 'Menu deleted' : kind === 'permission' ? 'Permission deleted' : 'Category deleted');
        };
      });
  }

  function findPermission(id) {
    var hit = null;
    flattenMenus(currentMenuTree()).some(function (row) {
      return (row.item.permissions || []).some(function (p) { if (p.id === id) { hit = { permission: p, menu: row.item }; return true; } return false; });
    });
    return hit;
  }

  var MENU_TITLE_ALIASES = {
    'Orders': '订单', 'Products': '商品', 'Collections': '商品系列', 'Reviews': '评价', 'Customers': '客户', 'Discounts': '折扣',
    'Content': '内容', 'Blog': '博客', 'Page': '页面', 'Menu': '菜单', 'Online store': '网上商店', 'Settings': '设置',
    'Basic settings': '基础设置', 'Payments': '收款', 'Currency': '币种', 'Checkout': '结账', 'Metafields': '元字段',
    'Ship locations': '发货地', 'Shipping rates': '运费', 'Role': '角色', 'Staff': '员工', 'BestCheckout': 'BestCheckout'
  };
  function filteredMenuTree(nodes) {
    var keyword = String(menuQuery.keyword || '').trim().toLowerCase();
    if (!keyword) return nodes || [];
    var field = menuQuery.field === 'route' ? 'route' : 'title';
    function matches(item) {
      var value = String((item || {})[field] || '');
      if (field === 'title') value += ' ' + (MENU_TITLE_ALIASES[(item || {}).title] || '');
      return value.toLowerCase().indexOf(keyword) >= 0;
    }
    function visit(list) {
      return (list || []).reduce(function (output, item) {
        var ownMatch = matches(item);
        var children = ownMatch ? (item.children || []) : visit(item.children || []);
        var permissions = ownMatch ? (item.permissions || []) : (item.permissions || []).filter(matches);
        if (ownMatch || children.length || permissions.length) {
          var copy = Object.assign({}, item);
          copy.children = children;
          copy.permissions = permissions;
          output.push(copy);
        }
        return output;
      }, []);
    }
    return visit(nodes);
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
        '<td>' + (lvl === 1 ? groupPill(m.navGroup || 'main') : '') + '</td>' +
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
        '<div class="pc-acts"><button class="btn btn-default" id="topAddPerm">Add permission</button><button class="btn btn-primary" id="topAddMenu">' + ico(P.plus, 16) + 'Add menu</button></div></div>' +
      '<div class="menu-layout"><div class="menu-list"><div class="pc-filters"><select class="filter-select"><option>Menu title</option><option>Route</option><option>Group</option></select>' +
        '<span class="pc-search">' + ico(P.search, 16) + '<input class="filter-input" placeholder="Search"></span></div>' +
      '<div class="panel menu-table-wrap"><table class="tbl">' +
        '<thead><tr><th>Menu title</th><th>Group</th><th>Route</th><th class="num">Sort</th><th style="width:120px">Actions</th></tr></thead>' +
        '<tbody>' + rows.join('') + '</tbody></table></div></div></div></div>';
    root.querySelectorAll('[data-exp]').forEach(function (b) { b.onclick = function () { var id = +b.getAttribute('data-exp'); menuOpen[id] = !menuOpen[id]; viewMenu(); }; });
    root.querySelector('#topAddMenu').onclick = function () { menuDialog('add'); };
    root.querySelector('#topAddPerm').onclick = function () { permissionDialog('add'); };
    root.querySelectorAll('[data-act]').forEach(function (b) {
      b.onclick = function () {
        var act = b.getAttribute('data-act');
        var id = Number(b.getAttribute('data-id'));
        if (act === 'add-perm') permissionDialog('add', null, id);
        if (act === 'edit-menu') { var row = findMenu(id); if (row) menuDialog('edit', row.item); }
        if (act === 'delete-menu') {
          var rm = findMenu(id);
          if (!rm) return;
          if ((rm.item.children || []).length || (rm.item.permissions || []).length) { toast('Unable to delete. This menu has nested sub-menus / permission. Please delete the sub-menus / permission first.'); return; }
          confirmDelete('menu', function () { removeMenu(id); }, viewMenu);
        }
        if (act === 'edit-perm') { var fp = findPermission(id); if (fp) permissionDialog('edit', fp.permission, fp.menu.id); }
        if (act === 'delete-perm') { var dp = findPermission(id); if (dp) confirmDelete('permission', function () { removePermission(id); }, viewMenu); }
      };
    });
    if (window.I18N) window.I18N.apply(root);
  }

  function viewAccount() {
    accountStatusOpen = false;
    root.innerHTML =
      '<div class="view-wrap"><div class="pc-head"><div>' +
        '<h1 class="page-title">Account</h1></div></div>' +
      '<div class="panel account-content-card"><div class="pc-filters account-filters">' +
        '<select class="filter-select" id="accountField"><option value="account">Account</option><option value="store">Store</option></select>' +
        '<span class="pc-search">' + ico(P.search, 16) + '<input id="accountSearch" class="filter-input" placeholder="Search account or store"><button class="pc-search-submit" id="accountSubmit" aria-label="Search accounts">' + ico(P.search, 15) + '</button></span>' +
        '<div class="account-status-filter" id="accountStatusFilter"><button class="filter-select account-status-trigger" type="button" id="accountStatusButton"><span id="accountStatusLabel">Status</span>' + ico(P.down, 14) + '</button><div class="account-status-popover" id="accountStatusPopover"><label><input type="checkbox" value="granted">Access granted</label><label><input type="checkbox" value="no_access">No access</label></div></div></div>' +
      '<div class="pc-filter-tags" id="accountTags"></div>' +
      '<div class="account-table-wrap"><table class="tbl">' +
        '<thead><tr><th style="width:24%">Account</th><th style="width:46%">Store</th><th>Status</th></tr></thead>' +
        '<tbody id="accountRows"></tbody></table></div><div class="account-table-foot"><span id="accountTotal"></span><div class="account-pagination" id="accountPagination"></div></div></div></div>';
    var statusCode = { 'Access granted': 'granted', 'No access': 'no_access' };
    var statusLabel = { granted: 'Access granted', no_access: 'No access' };
    var field = root.querySelector('#accountField');
    var search = root.querySelector('#accountSearch');
    var statusButton = root.querySelector('#accountStatusButton');
    var statusPopover = root.querySelector('#accountStatusPopover');
    field.value = accountQuery.field;
    search.value = accountQuery.keyword;
    root.querySelectorAll('#accountStatusPopover input').forEach(function (input) { input.checked = accountQuery.statuses.indexOf(input.value) >= 0; });
    function paintStatusFilter() {
      // The page root is shared by the hash router.  If a navigation happens
      // while the popover is open, the Account controls are already gone.
      // Guard the repaint so a stale document click can never affect another
      // SaaS module.
      var labelNode = root.querySelector('#accountStatusLabel');
      if (!labelNode || !statusPopover || !statusButton) return;
      var values = accountQuery.statuses;
      var label = !values.length ? 'Status' : (values.length === 1 ? statusLabel[values[0]] : values.length + ' selected');
      labelNode.textContent = label;
      statusPopover.classList.toggle('show', accountStatusOpen);
      statusButton.classList.toggle('active', accountStatusOpen || values.length > 0);
      if (window.I18N) window.I18N.apply(statusButton);
    }
    function matchedAccounts() {
      var query = String(accountQuery.keyword || '').toLowerCase();
      var searchField = accountQuery.field;
      var states = accountQuery.statuses;
      return D.accounts.filter(function (a) {
        var haystack = searchField === 'store' ? a.storeText : a.account;
        return (!query || haystack.toLowerCase().indexOf(query) >= 0) && (!states.length || states.indexOf(statusCode[a.status]) >= 0);
      });
    }
    function pager(total) {
      var pages = Math.max(1, Math.ceil(total / accountQuery.limit));
      if (accountQuery.page > pages) accountQuery.page = pages;
      var current = accountQuery.page;
      var shown = [];
      if (pages <= 5) {
        for (var i = 1; i <= pages; i++) shown.push(i);
      } else {
        shown = [1];
        if (current > 3) shown.push('…');
        for (var page = Math.max(2, current - 1); page <= Math.min(pages - 1, current + 1); page++) shown.push(page);
        if (current < pages - 2) shown.push('…');
        shown.push(pages);
      }
      var html = '<button type="button" class="pg-item' + (current === 1 ? ' disabled' : '') + '" data-account-page="' + Math.max(1, current - 1) + '"' + (current === 1 ? ' disabled' : '') + ' aria-label="Previous page">‹</button>';
      html += shown.map(function (item) {
        return item === '…' ? '<span class="account-page-ellipsis">…</span>' : '<button type="button" class="pg-item' + (item === current ? ' active' : '') + '" data-account-page="' + item + '">' + item + '</button>';
      }).join('');
      html += '<button type="button" class="pg-item' + (current === pages ? ' disabled' : '') + '" data-account-page="' + Math.min(pages, current + 1) + '"' + (current === pages ? ' disabled' : '') + ' aria-label="Next page">›</button>';
      html += '<select class="pg-size" id="accountPageSize" aria-label="Page size"><option value="10"' + (accountQuery.limit === 10 ? ' selected' : '') + '>10 / page</option><option value="20"' + (accountQuery.limit === 20 ? ' selected' : '') + '>20 / page</option><option value="50"' + (accountQuery.limit === 50 ? ' selected' : '') + '>50 / page</option><option value="100"' + (accountQuery.limit === 100 ? ' selected' : '') + '>100 / page</option></select>';
      return html;
    }
    function drawAccounts() {
      var searchField = accountQuery.field;
      var states = accountQuery.statuses;
      var matched = matchedAccounts();
      var total = matched.length;
      var pages = Math.max(1, Math.ceil(total / accountQuery.limit));
      if (accountQuery.page > pages) accountQuery.page = pages;
      var start = (accountQuery.page - 1) * accountQuery.limit;
      var visible = matched.slice(start, start + accountQuery.limit);
      var rows = visible.map(function (a) {
        var pill = a.status === 'Access granted' ? 'pill-green' : 'pill-gray';
        return '<tr><td>' + esc(a.account) + '</td><td class="muted">' + esc(a.storeText) + '</td>' +
          '<td><span class="pill ' + pill + '"><span class="dot"></span>' + esc(a.status) + '</span></td></tr>';
      }).join('');
      root.querySelector('#accountRows').innerHTML = rows || '<tr><td colspan="3" class="muted">No matching accounts</td></tr>';
      var tags = [];
      if (accountQuery.keyword) tags.push('<span class="pc-filter-tag"><span>' + esc(searchField === 'store' ? 'Store' : 'Account') + '</span>: <span>' + esc(accountQuery.keyword) + '</span><button type="button" data-clear-account="keyword" aria-label="Clear">' + ico(P.close, 13) + '</button></span>');
      if (states.length) tags.push('<span class="pc-filter-tag"><span>Status</span>: ' + states.map(function (value) { return '<span>' + esc(statusLabel[value]) + '</span>'; }).join(', ') + '<button type="button" data-clear-account="status" aria-label="Clear">' + ico(P.close, 13) + '</button></span>');
      root.querySelector('#accountTags').innerHTML = tags.join('');
      root.querySelector('#accountTotal').textContent = 'Total ' + total + ' records';
      root.querySelector('#accountPagination').innerHTML = pager(total);
      root.querySelectorAll('[data-clear-account]').forEach(function (button) { button.onclick = function () { accountQuery.page = 1; if (button.getAttribute('data-clear-account') === 'status') accountQuery.statuses = []; else accountQuery.keyword = ''; viewAccount(); }; });
      root.querySelectorAll('[data-account-page]').forEach(function (button) { button.onclick = function () { if (button.disabled) return; accountQuery.page = Number(button.getAttribute('data-account-page')); drawAccounts(); }; });
      root.querySelector('#accountPageSize').onchange = function (event) { accountQuery.limit = Number(event.target.value || 20); accountQuery.page = 1; drawAccounts(); };
      paintStatusFilter();
      if (window.I18N) window.I18N.apply(root.querySelector('#accountRows'));
      if (window.I18N) window.I18N.apply(root.querySelector('#accountTags'));
      if (window.I18N) window.I18N.apply(root.querySelector('#accountTotal'));
      if (window.I18N) window.I18N.apply(root.querySelector('#accountPagination'));
    }
    function submitAccountSearch() { accountQuery.field = field.value; accountQuery.keyword = search.value.trim(); accountQuery.page = 1; drawAccounts(); }
    search.onkeydown = function (event) { if (event.key === 'Enter') { event.preventDefault(); submitAccountSearch(); } };
    search.onblur = function () { if (search.value.trim() !== accountQuery.keyword) submitAccountSearch(); };
    root.querySelector('#accountSubmit').onclick = submitAccountSearch;
    field.onchange = function () { accountQuery.field = field.value; if (accountQuery.keyword) { accountQuery.page = 1; drawAccounts(); } };
    statusButton.onclick = function () { accountStatusOpen = !accountStatusOpen; paintStatusFilter(); };
    root.querySelectorAll('#accountStatusPopover input').forEach(function (input) {
      input.onchange = function () {
        var value = input.value;
        accountQuery.statuses = input.checked ? accountQuery.statuses.concat(accountQuery.statuses.indexOf(value) >= 0 ? [] : [value]) : accountQuery.statuses.filter(function (item) { return item !== value; });
        accountQuery.page = 1;
        drawAccounts();
      };
    });
    root.onclick = function (event) { if (!event.target.closest('#accountStatusFilter') && accountStatusOpen) { accountStatusOpen = false; paintStatusFilter(); } };
    drawAccounts();
    if (window.I18N) window.I18N.apply(root);
  }

  var CATEGORY_TAXONOMY = {
    shopify: [
      { id: 'aa-1', name: 'Apparel & Accessories > Clothing' },
      { id: 'aa-1-2', name: 'Apparel & Accessories > Clothing > Shirts & Tops' },
      { id: 'aa-1-3', name: 'Apparel & Accessories > Clothing > Pants' },
      { id: 'aa-1-5', name: 'Apparel & Accessories > Clothing > Outerwear' },
      { id: 'hb-1', name: 'Health & Beauty > Personal Care' },
      { id: 'hb-1-1', name: 'Health & Beauty > Personal Care > Skin Care' },
      { id: 'hb-1-2', name: 'Health & Beauty > Personal Care > Cosmetics' },
      { id: 'ha-1', name: 'Home & Garden' },
      { id: 'ha-1-4', name: 'Home & Garden > Kitchen & Dining' },
      { id: 'ha-1-6', name: 'Home & Garden > Decor' },
      { id: 'aa-2', name: 'Apparel & Accessories > Jewelry & Accessories' },
      { id: 'el-1', name: 'Electronics' }
    ],
    google: [
      { id: '1604', name: 'Apparel & Accessories > Clothing' },
      { id: '204', name: 'Apparel & Accessories > Clothing > Pants' },
      { id: '212', name: 'Apparel & Accessories > Clothing > Shirts & Tops' },
      { id: '5598', name: 'Apparel & Accessories > Clothing > Outerwear' },
      { id: '469', name: 'Health & Beauty > Personal Care' },
      { id: '567', name: 'Health & Beauty > Personal Care > Skin Care' },
      { id: '1434', name: 'Health & Beauty > Personal Care > Cosmetics' },
      { id: '536', name: 'Home & Garden' },
      { id: '638', name: 'Home & Garden > Kitchen & Dining' },
      { id: '696', name: 'Home & Garden > Decor' },
      { id: '188', name: 'Apparel & Accessories > Jewelry & Accessories' },
      { id: '222', name: 'Electronics' }
    ],
    axon: [
      { id: 'axon-apparel', name: 'Fashion > Apparel' },
      { id: 'axon-leggings', name: 'Fashion > Apparel > Leggings' },
      { id: 'axon-tops', name: 'Fashion > Apparel > Tops' },
      { id: 'axon-outerwear', name: 'Fashion > Apparel > Outerwear' },
      { id: 'axon-beauty', name: 'Beauty & Personal Care' },
      { id: 'axon-skincare', name: 'Beauty & Personal Care > Skin Care' },
      { id: 'axon-makeup', name: 'Beauty & Personal Care > Makeup' },
      { id: 'axon-home', name: 'Home & Living' },
      { id: 'axon-kitchen', name: 'Home & Living > Kitchen' },
      { id: 'axon-decor', name: 'Home & Living > Decor' },
      { id: 'axon-accessories', name: 'Fashion > Accessories' },
      { id: 'axon-electronics', name: 'Electronics' }
    ]
  };
  var CATEGORY_FILTER_OPTIONS = [
    { value: 'name', label: 'Category name' },
    { value: 'shopify_id', label: 'Shopify Category ID' },
    { value: 'shopify_breadcrumb', label: 'Shopify Category breadcrumb' },
    { value: 'google_id', label: 'Google Category ID' },
    { value: 'google_breadcrumb', label: 'Google Category breadcrumb' },
    { value: 'axon_id', label: 'Axon Category ID' },
    { value: 'axon_breadcrumb', label: 'Axon Category breadcrumb' }
  ];
  function flattenCategories(nodes, parent, out) {
    out = out || [];
    (nodes || []).forEach(function (item) { out.push({ item: item, parent: parent || null }); flattenCategories(item.children || [], item, out); });
    return out;
  }
  function findCategoryRow(id) {
    var hit = null;
    flattenCategories(D.categories).some(function (row) { if (Number(row.item.id) === Number(id)) { hit = row; return true; } return false; });
    return hit;
  }
  var CATEGORY_NAME_ALIASES = {
    'Apparel': '服饰', 'Leggings': '打底裤', 'Tops': '上装', 'Outerwear': '外套', 'Beauty': '美妆', 'Skincare': '护肤',
    'Makeup': '彩妆', 'Home & Living': '家居生活', 'Kitchen': '厨房', 'Decor': '装饰', 'Electronics': '电子产品', 'Accessories': '配饰'
  };
  function categoryValue(item, field) {
    var map = {
      name: 'name', shopify_id: 'shopifyCategoryId', shopify_breadcrumb: 'shopifyCategoryBreadcrumb',
      google_id: 'googleCategoryId', google_breadcrumb: 'googleCategoryBreadcrumb',
      axon_id: 'axonCategoryId', axon_breadcrumb: 'axonCategoryBreadcrumb'
    };
    var value = String((item || {})[map[field] || 'name'] || '');
    if (field === 'name') value += ' ' + (CATEGORY_NAME_ALIASES[(item || {}).name] || '');
    return value;
  }
  function filteredCategoryTree(nodes) {
    var keyword = String(categoryQuery.keyword || '').trim().toLowerCase();
    if (!keyword) return nodes || [];
    function visit(list) {
      return (list || []).reduce(function (output, item) {
        var ownMatch = categoryValue(item, categoryQuery.field).toLowerCase().indexOf(keyword) >= 0;
        var children = ownMatch ? (item.children || []) : visit(item.children || []);
        if (ownMatch || children.length) {
          var copy = Object.assign({}, item);
          copy.children = children;
          output.push(copy);
        }
        return output;
      }, []);
    }
    return visit(nodes);
  }
  function collectCategoryIds(item, target) {
    if (!item) return target;
    target[Number(item.id)] = true;
    (item.children || []).forEach(function (child) { collectCategoryIds(child, target); });
    return target;
  }
  function categoryParents(excludeId, selected) {
    var excluded = {};
    if (excludeId) { var current = findCategoryRow(excludeId); if (current) collectCategoryIds(current.item, excluded); }
    return '<option value="">Select a parent category</option>' + flattenCategories(D.categories).filter(function (row) { return !excluded[Number(row.item.id)]; }).map(function (row) {
      return '<option value="' + esc(row.item.id) + '"' + (Number(selected) === Number(row.item.id) ? ' selected' : '') + '>' + esc(row.item.name) + '</option>';
    }).join('');
  }
  function taxonomyOptions(platform, selected) {
    return '<option value="">Please select ' + esc(platform === 'axon' ? 'Axon' : platform === 'shopify' ? 'Shopify' : 'Google') + ' category</option>' + (CATEGORY_TAXONOMY[platform] || []).map(function (item) {
      return '<option value="' + esc(item.id) + '"' + (item.id === selected ? ' selected' : '') + '>' + esc(item.name) + '</option>';
    }).join('');
  }
  function selectedTaxonomy(platform, id) {
    return (CATEGORY_TAXONOMY[platform] || []).filter(function (item) { return item.id === id; })[0] || { id: '', name: '' };
  }
  function detachCategory(id, nodes) {
    var list = nodes || D.categories;
    var index = list.findIndex(function (item) { return Number(item.id) === Number(id); });
    if (index >= 0) return list.splice(index, 1)[0];
    for (var i = 0; i < list.length; i++) { var found = detachCategory(id, list[i].children || []); if (found) return found; }
    return null;
  }
  function nextCategoryId() {
    return flattenCategories(D.categories).reduce(function (max, row) { return Math.max(max, Number(row.item.id) || 0); }, 0) + 1;
  }
  function categoryDialog(mode, current) {
    var editing = mode === 'edit';
    var row = current ? findCategoryRow(current.id) : null;
    var originalParent = row && row.parent ? row.parent.id : '';
    var initialType = originalParent ? 'sub_category' : 'level_1';
    var title = editing ? 'Edit category' : 'Add category';
    var body = '<div class="modal-head">' + title + '</div><div class="modal-body category-modal-body">' +
      '<div class="menu-type-inline category-type-inline"><span class="menu-type-inline-label">Category type</span><label><input type="radio" name="categoryType" value="level_1"' + (initialType === 'level_1' ? ' checked' : '') + '> Level 1 category</label><label><input type="radio" name="categoryType" value="sub_category"' + (initialType === 'sub_category' ? ' checked' : '') + '> Sub-category</label></div>' +
      '<div id="categoryParentWrap"' + (initialType === 'sub_category' ? '' : ' style="display:none"') + '><label class="fld-label required">Parent category</label><select class="input" id="catParent">' + categoryParents(current && current.id, originalParent) + '</select></div>' +
      '<label class="fld-label required">Category name</label><input class="input" id="catName" maxlength="100" value="' + esc(current ? current.name : '') + '" placeholder="Please enter category name">' +
      '<label class="fld-label">Sort</label><div class="sort-field"><input class="input" id="catSort" type="number" min="1" max="9999" value="' + esc(current && current.sort != null ? current.sort : '') + '"><span>Higher sort show first</span></div>' +
      '<label class="fld-label">Shopify category</label><select class="input" id="catShopify">' + taxonomyOptions('shopify', current && current.shopifyCategoryId) + '</select>' +
      '<label class="fld-label">Google category</label><select class="input" id="catGoogle">' + taxonomyOptions('google', current && current.googleCategoryId) + '</select>' +
      '<label class="fld-label">Axon category</label><select class="input" id="catAxon">' + taxonomyOptions('axon', current && current.axonCategoryId) + '</select>' +
      '</div><div class="modal-foot"><button class="btn btn-default" data-mx>Cancel</button><button class="btn btn-primary" id="saveCategory">' + (editing ? 'Update' : 'Add') + '</button></div>';
    modal(body, function (layer) {
      layer.querySelectorAll('input[name="categoryType"]').forEach(function (input) { input.onchange = function () { layer.querySelector('#categoryParentWrap').style.display = input.value === 'sub_category' && input.checked ? '' : 'none'; }; });
      layer.querySelector('#saveCategory').onclick = function () {
        var name = layer.querySelector('#catName').value.trim();
        var categoryType = (layer.querySelector('input[name="categoryType"]:checked') || {}).value || 'level_1';
        var parentId = categoryType === 'sub_category' ? Number(layer.querySelector('#catParent').value || 0) : 0;
        var duplicate = flattenCategories(D.categories).some(function (candidate) { return Number(candidate.item.id) !== Number(current && current.id) && String(candidate.item.name).toLowerCase() === name.toLowerCase() && Number(candidate.parent && candidate.parent.id || 0) === parentId; });
        if (!name || (categoryType === 'sub_category' && !parentId)) { toast('Please complete required fields'); return; }
        if (duplicate) { toast('Category name already exists'); return; }
        var item = current || { id: nextCategoryId(), children: [] };
        var parent = parentId ? findCategoryRow(parentId) : null;
        var shopify = selectedTaxonomy('shopify', layer.querySelector('#catShopify').value);
        var google = selectedTaxonomy('google', layer.querySelector('#catGoogle').value);
        var axon = selectedTaxonomy('axon', layer.querySelector('#catAxon').value);
        item.name = name; item.sort = Number(layer.querySelector('#catSort').value || 0) || undefined; item.platformId = item.platformId || ('cat_' + slug(name));
        item.shopifyCategoryId = shopify.id; item.shopifyCategoryBreadcrumb = shopify.name;
        item.googleCategoryId = google.id; item.googleCategoryBreadcrumb = google.name;
        item.axonCategoryId = axon.id; item.axonCategoryBreadcrumb = axon.name;
        if (editing) detachCategory(item.id);
        item.level = parent ? (Number(parent.item.level || 1) + 1) : 1;
        if (parent) { parent.item.children = parent.item.children || []; parent.item.children.push(item); catOpen[parent.item.id] = true; }
        else D.categories.push(item);
        layer.remove(); toast(editing ? 'Category updated' : 'Category added'); viewCategory();
      };
    });
  }
  function confirmCategoryDelete(item) {
    if ((item.children || []).length) { toast('Unable to delete. This category has nested sub-category. Please delete the sub-category first.'); return; }
    confirmDelete('category', function () { detachCategory(item.id); }, viewCategory);
  }
  function categoryReference(id, breadcrumb) {
    return id ? '<span class="category-taxonomy" title="' + esc(breadcrumb || '') + '">' + esc(id) + '</span>' : '<span class="muted">--</span>';
  }
  function viewCategory() {
    var rows = [];
    function push(c, lvl) {
      var kids = c.children && c.children.length;
      // The online page expands matching branches while searching, but keeps
      // the normal initial tree collapsed until a user explicitly opens it.
      var open = categoryQuery.keyword ? true : catOpen[c.id];
      rows.push('<tr><td><span class="tree" style="padding-left:' + (lvl - 1) * 16 + 'px">' +
        (kids ? '<button class="tree-tg" data-cat="' + c.id + '">' + ico(open ? P.down : P.right, 16) + '</button>' : '<span class="tree-sp"></span>') +
        '<span>' + esc(c.name) + '</span></span></td>' +
        '<td class="cat-sort">' + esc(c.sort || '--') + '</td>' +
        '<td>' + categoryReference(c.shopifyCategoryId, c.shopifyCategoryBreadcrumb) + '</td>' +
        '<td class="cat-google">' + categoryReference(c.googleCategoryId, c.googleCategoryBreadcrumb) + '</td>' +
        '<td class="cat-axon">' + categoryReference(c.axonCategoryId, c.axonCategoryBreadcrumb) + '</td>' +
        '<td><span class="row-acts"><button class="row-ic" data-cat-act="edit" data-cat-id="' + c.id + '" title="Edit category">' + ico(P.edit, 16) + '</button>' +
        '<button class="row-ic danger" data-cat-act="delete" data-cat-id="' + c.id + '" title="Delete category">' + ico(P.trash, 16) + '</button></span></td></tr>');
      if (open && kids) c.children.forEach(function (child) { push(child, lvl + 1); });
    }
    filteredCategoryTree(D.categories).forEach(function (category) { push(category, 1); });
    var activeOption = CATEGORY_FILTER_OPTIONS.filter(function (item) { return item.value === categoryQuery.field; })[0] || CATEGORY_FILTER_OPTIONS[0];
    root.innerHTML =
      '<div class="view-wrap"><div class="pc-head"><div><h1 class="page-title">Category</h1></div>' +
        '<button class="btn btn-primary" id="addCategory">' + ico(P.plus, 16) + 'Add category</button></div>' +
      '<div class="panel category-content-card"><div class="pc-filters category-filters"><select class="filter-select" id="categoryField">' + CATEGORY_FILTER_OPTIONS.map(function (item) { return '<option value="' + item.value + '">' + item.label + '</option>'; }).join('') + '</select>' +
        '<span class="pc-search">' + ico(P.search, 16) + '<input id="categorySearch" class="filter-input" placeholder="Search" value="' + esc(categoryQuery.keyword) + '"><button class="pc-search-submit" id="categorySubmit" aria-label="Search categories">' + ico(P.search, 15) + '</button></span></div>' +
        (categoryQuery.keyword ? '<div class="pc-filter-tags"><span class="pc-filter-tag"><span>' + esc(activeOption.label) + '</span>: <span>' + esc(categoryQuery.keyword) + '</span><button type="button" data-clear-category aria-label="Clear">' + ico(P.close, 13) + '</button></span></div>' : '') +
        '<div class="category-table-wrap"><table class="tbl category-table"><thead><tr><th style="width:33%">Category name</th><th class="cat-sort" style="width:8%">Sort</th><th style="width:17%">Shopify</th><th class="cat-google" style="width:17%">Google</th><th class="cat-axon" style="width:17%">Axon</th><th style="width:8%">Action</th></tr></thead>' +
        '<tbody>' + (rows.join('') || '<tr><td colspan="6" class="muted">No matching records</td></tr>') + '</tbody></table></div></div></div>';
    var categoryField = root.querySelector('#categoryField');
    var categorySearch = root.querySelector('#categorySearch');
    categoryField.value = categoryQuery.field;
    function submitCategorySearch() { categoryQuery.field = categoryField.value; categoryQuery.keyword = categorySearch.value.trim(); viewCategory(); }
    categoryField.onchange = function () { categoryQuery.field = categoryField.value; if (categorySearch.value.trim()) submitCategorySearch(); };
    categorySearch.onkeydown = function (event) { if (event.key === 'Enter') { event.preventDefault(); submitCategorySearch(); } };
    categorySearch.onblur = function () { if (categorySearch.value.trim() !== categoryQuery.keyword) submitCategorySearch(); };
    root.querySelector('#categorySubmit').onclick = submitCategorySearch;
    root.querySelectorAll('[data-clear-category]').forEach(function (button) { button.onclick = function () { categoryQuery.keyword = ''; viewCategory(); }; });
    root.querySelectorAll('[data-cat]').forEach(function (button) { button.onclick = function () { var id = +button.getAttribute('data-cat'); catOpen[id] = !catOpen[id]; viewCategory(); }; });
    root.querySelector('#addCategory').onclick = function () { categoryDialog('add'); };
    root.querySelectorAll('[data-cat-act]').forEach(function (button) { button.onclick = function () { var found = findCategoryRow(button.getAttribute('data-cat-id')); if (!found) return; if (button.getAttribute('data-cat-act') === 'edit') categoryDialog('edit', found.item); else confirmCategoryDelete(found.item); }; });
    if (window.I18N) window.I18N.apply(root);
  }

  // ---------- sidebar + header chrome (mirrors store admin shell.js) ----------
  var navEl;
  function renderSidebar(active) {
    navEl.innerHTML = NAV.map(function (group) {
      var groupLabel = group.label ? '<div class="nav-group-label">' + group.label + '</div>' : '';
      var ariaLabel = group.label ? ' aria-label="' + esc(group.label) + '"' : '';
      return '<section class="nav-section"' + ariaLabel + '>' + groupLabel + group.items.map(function (n) {
        return '<a class="nav-item' + (n.id === active ? ' active' : '') + '" href="#/' + n.id + '">' + navico(n.icon) + '<span>' + n.label + '</span></a>';
      }).join('') + '</section>';
    }).join('');
    if (window.I18N) window.I18N.apply(navEl);
  }
  function userMenuHtml() {
    return '<div class="hdr-menu-head">' + ico(P.user, 16) + '<span>ryan@bestvoy.com</span></div>' +
      '<div class="hdr-menu-divider"></div>' +
      '<button class="hdr-menu-item">' + ico(P.lock, 16) + 'Change password</button>' +
      '<a class="hdr-menu-item" href="signin.html">' + ico(P.out, 16) + 'Sign out</a>';
  }

  function parseHash() {
    var raw = (location.hash || '').replace(/^#\/?/, '');
    var qi = raw.indexOf('?');
    var path = qi >= 0 ? raw.slice(0, qi) : raw;
    var query = {};
    if (qi >= 0) {
      raw.slice(qi + 1).split('&').forEach(function (pair) {
        if (!pair) return;
        var eq = pair.indexOf('=');
        var key = decodeURIComponent((eq >= 0 ? pair.slice(0, eq) : pair).replace(/\+/g, ' '));
        var val = decodeURIComponent((eq >= 0 ? pair.slice(eq + 1) : '').replace(/\+/g, ' '));
        if (key) query[key] = val;
      });
    }
    return { parts: path.split('/').filter(Boolean), query: query };
  }
  function isInstallEmailPreview() {
    return parseHash().parts[0] === 'install-email-preview';
  }

  function dispatch() {
    var parsed = parseHash();
    var parts = parsed.parts;
    var id = parts[0] || 'action-center';
    document.querySelectorAll('.modal-backdrop, .drawer-backdrop').forEach(function (layer) { layer.remove(); });
    if (isInstallEmailPreview()) {
      document.body.classList.add('is-email-preview');
      var app = document.getElementById('app');
      app.className = '';
      if (window.SAAS_OPS && typeof window.SAAS_OPS.installEmailPreview === 'function') {
        window.SAAS_OPS.installEmailPreview(app, parsed.query);
      }
      return;
    }
    if (document.body.classList.contains('is-email-preview')) {
      location.reload();
      return;
    }
    // Views that need document-wide click handling (currently Account's status
    // filter) bind it directly on #root.  Always remove the outgoing handler
    // before the shared root is rendered by another route.
    root.onclick = null;
    renderSidebar(id);
    var route = window.SAAS_PAGE_MANIFEST && window.SAAS_PAGE_MANIFEST.find(id);
    if (!route || typeof route.render !== 'function') { location.replace('#/action-center'); return; }
    route.render(root, parts);
    root.scrollTop = 0;
  }

  function build() {
    var app = document.getElementById('app');
    if (isInstallEmailPreview()) {
      window.addEventListener('hashchange', dispatch);
      dispatch();
      return;
    }
    app.classList.add('shell-root');
    app.innerHTML =
      '<header class="app-header">' +
        '<button class="sidebar-toggle" aria-label="Menu">' + ico(P.menu, 20) + '</button>' +
        '<a class="hdr-logo" href="#/action-center"><img class="brand-mark-img" src="assets/brand-logo.svg?v=20260907-logo3" width="32" height="32" alt="BestShopio &amp; BestCheckout">' +
        '<span class="hdr-logo-name">BestShopio &amp; BestCheckout Platform</span></a>' +
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

    if (!location.hash) location.replace('#/action-center');
    window.addEventListener('hashchange', dispatch);
    dispatch();
    if (window.I18N) window.I18N.apply(app);
  }

  // System pages are still being split out of this shell.  Publishing this
  // bridge keeps the route manifest independent from the shell implementation
  // and gives the Next.js handoff one obvious page boundary.
  window.SAAS_SYSTEM_PAGES = {
    account: viewAccount,
    menu: viewMenu,
    category: viewCategory
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
