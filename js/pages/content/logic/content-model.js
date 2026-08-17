/*
 * Help Center domain model.
 *
 * This is deliberately independent from the page renderers.  It keeps the
 * static prototype close to the eventual frontend contract:
 * ContentSpace(id) -> Collection(spaceId) -> Article(spaceId, collectionId).
 *
 * `space` and `collection` text fields in the initial mock data are accepted
 * only as a migration fallback.  Every new or saved record uses stable IDs.
 */
(function () {
  'use strict';

  function content() {
    var data = window.DATA || {};
    var center = data.platformCenter || (data.platformCenter = {});
    return center.content || (center.content = {});
  }

  function spaces() { return content().spaces || (content().spaces = []); }
  function collections() { return content().collections || (content().collections = []); }
  function articles() { return content().articles || (content().articles = []); }

  function findSpace(id) {
    return spaces().filter(function (item) { return item.id === id; })[0] || null;
  }

  function findSpaceByName(name) {
    return spaces().filter(function (item) { return item.name === name; })[0] || null;
  }

  function resolveSpace(value) {
    if (!value) return null;
    if (typeof value === 'object') {
      if (value.spaceId || value.space) return resolveSpace(value.spaceId || value.space);
      return value.id ? findSpace(value.id) || value : null;
    }
    return findSpace(value) || findSpaceByName(value);
  }

  function spaceId(value) {
    var space = resolveSpace(value);
    return space ? space.id : '';
  }

  function spaceName(value) {
    var space = resolveSpace(value);
    if (space) return space.name;
    if (value && typeof value === 'object') return value.space || '—';
    return value || '—';
  }

  function spaceForRecord(record) {
    return resolveSpace(record && (record.spaceId || record.space));
  }

  function recordSpaceId(record) {
    var space = spaceForRecord(record);
    return space ? space.id : '';
  }

  function findCollection(id) {
    return collections().filter(function (item) { return item.id === id; })[0] || null;
  }

  function findArticle(id) {
    return articles().filter(function (item) { return item.id === id; })[0] || null;
  }

  function normalizeLegacyReferences() {
    collections().forEach(function (collection) {
      var collectionSpace = spaceForRecord(collection);
      if (collectionSpace) collection.spaceId = collectionSpace.id;
    });
    articles().forEach(function (article) {
      var articleSpace = spaceForRecord(article);
      if (articleSpace) article.spaceId = articleSpace.id;
      var assigned = article.collectionId ? findCollection(article.collectionId) : null;
      if (!assigned && article.collection) {
        assigned = collections().filter(function (collection) {
          return collection.name === article.collection && recordSpaceId(collection) === article.spaceId;
        })[0] || null;
      }
      if (assigned) {
        article.collectionId = assigned.id;
        article.spaceId = recordSpaceId(assigned);
      }
    });
  }

  function collectionForArticle(article) {
    if (!article) return null;
    var direct = article.collectionId ? findCollection(article.collectionId) : null;
    if (direct && recordSpaceId(direct) === recordSpaceId(article)) return direct;
    // Compatibility only for pre-ID mock records. New data must never rely on names.
    return collections().filter(function (collection) {
      return article.collection && collection.name === article.collection && recordSpaceId(collection) === recordSpaceId(article);
    })[0] || null;
  }

  function collectionName(collection, locale) {
    if (!collection) return '—';
    var translation = collection.translations && collection.translations[locale || ''];
    return (translation && translation.name) || collection.name || '—';
  }

  function collectionDescription(collection, locale) {
    if (!collection) return '';
    var translation = collection.translations && collection.translations[locale || ''];
    return (translation && translation.description) || collection.description || '';
  }

  function articleCollectionName(article) {
    var collection = collectionForArticle(article);
    return collection ? collectionName(collection, article && article.locale) : (article && article.collection ? article.collection : '—');
  }

  function articlesInCollection(collection) {
    return articles().filter(function (article) {
      return article.collectionId === (collection || {}).id;
    });
  }

  function collectionDepth(collection) {
    var depth = 0;
    var parentId = collection && collection.parentId;
    var guard = 0;
    while (parentId && guard < 8) {
      var parent = findCollection(parentId);
      if (!parent) break;
      depth += 1;
      parentId = parent.parentId;
      guard += 1;
    }
    return depth;
  }

  function orderedCollections(spaceValue) {
    var targetSpaceId = spaceId(spaceValue);
    return collections().filter(function (collection) {
      return !targetSpaceId || recordSpaceId(collection) === targetSpaceId;
    }).slice().sort(function (a, b) {
      if (recordSpaceId(a) !== recordSpaceId(b)) return spaceName(a).localeCompare(spaceName(b));
      if (a.parentId !== b.parentId) return String(a.parentId || '').localeCompare(String(b.parentId || ''));
      if (+a.order !== +b.order) return (+b.order || 0) - (+a.order || 0);
      return collectionName(a).localeCompare(collectionName(b));
    });
  }

  function collectionTree(spaceValue) {
    var items = orderedCollections(spaceValue);
    var output = [];
    var used = {};
    function append(parentId) {
      items.filter(function (item) { return String(item.parentId || '') === String(parentId || ''); }).forEach(function (item) {
        if (used[item.id]) return;
        used[item.id] = true;
        output.push({ item: item, depth: collectionDepth(item) });
        append(item.id);
      });
    }
    append('');
    items.forEach(function (item) {
      if (used[item.id]) return;
      used[item.id] = true;
      output.push({ item: item, depth: collectionDepth(item) });
    });
    return output;
  }

  function nextCollectionOrder(spaceValue) {
    var maximum = 0;
    orderedCollections(spaceValue).forEach(function (item) { maximum = Math.max(maximum, +item.order || 0); });
    return maximum + 10;
  }

  function isCollectionDescendant(collection, ancestorId) {
    var parentId = collection && collection.parentId;
    var guard = 0;
    while (parentId && guard < 8) {
      if (parentId === ancestorId) return true;
      var parent = findCollection(parentId);
      if (!parent) return false;
      parentId = parent.parentId;
      guard += 1;
    }
    return false;
  }

  function parentCollectionOptions(spaceValue, selectedId, selfId, esc) {
    var escape = esc || function (value) { return String(value == null ? '' : value); };
    return '<option value="">No parent (top level)</option>' + orderedCollections(spaceValue).filter(function (collection) {
      return collection.id !== selfId && !isCollectionDescendant(collection, selfId);
    }).map(function (collection) {
      var indent = Array(collectionDepth(collection) + 1).join('— ');
      return '<option class="i18n-skip" value="' + escape(collection.id) + '"' + (collection.id === selectedId ? ' selected' : '') + '>' + escape(indent + collectionName(collection)) + '</option>';
    }).join('');
  }

  function defaultSpace() { return spaces()[0] || null; }
  function defaultSpaceId() { return (defaultSpace() || {}).id || ''; }
  function defaultSpaceName() { return (defaultSpace() || {}).name || 'BestCheckout Help Center'; }
  function audienceForSpace(value) { return (resolveSpace(value) || {}).audience || 'Merchants'; }
  function localeForSpace(value) { return (resolveSpace(value) || {}).defaultLocale || (resolveSpace(value) || {}).locale || 'en-US'; }
  function localesForSpace(value) {
    var space = resolveSpace(value) || {};
    var configured = (space.supportedLocales || []).slice();
    var defaultLocale = localeForSpace(space);
    if (configured.indexOf(defaultLocale) < 0) configured.unshift(defaultLocale);
    return configured.length ? configured : ['en-US'];
  }

  function syncArticleLocation(article, collection) {
    article.spaceId = recordSpaceId(collection);
    article.collectionId = collection.id;
    // Kept only so existing non-content mock consumers render safely. It is not
    // used for relationships in the new page modules.
    article.space = spaceName(collection);
    article.collection = collectionName(collection, article.locale);
  }

  function normalizeSlug(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function validateArticle(article, options) {
    var result = { ok: true, message: '', field: '' };
    var isPublishing = options && options.publishing;
    var title = String((article || {}).title || '').trim();
    var body = String((article || {}).body || '').trim();
    var slug = normalizeSlug((article || {}).slug || title);
    var space = spaceForRecord(article);
    var collection = collectionForArticle(article);
    if (!title) return { ok: false, field: 'title', message: 'Enter an article title.' };
    if (isPublishing && !body) return { ok: false, field: 'body', message: 'Write article content before publishing.' };
    if (!slug) return { ok: false, field: 'slug', message: 'Enter a valid URL slug.' };
    if (!space) return { ok: false, field: 'space', message: 'Select a content space.' };
    if (!collection || recordSpaceId(collection) !== space.id) return { ok: false, field: 'collection', message: 'Select a collection.' };
    if (isPublishing && space.status !== 'Live') return { ok: false, field: 'space', message: 'Only a live content space can publish articles.' };
    if (isPublishing && collection.status !== 'Visible') return { ok: false, field: 'collection', message: 'Publish the article in a visible collection.' };
    var duplicate = articles().filter(function (other) {
      return other.id !== article.id && recordSpaceId(other) === space.id && other.locale === article.locale && normalizeSlug(other.slug || other.title) === slug;
    })[0];
    if (duplicate) return { ok: false, field: 'slug', message: 'This URL slug already exists for the selected locale.' };
    return result;
  }

  normalizeLegacyReferences();

  window.SAAS_CONTENT_MODEL = {
    content: content,
    spaces: spaces,
    collections: collections,
    articles: articles,
    findSpace: findSpace,
    findSpaceByName: findSpaceByName,
    resolveSpace: resolveSpace,
    spaceId: spaceId,
    spaceName: spaceName,
    spaceForRecord: spaceForRecord,
    recordSpaceId: recordSpaceId,
    findCollection: findCollection,
    findArticle: findArticle,
    collectionForArticle: collectionForArticle,
    collectionName: collectionName,
    collectionDescription: collectionDescription,
    articleCollectionName: articleCollectionName,
    articlesInCollection: articlesInCollection,
    collectionDepth: collectionDepth,
    orderedCollections: orderedCollections,
    collectionTree: collectionTree,
    nextCollectionOrder: nextCollectionOrder,
    isCollectionDescendant: isCollectionDescendant,
    parentCollectionOptions: parentCollectionOptions,
    defaultSpace: defaultSpace,
    defaultSpaceId: defaultSpaceId,
    defaultSpaceName: defaultSpaceName,
    audienceForSpace: audienceForSpace,
    localeForSpace: localeForSpace,
    localesForSpace: localesForSpace,
    syncArticleLocation: syncArticleLocation,
    normalizeSlug: normalizeSlug,
    validateArticle: validateArticle,
    normalizeLegacyReferences: normalizeLegacyReferences
  };
})();
