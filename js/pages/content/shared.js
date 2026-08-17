/*
 * Help Center page bridge.
 *
 * View modules receive their domain model from content-model.js and use this
 * small bridge only for console UI primitives (modal, toast, audit, routing).
 * This is the static-prototype equivalent of injecting repository/UI helpers
 * into a frontend page rather than importing the whole operations console.
 */
(function () {
  'use strict';

  var M = window.SAAS_CONTENT_MODEL || {};
  var Markdown = window.SAAS_CONTENT_MARKDOWN || {};

  function api() { return (window.SAAS_OPS || {}).contentApi || {}; }
  function esc(value) { return api().esc ? api().esc(value) : String(value == null ? '' : value); }

  function contentTabs(active) {
    var articleCount = (M.articles ? M.articles() : []).length;
    var collectionCount = (M.collections ? M.collections() : []).length;
    var spaceCount = (M.spaces ? M.spaces() : []).length;
    function tab(id, label, count, href) {
      var selected = active === id;
      return '<a class="tab' + (selected ? ' active' : '') + '" href="' + href + '"' + (selected ? ' aria-current="page"' : '') + '><span>' + label + '</span><span class="count-badge">' + count + '</span></a>';
    }
    return '<nav class="tabs content-tabs" aria-label="Help Center sections">' +
      tab('articles', 'Articles', articleCount, '#/content') +
      tab('collections', 'Collections', collectionCount, '#/content/collections') +
      tab('spaces', 'Content spaces', spaceCount, '#/content/spaces') +
    '</nav>';
  }

  function collectionName(value, locale) {
    if (value && Object.prototype.hasOwnProperty.call(value, 'collectionId')) return M.articleCollectionName(value);
    return M.collectionName(value, locale);
  }

  function parentCollectionOptions(spaceValue, selectedId, selfId) {
    return M.parentCollectionOptions(spaceValue, selectedId, selfId, esc);
  }

  function createCollectionQuickly(spaceValue, onCreated) {
    var A = api();
    var space = M.resolveSpace(spaceValue) || M.defaultSpace();
    if (!A.modalFields || !space) return;
    A.modalFields('New collection', [
      { label: 'Collection name', html: '<input class="input" id="quickCollectionName" placeholder="Enter collection name" autofocus>' },
      { label: 'Purpose (optional)', html: '<input class="input" id="quickCollectionPurpose" placeholder="What will merchants find here?">' },
      { label: 'Visibility', html: '<select class="input" id="quickCollectionVisibility"><option value="Visible">Visible</option><option value="Hidden">Hidden</option></select>' }
    ], 'Create collection', function (layer) {
      var nameField = layer.querySelector('#quickCollectionName');
      var name = nameField.value.trim();
      if (!name) { if (A.toast) A.toast('Enter a collection name.'); nameField.focus(); return; }
      var duplicate = M.collections().filter(function (item) {
        return M.recordSpaceId(item) === space.id && M.collectionName(item).toLowerCase() === name.toLowerCase();
      })[0];
      if (duplicate) { if (A.toast) A.toast('A collection with this name already exists in this content space.'); nameField.focus(); return; }
      var item = {
        id: 'collection_' + Date.now(),
        spaceId: space.id,
        name: name,
        parentId: '',
        order: M.nextCollectionOrder(space.id),
        status: layer.querySelector('#quickCollectionVisibility').value,
        description: layer.querySelector('#quickCollectionPurpose').value.trim()
      };
      M.collections().push(item);
      if (A.audit) A.audit('Created Help Center collection', item.name, item.status);
      layer.remove();
      if (A.toast) A.toast('Collection created.');
      if (onCreated) onCreated(item);
    });
  }

  window.SAAS_CONTENT_SHARED = {
    api: api,
    model: M,
    content: M.content,
    spaces: M.spaces,
    collections: M.collections,
    articles: M.articles,
    findSpace: M.findSpace,
    spaceForName: M.findSpaceByName,
    spaceName: M.spaceName,
    spaceId: M.spaceId,
    recordSpaceId: M.recordSpaceId,
    defaultSpace: M.defaultSpace,
    defaultSpaceId: M.defaultSpaceId,
    defaultSpaceName: M.defaultSpaceName,
    audienceForSpace: M.audienceForSpace,
    localeForSpace: M.localeForSpace,
    localesForSpace: M.localesForSpace,
    findArticle: M.findArticle,
    findCollection: M.findCollection,
    collectionForArticle: M.collectionForArticle,
    collectionName: collectionName,
    collectionDescription: M.collectionDescription,
    articlesInCollection: M.articlesInCollection,
    collectionDepth: M.collectionDepth,
    orderedCollections: M.orderedCollections,
    collectionTree: M.collectionTree,
    nextCollectionOrder: M.nextCollectionOrder,
    parentCollectionOptions: parentCollectionOptions,
    syncArticleLocation: M.syncArticleLocation,
    validateArticle: M.validateArticle,
    contentTabs: contentTabs,
    articleText: Markdown.articleText,
    outlineFromText: Markdown.outlineFromText,
    renderArticleMarkup: Markdown.renderArticleMarkup,
    outlineMarkup: Markdown.outlineMarkup,
    bindOutlineLinks: Markdown.bindOutlineLinks,
    slugFromTitle: M.normalizeSlug,
    createCollectionQuickly: createCollectionQuickly
  };
})();
