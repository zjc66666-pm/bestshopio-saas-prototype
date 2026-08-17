/* Content Space list and editor pages.
 *
 * A space is the publishing destination, audience and language boundary for a
 * Help Center. Collections and articles reference its stable `spaceId`; names
 * can therefore be changed here without breaking existing content.
 */
(function () {
  'use strict';

  var S = window.SAAS_CONTENT_SHARED;
  var A = S.api;

  function articlesForSpace(space) {
    return S.articles().filter(function (article) { return S.recordSpaceId(article) === space.id; });
  }

  function rowMarkup(list) {
    if (!list.length) return A().listEmpty('Create a content space or change the filters.');
    return list.map(function (space) {
      var collectionCount = S.orderedCollections(space.id).length;
      var articleCount = articlesForSpace(space).length;
      return '<tr>' +
        '<td class="content-space-name-cell"><a class="ops-row-link" href="#/content/spaces/' + A().esc(space.id) + '/edit"><strong class="i18n-skip">' + A().esc(space.name) + '</strong><span><span class="i18n-skip">' + A().esc(space.audience) + '</span> · ' + collectionCount + ' collections · ' + articleCount + ' articles</span></a></td>' +
        '<td class="hide-md">' + A().esc(space.channel) + '</td>' +
        '<td class="hide-sm"><span class="content-locale-list">' + S.localesForSpace(space).map(function (locale) { return '<span>' + A().esc(locale) + '</span>'; }).join('') + '</span></td>' +
        '<td class="hide-md"><span class="ops-meta i18n-skip">' + A().esc(space.url || '—') + '</span></td>' +
        '<td>' + A().status(space.status) + '</td>' +
        '<td class="content-row-action"><a class="ops-link" href="#/content/spaces/' + A().esc(space.id) + '/edit">Edit</a></td>' +
      '</tr>';
    }).join('');
  }

  function renderSpaceList(root) {
    var body =
      '<section class="content-workspace" data-page="help-center-spaces">' +
        S.contentTabs('spaces') +
        '<section class="content-table-card" aria-label="Content spaces">' +
          '<form class="content-filter-bar" id="spaceFilters" role="search">' +
            '<label class="sr-only" for="spaceSearch">Search content spaces</label>' +
            '<span class="ops-search content-search-field">' + A().icon('search', 16) + '<input id="spaceSearch" autocomplete="off" placeholder="Search content spaces"></span>' +
            '<label class="sr-only" for="spaceStatus">Publishing state</label>' +
            '<select class="ops-select content-status-filter" id="spaceStatus" aria-label="Publishing state"><option value="">All states</option><option value="Live">Live</option><option value="Draft">Draft</option><option value="Archived">Archived</option></select>' +
          '</form>' +
          '<div class="content-table-wrap"><table class="ops-table content-space-table"><thead><tr><th scope="col">Content space</th><th scope="col" class="hide-md">Channel</th><th scope="col" class="hide-sm">Locales</th><th scope="col" class="hide-md">Destination</th><th scope="col">Status</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead><tbody id="spaceRows"></tbody></table></div>' +
          '<footer class="content-table-foot"><span id="spaceResultCount"></span><span class="content-table-foot-note">Each content space has its own audience, destination and supported languages.</span></footer>' +
        '</section>' +
      '</section>';

    A().render(root, A().page(
      'Help Center',
      'Manage where public Help Center articles and in-product notices are published. Space names can change safely because articles and collections use stable IDs.',
      '<a class="btn btn-primary" href="#/content/spaces/new">New content space</a>',
      body
    ), function (scope) {
      var searchField = scope.querySelector('#spaceSearch');
      var stateField = scope.querySelector('#spaceStatus');
      var rows = scope.querySelector('#spaceRows');
      var count = scope.querySelector('#spaceResultCount');
      function draw() {
        var query = (searchField.value || '').trim().toLowerCase();
        var state = stateField.value;
        var list = S.spaces().filter(function (space) {
          return (!query || (space.name + ' ' + space.audience + ' ' + space.channel + ' ' + (space.url || '')).toLowerCase().indexOf(query) >= 0) && (!state || space.status === state);
        });
        rows.innerHTML = rowMarkup(list);
        count.textContent = list.length + ' content spaces';
        A().apply(rows);
        A().apply(count);
      }
      scope.querySelector('#spaceFilters').onsubmit = function (event) { event.preventDefault(); draw(); };
      searchField.oninput = draw;
      stateField.onchange = draw;
      draw();
    });
  }

  function newSpace() {
    var stamp = Date.now();
    return {
      id: 'space_' + stamp,
      name: '',
      audience: '',
      channel: 'Public help center',
      url: '',
      defaultLocale: 'en-US',
      supportedLocales: ['en-US'],
      status: 'Draft'
    };
  }

  function localeCheckbox(locale, label, selected) {
    return '<label class="content-locale-option"><input type="checkbox" name="spaceLocale" value="' + locale + '"' + (selected ? ' checked' : '') + '><span>' + label + '</span></label>';
  }

  function renderSpaceEditor(root, space, isNew) {
    var item = space || newSpace();
    var collections = S.orderedCollections(item.id);
    var articles = articlesForSpace(item);
    var liveArticles = articles.filter(function (article) { return article.status === 'Published'; }).length;
    var configuredLocales = S.localesForSpace(item);
    var form =
      '<form class="ops-editor content-editor content-space-editor" id="spaceForm" data-page="help-center-space-editor">' +
        '<section class="ops-form-card content-editor-main">' +
          '<div class="ops-panel-title">Content space</div>' +
          '<p class="content-form-intro">Use a content space for one published destination and audience. It is the parent record for its Help Center navigation and article URLs.</p>' +
          '<label class="fld-label" for="spaceName">Name</label>' +
          '<input class="input" id="spaceName" value="' + A().esc(item.name) + '" placeholder="For example: BestShopio Help Center" required>' +
          '<label class="fld-label" for="spaceAudience">Audience</label>' +
          '<input class="input" id="spaceAudience" value="' + A().esc(item.audience) + '" placeholder="For example: BestShopio merchants" required>' +
          '<label class="fld-label" for="spaceChannel">Publishing channel</label>' +
          '<select class="input" id="spaceChannel"><option value="Public help center"' + (item.channel === 'Public help center' ? ' selected' : '') + '>Public help center</option><option value="In-app notice"' + (item.channel === 'In-app notice' ? ' selected' : '') + '>In-app notice</option></select>' +
          '<label class="fld-label" for="spaceUrl">Destination URL or surface</label>' +
          '<input class="input" id="spaceUrl" value="' + A().esc(item.url || '') + '" placeholder="For example: help.bestshopio.com">' +
          '<div class="ops-form-actions"><a class="btn btn-default" href="#/content/spaces">Cancel</a><button type="submit" class="btn btn-primary">Save content space</button></div>' +
        '</section>' +
        '<aside class="ops-editor-side">' +
          '<section class="ops-form-card">' +
            '<div class="ops-panel-title">Language and status</div>' +
            '<label class="fld-label">Supported locales</label>' +
            '<div class="content-locale-options">' + localeCheckbox('en-US', 'English (en-US)', configuredLocales.indexOf('en-US') >= 0) + localeCheckbox('zh-CN', '简体中文 (zh-CN)', configuredLocales.indexOf('zh-CN') >= 0) + '</div>' +
            '<label class="fld-label" for="spaceDefaultLocale">Default locale</label>' +
            '<select class="input" id="spaceDefaultLocale"><option value="en-US"' + (item.defaultLocale === 'en-US' ? ' selected' : '') + '>en-US</option><option value="zh-CN"' + (item.defaultLocale === 'zh-CN' ? ' selected' : '') + '>zh-CN</option></select>' +
            '<label class="fld-label" for="spaceStatus">Publishing state</label>' +
            '<select class="input" id="spaceStatus"><option value="Draft"' + (item.status === 'Draft' ? ' selected' : '') + '>Draft</option><option value="Live"' + (item.status === 'Live' ? ' selected' : '') + '>Live</option><option value="Archived"' + (item.status === 'Archived' ? ' selected' : '') + '>Archived</option></select>' +
            '<div class="ops-note">A non-live space cannot publish new articles. Archiving preserves content records but removes the destination from publish eligibility.</div>' +
          '</section>' +
          (isNew ? '' : '<section class="ops-form-card content-space-summary"><div class="ops-panel-title">Content summary</div><div class="content-space-summary-grid"><div><strong>' + collections.length + '</strong><span>Collections</span></div><div><strong>' + articles.length + '</strong><span>Articles</span></div><div><strong>' + liveArticles + '</strong><span>Published</span></div></div><div class="ops-note">The stable space ID remains unchanged when you update the name, languages or destination.</div></section>') +
        '</aside>' +
      '</form>';

    A().render(root, A().page(
      isNew ? 'New content space' : 'Edit content space',
      'Maintain the Help Center destination, audience, languages and publication state.',
      '',
      form,
      A().back('#/content/spaces', 'Content spaces')
    ), function (scope) {
      var formEl = scope.querySelector('#spaceForm');
      var channelField = scope.querySelector('#spaceChannel');
      var urlField = scope.querySelector('#spaceUrl');
      var defaultField = scope.querySelector('#spaceDefaultLocale');
      function selectedLocales() {
        return Array.prototype.slice.call(scope.querySelectorAll('input[name="spaceLocale"]:checked')).map(function (input) { return input.value; });
      }
      function syncDefaultLocale() {
        var selected = selectedLocales();
        Array.prototype.slice.call(defaultField.options).forEach(function (option) { option.disabled = selected.indexOf(option.value) < 0; });
        if (selected.indexOf(defaultField.value) < 0) defaultField.value = selected[0] || 'en-US';
      }
      function syncChannelHint() {
        urlField.placeholder = channelField.value === 'In-app notice' ? 'For example: BestShopio merchant admin notice center' : 'For example: help.bestshopio.com';
      }
      scope.querySelectorAll('input[name="spaceLocale"]').forEach(function (input) { input.onchange = syncDefaultLocale; });
      channelField.onchange = syncChannelHint;
      syncDefaultLocale();
      syncChannelHint();
      formEl.onsubmit = function (event) {
        event.preventDefault();
        var name = scope.querySelector('#spaceName').value.trim();
        var audience = scope.querySelector('#spaceAudience').value.trim();
        var locales = selectedLocales();
        var channel = channelField.value;
        var url = urlField.value.trim();
        if (!name || !audience) { A().toast('Enter a name and audience.'); return; }
        if (!locales.length) { A().toast('Select at least one supported locale.'); return; }
        if (!url) { A().toast('Enter a destination URL or surface.'); return; }
        var duplicate = S.spaces().filter(function (entry) { return entry.id !== item.id && entry.name.toLowerCase() === name.toLowerCase(); })[0];
        if (duplicate) { A().toast('A content space with this name already exists.'); return; }
        item.name = name;
        item.audience = audience;
        item.channel = channel;
        item.url = url;
        item.supportedLocales = locales;
        item.defaultLocale = defaultField.value;
        item.status = scope.querySelector('#spaceStatus').value;
        if (isNew) S.spaces().push(item);
        A().audit(isNew ? 'Created content space' : 'Updated content space', item.name, item.status);
        A().toast(isNew ? 'Content space created.' : 'Content space saved.');
        A().route('#/content/spaces');
      };
    });
  }

  window.SAAS_CONTENT_PAGES = window.SAAS_CONTENT_PAGES || {};
  window.SAAS_CONTENT_PAGES.spaceList = renderSpaceList;
  window.SAAS_CONTENT_PAGES.spaceEditor = renderSpaceEditor;
})();
