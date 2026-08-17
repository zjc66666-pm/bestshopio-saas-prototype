/* Help Center route manifest.
 *
 * Legacy compact URLs are retained for the clickable prototype. New routes use
 * explicit resource segments so the eventual Pages Router mapping is obvious:
 * /content/articles/:id, /content/collections/:id/edit, /content/spaces/:id/edit.
 */
(function () {
  'use strict';

  function clean(value) {
    var api = (window.SAAS_CONTENT_SHARED || {}).api;
    return api && api().cleanPart ? api().cleanPart(value) : String(value || '').trim();
  }

  function page(name) { return (window.SAAS_CONTENT_PAGES || {})[name]; }
  function withPage(name, root) { var render = page(name); if (render) render.apply(null, Array.prototype.slice.call(arguments, 1)); }

  var routeManifest = [
    {
      id: 'article-list',
      nextRoute: 'pages/content/index.tsx',
      targetModule: 'src/pages/saas-help-center',
      match: function (parts) { return !parts.length || parts.length === 1 && parts[0] === 'articles'; },
      render: function (root) { withPage('articleList', root); }
    },
    {
      id: 'article-new',
      nextRoute: 'pages/content/articles/new.tsx',
      targetModule: 'src/pages/saas-help-center-article-editor',
      match: function (parts) { return parts.length === 1 && parts[0] === 'new' || parts.length === 2 && parts[0] === 'articles' && parts[1] === 'new'; },
      render: function (root) { withPage('articleEditor', root, null, true); }
    },
    {
      id: 'article-edit',
      nextRoute: 'pages/content/articles/[articleId]/edit.tsx',
      targetModule: 'src/pages/saas-help-center-article-editor',
      match: function (parts) { return parts.length === 3 && parts[0] === 'articles' && parts[2] === 'edit'; },
      render: function (root, parts) {
        var article = (window.SAAS_CONTENT_SHARED || {}).findArticle(clean(parts[1]));
        if (article) withPage('articleEditor', root, article, false); else withPage('articleList', root);
      }
    },
    {
      id: 'article-detail',
      nextRoute: 'pages/content/articles/[articleId].tsx',
      targetModule: 'src/pages/saas-help-center-article-detail',
      match: function (parts) { return parts.length === 2 && parts[0] === 'articles' && !!parts[1]; },
      render: function (root, parts) {
        var article = (window.SAAS_CONTENT_SHARED || {}).findArticle(clean(parts[1]));
        if (article) withPage('articleDetail', root, article); else withPage('articleList', root);
      }
    },
    {
      id: 'collection-list',
      nextRoute: 'pages/content/collections/index.tsx',
      targetModule: 'src/pages/saas-help-center-collections',
      match: function (parts) { return parts.length === 1 && parts[0] === 'collections'; },
      render: function (root) { withPage('collectionList', root); }
    },
    {
      id: 'collection-new',
      nextRoute: 'pages/content/collections/new.tsx',
      targetModule: 'src/pages/saas-help-center-collection-editor',
      match: function (parts) { return parts.length === 2 && parts[0] === 'collections' && parts[1] === 'new'; },
      render: function (root) { withPage('collectionEditor', root, null, true); }
    },
    {
      id: 'collection-edit',
      nextRoute: 'pages/content/collections/[collectionId]/edit.tsx',
      targetModule: 'src/pages/saas-help-center-collection-editor',
      match: function (parts) { return parts.length === 3 && parts[0] === 'collections' && parts[2] === 'edit'; },
      render: function (root, parts) {
        var collection = (window.SAAS_CONTENT_SHARED || {}).findCollection(clean(parts[1]));
        if (collection) withPage('collectionEditor', root, collection, false); else withPage('collectionList', root);
      }
    },
    {
      id: 'collection-fallback',
      nextRoute: 'pages/content/collections/index.tsx',
      targetModule: 'src/pages/saas-help-center-collections',
      match: function (parts) { return parts[0] === 'collections'; },
      render: function (root) { withPage('collectionList', root); }
    },
    {
      id: 'space-list',
      nextRoute: 'pages/content/spaces/index.tsx',
      targetModule: 'src/pages/saas-help-center-spaces',
      match: function (parts) { return parts.length === 1 && parts[0] === 'spaces'; },
      render: function (root) { withPage('spaceList', root); }
    },
    {
      id: 'space-new',
      nextRoute: 'pages/content/spaces/new.tsx',
      targetModule: 'src/pages/saas-help-center-space-editor',
      match: function (parts) { return parts.length === 2 && parts[0] === 'spaces' && parts[1] === 'new'; },
      render: function (root) { withPage('spaceEditor', root, null, true); }
    },
    {
      id: 'space-edit',
      nextRoute: 'pages/content/spaces/[spaceId]/edit.tsx',
      targetModule: 'src/pages/saas-help-center-space-editor',
      match: function (parts) { return parts.length === 3 && parts[0] === 'spaces' && parts[2] === 'edit'; },
      render: function (root, parts) {
        var space = (window.SAAS_CONTENT_SHARED || {}).findSpace(clean(parts[1]));
        if (space) withPage('spaceEditor', root, space, false); else withPage('spaceList', root);
      }
    },
    {
      id: 'space-fallback',
      nextRoute: 'pages/content/spaces/index.tsx',
      targetModule: 'src/pages/saas-help-center-spaces',
      match: function (parts) { return parts[0] === 'spaces'; },
      render: function (root) { withPage('spaceList', root); }
    },
    {
      id: 'legacy-article-edit',
      match: function (parts) { return parts.length === 2 && !!parts[0] && parts[1] === 'edit'; },
      render: function (root, parts) {
        var article = (window.SAAS_CONTENT_SHARED || {}).findArticle(clean(parts[0]));
        if (article) withPage('articleEditor', root, article, false); else withPage('articleList', root);
      }
    },
    {
      id: 'legacy-article-detail',
      match: function (parts) { return parts.length === 1 && !!parts[0]; },
      render: function (root, parts) {
        var article = (window.SAAS_CONTENT_SHARED || {}).findArticle(clean(parts[0]));
        if (article) withPage('articleDetail', root, article); else withPage('articleList', root);
      }
    }
  ];

  function render(root, rawParts) {
    var parts = (rawParts || []).map(clean).filter(Boolean);
    var route = routeManifest.filter(function (entry) { return entry.match(parts); })[0];
    if (route) route.render(root, parts);
    else withPage('articleList', root);
  }

  window.SAAS_CONTENT = { render: render, routes: routeManifest };
})();
