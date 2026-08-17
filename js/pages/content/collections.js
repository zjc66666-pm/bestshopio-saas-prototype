/* Help Center collection list and collection editor pages. */
(function () {
  'use strict';

  var S = window.SAAS_CONTENT_SHARED;
  var A = S.api;

  function collectionRows(entries) {
    if (!entries.length) return A().listEmpty('Create a collection or change the filters.');
    return entries.map(function (entry) {
      var collection = entry.item;
      var count = S.articlesInCollection(collection).length;
      var visibility = collection.status === 'Visible' ? 'Hide' : 'Show';
      return '<tr>' +
        '<td class="content-collection-cell">' +
          '<a class="ops-row-link" href="#/content/collections/' + A().esc(collection.id) + '/edit"><strong class="i18n-skip">' + (entry.depth ? '<span class="content-tree-indent" aria-hidden="true">↳</span>' : '') + A().esc(S.collectionName(collection)) + '</strong><span><span class="i18n-skip">' + A().esc(S.spaceName(collection)) + '</span> · ' + count + ' articles</span></a>' +
        '</td>' +
        '<td class="hide-md"><span class="ops-meta i18n-skip">' + A().esc(collection.description || '—') + '</span></td>' +
        '<td>' + A().status(collection.status) + '</td>' +
        '<td class="hide-sm"><span class="ops-meta">' + A().esc(collection.order) + '</span></td>' +
        '<td class="content-row-action"><span class="ops-row-actions"><a class="ops-link" href="#/content/collections/' + A().esc(collection.id) + '/edit">Edit</a><button type="button" class="ops-text-btn" data-collection-toggle="' + A().esc(collection.id) + '">' + visibility + '</button><button type="button" class="ops-text-btn content-icon-action" data-collection-move="' + A().esc(collection.id) + '" data-direction="1" title="Move up" aria-label="Move up">↑</button><button type="button" class="ops-text-btn content-icon-action" data-collection-move="' + A().esc(collection.id) + '" data-direction="-1" title="Move down" aria-label="Move down">↓</button></span></td>' +
      '</tr>';
    }).join('');
  }

  function renderCollectionList(root) {
    var content = S.content();
    var body =
      '<section class="content-workspace" data-page="help-center-collections">' +
        S.contentTabs('collections') +
        '<section class="content-table-card" aria-label="Help Center collections">' +
          '<form class="content-filter-bar content-filter-bar-compact" id="collectionFilters">' +
            '<label class="sr-only" for="collectionSpace">Content space</label>' +
            '<select class="ops-select" id="collectionSpace" aria-label="Content space"><option value="">All content spaces</option>' + S.spaces().map(function (space) {
              return '<option class="i18n-skip" value="' + A().esc(space.id) + '">' + A().esc(space.name) + '</option>';
            }).join('') + '</select>' +
            '<label class="sr-only" for="collectionStatus">Visibility</label>' +
            '<select class="ops-select" id="collectionStatus" aria-label="Visibility"><option value="">All visibility</option><option value="Visible">Visible</option><option value="Hidden">Hidden</option></select>' +
          '</form>' +
          '<div class="content-table-wrap"><table class="ops-table content-collection-table"><thead><tr><th scope="col">Collection</th><th scope="col" class="hide-md">Purpose</th><th scope="col">Visibility</th><th scope="col" class="hide-sm">Order</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead><tbody id="collectionRows"></tbody></table></div>' +
          '<footer class="content-table-foot"><span id="collectionResultCount"></span><span class="content-table-foot-note">Visible collections form the left navigation in each Help Center.</span></footer>' +
        '</section>' +
      '</section>';

    A().render(root, A().page(
      'Help Center',
      'Organize the Help Center navigation for every content space. Article headings create the separate in-article outline automatically.',
      '<a class="btn btn-primary" href="#/content/collections/new">New collection</a>',
      body
    ), function (scope) {
      var spaceField = scope.querySelector('#collectionSpace');
      var visibilityField = scope.querySelector('#collectionStatus');
      var rows = scope.querySelector('#collectionRows');
      var count = scope.querySelector('#collectionResultCount');

      function move(collection, direction) {
        var siblings = S.orderedCollections(S.recordSpaceId(collection)).filter(function (item) {
          return String(item.parentId || '') === String(collection.parentId || '');
        });
        var index = siblings.map(function (item) { return item.id; }).indexOf(collection.id);
        var target = siblings[index - direction];
        if (!target) return;
        var currentOrder = collection.order;
        collection.order = target.order;
        target.order = currentOrder;
        A().audit('Reordered Help Center collection', collection.name, 'Saved');
        draw();
      }
      function wireActions() {
        scope.querySelectorAll('[data-collection-toggle]').forEach(function (button) {
          button.onclick = function () {
            var collection = S.findCollection(button.getAttribute('data-collection-toggle'));
            var next = collection && collection.status === 'Visible' ? 'Hidden' : 'Visible';
            if (!collection) return;
            A().confirmDialog(
              next === 'Hidden' ? 'Hide collection' : 'Show collection',
              next === 'Hidden' ? 'Hidden collections no longer appear in Help Center navigation. Their articles remain intact.' : 'This collection will appear in Help Center navigation after its published articles are available.',
              next,
              function () {
                collection.status = next;
                A().audit(next === 'Hidden' ? 'Hid Help Center collection' : 'Showed Help Center collection', collection.name, next);
                A().toast(next === 'Hidden' ? 'Collection hidden.' : 'Collection visible.');
                draw();
              }
            );
          };
        });
        scope.querySelectorAll('[data-collection-move]').forEach(function (button) {
          button.onclick = function () {
            var collection = S.findCollection(button.getAttribute('data-collection-move'));
            if (collection) move(collection, +button.getAttribute('data-direction'));
          };
        });
      }
      function draw() {
        var entries = S.collectionTree(spaceField.value).filter(function (entry) {
          return !visibilityField.value || entry.item.status === visibilityField.value;
        });
        rows.innerHTML = collectionRows(entries);
        count.textContent = entries.length + ' collections';
        A().apply(rows);
        A().apply(count);
        wireActions();
      }

      scope.querySelector('#collectionFilters').onsubmit = function (event) { event.preventDefault(); draw(); };
      spaceField.onchange = draw;
      visibilityField.onchange = draw;
      draw();
    });
  }

  function renderCollectionEditor(root, collection, isNew) {
    var item = collection || {
      id: 'collection_' + Date.now(),
      spaceId: S.defaultSpaceId(),
      name: '',
      parentId: '',
      order: S.nextCollectionOrder(S.defaultSpaceId()),
      status: 'Visible',
      description: ''
    };
    var form =
      '<form class="ops-editor content-editor" id="collectionForm" data-page="help-center-collection-editor">' +
        '<section class="ops-form-card content-editor-main">' +
          '<div class="ops-panel-title">Collection</div>' +
          '<p class="content-form-intro">A collection is a visible navigation location. It can contain published articles and optional child collections.</p>' +
          '<label class="fld-label" for="collectionName">Collection name</label>' +
          '<input class="input" id="collectionName" value="' + A().esc(item.name) + '" placeholder="Enter collection name" required>' +
          '<label class="fld-label" for="collectionDescription">Purpose</label>' +
          '<textarea class="ops-short-textarea" id="collectionDescription" placeholder="Explain what merchants will find here">' + A().esc(item.description || '') + '</textarea>' +
          '<div class="ops-form-actions"><a class="btn btn-default" href="#/content/collections">Cancel</a><button type="submit" class="btn btn-primary">Save collection</button></div>' +
        '</section>' +
        '<aside class="ops-editor-side">' +
          '<section class="ops-form-card">' +
            '<div class="ops-panel-title">Navigation settings</div>' +
            '<label class="fld-label" for="collectionSpaceField">Content space</label>' +
            '<select class="input" id="collectionSpaceField"' + (isNew ? '' : ' disabled') + '>' + S.spaces().map(function (space) {
              return '<option class="i18n-skip" value="' + A().esc(space.id) + '"' + (space.id === S.recordSpaceId(item) ? ' selected' : '') + '>' + A().esc(space.name) + '</option>';
            }).join('') + '</select>' +
            (isNew ? '' : '<div class="ops-field-hint">The content space is fixed after creation so child collections and articles cannot be split across Help Centers.</div>') +
            '<label class="fld-label" for="collectionParent">Parent collection</label>' +
            '<select class="input" id="collectionParent">' + S.parentCollectionOptions(S.recordSpaceId(item), item.parentId, item.id) + '</select>' +
            '<label class="fld-label" for="collectionOrder">Display order</label>' +
            '<input class="input" id="collectionOrder" type="number" min="0" value="' + A().esc(item.order) + '">' +
            '<label class="fld-label" for="collectionVisibility">Visibility</label>' +
            '<select class="input" id="collectionVisibility"><option value="Visible"' + (item.status === 'Visible' ? ' selected' : '') + '>Visible</option><option value="Hidden"' + (item.status === 'Hidden' ? ' selected' : '') + '>Hidden</option></select>' +
            '<div class="ops-note">The navigation uses this hierarchy and order. Articles inherit their Help Center location from the selected collection.</div>' +
          '</section>' +
        '</aside>' +
      '</form>';

    A().render(root, A().page(
      isNew ? 'New collection' : 'Edit collection',
      'Maintain a Help Center navigation location without editing the article itself.',
      '',
      form,
      A().back('#/content/collections', 'Collections')
    ), function (scope) {
      var formEl = scope.querySelector('#collectionForm');
      var spaceField = scope.querySelector('#collectionSpaceField');
      var parentField = scope.querySelector('#collectionParent');
      spaceField.onchange = function () {
        parentField.innerHTML = S.parentCollectionOptions(spaceField.value, '', item.id);
        A().apply(parentField);
      };
      formEl.onsubmit = function (event) {
        event.preventDefault();
        var name = scope.querySelector('#collectionName').value.trim();
        var space = spaceField.value;
        var parentId = parentField.value;
        if (!name) { A().toast('Enter a collection name.'); return; }
        var duplicate = S.collections().filter(function (entry) {
          return entry.id !== item.id && S.recordSpaceId(entry) === space && S.collectionName(entry).toLowerCase() === name.toLowerCase();
        })[0];
        if (duplicate) { A().toast('A collection with this name already exists in this content space.'); return; }
        var parent = parentId ? S.findCollection(parentId) : null;
        item.spaceId = space;
        item.name = name;
        item.parentId = parent && S.recordSpaceId(parent) === space ? parent.id : '';
        item.order = Math.max(0, +scope.querySelector('#collectionOrder').value || 0);
        item.status = scope.querySelector('#collectionVisibility').value;
        item.description = scope.querySelector('#collectionDescription').value.trim();
        S.articlesInCollection(item).forEach(function (article) { S.syncArticleLocation(article, item); });
        if (isNew) S.collections().push(item);
        A().audit(isNew ? 'Created Help Center collection' : 'Updated Help Center collection', item.name, item.status);
        A().toast(isNew ? 'Collection created.' : 'Collection saved.');
        A().route('#/content/collections');
      };
    });
  }

  window.SAAS_CONTENT_PAGES = window.SAAS_CONTENT_PAGES || {};
  window.SAAS_CONTENT_PAGES.collectionList = renderCollectionList;
  window.SAAS_CONTENT_PAGES.collectionEditor = renderCollectionEditor;
})();
