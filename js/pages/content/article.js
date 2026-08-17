/* Help Center article detail and article editor pages. */
(function () {
  'use strict';

  var S = window.SAAS_CONTENT_SHARED;
  var A = S.api;

  function renderArticleDetail(root, article) {
    var collection = S.collectionForArticle(article);
    var outline = S.outlineFromText(S.articleText(article));
    var collectionFact = collection ? '<a class="ops-link i18n-skip" href="#/content/collections/' + A().esc(collection.id) + '/edit">' + A().esc(S.collectionName(collection, article.locale)) + '</a>' : '<span class="i18n-skip">' + A().esc(S.collectionName(article)) + '</span>';
    var body =
      '<section class="content-workspace" data-page="help-center-article-detail">' +
        '<div class="ops-info-grid content-article-facts">' +
          A().fact('Publishing state', A().status(article.status)) +
          A().fact('Content space', '<span class="i18n-skip">' + A().esc(S.spaceName(article)) + '</span>') +
          A().fact('Collection', collectionFact) +
          A().fact('Audience', A().esc(article.audience)) +
          A().fact('Locale', A().esc(article.locale)) +
          A().fact('Last updated', A().esc(article.updatedAt)) +
        '</div>' +
        '<div class="ops-article-layout">' +
          '<article class="ops-panel ops-article">' +
            '<header class="ops-panel-head"><div><div class="ops-panel-title">Article content</div><div class="ops-panel-sub">/' + A().esc(article.slug) + '</div></div><a class="ops-link" href="#/content/articles/' + A().esc(article.id) + '/edit">Edit</a></header>' +
            '<div class="ops-panel-body"><div class="ops-article-body i18n-skip">' + S.renderArticleMarkup(S.articleText(article)) + '</div></div>' +
          '</article>' +
          '<aside class="ops-outline-card"><div class="ops-panel-title">On this page</div><div class="ops-panel-sub">Generated from article headings</div>' + S.outlineMarkup(outline, true) + '</aside>' +
        '</div>' +
        '<aside class="ops-note">The published article uses the matching Help Center layout and locale. “On this page” is generated from H2 and H3 headings, so it cannot drift from the article body.</aside>' +
      '</section>';
    var actions = '<a class="btn btn-default" href="#/content/articles/' + A().esc(article.id) + '/edit">Edit article</a>' + (article.status !== 'Published' ? '<button type="button" class="btn btn-primary" id="publishArticle">Publish</button>' : '');

    A().render(root, A().page(article.title, 'Help Center article details and publishing controls.', actions, body, A().back('#/content', 'Help Center')), function (scope) {
      S.bindOutlineLinks(scope);
      var publish = scope.querySelector('#publishArticle');
      if (!publish) return;
      publish.onclick = function () {
        var validation = S.validateArticle(article, { publishing: true });
        if (!validation.ok) { A().toast(validation.message); return; }
        A().confirmDialog('Publish article', 'Publishing makes this article available to the selected Help Center audience. The action is recorded in the platform audit trail.', 'Publish', function () {
          article.status = 'Published';
          article.updatedAt = 'Jul 31, 2026';
          A().audit('Published help article', article.title, 'Published');
          A().toast('Article published.');
          renderArticleDetail(root, article);
        });
      };
    });
  }

  function collectionPickerMarkup(collectionId) {
    var collection = S.findCollection(collectionId);
    return '<div class="content-collection-picker" id="articleCollectionPicker">' +
      '<input type="hidden" id="articleCollection" value="' + A().esc(collection ? collection.id : '') + '">' +
      '<button type="button" class="content-collection-trigger" id="articleCollectionTrigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="articleCollectionMenu"><span id="articleCollectionValue">' + (collection ? '<span class="i18n-skip">' + A().esc(S.collectionName(collection)) + '</span>' : 'Select a collection') + '</span><span class="content-picker-caret" aria-hidden="true">⌄</span></button>' +
      '<div class="content-collection-menu" id="articleCollectionMenu" hidden>' +
        '<div class="content-picker-search"><label class="sr-only" for="articleCollectionSearch">Search collections</label><input class="input" id="articleCollectionSearch" autocomplete="off" placeholder="Search collections"></div>' +
        '<div class="content-picker-options" id="articleCollectionOptions" role="listbox" aria-label="Collections"></div>' +
        '<div class="content-picker-divider"></div>' +
        '<button type="button" class="content-picker-create" id="quickCreateCollection">+ New collection</button>' +
      '</div>' +
    '</div>';
  }

  function bindCollectionPicker(scope, spaceField) {
    var picker = scope.querySelector('#articleCollectionPicker');
    var hiddenField = scope.querySelector('#articleCollection');
    var trigger = scope.querySelector('#articleCollectionTrigger');
    var label = scope.querySelector('#articleCollectionValue');
    var menu = scope.querySelector('#articleCollectionMenu');
    var search = scope.querySelector('#articleCollectionSearch');
    var options = scope.querySelector('#articleCollectionOptions');
    var outsideHandler;

    function currentCollection() { return S.findCollection(hiddenField.value); }
    function setOpen(open) {
      menu.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      picker.classList.toggle('is-open', open);
      if (open) {
        renderOptions();
        search.focus();
        outsideHandler = function (event) { if (!picker.contains(event.target)) setOpen(false); };
        document.addEventListener('mousedown', outsideHandler);
      } else if (outsideHandler) {
        document.removeEventListener('mousedown', outsideHandler);
        outsideHandler = null;
      }
    }
    function setSelected(id) {
      var collection = id ? S.findCollection(id) : null;
      hiddenField.value = collection && S.recordSpaceId(collection) === spaceField.value ? collection.id : '';
      label.innerHTML = collection && S.recordSpaceId(collection) === spaceField.value ? '<span class="i18n-skip">' + A().esc(S.collectionName(collection)) + '</span>' : 'Select a collection';
      A().apply(label);
      renderOptions();
    }
    function renderOptions() {
      var query = (search.value || '').trim().toLowerCase();
      var list = S.orderedCollections(spaceField.value).filter(function (collection) {
        return !query || collection.name.toLowerCase().indexOf(query) >= 0;
      });
      if (!list.length) {
        options.innerHTML = '<div class="content-picker-empty">No matching collections</div>';
      } else {
        options.innerHTML = list.map(function (collection) {
          var selected = hiddenField.value === collection.id;
          return '<button type="button" class="content-picker-option' + (selected ? ' selected' : '') + '" role="option" aria-selected="' + String(selected) + '" data-collection-option="' + A().esc(collection.id) + '"><span class="i18n-skip">' + A().esc(S.collectionName(collection)) + '</span><small>' + A().esc(S.collectionDescription(collection) || S.spaceName(collection)) + '</small></button>';
        }).join('');
      }
      A().apply(options);
      options.querySelectorAll('[data-collection-option]').forEach(function (button) {
        button.onclick = function () {
          setSelected(button.getAttribute('data-collection-option'));
          setOpen(false);
        };
      });
    }

    trigger.onclick = function () { setOpen(menu.hidden); };
    search.oninput = renderOptions;
    scope.querySelector('#quickCreateCollection').onclick = function () {
      setOpen(false);
      S.createCollectionQuickly(spaceField.value, function (collection) {
        search.value = '';
        setSelected(collection.id);
      });
    };
    return {
      value: function () { return hiddenField.value; },
      resetForSpace: function () { search.value = ''; setSelected(''); }
    };
  }

  function newArticle() {
    var spaceId = S.defaultSpaceId();
    var collection = S.orderedCollections(spaceId)[0];
    return {
      id: 'help_' + Date.now(),
      translationKey: 'article_' + Date.now(),
      spaceId: spaceId,
      collectionId: collection ? collection.id : '',
      title: '',
      slug: '',
      audience: S.audienceForSpace(spaceId),
      locale: S.localeForSpace(spaceId),
      status: 'Draft',
      updatedAt: 'Jul 31, 2026',
      owner: 'Ops / Content',
      body: ''
    };
  }

  function localeOptions(spaceId, selected) {
    return S.localesForSpace(spaceId).map(function (locale) {
      return '<option value="' + A().esc(locale) + '"' + (locale === selected ? ' selected' : '') + '>' + A().esc(locale) + '</option>';
    }).join('');
  }

  function renderArticleEditor(root, article, isNew) {
    var item = article || newArticle();
    var selectedCollection = S.collectionForArticle(item);
    var selectedId = selectedCollection ? selectedCollection.id : item.collectionId;
    var form =
      '<form class="ops-editor content-editor" id="articleForm" data-page="help-center-article-editor">' +
        '<section class="ops-form-card content-editor-main">' +
          '<div class="ops-panel-title">Article</div>' +
          '<p class="content-form-intro">Write published help content only. Internal operational steps, credentials and raw service payloads do not belong in an article.</p>' +
          '<label class="fld-label" for="articleTitle">Title</label>' +
          '<input class="input" id="articleTitle" value="' + A().esc(item.title) + '" placeholder="Enter article title" required>' +
          '<label class="fld-label" for="articleSlug">URL slug</label>' +
          '<input class="input" id="articleSlug" value="' + A().esc(item.slug) + '" placeholder="article-slug">' +
          '<label class="fld-label" for="articleBody">Article content</label>' +
          '<div class="ops-field-hint">Use ## for a main section and ### for a nested section. The Help Center outline is generated from these headings.</div>' +
          '<textarea id="articleBody" placeholder="## Before you start&#10;&#10;Write the merchant-facing article">' + A().esc(S.articleText(item)) + '</textarea>' +
          '<div class="ops-form-actions"><a class="btn btn-default" href="#/content' + (isNew ? '' : '/articles/' + A().esc(item.id)) + '">Cancel</a><button type="button" class="btn btn-default" id="saveDraft">Save draft</button><button type="button" class="btn btn-primary" id="savePublish">Save and publish</button></div>' +
        '</section>' +
        '<aside class="ops-editor-side">' +
          '<section class="ops-form-card ops-outline-card"><div class="ops-panel-title">On this page</div><div class="ops-panel-sub">Generated from article headings</div><div id="articleOutline">' + S.outlineMarkup(S.outlineFromText(S.articleText(item)), false) + '</div></section>' +
          '<section class="ops-form-card">' +
            '<div class="ops-panel-title">Publishing settings</div>' +
            '<label class="fld-label" for="articleSpace">Content space</label>' +
            '<select class="input" id="articleSpace">' + S.spaces().map(function (space) {
              return '<option class="i18n-skip" value="' + A().esc(space.id) + '"' + (space.id === S.recordSpaceId(item) ? ' selected' : '') + '>' + A().esc(space.name) + '</option>';
            }).join('') + '</select>' +
            '<label class="fld-label" for="articleCollectionTrigger">Collection</label>' +
            collectionPickerMarkup(selectedId) +
            '<label class="fld-label" for="articleAudience">Audience</label>' +
            '<input class="input" id="articleAudience" value="' + A().esc(item.audience) + '">' +
            '<label class="fld-label" for="articleLocale">Locale</label>' +
            '<select class="input" id="articleLocale">' + localeOptions(S.recordSpaceId(item), item.locale) + '</select>' +
            '<div class="ops-note">Save as draft for review, or publish when the content and destination are ready.</div>' +
          '</section>' +
        '</aside>' +
      '</form>';

    A().render(root, A().page(
      isNew ? 'New article' : 'Edit article',
      'Write merchant-facing Help Center content. Internal operational instructions do not belong in the published article.',
      '',
      form,
      A().back(isNew ? '#/content' : '#/content/articles/' + item.id, 'Help Center')
    ), function (scope) {
      var formEl = scope.querySelector('#articleForm');
      var bodyField = scope.querySelector('#articleBody');
      var spaceField = scope.querySelector('#articleSpace');
      var audienceField = scope.querySelector('#articleAudience');
      var localeField = scope.querySelector('#articleLocale');
      var previousSpace = spaceField.value;
      var picker = bindCollectionPicker(scope, spaceField);

      function updateOutline() {
        var outline = scope.querySelector('#articleOutline');
        outline.innerHTML = S.outlineMarkup(S.outlineFromText(bodyField.value), false);
        A().apply(outline);
      }
      function save(publish) {
        var title = scope.querySelector('#articleTitle').value.trim();
        var collection = S.findCollection(picker.value());
        if (!title) { A().toast('Enter an article title.'); return; }
        if (!collection || S.recordSpaceId(collection) !== spaceField.value) { A().toast('Select a collection.'); return; }
        var draft = {};
        Object.keys(item).forEach(function (key) { draft[key] = item[key]; });
        draft.title = title;
        draft.slug = scope.querySelector('#articleSlug').value.trim() || S.slugFromTitle(title);
        draft.body = bodyField.value.trim();
        draft.spaceId = spaceField.value;
        draft.collectionId = collection.id;
        draft.audience = audienceField.value.trim() || S.audienceForSpace(draft.spaceId);
        draft.locale = localeField.value;
        draft.status = publish ? 'Published' : 'Draft';
        draft.updatedAt = 'Jul 31, 2026';
        draft.translationKey = draft.translationKey || draft.id;
        S.syncArticleLocation(draft, collection);
        var validation = S.validateArticle(draft, { publishing: publish });
        if (!validation.ok) { A().toast(validation.message); return; }
        Object.keys(draft).forEach(function (key) { item[key] = draft[key]; });
        if (isNew) S.articles().unshift(item);
        A().audit(publish ? 'Published help article' : 'Saved help article draft', item.title, item.status);
        A().toast(publish ? 'Article published.' : 'Draft saved.');
        A().route('#/content/articles/' + item.id);
      }

      formEl.onsubmit = function (event) { event.preventDefault(); save(false); };
      bodyField.oninput = updateOutline;
      spaceField.onchange = function () {
        var existingDefault = S.audienceForSpace(previousSpace);
        if (isNew && (!audienceField.value.trim() || audienceField.value === existingDefault)) audienceField.value = S.audienceForSpace(spaceField.value);
        var selectedLocale = S.localeForSpace(spaceField.value);
        localeField.innerHTML = localeOptions(spaceField.value, selectedLocale);
        if (isNew) localeField.value = selectedLocale;
        A().apply(localeField);
        previousSpace = spaceField.value;
        picker.resetForSpace();
      };
      scope.querySelector('#saveDraft').onclick = function () { save(false); };
      scope.querySelector('#savePublish').onclick = function () { save(true); };
    });
  }

  window.SAAS_CONTENT_PAGES = window.SAAS_CONTENT_PAGES || {};
  window.SAAS_CONTENT_PAGES.articleDetail = renderArticleDetail;
  window.SAAS_CONTENT_PAGES.articleEditor = renderArticleEditor;
})();
