/* Help Center article list page. */
(function () {
  'use strict';

  var S = window.SAAS_CONTENT_SHARED;
  var A = S.api;

  function rowMarkup(list) {
    if (!list.length) return A().listEmpty('Try another title, content space, collection or publishing state.');
    return list.map(function (article) {
      return '<tr>' +
        '<td class="content-article-cell">' +
          '<a class="ops-row-link" href="#/content/articles/' + A().esc(article.id) + '"><strong class="i18n-skip">' + A().esc(article.title) + '</strong><span><span class="i18n-skip">' + A().esc(S.collectionName(article)) + '</span> · <span class="i18n-skip">' + A().esc(article.locale) + '</span></span></a>' +
        '</td>' +
        '<td class="content-space-cell hide-md"><span class="ops-meta i18n-skip">' + A().esc(S.spaceName(article)) + '</span></td>' +
        '<td>' + A().status(article.status) + '</td>' +
        '<td class="hide-sm"><span class="ops-meta">' + A().esc(article.updatedAt) + '<br><span class="i18n-skip">' + A().esc(article.owner) + '</span></span></td>' +
        '<td class="content-row-action"><a class="ops-link" href="#/content/articles/' + A().esc(article.id) + '">View article</a></td>' +
      '</tr>';
    }).join('');
  }

  function collectionOptions(space, selectedId) {
    return '<option value="">All collections</option>' + S.orderedCollections(space).map(function (collection) {
      return '<option class="i18n-skip" value="' + A().esc(collection.id) + '"' + (collection.id === selectedId ? ' selected' : '') + '>' + A().esc(collection.name) + '</option>';
    }).join('');
  }

  function renderArticleList(root) {
    var content = S.content(), articles = content.articles || [];
    var body =
      '<section class="content-workspace" data-page="help-center-articles">' +
        S.contentTabs('articles') +
        '<section class="content-table-card" aria-label="Help Center articles">' +
          '<form class="content-filter-bar" id="articleFilters" role="search">' +
            '<label class="sr-only" for="articleSearch">Search article title</label>' +
            '<span class="ops-search content-search-field">' + A().icon('search', 16) + '<input id="articleSearch" autocomplete="off" placeholder="Search article title"></span>' +
            '<label class="sr-only" for="articleSpace">Content space</label>' +
            '<select class="ops-select" id="articleSpace" aria-label="Content space"><option value="">All content spaces</option>' + S.spaces().map(function (space) {
              return '<option class="i18n-skip" value="' + A().esc(space.id) + '">' + A().esc(space.name) + '</option>';
            }).join('') + '</select>' +
            '<label class="sr-only" for="articleCollectionFilter">Collection</label>' +
            '<select class="ops-select" id="articleCollectionFilter" aria-label="Collection">' + collectionOptions('', '') + '</select>' +
            '<label class="sr-only" for="articleStatus">Publishing state</label>' +
            '<select class="ops-select content-status-filter" id="articleStatus" aria-label="Publishing state"><option value="">All states</option><option value="Published">Published</option><option value="In review">In review</option><option value="Draft">Draft</option></select>' +
          '</form>' +
          '<div class="content-table-wrap"><table class="ops-table content-article-table"><thead><tr><th scope="col">Article</th><th scope="col" class="hide-md">Content space</th><th scope="col">Status</th><th scope="col" class="hide-sm">Updated</th><th scope="col"><span class="sr-only">Action</span></th></tr></thead><tbody id="articleRows"></tbody></table></div>' +
          '<footer class="content-table-foot"><span id="articleResultCount"></span><span class="content-table-foot-note">Published articles are shown in the matching Help Center.</span></footer>' +
        '</section>' +
      '</section>';

    A().render(root, A().page(
      'Help Center',
      'Manage public help content for BestCheckout and BestShopio. Each article belongs to one content space and one collection.',
      '<a class="btn btn-default" href="#/content/collections">Manage collections</a><a class="btn btn-primary" href="#/content/articles/new">New article</a>',
      body
    ), function (scope) {
      var searchField = scope.querySelector('#articleSearch');
      var spaceField = scope.querySelector('#articleSpace');
      var collectionField = scope.querySelector('#articleCollectionFilter');
      var statusField = scope.querySelector('#articleStatus');
      var rows = scope.querySelector('#articleRows');
      var count = scope.querySelector('#articleResultCount');

      function syncCollections() {
        var chosen = collectionField.value;
        collectionField.innerHTML = collectionOptions(spaceField.value, chosen);
        var chosenCollection = chosen ? S.findCollection(chosen) : null;
        if (chosen && (!chosenCollection || (spaceField.value && S.recordSpaceId(chosenCollection) !== spaceField.value))) collectionField.value = '';
        A().apply(collectionField);
      }
      function draw() {
        var query = (searchField.value || '').toLowerCase();
        var space = spaceField.value;
        var state = statusField.value;
        var collectionId = collectionField.value;
        var list = articles.filter(function (item) {
          var collection = S.collectionForArticle(item);
          return (!query || (item.title + ' ' + S.collectionName(item)).toLowerCase().indexOf(query) >= 0) &&
            (!space || S.recordSpaceId(item) === space) &&
            (!collectionId || (collection && collection.id === collectionId)) &&
            (!state || item.status === state);
        });
        rows.innerHTML = rowMarkup(list);
        count.textContent = list.length + ' articles';
        A().apply(rows);
        A().apply(count);
      }

      scope.querySelector('#articleFilters').onsubmit = function (event) { event.preventDefault(); draw(); };
      searchField.oninput = draw;
      spaceField.onchange = function () { syncCollections(); draw(); };
      collectionField.onchange = draw;
      statusField.onchange = draw;
      syncCollections();
      draw();
    });
  }

  window.SAAS_CONTENT_PAGES = window.SAAS_CONTENT_PAGES || {};
  window.SAAS_CONTENT_PAGES.articleList = renderArticleList;
})();
